using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Application.Inventory;
using RestaurantSystem.Application.Operations;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Operations;
using RestaurantSystem.Domain.Inventory;
using RestaurantSystem.Domain.Orders;
using RestaurantSystem.Domain.Suppliers;
using RestaurantSystem.Domain.Identity;
using RestaurantSystem.Domain.Expenses;
using RestaurantSystem.Domain.Customers;
using RestaurantSystem.Application.Expenses;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Inventory;
using RestaurantSystem.Infrastructure.Operations;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class OperationsConcurrencyPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Production_generates_a_unique_traceability_batch_code_and_completed_status()
    {
            var (options, actor, unit) = await NewDatabaseAsync("production_traceability");
            var (_, preparation) = await SeedProductionAsync(options, actor, unit, 10m, 2m);
            await using var db = new ApplicationDbContext(options);

            var result = await Service(db).ProduceAsync(new(preparation, 1m, null), actor);

            Assert.Null(result.Error);
            var production = await db.Productions.SingleAsync();
            Assert.Equal($"PRD-{production.Id:N}", production.BatchCode);
            Assert.Equal(ProductionStatus.COMPLETED, production.Status);
            db.Productions.Add(new Production { BatchCode = production.BatchCode, Status = ProductionStatus.COMPLETED, ProductId = preparation, QuantityProduced = 1m, ProducedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor });
            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }

        [Fact]
        public async Task Production_traceability_migration_backfills_legacy_rows_deterministically()
        {
            var connectionString = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "production_traceability_upgrade_" + Guid.NewGuid().ToString("N") }.ConnectionString;
            await postgres.MigrateToAsync(connectionString, "20260830190630_AddOrderStockShortageAcknowledgement");
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options;
            var productionId = Guid.NewGuid();
            await using (var legacy = new ApplicationDbContext(options))
            {
                var unit = await legacy.Units.FirstAsync();
                var product = new Product { Name = "legacy-preparation", ProductType = ProductType.PREPARATION, InventoryUnitId = unit.Id, IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow, CreatedByUserId = "legacy", UpdatedByUserId = "legacy" };
                legacy.Products.Add(product);
                await legacy.SaveChangesAsync();
                await legacy.Database.ExecuteSqlInterpolatedAsync($"""INSERT INTO public.productions ("Id", "ProductId", "QuantityProduced", "ProducedAt", "CreatedByUserId") VALUES ({productionId}, {product.Id}, {1m}, {DateTimeOffset.UtcNow}, {"legacy"});""");
            }

            await postgres.MigrateAsync(connectionString);

            await using var upgraded = new ApplicationDbContext(options);
            var production = await upgraded.Productions.SingleAsync(x => x.Id == productionId);
            Assert.Equal($"PRD-{productionId:N}", production.BatchCode);
            Assert.Equal(ProductionStatus.COMPLETED, production.Status);
        }

        [Fact]
        public async Task Customer_sale_migration_keeps_legacy_sales_without_fabricated_customer_values()
        {
            var connectionString = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "customer_sale_upgrade_" + Guid.NewGuid().ToString("N") }.ConnectionString;
            await postgres.MigrateToAsync(connectionString, "20260831111424_AddProductionTraceability");
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options;
            var sessionId = Guid.NewGuid(); var shiftId = Guid.NewGuid(); var saleId = Guid.NewGuid(); var now = DateTimeOffset.UtcNow;
            await using (var legacy = new ApplicationDbContext(options))
            {
                await legacy.Database.ExecuteSqlInterpolatedAsync($"""INSERT INTO public.cash_sessions ("Id", "BusinessDate", "IsOpen", "OpenedAt", "OpenedByUserId") VALUES ({sessionId}, {DateOnly.FromDateTime(now.UtcDateTime)}, {true}, {now}, {"legacy"});""");
                await legacy.Database.ExecuteSqlInterpolatedAsync($"""INSERT INTO public.shifts ("Id", "CashSessionId", "Type", "Status") VALUES ({shiftId}, {sessionId}, {"MORNING"}, {"COMPLETED"});""");
                await legacy.Database.ExecuteSqlInterpolatedAsync($"""INSERT INTO public.sales ("Id", "OrderId", "ShiftId", "SalesChannel", "PaymentMethod", "Subtotal", "Total", "ConfirmedAt", "ConfirmedByUserId") VALUES ({saleId}, {Guid.NewGuid()}, {shiftId}, {"DIRECT"}, {"CASH"}, {1m}, {1m}, {now}, {"legacy"});""");
            }

            await postgres.MigrateAsync(connectionString);
            await using var upgraded = new ApplicationDbContext(options);
            var sale = await upgraded.Sales.SingleAsync(x => x.Id == saleId);
            Assert.Null(sale.CustomerId); Assert.Null(sale.CustomerNameSnapshot); Assert.Null(sale.CustomerCiSnapshot); Assert.Null(sale.CustomerNitSnapshot);
        }

        [Fact]
        public async Task Customer_identity_constraints_preserve_inactive_uniqueness_null_nits_and_nullable_sale_history()
        {
            var (options, actor, _) = await NewDatabaseAsync("customer_sale_foundation");
            await using (var db = new ApplicationDbContext(options))
            {
                db.Customers.Add(new Customer { Name = "Inactive customer", Ci = "CI-001", Nit = "NIT-001", Notes = "retained", IsActive = false, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor, UpdatedByUserId = actor });
                await db.SaveChangesAsync();
            }

            await using (var duplicateCi = new ApplicationDbContext(options))
            {
                duplicateCi.Customers.Add(new Customer { Name = "Duplicate CI", Ci = "CI-001", IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor, UpdatedByUserId = actor });
                await Assert.ThrowsAsync<DbUpdateException>(() => duplicateCi.SaveChangesAsync());
            }

            await using (var duplicateNit = new ApplicationDbContext(options))
            {
                duplicateNit.Customers.Add(new Customer { Name = "Duplicate NIT", Ci = "CI-002", Nit = "NIT-001", IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor, UpdatedByUserId = actor });
                await Assert.ThrowsAsync<DbUpdateException>(() => duplicateNit.SaveChangesAsync());
            }

            var shiftId = await OpenShiftAsync(options, actor);
            await using var verify = new ApplicationDbContext(options);
            verify.Customers.AddRange(
                new Customer { Name = "Null NIT one", Ci = "CI-003", Nit = null, IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor, UpdatedByUserId = actor },
                new Customer { Name = "Null NIT two", Ci = "CI-004", Nit = null, IsActive = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor, UpdatedByUserId = actor });
            verify.Sales.Add(new Sale { OrderId = Guid.NewGuid(), ShiftId = shiftId, SalesChannel = SalesChannel.DIRECT, PaymentMethod = PaymentMethod.CASH, Subtotal = 1m, Total = 1m, ConfirmedAt = DateTimeOffset.UtcNow, ConfirmedByUserId = actor });
            await verify.SaveChangesAsync();

            var historicSale = await verify.Sales.SingleAsync(x => x.OrderId != Guid.Empty);
            Assert.Null(historicSale.CustomerId); Assert.Null(historicSale.CustomerNameSnapshot); Assert.Null(historicSale.CustomerCiSnapshot); Assert.Null(historicSale.CustomerNitSnapshot);
            Assert.Equal(2, await verify.Customers.CountAsync(x => x.Nit == null));
        }

        [Fact]
        public async Task Attendance_schedule_foundation_backfills_defaults_and_keeps_assignment_snapshots_stable()
        {
            var connectionString = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "attendance_schedule_upgrade_" + Guid.NewGuid().ToString("N") }.ConnectionString;
            await postgres.MigrateToAsync(connectionString, "20260831112258_AddCustomerSaleSnapshots");
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options;
            var actor = "legacy-attendance"; var employeeId = Guid.NewGuid(); var assignmentId = Guid.NewGuid(); var sessionId = Guid.NewGuid(); var shiftId = Guid.NewGuid(); var now = DateTimeOffset.UtcNow;
            await using (var legacy = new ApplicationDbContext(options))
            {
                legacy.Users.Add(new IdentityUser { Id = actor, UserName = actor, NormalizedUserName = actor.ToUpperInvariant() }); await legacy.SaveChangesAsync();
                await legacy.Database.ExecuteSqlInterpolatedAsync($"""INSERT INTO public."Employees" ("Id", "UserId", "FullName", "IsActive") VALUES ({employeeId}, {actor}, {"Legacy employee"}, {true});""");
                await legacy.Database.ExecuteSqlInterpolatedAsync($"""INSERT INTO public.cash_sessions ("Id", "BusinessDate", "IsOpen", "OpenedAt", "OpenedByUserId") VALUES ({sessionId}, {DateOnly.FromDateTime(now.UtcDateTime)}, {true}, {now}, {actor});""");
                await legacy.Database.ExecuteSqlInterpolatedAsync($"""INSERT INTO public.shifts ("Id", "CashSessionId", "Type", "Status") VALUES ({shiftId}, {sessionId}, {"MORNING"}, {"COMPLETED"});""");
                await legacy.Database.ExecuteSqlInterpolatedAsync($"""INSERT INTO public.shift_assignments ("Id", "ShiftId", "EmployeeId", "AssignedAt", "AssignedByUserId") VALUES ({assignmentId}, {shiftId}, {employeeId}, {now}, {actor});""");
            }

            await postgres.MigrateAsync(connectionString);
            await using var upgraded = new ApplicationDbContext(options);
            var employee = await upgraded.Employees.SingleAsync(x => x.Id == employeeId); var assignment = await upgraded.ShiftAssignments.SingleAsync(x => x.Id == assignmentId);
            Assert.Equal(20.00m, employee.HourlyRate); Assert.Equal(new TimeOnly(8, 0), assignment.EffectivePlannedStart); Assert.Equal(new TimeOnly(12, 0), assignment.EffectivePlannedEnd); Assert.Equal(10, assignment.EffectiveLateToleranceMinutes);
            var morning = await upgraded.WorkSchedules.SingleAsync(x => x.ShiftType == ShiftType.MORNING); var night = await upgraded.WorkSchedules.SingleAsync(x => x.ShiftType == ShiftType.NIGHT);
            Assert.Equal((new TimeOnly(8, 0), new TimeOnly(12, 0), 10), (morning.PlannedStart, morning.PlannedEnd, morning.LateToleranceMinutes)); Assert.Equal((new TimeOnly(18, 0), new TimeOnly(22, 0), 10), (night.PlannedStart, night.PlannedEnd, night.LateToleranceMinutes));
            morning.PlannedStart = new TimeOnly(9, 0); await upgraded.SaveChangesAsync(); await upgraded.Entry(assignment).ReloadAsync();
            Assert.Equal(new TimeOnly(8, 0), assignment.EffectivePlannedStart);
            var futureSession = new CashSession { BusinessDate = DateOnly.FromDateTime(now.UtcDateTime).AddDays(1), OpenedAt = now, OpenedByUserId = actor }; var futureShift = new Shift { Type = ShiftType.MORNING, Status = ShiftStatus.PENDING }; futureSession.Shifts.Add(futureShift); upgraded.CashSessions.Add(futureSession); await upgraded.SaveChangesAsync();
            var assigned = await Service(upgraded).AssignAsync(futureShift.Id, new([employeeId]), actor);
            Assert.Null(assigned.Error); Assert.Equal(new TimeOnly(9, 0), await upgraded.ShiftAssignments.Where(x => x.ShiftId == futureShift.Id).Select(x => x.EffectivePlannedStart).SingleAsync());
        }

        [Fact]
        public async Task Cash_closing_schema_keeps_legacy_money_unknown_and_enforces_one_closing_per_session()
        {
                var connectionString = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "cash_closing_upgrade_" + Guid.NewGuid().ToString("N") }.ConnectionString;
                await postgres.MigrateToAsync(connectionString, "20260831112909_AddEmployeeHourlyRateAndWorkScheduleSnapshots");
                var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options;
                var sessionId = Guid.NewGuid(); var now = DateTimeOffset.UtcNow;
                await using (var legacy = new ApplicationDbContext(options))
                {
                        await legacy.Database.ExecuteSqlInterpolatedAsync($"""INSERT INTO public.cash_sessions ("Id", "BusinessDate", "IsOpen", "OpenedAt", "OpenedByUserId") VALUES ({sessionId}, {DateOnly.FromDateTime(now.UtcDateTime)}, {true}, {now}, {"legacy"});""");
                }

                await postgres.MigrateAsync(connectionString);
                await using var upgraded = new ApplicationDbContext(options);
                var legacySession = await upgraded.CashSessions.SingleAsync(x => x.Id == sessionId);
                upgraded.Users.Add(new IdentityUser { Id = "legacy", UserName = "legacy", NormalizedUserName = "LEGACY" });
                    await upgraded.SaveChangesAsync();
                    Assert.Null(legacySession.OpeningAmount); Assert.Null(legacySession.PettyCashOpeningAmount); Assert.Null(legacySession.CashRemovedAmount); Assert.Null(legacySession.CashAmountCarriedForward);

                upgraded.CashClosings.Add(new CashClosing { CashSessionId = sessionId, BusinessDate = legacySession.BusinessDate, OpeningAmount = 10m, PettyCashOpeningAmount = 5m, CashRemovedAmount = 0m, SalesTotal = 30m, CashSalesTotal = 20m, QrSalesTotal = 5m, ExternalSalesTotal = 5m, DirectSalesTotal = 15m, PedidosYaSalesTotal = 15m, CashDrawerExpensesTotal = 2m, PettyCashExpensesTotal = 1m, ExpensesTotal = 3m, ExpectedCash = 27m, DeclaredCash = 27m, Difference = 0m, ClosedByUserId = "legacy", ClosedAt = now });
                await upgraded.SaveChangesAsync();
                upgraded.CashClosings.Add(new CashClosing { CashSessionId = sessionId, BusinessDate = legacySession.BusinessDate, OpeningAmount = 10m, PettyCashOpeningAmount = 5m, CashRemovedAmount = 0m, SalesTotal = 30m, CashSalesTotal = 20m, QrSalesTotal = 5m, ExternalSalesTotal = 5m, DirectSalesTotal = 15m, PedidosYaSalesTotal = 15m, CashDrawerExpensesTotal = 2m, PettyCashExpensesTotal = 1m, ExpensesTotal = 3m, ExpectedCash = 27m, DeclaredCash = 27m, Difference = 0m, ClosedByUserId = "legacy", ClosedAt = now });
                await Assert.ThrowsAsync<DbUpdateException>(() => upgraded.SaveChangesAsync());
        }

        [Fact]
        public async Task Confirm_sale_optionally_snapshots_only_active_customers_before_inventory_mutation()
        {
            var (options, actor, unit) = await NewDatabaseAsync("confirm_sale_customer");
            var product = await SeedProductAsync(options, actor, unit, "customer-sale", ProductType.SALE_ITEM, 4m);
            await OpenShiftAsync(options, actor);
            Guid activeId; Guid inactiveId;
            await using (var setup = new ApplicationDbContext(options))
            {
                var now = DateTimeOffset.UtcNow;
                var active = new Customer { Name = "Active customer", Ci = "CI-ACTIVE", Nit = null, IsActive = true, CreatedAt = now, UpdatedAt = now, CreatedByUserId = actor, UpdatedByUserId = actor };
                var inactive = new Customer { Name = "Inactive customer", Ci = "CI-INACTIVE", Nit = "NIT-INACTIVE", IsActive = false, CreatedAt = now, UpdatedAt = now, CreatedByUserId = actor, UpdatedByUserId = actor };
                setup.Customers.AddRange(active, inactive); await setup.SaveChangesAsync(); activeId = active.Id; inactiveId = inactive.Id;
            }

            var withoutCustomer = await SeedDeliveredOrderAsync(options, actor, product, 1m);
            await using (var noCustomerDb = new ApplicationDbContext(options))
                Assert.Null((await Service(noCustomerDb).ConfirmSaleAsync(new(withoutCustomer, SalesChannel.DIRECT, PaymentMethod.CASH), actor)).Error);
            await using (var noCustomerVerify = new ApplicationDbContext(options))
            {
                var sale = await noCustomerVerify.Sales.SingleAsync(x => x.OrderId == withoutCustomer);
                Assert.Null(sale.CustomerId); Assert.Null(sale.CustomerNameSnapshot); Assert.Null(sale.CustomerCiSnapshot); Assert.Null(sale.CustomerNitSnapshot);
            }

            foreach (var customerId in new[] { Guid.NewGuid(), inactiveId })
            {
                var rejectedOrder = await SeedDeliveredOrderAsync(options, actor, product, 1m);
                await using var rejectedDb = new ApplicationDbContext(options);
                var rejected = await Service(rejectedDb).ConfirmSaleAsync(new(rejectedOrder, SalesChannel.DIRECT, PaymentMethod.CASH, false, customerId), actor);
                Assert.Equal(customerId == inactiveId ? "CUSTOMER_INACTIVE" : "CUSTOMER_NOT_FOUND", rejected.Error);
            }
            await using (var rejectedVerify = new ApplicationDbContext(options))
            {
                Assert.Equal(1, await rejectedVerify.Sales.CountAsync()); Assert.Equal(3m, await Balance(rejectedVerify, product));
            }

            var withCustomer = await SeedDeliveredOrderAsync(options, actor, product, 1m);
            await using (var activeDb = new ApplicationDbContext(options))
                Assert.Null((await Service(activeDb).ConfirmSaleAsync(new(withCustomer, SalesChannel.DIRECT, PaymentMethod.CASH, false, activeId), actor)).Error);
            await using (var update = new ApplicationDbContext(options))
            {
                var customer = await update.Customers.SingleAsync(x => x.Id == activeId);
                customer.Name = "Edited customer"; customer.Ci = "CI-EDITED"; customer.Nit = "NIT-EDITED"; customer.UpdatedAt = DateTimeOffset.UtcNow; await update.SaveChangesAsync();
            }
            await using var verify = new ApplicationDbContext(options);
            var snapshot = await verify.Sales.SingleAsync(x => x.OrderId == withCustomer);
            Assert.Equal(activeId, snapshot.CustomerId); Assert.Equal("Active customer", snapshot.CustomerNameSnapshot); Assert.Equal("CI-ACTIVE", snapshot.CustomerCiSnapshot); Assert.Null(snapshot.CustomerNitSnapshot);
            Assert.Equal(2m, await Balance(verify, product)); Assert.Equal(2, await verify.InventoryMovements.CountAsync(x => x.ReferenceType == InventoryReferenceType.SALE));
        }

        [Fact]
        public async Task Production_vs_production_serializes_shared_ingredient_without_partial_output()
    {
        var (options, actor, unit) = await NewDatabaseAsync("production_production");
        var (ingredient, preparation) = await SeedProductionAsync(options, actor, unit, 10m, 6m);
        var results = await Race(options, x => x.ProduceAsync(new(preparation, 1m, null), actor));
        Assert.Single(results, x => x.Error is null); Assert.Single(results, x => x.Error == "PRODUCTION_STOCK_INSUFFICIENT");
        await using var db = new ApplicationDbContext(options);
        Assert.Equal(4m, await Balance(db, ingredient)); Assert.Equal(1m, await Balance(db, preparation));
        Assert.Single(await db.Productions.ToListAsync()); Assert.Single(await db.ProductionConsumptions.ToListAsync());
        Assert.Equal(2, await db.InventoryMovements.CountAsync());
    }

    [Fact]
    public async Task Production_scales_quantity_per_output_unit_across_mass_and_volume_and_rolls_back_shortage()
    {
        var (options, actor, _) = await NewDatabaseAsync("production_scaling");
        await using (var setup = new ApplicationDbContext(options))
        {
            var gram = await setup.Units.SingleAsync(x => x.Code == "g"); var kilogram = await setup.Units.SingleAsync(x => x.Code == "kg");
            var milliliter = await setup.Units.SingleAsync(x => x.Code == "ml"); var liter = await setup.Units.SingleAsync(x => x.Code == "l");
            var flour = await SeedProductAsync(options, actor, kilogram.Id, "flour", ProductType.INGREDIENT, 1m);
            var water = await SeedProductAsync(options, actor, milliliter.Id, "water", ProductType.INGREDIENT, 2000m);
            var preparation = await SeedProductAsync(options, actor, gram.Id, "dough", ProductType.PREPARATION, 0m);
            setup.ProductCompositions.AddRange(
                new ProductComposition { ParentProductId = preparation, ComponentProductId = flour, QuantityPerOutputUnit = 150m, UnitId = gram.Id, CreatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor },
                new ProductComposition { ParentProductId = preparation, ComponentProductId = water, QuantityPerOutputUnit = .25m, UnitId = liter.Id, CreatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor });
            await setup.SaveChangesAsync();

            var requirements = await Service(setup).RequirementsAsync(preparation, 4m);
            Assert.Null(requirements.Error);
            Assert.Equal(0.6m, requirements.Value!.Components.Single(x => x.ProductId == flour).RequiredQuantity);
            Assert.Equal(1000m, requirements.Value.Components.Single(x => x.ProductId == water).RequiredQuantity);
            var produced = await Service(setup).ProduceAsync(new(preparation, 4m, null), actor);
            Assert.Null(produced.Error);

            var blocked = await Service(setup).ProduceAsync(new(preparation, 4m, null), actor);
            Assert.Equal("PRODUCTION_STOCK_INSUFFICIENT", blocked.Error);
            Assert.Equal(0.4m, await Balance(setup, flour)); Assert.Equal(1000m, await Balance(setup, water)); Assert.Equal(4m, await Balance(setup, preparation));
            Assert.Single(await setup.Productions.ToListAsync()); Assert.Equal(3, await setup.InventoryMovements.CountAsync());
        }
    }

    [Fact]
    public async Task Production_vs_sale_on_same_product_leaves_one_serializable_final_inventory_state()
    {
        var (options, actor, unit) = await NewDatabaseAsync("production_sale");
        var (ingredient, preparation) = await SeedProductionAsync(options, actor, unit, 10m, 6m);
        var order = await SeedDeliveredOrderAsync(options, actor, ingredient, 6m);
        await OpenShiftAsync(options, actor);
        await using var firstDb = new ApplicationDbContext(options); await using var secondDb = new ApplicationDbContext(options);
        var production = Service(firstDb).ProduceAsync(new(preparation, 1m, null), actor);
        var sale = Service(secondDb).ConfirmSaleAsync(new(order, SalesChannel.DIRECT, PaymentMethod.CASH), actor);
        await Task.WhenAll(production, sale);
        await using var verify = new ApplicationDbContext(options);
        Assert.Equal(4m, await Balance(verify, ingredient));
        Assert.True((await verify.Productions.CountAsync(), await verify.Sales.CountAsync()) is (1, 0) or (0, 1));
        Assert.Equal(1, await verify.Productions.CountAsync() == 1 ? await verify.InventoryMovements.CountAsync() - 1 : await verify.InventoryMovements.CountAsync());
        Assert.Equal(await verify.Productions.AnyAsync() ? 1m : 0m, await Balance(verify, preparation));
    }

    [Fact]
    public async Task Two_sales_for_same_order_create_one_sale_and_one_movement()
    {
        var (options, actor, unit) = await NewDatabaseAsync("same_order_sales");
        var product = await SeedProductAsync(options, actor, unit, "sale", ProductType.SALE_ITEM, 10m);
        var order = await SeedDeliveredOrderAsync(options, actor, product, 2m); await OpenShiftAsync(options, actor);
        var results = await Race(options, x => x.ConfirmSaleAsync(new(order, SalesChannel.DIRECT, PaymentMethod.CASH), actor));
        Assert.Single(results, x => x.Error is null); Assert.Single(results, x => x.Error == "SALE_ALREADY_CONFIRMED");
        await using var db = new ApplicationDbContext(options);
        Assert.Single(await db.Sales.ToListAsync()); Assert.Equal(8m, await Balance(db, product)); Assert.Single(await db.InventoryMovements.Where(x => x.ReferenceType == InventoryReferenceType.SALE).ToListAsync());
    }

    [Fact]
    public async Task Sale_vs_handover_assigns_sale_to_exactly_one_operational_shift()
    {
        var (options, actor, unit) = await NewDatabaseAsync("sale_handover");
        var product = await SeedProductAsync(options, actor, unit, "sale", ProductType.SALE_ITEM, 5m);
        var order = await SeedDeliveredOrderAsync(options, actor, product, 1m); var source = await OpenShiftAsync(options, actor);
        await using var saleDb = new ApplicationDbContext(options); await using var handoverDb = new ApplicationDbContext(options);
        var sale = Service(saleDb).ConfirmSaleAsync(new(order, SalesChannel.DIRECT, PaymentMethod.CASH), actor);
        var handover = Service(handoverDb).HandoverAsync(source, new("handover"), actor);
        var saleResult = await sale; var handoverResult = await handover;
        Assert.Null(saleResult.Error); Assert.Null(handoverResult.Error);
        await using var db = new ApplicationDbContext(options); var shifts = await db.Shifts.OrderBy(x => x.Type).ToListAsync(); var persistedSale = await db.Sales.SingleAsync();
        Assert.Contains(persistedSale.ShiftId, shifts.Select(x => x.Id)); Assert.Equal(ShiftStatus.COMPLETED, shifts.Single(x => x.Id == source).Status); Assert.Single(shifts, x => x.Status == ShiftStatus.ACTIVE); Assert.Equal(4m, await Balance(db, product)); Assert.Single(await db.InventoryMovements.Where(x => x.ReferenceType == InventoryReferenceType.SALE).ToListAsync());
    }

    [Fact]
    public async Task Current_day_shift_is_used_by_current_my_current_sale_and_expense_despite_residual_active_shift()
    {
        var (options, actor, unit) = await NewDatabaseAsync("cross_day_shift");
        var day2 = new DateOnly(2026, 9, 2); var clock = new FixedClock(day2); Guid day2Shift;
        await using (var setup = new ApplicationDbContext(options))
        {
            var employee = new Employee { UserId = actor, FullName = "Day two employee" }; setup.Employees.Add(employee);
            var oldSession = new CashSession { BusinessDate = day2.AddDays(-1), OpenedAt = clock.UtcNow.AddDays(-1), OpenedByUserId = actor };
            oldSession.Shifts.Add(new Shift { Type = ShiftType.NIGHT, Status = ShiftStatus.ACTIVE, StartedAt = clock.UtcNow.AddDays(-1) });
            var currentSession = new CashSession { BusinessDate = day2, OpenedAt = clock.UtcNow, OpenedByUserId = actor };
            var morning = new Shift { Type = ShiftType.MORNING, Status = ShiftStatus.ACTIVE, StartedAt = clock.UtcNow };
            morning.Assignments.Add(new ShiftAssignment { EmployeeId = employee.Id, AssignedAt = clock.UtcNow, AssignedByUserId = actor });
            currentSession.Shifts.Add(morning); setup.CashSessions.AddRange(oldSession, currentSession); await setup.SaveChangesAsync(); day2Shift = morning.Id;
        }
        var product = await SeedProductAsync(options, actor, unit, "day-two-sale", ProductType.SALE_ITEM, 2m);
        var order = await SeedDeliveredOrderAsync(options, actor, product, 1m);
        await using (var db = new ApplicationDbContext(options))
        {
            var operations = Service(db, clock); var current = await operations.CurrentShiftAsync(); var mine = await operations.MyCurrentShiftAsync(actor);
            Assert.Equal(day2, current!.BusinessDate); Assert.Equal(day2Shift, mine!.Id);
            var sale = await operations.ConfirmSaleAsync(new(order, SalesChannel.DIRECT, PaymentMethod.CASH), actor); Assert.Null(sale.Error); Assert.Equal(day2Shift, sale.Value!.ShiftId);
            var expense = await new RestaurantSystem.Infrastructure.Expenses.ExpenseService(db, clock).CreateAsync(new(null, 10m, CashSource.PETTY_CASH, "day two", day2), actor); Assert.Null(expense.Error);
        }
        await using var verify = new ApplicationDbContext(options);
        Assert.Equal(day2Shift, await verify.Sales.Select(x => x.ShiftId).SingleAsync()); Assert.Equal(day2Shift, await verify.Expenses.Select(x => x.ShiftId).SingleAsync());
    }

    [Fact]
    public async Task Double_receive_commits_one_receipt_one_entry_and_one_balance_increment()
    {
        var (options, actor, unit) = await NewDatabaseAsync("double_receive"); var product = await SeedProductAsync(options, actor, unit, "receive", ProductType.INGREDIENT, 0m); var purchase = await SeedPurchaseAsync(options, actor, unit, product, 3m);
        var results = await Race(options, x => x.ReceivePurchaseAsync(purchase.PurchaseId, new([new(purchase.ItemId, 3m, unit)], null), actor, AdminRoles));
        Assert.Single(results, x => x.Error is null); Assert.Single(results, x => x.Error == "PURCHASE_ALREADY_RECEIVED");
        await using var db = new ApplicationDbContext(options); Assert.Equal(PurchaseStatus.RECIBIDA, await db.Purchases.Where(x => x.Id == purchase.PurchaseId).Select(x => x.Status).SingleAsync()); Assert.Single(await db.PurchaseReceipts.ToListAsync()); Assert.Single(await db.PurchaseReceiptLines.ToListAsync()); Assert.Equal(3m, await Balance(db, product)); Assert.Single(await db.InventoryMovements.Where(x => x.ReferenceType == InventoryReferenceType.PURCHASE).ToListAsync());
    }

    [Fact]
    public async Task Cancel_vs_receive_leaves_purchase_either_cancelled_without_stock_or_received_once()
    {
        var (options, actor, unit) = await NewDatabaseAsync("cancel_receive"); var product = await SeedProductAsync(options, actor, unit, "cancel", ProductType.INGREDIENT, 0m); var purchase = await SeedPurchaseAsync(options, actor, unit, product, 3m);
        await using var cancelDb = new ApplicationDbContext(options); await using var receiveDb = new ApplicationDbContext(options);
        var cancel = Service(cancelDb).CancelPurchaseAsync(purchase.PurchaseId, new("not accepted"), actor, AdminRoles);
        var receive = Service(receiveDb).ReceivePurchaseAsync(purchase.PurchaseId, new([new(purchase.ItemId, 3m, unit)], null), actor, AdminRoles);
        await Task.WhenAll(cancel, receive); var cancelResult = await cancel; var receiveResult = await receive; Assert.True((cancelResult.Error is null) ^ (receiveResult.Error is null));
        await using var db = new ApplicationDbContext(options); var state = await db.Purchases.Where(x => x.Id == purchase.PurchaseId).Select(x => x.Status).SingleAsync();
        if (state == PurchaseStatus.CANCELADA) { Assert.Equal(0m, await Balance(db, product)); Assert.Empty(await db.PurchaseReceipts.ToListAsync()); Assert.Empty(await db.InventoryMovements.ToListAsync()); }
        else { Assert.Equal(PurchaseStatus.RECIBIDA, state); Assert.Equal(3m, await Balance(db, product)); Assert.Single(await db.PurchaseReceipts.ToListAsync()); Assert.Single(await db.InventoryMovements.ToListAsync()); }
    }

    [Fact]
    public async Task Purchase_listing_is_sequential_and_preserves_pending_receipt_nulls()
    {
        var (options, actor, unit) = await NewDatabaseAsync("purchase_listing");
        var firstProduct = await SeedProductAsync(options, actor, unit, "first", ProductType.INGREDIENT, 0m);
        var secondProduct = await SeedProductAsync(options, actor, unit, "second", ProductType.INGREDIENT, 0m);
        var first = await SeedPurchaseAsync(options, actor, unit, firstProduct, 3m);
        var second = await SeedPurchaseAsync(options, actor, unit, secondProduct, 4m);
        await using (var db = new ApplicationDbContext(options))
        {
            var result = await Service(db).ReceivePurchaseAsync(first.PurchaseId, new([new(first.ItemId, 3m, unit)], null), actor, AdminRoles);
            Assert.Null(result.Error);
        }
        await using var verify = new ApplicationDbContext(options);
        var page = await Service(verify).PurchasesAsync(1, 10, null);
        Assert.Equal(2, page.TotalCount);
        Assert.Equal(2, page.Items.Count);
        var pending = page.Items.Single(x => x.Id == second.PurchaseId).Lines.Single();
        Assert.Null(pending.ReceivedQuantity);
        Assert.Null(pending.ReceivedUnitId);
        var received = page.Items.Single(x => x.Id == first.PurchaseId).Lines.Single();
        Assert.Equal(3m, received.ReceivedQuantity);
        Assert.Equal(unit, received.ReceivedUnitId);
    }

        [Fact]
        public async Task Purchase_history_is_server_scoped_filtered_paginated_and_preserves_receipt_detail_without_mutation()
        {
            var (options, actor, unit) = await NewDatabaseAsync("purchase_history"); var kitchenProduct = await SeedProductAsync(options, actor, unit, "kitchen", ProductType.INGREDIENT, 0m); var generalProduct = await SeedProductAsync(options, actor, unit, "general", ProductType.SALE_ITEM, 0m); var kitchen = await SeedPurchaseAsync(options, actor, unit, kitchenProduct, 3m); var general = await SeedPurchaseAsync(options, actor, unit, generalProduct, 4m);
            await using (var db = new ApplicationDbContext(options)) { var received = await Service(db).ReceivePurchaseAsync(kitchen.PurchaseId, new([new(kitchen.ItemId, 3m, unit)], "received"), actor, AdminRoles); Assert.Null(received.Error); var purchase = await db.Purchases.SingleAsync(x => x.Id == general.PurchaseId); purchase.Status = PurchaseStatus.CANCELADA; purchase.CancellationReason = "cancelled"; purchase.CancelledAt = DateTimeOffset.UtcNow; purchase.CancelledByUserId = actor; await db.SaveChangesAsync(); }
            await using var verify = new ApplicationDbContext(options); var service = Service(verify); var kitchenScope = new HashSet<string> { "COCINA" }; var broad = new HashSet<string> { "CONTADORA" };
            var scoped = await service.PurchaseHistoryAsync(kitchenScope, 1, 10, null, null, "GENERAL", null, null, null); Assert.Empty(scoped.Items); var allKitchen = await service.PurchaseHistoryAsync(kitchenScope, 1, 10, null, null, null, null, null, null); Assert.Single(allKitchen.Items); Assert.Equal("KITCHEN", allKitchen.Items.Single().PurchaseArea);
            var filtered = await service.PurchaseHistoryAsync(broad, 1, 1, PurchaseStatus.CANCELADA, null, "GENERAL", actor, null, null); Assert.Equal(1, filtered.TotalCount); var row = Assert.Single(filtered.Items); Assert.Equal(general.PurchaseId, row.Id); Assert.Equal("cancelled", row.CancellationReason);
            var detail = await service.PurchaseDetailAsync(kitchenScope, kitchen.PurchaseId); Assert.NotNull(detail); Assert.Equal("KITCHEN", detail!.PurchaseArea); Assert.Equal(3m, detail.Items.Single().OrderedQuantity); Assert.Equal(3m, detail.Receipt!.Lines.Single().ReceivedQuantity); Assert.Equal(actor, detail.Receipt.ReceivedByUserId); Assert.Equal(2, await verify.Purchases.CountAsync()); Assert.Single(await verify.PurchaseReceipts.ToListAsync());
            Assert.Null(await service.PurchaseDetailAsync(kitchenScope, general.PurchaseId));
        }

        [Fact]
        public async Task Sale_uses_locked_authoritative_shortages_when_stock_changes_after_precheck()
    {
        var (options, actor, unit) = await NewDatabaseAsync("sale_authoritative_shortage");
        var product = await SeedProductAsync(options, actor, unit, "race-sale", ProductType.SALE_ITEM, 1m);
        var order = await SeedDeliveredOrderAsync(options, actor, product, 1m); await OpenShiftAsync(options, actor);
        await using var db = new ApplicationDbContext(options);
        var result = await new OperationsService(db, new DrainBeforeBatchWriter(options, product, actor, new InventoryService(db)), new TestClock())
            .ConfirmSaleAsync(new(order, SalesChannel.DIRECT, PaymentMethod.CASH), actor);
        Assert.Equal("SALE_STOCK_CONFIRMATION_REQUIRED", result.Error); var shortage = Assert.Single(result.Shortages!);
        Assert.Equal(product, shortage.ProductId); Assert.Equal(1m, shortage.RequiredQuantity); Assert.Equal(0m, shortage.CurrentQuantity); Assert.Equal(1m, shortage.ShortageQuantity);
        await using var verify = new ApplicationDbContext(options);
        Assert.Equal(0m, await Balance(verify, product)); Assert.Empty(await verify.Sales.ToListAsync());
        Assert.Single(await verify.InventoryMovements.Where(x => x.ReferenceType == InventoryReferenceType.MANUAL).ToListAsync()); Assert.Empty(await verify.InventoryMovements.Where(x => x.ReferenceType == InventoryReferenceType.SALE).ToListAsync());
    }

        [Fact]
        public async Task Hu012_sale_matrix_enforces_eligibility_channel_payment_server_values_and_atomic_inventory()
        {
            var (options, actor, unit) = await NewDatabaseAsync("hu012_matrix");
            var product = await SeedProductAsync(options, actor, unit, "sale-matrix", ProductType.SALE_ITEM, 20m);
            foreach (var status in new[] { OrderStatus.PENDIENTE, OrderStatus.EN_PREPARACION, OrderStatus.LISTO, OrderStatus.CANCELADO })
            {
                var orderId = await SeedOrderAsync(options, actor, product, 1m, status);
                await using var rejectedDb = new ApplicationDbContext(options);
                var rejected = await Service(rejectedDb).ConfirmSaleAsync(new(orderId, SalesChannel.DIRECT, PaymentMethod.CASH), actor);
                Assert.Equal("ORDER_NOT_DELIVERED", rejected.Error);
            }
            await using (var rejectedState = new ApplicationDbContext(options))
            {
                Assert.Empty(await rejectedState.Sales.ToListAsync());
                Assert.Empty(await rejectedState.InventoryMovements.ToListAsync());
            }
            var shift = await OpenShiftAsync(options, actor);
            foreach (var request in new[] { (SalesChannel.DIRECT, PaymentMethod.CASH), (SalesChannel.DIRECT, PaymentMethod.QR), (SalesChannel.DIRECT, PaymentMethod.EXTERNAL), (SalesChannel.PEDIDOSYA, PaymentMethod.CASH), (SalesChannel.PEDIDOSYA, PaymentMethod.QR), (SalesChannel.PEDIDOSYA, PaymentMethod.EXTERNAL) })
            {
                var orderId = await SeedDeliveredOrderAsync(options, actor, product, 1m);
                await using var saleDb = new ApplicationDbContext(options);
                var confirmed = await Service(saleDb).ConfirmSaleAsync(new(orderId, request.Item1, request.Item2), actor);
                Assert.Null(confirmed.Error); Assert.Equal(request.Item1, confirmed.Value!.SalesChannel); Assert.Equal(request.Item2, confirmed.Value.PaymentMethod);
                Assert.Equal(2m, confirmed.Value.Subtotal); Assert.Equal(2m, confirmed.Value.Total); Assert.Equal(actor, confirmed.Value.ConfirmedByUserId); Assert.NotEqual(default, confirmed.Value.ConfirmedAt); Assert.Equal(shift, confirmed.Value.ShiftId);
            }
            foreach (var request in new[] { ((SalesChannel)99, PaymentMethod.CASH), (SalesChannel.DIRECT, (PaymentMethod)99) })
            {
                var orderId = await SeedDeliveredOrderAsync(options, actor, product, 1m);
                await using var invalidDb = new ApplicationDbContext(options);
                Assert.Equal("INVALID_REQUEST", (await Service(invalidDb).ConfirmSaleAsync(new(orderId, request.Item1, request.Item2), actor)).Error);
            }
            var preparation = await SeedProductAsync(options, actor, unit, "preparation-sale", ProductType.PREPARATION, 2m);
            var ingredient = await SeedProductAsync(options, actor, unit, "preparation-ingredient", ProductType.INGREDIENT, 9m);
            await using (var composition = new ApplicationDbContext(options)) { composition.ProductCompositions.Add(new ProductComposition { ParentProductId = preparation, ComponentProductId = ingredient, QuantityPerOutputUnit = 3m, UnitId = unit, CreatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor }); await composition.SaveChangesAsync(); }
            var preparationOrder = await SeedDeliveredOrderAsync(options, actor, preparation, 1m);
            await using (var preparationDb = new ApplicationDbContext(options)) Assert.Null((await Service(preparationDb).ConfirmSaleAsync(new(preparationOrder, SalesChannel.DIRECT, PaymentMethod.CASH), actor)).Error);
            await using (var verify = new ApplicationDbContext(options))
            {
                Assert.Equal(1m, await Balance(verify, preparation)); Assert.Equal(9m, await Balance(verify, ingredient));
                Assert.Equal(7, await verify.Sales.CountAsync()); Assert.Equal(7, await verify.InventoryMovements.CountAsync(x => x.ReferenceType == InventoryReferenceType.SALE));
            }
        }

        [Fact]
        public async Task Hu013_sale_time_new_shortage_requires_acknowledged_retry_and_rolls_back_first_attempt()
        {
            var (options, actor, unit) = await NewDatabaseAsync("hu013_sale_race");
            var product = await SeedProductAsync(options, actor, unit, "sale-race", ProductType.SALE_ITEM, 2m);
            var orderId = await SeedDeliveredOrderAsync(options, actor, product, 2m); await OpenShiftAsync(options, actor);
            await using (var lowerStock = new ApplicationDbContext(options)) { (await lowerStock.InventoryBalances.SingleAsync(x => x.ProductId == product)).Quantity = 1m; await lowerStock.SaveChangesAsync(); }
            await using (var firstAttemptDb = new ApplicationDbContext(options))
            {
                var first = await Service(firstAttemptDb).ConfirmSaleAsync(new(orderId, SalesChannel.DIRECT, PaymentMethod.CASH), actor);
                Assert.Equal("SALE_STOCK_CONFIRMATION_REQUIRED", first.Error); var shortage = Assert.Single(first.Shortages!); Assert.Equal(1m, shortage.ShortageQuantity); Assert.Equal(1m, shortage.CurrentQuantity);
            }
            await using (var afterFirst = new ApplicationDbContext(options)) { Assert.Empty(await afterFirst.Sales.ToListAsync()); Assert.Empty(await afterFirst.InventoryMovements.Where(x => x.ReferenceType == InventoryReferenceType.SALE).ToListAsync()); Assert.Equal(1m, await Balance(afterFirst, product)); }
            await using (var retryDb = new ApplicationDbContext(options)) { var retry = await Service(retryDb).ConfirmSaleAsync(new(orderId, SalesChannel.DIRECT, PaymentMethod.CASH, true), actor); Assert.Null(retry.Error); }
            await using var verified = new ApplicationDbContext(options);
            var order = await verified.Orders.SingleAsync(x => x.Id == orderId); Assert.NotNull(order.StockShortageAcknowledgedAt); Assert.Equal(actor, order.StockShortageAcknowledgedByUserId); Assert.Single(await verified.Sales.ToListAsync()); Assert.Single(await verified.InventoryMovements.Where(x => x.ReferenceType == InventoryReferenceType.SALE).ToListAsync()); Assert.Equal(-1m, await Balance(verified, product));
        }

        [Theory]
        [InlineData(0, 125)]
        [InlineData(25, 100)]
        [InlineData(125, 0)]
        public async Task Financial_handover_persists_server_derived_removal_and_carry_forward_on_the_same_open_session(decimal removed, decimal carriedForward)
        {
            var (options, actor, _) = await NewDatabaseAsync("financial_handover");
            Guid morningId; Guid sessionId;
            await using (var setup = new ApplicationDbContext(options))
            {
                var session = new CashSession { BusinessDate = new TestClock().BusinessDate, OpenedAt = DateTimeOffset.UtcNow, OpenedByUserId = actor, OpeningAmount = 100m, PettyCashOpeningAmount = 10m };
                var morning = new Shift { Type = ShiftType.MORNING, Status = ShiftStatus.ACTIVE, StartedAt = DateTimeOffset.UtcNow };
                session.Shifts.Add(morning); session.Shifts.Add(new Shift { Type = ShiftType.NIGHT }); setup.CashSessions.Add(session); await setup.SaveChangesAsync(); morningId = morning.Id; sessionId = session.Id;
                setup.Sales.AddRange(new Sale { OrderId = Guid.NewGuid(), ShiftId = morningId, SalesChannel = SalesChannel.DIRECT, PaymentMethod = PaymentMethod.CASH, Subtotal = 20m, Total = 20m, ConfirmedAt = DateTimeOffset.UtcNow, ConfirmedByUserId = actor }, new Sale { OrderId = Guid.NewGuid(), ShiftId = morningId, SalesChannel = SalesChannel.DIRECT, PaymentMethod = PaymentMethod.QR, Subtotal = 50m, Total = 50m, ConfirmedAt = DateTimeOffset.UtcNow, ConfirmedByUserId = actor });
                setup.Expenses.Add(new Expense { ShiftId = morningId, Amount = 5m, CashSource = CashSource.CASH_DRAWER, Description = "cash expense", ExpenseDate = new TestClock().BusinessDate, CreatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor }); await setup.SaveChangesAsync();
            }
            await using (var handoverDb = new ApplicationDbContext(options))
            {
                var handover = await Service(handoverDb).HandoverAsync(morningId, new("descriptive only", removed), actor);
                Assert.Null(handover.Error); Assert.Equal(removed, handover.Value!.CashRemovedAmount); Assert.Equal(carriedForward, handover.Value.CashAmountCarriedForward);
            }
            await using var verify = new ApplicationDbContext(options); var sessionAfter = await verify.CashSessions.SingleAsync(); var shifts = await verify.Shifts.Where(x => x.CashSessionId == sessionId).ToArrayAsync();
            Assert.Equal(sessionId, sessionAfter.Id); Assert.True(sessionAfter.IsOpen); Assert.Equal(removed, sessionAfter.CashRemovedAmount); Assert.Equal(carriedForward, sessionAfter.CashAmountCarriedForward); Assert.Empty(await verify.CashClosings.ToListAsync());
            Assert.Equal(ShiftStatus.COMPLETED, shifts.Single(x => x.Type == ShiftType.MORNING).Status); Assert.Equal(ShiftStatus.ACTIVE, shifts.Single(x => x.Type == ShiftType.NIGHT).Status);
        }

        [Fact]
        public async Task Financial_handover_rejects_removal_greater_than_available_without_changing_hu025_lifecycle()
        {
            var (options, actor, _) = await NewDatabaseAsync("financial_handover_invalid"); var morningId = await OpenShiftAsync(options, actor);
            await using (var handoverDb = new ApplicationDbContext(options))
                Assert.Equal("CASH_REMOVAL_EXCEEDS_AVAILABLE", (await Service(handoverDb).HandoverAsync(morningId, new("still descriptive", 1m), actor)).Error);
            await using var verify = new ApplicationDbContext(options); var session = await verify.CashSessions.SingleAsync(); var shifts = await verify.Shifts.Where(x => x.CashSessionId == session.Id).ToArrayAsync();
            Assert.Null(session.CashRemovedAmount); Assert.Null(session.CashAmountCarriedForward); Assert.True(session.IsOpen); Assert.Equal(ShiftStatus.ACTIVE, shifts.Single(x => x.Type == ShiftType.MORNING).Status); Assert.Equal(ShiftStatus.PENDING, shifts.Single(x => x.Type == ShiftType.NIGHT).Status);
        }

        [Fact]
        public async Task Concurrent_handover_completes_source_once_and_leaves_exactly_one_active_shift()
    {
        var (options, actor, _) = await NewDatabaseAsync("handover_handover"); var source = await OpenShiftAsync(options, actor);
        var results = await Race(options, x => x.HandoverAsync(source, new("handover"), actor));
        Assert.Single(results, x => x.Error is null); Assert.Single(results, x => x.Error == "INVALID_SHIFT_TRANSITION");
        await using var db = new ApplicationDbContext(options); var shifts = await db.Shifts.ToListAsync(); Assert.Equal(ShiftStatus.COMPLETED, shifts.Single(x => x.Id == source).Status); Assert.Single(shifts, x => x.Status == ShiftStatus.ACTIVE); Assert.Equal(2, shifts.Count);
    }

        [Fact]
        public async Task Production_history_is_newest_first_filtered_paginated_and_reads_persisted_consumption_without_inventory_mutation()
        {
            var (options, actor, unit) = await NewDatabaseAsync("production_history");
            var preparation = await SeedProductAsync(options, actor, unit, "history-preparation", ProductType.PREPARATION, 0m);
            var ingredient = await SeedProductAsync(options, actor, unit, "history-ingredient", ProductType.INGREDIENT, 0m);
            var oldest = DateTimeOffset.UtcNow.AddDays(-2); var newest = DateTimeOffset.UtcNow;
            Guid newestId;
            await using (var seed = new ApplicationDbContext(options))
            {
                var first = new Production { BatchCode = "PRD-HISTORY-OLD", Status = ProductionStatus.COMPLETED, ProductId = preparation, QuantityProduced = 2m, ProducedAt = oldest, CreatedByUserId = actor, Notes = "old" };
                var second = new Production { BatchCode = "PRD-HISTORY-NEW", Status = ProductionStatus.COMPLETED, ProductId = preparation, QuantityProduced = 3m, ProducedAt = newest, CreatedByUserId = actor, Notes = "new" };
                seed.Productions.AddRange(first, second); await seed.SaveChangesAsync(); newestId = second.Id;
                seed.ProductionConsumptions.AddRange(new ProductionConsumption { ProductionId = first.Id, ComponentProductId = ingredient, QuantityConsumed = 2m }, new ProductionConsumption { ProductionId = second.Id, ComponentProductId = ingredient, QuantityConsumed = 7m }); await seed.SaveChangesAsync();
            }
            await using var db = new ApplicationDbContext(options); var service = Service(db);
            var beforeMovements = await db.InventoryMovements.CountAsync();
            var page = await service.ProductionsAsync(1, 1, preparation, "history", ProductionStatus.COMPLETED, actor, oldest.AddHours(-1), newest.AddHours(1));
            var detail = await service.ProductionAsync(newestId);
            Assert.Equal(2, page.TotalCount); Assert.Single(page.Items); Assert.Equal("PRD-HISTORY-NEW", page.Items[0].BatchCode); Assert.Equal("new", page.Items[0].Notes);
            Assert.NotNull(detail); Assert.Equal("PRD-HISTORY-NEW", detail!.BatchCode); Assert.Equal(7m, Assert.Single(detail.Consumptions).QuantityConsumed); Assert.Equal(ingredient, detail.Consumptions[0].ProductId);
            Assert.Equal(beforeMovements, await db.InventoryMovements.CountAsync());
        }

            [Fact]
            public async Task Authorized_sales_scope_limits_mesero_to_their_current_assigned_shift_and_promotes_broad_roles()
            {
                var (options, actor, _) = await NewDatabaseAsync("sales_scope");
                var activeShift = await OpenShiftAsync(options, actor);
                const string waiter = "scope-waiter";
                Guid otherShift;
                await using (var seed = new ApplicationDbContext(options))
                {
                    seed.Users.Add(new IdentityUser { Id = waiter, UserName = waiter, NormalizedUserName = waiter.ToUpperInvariant() });
                    var employee = new Employee { UserId = waiter, FullName = "Scope waiter", IsActive = true };
                    seed.Employees.Add(employee); await seed.SaveChangesAsync();
                    seed.ShiftAssignments.Add(new ShiftAssignment { ShiftId = activeShift, EmployeeId = employee.Id, AssignedAt = DateTimeOffset.UtcNow, AssignedByUserId = actor, EffectivePlannedStart = new TimeOnly(8, 0), EffectivePlannedEnd = new TimeOnly(12, 0), EffectiveLateToleranceMinutes = 10 });
                    otherShift = await seed.Shifts.Where(x => x.Id != activeShift).Select(x => x.Id).SingleAsync();
                    seed.Sales.AddRange(
                        new Sale { OrderId = Guid.NewGuid(), ShiftId = activeShift, SalesChannel = SalesChannel.DIRECT, PaymentMethod = PaymentMethod.CASH, Subtotal = 1m, Total = 1m, ConfirmedAt = DateTimeOffset.UtcNow, ConfirmedByUserId = actor },
                        new Sale { OrderId = Guid.NewGuid(), ShiftId = otherShift, SalesChannel = SalesChannel.DIRECT, PaymentMethod = PaymentMethod.CASH, Subtotal = 1m, Total = 1m, ConfirmedAt = DateTimeOffset.UtcNow, ConfirmedByUserId = actor });
                    await seed.SaveChangesAsync();
                }
                await using var db = new ApplicationDbContext(options);
                var scope = new SalesAuthorizationScope(db, new TestClock());
                var waiterScope = await scope.ResolveAsync(waiter, new HashSet<string> { "MESERO" });
                Assert.True(waiterScope.IsAuthorized); Assert.Equal(activeShift, waiterScope.ShiftId);
                Assert.Single(await waiterScope.Apply(db.Sales).ToArrayAsync());
                Assert.Empty(await waiterScope.Apply(db.Sales).Where(x => x.ShiftId == otherShift).ToArrayAsync());
                foreach (var role in new[] { "ADMINISTRADOR", "ENCARGADO", "CONTADORA" })
                {
                    var broad = await scope.ResolveAsync(waiter, new HashSet<string> { role });
                    Assert.True(broad.IsBroad); Assert.Equal(2, await broad.Apply(db.Sales).CountAsync());
                }
                var union = await scope.ResolveAsync(waiter, new HashSet<string> { "MESERO", "ENCARGADO" });
                Assert.True(union.IsBroad); Assert.Equal(2, await union.Apply(db.Sales).CountAsync());
            }

            [Fact]
            public async Task Sales_history_and_detail_are_authorized_paginated_filtered_and_snapshot_based()
            {
                var (options, actor, unit) = await NewDatabaseAsync("sales_history");
                var product = await SeedProductAsync(options, actor, unit, "historic-item", ProductType.SALE_ITEM, 0m);
                var activeShift = await OpenShiftAsync(options, actor);
                const string waiter = "history-waiter";
                Guid otherShift; Guid customerSaleId; Guid noCustomerSaleId;
                await using (var seed = new ApplicationDbContext(options))
                {
                    seed.Users.Add(new IdentityUser { Id = waiter, UserName = waiter, NormalizedUserName = waiter.ToUpperInvariant() });
                    var employee = new Employee { UserId = waiter, FullName = "History waiter", IsActive = true }; var customer = new Customer { Name = "Snapshot name", Ci = "SNAP-CI", Nit = "SNAP-NIT", CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor, UpdatedByUserId = actor };
                    seed.Employees.Add(employee); seed.Customers.Add(customer); await seed.SaveChangesAsync();
                    seed.ShiftAssignments.Add(new ShiftAssignment { ShiftId = activeShift, EmployeeId = employee.Id, AssignedAt = DateTimeOffset.UtcNow, AssignedByUserId = actor, EffectivePlannedStart = new(8, 0), EffectivePlannedEnd = new(12, 0), EffectiveLateToleranceMinutes = 10 });
                    otherShift = await seed.Shifts.Where(x => x.Id != activeShift).Select(x => x.Id).SingleAsync();
                    var orders = Enumerable.Range(0, 3).Select(_ => new Order { Status = OrderStatus.ENTREGADO, CreatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor }).ToArray();
                    foreach (var order in orders) order.Items.Add(new OrderItem { ProductId = product, Quantity = 2m, UnitPrice = 3m, CreatedAt = DateTimeOffset.UtcNow });
                    seed.Orders.AddRange(orders); await seed.SaveChangesAsync();
                    var oldest = new Sale { OrderId = orders[0].Id, ShiftId = activeShift, CustomerId = customer.Id, CustomerNameSnapshot = customer.Name, CustomerCiSnapshot = customer.Ci, CustomerNitSnapshot = customer.Nit, SalesChannel = SalesChannel.DIRECT, PaymentMethod = PaymentMethod.CASH, Subtotal = 6m, Total = 6m, ConfirmedAt = DateTimeOffset.UtcNow.AddHours(-2), ConfirmedByUserId = actor };
                    var newest = new Sale { OrderId = orders[1].Id, ShiftId = activeShift, SalesChannel = SalesChannel.PEDIDOSYA, PaymentMethod = PaymentMethod.QR, Subtotal = 6m, Total = 6m, ConfirmedAt = DateTimeOffset.UtcNow.AddHours(-1), ConfirmedByUserId = actor };
                    var outside = new Sale { OrderId = orders[2].Id, ShiftId = otherShift, SalesChannel = SalesChannel.DIRECT, PaymentMethod = PaymentMethod.EXTERNAL, Subtotal = 6m, Total = 6m, ConfirmedAt = DateTimeOffset.UtcNow, ConfirmedByUserId = actor };
                    oldest.Items.Add(new SaleItem { OrderItemId = orders[0].Items.Single().Id, ProductId = product, Quantity = 2m, UnitPrice = 3m, LineTotal = 6m });
                    seed.Sales.AddRange(oldest, newest, outside); await seed.SaveChangesAsync(); customer.Name = "Changed later"; customer.Ci = "CHANGED"; customer.Nit = null; await seed.SaveChangesAsync(); customerSaleId = oldest.Id; noCustomerSaleId = newest.Id;
                }
                await using var db = new ApplicationDbContext(options); var service = Service(db); var waiterScope = new AuthorizedSalesScope(true, activeShift); var broadScope = new AuthorizedSalesScope(true, null);
                var waiterPage = await service.SalesAsync(waiterScope, 1, 1, null, null, null, null, null, null);
                var filtered = await service.SalesAsync(broadScope, 1, 10, null, null, null, SalesChannel.PEDIDOSYA, PaymentMethod.QR, "snapshot");
                var detail = await service.SaleAsync(waiterScope, customerSaleId);
                Assert.Equal(2, waiterPage.TotalCount); Assert.Single(waiterPage.Items); Assert.Equal(noCustomerSaleId, waiterPage.Items[0].Id); Assert.Null(waiterPage.Items[0].CustomerId);
                Assert.Empty(filtered.Items); Assert.NotNull(detail); Assert.Equal("Snapshot name", detail!.CustomerNameSnapshot); Assert.Equal("SNAP-CI", detail.CustomerCiSnapshot); Assert.Equal("SNAP-NIT", detail.CustomerNitSnapshot); Assert.Equal(2m, Assert.Single(detail.Items).Quantity); Assert.Equal(3m, detail.Items[0].UnitPrice); Assert.Equal(6m, detail.Items[0].LineTotal); Assert.StartsWith("historic-item", detail.Items[0].ProductName);
                Assert.Null(await service.SaleAsync(waiterScope, otherShift)); Assert.Equal(3, (await service.SalesAsync(broadScope, 1, 10, null, null, null, null, null, null)).TotalCount);
            }

            private static readonly IReadOnlySet<string> AdminRoles = new HashSet<string> { "ADMINISTRADOR" };
    private static OperationsService Service(ApplicationDbContext db, IBusinessClock? clock = null) => new(db, new InventoryService(db), clock ?? new TestClock());
    private static async Task<T[]> Race<T>(DbContextOptions<ApplicationDbContext> options, Func<OperationsService, Task<T>> operation)
    {
        await using var first = new ApplicationDbContext(options); await using var second = new ApplicationDbContext(options);
        return await Task.WhenAll(operation(Service(first)), operation(Service(second)));
    }
    private async Task<(DbContextOptions<ApplicationDbContext> Options, string Actor, Guid Unit)> NewDatabaseAsync(string name)
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = name + "_" + Guid.NewGuid().ToString("N") }.ConnectionString; await postgres.MigrateAsync(cs); var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options; const string actor = "race-actor";
        await using var db = new ApplicationDbContext(options); db.Users.Add(new IdentityUser { Id = actor, UserName = actor, NormalizedUserName = actor.ToUpperInvariant() }); await db.SaveChangesAsync(); return (options, actor, (await db.Units.FirstAsync()).Id);
    }
    private static async Task<Guid> SeedProductAsync(DbContextOptions<ApplicationDbContext> options, string actor, Guid unit, string name, ProductType type, decimal quantity)
    {
        await using var db = new ApplicationDbContext(options); var product = new Product { Name = name + Guid.NewGuid().ToString("N"), ProductType = type, InventoryUnitId = unit, IsActive = true, IsSellable = true, SalePrice = 2m, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor, UpdatedByUserId = actor }; db.Products.Add(product); await db.SaveChangesAsync(); db.InventoryBalances.Add(new() { ProductId = product.Id, Quantity = quantity, UpdatedAt = DateTimeOffset.UtcNow }); await db.SaveChangesAsync(); return product.Id;
    }
    private static async Task<(Guid Ingredient, Guid Preparation)> SeedProductionAsync(DbContextOptions<ApplicationDbContext> options, string actor, Guid unit, decimal stock, decimal perUnit)
    {
        var ingredient = await SeedProductAsync(options, actor, unit, "ingredient", ProductType.INGREDIENT, stock); var preparation = await SeedProductAsync(options, actor, unit, "preparation", ProductType.PREPARATION, 0m); await using var db = new ApplicationDbContext(options); db.ProductCompositions.Add(new() { ParentProductId = preparation, ComponentProductId = ingredient, QuantityPerOutputUnit = perUnit, UnitId = unit, CreatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor }); await db.SaveChangesAsync(); return (ingredient, preparation);
    }
    private static Task<Guid> SeedDeliveredOrderAsync(DbContextOptions<ApplicationDbContext> options, string actor, Guid product, decimal quantity) => SeedOrderAsync(options, actor, product, quantity, OrderStatus.ENTREGADO);
    private static async Task<Guid> SeedOrderAsync(DbContextOptions<ApplicationDbContext> options, string actor, Guid product, decimal quantity, OrderStatus status)
    {
        await using var db = new ApplicationDbContext(options); var order = new Order { Status = status, CreatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor }; order.Items.Add(new() { ProductId = product, Quantity = quantity, UnitPrice = 2m, CreatedAt = DateTimeOffset.UtcNow }); db.Orders.Add(order); await db.SaveChangesAsync(); return order.Id;
    }
    private static async Task<Guid> OpenShiftAsync(DbContextOptions<ApplicationDbContext> options, string actor)
    {
        await using var db = new ApplicationDbContext(options); var result = await Service(db).OpenAsync(new(0m, 0m), actor); Assert.Null(result.Error); return result.Value!.Shifts.Single(x => x.Status == ShiftStatus.ACTIVE).Id;
    }
    private static async Task<(Guid PurchaseId, Guid ItemId)> SeedPurchaseAsync(DbContextOptions<ApplicationDbContext> options, string actor, Guid unit, Guid product, decimal quantity)
    {
        await using var db = new ApplicationDbContext(options); var supplier = new Supplier { Name = "supplier" + Guid.NewGuid().ToString("N"), PhoneNumber = "1", CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor, UpdatedByUserId = actor }; db.Suppliers.Add(supplier); await db.SaveChangesAsync(); var purchase = new Purchase { SupplierId = supplier.Id, PurchaseDate = new TestClock().BusinessDate, CreatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor }; purchase.Items.Add(new() { ProductId = product, Quantity = quantity, UnitId = unit, UnitCost = 1m, LineTotal = quantity }); purchase.Total = quantity; db.Purchases.Add(purchase); await db.SaveChangesAsync(); return (purchase.Id, purchase.Items.Single().Id);
    }
        private static Task<decimal> Balance(ApplicationDbContext db, Guid product) => db.InventoryBalances.Where(x => x.ProductId == product).Select(x => x.Quantity).SingleAsync();
        private sealed class DrainBeforeBatchWriter(DbContextOptions<ApplicationDbContext> options, Guid productId, string actor, IInventoryWriter inner) : IInventoryWriter
        {
            private bool drained;
            public Task<(InventoryMovementDto? Value, string? Error)> WriteAsync(InventoryWriteCommand command, CancellationToken ct = default) => inner.WriteAsync(command, ct);
            public async Task<(InventoryBatchResult? Value, string? Error)> WriteBatchAsync(IReadOnlyList<InventoryWriteCommand> commands, bool allowNegative, CancellationToken ct = default)
            {
                if (!drained) { drained = true; await using var concurrent = new ApplicationDbContext(options); var result = await new InventoryService(concurrent).RecordManualAsync(new(productId, InventoryMovementType.WRITE_OFF, 1m, "precheck race"), actor, ct); Assert.Null(result.Error); }
                return await inner.WriteBatchAsync(commands, allowNegative, ct);
            }
        }
        private sealed class FixedClock(DateOnly businessDate) : IBusinessClock { public DateTimeOffset UtcNow => new(businessDate.ToDateTime(new TimeOnly(12, 0)), TimeSpan.Zero); public DateOnly BusinessDate => businessDate; public string TimeZoneId => "America/La_Paz"; }
        private sealed class TestClock : IBusinessClock { public DateTimeOffset UtcNow => DateTimeOffset.UtcNow; public DateOnly BusinessDate => DateOnly.FromDateTime(UtcNow.UtcDateTime); public string TimeZoneId => "America/La_Paz"; }
}
