# Design

## Components Touched

### Backend — likely

Based on the public baseline, likely areas are:

- authorization policy registration in the API composition root;
- Inventory endpoint authorization indirectly through the existing `InventoryHistory` policy;
- existing authorization matrix integration tests;
- no Domain change;
- no Application DTO change;
- no Infrastructure persistence change;
- no migration.

### Frontend — likely

- central authenticated navigation/capability definitions;
- AppRoutes;
- Inventory feature navigation;
- Purchase route role wiring;
- Shift route role wiring;
- conditional routing fixes discovered by the local audit;
- Production layout only if nested shell remains locally;
- role/routing/navigation tests.

### Documentation — likely

- `docs/historias/HU-007-sprint-2.md`;
- current-state permission documentation only where factual drift is confirmed;
- this new change.

Exact files MUST be enumerated from the local working tree during Phase 0.

## Existing Authorization Architecture

### Backend

The current public backend uses ASP.NET Core policies registered centrally and applies them through `RequireAuthorization` at endpoint/group level.

Relevant existing policies include:

- `CatalogRead`;
- `CatalogWrite`;
- `InventoryRead`;
- `InventoryManage`;
- `InventoryHistory`;
- `OrdersAccess`;
- `KitchenManage`;
- `SupplierRead`;
- `OperationsPurchase`;
- `OperationsShiftManage`.

This architecture is sufficient and MUST be extended/corrected rather than replaced. citeturn963166view0

### Frontend

The current public frontend uses:

- `RequireAuth`;
- `RequireAnyRole`;
- `useAuth().hasAnyRole`;
- role arrays/capability helpers;
- one centralized navigation registry;
- one shared `AuthenticatedLayout` rendering desktop sidebar and mobile drawer. citeturn665215view0 citeturn258014view0

No new permission framework is required.

## Canonical Capability Matrix

| Capability         | ADMIN | ENC | MES | COC | CON | EMP |
| ------------------ | ----: | --: | --: | --: | --: | --: |
| Manage Composition |     ✓ |   ✓ |   — |   — |   — |   — |
| Read Composition   |     ✓ |   ✓ |   ✓ |   ✓ |   — |   — |
| Configure MinStock |     ✓ |   ✓ |   — |   — |   — |   — |
| Read Inventory     |     ✓ |   ✓ |   ✓ |   ✓ |   ✓ |   — |
| Production         |     ✓ |   ✓ |   — |   ✓ |   — |   — |
| Sale               |     ✓ |   ✓ |   ✓ |   — |   — |   — |
| Purchase mutation  |     ✓ |   ✓ |   — | ✓\* |   — |   — |
| Purchase read      |     ✓ |   ✓ |   — |   ✓ |   ✓ |   — |
| Shift manage       |     ✓ |   ✓ |   — |   — |   — |   — |
| Own Shift          |     ✓ |   ✓ |   ✓ |   — |   — |   — |

ProductManage is additionally frozen as:

ADMINISTRADOR + ENCARGADO only.

ProductRead remains its own preexisting capability.

## Multi-role Semantics

Use OR/union semantics everywhere.

Backend `RequireRole(a,b,...)` already accepts a principal satisfying any listed role.

Frontend `hasAnyRole` likewise uses:

allowed role ∈ current user roles.

The design MUST preserve these semantics.

Do not add:

- primaryRole;
- highestRole;
- restrictive intersection;
- role priority ordering.

Recommended tests use:

`MESERO + ENCARGADO`

because it clearly demonstrates that:

- MESERO-specific access is retained;
- ENCARGADO management access is also retained.

## Backend Strategy

### Product

Public baseline is already correct:

- read: `CatalogRead`;
- mutate: `CatalogWrite` ADMIN/ENC.

Apply:

- no production code change if local matches;
- add/retain regression for EMPLEADO and all six roles.

### Composition

Public backend is already correct:

- GET → `CatalogRead`;
- PUT → `CatalogWrite`.

No backend redesign.

### MinStock

Public backend is already correct:

- PUT minimum-stock → `InventoryManage`.

No change if local matches.

### Inventory Movements

Public mismatch:

`InventoryHistory` currently requires only ADMIN/ENC, while frozen final Inventory read includes Movimientos for five roles.

Minimal preferred correction:

- keep policy name `InventoryHistory`;
- expand its roles to match `InventoryRead`:
  - ADMINISTRADOR;
  - ENCARGADO;
  - MESERO;
  - COCINA;
  - CONTADORA.

Why this approach:

- zero route changes;
- zero endpoint changes;
- zero DTO changes;
- zero new policies;
- minimal diff;
- `InventoryManage` remains unchanged.

Alternative acceptable if local conventions clearly favor it:

- authorize GET movements directly with `InventoryRead`.

Do not create a third read policy.

### Production

Backend permissions already align through `KitchenManage`.

No change unless local baseline contradicts the matrix.

### Sale

`OrdersAccess` already aligns with ADMIN/ENC/MES.

No change.

### Purchases

Backend group read policy and mutation policy already implement the required read/write separation.

Preserve service-level COCINA qualifier.

No backend change unless the local audit identifies an actual divergence.

### Shifts

Current endpoint authorization is already aligned:

- manage → ADMIN/ENC;
- own shift → OrdersAccess = ADMIN/ENC/MES.

Frontend is the drift point.

## Frontend Capability Strategy

Avoid scattered new role arrays.

Reuse existing constants and introduce only missing capability constants where this reduces contradiction.

Recommended conceptual role constants:

- existing `PRODUCT_READ_ROLES`;
- existing `PRODUCT_MANAGE_ROLES`;
- existing `PURCHASE_READ_ROLES`;
- existing `PURCHASE_WRITE_ROLES`;
- existing `SHIFT_MANAGE_ROLES`;
- add/reuse `SHIFT_OWN_READ_ROLES = ADMINISTRADOR | ENCARGADO | MESERO`;
- optionally centralize `INVENTORY_READ_ROLES` if currently duplicated in router/navigation.

Do not build a generic ACL engine.

### Purchases

Current public drift:

- feature already has `PURCHASE_READ_ROLES`;
- AppRoutes imports only `PURCHASE_WRITE_ROLES`;
- central navigation also uses `PURCHASE_WRITE_ROLES`.

Target:

- `/compras` → `PURCHASE_READ_ROLES`;
- central navigation → `PURCHASE_READ_ROLES`;
- `/compras/nueva` → `PURCHASE_WRITE_ROLES`;
- `/compras/:id/recibir` → `PURCHASE_WRITE_ROLES`;
- cancel/create/receive actions → existing write capability.

This lets CONTADORA read without mutating.

### Own Shift

Target:

- central navigation item `Turnos / Caja` visible only to union:
  - ADMIN;
  - ENC;
  - MES.
- target:
  - ADMIN/ENC → `/turnos`;
  - MES → `/mi-turno`.
- `/mi-turno` must use `RequireAnyRole(SHIFT_OWN_READ_ROLES)`;
- `/turnos` remains `SHIFT_MANAGE_ROLES`.

COCINA/CONTADORA/EMPLEADO must see neither target.

### Inventory

Target:

- route `/inventario` → Inventory read roles;
- route `/inventario/movimientos` → same Inventory read roles;
- mutation controls still evaluate ADMIN/ENC.

## Routing Strategy

Perform a source-derived route inventory before edits.

For every Sprint 2 workflow capture:

- route;
- page component;
- parent layout;
- route guard;
- navigation entry;
- local CTA;
- back/cancel action;
- expected role;
- direct URL result.

Only fix rows with a reproduced gap.

### Composition potential gap

Public Products renders:

`/productos/{id}/composicion`

for a PREPARATION manager action, while the inspected public AppRoutes snapshot does not expose that route. citeturn791043view1 citeturn791043view0

Local preflight MUST determine whether this is already resolved.

If still missing:

- register the existing HU-004 Composition page;
- preserve its existing path if that is the path already emitted by Product UI;
- use Product/Composition read/manage guards according to actual page behavior;
- do not reimplement Composition.

### Checkout

Public current baseline already has:

- `/pedidos/:id/cobrar`;
- `Confirmar venta` CTA on ENTREGADO Order.

Therefore this row should normally be marked healthy and left untouched. citeturn228692view0

### Production shell

Public `RegisterProductionPage` explicitly renders `AppShell` even though AppRoutes already places it inside `AuthenticatedLayout`. citeturn770804view3

If local baseline still has this nested global shell:

- remove only the feature-owned global shell wrapper;
- preserve all Production business UI/content;
- allow the parent `AuthenticatedLayout` to remain the sole global shell.

Do not redesign HU-007 while doing this.

## Inventory Navigation Design

### Current issue

Two navigation implementations exist:

1. `InventoryNavigation` for Existencias/Notificaciones.
2. hardcoded nav inside `InventoryMovementsPage`.

They have diverged.

### Target component responsibility

A shared Inventory navigation composition should own:

- links;
- active view;
- notification badge.

Conceptual API:

`InventoryNavigation({ active })`

where:

- `active = balances`;
- `active = movements`;
- `active = notifications`.

The exact signature MAY adapt to existing code.

### Destinations

- Existencias → `/inventario`;
- Movimientos → `/inventario/movimientos`;
- Notificaciones → `/inventario?tab=notificaciones`.

No route redesign is required.

### Summary count

The component MAY call the existing summary Query hook directly, provided it uses the same stable TanStack Query key, or the parent MAY provide the count.

Preference:

reuse the existing summary Query hook/query key so TanStack Query deduplicates requests.

Do not add another API wrapper.

### Failure semantics

The tabs themselves should remain navigable even if Summary fails.

If summary:

- loading → omit numeric badge until data exists;
- error → omit badge rather than invent `0`;
- success with zero → no badge;
- success with N > 0 → badge N.

The Inventory content query error remains separate.

### Accessibility

Use:

`Notificaciones` + visible numeric badge.

Do not use:

- color-only status;
- icon-only count;
- `aria-live` that repeatedly announces background changes without user need.

An accessible name equivalent to:

`Notificaciones, 4 productos con stock bajo`

MAY be added if consistent with current components.

## HU-007 Documentation Strategy

### Source reconstruction

Build the manifest from:

- current local diff/history;
- actual Production implementation;
- actual tests;
- generated contracts consumed by Production;
- actual route/navigation;
- OpenSpec/handoff documents.

Do not infer a file solely from another HU.

### Expected factual areas

Subject to local verification:

Backend:

- Operations domain entity for Production;
- Operations Application contract;
- OperationsService Production logic;
- Operations endpoint;
- Sprint 2 migration that actually introduced Production;
- relevant PostgreSQL tests.

Frontend:

- Production API;
- Production feature export;
- Production page/components;
- route wiring;
- navigation where directly part of HU-007;
- generated API contract consumed by Production;
- Production tests if present.

Documentation:

- HU-007;
- original Sprint 2 backend OpenSpec/handoff;
- this stabilization change only when directly relevant.

### Evidence handling

Do not overwrite historical evidence text solely because counts are old.

Instead distinguish:

- historical backend evidence;
- current regression evidence produced during this change;
- manual evidence.

If no local captures:

`MANUAL_EVIDENCE_PENDING`.

If real captures exist:

link exact paths.

## Boundaries Respected

- Backend remains security authority.
- Frontend guards complement backend policies.
- ProductRead is not conflated with ProductManage.
- InventoryRead is not conflated with InventoryManage.
- PurchaseRead is not conflated with PurchaseWrite.
- Shift own-read is not conflated with Shift manage.
- No global permission rewrite.
- No authentication rewrite.
- No feature business-rule redesign.
- No backend Inventory expansion for the badge.
- No notification persistence.
- No OpenSpec history rewrite.
- No new HU.
- No schema modification.

## Contracts Changed

No external contract changes are confirmed as required from the provided scope.

Expected:

- routes: unchanged;
- HTTP verbs: unchanged;
- DTO shapes: unchanged;
- endpoint count: unchanged;
- generated TypeScript: unchanged;
- migration count: zero.

Authorization behavior for an existing GET may broaden to the frozen role set, but its HTTP contract remains structurally unchanged.

If APPLY discovers that fixing a confirmed issue requires a request/response schema change, it MUST pause that portion as an unexpected contract finding rather than treating it as routine.

## Data Flow

### Backend authorization

Authenticated request
→ JWT roles
→ existing ASP.NET Core policy
→ endpoint
→ existing business logic.

### Frontend authorization

Authenticated user roles
→ existing `hasAnyRole`
→ capability role arrays
→ central navigation visibility
→ `RequireAnyRole`
→ feature action visibility.

Backend remains independently authoritative.

### Purchase read

CONTADORA
→ `PURCHASE_READ_ROLES`
→ Compras nav visible
→ `/compras` guard passes
→ GET Purchases
→ backend `SupplierRead` passes
→ mutation controls remain hidden because not in WRITE roles.

### Own Shift

Authenticated role
→ `SHIFT_OWN_READ_ROLES`
→ if ADMIN/ENC:
Turnos target `/turnos`
→ if MES:
target `/mi-turno`
→ otherwise:
no navigation entry.

Direct `/mi-turno`
→ route guard
→ forbidden for COC/CON/EMP.

### Inventory

Inventory reader
→ `/inventario`
→ shared InventoryNavigation
→ Summary query cache
→ `lowStockCount`
→ badge if >0.

Inventory reader
→ `/inventario/movimientos`
→ same shared navigation
→ GET movements
→ expanded read authorization
→ no mutation capability implied.

## Required Tests Per Layer

### Backend authorization/integration

If current infrastructure exists, extend:

- existing Operations authorization matrix;
- Inventory/Expense PostgreSQL integration suite;
- Catalog authorization coverage.

Prefer data-driven role cases.

Required capabilities:

- Product manage;
- Composition read/manage;
- MinStock;
- Inventory read/history;
- Inventory mutation regression;
- Production;
- Sale;
- Purchase read/write;
- Shift manage;
- own Shift;
- anonymous;
- one multi-role case.

### Frontend permission tests

If test infrastructure exists, add/extend tests for:

- Products EMPLEADO regression;
- Product manage ADMIN/ENC;
- Purchase read CONTADORA;
- Purchase mutations hidden for CONTADORA;
- own Shift COC/CON/EMP forbidden;
- multi-role navigation;
- route guard behavior;
- direct URL paths;
- central nav visibility.

### Routing tests

Cover invariants, not a giant route snapshot:

- every locally confirmed orphan route;
- Composition if missing;
- checkout retained as reachable;
- Production route retained;
- back/cancel paths for touched flows;
- parent navigation active on child routes.

### Inventory tests

- all three tabs from Existencias;
- all three tabs from Movimientos;
- all three tabs from Notificaciones;
- active state per view;
- count 0;
- count 1;
- count N;
- count comes from summary rather than current list;
- summary loading/error does not remove navigation;
- mobile/shared navigation semantics where testable.

### Documentation checks

Review:

- HU-007 real paths;
- no nonexistent manifest entries;
- no false screenshot claims;
- current state vs historical evidence separation.

## Tradeoffs Accepted

- Preserve named backend policies rather than create a generalized capability engine.
- Expand `InventoryHistory` role membership rather than redesign Inventory endpoint authorization.
- Use a few explicit frontend role constants instead of an abstract ACL framework.
- Keep Notifications as a query-param view because it already exists.
- Reuse the Inventory Summary query for the badge, even if Movimientos must subscribe to the same cached query.
- Preserve Purchase service-level COCINA scope instead of expressing every qualifier solely in frontend.
- Keep `/mi-turno` and `/turnos` as separate experiences.
- Perform conditional route fixes only after local reproduction.
- Keep historical HU-007 test evidence but distinguish it from new evidence.

## Implementation Constraints

- APPLY MUST begin with local read-only Git revalidation.
- No source finding from public GitHub may be treated as locally current without verification.
- No Git mutation by the agent.
- No new endpoint.
- No migration.
- No DTO redesign.
- No generated TypeScript edit unless runtime contract unexpectedly changes.
- No auth/JWT rewrite.
- No new authorization library.
- No global navigation redesign.
- No reimplementation of Sprint 2 HUs.
- No weakening COCINA Purchase qualifier.
- No expansion of Inventory mutations.
- No screenshot fabrication.
- No test result fabrication.
- Documentation synchronization occurs after code/gates.
- VERIFY and ARCHIVE remain outside this change unless explicitly requested later.

## Open Design Questions

These are baseline-revalidation questions, not reopened product decisions:

1. What is the exact local HEAD and dirty working-tree diff?
2. Is F-001/F-002 Inventory history restriction still present locally?
3. Are F-003 Purchase read and F-004 own-Shift frontend mismatches still present locally?
4. Is the HU-004 Composition route already registered by uncommitted/local work?
5. Does Production still render a nested `AppShell` locally?
6. What exact qualifier for COCINA Purchase is documented in the current local canonical docs, and does it match the service implementation?
7. Are there local HU-007 screenshots not visible in the public branch?
8. Which HU-007 frontend/tests/generated files are actually part of the current local implementation?

If question 6 reveals an actual conflict between frozen matrix, canonical documentation and implemented qualifier, that specific issue becomes `PRODUCT_DECISION_REQUIRED` and MUST NOT be guessed.
