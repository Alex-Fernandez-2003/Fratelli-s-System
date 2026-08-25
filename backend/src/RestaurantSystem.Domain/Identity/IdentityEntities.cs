namespace RestaurantSystem.Domain.Identity;

public sealed class Employee
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string UserId { get; set; }
    public required string FullName { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class UserSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string UserId { get; set; }
    public required string RefreshTokenHash { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset AbsoluteExpiresAt { get; set; }
    public DateTimeOffset LastRotatedAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public bool IsUsable(DateTimeOffset now) => RevokedAt is null && AbsoluteExpiresAt > now;
}
