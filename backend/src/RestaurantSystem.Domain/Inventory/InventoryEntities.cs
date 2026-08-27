namespace RestaurantSystem.Domain.Inventory;

public enum InventoryMovementType { ENTRY, SALE, PRODUCTION_CONSUMPTION, PRODUCTION_OUTPUT, PURCHASE_RECEIPT, WRITE_OFF, ADJUSTMENT }
public enum InventoryReferenceType { MANUAL, SALE, PURCHASE, PRODUCTION }
public sealed class InventoryBalance { public Guid ProductId { get; set; } public decimal Quantity { get; set; } public DateTimeOffset UpdatedAt { get; set; } }
public sealed class InventoryMovement { public Guid Id { get; set; } = Guid.NewGuid(); public Guid ProductId { get; set; } public InventoryMovementType MovementType { get; set; } public decimal QuantityDelta { get; set; } public string? Reason { get; set; } public InventoryReferenceType? ReferenceType { get; set; } public Guid? ReferenceId { get; set; } public DateTimeOffset CreatedAt { get; set; } public required string CreatedByUserId { get; set; } }
