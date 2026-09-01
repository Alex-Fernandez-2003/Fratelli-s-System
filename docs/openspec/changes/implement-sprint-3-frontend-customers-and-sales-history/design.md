# Design

## Baseline Audit

### Estado verificable desde la superficie disponible

El snapshot público actual de `develop` confirma:

- repositorio organizado en `backend/`, `frontend/`, `docs/`;
- frontend React/TypeScript/Vite;
- `pnpm@11.18.0`;
- React 19.2.x;
- React Router 7.18.x;
- TanStack Query 5.101.x;
- Lucide;
- Vitest/Testing Library;
- generated types en `frontend/src/types/api.generated.ts`;
- scripts `format:check`, `typecheck`, `lint`, `test`, `build`, `api:generate`. citeturn152392view0turn386962view4

La arquitectura pública visible usa:

- `frontend/src/features/`;
- `frontend/src/components/{atoms,molecules,organisms,templates}`;
- `frontend/src/lib/{api,auth,query,realtime}`;
- `AppRoutes.tsx`;
- `features/navigation.tsx`;
- `RequireAuth`;
- `RequireAnyRole`;
- navegación centralizada con `readRoles`;
- unión de roles mediante `allowed.some(role => roles.includes(role))`;
- match de child routes mediante `startsWithRoute`;
- sidebar desktop;
- header+drawer mobile con Escape y focus return. citeturn386962view0turn386962view1turn386962view2turn386962view3turn460683view0turn460683view1turn460683view2

La base pública visible también ofrece un `DataTable` genérico con loading/error/empty, `EmptyState`, `Spinner`, FormFields y feedback reutilizable. citeturn293499view0turn460683view3

### Límite del audit

No existe en esta sesión acceso shell/read-only al working tree LOCAL solicitado. El GitHub público visible no contiene Customers/Sales History en el route tree examinado y no permite verificar los schemas Sprint 3 en `api.generated.ts`, mientras el usuario declara que esos contratos sí existen localmente.

Por tanto:

- Branch local: no verificado.
- HEAD local: no verificado.
- Working tree local: no verificado.
- Generated Sprint 3 API local: no inspeccionado.
- Archive local `implement-sprint-3-complete-backend`: no inspeccionado directamente.
- ConfirmSale local post-Sprint-2/Sprint-3: no inspeccionado.
- Customer/Sales operation names exactos: no congelados.
- Este desajuste es `RESEARCH REQUIRED`, no una nueva decisión de producto.

El APPLY MUST comenzar revalidando esos puntos antes de editar código.

## Components Touched

### Reutilizar

- Auth/session provider existente.
- `RequireAuth`.
- `RequireAnyRole` o guard actual equivalente.
- navigation config central.
- authenticated AppShell/sidebar/mobile drawer.
- shared HTTP client.
- generated API types.
- TanStack Query provider.
- Button/IconButton/Input/FormFields.
- Feedback/Alert/EmptyState/Spinner.
- `DataTable` para Customers y Sales History desktop si sigue siendo adecuado.
- Card primitives.
- Pagination existente donde esté disponible.
- Dialog/Modal actual.
- Money/date formatters actuales si existen.
- ConfirmSale actual.
- Order/Sale mutation adapters existentes.

### Crear/Extender únicamente después del audit local

Probables áreas:

- `features/customers/` o equivalent.
- Customer API adapter/query-key factory.
- Customer hooks.
- Customers page.
- CustomerForm compartido.
- Customer desktop table/mobile cards.
- Customer status confirmation UI.
- CustomerSelector.
- quick-create integration.
- `features/sales/` o extensión del feature de sale ya existente.
- Sales History page.
- Sales filters.
- Sales mobile cards.
- Sale detail overlay.
- PDF export adapter/utility.
- focused tests.

No se congelan filenames exactos hasta revisar el working tree local.

## Boundaries Respected

- Customers permanece capability separada de Sales.
- CustomerForm puede ser consumido por management y ConfirmSale, pero no debe acoplarse al checkout.
- ConfirmSale mantiene ownership de Order/payment/channel/shortage.
- Customer selector administra solo selección/creación de Customer.
- Sales History es read-only.
- PDF recibe un Sale detail normalizado y no accede directamente al backend.
- UI no recalcula reglas backend.
- Historical Sale rendering no consulta Customer actual.
- TanStack Query sigue siendo authority de server state.
- Auth context no se convierte en store de Customers/Sales.
- Routing/navigation siguen centralizados.
- Generated API sigue siendo contract source.
- Backend permanece intocable.
- AppShell no se rediseña.
- El change no crea un nuevo design system.

## Contracts Changed

### Contratos backend externos

No external contract changes are confirmed from the provided input.

El change MUST consumir el OpenAPI Sprint 3 ya generado y MUST NOT cambiarlo.

### Contratos frontend nuevos

Se esperan contratos internos, no backend, para:

#### Customer view model

Solo si es útil para presentación:

- fields generados Customer.
- computed display labels.
- permission booleans derivados.

No duplicar DTO.

#### Customer form values

UI-local:

- name;
- ci;
- nit;
- notes.

No incluir editable IsActive.

#### Customer selector selection

- `Customer | null` o ID + display object según patrón local.
- `null` = Consumidor final.

#### Sales history filters

UI state debe mapear 1:1 al query contract generado:

- from;
- to;
- shift/shiftType;
- channel;
- payment;
- customer search;
- page;
- pageSize.

Los nombres exactos se determinan desde generated types.

#### PDF input

Un adapter interno SHOULD recibir el Sale detail ya cargado o un view model derivado exclusivamente de ese DTO.

No debe recibir Customer actual ni volver a hacer fetch.

## Data Flow

### Customer management

- Router/guard autoriza CustomerRead.
- CustomersPage mantiene filter/pagination UI state.
- TanStack Query key incluye filters/page.
- Customer API adapter usa shared httpClient + generated types.
- Backend retorna page.
- Desktop renderiza DataTable.
- Mobile renderiza Customer cards.
- Create/Edit abre CustomerForm.
- Submit usa mutation correspondiente.
- Success invalida Customer query root/list relevante.
- Status action usa mutation dedicada y confirmación.
- MESERO no recibe status action.

### Customer quick-create en ConfirmSale

- ConfirmSale conserva Order/payment/channel/shortage state.
- CustomerSelector carga Customers activos mediante query contract apropiado.
- Selección:
  - Customer activo → customerId real.
  - Consumidor final → null.
- `+ Nuevo cliente` abre CustomerForm en overlay hijo/controlado.
- Submit create:
  - success → usar Customer retornado;
  - seleccionar `returned.id`;
  - invalidar Customer queries;
  - cerrar CustomerForm;
  - mantener ConfirmSale state.
- ConfirmSale mutation incorpora únicamente customerId.
- Backend crea snapshots.

### Sales History

- Route guard verifica SalesHistory capability.
- Al montar:
  - calcular business date actual mediante utility vigente;
  - establecer from/to today.
- Query key incluye scope + filters + page.
- MESERO-only:
  - backend sigue imponiendo scope;
  - UI omite broad Shift selector.
- Broad role:
  - mostrar Shift filter si contract lo soporta.
- API devuelve page de Sales.
- Desktop → DataTable.
- Mobile → cards.
- Open detail:
  - usar list DTO si realmente es suficiente;
  - en caso contrario fetch detail por Sale ID on-demand.

### PDF

- Sale detail ya cargado.
- User activa `Descargar comprobante PDF`.
- Adapter client-side transforma únicamente datos contractuales:
  - snapshots;
  - metadata;
  - items;
  - total.
- Renderer genera Blob/download.
- Filename usa date + short real Sale ID.
- No network request adicional requerido.
- Error queda en frontend feedback.

## Frontend Component Reuse Audit

Revalidar localmente antes de CREATE:

| Need                | Evidencia pública actual                                                          | Estrategia                        |
| ------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| Page header         | páginas feature existentes                                                        | REUSE/EXTEND                      |
| Search field        | Input/FormFields existentes                                                       | REUSE                             |
| Select              | auditar component real local                                                      | REUSE antes de crear              |
| Form field          | `FormFields.tsx` existe                                                           | REUSE                             |
| Modal/dialog        | auditar overlay actual                                                            | REUSE/EXTEND                      |
| Drawer/sheet        | mobile drawer global existe; detail primitive específica no confirmada            | AUDIT, luego EXTEND/CREATE mínimo |
| Table               | `DataTable<T>` existe                                                             | REUSE                             |
| Card                | design system actual                                                              | REUSE                             |
| Pagination          | features existentes usan paginación; primitive exacta debe confirmarse localmente | REUSE                             |
| Status badge        | patterns de features existentes                                                   | REUSE/EXTEND                      |
| Confirmation dialog | confirmar localmente                                                              | REUSE                             |
| Toast               | feedback system a confirmar localmente                                            | REUSE                             |
| Loading             | Spinner/DataTable loading                                                         | REUSE                             |
| Empty               | EmptyState                                                                        | REUSE                             |
| Error               | feedback/error patterns                                                           | REUSE                             |
| Money formatter     | no confirmado                                                                     | AUDIT                             |
| Date/time formatter | `business-time.ts` existe públicamente                                            | REUSE/EXTEND si aplica            |
| Icons               | Lucide instalado                                                                  | REUSE                             |

## Routing Integration

No se congelan paths hasta auditar el router LOCAL ACTUAL.

Requisitos de integración:

### Customers

- ruta protegida dentro de `AuthenticatedLayout`;
- guard CustomerRead;
- navigation item visible a ADMIN/ENCARGADO/MESERO;
- active matching compatible con child routes si los hubiera;
- no obligar a ubicar MESERO dentro de una experiencia etiquetada exclusivamente como administración.

Preferencia: una sola page route, con dialogs para CRUD, evitando `/clientes/nuevo` salvo que el proyecto ya use esa convención.

### Sales History

- route read-only bajo authenticated shell;
- guard con capability/roles reales del backend;
- navigation item reachable en desktop y mobile;
- no `/sales/new`;
- detail SHOULD abrir overlay sobre history en vez de requerir una route nueva, salvo patrón local existente.

## Navigation Integration

La base pública visible ya centraliza items y filtra mediante unión de roles. La integración SHOULD extender esa misma definición en lugar de crear checks paralelos. citeturn460683view0turn460683view1

Customers y Sales History deben:

- declararse una vez en navigation config;
- compartir source con sidebar/drawer;
- usar match de route robusto;
- conservar mobile drawer existente;
- no replicar el bottom nav ficticio de los mockups si el shell real usa drawer.

## Authorization UX

### Customer

| Capability | ADMIN | ENC | MESERO | Otros |
| ---------- | ----: | --: | -----: | ----: |
| Read       |   yes | yes |    yes |    no |
| Create     |   yes | yes |    yes |    no |
| Edit       |   yes | yes |    yes |    no |
| Activate   |   yes | yes |     no |    no |
| Deactivate |   yes | yes |     no |    no |

Frontend visibility deriva de capabilities. Backend continúa siendo la seguridad real.

### Sales History

- ADMIN: broad.
- ENCARGADO: broad.
- CONTADORA: broad read conforme contrato final.
- MESERO: current active assigned Shift.
- multi-role: union.

No implementar `if role === MESERO` como regla final si `hasAnyRole`/capabilities indican acceso broad por otro rol.

## Customer Feature Architecture

Preferencia:

- API/query module.
- query-key factory.
- CustomerForm.
- management page.
- table/cards.
- status dialog.
- tests.

Evitar separar arbitrariamente cada control en un archivo si no mejora boundaries.

CustomerForm recibe:

- initial values;
- mode create/edit;
- submit;
- pending;
- structured field/general errors.

No recibe:

- status management;
- route navigation;
- Sale state.

## ConfirmSale Integration

Integrar Customer como sección aditiva:

- `Consumidor final`;
- selector/búsqueda Customer;
- `+ Nuevo cliente`;
- selected Customer summary.

El form padre conserva:

- Order;
- PaymentMethod;
- SalesChannel;
- shortage state;
- Shift context;
- mutation pending/error.

Customer selector no debe resetear esos valores.

El request final agrega `customerId` al mapping vigente.

## Customer Selector State

Recomendación:

- selected Customer se mantiene en ConfirmSale page/form state.
- query cache contiene server data.
- CustomerSelector recibe selected value + callback.
- Customer quick-create retorna Customer y lo selecciona.
- no global context.
- no duplicar Customer list como state permanente.

## Quick Create Flow

1. Usuario abre Customer selector.
2. Busca.
3. No encuentra o decide crear.
4. Abre shared CustomerForm.
5. Guarda.
6. Create mutation:
   - error → modal permanece;
   - success → invalidate Customer queries.
7. `onCreated(customer)` actualiza selected Customer por ID.
8. Cierra modal.
9. Retorna a ConfirmSale sin perder payment/channel/etc.

## Sales History Read Model

La table/card debe consumir el list DTO y no requerir Customer fetch.

Display conceptual:

- date/time;
- shift;
- customer snapshot or `Consumidor final`;
- channel;
- payment;
- total;
- detail action.

Sale ID real puede aparecer discretamente cuando aporte trazabilidad.

No columna fake `VENTA #`.

## Responsive Strategy

### Customers desktop

Mockup útil:

- header/título/CTA;
- search y status filter;
- table;
- status badges;
- row actions.

Adaptaciones:

- añadir CI y NIT porque forman parte de HU-014 aunque el mockup desktop no los muestre;
- mantener Notes truncable;
- no mostrar Cash status header si no pertenece al AppShell actual.

### Customers mobile

Mockup útil:

- search full-width;
- cards;
- status badge;
- direct actions;
- notes preview.

Adaptaciones:

- añadir CI/NIT reales;
- MESERO sin status action;
- no bottom-nav mockup si el shell real usa drawer.

### Sales History desktop

Mockup útil:

- header;
- filter bar;
- table;
- pagination;
- detail action.

Adaptaciones:

- remover fake sale sequence;
- remover `Total período`;
- mantener pagination counts;
- PaymentMethod solo CASH/QR/EXTERNAL;
- SalesChannel solo DIRECT/PEDIDOSYA.

### Sales History mobile

Mockup útil:

- filter affordance;
- cards;
- load more pattern;
- `Ver detalle`.

Adaptaciones:

- remover `Total hoy`;
- remover `Transacciones exitosas` summary card;
- remover `Nueva Venta`;
- mantener solo pagination count.

### Detail desktop/mobile

Mantener jerarquía:

- metadata;
- Customer;
- responsible;
- shift;
- channel;
- payment;
- date;
- items;
- total;
- PDF.

Eliminar:

- IVA;
- descuentos;
- fake IDs;
- Reprint Ticket.

## Mockup Adaptation Matrix

| Mockup            | Element                                | Decision   | Motivo                                   |
| ----------------- | -------------------------------------- | ---------- | ---------------------------------------- |
| Clientes Desktop  | Page hierarchy/table                   | KEEP       | Encaja con CRUD read model               |
| Clientes Desktop  | Name                                   | KEEP       | Contractual                              |
| Clientes Desktop  | Notes                                  | KEEP       | Contractual                              |
| Clientes Desktop  | Status                                 | KEEP       | Contractual                              |
| Clientes Desktop  | CI/NIT ausentes                        | ADAPT      | Deben incorporarse según HU aprobada     |
| Clientes Desktop  | Caja Abierta header                    | OMIT       | Capability ajena                         |
| Clientes Desktop  | sidebar exacto                         | ADAPT      | Reusar shell real                        |
| Clientes Mobile   | Cards                                  | KEEP       | Responsive correcto                      |
| Clientes Mobile   | Search                                 | KEEP/ADAPT | Backend search Name/CI/NIT               |
| Clientes Mobile   | Filtrar                                | ADAPT      | Solo si status filter server-side existe |
| Clientes Mobile   | Edit                                   | KEEP       | Permitido por CustomerEdit               |
| Clientes Mobile   | Baja/Activar                           | ADAPT      | Ocultar para MESERO                      |
| Clientes Mobile   | bottom navigation                      | OMIT       | Reusar mobile navigation real            |
| Modal Cliente     | Modal composition                      | KEEP       | Buena referencia                         |
| Modal Cliente     | Name                                   | KEEP       | Contractual                              |
| Modal Cliente     | Notes                                  | KEEP       | Contractual                              |
| Modal Cliente     | CI/NIT ausentes                        | ADAPT      | Añadir ambos                             |
| Modal Cliente     | Active toggle                          | OMIT       | Decisión congelada: no editable          |
| Detail Mobile     | Bottom sheet                           | KEEP/ADAPT | Usar primitive real                      |
| Detail Mobile     | Customer                               | KEEP       | Snapshot                                 |
| Detail Mobile     | Shift/channel/payment/responsible/date | KEEP       | Si existen en DTO real                   |
| Detail Mobile     | fake `V-12345`                         | OMIT       | No sequential number                     |
| Detail Mobile     | Tarjeta Deb/Cred                       | OMIT       | Enum inexistente                         |
| Detail Mobile     | descuentos/IVA                         | OMIT       | Fuera de dominio                         |
| Detail Desktop    | Drawer/modal                           | KEEP/ADAPT | Usar primitive real                      |
| Detail Desktop    | Customer NIT                           | KEEP       | Snapshot si presente                     |
| Detail Desktop    | Efectivo                               | KEEP       | CASH                                     |
| Detail Desktop    | Reimprimir Ticket                      | OMIT       | Sin printing                             |
| Detail Desktop    | Descargar PDF                          | KEEP       | Requirement actual                       |
| Historial Desktop | Filters                                | KEEP/ADAPT | Mapear solo contractuales                |
| Historial Desktop | customer search                        | KEEP       | Snapshot search                          |
| Historial Desktop | `VENTA #` fake                         | OMIT       | No business sequence                     |
| Historial Desktop | Tarjeta/Transferencia/QR Simple        | OMIT       | Payment drift                            |
| Historial Desktop | Total período card                     | OMIT       | HU-029/reporting                         |
| Historial Mobile  | cards                                  | KEEP       | Responsive                               |
| Historial Mobile  | Ver detalle                            | KEEP       | HU-015                                   |
| Historial Mobile  | Cargar más                             | MAY        | Solo server pagination                   |
| Historial Mobile  | Total hoy/transacciones                | OMIT       | Reporting summary                        |
| Historial Mobile  | Nueva Venta                            | OMIT       | Sale nace desde Order                    |
| Historial Mobile  | fake sale IDs                          | OMIT       | Usar real UUID discretamente             |

## PDF Export Architecture

### Dependency selection

Durante APPLY:

1. inspeccionar dependencies existentes;
2. si ya existe una librería client-side adecuada, reutilizar;
3. si no:
   - comparar librerías mantenidas;
   - comprobar TypeScript/Vite;
   - comprobar browser generation;
   - evaluar bundle;
   - evaluar tests;
4. instalar mediante `pnpm` real;
5. actualizar lockfile.

No se congela librería en este artifact.

### Adapter

Diseño conceptual:

- `SaleDetailDto/generated type`
  → sale-receipt mapper
  → PDF document adapter
  → Blob/download.

El mapper puede producir un view model estable de export, pero debe derivar 100% del Sale detail.

### Content

- Fratelli.
- Comprobante interno de venta.
- Sale ID.
- date/time.
- shift.
- channel.
- payment.
- responsible.
- Customer snapshot/Consumidor final.
- CI/NIT condicionales.
- items.
- total.
- disclaimer no fiscal.

## TanStack Query Strategy

### Customers

Query key conceptual:

- `customers.all`
- `customers.list(filters)`
- quizá `customers.search(filters)` si patrón local lo requiere.

Mutations:

- create;
- update;
- activate;
- deactivate.

Invalidate:

- customer root/list relevant queries;
- selector query.

No invalidar unrelated app.

### Sales

Query keys:

- sales history + complete filter object;
- sale detail + ID.

History filters deben producir keys deterministas.

Detail query puede quedar disabled hasta abrir overlay.

### ConfirmSale

Preservar mutation y invalidations existentes.

Customer addition no debe reemplazar las invalidations de Orders/Inventory/Sales actuales.

## Error Handling

- Shared HTTP ProblemDetails sigue siendo única fuente global.
- Feature mappers pueden convertir códigos conocidos a copy UX.
- Customer duplicate CI/NIT → field/general error.
- Customer deactivated concurrently → recoverable selection error.
- Sales list/detail → retry.
- MESERO without current shift → mapping exacto tras auditar backend.
- PDF error → local export feedback; no API mutation.

## Required Tests Per Layer

### Component/unit

- CustomerForm validation.
- permission-derived Customer actions.
- Customer cards/table display.
- Payment/channel label mapping.
- snapshot display.
- PDF mapper/content model.
- date/money formatter reuse where helper logic is added.

### Feature/integration with mocked API

- Customer pagination/search.
- create/edit/status.
- duplicate conflicts.
- quick-create.
- auto-select.
- ConfirmSale request mapping.
- state preservation.
- history default today.
- filter/page behavior.
- role-aware Shift filter.
- multi-role.
- detail on-demand.
- PDF action.

### Routing/navigation

- Customer route allowed/denied.
- Sales History route allowed/denied.
- navigation visibility.
- active route.
- mobile reachability.

### Regression

- existing ConfirmSale without Customer.
- payment/channel existing states.
- shortage flow.
- Orders navigation.
- AppShell.

Strict TDD aplica porque el frontend público ya confirma Vitest + Testing Library. Para lógica nueva testeable, APPLY SHOULD usar `RED -> GREEN -> TRIANGULATE -> REFACTOR`. citeturn386962view4

## Tradeoffs Accepted

- Un único change es más grande, pero HU-014 y HU-015 comparten el flujo Sale/Customer y la misma estabilización de routing/authorization.
- CustomerForm compartido evita divergence entre management y quick-create.
- History permanece transaccional; no se agregan analytics aunque el mockup muestre métricas.
- PDF client-side evita backend drift y permite cumplir el requisito sin una API adicional.
- MESERO obtiene una UI más estrecha que roles broad.
- No se intenta sincronizar todos los filtros con URL salvo que ya exista esa convención.
- Mobile cards duplican algo de markup de table rendering, aceptado para legibilidad responsive.
- No se generaliza un framework global de history/export antes de necesitarlo en otros bloques.

## Implementation Constraints

- Revalidar el working tree LOCAL ACTUAL antes de editar.
- No asumir que GitHub público representa HEAD local.
- No regenerar OpenAPI.
- No ejecutar `api:generate` salvo evidencia de drift aprobada; el user declara generated TS ya sincronizado.
- No editar generated TS.
- No modificar backend.
- No instalar una form/state/router library nueva.
- No modificar auth token lifecycle.
- No crear endpoints.
- No crear rutas `new sale`.
- No hardcodear backend URL.
- No hardcodear Customer/Sale demo data.
- No hardcodear enum labels no generados.
- Mantener UI en español.
- Reutilizar Fratelli dark/orange tokens.
- Reutilizar Lucide.
- Mantener reviewable cada task; no ejecutar el bloque como una mega-edición.

## Open Design Questions

### Blocking research before APPLY

1. ¿Cuál es el HEAD y `git status --short` del working tree LOCAL ACTUAL?
2. ¿Cuáles son los paths exactos Customer y Sales History/Detail en el `api.generated.ts` local?
3. ¿Cuáles son los nombres exactos de:
   - Customer DTO;
   - Customer create/update;
   - status operations;
   - ConfirmSale customerId;
   - Sale history list;
   - Sale detail;
   - Customer snapshot fields?
4. ¿Existe filtro Customer `IsActive` server-side?
5. ¿Qué comportamiento exacto devuelve Sales History a MESERO sin current active assigned Shift?
6. ¿Existe ya feature/route parcial de Sales/Customers local que deba extenderse?
7. ¿Cuál es el component overlay actual más adecuado para desktop drawer y mobile sheet?
8. ¿Existe ya dependencia PDF?
9. ¿Cuáles son los formatter money/date actuales?
10. ¿Cuál es la ruta actual de ConfirmSale y el ownership exacto de su form state?

Ninguna pregunta anterior exige una decisión de producto. Son verificaciones del baseline local.

No se identifica, con la información disponible, una `PRODUCT_DECISION_REQUIRED`.
