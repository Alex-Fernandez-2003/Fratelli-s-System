using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Npgsql;
using RestaurantSystem.Application.Expenses;
using RestaurantSystem.Application.Inventory;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Expenses;
using RestaurantSystem.Domain.Inventory;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Attendance;
using RestaurantSystem.Infrastructure.Expenses;
using RestaurantSystem.Infrastructure.Inventory;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class InventoryExpensesPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Inventory_and_expense_contracts_use_real_postgresql()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "inventory_expenses_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs);
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); using var client = factory.CreateClient(); await client.GetAsync("/health");
        var admin = await Token(client, "admin.test"); var manager = await Token(client, "encargado.test"); var waiter = await Token(client, "mesero.test"); var accountant = await Token(client, "contadora.test");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options; Guid productId; Guid inactiveId; Guid categoryId;
        await using (var db = new ApplicationDbContext(options))
        {
            var unit = await db.Units.FirstAsync(); var actor = (await db.Users.SingleAsync(x => x.UserName == "admin.test")).Id;
            productId = Product(db, unit.Id, actor, "Inventory product", 5, true); inactiveId = Product(db, unit.Id, actor, "Inactive product", 5, false);
            var category = new ExpenseCategory { Name = "Approved category", CreatedAt = DateTimeOffset.UtcNow }; db.ExpenseCategories.Add(category); categoryId = category.Id; await db.SaveChangesAsync();
        }
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/inventory/balances")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/inventory/balances", waiter)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/inventory/balances", accountant)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Get, "/api/v1/inventory/movements", waiter)).StatusCode);
        var entry = await Send(client, HttpMethod.Post, "/api/v1/inventory/movements", manager, new { productId, type = "ENTRY", quantity = 10m, reason = " received " }); Assert.Equal(HttpStatusCode.Created, entry.StatusCode);
        var writeoff = await Send(client, HttpMethod.Post, "/api/v1/inventory/movements", admin, new { productId, type = "WRITE_OFF", quantity = 13m, reason = "waste" }); Assert.Equal(HttpStatusCode.Created, writeoff.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Post, "/api/v1/inventory/movements", admin, new { productId, type = "SALE", quantity = 1m, reason = "x" })).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await Send(client, HttpMethod.Post, "/api/v1/inventory/movements", admin, new { productId = inactiveId, type = "ENTRY", quantity = 1m, reason = "x" })).StatusCode);
        var balances = await (await Send(client, HttpMethod.Get, "/api/v1/inventory/balances", admin)).Content.ReadFromJsonAsync<JsonElement>(); var item = balances.GetProperty("items").EnumerateArray().Single(x => x.GetProperty("productId").GetGuid() == productId); Assert.Equal(-3m, item.GetProperty("currentQuantity").GetDecimal()); Assert.True(item.GetProperty("isLowStock").GetBoolean());
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/expense-categories", admin)).StatusCode);
        var expense = new { expenseCategoryId = categoryId, amount = 12.5m, cashSource = "PETTY_CASH", description = " supplies ", expenseDate = DateOnly.FromDateTime(DateTimeOffset.UtcNow.ToOffset(TimeSpan.FromHours(-3)).DateTime).ToString("yyyy-MM-dd") };
        Assert.Equal(HttpStatusCode.Created, (await Send(client, HttpMethod.Post, "/api/v1/expenses", manager, expense)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, "/api/v1/expenses", accountant, expense)).StatusCode);
        await using var check = new ApplicationDbContext(options); Assert.Equal(-3m, await check.InventoryBalances.Where(x => x.ProductId == productId).Select(x => x.Quantity).SingleAsync()); Assert.Equal(2, await check.InventoryMovements.CountAsync(x => x.ProductId == productId)); Assert.Single(await check.Expenses.ToListAsync());
    }

    [Fact]
    public async Task Inventory_summary_uses_active_universe_and_includes_negative_stock()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "inventory_summary_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs);
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); using var client = factory.CreateClient();
        var tokens = new Dictionary<string, string>();
        foreach (var role in new[] { "admin", "encargado", "mesero", "cocina", "contadora", "empleado" }) tokens[role] = await Token(client, role + ".test");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options;
        Guid negative;
        await using (var db = new ApplicationDbContext(options))
        {
            var unit = await db.Units.FirstAsync(); var actor = (await db.Users.SingleAsync(x => x.UserName == "admin.test")).Id;
            Product(db, unit.Id, actor, "Normal", 5, true); Product(db, unit.Id, actor, "Below", 5, true); Product(db, unit.Id, actor, "Equal", 5, true);
            negative = Product(db, unit.Id, actor, "Negative no minimum", null, true); Product(db, unit.Id, actor, "No balance", null, true); Product(db, unit.Id, actor, "Inactive", 5, false);
            await db.SaveChangesAsync();
            var products = await db.Products.Where(x => x.IsActive).OrderBy(x => x.Name).ToListAsync();
            db.InventoryBalances.AddRange(
                new InventoryBalance { ProductId = products.Single(x => x.Name == "Normal").Id, Quantity = 6, UpdatedAt = DateTimeOffset.UtcNow },
                new InventoryBalance { ProductId = products.Single(x => x.Name == "Below").Id, Quantity = 4, UpdatedAt = DateTimeOffset.UtcNow },
                new InventoryBalance { ProductId = products.Single(x => x.Name == "Equal").Id, Quantity = 5, UpdatedAt = DateTimeOffset.UtcNow },
                new InventoryBalance { ProductId = negative, Quantity = -2.3m, UpdatedAt = DateTimeOffset.UtcNow });
            await db.SaveChangesAsync();
        }
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/inventory/summary")).StatusCode);
        foreach (var role in new[] { "admin", "encargado", "mesero", "cocina", "contadora" }) Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/inventory/summary", tokens[role])).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Get, "/api/v1/inventory/summary", tokens["empleado"])).StatusCode);
        var json = await (await Send(client, HttpMethod.Get, "/api/v1/inventory/summary", tokens["admin"])).Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(5, json.GetProperty("totalProducts").GetInt32()); Assert.Equal(3, json.GetProperty("lowStockCount").GetInt32()); Assert.Equal(1, json.GetProperty("negativeStockCount").GetInt32()); Assert.Equal(2, json.GetProperty("normalStockCount").GetInt32());
        var lowItems = json.GetProperty("lowStockItems").EnumerateArray().ToArray(); Assert.Equal(3, lowItems.Length);
        var negativeItem = lowItems.Single(x => x.GetProperty("productId").GetGuid() == negative); Assert.Equal(-2.3m, negativeItem.GetProperty("currentQuantity").GetDecimal()); Assert.True(negativeItem.GetProperty("isLowStock").GetBoolean());
        await using var check = new ApplicationDbContext(options); Assert.Equal(-2.3m, await check.InventoryBalances.Where(x => x.ProductId == negative).Select(x => x.Quantity).SingleAsync());
    }

    [Fact]
    public async Task Concurrent_first_writes_serialize_and_preserve_algebra()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "inventory_race_" + Guid.NewGuid().ToString("N") }.ConnectionString; await postgres.MigrateAsync(cs);
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options; Guid productId; const string actor = "actor";
        await using (var db = new ApplicationDbContext(options)) { db.Users.Add(new Microsoft.AspNetCore.Identity.IdentityUser { Id = actor, UserName = actor, NormalizedUserName = actor.ToUpperInvariant() }); await db.SaveChangesAsync(); productId = Product(db, (await db.Units.FirstAsync()).Id, actor, "Race", null, true); await db.SaveChangesAsync(); }
        await using var first = new ApplicationDbContext(options); await using var second = new ApplicationDbContext(options);
        var a = new InventoryService(first).RecordManualAsync(new(productId, InventoryMovementType.ENTRY, 4, "a"), actor);
        var b = new InventoryService(second).RecordManualAsync(new(productId, InventoryMovementType.WRITE_OFF, 7, "b"), actor);
        var result = await Task.WhenAll(a, b); Assert.All(result, x => Assert.Null(x.Error));
        await using var verify = new ApplicationDbContext(options); Assert.Single(await verify.InventoryBalances.Where(x => x.ProductId == productId).ToListAsync()); Assert.Equal(2, await verify.InventoryMovements.CountAsync(x => x.ProductId == productId)); Assert.Equal(-3m, await verify.InventoryBalances.Where(x => x.ProductId == productId).Select(x => x.Quantity).SingleAsync());
    }

    private static Guid Product(ApplicationDbContext db, Guid unit, string actor, string name, decimal? minStock, bool active) { var p = new Product { Name = name, ProductType = ProductType.INGREDIENT, InventoryUnitId = unit, MinStock = minStock, IsActive = active, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow, CreatedByUserId = actor, UpdatedByUserId = actor }; db.Products.Add(p); return p.Id; }
    private static async Task<string> Token(HttpClient c, string username) => (await (await c.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" })).Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
    private static Task<HttpResponseMessage> Send(HttpClient c, HttpMethod method, string path, string? token = null, object? body = null) { var request = new HttpRequestMessage(method, path); if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body is not null) request.Content = JsonContent.Create(body); return c.SendAsync(request); }
}
