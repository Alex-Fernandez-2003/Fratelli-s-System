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
using RestaurantSystem.Application.Expenses;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Inventory;
using RestaurantSystem.Infrastructure.Operations;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class OperationsConcurrencyPostgresIntegrationTests(PostgresFixture postgres)
{
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
            foreach (var request in new[] { (SalesChannel.DIRECT, PaymentMethod.CASH), (SalesChannel.DIRECT, PaymentMethod.QR), (SalesChannel.PEDIDOSYA, PaymentMethod.EXTERNAL) })
            {
                var orderId = await SeedDeliveredOrderAsync(options, actor, product, 1m);
                await using var saleDb = new ApplicationDbContext(options);
                var confirmed = await Service(saleDb).ConfirmSaleAsync(new(orderId, request.Item1, request.Item2), actor);
                Assert.Null(confirmed.Error); Assert.Equal(request.Item1, confirmed.Value!.SalesChannel); Assert.Equal(request.Item2, confirmed.Value.PaymentMethod);
                Assert.Equal(2m, confirmed.Value.Subtotal); Assert.Equal(2m, confirmed.Value.Total); Assert.Equal(actor, confirmed.Value.ConfirmedByUserId); Assert.NotEqual(default, confirmed.Value.ConfirmedAt); Assert.Equal(shift, confirmed.Value.ShiftId);
            }
            foreach (var request in new[] { (SalesChannel.DIRECT, PaymentMethod.EXTERNAL), (SalesChannel.PEDIDOSYA, PaymentMethod.CASH), (SalesChannel.PEDIDOSYA, PaymentMethod.QR) })
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
                Assert.Equal(4, await verify.Sales.CountAsync()); Assert.Equal(4, await verify.InventoryMovements.CountAsync(x => x.ReferenceType == InventoryReferenceType.SALE));
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

        [Fact]
        public async Task Concurrent_handover_completes_source_once_and_leaves_exactly_one_active_shift()
    {
        var (options, actor, _) = await NewDatabaseAsync("handover_handover"); var source = await OpenShiftAsync(options, actor);
        var results = await Race(options, x => x.HandoverAsync(source, new("handover"), actor));
        Assert.Single(results, x => x.Error is null); Assert.Single(results, x => x.Error == "INVALID_SHIFT_TRANSITION");
        await using var db = new ApplicationDbContext(options); var shifts = await db.Shifts.ToListAsync(); Assert.Equal(ShiftStatus.COMPLETED, shifts.Single(x => x.Id == source).Status); Assert.Single(shifts, x => x.Status == ShiftStatus.ACTIVE); Assert.Equal(2, shifts.Count);
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
        await using var db = new ApplicationDbContext(options); var result = await Service(db).OpenAsync(actor); Assert.Null(result.Error); return result.Value!.Shifts.Single(x => x.Status == ShiftStatus.ACTIVE).Id;
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
