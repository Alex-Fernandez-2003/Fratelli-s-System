# Design

## Baseline Audit

### Local baseline

The continuation revalidated the repository locally:

- Branch: `develop`
- HEAD: `8cf270508e46b7a9abc3d51b758a6497100750d`
- At the start of this continuation there were no staged changes.
- Pre-existing unstaged files: `frontend/package.json`, `frontend/pnpm-lock.yaml`.
- Pre-existing untracked files: `.vscode/`, `frontend/pnpm-workspace.yaml`, `informe-final-fratelli.pdf`, `informe-final-fratelli.tex`, and the active OpenSpec directory.

The report backend/test files listed in this change were added or edited by the authorized continuation. Existing uncommitted work from previous Sprint 3 blocks was preserved.

### Secondary public baseline

The public `develop` branch was inspected only as secondary evidence.

Current public frontend package manifest contains:

- pnpm workflow;
- React/Vite/TanStack Query;
- `jspdf`;
- no observed XLSX writer;
- no observed chart library;
- Vitest/Testing Library;
- generated OpenAPI workflow. citeturn788398view0

Historical public generated report contracts exposed:

- Sales: `from/to`.
- Inventory: no filters.
- Attendance: `from/to/employeeId`. citeturn254236view0

Those facts were revalidated against the local source; the historical values are retained here only as audit context.

## Generation Verdict

The secondary-evidence blocker was resolved for the explicitly authorized backend-only continuation:

`SPRINT_3_BLOCK_5_PRODUCT_DECISION_REQUIRED: RESOLVED_FOR_AUTHORIZED_BACKEND_RECONCILIATION`

`READY_FOR_AUTHORIZED_BACKEND_RECONCILIATION: YES`

The frontend report APPLY is complete and locally verified:

`READY_FOR_SPRINT_3_BLOCK_5_FRONTEND_APPLY: YES`

`FRONTEND_APPLY_STATUS: COMPLETE_LOCAL_VERIFIED`

The generated client was synchronized through the runtime OpenAPI pipeline and consumed by the typed frontend adapters. Manual visual/responsive/accessibility evidence remains `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

## Current Local Contract Reconciliation

The authorized backend correction is implemented and verified in the local source:

### HU-029

- `GET /api/v1/reports/sales` accepts `from`, `to`, `shiftType` and `salesChannel`.
- The service joins `Sale → Shift → CashSession` before applying date and report filters.
- Both aggregates and `series` are computed from the same filtered rows keyed by `CashSession.BusinessDate`; date bounds are inclusive.
- `SalesAuthorizationScope` remains applied before the report joins, preserving the existing authorization scope.

### HU-031

- `GET /api/v1/reports/attendance` accepts `from`, `to`, `employeeId` and `shiftType`.
- The service joins assignments to shifts/sessions and attendance records by Employee + BusinessDate.
- `AttendanceDerivationService` supplies lifecycle, lateness and absence; `PayrollProjectionCalculator` supplies closed-work minutes/hours and projected pay.
- `AttendanceReportDto` now includes `AttendanceReportSummaryDto`, aggregated from the full filtered Employee dataset and the same row values.

### HU-030 role drift (reported, not changed)

- `/api/v1/reports/inventory` still uses `InventoryRead`.
- `Program.cs` defines that policy for `Administrator`, `Manager`, `Waiter`, `Kitchen` and `Accountant`.
- The frozen Reportes UI matrix excludes `MESERO/Waiter`, so the backend policy grants broader direct inventory-report access than the frontend navigation target. Product decision: retain the existing backend policy, document the drift, and do not change HU-030 authorization.

### Scope guard

The backend reconciliation scope contains only the report endpoint, application contract, report service and focused PostgreSQL test file; the generated client was refreshed through the normal runtime OpenAPI pipeline. The subsequent frontend APPLY is limited to the allowlisted report routes/navigation, query adapters, pages, exports and focused tests. HU-028/cash, schema, entity and migration files were not changed.

## Report Backend Architecture

Current conceptual boundary:

    backend report endpoint
      → structured report DTO
      → frontend query adapter
      → report-specific presentation
      → normalized export mapper
      → CSV / XLSX / PDF

The report endpoints, not histories, remain the source of report authority.

The archived Sprint 3 backend spec requires backend ownership of reporting calculations, including attendance/work/pay semantics. citeturn931795view0

## Historical Contract Reconciliation (secondary baseline)

The following matrices preserve the pre-reconciliation secondary baseline. The current local contract is recorded above in `Current Local Contract Reconciliation`.

### HU-029

| Aspect             | Expected                         | Secondary actual        | Frontend need           | Gap / Decision                |
| ------------------ | -------------------------------- | ----------------------- | ----------------------- | ----------------------------- |
| Endpoint           | Sales report                     | `/api/v1/reports/sales` | query adapter           | SUPPORTED                     |
| Period             | from/to, BusinessDate-consistent | from/to                 | current month           | SEMANTICS MUST BE REVALIDATED |
| Shift filter       | required                         | absent                  | D8                      | CORE GAP                      |
| Channel filter     | required                         | absent                  | D8                      | CORE GAP                      |
| Payment filter     | optional                         | absent                  | none required           | OMIT                          |
| Sales count        | backend                          | present                 | optional context/export | SUPPORTED                     |
| Total amount       | backend                          | present                 | card                    | SUPPORTED                     |
| CASH               | backend                          | present                 | card                    | SUPPORTED                     |
| QR                 | backend                          | present                 | card                    | SUPPORTED                     |
| EXTERNAL           | backend                          | present                 | card                    | SUPPORTED                     |
| DIRECT             | backend                          | present                 | channel chart           | SUPPORTED                     |
| PEDIDOSYA          | backend                          | present                 | channel chart           | SUPPORTED                     |
| Trend              | BusinessDate series              | present                 | line/bar trend          | SUPPORTED                     |
| Transaction rows   | not report requirement           | absent                  | link HU-015             | CORRECT                       |
| Pagination         | contract-dependent               | absent publicly         | not needed currently    | FULL RESPONSE                 |
| Full export source | complete report response         | supported               | summary + series        | SUPPORTED                     |

Generated and implementation evidence support this matrix. citeturn282602view0turn392052view0

### HU-029 Period Semantics

The historical public implementation applied report range filtering to sale confirmation timestamps while grouping its series through BusinessDate. The local authorized implementation now filters the joined report universe by `CashSession.BusinessDate` and groups that same universe, so:

`SALES_REPORT_PERIOD_SEMANTICS = BUSINESSDATE_CONSISTENT`

Frontend MUST continue to treat this backend date universe as authoritative and MUST NOT post-filter it.

## HU-030 Historical Actual Contract

| Aspect            | Expected           | Secondary actual            | Frontend need | Gap / Decision |
| ----------------- | ------------------ | --------------------------- | ------------- | -------------- |
| Endpoint          | inventory report   | `/api/v1/reports/inventory` | adapter       | SUPPORTED      |
| Historical period | none               | none                        | none          | CORRECT        |
| Rows              | current snapshot   | present                     | table/cards   | SUPPORTED      |
| totalCount        | backend            | present                     | card          | SUPPORTED      |
| lowCount          | backend            | present                     | card          | SUPPORTED      |
| negativeCount     | backend            | present                     | card          | SUPPORTED      |
| quantity          | real               | present                     | row           | SUPPORTED      |
| minStock          | nullable           | present                     | row           | SUPPORTED      |
| stockState        | real backend state | present                     | row           | SUPPORTED      |
| unit              | real               | present                     | row           | SUPPORTED      |
| Search            | conditional        | absent                      | omit          | NONBLOCKING    |
| Type              | conditional        | absent                      | omit          | NONBLOCKING    |
| Category          | conditional        | absent                      | omit          | NONBLOCKING    |
| Status filter     | conditional        | absent                      | omit          | NONBLOCKING    |
| generatedAt/asOf  | optional real only | absent                      | omit          | CORRECT        |
| Pagination        | contract dependent | absent publicly             | none          | FULL RESPONSE  |

The local inventory implementation continues to apply the NEGATIVE → LOW → NORMAL precedence and includes negative rows in lowCount as expected. citeturn392052view1

### HU-030 Authorization Drift — Factual Report

The endpoint still uses the existing `InventoryRead` policy. Its effective roles are `Administrator`, `Manager`, `Waiter`, `Kitchen` and `Accountant`, while the frozen frontend Reportes matrix targets ADMIN/ENC/CONTADORA/COCINA and excludes MESERO from the Reportes UI.

Therefore, direct HU-030 API access is broader for `Waiter/MESERO` than the frozen frontend navigation target. Product decision: retain the existing `InventoryRead` policy and do not narrow it in this change. Frontend hiding MUST NOT be described as backend security.

## HU-031 Historical Actual Contract

| Aspect               | Expected                     | Secondary actual                        | Frontend need                                   | Gap / Decision   |
| -------------------- | ---------------------------- | --------------------------------------- | ----------------------------------------------- | ---------------- |
| Endpoint             | attendance analytical report | `/api/v1/reports/attendance`            | adapter                                         | SUPPORTED        |
| Period               | from/to                      | present                                 | current month                                   | SUPPORTED        |
| Employee             | employeeId                   | present                                 | filter                                          | SUPPORTED        |
| Shift                | required                     | absent                                  | D27                                             | CORE GAP         |
| Employee rows        | aggregate                    | present                                 | main report                                     | SUPPORTED        |
| attendanceCount      | authoritative                | present                                 | row                                             | SUPPORTED        |
| workedMinutes        | authoritative                | present                                 | row                                             | SUPPORTED        |
| workedHours          | backend                      | present                                 | row                                             | SUPPORTED        |
| HourlyRate           | read-only                    | present                                 | row                                             | SUPPORTED        |
| ProjectedPay         | backend                      | present                                 | row                                             | SUPPORTED        |
| lateCount            | authoritative required       | field present                           | implementation requires correction/verification | CORE DATA GAP    |
| absenceCount         | authoritative required       | field present                           | implementation requires correction/verification | CORE DATA GAP    |
| report-level summary | required D32                 | absent                                  | cards                                           | CORE GAP         |
| Pagination           | contract dependent           | absent publicly                         | none                                            | FULL RESPONSE    |
| Employee options     | safe reader source needed    | unfiltered report returns Employee rows | selector                                        | LIKELY SUPPORTED |

The historical public DTO shape was sufficient for Employee analytics, but not for a separate report-level summary. citeturn208594view0

The historical public implementation calculated work/pay backend-side from closed records, which was aligned with D30/D31, but late/absence handling did not demonstrate the required HU-024-derived semantics. The local authorized implementation resolves that gap as documented above. citeturn392052view2turn931795view0

## Generated API Reconciliation

The backend report contract changed in this authorized continuation and the generated client was synchronized from the Development runtime OpenAPI:

`frontend/src/types/api.generated.ts: REGENERATED_BY_API_GENERATE`

- `cd frontend && pnpm run api:generate` completed successfully.
- No manual generated-client edit was made.
- The generated diff contains the HU-029 query parameters, HU-031 `shiftType`, validation responses, and `AttendanceReportSummaryDto`.
- The completed frontend APPLY consumes this generated contract without duplicating DTOs.

## Route Architecture

    /reportes
      → technical first-authorized redirect

    /reportes/ventas
      → HU-029

    /reportes/inventario
      → HU-030

    /reportes/asistencia
      → HU-031

No report landing/dashboard component is required.

## Report Navigation

One global item:

`Reportes`

Internal secondary navigation:

- Ventas.
- Inventario.
- Asistencia.

Visibility by effective report capability.

Deterministic default order:

1. Ventas.
2. Inventario.
3. Asistencia.

If current local navigation has a canonical module ordering abstraction, use it rather than hardcoding this list in several components.

## Authorization Matrix

Frozen frontend target:

| Report                 | ADMIN | ENC | CONTADORA | COCINA | MESERO | EMPLEADO |
| ---------------------- | ----: | --: | --------: | -----: | -----: | -------: |
| `/reportes/ventas`     |   YES | YES |       YES |     NO |     NO |       NO |
| `/reportes/inventario` |   YES | YES |       YES |    YES |     NO |       NO |
| `/reportes/asistencia` |   YES | YES |       YES |     NO |     NO |       NO |

Secondary backend observations:

- Sales report currently reuses a sales-history authorization policy that is broader than D7.
- Inventory report currently reuses `InventoryRead`, also broader than the frozen report navigation matrix.
- Attendance report uses the administrative attendance policy matching ADMIN/ENC/CONTADORA. citeturn760868view1turn178648view0

The frontend MUST use the frozen Reportes experience until maintainer decisions say otherwise, while documenting any backend API-policy drift rather than claiming frontend route guards solve it.

## Filter State Model

### HU-029

State:

- from.
- to.
- shiftType.
- channel.
- optional paymentMethod if real contract later supports it.

Defaults:

- current business month;
- shift empty;
- channel empty.

Clear:

- current business month;
- remaining filters empty;
- page reset if local contract later includes page.

### HU-030

No period.

Only expose real supported filters.

With public secondary contract:

- no report filter bar is required.

If local report gained supported filters:

- search/type/category/status can be added individually.

### HU-031

State:

- from.
- to.
- employeeId.
- shiftType.

Defaults:

- current business month;
- no employee;
- no shift.

Employee option source MUST be authorized for CONTADORA.

Preferred with current public contract:

- fetch the report universe without employeeId;
- use authoritative Employee IDs/names already present;
- do not call privileged User Management.

This MUST be revalidated if local contract becomes paginated.

## HU-029 Cards

Cards consume:

- `totalAmount` → Total vendido.
- `cashTotal` → Efectivo.
- `qrTotal` → QR.
- `externalTotal` → Pago externo.

Do not show:

- month-over-month percentage unless backend actually provides it.
- average ticket.
- margin.
- profit.
- goals.

## HU-029 Trend

Input:

`SalesReportSeriesDto[]`

Current observed fields:

- businessDate.
- salesCount.
- totalAmount.

Preferred implementation when no chart dependency exists:

- responsive SVG chart;
- real points only;
- labelled axes/legend where useful;
- textual supporting summary/table for accessibility;
- no synthetic interpolated BusinessDate points.

No new chart package is necessary unless local architecture already includes one or SVG implementation proves disproportionately complex.

## HU-029 Channel Distribution

Inputs:

- directTotal.
- pedidosYaTotal.

Use either:

- horizontal bars;
- proportional accessible bars;
- compact donut only if readable/accessibly supplemented.

Bars are preferred if they avoid adding chart-specific complexity.

Never treat:

`DIRECT + PEDIDOSYA`

as additional payment totals.

## HU-015 Boundary

Public navigation evidence currently shows Sales History as an existing dedicated route. The exact path MUST be revalidated locally before linking. citeturn148716view0

HU-029 uses:

`Ver historial de ventas`

No transaction rows are copied into Report Sales.

## HU-030 Snapshot Model

Flow:

    InventoryReportDto
      → backend total/low/negative summary
      → item list
      → desktop table / mobile cards
      → normalized export dataset

No:

- date range;
- trends;
- mutations;
- inventory valuation;
- replenishment recommendations.

## HU-030 Status Semantics

Backend authority.

Expected presentation:

| Backend state | Label          |
| ------------- | -------------- |
| NEGATIVE      | Saldo negativo |
| LOW           | Stock bajo     |
| NORMAL        | En stock       |

If a local generated enum/type becomes stricter, use it directly.

If current contract remains a string, centralize presentation mapping and provide safe fallback without creating a new business state.

Negative quantity remains numeric negative.

## COCINA Scope

The report endpoint itself must determine what COCINA may see.

Frontend logic:

    response rows
      → presentation

Not:

    broad response
      → role === COCINA
      → security filtering

If the final backend returns full inventory to COCINA, that is the authoritative scope unless identified as a backend defect by the contract audit.

## HU-031 Employee Analytics

Main desktop table:

- Employee.
- Attendance count.
- Late count.
- Absence count.
- Worked time.
- HourlyRate.
- ProjectedPay.
- optional `Ver asistencia`.

Mobile:

Employee analytical cards with the same data hierarchy.

No:

- CheckIn.
- CheckOut.
- per-date Attendance records.
- correction.
- payroll approval.

## HourlyRate and ProjectedPay

Current secondary implementation computes ProjectedPay backend-side from completed work. citeturn392052view2

Frontend:

- formats HourlyRate as money.
- formats ProjectedPay as money.
- MAY format workedMinutes to `h/min`.
- MUST NOT recompute pay.

XLSX:

- retain numeric HourlyRate.
- retain numeric ProjectedPay.
- retain numeric workedMinutes.

## HU-023 / HU-024 Boundaries

HU-023 owns:

- personal current attendance;
- self CheckIn/Out;
- own history.

HU-024 owns:

- administrative record-level attendance history/detail.

HU-031 owns:

- aggregate analytics by Employee.

`Ver asistencia` links to HU-024; it does not open another record-history implementation inside Reports.

## Shared Export Architecture

Proposed bounded architecture:

    report-specific DTO
      → report-specific normalizeForExport(...)
      → normalized dataset
          → CSV serializer
          → XLSX serializer
          → PDF serializer

Shared utilities MAY include:

- CSV cell sanitizer.
- CSV serializer.
- spreadsheet-safe text helper.
- download helper.
- filename builder.
- workbook adapter.
- PDF table adapter.
- full-page collector.
- Export menu/action state.

Report-specific code:

- Sales mapper.
- Inventory mapper.
- Attendance mapper.

No universal report schema beyond what serializers genuinely need.

## Normalized Export Dataset Shape

The exact TypeScript names are implementation details to derive locally.

Conceptual contract:

- report title.
- active filters.
- summary key/value entries.
- one or more typed tabular sections.
- export filename metadata.

The dataset MUST preserve raw numeric values separately from UI-formatted strings where machine-readable export benefits.

## HU-029 Export Dataset

Suggested sections:

### Summary

- salesCount if useful.
- totalAmount.
- cashTotal.
- qrTotal.
- externalTotal.
- directTotal.
- pedidosYaTotal.

### Data

Per BusinessDate:

- BusinessDate.
- SalesCount.
- TotalAmount.

This is the report dataset.

Do not fetch HU-015 transactions merely to make export look larger.

## HU-030 Export Dataset

Summary:

- totalCount.
- lowCount.
- negativeCount.

Rows:

- productName.
- quantity.
- unitSymbol.
- minStock.
- stockState.
- type/category only if real contract later exposes them.

## HU-031 Export Dataset

Summary:

backend aggregate fields only after D32 is contractually resolved.

Rows:

- employeeId if useful.
- fullName.
- attendanceCount.
- lateCount.
- absenceCount.
- workedMinutes.
- workedHours if retained by contract.
- hourlyRate.
- projectedPay.

## CSV Serializer

Responsibilities:

- UTF-8-friendly serialization.
- stable column ordering.
- quoting/escaping.
- newline handling.
- spreadsheet formula safety.
- no UI DOM dependency.

Recommended safety policy:

Text beginning with spreadsheet formula prefixes is neutralized before serialization while retaining readable content.

Exact escaping convention MUST be covered by tests.

## XLSX Serializer

Current public dependency audit indicates XLSX support is absent. citeturn788398view0

Future local dependency selection criteria:

- browser-only capable.
- compatible with React/Vite.
- TypeScript-friendly.
- maintained.
- acceptable license.
- no SaaS requirement.
- numeric cell support.
- reasonable bundle impact.
- one library only.
- testable adapter.

Do not lock a package name until package/lockfile local audit is complete.

Suggested workbook structure:

- `Resumen`.
- `Datos`.

If a report lacks meaningful summary:

- only `Datos` is acceptable.

## PDF Serializer

Current public package audit already includes `jspdf`. citeturn788398view0

Preferred:

- reuse existing PDF adapter patterns;
- do not add a second PDF library;
- lazy import when useful;
- render text/tables from normalized data;
- support multi-page tables.

No requirement to embed the visual chart.

## Full-Filtered Export Retrieval

Public secondary contracts currently return complete report datasets rather than paginated report rows:

- HU-029: complete aggregates/series.
- HU-030: complete item array.
- HU-031: complete Employee item array.

Therefore:

`ALL_PAGE_EXPORT_RETRIEVAL_REQUIRED: NO` for the observed public baseline.

If local contracts changed to pagination:

`ALL_PAGE_EXPORT_RETRIEVAL_REQUIRED: YES`

and the shared collector MUST:

1. capture filters;
2. request page 1;
3. read metadata;
4. sequentially request remaining pages;
5. validate stable filter identity;
6. stop at final page;
7. normalize complete dataset;
8. serialize requested format.

This is allowed only for explicit export.

## Dependency / Lazy Loading Strategy

Secondary audit:

| Capability | Public package state             | Design                                   |
| ---------- | -------------------------------- | ---------------------------------------- |
| CSV        | no specialized dependency needed | shared serializer                        |
| PDF        | EXISTING `jspdf`                 | reuse                                    |
| XLSX       | missing                          | one minimal dependency after local audit |
| Charts     | no dedicated library             | native SVG/CSS preferred                 |

Candidate heavy modules SHOULD be dynamically imported from the Export action where practical.

## Query Keys

Conceptual only:

- reports.sales(filters).
- reports.inventory(filters).
- reports.attendance(filters).

Exact factory names MUST follow current local convention.

Export refetches MUST not mutate visible pagination state.

## Date / Time

- HU-029 BusinessDate is date-only.
- HU-029/HU-031 current month uses the real business-time helper.
- HU-030 has no period.
- Export filenames use safe date strings.
- Browser-local timezone MUST NOT move BusinessDate across dates.

The expected project timezone is America/La_Paz, but local helper/config remains authoritative.

## Money

Reuse the current shared money formatter for UI.

For export:

- CSV uses a consistent machine-readable representation.
- XLSX uses numeric cells.
- PDF uses localized `Bs` presentation.

No frontend monetary recalculation beyond formatting.

## Loading / Empty / Error

Shared state model:

    INITIAL_LOADING
    READY
    BACKGROUND_REFRESH
    EMPTY
    FILTERED_EMPTY
    ERROR

HU-029 empty:

- cards may show backend zero values.
- charts show no-data state.
- no synthetic points.

HU-030 empty:

- backend zero summary.
- empty inventory list.

HU-031 empty:

- authoritative zero summary if backend supplies it.
- no fabricated Employee rows.

## Responsive

### HU-029

Desktop:

- filters.
- four cards.
- trend.
- channel distribution.
- history link.
- Export.

Mobile:

- cards.
- filter trigger.
- trend.
- channel distribution.
- history link.
- Export.

### HU-030

Desktop:

- summary.
- supported filters only.
- table.
- Export.

Mobile:

- summary.
- supported filter trigger.
- cards.
- Export.

### HU-031

Desktop:

- filters.
- summary.
- Employee table.
- Export.

Mobile:

- summary.
- filter trigger.
- Employee cards.
- Export.

## Accessibility

Charts:

- title.
- legend.
- textual values or supporting representation.
- no color-only distinctions.

Exports:

- keyboard-openable menu.
- focus-safe interaction.
- pending announcement/state.
- disabled repeated action.

Tables/cards:

- semantic headers.
- visible status text.
- structured data labels.

## Visual Audit

Status:

`PARTIAL_REFERENCE_AUDIT`

The exact PNG binaries named in the request were not available for direct pixel inspection in this turn. The mapping below therefore uses the supplied visual directives and MUST be revalidated against the actual images during repository explore.

### HU-029 — Admin Desktop

| Element                       | Decision                      |
| ----------------------------- | ----------------------------- |
| Report title                  | KEEP                          |
| Filters                       | KEEP / ADAPT to real contract |
| Four summary cards            | KEEP                          |
| Trend concept                 | KEEP                          |
| Channel distribution          | KEEP                          |
| Export                        | KEEP                          |
| Current AppShell              | ADAPT                         |
| Real Payment/Channel enums    | ADAPT                         |
| Transaction history table     | OMIT                          |
| Fake Sale IDs                 | OMIT                          |
| Salón/Delivery/Take Away      | OMIT                          |
| Unsupported trend percentages | OMIT                          |

### HU-029 — Mobile

| Element                     | Decision |
| --------------------------- | -------- |
| Cards                       | KEEP     |
| Filter trigger              | KEEP     |
| Trend                       | KEEP     |
| Distribution                | KEEP     |
| Export                      | KEEP     |
| Actual metrics/channels     | ADAPT    |
| AppShell                    | ADAPT    |
| Duplicate transaction cards | OMIT     |
| Fake Admin footer           | OMIT     |
| Hardcoded month             | OMIT     |

### HU-029 — States

| Element                    | Decision |
| -------------------------- | -------- |
| Skeleton                   | KEEP     |
| Empty                      | KEEP     |
| Error                      | KEEP     |
| Active-filter concept      | KEEP     |
| Shared current components  | ADAPT    |
| ProblemDetails-safe copy   | ADAPT    |
| Contactar soporte          | OMIT     |
| Fake technical error codes | OMIT     |

### HU-029 — MESERO

`OMIT` as a separate report experience.

MESERO remains in HU-015.

### HU-030 — Admin

| Element                      | Decision     |
| ---------------------------- | ------------ |
| Summary                      | KEEP         |
| Supported filters            | KEEP / ADAPT |
| Inventory table              | KEEP         |
| Export                       | KEEP         |
| Real states                  | ADAPT        |
| Type/category only when real | ADAPT        |
| Current AppShell             | ADAPT        |
| Unsupported actions          | OMIT         |

### HU-030 — COCINA

| Element                      | Decision         |
| ---------------------------- | ---------------- |
| Scoped inventory concept     | KEEP             |
| Low/negative emphasis        | KEEP             |
| Dataset scope                | ADAPT to backend |
| Separate Cocina report route | OMIT             |
| Pedidos sugeridos            | OMIT             |
| Invented status              | OMIT             |
| Fake sync timestamp          | OMIT             |

### HU-030 — Mobile

| Element                           | Decision |
| --------------------------------- | -------- |
| Summary                           | KEEP     |
| Search/filter only when supported | ADAPT    |
| Cards                             | KEEP     |
| Export                            | KEEP     |
| Reponer                           | OMIT     |
| Corregir                          | OMIT     |

### HU-031 — Admin

| Element                          | Decision                            |
| -------------------------------- | ----------------------------------- |
| Report filters                   | KEEP                                |
| Analytical summary               | KEEP subject to contract gap        |
| Table                            | KEEP / ADAPT to Employee aggregates |
| Export                           | KEEP                                |
| AttendanceRecord-by-record table | OMIT                                |

### HU-031 — Employee

`OMIT` as HU-031.

HU-023 owns the personal experience.

### HU-031 — Mobile

| Element                      | Decision                 |
| ---------------------------- | ------------------------ |
| Report header                | KEEP                     |
| Summary                      | KEEP subject to contract |
| Filter trigger               | KEEP                     |
| Employee cards               | KEEP / ADAPT             |
| Export                       | KEEP                     |
| Record-level attendance list | OMIT                     |

## Testing Strategy

### Shared Export

Test:

- normalized mapper consistency;
- CSV escaping;
- Unicode;
- spreadsheet formula safety;
- filename generation;
- download invocation;
- XLSX numeric cells;
- PDF content mapping;
- PDF multi-page table;
- empty report;
- pending state;
- failure;
- duplicate export prevention;
- paginated full collection if local contract requires it.

Do not test third-party library internals.

### HU-029

Test:

- route/auth.
- current month.
- period.
- Shift.
- Channel.
- backend cards.
- Payment/Channel separation.
- BusinessDate trend.
- channel distribution.
- no transaction table.
- HU-015 link.
- loading/empty/error.
- mobile composition.
- three full-report exports.

### HU-030

Test:

- role matrix.
- COCINA rendering backend dataset.
- backend summary.
- NEGATIVE/LOW/NORMAL.
- negative sign.
- minimum null.
- conditional filters only when present.
- desktop/mobile.
- no mutations.
- no fake sync.
- exports.

### HU-031

Test:

- role matrix.
- current month.
- Employee filter.
- Shift filter.
- backend summary.
- Employee analytics.
- backend late/absence.
- workedMinutes.
- HourlyRate read-only.
- ProjectedPay exact backend value.
- no open-clock pay calculation.
- no record-level duplicate.
- HU-024 link.
- exports.

## Regression Strategy

Must not regress:

- HU-015 Sales History.
- HU-023 personal Attendance.
- HU-024 administrative Attendance.
- Inventory operational screens.
- Cash/Shift flows.
- current AppShell/navigation.
- current auth/capability helpers.
- existing PDF behavior.

No report task should mutate those feature behaviors.

## Documentation Strategy

After the completed authorized APPLY:

Update only:

- HU-029.
- HU-030.
- HU-031.
- direct Sprint/OpenSpec status/traceability required by current convention.
- dependency documentation when XLSX package is added.
- export behavior.
- factual test/build evidence.

No broad historical rewrite.

## Evidence Placeholders

### HU-029

- [ ] desktop.
- [ ] tablet.
- [ ] 360.
- [ ] filters.
- [ ] summary.
- [ ] trend.
- [ ] channel distribution.
- [ ] CSV.
- [ ] XLSX.
- [ ] PDF.
- [ ] history link.
- [ ] loading.
- [ ] empty.
- [ ] error.
- [ ] keyboard/focus.
- [ ] no overflow.

### HU-030

- [ ] desktop.
- [ ] tablet.
- [ ] 360.
- [ ] ADMIN.
- [ ] COCINA.
- [ ] summary.
- [ ] LOW.
- [ ] NEGATIVE.
- [ ] NORMAL.
- [ ] filters.
- [ ] CSV.
- [ ] XLSX.
- [ ] PDF.
- [ ] no mutation.
- [ ] loading/empty/error.
- [ ] keyboard/focus.
- [ ] no overflow.

### HU-031

- [ ] desktop.
- [ ] tablet.
- [ ] 360.
- [ ] filters.
- [ ] summary.
- [ ] Employee analytics.
- [ ] HourlyRate.
- [ ] ProjectedPay.
- [ ] history link.
- [ ] CSV.
- [ ] XLSX.
- [ ] PDF.
- [ ] CONTADORA.
- [ ] loading/empty/error.
- [ ] keyboard/focus.
- [ ] no overflow.

All remain:

`DEFERRED_TO_SPRINT_FINAL_AUDIT`

during this block unless actual manual evidence is later collected.

## Components Touched

Likely areas:

- Report route layer.
- Navigation/capability layer.
- Report API/query layer.
- Sales Report feature.
- Inventory Report feature.
- Attendance Report feature.
- Export shared utilities.
- PDF adapter.
- XLSX adapter.
- CSV serializer.
- File-download/filename helpers.
- Native chart components for HU-029 if no chart package exists.
- Existing money/date/duration helpers.
- Tests.
- HU/OpenSpec docs.

Exact files MUST follow the local architecture.

## Boundaries Respected

- Backend remains authority.
- HU-015 remains Sales History.
- HU-023 remains personal Attendance.
- HU-024 remains administrative Attendance history.
- Inventory Report remains read-only.
- Report exports are client-side file generation, not domain mutations.
- Generated API remains generated and is changed only through the runtime OpenAPI pipeline.
- No DB changes.
- No generic BI system.
- No manual-evidence blocker.

## Contracts Changed

The following backend report contracts changed under explicit authorization for this continuation:

- HU-029 service/endpoint filters: `shiftType` and `salesChannel`.
- HU-029 date universe: inclusive `CashSession.BusinessDate` bounds shared by aggregates and series.
- HU-031 service/endpoint filter: `shiftType`.
- HU-031 authoritative derived lateness/absence and closed-work payroll projection.
- HU-031 `AttendanceReportSummaryDto` nested in `AttendanceReportDto`.

The generated TypeScript client was refreshed via runtime OpenAPI → `api:generate`; the frontend feature implementation is complete and recorded in the current APPLY evidence. HU-030 authorization remains unchanged and its role drift is reported above.

## Data Flow

### HU-029

    filters
      → Sales Report endpoint
      → backend aggregates + BusinessDate series
      → summary cards
      → trend
      → channel distribution
      → normalized export mapper
      → CSV/XLSX/PDF

HU-015 remains a separate linked destination.

### HU-030

    Inventory Report endpoint
      → backend point-in-time summary + items
      → cards
      → table/mobile cards
      → normalized export mapper
      → CSV/XLSX/PDF

No historical date flow.

### HU-031

    filters
      → Attendance Report endpoint
      → backend Employee analytics + authoritative summary
      → summary cards
      → Employee table/cards
      → optional HU-024 link
      → normalized export mapper
      → CSV/XLSX/PDF

No per-record attendance history reconstruction.

## Required Tests Per Layer

### Frontend unit/component

Add/extend tests for:

- export normalization.
- serializers/adapters.
- filters.
- summary mapping.
- chart mapping.
- status labels.
- analytical rows.
- route guards.
- navigation.
- query states.

### Frontend integration

Verify:

- route + filters → correct query.
- full report → exports.
- history links.
- all-page collection if local contracts are paginated.

### Backend

Added `OperationsReportsPostgresIntegrationTests.cs` with two PostgreSQL scenarios covering:

- HU-029 inclusive BusinessDate bounds, Shift/Channel filters, combined filters, payment/channel aggregates and series coherence.
- HU-031 period/Employee/Shift filters, derived lateness/absence, open-clock exclusion, closed-work pay and global summary coherence.

Verification also ran the existing targeted attendance/operations regression selection (37 tests).

### Manual

Deferred.

## Tradeoffs Accepted

- No Reportes landing dashboard.
- No chart package unless local audit establishes a compelling need.
- HU-030 may have no user filters if backend contract remains unfiltered.
- HU-029 export reflects the Sales Report read model rather than transactional Sales History.
- HU-031 report remains Employee-aggregate instead of becoming another Attendance History.
- CSV is simple/tabular; XLSX/PDF may present metadata more richly while sharing the same normalized source.
- One XLSX dependency is acceptable because D4 explicitly requires XLSX.
- Heavy export adapters may use dynamic imports to reduce initial report bundle cost.

## Implementation Constraints

- Keep frontend report implementation within the allowlisted report surfaces; no unrelated product areas are changed.
- Record the local baseline before implementation.
- Preserve uncommitted prior-block work.
- Keep any further backend work outside the authorized report reconciliation out of scope.
- Do not add backend authorization changes silently.
- Do not manually edit generated TypeScript.
- Do not export current page as full report.
- Do not calculate report summary from visible rows.
- Do not scrape DOM.
- Do not reparse CSV.
- Do not mix Payment and Channel.
- Do not add inventory mutations.
- Do not calculate ProjectedPay.
- Do not convert open attendance time to report pay.
- Do not install more than the minimum export dependency needed.
- Do not collect manual evidence as an APPLY gate.

## Open Design Questions

The formerly blocking backend questions are resolved for the authorized scope:

- HU-029 Shift: `SUPPORTED_LOCAL`.
- HU-029 Channel: `SUPPORTED_LOCAL`.
- HU-029 BusinessDate-consistent period: `SUPPORTED_LOCAL`.
- HU-031 Shift: `SUPPORTED_LOCAL`.
- HU-031 derived late/absence: `SUPPORTED_LOCAL`.
- HU-031 backend-authoritative report summary: `SUPPORTED_LOCAL`.

Remaining non-blocking follow-ups after the completed APPLY:

- Manual visual/responsive/accessibility evidence remains `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
- Future report contracts may require an explicit all-page export collector if they become paginated; the current local report responses are full datasets.
- HU-030 authorization is intentionally unchanged: retain the broader `InventoryRead` policy and document the MESERO/Waiter UI drift.

## Current Frontend APPLY Evidence — 2026-09-02

- Routes and guards: `/reportes/ventas`, `/reportes/inventario` and `/reportes/asistencia` with independent frozen-role guards; `/reportes` redirects in Ventas → Inventario → Asistencia priority order.
- Navigation: global `Reportes` and secondary tabs use the capability union; MESERO and EMPLEADO receive no Reportes UI, while COCINA receives only Inventario.
- Query layer: typed `httpClient` adapters and TanStack Query keys consume the generated HU-029/HU-030/HU-031 contracts; current-month defaults use `America/La_Paz` business dates.
- Presentation: backend-authoritative zero summaries remain visible, with explicit empty row/series states, failed-refresh feedback, responsive mobile filter Modal, and plain `/asistencia` HU-024 links.
- Exports: one normalized full response dataset per report feeds CSV, `xlsx@^0.18.5` XLSX and existing `jspdf` PDF adapters; no DOM scraping, CSV reparsing or current-page limitation.
- Verification: targeted Prettier, `pnpm run typecheck`, `pnpm run lint`, full Vitest (`42` files / `245` tests), production build, frozen offline install and `git diff --check` passed. Repository-wide Prettier is intentionally not applied to the preserved pnpm lockfile; its canonical pre-existing style is the only whole-check caveat.
- Manual visual/responsive/accessibility evidence: `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
