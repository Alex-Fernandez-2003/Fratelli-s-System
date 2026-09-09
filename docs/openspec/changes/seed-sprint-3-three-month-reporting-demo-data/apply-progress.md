# Apply Progress — Seed Sprint 3 three-month reporting demo data

## Estado actual

- **Change:** `seed-sprint-3-three-month-reporting-demo-data`
- **Fase:** APPLY bloqueado en el preflight de contratos Block 5.
- **Tareas OpenSpec:** `1/30` completada; Tasks 2–30 permanecen pendientes.
- **Migration creada:** ninguna.
- **Database update aplicado:** ninguno por este change.
- **Product code cambiado:** ninguno.
- **Frontend/generated API/dependencies cambiados:** ninguno.
- **Git delivery/destructive operations:** ninguna.

## Baseline local factual

| Campo | Resultado |
| --- | --- |
| Branch | `develop` |
| HEAD | `c474b657255a2f005cc9e920da67d09461219485` |
| Upstream | `origin/develop` en el mismo commit al inicio de esta fase |
| Working tree | Solo artifacts del change: `proposal.md` modificado; `design.md`, `spec.md` y `tasks.md` no trackeados al inicio |
| Staged changes | Ninguno |
| Latest migration | `20260901124421_AddComprehensiveDemoData` |
| Migration count | 15 |
| Model drift | `dotnet ef migrations has-pending-model-changes --no-build --configuration Release`: **PASS**, sin cambios de modelo |

El primer intento de los comandos EF sin `--no-build` encontró los binarios Debug bloqueados por un proceso `RestaurantSystem.Api` activo. No se terminó ese proceso ni se alteró el entorno. La repetición read-only sobre los binarios Release (`--no-build --configuration Release`) obtuvo la lista completa de migrations y el resultado de modelo limpio.

## Existing demo seed audit

`AddComprehensiveDemoData` es la migration previa que debe permanecer intacta. Su gate actual es:

```sql
IF current_database() = 'restaurant_system' THEN ... END IF;
```

Sus fechas de `CashSession`/`CashClosing` reservadas son:

- `2026-07-20`
- `2026-07-22`
- `2026-07-24`
- `2026-07-26`
- `2026-07-28`

La nueva migration no puede crear una segunda `CashSession` en esas fechas, agregar Sales/Expenses a esos días ni eliminar/modificar filas de esa migration. La nueva ownership namespace y el conjunto exacto de IDs siguen sin congelarse porque APPLY no puede comenzar antes de resolver Block 5.

## Integration-test contamination audit

- `backend/tests/RestaurantSystem.IntegrationTests/UnitTest1.cs` usa `PostgreSqlContainer` con PostgreSQL `16-alpine`.
- `PostgresFixture.MigrateAsync` aplica todas las migrations.
- Las suites que necesitan una base independiente generan nombres únicos (`users_*`, `catalog_*`, etc.).
- La base por defecto del container no es `restaurant_system`; por tanto, el gate de demo existente evita insertar las filas demo en las bases de test.
- El resultado es **riesgo MEDIUM hasta validar la migration**, con estrategia candidata **LOW** si la nueva seed reutiliza exactamente el gate aprobado y se prueba una base demo aislada con nombre `restaurant_system`.
- No se debilitaron assertions ni se ejecutó una migration nueva.

## Revalidación de contratos Block 5

La dependencia declarada por el change sigue **NO RESUELTA**. La documentación archivada que afirma backend completo no sustituye al source local, y el source local no contiene los contratos finales exigidos por esta seed.

### HU-029 — Sales Report

Evidencia local:

- `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs` registra `GET /api/v1/reports/sales` únicamente con `from` y `to`.
- `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` define `SalesReportDto` sin parámetros/resultado de Shift o Channel.
- `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs` filtra `SalesReportAsync` usando `Sale.ConfirmedAt`, aunque el change exige semántica final por `CashSession.BusinessDate`.
- No existe en el contrato local la matriz final de filtros MORNING/NIGHT, DIRECT/PEDIDOSYA y sus combinaciones requerida por Tasks 12/22.

**Estado:** `BLOCKED — final HU-029 Shift/Channel/BusinessDate contract absent or unreconciled`.

### HU-030 — Inventory Report

Evidencia local:

- `GET /api/v1/reports/inventory` no recibe filtros ni scope explícito.
- `InventoryReportAsync` consulta todo `Products + InventoryBalances` sin una política/scope COCINA final.
- `Program.cs` actualmente permite `MESERO` dentro de `InventoryRead`, mientras la spec del seed exige resolver explícitamente la autorización de HU-030 y no concederla por ese camino.
- No existe una decisión/contrato local definitivo que establezca el universo permitido para COCINA.

**Estado:** `BLOCKED — final HU-030 role/scope contract absent or unreconciled`.

### HU-031 — Attendance Report

Evidencia local:

- `GET /api/v1/reports/attendance` acepta solo `from`, `to` y `employeeId`; no existe filtro `ShiftType` final.
- `AttendanceReportAsync` agrega únicamente `AttendanceRecords` y devuelve `LateCount = 0` y `AbsenceCount = 0` para cada Employee.
- No incorpora `ShiftAssignments` como fuente de ausencias derivadas.
- La `AttendanceDerivationService` existe, pero el report service local no la utiliza.
- El DTO local no expone el summary global requerido por el change.

**Estado:** `BLOCKED — final HU-031 Shift/absence/summary derivation contract absent or unreconciled`.

## Decisión de seguridad

No se crea la migration ni se ejecuta APPLY parcial. Sembrar contra estos contratos provisionales permitiría declarar falsamente cobertura de filtros, COCINA, ausencias y summaries, además de congelar un dataset que después podría resultar incompatible con el contrato Block 5 definitivo. Esto contradiría explícitamente:

`APPLY_DEPENDS_ON_BLOCK_5_BACKEND_RECONCILIATION`

## Reanudación requerida

Para continuar APPLY se necesita una de estas condiciones, expresamente autorizada y aplicada en el working tree:

1. **Reconciliar Block 5** para que el source local contenga los contratos finales de HU-029/HU-030/HU-031, luego revalidar baseline y continuar desde Task 2.
2. **Revisar explícitamente el OpenSpec** para aceptar los contratos provisionales actuales, incluyendo sus limitaciones, antes de crear cualquier migration.

No se eligió ni se inventó ninguna de las dos alternativas durante esta sesión.

## Post-merge revalidation note — 2026-09-02

The historical baseline above is retained as recorded. A read-only revalidation of the current post-merge checkout found branch `develop`, HEAD `64a1f9095a7b672bd1e6b6d811deeaa994278344`, tracking `origin/develop`, and the same 15-migration chain. Tasks 1–5 are now complete in the audit record (`5/30`); Tasks 6–30 remain pending. No migration was created, no database update was applied, and no product/source/frontend/generated/dependency file was changed. The Block 5 reconciliation dependency remains an explicit APPLY gate; this note does not authorize APPLY.

The prior `AddComprehensiveDemoData` ownership audit found fixed UUID prefixes/counts: `a0000000` Users 4, `b0000000` Employees 4, `c1111111` Customers 10, `d2222222` Suppliers 4, `f4444444` expense categories 4, `e3333333` Products 20 and inventory balances 20 keyed by Product ID, `f6666666` inventory movements 20, `a4444444` compositions 6, `a8888888` cash sessions 5 / shifts 10 / closings 5, `b9999999` assignments 10, `c5555555` productions 12, `c5555556` production consumptions 26, `d6666666` purchases 10, `d6666667` purchase items 15, `e7777777` receipts 6, `e7777778` receipt lines 10, `aaaaaaaa` orders 25 plus order items 25 with second group `1000`, `bbbbbbbb` sales 25 plus sale items 25 with second group `1000`, `c9999999` expenses 10, and `d8888888` attendance records 8.

Reserved prior `CashSession`/`CashClosing` BusinessDates remain exactly `2026-07-20`, `2026-07-22`, `2026-07-24`, `2026-07-26`, and `2026-07-28`. The target window `2026-06-01..2026-08-31` is 92 dates, leaving 87 non-reserved dates; the new seed must add no September operational records. Existing prior shift/closing raw timestamps include `2026-09-01`; this is retained historical data and a documentation discrepancy, not a new-seed date.

Stable reusable masters are Categories `10000000-...001..011`, Units `20000000-...001..005`, and WorkSchedules `0f1674a3-1a07-4e70-b40e-343c8119e001..002` (`MORNING` 08:00–12:00 and `NIGHT` 18:00–22:00, tolerance 10). Existing gated Users/Employees may serve as FK actors. Prior temporal Customers/Suppliers/expense categories/Products/Compositions dated `2026-08-20..24` are not the June master universe; new pre-period master rows must be migration-owned. No `CAJERO`, plaintext passwords, role inserts, or reuse of prior operational ownership is permitted.

Integration-test contamination is **LOW observed / MEDIUM residual**: the PostgreSQL 16 Testcontainers fixture migrates via EF, serializes its collection, uses random scenario database suffixes for isolated tests, does not configure `restaurant_system`, and no exact `restaurant_system` test database or reset/drop path was found. The residual risk is a future fixture pointing at the exact database-name gate; preserve the gate and verify it at APPLY.

The current read-only UUID scan found 330 unique UUIDs / 1,684 occurrences / 23 prefixes in migration sources plus `CatalogSeeds.cs`, and 344 unique UUIDs / 1,755 occurrences / 30 prefixes in the wider auditable source/docs scope. Exact `f7777777` matches were zero. Reserve the deterministic layout `f7777777-EEEE-DDDD-8000-SSSSSSSSSSSS` for the new migration: fixed entity discriminator, `DDDD=0000` for masters or date index 1–92 (`1 + days since 2026-06-01`) for temporal rows, and fixed sequence. Re-run collision and natural-key/reserved-date preflight immediately before APPLY. No runtime randomness, wall-clock timestamp, SQL `random()`/`NOW()`/`CURRENT_TIMESTAMP`, or optional UUID extension is allowed.

## Allowed edit surfaces

- `docs/openspec/changes/seed-sprint-3-three-month-reporting-demo-data/tasks.md`
- `docs/openspec/changes/seed-sprint-3-three-month-reporting-demo-data/apply-progress.md`

<!-- APPLY_ARTIFACT_END: apply-progress -->
