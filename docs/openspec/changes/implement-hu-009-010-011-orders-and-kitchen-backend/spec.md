# Spec

## Requirements

### General Scope Requirements

- El change MUST implementar HU-009, HU-010 y HU-011 en un único backend change.
- El change MUST NOT implementar frontend.
- El change MUST NOT regenerar `frontend/src/types/api.generated.ts`.
- La implementación MUST reutilizar auth/Identity/JWT/policies foundation actual.
- La implementación MUST preservar `User != Employee`.
- Roles MUST usar la unión de permisos ya existente.
- El rol `CAJERO` MUST NOT crearse ni utilizarse.

### Canonical Order Status

Order MUST utilizar exclusivamente:

- `PENDIENTE`
- `EN_PREPARACION`
- `LISTO`
- `ENTREGADO`
- `CANCELADO`

Transiciones permitidas conceptualmente:

- `PENDIENTE → EN_PREPARACION`
- `EN_PREPARACION → LISTO`
- `LISTO → ENTREGADO`
- `PENDIENTE → CANCELADO`
- `EN_PREPARACION → CANCELADO`

No MUST existir:

- `PENDIENTE → LISTO` como mutation manual;
- `PENDIENTE → ENTREGADO`;
- `EN_PREPARACION → ENTREGADO`;
- `LISTO → CANCELADO`;
- `ENTREGADO → CANCELADO`;
- transitions regresivas.

Excepción de creación:

- Order sin líneas KITCHEN MUST crearse directamente `LISTO`.

### Canonical KitchenCommand Status

KitchenCommand MUST utilizar exclusivamente:

- `PENDIENTE`
- `EN_PREPARACION`
- `LISTA`
- `CANCELADA`

Transiciones permitidas:

- `PENDIENTE → EN_PREPARACION`
- `EN_PREPARACION → LISTA`
- `PENDIENTE → CANCELADA`
- `EN_PREPARACION → CANCELADA`

No MUST existir:

- `PENDIENTE → LISTA`;
- `LISTA → CANCELADA`;
- transitions regresivas.

### Order ↔ KitchenCommand

- Un Order MUST tener como máximo una KitchenCommand.
- Se MUST crear KitchenCommand solo cuando el Order contenga como mínimo una línea Product con `preparationArea = KITCHEN`.
- KitchenCommand MUST contener únicamente los OrderItems KITCHEN.
- BAR MUST NOT crear una comanda separada.
- NONE MUST NOT crear una comanda.
- Un pedido mixto MUST tener una única KitchenCommand que contenga únicamente sus líneas KITCHEN.
- Cuando KitchenCommand exista, ésta MUST gobernar las etapas culinarias globales del Order.
- MESERO MUST NOT poder adelantar manualmente Order a EN_PREPARACION o LISTO.
- No MUST existir un endpoint Order genérico de status.

### No-KITCHEN Creation

- Un Order sin ninguna línea KITCHEN MUST:
  - no crear KitchenCommand;
  - crearse `LISTO`.
- Ese Order MAY ser entregado según reglas normales.
- Dado que HU-011 solo permite cancelación en PENDIENTE/EN_PREPARACION, un Order no-KITCHEN ya creado como LISTO MUST NOT poder cancelarse mediante el flujo ordinario de HU-011.
- Esta consecuencia MUST documentarse; no debe añadirse una excepción silenciosa.

### Shift Compatibility

- APPLY MUST auditar si Shift existe realmente al comenzar.
- Si existe Shift y existe resolver de turno operativo válido:
  - Order MUST referenciar ese Shift;
  - Shift MUST resolverse server-side;
  - Create request MUST NOT aceptar un Shift arbitrario.
- Si Shift no existe:
  - `Order.ShiftId` MUST ser nullable;
  - DB column MUST ser nullable;
  - no MUST existir FK a una tabla inexistente;
  - creación MUST dejar ShiftId null;
  - la desviación MUST documentarse como `nullable until shift lifecycle is implemented`.
- El change MUST NOT implementar HU-025.
- El change MUST NOT crear fake Shift.

### Customer

- Order MUST NOT tener `customerId`.
- CreateOrderRequest MUST NOT aceptar Customer.
- Customer continuará siendo responsabilidad de Sale/HU-012/HU-014.

### Product Eligibility

Para cada item solicitado:

- Product MUST existir.
- Product MUST estar activo.
- Product MUST ser vendible.
- Product MUST tener `SalePrice != null`.
- SalePrice MUST ser `>= 0`.
- Product MUST tener una PreparationArea reconocida:
  - `KITCHEN`
  - `BAR`
  - `NONE`.
- Cliente MUST NOT suministrar unitPrice.
- Cliente MUST NOT suministrar lineTotal.
- Cliente MUST NOT suministrar total.
- Backend MUST usar el SalePrice persistido durante la transacción de creación.
- `OrderItem.UnitPrice` MUST ser snapshot del SalePrice en ese instante.
- Cambios futuros al precio Product MUST NOT cambiar `OrderItem.UnitPrice`.

### Product Compatibility Requirement

Si `Product.IsSellable` continúa ausente en el `develop` local:

- este change MUST incorporarlo en backend;
- default MUST ser false;
- Catalog API backend MUST poder crear/actualizarlo;
- tests Catalog afectados MUST actualizarse;
- no MUST implementarse frontend Catalog;
- no MUST regenerarse TypeScript.

### Quantity

- `quantity` MUST persistirse con semántica decimal.
- DB precision MUST ser `numeric(14,4)`.
- Quantity MUST ser `> 0`.
- Quantity MAY ser fraccionaria.

### Duplicate Products

- Un `productId` MUST aparecer como máximo una vez por Order.
- Create request con el mismo `productId` repetido MUST producir `400 ValidationProblemDetails`.
- El error MUST indicar que quantity debe consolidarse en una única línea.
- DB MUST añadir `UNIQUE(order_id, product_id)`.
- Backend MUST NOT fusionar silenciosamente notes de líneas duplicadas.

### CreateOrderRequest

Contrato:

- `tableReference?: string`
  - trimmed;
  - max 50.
- `notes?: string`
  - max 500.
- `items`
  - required;
  - min count 1.

Cada item:

- `productId: Guid`
- `quantity: decimal > 0`
- `notes?: string`
  - max 300.

El request MUST NOT aceptar:

- status;
- unitPrice;
- lineTotal;
- total;
- createdAt;
- createdByUserId;
- updatedByUserId;
- cancelledByUserId;
- waiterEmployeeId;
- customerId;
- shiftId.

### Order Content Immutability

Después de Create, este change MUST NOT permitir:

- agregar líneas;
- remover líneas;
- cambiar Product;
- cambiar quantity;
- cambiar item notes;
- cambiar Order notes;
- cambiar tableReference.

### Waiter Assignment

`Order.WaiterEmployeeId` MUST ser nullable.

#### Create

- Si actor posee MESERO:
  - MUST resolver su Employee;
  - Employee MUST existir y estar activo;
  - Order MUST autoasignarse a ese Employee.
- Esto aplica aunque el actor tenga además ENCARGADO o ADMINISTRADOR.
- Si actor tiene MESERO pero no existe Employee operativo válido:
  - Create MUST fallar con `409`.
- Si actor es ENCARGADO/ADMINISTRADOR sin MESERO:
  - Order MAY quedar sin responsable.

#### Admin assignment

- Solo ADMINISTRADOR MUST poder asignar/reasignar.
- Assignment target MUST ser un Employee waiter elegible.
- No MUST aceptarse UserId en lugar de EmployeeId.
- Solo Orders no terminales MUST poder asignarse/reasignarse:
  - PENDIENTE;
  - EN_PREPARACION;
  - LISTO.
- ENTREGADO/CANCELADO MUST producir `409`.
- Assignment al mismo waiter SHOULD ser idempotente.

#### Waiter take

- MESERO MUST poder tomar Order sin responsable.
- Actor target MUST derivarse de su Employee; no body con actor id.
- Pedido ya asignado al mismo MESERO SHOULD devolver éxito idempotente.
- Pedido asignado a otro Employee MUST producir `409`.
- ENTREGADO/CANCELADO MUST producir `409`.
- Dos waiters concurrentes MUST producir exactamente un ganador para un pedido inicialmente sin asignación.

#### No release

- MESERO MUST NOT poder liberar/unassign.
- No MUST existir endpoint release.
- ENCARGADO sin ADMINISTRADOR MUST NOT administrar assignment.

### Order Visibility

`GET /orders` y `GET /orders/{id}` MUST permitir:

- MESERO;
- ENCARGADO;
- ADMINISTRADOR.

MESERO MUST ver todos los pedidos, no solamente los asignados.

COCINA sin otro rol permitido MUST utilizar Kitchen endpoints y no Order general read.

### Order Mutation Ownership

Para `deliver` y `cancel`:

- ADMINISTRADOR → cualquier pedido permitido por state.
- ENCARGADO → cualquier pedido permitido por state.
- MESERO → únicamente pedido cuyo WaiterEmployeeId coincida con su Employee.
- Un actor con múltiples roles utiliza unión:
  - MESERO + ENCARGADO recibe alcance global de ENCARGADO.
- MESERO intentando mutar pedido ajeno MUST recibir `403`.

### Delivery

Debe existir:

`POST /api/v1/orders/{id}/deliver`

- Válido desde LISTO.
- Resultado: ENTREGADO.
- MESERO solo own assignment.
- ENCARGADO/ADMINISTRADOR cualquier Order.
- Si Order ya está ENTREGADO:
  - retornar `200` con representación actual;
  - no cambiar audit;
  - no publicar eventos.
- Desde otro estado MUST producir `409`.
- Delivery MUST NOT crear Sale.

### Order Cancellation

Debe existir:

`POST /api/v1/orders/{id}/cancel`

Request:

- `reason?: string max 500`.

Roles:

- MESERO own;
- ENCARGADO global;
- ADMINISTRADOR global.

Permitido desde:

- PENDIENTE;
- EN_PREPARACION.

Prohibido desde:

- LISTO;
- ENTREGADO.

Al cancelar:

- `Order.Status = CANCELADO`;
- `CancelledAt = server now`;
- `CancelledByUserId = authenticated UserId`;
- `CancellationReason = request.reason`;
- audit update MUST actualizarse.

Si ya está CANCELADO:

- operation SHOULD ser idempotente;
- MUST devolver representación actual;
- MUST NOT sustituir:
  - reason;
  - actor;
  - cancelledAt;
- MUST NOT emitir evento nuevo.

### Cancellation with KitchenCommand

Si Order tiene KitchenCommand:

- Command PENDIENTE/EN_PREPARACION MUST cancelarse en la misma transaction.
- Command LISTA MUST impedir Order cancellation.
- Order y Command MUST terminar coherentemente CANCELADO/CANCELADA.
- No MUST persistirse Order CANCELADO con Command PENDIENTE/EN_PREPARACION.

### Kitchen Read

Debe existir:

- `GET /api/v1/kitchen/commands`
- `GET /api/v1/kitchen/commands/{id}`

Roles:

- COCINA;
- MESERO;
- ENCARGADO;
- ADMINISTRADOR.

### Kitchen Manage

Start/ready/cancel MUST permitir:

- COCINA;
- ENCARGADO;
- ADMINISTRADOR.

MESERO sin otro rol de gestión MUST recibir `403`.

### Kitchen Start

Debe existir:

`POST /api/v1/kitchen/commands/{id}/start`

Nueva transición:

- Command PENDIENTE → EN_PREPARACION.
- En la misma transaction:
  - Order PENDIENTE → EN_PREPARACION.
- `StartedAt` MUST establecerse por backend.
- actor MUST registrarse mediante audit disponible.
- Si Command y Order ya están coherentemente en EN_PREPARACION:
  - `200`;
  - sin nuevo evento.
- Desde LISTA/CANCELADA MUST producir `409`.
- No se permite PENDIENTE → LISTA.

### Kitchen Ready

Debe existir:

`POST /api/v1/kitchen/commands/{id}/ready`

Nueva transición:

- Command EN_PREPARACION → LISTA.
- En la misma transaction:
  - Order EN_PREPARACION → LISTO.
- `ReadyAt` MUST establecerse por backend.
- Si ambos ya están coherentemente LISTA/LISTO:
  - `200`;
  - sin evento nuevo.
- Desde PENDIENTE MUST producir `409`.
- Desde CANCELADA MUST producir `409`.

### Kitchen Cancel

Debe existir:

`POST /api/v1/kitchen/commands/{id}/cancel`

Request:

- `reason?: string max 500`.

Permitido desde:

- PENDIENTE;
- EN_PREPARACION.

Debe, en la misma transaction:

- Command → CANCELADA;
- Order → CANCELADO;
- Command.CancelledAt = server time;
- Order.CancelledAt = server time;
- Order.CancelledByUserId = authenticated UserId;
- Order.CancellationReason = reason;
- audit correspondiente.

Si ya está CANCELADA y Order CANCELADO:

- retornar `200`;
- no sobreescribir historial;
- no nuevo SignalR event.

LISTA MUST producir `409`.

### No Redundant Order State Endpoints

El change MUST NOT crear:

- `/orders/{id}/start-preparation`;
- `/orders/{id}/ready`.

Justificación:

- con KitchenCommand, las mutations pertenecen a Kitchen endpoints;
- sin KitchenCommand, Order nace LISTO.

### Transaction Boundaries

Create MUST ser atómico para:

- Order;
- OrderItems;
- KitchenCommand cuando corresponda;
- KitchenCommandItems;
- audit;
- estado inicial.

Start/ready/cancel MUST ser transacciones atómicas.

Assignment/take/deliver MUST proteger su estado mediante transaction/locking cuando exista race relevante.

SignalR MUST ocurrir después del commit.

### Concurrency

Toda mutation concurrent-sensitive MUST revalidar datos bajo row lock.

Lock ordering cuando participan ambos recursos:

1. Order;
2. KitchenCommand.

No MUST adquirirse KitchenCommand primero y luego Order en otro flujo.

Para Kitchen endpoint:

- MAY realizar un lookup preliminar Command → OrderId;
- luego iniciar transaction;
- lock Order;
- lock Command;
- revalidar relación y estados.

### Concurrency Outcomes

#### Two waiter take

- primer commit gana;
- segundo ve waiter asignado distinto;
- segundo `409`.

#### Ready vs cancel

- si ready confirma primero:
  - Order LISTO + Command LISTA;
  - cancel después `409`.
- si cancel confirma primero:
  - Order CANCELADO + Command CANCELADA;
  - ready después `409`.

#### Start vs cancel

Ambas intenciones pueden serializarse válidamente:

- cancel primero → start `409`;
- start primero → start confirma EN_PREPARACION, luego cancel puede confirmar desde EN_PREPARACION → estado final CANCELADO/CANCELADA.

En ningún caso puede quedar combinación imposible.

#### Duplicate start/ready/deliver

- mismo target ya alcanzado coherentemente → `200`;
- no segunda mutation;
- no segundo event.

### Order List

`GET /api/v1/orders`

Query:

- `page=1`
- `pageSize=10`
- `status?`
- `search?`

Rules:

- page >= 1;
- pageSize >= 1;
- max 100;
- status enum validado;
- search trimmed;
- search vacío equivale sin filtro;
- search mínimo sobre `tableReference`;
- default order:
  - `createdAt DESC`;
  - `id DESC` como tie-break estable.

Response MUST reutilizar el `PagedResponse<T>` real del proyecto con:

- items;
- page;
- pageSize;
- totalCount;
- totalPages.

### KitchenCommand List

`GET /api/v1/kitchen/commands`

Query:

- `page=1`
- `pageSize=10`
- `status?`

Rules:

- max 100;
- sin status → incluir terminales y activas;
- no ocultar histórico implícitamente;
- default order:
  - `createdAt ASC`;
  - `id ASC` tie-break.

### OrderDto

MUST incluir como mínimo:

- `id`;
- `shiftId?`;
- `waiterEmployeeId?`;
- `waiterName?`;
- `tableReference?`;
- `status`;
- `notes?`;
- `createdAt`;
- `createdByUserId`;
- `updatedAt?`;
- `updatedByUserId?`;
- `cancelledAt?`;
- `cancelledByUserId?`;
- `cancellationReason?`;
- `hasKitchenCommand`;
- `kitchenCommandId?`;
- `items`;
- `total`.

OrderItemDto MUST incluir:

- `id`;
- `productId`;
- `productName`;
- `quantity`;
- `unitPrice`;
- `lineTotal`;
- `notes?`;
- `preparationArea`.

`lineTotal` y `total` MUST calcularse, no persistirse.

### KitchenCommandDto

MUST incluir:

- `id`;
- `orderId`;
- `status`;
- `tableReference?`;
- `orderNotes?`;
- `createdAt`;
- `startedAt?`;
- `readyAt?`;
- `cancelledAt?`;
- `items`.

KitchenCommandItemDto MUST incluir:

- `orderItemId`;
- `productId`;
- `productName`;
- `quantity`;
- `notes?`.

Kitchen response MUST NOT incluir:

- unitPrice;
- lineTotal;
- Order total;
- customer;
- inventory;
- JWT;
- Identity internals.

### Database Requirements

Nuevas tablas SHOULD utilizar snake_case:

- `orders`
- `order_items`
- `kitchen_commands`
- `kitchen_command_items`.

Primary keys:

- UUID/Guid.

Order status MUST tener CHECK.

KitchenCommand status MUST tener CHECK.

OrderItem MUST tener:

- quantity `numeric(14,4)`;
- CHECK quantity > 0;
- unit_price compatible con Product SalePrice actual;
- CHECK unit_price >= 0;
- UNIQUE `(order_id, product_id)`.

KitchenCommand MUST tener:

- UNIQUE `order_id`.

KitchenCommandItem MUST tener:

- UNIQUE `(kitchen_command_id, order_item_id)`.

FK deletes SHOULD utilizar RESTRICT/NO ACTION para preservar histórico.

### Index Requirements

Añadir sin over-indexing:

Orders:

- status;
- created_at;
- waiter_employee_id;
- shift_id solo si útil/existente.

KitchenCommands:

- status;
- created_at;
- unique order_id.

OrderItems:

- unique `(order_id, product_id)`;
- product_id si el read path lo requiere.

KitchenCommandItems:

- unique `(kitchen_command_id, order_item_id)`.

### Audit

Order:

- CreatedAt;
- CreatedByUserId;
- UpdatedAt;
- UpdatedByUserId;
- CancelledAt;
- CancelledByUserId;
- CancellationReason.

KitchenCommand:

- CreatedAt;
- StartedAt;
- ReadyAt;
- CancelledAt;
- UpdatedByUserId o auditoría equivalente ya usada.

Audit actors MUST derivarse del authenticated User.

Request MUST NOT aceptar actor IDs.

### SignalR

Hub MUST ser:

`/hubs/kitchen`

Hub MUST exigir autenticación.

Hub read/access roles:

- COCINA;
- MESERO;
- ENCARGADO;
- ADMINISTRADOR.

Hub MUST NOT proporcionar métodos de mutación del negocio.

REST MUST ser authority para mutation.

Eventos exactos:

- `KitchenCommandCreated`
- `KitchenCommandUpdated`
- `KitchenCommandCancelled`

Payload mínimo:

- `commandId`;
- `orderId`;
- `status`;
- `occurredAt`.

No incluir data financiera.

Creation:

- emitir `KitchenCommandCreated` después del commit de Create Order cuando realmente se haya creado Command.

Start/Ready:

- emitir `KitchenCommandUpdated` después de commit solo si ocurrió una transición real.

Cancel:

- emitir `KitchenCommandCancelled` después de commit solo si ocurrió una cancelación real.

Idempotent no-op:

- MUST NOT emitir evento duplicado.

Rollback:

- MUST NOT emitir.

Publish failure post-commit:

- MUST NOT revertir DB;
- MUST registrarse técnicamente;
- REST MAY devolver éxito;
- cliente futuro recupera estado con REST/refetch.

### ProblemDetails

El sistema MUST reutilizar ProblemDetails actual.

Mappings:

- 400:
  - request inválido;
  - duplicate productId en Create request;
  - Product no-orderable;
  - waiter assignment target inválido.
- 401:
  - no autenticado.
- 403:
  - rol no autorizado;
  - waiter intenta mutar Order ajeno.
- 404:
  - Order inexistente;
  - KitchenCommand inexistente.
- 409:
  - invalid state transition;
  - already assigned/taken by other waiter;
  - terminal assignment;
  - actor MESERO sin Employee operativo;
  - Order/Command incoherente detectado;
  - concurrency business conflict.

ProblemDetails MUST NOT contener:

- SQL;
- constraint names;
- stack traces;
- tokens;
- connection strings.

### Authorization Matrix

| Capability             |         ADMINISTRADOR |             ENCARGADO | MESERO | COCINA | CONTADORA | EMPLEADO |
| ---------------------- | --------------------: | --------------------: | -----: | -----: | --------: | -------: |
| Create Order           |                    Sí |                    Sí |     Sí |     No |        No |       No |
| List/Detail Orders     |                    Sí |                    Sí |     Sí |     No |        No |       No |
| Assign/Reassign waiter |                    Sí |                    No |     No |     No |        No |       No |
| Take unassigned Order  | Solo si además MESERO | Solo si además MESERO |     Sí |     No |        No |       No |
| Deliver                |                Global |                Global | Propio |     No |        No |       No |
| Cancel Order           |                Global |                Global | Propio |     No |        No |       No |
| List/Detail Kitchen    |                    Sí |                    Sí |     Sí |     Sí |        No |       No |
| Start Kitchen          |                    Sí |                    Sí |     No |     Sí |        No |       No |
| Ready Kitchen          |                    Sí |                    Sí |     No |     Sí |        No |       No |
| Cancel Kitchen         |                    Sí |                    Sí |     No |     Sí |        No |       No |
| Subscribe Kitchen Hub  |                    Sí |                    Sí |     Sí |     Sí |        No |       No |

Multi-role MUST utilizar unión.

### OpenAPI

Cada REST endpoint MUST documentar:

- Bearer auth;
- request;
- query;
- response;
- pagination;
- 400/401/403/404/409;
- 201/200 según corresponda.

SignalR MUST documentarse fuera de OpenAPI.

Este backend change MUST NOT ejecutar `api:generate`.

## Behavior Scenarios

### Scenario 1: MESERO crea pedido KITCHEN

Given un MESERO autenticado con Employee activo y un Product KITCHEN vendible  
When crea un Order válido  
Then el Order MUST crearse PENDIENTE  
And MUST autoasignarse al Employee del actor  
And MUST crear KitchenCommand PENDIENTE  
And el Command MUST contener la línea KITCHEN

### Scenario 2: ENCARGADO crea pedido

Given un ENCARGADO sin rol MESERO  
When crea un Order válido  
Then el Order MAY quedar sin waiterEmployeeId

### Scenario 3: Pedido sin KITCHEN

Given un Order formado solo por Product BAR/NONE orderables  
When se crea  
Then NO MUST crearse KitchenCommand  
And el Order MUST crearse LISTO

### Scenario 4: Pedido mixto

Given un Order con Pizza KITCHEN, Cerveza BAR y Gaseosa NONE  
When se crea  
Then el Order MUST crear una sola KitchenCommand  
And la Command MUST contener únicamente Pizza

### Scenario 5: Snapshot de precio

Given Product salePrice 50.00  
When se crea una línea quantity 2  
Then OrderItem.unitPrice MUST persistirse 50.00  
And cambios posteriores al Product MUST NOT alterar ese snapshot

### Scenario 6: Producto repetido

Given el mismo productId aparece dos veces en CreateOrderRequest  
When se valida el request  
Then MUST responder 400  
And MUST persistirse cero OrderItems

### Scenario 7: Product inactivo

Given Product inactivo  
When se intenta agregar al Order  
Then MUST rechazarse el Create  
And no MUST quedar Order parcial

### Scenario 8: Product sin precio

Given Product vendible pero SalePrice null  
When se intenta crear pedido  
Then MUST responder 400  
And no MUST persistirse Order

### Scenario 9: No inventario

Given balance insuficiente o ausencia de inventory foundation  
When se crea un Order válido  
Then Create MUST NOT bloquearse por stock  
And MUST NOT persistir inventory movement

### Scenario 10: Mesero ve todos

Given MESERO A y un Order asignado a MESERO B  
When A consulta GET `/orders`  
Then el Order MUST ser visible

### Scenario 11: Mesero no puede entregar ajeno

Given un Order LISTO asignado a MESERO B  
When MESERO A llama deliver  
Then MUST recibir 403

### Scenario 12: Mesero entrega propio

Given un Order LISTO asignado al Employee del actor  
When MESERO llama deliver  
Then Order MUST pasar ENTREGADO

### Scenario 13: Deliver repetido

Given Order ya ENTREGADO  
When se repite deliver  
Then MUST devolver 200 con estado actual  
And no MUST duplicar audit/event

### Scenario 14: Take exitoso

Given Order sin waiter y no terminal  
When MESERO llama take  
Then el Order MUST quedar asignado a su Employee

### Scenario 15: Concurrent take

Given Order sin waiter  
When dos MESEROS ejecutan take concurrentemente  
Then exactamente uno MUST obtener la asignación  
And el otro MUST recibir 409

### Scenario 16: Take repetido por el ganador

Given Order ya asignado al mismo MESERO  
When ese MESERO repite take  
Then SHOULD recibir 200 idempotente

### Scenario 17: Admin assign

Given Order no terminal y Employee waiter válido  
When ADMINISTRADOR realiza assignment  
Then waiterEmployeeId MUST actualizarse

### Scenario 18: ENCARGADO intenta assign

Given ENCARGADO sin ADMINISTRADOR  
When intenta assignment administrativo  
Then MUST recibir 403

### Scenario 19: Cocina inicia

Given Command PENDIENTE y Order PENDIENTE  
When COCINA ejecuta start  
Then en una transaction Command MUST quedar EN_PREPARACION  
And Order MUST quedar EN_PREPARACION

### Scenario 20: Cocina no puede saltar a ready

Given Command PENDIENTE  
When COCINA ejecuta ready  
Then MUST recibir 409  
And ambos estados MUST permanecer sin cambios

### Scenario 21: Cocina marca lista

Given Command EN_PREPARACION y Order EN_PREPARACION  
When COCINA ejecuta ready  
Then Command MUST quedar LISTA  
And Order MUST quedar LISTO en la misma transaction

### Scenario 22: Order cancel pendiente

Given Order PENDIENTE sin conflicto y actor autorizado  
When se ejecuta cancel  
Then Order MUST quedar CANCELADO  
And audit cancellation MUST persistirse

### Scenario 23: Order cancel sincroniza Command

Given Order EN_PREPARACION + Command EN_PREPARACION  
When ENCARGADO cancela el Order  
Then ambos recursos MUST quedar CANCELADO/CANCELADA en una transaction

### Scenario 24: Cocina cancela

Given Command EN_PREPARACION y Order EN_PREPARACION  
When COCINA cancela la Command  
Then Command MUST quedar CANCELADA  
And Order MUST quedar CANCELADO  
And Order cancellation actor MUST ser el User autenticado

### Scenario 25: Cancel después de ready

Given Order LISTO + Command LISTA  
When cualquier actor intenta cancel  
Then MUST recibir 409

### Scenario 26: Cancel repetido

Given Order CANCELADO con historial existente  
When se repite cancel con otro reason  
Then MUST devolver 200 actual  
And MUST conservar actor/reason/timestamps originales  
And no MUST publicar otro event

### Scenario 27: Ready gana race

Given ready y cancel compiten  
When ready obtiene locks y confirma primero  
Then Order/Command MUST quedar LISTO/LISTA  
And cancel posterior MUST recibir 409

### Scenario 28: Cancel gana race

Given ready y cancel compiten  
When cancel confirma primero  
Then Order/Command MUST quedar CANCELADO/CANCELADA  
And ready posterior MUST recibir 409

### Scenario 29: Start y cancel concurrentes

Given start y cancel compiten  
When las operaciones se serializan bajo lock  
Then el estado final MUST ser coherente  
And nunca MUST existir Order EN_PREPARACION con Command CANCELADA ni Order CANCELADO con Command EN_PREPARACION

### Scenario 30: SignalR create

Given una Order creation que genera Command y commit exitoso  
When finaliza la transacción  
Then MUST publicarse exactamente un `KitchenCommandCreated`

### Scenario 31: Rollback no publica

Given Create falla antes del commit  
When la transaction hace rollback  
Then NO MUST publicarse `KitchenCommandCreated`

### Scenario 32: SignalR failure

Given DB commit exitoso y notifier falla  
When termina la request  
Then los datos MUST continuar persistidos  
And la operación REST MAY finalizar con éxito  
And el fallo técnico MUST quedar registrado

### Scenario 33: Kitchen-safe response

Given MESERO/COCINA consulta una Command  
When recibe KitchenCommandDto  
Then NO MUST contener unitPrice, lineTotal ni Order total

### Scenario 34: Shift inexistente

Given el preflight confirma que Shift no existe  
When se crea Order  
Then shiftId MUST persistirse null  
And no MUST crearse Shift ficticio

## Edge Cases

- Empty items.
- Duplicate product IDs.
- Product missing.
- Product inactive.
- Product non-sellable.
- Product with null SalePrice.
- Product with invalid/null PreparationArea.
- Product price exactly 0.
- Decimal quantity with four decimals.
- Quantity > DB precision.
- TableReference whitespace-only.
- Notes at exact max length.
- User MESERO with no Employee.
- User MESERO with inactive Employee.
- Assignment target not found.
- Assignment target Employee inactive.
- Assignment target User inactive.
- Assignment target User lacks MESERO.
- Multi-role MESERO+ENCARGADO.
- Multi-role MESERO+ADMINISTRADOR.
- Unassigned Order LISTO.
- Take on LISTO.
- Take on ENTREGADO.
- Assignment on CANCELADO.
- Assign same waiter twice.
- Admin reassign concurrent with take.
- Order command missing unexpectedly.
- Command references wrong Order due corrupted data.
- Order status/Command status inconsistent due legacy corruption.
- Open Command started previous request but notifier failed.
- SignalR subscriber disconnect.
- Idempotent ready after notification already emitted.
- Order cancellation reason null.
- No-KITCHEN Order cancellation attempted while LISTO.
- Pagination page past final result.
- Invalid status filter.
- Search empty.
- Search different casing.
- Race start/cancel.
- Race ready/cancel.
- Double deliver.
- Double cancel.
- DB constraint unique order/product race.
- Create DB failure after Order but before CommandItems.
- Shift appears in `develop` before future APPLY.

## Acceptance Criteria

### Domain/Persistence

- Exact state enums MUST exist.
- DB status checks MUST exist.
- OrderItem quantity check MUST exist.
- UnitPrice check MUST exist.
- Unique Order/Product MUST exist.
- Unique Order/Command MUST exist.
- Unique Command/OrderItem pair MUST exist.
- No historical migration MUST be edited.
- Shift strategy MUST follow real preflight.
- `Product.IsSellable` compatibility MUST be resolved if still missing.

### Orders

- Create KITCHEN order MUST create PENDIENTE + Command.
- Create no-KITCHEN order MUST create LISTO without Command.
- Mixed order Command MUST contain only KITCHEN lines.
- Create MUST be transactional.
- Price MUST be backend snapshot.
- Duplicate product MUST be 400.
- No inventory movement MUST occur.
- List/detail MUST work.
- Pagination default 10/max100 MUST work.
- MESERO MUST see all Orders.
- Assignment/take MUST work.
- Take concurrency MUST be proven.
- Deliver MUST work only from LISTO.
- Ownership MUST be backend-enforced.

### Kitchen

- Read matrix MUST work.
- Start MUST synchronize Command/Order.
- Ready MUST synchronize Command/Order.
- MESERO state mutation MUST be 403.
- Invalid skips MUST be 409.
- Kitchen response MUST omit financial fields.

### Cancellation

- PENDIENTE cancel MUST work.
- EN_PREPARACION cancel MUST work.
- LISTO/ENTREGADO cancel MUST be rejected.
- Order cancel MUST atomically cancel active Command.
- Kitchen cancel MUST atomically cancel Order.
- Repeated cancel MUST not overwrite history.
- Race tests MUST leave only coherent state combinations.

### Realtime

- Hub MUST require auth.
- Hub roles MUST be enforced.
- Creation/start/ready/cancel MUST publish only after commit.
- Failed transactions MUST publish zero events.
- Idempotent retries MUST publish zero duplicate events.
- Payload MUST omit financial fields.
- Notifier failure post-commit MUST not roll back persisted state.

### Quality

- PostgreSQL integration tests MUST pass.
- All discovered backend tests MUST pass.
- Failed tests MUST equal 0.
- Backend build MUST pass.
- OpenAPI MUST represent all REST endpoints.
- Security review MUST pass.
- Frontend MUST remain untouched except no change is expected.
- No `api.generated.ts` regeneration MUST occur.

### Documentation

- HU-009 MUST state `BACKEND COMPLETE / FRONTEND PENDING`.
- HU-010 MUST state `BACKEND COMPLETE / FRONTEND PENDING`.
- HU-011 MUST state `BACKEND COMPLETE / FRONTEND PENDING`.
- Backend implementation documentation MUST list all endpoints.
- Backend implementation documentation MUST list every modified/created versioned file grouped by layer.
- Visual evidence MUST be marked pending for the frontend change.
- No story MUST be declared end-to-end Done by this backend change.

## Out of Scope

- Frontend.
- TypeScript generation.
- Sale.
- Customer Order relation.
- Inventory movements.
- Stock blocking.
- Cash.
- Shift lifecycle.
- Table master.
- Post-create Order editing.
- Partial delivery.
- Per-item readiness.
- BAR command module.
- Outbox.
- Browser SignalR client.
