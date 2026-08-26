using RestaurantSystem.Application.Catalog;

namespace RestaurantSystem.Application.Users;

public sealed record UserDto(string Id, Guid EmployeeId, string FullName, string Username, IReadOnlyList<string> Roles, bool IsActive, bool HasPassword);
public sealed record CreateUserRequest(string FullName, string Username, IReadOnlyList<string> Roles);
public sealed record UpdateUserRequest(string FullName, string Username, IReadOnlyList<string> Roles);
public sealed record SetUserPasswordRequest(string NewPassword);

public interface IUserManagementService
{
    Task<PagedResponse<UserDto>> ListAsync(int page, int pageSize, string? search, string? role, bool? isActive, CancellationToken cancellationToken = default);
    Task<UserDto?> GetAsync(string id, CancellationToken cancellationToken = default);
    Task<(UserDto? Value, string? Error)> CreateAsync(CreateUserRequest request, string actorUserId, CancellationToken cancellationToken = default);
    Task<(UserDto? Value, string? Error)> UpdateAsync(string id, UpdateUserRequest request, string actorUserId, CancellationToken cancellationToken = default);
    Task<string?> SetPasswordAsync(string id, SetUserPasswordRequest request, string actorUserId, CancellationToken cancellationToken = default);
    Task<string?> SetActiveAsync(string id, bool isActive, string actorUserId, CancellationToken cancellationToken = default);
}
