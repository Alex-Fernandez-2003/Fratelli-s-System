using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Application.Users;
using RestaurantSystem.Domain.Identity;
using RestaurantSystem.Infrastructure.Identity;

namespace RestaurantSystem.Infrastructure.Users;

public sealed class UserManagementService(ApplicationDbContext db, UserManager<IdentityUser> users, RoleManager<IdentityRole> roles) : IUserManagementService
{
    public async Task<PagedResponse<UserDto>> ListAsync(int page, int pageSize, string? search, string? role, bool? isActive, CancellationToken ct = default)
    {
        var query = db.Users.AsQueryable();
        if (!string.IsNullOrWhiteSpace(search)) { var term = search.Trim(); query = query.Where(x => EF.Functions.ILike(x.UserName!, $"%{term}%") || db.Employees.Any(e => e.UserId == x.Id && EF.Functions.ILike(e.FullName, $"%{term}%"))); }
        if (isActive.HasValue) query = query.Where(x => EF.Property<bool>(x, "IsActive") == isActive.Value);
        if (role is not null) { var normalizedRole = role.ToUpperInvariant(); query = query.Where(x => db.UserRoles.Where(ur => ur.UserId == x.Id).Join(db.Roles, ur => ur.RoleId, r => r.Id, (_, r) => r.NormalizedName).Any(n => n == normalizedRole)); }
        var total = await query.CountAsync(ct);
        var identities = await query.OrderBy(x => x.UserName).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        var items = new List<UserDto>(); foreach (var user in identities) items.Add(await Map(user, ct));
        return new PagedResponse<UserDto>(items, page, pageSize, total, (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<UserDto?> GetAsync(string id, CancellationToken ct = default) => await users.FindByIdAsync(id) is { } user ? await Map(user, ct) : null;

    public async Task<(UserDto? Value, string? Error)> CreateAsync(CreateUserRequest request, string actorUserId, CancellationToken ct = default)
    {
        var selected = request.Roles.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Username) || selected.Length == 0 || selected.Any(x => !RoleNames.All.Contains(x, StringComparer.Ordinal))) return (null, "Invalid user request");
        foreach (var role in selected) if (!await roles.RoleExistsAsync(role)) return (null, "Invalid role");
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var user = new IdentityUser { UserName = request.Username.Trim() };
        db.Entry(user).Property<bool>("IsActive").CurrentValue = true;
        var created = await users.CreateAsync(user); if (!created.Succeeded) return (null, "Username already exists");
        db.Entry(user).Property("CreatedByUserId").CurrentValue = actorUserId; db.Entry(user).Property("UpdatedByUserId").CurrentValue = actorUserId;
        var assigned = await users.AddToRolesAsync(user, selected); if (!assigned.Succeeded) { await tx.RollbackAsync(ct); return (null, "Invalid role"); }
        db.Employees.Add(new Employee { UserId = user.Id, FullName = request.FullName.Trim() }); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return (await Map(user, ct), null);
    }

    public async Task<(UserDto? Value, string? Error)> UpdateAsync(string id, UpdateUserRequest request, string actorUserId, CancellationToken ct = default)
    {
        var targetUser = await users.FindByIdAsync(id);
        if (targetUser is null) return (null, "Not found");

        if (targetUser.Id == actorUserId)
        {
            var selfCurrentRoles = await users.GetRolesAsync(targetUser);
            var hasAdminRole = selfCurrentRoles.Contains(RoleNames.Administrator, StringComparer.OrdinalIgnoreCase);
            var requestedRoles = request.Roles.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
            var willHaveAdminRole = requestedRoles.Contains(RoleNames.Administrator, StringComparer.OrdinalIgnoreCase);
                
            if (hasAdminRole && !willHaveAdminRole)
                return (null, "Self-removal of ADMINISTRADOR role is not allowed");
        }

        var selected = request.Roles.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Username) || selected.Length == 0 || selected.Any(x => !RoleNames.All.Contains(x, StringComparer.Ordinal))) return (null, "Invalid user request");
        foreach (var role in selected) if (!await roles.RoleExistsAsync(role)) return (null, "Invalid role");

        if (!string.Equals(targetUser.UserName, request.Username.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            var existing = await users.FindByNameAsync(request.Username.Trim());
            if (existing is not null && existing.Id != id) return (null, "Username already exists");
        }

        await using var tx = await db.Database.BeginTransactionAsync(ct);
            
        var currentRoles = (await users.GetRolesAsync(targetUser)).ToArray();
        var rolesChanged = !currentRoles.OrderBy(x => x, StringComparer.OrdinalIgnoreCase).SequenceEqual(selected.OrderBy(x => x, StringComparer.OrdinalIgnoreCase));
        
        targetUser.UserName = request.Username.Trim();
        db.Entry(targetUser).Property("UpdatedByUserId").CurrentValue = actorUserId;
        
        var updateResult = await users.UpdateAsync(targetUser);
        if (!updateResult.Succeeded) { await tx.RollbackAsync(ct); return (null, "Username already exists"); }

        if (rolesChanged)
        {
            var removeResult = await users.RemoveFromRolesAsync(targetUser, currentRoles);
            if (!removeResult.Succeeded) { await tx.RollbackAsync(ct); return (null, "Failed to update roles"); }
            
            var addResult = await users.AddToRolesAsync(targetUser, selected);
            if (!addResult.Succeeded) { await tx.RollbackAsync(ct); return (null, "Invalid role"); }
            
            await users.UpdateSecurityStampAsync(targetUser);
        }

        var employee = await db.Employees.SingleOrDefaultAsync(e => e.UserId == id, ct);
        if (employee is not null && !string.Equals(employee.FullName, request.FullName.Trim(), StringComparison.Ordinal))
        {
            employee.FullName = request.FullName.Trim();
            db.Employees.Update(employee);
        }

        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        if (rolesChanged)
        {
            await db.UserSessions
                .Where(s => s.UserId == id && s.RevokedAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.RevokedAt, DateTimeOffset.UtcNow), ct);
        }

        return (await Map(targetUser, ct), null);
    }

    public async Task<string?> SetPasswordAsync(string id, SetUserPasswordRequest request, string actorUserId, CancellationToken ct = default)
    {
        var targetUser = await users.FindByIdAsync(id);
        if (targetUser is null) return "Not found";

        var hasPassword = await users.HasPasswordAsync(targetUser);
        
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        
        try
        {
            IdentityResult result;
            if (!hasPassword)
            {
                result = await users.AddPasswordAsync(targetUser, request.NewPassword);
                if (result.Succeeded)
                {
                    db.Entry(targetUser).Property("UpdatedByUserId").CurrentValue = actorUserId;
                    await db.SaveChangesAsync(ct);
                }
            }
            else
            {
                var token = await users.GeneratePasswordResetTokenAsync(targetUser);
                result = await users.ResetPasswordAsync(targetUser, token, request.NewPassword);
                if (result.Succeeded)
                {
                    db.Entry(targetUser).Property("UpdatedByUserId").CurrentValue = actorUserId;
                    await db.SaveChangesAsync(ct);
                }
            }

            if (!result.Succeeded) 
            { 
                await tx.RollbackAsync(ct); 
                var errors = string.Join("; ", result.Errors.Select(e => $"{e.Code}: {e.Description}"));
                System.Console.WriteLine($"[DEBUG] SetPasswordAsync failed for user {id}: {errors}");
                return $"PasswordError: {errors}"; 
            }

            await tx.CommitAsync(ct);

            await db.UserSessions
                .Where(s => s.UserId == id && s.RevokedAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(x => x.RevokedAt, DateTimeOffset.UtcNow), ct);

            System.Console.WriteLine($"[DEBUG] SetPasswordAsync succeeded for user {id}");
            return null;
        }
        catch (Exception ex)
        {
            await tx.RollbackAsync(ct);
            System.Console.WriteLine($"[DEBUG] SetPasswordAsync exception for user {id}: {ex.Message} | {ex.InnerException?.Message}");
            return $"Exception: {ex.Message} | {ex.InnerException?.Message}";
        }
    }

    public async Task<string?> SetActiveAsync(string id, bool isActive, string actorUserId, CancellationToken ct = default)
    {
        var targetUser = await users.FindByIdAsync(id);
        if (targetUser is null) return "Not found";

        if (targetUser.Id == actorUserId && !isActive)
            return "Self-deactivation is not allowed";

        if (!isActive)
        {
            var currentRoles = await users.GetRolesAsync(targetUser);
            var hasAdminRole = currentRoles.Contains(RoleNames.Administrator, StringComparer.OrdinalIgnoreCase);
            
            if (hasAdminRole)
            {
                await using var tx = await db.Database.BeginTransactionAsync(ct);
                
                var adminRole = await db.Roles
                    .FromSqlRaw("SELECT * FROM identity.\"AspNetRoles\" WHERE \"NormalizedName\" = 'ADMINISTRADOR' FOR UPDATE")
                    .SingleOrDefaultAsync(ct);
                
                if (adminRole is null) { await tx.RollbackAsync(ct); return "ADMINISTRADOR role not found"; }

                var activeAdminCount = await db.UserRoles
                    .Join(db.Users.Where(u => EF.Property<bool>(u, "IsActive")), ur => ur.UserId, u => u.Id, (ur, u) => ur.RoleId)
                    .Join(db.Roles.Where(r => r.NormalizedName == "ADMINISTRADOR"), urRoleId => urRoleId, r => r.Id, (_, r) => r.Id)
                    .CountAsync(ct);

                if (activeAdminCount <= 1)
                {
                    await tx.RollbackAsync(ct);
                    return "Cannot deactivate the last active ADMINISTRADOR";
                }

                var currentIsActive = await db.Users
                    .Where(u => u.Id == id)
                    .Select(u => EF.Property<bool>(u, "IsActive"))
                    .SingleAsync(ct);

                if (currentIsActive == isActive) 
                { 
                    await tx.CommitAsync(ct); 
                    return null; 
                }

                db.Entry(targetUser).Property<bool>("IsActive").CurrentValue = isActive;
                db.Entry(targetUser).Property("UpdatedByUserId").CurrentValue = actorUserId;
                await users.UpdateAsync(targetUser);
                await db.SaveChangesAsync(ct);
                await tx.CommitAsync(ct);

                await db.UserSessions
                    .Where(s => s.UserId == id && s.RevokedAt == null)
                    .ExecuteUpdateAsync(s => s.SetProperty(x => x.RevokedAt, DateTimeOffset.UtcNow), ct);

                return null;
            }
        }

        await using var tx2 = await db.Database.BeginTransactionAsync(ct);
        
        var currentIsActive2 = await db.Users
            .Where(u => u.Id == id)
            .Select(u => EF.Property<bool>(u, "IsActive"))
            .SingleAsync(ct);

        if (currentIsActive2 == isActive) 
        { 
            await tx2.CommitAsync(ct); 
            return null; 
        }

        db.Entry(targetUser).Property<bool>("IsActive").CurrentValue = isActive;
        db.Entry(targetUser).Property("UpdatedByUserId").CurrentValue = actorUserId;
        await users.UpdateAsync(targetUser);
        await db.SaveChangesAsync(ct);
        await tx2.CommitAsync(ct);

        await db.UserSessions
            .Where(s => s.UserId == id && s.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.RevokedAt, DateTimeOffset.UtcNow), ct);

        return null;
    }

    private async Task<UserDto> Map(IdentityUser user, CancellationToken ct) 
    { 
        var employee = await db.Employees.SingleOrDefaultAsync(x => x.UserId == user.Id, ct); 
        var userRoles = await users.GetRolesAsync(user); 
        return new UserDto(user.Id, employee?.Id ?? Guid.Empty, employee?.FullName ?? string.Empty, user.UserName!, userRoles.ToArray(), db.Entry(user).Property<bool>("IsActive").CurrentValue, await users.HasPasswordAsync(user)); 
    }
}