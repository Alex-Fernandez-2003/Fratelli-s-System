using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RestaurantSystem.Application.Auth;
using RestaurantSystem.Application.Catalog;
using RestaurantSystem.Infrastructure.Identity;
using RestaurantSystem.Infrastructure.Catalog;
using RestaurantSystem.Application.Suppliers;
using RestaurantSystem.Infrastructure.Suppliers;
using RestaurantSystem.Application.Attendance;
using RestaurantSystem.Infrastructure.Attendance;
using RestaurantSystem.Application.Users;
using RestaurantSystem.Infrastructure.Users;
using RestaurantSystem.Application.Orders;
using RestaurantSystem.Infrastructure.Orders;
using RestaurantSystem.Application.Inventory;
using RestaurantSystem.Infrastructure.Inventory;
using RestaurantSystem.Application.Expenses;
using RestaurantSystem.Infrastructure.Expenses;
using RestaurantSystem.Application.Operations;
using RestaurantSystem.Infrastructure.Operations;

namespace RestaurantSystem.Infrastructure;
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("RestaurantSystem") ?? throw new InvalidOperationException("Connection string 'RestaurantSystem' is required.");
        services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString, npgsql => npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));
        services.AddIdentityCore<IdentityUser>(options => { options.Lockout.AllowedForNewUsers = true; }).AddRoles<IdentityRole>().AddEntityFrameworkStores<ApplicationDbContext>().AddDefaultTokenProviders();
        services.AddScoped<ITokenService, JwtTokenService>(); services.AddScoped<IRefreshTokenService, RefreshTokenService>(); services.AddScoped<IAuthService, AuthService>(); services.AddScoped<ICatalogService, CatalogService>(); services.AddScoped<ISupplierService, SupplierService>(); services.AddSingleton<IBusinessClock, BusinessClock>(); services.AddScoped<IAttendanceService, AttendanceService>(); services.AddScoped<IUserManagementService, UserManagementService>(); services.AddSingleton<IAttendanceNotifier, SignalRAttendanceNotifier>(); services.AddSingleton<IKitchenRealtimeNotifier, SignalRKitchenRealtimeNotifier>(); services.AddScoped<IOrderService, OrderService>(); services.AddScoped<IKitchenCommandService, KitchenCommandService>(); services.AddScoped<InventoryService>(); services.AddScoped<IInventoryService>(sp => sp.GetRequiredService<InventoryService>()); services.AddScoped<IInventoryWriter>(sp => sp.GetRequiredService<InventoryService>()); services.AddScoped<IExpenseService, ExpenseService>(); services.AddScoped<IOperationsService, OperationsService>(); services.AddHostedService<DevelopmentDataSeeder>();
        return services;
    }
}