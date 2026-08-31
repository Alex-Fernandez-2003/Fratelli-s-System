using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerSaleSnapshots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerCiSnapshot",
                schema: "public",
                table: "sales",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CustomerId",
                schema: "public",
                table: "sales",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerNameSnapshot",
                schema: "public",
                table: "sales",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerNitSnapshot",
                schema: "public",
                table: "sales",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "customers",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Ci = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Nit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedByUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_customers", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_sales_CustomerId",
                schema: "public",
                table: "sales",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "UX_customers_ci",
                schema: "public",
                table: "customers",
                column: "Ci",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_customers_nit_not_null",
                schema: "public",
                table: "customers",
                column: "Nit",
                unique: true,
                filter: "\"Nit\" IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_sales_customers_CustomerId",
                schema: "public",
                table: "sales",
                column: "CustomerId",
                principalSchema: "public",
                principalTable: "customers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_sales_customers_CustomerId",
                schema: "public",
                table: "sales");

            migrationBuilder.DropTable(
                name: "customers",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_sales_CustomerId",
                schema: "public",
                table: "sales");

            migrationBuilder.DropColumn(
                name: "CustomerCiSnapshot",
                schema: "public",
                table: "sales");

            migrationBuilder.DropColumn(
                name: "CustomerId",
                schema: "public",
                table: "sales");

            migrationBuilder.DropColumn(
                name: "CustomerNameSnapshot",
                schema: "public",
                table: "sales");

            migrationBuilder.DropColumn(
                name: "CustomerNitSnapshot",
                schema: "public",
                table: "sales");
        }
    }
}
