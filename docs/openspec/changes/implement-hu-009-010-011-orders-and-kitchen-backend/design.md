# Design

## 1. Purpose

This document defines the implementation design for the backend-only change:

`implement-hu-009-010-011-orders-and-kitchen-backend`

It covers, in one cohesive backend change:

- HU-009 — Registrar y gestionar pedidos.
- HU-010 — Generar y gestionar comandas de cocina.
- HU-011 — Cancelar pedido antes de que esté listo.

The design intentionally freezes the operational behavior required for APPLY so the implementation agent can proceed autonomously without reopening already-decided product questions.

This change does **not** complete the three user stories end-to-end. The expected status after implementation is:

- HU-009: backend complete / frontend pending.
- HU-010: backend complete / frontend pending.
- HU-011: backend complete / frontend pending.

The frontend for Orders/Kitchen/KDS, generated TypeScript contract, responsive UX, realtime consumption and visual evidence belong to the following frontend change.

---

## 2. Repository Adaptation Principle

APPLY MUST begin with a repository preflight against the real current branch/baseline.

The design decisions in this document are fixed product and architecture decisions. Exact class names, file locations, fixture names and implementation helper names MAY adapt to the repository as long as the behavior and contracts defined here remain unchanged.

Repository facts that MUST be inspected before implementation include:

1. current `develop`-derived HEAD;
2. latest EF Core migration and model snapshot;
3. whether `Product.IsSellable` already exists;
4. whether `Shift` already exists;
5. whether a real active operational Shift resolver already exists;
6. exact current `User ↔ Employee` mapping;
7. current role/policy infrastructure;
8. current `PagedResponse`/pagination conventions;
9. current ProblemDetails conventions;
10. current SignalR hub/notifier pattern;
11. current PostgreSQL integration-test fixtures.

These are adaptation points, not human product blockers.

The implementation MUST NOT duplicate existing infrastructure merely because names differ from this design.

---

## 3. Components Touched

### 3.1 Domain

Add or extend the Orders/Kitchen capabilities:

- `Order`.
- `OrderItem`.
- `KitchenCommand`.
- `KitchenCommandItem`.
- `OrderStatus`.
- `KitchenCommandStatus`.
- state/aggregate invariants where consistent with the current Domain style.

Potential minimal Catalog evolution:

- `Product.IsSellable`, **only if it is still absent at APPLY preflight**.

Domain MUST NOT depend on ASP.NET Core, SignalR, EF Core or HTTP concepts.

### 3.2 Application

Add contracts/use cases/services for:

- Order creation.
- Order list/detail.
- waiter assignment/reassignment.
- waiter take/claim.
- delivery.
- Order cancellation.
- Kitchen command list/detail.
- Kitchen start.
- Kitchen ready.
- Kitchen cancellation.
- actor/ownership resolution model.
- pagination/filter models.
- DTO/read models.
- realtime notifier abstraction such as `IKitchenRealtimeNotifier` or the repository-equivalent abstraction.

Application MUST contain the business decisions for:

- legal state transitions;
- ownership;
- assignment;
- cancellation;
- synchronization;
- idempotency classification.

These decisions MUST NOT exist only in the API endpoint layer.

### 3.3 Infrastructure

Add or extend:

- EF Core mappings.
- row-lock-aware persistence methods.
- transaction orchestration support.
- migration and model snapshot.
- Product compatibility migration if required.
- SignalR notifier adapter if the current layering places it in Infrastructure.
- efficient read projections.

Infrastructure MUST encapsulate provider-specific locking details.

Application MUST NOT embed Npgsql SQL details.

### 3.4 API

Add or extend:

- authorization policies.
- Orders REST endpoints.
- Kitchen REST endpoints.
- authenticated `/hubs/kitchen`.
- ProblemDetails mappings.
- OpenAPI metadata.
- SignalR registration/authorization only if not already present.

### 3.5 Tests

Add or extend:

- pure Domain/Application tests where useful;
- PostgreSQL integration tests;
- API authorization/contract tests;
- concurrency/race tests;
- notifier/SignalR tests;
- migration validation;
- full backend regression.

EF InMemory MUST NOT be used as evidence for transaction, constraint, row-lock or race behavior.

---

## 4. Architectural Boundaries

The following boundaries are mandatory:

- Domain MUST NOT depend on ASP.NET Core.
- Application MUST NOT depend directly on `HubContext`.
- Application SHOULD depend on a notifier abstraction.
- SignalR implementation belongs to an external boundary consistent with the current architecture.
- REST remains the source of truth for business state.
- SignalR is notification/invalidation only.
- authenticated Identity `UserId` is used for actor/audit identity.
- `EmployeeId` is used for waiter operational responsibility.
- `UserId` and `EmployeeId` MUST NOT be treated as interchangeable.
- Product price is authoritative server-side.
- Order MUST NOT become Sale.
- Customer MUST NOT be attached directly to Order in this change.
- Shift absence MUST NOT cause HU-025 to be implemented.
- Order creation/cancellation MUST NOT mutate inventory.
- persistent invariants MUST be protected by DB constraints where reasonable even when Application also validates them.

---

## 5. Human Decisions — Frozen

| Decision | Frozen behavior |
| --- | --- |
| Change scope | One backend-only change for HU-009/010/011 |
| Order states | `PENDIENTE`, `EN_PREPARACION`, `LISTO`, `ENTREGADO`, `CANCELADO` |
| Kitchen states | `PENDIENTE`, `EN_PREPARACION`, `LISTA`, `CANCELADA` |
| No-KITCHEN order | Created directly as `LISTO` |
| Command generation | Only when at least one line has `preparationArea = KITCHEN` |
| Command items | Only KITCHEN OrderItems |
| BAR/NONE | No command/KDS flow in this change |
| Mixed order | Kitchen command governs global culinary readiness |
| Shift | Reuse only if real lifecycle/resolver exists; otherwise `ShiftId` remains nullable |
| Customer | Related later through Sale, not Order |
| Price | Server-side Product sale-price snapshot |
| Quantity | Decimal |
| Duplicate product | One Product per Order; duplicate request ProductId rejected |
| Order content editing | Out of scope after creation |
| Mesero visibility | Any MESERO can read all Orders |
| Mesero creator | Autoassigned when an active linked Employee is available |
| Admin assignment | ADMINISTRADOR may assign/reassign non-terminal Orders |
| Encargado assignment | No, unless the actor also has ADMINISTRADOR |
| Waiter take | MESERO may claim an unassigned non-terminal Order |
| Release/unassign | Not supported |
| Mesero mutation scope | Own assigned Orders only |
| Delivery | Explicit Order transition |
| Kitchen mutation | Kitchen actors mutate Command, not generic Order culinary states |
| Cancellation | Order + Command cancellation is atomic when Command exists |
| Concurrency | PostgreSQL row-level locking |
| Lock order | Order first, then KitchenCommand |
| Idempotency | State-target retries are idempotent only after authorization/ownership |
| SignalR | Publish only after successful DB commit |
| Inventory | No movement/reservation/decrement |
| Frontend | Not modified in this change |
| Generated TypeScript | Not regenerated in this change |

---

## 6. Domain Model

### 6.1 Order

| Field | Type | Rules |
| --- | --- | --- |
| `Id` | `Guid` | Primary key |
| `ShiftId` | `Guid?` | Nullable unless a real active Shift lifecycle is available |
| `WaiterEmployeeId` | `Guid?` | Nullable FK/reference to Employee when available |
| `TableReference` | `string?` | Max 50 |
| `Status` | `OrderStatus` | Exact enum values only |
| `Notes` | `string?` | Max 500 |
| `CreatedAt` | `DateTimeOffset` | Server authority |
| `CreatedByUserId` | Identity key type | Authenticated User |
| `UpdatedAt` | `DateTimeOffset?` | Server authority |
| `UpdatedByUserId` | Identity key type? | Authenticated User |
| `CancelledAt` | `DateTimeOffset?` | Server authority |
| `CancelledByUserId` | Identity key type? | Authenticated User |
| `CancellationReason` | `string?` | Optional, max 500 |

Explicitly absent:

- `CustomerId`.
- persisted `Total`.
- payment fields.
- inventory fields.

### 6.2 OrderItem

| Field | Type | Rules |
| --- | --- | --- |
| `Id` | `Guid` | Primary key |
| `OrderId` | `Guid` | Required parent |
| `ProductId` | `Guid` | Required Product |
| `Quantity` | `decimal` | `numeric(14,4)`, `> 0` |
| `UnitPrice` | `decimal` | Product sale-price snapshot, `>= 0` |
| `Notes` | `string?` | Max 300 |
| `CreatedAt` | `DateTimeOffset` | Server authority |

Persistent uniqueness:

`UNIQUE(order_id, product_id)`.

One product is represented by one OrderItem. If two units need different preparation detail, quantity is consolidated and the distinction is expressed in `notes`.

### 6.3 KitchenCommand

| Field | Type | Rules |
| --- | --- | --- |
| `Id` | `Guid` | Primary key |
| `OrderId` | `Guid` | Required and unique |
| `Status` | `KitchenCommandStatus` | Exact enum values |
| `CreatedAt` | `DateTimeOffset` | Server |
| `StartedAt` | `DateTimeOffset?` | Set on actual start only |
| `ReadyAt` | `DateTimeOffset?` | Set on actual ready only |
| `CancelledAt` | `DateTimeOffset?` | Set on actual cancellation only |
| `UpdatedByUserId` | Identity key type? | Actor of the last actual transition |

One Order can have at most one KitchenCommand.

### 6.4 KitchenCommandItem

| Field | Type | Rules |
| --- | --- | --- |
| `Id` | `Guid` | Primary key |
| `KitchenCommandId` | `Guid` | Required |
| `OrderItemId` | `Guid` | Required |
| `CreatedAt` | `DateTimeOffset` | Server |

Persistent uniqueness:

`UNIQUE(kitchen_command_id, order_item_id)`.

No duplicated financial fields are persisted here.

---

## 7. Order Lifecycle

### 7.1 Order with KitchenCommand

```text
Create
  ↓
PENDIENTE
  ↓ KitchenCommand start
EN_PREPARACION
  ↓ KitchenCommand ready
LISTO
  ↓ deliver
ENTREGADO
```

Cancellation is allowed only from:

```text
PENDIENTE      → CANCELADO
EN_PREPARACION → CANCELADO
```

Normal cancellation from `LISTO` or `ENTREGADO` is forbidden.

### 7.2 Order without KitchenCommand

If no requested product has `preparationArea = KITCHEN`:

```text
Create
  ↓
LISTO
  ↓ deliver
ENTREGADO
```

No KitchenCommand is created.

This Order is immediately operationally ready. No inventory check/decrement is introduced.

Because it is already `LISTO`, ordinary cancellation is not allowed.

---

## 8. KitchenCommand Lifecycle

```text
Create
  ↓
PENDIENTE
  ↓ start
EN_PREPARACION
  ↓ ready
LISTA
```

Cancellation:

```text
PENDIENTE      → CANCELADA
EN_PREPARACION → CANCELADA
```

`LISTA → CANCELADA` is forbidden.

---

## 9. Order ↔ KitchenCommand Consistency

When an Order has a KitchenCommand, the following are the only normal coherent pairs:

| Order | KitchenCommand |
| --- | --- |
| `PENDIENTE` | `PENDIENTE` |
| `EN_PREPARACION` | `EN_PREPARACION` |
| `LISTO` | `LISTA` |
| `ENTREGADO` | `LISTA` |
| `CANCELADO` | `CANCELADA` |

For Orders without KitchenCommand, the normal states are:

- `LISTO`.
- `ENTREGADO`.

Application MUST NOT silently repair an unexpected persisted Order/Command pair.

If a mutation detects a pair outside the allowed coherent combinations:

- reject with `409`;
- use a stable business conflict code where supported;
- log a technical integrity warning;
- leave persistence unchanged.

### 9.1 Kitchen start synchronization

Required source pair:

- Order `PENDIENTE`.
- Command `PENDIENTE`.

Atomic target pair:

- Order `EN_PREPARACION`.
- Command `EN_PREPARACION`.

Also set:

- `StartedAt`.
- appropriate audit actor.

### 9.2 Kitchen ready synchronization

Required source pair:

- Order `EN_PREPARACION`.
- Command `EN_PREPARACION`.

Atomic target pair:

- Order `LISTO`.
- Command `LISTA`.

Also set:

- `ReadyAt`.
- appropriate audit actor.

### 9.3 Delivery with Command

Delivery changes only:

- Order `LISTO → ENTREGADO`.

The Command remains:

- `LISTA`.

This produces the coherent `ENTREGADO/LISTA` pair.

---

## 10. Actor Model and Multi-role Semantics

Application SHOULD receive a server-derived actor representation equivalent to:

- authenticated `UserId`;
- current role set;
- optionally resolved `EmployeeId`;
- current Employee operational state where needed.

No actor information is accepted from request bodies.

Role permissions are a union.

A narrower role MUST NOT remove capabilities granted by a broader role.

Examples:

- `MESERO + ENCARGADO` receives ENCARGADO global Order operation scope and MESERO take capability.
- `MESERO + ADMINISTRADOR` receives ADMINISTRADOR assignment capability plus MESERO take capability.

### 10.1 Global Order operator

An actor has global Order mutation scope when they have:

- `ADMINISTRADOR`, or
- `ENCARGADO`.

Global scope here refers only to operations granted in the authorization matrix; it does not grant admin waiter assignment to ENCARGADO.

### 10.2 Own-order waiter operator

A MESERO-only operation requiring waiter ownership MUST resolve:

- the authenticated User;
- its linked Employee;
- Employee active/operational state.

The Order is owned by that waiter only when:

`Order.WaiterEmployeeId == actor.EmployeeId`.

### 10.3 Kitchen manager

Any actor with at least one of:

- `ADMINISTRADOR`;
- `ENCARGADO`;
- `COCINA`;

may perform Kitchen state-management operations.

MESERO alone has Kitchen read-only access.

---

## 11. MESERO Without an Operational Employee

If an actor relies on the `MESERO` permission and no active Employee linked to the authenticated User can be resolved:

- create as MESERO-only → `409 ACTOR_EMPLOYEE_UNAVAILABLE`;
- take → `409 ACTOR_EMPLOYEE_UNAVAILABLE`;
- own deliver → `409 ACTOR_EMPLOYEE_UNAVAILABLE`;
- own cancel → `409 ACTOR_EMPLOYEE_UNAVAILABLE`.

An actor that also has a broader role MAY still use the broader role's capabilities where the authorization matrix allows it.

Examples:

- `ADMINISTRADOR + MESERO` without active Employee MAY create an unassigned Order using ADMINISTRADOR authority.
- `ENCARGADO + MESERO` without active Employee MAY create an unassigned Order using ENCARGADO authority.
- MESERO-only without active Employee cannot create an operational waiter-owned Order.

This rule preserves role union without pretending that a missing Employee relation is a waiter identity.

---

## 12. Waiter Assignment and Claim Semantics

### 12.1 Create-time assignment

If creator has role MESERO **and** an active linked Employee is successfully resolved:

- autoassign `WaiterEmployeeId = actor.EmployeeId`.

If no operational Employee can be resolved but actor also has ADMINISTRADOR or ENCARGADO:

- create may proceed unassigned under the broader role.

If actor is MESERO-only and no operational Employee exists:

- creation fails with `409 ACTOR_EMPLOYEE_UNAVAILABLE`.

If creator does not have MESERO but has ADMINISTRADOR or ENCARGADO:

- create unassigned.

### 12.2 Admin assignment endpoint

Selected resource contract:

`PUT /api/v1/orders/{id}/assignment`

Request:

```json
{
  "waiterEmployeeId": "guid"
}
```

Authorization:

- ADMINISTRADOR only.

No unassign operation exists.

The target waiter MUST:

1. exist as Employee;
2. be active/operational;
3. be linked to an Identity User;
4. have MESERO among the linked User's roles;
5. have an active account if the current baseline exposes account activation as an authoritative concept.

If the baseline does not expose one of those concepts, implementation adapts to the strongest equivalent real repository invariant and documents it.

Invalid target:

- `400` for malformed input;
- controlled business failure for ineligible target, using the project's established 400/409 convention and the stable `WAITER_NOT_ELIGIBLE` code where supported.

### 12.3 Assignment/reassignment allowed states

ADMINISTRADOR MAY assign/reassign when Order is:

- `PENDIENTE`;
- `EN_PREPARACION`;
- `LISTO`.

ADMINISTRADOR MUST NOT assign/reassign when Order is:

- `ENTREGADO`;
- `CANCELADO`.

Terminal assignment attempts return `409 ORDER_ASSIGNMENT_TERMINAL`.

Setting the same waiter again on a **non-terminal** Order is idempotent.

Terminal protection takes precedence over idempotent same-value assignment.

### 12.4 Waiter take endpoint

`POST /api/v1/orders/{id}/take`

No body.

The waiter is always derived from the authenticated actor.

Allowed source states:

- `PENDIENTE`;
- `EN_PREPARACION`;
- `LISTO`.

This explicitly allows a no-KITCHEN Order, which is created directly as `LISTO`, to be claimed before delivery.

Forbidden states:

- `ENTREGADO`;
- `CANCELADO`.

Terminal take attempts return `409`.

Rules under Order row lock:

- unassigned → assign current waiter and succeed;
- already assigned to current waiter, non-terminal → idempotent success;
- assigned to another waiter → `409 ORDER_ALREADY_ASSIGNED`;
- terminal → `409`.

There is no release/unassign operation.

### 12.5 Assignment races

Both admin assignment and waiter take lock the Order row.

#### Waiter vs waiter

Two waiters taking an unassigned Order:

- first committed claim wins;
- second sees the committed assignment after lock acquisition;
- second receives `409`.

Exactly one waiter becomes assigned.

#### Admin assignment vs waiter take

Both serialize on the Order row.

If admin assignment commits first:

- waiter sees the Order assigned to another waiter;
- waiter receives `409`.

If waiter take commits first:

- ADMINISTRADOR may subsequently reassign because admin reassign is allowed for a non-terminal Order.

This is accepted serialized behavior.

---

## 13. Authorization Matrix

| Operation | ADMINISTRADOR | ENCARGADO | MESERO | COCINA |
| --- | ---: | ---: | ---: | ---: |
| POST Order | yes | yes | yes | no |
| GET Orders | yes | yes | yes | no |
| GET Order detail | yes | yes | yes | no |
| PUT assignment | yes | no | no | no |
| POST take | only if also MESERO | only if also MESERO | yes | no |
| POST deliver | global | global | own | no |
| POST Order cancel | global | global | own | no |
| GET Kitchen commands | yes | yes | yes | yes |
| GET Kitchen detail | yes | yes | yes | yes |
| POST Kitchen start | yes | yes | no | yes |
| POST Kitchen ready | yes | yes | no | yes |
| POST Kitchen cancel | yes | yes | no | yes |
| Kitchen Hub | yes | yes | yes | yes |

`CONTADORA`-only and `EMPLEADO`-only have no access.

Multi-role authorization is the union of granted permissions.

---

## 14. Authorization Precedence Over Idempotency

Authentication, role authorization, target-scope authorization and waiter ownership MUST be validated before granting an idempotent no-op response.

Idempotency MUST NOT become an authorization bypass.

Examples:

- another MESERO delivering an already `ENTREGADO` Order → `403`;
- another MESERO cancelling an already `CANCELADO` Order → `403`;
- assigned MESERO repeating deliver on their own `ENTREGADO` Order → `200`, unchanged;
- ENCARGADO/ADMIN repeating authorized deliver on `ENTREGADO` → `200`, unchanged;
- authorized Kitchen actor repeating ready on coherent `LISTO/LISTA` pair → `200`, unchanged.

For assignment/take, terminal-state restrictions also take precedence over same-target idempotency.

---

## 15. Request Contracts

Exact C# record/class naming SHOULD follow repository conventions while preserving these HTTP schemas.

### 15.1 CreateOrderRequest

```text
tableReference?: string max 50
notes?: string max 500
items: CreateOrderItemRequest[] minimum 1
```

### 15.2 CreateOrderItemRequest

```text
productId: Guid
quantity: decimal > 0
notes?: string max 300
```

The request MUST NOT accept:

- status;
- unitPrice;
- lineTotal;
- total;
- customerId;
- waiterEmployeeId;
- ShiftId supplied by the client;
- created/updated/cancelled actor IDs;
- timestamps.

Duplicate `productId` values in `items` are rejected with validation error.

The client is expected to consolidate quantity into a single line and express per-unit preparation differences in notes.

### 15.3 AssignOrderRequest

```text
waiterEmployeeId: Guid
```

### 15.4 CancelOrderRequest

```text
reason?: string max 500
```

The same shape MAY be reused for Kitchen cancellation if doing so matches repository conventions.

---

## 16. Product Validation and Price Snapshot

Order create MUST validate each requested Product using one bounded Product query rather than one query per line.

After duplicate ProductIds are rejected:

- every requested ProductId MUST resolve;
- Product MUST be active;
- Product MUST be sellable;
- Product sale price MUST be non-null;
- sale price MUST be `>= 0`;
- preparation area MUST be a supported value.

Supported preparation areas for this change:

- `KITCHEN`;
- `BAR`;
- `NONE`.

Preparation-area interpretation MUST be centralized rather than repeated as arbitrary magic-string comparisons across services.

### 16.1 Price snapshot

`OrderItem.UnitPrice` is copied from the Product sale price read by the server during creation.

The client never supplies price.

No persisted Order total exists.

Computed values:

```text
lineTotal = quantity * unitPrice
total = Σ lineTotal
```

Use decimal arithmetic only.

No additional rounding rule is introduced beyond the actual Product money precision already used by the project.

### 16.2 Product.IsSellable compatibility

If `Product.IsSellable` already exists:

- reuse it.

If it is absent at APPLY preflight:

1. inspect current Product semantics and DevelopmentDataSeeder;
2. introduce the minimal `IsSellable` property/mapping/backend contract required by this change;
3. use a safe DB default;
4. do **not** infer all historical products as sellable;
5. do **not** run a blanket production-data backfill to true without evidence;
6. explicitly mark only known development/test products as sellable when their existing semantics already establish that they are sellable.

This is a repository adaptation task, not a human product decision.

---

## 17. Create Order Transaction Boundary

Pure request validation SHOULD happen before opening the DB transaction where possible:

- required fields;
- max lengths;
- non-empty items;
- positive quantities;
- duplicate ProductIds;
- syntactic filter/enum validity.

The authoritative Product read used for:

- existence;
- active state;
- sellability;
- sale-price snapshot;
- preparation area;

MUST occur inside the creation transaction.

No Product row lock is required for this MVP. The values actually read inside the transaction are the values snapshotted into the new OrderItems.

Conceptual sequence:

```text
validate pure request shape
        ↓
resolve authenticated actor / basic role
        ↓
BEGIN TRANSACTION
        ↓
load all requested Products in one bounded query
        ↓
validate Product eligibility
        ↓
resolve active Shift only if a real Shift lifecycle exists
        ↓
resolve create-time waiter assignment
        ↓
create Order
        ↓
create OrderItems with server price snapshots
        ↓
classify KITCHEN OrderItems
        ↓
if KITCHEN exists:
    Order = PENDIENTE
    create KitchenCommand = PENDIENTE
    create KitchenCommandItems for KITCHEN lines only
else:
    Order = LISTO
        ↓
SAVE
        ↓
COMMIT
        ↓
if Command was created:
    publish KitchenCommandCreated
```

The aggregate must not be partially persisted.

SignalR MUST NOT be published before commit.

---

## 18. Shift Compatibility Strategy

APPLY preflight MUST inspect Shift truth.

### 18.1 Shift and active resolver both exist

If a real Shift entity/table and a real operational active-Shift resolver exist:

- reuse them;
- resolve Shift server-side;
- do not accept ShiftId from CreateOrderRequest;
- use the repository's intended required/nullable mapping based on the real existing foundation.

### 18.2 Shift exists but lifecycle/resolver does not

If Shift storage exists but there is no real operational lifecycle/resolver:

- `Order.ShiftId` remains nullable;
- keep a nullable FK if the real Shift table/entity exists and the current model supports it;
- do not invent a current Shift.

### 18.3 Shift does not exist

If Shift does not exist:

- `Order.ShiftId` remains nullable;
- map it as a nullable scalar without an invalid FK to a non-existent table/entity.

Document:

`nullable until shift lifecycle is implemented`.

Forbidden in this change:

- fake Shift entity;
- seeded fake active Shift;
- Shift opening;
- Shift closing;
- CashSession;
- HU-025 implementation.

---

## 19. Response Contracts

Exact C# naming MAY follow repository conventions.

### 19.1 OrderDto

The frontend handoff requires, at minimum:

- `id`;
- `shiftId?`;
- `waiterEmployeeId?`;
- `waiterName?`;
- `tableReference?`;
- `status`;
- `notes?`;
- `createdAt`;
- `createdByUserId`;
- `updatedAt?`;
- `updatedByUserId?`;
- `cancelledAt?`;
- `cancelledByUserId?`;
- `cancelledByDisplayName?`;
- `cancellationReason?`;
- `hasKitchenCommand`;
- `kitchenCommandId?`;
- `items`;
- calculated `total`.

### 19.2 Cancellation display name

`CancelledByUserId` remains the audit identity.

`cancelledByDisplayName` is a read-model projection for human display.

Resolution order:

1. linked Employee full/display name for `CancelledByUserId`, when available;
2. otherwise a safe current username/display identifier from the Identity User;
3. null when the Order is not cancelled.

The display name is **not** persisted as historical duplicate text in this change.

### 19.3 OrderItemDto

- `id`;
- `productId`;
- `productName`;
- `quantity`;
- `unitPrice`;
- calculated `lineTotal`;
- `notes?`;
- `preparationArea`.

Product name is read from the Product relation unless the real existing model already snapshots names. This change does not introduce a new product-name snapshot requirement.

### 19.4 KitchenCommandDto

Kitchen-safe fields only:

- `id`;
- `orderId`;
- `status`;
- `tableReference?`;
- `orderNotes?`;
- `createdAt`;
- `startedAt?`;
- `readyAt?`;
- `cancelledAt?`;
- `items`.

### 19.5 KitchenCommandItemDto

- `orderItemId`;
- `productId`;
- `productName`;
- `quantity`;
- `notes?`.

Kitchen responses MUST NOT expose:

- `unitPrice`;
- `lineTotal`;
- Order total;
- customer;
- inventory balance;
- payment/cash data;
- Identity internals.

---

## 20. Endpoint Matrix

| Method | Route | Purpose | Roles | Success |
| --- | --- | --- | --- | --- |
| POST | `/api/v1/orders` | Create Order | MESERO / ENCARGADO / ADMINISTRADOR | `201 OrderDto` |
| GET | `/api/v1/orders` | List Orders | MESERO / ENCARGADO / ADMINISTRADOR | `200 PagedResponse<OrderDto>` |
| GET | `/api/v1/orders/{id}` | Order detail | MESERO / ENCARGADO / ADMINISTRADOR | `200 OrderDto` |
| PUT | `/api/v1/orders/{id}/assignment` | Assign/reassign waiter | ADMINISTRADOR | `200 OrderDto` |
| POST | `/api/v1/orders/{id}/take` | Claim unassigned Order | MESERO | `200 OrderDto` |
| POST | `/api/v1/orders/{id}/deliver` | Mark delivered | MESERO own / ENCARGADO / ADMINISTRADOR | `200 OrderDto` |
| POST | `/api/v1/orders/{id}/cancel` | Cancel Order | MESERO own / ENCARGADO / ADMINISTRADOR | `200 OrderDto` |
| GET | `/api/v1/kitchen/commands` | List Kitchen commands | COCINA / MESERO / ENCARGADO / ADMINISTRADOR | `200 PagedResponse<KitchenCommandDto>` |
| GET | `/api/v1/kitchen/commands/{id}` | Kitchen detail | same | `200 KitchenCommandDto` |
| POST | `/api/v1/kitchen/commands/{id}/start` | Start preparation | COCINA / ENCARGADO / ADMINISTRADOR | `200 KitchenCommandDto` |
| POST | `/api/v1/kitchen/commands/{id}/ready` | Mark ready | COCINA / ENCARGADO / ADMINISTRADOR | `200 KitchenCommandDto` |
| POST | `/api/v1/kitchen/commands/{id}/cancel` | Cancel Command + Order | COCINA / ENCARGADO / ADMINISTRADOR | `200 KitchenCommandDto` or repository-equivalent mutation response |

Explicitly absent:

- generic `PUT /status`;
- Order `start-preparation`;
- Order `ready`;
- Order edit;
- Order delete;
- waiter release;
- customer assignment;
- sale/payment endpoint.

---

## 21. Pagination and Filters

### 21.1 Orders

`GET /api/v1/orders`

Parameters:

- `page`, default `1`;
- `pageSize`, default `10`, max `100`;
- `status?`;
- `search?`.

Search scope for this change:

- `tableReference`.

Default sort:

- `createdAt DESC`;
- `id DESC` as stable tie-breaker.

MESERO sees **all** Orders, not only owned Orders.

### 21.2 Kitchen commands

`GET /api/v1/kitchen/commands`

Parameters:

- `page`, default `1`;
- `pageSize`, default `10`, max `100`;
- `status?`.

No status filter means all commands are queryable.

Default sort:

- `createdAt ASC`;
- `id ASC` as stable tie-breaker.

The frontend may later request only active states.

---

## 22. Read Query Strategy

Paging MUST operate on aggregate roots, not multiplied joined rows.

### 22.1 Orders list

Recommended shape:

1. apply Order filters;
2. obtain total count;
3. page/order the Order roots or Order IDs;
4. project bounded waiter/command metadata;
5. load OrderItem/Product projections for the selected page in a bounded query;
6. compose DTOs.

An equivalent single projection is acceptable only if generated SQL preserves correct pagination and count semantics.

Avoid obvious N+1 Product/item queries.

### 22.2 Kitchen list

Recommended shape:

1. page KitchenCommand roots;
2. load bounded KitchenCommandItem/OrderItem/Product projections for that page;
3. compose kitchen-safe DTOs.

Do not join financial projections into Kitchen read models.

---

## 23. Transaction and Lock Infrastructure

Application business decisions MUST NOT rely only on previously tracked snapshots.

Infrastructure SHOULD expose narrow lock-aware operations equivalent to:

- `LockOrderAsync(id)`;
- `LockKitchenCommandAsync(id)`.

Preferred PostgreSQL primitive:

`SELECT ... FOR UPDATE`

or an equivalent row-level locking implementation that produces the same semantics.

Provider-specific SQL belongs outside Application.

No:

- ETag requirement;
- frontend concurrency token;
- distributed lock.

### 23.1 Stable lock protocol

Every mutation that may touch both Order and KitchenCommand MUST acquire locks in this order:

1. Order.
2. KitchenCommand.

Never reverse this order.

If a Kitchen endpoint receives only CommandId, a preliminary **non-locking** lookup to discover OrderId is permitted.

Mutation decisions MUST begin only after the required rows are locked and re-read.

### 23.2 Order-only operations

The following normally require only the Order lock:

- waiter take;
- admin assignment/reassignment;
- delivery.

### 23.3 Create

No row lock is required for a new Order aggregate, but creation is transactional.

---

## 24. Idempotency Model

Create Order is not globally idempotent.

No Idempotency-Key is introduced.

Two identical create requests may produce two Orders.

State-target operations distinguish:

- `Changed`;
- `AlreadyAtTarget`;
- `Conflict`.

Only `Changed` may:

- set a new transition timestamp;
- set a new update actor;
- publish a new SignalR event.

`AlreadyAtTarget` returns the current DTO unchanged.

### 24.1 Idempotent state-target cases

Subject to prior authorization/ownership and terminal rules:

- take by the same waiter on a non-terminal Order;
- assignment to the same waiter on a non-terminal Order;
- start when pair is already `EN_PREPARACION/EN_PREPARACION`;
- ready when pair is already `LISTO/LISTA`;
- deliver when Order is already `ENTREGADO`;
- cancel when Order/Command are already coherently cancelled.

### 24.2 Cancellation idempotency

A repeated authorized cancellation against an already coherently cancelled resource:

- returns current state;
- preserves original cancellation actor;
- preserves original cancellation reason;
- preserves original cancellation timestamp;
- emits no second realtime event.

Cancellation retry MUST NOT be used to rewrite historical reason/actor.

### 24.3 Invalid transition

A regression, skip or incompatible target returns `409`.

---

## 25. Deliver Transaction

`POST /orders/{id}/deliver`

Sequence:

1. authenticate/authorize role;
2. begin transaction;
3. lock Order;
4. resolve/validate MESERO ownership if the operation relies on MESERO scope;
5. apply authorization-before-idempotency rule;
6. if `LISTO`:
   - set `ENTREGADO`;
   - update server audit fields;
7. if already `ENTREGADO` and caller is authorized:
   - no-op idempotent;
8. otherwise:
   - `409`;
9. save/commit only if changed.

No Kitchen mutation.

No Sale.

No inventory movement.

---

## 26. Kitchen Start Transaction

Conceptual flow:

```text
resolve Command → OrderId without mutation
        ↓
BEGIN TRANSACTION
        ↓
lock Order
        ↓
lock KitchenCommand
        ↓
re-read and validate relationship
        ↓
validate coherent source/target
        ↓
if PENDIENTE/PENDIENTE:
    Order → EN_PREPARACION
    Command → EN_PREPARACION
    StartedAt = server time
    UpdatedBy = actor
elif already EN_PREPARACION/EN_PREPARACION:
    idempotent no-op
else:
    409
        ↓
SAVE if changed
        ↓
COMMIT
        ↓
publish KitchenCommandUpdated only if changed
```

No direct Order culinary-state endpoint exists.

---

## 27. Kitchen Ready Transaction

Same lock protocol:

1. preliminary Command→OrderId lookup;
2. begin transaction;
3. lock Order;
4. lock Command;
5. re-read coherent pair.

Required source:

- Order `EN_PREPARACION`;
- Command `EN_PREPARACION`.

Target:

- Order `LISTO`;
- Command `LISTA`.

Set:

- `ReadyAt`;
- update actor.

Already `LISTO/LISTA`:

- authorized idempotent `200`, no event.

Any other incompatible pair:

- `409`.

Publish `KitchenCommandUpdated` only after successful commit and only when changed.

---

## 28. Order Cancellation Transaction

`POST /api/v1/orders/{id}/cancel`

Authorization:

- MESERO on own assigned Order;
- ENCARGADO globally;
- ADMINISTRADOR globally.

Conceptual sequence:

1. authenticate/authorize role;
2. begin transaction;
3. lock Order;
4. resolve and lock Command if it exists;
5. validate caller ownership/scope;
6. apply authorization-before-idempotency;
7. validate coherent state pair;
8. if already coherently cancelled:
   - return unchanged;
9. otherwise Order must be `PENDIENTE` or `EN_PREPARACION`;
10. if Command exists, it must be the corresponding active state;
11. set Order:
    - `CANCELADO`;
    - `CancelledAt`;
    - `CancelledByUserId`;
    - optional `CancellationReason`;
    - update audit;
12. if Command exists:
    - set `CANCELADA`;
    - `CancelledAt`;
    - `UpdatedByUserId`;
13. save;
14. commit;
15. if a Command actually changed:
    - publish `KitchenCommandCancelled`.

If Order is `LISTO` or `ENTREGADO`:

- `409`.

If Command is `LISTA`:

- cancellation is forbidden and returns `409`.

No partial Order/Command cancellation is allowed.

---

## 29. Kitchen Cancellation Transaction

`POST /api/v1/kitchen/commands/{id}/cancel`

Authorization:

- COCINA;
- ENCARGADO;
- ADMINISTRADOR.

MESERO is denied for Kitchen mutation.

Use the same stable lock order:

1. preliminary Command→OrderId lookup;
2. begin transaction;
3. lock Order;
4. lock Command;
5. re-read/validate coherent pair.

Allowed source pairs:

- `PENDIENTE/PENDIENTE`;
- `EN_PREPARACION/EN_PREPARACION`.

Target pair:

- Order `CANCELADO`;
- Command `CANCELADA`.

The cancellation actor written to Order is the authenticated UserId even when COCINA initiated the cancellation through the Kitchen endpoint.

Reason remains optional.

Already coherently cancelled:

- authorized idempotent no-op;
- preserve original audit/reason;
- no duplicate SignalR event.

`LISTO/LISTA` or `ENTREGADO/LISTA`:

- `409`.

---

## 30. Representative Concurrency Semantics

### 30.1 Waiter take vs waiter take

Both lock Order.

Exactly one unassigned→assigned transition commits.

The second waiter receives `409`.

### 30.2 Admin assignment vs waiter take

Both lock Order.

Behavior is serialization-dependent and intentionally deterministic after lock acquisition:

- admin first → waiter sees other assignment and gets `409`;
- waiter first → admin may then reassign the non-terminal Order.

### 30.3 Ready vs cancel

Both operations lock:

1. Order;
2. Command.

Only the state observed under lock decides.

If ready commits first:

- pair becomes `LISTO/LISTA`;
- cancellation later returns `409`.

If cancellation commits first:

- pair becomes `CANCELADO/CANCELADA`;
- ready later returns `409`.

No mixed final pair is acceptable.

### 30.4 Start vs cancel

Same lock order and serialization principle.

Final result must be one coherent pair:

- started `EN_PREPARACION/EN_PREPARACION`; or
- cancelled `CANCELADO/CANCELADA`.

A later incompatible operation receives `409`.

### 30.5 Double deliver

Both lock Order.

First transition:

- `LISTO → ENTREGADO`.

Authorized second request:

- reads `ENTREGADO`;
- returns idempotent success;
- does not update audit again.

### 30.6 Duplicate start/ready

Serialized through the same locks.

Second authorized request reaching the coherent target pair:

- no-op;
- no duplicate event.

---

## 31. Database Mapping and Constraints

New operational tables, if absent:

- `orders`;
- `order_items`;
- `kitchen_commands`;
- `kitchen_command_items`.

New tables/columns MUST be explicitly snake_case without attempting to rename unrelated historical schema globally.

### 31.1 Suggested `orders` columns

- `id`;
- `shift_id`;
- `waiter_employee_id`;
- `table_reference`;
- `status`;
- `notes`;
- `created_at`;
- `created_by_user_id`;
- `updated_at`;
- `updated_by_user_id`;
- `cancelled_at`;
- `cancelled_by_user_id`;
- `cancellation_reason`.

### 31.2 Suggested `order_items`

- `id`;
- `order_id`;
- `product_id`;
- `quantity`;
- `unit_price`;
- `notes`;
- `created_at`.

### 31.3 Suggested `kitchen_commands`

- `id`;
- `order_id`;
- `status`;
- `created_at`;
- `started_at`;
- `ready_at`;
- `cancelled_at`;
- `updated_by_user_id`.

### 31.4 Suggested `kitchen_command_items`

- `id`;
- `kitchen_command_id`;
- `order_item_id`;
- `created_at`.

### 31.5 Required checks

Order status only:

- `PENDIENTE`;
- `EN_PREPARACION`;
- `LISTO`;
- `ENTREGADO`;
- `CANCELADO`.

Kitchen status only:

- `PENDIENTE`;
- `EN_PREPARACION`;
- `LISTA`;
- `CANCELADA`.

OrderItem:

- `quantity > 0`;
- `unit_price >= 0`.

### 31.6 Unique constraints/indexes

- `UNIQUE(order_items.order_id, order_items.product_id)`;
- `UNIQUE(kitchen_commands.order_id)`;
- `UNIQUE(kitchen_command_items.kitchen_command_id, kitchen_command_items.order_item_id)`.

### 31.7 Query indexes

Orders:

- `status`;
- `created_at`;
- `waiter_employee_id`.

Kitchen:

- `status`;
- `created_at`.

Do not add trigram/full-text indexes for current table-reference search.

### 31.8 Delete behavior

Historical operational records must not disappear through ordinary related-entity deletion.

Preferred behavior, adapted to current EF conventions:

- Product → OrderItem: `RESTRICT/NO ACTION`;
- Employee → Order waiter: `RESTRICT/NO ACTION`;
- Order → KitchenCommand: historical relation protected;
- OrderItem → KitchenCommandItem: historical relation protected;
- audit User references: follow the existing Identity audit-reference strategy without cascading historical Order deletion.

No public hard-delete endpoint exists for Orders/Commands.

---

## 32. Migration Strategy

Prefer one coherent migration after the model is stable.

Conceptual scope:

- Product `is_sellable` only if required;
- Orders;
- OrderItems;
- KitchenCommands;
- KitchenCommandItems;
- constraints;
- indexes;
- FKs where real referenced tables exist;
- model snapshot.

Migration APPLY validation MUST include:

1. inspect current migration chain/snapshot;
2. generate a new migration only;
3. inspect generated migration;
4. inspect generated SQL where practical;
5. apply full chain to disposable PostgreSQL DB;
6. validate constraints/indexes;
7. validate model snapshot coherence.

Historical migrations MUST NOT be edited.

No destructive reset of a user database.

---

## 33. SignalR Contract

### 33.1 Hub

Canonical path:

`/hubs/kitchen`

If the repository has a strict route convention, implementation may use the equivalent exact route only if it preserves the documented public contract.

### 33.2 Authorization

Hub requires authentication.

Allowed roles:

- ADMINISTRADOR;
- ENCARGADO;
- MESERO;
- COCINA.

`CONTADORA`-only and `EMPLEADO`-only are denied.

### 33.3 Hub behavior

The Hub contains no business-mutation methods.

Its role is subscription/realtime delivery only.

All mutations remain REST-authoritative.

### 33.4 Notifier boundary

Application contract should provide semantics equivalent to:

- publish created;
- publish updated;
- publish cancelled.

The external implementation uses the existing SignalR pattern, typically `IHubContext<KitchenHub>` or repository equivalent.

Do not create a second realtime architecture if an existing notifier pattern can be reused.

---

## 34. SignalR Events

### 34.1 KitchenCommandCreated

Published after a new KitchenCommand transaction commits.

Payload:

```text
commandId
orderId
status = PENDIENTE
occurredAt
```

### 34.2 KitchenCommandUpdated

Published after an **actual**:

- start;
- ready.

Payload:

```text
commandId
orderId
status
occurredAt
```

### 34.3 KitchenCommandCancelled

Published after an actual paired cancellation commit, regardless of whether cancellation was initiated through:

- Order cancel endpoint;
- Kitchen cancel endpoint.

Payload:

```text
commandId
orderId
status = CANCELADA
occurredAt
```

No financial fields.

No JWT/Identity internals.

---

## 35. SignalR Delivery Semantics

Mandatory ordering:

```text
DB SAVE
  ↓
DB COMMIT
  ↓
SignalR publish attempt
```

Never publish before commit.

Rollback/failure before commit:

- no event.

Idempotent no-op:

- no new event.

### 35.1 Notifier failure after commit

If the DB commit succeeds and the realtime notifier throws/fails afterwards:

- the committed Order/Command state remains authoritative;
- do not attempt to rollback the already committed transaction;
- do not convert the persisted operation into a false failure requiring client retry of the business mutation;
- return the successful persisted business result according to the endpoint contract;
- log the realtime publication failure without secrets;
- rely on REST/refetch as recovery.

No outbox is added for this MVP.

This tradeoff MUST be covered by a test.

---

## 36. ProblemDetails and Stable Business Codes

Use the current project ProblemDetails/ValidationProblemDetails infrastructure.

### 36.1 400

Examples:

- empty items;
- duplicate ProductId;
- zero/negative quantity;
- overlong fields;
- invalid filter enum;
- invalid/non-orderable Product;
- invalid/ineligible waiter assignment input according to current project semantics.

### 36.2 401

- missing/invalid authentication.

### 36.3 403

- role denial;
- MESERO ownership denial;
- MESERO Kitchen mutation;
- unauthorized assignment.

### 36.4 404

- Order not found;
- KitchenCommand not found.

### 36.5 409

Business-state/concurrency conflicts, including:

- invalid Order transition;
- invalid Kitchen transition;
- already assigned to another waiter;
- terminal assignment/take;
- missing operational Employee for a waiter-only operation;
- Order/Kitchen pair inconsistency;
- cancellation after ready;
- business race loser.

Where current helpers support stable extensions, use a `code` field.

Recommended codes:

- `ORDER_INVALID_TRANSITION`;
- `KITCHEN_INVALID_TRANSITION`;
- `ORDER_ALREADY_ASSIGNED`;
- `ORDER_ASSIGNMENT_TERMINAL`;
- `ACTOR_EMPLOYEE_UNAVAILABLE`;
- `WAITER_NOT_ELIGIBLE`;
- `ORDER_KITCHEN_STATE_CONFLICT`.

Do not expose:

- Npgsql exception text;
- EF internal errors;
- DB constraint names;
- stack traces.

---

## 37. Audit and Logging

Backend is time authority.

Actor IDs come only from the authenticated principal.

Never accept from request:

- `createdBy`;
- `updatedBy`;
- `cancelledBy`;
- waiter actor for take.

Operational logs SHOULD include:

- aggregate identifiers;
- requested action;
- high-level business/technical failure code.

Logs MUST NOT include:

- JWT;
- secrets;
- raw DB connection strings;
- password/token material;
- unnecessary financial payload.

---

## 38. OpenAPI Requirements

Every REST endpoint MUST expose enough metadata for the later frontend change to generate an accurate contract:

- route/method;
- authorization requirement;
- request schema;
- response schema;
- enum values;
- paginated response shape;
- relevant success status;
- `400/401/403/404/409` ProblemDetails as applicable.

Business operations MUST NOT return anonymous untyped `object` responses when a real DTO can be declared.

SignalR event contracts are documented manually because OpenAPI does not fully describe them.

Do **not** run frontend TypeScript generation in this change.

Do **not** manually edit `frontend/src/types/api.generated.ts`.

---

## 39. Testing Strategy

### 39.1 Pure Domain/Application tests

Use for behavior that is genuinely pure:

- state-transition legality;
- idempotency classification;
- ownership decision helpers;
- no-KITCHEN initial-state decision;
- duplicate request-line validation if implemented as pure validation.

Do not duplicate integration tests unnecessarily.

### 39.2 PostgreSQL integration tests

Required for behavior depending on real persistence semantics:

- FKs/checks/unique constraints;
- create transaction;
- row locks;
- take races;
- start/cancel race;
- ready/cancel race;
- assignment/take serialization;
- migration behavior.

### 39.3 API tests

Use current test-host pattern for:

- authentication;
- role policies;
- ownership;
- status codes;
- request validation;
- DTO field visibility;
- pagination.

### 39.4 SignalR/notifier tests

At minimum cover:

- notifier intent after successful mutation;
- no notifier on rollback;
- no notifier on idempotent no-op;
- minimal event payload;
- no financial payload;
- hub authentication;
- hub role authorization;
- notifier failure after commit preserves the committed business result.

No browser is required.

---

## 40. Create Test Matrix

Must cover at least:

### Authorization

- MESERO create.
- ENCARGADO create.
- ADMINISTRADOR create.
- anonymous → `401`.
- unsupported role → `403`.

### Assignment behavior

- MESERO + active Employee creator autoassigned.
- ENCARGADO **without MESERO** creator unassigned.
- ADMINISTRADOR **without MESERO** creator unassigned.
- actor with MESERO + active Employee autoassigned even when another broader role is also present.
- MESERO-only without operational Employee → `409`.
- broader-role actor without operational Employee may create unassigned according to Section 11.

### Order/Kitchen shape

- KITCHEN request → Order `PENDIENTE`.
- KITCHEN request → Command `PENDIENTE`.
- no-KITCHEN request → Order `LISTO`.
- no-KITCHEN request → no Command.
- mixed request → only KITCHEN items in Command.

### Product and money

- unit-price snapshot.
- calculated lineTotal.
- calculated total.
- invalid Product.
- inactive Product.
- non-sellable Product.
- null sale price.
- unsupported preparation area if current Product model allows invalid persisted values.
- zero quantity.
- negative quantity.
- empty items.
- duplicate ProductId.

### Side effects/atomicity

- no inventory movement.
- no Sale.
- no partial aggregate persistence.

#### Transaction rollback evidence rule

Use a natural failure occurring after transaction start when one can be produced cleanly through the real architecture.

MUST NOT introduce:

- production test hooks;
- environment-specific exception switches;
- intentional production behavior solely to force rollback.

If no natural post-transaction-start failure can be induced without artificial production hooks, acceptable evidence is:

- explicit transaction-boundary inspection;
- PostgreSQL-backed integration around the aggregate persistence path;
- proof that commit occurs only after all aggregate legs succeed;
- verified rollback/disposal behavior of existing infrastructure;
- available failure paths leaving no partial persistence.

Document evidence truthfully as one of:

- `DIRECT_ROLLBACK_TEST`;
- `STRUCTURAL_AND_INTEGRATION_EVIDENCE`.

---

## 41. Assignment Test Matrix

Must cover:

- admin assigns eligible waiter.
- admin reassigns eligible waiter on `PENDIENTE`.
- admin reassigns on `EN_PREPARACION`.
- admin assigns/reassigns on `LISTO`.
- terminal `ENTREGADO` assignment → `409`.
- terminal `CANCELADO` assignment → `409`.
- same waiter assignment on non-terminal → idempotent.
- invalid waiter target.
- inactive waiter target.
- Employee not linked to MESERO-capable User.
- non-admin assignment → `403`.
- waiter take `PENDIENTE`.
- waiter take `EN_PREPARACION`.
- waiter take `LISTO`.
- terminal take → `409`.
- take assigned to another waiter → `409`.
- repeated own take on non-terminal → idempotent.
- two concurrent waiter takes → exactly one winner.
- admin assignment vs waiter take serializes coherently.
- MESERO can list/read all Orders.
- MESERO cannot deliver/cancel another waiter's Order.
- assigned waiter can deliver own `LISTO`.
- manager/admin global delivery.

---

## 42. Kitchen Test Matrix

Must cover:

- Command generated `PENDIENTE`.
- COCINA list/detail.
- MESERO list/detail.
- unsupported role denied.
- MESERO start → `403`.
- MESERO ready → `403`.
- MESERO Kitchen cancel → `403`.
- start synchronizes both entities.
- start sets StartedAt.
- ready synchronizes both entities.
- ready sets ReadyAt.
- PENDIENTE→LISTA skip rejected.
- repeated start is idempotent and emits no duplicate event.
- repeated ready is idempotent and emits no duplicate event.
- mixed Order exposes only KITCHEN lines in Command.
- Kitchen DTO contains no financial fields.

---

## 43. Cancellation Test Matrix

### 43.1 Order cancel

- `PENDIENTE` succeeds.
- `EN_PREPARACION` succeeds.
- `LISTO` rejected.
- `ENTREGADO` rejected.
- null reason allowed.
- reason persisted when supplied.
- actor persisted.
- timestamp persisted.
- active Command cancelled atomically.
- MESERO ownership enforced.
- another MESERO → `403`.
- ENCARGADO global cancellation.
- ADMINISTRADOR global cancellation.
- repeated authorized coherent cancellation preserves original metadata.

### 43.2 Kitchen cancel

- Command `PENDIENTE` succeeds.
- Command `EN_PREPARACION` succeeds.
- Command `LISTA` rejected.
- Order cancelled atomically.
- COCINA allowed.
- MESERO denied.
- repeated authorized cancellation preserves original metadata.
- cancelled-by display projection can identify the human actor where user/employee data exists.

---

## 44. Concurrency Test Matrix

Use real PostgreSQL concurrency.

Representative races:

- waiter A vs waiter B take;
- admin assign vs waiter take;
- ready vs cancel;
- start vs cancel;
- duplicate start;
- duplicate ready;
- double deliver.

Tests MUST assert:

- final persisted state is coherent;
- no partial pair state;
- expected success/conflict semantics;
- no duplicate SignalR transition events;
- authorization is not bypassed by idempotency.

A Cartesian test of every theoretical race is not required.

---

## 45. SignalR Test Matrix

Must cover:

- Command creation → `KitchenCommandCreated`.
- start → `KitchenCommandUpdated`.
- ready → `KitchenCommandUpdated`.
- cancellation through Order → `KitchenCommandCancelled`.
- cancellation through Kitchen → `KitchenCommandCancelled`.
- transaction failure/rollback → no event.
- idempotent repeat → no new event.
- payload contains only the specified minimum operational fields.
- no financial fields.
- anonymous Hub connection denied.
- unsupported role Hub connection denied.
- notifier throws after successful commit:
  - DB state remains committed;
  - operation result remains successful according to contract;
  - no rollback attempt;
  - technical failure is logged.

---

## 46. Regression and Quality Gates

Before declaring backend complete:

1. restore/build using actual repo commands;
2. discover all backend test projects;
3. run all backend tests;
4. require `failed = 0`;
5. validate migration against disposable PostgreSQL;
6. validate API startup/OpenAPI runtime;
7. execute final security review.

Do not rely on a fixed historical test count.

The change MUST NOT regress:

- authentication;
- user management when present in baseline;
- catalog;
- suppliers;
- attendance;
- existing SignalR attendance behavior;
- existing ProblemDetails/OpenAPI conventions.

Ordinary pre-existing warnings remain non-blocking unless this change worsens them materially.

---

## 47. Security Review

Final review MUST confirm:

- no actor UserId from request;
- no waiter claim by arbitrary EmployeeId;
- admin assignment target validated;
- role policies correct;
- MESERO ownership enforced;
- multi-role union preserved;
- `UserId != EmployeeId`;
- no second JWT/auth implementation;
- no manual Bearer plumbing introduced;
- no Kitchen financial leakage;
- no raw SQL/EF exception leakage;
- no secrets in logs;
- no unauthorized reassignment;
- no unauthorized Kitchen mutation;
- no invalid state bypass through direct REST;
- no inventory side effect;
- idempotency cannot bypass authorization.

---

## 48. Documentation Closure

After implementation, create/update the real HU documents for:

- HU-009.
- HU-010.
- HU-011.

Each MUST state:

- Backend: complete.
- Frontend: pending.
- End-to-end: pending.

The change documentation MUST include an endpoint table with:

- method;
- path;
- roles;
- purpose;
- main response;
- API mapping file/area;
- main handler/service.

It MUST also include a complete manifest of actually modified versioned files grouped by:

- Domain;
- Application;
- Infrastructure;
- Api;
- Migrations;
- Tests;
- Docs/OpenSpec/config/transversal.

For each file:

- path;
- purpose.

Frontend:

`PENDING — next change`.

Visual evidence:

`PENDING — frontend change`.

No fabricated evidence.

Backend evidence may reference real:

- test output;
- migration validation;
- OpenAPI/Swagger;
- runtime HTTP requests;
- database assertions.

---

## 49. Out of Scope

Explicitly excluded:

- frontend code changes;
- generated TypeScript;
- Sale;
- SaleItem;
- Customer relation on Order;
- payment;
- CashSession;
- fiscal invoice;
- inventory decrement/reservation/movement;
- Shift lifecycle;
- fake Shift data;
- Order content editing;
- OrderItem add/remove/update after create;
- waiter release/unassign;
- BAR KDS;
- partial delivery;
- per-item readiness;
- table master;
- post-MVP workflow extensions.

---

## 50. Accepted Tradeoffs

- PostgreSQL row locks instead of ETag/version.
- No distributed lock.
- No outbox.
- REST/refetch recovers from post-commit SignalR publication failure.
- No Create idempotency key.
- No BAR command workflow.
- No per-line readiness.
- No Order editing.
- Shift nullable when lifecycle is unavailable.
- Total computed, not stored.
- Product name not newly snapshotted unless existing architecture already does so.
- Search initially limited to `tableReference`.
- No stock validation/blocking during Order create.
- No frontend generated types in this change.
- Realtime publication may fail independently after successful persistence; persisted state remains authoritative.

---

## 51. Implementation Constraints

During APPLY:

- do not modify frontend;
- do not run frontend `api:generate`;
- do not implement Sale;
- do not implement Inventory movement;
- do not implement Shift lifecycle;
- do not create fake Orders/Commands in DevelopmentDataSeeder;
- do not edit historical migrations;
- do not use EF InMemory as concurrency evidence;
- do not publish SignalR before commit;
- do not lock Command before Order;
- do not accept price/status/audit actors from requests;
- do not use `UserId` as `EmployeeId`;
- do not introduce generic status endpoints;
- do not add extra states;
- do not create table master;
- do not use stock insufficiency as an Order-create blocker;
- do not mark HU-009/010/011 end-to-end done.

Normal engineering failures such as compilation errors, failing tests, EF/Npgsql issues, migration issues, DI failures, query bugs or race defects discovered by tests are implementation work, not product blockers.

---

## 52. Definition of Done — Backend Only

The change is `BACKEND_COMPLETE` only when all applicable items are satisfied:

### Domain / Persistence

- Order model complete.
- OrderItem model complete.
- KitchenCommand model complete.
- KitchenCommandItem model complete.
- exact states enforced.
- migration complete.
- Product compatibility resolved.
- Shift strategy resolved.
- constraints/indexes validated.

### Orders

- create works.
- price snapshots work.
- duplicate Product lines are prevented.
- no-KITCHEN Order starts `LISTO`.
- KITCHEN Order starts `PENDIENTE`.
- list/detail work.
- calculated totals work.
- no inventory mutation occurs.

### Assignment / Ownership

- MESERO creator autoassignment works.
- missing operational Employee semantics work.
- admin assignment/reassignment works.
- take works for `PENDIENTE`, `EN_PREPARACION`, `LISTO`.
- terminal assignment/take protection works.
- concurrent take works.
- MESERO can read all Orders.
- MESERO own-only mutation is enforced.
- multi-role union works.

### Kitchen

- Command generation works.
- Kitchen read works.
- start synchronization works.
- ready synchronization works.
- safe Kitchen DTO works.

### Cancellation / Delivery

- Order cancellation works.
- Kitchen cancellation works.
- paired cancellation is atomic.
- optional reason works.
- cancellation actor/display projection works.
- delivery works.
- idempotency works.
- authorization-before-idempotency works.

### Concurrency / Realtime

- stable Order→Command lock order implemented.
- representative races pass.
- no impossible persisted pair is produced.
- SignalR Hub works.
- post-commit publication works.
- rollback emits no event.
- idempotent retry emits no duplicate event.
- notifier failure after commit preserves business success.

### Delivery Contract / Quality

- ProblemDetails correct.
- OpenAPI correct.
- PostgreSQL integration tests pass.
- all backend regression tests pass.
- build passes.
- security review passes.
- documentation and complete file manifest are done.

This does **not** mean:

- HU-009 end-to-end done;
- HU-010 end-to-end done;
- HU-011 end-to-end done.

Frontend remains pending.

---

## 53. APPLY Preflight Facts — No Product Questions

No known product decision remains open.

At APPLY start, resolve only these repository facts:

1. exact branch/HEAD;
2. exact latest migration/snapshot;
3. whether `Product.IsSellable` is already present;
4. whether Shift exists;
5. whether an active Shift resolver exists;
6. exact notifier implementation location/naming;
7. exact User↔Employee navigation/query path;
8. exact role-policy registration pattern;
9. exact PostgreSQL fixture/test-host classes.

If names/locations differ, adapt to the actual repository while preserving this design.

Only a genuine contradiction with the frozen behavior may be escalated as a human blocker.
