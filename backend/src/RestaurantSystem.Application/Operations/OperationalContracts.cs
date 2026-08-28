using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Domain.Operations;

namespace RestaurantSystem.Application.Operations;
public sealed record CompositionLineRequest(Guid ComponentProductId, decimal QuantityPerOutputUnit, Guid UnitId);
public sealed record CompositionLineDto(Guid ComponentProductId, string ComponentProductName, decimal QuantityPerOutputUnit, Guid UnitId);
public sealed record CompositionDto(Guid ProductId, IReadOnlyList<CompositionLineDto> Lines);
public sealed record ProductionRequirementDto(Guid ProductId, string ProductName, decimal RequiredQuantity, decimal CurrentQuantity, decimal ShortageQuantity, Guid InventoryUnitId);
public sealed record ProductionRequirementsDto(Guid ProductId, decimal QuantityProduced, IReadOnlyList<ProductionRequirementDto> Components, bool HasSufficientStock);
public sealed record CreateProductionRequest(Guid ProductId, decimal QuantityProduced, string? Notes);
public sealed record ProductionDto(Guid Id, Guid ProductId, decimal QuantityProduced, DateTimeOffset ProducedAt, IReadOnlyList<ProductionRequirementDto> Consumptions);
public sealed record MinimumStockRequest(decimal? MinStock);
public sealed record OpenOperationalDayRequest();
public sealed record ShiftAssignmentRequest(IReadOnlyList<Guid> EmployeeIds);
public sealed record HandoverRequest(string? Note);
public sealed record ShiftDto(Guid Id, ShiftType Type, ShiftStatus Status, IReadOnlyList<Guid> EmployeeIds);
public sealed record ShiftContextDto(Guid CashSessionId, DateOnly BusinessDate, IReadOnlyList<ShiftDto> Shifts);
public sealed record ConfirmSaleRequest(Guid OrderId, SalesChannel SalesChannel, PaymentMethod PaymentMethod, bool AcknowledgeStockShortage = false);
public sealed record SaleItemDto(Guid ProductId, decimal Quantity, decimal UnitPrice, decimal LineTotal);
public sealed record SaleDto(Guid Id, Guid OrderId, Guid ShiftId, decimal Subtotal, decimal Total, IReadOnlyList<SaleItemDto> Items);
public sealed record PurchaseLineRequest(Guid ProductId, decimal Quantity, Guid UnitId, decimal UnitCost);
public sealed record CreatePurchaseRequest(Guid SupplierId, IReadOnlyList<PurchaseLineRequest> Lines, string? ReceiptReference, string? Notes);
public sealed record CancelPurchaseRequest(string? Reason);
public sealed record ReceiptLineRequest(Guid PurchaseItemId, decimal ReceivedQuantity, Guid UnitId);
public sealed record ReceivePurchaseRequest(IReadOnlyList<ReceiptLineRequest> Lines, string? Notes);
public sealed record PurchaseDto(Guid Id, Guid SupplierId, PurchaseStatus Status, decimal Total, IReadOnlyList<PurchaseLineDto> Lines);
public sealed record PurchaseLineDto(Guid Id, Guid ProductId, decimal OrderedQuantity, Guid UnitId, decimal UnitCost, decimal? ReceivedQuantity);
public interface IOperationsService {
 Task<(CompositionDto? Value,string? Error)> ReplaceCompositionAsync(Guid productId,IReadOnlyList<CompositionLineRequest> lines,string actor,CancellationToken ct=default); Task<CompositionDto?> CompositionAsync(Guid productId,CancellationToken ct=default);
 Task<(decimal? Value,string? Error)> SetMinimumStockAsync(Guid productId,decimal? minStock,CancellationToken ct=default); Task<(ProductionRequirementsDto? Value,string? Error)> RequirementsAsync(Guid productId,decimal quantity,CancellationToken ct=default); Task<(ProductionDto? Value,string? Error)> ProduceAsync(CreateProductionRequest request,string actor,CancellationToken ct=default);
 Task<(ShiftContextDto? Value,string? Error)> OpenAsync(string actor,CancellationToken ct=default); Task<ShiftContextDto?> CurrentShiftAsync(CancellationToken ct=default); Task<ShiftDto?> MyCurrentShiftAsync(string actor,CancellationToken ct=default); Task<(ShiftDto? Value,string? Error)> AssignAsync(Guid shiftId,ShiftAssignmentRequest request,string actor,CancellationToken ct=default); Task<(ShiftContextDto? Value,string? Error)> HandoverAsync(Guid shiftId,HandoverRequest request,string actor,CancellationToken ct=default);
 Task<(SaleDto? Value,string? Error,IReadOnlyList<ProductionRequirementDto>? Shortages)> ConfirmSaleAsync(ConfirmSaleRequest request,string actor,CancellationToken ct=default);
 Task<(PurchaseDto? Value,string? Error)> CreatePurchaseAsync(CreatePurchaseRequest request,string actor,IReadOnlySet<string> roles,CancellationToken ct=default); Task<PurchaseDto?> PurchaseAsync(Guid id,CancellationToken ct=default); Task<PagedResponse<PurchaseDto>> PurchasesAsync(int page,int pageSize,PurchaseStatus? status,CancellationToken ct=default); Task<(PurchaseDto? Value,string? Error)> CancelPurchaseAsync(Guid id,CancelPurchaseRequest request,string actor,IReadOnlySet<string> roles,CancellationToken ct=default); Task<(PurchaseDto? Value,string? Error)> ReceivePurchaseAsync(Guid id,ReceivePurchaseRequest request,string actor,IReadOnlySet<string> roles,CancellationToken ct=default);
}
