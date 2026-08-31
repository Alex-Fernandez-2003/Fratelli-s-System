using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderStockShortageAcknowledgement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "stock_shortage_acknowledged_at",
                schema: "public",
                table: "orders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "stock_shortage_acknowledged_by_user_id",
                schema: "public",
                table: "orders",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_orders_stock_shortage_acknowledged_by_user_id",
                schema: "public",
                table: "orders",
                column: "stock_shortage_acknowledged_by_user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_orders_AspNetUsers_stock_shortage_acknowledged_by_user_id",
                schema: "public",
                table: "orders",
                column: "stock_shortage_acknowledged_by_user_id",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_orders_AspNetUsers_stock_shortage_acknowledged_by_user_id",
                schema: "public",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_stock_shortage_acknowledged_by_user_id",
                schema: "public",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "stock_shortage_acknowledged_at",
                schema: "public",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "stock_shortage_acknowledged_by_user_id",
                schema: "public",
                table: "orders");
        }
    }
}
