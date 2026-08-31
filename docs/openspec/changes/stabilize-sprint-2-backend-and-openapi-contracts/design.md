# Design

## Existing Architecture

The change extends the current modular monolith and Clean Architecture implementation rather than introducing a new application pattern.

Relevant existing runtime structure observed in the audited baseline:

- ASP.NET Core / .NET 10 API.
- Application contracts.
- Domain entities.
- EF Core/Npgsql Infrastructure.
- Scoped `ApplicationDbContext`.
- Existing `IInventoryWriter`.
- `OperationsService` implementing Sprint 2 workflows.
- `ExpenseService`.
- PostgreSQL transaction/row-lock behavior.
- ProblemDetails/error-code mapping at the API boundary.
- Runtime OpenAPI.
- Generated TypeScript frontend contract.

The stabilization MUST preserve these boundaries.

No CQRS/MediatR/event sourcing/repository rewrite/custom Unit of Work is justified.

## Components Touched

### Confirmed likely backend modifications

`backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs`

Expected stabilization concerns:

- repeated UnitId validation;
- Purchase list query materialization;
- Current Shift resolution consumers;
- authoritative Sale shortage mapping;
- Purchase receipt mapping.

`backend/src/RestaurantSystem.Infrastructure/Expenses/ExpenseService.cs`

Expected concern:

- current Shift resolution.

`backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs`

Expected change:

- additive nullable `receivedUnitId` on `PurchaseLineDto`.

### Reuse / audit, normally not modified

`backend/src/RestaurantSystem.Infrastructure/Inventory/InventoryService.cs`

`WriteBatchAsync` already:

- joins an ambient transaction when present;
- locks Products;
- materializes/locks balances;
- calculates shortages after locks;
- returns those shortages in `InventoryBatchResult`.

The HU-013 stabilization should consume this authoritative result rather than replace the inventory foundation.

### Tests

Existing operations PostgreSQL integration suites SHOULD be extended where that keeps capability coverage cohesive.

Relevant real test areas include:

- operations contract tests;
- operations concurrency tests;
- authorization matrix tests;
- Inventory integration tests.

A focused stabilization regression file MAY be introduced only if existing suites would become difficult to understand.

### Frontend

`frontend/src/types/api.generated.ts`

MUST be regenerated.

Feature source for HU-004/HU-007/HU-017:

- local paths MUST be discovered during preflight;
- should remain untouched unless generated-contract adaptation is unavoidable.

### Documentation/OpenSpec

Current HU and handoff/current-state documentation MAY require synchronization after all technical gates.

## Boundaries Respected

- The change MUST NOT alter the fundamental architecture.
- `ApplicationDbContext` remains the EF transactional unit.
- `IInventoryWriter` remains the single inventory authority.
- The change MUST NOT create a second DbContext per Purchase solely to preserve parallel fan-out.
- The change MUST NOT introduce `IDbContextFactory` solely for Purchase listing.
- The change MUST NOT modify inventory balance semantics.
- The change MUST NOT change Production/Sale/Purchase transaction ownership except where a fix requires consuming already-authoritative results.
- The change MUST NOT broaden HU scope.
- API endpoints remain stable.
- Frontend features remain consumers of OpenAPI, not sources of backend contract design.
- Documentation follows final code truth; code does not regress to stale documentation.

## Contracts Changed

One external contract extension is approved:

### PurchaseLineDto

Existing semantic fields remain:

- `id`
- `productId`
- `orderedQuantity`
- `unitId`
- `unitCost`
- `receivedQuantity`

Add:

- `receivedUnitId: Guid?`
  or the exact naming equivalent required by current repository conventions.

Semantics:

- `unitId` = ordered unit.
- `receivedQuantity` = actual received quantity, null before reception.
- `receivedUnitId` = actual received unit, null before reception.

This is additive.

No existing property is removed or renamed.

### No route changes

The stabilization MUST retain current paths and verbs for:

- composition;
- production;
- sales;
- purchases;
- purchase reception;
- shifts;
- expenses.

### No request changes expected

Known fixes require no request-schema changes.

### No external contract changes for HU-004/HU-007/HU-017

Repeated-unit validation is internal.

QuantityPerOutputUnit remains unchanged.

Purchase list concurrency fix is internal.

### OpenAPI consequence

OpenAPI changes only where the additive `PurchaseLineDto` field is reflected, plus any metadata normalization strictly necessary to describe the same existing endpoint contract.

## Bug 1 — Purchases Query Strategy

### Current behavior

The current shape is conceptually:

- query filtered Purchase IDs for the requested page;
- call `PurchaseAsync(id)` for every ID;
- run those calls through `Task.WhenAll`;
- each call reuses the same scoped `ApplicationDbContext`.

EF Core does not support overlapping operations on one DbContext.

### Target design

Preferred strategy:

1. Build the filtered Purchase query.
2. Count for pagination.
3. Materialize the requested page using EF-safe database operations.
4. Materialize Purchase lines/receipt information through:
   - one projection capable of producing the final read model; or
   - a small number of sequential bulk queries keyed by the page Purchase IDs.
5. Build DTOs in memory without further parallel DbContext operations.
6. Preserve requested page ordering.

A practical bulk-query design is acceptable when a single nested projection would be difficult for EF/Npgsql to translate:

- query page Purchases;
- query all PurchaseItems for those Purchase IDs;
- query all ReceiptLines/receipt metadata for those IDs;
- group in memory;
- compose PurchaseDto.

This remains O(1) database round trips relative to page size rather than N+1.

### Fallback

Sequential:

- page IDs;
- `foreach`;
- `await PurchaseAsync`.

MAY be used if the bulk/projection approach materially complicates correctness.

If used, design documentation MUST record the N+1 tradeoff and the current maximum page size.

### Explicit rejection

Do not solve by:

- `Task.Run`;
- multiple concurrent operations on the same context;
- manually creating N contexts;
- adding `IDbContextFactory` only for this list.

## Bug 2/3 — Shared Unit ID Validation

### Current defect

Both Composition and Purchase creation independently load a dictionary keyed by UnitId and then compare:

loaded distinct Unit count
vs
line count.

Repeated valid UnitIds therefore appear “missing.”

### Minimal cohesive design

Use a local reusable pattern/helper rather than a general validation subsystem:

1. `requestedUnitIds = lines.Select(UnitId).Distinct()`.
2. Load active Units where ID belongs to `requestedUnitIds`.
3. Compare:
   `loadedUnits.Count == requestedUnitIds.Count`.
4. If false:
   return existing invalid-unit behavior.
5. Validate each line against its Product's InventoryUnit dimension/factors using the dictionary.

A private Infrastructure helper MAY be sufficient.

Product ID validation MUST remain independently based on the domain's duplicate-product rules; do not accidentally copy distinct-unit semantics to Products if duplicate Products are forbidden.

### Contract impact

None.

## QuantityPerOutputUnit Preservation

Production requirement calculation already follows:

`QuantityPerOutputUnit * QuantityProduced`

before Unit conversion.

The stabilization does not redesign this.

Regression coverage should explicitly freeze the behavior, especially for:

- MASS kg/g;
- VOLUME l/ml.

This prevents the repeated-unit fix from accidentally changing production semantics.

## Shift Resolver

### Current inconsistency

Current Shift context is already business-day scoped in one flow, but:

- MyCurrentShift;
- Sale;
- Expense

look for globally ACTIVE Shift records.

### Target semantic

Current operational Shift:

BusinessDate from `IBusinessClock`
→ current `CashSession` where that BusinessDate matches and session is open
→ `Shift` inside that CashSession whose Status is ACTIVE.

### Minimal shared primitive

The implementation SHOULD centralize the predicate/query without introducing a large service hierarchy.

Acceptable shapes, selected after local audit:

- small Infrastructure private/shared query helper;
- a narrow existing Operations helper;
- a minimal `ICurrentShiftResolver` only if cross-service reuse between OperationsService and ExpenseService otherwise causes duplicated semantics.

Because Expense and Operations are separate services, a tiny resolver abstraction may be justified, but its responsibility MUST remain only:

- current open CashSession/current-day Shift lookup;
- optionally a lock-capable variant for transaction-sensitive Sale.

It MUST NOT:

- open shifts;
- perform handovers;
- close cash sessions;
- own authorization;
- implement HU-026/027.

### Read consumers

`CurrentShiftAsync`:

- current CashSession context as today.

`MyCurrentShiftAsync`:

- current Shift query first;
- then assignment to authenticated employee.

`ExpenseService.CreateAsync`:

- optional current Shift ID under existing Expense semantics.

### Transactional consumer

Sale requires row-level protection compatible with its existing transaction.

The lock-capable resolution MUST constrain the SQL by:

- current BusinessDate/open CashSession;
- ACTIVE Shift inside it.

It MUST NOT run `SingleOrDefault` over every historical ACTIVE Shift.

### Cross-day model

Historical ACTIVE state is tolerated as data until future closing functionality handles it.

Stabilization ignores it for “current” queries rather than auto-mutating historical data.

## Sale Shortage Race

### Existing two-stage flow

1. precheck current balances;
2. if known shortage and no acknowledgment, return conflict;
3. create Sale candidate inside transaction;
4. call `WriteBatchAsync`;
5. Inventory obtains row locks and calculates definitive shortages.

The race occurs when step 1 says sufficient and step 5 says insufficient.

### Target flow

Keep the current fast precheck.

When `WriteBatchAsync` returns:

- Error == stock-insufficient;
- `InventoryBatchResult.Shortages` populated;

map the returned shortage response from the batch result.

Do not reuse precheck `req` for this path.

Mapping needs Product metadata already available or can load required safe display data without altering authority.

### Important scope boundary

If `WriteBatchAsync` returns a non-stock error, this change MUST NOT silently redesign its observable Sale/Production error mapping beyond what is strictly necessary for the approved race fix.

The separate Production error-collapse finding remains review-only.

### Transaction behavior

Because the enclosing Sale transaction has not committed, returning the shortage MUST continue causing disposal/rollback of:

- Sale candidate;
- SaleItems;
- inventory changes.

No alternate transaction scheme is required.

## Purchase Receipt DTO and Null Semantics

### Persistence baseline

Receipt lines already persist:

- PurchaseItemId;
- ReceivedQuantity;
- UnitId.

No schema change is needed to distinguish actual Unit.

### Current mapper flaw

The mapping dictionary retains only `ReceivedQuantity`.

`GetValueOrDefault` converts absence into decimal zero.

### Target read mapping

Build receipt metadata keyed by PurchaseItemId containing:

- ReceivedQuantity;
- Received UnitId.

When receipt key exists:

- receivedQuantity = persisted value;
- receivedUnitId = persisted UnitId.

When key does not exist:

- receivedQuantity = null;
- receivedUnitId = null.

Ordered `unitId` continues to come from PurchaseItem.

The same mapping semantics MUST be used by:

- Purchase detail;
- Purchase listing.

Prefer one read-model mapping path so detail/list cannot drift again.

## Data Flow

### Purchase list

- HTTP GET existing purchases route
- authorization
- filter/status/page
- EF-safe page query
- bulk lines/receipt query or equivalent projection
- deterministic in-memory DTO composition
- PagedResponse
- HTTP 200

### Composition replacement

- existing request
- validate structural line rules
- derive distinct Product IDs
- derive distinct Unit IDs
- load valid Products/Units
- verify complete distinct sets
- verify dimension compatibility
- persist replacement transaction
- unchanged response

### Purchase creation

- existing request
- validate Supplier/line values
- load Products
- load DISTINCT Unit IDs
- validate each Product/Unit combination
- preserve role scope/receipt-reference checks
- create Purchase PENDIENTE
- unchanged response
- no inventory movement

### Current Shift

- `IBusinessClock.BusinessDate`
- open CashSession for that business date
- ACTIVE Shift within session
- consumer-specific continuation:
  - CurrentShift context;
  - MyCurrentShift assignment check;
  - Sale ShiftId;
  - Expense ShiftId.

### Sale shortage race

- precheck
- concurrent stock mutation possible
- Sale transaction
- Inventory `WriteBatchAsync`
- inventory locks/reloads balances
- authoritative `InventoryBatchResult.Shortages`
- if shortage and acknowledgment false:
  authoritative conflict result
- transaction rollback
- no stale precheck response

### Purchase receipt mapping

- Purchase + ordered lines
- optional receipt lines
- keyed mapping preserving nullable absence
- ordered Unit from PurchaseItem
- received Unit from PurchaseReceiptLine
- response.

### OpenAPI/TypeScript

- backend fixes
- backend gates
- run API Development
- runtime OpenAPI
- inspect route/schema diff
- run canonical `api:generate`
- inspect generated diff
- minimal/manual frontend adaptation only if required
- frontend gates.

## Transactions

No transaction redesign is required.

The change MUST preserve:

### Production

Production

- consumption movements
- output movement
- balance changes
  → atomic.

### Sale

Order validation

- Sale/SaleItems
- Shift
- inventory
  → atomic.

### Purchase Reception

Receipt

- receipt lines
- inventory
- Purchase status
  → atomic.

Purchase listing and Current Shift read queries do not introduce new transactional write boundaries.

## Concurrency

### DbContext concurrency

One scoped context MUST execute one EF operation at a time.

### Inventory

Continue using existing DB locks from InventoryWriter.

### Sale shortage

Authoritative shortage is the locked batch result.

### Cross-day shift

This is primarily query scoping, not a distributed concurrency problem.

Existing Sale row locks/Shift locking should be preserved.

### Purchase reception

Existing Purchase/Inventory locking remains.

No Redis/distributed lock introduced.

## Required Tests Per Layer

### Domain/Application-level tests

If test infrastructure exists, add/extend tests for:

- QuantityPerOutputUnit scaling as a pure calculation where appropriate;
- DTO/null semantic mapping if mapping logic can be isolated without duplicating integration tests.

Do not create artificial unit tests merely to increase count.

### PostgreSQL integration tests

Primary verification layer.

Required regressions:

#### Purchases list

- > 1 Purchase;
- pagination;
- status filtering;
- several lines;
- same UnitId across lines;
- receipt and pending Purchase together;
- no DbContext concurrency exception.

#### Composition

- multiple components, same UnitId;
- different compatible Units;
- unknown Unit;
- incompatible dimension;
- existing duplicate component behavior.

#### Production

- QPOU scaling;
- kg/g;
- l/ml;
- shortage;
- rollback;
- output increment.

#### Purchase create

- several lines same Unit;
- multiple valid Units;
- invalid Supplier;
- invalid Product;
- total;
- no inventory movement.

#### Receipt

- same ordered/received Unit;
- ordered kg / received g;
- actual quantity;
- nullable pre-reception fields;
- duplicate reception;
- atomicity.

#### Shift

Seed controlled state:

Day 1:

- open CashSession;
- NIGHT ACTIVE remains.

Day 2:

- current BusinessDate;
- new open CashSession;
- MORNING ACTIVE.

Assert:

- CurrentShift Day2;
- MyCurrentShift Day2;
- Sale ShiftId Day2;
- Expense ShiftId Day2;
- no global `SingleOrDefault` ambiguity.

#### Sale shortage race

Use real PostgreSQL/concurrency infrastructure to force:

- precheck sees sufficient;
- competing inventory write wins before Sale batch lock;
- Sale batch detects shortage.

Assert:

- conflict;
- authoritative shortages non-empty;
- values match locked state;
- no Sale commit when acknowledgment absent.

### Contract/OpenAPI tests

- existing routes/methods unchanged;
- response metadata remains;
- PurchaseLineDto exposes nullable `receivedUnitId`;
- `receivedQuantity` remains nullable.

### Frontend tests

Only after generation and only according to actual local consumers.

At minimum:

- existing HU-004 tests remain green;
- existing HU-007 tests remain green;
- existing HU-017 tests remain green;
- no manual UI regression test additions are required if no manual source changes occur.

## Tradeoffs Accepted

- Prefer a small number of sequential bulk EF queries over clever parallelism.
- A single giant LINQ projection is not mandatory if it harms maintainability or translation reliability.
- `receivedUnitId` is an additive DTO field instead of redefining `unitId`.
- Current Shift historical inconsistency is solved by current-day scoping, not automatic cleanup.
- The existing Sale precheck stays for efficiency/UX; the locked batch result becomes final authority.
- Existing architecture remains intentionally simple.
- Documentation is delayed until technical truth is final.
- Newly discovered defects remain review-gated even if fixing them would be convenient while editing the same service.

## Alternatives Rejected

### Multiple DbContexts for Purchase fan-out

Rejected because the read workload does not justify context-factory complexity and preserving parallelism is not a business requirement.

### Keep Task.WhenAll with synchronization hacks

Rejected because a scoped EF DbContext is not thread-safe and serialized/bulk data access is clearer.

### Endpoint redesign

Rejected because compatibility is a primary constraint.

### API v2

Rejected because all approved fixes are backward-compatible.

### New inventory service

Rejected because current InventoryWriter already performs locking, balance updates and authoritative shortage calculation.

### Broad frontend refactor

Rejected because HU-004/HU-007/HU-017 must remain protected.

### Overloaded `unitId` semantics

Rejected because one property cannot unambiguously represent both ordered and received Unit when they differ.

### Treat missing receipt as zero

Rejected because absence and quantity zero are different states; receipt quantities are positive by workflow.

### Automatic historical Shift closure

Rejected because it introduces future cash/closing behavior outside HU-025 stabilization.

## Implementation Constraints

- Minimal diff is preferred after correctness.
- No route or verb changes.
- No breaking request/response changes.
- No migration unless demonstrated necessary.
- No DbContextFactory for the known listing bug.
- No second inventory engine.
- No new global architecture framework.
- No frontend redesign.
- No changes to approved QPOU semantics.
- No automatic fix of review-only findings.
- No decision about inactive historical receipt Units.
- Runtime OpenAPI only after backend stability.
- Generated TypeScript only from runtime OpenAPI.
- Documentation last.
- No fabricated evidence.
- No Git mutation by the agent unless separately authorized.
- No VERIFY/ARCHIVE.

## Open Design Questions

### Blocking baseline question: local repository state

The local `develop` HEAD and working tree were not accessible during artifact generation.

Before APPLY, local preflight MUST establish whether:

- the remote-observed seven bugs remain;
- HU-004/HU-007/HU-017 frontend integrations are present locally;
- additional unpushed changes affect generated types/contracts.

This is a repository-state question, not a product decision.

### PRODUCT_DECISION_REQUIRED: inactive receipt Unit

If a Purchase was created while a Unit was active and the Unit becomes inactive before reception, the intended business behavior is not frozen.

The stabilization MUST not enforce a new rule until decided.

### ADDITIONAL_FINDING_REQUIRES_HUMAN_REVIEW: Production error collapse

Current code appears capable of mapping any InventoryWriter failure to `PRODUCTION_STOCK_INSUFFICIENT`.

Changing this may improve correctness but can affect observable HU-007 error semantics.

Excluded until approved.

### ADDITIONAL_FINDING_REQUIRES_HUMAN_REVIEW: unknown receipt Unit

Current receive logic may throw when a requested receipt UnitId is absent rather than returning controlled validation.

This is not one of the approved seven fixes and remains excluded until approved.
