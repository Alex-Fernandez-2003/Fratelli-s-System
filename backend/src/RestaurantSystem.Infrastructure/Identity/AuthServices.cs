using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using RestaurantSystem.Application.Auth;
using RestaurantSystem.Domain.Identity;

namespace RestaurantSystem.Infrastructure.Identity;

public static class RoleNames
{
    public const string Administrator = "ADMINISTRADOR", Manager = "ENCARGADO", Waiter = "MESERO", Kitchen = "COCINA", Accountant = "CONTADORA", Employee = "EMPLEADO";
    public static readonly string[] All = [Administrator, Manager, Waiter, Kitchen, Accountant, Employee];
}
public static class PolicyNames
{
    public const string CatalogRead = nameof(CatalogRead), CatalogWrite = nameof(CatalogWrite), CatalogDeactivate = nameof(CatalogDeactivate), SupplierRead = nameof(SupplierRead), SupplierWrite = nameof(SupplierWrite), SupplierDeactivate = nameof(SupplierDeactivate), AttendanceManage = nameof(AttendanceManage), AttendanceSelf = nameof(AttendanceSelf), AttendanceHubAccess = nameof(AttendanceHubAccess), UsersManage = nameof(UsersManage), OrdersAccess = nameof(OrdersAccess), KitchenAccess = nameof(KitchenAccess), KitchenManage = nameof(KitchenManage), KitchenHubAccess = nameof(KitchenHubAccess);
}

public static class SecurityRevision
{
    public static string Fingerprint(string? securityStamp) => Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(securityStamp ?? string.Empty))).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}

public sealed class JwtTokenService(IConfiguration configuration) : ITokenService
{
    public const string SecurityRevisionClaim = "rst";
    public AuthResponse Create(string userId, string username, string? fullName, Guid? employeeId, IReadOnlyList<string> roles, string? securityStamp)
    {
        var jwt = configuration.GetRequiredSection("Jwt"); var now = DateTimeOffset.UtcNow; var expires = now.AddMinutes(15);
        var claims = new List<Claim> { new(JwtRegisteredClaimNames.Sub, userId), new(ClaimTypes.NameIdentifier, userId), new(ClaimTypes.Name, username), new(JwtRegisteredClaimNames.UniqueName, username), new(SecurityRevisionClaim, SecurityRevision.Fingerprint(securityStamp)) };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"] ?? throw new InvalidOperationException("Jwt:Key is required.")));
        var token = new JwtSecurityToken(jwt["Issuer"], jwt["Audience"], claims, now.UtcDateTime, expires.UtcDateTime, new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return new AuthResponse(new JwtSecurityTokenHandler().WriteToken(token), expires, new AuthUser(userId, username, fullName, employeeId, roles));
    }
}

public sealed class AuthService(UserManager<IdentityUser> users, ApplicationDbContext db, ITokenService tokens, IRefreshTokenService refresh) : IAuthService
{
    public async Task<(AuthResponse Response, string RefreshToken)?> LoginAsync(string username, string password, CancellationToken ct = default)
    {
        var user = await users.FindByNameAsync(username);
        if (user is null || !await users.CheckPasswordAsync(user, password) || await users.IsLockedOutAsync(user) || !await IsActiveAsync(user, ct)) return null;
        var employee = await db.Employees.SingleOrDefaultAsync(x => x.UserId == user.Id, ct);
        var created = await refresh.CreateAsync(user.Id, ct);
        return (tokens.Create(user.Id, user.UserName!, employee?.FullName, employee?.Id, (await users.GetRolesAsync(user)).ToArray(), user.SecurityStamp), created.Token);
    }

    public async Task<(AuthResponse Response, string RefreshToken)?> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var rotation = await refresh.RotateAsync(refreshToken, ct);
        if (rotation is null) return null;
        var user = await users.FindByIdAsync(rotation.Value.UserId);
        if (user is null || !await IsActiveAsync(user, ct)) return null;
        var employee = await db.Employees.SingleOrDefaultAsync(x => x.UserId == user.Id, ct);
        return (tokens.Create(user.Id, user.UserName!, employee?.FullName, employee?.Id, (await users.GetRolesAsync(user)).ToArray(), user.SecurityStamp), rotation.Value.Token);
    }

    public Task RevokeAsync(string? refreshToken, CancellationToken ct = default) => refresh.RevokeAsync(refreshToken, ct);
    public async Task<AuthUser?> GetUserAsync(string userId, CancellationToken ct = default)
    {
        var user = await users.FindByIdAsync(userId);
        if (user is null) return null;
        var employee = await db.Employees.SingleOrDefaultAsync(x => x.UserId == user.Id, ct);
        return new AuthUser(user.Id, user.UserName!, employee?.FullName, employee?.Id, (await users.GetRolesAsync(user)).ToArray());
    }

    private async Task<bool> IsActiveAsync(IdentityUser user, CancellationToken ct) =>
        await db.Users.Where(x => x.Id == user.Id).Select(x => EF.Property<bool>(x, "IsActive")).SingleAsync(ct)
        && !await db.Employees.AnyAsync(x => x.UserId == user.Id && !x.IsActive, ct);
}

public sealed class RefreshTokenService(ApplicationDbContext db) : IRefreshTokenService
{
    public async Task<(Guid SessionId, string Token)> CreateAsync(string userId, CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow; var token = NewToken(); var session = new UserSession { UserId = userId, RefreshTokenHash = Hash(token), CreatedAt = now, LastRotatedAt = now, AbsoluteExpiresAt = now.AddHours(12) };
        db.UserSessions.Add(session); await db.SaveChangesAsync(ct); return (session.Id, token);
    }
    public async Task<(Guid SessionId, string UserId, string Token)?> RotateAsync(string token, CancellationToken ct = default)
    {
        var session = await db.UserSessions.SingleOrDefaultAsync(x => x.RefreshTokenHash == Hash(token), ct); if (session is null || !session.IsUsable(DateTimeOffset.UtcNow)) return null;
        var next = NewToken(); session.RefreshTokenHash = Hash(next); session.LastRotatedAt = DateTimeOffset.UtcNow; await db.SaveChangesAsync(ct); return (session.Id, session.UserId, next);
    }
    public async Task RevokeAsync(string? token, CancellationToken ct = default)
    { if (string.IsNullOrEmpty(token)) return; var session = await db.UserSessions.SingleOrDefaultAsync(x => x.RefreshTokenHash == Hash(token), ct); if (session is not null && session.RevokedAt is null) { session.RevokedAt = DateTimeOffset.UtcNow; await db.SaveChangesAsync(ct); } }
    public async Task RevokeAllAsync(string userId, CancellationToken ct = default)
    {
        var now = DateTimeOffset.UtcNow;
        await db.UserSessions.Where(x => x.UserId == userId && x.RevokedAt == null && x.AbsoluteExpiresAt > now)
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.RevokedAt, now), ct);
    }
    public static string Hash(string value) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
    private static string NewToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}

public sealed class DevelopmentDataSeeder(IServiceScopeFactory scopes, IHostEnvironment environment) : IHostedService
{
    private readonly TaskCompletionSource _completion = new();
    private static readonly (string Username, string[] Roles)[] Users = [("admin.test", [RoleNames.Administrator, RoleNames.Employee]), ("encargado.test", [RoleNames.Manager, RoleNames.Employee]), ("mesero.test", [RoleNames.Waiter, RoleNames.Employee]), ("cocina.test", [RoleNames.Kitchen, RoleNames.Employee]), ("contadora.test", [RoleNames.Accountant, RoleNames.Employee]), ("empleado.test", [RoleNames.Employee])];
    public Task WaitForCompletionAsync(CancellationToken ct = default) => _completion.Task.WaitAsync(ct);
    public async Task StartAsync(CancellationToken ct)
    {
        try
        {
            if (!environment.IsDevelopment()) { _completion.TrySetResult(); return; }
            await using var scope = scopes.CreateAsyncScope(); var env = scope.ServiceProvider.GetRequiredService<IHostEnvironment>(); if (!env.IsDevelopment()) { _completion.TrySetResult(); return; }
            var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>(); var users = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>(); var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            foreach (var role in RoleNames.All) if (!await roles.RoleExistsAsync(role)) await roles.CreateAsync(new IdentityRole(role));
            foreach (var definition in Users) { var user = await users.FindByNameAsync(definition.Username); if (user is null) { user = new IdentityUser(definition.Username) { EmailConfirmed = true }; db.Entry(user).Property<bool>("IsActive").CurrentValue = true; var created = await users.CreateAsync(user, "Sprint1.Test!123"); if (!created.Succeeded) throw new InvalidOperationException(string.Join("; ", created.Errors.Select(x => x.Description))); } foreach (var role in definition.Roles) if (!await users.IsInRoleAsync(user, role)) await users.AddToRoleAsync(user, role); if (!await db.Employees.AnyAsync(x => x.UserId == user.Id, ct)) db.Employees.Add(new Employee { UserId = user.Id, FullName = definition.Username, IsActive = true }); }
            await db.SaveChangesAsync(ct);
        }
        finally
        {
            _completion.TrySetResult();
        }
    }
    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}