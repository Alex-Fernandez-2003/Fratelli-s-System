namespace RestaurantSystem.Application.Attendance;

public sealed record AttendanceRecordDto(Guid Id, Guid EmployeeId, DateOnly BusinessDate, DateTimeOffset CheckInAt, string CheckInByUserId, DateTimeOffset? CheckOutAt, string? CheckOutByUserId);
public sealed record AttendanceTodayItem(Guid EmployeeId, string FullName, bool IsActive, IReadOnlyList<AttendanceRecordDto> AttendanceRecords, string CurrentState);
public sealed record AttendanceTodayResponse(DateOnly BusinessDate, string TimeZone, IReadOnlyList<AttendanceTodayItem> Items);
public sealed record AttendancePage(IReadOnlyList<AttendanceRecordDto> Items, int Page, int PageSize, int TotalCount, int TotalPages);

public interface IBusinessClock { DateTimeOffset UtcNow { get; } DateOnly BusinessDate { get; } string TimeZoneId { get; } }
public interface IAttendanceNotifier { Task AttendanceUpdatedAsync(AttendanceRecordDto record, CancellationToken cancellationToken = default); }
public interface IAttendanceService
{
    Task<(AttendanceRecordDto? Value, string? Error)> CheckInAsync(Guid employeeId, string actorUserId, CancellationToken cancellationToken = default);
    Task<(AttendanceRecordDto? Value, string? Error)> CheckOutAsync(Guid employeeId, string actorUserId, CancellationToken cancellationToken = default);
    Task<AttendanceTodayResponse> TodayAsync(CancellationToken cancellationToken = default);
    Task<(AttendancePage? Value, string? Error)> MineAsync(string userId, DateOnly? from, DateOnly? to, int page, int pageSize, CancellationToken cancellationToken = default);
}
