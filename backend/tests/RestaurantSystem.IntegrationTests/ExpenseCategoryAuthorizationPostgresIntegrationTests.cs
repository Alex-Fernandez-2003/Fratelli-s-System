using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using RestaurantSystem.Domain.Expenses;
using RestaurantSystem.Infrastructure;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class ExpenseCategoryAuthorizationPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Expense_category_read_is_accounting_only_and_category_mutations_remain_managerial()
    {
        var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "expense_category_auth_" + Guid.NewGuid().ToString("N") };
        await postgres.MigrateAsync(database.ConnectionString);

        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database.ConnectionString).Options;
        Guid expenseCategoryId;
        Guid catalogCategoryId;
        await using (var db = new ApplicationDbContext(options))
        {
            var expenseCategory = new ExpenseCategory { Name = "Authorization category", CreatedAt = DateTimeOffset.UtcNow };
            db.ExpenseCategories.Add(expenseCategory);
            await db.SaveChangesAsync();
            expenseCategoryId = expenseCategory.Id;
            catalogCategoryId = await db.Categories.Select(x => x.Id).FirstAsync();
        }

        await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development");
        using var client = factory.CreateClient();
        var tokens = new Dictionary<string, string>();
        foreach (var role in new[] { "admin", "encargado", "contadora", "mesero", "cocina", "empleado" })
            tokens[role] = await Token(client, role + ".test");

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/expense-categories")).StatusCode);

        foreach (var role in new[] { "admin", "encargado", "contadora" })
        {
            var response = await Send(client, HttpMethod.Get, "/api/v1/expense-categories", tokens[role]);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var categories = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Contains(categories.EnumerateArray(), category => category.GetProperty("id").GetGuid() == expenseCategoryId);
        }

        foreach (var role in new[] { "mesero", "cocina", "empleado" })
            Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Get, "/api/v1/expense-categories", tokens[role])).StatusCode);

        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Get, "/api/v1/categories", tokens["contadora"])).StatusCode);

        var request = new { name = "Accountant must not mutate", scope = "MENU" };
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, "/api/v1/categories", tokens["contadora"], request)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Put, $"/api/v1/categories/{catalogCategoryId}", tokens["contadora"], request)).StatusCode);
        // DELETE is the existing catalog-category soft-deactivation mutation; there is no activate endpoint.
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Delete, $"/api/v1/categories/{catalogCategoryId}", tokens["contadora"])).StatusCode);
    }

    private static async Task<string> Token(HttpClient client, string username) =>
        (await (await client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" })).Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;

    private static Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string token, object? body = null)
    {
        var request = new HttpRequestMessage(method, path) { Content = body is null ? null : JsonContent.Create(body) };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client.SendAsync(request);
    }
}
