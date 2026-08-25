using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AttendanceRecords",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmployeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    BusinessDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CheckInAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CheckInByUserId = table.Column<string>(type: "text", nullable: false),
                    CheckOutAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CheckOutByUserId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_AspNetUsers_CheckInByUserId",
                        column: x => x.CheckInByUserId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_AspNetUsers_CheckOutByUserId",
                        column: x => x.CheckOutByUserId,
                        principalSchema: "identity",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalSchema: "public",
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttendanceRecords",
                schema: "public");
        }
    }
}
