# Tasks

## Task 1: Revalidar baseline local, contratos y dependencias

- Objective:
  - [x] Auditar branch, HEAD, working tree, OpenSpec state, package/lockfile, report endpoints, policies, generated TypeScript, current frontend architecture y scripts reales sin modificar producto.
- Files or areas likely involved:
  Git read-only; backend report endpoints/services/policies; generated API; package manifest/lockfile; routing/navigation; current histories; report-related docs.
- Execution notes:
  Preservar cualquier trabajo uncommitted de bloques anteriores. Registrar HU-029/HU-030/HU-031 contract matrices exactas y disponibilidad real de PDF/XLSX/charts.
- Verification method:
  Baseline factual + CONTRACT_USAGE_MATRIX + dependency matrix con hashes/HEAD únicamente si realmente se obtienen localmente.
- Dependencies:
  None.

## Task 2: Resolver los gaps CORE antes de APPLY

- Objective:
  - [x] Determinar si los gaps HU-029/HU-031 detectados remotamente existen también en el working tree local y resolver la decisión de alcance si persisten.
- Files or areas involved:
  OpenSpec artifacts; backend/generated contract inspection; authorized report backend scope.
- Execution notes:
  La auditoría local confirmó los gaps y una autorización explícita habilitó únicamente la reconciliación backend de HU-029/HU-031. HU-030 no se amplió ni se estrechó; su drift de `InventoryRead` queda reportado. La implementación no toca frontend feature code, HU-028/cash, schema, entidades o migrations; el cliente generado se refresca solo mediante `pnpm run api:generate`.
- Verification method:
  Cada gap quedó marcado `SUPPORTED_LOCAL` o `PRODUCT_DECISION_REQUIRED` con evidencia exacta. Los gaps HU-029/HU-031 quedaron `SUPPORTED_LOCAL`; la decisión de producto conserva el drift de roles HU-030 sin modificar `InventoryRead`.
- Dependencies:
  Task 1.

## Task 2A: Aplicar reconciliación backend autorizada

- Objective:
  - [x] Implementar filtros server-side, semántica BusinessDate, derivaciones de asistencia y summary global únicamente en los endpoints backend autorizados.
- Files or areas involved:
  `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs`; `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs`; `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs`.
- Execution notes:
  HU-029 ahora acepta `from/to/shiftType/salesChannel` y calcula aggregates/series sobre el mismo universo unido por `CashSession.BusinessDate`. HU-031 ahora acepta `from/to/employeeId/shiftType`, reutiliza `AttendanceDerivationService` y `PayrollProjectionCalculator`, y expone `AttendanceReportSummaryDto`.
- Verification method:
  `dotnet build backend/RestaurantSystem.slnx --no-restore` succeeded; focused PostgreSQL coverage and targeted attendance/operations regressions passed. `pnpm run api:generate` refreshed the generated TypeScript client from runtime OpenAPI without manual edits.
- Dependencies:
  Task 2.

## Task 3: Definir capabilities, rutas y navegación de Reportes

- Objective:
  - [x] Implementar las tres rutas, `/reportes` redirect, global Reportes item y navegación secundaria según la matriz autorizada.
- Files or areas likely involved:
  App routing; navigation registry; capability/role helpers; small report navigation component.
- Execution notes:
  Solo ejecutar tras Task 2 sin blockers. Multi-role = union. No landing dashboard. Route guards independientes.
- Verification method:
  Route/navigation tests para ADMIN, ENC, CONTADORA, COCINA, MESERO, EMPLEADO y multi-role.
- Dependencies:
  Task 2 resolved.

## Task 4: Crear el contrato interno de exportación normalizada y CSV

- Objective:
  - [x] Crear shared export primitives mínimos para normalized datasets, CSV seguro, filenames y browser download.
- Files or areas likely involved:
  Shared export utility area; test area.
- Execution notes:
  No generic BI engine. Añadir spreadsheet formula safety, CSV escaping y typed dataset boundary.
- Verification method:
  Unit tests de Unicode, commas, quotes, newlines, formula prefixes, filenames y download invocation.
- Dependencies:
  Task 2 resolved.

## Task 5: Seleccionar y añadir el soporte XLSX mínimo

- Objective:
  - [x] Auditar package/lockfile local y seleccionar únicamente `xlsx@^0.18.5` para XLSX client-side.
- Files or areas likely involved:
  Frontend package manifest; lockfile; export adapter.
- Execution notes:
  Evaluar mantenimiento, licencia, Vite/browser, TypeScript, numeric cells, bundle y ausencia de SaaS. No añadir otra PDF library. Considerar dynamic import.
- Verification method:
  Package diff contiene como máximo la dependencia XLSX necesaria y un adapter aislado; build/typecheck la aceptan.
- Dependencies:
  Tasks 1, 4.

## Task 6: Implementar adapters XLSX y PDF desde normalized datasets

- Objective:
  - [x] Añadir serializers XLSX/PDF que consumen directamente los mismos normalized report datasets.
- Files or areas likely involved:
  Shared export adapters; existing PDF infrastructure.
- Execution notes:
  Reusar jsPDF si local lo confirma. No CSV reparsing. Mantener numeric workbook values. PDF textual/table-based.
- Verification method:
  Export tests verifican mapping, summary/data sections, numeric cells y shared normalized-dataset parity; PDF generation remains covered by the build path without claiming metadata/table assertions.
- Dependencies:
  Tasks 4-5.

## Task 7: Implementar la capa API/query/filter de HU-029

- Objective:
  - [x] Conectar Sales Report al contrato final autorizado con current month, Period, Shift y Channel.
- Files or areas likely involved:
  Reports API/query keys; Sales Report feature; filter components.
- Execution notes:
  No client filter workaround. PaymentMethod filter solo si contract real lo soporta.
- Verification method:
  Query tests de default month, from/to, Shift, Channel, clear y error handling.
- Dependencies:
  Tasks 2-3.

## Task 8: Implementar summary, trend y channel distribution HU-029

- Objective:
  - [x] Renderizar cuatro cards backend-authoritative, BusinessDate trend y DIRECT/PEDIDOSYA distribution.
- Files or areas likely involved:
  Sales Report page; shared Cards; lightweight SVG/chart components if needed.
- Execution notes:
  No transaction table. No fabricated dates. No Payment/Channel mixing. No chart package salvo audit justificado.
- Verification method:
  Component tests de totals, mapping, real series points, channel distribution y accessibility text/legend.
- Dependencies:
  Task 7.

## Task 9: Integrar HU-015 y exports HU-029

- Objective:
  - [x] Añadir `Ver historial de ventas` y los adapters CSV/XLSX/PDF del Sales Report.
- Files or areas likely involved:
  Sales Report page; Sales export mapper; existing Sales History route.
- Execution notes:
  Export summary + BusinessDate series + channel breakdown, no HU-015 transactions. Transferir filtros solo si HU-015 ya lo soporta.
- Verification method:
  History link test y tres export tests sobre el mismo normalized dataset.
- Dependencies:
  Tasks 4, 6, 8.

## Task 10: Implementar API/query de HU-030

- Objective:
  - [x] Conectar Inventory Report point-in-time y exponer únicamente filtros soportados por el contrato local.
- Files or areas likely involved:
  Reports API/query layer; Inventory Report feature.
- Execution notes:
  No period. No client security filtering. No filtros ficticios.
- Verification method:
  Query tests y assertion de ausencia de parámetros/controles no soportados.
- Dependencies:
  Tasks 2-3.

## Task 11: Implementar summary, table/cards y status HU-030

- Objective:
  - [x] Mostrar lowCount, negativeCount, totalCount y rows de inventario en desktop/mobile.
- Files or areas likely involved:
  Inventory Report page; shared Card/Table/Badge components; inventory formatting helpers.
- Execution notes:
  Backend stockState authority. Preservar quantity negativa. minimumStock null seguro. No mutation actions ni fake sync.
- Verification method:
  Tests NORMAL/LOW/NEGATIVE, negative priority, null minimum, role rendering y absence of mutation controls.
- Dependencies:
  Task 10.

## Task 12: Implementar exports HU-030

- Objective:
  - [x] Crear Inventory normalized export mapper y conectar CSV/XLSX/PDF al full snapshot.
- Files or areas likely involved:
  Inventory export adapter; shared export menu.
- Execution notes:
  Incluir summary real y fields reales únicamente. No charts.
- Verification method:
  Los tres formatos reciben exactamente el mismo row universe y summary.
- Dependencies:
  Tasks 4, 6, 11.

## Task 13: Implementar API/query/filter y Employee options HU-031

- Objective:
  - [x] Conectar Attendance Report al contrato autorizado con current month, Employee y Shift, usando una fuente de Employees autorizada para CONTADORA.
- Files or areas likely involved:
  Reports API/query layer; Attendance Report feature; Employee filter source.
- Execution notes:
  No User Management privilegiado. No client-side Shift filtering.
- Verification method:
  Tests de current month, Employee, Shift, clear y authorized Employee option source.
- Dependencies:
  Tasks 2-3.

## Task 14: Implementar summary y analytics por Employee HU-031

- Objective:
  - [x] Renderizar backend summary y rows/cards con attendanceCount, lateCount, absenceCount, worked time, HourlyRate y ProjectedPay.
- Files or areas likely involved:
  Attendance Report page; summary cards; duration/money formatters.
- Execution notes:
  No frontend pay calculation. No open-attendance elapsed conversion. No AttendanceRecord table.
- Verification method:
  Tests exactos de backend values, HourlyRate read-only, projectedPay y summary independence de presentation rows.
- Dependencies:
  Task 13.

## Task 15: Integrar HU-024 y exports HU-031

- Objective:
  - [x] Añadir `Ver asistencia` cuando autorizado y conectar el normalized Attendance export dataset a CSV/XLSX/PDF.
- Files or areas likely involved:
  Attendance Report page; Attendance export mapper; HU-024 route integration.
- Execution notes:
  No duplicate Attendance detail. Conservar workedMinutes numérico en export. Transferir Employee/period solo si actual route lo soporta.
- Verification method:
  Link/permission tests y consistencia de los tres exports.
- Dependencies:
  Tasks 4, 6, 14.

## Task 16: Consolidar estados de query y filtros responsive

- Objective:
  - [x] Añadir initial loading, background refresh, empty, filtered-empty, error/retry y mobile filter overlays coherentes para las tres HUs.
- Files or areas likely involved:
  Report pages; shared query-state/filter primitives.
- Execution notes:
  No fake support CTA/error code. No blanking innecesario during refetch. Filters >2 controls usan primitive responsive actual.
- Verification method:
  Component tests de cada estado y de apertura/cierre de filtros.
- Dependencies:
  Tasks 8, 11, 14.

## Task 17: Endurecer responsive, charts y accesibilidad

- Objective:
  - [x] Asegurar layouts 360/~768/>=1280, chart semantics, tables/cards y export controls accesibles a nivel de código.
- Files or areas likely involved:
  Report pages; lightweight chart components; export menu; filter overlay.
- Execution notes:
  Manual evidence NO es gate. No color-only status/chart meaning. No horizontal page overflow intencional.
- Verification method:
  Automated/component assertions where practical + code-level accessibility review; manual status registrado como deferred.
- Dependencies:
  Tasks 9, 12, 15-16.

## Task 18: Añadir tests compartidos de exportación

- Objective:
  - [x] Cubrir full filtered scope, normalized dataset consistency, ausencia de collector innecesario para el contrato no paginado, error/pending y spreadsheet safety.
- Files or areas likely involved:
  Shared export tests.
- Execution notes:
  Si el contrato local no es paginado, testear que no se introduce all-page machinery innecesaria. Si sí lo es, cubrir page 1..N y loop termination.
- Verification method:
  Export suite green con current-page-independence y same-filter consistency.
- Dependencies:
  Tasks 4-6.

## Task 19: Completar tests focalizados HU-029

- Objective:
  - [x] Cubrir route/auth, filtros, summary, Payment/Channel, charts, HU-015 boundary, states, mobile y exports.
- Files or areas likely involved:
  Sales Report tests.
- Execution notes:
  Añadir casos no-sales, single payment/channel y missing-series date.
- Verification method:
  HU-029 focused suite green.
- Dependencies:
  Tasks 7-9, 16-18.

## Task 20: Completar tests focalizados HU-030

- Objective:
  - [x] Cubrir roles, backend scope rendering, summary, status, optional filters, desktop/mobile, no mutation y exports.
- Files or areas likely involved:
  Inventory Report tests.
- Execution notes:
  Incluir zero, negative, minimum null y COCINA.
- Verification method:
  HU-030 focused suite green.
- Dependencies:
  Tasks 10-12, 16-18.

## Task 21: Completar tests focalizados HU-031 y navegación/regresiones

- Objective:
  - [x] Cubrir roles, filters, summary, Employee analytics, pay authority, HU-024 boundary, exports, Reportes navigation y regressions relevantes.
- Files or areas likely involved:
  Attendance Report tests; navigation/route tests; existing history regression tests.
- Execution notes:
  Confirmar MESERO sin Reports, COCINA inventory-only y multi-role union. No modificar HU-015/HU-023/HU-024 behavior.
- Verification method:
  HU-031 + navigation + targeted regression suites green.
- Dependencies:
  Tasks 13-20.

## Task 22: Ejecutar full gates y registrar estado backend/generated

- Objective:
  - [x] Ejecutar los scripts reales de frontend y la regresión backend/EF requerida por la convención local.
- Files or areas likely involved:
  Frontend/backend tooling; generated API audit.
- Execution notes:
  Confirmar package scripts localmente y registrar resultados reales. Si el backend report contract cambia, regenerar `api.generated.ts` exclusivamente con `pnpm run api:generate`; no editarlo manualmente ni corregir backend para encubrir contract assumptions. La representación preexistente del pnpm lockfile se preserva sin reformatearla.
- Verification method:
  Frontend typecheck/lint/test/build y formato targeted de fuentes verdes; backend regression factual; migration/pending-model state factual; generated diff esperado. El whole `format:check` solo señala el lockfile preservado.
- Dependencies:
  Tasks 19-21.

## Task 23: Actualizar documentación, evidence placeholders y verify readiness

- Objective:
  - [x] Actualizar HU-029/HU-030/HU-031/OpenSpec con contratos, dependencias, tests y evidencia factual, manteniendo manual evidence deferred.
- Files or areas likely involved:
  HU docs; direct traceability/status docs; OpenSpec apply/verify artifacts.
- Execution notes:
  Preparar todos los placeholders de desktop/tablet/360/export/a11y sin marcarlos PASS. Confirmar que el backend queda limitado a la reconciliación autorizada, sin migration, sin history duplication y sin export current-page-only.
- Verification method:
  Verify report traza cada acceptance criterion; manual evidence aparece como `DEFERRED_TO_SPRINT_FINAL_AUDIT`, no FAIL.
- Dependencies:
  Task 22.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 2,300–4,200 LoC entre frontend, export adapters, report pages, tests y documentación para el change completo. El change ahora incluye la reconciliación backend autorizada, el APPLY frontend allowlisted y la evidencia automatizada registrada abajo.
- Risk of exceeding 400 LoC review threshold:
  Very High para el change completo; Medium por unidad lógica.
- Recommendation:
  El APPLY frontend fue revisado y aceptado; mantener este único OpenSpec change y no convertir la evidencia manual diferida en blocker.
- Suggested split if chained:
  - PR 1: Report routes/navigation/capabilities + shared export core.
  - PR 2: HU-029 report + charts + exports.
  - PR 3: HU-030 report + exports.
  - PR 4: HU-031 report + exports.
  - PR 5: shared responsive/a11y + regression/gates/docs.

  Task 2 quedó resuelto con autorización explícita. No crear cambios backend adicionales desde estas tasks sin una autorización separada; no se ejecutó Git delivery.

## Current Execution Evidence — 2026-09-02

- Tasks 3–6: routes/navigation, normalized export core, `xlsx@^0.18.5`, XLSX/PDF adapters and CSV safety are implemented under the allowlist and covered by focused tests.
- Tasks 7–12: HU-029 and HU-030 typed queries, backend-authoritative summaries/visuals, responsive views, status labels and full-response exports are implemented and tested.
- Tasks 13–17: HU-031 typed Period/Employee/Shift queries, authorized Employee options, backend summary/pay fields, HU-024 boundary, query states and Modal filters are implemented and tested.
- Tasks 18–21: API/export/page tests plus navigation/route tests pass; valid zero responses, placeholder export disabling, mobile filter open/close and plain `/asistencia` links are covered.
- Task 22: targeted Prettier check, `pnpm run typecheck`, `pnpm run lint`, `pnpm run test` (42 files / 245 tests), `pnpm run build`, frozen offline install and `git diff --check` pass. Repository-wide format check is not applied to the preserved pnpm lockfile.
- Task 23: this documentation update completes the factual traceability; manual visual/responsive/accessibility evidence remains `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
