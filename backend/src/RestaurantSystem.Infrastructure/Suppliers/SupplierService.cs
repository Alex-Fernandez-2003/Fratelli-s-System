using System.Net.Mail;
using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Application.Suppliers;
using RestaurantSystem.Domain.Suppliers;

namespace RestaurantSystem.Infrastructure.Suppliers;

public sealed class SupplierService(ApplicationDbContext db) : ISupplierService
{
    private static SupplierDto Map(Supplier x) => new(x.Id, x.Name, x.PhoneNumber, x.Email, x.Notes, x.IsActive, x.CreatedAt, x.CreatedByUserId, x.UpdatedAt, x.UpdatedByUserId);
    private static bool IsBlank(string? value) => string.IsNullOrWhiteSpace(value);
    private static bool IsValidEmail(string? email)
    {
        if (email is null) return true;
        if (IsBlank(email)) return false;
        try { return new MailAddress(email).Address == email; }
        catch (FormatException) { return false; }
    }
    private static string? Validate(SupplierRequest request) => IsBlank(request.Name) || IsBlank(request.PhoneNumber) || !IsValidEmail(request.Email) ? "Invalid supplier" : null;
    private static async Task<PagedResponse<T>> PageAsync<T>(IQueryable<T> query, int page, int pageSize, CancellationToken ct)
    {
        var total = await query.CountAsync(ct);
        return new(await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct), page, pageSize, total, (int)Math.Ceiling(total / (double)pageSize));
    }

    public Task<PagedResponse<SupplierDto>> ListAsync(int page, int pageSize, string? search, bool? isActive, CancellationToken ct)
    {
        var query = db.Suppliers.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(x => x.Name.ToLower().Contains(term) || x.PhoneNumber.ToLower().Contains(term));
        }
        query = query.Where(x => x.IsActive == (isActive ?? true));
        return PageAsync(query.OrderBy(x => x.Name).Select(x => new SupplierDto(x.Id, x.Name, x.PhoneNumber, x.Email, x.Notes, x.IsActive, x.CreatedAt, x.CreatedByUserId, x.UpdatedAt, x.UpdatedByUserId)), page, pageSize, ct);
    }

    public async Task<SupplierDto?> GetAsync(Guid id, CancellationToken ct) => await db.Suppliers.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct) is { } supplier ? Map(supplier) : null;
    public async Task<(SupplierDto? Value, string? Error)> CreateAsync(SupplierRequest request, string actor, CancellationToken ct)
    {
        if (Validate(request) is { } error) return (null, error);
        var now = DateTimeOffset.UtcNow;
        var supplier = new Supplier { Name = request.Name.Trim(), PhoneNumber = request.PhoneNumber.Trim(), Email = request.Email, Notes = request.Notes, CreatedAt = now, UpdatedAt = now, CreatedByUserId = actor, UpdatedByUserId = actor };
        db.Suppliers.Add(supplier);
        await db.SaveChangesAsync(ct);
        return (Map(supplier), null);
    }
    public async Task<(SupplierDto? Value, string? Error)> UpdateAsync(Guid id, SupplierRequest request, string actor, CancellationToken ct)
    {
        var supplier = await db.Suppliers.FindAsync([id], ct);
        if (supplier is null) return (null, "Not found");
        if (Validate(request) is { } error) return (null, error);
        supplier.Name = request.Name.Trim(); supplier.PhoneNumber = request.PhoneNumber.Trim(); supplier.Email = request.Email; supplier.Notes = request.Notes; supplier.UpdatedAt = DateTimeOffset.UtcNow; supplier.UpdatedByUserId = actor;
        await db.SaveChangesAsync(ct);
        return (Map(supplier), null);
    }
    public async Task<string?> DeleteAsync(Guid id, CancellationToken ct)
    {
        var supplier = await db.Suppliers.FindAsync([id], ct);
        if (supplier is null) return "Not found";
        supplier.IsActive = false;
        await db.SaveChangesAsync(ct);
        return null;
    }
}
