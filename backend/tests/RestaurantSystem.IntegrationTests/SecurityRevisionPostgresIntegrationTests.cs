using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Identity;
using Xunit;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class SecurityRevisionPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Access_tokens_require_current_security_revision_and_active_identity_account()
    {
        var database = new Npgsql.NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "security_revision_" + Guid.NewGuid().ToString("N") };
        await postgres.MigrateAsync(database.ConnectionString);
        await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development");
        using var client = factory.CreateClient();
        var login = await client.PostAsJsonAsync("/api/v1/auth/login", new { username = "admin.test", password = "Sprint1.Test!123" });
        var token = (await login.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>()).GetProperty("accessToken").GetString()!;
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        var userId = jwt.Claims.Single(x => x.Type == ClaimTypes.NameIdentifier).Value;
        var revision = jwt.Claims.Single(x => x.Type == JwtTokenService.SecurityRevisionClaim).Value;
        await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database.ConnectionString).Options);
        var user = await db.Users.SingleAsync(x => x.Id == userId);
        Assert.NotEqual(user.SecurityStamp, revision);
        Assert.Equal(SecurityRevision.Fingerprint(user.SecurityStamp), revision);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, token)).StatusCode);
        var unknownUser = NewToken(Guid.NewGuid().ToString(), "unknown", revision);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, unknownUser)).StatusCode);
        user.SecurityStamp = Guid.NewGuid().ToString("N");
        await db.SaveChangesAsync();
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, token)).StatusCode);
        var noRevision = NewToken(userId, "admin.test");
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, noRevision)).StatusCode);
        db.Entry(user).Property<bool>("IsActive").CurrentValue = false;
        await db.SaveChangesAsync();
        var currentRevision = NewToken(userId, "admin.test", SecurityRevision.Fingerprint(user.SecurityStamp));
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, currentRevision)).StatusCode);
    }

        [Fact]
        public async Task Revoke_all_does_not_invalidate_another_users_access_token()
        {
            var database = new Npgsql.NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "security_isolation_" + Guid.NewGuid().ToString("N") };
            await postgres.MigrateAsync(database.ConnectionString);
            await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development");
            using var client = factory.CreateClient();
            var login = await client.PostAsJsonAsync("/api/v1/auth/login", new { username = "empleado.test", password = "Sprint1.Test!123" });
            var token = (await login.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>()).GetProperty("accessToken").GetString()!;
            await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database.ConnectionString).Options);
            var admin = await db.Users.SingleAsync(x => x.UserName == "admin.test");
            await new RefreshTokenService(db).RevokeAllAsync(admin.Id);
            Assert.Equal(HttpStatusCode.OK, (await Send(client, token)).StatusCode);
        }

        private static Task<HttpResponseMessage> Send(HttpClient client, string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client.SendAsync(request);
    }

    private static string NewToken(string userId, string username, string? revision = null)
    {
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, userId), new(ClaimTypes.Name, username) };
        if (revision is not null) claims.Add(new Claim(JwtTokenService.SecurityRevisionClaim, revision));
        return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken("integration-tests", "integration-tests", claims, DateTime.UtcNow, DateTime.UtcNow.AddMinutes(1), new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes("integration-test-signing-key-with-at-least-thirty-two-characters")), SecurityAlgorithms.HmacSha256)));
    }
}
