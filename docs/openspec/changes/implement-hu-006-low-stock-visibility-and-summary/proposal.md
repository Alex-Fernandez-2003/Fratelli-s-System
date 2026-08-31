# Proposal

## BASELINE_AUDIT

### Limitación de auditoría

La baseline obligatoria definida por este change es el `develop` LOCAL REAL ACTUAL.

En esta sesión no existe acceso al checkout Git local del usuario ni a su working tree, por lo que no es posible verificar directamente:

- `git branch --show-current`;
- `git rev-parse HEAD`;
- `git status --short`;
- cambios locales todavía no publicados;
- el estado local posterior a `stabilize-sprint-2-backend-and-openapi-contracts`.

Por tanto, la auditoría siguiente distingue explícitamente entre:

- **REMOTE_VERIFIED**: comprobado contra el `develop` publicado actualmente;
- **LOCAL_REVALIDATION_REQUIRED**: debe comprobarse antes de APPLY contra el checkout real.

### Baseline observada

| Campo                                | Estado                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Repository                           | `Alex-Fernandez-2003/Fratelli-s-System`                                                                             |
| Branch canónica                      | `develop`                                                                                                           |
| Remote HEAD observado                | `5a4966b` — `docs: actualitation of documents`, 2026-08-29                                                          |
| Local HEAD                           | `LOCAL_REVALIDATION_REQUIRED`                                                                                       |
| Local working tree                   | `LOCAL_REVALIDATION_REQUIRED`                                                                                       |
| Sprint 2 backend                     | Implementado en el remoto observado                                                                                 |
| Stabilization change reciente        | Declarado como aplicado localmente por el usuario; no debe asumirse ausente porque el remoto pueda estar por detrás |
| Inventory frontend                   | `EXISTS` en el remoto observado                                                                                     |
| Inventory route                      | `/inventario`                                                                                                       |
| Existing tabs                        | `Existencias`; `Movimientos` para ADMINISTRADOR/ENCARGADO                                                           |
| Existing inventory API               | `GET /api/v1/inventory/balances`, `GET /api/v1/inventory/movements`, `POST /api/v1/inventory/movements`             |
| Existing summary API                 | No existe en el remoto observado                                                                                    |
| Existing low-stock DTO property      | Sí: `InventoryBalanceDto.isLowStock`                                                                                |
| Existing minimum stock               | Sí: `InventoryBalanceDto.minStock`; `Product.MinStock` es nullable                                                  |
| Existing minimum-stock mutation      | Sí: `PUT /api/v1/products/{id}/minimum-stock`                                                                       |
| Minimum-stock mutation policy        | `InventoryManage`                                                                                                   |
| Existing InventoryRead policy        | Sí                                                                                                                  |
| InventoryRead roles                  | ADMINISTRADOR, ENCARGADO, MESERO, COCINA, CONTADORA                                                                 |
| EMPLEADO inventory read              | No permitido                                                                                                        |
| Generated TypeScript                 | Presente                                                                                                            |
| Generated inventory summary contract | Ausente en el remoto observado                                                                                      |
| HU-006 document                      | Actualmente declara `BACKEND IMPLEMENTADO / FRONTEND PENDIENTE`                                                     |

El remoto confirma que `InventoryRead` ya contiene exactamente ADMINISTRADOR, ENCARGADO, MESERO, COCINA y CONTADORA, mientras `InventoryManage` queda en ADMINISTRADOR/ENCARGADO. Los endpoints actuales de Inventory están agrupados bajo `/api/v1/inventory`. citeturn717721view2turn403582view0

La implementación existente de balances realiza un `LEFT JOIN` de Product con `InventoryBalance`, trata la ausencia de balance como cantidad `0`, usa productos activos por defecto y calcula `IsLowStock` a partir de `MinStock` y la cantidad actual. El endpoint es paginado y solo filtra actualmente por búsqueda, tipo y actividad; no expone un filtro backend de low stock. citeturn717721view0turn717721view1

El frontend existente ya usa TanStack Query, el shared HTTP client y generated types. `useBalances` y `useMovements` tienen actualmente un intervalo de refetch de 30 segundos y las mutaciones manuales invalidan la raíz `['inventory']`. citeturn453311view2turn403582view2

La pantalla `/inventario` ya implementa tabla desktop, cards mobile, búsqueda, filtro por ProductType, paginación, refresh, lectura de `minStock`, representación de `Stock bajo` y prioridad visual de `Saldo negativo`. No existe todavía el filtro Stock bajo ni la pestaña Notificaciones. citeturn453311view3turn453311view5turn403582view1

Las rutas y navegación ya permiten Inventory para ADMINISTRADOR, ENCARGADO, MESERO, COCINA y CONTADORA. La navegación global no necesita una revisión transversal para HU-006. citeturn453311view7turn324403view1

La configuración de stock mínimo ya existe como capacidad backend mediante `PUT /api/v1/products/{id}/minimum-stock` protegida con `InventoryManage`. HU-006 no debe duplicarla. citeturn324403view0

El contrato TypeScript generado ya contiene `InventoryBalanceDto` con `currentQuantity`, `minStock`, `isLowStock` e información de unidad, pero no contiene `/api/v1/inventory/summary`. citeturn509846view0turn573790view3

### Baseline gate obligatorio para APPLY

Antes de modificar archivos, APPLY MUST repetir esta auditoría sobre el checkout local.

Si el local posterior a `stabilize-sprint-2-backend-and-openapi-contracts` ya contiene cualquiera de las capacidades aquí propuestas, Pi MUST:

1. clasificarlas `ALREADY_SUPPORTED`;
2. reutilizarlas;
3. eliminar de su ejecución cualquier trabajo redundante;
4. conservar la intención funcional de este change.

## REUSE_MAP

### Backend

| Foundation                            | Estado observado         | Decisión                               |
| ------------------------------------- | ------------------------ | -------------------------------------- |
| `InventoryService`                    | Existe                   | REUSE / EXTEND                         |
| `IInventoryService`                   | Existe                   | EXTEND con una única operación summary |
| `IInventoryWriter`                    | Existe                   | DO NOT TOUCH para HU-006               |
| `InventoryBalance`                    | Existe                   | REUSE                                  |
| `InventoryMovement`                   | Existe                   | DO NOT TOUCH salvo regresión           |
| `InventoryBalanceDto`                 | Existe                   | REUSE                                  |
| `Product.MinStock`                    | Existe                   | REUSE                                  |
| Unit data en balance                  | Existe                   | REUSE                                  |
| `InventoryRead`                       | Correcta                 | REUSE                                  |
| `InventoryManage`                     | Correcta                 | REUSE                                  |
| `/api/v1/inventory/balances`          | Existe y es paginado     | KEEP                                   |
| `/api/v1/inventory/movements`         | Existe                   | KEEP                                   |
| `/api/v1/products/{id}/minimum-stock` | Existe                   | KEEP / NO NEW UI                       |
| ProblemDetails/OpenAPI                | Existe                   | REUSE                                  |
| Low-stock persistence                 | No existe ni se necesita | DO NOT CREATE                          |
| Summary endpoint                      | No existe en remoto      | CREATE exactly one if local confirms   |

### Frontend

| Foundation                 | Estado observado | Decisión                            |
| -------------------------- | ---------------- | ----------------------------------- |
| `/inventario`              | Existe           | REUSE                               |
| `InventoryBalancesPage`    | Existe           | EXTEND                              |
| `InventoryMovementsPage`   | Existe           | KEEP                                |
| `InventoryNavigation`      | Existe           | EXTEND with Notifications           |
| Desktop balance table      | Existe           | KEEP                                |
| Mobile balance cards       | Existe           | KEEP                                |
| `stateFor(balance)`        | Existe           | REUSE/ALIGN                         |
| Search                     | Existe           | KEEP                                |
| ProductType filter         | Existe           | KEEP                                |
| Pagination                 | Existe           | KEEP                                |
| Refresh                    | Existe           | EXTEND to summary where appropriate |
| Entry/write-off dialogs    | Existen          | KEEP / OUT OF HU-006                |
| `inventoryKeys`            | Existe           | EXTEND                              |
| shared httpClient          | Existe           | REUSE                               |
| endpoint registry          | Existe           | EXTEND                              |
| generated types            | Existen          | REGENERATE after backend            |
| AuthProvider/role guards   | Existen          | REUSE                               |
| AppShell/navigation        | Existe           | KEEP                                |
| Inventory low-stock filter | No observado     | ADD                                 |
| Inventory warning banner   | No observado     | ADD                                 |
| Notifications tab          | No observado     | ADD                                 |
| Global summary cards       | No observado     | ADD                                 |

No debe duplicarse:

- la página Inventory;
- el sistema de inventario;
- el balance;
- `MinStock`;
- la mutación de stock mínimo;
- el HTTP client;
- QueryClient;
- auth;
- AppShell;
- mobile navigation;
- los dialogs ENTRY/WRITE_OFF.

## CONFIRMED_SCOPE

El change cubre exclusivamente:

1. un único endpoint read-only global de Inventory Summary;
2. un DTO summary nuevo;
3. agregación global correcta sobre el mismo universo de productos operativos que usa Inventory;
4. detalles completos de low-stock dentro de ese mismo único response porque el endpoint de balances actual no tiene filtro low-stock server-side;
5. integración del summary en generated OpenAPI/TypeScript;
6. alerta visual global dentro de `/inventario`;
7. cards globales:
   - Stock bajo;
   - Negativos;
   - Normal;
   - Total productos;
8. nueva pestaña `Notificaciones` dentro del módulo existente;
9. cards de todos los productos low-stock;
10. tratamiento visual prioritario de negativos;
11. filtro `Stock bajo` en Existencias usando un conjunto completo, no solo la página actual;
12. loading/error/empty states;
13. desktop/mobile responsive;
14. permisos InventoryRead existentes;
15. tests backend/frontend;
16. actualización posterior de HU-006 con evidencia real.

No se identificó una decisión funcional humana adicional necesaria para definir este change.

La única condición previa pendiente es técnica: revalidar el `develop` local real.

# Proposal

## Problem Statement

HU-006 tiene una foundation backend parcial y una pantalla Inventory ya funcional, pero la experiencia actual no completa la visualización operacional de low stock.

El listado existente:

- muestra `minStock`;
- muestra `isLowStock`;
- preserva saldos negativos;
- representa `Stock bajo` y `Saldo negativo`;

pero carece de una fuente backend global que permita conocer correctamente:

- total de productos inventariables;
- cantidad total en low stock;
- cantidad negativa;
- cantidad normal;
- conjunto completo de productos que requieren atención.

El endpoint actual de balances es paginado y no dispone de filtro low-stock. Por tanto, calcular los indicadores o la pestaña de alertas a partir de una única página produciría resultados falsos.

La HU debe completarse extendiendo Inventory, no construyendo un segundo módulo.

## Goals

- El sistema MUST reutilizar `/inventario`.
- El sistema MUST mantener `Existencias`.
- El sistema MUST mantener `Movimientos`.
- El sistema MUST añadir una pestaña `Notificaciones` o término español equivalente.
- El backend MUST añadir exactamente un endpoint nuevo.
- El endpoint MUST ser read-only.
- El endpoint MUST usar `InventoryRead`.
- El endpoint MUST proporcionar counts globales.
- El endpoint MUST proporcionar el conjunto completo de low-stock items porque el balance endpoint actual no puede obtenerlo globalmente mediante filtro.
- Los counts MUST usar el mismo universo operacional de Inventory.
- `lowStockCount` MUST incluir saldos negativos.
- `negativeStockCount` MUST ser un subconjunto de `lowStockCount`.
- Los valores negativos MUST conservar su cantidad real.
- La UI MUST dar prioridad visual a `SALDO NEGATIVO`.
- La UI MUST mostrar `STOCK BAJO` para low-stock no negativo.
- La UI MUST mostrar un warning global cuando `lowStockCount > 0`.
- `Ver detalles` MUST abrir la pestaña Notificaciones.
- El frontend MUST disponer de un filtro Stock bajo que no filtre únicamente la página actual.
- El frontend MUST reutilizar TanStack Query, shared HTTP client y generated types.
- El change MUST preservar Inventory existente.
- El change MUST ser usable en desktop y aproximadamente 360 px.
- El change MUST mantener la modificación de MinStock exclusivamente en su flujo existente.
- OpenAPI y TypeScript MUST sincronizarse después de estabilizar backend.

## Non-Goals

- Otra UI para configurar `MinStock`.
- Otro endpoint para modificar `MinStock`.
- Otra entidad de stock.
- `LowStockAlert` persistida.
- Tabla Notifications.
- Notification center global.
- Campana global.
- Push.
- navegador Notification API.
- SignalR nuevo.
- background worker.
- jobs/cron.
- email.
- SMS.
- WhatsApp.
- exportación.
- nuevos movimientos.
- cambiar ENTRY/WRITE_OFF.
- reportes.
- gráficos.
- valorización.
- costeo.
- lotes.
- vencimientos.
- compras automáticas.
- supplier suggestions.
- remodelar Products.
- remodelar Inventory completo.
- auditoría global de permisos.
- migrations.
- otros módulos/HU Sprint 2.
- APPLY.
- VERIFY.
- ARCHIVE.
- Git mutation.

## Affected Areas

### Backend

Probables áreas:

- contratos Application de Inventory;
- `IInventoryService`;
- implementación `InventoryService`;
- mapping de endpoints Inventory en API;
- tests de integración/autorización Inventory.

No se espera modificar:

- Domain Inventory;
- `IInventoryWriter`;
- Inventory write transaction;
- movements;
- migrations.

### Frontend

Probables áreas:

- endpoint registry;
- generated TypeScript;
- `features/inventory/api`;
- Inventory page/navigation;
- tests Inventory;
- shared visual primitives únicamente si la baseline local demuestra que falta una capacidad neutral reutilizable.

### Documentation

Después de APPLY:

- HU-006 actual;
- OpenSpec del change;
- manifests/evidencia real;
- current-state contract documentation solo cuando corresponda.

## Assumptions

- La baseline local puede contener cambios posteriores al remoto auditado.
- `stabilize-sprint-2-backend-and-openapi-contracts` ya fue aplicado localmente y MUST tratarse como foundation.
- El universo operacional por defecto de Inventory continúa siendo Product activos, porque el servicio remoto actual usa `active ?? true`.
- Un Product sin fila `InventoryBalance` continúa representándose con stock `0`.
- Para `MinStock = null`, el comportamiento actual es no considerarlo low-stock salvo la regla crítica independiente de saldo negativo.
- Por tanto, en este change:
  - `currentQuantity < 0` se considera low-stock aun con `MinStock = null`;
  - `currentQuantity >= 0` y `MinStock = null` se considera fuera de low-stock.
- Esta semántica preserva el comportamiento visual actual y la decisión congelada de que todo saldo negativo requiere atención.

## Risks

### Risk 1: diseñar contra un remoto anterior al checkout local

- Probability: High
- Impact: High
- Mitigation: preflight local obligatorio antes de APPLY y clasificación REUSE/ALREADY_SUPPORTED.

### Risk 2: calcular counts usando solo la página visible

- Probability: Medium
- Impact: High
- Mitigation: summary backend global, sin derivar aggregates desde `PagedResponse.items`.

### Risk 3: contar negativos fuera de low stock

- Probability: Medium
- Impact: High
- Mitigation: una única regla backend para membership del summary donde negative implica low-stock.

### Risk 4: duplicar la lógica de IsLowStock de forma divergente

- Probability: Medium
- Impact: Medium
- Mitigation: reutilizar una expresión/helper pequeño para balance y summary cuando la baseline permita hacerlo sin breaking behavior.

### Risk 5: universo distinto entre summary y Existencias

- Probability: Medium
- Impact: High
- Mitigation: aplicar el mismo scope Product/active/balance-zero que `BalancesAsync`.

### Risk 6: tratar `negativeStockCount` como categoría separada del low-stock total

- Probability: Medium
- Impact: Medium
- Mitigation: DTO/documentación/tests deben declarar expresamente que negative es subconjunto de lowStock.

### Risk 7: cargar todo el catálogo para contar

- Probability: Medium
- Impact: Medium
- Mitigation: counts mediante agregación EF/PostgreSQL y materializar únicamente `lowStockItems`.

### Risk 8: summary failure rompe el listado Inventory que aún funciona

- Probability: Medium
- Impact: Medium
- Mitigation: queries independientes; Existencias conserva datos previos/listado y presenta error de summary de forma controlada.

### Risk 9: crear una segunda UI de MinStock debido a mockups

- Probability: Low
- Impact: High
- Mitigation: Modales de stock mínimo clasificados explícitamente OUT OF SCOPE.

### Risk 10: introducir una nueva estrategia de notifications

- Probability: Low
- Impact: High
- Mitigation: Notificaciones se define exclusivamente como vista derivada de Inventory actual.

### Risk 11: filtro low-stock sobre dataset incompleto

- Probability: Medium
- Impact: High
- Mitigation: usar `summary.lowStockItems`, que representa el conjunto global, no `balances.items` de una página.

### Risk 12: regresión de permissions

- Probability: Low
- Impact: High
- Mitigation: reutilizar `InventoryRead`; no crear policy paralela.

### Risk 13: generated TypeScript queda stale

- Probability: Medium
- Impact: High
- Mitigation: backend gates → runtime OpenAPI → `api:generate` → frontend gates.

### Risk 14: visual mockups expanden scope

- Probability: Medium
- Impact: Medium
- Mitigation: mantener clasificación KEEP/ADAPT/OMIT y usar backend/decisiones congeladas como autoridad funcional.

## Rollback Strategy

No se espera migration ni cambio persistente de datos.

El change puede revertirse funcionalmente eliminando:

- endpoint summary;
- DTO summary;
- query frontend summary;
- banner;
- summary cards;
- pestaña Notificaciones;
- filtro low-stock añadido.

Los endpoints existentes de balances/movements y el flujo MinStock permanecen intactos.

Si se revierte el endpoint después de haber regenerado OpenAPI, también debe regenerarse `api.generated.ts` desde el contrato revertido.

Ningún rollback debe alterar:

- balances;
- movements;
- MinStock;
- Product;
- historial de Inventory.

## Success Criteria

- Exactamente un endpoint backend nuevo.
- Cero endpoints Inventory existentes eliminados o renombrados.
- Cero HTTP verbs existentes modificados.
- Cero migrations nuevas.
- Summary usa el mismo universo Product que Inventory operacional.
- `totalProducts` cuenta productos, no cantidades.
- `stock = minimum` cuenta low-stock.
- `stock < 0` cuenta low-stock y negative.
- `normalStockCount = totalProducts - lowStockCount`.
- Summary devuelve todos los low-stock items del universo definido.
- Existencias mantiene tabla desktop y cards mobile existentes.
- Filtro Stock bajo contiene también negativos.
- Banner aparece solo cuando existe low-stock.
- `Ver detalles` conduce a Notificaciones sin crear `/low-stock`.
- Notificaciones representa todos los lows.
- Empty Notificaciones diferencia “sin alertas” de “sin productos”.
- ADMINISTRADOR, ENCARGADO, MESERO, COCINA y CONTADORA obtienen acceso.
- EMPLEADO no obtiene acceso.
- La configuración MinStock no recibe una segunda UI.
- No existe persistence de notifications.
- Backend tests terminan con failed=0.
- OpenAPI runtime contiene el nuevo endpoint.
- Generated TypeScript deriva del OpenAPI final.
- Frontend format/typecheck/lint/tests/build terminan con failed=0.
- Desktop y 360 px son utilizables.
- HU-006 se actualiza solo con evidencia efectivamente producida.
