# Design

## Components Touched

### Baseline frontend reusable

Confirmado públicamente:

- `AppRoutes`;
- `RequireAuth`;
- `RequireAnyRole`;
- `AuthenticatedLayout`;
- central authenticated navigation;
- `AuthProvider`;
- shared `httpClient`;
- endpoint registry;
- Atomic Design component folders;
- Tailwind;
- Lucide;
- TanStack Query;
- generated OpenAPI pipeline. citeturn418096view1 citeturn293544view0 citeturn107341view0

El árbol actual de components está separado en:

- atoms;
- molecules;
- organisms;
- templates. citeturn107341view0

### New Inventory area

Likely feature-owned concerns:

- balances API/query;
- movements API/query;
- pages;
- balance table/cards;
- filters;
- module navigation;
- MovementDialog/Form;
- Product selector;
- polling settings;
- labels/formatting;
- tests.

### New Expenses area

Likely:

- categories API/query;
- Expense create API/mutation;
- page;
- form;
- CashSource control;
- confirmation;
- business-date helper reuse;
- tests.

No exact filenames are frozen until local audit.

## Boundaries Respected

### Auth

Feature code MUST not receive tokens.

### HTTP

Feature API MUST use shared `httpClient`.

### Query

Server state MUST live in TanStack Query.

### Inventory forms

Form state may be local controlled React state or existing form pattern.

### Expense form

No global state store is needed.

### Inventory vs Catalog

Inventory consumes Product information but does not mutate Product/MinStock.

### Expenses vs History

Expenses has no list query/cache.

### Polling vs realtime

Inventory uses REST polling.

No SignalR.

### Navigation

Routes integrate into current shell but do not redesign it.

## Contracts Changed

### Generated contract

Expected generated additions after backend merge:

Inventory:

- balance page DTO;
- movement page DTO;
- movement request/type enum.

Expenses:

- ExpenseCategoryDto;
- CreateExpenseRequest;
- ExpenseDto;
- CashSource.

Exact names MUST follow OpenAPI.

### Endpoint registry

Add conceptually:

Inventory:

- balances(params)
- movements(params)
- createMovement

Expenses:

- categories
- create

No hardcoded paths across components.

### Navigation

Current navigation path union already explicitly enumerates routes such as `/inicio`, `/pedidos`, `/cocina`, `/usuarios`, `/proveedores`. Inventory/Expenses integration will require extending this existing contract minimally. citeturn293544view0

No broad navigation refactor is warranted.

## Data Flow

### Inventory balances

- route `/inventario`
- local filter/page state
- normalized query key
- feature API
- endpoint registry
- shared httpClient
- GET balances
- render table/cards
- passive 30s polling
- manual refresh/mutation invalidation
- authoritative REST refresh

### Manual movement

- open Entry/Write-off dialog
- query/select real Product from balances
- local form state
- local warning calculation only
- generated request
- POST movement
- backend persists canonical result
- invalidate balances + movements
- close dialog
- fresh REST state

No optimistic balance patch.

### Inventory history

- route guard
- filter/page state
- GET movements
- render signed movement ledger
- optional 30s polling only while page mounted

### Expense

- route `/gastos`
- categories query starts
- form remains operable if categories fail
- local form validation
- explicit CashSource
- business-date validation
- POST Expense
- authoritative ExpenseDto
- persistent confirmation summary
- `Registrar otro gasto`
- reset local form

No polling.

## Visual Audit Integration

Before presentation work, implementation MUST open all ten supplied PNGs.

For each image, implementation should produce a short checklist:

- container widths;
- primary/secondary hierarchy;
- table/card density;
- spacing;
- button placement;
- dialogs;
- badges;
- mobile breakpoints/composition;
- sticky action behavior;
- state presentation;
- exact elements classified KEEP/ADAPT/OMIT/DEFER.

The classification table in `spec.md` is functionally frozen.

Pixel-derived details remain an explore task because this session could not render ZIP contents.

## Inventory Query Design

### Keys

Conceptual factory:

- `inventoryKeys.all`
- `inventoryKeys.balances(filters)`
- `inventoryKeys.movements(filters)`

Use readonly serializable normalized objects.

### Balances

Query params SHOULD mirror generated contract.

UI-owned filter state:

- search;
- ProductType;
- page;
- pageSize.

`active` SHOULD remain backend default unless implementation needs to send it explicitly.

### Polling

Use TanStack Query's `refetchInterval` or current equivalent.

Recommended:

- 30_000 ms while page/query active.

Do not create raw `setInterval` outside Query unless current architecture has a justified centralized polling abstraction.

### Background UX

During refetch:

- keep previous data;
- show subtle refreshing indicator if UI pattern supports it;
- do not replace whole content with skeleton.

## Product Selector Design

Reusing balances has advantages:

- Product name;
- unit;
- currentQuantity;
- active default.

Selector SHOULD support:

- search server-side;
- pagination/load-more.

Because manual mutation dialog is ADMIN/ENCARGADO-only, no separate Product permission problem is introduced.

Do not fetch all pages automatically merely to build an in-memory catalog.

A searchable paged selector is preferred.

## Decimal Input Design

Avoid JavaScript floating artifacts where possible.

Form may keep the input as string until validation/request mapping.

Validation:

- syntactically decimal;
- > 0;
- <=4 fractional digits for Inventory;
- <=2 fractional digits for Expense.

Do not silently round invalid user input.

Use decimal value expected by generated JSON contract only at request boundary.

## Inventory State Design

Pure presentation mapper:

- quantity <0 → Negative;
- else isLowStock → Low;
- else Normal.

This helper SHOULD be testable and reusable by desktop/mobile presentations.

Labels:

- `Saldo negativo`
- `Stock bajo`
- `Normal`

Color MUST not be the only indicator.

## Movement Form Design

One reusable form MAY support two explicit modes:

### ENTRY

- title `Registrar entrada`;
- type fixed internally to ENTRY.

### WRITE_OFF

- title `Registrar baja`;
- type fixed internally to WRITE_OFF;
- stock impact warning.

Do not expose a user-editable movement-type selector for manual creation.

### Read-only responsible

If current `AuthUser` includes suitable display name:

- show it.

If not:

- omit the field rather than inventing another request/user lookup.

## Insufficient-Stock Preview

Local computation:

`result = currentQuantity - requestedQuantity`

is allowed only for warning/presentation.

It MUST NOT become authoritative cache state.

Cases:

- result >=0 → standard write-off warning.
- result <0 and current >=0 → insufficient stock warning.
- current <0 → already-negative warning.

Backend response remains authoritative.

## History Design

Desktop:

- table-like ledger.

Mobile, if later requested by actual visual reference or necessary for 360:

- rows/cards.

The user only explicitly provides a mobile balance reference; nevertheless route MUST remain usable at 360px.

Reference IDs MUST remain plain text unless a real corresponding feature route exists.

## Expense Query Design

### Key

`expenseKeys.categories()`

No Expense list key.

Categories may use a reasonable stale time because they are a small slowly-changing read catalog.

Do not poll categories every 30s.

### Graceful category degradation

The form does not depend on successful category retrieval.

States:

- loading → select may show loading;
- success nonempty → category choices;
- success empty → Sin categoría only;
- error → Sin categoría + warning + Retry.

## Business Date Design

Frontend needs a small timezone-safe utility.

Input:

- current instant.

Output:

- `YYYY-MM-DD` date in `America/La_Paz`.

Preferred implementation:

- existing date utility if present;
- otherwise Web Intl APIs/simple helper.

Do not add a heavy dependency solely for this.

Both initial default and max should call the same helper to avoid drift.

## Expense Form Design

Fields:

- amount;
- category optional;
- cashSource;
- description;
- expenseDate.

Optional read-only responsible display.

### CashSource

Radio/card control is appropriate if confirmed by screenshot audit.

Neither selected initially.

### Success state

Treat successful response as a view-state transition from form to confirmation.

Do not add Expense to a local history.

No pseudo-list.

`Registrar otro gasto` returns to a fresh form.

## ProblemDetails Design

Current `HttpError` exposes:

- status;
- ProblemDetails title/detail. citeturn293544view2

Feature-level mapping SHOULD:

- reuse this type;
- create safe Spanish user messages;
- use field validation errors if generated/shared parser supports them;
- fall back to a generic safe message.

Do not create another global HTTP error architecture.

## Responsive Design

### Inventory balances

Desktop:

- table/structured data.

403/360:

- card/list stack.

### Inventory dialogs

At mobile:

- full-width within viewport;
- scrollable content where necessary;
- actions remain reachable.

### History

Must remain usable at 360 even though no named mobile screenshot exists.

### Expenses

Desktop:

- layout from Register Desktop.

403/360:

- adapt from Mobile View;
- optional sticky CTA if safe.

### Navigation

Use existing responsive AppShell behavior. Do not implement screenshot bottom-nav as a second global system.

## Required Tests Per Layer

### API adapters

Inventory:

- balances method/params;
- movements method/params;
- movement POST.

Expenses:

- categories GET;
- create POST.

Assert shared client use and no token args.

### Query keys

- search changes balance key;
- ProductType changes balance key;
- page changes key;
- movement filters change history key;
- categories key independent.

### Authorization/routing

Inventory:

- ADMIN/ENCARGADO full;
- MESERO/COCINA/CONTADORA balances only;
- EMPLEADO denied.

Expenses:

- ADMIN/ENCARGADO allowed;
- all other role-only denied;
- multi-role union.

### Balance presentation

- zero;
- positive normal;
- low equal threshold;
- low below;
- negative priority;
- min null;
- ProductType labels;
- decimal formatting.

### Inventory forms

- Entry valid/invalid;
- Write-off valid/invalid;
- unit read-only;
- reason;
- decimal precision;
- no actor;
- warning-only negative result;
- success invalidation.

### History

- data;
- filters;
- signed quantity;
- enum labels;
- empty/error/pagination;
- forbidden roles.

### Polling

Using fake timers/query mocks:

- ~30s refetch;
- no SignalR;
- mutation invalidates independently;
- previous data preserved semantics;
- no Expense polling.

### Expenses

- categories;
- categories empty/error;
- optional category;
- amount;
- explicit CashSource;
- description;
- Bolivia date;
- past/future;
- request purity;
- success confirmation;
- register another;
- double-submit prevention;
- no history UI.

### Scope-negative tests

Where useful, assert absence of:

Inventory:

- Configure MinStock;
- Export;
- aggregate metrics.

Expenses:

- Historial tab;
- Expense table;
- Search;
- Shift;
- cash balance;
- Gastos hoy;
- Ver historial;
- cloud sync.

## Tradeoffs Accepted

- REST polling instead of realtime for Inventory.
- Approximately 30s freshness rather than immediate remote notification.
- Immediate invalidation after own mutation.
- No optimistic stock cache.
- No aggregate cards without aggregate backend.
- No local low-stock filters on paged data.
- Searchable paginated Product selector rather than eager loading entire catalog.
- Decimal form strings until request mapping.
- Category-query failure does not block Expense.
- No Expense history/cache.
- MVP fidelity over pixel perfection.
- No global navigation redesign.
- No heavy date dependency merely for Bolivia business date.

## Implementation Constraints

- No backend changes in normal path.
- No SignalR.
- No new auth client.
- No token persistence.
- No second HTTP client.
- No second QueryClient.
- No generated file manual edits.
- No fake Products.
- No fake Expenses.
- No fake Categories.
- No fake SKU.
- No fake Shift.
- No fake cash balance.
- No fake global inventory metrics.
- No MinStock mutation.
- No Expense history.
- No client-side aggregate lies.
- No optimistic Inventory mutations.
- No Git mutations.
- Do not claim visual images inspected until actually opened.

## Open Design Questions

### Blocking before APPLY: backend contract

The currently visible public `develop` still lacks Inventory/Expense endpoints/generated DTOs.

The future local baseline MUST be rechecked.

If the required backend is genuinely absent:

`BASELINE_CONTRACT_BLOCKER`.

### Blocking before visual freeze: binary image inspection

The two ZIP attachments could not be opened with the tools available in this session.

All ten images MUST be visually inspected before final layout implementation.

This does NOT reopen:

- functionality;
- role matrix;
- keep/adapt/omit/defer functional decisions;
- polling;
- low-stock scope;
- HU-021 exclusion.

### Non-blocking repository adaptations

The future session must autonomously resolve:

- exact generated type names;
- exact PagedResponse naming;
- exact feature folder conventions after newer integrations;
- exact Dialog/Toast/Pagination component names;
- exact route integration point;
- exact test utilities;
- exact existing date utilities.

These are not human product blockers.
