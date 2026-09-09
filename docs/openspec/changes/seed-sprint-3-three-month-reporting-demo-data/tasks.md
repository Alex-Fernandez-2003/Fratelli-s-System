# Tasks

## Task 1: Auditar la baseline local de migrations y reportes

- Objective:
  - [x] Registrar branch, HEAD, working tree, latest migration, schema/model actual, report contracts finales y estado de Block 5.
- Files or areas likely involved:
  Git read-only; actual migrations directory; ApplicationDbContext/configurations; report endpoint/service areas; generated API; OpenSpec Block 5; integration-test setup.
- Execution notes:
  No crear migration todavía. Identificar exactamente HU-029 Shift/Channel/BusinessDate, HU-030 scope y HU-031 Shift/late/absence/summary.
- Verification method:
  Baseline factual con `SUPPORTED`, `GAP`, `ACTIVE-OPENSPEC-ONLY` y exact evidence.
- Dependencies:
  None.

## Task 2: Auditar la seed existente y reservar ownership

- Objective:
  - [x] Inventariar todas las filas/IDs/BusinessDates garantizados por migrations previas y reservar un namespace determinista nuevo para esta migration.
- Files or areas likely involved:
  Existing demo/data migrations; docs demo dataset; Catalog seed definitions.
- Execution notes:
  Identificar previous-seed CashSessions/Closings y master-data timestamps. No modificar filas previas.
- Verification method:
  Matriz:
  - previous owned IDs;
  - previous owned BusinessDates;
  - reusable master rows;
  - non-reusable temporal rows;
  - new namespace collision check.
- Dependencies:
  Task 1.

## Task 3: Auditar contaminación de integration tests

- Objective:
  - [x] Determinar exactamente cómo integration tests crean/reset/migran la base y si la estrategia de database-name gating existente sigue siendo segura.
- Files or areas likely involved:
  Integration test fixtures; Testcontainers/database setup; existing demo migration.
- Execution notes:
  No debilitar tests. Reusar gating solo si es convención vigente.
- Verification method:
  Clasificar contamination risk LOW/MEDIUM/HIGH y documentar el mecanismo de aislamiento.
- Dependencies:
  Tasks 1-2.

## Task 4: Congelar el modelo determinista de IDs, fechas y variación

- Objective:
  - [x] Definir el namespace UUID, funciones deterministas de date/entity/sequence y perfiles month/weekday/Shift/Channel/Payment.
- Files or areas likely involved:
  Migration design/OpenSpec; future migration SQL.
- Execution notes:
  Sin randomness, Guid.NewGuid, NOW o extensiones UUID opcionales. Congelar golden IDs/dates.
- Verification method:
  Mismos inputs producen los mismos IDs/count decisions en un test/design fixture reproducible.
- Dependencies:
  Task 2.

## Task 5: Reconciliar master data propio y reutilizable

- Objective:
  - [x] Determinar qué Users/Employees/Products/Customers/Suppliers/Categories/Units/ExpenseCategories/Compositions se reutilizan y cuáles debe poseer esta migration.
- Files or areas likely involved:
  Existing migrations; entity configurations; future migration SQL.
- Execution notes:
  Evitar reutilizar master data con timestamps temporalmente imposibles para junio. Reusar Categories/Units estables cuando aplique.
- Verification method:
  Cada master FK usado por operaciones de junio-agosto está garantizado y cronológicamente razonable.
- Dependencies:
  Tasks 1-4.

## Task 6: Crear el scaffold EF de la única migration data-only

- Objective:
  - [ ] Crear mediante el comando EF real del repositorio el scaffold `SeedSprint3ThreeMonthReportingDemoData` o nombre local equivalente.
- Files or areas likely involved:
  Actual Infrastructure migrations area; generated migration designer; ModelSnapshot metadata.
- Execution notes:
  Esta tarea pertenece al FUTURO APPLY. Confirmar que no existe model/schema diff antes de authoring Up/Down.
- Verification method:
  Scaffold generado correctamente y ModelSnapshot sin cambio semántico.
- Dependencies:
  Tasks 1-5 y `APPLY_DEPENDS_ON_BLOCK_5_BACKEND_RECONCILIATION` resuelta.

## Task 7: Implementar preflight y seed ownership guard

- Objective:
  - [ ] Añadir al futuro `Up` comprobaciones de namespace/conflictos y el gate demo establecido cuando localmente corresponda.
- Files or areas likely involved:
  New migration `Up`.
- Execution notes:
  Fail-fast ante datos no-owned que hagan imposible el dataset determinista. No overwrite.
- Verification method:
  Conflict fixture falla transaccionalmente y baseline permitido continúa.
- Dependencies:
  Task 6.

## Task 8: Sembrar master data reporting-owned requerido

- Objective:
  - [ ] Insertar de forma determinista los Users/Employees/Customers/Suppliers/Products/ExpenseCategories/Compositions adicionales realmente necesarios.
- Files or areas likely involved:
  New migration `Up`.
- Execution notes:
  Fechas fijas pre-período cuando el modelo tenga timestamps. CI/NIT y otras uniques deben ser collision-safe.
- Verification method:
  FK/unique queries y owned-ID checks.
- Dependencies:
  Tasks 5-7.

## Task 9: Sembrar CashSessions y Shifts de fechas no cubiertas

- Objective:
  - [ ] Crear CashSessions y MORNING/NIGHT Shifts para cada BusinessDate no cubierto por una seed anterior.
- Files or areas likely involved:
  New migration `Up`.
- Execution notes:
  Objetivo combinado 92 BusinessDates. Excluir exactamente las fechas previas auditadas. Nada en septiembre.
- Verification method:
  92 fechas objetivo representadas; max una CashSession por BusinessDate; no duplicate Shift type.
- Dependencies:
  Tasks 7-8.

## Task 10: Sembrar ShiftAssignments y Attendance source data

- Objective:
  - [ ] Crear assignments y AttendanceRecords cerrados con personas deterministas de puntualidad, lateness, absence y horas variadas.
- Files or areas likely involved:
  New migration `Up`.
- Execution notes:
  Ausencia = assignment sin valid CheckIn cuando el backend final la derive así. No hardcoded report analytics. Incluir golden attendance case.
- Verification method:
  No invalid timestamp/open records; ambos Shifts; exact tolerance/+1 golden cases según contrato final.
- Dependencies:
  Task 9 y final HU-031 reconciliation.

## Task 11: Sembrar Customers y perfil de Orders/Sales

- Objective:
  - [ ] Generar Orders, OrderItems, Sales y SaleItems con demanda mensual/semanal no uniforme y customer reuse.
- Files or areas likely involved:
  New migration `Up`.
- Execution notes:
  Respetar Order state real, Shift, totals, null customer, repeat customers y deterministic weighted product mix.
- Verification method:
  Sale totals == line totals; all required FKs/states valid; monthly sale counts meaningful.
- Dependencies:
  Tasks 8-9 y final HU-029 reconciliation.

## Task 12: Garantizar Payment/Channel/Shift coverage de Sales

- Objective:
  - [ ] Aplicar las funciones deterministas independientes para MORNING/NIGHT, DIRECT/PEDIDOSYA y CASH/QR/EXTERNAL.
- Files or areas likely involved:
  Sales seed SQL/CTEs.
- Execution notes:
  No PEDIDOSYA→EXTERNAL coupling. Crear golden Sales day con todas las dimensiones requeridas.
- Verification method:
  Coverage queries por month/Shift/Channel/Payment y combinaciones.
- Dependencies:
  Task 11.

## Task 13: Sembrar Expenses coherentes con caja

- Objective:
  - [ ] Generar Expenses variados en CASH_DRAWER y PETTY_CASH durante junio-agosto.
- Files or areas likely involved:
  New migration `Up`.
- Execution notes:
  No insertar cash-impacting expenses sobre prior-seed closed dates. Las mismas rows serán fuente de CashClosing.
- Verification method:
  Ambos cash sources presentes cada período relevante; montos >0 y FKs válidas.
- Dependencies:
  Tasks 8-9.

## Task 14: Sembrar Purchases y Purchase Receipts

- Objective:
  - [ ] Generar replenishment determinista distribuido, con mayoría RECEIVED y variantes permitidas de PENDING/CANCELLED.
- Files or areas likely involved:
  New migration `Up`.
- Execution notes:
  Receipt/receipt lines solo cuando status/contrato lo permita. No inventory effect para cancelled.
- Verification method:
  Purchase status/receipt/inventory linkage queries.
- Dependencies:
  Task 8.

## Task 15: Sembrar Production y consumos históricos

- Objective:
  - [ ] Generar Production/ProductionConsumption distribuida, con BatchCode determinista y stock suficiente.
- Files or areas likely involved:
  New migration `Up`.
- Execution notes:
  Derivar requirements desde compositions auditadas. Replenish first. No ingredientes negativos si dominio lo prohíbe.
- Verification method:
  Production quantities/consumption/units/Batches/FKs correctos y no impossible consumption.
- Dependencies:
  Tasks 8, 14.

## Task 16: Construir el ledger de InventoryMovements

- Objective:
  - [ ] Generar las InventoryMovements canónicas para opening/replenishment/production/sales según el persistence design real.
- Files or areas likely involved:
  New migration `Up`; audited inventory persistence model.
- Execution notes:
  No double application. Usar tipos/source references reales.
- Verification method:
  Cada movement posee source/reference válido y quantity delta permitido.
- Dependencies:
  Tasks 11, 14-15.

## Task 17: Derivar InventoryBalances y golden end states

- Objective:
  - [ ] Construir los final balances desde el mismo ledger y garantizar ejemplos NORMAL/LOW/NEGATIVE.
- Files or areas likely involved:
  New migration `Up`.
- Execution notes:
  No clamp. No arbitrary disconnected balance overwrite. Elegir golden items según flujo real que permita negative stock.
- Verification method:
  Balance/ledger reconciliation + exact status de los tres golden IDs.
- Dependencies:
  Task 16.

## Task 18: Derivar handover y CashClosings

- Objective:
  - [ ] Calcular handover y CashClosing snapshots desde las Sales/Expenses/openings/removals del mismo BusinessDate.
- Files or areas likely involved:
  New migration `Up`.
- Execution notes:
  Usar fórmula backend real auditada. No double carried-forward. Distribuir balanced/surplus/shortage y observations válidas.
- Verification method:
  Recompute invariant de expectedCash y difference para todos los owned closings o un conjunto exhaustivo equivalente.
- Dependencies:
  Tasks 9, 11-13 y final cash formula audit.

## Task 19: Implementar Down exacto y reversible

- Objective:
  - [ ] Eliminar exclusivamente rows de este migration namespace en reverse FK order.
- Files or areas likely involved:
  New migration `Down`.
- Execution notes:
  No date-range-only delete, no truncate, no previous-seed cleanup.
- Verification method:
  Down elimina 100% de owned IDs y 0 rows de previous/manual fixtures.
- Dependencies:
  Tasks 7-18.

## Task 20: Añadir invariant verification del dataset

- Objective:
  - [ ] Preparar queries/tests para FK, uniques, no September, counts/diversity, Sale totals, inventory, attendance y cash.
- Files or areas likely involved:
  Migration/integration verification tests or scripts according to repo convention.
- Execution notes:
  Usar golden cases para assertions exactas y distribution checks para el resto.
- Verification method:
  Todos los invariants normativos pasan.
- Dependencies:
  Tasks 10-19.

## Task 21: Validar HU-028 sobre el dataset

- Objective:
  - [ ] Verificar cierre history para June/July/August y los tres estados de diferencia.
- Files or areas likely involved:
  Existing HU-028 backend/service/integration test surface; no product edits.
- Execution notes:
  Validar persisted snapshots y golden closings.
- Verification method:
  June/July/August >0; balanced/surplus/shortage golden results correctos.
- Dependencies:
  Tasks 18-20.

## Task 22: Validar HU-029 con matriz completa de filtros

- Objective:
  - [ ] Verificar months, full period, MORNING/NIGHT, DIRECT/PEDIDOSYA y las cuatro combinaciones Shift+Channel.
- Files or areas likely involved:
  Final Sales Report integration/service endpoint tests.
- Execution notes:
  Verificar CASH/QR/EXTERNAL, trend y BusinessDate coherence. No ejecutar contra contrato provisional.
- Verification method:
  Todas las combinaciones requeridas producen datos coherentes y summary/series/channel comparten universo.
- Dependencies:
  Tasks 11-12, 20 y Block 5 final HU-029 contract.

## Task 23: Validar HU-030 y COCINA scope

- Objective:
  - [ ] Verificar summary/statuses finales y dataset significativo para COCINA bajo policy/scope backend definitivo.
- Files or areas likely involved:
  Final Inventory Report integration/service tests.
- Execution notes:
  No frontend filtering. Confirmar golden NORMAL/LOW/NEGATIVE.
- Verification method:
  counts >0 donde corresponde, tres golden statuses exactos y COCINA data significativa si autorizada.
- Dependencies:
  Tasks 16-17, 20 y final HU-030 role reconciliation.

## Task 24: Validar HU-031 analytics derivados

- Objective:
  - [ ] Verificar periods, Employee, MORNING/NIGHT, lateness, absence, workedMinutes, projectedPay y summary.
- Files or areas likely involved:
  Final Attendance Report integration/service tests.
- Execution notes:
  Validar golden attendance day contra source assignments/records. No report totals seeded manualmente.
- Verification method:
  late >0, absence >0, workedMinutes >0, projectedPay >0 y golden Employee outcomes exactos.
- Dependencies:
  Tasks 10, 20 y Block 5 final HU-031 contract.

## Task 25: Validar toda la migration chain en clean disposable DB

- Objective:
  - [ ] Aplicar desde una base vacía todas las migrations hasta la nueva seed en un entorno seguro.
- Files or areas likely involved:
  EF/database tooling; disposable PostgreSQL environment.
- Execution notes:
  Si existe database-name gate, usar el nombre demo establecido dentro de una instancia aislada.
- Verification method:
  Migration chain exitosa + invariant/report checks.
- Dependencies:
  Tasks 19-24.

## Task 26: Validar current-baseline → seed en DB disposable

- Objective:
  - [ ] Aplicar solo la nueva migration sobre una base disposable preparada en el immediately previous migration.
- Files or areas likely involved:
  EF/database tooling.
- Execution notes:
  No usar la DB activa del desarrollador.
- Verification method:
  Up exitoso, deterministic ownership intacto y no schema drift.
- Dependencies:
  Tasks 19-20.

## Task 27: Validar Down → Up y reproducibilidad

- Objective:
  - [ ] Ejecutar en DB disposable Up, Down y segundo Up; comparar owned IDs/counts/golden cases.
- Files or areas likely involved:
  EF/database tooling; invariant queries.
- Execution notes:
  Verificar además que previous seed rows sobreviven Down.
- Verification method:
  Reaplicación produce el mismo dataset lógico y Down no elimina datos ajenos.
- Dependencies:
  Tasks 25-26.

## Task 28: Ejecutar full backend/EF gates

- Objective:
  - [ ] Ejecutar restore/build/tests/EF pending-model-check y `git diff --check` usando comandos actuales del repositorio.
- Files or areas likely involved:
  Backend solution/test infrastructure; EF tooling.
- Execution notes:
  Reportar counts reales. Si aparece client exhaustion/PostgreSQL infrastructure issue, registrarlo sin debilitar invariants.
- Verification method:
  Gates requeridos green o findings claramente clasificados; pending model changes = NONE.
- Dependencies:
  Tasks 21-27.

## Task 29: Documentar el dataset factual resultante

- Objective:
  - [ ] Crear/actualizar la documentación de demo reporting con período, ownership, counts reales, distributions, golden cases y rollback.
- Files or areas likely involved:
  Current demo dataset documentation convention; OpenSpec apply-progress.
- Execution notes:
  No inventar counts antes de APPLY. Registrar factual:
  Customers, Sales, lines, Expenses, Purchases, Receipts, Production, assignments, attendance, Sessions, Shifts, Closings, movements.
- Verification method:
  Documentación coincide con queries/verification reales.
- Dependencies:
  Task 28.

## Task 30: Preparar VERIFY nativo y cierre técnico del change

- Objective:
  - [ ] Trazar requisitos a evidencia técnica y confirmar que no existe product/schema/frontend/generated/package drift.
- Files or areas likely involved:
  OpenSpec verification artifacts.
- Execution notes:
  Confirmar:
  - determinism;
  - data-only;
  - date range;
  - no September;
  - ownership;
  - Down safety;
  - domain coherence;
  - report usefulness;
  - clean/current/down-up validation;
  - tests/docs.
    Manual UI evidence permanece deferred.
- Verification method:
  Verify report completo sin claims ficticios y con resultados reales.
- Dependencies:
  Tasks 1-29.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 800–1,800 LoC entre la migration data-only set-based, designer generado, verification/tests y documentación. El volumen final depende principalmente de la estrategia SQL real y del nivel de test existente.
- Risk of exceeding 400 LoC review threshold:
  High.
- Recommendation:
  Single PR.
- Suggested split if chained:
  No se recomienda partir la migration funcional entre PRs independientes porque ownership, Up, Down e invariants deben revisarse juntos. Para facilitar review dentro de un único PR/change, revisar por unidades:
  - baseline + ownership/design;
  - master/operations seed SQL;
  - inventory/cash derivation;
  - attendance derivation;
  - Down;
  - verification/tests/docs.

Generator verdict:

`SPRINT_3_REPORTING_SEED_OPENSPEC_READY`

Product Decisions Required:

`NONE`

Apply dependency:

`APPLY_DEPENDS_ON_BLOCK_5_BACKEND_RECONCILIATION`

Ready now:

`READY_FOR_REPORTING_SEED_APPLY: NO`

## Audit completion record — Tasks 2–5 (2026-09-02)

This record appends the read-only audit evidence. No source, migration, database, or Git state was changed.

### Task 2 — prior seed ownership and dates

The previous data-bearing migrations are `20260825035346_AddCatalog`, `20260831112909_AddEmployeeHourlyRateAndWorkScheduleSnapshots`, and `20260901124421_AddComprehensiveDemoData`. The other migrations in the 15-migration chain are schema changes or upgrade/backfill operations rather than additional fixed demo-row ownership. `AddComprehensiveDemoData` remains unchanged and its SQL gate is `current_database() = 'restaurant_system'`.

The following fixed rows are owned by `AddComprehensiveDemoData` (prefixes are UUID first groups; `same Product ID` is intentional because `InventoryBalances.ProductId` is its primary key):

| Table | Count and owned UUID prefix/range |
| --- | --- |
| `AspNetUsers` | 4, `a0000000`, suffixes `001..004` |
| `Employees` | 4, `b0000000`, suffixes `001..004` |
| `Customers` | 10, `c1111111`, suffixes `001..010` |
| `Suppliers` | 4, `d2222222`, suffixes `001..004` |
| `expense_categories` | 4, `f4444444`, suffixes `001..004` |
| `Products` | 20, `e3333333`, suffixes `001..020` |
| `inventory_balances` | 20, same Product IDs as above |
| `inventory_movements` | 20, `f6666666`, suffixes `001..020` |
| `product_compositions` | 6, `a4444444`, suffixes `001..006` |
| `cash_sessions` | 5, `a8888888`, suffixes `001..005` |
| `shifts` | 10, `a8888888`, suffixes `011..020` |
| `shift_assignments` | 10, `b9999999`, suffixes `001..010` |
| `productions` | 12, `c5555555`, suffixes `001..012` |
| `production_consumptions` | 26, `c5555556`, suffixes `001..026` |
| `purchases` | 10, `d6666666`, suffixes `001..010` |
| `purchase_items` | 15, `d6666667`, suffixes `001,002,003,005,006,007,008,009,011,012,013,015,016,017,019` |
| `purchase_receipts` | 6, `e7777777`, suffixes `001..006` |
| `purchase_receipt_lines` | 10, `e7777778`, suffixes `001..010` |
| `orders` | 25, `aaaaaaaa`, suffixes `001..025` |
| `order_items` | 25, `aaaaaaaa` with `1000` second group, suffixes `001..025` |
| `sales` | 25, `bbbbbbbb`, suffixes `001..025` |
| `sale_items` | 25, `bbbbbbbb` with `1000` second group, suffixes `001..025` |
| `expenses` | 10, `c9999999`, suffixes `001..010` |
| `cash_closings` | 5, `a8888888`, suffixes `031..035` |
| `AttendanceRecords` | 8, `d8888888`, suffixes `001..008` |

Direct prior `BusinessDate` ownership is the reserved set `{2026-07-20, 2026-07-22, 2026-07-24, 2026-07-26, 2026-07-28}` for `cash_sessions` and `cash_closings`; no new session, shift, sale, cash-impacting expense, or closing may be added to those dates. Other prior direct/derived date evidence is: purchases `{2026-07-20, 07-22, 07-24, 08-20, 08-21, 08-22, 08-23, 08-24, 08-26, 08-29}`; attendance BusinessDates `{07-20, 07-22, 07-24, 08-20, 08-21, 08-22}`; production timestamps `{07-22, 08-21, 08-22, 08-23, 08-24, 08-26}`; inventory movement timestamps `{07-20, 07-22, 07-24, 08-20, 08-21, 08-22, 08-23, 08-24, 08-26}`. Prior order/sale timestamps include `{07-20, 07-22, 07-24, 07-26, 07-28, 08-20, 08-21, 08-22, 08-23, 08-24, 08-26}`, while their report BusinessDate resolves through `Sale → Shift → CashSession` to the five reserved July dates. Existing raw shift/closing timestamps also include `2026-09-01`; this is a prior-data documentation discrepancy, not permission to add September rows. The new seed owns only `2026-06-01..2026-08-31` inclusive (92 calendar dates; 87 dates remain after the five reserved dates) and must add no September operational records.

All configured relational deletes are restrictive. The future migration therefore needs parent-first `Up` and exact-ID child-first `Down`; it must not use broad date deletes or mutate prior rows.

### Task 3 — integration-test contamination and gate

`PostgresFixture` uses one `postgres:16-alpine` Testcontainers instance, applies migrations with `Database.MigrateAsync()` or `IMigrator.MigrateAsync()`, and disables xUnit collection parallelization. The fixture does not call `WithDatabase("restaurant_system")`; observed isolated test databases use scenario prefixes plus `Guid.NewGuid().ToString("N")`. There are 68 `Database =` assignment sites in the integration-test sources: 66 direct prefix-plus-GUID expressions and two helper templates. No test source uses the exact `restaurant_system` name, and no `EnsureCreated`, `EnsureDeleted`, reset, drop, or fixed test database was found. Migration history records the gated migration even when its SQL body is skipped.

Observed contamination risk is **LOW**. Residual risk is **MEDIUM** because a future fixture or developer can point a test at the exact gate name; the gate is database-name-only. Preserve the exact gate, add a name/gate check during APPLY verification, and do not broaden it.

### Task 4 — deterministic namespace/date/variation freeze

The current collision scan found 330 unique UUIDs / 1,684 occurrences / 23 prefixes in migration `.cs` plus `CatalogSeeds.cs`, and 344 unique UUIDs / 1,755 occurrences / 30 prefixes in the wider auditable `backend/src`, `backend/tests`, `frontend/src`, and `docs` scope (excluding build/dependency artifacts). Exact `f7777777` matches are zero in both scans. Reserve `f7777777` for this migration, subject to an immediate pre-APPLY recheck.

The deterministic layout is `f7777777-EEEE-DDDD-8000-SSSSSSSSSSSS`: `EEEE` is a fixed entity discriminator, `DDDD` is `0000` for masters or `dateIndex` 1–92 for temporal rows (`dateIndex = 1 + days since 2026-06-01`), and `SSSSSSSSSSSS` is a fixed per-entity/per-date sequence. `InventoryBalances` reuses the owned Product UUID by schema design. Month, weekday, shift, channel, and payment choices/count decisions must be pure functions of fixed date/index/sequence inputs; timestamps are fixed or derived from the date using the `America/La_Paz` business windows. No `Guid.NewGuid`, `DateTime.Now/UtcNow`, SQL `random()`, `NOW()`, `CURRENT_TIMESTAMP`, optional UUID extension, or coupled channel/payment variation is allowed. The golden IDs/count decisions and collision preflight remain mandatory APPLY verification inputs.

### Task 5 — reusable versus migration-owned masters

Reuse the stable catalog rows from `20260825035346_AddCatalog`: Categories `10000000-0000-0000-0000-000000000001..011` and Units `20000000-0000-0000-0000-000000000001..005`. Reuse the stable schedules from `20260831112909_AddEmployeeHourlyRateAndWorkScheduleSnapshots`: `0f1674a3-1a07-4e70-b40e-343c8119e001` (`MORNING`, 08:00–12:00, tolerance 10) and `...002` (`NIGHT`, 18:00–22:00, tolerance 10); `ShiftType` is unique. Existing gated demo Users `a000...001..004` and Employees `b000...001..004` can be FK actors, but do not create `CAJERO`, plaintext passwords, role rows, or login assumptions; runtime role names are `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA`, `EMPLEADO`.

Prior Customers, Suppliers, expense categories, Products, and Compositions have `CreatedAt`/`UpdatedAt` in `2026-08-20..24` and are therefore temporal prior ownership, not the sole June master universe. The new migration should own new pre-period Customers/Suppliers/expense categories/Products/Compositions under `f7777777`, with unique customer CI/NIT and production BatchCode preflight checks, while reusing only the stable catalog/schedule rows and existing user/employee FK actors. `Down` must delete only new owned IDs and leave reused rows intact.

## Allowed edit surfaces

- `docs/openspec/changes/seed-sprint-3-three-month-reporting-demo-data/tasks.md`
- `docs/openspec/changes/seed-sprint-3-three-month-reporting-demo-data/apply-progress.md`
