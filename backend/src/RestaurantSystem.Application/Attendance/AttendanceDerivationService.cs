using RestaurantSystem.Domain.Attendance;
using RestaurantSystem.Domain.Operations;

namespace RestaurantSystem.Application.Attendance;

public enum AttendanceLifecycle { NO_ASSIGNMENT, NO_RECORD, OPEN, CLOSED, ABSENT }

public sealed record AttendanceDerivationInput(CashSession CashSession, Shift? Shift, ShiftAssignment? Assignment, AttendanceRecord? AttendanceRecord);

public sealed record AttendanceDerivationResult(
    DateTimeOffset? PlannedStart,
    DateTimeOffset? PlannedEnd,
    AttendanceLifecycle Lifecycle,
    int? WorkedMinutes,
    bool IsLate,
    int LateMinutes,
    bool IsAbsent);

public sealed class AttendanceDerivationService(IBusinessClock clock)
{
    public AttendanceDerivationResult Derive(AttendanceDerivationInput input)
    {
        if (input.Assignment is null)
            return WithoutAssignment(input.AttendanceRecord);

        if (input.Shift is null || input.Shift.Id != input.Assignment.ShiftId || input.Shift.CashSessionId != input.CashSession.Id)
            throw new ArgumentException("The assignment must belong to the supplied shift and cash session.", nameof(input));

        var plannedStart = AtBusinessTime(input.CashSession.BusinessDate, input.Assignment.EffectivePlannedStart);
        var endDate = input.Assignment.EffectivePlannedEnd <= input.Assignment.EffectivePlannedStart
            ? input.CashSession.BusinessDate.AddDays(1)
            : input.CashSession.BusinessDate;
        var plannedEnd = AtBusinessTime(endDate, input.Assignment.EffectivePlannedEnd);
        var record = input.AttendanceRecord;
        var hasValidCheckIn = record is not null && record.EmployeeId == input.Assignment.EmployeeId && record.BusinessDate == input.CashSession.BusinessDate;

        if (!hasValidCheckIn)
        {
            var absent = input.Shift.Status == ShiftStatus.COMPLETED;
            return new(plannedStart, plannedEnd, absent ? AttendanceLifecycle.ABSENT : AttendanceLifecycle.NO_RECORD, absent ? 0 : null, false, 0, absent);
        }

        var lateMinutes = Math.Max(0, (int)(record!.CheckInAt - plannedStart).TotalMinutes);
        var isLate = lateMinutes > input.Assignment.EffectiveLateToleranceMinutes;
        if (record.CheckOutAt is null)
            return new(plannedStart, plannedEnd, AttendanceLifecycle.OPEN, null, isLate, lateMinutes, false);

        var workedMinutes = Math.Max(0, (int)(record.CheckOutAt.Value - record.CheckInAt).TotalMinutes);
        return new(plannedStart, plannedEnd, AttendanceLifecycle.CLOSED, workedMinutes, isLate, lateMinutes, false);
    }

    private AttendanceDerivationResult WithoutAssignment(AttendanceRecord? record)
    {
        if (record is null) return new(null, null, AttendanceLifecycle.NO_ASSIGNMENT, null, false, 0, false);
        if (record.CheckOutAt is null) return new(null, null, AttendanceLifecycle.OPEN, null, false, 0, false);
        return new(null, null, AttendanceLifecycle.CLOSED, Math.Max(0, (int)(record.CheckOutAt.Value - record.CheckInAt).TotalMinutes), false, 0, false);
    }

    private DateTimeOffset AtBusinessTime(DateOnly date, TimeOnly time)
    {
        var zone = TimeZoneInfo.FindSystemTimeZoneById(clock.TimeZoneId);
        var local = DateTime.SpecifyKind(date.ToDateTime(time), DateTimeKind.Unspecified);
        return new DateTimeOffset(TimeZoneInfo.ConvertTimeToUtc(local, zone), TimeSpan.Zero);
    }
}
