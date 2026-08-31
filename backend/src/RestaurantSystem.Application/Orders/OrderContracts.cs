using System.Text.Json.Serialization;
using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Domain.Orders;
    using RestaurantSystem.Application.Inventory;

namespace RestaurantSystem.Application.Orders;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record CreateOrderItemRequest(Guid ProductId, decimal Quantity, string? Notes);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record CreateOrderRequest(string? TableReference, string? Notes, IReadOnlyList<CreateOrderItemRequest> Items, bool? AcknowledgeStockShortage = false);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record AssignOrderRequest(Guid WaiterEmployeeId);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record CancelOrderRequest(string? Reason);
public sealed record OrderItemDto(Guid Id, Guid ProductId, string ProductName, decimal Quantity, decimal UnitPrice, decimal LineTotal, string? Notes, string PreparationArea);
public sealed record OrderDto(Guid Id, Guid? ShiftId, Guid? WaiterEmployeeId, string? WaiterName, string? TableReference, OrderStatus Status, string? Notes, DateTimeOffset CreatedAt, string CreatedByUserId, DateTimeOffset? UpdatedAt, string? UpdatedByUserId, DateTimeOffset? CancelledAt, string? CancelledByUserId, string? CancelledByDisplayName, string? CancellationReason, bool HasKitchenCommand, Guid? KitchenCommandId, IReadOnlyList<OrderItemDto> Items, decimal Total);
public sealed record KitchenCommandItemDto(Guid OrderItemId, Guid ProductId, string ProductName, decimal Quantity, string? Notes);
public sealed record KitchenCommandDto(Guid Id, Guid OrderId, KitchenCommandStatus Status, string? TableReference, string? OrderNotes, DateTimeOffset CreatedAt, DateTimeOffset? StartedAt, DateTimeOffset? ReadyAt, DateTimeOffset? CancelledAt, IReadOnlyList<KitchenCommandItemDto> Items);
public sealed record OrderActor(string UserId, IReadOnlySet<string> Roles);
public sealed record KitchenRealtimeEvent(Guid CommandId, Guid OrderId, KitchenCommandStatus Status, DateTimeOffset OccurredAt);
public interface IKitchenRealtimeNotifier { Task CreatedAsync(KitchenRealtimeEvent value, CancellationToken ct = default); Task UpdatedAsync(KitchenRealtimeEvent value, CancellationToken ct = default); Task CancelledAsync(KitchenRealtimeEvent value, CancellationToken ct = default); }
public interface IOrderService
{
    Task<(OrderDto? Value, string? Error, IReadOnlyList<InventoryShortageDto>? Shortages)> CreateAsync(CreateOrderRequest request, OrderActor actor, CancellationToken ct = default);
    Task<PagedResponse<OrderDto>> ListAsync(int page, int pageSize, OrderStatus? status, string? search, CancellationToken ct = default);
    Task<OrderDto?> GetAsync(Guid id, CancellationToken ct = default);
    Task<(OrderDto? Value, string? Error)> AssignAsync(Guid id, AssignOrderRequest request, OrderActor actor, CancellationToken ct = default);
    Task<(OrderDto? Value, string? Error)> TakeAsync(Guid id, OrderActor actor, CancellationToken ct = default);
    Task<(OrderDto? Value, string? Error)> DeliverAsync(Guid id, OrderActor actor, CancellationToken ct = default);
    Task<(OrderDto? Value, string? Error)> CancelAsync(Guid id, CancelOrderRequest request, OrderActor actor, CancellationToken ct = default);
}
public interface IKitchenCommandService
{
    Task<PagedResponse<KitchenCommandDto>> ListAsync(int page, int pageSize, KitchenCommandStatus? status, CancellationToken ct = default);
    Task<KitchenCommandDto?> GetAsync(Guid id, CancellationToken ct = default);
    Task<(KitchenCommandDto? Value, string? Error)> StartAsync(Guid id, OrderActor actor, CancellationToken ct = default);
    Task<(KitchenCommandDto? Value, string? Error)> ReadyAsync(Guid id, OrderActor actor, CancellationToken ct = default);
    Task<(KitchenCommandDto? Value, string? Error)> CancelAsync(Guid id, CancelOrderRequest request, OrderActor actor, CancellationToken ct = default);
}
