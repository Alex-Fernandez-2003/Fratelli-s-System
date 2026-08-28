using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Identity;
using Xunit;

namespace RestaurantSystem.IntegrationTests;

[Collection(nameof(PostgresCollection))]
public sealed class UserLifecyclePostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Admin_can_update_fullName_username_and_roles()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_update_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var create = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Original Name", username = "original.user", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode); 
        var created = await create.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString()!;
        
        var updateName = await SendJson(client, HttpMethod.Put, $"/api/v1/users/{id}", token, new { fullName = "Updated Name", username = "original.user", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.OK, updateName.StatusCode);
        var updated = await updateName.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Updated Name", updated.GetProperty("fullName").GetString());
        Assert.Equal("original.user", updated.GetProperty("username").GetString());
        Assert.Equal(1, updated.GetProperty("roles").GetArrayLength());
        Assert.Equal("MESERO", updated.GetProperty("roles")[0].GetString());
        
        var updateUsername = await SendJson(client, HttpMethod.Put, $"/api/v1/users/{id}", token, new { fullName = "Updated Name", username = "updated.user", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.OK, updateUsername.StatusCode);
        updated = await updateUsername.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("updated.user", updated.GetProperty("username").GetString());
        
        var updateRoles = await SendJson(client, HttpMethod.Put, $"/api/v1/users/{id}", token, new { fullName = "Updated Name", username = "updated.user", roles = new[] { "ENCARGADO", "COCINA", "EMPLEADO" } });
        Assert.Equal(HttpStatusCode.OK, updateRoles.StatusCode);
        updated = await updateRoles.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(3, updated.GetProperty("roles").GetArrayLength());
        
        await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options);
        var employee = await db.Employees.SingleAsync(e => e.UserId == id);
        Assert.Equal("Updated Name", employee.FullName);
        
        var user = await db.Users.SingleAsync(u => u.Id == id);
        Assert.NotNull(db.Entry(user).Property<string?>("UpdatedByUserId").CurrentValue);
    }

    [Fact]
    public async Task Update_duplicate_username_returns_conflict()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_update_dup_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var create1 = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "User One", username = "user.one", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create1.StatusCode);
        var created1 = await create1.Content.ReadFromJsonAsync<JsonElement>();
        var id1 = created1.GetProperty("id").GetString()!;
        
        var create2 = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "User Two", username = "user.two", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create2.StatusCode);
        var created2 = await create2.Content.ReadFromJsonAsync<JsonElement>();
        var id2 = created2.GetProperty("id").GetString()!;
        
        var update = await SendJson(client, HttpMethod.Put, $"/api/v1/users/{id2}", token, new { fullName = "User Two", username = "user.one", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Conflict, update.StatusCode);
    }

    [Fact]
    public async Task Update_same_roles_does_not_revoke_sessions()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_same_roles_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var create = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Test User", username = "test.user", roles = new[] { "MESERO", "ENCARGADO" } });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode); 
        var created = await create.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString()!;
        
        var update = await SendJson(client, HttpMethod.Put, $"/api/v1/users/{id}", token, new { fullName = "Test User Updated", username = "test.user", roles = new[] { "ENCARGADO", "MESERO" } });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        
        var updated = await update.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(2, updated.GetProperty("roles").GetArrayLength());
    }

    [Fact]
    public async Task Update_changed_roles_revokes_target_sessions()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_changed_roles_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var create = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Test User", username = "test.user2", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode); 
        var created = await create.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString()!;
        
        var setPwd = await SendJson(client, HttpMethod.Post, $"/api/v1/users/{id}/password", token, new { newPassword = "TestPass123!" });
        Assert.Equal(HttpStatusCode.NoContent, setPwd.StatusCode);
        
        var userLogin = await Login(client, "test.user2", "TestPass123!");
        Assert.Equal(HttpStatusCode.OK, userLogin.StatusCode);
        var userPayload = await userLogin.Content.ReadFromJsonAsync<JsonElement>();
        var userAccessToken = userPayload.GetProperty("accessToken").GetString()!;
        var userRefreshToken = GetCookie(userLogin, "refreshToken");
        Assert.NotNull(userRefreshToken);
        
        var meBefore = await SendAuth(client, HttpMethod.Get, "/api/v1/auth/me", userAccessToken);
        Assert.Equal(HttpStatusCode.OK, meBefore.StatusCode);
        
        var update = await SendJson(client, HttpMethod.Put, $"/api/v1/users/{id}", token, new { fullName = "Test User", username = "test.user2", roles = new[] { "ENCARGADO", "COCINA" } });
        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        
        var meAfter = await SendAuth(client, HttpMethod.Get, "/api/v1/auth/me", userAccessToken);
        Assert.Equal(HttpStatusCode.Unauthorized, meAfter.StatusCode);
        
        var refreshAfter = await SendCookie(client, HttpMethod.Post, "/api/v1/auth/refresh", userRefreshToken);
        Assert.Equal(HttpStatusCode.Unauthorized, refreshAfter.StatusCode);
        
        var adminMe = await SendAuth(client, HttpMethod.Get, "/api/v1/auth/me", token);
        Assert.Equal(HttpStatusCode.OK, adminMe.StatusCode);
    }

    [Fact]
    public async Task First_password_set_works()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_first_pwd_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var create = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "No Pass User", username = "nopass.user", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode); 
        var created = await create.Content.ReadFromJsonAsync<JsonElement>();
        Assert.False(created.GetProperty("hasPassword").GetBoolean());
        var id = created.GetProperty("id").GetString()!;
        
        var setPwd = await SendJson(client, HttpMethod.Post, $"/api/v1/users/{id}/password", token, new { newPassword = "FirstPass123!" });
        Assert.Equal(HttpStatusCode.NoContent, setPwd.StatusCode);
        
        var get = await SendAuth(client, HttpMethod.Get, $"/api/v1/users/{id}", token);
        Assert.Equal(HttpStatusCode.OK, get.StatusCode);
        var user = await get.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(user.GetProperty("hasPassword").GetBoolean());
        
        var login = await Login(client, "nopass.user", "FirstPass123!");
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var loginPayload = await login.Content.ReadFromJsonAsync<JsonElement>();
        Assert.NotNull(loginPayload.GetProperty("accessToken").GetString());
    }

    [Fact]
    public async Task Reset_existing_password_works()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_reset_pwd_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var create = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Has Pass User", username = "haspass.user", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode); 
        var created = await create.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString()!;
        
        var setPwd = await SendJson(client, HttpMethod.Post, $"/api/v1/users/{id}/password", token, new { newPassword = "OldPass123!" });
        Assert.Equal(HttpStatusCode.NoContent, setPwd.StatusCode);
        
        var loginOld = await Login(client, "haspass.user", "OldPass123!");
        Assert.Equal(HttpStatusCode.OK, loginOld.StatusCode);
        var loginOldPayload = await loginOld.Content.ReadFromJsonAsync<JsonElement>();
        var oldAccessToken = loginOldPayload.GetProperty("accessToken").GetString()!;
        var oldRefreshToken = GetCookie(loginOld, "refreshToken");
        
        var resetPwd = await SendJson(client, HttpMethod.Post, $"/api/v1/users/{id}/password", token, new { newPassword = "NewPass123!" });
        Assert.Equal(HttpStatusCode.NoContent, resetPwd.StatusCode);
        
        var loginFail = await Login(client, "haspass.user", "OldPass123!");
        Assert.Equal(HttpStatusCode.Unauthorized, loginFail.StatusCode);
        
        var loginNew = await Login(client, "haspass.user", "NewPass123!");
        Assert.Equal(HttpStatusCode.OK, loginNew.StatusCode);
        
        var meOld = await SendAuth(client, HttpMethod.Get, "/api/v1/auth/me", oldAccessToken);
        Assert.Equal(HttpStatusCode.Unauthorized, meOld.StatusCode);
        
        var refreshOld = await SendCookie(client, HttpMethod.Post, "/api/v1/auth/refresh", oldRefreshToken);
        Assert.Equal(HttpStatusCode.Unauthorized, refreshOld.StatusCode);
        
        var adminMe = await SendAuth(client, HttpMethod.Get, "/api/v1/auth/me", token);
        Assert.Equal(HttpStatusCode.OK, adminMe.StatusCode);
    }

    [Fact]
    public async Task Deactivate_user_revokes_sessions_and_blocks_access()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_deact_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var create = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "To Deactivate", username = "deact.user", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode); 
        var created = await create.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString()!;
        
        var setPwd = await SendJson(client, HttpMethod.Post, $"/api/v1/users/{id}/password", token, new { newPassword = "Pass123!" });
        Assert.Equal(HttpStatusCode.NoContent, setPwd.StatusCode);
        
        var userLogin = await Login(client, "deact.user", "Pass123!");
        Assert.Equal(HttpStatusCode.OK, userLogin.StatusCode);
        var userPayload = await userLogin.Content.ReadFromJsonAsync<JsonElement>();
        var userAccessToken = userPayload.GetProperty("accessToken").GetString()!;
        var userRefreshToken = GetCookie(userLogin, "refreshToken");
        
        var deact = await SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{id}/deactivate", token);
        Assert.Equal(HttpStatusCode.NoContent, deact.StatusCode);
        
        var me = await SendAuth(client, HttpMethod.Get, "/api/v1/auth/me", userAccessToken);
        Assert.Equal(HttpStatusCode.Unauthorized, me.StatusCode);
        
        var refresh = await SendCookie(client, HttpMethod.Post, "/api/v1/auth/refresh", userRefreshToken);
        Assert.Equal(HttpStatusCode.Unauthorized, refresh.StatusCode);
        
        var loginFail = await Login(client, "deact.user", "Pass123!");
        Assert.Equal(HttpStatusCode.Unauthorized, loginFail.StatusCode);
        
        await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options);
        var employee = await db.Employees.SingleAsync(e => e.UserId == id);
        Assert.True(employee.IsActive);
        
        var adminMe = await SendAuth(client, HttpMethod.Get, "/api/v1/auth/me", token);
        Assert.Equal(HttpStatusCode.OK, adminMe.StatusCode);
    }

    [Fact]
    public async Task Activate_user_restores_access_without_password()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_act_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var create = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "To Activate", username = "act.user", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode); 
        var created = await create.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString()!;
        
        var setPwd = await SendJson(client, HttpMethod.Post, $"/api/v1/users/{id}/password", token, new { newPassword = "Pass123!" });
        Assert.Equal(HttpStatusCode.NoContent, setPwd.StatusCode);
        
        var deact = await SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{id}/deactivate", token);
        Assert.Equal(HttpStatusCode.NoContent, deact.StatusCode);
        
        var act = await SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{id}/activate", token);
        Assert.Equal(HttpStatusCode.NoContent, act.StatusCode);
        
        var login = await Login(client, "act.user", "Pass123!");
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        
        var get = await SendAuth(client, HttpMethod.Get, $"/api/v1/users/{id}", token);
        var user = await get.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(user.GetProperty("hasPassword").GetBoolean());
        
        await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options);
        var employee = await db.Employees.SingleAsync(e => e.UserId == id);
        Assert.True(employee.IsActive);
    }

    [Fact]
    public async Task Self_deactivation_rejected()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_self_deact_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var adminId = adminPayload.GetProperty("user").GetProperty("id").GetString()!;
        var deact = await SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{adminId}/deactivate", token);
        Assert.Equal(HttpStatusCode.Conflict, deact.StatusCode);
    }

    [Fact]
    public async Task Self_admin_removal_rejected()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_self_admin_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var adminId = adminPayload.GetProperty("user").GetProperty("id").GetString()!;
        var update = await SendJson(client, HttpMethod.Put, $"/api/v1/users/{adminId}", token, new { fullName = "Admin", username = "admin.test", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Conflict, update.StatusCode);
    }

    [Fact]
    public async Task Last_admin_deactivation_rejected()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_last_admin_deact_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var adminId = adminPayload.GetProperty("user").GetProperty("id").GetString()!;
        var deact = await SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{adminId}/deactivate", token);
        Assert.Equal(HttpStatusCode.Conflict, deact.StatusCode);
    }

    [Fact]
    public async Task Last_admin_role_removal_rejected()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_last_admin_role_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var adminId = adminPayload.GetProperty("user").GetProperty("id").GetString()!;
        var update = await SendJson(client, HttpMethod.Put, $"/api/v1/users/{adminId}", token, new { fullName = "Admin", username = "admin.test", roles = new[] { "EMPLEADO" } });
        Assert.Equal(HttpStatusCode.Conflict, update.StatusCode);
    }

    [Fact]
    public async Task Multiple_admins_can_deactivate_one()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_multi_admin_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var createAdmin2 = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Admin Two", username = "admin2.test", roles = new[] { "ADMINISTRADOR", "EMPLEADO" } });
        Assert.Equal(HttpStatusCode.Created, createAdmin2.StatusCode); 
        var createdAdmin2 = await createAdmin2.Content.ReadFromJsonAsync<JsonElement>();
        var admin2Id = createdAdmin2.GetProperty("id").GetString()!;
        
        await SendJson(client, HttpMethod.Post, $"/api/v1/users/{admin2Id}/password", token, new { newPassword = "Admin2Pass123!" });
        
        var deact = await SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{admin2Id}/deactivate", token);
        Assert.Equal(HttpStatusCode.NoContent, deact.StatusCode);
        
        var get = await SendAuth(client, HttpMethod.Get, $"/api/v1/users/{admin2Id}", token);
        var user = await get.Content.ReadFromJsonAsync<JsonElement>();
        Assert.False(user.GetProperty("isActive").GetBoolean());
    }

    [Fact]
    public async Task Concurrent_deactivation_of_last_two_admins_only_one_succeeds()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_concurrent_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var createAdmin2 = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Admin Two", username = "admin2.test", roles = new[] { "ADMINISTRADOR", "EMPLEADO" } });
        Assert.Equal(HttpStatusCode.Created, createAdmin2.StatusCode); 
        var createdAdmin2 = await createAdmin2.Content.ReadFromJsonAsync<JsonElement>();
        var admin2Id = createdAdmin2.GetProperty("id").GetString()!;
        await SendJson(client, HttpMethod.Post, $"/api/v1/users/{admin2Id}/password", token, new { newPassword = "Admin2Pass123!" });
        
        var adminId = adminPayload.GetProperty("user").GetProperty("id").GetString()!;
        
        var task1 = SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{adminId}/deactivate", token);
        var task2 = SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{admin2Id}/deactivate", token);
        
        var results = await Task.WhenAll(task1, task2);
        var statusCodes = results.Select(r => r.StatusCode).ToArray();
        
        Assert.Contains(HttpStatusCode.NoContent, statusCodes);
        Assert.Contains(HttpStatusCode.Conflict, statusCodes);
        
        await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(cs).Options);
        var activeAdmins = await db.UserRoles
            .Join(db.Users.Where(u => EF.Property<bool>(u, "IsActive")), ur => ur.UserId, u => u.Id, (ur, u) => ur.RoleId)
            .Join(db.Roles.Where(r => r.NormalizedName == "ADMINISTRADOR"), urRoleId => urRoleId, r => r.Id, (_, r) => r.Id)
            .CountAsync();
        Assert.True(activeAdmins >= 1);
    }

    [Fact]
    public async Task Non_admin_cannot_access_user_management()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_non_admin_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var adminToken = adminPayload.GetProperty("accessToken").GetString()!;
        
        var empUsername = "test.empleado." + Guid.NewGuid().ToString("N")[..8];
        var createEmp = await SendJson(client, HttpMethod.Post, "/api/v1/users", adminToken, new { fullName = "Employee", username = empUsername, roles = new[] { "EMPLEADO" } });
        Assert.Equal(HttpStatusCode.Created, createEmp.StatusCode);
        var createEmpPayload = await createEmp.Content.ReadFromJsonAsync<JsonElement>();
        var empId = createEmpPayload.GetProperty("id").GetString()!;
        await SendJson(client, HttpMethod.Post, $"/api/v1/users/{empId}/password", adminToken, new { newPassword = "Sprint1.Test!123" });
        
        var empLogin = await Login(client, empUsername);
        Assert.Equal(HttpStatusCode.OK, empLogin.StatusCode);
        var empPayload = await empLogin.Content.ReadFromJsonAsync<JsonElement>();
        var empToken = empPayload.GetProperty("accessToken").GetString()!;
        
        Assert.Equal(HttpStatusCode.Forbidden, (await SendAuth(client, HttpMethod.Get, "/api/v1/users", empToken)).StatusCode);
        
        var create = await SendJson(client, HttpMethod.Post, "/api/v1/users", empToken, new { fullName = "Test", username = "test", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Forbidden, create.StatusCode);
    }

    [Fact]
    public async Task Anonymous_cannot_access_user_management()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_anon_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/users")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/users/some-id")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.PostAsJsonAsync("/api/v1/users", new { })).StatusCode);
    }

    [Fact]
    public async Task Update_nonexistent_user_returns_404()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_404_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var update = await SendJson(client, HttpMethod.Put, "/api/v1/users/nonexistent-id", token, new { fullName = "Test", username = "test", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.NotFound, update.StatusCode);
        
        var setPwd = await SendJson(client, HttpMethod.Post, "/api/v1/users/nonexistent-id/password", token, new { newPassword = "Pass123!" });
        Assert.Equal(HttpStatusCode.NotFound, setPwd.StatusCode);
        
        var act = await SendNoBody(client, HttpMethod.Post, "/api/v1/users/nonexistent-id/activate", token);
        Assert.Equal(HttpStatusCode.NotFound, act.StatusCode);
        
        var deact = await SendNoBody(client, HttpMethod.Post, "/api/v1/users/nonexistent-id/deactivate", token);
        Assert.Equal(HttpStatusCode.NotFound, deact.StatusCode);
    }

    [Fact]
    public async Task Invalid_roles_rejected()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_invalid_roles_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var create1 = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Test", username = "test1", roles = Array.Empty<string>() });
        Assert.Equal(HttpStatusCode.BadRequest, create1.StatusCode);
        
        var create2 = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Test", username = "test2", roles = new[] { "INVALID_ROLE" } });
        Assert.Equal(HttpStatusCode.BadRequest, create2.StatusCode);
        
        var create3 = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Test", username = "test3", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create3.StatusCode);
        var id = (await create3.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetString()!;
        var update = await SendJson(client, HttpMethod.Put, $"/api/v1/users/{id}", token, new { fullName = "Test", username = "test3", roles = Array.Empty<string>() });
        Assert.Equal(HttpStatusCode.BadRequest, update.StatusCode);
        
        var update2 = await SendJson(client, HttpMethod.Put, $"/api/v1/users/{id}", token, new { fullName = "Test", username = "test3", roles = new[] { "INVALID_ROLE" } });
        Assert.Equal(HttpStatusCode.BadRequest, update2.StatusCode);
        
        var pwd = await SendJson(client, HttpMethod.Post, "/api/v1/users/nonexistent/password", token, new { newPassword = "Pass123!" });
        Assert.Equal(HttpStatusCode.NotFound, pwd.StatusCode);
    }

    [Fact]
    public async Task Activate_idempotent()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_act_idem_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var create = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Test", username = "test.idem", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode); 
        var id = (await create.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetString()!;
        
        var act1 = await SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{id}/activate", token);
        Assert.Equal(HttpStatusCode.NoContent, act1.StatusCode);
        
        var act2 = await SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{id}/activate", token);
        Assert.Equal(HttpStatusCode.NoContent, act2.StatusCode);
    }

    [Fact]
    public async Task Deactivate_idempotent()
    {
        var cs = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "users_deact_idem_" + Guid.NewGuid().ToString("N") }.ConnectionString;
        await postgres.MigrateAsync(cs); 
        await using var factory = new AuthWebApplicationFactory(cs, "Development"); 
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var admin = await Login(client, "admin.test"); 
        var adminPayload = await admin.Content.ReadFromJsonAsync<JsonElement>();
        var token = adminPayload.GetProperty("accessToken").GetString()!;
        
        var create = await SendJson(client, HttpMethod.Post, "/api/v1/users", token, new { fullName = "Test", username = "test.idem2", roles = new[] { "MESERO" } });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode); 
        var id = (await create.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetString()!;
        
        var deact1 = await SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{id}/deactivate", token);
        Assert.Equal(HttpStatusCode.NoContent, deact1.StatusCode);
        
        var deact2 = await SendNoBody(client, HttpMethod.Post, $"/api/v1/users/{id}/deactivate", token);
        Assert.Equal(HttpStatusCode.NoContent, deact2.StatusCode);
    }

    private static Task<HttpResponseMessage> Login(HttpClient c, string username, string password = "Sprint1.Test!123") 
        => c.PostAsJsonAsync("/api/v1/auth/login", new { username, password });
    
    private static Task<HttpResponseMessage> SendJson(HttpClient c, HttpMethod method, string path, string token, object? body = null) 
    { 
        var r = new HttpRequestMessage(method, path); 
        r.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); 
        if (body is not null) r.Content = JsonContent.Create(body); 
        return c.SendAsync(r); 
    }

    private static Task<HttpResponseMessage> SendAuth(HttpClient c, HttpMethod method, string path, string token) 
    { 
        var r = new HttpRequestMessage(method, path); 
        r.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); 
        return c.SendAsync(r); 
    }
    
    private static Task<HttpResponseMessage> SendNoBody(HttpClient c, HttpMethod method, string path, string token) 
    { 
        var r = new HttpRequestMessage(method, path); 
        r.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); 
        return c.SendAsync(r); 
    }
    
    private static Task<HttpResponseMessage> SendCookie(HttpClient c, HttpMethod method, string path, string? cookie) 
    { 
        var r = new HttpRequestMessage(method, path); 
        if (cookie is not null) r.Headers.Add("Cookie", cookie); 
        return c.SendAsync(r); 
    }
    
    private static string? GetCookie(HttpResponseMessage response, string name)
    {
        if (response.Headers.TryGetValues("Set-Cookie", out var cookies))
        {
            foreach (var cookie in cookies)
            {
                var parts = cookie.Split(';');
                var kv = parts[0].Split('=', 2);
                if (kv.Length == 2 && kv[0].Trim() == name)
                    return kv[1].Trim();
            }
        }
        return null;
    }
}