# Design

## Components Touched

### Domain

Likely areas, subject to local revalidation:

- Production traceability fields.
- Customer aggregate if absent/incomplete.
- Sale optional Customer relation and immutable snapshot.
- Employee HourlyRate.
- Work-schedule configuration.
- ShiftAssignment effective-schedule snapshot.
- CashSession opening money.
- structured handover cash data.
- CashClosing aggregate.

### Application

- paginated history/read contracts.
- Customer commands/queries.
- shared Sale authorization/query scope.
- attendance derivation services.
- schedule configuration contracts.
- payroll projection read model.
- cash-position calculator.
- closing preview/command.
- report DTOs/projections.
- authorization interfaces/policies where required.

### Infrastructure

- EF configurations.
- ApplicationDbContext registrations.
- additive migrations.
- server-side projections/grouping.
- PostgreSQL row locking for closing.
- uniqueness constraints.
- existing InventoryWriter integration retained.

### API

- additive endpoint mappings.
- reuse/extension of current endpoints.
- ProblemDetails mapping.
- authorization policies.
- OpenAPI descriptions.

### Tests

- Domain rules.
- Application calculations/scopes.
- PostgreSQL integration.
- authorization.
- concurrency.
- migration validation.
- existing Sprint 1/2 regression.

### Frontend boundary

- generated TypeScript only after stable runtime OpenAPI.
- no Sprint 3 screens/components.

## Existing Architecture Audit

Available evidence indicates:

- Clean Architecture layering Domain → Application → Infrastructure/API.
- Production and ProductionConsumption already persist actual production events.
- Sale/SaleItem already represent confirmed sales and their item snapshots.
- Purchase/receipt workflows already exist from Sprint 2.
- Attendance self-history and IBusinessClock already exist in the remote baseline.
- CashSession, Shift and ShiftAssignment already represent operational days and shifts.
- InventoryBalance/Movement plus a canonical inventory service/writer already own stock.
- PaymentMethod and SalesChannel are already separate concepts.
- report persistence is not part of the conceptual model; reports are projections.

The APPLY phase MUST reconcile every statement against the local working tree before modifying code.

## Reuse Strategy

### Inventory

- InventoryWriter/InventoryService remains the only mutation authority.
- HU-008 history only reads Production/Consumption.
- HU-029 reads Sales.
- HU-030 reads Inventory/Product and reuses summary semantics.
- HU-026/027 read Sales/Expenses/CashSession but do not mutate Inventory.

### Attendance

- Keep existing AttendanceRecord lifecycle/check-in/check-out.
- Keep existing `/attendance/me`.
- Keep ShiftAssignment as effective scheduling relationship.
- Add schedule intelligence around those structures rather than replacing them.

### Sales

- Keep current ConfirmSale transaction/inventory/Shift protections.
- Add optional Customer resolution/snapshot within the existing confirmation path.
- Centralize the authorized Sales IQueryable/query-scope so HU-015 and HU-029 cannot diverge.

### Purchases

- Reuse current Purchase/PurchaseItem/PurchaseReceipt DTO semantics.
- HU-019 is a read model over those records, not a new purchase subsystem.

### Cash

- Keep CashSession + MORNING/NIGHT lifecycle and current-shift resolver.
- Extend opening/handover metadata.
- Add CashClosing as final session snapshot only if not already present.

## Boundaries Respected

- Domain MUST NOT depend on API/frontend concerns.
- Reports MUST NOT become persistence aggregates.
- Customer snapshots belong to Sale historical data, not to mutable Customer rendering logic.
- Work schedule configuration MUST NOT replace ShiftAssignment.
- Absence calculation MUST NOT fabricate AttendanceRecords merely to simplify queries unless local audit demonstrates an established equivalent pattern.
- BatchCode MUST NOT affect InventoryBalance allocation.
- CashClosing MUST NOT modify historical Sales/Expenses.
- Closing calculation MUST NOT trust client-supplied totals.
- Frontend generated types MUST remain downstream of runtime OpenAPI.
- Authorization MUST be enforced server-side irrespective of future frontend visibility.

## Contracts Changed

Exact route paths are intentionally not frozen in this artifact because the mandated local baseline cannot be inspected in this session. Task 1 MUST freeze them before implementation.

### Additive domain/API contract classes

#### Production history

List/detail projections add:

- ProductionId.
- BatchCode.
- Status.
- product/preparation identity/name.
- QuantityProduced/unit.
- ProducedAt.
- responsible.
- Notes when available.
- consumption detail.

#### Customer

Expected contracts:

- create;
- edit;
- activate/deactivate;
- paginated search;
- detail.

CI/NIT must be structured business identifiers, not security identifiers.

#### ConfirmSale

Expected additive input:

- optional CustomerId.

Existing Sale fields/semantics remain unchanged.

Expected Sale output/history additions:

- nullable CustomerId;
- CustomerNameSnapshot;
- CustomerCiSnapshot;
- CustomerNitSnapshot.

#### Attendance

Expected additive contracts:

- effective schedule information;
- late classification/minutes;
- absence-derived rows;
- general summary;
- per-Employee summary;
- HourlyRate/projected pay in reporting.

#### Cash

Expected additive open-day input if currently missing:

- openingAmount;
- pettyCashOpeningAmount.

Expected handover extension if missing:

- cashRemovedAmount.

Expected backend output:

- calculated cashAmountCarriedForward.

Expected closing request:

- declaredCash;
- optional observation.

No calculated totals accepted as authoritative input.

#### Reports

New read DTOs:

- Sales aggregate report.
- Inventory point-in-time report.
- Attendance report.

None exposes presentation classes/colors/chart configs/export files.

## Data Model Changes

### Production

Preferred minimal extension:

- BatchCode on Production.
- Status on Production.

No ProductionBatch stock entity is required.

Backfill:

- derive a deterministic unique code from immutable Production identity or an established local sequence/convention;
- set historical Status = COMPLETED.

The exact display format remains a technical implementation detail as long as it is unique, stable and backend-generated.

### Customer

If absent, create the canonical Customer entity/table.

Persist normalized values, not separate frontend-normalized versions.

Recommended database constraints:

- Name required.
- CI required for valid current records.
- CI unique.
- NIT nullable.
- NIT unique when present.
- IsActive.
- audit fields consistent with existing conventions.

If historical Customer rows lacking CI exist locally:

1. add CI safely without fake data;
2. require CI in application for new/edited records;
3. obtain/repair real historical data through an explicit data step;
4. enforce DB NOT NULL only when data is valid.

A dummy CI or GUID-as-CI is rejected.

### Sale customer snapshot

Add nullable fields so historical Sales migrate safely.

At confirmation:

- validate Customer exists and active;
- copy identity and snapshot fields in the same Sale transaction;
- do not later update snapshots through Customer edits.

### Employee HourlyRate

Add decimal HourlyRate.

Backfill: `20.00`.

No historical rate table yet.

### WorkSchedule configuration

Preferred minimal model:

- one current configuration per supported ShiftType;
- configured start;
- configured end;
- tolerance minutes.

Seed/default:

- MORNING 08:00–12:00.
- NIGHT 18:00–22:00.
- tolerance 10.

### Historical schedule stability

Preferred minimal strategy:

Snapshot the effective schedule on ShiftAssignment when the assignment is created:

- effective planned-start time;
- effective planned-end time;
- effective tolerance.

Existing ShiftAssignments can be backfilled from their Shift.Type using the approved default schedule because those defaults are explicitly approved for the transition.

Future schedule edits affect future assignments, not already-snapshotted assignments.

This avoids:

- retroactive lateness changes;
- a second scheduler;
- a heavyweight schedule-version graph;
- generating synthetic AttendanceRecords for absences.

If local code already has equivalent versioning/snapshots, reuse it instead.

### CashSession opening money

Add/extend authoritative monetary fields if local baseline lacks them.

For new sessions, values are required by the operational opening workflow.

For historical sessions where no truthful value exists:

- do not backfill invented cash;
- use a staged nullable/legacy-safe strategy;
- prevent a new final close from silently treating unknown opening money as zero unless business data explicitly says zero.

### Handover

Persist cashRemovedAmount structurally.

Persist/calculably expose cashAmountCarriedForward where helpful for historical reconciliation.

The backend derives:

- effective MORNING cash position;
- minus cashRemovedAmount;
- equals carried forward.

HandoverNote remains descriptive only.

### CashClosing

Preferred aggregate:

- Id.
- CashSessionId unique.
- BusinessDate snapshot.
- openingAmount.
- pettyCashOpeningAmount.
- cashRemovedAmount.
- SalesTotal.
- CASH/QR/EXTERNAL totals.
- DIRECT/PEDIDOSYA totals.
- CashDrawer/PettyCash expense totals.
- ExpensesTotal.
- ExpectedCash.
- DeclaredCash.
- Difference.
- Observation.
- ClosedByUserId.
- responsible display snapshot if consistent with repository audit patterns.
- ClosedAt.

No mutable lifecycle after success.

## Migration Strategy

### Migration slice A — Production traceability

- additive columns;
- deterministic BatchCode backfill;
- COMPLETED backfill;
- unique constraint/index;
- no historical deletion.

### Migration slice B — Customer/Sale

- create/extend Customer.
- CI/NIT indexes.
- nullable Sale customer relation.
- nullable snapshots.
- safe staged CI rule if legacy rows exist.

### Migration slice C — Attendance/payroll

- HourlyRate with approved 20.00 backfill.
- schedule configuration.
- schedule defaults.
- effective schedule snapshot fields on assignments.
- existing assignment backfill from approved defaults.

### Migration slice D — Cash

- opening money if absent.
- structured handover fields if absent.
- CashClosing table if absent.
- unique CashSession constraint.
- indexes required for history queries.

Before each migration:

- inspect local schema and migration tip;
- verify no equivalent field/table already exists;
- review generated SQL;
- validate upgrade on representative existing data;
- validate clean database application;
- confirm rollback/forward-only implications.

## Authorization Strategy

Use existing policy/role architecture rather than new authorization infrastructure.

Row-level scope is implemented in Application/Infrastructure query construction, not post-filtered in frontend.

### Shared Sales scope

A reusable query-scope decision SHOULD expose:

- broad scope for ADMINISTRADOR/ENCARGADO/CONTADORA;
- current assigned Shift scope for MESERO-only;
- union semantics for multi-role.

Both HU-015 and HU-029 consume this exact scope.

### Purchase scope

COCINA filter is server-injected and cannot be overridden by client filter values.

### Attendance scope

Separate:

- self-only;
- general administrative.

HU-031 chooses general if any held role grants it; otherwise self.

## Query/Pagination Strategy

Historical list queries:

1. start from an `IQueryable`/equivalent canonical source;
2. apply authorization scope;
3. apply business filters;
4. compute full-set aggregates when required;
5. compute TotalCount;
6. sort newest-first;
7. page;
8. project directly to DTO.

Read-only paths SHOULD use no-tracking according to repository convention.

Avoid:

- `ToList` before authorization/filtering;
- N+1 responsible/product lookups;
- per-row service calls;
- counting only current page for aggregates.

## Snapshot Strategy

### Customer/Sale

Copy Customer values into Sale at confirmation.

Customer FK remains useful for current navigation but never overwrites the historical snapshot.

### Production

ProductionConsumption is the factual consumption snapshot.

Do not reconstruct history from current composition.

### CashClosing

Persist all values necessary to explain a completed reconciliation.

History reads snapshots, not live recomputation, because Sales/Expenses/User data may later evolve.

### Attendance Schedule

ShiftAssignment captures its effective schedule parameters.

Historical reports use the captured values.

## Production Batch Traceability

Flow:

- current Production command validates and applies the existing inventory transaction.
- once successful, Production is persisted with backend BatchCode and COMPLETED.
- Inventory continues to increment the preparation’s aggregate stock exactly as Sprint 2 defines.
- History queries identify Production by BatchCode.
- Sale later consumes preparation aggregate stock, never BatchCode-specific stock.

## Attendance Late/Absence Model

### Present rows

AttendanceRecord + its effective ShiftAssignment yield:

- planned start/end;
- actual check-in/out;
- open/closed;
- worked minutes;
- delay;
- IsLate.

### Absent rows

ShiftAssignment is the source of expected work.

For a completed effective assignment window with no valid Attendance check-in:

- emit derived ABSENT row/read model;
- CheckIn/CheckOut remain null;
- worked minutes = 0;
- IsLate = false;
- absenceCount increments.

No AttendanceRecord persistence is required merely to represent absence.

## Payroll Projection

Reusable application calculation:

- sum closed WorkedMinutes.
- divide by 60 using decimal.
- multiply by current HourlyRate for Sprint 3.
- expose lateness/absence separately.

No deductions or payroll state.

The design deliberately leaves room for a later rate-history model without implementing it.

## CashSession/Handover Model

### Opening

One CashSession for BusinessDate.

Opening captures:

- openingAmount;
- pettyCashOpeningAmount.

### MORNING

Operations accumulate against the session/shift.

### Handover

Backend calculates MORNING physical cash position.

User supplies cashRemovedAmount.

Backend validates it and calculates carried-forward cash.

MORNING becomes complete and NIGHT starts/continues through the existing lifecycle.

No CashClosing.

### NIGHT

All later operations remain in the same CashSession.

## CashClosing Formula

The canonical full-day formula is:

- starting physical cash:
  openingAmount + pettyCashOpeningAmount
- plus:
  Sales where PaymentMethod = CASH
- minus:
  CASH_DRAWER expenses that physically remove cash
- minus:
  PETTY_CASH expenses that physically remove cash
- minus:
  cashRemovedAmount recorded during handover

Result:

- expectedCash.

Then:

- difference = declaredCash - expectedCash.

`cashAmountCarriedForward` is a handover reconciliation snapshot and MUST NOT be added again to the full-session formula.

Payment breakdown:

- CASH.
- QR.
- EXTERNAL.

Channel breakdown:

- DIRECT.
- PEDIDOSYA.

These are independent reconciliations of SalesTotal.

## HU-027 Atomic Data Flow

- authenticate/authorize ADMINISTRADOR or ENCARGADO.
- resolve BusinessDate through BusinessClock.
- begin transaction.
- acquire current CashSession row lock.
- verify session is open and belongs to current BusinessDate.
- verify no CashClosing already exists.
- verify MORNING/handover and NIGHT lifecycle prerequisites.
- query authoritative Sales.
- query authoritative Expenses.
- read structured handover removal.
- calculate payment/channel/expense snapshots.
- calculate ExpectedCash.
- calculate Difference from DeclaredCash.
- validate Observation rule.
- insert immutable CashClosing.
- complete NIGHT.
- close CashSession.
- save.
- commit.

Any failure before commit rolls back every mutation.

Database uniqueness remains final defense against concurrent duplicate closes.

## Reporting Read Models

### HU-029 Sales

Reuse Sales scope/history source.

Return:

- summary;
- payment groups;
- channel groups;
- BusinessDate time series.

History rows remain HU-015 responsibility.

### HU-030 Inventory

Reuse canonical Product + InventoryBalance + InventorySummary semantics.

Return:

- current detail rows;
- filters;
- summary.

No historical stock reconstruction.

### HU-031 Attendance

Reuse attendance derivation engine.

Return:

- own/general authorized rows/aggregates;
- worked minutes/hours;
- late/absence;
- HourlyRate;
- ProjectedPay.

No payroll persistence.

## Data Flow

### Production history

- persisted Production
  → persisted ProductionConsumption
  → authorization/filtering
  → paginated history/detail DTO

### Customer sale

- ConfirmSale request with optional CustomerId
  → resolve active Customer
  → copy Customer snapshot
  → existing Sale transaction/inventory flow
  → immutable Sale history

### Attendance

- WorkSchedule current configuration
  → copied into new ShiftAssignment effective snapshot
  → AttendanceRecord + Assignment
  → present/late/worked-time derivation
  → completed Assignment without check-in
  → absent derivation
  → HU-023 / HU-024 / HU-031 projections

### Closing

- CashSession + Shifts/Handover
  - Sales
  - Expenses
    → cash calculation
    → HU-026 preview

- same authoritative inputs
  - declaredCash/observation
    → locked transaction
    → immutable CashClosing
    → NIGHT completed
    → CashSession closed

### Reports

- canonical business records
  → server-side authorization scope
  → filters
  → aggregates/projections
  → structured JSON only

## Required Tests Per Layer

### Domain tests

Add/extend tests for:

- schedule validation.
- late boundary.
- absence predicate.
- payroll decimal calculation.
- difference/observation rule.
- inventory stock-state derivation if represented in Domain/Application.
- Customer normalization where domain-owned.

### Application tests

Add/extend tests for:

- Sales row-level scope.
- Purchase KITCHEN scope.
- Customer active selection.
- snapshot mapping.
- attendance summaries.
- full-filter aggregates versus current page.
- cash formula.
- payment/channel independence.
- report projections.

### PostgreSQL integration tests

Required for:

- CI uniqueness.
- NIT uniqueness/null semantics.
- BatchCode uniqueness.
- migration/backfill safety.
- CashClosing uniqueness.
- concurrent CashClosing.
- transactional close rollback.
- historical FK/delete behavior.
- real query translations/groupings.
- authorization endpoint matrices.

### Regression tests

Protect:

- Sprint 1 authentication/roles.
- product/composition.
- inventory.
- Production registration.
- Orders/Sale/shortage.
- Purchases/receipts.
- Expense creation.
- current Shift.
- Attendance check-in/out/self-history.

### Strict TDD

Where test infrastructure covers the behavior, implementation tasks SHOULD record:

- RED: focused failing test.
- GREEN: minimal implementation.
- TRIANGULATE: boundary/concurrency/authorization cases.
- REFACTOR: cleanup while all tests stay green.

No current test result is claimed by this design.

## Concurrency

### Customer

DB uniqueness is the final authority for simultaneous CI/NIT creation.

### CashClosing

Use PostgreSQL transaction and row-level lock compatible with existing infrastructure.

Add unique constraint on CashSessionId.

Do not rely only on `AnyAsync`.

### Reporting

Read queries do not introduce distributed locking.

### Inventory

No new concurrency model; keep existing row locks/transaction strategy.

## OpenAPI

Future APPLY sequence:

1. complete backend behavior.
2. apply/test migrations.
3. backend restore/build/tests green.
4. run actual API in Development.
5. obtain runtime OpenAPI.
6. inspect all additive contract changes.
7. regenerate `api.generated.ts` using the real package/script.
8. ensure no hand edits.
9. perform only compilation-level frontend adjustments strictly required by generated-contract changes.
10. run frontend quality gates required by repository workflow.

## Tradeoffs Accepted

- One large OpenSpec change is retained for Sprint-level consistency, but implementation/review is split into chained slices.
- ShiftAssignment schedule snapshots add schema data to obtain deterministic history without a full schedule-versioning platform.
- Payroll uses current persisted HourlyRate because rate mutation/history is explicitly post-MVP.
- Customer snapshot duplicates a small amount of identity data intentionally to preserve sales history.
- CashClosing intentionally duplicates aggregate snapshots because recomputing a historical reconciliation from mutable data would be unsafe.
- BatchCode adds traceability without stock-allocation semantics.
- Reports are live queries; only CashClosing is a persistent business snapshot.
- A staged migration is preferred over fabricated CI or financial history when legacy data is incomplete.

## Implementation Constraints

- Do not modify code before the local-baseline checkpoint.
- Do not create exact duplicate entities/services/endpoints found during local inspection.
- Do not alter Sprint 1/2 routes/verbs for naming aesthetics.
- Do not edit generated TypeScript manually.
- Do not implement React Sprint 3 screens.
- Do not add report/export file libraries.
- Do not introduce repository/CQRS/MediatR frameworks unless already present and required by existing patterns.
- Do not introduce a custom Unit of Work if ApplicationDbContext already provides the transactional boundary.
- Do not add Redis/distributed locks.
- Do not add stock-batch tables.
- Do not add generic Report tables.
- Do not use notes as financial storage.
- Do not use client totals as closing authority.
- Do not use mutable current schedule to classify historical assignments.
- Do not fabricate CI, opening money or handover money in migrations.
- Keep each review slice near or below 400 changed LoC when feasible; tests/migrations may require focused exceptions but mega-PRs are not acceptable.

## Alternatives Rejected

### Stock authority per Production Batch

Rejected. BatchCode is only traceability; aggregate Inventory remains authority.

### FIFO/FEFO now

Rejected as explicit Post-MVP scope.

### Customer history based only on mutable FK

Rejected because later Customer edits would rewrite the interpreted Sale history.

### CI/NIT uniqueness only in frontend/application

Rejected because concurrent writes require DB authority.

### Duplicate attendance `/me` endpoint

Rejected because a self-history foundation already exists in the observable baseline and must be reused if confirmed locally.

### Absence equals “no AttendanceRecord”

Rejected because an Employee without a scheduled assignment is not absent.

### Lateness based on actual Shift.StartedAt

Rejected because work schedule is separately configurable and must remain historically stable.

### Hardcoded schedules

Rejected because Sprint 3 explicitly requires runtime/persisted configuration.

### Full payroll system

Rejected; only projection is in scope.

### Frontend-authoritative payroll

Rejected because worked time/rate/projection are business semantics.

### Frontend-authoritative closing

Rejected because Sales/Expenses/Shift state and reconciliation must be authoritative server-side.

### PEDIDOSYA equals EXTERNAL

Rejected because SalesChannel and PaymentMethod are orthogonal.

### Accept ExpectedCash/Difference from client

Rejected because those are derived values.

### Closing per Shift

Rejected; final closing belongs to CashSession/BusinessDate.

### Parse handover note for cash

Rejected; financial data must be structured.

### Backend PDF/CSV/XLSX

Rejected; backend returns structured data.

### Report persistence tables

Rejected; reports are queries.

### New Inventory authority

Rejected; existing inventory remains canonical.

### Weekly Employee scheduler

Rejected; ShiftAssignment remains scheduling foundation.

### Hardware signature

Rejected for Sprint 3.

## Open Design Questions

### Blocking research before APPLY

1. What are the actual local branch, HEAD, `git status` and uncommitted diffs?
2. What is the actual local migration tip and current database model?
3. Has the local working tree already added Customer, CashClosing, Production BatchCode/Status, HourlyRate or report capabilities?
4. What exact local route and policy names exist after the final Sprint 2 authorization stabilization?
5. What exact local PurchaseArea enum/value represents COCINA scope?
6. What exact ProductType values and InventorySummary contract exist locally?
7. What exact current-shift resolver is now canonical locally?
8. What exact runtime OpenAPI generation and frontend package-manager commands are present locally?
9. Do any real Customer rows exist already without CI?
10. Are there historical/open CashSessions whose opening/handover financial values are unknown and therefore require staged migration handling?

These are repository/data research questions, not new product decisions.

### Product decisions required

None identified from the supplied frozen decisions and available evidence.
