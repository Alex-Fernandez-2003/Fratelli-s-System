using RestaurantSystem.Domain.Identity;

namespace RestaurantSystem.Domain.Tests;
public sealed class UserSessionTests
{
    [Fact]
    public void IsUsable_requires_an_unrevoked_session_before_its_absolute_expiry()
    {
        var now = DateTimeOffset.UtcNow;
        var session = new UserSession { UserId = "identity-string-key", RefreshTokenHash = "hash", CreatedAt = now, LastRotatedAt = now, AbsoluteExpiresAt = now.AddHours(12) };
        Assert.True(session.IsUsable(now));
        session.RevokedAt = now;
        Assert.False(session.IsUsable(now));
        session.RevokedAt = null; session.AbsoluteExpiresAt = now;
        Assert.False(session.IsUsable(now));
    }
}
