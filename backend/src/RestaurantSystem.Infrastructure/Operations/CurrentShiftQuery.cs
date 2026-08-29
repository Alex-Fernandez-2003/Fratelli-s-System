using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Domain.Operations;

namespace RestaurantSystem.Infrastructure.Operations;

internal static class CurrentShiftQuery
{
    internal static async Task<Shift?> ActiveAsync(ApplicationDbContext db, IBusinessClock clock, bool includeAssignments, bool forUpdate, CancellationToken ct)
    {
        var sessionId = await db.CashSessions
            .Where(x => x.BusinessDate == clock.BusinessDate && x.IsOpen)
            .Select(x => (Guid?)x.Id)
            .SingleOrDefaultAsync(ct);
        if (sessionId is null) return null;

        if (forUpdate)
            return await db.Shifts.FromSqlInterpolated($"SELECT * FROM public.shifts WHERE \"CashSessionId\"={sessionId} AND \"Status\"='ACTIVE' FOR UPDATE")
                .SingleOrDefaultAsync(ct);

        var query = db.Shifts.Where(x => x.CashSessionId == sessionId && x.Status == ShiftStatus.ACTIVE);
        if (includeAssignments) query = query.Include(x => x.Assignments);
        return await query.SingleOrDefaultAsync(ct);
    }
}
