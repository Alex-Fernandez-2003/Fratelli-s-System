using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace RestaurantSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProduction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecords_AspNetUsers_CheckInByUserId",
                schema: "public",
                table: "AttendanceRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecords_AspNetUsers_CheckOutByUserId",
                schema: "public",
                table: "AttendanceRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceRecords_Employees_EmployeeId",
                schema: "public",
                table: "AttendanceRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_Employees_AspNetUsers_UserId",
                schema: "public",
                table: "Employees");

            migrationBuilder.DropForeignKey(
                name: "FK_UserSessions_AspNetUsers_UserId",
                schema: "public",
                table: "UserSessions");

            migrationBuilder.DropIndex(
                name: "IX_UserSessions_RefreshTokenHash",
                schema: "public",
                table: "UserSessions");

            migrationBuilder.DropIndex(
                name: "IX_UserSessions_UserId",
                schema: "public",
                table: "UserSessions");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_CheckInByUserId",
                schema: "public",
                table: "AttendanceRecords");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_CheckOutByUserId",
                schema: "public",
                table: "AttendanceRecords");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_EmployeeId_BusinessDate",
                schema: "public",
                table: "AttendanceRecords");

            migrationBuilder.DropIndex(
                name: "UX_AttendanceRecords_Employee_Open",
                schema: "public",
                table: "AttendanceRecords");

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000007"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000008"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000009"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000010"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000011"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Units",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Units",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Units",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Units",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                schema: "public",
                table: "Units",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"));

            migrationBuilder.DropColumn(
                name: "IsActive",
                schema: "identity",
                table: "AspNetUsers");

            migrationBuilder.RenameIndex(
                name: "UX_Units_Code",
                schema: "public",
                table: "Units",
                newName: "IX_Units_Code");

            migrationBuilder.RenameIndex(
                name: "UX_Units_ActiveBase_Dimension",
                schema: "public",
                table: "Units",
                newName: "IX_Units_Dimension_IsBase");

            migrationBuilder.RenameIndex(
                name: "UX_Categories_Scope_Name",
                schema: "public",
                table: "Categories",
                newName: "IX_Categories_Scope_Name");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                schema: "public",
                table: "UserSessions",
                type: "character varying(450)",
                maxLength: 450,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "RefreshTokenHash",
                schema: "public",
                table: "UserSessions",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Symbol",
                schema: "public",
                table: "Units",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "Units",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                schema: "public",
                table: "Units",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                schema: "public",
                table: "Suppliers",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "public",
                table: "Suppliers",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "Suppliers",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                schema: "public",
                table: "Suppliers",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PreparationArea",
                schema: "public",
                table: "Products",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "Products",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                schema: "public",
                table: "Employees",
                type: "character varying(450)",
                maxLength: 450,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                schema: "public",
                table: "Employees",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "Categories",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "CheckOutByUserId",
                schema: "public",
                table: "AttendanceRecords",
                type: "character varying(450)",
                maxLength: 450,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CheckInByUserId",
                schema: "public",
                table: "AttendanceRecords",
                type: "character varying(450)",
                maxLength: 450,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "Recipes",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    YieldQuantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    YieldUnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Instructions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedByUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recipes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recipes_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "public",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Recipes_Units_YieldUnitId",
                        column: x => x.YieldUnitId,
                        principalSchema: "public",
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductionBatches",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BatchNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RecipeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlannedQuantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    ActualQuantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CompletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedByUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionBatches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductionBatches_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "public",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductionBatches_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalSchema: "public",
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductionBatches_Units_UnitId",
                        column: x => x.UnitId,
                        principalSchema: "public",
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecipeIngredients",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipeId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecipeIngredients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecipeIngredients_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "public",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecipeIngredients_Recipes_RecipeId",
                        column: x => x.RecipeId,
                        principalSchema: "public",
                        principalTable: "Recipes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecipeIngredients_Units_UnitId",
                        column: x => x.UnitId,
                        principalSchema: "public",
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductionBatchIngredients",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductionBatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    PlannedQuantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    ActualQuantity = table.Column<decimal>(type: "numeric(18,3)", precision: 18, scale: 3, nullable: false),
                    UnitId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionBatchIngredients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductionBatchIngredients_ProductionBatches_ProductionBatc~",
                        column: x => x.ProductionBatchId,
                        principalSchema: "public",
                        principalTable: "ProductionBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductionBatchIngredients_Products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "public",
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProductionBatchIngredients_Units_UnitId",
                        column: x => x.UnitId,
                        principalSchema: "public",
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_EmployeeId_BusinessDate",
                schema: "public",
                table: "AttendanceRecords",
                columns: new[] { "EmployeeId", "BusinessDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_BatchNumber",
                schema: "public",
                table: "ProductionBatches",
                column: "BatchNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_CreatedAt",
                schema: "public",
                table: "ProductionBatches",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_ProductId",
                schema: "public",
                table: "ProductionBatches",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_RecipeId",
                schema: "public",
                table: "ProductionBatches",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_Status",
                schema: "public",
                table: "ProductionBatches",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatches_UnitId",
                schema: "public",
                table: "ProductionBatches",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatchIngredients_ProductId",
                schema: "public",
                table: "ProductionBatchIngredients",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatchIngredients_ProductionBatchId",
                schema: "public",
                table: "ProductionBatchIngredients",
                column: "ProductionBatchId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionBatchIngredients_UnitId",
                schema: "public",
                table: "ProductionBatchIngredients",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeIngredients_ProductId",
                schema: "public",
                table: "RecipeIngredients",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeIngredients_RecipeId",
                schema: "public",
                table: "RecipeIngredients",
                column: "RecipeId");

            migrationBuilder.CreateIndex(
                name: "IX_RecipeIngredients_UnitId",
                schema: "public",
                table: "RecipeIngredients",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_ProductId",
                schema: "public",
                table: "Recipes",
                column: "ProductId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_YieldUnitId",
                schema: "public",
                table: "Recipes",
                column: "YieldUnitId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductionBatchIngredients",
                schema: "public");

            migrationBuilder.DropTable(
                name: "RecipeIngredients",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ProductionBatches",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Recipes",
                schema: "public");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceRecords_EmployeeId_BusinessDate",
                schema: "public",
                table: "AttendanceRecords");

            migrationBuilder.RenameIndex(
                name: "IX_Units_Dimension_IsBase",
                schema: "public",
                table: "Units",
                newName: "UX_Units_ActiveBase_Dimension");

            migrationBuilder.RenameIndex(
                name: "IX_Units_Code",
                schema: "public",
                table: "Units",
                newName: "UX_Units_Code");

            migrationBuilder.RenameIndex(
                name: "IX_Categories_Scope_Name",
                schema: "public",
                table: "Categories",
                newName: "UX_Categories_Scope_Name");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                schema: "public",
                table: "UserSessions",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(450)",
                oldMaxLength: 450);

            migrationBuilder.AlterColumn<string>(
                name: "RefreshTokenHash",
                schema: "public",
                table: "UserSessions",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "Symbol",
                schema: "public",
                table: "Units",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "Units",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                schema: "public",
                table: "Units",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                schema: "public",
                table: "Suppliers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                schema: "public",
                table: "Suppliers",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "Suppliers",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                schema: "public",
                table: "Suppliers",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PreparationArea",
                schema: "public",
                table: "Products",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "Products",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                schema: "public",
                table: "Employees",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(450)",
                oldMaxLength: 450);

            migrationBuilder.AlterColumn<string>(
                name: "FullName",
                schema: "public",
                table: "Employees",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(150)",
                oldMaxLength: 150);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                schema: "public",
                table: "Categories",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "CheckOutByUserId",
                schema: "public",
                table: "AttendanceRecords",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(450)",
                oldMaxLength: 450,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CheckInByUserId",
                schema: "public",
                table: "AttendanceRecords",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(450)",
                oldMaxLength: 450);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                schema: "identity",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_RefreshTokenHash",
                schema: "public",
                table: "UserSessions",
                column: "RefreshTokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserSessions_UserId",
                schema: "public",
                table: "UserSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_CheckInByUserId",
                schema: "public",
                table: "AttendanceRecords",
                column: "CheckInByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_CheckOutByUserId",
                schema: "public",
                table: "AttendanceRecords",
                column: "CheckOutByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_EmployeeId_BusinessDate",
                schema: "public",
                table: "AttendanceRecords",
                columns: new[] { "EmployeeId", "BusinessDate" });

            migrationBuilder.CreateIndex(
                name: "UX_AttendanceRecords_Employee_Open",
                schema: "public",
                table: "AttendanceRecords",
                column: "EmployeeId",
                unique: true,
                filter: "\"CheckOutAt\" IS NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecords_AspNetUsers_CheckInByUserId",
                schema: "public",
                table: "AttendanceRecords",
                column: "CheckInByUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecords_AspNetUsers_CheckOutByUserId",
                schema: "public",
                table: "AttendanceRecords",
                column: "CheckOutByUserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceRecords_Employees_EmployeeId",
                schema: "public",
                table: "AttendanceRecords",
                column: "EmployeeId",
                principalSchema: "public",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_AspNetUsers_UserId",
                schema: "public",
                table: "Employees",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserSessions_AspNetUsers_UserId",
                schema: "public",
                table: "UserSessions",
                column: "UserId",
                principalSchema: "identity",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
