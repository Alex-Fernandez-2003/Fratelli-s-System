using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Application.Inventory;
using RestaurantSystem.Application.Operations;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Inventory;
using RestaurantSystem.Domain.Operations;

namespace RestaurantSystem.Infrastructure.Operations;

public sealed class OperationsService(ApplicationDbContext db, IInventoryWriter inventory, IBusinessClock clock) : IOperationsService
{
    public async Task<(CompositionDto? Value, string? Error)> ReplaceCompositionAsync(Guid id, IReadOnlyList<CompositionLineRequest> lines, string actor, CancellationToken ct = default)
    {
        if (lines is null || lines.Any(x => x.ComponentProductId == Guid.Empty || x.ComponentProductId == id || x.QuantityPerOutputUnit <= 0 || x.UnitId == Guid.Empty) || lines.GroupBy(x => x.ComponentProductId).Any(x => x.Count() > 1)) return (null, "INVALID_REQUEST");
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var parent = await db.Products.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (parent is null) return (null, "NOT_FOUND");
        if (!parent.IsActive || parent.ProductType != ProductType.PREPARATION) return (null, "INVALID_COMPOSITION_PARENT");
        var componentIds = lines.Select(x => x.ComponentProductId).ToArray();
        var unitIds = lines.Select(x => x.UnitId).Distinct().ToArray();
        var products = await db.Products.Include(x => x.InventoryUnit).Where(x => componentIds.Contains(x.Id) && x.IsActive).ToDictionaryAsync(x => x.Id, ct);
        var units = await db.Units.Where(x => unitIds.Contains(x.Id) && x.IsActive).ToDictionaryAsync(x => x.Id, ct);
        if (products.Count != lines.Count || units.Count != unitIds.Length || lines.Any(x => units[x.UnitId].Dimension != products[x.ComponentProductId].InventoryUnit!.Dimension || units[x.UnitId].FactorToBase <= 0 || products[x.ComponentProductId].InventoryUnit!.FactorToBase <= 0)) return (null, "INVALID_UNIT_CONVERSION");
        db.ProductCompositions.RemoveRange(db.ProductCompositions.Where(x => x.ParentProductId == id));
        db.ProductCompositions.AddRange(lines.Select(x => new ProductComposition { ParentProductId = id, ComponentProductId = x.ComponentProductId, QuantityPerOutputUnit = x.QuantityPerOutputUnit, UnitId = x.UnitId, CreatedAt = clock.UtcNow, CreatedByUserId = actor }));
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return (await CompositionAsync(id, ct), null);
    }

    public async Task<CompositionDto?> CompositionAsync(Guid id, CancellationToken ct = default)
    {
        var rows = await db.ProductCompositions.Where(x => x.ParentProductId == id).ToArrayAsync(ct);
        var names = await db.Products.Where(x => rows.Select(r => r.ComponentProductId).Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.Name, ct);
        return await db.Products.AnyAsync(x => x.Id == id, ct) ? new(id, rows.Select(x => new CompositionLineDto(x.ComponentProductId, names[x.ComponentProductId], x.QuantityPerOutputUnit, x.UnitId)).ToArray()) : null;
    }

    public async Task<(decimal? Value, string? Error)> SetMinimumStockAsync(Guid id, decimal? value, CancellationToken ct = default) { if (value < 0) return (null, "INVALID_REQUEST"); var product = await db.Products.SingleOrDefaultAsync(x => x.Id == id, ct); if (product is null) return (null, "NOT_FOUND"); product.MinStock = value; await db.SaveChangesAsync(ct); return (value, null); }

    public async Task<(ProductionRequirementsDto? Value, string? Error)> RequirementsAsync(Guid id, decimal quantity, CancellationToken ct = default)
    {
        if (quantity <= 0) return (null, "INVALID_REQUEST"); var target = await db.Products.Include(x => x.InventoryUnit).SingleOrDefaultAsync(x => x.Id == id && x.IsActive, ct); if (target is null) return (null, "NOT_FOUND");
        var rows = await db.ProductCompositions.Where(x => x.ParentProductId == id).ToArrayAsync(ct); if (rows.Length == 0) return (null, "NO_USABLE_COMPOSITION");
        var products = await db.Products.Include(x => x.InventoryUnit).Where(x => rows.Select(r => r.ComponentProductId).Contains(x.Id)).ToDictionaryAsync(x => x.Id, ct);
        var units = await db.Units.Where(x => rows.Select(r => r.UnitId).Contains(x.Id)).ToDictionaryAsync(x => x.Id, ct);
        var balances = await db.InventoryBalances.Where(x => products.Keys.Contains(x.ProductId)).ToDictionaryAsync(x => x.ProductId, x => x.Quantity, ct);
        var components = rows.Select(r => { var product = products[r.ComponentProductId]; var needed = Convert(r.QuantityPerOutputUnit * quantity, units[r.UnitId], product.InventoryUnit!); var current = balances.GetValueOrDefault(product.Id); return new ProductionRequirementDto(product.Id, product.Name, needed, current, Math.Max(0, needed - current), product.InventoryUnitId); }).ToArray();
        return (new(id, quantity, components, components.All(x => x.ShortageQuantity == 0)), null);
    }

    public async Task<(ProductionDto? Value, string? Error)> ProduceAsync(CreateProductionRequest request, string actor, CancellationToken ct = default)
    {
        var requirements = await RequirementsAsync(request.ProductId, request.QuantityProduced, ct); if (requirements.Error is not null) return (null, requirements.Error); if (!requirements.Value!.HasSufficientStock) return (null, "PRODUCTION_STOCK_INSUFFICIENT");
        await using var tx = await db.Database.BeginTransactionAsync(ct); requirements = await RequirementsAsync(request.ProductId, request.QuantityProduced, ct); if (!requirements.Value!.HasSufficientStock) return (null, "PRODUCTION_STOCK_INSUFFICIENT");
        var production = new Production { ProductId = request.ProductId, QuantityProduced = request.QuantityProduced, Notes = request.Notes?.Trim(), ProducedAt = clock.UtcNow, CreatedByUserId = actor, ResponsibleEmployeeId = await db.Employees.Where(x => x.UserId == actor && x.IsActive).Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct) };
        var commands = requirements.Value.Components.Select(x => new InventoryWriteCommand(x.ProductId, InventoryMovementType.PRODUCTION_CONSUMPTION, -x.RequiredQuantity, "Production", InventoryReferenceType.PRODUCTION, production.Id, actor)).Append(new InventoryWriteCommand(request.ProductId, InventoryMovementType.PRODUCTION_OUTPUT, request.QuantityProduced, "Production", InventoryReferenceType.PRODUCTION, production.Id, actor)).ToArray();
        var batch = await inventory.WriteBatchAsync(commands, false, ct); if (batch.Error is not null) return (null, "PRODUCTION_STOCK_INSUFFICIENT");
        db.Productions.Add(production); db.ProductionConsumptions.AddRange(requirements.Value.Components.Select(x => new ProductionConsumption { ProductionId = production.Id, ComponentProductId = x.ProductId, QuantityConsumed = x.RequiredQuantity })); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return (new(production.Id, request.ProductId, request.QuantityProduced, production.ProducedAt, requirements.Value.Components), null);
    }

    public async Task<(ShiftContextDto? Value, string? Error)> OpenAsync(string actor, CancellationToken ct = default)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); var existing = await db.CashSessions.SingleOrDefaultAsync(x => x.BusinessDate == clock.BusinessDate, ct); if (existing is not null) return (await CurrentShiftAsync(ct), null);
        var session = new CashSession { BusinessDate = clock.BusinessDate, OpenedAt = clock.UtcNow, OpenedByUserId = actor }; session.Shifts.Add(new Shift { Type = ShiftType.MORNING, Status = ShiftStatus.ACTIVE, StartedAt = clock.UtcNow }); session.Shifts.Add(new Shift { Type = ShiftType.NIGHT }); db.CashSessions.Add(session); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return (await CurrentShiftAsync(ct), null);
    }

    public async Task<ShiftContextDto?> CurrentShiftAsync(CancellationToken ct = default)
    {
        var session = await db.CashSessions.Include(x => x.Shifts).ThenInclude(x => x.Assignments).SingleOrDefaultAsync(x => x.BusinessDate == clock.BusinessDate && x.IsOpen, ct);
        return session is null ? null : new(session.Id, session.BusinessDate, session.Shifts.Select(x => new ShiftDto(x.Id, x.Type, x.Status, x.Assignments.Select(a => a.EmployeeId).ToArray())).ToArray());
    }

    public async Task<ShiftDto?> MyCurrentShiftAsync(string actor, CancellationToken ct = default)
    {
        var employeeId = await db.Employees.Where(x => x.UserId == actor && x.IsActive).Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct); if (employeeId is null) return null;
        var shift = await CurrentShiftQuery.ActiveAsync(db, clock, includeAssignments: true, forUpdate: false, ct); if (shift is null || !shift.Assignments.Any(x => x.EmployeeId == employeeId)) return null;
        return new(shift.Id, shift.Type, shift.Status, shift.Assignments.Select(x => x.EmployeeId).ToArray());
    }

    public async Task<(ShiftDto? Value, string? Error)> AssignAsync(Guid id, ShiftAssignmentRequest request, string actor, CancellationToken ct = default) { if (request.EmployeeIds is null || request.EmployeeIds.Distinct().Count() != request.EmployeeIds.Count) return (null, "INVALID_REQUEST"); var shift = await db.Shifts.Include(x => x.Assignments).SingleOrDefaultAsync(x => x.Id == id, ct); if (shift is null) return (null, "NOT_FOUND"); if (await db.Employees.CountAsync(x => request.EmployeeIds.Contains(x.Id) && x.IsActive, ct) != request.EmployeeIds.Count) return (null, "INVALID_REQUEST"); db.ShiftAssignments.RemoveRange(shift.Assignments); db.ShiftAssignments.AddRange(request.EmployeeIds.Select(x => new ShiftAssignment { ShiftId = id, EmployeeId = x, AssignedAt = clock.UtcNow, AssignedByUserId = actor })); await db.SaveChangesAsync(ct); return (new(id, shift.Type, shift.Status, request.EmployeeIds), null); }

    public async Task<(ShiftContextDto? Value, string? Error)> HandoverAsync(Guid id, HandoverRequest request, string actor, CancellationToken ct = default) { await using var tx = await db.Database.BeginTransactionAsync(ct); var source = await db.Shifts.FromSqlInterpolated($"SELECT * FROM public.shifts WHERE \"Id\"={id} FOR UPDATE").SingleOrDefaultAsync(ct); if (source is null) return (null, "NOT_FOUND"); var session = await db.CashSessions.FromSqlInterpolated($"SELECT * FROM public.cash_sessions WHERE \"Id\"={source.CashSessionId} FOR UPDATE").SingleOrDefaultAsync(ct); if (session is null || !session.IsOpen) return (null, "INVALID_SHIFT_TRANSITION"); var next = await db.Shifts.FromSqlInterpolated($"SELECT * FROM public.shifts WHERE \"CashSessionId\"={source.CashSessionId} AND \"Status\"='PENDING' FOR UPDATE").SingleOrDefaultAsync(ct); if (source.Status != ShiftStatus.ACTIVE || next is null) return (null, "INVALID_SHIFT_TRANSITION"); source.Status = ShiftStatus.COMPLETED; source.EndedAt = clock.UtcNow; source.HandoverNote = request.Note?.Trim(); next.Status = ShiftStatus.ACTIVE; next.StartedAt = clock.UtcNow; await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return (await CurrentShiftAsync(ct), null); }

    public async Task<(SaleDto? Value, string? Error, IReadOnlyList<InventoryShortageDto>? Shortages)> ConfirmSaleAsync(ConfirmSaleRequest request, string actor, CancellationToken ct = default)
    {
        if (!Enum.IsDefined(request.SalesChannel) || !Enum.IsDefined(request.PaymentMethod) || (request.SalesChannel == SalesChannel.PEDIDOSYA) != (request.PaymentMethod == PaymentMethod.EXTERNAL)) return (null, "INVALID_REQUEST", null);
        await using var tx = await db.Database.BeginTransactionAsync(ct); var order = await db.Orders.FromSqlInterpolated($"SELECT * FROM public.orders WHERE id={request.OrderId} FOR UPDATE").Include(x => x.Items).SingleOrDefaultAsync(ct); if (order is null) return (null, "NOT_FOUND", null); if (order.Status != Domain.Orders.OrderStatus.ENTREGADO) return (null, "ORDER_NOT_DELIVERED", null); if (await db.Sales.AnyAsync(x => x.OrderId == request.OrderId, ct)) return (null, "SALE_ALREADY_CONFIRMED", null);
        var shift = await CurrentShiftQuery.ActiveAsync(db, clock, includeAssignments: false, forUpdate: true, ct); if (shift is null) return (null, "NO_ACTIVE_SHIFT", null);
        var ids = order.Items.Select(x => x.ProductId).ToArray(); var products = await db.Products.Where(x => ids.Contains(x.Id)).ToDictionaryAsync(x => x.Id, ct); var units = await db.Units.Where(x => products.Values.Select(p => p.InventoryUnitId).Contains(x.Id)).ToDictionaryAsync(x => x.Id, ct); var balances = await db.InventoryBalances.Where(x => ids.Contains(x.ProductId)).ToDictionaryAsync(x => x.ProductId, x => x.Quantity, ct);
        var precheck = order.Items.GroupBy(x => x.ProductId).Select(x => new InventoryShortageDto(x.Key, products[x.Key].Name, x.Sum(y => y.Quantity), balances.GetValueOrDefault(x.Key), Math.Max(0, x.Sum(y => y.Quantity) - balances.GetValueOrDefault(x.Key)), products[x.Key].InventoryUnitId, units[products[x.Key].InventoryUnitId].Symbol)).Where(x => x.ShortageQuantity > 0).ToArray(); var allowNegative = request.AcknowledgeStockShortage || order.StockShortageAcknowledgedAt is not null;
        if (precheck.Length > 0 && !allowNegative) return (null, "SALE_STOCK_CONFIRMATION_REQUIRED", precheck);
        var sale = new Sale { OrderId = request.OrderId, ShiftId = shift.Id, SalesChannel = request.SalesChannel, PaymentMethod = request.PaymentMethod, ConfirmedAt = clock.UtcNow, ConfirmedByUserId = actor, Subtotal = order.Items.Sum(x => x.Quantity * x.UnitPrice), Total = order.Items.Sum(x => x.Quantity * x.UnitPrice) }; sale.Items.AddRange(order.Items.Select(x => new SaleItem { OrderItemId = x.Id, ProductId = x.ProductId, Quantity = x.Quantity, UnitPrice = x.UnitPrice, LineTotal = x.Quantity * x.UnitPrice })); db.Sales.Add(sale); await db.SaveChangesAsync(ct);
        var batch = await inventory.WriteBatchAsync(order.Items.GroupBy(x => x.ProductId).Select(x => new InventoryWriteCommand(x.Key, InventoryMovementType.SALE, -x.Sum(y => y.Quantity), "Sale", InventoryReferenceType.SALE, sale.Id, actor)).ToArray(), allowNegative, ct);
        if (batch.Error is not null) { var shortages = batch.Error == "STOCK_INSUFFICIENT" && batch.Value is not null ? batch.Value.Shortages.Select(x => new InventoryShortageDto(x.ProductId, products[x.ProductId].Name, x.Required, x.Current, Math.Max(0, x.Required - x.Current), products[x.ProductId].InventoryUnitId, units[products[x.ProductId].InventoryUnitId].Symbol)).ToArray() : precheck; return (null, "SALE_STOCK_CONFIRMATION_REQUIRED", shortages); }
        if (request.AcknowledgeStockShortage && precheck.Length > 0 && order.StockShortageAcknowledgedAt is null) { order.StockShortageAcknowledgedAt = clock.UtcNow; order.StockShortageAcknowledgedByUserId = actor; await db.SaveChangesAsync(ct); }
        var displayName = await db.Employees.Where(x => x.UserId == actor).Select(x => x.FullName).FirstOrDefaultAsync(ct) ?? await db.Users.Where(x => x.Id == actor).Select(x => x.UserName).FirstOrDefaultAsync(ct);
        await tx.CommitAsync(ct); return (new(sale.Id, sale.OrderId, sale.ShiftId, sale.Subtotal, sale.Total, sale.Items.Select(x => new SaleItemDto(x.ProductId, x.Quantity, x.UnitPrice, x.LineTotal)).ToArray(), sale.SalesChannel, sale.PaymentMethod, sale.ConfirmedAt, sale.ConfirmedByUserId, displayName), null, null);
    }

    public async Task<(PurchaseDto? Value, string? Error)> CreatePurchaseAsync(CreatePurchaseRequest request, string actor, IReadOnlySet<string> roles, CancellationToken ct = default)
    {
        if (request.Lines is null || request.Lines.Count == 0 || request.Lines.Any(x => x.Quantity <= 0 || x.UnitCost < 0)) return (null, "INVALID_REQUEST"); var supplier = await db.Suppliers.SingleOrDefaultAsync(x => x.Id == request.SupplierId && x.IsActive, ct); if (supplier is null) return (null, "NOT_FOUND");
        var productIds = request.Lines.Select(x => x.ProductId).ToArray(); var unitIds = request.Lines.Select(x => x.UnitId).Distinct().ToArray(); var products = await db.Products.Include(x => x.InventoryUnit).Where(x => productIds.Contains(x.Id) && x.IsActive).ToDictionaryAsync(x => x.Id, ct); var units = await db.Units.Where(x => unitIds.Contains(x.Id) && x.IsActive).ToDictionaryAsync(x => x.Id, ct);
        if (products.Count != request.Lines.Count || units.Count != unitIds.Length || request.Lines.Any(x => units[x.UnitId].Dimension != products[x.ProductId].InventoryUnit!.Dimension || units[x.UnitId].FactorToBase <= 0 || products[x.ProductId].InventoryUnit!.FactorToBase <= 0)) return (null, "INVALID_UNIT_CONVERSION");
        var kitchenOnly = roles.Contains("COCINA") && !roles.Contains("ADMINISTRADOR") && !roles.Contains("ENCARGADO"); if (kitchenOnly && (products.Values.Any(x => x.ProductType != ProductType.INGREDIENT) || string.IsNullOrWhiteSpace(request.ReceiptReference))) return (null, "PURCHASE_SCOPE_FORBIDDEN");
        var purchase = new Purchase { SupplierId = request.SupplierId, PurchaseDate = clock.BusinessDate, ReceiptReference = request.ReceiptReference?.Trim(), Notes = request.Notes?.Trim(), CreatedAt = clock.UtcNow, CreatedByUserId = actor }; purchase.Items.AddRange(request.Lines.Select(x => new PurchaseItem { ProductId = x.ProductId, Quantity = x.Quantity, UnitId = x.UnitId, UnitCost = x.UnitCost, LineTotal = x.Quantity * x.UnitCost })); purchase.Total = purchase.Items.Sum(x => x.LineTotal); db.Purchases.Add(purchase); await db.SaveChangesAsync(ct); return (await PurchaseAsync(purchase.Id, ct), null);
    }

    public async Task<PurchaseDto?> PurchaseAsync(Guid id, CancellationToken ct = default)
    {
        var purchase = await db.Purchases.Include(x => x.Items).SingleOrDefaultAsync(x => x.Id == id, ct); if (purchase is null) return null;
        var receipts = await ReceiptLinesAsync(new[] { id }, ct); return PurchaseDto(purchase, purchase.Items, receipts);
    }

    public async Task<PagedResponse<PurchaseDto>> PurchasesAsync(int page, int size, PurchaseStatus? status, CancellationToken ct = default)
    {
        var query = db.Purchases.AsNoTracking(); if (status is not null) query = query.Where(x => x.Status == status); var total = await query.CountAsync(ct);
        var purchases = await query.OrderByDescending(x => x.CreatedAt).Skip((page - 1) * size).Take(size).ToArrayAsync(ct); var ids = purchases.Select(x => x.Id).ToArray();
        var items = await db.PurchaseItems.AsNoTracking().Where(x => ids.Contains(x.PurchaseId)).ToArrayAsync(ct); var receipts = await ReceiptLinesAsync(ids, ct);
        return new(purchases.Select(x => PurchaseDto(x, items.Where(i => i.PurchaseId == x.Id), receipts)).ToArray(), page, size, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)size));
    }

    public async Task<(PurchaseDto? Value, string? Error)> CancelPurchaseAsync(Guid id, CancelPurchaseRequest request, string actor, IReadOnlySet<string> roles, CancellationToken ct = default) { if (string.IsNullOrWhiteSpace(request.Reason)) return (null, "INVALID_REQUEST"); await using var tx = await db.Database.BeginTransactionAsync(ct); var purchase = await db.Purchases.FromSqlInterpolated($"SELECT * FROM public.purchases WHERE \"Id\"={id} FOR UPDATE").Include(x => x.Items).SingleOrDefaultAsync(ct); if (purchase is null) return (null, "NOT_FOUND"); if (!await IsPurchaseScopeAllowedAsync(purchase.Items.Select(x => x.ProductId), roles, ct)) return (null, "PURCHASE_SCOPE_FORBIDDEN"); if (purchase.Status != PurchaseStatus.PENDIENTE) return (null, "PURCHASE_NOT_PENDING"); purchase.Status = PurchaseStatus.CANCELADA; purchase.CancellationReason = request.Reason.Trim(); purchase.CancelledAt = clock.UtcNow; purchase.CancelledByUserId = actor; await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return (await PurchaseAsync(id, ct), null); }

    public async Task<(PurchaseDto? Value, string? Error)> ReceivePurchaseAsync(Guid id, ReceivePurchaseRequest request, string actor, IReadOnlySet<string> roles, CancellationToken ct = default)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); var purchase = await db.Purchases.FromSqlInterpolated($"SELECT * FROM public.purchases WHERE \"Id\"={id} FOR UPDATE").Include(x => x.Items).SingleOrDefaultAsync(ct); if (purchase is null) return (null, "NOT_FOUND"); if (!await IsPurchaseScopeAllowedAsync(purchase.Items.Select(x => x.ProductId), roles, ct)) return (null, "PURCHASE_SCOPE_FORBIDDEN"); if (purchase.Status != PurchaseStatus.PENDIENTE) return (null, "PURCHASE_ALREADY_RECEIVED"); if (request.Lines is null || request.Lines.Count != purchase.Items.Count || request.Lines.Any(x => x.ReceivedQuantity <= 0) || request.Lines.Select(x => x.PurchaseItemId).Distinct().Count() != purchase.Items.Count || request.Lines.Any(x => !purchase.Items.Any(i => i.Id == x.PurchaseItemId))) return (null, "RECEIPT_INCOMPLETE");
        var receipt = new PurchaseReceipt { PurchaseId = id, ReceivedAt = clock.UtcNow, ReceivedByUserId = actor, Notes = request.Notes?.Trim() }; receipt.Lines.AddRange(request.Lines.Select(x => new PurchaseReceiptLine { PurchaseItemId = x.PurchaseItemId, ReceivedQuantity = x.ReceivedQuantity, UnitId = x.UnitId })); db.PurchaseReceipts.Add(receipt); await db.SaveChangesAsync(ct); var commands = new List<InventoryWriteCommand>();
        foreach (var line in request.Lines) { var item = purchase.Items.Single(x => x.Id == line.PurchaseItemId); var product = await db.Products.Include(x => x.InventoryUnit).SingleAsync(x => x.Id == item.ProductId, ct); var unit = await db.Units.SingleAsync(x => x.Id == line.UnitId, ct); if (unit.Dimension != product.InventoryUnit!.Dimension || unit.FactorToBase <= 0 || product.InventoryUnit.FactorToBase <= 0) return (null, "INVALID_UNIT_CONVERSION"); commands.Add(new(product.Id, InventoryMovementType.PURCHASE_RECEIPT, Convert(line.ReceivedQuantity, unit, product.InventoryUnit!), "Purchase receipt", InventoryReferenceType.PURCHASE, id, actor)); }
        var batch = await inventory.WriteBatchAsync(commands, true, ct); if (batch.Error is not null) return (null, batch.Error); purchase.Status = PurchaseStatus.RECIBIDA; await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return (await PurchaseAsync(id, ct), null);
    }

    private async Task<Dictionary<Guid, (decimal Quantity, Guid UnitId)>> ReceiptLinesAsync(Guid[] purchaseIds, CancellationToken ct) => await db.PurchaseReceiptLines.AsNoTracking().Join(db.PurchaseReceipts.AsNoTracking(), line => line.PurchaseReceiptId, receipt => receipt.Id, (line, receipt) => new { line, receipt }).Where(x => purchaseIds.Contains(x.receipt.PurchaseId)).ToDictionaryAsync(x => x.line.PurchaseItemId, x => (x.line.ReceivedQuantity, x.line.UnitId), ct);
    private static PurchaseDto PurchaseDto(Purchase purchase, IEnumerable<PurchaseItem> items, IReadOnlyDictionary<Guid, (decimal Quantity, Guid UnitId)> receipts) => new(purchase.Id, purchase.SupplierId, purchase.Status, purchase.Total, items.Select(x => receipts.TryGetValue(x.Id, out var receipt) ? new PurchaseLineDto(x.Id, x.ProductId, x.Quantity, x.UnitId, x.UnitCost, receipt.Quantity, receipt.UnitId) : new PurchaseLineDto(x.Id, x.ProductId, x.Quantity, x.UnitId, x.UnitCost, null, null)).ToArray());
    private async Task<bool> IsPurchaseScopeAllowedAsync(IEnumerable<Guid> productIds, IReadOnlySet<string> roles, CancellationToken ct) => roles.Contains("ADMINISTRADOR") || roles.Contains("ENCARGADO") || (roles.Contains("COCINA") && !await db.Products.AnyAsync(x => productIds.Contains(x.Id) && x.ProductType != ProductType.INGREDIENT, ct));
    private static decimal Convert(decimal quantity, Unit from, Unit to) => quantity * from.FactorToBase / to.FactorToBase;
}
