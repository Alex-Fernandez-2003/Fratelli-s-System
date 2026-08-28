namespace RestaurantSystem.Application.Auth;

public sealed record AuthUser(string Id, string Username, string? FullName, Guid? EmployeeId, IReadOnlyList<string> Roles);
public sealed record AuthResponse(string AccessToken, DateTimeOffset ExpiresAt, AuthUser User);
public sealed class LoginRequest
{
    public string Username { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    [System.Text.Json.Serialization.JsonExtensionData]
    public Dictionary<string, System.Text.Json.JsonElement>? Extra { get; init; }
}

public interface ITokenService
{
    AuthResponse Create(string userId, string username, string? fullName, Guid? employeeId, IReadOnlyList<string> roles, string? securityStamp);
}

public interface IRefreshTokenService
{
    Task<(Guid SessionId, string Token)> CreateAsync(string userId, CancellationToken cancellationToken = default);
    Task<(Guid SessionId, string UserId, string Token)?> RotateAsync(string token, CancellationToken cancellationToken = default);
    Task RevokeAsync(string? token, CancellationToken cancellationToken = default);
    Task RevokeAllAsync(string userId, CancellationToken cancellationToken = default);
}

/// <summary>Application boundary for auth use cases; HTTP and Identity stay outside Application.</summary>
public interface IAuthService
{
    Task<(AuthResponse Response, string RefreshToken)?> LoginAsync(string username, string password, CancellationToken cancellationToken = default);
    Task<(AuthResponse Response, string RefreshToken)?> RefreshAsync(string refreshToken, CancellationToken cancellationToken = default);
    Task RevokeAsync(string? refreshToken, CancellationToken cancellationToken = default);
    Task<AuthUser?> GetUserAsync(string userId, CancellationToken cancellationToken = default);
}
