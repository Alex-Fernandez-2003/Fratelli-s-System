using Microsoft.EntityFrameworkCore;
using Npgsql;
using RestaurantSystem.Application.Auth;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Identity;
using Xunit;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class RefreshTokenServicePostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Revoke_all_revokes_only_target_sessions_and_is_idempotent()
    {
        var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "revoke_all_" + Guid.NewGuid().ToString("N") };
        await postgres.MigrateAsync(database.ConnectionString);
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database.ConnectionString).Options;
        await using var db = new ApplicationDbContext(options);
        var a = "user-a"; var b = "user-b";
        db.Users.AddRange(new Microsoft.AspNetCore.Identity.IdentityUser { Id = a, UserName = a, NormalizedUserName = a.ToUpperInvariant() }, new Microsoft.AspNetCore.Identity.IdentityUser { Id = b, UserName = b, NormalizedUserName = b.ToUpperInvariant() });
        await db.SaveChangesAsync();
        var sessions = (IRefreshTokenService)new RefreshTokenService(db);
        await sessions.CreateAsync(a); await sessions.CreateAsync(a); await sessions.CreateAsync(b);
        await sessions.RevokeAllAsync(a); await sessions.RevokeAllAsync(a);
        db.ChangeTracker.Clear();
        var rows = await db.UserSessions.OrderBy(x => x.UserId).ToListAsync();
        Assert.All(rows.Where(x => x.UserId == a), x => Assert.NotNull(x.RevokedAt));
        Assert.All(rows.Where(x => x.UserId == b), x => Assert.Null(x.RevokedAt));
    }
}
