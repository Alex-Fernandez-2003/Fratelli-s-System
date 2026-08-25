using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RestaurantSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Scope = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Units",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Symbol = table.Column<string>(type: "text", nullable: false),
                    Dimension = table.Column<int>(type: "integer", nullable: false),
                    FactorToBase = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    IsBase = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Units", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ProductType = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    InventoryUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    PreparationArea = table.Column<string>(type: "text", nullable: true),
                    SalePrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    MinStock = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedByUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Products_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalSchema: "public",
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Products_Units_InventoryUnitId",
                        column: x => x.InventoryUnitId,
                        principalSchema: "public",
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                schema: "public",
                table: "Categories",
                columns: new[] { "Id", "IsActive", "Name", "Scope" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), true, "Entradas", 0 },
                    { new Guid("10000000-0000-0000-0000-000000000002"), true, "Platos principales", 0 },
                    { new Guid("10000000-0000-0000-0000-000000000003"), true, "Acompañamientos", 0 },
                    { new Guid("10000000-0000-0000-0000-000000000004"), true, "Postres", 0 },
                    { new Guid("10000000-0000-0000-0000-000000000005"), true, "Bebidas", 0 },
                    { new Guid("10000000-0000-0000-0000-000000000006"), true, "Perecederos", 1 },
                    { new Guid("10000000-0000-0000-0000-000000000007"), true, "No perecederos", 1 },
                    { new Guid("10000000-0000-0000-0000-000000000008"), true, "Bebidas e Insumos", 1 },
                    { new Guid("10000000-0000-0000-0000-000000000009"), true, "Suministros y Limpieza", 1 },
                    { new Guid("10000000-0000-0000-0000-000000000010"), true, "Salsas", 2 },
                    { new Guid("10000000-0000-0000-0000-000000000011"), true, "Masas y pastas", 2 }
                });

            migrationBuilder.InsertData(
                schema: "public",
                table: "Units",
                columns: new[] { "Id", "Code", "Dimension", "FactorToBase", "IsActive", "IsBase", "Name", "Symbol" },
                values: new object[,]
                {
                    { new Guid("20000000-0000-0000-0000-000000000001"), "g", 0, 1m, true, true, "Gramo", "g" },
                    { new Guid("20000000-0000-0000-0000-000000000002"), "kg", 0, 1000m, true, false, "Kilogramo", "kg" },
                    { new Guid("20000000-0000-0000-0000-000000000003"), "ml", 1, 1m, true, true, "Mililitro", "ml" },
                    { new Guid("20000000-0000-0000-0000-000000000004"), "l", 1, 1000m, true, false, "Litro", "l" },
                    { new Guid("20000000-0000-0000-0000-000000000005"), "unit", 2, 1m, true, true, "Unidad", "u" }
                });

            migrationBuilder.Sql("CREATE UNIQUE INDEX \"UX_Categories_Scope_Name\" ON public.\"Categories\" (\"Scope\", lower(\"Name\"));");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                schema: "public",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_InventoryUnitId",
                schema: "public",
                table: "Products",
                column: "InventoryUnitId");

            migrationBuilder.CreateIndex(
                name: "UX_Units_ActiveBase_Dimension",
                schema: "public",
                table: "Units",
                columns: new[] { "Dimension", "IsBase" },
                unique: true,
                filter: "\"IsBase\" = TRUE AND \"IsActive\" = TRUE");

            migrationBuilder.Sql("CREATE UNIQUE INDEX \"UX_Units_Code\" ON public.\"Units\" (lower(\"Code\"));");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Products",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Categories",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Units",
                schema: "public");
        }
    }
}
