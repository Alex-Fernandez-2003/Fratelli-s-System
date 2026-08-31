# Proposal

## BASELINE_AUDIT

### Alcance real de la auditoría

La baseline exigida por este change es el `develop` LOCAL REAL ACTUAL, incluyendo cambios no commiteados.

Esta sesión no tiene acceso al checkout Git local del usuario ni a un shell conectado a ese working tree. Por tanto, no es posible afirmar de forma veraz el `HEAD` local ni el contenido de `git status --short`. Se auditó como evidencia secundaria el `develop` público actual de GitHub, que al momento de la consulta muestra como commit superior visible `2bb2f47` (`Merge pull request #58 ... HU-004`, 2026-08-30). Ese hash NO debe tratarse como el HEAD local canónico. citeturn916838view0

| Campo                          | Resultado de esta auditoría                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| Repository                     | `Alex-Fernandez-2003/Fratelli-s-System`                                                   |
| Baseline canónica              | `develop` LOCAL REAL ACTUAL                                                               |
| Branch pública inspeccionada   | `develop`                                                                                 |
| Remote commit superior visible | `2bb2f47`                                                                                 |
| Branch local                   | `LOCAL_REVALIDATION_REQUIRED`                                                             |
| HEAD local                     | `LOCAL_REVALIDATION_REQUIRED`                                                             |
| Working tree local             | `LOCAL_REVALIDATION_REQUIRED`                                                             |
| Sprint 2                       | Funcionalmente implementado según contexto congelado; no tratar como greenfield           |
| Backend authorization          | Policies ASP.NET Core + `RequireAuthorization`                                            |
| Frontend authorization         | `RequireAuth` + `RequireAnyRole` + roles derivados de `useAuth()`                         |
| Multi-role frontend            | `hasAnyRole` aplica unión de roles                                                        |
| Navigation                     | Una definición central `authenticatedNavigation` alimenta desktop sidebar y mobile drawer |
| Inventory                      | Existencias + Movimientos + Notificaciones ya existen, con navegación inconsistente       |
| HU-007 frontend                | Existe implementación pública de Production                                               |
| HU-007 documentación           | Pública y desactualizada respecto al frontend actual                                      |
| Tests ejecutados en esta etapa | Ninguno; no se declara PASS                                                               |
| Git mutations                  | Ninguna                                                                                   |

La API pública actual define `CatalogRead`, `CatalogWrite`, `InventoryRead`, `InventoryManage`, `InventoryHistory`, `OrdersAccess`, `KitchenManage`, `SupplierRead`, `OperationsPurchase` y `OperationsShiftManage`. `InventoryRead` ya permite ADMINISTRADOR, ENCARGADO, MESERO, COCINA y CONTADORA, mientras `InventoryHistory` continúa limitado a ADMINISTRADOR/ENCARGADO. citeturn963166view0

El frontend público usa `RequireAnyRole`, que delega en `hasAnyRole`, por lo que el mecanismo de route guards ya es compatible con la semántica de unión multi-role. citeturn665215view0

### Gate obligatorio antes de APPLY

Antes de ejecutar cualquier task de corrección, Pi MUST registrar desde el checkout local:

- `git branch --show-current`;
- `git rev-parse HEAD`;
- `git status --short`;
- `git log -1 --oneline`;
- diff local relevante;
- rutas reales;
- policies reales;
- navigation/capabilities reales;
- estado real de las ocho HU de Sprint 2.

Todo hallazgo de esta auditoría pública debe convertirse localmente en una de:

- `CONFIRMED_IN_LOCAL_BASELINE`;
- `ALREADY_RESOLVED_IN_LOCAL_BASELINE`;
- `REMOTE_ONLY_STALE_FINDING`;
- `PRODUCT_DECISION_REQUIRED`, únicamente ante contradicción funcional genuina.

No se debe volver a corregir código que el working tree local ya haya corregido.

---

## PERMISSIONS_AUDIT

Abreviaturas usadas en la tabla:

- ADMIN = ADMINISTRADOR
- ENC = ENCARGADO
- MES = MESERO
- COC = COCINA
- CON = CONTADORA
- EMP = EMPLEADO

| Capability            | Roles esperados                        | Backend público actual                                                       | Frontend público actual                                                                          | Verdict público                                       |
| --------------------- | -------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Gestionar Products    | ADMIN, ENC                             | `CatalogWrite`: ADMIN, ENC                                                   | `PRODUCT_MANAGE_ROLES`: ADMIN, ENC; create/edit/deactivate condicionados por `canManageProducts` | `OK_REMOTE`; bug reportado de EMP no reproducido      |
| Consultar Products    | Preservar matriz ProductRead existente | `CatalogRead`: ADMIN, ENC, MES, COC                                          | `PRODUCT_READ_ROLES`: ADMIN, ENC, MES, COC                                                       | `OK_REMOTE`                                           |
| Gestionar composición | ADMIN, ENC                             | PUT composition → `CatalogWrite`                                             | Acción de composición visible solo cuando `canManage`                                            | Authorization `OK`; reachability requiere revisión    |
| Consultar composición | ADMIN, ENC, MES, COC                   | GET composition → `CatalogRead`                                              | No se observa route pública registrada para el enlace `/productos/:id/composicion`               | `ROUTING_DRIFT_REMOTE`                                |
| Configurar MinStock   | ADMIN, ENC                             | PUT minimum-stock → `InventoryManage`                                        | Product mutations protegidas por manage role                                                     | `OK_REMOTE`                                           |
| Consultar Inventario  | ADMIN, ENC, MES, COC, CON              | balances/summary → `InventoryRead`; movements → `InventoryHistory` ADMIN/ENC | `/inventario` permite 5 roles; `/inventario/movimientos` solo ADMIN/ENC                          | `TOO_RESTRICTIVE` para Movimientos                    |
| Producción            | ADMIN, ENC, COC                        | requirements/production → `KitchenManage`                                    | route permite ADMIN, ENC, COC                                                                    | `OK_PERMISSION`; integración de layout requiere sweep |
| Venta                 | ADMIN, ENC, MES                        | POST Sale → `OrdersAccess`                                                   | checkout route permite ADMIN, ENC, MES                                                           | `OK_REMOTE`                                           |
| Purchase mutation     | ADMIN, ENC, COC\*                      | `OperationsPurchase`: ADMIN, ENC, COC + service-level scope                  | feature define `PURCHASE_WRITE_ROLES` correctamente                                              | `OK_REMOTE`                                           |
| Purchase read         | ADMIN, ENC, COC, CON                   | grupo Purchases → `SupplierRead`: ADMIN, ENC, COC, CON                       | feature define READ correctamente, pero router/nav usan WRITE roles                              | `FRONTEND_TOO_RESTRICTIVE`                            |
| Shift manage          | ADMIN, ENC                             | `OperationsShiftManage`                                                      | `SHIFT_MANAGE_ROLES`: ADMIN, ENC                                                                 | `OK_REMOTE`                                           |
| Own shift             | ADMIN, ENC, MES                        | `/shifts/me/current` → `OrdersAccess`                                        | `/mi-turno` solo está bajo `RequireAuth`; navigation item no limita read roles                   | `FRONTEND_TOO_PERMISSIVE`                             |

La definición pública de navigation confirma que Products management está correctamente restringido a ADMINISTRADOR/ENCARGADO, Inventory se muestra a los cinco roles de lectura, Compras usa incorrectamente `PURCHASE_WRITE_ROLES`, y Turnos carece de `readRoles`, enviando a cualquier rol no manager a `/mi-turno`. citeturn258014view0

La implementación pública de Products también condiciona `Nuevo producto`, edición, composición y desactivación a `canManageProducts`, por lo que el caso conocido “EMPLEADO puede agregar Product” no está reproducido en esta snapshot remota. Debe mantenerse como regression obligatoria y revalidarse localmente, no “corregirse” a ciegas. citeturn791043view1

### Qualifier COCINA para compras

La matriz congelada permite COCINA en create/cancel/receive con `*`.

El backend público actualmente expresa un scope adicional dentro del workflow de Purchase; el endpoint mantiene `OperationsPurchase`, y la lógica de servicio debe revalidarse localmente antes de modificarla. El frontend ya separa explícitamente `PURCHASE_READ_ROLES` de `PURCHASE_WRITE_ROLES`. citeturn791043view2 citeturn665215view5

Este change MUST preserve el qualifier que resulte confirmado por código + documentación local. No debe inventar un nuevo significado para `*`.

---

## ENDPOINT_AUTHORIZATION_AUDIT

| Módulo      | Method / route pública actual             | Policy actual                  | Esperado              | Verdict                                          |
| ----------- | ----------------------------------------- | ------------------------------ | --------------------- | ------------------------------------------------ |
| Products    | GET `/api/v1/products`                    | `CatalogRead`                  | ProductRead existente | OK                                               |
| Products    | GET `/api/v1/products/{id}`               | `CatalogRead`                  | ProductRead existente | OK                                               |
| Products    | POST `/api/v1/products`                   | `CatalogWrite`                 | ADMIN/ENC             | OK                                               |
| Products    | PUT `/api/v1/products/{id}`               | `CatalogWrite`                 | ADMIN/ENC             | OK                                               |
| Products    | DELETE `/api/v1/products/{id}`            | `CatalogWrite`                 | ADMIN/ENC             | OK                                               |
| Composition | GET `/api/v1/products/{id}/composition`   | `CatalogRead`                  | ADMIN/ENC/MES/COC     | OK                                               |
| Composition | PUT `/api/v1/products/{id}/composition`   | `CatalogWrite`                 | ADMIN/ENC             | OK                                               |
| MinStock    | PUT `/api/v1/products/{id}/minimum-stock` | `InventoryManage`              | ADMIN/ENC             | OK                                               |
| Inventory   | GET `/api/v1/inventory/balances`          | `InventoryRead`                | ADMIN/ENC/MES/COC/CON | OK                                               |
| Inventory   | GET `/api/v1/inventory/summary`           | `InventoryRead`                | ADMIN/ENC/MES/COC/CON | OK                                               |
| Inventory   | GET `/api/v1/inventory/movements`         | `InventoryHistory` = ADMIN/ENC | ADMIN/ENC/MES/COC/CON | `BACKEND_TOO_RESTRICTIVE` según matriz congelada |
| Inventory   | POST `/api/v1/inventory/movements`        | `InventoryManage`              | ADMIN/ENC             | OK; no ampliar                                   |
| Production  | GET production requirements               | `KitchenManage`                | ADMIN/ENC/COC         | OK                                               |
| Production  | POST `/api/v1/productions`                | `KitchenManage`                | ADMIN/ENC/COC         | OK                                               |
| Sale        | POST `/api/v1/sales`                      | `OrdersAccess`                 | ADMIN/ENC/MES         | OK                                               |
| Purchases   | GET list/detail                           | `SupplierRead`                 | ADMIN/ENC/COC/CON     | OK                                               |
| Purchases   | POST create                               | `OperationsPurchase`           | ADMIN/ENC/COC\*       | OK subject to current qualifier                  |
| Purchases   | POST cancel                               | `OperationsPurchase`           | ADMIN/ENC/COC\*       | OK subject to current qualifier                  |
| Purchases   | POST receive                              | `OperationsPurchase`           | ADMIN/ENC/COC\*       | OK subject to current qualifier                  |
| Shifts      | POST open                                 | `OperationsShiftManage`        | ADMIN/ENC             | OK                                               |
| Shifts      | GET current management context            | `OperationsShiftManage`        | ADMIN/ENC             | OK                                               |
| Shifts      | PUT assignments                           | `OperationsShiftManage`        | ADMIN/ENC             | OK                                               |
| Shifts      | POST handover                             | `OperationsShiftManage`        | ADMIN/ENC             | OK                                               |
| Shifts      | GET `/api/v1/shifts/me/current`           | `OrdersAccess`                 | ADMIN/ENC/MES         | OK                                               |

La asignación exacta de Inventory y Catalog se observa en `Program.cs`; Operations endpoints confirman Composition, MinStock, Production, Sales, Purchases y Shifts. citeturn963166view0 citeturn791043view2

### Backend conclusion

La única divergencia backend concreta confirmada en la snapshot pública respecto de la matriz final congelada es:

`GET /api/v1/inventory/movements`

porque utiliza una policy que autoriza únicamente ADMINISTRADOR/ENCARGADO.

La solución de diseño preferida es ampliar la policy `InventoryHistory` a los mismos cinco roles de lectura, manteniendo:

- el endpoint;
- el HTTP verb;
- la policy name;
- `InventoryManage`;
- las mutaciones restringidas a ADMIN/ENC.

No se necesita endpoint nuevo ni cambio DTO.

---

## ROUTING_AUDIT

| Route pública observada          | Page                                      | Entry point             | Guard actual                            | Esperado                     | Verdict                                           |
| -------------------------------- | ----------------------------------------- | ----------------------- | --------------------------------------- | ---------------------------- | ------------------------------------------------- |
| `/productos`                     | ProductsPage                              | Navigation `Productos`  | ProductRead                             | ProductRead                  | OK                                                |
| `/productos/:id/composicion`     | HU-004 composition, page real a revalidar | Link desde PREPARATION  | No route observada en AppRoutes público | Read/manage semantics HU-004 | `REMOTE_ROUTING_GAP`; local revalidation required |
| `/produccion/registrar`          | RegisterProductionPage                    | Navigation `Produccion` | ADMIN/ENC/COC                           | ADMIN/ENC/COC                | OK reachability                                   |
| `/inventario`                    | InventoryBalancesPage                     | Navigation `Inventario` | 5 Inventory read roles                  | 5 roles                      | OK                                                |
| `/inventario?tab=notificaciones` | Inventory notifications view              | Internal Inventory tab  | Hereda `/inventario`                    | 5 roles                      | OK                                                |
| `/inventario/movimientos`        | InventoryMovementsPage                    | Internal tab            | ADMIN/ENC                               | 5 roles                      | `TOO_RESTRICTIVE`                                 |
| `/compras`                       | PurchasesPage                             | Navigation `Compras`    | WRITE roles                             | READ roles incl. CON         | `TOO_RESTRICTIVE`                                 |
| `/compras/nueva`                 | NewPurchasePage                           | CTA                     | WRITE roles                             | ADMIN/ENC/COC\*              | OK                                                |
| `/compras/:id/recibir`           | ReceivePurchasePage                       | Purchase action         | WRITE roles                             | ADMIN/ENC/COC\*              | OK                                                |
| `/turnos`                        | ShiftsPage                                | Navigation role target  | ADMIN/ENC                               | ADMIN/ENC                    | OK                                                |
| `/mi-turno`                      | MyShiftPage                               | Navigation role target  | solo authenticated                      | ADMIN/ENC/MES                | `TOO_PERMISSIVE`                                  |
| `/pedidos/:id/cobrar`            | CheckoutPage                              | OrderDetail CTA         | ADMIN/ENC/MES                           | ADMIN/ENC/MES                | OK en snapshot pública actual                     |

El router público ya contiene el CTA funcional a checkout en OrderDetail para Order `ENTREGADO`, por lo que ese bug de reachability se considera resuelto en esta snapshot y no debe reimplementarse. citeturn228692view0

El mismo router muestra concretamente las divergencias actuales en `/inventario/movimientos`, `/compras` y `/mi-turno`. citeturn791043view0

### Desktop/mobile

Desktop sidebar y mobile drawer usan la misma `NavigationLinks` y la misma lista `authenticatedNavigation`. Por tanto, corregir correctamente la definición central debe mantener paridad de visibilidad entre ambos shells sin duplicar lógica. citeturn258014view0

---

## INVENTORY_UI_AUDIT

### Existencias

Estado público actual:

- utiliza `InventoryNavigation`;
- `Existencias` visible;
- `Movimientos` solo aparece cuando `canManage` = ADMIN/ENC;
- `Notificaciones` visible;
- `Notificaciones` no muestra contador;
- el mismo feature ya dispone de `useInventorySummary`/datos globales para HU-006;
- la lógica visual distingue `Saldo negativo`, `Stock bajo` y `Normal`. citeturn665215view2

Expected:

- los tres destinos visibles para los cinco InventoryRead roles;
- badge `lowStockCount` solo cuando `> 0`;
- badge alimentado por summary global.

### Movimientos

Estado público actual:

- implementa su propio `<nav>`;
- contiene únicamente:
  - Existencias;
  - Movimientos;
- no contiene Notificaciones;
- no contiene badge. citeturn665215view3

Expected:

- reutilizar navegación compartida;
- `Movimientos` activo;
- `Notificaciones [N]`;
- mismo count global;
- acceso para ADMIN/ENC/MES/COC/CON;
- ningún nuevo permiso de mutation.

### Notificaciones

Estado público actual:

- se representa dentro de `/inventario?tab=notificaciones`;
- reutiliza `InventoryNavigation`;
- carece de badge numérico.

Expected:

- tab activo correcto;
- badge cuando `lowStockCount > 0`;
- sin badge numérico a cero;
- badge representa productos actualmente low-stock, no unread events.

### Minimal integration target

Conceptualmente:

`InventoryNavigation(activeView)`

debe ser la única composición de:

- Existencias;
- Movimientos;
- Notificaciones;
- badge de low stock.

No se debe crear:

- nuevo endpoint;
- notification entity;
- unread state;
- polling especial;
- segundo summary query model.

---

## HU-007_DOCUMENTATION_AUDIT

### Current public file

`docs/historias/HU-007-sprint-2.md`

La versión pública actual declara:

- `BACKEND IMPLEMENTADO / FRONTEND PENDIENTE`;
- “No se modificó frontend ni se generaron contratos TypeScript”;
- `Frontend y contrato generado: Ninguno`;
- no screenshots;
- un manifest documental que referencia `docs/historias/HU-007-sprint-2-backend.md`, aunque el archivo actual es `HU-007-sprint-2.md`. citeturn220067view0

### Current implementation contradiction

Existe frontend público de Production y route `/produccion/registrar`. `RegisterProductionPage` consume Products, production requirements, Create Production, TanStack Query, UI components y flujo de confirmación/success. citeturn770804view3

Por tanto existe `DOCUMENTATION_DRIFT` verificable entre:

- HU-007 actual;
- código frontend actual.

### Public frontend areas attributable to HU-007

Como mínimo, sujeto a manifest local definitivo:

- `frontend/src/features/production/api.ts`;
- `frontend/src/features/production/index.ts` o equivalente real exportado;
- `frontend/src/features/production/pages.tsx`;
- `frontend/src/routes/AppRoutes.tsx`;
- `frontend/src/features/navigation.tsx`;
- `frontend/src/types/api.generated.ts` cuando contenga el contrato Production utilizado.

Solo deben incluirse tests que realmente existan o se creen durante APPLY.

### Evidence

En `docs/capturas/` público existen evidencias HU-004, HU-005, HU-006, HU-009/010/011, HU-012/013, HU-016, HU-017/018, entre otras, pero no aparece ninguna captura con prefijo HU-007 ni nombre Production/Producción. citeturn967095view0

Estado documental recomendado si el working tree local tampoco contiene evidencia:

`TECHNICALLY_COMPLETE / MANUAL_EVIDENCE_PENDING`

No se debe inventar manual PASS.

### Required HU-007 reconciliation

- mantener reglas funcionales ya implementadas;
- actualizar `Resultado`;
- actualizar `Frontend y validación`;
- usar baseline local real;
- conservar evidencia histórica claramente identificada como histórica;
- registrar resultados nuevos solo si efectivamente se ejecutan;
- reconstruir manifest desde diff/files reales;
- corregir paths inexistentes;
- preparar `## Evidencias`;
- enlazar capturas reales si existen localmente;
- en caso contrario escribir `MANUAL_EVIDENCE_PENDING`;
- actualizar `Estado de entrega` sin fingir aceptación manual.

---

## CONFIRMED_FINDINGS

Los siguientes hallazgos están confirmados contra el `develop` público inspeccionado. Cada uno MUST revalidarse en el working tree local antes de ejecutar su corrección.

| ID    | Tipo                                    | Hallazgo                                                                                                                                | Estado local                  |
| ----- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| F-001 | CONFIRMED_PERMISSION_BUG                | `GET /inventory/movements` usa `InventoryHistory` ADMIN/ENC, por debajo de la matriz final de InventoryRead                             | `LOCAL_REVALIDATION_REQUIRED` |
| F-002 | CONFIRMED_PERMISSION_BUG                | frontend `/inventario/movimientos` solo permite ADMIN/ENC y oculta Movimientos a MES/COC/CON                                            | `LOCAL_REVALIDATION_REQUIRED` |
| F-003 | CONFIRMED_PERMISSION_BUG                | Purchases feature define CONTADORA read, backend permite read, pero router/nav usan WRITE roles                                         | `LOCAL_REVALIDATION_REQUIRED` |
| F-004 | CONFIRMED_PERMISSION_BUG                | `/mi-turno` y navigation exponen own shift a cualquier authenticated role                                                               | `LOCAL_REVALIDATION_REQUIRED` |
| F-005 | CONFIRMED_UI_CONSISTENCY_BUG            | tab Notificaciones no muestra `lowStockCount`                                                                                           | `LOCAL_REVALIDATION_REQUIRED` |
| F-006 | CONFIRMED_UI_CONSISTENCY_BUG            | InventoryMovementsPage carece del tab Notificaciones y duplica nav                                                                      | `LOCAL_REVALIDATION_REQUIRED` |
| F-007 | DOCUMENTATION_DRIFT                     | HU-007 declara frontend pendiente aunque frontend Production existe                                                                     | `LOCAL_REVALIDATION_REQUIRED` |
| F-008 | DOCUMENTATION_DRIFT                     | manifest HU-007 referencia un nombre de archivo distinto al documento real                                                              | `LOCAL_REVALIDATION_REQUIRED` |
| F-009 | CONFIRMED_ROUTING_BUG remoto            | Products enlaza `/productos/:id/composicion` pero la snapshot pública de AppRoutes no registra esa route                                | `LOCAL_REVALIDATION_REQUIRED` |
| F-010 | CONFIRMED_UI_INTEGRATION_FINDING remoto | RegisterProductionPage crea un `AppShell` propio dentro de una route ya renderizada bajo `AuthenticatedLayout`                          | `LOCAL_REVALIDATION_REQUIRED` |
| F-011 | TEST_COVERAGE_GAP                       | no existe evidencia suficiente en la inspección pública de una matriz frontend transversal de Sprint 2 para los seis roles + multi-role | `LOCAL_REVALIDATION_REQUIRED` |

### Hallazgos reportados que NO deben corregirse a ciegas

**ProductManage/EMPLEADO:** la snapshot pública actual ya limita backend `CatalogWrite` y frontend `canManageProducts` a ADMINISTRADOR/ENCARGADO. Este issue se considera `ALREADY_RESOLVED_IN_REMOTE_BASELINE`; solo se exige revalidación local + regression coverage. citeturn963166view0 citeturn791043view1

**Checkout orphan:** la snapshot pública actual sí contiene route `/pedidos/:id/cobrar` y CTA `Confirmar venta` desde Order `ENTREGADO`; no debe existir una task para “volver a arreglarlo” salvo que el local real difiera. citeturn665215view1 citeturn228692view0

---

# Problem Statement

Sprint 2 ya está funcionalmente implementado. La integración final muestra drift entre la matriz funcional aprobada, las policies backend, los guards frontend, la navegación y la documentación.

En el `develop` público inspeccionado existen, como mínimo, divergencias concretas en:

- lectura del historial de Inventory;
- lectura frontend de Purchases para CONTADORA;
- exposición frontend de own Shift a roles no autorizados;
- navegación interna de Inventory;
- contador de low-stock en Notificaciones;
- documentación HU-007.

También aparecen posibles gaps de route/layout que deben revalidarse contra el working tree local antes de modificar código.

Este change debe corregir únicamente divergencias confirmadas localmente, sin reimplementar ninguna HU de Sprint 2.

# Goals

- Revalidar el `develop` local real antes de APPLY.
- Alinear backend authorization con la matriz final congelada.
- Alinear frontend capabilities, guards, navigation y action visibility con backend.
- Mantener unión de capabilities para usuarios multi-role.
- Garantizar ProductManage exclusivo para ADMINISTRADOR/ENCARGADO.
- Mantener ProductRead independiente de ProductManage.
- Permitir Inventory Movements a todos los roles de InventoryRead.
- Mantener Inventory mutations restringidas según policies existentes.
- Permitir Purchase read a CONTADORA sin otorgarle mutations.
- Restringir own Shift a ADMINISTRADOR/ENCARGADO/MESERO.
- Preservar el qualifier real de COCINA en Purchase.
- Auditar y corregir únicamente rutas Sprint 2 realmente huérfanas.
- Mantener paridad funcional desktop/mobile mediante navigation central.
- Unificar navegación interna de Inventory.
- Mostrar `lowStockCount` en Notificaciones cuando sea mayor que cero.
- Usar el summary global existente como única fuente del badge.
- Completar HU-007 documentalmente usando archivos/evidencia reales.
- Añadir cobertura backend/frontend de la matriz de permisos.
- Ejecutar regression global al final de APPLY.
- Mantener endpoints, HTTP verbs y DTOs estables.
- Mantener migrations en cero.
- Mantener nuevos endpoints en cero.

# Non-Goals

- Reimplementar HU-004.
- Reimplementar HU-006.
- Reimplementar HU-007.
- Reimplementar HU-012/HU-013.
- Reimplementar HU-017/HU-018.
- Reimplementar HU-025.
- Rediseñar Products.
- Rediseñar Inventory.
- Rediseñar Purchases.
- Rediseñar Production.
- Rediseñar Shifts.
- Nueva arquitectura de authorization.
- Cambiar JWT/Auth.
- Nuevas APIs.
- Nuevos DTOs.
- Nueva versión API.
- Nuevas migrations.
- Nueva entidad Notification.
- Read/unread notifications.
- Nuevo polling.
- SignalR nuevo.
- Revisión global de permisos fuera de Sprint 2.
- HU futuras.
- Customer/fiscal invoicing.
- Cash closing futuro.
- Printer/hardware.
- Reportes nuevos.
- Mass documentation rewrite.
- Reabrir changes OpenSpec cerrados.
- Fabricar evidencia.

# Affected Areas

Áreas probables, sujetas a revalidación local:

### Backend

- configuración de authorization policies;
- endpoint authorization tests;
- Operations authorization regression;
- Inventory authorization regression.

### Frontend

- role/capability constants;
- route guards;
- central navigation;
- Product permission regression;
- Purchase read/write route separation;
- own-Shift route/navigation restriction;
- Inventory internal navigation;
- Inventory low-stock badge;
- route reachability fixes únicamente donde continúen rotas;
- Production shell integration únicamente si el local conserva el nesting observado;
- tests.

### Documentation

- HU-007;
- documentos actuales de permisos que contradigan la matriz final;
- este change;
- no mass rewrite.

# Assumptions

- Las ocho HU de Sprint 2 están funcionalmente implementadas en el working tree local, según la decisión humana.
- El change previo de estabilización backend Sprint 2 ya fue aplicado localmente.
- `GET /api/v1/inventory/summary` continúa siendo la fuente global de `lowStockCount`.
- Las rutas y policies públicas observadas son una aproximación útil, pero el working tree local puede contener correcciones posteriores.
- El qualifier COCINA para Purchase se preservará exactamente como esté definido por código + documentación canónica local; no se redefine en este change.

# Risks

## Risk: corregir un bug que ya no existe localmente

- Probability: High
- Impact: Medium
- Mitigation: Task de baseline obligatoria; cada finding debe quedar `CONFIRMED_IN_LOCAL_BASELINE` antes de editar.

## Risk: ampliar permisos de Inventory mutations por confundir read con manage

- Probability: Medium
- Impact: Critical
- Mitigation: tocar exclusivamente GET/history policy para lectura; mantener `InventoryManage` ADMIN/ENC y añadir tests negativos.

## Risk: CONTADORA obtiene Purchase mutations al habilitar lectura

- Probability: Medium
- Impact: High
- Mitigation: separar `PURCHASE_READ_ROLES` de `PURCHASE_WRITE_ROLES` en router/nav/actions y probar ambas capacidades.

## Risk: COCINA pierde su qualifier de Purchase

- Probability: Medium
- Impact: High
- Mitigation: preservar las validaciones service-side actuales y añadir tests representativos; no convertir `*` en acceso irrestricto.

## Risk: EMPLEADO conserva una mutation accidental no detectada

- Probability: Medium
- Impact: High
- Mitigation: sweep explícito del rol EMPLEADO sobre todos los endpoints/capabilities Sprint 2 y regression matrix.

## Risk: multi-role se evalúa con un único rol

- Probability: Low
- Impact: High
- Mitigation: preservar `hasAnyRole`/RequireRole semantics y añadir MESERO+ENCARGADO regression backend/frontend.

## Risk: navegación oculta reemplaza seguridad backend

- Probability: Medium
- Impact: Critical
- Mitigation: endpoint authorization tests obligatorios; direct-route tests separados de nav visibility.

## Risk: romper mobile al corregir desktop navigation

- Probability: Low
- Impact: Medium
- Mitigation: mantener una única definición de navigation compartida por sidebar y drawer y probar ambos render paths.

## Risk: badge de Inventory cuenta la página visible en vez del total global

- Probability: Medium
- Impact: Medium
- Mitigation: fuente exclusiva `summary.lowStockCount`; test con page items != global count.

## Risk: duplicar queries/markup de Inventory

- Probability: Medium
- Impact: Low
- Mitigation: reutilizar una única `InventoryNavigation`; TanStack Query puede deduplicar el summary por query key existente.

## Risk: un route sweep se convierte en rediseño

- Probability: Medium
- Impact: High
- Mitigation: cada cambio de route requiere finding reproducible y preserva path/UX existente siempre que sea posible.

## Risk: documentación HU-007 declara evidencia inexistente

- Probability: Medium
- Impact: High
- Mitigation: inspeccionar `docs/capturas/` local; usar `MANUAL_EVIDENCE_PENDING` cuando no exista evidencia real.

## Risk: documentation cleanup modifica historia técnica innecesariamente

- Probability: Medium
- Impact: Medium
- Mitigation: modificar solo claims current-state falsos; preservar OpenSpec histórico y evidencia histórica.

# Rollback Strategy

Las correcciones de este change deben ser reversibles por archivo/configuración y no requieren rollback de datos.

Rollback conceptual:

- revertir cambios de policy/role lists;
- revertir route guards/navigation;
- revertir Inventory tabs/badge;
- revertir documentación HU-007 a su versión anterior si fuera necesario.

No existe rollback de schema porque:

- migration esperada = NONE;
- new endpoints esperados = NONE;
- datos persistidos no deben cambiar.

Si APPLY descubre que una corrección requeriría schema migration, API breaking change o modificación destructiva, MUST detener esa parte como `DESTRUCTIVE_CHANGE_REQUIRED` o `PRODUCT_DECISION_REQUIRED` en vez de ampliar silenciosamente este change.

# Success Criteria

- El local `develop` fue revalidado y registrado antes de editar.
- Todos los endpoints Sprint 2 tienen una policy coherente con la matriz final.
- Product mutations aceptan solo ADMINISTRADOR/ENCARGADO.
- EMPLEADO no posee accidentalmente ninguna mutation Sprint 2.
- Composition read/manage coincide con la matriz.
- Inventory balances, movements, notifications y summary son legibles para los cinco roles aprobados.
- Inventory mutations no se amplían.
- Production coincide con ADMIN/ENC/COC.
- Sale coincide con ADMIN/ENC/MES.
- Purchase read incluye CONTADORA.
- Purchase mutations excluyen CONTADORA/MESERO/EMPLEADO y conservan el qualifier COCINA.
- Shift manage coincide con ADMIN/ENC.
- Own Shift coincide con ADMIN/ENC/MES.
- Un usuario MESERO+ENCARGADO recibe unión de capabilities.
- Direct URL access no elude guards.
- Todas las capabilities Sprint 2 confirmadas tienen un entry point normal.
- Inventory muestra las tres secciones en las tres vistas.
- Notificaciones muestra badge global cuando `lowStockCount > 0`.
- El badge desaparece cuando `lowStockCount == 0`.
- El badge no representa unread state.
- No se crea endpoint Inventory nuevo.
- No se crea persistence de notifications.
- HU-007 contiene manifest factual.
- HU-007 no inventa evidencia manual.
- Backend y frontend regression terminan con cero fallos.
- No hay migration.
- No hay breaking API change.
- No se reimplementa ninguna HU.
