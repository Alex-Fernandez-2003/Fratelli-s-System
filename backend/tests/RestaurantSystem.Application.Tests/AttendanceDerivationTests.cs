using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Domain.Attendance;
using RestaurantSystem.Domain.Operations;

namespace RestaurantSystem.Application.Tests;

public sealed class AttendanceDerivationTests
{
    private static readonly DateOnly BusinessDate = new(2026, 8, 31);

    [Theory]
    [InlineData(8, 0, false, 0)]
    [InlineData(8, 10, false, 10)]
    [InlineData(8, 11, true, 11)]
    [InlineData(18, 10, false, 10)]
    [InlineData(18, 11, true, 11)]
    public void Derive_uses_effective_schedule_and_strict_late_tolerance(int hour, int minute, bool isLate, int lateMinutes)
    {
        var (session, shift, assignment) = AssignedShift(ShiftType.MORNING, new(8, 0), new(12, 0), ShiftStatus.ACTIVE);
        if (hour >= 18) (session, shift, assignment) = AssignedShift(ShiftType.NIGHT, new(18, 0), new(22, 0), ShiftStatus.ACTIVE);
        var record = Record(assignment.EmployeeId, BusinessDate, hour, minute);

        var result = new AttendanceDerivationService(new FixedClock(BusinessDate)).Derive(new(session, shift, assignment, record));

        Assert.Equal(new DateTimeOffset(2026, 8, 31, hour >= 18 ? 18 : 8, 0, 0, TimeSpan.Zero), result.PlannedStart);
        Assert.Equal(isLate, result.IsLate);
        Assert.Equal(lateMinutes, result.LateMinutes);
        Assert.Equal(AttendanceLifecycle.OPEN, result.Lifecycle);
        Assert.Null(result.WorkedMinutes);
    }

    [Theory]
    [InlineData(12, 0, 240)]
    [InlineData(11, 30, 210)]
    [InlineData(12, 30, 270)]
    public void Derive_closed_records_have_stable_worked_minutes(int checkoutHour, int checkoutMinute, int workedMinutes)
    {
        var (session, shift, assignment) = AssignedShift(ShiftType.MORNING, new(8, 0), new(12, 0), ShiftStatus.COMPLETED);
        var record = Record(assignment.EmployeeId, BusinessDate, 8, 0, checkoutHour, checkoutMinute);

        var result = new AttendanceDerivationService(new FixedClock(BusinessDate)).Derive(new(session, shift, assignment, record));

        Assert.Equal(AttendanceLifecycle.CLOSED, result.Lifecycle);
        Assert.Equal(workedMinutes, result.WorkedMinutes);
    }

    [Fact]
    public void Derive_marks_absence_only_for_assigned_completed_shift_without_a_valid_checkin()
    {
        var (session, shift, assignment) = AssignedShift(ShiftType.MORNING, new(8, 0), new(12, 0), ShiftStatus.COMPLETED);
        var service = new AttendanceDerivationService(new FixedClock(BusinessDate));

        var absent = service.Derive(new(session, shift, assignment, null));
        var active = service.Derive(new(session, new Shift { Id = shift.Id, CashSessionId = session.Id, Status = ShiftStatus.ACTIVE }, assignment, null));
        var invalidCheckIn = service.Derive(new(session, shift, assignment, Record(Guid.NewGuid(), BusinessDate, 8, 0)));
        var checkedIn = service.Derive(new(session, shift, assignment, Record(assignment.EmployeeId, BusinessDate, 8, 0)));

        Assert.True(absent.IsAbsent); Assert.Equal(AttendanceLifecycle.ABSENT, absent.Lifecycle); Assert.Equal(0, absent.WorkedMinutes); Assert.False(absent.IsLate);
        Assert.False(active.IsAbsent); Assert.True(invalidCheckIn.IsAbsent); Assert.False(checkedIn.IsAbsent);
    }

    [Fact]
    public void Derive_does_not_mark_missing_assignment_absent_and_keeps_historical_snapshot_after_configuration_changes()
    {
        var (session, shift, assignment) = AssignedShift(ShiftType.MORNING, new(8, 0), new(12, 0), ShiftStatus.COMPLETED);
        var service = new AttendanceDerivationService(new FixedClock(BusinessDate));

        var noAssignment = service.Derive(new(session, null, null, null));
        var historical = service.Derive(new(session, shift, assignment, Record(assignment.EmployeeId, BusinessDate, 8, 11)));
        var mutableConfiguration = new WorkSchedule { ShiftType = ShiftType.MORNING, PlannedStart = new(8, 30), PlannedEnd = new(12, 30), LateToleranceMinutes = 0 };

        Assert.False(noAssignment.IsAbsent);
        Assert.Equal(AttendanceLifecycle.NO_ASSIGNMENT, noAssignment.Lifecycle);
        Assert.Null(noAssignment.PlannedStart);
        Assert.Equal(new DateTimeOffset(2026, 8, 31, 8, 0, 0, TimeSpan.Zero), historical.PlannedStart);
        Assert.True(historical.IsLate);
        Assert.Equal(new TimeOnly(8, 30), mutableConfiguration.PlannedStart);
    }

    [Theory]
    [InlineData(120, 20, 2, 40)]
    [InlineData(90, 20, 1.5, 30)]
    [InlineData(15, 20, 0.25, 5)]
    [InlineData(0, 20, 0, 0)]
    [InlineData(90, 30, 1.5, 45)]
    public void Payroll_projection_calculates_decimal_hours_and_pay_without_truncation(int workedMinutes, decimal hourlyRate, decimal expectedHours, decimal expectedPay)
    {
        var result = new PayrollProjectionCalculator().Calculate(workedMinutes, hourlyRate);

        Assert.Equal(expectedHours, result.WorkedHours);
        Assert.Equal(expectedPay, result.ProjectedPay);
    }

    [Fact]
    public void Payroll_projection_aggregates_only_closed_attendance_without_late_or_absence_penalties()
    {
        var calculator = new PayrollProjectionCalculator();
        var records = new[]
        {
            new AttendanceDerivationResult(null, null, AttendanceLifecycle.CLOSED, 60, false, 0, false),
            new AttendanceDerivationResult(null, null, AttendanceLifecycle.CLOSED, 90, true, 11, false),
            new AttendanceDerivationResult(null, null, AttendanceLifecycle.OPEN, null, true, 15, false),
            new AttendanceDerivationResult(null, null, AttendanceLifecycle.ABSENT, 0, false, 0, true)
        };

        var result = calculator.Calculate(records, 20m);

        Assert.Equal(150, result.WorkedMinutes);
        Assert.Equal(2.5m, result.WorkedHours);
        Assert.Equal(50m, result.ProjectedPay);
    }

    [Fact]
    public void Payroll_projection_preserves_positive_one_minute_precision()
    {
        var result = new PayrollProjectionCalculator().Calculate(1, 20m);

        Assert.Equal(1m / 60m, result.WorkedHours);
        Assert.Equal((1m / 60m) * 20m, result.ProjectedPay);
        Assert.True(result.ProjectedPay > 0m);
    }

    private static (CashSession Session, Shift Shift, ShiftAssignment Assignment) AssignedShift(ShiftType type, TimeOnly start, TimeOnly end, ShiftStatus status)
    {
        var session = new CashSession { Id = Guid.NewGuid(), BusinessDate = BusinessDate, OpenedByUserId = "user" };
        var shift = new Shift { Id = Guid.NewGuid(), CashSessionId = session.Id, Type = type, Status = status };
        var assignment = new ShiftAssignment { ShiftId = shift.Id, EmployeeId = Guid.NewGuid(), AssignedByUserId = "user", EffectivePlannedStart = start, EffectivePlannedEnd = end, EffectiveLateToleranceMinutes = 10 };
        return (session, shift, assignment);
    }

    private static AttendanceRecord Record(Guid employeeId, DateOnly businessDate, int checkInHour, int checkInMinute, int? checkOutHour = null, int? checkOutMinute = null) => new()
    {
        EmployeeId = employeeId, BusinessDate = businessDate, CheckInAt = new DateTimeOffset(2026, 8, 31, checkInHour, checkInMinute, 0, TimeSpan.Zero), CheckInByUserId = "user",
        CheckOutAt = checkOutHour is null ? null : new DateTimeOffset(2026, 8, 31, checkOutHour.Value, checkOutMinute!.Value, 0, TimeSpan.Zero)
    };

    private sealed class FixedClock(DateOnly businessDate) : IBusinessClock
    {
        public DateTimeOffset UtcNow => new(businessDate.ToDateTime(new(12, 0)), TimeSpan.Zero);
        public DateOnly BusinessDate => businessDate;
        public string TimeZoneId => "UTC";
    }
}
