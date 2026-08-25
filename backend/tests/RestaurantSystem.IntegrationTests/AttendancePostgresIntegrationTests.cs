using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Microsoft.Extensions.Logging.Abstractions;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Attendance;
using Xunit;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class AttendancePostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Attendance_uses_postgresql_open_index_roles_cycles_today_and_own_history()
    {
        var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "attendance_" + Guid.NewGuid().ToString("N") };
        await postgres.MigrateAsync(database.ConnectionString);
        await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development");
        using var client = factory.CreateClient();
        var admin = await Login(client, "admin.test"); var adminToken = Token(await admin.Content.ReadFromJsonAsync<JsonElement>());
        var employee = await Login(client, "empleado.test"); var employeePayload = await employee.Content.ReadFromJsonAsync<JsonElement>(); var employeeToken = Token(employeePayload);
        var employeeId = employeePayload.GetProperty("user").GetProperty("employeeId").GetGuid();
        var manager = await Login(client, "encargado.test"); var managerToken = Token(await manager.Content.ReadFromJsonAsync<JsonElement>());
        var received = new TaskCompletionSource<JsonElement>(TaskCreationOptions.RunContinuationsAsynchronously);
        await using var hub = new HubConnectionBuilder().WithUrl(new Uri(factory.Server.BaseAddress, "/hubs/attendance"), options => { options.AccessTokenProvider = () => Task.FromResult<string?>(adminToken); options.HttpMessageHandlerFactory = _ => factory.Server.CreateHandler(); options.Transports = HttpTransportType.LongPolling; }).Build();
        hub.On<JsonElement>("AttendanceUpdated", value => received.TrySetResult(value)); await hub.StartAsync();

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/attendance/employees/today")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, $"/api/v1/attendance/employees/{employeeId}/check-in", employeeToken)).StatusCode);
        var checkIn = await Send(client, HttpMethod.Post, $"/api/v1/attendance/employees/{employeeId}/check-in", managerToken);
        Assert.Equal(HttpStatusCode.Created, checkIn.StatusCode);
        var record = await checkIn.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(employeeId, (await received.Task.WaitAsync(TimeSpan.FromSeconds(5))).GetProperty("employeeId").GetGuid());
        Assert.Equal(employeeId, record.GetProperty("employeeId").GetGuid()); Assert.NotEqual(employeeToken, record.GetProperty("checkInByUserId").GetString());
        var noEvent = new TaskCompletionSource<JsonElement>(TaskCreationOptions.RunContinuationsAsynchronously); hub.On<JsonElement>("AttendanceUpdated", value => noEvent.TrySetResult(value));
        Assert.Equal(HttpStatusCode.Conflict, (await Send(client, HttpMethod.Post, $"/api/v1/attendance/employees/{employeeId}/check-in", adminToken)).StatusCode);
        await Task.Delay(250); Assert.False(noEvent.Task.IsCompleted);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/attendance/employees/today", adminToken)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/attendance/me?page=1&pageSize=20", employeeToken)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Get, "/api/v1/attendance/me?from=2026-02-02&to=2026-02-01", employeeToken)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Post, $"/api/v1/attendance/employees/{employeeId}/check-out", adminToken)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await Send(client, HttpMethod.Post, $"/api/v1/attendance/employees/{employeeId}/check-out", adminToken)).StatusCode);
        Assert.Equal(HttpStatusCode.Created, (await Send(client, HttpMethod.Post, $"/api/v1/attendance/employees/{employeeId}/check-in", adminToken)).StatusCode);

        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database.ConnectionString).Options;
        await using var db = new ApplicationDbContext(options);
        Assert.Equal(2, await db.AttendanceRecords.CountAsync(x => x.EmployeeId == employeeId));
        Assert.Equal(1, await db.AttendanceRecords.CountAsync(x => x.EmployeeId == employeeId && x.CheckOutAt == null));
    }

    [Fact]
    public async Task Concurrent_checkins_allow_exactly_one_open_record()
    {
        var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "attendance_race_" + Guid.NewGuid().ToString("N") };
        await postgres.MigrateAsync(database.ConnectionString);
        await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development");
        using var client = factory.CreateClient();
        var admin = await Login(client, "admin.test"); var token = Token(await admin.Content.ReadFromJsonAsync<JsonElement>());
        var employee = await Login(client, "empleado.test"); var employeeId = (await employee.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("user").GetProperty("employeeId").GetGuid();
        var responses = await Task.WhenAll(Enumerable.Range(0, 2).Select(_ => Send(client, HttpMethod.Post, $"/api/v1/attendance/employees/{employeeId}/check-in", token)));
        Assert.Equal(1, responses.Count(x => x.StatusCode == HttpStatusCode.Created)); Assert.Equal(1, responses.Count(x => x.StatusCode == HttpStatusCode.Conflict));
    }

    [Fact]
    public async Task Notifier_failure_after_commit_keeps_attendance_persisted()
    {
        var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "attendance_notifier_" + Guid.NewGuid().ToString("N") };
        await postgres.MigrateAsync(database.ConnectionString);
        await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development"); using var client = factory.CreateClient(); await client.GetAsync("/health");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database.ConnectionString).Options;
        await using var db = new ApplicationDbContext(options); var employee = await db.Employees.OrderBy(x => x.UserId).FirstAsync();
        var service = new AttendanceService(db, new TestClock(), new ThrowingNotifier(), NullLogger<AttendanceService>.Instance);
        var result = await service.CheckInAsync(employee.Id, employee.UserId);
        Assert.Null(result.Error); Assert.True(await db.AttendanceRecords.AnyAsync(x => x.Id == result.Value!.Id));
    }

    private sealed class TestClock : IBusinessClock { public DateTimeOffset UtcNow => DateTimeOffset.UtcNow; public DateOnly BusinessDate => DateOnly.FromDateTime(UtcNow.UtcDateTime); public string TimeZoneId => "America/Argentina/Buenos_Aires"; }
    private sealed class ThrowingNotifier : IAttendanceNotifier { public Task AttendanceUpdatedAsync(AttendanceRecordDto record, CancellationToken cancellationToken = default) => Task.FromException(new InvalidOperationException("test notifier failure")); }
    private static string Token(JsonElement payload) => payload.GetProperty("accessToken").GetString()!;
    private static Task<HttpResponseMessage> Login(HttpClient client, string username) => client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" });
    private static Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token = null) { var request = new HttpRequestMessage(method, path); if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); return client.SendAsync(request); }
}
