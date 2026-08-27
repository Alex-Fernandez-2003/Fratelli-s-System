# Design

## Components Touched

### Existing foundation to reuse

- AuthProvider.
- session coordinator.
- shared httpClient.
- QueryClient.
- endpoint registry.
- RequireAuth.
- RequireAnyRole.
- ForbiddenPage.
- AuthenticatedLayout.
- authenticated navigation.
- AppShell.
- UI Kit.
- Tailwind.
- Lucide.
- generated API pipeline.

### New capability areas

Use repository conventions rather than forcing empty folders.

Likely areas:

- `features/orders`
- `features/kitchen`

Orders SHOULD contain cohesive elements for:

- API/query integration;
- list;
- create/cart;
- detail;
- assignment/take;
- cancel/deliver.

Kitchen SHOULD contain:

- API/query integration;
- KDS;
- realtime adapter/provider;
- connection status;
- ElapsedTime integration.

## Boundaries Respected

- Auth state stays in HU-001 foundation.
- JWT never travels through component props.
- Server state remains TanStack Query.
- Draft cart remains local React state.
- SignalR never becomes state authority.
- Backend decides transitions/ownership.
- Screenshots never expand backend scope.
- AppShell/navigation remain shared.
- Users API is reused for waiter assignment.
- No direct dependency of generic shared UI on Orders/Kitchen domain when avoidable.

## Contracts Changed

### Frontend generated contract

Expected to change after final backend integration.

`api.generated.ts` becomes contract source.

### Central endpoint registry

Must be extended with final real paths.

Conceptually:

Orders:

- list
- detail
- create
- assignment
- take
- deliver
- cancel

Kitchen:

- list
- detail
- start
- ready
- cancel

No route string duplication across components.

### HTTP

Audit whether current shared client supports final methods.

If PUT is needed and not available:

- add one generic `put` capability to shared client.

Do not create Orders-specific transport.

## Data Flow

### Orders list

- route state/local filters
- normalize page/search/status
- ordersKeys.list(params)
- feature API
- shared httpClient
- REST
- PagedResponse
- render
- mutation/event
- invalidate root
- authoritative refetch

### New Order

- Product query
- local search/catalog display
- local cart keyed by ProductId
- one Create mutation
- backend calculates authoritative result
- invalidate
- navigate to detail

### Assignment

- Users query filtered MESERO/active
- ADMIN selects real employeeId
- backend mutation
- no optimistic state
- invalidate/refetch

### Kitchen

- query PENDIENTE
- query EN_PREPARACION
- query LISTA
- render KDS
- REST mutations
- SignalR events
- invalidate queries
- REST refresh

## Visual Reference Audit Design

Before implementing presentation, create an internal matrix:

| Archivo | Pantalla | Desktop/Mobile | Estado | Layout | Actions shown | Contract mismatch | Decision |
| ------- | -------- | -------------- | ------ | ------ | ------------- | ----------------- | -------- |

Known mandatory filenames include:

- `Pedidos - Desktop.png`
- `Nuevo pedido - Desktop.png`
- `Detalle de pedido - Desktop.png`
- `Cocina - Vista Mesero (Read-only).png`

The full ZIP must be enumerated.

Each screenshot-specific action is categorized:

- KEEP:
  backed by final contract.
- ADAPT:
  same UX intent but contract differs.
- OMIT:
  unsupported/out-of-scope.

Known OMIT:

- Add Items after persistence.
- Send New Items.
- Pre-cuenta.
- Cobrar.
- taxes/service.
- Print.
- URGENTE.
- progress.
- estimate.
- station.
- fake Shift.
- fake availability.
- Retirar ya.

## Routes and Layout Design

Add routes under current authenticated layout.

Conceptually:

- RequireAuth
  - AuthenticatedLayout
    - `/inicio`
    - `/usuarios` guarded ADMIN
    - Pedidos role guard
      - `/pedidos`
      - `/pedidos/nuevo`
      - `/pedidos/:id`
    - Cocina role guard
      - `/cocina`

No nested URL structure is required solely for implementation organization.

## Navigation Design

Current `AuthNavigationItem.path` is a literal union restricted to `/inicio | /usuarios`; implementation must expand or generalize this contract to include real new module paths while retaining type safety. citeturn768635view5

Add:

- Pedidos:
  - icon appropriate Lucide;
  - MESERO/ENCARGADO/ADMINISTRADOR.
- Cocina:
  - ChefHat or equivalent;
  - COCINA/MESERO/ENCARGADO/ADMINISTRADOR.

Do not add New Order as mandatory sidebar item.

## API and Query Design

### Orders Keys

Conceptual:

- `ordersKeys.all`
- `ordersKeys.lists()`
- `ordersKeys.list(params)`
- `ordersKeys.details()`
- `ordersKeys.detail(id)`

Normalize:

- trim search;
- undefined for empty;
- page;
- pageSize;
- status.

### Kitchen Keys

- `kitchenKeys.all`
- `kitchenKeys.lists()`
- `kitchenKeys.list(params)`
- `kitchenKeys.details()`
- `kitchenKeys.detail(id)`

### KDS Query Model

Use one query per active status.

Advantages:

- maps directly to columns/tabs;
- each pagination remains authoritative;
- no client repartition of paginated mixed data;
- invalidation remains simple.

## Orders List Design

### Desktop

After visual audit, preserve supplied hierarchy while providing:

- header/CTA;
- search;
- status Select;
- table/list;
- compact ID;
- table/reference;
- waiter;
- status;
- created time;
- actions;
- pagination.

### Mobile

Use cards.

Each card:

- compact ID;
- table/reference;
- status;
- waiter;
- time;
- relevant action entry point.

No compressed desktop table.

## New Order Design

### Local state

No global store required.

Recommended local state:

- tableReference;
- notes;
- cart keyed by ProductId.

Each cart entry stores:

- Product data needed for presentation;
- quantity;
- notes.

### Product query

Use real Catalog API.

Do not fetch one Product per card.

### Add semantics

If absent:

- insert quantity=1.

If present:

- quantity +=1.

### Quantity

Stepper.

If decrement at quantity 1:

- preferred behavior after visual inspection:
  - either disable decrement and provide Remove;
  - or remove only when reference makes that explicit.

Functional rule remains one line per Product.

### Draft total

Draft:

sum catalogPrice × quantity.

Not sent.

After save:
use Order response.

## Order Detail Design

Sections:

1. header/status/actions;
2. operational metadata;
3. waiter/assignment;
4. notes;
5. items;
6. total;
7. cancellation info;
8. kitchen relationship if exposed.

No edit form.

### Capability helper

Create an internal presentation helper equivalent to:

- `canTakeOrder`
- `canAssignOrder`
- `canCancelOrder`
- `canDeliverOrder`

Inputs:

- roles;
- current EmployeeId;
- Order waiterEmployeeId;
- status.

This centralizes UX conditions.

It does not replace backend auth.

## Assignment Design

Reuse Users infrastructure.

If existing Users feature already exposes a reusable query/API:

- use it.

If it is tightly page-specific:

- extract a generic reusable users-query primitive;
- do not duplicate endpoint logic.

The selector MUST not silently stop at first page.

Options:

- fetch max pageSize and Load More;
- server-side search;
- paginate modal.

For MVP team size, a max-page query may be sufficient if totalPages=1; code MUST still detect >1.

## KDS Design

### Shared mode

Determine presentation capability:

`canManageKitchen`

true if any:

- COCINA
- ENCARGADO
- ADMINISTRADOR

MESERO-only:
false.

Same cards, no buttons.

### Desktop

Three KDS groups.

### Mobile

Local selected-state tab.

No need to persist selected tab in URL unless existing UI convention demands it.

### Command Card

Show only contract-backed fields.

Timer source:

- PENDIENTE → createdAt;
- EN_PREPARACION → startedAt when present;
- LISTA → readyAt when present;

fallback to the most recent safe authoritative timestamp only if final contract guarantees meaningful semantics.

Do not invent an estimated deadline.

## ElapsedTime Design

Reusable component/hook.

Internal algorithm:

- parse timestamp once when input changes;
- state `now`;
- interval ~1000 ms;
- each interval sets actual Date.now;
- elapsed = max(0, now - origin);
- cleanup.

No network dependency.

Do not bind timer updates to parent KDS query state to avoid re-rendering entire board unnecessarily.

Prefer timer encapsulation per visible card.

## SignalR Architecture

### One connection owner

Introduce a feature-level realtime service/provider, not one connection per component.

Responsibilities:

- instantiate HubConnection;
- start after authenticated session is ready;
- stop on logout/unmount;
- expose connection state;
- subscribe/unsubscribe events;
- automatic reconnect.

### Token integration

SignalR access token MUST come from the same in-memory session coordinator.

Recommended design:

- session coordinator exposes a narrow current-access-token accessor for infrastructure use;
- SignalR `accessTokenFactory` calls it each time SignalR requests a token.

Feature components never access the token.

### Events

Do not normalize/patch business objects manually.

Handler:

- receive minimal event;
- optionally validate required identifiers;
- invalidate query roots.

Duplicate events are harmless.

## Reconnect Design

SignalR lifecycle:

- Connecting
- Connected
- Reconnecting
- Disconnected

On `onreconnected`:

- invalidate Orders;
- invalidate Kitchen.

No attempt to determine which events were missed.

## Fallback Polling Design

Derive interval:

Connected:

- false.

Reconnecting/Disconnected:

- 30_000.

Apply primarily to:

- KDS active lists;
- mounted Orders operational list;
- nonterminal Order Detail when valuable.

Terminal details SHOULD not poll indefinitely.

Do not attach fallback polling to every historical query.

## Mutation/Invalidation Matrix

| Mutation       | Orders lists | Order detail | Kitchen lists | Kitchen detail |
| -------------- | ------------ | ------------ | ------------- | -------------- |
| Create         | invalidate   | fetch new    | invalidate    | -              |
| Assign         | invalidate   | invalidate   | no            | no             |
| Take           | invalidate   | invalidate   | no            | no             |
| Deliver        | invalidate   | invalidate   | no            | no             |
| Order cancel   | invalidate   | invalidate   | invalidate    | related        |
| Kitchen start  | invalidate   | related      | invalidate    | invalidate     |
| Kitchen ready  | invalidate   | related      | invalidate    | invalidate     |
| Kitchen cancel | invalidate   | related      | invalidate    | invalidate     |

Broad root invalidation is acceptable for MVP.

## 409 Conflict Design

Conflict resolver should understand:

- status;
- ProblemDetails title/detail;
- stable `code` when present.

Known UX categories:

- taken by another waiter;
- reassigned;
- state already changed;
- cancellation no longer possible.

Conflict flow:

- no automatic retry;
- show Alert/message;
- invalidate;
- refetch;
- render actual state.

## Loading / Error Design

Initial load:

- loading structure/skeleton.

Background refetch:

- preserve existing useful data.

Initial error:

- Alert + Retry.

Background error:

- preserve data + non-destructive error indicator.

## Accessibility Design

- existing Dialog primitive for focus management;
- icon-only buttons require aria-label;
- KDS connection badge has text;
- timer is normal text, not live region;
- color is supplementary to status label;
- mobile action targets approximately touch-friendly;
- keyboard reachable actions.

## Required Tests Per Layer

### API adapters

Test:

- final methods/routes;
- query params;
- body;
- shared client usage;
- no token arguments.

### Query keys

Test:

- filters change key;
- empty/trimmed search normalization;
- stable identical inputs.

### Routing

MESERO:

- Orders + New + Detail + Cocina.

ENCARGADO:

- Orders + Cocina operational.

ADMIN:

- Orders + assignment + Cocina operational.

COCINA:

- Cocina only.

Unsupported:

- Forbidden.

Multi-role:

- union.

### Orders List

- data.
- search backend request.
- status.
- page reset.
- pagination.
- loading.
- empty.
- filtered empty.
- error.
- actions.

### New Order

- Catalog.
- active/sellable.
- search.
- add.
- duplicate add increments.
- quantity.
- remove.
- line notes.
- general notes.
- table reference.
- empty cart.
- draft total.
- no tax/service.
- exact request.
- successful route.
- validation error.

### Detail

- fields.
- read-only.
- allowed actions.
- 404.

### Assignment/Take

- role visibility.
- eligible waiter query.
- success.
- invalidation.
- 409.

### Cancel/Deliver

- ownership/state.
- optional reason.
- success.
- invalidation.
- conflict.
- no Sale flow.

### KDS

- desktop state groups semantically.
- mobile state switch.
- role controls.
- MESERO read-only.
- Start.
- Ready.
- Cancel.
- LISTA no further action.
- no fictional fields.

### ElapsedTime

- timestamp-derived render.
- fake time advancement.
- Date.now recalculation.
- cleanup.
- long-duration formatting.
- no network/refetch.

### SignalR

Using a testable adapter/mock connection:

- one connection.
- automatic reconnect configured.
- Created invalidates.
- Updated invalidates.
- Cancelled invalidates.
- reconnect invalidates.
- status updates.
- no persistent JWT.

### Polling

Fake timers:

- Connected → no fallback.
- Reconnecting → ~30s.
- Disconnected → ~30s.
- Connected after reconnect → stop fallback.
- ElapsedTime ticks do not cause polling.

## Tradeoffs Accepted

- Unit-only quantity UX over decimal input.
- memory-only cart.
- broad invalidation over cache patching.
- no optimistic transitions.
- SignalR invalidation over event-state patch.
- polling only when realtime unhealthy.
- KDS query per status.
- MVP visual fidelity over pixel perfect.
- no new mobile global nav.
- no visual feature without backend contract.

## Implementation Constraints

- No frontend implementation before backend gate.
- No backend business changes.
- No generated manual edits.
- No new auth stack.
- No second HTTP client.
- No second QueryClient.
- No optimistic transitions.
- No token persistence.
- No one-SignalR-connection-per-card.
- No timer network traffic.
- No client-fabricated transitions.
- No out-of-scope Figma actions.
- No fabricated screenshots/manual PASS.
- No Git mutations under this briefing.

## Open Design Questions

### Repository gate — blocking before APPLY

The publicly visible `develop` currently lacks the final backend.

Future explore MUST recheck.

If still missing:
`UNRECOVERABLE_RUNTIME_BLOCKER`.

### Visual audit — blocking before visual freeze

The ZIP is present as an attachment but its PNG contents are not exposed to the available inspection tools in this session.

Future explore MUST inspect all files before presentation implementation.

### Non-blocking implementation adaptations

The future agent MUST resolve autonomously:

- exact generated type names;
- exact backend enum representation;
- exact users-query helper;
- exact shared Dialog/DataTable usage;
- exact ProblemDetails code shape;
- exact current session token accessor;
- exact SignalR event payload types.

These are not product questions.
