# Spec

## Requirements

### Baseline and Contract

- APPLY MUST auditar la rama `develop` real.
- APPLY MUST confirmar que backend HU-009/HU-010/HU-011 está integrado.
- APPLY MUST confirmar todos los endpoints REST finales mediante OpenAPI/runtime.
- APPLY MUST confirmar `/hubs/kitchen`.
- APPLY MUST NOT implementar contra DTOs inventados.
- APPLY MUST ejecutar `pnpm run api:generate` antes de construir los adapters definitivos.
- `api.generated.ts` MUST NOT editarse manualmente.
- Si backend sigue ausente, APPLY MUST detener este change como `UNRECOVERABLE_RUNTIME_BLOCKER`.
- Un defecto menor de metadata OpenAPI MAY corregirse únicamente si impide consumir el contrato ya implementado.
- El frontend MUST NOT rediseñar lógica backend.

### Visual References

- La futura sesión MUST inspeccionar todos los archivos de `HU-009_HU-010_HU-011.zip`.
- MUST crear un inventario 100 %.
- Cada imagen MUST clasificarse por:
  - screen;
  - viewport;
  - state;
  - hierarchy;
  - action;
  - modal;
  - keep/adapt/omit.
- Las imágenes MUST ser autoridad para presentación.
- Backend/OpenAPI MUST ser autoridad para funcionalidad.
- Una acción mostrada en Figma sin backend MUST omitirse.
- MUST NOT añadirse deshabilitada como placeholder.

### API Architecture

Frontend MUST conservar:

generated types
→ endpoint registry
→ shared httpClient
→ feature API
→ TanStack Query
→ UI

Frontend MUST NOT:

- crear Axios/fetch wrapper paralelo;
- pasar token a APIs;
- construir Bearer;
- leer refresh cookie;
- crear segundo QueryClient;
- persistir JWT.

### Routes

MUST existir:

- `/pedidos`
- `/pedidos/nuevo`
- `/pedidos/:id`
- `/cocina`

MUST NOT existir:

- `/estado-cocina`.

### Route Authorization

Pedidos routes MUST permitir:

- MESERO;
- ENCARGADO;
- ADMINISTRADOR.

Pedidos routes MUST denegar:

- COCINA-only;
- CONTADORA-only;
- EMPLEADO-only.

`/cocina` MUST permitir:

- COCINA;
- MESERO;
- ENCARGADO;
- ADMINISTRADOR.

`/cocina` MUST denegar:

- CONTADORA-only;
- EMPLEADO-only.

Multi-role MUST usar unión.

Existing guards MUST reutilizarse.

### Navigation

Navegación central MUST añadir:

- Pedidos;
- Cocina.

Pedidos allowedRoles:

- MESERO;
- ENCARGADO;
- ADMINISTRADOR.

Cocina allowedRoles:

- COCINA;
- MESERO;
- ENCARGADO;
- ADMINISTRADOR.

`Nuevo pedido` SHOULD ser CTA de Pedidos, no módulo principal.

No MUST añadirse navegación a módulos inexistentes.

### Query Keys

Orders MUST usar keys equivalentes a:

- all;
- lists;
- list(filters);
- details;
- detail(id).

Order list filters MUST incluir en key:

- page;
- pageSize;
- status;
- normalized search.

Kitchen MUST usar:

- all;
- lists;
- list(filters);
- detail(id) cuando realmente se use detail query.

Kitchen list filters MUST incluir:

- page;
- pageSize;
- status.

### Orders List

`/pedidos` MUST incluir:

- PageHeader;
- New Order CTA;
- search;
- status filter;
- paginated data;
- status;
- waiter;
- table/reference;
- useful timestamp;
- actions;
- loading;
- base empty;
- filtered empty;
- error.

Filtering MUST ser server-side.

Cambiar search/status MUST resetear page a 1.

Search placeholder SHOULD ser equivalente a:

`Buscar por mesa o referencia...`

Status filter MUST presentar:

- Todos
- Pendiente
- En preparación
- Listo
- Entregado
- Cancelado

No MUST implementarse toggle Activos/Histórico.

### Display ID

Routing MUST usar GUID completo.

UI MAY derivar un display ID corto determinista.

Display ID MUST NOT:

- persistirse;
- enviarse al backend;
- usarse como route id;
- prometerse como searchable si backend no lo soporta.

### New Order

`/pedidos/nuevo` MUST incluir:

- header;
- Mesa / referencia;
- general notes;
- Product catalog;
- Product search;
- cart;
- quantities;
- line notes;
- draft total;
- one Create CTA.

MUST NOT incluir:

- waiter selector;
- Order status;
- Customer;
- Shift selector;
- inventory;
- taxes;
- payment.

### Table Reference

- MUST ser free-text.
- MUST ser optional.
- MUST respetar max contractual.
- MUST NOT modelarse con fake table master.

### Catalog

- MUST consumir Catalog backend real.
- Solo Products contractualmente activos/sellable/priced MUST estar disponibles.
- SHOULD usar server filters si existen.
- No MUST inventarse stock/disponibilidad.

### Categories

- Category filtering MAY implementarse únicamente si Product DTO/related contract expone datos suficientes.
- No MUST hardcodearse una taxonomía tomada de screenshots.

### Product Images

- Si backend no expone image data, MUST usarse placeholder/icono neutro.
- No MUST presentarse una imagen hardcodeada como Product real.

### Cart Semantics

- Draft MUST vivir en memoria React.
- MUST NOT persistirse.
- Cart MUST tener como máximo una línea por ProductId.
- Re-agregar Product MUST incrementar quantity de la línea existente.
- Quantity principal MUST usar stepper unitario.
- Minimum visible quantity MUST ser 1.
- Remove MUST ser una acción separada o comportamiento inequívoco.
- Notes MUST pertenecer a la línea consolidada.
- General notes MUST permanecer separadas.
- El tipo enviado MUST continuar siendo compatible con decimal backend.

### Create Request

MUST derivarse del generated request.

Conceptualmente MUST contener únicamente:

- tableReference;
- notes;
- items:
  - productId;
  - quantity;
  - notes.

MUST NOT enviar:

- price;
- total;
- status;
- actor;
- waiter;
- customer;
- fake Shift.

### Create UI

Antes de POST:

- MUST NOT presentar `PENDIENTE` como estado persisted.
- MAY mostrar `Nuevo pedido` o `Borrador`.

MUST existir un único CTA:

- `Crear pedido` o equivalente.

No MUST existir:

- Guardar;
- Guardar y enviar a cocina

como flows distintos.

### Draft Total

- MAY calcularse para presentation usando price de catálogo.
- MUST NOT enviarse al backend.
- Después de Create, OrderDto.total MUST ser autoridad.
- No tax/service/tip.

### Create Success

Success MUST:

- invalidate Orders.
- invalidate Kitchen cuando exista o pueda haberse creado Command.
- navigate `/pedidos/{id}` usando real returned id.
- cargar authoritative detail.

### Order Detail

MUST mostrar:

- ID display;
- status;
- table/reference;
- waiter;
- notes;
- createdAt;
- items;
- quantities;
- item notes;
- prices;
- line totals;
- total;
- cancellation info;
- Kitchen relation si contrato la expone;
- authorized actions.

MUST ser read-only respecto a contenido.

MUST NOT incluir:

- Add Item;
- Remove persisted Item;
- edit quantity;
- edit notes;
- edit table;
- Send New Items;
- Pre-cuenta;
- Checkout;
- Sale.

### Assignment

Assignment UI MUST ser visible únicamente para ADMINISTRADOR.

Target list SHOULD obtenerse desde HU-002:

- role=MESERO;
- active=true.

Frontend MUST utilizar real `employeeId`.

MUST NOT inventar endpoint waiters.

ENCARGADO sin ADMIN MUST no ver assignment.

MESERO sin ADMIN MUST no ver assignment.

No optimistic assignment.

Success MUST invalidate relevant Order queries.

409 MUST refetch.

### Take

MESERO MAY ver `Tomar pedido` cuando:

- waiter unassigned;
- status PENDIENTE, EN_PREPARACION o LISTO.

No MUST mostrarse para:

- ENTREGADO;
- CANCELADO.

Take MUST NOT enviar waiterEmployeeId.

No optimistic Take.

409 MUST:

- mostrar mensaje;
- refetch;
- actualizar waiter real;
- no retry automático.

### Order Action Matrix

MESERO:

- sees all Orders;
- unassigned nonterminal → Take;
- own PENDIENTE → Cancel;
- own EN_PREPARACION → Cancel;
- own LISTO → Deliver;
- own terminal → read-only;
- other waiter Order → read-only.

ENCARGADO:

- global Cancel where backend allows;
- global Deliver from LISTO;
- no assignment.

ADMINISTRADOR:

- global Cancel;
- global Deliver;
- assignment/reassignment.

UI MUST NOT considerarse security authority.

### Cancellation

Dialog MUST incluir:

- `Cancelar pedido`;
- reason optional;
- helper equivalent to `Opcional, pero recomendado.`;
- Back;
- Confirm cancel.

Empty reason MUST permitirse.

Success MUST invalidate Orders.

Si Kitchen relation existe/podría haberse afectado:

- invalidate Kitchen.

409:

- human message;
- authoritative refetch.

### Delivery

UI action:

`Marcar como entregado`

MUST aparecer solo si capability/state lo permite.

Success MUST invalidate Order.

MUST NOT:

- create Sale;
- open payment;
- navigate checkout.

### Kitchen Page

MUST existir una única `/cocina`.

Operational roles:

- COCINA;
- ENCARGADO;
- ADMINISTRADOR.

Read-only role:

- MESERO.

MUST reutilizar los mismos datos/componentes base.

### KDS Desktop

MUST disponer de tres grupos:

- PENDIENTE;
- EN_PREPARACION;
- LISTA.

Visual labels MAY adaptarse.

Cards MUST mostrar únicamente datos backend reales:

- compact id;
- table/reference;
- elapsed time;
- items;
- quantities;
- notes;
- status;
- permitted actions.

MUST NOT mostrar:

- price;
- total;
- priority;
- progress;
- station;
- estimated time;
- dispatch location;
- fake shift.

### KDS Mobile

At 403px/360px:

- MUST NOT conservar tres columnas completas horizontalmente.
- MUST usar tabs/segmented state navigation o patrón equivalente.
- Cards MUST ser verticales.
- Actions/permissions MUST ser equivalentes.

### KDS Cancelled

- Cancelled MUST NOT tener columna principal.
- Cancelled commands MUST desaparecer de active KDS tras refetch.
- No history view.

### KDS Pagination

Recommended:

- una query por status;
- pageSize 100 si backend final permite 100.

Si `totalPages > 1`:

- MUST existir `Cargar más` o estrategia explícita equivalente.
- MUST NOT ignorarse page >1.

### Kitchen Actions

PENDIENTE:

- operational roles → Start.

EN_PREPARACION:

- operational roles → Ready.

PENDIENTE/EN_PREPARACION:

- operational roles → Cancel.

LISTA:

- read-only.

MESERO:

- no mutation controls.

No MUST existir `Retirar ya`.

### ElapsedTime

Debe existir un componente/hook reusable.

MUST recibir un timestamp backend.

MUST calcular:

`max(0, Date.now() - timestamp)`

MUST actualizar presentación aproximadamente una vez por segundo.

MUST volver a calcular desde Date.now cada tick.

MUST NOT usar un contador acumulado como autoridad.

MUST limpiar interval al unmount.

MUST NOT:

- fetch;
- invalidate Query;
- hacer polling;
- usar SignalR por tick.

Formatting SHOULD ser legible:

- mm:ss bajo 1h;
- horas/minutos para duraciones largas;

o ajustarse visualmente a las referencias.

MUST NOT usar `aria-live` por segundo.

### SignalR

Frontend MUST consumir:

`/hubs/kitchen`

o la ruta exacta real auditada.

MUST usar una única connection compartida.

MUST usar automatic reconnect.

MUST reutilizar token in-memory actual.

MUST NOT usar:

- localStorage;
- sessionStorage;
- cookie JS refresh;
- token prop por componente.

Si session coordinator no expone accessor seguro:

- MAY añadirse accessor mínimo infrastructure-level.

### SignalR Events

Eventos MUST tomarse del backend real.

Esperados:

- KitchenCommandCreated;
- KitchenCommandUpdated;
- KitchenCommandCancelled.

Event handlers MUST invalidar/refetchear.

Events MUST NOT convertirse en authoritative local state.

Created:

- invalidate Kitchen;
- invalidate Orders cuando corresponda.

Updated:

- invalidate Kitchen;
- invalidate Orders.

Cancelled:

- invalidate Kitchen;
- invalidate Orders.

### Reconnect

On reconnect MUST:

- invalidate Orders;
- invalidate Kitchen;
- refetch por flujo normal.

No event replay manual.

### SignalR Connection Status

KDS MUST mostrar estado real:

- Conectado;
- Reconectando;
- Sin conexión.

No MUST hardcodearse `SINCRONIZADO`.

### Fallback Polling

Connected:

- MUST desactivar fallback polling.

Reconnecting/Disconnected:

- operational queries SHOULD usar ~30s refetch interval.

On reconnect:

- invalidate/refetch una vez;
- stop fallback.

Timer local MUST ser independiente.

### Mutations

Relevant mutations:

- create;
- assign;
- take;
- deliver;
- order cancel;
- kitchen start;
- kitchen ready;
- kitchen cancel.

No business mutation MUST usar optimistic update.

### 409 UX

409 MUST tratarse como race/conflict esperado.

Examples:

- otro mesero tomó Order;
- Command cambió;
- Order ya no cancelable;
- Order reassigned.

UX MUST:

- mostrar mensaje humano;
- conservar aplicación estable;
- invalidate/refetch;
- no retry automáticamente.

Stable backend `code` SHOULD utilizarse cuando exista.

No raw ProblemDetails.

### Other Error UX

400:

- validation feedback.

401:

- auth foundation existente.

403:

- Forbidden/permission feedback.

404 detail:

- Not Found state + regreso.

5xx/network:

- controlled error + Retry.

### Loading

MUST existir para:

- Orders;
- detail;
- Catalog;
- KDS.

Mutation pending MUST afectar únicamente controles relevantes.

### Empty States

Orders base empty:

- no Orders;
- CTA New Order.

Orders filtered empty:

- filtros/search sin coincidencias;
- clear filters.

Kitchen:

- empty por columna/tab.

### Responsive

MUST validarse:

- desktop;
- 403px;
- 360px.

Orders:

- desktop structured list/table;
- mobile cards.

New Order:

- desktop catalog+summary;
- mobile stacked.

Detail:

- responsive stack.

KDS:

- desktop columns;
- mobile tabs/cards.

No blocking horizontal overflow.

### Accessibility

MUST existir:

- labels;
- semantic buttons;
- focus-visible;
- keyboard support;
- accessible dialog focus management;
- accessible names para icon-only buttons;
- textual status además de color;
- reasonable mobile touch targets.

Timer MUST not announce every tick.

### Visual Fidelity

Visual implementation SHOULD preserve:

- Fratelli dark theme;
- orange accent;
- hierarchy;
- cards;
- filters;
- tables;
- KDS structure;
- modal intent;
- responsive intent.

Pixel-perfect MUST NOT ser DoD.

Minor polish MAY quedar:

`DEFERRED_NON_BLOCKING`

solo si no afecta usabilidad.

## Behavior Scenarios

### Scenario 1: Contract generation

Given backend final integrado  
When se ejecuta `pnpm run api:generate`  
Then Orders/Kitchen types MUST generarse sin edición manual

### Scenario 2: MESERO routing

Given MESERO autenticado  
When navega  
Then Pedidos y Cocina MUST estar disponibles  
And Cocina MUST ser read-only

### Scenario 3: COCINA routing

Given COCINA-only autenticado  
When abre Cocina  
Then MUST acceder  
When intenta Pedidos  
Then MUST recibir Forbidden

### Scenario 4: Filter reset

Given Orders page está en page >1  
When cambia search/status  
Then page MUST resetear a 1  
And nueva query MUST ir al backend

### Scenario 5: Duplicate cart add

Given Product X quantity 1 ya está en cart  
When se agrega Product X  
Then MUST existir una sola línea quantity 2

### Scenario 6: Create request purity

Given draft válido  
When Create se envía  
Then payload MUST no contener price/status/actor/waiter/total

### Scenario 7: Kitchen create result

Given backend crea Order con KITCHEN  
When success devuelve PENDIENTE  
Then frontend MUST respetar PENDIENTE  
And navigate al detail

### Scenario 8: No-Kitchen create result

Given backend devuelve LISTO  
When create termina  
Then frontend MUST mostrar LISTO  
And MUST NOT asumir PENDIENTE

### Scenario 9: Admin assignment

Given ADMIN y Order asignable  
When selecciona MESERO  
Then frontend MUST esperar backend  
And refetch after success

### Scenario 10: Take race

Given MESERO intenta Take  
When backend responde 409 porque otro MESERO ganó  
Then UI MUST mostrar conflicto  
And refetch authoritative Order  
And MUST NOT mostrar optimistic ownership

### Scenario 11: Own delivery

Given MESERO posee Order LISTO  
When ejecuta Deliver  
Then frontend MUST invalidar/refetchear after success

### Scenario 12: Other waiter Order

Given Order pertenece a otro MESERO  
When se renderiza para current MESERO  
Then Cancel/Deliver MUST no mostrarse

### Scenario 13: Optional cancel reason

Given Order cancelable  
When usuario confirma con reason vacío  
Then mutation MUST permitirse

### Scenario 14: MESERO KDS

Given MESERO abre Cocina  
When ve Command PENDIENTE  
Then MUST ver estado/items/timer  
And MUST no ver Start/Ready/Cancel

### Scenario 15: COCINA KDS

Given COCINA abre Command PENDIENTE  
When selecciona Start  
Then frontend MUST esperar backend  
And refetch Orders + Kitchen

### Scenario 16: Lista KDS

Given Command LISTA  
When card renderiza  
Then MUST no existir `Retirar ya`

### Scenario 17: Local elapsed timer

Given timestamp 42 segundos atrás  
When ElapsedTime renderiza  
Then MUST derivar tiempo del clock  
And MUST generar cero requests

### Scenario 18: Timer after browser throttling

Given interval no corre durante varios segundos  
When vuelve a ejecutarse  
Then MUST recalcular contra Date.now  
And MUST no acumular drift

### Scenario 19: SignalR Created

Given connection Connected  
When llega Created  
Then Kitchen MUST invalidarse  
And REST MUST producir state final

### Scenario 20: SignalR Updated

Given llega Updated  
When handler se ejecuta  
Then Orders y Kitchen MUST invalidarse

### Scenario 21: Reconnect

Given la conexión perdió eventos  
When reconecta  
Then Orders y Kitchen MUST refetchearse

### Scenario 22: Fallback

Given connection Disconnected  
When transcurren ~30s  
Then operational queries SHOULD refetch

### Scenario 23: Connected polling disabled

Given SignalR está Connected  
When pasan 30s  
Then fallback logic MUST no provocar polling

### Scenario 24: Timer does not poll

Given ElapsedTime hace 10 ticks  
When se inspeccionan requests  
Then MUST existir cero requests ocasionadas por esos ticks

### Scenario 25: Mobile KDS

Given viewport 360px  
When Cocina renderiza  
Then MUST mostrar tabs/cards sin tres columnas horizontales

### Scenario 26: Missing order

Given `/pedidos/:id` devuelve 404  
When UI renderiza  
Then MUST mostrar Not Found y navegación de regreso

## Edge Cases

- Backend aún no mergeado.
- OpenAPI runtime no coincide con source visible.
- Generation script falla.
- Generated naming diferente del conceptual.
- Product contract no expone category name.
- Product sin imagen.
- doble click Add.
- Product deja de ser sellable antes de Create.
- Create 400.
- invalid route GUID.
- page > totalPages después de mutation.
- waiter desaparece.
- waiter User sin employeeId.
- concurrent Take.
- concurrent Deliver.
- cancel 409.
- kitchen transition 409.
- SignalR antes de auth bootstrap.
- token refresh durante reconnect.
- repeated SignalR event.
- reconnect loop.
- KDS page totalPages >1.
- background refetch fails con previous data.
- null tableReference.
- long notes.
- negative elapsed por clock skew.
- tab asleep.
- 360px modal viewport.
- visual reference contiene funciones no contractuales.

## Acceptance Criteria

- Backend gate MUST pasar antes de feature implementation.
- Visual ZIP MUST ser auditado 100 % antes de freeze visual.
- Generated types MUST regenerarse.
- Generated file MUST no tener edits manuales.
- Routes MUST coincidir con spec.
- Role guards MUST pasar.
- Navigation MUST mostrar solo módulos implementados.
- Orders list MUST usar backend filtering.
- Cart MUST mantener Product único.
- Create MUST no enviar fields prohibidos.
- Detail MUST ser read-only.
- Assignment MUST ser ADMIN-only.
- Take MUST manejar 409 con refetch.
- No business mutation MUST ser optimistic.
- KDS MESERO MUST ser read-only.
- Timer MUST generar cero requests.
- SignalR MUST usar una conexión compartida.
- Events MUST causar invalidation/refetch.
- Reconnect MUST refetchear.
- Fallback polling MUST activarse solo cuando realtime no está healthy.
- Desktop/403/360 MUST ser usable.
- Forbidden visual functions MUST estar ausentes.
- Accessibility básica MUST pasar.
- All automated quality gates MUST pasar.
- Manual visual PASS MUST no declararse antes de validación real.

## Out of Scope

- Post-create editing.
- Server item mutations.
- Pre-cuenta.
- Sale.
- Payment.
- Cash.
- Inventory.
- Customer.
- Tax/service.
- BAR KDS.
- Priority/progress/station.
- Table master.
- Print.
- Shift UI.
- Partial/per-item readiness.
- Offline support.
