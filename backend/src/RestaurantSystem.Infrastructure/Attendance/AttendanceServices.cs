using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Domain.Attendance;

namespace RestaurantSystem.Infrastructure.Attendance;

public sealed class BusinessClock : IBusinessClock
{
    private readonly TimeZoneInfo zone;
    public BusinessClock(IConfiguration configuration)
    {
        TimeZoneId = configuration["BusinessTime:TimeZoneId"] ?? "America/La_Paz";
        zone = TimeZoneInfo.FindSystemTimeZoneById(TimeZoneId);
    }
    public string TimeZoneId { get; }
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
    public DateOnly BusinessDate => DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(UtcNow, zone).DateTime);
}

public sealed class AttendanceHub : Hub { }

public sealed class SignalRAttendanceNotifier(IHubContext<AttendanceHub> hub) : IAttendanceNotifier
{
    public Task AttendanceUpdatedAsync(AttendanceRecordDto record, CancellationToken cancellationToken = default) =>
        hub.Clients.All.SendAsync("AttendanceUpdated", record, cancellationToken);
}

public sealed class AttendanceService(ApplicationDbContext db, IBusinessClock clock, IAttendanceNotifier notifier, ILogger<AttendanceService> logger) : IAttendanceService
{
    public async Task<(AttendanceRecordDto? Value, string? Error)> CheckInAsync(Guid employeeId, string actorUserId, CancellationToken ct = default)
    {
        if (!await db.Employees.AnyAsync(x => x.Id == employeeId, ct)) return (null, "Not found");
        if (await db.AttendanceRecords.AnyAsync(x => x.EmployeeId == employeeId && x.CheckOutAt == null, ct)) return (null, "Attendance record already open");
        var record = new AttendanceRecord { EmployeeId = employeeId, BusinessDate = clock.BusinessDate, CheckInAt = clock.UtcNow, CheckInByUserId = actorUserId };
        db.AttendanceRecords.Add(record);
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateException) { return (null, "Attendance record already open"); }
        var dto = Map(record); await Notify(dto, ct); return (dto, null);
    }

    public async Task<(AttendanceRecordDto? Value, string? Error)> CheckOutAsync(Guid employeeId, string actorUserId, CancellationToken ct = default)
    {
        if (!await db.Employees.AnyAsync(x => x.Id == employeeId, ct)) return (null, "Not found");
        var record = await db.AttendanceRecords.SingleOrDefaultAsync(x => x.EmployeeId == employeeId && x.CheckOutAt == null, ct);
        if (record is null) return (null, "No open attendance record");
        record.CheckOutAt = clock.UtcNow; record.CheckOutByUserId = actorUserId;
        await db.SaveChangesAsync(ct); var dto = Map(record); await Notify(dto, ct); return (dto, null);
    }

    public async Task<AttendanceTodayResponse> TodayAsync(CancellationToken ct = default)
    {
        var date = clock.BusinessDate;
        var employees = await db.Employees.OrderBy(x => x.FullName).ToListAsync(ct);
        var records = await db.AttendanceRecords.Where(x => x.BusinessDate == date || x.CheckOutAt == null).OrderBy(x => x.CheckInAt).ToListAsync(ct);
        var items = employees.Select(employee =>
        {
            var employeeRecords = records.Where(x => x.EmployeeId == employee.Id).Select(Map).ToArray();
            var state = employeeRecords.Any(x => x.CheckOutAt is null) ? "OPEN" : employeeRecords.Length > 0 ? "CLOSED" : "NO_RECORD";
            return new AttendanceTodayItem(employee.Id, employee.FullName, employee.IsActive, employeeRecords, state);
        }).ToArray();
        return new AttendanceTodayResponse(date, clock.TimeZoneId, items);
    }

    public async Task<(AttendancePage? Value, string? Error)> MineAsync(string userId, DateOnly? from, DateOnly? to, int page, int pageSize, CancellationToken ct = default)
    {
        if (from > to || page < 1 || pageSize is < 1 or > 100) return (null, "Invalid attendance query");
        var employee = await db.Employees.SingleOrDefaultAsync(x => x.UserId == userId, ct); if (employee is null) return (null, "Not found");
        var query = db.AttendanceRecords.Where(x => x.EmployeeId == employee.Id);
        if (from is not null) query = query.Where(x => x.BusinessDate >= from); if (to is not null) query = query.Where(x => x.BusinessDate <= to);
        var total = await query.CountAsync(ct); var records = await query.OrderByDescending(x => x.CheckInAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        return (new AttendancePage(records.Select(Map).ToArray(), page, pageSize, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize)), null);
    }

    private async Task Notify(AttendanceRecordDto record, CancellationToken ct) { try { await notifier.AttendanceUpdatedAsync(record, ct); } catch (Exception ex) { logger.LogError(ex, "Attendance notifier failed after commit"); } }
    private static AttendanceRecordDto Map(AttendanceRecord x) => new(x.Id, x.EmployeeId, x.BusinessDate, x.CheckInAt, x.CheckInByUserId, x.CheckOutAt, x.CheckOutByUserId);
}
