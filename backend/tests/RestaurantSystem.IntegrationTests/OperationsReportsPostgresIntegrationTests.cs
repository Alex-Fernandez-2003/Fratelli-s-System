using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using RestaurantSystem.Domain.Attendance;
using RestaurantSystem.Domain.Operations;
using RestaurantSystem.Infrastructure;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class OperationsReportsPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Sales_report_filters_by_business_date_shift_and_channel_before_all_aggregates()
    {
        var connectionString = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "reports_sales_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(connectionString);
        await using var factory = new AuthWebApplicationFactory(connectionString, "Development");
        using var client = factory.CreateClient();
        await client.GetAsync("/health");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options;
        string actor;
        await using (var db = new ApplicationDbContext(options))
        {
            actor = await db.Users.Where(x => x.UserName == "admin.test").Select(x => x.Id).SingleAsync();
            var firstDate = new DateOnly(2026, 9, 1);
            var secondDate = firstDate.AddDays(1);
            var outsideDate = secondDate.AddDays(1);
            var firstSession = Session(firstDate, actor);
            var secondSession = Session(secondDate, actor);
            var outsideSession = Session(outsideDate, actor);
            var firstMorning = Shift(firstSession, ShiftType.MORNING);
            var firstNight = Shift(firstSession, ShiftType.NIGHT);
            var secondMorning = Shift(secondSession, ShiftType.MORNING);
            var outsideMorning = Shift(outsideSession, ShiftType.MORNING);
            db.CashSessions.AddRange(firstSession, secondSession, outsideSession);
            db.Shifts.AddRange(firstMorning, firstNight, secondMorning, outsideMorning);
            db.Sales.AddRange(
                Sale(firstMorning, SalesChannel.DIRECT, PaymentMethod.CASH, 10m, new DateTimeOffset(2026, 8, 31, 23, 30, 0, TimeSpan.Zero), actor),
                Sale(firstNight, SalesChannel.PEDIDOSYA, PaymentMethod.QR, 20m, new DateTimeOffset(2026, 9, 2, 0, 30, 0, TimeSpan.Zero), actor),
                Sale(secondMorning, SalesChannel.DIRECT, PaymentMethod.EXTERNAL, 30m, new DateTimeOffset(2026, 9, 2, 12, 0, 0, TimeSpan.Zero), actor),
                Sale(outsideMorning, SalesChannel.PEDIDOSYA, PaymentMethod.CASH, 40m, new DateTimeOffset(2026, 9, 3, 12, 0, 0, TimeSpan.Zero), actor));
            await db.SaveChangesAsync();
        }

        var token = await Token(client, "admin.test");
        var openApi = await client.GetFromJsonAsync<JsonElement>("/openapi/v1.json");
        var queryParameters = openApi.GetProperty("paths").GetProperty("/api/v1/reports/sales").GetProperty("get").GetProperty("parameters").EnumerateArray().Select(x => x.GetProperty("name").GetString()).ToArray();
        Assert.Contains("shiftType", queryParameters);
        Assert.Contains("salesChannel", queryParameters);

        var period = await Get(client, "/api/v1/reports/sales?from=2026-09-01&to=2026-09-02", token);
        Assert.Equal(HttpStatusCode.OK, period.StatusCode);
        var periodBody = await period.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(3, periodBody.GetProperty("salesCount").GetInt32());
        Assert.Equal(60m, periodBody.GetProperty("totalAmount").GetDecimal());
        Assert.Equal(10m, periodBody.GetProperty("cashTotal").GetDecimal());
        Assert.Equal(20m, periodBody.GetProperty("qrTotal").GetDecimal());
        Assert.Equal(30m, periodBody.GetProperty("externalTotal").GetDecimal());
        Assert.Equal(40m, periodBody.GetProperty("directTotal").GetDecimal());
        Assert.Equal(20m, periodBody.GetProperty("pedidosYaTotal").GetDecimal());
        var series = periodBody.GetProperty("series").EnumerateArray().ToArray();
        Assert.Equal(2, series.Length);
        Assert.Equal("2026-09-01", series[0].GetProperty("businessDate").GetString());
        Assert.Equal(30m, series[0].GetProperty("totalAmount").GetDecimal());
        Assert.Equal("2026-09-02", series[1].GetProperty("businessDate").GetString());
        Assert.Equal(30m, series[1].GetProperty("totalAmount").GetDecimal());
        Assert.Equal(periodBody.GetProperty("salesCount").GetInt32(), series.Sum(x => x.GetProperty("salesCount").GetInt32()));
        Assert.Equal(periodBody.GetProperty("totalAmount").GetDecimal(), series.Sum(x => x.GetProperty("totalAmount").GetDecimal()));

        var night = await Get(client, "/api/v1/reports/sales?from=2026-09-01&to=2026-09-02&shiftType=NIGHT", token);
        var nightBody = await night.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(1, nightBody.GetProperty("salesCount").GetInt32());
        Assert.Equal(20m, nightBody.GetProperty("totalAmount").GetDecimal());
        Assert.Equal(20m, nightBody.GetProperty("qrTotal").GetDecimal());
        Assert.Equal(20m, nightBody.GetProperty("pedidosYaTotal").GetDecimal());
        Assert.Equal(20m, nightBody.GetProperty("series")[0].GetProperty("totalAmount").GetDecimal());

        var channel = await Get(client, "/api/v1/reports/sales?from=2026-09-01&to=2026-09-02&salesChannel=PEDIDOSYA", token);
        var channelBody = await channel.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(1, channelBody.GetProperty("salesCount").GetInt32());
        Assert.Equal(20m, channelBody.GetProperty("totalAmount").GetDecimal());
        Assert.Equal(0m, channelBody.GetProperty("directTotal").GetDecimal());
        Assert.Equal(20m, channelBody.GetProperty("pedidosYaTotal").GetDecimal());

        var combined = await Get(client, "/api/v1/reports/sales?from=2026-09-01&to=2026-09-02&shiftType=MORNING&salesChannel=DIRECT", token);
        var combinedBody = await combined.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(2, combinedBody.GetProperty("salesCount").GetInt32());
        Assert.Equal(40m, combinedBody.GetProperty("totalAmount").GetDecimal());
        Assert.Equal(10m, combinedBody.GetProperty("cashTotal").GetDecimal());
        Assert.Equal(30m, combinedBody.GetProperty("externalTotal").GetDecimal());
        Assert.Equal(40m, combinedBody.GetProperty("directTotal").GetDecimal());
        Assert.Equal(0m, combinedBody.GetProperty("pedidosYaTotal").GetDecimal());

        var invalid = await Get(client, "/api/v1/reports/sales?from=2026-09-02&to=2026-09-01", token);
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        var invalidBody = await invalid.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(invalidBody.GetProperty("errors").TryGetProperty("sales", out _));
    }

    [Fact]
    public async Task Attendance_report_filters_and_summarizes_derived_closed_work_without_open_clock_values()
    {
        var connectionString = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "reports_attendance_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(connectionString);
        await using var factory = new AuthWebApplicationFactory(connectionString, "Development");
        using var client = factory.CreateClient();
        await client.GetAsync("/health");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options;
        Guid lateEmployee;
        Guid absentEmployee;
        Guid openEmployee;
        string actor;
        var lateDate = new DateOnly(2026, 9, 10);
        var openDate = lateDate.AddDays(1);
        var secondClosedDate = lateDate.AddDays(2);
        await using (var db = new ApplicationDbContext(options))
        {
            actor = await db.Users.Where(x => x.UserName == "admin.test").Select(x => x.Id).SingleAsync();
            var employees = await db.Employees.OrderBy(x => x.FullName).Take(3).ToArrayAsync();
            lateEmployee = employees[0].Id;
            absentEmployee = employees[1].Id;
            openEmployee = employees[2].Id;
            var lateSession = Session(lateDate, actor);
            var lateShift = Shift(lateSession, ShiftType.MORNING, ShiftStatus.COMPLETED);
            var absentShift = Shift(lateSession, ShiftType.NIGHT, ShiftStatus.COMPLETED);
            var openSession = Session(openDate, actor);
            var openShift = Shift(openSession, ShiftType.MORNING, ShiftStatus.ACTIVE);
            var secondSession = Session(secondClosedDate, actor);
            var secondShift = Shift(secondSession, ShiftType.MORNING, ShiftStatus.COMPLETED);
            db.CashSessions.AddRange(lateSession, openSession, secondSession);
            db.Shifts.AddRange(lateShift, absentShift, openShift, secondShift);
            db.ShiftAssignments.AddRange(
                Assignment(lateShift, lateEmployee, actor),
                Assignment(absentShift, absentEmployee, actor),
                Assignment(openShift, openEmployee, actor),
                Assignment(secondShift, lateEmployee, actor));
            db.AttendanceRecords.AddRange(
                Record(lateEmployee, lateDate, 8, 11, 12, 11, actor),
                Record(openEmployee, openDate, 8, 0, null, null, actor),
                Record(lateEmployee, secondClosedDate, 8, 0, 10, 0, actor));
            await db.SaveChangesAsync();
        }

        var token = await Token(client, "admin.test");
        var openApi = await client.GetFromJsonAsync<JsonElement>("/openapi/v1.json");
        var queryParameters = openApi.GetProperty("paths").GetProperty("/api/v1/reports/attendance").GetProperty("get").GetProperty("parameters").EnumerateArray().Select(x => x.GetProperty("name").GetString()).ToArray();
        Assert.Contains("shiftType", queryParameters);

        var period = await Get(client, "/api/v1/reports/attendance?from=2026-09-10&to=2026-09-12", token);
        Assert.Equal(HttpStatusCode.OK, period.StatusCode);
        var periodBody = await period.Content.ReadFromJsonAsync<JsonElement>();
        var lateItem = periodBody.GetProperty("items").EnumerateArray().Single(x => x.GetProperty("employeeId").GetGuid() == lateEmployee);
        var absentItem = periodBody.GetProperty("items").EnumerateArray().Single(x => x.GetProperty("employeeId").GetGuid() == absentEmployee);
        var openItem = periodBody.GetProperty("items").EnumerateArray().Single(x => x.GetProperty("employeeId").GetGuid() == openEmployee);
        Assert.Equal(2, lateItem.GetProperty("attendanceCount").GetInt32());
        Assert.Equal(1, lateItem.GetProperty("lateCount").GetInt32());
        Assert.Equal(0, lateItem.GetProperty("absenceCount").GetInt32());
        Assert.Equal(360, lateItem.GetProperty("workedMinutes").GetInt32());
        Assert.Equal(6m, lateItem.GetProperty("workedHours").GetDecimal());
        Assert.Equal(120m, lateItem.GetProperty("projectedPay").GetDecimal());
        Assert.Equal(0, absentItem.GetProperty("attendanceCount").GetInt32());
        Assert.Equal(1, absentItem.GetProperty("absenceCount").GetInt32());
        Assert.Equal(1, openItem.GetProperty("attendanceCount").GetInt32());
        Assert.Equal(0, openItem.GetProperty("workedMinutes").GetInt32());
        Assert.Equal(0m, openItem.GetProperty("projectedPay").GetDecimal());
        AssertReportFields(lateItem);

        var summary = periodBody.GetProperty("summary");
        Assert.Equal(3, summary.GetProperty("attendanceCount").GetInt32());
        Assert.Equal(360, summary.GetProperty("totalWorkedMinutes").GetInt32());
        Assert.Equal(6m, summary.GetProperty("workedHours").GetDecimal());
        Assert.Equal(1, summary.GetProperty("lateCount").GetInt32());
        Assert.Equal(1, summary.GetProperty("absenceCount").GetInt32());
        Assert.Equal(120m, summary.GetProperty("projectedPay").GetDecimal());
        Assert.Equal(summary.GetProperty("attendanceCount").GetInt32(), periodBody.GetProperty("items").EnumerateArray().Sum(x => x.GetProperty("attendanceCount").GetInt32()));
        Assert.Equal(summary.GetProperty("totalWorkedMinutes").GetInt32(), periodBody.GetProperty("items").EnumerateArray().Sum(x => x.GetProperty("workedMinutes").GetInt32()));
        Assert.Equal(summary.GetProperty("lateCount").GetInt32(), periodBody.GetProperty("items").EnumerateArray().Sum(x => x.GetProperty("lateCount").GetInt32()));
        Assert.Equal(summary.GetProperty("absenceCount").GetInt32(), periodBody.GetProperty("items").EnumerateArray().Sum(x => x.GetProperty("absenceCount").GetInt32()));
        Assert.Equal(summary.GetProperty("projectedPay").GetDecimal(), periodBody.GetProperty("items").EnumerateArray().Sum(x => x.GetProperty("projectedPay").GetDecimal()));

        var night = await Get(client, "/api/v1/reports/attendance?from=2026-09-10&to=2026-09-12&shiftType=NIGHT", token);
        var nightBody = await night.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(0, nightBody.GetProperty("summary").GetProperty("attendanceCount").GetInt32());
        Assert.Equal(1, nightBody.GetProperty("summary").GetProperty("absenceCount").GetInt32());
        Assert.Equal(1, nightBody.GetProperty("items").EnumerateArray().Single(x => x.GetProperty("employeeId").GetGuid() == absentEmployee).GetProperty("absenceCount").GetInt32());

        var employee = await Get(client, $"/api/v1/reports/attendance?from=2026-09-10&to=2026-09-12&employeeId={lateEmployee}", token);
        var employeeBody = await employee.Content.ReadFromJsonAsync<JsonElement>();
        var employeeItem = employeeBody.GetProperty("items").EnumerateArray().Single();
        Assert.Equal(lateEmployee, employeeItem.GetProperty("employeeId").GetGuid());
        Assert.Equal(2, employeeItem.GetProperty("attendanceCount").GetInt32());
        Assert.Equal(360, employeeBody.GetProperty("summary").GetProperty("totalWorkedMinutes").GetInt32());
        Assert.Equal(1, employeeBody.GetProperty("summary").GetProperty("lateCount").GetInt32());

        var combined = await Get(client, $"/api/v1/reports/attendance?from=2026-09-12&to=2026-09-12&employeeId={lateEmployee}&shiftType=MORNING", token);
        var combinedBody = await combined.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(1, combinedBody.GetProperty("items").EnumerateArray().Single(x => x.GetProperty("employeeId").GetGuid() == lateEmployee).GetProperty("attendanceCount").GetInt32());
        Assert.Equal(120, combinedBody.GetProperty("summary").GetProperty("totalWorkedMinutes").GetInt32());
        Assert.Equal(20m * 2m, combinedBody.GetProperty("summary").GetProperty("projectedPay").GetDecimal());

        var invalid = await Get(client, "/api/v1/reports/attendance?from=2026-09-12&to=2026-09-10", token);
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        var invalidBody = await invalid.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(invalidBody.GetProperty("errors").TryGetProperty("attendance", out _));
    }

    private static void AssertReportFields(JsonElement item)
    {
        foreach (var property in new[] { "employeeId", "fullName", "attendanceCount", "lateCount", "absenceCount", "workedMinutes", "workedHours", "hourlyRate", "projectedPay" })
            Assert.True(item.TryGetProperty(property, out _), $"Attendance report item is missing '{property}'.");
    }

    private static CashSession Session(DateOnly businessDate, string actor) => new() { BusinessDate = businessDate, OpenedAt = BusinessUtcAt(businessDate, new TimeOnly(0, 0)), OpenedByUserId = actor };
    private static Shift Shift(CashSession session, ShiftType type, ShiftStatus status = ShiftStatus.ACTIVE) => new() { CashSessionId = session.Id, Type = type, Status = status };
    private static ShiftAssignment Assignment(Shift shift, Guid employeeId, string actor) => new() { ShiftId = shift.Id, EmployeeId = employeeId, AssignedAt = DateTimeOffset.UtcNow, AssignedByUserId = actor, EffectivePlannedStart = shift.Type == ShiftType.MORNING ? new TimeOnly(8, 0) : new TimeOnly(18, 0), EffectivePlannedEnd = shift.Type == ShiftType.MORNING ? new TimeOnly(12, 0) : new TimeOnly(22, 0), EffectiveLateToleranceMinutes = 10 };
    private static AttendanceRecord Record(Guid employeeId, DateOnly businessDate, int checkInHour, int checkInMinute, int? checkOutHour, int? checkOutMinute, string actor) => new() { EmployeeId = employeeId, BusinessDate = businessDate, CheckInAt = BusinessUtcAt(businessDate, new TimeOnly(checkInHour, checkInMinute)), CheckInByUserId = actor, CheckOutAt = checkOutHour is null ? null : BusinessUtcAt(businessDate, new TimeOnly(checkOutHour.Value, checkOutMinute!.Value)), CheckOutByUserId = checkOutHour is null ? null : actor };
    private static Sale Sale(Shift shift, SalesChannel channel, PaymentMethod payment, decimal total, DateTimeOffset confirmedAt, string actor) => new() { OrderId = Guid.NewGuid(), ShiftId = shift.Id, SalesChannel = channel, PaymentMethod = payment, Subtotal = total, Total = total, ConfirmedAt = confirmedAt, ConfirmedByUserId = actor };
    private static DateTimeOffset BusinessUtcAt(DateOnly date, TimeOnly time)
    {
        var zone = TimeZoneInfo.FindSystemTimeZoneById("America/La_Paz");
        var local = DateTime.SpecifyKind(date.ToDateTime(time), DateTimeKind.Unspecified);
        return new DateTimeOffset(TimeZoneInfo.ConvertTimeToUtc(local, zone), TimeSpan.Zero);
    }

    private static async Task<string> Token(HttpClient client, string username) => (await (await client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" })).Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
    private static Task<HttpResponseMessage> Get(HttpClient client, string path, string token)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client.SendAsync(request);
    }
}
