using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Npgsql;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class OperationsAuthorizationMatrixPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Every_sprint2_endpoint_enforces_anonymous_and_role_matrix_with_union_safe_policies()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "operations_auth_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs);
        await using var factory = new AuthWebApplicationFactory(cs, "Development");
        using var client = factory.CreateClient();
        var tokens = new Dictionary<string, string>();
        foreach (var role in new[] { "admin", "encargado", "mesero", "cocina", "contadora", "empleado" }) tokens[role] = await Token(client, role + ".test");

        var routes = new[]
        {
            new Route(HttpMethod.Get, "/api/v1/products/00000000-0000-0000-0000-000000000001/composition", null, "admin", "encargado", "mesero", "cocina"),
            new Route(HttpMethod.Put, "/api/v1/products/00000000-0000-0000-0000-000000000001/composition", Array.Empty<object>(), "admin", "encargado"),
            new Route(HttpMethod.Put, "/api/v1/products/00000000-0000-0000-0000-000000000001/minimum-stock", new { minStock = 1m }, "admin", "encargado"),
            new Route(HttpMethod.Get, "/api/v1/products/00000000-0000-0000-0000-000000000001/production-requirements?quantity=1", null, "admin", "encargado", "cocina"),
            new Route(HttpMethod.Post, "/api/v1/productions", new { productId = Guid.Empty, quantityProduced = 1m }, "admin", "encargado", "cocina"),
            new Route(HttpMethod.Post, "/api/v1/sales", new { orderId = Guid.Empty, salesChannel = "DIRECT", paymentMethod = "CASH" }, "admin", "encargado", "mesero"),
            new Route(HttpMethod.Post, "/api/v1/purchases", new { }, "admin", "encargado", "cocina"),
            new Route(HttpMethod.Get, "/api/v1/purchases?page=1&pageSize=1", null, "admin", "encargado", "cocina", "contadora"),
            new Route(HttpMethod.Get, "/api/v1/purchases/00000000-0000-0000-0000-000000000001", null, "admin", "encargado", "cocina", "contadora"),
            new Route(HttpMethod.Post, "/api/v1/purchases/00000000-0000-0000-0000-000000000001/cancel", new { reason = "x" }, "admin", "encargado", "cocina"),
            new Route(HttpMethod.Post, "/api/v1/purchases/00000000-0000-0000-0000-000000000001/receive", new { lines = Array.Empty<object>() }, "admin", "encargado", "cocina"),
            new Route(HttpMethod.Post, "/api/v1/shifts/open", null, "admin", "encargado"),
            new Route(HttpMethod.Get, "/api/v1/shifts/current", null, "admin", "encargado"),
            new Route(HttpMethod.Get, "/api/v1/shifts/me/current", null, "admin", "encargado", "mesero"),
            new Route(HttpMethod.Put, "/api/v1/shifts/00000000-0000-0000-0000-000000000001/assignments", new { employeeIds = Array.Empty<Guid>() }, "admin", "encargado"),
            new Route(HttpMethod.Post, "/api/v1/shifts/00000000-0000-0000-0000-000000000001/handover", new { }, "admin", "encargado")
        };

        foreach (var route in routes)
        {
            Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, route.Method, route.Path, null, route.Body)).StatusCode);
            foreach (var (role, token) in tokens)
            {
                var response = await Send(client, route.Method, route.Path, token, route.Body);
                if (route.Allowed.Contains(role)) Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
                else Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        }
    }

    private sealed record Route(HttpMethod Method, string Path, object? Body, params string[] Allowed);
    private static async Task<string> Token(HttpClient client, string username) => (await (await client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" })).Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
    private static Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token, object? body)
    {
        var request = new HttpRequestMessage(method, path) { Content = body is null ? null : JsonContent.Create(body) };
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client.SendAsync(request);
    }
}
