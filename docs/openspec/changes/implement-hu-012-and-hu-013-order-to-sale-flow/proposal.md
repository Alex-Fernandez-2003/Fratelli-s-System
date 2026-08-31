# Proposal

## BASELINE_AUDIT

### Alcance verificable de esta auditoría

La baseline canónica exigida es el `develop` LOCAL REAL ACTUAL.

Esta sesión no dispone del checkout Git local del usuario, por lo que no puede afirmar de forma factual:

- `git branch --show-current`;
- `git rev-parse HEAD`;
- `git status --short`;
- cambios no publicados;
- estado exacto posterior al change local de estabilización.

Por tanto:

| Campo                        | Resultado                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| Repository                   | `Alex-Fernandez-2003/Fratelli-s-System`                                                                  |
| Branch requerida             | `develop`                                                                                                |
| Branch remota inspeccionada  | `develop`                                                                                                |
| Local branch                 | `LOCAL_REVALIDATION_REQUIRED`                                                                            |
| Local HEAD                   | `LOCAL_REVALIDATION_REQUIRED`                                                                            |
| Local working tree           | `LOCAL_REVALIDATION_REQUIRED`                                                                            |
| Sprint 2 backend             | IMPLEMENTED en la baseline remota observada                                                              |
| Sprint 2 stabilization       | Debe considerarse prerequisite ya aplicado localmente según la decisión humana; revalidación obligatoria |
| Frontend Orders              | EXISTS                                                                                                   |
| Frontend Checkout/Sales      | MISSING en la baseline remota observada                                                                  |
| Generated OpenAPI TypeScript | PRESENT                                                                                                  |
| HU-012 document              | `BACKEND IMPLEMENTADO / FRONTEND PENDIENTE`                                                              |
| HU-013 document              | `BACKEND IMPLEMENTADO / FRONTEND PENDIENTE`                                                              |

### Order baseline observado

La API actual conserva:

- `POST /api/v1/orders`;
- `GET /api/v1/orders`;
- `GET /api/v1/orders/{id}`;
- assignment/take/deliver/cancel;
- policy `OrdersAccess` para ADMINISTRADOR, ENCARGADO y MESERO. citeturn494325view3turn571977view0

`OrderStatus` contiene exactamente:

- `PENDIENTE`;
- `EN_PREPARACION`;
- `LISTO`;
- `ENTREGADO`;
- `CANCELADO`. citeturn486677view1

El `CreateOrderRequest` remoto actual contiene:

- `tableReference`;
- `notes`;
- `items`;

y todavía no contiene acknowledgement de stock. citeturn678947view2

`OrderService.CreateAsync` actualmente:

1. valida actor/request;
2. valida Products activos, vendibles y con precio;
3. snapshottea `UnitPrice`;
4. crea OrderItems;
5. crea KitchenCommand cuando corresponde;
6. deja Order `PENDIENTE` con Kitchen o `LISTO` sin Kitchen;
7. persiste;
8. no consulta shortage;
9. no genera InventoryMovement. citeturn571977view0

Por tanto, en la baseline remota:

**Current shortage stage: SALE only.**

### Sale baseline observado

Existe:

`POST /api/v1/sales`

protegido por `OrdersAccess`. citeturn618743view2turn494325view3

El request actual es:

- `orderId`;
- `salesChannel`;
- `paymentMethod`;
- `acknowledgeStockShortage`, default false. citeturn298324view0

Enums actuales:

- `SalesChannel`: `DIRECT`, `PEDIDOSYA`;
- `PaymentMethod`: `CASH`, `QR`, `EXTERNAL`. citeturn298324view1turn298324view3

La implementación remota de `ConfirmSaleAsync` ya:

- exige Order `ENTREGADO`;
- impide una segunda Sale para el mismo Order;
- calcula total desde OrderItems;
- persiste Sale/SaleItems;
- afecta Inventory únicamente al confirmar Sale;
- usa `IInventoryWriter.WriteBatchAsync`;
- admite negative inventory únicamente con acknowledgement;
- devuelve 409 para shortage sin aceptación. citeturn710058view3turn710058view0

`Sale.OrderId` ya tiene índice UNIQUE en EF, reforzando one-sale-per-order. citeturn740654view0

### Sale persistence observado

`Sale` ya persiste:

- Id;
- OrderId;
- ShiftId;
- SalesChannel;
- PaymentMethod;
- Subtotal;
- Total;
- ConfirmedAt;
- ConfirmedByUserId;
- SaleItems. citeturn486677view0

`SaleItem` ya persiste:

- OrderItemId;
- ProductId;
- Quantity;
- UnitPrice;
- LineTotal. citeturn486677view0

No existe un `SaleStatus` observado.

Para el MVP, la existencia de una Sale creada exclusivamente mediante confirmación de un Order `ENTREGADO`, junto con `PaymentMethod`, `ConfirmedAt` y `ConfirmedByUserId`, ya representa una operación confirmada/completada. No se justifica introducir un enum artificial `PAID`.

El `SaleDto` remoto, sin embargo, solo expone:

- Id;
- OrderId;
- ShiftId;
- Subtotal;
- Total;
- Items.

No expone todavía channel, payment method, timestamp ni responsible display, aunque esos datos sí existen en persistencia. citeturn298324view1

### Shift baseline

La decisión humana exige reutilizar el resolver estabilizado:

BusinessDate actual
→ CashSession abierta del día
→ Shift ACTIVE dentro de esa sesión.

La fuente remota visible todavía muestra algunos patrones anteriores que buscan `ShiftStatus.ACTIVE` globalmente. citeturn710058view3

Esto NO debe incorporarse silenciosamente a este scope porque existe un change previo específico de estabilización declarado como aplicado localmente.

Gate:

- si el develop local contiene el resolver estabilizado: `REUSE`;
- si no lo contiene: `BASELINE_CONTRACT_BLOCKER`, porque faltaría un prerequisite previamente declarado, no una decisión de HU-012/HU-013.

### Frontend baseline observado

Existe `features/orders` con:

- API/query hooks;
- Orders list;
- New Order;
- Order Detail;
- create/take/assign/deliver/cancel;
- Query keys;
- TanStack Query. citeturn497588view0turn497588view1

`NewOrderPage` actualmente:

- mantiene draft en React;
- consolida Products;
- construye el request sin precio/actor;
- llama una sola vez a Create Order;
- navega al detalle al recibir success;
- no gestiona shortage estructurado. citeturn497588view2

`OrderDetailPage` ya presenta items, total, estado y acciones operativas, pero no ofrece Cobrar/Confirmar venta. citeturn497588view2

No existe route de checkout/sales en `AppRoutes`; las routes actuales terminan en `/pedidos`, `/pedidos/nuevo` y `/pedidos/:id`. citeturn721181view0

El endpoint registry ya contiene:

`sales.create() -> /api/v1/sales`. citeturn755592view0

### Generated contract

`api.generated.ts` está presente y generado desde OpenAPI. Actualmente refleja:

- CreateOrder sin acknowledgement;
- ConfirmSale con acknowledgement;
- SaleDto reducido;
- OrderDto con tableReference, status, items y total. citeturn298324view0turn295305view0

### Mandatory APPLY preflight

Antes de modificar código, APPLY MUST repetir esta matriz contra el checkout local real.

Cualquier diferencia local debe clasificarse:

- `ALREADY_SUPPORTED`;
- `REUSE`;
- `EXTEND`;
- `BASELINE_CONTRACT_BLOCKER`.

No debe reimplementarse ninguna corrección perteneciente a `stabilize-sprint-2-backend-and-openapi-contracts`.

---

## REUSE_MAP

### HU-012

#### Backend foundations

REUSE:

- `Sale`;
- `SaleItem`;
- `POST /api/v1/sales`;
- `ConfirmSaleRequest`;
- `SalesChannel`;
- `PaymentMethod`;
- `IInventoryWriter`;
- `InventoryMovementType.SALE`;
- `InventoryReferenceType.SALE`;
- transaction existente;
- row locks;
- unique Sale per Order;
- `IBusinessClock`;
- current Shift resolver estabilizado;
- `OrdersAccess`;
- ProblemDetails convention.

EXTEND, solo donde sea necesario:

- `SaleDto` para exponer datos ya persistidos útiles a success UX;
- shortage result/error metadata;
- final Sale allowance derivada del acknowledgement guardado en Order.

DO NOT CREATE:

- otro sale engine;
- otra tabla de stock;
- Receipt entity;
- Invoice;
- printer subsystem;
- payment gateway.

### HU-012 frontend foundations

REUSE:

- `/pedidos/:id`;
- `useOrder`;
- Order detail data;
- shared httpClient;
- TanStack Query;
- generated types;
- AuthProvider;
- route guards;
- AppShell;
- Button/Card/Alert/Dialog primitives;
- currency formatter/pattern existente.

CREATE/EXTEND:

- checkout route vinculada al Order;
- Sale API mutation;
- Checkout page;
- success dialog;
- `Cobrar` action para Orders elegibles.

### HU-013

#### Backend foundations

REUSE:

- InventoryBalance;
- `IInventoryWriter`;
- locked authoritative shortage result de `WriteBatchAsync`;
- existing Sale shortage acknowledgement contract as final safety fallback;
- Order Create endpoint;
- Order transaction;
- actor principal;
- Product/OrderItem quantities;
- ProblemDetails.

EXTEND:

- CreateOrder contract con acknowledgement opcional backward-compatible;
- un read-only shortage evaluation boundary dentro de la foundation Inventory existente;
- Order creation result para devolver all shortages;
- audit mínimo del acknowledgement en Order.

DO NOT CREATE:

- reservation engine;
- second stock service;
- temporary Order;
- draft backend;
- `/orders/force`;
- separate shortage endpoint.

### HU-013 frontend foundations

REUSE:

- NewOrderPage;
- current cart/draft;
- current CreateOrder mutation;
- existing modal/dialog primitives;
- shared ProblemDetails/HttpError handling.

EXTEND:

- recognition of machine-readable shortage conflict;
- shared shortage dialog;
- retry with acknowledgement;
- preservation of current draft.

---

## HU-012 GAP ANALYSIS

### Exists

- Sale domain/persistence.
- Sale endpoint.
- total server-side.
- PaymentMethod/SalesChannel enums.
- Order `ENTREGADO` precondition.
- Inventory mutation at Sale.
- one Sale per Order.
- Shift relation.
- backend timestamp/actor.
- PostgreSQL transaction/locking.

### Reuse

All foundations above MUST remain authoritative.

### Missing

- Checkout frontend.
- Route linked to an existing Order.
- Cobrar action on eligible Order.
- channel/payment UI.
- controlled conflict/error UX.
- Sale success UX.
- additive response fields required to render success from actual Sale data.
- explicit distinction that customer/discount UI is excluded.

### Endpoint impact

No new backend endpoint is required.

Reuse:

`POST /api/v1/sales`

and:

`GET /api/v1/orders/{id}`.

### DTO impact

Expected additive change to `SaleDto`:

- SalesChannel;
- PaymentMethod;
- ConfirmedAt;
- ConfirmedByUserId;
- ConfirmedByDisplayName when resolvable safely.

No existing field should be removed/renamed.

### Domain impact

No new Sale status required.

No Receipt entity required.

### Migration impact

HU-012 alone:

`MIGRATION_REQUIRED: NO` based on the audited remote model.

### Tests

Need focused integration/concurrency and frontend behavioral coverage.

### Risks

- duplicate sale;
- stale stock;
- wrong Shift;
- channel/payment invalid combination;
- frontend believing its total is authoritative;
- mockup introducing client/discount/cash-register features.

---

## HU-013 GAP ANALYSIS

### Exists

- Backend shortage detection currently at Sale.
- Explicit acknowledgement field on ConfirmSale.
- authoritative final Inventory lock.
- negative-stock support after acknowledgement.
- structured runtime ProblemDetails extensions in Operations API.

### Missing

Normal shortage decision at Order generation.

Specifically missing in the remote baseline:

- Order stock precheck;
- acknowledgement field in CreateOrder;
- first-attempt 409 before Order persistence;
- all-shortage response from CreateOrder;
- acknowledgement audit on Order;
- frontend shortage modal in New Order;
- second CreateOrder request with acknowledgement.

### Endpoint impact

No new endpoint required.

Preferred:

extend existing:

`POST /api/v1/orders`

with an additive optional acknowledgement property.

### DTO/error impact

Need a shared structured shortage contract suitable for both:

- Order creation conflict;
- exceptional Sale-time shortage conflict.

ProblemDetails MUST remain machine-readable and MUST expose all shortages without frontend message parsing.

### Domain impact

The audited remote `Order` has no shortage acknowledgement audit fields. citeturn486677view1

To satisfy explicit traceability without abusing Notes, the minimal expected persistence is:

- nullable acknowledgement timestamp;
- nullable acknowledging UserId.

No shortage snapshot is required because acknowledgement represents acceptance of possible insufficient stock, not acceptance of a frozen quantity vector.

### Migration impact

If local baseline still matches the audited remote model:

`MIGRATION_REQUIRED: YES — one additive migration for Order acknowledgement audit fields.`

If those fields/equivalent already exist locally:

`MIGRATION_REQUIRED: NO`.

The preflight MUST determine this before generating a migration.

### Tests

Need:

- sufficient;
- insufficient first attempt;
- acknowledged retry;
- all shortages;
- boundary exact stock;
- no Order on rejected attempt;
- no KitchenCommand on rejected attempt;
- no inventory movement;
- no duplicate Order;
- actor/time trace;
- revalidation after stock changes.

### Risks

- first attempt accidentally persists Order;
- duplicate Order on retry;
- stale shortage data;
- duplicate stock authority;
- acknowledgement recorded when no shortage exists;
- acknowledgement lost before final Sale;
- Sale no longer protecting race-induced shortages.

---

## Resolved edge case: stock becomes insufficient only before Sale

No additional human product decision is required for the audited architecture.

The existing Sale endpoint already contains an explicit acknowledgement fallback.

Therefore the cohesive design SHALL use:

1. **normal HU-013 UX at Order creation**;
2. **final Sale revalidation remains authoritative**;
3. if an Order has prior shortage acknowledgement, final Sale MAY allow the resulting negative stock without asking twice;
4. if an Order had no shortage acknowledgement but a new shortage appears only at Sale time, the existing Sale conflict/acknowledgement mechanism remains as an **exceptional concurrency safety fallback**;
5. that fallback MUST not become the normal HU-013 UX.

This satisfies the frozen requirement that negative stock never occurs without explicit acceptance while keeping the normal warning at Order generation.

---

# Problem Statement

Sprint 2 already implements the backend foundations for Order, Sale, Inventory and Shift, but HU-012 remains without frontend checkout and HU-013 currently places its normal shortage acknowledgement at Sale confirmation instead of at Order generation.

The current experience therefore does not match the final approved business flow:

Order draft
→ backend stock check
→ optional explicit acknowledgement
→ Order created without inventory movement
→ Kitchen/Delivery
→ ENTREGADO
→ Checkout
→ atomic Sale + Inventory.

The change must relocate the normal HU-013 decision without weakening the final Sale safeguards and must complete HU-012 without introducing Customer, discounts, printing, fiscal invoicing or standalone sales.

# Goals

- HU-013 MUST perform the normal shortage decision during Order creation.
- Backend MUST remain the stock authority.
- First insufficient unacknowledged Order attempt MUST NOT persist the Order.
- All shortages MUST be returned.
- Acknowledged retry MUST revalidate stock.
- Acknowledged Order creation MUST NOT mutate Inventory.
- Shortage acceptance MUST be auditable.
- No duplicate Order MUST result from the retry.
- HU-012 MUST allow checkout only from Order `ENTREGADO`.
- Sale MUST remain one-per-Order.
- Sale MUST use server-authoritative prices/total.
- Sale MUST use the current operational Shift.
- Sale MUST apply Inventory atomically.
- Sale MUST preserve negative-stock capability only after explicit acknowledgement.
- Produced preparations MUST be decremented as Product stock, not recursively as ingredients.
- Checkout MUST consume actual backend channel/payment rules.
- Checkout MUST omit Customer and discounts.
- `Cancelar cobro` MUST be navigation-only.
- Success MUST display real Sale information.
- Success MUST offer `Volver a pedidos`.
- Sale persistence MUST remain sufficient for future operational-receipt rendering without implementing printing now.
- Existing API routes/verbs SHOULD remain unchanged.
- OpenAPI and generated TypeScript MUST be synchronized only after backend stabilization.
- HU-012 and HU-013 MUST retain separate documentary manifests/evidence.

# Non-Goals

- HU-014 Customers.
- NIT.
- razón social.
- discounts/coupons.
- fiscal invoice.
- CUF/CUIS/CUFD.
- tax API.
- Receipt entity solely for future printing.
- thermal printer.
- ESC/POS.
- PDF ticket.
- browser print workflow.
- payment gateway.
- bank integration.
- generated QR payment.
- PedidosYa API.
- split payment.
- partial payment.
- refunds.
- Sale cancellation.
- standalone/free Sale.
- multiple cash registers.
- tips.
- Table master.
- Inventory reservation subsystem.
- persistent backend Order drafts.
- new global permissions review.
- new SignalR capability.
- unrelated Sprint 2 HUs.

# Affected Areas

Likely affected areas, subject to local preflight:

### Domain

- Order, only if acknowledgement audit fields are absent.

### Application

- Order Create request/result.
- shared stock-shortage read contract.
- SaleDto additive fields.
- shortage ProblemDetails contract/metadata.

### Infrastructure

- OrderService.
- InventoryService or current authoritative inventory read boundary.
- Operations/Sale service.
- ApplicationDbContext only if acknowledgement persistence is needed.
- one additive migration only if required by local baseline.

### API

- existing Order endpoint mapping/error metadata.
- existing Sale endpoint metadata.
- no new route expected.

### Frontend

- orders API/NewOrder flow.
- new/reused shared shortage dialog.
- Sales checkout feature.
- route registration.
- Order detail action.
- generated API types.
- tests.

### Documentation

- HU-012.
- HU-013.
- change OpenSpec.
- individual manifests.
- real evidence only.

# Assumptions

- The locally applied Sprint 2 stabilization change contains the corrected current-Shift resolver and authoritative locked Sale-shortage handling described by the user.
- The current local backend continues to preserve the existing public paths and methods.
- Order quantity remains the same semantic quantity used by current Sale Inventory movements.
- A shortage acknowledgement is general consent to continue despite insufficient stock, not acceptance of a frozen exact shortage snapshot.
- No exact historical Product display-name snapshot is required for the future operational receipt in this MVP; ProductId/OrderItemId plus Sale quantity/prices remain sufficient for business traceability. If the local model already includes a snapshot, it MUST be reused.

# Risks

## Risk: local baseline differs from remote audit

- Probability: High
- Impact: High
- Mitigation: Mandatory read-only local preflight; classify local capabilities before APPLY.

## Risk: rejected Order attempt persists partial Order/Kitchen data

- Probability: Medium
- Impact: Critical
- Mitigation: Shortage decision before Order persistence; PostgreSQL integration test asserts zero Order/OrderItem/KitchenCommand rows.

## Risk: acknowledgement retry creates two Orders

- Probability: Medium
- Impact: High
- Mitigation: first attempt never commits an Order; pending frontend mutation disables double submit; integration tests verify one Order maximum.

## Risk: stock changes between warning and acknowledgement

- Probability: High
- Impact: Medium
- Mitigation: backend rechecks on the second request; acknowledgement is general consent, not a stale shortage token.

## Risk: stock changes after Order creation and before Sale

- Probability: Medium
- Impact: High
- Mitigation: final InventoryWriter lock remains authoritative; exceptional Sale-time acknowledgement fallback retained for previously unacknowledged Orders.

## Risk: duplicate Sale

- Probability: Low
- Impact: Critical
- Mitigation: preserve Order row lock plus existing unique Sale.OrderId constraint and explicit conflict handling.

## Risk: acknowledgement trace introduces unnecessary schema complexity

- Probability: Medium
- Impact: Medium
- Mitigation: use only nullable actor/time fields if local baseline lacks equivalent; no snapshot/event subsystem.

## Risk: typed shortage errors diverge between Order and Sale

- Probability: Medium
- Impact: High
- Mitigation: use one shared shortage DTO/predicate and ProblemDetails extension shape.

## Risk: channel/payment UI permits invalid combinations

- Probability: Medium
- Impact: Medium
- Mitigation: derive UI options from current enums/business validation and keep backend validation authoritative.

## Risk: mockups introduce Customer/discount/cash-register scope

- Probability: Medium
- Impact: High
- Mitigation: explicit visual KEEP/ADAPT/OMIT matrix in design.

## Risk: Sale response is insufficient for truthful success UI

- Probability: High in remote baseline
- Impact: Medium
- Mitigation: additive SaleDto fields from already persisted data; no new endpoint/migration.

## Risk: future receipt requirement causes premature modeling

- Probability: Medium
- Impact: Medium
- Mitigation: treat Sale as historical source; no Receipt/Printer entities in this change.

# Rollback Strategy

If the change must be reversed:

- remove frontend checkout route/feature;
- remove Order shortage modal/retry handling;
- restore CreateOrder public request without the additive acknowledgement property;
- restore previous Order Create service behavior;
- remove additive SaleDto output fields;
- revert the acknowledgement migration only using the project's normal migration strategy and only if it was actually created/applied.

Rollback MUST NOT:

- delete existing Orders;
- delete Sales;
- alter Inventory history;
- remove current Sprint 2 tables;
- modify historical migrations;
- introduce a new stock system.

If acknowledgement columns contain production data by the time rollback is considered, rollback becomes a destructive-data concern and requires explicit human review.

# Success Criteria

- Normal HU-013 warning occurs during Order creation.
- First unacknowledged shortage returns structured 409 and persists no Order.
- All shortage lines are returned.
- Shortage magnitude is positive.
- Retry sends explicit acknowledgement.
- Backend revalidates on retry.
- Exactly one Order is created.
- No InventoryMovement is created by Order creation.
- Acceptance is traceable by authenticated actor/time when it actually authorizes an insufficient Order.
- Order/Kitchen flow after creation remains unchanged.
- Only ENTREGADO Order can be sold.
- Duplicate Sale is rejected.
- Sale total is server-authoritative.
- Sale uses correct operational Shift.
- Sale Inventory transaction remains atomic.
- Previously acknowledged Order can complete Sale with negative Inventory when required.
- Newly appearing Sale-time shortage requires explicit exceptional acknowledgement.
- Direct sale channel/payment combinations obey real backend rules.
- Customer UI is absent.
- Discount UI is absent.
- Fake `Caja 1` is absent.
- Success copy does not claim a receipt was generated.
- Success primary action returns to Orders.
- Cancel checkout performs zero backend mutations.
- OpenAPI runtime and generated TypeScript reflect final contracts.
- Backend tests, frontend tests and all real quality gates finish with zero failures.
- HU-012 and HU-013 documentation remain independently traceable.
