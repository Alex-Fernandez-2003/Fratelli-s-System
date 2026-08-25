using RestaurantSystem.Application.Catalog;

namespace RestaurantSystem.Application.Suppliers;

public sealed record SupplierDto(Guid Id, string Name, string PhoneNumber, string? Email, string? Notes, bool IsActive, DateTimeOffset CreatedAt, string CreatedByUserId, DateTimeOffset UpdatedAt, string UpdatedByUserId);
public sealed record SupplierRequest(string Name, string PhoneNumber, string? Email, string? Notes);
public interface ISupplierService
{
    Task<PagedResponse<SupplierDto>> ListAsync(int page, int pageSize, string? search, bool? isActive, CancellationToken ct);
    Task<SupplierDto?> GetAsync(Guid id, CancellationToken ct);
    Task<(SupplierDto? Value, string? Error)> CreateAsync(SupplierRequest request, string actor, CancellationToken ct);
    Task<(SupplierDto? Value, string? Error)> UpdateAsync(Guid id, SupplierRequest request, string actor, CancellationToken ct);
    Task<string?> DeleteAsync(Guid id, CancellationToken ct);
}
