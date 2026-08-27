using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantSystem.Infrastructure.Migrations;

public partial class AddOrdersKitchenBackend : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(name: "IsSellable", schema: "public", table: "Products", type: "boolean", nullable: false, defaultValue: false);
        migrationBuilder.CreateTable(name: "orders", schema: "public", columns: table => new
        {
            id = table.Column<Guid>(type: "uuid", nullable: false), shift_id = table.Column<Guid>(type: "uuid", nullable: true), waiter_employee_id = table.Column<Guid>(type: "uuid", nullable: true), table_reference = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true), status = table.Column<string>(type: "text", nullable: false), notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true), created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false), created_by_user_id = table.Column<string>(type: "text", nullable: false), updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true), updated_by_user_id = table.Column<string>(type: "text", nullable: true), cancelled_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true), cancelled_by_user_id = table.Column<string>(type: "text", nullable: true), cancellation_reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
        }, constraints: table =>
        {
            table.PrimaryKey("PK_orders", x => x.id); table.CheckConstraint("CK_orders_status", "status IN ('PENDIENTE','EN_PREPARACION','LISTO','ENTREGADO','CANCELADO')");
            table.ForeignKey("FK_orders_Employees_waiter_employee_id", x => x.waiter_employee_id, principalSchema: "public", principalTable: "Employees", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            table.ForeignKey("FK_orders_AspNetUsers_created_by_user_id", x => x.created_by_user_id, principalSchema: "identity", principalTable: "AspNetUsers", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            table.ForeignKey("FK_orders_AspNetUsers_updated_by_user_id", x => x.updated_by_user_id, principalSchema: "identity", principalTable: "AspNetUsers", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
            table.ForeignKey("FK_orders_AspNetUsers_cancelled_by_user_id", x => x.cancelled_by_user_id, principalSchema: "identity", principalTable: "AspNetUsers", principalColumn: "Id", onDelete: ReferentialAction.Restrict);
        });
        migrationBuilder.CreateTable(name: "order_items", schema: "public", columns: table => new
        {
            id = table.Column<Guid>(type: "uuid", nullable: false), order_id = table.Column<Guid>(type: "uuid", nullable: false), product_id = table.Column<Guid>(type: "uuid", nullable: false), quantity = table.Column<decimal>(type: "numeric(14,4)", precision: 14, scale: 4, nullable: false), unit_price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false), notes = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true), created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
        }, constraints: table => { table.PrimaryKey("PK_order_items", x => x.id); table.CheckConstraint("CK_order_items_quantity", "quantity > 0"); table.CheckConstraint("CK_order_items_unit_price", "unit_price >= 0"); table.ForeignKey("FK_order_items_orders_order_id", x => x.order_id, principalSchema: "public", principalTable: "orders", principalColumn: "id", onDelete: ReferentialAction.Restrict); table.ForeignKey("FK_order_items_Products_product_id", x => x.product_id, principalSchema: "public", principalTable: "Products", principalColumn: "Id", onDelete: ReferentialAction.Restrict); });
        migrationBuilder.CreateTable(name: "kitchen_commands", schema: "public", columns: table => new
        {
            id = table.Column<Guid>(type: "uuid", nullable: false), order_id = table.Column<Guid>(type: "uuid", nullable: false), status = table.Column<string>(type: "text", nullable: false), created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false), started_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true), ready_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true), cancelled_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true), updated_by_user_id = table.Column<string>(type: "text", nullable: true)
        }, constraints: table => { table.PrimaryKey("PK_kitchen_commands", x => x.id); table.CheckConstraint("CK_kitchen_commands_status", "status IN ('PENDIENTE','EN_PREPARACION','LISTA','CANCELADA')"); table.ForeignKey("FK_kitchen_commands_orders_order_id", x => x.order_id, principalSchema: "public", principalTable: "orders", principalColumn: "id", onDelete: ReferentialAction.Restrict); table.ForeignKey("FK_kitchen_commands_AspNetUsers_updated_by_user_id", x => x.updated_by_user_id, principalSchema: "identity", principalTable: "AspNetUsers", principalColumn: "Id", onDelete: ReferentialAction.Restrict); });
        migrationBuilder.CreateTable(name: "kitchen_command_items", schema: "public", columns: table => new { id = table.Column<Guid>(type: "uuid", nullable: false), kitchen_command_id = table.Column<Guid>(type: "uuid", nullable: false), order_item_id = table.Column<Guid>(type: "uuid", nullable: false), created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false) }, constraints: table => { table.PrimaryKey("PK_kitchen_command_items", x => x.id); table.ForeignKey("FK_kitchen_command_items_kitchen_commands_kitchen_command_id", x => x.kitchen_command_id, principalSchema: "public", principalTable: "kitchen_commands", principalColumn: "id", onDelete: ReferentialAction.Restrict); table.ForeignKey("FK_kitchen_command_items_order_items_order_item_id", x => x.order_item_id, principalSchema: "public", principalTable: "order_items", principalColumn: "id", onDelete: ReferentialAction.Restrict); });
        migrationBuilder.CreateIndex("IX_orders_status", "orders", "status", schema: "public"); migrationBuilder.CreateIndex("IX_orders_created_at", "orders", "created_at", schema: "public"); migrationBuilder.CreateIndex("IX_orders_waiter_employee_id", "orders", "waiter_employee_id", schema: "public");
        migrationBuilder.CreateIndex("IX_order_items_order_id_product_id", "order_items", new[] { "order_id", "product_id" }, schema: "public", unique: true); migrationBuilder.CreateIndex("IX_order_items_product_id", "order_items", "product_id", schema: "public");
        migrationBuilder.CreateIndex("IX_kitchen_commands_order_id", "kitchen_commands", "order_id", schema: "public", unique: true); migrationBuilder.CreateIndex("IX_kitchen_commands_status", "kitchen_commands", "status", schema: "public"); migrationBuilder.CreateIndex("IX_kitchen_commands_created_at", "kitchen_commands", "created_at", schema: "public");
        migrationBuilder.CreateIndex("IX_kitchen_command_items_kitchen_command_id_order_item_id", "kitchen_command_items", new[] { "kitchen_command_id", "order_item_id" }, schema: "public", unique: true);
    }
    protected override void Down(MigrationBuilder migrationBuilder)
    { migrationBuilder.DropTable(name: "kitchen_command_items", schema: "public"); migrationBuilder.DropTable(name: "kitchen_commands", schema: "public"); migrationBuilder.DropTable(name: "order_items", schema: "public"); migrationBuilder.DropTable(name: "orders", schema: "public"); migrationBuilder.DropColumn(name: "IsSellable", schema: "public", table: "Products"); }
}
