using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSprint2OperationalWorkflows : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "shift_id",
                schema: "public",
                table: "expenses",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "cash_sessions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BusinessDate = table.Column<DateOnly>(type: "date", nullable: false),
                    IsOpen = table.Column<bool>(type: "boolean", nullable: false),
                    OpenedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    OpenedByUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cash_sessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "product_compositions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityPerOutputUnit = table.Column<decimal>(type: "numeric(14,4)", precision: 14, scale: 4, nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_compositions", x => x.Id);
                    table.CheckConstraint("CK_composition_quantity", "\"QuantityPerOutputUnit\" > 0");
                    table.ForeignKey(
                        name: "FK_product_compositions_Products_ComponentProductId",
                        column: x => x.ComponentProductId,
                        principalSchema: "public",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_product_compositions_Products_ParentProductId",
                        column: x => x.ParentProductId,
                        principalSchema: "public",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_product_compositions_Units_UnitId",
                        column: x => x.UnitId,
                        principalSchema: "public",
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "productions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityProduced = table.Column<decimal>(type: "numeric(14,4)", precision: 14, scale: 4, nullable: false),
                    ResponsibleEmployeeId = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ProducedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_productions", x => x.Id);
                    table.CheckConstraint("CK_productions_quantity", "\"QuantityProduced\" > 0");
                    table.ForeignKey(
                        name: "FK_productions_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "public",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "purchases",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SupplierId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    PurchaseDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Total = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    ReceiptReference = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CancellationReason = table.Column<string>(type: "text", nullable: true),
                    CancelledAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CancelledByUserId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchases_Suppliers_SupplierId",
                        column: x => x.SupplierId,
                        principalSchema: "public",
                        principalTable: "Suppliers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "shifts",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CashSessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    StartedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    EndedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    HandoverNote = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shifts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shifts_cash_sessions_CashSessionId",
                        column: x => x.CashSessionId,
                        principalSchema: "public",
                        principalTable: "cash_sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "production_consumptions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ComponentProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityConsumed = table.Column<decimal>(type: "numeric(14,4)", precision: 14, scale: 4, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_production_consumptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_production_consumptions_productions_ProductionId",
                        column: x => x.ProductionId,
                        principalSchema: "public",
                        principalTable: "productions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "purchase_items",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(14,4)", precision: 14, scale: 4, nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    UnitCost = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    LineTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_items_purchases_PurchaseId",
                        column: x => x.PurchaseId,
                        principalSchema: "public",
                        principalTable: "purchases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "purchase_receipts",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceivedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ReceivedByUserId = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_receipts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_receipts_purchases_PurchaseId",
                        column: x => x.PurchaseId,
                        principalSchema: "public",
                        principalTable: "purchases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sales",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ShiftId = table.Column<Guid>(type: "uuid", nullable: false),
                    SalesChannel = table.Column<string>(type: "text", nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    Total = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    ConfirmedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ConfirmedByUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sales_shifts_ShiftId",
                        column: x => x.ShiftId,
                        principalSchema: "public",
                        principalTable: "shifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "shift_assignments",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ShiftId = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    AssignedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    AssignedByUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_shift_assignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_shift_assignments_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "public",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_shift_assignments_shifts_ShiftId",
                        column: x => x.ShiftId,
                        principalSchema: "public",
                        principalTable: "shifts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "purchase_receipt_lines",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseReceiptId = table.Column<Guid>(type: "uuid", nullable: false),
                    PurchaseItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceivedQuantity = table.Column<decimal>(type: "numeric(14,4)", precision: 14, scale: 4, nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_purchase_receipt_lines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_purchase_receipt_lines_purchase_receipts_PurchaseReceiptId",
                        column: x => x.PurchaseReceiptId,
                        principalSchema: "public",
                        principalTable: "purchase_receipts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sale_items",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SaleId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(14,4)", precision: 14, scale: 4, nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    LineTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sale_items", x => x.Id);
                    table.ForeignKey(
                        name: "FK_sale_items_sales_SaleId",
                        column: x => x.SaleId,
                        principalSchema: "public",
                        principalTable: "sales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_expenses_shift_id",
                schema: "public",
                table: "expenses",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "IX_cash_sessions_BusinessDate",
                schema: "public",
                table: "cash_sessions",
                column: "BusinessDate",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_product_compositions_ComponentProductId",
                schema: "public",
                table: "product_compositions",
                column: "ComponentProductId");

            migrationBuilder.CreateIndex(
                name: "IX_product_compositions_ParentProductId_ComponentProductId",
                schema: "public",
                table: "product_compositions",
                columns: new[] { "ParentProductId", "ComponentProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_product_compositions_UnitId",
                schema: "public",
                table: "product_compositions",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_production_consumptions_ProductionId_ComponentProductId",
                schema: "public",
                table: "production_consumptions",
                columns: new[] { "ProductionId", "ComponentProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_productions_ProductId_ProducedAt",
                schema: "public",
                table: "productions",
                columns: new[] { "ProductId", "ProducedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_purchase_items_PurchaseId",
                schema: "public",
                table: "purchase_items",
                column: "PurchaseId");

            migrationBuilder.CreateIndex(
                name: "IX_purchase_receipt_lines_PurchaseReceiptId_PurchaseItemId",
                schema: "public",
                table: "purchase_receipt_lines",
                columns: new[] { "PurchaseReceiptId", "PurchaseItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchase_receipts_PurchaseId",
                schema: "public",
                table: "purchase_receipts",
                column: "PurchaseId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_purchases_SupplierId",
                schema: "public",
                table: "purchases",
                column: "SupplierId");

            migrationBuilder.CreateIndex(
                name: "IX_sale_items_SaleId_OrderItemId",
                schema: "public",
                table: "sale_items",
                columns: new[] { "SaleId", "OrderItemId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sales_OrderId",
                schema: "public",
                table: "sales",
                column: "OrderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sales_ShiftId",
                schema: "public",
                table: "sales",
                column: "ShiftId");

            migrationBuilder.CreateIndex(
                name: "IX_shift_assignments_EmployeeId",
                schema: "public",
                table: "shift_assignments",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_shift_assignments_ShiftId_EmployeeId",
                schema: "public",
                table: "shift_assignments",
                columns: new[] { "ShiftId", "EmployeeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_shifts_CashSessionId_Type",
                schema: "public",
                table: "shifts",
                columns: new[] { "CashSessionId", "Type" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_expenses_shifts_shift_id",
                schema: "public",
                table: "expenses",
                column: "shift_id",
                principalSchema: "public",
                principalTable: "shifts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_expenses_shifts_shift_id",
                schema: "public",
                table: "expenses");

            migrationBuilder.DropTable(
                name: "product_compositions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "production_consumptions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "purchase_items",
                schema: "public");

            migrationBuilder.DropTable(
                name: "purchase_receipt_lines",
                schema: "public");

            migrationBuilder.DropTable(
                name: "sale_items",
                schema: "public");

            migrationBuilder.DropTable(
                name: "shift_assignments",
                schema: "public");

            migrationBuilder.DropTable(
                name: "productions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "purchase_receipts",
                schema: "public");

            migrationBuilder.DropTable(
                name: "sales",
                schema: "public");

            migrationBuilder.DropTable(
                name: "purchases",
                schema: "public");

            migrationBuilder.DropTable(
                name: "shifts",
                schema: "public");

            migrationBuilder.DropTable(
                name: "cash_sessions",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_expenses_shift_id",
                schema: "public",
                table: "expenses");

            migrationBuilder.DropColumn(
                name: "shift_id",
                schema: "public",
                table: "expenses");
        }
    }
}
