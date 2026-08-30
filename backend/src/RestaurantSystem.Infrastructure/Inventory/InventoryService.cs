using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Application.Inventory;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Inventory;

namespace RestaurantSystem.Infrastructure.Inventory;

public sealed class InventoryService(ApplicationDbContext db) : IInventoryService, IInventoryWriter
{
    public async Task<(InventoryMovementDto? Value, string? Error)> RecordManualAsync(RecordManualInventoryMovementRequest request, string actorUserId, CancellationToken ct = default)
    {
        if (request.ProductId == Guid.Empty || request.Quantity <= 0 || string.IsNullOrWhiteSpace(request.Reason) || request.Reason.Trim().Length > 500)
            return (null, "INVALID_REQUEST");
        if (request.Type is not (InventoryMovementType.ENTRY or InventoryMovementType.WRITE_OFF)) return (null, "MANUAL_MOVEMENT_TYPE_NOT_ALLOWED");
        var delta = request.Type == InventoryMovementType.ENTRY ? request.Quantity : -request.Quantity;
        return await WriteAsync(new(request.ProductId, request.Type, delta, request.Reason.Trim(), InventoryReferenceType.MANUAL, null, actorUserId), ct);
    }

    public async Task<(InventoryMovementDto? Value, string? Error)> WriteAsync(InventoryWriteCommand command, CancellationToken ct = default)
    {
        if (command.ProductId == Guid.Empty || command.QuantityDelta == 0 || string.IsNullOrWhiteSpace(command.ActorUserId)) return (null, "INVALID_REQUEST");
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        // Product is deliberately locked first; deactivation and every manual write serialize on this row.
        var product = await db.Products.FromSqlInterpolated($"SELECT * FROM public.\"Products\" WHERE \"Id\" = {command.ProductId} FOR UPDATE").SingleOrDefaultAsync(ct);
        if (product is null) return (null, "NOT_FOUND");
        if (!product.IsActive) return (null, "PRODUCT_INACTIVE");
        await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO public.inventory_balances (product_id, quantity, updated_at) VALUES ({command.ProductId}, {0m}, {DateTimeOffset.UtcNow}) ON CONFLICT (product_id) DO NOTHING", ct);
        var balance = await db.InventoryBalances.FromSqlInterpolated($"SELECT * FROM public.inventory_balances WHERE product_id = {command.ProductId} FOR UPDATE").SingleAsync(ct);
        var now = DateTimeOffset.UtcNow;
        balance.Quantity += command.QuantityDelta;
        balance.UpdatedAt = now;
        var movement = new InventoryMovement { ProductId = command.ProductId, MovementType = command.Type, QuantityDelta = command.QuantityDelta, Reason = command.Reason, ReferenceType = command.ReferenceType, ReferenceId = command.ReferenceId, CreatedAt = now, CreatedByUserId = command.ActorUserId };
        db.InventoryMovements.Add(movement);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return (await MovementAsync(movement.Id, ct), null);
    }

    public async Task<PagedResponse<InventoryBalanceDto>> BalancesAsync(int page, int pageSize, string? search, ProductType? productType, bool? active, CancellationToken ct = default)
    {
        var q = from p in db.Products.AsNoTracking()
                join b in db.InventoryBalances.AsNoTracking() on p.Id equals b.ProductId into balances
                from b in balances.DefaultIfEmpty()
                join u in db.Units.AsNoTracking() on p.InventoryUnitId equals u.Id
                select new { p, b, u };
        q = q.Where(x => x.p.IsActive == (active ?? true));
        if (!string.IsNullOrWhiteSpace(search)) { var needle = search.Trim().ToLower(); q = q.Where(x => x.p.Name.ToLower().Contains(needle)); }
        if (productType is not null) q = q.Where(x => x.p.ProductType == productType);
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(x => x.p.Name).ThenBy(x => x.p.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return new(rows.Select(x => Balance(x.p, x.b, x.u)).ToArray(), page, pageSize, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize));
    }

        public async Task<InventorySummaryDto> SummaryAsync(CancellationToken ct = default)
        {
            var q = from p in db.Products.AsNoTracking()
                    join b in db.InventoryBalances.AsNoTracking() on p.Id equals b.ProductId into balances
                    from b in balances.DefaultIfEmpty()
                    join u in db.Units.AsNoTracking() on p.InventoryUnitId equals u.Id
                    where p.IsActive
                    select new { p, b, u };
            var total = await q.CountAsync(ct);
            var negatives = await q.CountAsync(x => (x.b == null ? 0m : x.b.Quantity) < 0m, ct);
            var low = q.Where(x => (x.b == null ? 0m : x.b.Quantity) < 0m || (x.p.MinStock != null && (x.b == null ? 0m : x.b.Quantity) <= x.p.MinStock));
            var lowCount = await low.CountAsync(ct);
            var items = (await low.OrderBy(x => x.p.Name).ThenBy(x => x.p.Id).ToListAsync(ct))
                .Select(x => Balance(x.p, x.b, x.u))
                .ToArray();
            return new(total, lowCount, negatives, total - lowCount, items);
        }

        public async Task<PagedResponse<InventoryMovementDto>> MovementsAsync(int page, int pageSize, Guid? productId, InventoryMovementType? movementType, DateOnly? from, DateOnly? to, CancellationToken ct = default)
    {
        if (from > to) throw new ArgumentException("Invalid date range");
        var q = db.InventoryMovements.AsNoTracking().AsQueryable();
        if (productId is not null) q = q.Where(x => x.ProductId == productId); if (movementType is not null) q = q.Where(x => x.MovementType == movementType);
        var start = from is null ? (DateTimeOffset?)null : new DateTimeOffset(from.Value.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        var end = to is null ? (DateTimeOffset?)null : new DateTimeOffset(to.Value.AddDays(1).ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        if (start is not null) q = q.Where(x => x.CreatedAt >= start); if (end is not null) q = q.Where(x => x.CreatedAt < end);
        var total = await q.CountAsync(ct);
        var ids = await q.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize).Select(x => x.Id).ToArrayAsync(ct);
        var items = new List<InventoryMovementDto>(); foreach (var id in ids) items.Add((await MovementAsync(id, ct))!);
        return new(items, page, pageSize, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize));
    }

    public async Task<(InventoryBatchResult? Value, string? Error)> WriteBatchAsync(IReadOnlyList<InventoryWriteCommand> commands, bool allowNegative, CancellationToken ct = default)
    {
        if (commands.Count == 0 || commands.Any(x => x.ProductId == Guid.Empty || x.QuantityDelta == 0 || string.IsNullOrWhiteSpace(x.ActorUserId))) return (null, "INVALID_REQUEST");
        var owns = db.Database.CurrentTransaction is null;
        await using var tx = owns ? await db.Database.BeginTransactionAsync(ct) : null;
        var ids = commands.Select(x => x.ProductId).Distinct().OrderBy(x => x).ToArray();
        var products = new Dictionary<Guid, Product>();
        foreach (var id in ids) { var p = await db.Products.FromSqlInterpolated($"SELECT * FROM public.\"Products\" WHERE \"Id\" = {id} FOR UPDATE").SingleOrDefaultAsync(ct); if (p is null) return (null, "NOT_FOUND"); if (!p.IsActive) return (null, "PRODUCT_INACTIVE"); products[id] = p; }
        foreach (var id in ids) await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO public.inventory_balances (product_id, quantity, updated_at) VALUES ({id}, {0m}, {DateTimeOffset.UtcNow}) ON CONFLICT (product_id) DO NOTHING", ct);
        var balances = new Dictionary<Guid, InventoryBalance>();
        foreach (var id in ids) { balances[id] = await db.InventoryBalances.FromSqlInterpolated($"SELECT * FROM public.inventory_balances WHERE product_id = {id} FOR UPDATE").SingleAsync(ct); await db.Entry(balances[id]).ReloadAsync(ct); }
        var deltas = commands.GroupBy(x => x.ProductId).ToDictionary(x => x.Key, x => x.Sum(y => y.QuantityDelta));
        var shortages = deltas.Where(x => x.Value < 0 && balances[x.Key].Quantity + x.Value < 0).Select(x => (x.Key, -x.Value, balances[x.Key].Quantity)).ToArray();
        if (!allowNegative && shortages.Length > 0) return (new InventoryBatchResult([], shortages), "STOCK_INSUFFICIENT");
        var now = DateTimeOffset.UtcNow; var movements = new List<InventoryMovement>();
        foreach (var pair in deltas) { balances[pair.Key].Quantity += pair.Value; balances[pair.Key].UpdatedAt = now; }
        foreach (var c in commands) movements.Add(new InventoryMovement { ProductId=c.ProductId, MovementType=c.Type, QuantityDelta=c.QuantityDelta, Reason=c.Reason, ReferenceType=c.ReferenceType, ReferenceId=c.ReferenceId, CreatedAt=now, CreatedByUserId=c.ActorUserId });
        db.InventoryMovements.AddRange(movements); await db.SaveChangesAsync(ct); if (owns) await tx!.CommitAsync(ct);
        var result = movements.Select(x => new InventoryMovementDto(x.Id,x.ProductId,products[x.ProductId].Name,x.MovementType,x.QuantityDelta,products[x.ProductId].InventoryUnitId,"","","",x.Reason,x.ReferenceType,x.ReferenceId,x.CreatedAt,x.CreatedByUserId,null)).ToArray(); return (new InventoryBatchResult(result, []), null);
    }

    private static InventoryBalanceDto Balance(Product p, InventoryBalance? b, Unit u) { var quantity = b?.Quantity ?? 0m; return new(p.Id, p.Name, p.ProductType, u.Id, u.Code, u.Name, u.Symbol, quantity, p.MinStock, quantity < 0m || (p.MinStock is not null && quantity <= p.MinStock.Value), p.IsActive); }
    private async Task<InventoryMovementDto?> MovementAsync(Guid id, CancellationToken ct)
    {
        var m = await db.InventoryMovements.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct); if (m is null) return null;
        var product = await db.Products.AsNoTracking().SingleAsync(x => x.Id == m.ProductId, ct); var unit = await db.Units.AsNoTracking().SingleAsync(x => x.Id == product.InventoryUnitId, ct);
        var name = await db.Employees.AsNoTracking().Where(x => x.UserId == m.CreatedByUserId).Select(x => x.FullName).FirstOrDefaultAsync(ct) ?? await db.Users.Where(x => x.Id == m.CreatedByUserId).Select(x => x.UserName).FirstOrDefaultAsync(ct);
        return new(m.Id, m.ProductId, product.Name, m.MovementType, m.QuantityDelta, unit.Id, unit.Code, unit.Name, unit.Symbol, m.Reason, m.ReferenceType, m.ReferenceId, m.CreatedAt, m.CreatedByUserId, name);
    }
}
