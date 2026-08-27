# Spec

## Requirements

### Baseline and Audit Requirements

- APPLY MUST operate conceptually against the local `develop` real.
- APPLY MUST record the current branch, HEAD and working-tree status using read-only Git operations.
- APPLY MUST NOT perform checkout, switch, reset, restore, clean, merge, rebase, add, commit or push.
- APPLY MUST enumerate actual frontend routes from source rather than from this briefing.
- APPLY MUST enumerate actual shell/navigation components and all their consumers.
- APPLY MUST inspect backend OpenAPI/policies for Attendance and Products before finalizing the affected role matrix.
- APPLY MUST audit current tests and frontend quality scripts.
- APPLY MUST audit current documentation before editing it.
- Public GitHub observations in this briefing MUST be treated as orientation only.

### Source Authority

The following precedence MUST apply:

1. frozen human decisions from this change;
2. local integrated source code;
3. local backend/OpenAPI;
4. canonical current business documentation;
5. previously implemented/tested contracts;
6. visual references for appearance;
7. minimum technical inference.

Screenshots MUST govern presentation only.

Screenshots MUST NOT introduce:

- modules;
- APIs;
- permissions;
- dashboard metrics;
- notifications;
- cash;
- reports;
- purchases;
- sales;
- fake user data.

### Visual Audit Requirement

- Future explore/APPLY MUST open every image in `Referencias.zip`.
- It MUST not assume the ten known filenames are the complete ZIP.
- It MUST create an inventory of every image.
- It MUST classify each relevant visual element as KEEP, ADAPT, OMIT or DEFER.
- It MUST not claim visual PASS for files it did not open.

Current inspection status:

- `Proveedores - Mobile.png`: visually inspected.
- Other nine known references: pixel inspection pending.

### Visual Audit Matrix

| Image                                      | Elemento                                    | Decision                                        | Razón                                                                  | Target                |
| ------------------------------------------ | ------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- | --------------------- |
| `Container.png`                            | drawer lateral                              | KEEP/ADAPT                                      | frozen mobile navigation target; exact pixels pending                  | unified mobile drawer |
| `Container.png`                            | overlay                                     | KEEP                                            | expected accessible drawer behavior                                    | global shell          |
| `Container.png`                            | logo/brand                                  | KEEP/ADAPT                                      | Fratelli identity                                                      | drawer header         |
| `Container.png`                            | close button                                | KEEP                                            | required drawer control                                                | drawer                |
| `Container.png`                            | vertical role-aware links                   | KEEP/ADAPT                                      | only implemented modules                                               | navigation renderer   |
| `Container.png`                            | active item                                 | KEEP                                            | route feedback                                                         | navigation renderer   |
| `Container.png`                            | user/profile footer                         | KEEP/ADAPT                                      | only real AuthUser fields                                              | drawer/footer         |
| `Dashboard Administrador - Desktop.png`    | desktop sidebar structure                   | ADAPT                                           | modules must come from real capability registry                        | global sidebar        |
| `Dashboard Administrador - Desktop.png`    | dashboard KPIs/cards/charts                 | DEFER/OMIT                                      | no dashboard functional work in this change                            | none                  |
| `Dashboard Administrador - Desktop.png`    | role-specific module density                | ADAPT                                           | show all implemented ADMIN capabilities only                           | global sidebar        |
| `Dashboard Administrador - Mobile.png`     | mobile topbar                               | ADAPT                                           | final system requires hamburger + brand + real user data               | global shell          |
| `Dashboard Administrador - Mobile.png`     | bottom navigation                           | OMIT                                            | frozen decision: drawer is the only global mobile navigation           | none                  |
| `Dashboard Administrador - Mobile.png`     | dashboard metrics                           | DEFER                                           | future dashboard capability                                            | none                  |
| `Dashboard Encargado - Desktop.png`        | sidebar visual hierarchy                    | ADAPT                                           | use implemented ENCARGADO capabilities                                 | global sidebar        |
| `Dashboard Encargado - Desktop.png`        | role dashboard widgets                      | DEFER                                           | not this change                                                        | none                  |
| `Dashboard Mesero - Desktop.png`           | sidebar visual hierarchy                    | ADAPT                                           | MESERO capability union                                                | global sidebar        |
| `Dashboard Mesero - Desktop.png`           | operational dashboard data                  | DEFER                                           | no new dashboard                                                       | none                  |
| `Dashboard Cocina - Desktop.png`           | sidebar visual hierarchy                    | ADAPT                                           | Cocina, Products, Inventory, Suppliers-read as real permissions permit | global sidebar        |
| `Dashboard Cocina - Desktop.png`           | kitchen/dashboard widgets                   | DEFER                                           | preserve existing Kitchen feature; no dashboard expansion              | none                  |
| `Dashboard Contadora - Desktop.png`        | sidebar visual hierarchy                    | ADAPT                                           | real capability matrix                                                 | global sidebar        |
| `Dashboard Contadora - Desktop.png`        | financial/report widgets                    | DEFER/OMIT                                      | reports/HU future                                                      | none                  |
| `Dashboard Empleado - Desktop.png`         | minimal role navigation                     | ADAPT                                           | Inicio + own attendance where real                                     | global sidebar        |
| `Dashboard Empleado - Desktop.png`         | fake dashboard cards                        | DEFER                                           | no dashboard implementation                                            | none                  |
| `Estados_ Vacío y Skeleton - Fratelli.png` | surface/spacing language                    | KEEP/ADAPT                                      | consistency for touched modules                                        | shared/touched states |
| `Estados_ Vacío y Skeleton - Fratelli.png` | empty-state hierarchy                       | KEEP/ADAPT                                      | apply where touched, not global rewrite                                | touched modules       |
| `Estados_ Vacío y Skeleton - Fratelli.png` | skeleton visual language                    | KEEP/ADAPT                                      | only where affected by integration                                     | touched modules       |
| `Proveedores - Mobile.png`                 | dark page/surface hierarchy                 | KEEP                                            | directly observed Fratelli visual identity                             | Suppliers mobile      |
| `Proveedores - Mobile.png`                 | title/subtitle hierarchy                    | KEEP                                            | directly observed and in-scope                                         | Suppliers mobile      |
| `Proveedores - Mobile.png`                 | full-width orange `Nuevo proveedor`         | KEEP/ADAPT                                      | only ADMIN/ENCARGADO                                                   | Suppliers mobile      |
| `Proveedores - Mobile.png`                 | search input                                | KEEP                                            | real Supplier search                                                   | Suppliers mobile      |
| `Proveedores - Mobile.png`                 | Todos/Activos/Inactivos segmented filter    | KEEP/ADAPT                                      | matches real active state capability                                   | Suppliers mobile      |
| `Proveedores - Mobile.png`                 | separate filter button                      | ADAPT/OMIT                                      | retain only if backed by real filters                                  | Suppliers mobile      |
| `Proveedores - Mobile.png`                 | card representation                         | KEEP                                            | mandatory mobile replacement for compressed table                      | SupplierCard          |
| `Proveedores - Mobile.png`                 | card border/radius/elevated surface         | KEEP                                            | directly observed visual language                                      | SupplierCard          |
| `Proveedores - Mobile.png`                 | supplier name                               | KEEP                                            | real DTO                                                               | SupplierCard          |
| `Proveedores - Mobile.png`                 | identifier `J-...`                          | OMIT unless real field exists                   | no fake NIT/SKU/id                                                     | SupplierCard          |
| `Proveedores - Mobile.png`                 | category-specific animal/bottle/bread icons | OMIT/ADAPT                                      | no Supplier type/category should be fabricated                         | neutral icon/avatar   |
| `Proveedores - Mobile.png`                 | ACTIVO/INACTIVO badge with text+dot         | KEEP                                            | real state and accessible visual                                       | SupplierCard          |
| `Proveedores - Mobile.png`                 | notes inset panel                           | KEEP                                            | real `notes` when available                                            | SupplierCard          |
| `Proveedores - Mobile.png`                 | kebab                                       | KEEP only manage roles                          | read-only users must not get empty action menu                         | SupplierCard          |
| `Proveedores - Mobile.png`                 | notification bell                           | OMIT unless real notification capability exists | no fake notification system                                            | global topbar         |
| `Proveedores - Mobile.png`                 | avatar                                      | ADAPT                                           | use real available user data/fallback initial                          | global topbar         |
| `Proveedores - Mobile.png`                 | fixed bottom nav                            | OMIT                                            | conflicts with frozen drawer-only decision                             | none                  |
| `Proveedores - Mobile.png`                 | Menú/Reportes/Ajustes entries               | OMIT if not implemented                         | no fake modules                                                        | none                  |

For the nine references not pixel-inspected, exact spacing, width, grouping and typography MUST remain an explore item, not an invented fact.

### Canonical Roles

The frontend MUST use exactly:

- ADMINISTRADOR
- ENCARGADO
- MESERO
- COCINA
- CONTADORA
- EMPLEADO

It MUST NOT introduce CAJERO.

### Multi-role

- Capability access MUST be union-based.
- A user MUST be allowed when any assigned role authorizes the capability.
- Navigation MUST NOT inspect only `roles[0]`.
- Route guards MUST NOT inspect only `roles[0]`.
- Action visibility MUST NOT inspect only a “primary” role.
- A single role MAY be displayed visually if the existing design needs a concise label, but it MUST NOT influence authorization.

### Central Capability Registry

The frontend MUST converge on one central definition or equivalent shared contracts for global navigation/capabilities.

The model SHOULD be capable of representing:

- capability id;
- canonical route/navigation target;
- label;
- icon;
- allowed read roles;
- allowed manage roles where needed;
- grouping;
- active-route matching;
- optional role-dependent navigation target.

Desktop sidebar and mobile drawer MUST consume the same source.

Route guards MUST reuse the same role contracts or constants rather than duplicate string arrays independently.

Feature action permissions SHOULD reuse capability-specific helpers/constants.

### Route Inventory

Future APPLY MUST produce a source-derived matrix:

| Route | Page | Parent layout | Guard | Navigation capability | Allowed roles | Nested behavior | Duplicate shell? | Status |
| ----- | ---- | ------------- | ----- | --------------------- | ------------- | --------------- | ---------------- | ------ |

The public route list MUST be treated as a starting point only.

Stable URLs SHOULD be preserved.

URLs MUST NOT be renamed solely for visual consistency.

### Expected Final Capability Matrix

This matrix freezes product intent but MUST be checked against backend contracts:

| Capability            | Route conceptual           | Visible/Read                                    | Manage/Mutate                                          | Guard notes                                |
| --------------------- | -------------------------- | ----------------------------------------------- | ------------------------------------------------------ | ------------------------------------------ |
| Inicio                | `/inicio`                  | all authenticated roles                         | n/a                                                    | RequireAuth                                |
| Usuarios              | `/usuarios`                | ADMINISTRADOR                                   | ADMINISTRADOR                                          | ADMIN guard                                |
| Productos             | `/productos`               | ADMIN, ENCARGADO, MESERO, COCINA, CONTADORA     | ADMIN, ENCARGADO                                       | backend CatalogRead MUST support CONTADORA |
| Proveedores           | `/proveedores`             | ADMIN, ENCARGADO, COCINA, CONTADORA             | ADMIN, ENCARGADO                                       | read/write split                           |
| Asistencia management | `/asistencia`              | ADMIN, ENCARGADO                                | ADMIN, ENCARGADO                                       | employee-targeted operations               |
| Mi asistencia         | `/mi-asistencia`           | all authenticated                               | none in final own-history experience                   | own history only                           |
| Pedidos               | `/pedidos` + real children | preserve real ADMIN, ENCARGADO, MESERO contract | preserve existing per-action rules                     | do not redesign                            |
| Cocina                | `/cocina`                  | ADMIN, ENCARGADO, COCINA, MESERO                | ADMIN, ENCARGADO, COCINA operational; MESERO read-only | preserve existing                          |
| Inventario balances   | `/inventario`              | ADMIN, ENCARGADO, MESERO, COCINA, CONTADORA     | ADMIN/ENCARGADO where controls exist                   | preserve existing                          |
| Inventario movements  | `/inventario/movimientos`  | ADMIN, ENCARGADO                                | ADMIN, ENCARGADO                                       | preserve existing                          |
| Gastos                | `/gastos`                  | ADMIN, ENCARGADO                                | ADMIN, ENCARGADO                                       | preserve existing                          |

`ADMIN` in the table means role `ADMINISTRADOR`.

### Product Backend Contract Gate

- Future APPLY MUST inspect actual local Catalog read policy/OpenAPI.
- If CONTADORA is already supported, frontend MUST add CONTADORA to Products read route/navigation and keep it read-only.
- If CONTADORA is not supported, APPLY MUST report `BASELINE_CONTRACT_BLOCKER`.
- Frontend MUST NOT show a Product route to CONTADORA that will systematically return 403 from backend.
- Backend MUST NOT be modified by this change.

### Single Shell

The final authenticated tree MUST have exactly one owner of global shell.

Conceptually:

Authenticated root

- desktop sidebar
- mobile topbar
- mobile drawer
- routed content

Features MUST NOT mount:

- a second global AppShell;
- another desktop sidebar;
- another global mobile header;
- another bottom nav.

Internal content navigation MAY remain.

Examples of valid content navigation:

- Inventory `Existencias / Movimientos`.
- feature-local tabs backed by actual routes/states.

### Shell Consolidation Strategy

Future APPLY MUST first classify current layout components:

- GLOBAL_CORRECT
- FEATURE_DUPLICATE
- CONTENT_NAVIGATION_VALID
- OBSOLETE_AFTER_CONSOLIDATION

It MUST select one final global shell implementation.

It SHOULD extend the architecture already owned by `AuthenticatedLayout` rather than introduce a third layout.

It MAY reuse visual/behavioral pieces currently present in `AppLayout`, including:

- desktop sidebar;
- hamburger;
- overlay;
- drawer;
- user footer;

but their ownership MUST move to the single authenticated shell.

### Desktop Sidebar

Desktop sidebar MUST:

- be visible at the chosen desktop breakpoint;
- contain Fratelli brand;
- render only authorized implemented capabilities;
- use Lucide;
- show active module;
- support groups only when groups improve clarity and derive from central config;
- show real user/profile information at bottom when available;
- avoid fake email;
- avoid fake modules.

Desktop content MUST not simultaneously show another global sidebar.

### Mobile Topbar

Mobile topbar MUST include:

- accessible hamburger;
- Fratelli brand;
- real user/avatar representation when appropriate.

It MAY include another action only if an actual capability exists.

It MUST NOT display a decorative notification bell that implies functioning notifications when no notification feature exists.

### Mobile Drawer

Mobile drawer MUST:

- open through hamburger;
- use overlay;
- provide close control;
- derive role-aware items from central config;
- expose active item;
- show real user profile/footer when useful;
- close on navigation;
- support Escape if the chosen Dialog/drawer primitive supports it;
- return focus to trigger;
- have appropriate dialog/navigation semantics.

### No Bottom Navigation

The final mobile shell MUST NOT render a second global bottom navigation.

Current `bottomNavItems` usage MUST be removed from final global flows.

Pages MUST NOT supply their own bottom navigation.

### Active Route Semantics

Navigation matching MUST support descendants.

At minimum:

- `/pedidos/:id` → `Pedidos` active.
- `/pedidos/nuevo` → `Pedidos` active.
- `/inventario/movimientos` → `Inventario` active.
- Attendance management/self-history routes → `Asistencia` capability active.

Exact string equality MUST NOT be the only match strategy.

The central navigation model SHOULD support exact/prefix/custom matching.

### Attendance Navigation Semantics

Navigation SHOULD expose one conceptual `Asistencia` item.

For ADMINISTRADOR/ENCARGADO:

- navigation target SHOULD be management `/asistencia`.

For other workers:

- navigation target SHOULD be own-history `/mi-asistencia`.

This role-dependent destination MUST use capability checks, not first-role ordering.

A multi-role user with ENCARGADO capability MUST not see duplicated `Asistencia` entries.

### HU-003 Products

#### Read access

Frontend MUST permit read route/content to:

- ADMINISTRADOR
- ENCARGADO
- MESERO
- COCINA
- CONTADORA

subject to the backend contract gate.

EMPLEADO-only MUST be denied.

#### Manage access

Only:

- ADMINISTRADOR
- ENCARGADO

MUST see/execute Product mutations.

Future audit MUST cover:

- Nuevo producto;
- Editar;
- Activar;
- Desactivar;
- contextual actions;
- form submit;
- direct create/edit routes if present.

Read-only roles MUST NOT see disabled mutation placeholders.

If create/edit is implemented as modal rather than route, action gating MUST still cover every entry point.

### HU-016 Suppliers

Read:

- ADMINISTRADOR
- ENCARGADO
- COCINA
- CONTADORA

Manage:

- ADMINISTRADOR
- ENCARGADO

Denied:

- MESERO-only
- EMPLEADO-only

For read-only roles:

- New Supplier CTA MUST be absent.
- edit/activate/deactivate MUST be absent.
- kebab MUST be absent when it would contain no allowed actions.

### Suppliers Desktop

Existing functional desktop table SHOULD be preserved.

Changes SHOULD be limited to:

- unified shell compatibility;
- permission consistency;
- responsive breakpoint switching;
- integration bugs.

### Suppliers Mobile Cards

At mobile width, the table MUST not be the primary representation.

Cards MUST use only real Supplier DTO fields.

Card priority SHOULD be:

- name;
- useful real secondary contact identifier such as phone/email if contract provides it;
- active/inactive status;
- notes when present;
- action menu only for managers.

Cards MUST NOT fabricate:

- supplier type;
- category;
- NIT;
- SKU/code;
- icon category derived from supplier name;
- notes.

The directly inspected reference's icon tile MAY be represented with a neutral Supplier/Building/Package icon instead of fake semantic categories.

### HU-022 Attendance Contract Audit

Future APPLY MUST explicitly document:

- current management endpoints;
- current self-history endpoint;
- request payloads;
- path IDs;
- whether target is EmployeeId or UserId;
- management policy roles;
- self-history authorization.

Current public evidence indicates:

- management uses `employeeId`;
- ADMINISTRADOR/ENCARGADO can check-in/check-out employees;
- a management “today” read exists;
- an authenticated `/me` history endpoint exists.

Local runtime remains authority.

### HU-022 Final UX

If backend contract is supported:

ADMINISTRADOR / ENCARGADO MUST:

- access management;
- select/target real Employees as backend requires;
- perform management operations;
- consult relevant history.

MESERO / COCINA / CONTADORA / EMPLEADO MUST:

- have no attendance assignment controls;
- only consult own history.

`/mi-asistencia` SHOULD be treated as own-history read-only for all roles; mutations for managers SHOULD live in management experience to avoid two competing mutation flows.

The frontend MUST NOT send UserId where backend expects EmployeeId.

### Attendance Blocker

If management/assignment backend capability is absent in local `develop`:

- APPLY MUST stop the affected completion with `BASELINE_CONTRACT_BLOCKER`.
- It MUST report:
  - required behavior;
  - available endpoint;
  - missing contract;
  - why frontend alone cannot implement it.
- It MUST NOT simulate assignment.

### Other Sprint 1 Modules

Users MUST preserve ADMIN-only semantics.

Orders MUST preserve its currently integrated role/action matrix.

Kitchen MUST preserve:

- operational ADMIN/ENCARGADO/COCINA;
- MESERO read-only;

unless local implemented contract proves a more specific already-approved rule.

Inventory MUST preserve previously approved route role matrix.

Expenses MUST preserve ADMIN/ENCARGADO only.

Auth MUST remain unchanged.

### No Fake Modules

Global navigation MUST only include a module when:

- its route exists;
- its frontend capability is implemented;
- its role access is valid.

It MUST NOT add placeholder links for future:

- Ventas;
- Compras;
- Producción;
- Caja;
- Turnos;
- Reportes;
- Ajustes;

unless any such module is actually present in local `develop` and belongs to Sprint 1.

### Inicio / Dashboard

`/inicio` SHOULD remain.

Dashboard reference images MUST NOT cause creation of:

- KPIs;
- financial cards;
- charts;
- sales metrics;
- cash metrics;
- purchase summaries.

Dashboard screenshots are shell/navigation references for this change.

### Responsive

The shell and touched modules MUST be validated at:

- desktop;
- 403px;
- 360px.

Desktop MUST show one sidebar.

Mobile MUST show:

- no desktop sidebar;
- topbar;
- hamburger;
- drawer on demand;
- no bottom nav.

No simultaneous duplicate global navigation MUST be visible at breakpoint boundaries.

### Content Width

The unified shell SHOULD establish consistent content padding/width behavior.

Feature pages SHOULD NOT each reproduce conflicting global content containers.

Existing legitimate page-level max-width wrappers MAY remain where they serve content layout rather than shell duplication.

### Empty/Skeleton Reference

The empty/skeleton visual reference SHOULD guide touched states.

This change MUST NOT mass-restyle every loading/empty state in the application.

It MAY normalize components directly touched by shell/Suppliers/Attendance integration.

### Accessibility

The final shell MUST include:

- navigation landmarks;
- accessible hamburger label;
- accessible drawer close label;
- `aria-current` or equivalent for current navigation item;
- focus-visible treatment;
- focus management/return for drawer;
- keyboard navigation;
- no color-only active state;
- reasonable mobile touch targets.

Supplier card actions MUST have accessible names.

Read-only users MUST not receive inaccessible/disabled fake action triggers.

### Iconography

Global navigation SHOULD use the existing Lucide system.

It MUST NOT introduce emoji navigation.

It MUST not hardcode category images for Suppliers without actual data.

### Global State

The change MUST NOT introduce Redux, Zustand or another global state library solely for shell/navigation.

Navigation MUST be derived from current authenticated roles.

### Auth Security

The change MUST NOT change:

- JWT storage;
- refresh-token behavior;
- session coordinator;
- access-token memory policy.

Role-aware UI MUST not replace backend authorization.

### Frontend Quality

Future APPLY MUST audit actual scripts from `frontend/package.json`.

Current expected gates are:

- format check;
- typecheck;
- lint;
- tests;
- build.

All MUST end PASS.

Known format debt in:

- Products API;
- Products pages;
- shared http client;

MUST be checked and fixed if still present.

The final Sprint integration MUST NOT knowingly leave easily fixable frontend baseline formatting debt.

### API Generation

`api:generate` MAY be run when required by the actual workflow and backend runtime is available.

Generated API files MUST NOT be manually edited.

This change SHOULD NOT cause backend contract changes.

## Behavior Scenarios

### Scenario 1: One shell on desktop

Given an authenticated user opens a routed Sprint 1 page  
When the page renders at desktop width  
Then exactly one global desktop sidebar MUST be present  
And the feature MUST NOT render a second global shell

### Scenario 2: One mobile navigation system

Given an authenticated user at 360px  
When the global shell renders  
Then the desktop sidebar MUST be hidden  
And a hamburger/topbar MUST be present  
And no global bottom navigation MUST be present

### Scenario 3: Drawer opens

Given the mobile shell is closed  
When the user activates the hamburger  
Then the role-aware drawer MUST open  
And focus MUST move according to the chosen accessible drawer pattern

### Scenario 4: Drawer closes after navigation

Given the drawer is open  
When the user selects a navigation item  
Then navigation MUST occur  
And the drawer MUST close

### Scenario 5: Parent active for order detail

Given the current path is `/pedidos/<id>`  
When global navigation renders  
Then `Pedidos` MUST be marked active

### Scenario 6: Parent active for inventory history

Given the current path is `/inventario/movimientos`  
When navigation renders  
Then `Inventario` MUST be marked active

### Scenario 7: Multi-role union

Given a user has MESERO and ENCARGADO  
When navigation and guards are evaluated  
Then all ENCARGADO capabilities MUST remain accessible  
And behavior MUST not depend on which role appears first

### Scenario 8: Employee navigation

Given an EMPLEADO-only user  
When global navigation renders  
Then only implemented capabilities authorized for EMPLEADO MUST appear  
And fake dashboard modules MUST not appear

### Scenario 9: Product ADMIN

Given ADMINISTRADOR opens Products  
When Products renders  
Then read content MUST be available  
And all contractually allowed mutation controls MUST be available

### Scenario 10: Product MESERO read-only

Given MESERO opens Products  
When page renders  
Then Product data MUST be readable  
And New/Edit/Activate/Deactivate controls MUST be absent

### Scenario 11: Product CONTADORA supported

Given local backend CatalogRead includes CONTADORA  
And CONTADORA opens `/productos`  
When page loads  
Then the route MUST be allowed  
And Product mutations MUST be absent

### Scenario 12: Product CONTADORA backend mismatch

Given local backend CatalogRead excludes CONTADORA  
When integration audit compares it with the frozen requirement  
Then APPLY MUST classify `BASELINE_CONTRACT_BLOCKER`  
And MUST NOT pretend frontend Products integration is complete

### Scenario 13: Supplier ADMIN mobile

Given ADMINISTRADOR at 360px opens Proveedores  
When page renders  
Then Supplier cards MUST be the primary representation  
And Nuevo proveedor and real mutation actions MUST be available

### Scenario 14: Supplier COCINA mobile

Given COCINA opens Proveedores at 403px  
When cards render  
Then Supplier data MUST be readable  
And Nuevo proveedor MUST be absent  
And kebab/action menu MUST be absent

### Scenario 15: Supplier real data only

Given Supplier DTO has name, contact/status/notes but no category/NIT  
When a mobile card renders  
Then it MUST not invent a category icon or NIT  
And it MAY use a neutral icon

### Scenario 16: Attendance manager

Given ENCARGADO is authenticated  
And backend management contract exists  
When `/asistencia` renders  
Then management/assignment controls MUST be available  
And requests MUST target the backend-required EmployeeId

### Scenario 17: Attendance worker

Given MESERO is authenticated  
When Attendance navigation is used  
Then the user MUST reach own history  
And no assignment/check-in/check-out management controls MUST be visible

### Scenario 18: Attendance multi-role

Given MESERO + ENCARGADO  
When global navigation renders  
Then only one conceptual Asistencia item MUST appear  
And its target SHOULD be management `/asistencia`

### Scenario 19: Attendance missing backend

Given local OpenAPI lacks the required management operation  
When Attendance integration begins  
Then no client-side assignment MUST be implemented  
And the change MUST report `BASELINE_CONTRACT_BLOCKER`

### Scenario 20: No fake email

Given authenticated user has username but no email contract field  
When shell profile renders  
Then the UI MUST NOT fabricate `<username>@fratelli.com`

### Scenario 21: Direct forbidden Product mutation route

Given a Product edit/create child route exists  
And a MESERO navigates to it directly  
When routing evaluates permission  
Then the user MUST be denied before mutation UI renders

### Scenario 22: Supplier direct access denied

Given MESERO-only accesses `/proveedores` directly  
When route guard evaluates  
Then Forbidden behavior MUST occur

### Scenario 23: Dashboard references

Given a dashboard screenshot shows financial widgets  
When implementation uses the reference  
Then those widgets MUST NOT be implemented unless already real  
And only shell/layout intent MAY be adapted

### Scenario 24: Documentation phase ordering

Given frontend integration is still changing  
When APPLY reaches documentation work  
Then canonical docs MUST not yet be reconciled  
And documentation phase MUST begin only after frontend gates pass

### Scenario 25: Retrospective template

Given frontend integration and docs reconciliation are complete  
When Sprint retrospective file is created  
Then it MUST contain placeholders  
And MUST NOT state invented team outcomes

## Edge Cases

- user roles array order changes;
- user has ADMINISTRADOR plus a lower-privilege role;
- no navigation items besides Inicio/Attendance for a role;
- direct deep-link on initial load;
- child route with query/hash;
- `/productos` only uses modals, no create/edit child routes;
- local `develop` adds Product child routes before APPLY;
- local backend Product policy differs from public snapshot;
- local Attendance endpoint naming changes without semantic change;
- Attendance target is EmployeeId while UI holds UserId;
- manager has no linked Employee but can manage other employees;
- drawer opens then route changes externally;
- Escape during drawer;
- browser width crosses desktop/mobile breakpoint while drawer open;
- profile has no fullName;
- profile has no email/avatar image;
- long fullName/role labels;
- supplier has no phone/email;
- supplier notes null;
- supplier very long notes;
- supplier read-only role has zero actions;
- Supplier pagination remains after switching desktop/mobile;
- 360px cards with long names;
- one feature still imports AppLayout after consolidation;
- global nav entry accidentally includes future route;
- historical docs contain intentionally obsolete Sprint 0 wording;
- current README contains obsolete Sprint 0 wording;
- retrospective meeting has not occurred;
- visual ZIP contains additional unknown screenshots.

## Acceptance Criteria

- Future explore MUST report N/N visual references opened.
- Route audit MUST enumerate every integrated authenticated route.
- Permission audit MUST include every integrated Sprint 1 capability.
- Exactly one global shell MUST render for representative authenticated pages.
- Mobile MUST have drawer-only global navigation.
- Global bottom-nav count MUST be zero.
- Navigation config MUST not be duplicated between desktop and mobile.
- Role authorization MUST use union semantics.
- Child-route active matching MUST pass for Pedidos and Inventario.
- Product mutation controls MUST be absent for MESERO/COCINA/CONTADORA.
- Product mutation controls MUST be present for ADMINISTRADOR/ENCARGADO.
- Product CONTADORA access MUST either work end-to-end with backend or produce `BASELINE_CONTRACT_BLOCKER`.
- Supplier ADMIN/ENCARGADO MUST manage.
- Supplier COCINA/CONTADORA MUST be read-only.
- Supplier MESERO/EMPLEADO MUST be route-denied.
- Supplier mobile at 403px and 360px MUST use cards rather than a compressed primary table.
- Supplier cards MUST use only real DTO data.
- Attendance management MUST be restricted to ADMINISTRADOR/ENCARGADO when backend supports it.
- MESERO/COCINA/CONTADORA/EMPLEADO Attendance experience MUST be own-history-only.
- Attendance management request MUST use the backend's actual identity type.
- Direct unauthorized URLs MUST be guarded.
- Global format check MUST pass.
- Global typecheck MUST pass.
- Global lint MUST pass.
- All frontend tests MUST pass with failed=0.
- Production build MUST pass.
- Documentation reconciliation MUST happen after frontend gates.
- Current-state human documentation MUST use Spanish narrative.
- Historical OpenSpec MUST not be mass-translated.
- Sprint 0 historical document MUST remain.
- Sprint 1 document MUST exist and reflect actual final state.
- Sprint 1 retrospective MUST be a separate template.
- Retrospective content MUST remain pending until the meeting.
- Backend source MUST remain unchanged.
- Git mutation MUST remain zero.

## Out of Scope

- Backend fixes.
- Database migrations.
- New APIs.
- New hubs.
- Dashboard business functionality.
- New reports.
- New purchase/sale/cash/shift modules.
- Product feature expansion.
- Supplier backend expansion.
- Attendance backend expansion.
- Global visual rewrite of every screen.
- Pixel-perfect recreation.
- Bottom navigation.
- New global state library.
- OpenSpec historical translation.
- Fabricated retrospective.
- Fabricated visual evidence.
