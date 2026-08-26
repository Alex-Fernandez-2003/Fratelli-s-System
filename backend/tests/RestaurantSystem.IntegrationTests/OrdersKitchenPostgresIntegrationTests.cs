using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Npgsql;
using RestaurantSystem.Application.Orders;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Orders;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Orders;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class OrdersKitchenPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Orders_kitchen_lifecycle_authorization_and_constraints_use_real_postgresql()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "orders_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs);
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); using var client = factory.CreateClient(); await client.GetAsync("/health");
        var mesero = await Token(client, "mesero.test"); var admin = await Token(client, "admin.test"); var kitchen = await Token(client, "cocina.test"); var accountant = await Token(client, "contadora.test");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options;
        Guid kitchenProduct; Guid barProduct; Guid noneProduct;
        await using (var db = new ApplicationDbContext(options))
        {
            var unit = await db.Units.FirstAsync(); var actor = (await db.Users.SingleAsync(x => x.UserName == "admin.test")).Id;
            kitchenProduct = AddProduct(db, unit.Id, actor, "Kitchen", "KITCHEN", 20); barProduct = AddProduct(db, unit.Id, actor, "Bar", "BAR", 8); noneProduct = AddProduct(db, unit.Id, actor, "None", "NONE", 5); await db.SaveChangesAsync();
        }
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/orders", new { })).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, "/api/v1/orders", accountant, new { items = new[] { new { productId = kitchenProduct, quantity = 1m } } })).StatusCode);
        var created = await Send(client, HttpMethod.Post, "/api/v1/orders", mesero, new { tableReference = "A1", items = new[] { new { productId = kitchenProduct, quantity = 2m }, new { productId = barProduct, quantity = 1m }, new { productId = noneProduct, quantity = 1m } } });
        Assert.Equal(HttpStatusCode.Created, created.StatusCode); var order = await created.Content.ReadFromJsonAsync<JsonElement>(); var orderId = order.GetProperty("id").GetGuid(); Assert.Equal("PENDIENTE", order.GetProperty("status").GetString()); Assert.Equal(53m, order.GetProperty("total").GetDecimal()); Assert.True(order.GetProperty("waiterEmployeeId").GetGuid() != Guid.Empty); var commandId = order.GetProperty("kitchenCommandId").GetGuid();
        var command = await Send(client, HttpMethod.Get, $"/api/v1/kitchen/commands/{commandId}", mesero); Assert.Equal(HttpStatusCode.OK, command.StatusCode); var commandJson = await command.Content.ReadFromJsonAsync<JsonElement>(); Assert.Single(commandJson.GetProperty("items").EnumerateArray()); Assert.False(commandJson.TryGetProperty("total", out _)); Assert.False(commandJson.TryGetProperty("unitPrice", out _));
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, $"/api/v1/kitchen/commands/{commandId}/start", mesero)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await Send(client, HttpMethod.Post, $"/api/v1/kitchen/commands/{commandId}/ready", kitchen)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Post, $"/api/v1/kitchen/commands/{commandId}/start", kitchen)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Post, $"/api/v1/kitchen/commands/{commandId}/ready", kitchen)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Post, $"/api/v1/orders/{orderId}/deliver", mesero)).StatusCode);
        var noKitchen = await Send(client, HttpMethod.Post, "/api/v1/orders", admin, new { items = new[] { new { productId = barProduct, quantity = 1m } } }); Assert.Equal(HttpStatusCode.Created, noKitchen.StatusCode); var noKitchenBody = await noKitchen.Content.ReadFromJsonAsync<JsonElement>(); Assert.Equal("LISTO", noKitchenBody.GetProperty("status").GetString()); Assert.Equal(JsonValueKind.Null, noKitchenBody.GetProperty("kitchenCommandId").ValueKind);
        var duplicate = await Send(client, HttpMethod.Post, "/api/v1/orders", admin, new { items = new[] { new { productId = barProduct, quantity = 1m }, new { productId = barProduct, quantity = 1m } } }); Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
        await using var verify = new ApplicationDbContext(options); Assert.Equal(OrderStatus.ENTREGADO, (await verify.Orders.SingleAsync(x => x.Id == orderId)).Status); Assert.Equal(KitchenCommandStatus.LISTA, (await verify.KitchenCommands.SingleAsync(x => x.Id == commandId)).Status);
    }
    [Fact]
    public async Task Notifier_failure_after_commit_preserves_order_state()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "notifier_" + Guid.NewGuid().ToString("N") }.ConnectionString; await postgres.MigrateAsync(cs); var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options;
        await using var db = new ApplicationDbContext(options); var unit = await db.Units.FirstAsync(); var user = "actor"; db.Users.Add(new Microsoft.AspNetCore.Identity.IdentityUser { Id = user, UserName = user, NormalizedUserName = user.ToUpperInvariant() }); await db.SaveChangesAsync(); db.Employees.Add(new RestaurantSystem.Domain.Identity.Employee { UserId = user, FullName = "Actor" }); var product = AddProduct(db, unit.Id, user, "K", "KITCHEN", 1); await db.SaveChangesAsync();
        var service = new OrderService(db, new ThrowingNotifier(), NullLogger<OrderService>.Instance); var result = await service.CreateAsync(new(null, null, [new(product, 1, null)]), new(user, new HashSet<string> { "ENCARGADO" })); Assert.Null(result.Error); Assert.True(await db.Orders.AnyAsync()); Assert.True(await db.KitchenCommands.AnyAsync());
    }
    [Fact]
    public async Task Openapi_exposes_orders_and_kitchen_contracts()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "openapi_" + Guid.NewGuid().ToString("N") }.ConnectionString; await postgres.MigrateAsync(cs); await using var factory = new AuthWebApplicationFactory(cs, "Development"); using var client = factory.CreateClient(); var document = await client.GetFromJsonAsync<JsonElement>("/openapi/v1.json"); var paths = document.GetProperty("paths"); Assert.True(paths.TryGetProperty("/api/v1/orders", out var orders)); Assert.True(orders.TryGetProperty("post", out _)); Assert.True(paths.TryGetProperty("/api/v1/kitchen/commands/{id}/ready", out var ready)); Assert.True(ready.TryGetProperty("post", out var readyPost)); Assert.True(readyPost.GetProperty("responses").TryGetProperty("409", out _));
    }
    [Fact]
    public async Task Kitchen_hub_requires_authentication_and_accepts_only_operational_roles()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "hub_" + Guid.NewGuid().ToString("N") }.ConnectionString; await postgres.MigrateAsync(cs); await using var factory = new AuthWebApplicationFactory(cs, "Development"); using var client = factory.CreateClient(); await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsync("/hubs/kitchen/negotiate?negotiateVersion=1", null)).StatusCode);
        foreach (var name in new[] { "admin.test", "encargado.test", "mesero.test", "cocina.test" }) Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Post, "/hubs/kitchen/negotiate?negotiateVersion=1", await Token(client, name))).StatusCode);
        foreach (var name in new[] { "contadora.test", "empleado.test" }) Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, "/hubs/kitchen/negotiate?negotiateVersion=1", await Token(client, name))).StatusCode);
    }
    [Fact]
    public async Task Migration_creates_required_orders_kitchen_constraints_and_indexes()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "schema_" + Guid.NewGuid().ToString("N") }.ConnectionString; await postgres.MigrateAsync(cs); await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options);
        var constraints = await db.Database.SqlQuery<string>($"SELECT conname AS \"Value\" FROM pg_constraint WHERE conname IN ('CK_orders_status','CK_kitchen_commands_status','CK_order_items_quantity','CK_order_items_unit_price')").ToListAsync(); Assert.Equal(4, constraints.Count);
        var indexes = await db.Database.SqlQuery<string>($"SELECT indexname AS \"Value\" FROM pg_indexes WHERE schemaname='public' AND tablename IN ('orders','order_items','kitchen_commands','kitchen_command_items')").ToListAsync(); Assert.Contains("IX_orders_status", indexes); Assert.Contains("IX_kitchen_commands_order_id", indexes);
    }
    [Fact]
    public async Task Concurrent_waiter_take_uses_postgresql_row_lock_and_has_exactly_one_winner()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "take_race_" + Guid.NewGuid().ToString("N") }.ConnectionString; await postgres.MigrateAsync(cs); var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options;
        var (orderId, firstUser, secondUser) = await SeedRaceOrder(options, OrderStatus.LISTO, false);
        await using var firstDb = new ApplicationDbContext(options); await using var secondDb = new ApplicationDbContext(options);
        var first = new OrderService(firstDb, new SilentNotifier(), NullLogger<OrderService>.Instance); var second = new OrderService(secondDb, new SilentNotifier(), NullLogger<OrderService>.Instance);
        var firstTask = first.TakeAsync(orderId, new(firstUser, new HashSet<string> { "MESERO" })); var secondTask = second.TakeAsync(orderId, new(secondUser, new HashSet<string> { "MESERO" })); var results = await Task.WhenAll(firstTask, secondTask);
        Assert.Single(results, x => x.Error is null); Assert.Single(results, x => x.Error == "ORDER_ALREADY_ASSIGNED"); await using var verify = new ApplicationDbContext(options); var persisted = await verify.Orders.SingleAsync(x => x.Id == orderId); var eligible = await verify.Employees.Where(x => x.UserId == firstUser || x.UserId == secondUser).Select(x => x.Id).ToListAsync(); Assert.Contains(persisted.WaiterEmployeeId!.Value, eligible);
    }
    [Fact]
    public async Task Ready_and_cancel_race_persists_only_a_coherent_order_command_pair()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "pair_race_" + Guid.NewGuid().ToString("N") }.ConnectionString; await postgres.MigrateAsync(cs); var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options;
        var (orderId, actor, _) = await SeedRaceOrder(options, OrderStatus.EN_PREPARACION, true); await using var lookup = new ApplicationDbContext(options); var commandId = await lookup.KitchenCommands.Where(x => x.OrderId == orderId).Select(x => x.Id).SingleAsync();
        await using var readyDb = new ApplicationDbContext(options); await using var cancelDb = new ApplicationDbContext(options); var ready = new KitchenCommandService(readyDb, new SilentNotifier(), NullLogger<KitchenCommandService>.Instance); var cancel = new OrderService(cancelDb, new SilentNotifier(), NullLogger<OrderService>.Instance);
        var readyTask = ready.ReadyAsync(commandId, new(actor, new HashSet<string> { "COCINA" })); var cancelTask = cancel.CancelAsync(orderId, new("race"), new(actor, new HashSet<string> { "ENCARGADO" })); await Task.WhenAll(readyTask, cancelTask); var readyResult = await readyTask; var cancelResult = await cancelTask; var results = new[] { new { Error = readyResult.Error }, new { Error = cancelResult.Error } };
        Assert.Single(results, x => x.Error is null); await using var verify = new ApplicationDbContext(options); var order = await verify.Orders.SingleAsync(x => x.Id == orderId); var command = await verify.KitchenCommands.SingleAsync(x => x.OrderId == orderId); Assert.True((order.Status == OrderStatus.LISTO && command.Status == KitchenCommandStatus.LISTA) || (order.Status == OrderStatus.CANCELADO && command.Status == KitchenCommandStatus.CANCELADA));
    }
    [Fact]
    public async Task Start_cancel_and_double_delivery_remain_serialized_and_idempotent()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "remaining_races_" + Guid.NewGuid().ToString("N") }.ConnectionString; await postgres.MigrateAsync(cs); var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options;
        var (orderId, actor, _) = await SeedRaceOrder(options, OrderStatus.PENDIENTE, true); await using var lookup = new ApplicationDbContext(options); var commandId = await lookup.KitchenCommands.Where(x => x.OrderId == orderId).Select(x => x.Id).SingleAsync();
        await using var startDb = new ApplicationDbContext(options); await using var cancelDb = new ApplicationDbContext(options); var start = new KitchenCommandService(startDb, new SilentNotifier(), NullLogger<KitchenCommandService>.Instance); var cancel = new OrderService(cancelDb, new SilentNotifier(), NullLogger<OrderService>.Instance); var startTask = start.StartAsync(commandId, new(actor, new HashSet<string> { "COCINA" })); var cancelTask = cancel.CancelAsync(orderId, new(null), new(actor, new HashSet<string> { "ENCARGADO" })); await Task.WhenAll(startTask, cancelTask);
        await using var verify = new ApplicationDbContext(options); var finalOrder = await verify.Orders.SingleAsync(x => x.Id == orderId); var finalCommand = await verify.KitchenCommands.SingleAsync(x => x.OrderId == orderId); Assert.True((finalOrder.Status == OrderStatus.EN_PREPARACION && finalCommand.Status == KitchenCommandStatus.EN_PREPARACION) || (finalOrder.Status == OrderStatus.CANCELADO && finalCommand.Status == KitchenCommandStatus.CANCELADA));
        var delivery = new Order { Status = OrderStatus.LISTO, CreatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor, WaiterEmployeeId = await verify.Employees.Where(x => x.UserId == actor).Select(x => (Guid?)x.Id).SingleAsync() }; verify.Orders.Add(delivery); await verify.SaveChangesAsync(); await using var d1 = new ApplicationDbContext(options); await using var d2 = new ApplicationDbContext(options); var service1 = new OrderService(d1, new SilentNotifier(), NullLogger<OrderService>.Instance); var service2 = new OrderService(d2, new SilentNotifier(), NullLogger<OrderService>.Instance); var actorModel = new OrderActor(actor, new HashSet<string> { "MESERO" }); var deliveries = await Task.WhenAll(service1.DeliverAsync(delivery.Id, actorModel), service2.DeliverAsync(delivery.Id, actorModel)); Assert.All(deliveries, x => Assert.Null(x.Error));
    }
    private static async Task<(Guid OrderId, string FirstUser, string SecondUser)> SeedRaceOrder(DbContextOptions<ApplicationDbContext> options, OrderStatus status, bool command)
    {
        await using var db = new ApplicationDbContext(options); var first = "waiter-a-" + Guid.NewGuid().ToString("N"); var second = "waiter-b-" + Guid.NewGuid().ToString("N"); foreach (var id in new[] { first, second }) db.Users.Add(new Microsoft.AspNetCore.Identity.IdentityUser { Id = id, UserName = id, NormalizedUserName = id.ToUpperInvariant() }); await db.SaveChangesAsync(); db.Employees.Add(new RestaurantSystem.Domain.Identity.Employee { UserId = first, FullName = first }); db.Employees.Add(new RestaurantSystem.Domain.Identity.Employee { UserId = second, FullName = second }); var order = new Order { Status = status, CreatedAt = DateTimeOffset.UtcNow, CreatedByUserId = first }; db.Orders.Add(order); if (command) db.KitchenCommands.Add(new KitchenCommand { Order = order, Status = KitchenCommandStatus.EN_PREPARACION, CreatedAt = DateTimeOffset.UtcNow }); await db.SaveChangesAsync(); return (order.Id, first, second);
    }
    private sealed class SilentNotifier : IKitchenRealtimeNotifier { public Task CreatedAsync(KitchenRealtimeEvent v, CancellationToken ct = default) => Task.CompletedTask; public Task UpdatedAsync(KitchenRealtimeEvent v, CancellationToken ct = default) => Task.CompletedTask; public Task CancelledAsync(KitchenRealtimeEvent v, CancellationToken ct = default) => Task.CompletedTask; }
    private static Guid AddProduct(ApplicationDbContext db, Guid unitId, string actor, string name, string area, decimal price) { var product = new Product { Name = name, ProductType = ProductType.SALE_ITEM, InventoryUnitId = unitId, PreparationArea = area, SalePrice = price, IsSellable = true, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor, UpdatedByUserId = actor }; db.Products.Add(product); return product.Id; }
    private static async Task<string> Token(HttpClient c, string username) => (await (await c.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" })).Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
    private static Task<HttpResponseMessage> Send(HttpClient c, HttpMethod method, string path, string? token = null, object? body = null) { var request = new HttpRequestMessage(method, path); if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body is not null) request.Content = JsonContent.Create(body); return c.SendAsync(request); }
    private sealed class ThrowingNotifier : IKitchenRealtimeNotifier { public Task CreatedAsync(KitchenRealtimeEvent v, CancellationToken ct = default) => Task.FromException(new InvalidOperationException()); public Task UpdatedAsync(KitchenRealtimeEvent v, CancellationToken ct = default) => Task.FromException(new InvalidOperationException()); public Task CancelledAsync(KitchenRealtimeEvent v, CancellationToken ct = default) => Task.FromException(new InvalidOperationException()); }
}
