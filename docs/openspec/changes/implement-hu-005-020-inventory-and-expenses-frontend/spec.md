# Spec

## Requirements

### Source Authority

- El sistema MUST tratar las decisiones humanas de este change como primera autoridad.
- El frontend MUST tratar OpenAPI/backend real como autoridad contractual.
- La documentación canónica MUST resolver contexto no contradicho por decisiones humanas.
- El frontend real MUST gobernar patterns técnicos y reutilización.
- Las referencias visuales MUST gobernar appearance/UX, no funcionalidad.
- La implementación MUST NOT inventar backend para reproducir screenshots.

### Baseline Audit

Antes de implementar, APPLY MUST confirmar:

- `develop` local real;
- HEAD;
- working tree status;
- frontend package scripts;
- routes;
- navigation;
- AuthProvider;
- session coordinator;
- shared httpClient;
- QueryClient;
- UI Kit;
- Dialog;
- forms;
- Toast/feedback;
- pagination;
- existing feature patterns;
- OpenAPI runtime.

APPLY MUST verificar que existan:

- GET `/api/v1/inventory/balances`
- GET `/api/v1/inventory/movements`
- POST `/api/v1/inventory/movements`
- GET `/api/v1/expense-categories`
- POST `/api/v1/expenses`

Si falta una capability contractual aprobada, MUST usar `BASELINE_CONTRACT_BLOCKER`.

### Generated Types

- APPLY MUST ejecutar el script real de generación.
- La baseline pública actual define `pnpm run api:generate`. citeturn418096view0
- `api.generated.ts` MUST regenerarse desde backend runtime real.
- MUST NOT editarse manualmente.
- Feature adapters SHOULD usar generated types directamente o aliases de tipos derivados, no DTOs duplicados manuales.

### Architecture

El flujo MUST conservar:

- generated types
- endpoint registry
- shared httpClient
- feature API
- TanStack Query
- UI

Features MUST NOT:

- recibir JWT;
- construir Bearer;
- leer refresh cookie;
- crear `fetch` client paralelo;
- crear Axios si no existe;
- crear otro QueryClient.

El shared client actual ya utiliza `sessionCoordinator` y ProblemDetails; MUST reutilizarse. citeturn293544view2

### Feature Separation

Inventory y Expenses MUST mantener:

- API modules separados;
- key factories separadas;
- pages separadas;
- tests separados;
- domain presentation components separados.

Expenses MUST NOT vivir dentro de Inventory.

Inventory MUST NOT vivir dentro de Catalog.

### Navigation Boundary

El change MUST registrar las rutas necesarias.

El change MUST NOT:

- rediseñar AppShell;
- recrear sidebar;
- crear bottom-nav global nuevo;
- reorganizar globalmente todas las rutas.

La navegación central actual SHOULD recibir solamente integración mínima para los módulos realmente implementados. Actualmente ya usa `allowedRoles` por módulo. citeturn293544view0

# Visual Audit

## Audit Status

Las diez referencias están identificadas por nombre, pero sus píxeles no pudieron visualizarse con las herramientas de esta sesión.

Por tanto, la tabla siguiente congela la reconciliación funcional de los elementos descritos por el usuario, pero APPLY MUST complementar layout, spacing, hierarchy, exact mobile composition y dialog composition tras abrir los PNG reales.

## KEEP / ADAPT / OMIT / DEFER Matrix

| Image                                      | Elemento                                  | Decisión                     | Justificación                              |
| ------------------------------------------ | ----------------------------------------- | ---------------------------- | ------------------------------------------ |
| Inventario - Existencias Desktop.png       | Tabla/listado de existencias              | KEEP                         | Capability HU-005 soportada                |
| Inventario - Existencias Desktop.png       | Producto                                  | KEEP                         | Balance DTO                                |
| Inventario - Existencias Desktop.png       | Tipo                                      | KEEP                         | ProductType real                           |
| Inventario - Existencias Desktop.png       | Existencia actual                         | KEEP                         | currentQuantity real                       |
| Inventario - Existencias Desktop.png       | Unidad                                    | KEEP                         | InventoryUnit real                         |
| Inventario - Existencias Desktop.png       | Stock mínimo                              | KEEP                         | minStock real                              |
| Inventario - Existencias Desktop.png       | Estado                                    | ADAPT                        | UI deriva Normal/Stock bajo/Saldo negativo |
| Inventario - Existencias Desktop.png       | SKU/código                                | OMIT si OpenAPI no lo expone | No inventar SKU                            |
| Inventario - Existencias Desktop.png       | Search                                    | KEEP                         | backend search                             |
| Inventario - Existencias Desktop.png       | Tipo de producto                          | ADAPT                        | usar ProductType canónico                  |
| Inventario - Existencias Desktop.png       | filtro Stock bajo                         | OMIT                         | sin filtro server-side aprobado            |
| Inventario - Existencias Desktop.png       | filtro Saldo negativo                     | OMIT                         | sin filtro server-side aprobado            |
| Inventario - Existencias Desktop.png       | métricas globales                         | OMIT                         | endpoint paginado sin aggregates           |
| Inventario - Existencias Desktop.png       | Refresh                                   | KEEP                         | refetch TanStack Query                     |
| Inventario - Existencias Desktop.png       | navegación Existencias/Movimientos        | KEEP para ADMIN/ENCARGADO    | ambas rutas permitidas                     |
| Inventario - Existencias Desktop.png       | Movimientos disabled para read-only roles | OMIT                         | capability no debe mostrarse               |
| Inventario - Movimientos Desktop.png       | tabla de movimientos                      | KEEP                         | GET movements                              |
| Inventario - Movimientos Desktop.png       | filtros Product/type/date                 | KEEP                         | contrato esperado                          |
| Inventario - Movimientos Desktop.png       | search responsable/producto libre         | OMIT salvo OpenAPI real      | no contrato aprobado                       |
| Inventario - Movimientos Desktop.png       | signed delta                              | KEEP                         | movement DTO                               |
| Inventario - Movimientos Desktop.png       | reason/origin                             | KEEP                         | ledger DTO                                 |
| Inventario - Movimientos Desktop.png       | export                                    | OMIT                         | no backend/report scope                    |
| Inventario - Movimientos Desktop.png       | summary cards                             | OMIT                         | no aggregates                              |
| Estados de Inventario.png                  | loading                                   | KEEP                         | query state                                |
| Estados de Inventario.png                  | empty                                     | KEEP                         | UX state                                   |
| Estados de Inventario.png                  | filtered empty                            | KEEP/ADAPT                   | distinguir filtro vacío                    |
| Estados de Inventario.png                  | error                                     | KEEP                         | query ProblemDetails/network               |
| Estados de Inventario.png                  | Stock bajo badge                          | KEEP                         | isLowStock                                 |
| Estados de Inventario.png                  | Saldo negativo badge                      | KEEP                         | currentQuantity < 0                        |
| Estados de Inventario.png                  | Normal badge                              | KEEP                         | estado normal                              |
| Modales de Inventario.png                  | Registrar entrada                         | KEEP                         | ENTRY                                      |
| Modales de Inventario.png                  | Registrar baja                            | KEEP                         | WRITE_OFF                                  |
| Modales de Inventario.png                  | Product selector                          | KEEP                         | balances/catalog contract                  |
| Modales de Inventario.png                  | quantity                                  | ADAPT                        | decimal hasta 4 decimales                  |
| Modales de Inventario.png                  | unit                                      | ADAPT                        | read-only, no selector                     |
| Modales de Inventario.png                  | reason                                    | ADAPT                        | obligatorio aunque mockup no lo marque     |
| Modales de Inventario.png                  | responsable                               | ADAPT                        | read-only, no actor request                |
| Modales de Inventario.png                  | warning de baja                           | KEEP/ADAPT                   | incluir negative-stock semantics reales    |
| Modales de Inventario.png                  | configurar stock mínimo                   | DEFER                        | futura Configuración de alertas/HU-006     |
| Inventario - Existencias Móvil.png         | card/list mobile                          | KEEP                         | responsive authority                       |
| Inventario - Existencias Móvil.png         | tabla horizontal comprimida               | OMIT                         | cards/rows verticales                      |
| Inventario - Existencias Móvil.png         | Product/state/quantity/unit/min           | KEEP                         | datos contractuales                        |
| Productos - Catálogo Unificado Desktop.png | design language                           | KEEP                         | consistency visual                         |
| Productos - Catálogo Unificado Desktop.png | Product CRUD                              | OMIT                         | fuera de HU-005                            |
| Productos - Catálogo Unificado Desktop.png | editar MinStock                           | DEFER                        | futura Configuración de alertas            |
| Productos - Catálogo Unificado Desktop.png | Nuevo producto                            | OMIT                         | Catalog capability                         |
| Gastos - Registrar (Desktop).png           | formulario de gasto                       | KEEP                         | HU-020                                     |
| Gastos - Registrar (Desktop).png           | amount                                    | KEEP                         | Expense request                            |
| Gastos - Registrar (Desktop).png           | category                                  | ADAPT                        | opcional                                   |
| Gastos - Registrar (Desktop).png           | cash-source cards                         | KEEP                         | enum real                                  |
| Gastos - Registrar (Desktop).png           | cash source preselected                   | OMIT/ADAPT                   | no default                                 |
| Gastos - Registrar (Desktop).png           | date                                      | KEEP                         | expenseDate                                |
| Gastos - Registrar (Desktop).png           | description                               | KEEP                         | required                                   |
| Gastos - Registrar (Desktop).png           | responsible                               | ADAPT                        | read-only                                  |
| Gastos - Registrar (Desktop).png           | Shift selector/badge                      | OMIT                         | NO_SHIFT_INTEGRATION                       |
| Gastos - Registrar (Desktop).png           | cash balance                              | OMIT                         | backend no muta caja                       |
| Gastos - Historial (Desktop).png           | historia/lista                            | DEFER                        | HU-021                                     |
| Gastos - Historial (Desktop).png           | search/filter/pagination                  | DEFER                        | HU-021                                     |
| Gastos - Historial (Desktop).png           | export                                    | DEFER                        | HU-021/futuro si se aprueba                |
| Gastos - Historial (Desktop).png           | tab Historial                             | OMIT ahora                   | no placeholder de HU-021                   |
| Gastos - Mobile View.png                   | form responsive                           | KEEP                         | HU-020 mobile                              |
| Gastos - Mobile View.png                   | sticky submit                             | KEEP si visualmente encaja   | responsive action                          |
| Gastos - Mobile View.png                   | últimos movimientos                       | OMIT                         | no Expense GET                             |
| Gastos - Mobile View.png                   | Ver historial                             | OMIT                         | HU-021                                     |
| Gastos - Estados y Feedback.png            | validation                                | KEEP/ADAPT                   | reglas reales                              |
| Gastos - Estados y Feedback.png            | category required error                   | OMIT                         | category optional                          |
| Gastos - Estados y Feedback.png            | success feedback                          | ADAPT                        | no claim de cash mutation                  |
| Gastos - Estados y Feedback.png            | cloud/offline sync                        | OMIT                         | capability inexistente                     |
| Gastos - Estados y Feedback.png            | loading de history                        | OMIT                         | HU-021 inexistente                         |

### Visual Fidelity

- Layout exacto MUST ser refinado tras inspeccionar las imágenes reales.
- Pixel-perfect MUST NOT ser requerido.
- Fidelity SHOULD clasificarse `ACCEPTED_FOR_MVP` cuando:
  - hierarchy es reconocible;
  - responsive es usable;
  - theme/density/dialog intent se mantiene;
  - no existe defecto visual grave.
- Minor spacing/polish MAY quedar `DEFERRED_NON_BLOCKING`.

# Inventory Requirements

### Routes

MUST existir:

- `/inventario`
- `/inventario/movimientos`

### Balance Route Authorization

`/inventario` MUST permitir:

- ADMINISTRADOR
- ENCARGADO
- MESERO
- COCINA
- CONTADORA

MUST denegar EMPLEADO-only.

### History Route Authorization

`/inventario/movimientos` MUST permitir únicamente:

- ADMINISTRADOR
- ENCARGADO

Other role-only users MUST ser enviados al Forbidden flow existente.

Multi-role MUST usar unión.

### Inventory Internal Navigation

ADMINISTRADOR/ENCARGADO:

- MUST mostrar Existencias;
- MUST mostrar Movimientos.

Other balance-read roles:

- MUST mostrar solo Existencias.
- MUST NOT mostrar Movimientos disabled.

### Balances Query

Inventory balances MUST usar server-side:

- page;
- pageSize;
- search;
- productType;

y cualquier otro campo que realmente exista en OpenAPI solo cuando este briefing lo autorice.

Default active behavior MUST respetar backend.

UI MUST NOT añadir selector Active/Inactive salvo requirement posterior.

### Search

Placeholder:

`Buscar producto...`

MUST NOT mencionar SKU salvo que OpenAPI real lo exponga.

Changing search MUST reset page to 1.

### ProductType

Labels MUST ser:

- INGREDIENT → Ingrediente
- PREPARATION → Preparación
- SALE_ITEM → Producto de venta
- SUPPLY → Insumo

Si OpenAPI incluye exactamente esos enums.

Frontend MUST NOT crear `Bebida` como ProductType.

### Balance Presentation

Balance item MUST mostrar:

- productName;
- ProductType label;
- currentQuantity;
- inventory unit;
- minStock;
- derived visual state.

SKU MUST omitirse si no existe en contract.

### Inventory State Priority

MUST usar:

1. if `currentQuantity < 0` → `Saldo negativo`;
2. else if `isLowStock === true` → `Stock bajo`;
3. else → `Normal`.

La UI MUST NOT sustituir el `isLowStock` backend por una fórmula contradictoria.

### MinStock Null

If minStock null:

- UI MUST mostrar `—`;
- MUST no mostrar Stock bajo si backend devuelve false.

### Low-stock Scope

MUST mostrar:

- minStock;
- Stock bajo.

MUST NOT:

- editar MinStock;
- crear configuración;
- crear alertas;
- crear SignalR;
- crear notification center.

Future capability MUST documentarse como:

`DEFERRED — Configuración de alertas / HU-006-equivalent`.

### Low-stock Filter

MUST OMITIRSE si backend no ofrece filtro server-side.

MUST NOT:

- filtrar solo items de current page;
- cargar todas las páginas únicamente para simularlo.

### Negative Filter

MUST OMITIRSE si backend no ofrece filtro server-side.

### Aggregate Metrics

MUST OMITIR:

- count low stock;
- count negatives;
- óptimos;
- inventory totals;

si backend no ofrece aggregate global.

### Polling

Balances MUST usar REST polling aproximadamente cada 30 segundos mientras la query esté montada.

MUST NOT usar SignalR.

Polling MUST:

- utilizar TanStack Query mechanism cuando sea viable;
- parar naturalmente al unmount;
- conservar previous data durante background refetch;
- no reemplazar immediate invalidation después de mutations.

Refetch on focus SHOULD seguir la configuración existente, no duplicarse mediante listeners manuales.

### Manual Refresh

MAY existir un botón Refresh.

Acción MUST ser Query refetch/invalidate.

### Movement Actions

ADMINISTRADOR/ENCARGADO MUST poder ver:

- Registrar entrada.
- Registrar baja.

Read-only roles MUST no ver estos controles.

### Movement Dialog Separation

UI SHOULD usar dos acciones explícitas pero MAY reutilizar el mismo componente interno parametrizado.

No se requiere duplicar formulario.

### Product Selector

Movement form SHOULD obtener Products activos mediante `GET inventory/balances`.

MUST:

- mostrar real Product;
- mostrar current quantity;
- mostrar unit;
- soportar search;
- soportar pagination/load-more;
- no truncar silenciosamente primera página.

MUST NOT crear Products hardcoded.

### Quantity

Input MUST aceptar decimal.

MUST:

- usar `inputMode="decimal"` o equivalent;
- validar >0;
- permitir hasta 4 decimales;
- no convertir obligatoriamente a integer.

### Unit

MUST ser read-only.

MUST derivarse del Product.

MUST NOT existir unit selector.

### ENTRY Form

MUST producir manual type ENTRY.

Form MUST incluir:

- Product;
- quantity;
- unit read-only;
- reason;
- optional read-only responsible display.

Reason MUST:

- trim;
- required;
- max500.

MUST NOT enviar actor.

### WRITE_OFF Form

MUST producir type WRITE_OFF.

MUST incluir:

- Product;
- quantity;
- unit read-only;
- reason;
- warning;
- optional responsible display.

### Insufficient Stock Warning

If requested quantity > currentQuantity:

UI MUST mostrar warning equivalente a:

`No hay stock suficiente actualmente en el inventario. La baja se puede registrar igualmente y el saldo quedará negativo.`

Confirm MUST permanecer enabled si el resto del form es válido.

UI MAY mostrar:

- stock actual;
- baja;
- saldo resultante;

como cálculo meramente visual.

MUST NOT:

- producir validation error;
- producir local 409;
- bloquear submit.

### Already Negative Stock

If currentQuantity <0:

- WRITE_OFF MUST seguir permitido;
- warning MUST indicar que el saldo ya es negativo y disminuirá aún más.

### Inventory Mutation Success

ENTRY success:

`Entrada registrada correctamente.`

WRITE_OFF success:

`Baja registrada correctamente.`

After success MUST:

- close dialog;
- invalidate balances;
- invalidate movements;
- refetch mounted relevant queries.

No optimistic balance updates.

### Inventory Mutation Errors

409/other business conflict:

- human-readable message;
- invalidate/refetch when state may be stale;
- no automatic retry.

MUST NOT inventarse insufficient-stock 409.

### History

History MUST mostrar:

- movement;
- Product;
- type;
- signed quantity;
- unit;
- reason;
- reference/origin;
- date/time;
- responsible actor cuando DTO lo provea.

### History Filters

MUST utilizar únicamente filters respaldados por contract:

- productId;
- movementType;
- from;
- to;
- page;
- pageSize.

Changing filter MUST reset page to 1.

No free-text reason/responsible search si backend no lo soporta.

### Movement Type Labels

History MUST poder representar todos los enums generados.

Expected labels:

- ENTRY → Entrada
- SALE → Venta
- PRODUCTION_CONSUMPTION → Consumo de producción
- PRODUCTION_OUTPUT → Producción
- PURCHASE_RECEIPT → Recepción de compra
- WRITE_OFF → Baja
- ADJUSTMENT → Ajuste

Create UI MUST continuar exponiendo solo ENTRY/WRITE_OFF.

### Signed Quantity

History MUST conservar signo.

Examples:

- `+10 kg`
- `-3 kg`

Frontend MUST no transformar semantic value.

### Inactive Product History

History MUST no esconder movimientos porque Product esté actualmente inactivo.

Si el Product selector solo devuelve activos:

- option `Todos` MUST continuar consultando history completo.

### History Polling

Mientras history esté montado para ADMIN/ENCARGADO, polling ~30s MAY usarse para coherencia con balances.

No polling global fuera de screen lifecycle.

### Inventory Empty States

Balance base empty:

`No hay productos disponibles en el catálogo.`

If real Product route exists and current actor puede administrarlo:

- MAY ofrecer CTA a Products.

No fake route.

Filtered empty MUST diferenciarse del base empty.

Movement base empty:

- no movements yet.

Movement filtered empty:

- filters no matches.

### Inventory Responsive

Desktop:

- structured table/list.

403px/360px:

- cards/list rows verticales.

MUST evitar horizontal overflow funcional.

Cards SHOULD mostrar:

- name;
- type;
- quantity;
- unit;
- minStock;
- state.

# Expense Requirements

### Route

MUST existir:

`/gastos`

### Authorization

Allowed:

- ADMINISTRADOR
- ENCARGADO

Denied role-only:

- MESERO
- COCINA
- CONTADORA
- EMPLEADO

Multi-role MUST usar unión.

### HU-020 Scope

The page MUST implement registration only.

MUST NOT mostrar:

- history tab;
- Expense table;
- search records;
- filters;
- pagination;
- export;
- latest expenses;
- View history.

Those belong to HU-021.

### Expense Category Query

MUST consume:

GET `/api/v1/expense-categories`

or exact real contract.

Category MUST ser optional.

Select MUST ofrecer:

`Sin categoría`

No required asterisk.

### Empty Categories

If API returns []:

- form MUST continuar usable;
- category remains null;
- UI SHOULD comunicar `Sin categorías disponibles`.

### Category Load Failure

If categories query fails:

- form MUST continuar usable;
- category MUST permanecer optional/null;
- warning SHOULD ser no bloqueante;
- Retry MAY mostrarse.

### Amount

- Currency label/prefix: `Bs.`
- Input decimal.
- MUST ser >0.
- SHOULD limitar UX a 2 decimals.
- No currency selector.

### CashSource

MUST exponer:

- CASH_DRAWER → Caja principal
- PETTY_CASH → Caja chica

MUST NOT seleccionar una fuente por defecto.

Submit MUST estar inválido hasta que el usuario elija una.

### Business Date

ExpenseDate default MUST ser hoy en `America/La_Paz`.

Date input max MUST ser business date de Bolivia.

Past dates MUST permitirse.

Future dates MUST no poder enviarse desde UX normal y backend error MUST manejarse igualmente.

Frontend SHOULD reutilizar utility existente; no instalar dependency pesada solo para timezone/date.

### Description

Label recomendado:

`Descripción / motivo *`

Rules:

- required;
- trim;
- max500;
- whitespace-only invalid.

### Responsible

MAY mostrarse current user de AuthProvider.

MUST ser read-only.

Request MUST NOT enviar actor.

### Shift

MUST NOT existir:

- Shift selector;
- active Shift badge;
- ShiftId input;
- hardcoded morning/evening/night.

### Cash Balance

MUST OMITIR:

- cash balance;
- available balance;
- claims de cash updated.

### Request Contract

Request MUST derivarse de generated types.

Conceptualmente:

- expenseCategoryId?
- amount
- cashSource
- description
- expenseDate

MUST NOT incluir:

- actor;
- createdAt;
- shiftId;
- cash balance;
- status.

### Expense Mutation

MUST NOT usar optimistic creation.

While pending:

- submit MUST deshabilitarse;
- duplicate rapid click MUST no emitir una segunda request desde la UI.

### Success UX

Después de success, MUST mostrarse una confirmación persistente/resumen basada en ExpenseDto.

MAY incluir:

- monto;
- fecha;
- category/Sin categoría;
- CashSource label;
- description;
- responsible si response lo expone.

Copy MUST ser equivalente a:

`Gasto registrado correctamente. El registro fue guardado.`

MUST NOT decir:

- caja actualizada;
- saldo actualizado;
- sync cloud completed.

CTA MUST existir:

`Registrar otro gasto`

MUST NOT existir:

`Ver historial`.

### Register Another

Al ejecutar `Registrar otro gasto` MUST resetear:

- amount;
- description;
- category;
- cashSource.

ExpenseDate MUST volver a Bolivia today.

CashSource MUST no persistir silenciosamente.

### Expense Loading/Error

Loading:

- categories;
- create mutation.

MUST NOT existir skeleton de Expense history.

Validation MUST reflejar contract real.

MUST NOT mostrar:
`La categoría es obligatoria`.

### Expense Responsive

Desktop MUST inspirarse en Register Desktop.

403px/360px MUST usar Mobile View solo para elementos in-scope.

Sticky submit MAY utilizarse mobile si no:

- tapa campos;
- rompe safe-area;
- rompe keyboard navigation.

# Query Architecture Requirements

### Inventory Keys

MUST existir una factory equivalente a:

- inventoryKeys.all
- inventoryKeys.balances(filters)
- inventoryKeys.movements(filters)

### Expense Keys

MUST existir:

- expenseKeys.categories()

MUST NOT crearse una `expenseKeys.list()` para una capability HU-021 inexistente.

### Filters in Keys

Balance key MUST incluir:

- page;
- pageSize;
- normalized search;
- productType;
- cualquier approved backend filter realmente usado.

Movement key MUST incluir:

- page;
- pageSize;
- productId;
- movementType;
- from;
- to.

### Pagination Reset

Changing:

- search;
- ProductType;
- movement product;
- movementType;
- date range;

MUST reset page to 1.

### Cache Mutation Rules

After Inventory mutation:

- balances root/list MUST invalidarse;
- movements root/list MUST invalidarse.

Expense create:

- category cache MUST NOT invalidarse sin razón;
- no Expense list cache existe.

# Loading/Error Architecture Requirements

- Initial loading MAY mostrar skeleton/placeholder.
- Background polling MUST conservar previous valid data.
- Background polling failure MUST no vaciar toda la screen.
- Manual Retry MUST estar disponible para initial query failure.
- Shared ProblemDetails/HttpError MUST reutilizarse.
- MUST NOT crearse un segundo global error system.

# Accessibility Requirements

- Inputs MUST tener labels asociados.
- Dialogs MUST usar primitive accesible existente cuando exista.
- Dialog close MUST devolver focus apropiadamente.
- Warnings SHOULD usar `aria-describedby`.
- Icon buttons MUST tener accessible names.
- Low/negative states MUST incluir texto, no solo color.
- Forms MUST funcionar por keyboard.
- Mobile actions MUST tener touch targets razonables.
- No disabled capability placeholder para permisos denegados.

# Non-Functional Requirements

- Polling SHOULD ser aproximadamente 30 segundos, no sub-second/agresivo.
- Expense page MUST no hacer polling.
- No SignalR MUST añadirse.
- No backend source MUST modificarse en resultado normal.
- Frontend MUST mantener Spanish copy.
- Styling SHOULD usar Tailwind/design tokens actuales.
- Lucide SHOULD usarse para iconos estándar.
- No fake production content MUST incluirse.

## Behavior Scenarios

### Scenario 1: Balance read para MESERO

Given usuario autenticado con rol MESERO  
When abre `/inventario`  
Then MUST acceder al listado de existencias  
And MUST no ver Registrar entrada, Registrar baja ni Movimientos

### Scenario 2: History guard

Given usuario COCINA-only  
When navega a `/inventario/movimientos`  
Then MUST terminar en ForbiddenPage

### Scenario 3: Multi-role

Given usuario MESERO + ENCARGADO  
When abre Inventory  
Then MUST recibir capabilities de ENCARGADO  
And MUST ver history y mutation actions

### Scenario 4: Zero stock

Given backend devuelve currentQuantity 0  
When Balance row/card renderiza  
Then MUST mostrar 0 con la unit correcta

### Scenario 5: Low stock

Given currentQuantity 5, minStock 5 e isLowStock true  
When row renderiza  
Then MUST mostrar `Stock bajo`

### Scenario 6: Negative overrides low

Given currentQuantity -3 e isLowStock true  
When row renderiza  
Then MUST mostrar `Saldo negativo`  
And MUST no presentar `Stock bajo` como estado principal

### Scenario 7: Null minimum

Given minStock null e isLowStock false  
When renderiza  
Then stock mínimo MUST mostrar `—`  
And estado MUST no ser Stock bajo

### Scenario 8: Inventory poll

Given `/inventario` montado y query saludable  
When transcurren aproximadamente 30 segundos  
Then balances SHOULD refetchearse

### Scenario 9: Poll unmount

Given Inventory page desmontada  
When transcurren 30 segundos  
Then esa query MUST no seguir originando polling activo desde un timer huérfano

### Scenario 10: Mutation immediate refresh

Given ENTRY se registra exitosamente  
When backend responde  
Then balances y movements MUST invalidarse inmediatamente  
And UI MUST no esperar el siguiente polling

### Scenario 11: Entry quantity decimal

Given quantity 1.25 válida  
When ADMIN envía ENTRY  
Then frontend MUST preservar el valor decimal contractual

### Scenario 12: Write-off insufficient stock

Given currentQuantity 2 y requested WRITE_OFF 5  
When form calcula impacto visual  
Then MUST mostrar warning de saldo negativo  
And Confirm MUST seguir disponible

### Scenario 13: Already-negative write-off

Given currentQuantity -2  
When requested WRITE_OFF 1  
Then warning MUST indicar saldo ya negativo  
And submit MUST seguir permitido

### Scenario 14: Actor is not sent

Given current authenticated user  
When se envía manual movement  
Then request MUST no incluir createdBy/responsible actor

### Scenario 15: History movement labels

Given history contiene PURCHASE_RECEIPT y PRODUCTION_CONSUMPTION  
When se renderiza  
Then UI MUST mostrar labels españoles amigables  
And MUST no ofrecer esos tipos en manual create

### Scenario 16: Inactive history

Given un movimiento histórico de Product actualmente inactivo  
When ADMIN consulta history sin Product filter  
Then movement MUST continuar visible si backend lo devuelve

### Scenario 17: Expense route denied

Given CONTADORA-only  
When navega `/gastos`  
Then MUST recibir ForbiddenPage

### Scenario 18: Category optional

Given categories disponibles  
When usuario deja `Sin categoría`  
And completa los demás campos  
Then submit MUST permanecer válido

### Scenario 19: Empty categories

Given category API devuelve []  
When form carga  
Then MUST seguir permitiendo Expense sin category

### Scenario 20: Category API fails

Given category query falla  
When form renderiza  
Then MUST mostrar warning/retry no bloqueante  
And MUST permitir Expense con category null

### Scenario 21: Cash source explicit

Given form recién abierto  
When aún no se seleccionó CashSource  
Then ninguno MUST estar seleccionado  
And submit MUST permanecer inválido

### Scenario 22: Business date

Given business date en Bolivia es 2026-08-27  
When `/gastos` abre  
Then expenseDate default y max MUST ser 2026-08-27 independientemente del UTC day del cliente

### Scenario 23: Past expense

Given usuario selecciona una fecha pasada válida  
When submit ocurre  
Then request MUST conservar esa DateOnly

### Scenario 24: Future date

Given una fecha posterior a business date  
When usuario intenta enviarla  
Then frontend MUST bloquear mediante validación UX  
And cualquier backend 400 MUST mapearse de forma segura

### Scenario 25: Expense request purity

Given formulario válido  
When se envía  
Then payload MUST no incluir actor, shiftId, createdAt ni cash balance

### Scenario 26: Expense success

Given POST Expense exitoso  
When backend devuelve ExpenseDto  
Then UI MUST mostrar confirmation summary  
And MUST no afirmar que caja fue actualizada

### Scenario 27: Register another

Given success summary visible  
When usuario pulsa `Registrar otro gasto`  
Then amount, description, category y CashSource MUST resetearse  
And date MUST volver a Bolivia today

### Scenario 28: Double click

Given Expense mutation pending  
When usuario intenta pulsar submit repetidamente  
Then frontend MUST emitir una sola request mientras esa mutation esté pending

### Scenario 29: No Expense history

Given usuario ADMIN abre `/gastos`  
When page renderiza  
Then MUST no existir tab Historial, search de gastos, tabla ni `Ver historial`

### Scenario 30: No SignalR

Given Inventory o Expense pages montadas  
When se inspecciona su arquitectura  
Then MUST no crear HubConnection ni consumir KitchenHub

## Edge Cases

- backend endpoints aún no mergeados;
- generated type aliases diferentes;
- page fuera de rango después de mutation;
- ProductType nuevo futuro;
- quantity `0.0001`;
- quantity con más de 4 decimales;
- localized decimal comma input;
- Product selector con >100 Products;
- Product desaparece entre selector y mutation;
- background polling falla;
- mutation y polling ocurren simultáneamente;
- minStock = 0;
- currentQuantity = 0, minStock = 0, low=true;
- currentQuantity negativo y minStock null;
- movement reason de 500 chars;
- Product history referenceId sin pantalla destino;
- category list vacía;
- category request pending mientras user completa form;
- category becomes inactive antes de submit;
- Expense amount con >2 decimales;
- browser timezone distinta de Bolivia;
- fecha en cambio de día local;
- network error after Expense submit;
- backend may have persisted but response lost;
- 360px virtual keyboard;
- sticky CTA overlap;
- role union con CONTADORA+ENCARGADO;
- screenshots muestran data inexistente.

## Acceptance Criteria

- APPLY MUST comprobar los cinco endpoints antes de implementar.
- `api.generated.ts` MUST regenerarse sin edición manual.
- `/inventario` MUST respetar cinco roles read.
- `/inventario/movimientos` MUST limitarse a ADMIN/ENCARGADO.
- Mutation controls MUST limitarse a ADMIN/ENCARGADO.
- Inventory module nav MUST ocultar Movimientos a roles read-only.
- Search/ProductType filters MUST ser server-driven.
- Stock bajo/negativo filters MUST no existir sin backend support.
- Aggregate cards MUST no existir sin backend aggregate.
- Negative state MUST tener prioridad visual.
- MinStock null MUST mostrar `—`.
- Polling MUST ocurrir aproximadamente cada 30s en balances.
- Polling MUST no usar SignalR.
- Successful mutation MUST invalidar inmediatamente.
- ENTRY MUST aceptar decimal >0.
- WRITE_OFF MUST aceptar decimal >0.
- Insufficient-stock warning MUST no bloquear confirm.
- Movement actor MUST no enviarse.
- History MUST representar todos los enum values.
- `/gastos` MUST limitarse a ADMIN/ENCARGADO.
- Category MUST ser optional.
- Category failure MUST no bloquear form.
- CashSource MUST no tener default.
- Date MUST usar Bolivia business date.
- Expense request MUST no incluir actor/Shift.
- Success MUST no afirmar cash mutation.
- No HU-021 UI MUST existir.
- No global navigation redesign MUST ocurrir.
- Desktop/403/360 MUST ser funcional.
- All automated quality gates MUST pasar.
- Manual evidence MUST no fabricarse.

## Out of Scope

- HU-006 implementation.
- MinStock editing.
- low-stock notifications.
- Inventory aggregate reports.
- exports.
- Product CRUD.
- HU-021.
- Expense history.
- cash/Shift UI.
- backend modifications.
- SignalR.
- global shell/navigation redesign.
- Git operations.
