# Spec

## Requirements

### Global Reports Architecture

- The frontend MUST expose `/reportes/ventas`, `/reportes/inventario`, and `/reportes/asistencia` as independent report routes.
- `/reportes` MUST NOT introduce a fourth report dashboard page.
- `/reportes` SHOULD redirect to the deterministic first report authorized for the current capability union.
- Reports MUST remain read-only domain views.
- Reports MUST reuse the current AppShell.
- Reports MUST reuse the existing TanStack Query client and HTTP client.
- Reports MUST NOT introduce a second query client.
- Reports MUST NOT use raw `fetch` when an existing typed API infrastructure is available.
- Reports MUST NOT duplicate HU-015, HU-023, or HU-024.
- Reports MUST NOT introduce product mutations.
- Shared report code SHOULD be limited to truly reusable navigation, export and presentation primitives.
- The implementation MUST NOT create a universal reporting engine, BI framework, DSL, or generic repository abstraction.

### Blocking Contract Reconciliation

- HU-029 MUST support Period, Shift and Channel as backend-filtered dimensions.
- HU-029 MUST NOT simulate Shift or Channel filters by filtering client-visible rows.
- HU-029 period semantics MUST represent the same logical BusinessDate report universe used by its time series.
- HU-031 MUST support Period, Employee and Shift as backend-filtered dimensions.
- HU-031 MUST NOT simulate Shift filtering client-side.
- HU-031 late and absence analytics MUST be backend-authoritative and MUST NOT be replaced with frontend inference.
- HU-031 analytical summary MUST use backend-authoritative aggregate data and MUST NOT be calculated from the visible employee page/list.
- The former HU-029/HU-031 core gaps are resolved in this change under explicit backend authorization; the local implementation and PostgreSQL evidence are recorded in `apply-progress.md`.
- Any future frontend APPLY MUST consume the reconciled runtime contract through the normal generated-client pipeline rather than reintroduce client-side workarounds.
- Conditional HU-030 filters MUST NOT block implementation when absent from the real contract.

### Authorized Backend Reconciliation

- HU-029 report requests MUST accept `from`, `to`, `shiftType` and `salesChannel`.
- HU-029 date bounds MUST be inclusive `CashSession.BusinessDate` bounds, and aggregates and series MUST be computed from the same filtered joined universe.
- HU-031 report requests MUST accept `from`, `to`, `employeeId` and `shiftType`.
- HU-031 MUST derive lifecycle, lateness and absence through `AttendanceDerivationService` and MUST derive closed-work minutes/hours/pay through `PayrollProjectionCalculator`.
- HU-031 MUST expose an `AttendanceReportSummaryDto` nested in `AttendanceReportDto`; summary values MUST aggregate the complete filtered dataset represented by the response items.
- HU-030 `InventoryRead` authorization MUST remain unchanged in this scope; its broader `Waiter/MESERO` direct-access role is a documented drift, not a frontend security guarantee.
- Focused PostgreSQL integration coverage MUST exercise the HU-029 and HU-031 filter and aggregate semantics.
- Generated TypeScript MUST be regenerated from the runtime OpenAPI contract after this authorized backend change; it MUST NOT be manually edited.

### Routes and Navigation

- A global `Reportes` item MUST be visible only when the user has at least one report capability.
- A user with multiple report capabilities MUST receive the union of those capabilities.
- The frontend MUST NOT use a most-restrictive-role-wins model.
- Secondary report navigation MUST show only authorized reports.
- Disabled unauthorized report tabs SHOULD NOT be rendered solely to advertise unavailable capabilities.
- Direct route access MUST be guarded independently from navigation visibility.
- ADMINISTRADOR SHOULD receive Ventas, Inventario and Asistencia when backend policies confirm the frozen matrix.
- ENCARGADO SHOULD receive Ventas, Inventario and Asistencia when backend policies confirm the frozen matrix.
- CONTADORA SHOULD receive Ventas, Inventario and Asistencia when backend policies confirm the frozen matrix.
- COCINA SHOULD receive only Inventario.
- MESERO MUST NOT receive a new Reports UI.
- EMPLEADO MUST NOT receive a Reports UI under the frozen scope.

### Report Data Authority

- Report aggregates MUST use backend-provided report data and MUST NOT be calculated from the visible paginated page.
- Backend-provided status values MUST remain authoritative.
- Backend-provided series MUST remain authoritative.
- Backend-provided worked time MUST remain authoritative.
- Backend-provided ProjectedPay MUST remain authoritative.
- Client derivations MAY format values, derive labels from enums, generate chart geometry from backend values and build export files.
- Client presentation logic MUST NOT redefine report business rules.

### Export Architecture

- All three reports MUST support CSV, XLSX and PDF.
- CSV, XLSX and PDF exports MUST represent the same full filtered report dataset.
- Exports MUST NOT be limited to the currently visible page.
- Exports MUST be constructed from typed report data rather than scraping rendered DOM content.
- PDF and XLSX MUST consume the same normalized report export data used by CSV.
- PDF and XLSX MUST NOT reparse a generated CSV as their data source.
- Each report MUST define one report-specific normalized export mapping.
- Shared serializers MAY consume those normalized datasets.
- Changing UI page MUST NOT change export contents.
- Changing report filters MUST change export contents.
- Export MUST snapshot the active filter set at the start of the operation.
- An export already in progress SHOULD NOT silently switch filters if the UI state changes.
- Duplicate export submissions MUST be prevented while the current export is pending.
- Export failure MUST NOT trigger download of a known partial/corrupt file.
- Export MUST NOT upload data to a third-party SaaS service.
- Export MUST NOT create a database record.
- Export MUST NOT mutate domain state.

### Full-Filtered Retrieval

- When the report contract directly returns the complete filtered dataset, export MUST reuse that full dataset or refetch the equivalent current filter snapshot.
- When the report row contract is paginated, an explicit Export action MAY sequentially retrieve all filtered pages.
- All-page retrieval MUST use identical report filters for every page.
- All-page retrieval MUST use real pagination metadata.
- All-page retrieval MUST NOT begin at the visible UI page and omit previous rows.
- All-page retrieval MUST detect termination deterministically.
- All-page retrieval MUST NOT create an unbounded pagination loop.
- All-page retrieval SHOULD expose meaningful pending/progress feedback when multiple requests are required.
- All-page retrieval MAY support cancellation when current infrastructure makes AbortSignal integration straightforward.
- All-page retrieval MUST be used only for explicit export, not for screen aggregates that already have backend authority.
- If a full filtered dataset cannot be safely enumerated from the real contract, export MUST be classified as a contract gap rather than silently exporting the current page.

### CSV

- CSV MUST use UTF-8-compatible content.
- CSV MUST use stable, descriptive headers.
- CSV MUST correctly escape delimiters, quotes and newlines.
- CSV MUST preserve the full filtered report dataset.
- Text cells that can be interpreted as spreadsheet formulas SHOULD be neutralized using one consistent sanitization strategy.
- Formula safety MUST apply to untrusted/display text such as Employee, Product and Category names.
- CSV MUST NOT serialize rendered HTML or DOM text.

### XLSX

- XLSX MUST consume normalized typed report data.
- Numeric report values SHOULD remain numeric workbook cells when supported.
- XLSX MAY contain `Resumen` and `Datos` sheets.
- XLSX MUST contain at least a useful `Datos` representation when report rows exist.
- XLSX MUST apply the same spreadsheet text-safety policy as CSV where applicable.
- The implementation MUST NOT manually construct XLSX binary data when a maintained client-side library is selected.
- Only one XLSX-writing dependency SHOULD be added if current package audit confirms none exists.
- Heavy XLSX code MAY be loaded dynamically from the Export action.

### PDF

- PDF MUST be generated client-side under the current product decision.
- PDF MUST consume normalized typed report data.
- PDF SHOULD include report name, active filters, relevant summary and tabular report data.
- PDF MAY include export-generation timestamp when clearly labelled as export metadata.
- PDF MUST NOT represent export-generation time as the report's business timestamp.
- PDF does not need embedded charts.
- PDF SHOULD prefer real text/table generation over screenshotting the report DOM.
- Existing PDF infrastructure SHOULD be reused when the local package audit confirms it remains appropriate.
- Heavy PDF adapter code MAY be dynamically imported.

### Export Empty State

- Export MUST NOT silently create a misleading empty file.
- The Export action SHOULD be disabled when the authoritative report contains no exportable dataset, or MUST show explicit no-data feedback if invoked.
- Summary-only report content MAY still be exportable only when the report-specific design explicitly defines a meaningful output.

### HU-029 — Authorization and Filters

- HU-029 MUST use `/reportes/ventas`.
- HU-029 frontend experience MUST target ADMINISTRADOR, ENCARGADO and CONTADORA.
- MESERO MUST continue using HU-015 rather than receive a separate HU-029 screen.
- HU-029 MUST default to the current business month.
- HU-029 MUST support Period.
- HU-029 MUST support Shift.
- HU-029 MUST support Channel.
- PaymentMethod MAY be exposed as an additional filter only if the real contract supports it cleanly.
- Clearing filters MUST restore current month and clear Shift, Channel and optional PaymentMethod.
- Invalid `from > to` MUST use existing validation/error conventions and MUST NOT be silently reversed.
- Shift MUST use the real enum.
- The frontend MUST NOT expose `TARDE`.
- Channel MUST use real generated values.
- The frontend MUST NOT expose mockup-only `SALON`, `DELIVERY`, or `TAKE_AWAY` unless the domain contract actually changes.

### HU-029 — Summary

- HU-029 MUST display Total vendido from the authoritative backend total.
- HU-029 MUST display Efectivo from the authoritative CASH total.
- HU-029 MUST display QR from the authoritative QR total.
- HU-029 MUST display Pago externo from the authoritative EXTERNAL total.
- Total vendido MUST NOT be recomputed as CASH + QR + EXTERNAL when a backend total already exists.

### HU-029 — Payment vs Channel

- CASH MUST be treated as a PaymentMethod.
- QR MUST be treated as a PaymentMethod.
- EXTERNAL MUST be treated as a PaymentMethod.
- DIRECT MUST be treated as a SalesChannel.
- PEDIDOSYA MUST be treated as a SalesChannel.
- PEDIDOSYA MUST NOT be shown as a PaymentMethod.
- EXTERNAL MUST NOT be shown as a SalesChannel.

### HU-029 — Trend

- HU-029 MUST show a temporal sales chart.
- The sales trend MUST use the backend report series.
- BusinessDate MUST be rendered as date-only.
- Missing dates MUST NOT be fabricated as zero-sales points unless the backend contract explicitly defines missing date as zero.
- If backend returns only total daily series, the chart MUST show only that real series.
- Channel-specific time series MUST NOT be derived from unrelated history rows solely to enrich the chart.
- The chart MUST provide non-hover-only meaning through labels, legend and/or equivalent textual representation.
- Color MUST NOT be the only series discriminator.

### HU-029 — Channel Distribution

- HU-029 MUST display backend channel distribution for DIRECT and PEDIDOSYA.
- The visualization MAY use bar, donut, or another accessible compact representation.
- The visualization MUST use authoritative channel totals.
- Chart geometry MUST NOT become the source used to recover numerical values.

### HU-029 — HU-015 Boundary

- HU-029 MUST NOT render a duplicated sales transaction history table.
- HU-029 MUST NOT create another Sale Detail.
- HU-029 MUST provide `Ver historial de ventas` when the user is authorized for HU-015.
- The link MUST use the real current HU-015 route.
- Compatible filters MAY be transferred through query params only if current HU-015 already supports that integration cleanly.
- Filter transfer MUST NOT block HU-029.

### HU-029 Export

- HU-029 export MUST represent the filtered report read model, not HU-015 transaction history.
- HU-029 normalized export data SHOULD include report filters, authoritative summary, BusinessDate series and channel breakdown in a coherent representation.
- CSV MAY use BusinessDate series as its primary row dataset.
- XLSX MAY use `Resumen` plus time-series `Datos`.
- PDF SHOULD use summary, filters, series table and channel breakdown.
- HU-029 export MUST NOT invent transaction rows absent from the report contract.

### HU-030 — Authorization and Snapshot

- HU-030 MUST use `/reportes/inventario`.
- HU-030 MUST represent a current point-in-time inventory report.
- HU-030 MUST NOT introduce a historical period filter.
- ADMINISTRADOR MUST be allowed when confirmed by actual backend policy.
- ENCARGADO MUST be allowed when confirmed by actual backend policy.
- COCINA MUST be allowed when confirmed by actual backend policy.
- CONTADORA MUST be allowed when confirmed by actual backend policy.
- MESERO MUST NOT receive the Reportes UI under the frozen navigation model.
- Backend scope MUST remain authoritative for COCINA.
- The frontend MUST NOT fetch broad inventory data and hide unauthorized rows as a security boundary.

### HU-030 — Summary and Status

- HU-030 MUST display low-stock count from backend.
- HU-030 MUST display negative-stock count from backend.
- HU-030 MUST display total item count from backend.
- Negative inventory MUST remain negative and MUST NOT be clamped to zero.
- When backend returns status, the frontend MUST consume it rather than independently redefine inventory business state.
- Conceptually, NEGATIVE MUST have priority over LOW when that is the actual backend rule.
- A negative item MAY contribute to lowCount while the row itself MUST be labelled NEGATIVE rather than both LOW and NEGATIVE.
- `minimumStock == null` MUST NOT automatically mean LOW.
- Null minimum stock SHOULD render using the current empty-value convention.
- Unit MUST use the real returned unit; the report MUST NOT perform unit conversion.

### HU-030 — Filters

- Product search MUST be included only if the current report contract supports it.
- Product type filter MUST be included only if the current report contract supports it.
- Category filter MUST be included only if the current report contract and an authorized option source support it.
- Status filter MUST be included only if the current report contract supports it.
- Unsupported conditional filters MUST be omitted rather than simulated over the visible subset.
- The absence of conditional HU-030 filters MUST NOT by itself block the change.

### HU-030 — Rows and UX

- Desktop SHOULD use an accessible inventory table.
- Mobile SHOULD use inventory cards.
- Rows/cards MAY show only actual report DTO fields.
- Inline Reponer, Corregir, Editar mínimo or Registrar movimiento controls MUST NOT exist.
- Operational links MAY be offered only when the target module already exists and current capability allows access.
- Fetch time MUST NOT be shown as `Última sincronización`.
- `asOf` or `generatedAt` MAY be displayed only when backend returns it.

### HU-030 Export

- HU-030 export MUST represent the complete current filtered snapshot.
- Normalized rows SHOULD contain only actual fields such as Product, Quantity, Unit, MinimumStock and Status, plus Type/Category if actually provided.
- XLSX MAY include authoritative low/negative/total summary.
- PDF SHOULD include snapshot/report metadata, authoritative summary, supported filters and table.
- Charts are not required.

### HU-031 — Authorization and Purpose

- HU-031 MUST use `/reportes/asistencia`.
- HU-031 MUST be an analytical Employee report.
- HU-031 MUST NOT create another `/mi-asistencia`.
- HU-031 MUST NOT duplicate the HU-024 record-by-record history as its main content.
- ADMINISTRADOR MUST be allowed when actual policy confirms it.
- ENCARGADO MUST be allowed when actual policy confirms it.
- CONTADORA MUST be allowed when actual policy confirms it.
- Operational roles without administrative report capability MUST be denied.

### HU-031 — Filters

- HU-031 MUST default to the current business month.
- HU-031 MUST support Period.
- HU-031 MUST support Employee.
- HU-031 MUST support Shift.
- Shift MUST use real generated values such as MORNING/NIGHT when confirmed.
- The frontend MUST NOT expose TARDE.
- An additional attendance condition MAY be shown only if the report contract directly supports it and it adds analytical value.
- Employee options MUST come from an endpoint/data source authorized for CONTADORA as well as ADMIN/ENC.
- The frontend MUST NOT use privileged User Management merely to populate this filter.
- If the report's unfiltered items provide the complete Employee option universe, that report data MAY be reused as the authorized option source.
- Employee options MUST NOT be derived only from a paginated visible page.

### HU-031 — Employee Analytics

- Main rows/cards MUST be aggregated by Employee.
- Rows SHOULD show real backend fields corresponding to:
  - Employee;
  - attendance count;
  - late count;
  - absence count;
  - worked time;
  - HourlyRate;
  - ProjectedPay.
- HourlyRate MUST be read-only.
- ProjectedPay MUST use the backend value.
- ProjectedPay MUST NOT be authoritatively recalculated by the frontend.
- WorkedMinutes MUST use the backend report value.
- Open attendance MUST NOT be converted to final worked time using the browser clock.
- Absence MUST remain backend-derived.
- Missing CheckOut MUST NOT be treated as absence by frontend.
- If only lateCount is provided, the frontend MUST NOT invent aggregate lateMinutes.

### HU-031 — Summary

- HU-031 SHOULD display authoritative report-level summary for worked time, lateness, absence and projected pay according to the final contract.
- Summary MUST NOT be derived from the visible Employee page.
- Summary MUST NOT be derived from DOM rows.
- If the backend contract lacks required report-level aggregates, the frontend MUST NOT fabricate the four cards.
- A missing authoritative summary under unchanged D32 MUST be treated as a contract gap.

### HU-031 — HU-024 Boundary

- Employee report rows MAY offer `Ver asistencia` when the user can access HU-024.
- The link MUST target the real HU-024 route.
- Employee and period MAY be transferred when HU-024 supports those query parameters cleanly.
- HU-031 MUST NOT introduce an AttendanceRecord detail implementation.

### HU-031 Export

- HU-031 export MUST represent the full filtered Employee analytical report.
- Normalized data SHOULD preserve numeric workedMinutes.
- Normalized data MAY additionally include a human-readable worked-time column.
- HourlyRate and ProjectedPay SHOULD remain numeric in XLSX.
- PDF SHOULD contain report title, filters, summary and Employee analytics table.
- Charts are not required.

### Query Infrastructure

- Report server state MUST use TanStack Query.
- Query keys MUST include every active server filter.
- Query keys for different reports MUST remain distinct.
- Export retrieval MUST preserve the current filter snapshot.
- Export-page retrieval MUST NOT contaminate visible page state.
- Dedicated typed API calls or QueryClient fetch operations MAY be used according to current local architecture.
- Pages from different filters MUST NOT be concatenated into one export.

### Loading / Empty / Error

- Each report MUST define initial loading.
- Each report MUST define background refresh behavior.
- Each report MUST define empty report.
- Each report MUST define filtered-empty behavior when filters exist.
- Each report MUST define recoverable error + Retry.
- Background refetch SHOULD preserve existing report content where current query patterns support it.
- Empty charts MUST NOT fabricate synthetic zero points.
- Error UI MUST use current ProblemDetails/error parsing.
- Raw exceptions MUST NOT be rendered.
- Fake support CTAs MUST NOT be added.
- Fake technical error codes MUST NOT be added.

### Responsive

- Reports MUST be responsive-ready at 360 px.
- Reports MUST be responsive-ready near 768 px.
- Reports MUST be responsive-ready at >=1280 px.
- Mobile filter sets with more than two controls SHOULD use the current Sheet/Drawer/Modal pattern.
- HU-029 mobile MUST prioritize summary, trend, channel distribution, history link and export.
- HU-030 mobile SHOULD use cards.
- HU-031 mobile SHOULD use Employee analytical cards.
- Charts MUST NOT cause page-level horizontal overflow.
- The current AppShell MUST win over historical mockup shells.

### Accessibility

- Report navigation MUST be keyboard accessible.
- Filter controls MUST have labels.
- Mobile filter overlays MUST preserve focus management according to current shared primitives.
- Tables MUST use semantic headers.
- Cards SHOULD expose structured labels rather than rely on visual position alone.
- Inventory status MUST NOT rely only on color.
- Chart meaning MUST NOT rely only on color or hover.
- Export menu/actions MUST be keyboard operable.
- Export pending state MUST be perceivable.
- Error feedback MUST use semantic alert conventions.

### Evidence Policy

- Manual responsive evidence MUST be `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
- Manual accessibility walkthrough MUST be `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
- Manual screenshots MUST NOT block future APPLY completion.
- This block MUST NOT claim manual PASS without evidence.
- Automated responsive/a11y-oriented tests MAY be used where practical.
- Code-level responsive and accessibility requirements remain mandatory.

## Behavior Scenarios

### Scenario 1: Global Reportes visibility

Given a user has at least one authorized report capability  
When the AppShell navigation renders  
Then `Reportes` MUST be visible

### Scenario 2: User has no report capability

Given a pure MESERO or EMPLEADO has no report capability under the frozen matrix  
When navigation renders  
Then `Reportes` MUST NOT be shown

### Scenario 3: First authorized report redirect

Given a user opens `/reportes`  
When the user has one or more report capabilities  
Then the route MUST redirect deterministically to the first authorized report

### Scenario 4: COCINA report redirect

Given a pure COCINA can access only Inventory Report  
When `/reportes` resolves  
Then it MUST redirect to `/reportes/inventario`

### Scenario 5: Direct unauthorized route

Given a user lacks Sales Report capability  
When `/reportes/ventas` is opened directly  
Then the route guard MUST deny access regardless of navigation visibility

### Scenario 6: Multi-role union

Given a user has COCINA plus CONTADORA  
When report capabilities are resolved  
Then the user MUST receive the union of report access rather than the most restrictive role

### Scenario 7: CSV export

Given a non-empty filtered report  
When the user chooses CSV  
Then the generated file MUST represent the complete filtered report dataset

### Scenario 8: XLSX export

Given the same report/filter snapshot used in Scenario 7  
When the user chooses XLSX  
Then XLSX MUST represent the same normalized report data

### Scenario 9: PDF export

Given the same report/filter snapshot used in Scenario 7  
When the user chooses PDF  
Then PDF MUST represent the same normalized report data and relevant summary

### Scenario 10: Visible pagination does not constrain export

Given the user is viewing a middle page of a paginated report  
When Export is triggered  
Then exported rows MUST cover the full filtered dataset rather than the visible page

### Scenario 11: Filter changes affect export

Given Export A is generated under filter set A  
When filters change to B and Export B is generated  
Then Export B MUST represent filter set B

### Scenario 12: Export double click

Given export generation is pending  
When the user activates Export again  
Then a duplicate export operation MUST NOT start

### Scenario 13: Export failure

Given all-page collection or file generation fails  
When the failure is detected  
Then safe feedback MUST be shown  
And no known partial file MUST be downloaded

### Scenario 14: Empty export

Given the authoritative report contains no exportable rows  
When Export is offered or invoked  
Then the UI MUST prevent a misleading silent empty download

### Scenario 15: Formula-like text

Given an Employee or Product text value starts with a spreadsheet formula character  
When CSV/XLSX is built  
Then the configured text-safety strategy MUST prevent accidental formula execution

### Scenario 16: HU-029 current month

Given an authorized Sales Report user first opens `/reportes/ventas`  
When the report query is created  
Then current business month MUST be the default period

### Scenario 17: HU-029 Shift filter

Given the final contract supports Shift  
When NIGHT is selected  
Then the backend report request MUST receive the generated NIGHT value

### Scenario 18: HU-029 Channel filter

Given PEDIDOSYA is selected as Channel  
When the report is queried  
Then PEDIDOSYA MUST be transmitted as a SalesChannel rather than a PaymentMethod

### Scenario 19: HU-029 summary

Given backend returns totalAmount, cashTotal, qrTotal and externalTotal  
When cards render  
Then those values MUST be displayed without recalculating them from rows

### Scenario 20: HU-029 trend

Given backend series contains BusinessDate points  
When the trend renders  
Then only those authoritative series points MUST determine the chart

### Scenario 21: HU-029 channel distribution

Given backend returns directTotal and pedidosYaTotal  
When channel distribution renders  
Then DIRECT and PEDIDOSYA MUST be presented as channels

### Scenario 22: HU-029 no history duplication

Given HU-029 renders successfully  
When the main report content is inspected  
Then it MUST NOT contain a second sales transaction-history table  
And SHOULD offer the authorized HU-015 link

### Scenario 23: HU-030 current snapshot

Given an authorized user opens `/reportes/inventario`  
When the report is loaded  
Then no historical period filter MUST be required

### Scenario 24: HU-030 negative stock

Given backend returns quantity below zero and NEGATIVE status  
When the item renders  
Then the negative sign MUST remain visible  
And the status MUST be `Saldo negativo`

### Scenario 25: HU-030 low stock

Given backend returns LOW status  
When the item renders  
Then it MUST be presented as `Stock bajo`

### Scenario 26: HU-030 minimum null

Given an inventory item has minimumStock null  
When the row/card renders  
Then the minimum MUST use the empty-value convention  
And the frontend MUST NOT invent LOW status

### Scenario 27: HU-030 COCINA

Given a pure COCINA is authorized by the final backend report policy  
When Inventory Report loads  
Then the UI MUST display exactly the backend-authorized dataset  
And MUST NOT implement security by hiding rows client-side

### Scenario 28: HU-030 no mutation

Given any authorized Inventory Report user  
When report rows/cards render  
Then no quantity correction, minimum-stock edit or replenishment mutation MUST appear

### Scenario 29: HU-031 current month

Given an authorized Attendance Report user first opens the report  
When the query is created  
Then current business month MUST be used

### Scenario 30: HU-031 Employee filter

Given a valid Employee is selected  
When the report is queried  
Then the real employee identifier MUST be transmitted server-side

### Scenario 31: HU-031 Shift filter

Given MORNING is selected  
When the final contract is queried  
Then the generated MORNING value MUST be sent server-side

### Scenario 32: HU-031 analytics row

Given backend returns an Employee report row  
When it renders  
Then attendance count, lateness, absence, worked time, HourlyRate and ProjectedPay MUST use backend values

### Scenario 33: HU-031 open attendance

Given an Employee has an open AttendanceRecord  
When report worked/pay values are displayed  
Then the frontend MUST NOT add browser-clock elapsed time to workedMinutes or ProjectedPay

### Scenario 34: HU-031 projected pay

Given backend returns projectedPay  
When the Employee row renders  
Then the exact backend monetary value MUST be used as authority

### Scenario 35: HU-031 summary

Given backend provides report-level authoritative summary  
When cards render  
Then they MUST use those aggregate values and MUST NOT sum visible Employee rows

### Scenario 36: HU-031 attendance-history link

Given the current user can access HU-024  
When an Employee report row offers `Ver asistencia`  
Then the link MUST navigate to the real HU-024 route without creating another history implementation

### Scenario 37: HU-029 BusinessDate reconciliation

Given a sale has a confirmation timestamp outside a requested date while its cash session BusinessDate is inside the range  
When the Sales Report is queried  
Then the sale MUST be included by the BusinessDate range and the same row MUST contribute to its daily series

### Scenario 38: HU-031 derived summary

Given filtered assignments include a late closed record, an absence and an open record  
When the Attendance Report is queried  
Then late/absence counts MUST come from backend attendance derivation, open work MUST contribute zero final work/pay, and the summary MUST equal the filtered Employee rows

## Edge Cases

### Export

- UTF-8 accents.
- commas.
- quotes.
- embedded newlines.
- text beginning `=`.
- text beginning `+`.
- text beginning `-`.
- text beginning `@`.
- zero rows.
- one row.
- many pages.
- filter state changes while export is pending.
- export double-click.
- API failure on an intermediate page.
- inconsistent pagination metadata.
- large monetary values.
- decimal values.
- nullable optional fields.
- browser download failure.
- PDF table spanning multiple pages.
- XLSX numeric cells.
- user leaves route during an export.
- two export formats requested sequentially.

### HU-029

- no sales.
- total zero.
- only CASH.
- only QR.
- only EXTERNAL.
- only DIRECT.
- only PEDIDOSYA.
- a BusinessDate missing from series.
- month boundary.
- timezone boundary.
- long supported period.
- Shift with no matching sales.
- Channel with no matching sales.

### HU-030

- zero quantity.
- negative quantity.
- minimumStock zero.
- minimumStock null.
- decimal quantity.
- long product name.
- missing category because contract has none.
- COCINA.
- empty dataset.
- conditional filter absent.
- backend stockState string outside known mapping.
- no asOf/generatedAt.

### HU-031

- Employee with no completed attendance.
- only absences.
- only late records.
- zero workedMinutes.
- HourlyRate zero if model permits.
- projectedPay zero.
- nullable legacy display data.
- inactive historical Employee.
- long Employee name.
- current open attendance.
- month boundary.
- no Shift matches.
- summary all zeros.
- Employee options source unavailable to CONTADORA.

## Acceptance Criteria

- Local branch, HEAD and working tree were revalidated for this continuation.
- HU-029 Shift and Channel contract support is confirmed by the local endpoint, interface and service implementation.
- HU-029 period semantics are reconciled with BusinessDate in the local service.
- HU-031 Shift filter is confirmed by the local endpoint, interface and service implementation.
- HU-031 late/absence analytics use the existing derivation service.
- HU-031 backend summary support is confirmed by `AttendanceReportSummaryDto` and the local integration scenario.
- `/reportes` MUST redirect to first authorized report.
- Each report route MUST have an independent guard.
- Report navigation MUST follow capability union.
- HU-029 MUST not duplicate HU-015.
- HU-031 MUST not duplicate HU-023/HU-024.
- HU-030 MUST remain point-in-time.
- Backend aggregates MUST not be calculated from visible rows.
- CASH/QR/EXTERNAL MUST remain PaymentMethods.
- DIRECT/PEDIDOSYA MUST remain Channels.
- Negative inventory MUST remain negative.
- HourlyRate MUST remain read-only.
- ProjectedPay MUST remain backend-authoritative.
- Every report supports CSV/XLSX/PDF from the completed local APPLY.
- The three export formats for a report MUST consume one normalized dataset.
- Export MUST represent the full filtered dataset.
- Export MUST not scrape DOM.
- Export MUST not use generated CSV as the source for XLSX/PDF.
- Formula-like text MUST be handled through one documented spreadsheet-safety strategy.
- HU-029 charts MUST use backend report data.
- HU-030/HU-031 MUST not add charts solely to match mockups.
- No domain mutation controls may be introduced.
- No migration may be created.
- Generated TypeScript MUST not be manually edited.
- Full frontend gates MUST pass using real local scripts.
- Backend regression evidence MUST be factual.
- Manual visual/a11y evidence MUST remain `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

## Local Implementation Evidence — 2026-09-02

- Routes/navigation: independent `/reportes/ventas`, `/reportes/inventario` and `/reportes/asistencia` guards; deterministic `/reportes` redirect; frozen capability union excludes MESERO and EMPLEADO UI and limits COCINA to Inventario.
- Queries/authority: generated OpenAPI types, `httpClient`, TanStack Query, server-side Period/Shift/Channel/Employee filters, and `America/La_Paz` business-month defaults; no client aggregation or business-rule inference.
- UX: valid zero summaries remain visible; empty series/rows, filtered-empty, loading, refresh and error/retry states are explicit; Sales/Attendance filters use one responsive Modal on mobile; HU-024 links use plain `/asistencia`.
- Exports: each report maps its complete response once to normalized typed data consumed directly by CSV, `xlsx@^0.18.5` XLSX and existing `jspdf` PDF adapters. Formula-safe text, numeric cells and no DOM/current-page scraping are covered by tests.
- Verification: targeted formatting, typecheck, lint, 42 Vitest files / 245 tests, production build, frozen offline install and `git diff --check` passed. Whole format check is evaluated without rewriting the preserved pnpm lockfile.
- Manual visual/responsive/accessibility evidence remains `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

## Out of Scope

- Further backend report modifications outside the explicitly authorized HU-029/HU-031 reconciliation.
- HU-030 authorization-policy changes; the existing broader `InventoryRead` role scope is retained by product decision, and its drift from the frontend matrix is documented.
- Server-side export.
- New report export endpoints.
- Generic BI framework.
- `/reportes` dashboard UI.
- HU-015 duplicate.
- HU-023 duplicate.
- HU-024 duplicate.
- MESERO Sales Report page.
- Employee Attendance Report page.
- Inventory historical reporting.
- Inventory mutations.
- Attendance mutations.
- HourlyRate editing.
- Payroll processing.
- Sale mutation.
- Charts for HU-030.
- Charts for HU-031.
- Migration.
- Schema changes.
- Manual evidence collection during this block.
