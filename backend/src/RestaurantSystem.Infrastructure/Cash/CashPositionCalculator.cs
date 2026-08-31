using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Application.Cash;
using RestaurantSystem.Domain.Expenses;
using RestaurantSystem.Domain.Operations;

namespace RestaurantSystem.Infrastructure.Cash;

public sealed class CashPositionCalculator(ApplicationDbContext db) : ICashPositionCalculator
{
    public async Task<CashPositionResult> CalculateAsync(Guid cashSessionId, CancellationToken ct = default)
    {
        var session = await db.CashSessions.AsNoTracking().SingleOrDefaultAsync(x => x.Id == cashSessionId, ct)
            ?? throw new InvalidOperationException("CASH_SESSION_NOT_FOUND");

        var shiftIds = await db.Shifts.AsNoTracking().Where(x => x.CashSessionId == cashSessionId).Select(x => x.Id).ToArrayAsync(ct);

        var sales = await db.Sales.AsNoTracking().Where(x => shiftIds.Contains(x.ShiftId)).ToArrayAsync(ct);
        var expenses = await db.Expenses.AsNoTracking().Where(x => x.ShiftId != null && shiftIds.Contains(x.ShiftId!.Value)).ToArrayAsync(ct);

        var salesTotal = sales.Sum(x => x.Total);
        var cash = sales.Where(x => x.PaymentMethod == PaymentMethod.CASH).Sum(x => x.Total);
        var qr = sales.Where(x => x.PaymentMethod == PaymentMethod.QR).Sum(x => x.Total);
        var ext = sales.Where(x => x.PaymentMethod == PaymentMethod.EXTERNAL).Sum(x => x.Total);
        var direct = sales.Where(x => x.SalesChannel == SalesChannel.DIRECT).Sum(x => x.Total);
        var pedidos = sales.Where(x => x.SalesChannel == SalesChannel.PEDIDOSYA).Sum(x => x.Total);

        var drawer = expenses.Where(x => x.CashSource == CashSource.CASH_DRAWER).Sum(x => x.Amount);
        var petty = expenses.Where(x => x.CashSource == CashSource.PETTY_CASH).Sum(x => x.Amount);
        var expTotal = drawer + petty;

        var opening = session.OpeningAmount ?? 0m;
        var pettyOpening = session.PettyCashOpeningAmount ?? 0m;
        var removed = session.CashRemovedAmount ?? 0m;
        var expected = opening + pettyOpening + cash - drawer - petty - removed;

        return new CashPositionResult(
            session.Id,
            session.BusinessDate,
            opening,
            pettyOpening,
            removed,
            session.CashAmountCarriedForward,
            salesTotal,
            cash,
            qr,
            ext,
            direct,
            pedidos,
            drawer,
            petty,
            expTotal,
            expected);
    }
}
