using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Application.Orders;
    using RestaurantSystem.Application.Inventory;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Identity;
using RestaurantSystem.Domain.Orders;
using RestaurantSystem.Infrastructure.Attendance;
using RestaurantSystem.Infrastructure.Identity;

namespace RestaurantSystem.Infrastructure.Orders;

public sealed class KitchenHub : Hub { }

public sealed class SignalRKitchenRealtimeNotifier(IHubContext<KitchenHub> hub) : IKitchenRealtimeNotifier
{
    public Task CreatedAsync(KitchenRealtimeEvent value, CancellationToken ct = default) => hub.Clients.All.SendAsync("KitchenCommandCreated", value, ct);
    public Task UpdatedAsync(KitchenRealtimeEvent value, CancellationToken ct = default) => hub.Clients.All.SendAsync("KitchenCommandUpdated", value, ct);
    public Task CancelledAsync(KitchenRealtimeEvent value, CancellationToken ct = default) => hub.Clients.All.SendAsync("KitchenCommandCancelled", value, ct);
}

internal static class OrderRules
{
    internal static bool Has(OrderActor actor, string role) => actor.Roles.Contains(role);
    internal static bool IsOrderOperator(OrderActor actor) => Has(actor, RoleNames.Administrator) || Has(actor, RoleNames.Manager);
    internal static bool CanCreate(OrderActor actor) => IsOrderOperator(actor) || Has(actor, RoleNames.Waiter);
    internal static bool CanKitchenManage(OrderActor actor) => Has(actor, RoleNames.Administrator) || Has(actor, RoleNames.Manager) || Has(actor, RoleNames.Kitchen);
    internal static bool IsTerminal(OrderStatus status) => status is OrderStatus.ENTREGADO or OrderStatus.CANCELADO;
    internal static bool ValidArea(string? area) => area is "KITCHEN" or "BAR" or "NONE";
}

public sealed class OrderService(ApplicationDbContext db, IInventoryAvailability availability, IKitchenRealtimeNotifier notifier, ILogger<OrderService> logger) : IOrderService
{
    public async Task<(OrderDto? Value, string? Error, IReadOnlyList<InventoryShortageDto>? Shortages)> CreateAsync(CreateOrderRequest request, OrderActor actor, CancellationToken ct = default)
    {
        if (!OrderRules.CanCreate(actor)) return (null, "FORBIDDEN", null);
        if (request.Items is null || request.Items.Count == 0 || request.Items.Any(x => x.ProductId == Guid.Empty || x.Quantity <= 0 || x.Notes?.Length > 300) || request.TableReference?.Length > 50 || request.Notes?.Length > 500)
            return (null, "INVALID_REQUEST", null);
        if (request.Items.GroupBy(x => x.ProductId).Any(x => x.Count() > 1)) return (null, "DUPLICATE_PRODUCT", null);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var ids = request.Items.Select(x => x.ProductId).ToArray();
        var products = await db.Products.Where(x => ids.Contains(x.Id)).ToDictionaryAsync(x => x.Id, ct);
        if (products.Count != ids.Length || products.Values.Any(x => !x.IsActive || !x.IsSellable || x.SalePrice is null || x.SalePrice < 0 || !OrderRules.ValidArea(x.PreparationArea))) return (null, "PRODUCT_NOT_ORDERABLE", null);
        var shortages = await availability.EvaluateShortagesAsync(request.Items.Select(x => new InventoryRequirement(x.ProductId, x.Quantity)).ToArray(), ct);
        if (shortages.Count > 0 && request.AcknowledgeStockShortage != true) return (null, "ORDER_STOCK_ACKNOWLEDGEMENT_REQUIRED", shortages);
        Guid? waiterId = null;
        if (OrderRules.Has(actor, RoleNames.Waiter))
        {
            waiterId = await OperationalEmployeeAsync(actor.UserId, ct);
            if (waiterId is null && !OrderRules.IsOrderOperator(actor)) return (null, "ACTOR_EMPLOYEE_UNAVAILABLE", null);
        }
        var now = DateTimeOffset.UtcNow;
        var order = new Order { CreatedByUserId = actor.UserId, CreatedAt = now, WaiterEmployeeId = waiterId, TableReference = Trim(request.TableReference), Notes = Trim(request.Notes), StockShortageAcknowledgedAt = shortages.Count > 0 && request.AcknowledgeStockShortage == true ? now : null, StockShortageAcknowledgedByUserId = shortages.Count > 0 && request.AcknowledgeStockShortage == true ? actor.UserId : null };
        foreach (var line in request.Items)
        {
            var product = products[line.ProductId];
            order.Items.Add(new OrderItem { ProductId = product.Id, Quantity = line.Quantity, UnitPrice = product.SalePrice!.Value, Notes = Trim(line.Notes), CreatedAt = now });
        }
        var kitchenItems = order.Items.Where(x => products[x.ProductId].PreparationArea == "KITCHEN").ToArray();
        KitchenCommand? command = null;
        if (kitchenItems.Length > 0)
        {
            order.Status = OrderStatus.PENDIENTE;
            command = new KitchenCommand { Order = order, Status = KitchenCommandStatus.PENDIENTE, CreatedAt = now };
            foreach (var item in kitchenItems) command.Items.Add(new KitchenCommandItem { OrderItem = item, CreatedAt = now });
            db.KitchenCommands.Add(command);
        }
        else order.Status = OrderStatus.LISTO;
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        var dto = await MapOrderAsync(order.Id, ct);
        if (command is not null) await Publish(() => notifier.CreatedAsync(new(command.Id, order.Id, command.Status, now), ct));
        return (dto, null, null);
    }

    public async Task<PagedResponse<OrderDto>> ListAsync(int page, int pageSize, OrderStatus? status, string? search, CancellationToken ct = default)
    {
        var q = db.Orders.AsNoTracking().AsQueryable();
        if (status is not null) q = q.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(search)) { var needle = search.Trim().ToLower(); q = q.Where(x => x.TableReference != null && x.TableReference.ToLower().Contains(needle)); }
        var total = await q.CountAsync(ct);
        var ids = await q.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize).Select(x => x.Id).ToListAsync(ct);
        var items = new List<OrderDto>(); foreach (var id in ids) items.Add((await MapOrderAsync(id, ct))!);
        return new(items, page, pageSize, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize));
    }
    public Task<OrderDto?> GetAsync(Guid id, CancellationToken ct = default) => MapOrderAsync(id, ct);

    public async Task<(OrderDto? Value, string? Error)> AssignAsync(Guid id, AssignOrderRequest request, OrderActor actor, CancellationToken ct = default)
    {
        if (!OrderRules.Has(actor, RoleNames.Administrator)) return (null, "FORBIDDEN");
        if (request.WaiterEmployeeId == Guid.Empty || !await EligibleWaiterAsync(request.WaiterEmployeeId, ct)) return (null, "WAITER_NOT_ELIGIBLE");
        await using var tx = await db.Database.BeginTransactionAsync(ct); var order = await LockOrderAsync(id, ct); if (order is null) return (null, "NOT_FOUND");
        if (OrderRules.IsTerminal(order.Status)) return (null, "ORDER_ASSIGNMENT_TERMINAL");
        if (order.WaiterEmployeeId != request.WaiterEmployeeId) { order.WaiterEmployeeId = request.WaiterEmployeeId; Touch(order, actor.UserId); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); }
        return (await MapOrderAsync(id, ct), null);
    }
    public async Task<(OrderDto? Value, string? Error)> TakeAsync(Guid id, OrderActor actor, CancellationToken ct = default)
    {
        if (!OrderRules.Has(actor, RoleNames.Waiter)) return (null, "FORBIDDEN");
        var waiter = await OperationalEmployeeAsync(actor.UserId, ct); if (waiter is null) return (null, "ACTOR_EMPLOYEE_UNAVAILABLE");
        await using var tx = await db.Database.BeginTransactionAsync(ct); var order = await LockOrderAsync(id, ct); if (order is null) return (null, "NOT_FOUND");
        if (OrderRules.IsTerminal(order.Status)) return (null, "ORDER_ASSIGNMENT_TERMINAL");
        if (order.WaiterEmployeeId is not null && order.WaiterEmployeeId != waiter) return (null, "ORDER_ALREADY_ASSIGNED");
        if (order.WaiterEmployeeId is null) { order.WaiterEmployeeId = waiter; Touch(order, actor.UserId); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); }
        return (await MapOrderAsync(id, ct), null);
    }
    public async Task<(OrderDto? Value, string? Error)> DeliverAsync(Guid id, OrderActor actor, CancellationToken ct = default)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); var order = await LockOrderAsync(id, ct); if (order is null) return (null, "NOT_FOUND");
        var auth = await AuthorizeOrderMutationAsync(order, actor, ct); if (auth is not null) return (null, auth);
        if (order.Status == OrderStatus.ENTREGADO) return (await MapOrderAsync(id, ct), null);
        if (order.Status != OrderStatus.LISTO) return (null, "ORDER_INVALID_TRANSITION");
        order.Status = OrderStatus.ENTREGADO; Touch(order, actor.UserId); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return (await MapOrderAsync(id, ct), null);
    }
    public async Task<(OrderDto? Value, string? Error)> CancelAsync(Guid id, CancelOrderRequest request, OrderActor actor, CancellationToken ct = default)
    {
        if (request.Reason?.Length > 500) return (null, "INVALID_REQUEST");
        await using var tx = await db.Database.BeginTransactionAsync(ct); var order = await LockOrderAsync(id, ct); if (order is null) return (null, "NOT_FOUND");
        var command = await LockCommandByOrderAsync(id, ct); var auth = await AuthorizeOrderMutationAsync(order, actor, ct); if (auth is not null) return (null, auth);
        if (order.Status == OrderStatus.CANCELADO && (command is null || command.Status == KitchenCommandStatus.CANCELADA)) return (await MapOrderAsync(id, ct), null);
        if (order.Status is not (OrderStatus.PENDIENTE or OrderStatus.EN_PREPARACION) || (command is not null && command.Status is not (KitchenCommandStatus.PENDIENTE or KitchenCommandStatus.EN_PREPARACION))) return (null, "ORDER_INVALID_TRANSITION");
        var now = DateTimeOffset.UtcNow; CancelPair(order, command, actor.UserId, Trim(request.Reason), now); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        if (command is not null) await Publish(() => notifier.CancelledAsync(new(command.Id, order.Id, command.Status, now), ct)); return (await MapOrderAsync(id, ct), null);
    }

    internal async Task<Order?> LockOrderAsync(Guid id, CancellationToken ct) => await db.Orders.FromSqlInterpolated($"SELECT * FROM public.orders WHERE id = {id} FOR UPDATE").SingleOrDefaultAsync(ct);
    internal async Task<KitchenCommand?> LockCommandByOrderAsync(Guid orderId, CancellationToken ct) => await db.KitchenCommands.FromSqlInterpolated($"SELECT * FROM public.kitchen_commands WHERE order_id = {orderId} FOR UPDATE").SingleOrDefaultAsync(ct);
    internal async Task<string?> AuthorizeOrderMutationAsync(Order order, OrderActor actor, CancellationToken ct)
    {
        if (OrderRules.IsOrderOperator(actor)) return null;
        if (!OrderRules.Has(actor, RoleNames.Waiter)) return "FORBIDDEN";
        var employee = await OperationalEmployeeAsync(actor.UserId, ct); if (employee is null) return "ACTOR_EMPLOYEE_UNAVAILABLE";
        return order.WaiterEmployeeId == employee ? null : "FORBIDDEN";
    }
    internal static void CancelPair(Order order, KitchenCommand? command, string userId, string? reason, DateTimeOffset now)
    {
        order.Status = OrderStatus.CANCELADO; order.CancelledAt = now; order.CancelledByUserId = userId; order.CancellationReason = reason; Touch(order, userId, now);
        if (command is not null) { command.Status = KitchenCommandStatus.CANCELADA; command.CancelledAt = now; command.UpdatedByUserId = userId; }
    }
    internal static void Touch(Order order, string userId, DateTimeOffset? now = null) { order.UpdatedAt = now ?? DateTimeOffset.UtcNow; order.UpdatedByUserId = userId; }
    internal async Task<Guid?> OperationalEmployeeAsync(string userId, CancellationToken ct) => await db.Employees.Where(x => x.UserId == userId && x.IsActive).Select(x => (Guid?)x.Id).SingleOrDefaultAsync(ct);
    private async Task<bool> EligibleWaiterAsync(Guid employeeId, CancellationToken ct) => await (from e in db.Employees join u in db.Users on e.UserId equals u.Id join ur in db.UserRoles on u.Id equals ur.UserId join r in db.Roles on ur.RoleId equals r.Id where e.Id == employeeId && e.IsActive && EF.Property<bool>(u, "IsActive") && r.NormalizedName == RoleNames.Waiter select e.Id).AnyAsync(ct);
    private async Task Publish(Func<Task> publish) { try { await publish(); } catch (Exception ex) { logger.LogError(ex, "Kitchen realtime notifier failed after commit"); } }
    private static string? Trim(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    internal async Task<OrderDto?> MapOrderAsync(Guid id, CancellationToken ct)
    {
        var order = await db.Orders.AsNoTracking().Include(x => x.Items).Include(x => x.KitchenCommand).SingleOrDefaultAsync(x => x.Id == id, ct); if (order is null) return null;
        var productIds = order.Items.Select(x => x.ProductId).ToArray(); var products = await db.Products.AsNoTracking().Where(x => productIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, ct);
        var employee = order.WaiterEmployeeId is null ? null : await db.Employees.AsNoTracking().SingleOrDefaultAsync(x => x.Id == order.WaiterEmployeeId, ct);
        var cancelledName = order.CancelledByUserId is null ? null : await db.Employees.AsNoTracking().Where(x => x.UserId == order.CancelledByUserId).Select(x => x.FullName).FirstOrDefaultAsync(ct) ?? await db.Users.Where(x => x.Id == order.CancelledByUserId).Select(x => x.UserName).FirstOrDefaultAsync(ct);
        var lines = order.Items.Select(x => { var p = products[x.ProductId]; return new OrderItemDto(x.Id, x.ProductId, p.Name, x.Quantity, x.UnitPrice, x.Quantity * x.UnitPrice, x.Notes, p.PreparationArea!); }).ToArray();
        return new(order.Id, order.ShiftId, order.WaiterEmployeeId, employee?.FullName, order.TableReference, order.Status, order.Notes, order.CreatedAt, order.CreatedByUserId, order.UpdatedAt, order.UpdatedByUserId, order.CancelledAt, order.CancelledByUserId, cancelledName, order.CancellationReason, order.KitchenCommand is not null, order.KitchenCommand?.Id, lines, lines.Sum(x => x.LineTotal));
    }
}

public sealed class KitchenCommandService(ApplicationDbContext db, IKitchenRealtimeNotifier notifier, ILogger<KitchenCommandService> logger) : IKitchenCommandService
{
    public async Task<PagedResponse<KitchenCommandDto>> ListAsync(int page, int pageSize, KitchenCommandStatus? status, CancellationToken ct = default)
    { var q = db.KitchenCommands.AsNoTracking().AsQueryable(); if (status is not null) q = q.Where(x => x.Status == status); var total = await q.CountAsync(ct); var ids = await q.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize).Select(x => x.Id).ToListAsync(ct); var items = new List<KitchenCommandDto>(); foreach (var id in ids) items.Add((await MapAsync(id, ct))!); return new(items, page, pageSize, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize)); }
    public Task<KitchenCommandDto?> GetAsync(Guid id, CancellationToken ct = default) => MapAsync(id, ct);
    public Task<(KitchenCommandDto? Value, string? Error)> StartAsync(Guid id, OrderActor actor, CancellationToken ct = default) => TransitionAsync(id, actor, false, ct);
    public Task<(KitchenCommandDto? Value, string? Error)> ReadyAsync(Guid id, OrderActor actor, CancellationToken ct = default) => TransitionAsync(id, actor, true, ct);
    public async Task<(KitchenCommandDto? Value, string? Error)> CancelAsync(Guid id, CancelOrderRequest request, OrderActor actor, CancellationToken ct = default)
    {
        if (!OrderRules.CanKitchenManage(actor)) return (null, "FORBIDDEN"); if (request.Reason?.Length > 500) return (null, "INVALID_REQUEST");
        var orderId = await db.KitchenCommands.AsNoTracking().Where(x => x.Id == id).Select(x => (Guid?)x.OrderId).SingleOrDefaultAsync(ct); if (orderId is null) return (null, "NOT_FOUND");
        await using var tx = await db.Database.BeginTransactionAsync(ct); var order = await db.Orders.FromSqlInterpolated($"SELECT * FROM public.orders WHERE id = {orderId.Value} FOR UPDATE").SingleAsync(ct); var command = await db.KitchenCommands.FromSqlInterpolated($"SELECT * FROM public.kitchen_commands WHERE id = {id} FOR UPDATE").SingleAsync(ct);
        if (command.OrderId != order.Id) return (null, "ORDER_KITCHEN_STATE_CONFLICT"); if (command.Status == KitchenCommandStatus.CANCELADA && order.Status == OrderStatus.CANCELADO) return (await MapAsync(id, ct), null);
        if (command.Status is not (KitchenCommandStatus.PENDIENTE or KitchenCommandStatus.EN_PREPARACION) || order.Status is not (OrderStatus.PENDIENTE or OrderStatus.EN_PREPARACION)) return (null, "KITCHEN_INVALID_TRANSITION");
        var now = DateTimeOffset.UtcNow; OrderService.CancelPair(order, command, actor.UserId, string.IsNullOrWhiteSpace(request.Reason) ? null : request.Reason.Trim(), now); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); await Publish(() => notifier.CancelledAsync(new(command.Id, order.Id, command.Status, now), ct)); return (await MapAsync(id, ct), null);
    }
    private async Task<(KitchenCommandDto? Value, string? Error)> TransitionAsync(Guid id, OrderActor actor, bool ready, CancellationToken ct)
    {
        if (!OrderRules.CanKitchenManage(actor)) return (null, "FORBIDDEN"); var orderId = await db.KitchenCommands.AsNoTracking().Where(x => x.Id == id).Select(x => (Guid?)x.OrderId).SingleOrDefaultAsync(ct); if (orderId is null) return (null, "NOT_FOUND");
        await using var tx = await db.Database.BeginTransactionAsync(ct); var order = await db.Orders.FromSqlInterpolated($"SELECT * FROM public.orders WHERE id = {orderId.Value} FOR UPDATE").SingleAsync(ct); var command = await db.KitchenCommands.FromSqlInterpolated($"SELECT * FROM public.kitchen_commands WHERE id = {id} FOR UPDATE").SingleAsync(ct);
        if (command.OrderId != order.Id) return (null, "ORDER_KITCHEN_STATE_CONFLICT");
        var targetOrder = ready ? OrderStatus.LISTO : OrderStatus.EN_PREPARACION; var targetCommand = ready ? KitchenCommandStatus.LISTA : KitchenCommandStatus.EN_PREPARACION;
        if (order.Status == targetOrder && command.Status == targetCommand) return (await MapAsync(id, ct), null);
        var sourceOrder = ready ? OrderStatus.EN_PREPARACION : OrderStatus.PENDIENTE; var sourceCommand = ready ? KitchenCommandStatus.EN_PREPARACION : KitchenCommandStatus.PENDIENTE;
        if (order.Status != sourceOrder || command.Status != sourceCommand) return (null, "KITCHEN_INVALID_TRANSITION");
        var now = DateTimeOffset.UtcNow; order.Status = targetOrder; OrderService.Touch(order, actor.UserId, now); command.Status = targetCommand; command.UpdatedByUserId = actor.UserId; if (ready) command.ReadyAt = now; else command.StartedAt = now; await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); await Publish(() => notifier.UpdatedAsync(new(command.Id, order.Id, command.Status, now), ct)); return (await MapAsync(id, ct), null);
    }
    private async Task<KitchenCommandDto?> MapAsync(Guid id, CancellationToken ct)
    { var command = await db.KitchenCommands.AsNoTracking().Include(x => x.Items).SingleOrDefaultAsync(x => x.Id == id, ct); if (command is null) return null; var order = await db.Orders.AsNoTracking().Include(x => x.Items).SingleAsync(x => x.Id == command.OrderId, ct); var itemIds = command.Items.Select(x => x.OrderItemId).ToHashSet(); var orderItems = order.Items.Where(x => itemIds.Contains(x.Id)).ToArray(); var products = await db.Products.AsNoTracking().Where(x => orderItems.Select(i => i.ProductId).Contains(x.Id)).ToDictionaryAsync(x => x.Id, ct); return new(command.Id, command.OrderId, command.Status, order.TableReference, order.Notes, command.CreatedAt, command.StartedAt, command.ReadyAt, command.CancelledAt, orderItems.Select(x => new KitchenCommandItemDto(x.Id, x.ProductId, products[x.ProductId].Name, x.Quantity, x.Notes)).ToArray()); }
    private async Task Publish(Func<Task> publish) { try { await publish(); } catch (Exception ex) { logger.LogError(ex, "Kitchen realtime notifier failed after commit"); } }
}
