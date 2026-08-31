# Design

## Components Touched

## Baseline Audit Findings

### Repository / architecture

La snapshot pública actual de `develop` confirma:

- `RestaurantSystem.Api`
- `RestaurantSystem.Application`
- `RestaurantSystem.Domain`
- `RestaurantSystem.Infrastructure`

y test projects:

- `RestaurantSystem.Domain.Tests`
- `RestaurantSystem.Application.Tests`
- `RestaurantSystem.IntegrationTests`. citeturn544053view1turn544053view2

Backend README confirma:

- .NET 10;
- PostgreSQL;
- migration vía EF Core;
- API dev `http://localhost:5057`;
- OpenAPI `/openapi/v1.json`;
- Swagger;
- restore/build/test commands. citeturn544053view0

Future APPLY MUST revalidate all of this locally.

### Existing inventory foundation

Confirmed public files:

`backend/src/RestaurantSystem.Domain/Inventory/InventoryEntities.cs`

`backend/src/RestaurantSystem.Application/Inventory/InventoryContracts.cs`

The existing contract already models exactly the future movement families Sprint 2 needs and a polymorphic reference. This is a strong signal to **EXTEND**, not replace. citeturn293447view0turn293447view1

### Existing Product/Unit foundation

Confirmed public file:

`backend/src/RestaurantSystem.Domain/Catalog/CatalogEntities.cs`

Relevant reusable fields:

- ProductType;
- InventoryUnitId;
- Unit.Dimension;
- Unit.FactorToBase;
- Product.MinStock;
- IsSellable;
- IsActive. citeturn293447view2

### Existing Order foundation

Confirmed public file:

`backend/src/RestaurantSystem.Domain/Orders/OrderEntities.cs`

Relevant reusable fields:

- OrderStatus.ENTREGADO;
- ShiftId nullable;
- OrderItem.ProductId;
- OrderItem.Quantity;
- OrderItem.UnitPrice snapshot. citeturn293447view3

### Existing Expense foundation

Confirmed public file:

`backend/src/RestaurantSystem.Domain/Expenses/ExpenseEntities.cs`

Current public implementation lacks ShiftId. citeturn293447view4

### Canonical data model foundations

Current data model already specifies:

- `product_compositions`;
- `productions`;
- `production_consumptions`;
- `cash_sessions`;
- `shifts`;
- `shift_assignments`;
- `sales`;
- `sale_items`;
- `purchases`;
- `purchase_items`;
- `purchase_receipts`. citeturn751423view0turn180988view0turn180988view2

This indicates a large portion of Sprint 2 is **planned schema materialization**, not greenfield domain invention.

## Boundaries Respected

- Domain logic MUST remain separated by capability.
- No `Sprint2Service` or `RestaurantService` god service.
- Inventory is a shared domain service/boundary, not duplicated state.
- Composition owns recipe definition, not inventory mutation.
- Production owns production transaction, consuming the shared inventory boundary.
- Sales owns sale transaction, consuming Orders, Shift and Inventory.
- Purchases owns Purchase lifecycle; reception consumes Inventory.
- Shifts owns operational continuity; it does not own final closing.
- Expenses remains its own capability and only gains server-resolved Shift association.
- API handlers MUST stay thin.
- PostgreSQL is concurrency authority.
- Frontend concerns do not enter backend layers.

## Recommended SDD Decomposition

One change, focused specs:

- `specs/inventory-transaction-authority/spec.md`
- `specs/product-composition/spec.md`
- `specs/low-stock-configuration/spec.md`
- `specs/production-registration/spec.md`
- `specs/shift-operations/spec.md`
- `specs/sales-confirmation/spec.md`
- `specs/sale-stock-shortage/spec.md`
- `specs/purchase-registration/spec.md`
- `specs/purchase-reception/spec.md`
- `specs/sprint-2-backend-delivery-contract/spec.md`

Exact names MAY adapt to OpenSpec convention.

## Dependency Graph

- Sprint 1 HU-003 Catalog
  → HU-004 Composition
  → HU-007 Production

- Sprint 1 HU-005 Inventory
  → HU-006 Low Stock
  → HU-007 Production
  → HU-012/HU-013 Sale
  → HU-018 Reception

- Sprint 1 HU-009 Orders
  → HU-012 Sale
  → HU-013 Stock override

- Sprint 1 HU-016 Suppliers
  → HU-017 Purchase
  → HU-018 Reception
  → Inventory

- HU-025 Shift foundation
  → HU-012 Sale

- Sprint 1 HU-020 Expense
  → HU-025 Shift association

This is broadly consistent with the official Sprint 2 dependency plan. fileciteturn15file0

## Recommended Backend Implementation Order

1. local baseline + visual/doc/OpenSpec audit;
2. resolve composition scaling blocker;
3. inventory transaction/batch foundation;
4. unit conversion reusable service/helper if not already present;
5. HU-004 composition;
6. HU-006 low-stock configuration/filter;
7. HU-007 production;
8. HU-025 foundation:
   - CashSession;
   - Shift;
   - assignments;
   - operational clock/resolver;
9. HU-012 sale core;
10. HU-013 shortage acknowledgment;
11. HU-017 purchase;
12. HU-018 receipt;
13. Expense→Shift integration;
14. cross-HU concurrency;
15. migrations/OpenAPI;
16. full regression;
17. eight HU documentation updates.

Shift foundation precedes Sale because Sale must persist a real Shift.

Full HU-025 may be completed after the first Sale foundation exists if that provides cleaner integration tests, but its core resolver must exist before Sale.

## Gap Analysis

### HU-004 — Composition

| Aspect               | Analysis                                                |
| -------------------- | ------------------------------------------------------- |
| CURRENT FOUNDATION   | Product, ProductType, Unit, UnitDimension, FactorToBase |
| MISSING BACKEND      | ProductComposition persistence/application/API          |
| REUSE                | Catalog Products/Units                                  |
| NEW DOMAIN/API WORK  | composition rows + get/replace contract                 |
| MIGRATION IMPACT     | new composition table if not already materialized       |
| AUTHORIZATION        | ADMIN/ENCARGADO manage                                  |
| TRANSACTION NEEDS    | atomic full replacement                                 |
| TEST NEEDS           | product/unit/duplicate/inactive/conversion              |
| OPENAPI IMPACT       | composition DTO/request                                 |
| DOCUMENTATION IMPACT | HU-004                                                  |
| PRIMARY RISK         | missing scaling denominator for HU-007                  |

Canonical model already specifies `product_compositions`, quantity >0, unique parent/component and compatible units. citeturn751423view0

### HU-006 — Low Stock

| Aspect               | Analysis                                                |
| -------------------- | ------------------------------------------------------- |
| CURRENT FOUNDATION   | Product.MinStock; BalanceDto.MinStock/IsLowStock        |
| MISSING BACKEND      | configuration endpoint; optional server lowStock filter |
| REUSE                | Product + InventoryBalance query                        |
| NEW DOMAIN/API WORK  | minimal Product min-stock mutation                      |
| MIGRATION IMPACT     | likely none if local MinStock already exists            |
| AUTHORIZATION        | ADMIN/ENCARGADO configure; COCINA read                  |
| TRANSACTION NEEDS    | ordinary update                                         |
| TEST NEEDS           | equality, negative, null, permissions                   |
| OPENAPI IMPACT       | additive endpoint/filter                                |
| DOCUMENTATION IMPACT | HU-006                                                  |
| PRIMARY RISK         | accidental persistent alert subsystem                   |

This capability is mostly EXTEND rather than CREATE.

### HU-007 — Production

| Aspect               | Analysis                                                             |
| -------------------- | -------------------------------------------------------------------- |
| CURRENT FOUNDATION   | Composition target model docs; Inventory writer/types; Product/Unit  |
| MISSING BACKEND      | Production/Consumption entities, orchestration, preview, transaction |
| REUSE                | Inventory/Unit conversion/Product                                    |
| NEW DOMAIN/API WORK  | Production create + requirements/read calculation                    |
| MIGRATION IMPACT     | productions + production_consumptions                                |
| AUTHORIZATION        | COCINA/ENCARGADO/ADMIN                                               |
| TRANSACTION NEEDS    | critical multi-stock transaction                                     |
| TEST NEEDS           | shortage hard block, atomicity, conversion, race                     |
| OPENAPI IMPACT       | requirement DTO + Production DTO                                     |
| DOCUMENTATION IMPACT | HU-007                                                               |
| PRIMARY RISK         | scaling rule + concurrency                                           |

Canonical model explicitly expects production + consumption snapshots + movements/balances atomically. citeturn751423view0

### HU-012 — Sale

| Aspect               | Analysis                                                |
| -------------------- | ------------------------------------------------------- |
| CURRENT FOUNDATION   | Order/OrderItem/ENTREGADO/price snapshots; Inventory    |
| MISSING BACKEND      | Sale/SaleItem, shift resolution, confirm service/API    |
| REUSE                | Order snapshots, Inventory writer                       |
| NEW DOMAIN/API WORK  | Sale transaction                                        |
| MIGRATION IMPACT     | sales + sale_items; additive order relation             |
| AUTHORIZATION        | MESERO/ENCARGADO/ADMIN                                  |
| TRANSACTION NEEDS    | critical                                                |
| TEST NEEDS           | delivered gate, unique order, pricing, shift, inventory |
| OPENAPI IMPACT       | ConfirmSale/SaleDto                                     |
| DOCUMENTATION IMPACT | HU-012                                                  |
| PRIMARY RISK         | duplicate sale / shift race                             |

Canonical model already defines one Sale per Order and SaleItem financial snapshots. citeturn180988view0

### HU-013 — Insufficient Sale Stock

| Aspect               | Analysis                                          |
| -------------------- | ------------------------------------------------- |
| CURRENT FOUNDATION   | negative Inventory supported; RN-005              |
| MISSING BACKEND      | structured shortage + acknowledgment contract     |
| REUSE                | Sale transaction + inventory lock                 |
| NEW DOMAIN/API WORK  | conflict DTO/ProblemDetails extension             |
| MIGRATION IMPACT     | none beyond Sale                                  |
| AUTHORIZATION        | same as Sale                                      |
| TRANSACTION NEEDS    | same confirmation transaction                     |
| TEST NEEDS           | no-write conflict, recalculation, negative result |
| OPENAPI IMPACT       | typed 409                                         |
| DOCUMENTATION IMPACT | HU-013                                            |
| PRIMARY RISK         | stale client shortage                             |

### HU-017 — Purchase

| Aspect               | Analysis                                             |
| -------------------- | ---------------------------------------------------- |
| CURRENT FOUNDATION   | Supplier, Product, Unit, Inventory types             |
| MISSING BACKEND      | Purchase/PurchaseItem lifecycle/API                  |
| REUSE                | Supplier/Catalog/Unit                                |
| NEW DOMAIN/API WORK  | multiline Purchase, scope auth, cancel               |
| MIGRATION IMPACT     | purchases + purchase_items                           |
| AUTHORIZATION        | ADMIN global, ENCARGADO scoped, COCINA kitchen scope |
| TRANSACTION NEEDS    | create/cancel                                        |
| TEST NEEDS           | scope, totals, receipt ref, no inventory             |
| OPENAPI IMPACT       | create/detail/pending list/cancel                    |
| DOCUMENTATION IMPACT | HU-017                                               |
| PRIMARY RISK         | artificial purchase scope / mixed lines              |

### HU-018 — Purchase Reception

| Aspect               | Analysis                                        |
| -------------------- | ----------------------------------------------- |
| CURRENT FOUNDATION   | Purchase model docs; Inventory writer           |
| MISSING BACKEND      | definitive receipt + actual per-line quantities |
| REUSE                | Purchase + Inventory                            |
| NEW DOMAIN/API WORK  | receipt line snapshot + receive transaction     |
| MIGRATION IMPACT     | receipt + likely receipt line table             |
| AUTHORIZATION        | scope-aware authorized actors                   |
| TRANSACTION NEEDS    | critical                                        |
| TEST NEEDS           | actual qty, incomplete, double receive, race    |
| OPENAPI IMPACT       | ReceivePurchaseRequest                          |
| DOCUMENTATION IMPACT | HU-018                                          |
| PRIMARY RISK         | overwriting ordered quantity / double receive   |

The canonical model has one definitive receipt but no per-line actual quantity; frozen requirement therefore justifies an additional receipt-line representation if the local implementation remains equivalent. citeturn180988view2

### HU-025 — Shifts

| Aspect               | Analysis                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------- |
| CURRENT FOUNDATION   | canonical CashSession/Shift model; Expense no Shift in public code; Order nullable Shift |
| MISSING BACKEND      | domain/app/API/runtime resolver, assignments/handover                                    |
| REUSE                | User/Employee, business clock if present                                                 |
| NEW DOMAIN/API WORK  | CashSession/Shift/Assignment operations                                                  |
| MIGRATION IMPACT     | shift tables; nullable Expense ShiftId; relations                                        |
| AUTHORIZATION        | ADMIN/ENCARGADO manage; MESERO own operation                                             |
| TRANSACTION NEEDS    | open/handover                                                                            |
| TEST NEEDS           | unique business date, transitions, concurrent handover                                   |
| OPENAPI IMPACT       | shift current/open/assignment/handover                                                   |
| DOCUMENTATION IMPACT | HU-025                                                                                   |
| PRIMARY RISK         | expanding into cash closing / breaking Expense                                           |

## Cross-HU Domain Design

### Shared Unit Conversion

Create only if an equivalent reusable service does not already exist.

Responsibilities:

- resolve Unit;
- reject inactive/unknown Unit where appropriate;
- reject dimension mismatch;
- convert using FactorToBase.

It MUST not:

- know Production;
- know Purchases;
- know Inventory transaction semantics.

### Shared Inventory Transaction Boundary

This is the most important cross-HU service.

Responsibilities:

- ensure/load Balance rows;
- lock Balance rows deterministically;
- obtain current quantities;
- evaluate shortage policy;
- append movements;
- apply deltas;
- preserve reference/actor/time;
- participate in caller transaction.

It SHOULD accept server-computed commands rather than public API requests.

It MUST not:

- create Sale/Production/Purchase itself;
- own business aggregate state transitions.

### Operational Clock

Reuse current clock if present.

Responsibilities:

- UTC timestamp;
- Bolivia business date.

Do not duplicate timezone conversion in Shifts/Expenses/Sales.

### Shift Resolver

Responsibilities:

- resolve active Shift for current business date;
- optionally validate actor's assignment when business flow requires it;
- lock/serialize operational Shift for Sale when needed.

It MUST not trust client ShiftId.

## Data Model Plan

### ProductComposition

Purpose:
recipe definition.

Fields aligned with canonical model:

- Id;
- ParentProductId;
- ComponentProductId;
- Quantity;
- UnitId;
- audit fields.

Constraints:

- quantity >0;
- parent != component;
- unique parent/component;
- FK RESTRICT;
- unit compatibility application-level.

Index:

- parent_product_id.

### Production

Purpose:
historical production event.

Fields:

- Id;
- ProductId;
- QuantityProduced;
- ResponsibleEmployeeId;
- ProducedAt;
- Notes?;
- CreatedAt;
- CreatedByUserId.

Constraints:

- quantity >0.

Indexes:

- ProductId + ProducedAt.

### ProductionConsumption

Purpose:
snapshot actual component consumption.

Fields:

- Id;
- ProductionId;
- ComponentProductId;
- QuantityConsumed in component Product's InventoryUnit;
- CreatedAt.

Recommended unique:

- `(ProductionId, ComponentProductId)` if components are consolidated.

### Sale

Purpose:
financial/operational confirmation of delivered Order.

Fields:

- Id;
- OrderId;
- ShiftId;
- SalesChannel;
- PaymentMethod;
- Subtotal;
- Total;
- ConfirmedAt;
- ConfirmedByUserId;
- CreatedAt.

No CustomerId in this Sprint 2 implementation despite broader model roadmap; HU-014 remains separate.

Constraints:

- OrderId UNIQUE;
- totals >=0;
- valid enum checks.

### SaleItem

Snapshot:

- Id;
- SaleId;
- OrderItemId;
- ProductId;
- Quantity;
- UnitPrice;
- LineTotal.

Unique `(SaleId, OrderItemId)` SHOULD be considered.

### Purchase

Fields:

- Id;
- SupplierId;
- status;
- purchaseDate;
- server-derived total;
- receiptReference?;
- notes?;
- audit/cancel fields.

If local schema retains `PurchaseArea`:

- keep it internal/server-derived;
- client does not control it.

### PurchaseItem

Ordered snapshot:

- Id;
- PurchaseId;
- ProductId;
- Quantity;
- UnitId;
- UnitCost;
- LineTotal.

Consider unique `(PurchaseId, ProductId, UnitId)` only if business/UI will consolidate identical Products; otherwise do not impose an unsupported uniqueness rule.

### PurchaseReceipt

One definitive receipt:

- Id;
- PurchaseId UNIQUE;
- ReceivedAt;
- ReceivedByUserId;
- Notes?;
- CreatedAt.

### PurchaseReceiptLine

Recommended minimal addition to satisfy actual-vs-ordered requirement:

- Id;
- PurchaseReceiptId;
- PurchaseItemId;
- ReceivedQuantity;
- UnitId if receipt verification may use a compatible Unit distinct from PurchaseItem.UnitId;
- CreatedAt.

Constraints:

- ReceivedQuantity >0;
- unique PurchaseItemId within definitive receipt;
- all PurchaseItems must be represented before commit.

If local implementation already solved this with a different equivalent snapshot, REUSE it instead.

### CashSession

Use canonical model if not already implemented.

- one `business_date`;
- shared opening amounts;
- OPEN/CLOSED;
- opened audit.

This change uses OPEN; final CLOSED belongs to later cash closing unless HU-025 local contract explicitly ends session without reconciliation.

### Shift

Use fixed two types from current model if still valid.

- CashSessionId;
- ShiftType;
- Status;
- StartedAt?;
- EndedAt?;
- handover fields.

Do not persist mockup hours.

### ShiftAssignment

- ShiftId;
- EmployeeId;
- AssignedAt;
- AssignedByUserId.

Unique pair.

### Expense Extension

Add nullable `ShiftId` to persisted model for compatibility.

New records SHOULD associate current Shift server-side when available.

Historical null remains valid.

## Inventory Mutation Strategy

### Production

- build exact negative commands for each component;
- positive command for target Product;
- policy: `MUST_REMAIN_NON_NEGATIVE`;
- acquire all balance locks before any mutation;
- if any shortage:
  - return conflict;
  - zero writes.

### Sale

- build one negative command per consolidated OrderItem Product;
- policy:
  - no ack → report shortages, zero writes;
  - ack → ALLOW_NEGATIVE after recheck.
- reference every command to Sale.

### Purchase Reception

- convert received quantities to Product InventoryUnit;
- positive commands only;
- reference to Purchase.

### Manual HU-005

Existing API continues to call the same inventory foundation for ENTRY/WRITE_OFF.

## Inventory Traceability Strategy

`InventoryMovement.ReferenceType/ReferenceId` already provides the exact generic facility required by Sprint 2. citeturn293447view0

Do not add:

- ProductionMovement table;
- SaleMovement table;
- PurchaseStockHistory table.

Domain queries can reconstruct source through:

- movement type;
- reference type;
- reference id.

Referential consistency remains Application/test controlled because the reference is polymorphic.

## Transaction Boundaries

### Composition replacement

One transaction:

- validate all new components;
- delete/replace old child rows;
- add new rows;
- commit.

### Production

One transaction encompassing:

- production aggregate;
- consumption snapshots;
- all inventory movements;
- all balances.

### Sale

One transaction encompassing:

- Shift resolution lock;
- Order lock/revalidation;
- duplicate sale check;
- Sale;
- SaleItems;
- shortage evaluation;
- inventory movements;
- balances.

### Purchase create

One transaction:

- Purchase;
- all PurchaseItems;
- total.

No inventory.

### Purchase cancel

One transaction:

- lock Purchase;
- validate state/scope;
- cancel audit.

### Purchase receive

One transaction:

- lock Purchase;
- validate receipt;
- receipt rows;
- all inventory movements;
- all balances;
- state transition.

### Shift handover

One transaction:

- lock CashSession;
- source/destination Shifts;
- handover values;
- source complete;
- destination active.

## Concurrency

PostgreSQL integration tests MUST prove representative concurrency.

### Inventory rows

Lock by ascending ProductId to avoid cross-flow inversion.

### Sale duplicate

Order lock + unique DB constraint.

### Sale vs stock mutation

Balances locked in deterministic order.

### Sale vs handover

Shift/CashSession resolver must serialize active Shift assignment.

### Purchase receive/cancel

Purchase row is common lock root.

### Shift handover

CashSession is common root.

No Redis/distributed lock.

## Idempotency

### PUT composition/minimum stock

Idempotent target-state semantics.

### Production POST

Not idempotent: two legitimate production events may be identical in values.

UI/future frontend must prevent double submit; network duplicate creates separate Production unless future Idempotency-Key is explicitly added.

### Sale confirmation

Business uniqueness prevents duplicate Sale; repeated confirmation gets existing-sale conflict.

### Purchase create

Two requests create two Purchases.

### Purchase cancel

Repeat on CANCELADA MAY return current state but MUST not rewrite original cancellation metadata.

### Purchase receive

Second receive is conflict.

### Shift handover

Second transition is conflict or stable no-op response if current API convention prefers state-target idempotency; MUST never duplicate handover audit.

## Error/ProblemDetails Contract

Recommended stable codes, only if current error model supports codes:

- `INVALID_UNIT_CONVERSION`
- `PRODUCTION_STOCK_INSUFFICIENT`
- `ORDER_NOT_DELIVERED`
- `SALE_ALREADY_CONFIRMED`
- `SALE_STOCK_CONFIRMATION_REQUIRED`
- `PURCHASE_NOT_PENDING`
- `PURCHASE_ALREADY_RECEIVED`
- `PURCHASE_SCOPE_FORBIDDEN`
- `RECEIPT_INCOMPLETE`
- `NO_ACTIVE_SHIFT`
- `INVALID_SHIFT_TRANSITION`

Do not introduce a parallel envelope solely to carry these codes.

## OpenAPI Strategy

The backend APPLY must boot the API and inspect actual generated:

`/openapi/v1.json`

The backend README currently documents this dev endpoint. citeturn544053view0

OpenAPI validation MUST verify:

- routes present;
- enum values;
- nullable fields;
- ProblemDetails;
- typed shortage details;
- 401/403/404/409;
- paging shape reuse;
- no accidental Sprint 1 contract removals.

No TypeScript generation during this change.

## Migration Plan

Expected migration work if no Sprint 2 schema exists:

- product_compositions;
- productions;
- production_consumptions;
- cash_sessions;
- shifts;
- shift_assignments;
- sales;
- sale_items;
- purchases;
- purchase_items;
- purchase_receipts;
- purchase_receipt_lines;
- nullable expenses.shift_id;
- supporting FKs/checks/indexes.

Existing Products.MinStock/Inventory tables MUST NOT be recreated.

Potential DB constraints:

- ProductComposition quantity >0.
- ProductComposition parent != component.
- unique parent/component.
- Production quantity >0.
- Sale OrderId UNIQUE.
- Sale monetary >=0.
- Purchase valid status.
- PurchaseItem quantity >0.
- PurchaseItem unitCost >=0.
- PurchaseReceipt PurchaseId UNIQUE.
- PurchaseReceiptLine receivedQuantity >0.
- CashSession businessDate UNIQUE.
- Shift unique cashSession/type.
- ShiftAssignment unique shift/employee.
- valid enum CHECKs.
- no DELETE cascade over historical transactions.

## Backward Compatibility

### Sprint 1 Inventory

Manual routes and DTOs must survive.

HU-006 SHOULD reuse/extend existing balance output instead of replacing it.

### Sprint 1 Orders

Existing create/read/kitchen/cancel routes remain.

An additive `saleId?` or equivalent sale indicator MAY be added to OrderDto if the future frontend needs persisted Sale state after reload.

Do not make ShiftId required in current Order create request.

### Sprint 1 Expenses

Keep current CreateExpenseRequest shape.

Shift association is server-side.

### Sprint 1 Suppliers/Catalog/Auth

No breaking changes.

## Documentation/HU Update Strategy

After code/tests/OpenAPI are stable, create or update only these execution history files:

- HU-004.
- HU-006.
- HU-007.
- HU-012.
- HU-013.
- HU-017.
- HU-018.
- HU-025.

The current `docs/historias/` public tree contains Sprint 1 execution files and documents the rule that a HU file is created when work begins; it does not currently show Sprint 2 files. citeturn677634view0

Use the user's required normalized sections:

- Resultado.
- Reglas implementadas.
- Seguridad.
- Frontend y validación.
- Baseline revalidado.
- Evidencia real.
- Manifest de archivos del change.
  - Backend.
  - Frontend y contrato generado.
  - Documentación.
- Evidencias.
- Estado de entrega.

Each MUST state:

`BACKEND IMPLEMENTADO / FRONTEND PENDIENTE`

until its frontend change exists.

Existing evidence MUST be preserved.

No fake screenshots.

## Required Tests Per Layer

### Domain

Where value exists:

- enum/state invariants;
- pure conversion calculations;
- low-stock predicate;
- amount calculations;
- lifecycle transition rules.

### Application

- composition validation;
- unit compatibility;
- production requirement calculation;
- sale total calculation;
- purchase total;
- actor/scope authorization helpers;
- shortage mapping;
- shift transition orchestration.

### PostgreSQL Integration

Required for:

- inventory locks;
- concurrent production;
- concurrent sale;
- unique Sale/Order;
- receive/cancel race;
- double receipt;
- transaction rollback;
- migration constraints;
- shift handover concurrency.

## Test Matrix

### HU-004

- manager allowed;
- unauthorized denied;
- multiple components;
- missing component;
- inactive component;
- zero/negative quantity;
- compatible kg↔g;
- incompatible dimensions;
- duplicate component;
- self-reference;
- update replacement;
- zero inventory movements.

### HU-006

- quantity > min false;
- equal true;
- below true;
- negative true;
- null threshold false;
- MinStock zero;
- negative MinStock reject;
- ADMIN update;
- ENCARGADO update;
- COCINA update forbidden;
- COCINA read allowed.

### HU-007

- valid production;
- all consumption movements;
- output movement;
- refs to Production;
- actual quantity stored;
- actor/responsible;
- conversion;
- insufficient component hard block;
- no partial writes;
- repeated production accumulates;
- component inactive at confirmation;
- concurrent productions;
- Production vs Sale race.

### HU-012

- only ENTREGADO;
- PENDIENTE rejected;
- EN_PREPARACION rejected;
- LISTO rejected;
- CANCELADO rejected;
- one Sale per Order;
- server prices;
- server total;
- valid channel/payment;
- invalid combination;
- Shift required/resolved;
- prepared Product single-level decrement;
- atomic rollback;
- concurrent duplicate confirmation.

### HU-013

- shortage conflict;
- all shortage items returned;
- no writes before ack;
- ack recalculates;
- ack can go negative;
- concurrent stock changes;
- traceability preserved.

### HU-017

- one Supplier multiple lines;
- no lines rejected;
- existing Products;
- inactive Product behavior;
- active Supplier;
- server total;
- no InventoryMovement;
- COCINA allowed ingredient purchase;
- COCINA forbidden general Product;
- ENCARGADO scope;
- ADMIN global;
- multi-role union;
- Cocina receiptReference;
- cancellation reason;
- cancel only pending.

### HU-018

- receive pending;
- ordered == received;
- received below ordered;
- received above ordered;
- received zero reject;
- all lines required;
- inventory uses actual quantity;
- unit conversion;
- received Purchase conflict;
- cancelled Purchase conflict;
- reject/no-accept remains pending;
- double receive race;
- cancel vs receive race;
- rollback;
- server receiver.

### HU-025

- one CashSession per business date;
- two fixed Shifts;
- valid first activation;
- assignments;
- duplicate assignment rejected;
- MESERO own shift;
- MESERO manage forbidden;
- valid handover;
- shared cash;
- no CashClosing;
- concurrent handover;
- business date Bolivia;
- Sale association;
- Expense association;
- historical Expense null Shift remains readable.

## Tradeoffs Accepted

- Inventory reference remains polymorphic rather than adding hard FKs from every movement.
- A shared batch inventory boundary adds infrastructure complexity but prevents multiple stock engines.
- Sale shortage uses two-step confirmation instead of trusting UI.
- No Idempotency-Key subsystem in Sprint 2.
- PurchaseReceiptLine adds a small schema cost to preserve ordered vs actual physical quantity correctly.
- Expense ShiftId remains nullable for historical compatibility.
- Sale ShiftId is required for new Sale.
- No low-stock alert persistence.
- No realtime low-stock.
- No recursive composition explosion by default.
- No cost model.
- No full purchase/production histories merely for future UI.
- No arbitrary Shift CRUD.
- No cash closing.

## Implementation Constraints

- Preserve Clean Architecture.
- Reuse existing namespace/module conventions.
- Do not name new files until local structure is audited.
- No second InventoryBalance.
- No direct balance updates from Production/Sale/Purchase services bypassing shared inventory boundary.
- No client-controlled actor.
- No client-controlled ShiftId for Sale/Expense.
- No client-controlled inventory deltas.
- No client-controlled Sale totals.
- No old migration edits.
- No frontend changes.
- No Git mutation.
- No VERIFY/ARCHIVE.
- No out-of-scope HUs.

## Open Design Questions

### Blocking — Composition scaling

Current sources define quantity/unit per composition component and final produced quantity but do not define the base against which recipe quantities scale.

Before Production implementation, explore MUST locate a definitive answer in:

- refined HU;
- ENT-02;
- SRS;
- ADR;
- OpenSpec;
- approved screenshot semantics.

If absent, human decision is required.

A safe implementation MUST NOT invent a denominator.

### Blocking — Visual package accessibility

`Pantallas.zip` was not accessible in this session.

Future explore MUST inspect every screen individually before finalizing DTOs that exist solely to satisfy frontend information needs.

### Non-blocking — exact Shift labels

Current model says MORNING/NIGHT. Exact labels/hours can be taken from current local documentation; no new product decision is required unless local sources conflict.

### Non-blocking — received quantity above ordered

Recommended default: allow any accepted actual quantity >0 and persist physical truth. This changes only if a real current business rule contradicts it.

### Non-blocking — PurchaseArea persisted field

Current data model contains KITCHEN/GENERAL, but frozen decision prohibits a manual selector. APPLY MAY retain the field as a server-derived classification if local persistence already expects it; otherwise it SHOULD avoid adding unnecessary state.
