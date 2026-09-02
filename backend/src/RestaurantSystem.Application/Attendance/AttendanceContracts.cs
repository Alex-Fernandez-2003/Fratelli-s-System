using RestaurantSystem.Domain.Operations;

namespace RestaurantSystem.Application.Attendance;

public sealed record AttendanceRecordDto(Guid Id, Guid EmployeeId, DateOnly BusinessDate, DateTimeOffset CheckInAt, string CheckInByUserId, DateTimeOffset? CheckOutAt, string? CheckOutByUserId);
public sealed record PersonalAttendanceRecordDto(Guid Id, Guid EmployeeId, DateOnly BusinessDate, DateTimeOffset CheckInAt, string CheckInByUserId, DateTimeOffset? CheckOutAt, string? CheckOutByUserId, Guid? ShiftId, ShiftType? ShiftType, DateTimeOffset? PlannedStart, DateTimeOffset? PlannedEnd, AttendanceLifecycle Lifecycle, int? WorkedMinutes, bool IsLate, int LateMinutes);
public sealed record AttendanceTodayItem(Guid EmployeeId, string FullName, bool IsActive, IReadOnlyList<AttendanceRecordDto> AttendanceRecords, string CurrentState);
public sealed record AttendanceTodayResponse(DateOnly BusinessDate, string TimeZone, IReadOnlyList<AttendanceTodayItem> Items);
public sealed record AttendanceCurrentResponse(DateOnly BusinessDate, string TimeZone, Guid EmployeeId, AttendanceLifecycle Lifecycle, PersonalAttendanceRecordDto? Record);
public sealed record AttendancePage(IReadOnlyList<PersonalAttendanceRecordDto> Items, int Page, int PageSize, int TotalCount, int TotalPages);
public sealed record AdministrativeAttendanceRow(Guid EmployeeId, string FullName, DateOnly BusinessDate, ShiftType ShiftType, DateTimeOffset PlannedStart, DateTimeOffset PlannedEnd, DateTimeOffset? CheckInAt, DateTimeOffset? CheckOutAt, AttendanceLifecycle Outcome, int? WorkedMinutes, bool IsLate, int LateMinutes);
public sealed record AdministrativeAttendanceSummary(int TotalRecords, int OpenCount, int ClosedCount, int TotalWorkedMinutes, int LateCount, int AbsenceCount);
public sealed record EmployeeAttendanceSummary(Guid EmployeeId, string FullName, int WorkedMinutes, int LateCount, int AbsenceCount, int AttendanceCount);
public sealed record AdministrativeAttendancePage(IReadOnlyList<AdministrativeAttendanceRow> Items, int Page, int PageSize, int TotalCount, int TotalPages, AdministrativeAttendanceSummary Summary, IReadOnlyList<EmployeeAttendanceSummary> EmployeeSummaries);

public interface IBusinessClock { DateTimeOffset UtcNow { get; } DateOnly BusinessDate { get; } string TimeZoneId { get; } }
public interface IAttendanceNotifier { Task AttendanceUpdatedAsync(AttendanceRecordDto record, CancellationToken cancellationToken = default); }
public interface IAttendanceService
{
    Task<(AttendanceRecordDto? Value, string? Error)> CheckInAsync(Guid employeeId, string actorUserId, CancellationToken cancellationToken = default);
    Task<(AttendanceRecordDto? Value, string? Error)> CheckOutAsync(Guid employeeId, string actorUserId, CancellationToken cancellationToken = default);
    Task<(PersonalAttendanceRecordDto? Value, string? Error)> CheckInSelfAsync(string userId, CancellationToken cancellationToken = default);
    Task<(PersonalAttendanceRecordDto? Value, string? Error)> CheckOutSelfAsync(string userId, CancellationToken cancellationToken = default);
    Task<AttendanceTodayResponse> TodayAsync(CancellationToken cancellationToken = default);
    Task<(AttendancePage? Value, string? Error)> MineAsync(string userId, DateOnly? from, DateOnly? to, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<(AttendanceCurrentResponse? Value, string? Error)> CurrentAsync(string userId, CancellationToken cancellationToken = default);
    Task<(AdministrativeAttendancePage? Value, string? Error)> AdministrativeAsync(Guid? employeeId, DateOnly? from, DateOnly? to, ShiftType? shiftType, AttendanceLifecycle? outcome, bool? late, int page, int pageSize, CancellationToken cancellationToken = default);
}
