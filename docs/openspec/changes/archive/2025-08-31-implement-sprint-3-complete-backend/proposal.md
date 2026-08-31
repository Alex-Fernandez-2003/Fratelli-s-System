# Proposal

## Verdict

`SPRINT_3_BACKEND_OPENSPEC_READY`

Interpretación: las decisiones funcionales necesarias para diseñar Sprint 3 están suficientemente definidas y no se identificó una nueva decisión de producto bloqueante. Sin embargo, `READY_FOR_SPRINT_3_BACKEND_APPLY: NO` en esta sesión porque la baseline exigida por el change es el working tree LOCAL REAL ACTUAL y este generador no dispone de acceso al repositorio local, shell ni `git status`/`git rev-parse`. El primer checkpoint obligatorio antes de cualquier modificación deberá reconciliar estos artifacts contra esa baseline local.

La rama, HEAD, migrations y código citados como evidencia técnica corresponden únicamente al `develop` remoto inspeccionable y a la documentación proporcionada; NO se asume que sean idénticos al working tree local.

## Baseline Audit

| Dato                                         | Resultado de esta auditoría                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Repository                                   | `Fratelli-s-System`                                                                                                                   |
| Branch local real                            | **NOT VERIFIED** — requiere `git branch --show-current`/equivalente read-only local                                                   |
| HEAD local                                   | **NOT VERIFIED**                                                                                                                      |
| Working tree local                           | **NOT VERIFIED**                                                                                                                      |
| Rama remota corroborativa                    | `develop`                                                                                                                             |
| Backend solution                             | Estructura Clean Architecture observada remotamente: Domain, Application, Infrastructure, Api y suites Domain/Application/Integration |
| Framework backend                            | .NET 10 / ASP.NET Core según documentación y baseline observable                                                                      |
| Última migration local                       | **NOT VERIFIED**                                                                                                                      |
| Última migration visible en `develop` remoto | `20260828093655_AddSprint2OperationalWorkflows.cs`; no debe tratarse como última migration local sin revalidación                     |
| OpenAPI                                      | Baseline observable usa OpenAPI de runtime en Development                                                                             |
| Generated client                             | Ruta documental/observable: `frontend/src/types/api.generated.ts`; debe confirmarse localmente                                        |
| Test suites                                  | xUnit Domain, Application e Integration/PostgreSQL según estructura observable                                                        |
| Sprint 3 documentado                         | 13 HU, 40 SP                                                                                                                          |
| Frontend productivo Sprint 3                 | Fuera de alcance de este change                                                                                                       |
| Product decisions blocking                   | Ninguna nueva identificada                                                                                                            |
| Apply readiness                              | **NO hasta completar la revalidación local de Phase 0**                                                                               |

La planificación documental vigente enumera exactamente las 13 HU solicitadas y suma 40 SP. fileciteturn18file7 La documentación conceptual ya reserva `customers`, `sales`, `cash_closings` y reportes como proyecciones del dominio, pero eso no prueba que dichas estructuras estén implementadas en el working tree local. fileciteturn17file7

La metodología aplicada conserva OpenSpec como fuente canónica, separa planificación de APPLY y exige artifacts verificables y reviewables. fileciteturn16file0 fileciteturn16file1 La estructura de este change respeta el modelo OpenSpec proporcionado y el formato de cuatro artifacts requerido. fileciteturn16file2 fileciteturn16file3

## Sprint 3 Scope

El change `implement-sprint-3-complete-backend` cubre exactamente:

| HU     | Capability                                                        |
| ------ | ----------------------------------------------------------------- |
| HU-008 | Historial de producción y lote de trazabilidad                    |
| HU-014 | Clientes básicos y asociación inmutable a venta                   |
| HU-015 | Historial autorizado de ventas                                    |
| HU-019 | Historial autorizado de compras                                   |
| HU-021 | Historial autorizado de gastos                                    |
| HU-023 | Historial propio de asistencia, reutilizando foundation existente |
| HU-024 | Asistencia administrativa, retrasos y ausencias                   |
| HU-026 | Preview autoritativo de cierre                                    |
| HU-027 | Cierre final atómico de caja                                      |
| HU-028 | Historial de cierres                                              |
| HU-029 | Datos agregados de reporte de ventas                              |
| HU-030 | Datos de reporte de inventario                                    |
| HU-031 | Reporte de asistencia y payroll projection                        |

El backlog suministrado confirma, entre otros, HU-008 con roles COCINA/ENCARGADO/ADMINISTRADOR/CONTADORA, HU-021 para ADMINISTRADOR/ENCARGADO/CONTADORA, HU-023/HU-024 sobre la foundation de asistencia y HU-030/HU-031 como reportes de Sprint 3. fileciteturn20file5 fileciteturn20file2 fileciteturn20file3 fileciteturn21file0

## Existing Foundations Audit

La siguiente tabla distingue evidencia observable del `develop` remoto de lo que todavía debe corroborarse localmente.

| Capability      | Foundation observable                                                   |       Reusable | Gap Sprint 3 esperado                               | Nota                                           |
| --------------- | ----------------------------------------------------------------------- | -------------: | --------------------------------------------------- | ---------------------------------------------- |
| Production      | `Production`, `ProductionConsumption`, creación de producción           |            YES | History/detail, BatchCode, Status                   | No crear stock por lote                        |
| Customer        | Modelo conceptual documentado; no confirmado en backend remoto auditado |      TBD local | CRUD básico, CI/NIT, Sale snapshot                  | Reutilizar si local ya existe                  |
| Sale            | `Sale`, `SaleItem`, `ConfirmSale`, Shift, channel/payment, inventory    |            YES | Customer association/snapshot, history/report reads | No reimplementar venta                         |
| Purchase        | Purchase, items, receipt, cancel/receive, list/detail                   |            YES | History filters/scoping                             | Código HU-017/018 manda                        |
| Expense         | Expense foundation observada                                            |            YES | Historical query/filter/aggregates                  | No mutación nueva                              |
| Attendance      | `AttendanceRecord`, `IBusinessClock`, self-history                      |            YES | Schedules, late, absence, admin/report projections  | HU-023 debe reutilizar `/me` si local coincide |
| Shift           | CashSession, MORNING/NIGHT Shift, assignments, handover                 |            YES | Opening amounts y handover financiero estructurado  | No segundo shift system                        |
| ShiftAssignment | Asignación Employee↔Shift                                               |            YES | Snapshot del horario efectivo                       | No weekly scheduler                            |
| CashSession     | Jornada + shifts                                                        |            YES | Datos monetarios de apertura, final close           | Una sesión por BusinessDate                    |
| CashClosing     | Previsto conceptualmente; no confirmado en backend remoto auditado      |      TBD local | Snapshot y cierre final                             | No cierre por shift                            |
| Employee        | Entity/foundation existente                                             |            YES | `HourlyRate`                                        | Default aprobado 20.00 BOB/h                   |
| Inventory       | Balance/movement + writer/service                                       |            YES | Solo read models/report                             | Ninguna nueva autoridad                        |
| Reports         | Conceptualmente proyecciones                                            | YES as pattern | Sales/Inventory/Attendance queries                  | No tabla Report, no archivos                   |

El modelo conceptual proporcionado explicita que reportes son proyecciones y que un cierre pertenece a la sesión de caja, reforzando la estrategia de no introducir una entidad genérica `Report`. fileciteturn17file7

## HU-by-HU Baseline

| HU     | Existing Backend observable                 | Missing/Extended Backend esperado                                          | Migration                      | Contract Impact      | Verdict antes de auditoría local |
| ------ | ------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------ | -------------------- | -------------------------------- |
| HU-008 | Production + consumptions + create          | History/detail + BatchCode + Status                                        | Likely YES                     | Additive             | PARTIAL                          |
| HU-014 | No implementation confirmed remotely        | Customer capability + Sale association/snapshot                            | Likely YES                     | Additive             | REQUIRES LOCAL CONFIRMATION      |
| HU-015 | Confirmed Sale foundation                   | History/detail + row scope                                                 | Sale snapshot migration likely | Additive             | PARTIAL                          |
| HU-019 | Purchase list/detail foundation             | Historical filters + COCINA row scope                                      | Likely NO                      | Additive/extension   | PARTIAL                          |
| HU-021 | Expense foundation                          | Paginated historical read                                                  | Likely NO                      | Additive             | PARTIAL                          |
| HU-023 | Own attendance history exists remotely      | Reuse/regression; additive derived fields only if shared contract requires | NO by itself                   | Prefer none/additive | SUBSTANTIALLY EXISTS             |
| HU-024 | Attendance + Employee + ShiftAssignment     | schedules, late, absence, summaries                                        | Likely YES                     | Additive             | PARTIAL                          |
| HU-026 | CashSession/Shift foundation                | authoritative preview + monetary opening/handover data                     | Likely YES                     | Additive             | PARTIAL                          |
| HU-027 | Shift lifecycle foundation                  | CashClosing + atomic close                                                 | Likely YES                     | Additive             | MISSING/PARTIAL                  |
| HU-028 | CashSession/Shift foundation                | closing history/detail                                                     | Depends HU-027                 | Additive             | MISSING                          |
| HU-029 | Sales foundation                            | aggregate report query                                                     | Likely NO                      | Additive             | MISSING                          |
| HU-030 | Inventory read/summary foundations expected | point-in-time reporting read model                                         | Likely NO                      | Additive             | PARTIAL                          |
| HU-031 | Attendance foundation                       | authorized report + payroll projection                                     | Shares attendance migration    | Additive             | PARTIAL                          |

## Data Model Gap Audit

### Production

Remote evidence shows completed production persistence with consumptions, but no verified `BatchCode` or persisted `Status`.

Required if still absent locally:

- additive unique BatchCode;
- additive Status supporting at least `COMPLETED`;
- deterministic, collision-free historical BatchCode backfill;
- historical rows backfilled as `COMPLETED`;
- no batch-balance entity;
- no FIFO/FEFO fields;
- no remaining quantity by batch.

### Customers

If Customer is still absent locally:

- Customer identity;
- required Name;
- required normalized/trimmed CI;
- optional normalized/trimmed NIT;
- Notes if consistent with existing model;
- active state;
- creation/update audit fields consistent with repository practice;
- unique DB constraint for CI;
- unique NIT when non-null.

If Customer already exists locally, the implementation MUST extend it rather than introduce a parallel aggregate.

### Sales

If absent locally:

- nullable CustomerId;
- nullable immutable customer Name/CI/NIT snapshots.

Historical Sale rows remain valid with null customer information.

### Employee

If `HourlyRate` remains absent:

- decimal monetary field;
- approved default/backfill `20.00`;
- no mutation workflow required in Sprint 3;
- no rate-history subsystem.

### Attendance schedule

The current model requires a historically stable effective work schedule. The proposed minimal persistent additions are:

- configurable schedule by ShiftType;
- start;
- end;
- late tolerance;
- schedule snapshot on ShiftAssignment or an already-existing equivalent historical reference.

No second assignment/scheduler model is allowed.

### CashSession / Handover

If still absent:

- openingAmount;
- pettyCashOpeningAmount;
- structured cashRemovedAmount;
- backend-derived carried-forward amount or equivalent snapshot.

Existing historical rows MUST NOT receive invented financial values.

### CashClosing

If absent:

- one immutable closing per CashSession;
- responsible identity;
- closedAt;
- opening snapshots;
- cash removed;
- sales total;
- CASH/QR/EXTERNAL snapshots;
- DIRECT/PEDIDOSYA snapshots;
- expense snapshots;
- expected cash;
- declared cash;
- difference;
- observation.

The payment and channel breakdowns classify the same Sales through independent dimensions and MUST NOT be added together.

## Authorization Audit

The final implementation MUST preserve multi-role union semantics.

| Capability                            | Authorized scope required                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| HU-008 Production history             | ADMINISTRADOR, ENCARGADO, COCINA, CONTADORA; COCINA sees the complete production history |
| HU-014 Customer read/create/edit      | ADMINISTRADOR, ENCARGADO, MESERO                                                         |
| HU-014 Customer active-state mutation | ADMINISTRADOR, ENCARGADO only                                                            |
| HU-015 Sales history                  | ADMINISTRADOR/ENCARGADO/CONTADORA general; MESERO only current assigned Shift            |
| HU-019 Purchase history               | ADMINISTRADOR/ENCARGADO/CONTADORA general; COCINA only KITCHEN area/equivalent           |
| HU-021 Expense history                | ADMINISTRADOR, ENCARGADO, CONTADORA                                                      |
| HU-023 Own attendance                 | authenticated Employee-linked user, self only                                            |
| HU-024 Administrative attendance      | ADMINISTRADOR, ENCARGADO, CONTADORA                                                      |
| Work schedule configuration           | ADMINISTRADOR, ENCARGADO                                                                 |
| HU-026 Preview                        | ADMINISTRADOR, ENCARGADO                                                                 |
| HU-027 Final close                    | ADMINISTRADOR, ENCARGADO                                                                 |
| HU-028 Closing history                | ADMINISTRADOR, ENCARGADO, CONTADORA                                                      |
| HU-029 Sales report                   | same row scope as HU-015                                                                 |
| HU-030 Inventory report               | ADMINISTRADOR, ENCARGADO, COCINA, CONTADORA                                              |
| HU-031 Attendance report              | ADMINISTRADOR/ENCARGADO/CONTADORA general; ordinary Employee-linked user own-only        |

The supplied backlog confirms general Sales history access for ADMINISTRADOR/ENCARGADO/CONTADORA and restricted MESERO scope, and closing read roles for HU-028. fileciteturn22file7 fileciteturn21file3

No `CAJERO` role is introduced.

## Contract Audit

### Existing contracts to reuse if local baseline confirms them

- current Production registration.
- current Purchase list/detail/receipt contracts.
- Expense persistence.
- `GET /api/v1/attendance/me` or exact local equivalent.
- Current Shift/Own Shift queries.
- existing CashSession/Shift open/handover workflows.
- `ConfirmSale`.
- Inventory balance/summary queries.
- existing ProblemDetails envelope.
- existing pagination convention.

### Contracts likely requiring additive extension

- Production DTOs: BatchCode/Status and history projections.
- ConfirmSale: optional CustomerId.
- Sale DTO/history: customer snapshot.
- operational-day opening request: opening money fields if still absent.
- handover request/response: structured removed/carried-forward amounts if absent.
- Attendance DTOs: schedule/late/absence/worked-time projections.
- Employee/report projection: HourlyRate.

### New endpoint capabilities expected

Exact paths MUST be frozen after local baseline inspection, following the existing `/api/v1` route organization rather than inventing parallel route families.

Expected capabilities:

- production history list/detail;
- Customer search/detail/create/edit/activation lifecycle;
- Sale history list/detail;
- Purchase history filters if existing list cannot satisfy HU-019 without breaking changes;
- Expense history;
- administrative attendance;
- schedule configuration;
- cash closing preview;
- cash close mutation;
- cash closing history/detail;
- Sales report data;
- Inventory report data;
- Attendance report data.

### Explicitly prohibited contract additions

- PDF/CSV/XLSX endpoints;
- generic `/exports`;
- duplicate attendance `/me`;
- stock-by-batch APIs;
- Customer-after-Sale mutation;
- report persistence CRUD;
- closing-per-shift API;
- notification/export jobs.

Expected breaking changes: **NONE**.

## Migration Audit

Likely migration slices, conditional on local confirmation:

1. Production traceability fields.
2. Customer + Sale customer snapshot.
3. Employee rate + work schedule + assignment schedule snapshot.
4. CashSession/handover monetary fields + CashClosing.

They SHOULD be reviewable separately even when EF generates a different safe grouping.

Migration requirements:

- additive-first;
- preserve historical Production/Sales/Employee data;
- never fabricate CI/NIT;
- deterministic BatchCode backfill;
- Production historical status = COMPLETED;
- Employee rate backfill = 20.00;
- historical financial rows with unknown amounts MUST NOT receive invented cash amounts;
- database-level uniqueness for Customer CI/NIT and CashClosing per CashSession;
- foreign keys and delete behavior MUST protect historical records.

## Problem Statement

Sprint 3 requires a substantial backend expansion over working Sprint 1/2 foundations: historical queries, Customer identity/snapshots, richer attendance semantics, payroll projection, financial handover/closing and authoritative report data.

The documented functional scope is sufficiently defined, but implementing it as isolated greenfield modules would risk:

- duplicating existing inventory, attendance, sales, purchase and shift foundations;
- allowing historical values to change retroactively;
- leaking data across authorization scopes;
- introducing destructive migrations;
- miscalculating physical cash by mixing payment methods and sales channels;
- deriving absences from incomplete data;
- delegating authoritative calculations to the future frontend.

The local working tree remains the canonical technical baseline and must be inspected before APPLY.

## Goals

- Implement the backend capabilities required by all 13 Sprint 3 HUs while retaining explicit HU traceability.
- Extend, not replace, Sprint 1/2 foundations.
- Preserve historical Production, Sale, Attendance and CashClosing semantics.
- Introduce unique production traceability BatchCodes without making lots an inventory authority.
- Add Customer CI/NIT semantics and immutable Sale customer snapshots.
- Reuse `/attendance/me` instead of duplicating self-history.
- Add historically stable schedule-derived late/absence semantics.
- Add decimal hourly-rate payroll projection without implementing payroll transactions.
- Extend the existing CashSession/Shift lifecycle with structured opening/handover information.
- Implement one final immutable CashClosing per BusinessDate/CashSession.
- Provide server-authoritative Sales, Inventory and Attendance report data.
- Apply authorization and row-level scope on the backend.
- Keep API evolution additive and preserve Sprint 1/2 clients.
- Regenerate runtime OpenAPI and generated TypeScript only after the backend contract is stable.
- Add unit/application/PostgreSQL integration and concurrency regression coverage.

## Non-Goals

- React pages, modals, charts, responsive UI or other productive frontend implementation.
- Backend PDF, CSV, Excel/XLSX or printed-report generation.
- Fiscal invoicing.
- Full payroll, payroll runs, payments or payslips.
- Bonuses, deductions, taxes or rate history.
- Mutable Employee hourly-rate UI/API unless separately approved later.
- FIFO, FEFO, expiry or inventory balances by production batch.
- Receipt/invoice generation.
- Hardware signature pads or signature images.
- Supplier accounts payable.
- Customer credit/accounts receivable.
- Customer authentication.
- Weekly/per-employee scheduling subsystem.
- Inventory reservations.
- New inventory authority.
- Persistent generic Report entities.
- Report background jobs/caches.
- Any HU outside the 13 Sprint 3 HUs.

## Affected Areas

- Domain entities for Production, Customer/Sale, Employee/attendance scheduling and cash closing.
- Application contracts and query/services for histories, customers, attendance, cash and reports.
- Infrastructure EF configurations, migrations and PostgreSQL queries/locking.
- Existing inventory, sale, purchase, expense, attendance and shift services as integration boundaries.
- API endpoint registration and authorization policies.
- ProblemDetails mappings.
- Domain/Application/Integration test suites.
- Runtime OpenAPI contract.
- Generated frontend TypeScript contract only.
- Individual HU backend documentation/manifests after verified implementation.

## Assumptions

- The remote `develop` evidence is used only to identify probable reusable foundations; it is NOT assumed equal to the local working tree.
- Exact current file names, local migration tip, current uncommitted changes and precise route/policy names MUST be confirmed before the first implementation task.
- Where this proposal says “if absent”, the local audit MUST determine whether a current implementation already satisfies the requirement and, if so, reuse it without duplication.
- No new product decisions are assumed beyond the frozen decisions supplied by the user.

## Risks

### Risk 1: Diseñar contra una baseline remota distinta del working tree local

- Probability: High.
- Impact: High; puede duplicar capacidades ya aplicadas o diseñar migrations incompatibles.
- Mitigation: Bloquear modificación de código hasta completar Task 1 y registrar branch, HEAD, status, diff, migration tip, endpoints y contracts locales.

### Risk 2: Migraciones destructivas o datos históricos inventados

- Probability: Medium.
- Impact: High.
- Mitigation: Estrategia additive-first, backfills únicamente con valores aprobados/determinísticos y transición nullable cuando falten datos históricos reales.

### Risk 3: Drift histórico de horarios

- Probability: High sin snapshot.
- Impact: High; una edición de horario podría recalcular tardanzas/ausencias pasadas.
- Mitigation: Persistir el horario efectivo sobre ShiftAssignment o reutilizar un equivalente versionado ya existente.

### Risk 4: Fuga de autorización row-level

- Probability: Medium.
- Impact: High.
- Mitigation: Imponer filtros de MESERO/COCINA en queries backend antes de paginación/agregación y cubrirlos con pruebas de integración.

### Risk 5: Inconsistencia entre historia y reporte

- Probability: Medium.
- Impact: High.
- Mitigation: HU-029 debe reutilizar el mismo scope de Sales que HU-015; HU-031 debe reutilizar la misma lógica de asistencia que HU-024.

### Risk 6: Reconciliación de caja incorrecta

- Probability: Medium.
- Impact: Critical.
- Mitigation: Cálculo central backend; mantener PaymentMethod y SalesChannel independientes; tests explícitos CASH/QR/EXTERNAL/DIRECT/PEDIDOSYA/removals/expenses.

### Risk 7: Doble cierre concurrente

- Probability: Low/Medium.
- Impact: Critical.
- Mitigation: bloqueo PostgreSQL + constraint única por CashSession + test concurrente real.

### Risk 8: Confundir lote de Production con autoridad de stock

- Probability: Medium.
- Impact: High.
- Mitigation: BatchCode solo de trazabilidad; todo stock continúa en InventoryWriter/InventoryBalance.

### Risk 9: N+1 o materialización masiva en históricos/reportes

- Probability: Medium.
- Impact: Medium/High.
- Mitigation: proyecciones SQL/EF, paginación y agregados server-side; evitar per-row database loops.

### Risk 10: Incompatibilidad con clientes Sprint 1/2

- Probability: Medium.
- Impact: High.
- Mitigation: rutas/verbs existentes estables, DTO evolution aditiva y diff OpenAPI revisado antes de sincronizar tipos.

### Risk 11: CI/NIT duplicados bajo concurrencia

- Probability: Low/Medium.
- Impact: High.
- Mitigation: validación de aplicación para UX y unique constraint PostgreSQL como autoridad final.

### Risk 12: Scope demasiado grande para revisión

- Probability: Certain.
- Impact: High.
- Mitigation: un único OpenSpec change, pero APPLY en PRs encadenados y review slices cohesivos por foundation/capability.

## Rollback Strategy

El rollout MUST ser incremental y compatible.

- Las nuevas APIs deben ser aditivas; deshabilitar/revertir una capability nueva no debe exigir restaurar rutas Sprint 1/2.
- Las columnas nuevas deben agregarse de forma que el código anterior pueda seguir leyendo las tablas durante una reversión inmediata cuando sea técnicamente posible.
- Las migrations con backfill aprobado —BatchCode/COMPLETED y HourlyRate 20.00— no deben borrar datos para rollback; una reversión lógica debe poder dejar las columnas nuevas sin consumir antes que intentar perder historial.
- Customer/Sale snapshots ya capturados deben preservarse aunque se deshabilite temporalmente la selección de Customer.
- CashClosing es un registro histórico financiero: una vez que existan cierres reales, rollback de esquema que elimine esos datos NO es aceptable. La reversión debe deshabilitar nuevas operaciones manteniendo la tabla legible.
- Schedule snapshots históricos tampoco deben eliminarse después de producir reportes reales.
- Si una migration no puede revertirse sin pérdida, APPLY debe marcarla como forward-only y documentar restauración desde backup/entorno de prueba antes de producción.
- Después de cualquier rollback, deben verificarse Sprint 1/2, migración aplicada, lectura histórica y contratos existentes.

## Success Criteria

- Las 13 HU tienen backend implementado o una justificación factual de reuse completo.
- No existe una segunda autoridad de inventario, attendance scheduling o current shift.
- HU-008 mantiene ProductionConsumptions históricos y BatchCode único.
- Customer CI es requerido/único y NIT opcional/único según las reglas congeladas.
- Sales con Customer conservan snapshots inmutables.
- MESERO no puede escapar del current-shift scope de Sales history/report.
- COCINA respeta KITCHEN scope en Purchase history.
- HU-023 reutiliza la self-history existente en lugar de duplicarla.
- Cambiar un WorkSchedule no altera tardanza/ausencia de asignaciones históricas.
- Attendance distingue ausencias reales de “todavía no registró entrada”.
- Payroll projection usa minutos cerrados, decimal y HourlyRate 20.00 inicial.
- El handover registra cashRemovedAmount estructurado y no interpreta notas.
- HU-026 calcula preview sin persistir CashClosing.
- HU-027 crea exactamente un CashClosing por CashSession y cierra atomically NIGHT + CashSession.
- PEDIDOSYA nunca se trata como PaymentMethod.
- Report endpoints devuelven datos estructurados y nunca archivos.
- No se remueve ninguna ruta ni verb existente de Sprint 1/2.
- Migrations preservan registros históricos.
- Runtime OpenAPI final refleja el backend implementado.
- Generated TypeScript se obtiene desde OpenAPI y no por edición manual.
- La suite previa y la nueva cobertura pasan en APPLY/VERIFY; este artifact no afirma resultados anticipados.
