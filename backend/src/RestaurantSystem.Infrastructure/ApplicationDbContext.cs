using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RestaurantSystem.Domain.Catalog;
using RestaurantSystem.Domain.Identity;
using RestaurantSystem.Domain.Suppliers;
using RestaurantSystem.Domain.Attendance;
using RestaurantSystem.Domain.Orders;
using RestaurantSystem.Domain.Inventory;
using RestaurantSystem.Domain.Expenses;
using RestaurantSystem.Infrastructure.Catalog;
using RestaurantSystem.Domain.Operations;

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
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<KitchenCommand> KitchenCommands => Set<KitchenCommand>();
    public DbSet<KitchenCommandItem> KitchenCommandItems => Set<KitchenCommandItem>();
    public DbSet<InventoryBalance> InventoryBalances => Set<InventoryBalance>();
    public DbSet<InventoryMovement> InventoryMovements => Set<InventoryMovement>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<ProductComposition> ProductCompositions => Set<ProductComposition>(); public DbSet<Production> Productions => Set<Production>(); public DbSet<ProductionConsumption> ProductionConsumptions => Set<ProductionConsumption>(); public DbSet<CashSession> CashSessions => Set<CashSession>(); public DbSet<Shift> Shifts => Set<Shift>(); public DbSet<ShiftAssignment> ShiftAssignments => Set<ShiftAssignment>(); public DbSet<Sale> Sales => Set<Sale>(); public DbSet<SaleItem> SaleItems => Set<SaleItem>(); public DbSet<Purchase> Purchases => Set<Purchase>(); public DbSet<PurchaseItem> PurchaseItems => Set<PurchaseItem>(); public DbSet<PurchaseReceipt> PurchaseReceipts => Set<PurchaseReceipt>(); public DbSet<PurchaseReceiptLine> PurchaseReceiptLines => Set<PurchaseReceiptLine>();

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
            entity.ToTable("Products", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.Name).IsRequired(); entity.Property(x => x.IsSellable).HasDefaultValue(false); entity.Property(x => x.SalePrice).HasPrecision(18, 2); entity.Property(x => x.MinStock).HasPrecision(18, 3); entity.Property(x => x.CreatedAt).HasColumnType("timestamp with time zone"); entity.Property(x => x.UpdatedAt).HasColumnType("timestamp with time zone"); entity.Property(x => x.CreatedByUserId).IsRequired(); entity.Property(x => x.UpdatedByUserId).IsRequired();
            entity.HasIndex(x => x.CategoryId); entity.HasIndex(x => x.InventoryUnitId);
            entity.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.InventoryUnit).WithMany().HasForeignKey(x => x.InventoryUnitId).OnDelete(DeleteBehavior.Restrict);
        });
            builder.Entity<Order>(entity =>
            {
                entity.ToTable("orders", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.Id).HasColumnName("id"); entity.Property(x => x.ShiftId).HasColumnName("shift_id"); entity.Property(x => x.WaiterEmployeeId).HasColumnName("waiter_employee_id"); entity.Property(x => x.Status).HasColumnName("status").HasConversion<string>().IsRequired(); entity.Property(x => x.TableReference).HasColumnName("table_reference").HasMaxLength(50); entity.Property(x => x.Notes).HasColumnName("notes").HasMaxLength(500); entity.Property(x => x.CancellationReason).HasColumnName("cancellation_reason").HasMaxLength(500); entity.Property(x => x.CreatedByUserId).HasColumnName("created_by_user_id"); entity.Property(x => x.UpdatedByUserId).HasColumnName("updated_by_user_id"); entity.Property(x => x.CancelledByUserId).HasColumnName("cancelled_by_user_id");
                entity.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone"); entity.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone"); entity.Property(x => x.CancelledAt).HasColumnName("cancelled_at").HasColumnType("timestamp with time zone"); entity.Property(x => x.StockShortageAcknowledgedAt).HasColumnName("stock_shortage_acknowledged_at").HasColumnType("timestamp with time zone"); entity.Property(x => x.StockShortageAcknowledgedByUserId).HasColumnName("stock_shortage_acknowledged_by_user_id");
                entity.HasIndex(x => x.Status); entity.HasIndex(x => x.CreatedAt); entity.HasIndex(x => x.WaiterEmployeeId);
                entity.HasCheckConstraint("CK_orders_status", "status IN ('PENDIENTE','EN_PREPARACION','LISTO','ENTREGADO','CANCELADO')");
                entity.HasOne<Employee>().WithMany().HasForeignKey(x => x.WaiterEmployeeId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.CreatedByUserId).HasPrincipalKey(x => x.Id).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.UpdatedByUserId).HasPrincipalKey(x => x.Id).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.CancelledByUserId).HasPrincipalKey(x => x.Id).OnDelete(DeleteBehavior.Restrict); entity.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.StockShortageAcknowledgedByUserId).HasPrincipalKey(x => x.Id).OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<OrderItem>(entity =>
            {
                entity.ToTable("order_items", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.Id).HasColumnName("id"); entity.Property(x => x.OrderId).HasColumnName("order_id"); entity.Property(x => x.ProductId).HasColumnName("product_id"); entity.Property(x => x.Quantity).HasColumnName("quantity").HasPrecision(14, 4); entity.Property(x => x.UnitPrice).HasColumnName("unit_price").HasPrecision(18, 2); entity.Property(x => x.Notes).HasColumnName("notes").HasMaxLength(300); entity.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
                entity.HasIndex(x => new { x.OrderId, x.ProductId }).IsUnique(); entity.HasIndex(x => x.ProductId); entity.HasCheckConstraint("CK_order_items_quantity", "quantity > 0"); entity.HasCheckConstraint("CK_order_items_unit_price", "unit_price >= 0");
                entity.HasOne(x => x.Order).WithMany(x => x.Items).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Restrict); entity.HasOne<Product>().WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<KitchenCommand>(entity =>
            {
                entity.ToTable("kitchen_commands", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.Id).HasColumnName("id"); entity.Property(x => x.OrderId).HasColumnName("order_id"); entity.Property(x => x.Status).HasColumnName("status").HasConversion<string>().IsRequired(); entity.Property(x => x.UpdatedByUserId).HasColumnName("updated_by_user_id"); entity.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone"); entity.Property(x => x.StartedAt).HasColumnName("started_at").HasColumnType("timestamp with time zone"); entity.Property(x => x.ReadyAt).HasColumnName("ready_at").HasColumnType("timestamp with time zone"); entity.Property(x => x.CancelledAt).HasColumnName("cancelled_at").HasColumnType("timestamp with time zone");
                entity.HasIndex(x => x.OrderId).IsUnique(); entity.HasIndex(x => x.Status); entity.HasIndex(x => x.CreatedAt); entity.HasCheckConstraint("CK_kitchen_commands_status", "status IN ('PENDIENTE','EN_PREPARACION','LISTA','CANCELADA')");
                entity.HasOne(x => x.Order).WithOne(x => x.KitchenCommand).HasForeignKey<KitchenCommand>(x => x.OrderId).OnDelete(DeleteBehavior.Restrict); entity.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.UpdatedByUserId).HasPrincipalKey(x => x.Id).OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<KitchenCommandItem>(entity =>
            {
                entity.ToTable("kitchen_command_items", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.Id).HasColumnName("id"); entity.Property(x => x.KitchenCommandId).HasColumnName("kitchen_command_id"); entity.Property(x => x.OrderItemId).HasColumnName("order_item_id"); entity.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone"); entity.HasIndex(x => new { x.KitchenCommandId, x.OrderItemId }).IsUnique();
                entity.HasOne(x => x.KitchenCommand).WithMany(x => x.Items).HasForeignKey(x => x.KitchenCommandId).OnDelete(DeleteBehavior.Restrict); entity.HasOne(x => x.OrderItem).WithMany().HasForeignKey(x => x.OrderItemId).OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<Supplier>(entity =>
        {
            entity.ToTable("Suppliers", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.Name).IsRequired(); entity.Property(x => x.PhoneNumber).IsRequired();
            entity.Property(x => x.CreatedAt).HasColumnType("timestamp with time zone"); entity.Property(x => x.UpdatedAt).HasColumnType("timestamp with time zone"); entity.Property(x => x.CreatedByUserId).IsRequired(); entity.Property(x => x.UpdatedByUserId).IsRequired();
        });
            builder.Entity<InventoryBalance>(entity =>
            {
                entity.ToTable("inventory_balances", "public"); entity.HasKey(x => x.ProductId); entity.Property(x => x.ProductId).HasColumnName("product_id"); entity.Property(x => x.Quantity).HasColumnName("quantity").HasPrecision(14, 4); entity.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");
                entity.HasOne<Product>().WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<InventoryMovement>(entity =>
            {
                entity.ToTable("inventory_movements", "public", table => { table.HasCheckConstraint("CK_inventory_movements_quantity_delta", "quantity_delta <> 0"); table.HasCheckConstraint("CK_inventory_movements_type", "movement_type IN ('ENTRY','SALE','PRODUCTION_CONSUMPTION','PRODUCTION_OUTPUT','PURCHASE_RECEIPT','WRITE_OFF','ADJUSTMENT')"); }); entity.HasKey(x => x.Id); entity.Property(x => x.Id).HasColumnName("id"); entity.Property(x => x.ProductId).HasColumnName("product_id"); entity.Property(x => x.MovementType).HasColumnName("movement_type").HasConversion<string>(); entity.Property(x => x.QuantityDelta).HasColumnName("quantity_delta").HasPrecision(14, 4); entity.Property(x => x.Reason).HasColumnName("reason").HasMaxLength(500); entity.Property(x => x.ReferenceType).HasColumnName("reference_type").HasConversion<string>(); entity.Property(x => x.ReferenceId).HasColumnName("reference_id"); entity.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone"); entity.Property(x => x.CreatedByUserId).HasColumnName("created_by_user_id").IsRequired();
                entity.HasIndex(x => new { x.ProductId, x.CreatedAt }); entity.HasIndex(x => x.CreatedAt);
                entity.HasOne<Product>().WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict); entity.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.CreatedByUserId).HasPrincipalKey(x => x.Id).OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<ExpenseCategory>(entity =>
            {
                entity.ToTable("expense_categories", "public"); entity.HasKey(x => x.Id); entity.Property(x => x.Id).HasColumnName("id"); entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired(); entity.Property(x => x.IsActive).HasColumnName("is_active"); entity.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone"); entity.HasIndex(x => x.Name);
            });
            builder.Entity<Expense>(entity =>
            {
                entity.ToTable("expenses", "public", table => { table.HasCheckConstraint("CK_expenses_amount", "amount > 0"); table.HasCheckConstraint("CK_expenses_cash_source", "cash_source IN ('PETTY_CASH','CASH_DRAWER')"); }); entity.HasKey(x => x.Id); entity.Property(x => x.Id).HasColumnName("id"); entity.Property(x => x.ShiftId).HasColumnName("shift_id"); entity.Property(x => x.ExpenseCategoryId).HasColumnName("expense_category_id"); entity.Property(x => x.Amount).HasColumnName("amount").HasPrecision(12, 2); entity.Property(x => x.CashSource).HasColumnName("cash_source").HasConversion<string>(); entity.Property(x => x.Description).HasColumnName("description").HasMaxLength(500).IsRequired(); entity.Property(x => x.ExpenseDate).HasColumnName("expense_date"); entity.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone"); entity.Property(x => x.CreatedByUserId).HasColumnName("created_by_user_id").IsRequired();
                entity.HasIndex(x => x.ExpenseCategoryId); entity.HasIndex(x => x.ShiftId); entity.HasOne<Shift>().WithMany().HasForeignKey(x => x.ShiftId).OnDelete(DeleteBehavior.Restrict); entity.HasOne<ExpenseCategory>().WithMany().HasForeignKey(x => x.ExpenseCategoryId).OnDelete(DeleteBehavior.Restrict); entity.HasOne<IdentityUser>().WithMany().HasForeignKey(x => x.CreatedByUserId).HasPrincipalKey(x => x.Id).OnDelete(DeleteBehavior.Restrict);
            });
            builder.Entity<ProductComposition>(e => { e.ToTable("product_compositions","public"); e.HasKey(x=>x.Id); e.Property(x=>x.QuantityPerOutputUnit).HasPrecision(14,4); e.HasIndex(x=>new{x.ParentProductId,x.ComponentProductId}).IsUnique(); e.HasCheckConstraint("CK_composition_quantity","\"QuantityPerOutputUnit\" > 0"); e.HasOne<Product>().WithMany().HasForeignKey(x=>x.ParentProductId).OnDelete(DeleteBehavior.Restrict); e.HasOne<Product>().WithMany().HasForeignKey(x=>x.ComponentProductId).OnDelete(DeleteBehavior.Restrict); e.HasOne<Unit>().WithMany().HasForeignKey(x=>x.UnitId).OnDelete(DeleteBehavior.Restrict); });
            builder.Entity<Production>(e => { e.ToTable("productions","public"); e.HasKey(x=>x.Id); e.Property(x=>x.QuantityProduced).HasPrecision(14,4); e.HasCheckConstraint("CK_productions_quantity","\"QuantityProduced\" > 0"); e.HasIndex(x=>new{x.ProductId,x.ProducedAt}); e.HasOne<Product>().WithMany().HasForeignKey(x=>x.ProductId).OnDelete(DeleteBehavior.Restrict); });
            builder.Entity<ProductionConsumption>(e => { e.ToTable("production_consumptions","public"); e.HasKey(x=>x.Id); e.Property(x=>x.QuantityConsumed).HasPrecision(14,4); e.HasIndex(x=>new{x.ProductionId,x.ComponentProductId}).IsUnique(); e.HasOne<Production>().WithMany(x=>x.Consumptions).HasForeignKey(x=>x.ProductionId).OnDelete(DeleteBehavior.Restrict); });
            builder.Entity<CashSession>(e => { e.ToTable("cash_sessions","public"); e.HasKey(x=>x.Id); e.HasIndex(x=>x.BusinessDate).IsUnique(); }); builder.Entity<Shift>(e=> { e.ToTable("shifts","public"); e.HasKey(x=>x.Id); e.Property(x=>x.Type).HasConversion<string>(); e.Property(x=>x.Status).HasConversion<string>(); e.HasIndex(x=>new{x.CashSessionId,x.Type}).IsUnique(); e.HasOne<CashSession>().WithMany(x=>x.Shifts).HasForeignKey(x=>x.CashSessionId).OnDelete(DeleteBehavior.Restrict); }); builder.Entity<ShiftAssignment>(e=>{e.ToTable("shift_assignments","public");e.HasKey(x=>x.Id);e.HasIndex(x=>new{x.ShiftId,x.EmployeeId}).IsUnique();e.HasOne<Shift>().WithMany(x=>x.Assignments).HasForeignKey(x=>x.ShiftId).OnDelete(DeleteBehavior.Restrict);e.HasOne<Employee>().WithMany().HasForeignKey(x=>x.EmployeeId).OnDelete(DeleteBehavior.Restrict);});
            builder.Entity<Sale>(e=>{e.ToTable("sales","public");e.HasKey(x=>x.Id);e.Property(x=>x.SalesChannel).HasConversion<string>();e.Property(x=>x.PaymentMethod).HasConversion<string>();e.Property(x=>x.Subtotal).HasPrecision(12,2);e.Property(x=>x.Total).HasPrecision(12,2);e.HasIndex(x=>x.OrderId).IsUnique();e.HasOne<Shift>().WithMany().HasForeignKey(x=>x.ShiftId).OnDelete(DeleteBehavior.Restrict);});builder.Entity<SaleItem>(e=>{e.ToTable("sale_items","public");e.HasKey(x=>x.Id);e.Property(x=>x.Quantity).HasPrecision(14,4);e.Property(x=>x.UnitPrice).HasPrecision(12,2);e.Property(x=>x.LineTotal).HasPrecision(12,2);e.HasIndex(x=>new{x.SaleId,x.OrderItemId}).IsUnique();e.HasOne<Sale>().WithMany(x=>x.Items).HasForeignKey(x=>x.SaleId).OnDelete(DeleteBehavior.Restrict);});
            builder.Entity<Purchase>(e=>{e.ToTable("purchases","public");e.HasKey(x=>x.Id);e.Property(x=>x.Status).HasConversion<string>();e.Property(x=>x.Total).HasPrecision(12,2);e.HasOne<Supplier>().WithMany().HasForeignKey(x=>x.SupplierId).OnDelete(DeleteBehavior.Restrict);});builder.Entity<PurchaseItem>(e=>{e.ToTable("purchase_items","public");e.HasKey(x=>x.Id);e.Property(x=>x.Quantity).HasPrecision(14,4);e.Property(x=>x.UnitCost).HasPrecision(12,2);e.Property(x=>x.LineTotal).HasPrecision(12,2);e.HasOne<Purchase>().WithMany(x=>x.Items).HasForeignKey(x=>x.PurchaseId).OnDelete(DeleteBehavior.Restrict);});builder.Entity<PurchaseReceipt>(e=>{e.ToTable("purchase_receipts","public");e.HasKey(x=>x.Id);e.HasIndex(x=>x.PurchaseId).IsUnique();e.HasOne<Purchase>().WithMany().HasForeignKey(x=>x.PurchaseId).OnDelete(DeleteBehavior.Restrict);});builder.Entity<PurchaseReceiptLine>(e=>{e.ToTable("purchase_receipt_lines","public");e.HasKey(x=>x.Id);e.Property(x=>x.ReceivedQuantity).HasPrecision(14,4);e.HasIndex(x=>new{x.PurchaseReceiptId,x.PurchaseItemId}).IsUnique();e.HasOne<PurchaseReceipt>().WithMany(x=>x.Lines).HasForeignKey(x=>x.PurchaseReceiptId).OnDelete(DeleteBehavior.Restrict);});
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
