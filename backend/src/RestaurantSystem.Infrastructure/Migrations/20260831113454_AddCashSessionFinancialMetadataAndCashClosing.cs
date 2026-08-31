using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCashSessionFinancialMetadataAndCashClosing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CashAmountCarriedForward",
                schema: "public",
                table: "cash_sessions",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CashRemovedAmount",
                schema: "public",
                table: "cash_sessions",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "OpeningAmount",
                schema: "public",
                table: "cash_sessions",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PettyCashOpeningAmount",
                schema: "public",
                table: "cash_sessions",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "cash_closings",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CashSessionId = table.Column<Guid>(type: "uuid", nullable: false),
                    BusinessDate = table.Column<DateOnly>(type: "date", nullable: false),
                    OpeningAmount = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    PettyCashOpeningAmount = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    CashRemovedAmount = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    SalesTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    CashSalesTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    QrSalesTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    ExternalSalesTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    DirectSalesTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    PedidosYaSalesTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    CashDrawerExpensesTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    PettyCashExpensesTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    ExpensesTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    ExpectedCash = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    DeclaredCash = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    Difference = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    Observation = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ClosedByUserId = table.Column<string>(type: "text", nullable: false),
                    ClosedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cash_closings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_cash_closings_AspNetUsers_ClosedByUserId",
                        column: x => x.ClosedByUserId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_cash_closings_cash_sessions_CashSessionId",
                        column: x => x.CashSessionId,
                        principalSchema: "public",
                        principalTable: "cash_sessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_cash_closings_BusinessDate",
                schema: "public",
                table: "cash_closings",
                column: "BusinessDate");

            migrationBuilder.CreateIndex(
                name: "IX_cash_closings_CashSessionId",
                schema: "public",
                table: "cash_closings",
                column: "CashSessionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_cash_closings_ClosedByUserId",
                schema: "public",
                table: "cash_closings",
                column: "ClosedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cash_closings",
                schema: "public");

            migrationBuilder.DropColumn(
                name: "CashAmountCarriedForward",
                schema: "public",
                table: "cash_sessions");

            migrationBuilder.DropColumn(
                name: "CashRemovedAmount",
                schema: "public",
                table: "cash_sessions");

            migrationBuilder.DropColumn(
                name: "OpeningAmount",
                schema: "public",
                table: "cash_sessions");

            migrationBuilder.DropColumn(
                name: "PettyCashOpeningAmount",
                schema: "public",
                table: "cash_sessions");
        }
    }
}
