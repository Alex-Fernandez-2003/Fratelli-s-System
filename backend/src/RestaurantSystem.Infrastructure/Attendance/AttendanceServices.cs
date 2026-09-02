using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Domain.Attendance;
using RestaurantSystem.Domain.Identity;
using RestaurantSystem.Domain.Operations;

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

public sealed class AttendanceService(ApplicationDbContext db, IBusinessClock clock, AttendanceDerivationService derivation, IAttendanceNotifier notifier, ILogger<AttendanceService> logger) : IAttendanceService
{
    public async Task<(AttendanceRecordDto? Value, string? Error)> CheckInAsync(Guid employeeId, string actorUserId, CancellationToken ct = default)
    {
        var result = await CheckInRecordAsync(employeeId, actorUserId, ct);
        if (result.Error is not null) return (null, result.Error);
        return (Map(result.Value!), null);
    }

    public async Task<(AttendanceRecordDto? Value, string? Error)> CheckOutAsync(Guid employeeId, string actorUserId, CancellationToken ct = default)
    {
        var result = await CheckOutRecordAsync(employeeId, actorUserId, ct);
        if (result.Error is not null) return (null, result.Error);
        return (Map(result.Value!), null);
    }

    public async Task<(PersonalAttendanceRecordDto? Value, string? Error)> CheckInSelfAsync(string userId, CancellationToken ct = default)
    {
        var employee = await EmployeeForUserAsync(userId, ct);
        if (employee is null) return (null, "Not found");

        var result = await CheckInRecordAsync(employee.Id, userId, ct);
        if (result.Error is not null) return (null, result.Error);
        return (await ProjectPersonalAsync(result.Value!, ct), null);
    }

    public async Task<(PersonalAttendanceRecordDto? Value, string? Error)> CheckOutSelfAsync(string userId, CancellationToken ct = default)
    {
        var employee = await EmployeeForUserAsync(userId, ct);
        if (employee is null) return (null, "Not found");

        var result = await CheckOutRecordAsync(employee.Id, userId, ct);
        if (result.Error is not null) return (null, result.Error);
        return (await ProjectPersonalAsync(result.Value!, ct), null);
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
        var employee = await EmployeeForUserAsync(userId, ct);
        if (employee is null) return (null, "Not found");

        var query = db.AttendanceRecords.AsNoTracking().Where(x => x.EmployeeId == employee.Id);
        if (from is not null) query = query.Where(x => x.BusinessDate >= from);
        if (to is not null) query = query.Where(x => x.BusinessDate <= to);
        var total = await query.CountAsync(ct);
        var records = await query.OrderByDescending(x => x.CheckInAt).ThenByDescending(x => x.Id).Skip((page - 1) * pageSize).Take(pageSize).ToArrayAsync(ct);
        var dates = records.Select(x => x.BusinessDate).Distinct().ToArray();
        var candidates = await LoadAssignmentCandidatesAsync(employee.Id, dates, ct);
        var sessions = await LoadSessionsAsync(dates, ct);
        var items = records.Select(record => ProjectPersonal(record, candidates, sessions)).ToArray();
        return (new AttendancePage(items, page, pageSize, total, total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize)), null);
    }

    public async Task<(AttendanceCurrentResponse? Value, string? Error)> CurrentAsync(string userId, CancellationToken ct = default)
    {
        var employee = await EmployeeForUserAsync(userId, ct);
        if (employee is null) return (null, "Not found");

        var businessDate = clock.BusinessDate;
        var record = await db.AttendanceRecords.AsNoTracking()
            .Where(x => x.EmployeeId == employee.Id && x.CheckOutAt == null)
            .OrderByDescending(x => x.CheckInAt)
            .ThenByDescending(x => x.Id)
            .FirstOrDefaultAsync(ct);
        record ??= await db.AttendanceRecords.AsNoTracking()
            .Where(x => x.EmployeeId == employee.Id && x.BusinessDate == businessDate)
            .OrderByDescending(x => x.CheckInAt)
            .ThenByDescending(x => x.Id)
            .FirstOrDefaultAsync(ct);

        var dates = record is null
            ? new[] { businessDate }
            : new[] { businessDate, record.BusinessDate };
        var candidates = await LoadAssignmentCandidatesAsync(employee.Id, dates, ct);
        var sessions = await LoadSessionsAsync(dates, ct);
        var candidate = record is null
            ? SelectCurrentAssignment(candidates, businessDate)
            : SelectAssignment(record, candidates);
        var contextDate = record?.BusinessDate ?? businessDate;
        var session = candidate?.Session ?? SessionForDate(sessions, contextDate, record);
        var derived = derivation.Derive(new(session, candidate?.Shift, candidate?.Assignment, record));
        var projected = record is null ? null : MapPersonal(record, candidate, derived);
        return (new AttendanceCurrentResponse(businessDate, clock.TimeZoneId, employee.Id, derived.Lifecycle, projected), null);
    }

    public async Task<(AdministrativeAttendancePage? Value, string? Error)> AdministrativeAsync(Guid? employeeId, DateOnly? from, DateOnly? to, ShiftType? shiftType, AttendanceLifecycle? outcome, bool? late, int page, int pageSize, CancellationToken ct = default)
    {
        if (from > to || page < 1 || pageSize is < 1 or > 100) return (null, "Invalid attendance query");
        var query = from assignment in db.ShiftAssignments.AsNoTracking()
                    join shift in db.Shifts.AsNoTracking() on assignment.ShiftId equals shift.Id
                    join session in db.CashSessions.AsNoTracking() on shift.CashSessionId equals session.Id
                    join employee in db.Employees.AsNoTracking() on assignment.EmployeeId equals employee.Id
                    join record in db.AttendanceRecords.AsNoTracking() on new { assignment.EmployeeId, session.BusinessDate } equals new { record.EmployeeId, record.BusinessDate } into records
                    from record in records.DefaultIfEmpty()
                    select new { Assignment = assignment, Shift = shift, Session = session, Employee = employee, Record = record };
        if (employeeId is not null) query = query.Where(x => x.Employee.Id == employeeId);
        if (from is not null) query = query.Where(x => x.Session.BusinessDate >= from);
        if (to is not null) query = query.Where(x => x.Session.BusinessDate <= to);
        if (shiftType is not null) query = query.Where(x => x.Shift.Type == shiftType);
        var rows = (await query.ToListAsync(ct)).Select(x => MapAdministrative(x.Assignment, x.Shift, x.Session, x.Employee, x.Record, derivation.Derive(new(x.Session, x.Shift, x.Assignment, x.Record))));
        if (outcome is not null) rows = rows.Where(x => x.Outcome == outcome);
        if (late is not null) rows = rows.Where(x => x.IsLate == late);
        var all = rows.OrderByDescending(x => x.BusinessDate).ThenByDescending(x => x.PlannedStart).ThenByDescending(x => x.EmployeeId).ToArray();
        var summary = new AdministrativeAttendanceSummary(all.Length, all.Count(x => x.Outcome == AttendanceLifecycle.OPEN), all.Count(x => x.Outcome == AttendanceLifecycle.CLOSED), all.Sum(x => x.WorkedMinutes ?? 0), all.Count(x => x.IsLate), all.Count(x => x.Outcome == AttendanceLifecycle.ABSENT));
        var employees = all.GroupBy(x => new { x.EmployeeId, x.FullName }).Select(x => new EmployeeAttendanceSummary(x.Key.EmployeeId, x.Key.FullName, x.Sum(r => r.WorkedMinutes ?? 0), x.Count(r => r.IsLate), x.Count(r => r.Outcome == AttendanceLifecycle.ABSENT), x.Count(r => r.Outcome is AttendanceLifecycle.OPEN or AttendanceLifecycle.CLOSED))).OrderBy(x => x.FullName).ToArray();
        return (new AdministrativeAttendancePage(all.Skip((page - 1) * pageSize).Take(pageSize).ToArray(), page, pageSize, all.Length, all.Length == 0 ? 0 : (int)Math.Ceiling(all.Length / (double)pageSize), summary, employees), null);
    }

    private async Task<(AttendanceRecord? Value, string? Error)> CheckInRecordAsync(Guid employeeId, string actorUserId, CancellationToken ct)
    {
        if (!await db.Employees.AnyAsync(x => x.Id == employeeId, ct)) return (null, "Not found");
        if (await db.AttendanceRecords.AnyAsync(x => x.EmployeeId == employeeId && x.CheckOutAt == null, ct)) return (null, "Attendance record already open");
        var record = new AttendanceRecord { EmployeeId = employeeId, BusinessDate = clock.BusinessDate, CheckInAt = clock.UtcNow, CheckInByUserId = actorUserId };
        db.AttendanceRecords.Add(record);
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateException) { return (null, "Attendance record already open"); }
        await Notify(Map(record), ct);
        return (record, null);
    }

    private async Task<(AttendanceRecord? Value, string? Error)> CheckOutRecordAsync(Guid employeeId, string actorUserId, CancellationToken ct)
    {
        if (!await db.Employees.AnyAsync(x => x.Id == employeeId, ct)) return (null, "Not found");
        var record = await db.AttendanceRecords.SingleOrDefaultAsync(x => x.EmployeeId == employeeId && x.CheckOutAt == null, ct);
        if (record is null) return (null, "No open attendance record");
        record.CheckOutAt = clock.UtcNow;
        record.CheckOutByUserId = actorUserId;
        await db.SaveChangesAsync(ct);
        await Notify(Map(record), ct);
        return (record, null);
    }

    private async Task<Employee?> EmployeeForUserAsync(string userId, CancellationToken ct) =>
        await db.Employees.SingleOrDefaultAsync(x => x.UserId == userId, ct);

    private async Task<PersonalAttendanceRecordDto> ProjectPersonalAsync(AttendanceRecord record, CancellationToken ct)
    {
        var dates = new[] { record.BusinessDate };
        var candidates = await LoadAssignmentCandidatesAsync(record.EmployeeId, dates, ct);
        var sessions = await LoadSessionsAsync(dates, ct);
        return ProjectPersonal(record, candidates, sessions);
    }

    private PersonalAttendanceRecordDto ProjectPersonal(AttendanceRecord record, IReadOnlyList<PersonalAssignmentCandidate> candidates, IReadOnlyDictionary<DateOnly, CashSession> sessions)
    {
        var candidate = SelectAssignment(record, candidates);
        var session = candidate?.Session ?? SessionForDate(sessions, record.BusinessDate, record);
        var derived = derivation.Derive(new(session, candidate?.Shift, candidate?.Assignment, record));
        return MapPersonal(record, candidate, derived);
    }

    private async Task<PersonalAssignmentCandidate[]> LoadAssignmentCandidatesAsync(Guid employeeId, IReadOnlyCollection<DateOnly> dates, CancellationToken ct)
    {
        if (dates.Count == 0) return [];
        var dateArray = dates.Distinct().ToArray();
        var rows = await (from assignment in db.ShiftAssignments.AsNoTracking()
                          join shift in db.Shifts.AsNoTracking() on assignment.ShiftId equals shift.Id
                          join session in db.CashSessions.AsNoTracking() on shift.CashSessionId equals session.Id
                          where assignment.EmployeeId == employeeId && dateArray.Contains(session.BusinessDate)
                          select new { Session = session, Shift = shift, Assignment = assignment }).ToArrayAsync(ct);
        return rows.Select(x => new PersonalAssignmentCandidate(x.Session, x.Shift, x.Assignment)).ToArray();
    }

    private async Task<Dictionary<DateOnly, CashSession>> LoadSessionsAsync(IReadOnlyCollection<DateOnly> dates, CancellationToken ct)
    {
        if (dates.Count == 0) return new Dictionary<DateOnly, CashSession>();
        var dateArray = dates.Distinct().ToArray();
        var sessions = await db.CashSessions.AsNoTracking().Where(x => dateArray.Contains(x.BusinessDate)).ToArrayAsync(ct);
        return sessions.GroupBy(x => x.BusinessDate).ToDictionary(x => x.Key, x => x.OrderBy(session => session.Id).First());
    }

    private PersonalAssignmentCandidate? SelectAssignment(AttendanceRecord record, IEnumerable<PersonalAssignmentCandidate> candidates)
    {
        var options = candidates
            .Where(x => x.Session.BusinessDate == record.BusinessDate)
            .Select(candidate => (Candidate: candidate, Derived: derivation.Derive(new(candidate.Session, candidate.Shift, candidate.Assignment, record))))
            .ToArray();
        return options
            .OrderBy(x => ScheduleDistance(record.CheckInAt, x.Derived.PlannedStart, x.Derived.PlannedEnd))
            .ThenBy(x => x.Derived.PlannedStart)
            .ThenBy(x => x.Candidate.Shift.Type)
            .ThenBy(x => x.Candidate.Assignment.Id)
            .Select(x => x.Candidate)
            .FirstOrDefault();
    }

    private PersonalAssignmentCandidate? SelectCurrentAssignment(IEnumerable<PersonalAssignmentCandidate> candidates, DateOnly businessDate)
    {
        var now = clock.UtcNow;
        var options = candidates
            .Where(x => x.Session.BusinessDate == businessDate)
            .Select(candidate => (Candidate: candidate, Derived: derivation.Derive(new(candidate.Session, candidate.Shift, candidate.Assignment, null))))
            .ToArray();
        return options
            .OrderBy(x => CurrentStatusRank(x.Candidate.Shift.Status))
            .ThenBy(x => ScheduleDistance(now, x.Derived.PlannedStart, x.Derived.PlannedEnd))
            .ThenBy(x => x.Derived.PlannedStart)
            .ThenBy(x => x.Candidate.Shift.Type)
            .ThenBy(x => x.Candidate.Assignment.Id)
            .Select(x => x.Candidate)
            .FirstOrDefault();
    }

    private static int CurrentStatusRank(ShiftStatus status) => status switch
    {
        ShiftStatus.ACTIVE => 0,
        ShiftStatus.PENDING => 1,
        ShiftStatus.COMPLETED => 2,
        _ => 3
    };

    private static TimeSpan ScheduleDistance(DateTimeOffset value, DateTimeOffset? plannedStart, DateTimeOffset? plannedEnd)
    {
        if (plannedStart is null || plannedEnd is null) return TimeSpan.MaxValue;
        if (value < plannedStart.Value) return plannedStart.Value - value;
        if (value > plannedEnd.Value) return value - plannedEnd.Value;
        return TimeSpan.Zero;
    }

    private CashSession SessionForDate(IReadOnlyDictionary<DateOnly, CashSession> sessions, DateOnly date, AttendanceRecord? record)
    {
        if (sessions.TryGetValue(date, out var session)) return session;
        return new CashSession
        {
            BusinessDate = date,
            OpenedAt = record?.CheckInAt ?? clock.UtcNow,
            OpenedByUserId = record?.CheckInByUserId ?? string.Empty
        };
    }

    private static AdministrativeAttendanceRow MapAdministrative(ShiftAssignment assignment, Shift shift, CashSession session, Employee employee, AttendanceRecord? record, AttendanceDerivationResult derived) => new(employee.Id, employee.FullName, session.BusinessDate, shift.Type, derived.PlannedStart!.Value, derived.PlannedEnd!.Value, record?.CheckInAt, record?.CheckOutAt, derived.Lifecycle, derived.WorkedMinutes, derived.IsLate, derived.LateMinutes);

    private async Task Notify(AttendanceRecordDto record, CancellationToken ct)
    {
        try { await notifier.AttendanceUpdatedAsync(record, ct); }
        catch (Exception ex) { logger.LogError(ex, "Attendance notifier failed after commit"); }
    }

    private static AttendanceRecordDto Map(AttendanceRecord x) => new(x.Id, x.EmployeeId, x.BusinessDate, x.CheckInAt, x.CheckInByUserId, x.CheckOutAt, x.CheckOutByUserId);

    private static PersonalAttendanceRecordDto MapPersonal(AttendanceRecord record, PersonalAssignmentCandidate? candidate, AttendanceDerivationResult derived) =>
        new(record.Id, record.EmployeeId, record.BusinessDate, record.CheckInAt, record.CheckInByUserId, record.CheckOutAt, record.CheckOutByUserId, candidate?.Assignment.ShiftId, candidate?.Shift.Type, derived.PlannedStart, derived.PlannedEnd, derived.Lifecycle, derived.WorkedMinutes, derived.IsLate, derived.LateMinutes);

    private sealed record PersonalAssignmentCandidate(CashSession Session, Shift Shift, ShiftAssignment Assignment);
}
