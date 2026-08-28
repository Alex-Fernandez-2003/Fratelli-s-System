# Design

## Components Touched

### Inventory capability

Likely:

- Domain Inventory.
- Application Inventory contracts/use cases.
- Infrastructure Inventory EF/transactional writer/read queries.
- API Inventory route group.
- Inventory authorization policies.
- Integration tests.

### Expenses capability

Likely:

- Domain Expenses.
- Application Expenses contracts/use cases.
- Infrastructure Expense/category persistence.
- API Expenses/category route groups.
- Expense authorization policies.
- Integration tests.

### Shared/transversal

- `ApplicationDbContext` or actual modular EF configuration.
- Infrastructure DI.
- API policy registration.
- migration/model snapshot.
- OpenAPI.
- documentation.

Exact files MUST be determined from local `develop`.

## Repository Audit Findings

### Confirmed architecture

The public repo currently exposes the four backend projects and PostgreSQL/EF foundation. citeturn682536view1

Current `Program.cs` uses:

- JSON string enum serialization;
- ProblemDetails;
- JWT;
- role policies;
- minimal API groups;
- common paging bounds;
- OpenAPI metadata. citeturn651051view0turn973920view0

The public `develop` also contains Orders/Kitchen integration and KitchenHub, confirming prior Sprint 1 work is present in at least the current API view. citeturn881853view0turn916177view6

### Repository-cache inconsistency

The public DbContext/migration listings appear older than the Order-enabled API and Order folders.

Therefore local APPLY MUST:

- inspect actual DbSets/configuration;
- inspect migrations;
- run `dotnet ef migrations list`;
- inspect current snapshot;
- not trust public file-tree freshness.

This is a technical preflight, not a human decision.

### Product model

Current visible Product already provides the exact Inventory relationships needed:

- ProductId;
- InventoryUnitId;
- ProductType;
- MinStock;
- IsActive. citeturn557703view0turn557703view1

Inventory MUST not duplicate Product state.

## Boundaries Respected

### Inventory vs Product

Inventory owns:

- current balance;
- movement ledger.

Catalog owns:

- Product lifecycle;
- InventoryUnit;
- MinStock;
- ProductType.

Inventory MUST NOT edit Product.MinStock.

### Inventory vs future business processes

Inventory internal writer MAY be reused by future Sale/Purchase/Production.

HU-005 API exposes only manual ENTRY/WRITE_OFF.

### Expenses vs Cash

Expenses owns:

- expense registration;
- classification by CashSource.

Cash/Shift modules own:

- actual money ledger;
- cash session;
- shift lifecycle;
- closing.

Expense MUST NOT mutate cash.

### Expenses vs HU-021

HU-020 owns create.

HU-021 owns history/query.

### Audit identity

UserId is audit actor.

EmployeeId is not used as expense/inventory actor.

## Contracts Changed

### New REST surface

Expected:

- `GET /api/v1/inventory/balances`
- `GET /api/v1/inventory/movements`
- `POST /api/v1/inventory/movements`
- `GET /api/v1/expense-categories`
- `POST /api/v1/expenses`

Exact casing/group construction MUST follow actual `/api/v1` conventions.

### New Domain contracts

Inventory:

- InventoryMovementType.
- inventory reference/origin representation with MANUAL.
- InventoryBalance.
- InventoryMovement.

Expenses:

- CashSource.
- ExpenseCategory.
- Expense.

Do not create duplicate enums if already present locally.

## Inventory Domain Design

### InventoryBalance

Minimal aggregate projection:

- ProductId.
- Quantity.
- UpdatedAt.

ProductId SHOULD serve as PK or unique natural key according to canonical model.

No independent business ID is needed if ProductId is PK.

### InventoryMovement

Transaction row:

- Guid Id.
- ProductId.
- MovementType.
- signed QuantityDelta.
- Reason nullable at Domain persistence level to permit future system movements if needed.
- ReferenceType.
- ReferenceId.
- CreatedAt.
- CreatedByUserId.

Manual use case requires Reason; the database schema does not need to impose a universal non-null human reason on future automated movements.

## Inventory Reusable Write Boundary

Recommended conceptual layering:

### Manual use case

`RecordManualMovement`

Responsibilities:

- authorize externally through policy;
- validate manual type;
- validate positive quantity;
- require reason;
- validate Product active;
- translate type + quantity into signed delta;
- set reference MANUAL/null;
- call internal writer.

### Internal writer

Conceptual operation:

- ProductId;
- MovementType;
- signed non-zero QuantityDelta;
- optional Reason;
- ReferenceType;
- ReferenceId;
- ActorUserId;
- timestamp from server.

Responsibilities:

- atomic ledger+balance transaction;
- balance row creation;
- locking;
- persistence.

Future callers MUST NOT be implemented now.

## Inventory Transaction Design

### Existing balance

Flow:

- begin transaction;
- load/validate Product state as required;
- select InventoryBalance `FOR UPDATE`;
- reread authoritative quantity;
- calculate:
  `newQuantity = current + delta`;
- insert InventoryMovement;
- update quantity/UpdatedAt;
- save;
- commit.

### First balance

Flow:

- begin transaction;
- ensure Product remains valid;
- upsert InventoryBalance(ProductId,0) using PostgreSQL conflict-safe primitive;
- acquire row lock;
- reread quantity;
- apply delta;
- insert movement;
- update balance;
- save;
- commit.

### Isolation

A normal PostgreSQL transaction + row-level lock is preferred.

Do not add distributed/process lock.

Do not require frontend concurrency tokens.

### Product race

Product validation SHOULD occur within or immediately before the same transaction, but Product active state MUST be revalidated inside the write boundary before committing if a concurrent Product deactivation can otherwise permit a stale write.

The InventoryBalance row is the serialization resource for stock quantity.

## Inventory SQL/EF Boundary

Application MUST not depend on Npgsql SQL syntax.

Infrastructure MAY encapsulate targeted PostgreSQL-specific operations:

- insert-on-conflict;
- `FOR UPDATE`.

Avoid a generic repository abstraction if the current repo does not use one; use the smallest lock-aware persistence abstraction consistent with existing architecture.

## Inventory Read Design

### Balance query

Root query is Product, not InventoryBalance.

Conceptually:

- Product
- LEFT JOIN InventoryBalance
- JOIN InventoryUnit
- apply active/search/productType
- order/paginate
- project.

This guarantees zero-balance Products are visible.

### Low-stock expression

Projected expression:

- `currentQuantity = balance?.Quantity ?? 0`
- `isLowStock = minStock.HasValue && currentQuantity <= minStock.Value`

No persistence.

### History query

Root:

InventoryMovement.

Join/project:

- Product;
- Unit;
- Identity/Employee display when required.

Filter:

- product;
- type;
- createdAt date interval.

No Product active filter.

## Inventory Concurrency Outcomes

### First balance + first balance

Both operations:

- share ProductId;
- one initial row survives unique constraint;
- both subsequently lock same row;
- both movements commit sequentially.

Expected:

- 1 InventoryBalance;
- 2 InventoryMovements;
- exact algebraic result.

### ENTRY + ENTRY

Commutative final result.

### ENTRY + WRITE_OFF

Commutative algebraic result.

### WRITE_OFF + WRITE_OFF

Both valid even if final quantity negative.

### Deadlock policy

Only one InventoryBalance row is locked per manual operation, so the expected flow has no multi-row lock-ordering problem.

Future bulk/multi-product operations MUST define a deterministic ProductId lock order, but that is out of scope now.

## Inventory Database Design

Canonical new storage SHOULD follow the logical baseline:

### inventory_balances

- product_id UUID PK/FK
- quantity numeric(14,4) NOT NULL
- updated_at timestamptz NOT NULL

No nonnegative CHECK.

### inventory_movements

- id UUID PK
- product_id UUID NOT NULL
- movement_type bounded enum/string + CHECK
- quantity_delta numeric(14,4) NOT NULL
- reason varchar(500) nullable at storage layer
- reference_type bounded origin/string nullable/required according to final model
- reference_id UUID nullable
- created_at timestamptz NOT NULL
- created_by_user_id Identity-compatible FK/type

CHECK:

- quantity_delta <> 0.

Indexes:

- unique balance ProductId;
- movement ProductId;
- movement CreatedAt;
- optional compound `(product_id, created_at)` preferred if it efficiently serves history.

MovementType index SHOULD only be added if query plan/test data justifies it; do not index blindly.

Delete behavior:

- Product → Balance: RESTRICT/NO ACTION or current non-destructive convention.
- Product → Movement: RESTRICT.
- User → Movement: RESTRICT.

No historical cascade deletion.

## Expense Domain Design

### ExpenseCategory

Canonical:

- Id Guid.
- Name string max100.
- IsActive bool.
- CreatedAt timestamp.

Name logical uniqueness SHOULD be represented according to the existing model if schema is newly created.

No create/update/delete use cases.

### Expense

Canonical:

- Id Guid.
- ShiftId Guid? .
- ExpenseCategoryId Guid? .
- Amount decimal.
- CashSource enum.
- Description string.
- ExpenseDate DateOnly.
- CreatedAt DateTimeOffset.
- CreatedByUserId string/Identity type.

Use the real Identity key type in the repository, even if historical documentation wrote UUID.

Do not change Identity key strategy.

## Expense Shift Design

### Resolver exists

Use a small Application-facing abstraction equivalent to:

- resolve current operational Shift;
- no request input.

### Entity without resolver

Store null.

### No Shift entity

Store nullable scalar ShiftId if desired by the model evolution, but do not create invalid FK.

When HU-025 later materializes Shift, its migration may attach the FK.

This preserves the data shape without implementing lifecycle.

## Expense Business Date Design

Prefer an Application abstraction that is easily testable.

Conceptually:

- `UtcNow`
- `CurrentBusinessDate`

Implementation uses:

- TimeProvider or existing project clock;
- explicit configured business timezone.

This makes tests for future-date deterministic.

No direct `DateTime.Now` scattered through handlers.

## Expense Category Read Design

Simple active list:

- IsActive == true.
- Name ASC.
- Id tie-break.

No seed required.

No pagination unless current architecture later mandates it.

## Expense Persistence Design

Transaction complexity is low:

- validate request;
- resolve Category if supplied;
- resolve Shift if a real resolver exists;
- set actor;
- set CreatedAt;
- insert Expense;
- commit.

No cash mutation in transaction.

No Inventory integration.

## Error Mapping Design

Use existing ProblemDetails style.

Inventory recommended internal error outcomes:

- NotFoundProduct.
- ProductInactive.
- InvalidManualType.
- Validation.

Expense:

- CategoryNotFound.
- CategoryInactive.
- FutureDate.
- Validation.

API layer maps them; it must not contain business calculations.

No raw database exception should become `500` details visible to client.

Expected constraint races should be translated where relevant; unexpected infrastructure failures remain generic 500 through existing exception handling.

## Authorization Design

Prefer dedicated semantic policies rather than reusing unrelated Catalog policies if doing so would accidentally grant wrong rights.

Semantics:

- InventoryRead:
  ADMIN/ENCARGADO/MESERO/COCINA/CONTADORA.
- InventoryManage:
  ADMIN/ENCARGADO.
- InventoryHistory:
  ADMIN/ENCARGADO.
- ExpenseWrite:
  ADMIN/ENCARGADO.
- ExpenseCategoryRead:
  ADMIN/ENCARGADO.

Exact PolicyNames MAY match current naming convention.

## OpenAPI Design

Every endpoint MUST have explicit:

- success type;
- validation response;
- 401;
- 403;
- relevant 404;
- relevant 409.

Enums MUST serialize consistently with the existing global `JsonStringEnumConverter`. The current API already configures string enums globally. citeturn651051view0

No manual Swagger-only DTO that diverges from runtime DTO.

## Required Tests Per Layer

### Domain/Application — Inventory

Useful pure tests:

- manual type whitelist;
- quantity → signed delta;
- reason validation;
- low-stock expression where implemented as reusable policy;
- Product active validation outcome.

### PostgreSQL Integration — Inventory

Mandatory:

- zero implicit balance.
- manual ENTRY.
- manual WRITE_OFF.
- negative result.
- first balance concurrency.
- ENTRY+ENTRY.
- ENTRY+WRITE_OFF.
- WRITE_OFF+WRITE_OFF.
- unique Product balance.
- quantityDelta <>0 DB constraint.
- valid/invalid movement type constraint where applicable.
- FK behavior.
- transaction atomicity.

### API authorization — Inventory

- anonymous 401.
- five read roles 200 balances.
- Employee-only 403.
- history ADMIN/ENCARGADO 200.
- other role-only 403.
- mutation ADMIN/ENCARGADO allowed.
- others 403.

### Inventory History

- filters.
- newest-first.
- inactive Product.
- actor.
- reference.
- date range.

### Expense Application/API

- ADMIN create.
- ENCARGADO create.
- role denials.
- multi-role union.
- today.
- past.
- future.
- amount.
- cashSource.
- description.
- null category.
- active category.
- missing category.
- inactive category.
- actor.
- CreatedAt.
- Shift branch.
- no cash side effect.
- duplicate expense semantics.

### ExpenseCategory

- only active.
- sorted.
- auth.
- no CRUD routes.

## Migration Design

Prefer one coherent migration for this single change after both data models are stabilized.

It MAY include both independent capability schemas because they ship together, but the generated operations should remain logically grouped.

Migration MUST NOT:

- recreate Product;
- rewrite Orders;
- reset Identity;
- edit old migrations;
- add fake Shift;
- seed arbitrary Expenses/Categories.

Before generation:

- local migration list and snapshot MUST be captured.

After generation:

- inspect migration;
- inspect snapshot;
- apply full chain on disposable clean PostgreSQL;
- apply from current develop baseline;
- exercise constraints.

## Documentation / Handoff Design

HU-005 MUST record:

- endpoints;
- roles;
- manual types;
- negative-stock rule;
- zero implicit balance;
- low-stock derivation;
- transaction/locking;
- reusable write boundary;
- tests;
- actual migration;
- frontend pending.

HU-020 MUST record:

- endpoint;
- category helper endpoint;
- roles;
- validations;
- Shift branch actually used;
- no cash mutation;
- HU-021 excluded;
- tests;
- frontend pending.

Backend handoff MUST include:

| Capability | Method | Route | Roles | Request | Response | Application area | Notes |
| ---------- | ------ | ----- | ----- | ------- | -------- | ---------------- | ----- |

Complete final file manifest MUST group:

- Domain
- Application
- Infrastructure
- Migrations
- Api
- Tests
- Docs/OpenSpec

Frontend MUST state:

`UNCHANGED`

## Tradeoffs Accepted

- Materialized balance + immutable ledger instead of calculating balance from full history each read.
- PostgreSQL row locking instead of process locks.
- Upsert-zero first balance instead of Product backfill.
- Negative balances instead of rejecting insufficient stock.
- Low-stock derived at query time instead of persisted.
- Manual movement API limited to ENTRY/WRITE_OFF while Domain supports future movement types.
- No movement reversal workflow.
- No idempotency key for Expense.
- No Expense list/HU-021.
- No cash side effect.
- Nullable Shift strategy until real lifecycle exists.
- Simple ExpenseCategory list.
- No SignalR.

## Implementation Constraints

- No frontend changes.
- No `api:generate`.
- No SignalR.
- No historical migration edits.
- No DB reset history.
- No fake Shift.
- No Category seed invention.
- No Product-wide refactor.
- No MinStock editing.
- No balance >=0 constraint.
- No manual signed delta input.
- No actor/reference spoofing.
- No movement edit/delete.
- No Expense history.
- No Expense edit/delete.
- No cash writes.
- Concurrency evidence must use PostgreSQL real.
- Normal technical failures must be fixed, not escalated.

## Open Design Questions

No human product decision remains open.

The future local explore MUST resolve these repository facts before implementation:

1. exact HEAD of `develop`;
2. exact current migrations/snapshot;
3. whether InventoryBalance/Movement already exist partially;
4. whether Expense/ExpenseCategory already exist partially;
5. whether Shift now exists;
6. whether a real active-Shift resolver exists;
7. whether a reusable clock/business-time abstraction already exists;
8. exact PostgreSQL integration fixture;
9. exact DI/configuration organization after Orders/Kitchen integration;
10. exact current naming for policy/error result patterns.

These are repository adaptation questions, not PRODUCT_DECISION_REQUIRED.
