# Design

## Components Touched

Likely areas, subject to local repository audit:

- AppShell/layout/navigation.
- Inicio/dashboard composition.
- auth role/capability helpers.
- shared icon button.
- shared PageHeader/Card/MetricCard/FilterBar/DataTable/MobileCard.
- Drawer/Sheet/Modal primitives.
- date/business-time utilities.
- money formatter.
- Kitchen query/UI.
- Production history/register flow.
- Inventory filters.
- Attendance current/self/admin/today flows.
- Shift/Cash page.
- Cash Closing History.
- Suppliers.
- Purchases.
- Sales History.
- Expenses History.
- Reports.
- frontend tests.
- backend endpoints/services/tests only for minimal authorized fixes.
- runtime OpenAPI/generated TS only if contract changes.
- Sprint 3/HU docs and evidence.

Exact files MUST be obtained from the local tree; this design intentionally does not invent repository filenames.

## Baseline Audit

### Required local Git baseline

Before APPLY:

- pwd.
- repository root.
- current branch.
- HEAD.
- `git status --short`.
- staged diff.
- unstaged diff.
- untracked files.
- recent OpenSpec changes.
- current migration state.

Current generation:

| Field        | Value              |
| ------------ | ------------------ |
| Branch       | `UNVERIFIED_LOCAL` |
| HEAD         | `UNVERIFIED_LOCAL` |
| Working tree | `UNVERIFIED_LOCAL` |
| Staged       | `UNVERIFIED_LOCAL` |
| Unstaged     | `UNVERIFIED_LOCAL` |
| Untracked    | `UNVERIFIED_LOCAL` |

### Sprint 3 state to reconstruct

Confirm locally:

- HU-008–HU-031 actual product status.
- HU-026/HU-027 frontend status.
- HU-028 current implementation.
- HU-029/HU-030/HU-031 current implementation.
- demo reporting seed state.
- active OpenSpec changes.
- archived changes.
- deferred manual evidence.
- docs that still say frontend/backend pending.

No historical status is accepted without code/current evidence.

## HU-032 Definition

HU-032 is the final MVP hardening story.

It combines:

- mandatory functional corrections;
- visual reconciliation;
- role dashboards;
- responsive consolidation;
- accessibility hardening;
- maintainer review;
- maintainer-edit propagation;
- final deferred evidence;
- final regression;
- final acceptance preparation.

It is NOT a new feature sprint.

## Visual Source Audit Status

Reference inventory:

`74 / 74 catalogued below`

Generator-level semantic classification:

`74 / 74`

Pixel-level visual comparison against the local implementation:

`VISUAL_COMPARE_PENDING`

Reason:

The uploaded ZIP is not exposed in this generation runtime as 74 independently inspectable image objects.

Task 2 MUST complete local extraction/viewing before visual implementation.

This is a technical exploration task, not a product decision.

## Global Visual Analysis

Target language derived from the supplied references:

- very dark global background;
- dark desktop sidebar;
- square orange Fratelli mark;
- compact icon navigation;
- active item on elevated/darker-gray surface;
- orange primary CTA/accent;
- horizontal topbar;
- white page title;
- muted subtitle;
- dark cards with subtle borders;
- moderate radii;
- consistent spacing;
- compact tables;
- state badges;
- green success;
- amber warning;
- red destructive/error;
- blue informational;
- orange primary buttons;
- dark neutral secondary buttons;
- destructive red actions;
- dark forms/filter cards;
- Drawer-style desktop details;
- Sheet/Bottom-Sheet mobile details;
- desktop table → mobile cards;
- skeleton/empty/success/error states;
- compact icon actions;
- dominant primary CTA;
- muted secondary metadata;
- summary cards before tabular content only where contract-backed.

The final visual pass SHOULD consolidate current tokens rather than copy individual hex values into each screen.

## Shell / Container Strategy

One AppShell remains authoritative.

Desktop:

- fixed/persistent sidebar according to current layout;
- compact topbar;
- page content area with consistent max-width/padding;
- role-aware navigation.

Mobile:

- use current mobile navigation/drawer implementation;
- do not reproduce historical bottom navigation blindly;
- maintain touch-accessible controls;
- avoid separate shell per role.

Role dashboards change page content, not the application shell.

## Dashboard Architecture

Use:

- one Inicio route;
- capability-aware widget composition;
- small shared dashboard primitives;
- role/capability-based layout ordering.

Avoid:

- six duplicated page implementations when shared composition suffices;
- one gigantic generic Dashboard DSL;
- one endpoint per role by default.

Dashboard data source rule:

    current real endpoint/query
      → TanStack Query
      → authorized widget
      → presentation

If data is unavailable:

    omit widget
    OR
    use a real navigation card

Never:

    mockup metric
      → hardcoded fake number

## Dashboard Matrix

| Role          | Reference                              | Real capabilities to audit/use                                                                                                       | Mockup-only capabilities to OMIT unless real                                                 | Possible real widgets                                                | Backend strategy                                  | Responsive target                           |
| ------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------- |
| ADMINISTRADOR | Dashboard Administrador Desktop/Mobile | global operation, products, inventory, purchases, expenses, users, shifts/cash, reports, attendance according to actual capabilities | CARD payment, fake growth %, unsupported KPIs                                                | active orders, low stock, shift/cash state, shortcuts, reports       | existing endpoints first                          | desktop dense grid; mobile stacked priority |
| ENCARGADO     | Dashboard Encargado Desktop            | operational orders, inventory, production, purchases, expenses, shift/cash                                                           | tips, unsupported audit analytics                                                            | orders, production, stock, pending purchases, expenses, cash/shift   | existing queries                                  | dense operational grid → mobile stack       |
| MESERO        | Dashboard Mesero Desktop               | orders, checkout/sales scope, customers, attendance, own/current shift where real                                                    | tables if absent, tips, prebill/printing/service tracking                                    | new order, current orders, sales/history shortcut, attendance, shift | existing scoped endpoints                         | strong primary CTA                          |
| COCINA        | Dashboard Cocina Desktop               | kitchen, production, inventory, kitchen purchases, attendance if actual                                                              | camera temperature, cleaning checklist, supply-request subsystem                             | today commands, production shortcut, low stock, prepared inventory   | existing endpoints, today restriction for Kitchen | monitor-like desktop, concise mobile        |
| CONTADORA     | Dashboard Contadora Desktop            | reports, attendance read, closing history, expense/inventory reads per actual policy                                                 | close approval, P&L, cash-flow accounting, payroll, valuation/audit features not implemented | report shortcuts, closing history, expenses/inventory read summaries | existing read contracts                           | analytics/navigation focused                |
| EMPLEADO      | Dashboard Empleado Desktop             | own attendance/checkin/checkout/history according to Employee link                                                                   | break, incident reporting, overtime, future schedules unless real                            | attendance current state, check action, history                      | personal attendance contract                      | minimal, action-first                       |

Multi-role dashboards MUST use union of the applicable widgets.

## 74-Reference Visual Matrix

Legend:

- `LOCAL_AUDIT_REQUIRED`: current local screen must be inspected before APPLY.
- `UNVERIFIED`: similarity cannot be certified from this generation.
- `ADAPT`: visual hierarchy/pattern useful, but real contracts/current AppShell win.
- `KEEP`: concept/pattern is directly useful.
- `OMIT`: reference is not a separate product experience.
- `MANUAL-LATER`: final styling may be superseded by maintainer Phase-B edits.

|  ID | Folder      | Reference file                                    | Feature / expected route    | Role                          | Visual purpose                 | Current screen       | Similarity | Decision                | Functional instruction / mismatch guard                                            | Risk               | Backend dependency                     | Tests / evidence      |
| --: | ----------- | ------------------------------------------------- | --------------------------- | ----------------------------- | ------------------------------ | -------------------- | ---------- | ----------------------- | ---------------------------------------------------------------------------------- | ------------------ | -------------------------------------- | --------------------- |
|  01 | P5          | Estados de Inventario.png                         | Inventory shared states     | capability-based              | loading/empty/error/status     | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | shared states, no fake stock                                                       | VISUAL             | NONE                                   | states + 360          |
|  02 | P5          | Inventario - Existencias Desktop.png              | Inventario existencias      | inventory readers             | filters/table/summary          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F9 default type; real statuses                                                     | MEDIUM             | NONE                                   | F9 + desktop          |
|  03 | P5          | Inventario - Existencias Móvil.png                | Inventario existencias      | inventory readers             | mobile cards/filter            | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | no squeezed table                                                                  | VISUAL             | NONE                                   | 360                   |
|  04 | P5          | Inventario - Movimientos Desktop.png              | Inventario movimientos      | authorized readers            | movement table/filter          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F10 today default                                                                  | HIGH               | NONE preferred                         | F10/date              |
|  05 | P5          | Modales de Inventario.png                         | Inventory operations        | actual writers                | modal hierarchy                | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | preserve real mutations only                                                       | MEDIUM             | NONE                                   | modal/a11y            |
|  06 | P5          | Productos - Catálogo Unificado Desktop.png        | Productos/catálogo          | product readers/writers       | unified catalog/table          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | real CI? n/a; real product fields only                                             | VISUAL             | NONE                                   | desktop/regression    |
|  07 | P10         | Gastos - Estados y Feedback.png                   | Gastos states               | readers/writers               | success/loading/error/empty    | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | no cloud-sync fiction                                                              | VISUAL             | NONE                                   | states                |
|  08 | P10         | Gastos - Historial (Desktop).png                  | Gastos historial            | history readers               | filters/table                  | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F23/F24 eye/detail                                                                 | MEDIUM             | NONE/READ_ENDPOINT_MINIMAL conditional | detail                |
|  09 | P10         | Gastos - Mobile View.png                          | Gastos register/history     | readers/writers               | mobile cards/forms             | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | role-aware tabs; F23/F24                                                           | VISUAL             | NONE                                   | 360                   |
|  10 | P10         | Gastos - Registrar (Desktop).png                  | Registrar gasto             | actual writers                | form grouping                  | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | do not reopen HU-020 rules                                                         | VISUAL             | NONE                                   | regression            |
|  11 | P11         | Mi Asistencia - Desktop (Estado A).png            | `/mi-asistencia` conceptual | linked authenticated Employee | personal current state/history | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F12 correctness before polish                                                      | BLOCKER            | BUG_FIX possible                       | runtime integration   |
|  12 | P11         | Mi Asistencia - Estados Adicionales.png           | personal attendance states  | linked/unlinked Employee      | skeleton/error/empty           | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | factual errors; no motivational filler                                             | HIGH               | BUG_FIX possible                       | loading/error/no-link |
|  13 | P11         | Mi Asistencia - Mobile (Estado B).png             | personal attendance         | linked Employee               | active state/action            | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | CheckIn/Out authority backend                                                      | HIGH               | BUG_FIX possible                       | 360/mutations         |
|  14 | P12         | Composition Screen - Desktop.png                  | composición                 | actual composition managers   | editor hierarchy               | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | preserve real unit/conversion rules                                                | MEDIUM             | NONE                                   | desktop               |
|  15 | P12         | Composition Screen - Mobile.png                   | composición                 | actual managers               | stacked editor                 | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | mobile cards, no new recipe features                                               | VISUAL             | NONE                                   | 360                   |
|  16 | P12         | Estados de Validación y Éxito.png                 | composición states          | writers                       | validation/success             | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | actual validation only                                                             | MEDIUM             | NONE                                   | validation            |
|  17 | P13         | Confirmación y Éxito - Producción.png             | registrar producción        | production writers            | confirmation/success           | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | preserve inventory effects                                                         | MEDIUM             | VALIDATION_CHANGE F8                   | regression            |
|  18 | P13         | Registrar Producción - Desktop.png                | producción registrar        | writers                       | production form                | LOCAL_AUDIT_REQUIRED | UNVERIFIED | REPLACE/ADAPT           | F6 stacked search/list; F7/F8                                                      | HIGH               | VALIDATION_CHANGE                      | F6-F8                 |
|  19 | P13         | Registrar Producción - Mobile.png                 | producción registrar        | writers                       | mobile production              | LOCAL_AUDIT_REQUIRED | UNVERIFIED | REPLACE/ADAPT           | stacked on mobile too                                                              | HIGH               | VALIDATION_CHANGE                      | 360 + F6-F8           |
|  20 | P14         | Cobro - Desktop.png                               | Checkout real               | sales writers                 | transaction hierarchy          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | preserve Order/Shift/Payment/Channel                                               | MEDIUM             | NONE                                   | sales regression      |
|  21 | P14         | Cobro - Mobile.png                                | Checkout                    | sales writers                 | mobile checkout                | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | no fiscal/print invention                                                          | VISUAL             | NONE                                   | 360                   |
|  22 | P14         | Modales de Cobro.png                              | checkout modals             | sales writers                 | confirm/error patterns         | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | real shortage/customer/payment flows                                               | MEDIUM             | NONE                                   | modal regression      |
|  23 | P15         | Compras - Desktop.png                             | `/compras` conceptual       | purchase readers/writers      | history/operations table       | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F19/F20; single purchase module                                                    | HIGH               | NONE                                   | month/eye             |
|  24 | P15         | Compras - Mobile.png                              | compras                     | purchase readers/writers      | mobile cards                   | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | preserve receive/cancel                                                            | VISUAL             | NONE                                   | 360                   |
|  25 | P15         | Modal Cancelar Compra.png                         | cancel purchase             | authorized writer             | destructive modal              | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | real reason/rules; no misleading inventory copy                                    | MEDIUM             | NONE                                   | cancel regression     |
|  26 | P16         | Confirmación y Éxito - Nueva Compra.png           | nueva compra                | writers                       | confirmation/success           | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | preserve existing workflow                                                         | VISUAL             | NONE                                   | regression            |
|  27 | P16         | Modal Confirmar Recepción.png                     | recibir compra              | writers                       | confirmation modal             | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | receipt contract authority                                                         | MEDIUM             | NONE                                   | receive regression    |
|  28 | P16         | Nueva Compra - Desktop.png                        | nueva compra                | writers                       | purchase form                  | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | no new PurchaseArea manual rule                                                    | VISUAL             | NONE                                   | desktop               |
|  29 | P16         | Nueva Compra - Mobile.png                         | nueva compra                | writers                       | stacked mobile form            | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | maintain usable inputs                                                             | VISUAL             | NONE                                   | 360                   |
|  30 | P16         | Recibir compra - Pantalla Principal.png           | recibir compra              | writers                       | receipt detail/action          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | real receipt data                                                                  | MEDIUM             | NONE                                   | receive               |
|  31 | P17         | Compra Recibida - Estado Final.png                | purchase received success   | writers/readers               | immutable success state        | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | factual receipt results                                                            | VISUAL             | NONE                                   | success               |
|  32 | P18         | Caja - Desktop-1.png                              | Turnos/Caja                 | shift/cash roles              | operational summary/turns      | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F1/F14/F15                                                                         | HIGH               | NONE/DTO_EXTENSION conditional         | cash values           |
|  33 | P18         | Caja - Desktop.png                                | Turnos/Caja                 | shift/cash roles              | summary/control                | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F1/F14/F15; no fake close state                                                    | HIGH               | NONE/DTO_EXTENSION                     | regression            |
|  34 | P18         | Caja - Mesero (Desktop).png                       | own shift/cash variant      | MESERO scope                  | limited operational view       | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | actual own-shift capability only                                                   | MEDIUM             | NONE                                   | role                  |
|  35 | P18         | Caja - Mobile.png                                 | Turnos/Caja                 | authorized roles              | mobile operational cards       | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | current state first                                                                | VISUAL             | NONE                                   | 360                   |
|  36 | P19         | Detalle de producción - Drawer.png                | production history detail   | readers                       | detail hierarchy               | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | consumption snapshot only                                                          | MEDIUM             | NONE                                   | detail                |
|  37 | P19         | Estados de Historial - Vacío y Carga.png          | production history states   | readers                       | loading/empty                  | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP                    | factual empty vs filtered empty                                                    | VISUAL             | NONE                                   | states                |
|  38 | P19         | Historial de producción - Desktop.png             | `/produccion` conceptual    | readers                       | cards/filters/table            | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F4/F5                                                                              | HIGH               | NONE                                   | month/eye             |
|  39 | P19         | Historial de producción - Mobile.png              | production history          | readers                       | mobile cards                   | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | same details/filter semantics                                                      | VISUAL             | NONE                                   | 360                   |
|  40 | P20         | Clientes - Desktop.png                            | `/clientes` conceptual      | customer readers/writers      | search/table                   | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | actual HU-014 fields override mockup omissions                                     | MEDIUM             | NONE                                   | regression            |
|  41 | P20         | Clientes - Mobile.png                             | clientes                    | readers/writers               | mobile cards                   | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | lifecycle actions capability-aware                                                 | VISUAL             | NONE                                   | 360                   |
|  42 | P20         | Modal Cliente.png                                 | customer form               | writers                       | modal/form                     | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | Name/CI/NIT/Notes actual contract wins                                             | MEDIUM             | NONE                                   | form                  |
|  43 | P21         | Ventas - Detalle Bottom Sheet (Mobile).png        | Sales History detail        | sales-history readers         | mobile detail                  | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | F21; snapshots; no fake fiscal fields                                              | MEDIUM             | NONE                                   | mobile detail         |
|  44 | P21         | Ventas - Detalle Drawer (Desktop).png             | Sales History detail        | readers                       | desktop Drawer                 | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | preserve snapshot authority                                                        | MEDIUM             | NONE                                   | drawer                |
|  45 | P21         | Ventas - Historial (Desktop).png                  | Sales History               | readers                       | filters/table                  | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F21/F22                                                                            | HIGH               | NONE/QUERY_CHANGE conditional          | today/eye             |
|  46 | P21         | Ventas - Historial (Mobile).png                   | Sales History               | readers                       | mobile cards                   | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | current-day inclusion                                                              | HIGH               | NONE/QUERY_CHANGE                      | 360                   |
|  47 | P22         | Asistencia de Trabajadores - Desktop.png          | admin attendance            | admin readers                 | filters/table/summary          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F11/F12; read-only history unaffected                                              | BLOCKER dependency | BUG_FIX F12                            | attendance            |
|  48 | P22         | Asistencia de Trabajadores - Móvil.png            | admin attendance            | readers                       | cards/filters                  | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | no admin mutations from mockup                                                     | VISUAL             | NONE                                   | 360                   |
|  49 | P22         | Estados de Asistencia (Loading, Empty, Error).png | attendance states           | readers                       | states                         | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | no fake technical error code                                                       | MEDIUM             | NONE                                   | states                |
|  50 | P23         | Cierre de Caja - Desktop.png                      | final cash close            | close writers                 | expected/declared/diff         | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | backend authority; F15 copy cleanup                                                | MEDIUM             | NONE                                   | regression            |
|  51 | P23         | Cierre de Caja - Móvil.png                        | cash close                  | writers                       | mobile stacked flow            | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | no signature/print invention                                                       | VISUAL             | NONE                                   | 360                   |
|  52 | P23         | Estados de Cierre (Confirmación y Éxito).png      | cash close states           | writers                       | confirm/success                | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | no HU-026/HU-027 visible                                                           | MEDIUM             | NONE                                   | F15                   |
|  53 | P24         | Cierres de Caja - Desktop.png                     | `/turnos/cierres`           | history readers               | filters/table                  | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F16 local search; no export                                                        | MEDIUM             | NONE                                   | search                |
|  54 | P24         | Cierres de Caja - Móvil.png                       | closing history             | readers                       | mobile cards                   | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | search/filter mobile usable                                                        | VISUAL             | NONE                                   | 360                   |
|  55 | P24         | Detalle de Cierre - Snapshot.png                  | closing detail              | readers                       | reconciliation snapshot        | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | persisted snapshot; no signature/last modification fiction                         | HIGH               | NONE                                   | detail                |
|  56 | P25         | Reporte de Ventas - Admin Desktop.png             | `/reportes/ventas`          | report readers                | summary/charts/export          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F25; backend-authoritative metrics                                                 | MEDIUM             | NONE                                   | regression/copy       |
|  57 | P25         | Reporte de Ventas - Admin Mobile.png              | sales report                | report readers                | mobile analytics               | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | no duplicate sales history                                                         | VISUAL             | NONE                                   | 360                   |
|  58 | P25         | Reporte de Ventas - Estados UI.png                | sales report states         | readers                       | loading/empty/error            | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | real errors; no fake support                                                       | VISUAL             | NONE                                   | states                |
|  59 | P25         | Reporte de Ventas - Mesero Desktop.png            | historical visual reference | MESERO                        | layout inspiration only        | LOCAL_AUDIT_REQUIRED | UNVERIFIED | OMIT as separate report | MESERO should use actual HU-015 scope unless real report permission says otherwise | MEDIUM             | NONE                                   | auth                  |
|  60 | P26         | Reporte de Inventario - Admin Desktop.png         | `/reportes/inventario`      | inventory-report readers      | summary/table/filter           | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | real NORMAL/LOW/NEGATIVE                                                           | MEDIUM             | NONE                                   | report regression     |
|  61 | P26         | Reporte de Inventario - Cocina Desktop.png        | inventory report scoped     | COCINA if authorized          | role-scoped read view          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | backend scope authority; no client security filter                                 | HIGH               | NONE                                   | role                  |
|  62 | P26         | Reporte de Inventario - Mobile.png                | inventory report            | readers                       | cards/summary/export           | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | no inline stock mutation                                                           | VISUAL             | NONE                                   | 360                   |
|  63 | P27         | Reporte de Asistencia - Admin Desktop.png         | `/reportes/asistencia`      | report readers                | employee analytics             | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | F13 truth; no duplicated admin history                                             | MEDIUM             | NONE                                   | report                |
|  64 | P27         | Reporte de Asistencia - Empleado Desktop.png      | historical visual reference | EMPLEADO                      | personal/report inspiration    | LOCAL_AUDIT_REQUIRED | UNVERIFIED | OMIT as separate report | `/mi-asistencia` remains personal experience                                       | MEDIUM             | NONE                                   | auth/nav              |
|  65 | P27         | Reporte de Asistencia - Mobile.png                | attendance report           | report readers                | employee analytics mobile      | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT                   | no auto-absence claim                                                              | VISUAL             | NONE                                   | 360                   |
|  66 | Referencias | Container.png                                     | AppShell/global container   | all authenticated             | shell/layout baseline          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | one shell only                                                                     | HIGH               | NONE                                   | all routes            |
|  67 | Referencias | Dashboard Administrador - Desktop.png             | Inicio admin                | ADMINISTRADOR                 | dashboard density/widgets      | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT/MANUAL-LATER      | real metrics only                                                                  | MEDIUM             | existing queries first                 | desktop               |
|  68 | Referencias | Dashboard Administrador - Mobile.png              | Inicio admin                | ADMINISTRADOR                 | mobile dashboard hierarchy     | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT/MANUAL-LATER      | no fake KPI                                                                        | VISUAL             | NONE                                   | 360                   |
|  69 | Referencias | Dashboard Cocina - Desktop.png                    | Inicio cocina               | COCINA                        | monitor/quick actions          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT/MANUAL-LATER      | omit temperature/checklist/request subsystem                                       | MEDIUM             | existing queries                       | dashboard             |
|  70 | Referencias | Dashboard Contadora - Desktop.png                 | Inicio contadora            | CONTADORA                     | analytics/read dashboard       | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT/MANUAL-LATER      | omit P&L/payroll/approval/valuation                                                | MEDIUM             | existing queries                       | dashboard             |
|  71 | Referencias | Dashboard Empleado - Desktop.png                  | Inicio employee             | EMPLEADO                      | minimal attendance-first       | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT/MANUAL-LATER      | omit break/incidents/overtime/future shift if unsupported                          | MEDIUM             | attendance existing                    | dashboard             |
|  72 | Referencias | Dashboard Encargado - Desktop.png                 | Inicio manager              | ENCARGADO                     | operational dashboard          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT/MANUAL-LATER      | omit tips/non-contract audit data                                                  | MEDIUM             | existing queries                       | dashboard             |
|  73 | Referencias | Dashboard Mesero - Desktop.png                    | Inicio waiter               | MESERO                        | action-first terminal          | LOCAL_AUDIT_REQUIRED | UNVERIFIED | ADAPT/MANUAL-LATER      | omit tips/tables/prebill unless real                                               | MEDIUM             | existing queries                       | dashboard             |
|  74 | Referencias | Estados\_ Vacío y Skeleton - Fratelli.png         | shared async states         | all                           | cross-system state language    | LOCAL_AUDIT_REQUIRED | UNVERIFIED | KEEP/ADAPT              | shared primitive; factual copy                                                     | VISUAL             | NONE                                   | state regression      |

### Visual Audit Conclusion

The 74 references divide into:

- operational references to ADAPT against real contracts;
- state/detail patterns that can largely be KEEP/ADAPT;
- two clearly historical role-report references that should not become duplicate product experiences;
- six role dashboards that define dashboard feel but not fake capabilities;
- one global shell reference;
- one global state reference.

No reference authorizes new domain functionality.

## Functional Gap Matrix

Backend-class legend:

- NONE.
- QUERY_CHANGE.
- DTO_EXTENSION.
- READ_ENDPOINT_MINIMAL.
- VALIDATION_CHANGE.
- BUG_FIX.
- SCHEMA_BLOCKER.

Where two values appear, the first is the preferred design and the second is allowed only if local audit proves it necessary.

| ID  | Reported current behavior                           | Expected                       | Suspected layer to audit                      | Areas likely involved                      | Backend class                                       | OpenAPI                                          | DB                                              | Tests                          | Severity      | Decision |
| --- | --------------------------------------------------- | ------------------------------ | --------------------------------------------- | ------------------------------------------ | --------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------- | ------------------------------ | ------------- | -------- |
| F1  | Cash/Shift cards do not show amounts correctly      | real mapped amounts            | DTO/generated/query/UI/formatter              | shifts/cash + shared money                 | NONE → DTO_EXTENSION if missing contract            | conditional                                      | NO                                              | rendering/mapping              | HIGH          | FROZEN   |
| F2  | Inicio may be generic                               | role-aware dashboards          | dashboard/nav/auth/query composition          | Inicio + navigation + feature queries      | NONE preferred                                      | NO expected                                      | NO                                              | roles/multirole/widgets        | HIGH          | FROZEN   |
| F3  | Kitchen may show old commands                       | today-only                     | query/backend filter/time                     | kitchen                                    | QUERY_CHANGE preferred                              | conditional                                      | NO                                              | day boundary                   | HIGH          | FROZEN   |
| F4  | Production to=today may exclude today               | complete current month         | frontend defaults/date contract               | production history                         | NONE preferred                                      | NO                                               | NO                                              | date default                   | HIGH          | FROZEN   |
| F5  | Production text detail action                       | Eye                            | UI                                            | production history/shared icon             | NONE                                                | NO                                               | NO                                              | icon/a11y                      | LOW/VISUAL    | FROZEN   |
| F6  | Search and selector appear independent/side-by-side | stacked search + list          | UI state/layout                               | production register                        | NONE                                                | NO                                               | NO                                              | filtering/selection            | MEDIUM        | FROZEN   |
| F7  | Production unit not visible                         | actual unit                    | DTO mapping/UI                                | production register                        | NONE → DTO_EXTENSION only if contract lacks unit    | conditional                                      | NO                                              | unit render                    | HIGH          | FROZEN   |
| F8  | Discrete quantity may accept decimals               | reject fraction authoritative  | backend/domain validation + UI                | production                                 | VALIDATION_CHANGE                                   | possible if error contract changes, otherwise NO | NO expected                                     | domain/application/integration | HIGH          | FROZEN   |
| F9  | Inventory default not Product-of-sale               | default correct type           | UI filter state                               | inventory                                  | NONE                                                | NO                                               | NO                                              | defaults                       | MEDIUM        | FROZEN   |
| F10 | Movements default not today                         | today                          | UI/query date                                 | inventory                                  | NONE → QUERY_CHANGE if backend cannot express range | conditional                                      | NO                                              | timezone                       | HIGH          | FROZEN   |
| F11 | `/asistencia/hoy` reachable only manually           | visible authorized CTA         | navigation/UI                                 | attendance/navigation                      | NONE                                                | NO                                               | NO                                              | route/nav roles                | MEDIUM        | FROZEN   |
| F12 | runtime CheckIn/Out not reflected in history        | persisted + query-visible      | endpoint/application/persistence/history/time | attendance backend + frontend invalidation | BUG_FIX                                             | conditional                                      | NO expected; SCHEMA_BLOCKER if proven otherwise | mandatory integration          | BLOCKER       | FROZEN   |
| F13 | no automatic absence                                | explicitly post-MVP            | docs/scope                                    | attendance docs                            | NONE                                                | NO                                               | NO                                              | no new behavior                | INFO          | FROZEN   |
| F14 | Shift summary not useful                            | real summary                   | mapping/query/DTO                             | shifts/cash                                | NONE → DTO_EXTENSION                                | conditional                                      | NO                                              | card data                      | HIGH          | FROZEN   |
| F15 | stale HU-026/HU-027 copy                            | product language               | frontend/docs                                 | cash/shifts/docs                           | NONE                                                | NO                                               | NO                                              | copy assertions                | LOW           | FROZEN   |
| F16 | no textual closing search                           | local loaded-row search        | frontend                                      | cash closing history                       | NONE                                                | NO                                               | NO                                              | filter scope                   | MEDIUM        | FROZEN   |
| F17 | supplier text action buttons                        | shared icons                   | frontend                                      | suppliers/shared icons                     | NONE                                                | NO                                               | NO                                              | roles/a11y                     | LOW/VISUAL    | FROZEN   |
| F18 | supplier detail missing                             | real read-only detail          | UI/data contract                              | suppliers                                  | NONE → READ_ENDPOINT_MINIMAL                        | conditional                                      | NO                                              | detail                         | MEDIUM        | FROZEN   |
| F19 | Purchase range default differs                      | current month                  | frontend/query date                           | purchases                                  | NONE                                                | NO                                               | NO                                              | date                           | HIGH          | FROZEN   |
| F20 | Purchase text detail                                | Eye                            | frontend                                      | purchases/shared icon                      | NONE                                                | NO                                               | NO                                              | icon/detail                    | LOW/VISUAL    | FROZEN   |
| F21 | Sales History text detail                           | Eye                            | frontend                                      | sales history                              | NONE                                                | NO                                               | NO                                              | icon/detail                    | LOW/VISUAL    | FROZEN   |
| F22 | today's Sales may be excluded                       | all current-day Sales          | date defaults/backend semantics               | sales history                              | NONE → QUERY_CHANGE                                 | conditional                                      | NO                                              | date boundary                  | HIGH          | FROZEN   |
| F23 | Expense no eye action                               | Eye                            | frontend                                      | expenses history                           | NONE                                                | NO                                               | NO                                              | a11y                           | LOW/VISUAL    | FROZEN   |
| F24 | Expense detail absent                               | real read-only detail          | UI/data contract                              | expenses                                   | NONE → READ_ENDPOINT_MINIMAL                        | conditional                                      | NO                                              | detail                         | MEDIUM        | FROZEN   |
| F25 | Sales Report references HU-015                      | functional copy                | frontend                                      | reports                                    | NONE                                                | NO                                               | NO                                              | copy                           | LOW           | FROZEN   |
| F26 | screens visually inconsistent                       | consolidated Fratelli language | cross-frontend                                | all supplied-reference features            | NONE by default                                     | NO                                               | NO                                              | visual/responsive/regression   | VISUAL/MEDIUM | FROZEN   |

## Routing Impact

Expected conceptual route behavior to confirm locally:

- Inicio remains the dashboard entry.
- Kitchen remains one operational page; no second `today` page unless already established.
- Production history and register remain separate concerns.
- Inventory existences/movements remain existing routes.
- Attendance today route is reused, not duplicated.
- `/turnos/cierres` remains history.
- Purchases remain one module.
- Sales History remains one history.
- Expense history remains one history.
- Reports remain existing report routes.

No route should be created merely to imitate a screenshot.

## Navigation Impact

- Add/repair visible Attendance Today secondary entry for authorized roles.
- Inicio remains one global nav item.
- Role dashboards change page content, not global shell duplication.
- Global nav remains capability-aware.
- Multi-role users receive the union.
- No permanent duplicate `Asistencia` + `Mi asistencia` items unless actual architecture explicitly requires it.
- No new fake role-specific modules.

## Icon Strategy

Audit currently installed icon set first.

Shared semantic mapping:

- View → Eye.
- Edit → Pencil/Edit.
- Deactivate → semantic power/ban/user-x equivalent.
- Delete → Trash only when actual permanent delete exists.

Create/reuse one IconButton convention rather than ad hoc classes.

Required behavior:

- aria-label.
- tooltip/title where useful.
- focus-visible.
- disabled.
- destructive semantic variant.
- 40–44px-ish touch affordance according to current system.

No new icon library by default.

## Responsive Strategy

Breakpoints are behavioral targets, not screenshot dimensions only.

### 360

- mobile navigation usable;
- major CTA visible;
- filters stacked/overlay;
- desktop tables replaced by cards where needed;
- no 8-column squeeze;
- overlays fit viewport;
- touch targets accessible.

### 768

- intermediate grid/stack;
- avoid awkward desktop-only assumptions;
- filters can wrap cleanly.

### 1280+

- desktop sidebar/topbar;
- tables and dense dashboards;
- Drawer details;
- multi-column cards where useful.

## Drawer / Sheet Strategy

One detail state/data source.

Presentation:

- desktop → Drawer where current primitive exists;
- mobile → Sheet/Bottom Sheet;
- fallback → existing Modal if Drawer/Sheet is not part of current architecture.

Do not implement separate business logic for each viewport.

## Form Strategy

Use shared controls for:

- labels;
- help/error text;
- required state;
- numeric validation;
- select/list state;
- pending state.

Production F6 explicitly changes hierarchy:

    Buscar producto
    ↓
    Lista filtrada
    ↓
    Producto seleccionado
    ↓
    Cantidad + unidad
    ↓
    Notes/impact
    ↓
    Confirm

## Date / Time Strategy

Business timezone:

`America/La_Paz`

Before changing any date filter, classify its backend contract:

1. DateOnly / BusinessDate.
2. timestamp inclusive.
3. timestamp exclusive.
4. textual/other.

Preferred timestamp ranges:

- today:
  `[todayStart, tomorrowStart)`

- month:
  `[firstDayCurrentMonth, firstDayNextMonth)`

Never use `23:59:59` as an assumed precision ceiling.

Do not derive business dates through uncontrolled UTC slicing.

## Kitchen Query Strategy

Preferred data flow:

    business clock / BusinessDate
      → current day boundary
      → backend Kitchen query/filter
      → TanStack Query key includes day/filter
      → current-day commands
      → existing realtime update
      → invalidate/refetch same current-day universe

Do not:

    fetch unbounded history
      → hide yesterday client-side
      → claim backend current-day authority

If current Kitchen endpoint cannot express the range:

- first option: extend existing query.
- new endpoint: only if existing route cannot cleanly support the read contract.

## Production Quantity Strategy

Audit Unit representation.

Required classification mechanism MUST be based on actual domain semantics.

Potential implementation forms, only after audit:

- explicit current Unit type/metadata;
- stable unit identifier/category;
- existing conversion/dimension metadata.

Avoid:

- Product-name heuristic;
- arbitrary localized text comparison if not canonical;
- frontend-only `step`.

Validation flow:

    request quantity + selected product/unit
      → application/domain validation
      → discrete? quantity integer required
      → divisible? valid decimal precision
      → existing stock/composition validation
      → persistence

## Inventory Default Filters

Existences:

- default type = actual value equivalent to `Producto de venta`.

Movements:

- current business day.

No authorization filtering should move client-side.

## Attendance Bug Investigation Design

Priority:

`BLOCKER / FIRST FUNCTIONAL INVESTIGATION`

Trace four layers independently.

### 1. Write

- authenticated actor.
- Employee resolution.
- Assignment/current shift.
- CheckIn operation.
- CheckOut operation.
- save/transaction.
- persisted keys/timestamps/state.

### 2. Database representation

- actual Attendance row.
- Employee/User FK.
- Assignment/Shift relation.
- BusinessDate.
- nullable CheckOut.
- lifecycle fields.

### 3. Read

- personal history endpoint.
- administrative history endpoint if applicable.
- date predicates.
- status predicates.
- Employee scope.
- pagination/order.
- absence unions/derived rows if present.

### 4. Frontend

- mutation response.
- invalidation.
- query key.
- history filters.
- staleTime/refetch.
- presentation.

Mandatory golden runtime test:

    authenticate linked Employee
      → valid assignment/current context
      → CheckIn
      → assert success
      → CheckOut
      → assert success
      → GET canonical history
      → assert new persisted record exists

The test MUST fail before/with defect reproduction and pass after the real fix.

Seed rows do not satisfy this evidence.

## Attendance No-Auto-Absence Boundary

Automatic generation:

`POST_MVP`

HU-032 may:

- display existing/derived absence data;
- report it;
- document it.

HU-032 may NOT:

- create background scheduler;
- close attendance automatically;
- synthesize new stored absence rows.

## Shift Summary Strategy

Audit current cards and intended meaning.

Preferred sources:

- CashSession opening values.
- current Shift lifecycle.
- handover values.
- Cash Preview values.
- current approved Sales/Expense aggregates already exposed.

For each card define:

- label.
- authority field.
- null behavior.
- role visibility.
- query source.

If no approved semantic value exists, remove/reframe the card instead of inventing a business metric.

## Closing Text Filter Strategy

The filter is explicitly local.

Data flow:

    server period/page query
      → loaded rows
      → local normalized searchable representation
      → date display text
      → responsible display
      → declaredCash visible representation
      → filtered currently-loaded rows

The UI MUST remain clear that pagination/server period still defines the loaded universe.

No server endpoint is added solely for F16.

## Supplier Detail Strategy

Priority order:

1. existing list row contains sufficient fields;
2. existing Supplier detail read API;
3. minimal read endpoint if and only if required data exists but is not available.

Detail remains read-only.

No analytics.

## Purchase Date Strategy

Default:

    first day current month
      → first day next month

or exact equivalent for DateOnly semantics.

Changing filters/page behavior should follow existing Sprint 3 history patterns.

## Sales History Date Strategy

First reproduce the reported current-day exclusion.

Determine:

- API query field type.
- backend predicate.
- generated type.
- frontend default.

Fix the actual layer.

Do not send tomorrow blindly if backend expects an inclusive DateOnly.

## Expense Detail Strategy

Use row DTO when complete.

If not:

- audit existing read endpoint;
- only then consider minimal read endpoint.

No history mutation.

## Report Copy Cleanup

Replace internal story references with functional copy.

Examples:

- `Ver historial de ventas`.
- `Consulta los cierres registrados`.
- other product-language equivalents.

Internal specs/tests may keep HU IDs.

## Contracts Changed

No external contract changes are confirmed from the provided input.

Conditional contract changes MAY be required after repository audit for:

- Kitchen current-day query.
- Production validation error/contract.
- Attendance bug fix if read/write DTO semantics are wrong.
- Shift/Cash summary projection.
- Supplier/Expense read detail.

Any HTTP contract change requires:

    backend change
      → backend tests
      → Development runtime OpenAPI
      → generated TypeScript regeneration
      → frontend use
      → generated diff review

Schema remains expected:

`UNCHANGED`

## OpenAPI Impact

Expected:

`CONDITIONAL`

No regeneration if all fixes stay within existing contracts.

Regeneration REQUIRED if endpoint query/DTO surface changes.

Manual generated edit:

`PROHIBITED`

## EF / Schema Impact

Expected schema change:

`NO`

Expected migration:

`NONE`

If F12/F8 reveals unavoidable schema requirement:

`HU_032_SCHEMA_PRODUCT_DECISION_REQUIRED`

and implementation pauses for that requirement.

## Data Flow

### Dashboard

- User authenticates.
- Roles/capabilities resolve.
- Inicio computes authorized widget set.
- Only required existing queries execute.
- Real values format through shared formatters.
- Unsupported widget is omitted or navigation-only.

### Kitchen

- Current business date resolves.
- Current-day server query executes.
- Existing realtime updates invalidate the same query scope.
- Old-day records remain excluded.

### Production

- Business-month defaults resolve.
- History query includes current day.
- Eye opens existing detail.
- Register search filters real candidate Products.
- selected Product exposes real Unit.
- backend validates discrete/divisible quantity.

### Attendance

- CheckIn/Out write canonical persistence.
- response/refetch updates current state.
- history query reads the same canonical record universe.
- runtime-created row appears.

### Shift/Cash

- Current Shift/CashSession loads.
- real monetary summary renders.
- close/history flows remain separate.
- stale HU terminology removed.

### Maintainer Workflow

- Phase A apply.
- automated gates.
- STOP.
- Phase B maintainer review/edit.
- explicit resume.
- Phase C inspect/preserve/propagate.
- Phase D evidence.
- docs/gates/VERIFY.
- final maintainer acceptance.

## Required Tests Per Layer

### Frontend component/unit

If current test infrastructure exists, add/extend tests for:

- role dashboard widget visibility.
- multi-role union.
- cash mapping/format.
- Production search/list selection.
- unit rendering.
- icon action accessible names.
- Inventory default filters.
- Attendance Today CTA.
- closing local search.
- Purchase/Sales date defaults.
- Expense/Supplier detail.
- stale HU copy.
- responsive conditional rendering where component tests are practical.

### Frontend integration/router

- direct route authorization.
- role-aware Inicio.
- role-aware navigation.
- Attendance Today CTA route.
- Drawer/Sheet detail behavior.
- query invalidation after Attendance mutations.
- date parameters.

### Backend application/domain

When backend changes exist:

- Kitchen business-date query.
- discrete/divisible production validation.
- Shift/Cash summary projection.
- affected read contracts.

### Backend integration

Mandatory:

- Attendance CheckIn → CheckOut → history.
- Kitchen yesterday/today boundary.
- Production fractional discrete rejection if backend validation changes.

### Full regression

Use actual repository commands.

Expected conceptual gates:

Backend:

- restore;
- build;
- test.

Frontend:

- format:check;
- typecheck;
- lint;
- full tests;
- build.

Also:

- EF pending model changes.
- runtime OpenAPI sanity if backend changes.
- generated diff check.
- `git diff --check`.
- native VERIFY.

## Tradeoffs Accepted

- One large HU/OpenSpec is retained because the purpose is final cross-MVP consolidation.
- Implementation is divided into reviewable domain blocks rather than split into separate OpenSpec changes.
- High functional/visual fidelity is preferred over pixel-perfect reproduction.
- Existing current AppShell wins over historical shell variants.
- Mockup-only widgets are omitted rather than creating supporting backend.
- Role dashboards favor composition of existing queries instead of bespoke dashboard endpoints.
- Local closing text search intentionally does not pretend to search unloaded pages.
- Automatic absence generation is explicitly deferred.
- Manual visual review is a hard workflow pause rather than an automated acceptance.
- Maintainer changes can supersede the original mockup during Phase C.

## Implementation Constraints

- Do not mutate Git destructively.
- Do not reset/restore unrelated work.
- Do not stash automatically.
- Do not commit/push/archive without maintainer authorization.
- Audit local diff before editing.
- Preserve unrelated changes.
- No migration by default.
- No new dependency unless a genuine audited need exists.
- Reuse current icon library.
- Reuse current QueryClient/httpClient.
- No raw fetch parallel infrastructure.
- No duplicate auth matrices.
- No second AppShell.
- No role-specific shell forks.
- No manual generated API edits.
- No hardcoded dashboard KPIs.
- No mockup fake entities/statuses.
- No user-facing internal HU terminology.
- Maintain America/La_Paz semantics.
- Stop at maintainer review after FIRST APPLY.
- Preserve Phase-B manual UI edits.

## Open Design Questions

These are technical research questions, not product questions unless their answers trigger the specified blocker policy:

1. What are the exact local branch, HEAD and dirty-tree contents?
2. Has HU-032 or equivalent already been partially started?
3. Are all HU-008–HU-031 current implementations present in this working tree?
4. What shared design primitives currently exist?
5. Which icon library and IconButton primitive are currently used?
6. What exact business-time helper is authoritative?
7. What is the Kitchen endpoint/query contract today?
8. Does Kitchen use BusinessDate, CreatedAt or another timestamp?
9. What exact Unit representation distinguishes discrete from divisible quantity?
10. Does backend currently reject fractional discrete Production?
11. Why do Cash/Shift amounts fail to render?
12. Which Shift summary fields already exist?
13. What exact Attendance table/write/read model produces F12?
14. Does F12 fail at persistence, linkage, read filter, query invalidation or multiple layers?
15. Does F12 require any schema change?
16. Does Supplier list/detail already expose all persisted fields?
17. Does Expense history row expose all required detail fields?
18. What exact period semantics do Production/Purchases/Sales History APIs use?
19. Does Cash Closing History use server pagination, and what rows are locally available for F16?
20. Which Sprint 3 docs still carry deferred/stale status?
21. Which visual-reference files conflict with current AppShell?
22. Which intentional visual differences already exist and should be retained?
23. Does repository convention actually use Story Points in HU docs?
24. What exact evidence artifact convention should Phase D use?

No product decision is currently required.

Product decision becomes required only if explore proves:

- schema change mandatory;
- Unit semantics cannot distinguish discrete/divisible behavior;
- an F14 card requires an undefined business metric;
- a required detail depends on fields that do not exist but have been made mandatory;
- another frozen requirement cannot be satisfied without expanding domain scope.

## Workflow Markers

Generator verdict:

`HU_032_FINAL_MVP_CONSOLIDATION_OPENSPEC_READY`

Current APPLY readiness:

`READY_FOR_HU_032_FIRST_APPLY: NO`

After successful Phase A:

`HU_032_FIRST_APPLY_COMPLETE_PENDING_MAINTAINER_REVIEW`

After Phase C/D/final technical verification:

`HU_032_READY_FOR_FINAL_ACCEPTANCE`

Only after explicit maintainer acceptance may closure work proceed.
