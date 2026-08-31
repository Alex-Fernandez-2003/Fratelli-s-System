using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Application.Operations;
using RestaurantSystem.Infrastructure.Identity;

namespace RestaurantSystem.Infrastructure.Operations;

public sealed class SalesAuthorizationScope(ApplicationDbContext db, IBusinessClock clock) : ISalesAuthorizationScope
{
    private static readonly string[] BroadRoles = [RoleNames.Administrator, RoleNames.Manager, RoleNames.Accountant];

    public async Task<AuthorizedSalesScope> ResolveAsync(string actor, IReadOnlySet<string> roles, CancellationToken ct = default)
    {
        if (roles.Overlaps(BroadRoles)) return new(true, null);
        if (!roles.Contains(RoleNames.Waiter)) return new(false, null);

        var employeeId = await db.Employees
            .Where(employee => employee.UserId == actor && employee.IsActive)
            .Select(employee => (Guid?)employee.Id)
            .SingleOrDefaultAsync(ct);
        if (employeeId is null) return new(false, null);

        var shift = await CurrentShiftQuery.ActiveAsync(db, clock, includeAssignments: true, forUpdate: false, ct);
        return shift?.Assignments.Any(assignment => assignment.EmployeeId == employeeId) == true
            ? new(true, shift.Id)
            : new(false, null);
    }
}
