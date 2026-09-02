# Design

## Baseline Audit

### Local baseline

- Branch: `develop`
- HEAD: `4504e8f5acbbcb7c52fd0857aeb9e708f5650576`
- Working tree at Task 1 baseline: tracked files clean; active change directory was the pre-existing untracked content.

The local repository was revalidated in Task 1 before D16. The implementation MUST still verify the concrete local route/OpenAPI shape before coding, but the maintainer-approved D16 decision now authorizes the narrowly bounded HU-023 contract work.

### Secondary public baseline

Current public `develop` shows:

- `/mi-asistencia` already exists under authenticated routes;
- `/asistencia` currently maps to `AttendanceTodayPage`;
- `/asistencia` currently uses `ATTENDANCE_MANAGE_ROLES`;
- `ATTENDANCE_MANAGE_ROLES = ADMINISTRADOR + ENCARGADO`;
- global `Asistencia` navigation already chooses between `/asistencia` and `/mi-asistencia`;
- `MyAttendancePage` currently implements a basic own-history screen;
- `AttendanceTodayPage` implements ADMIN/ENC daily employee CheckIn/CheckOut management. citeturn179197view1turn179197view2turn872840view0turn142203view3

Backend public policy currently separates:

- `AttendanceManage`: ADMIN/ENC;
- `AttendanceSelf`: authenticated;
- `AttendanceAdministrative`: ADMIN/ENC/CONTADORA. citeturn327701view0

This architecture is useful, and the Task 1 audit identified that D2 required an explicit backend decision. D16 now authorizes the minimum identity-bound HU-023 self-service contract while preserving the existing `AttendanceManage` boundary. citeturn327701view4

## Attendance Backend Architecture

Current and target conceptual layers:

- AttendanceRecord persistence.
- User ↔ Employee linkage.
- ShiftAssignment/schedule snapshot derivation for Sprint 3 administration.
- `AttendanceSelf` history, extended additively for the D16 personal projection.
- identity-bound self-service CheckIn/CheckOut for any authenticated linked User.
- administrative derived attendance, reused unchanged for HU-024.
- existing managed CheckIn/CheckOut under `AttendanceManage`, retained for administrative/HU-022 operations and never broadened by D16.
- BusinessClock.

D16 contract boundary:

- Self-service MUST derive Employee from the authenticated User → Employee relationship.
- Self-service MUST NOT accept or trust a caller-selected/arbitrary `EmployeeId`.
- The implementation MAY authorize a secured self-service operation on an existing mutation shape only when the identity boundary is enforced server-side; otherwise it MUST use dedicated `/me` mutations.
- The personal read projection MUST expose backend-authoritative lifecycle, historical schedule snapshots, punctuality and `workedMinutes` using existing application/domain derivation where possible.
- HU-024 continues to read the existing administrative contract and remains read-only at the product surface; its backend is not part of D16.

The current BusinessClock implementation uses `BusinessTime:TimeZoneId` with fallback `America/La_Paz`. citeturn799659view0

## Current Frontend Attendance Feature

Current feature already contains:

- `attendance/api.ts`;
- `attendance/hooks.ts`;
- `attendance/format.ts`;
- `AttendanceTodayPage`;
- `MyAttendancePage`.

Current `attendanceApi` maps:

- today;
- managed checkIn(employeeId);
- managed checkOut(employeeId);
- me(params). citeturn900795view0

The existing `employeeId` mutation adapters are administrative/HU-022 operations. D16 requires separate identity-bound self-service adapters (or a server-enforced self mode) that never expose an arbitrary EmployeeId to the personal page.

Current hooks use one `attendance` key prefix and invalidate that prefix after CheckIn/Out. citeturn142203view1

This is a useful base, but Block 3 should evolve it toward clearer query factories rather than duplicate a second attendance API layer.

## Employee / User Relationship

Generated `AuthUser` currently exposes:

- user ID;
- username;
- nullable fullName;
- nullable employeeId;
- roles array. citeturn625167view2

Therefore:

- the frontend does not need a User Management query merely to know whether the current session claims an Employee link;
- `/attendance/me` remains authoritative because backend performs its own User → Employee lookup and returns 404 when linkage is missing. citeturn611610view0

Personal eligibility must remain relation-based rather than `role === EMPLEADO`.

## ShiftAssignment / Schedule Snapshot Model

HU-024 documentation states that `AdministrativeAsync` combines ShiftAssignment, historical schedule snapshot and AttendanceRecord and derives absences plus global/per-employee summaries. citeturn611610view1

Generated `AdministrativeAttendanceRow` exposes:

- employeeId;
- fullName;
- businessDate;
- shiftType;
- plannedStart;
- plannedEnd;
- nullable checkInAt;
- nullable checkOutAt;
- outcome;
- nullable workedMinutes;
- isLate;
- lateMinutes. citeturn625167view0

These fields are sufficient for the approved HU-024 list and read-only detail without another detail API.

## Contract Matrix After D16

The following matrix separates the authorized HU-023 backend extension from the unchanged HU-024 administrative contract. Exact route names for self mutations are an implementation choice between an identity-bound existing operation and dedicated `/me` mutations; the selected runtime OpenAPI is authoritative and the generated client MUST be synchronized from it.

| Capability | Endpoint / operation | Response / projection | Input boundary | Pagination | D16 status |
| --- | --- | --- | --- | --- | --- |
| Own personal history | `GET /api/v1/attendance/me` | Additive personal projection with lifecycle, schedule snapshots, ShiftType when available, punctuality (`isLate`/`lateMinutes`) and backend `workedMinutes` | from, to, page, pageSize; User identity determines Employee | YES | HU-023 authorized |
| Own self CheckIn | Identity-bound self operation or `POST /api/v1/attendance/me/check-in` if a dedicated route is required | Server-authoritative attendance response | No caller-selected `EmployeeId`; Employee derives from authenticated User | N/A | HU-023 authorized |
| Own self CheckOut | Identity-bound self operation or `POST /api/v1/attendance/me/check-out` if a dedicated route is required | Server-authoritative attendance response | No caller-selected `EmployeeId`; Employee derives from authenticated User | N/A | HU-023 authorized |
| Existing managed CheckIn | `POST /api/v1/attendance/employees/{employeeId}/check-in` | Existing managed response | Arbitrary EmployeeId remains an administrative operation only | N/A | Existing `AttendanceManage` only; unchanged for HU-024 |
| Existing managed CheckOut | `POST /api/v1/attendance/employees/{employeeId}/check-out` | Existing managed response | Arbitrary EmployeeId remains an administrative operation only | N/A | Existing `AttendanceManage` only; unchanged for HU-024 |
| Attendance today | `GET /api/v1/attendance/employees/today` | `AttendanceTodayResponse` | Existing administrative operation | NO | Existing HU-022 path; not HU-024 read contract |
| Admin history | `GET /api/v1/attendance/admin` | `AdministrativeAttendancePage` | employeeId, from, to, shiftType, outcome, late, page, pageSize | YES | HU-024 supported and backend unchanged |
| Admin summary | Same admin response | `AdministrativeAttendanceSummary` | Same filter set | independent of page | HU-024 supported and backend unchanged |
| Employee stats | Same admin response | `EmployeeAttendanceSummary[]` | Same filtered universe | independent of row page | HU-024 supported and backend unchanged |
| Admin detail | No separate endpoint | `AdministrativeAttendanceRow` is sufficiently rich | Selected row | N/A | HU-024 supported without new endpoint |

citeturn987151view1turn987151view2turn987151view3turn625167view0

## D16 Contract and Security Boundary

Task 1 recorded the pre-decision gaps. D16 resolves them without broadening administrative authority.

### Self-service mutation boundary

For every personal CheckIn/CheckOut request:

    authenticated User
      → server-side User → Employee lookup
      → identity-derived Employee
      → own Attendance validation
      → mutation

The request MUST NOT use a caller-supplied arbitrary `EmployeeId` to select the target Employee. A dedicated `/me` mutation is preferred whenever the existing `/employees/{employeeId}` route shape would make that boundary ambiguous. If an existing operation is reused, its self-service authorization MUST derive and enforce the authenticated Employee server-side rather than trusting the path/body value.

`AttendanceManage` remains restricted to ADMINISTRADOR and ENCARGADO. Its existing arbitrary-Employee operations remain separate for administrative/HU-022 use and are not exposed as HU-024 controls.

### Additive personal projection

`GET /attendance/me` remains the personal read entry point. D16 authorizes an additive projection that carries backend-authoritative:

- Attendance lifecycle/outcome;
- historical planned schedule snapshot, including planned start/end and ShiftType when the derivation supplies it;
- punctuality, including `isLate` and `lateMinutes`;
- final `workedMinutes`.

The projection MUST reuse existing application/domain derivation and persistence data where possible. It MUST NOT require frontend reconstruction from current schedules or timestamps. A genuinely necessary persistent-model gap is not authorized in the initial implementation; stop and re-open before proposing schema or migration work.

### HU-024 separation

HU-024 continues to use `AttendanceAdministrative` and the existing `/attendance/admin` response, summary and employee summaries. No HU-024 backend policy, endpoint, DTO or persistence change is authorized. The page remains read-only even though the separate `AttendanceManage` operations continue to exist for HU-022.

No product blocker remains from the two Task 1 gaps once implementation follows this boundary. The exact self route and DTO names remain technical implementation choices constrained by D16, not new product decisions.

## Route Architecture

Target architecture remains:

    /mi-asistencia
      → PersonalAttendancePage

    /asistencia
      → AdministrativeAttendancePage

No giant conditional page.

The `/asistencia` frontend may be composed as the HU-024 read-only page while preserving the existing backend/admin operational path used by HU-022. HU-024 MUST NOT expose those managed mutations. D16 supplies the separate identity-bound self-service path for `/mi-asistencia`; it does not replace or broaden `AttendanceManage`.

## Navigation

Current navigation already has a single `Asistencia` item with a function target. citeturn179197view2

Extend the predicate from:

    ATTENDANCE_MANAGE_ROLES

to a frontend capability aligned with:

    AttendanceAdministrative
    = ADMINISTRADOR + ENCARGADO + CONTADORA

Conceptual behavior:

    has administrative Attendance capability
        → /asistencia
    otherwise
        → /mi-asistencia

Secondary actions:

- `/asistencia` → `Mi asistencia` when personal route is meaningful.
- `/mi-asistencia` → `Asistencia del personal` for admin-capable roles.

No second persistent global nav item.

## Authorization Matrix

| Capability | ADMIN | ENC | MESERO | COCINA | CONTADORA | EMPLEADO | Additional condition |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `/mi-asistencia` | YES* | YES* | YES* | YES* | YES* | YES* | Authenticated; Employee needed for personal data/actions |
| Own history/read projection | YES* | YES* | YES* | YES* | YES* | YES* | User → Employee link; backend projection is authoritative |
| Own CheckIn/Out | YES* | YES* | YES* | YES* | YES* | YES* | Linked Employee; server derives Employee from identity; no arbitrary EmployeeId |
| Existing managed Employee mutation | YES | YES | NO | NO | NO | NO | `AttendanceManage`; remains separate from self-service and HU-024 |
| `/asistencia` | YES | YES | NO | NO | YES | NO | `AttendanceAdministrative` |
| HU-024 list/detail | YES | YES | NO | NO | YES | NO | Read-only; existing administrative backend |
| HU-024 mutations | NO | NO | NO | NO | NO | NO | Explicit scope boundary |

`*` means role is not the deciding factor; authenticated User ↔ Employee linkage is. `AttendanceManage` is not broadened by D16.

## HU-023 State Machine

Presentation states, not new backend enums:

    LOADING
      ↓
    NO_EMPLOYEE
      or
    NO_OPEN_ATTENDANCE
      or
    ACTIVE_ATTENDANCE
      or
    COMPLETED / RECENT_STATE
      or
    ERROR

Mutation transitions after D16 contract implementation:

    NO_OPEN_ATTENDANCE
      → CHECKIN_PENDING
      → ACTIVE_ATTENDANCE

    ACTIVE_ATTENDANCE
      → CHECKOUT_PENDING
      → COMPLETED

Backend response/refetch determines final transition.

No frontend state machine may override server conflict responses.

## CheckIn Flow

After D16 contract implementation:

    authenticated User
      → /mi-asistencia
      → resolve own Attendance state
      → Registrar entrada
      → disable pending
      → identity-bound self mutation (or dedicated `/me` mutation)
      → server derives User → Employee
      → backend validates own Attendance
      → response timestamp and lifecycle
      → personal current/history invalidation
      → feedback

The self-service request MUST NOT select an arbitrary EmployeeId. No confirmation modal. No automatic mutation retry.

## CheckOut Flow

    ACTIVE_ATTENDANCE
      → Registrar salida
      → disable pending
      → identity-bound self mutation (or dedicated `/me` mutation)
      → server derives User → Employee
      → backend validates own open Attendance
      → returned timestamp/final lifecycle/workedMinutes
      → invalidate/refetch
      → feedback

The self-service request MUST NOT select an arbitrary EmployeeId. Do not calculate final workedMinutes locally.

## Own History

Default:

- first day current business month;
- current business date/month end as current app convention dictates.

Query:

- `from`.
- `to`.
- `page`.
- `pageSize`.

The generated client already supports server pagination. D16 requires the runtime OpenAPI and generated client to be synchronized if the personal projection or self mutation route changes; generated code MUST NOT be edited manually. citeturn987151view3

### Current implementation to change

Current public `MyAttendancePage` initializes `from` and `to` as empty strings and shows raw record duration calculated from timestamps. citeturn872840view0

Block 3 requires:

- current-month default;
- stronger current-state composition;
- no-Employee state;
- no business-authoritative duration calculation;
- render the D16 projection's backend-authoritative lifecycle, schedule snapshot, punctuality and worked values once the synchronized contract is available.

## Elapsed Timer

Elapsed is the one intentional client time derivation.

Input:

- server CheckIn timestamp;
- current clock.

Output:

- human-readable elapsed text.

Use an interval only while active.

Frequency can follow the visual requirement without changing server state.

Recommended:

- minute-level update unless the current UI explicitly requires seconds.

Do not:

- invalidate queries every tick;
- poll Attendance every second;
- persist elapsed.

## No-Employee State

Detection:

- `AuthUser.employeeId == null` MAY allow early rendering;
- semantic `/attendance/me` 404 remains definitive.

UI:

- clear icon/state.
- `Tu usuario no está vinculado a un registro de empleado.`
- `Contacta a un administrador.`

No:

- Retry loop.
- CheckIn.
- CheckOut.
- fake zero attendance.

## HU-024 Filters

Generated admin filters are:

- employeeId.
- from.
- to.
- shiftType.
- outcome.
- late.
- page.
- pageSize. citeturn987151view2

Frozen visible filter set:

1. Trabajador → employeeId.
2. Período → from/to.
3. Turno → shiftType.
4. Estado → outcome.

Do not expose `late` as an extra primary filter unless the local UI architecture later proves it is already part of the four-control "Estado/condición" model.

### Outcome labels

Use `AttendanceLifecycle` real values:

- NO_ASSIGNMENT.
- NO_RECORD.
- OPEN.
- CLOSED.
- ABSENT.

Map to factual Spanish presentation.

Do not invent a new enum. citeturn625167view0

## Employee Filter Strategy

Current admin response includes `employeeSummaries` entries with:

- employeeId;
- fullName;
- workedMinutes;
- lateCount;
- absenceCount;
- attendanceCount. citeturn625167view1

Preferred strategy if local service semantics confirm full-filter computation:

- use the authorized administrative response as source of Employee IDs/names;
- never call `/users` merely for a filter;
- preserve an options query/cache independent of the selected employee if necessary.

Conceptual options query:

    admin Attendance
      same period/Shift/outcome
      employeeId omitted
      minimal valid page
      → employeeSummaries
      → filter options

This is preferable to granting User Management to CONTADORA.

If local semantics show that `employeeSummaries` cannot safely provide the required option universe, keep the condition as an implementation risk and do not add a HU-024 endpoint: D16 authorizes backend changes only for HU-023.

## HU-024 Summary

`AdministrativeAttendanceSummary` currently provides six values:

- totalRecords.
- openCount.
- closedCount.
- totalWorkedMinutes.
- lateCount.
- absenceCount. citeturn625167view0

Four-card selection:

1. `Registros del período`
   → totalRecords.

2. `Retrasos`
   → lateCount.

3. `Horas trabajadas`
   → totalWorkedMinutes formatted.

4. `Inasistencias`
   → absenceCount.

This satisfies D9 without inventing mockup-only semantics.

`openCount` and `closedCount` remain available for contextual UI if genuinely useful but are not required summary cards.

## Admin History

Desktop columns:

- Trabajador.
- Fecha.
- Turno.
- Entrada.
- Salida.
- Estado/Puntualidad.
- Tiempo trabajado.
- Acción.

Do not add mock role/area subtitles unless backend actually supplies them.

### Derived absence rows

Administrative rows do not expose AttendanceRecord ID in the current generated DTO.

The row presentation model must therefore not make `attendanceId` mandatory.

Use a row key derived from stable contract identity appropriate to the local implementation, potentially employee + BusinessDate + ShiftType where the domain guarantees that assignment identity, but this MUST be confirmed against the real cardinality.

Do not fabricate AttendanceRecord IDs.

## Admin Detail

No new detail endpoint is needed.

`AdministrativeAttendanceRow` already carries:

- Employee.
- BusinessDate.
- Shift.
- planned start/end.
- actual CheckIn/Out.
- outcome.
- workedMinutes.
- late.
- lateMinutes.

Use the selected row directly unless local generated contract later contains a richer existing detail contract.

Overlay:

- desktop Drawer if current Block 1/2 precedent has one;
- mobile Sheet/bottom-sheet if available;
- otherwise current accessible Modal.

No third overlay framework.

## Employee Stats

When a specific Employee is selected:

compact block MAY show:

- attendanceCount.
- workedMinutes.
- lateCount.
- absenceCount.

Do not show:

- hourlyRate.
- projectedPay.
- salary.
- charts.
- rankings.

This preserves HU-031 boundary.

## Query Keys / Invalidation

Prefer a small attendance key factory.

Conceptually:

    attendanceKeys.all

    attendanceKeys.me(filters)

    attendanceKeys.admin(filters)

    attendanceKeys.adminOptions(filtersWithoutEmployee)

Current Attendance hooks use `[attendance, ...]`, so the change SHOULD extend rather than replace that namespace unnecessarily. citeturn142203view1

After each D16 personal mutation:

- invalidate `me` current/history.
- invalidate administrative data if relevant.
- do not globally invalidate unrelated query domains.

## Timezone

Backend BusinessClock currently falls back to `America/La_Paz`. citeturn799659view0

Frontend current Attendance formatters also use a business timezone constant and `toLocaleDateString`. citeturn142203view2

Audit the shared/current formatter before adding logic.

Critical distinction:

- BusinessDate = date-only.
- CheckIn/Out/planned timestamps = date-time.

Never parse BusinessDate in a way that introduces UTC off-by-one.

## Responsive Strategy

Manual evidence is deferred, but code must be responsive-ready.

### Personal 360 px

Hierarchy from the supplied mobile mockup:

1. page title.
2. feedback if recent mutation.
3. current-state card.
4. prominent CheckIn/CheckOut action.
5. recent/history section.
6. profile remains AppShell responsibility.

Do not reproduce the mockup's bottom navigation if current shell uses drawer/topbar.

### Admin 360 px

1. page title.
2. filter action.
3. four cards in 2x2 or stack.
4. Employee attendance cards.
5. pagination.
6. no FAB.

### Tablet

- filter grid can expand.
- cards 2x2.
- table may be introduced when width allows.

### Desktop

- four cards.
- filter panel.
- DataTable.
- read-only detail overlay.

## Accessibility

Use existing accessible primitives wherever possible.

The current mobile navigation implementation already has labelled open/close controls and focus-return behavior; do not regress it. citeturn179197view2

Attendance-specific requirements:

- associated labels.
- visible focus.
- status text.
- mutation pending semantics.
- Retry named.
- table headers.
- detail overlay focus.
- filter overlay focus.
- no color-only lateness/outcome.

## Loading / Empty / Error

### HU-023

KEEP:

- skeleton concept.
- error card/Alert.
- own-history empty state.

ADAPT:

- error copy to factual generic wording.
- loading to shared Skeleton.
- empty copy to factual messaging.

OMIT:

- motivational quote.
- fake connectivity diagnosis.

### HU-024

KEEP:

- table skeleton concept.
- central filtered-empty state.
- Retry error action.

ADAPT:

- light mockup styling → current dark Fratelli system.
- error copy → shared error mapping.

OMIT:

- fabricated system error code.
- actor/footer decorations not part of current shell.

## Visual Audit — HU-023

### `Mi Asistencia - Desktop (Estado A).png`

| Element                      | Classification                   | Reason / Adaptation                                                |
| ---------------------------- | -------------------------------- | ------------------------------------------------------------------ |
| Existing Fratelli dark shell | KEEP / ADAPT                     | Preserve actual current AppShell                                   |
| `Mi asistencia` heading      | KEEP                             | Correct personal hierarchy                                         |
| Large current-state card     | KEEP                             | Strong primary-state presentation                                  |
| Current date context         | KEEP / ADAPT                     | Use real BusinessDate                                              |
| `Registrar entrada` CTA      | KEEP / D16 identity-bound       | Frozen D2; backend derives the linked Employee                         |
| Large decorative clock       | ADAPT / OMIT                     | Decorative only; no contract meaning                               |
| Own-history section          | KEEP                             | D5                                                                 |
| Desktop table                | KEEP / ADAPT                     | Add real Shift/punctuality/worked fields only if contract supports |
| `Cerrada` badges             | ADAPT                            | Lifecycle alone is not punctuality                                 |
| Mock employee identity data  | OMIT                             | Use authenticated data                                             |

### `Mi Asistencia - Estados Adicionales.png`

| Element                                | Classification | Reason / Adaptation                  |
| -------------------------------------- | -------------- | ------------------------------------ |
| Skeleton hierarchy                     | KEEP           | Reuse shared Skeleton                |
| Error card                             | KEEP / ADAPT   | Use generic ProblemDetails-safe copy |
| Retry action                           | KEEP           | Recoverable errors                   |
| Empty-history panel                    | KEEP           | Factual empty state                  |
| Motivational quote                     | OMIT           | Not product behavior                 |
| `Error de conexión` unconditional copy | ADAPT          | Only if cause is actually known      |
| Decorative internal footer             | OMIT           | Current AppShell owns shell/footer   |

### `Mi Asistencia - Mobile (Estado B).png`

| Element                   | Classification                   | Reason / Adaptation          |
| ------------------------- | -------------------------------- | ---------------------------- |
| Mutation success feedback | KEEP / ADAPT                     | Shared toast/Alert           |
| Current-state card        | KEEP                             | Primary mobile surface       |
| `Jornada Activa`          | ADAPT                            | Use real authoritative state |
| CheckIn timestamp         | KEEP                             | Server value                 |
| `Transcurrido`            | KEEP                             | D4 presentation-only         |
| `Registrar salida`        | KEEP / D16 identity-bound       | D2; backend derives the linked Employee |
| Recent history cards      | KEEP                             | Good 360 pattern             |
| `Ver todo`                | ADAPT / OMIT                     | Same page; no new route      |
| Bottom nav                | OMIT                             | Current AppShell wins        |
| Hardcoded role/user/time  | OMIT                             | Example data only            |

## Visual Audit — HU-024

### `Asistencia de Trabajadores - Desktop.png`

| Element                       | Classification                | Reason / Adaptation                     |
| ----------------------------- | ----------------------------- | --------------------------------------- |
| Page title/subtitle           | KEEP / ADAPT                  | Current terminology/style               |
| Employee filter               | KEEP                          | employeeId                              |
| Period filter                 | KEEP                          | current month                           |
| State filter                  | KEEP / ADAPT                  | Use AttendanceLifecycle outcome         |
| Shift filter absent in mockup | ADAPT                         | D8 requires real Shift filter           |
| Apply/Clear buttons           | ADAPT                         | Follow current filter precedent         |
| Desktop table                 | KEEP                          | Use real fields                         |
| Status pills                  | KEEP / ADAPT                  | Real lifecycle/punctuality              |
| View eye                      | KEEP                          | Only row action                         |
| Exit-arrow action             | OMIT                          | Would imply mutation                    |
| Four summary cards            | KEEP / ADAPT                  | Use total/late/worked/absence           |
| `Activos ahora`               | ADAPT                         | Replace with approved summary semantics |
| Historical light shell        | OMIT                          | Current dark AppShell wins              |
| Mock role/area labels         | OMIT unless contract supplies | Not part of DTO                         |

### `Asistencia de Trabajadores - Móvil.png`

| Element               | Classification       | Reason / Adaptation              |
| --------------------- | -------------------- | -------------------------------- |
| Mobile employee cards | KEEP                 | Required responsive pattern      |
| Filter button         | KEEP / ADAPT         | Opens current Sheet/Modal/Drawer |
| Active-filter count   | KEEP only if derived | Never hardcode `3 ACTIVOS`       |
| Summary cards         | KEEP / ADAPT         | Four cards, not only two         |
| `Ver detalle`         | KEEP                 | Read-only                        |
| Floating `+` button   | OMIT                 | No create mutation               |
| Historical bottom nav | OMIT                 | Current AppShell wins            |
| Light visual system   | OMIT                 | Use real Fratelli theme          |

### `Estados de Asistencia (Loading, Empty, Error).png`

| Element                            | Classification | Reason / Adaptation                          |
| ---------------------------------- | -------------- | -------------------------------------------- |
| Table skeleton                     | KEEP / ADAPT   | Current Skeleton primitives                  |
| Filtered-empty state               | KEEP           | Clear Filters                                |
| Error state                        | KEEP           | Retry                                        |
| White/light layout                 | OMIT           | Current dark theme                           |
| `ERR_FETCH_TIMEOUT` fake reference | OMIT           | Unless real error infrastructure supplies it |
| Mock actors/footer                 | OMIT           | No product requirement                       |

## Testing Strategy

### HU-023

Tests planned for the D16 HU-023 contract and UI:

- any authenticated linked Employee role can read and mutate only self.
- missing Employee returns the dedicated state and no mutation controls.
- self mutation derives Employee from authenticated identity.
- arbitrary/caller-selected EmployeeId is absent, rejected or ignored by the self-service contract.
- existing `AttendanceManage` admin mutation remains restricted to ADMIN/ENC.
- additive personal projection includes lifecycle, schedule snapshot, punctuality and backend `workedMinutes`.
- loading.
- no-open state.
- active state.
- completed state.
- authorized CheckIn.
- authorized CheckOut.
- pending/double-submit.
- success invalidation.
- mutation error.
- server lateness.
- no lateMinutes recalculation.
- elapsed timer presentation.
- no request-per-tick.
- current-month history.
- pagination.
- two records same date.
- empty/error.
- backend application/domain reuse and integration authorization coverage.
- runtime OpenAPI and generated-client synchronization for the selected self contract.

### HU-024

- ADMIN.
- ENC.
- CONTADORA.
- denied roles.
- multi-role.
- current-month default.
- employee filter.
- Shift filter.
- outcome filter.
- clear.
- page reset.
- server pagination.
- summary values.
- summary page independence.
- absence.
- late.
- worked time.
- row/card mapping.
- read-only detail.
- schedule snapshot.
- no mutations.
- no FAB.
- loading.
- filtered empty.
- error.

### Navigation

- pure operational user → `/mi-asistencia`.
- ADMIN → `/asistencia`.
- ENC → `/asistencia`.
- CONTADORA → `/asistencia`.
- EMPLEADO + ENC → `/asistencia`.
- secondary personal access visibility.

## Regression Strategy

### Existing HU-022

Highest regression risk.

Current HU-022 is documented as end-to-end managed Attendance and currently uses admin-managed CheckIn/Out. citeturn972983view0

Retain its existing mutation path and `AttendanceManage` authorization. D16 adds the identity-bound HU-023 self-service path; it does not remove, repurpose or broaden the HU-022 administrative operation.

### HU-025

No changes to:

- operational-day opening.
- Shift handover.
- assignments.
- Shift lifecycle.

### Cash

No changes to HU-026/HU-027/CashSession.

### Reports

Do not consume HU-031 report contract.

## Documentation / Evidence Policy

After eventual APPLY:

HU-023:

- Backend: D16 minimal identity-bound mutations and additive personal projection, with application/domain reuse and backend tests.
- Frontend: actual files.
- Runtime OpenAPI/generated: synchronized from the selected authorized contract; never manually edited.
- Schema/migrations: unchanged unless a genuinely necessary persistent-model gap is discovered, in which case implementation stops for explicit review.
- Manual evidence: `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

HU-024:

- Backend: REUSED and unchanged.
- Frontend: actual files.
- Runtime OpenAPI/generated: existing administrative contract reused; no HU-024 contract change authorized.
- Manual evidence: `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

### HU-023 manual placeholders

- [ ] personal desktop.
- [ ] personal tablet.
- [ ] personal 360.
- [ ] no-checkin state.
- [ ] active state.
- [ ] completed state.
- [ ] CheckIn success.
- [ ] CheckOut success.
- [ ] own history.
- [ ] no Employee.
- [ ] error/loading.
- [ ] keyboard/focus.
- [ ] no horizontal overflow.

### HU-024 manual placeholders

- [ ] admin desktop.
- [ ] admin tablet.
- [ ] admin 360.
- [ ] filters.
- [ ] summary.
- [ ] list.
- [ ] detail desktop.
- [ ] detail mobile.
- [ ] filtered empty.
- [ ] error/loading.
- [ ] CONTADORA read-only.
- [ ] multi-role.
- [ ] keyboard/focus.
- [ ] no horizontal overflow.

These checkboxes are intentionally not completed in this block.

## Components Touched

Likely areas:

- HU-023 backend auth/controller/application/domain reuse and personal projection.
- HU-023 backend tests.
- Runtime OpenAPI and generated-client synchronization.
- Attendance API/query hooks.
- Personal attendance page.
- Administrative attendance page.
- AppRoutes.
- navigation/capability helpers.
- shared overlay/filter/detail primitives where reused.
- attendance formatters.
- focused frontend tests.
- HU docs.

The HU-024 backend/admin contract and `AttendanceManage` role boundary are not implementation targets. Exact files must follow the local baseline.

## Boundaries Respected

- Personal and admin pages remain separate.
- Backend changes are limited to the D16 HU-023 self-service/projection/test/OpenAPI scope.
- HU-024 administrative read backend remains unchanged.
- `AttendanceManage` remains restricted to ADMINISTRADOR and ENCARGADO.
- Self-service never accepts an arbitrary EmployeeId.
- Generated client is synchronized from runtime OpenAPI and never edited manually.
- No schema/migration in the initial D16 implementation.
- No new dependency.
- No HU-031 reuse.
- No admin mutations in HU-024.
- No client business-rule authority.
- No separate application shell.

## Contracts Changed

D16 authorizes only the following HU-023 contract changes:

- identity-bound self CheckIn/CheckOut authorization, using a dedicated `/me` mutation when the existing route shape cannot enforce the boundary;
- additive personal read projection for lifecycle, historical schedule snapshots, punctuality and backend `workedMinutes`;
- corresponding application/domain reuse, backend tests, runtime OpenAPI and generated-client synchronization.

The self-service contract MUST derive Employee from the authenticated User and MUST NOT accept or trust an arbitrary caller-provided EmployeeId. `AttendanceManage` remains ADMINISTRADOR/ENCARGADO-only. HU-024 continues to use the existing administrative read contract without backend policy, endpoint, DTO, schema or migration changes.

No other external contract change is authorized. Generated client changes are expected only when the authorized HU-023 runtime OpenAPI changes and must be produced by the repository generator, not by manual editing.

## Data Flow

### HU-023 — D16 target

    Authenticated User
      → server-side User → Employee lookup
      → identity-derived Employee
      → personal current state/projection
      → own authorized CheckIn/CheckOut (or dedicated `/me` mutation)
      → server response
      → own-history refresh
      → current-month history

The self-service request contains no arbitrary EmployeeId. Lifecycle, schedule snapshot, punctuality and workedMinutes come from the additive backend projection; elapsed time remains presentation-only.

### HU-023 implementation boundary

Reuse existing application/domain attendance derivation and persistence data. Do not add schema/migrations in the initial implementation. Stop for explicit review if a genuinely necessary persistent-model gap is discovered.

### HU-024

    AttendanceAdministrative guard
      → current-month filters
      → GET /attendance/admin
      → summary
      → employeeSummaries
      → paginated rows
      → table/cards
      → selected row
      → read-only detail

No mutation.

## Required Tests Per Layer

### Frontend

Add/extend component/query/route tests for D16-linked/no-link users, identity-bound mutations, personal projection rendering, query invalidation, pending/double-submit, pagination and query states.

### Backend

Add focused tests for User → Employee derivation, any authenticated linked Employee role, no-Employee behavior, self-only CheckIn/CheckOut, rejection/absence of arbitrary EmployeeId input, concurrent/race validation, personal lifecycle/schedule/punctuality/worked projection and preservation of `AttendanceManage` ADMINISTRADOR/ENCARGADO authorization. Verify runtime OpenAPI and generated-client synchronization.

HU-024 backend tests/contract behavior remain regression coverage only; no HU-024 backend product change is planned.

Run existing regression gates according to repository convention.

### Manual

Deferred.

No manual evidence is required for block completion.

## Tradeoffs Accepted

- Personal elapsed time is allowed as presentation-only while final worked time remains backend-owned.
- D16 authorizes a small HU-023 backend extension instead of a frontend bypass or a product-scope reduction.
- A dedicated `/me` mutation is acceptable when the existing path cannot express identity binding; no arbitrary EmployeeId is accepted for self-service.
- HU-024 detail uses row data rather than creating an unnecessary endpoint.
- Employee options SHOULD leverage existing administrative summary data rather than privileged User Management.
- Admin page deliberately omits convenient mutations despite existing admin `AttendanceManage` endpoints because D12 is frozen; those existing operations remain available only to their separate administrative/HU-022 surface.
- Manual responsive evidence is deferred to reduce block interruption while retaining responsive implementation requirements.

## Implementation Constraints

- Revalidate the concrete local route/OpenAPI shape before implementation.
- Implement only the D16 HU-023 backend scope: identity-bound self mutations, additive personal projection, application/domain reuse, tests and runtime OpenAPI/generated synchronization.
- Derive Employee from the authenticated User; never accept or trust an arbitrary EmployeeId for self-service.
- Keep `AttendanceManage` restricted to ADMINISTRADOR and ENCARGADO.
- Keep HU-024 administrative read backend unchanged and its page read-only.
- Do not silently change policy or use an admin-only endpoint as a frontend bypass.
- Do not calculate lateness, absence or authoritative workedMinutes in the frontend.
- Do not add schema/migrations in the initial implementation; stop and re-open if a genuinely necessary persistent gap appears.
- Do not add admin mutations to HU-024.
- Do not use reports.
- Do not edit generated TypeScript manually; regenerate from runtime OpenAPI.
- Do not make manual browser evidence an implementation gate.

## Open Design Questions

D16 resolves the prior product blockers. The following are implementation details to verify without changing the approved scope:

- whether the local route shape can enforce identity-bound self-service on the existing mutation operation, or requires dedicated `/me` mutations;
- the exact additive personal projection DTO and mapping names in the local application/domain layers;
- the generator command and generated-client diff resulting from the selected runtime OpenAPI contract;
- whether the existing derivation can supply schedule snapshots without a persistent-model change. If not, stop and request explicit review rather than adding schema/migrations.

### Technical Research — Non-blocking

- exact local Attendance contract after the D16 decision;
- whether local `AdministrativeAsync` matches generated/admin documentation;
- canonical filter overlay after Blocks 1/2;
- exact employeeSummaries semantics when employeeId is supplied;
- current query-key naming convention;
- whether admin-detail Drawer/Sheet already exists in the latest local baseline.

These do not require product input.
