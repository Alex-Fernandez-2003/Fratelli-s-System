using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeHourlyRateAndWorkScheduleSnapshots : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
                migrationBuilder.AddColumn<int>(
                    name: "EffectiveLateToleranceMinutes",
                    schema: "public",
                    table: "shift_assignments",
                    type: "integer",
                    nullable: true);

                migrationBuilder.AddColumn<TimeOnly>(
                    name: "EffectivePlannedEnd",
                    schema: "public",
                    table: "shift_assignments",
                    type: "time without time zone",
                    nullable: true);

                migrationBuilder.AddColumn<TimeOnly>(
                    name: "EffectivePlannedStart",
                    schema: "public",
                    table: "shift_assignments",
                    type: "time without time zone",
                    nullable: true);

                migrationBuilder.AddColumn<decimal>(
                    name: "HourlyRate",
                    schema: "public",
                    table: "Employees",
                    type: "numeric(12,2)",
                    precision: 12,
                    scale: 2,
                    nullable: true);

                migrationBuilder.Sql("UPDATE public.\"Employees\" SET \"HourlyRate\" = 20.00 WHERE \"HourlyRate\" IS NULL;");
                migrationBuilder.Sql("""
                    UPDATE public.shift_assignments AS assignment
                    SET "EffectivePlannedStart" = CASE shift."Type" WHEN 'MORNING' THEN TIME '08:00' ELSE TIME '18:00' END,
                        "EffectivePlannedEnd" = CASE shift."Type" WHEN 'MORNING' THEN TIME '12:00' ELSE TIME '22:00' END,
                        "EffectiveLateToleranceMinutes" = 10
                    FROM public.shifts AS shift
                    WHERE assignment."ShiftId" = shift."Id";
                    """);

                migrationBuilder.AlterColumn<int>(name: "EffectiveLateToleranceMinutes", schema: "public", table: "shift_assignments", type: "integer", nullable: false, oldClrType: typeof(int), oldType: "integer", oldNullable: true);
                migrationBuilder.AlterColumn<TimeOnly>(name: "EffectivePlannedEnd", schema: "public", table: "shift_assignments", type: "time without time zone", nullable: false, oldClrType: typeof(TimeOnly), oldType: "time without time zone", oldNullable: true);
                migrationBuilder.AlterColumn<TimeOnly>(name: "EffectivePlannedStart", schema: "public", table: "shift_assignments", type: "time without time zone", nullable: false, oldClrType: typeof(TimeOnly), oldType: "time without time zone", oldNullable: true);
                migrationBuilder.AlterColumn<decimal>(name: "HourlyRate", schema: "public", table: "Employees", type: "numeric(12,2)", precision: 12, scale: 2, nullable: false, oldClrType: typeof(decimal), oldType: "numeric(12,2)", oldPrecision: 12, oldScale: 2, oldNullable: true);

            migrationBuilder.CreateTable(
                name: "work_schedules",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ShiftType = table.Column<string>(type: "text", nullable: false),
                    PlannedStart = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    PlannedEnd = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    LateToleranceMinutes = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_work_schedules", x => x.Id);
                    table.CheckConstraint("CK_work_schedules_late_tolerance", "\"LateToleranceMinutes\" >= 0");
                    table.CheckConstraint("CK_work_schedules_time_range", "\"PlannedStart\" <> \"PlannedEnd\"");
                });

            migrationBuilder.CreateIndex(
                name: "IX_work_schedules_ShiftType",
                schema: "public",
                table: "work_schedules",
                column: "ShiftType",
                unique: true);

            migrationBuilder.InsertData(
                schema: "public",
                table: "work_schedules",
                columns: new[] { "Id", "ShiftType", "PlannedStart", "PlannedEnd", "LateToleranceMinutes" },
                values: new object[,] { { new Guid("0f1674a3-1a07-4e70-b40e-343c8119e001"), "MORNING", new TimeOnly(8, 0), new TimeOnly(12, 0), 10 }, { new Guid("0f1674a3-1a07-4e70-b40e-343c8119e002"), "NIGHT", new TimeOnly(18, 0), new TimeOnly(22, 0), 10 } });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "work_schedules",
                schema: "public");

            migrationBuilder.DropColumn(
                name: "EffectiveLateToleranceMinutes",
                schema: "public",
                table: "shift_assignments");

            migrationBuilder.DropColumn(
                name: "EffectivePlannedEnd",
                schema: "public",
                table: "shift_assignments");

            migrationBuilder.DropColumn(
                name: "EffectivePlannedStart",
                schema: "public",
                table: "shift_assignments");

            migrationBuilder.DropColumn(
                name: "HourlyRate",
                schema: "public",
                table: "Employees");
        }
    }
}
