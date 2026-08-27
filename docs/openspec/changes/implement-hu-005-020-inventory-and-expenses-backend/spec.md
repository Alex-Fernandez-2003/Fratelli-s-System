# Spec

## Requirements

### Baseline Requirements

- APPLY MUST comenzar auditando el `develop` local real.
- APPLY MUST registrar HEAD y working-tree status.
- APPLY MUST inspeccionar:
  - DbContext;
  - entities;
  - configurations;
  - migrations;
  - snapshot;
  - Order/Kitchen integration;
  - Product;
  - Shift;
  - current policies;
  - test fixtures.
- APPLY MUST NOT confiar en una vista cacheada de GitHub para decidir qué migration/entity ya existe.
- APPLY MUST NOT modificar migrations históricas.
- APPLY MUST adaptar naming/paths al repositorio real sin reabrir las decisiones funcionales congeladas.

### Canonical Source Hierarchy

Ante diferencias:

1. decisiones humanas congeladas de este briefing;
2. requirements/reglas refinadas vigentes;
3. modelo/arquitectura vigente;
4. backlog histórico;
5. naming/estructura real del código para implementación física.

La documentación vigente confirma:

- HU-005: inventario, movimientos, saldo negativo e histórico;
- HU-020: registro de gastos por ADMINISTRADOR/ENCARGADO;
- HU-021: consulta de gastos separada. citeturn287218view2turn287218view3

### Roles

Canonical roles MUST seguir siendo:

- ADMINISTRADOR
- ENCARGADO
- MESERO
- COCINA
- CONTADORA
- EMPLEADO

MUST NOT añadirse `CAJERO`.

Multi-role MUST usar unión de permisos, consistente con RN-020. citeturn697044view3

### User vs Employee

- User MUST continuar siendo identidad/autenticación/auditoría.
- Employee MUST continuar representando identidad operativa cuando corresponda.
- Inventory y Expense audit MUST usar authenticated UserId.
- Requests MUST NOT aceptar actor UserId.
- UserId MUST NOT intercambiarse con EmployeeId.

# Inventory Requirements

### InventoryBalance

InventoryBalance MUST representar el saldo materializado actual por Product.

Conceptualmente:

- `ProductId`
- `Quantity`
- `UpdatedAt`

Requirements:

- ProductId MUST ser único.
- Quantity MUST usar `numeric(14,4)` para nuevas columnas según baseline documental. citeturn287218view0
- Quantity MUST permitir valores positivos, cero y negativos.
- DB MUST NOT tener `CHECK quantity >= 0`.
- Quantity MUST expresarse en `Product.InventoryUnit`.
- InventoryBalance MUST NOT almacenar unitId duplicado salvo que el modelo local ya tenga una razón canónica.

### Zero Implicit Balance

- Product sin InventoryBalance MUST tener saldo conceptual `0`.
- GET balances MUST incluir dicho Product.
- La primera operación MUST materializar InventoryBalance.
- No MUST crearse una fila balance para cada Product mediante migration.
- Crear Product nuevo en Catalog MUST NOT requerir un cambio adicional en Inventory.

### InventoryMovement

InventoryMovement MUST constituir un ledger histórico inmutable.

Conceptualmente:

- Id
- ProductId
- MovementType
- QuantityDelta
- Reason
- ReferenceType
- ReferenceId
- CreatedAt
- CreatedByUserId

Movement types contractuales MUST conservar, si el modelo vigente ya los utiliza:

- ENTRY
- SALE
- PRODUCTION_CONSUMPTION
- PRODUCTION_OUTPUT
- PURCHASE_RECEIPT
- WRITE_OFF
- ADJUSTMENT

El modelo documental vigente define precisamente esos tipos y la convención entrada positiva/salida negativa. citeturn287218view0

### Manual Movement Types

`POST /api/v1/inventory/movements` MUST aceptar únicamente:

- ENTRY
- WRITE_OFF

MUST rechazar manualmente:

- SALE
- PRODUCTION_CONSUMPTION
- PRODUCTION_OUTPUT
- PURCHASE_RECEIPT
- ADJUSTMENT

con `400 ValidationProblemDetails` o equivalent ProblemDetails real.

Mantener ADJUSTMENT en Domain NO implica exponerlo a este endpoint.

### Manual Movement Request

Contrato congelado conceptualmente:

- `productId: Guid`
- `type: InventoryMovementType`
- `quantity: decimal`
- `reason: string`

MUST NOT aceptar:

- quantityDelta
- signed quantity
- unitId
- createdAt
- createdByUserId
- referenceType
- referenceId
- balanceAfter

### Quantity Validation

- quantity MUST ser > 0.
- quantity = 0 MUST producir 400.
- quantity < 0 MUST producir 400.
- Backend MUST derivar:
  - ENTRY → `+quantity`
  - WRITE_OFF → `-quantity`.
- Backend MUST NOT confiar en signo de cliente.

### Unit Semantics

- Manual movement quantity MUST estar en Product.InventoryUnit.
- API MUST NOT permitir elegir Unit.
- API MUST NOT convertir alternate units.
- Balance/history DTO SHOULD incluir información suficiente de InventoryUnit:
  - id;
  - code/name/symbol que ya existan en el contrato real.

### Manual Reason

Para manual ENTRY y WRITE_OFF:

- reason MUST ser requerido.
- reason MUST trim.
- whitespace-only MUST ser inválido.
- max MUST ser 500.
- reason MUST persistirse.
- no enum de reasons.
- no seed de reasons.

### Movement Timestamp

- CreatedAt MUST ser server-authoritative.
- Cliente MUST NOT enviar movimiento histórico/backdated.
- Timestamp SHOULD ser UTC/timestamptz según conventions actuales.

### Movement Reference

Para movimientos manuales:

- semantic ReferenceType MUST ser `MANUAL`.
- ReferenceId MUST ser null.
- Ambos MUST definirse server-side.
- Request MUST NOT poder suplantar Sale/Purchase/Production.

Si el repositorio modela origen mediante string/enum con otro nombre, MUST preservarse la misma semántica.

### Product Validation

Manual movement MUST requerir:

- Product existe;
- Product está activo.

Product missing:

- 404.

Product inactive:

- SHOULD ser 409 con business code estable equivalente a `PRODUCT_INACTIVE`.

Product inactivo MUST seguir disponible en history.

### Negative Stock

Negative stock MUST estar permitido.

Ejemplo:

- saldo = 2
- WRITE_OFF quantity = 5
- delta = -5
- saldo final = -3

Operation MUST persistir exitosamente.

MUST NOT:

- devolver insufficient-stock conflict;
- clamp a zero;
- rechazar por regla de negocio.

### Inventory Transaction

Cada write MUST formar una sola transaction:

- materializar balance row si falta;
- lock;
- reload;
- derive delta;
- create movement;
- update balance;
- save;
- commit.

MUST garantizar:

- no movement without balance update;
- no balance update without movement.

### First Balance Concurrency

Para Product sin balance:

Implementation MUST usar una estrategia PostgreSQL concurrency-safe equivalente a:

- insert initial balance 0 with `ON CONFLICT DO NOTHING`;
- obtain/reload row;
- `SELECT ... FOR UPDATE`;
- apply movement.

MUST NOT usar:

- `if balance == null` seguido de insert no protegido;
- process-local lock como autoridad.

### Row Locking

Para balance existente:

- transaction MUST acquire PostgreSQL row lock.
- authoritative quantity MUST leerse después de lock.
- write MUST aplicar delta a esa cantidad.
- read-modify-write sin serialización MUST NOT utilizarse.

### Reusable Write Boundary

Application MUST separar:

1. manual inventory use case;
2. internal reusable ledger/balance write boundary.

Manual API:

- valida ENTRY/WRITE_OFF;
- recibe positive quantity;
- reason obligatorio;
- origin MANUAL.

Internal boundary MUST quedar diseñado para que futuras capabilities puedan producir, server-side:

- SALE;
- PURCHASE_RECEIPT;
- PRODUCTION_CONSUMPTION;
- PRODUCTION_OUTPUT;
- ADJUSTMENT cuando una futura HU lo autorice.

Este change MUST NOT implementar esos callers.

El internal write boundary MUST conservar una única regla transaccional de:

movement + balance.

### Inventory Balance Endpoint

Expected:

`GET /api/v1/inventory/balances`

Roles:

- ADMINISTRADOR
- ENCARGADO
- MESERO
- COCINA
- CONTADORA

EMPLEADO-only:

- 403.

Anonymous:

- 401.

Query:

- `page=1`
- `pageSize=20`
- `search?`
- `productType?`
- `active=true` por defecto

Paging:

- page >= 1
- pageSize 1..100

Active semantics:

- omitted → active Products
- true → active Products
- false → inactive Products

No “all” mode es necesario para este MVP salvo que la convención local ya lo aporte sin ampliar la API.

Search:

- MUST buscar Product.Name.
- MAY incluir Product code solo si ese field existe realmente al momento de APPLY.
- case-insensitive PostgreSQL behavior SHOULD seguir conventions actuales.

ProductType:

- MUST reutilizar ProductType real.

Order:

- Product.Name ASC
- Product.Id como tie-break estable.

### Zero Balance Query

GET balances MUST conceptualmente ser:

Product LEFT JOIN InventoryBalance

Quantity:

- balance quantity cuando existe;
- 0 cuando no existe.

Pagination MUST paginar Products, no solo balances materializados.

### InventoryBalanceDto

Conceptualmente MUST exponer:

- productId
- productName
- productType
- inventoryUnitId
- inventoryUnitCode si existe
- inventoryUnitName
- inventoryUnitSymbol
- currentQuantity
- minStock
- isLowStock
- isActive

MUST NOT devolver Product completo innecesariamente.

### Low Stock

InventoryBalanceDto MUST exponer:

- `minStock`
- `isLowStock`

isLowStock MUST ser:

`minStock != null && currentQuantity <= minStock`

Cases:

- 10 / 5 → false
- 5 / 5 → true
- 2 / 5 → true
- -3 / 5 → true
- minStock null → false

`isLowStock` MUST NOT ser columna persistida.

HU-005 MUST NOT:

- editar MinStock;
- crear alerts;
- crear notifications;
- crear endpoint low-stock separado;
- crear SignalR.

Aunque HU-006 históricamente trata configuración/alerta de stock bajo, este change únicamente expone el dato derivado requerido por la decisión humana actual. La documentación histórica ya define que existencia <= mínimo y saldos negativos se consideran stock bajo. citeturn287218view2

### Product MinStock Compatibility

El `Product.MinStock` existente MUST reutilizarse tal cual esté persistido en `develop`.

Este change MUST NOT cambiar su precisión/schema únicamente para alinear documentos históricos salvo necesidad real demostrada por el modelo local.

### Inventory History Endpoint

Expected:

`GET /api/v1/inventory/movements`

Roles:

- ADMINISTRADOR
- ENCARGADO

Denied:

- MESERO
- COCINA
- CONTADORA
- EMPLEADO

Query:

- page=1
- pageSize=20
- productId?
- movementType?
- from?
- to?

Max pageSize:

- 100.

Default order:

- CreatedAt DESC
- Id DESC tie-break.

History MUST NOT filtrar automáticamente Products inactivos.

### History Date Semantics

`from` y `to` SHOULD utilizar DateOnly contract.

- from inclusive.
- to inclusive.
- from > to → 400.

Para querying timestamptz:

- from → beginning of business date inclusive;
- to → beginning of next business date exclusive.

MUST NOT depender de server timezone implícita.

### InventoryMovementDto

Conceptualmente MUST exponer:

- id
- productId
- productName
- movementType
- quantityDelta
- inventoryUnitId
- inventoryUnitCode/name/symbol
- reason
- referenceType
- referenceId
- createdAt
- createdByUserId
- createdByDisplayName si puede resolverse con el patrón real

History MUST exponer signed `quantityDelta`.

### Actor Display Resolution

Cuando se exponga display name:

1. linked Employee.FullName si existe;
2. safe Identity username/display value;
3. null solo si ninguna representación segura existe.

Display name SHOULD resolverse en query/read model.

MUST NOT persistirse como auditoría duplicada salvo que el modelo vigente ya lo haga.

### Ledger Immutability

MUST NOT existir:

- PUT movement
- PATCH movement
- DELETE movement
- cancel movement
- edit reason
- set balance

Las transacciones históricas no se borran, coherente con el modelo de datos. citeturn557703view2

# Expense Requirements

### Expense Domain

Expense MUST representar conceptualmente:

- Id
- ShiftId?
- ExpenseCategoryId?
- Amount
- CashSource
- Description
- ExpenseDate
- CreatedAt
- CreatedByUserId

No status.

No cash balance.

No currency field.

### ExpenseCategory

ExpenseCategory MUST representar, si aún no existe:

- Id
- Name
- IsActive
- CreatedAt

La documentación define name lógico único e `is_active`. citeturn450574view3

HU-020 MUST NOT crear Category CRUD.

### CashSource

CashSource MUST usar exclusivamente:

- PETTY_CASH
- CASH_DRAWER

No free text.

No third value.

El modelo canónico documenta exactamente esas fuentes. citeturn450574view2turn450574view4

### Expense Create Endpoint

Expected:

`POST /api/v1/expenses`

Roles:

- ADMINISTRADOR
- ENCARGADO

Denied role-only:

- MESERO
- COCINA
- CONTADORA
- EMPLEADO

Multi-role:

- union.

RN-022 confirma ADMINISTRADOR/ENCARGADO y el caso MESERO+ENCARGADO permitido. citeturn697044view4

Request:

- expenseCategoryId?
- amount
- cashSource
- description
- expenseDate

MUST NOT aceptar:

- id
- shiftId
- createdAt
- createdByUserId
- responsibleUserId
- currency
- status
- cash balance

### Amount

- decimal.
- DB precision SHOULD ser `numeric(12,2)` si se materializa nuevo schema, conforme modelo documental. citeturn287218view1
- MUST ser >0.
- 0 →400.
- negative →400.
- Currency fixed BOB.
- No currency field.

### Expense Date

- Request MUST incluir expenseDate.
- Contract SHOULD ser DateOnly/date.
- Hoy MUST permitirse.
- Fecha pasada MUST permitirse.
- Fecha futura MUST rechazarse con 400.
- CreatedAt MUST generarse server-side.
- ExpenseDate MUST conservar la fecha declarada de negocio.
- CreatedAt MUST conservar instante técnico de registro.
- No MUST compararse expenseDate contra UTC date de forma ciega.

### Business Date Provider

APPLY MUST:

1. audit existing clock/timezone abstraction;
2. reuse it if present;
3. otherwise introduce a minimal testable business-date provider/config.

The provider MUST:

- expose current business DateOnly;
- derive it from an explicit business timezone;
- avoid server-local timezone dependency.

Inferido para ausencia total de configuración:

- `America/La_Paz` SHOULD ser la timezone de negocio documentada para Fratelli/Bolivia.

### Description

- required.
- trim.
- length 1..500.
- whitespace-only invalid.
- no separate artificial concept/detail fields.

### Category

expenseCategoryId:

- optional.
- null → valid.

If provided:

- Category MUST exist.
- Category MUST be active.

Missing Category:

- 404.

Inactive Category:

- SHOULD be 409.

Historical FK MUST remain if Category later becomes inactive.

### Category Seeding

- MUST NOT inventarse categories.
- MUST NOT crear seeds arbitrarios.
- Existing approved seeds MAY mantenerse.
- Empty active category list MUST ser válido.

### Expense Category Endpoint

Expected:

`GET /api/v1/expense-categories`

Roles:

- ADMINISTRADOR
- ENCARGADO

Denied role-only:

- MESERO
- COCINA
- CONTADORA
- EMPLEADO

Response:

simple list of active ExpenseCategoryDto.

Sort:

- Name ASC
- Id tie-break cuando sea necesario.

No pagination requerida salvo que el local repository haya estandarizado obligatoriamente todos los catálogos.

No CRUD routes.

### ExpenseCategoryDto

Conceptually:

- id
- name

`isActive` MAY incluirse si el pattern de DTOs maestros lo exige, aunque el endpoint solo devuelva activas.

### Shift Strategy

APPLY MUST auditar Shift real.

#### Case A — Shift + active resolver real

If both exist:

- Expense.ShiftId MUST ser nullable/required según model final compatible.
- POST Expense MUST resolver active Shift server-side.
- Request MUST NOT incluir shiftId.

#### Case B — Shift entity exists but no operational active resolver

- ShiftId MUST permanecer nullable.
- POST MUST persist null.
- MUST NOT invent lifecycle.

#### Case C — Shift absent

- Expense MAY mantener scalar `Guid? ShiftId` nullable sin FK hasta que Shift exista, si eso preserva el shape previsto.
- MUST NOT crear una fake Shift entity únicamente para HU-020.
- MUST NOT seed Shift.
- MUST NOT implement HU-025.

La ausencia de Shift lifecycle MUST NOT bloquear HU-020.

### No Cash Mutation

POST Expense MUST NOT:

- update cash balance;
- create CashSession;
- create cash ledger;
- close Shift;
- open Shift;
- alter Inventory;
- create InventoryMovement;
- create Sale.

`CashSource` MUST ser clasificación para capacidades futuras.

### Expense Actor

- CreatedByUserId MUST ser authenticated UserId.
- Request MUST NOT poder spoof actor.
- CreatedAt MUST ser server-authoritative.
- createdByDisplayName MAY exponerse siguiendo la misma resolución segura de actor.

### ExpenseDto

Conceptually:

- id
- expenseCategoryId?
- expenseCategoryName?
- amount
- cashSource
- description
- expenseDate
- shiftId?
- createdAt
- createdByUserId
- createdByDisplayName?

MUST NOT exponer:

- Identity internals
- JWT
- cash balance
- invented status

### HU-021 Boundary

This change MUST NOT expose:

- `GET /api/v1/expenses`
- expense history
- expense reporting

MUST NOT implementar HU-021.

POST response MUST ser suficiente para confirmar registro.

### Expense Immutability for HU-020

MUST NOT existir:

- PUT Expense
- PATCH Expense
- DELETE Expense
- Cancel Expense

Cada POST válido representa una nueva transacción.

### Expense Idempotency

No Idempotency-Key.

Dos requests idénticos válidos:

- MUST crear dos IDs distintos.
- MUST NOT deduplicarse por amount/date/description/category.

# API Requirements

### Frozen Endpoint Set

Expected capability surface:

- `GET /api/v1/inventory/balances`
- `GET /api/v1/inventory/movements`
- `POST /api/v1/inventory/movements`
- `GET /api/v1/expense-categories`
- `POST /api/v1/expenses`

No additional public endpoint SHOULD crearse sin necesidad técnica demostrada.

### Authorization Matrix

| Endpoint                 | ADMINISTRADOR | ENCARGADO | MESERO | COCINA | CONTADORA | EMPLEADO |
| ------------------------ | ------------: | --------: | -----: | -----: | --------: | -------: |
| GET inventory/balances   |            Sí |        Sí |     Sí |     Sí |        Sí |       No |
| GET inventory/movements  |            Sí |        Sí |     No |     No |        No |       No |
| POST inventory/movements |            Sí |        Sí |     No |     No |        No |       No |
| GET expense-categories   |            Sí |        Sí |     No |     No |        No |       No |
| POST expenses            |            Sí |        Sí |     No |     No |        No |       No |

Anonymous:

- 401.

Multi-role:

- union.

RN-026 confirma específicamente el acceso de consulta de COCINA a inventario/stock bajo sin permiso de mutación. citeturn697044view3

### ProblemDetails

MUST reutilizar la foundation existente.

Recommended semantics:

400:

- invalid page/pageSize;
- invalid date range;
- invalid movement type for manual API;
- quantity <=0;
- missing/blank/oversized reason;
- amount <=0;
- invalid CashSource;
- future expenseDate;
- invalid description.

401:

- anonymous/invalid auth.

403:

- authenticated but role denied.

404:

- Product missing.
- ExpenseCategory missing.

409:

- Product inactive.
- ExpenseCategory inactive.
- other business-state conflict discovered by current repo conventions.

Stable ProblemDetails codes MAY utilizarse si el current backend ya mantiene esa convention.

Recommended codes:

- `PRODUCT_INACTIVE`
- `MANUAL_MOVEMENT_TYPE_NOT_ALLOWED`
- `EXPENSE_CATEGORY_INACTIVE`

No raw SQL/constraint/stack traces.

### OpenAPI

Every endpoint MUST document:

- bearer auth;
- query params;
- request schema;
- response schema;
- enum values;
- pagination;
- 400/401/403/404/409 where applicable.

`POST inventory/movements` SHOULD producir 201 `InventoryMovementDto`.

`POST expenses` SHOULD producir 201 `ExpenseDto`.

`GET expense-categories` SHOULD producir 200 list.

No SignalR metadata.

No frontend generation.

## Behavior Scenarios

### Scenario 1: Product without balance

Given un Product activo sin InventoryBalance  
When un rol autorizado consulta balances  
Then el Product MUST aparecer con currentQuantity = 0

### Scenario 2: Manual ENTRY

Given Product activo con saldo 10  
When ENCARGADO registra ENTRY quantity 3 con reason válido  
Then InventoryMovement MUST persistir quantityDelta = +3  
And InventoryBalance MUST quedar 13  
And actor/timestamp/reference MUST provenir del backend

### Scenario 3: Manual WRITE_OFF

Given saldo 10  
When ADMINISTRADOR registra WRITE_OFF quantity 3  
Then movement delta MUST ser -3  
And balance MUST quedar 7

### Scenario 4: Negative stock

Given saldo 2  
When WRITE_OFF quantity 5  
Then operation MUST succeed  
And movement MUST ser -5  
And balance MUST quedar -3

### Scenario 5: Invalid signed request

Given quantity -2  
When se solicita ENTRY  
Then backend MUST responder 400  
And MUST persistir cero cambios

### Scenario 6: Reserved movement type

Given manual request type SALE  
When llega al endpoint HU-005  
Then MUST responder 400  
And no movement MUST persistir

### Scenario 7: Reason required

Given ENTRY con reason whitespace-only  
When se valida  
Then MUST responder 400

### Scenario 8: Inactive Product

Given Product inactivo  
When se intenta ENTRY o WRITE_OFF  
Then MUST responder business conflict controlado  
And no balance/movement nuevo MUST persistir

### Scenario 9: Inactive Product history

Given Product fue desactivado después de movimientos previos  
When ADMIN consulta history por Product  
Then movimientos anteriores MUST seguir visibles

### Scenario 10: First-balance race

Given Product activo sin balance  
When dos manual movements concurrentes se ejecutan  
Then MUST existir una sola InventoryBalance  
And dos InventoryMovement  
And saldo final MUST ser suma algebraica de ambos deltas

### Scenario 11: Concurrent ENTRY

Given balance 10  
When ENTRY +4 y ENTRY +6 compiten  
Then ambos MUST persistir  
And saldo final MUST ser 20

### Scenario 12: Concurrent mixed movements

Given balance 10  
When ENTRY +4 y WRITE_OFF 7 compiten  
Then saldo final MUST ser 7  
And no lost update MUST ocurrir

### Scenario 13: Concurrent negative writeoffs

Given balance 2  
When dos WRITE_OFF de 3 compiten  
Then ambos MUST persistir  
And saldo final MUST ser -4

### Scenario 14: Low stock above minimum

Given quantity 10 y minStock 5  
When se proyecta balance  
Then isLowStock MUST ser false

### Scenario 15: Low stock equal minimum

Given quantity 5 y minStock 5  
When se proyecta balance  
Then isLowStock MUST ser true

### Scenario 16: Low stock negative

Given quantity -3 y minStock 5  
When se proyecta balance  
Then isLowStock MUST ser true

### Scenario 17: No min stock

Given minStock null  
When se proyecta cualquier saldo  
Then isLowStock MUST ser false

### Scenario 18: History ordering

Given múltiples movimientos  
When se consulta history sin filtros  
Then MUST ordenarse newest-first con tie-break estable

### Scenario 19: Expense without category

Given ENCARGADO autenticado  
When registra Expense válido con category null  
Then Expense MUST crearse exitosamente

### Scenario 20: Expense with active category

Given ExpenseCategory activa  
When ADMIN crea Expense referenciándola  
Then Expense MUST conservar la FK

### Scenario 21: Expense inactive category

Given Category inactiva  
When se intenta registrar Expense  
Then operation MUST rechazarse  
And historical Expenses existentes MUST permanecer

### Scenario 22: Past ExpenseDate

Given una fecha pasada válida  
When se registra Expense  
Then expenseDate MUST conservarse  
And createdAt MUST reflejar el instante real de registro

### Scenario 23: Future ExpenseDate

Given expenseDate posterior a business date actual  
When se intenta registrar  
Then MUST responder 400

### Scenario 24: Shift resolver absent

Given no existe lifecycle/resolver operativo de Shift  
When se crea Expense  
Then ShiftId MUST ser null  
And no fake Shift MUST crearse

### Scenario 25: Active Shift resolver exists

Given existe resolver real de Shift activo  
When se crea Expense  
Then backend MUST asignar el Shift resuelto  
And client MUST no elegir otro Shift

### Scenario 26: CashSource classification only

Given Expense CASH_DRAWER válido  
When se crea  
Then Expense MUST persistir CashSource  
And no cash balance/CashSession MUST mutar

### Scenario 27: Duplicate Expense

Given dos POST idénticos válidos  
When ambos se ejecutan  
Then MUST existir dos Expense IDs distintos

### Scenario 28: Role union

Given usuario MESERO + ENCARGADO  
When registra InventoryMovement o Expense  
Then MUST estar autorizado por ENCARGADO

## Edge Cases

- Product creado mientras balance query pagina.
- Product desactivado entre validation y write.
- primera balance row creada por otra transaction.
- retry DB tras lock wait.
- deadlock transient del provider.
- quantity con más de cuatro decimales.
- very large quantity fuera de numeric range.
- `-0`/0 decimal.
- reason exactamente 500.
- Product MinStock con precisión legacy diferente.
- movementType futuro existente en history.
- ReferenceType null en movimientos legacy.
- actor sin Employee.
- Identity user display no resoluble.
- history from == to.
- history from > to.
- Product inactive con saldo negativo.
- Product sin balance y minStock 0.
- currentQuantity 0 + minStock 0 → low stock true.
- expenseDate en frontera UTC/local.
- DST no aplica actualmente a La Paz, pero implementation MUST no depender de esa casualidad.
- category desaparece/inactiva entre query y write.
- empty category catalog.
- description exactamente 500.
- CashSource enum casing inválido.
- Shift entity aparece antes de APPLY.
- Shift existe pero no active resolver.
- active Shift resolver retorna ninguno.
- two identical expenses.
- PostgreSQL provider exception durante transaction.
- migrations local baseline distinta a GitHub cache.

## Acceptance Criteria

### Inventory

- GET balances MUST incluir Products sin row de balance.
- Default active MUST excluir inactivos.
- active=false MUST devolver inactivos.
- ENTRY MUST derivar delta positivo.
- WRITE_OFF MUST derivar delta negativo.
- Client MUST no controlar quantityDelta.
- Negative stock MUST persistir.
- Reason MUST ser obligatorio.
- Product inactive MUST impedir nuevos writes.
- History MUST preservar inactivos.
- Ledger MUST no tener edit/delete routes.
- Manual API MUST rechazar cinco movement types no autorizados.
- Low-stock MUST cumplir cinco casos definidos.
- IsLowStock MUST no persistirse.
- Concurrency first-balance MUST dejar una fila.
- ENTRY+ENTRY MUST no perder updates.
- ENTRY+WRITE_OFF MUST no perder updates.
- WRITE_OFF+WRITE_OFF MUST permitir saldo negativo.
- PostgreSQL MUST ser provider de evidencia de concurrency.

### Expenses

- POST Expense MUST permitir ADMINISTRADOR/ENCARGADO.
- Otros role-only MUST recibir 403.
- Amount <=0 MUST fallar.
- Future date MUST fallar.
- Past/today MUST funcionar.
- Description blank MUST fallar.
- Category null MUST funcionar.
- Category missing MUST fallar.
- Category inactive MUST fallar.
- PETTY_CASH MUST funcionar.
- CASH_DRAWER MUST funcionar.
- Client MUST no controlar actor.
- Client MUST no controlar Shift.
- CreatedAt MUST generarse server-side.
- No cash side effect MUST existir.
- Dos POST idénticos MUST crear dos rows.
- No GET Expenses list MUST existir.
- No Expense edit/delete MUST existir.
- No ExpenseCategory CRUD MUST existir.

### Delivery

- Una nueva migration MUST existir si schema falta.
- Full migration chain MUST aplicar en PostgreSQL limpio.
- Snapshot MUST concordar.
- OpenAPI MUST exponer solo los cinco endpoints congelados salvo rutas ya existentes ajenas.
- Inventory tests MUST pasar.
- Expense tests MUST pasar.
- Full backend regression MUST pasar con failed=0.
- Build MUST pasar.
- Security checklist MUST pasar.
- Frontend diff MUST ser cero.
- HU-005/HU-020 MUST no declararse full-stack Done.

## Out of Scope

- HU-006 alerts/config UI.
- HU-012 Sale stock consumption.
- HU-017/018 purchase receipt integration.
- HU-007 production integration.
- HU-021 Expense history.
- HU-025 Shift lifecycle.
- frontend.
- generated TypeScript.
- SignalR.
- cash accounting.
- inventory reversal/edit.
