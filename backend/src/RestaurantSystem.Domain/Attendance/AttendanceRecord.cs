namespace RestaurantSystem.Domain.Attendance;

public sealed class AttendanceRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EmployeeId { get; set; }
    public DateOnly BusinessDate { get; set; }
    public DateTimeOffset CheckInAt { get; set; }
    public string CheckInByUserId { get; set; } = string.Empty;
    public DateTimeOffset? CheckOutAt { get; set; }
    public string? CheckOutByUserId { get; set; }
}
