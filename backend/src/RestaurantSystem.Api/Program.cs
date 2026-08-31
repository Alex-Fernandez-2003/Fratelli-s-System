using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Application.Auth;
using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Application.Suppliers;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Application.Users;
using RestaurantSystem.Application.Orders;
using RestaurantSystem.Application.Inventory;
using RestaurantSystem.Application.Expenses;
using RestaurantSystem.Application.Operations;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Inventory;
using RestaurantSystem.Domain.Expenses;
using RestaurantSystem.Domain.Orders;
using RestaurantSystem.Domain.Operations;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Identity;
using RestaurantSystem.Infrastructure.Attendance;
using RestaurantSystem.Infrastructure.Orders;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails(); builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.Converters.Add(new JsonStringEnumConverter())); builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options => options.AddPolicy("frontend", p => p.WithOrigins("http://localhost:8087").AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
builder.Services.AddHealthChecks(); builder.Services.AddSignalR(); builder.Services.AddOpenApi(options => options.AddDocumentTransformer((document, context, _) =>
{
    var components = document.Components ??= new();
    components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
    components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme { Type = SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT" };
    foreach (var path in document.Paths.Where(entry => entry.Key is not "/api/v1/auth/login" and not "/api/v1/auth/refresh" and not "/api/v1/auth/logout").Select(entry => entry.Value))
    {
        if (path is null) continue;
        foreach (var operation in path.Operations.Values)
        {
            operation.Security = [new OpenApiSecurityRequirement { [new OpenApiSecuritySchemeReference("Bearer", document, null)] = [] }];
        }
    }
    foreach (var path in new[] { "/api/v1/auth/login", "/api/v1/auth/refresh", "/api/v1/auth/logout" })
    {
        if (!document.Paths.TryGetValue(path, out var authPath) || authPath is null) continue;
        foreach (var operation in authPath.Operations.Values)
        {
            var statusCode = operation.Responses.ContainsKey("204") ? "204" : "200";
            if (!operation.Responses.TryGetValue(statusCode, out var existingResponse) || existingResponse is null) continue;
            operation.Responses[statusCode] = new OpenApiResponse
            {
                Description = existingResponse.Description,
                Content = existingResponse.Content,
                Headers = new Dictionary<string, IOpenApiHeader>
                {
                    ["Set-Cookie"] = new OpenApiHeader { Description = "refreshToken cookie: HttpOnly; SameSite=Strict; Path=/api/v1/auth; Secure outside Development." }
                }
            };
        }
    }
    return Task.CompletedTask;
})); builder.Services.AddSwaggerGen();
var jwt = builder.Configuration.GetRequiredSection("Jwt"); var key = jwt["Key"]; if (string.IsNullOrWhiteSpace(key)) throw new InvalidOperationException("Jwt:Key must be configured outside version control via User Secrets or the Jwt__Key environment variable.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new() { ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true, ValidIssuer = jwt["Issuer"], ValidAudience = jwt["Audience"], IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), NameClaimType = ClaimTypes.Name, RoleClaimType = ClaimTypes.Role };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.HttpContext.Request.Path.StartsWithSegments("/hubs") && context.Request.Query.TryGetValue("access_token", out var token)) context.Token = token;
                return Task.CompletedTask;
            },
            OnTokenValidated = async context =>
            {
                var userId = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                var supplied = context.Principal?.FindFirstValue(JwtTokenService.SecurityRevisionClaim);
                if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(supplied)) { context.Fail("Invalid token."); return; }
                var users = context.HttpContext.RequestServices.GetRequiredService<UserManager<IdentityUser>>();
                var db = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();
                var user = await users.FindByIdAsync(userId);
                var active = user is not null && await db.Users.Where(x => x.Id == userId).Select(x => EF.Property<bool>(x, "IsActive")).SingleOrDefaultAsync(context.HttpContext.RequestAborted);
                var expected = user is null ? string.Empty : SecurityRevision.Fingerprint(user.SecurityStamp);
                if (!active || !System.Security.Cryptography.CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(supplied), Encoding.UTF8.GetBytes(expected))) context.Fail("Invalid token.");
            }
        };
});
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(PolicyNames.CatalogRead, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Waiter, RoleNames.Kitchen));
    options.AddPolicy(PolicyNames.CatalogWrite, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy(PolicyNames.CatalogDeactivate, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy(PolicyNames.SupplierRead, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Kitchen, RoleNames.Accountant));
    options.AddPolicy(PolicyNames.SupplierWrite, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy(PolicyNames.SupplierDeactivate, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy(PolicyNames.AttendanceManage, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy(PolicyNames.AttendanceSelf, p => p.RequireAuthenticatedUser());
    options.AddPolicy("AttendanceAdministrative", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Accountant));
    options.AddPolicy(PolicyNames.AttendanceHubAccess, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy(PolicyNames.UsersManage, p => p.RequireRole(RoleNames.Administrator));
    options.AddPolicy(PolicyNames.OrdersAccess, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Waiter));
    options.AddPolicy(PolicyNames.KitchenAccess, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Waiter, RoleNames.Kitchen));
    options.AddPolicy(PolicyNames.KitchenManage, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Kitchen));
    options.AddPolicy("CustomerRead", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Waiter));
    options.AddPolicy("CustomerWrite", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Waiter));
    options.AddPolicy("CustomerStatusManage", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy("ProductionHistory", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Kitchen, RoleNames.Accountant));
    options.AddPolicy("SalesHistory", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Waiter, RoleNames.Accountant));
        options.AddPolicy("PurchaseHistory", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Kitchen, RoleNames.Accountant));
    options.AddPolicy(PolicyNames.KitchenHubAccess, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Waiter, RoleNames.Kitchen));
    options.AddPolicy(PolicyNames.InventoryRead, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Waiter, RoleNames.Kitchen, RoleNames.Accountant));
    options.AddPolicy(PolicyNames.InventoryManage, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy(PolicyNames.InventoryHistory, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Waiter, RoleNames.Kitchen, RoleNames.Accountant));
    options.AddPolicy(PolicyNames.ExpenseWrite, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy(PolicyNames.ExpenseCategoryRead, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy("ExpenseHistory", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Accountant));
    options.AddPolicy("OperationsPurchase", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Kitchen));
    options.AddPolicy("OperationsShiftManage", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy("WorkScheduleManage", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy("CashManage", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
    options.AddPolicy("CashHistory", p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager, RoleNames.Accountant));
});
var app = builder.Build(); app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
    await Results.Problem(statusCode: exception is BadHttpRequestException ? StatusCodes.Status400BadRequest : StatusCodes.Status500InternalServerError).ExecuteAsync(context);
})); app.UseCors("frontend"); if (app.Environment.IsDevelopment()) { app.MapOpenApi(); app.UseSwagger(); app.UseSwaggerUI(); } app.UseAuthentication(); app.UseAuthorization(); app.MapHealthChecks("/health");
var auth = app.MapGroup("/api/v1/auth");
auth.MapPost("/login", async (LoginRequest request, IAuthService service, HttpContext http, CancellationToken ct) =>
{
    if (request.Extra?.Count > 0 || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password)) return Results.ValidationProblem(new Dictionary<string, string[]> { ["credentials"] = ["Username and password are required."] });
    var result = await service.LoginAsync(request.Username, request.Password, ct);
    if (result is null) return Results.Problem(statusCode: StatusCodes.Status401Unauthorized, title: "Invalid credentials");
    SetCookie(http, result.Value.RefreshToken); return Results.Ok(result.Value.Response);
}).Produces<AuthResponse>(StatusCodes.Status200OK).ProducesProblem(StatusCodes.Status400BadRequest).ProducesProblem(StatusCodes.Status401Unauthorized);
auth.MapPost("/refresh", async (IAuthService service, HttpContext http, CancellationToken ct) =>
{
    var result = await service.RefreshAsync(http.Request.Cookies["refreshToken"] ?? "", ct);
    if (result is null) return Results.Problem(statusCode: 401, title: "Invalid refresh token");
    SetCookie(http, result.Value.RefreshToken); return Results.Ok(result.Value.Response);
}).Produces<AuthResponse>(StatusCodes.Status200OK).ProducesProblem(StatusCodes.Status401Unauthorized);
auth.MapPost("/logout", async (IAuthService service, HttpContext http, CancellationToken ct) => { await service.RevokeAsync(http.Request.Cookies["refreshToken"], ct); http.Response.Cookies.Delete("refreshToken", CookieOptions(http)); return Results.NoContent(); }).Produces(StatusCodes.Status204NoContent);
auth.MapGet("/me", async (ClaimsPrincipal principal, IAuthService service, CancellationToken ct) => { var user = await service.GetUserAsync(principal.FindFirstValue(ClaimTypes.NameIdentifier)!, ct); return user is null ? Results.NotFound() : Results.Ok(user); }).RequireAuthorization().Produces<AuthUser>(StatusCodes.Status200OK).ProducesProblem(StatusCodes.Status401Unauthorized).ProducesProblem(StatusCodes.Status404NotFound);
var catalog = app.MapGroup("/api/v1");
static bool Paging(int page, int pageSize) => page >= 1 && pageSize is >= 1 and <= 100;
static IResult Error(string error) => error == "Not found" ? Results.NotFound() : error.StartsWith("Invalid") ? Results.ValidationProblem(new Dictionary<string,string[]> { ["catalog"] = [error] }) : Results.Problem(statusCode: StatusCodes.Status409Conflict, title: error);
var categories = catalog.MapGroup("/categories").RequireAuthorization(PolicyNames.CatalogRead);
categories.MapGet("", async (ICatalogService s,int page=1,int pageSize=20,CategoryScope? scope=null,bool includeInactive=false,CancellationToken ct=default) => Paging(page,pageSize) ? Results.Ok(await s.Categories(page,pageSize,scope,includeInactive,ct)) : Results.ValidationProblem(new Dictionary<string,string[]> { ["paging"]=["page must be 1 and pageSize must be 1-100"] })).Produces<PagedResponse<CategoryDto>>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403);
categories.MapGet("/{id:guid}", async (Guid id,ICatalogService s,CancellationToken ct) => await s.Category(id,ct) is { } x ? Results.Ok(x) : Results.NotFound()).Produces<CategoryDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404);
categories.MapPost("", async (CategoryRequest r,ICatalogService s,CancellationToken ct) => { var x=await s.CreateCategory(r,ct); return x.Error is null ? Results.Created($"/api/v1/categories/{x.Value!.Id}",x.Value) : Error(x.Error); }).RequireAuthorization(PolicyNames.CatalogWrite).Produces<CategoryDto>(201).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(409);
categories.MapPut("/{id:guid}", async (Guid id,CategoryRequest r,ICatalogService s,CancellationToken ct) => { var x=await s.UpdateCategory(id,r,ct);return x.Error is null?Results.Ok(x.Value):Error(x.Error); }).RequireAuthorization(PolicyNames.CatalogWrite).Produces<CategoryDto>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
categories.MapDelete("/{id:guid}", async (Guid id,ICatalogService s,CancellationToken ct) => (await s.DeleteCategory(id,ct)) is { } e ? Error(e) : Results.NoContent()).RequireAuthorization(PolicyNames.CatalogWrite).Produces(204).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
var units = catalog.MapGroup("/units").RequireAuthorization(PolicyNames.CatalogRead);
units.MapGet("", async (ICatalogService s,int page=1,int pageSize=20,bool includeInactive=false,CancellationToken ct=default) => Paging(page,pageSize) ? Results.Ok(await s.Units(page,pageSize,includeInactive,ct)) : Results.ValidationProblem(new Dictionary<string,string[]> { ["paging"]=["page must be 1 and pageSize must be 1-100"] })).Produces<PagedResponse<UnitDto>>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403);
units.MapGet("/{id:guid}", async (Guid id,ICatalogService s,CancellationToken ct) => await s.Unit(id,ct) is { } x ? Results.Ok(x) : Results.NotFound()).Produces<UnitDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404);
units.MapPost("", async (UnitRequest r,ICatalogService s,CancellationToken ct) => {var x=await s.CreateUnit(r,ct);return x.Error is null?Results.Created($"/api/v1/units/{x.Value!.Id}",x.Value):Error(x.Error);}).RequireAuthorization(PolicyNames.CatalogWrite).Produces<UnitDto>(201).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(409);
units.MapPut("/{id:guid}", async (Guid id,UnitRequest r,ICatalogService s,CancellationToken ct) => {var x=await s.UpdateUnit(id,r,ct);return x.Error is null?Results.Ok(x.Value):Error(x.Error);}).RequireAuthorization(PolicyNames.CatalogWrite).Produces<UnitDto>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
units.MapDelete("/{id:guid}", async (Guid id,ICatalogService s,CancellationToken ct) => (await s.DeleteUnit(id,ct)) is { } e?Error(e):Results.NoContent()).RequireAuthorization(PolicyNames.CatalogWrite).Produces(204).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
var products = catalog.MapGroup("/products").RequireAuthorization(PolicyNames.CatalogRead);
products.MapGet("", async (ICatalogService s,int page=1,int pageSize=20,string? search=null,ProductType? productType=null,Guid? categoryId=null,CategoryScope? categoryScope=null,string? preparationArea=null,bool? isActive=null,CancellationToken ct=default) => Paging(page,pageSize) ? Results.Ok(await s.Products(page,pageSize,search,productType,categoryId,categoryScope,preparationArea,isActive,ct)) : Results.ValidationProblem(new Dictionary<string,string[]> { ["paging"]=["page must be 1 and pageSize must be 1-100"] })).Produces<PagedResponse<ProductDto>>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403);
products.MapGet("/{id:guid}",async(Guid id,ICatalogService s,CancellationToken ct)=>await s.Product(id,ct) is {} x?Results.Ok(x):Results.NotFound()).Produces<ProductDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404);
products.MapPost("",async(ProductRequest r,ClaimsPrincipal p,ICatalogService s,CancellationToken ct)=>{var x=await s.CreateProduct(r,p.FindFirstValue(ClaimTypes.NameIdentifier)!,ct);return x.Error is null?Results.Created($"/api/v1/products/{x.Value!.Id}",x.Value):Error(x.Error);}).RequireAuthorization(PolicyNames.CatalogWrite).Produces<ProductDto>(201).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
products.MapPut("/{id:guid}",async(Guid id,ProductRequest r,ClaimsPrincipal p,ICatalogService s,CancellationToken ct)=>{var x=await s.UpdateProduct(id,r,p.FindFirstValue(ClaimTypes.NameIdentifier)!,ct);return x.Error is null?Results.Ok(x.Value):Error(x.Error);}).RequireAuthorization(PolicyNames.CatalogWrite).Produces<ProductDto>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
products.MapDelete("/{id:guid}",async(Guid id,ICatalogService s,CancellationToken ct)=>(await s.DeleteProduct(id,ct)) is {} e?Error(e):Results.NoContent()).RequireAuthorization(PolicyNames.CatalogWrite).Produces(204).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404);
    var users = catalog.MapGroup("/users").RequireAuthorization(PolicyNames.UsersManage);
    users.MapGet("", async (IUserManagementService s, int page = 1, int pageSize = 10, string? search = null, string? role = null, bool? active = null, CancellationToken ct = default) =>
    {
        if (!Paging(page, pageSize) || (role is not null && !RoleNames.All.Contains(role, StringComparer.Ordinal))) return Results.ValidationProblem(new Dictionary<string, string[]> { ["users"] = ["Invalid paging or role"] });
        return Results.Ok(await s.ListAsync(page, pageSize, search, role, active, ct));
    }).Produces<PagedResponse<UserDto>>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403);
    users.MapGet("/{id}", async (string id, IUserManagementService s, CancellationToken ct) => await s.GetAsync(id, ct) is { } x ? Results.Ok(x) : Results.NotFound()).Produces<UserDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404);
    users.MapPost("", async (CreateUserRequest request, ClaimsPrincipal principal, IUserManagementService s, CancellationToken ct) =>
    {
        var result = await s.CreateAsync(request, principal.FindFirstValue(ClaimTypes.NameIdentifier)!, ct);
        return result.Error is null ? Results.Created($"/api/v1/users/{result.Value!.Id}", result.Value) : Error(result.Error);
    }).Produces<UserDto>(201).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(409);
    users.MapPut("/{id}", async (string id, UpdateUserRequest request, ClaimsPrincipal principal, IUserManagementService s, CancellationToken ct) =>
    {
        var result = await s.UpdateAsync(id, request, principal.FindFirstValue(ClaimTypes.NameIdentifier)!, ct);
        return result.Error is null ? Results.Ok(result.Value) : Error(result.Error);
    }).Produces<UserDto>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
    users.MapPost("/{id}/password", async (string id, SetUserPasswordRequest request, ClaimsPrincipal principal, IUserManagementService s, CancellationToken ct) =>
    {
        var error = await s.SetPasswordAsync(id, request, principal.FindFirstValue(ClaimTypes.NameIdentifier)!, ct);
        return error is null ? Results.NoContent() : Error(error);
    }).Produces(204).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
    users.MapPost("/{id}/activate", async (string id, ClaimsPrincipal principal, IUserManagementService s, CancellationToken ct) =>
    {
        var error = await s.SetActiveAsync(id, true, principal.FindFirstValue(ClaimTypes.NameIdentifier)!, ct);
        return error is null ? Results.NoContent() : Error(error);
    }).Produces(204).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
    users.MapPost("/{id}/deactivate", async (string id, ClaimsPrincipal principal, IUserManagementService s, CancellationToken ct) =>
    {
        var error = await s.SetActiveAsync(id, false, principal.FindFirstValue(ClaimTypes.NameIdentifier)!, ct);
        return error is null ? Results.NoContent() : Error(error);
    }).Produces(204).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);

    var suppliers = catalog.MapGroup("/suppliers").RequireAuthorization(PolicyNames.SupplierRead);
    suppliers.MapGet("", async (ISupplierService s, int page = 1, int pageSize = 20, string? search = null, bool? isActive = null, CancellationToken ct = default) => Paging(page, pageSize) ? Results.Ok(await s.ListAsync(page, pageSize, search, isActive, ct)) : Results.ValidationProblem(new Dictionary<string, string[]> { ["paging"] = ["page must be 1 and pageSize must be 1-100"] })).Produces<PagedResponse<SupplierDto>>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403);
    suppliers.MapGet("/{id:guid}", async (Guid id, ISupplierService s, CancellationToken ct) => await s.GetAsync(id, ct) is { } x ? Results.Ok(x) : Results.NotFound()).Produces<SupplierDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404);
    suppliers.MapPost("", async (SupplierRequest r, ClaimsPrincipal p, ISupplierService s, CancellationToken ct) => { var x = await s.CreateAsync(r, p.FindFirstValue(ClaimTypes.NameIdentifier)!, ct); return x.Error is null ? Results.Created($"/api/v1/suppliers/{x.Value!.Id}", x.Value) : Error(x.Error); }).RequireAuthorization(PolicyNames.SupplierWrite).Produces<SupplierDto>(201).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(409);
    suppliers.MapPut("/{id:guid}", async (Guid id, SupplierRequest r, ClaimsPrincipal p, ISupplierService s, CancellationToken ct) => { var x = await s.UpdateAsync(id, r, p.FindFirstValue(ClaimTypes.NameIdentifier)!, ct); return x.Error is null ? Results.Ok(x.Value) : Error(x.Error); }).RequireAuthorization(PolicyNames.SupplierWrite).Produces<SupplierDto>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
    suppliers.MapDelete("/{id:guid}", async (Guid id, ISupplierService s, CancellationToken ct) => (await s.DeleteAsync(id, ct)) is { } error ? Error(error) : Results.NoContent()).RequireAuthorization(PolicyNames.SupplierWrite).Produces(204).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404);
static IResult AttendanceError(string error) => error == "Not found" ? Results.NotFound() : error.StartsWith("Invalid") ? Results.ValidationProblem(new Dictionary<string, string[]> { ["attendance"] = [error] }) : Results.Problem(statusCode: StatusCodes.Status409Conflict, title: error);
static IResult InventoryError(string error) => error == "NOT_FOUND" ? Results.NotFound() : error is "INVALID_REQUEST" or "MANUAL_MOVEMENT_TYPE_NOT_ALLOWED" ? Results.ValidationProblem(new Dictionary<string, string[]> { ["inventory"] = [error] }) : Results.Problem(statusCode: StatusCodes.Status409Conflict, title: "Inventory operation conflict", extensions: new Dictionary<string, object?> { ["code"] = error });
static IResult ExpenseError(string error) => error == "NOT_FOUND" ? Results.NotFound() : error == "INVALID_REQUEST" ? Results.ValidationProblem(new Dictionary<string, string[]> { ["expenses"] = [error] }) : Results.Problem(statusCode: StatusCodes.Status409Conflict, title: "Expense operation conflict", extensions: new Dictionary<string, object?> { ["code"] = error });
var inventory = catalog.MapGroup("/inventory");
inventory.MapGet("/balances", async (IInventoryService s, int page = 1, int pageSize = 20, string? search = null, ProductType? productType = null, bool? active = null, CancellationToken ct = default) => !Paging(page, pageSize) ? Results.ValidationProblem(new Dictionary<string, string[]> { ["paging"] = ["page must be 1 and pageSize must be 1-100"] }) : Results.Ok(await s.BalancesAsync(page, pageSize, search, productType, active, ct))).RequireAuthorization(PolicyNames.InventoryRead).Produces<PagedResponse<InventoryBalanceDto>>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403);
inventory.MapGet("/summary", async (IInventoryService s, CancellationToken ct = default) => Results.Ok(await s.SummaryAsync(ct))).RequireAuthorization(PolicyNames.InventoryRead).Produces<InventorySummaryDto>(200).ProducesProblem(401).ProducesProblem(403);
inventory.MapGet("/movements", async (IInventoryService s, int page = 1, int pageSize = 20, Guid? productId = null, InventoryMovementType? movementType = null, DateOnly? from = null, DateOnly? to = null, CancellationToken ct = default) => !Paging(page, pageSize) || from > to ? Results.ValidationProblem(new Dictionary<string, string[]> { ["inventory"] = ["Invalid paging or date range"] }) : Results.Ok(await s.MovementsAsync(page, pageSize, productId, movementType, from, to, ct))).RequireAuthorization(PolicyNames.InventoryHistory).Produces<PagedResponse<InventoryMovementDto>>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403);
inventory.MapPost("/movements", async (RecordManualInventoryMovementRequest r, ClaimsPrincipal p, IInventoryService s, CancellationToken ct) => { var x = await s.RecordManualAsync(r, p.FindFirstValue(ClaimTypes.NameIdentifier)!, ct); return x.Error is null ? Results.Created($"/api/v1/inventory/movements/{x.Value!.Id}", x.Value) : InventoryError(x.Error); }).RequireAuthorization(PolicyNames.InventoryManage).Produces<InventoryMovementDto>(201).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
var expenses = catalog.MapGroup("/expenses");
catalog.MapGet("/expense-categories", async (IExpenseService s, CancellationToken ct) => Results.Ok(await s.CategoriesAsync(ct))).RequireAuthorization(PolicyNames.ExpenseCategoryRead).Produces<IReadOnlyList<ExpenseCategoryDto>>(200).ProducesProblem(401).ProducesProblem(403);
expenses.MapGet("", async (IExpenseService s, int page = 1, int pageSize = 20, DateOnly? from = null, DateOnly? to = null, Guid? categoryId = null, CashSource? cashSource = null, string? responsible = null, Guid? shiftId = null, ShiftType? shiftType = null, CancellationToken ct = default) => !Paging(page, pageSize) || from > to ? Results.ValidationProblem(new Dictionary<string, string[]> { ["expenses"] = ["Invalid paging or date range"] }) : Results.Ok(await s.HistoryAsync(page, pageSize, from, to, categoryId, cashSource, responsible, shiftId, shiftType, ct))).RequireAuthorization("ExpenseHistory").Produces<ExpenseHistoryPage>(200).ProducesValidationProblem(400).ProducesProblem(401).ProducesProblem(403);
expenses.MapPost("", async (CreateExpenseRequest r, ClaimsPrincipal p, IExpenseService s, CancellationToken ct) => { var x = await s.CreateAsync(r, p.FindFirstValue(ClaimTypes.NameIdentifier)!, ct); return x.Error is null ? Results.Created($"/api/v1/expenses/{x.Value!.Id}", x.Value) : ExpenseError(x.Error); }).RequireAuthorization(PolicyNames.ExpenseWrite).Produces<ExpenseDto>(201).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
var attendance = catalog.MapGroup("/attendance");
attendance.MapPost("/employees/{employeeId:guid}/check-in", async (Guid employeeId, ClaimsPrincipal principal, IAttendanceService service, CancellationToken ct) => { var result = await service.CheckInAsync(employeeId, principal.FindFirstValue(ClaimTypes.NameIdentifier)!, ct); return result.Error is null ? Results.Created($"/api/v1/attendance/employees/{employeeId}", result.Value) : AttendanceError(result.Error); }).RequireAuthorization(PolicyNames.AttendanceManage).Produces<AttendanceRecordDto>(201).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
attendance.MapPost("/employees/{employeeId:guid}/check-out", async (Guid employeeId, ClaimsPrincipal principal, IAttendanceService service, CancellationToken ct) => { var result = await service.CheckOutAsync(employeeId, principal.FindFirstValue(ClaimTypes.NameIdentifier)!, ct); return result.Error is null ? Results.Ok(result.Value) : AttendanceError(result.Error); }).RequireAuthorization(PolicyNames.AttendanceManage).Produces<AttendanceRecordDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
attendance.MapGet("/employees/today", async (IAttendanceService service, CancellationToken ct) => Results.Ok(await service.TodayAsync(ct))).RequireAuthorization(PolicyNames.AttendanceManage).Produces<AttendanceTodayResponse>(200).ProducesProblem(401).ProducesProblem(403);
attendance.MapGet("/admin", async (Guid? employeeId, DateOnly? from, DateOnly? to, ShiftType? shiftType, AttendanceLifecycle? outcome, bool? late, int page = 1, int pageSize = 20, IAttendanceService service = null!, CancellationToken ct = default) => { var result = await service.AdministrativeAsync(employeeId, from, to, shiftType, outcome, late, page, pageSize, ct); return result.Error is null ? Results.Ok(result.Value) : AttendanceError(result.Error); }).RequireAuthorization("AttendanceAdministrative").Produces<AdministrativeAttendancePage>(200).ProducesValidationProblem(400).ProducesProblem(401).ProducesProblem(403);
attendance.MapGet("/me", async (DateOnly? from, DateOnly? to, int page = 1, int pageSize = 20, ClaimsPrincipal principal = null!, IAttendanceService service = null!, CancellationToken ct = default) => { var result = await service.MineAsync(principal.FindFirstValue(ClaimTypes.NameIdentifier)!, from, to, page, pageSize, ct); return result.Error is null ? Results.Ok(result.Value) : AttendanceError(result.Error); }).RequireAuthorization(PolicyNames.AttendanceSelf).Produces<AttendancePage>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(404);
static OrderActor Actor(ClaimsPrincipal principal) => new(principal.FindFirstValue(ClaimTypes.NameIdentifier)!, principal.FindAll(ClaimTypes.Role).Select(x => x.Value).ToHashSet(StringComparer.Ordinal));
static IResult OrderError(string error, object? shortages = null) => error switch
{
"NOT_FOUND" => Results.NotFound(),
"FORBIDDEN" => Results.Forbid(),
"INVALID_REQUEST" or "DUPLICATE_PRODUCT" or "PRODUCT_NOT_ORDERABLE" or "WAITER_NOT_ELIGIBLE" => Results.ValidationProblem(new Dictionary<string, string[]> { ["orders"] = [error] }),
_ => Results.Problem(statusCode: StatusCodes.Status409Conflict, title: "Order operation conflict", extensions: new Dictionary<string, object?> { ["code"] = error, ["shortages"] = shortages })
};
var orders = catalog.MapGroup("/orders").RequireAuthorization(PolicyNames.OrdersAccess);
orders.MapPost("", async (CreateOrderRequest r, ClaimsPrincipal p, IOrderService s, CancellationToken ct) => { var x = await s.CreateAsync(r, Actor(p), ct); return x.Error is null ? Results.Created($"/api/v1/orders/{x.Value!.Id}", x.Value) : OrderError(x.Error, x.Shortages); }).Produces<OrderDto>(201).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(409);
orders.MapGet("", async (IOrderService s, int page = 1, int pageSize = 10, OrderStatus? status = null, string? search = null, CancellationToken ct = default) => page < 1 || pageSize is < 1 or > 100 ? Results.ValidationProblem(new Dictionary<string, string[]> { ["paging"] = ["page must be 1 and pageSize must be 1-100"] }) : Results.Ok(await s.ListAsync(page, pageSize, status, search, ct))).Produces<PagedResponse<OrderDto>>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403);
orders.MapGet("/{id:guid}", async (Guid id, IOrderService s, CancellationToken ct) => await s.GetAsync(id, ct) is { } x ? Results.Ok(x) : Results.NotFound()).Produces<OrderDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404);
orders.MapPut("/{id:guid}/assignment", async (Guid id, AssignOrderRequest r, ClaimsPrincipal p, IOrderService s, CancellationToken ct) => { var x = await s.AssignAsync(id, r, Actor(p), ct); return x.Error is null ? Results.Ok(x.Value) : OrderError(x.Error); }).RequireAuthorization(PolicyNames.UsersManage).Produces<OrderDto>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
orders.MapPost("/{id:guid}/take", async (Guid id, ClaimsPrincipal p, IOrderService s, CancellationToken ct) => { var x = await s.TakeAsync(id, Actor(p), ct); return x.Error is null ? Results.Ok(x.Value) : OrderError(x.Error); }).Produces<OrderDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
orders.MapPost("/{id:guid}/deliver", async (Guid id, ClaimsPrincipal p, IOrderService s, CancellationToken ct) => { var x = await s.DeliverAsync(id, Actor(p), ct); return x.Error is null ? Results.Ok(x.Value) : OrderError(x.Error); }).Produces<OrderDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
orders.MapPost("/{id:guid}/cancel", async (Guid id, CancelOrderRequest r, ClaimsPrincipal p, IOrderService s, CancellationToken ct) => { var x = await s.CancelAsync(id, r, Actor(p), ct); return x.Error is null ? Results.Ok(x.Value) : OrderError(x.Error); }).Produces<OrderDto>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
var kitchen = catalog.MapGroup("/kitchen/commands").RequireAuthorization(PolicyNames.KitchenAccess);
kitchen.MapGet("", async (IKitchenCommandService s, int page = 1, int pageSize = 10, KitchenCommandStatus? status = null, CancellationToken ct = default) => page < 1 || pageSize is < 1 or > 100 ? Results.ValidationProblem(new Dictionary<string, string[]> { ["paging"] = ["page must be 1 and pageSize must be 1-100"] }) : Results.Ok(await s.ListAsync(page, pageSize, status, ct))).Produces<PagedResponse<KitchenCommandDto>>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403);
kitchen.MapGet("/{id:guid}", async (Guid id, IKitchenCommandService s, CancellationToken ct) => await s.GetAsync(id, ct) is { } x ? Results.Ok(x) : Results.NotFound()).Produces<KitchenCommandDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404);
kitchen.MapPost("/{id:guid}/start", async (Guid id, ClaimsPrincipal p, IKitchenCommandService s, CancellationToken ct) => { var x = await s.StartAsync(id, Actor(p), ct); return x.Error is null ? Results.Ok(x.Value) : OrderError(x.Error); }).RequireAuthorization(PolicyNames.KitchenManage).Produces<KitchenCommandDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
kitchen.MapPost("/{id:guid}/ready", async (Guid id, ClaimsPrincipal p, IKitchenCommandService s, CancellationToken ct) => { var x = await s.ReadyAsync(id, Actor(p), ct); return x.Error is null ? Results.Ok(x.Value) : OrderError(x.Error); }).RequireAuthorization(PolicyNames.KitchenManage).Produces<KitchenCommandDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
kitchen.MapPost("/{id:guid}/cancel", async (Guid id, CancelOrderRequest r, ClaimsPrincipal p, IKitchenCommandService s, CancellationToken ct) => { var x = await s.CancelAsync(id, r, Actor(p), ct); return x.Error is null ? Results.Ok(x.Value) : OrderError(x.Error); }).RequireAuthorization(PolicyNames.KitchenManage).Produces<KitchenCommandDto>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
app.MapOperations(); app.MapHub<AttendanceHub>("/hubs/attendance").RequireAuthorization(PolicyNames.AttendanceHubAccess); app.MapHub<KitchenHub>("/hubs/kitchen").RequireAuthorization(PolicyNames.KitchenHubAccess); app.Run();
static CookieOptions CookieOptions(HttpContext context) => new() { HttpOnly = true, SameSite = SameSiteMode.Strict, Path = "/api/v1/auth", Secure = !context.RequestServices.GetRequiredService<IHostEnvironment>().IsDevelopment() };
static void SetCookie(HttpContext context, string token) => context.Response.Cookies.Append("refreshToken", token, CookieOptions(context));
public partial class Program { }
