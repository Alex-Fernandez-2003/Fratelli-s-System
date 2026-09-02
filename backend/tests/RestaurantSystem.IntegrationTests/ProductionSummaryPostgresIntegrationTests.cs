using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Application.Operations;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Operations;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Inventory;
using RestaurantSystem.Infrastructure.Operations;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class ProductionSummaryPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Summary_counts_events_applies_filters_and_uses_frequency_not_physical_quantity()
    {
        var (options, volumeUnit, massUnit) = await NewDatabaseAsync("production_summary_semantics");
        var first = new Product { Id = Guid.Parse("00000000-0000-0000-0000-000000000101"), Name = "Preparation A", ProductType = ProductType.PREPARATION, InventoryUnitId = volumeUnit, CreatedByUserId = "summary-a", UpdatedByUserId = "summary-a" };
        var second = new Product { Id = Guid.Parse("00000000-0000-0000-0000-000000000102"), Name = "Preparation B", ProductType = ProductType.PREPARATION, InventoryUnitId = massUnit, CreatedByUserId = "summary-b", UpdatedByUserId = "summary-b" };
        var oldest = new DateTimeOffset(2026, 1, 1, 12, 0, 0, TimeSpan.Zero);
        var newest = oldest.AddDays(3);
        await using (var seed = new ApplicationDbContext(options))
        {
            seed.Products.AddRange(first, second);
            seed.Productions.AddRange(
                Production("A-001", first.Id, 1000m, oldest, "summary-a"),
                Production("A-002", first.Id, 0.001m, oldest.AddDays(1), "summary-a"),
                Production("A-003", first.Id, 2m, oldest.AddDays(2), "summary-a"),
                Production("B-001", second.Id, 20m, newest, "summary-b"));
            await seed.SaveChangesAsync();
        }

        await using var db = new ApplicationDbContext(options);
        var summary = await Service(db).ProductionSummaryAsync(null, null, null, null, null, null);

        Assert.Equal(4, summary.ProductionCount);
        Assert.NotNull(summary.LatestProduction);
        Assert.Equal("B-001", summary.LatestProduction!.BatchCode);
        Assert.Equal(second.Id, summary.LatestProduction.ProductId);
        Assert.Equal("Preparation B", summary.LatestProduction.ProductName);
        Assert.Equal(newest, summary.LatestProduction.ProducedAt);
        Assert.NotNull(summary.MostProducedPreparation);
        Assert.Equal(first.Id, summary.MostProducedPreparation!.ProductId);
        Assert.Equal(3, summary.MostProducedPreparation.ProductionCount);
        Assert.DoesNotContain("Quantity", typeof(ProductionSummaryDto).GetProperties().Select(x => x.Name), StringComparer.OrdinalIgnoreCase);

        var statusFiltered = await Service(db).ProductionSummaryAsync(null, null, ProductionStatus.COMPLETED, null, null, null);
        Assert.Equal(4, statusFiltered.ProductionCount);
        var productFiltered = await Service(db).ProductionSummaryAsync(first.Id, null, null, null, null, null);
        Assert.Equal(3, productFiltered.ProductionCount);
        var batchFiltered = await Service(db).ProductionSummaryAsync(null, "a-002", null, null, null, null);
        Assert.Equal(1, batchFiltered.ProductionCount);
        var responsibleFiltered = await Service(db).ProductionSummaryAsync(null, null, null, "summary-b", null, null);
        Assert.Equal(1, responsibleFiltered.ProductionCount);
        var dateFiltered = await Service(db).ProductionSummaryAsync(null, null, null, null, oldest.AddDays(1), oldest.AddDays(2));
        Assert.Equal(2, dateFiltered.ProductionCount);
        var mixedUnitFiltered = await Service(db).ProductionSummaryAsync(null, null, null, null, oldest.AddDays(2), newest);
        Assert.Equal(2, mixedUnitFiltered.ProductionCount);
    }

    [Fact]
    public async Task Summary_uses_deterministic_product_id_tie_break_and_returns_empty_cards_as_null()
    {
        var (options, volumeUnit, _) = await NewDatabaseAsync("production_summary_ties");
        var first = new Product { Id = Guid.Parse("00000000-0000-0000-0000-000000000201"), Name = "First preparation", ProductType = ProductType.PREPARATION, InventoryUnitId = volumeUnit, CreatedByUserId = "summary", UpdatedByUserId = "summary" };
        var second = new Product { Id = Guid.Parse("00000000-0000-0000-0000-000000000202"), Name = "Second preparation", ProductType = ProductType.PREPARATION, InventoryUnitId = volumeUnit, CreatedByUserId = "summary", UpdatedByUserId = "summary" };
        var producedAt = new DateTimeOffset(2026, 2, 1, 12, 0, 0, TimeSpan.Zero);
        await using (var seed = new ApplicationDbContext(options))
        {
            seed.Products.AddRange(first, second);
            seed.Productions.AddRange(
                Production("FIRST-001", first.Id, 1m, producedAt, "summary"),
                Production("FIRST-002", first.Id, 1m, producedAt.AddDays(-1), "summary"),
                Production("SECOND-001", second.Id, 1m, producedAt, "summary"),
                Production("SECOND-002", second.Id, 1m, producedAt.AddDays(-1), "summary"));
            await seed.SaveChangesAsync();
        }

        await using var db = new ApplicationDbContext(options);
        var summary = await Service(db).ProductionSummaryAsync(null, null, null, null, null, null);
        Assert.Equal(4, summary.ProductionCount);
        Assert.Equal(first.Id, summary.MostProducedPreparation!.ProductId);

        var empty = await Service(db).ProductionSummaryAsync(null, "does-not-match", null, null, null, null);
        Assert.Equal(0, empty.ProductionCount);
        Assert.Null(empty.LatestProduction);
        Assert.Null(empty.MostProducedPreparation);
    }

    [Fact]
    public async Task Summary_endpoint_reuses_production_history_policy_and_has_no_inventory_side_effects()
    {
        var connectionString = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "production_summary_api_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(connectionString);
        await using var factory = new AuthWebApplicationFactory(connectionString, "Development");
        using var client = factory.CreateClient();
        var openApi = await client.GetFromJsonAsync<JsonElement>("/openapi/v1.json");
        var operation = openApi.GetProperty("paths").GetProperty("/api/v1/productions/summary").GetProperty("get");
        Assert.DoesNotContain(operation.GetProperty("parameters").EnumerateArray(), parameter => parameter.GetProperty("name").GetString() is "page" or "pageSize");

        var before = await CountInventoryMovements(connectionString);
        var tokens = new Dictionary<string, string>();
        foreach (var username in new[] { "admin.test", "encargado.test", "cocina.test", "contadora.test", "mesero.test", "empleado.test" }) tokens[username] = await Token(client, username);
        foreach (var username in new[] { "admin.test", "encargado.test", "cocina.test", "contadora.test" })
        {
            var response = await Send(client, $"/api/v1/productions/summary?from=2026-01-01T00:00:00Z&to=2026-01-31T23:59:59Z", tokens[username]);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
        foreach (var username in new[] { "mesero.test", "empleado.test" })
        {
            var response = await Send(client, "/api/v1/productions/summary", tokens[username]);
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/productions/summary")).StatusCode);
        Assert.Equal(before, await CountInventoryMovements(connectionString));
    }

    private static Production Production(string batchCode, Guid productId, decimal quantity, DateTimeOffset producedAt, string actor) => new() { BatchCode = batchCode, Status = ProductionStatus.COMPLETED, ProductId = productId, QuantityProduced = quantity, ProducedAt = producedAt, CreatedByUserId = actor };
    private static OperationsService Service(ApplicationDbContext db) => new(db, new InventoryService(db), new TestClock());

    private async Task<(DbContextOptions<ApplicationDbContext> Options, Guid VolumeUnit, Guid MassUnit)> NewDatabaseAsync(string name)
    {
        var connectionString = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = name + "_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(connectionString);
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options;
        await using var db = new ApplicationDbContext(options);
        return (options, await db.Units.Where(x => x.Dimension == UnitDimension.VOLUME).Select(x => x.Id).FirstAsync(), await db.Units.Where(x => x.Dimension == UnitDimension.MASS).Select(x => x.Id).FirstAsync());
    }

    private static async Task<int> CountInventoryMovements(string connectionString)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options;
        await using var db = new ApplicationDbContext(options);
        return await db.InventoryMovements.CountAsync();
    }

    private static async Task<string> Token(HttpClient client, string username) => (await (await client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" })).Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
    private static async Task<HttpResponseMessage> Send(HttpClient client, string path, string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await client.SendAsync(request);
    }

    private sealed class TestClock : IBusinessClock
    {
        public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
        public DateOnly BusinessDate => DateOnly.FromDateTime(UtcNow.UtcDateTime);
        public string TimeZoneId => "America/La_Paz";
    }
}
