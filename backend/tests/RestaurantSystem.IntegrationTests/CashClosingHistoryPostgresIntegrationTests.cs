using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using RestaurantSystem.Domain.Operations;
using RestaurantSystem.Infrastructure;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class CashClosingHistoryPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task History_filters_business_date_inclusively_before_newest_first_pagination_and_preserves_page_metadata()
    {
        var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString)
        {
            Database = "cash_history_period_" + Guid.NewGuid().ToString("N"),
        }.ConnectionString;
        await postgres.MigrateAsync(database);
        await using var factory = new AuthWebApplicationFactory(database, "Development");
        using var client = factory.CreateClient();
        await client.GetAsync("/health");
        var admin = await Token(client, "admin.test");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database).Options;

        await using (var db = new ApplicationDbContext(options))
        {
            var actor = await db.Users.Where(x => x.UserName == "admin.test").Select(x => x.Id).SingleAsync();
            await SeedClosing(db, new DateOnly(2026, 1, 31), UtcAt(2026, 2, 4, 22), actor);
            await SeedClosing(db, new DateOnly(2026, 2, 1), UtcAt(2026, 2, 3, 22), actor);
            await SeedClosing(db, new DateOnly(2026, 2, 28), UtcAt(2026, 2, 2, 22), actor);
            await SeedClosing(db, new DateOnly(2026, 3, 1), UtcAt(2026, 2, 1, 22), actor);
        }

        var first = await Send(client, HttpMethod.Get, "/api/v1/cash/closings?page=1&pageSize=1&from=2026-02-01&to=2026-02-28", admin);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        var firstBody = await first.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(2, firstBody.GetProperty("totalCount").GetInt32());
        Assert.Equal(2, firstBody.GetProperty("totalPages").GetInt32());
        Assert.Equal(1, firstBody.GetProperty("page").GetInt32());
        Assert.Equal(1, firstBody.GetProperty("pageSize").GetInt32());
        Assert.Equal("2026-02-01", firstBody.GetProperty("items")[0].GetProperty("businessDate").GetString());

        var second = await Send(client, HttpMethod.Get, "/api/v1/cash/closings?page=2&pageSize=1&from=2026-02-01&to=2026-02-28", admin);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        var secondBody = await second.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(2, secondBody.GetProperty("totalCount").GetInt32());
        Assert.Equal("2026-02-28", secondBody.GetProperty("items")[0].GetProperty("businessDate").GetString());

        var fromOnly = await Send(client, HttpMethod.Get, "/api/v1/cash/closings?page=1&pageSize=20&from=2026-02-28", admin);
        var fromOnlyBody = await fromOnly.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(2, fromOnlyBody.GetProperty("totalCount").GetInt32());
        Assert.Equal(new[] { "2026-02-28", "2026-03-01" }, fromOnlyBody.GetProperty("items").EnumerateArray().Select(x => x.GetProperty("businessDate").GetString()).ToArray());

        var toOnly = await Send(client, HttpMethod.Get, "/api/v1/cash/closings?page=1&pageSize=20&to=2026-02-01", admin);
        var toOnlyBody = await toOnly.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(2, toOnlyBody.GetProperty("totalCount").GetInt32());
        Assert.Equal(new[] { "2026-01-31", "2026-02-01" }, toOnlyBody.GetProperty("items").EnumerateArray().Select(x => x.GetProperty("businessDate").GetString()).ToArray());

        var pageOnly = await Send(client, HttpMethod.Get, "/api/v1/cash/closings?page=1&pageSize=20", admin);
        var pageOnlyBody = await pageOnly.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(4, pageOnlyBody.GetProperty("totalCount").GetInt32());
    }

    [Fact]
    public async Task History_rejects_reversed_date_range_with_validation_problem_details()
    {
        var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString)
        {
            Database = "cash_history_invalid_period_" + Guid.NewGuid().ToString("N"),
        }.ConnectionString;
        await postgres.MigrateAsync(database);
        await using var factory = new AuthWebApplicationFactory(database, "Development");
        using var client = factory.CreateClient();
        await client.GetAsync("/health");
        var admin = await Token(client, "admin.test");

        var response = await Send(client, HttpMethod.Get, "/api/v1/cash/closings?page=1&pageSize=20&from=2026-03-01&to=2026-02-28", admin);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(problem.TryGetProperty("errors", out var errors));
        Assert.True(errors.TryGetProperty("cashClosings", out _));
    }

    [Fact]
    public async Task History_keeps_cash_history_read_only_authorization_separate_from_cash_manage()
    {
        var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString)
        {
            Database = "cash_history_authorization_" + Guid.NewGuid().ToString("N"),
        }.ConnectionString;
        await postgres.MigrateAsync(database);
        await using var factory = new AuthWebApplicationFactory(database, "Development");
        using var client = factory.CreateClient();
        await client.GetAsync("/health");

        var admin = await Token(client, "admin.test");
        var accountant = await Token(client, "contadora.test");
        var waiter = await Token(client, "mesero.test");

        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/cash/closings?page=1&pageSize=20", accountant)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Get, "/api/v1/cash/closings?page=1&pageSize=20", waiter)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, "/api/v1/cash/close", accountant, new { declaredCash = 0, observation = (string?)null })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/cash/closings?page=1&pageSize=20", admin)).StatusCode);
    }

    private static DateTimeOffset UtcAt(int year, int month, int day, int hour) =>
        new(new DateTime(year, month, day, hour, 0, 0, DateTimeKind.Utc));

    private static async Task SeedClosing(ApplicationDbContext db, DateOnly businessDate, DateTimeOffset closedAt, string actor)
    {
        var session = new CashSession
        {
            BusinessDate = businessDate,
            IsOpen = false,
            OpenedAt = closedAt.AddHours(-12),
            OpenedByUserId = actor,
            OpeningAmount = 100m,
            PettyCashOpeningAmount = 20m,
            CashRemovedAmount = 0m,
        };
        db.CashSessions.Add(session);
        db.CashClosings.Add(new CashClosing
        {
            CashSessionId = session.Id,
            BusinessDate = businessDate,
            OpeningAmount = 100m,
            PettyCashOpeningAmount = 20m,
            CashRemovedAmount = 0m,
            SalesTotal = 10m,
            CashSalesTotal = 10m,
            QrSalesTotal = 0m,
            ExternalSalesTotal = 0m,
            DirectSalesTotal = 10m,
            PedidosYaSalesTotal = 0m,
            CashDrawerExpensesTotal = 0m,
            PettyCashExpensesTotal = 0m,
            ExpensesTotal = 0m,
            ExpectedCash = 130m,
            DeclaredCash = 130m,
            Difference = 0m,
            Observation = null,
            ClosedByUserId = actor,
            ClosedAt = closedAt,
        });
        await db.SaveChangesAsync();
    }

    private static async Task<string> Token(HttpClient client, string username) =>
        (await (await client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" })).Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;

    private static Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string token, object? body = null)
    {
        var request = new HttpRequestMessage(method, path)
        {
            Content = body is null ? null : JsonContent.Create(body),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client.SendAsync(request);
    }
}
