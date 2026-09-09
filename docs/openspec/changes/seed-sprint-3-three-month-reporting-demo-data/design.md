# Design

## Components Touched

Future APPLY is expected to touch only:

- the actual EF Core migrations area in Infrastructure;
- one generated migration designer file;
- migration-specific verification/tests if repository convention supports them;
- demo dataset documentation;
- OpenSpec apply/verify artifacts.

Expected product areas unchanged:

- Domain entities.
- Application services.
- API endpoints.
- `ApplicationDbContext` model.
- Frontend.
- generated TypeScript.
- package manifests.
- lockfiles.

## Boundaries Respected

This is a DATA migration, not a feature.

The design MUST preserve:

- existing domain schema;
- current backend authority;
- existing inventory model;
- existing attendance derivation;
- existing cash formula;
- existing report contracts;
- previous demo migration ownership;
- current manual September operation.

The migration MUST NOT attempt to "fix" any Block 5 contract through seeded data.

## Contracts Changed

No external contract changes are confirmed or authorized from this change.

Expected:

- OpenAPI: unchanged.
- generated TypeScript: unchanged.
- frontend report contracts: unchanged.
- schema: unchanged.

The future APPLY is conditional on final Block 5 backend reconciliation:

`APPLY_DEPENDS_ON_BLOCK_5_BACKEND_RECONCILIATION`

## Local Baseline Audit

Required before APPLY:

1. `git status`.
2. branch.
3. HEAD.
4. staged/unstaged/untracked.
5. actual migrations directory.
6. current latest migration.
7. current `ApplicationDbContext`.
8. current EF configurations.
9. current Block 5 backend.
10. current report service implementations.
11. generated TypeScript.
12. Block 5 active OpenSpec if locally present.
13. HU-028 implementation.
14. integration-test database creation/reset strategy.

Current generation values:

- Branch: `UNVERIFIED_LOCAL`.
- HEAD: `UNVERIFIED_LOCAL`.
- Working tree: `UNVERIFIED_LOCAL`.

## Existing Migrations / Demo Seed Audit

Secondary evidence identifies:

`AddComprehensiveDemoData`

as the existing comprehensive demo seed.

It is already:

- DATA-ONLY.
- deterministic.
- reversible.
- based on fixed GUIDs/dates.
- protected by a database-name gate intended to keep operational demo rows out of test DBs. citeturn439384view0turn570830view0

Its `Down` uses explicit known IDs rather than broad date deletion, which is the precedent this migration should preserve. citeturn512094view5

### Existing Guaranteed Demo Inventory — Secondary Evidence

| Area                 |      Existing demo evidence |
| -------------------- | --------------------------: | ---------------------- |
| Users                |                           4 |
| Employees            |                           4 |
| Products             |                          20 |
| Customers            |                          10 |
| Suppliers            |                           4 |
| Expense Categories   |                           4 |
| Product Compositions |                           6 |
| Productions          |                          12 |
| Purchases            |                          10 |
| Receipts             |                           6 |
| Orders               |                          25 |
| Sales                |                          25 |
| Expenses             |                          10 |
| CashSessions         |                           5 |
| Shifts               |                          10 |
| CashClosings         |                           5 |
| AttendanceRecords    | 8 + derived absence context |
| InventoryBalances    |                          20 |
| InventoryMovements   |                          20 | citeturn439384view0 |

### Stable Base Catalog

Stable Categories/Units are seeded at model/migration level and should be reused where the local baseline confirms the same IDs.

Examples observed:

- MENU categories.
- INVENTORY categories.
- PREPARATION categories.
- g.
- kg.
- ml.
- l.
- unit. citeturn242822view0

Do not create duplicate Units/Categories merely for this dataset.

## Existing Demo Overlap Strategy

The existing seed already owns CashSessions/CashClosings on a small number of July BusinessDates.

Core rule:

`PREVIOUS_SEED_DATES_ARE_RESERVED`

For every prior-demo date:

- reuse the existing complete historical day;
- do not create a duplicate CashSession;
- do not insert new Sales linked to that closed day's Shifts;
- do not insert new cash-impacting Expenses;
- do not modify its CashClosing;
- do not delete it in Down.

For all uncovered dates:

- create new migration-owned CashSession;
- MORNING Shift;
- NIGHT Shift;
- canonical operations;
- final CashClosing.

If local audit identifies a different overlap set, use the LOCAL set.

## Actual Schema / Entity Map

Secondary current model evidence establishes the following relevant graph and invariants. Local code remains authoritative. citeturn898165view0turn944424view0

### Identity / Personnel

    User
      → Employee
      → ShiftAssignment
      → AttendanceRecord context

Important:

- User link is unique on Employee.
- HourlyRate is stored on Employee.

### Catalog / Inventory

    Category
    Unit
      → Product
          → ProductComposition
          → InventoryBalance
          → InventoryMovement

Important:

- InventoryBalance is product-scoped.
- InventoryMovement delta cannot be zero.
- movement types are constrained.

### Cash / Shift

    CashSession
      → Shift MORNING
      → Shift NIGHT
      → CashClosing

Important:

- CashSession BusinessDate unique.
- Shift unique by CashSession + type.
- CashClosing unique by CashSession.

### Sales

    Shift
      → Order
          → OrderItem
          → Sale
              → SaleItem

Important:

- Sale OrderId unique.
- real Order states only.
- Customer optional.
- PaymentMethod and Channel stored independently.

### Purchases

    Purchase
      → PurchaseItem
      → PurchaseReceipt
          → PurchaseReceiptLine
      → InventoryMovement

### Production

    ProductComposition
      → Production
          → ProductionConsumption
          → InventoryMovement consume/output

### Expenses

    Shift
      → Expense

with:

- CASH_DRAWER.
- PETTY_CASH.

### Attendance

    CashSession/Shift
      → ShiftAssignment
          → Employee

plus AttendanceRecord according to the current relation/business-date model.

Local audit MUST determine the exact joins used by HU-024/HU-031 for:

- lateness.
- absence.
- Shift filtering.

## Stable Master Data Strategy

### Reuse

Prefer reuse of:

- stable base role rows.
- stable Categories.
- stable Units.
- other non-temporal migration-guaranteed rows where safe.

### Do Not Blindly Reuse Temporal Demo Master Data

Existing comprehensive demo Products/Customers/Suppliers may have audit timestamps later than June 2026.

Using a Product "created" in August inside a June Sale would undermine the requested realism.

Therefore the preferred design is:

1. audit CreatedAt fields;
2. where timestamps are semantically visible/relevant, create migration-owned reporting master data with deterministic timestamps before June 1;
3. reuse stable Categories/Units;
4. keep previous demo master data untouched.

### Proposed Migration-Owned Master Profile

Subject to schema audit:

- 8 reporting Employees/User links total or enough additions to bring useful Employees to approximately 6–12.
- 30–40 reporting Customers.
- 3–5 Suppliers.
- a compact set of ingredient/menu/preparation Products sufficient for:
  - Sales variety;
  - Purchase replenishment;
  - Production;
  - NORMAL/LOW/NEGATIVE end state.
- ExpenseCategories only if no guaranteed suitable categories exist.
- ProductCompositions necessary for production paths.

Exact names and counts are technical implementation choices.

## Seed Ownership Strategy

### Goal

Down must identify exact owned rows independent of dates.

### Strategy

Reserve a migration-specific deterministic UUID namespace after checking all local previous migrations.

Conceptual input:

    reporting-seed namespace
    + entity kind
    + date index
    + per-date sequence

Examples conceptually:

    Sale(dateIndex, saleSequence)
    Order(dateIndex, saleSequence)
    OrderItem(dateIndex, saleSequence, itemSequence)
    CashSession(dateIndex)
    Shift(dateIndex, shiftType)
    Employee(employeeIndex)

The exact binary/hex UUID construction is deferred until local collision audit.

Requirements:

- no extension requiring random UUID generation;
- same inputs → same UUID;
- namespace does not overlap prior demo patterns;
- Down can regenerate or enumerate exactly the same keys;
- master rows have a fixed explicit owned-key set.

### Conflict Handling

Before inserts:

- detect migration-owned ID collisions;
- detect unexpected CashSession conflicts on dates that are neither empty nor known previous-seed dates;
- detect other uniqueness conflicts that would make deterministic ownership unsafe.

Preferred behavior:

`RAISE/FAIL transaction`

rather than merge arbitrary manual data.

This preserves reproducibility and user-owned data.

## Date Profile

Target:

| Month       | Dates | Relative activity     |
| ----------- | ----: | --------------------- |
| June 2026   |    30 | baseline medium       |
| July 2026   |    31 | moderately above June |
| August 2026 |    31 | highest               |
| Total       |    92 | three complete months |

No September.

## Weekday Profile

Conceptual deterministic base Sales pressure:

| Day       | Relative profile |
| --------- | ---------------- |
| Monday    | Low-medium       |
| Tuesday   | Low-medium       |
| Wednesday | Medium           |
| Thursday  | Medium           |
| Friday    | High             |
| Saturday  | Very high        |
| Sunday    | Medium-high      |

Each BusinessDate also receives a small deterministic variation derived from:

- month index;
- day-of-month;
- date index modulo;
- not true randomness.

## Shift Profile

Approximate distribution:

- MORNING: ~40–45% Sales.
- NIGHT: ~55–60% Sales.

Both are guaranteed on the Sales golden day.

Attendance coverage includes both.

## Channel Profile

Conceptual:

- DIRECT: approximately 70%.
- PEDIDOSYA: approximately 30%.

Use an independent deterministic function from PaymentMethod.

## Payment Profile

Conceptual:

- CASH: approximately 50%.
- QR: approximately 35%.
- EXTERNAL: approximately 15%.

The exact values are not acceptance thresholds.

### Independence Strategy

Channel assignment and Payment assignment use different deterministic indexes/moduli.

For example conceptually:

    channelIndex = f(dateIndex, saleIndex)
    paymentIndex = g(dateIndex, saleIndex, shiftIndex)

with `f != g`.

Golden Sales BusinessDate explicitly includes:

- DIRECT + CASH.
- DIRECT + QR.
- DIRECT + EXTERNAL if valid.
- PEDIDOSYA + CASH if valid.
- PEDIDOSYA + QR.
- PEDIDOSYA + EXTERNAL.

Only combinations permitted by the final business contract are retained.

## Proposed Dataset Profile

Approximate combined target:

| Dataset               |                   Approximate target |
| --------------------- | -----------------------------------: |
| BusinessDates         |                                   92 |
| new CashSessions      | ~87 if 5 prior dates remain reusable |
| combined CashSessions |                                  ~92 |
| new Shifts            |                                 ~174 |
| combined Shifts       |                                 ~184 |
| Sales                 |                          1,200–1,800 |
| Order/Sale lines      |                          3,000–5,000 |
| Expenses              |                              150–250 |
| Purchases             |                                30–50 |
| Production events     |                              200–400 |
| ShiftAssignments      |                             ~700–900 |
| AttendanceRecords     |   assignments minus genuine absences |
| Customers             |               ~30–50 useful combined |
| CashClosings          |                                  ~92 |

Exact local overlap can change the `new` counts.

## Sales Flow Design

For each generated Sale:

    BusinessDate
      → CashSession
      → Shift
      → Order
      → OrderItems
      → ENTREGADO/current required state
      → Sale
      → SaleItems
      → inventory effect

### Sale Count

Daily sale volume is deterministic from:

- weekday base;
- month uplift;
- small modulo variation.

Split between MORNING/NIGHT deterministically.

### Product Mix

Use weighted deterministic menu selection:

- high-frequency items;
- medium-frequency items;
- low-frequency items.

Each Sale gets a deterministic number of lines.

Avoid all Sales looking identical.

### Totals

Construct:

    SaleItems
      → line totals
      → Sale Subtotal/Total

Header totals are derived from the same generated line source.

No disconnected literals.

## Customer Model

Create/reuse deterministic Customer pool.

Profile:

- approximately one-third consumer-final/null customer;
- remainder assigned among deterministic Customers;
- some high-frequency repeat Customers;
- some occasional Customers.

CI/NIT values are fixed and unique.

New reporting Customers, if required, use pre-period deterministic CreatedAt.

## HU-029 BusinessDate Design

Block 5 final backend is expected to filter by BusinessDate, Shift and Channel.

The seed therefore models BusinessDate through the actual Sale → Shift → CashSession relationship.

ConfirmedAt timestamps are generated within plausible local Shift windows.

Boundary samples are intentionally few:

- late June 30.
- late July 31.
- late August 31 if it remains inside valid operational semantics.

No September BusinessDate is created.

## Inventory Authority Design

The new reporting Products should preferably be migration-owned so the migration can control:

- opening inventory;
- Purchases;
- Production;
- Sales;
- movements;
- final balances;
- Down ownership.

This avoids changing unrelated/manual inventory.

### Ledger Principle

Define one canonical inventory-event dataset in SQL/migration logic.

Conceptually:

    initial inventory
      + purchase receipt entries
      - production consumption
      + production output
      - sale depletion
      + only real additional movement types when required
      = final InventoryBalance

Both:

- InventoryMovement.
- InventoryBalance.

must derive from the same logical ledger.

No double application.

## Inventory Final-State Plan

Select three owned products after schema audit:

### Golden NORMAL

Final:

    quantity > minimumStock

### Golden LOW

Final:

    quantity >= 0
    quantity <= minimumStock

### Golden NEGATIVE

Final:

    quantity < 0

The NEGATIVE path MUST use a domain flow where negative inventory is legitimately allowed.

Do not force a production ingredient negative if Production forbids it.

If necessary choose a Sale-depleted product for NEGATIVE after auditing how Sale inventory is persisted.

## Purchase Replenishment

Distribution:

- approximately weekly/semi-weekly.
- deterministic weekday schedule.
- received Purchase majority.
- occasional pending/cancelled examples.

Received data:

    Purchase
      → PurchaseItems
      → PurchaseReceipt
      → ReceiptLines
      → InventoryMovement

The same source quantities drive the inventory ledger.

## Production

Production cadence:

- distributed across all three months;
- multiple preparations;
- generally more production before higher-demand days;
- no impossible ingredient consumption.

Flow:

    ingredient inventory available
      → Production
      → ProductionConsumption snapshots
      → consumption movements
      → output movement
      → preparation balance

BatchCodes are deterministic and unique.

## Expenses

Approximately 1–3 Expenses on many operating dates, not uniformly every date.

Patterns:

- frequent low amount.
- periodic medium amount.
- occasional larger amount.

Both:

- CASH_DRAWER.
- PETTY_CASH.

are distributed across all months.

Expenses that affect cash are included in the same daily cash aggregate used for CashClosing.

## CashSession Design

For every uncovered BusinessDate:

    CashSession
      → MORNING
      → handover
      → NIGHT
      → final close

Opening amounts use small deterministic variations.

Example conceptual range only:

- main opening: moderate fixed operating float.
- petty opening: smaller fixed operating float.

No exact amounts are frozen before schema/backend audit.

## Handover

Use actual current fields.

Deterministic values depend on date/sales activity.

`cashRemovedAmount` is represented exactly once.

`cashAmountCarriedForward`, if part of the current model, is contextual and never added twice into expected cash.

## CashClosing Derivation

For each owned BusinessDate, derive source aggregates from the seeded operational rows.

Conceptually, subject to final backend code:

    expectedCash =
        openingAmount
      + pettyCashOpeningAmount
      + CASH sales
      - CASH_DRAWER expenses
      - PETTY_CASH expenses
      - cashRemovedAmount

Do not substitute this conceptual formula for the local implementation without audit.

The migration SQL SHOULD calculate source aggregates rather than repeat literals.

### Difference Distribution

Conceptually:

- ~85% zero.
- ~7–8% positive.
- ~7–8% negative.

Deterministic pattern by date index.

Nonzero observations use a fixed small vocabulary of plausible explanations, mapped deterministically.

No `"test"` placeholders.

## Attendance Model Design

### Employee Pool

Target:

6–12 useful Employees.

Where possible:

- reuse Employees whose temporal/audit model is safe;
- create owned Employees/User links only when needed.

HourlyRate values:

- reuse real existing demo rates when guaranteed;
- otherwise seed fixed plausible rates only if the Employee model requires/permits it.

No payroll configuration workflow is added.

### Assignments

For each date:

- assign a useful subset/all reporting Employees.
- MORNING and NIGHT both represented.
- alternate selected personas over time.

ShiftAssignment snapshot fields come from actual WorkSchedule semantics or fixed effective snapshots according to schema.

### Personas

| Persona        | Deterministic behavior              |
| -------------- | ----------------------------------- |
| A              | Highly punctual, stable hours       |
| B              | Usually punctual, periodic lateness |
| C              | Occasional genuine absences         |
| D              | More lateness and a few absences    |
| E              | Primarily MORNING                   |
| F              | Primarily NIGHT                     |
| G/H if present | mixed coverage/varied hours         |

### Lateness

Do not seed `lateCount`.

Generate CheckIn times.

Golden case after final rule audit:

- exact tolerance boundary → not late.
- one minute after tolerance → late.

If current backend still uses 08:00 + 10 minute tolerance:

- 08:10 → not late.
- 08:11 → late.

But local code is authoritative.

### Absence

Golden absent Employee:

    ShiftAssignment exists
    + Shift completed
    + no valid CheckIn

No fake AttendanceRecord is inserted merely to tag absence.

### Worked Time

All present historical records are closed.

Durations vary around scheduled work.

No current-time dependency.

### Projected Pay

The migration only seeds:

- Employee HourlyRate.
- closed attendance source records.

HU-031 backend calculates ProjectedPay.

## Report Coverage Profile

| Dimension    | June | July | August | Required diversity          |
| ------------ | ---- | ---- | ------ | --------------------------- |
| Sales        | Yes  | Yes  | Yes    | Increasing overall activity |
| MORNING      | Yes  | Yes  | Yes    | meaningful                  |
| NIGHT        | Yes  | Yes  | Yes    | meaningful                  |
| DIRECT       | Yes  | Yes  | Yes    | majority                    |
| PEDIDOSYA    | Yes  | Yes  | Yes    | meaningful minority         |
| CASH         | Yes  | Yes  | Yes    | all months                  |
| QR           | Yes  | Yes  | Yes    | all months                  |
| EXTERNAL     | Yes  | Yes  | Yes    | all months                  |
| Expenses     | Yes  | Yes  | Yes    | drawer + petty              |
| Purchases    | Yes  | Yes  | Yes    | mostly received             |
| Production   | Yes  | Yes  | Yes    | multiple preparations       |
| Attendance   | Yes  | Yes  | Yes    | punctual + late + absent    |
| CashClosings | Yes  | Yes  | Yes    | 0 / positive / negative     |

## Golden Cases

Exact IDs/dates are selected and frozen during APPLY after local collision audit.

### Golden Sales BusinessDate

Requirements:

- date within range and not owned by prior demo migration;
- MORNING + NIGHT.
- DIRECT + PEDIDOSYA.
- CASH + QR + EXTERNAL.
- exact line totals known.
- report summary exact.
- BusinessDate series exact.

Preferred location:

a mid-month non-overlap day, avoiding boundary ambiguity.

### Golden Attendance Day

One completed Shift containing:

- Employee A punctual.
- Employee B late.
- Employee C assigned but absent.

If final tolerance remains 10 minutes:

- include exact tolerance boundary elsewhere or on same golden day.
- include +1 minute late case.

### Golden Inventory Items

Three migration-owned products:

- `Golden NORMAL`.
- `Golden LOW`.
- `Golden NEGATIVE`.

Names are conceptual; final names should remain realistic demo product names, not test-fixture labels exposed to UI.

Tests identify them by deterministic IDs.

### Golden Cash Days

Three non-overlapping owned dates:

1. balanced:
   - difference 0;
   - observation optional/null according to rule.

2. surplus:
   - small positive difference;
   - meaningful observation.

3. shortage:
   - small negative difference;
   - meaningful observation.

## Up Design

Recommended high-level order after actual FK audit:

1. apply established demo-DB guard.
2. assert baseline/preconditions/conflicts.
3. establish deterministic ID/date CTE helpers.
4. insert migration-owned Users/Employees if required.
5. insert migration-owned master data:
   - Customers;
   - Suppliers;
   - Products;
   - ExpenseCategories;
   - ProductCompositions.
6. establish opening InventoryBalances/movements for owned products.
7. generate uncovered BusinessDate CashSessions.
8. generate MORNING/NIGHT Shifts.
9. generate ShiftAssignments.
10. generate AttendanceRecords for non-absence assignments.
11. generate Purchases/PurchaseItems.
12. generate PurchaseReceipts/ReceiptLines.
13. generate Purchase inventory movements.
14. generate Production/Consumption.
15. generate Production inventory movements.
16. generate Orders/OrderItems.
17. generate Sales/SaleItems.
18. generate Sale inventory movements.
19. generate Expenses.
20. calculate final owned InventoryBalances from ledger authority.
21. populate/update handover fields owned by this migration.
22. derive CashClosing source aggregates.
23. insert owned CashClosings.
24. run migration-local assertions where repository style allows them.

Actual order MUST follow local foreign keys.

## Entity Dependency Graph

Conceptual, to be replaced by local exact graph:

    Stable Categories / Units / Roles
      ↓
    Migration-owned Users / Employees
      ↓
    Products / Customers / Suppliers / ExpenseCategories
      ↓
    ProductCompositions
      ↓
    CashSessions
      ↓
    Shifts
      ├── ShiftAssignments
      │     └── AttendanceRecords/context
      ├── Orders
      │     ├── OrderItems
      │     └── Sales
      │           └── SaleItems
      └── Expenses

    Suppliers / Products
      └── Purchases
            ├── PurchaseItems
            └── PurchaseReceipts
                  └── ReceiptLines
                        └── InventoryMovements

    Products / ProductCompositions
      └── Production
            └── ProductionConsumption
                  └── InventoryMovements

    Orders / Sales
      └── InventoryMovements

    all inventory events
      └── InventoryBalances

    CashSession + Shifts + Sales + Expenses + handover
      └── CashClosing

## Down Design

Reverse exact owned dependency order, conceptually:

1. CashClosings.
2. AttendanceRecords.
3. ShiftAssignments.
4. SaleItems.
5. Sales.
6. OrderItems.
7. Orders.
8. ProductionConsumptions.
9. Productions.
10. PurchaseReceiptLines.
11. PurchaseReceipts.
12. PurchaseItems.
13. Purchases.
14. Expenses.
15. InventoryMovements.
16. InventoryBalances owned by new Products.
17. Shifts.
18. CashSessions.
19. ProductCompositions.
20. owned Products.
21. owned Customers.
22. owned Suppliers.
23. owned ExpenseCategories.
24. owned Employees.
25. owned Users if created.

The exact order follows actual local FKs.

Every delete uses owned deterministic keys.

Never delete by range alone.

## Integration Test Contamination Analysis

### Secondary Existing Precedent

Existing demo documentation states that comprehensive demo data is conditionally inserted only into the designated application demo database, specifically to avoid adding those rows to test databases. citeturn439384view0turn570830view0

Therefore the project already has an established strategy that may be reusable.

### Current Risk

`MEDIUM until local verification`

It becomes:

- LOW if current integration tests use different DB names and existing gate remains intentional.
- HIGH if tests now run against the same gated database name or rely on applying every demo row.

### Mitigation

Before migration creation:

- inspect Testcontainers setup;
- inspect reset strategy;
- inspect database names;
- inspect whether current demo migration runs inside tests.

Do not weaken tests.

If the established gate remains correct, reuse it.

## Clean DB Verification

Use an isolated disposable PostgreSQL environment.

For seed-enabled validation:

    empty demo database
      → all migrations
      → reporting seed
      → invariant/report verification

If the seed is intentionally gated on database name, the disposable instance must use the established demo database name.

This must not run against the developer's active database.

## Existing Baseline Verification

In a separate disposable environment:

    database at previous latest migration
      → new seed migration
      → invariant/report verification

If a copy contains arbitrary manual June-August conflicts:

expect the defined fail-safe behavior, not silent overwrite.

## Down / Up Verification

In disposable DB:

    apply seed
      → capture owned counts + golden results
      → migrate down one migration
      → verify owned rows absent
      → verify previous seed rows remain
      → migrate up
      → compare deterministic IDs/counts/golden values

## Report Endpoint / Service Verification

### HU-028

Verify:

- June closings.
- July closings.
- August closings.
- balanced.
- surplus.
- shortage.

### HU-029

After final Block 5 backend reconciliation:

- June.
- July.
- August.
- June-August.
- MORNING.
- NIGHT.
- DIRECT.
- PEDIDOSYA.
- all four Shift/Channel combinations.
- CASH/QR/EXTERNAL > 0.
- BusinessDate series multiple points.
- summary/series/channel consistent.

### HU-030

Verify:

- total > 0.
- low > 0.
- negative > 0.
- golden NORMAL.
- golden LOW.
- golden NEGATIVE.
- COCINA meaningful dataset according to final policy/scope.

### HU-031

Verify:

- June.
- July.
- August.
- full period.
- Employee.
- MORNING.
- NIGHT.
- Employee+Shift.
- late > 0.
- absence > 0.
- workedMinutes > 0.
- projectedPay > 0.
- global summary reconciled with final backend semantics.

## Required Tests Per Layer

### Migration / Database

If test infrastructure exists, add/extend tests or deterministic verification for:

- ownership.
- FK integrity.
- uniqueness.
- no September.
- counts/diversity.
- Down cleanup.
- reproducibility.

### Domain Data Invariants

Verify:

- Sale totals.
- purchase/receipt linkage.
- production consumption.
- inventory ledger/balance.
- cash expected/difference.
- attendance golden derivation.

### Report Integration

Verify HU-028/HU-029/HU-030/HU-031 against actual final contracts.

### Full Backend

Run current:

- restore if repository workflow requires it;
- build;
- tests;
- EF pending-model-change check.

Exact commands MUST be read from the current repository.

### Frontend

No frontend product changes.

No frontend implementation gates are required solely because of this seed unless repository-wide verification convention explicitly requires them.

## Tradeoffs Accepted

- One relatively large data migration is preferred over several loosely coupled seed migrations because cash/inventory/attendance/report coherence is cross-domain.
- Exact row targets are approximate; deterministic integrity is preferred.
- Set-based PostgreSQL SQL is acceptable because the project already targets PostgreSQL, provided only guaranteed features are used.
- A migration-specific master-data subset is acceptable to preserve temporal coherence and reversible ownership.
- Previous demo rows remain in place and contribute to coverage rather than being rewritten.
- Conflicting arbitrary manual historical data causes a safe migration failure rather than nondeterministic merge behavior.
- Golden cases are a small deterministic subset embedded in a broader non-uniform realistic dataset.
- Existing demo database gating may be reused because it is an established precedent, but only after local verification.

## Implementation Constraints

- No local Git mutation before APPLY.
- No migration creation during this generation.
- No schema edit.
- No application-service calls from migration.
- No random IDs.
- No random data generation.
- No current date/time.
- No optional UUID extensions unless already guaranteed.
- No broad deletes.
- No changes to prior demo migration.
- No September operational activity.
- No new packages.
- No frontend diff.
- No generated API diff.
- No report totals disconnected from canonical rows.
- No client/report work inside this change.
- No test weakening.
- No manual UI evidence requirement.

## Open Design Questions

### Blocking Technical Research Before APPLY

1. What are the exact local Branch/HEAD/status values?
2. What is the exact latest previous migration?
3. Does local `AddComprehensiveDemoData` match the secondary evidence?
4. Which BusinessDates and IDs does it own locally?
5. Does the database-name demo gate remain the approved convention?
6. How do current integration tests create/reset databases?
7. What is the exact inventory balance/movement persistence authority?
8. What exact inventory effects do Sale, PurchaseReceipt and Production persist?
9. What WorkSchedule/ShiftAssignment fields does current HU-031 use?
10. What is the final Block 5 HU-029 filter contract?
11. Is HU-029 period authority now BusinessDate consistently?
12. What is the final HU-030 COCINA role/scope?
13. What is the final HU-031 Shift filter?
14. What are the final lateness/absence derivation rules used by HU-031?
15. What is the final HU-031 global summary contract?
16. Which guaranteed Users possess the actor capabilities needed for realistic audit fields?
17. Which master rows have timestamps that make pre-June reuse unsafe?
18. Which PostgreSQL version/features are guaranteed locally?

These are repository research questions.

No product decision is currently required.

## Audit Outcome

Change:

`seed-sprint-3-three-month-reporting-demo-data`

Migration nature:

`DATA-ONLY`

Schema change:

`NO`

Frontend change:

`NO`

Generated API change:

`NO`

Dependencies change:

`NO`

Seed period:

`2026-06-01 → 2026-08-31`

September operational rows:

`NONE`

Generator verdict:

`SPRINT_3_REPORTING_SEED_OPENSPEC_READY`

Apply dependency:

`APPLY_DEPENDS_ON_BLOCK_5_BACKEND_RECONCILIATION`

Ready for APPLY now:

`NO`
