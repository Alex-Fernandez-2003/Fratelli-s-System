using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Npgsql;
using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Infrastructure;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class OperationsAuthorizationMatrixPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Every_sprint2_endpoint_enforces_anonymous_and_role_matrix_with_union_safe_policies()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "operations_auth_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs);
        await using var factory = new AuthWebApplicationFactory(cs, "Development");
        using var client = factory.CreateClient();
        var tokens = new Dictionary<string, string>();
        foreach (var role in new[] { "admin", "encargado", "mesero", "cocina", "contadora", "empleado" }) tokens[role] = await Token(client, role + ".test");

        var routes = new[]
        {
            new Route(HttpMethod.Post, "/api/v1/products", new { }, "admin", "encargado"),
            new Route(HttpMethod.Put, "/api/v1/products/00000000-0000-0000-0000-000000000001", new { }, "admin", "encargado"),
            new Route(HttpMethod.Delete, "/api/v1/products/00000000-0000-0000-0000-000000000001", null, "admin", "encargado"),
            new Route(HttpMethod.Get, "/api/v1/products/00000000-0000-0000-0000-000000000001/composition", null, "admin", "encargado", "mesero", "cocina"),
            new Route(HttpMethod.Put, "/api/v1/products/00000000-0000-0000-0000-000000000001/composition", Array.Empty<object>(), "admin", "encargado"),
            new Route(HttpMethod.Put, "/api/v1/products/00000000-0000-0000-0000-000000000001/minimum-stock", new { minStock = 1m }, "admin", "encargado"),
            new Route(HttpMethod.Get, "/api/v1/inventory/movements?page=1&pageSize=1", null, "admin", "encargado", "mesero", "cocina", "contadora"),
            new Route(HttpMethod.Post, "/api/v1/inventory/movements", new { productId = Guid.Empty, type = "ENTRY", quantity = 1m, reason = "test" }, "admin", "encargado"),
            new Route(HttpMethod.Get, "/api/v1/products/00000000-0000-0000-0000-000000000001/production-requirements?quantity=1", null, "admin", "encargado", "cocina"),
            new Route(HttpMethod.Post, "/api/v1/productions", new { productId = Guid.Empty, quantityProduced = 1m }, "admin", "encargado", "cocina"),
            new Route(HttpMethod.Get, "/api/v1/productions?page=1&pageSize=1", null, "admin", "encargado", "cocina", "contadora"),
            new Route(HttpMethod.Get, "/api/v1/productions/00000000-0000-0000-0000-000000000001", null, "admin", "encargado", "cocina", "contadora"),
            new Route(HttpMethod.Get, "/api/v1/customers?page=1&pageSize=1", null, "admin", "encargado", "mesero"),
            new Route(HttpMethod.Get, "/api/v1/customers/00000000-0000-0000-0000-000000000001", null, "admin", "encargado", "mesero"),
            new Route(HttpMethod.Post, "/api/v1/customers", new { name = "Customer", ci = "CI" }, "admin", "encargado", "mesero"),
            new Route(HttpMethod.Put, "/api/v1/customers/00000000-0000-0000-0000-000000000001", new { name = "Customer", ci = "CI" }, "admin", "encargado", "mesero"),
            new Route(HttpMethod.Post, "/api/v1/customers/00000000-0000-0000-0000-000000000001/deactivate", null, "admin", "encargado"),
            new Route(HttpMethod.Post, "/api/v1/sales", new { orderId = Guid.Empty, salesChannel = "DIRECT", paymentMethod = "CASH" }, "admin", "encargado", "mesero"),
            new Route(HttpMethod.Get, "/api/v1/sales?page=1&pageSize=1", null, "admin", "encargado", "mesero", "contadora"),
            new Route(HttpMethod.Get, "/api/v1/sales/00000000-0000-0000-0000-000000000001", null, "admin", "encargado", "mesero", "contadora"),
            new Route(HttpMethod.Post, "/api/v1/purchases", new { }, "admin", "encargado", "cocina"),
            new Route(HttpMethod.Get, "/api/v1/purchases?page=1&pageSize=1", null, "admin", "encargado", "cocina", "contadora"),
            new Route(HttpMethod.Get, "/api/v1/purchases/00000000-0000-0000-0000-000000000001", null, "admin", "encargado", "cocina", "contadora"),
            new Route(HttpMethod.Post, "/api/v1/purchases/00000000-0000-0000-0000-000000000001/cancel", new { reason = "x" }, "admin", "encargado", "cocina"),
            new Route(HttpMethod.Post, "/api/v1/purchases/00000000-0000-0000-0000-000000000001/receive", new { lines = Array.Empty<object>() }, "admin", "encargado", "cocina"),
            new Route(HttpMethod.Get, "/api/v1/work-schedules", null, "admin", "encargado"),
            new Route(HttpMethod.Put, "/api/v1/work-schedules/MORNING", new { plannedStart = "08:00:00", plannedEnd = "12:00:00", lateToleranceMinutes = 10 }, "admin", "encargado"),
            new Route(HttpMethod.Get, "/api/v1/attendance/admin?page=1&pageSize=1", null, "admin", "encargado", "contadora"),
            new Route(HttpMethod.Post, "/api/v1/shifts/open", null, "admin", "encargado"),
            new Route(HttpMethod.Get, "/api/v1/shifts/current", null, "admin", "encargado"),
            new Route(HttpMethod.Get, "/api/v1/shifts/me/current", null, "admin", "encargado", "mesero"),
            new Route(HttpMethod.Put, "/api/v1/shifts/00000000-0000-0000-0000-000000000001/assignments", new { employeeIds = Array.Empty<Guid>() }, "admin", "encargado"),
            new Route(HttpMethod.Post, "/api/v1/shifts/00000000-0000-0000-0000-000000000001/handover", new { }, "admin", "encargado")
        };

        foreach (var route in routes)
        {
            Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, route.Method, route.Path, null, route.Body)).StatusCode);
            foreach (var (role, token) in tokens)
            {
                var response = await Send(client, route.Method, route.Path, token, route.Body);
                if (route.Allowed.Contains(role)) Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
                else Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        }
    }

        [Fact]
        public async Task Work_schedule_configuration_is_authorized_validated_and_persisted()
        {
            var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "work_schedule_api_" + Guid.NewGuid().ToString("N") }.ConnectionString;
            await postgres.MigrateAsync(cs);
            await using var factory = new AuthWebApplicationFactory(cs, "Development");
            using var client = factory.CreateClient();
            var admin = await Token(client, "admin.test"); var manager = await Token(client, "encargado.test"); var employee = await Token(client, "empleado.test");

            Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, HttpMethod.Get, "/api/v1/work-schedules", null, null)).StatusCode);
            Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Get, "/api/v1/work-schedules", employee, null)).StatusCode);
            var initial = await Send(client, HttpMethod.Get, "/api/v1/work-schedules", manager, null);
            Assert.Equal(HttpStatusCode.OK, initial.StatusCode);
            var rows = await initial.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(2, rows.GetArrayLength());
            Assert.Contains(rows.EnumerateArray(), row => row.GetProperty("shiftType").GetString() == "MORNING" && row.GetProperty("plannedStart").GetString() == "08:00:00" && row.GetProperty("plannedEnd").GetString() == "12:00:00" && row.GetProperty("lateToleranceMinutes").GetInt32() == 10);
            Assert.Contains(rows.EnumerateArray(), row => row.GetProperty("shiftType").GetString() == "NIGHT" && row.GetProperty("plannedStart").GetString() == "18:00:00" && row.GetProperty("plannedEnd").GetString() == "22:00:00" && row.GetProperty("lateToleranceMinutes").GetInt32() == 10);

            Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Put, "/api/v1/work-schedules/MORNING", employee, new { plannedStart = "09:00:00", plannedEnd = "13:00:00", lateToleranceMinutes = 5 })).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Put, "/api/v1/work-schedules/999", admin, new { plannedStart = "09:00:00", plannedEnd = "13:00:00", lateToleranceMinutes = 5 })).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Put, "/api/v1/work-schedules/MORNING", admin, new { plannedStart = "09:00:00", plannedEnd = "09:00:00", lateToleranceMinutes = 5 })).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Put, "/api/v1/work-schedules/MORNING", admin, new { plannedStart = "09:00:00", plannedEnd = "13:00:00", lateToleranceMinutes = -1 })).StatusCode);
            var updated = await Send(client, HttpMethod.Put, "/api/v1/work-schedules/MORNING", admin, new { plannedStart = "09:00:00", plannedEnd = "13:00:00", lateToleranceMinutes = 5 });
            Assert.Equal(HttpStatusCode.OK, updated.StatusCode);
            Assert.Equal("09:00:00", (await updated.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("plannedStart").GetString());
        }

        [Fact]
        public async Task Opening_cash_session_requires_nonnegative_actual_amounts_only_when_creating_and_preserves_operational_day_lifecycle()
        {
            var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "cash_opening_" + Guid.NewGuid().ToString("N") }.ConnectionString;
            await postgres.MigrateAsync(cs);
            await using var factory = new AuthWebApplicationFactory(cs, "Development");
            using var client = factory.CreateClient();
            var admin = await Token(client, "admin.test");
            var manager = await Token(client, "encargado.test");
            var before = DateTimeOffset.UtcNow;

            Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Post, "/api/v1/shifts/open", admin, new { })).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Post, "/api/v1/shifts/open", admin, new { openingAmount = -1m, pettyCashOpeningAmount = 0m })).StatusCode);
            var opened = await Send(client, HttpMethod.Post, "/api/v1/shifts/open", admin, new { openingAmount = 25.50m, pettyCashOpeningAmount = 4.25m });
            Assert.Equal(HttpStatusCode.OK, opened.StatusCode);

            await using (var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options))
            {
                var session = await db.CashSessions.SingleAsync();
                Assert.Equal(25.50m, session.OpeningAmount); Assert.Equal(4.25m, session.PettyCashOpeningAmount);
                Assert.InRange(session.OpenedAt, before, DateTimeOffset.UtcNow);
                Assert.Equal(DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeBySystemTimeZoneId(session.OpenedAt, "America/La_Paz").DateTime), session.BusinessDate);
                Assert.Equal(2, await db.Shifts.CountAsync()); Assert.Single(await db.Shifts.Where(x => x.Status == RestaurantSystem.Domain.Operations.ShiftStatus.ACTIVE).ToListAsync());
            }

            Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Post, "/api/v1/shifts/open", manager, null)).StatusCode);
        }

        private sealed record Route(HttpMethod Method, string Path, object? Body, params string[] Allowed);
    private static async Task<string> Token(HttpClient client, string username) => (await (await client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" })).Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
    private static Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token, object? body)
    {
        var request = new HttpRequestMessage(method, path) { Content = body is null ? null : JsonContent.Create(body) };
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client.SendAsync(request);
    }
}
