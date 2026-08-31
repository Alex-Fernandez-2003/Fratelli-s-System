using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Npgsql;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class CustomerLifecyclePostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Customer_lifecycle_normalizes_identifiers_allows_duplicate_names_and_enforces_permissions()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "customers_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs);
        await using var factory = new AuthWebApplicationFactory(cs, "Development");
        using var client = factory.CreateClient();
        var admin = await Token(client, "admin.test"); var waiter = await Token(client, "mesero.test"); var kitchen = await Token(client, "cocina.test");

        var first = await Send(client, HttpMethod.Post, "/api/v1/customers", admin, new { name = "  Ana Perez  ", ci = "  LP-A12  ", nit = "   ", notes = "  note  " });
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        var firstBody = await first.Content.ReadFromJsonAsync<JsonElement>();
        var id = firstBody.GetProperty("id").GetGuid();
        Assert.Equal("Ana Perez", firstBody.GetProperty("name").GetString()); Assert.Equal("LP-A12", firstBody.GetProperty("ci").GetString()); Assert.Equal(JsonValueKind.Null, firstBody.GetProperty("nit").ValueKind);

        Assert.Equal(HttpStatusCode.Created, (await Send(client, HttpMethod.Post, "/api/v1/customers", waiter, new { name = "Ana Perez", ci = "CI-2", nit = " NIT-2 " })).StatusCode);
        var duplicate = await Send(client, HttpMethod.Post, "/api/v1/customers", admin, new { name = "Other", ci = "LP-A12", nit = (string?)null });
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode); Assert.Equal("DUPLICATE_CUSTOMER_IDENTIFIER", (await duplicate.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("code").GetString());
        Assert.Equal(HttpStatusCode.Conflict, (await Send(client, HttpMethod.Post, "/api/v1/customers", admin, new { name = "Other", ci = "CI-3", nit = "NIT-2" })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Post, "/api/v1/customers", admin, new { name = "Name", ci = "  " })).StatusCode);

        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Put, $"/api/v1/customers/{id}", waiter, new { name = " Ana Updated ", ci = " LP-A12 ", nit = " NIT-1 " })).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, $"/api/v1/customers/{id}/deactivate", waiter)).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Get, "/api/v1/customers?page=1&pageSize=10", kitchen)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await Send(client, HttpMethod.Post, $"/api/v1/customers/{id}/deactivate", admin)).StatusCode);
        var inactive = await Send(client, HttpMethod.Get, "/api/v1/customers?page=1&pageSize=10&search=LP-A12&isActive=false", waiter);
        Assert.Equal(HttpStatusCode.OK, inactive.StatusCode); Assert.Single((await inactive.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("items").EnumerateArray());
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, $"/api/v1/customers/{id}", waiter)).StatusCode);
    }

    private static async Task<string> Token(HttpClient client, string username) => (await (await client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" })).Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
    private static Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token, object? body = null)
    {
        var request = new HttpRequestMessage(method, path) { Content = body is null ? null : JsonContent.Create(body) };
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client.SendAsync(request);
    }
}
