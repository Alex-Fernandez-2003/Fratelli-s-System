namespace RestaurantSystem.Domain.Customers;

public sealed class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Ci { get; set; }
    public string? Nit { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public required string CreatedByUserId { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public required string UpdatedByUserId { get; set; }
}
