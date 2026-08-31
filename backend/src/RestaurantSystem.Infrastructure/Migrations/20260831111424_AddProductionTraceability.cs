using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RestaurantSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductionTraceability : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
                migrationBuilder.AddColumn<string>(
                    name: "BatchCode",
                    schema: "public",
                    table: "productions",
                    type: "character varying(40)",
                    maxLength: 40,
                    nullable: true);

                migrationBuilder.AddColumn<string>(
                    name: "Status",
                    schema: "public",
                    table: "productions",
                    type: "character varying(20)",
                    maxLength: 20,
                    nullable: true);

                migrationBuilder.Sql("""
                    UPDATE public.productions
                    SET "BatchCode" = 'PRD-' || replace("Id"::text, '-', ''),
                        "Status" = 'COMPLETED';
                    """);

                migrationBuilder.AlterColumn<string>(
                    name: "BatchCode",
                    schema: "public",
                    table: "productions",
                    type: "character varying(40)",
                    maxLength: 40,
                    nullable: false,
                    oldClrType: typeof(string),
                    oldType: "character varying(40)",
                    oldMaxLength: 40,
                    oldNullable: true);

                migrationBuilder.AlterColumn<string>(
                    name: "Status",
                    schema: "public",
                    table: "productions",
                    type: "character varying(20)",
                    maxLength: 20,
                    nullable: false,
                    oldClrType: typeof(string),
                    oldType: "character varying(20)",
                    oldMaxLength: 20,
                    oldNullable: true);

                migrationBuilder.CreateIndex(
                name: "UX_productions_batch_code",
                schema: "public",
                table: "productions",
                column: "BatchCode",
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_productions_status",
                schema: "public",
                table: "productions",
                sql: "\"Status\" IN ('COMPLETED')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_productions_batch_code",
                schema: "public",
                table: "productions");

            migrationBuilder.DropCheckConstraint(
                name: "CK_productions_status",
                schema: "public",
                table: "productions");

            migrationBuilder.DropColumn(
                name: "BatchCode",
                schema: "public",
                table: "productions");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "public",
                table: "productions");
        }
    }
}
