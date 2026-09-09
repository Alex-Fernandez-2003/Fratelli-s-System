# Spec

## Requirements

### Global Data-Only Requirements

- The migration MUST be data-only and MUST NOT alter the EF Core model or database schema.
- The migration MUST NOT add, remove, or modify tables.
- The migration MUST NOT add, remove, or modify columns.
- The migration MUST NOT add, remove, or modify indexes.
- The migration MUST NOT add, remove, or modify constraints.
- The migration MUST NOT require a generated API change.
- The migration MUST NOT modify frontend product code.
- The migration MUST NOT modify backend domain/application behavior.
- The migration MUST NOT add NuGet or frontend dependencies.
- The migration SHOULD be created from a normal EF migration scaffold using the repository's actual project/startup-project convention.
- The resulting ModelSnapshot MUST have no semantic model change.
- The migration MUST operate directly on database data and MUST NOT instantiate application services.

### Apply Dependency

- APPLY MUST NOT begin until the final HU-029, HU-030 and HU-031 backend contracts are present and reconciled in the local working tree.
- The change MUST record `APPLY_DEPENDS_ON_BLOCK_5_BACKEND_RECONCILIATION` while that condition remains unresolved.
- Block 5 frontend completion MUST NOT be required for this seed APPLY.
- Technical discovery of final endpoint or field names MUST NOT be treated as a new product decision.
- If final Block 5 semantics materially contradict this seed design, the proposal MUST be revisited before migration creation.

### Date Range

- Seeded operational BusinessDates MUST be limited to 2026-06-01 through 2026-08-31 inclusive.
- The target range MUST represent 92 calendar BusinessDates.
- The combined guaranteed demo dataset after this migration SHOULD provide a coherent completed operational day for every one of those 92 BusinessDates.
- A BusinessDate already owned by a guaranteed prior demo migration MUST be reused rather than receiving a duplicate CashSession.
- The migration MUST NOT create September 2026 CashSessions, Shifts, Sales, Orders, Expenses, AttendanceRecords, ShiftAssignments, Production events, Purchases, or CashClosings.
- Master data required by the migration MAY use fixed timestamps before 2026-06-01.
- Temporal master data created specifically for the reporting seed SHOULD have timestamps no later than the beginning of the historical scenario unless the current model requires otherwise.

### Determinism

- The migration MUST produce a deterministic dataset and MUST NOT depend on runtime randomness or the current wall-clock date.
- The migration MUST NOT use `Random.Shared`.
- The migration MUST NOT use unseeded runtime random generators.
- The migration MUST NOT use `Guid.NewGuid()` for owned business records.
- The migration MUST NOT use `DateTime.Now` or `DateTime.UtcNow`.
- SQL MUST NOT use `random()` as seed generation.
- SQL MUST NOT use `NOW()` or `CURRENT_TIMESTAMP` to determine business-record dates.
- Seed IDs MUST be deterministic and stable.
- Seed timestamps MUST be fixed or deterministically derived from the target BusinessDate.
- Applying the same migration to the same guaranteed baseline MUST produce the same logical owned dataset.

### Seed Ownership

- Every row created by this migration MUST be attributable to this migration.
- A migration-specific deterministic UUID namespace MUST be reserved after local collision audit.
- Owned IDs MUST be reproducible from deterministic entity/date/sequence inputs or an equivalently exact strategy.
- The seed ownership strategy MUST distinguish this migration's rows from rows owned by `AddComprehensiveDemoData` or any other previous migration.
- `Down` MUST use exact ownership identifiers and MUST NOT rely exclusively on date ranges.
- `Down` MUST NOT delete manually created application data.
- `Down` MUST NOT delete baseline master data reused by this migration.
- `Down` MUST NOT modify or delete rows owned by earlier migrations.
- If exact seed ownership cannot be proven, APPLY MUST stop.

### Existing Data Compatibility

- The migration MUST depend only on rows guaranteed by earlier migrations and rows it creates itself.
- The migration MUST NOT depend on manually created local Customers, Products, Users, Suppliers, Employees, or other operational records.
- Before insert, the migration SHOULD detect conflicting non-owned records that violate reserved uniqueness assumptions.
- Conflicts that would make the deterministic dataset unsafe SHOULD fail the migration transaction rather than overwrite or silently merge unrelated data.
- Existing prior-demo BusinessDates MUST be audited and excluded from duplicate CashSession creation.
- Existing prior-demo CashClosings MUST NOT be made inconsistent by adding new Cash-impacting records to their BusinessDates.
- Master data from previous demo migrations SHOULD be reused only when its timestamps and semantics are coherent with the earlier reporting period.
- New owned master data MAY be created when reuse would create an implausible history.

### Existing Demo Database Strategy

- The future APPLY MUST audit the established database-gating strategy used by existing demo migrations.
- If the database-name gate remains an approved repository convention, this migration SHOULD use the same strategy rather than introduce a second environment mechanism.
- The migration MUST NOT introduce ad-hoc environment checks unsupported by current migration conventions.
- Test-database behavior MUST be validated before finalizing the migration.

### Volume and Diversity

- Exact row totals MUST NOT be treated as business invariants.
- The dataset SHOULD contain roughly 1,200–1,800 Sales across the combined reporting period.
- The dataset SHOULD contain roughly 3,000–5,000 Order/Sale line records.
- The dataset SHOULD contain roughly 150–250 Expenses.
- The dataset SHOULD contain roughly 30–50 Purchases.
- The dataset SHOULD contain roughly 200–400 Production events.
- Attendance/assignment source data SHOULD contain roughly 700–1,000 meaningful rows depending on the actual Employee model.
- The combined dataset SHOULD contain approximately one CashSession and CashClosing per BusinessDate.
- Integrity MUST take precedence over the target volume.
- Data distribution MUST NOT be perfectly uniform.

### Deterministic Demand Profile

- June SHOULD represent medium baseline activity.
- July SHOULD contain modestly higher activity than June.
- August SHOULD contain the highest overall Sales activity.
- Daily volume SHOULD vary deterministically by weekday.
- Friday SHOULD generally be high activity.
- Saturday SHOULD generally be the highest-activity weekday.
- Sunday SHOULD remain meaningfully active.
- Monday/Tuesday SHOULD generally be lower than Friday/Saturday.
- A deterministic modulo/index variation SHOULD prevent every same-weekday date from having identical counts.
- The exact formula MAY be adapted during APPLY without changing these semantics.

### Shifts

- Seeded operational dates MUST include MORNING and NIGHT when the final domain supports both as expected.
- Both MORNING and NIGHT MUST produce meaningful HU-029 data.
- Both MORNING and NIGHT MUST produce meaningful HU-031 data.
- NIGHT SHOULD have somewhat higher Sales volume than MORNING overall.
- NIGHT MUST NOT be the only Shift containing Sales.
- No duplicate `(CashSession, ShiftType)` row may be created.

### Sales Channels

- Seeded sales MUST provide meaningful coverage for DIRECT.
- Seeded sales MUST provide meaningful coverage for PEDIDOSYA.
- Both channels MUST appear in June, July and August.
- DIRECT SHOULD be the majority channel.
- PEDIDOSYA SHOULD remain a meaningful minority.
- Exact percentages MUST NOT be hard-coded as acceptance criteria.

### Payment Methods

- Seeded sales MUST provide meaningful coverage for CASH.
- Seeded sales MUST provide meaningful coverage for QR.
- Seeded sales MUST provide meaningful coverage for EXTERNAL.
- All three PaymentMethods MUST appear in June, July and August.
- Payment Method and Sales Channel MUST remain independent dimensions in the seeded dataset.
- The deterministic generation strategy MUST NOT encode `PEDIDOSYA => EXTERNAL`.
- The final dataset MUST contain more than one payment method within DIRECT.
- The final dataset MUST contain more than one payment method within PEDIDOSYA when allowed by the real domain.
- The migration MUST NOT seed CARD/TARJETA unless the final domain enum contains it.
- The migration MUST NOT seed TAKE_AWAY unless the final channel enum contains it.

### HU-029 BusinessDate

- Seeded Sales Report scenarios MUST support BusinessDate-based period filtering consistent with the final HU-029 backend contract.
- Every Sale MUST reference a valid operational Shift according to the actual model.
- The Sale's Shift/CashSession chain MUST resolve to the intended BusinessDate.
- ConfirmedAt MUST be temporally plausible relative to that BusinessDate and Shift.
- A small number of valid month-boundary/late-night cases MAY be included.
- Boundary cases MUST NOT use impossible timestamps solely to manipulate filtering.
- HU-029 summary, trend and channel breakdown MUST derive from the same seeded BusinessDate universe.

### Orders and Sales

- A seeded Sale MUST satisfy the current domain's Order status precondition.
- A seeded Sale MUST NOT reference a non-existent Order.
- Each Sale total MUST equal the amount implied by its seeded SaleItems/current money rules.
- Order/Sale line quantities MUST be valid under the current schema.
- Seeded Order statuses MUST use only real domain values.
- Product mixes MUST vary deterministically.
- Sales MUST NOT all contain identical products.
- No synthetic fiscal-invoice behavior may be seeded.
- No Tips subsystem may be invented.

### Customers

- The migration SHOULD create/reuse enough deterministic Customers for repeated-customer behavior.
- Consumer-final/null-customer Sales MUST remain present.
- A Customer MUST NOT be attached to every Sale.
- A subset of Customers SHOULD repeat across different months.
- Any created CI MUST be unique.
- Any non-null created NIT MUST be unique.
- Created Customers MUST use deterministic IDs.
- Existing manual Customers MUST NOT be required.

### Inventory Authority

- The final seeded inventory state MUST contain meaningful NORMAL, LOW, and NEGATIVE report examples derived from canonical inventory data.
- Inventory quantities MUST NOT be clamped to zero.
- The migration MUST preserve the actual backend precedence between NEGATIVE, LOW and NORMAL.
- At least one deterministic golden inventory item MUST end as NORMAL.
- At least one deterministic golden inventory item MUST end as LOW.
- At least one deterministic golden inventory item MUST end as NEGATIVE.
- minimumStock-null examples MAY be included if supported by the real model.
- A null minimumStock MUST NOT be manufactured into LOW status.
- The migration MUST NOT introduce a fake inventory category/type system.
- Product/category/type diversity MUST use actual schema concepts only.

### Inventory Movements and Balances

- InventoryMovement traceability MUST be maintained according to the current schema.
- InventoryBalance MUST reconcile with the canonical movement model used by the application.
- A quantity delta MUST NOT be applied twice by both movement creation and a second independent balance operation.
- Received Purchases MUST generate the inventory traceability expected by the current persistence design.
- Production consumption/output MUST generate the traceability expected by the current persistence design.
- Sales MUST generate the traceability expected by the current persistence design.
- Future VERIFY MUST compare final inventory authority with underlying seeded movement data for representative/all owned products as practical.

### Purchases

- Purchases MUST be distributed throughout June–August.
- Received Purchases SHOULD dominate because they replenish inventory.
- A small number of PENDING/CANCELLED examples MAY be included if supported and useful.
- A RECEIVED Purchase MUST have coherent receipt data when the current model requires it.
- PurchaseReceipt quantities MUST respect real domain rules.
- Cancelled Purchases MUST NOT generate inventory receipt effects.
- Purchases MUST use real Suppliers.
- Supplier rows created by this migration MUST have deterministic ownership.
- Purchases SHOULD approximate weekly/semi-weekly replenishment rather than one giant initial replenishment.

### Production

- Seeded Production MUST use real PREPARATION/composition concepts.
- Seeded production MUST respect composition, unit, and non-negative ingredient consumption rules enforced by the current domain.
- Production MUST NOT rely on insufficient ingredient stock when the domain prohibits it.
- Purchases/starting inventory MUST precede production where necessary.
- ProductionConsumption MUST reflect actual seeded component consumption.
- Production output MUST be reflected in the actual inventory authority when the model requires it.
- BatchCode MUST be deterministic and unique according to current constraints.
- Production status MUST use only real supported values.
- Historical Production consumption MUST remain snapshot-based.

### Expenses

- Expenses MUST be spread throughout all three months.
- CASH_DRAWER MUST be represented.
- PETTY_CASH MUST be represented.
- Expense amounts MUST be plausible and positive.
- Expense amounts MUST vary deterministically.
- Expense categories MUST come from guaranteed/current schema data or deterministic migration-owned categories.
- Cash-impacting Expenses MUST be included in the same BusinessDate/cash derivation used for CashClosing.
- Expenses MUST NOT be inserted on prior-demo closed BusinessDates if that would invalidate an earlier migration's CashClosing snapshot.

### CashSessions

- The combined dataset MUST contain at most one CashSession per BusinessDate.
- Target coverage SHOULD provide one completed CashSession for each of the 92 BusinessDates.
- A BusinessDate already owned by the previous demo migration MUST reuse that CashSession.
- The new migration MUST create CashSessions only for uncovered dates.
- Every new owned CashSession MUST use a deterministic ID.
- Historical CashSessions MUST be completed/closed according to current lifecycle rules.

### Cash Shifts and Handover

- New owned BusinessDates MUST contain the expected MORNING/NIGHT lifecycle if the actual domain still requires it.
- Historical Shifts MUST not remain active/open.
- Handover values MUST be deterministic.
- `cashRemovedAmount` MUST follow current backend semantics.
- `cashAmountCarriedForward` MUST follow current backend semantics where represented.
- Carried-forward cash MUST NOT be added twice to expected cash.

### CashClosing

- The combined dataset SHOULD contain one immutable CashClosing for every seeded BusinessDate.
- CashClosing snapshots MUST be coherent with the Sales, Expenses, opening amounts, and handover data seeded for the same BusinessDate.
- CashClosing values MUST NOT be unrelated hard-coded report totals.
- expectedCash SHOULD be derived from the same source data using the exact current backend formula.
- difference MUST equal `declaredCash - expectedCash`.
- Approximately 80–90% of generated new closings SHOULD be balanced.
- The remaining closings SHOULD include small deterministic surpluses and shortages.
- The dataset MUST contain at least one balanced closing.
- The dataset MUST contain at least one surplus closing.
- The dataset MUST contain at least one shortage closing.
- Every non-zero difference MUST have a non-empty observation when required by the current HU-027/domain rule.
- Observations MUST be plausible deterministic demo text and MUST NOT use meaningless placeholders.

### Attendance Employees

- Attendance analytics MUST cover multiple Employees.
- The dataset SHOULD contain approximately 6–12 useful Employee profiles when the actual model permits it.
- Employees MUST reference valid Users when the schema requires the relationship.
- No CAJERO role may be created.
- Responsible operational actors SHOULD use Users with plausible capabilities where current guaranteed role assignments allow it.
- Attendance MUST reference Employees rather than treating Users as Employees when the current schema distinguishes them.

### ShiftAssignments

- Absence-capable employees MUST receive real ShiftAssignments.
- ShiftAssignments MUST reference the correct Shift and Employee.
- Duplicate `(Shift, Employee)` assignments MUST NOT be created.
- Effective schedule snapshot fields MUST use the real WorkSchedule/assignment semantics.
- MORNING and NIGHT assignments MUST both be represented meaningfully.
- A small set of Employees SHOULD rotate across Shift types where domain rules permit it.

### Attendance

- Attendance source data MUST naturally produce non-zero lateCount, absenceCount, workedMinutes, and projectedPay values through backend report derivation.
- The migration MUST NOT seed disconnected lateCount report totals.
- The migration MUST NOT seed disconnected absenceCount report totals.
- The migration MUST NOT seed disconnected projectedPay totals when the backend derives them.
- Closed historical attendance MUST have CheckOut >= CheckIn.
- No generated June-August AttendanceRecord may remain open at the end of the seeded period.
- A derived absence MUST have the assignment/context required by the actual absence rule and no valid CheckIn.
- A missing CheckOut MUST NOT be used as a fake absence.
- Lateness MUST be generated through actual CheckIn time versus persisted planned-start/tolerance semantics.
- An exact-tolerance golden case MUST be included if the final backend maintains that rule.
- A one-minute-after-tolerance golden case MUST be included.
- workedMinutes MUST arise from valid closed Attendance records.
- projectedPay MUST be produced by the backend's final report calculation from valid work and HourlyRate.

### Attendance Personas

- Employee attendance patterns SHOULD be non-uniform.
- At least one Employee SHOULD be predominantly punctual.
- At least one Employee SHOULD have repeated late arrivals.
- At least one Employee SHOULD have genuine absences.
- At least one Employee SHOULD have meaningful MORNING and NIGHT coverage if supported.
- Employees MUST NOT all have identical worked durations.
- HourlyRate MUST reuse guaranteed values or be deterministically seeded as data-only only after confirming the real model.

### HU-028 Coverage

- Closing history MUST contain June records.
- Closing history MUST contain July records.
- Closing history MUST contain August records.
- Closing history MUST contain positive difference.
- Closing history MUST contain negative difference.
- Closing history MUST contain zero difference.
- Report/history verification MUST use real CashClosing data rather than synthetic assertions detached from the database.

### HU-029 Coverage

- June-only Sales Report MUST return meaningful data.
- July-only Sales Report MUST return meaningful data.
- August-only Sales Report MUST return meaningful data.
- June-August Sales Report MUST return meaningful data.
- MORNING filter MUST return data.
- NIGHT filter MUST return data.
- DIRECT filter MUST return data.
- PEDIDOSYA filter MUST return data.
- MORNING + DIRECT MUST return data.
- MORNING + PEDIDOSYA MUST return data.
- NIGHT + DIRECT MUST return data.
- NIGHT + PEDIDOSYA MUST return data.
- CASH total MUST be > 0 for the complete period.
- QR total MUST be > 0 for the complete period.
- EXTERNAL total MUST be > 0 for the complete period.
- DIRECT total MUST be > 0.
- PEDIDOSYA total MUST be > 0.
- Trend MUST contain multiple BusinessDates.
- Summary, trend and channel distribution MUST follow the same BusinessDate filtering semantics.

### HU-030 Coverage

- Inventory Report MUST contain at least one NORMAL item.
- Inventory Report MUST contain at least one LOW item.
- Inventory Report MUST contain at least one NEGATIVE item.
- totalCount MUST be meaningful.
- lowCount MUST be meaningful.
- negativeCount MUST be meaningful.
- COCINA verification MUST return meaningful permitted data when the final backend grants COCINA report access.
- COCINA validation MUST NOT be satisfied merely by HTTP 200 with an unintentionally empty dataset.

### HU-031 Coverage

- Full June-August Attendance Report MUST contain multiple Employees.
- June report MUST contain meaningful data.
- July report MUST contain meaningful data.
- August report MUST contain meaningful data.
- MORNING filter MUST return meaningful data after Block 5 final reconciliation.
- NIGHT filter MUST return meaningful data.
- Employee filter MUST return meaningful data.
- Employee + Shift MUST return meaningful data.
- lateCount MUST be > 0 for an appropriate filtered/full dataset.
- absenceCount MUST be > 0.
- workedMinutes MUST be > 0.
- projectedPay MUST be > 0.
- Backend global summary MUST be coherent with Employee analytics under the same filters once the final HU-031 contract is present.

### Golden Cases

- The migration MUST define one deterministic Sales golden BusinessDate.
- The Sales golden BusinessDate MUST contain MORNING and NIGHT Sales.
- The Sales golden BusinessDate MUST contain DIRECT and PEDIDOSYA.
- The Sales golden BusinessDate MUST contain CASH, QR and EXTERNAL.
- The migration MUST define one deterministic completed Attendance golden day/Shift.
- The Attendance golden case MUST include one punctual Employee.
- The Attendance golden case MUST include one late Employee.
- The Attendance golden case MUST include one absent assigned Employee.
- The migration MUST define three golden inventory items resolving to NORMAL, LOW and NEGATIVE.
- The migration MUST define one balanced CashClosing golden date.
- The migration MUST define one surplus CashClosing golden date.
- The migration MUST define one shortage CashClosing golden date.
- Exact golden IDs/dates/amounts MUST be frozen in the migration design during local APPLY after collision/schema audit.
- Golden cases MUST coexist naturally with the broader realistic dataset.

### Migration Implementation Style

- Set-based SQL SHOULD be preferred for thousands of deterministic rows.
- PostgreSQL CTEs and `generate_series` MAY be used if supported by the target version and consistent with repository migration style.
- Optional PostgreSQL extensions MUST NOT be introduced merely for UUID generation.
- Deterministic UUID construction MUST NOT depend on `uuid_generate_v4()` or similar random extension functions.
- Thousands of hand-written repeated `InsertData` calls SHOULD NOT be used when a maintainable set-based strategy is available.
- Money calculations MUST use exact decimal/numeric semantics.
- Quantities MUST respect actual database precision.
- Unit conversions MUST use real current domain rules.

### Up

- `Up` MUST be dependency ordered.
- `Up` MUST perform any collision/precondition checks before inserting dependent operational rows.
- `Up` MUST preserve all foreign keys.
- `Up` MUST preserve all unique constraints.
- `Up` MUST not modify schema.
- `Up` MUST not overwrite manually owned data.
- `Up` SHOULD use the established demo-database gate if local audit confirms it remains the approved convention.
- The migration MUST execute atomically according to normal EF/PostgreSQL migration behavior where possible.

### Down

- `Down` MUST remove only records owned by this migration.
- `Down` MUST delete in reverse dependency order.
- `Down` MUST NOT broadly delete unrelated application data.
- `Down` MUST NOT `TRUNCATE` operational tables.
- `Down` MUST NOT use the June-August date range as its sole ownership criterion.
- `Down` MUST preserve rows from `AddComprehensiveDemoData`.
- `Down` MUST preserve baseline Categories/Units.
- `Down` MUST preserve manual application data.
- `Down` MUST use deterministic IDs or equivalently exact owned-key sets.

### Test Database Contamination

- The change MUST assess and prevent unacceptable contamination of integration-test baselines caused by applying the demo migration.
- The future APPLY MUST identify whether tests:
  - run all migrations;
  - use `EnsureCreated`;
  - selectively migrate;
  - reset tables per test;
  - use a database name excluded by the established demo gate.
- Existing test assertions MUST NOT be weakened merely because demo rows appear.
- If current repository convention intentionally skips demo migration data in test databases, the new migration SHOULD follow that same established pattern.
- If no safe established strategy exists, APPLY MUST pause and document the test-baseline blocker before creating unsafe conditional behavior.

### Verification

- Future APPLY MUST verify a clean disposable database migration chain.
- Future APPLY MUST verify application over a disposable database at the previous current migration baseline.
- Future APPLY SHOULD verify Up → Down → Up in a disposable database.
- Re-applied Up MUST reproduce the same logical owned rows.
- Future APPLY MUST verify foreign-key integrity.
- Future APPLY MUST verify uniqueness invariants.
- Future APPLY MUST verify inventory reconciliation.
- Future APPLY MUST verify cash reconciliation.
- Future APPLY MUST verify attendance analytical derivation for golden cases.
- Future APPLY MUST verify report behavior through real service/integration/endpoint paths where feasible.
- Full backend build/tests MUST be run using current repository commands.
- EF pending-model-change verification MUST report no model changes.
- `git diff --check` MUST pass.
- Actual test counts MUST be recorded and MUST NOT be copied from historical reports.

## Behavior Scenarios

### Scenario 1: Apply on clean demo database

Given an empty disposable demo database with the repository's expected demo database naming convention  
When all migrations including this seed are applied  
Then the chain completes without schema changes  
And the reporting seed is created deterministically

### Scenario 2: Apply after current baseline

Given a disposable database already migrated to the immediately previous migration  
When this seed migration is applied  
Then it succeeds without requiring manual application rows

### Scenario 3: Complete period

Given the final demo seed is applied  
When distinct reporting BusinessDates are inspected  
Then June 1 through August 31, 2026 are represented according to the final 92-date design

### Scenario 4: No September

Given the seed is applied  
When operational rows owned by the migration are inspected  
Then no such row has BusinessDate on or after 2026-09-01

### Scenario 5: Existing demo date overlap

Given an earlier demo migration already owns a CashSession for a target BusinessDate  
When this migration is applied  
Then it does not insert a duplicate CashSession  
And it does not modify source data in a way that invalidates the existing CashClosing

### Scenario 6: Deterministic IDs

Given two isolated databases at the same migration baseline  
When the seed is applied to both  
Then corresponding migration-owned records receive the same IDs

### Scenario 7: Non-owned historical conflict

Given a target BusinessDate contains conflicting non-seed data that would violate a unique invariant  
When this migration reaches preflight  
Then it fails safely rather than overwrite or silently merge that data

### Scenario 8: June Sales Report

Given the final HU-029 backend contract and seed are present  
When Sales Report is queried for June 2026  
Then total sales are greater than zero  
And multiple BusinessDates are represented

### Scenario 9: July Sales Report

Given the seed is present  
When Sales Report is queried for July 2026  
Then meaningful report data is returned

### Scenario 10: August Sales Report

Given the seed is present  
When Sales Report is queried for August 2026  
Then meaningful report data is returned

### Scenario 11: Full three-month Sales Report

Given the seed is present  
When Sales Report is queried from June 1 through August 31  
Then CASH, QR, EXTERNAL, DIRECT and PEDIDOSYA all contribute non-zero data

### Scenario 12: MORNING Sales

Given the final Shift filter exists  
When Sales Report is filtered to MORNING  
Then meaningful seeded Sales are returned

### Scenario 13: NIGHT Sales

Given the final Shift filter exists  
When Sales Report is filtered to NIGHT  
Then meaningful seeded Sales are returned

### Scenario 14: DIRECT Sales

Given the final Channel filter exists  
When Sales Report is filtered to DIRECT  
Then meaningful seeded Sales are returned

### Scenario 15: PEDIDOSYA Sales

Given the final Channel filter exists  
When Sales Report is filtered to PEDIDOSYA  
Then meaningful seeded Sales are returned

### Scenario 16: Combined Sales filters

Given the final HU-029 filters exist  
When MORNING + PEDIDOSYA is queried  
Then the dataset returns at least one coherent result  
And the same principle holds for the remaining Shift/Channel combinations

### Scenario 17: Payment/channel independence

Given the seeded Sales dataset  
When PaymentMethod and SalesChannel combinations are inspected  
Then PEDIDOSYA is not mapped exclusively to EXTERNAL  
And multiple valid payment methods appear across each channel when permitted

### Scenario 18: BusinessDate coherence

Given a seeded boundary Sale  
When HU-029 summary, trend and channel breakdown are queried for its BusinessDate range  
Then all three report sections include/exclude the Sale consistently

### Scenario 19: Inventory NORMAL

Given the final seeded inventory snapshot  
When the designated NORMAL golden item is reported  
Then its backend status is NORMAL

### Scenario 20: Inventory LOW

Given the final seeded inventory snapshot  
When the designated LOW golden item is reported  
Then its backend status is LOW

### Scenario 21: Inventory NEGATIVE

Given the final seeded inventory snapshot  
When the designated NEGATIVE golden item is reported  
Then its quantity remains negative  
And its backend status is NEGATIVE

### Scenario 22: COCINA Inventory Report

Given final HU-030 authorization is reconciled  
When an authorized COCINA user queries Inventory Report  
Then meaningful backend-authorized seeded inventory data is returned

### Scenario 23: Attendance MORNING

Given final HU-031 Shift filtering exists  
When the report is filtered to MORNING  
Then multiple seeded Employee analytics are returned

### Scenario 24: Attendance NIGHT

Given final HU-031 Shift filtering exists  
When the report is filtered to NIGHT  
Then meaningful Employee analytics are returned

### Scenario 25: Employee Attendance filter

Given a deterministic seeded Employee  
When HU-031 is filtered by that Employee  
Then only the intended Employee analytics are returned  
And workedMinutes/projectedPay come from backend derivation

### Scenario 26: Lateness golden case

Given an assignment with the real planned start/tolerance  
When the on-time boundary Employee checks in exactly at the tolerated boundary  
Then backend analytics do not classify that record as late  
And the one-minute-after-boundary Employee is classified late according to the final backend rule

### Scenario 27: Absence golden case

Given a completed assigned Shift for the absent golden Employee  
And no valid CheckIn exists  
When HU-031 is queried  
Then backend-derived absence analytics include that absence without a fabricated AttendanceRecord

### Scenario 28: Worked time

Given a seeded closed AttendanceRecord  
When HU-031 is queried  
Then workedMinutes are greater than zero and derive from valid CheckIn/CheckOut timestamps

### Scenario 29: Projected pay

Given a seeded Employee with a positive HourlyRate and completed work  
When HU-031 is queried  
Then projectedPay is greater than zero and is calculated by backend authority

### Scenario 30: Balanced closing

Given the balanced golden BusinessDate  
When its CashClosing is queried  
Then declaredCash equals expectedCash  
And difference is zero

### Scenario 31: Surplus closing

Given the surplus golden BusinessDate  
When its CashClosing is queried  
Then difference is positive  
And observation is non-empty

### Scenario 32: Shortage closing

Given the shortage golden BusinessDate  
When its CashClosing is queried  
Then difference is negative  
And observation is non-empty

### Scenario 33: Cash snapshot coherence

Given a migration-owned CashClosing  
When its Sales, Expenses, opening and removal data are recomputed using the final backend formula  
Then expectedCash matches the persisted snapshot  
And difference equals declaredCash minus expectedCash

### Scenario 34: Purchase receipt integrity

Given a migration-owned RECEIVED Purchase  
When its receipt and inventory traceability are inspected  
Then receipt lines and inventory effects are coherent

### Scenario 35: Production integrity

Given a migration-owned Production event  
When its consumption/output traceability is inspected  
Then consumed quantities correspond to the intended composition/unit rules  
And no prohibited negative ingredient balance was required

### Scenario 36: Inventory ledger reconciliation

Given all migration-owned inventory activity  
When final balances are reconciled with the canonical movement authority  
Then no owned Product has an unexplained balance/movement divergence

### Scenario 37: Down cleanup

Given the seed has been applied  
When the database is migrated down one migration  
Then all rows owned by this migration are removed  
And earlier demo/manual rows remain untouched

### Scenario 38: Re-apply

Given the seed was migrated down in a disposable database  
When it is applied again  
Then the same deterministic IDs and logical dataset are recreated

### Scenario 39: Integration-test database

Given the repository's normal integration-test database creation workflow  
When migrations run  
Then this demo seed follows the established contamination-prevention convention  
And unrelated tests do not silently gain thousands of demo operational rows

## Edge Cases

- June 1 boundary.
- June 30 → July 1 boundary.
- July 31 → August 1 boundary.
- August 31 boundary.
- Sunday and Monday demand.
- a late-night valid Sale.
- BusinessDate differing from naïve UTC calendar interpretation.
- consumer-final Sale.
- repeat Customer.
- CI/NIT uniqueness.
- Sale with several line items.
- large but plausible Sale.
- CASH/DIRECT.
- QR/DIRECT.
- EXTERNAL/DIRECT when valid.
- CASH/PEDIDOSYA when valid.
- QR/PEDIDOSYA.
- EXTERNAL/PEDIDOSYA.
- zero inventory.
- negative inventory.
- decimal inventory quantity.
- minimumStock zero.
- minimumStock null.
- received Purchase.
- pending Purchase.
- cancelled Purchase.
- partial received quantity only if domain permits it.
- Production with unit conversion.
- Production immediately after replenishment.
- Expense CASH_DRAWER.
- Expense PETTY_CASH.
- balanced closing.
- positive difference.
- negative difference.
- Attendance at exact tolerance.
- Attendance one minute after tolerance.
- genuine absence.
- closed Attendance.
- varying HourlyRate where supported.
- projectedPay zero for no closed work.
- existing prior-demo BusinessDate.
- non-owned conflicting BusinessDate.
- deterministic UUID collision preflight.
- Down with unrelated rows in the same June-August range.

## Acceptance Criteria

- A local baseline audit MUST identify the actual current migration immediately preceding the new seed.
- Block 5 final backend contract MUST be reconciled before migration creation.
- Schema diff MUST be empty.
- Model diff MUST be empty.
- Frontend diff MUST be empty.
- Generated API diff attributable to this change MUST be empty.
- Package diff MUST be empty.
- The final change MUST contain exactly one new DATA-ONLY migration.
- The migration MUST not rely on runtime randomness.
- The migration MUST not depend on wall-clock time.
- Owned IDs MUST be deterministic.
- Down ownership MUST be exact.
- No broad delete may be used.
- No duplicate CashSession may exist for a seeded BusinessDate.
- No duplicate CashClosing may exist where the schema prohibits it.
- No seeded September operational row may exist.
- All three months MUST contain Sales.
- Both Shift types MUST have meaningful Sales.
- Both Channels MUST have meaningful Sales.
- All three PaymentMethods MUST have meaningful Sales.
- At least one nontrivial Payment/Channel cross-combination MUST prove those dimensions are independent.
- Sale totals MUST reconcile with seeded line data.
- Inventory MUST expose NORMAL, LOW and NEGATIVE.
- Inventory balances/movements MUST reconcile according to the audited persistence authority.
- RECEIVED Purchases MUST have coherent receipt/inventory effects.
- Production MUST have coherent consumption/output.
- Attendance MUST contain both Shift types.
- Attendance analytics MUST produce lateCount > 0.
- Attendance analytics MUST produce absenceCount > 0.
- Attendance analytics MUST produce workedMinutes > 0.
- Attendance analytics MUST produce projectedPay > 0.
- No migration-owned historical AttendanceRecord may remain open.
- Cash history MUST contain zero, positive and negative differences.
- Every required non-zero CashClosing observation MUST be non-empty.
- CashClosing expected/difference MUST reconcile with seeded source data.
- HU-029 June/July/August/full-period validations MUST pass.
- HU-029 Shift/Channel combination validations MUST pass.
- HU-030 status validations MUST pass.
- HU-031 period/Employee/Shift validations MUST pass.
- Clean disposable DB migration chain MUST pass.
- Previous-baseline → seed migration MUST pass in disposable DB.
- Down/Up reproducibility SHOULD pass in disposable DB.
- Full backend gates MUST pass using current commands.
- EF pending-model-change check MUST report no model change.
- `git diff --check` MUST pass.
- Integration-test contamination risk MUST be explicitly resolved.
- Actual post-apply row counts MUST be recorded rather than copied from target ranges.

## Out of Scope

- Block 5 backend implementation.
- Block 5 frontend implementation.
- HU-028 frontend changes.
- Report export implementation.
- CSV.
- XLSX.
- PDF.
- Report charts.
- Database schema evolution.
- New domain entities.
- New API contracts.
- Role redesign.
- Payroll workflow.
- Inventory business-rule changes.
- Application-service execution from migrations.
- Load testing.
- Performance benchmark datasets.
- September 2026 operational data.
- Production deployment seeding.
- Manual UI evidence.
