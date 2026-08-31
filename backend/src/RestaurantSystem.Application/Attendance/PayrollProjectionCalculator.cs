namespace RestaurantSystem.Application.Attendance;

public sealed record PayrollProjection(int WorkedMinutes, decimal WorkedHours, decimal ProjectedPay);

public sealed class PayrollProjectionCalculator
{
    private const decimal MinutesPerHour = 60m;

    public PayrollProjection Calculate(int workedMinutes, decimal hourlyRate)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(workedMinutes);
        ArgumentOutOfRangeException.ThrowIfNegative(hourlyRate);

        var workedHours = workedMinutes / MinutesPerHour;
        return new PayrollProjection(workedMinutes, workedHours, workedHours * hourlyRate);
    }

    public PayrollProjection Calculate(IEnumerable<AttendanceDerivationResult> attendance, decimal hourlyRate)
    {
        ArgumentNullException.ThrowIfNull(attendance);

        var closedWorkedMinutes = attendance
            .Where(record => record.Lifecycle == AttendanceLifecycle.CLOSED && record.WorkedMinutes.HasValue)
            .Sum(record => record.WorkedMinutes!.Value);

        return Calculate(closedWorkedMinutes, hourlyRate);
    }
}
