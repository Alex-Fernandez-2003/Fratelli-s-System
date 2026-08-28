using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Npgsql;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Domain.Catalog;
using Testcontainers.PostgreSql;

namespace RestaurantSystem.IntegrationTests;

[CollectionDefinition(nameof(PostgresCollection), DisableParallelization = true)]
public sealed class PostgresCollection : ICollectionFixture<PostgresFixture> { }

public sealed class PostgresFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer container = new PostgreSqlBuilder().WithImage("postgres:16-alpine").Build();
    public string ConnectionString => container.GetConnectionString();
    public Task InitializeAsync() => container.StartAsync();
    public Task DisposeAsync() => container.DisposeAsync().AsTask();
    public async Task MigrateAsync(string connectionString)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options;
        await using var db = new ApplicationDbContext(options); await db.Database.MigrateAsync();
    }
    public async Task MigrateToAsync(string connectionString, string migration)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options;
        await using var db = new ApplicationDbContext(options);
        await db.Database.GetService<IMigrator>().MigrateAsync(migration);
    }
}

public sealed class AuthWebApplicationFactory : WebApplicationFactory<Program>
{
    public AuthWebApplicationFactory(string connectionString, string environment)
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", environment);
        Environment.SetEnvironmentVariable("ConnectionStrings__RestaurantSystem", connectionString);
        Environment.SetEnvironmentVariable("Jwt__Issuer", "integration-tests"); Environment.SetEnvironmentVariable("Jwt__Audience", "integration-tests");
        Environment.SetEnvironmentVariable("Jwt__Key", "integration-test-signing-key-with-at-least-thirty-two-characters");
    }
    protected override void ConfigureWebHost(IWebHostBuilder builder) => builder.UseEnvironment(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")!);
}

[Collection(nameof(PostgresCollection))]
public sealed class AuthPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Development_authentication_sessions_and_authorization_use_real_postgresql()
    {
        await postgres.MigrateAsync(postgres.ConnectionString);
        await using var factory = new AuthWebApplicationFactory(postgres.ConnectionString, "Development");
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });

        var invalid = await Login(client, "admin.test", "wrong-password");
        Assert.Equal(HttpStatusCode.Unauthorized, invalid.StatusCode);
        var email = await client.PostAsJsonAsync("/api/v1/auth/login", new { email = "admin.test", password = "Sprint1.Test!123" });
        Assert.Equal(HttpStatusCode.BadRequest, email.StatusCode);
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(postgres.ConnectionString).Options;
        await using (var db = new ApplicationDbContext(options))
        {
            var inactive = await db.Users.SingleAsync(x => x.UserName == "admin.test"); db.Entry(inactive).Property<bool>("IsActive").CurrentValue = false; await db.SaveChangesAsync();
            Assert.Equal(HttpStatusCode.Unauthorized, (await Login(client, "admin.test", "Sprint1.Test!123")).StatusCode);
            db.Entry(inactive).Property<bool>("IsActive").CurrentValue = true; await db.SaveChangesAsync();
        }

        var first = await Login(client, "admin.test", "Sprint1.Test!123");
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        AssertCookie(first, secure: false);
        var firstPayload = await first.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("admin.test", firstPayload.GetProperty("user").GetProperty("username").GetString());
        Assert.False(firstPayload.GetProperty("user").GetProperty("employeeId").GetGuid() == Guid.Empty);
        var firstToken = firstPayload.GetProperty("accessToken").GetString()!;
        var firstCookie = Cookie(first);

        var anonymousMe = await client.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, anonymousMe.StatusCode);
        var me = await Send(client, HttpMethod.Get, "/api/v1/auth/me", bearer: firstToken);
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.Equal("admin.test", (await me.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("username").GetString());
        var queryTokenOnRest = await client.GetAsync($"/api/v1/auth/me?access_token={Uri.EscapeDataString(firstToken)}");
        Assert.Equal(HttpStatusCode.Unauthorized, queryTokenOnRest.StatusCode);

        var second = await Login(client, "admin.test", "Sprint1.Test!123");
        var secondCookie = Cookie(second);
        var refreshed = await Send(client, HttpMethod.Post, "/api/v1/auth/refresh", cookie: firstCookie);
        Assert.Equal(HttpStatusCode.OK, refreshed.StatusCode);
        var rotatedCookie = Cookie(refreshed);
        Assert.NotEqual(firstCookie, rotatedCookie);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, HttpMethod.Post, "/api/v1/auth/refresh", cookie: firstCookie)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Post, "/api/v1/auth/refresh", cookie: secondCookie)).StatusCode);
        var logout = await Send(client, HttpMethod.Post, "/api/v1/auth/logout", cookie: rotatedCookie);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
        Assert.Contains("expires=", logout.Headers.GetValues("Set-Cookie").Single(), StringComparison.OrdinalIgnoreCase);
        Assert.Equal(HttpStatusCode.Unauthorized, (await Send(client, HttpMethod.Post, "/api/v1/auth/refresh", cookie: rotatedCookie)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync("/api/v1/auth/logout", null)).StatusCode);

        var noHub = await Send(client, HttpMethod.Post, "/hubs/attendance/negotiate?negotiateVersion=1");
        Assert.Equal(HttpStatusCode.Unauthorized, noHub.StatusCode);
        var employee = await Login(client, "empleado.test", "Sprint1.Test!123");
        var employeeToken = (await employee.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, "/hubs/attendance/negotiate?negotiateVersion=1", bearer: employeeToken)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await client.PostAsync($"/hubs/attendance/negotiate?negotiateVersion=1&access_token={Uri.EscapeDataString(firstToken)}", null)).StatusCode);
        await using (var secondDevelopment = new AuthWebApplicationFactory(postgres.ConnectionString, "Development"))
        using (var secondClient = secondDevelopment.CreateClient()) await secondClient.GetAsync("/health");
        await using (var db = new ApplicationDbContext(options))
        {
            Assert.Equal(6, await db.Users.CountAsync(x => x.UserName!.EndsWith(".test")));
            Assert.Equal(6, await db.Employees.CountAsync()); Assert.Equal(6, await db.Roles.CountAsync());
            Assert.False(await db.Roles.AnyAsync(x => x.Name == "CAJERO"));
            Assert.DoesNotContain(firstCookie, await db.UserSessions.Select(x => x.RefreshTokenHash).ToListAsync());
        }
    }

    [Fact]
    public async Task Production_seeder_creates_no_test_users_and_production_cookie_is_secure()
    {
        var builder = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "prod_" + Guid.NewGuid().ToString("N") };
        await postgres.MigrateAsync(builder.ConnectionString);
        await using var production = new AuthWebApplicationFactory(builder.ConnectionString, "Production");
        using var productionClient = production.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        await productionClient.GetAsync("/health");
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(builder.ConnectionString).Options;
        await using var db = new ApplicationDbContext(options);
        Assert.False(await db.Users.AnyAsync(x => x.UserName!.EndsWith(".test")));

        await postgres.MigrateAsync(postgres.ConnectionString);
        await using (var development = new AuthWebApplicationFactory(postgres.ConnectionString, "Development"))
        using (var developmentClient = development.CreateClient()) await developmentClient.GetAsync("/health");
        await using var seededProduction = new AuthWebApplicationFactory(postgres.ConnectionString, "Production");
        using var client = seededProduction.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false });
        var login = await Login(client, "admin.test", "Sprint1.Test!123");
        Assert.Equal(HttpStatusCode.OK, login.StatusCode); AssertCookie(login, secure: true);
    }

    private static Task<HttpResponseMessage> Login(HttpClient client, string username, string password) => client.PostAsJsonAsync("/api/v1/auth/login", new { username, password });
    private static Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? bearer = null, string? cookie = null)
    {
        var request = new HttpRequestMessage(method, path); if (bearer is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearer); if (cookie is not null) request.Headers.Add("Cookie", "refreshToken=" + cookie); return client.SendAsync(request);
    }
    private static string Cookie(HttpResponseMessage response) => response.Headers.GetValues("Set-Cookie").Single(x => x.StartsWith("refreshToken=", StringComparison.Ordinal)).Split(';')[0]["refreshToken=".Length..];
    private static void AssertCookie(HttpResponseMessage response, bool secure)
    {
        var value = response.Headers.GetValues("Set-Cookie").Single(x => x.StartsWith("refreshToken=", StringComparison.Ordinal));
        Assert.Contains("httponly", value, StringComparison.OrdinalIgnoreCase); Assert.Contains("samesite=strict", value, StringComparison.OrdinalIgnoreCase); Assert.Contains("path=/api/v1/auth", value, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(secure, value.Contains("secure", StringComparison.OrdinalIgnoreCase));
    }
}

[Collection(nameof(PostgresCollection))]
public sealed class CatalogPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Catalog_migrations_seeds_crud_filters_and_policies_use_real_postgresql()
    {
        var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "catalog_" + Guid.NewGuid().ToString("N") };
        await postgres.MigrateAsync(database.ConnectionString);
        var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database.ConnectionString).Options;
        await using (var db = new ApplicationDbContext(options))
        {
            Assert.Equal(11, await db.Categories.CountAsync());
            Assert.Equal(5, await db.Units.CountAsync());
            Assert.Equal(3, await db.Units.CountAsync(x => x.IsBase && x.IsActive));
        }

        await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development");
        using var client = factory.CreateClient();
        var openApi = await client.GetFromJsonAsync<JsonElement>("/openapi/v1.json");
        Assert.Equal("http", openApi.GetProperty("components").GetProperty("securitySchemes").GetProperty("Bearer").GetProperty("type").GetString());
        Assert.True(openApi.GetProperty("paths").GetProperty("/api/v1/units/{id}").GetProperty("put").GetProperty("responses").TryGetProperty("409", out _));
        Assert.True(openApi.GetProperty("paths").GetProperty("/api/v1/auth/login").GetProperty("post").GetProperty("responses").GetProperty("200").GetProperty("headers").TryGetProperty("Set-Cookie", out _));
        Assert.True(openApi.GetProperty("paths").GetProperty("/api/v1/units").GetProperty("get").GetProperty("security").GetArrayLength() > 0);
        var admin = await Login(client, "admin.test");
        var adminToken = (await admin.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
        var mesero = await Login(client, "mesero.test");
        var meseroToken = (await mesero.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/categories")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, "/api/v1/categories", meseroToken, new { name = "X", scope = "MENU" })).StatusCode);

        var category = await Send(client, HttpMethod.Post, "/api/v1/categories", adminToken, new { name = "Especiales", scope = "MENU" });
        var categoryBody = await category.Content.ReadAsStringAsync();
        await using var categoryDb = new ApplicationDbContext(options);
        var categoryPersisted = await categoryDb.Categories.AnyAsync(x => x.Name == "Especiales" && x.Scope == CategoryScope.MENU);
        Assert.True(category.StatusCode == HttpStatusCode.Created, $"Category POST status={(int)category.StatusCode} body={categoryBody} persisted={categoryPersisted}");
        var categoryJson = JsonSerializer.Deserialize<JsonElement>(categoryBody); var categoryId = categoryJson.GetProperty("id").GetGuid();
        Assert.Equal(HttpStatusCode.Conflict, (await Send(client, HttpMethod.Post, "/api/v1/categories", adminToken, new { name = "especiales", scope = "MENU" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/categories?page=1&pageSize=20&scope=MENU", meseroToken)).StatusCode);

        var units = await Send(client, HttpMethod.Get, "/api/v1/units", meseroToken);
        var unitId = (await units.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("items").EnumerateArray().Single(x => x.GetProperty("code").GetString() == "g").GetProperty("id").GetGuid();
        Assert.Equal(HttpStatusCode.Conflict, (await Send(client, HttpMethod.Delete, $"/api/v1/units/{unitId}", adminToken)).StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await Send(client, HttpMethod.Put, $"/api/v1/units/{unitId}", adminToken, new { code = "grams", name = "Gram", symbol = "gr", dimension = "MASS", factor_to_base = 1m, is_base = true })).StatusCode);
        var protectedUnit = await Send(client, HttpMethod.Get, $"/api/v1/units/{unitId}", meseroToken);
        var protectedUnitBody = await protectedUnit.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("g", protectedUnitBody.GetProperty("code").GetString());
        Assert.Equal("g", protectedUnitBody.GetProperty("symbol").GetString());
        var product = await Send(client, HttpMethod.Post, "/api/v1/products", adminToken, new { name = "Pan", productType = "SALE_ITEM", categoryId, inventoryUnitId = unitId, salePrice = 12.5m, minStock = 0m });
        Assert.Equal(HttpStatusCode.Created, product.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, (await Send(client, HttpMethod.Delete, $"/api/v1/categories/{categoryId}", adminToken)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Post, "/api/v1/categories", adminToken, new { name = "Invalid", scope = "NO_SCOPE" })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, $"/api/v1/categories/{categoryId}", meseroToken)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Put, $"/api/v1/categories/{categoryId}", adminToken, new { name = "Especiales actualizados", scope = "MENU" })).StatusCode);
        var temporaryCategory = await Send(client, HttpMethod.Post, "/api/v1/categories", adminToken, new { name = "Temporal", scope = "MENU" });
        var temporaryId = (await temporaryCategory.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid();
        Assert.Equal(HttpStatusCode.NoContent, (await Send(client, HttpMethod.Delete, $"/api/v1/categories/{temporaryId}", adminToken)).StatusCode);

        var newUnit = await Send(client, HttpMethod.Post, "/api/v1/units", adminToken, new { code = "taza", name = "Taza", symbol = "tz", dimension = "VOLUME", factor_to_base = 250m, is_base = false });
        Assert.Equal(HttpStatusCode.Created, newUnit.StatusCode);
        var newUnitId = (await newUnit.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid();
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, $"/api/v1/units/{newUnitId}", meseroToken)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Put, $"/api/v1/units/{newUnitId}", adminToken, new { code = "taza", name = "Taza", symbol = "taza", dimension = "VOLUME", factor_to_base = 250m, is_base = false })).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await Send(client, HttpMethod.Delete, $"/api/v1/units/{newUnitId}", adminToken)).StatusCode);

        var products = await Send(client, HttpMethod.Get, $"/api/v1/products?page=1&pageSize=20&search=Pan&productType=SALE_ITEM&categoryId={categoryId}&categoryScope=MENU&isActive=true", meseroToken);
        Assert.Equal(HttpStatusCode.OK, products.StatusCode);
        var payload = await products.Content.ReadFromJsonAsync<JsonElement>(); Assert.Equal(1, payload.GetProperty("totalCount").GetInt32()); Assert.Equal(TimeSpan.Zero, payload.GetProperty("items")[0].GetProperty("createdAt").GetDateTimeOffset().Offset);
        var productId = payload.GetProperty("items")[0].GetProperty("id").GetGuid();
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, $"/api/v1/products/{productId}", meseroToken)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Put, $"/api/v1/products/{productId}", adminToken, new { name = "Pan integral", productType = "SALE_ITEM", categoryId, inventoryUnitId = unitId, salePrice = 14m, minStock = 0m })).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await Send(client, HttpMethod.Delete, $"/api/v1/products/{productId}", adminToken)).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Get, "/api/v1/products?page=1&pageSize=20&isActive=false", meseroToken)).StatusCode);
    }

        [Fact]
        public async Task Catalog_migration_upgrades_from_initial_identity_and_enforces_database_constraints()
        {
            var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "catalog_upgrade_" + Guid.NewGuid().ToString("N") };
            await postgres.MigrateToAsync(database.ConnectionString, "20260823162948_InitialIdentity");
            await postgres.MigrateAsync(database.ConnectionString);
            var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(database.ConnectionString).Options;
            await using var db = new ApplicationDbContext(options);
            Assert.Contains("20260825035346_AddCatalog", await db.Database.GetAppliedMigrationsAsync());
            Assert.Equal(11, await db.Categories.CountAsync());
            db.Categories.Add(new Category { Name = "entradas", Scope = CategoryScope.MENU });
            await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
            db.ChangeTracker.Clear();
            var constraints = await db.Database.SqlQuery<string>($"""SELECT conname AS "Value" FROM pg_constraint WHERE conname IN ('FK_Products_Categories_CategoryId', 'FK_Products_Units_InventoryUnitId')""").ToListAsync();
            Assert.Equal(2, constraints.Count);
        }

        private static Task<HttpResponseMessage> Login(HttpClient client, string username) => client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" });
    private static Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token = null, object? body = null)
    {
        var request = new HttpRequestMessage(method, path); if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body is not null) request.Content = JsonContent.Create(body); return client.SendAsync(request);
    }
}

[Collection(nameof(PostgresCollection))]
public sealed class SupplierPostgresIntegrationTests(PostgresFixture postgres)
{
    [Fact]
    public async Task Suppliers_use_postgresql_paging_soft_delete_validation_and_role_matrix()
    {
        var database = new NpgsqlConnectionStringBuilder(postgres.ConnectionString) { Database = "suppliers_" + Guid.NewGuid().ToString("N") };
        await postgres.MigrateAsync(database.ConnectionString);
        await using var factory = new AuthWebApplicationFactory(database.ConnectionString, "Development");
        using var client = factory.CreateClient();
        var admin = await Login(client, "admin.test");
        var adminToken = (await admin.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;
        var kitchen = await Login(client, "cocina.test");
        var kitchenToken = (await kitchen.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("accessToken").GetString()!;

        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/suppliers")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await Send(client, HttpMethod.Post, "/api/v1/suppliers", kitchenToken, new { name = "No permitido", phoneNumber = "1" })).StatusCode);
        var first = await Send(client, HttpMethod.Post, "/api/v1/suppliers", adminToken, new { name = "Verdulería Norte", phoneNumber = "70000000" });
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        var firstBody = await first.Content.ReadFromJsonAsync<JsonElement>();
        var firstId = firstBody.GetProperty("id").GetGuid();
        Assert.Equal(JsonValueKind.Null, firstBody.GetProperty("email").ValueKind);
        Assert.Equal(JsonValueKind.Null, firstBody.GetProperty("notes").ValueKind);
        Assert.Equal(TimeSpan.Zero, firstBody.GetProperty("createdAt").GetDateTimeOffset().Offset);
        Assert.Equal(HttpStatusCode.Created, (await Send(client, HttpMethod.Post, "/api/v1/suppliers", adminToken, new { name = "Verdulería Sur", phoneNumber = "70000000", email = "shared@example.test" })).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await Send(client, HttpMethod.Post, "/api/v1/suppliers", adminToken, new { name = "Inválido", phoneNumber = "2", email = "not-an-email" })).StatusCode);
        var list = await Send(client, HttpMethod.Get, "/api/v1/suppliers?search=7000&page=1&pageSize=1", kitchenToken);
        Assert.Equal(HttpStatusCode.OK, list.StatusCode);
        var listBody = await list.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(2, listBody.GetProperty("totalCount").GetInt32()); Assert.Equal(2, listBody.GetProperty("totalPages").GetInt32());
        Assert.Equal(HttpStatusCode.OK, (await Send(client, HttpMethod.Put, $"/api/v1/suppliers/{firstId}", adminToken, new { name = "Verdulería Norte actualizada", phoneNumber = "70000000", email = "north@example.test", notes = "Entrega AM" })).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await Send(client, HttpMethod.Delete, $"/api/v1/suppliers/{firstId}", adminToken)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Send(client, HttpMethod.Get, "/api/v1/suppliers/00000000-0000-0000-0000-000000000001", kitchenToken)).StatusCode);
        var defaultList = await Send(client, HttpMethod.Get, "/api/v1/suppliers", kitchenToken);
        Assert.Equal(1, (await defaultList.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("totalCount").GetInt32());
        var inactiveList = await Send(client, HttpMethod.Get, "/api/v1/suppliers?isActive=false", kitchenToken);
        Assert.Equal(1, (await inactiveList.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("totalCount").GetInt32());
    }

    private static Task<HttpResponseMessage> Login(HttpClient client, string username) => client.PostAsJsonAsync("/api/v1/auth/login", new { username, password = "Sprint1.Test!123" });
    private static Task<HttpResponseMessage> Send(HttpClient client, HttpMethod method, string path, string? token = null, object? body = null)
    {
        var request = new HttpRequestMessage(method, path); if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body is not null) request.Content = JsonContent.Create(body); return client.SendAsync(request);
    }
}
