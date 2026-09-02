using Microsoft.EntityFrameworkCore;
using Npgsql;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Application.Inventory;
using RestaurantSystem.Application.Operations;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Inventory;
using RestaurantSystem.Domain.Customers;
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

        public async Task<PagedResponse<CustomerDto>> CustomersAsync(int page, int pageSize, string? search, bool? isActive, CancellationToken ct = default)
        {
            var query = db.Customers.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(search)) { var term = search.Trim().ToLower(); query = query.Where(x => x.Name.ToLower().Contains(term) || x.Ci.ToLower().Contains(term) || (x.Nit != null && x.Nit.ToLower().Contains(term))); }
            if (isActive is not null) query = query.Where(x => x.IsActive == isActive);
            var total = await query.CountAsync(ct); var rows = await query.OrderBy(x => x.Name).ThenBy(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize).ToArrayAsync(ct);
            return new(rows.Select(CustomerDto).ToArray(), page, pageSize, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize));
        }

        public async Task<CustomerDto?> CustomerAsync(Guid id, CancellationToken ct = default) => await db.Customers.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct) is { } customer ? CustomerDto(customer) : null;
        public async Task<(CustomerDto? Value, string? Error)> CreateCustomerAsync(CustomerRequest request, string actor, CancellationToken ct = default)
        {
            if (!Normalize(request, out var name, out var ci, out var nit, out var notes)) return (null, "INVALID_REQUEST");
            var customer = new Customer { Name = name, Ci = ci, Nit = nit, Notes = notes, CreatedAt = clock.UtcNow, UpdatedAt = clock.UtcNow, CreatedByUserId = actor, UpdatedByUserId = actor };
            db.Customers.Add(customer); return await SaveCustomerAsync(customer, ct);
        }

        public async Task<(CustomerDto? Value, string? Error)> UpdateCustomerAsync(Guid id, CustomerRequest request, string actor, CancellationToken ct = default)
        {
            var customer = await db.Customers.SingleOrDefaultAsync(x => x.Id == id, ct); if (customer is null) return (null, "NOT_FOUND");
            if (!Normalize(request, out var name, out var ci, out var nit, out var notes)) return (null, "INVALID_REQUEST");
            customer.Name = name; customer.Ci = ci; customer.Nit = nit; customer.Notes = notes; customer.UpdatedAt = clock.UtcNow; customer.UpdatedByUserId = actor;
            return await SaveCustomerAsync(customer, ct);
        }

        public async Task<string?> SetCustomerActiveAsync(Guid id, bool isActive, string actor, CancellationToken ct = default)
        {
            var customer = await db.Customers.SingleOrDefaultAsync(x => x.Id == id, ct); if (customer is null) return "NOT_FOUND";
            customer.IsActive = isActive; customer.UpdatedAt = clock.UtcNow; customer.UpdatedByUserId = actor; await db.SaveChangesAsync(ct); return null;
        }

        private async Task<(CustomerDto? Value, string? Error)> SaveCustomerAsync(Customer customer, CancellationToken ct)
        {
            try { await db.SaveChangesAsync(ct); return (CustomerDto(customer), null); }
            catch (DbUpdateException exception) when (exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation }) { return (null, "DUPLICATE_CUSTOMER_IDENTIFIER"); }
        }
        private static bool Normalize(CustomerRequest request, out string name, out string ci, out string? nit, out string? notes)
        {
            name = request.Name?.Trim() ?? string.Empty; ci = request.Ci?.Trim() ?? string.Empty; nit = string.IsNullOrWhiteSpace(request.Nit) ? null : request.Nit.Trim(); notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();
            return name.Length > 0 && ci.Length > 0;
        }
        private static CustomerDto CustomerDto(Customer x) => new(x.Id, x.Name, x.Ci, x.Nit, x.Notes, x.IsActive, x.CreatedAt, x.CreatedByUserId, x.UpdatedAt, x.UpdatedByUserId);

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

    public async Task<PagedResponse<ProductionHistoryDto>> ProductionsAsync(int page, int pageSize, Guid? productId, string? batchCode, ProductionStatus? status, string? responsible, DateTimeOffset? from, DateTimeOffset? to, CancellationToken ct = default)
    {
        var query = ProductionQuery(productId, batchCode, status, responsible, from, to);
        var total = await query.CountAsync(ct);
        var rows = await query.OrderByDescending(x => x.ProducedAt).ThenByDescending(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize)
            .Join(db.Products.AsNoTracking(), p => p.ProductId, product => product.Id, (p, product) => new { p, product })
            .Join(db.Units.AsNoTracking(), x => x.product.InventoryUnitId, unit => unit.Id, (x, unit) => new { x.p, x.product, unit })
            .ToArrayAsync(ct);
        var responsibleIds = rows.Where(x => x.p.ResponsibleEmployeeId is not null).Select(x => x.p.ResponsibleEmployeeId!.Value).ToArray();
        var responsibleNames = await db.Employees.AsNoTracking().Where(x => responsibleIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, x => x.FullName, ct);
        return new(rows.Select(x => new ProductionHistoryDto(x.p.Id, x.p.BatchCode, x.p.Status, x.product.Id, x.product.Name, x.p.QuantityProduced, x.unit.Id, x.unit.Symbol, x.p.ProducedAt, x.p.CreatedByUserId, x.p.ResponsibleEmployeeId is { } employeeId && responsibleNames.TryGetValue(employeeId, out var name) ? name : null, x.p.Notes)).ToArray(), page, pageSize, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<ProductionSummaryDto> ProductionSummaryAsync(Guid? productId, string? batchCode, ProductionStatus? status, string? responsible, DateTimeOffset? from, DateTimeOffset? to, CancellationToken ct = default)
    {
        var query = ProductionQuery(productId, batchCode, status, responsible, from, to);
        var productionCount = await query.CountAsync(ct);
        var latest = await query
            .Join(db.Products.AsNoTracking(), production => production.ProductId, product => product.Id, (production, product) => new { production, product })
            .OrderByDescending(x => x.production.ProducedAt)
            .ThenByDescending(x => x.production.Id)
            .Select(x => new ProductionSummaryLatestDto(x.production.Id, x.production.BatchCode, x.product.Id, x.product.Name, x.production.ProducedAt))
            .FirstOrDefaultAsync(ct);
        var mostProduced = await query
            .GroupBy(x => x.ProductId)
            .Select(group => new { ProductId = group.Key, ProductionCount = group.Count(), LatestProducedAt = group.Max(x => x.ProducedAt) })
            .Join(db.Products.AsNoTracking(), aggregate => aggregate.ProductId, product => product.Id, (aggregate, product) => new { aggregate, product })
            .OrderByDescending(x => x.aggregate.ProductionCount)
            .ThenByDescending(x => x.aggregate.LatestProducedAt)
            .ThenBy(x => x.aggregate.ProductId)
            .Select(x => new ProductionSummaryMostProducedDto(x.aggregate.ProductId, x.product.Name, x.aggregate.ProductionCount))
            .FirstOrDefaultAsync(ct);
        return new(productionCount, latest, mostProduced);
    }

    private IQueryable<Production> ProductionQuery(Guid? productId, string? batchCode, ProductionStatus? status, string? responsible, DateTimeOffset? from, DateTimeOffset? to)
    {
        var query = db.Productions.AsNoTracking();
        if (productId is not null) query = query.Where(x => x.ProductId == productId);
        if (!string.IsNullOrWhiteSpace(batchCode)) query = query.Where(x => x.BatchCode.ToLower().Contains(batchCode.Trim().ToLower()));
        if (status is not null) query = query.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(responsible)) query = query.Where(x => x.CreatedByUserId == responsible.Trim());
        if (from is not null) query = query.Where(x => x.ProducedAt >= from);
        if (to is not null) query = query.Where(x => x.ProducedAt <= to);
        return query;
    }

    public async Task<ProductionDetailDto?> ProductionAsync(Guid id, CancellationToken ct = default)
    {
        var production = await db.Productions.AsNoTracking().Where(x => x.Id == id)
            .Join(db.Products.AsNoTracking(), p => p.ProductId, product => product.Id, (p, product) => new { p, product })
            .Join(db.Units.AsNoTracking(), x => x.product.InventoryUnitId, unit => unit.Id, (x, unit) => new { x.p, x.product, unit })
            .SingleOrDefaultAsync(ct);
        if (production is null) return null;
        var responsibleName = production.p.ResponsibleEmployeeId is { } employeeId ? await db.Employees.AsNoTracking().Where(x => x.Id == employeeId).Select(x => x.FullName).SingleOrDefaultAsync(ct) : null;
        var consumptions = await db.ProductionConsumptions.AsNoTracking().Where(x => x.ProductionId == id)
            .Join(db.Products.AsNoTracking(), c => c.ComponentProductId, product => product.Id, (c, product) => new { c, product })
            .Join(db.Units.AsNoTracking(), x => x.product.InventoryUnitId, unit => unit.Id, (x, unit) => new ProductionConsumptionHistoryDto(x.product.Id, x.product.Name, x.c.QuantityConsumed, unit.Id, unit.Symbol))
            .ToArrayAsync(ct);
        return new(production.p.Id, production.p.BatchCode, production.p.Status, production.product.Id, production.product.Name, production.p.QuantityProduced, production.unit.Id, production.unit.Symbol, production.p.ProducedAt, production.p.CreatedByUserId, responsibleName, production.p.Notes, consumptions);
    }

    public async Task<(ProductionDto? Value, string? Error)> ProduceAsync(CreateProductionRequest request, string actor, CancellationToken ct = default)
    {
        var requirements = await RequirementsAsync(request.ProductId, request.QuantityProduced, ct); if (requirements.Error is not null) return (null, requirements.Error); if (!requirements.Value!.HasSufficientStock) return (null, "PRODUCTION_STOCK_INSUFFICIENT");
        await using var tx = await db.Database.BeginTransactionAsync(ct); requirements = await RequirementsAsync(request.ProductId, request.QuantityProduced, ct); if (!requirements.Value!.HasSufficientStock) return (null, "PRODUCTION_STOCK_INSUFFICIENT");
        var productionId = Guid.NewGuid(); var production = new Production { Id = productionId, BatchCode = $"PRD-{productionId:N}", Status = ProductionStatus.COMPLETED, ProductId = request.ProductId, QuantityProduced = request.QuantityProduced, Notes = request.Notes?.Trim(), ProducedAt = clock.UtcNow, CreatedByUserId = actor, ResponsibleEmployeeId = await db.Employees.Where(x => x.UserId == actor && x.IsActive).Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct) };
        var commands = requirements.Value.Components.Select(x => new InventoryWriteCommand(x.ProductId, InventoryMovementType.PRODUCTION_CONSUMPTION, -x.RequiredQuantity, "Production", InventoryReferenceType.PRODUCTION, production.Id, actor)).Append(new InventoryWriteCommand(request.ProductId, InventoryMovementType.PRODUCTION_OUTPUT, request.QuantityProduced, "Production", InventoryReferenceType.PRODUCTION, production.Id, actor)).ToArray();
        var batch = await inventory.WriteBatchAsync(commands, false, ct); if (batch.Error is not null) return (null, "PRODUCTION_STOCK_INSUFFICIENT");
        db.Productions.Add(production); db.ProductionConsumptions.AddRange(requirements.Value.Components.Select(x => new ProductionConsumption { ProductionId = production.Id, ComponentProductId = x.ProductId, QuantityConsumed = x.RequiredQuantity })); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return (new(production.Id, request.ProductId, request.QuantityProduced, production.ProducedAt, requirements.Value.Components, production.BatchCode, production.Status), null);
    }

        public async Task<IReadOnlyList<WorkScheduleDto>> WorkSchedulesAsync(CancellationToken ct = default) => await db.WorkSchedules.AsNoTracking().OrderBy(x => x.ShiftType).Select(x => new WorkScheduleDto(x.ShiftType, x.PlannedStart, x.PlannedEnd, x.LateToleranceMinutes)).ToArrayAsync(ct);

        public async Task<(WorkScheduleDto? Value, string? Error)> UpdateWorkScheduleAsync(ShiftType shiftType, WorkScheduleRequest request, CancellationToken ct = default)
        {
            if (!Enum.IsDefined(shiftType) || request.PlannedStart == request.PlannedEnd || request.LateToleranceMinutes < 0) return (null, "INVALID_REQUEST");
            var schedule = await db.WorkSchedules.SingleOrDefaultAsync(x => x.ShiftType == shiftType, ct);
            if (schedule is null) return (null, "SCHEDULE_NOT_CONFIGURED");
            schedule.PlannedStart = request.PlannedStart; schedule.PlannedEnd = request.PlannedEnd; schedule.LateToleranceMinutes = request.LateToleranceMinutes;
            await db.SaveChangesAsync(ct);
            return (new(schedule.ShiftType, schedule.PlannedStart, schedule.PlannedEnd, schedule.LateToleranceMinutes), null);
        }

        public async Task<(ShiftContextDto? Value, string? Error)> OpenAsync(OpenOperationalDayRequest request, string actor, CancellationToken ct = default)
        {
        await using var tx = await db.Database.BeginTransactionAsync(ct); var existing = await db.CashSessions.SingleOrDefaultAsync(x => x.BusinessDate == clock.BusinessDate, ct); if (existing is not null) return (await CurrentShiftAsync(ct), null);
        if (request.OpeningAmount is null || request.PettyCashOpeningAmount is null || request.OpeningAmount < 0 || request.PettyCashOpeningAmount < 0) return (null, "INVALID_REQUEST");
        var openedAt = clock.UtcNow; var session = new CashSession { BusinessDate = clock.BusinessDate, OpenedAt = openedAt, OpenedByUserId = actor, OpeningAmount = request.OpeningAmount, PettyCashOpeningAmount = request.PettyCashOpeningAmount }; session.Shifts.Add(new Shift { Type = ShiftType.MORNING, Status = ShiftStatus.ACTIVE, StartedAt = openedAt }); session.Shifts.Add(new Shift { Type = ShiftType.NIGHT }); db.CashSessions.Add(session); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return (await CurrentShiftAsync(ct), null);
    }

    public async Task<ShiftContextDto?> CurrentShiftAsync(CancellationToken ct = default)
    {
        var session = await db.CashSessions.Include(x => x.Shifts).ThenInclude(x => x.Assignments).SingleOrDefaultAsync(x => x.BusinessDate == clock.BusinessDate && x.IsOpen, ct);
        return session is null ? null : new(session.Id, session.BusinessDate, session.Shifts.Select(x => new ShiftDto(x.Id, x.Type, x.Status, x.Assignments.Select(a => a.EmployeeId).ToArray())).ToArray(), session.CashRemovedAmount, session.CashAmountCarriedForward);
    }

    public async Task<ShiftDto?> MyCurrentShiftAsync(string actor, CancellationToken ct = default)
    {
        var employeeId = await db.Employees.Where(x => x.UserId == actor && x.IsActive).Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct); if (employeeId is null) return null;
        var shift = await CurrentShiftQuery.ActiveAsync(db, clock, includeAssignments: true, forUpdate: false, ct); if (shift is null || !shift.Assignments.Any(x => x.EmployeeId == employeeId)) return null;
        return new(shift.Id, shift.Type, shift.Status, shift.Assignments.Select(x => x.EmployeeId).ToArray());
    }

    public async Task<(ShiftDto? Value, string? Error)> AssignAsync(Guid id, ShiftAssignmentRequest request, string actor, CancellationToken ct = default) { if (request.EmployeeIds is null || request.EmployeeIds.Distinct().Count() != request.EmployeeIds.Count) return (null, "INVALID_REQUEST"); var shift = await db.Shifts.Include(x => x.Assignments).SingleOrDefaultAsync(x => x.Id == id, ct); if (shift is null) return (null, "NOT_FOUND"); var schedule = await db.WorkSchedules.SingleOrDefaultAsync(x => x.ShiftType == shift.Type, ct); if (schedule is null) return (null, "SCHEDULE_NOT_CONFIGURED"); if (await db.Employees.CountAsync(x => request.EmployeeIds.Contains(x.Id) && x.IsActive, ct) != request.EmployeeIds.Count) return (null, "INVALID_REQUEST"); db.ShiftAssignments.RemoveRange(shift.Assignments); db.ShiftAssignments.AddRange(request.EmployeeIds.Select(x => new ShiftAssignment { ShiftId = id, EmployeeId = x, AssignedAt = clock.UtcNow, AssignedByUserId = actor, EffectivePlannedStart = schedule.PlannedStart, EffectivePlannedEnd = schedule.PlannedEnd, EffectiveLateToleranceMinutes = schedule.LateToleranceMinutes })); await db.SaveChangesAsync(ct); return (new(id, shift.Type, shift.Status, request.EmployeeIds), null); }

        public async Task<(ShiftContextDto? Value, string? Error)> HandoverAsync(Guid id, HandoverRequest request, string actor, CancellationToken ct = default)
        {
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            var source = await db.Shifts.FromSqlInterpolated($"SELECT * FROM public.shifts WHERE \"Id\"={id} FOR UPDATE").SingleOrDefaultAsync(ct);
            if (source is null) return (null, "NOT_FOUND");
            var session = await db.CashSessions.FromSqlInterpolated($"SELECT * FROM public.cash_sessions WHERE \"Id\"={source.CashSessionId} FOR UPDATE").SingleOrDefaultAsync(ct);
            if (session is null || !session.IsOpen) return (null, "INVALID_SHIFT_TRANSITION");
            var next = await db.Shifts.FromSqlInterpolated($"SELECT * FROM public.shifts WHERE \"CashSessionId\"={source.CashSessionId} AND \"Status\"='PENDING' FOR UPDATE").SingleOrDefaultAsync(ct);
            if (source.Status != ShiftStatus.ACTIVE || source.Type != ShiftType.MORNING || next is null || next.Type != ShiftType.NIGHT) return (null, "INVALID_SHIFT_TRANSITION");
            if (session.OpeningAmount is null || session.PettyCashOpeningAmount is null) return (null, "UNKNOWN_CASH_POSITION");
            var removed = request.CashRemovedAmount ?? 0m;
            if (removed < 0) return (null, "INVALID_REQUEST");
            var cashSales = await db.Sales.Where(sale => sale.ShiftId == source.Id && sale.PaymentMethod == PaymentMethod.CASH).SumAsync(sale => (decimal?)sale.Total, ct) ?? 0m;
            var physicalExpenses = await db.Expenses.Where(expense => expense.ShiftId == source.Id).SumAsync(expense => (decimal?)expense.Amount, ct) ?? 0m;
            var available = session.OpeningAmount.Value + session.PettyCashOpeningAmount.Value + cashSales - physicalExpenses;
            if (removed > available) return (null, "CASH_REMOVAL_EXCEEDS_AVAILABLE");
            session.CashRemovedAmount = removed;
            session.CashAmountCarriedForward = available - removed;
            source.Status = ShiftStatus.COMPLETED; source.EndedAt = clock.UtcNow; source.HandoverNote = request.Note?.Trim(); next.Status = ShiftStatus.ACTIVE; next.StartedAt = clock.UtcNow;
            await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return (await CurrentShiftAsync(ct), null);
        }

    public async Task<CashPreviewDto?> CashPreviewAsync(CancellationToken ct = default)
    {
        var session = await db.CashSessions.AsNoTracking().SingleOrDefaultAsync(x => x.BusinessDate == clock.BusinessDate, ct);
        if (session is null) return null;
        var shiftIds = await db.Shifts.AsNoTracking().Where(x => x.CashSessionId == session.Id).Select(x => x.Id).ToArrayAsync(ct);
        var sales = await db.Sales.AsNoTracking().Where(x => shiftIds.Contains(x.ShiftId)).ToArrayAsync(ct);
        var expenses = await db.Expenses.AsNoTracking().Where(x => x.ShiftId != null && shiftIds.Contains(x.ShiftId!.Value)).ToArrayAsync(ct);
        var salesTotal = sales.Sum(x => x.Total);
        var cash = sales.Where(x => x.PaymentMethod == PaymentMethod.CASH).Sum(x => x.Total);
        var qr = sales.Where(x => x.PaymentMethod == PaymentMethod.QR).Sum(x => x.Total);
        var ext = sales.Where(x => x.PaymentMethod == PaymentMethod.EXTERNAL).Sum(x => x.Total);
        var direct = sales.Where(x => x.SalesChannel == SalesChannel.DIRECT).Sum(x => x.Total);
        var pedidos = sales.Where(x => x.SalesChannel == SalesChannel.PEDIDOSYA).Sum(x => x.Total);
        var drawer = expenses.Where(x => x.CashSource == RestaurantSystem.Domain.Expenses.CashSource.CASH_DRAWER).Sum(x => x.Amount);
        var petty = expenses.Where(x => x.CashSource == RestaurantSystem.Domain.Expenses.CashSource.PETTY_CASH).Sum(x => x.Amount);
        var expTotal = drawer + petty;
        var opening = session.OpeningAmount ?? 0m;
        var pettyOpening = session.PettyCashOpeningAmount ?? 0m;
        var removed = session.CashRemovedAmount ?? 0m;
        var expected = opening + pettyOpening + cash - drawer - petty - removed;
        var shifts = await db.Shifts.AsNoTracking().Where(x => x.CashSessionId == session.Id).Include(x => x.Assignments).ToArrayAsync(ct);
    var shiftDtos = shifts.Select(s => new ShiftDto(s.Id, s.Type, s.Status, s.Assignments.Select(a => a.EmployeeId).ToArray())).ToArray();
        return new CashPreviewDto(session.Id, session.BusinessDate, opening, pettyOpening, removed, session.CashAmountCarriedForward, salesTotal, cash, qr, ext, direct, pedidos, drawer, petty, expTotal, expected, shiftDtos);
    }

public async Task<(CashClosingDto? Value, string? Error)> CloseCashAsync(CloseCashRequest request, string actor, CancellationToken ct = default)
{
    if (request.DeclaredCash < 0) return (null, "INVALID_REQUEST");
    await using var tx = await db.Database.BeginTransactionAsync(ct);
    var session = await db.CashSessions.FromSqlInterpolated($"SELECT * FROM public.cash_sessions WHERE \"BusinessDate\"={clock.BusinessDate} FOR UPDATE").SingleOrDefaultAsync(ct);
    if (session is null || !session.IsOpen) return (null, "NO_OPEN_CASH_SESSION");
    if (await db.CashClosings.AnyAsync(x => x.CashSessionId == session.Id, ct)) return (null, "CASH_ALREADY_CLOSED");
    if (session.OpeningAmount is null || session.PettyCashOpeningAmount is null) return (null, "UNKNOWN_CASH_POSITION");
    var shifts = await db.Shifts.FromSqlInterpolated($"SELECT * FROM public.shifts WHERE \"CashSessionId\"={session.Id} FOR UPDATE").ToArrayAsync(ct);
    var morning = shifts.SingleOrDefault(x => x.Type == ShiftType.MORNING);
    var night = shifts.SingleOrDefault(x => x.Type == ShiftType.NIGHT);
    if (morning is null || night is null) return (null, "INVALID_SHIFT_TRANSITION");
    if (morning.Status != ShiftStatus.COMPLETED || night.Status != ShiftStatus.ACTIVE) return (null, "INVALID_SHIFT_TRANSITION");
    var shiftIds = shifts.Select(x => x.Id).ToArray();
    var sales = await db.Sales.AsNoTracking().Where(x => shiftIds.Contains(x.ShiftId)).ToArrayAsync(ct);
    var expenses = await db.Expenses.AsNoTracking().Where(x => x.ShiftId != null && shiftIds.Contains(x.ShiftId!.Value)).ToArrayAsync(ct);
    var salesTotal = sales.Sum(x => x.Total);
    var cash = sales.Where(x => x.PaymentMethod == PaymentMethod.CASH).Sum(x => x.Total);
    var qr = sales.Where(x => x.PaymentMethod == PaymentMethod.QR).Sum(x => x.Total);
    var ext = sales.Where(x => x.PaymentMethod == PaymentMethod.EXTERNAL).Sum(x => x.Total);
    var direct = sales.Where(x => x.SalesChannel == SalesChannel.DIRECT).Sum(x => x.Total);
    var pedidos = sales.Where(x => x.SalesChannel == SalesChannel.PEDIDOSYA).Sum(x => x.Total);
    var drawer = expenses.Where(x => x.CashSource == RestaurantSystem.Domain.Expenses.CashSource.CASH_DRAWER).Sum(x => x.Amount);
    var petty = expenses.Where(x => x.CashSource == RestaurantSystem.Domain.Expenses.CashSource.PETTY_CASH).Sum(x => x.Amount);
    var expTotal = drawer + petty;
    var opening = session.OpeningAmount.Value;
    var pettyOpening = session.PettyCashOpeningAmount.Value;
    var removed = session.CashRemovedAmount ?? 0m;
    var expected = opening + pettyOpening + cash - drawer - petty - removed;
    var difference = request.DeclaredCash - expected;
    if (difference != 0 && string.IsNullOrWhiteSpace(request.Observation)) return (null, "OBSERVATION_REQUIRED");
    var closing = new CashClosing { CashSessionId = session.Id, BusinessDate = session.BusinessDate, OpeningAmount = opening, PettyCashOpeningAmount = pettyOpening, CashRemovedAmount = removed, SalesTotal = salesTotal, CashSalesTotal = cash, QrSalesTotal = qr, ExternalSalesTotal = ext, DirectSalesTotal = direct, PedidosYaSalesTotal = pedidos, CashDrawerExpensesTotal = drawer, PettyCashExpensesTotal = petty, ExpensesTotal = expTotal, ExpectedCash = expected, DeclaredCash = request.DeclaredCash, Difference = difference, Observation = string.IsNullOrWhiteSpace(request.Observation) ? null : request.Observation.Trim(), ClosedByUserId = actor, ClosedAt = clock.UtcNow };
    db.CashClosings.Add(closing);
    night.Status = ShiftStatus.COMPLETED; night.EndedAt = clock.UtcNow;
    session.IsOpen = false;
    try { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); }
    catch (DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException { SqlState: "23505" }) { return (null, "CASH_ALREADY_CLOSED"); }
    return (new CashClosingDto(closing.Id, closing.CashSessionId, closing.BusinessDate, closing.OpeningAmount, closing.PettyCashOpeningAmount, closing.CashRemovedAmount, closing.SalesTotal, closing.CashSalesTotal, closing.QrSalesTotal, closing.ExternalSalesTotal, closing.DirectSalesTotal, closing.PedidosYaSalesTotal, closing.CashDrawerExpensesTotal, closing.PettyCashExpensesTotal, closing.ExpensesTotal, closing.ExpectedCash, closing.DeclaredCash, closing.Difference, closing.Observation, closing.ClosedByUserId, closing.ClosedAt), null);
}

public async Task<PagedResponse<CashClosingDto>> CashClosingsAsync(int page, int pageSize, DateOnly? from, DateOnly? to, CancellationToken ct = default)
{
    var query = db.CashClosings.AsNoTracking();
    if (from is not null) query = query.Where(x => x.BusinessDate >= from.Value);
    if (to is not null) query = query.Where(x => x.BusinessDate <= to.Value);
    var total = await query.CountAsync(ct);
    var rows = await query.OrderByDescending(x => x.ClosedAt).ThenByDescending(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize).ToArrayAsync(ct);
    return new(rows.Select(x => new CashClosingDto(x.Id, x.CashSessionId, x.BusinessDate, x.OpeningAmount, x.PettyCashOpeningAmount, x.CashRemovedAmount, x.SalesTotal, x.CashSalesTotal, x.QrSalesTotal, x.ExternalSalesTotal, x.DirectSalesTotal, x.PedidosYaSalesTotal, x.CashDrawerExpensesTotal, x.PettyCashExpensesTotal, x.ExpensesTotal, x.ExpectedCash, x.DeclaredCash, x.Difference, x.Observation, x.ClosedByUserId, x.ClosedAt)).ToArray(), page, pageSize, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize));
}

public async Task<CashClosingDto?> CashClosingAsync(Guid id, CancellationToken ct = default)
{
    var x = await db.CashClosings.AsNoTracking().SingleOrDefaultAsync(c => c.Id == id, ct);
    return x is null ? null : new CashClosingDto(x.Id, x.CashSessionId, x.BusinessDate, x.OpeningAmount, x.PettyCashOpeningAmount, x.CashRemovedAmount, x.SalesTotal, x.CashSalesTotal, x.QrSalesTotal, x.ExternalSalesTotal, x.DirectSalesTotal, x.PedidosYaSalesTotal, x.CashDrawerExpensesTotal, x.PettyCashExpensesTotal, x.ExpensesTotal, x.ExpectedCash, x.DeclaredCash, x.Difference, x.Observation, x.ClosedByUserId, x.ClosedAt);
}

public Task<SalesReportDto> SalesReportAsync(AuthorizedSalesScope scope, DateOnly? from, DateOnly? to, CancellationToken ct = default) => SalesReportAsync(scope, from, to, null, null, ct);

public async Task<SalesReportDto> SalesReportAsync(AuthorizedSalesScope scope, DateOnly? from, DateOnly? to, ShiftType? shiftType, SalesChannel? salesChannel, CancellationToken ct = default)
{
    var query = from sale in scope.Apply(db.Sales.AsNoTracking())
join shift in db.Shifts.AsNoTracking() on sale.ShiftId equals shift.Id
join session in db.CashSessions.AsNoTracking() on shift.CashSessionId equals session.Id
select new { Sale = sale, ShiftType = shift.Type, BusinessDate = session.BusinessDate };
    if (from is not null) query = query.Where(x => x.BusinessDate >= from.Value);
    if (to is not null) query = query.Where(x => x.BusinessDate <= to.Value);
    if (shiftType is not null) query = query.Where(x => x.ShiftType == shiftType.Value);
    if (salesChannel is not null) query = query.Where(x => x.Sale.SalesChannel == salesChannel.Value);
    var rows = await query.ToArrayAsync(ct);
    var total = rows.Sum(x => x.Sale.Total);
    var cash = rows.Where(x => x.Sale.PaymentMethod == PaymentMethod.CASH).Sum(x => x.Sale.Total);
    var qr = rows.Where(x => x.Sale.PaymentMethod == PaymentMethod.QR).Sum(x => x.Sale.Total);
    var ext = rows.Where(x => x.Sale.PaymentMethod == PaymentMethod.EXTERNAL).Sum(x => x.Sale.Total);
    var direct = rows.Where(x => x.Sale.SalesChannel == SalesChannel.DIRECT).Sum(x => x.Sale.Total);
    var pedidos = rows.Where(x => x.Sale.SalesChannel == SalesChannel.PEDIDOSYA).Sum(x => x.Sale.Total);
    var series = rows.GroupBy(x => x.BusinessDate).OrderBy(x => x.Key).Select(x => new SalesReportSeriesDto(x.Key, x.Count(), x.Sum(row => row.Sale.Total))).ToArray();
    return new(rows.Length, total, cash, qr, ext, direct, pedidos, series);
}

public async Task<InventoryReportDto> InventoryReportAsync(CancellationToken ct = default)
{
    var rows = await db.Products.AsNoTracking().Join(db.InventoryBalances.AsNoTracking(), p => p.Id, b => b.ProductId, (p, b) => new { p, b }).ToArrayAsync(ct);
    var units = await db.Units.AsNoTracking().ToDictionaryAsync(u => u.Id, u => u.Symbol, ct);
    var items = rows.Select(x =>
    {
var qty = x.b.Quantity;
var min = x.p.MinStock;
string state = qty < 0 ? "NEGATIVE" : (min != null && qty <= min ? "LOW" : "NORMAL");
return new InventoryReportItemDto(x.p.Id, x.p.Name, qty, min, state, units.GetValueOrDefault(x.p.InventoryUnitId, ""));
    }).ToArray();
    var low = items.Count(i => i.StockState == "LOW" || i.StockState == "NEGATIVE");
    var neg = items.Count(i => i.StockState == "NEGATIVE");
    return new(items, items.Length, low, neg);
}

public Task<AttendanceReportDto> AttendanceReportAsync(DateOnly? from, DateOnly? to, Guid? employeeId, CancellationToken ct = default) => AttendanceReportAsync(from, to, employeeId, null, ct);

public async Task<AttendanceReportDto> AttendanceReportAsync(DateOnly? from, DateOnly? to, Guid? employeeId, ShiftType? shiftType, CancellationToken ct = default)
{
    var empQuery = db.Employees.AsNoTracking().AsQueryable();
    if (employeeId is not null) empQuery = empQuery.Where(e => e.Id == employeeId.Value);
    var employees = await empQuery.ToArrayAsync(ct);
    var query = from assignment in db.ShiftAssignments.AsNoTracking()
join shift in db.Shifts.AsNoTracking() on assignment.ShiftId equals shift.Id
join session in db.CashSessions.AsNoTracking() on shift.CashSessionId equals session.Id
join employee in db.Employees.AsNoTracking() on assignment.EmployeeId equals employee.Id
join record in db.AttendanceRecords.AsNoTracking()
on new { assignment.EmployeeId, session.BusinessDate }
equals new { record.EmployeeId, record.BusinessDate } into records
from record in records.DefaultIfEmpty()
select new { Assignment = assignment, Shift = shift, Session = session, Employee = employee, Record = record };
    if (employeeId is not null) query = query.Where(x => x.Employee.Id == employeeId.Value);
    if (from is not null) query = query.Where(x => x.Session.BusinessDate >= from.Value);
    if (to is not null) query = query.Where(x => x.Session.BusinessDate <= to.Value);
    if (shiftType is not null) query = query.Where(x => x.Shift.Type == shiftType.Value);
    var rows = await query.ToArrayAsync(ct);
    var derivation = new AttendanceDerivationService(clock);
    var payroll = new PayrollProjectionCalculator();
    var derivedRows = rows.Select(x => new
    {
x.Employee.Id,
Derived = derivation.Derive(new(x.Session, x.Shift, x.Assignment, x.Record))
    }).ToArray();
    var items = employees.Select(employee =>
    {
var employeeRows = derivedRows.Where(x => x.Id == employee.Id).ToArray();
var projection = payroll.Calculate(employeeRows.Select(x => x.Derived), employee.HourlyRate);
return new AttendanceReportItemDto(
employee.Id,
employee.FullName,
employeeRows.Count(x => x.Derived.Lifecycle is AttendanceLifecycle.OPEN or AttendanceLifecycle.CLOSED),
projection.WorkedMinutes,
projection.WorkedHours,
employeeRows.Count(x => x.Derived.IsLate),
employeeRows.Count(x => x.Derived.IsAbsent),
employee.HourlyRate,
projection.ProjectedPay);
    }).ToArray();
    var summary = new AttendanceReportSummaryDto(
items.Sum(x => x.AttendanceCount),
items.Sum(x => x.WorkedMinutes),
items.Sum(x => x.WorkedHours),
items.Sum(x => x.LateCount),
items.Sum(x => x.AbsenceCount),
items.Sum(x => x.ProjectedPay));
    return new(items, summary);
}
    
    public async Task<(SaleDto? Value, string? Error, IReadOnlyList<InventoryShortageDto>? Shortages)> ConfirmSaleAsync(ConfirmSaleRequest request, string actor, CancellationToken ct = default)
    {
        if (!Enum.IsDefined(request.SalesChannel) || !Enum.IsDefined(request.PaymentMethod)) return (null, "INVALID_REQUEST", null);
            await using var tx = await db.Database.BeginTransactionAsync(ct);
            Customer? customer = null;
            if (request.CustomerId is { } customerId)
            {
                customer = await db.Customers.SingleOrDefaultAsync(x => x.Id == customerId, ct);
                if (customer is null) return (null, "CUSTOMER_NOT_FOUND", null);
                if (!customer.IsActive) return (null, "CUSTOMER_INACTIVE", null);
            }
            var order = await db.Orders.FromSqlInterpolated($"SELECT * FROM public.orders WHERE id={request.OrderId} FOR UPDATE").Include(x => x.Items).SingleOrDefaultAsync(ct); if (order is null) return (null, "NOT_FOUND", null); if (order.Status != Domain.Orders.OrderStatus.ENTREGADO) return (null, "ORDER_NOT_DELIVERED", null); if (await db.Sales.AnyAsync(x => x.OrderId == request.OrderId, ct)) return (null, "SALE_ALREADY_CONFIRMED", null);
        var shift = await CurrentShiftQuery.ActiveAsync(db, clock, includeAssignments: false, forUpdate: true, ct); if (shift is null) return (null, "NO_ACTIVE_SHIFT", null);
        var ids = order.Items.Select(x => x.ProductId).ToArray(); var products = await db.Products.Where(x => ids.Contains(x.Id)).ToDictionaryAsync(x => x.Id, ct); var units = await db.Units.Where(x => products.Values.Select(p => p.InventoryUnitId).Contains(x.Id)).ToDictionaryAsync(x => x.Id, ct); var balances = await db.InventoryBalances.Where(x => ids.Contains(x.ProductId)).ToDictionaryAsync(x => x.ProductId, x => x.Quantity, ct);
        var precheck = order.Items.GroupBy(x => x.ProductId).Select(x => new InventoryShortageDto(x.Key, products[x.Key].Name, x.Sum(y => y.Quantity), balances.GetValueOrDefault(x.Key), Math.Max(0, x.Sum(y => y.Quantity) - balances.GetValueOrDefault(x.Key)), products[x.Key].InventoryUnitId, units[products[x.Key].InventoryUnitId].Symbol)).Where(x => x.ShortageQuantity > 0).ToArray(); var allowNegative = request.AcknowledgeStockShortage || order.StockShortageAcknowledgedAt is not null;
        if (precheck.Length > 0 && !allowNegative) return (null, "SALE_STOCK_CONFIRMATION_REQUIRED", precheck);
        var sale = new Sale { OrderId = request.OrderId, ShiftId = shift.Id, CustomerId = customer?.Id, CustomerNameSnapshot = customer?.Name, CustomerCiSnapshot = customer?.Ci, CustomerNitSnapshot = customer?.Nit, SalesChannel = request.SalesChannel, PaymentMethod = request.PaymentMethod, ConfirmedAt = clock.UtcNow, ConfirmedByUserId = actor, Subtotal = order.Items.Sum(x => x.Quantity * x.UnitPrice), Total = order.Items.Sum(x => x.Quantity * x.UnitPrice) }; sale.Items.AddRange(order.Items.Select(x => new SaleItem { OrderItemId = x.Id, ProductId = x.ProductId, Quantity = x.Quantity, UnitPrice = x.UnitPrice, LineTotal = x.Quantity * x.UnitPrice })); db.Sales.Add(sale); await db.SaveChangesAsync(ct);
        var batch = await inventory.WriteBatchAsync(order.Items.GroupBy(x => x.ProductId).Select(x => new InventoryWriteCommand(x.Key, InventoryMovementType.SALE, -x.Sum(y => y.Quantity), "Sale", InventoryReferenceType.SALE, sale.Id, actor)).ToArray(), allowNegative, ct);
        if (batch.Error is not null) { var shortages = batch.Error == "STOCK_INSUFFICIENT" && batch.Value is not null ? batch.Value.Shortages.Select(x => new InventoryShortageDto(x.ProductId, products[x.ProductId].Name, x.Required, x.Current, Math.Max(0, x.Required - x.Current), products[x.ProductId].InventoryUnitId, units[products[x.ProductId].InventoryUnitId].Symbol)).ToArray() : precheck; return (null, "SALE_STOCK_CONFIRMATION_REQUIRED", shortages); }
        if (request.AcknowledgeStockShortage && precheck.Length > 0 && order.StockShortageAcknowledgedAt is null) { order.StockShortageAcknowledgedAt = clock.UtcNow; order.StockShortageAcknowledgedByUserId = actor; await db.SaveChangesAsync(ct); }
        var displayName = await db.Employees.Where(x => x.UserId == actor).Select(x => x.FullName).FirstOrDefaultAsync(ct) ?? await db.Users.Where(x => x.Id == actor).Select(x => x.UserName).FirstOrDefaultAsync(ct);
        await tx.CommitAsync(ct); return (new(sale.Id, sale.OrderId, sale.ShiftId, sale.Subtotal, sale.Total, sale.Items.Select(x => new SaleItemDto(x.ProductId, x.Quantity, x.UnitPrice, x.LineTotal)).ToArray(), sale.SalesChannel, sale.PaymentMethod, sale.ConfirmedAt, sale.ConfirmedByUserId, displayName), null, null);
    }

    public async Task<PagedResponse<SalesHistoryDto>> SalesAsync(AuthorizedSalesScope scope, int page, int pageSize, DateTimeOffset? from, DateTimeOffset? to, Guid? shiftId, SalesChannel? salesChannel, PaymentMethod? paymentMethod, string? customerSearch, CancellationToken ct = default)
    {
        var query = scope.Apply(db.Sales.AsNoTracking());
        if (from is not null) query = query.Where(sale => sale.ConfirmedAt >= from);
        if (to is not null) query = query.Where(sale => sale.ConfirmedAt <= to);
        if (shiftId is not null) query = query.Where(sale => sale.ShiftId == shiftId);
        if (salesChannel is not null) query = query.Where(sale => sale.SalesChannel == salesChannel);
        if (paymentMethod is not null) query = query.Where(sale => sale.PaymentMethod == paymentMethod);
        if (!string.IsNullOrWhiteSpace(customerSearch)) { var term = customerSearch.Trim().ToLower(); query = query.Where(sale => (sale.CustomerNameSnapshot != null && sale.CustomerNameSnapshot.ToLower().Contains(term)) || (sale.CustomerCiSnapshot != null && sale.CustomerCiSnapshot.ToLower().Contains(term)) || (sale.CustomerNitSnapshot != null && sale.CustomerNitSnapshot.ToLower().Contains(term))); }
        var total = await query.CountAsync(ct);
        var rows = await query.OrderByDescending(sale => sale.ConfirmedAt).ThenByDescending(sale => sale.Id).Skip((page - 1) * pageSize).Take(pageSize)
            .Join(db.Shifts.AsNoTracking(), sale => sale.ShiftId, shift => shift.Id, (sale, shift) => new { sale, shift })
            .Join(db.CashSessions.AsNoTracking(), row => row.shift.CashSessionId, session => session.Id, (row, session) => new { row.sale, row.shift, session.BusinessDate })
            .ToArrayAsync(ct);
        var names = await ResponsibleNamesAsync(rows.Select(row => row.sale.ConfirmedByUserId), ct);
        return new(rows.Select(row => new SalesHistoryDto(row.sale.Id, row.sale.ConfirmedAt, row.BusinessDate, row.sale.ShiftId, row.shift.Type, row.sale.SalesChannel, row.sale.PaymentMethod, row.sale.Subtotal, row.sale.Total, row.sale.ConfirmedByUserId, names.GetValueOrDefault(row.sale.ConfirmedByUserId), row.sale.CustomerId, row.sale.CustomerNameSnapshot, row.sale.CustomerCiSnapshot, row.sale.CustomerNitSnapshot)).ToArray(), page, pageSize, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<SalesDetailDto?> SaleAsync(AuthorizedSalesScope scope, Guid id, CancellationToken ct = default)
    {
        var row = await scope.Apply(db.Sales.AsNoTracking()).Where(sale => sale.Id == id)
            .Join(db.Shifts.AsNoTracking(), sale => sale.ShiftId, shift => shift.Id, (sale, shift) => new { sale, shift })
            .Join(db.CashSessions.AsNoTracking(), value => value.shift.CashSessionId, session => session.Id, (value, session) => new { value.sale, value.shift, session.BusinessDate })
            .SingleOrDefaultAsync(ct);
        if (row is null) return null;
        var items = await db.SaleItems.AsNoTracking().Where(item => item.SaleId == id)
            .Join(db.Products.AsNoTracking(), item => item.ProductId, product => product.Id, (item, product) => new SalesHistoryItemDto(item.ProductId, product.Name, item.Quantity, item.UnitPrice, item.LineTotal)).ToArrayAsync(ct);
        var names = await ResponsibleNamesAsync([row.sale.ConfirmedByUserId], ct);
        return new(row.sale.Id, row.sale.ConfirmedAt, row.BusinessDate, row.sale.ShiftId, row.shift.Type, row.sale.SalesChannel, row.sale.PaymentMethod, row.sale.Subtotal, row.sale.Total, row.sale.ConfirmedByUserId, names.GetValueOrDefault(row.sale.ConfirmedByUserId), row.sale.CustomerId, row.sale.CustomerNameSnapshot, row.sale.CustomerCiSnapshot, row.sale.CustomerNitSnapshot, items);
    }

    private async Task<Dictionary<string, string?>> ResponsibleNamesAsync(IEnumerable<string> userIds, CancellationToken ct)
    {
        var ids = userIds.Distinct().ToArray();
        var employees = await db.Employees.AsNoTracking().Where(employee => ids.Contains(employee.UserId)).ToDictionaryAsync(employee => employee.UserId, employee => employee.FullName, ct);
        var users = await db.Users.AsNoTracking().Where(user => ids.Contains(user.Id)).ToDictionaryAsync(user => user.Id, user => user.UserName, ct);
        return ids.ToDictionary(id => id, id => employees.GetValueOrDefault(id) ?? users.GetValueOrDefault(id));
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

        public async Task<PagedResponse<PurchaseHistoryDto>> PurchaseHistoryAsync(IReadOnlySet<string> roles, int page, int size, PurchaseStatus? status, Guid? supplierId, string? purchaseArea, string? responsible, DateOnly? from, DateOnly? to, CancellationToken ct = default)
        {
            var query = AuthorizedPurchases(roles); if (status is not null) query = query.Where(x => x.Status == status); if (supplierId is not null) query = query.Where(x => x.SupplierId == supplierId); if (from is not null) query = query.Where(x => x.PurchaseDate >= from); if (to is not null) query = query.Where(x => x.PurchaseDate <= to); if (!string.IsNullOrWhiteSpace(responsible)) query = query.Where(x => x.CreatedByUserId.Contains(responsible));
            if (!string.IsNullOrWhiteSpace(purchaseArea)) query = purchaseArea.Equals("KITCHEN", StringComparison.OrdinalIgnoreCase) ? KitchenPurchases(query) : query.Where(p => db.PurchaseItems.Join(db.Products, i => i.ProductId, product => product.Id, (i, product) => new { i, product }).Any(x => x.i.PurchaseId == p.Id && x.product.ProductType != ProductType.INGREDIENT));
            var total = await query.CountAsync(ct); var rows = await query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id).Skip((page - 1) * size).Take(size).Join(db.Suppliers.AsNoTracking(), p => p.SupplierId, s => s.Id, (p, s) => new { purchase = p, s.Name }).ToArrayAsync(ct); var ids = rows.Select(x => x.purchase.Id).ToArray(); var general = await GeneralPurchaseIds(ids, ct); var names = await ResponsibleNamesAsync(rows.Select(x => x.purchase.CreatedByUserId), ct);
            return new(rows.Select(x => new PurchaseHistoryDto(x.purchase.Id, x.purchase.PurchaseDate, x.purchase.SupplierId, x.Name, general.Contains(x.purchase.Id) ? "GENERAL" : "KITCHEN", x.purchase.Status, x.purchase.Total, x.purchase.CreatedByUserId, names.GetValueOrDefault(x.purchase.CreatedByUserId), x.purchase.CancellationReason, x.purchase.CancelledAt, x.purchase.CancelledByUserId)).ToArray(), page, size, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)size));
        }

        public async Task<PurchaseDetailDto?> PurchaseDetailAsync(IReadOnlySet<string> roles, Guid id, CancellationToken ct = default)
        {
            var purchase = await AuthorizedPurchases(roles).Where(x => x.Id == id).Join(db.Suppliers.AsNoTracking(), p => p.SupplierId, s => s.Id, (p, s) => new { purchase = p, s.Name }).SingleOrDefaultAsync(ct); if (purchase is null) return null;
            var items = await db.PurchaseItems.AsNoTracking().Where(x => x.PurchaseId == id).Join(db.Products.AsNoTracking(), i => i.ProductId, product => product.Id, (i, product) => new { i, product }).Join(db.Units.AsNoTracking(), x => x.i.UnitId, unit => unit.Id, (x, unit) => new PurchaseHistoryItemDto(x.i.Id, x.i.ProductId, x.product.Name, x.i.Quantity, x.i.UnitId, unit.Symbol, x.i.UnitCost, x.i.LineTotal)).ToArrayAsync(ct); var receipt = await db.PurchaseReceipts.AsNoTracking().SingleOrDefaultAsync(x => x.PurchaseId == id, ct); var names = await ResponsibleNamesAsync(new[] { purchase.purchase.CreatedByUserId }.Concat(receipt is null ? [] : new[] { receipt.ReceivedByUserId }), ct);
            PurchaseReceiptHistoryDto? receiptDto = null; if (receipt is not null) { var lines = await db.PurchaseReceiptLines.AsNoTracking().Where(x => x.PurchaseReceiptId == receipt.Id).Join(db.Units.AsNoTracking(), x => x.UnitId, unit => unit.Id, (x, unit) => new PurchaseReceiptHistoryLineDto(x.PurchaseItemId, x.ReceivedQuantity, x.UnitId, unit.Symbol)).ToArrayAsync(ct); receiptDto = new(receipt.Id, receipt.ReceivedAt, receipt.ReceivedByUserId, names.GetValueOrDefault(receipt.ReceivedByUserId), receipt.Notes, lines); }
            return new(purchase.purchase.Id, purchase.purchase.PurchaseDate, purchase.purchase.SupplierId, purchase.Name, (await GeneralPurchaseIds([id], ct)).Contains(id) ? "GENERAL" : "KITCHEN", purchase.purchase.Status, purchase.purchase.Total, purchase.purchase.CreatedByUserId, names.GetValueOrDefault(purchase.purchase.CreatedByUserId), purchase.purchase.ReceiptReference, purchase.purchase.Notes, purchase.purchase.CancellationReason, purchase.purchase.CancelledAt, purchase.purchase.CancelledByUserId, items, receiptDto);
        }

        private IQueryable<Purchase> AuthorizedPurchases(IReadOnlySet<string> roles) => roles.Contains("ADMINISTRADOR") || roles.Contains("ENCARGADO") || roles.Contains("CONTADORA") ? db.Purchases.AsNoTracking() : roles.Contains("COCINA") ? KitchenPurchases(db.Purchases.AsNoTracking()) : db.Purchases.AsNoTracking().Where(_ => false);
        private IQueryable<Purchase> KitchenPurchases(IQueryable<Purchase> query) => query.Where(p => !db.PurchaseItems.Join(db.Products, i => i.ProductId, product => product.Id, (i, product) => new { i, product }).Any(x => x.i.PurchaseId == p.Id && x.product.ProductType != ProductType.INGREDIENT));
        private async Task<HashSet<Guid>> GeneralPurchaseIds(Guid[] ids, CancellationToken ct) => (await db.PurchaseItems.AsNoTracking().Where(i => ids.Contains(i.PurchaseId)).Join(db.Products.AsNoTracking(), i => i.ProductId, product => product.Id, (i, product) => new { i.PurchaseId, product.ProductType }).Where(x => x.ProductType != ProductType.INGREDIENT).Select(x => x.PurchaseId).Distinct().ToArrayAsync(ct)).ToHashSet();

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
