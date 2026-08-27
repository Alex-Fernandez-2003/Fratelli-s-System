# Proposal

## Problem Statement

El change único `finalize-sprint-1-frontend-integration-navigation-and-documentation` es el cierre de integración del frontend del Sprint 1.

Ruta OpenSpec canónica:

`docs/openspec/changes/finalize-sprint-1-frontend-integration-navigation-and-documentation/`

Rama de trabajo prevista:

`develop`

No corresponde a una nueva historia de usuario ni a una nueva capability backend. Su objetivo es reconciliar el trabajo frontend ya integrado por distintos integrantes para obtener una aplicación autenticada coherente en:

- shell;
- navegación desktop;
- navegación mobile;
- routing;
- route guards;
- permisos de lectura frente a gestión;
- multi-role;
- responsive;
- HU-003 Productos;
- HU-016 Proveedores;
- HU-022 Asistencia;
- regresión frontend;
- documentación actual del Sprint 1.

### Baseline pública observada — orientativa, no autoridad de APPLY

La auditoría pública actual de `develop` confirma una arquitectura frontend con React, React Router, TanStack Query, Tailwind, Lucide, Vitest/Testing Library y scripts de format/typecheck/lint/test/build. citeturn978972view0

La aplicación ya posee un `AuthenticatedLayout` y una configuración de navegación autenticada central, pero el estado integrado contiene varios sistemas de shell/navegación coexistentes:

1. `AuthenticatedLayout` renderiza `AppShell` y filtra `authenticatedNavigation` por roles.
2. Existe otro `AppLayout` que implementa:
   - header mobile;
   - hamburger;
   - sidebar desktop;
   - drawer mobile;
   - un `bottomNavItems` mobile opcional.
3. `SidebarNav` mantiene su propia lista hardcodeada de `Inicio` y `Asistencia`.
4. Algunas páginas de Attendance utilizan `AppLayout` dentro del layout autenticado.
5. `SuppliersPage` mantiene actualmente su propio `AppShell`/navegación interna de alcance global.

Esto produce exactamente el riesgo de shell duplicado que este change debe eliminar. `AppLayout` ya contiene una implementación parcial de drawer mobile y sidebar desktop, pero también incluye el bottom navigation que la decisión humana de este change prohíbe. citeturn765548view1turn123137view0

`SidebarNav` también presenta dos defectos de integración importantes:

- define sus links por separado de la navegación central;
- decide el active state mediante igualdad exacta de pathname;
- muestra un correo derivado artificialmente como `<username>@fratelli.com`, dato que no debe fabricarse. citeturn123137view0

La configuración `authenticatedNavigation` actual ya contiene módulos integrados como:

- Inicio;
- Pedidos;
- Cocina;
- Productos;
- Inventario;
- Gastos;
- Usuarios;
- Proveedores;

pero no incluye Asistencia. Además, el contrato de paths está enumerado explícitamente, por lo que deberá evolucionar de forma controlada y type-safe. citeturn119155view1

### Route audit público observado

La vista pública actual de `AppRoutes` contiene, entre otras, rutas para:

- `/inicio`;
- `/mi-asistencia`;
- `/asistencia`;
- `/pedidos`;
- `/pedidos/nuevo`;
- `/pedidos/:id`;
- `/productos`;
- `/inventario`;
- `/inventario/movimientos`;
- `/gastos`;
- `/cocina`;
- `/usuarios`;
- `/proveedores`;
- `/403`. citeturn119155view0

La futura sesión APPLY MUST volver a enumerar las rutas directamente desde el `develop` local real y no asumir que esta lista pública sigue siendo exacta.

### Problemas concretos de integración detectados

#### Shell duplicado

El `AuthenticatedLayout` actual y `AppLayout` resuelven responsabilidades globales superpuestas.

El Sprint debe terminar con una sola jerarquía conceptual:

AuthenticatedLayout / AppShell

- Desktop Sidebar
- Mobile Topbar
- Mobile Drawer
- Routed Page Content

Las páginas/features no deben volver a montar shell global.

#### Navigation sources duplicadas

Actualmente existen al menos:

- `authenticatedNavigation`;
- `SidebarNav.links`;
- `bottomNavItems` definidos por consumidores.

Estas fuentes pueden divergir en paths, roles y active states. citeturn119155view1turn123137view0

#### Products — discrepancia de permisos

La UI pública actual de Products no centraliza adecuadamente la distinción read/manage y se debe auditar:

- Nuevo producto;
- Editar;
- Activar;
- Desactivar;
- menus contextuales;
- rutas mutantes, si existen.

La decisión congelada de este change establece:

Read:

- ADMINISTRADOR
- ENCARGADO
- MESERO
- COCINA
- CONTADORA

Manage:

- ADMINISTRADOR
- ENCARGADO

Sin embargo, el backend público visible actualmente usa `CatalogRead` sin CONTADORA.

Por tanto, la futura auditoría local MUST comprobar la policy backend real.

Si `develop` local sigue denegando a CONTADORA:

`BASELINE_CONTRACT_BLOCKER`

porque un frontend-only change no puede hacer que CONTADORA consulte Products de forma segura.

No modificar backend silenciosamente.

#### Suppliers — permisos correctos, integración/responsive incompletos

El backend y tipos frontend visibles ya reflejan:

Read:

- ADMINISTRADOR
- ENCARGADO
- COCINA
- CONTADORA

Write:

- ADMINISTRADOR
- ENCARGADO

La página actual ya diferencia `canWrite`, pero todavía debe auditarse para:

- eliminar shell global duplicado;
- garantizar ausencia total de acciones para read-only;
- implementar representación mobile basada en cards;
- conservar desktop table si funciona. citeturn119155view2

#### Attendance — contrato público compatible con la decisión congelada

El backend público actual ya ofrece conceptualmente:

- management endpoints por `employeeId` para ADMINISTRADOR/ENCARGADO;
- consulta administrativa del día;
- `/attendance/me` para historial propio autenticado.

Por tanto, la decisión humana final es técnicamente soportable en la snapshot pública:

ADMINISTRADOR / ENCARGADO:

- gestionan/asignan asistencia;
- consultan historial.

MESERO / COCINA / CONTADORA / EMPLEADO:

- solo consultan su propio historial.

La futura auditoría local MUST reconfirmar endpoints, payloads, `EmployeeId` y policies. Si dicho contrato hubiera desaparecido, se activa `BASELINE_CONTRACT_BLOCKER`.

### Visual audit status

Se requieren diez referencias principales más cualquier referencia adicional incluida en `Referencias.zip`.

Estado de inspección real de esta sesión:

- `Proveedores - Mobile.png`: 1/10, inspeccionada visualmente.
- nueve referencias dentro de `Referencias.zip`: no pudieron abrirse con las herramientas disponibles.

No se afirmará una auditoría pixel-level inexistente.

La futura fase explore MUST abrir 10/10 y cualquier imagen adicional antes de congelar detalles finales del shell.

### Visual audit real — `Proveedores - Mobile.png`

La imagen visible muestra aproximadamente:

- viewport mobile estrecho;
- fondo general casi negro;
- topbar charcoal con:
  - marca cuadrada naranja con `F`;
  - texto `Fratelli`;
  - campana;
  - avatar circular;
- título `Proveedores`;
- subtítulo;
- CTA naranja full-width `+ Nuevo proveedor`;
- search field full-width;
- selector segmentado:
  - Todos;
  - Activos;
  - Inactivos;
- botón de filtros separado;
- proveedores representados como cards verticales;
- cards con:
  - superficie elevada oscura;
  - border/radius;
  - tile/icono visual;
  - nombre en negrita;
  - identificador secundario;
  - menú kebab;
  - badge ACTIVO/INACTIVO;
  - bloque interno más oscuro para notas;
- spacing lateral consistente;
- bottom navigation fija con:
  - Inicio;
  - Menú;
  - Proveedores;
  - Reportes;
  - Ajustes.

Reconciliación obligatoria:

- card structure: KEEP;
- dark/orange visual hierarchy: KEEP;
- CTA/search/status controls: KEEP/ADAPT;
- bottom navigation: OMIT;
- topbar: ADAPT a hamburger + brand + user;
- notification bell: OMIT salvo capability real;
- avatar: ADAPT con datos reales disponibles;
- iconos de vaca/carne/botella/pan: OMIT/ADAPT a iconografía neutra porque Supplier no tiene tipo/categoría contractual;
- IDs del estilo `J-401234567`: OMIT si no existe field real;
- notes block: KEEP usando `notes` real;
- kebab: KEEP solo ADMINISTRADOR/ENCARGADO;
- read-only COCINA/CONTADORA: no kebab vacío, no CTA mutante;
- bottom items `Menú`, `Reportes`, `Ajustes`: no introducir módulos inexistentes.

## Goals

- Auditar exhaustivamente el `develop` local real antes de cambiar frontend.
- Abrir e inspeccionar todas las referencias visuales.
- Producir una matriz real de rutas y permisos.
- Producir una única matriz de capabilities/navegación.
- Terminar con un solo shell global autenticado.
- Terminar con una sola navegación global desktop/mobile derivada de la misma configuración.
- Implementar sidebar desktop role-aware.
- Implementar topbar + hamburger + drawer mobile role-aware.
- Eliminar el bottom-nav global.
- Eliminar shell/sidebar global duplicado dentro de features.
- Resolver active states para child routes.
- Mantener union-of-roles.
- Alinear route guards con capabilities.
- Corregir HU-003 read/manage UI.
- Corregir HU-016 read/manage UI.
- Implementar HU-016 mobile cards.
- Reconciliar HU-022 con la decisión final.
- Preservar Users, Orders, Kitchen, Inventory, Expenses y Auth.
- Corregir deuda frontend de format/typecheck/lint/test/build.
- Ejecutar full frontend regression.
- Reconciliar documentación solo después de estabilizar frontend.
- Mantener narrativa de documentación current-state en español.
- Preservar OpenSpec histórico.
- Crear/actualizar documentación Sprint 1.
- Crear plantilla separada de retrospectiva Sprint 1 sin contenido inventado.
- Dejar manual visual validation pendiente del usuario cuando no sea ejecutada realmente.

## Non-Goals

- No nuevas APIs.
- No backend changes.
- No migrations.
- No SignalR nuevo.
- No cambios de JWT/auth foundation.
- No dashboard funcional completo.
- No KPIs ficticios.
- No ventas futuras.
- No compras futuras.
- No producción futura.
- No caja/turnos futuros.
- No reportes futuros.
- No notifications si no existe capability real.
- No Supplier backend redesign.
- No Product backend redesign.
- No Attendance backend workaround.
- No rediseño total de todas las páginas.
- No pixel-perfect de todos los screenshots.
- No bottom navigation global.
- No global state library nueva.
- No traducción masiva de OpenSpec histórico.
- No reescritura retrospectiva de ADRs.
- No contenido inventado de retrospectiva.
- No screenshots/evidencia fabricados.
- No Git mutations.

## Affected Areas

### Frontend shell/routing

- AuthenticatedLayout o equivalente.
- AppShell/AppLayout.
- SidebarNav/drawer.
- central navigation/capability definition.
- route guards.
- active-route matching.
- responsive shell.

### HU-003

- Products page.
- Product mutating controls.
- Product route guards.
- permission helpers/tests.

### HU-016

- Suppliers page.
- removal of feature-owned global shell.
- mobile Supplier cards.
- responsive tests.
- read/write action gating.

### HU-022

- Attendance management page.
- own-history page.
- nested AppLayout removal.
- navigation target.
- role-aware controls.
- tests.

### Other modules

Only shell/routing integration necessary for:

- Users;
- Orders;
- Kitchen;
- Inventory;
- Expenses;
- Inicio.

### Quality

- known formatting debt.
- frontend full test suite.
- typecheck/lint/build.

### Documentation

Potential current-state areas after audit:

- root README;
- frontend README;
- backend README only if objectively stale;
- current requirements/business rules;
- Product Backlog;
- HU-003;
- HU-016;
- HU-022;
- Sprint 1 status/planning;
- testing/validation docs;
- architecture/navigation current-state docs;
- Sprint 1 retrospective template.

## Assumptions

### Assumption 1 — Attendance contract remains integrated

Public `develop` currently supports the frozen management/self-history split.

Future local audit must reconfirm.

### Assumption 2 — Product CatalogRead may have changed before APPLY

The public backend currently conflicts with the frozen CONTADORA-read decision.

No assumption is made that it will still conflict locally.

### Assumption 3 — visual ZIP becomes accessible during explore/APPLY

Nine required images are not inspectable in this session.

The implementation must not freeze final shell dimensions without inspecting them.

## Risks

### Risk 1: Two shells remain after integration

- Probability: High.
- Impact: High.
- Mitigation: enumerate every `AppShell`, `AppLayout`, `SidebarNav`, `<aside>` and global `<nav>` consumer; assert one global shell in tests.

### Risk 2: Desktop and mobile consume different navigation sources

- Probability: High.
- Impact: High.
- Mitigation: same central capability/navigation registry drives both.

### Risk 3: Router and menu role matrices diverge

- Probability: High.
- Impact: Critical.
- Mitigation: reuse role constants/capabilities between route guards and navigation derivation.

### Risk 4: Multi-role user loses capabilities due first-role logic

- Probability: Medium.
- Impact: High.
- Mitigation: authorization/navigation always uses `hasAnyRole`; never first role/primary role.

### Risk 5: Product CONTADORA requirement contradicts backend

- Probability: High in public snapshot.
- Impact: Critical.
- Mitigation: local backend policy audit; if still incompatible, `BASELINE_CONTRACT_BLOCKER`, no fake frontend access.

### Risk 6: Attendance contract differs locally

- Probability: Low/Medium.
- Impact: Critical.
- Mitigation: OpenAPI/backend audit before touching Attendance UX.

### Risk 7: Feature pages preserve nested shell

- Probability: High.
- Impact: High.
- Mitigation: classify every shell use and migrate global wrappers out of feature pages.

### Risk 8: legitimate content navigation removed by broad cleanup

- Probability: Medium.
- Impact: Medium.
- Mitigation: classify navigation as GLOBAL_CORRECT, FEATURE_DUPLICATE or CONTENT_NAVIGATION_VALID before removing.

### Risk 9: active state fails on child routes

- Probability: High in current exact-match `SidebarNav`.
- Impact: Medium.
- Mitigation: capability-specific exact/prefix/match strategy and tests for `/pedidos/:id` and `/inventario/movimientos`.

### Risk 10: mobile keeps both drawer and bottom nav

- Probability: High given current `AppLayout`.
- Impact: High.
- Mitigation: remove bottom-nav capability from final global shell.

### Risk 11: mobile drawer contains fake modules

- Probability: Medium.
- Impact: High.
- Mitigation: generate items exclusively from implemented capability registry.

### Risk 12: fake user metadata leaks into shell

- Probability: High in current `SidebarNav` fake email.
- Impact: Medium.
- Mitigation: only render real `AuthUser` fields; omit email if absent.

### Risk 13: Products fixes only Nuevo producto

- Probability: High.
- Impact: High.
- Mitigation: exhaustive action/route audit including edit/activate/deactivate/kebab/direct routes.

### Risk 14: Suppliers read-only roles see empty kebab

- Probability: Medium.
- Impact: Medium.
- Mitigation: conditionally omit the action trigger itself when no allowed actions exist.

### Risk 15: Suppliers mobile copies fictitious DTO data

- Probability: High if screenshot copied literally.
- Impact: Medium.
- Mitigation: only real Supplier fields; neutral iconography when type/category does not exist.

### Risk 16: dashboard screenshots trigger out-of-scope dashboard work

- Probability: High.
- Impact: High.
- Mitigation: dashboards govern shell/context only; widgets/KPIs DEFER or OMIT.

### Risk 17: documentation reconciled before code stabilizes

- Probability: Medium.
- Impact: High.
- Mitigation: mandatory two-phase APPLY; documentation only after frontend gates pass.

### Risk 18: historical planning rewritten as if final behavior was always known

- Probability: Medium.
- Impact: High.
- Mitigation: classify docs as current-state vs historical; preserve chronology.

### Risk 19: retrospective fabricated

- Probability: Medium.
- Impact: High.
- Mitigation: template-only placeholders; meeting remains PENDING.

### Risk 20: mass documentation churn

- Probability: Medium.
- Impact: Medium.
- Mitigation: audit matrix and modify only NEEDS_UPDATE docs.

### Risk 21: visual decisions made from 1/10 references

- Probability: Certain if implementation starts immediately.
- Impact: High.
- Mitigation: 10/10 visual inspection gate before shell styling.

## Rollback Strategy

No database or backend rollback is required.

Frontend rollback must be capability-safe:

- central navigation changes can be reverted without changing backend contracts;
- shell consolidation can be reverted at layout level without mutating feature data;
- Supplier mobile cards can fall back to the existing desktop representation while preserving Supplier API behavior;
- permission UI corrections can be reverted independently, although backend authorization remains authoritative.

Documentation rollback must preserve historical files:

- do not delete Sprint 0;
- do not overwrite old OpenSpec;
- do not rewrite ADR history;
- a newly created retrospective template can be removed without affecting implementation if necessary.

No destructive Git operations are part of the plan.

## Success Criteria

- 10/10 required screenshots and all additional ZIP references are inspected.
- Actual local route inventory is complete.
- Actual local capability/permission inventory is complete.
- Attendance contract is classified `SUPPORTED_BY_CURRENT_BACKEND` or a blocker is reported.
- Product CONTADORA contract is reconciled or blocker is reported.
- Exactly one global authenticated shell remains.
- Desktop sidebar is role-aware.
- Mobile uses topbar + hamburger + drawer only.
- No bottom navigation remains as a second global system.
- No feature-owned duplicate global sidebar remains.
- Active parent state works on child routes.
- Multi-role union passes.
- Products read/manage distinction passes.
- Suppliers read/manage distinction passes.
- Suppliers mobile uses cards at 403/360.
- Attendance behavior matches frozen decision when backend supports it.
- Users/Orders/Kitchen/Inventory/Expenses remain functionally intact.
- Frontend format passes globally.
- Frontend typecheck passes globally.
- Frontend lint passes globally.
- Frontend tests pass with failed=0.
- Frontend production build passes.
- Documentation is reconciled only after frontend stability.
- Human-facing current-state docs are Spanish.
- Historical OpenSpec is not mass-translated.
- Sprint 0 is preserved.
- Sprint 1 current document exists and is accurate.
- Sprint 1 retrospective exists separately as a blank/template document.
- Retrospective meeting content is not fabricated.
- Backend remains unchanged.
