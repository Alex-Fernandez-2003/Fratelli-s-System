namespace RestaurantSystem.Domain.Orders;

public enum OrderStatus { PENDIENTE, EN_PREPARACION, LISTO, ENTREGADO, CANCELADO }
public enum KitchenCommandStatus { PENDIENTE, EN_PREPARACION, LISTA, CANCELADA }

public sealed class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? ShiftId { get; set; }
    public Guid? WaiterEmployeeId { get; set; }
    public string? TableReference { get; set; }
    public OrderStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public required string CreatedByUserId { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedByUserId { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
    public string? CancelledByUserId { get; set; }
    public string? CancellationReason { get; set; }
    public List<OrderItem> Items { get; set; } = [];
    public KitchenCommand? KitchenCommand { get; set; }
}

public sealed class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    public Guid ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public sealed class KitchenCommand
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    public KitchenCommandStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? ReadyAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
    public string? UpdatedByUserId { get; set; }
    public List<KitchenCommandItem> Items { get; set; } = [];
}

public sealed class KitchenCommandItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid KitchenCommandId { get; set; }
    public KitchenCommand? KitchenCommand { get; set; }
    public Guid OrderItemId { get; set; }
    public OrderItem? OrderItem { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
