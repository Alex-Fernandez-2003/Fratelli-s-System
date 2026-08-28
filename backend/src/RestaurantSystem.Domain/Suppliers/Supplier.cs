namespace RestaurantSystem.Domain.Suppliers;

public sealed class Supplier
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public required string CreatedByUserId { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public required string UpdatedByUserId { get; set; }
}
