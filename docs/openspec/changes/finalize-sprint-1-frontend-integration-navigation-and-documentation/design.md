# Design

## Components Touched

### Confirmed public integration areas

- `AppRoutes` or local equivalent.
- `AuthenticatedLayout`.
- central `authenticatedNavigation`.
- `AppShell`.
- `AppLayout`.
- `SidebarNav`.
- Products feature/pages.
- Suppliers page/components.
- Attendance management and own-history pages.
- UI tests.
- frontend documentation.
- project documentation.

Public `develop` currently shows `AuthenticatedLayout` and `authenticatedNavigation` as one navigation path, while `AppLayout`/`SidebarNav` form a second path. citeturn119155view1turn765548view1turn123137view0

Exact files MUST be determined from local `develop`.

## Boundaries Respected

- One global authenticated shell only.
- Content-level internal navigation remains allowed.
- Backend authorization remains unchanged.
- Auth/token lifecycle remains unchanged.
- Existing feature business flows remain unchanged unless explicitly listed.
- Dashboard references influence shell appearance only.
- Supplier mobile change modifies presentation, not Supplier contract.
- Attendance change uses existing backend contract only.
- Products role correction cannot overrule backend policy.
- Documentation reconciliation occurs after implementation truth is stable.
- Historical planning and ADR/OpenSpec chronology remain intact.

## Contracts Changed

### Frontend navigation contract

The internal global-navigation contract is expected to evolve.

It needs enough information to drive:

- desktop sidebar;
- mobile drawer;
- route active state;
- visibility;
- role-dependent Attendance destination.

A conceptual capability record may contain:

- id;
- label;
- icon;
- canonical route or route resolver;
- allowedRoles;
- manageRoles where relevant;
- activeMatch;
- group.

Exact TypeScript shape is not frozen.

### External backend contracts

No external contract change is confirmed or permitted.

Attendance public contract currently appears sufficient.

Product CONTADORA access is the only material public contract discrepancy currently identified.

If that discrepancy remains locally, this change cannot solve it.

## Data Flow

### Global navigation

- AuthProvider exposes authenticated user roles.
- Central capability registry evaluates `hasAnyRole`.
- Same resulting capability list feeds:
  - desktop sidebar;
  - mobile drawer.
- Active matcher evaluates current route.
- Navigation target resolves role-aware variant only where needed.
- Route definitions reuse the same role contracts.
- Feature actions reuse manage/read capability helpers where appropriate.

### Attendance navigation

- roles contain ADMINISTRADOR/ENCARGADO
  - Asistencia nav target → management route.
- otherwise
  - Asistencia nav target → own-history route.
- both routes belong to the same conceptual active capability.
- route guards remain distinct.

### Routed content

- authenticated root owns global shell.
- routed page returns content only.
- page MAY render:
  - header;
  - filters;
  - feature tabs;
  - tables/cards;
- page MUST NOT render another global shell/sidebar/drawer.

### Supplier responsive

- Supplier query/state remains feature-owned.
- Desktop breakpoint → existing DataTable representation.
- Mobile breakpoint → SupplierCard list.
- Both consume identical Supplier result data.
- Manage capability controls CTA/kebab.
- No duplicated query solely for responsive rendering.

### Documentation

- frontend implementation stabilizes.
- quality gates pass.
- document audit classifies every relevant document:
  - CURRENT;
  - NEEDS_UPDATE;
  - HISTORICAL_KEEP;
  - NOT_RELEVANT.
- only NEEDS_UPDATE docs are modified.
- final cross-document consistency review runs.
- retrospective template created last.

## Repository Audit Mandate

Future APPLY MUST inspect at minimum:

### Git

- branch;
- HEAD;
- status.

### Frontend configuration

- `frontend/package.json`;
- Vite/Tailwind configs if shell behavior requires them;
- test config.

### Routing

- `frontend/src/routes/` or actual equivalent;
- all `Route`, `Navigate`, guard components;
- wildcard behavior;
- dev routes.

### Authentication / roles

- AuthProvider;
- useAuth;
- role helpers;
- RequireAuth;
- RequireAnyRole;
- current AuthUser role shape.

### Global navigation/layout

Search repository for:

- `AppShell`;
- `AppLayout`;
- `Sidebar`;
- `SidebarNav`;
- `Navigation`;
- `Drawer`;
- `<aside`;
- `<nav`;
- `bottomNav`;
- global headers.

Every result MUST be classified:

- GLOBAL_CORRECT;
- FEATURE_DUPLICATE;
- CONTENT_NAVIGATION_VALID;
- OBSOLETE_AFTER_CONSOLIDATION.

### Sprint 1 features

Audit:

- Users;
- Products;
- Suppliers;
- Attendance;
- Orders;
- Kitchen;
- Inventory;
- Expenses.

For each:

- route;
- read roles;
- mutation roles;
- local layout wrapper;
- navigation entry;
- action gates;
- tests.

### Backend contract

Inspect:

- OpenAPI;
- Product CatalogRead/CatalogWrite policies;
- Attendance endpoints/policies;
- IDs accepted by Attendance.

### Documentation

Audit:

- `README.md`;
- `backend/README.md`;
- `frontend/README.md`;
- `frontend/docs/`;
- `docs/`;
- requirements;
- business rules;
- backlog;
- historias;
- sprints;
- ADR;
- architecture;
- data model;
- test/validation;
- OpenSpec history.

## Final Permission Audit Matrix

Future APPLY MUST produce an evidence matrix:

| Capability | Route | Role | Visible | Read | Mutate | Guard | Backend source | Frontend source |
| ---------- | ----- | ---- | ------: | ---: | -----: | ----- | -------------- | --------------- |

Each canonical role MUST have a row or unambiguous matrix coverage for every capability.

This matrix becomes the review artifact for:

- sidebar visibility;
- drawer visibility;
- route guards;
- feature actions.

## Central Navigation Design

### Single source

The central definition SHOULD own module-level navigation metadata.

It SHOULD NOT attempt to own every feature-internal action.

Example separation:

Global capability metadata:

- Products route;
- Product read roles;
- Product nav label/icon;
- parent-route match.

Feature authorization:

- Product manage roles;
- `canManageProducts`.

Both SHOULD import the same canonical role constants where practical.

### Attendance special case

A navigation item may require a `resolveTarget(roles)` semantic equivalent.

It MUST use any-role checks:

- manager capability present → `/asistencia`;
- otherwise → `/mi-asistencia`.

This does not create “primary role” semantics; it only chooses the richest valid destination for one conceptual nav item.

## Unified Shell Design

### Recommended migration direction

The safest architecture is to retain `AuthenticatedLayout` as the route-level shell owner because all authenticated routes already flow through it.

The richer behaviors currently implemented inside `AppLayout` SHOULD be selectively migrated/reused beneath that owner:

- hamburger;
- mobile overlay/drawer;
- desktop sidebar;
- user footer/profile;
- responsive main-content handling.

Possible implementation choices after local audit:

A. evolve `AppShell` to provide the final shell and retire feature use of `AppLayout`;

or

B. make `AuthenticatedLayout` render/refactor `AppLayout` as the single shell and remove all page-level uses.

Either is valid.

Creating a third shell is not valid.

### Global shell responsibilities

Own:

- brand;
- desktop sidebar;
- mobile topbar;
- mobile drawer;
- role-aware global navigation;
- logout/profile affordance already supported;
- routed main content.

Do not own:

- feature search/filter;
- feature tabs;
- page business actions.

## Sidebar Design

Visual goals, pending 9/10 screenshot inspection:

- persistent dark elevated/sidebar surface;
- Fratelli brand upper area;
- icon + label navigation;
- active orange treatment;
- optional grouping if references/repo justify;
- user area bottom;
- comfortable but dense vertical rhythm.

User footer MUST use real data only.

Current synthetic `<username>@fratelli.com` must not survive unless a real email field is later confirmed. citeturn123137view0

## Mobile Drawer Design

The final mobile shell replaces both:

- current feature-specific/bottom navigation;
- any duplicate shell mobile navigation.

Drawer lifecycle:

- closed by default;
- hamburger opens;
- overlay visible;
- explicit close;
- navigation closes;
- Escape when supported;
- breakpoint transition does not leave hidden focus trapped.

The drawer SHOULD reuse existing Dialog/accessibility primitives if they can represent navigation cleanly; otherwise enhance current drawer with the required focus semantics.

## Active Match Design

Recommended categories:

- exact:
  - `/inicio`;
  - `/usuarios` if no children;
  - `/gastos` if no children.
- prefix/descendant:
  - `/pedidos`;
  - `/inventario`;
  - Products/Suppliers if child routes exist.
- custom set:
  - Asistencia matches both `/asistencia` and `/mi-asistencia`.

Do not rely on the exact-match logic currently in `SidebarNav`. citeturn123137view0

## Products Permission Design

### Public baseline issue

Current public route configuration does not include CONTADORA for Products, consistent with the currently visible backend policy, while frozen product intent requires CONTADORA read.

Therefore:

- local backend audit is a hard precondition;
- do not “fix” only frontend until backend compatibility is known.

### UI permission cleanup

Define/use one `canManageProducts` capability based on:

- ADMINISTRADOR;
- ENCARGADO.

Audit all mutation entry points.

Do not scatter ad hoc checks across individual buttons if one feature capability helper is sufficient.

## Suppliers Design

### Permission design

Reuse existing Supplier role constants if they remain authoritative.

Desktop and mobile MUST consume the same `canWrite`.

### Responsive renderer

Recommended:

- mobile `< md` or project-established breakpoint → cards;
- desktop → existing DataTable.

Do not duplicate server data/query state.

### Card anatomy from inspected screenshot

Card:

- outer rounded surface;
- small neutral visual/icon block;
- main identity section:
  - name;
  - optional real secondary phone/email;
- status badge;
- notes surface when `notes` exists;
- kebab aligned upper-right only when actions exist.

Do not display an empty notes quote panel if notes are null unless the visual system has a meaningful empty-state representation.

Do not synthesize:

- J-/NIT number;
- dairy/meat/wine/bakery type;
- icon semantics from supplier name.

### Mobile page hierarchy

Use:

- page title;
- short description;
- role-aware primary CTA;
- search;
- active-state filters;
- mobile cards;
- existing pagination controls/behavior.

The inspected screenshot has a fixed bottom nav; that region is intentionally removed and replaced by the global drawer system.

## Attendance Design

### Contract audit result — public snapshot

Current public backend appears:

`SUPPORTED_BY_CURRENT_BACKEND`.

Management operations target `EmployeeId`, not arbitrary UserId.

Self history is identity-driven.

Future local audit MUST reconfirm before APPLY modifies UX.

### Recommended frontend structure

`/asistencia`:

- management workspace;
- ADMINISTRADOR/ENCARGADO only;
- employee-targeted check-in/check-out/assignment;
- management history/current state according to actual existing contract.

`/mi-asistencia`:

- own-history read-only;
- all authenticated roles.

This removes the confusing pattern where managers may get a second separate self-mutation UI inside own history.

### Shell cleanup

Attendance pages currently using `AppLayout` MUST be migrated to content-only pages after the unified shell owns layout.

Feature-specific bottom nav definitions MUST disappear.

## Existing Module Preservation

### Users

Only shell/navigation integration.

No authorization expansion.

### Orders

Keep current business/action logic.

Update only:

- global shell;
- route active integration;
- navigation visibility if inconsistent.

### Kitchen

Same.

No SignalR redesign.

### Inventory

Preserve:

- balance roles;
- movement roles;
- feature internal navigation.

Do not remove `Existencias / Movimientos` as “duplicate navigation”; it is valid content navigation.

### Expenses

Preserve ADMINISTRADOR/ENCARGADO.

No history added.

## Documentation Reconciliation Design

### Mandatory two phases

Phase 1:
frontend integration.

Phase 2:
documentation.

Documentation MUST NOT begin as a broad reconciliation before:

- shell stabilized;
- permissions stabilized;
- Attendance resolution complete;
- tests pass;
- build passes.

### Document classification matrix

Future documentation work MUST maintain:

| Documento       | Tipo              | Estado                        | Cambio necesario               | Motivo                     |
| --------------- | ----------------- | ----------------------------- | ------------------------------ | -------------------------- |
| root README     | current-state     | CURRENT/NEEDS_UPDATE          | exact change                   | actual repo state          |
| frontend README | current-state     | CURRENT/NEEDS_UPDATE          | exact change                   | actual routes/architecture |
| backend README  | current-state     | CURRENT/NEEDS_UPDATE          | minimal only                   | backend unchanged          |
| Sprint 0        | historical        | HISTORICAL_KEEP               | none unless broken link        | chronology                 |
| Sprint 1        | current/planning  | CURRENT/NEEDS_UPDATE          | closure/status                 | Sprint 1 truth             |
| HU-003          | current HU        | CURRENT/NEEDS_UPDATE          | role semantics if required     | frozen decision            |
| HU-016          | current HU        | CURRENT/NEEDS_UPDATE          | permissions/mobile if required | implementation truth       |
| HU-022          | current HU        | NEEDS_UPDATE if supported     | final role semantics           | frozen decision            |
| old OpenSpec    | technical history | HISTORICAL_KEEP               | none                           | agent/design record        |
| ADR             | decision history  | HISTORICAL_KEEP/current-index | minimal                        | chronology                 |

Do not modify every reviewed document.

### Publicly identified likely stale docs

The current public root README still describes the project primarily as a Sprint 0 technical baseline.

The public frontend README also contains earlier navigation/module statements that no longer match the integrated route set.

Future local audit SHOULD classify these as NEEDS_UPDATE if still stale.

### Spanish policy

Current-state narrative docs MUST be Spanish.

Keep unchanged:

- code identifiers;
- class names;
- commands;
- HTTP methods;
- paths;
- enum values.

### Historical OpenSpec

Do not mass translate.

Do not rewrite archived design history to conform to final architecture.

Only the current change's own artifacts/handoff/status may naturally be updated.

## Sprint Documentation Design

Future local audit MUST inspect naming under `docs/sprints/`.

Expected final conceptual set:

1. Sprint 0 historical document — preserved.
2. Sprint 1 planning/execution/closure document.
3. Sprint 1 retrospective template — separate file.

If Sprint 1 current document is absent, create it following existing naming convention.

Likely conceptual names:

- `sprint-01.md`
- `sprint-01-retrospectiva.md`

but local convention decides exact names.

## Retrospective Template Contract

The retrospective file MUST be a template only.

Required conceptual sections:

1. Información de la retrospectiva.
2. Objetivo.
3. Contexto del Sprint.
4. ¿Qué salió bien?
5. ¿Qué no salió bien?
6. ¿Qué podemos mejorar?
7. Problemas encontrados durante el Sprint.
8. Aspectos técnicos:
   - backend;
   - frontend;
   - integración;
   - pruebas;
   - documentación;
   - despliegue/demo si aplica.
9. Trabajo en equipo y comunicación.
10. Acciones de mejora acordadas.
11. Decisiones de la retrospectiva.
12. Temas trasladados al siguiente Sprint.
13. Evidencias / referencias.
14. Cierre.

Unknown meeting fields MUST say:

`Pendiente de completar durante la retrospectiva.`

Actions table MUST remain placeholder-based.

Status MUST communicate:

- plantilla preparada;
- reunión pendiente;
- contenido pendiente con el equipo.

## Required Tests Per Layer

### Capability/navigation unit tests

Test:

- filtering by each role;
- multi-role union;
- Attendance target resolution;
- active matching;
- no future module entries.

### Shell integration tests

Representative pages MUST demonstrate:

- one global sidebar desktop;
- no nested global sidebar;
- one mobile drawer;
- no bottom nav;
- drawer opens/closes;
- route navigation closes drawer.

### Route guard tests

For every materially restricted route:

- allowed;
- forbidden;
- anonymous;
- multi-role.

Do not necessarily create one test per every theoretical role/path Cartesian pair if shared parameterized tests provide equivalent evidence.

### Product tests

- ADMIN manage controls.
- ENCARGADO manage controls.
- MESERO read-only.
- COCINA read-only.
- CONTADORA read-only only when backend contract gate passes.
- EMPLEADO route denied.
- direct mutation routes guarded if present.

### Supplier tests

- ADMIN/ENCARGADO manage.
- COCINA/CONTADORA read-only.
- MESERO/EMPLEADO route denied.
- no empty kebab for read-only.
- desktop representation.
- mobile cards.
- only real Supplier fields.

### Attendance tests

When contract supported:

- ADMIN/ENCARGADO management UI;
- employee-targeted payload;
- worker own history only;
- no worker mutation actions;
- one Attendance nav item;
- multi-role manager navigation.

### Regression

Run all frontend test files, not only integration tests.

## Tradeoffs Accepted

- Consolidate around one shell rather than preserving team-owned local layouts.
- Reuse parts of existing AppLayout instead of designing a wholly new shell.
- Remove bottom-nav even if present in screenshots/current components.
- Prefer central capability metadata over independent nav arrays.
- Keep feature-specific authorization helpers for actions rather than forcing every action into global nav registry.
- Preserve functional feature screens instead of mass redesign.
- Supplier mobile gets targeted responsive cards because explicitly required.
- Dashboards remain non-functional shells/placeholders only where `/inicio` already exists; no new KPI work.
- Documentation changes are intentionally selective.
- Historical OpenSpec remains mixed-language if that is its historical state.
- Retrospective remains empty/template.

## Implementation Constraints

- No backend source modifications.
- No migration.
- No new API.
- No auth redesign.
- No new global state library.
- No fake role.
- No fake modules.
- No fake user email.
- No fake Supplier identifiers/categories.
- No dashboard data fabrication.
- No notifications fabrication.
- No historical OpenSpec mass translation.
- No retrospective fabrication.
- No Git mutations.
- Do not use screenshots as permission authority.
- Do not start docs reconciliation until frontend gates are green.

## Open Design Questions

### Blocking Question 1 — Product CONTADORA backend support

Frozen product rule requires CONTADORA read access.

The public current backend appears to exclude CONTADORA from CatalogRead.

Future local audit MUST answer:

- Does actual `develop` CatalogRead/OpenAPI now permit CONTADORA?

If no:

`BASELINE_CONTRACT_BLOCKER`.

This is the primary current hard contract risk.

### Blocking Question 2 — full visual inspection

Nine known visual references plus possible additional ZIP assets remain uninspected at pixel level.

Future explore MUST open them before final shell styling.

### Attendance contract

Public current status:

`SUPPORTED_BY_CURRENT_BACKEND`.

Future local audit must reconfirm, but there is no current evidence of a product question.

### Non-blocking implementation questions

Future APPLY may resolve autonomously:

- whether final shell implementation retains the `AppShell` name or `AppLayout` name;
- breakpoint consistent with current Tailwind conventions;
- whether grouping is useful;
- exact icon choices;
- exact content max-width;
- test helper organization;
- whether Supplier mobile visibility uses CSS responsive renderers or a reusable responsive component.

These are implementation details, not human blockers.
