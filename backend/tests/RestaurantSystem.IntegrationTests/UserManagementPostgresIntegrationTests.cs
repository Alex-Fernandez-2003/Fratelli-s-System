using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using RestaurantSystem.Infrastructure;
using Xunit;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class UserManagementPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Admin_can_list_detail_and_create_passwordless_multirole_user()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); await using var factory = new AuthWebApplicationFactory(cs, "Development"); using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); var token = (await admin.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/users", token)).StatusCode);
        var employeeLogin = await Login(client, "empleado.test");
        var employeeToken = (await employeeLogin.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString();
        Assert.NotNull(employeeToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Get, "/api/v1/users", employeeToken!)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/users")).StatusCode);
        var create = await Send(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Nuevo Usuario", username = "nuevo.usuario", roles = new[] { "ENCARGADO", "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode); var created = await create.Content.ReadFromJsonAsync<JsonElement>(); Assert.False(created.GetProperty("hasPassword").GetBoolean());
        Assert.Equal(2, created.GetProperty("roles").GetArrayLength()); var id = created.GetProperty("id").GetString()!;
        var listed = await Send(client, HttpMethod.Get, "/api/v1/users?search=nuevo.usuario&role=MESERO&active=true&pageSize=10", token);
        Assert.Equal(HttpStatusCode.OK, listed.StatusCode); var page = await listed.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(10, page.GetProperty("pageSize").GetInt32()); Assert.Equal(1, page.GetProperty("page").GetInt32()); Assert.True(page.GetProperty("totalCount").GetInt32() >= 1);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/users?search=Nuevo%20Usuario", token)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Get, "/api/v1/users?pageSize=101", token)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/users/" + id, token)).StatusCode);
        await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options);
        var user = await db.Users.SingleAsync(x => x.Id == id); Assert.NotNull(await db.Employees.SingleOrDefaultAsync(x => x.UserId == id));
        Assert.Equal(token is not null, db.Entry(user).Property<string?>("CreatedByUserId").CurrentValue is not null);
        Assert.Equal(HttpStatusCode.Conflict, (await Send(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Dup", username = "nuevo.usuario", roles = new[] { "MESERO" } })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Bad", username = "bad", roles = Array.Empty<string>() })).StatusCode);
    }
    private static Task<HttpResponseMessage> Login(HttpClient c, string username) => c.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" });
    private static Task<HttpResponseMessage> Send(HttpClient c, HttpMethod method, string path, string token, object? body = null) { var r = new HttpRequestMessage(method, path); r.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body is not null) r.Content = JsonContent.Create(body); return c.SendAsync(r); }
}
