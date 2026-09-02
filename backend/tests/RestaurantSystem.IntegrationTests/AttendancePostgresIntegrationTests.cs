using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Microsoft.Extensions.Logging.Abstractions;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Domain.Attendance;
using RestaurantSystem.Domain.Operations;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Attendance;
using RestaurantSystem.Infrastructure.Identity;
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
    public async Task Own_history_is_employee_scoped_filters_paginated_and_returns_not_found_without_employee_link()
    {
        var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "attendance_self_history_" + Guid.NewGuid().ToString("N") };
        await postgres.MigrateAsync(database.ConnectionString);
        await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development");
        using var client = factory.CreateClient();
        await client.GetAsync("/health");

        Guid employeeId;
        await using (var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database.ConnectionString).Options))
        {
            var employeeUser = await db.Users.SingleAsync(x => x.UserName == "empleado.test");
            var otherEmployeeUser = await db.Users.SingleAsync(x => x.UserName == "mesero.test");
            var employee = await db.Employees.SingleAsync(x => x.UserId == employeeUser.Id);
            var otherEmployee = await db.Employees.SingleAsync(x => x.UserId == otherEmployeeUser.Id);
            employeeId = employee.Id;
            db.AttendanceRecords.AddRange(
                new AttendanceRecord { EmployeeId = employee.Id, BusinessDate = new DateOnly(2026, 8, 29), CheckInAt = new DateTimeOffset(2026, 8, 29, 8, 0, 0, TimeSpan.Zero), CheckInByUserId = employee.UserId, CheckOutAt = new DateTimeOffset(2026, 8, 29, 12, 0, 0, TimeSpan.Zero), CheckOutByUserId = employee.UserId },
                new AttendanceRecord { EmployeeId = employee.Id, BusinessDate = new DateOnly(2026, 8, 30), CheckInAt = new DateTimeOffset(2026, 8, 30, 8, 0, 0, TimeSpan.Zero), CheckInByUserId = employee.UserId, CheckOutAt = new DateTimeOffset(2026, 8, 30, 12, 0, 0, TimeSpan.Zero), CheckOutByUserId = employee.UserId },
                new AttendanceRecord { EmployeeId = otherEmployee.Id, BusinessDate = new DateOnly(2026, 8, 30), CheckInAt = new DateTimeOffset(2026, 8, 30, 9, 0, 0, TimeSpan.Zero), CheckInByUserId = otherEmployee.UserId, CheckOutAt = new DateTimeOffset(2026, 8, 30, 13, 0, 0, TimeSpan.Zero), CheckOutByUserId = otherEmployee.UserId });
            var userWithoutEmployee = await db.Users.SingleAsync(x => x.UserName == "cocina.test");
            db.Employees.Remove(await db.Employees.SingleAsync(x => x.UserId == userWithoutEmployee.Id));
            await db.SaveChangesAsync();
        }

        var employeeToken = Token(await (await Login(client, "empleado.test")).Content.ReadFromJsonAsync<JsonElement>());
        var selfResponse = await Send(client, HttpMethod.Get, "/api/v1/attendance/me?from=2026-08-29&to=2026-08-30&page=1&pageSize=1", employeeToken);
        Assert.Equal(HttpStatusCode.OK, selfResponse.StatusCode);
        var page = await selfResponse.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(2, page.GetProperty("totalCount").GetInt32());
        Assert.Single(page.GetProperty("items").EnumerateArray());
        Assert.Equal(new DateOnly(2026, 8, 30), DateOnly.Parse(page.GetProperty("items")[0].GetProperty("businessDate").GetString()!));
        Assert.All(page.GetProperty("items").EnumerateArray(), item => Assert.Equal(employeeId, item.GetProperty("employeeId").GetGuid()));

        var noEmployeeToken = Token(await (await Login(client, "cocina.test")).Content.ReadFromJsonAsync<JsonElement>());
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Get, "/api/v1/attendance/me?page=1&pageSize=20", noEmployeeToken)).StatusCode);
    }

    [Fact]
        public async Task Self_attendance_mutations_are_identity_bound_for_linked_users_and_missing_links()
        {
            var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "attendance_self_mutations_" + Guid.NewGuid().ToString("N") };
            await postgres.MigrateAsync(database.ConnectionString);
            await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development");
            using var client = factory.CreateClient();
            await client.GetAsync("/health");

            Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, HttpMethod.Post, "/api/v1/attendance/me/check-in")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, HttpMethod.Post, "/api/v1/attendance/me/check-out")).StatusCode);

            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database.ConnectionString).Options;
            var linked = new Dictionary<string, (Guid EmployeeId, string UserId)>();
            Guid callerSelectedTargetId;
            Guid administrativeTargetId;
            await using (var db = new ApplicationDbContext(options))
            {
                foreach (var username in new[] { "empleado.test", "mesero.test", "cocina.test" })
                {
                    var user = await db.Users.SingleAsync(x => x.UserName == username);
                    linked[username] = ((await db.Employees.SingleAsync(x => x.UserId == user.Id)).Id, user.Id);
                }

                var targetUser = await db.Users.SingleAsync(x => x.UserName == "contadora.test");
                callerSelectedTargetId = (await db.Employees.SingleAsync(x => x.UserId == targetUser.Id)).Id;
                var administrator = await db.Users.SingleAsync(x => x.UserName == "admin.test");
                administrativeTargetId = (await db.Employees.SingleAsync(x => x.UserId == administrator.Id)).Id;
            }

            var tokens = new Dictionary<string, string>();
            foreach (var username in linked.Keys)
                tokens[username] = Token(await (await Login(client, username)).Content.ReadFromJsonAsync<JsonElement>());
            var noEmployeeToken = Token(await (await Login(client, "contadora.test")).Content.ReadFromJsonAsync<JsonElement>());

            foreach (var (username, identity) in linked)
            {
                var checkIn = await Send(client, HttpMethod.Post, $"/api/v1/attendance/me/check-in?employeeId={callerSelectedTargetId}", tokens[username]);
                Assert.Equal(HttpStatusCode.Created, checkIn.StatusCode);
                var checkInBody = await checkIn.Content.ReadFromJsonAsync<JsonElement>();
                Assert.Equal(identity.EmployeeId, checkInBody.GetProperty("employeeId").GetGuid());
                AssertPersonalProjectionShape(checkInBody);
                Assert.Equal("OPEN", checkInBody.GetProperty("lifecycle").GetString());

                var checkOut = await Send(client, HttpMethod.Post, $"/api/v1/attendance/me/check-out?employeeId={callerSelectedTargetId}", tokens[username]);
                Assert.Equal(HttpStatusCode.OK, checkOut.StatusCode);
                var checkOutBody = await checkOut.Content.ReadFromJsonAsync<JsonElement>();
                Assert.Equal(identity.EmployeeId, checkOutBody.GetProperty("employeeId").GetGuid());
                AssertPersonalProjectionShape(checkOutBody);
                Assert.Equal("CLOSED", checkOutBody.GetProperty("lifecycle").GetString());
            }

            await using (var db = new ApplicationDbContext(options))
            {
                Assert.False(await db.AttendanceRecords.AnyAsync(x => x.EmployeeId == callerSelectedTargetId));
                foreach (var identity in linked.Values)
                {
                    var record = await db.AttendanceRecords.SingleAsync(x => x.EmployeeId == identity.EmployeeId);
                    Assert.Equal(identity.UserId, record.CheckInByUserId);
                    Assert.Equal(identity.UserId, record.CheckOutByUserId);
                }

                var noEmployeeUser = await db.Users.SingleAsync(x => x.UserName == "contadora.test");
                db.Employees.Remove(await db.Employees.SingleAsync(x => x.UserId == noEmployeeUser.Id));
                await db.SaveChangesAsync();
            }

            Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Get, "/api/v1/attendance/me?page=1&pageSize=20", noEmployeeToken)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Post, "/api/v1/attendance/me/check-in", noEmployeeToken)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Post, "/api/v1/attendance/me/check-out", noEmployeeToken)).StatusCode);

            foreach (var token in tokens.Values)
            {
                Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, $"/api/v1/attendance/employees/{administrativeTargetId}/check-in", token)).StatusCode);
                Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, $"/api/v1/attendance/employees/{administrativeTargetId}/check-out", token)).StatusCode);
            }
        }

        [Fact]
        public async Task Personal_attendance_history_returns_derived_projection_and_preserves_same_date_records()
        {
            var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "attendance_personal_projection_" + Guid.NewGuid().ToString("N") };
            await postgres.MigrateAsync(database.ConnectionString);
            await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development");
            using var client = factory.CreateClient();
            await client.GetAsync("/health");

            var businessDate = CurrentBusinessDate();
            var firstCheckIn = UtcAt(businessDate, new TimeOnly(12, 11));
            var firstCheckOut = UtcAt(businessDate, new TimeOnly(16, 11));
            var secondCheckIn = UtcAt(businessDate, new TimeOnly(17, 0));
            var secondCheckOut = UtcAt(businessDate, new TimeOnly(18, 0));
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database.ConnectionString).Options;
            Guid employeeId;

            await using (var db = new ApplicationDbContext(options))
            {
                var employeeUser = await db.Users.SingleAsync(x => x.UserName == "empleado.test");
                var administrator = await db.Users.SingleAsync(x => x.UserName == "admin.test");
                var employee = await db.Employees.SingleAsync(x => x.UserId == employeeUser.Id);
                employeeId = employee.Id;
                var session = new CashSession { BusinessDate = businessDate, OpenedAt = UtcAt(businessDate, new TimeOnly(0, 0)), OpenedByUserId = administrator.Id };
                var shift = new Shift { CashSessionId = session.Id, Type = ShiftType.MORNING, Status = ShiftStatus.COMPLETED };
                var assignment = new ShiftAssignment
                {
                    ShiftId = shift.Id,
                    EmployeeId = employee.Id,
                    AssignedAt = UtcAt(businessDate, new TimeOnly(7, 0)),
                    AssignedByUserId = administrator.Id,
                    EffectivePlannedStart = new TimeOnly(8, 0),
                    EffectivePlannedEnd = new TimeOnly(12, 0),
                    EffectiveLateToleranceMinutes = 10
                };
                db.CashSessions.Add(session);
                db.Shifts.Add(shift);
                db.ShiftAssignments.Add(assignment);
                db.AttendanceRecords.AddRange(
                    new AttendanceRecord { EmployeeId = employee.Id, BusinessDate = businessDate, CheckInAt = firstCheckIn, CheckInByUserId = administrator.Id, CheckOutAt = firstCheckOut, CheckOutByUserId = administrator.Id },
                    new AttendanceRecord { EmployeeId = employee.Id, BusinessDate = businessDate, CheckInAt = secondCheckIn, CheckInByUserId = administrator.Id, CheckOutAt = secondCheckOut, CheckOutByUserId = administrator.Id });
                await db.SaveChangesAsync();
            }

            var token = Token(await (await Login(client, "empleado.test")).Content.ReadFromJsonAsync<JsonElement>());
            var response = await Send(client, HttpMethod.Get, $"/api/v1/attendance/me?from={businessDate:yyyy-MM-dd}&to={businessDate:yyyy-MM-dd}&page=1&pageSize=20", token);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var page = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(2, page.GetProperty("totalCount").GetInt32());
            Assert.Equal(1, page.GetProperty("page").GetInt32());
            Assert.Equal(20, page.GetProperty("pageSize").GetInt32());
            Assert.Equal(1, page.GetProperty("totalPages").GetInt32());
            var items = page.GetProperty("items").EnumerateArray().ToArray();
            Assert.Equal(2, items.Length);
            Assert.Equal(2, items.Select(x => x.GetProperty("id").GetGuid()).Distinct().Count());
            Assert.All(items, item =>
            {
                AssertPersonalProjectionShape(item);
                Assert.Equal(employeeId, item.GetProperty("employeeId").GetGuid());
                Assert.Equal(businessDate, DateOnly.Parse(item.GetProperty("businessDate").GetString()!));
            });

            var projected = items.Single(item => item.GetProperty("checkInAt").GetDateTimeOffset() == firstCheckIn);
            Assert.Equal("MORNING", projected.GetProperty("shiftType").GetString());
            Assert.Equal(BusinessUtcAt(businessDate, new TimeOnly(8, 0)), projected.GetProperty("plannedStart").GetDateTimeOffset());
            Assert.Equal(BusinessUtcAt(businessDate, new TimeOnly(12, 0)), projected.GetProperty("plannedEnd").GetDateTimeOffset());
            Assert.Equal("CLOSED", projected.GetProperty("lifecycle").GetString());
            Assert.Equal(240, projected.GetProperty("workedMinutes").GetInt32());
            Assert.True(projected.GetProperty("isLate").GetBoolean());
            Assert.Equal(11, projected.GetProperty("lateMinutes").GetInt32());
        }

        [Fact]
        public async Task Attendance_openapi_documents_identity_bound_self_operations_and_personal_projection()
        {
            var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "attendance_openapi_" + Guid.NewGuid().ToString("N") };
            await postgres.MigrateAsync(database.ConnectionString);
            await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development");
            using var client = factory.CreateClient();
            var document = await client.GetFromJsonAsync<JsonElement>("/openapi/v1.json");
            var paths = document.GetProperty("paths");

            Assert.True(paths.TryGetProperty("/api/v1/attendance/me/check-in", out var checkInPath));
            Assert.True(paths.TryGetProperty("/api/v1/attendance/me/check-out", out var checkOutPath));
            var checkIn = checkInPath.GetProperty("post");
            var checkOut = checkOutPath.GetProperty("post");
            Assert.True(checkIn.GetProperty("security").GetArrayLength() > 0);
            Assert.True(checkOut.GetProperty("security").GetArrayLength() > 0);
            AssertNoCallerSelectedEmployeeId(checkIn);
            AssertNoCallerSelectedEmployeeId(checkOut);
            AssertPersonalProjectionSchema(ResponseSchema(document, checkIn, "201"));
            AssertPersonalProjectionSchema(ResponseSchema(document, checkOut, "200"));

            var mine = paths.GetProperty("/api/v1/attendance/me").GetProperty("get");
            Assert.True(mine.GetProperty("security").GetArrayLength() > 0);
            AssertPersonalProjectionSchema(PersonalItemSchema(document, mine));
        }

        [Fact]
        public async Task Administrative_attendance_derives_assignment_rows_and_full_filter_summaries()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "attendance_admin_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs);
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); using var client = factory.CreateClient(); await client.GetAsync("/health");
        await using (var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options))
        {
            var employees = await db.Employees.OrderBy(x => x.UserId).Take(4).ToArrayAsync();
            var actor = employees[0].UserId; var date = new DateOnly(2026, 8, 20);
            var session = new CashSession { BusinessDate = date, OpenedAt = DateTimeOffset.UtcNow, OpenedByUserId = actor };
            var completed = new Shift { CashSessionId = session.Id, Type = ShiftType.MORNING, Status = ShiftStatus.COMPLETED };
            var active = new Shift { CashSessionId = session.Id, Type = ShiftType.NIGHT, Status = ShiftStatus.ACTIVE };
            db.CashSessions.Add(session); db.Shifts.AddRange(completed, active);
            db.ShiftAssignments.AddRange(
                new ShiftAssignment { ShiftId = completed.Id, EmployeeId = employees[0].Id, AssignedAt = DateTimeOffset.UtcNow, AssignedByUserId = actor, EffectivePlannedStart = new TimeOnly(8, 0), EffectivePlannedEnd = new TimeOnly(12, 0), EffectiveLateToleranceMinutes = 10 },
                new ShiftAssignment { ShiftId = completed.Id, EmployeeId = employees[1].Id, AssignedAt = DateTimeOffset.UtcNow, AssignedByUserId = actor, EffectivePlannedStart = new TimeOnly(8, 0), EffectivePlannedEnd = new TimeOnly(12, 0), EffectiveLateToleranceMinutes = 10 },
                new ShiftAssignment { ShiftId = active.Id, EmployeeId = employees[2].Id, AssignedAt = DateTimeOffset.UtcNow, AssignedByUserId = actor, EffectivePlannedStart = new TimeOnly(18, 0), EffectivePlannedEnd = new TimeOnly(22, 0), EffectiveLateToleranceMinutes = 10 },
                new ShiftAssignment { ShiftId = completed.Id, EmployeeId = employees[3].Id, AssignedAt = DateTimeOffset.UtcNow, AssignedByUserId = actor, EffectivePlannedStart = new TimeOnly(8, 0), EffectivePlannedEnd = new TimeOnly(12, 0), EffectiveLateToleranceMinutes = 10 });
            db.AttendanceRecords.AddRange(
                new AttendanceRecord { EmployeeId = employees[0].Id, BusinessDate = date, CheckInAt = new DateTimeOffset(2026, 8, 20, 12, 0, 0, TimeSpan.Zero), CheckOutAt = new DateTimeOffset(2026, 8, 20, 16, 0, 0, TimeSpan.Zero), CheckInByUserId = actor, CheckOutByUserId = actor },
                new AttendanceRecord { EmployeeId = employees[1].Id, BusinessDate = date, CheckInAt = new DateTimeOffset(2026, 8, 20, 12, 11, 0, TimeSpan.Zero), CheckOutAt = new DateTimeOffset(2026, 8, 20, 16, 11, 0, TimeSpan.Zero), CheckInByUserId = actor, CheckOutByUserId = actor },
                new AttendanceRecord { EmployeeId = employees[2].Id, BusinessDate = date, CheckInAt = new DateTimeOffset(2026, 8, 20, 22, 0, 0, TimeSpan.Zero), CheckInByUserId = actor });
            await db.SaveChangesAsync();
        }
        var admin = Token(await (await Login(client, "admin.test")).Content.ReadFromJsonAsync<JsonElement>());
        var page = await Send(client, HttpMethod.Get, "/api/v1/attendance/admin?from=2026-08-20&to=2026-08-20&page=1&pageSize=2", admin);
        Assert.True(page.StatusCode == HttpStatusCode.OK, await page.Content.ReadAsStringAsync()); var body = await page.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("summary").GetProperty("totalRecords").GetInt32() == 4 && body.GetProperty("summary").GetProperty("closedCount").GetInt32() == 2 && body.GetProperty("summary").GetProperty("openCount").GetInt32() == 1 && body.GetProperty("summary").GetProperty("lateCount").GetInt32() == 1 && body.GetProperty("summary").GetProperty("absenceCount").GetInt32() == 1 && body.GetProperty("summary").GetProperty("totalWorkedMinutes").GetInt32() == 480, body.GetRawText());
        Assert.Equal(2, body.GetProperty("items").GetArrayLength()); Assert.Equal(4, body.GetProperty("employeeSummaries").GetArrayLength());
        var absent = await Send(client, HttpMethod.Get, "/api/v1/attendance/admin?from=2026-08-20&to=2026-08-20&outcome=ABSENT&page=1&pageSize=20", admin);
        Assert.Equal(HttpStatusCode.OK, absent.StatusCode); var absentBody = await absent.Content.ReadFromJsonAsync<JsonElement>(); Assert.Single(absentBody.GetProperty("items").EnumerateArray()); Assert.Equal(1, absentBody.GetProperty("summary").GetProperty("absenceCount").GetInt32());
        var lateOnly = await Send(client, HttpMethod.Get, "/api/v1/attendance/admin?from=2026-08-20&to=2026-08-20&late=true&page=1&pageSize=20", admin); var lateBody = await lateOnly.Content.ReadFromJsonAsync<JsonElement>(); Assert.Equal(HttpStatusCode.OK, lateOnly.StatusCode); Assert.Equal(1, lateBody.GetProperty("totalCount").GetInt32()); Assert.Equal(1, lateBody.GetProperty("employeeSummaries")[0].GetProperty("lateCount").GetInt32());
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/attendance/admin?page=1&pageSize=1")).StatusCode);
        var waiter = Token(await (await Login(client, "mesero.test")).Content.ReadFromJsonAsync<JsonElement>()); Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Get, "/api/v1/attendance/admin?page=1&pageSize=1", waiter)).StatusCode);
        await using (var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options))
        {
            var waiterUser = await db.Users.SingleAsync(x => x.UserName == "mesero.test"); var managerRole = await db.Roles.SingleAsync(x => x.Name == RoleNames.Manager);
            db.UserRoles.Add(new IdentityUserRole<string> { UserId = waiterUser.Id, RoleId = managerRole.Id }); await db.SaveChangesAsync();
        }
        var multiRole = Token(await (await Login(client, "mesero.test")).Content.ReadFromJsonAsync<JsonElement>()); Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/attendance/admin?page=1&pageSize=1", multiRole)).StatusCode);
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
        var clock = new TestClock(); var service = new AttendanceService(db, clock, new AttendanceDerivationService(clock), new ThrowingNotifier(), NullLogger<AttendanceService>.Instance);
        var result = await service.CheckInAsync(employee.Id, employee.UserId);
        Assert.Null(result.Error); Assert.True(await db.AttendanceRecords.AnyAsync(x => x.Id == result.Value!.Id));
    }

        private static void AssertPersonalProjectionShape(JsonElement item)
        {
            foreach (var propertyName in new[] { "id", "employeeId", "businessDate", "checkInAt", "checkOutAt", "shiftType", "plannedStart", "plannedEnd", "lifecycle", "workedMinutes", "isLate", "lateMinutes" })
                Assert.True(item.TryGetProperty(propertyName, out _), $"Personal attendance projection is missing '{propertyName}'.");
        }

        private static void AssertNoCallerSelectedEmployeeId(JsonElement operation)
        {
            if (operation.TryGetProperty("parameters", out var parameters))
                Assert.True(!parameters.EnumerateArray().Any(parameter => parameter.GetProperty("name").GetString() == "employeeId"), "Self-service operations must not expose an employeeId parameter.");
            Assert.False(operation.TryGetProperty("requestBody", out _), "Self-service operations must not expose a caller-selected employeeId request body.");
        }

        private static JsonElement ResponseSchema(JsonElement document, JsonElement operation, string statusCode)
        {
            var response = operation.GetProperty("responses").GetProperty(statusCode);
            var content = response.GetProperty("content");
            var media = content.TryGetProperty("application/json", out var applicationJson) ? applicationJson : content.EnumerateObject().First().Value;
            return ResolveSchema(document, media.GetProperty("schema"));
        }

        private static JsonElement PersonalItemSchema(JsonElement document, JsonElement operation)
        {
            var pageSchema = ResponseSchema(document, operation, "200");
            var itemsSchema = ResolveSchema(document, pageSchema.GetProperty("properties").GetProperty("items"));
            return ResolveSchema(document, itemsSchema.GetProperty("items"));
        }

        private static JsonElement ResolveSchema(JsonElement document, JsonElement schema)
        {
            if (!schema.TryGetProperty("$ref", out var reference)) return schema;
            var name = reference.GetString()!.Split('/').Last();
            return document.GetProperty("components").GetProperty("schemas").GetProperty(name);
        }

        private static void AssertPersonalProjectionSchema(JsonElement schema)
        {
            var properties = schema.GetProperty("properties");
            foreach (var propertyName in new[] { "shiftType", "plannedStart", "plannedEnd", "lifecycle", "workedMinutes", "isLate", "lateMinutes" })
                Assert.True(properties.TryGetProperty(propertyName, out _), $"Personal attendance schema is missing '{propertyName}'.");
            AssertNullableSchema(properties.GetProperty("plannedStart"));
            AssertNullableSchema(properties.GetProperty("plannedEnd"));
        }

        private static void AssertNullableSchema(JsonElement schema)
        {
            if (schema.TryGetProperty("nullable", out var nullable) && nullable.ValueKind == JsonValueKind.True) return;
            if (schema.TryGetProperty("type", out var type) && type.ValueKind == JsonValueKind.Array && type.EnumerateArray().Any(x => x.GetString() == "null")) return;
            foreach (var keyword in new[] { "anyOf", "oneOf" })
                if (schema.TryGetProperty(keyword, out var alternatives) && alternatives.EnumerateArray().Any(IsNullSchema)) return;
            Assert.Fail("Expected the planned attendance timestamp schema to be nullable.");
        }

        private static bool IsNullSchema(JsonElement schema) =>
            schema.TryGetProperty("type", out var type) && (type.ValueKind == JsonValueKind.String && type.GetString() == "null" || type.ValueKind == JsonValueKind.Array && type.EnumerateArray().Any(x => x.GetString() == "null"));

        private static DateOnly CurrentBusinessDate() => DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTimeOffset.UtcNow, "America/La_Paz").DateTime);
        private static DateTimeOffset UtcAt(DateOnly date, TimeOnly time) => new(date.ToDateTime(time), TimeSpan.Zero);
        private static DateTimeOffset BusinessUtcAt(DateOnly date, TimeOnly time)
        {
            var zone = TimeZoneInfo.FindSystemTimeZoneById("America/La_Paz");
            var local = DateTime.SpecifyKind(date.ToDateTime(time), DateTimeKind.Unspecified);
            return new DateTimeOffset(TimeZoneInfo.ConvertTimeToUtc(local, zone), TimeSpan.Zero);
        }

        private sealed class TestClock : IBusinessClock { public DateTimeOffset UtcNow => DateTimeOffset.UtcNow; public DateOnly BusinessDate => DateOnly.FromDateTime(UtcNow.UtcDateTime); public string TimeZoneId => "America/Argentina/Buenos_Aires"; }
    private sealed class ThrowingNotifier : IAttendanceNotifier { public Task AttendanceUpdatedAsync(AttendanceRecordDto record, CancellationToken cancellationToken = default) => Task.FromException(new InvalidOperationException("test notifier failure")); }
    private static string Token(JsonElement payload) => payload.GetProperty("accessToken").GetString()!;
    private static Task<HttpResponseMessage> Login(HttpClient client, string username) => client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" });
    private static Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token = null) { var request = new HttpRequestMessage(method, path); if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); return client.SendAsync(request); }
}
