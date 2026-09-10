# HU-032 Visual Reference Audit

## Scope and method

`Pantallas.zip` was inspected before implementation. The archive contains 74 PNG reference images (plus 20 directory entries). Every PNG was extracted outside the repository and reviewed in labeled contact sheets. The table below is the required one-row-per-reference classification for the first apply.

Reference numbers follow the PNG order returned by the ZIP archive, not an inferred product screen number. `KEEP` means the reference is a valid authority for an existing surface; `ADAPT` means the visual intent is retained but must be reconciled with real contracts and shared components; `REPLACE` means the current implementation cannot safely preserve the mockup interaction and needs a real-data UI; `OMIT` means it is a duplicate or unsupported role variant; `MANUAL-LATER` means no first-apply code claim is made until maintainer visual authority is received. A classification does not mean final visual approval.

## Classification matrix

| # | Reference | Route / feature | Decision | First-apply action | Status |
|---:|---|---|---|---|---|
| 01 | `Pantalla 10/Gastos - Estados y Feedback.png` | Expenses states | KEEP + ADAPT | Preserve loading/empty/error/success language; use shared Feedback and real query states. | AUDITED |
| 02 | `Pantalla 10/Gastos - Historial (Desktop).png` | `/gastos` history | ADAPT | Keep dense desktop history layout; bind real expense rows and accessible detail action. | AUDITED |
| 03 | `Pantalla 10/Gastos - Mobile View.png` | `/gastos` mobile | ADAPT | Convert table to readable cards/stacking without horizontal clipping. | AUDITED |
| 04 | `Pantalla 10/Gastos - Registrar (Desktop).png` | `/gastos/registrar` | ADAPT | Keep form hierarchy; preserve validation and real create mutation. | AUDITED |
| 05 | `Pantalla 11/Mi Asistencia - Desktop (Estado A).png` | `/mi-asistencia` | ADAPT | Preserve today state and action hierarchy; keep real Check In/Out. | AUDITED |
| 06 | `Pantalla 11/Mi Asistencia - Estados Adicionales.png` | `/mi-asistencia` states | KEEP + ADAPT | Preserve success/blocked/empty feedback using factual API responses. | AUDITED |
| 07 | `Pantalla 11/Mi Asistencia - Mobile (Estado B).png` | `/mi-asistencia` mobile | ADAPT | Keep compact action card and readable history on narrow screens. | AUDITED |
| 08 | `Pantalla 12/Composition Screen - Desktop.png` | Composition / product detail | ADAPT | Preserve composition hierarchy but expose only supported product/inventory fields. | AUDITED |
| 09 | `Pantalla 12/Composition Screen - Mobile.png` | Composition mobile | ADAPT | Stack composition fields and preserve keyboard/focus behavior. | AUDITED |
| 10 | `Pantalla 12/Estados de Validación y Éxito.png` | Composition feedback | KEEP + ADAPT | Reuse shared validation and success feedback; no mock-only state. | AUDITED |
| 11 | `Pantalla 13/Confirmación y Éxito - Producción.png` | Production success | ADAPT | Keep success confirmation while binding actual production response and inventory effect. | AUDITED |
| 12 | `Pantalla 13/Registrar Producción - Desktop.png` | `/produccion/registrar` | REPLACE + ADAPT | Replace preparation-area placeholder semantics with product/unit metadata and server validation. | AUDITED |
| 13 | `Pantalla 13/Registrar Producción - Mobile.png` | Production register mobile | REPLACE + ADAPT | Match responsive hierarchy; retain numeric input and real product/unit constraints. | AUDITED |
| 14 | `Pantalla 14/Cobro - Desktop.png` | `/ventas/cobrar` | ADAPT | Preserve checkout hierarchy and bind real sale mutation. | AUDITED |
| 15 | `Pantalla 14/Cobro - Mobile.png` | Checkout mobile | ADAPT | Keep sticky/stacked total and ensure no clipped submit action. | AUDITED |
| 16 | `Pantalla 14/Modales de Cobro.png` | Checkout confirmation | KEEP + ADAPT | Reuse accessible Modal/focus return and real confirmation/error responses. | AUDITED |
| 17 | `Pantalla 15/Compras - Desktop.png` | `/compras` history | ADAPT | Keep purchase history layout; correct default date range and real status actions. | AUDITED |
| 18 | `Pantalla 15/Compras - Mobile.png` | Purchases mobile | ADAPT | Use responsive purchase cards with visible status and actions. | AUDITED |
| 19 | `Pantalla 15/Modal Cancelar Compra.png` | Purchase cancel | ADAPT | Preserve destructive confirmation copy and keyboard-safe Modal behavior. | AUDITED |
| 20 | `Pantalla 16/Confirmación y Éxito - Nueva Compra.png` | New purchase success | ADAPT | Bind success to create response; show no fabricated identifier. | AUDITED |
| 21 | `Pantalla 16/Modal Confirmar Recepción.png` | Receive purchase confirmation | ADAPT | Preserve confirmation modal and real receive mutation/error state. | AUDITED |
| 22 | `Pantalla 16/Nueva Compra - Desktop.png` | `/compras/nueva` | ADAPT | Keep line-item form; preserve contract-driven supplier/product fields. | AUDITED |
| 23 | `Pantalla 16/Nueva Compra - Mobile.png` | New purchase mobile | ADAPT | Stack line items and keep add/remove controls accessible. | AUDITED |
| 24 | `Pantalla 16/Recibir compra - Pantalla Principal.png` | Purchase receive page | ADAPT | Keep receive workflow and bind actual pending purchase state. | AUDITED |
| 25 | `Pantalla 17/Compra Recibida - Estado Final.png` | Purchase received | KEEP + ADAPT | Preserve terminal success state and return navigation. | AUDITED |
| 26 | `Pantalla 18/Caja - Desktop-1.png` | `/turnos` admin/owner | ADAPT | Replace placeholder cash preview with real preview DTO and role-aware actions. | AUDITED |
| 27 | `Pantalla 18/Caja - Desktop.png` | `/turnos` manager | ADAPT | Preserve operational cash widget while removing stale HU copy. | AUDITED |
| 28 | `Pantalla 18/Caja - Mesero (Desktop).png` | `/turnos` waiter | ADAPT | Keep role-safe personal shift view; hide unsupported close controls. | AUDITED |
| 29 | `Pantalla 18/Caja - Mobile.png` | Cash mobile | ADAPT | Stack shift cards and retain visible current-state feedback. | AUDITED |
| 30 | `Pantalla 19/Detalle de producción - Drawer.png` | Production detail | ADAPT | Use real detail drawer/Modal semantics; replace textual eye action with accessible icon control. | AUDITED |
| 31 | `Pantalla 19/Estados de Historial - Vacío y Carga.png` | Production history states | KEEP + ADAPT | Preserve loading/empty feedback and factual date range. | AUDITED |
| 32 | `Pantalla 19/Historial de producción - Desktop.png` | `/produccion/historial` | ADAPT | Keep history view but align endpoint bounds and current business-day behavior. | AUDITED |
| 33 | `Pantalla 19/Historial de producción - Mobile.png` | Production history mobile | ADAPT | Convert rows to readable cards without hiding quantity/unit. | AUDITED |
| 34 | `Pantalla 20/Clientes - Desktop.png` | `/clientes` | ADAPT | Preserve customer list and real create/edit entry points. | AUDITED |
| 35 | `Pantalla 20/Clientes - Mobile.png` | Customers mobile | ADAPT | Stack customer records and maintain accessible actions. | AUDITED |
| 36 | `Pantalla 20/Modal Cliente.png` | Customer modal | ADAPT | Reuse Modal/focus rules and real customer validation. | AUDITED |
| 37 | `Pantalla 21/Ventas - Detalle Bottom Sheet (Mobile).png` | Sale detail mobile | ADAPT | Preserve bottom-sheet visual intent through existing accessible Modal pattern. | AUDITED |
| 38 | `Pantalla 21/Ventas - Detalle Drawer (Desktop).png` | Sale detail desktop | ADAPT | Keep detail drawer layout and real sale fields. | AUDITED |
| 39 | `Pantalla 21/Ventas - Historial (Desktop).png` | `/ventas/historial` | ADAPT | Include current business day and keep real totals/status. | AUDITED |
| 40 | `Pantalla 21/Ventas - Historial (Mobile).png` | Sales history mobile | ADAPT | Use cards/stacking; ensure current-day query is not lost at midnight. | AUDITED |
| 41 | `Pantalla 22/Asistencia de Trabajadores - Desktop.png` | `/asistencia` | ADAPT | Preserve administrative attendance table and role guard. | AUDITED |
| 42 | `Pantalla 22/Asistencia de Trabajadores - Móvil.png` | Administrative attendance mobile | ADAPT | Stack attendance records and preserve filters/actions. | AUDITED |
| 43 | `Pantalla 22/Estados de Asistencia (Loading, Empty, Error).png` | Attendance states | KEEP + ADAPT | Preserve shared feedback states and avoid mock absence claims. | AUDITED |
| 44 | `Pantalla 23/Cierre de Caja - Desktop.png` | `/turnos/cerrar` | ADAPT | Keep close form; bind real cash preview and validation. | AUDITED |
| 45 | `Pantalla 23/Cierre de Caja - Móvil.png` | Cash close mobile | ADAPT | Stack inputs and maintain visible confirmation action. | AUDITED |
| 46 | `Pantalla 23/Estados de Cierre (Confirmación y Éxito).png` | Cash close states | KEEP + ADAPT | Preserve confirmation/success feedback from real mutation. | AUDITED |
| 47 | `Pantalla 24/Cierres de Caja - Desktop.png` | `/cierres` | ADAPT | Implement/verify closing history with real API values. | AUDITED |
| 48 | `Pantalla 24/Cierres de Caja - Móvil.png` | Closing history mobile | ADAPT | Use responsive cards; keep totals and dates readable. | AUDITED |
| 49 | `Pantalla 24/Detalle de Cierre - Snapshot.png` | Closing detail | ADAPT | Show immutable snapshot values in accessible detail surface. | AUDITED |
| 50 | `Pantalla 25/Reporte de Ventas - Admin Desktop.png` | Sales report admin | ADAPT | Preserve report layout and real report query. | AUDITED |
| 51 | `Pantalla 25/Reporte de Ventas - Admin Mobile.png` | Sales report mobile | ADAPT | Stack report filters/results without horizontal overflow. | AUDITED |
| 52 | `Pantalla 25/Reporte de Ventas - Estados UI.png` | Sales report states | KEEP + ADAPT | Preserve report loading/empty/error states. | AUDITED |
| 53 | `Pantalla 25/Reporte de Ventas - Mesero Desktop.png` | Sales report waiter | OMIT | Duplicate role variant is not a separate first-apply surface; use role-safe shared report behavior if supported. | AUDITED |
| 54 | `Pantalla 26/Reporte de Inventario - Admin Desktop.png` | Inventory report admin | ADAPT | Preserve totals/filters and real inventory data. | AUDITED |
| 55 | `Pantalla 26/Reporte de Inventario - Cocina Desktop.png` | Inventory report kitchen | ADAPT | Scope to kitchen-visible products without inventing a CAJERO role. | AUDITED |
| 56 | `Pantalla 26/Reporte de Inventario - Mobile.png` | Inventory report mobile | ADAPT | Stack report values and retain unit labels. | AUDITED |
| 57 | `Pantalla 27/Reporte de Asistencia - Admin Desktop.png` | Attendance report admin | ADAPT | Keep administrative report and factual persisted attendance. | AUDITED |
| 58 | `Pantalla 27/Reporte de Asistencia - Empleado Desktop.png` | Attendance report employee | ADAPT | Reuse role-scoped report contract for the canonical employee role. | AUDITED |
| 59 | `Pantalla 27/Reporte de Asistencia - Mobile.png` | Attendance report mobile | ADAPT | Stack report records and keep date context visible. | AUDITED |
| 60 | `Referencias/Container.png` | Shared shell container | KEEP | Preserve app-shell spacing, contrast, and responsive container behavior. | AUDITED |
| 61 | `Referencias/Dashboard Administrador - Desktop.png` | Admin dashboard | ADAPT + MANUAL-LATER | Add only real operational widgets; visual authority remains maintainer-gated. | AUDITED |
| 62 | `Referencias/Dashboard Administrador - Mobile.png` | Admin dashboard mobile | ADAPT + MANUAL-LATER | Add responsive role dashboard with real data; defer visual sign-off. | AUDITED |
| 63 | `Referencias/Dashboard Cocina - Desktop.png` | Kitchen dashboard | ADAPT + MANUAL-LATER | Add current-day queue/production widgets from real endpoints. | AUDITED |
| 64 | `Referencias/Dashboard Contadora - Desktop.png` | Accountant dashboard | ADAPT + MANUAL-LATER | Add supported financial/expense shortcuts only; no invented metrics. | AUDITED |
| 65 | `Referencias/Dashboard Empleado - Desktop.png` | Employee dashboard | ADAPT + MANUAL-LATER | Add attendance/profile shortcuts scoped to canonical role. | AUDITED |
| 66 | `Referencias/Dashboard Encargado - Desktop.png` | Manager dashboard | ADAPT + MANUAL-LATER | Add operational shortcuts and current-day status from real data. | AUDITED |
| 67 | `Referencias/Dashboard Mesero - Desktop.png` | Waiter dashboard | ADAPT + MANUAL-LATER | Add order/shift shortcuts while respecting role permissions. | AUDITED |
| 68 | `Referencias/Estados_ Vacío y Skeleton - Fratelli.png` | Shared dashboard states | KEEP + ADAPT | Reuse skeleton/empty/error primitives; never claim unavailable data. | AUDITED |
| 69 | `Pantalla 5/Estados de Inventario.png` | Inventory states | KEEP + ADAPT | Preserve states with real inventory loading/error/empty behavior. | AUDITED |
| 70 | `Pantalla 5/Inventario - Existencias Desktop.png` | `/inventario` balances | ADAPT | Add type/unit-aware balances and date/business-day controls. | AUDITED |
| 71 | `Pantalla 5/Inventario - Existencias Móvil.png` | Inventory balances mobile | ADAPT | Use cards/stacking and keep unit values legible. | AUDITED |
| 72 | `Pantalla 5/Inventario - Movimientos Desktop.png` | Inventory movements | ADAPT | Provide bounded movement query with today defaults and real date conversion. | AUDITED |
| 73 | `Pantalla 5/Modales de Inventario.png` | Inventory detail/modal | ADAPT | Reuse accessible Modal and icon actions with real movement/product data. | AUDITED |
| 74 | `Pantalla 5/Productos - Catálogo Unificado Desktop.png` | Unified product catalog | ADAPT | Preserve product catalog hierarchy; reconcile all product types and units. | AUDITED |

## Non-authority notes

- The references are visual inputs, not API contracts, permission grants, or proof that a role/entity exists.
- `CAJERO` does not exist in the canonical role model; no CAJERO implementation is authorized by this audit.
- `MAINTAINER_EDITED_UI` is not active during this first apply. The classifications above support implementation only; they do not satisfy the maintainer visual checkpoint.
- A later evidence pass must compare the running UI against this matrix and record KEEP/ADAPT/REPLACE/OMIT/MANUAL-LATER outcomes with actual screenshots and test/build evidence.
