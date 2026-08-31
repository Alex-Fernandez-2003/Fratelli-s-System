using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using RestaurantSystem.Infrastructure;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class OperationsContractPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Sprint2_mutations_enforce_roles_and_publish_explicit_problem_responses()
    {
        var connectionString = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "operations_contract_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(connectionString);
        await using var factory = new AuthWebApplicationFactory(connectionString, "Development");
        using var client = factory.CreateClient();

        var openApi = await client.GetFromJsonAsync<JsonElement>("/openapi/v1.json");
        AssertResponses(openApi, "/api/v1/sales", "post", "201", "400", "401", "403", "404", "409");
        AssertResponses(openApi, "/api/v1/purchases/{id}/cancel", "post", "200", "400", "401", "403", "404", "409");
        AssertResponses(openApi, "/api/v1/purchases/{id}/receive", "post", "200", "400", "401", "403", "404", "409");
        Assert.True(openApi.GetProperty("paths").GetProperty("/api/v1/sales").GetProperty("post").GetProperty("responses").GetProperty("409").GetProperty("content").TryGetProperty("application/problem+json", out _));

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/purchases", new { })).StatusCode);
        var accountant = await Token(client, "contadora.test");
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, "/api/v1/purchases", accountant, new { })).StatusCode);
        var waiter = await Token(client, "mesero.test");
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, "/api/v1/shifts/open", waiter)).StatusCode);
    }

    private static void AssertResponses(JsonElement document, string path, string method, params string[] expected)
    {
        var responses = document.GetProperty("paths").GetProperty(path).GetProperty(method).GetProperty("responses");
        foreach (var status in expected) Assert.True(responses.TryGetProperty(status, out _), $"{method.ToUpperInvariant()} {path} is missing {status}");
    }

    private static async Task<string> Token(HttpClient client, string username) => (await (await client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" })).Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
    private static Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string token, object? body = null)
    {
        var request = new HttpRequestMessage(method, path) { Content = body is null ? null : JsonContent.Create(body) };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client.SendAsync(request);
    }
}
