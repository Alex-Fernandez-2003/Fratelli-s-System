using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Inventory;

namespace RestaurantSystem.Application.Inventory;

public sealed record InventoryBalanceDto(Guid ProductId, string ProductName, ProductType ProductType, Guid InventoryUnitId, string InventoryUnitCode, string InventoryUnitName, string InventoryUnitSymbol, decimal CurrentQuantity, decimal? MinStock, bool IsLowStock, bool IsActive);
public sealed record InventoryMovementDto(Guid Id, Guid ProductId, string ProductName, InventoryMovementType MovementType, decimal QuantityDelta, Guid InventoryUnitId, string InventoryUnitCode, string InventoryUnitName, string InventoryUnitSymbol, string? Reason, InventoryReferenceType? ReferenceType, Guid? ReferenceId, DateTimeOffset CreatedAt, string CreatedByUserId, string? CreatedByDisplayName);
public sealed record InventorySummaryDto(int TotalProducts, int LowStockCount, int NegativeStockCount, int NormalStockCount, IReadOnlyList<InventoryBalanceDto> LowStockItems);
public sealed record RecordManualInventoryMovementRequest(Guid ProductId, InventoryMovementType Type, decimal Quantity, string Reason);
public sealed record InventoryWriteCommand(Guid ProductId, InventoryMovementType Type, decimal QuantityDelta, string? Reason, InventoryReferenceType? ReferenceType, Guid? ReferenceId, string ActorUserId);
public sealed record InventoryBatchResult(IReadOnlyList<InventoryMovementDto> Movements, IReadOnlyList<(Guid ProductId, decimal Required, decimal Current)> Shortages);
public interface IInventoryWriter { Task<(InventoryMovementDto? Value, string? Error)> WriteAsync(InventoryWriteCommand command, CancellationToken ct = default); Task<(InventoryBatchResult? Value, string? Error)> WriteBatchAsync(IReadOnlyList<InventoryWriteCommand> commands, bool allowNegative, CancellationToken ct = default); }
public interface IInventoryService
{
    Task<PagedResponse<InventoryBalanceDto>> BalancesAsync(int page, int pageSize, string? search, ProductType? productType, bool? active, CancellationToken ct = default);
    Task<InventorySummaryDto> SummaryAsync(CancellationToken ct = default);
    Task<PagedResponse<InventoryMovementDto>> MovementsAsync(int page, int pageSize, Guid? productId, InventoryMovementType? movementType, DateOnly? from, DateOnly? to, CancellationToken ct = default);
    Task<(InventoryMovementDto? Value, string? Error)> RecordManualAsync(RecordManualInventoryMovementRequest request, string actorUserId, CancellationToken ct = default);
}
