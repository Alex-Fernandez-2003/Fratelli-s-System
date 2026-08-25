using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.AspNetCore.Authorization;
using RestaurantSystem.Application.Auth;
using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Application.Suppliers;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Infrastructure;
using RestaurantSystem.Infrastructure.Identity;
using RestaurantSystem.Infrastructure.Attendance;

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
        foreach (var operation in path.Operations.Values)
        {
            operation.Security = [new OpenApiSecurityRequirement { [new OpenApiSecuritySchemeReference("Bearer", document, null)] = [] }];
        }
    }
    foreach (var path in new[] { "/api/v1/auth/login", "/api/v1/auth/refresh", "/api/v1/auth/logout" })
    {
        foreach (var operation in document.Paths[path].Operations.Values)
        {
            var statusCode = operation.Responses.ContainsKey("204") ? "204" : "200";
            var existingResponse = operation.Responses[statusCode];
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
    options.Events = new JwtBearerEvents { OnMessageReceived = context => { if (context.HttpContext.Request.Path.StartsWithSegments("/hubs") && context.Request.Query.TryGetValue("access_token", out var token)) context.Token = token; return Task.CompletedTask; } };
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
    options.AddPolicy(PolicyNames.AttendanceHubAccess, p => p.RequireRole(RoleNames.Administrator, RoleNames.Manager));
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
    var suppliers = catalog.MapGroup("/suppliers").RequireAuthorization(PolicyNames.SupplierRead);
    suppliers.MapGet("", async (ISupplierService s, int page = 1, int pageSize = 20, string? search = null, bool? isActive = null, CancellationToken ct = default) => Paging(page, pageSize) ? Results.Ok(await s.ListAsync(page, pageSize, search, isActive, ct)) : Results.ValidationProblem(new Dictionary<string, string[]> { ["paging"] = ["page must be 1 and pageSize must be 1-100"] })).Produces<PagedResponse<SupplierDto>>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403);
    suppliers.MapGet("/{id:guid}", async (Guid id, ISupplierService s, CancellationToken ct) => await s.GetAsync(id, ct) is { } x ? Results.Ok(x) : Results.NotFound()).Produces<SupplierDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404);
    suppliers.MapPost("", async (SupplierRequest r, ClaimsPrincipal p, ISupplierService s, CancellationToken ct) => { var x = await s.CreateAsync(r, p.FindFirstValue(ClaimTypes.NameIdentifier)!, ct); return x.Error is null ? Results.Created($"/api/v1/suppliers/{x.Value!.Id}", x.Value) : Error(x.Error); }).RequireAuthorization(PolicyNames.SupplierWrite).Produces<SupplierDto>(201).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(409);
    suppliers.MapPut("/{id:guid}", async (Guid id, SupplierRequest r, ClaimsPrincipal p, ISupplierService s, CancellationToken ct) => { var x = await s.UpdateAsync(id, r, p.FindFirstValue(ClaimTypes.NameIdentifier)!, ct); return x.Error is null ? Results.Ok(x.Value) : Error(x.Error); }).RequireAuthorization(PolicyNames.SupplierWrite).Produces<SupplierDto>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
    suppliers.MapDelete("/{id:guid}", async (Guid id, ISupplierService s, CancellationToken ct) => (await s.DeleteAsync(id, ct)) is { } error ? Error(error) : Results.NoContent()).RequireAuthorization(PolicyNames.SupplierWrite).Produces(204).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404);
static IResult AttendanceError(string error) => error == "Not found" ? Results.NotFound() : error.StartsWith("Invalid") ? Results.ValidationProblem(new Dictionary<string, string[]> { ["attendance"] = [error] }) : Results.Problem(statusCode: StatusCodes.Status409Conflict, title: error);
var attendance = catalog.MapGroup("/attendance");
attendance.MapPost("/employees/{employeeId:guid}/check-in", async (Guid employeeId, ClaimsPrincipal principal, IAttendanceService service, CancellationToken ct) => { var result = await service.CheckInAsync(employeeId, principal.FindFirstValue(ClaimTypes.NameIdentifier)!, ct); return result.Error is null ? Results.Created($"/api/v1/attendance/employees/{employeeId}", result.Value) : AttendanceError(result.Error); }).RequireAuthorization(PolicyNames.AttendanceManage).Produces<AttendanceRecordDto>(201).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
attendance.MapPost("/employees/{employeeId:guid}/check-out", async (Guid employeeId, ClaimsPrincipal principal, IAttendanceService service, CancellationToken ct) => { var result = await service.CheckOutAsync(employeeId, principal.FindFirstValue(ClaimTypes.NameIdentifier)!, ct); return result.Error is null ? Results.Ok(result.Value) : AttendanceError(result.Error); }).RequireAuthorization(PolicyNames.AttendanceManage).Produces<AttendanceRecordDto>(200).ProducesProblem(401).ProducesProblem(403).ProducesProblem(404).ProducesProblem(409);
attendance.MapGet("/employees/today", async (IAttendanceService service, CancellationToken ct) => Results.Ok(await service.TodayAsync(ct))).RequireAuthorization(PolicyNames.AttendanceManage).Produces<AttendanceTodayResponse>(200).ProducesProblem(401).ProducesProblem(403);
attendance.MapGet("/me", async (DateOnly? from, DateOnly? to, int page = 1, int pageSize = 20, ClaimsPrincipal principal = null!, IAttendanceService service = null!, CancellationToken ct = default) => { var result = await service.MineAsync(principal.FindFirstValue(ClaimTypes.NameIdentifier)!, from, to, page, pageSize, ct); return result.Error is null ? Results.Ok(result.Value) : AttendanceError(result.Error); }).RequireAuthorization(PolicyNames.AttendanceSelf).Produces<AttendancePage>(200).ProducesProblem(400).ProducesProblem(401).ProducesProblem(404);
app.MapHub<AttendanceHub>("/hubs/attendance").RequireAuthorization(PolicyNames.AttendanceHubAccess); app.Run();
static CookieOptions CookieOptions(HttpContext context) => new() { HttpOnly = true, SameSite = SameSiteMode.Strict, Path = "/api/v1/auth", Secure = !context.RequestServices.GetRequiredService<IHostEnvironment>().IsDevelopment() };
static void SetCookie(HttpContext context, string token) => context.Response.Cookies.Append("refreshToken", token, CookieOptions(context));
public partial class Program { }
