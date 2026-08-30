# Design

## Existing Architecture

The audited remote baseline already contains a functional Inventory vertical slice.

### Backend

Observed structure:

- `InventoryBalanceDto`;
- `InventoryMovementDto`;
- `IInventoryService`;
- `IInventoryWriter`;
- `InventoryService`;
- Inventory Minimal API endpoints in the existing `/api/v1/inventory` group;
- `InventoryRead`;
- `InventoryManage`;
- PostgreSQL/EF balance persistence;
- generated OpenAPI.

The existing balance query:

- starts from Products;
- left-joins InventoryBalance;
- joins Unit;
- defaults to active Products;
- treats missing balance as quantity zero;
- is paginated;
- supports search/ProductType/activity;
- produces `MinStock` and `IsLowStock`. citeturn717721view0turn717721view1turn403582view0

### Frontend

Observed structure:

- existing `features/inventory/api.ts`;
- existing `InventoryBalancesPage`;
- existing `InventoryMovementsPage`;
- existing `InventoryNavigation`;
- generated API types;
- shared `httpClient`;
- central endpoints registry;
- TanStack Query;
- existing 30-second passive refetch;
- existing root invalidation after manual movements;
- table desktop;
- cards mobile;
- existing role-aware global navigation. citeturn453311view2turn453311view5turn403582view1turn324403view1

This change extends those components rather than creating a second Inventory architecture.

## Visual Reference Audit

### 1. `Estados de Inventario.png`

| Element                             | Decision               | Rationale                                                                                     |
| ----------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| Loading skeleton/table placeholders | ADAPT                  | Use as visual direction for Summary/Notifications loading; reuse existing primitives/Tailwind |
| Large empty-state card              | ADAPT                  | Notifications needs a specialized “no low stock” empty state                                  |
| “No hay productos registrados” copy | OMIT for Notifications | Incorrect when Products exist but none require attention                                      |
| “Registrar entrada” empty CTA       | OMIT for Notifications | HU-006 is read-only                                                                           |
| Success toast for ENTRY             | OMIT                   | Fetching HU-006 data is not a mutation success                                                |
| Error panel                         | ADAPT                  | Reuse warning/error hierarchy and Retry                                                       |
| “servidor del almacén” copy         | OMIT                   | Implies infrastructure not established by the real project                                    |
| Footer server-status indicator      | OMIT                   | No realtime/server-health feature belongs to HU-006                                           |

### 2. `Inventario - Existencias Desktop.png`

| Element                      | Decision                   | Rationale                                                  |
| ---------------------------- | -------------------------- | ---------------------------------------------------------- |
| Inventory title/layout       | KEEP/ADAPT                 | Existing real page already provides it                     |
| Registrar baja/entrada       | KEEP existing              | HU-005 functionality, not reimplemented                    |
| Existencias/Movimientos tabs | KEEP                       | Existing                                                   |
| Notificaciones tab           | ADD                        | Frozen HU-006 requirement                                  |
| Search                       | KEEP                       | Existing                                                   |
| ProductType filter           | KEEP                       | Existing                                                   |
| Stock bajo filter            | ADD                        | HU-006 requirement                                         |
| Saldo negativo filter        | OMIT as new work           | Current remote page has none and prompt says not mandatory |
| Refresh                      | KEEP/EXTEND                | Existing; should refresh summary too                       |
| Desktop table                | KEEP                       | Already matches required columns                           |
| Fake SKU                     | OMIT                       | Current Inventory contract has no SKU                      |
| Stock-bajo row state         | KEEP/ADAPT                 | Existing semantic state                                    |
| Negative severity            | KEEP/ADAPT                 | Existing frontend already gives negative priority          |
| Stock-bajo card              | ADD                        | Supported by global summary                                |
| Negative card                | ADD                        | Supported by global summary                                |
| Stock óptimo/normal card     | ADD as “Normal”            | Derived from summary                                       |
| Total SKU                    | ADAPT to “Total productos” | No contractual SKU should be invented                      |

### 3. `Inventario - Existencias Móvil.png`

| Element                             | Decision                 | Rationale                                       |
| ----------------------------------- | ------------------------ | ----------------------------------------------- |
| Product cards                       | KEEP                     | Existing frontend already uses mobile cards     |
| Current quantity emphasis           | KEEP                     |
| Minimum stock                       | KEEP                     |
| Status badge                        | KEEP                     |
| Negative card severity              | KEEP                     |
| Summary cards                       | ADD/ADAPT                | Use global counts                               |
| Stock bajo mobile filter            | ADD                      |
| Existing shell/header               | ADAPT to actual AppShell | Do not rebuild shell                            |
| Bottom navigation visible in mockup | OMIT as HU-006 work      | Global navigation architecture is outside scope |
| Fake SKU                            | OMIT                     |

### 4. `Inventario - Movimientos Desktop.png`

| Element                                      | Decision                       | Rationale                                         |
| -------------------------------------------- | ------------------------------ | ------------------------------------------------- |
| Inventory module visual continuity           | KEEP                           |
| Existencias/Movimientos internal navigation  | KEEP/EXTEND with Notifications |
| Existing Movement history                    | KEEP untouched                 |
| Export report                                | OMIT                           |
| Generic “Nuevo movimiento” CTA               | OMIT                           | Existing UI has explicit ENTRY/WRITE_OFF behavior |
| Movement summary KPIs                        | OMIT                           | Not HU-006                                        |
| Free-text responsible search shown by mockup | OMIT unless already supported  | Do not expand history API                         |

### 5. `Modales de Inventario.png`

| Element                          | Decision                     | Rationale                                                                |
| -------------------------------- | ---------------------------- | ------------------------------------------------------------------------ |
| Registrar entrada dialog         | KEEP existing / DO NOT TOUCH |
| Registrar baja dialog            | KEEP existing / DO NOT TOUCH |
| Configure minimum-stock modal    | OMIT                         | Minimum stock is already configured via Product flows                    |
| “automatic notification” concept | ADAPT                        | Only derived in-app Inventory visualization; no notification persistence |

### 6. `Productos - Catálogo Unificado Desktop.png`

| Element                              | Decision           | Rationale                                   |
| ------------------------------------ | ------------------ | ------------------------------------------- |
| Whole Product catalog                | OMIT               | Different module                            |
| Low-stock banner                     | KEEP/ADAPT         | Main visual reference for Inventory warning |
| “Ver detalles”                       | KEEP/ADAPT         | Opens Inventory Notifications tab           |
| Product-table minimum stock          | REUSE context only | Configuration already exists elsewhere      |
| Reports/Turnos/other sidebar entries | OMIT               | Screenshot must not expand HU-006           |

## Components Touched

### Backend — expected

- Inventory Application contracts:
  - add `InventorySummaryDto`;
  - extend `IInventoryService` with one summary read operation.

- Inventory Infrastructure service:
  - implement global aggregate/detail query.

- API Inventory route mapping:
  - add exactly one GET route.

- Inventory integration tests:
  - summary counts;
  - scope;
  - authorization.

### Frontend — expected

- endpoint registry:
  - add summary route.

- generated contract:
  - regenerated, never handwritten.

- Inventory API/query layer:
  - Summary generated type;
  - summary key;
  - summary API method;
  - summary query.

- Existing Inventory page/navigation:
  - Summary integration;
  - banner;
  - cards;
  - Notifications tab;
  - low-stock filter;
  - loading/error/empty.

- Inventory tests.

Exact local filenames MUST be revalidated before APPLY because the local baseline may contain post-remote changes.

## Boundaries Respected

- Inventory remains one module.
- No `/low-stock`.
- No persisted notifications.
- No new notification module.
- No separate Inventory store.
- No second HTTP client.
- No auth changes.
- No manual Bearer.
- No second QueryClient.
- No new global navigation.
- No changes to Inventory write transactions.
- No changes to movement types.
- No new MinStock storage.
- No new Product field.
- No migration.
- No changes to unrelated Sprint 2 operations.

## Contracts Changed

### New additive endpoint

Preferred route based on the audited convention:

`GET /api/v1/inventory/summary`

Policy:

`InventoryRead`

Request body:

None.

Query parameters:

None for MVP.

Response:

`InventorySummaryDto`.

Expected status surface:

- `200` — Summary.
- `401` — unauthenticated.
- `403` — authenticated but unauthorized.

No business-state 409 is expected for this read-only derived query.

### New DTO

Conceptual contract:

- `totalProducts: int`
- `lowStockCount: int`
- `negativeStockCount: int`
- `normalStockCount: int`
- `lowStockItems: IReadOnlyList<InventoryBalanceDto>`

The exact generated casing follows existing ASP.NET/OpenAPI conventions.

### Why Case B is selected

The audited `GET /api/v1/inventory/balances`:

- is paginated;
- has search;
- has ProductType;
- has active filtering;
- does not expose a low-stock filter.

Therefore it cannot currently retrieve the complete low-stock set in one reliable filtered query. citeturn717721view1turn403582view0

Adding a new filter to balances plus adding a Summary endpoint would expand two contracts.

The minimal approved design therefore selects:

**CASE B — one Summary endpoint returning global counts + all low-stock details.**

This preserves existing APIs unchanged and satisfies both:

- global aggregate accuracy;
- complete Notifications details.

### Existing contracts

No breaking changes are expected for:

- `InventoryBalanceDto`;
- balance paging;
- movements;
- manual movement creation;
- minimum-stock mutation.

## Low-Stock Predicate

Define one conceptual predicate for HU-006 summary:

- critical negative:
  `quantity < 0`
- threshold low:
  `minStock != null && quantity <= minStock`
- HU-006 low set:
  `negative OR threshold low`

This preserves:

- equality threshold;
- negative inclusion;
- null-threshold baseline for nonnegative stock.

Where safe, the backend SHOULD reuse this predicate in the balance DTO mapping so that `isLowStock` and summary membership cannot diverge.

If the local stabilized baseline already defines a canonical helper/expression, use it instead.

## Global Count Semantics

For the default operational universe:

`totalProducts`
= number of included Products.

`negativeStockCount`
= count(quantity < 0).

`lowStockCount`
= count(quantity < 0 OR configured threshold reached).

`normalStockCount`
= totalProducts - lowStockCount.

Important:

negativeStockCount is informational subset data.

Do not compute:

`normal = total - low - negative`.

Example:

- total = 100;
- low = 15;
- negative = 3;
- normal = 85.

## Product Scope

Remote behavior currently uses:

`Product.IsActive == (active ?? true)`.

Summary therefore SHOULD use active Products only if the local stabilized baseline retains this convention.

Products without materialized balances receive quantity zero through the same left-join semantics.

Summary details and normal balances MUST not silently use different universes.

## Backend Query Strategy

Preferred:

1. Start with the same Product + left InventoryBalance + Unit projection as balances.
2. Apply the same operational active scope.
3. Represent missing balance as zero.
4. Calculate counts in PostgreSQL/EF-compatible expressions.
5. Retrieve low-stock detail rows only.
6. Map detail rows to the existing `InventoryBalanceDto`.
7. Return one Summary object.

The implementation MAY perform a small fixed number of database queries:

- aggregate counts;
- low-stock detail rows.

This is preferable to materializing all Inventory Products in application memory.

No cross-request consistency transaction is required for an operational dashboard read. Counts/details are current-state observations and may naturally change between refreshes.

## Frontend Integration Strategy

### Existing page

Retain `InventoryBalancesPage` as the `/inventario` entry point.

It already owns:

- PageHeader;
- manager ENTRY/WRITE_OFF actions;
- navigation;
- search;
- ProductType;
- list;
- pagination;
- mobile cards.

HU-006 layers summary UI around it.

### Tab state

Preferred minimal approach, subject to local baseline:

- `/inventario` = Existencias.
- `/inventario?tab=notificaciones` = Notifications.
- `/inventario/movimientos` = existing manager-only route.

This:

- avoids a new low-stock page;
- allows `Ver detalles` to be deterministic/deep-linkable;
- avoids introducing another route guard;
- preserves `/inventario/movimientos`.

If the local stabilized frontend already has a shared tab-routing abstraction, use that instead.

### InventoryNavigation

The navigation should support three conceptual destinations:

For ADMIN/ENCARGADO:

- Existencias;
- Movimientos;
- Notificaciones.

For MESERO/COCINA/CONTADORA:

- Existencias;
- Notificaciones.

Do not show a disabled Movimientos tab to unauthorized users.

### Summary Query

Extend the existing key root:

- inventory root;
- balances;
- movements;
- summary.

Exact naming follows current code conventions.

Summary SHOULD reuse the current passive Inventory refresh cadence if still present locally.

The remote implementation already invalidates all Inventory queries after manual movement success; a summary key beneath that root will therefore refresh after ENTRY/WRITE_OFF without new mutation coupling. citeturn403582view2

### Warning

On Existencias:

if `summary.lowStockCount > 0`:

- warning Card/Alert;
- count;
- short explanatory copy;
- `Ver detalles`.

No success banner when count is zero.

### Summary Cards

Use summary query only.

Desktop:

four-column or responsive grid consistent with current content width.

Mobile:

2x2 or single-column as space requires.

Labels:

- Stock bajo;
- Negativos;
- Normal;
- Total productos.

Do not use `Total SKU` unless the local contract actually contains SKU terminology.

### Stock bajo filter

Current remote filters are:

- search;
- ProductType.

There is no low-stock parameter in BalanceFilters. citeturn453311view2

Add frontend state:

- lowStockOnly.

When false:

- preserve existing paginated `balances` source.

When true:

- use the complete `summary.lowStockItems` collection;
- apply search/ProductType against that complete collection;
- apply local UI paging/slicing if necessary;
- reset page when filter state changes.

This is safe because the backend has supplied the complete relevant set.

Do not filter only `query.data.items`.

Do not add a negative-only filter unless it already exists locally.

### Notifications

Use `summary.lowStockItems` directly.

Recommended sorting:

1. negative items before nonnegative low stock;
2. stable Product name ordering within each severity.

This sorting can remain presentation-side.

No new API request per card.

### Data states

Existencias balance data and Summary are separate server-state concerns.

If Summary fails while balances remain available:

- continue showing balances;
- suppress unreliable count/banner values;
- offer summary Retry.

Notifications is Summary-dependent and can show a complete Summary error state.

Background refetch errors should retain previous TanStack Query data.

## Data Flow

### Summary

Authenticated UI
→ `useInventorySummary`
→ shared httpClient
→ GET `/api/v1/inventory/summary`
→ InventoryRead
→ Inventory service read query
→ Product + InventoryBalance + Unit
→ aggregate counts + low details
→ `InventorySummaryDto`
→ TanStack Query cache
→ banner/cards/filter/Notifications

### Warning to details

Summary lowStockCount > 0
→ render warning
→ user activates `Ver detalles`
→ Inventory tab state becomes Notificaciones
→ render cached `lowStockItems`
→ background Query lifecycle remains active

### Manual movement interaction

Existing ENTRY/WRITE_OFF
→ backend writes Inventory
→ existing mutation success
→ invalidate `inventoryKeys.all`
→ balances refetch
→ summary refetch
→ new warning/counts/details reflect state

No HU-006-specific mutation is introduced.

## Required Tests Per Layer

### Backend integration

If existing PostgreSQL integration infrastructure exists, extend it for:

Authorization:

- ADMINISTRADOR 200;
- ENCARGADO 200;
- MESERO 200;
- COCINA 200;
- CONTADORA 200;
- EMPLEADO-only 403;
- anonymous 401.

Summary:

- all normal;
- below min;
- equal min;
- zero;
- negative;
- negative subset;
- missing InventoryBalance;
- MinStock null;
- total count;
- same active scope as balances;
- no Inventory mutation.

OpenAPI:

- route present;
- response schema present.

### Frontend

Use Vitest/Testing Library conventions already configured; package scripts observed include `format:check`, `typecheck`, `lint`, `test`, `build` and `api:generate`. citeturn453311view8

Tests should cover:

- Summary API/query integration;
- warning positive state;
- no warning at zero;
- View details;
- tab accessibility;
- negative card;
- ordinary low card;
- healthy empty;
- loading;
- initial error;
- Retry;
- low-stock filter;
- negative included in filter;
- search/ProductType interaction while lowStock is active;
- role-specific tabs;
- EMPLEADO route denial through existing guard;
- existing balances rendering;
- existing movements route unaffected;
- responsive structural semantics where practical.

Do not test Tailwind class strings as business behavior.

## Tradeoffs Accepted

- One endpoint contains counts + low details to avoid modifying the existing balance contract and creating another endpoint.
- Low-stock details are unpaginated because they are a targeted operational subset; paging MAY remain frontend-only if the set becomes visually large.
- Summary may execute a fixed small number of SQL queries rather than a single overly complex query.
- Summary/read data is eventually current through existing refetch behavior; snapshot-level consistency across counts/details is not promoted to a financial transaction guarantee.
- Existing Inventory layout is preserved rather than recreated to match mockups pixel-perfectly.
- No global notification infrastructure is introduced.

## Alternatives Rejected

### Add `/low-stock`

Rejected: duplicates Inventory module and contradicts the frozen reuse decision.

### Add `/inventory/low-stock` plus `/inventory/summary`

Rejected: exceeds the single-new-endpoint constraint.

### Add a `lowStock` query parameter to balances plus summary endpoint

Rejected for MVP: it changes two API surfaces when Summary can provide the complete detail set itself.

### Filter the visible balance page in React

Rejected: would produce incomplete/global-looking results.

### Fetch every balance page to compute summary client-side

Rejected: inefficient and makes frontend responsible for backend aggregate truth.

### Persist LowStockAlert rows

Rejected: alert status is derived current state.

### Background alert job

Rejected: no persistent notification requirement exists.

### SignalR

Rejected: current REST Query lifecycle is sufficient.

### Sum all quantities into a total inventory number

Rejected: heterogeneous units cannot be meaningfully added.

### Add another MinStock modal

Rejected: configuration already exists.

### Replace existing Inventory page

Rejected: current page already supplies the correct foundation.

## Implementation Constraints

- Exactly one new backend endpoint.
- Expected migration count: zero.
- Existing Inventory routes remain stable.
- No second Inventory service.
- No Inventory writes for summary.
- Use InventoryRead.
- Do not broaden InventoryManage.
- Use generated types after OpenAPI regeneration.
- Do not edit generated TypeScript.
- Keep Auth/shared HTTP/QueryClient unchanged.
- Do not redesign AppShell.
- Do not add global notification UI.
- Keep Movements functionality out of HU-006 changes except internal tab navigation continuity.
- Do not implement screenshot-only KPIs.
- Do not fabricate SKU.
- Do not fabricate screenshots/evidence.

## Open Design Questions

No product-design question remains open from the supplied decisions.

One repository-state blocker remains:

- the local `develop` after `stabilize-sprint-2-backend-and-openapi-contracts` MUST be inspected before APPLY;
- if it differs materially from the audited remote architecture, exact files and any already-supported capability MUST be adapted to local truth.

This is an explore/baseline requirement, not a human product decision.
