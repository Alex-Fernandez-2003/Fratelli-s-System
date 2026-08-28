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
    public async Task Concurrent_handover_completes_source_once_and_leaves_exactly_one_active_shift()
    {
        var (options, actor, _) = await NewDatabaseAsync("handover_handover"); var source = await OpenShiftAsync(options, actor);
        var results = await Race(options, x => x.HandoverAsync(source, new("handover"), actor));
        Assert.Single(results, x => x.Error is null); Assert.Single(results, x => x.Error == "INVALID_SHIFT_TRANSITION");
        await using var db = new ApplicationDbContext(options); var shifts = await db.Shifts.ToListAsync(); Assert.Equal(ShiftStatus.COMPLETED, shifts.Single(x => x.Id == source).Status); Assert.Single(shifts, x => x.Status == ShiftStatus.ACTIVE); Assert.Equal(2, shifts.Count);
    }

    private static readonly IReadOnlySet<string> AdminRoles = new HashSet<string> { "ADMINISTRADOR" };
    private static OperationsService Service(ApplicationDbContext db) => new(db, new InventoryService(db), new TestClock());
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
    private static async Task<Guid> SeedDeliveredOrderAsync(DbContextOptions<ApplicationDbContext> options, string actor, Guid product, decimal quantity)
    {
        await using var db = new ApplicationDbContext(options); var order = new Order { Status = OrderStatus.ENTREGADO, CreatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor }; order.Items.Add(new() { ProductId = product, Quantity = quantity, UnitPrice = 2m, CreatedAt = DateTimeOffset.UtcNow }); db.Orders.Add(order); await db.SaveChangesAsync(); return order.Id;
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
    private sealed class TestClock : IBusinessClock { public DateTimeOffset UtcNow => DateTimeOffset.UtcNow; public DateOnly BusinessDate => DateOnly.FromDateTime(UtcNow.UtcDateTime); public string TimeZoneId => "America/La_Paz"; }
}
