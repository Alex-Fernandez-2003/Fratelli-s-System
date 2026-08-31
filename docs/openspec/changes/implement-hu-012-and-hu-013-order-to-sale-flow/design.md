# Design

## Components Touched

### Confirmed current components

Backend:

- Order domain and `OrderService`.
- Order Application contracts.
- Inventory Application boundary and `InventoryService`.
- Operations/Sale contracts.
- `OperationsService`.
- existing Order/Operations endpoint mappings.
- `ApplicationDbContext`.
- PostgreSQL integration test infrastructure.
- existing runtime OpenAPI pipeline.

Frontend:

- `features/orders/api.ts`.
- `features/orders/pages.tsx`.
- central endpoint registry.
- AppRoutes.
- shared API/error handling.
- generated TypeScript.
- shared Card/Alert/Button/Dialog primitives.
- a new Sales frontend slice or the closest local feature convention.

The exact local paths MUST be revalidated before APPLY.

## Current Architecture

### Orders

Order is a separate operational aggregate from Sale.

Current Create Order performs Product validation and price snapshot, then persists Order/OrderItems/Kitchen data without Inventory movement. This behavior is correct and must remain. citeturn571977view0

### Inventory

The existing Inventory writer:

- serializes Product/balance changes with PostgreSQL row locks;
- computes shortages under lock;
- supports `allowNegative`;
- records InventoryMovement;
- participates in an existing outer transaction. citeturn710058view1

This is the single mutation authority.

### Sale

Current Sale confirmation already:

Order lock
→ ENTREGADO validation
→ duplicate check
→ current Shift resolution
→ Sale construction
→ Inventory writer
→ commit. citeturn710058view3

The local stabilization change MUST be reused for corrected Shift and locked-shortage semantics.

## Boundaries Respected

- Order creation checks stock but does not own Inventory mutation.
- InventoryService remains the stock authority.
- Sale remains the only Inventory-decrement point for this Order→Sale flow.
- No reservation subsystem.
- No standalone Sale.
- No Customer dependency.
- No Receipt entity.
- No printer.
- No fiscal behavior.
- Existing Orders/Kitchen state machines remain intact.
- Existing API routes remain intact.
- Checkout is a frontend capability attached to Orders, not a second Order workflow.

## Contracts Changed

### 1. CreateOrderRequest — additive HU-013 field

Preferred semantic addition:

`acknowledgeStockShortage`

Requirements:

- optional/default false in the HTTP/OpenAPI contract;
- no route change;
- no existing property change.

The implementation syntax SHOULD be chosen so OpenAPI does not force preexisting callers to send the new property.

### 2. Structured stock shortage

Introduce or formalize one shared Application-level shortage representation.

Conceptually:

- ProductId;
- ProductName;
- RequiredQuantity;
- CurrentQuantity;
- ShortageQuantity;
- InventoryUnitId;
- InventoryUnitSymbol/label if readily available.

Do not reuse `ProductionRequirementDto` as the long-term public name if doing so incorrectly couples Orders/Sales to Production semantics.

A small shared Inventory shortage contract is preferred.

### 3. ProblemDetails

Order-create shortage:

- status 409;
- code such as `ORDER_STOCK_ACKNOWLEDGEMENT_REQUIRED`;
- structured `shortages`.

Existing Sale shortage code SHOULD be preserved when already externally observable, e.g. `SALE_STOCK_CONFIRMATION_REQUIRED`.

Both MAY use the same shortage array shape.

OpenAPI SHOULD describe the extension shape sufficiently for generated frontend types or, if ASP.NET's ProblemDetails metadata cannot express it cleanly, frontend MUST use a narrow type guard over the normalized ProblemDetails extensions rather than parsing strings.

### 4. SaleDto — additive HU-012 fields

The audited persistence already stores values missing from the DTO.

Prefer an additive response such as:

- existing Id;
- existing OrderId;
- existing ShiftId;
- existing Subtotal;
- existing Total;
- existing Items;
- SalesChannel;
- PaymentMethod;
- ConfirmedAt;
- ConfirmedByUserId;
- ConfirmedByDisplayName.

No new Sale endpoint is required.

### 5. Order acknowledgement persistence

If local baseline has no equivalent, minimally extend Order with nullable audit state conceptually equivalent to:

- stock-shortage acknowledged at;
- stock-shortage acknowledged by UserId.

The actor field MUST reference User, not Employee.

A separate boolean is unnecessary when timestamp/actor presence represents acknowledgement.

### Migration decision

`MIGRATION_REQUIRED: CONDITIONAL YES`.

If local Order still matches the remote audited entity, one additive migration is necessary for acknowledgement audit.

No Sale migration is expected.

No migration is justified for SaleDto expansion.

## Shared Stock Availability Boundary

Order Create needs a read-only calculation that uses the same inventory semantics without mutating balances.

Preferred design:

existing Inventory module
→ focused read-only availability operation
→ required Product quantities
→ authoritative current balances
→ complete shortages.

The exact interface name is not frozen.

It MAY be:

- a focused availability-reader interface implemented by existing InventoryService; or
- an equivalent method on an already suitable Inventory read boundary.

It MUST NOT:

- become a new stock repository;
- duplicate InventoryBalance persistence;
- write temporary movements;
- use Sale service as a dependency of Orders.

### Why not call WriteBatchAsync for Order preview

`WriteBatchAsync` performs the actual Inventory mutation when stock is sufficient.

Calling it as a precheck would violate the frozen rule:

Order creation → no final Inventory movement.

Therefore Order needs a non-mutating shortage evaluation over the same data authority.

## Order Shortage Flow

Normal request:

New Order draft
→ POST /orders, ack false
→ validate request/Products
→ calculate aggregated required quantities
→ Inventory availability read
→ sufficient?
→ yes: existing Order creation
→ no: 409 + all shortages, no persistence.

Acknowledged retry:

same draft
→ POST /orders, ack true
→ validate again
→ evaluate current stock again
→ create Order once
→ if current shortage still exists:
persist acknowledgement actor/time
→ existing KitchenCommand logic
→ commit
→ no Inventory movement.

### No temporary Order

The first attempt must not allocate a persisted Order merely to obtain an id.

This removes duplicate-order and cleanup complexity.

### Aggregation

Required quantities SHOULD be aggregated by ProductId exactly as final Sale does.

The calculation uses sold Product quantities.

It does not recursively inspect recipe ingredients.

A produced preparation has its own Inventory stock and was already generated by HU-007.

## Acknowledgement Persistence

The trace answers only:

- was insufficient stock explicitly accepted for this Order?
- by which authenticated User?
- when?

It intentionally does not persist:

- exact shortage quantities;
- current stock snapshots;
- client-provided explanation;
- reservation;
- expiration token.

Rationale:

stock is revalidated later and the accepted decision is semantic consent to proceed despite shortage, not a promise that the first shortage vector remains unchanged.

## Final Sale Revalidation

Sale remains the final authority before Inventory mutation.

Conceptual flow:

BEGIN
→ lock Order
→ validate ENTREGADO
→ verify no Sale
→ resolve current operational Shift
→ build server-authoritative Sale snapshot
→ determine whether negative is permitted:
Order acknowledgement exists
OR exceptional current Sale request acknowledgement
→ invoke InventoryWriter under transaction
→ if locked shortage and negative not permitted:
return authoritative locked shortages
rollback
→ if exceptional ack was used and shortage exists:
record Order acknowledgement actor/time if not already recorded
→ persist Sale/SaleItems
→ commit.

Exact ordering of adding Sale entity vs Inventory writer may follow the stabilized local implementation as long as:

- reference Sale id remains available for InventoryMovement;
- rollback is complete;
- no partial Sale/movement remains.

## Edge Case: New Shortage at Checkout

This case is resolved without a new product decision because the current backend already supports Sale-time acknowledgement.

Policy:

### Order had previous acknowledgement

No repeated normal warning is needed.

The backend still revalidates under lock and may allow negative.

### Order had no previous acknowledgement

If final locked stock is now insufficient:

- do not permit negative;
- return the current Sale shortage conflict;
- frontend shows the shared shortage dialog;
- explicit Continue retries Sale with acknowledgement;
- backend revalidates again;
- if it succeeds with insufficient stock, persist acknowledgement against the Order and commit Sale.

Thus:

- normal warning location = Order creation;
- exceptional race fallback = checkout.

## Sale Eligibility and Completion Semantics

Current Sale has no status property. citeturn486677view0

Do not introduce one.

A Sale exists only after:

- Order is ENTREGADO;
- payment/channel validated;
- Inventory transaction succeeds;
- commit succeeds.

For this MVP that is sufficient to mean:

confirmed/paid completed Sale.

Future cancellation/refund workflows are out of scope.

## Sale Snapshot / Future Receipt Readiness

Existing persistence already preserves:

- Sale id;
- Order relation;
- Shift;
- channel;
- payment;
- total;
- confirmed actor/time;
- Product reference;
- OrderItem reference;
- quantity;
- unit price;
- line total. citeturn486677view0turn740654view0

This is sufficient for the approved MVP future operational-receipt handoff.

Tradeoff accepted:

- exact historical Product display-name snapshot is not added solely for a future printer.
- if a later receipt story requires immutable historical wording, that story can add the requirement explicitly.

No `Receipt`, `Invoice` or printer schema is created now.

## Channel Design

The audited remote Order contract does not contain SalesChannel. citeturn295305view0

Therefore, if local baseline remains the same:

Checkout MUST present:

- Directo;
- PedidosYa.

Channel is submitted only to ConfirmSale.

If local baseline has since added authoritative Order channel:

- display it;
- inherit it;
- remove contradictory editing.

### Payment compatibility

Under the current backend rule:

DIRECT:

- CASH;
- QR.

PEDIDOSYA:

- EXTERNAL.

Recommended frontend behavior:

- selecting DIRECT exposes Efectivo and QR;
- selecting PEDIDOSYA exposes/sets Externo as the only legal classification;
- changing channel clears an incompatible previous payment choice.

Backend remains authoritative.

## Checkout Route

Preferred frontend route:

`/pedidos/:id/cobrar`

Reasoning:

- Sale cannot exist independently;
- route is naturally anchored under the Order;
- parent navigation remains Pedidos;
- no new global Sales module navigation is required.

Guard:

ADMINISTRADOR / ENCARGADO / MESERO.

OrderDetail should show `Cobrar` only when:

`status === ENTREGADO`.

An already-sold Order may still be encountered due to current OrderDto not exposing Sale existence; backend 409 remains authoritative.

Avoid adding `hasSale` solely to hide this rare race unless local design already supports it.

## Checkout Data Flow

Route
→ use existing Order detail query
→ validate/render ENTREGADO
→ collect channel/payment
→ POST /sales
→ success:
invalidate Inventory;
invalidate relevant Order data;
show Sale success dialog
→ `Volver a pedidos`.

No optimistic Sale.

## Cancel Checkout

UI event
→ navigate back
→ no HTTP mutation.

No need for a cancel-sale API.

## Success Dialog

Display only real data.

Recommended:

- `Venta confirmada`;
- `La venta se registró correctamente.`;
- Sale ID;
- total;
- payment method;
- channel if useful;
- responsible;
- timestamp if returned.

Primary:

`Volver a pedidos`.

Optional secondary:

`Cerrar`, only if consistent with existing Dialog pattern.

Never:

`El comprobante ha sido generado`.

Never:

`Nueva venta`.

## Visual Audit

### `Cobro - Desktop.png`

| Element                               | Decision     | Reason                                                                                                |
| ------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| Dark/orange Fratelli hierarchy        | KEEP         | Consistent visual direction                                                                           |
| Existing global sidebar               | ADAPT        | Reuse actual AppShell, do not recreate screenshot shell                                               |
| Confirmar Venta + Order identifier    | KEEP/ADAPT   | Use real compact Order id                                                                             |
| Mesa                                  | ADAPT        | Show `tableReference` only when real                                                                  |
| Estado Pendiente                      | OMIT/REPLACE | Checkout requires ENTREGADO                                                                           |
| Fecha mockup 2023                     | OMIT/REPLACE | Use real backend timestamp where useful                                                               |
| Order line table                      | KEEP         | Real OrderDto supports item/quantity/unitPrice/lineTotal                                              |
| Insufficient-stock inline warning     | ADAPT        | Normal warning moves to Order creation; checkout only shows it for exceptional newly-emerged shortage |
| Cliente block                         | OMIT         | HU-014                                                                                                |
| NIT search                            | OMIT         | HU-014                                                                                                |
| Directo/PedidosYa                     | KEEP/ADAPT   | Use real SalesChannel                                                                                 |
| Efectivo                              | KEEP         | CASH                                                                                                  |
| QR Bancario text implying integration | ADAPT        | Label QR; no bank verification                                                                        |
| Externo “Tarjetas/Transferencia”      | ADAPT        | Use neutral Externo unless contract defines more                                                      |
| Subtotal                              | KEEP         | server value                                                                                          |
| Descuentos                            | OMIT         | No discount capability                                                                                |
| Total a cobrar                        | KEEP         | server-authoritative                                                                                  |
| Confirmar Venta CTA                   | KEEP         |
| Cancelar Cobro                        | KEEP         | navigation only                                                                                       |
| `Caja 1`                              | OMIT         | shared cash; no such entity                                                                           |
| Turno Tarde                           | ADAPT        | Show only real Shift data                                                                             |

### `Cobro - Mobile.png`

| Element                      | Decision                       | Reason                                                                    |
| ---------------------------- | ------------------------------ | ------------------------------------------------------------------------- |
| Compact checkout header      | KEEP/ADAPT                     |
| Caja 1 badge                 | OMIT                           |
| Mesa/status/turno card       | ADAPT to real fields           |
| Collapsible order details    | MAY                            | Useful but not required if existing components favor static section       |
| Line amounts                 | KEEP                           |
| “Sin Stock” line hint        | ADAPT                          | May reflect exceptional final conflict, but backend response is authority |
| Stock warning                | ADAPT                          | Exceptional checkout fallback only                                        |
| Customer area                | OMIT                           |
| Channel cards                | KEEP/ADAPT                     |
| Payment cards                | KEEP/ADAPT                     |
| Cancelar cobro               | KEEP                           |
| User identity                | REUSE actual shell/auth        |
| Sticky total + CTA           | KEEP/ADAPT                     | Allowed when safe at ~360 px                                              |
| Bottom duplicated navigation | OMIT if not part of real shell |

### `Modales de Cobro.png`

#### Stock insuficiente

KEEP/ADAPT:

- warning icon/severity;
- title;
- explanatory copy;
- Product/Faltante list;
- Volver;
- Continuar.

Changes:

- normal modal belongs to New Order;
- same component may be reused for checkout race fallback;
- Faltante is positive magnitude;
- render N shortages;
- no white background/screenshot shell assumptions;
- use current Dialog design.

#### Venta confirmada

KEEP/ADAPT:

- success hierarchy;
- real total;
- payment;
- Sale id;
- responsible.

OMIT/REPLACE:

- `El comprobante ha sido generado exitosamente`;
- `Nueva venta`.

Use:

- `La venta se registró correctamente`;
- `Volver a pedidos`.

## Data Flow

### HU-013 normal

NewOrder draft
→ CreateOrder ack=false
→ backend availability evaluation
→ sufficient
→ create Order normally
→ insufficient
→ 409 ProblemDetails + all shortages
→ shortage dialog
→ Volver
→ keep draft
→ Continuar
→ CreateOrder ack=true
→ backend re-evaluates
→ create Order
→ optional acknowledgement audit
→ no Inventory write.

### HU-012 normal

ENTREGADO Order
→ Checkout
→ channel/payment
→ ConfirmSale
→ lock/revalidate
→ current Shift
→ Sale snapshot
→ InventoryWriter
→ commit
→ SaleDto
→ success dialog
→ Orders.

### HU-013 exceptional checkout race

Order had no ack
→ stock falls later
→ ConfirmSale ack=false
→ locked shortage
→ 409 + authoritative shortages
→ shared dialog
→ ConfirmSale ack=true
→ revalidate
→ persist Order shortage audit
→ allow negative
→ Sale commit.

## Required Tests Per Layer

### Domain/model

If acknowledgement fields are new:

- audit consistency;
- nullable preexisting Orders;
- User FK behavior.

### Application/Infrastructure — PostgreSQL

Order:

- sufficient;
- exact boundary;
- shortage/no ack;
- multiple shortages;
- retry ack;
- changed stock between requests;
- no partial entities;
- no Inventory movements;
- acknowledgement audit.

Sale:

- ENTREGADO success;
- invalid Order states;
- total;
- unique Order;
- channel/payment combinations;
- correct Shift;
- Inventory movement;
- preparation no double consumption;
- prior Order ack permits negative;
- newly emerged shortage fallback;
- locked authoritative shortages;
- rollback.

### API contract

- 201 Order success;
- 409 structured Order shortage;
- 201 Sale;
- 409 structured Sale shortage/duplicate conflict;
- 400 invalid payment/channel;
- 401/403/404.

### Frontend

New Order:

- structured error recognition;
- modal;
- all shortages;
- positive magnitude;
- Volver preserves draft;
- Continue retries with ack;
- pending prevents duplicate request;
- success routing.

Checkout:

- route/guard;
- ENTREGADO;
- non-eligible state;
- no Customer;
- no discounts;
- channel/payment;
- server total;
- cancel = no mutation;
- sale pending;
- exceptional shortage;
- success;
- duplicate conflict;
- mobile structure.

## Tradeoffs Accepted

- One small additive Order audit migration is preferable to abusing `notes` for compliance trace.
- No shortage snapshot is stored.
- No stock reservation is introduced.
- Sale-time shortage acknowledgement remains only as a concurrency safety fallback.
- No Sale status is added.
- No Product name snapshot is added solely for future printing.
- No Sale GET endpoint is added.
- An already-sold delivered Order may still reach checkout and receive a backend conflict rather than expanding OrderDto with sale state purely for UI convenience.
- Checkout channel remains selected at Sale time while Order has no authoritative channel.

## Alternatives Rejected

### Frontend-only shortage calculation

Rejected because frontend is not stock authority and can be stale.

### Decrement Inventory when Order is created

Rejected because definitive stock impact belongs to Sale.

### New Inventory reservation subsystem

Rejected as unnecessary scope/authority duplication.

### Persist a temporary Order on the first warning request

Rejected because it complicates retry/idempotency and risks duplicate Orders.

### `/orders/force`

Rejected because the existing create contract can be extended additively.

### New Sale endpoint/version

Rejected because `POST /api/v1/sales` already implements the capability.

### Standalone Sales screen that creates Sale without Order

Rejected by business rule.

### Customer/NIT support

Rejected as HU-014.

### Receipt entity now

Rejected because existing Sale persistence is the current historical source.

### Printer integration now

Rejected as post-MVP/hardware scope.

### SaleStatus enum solely to represent a confirmed Sale

Rejected because Sale existence already represents successful confirmation in the current model.

### Remove final Sale shortage safeguard after moving HU-013 to Order

Rejected because stock may change after Order creation.

## Implementation Constraints

- Revalidate local develop before implementation.
- Reuse stabilized current-Shift behavior.
- No new endpoint unless local audit proves an unavoidable missing capability.
- Preserve `POST /orders`.
- Preserve `POST /sales`.
- Preserve existing HTTP verbs.
- Additive contracts only.
- Use the existing Inventory authority.
- Never write Inventory during Create Order.
- Actor/time server-side.
- No raw JWT/manual token handling.
- Generated TypeScript only through OpenAPI.
- Do not add unrelated role fixes.
- Do not fabricate screenshots/evidence.
- Do not execute VERIFY/ARCHIVE unless separately authorized.
- No Git mutations by the agent.

## Open Design Questions

No human product decision remains open under the audited remote architecture.

Before APPLY, these technical baseline facts MUST be revalidated locally:

1. whether Order already contains acknowledgement audit fields;
2. whether the stabilized Inventory shortage result already exposes a reusable read shape;
3. whether the current-Shift resolver is already centralized and fixed;
4. whether shared ProblemDetails normalization already retains `code`/`shortages`;
5. whether local SaleDto has already been expanded;
6. whether any checkout frontend work exists locally but is not present remotely.

If item 3 is not satisfied locally, stop as `BASELINE_CONTRACT_BLOCKER` rather than silently reimplementing the stabilization change.
