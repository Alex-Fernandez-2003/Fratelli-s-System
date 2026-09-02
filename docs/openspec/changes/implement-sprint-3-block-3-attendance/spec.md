# Spec

## Requirements

### Global Architecture

- [GLOBAL-001] HU-023 and HU-024 MUST remain separate frontend routes and page compositions.
- [GLOBAL-002] `/mi-asistencia` MUST represent personal attendance.
- [GLOBAL-003] `/asistencia` MUST represent administrative read-only attendance.
- [GLOBAL-004] The implementation MUST reuse the existing Attendance domain/API/query infrastructure where contractually sufficient.
- [GLOBAL-005] The implementation MUST NOT create a generic Attendance History framework.
- [GLOBAL-006] Server state MUST use the existing TanStack Query client.
- [GLOBAL-007] Attendance API calls MUST use the existing HTTP client.
- [GLOBAL-008] The implementation MUST NOT use raw fetch or a second QueryClient.
- [GLOBAL-009] Existing AppShell and current Fratelli design tokens MUST be reused.
- [GLOBAL-010] Mockup application shells MUST NOT replace the current AppShell.
- [GLOBAL-011] Backend changes MUST be limited to the minimum HU-023 scope explicitly authorized by D16; the HU-024 administrative read backend MUST remain unchanged.
- [GLOBAL-012] The database model MUST remain unchanged for the initial D16 implementation.
- [GLOBAL-013] No migration MUST be created for the initial D16 implementation; a genuinely necessary persistent-model gap MUST stop implementation for explicit review before any schema/migration proposal.
- [GLOBAL-014] No new dependency MUST be installed.
- [GLOBAL-015] Generated TypeScript MUST NOT be manually edited.
- [GLOBAL-016] Runtime OpenAPI and the generated client MUST be synchronized when the authorized HU-023 contract changes; the HU-024 generated shape SHOULD remain unchanged.
- [GLOBAL-017] Attendance business rules MUST remain backend-authoritative.
- [GLOBAL-018] The frontend MUST support multiple Attendance records for one BusinessDate when the backend permits them.

### D16 Security and Contract Boundary

- [BLOCK-001] Every HU-023 personal read and CheckIn/CheckOut operation MUST be scoped to an authenticated User linked to an Employee; role `EMPLEADO` MUST NOT be the sole eligibility condition.
- [BLOCK-002] The backend MUST derive Employee from the authenticated User → Employee relationship. Self-service MUST NOT accept or trust a caller-selected/arbitrary `EmployeeId`, use frontend-only role hiding, or call an admin-only operation as a bypass.
- [BLOCK-003] `AttendanceManage` MUST remain restricted to ADMINISTRADOR and ENCARGADO for existing managed Employee operations; D16 MUST NOT broaden that policy.
- [BLOCK-004] D16 MAY authorize self-service mutation behavior on an existing operation only when identity binding is enforced server-side. If the existing route shape cannot express that boundary, a dedicated `/me` mutation MUST be used. The frontend MUST consume the selected runtime OpenAPI contract rather than infer a new mutation.
- [BLOCK-005] The HU-023 personal read projection MUST expose backend-authoritative lifecycle, historical schedule snapshots, punctuality (`isLate`/`lateMinutes`) and `workedMinutes`; the frontend MUST NOT fabricate or recalculate those business values.
- [BLOCK-006] If implementation discovers a genuinely necessary persistent-model gap, work MUST stop for explicit review; no schema or migration is authorized in the initial D16 implementation.
- [BLOCK-007] HU-024 MUST retain its existing administrative read contract and backend policy without a backend product change; its frontend surface remains read-only and separate from HU-023 self-service.

### Contract Synchronization

- [CONTRACT-001] Runtime OpenAPI MUST document the selected identity-bound HU-023 self mutation operation and additive personal projection.
- [CONTRACT-002] The generated client MUST be regenerated/synchronized from runtime OpenAPI after an authorized HU-023 contract change.
- [CONTRACT-003] Generated client files MUST NOT be hand-edited, and no generated diff may be claimed as complete until it matches runtime OpenAPI.
- [CONTRACT-004] Existing HU-024 administrative endpoint/response contracts MUST be reused without adding a detail or employee-options endpoint under D16.

### HU-023 Route and Eligibility

- [HU-023-001] `/mi-asistencia` MUST be protected by authentication.
- [HU-023-002] `/mi-asistencia` MUST NOT be restricted solely to the `EMPLEADO` role.
- [HU-023-003] A linked Employee MAY have any canonical operational or administrative role.
- [HU-023-004] The frontend SHOULD use current `AuthUser.employeeId` as an early presentation signal when available, while backend responses remain authoritative.
- [HU-023-005] Missing Employee linkage MUST be represented as a distinct state.
- [HU-023-006] The missing-Employee state MUST NOT render CheckIn or CheckOut actions.
- [HU-023-007] The missing-Employee state MUST NOT render fake empty attendance history.
- [HU-023-008] The missing-Employee copy SHOULD be `Tu usuario no está vinculado a un registro de empleado.` with an optional factual instruction to contact an administrator.
- [HU-023-009] A semantic missing-Employee 404 MUST NOT be retried indefinitely.

### HU-023 Current Attendance

- [HU-023-010] The personal page MUST distinguish initial loading, no-open-attendance, active-attendance, completed/recent state, error and missing-Employee states.
- [HU-023-011] The frontend MUST NOT equate absence of an AttendanceRecord with absence.
- [HU-023-012] An open Attendance MUST NOT be labeled as absence because CheckOut is null.
- [HU-023-013] The D16 personal projection MUST provide and the frontend MUST use backend-authoritative lifecycle data, historical schedule snapshots, punctuality and final `workedMinutes`.
- [HU-023-014] The frontend MUST NOT invent additional attendance states.
- [HU-023-015] Punctuality MUST use backend-provided data from the D16 projection.
- [HU-023-016] The frontend MUST NOT calculate lateness or lateMinutes as business authority, and MUST NOT reconstruct authoritative workedMinutes from timestamps.
- [HU-023-017] The exact tolerance boundary MUST remain a backend rule.
- [HU-023-018] A fixture equivalent to 08:10 MAY display on-time only when backend data says so.
- [HU-023-019] A fixture equivalent to 08:11 MAY display late only when backend data says so.
- [HU-023-020] Lifecycle and punctuality MUST be displayed as distinct concepts when both are available.

### HU-023 CheckIn / CheckOut

- [HU-023-021] Personal CheckIn MUST use the D16-authorized identity-bound backend mutation for the authenticated User's linked Employee.
- [HU-023-022] Personal CheckOut MUST use the D16-authorized identity-bound backend mutation for the authenticated User's linked Employee.
- [HU-023-023] The self-service request MUST NOT accept or trust an arbitrary/caller-selected `EmployeeId`; the backend MUST derive Employee from authenticated identity. A dedicated `/me` mutation MUST be used when the existing route shape cannot enforce this boundary.
- [HU-023-023a] The existing `AttendanceManage` managed mutation remains restricted to ADMINISTRADOR and ENCARGADO and MUST NOT be used as a frontend-only self-service bypass.
- [HU-023-024] CheckIn and CheckOut MUST be direct actions and MUST NOT require a confirmation modal.
- [HU-023-025] A CheckIn action MUST NOT be presented when the authoritative state says the user already has an open attendance.
- [HU-023-026] A CheckOut action MUST NOT be presented when no open attendance exists.
- [HU-023-027] The frontend MUST NOT assume its local visibility rule guarantees validity; backend race validation remains final.
- [HU-023-028] A pending CheckIn MUST disable the action.
- [HU-023-029] A pending CheckOut MUST disable the action.
- [HU-023-030] Intentional double submit MUST be prevented.
- [HU-023-031] Non-idempotent CheckIn/CheckOut mutations MUST NOT use automatic retry.
- [HU-023-032] Mutation errors MUST use current ProblemDetails/error handling.
- [HU-023-033] Successful CheckIn MUST use the returned server timestamp as authoritative.
- [HU-023-034] Successful CheckOut MUST use the returned server timestamp as authoritative.
- [HU-023-035] Success MUST trigger targeted refetch/invalidation of personal current/history state.
- [HU-023-036] If the authenticated user also has administrative capability, relevant cached administrative attendance data SHOULD be invalidated using the established query-key convention rather than a global invalidation.

### HU-023 Elapsed Time

- [HU-023-037] The frontend MAY calculate elapsed time while attendance is active.
- [HU-023-038] Elapsed time MUST be presentation-only.
- [HU-023-039] Elapsed time MUST NOT be persisted.
- [HU-023-040] Elapsed time MUST NOT be sent to backend.
- [HU-023-041] Elapsed time MUST NOT replace final workedMinutes.
- [HU-023-042] Elapsed time MUST NOT be consumed by payroll/report calculations.
- [HU-023-043] A local interval MUST NOT cause a server request on every tick.
- [HU-023-044] Any timer MUST clean up when the component unmounts.

### HU-023 Own History

- [HU-023-045] Own history MUST remain within `/mi-asistencia`.
- [HU-023-046] The frontend MUST NOT create `/mi-asistencia/historial` solely for this block.
- [HU-023-047] Own history default period MUST be the current month.
- [HU-023-048] Clearing the period MUST restore the current-month default.
- [HU-023-049] Own history MUST use server pagination when the generated contract provides it.
- [HU-023-050] The frontend MUST NOT download all history pages to paginate locally.
- [HU-023-051] A historical row/card MUST use a stable record identifier rather than BusinessDate as its unique identity.
- [HU-023-052] Multiple records on the same BusinessDate MUST render independently.
- [HU-023-053] The personal history SHOULD show Shift, CheckIn, CheckOut, punctuality, worked time and lifecycle from the D16 additive personal projection.
- [HU-023-054] The frontend MUST NOT reconstruct schedule, late, absence or worked data from current configuration or timestamps; historical schedule values MUST come from the backend projection.
- [HU-023-055] `Ver todo` MUST NOT navigate to a fictitious second history route.
- [HU-023-056] `Ver todo` MAY scroll/focus the history section, expand the local section, or be omitted.

### HU-023 Query States

- [HU-023-057] Initial loading SHOULD use shared Skeleton/loading components.
- [HU-023-058] Recoverable technical error MUST offer Retry.
- [HU-023-059] Generic errors MUST NOT falsely claim that the user's Internet connection is the cause.
- [HU-023-060] Empty history MUST use factual copy.
- [HU-023-061] Motivational/decorative quotes from mockups MUST NOT be product requirements.
- [HU-023-062] Success feedback SHOULD reuse the current toast/Alert pattern.
- [HU-023-063] Success copy MAY use `Entrada registrada` / `Salida registrada`.
- [HU-023-064] Server timestamps SHOULD be displayed when returned.

### HU-024 Route / Authorization

- [HU-024-001] `/asistencia` MUST require administrative attendance capability.
- [HU-024-002] ADMINISTRADOR MUST be allowed when the local policy confirms the current contract.
- [HU-024-003] ENCARGADO MUST be allowed when the local policy confirms the current contract.
- [HU-024-004] CONTADORA MUST be allowed when the local policy confirms `AttendanceAdministrative`.
- [HU-024-005] MESERO MUST be denied.
- [HU-024-006] COCINA MUST be denied.
- [HU-024-007] EMPLEADO without administrative capability MUST be denied.
- [HU-024-008] Direct URL access MUST be protected independently of navigation visibility.
- [HU-024-009] Administrative Attendance MUST be read-only.
- [HU-024-010] CONTADORA MUST NOT gain attendance mutation controls.
- [HU-024-011] ADMINISTRADOR and ENCARGADO MUST NOT receive administrative CheckIn/CheckOut/edit/create/delete/justify actions through HU-024.
- [HU-024-012] The only row-level action SHOULD be `Ver detalle`.

### HU-024 Backend Boundary

- [HU-024-BACKEND-001] HU-024 MUST reuse the existing `AttendanceAdministrative` read capability, `/attendance/admin` endpoint and administrative response contracts.
- [HU-024-BACKEND-002] No HU-024 backend policy, endpoint, DTO, application/domain behavior, schema or migration change is authorized by D16.
- [HU-024-BACKEND-003] Existing `AttendanceManage` operations remain separate from HU-024 and retain their ADMINISTRADOR/ENCARGADO restriction.

### HU-024 Filters

- [HU-024-013] Default period MUST be the current month.
- [HU-024-014] Approved filter dimensions MUST be:
  - Employee;
  - period;
  - Shift;
  - real backend attendance state/condition.
- [HU-024-015] `employeeId` MUST be the backend value used when the local generated contract confirms it.
- [HU-024-016] Shift filter MUST use real `ShiftType`.
- [HU-024-017] The frontend MUST NOT expose `TARDE`.
- [HU-024-018] The state filter SHOULD use `AttendanceLifecycle outcome` when the local contract remains equivalent to the audited generated client.
- [HU-024-019] Filter labels MUST NOT be used as backend enum values.
- [HU-024-020] `late` MUST NOT automatically become a fifth visible filter when D8 is satisfied using `outcome`.
- [HU-024-021] If the local UX precedent uses immediate filters, HU-024 SHOULD reuse that pattern.
- [HU-024-022] If current shared filter panels use explicit Apply, HU-024 MAY reuse Apply.
- [HU-024-023] Changing/applying filters MUST reset page to 1.
- [HU-024-024] Clear Filters MUST restore current month and clear Employee/Shift/outcome.
- [HU-024-025] Filter parameters MUST be included in the TanStack Query key.

### HU-024 Employee Filter Source

- [HU-024-026] The implementation MUST NOT grant User Management capability to CONTADORA merely to populate Employee options.
- [HU-024-027] The implementation SHOULD reuse employee identity information already exposed by the administrative Attendance contract when sufficient.
- [HU-024-028] `employeeSummaries` MAY provide the Employee filter option source if local semantics confirm that it represents the complete non-paginated filtered employee universe.
- [HU-024-029] Employee options MUST NOT be derived solely from current-page rows.
- [HU-024-030] An inactive historical Employee MUST remain representable in history rows.
- [HU-024-031] If no existing authorized contract can populate Employee options for CONTADORA, that condition MUST become `PRODUCT_DECISION_REQUIRED`.
- [HU-024-032] No employee-options backend endpoint MAY be added silently.

### HU-024 Summary

- [HU-024-033] Attendance summary MUST use server-provided aggregates and MUST NOT be calculated from the visible page.
- [HU-024-034] The four approved cards SHOULD map to:
  - totalRecords;
  - lateCount;
  - totalWorkedMinutes;
  - absenceCount;
    when the local contract remains equivalent.
- [HU-024-035] Pagination MUST NOT modify the four summary values for an unchanged filter set.
- [HU-024-036] `totalWorkedMinutes` MAY be formatted as hours/minutes.
- [HU-024-037] Formatting MUST NOT alter the authoritative numeric value.
- [HU-024-038] Absence count MUST come from backend.
- [HU-024-039] Absence MUST NOT be inferred from CheckOut being null.
- [HU-024-040] Lateness count MUST come from backend.
- [HU-024-041] The UI MUST NOT invent `Activos ahora` or `Retrasos hoy` semantics merely because a mockup contains those labels.

### HU-024 List / Detail

- [HU-024-042] Desktop SHOULD render an accessible table.
- [HU-024-043] Mobile MUST render cards/compact rows rather than a squeezed desktop table.
- [HU-024-044] Rows SHOULD expose Employee, BusinessDate, Shift, CheckIn, CheckOut, outcome/punctuality and worked time when present.
- [HU-024-045] A row MUST NOT require an AttendanceRecord ID to represent a derived absence.
- [HU-024-046] Read-only detail MUST display only fields already present in an authorized backend response.
- [HU-024-047] A new detail endpoint MUST NOT be created.
- [HU-024-048] When `AdministrativeAttendanceRow` contains sufficient detail, the overlay SHOULD consume the selected row directly.
- [HU-024-049] Historical schedule display MUST use persisted/snapshot-derived `plannedStart`/`plannedEnd` when available.
- [HU-024-050] The frontend MUST NOT use today's current Employee schedule to explain historical attendance.
- [HU-024-051] Detail MUST NOT expose Edit, Correct, Justify, Delete, CheckOut or Approve.
- [HU-024-052] A current OPEN row MUST NOT be classified as absence merely because CheckOut is null.

### Employee Statistics

- [HU-024-053] `employeeSummaries` MAY be displayed compactly when a specific Employee is selected or a related detail context is open.
- [HU-024-054] A permanent secondary employee dashboard MUST NOT be created.
- [HU-024-055] Only backend-provided stats MAY be displayed.
- [HU-024-056] workedMinutes, lateCount, absenceCount and attendanceCount MAY be displayed when present.
- [HU-024-057] hourlyRate and projectedPay MUST NOT appear in HU-024.
- [HU-024-058] HU-024 MUST NOT consume HU-031 report data to satisfy its compact stats.

### Navigation

- [NAV-001] The application MUST expose one global Attendance navigation item.
- [NAV-002] The global Attendance navigation destination MUST be capability-aware.
- [NAV-003] Users with administrative attendance capability SHOULD land at `/asistencia`.
- [NAV-004] Authenticated users without administrative attendance capability SHOULD land at `/mi-asistencia`.
- [NAV-005] Multi-role users MUST receive the union of their capabilities.
- [NAV-006] An admin-capable user with an Employee link SHOULD have secondary access from `/asistencia` to `/mi-asistencia`.
- [NAV-007] A CONTADORA with an Employee link MAY use `/mi-asistencia` in addition to `/asistencia`.
- [NAV-008] An admin-capable user on `/mi-asistencia` MAY receive a secondary link to `/asistencia`.
- [NAV-009] Non-admin users MUST NOT receive the administrative secondary link.
- [NAV-010] The frontend MUST NOT use `most restrictive role wins`.

### Timezone / Formatting

- [TIME-001] BusinessDate MUST be treated as a date-only/business-date value.
- [TIME-002] BusinessDate MUST NOT be shifted by parsing it as an arbitrary UTC instant.
- [TIME-003] Date-time fields MUST use the current business timezone helper.
- [TIME-004] America/La_Paz SHOULD remain the expected timezone only if the local configuration confirms it.
- [TIME-005] Existing date/time formatters MUST be reused where correct.
- [TIME-006] Duplicate attendance-specific date formatters SHOULD NOT be introduced when shared formatters already satisfy the requirement.
- [TIME-007] lateMinutes MUST be displayed as the exact backend value.
- [TIME-008] Closed workedMinutes SHOULD be formatted with a reusable minute-to-duration presentation helper.

### Responsive

- [RESP-001] Implementation MUST be designed for 360 px.
- [RESP-002] Implementation MUST be designed for approximately 768 px.
- [RESP-003] Implementation MUST be designed for >=1280 px.
- [RESP-004] The four admin summary cards MUST remain available at 360 px.
- [RESP-005] Summary cards MAY use 2x2 or stacked layout.
- [RESP-006] Mobile admin filters SHOULD use the established Sheet/Drawer/Modal pattern.
- [RESP-007] Four desktop selects MUST NOT be compressed horizontally at 360 px.
- [RESP-008] The personal current-state CTA MUST remain prominent and usable on mobile.
- [RESP-009] A mobile administrative FAB for record creation MUST NOT be implemented.
- [RESP-010] Historical bottom navigation shown in mockups MUST NOT replace the current mobile AppShell navigation.

### Accessibility

- [A11Y-001] Form controls MUST have accessible labels.
- [A11Y-002] Icon-only actions MUST have accessible names.
- [A11Y-003] Detail overlays MUST use the current accessible dialog/sheet semantics.
- [A11Y-004] Focus SHOULD move appropriately when a detail/filter overlay opens.
- [A11Y-005] Focus MUST return appropriately after the overlay closes where the shared primitive supports it.
- [A11Y-006] Status and punctuality MUST NOT be communicated by color only.
- [A11Y-007] Errors MUST use semantic Alert/error infrastructure.
- [A11Y-008] Pending actions MUST expose disabled/loading state.
- [A11Y-009] Pagination MUST be keyboard-operable.
- [A11Y-010] Implementation accessibility requirements remain mandatory even though manual evidence is deferred.

### Evidence Policy

- [EVIDENCE-001] Manual responsive evidence MUST be recorded as `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
- [EVIDENCE-002] The block MUST NOT require screenshots to complete APPLY/VERIFY.
- [EVIDENCE-003] The block MUST NOT claim `360px PASS`, tablet PASS or desktop PASS without actual future manual validation.
- [EVIDENCE-004] Documentation MUST contain placeholders for final-Sprint manual evidence.
- [EVIDENCE-005] Automated/component responsive checks MAY be completed during this block.
- [EVIDENCE-006] Manual-evidence deferral MUST NOT remove code-level accessibility requirements.

### Tests

- [TEST-001] Existing Vitest/Testing Library conventions MUST be reused.
- [TEST-002] No parallel frontend test stack MAY be installed.
- [TEST-003] HU-023 tests MUST cover route eligibility and no-Employee state.
- [TEST-004] HU-023 tests MUST cover no-open, active and completed states using the D16 personal projection.
- [TEST-005] HU-023 tests MUST cover identity-bound authorized CheckIn/CheckOut for any linked Employee role and verify that the target Employee is derived from authenticated identity.
- [TEST-006] HU-023 tests MUST verify double-submit protection.
- [TEST-007] HU-023 tests MUST verify success invalidation/refetch.
- [TEST-008] HU-023 tests MUST verify that lateMinutes is rendered rather than recalculated.
- [TEST-009] HU-023 tests MUST verify elapsed presentation does not trigger server polling per tick.
- [TEST-010] HU-023 tests MUST verify current-month history defaults.
- [TEST-011] HU-023 tests MUST cover history loading/empty/error.
- [TEST-012] HU-024 tests MUST cover ADMIN/ENC/CONTADORA access.
- [TEST-013] HU-024 tests MUST cover MESERO/COCINA/EMPLEADO denial.
- [TEST-014] HU-024 tests MUST cover multi-role union.
- [TEST-015] HU-024 tests MUST verify current-month default.
- [TEST-016] HU-024 tests MUST verify Employee/Shift/outcome filter forwarding.
- [TEST-017] HU-024 tests MUST verify page reset on filter change.
- [TEST-018] HU-024 tests MUST verify backend summary values.
- [TEST-019] HU-024 tests MUST verify summary remains independent of page.
- [TEST-020] HU-024 tests MUST verify absence is not inferred from null CheckOut.
- [TEST-021] HU-024 tests MUST verify read-only detail.
- [TEST-022] HU-024 tests MUST verify CONTADORA receives no mutation controls.
- [TEST-023] Navigation tests MUST verify role-aware destination.
- [TEST-024] Full frontend format/typecheck/lint/tests/build MUST run using actual package scripts.
- [TEST-025] Generated TypeScript MUST be checked for expected synchronization with the authorized HU-023 runtime OpenAPI change and for absence of unauthorized HU-024 changes.
- [TEST-026] Backend regression gates MUST include the focused D16 HU-023 tests and the project's existing block-level regression convention; HU-024 backend behavior remains regression coverage.
- [TEST-027] HU-023 backend tests MUST cover no-Employee behavior, lifecycle/schedule/punctuality/worked projection and application/domain reuse.
- [TEST-028] HU-023 tests MUST verify that self-service does not accept or trust an arbitrary/caller-selected EmployeeId and that a dedicated `/me` mutation is used when required by route security.
- [TEST-029] Backend tests MUST verify existing `AttendanceManage` mutations remain restricted to ADMINISTRADOR and ENCARGADO.
- [TEST-030] Runtime OpenAPI MUST be synchronized with the selected D16 operation/projection and the generated client MUST be regenerated and checked without manual edits.

## Behavior Scenarios

### Scenario 1: Linked Employee opens personal attendance

Given an authenticated User is linked to Employee  
When the user navigates to `/mi-asistencia`  
Then the route MUST be available independently of whether the user role is EMPLEADO, MESERO, COCINA, ENCARGADO, ADMINISTRADOR or another canonical role

### Scenario 2: User has no Employee

Given an authenticated User has no Employee link  
When `/attendance/me` returns the semantic missing-link response  
Then the page MUST show the dedicated no-Employee state  
And MUST NOT show CheckIn or CheckOut

### Scenario 3: No open attendance

Given the authorized self-attendance contract reports no open Attendance  
When `/mi-asistencia` renders current state  
Then `Registrar entrada` MUST be the primary personal action  
And the UI MUST NOT classify the state as an absence

### Scenario 4: Successful own CheckIn

Given an authenticated User is linked to an Employee and the D16 self-service contract permits CheckIn  
When the user activates `Registrar entrada`  
Then exactly one identity-bound mutation MUST be initiated without a caller-selected EmployeeId  
And the backend MUST derive the linked Employee and validate the operation  
And the successful server timestamp MUST become authoritative

### Scenario 5: CheckIn double click

Given CheckIn is pending  
When the user activates the action repeatedly  
Then a second intentional request MUST NOT be submitted

### Scenario 6: Active attendance

Given the backend reports an open personal Attendance  
When `/mi-asistencia` renders  
Then `Registrar salida` MUST be available  
And `Registrar entrada` MUST NOT be available

### Scenario 7: Elapsed presentation

Given an active Attendance has a CheckIn timestamp  
When time advances in the browser  
Then elapsed presentation MAY update locally  
And no attendance request MUST be sent solely because the timer ticks

### Scenario 8: Successful own CheckOut

Given an authorized open personal Attendance for the Employee linked to the authenticated User  
When the user activates `Registrar salida`  
Then exactly one identity-bound mutation MUST be initiated without an arbitrary EmployeeId  
And the backend response timestamp MUST become authoritative  
And personal current/history queries MUST refresh

### Scenario 9: Final worked time

Given a closed Attendance provides backend `workedMinutes` in the D16 additive personal projection  
When the personal history renders  
Then the displayed worked time MUST be based on that backend value  
And the frontend MUST NOT reconstruct it from timestamps

### Scenario 10: Late attendance

Given backend data marks an attendance late with lateMinutes 11  
When the UI renders punctuality  
Then it MUST present the late state and 11 minutes  
And MUST NOT recalculate the number from timestamps

### Scenario 11: Tolerance boundary

Given backend data represents the exact tolerance boundary as on-time  
When the row/card renders  
Then the frontend MUST display the backend result without independently applying a 10-minute rule

### Scenario 12: Current-month own history

Given a linked Employee first opens `/mi-asistencia`  
When own History is requested  
Then the frontend MUST request the current-month range by default

### Scenario 13: Own history empty

Given the current-month query returns zero personal records  
When the history section renders  
Then it MUST show a factual empty state  
And MUST NOT show fabricated records or motivational copy

### Scenario 14: Two attendances on one BusinessDate

Given the backend returns two Attendance records for the same BusinessDate  
When own History renders  
Then both records MUST be displayed independently

### Scenario 15: Personal technical error

Given the history/current query fails with a recoverable technical error  
When the page renders  
Then it MUST show safe error feedback and Retry  
And MUST NOT assert that Internet connectivity is the cause unless known

### Scenario 15a: Self-service cannot target another Employee

Given an authenticated User is linked to Employee A and a request attempts to target Employee B  
When the self-service mutation is handled  
Then the backend MUST ignore or reject the arbitrary target and operate only on Employee A  
And the request MUST NOT bypass `AttendanceManage` through frontend behavior

### Scenario 16: ADMIN loads administrative Attendance

Given a User has ADMINISTRADOR  
When the user opens `/asistencia`  
Then administrative history MUST load

### Scenario 17: ENCARGADO loads administrative Attendance

Given a User has ENCARGADO  
When the user opens `/asistencia`  
Then administrative history MUST load

### Scenario 18: CONTADORA loads administrative Attendance

Given a User has CONTADORA and no broader role  
When the user opens `/asistencia`  
Then read-only administrative history MUST load  
And mutation actions MUST NOT be shown

### Scenario 19: Unauthorized operational user

Given a User is pure MESERO, COCINA or EMPLEADO  
When the user directly opens `/asistencia`  
Then the frontend guard MUST deny access

### Scenario 20: Default admin period

Given an administrative user opens `/asistencia` without prior filter state  
When the query is constructed  
Then the current-month range MUST be used

### Scenario 21: Employee filter

Given a valid employee option is selected  
When admin filters are applied  
Then `employeeId` MUST be forwarded to the administrative attendance query

### Scenario 22: Shift filter

Given the user selects Noche  
When filters are applied  
Then the generated NIGHT value MUST be forwarded  
And `TARDE` MUST never be generated

### Scenario 23: Real state filter

Given the current generated contract supports AttendanceLifecycle outcome  
When the user chooses a lifecycle condition  
Then that exact generated value MUST be sent  
And no mockup-only status value MUST be invented

### Scenario 24: Clear filters

Given Employee, Shift and outcome filters are active  
When the user clears filters  
Then Employee/Shift/outcome MUST clear  
And period MUST return to current month  
And page MUST return to 1

### Scenario 25: Summary across complete result set

Given an administrative filter matches 60 records over three pages  
When page 1 renders  
Then the four cards MUST use backend summary for all 60 records

### Scenario 26: Pagination does not alter summary

Given the active filters remain unchanged  
When the user goes from page 1 to page 2  
Then summary values MUST remain the server-provided values for the same filtered result set

### Scenario 27: Absence summary

Given backend summary returns absenceCount 4  
When the cards render  
Then Inasistencias MUST show 4 without inspecting current page CheckOut values

### Scenario 28: Open row is not absence

Given an administrative row has outcome OPEN and checkOutAt null  
When the row/card renders  
Then it MUST be presented as open/in-course  
And MUST NOT be labeled absent

### Scenario 29: Administrative detail

Given a user selects `Ver detalle`  
When the overlay opens  
Then it MUST render the selected row's persisted/snapshot attendance data  
And MUST contain no mutation controls

### Scenario 30: Historical schedule snapshot

Given an administrative row contains plannedStart/plannedEnd from the historical derivation  
When detail renders  
Then those values MUST be used  
And today's current WorkSchedule MUST NOT be queried to reinterpret the record

### Scenario 31: Employee contextual stats

Given a specific Employee is selected and employee summary data exists  
When the page renders contextual stats  
Then only backend-provided employee metrics MAY be displayed  
And projected pay/hourly rate MUST NOT appear

### Scenario 32: Global navigation — operational user

Given an authenticated user lacks administrative Attendance capability  
When the user activates global `Asistencia`  
Then navigation SHOULD go to `/mi-asistencia`

### Scenario 33: Global navigation — administrative user

Given a user has ADMINISTRADOR, ENCARGADO or CONTADORA attendance-administrative capability  
When the user activates global `Asistencia`  
Then navigation SHOULD go to `/asistencia`

### Scenario 34: Multi-role navigation

Given a user has EMPLEADO + ENCARGADO  
When global Attendance destination is resolved  
Then `/asistencia` MUST win because administrative capability is present  
And `/mi-asistencia` MUST remain available as secondary personal access if Employee-linked

## Edge Cases

### HU-023

- User authenticated but no Employee.
- Employee exists but no current assignment.
- No Attendance today.
- Open Attendance.
- CheckIn just completed.
- CheckOut just completed.
- Backend 409/conflict.
- Browser time differs from server time.
- CheckOut null.
- lateMinutes = 0.
- Exact backend lateness tolerance boundary.
- Legacy null schedule data.
- Two Attendance records on same BusinessDate.
- Current-month boundary.
- America/La_Paz midnight boundary.
- Page greater than totalPages after data changes.
- Server response timestamp differs from browser time.
- User changes route while elapsed timer is active.
- Self-service request attempts to submit an arbitrary EmployeeId.
- Linked User has an operational or administrative role other than EMPLEADO.
- Runtime OpenAPI and generated client differ after the authorized projection/mutation change.

### HU-024

- Zero records in current month.
- Filtered zero.
- Historical inactive Employee.
- Long Employee name.
- OPEN attendance.
- CLOSED attendance.
- LATE attendance.
- ABSENT row without an AttendanceRecord identity.
- CheckOut null.
- planned snapshot unavailable in a legacy-safe row.
- Multiple shifts same BusinessDate.
- Last page becomes invalid after filter change.
- Pure CONTADORA.
- Multi-role CONTADORA+ENCARGADO.
- Employee-options source contains only employees with matching history.
- Employee selector authorization gap.
- Summary all zeros.
- totalWorkedMinutes not divisible by 60.
- Very large totalWorkedMinutes.
- outcome `NO_ASSIGNMENT` or `NO_RECORD` when contract returns it.

## Acceptance Criteria

- The local baseline and the concrete D16 route/OpenAPI shape MUST be revalidated before implementation.
- D16 identity-bound self-service mutations MUST be implemented for any authenticated User linked to Employee.
- The D16 personal projection MUST provide backend-authoritative lifecycle, schedule snapshots, punctuality and workedMinutes.
- Self-service MUST derive Employee from authenticated identity and MUST NOT accept an arbitrary EmployeeId.
- `/mi-asistencia` MUST NOT be restricted solely to EMPLEADO.
- `/asistencia` MUST allow ADMINISTRADOR, ENCARGADO and CONTADORA when local policy confirms the audited contract.
- The global Attendance item MUST remain single and role/capability aware.
- HU-023 MUST distinguish missing Employee from technical error.
- HU-023 MUST not calculate lateness or lateMinutes as authority.
- HU-023 MUST not treat elapsed time as final workedMinutes.
- HU-023 CheckIn/CheckOut MUST prevent duplicate submissions.
- HU-023 must use server timestamps after successful mutations.
- HU-023 own history MUST default to current month.
- HU-023 MUST support multiple records on one BusinessDate.
- HU-024 MUST use server pagination.
- HU-024 MUST use server summary.
- HU-024 MUST display four coherent server-backed summary cards.
- HU-024 summary MUST remain independent of page.
- HU-024 Employee/Shift/outcome filters MUST use real generated contract values.
- HU-024 MUST NOT expose TARDE.
- HU-024 MUST NOT infer absence from null CheckOut.
- HU-024 detail MUST be read-only.
- HU-024 MUST NOT create a detail backend endpoint.
- CONTADORA MUST NOT receive mutations.
- HU-024 MUST NOT display hourlyRate/projectedPay.
- No attendance-admin creation FAB MUST be present.
- Backend product changes MUST be limited to the D16 HU-023 authorization/projection/application-domain/tests/OpenAPI scope.
- HU-024 administrative read backend and existing `AttendanceManage` role boundary MUST remain unchanged.
- No schema or migration MUST be created in the initial implementation; a genuinely necessary persistent gap MUST stop work for explicit review.
- Runtime OpenAPI and generated TypeScript MUST be synchronized for the authorized HU-023 contract, with no manual generated edits.
- No dependency MUST be installed.
- Full frontend gates MUST pass.
- Documentation MUST mark manual responsive/a11y evidence as `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
- Missing manual screenshots MUST NOT by themselves fail this block.

## Out of Scope

- HU-028.
- HU-029.
- HU-030.
- HU-031.
- Attendance Report.
- Payroll.
- Projected pay.
- Attendance corrections.
- Admin CheckIn/CheckOut in HU-024.
- Manual absence creation.
- Justification.
- Schedule editing.
- Biometrics.
- QR attendance.
- Geolocation.
- Notifications.
- PDF.
- CSV.
- XLSX.
- Print.
- Backend extensions outside the minimum D16 HU-023 scope.
- HU-024 backend policy, endpoint, DTO, schema or migration changes.
- Broadening `AttendanceManage` or allowing arbitrary EmployeeId self-service.
