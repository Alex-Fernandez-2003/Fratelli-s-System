using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Identity;
using RestaurantSystem.Domain.Suppliers;
using RestaurantSystem.Domain.Attendance;
using RestaurantSystem.Infrastructure.Catalog;

namespace RestaurantSystem.Infrastructure;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.HasDefaultSchema("identity");
            builder.Entity<IdentityUser>(entity =>
            {
                entity.Property<bool>("IsActive").HasDefaultValue(true);
                entity.Property<string?>("CreatedByUserId");
                entity.Property<string?>("UpdatedByUserId");
            });
        builder.Entity<Employee>(entity =>
        {
            entity.ToTable("Employees", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.UserId).IsRequired(); entity.Property(x => x.FullName).IsRequired();
            entity.HasIndex(x => x.UserId).IsUnique();
            entity.HasOne<IdentityUser>().WithOne().HasForeignKey<Employee>(x => x.UserId).HasPrincipalKey<IdentityUser>(x => x.Id).OnDelete(DeleteBehavior.Restrict);
        });
        builder.Entity<UserSession>(entity =>
        {
            entity.ToTable("UserSessions", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.UserId).IsRequired(); entity.Property(x => x.RefreshTokenHash).IsRequired();
            entity.HasIndex(x => x.RefreshTokenHash).IsUnique(); entity.HasIndex(x => x.UserId);
            entity.HasOne<IdentityUser>().WithMany().HasForeignKey(nameof(UserSession.UserId)).HasPrincipalKey(nameof(IdentityUser.Id)).OnDelete(DeleteBehavior.Restrict);
        });
        builder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.Name).IsRequired();
            entity.HasIndex(x => new { x.Scope, x.Name }).IsUnique().HasDatabaseName("UX_Categories_Scope_Name");
            entity.HasData(CatalogSeeds.Categories);
        });
        builder.Entity<Unit>(entity =>
        {
            entity.ToTable("Units", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.Code).IsRequired(); entity.Property(x => x.Name).IsRequired(); entity.Property(x => x.Symbol).IsRequired(); entity.Property(x => x.FactorToBase).HasPrecision(18, 6);
            entity.HasIndex(x => x.Code).IsUnique().HasDatabaseName("UX_Units_Code");
            entity.HasIndex(x => new { x.Dimension, x.IsBase }).IsUnique().HasFilter("\"IsBase\" = TRUE AND \"IsActive\" = TRUE").HasDatabaseName("UX_Units_ActiveBase_Dimension");
            entity.HasData(CatalogSeeds.Units);
        });
        builder.Entity<Product>(entity =>
        {
            entity.ToTable("Products", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.Name).IsRequired(); entity.Property(x => x.SalePrice).HasPrecision(18, 2); entity.Property(x => x.MinStock).HasPrecision(18, 3); entity.Property(x => x.CreatedAt).HasColumnType("timestamp with time zone"); entity.Property(x => x.UpdatedAt).HasColumnType("timestamp with time zone"); entity.Property(x => x.CreatedByUserId).IsRequired(); entity.Property(x => x.UpdatedByUserId).IsRequired();
            entity.HasIndex(x => x.CategoryId); entity.HasIndex(x => x.InventoryUnitId);
            entity.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.InventoryUnit).WithMany().HasForeignKey(x => x.InventoryUnitId).OnDelete(DeleteBehavior.Restrict);
        });
        builder.Entity<Supplier>(entity =>
        {
            entity.ToTable("Suppliers", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.Name).IsRequired(); entity.Property(x => x.PhoneNumber).IsRequired();
            entity.Property(x => x.CreatedAt).HasColumnType("timestamp with time zone"); entity.Property(x => x.UpdatedAt).HasColumnType("timestamp with time zone"); entity.Property(x => x.CreatedByUserId).IsRequired(); entity.Property(x => x.UpdatedByUserId).IsRequired();
        });
        builder.Entity<AttendanceRecord>(entity =>
        {
            entity.ToTable("AttendanceRecords", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.CheckInByUserId).IsRequired();
            entity.Property(x => x.CheckInAt).HasColumnType("timestamp with time zone"); entity.Property(x => x.CheckOutAt).HasColumnType("timestamp with time zone");
            entity.HasIndex(x => x.EmployeeId).IsUnique().HasFilter("\"CheckOutAt\" IS NULL").HasDatabaseName("UX_AttendanceRecords_Employee_Open");
            entity.HasIndex(x => new { x.EmployeeId, x.BusinessDate });
            entity.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.CheckInByUserId).HasPrincipalKey(x => x.Id).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.CheckOutByUserId).HasPrincipalKey(x => x.Id).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
