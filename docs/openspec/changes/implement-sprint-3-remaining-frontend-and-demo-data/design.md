# Design

## Components Touched

### Baseline confirmado de frontend remoto

El router autenticado actual:

- utiliza `RequireAuth`;
- utiliza `RequireAnyRole`;
- contiene `/turnos`;
- contiene `/mi-turno`;
- no contiene una route Cash closing en la versión remota auditada;
- coloca `/turnos` bajo `SHIFT_MANAGE_ROLES`. citeturn391233view0

La feature Shift existente ya define:

- `SHIFT_MANAGE_ROLES = ['ADMINISTRADOR', 'ENCARGADO']`;
- `SHIFT_OWN_READ_ROLES`;
- `shiftKeys.context`;
- `shiftKeys.mine`;
- `useShiftContext`;
- invalidaciones de contexto/mis turnos. citeturn391233view2

El frontend dispone de React, React Router, TanStack Query, Vitest, Testing Library y scripts completos de quality gates. citeturn391233view3

### Áreas a extender

Si el `develop` local confirma este baseline:

- endpoint registry central: añadir las constantes Cash faltantes si todavía no están;
- nueva slice `features/cash` o ubicación equivalente real;
- `AppRoutes.tsx`;
- `ShiftsPage` como entry point mínimo;
- shared components existentes;
- tests de Cash;
- tests de routing/auth;
- docs HU-026/HU-027 después de APPLY.

No se debe crear un segundo QueryClient, AppShell, auth layer o API client.

## Boundaries Respected

- Backend Cash: read-only desde la perspectiva del source code frontend; no modificar.
- Generated OpenAPI types: consumir, no editar.
- Auth: reutilizar.
- Shift lifecycle: reutilizar; Cash closing no redefine apertura/handover.
- TanStack Query: server state authority.
- `expectedCash`: backend authority.
- Difference mostrada antes del submit: UX derivada, no authority.
- Historial Cash: separado y fuera del change.
- Reports/export/print: separados y fuera del change.
- Mobile shell: reutilizado, no duplicado.
- El feature Cash no debe introducir reglas financieras en JSX.

## Contracts Changed

### External contracts

No external contract changes are planned.

El generated contract remoto ya confirma:

#### `GET /api/v1/cash/preview`

- `200` → `CashPreviewDto`
- `401`
- `403`
- `404`

#### `POST /api/v1/cash/close`

Request:

- `declaredCash`
- `observation`

Response:

- `201` → `CashClosingDto`

Errors:

- `400` validation;
- `401`;
- `403`;
- `404`;
- `409`. citeturn149708view1turn149708view3

`CashPreviewDto` expone:

- `cashSessionId`;
- `businessDate`;
- `openingAmount`;
- `pettyCashOpeningAmount`;
- `cashRemovedAmount`;
- `cashAmountCarriedForward`;
- `salesTotal`;
- `cashSalesTotal`;
- `qrSalesTotal`;
- `externalSalesTotal`;
- `directSalesTotal`;
- `pedidosYaSalesTotal`;
- `cashDrawerExpensesTotal`;
- `pettyCashExpensesTotal`;
- `expensesTotal`;
- `expectedCash`;
- `shifts`.

`CashClosingDto` expone los totales principales, `expectedCash`, `declaredCash`, `difference`, `observation`, `closedByUserId` y `closedAt`. El DTO no expone un display name específico del responsable. citeturn808313view0

Por tanto:

- el success MUST usar `closedByUserId` como referencia contractual;
- para texto legible del responsable puede reutilizarse el usuario autenticado actual (`fullName`/`username`) sin inventar un campo backend.

### Internal frontend contract

Propuesta mínima:

- `cashKeys.preview`
- `cashApi.preview()`
- `cashApi.close(request)`
- `useCashPreview()`
- `useCloseCash()`

Los nombres pueden ajustarse si el baseline local ya tiene una convención Cash.

No se requiere modificar `api.generated.ts`.

## Data Flow

### HU-026

- Usuario ADMINISTRADOR/ENCARGADO entra a `Turnos / Caja`.
- Entry point de cierre dirige a la route de cierre.
- Route protegida reutiliza el guard de gestión.
- `useCashPreview` solicita `GET /api/v1/cash/preview`.
- Shared HTTP client gestiona auth/ProblemDetails.
- TanStack Query mantiene el estado remoto.
- `CashPreviewDto` alimenta:
  - contexto de fecha/turno;
  - apertura;
  - payment breakdown;
  - channel breakdown;
  - gastos;
  - handover;
  - expected cash.
- UI no reconstruye la fórmula financiera.

### HU-027

- Usuario introduce `declaredCash`.
- UI calcula diferencia provisional solo para presentación.
- Si diferencia != 0, observation pasa a required en la UX.
- Usuario pulsa Registrar cierre.
- Se valida el formulario.
- Se abre Modal de confirmación.
- Usuario confirma.
- `useCloseCash` envía `POST /api/v1/cash/close`.
- Pending bloquea un segundo submit.
- Success:
  - guardar response para success state;
  - invalidar `cashKeys.preview`;
  - invalidar `shiftKeys.context`;
  - invalidar `shiftKeys.mine` si afecta al estado mostrado;
  - renderizar `CashClosingDto`.
- `409`:
  - no retry;
  - invalidar/refetch;
  - mostrar caja cerrada/no disponible.
- Otros errores:
  - presentar ProblemDetails mediante conventions existentes.

## Estrategia de route y navegación

Sobre el baseline remoto actual, la solución de menor diff es:

- mantener la entrada global existente `Turnos / Caja`;
- añadir una CTA role-aware desde `/turnos`;
- registrar una child route de cierre bajo el mismo dominio, preferentemente `/turnos/cierre`;
- protegerla con `SHIFT_MANAGE_ROLES`.

No se debe añadir otro item global “Cierre de Caja” si `Turnos / Caja` ya resuelve reachability.

Regla de revalidación:

- si el `develop` LOCAL ya posee una route Cash estable, reutilizarla;
- no crear dos routes equivalentes.

## Visual Audit

Se inspeccionaron visualmente las tres referencias suministradas.

| Referencia               | Elemento                                 | Decisión   | Aplicación                                                   |
| ------------------------ | ---------------------------------------- | ---------- | ------------------------------------------------------------ |
| Cierre de Caja - Desktop | Dark shell Fratelli                      | KEEP       | Reutilizar AppShell real                                     |
| Cierre de Caja - Desktop | Grid de resumen                          | KEEP/ADAPT | Mapear únicamente campos reales                              |
| Cierre de Caja - Desktop | Efectivo esperado destacado              | KEEP       | Alta jerarquía visual                                        |
| Cierre de Caja - Desktop | Ventas efectivo/QR                       | KEEP       | Payment breakdown                                            |
| Cierre de Caja - Desktop | “PedidosYa / Externas” combinado         | ADAPT      | Separar channel de payment method                            |
| Cierre de Caja - Desktop | Gastos principal/chica                   | KEEP       | Campos reales del DTO                                        |
| Cierre de Caja - Desktop | Declared cash + difference               | KEEP       | HU-027                                                       |
| Cierre de Caja - Desktop | CTA crítico de cierre                    | KEEP       | Pending/confirm dialog obligatorio                           |
| Cierre de Caja - Móvil   | Resumen 2-columnas                       | KEEP/ADAPT | Grid pequeño cuando quepa; stack si no                       |
| Cierre de Caja - Móvil   | Expected cash destacado                  | KEEP       | Full-width priority card                                     |
| Cierre de Caja - Móvil   | Flujo vertical del form                  | KEEP       | Optimizado para 360 px                                       |
| Cierre de Caja - Móvil   | Resumen/CTA inferior                     | MAY        | Solo si no rompe shell/a11y                                  |
| Cierre de Caja - Móvil   | “Auto-ticket”                            | OMIT       | No printing                                                  |
| Estados de Cierre        | Dialog de confirmación                   | KEEP/ADAPT | Reutilizar Modal shared                                      |
| Estados de Cierre        | Expected/declared/difference/responsable | KEEP       | Datos reales                                                 |
| Estados de Cierre        | “notificará a administración”            | OMIT       | No notification feature                                      |
| Estados de Cierre        | Estado de éxito                          | KEEP       | Valores de CashClosingDto                                    |
| Estados de Cierre        | Imprimir Reporte                         | OMIT       | Fuera de scope                                               |
| Estados de Cierre        | Consultar historial                      | OMIT       | HU-028                                                       |
| Estados de Cierre        | “Firmado digitalmente”                   | OMIT       | No firma digital                                             |
| Estados de Cierre        | Ir al Inicio                             | ADAPT      | Preferir “Volver a Turnos / Caja”; Inicio MAY ser secundaria |

La referencia desktop mezcla “PedidosYa / Externas”; esto debe corregirse conceptualmente porque el contrato real diferencia `externalSalesTotal` de `pedidosYaSalesTotal`. citeturn808313view0

## Preview Model

Agrupación propuesta:

### Apertura

- Caja inicial → `openingAmount`
- Caja chica inicial → `pettyCashOpeningAmount`

### Ventas — medio de pago

- Efectivo → `cashSalesTotal`
- QR → `qrSalesTotal`
- Externo → `externalSalesTotal`

### Ventas — canal

- Directo → `directSalesTotal`
- PedidosYa → `pedidosYaSalesTotal`

### Gastos

- Caja principal → `cashDrawerExpensesTotal`
- Caja chica → `pettyCashExpensesTotal`

### Traspaso

- Efectivo retirado → `cashRemovedAmount`
- Efectivo arrastrado → `cashAmountCarriedForward` cuando no sea null

### Resultado

- Efectivo esperado → `expectedCash`

`salesTotal` y `expensesTotal` MAY mostrarse si ayudan a comprensión, pero no son obligatorios si duplican el resumen sin aportar claridad.

## Close Form

Estado local mínimo:

- `declaredCash` como string de formulario;
- `observation`;
- modal open/closed;
- success response.

No duplicar el preview en estado mutable.

### Difference UX

- Parsear el input según el patrón monetario existente.
- Calcular provisionalmente:
  - `declared - expected`.
- Formatear con convención BOB existente.
- Mostrar:
  - `Caja cuadrada` si cero;
  - `Sobrante` si > 0;
  - `Faltante` si < 0.
- El response final reemplaza el valor provisional como autoridad.

## Responsible User

Para preview/form:

- obtener la identidad del AuthProvider existente.

Para success:

- usar `CashClosingDto.closedByUserId` como dato contractual;
- usar el current auth user para el nombre visible cuando corresponda.

No inventar `closedByDisplayName`.

## Error and Operational States

### Preview loading

- Skeleton o Spinner shared.
- Mantener estructura de página para reducir layout shift.

### Preview initial error

- Alert/EmptyState.
- Copy segura.
- Retry.

### Preview 404

El generated contract confirma `404`, pero no codifica en TypeScript la causa funcional exacta. citeturn149708view1

El APPLY MUST auditar el ProblemDetails local:

- si permite distinguir “sin caja abierta”, mostrar ese estado;
- si permite distinguir “ya cerrada”, mostrar ese estado;
- si no, usar copy genérica y verdadera: `No hay una caja abierta disponible para cerrar.`

No parsear texto para construir lógica si existe un código estable.

### Close 409

- Estado “caja ya cerrada/no disponible”.
- Refetch.
- No retry automático.
- No mantener CTA operativo.

### Close 400

- Mantener valores del formulario.
- Mostrar validación segura.
- Mapear a field feedback cuando el shared error contract exponga errores de campo.

## Query Strategy

Nueva key cohesionada:

- `cashKeys.all`
- `cashKeys.preview`

o equivalente según convention local.

`useCashPreview`:

- no polling agresivo;
- retry controlado;
- `404` no debería entrar en loop de retry.

`useCloseCash`:

Success:

- invalidate Cash preview;
- invalidate Shift context;
- invalidate current user Shift solo si es una dependencia real del UI.

409:

- invalidate Cash preview;
- invalidate Shift context;
- no automatic mutation retry.

No usar `invalidateQueries()` global.

## Required Tests Per Layer

### API/query

Strict TDD aplica porque el repositorio tiene Vitest/Testing Library. Las tasks de lógica nueva deben seguir:

RED → GREEN → TRIANGULATE → REFACTOR.

Tests:

- preview usa endpoint correcto;
- close usa endpoint correcto/request generado;
- success invalidation;
- 409 invalidation/no retry.

### HU-026 component/page

- initial loading;
- preview data;
- `expectedCash`;
- payment/channel separation;
- cash removed/carried forward;
- error + retry;
- 404 operational state.

### HU-027 form

- input declared cash;
- zero difference;
- positive difference;
- negative difference;
- conditional observation;
- whitespace observation;
- modal data;
- submit payload;
- pending protection;
- success.

### Authorization/routing

- ADMINISTRADOR allowed.
- ENCARGADO allowed.
- MESERO denied.
- COCINA denied.
- CONTADORA denied.
- EMPLEADO denied.
- Multi-role with an allowed role allowed.
- Entry point only visible to authorized roles.

### Integration/regression

- opening Shift remains usable.
- handover remains usable.
- `/mi-turno` unchanged.
- existing sales/orders unaffected.
- no use of HU-028 endpoints.

### Manual-ready responsive checks

- 360 px.
- tablet.
- desktop.
- dialogs remain in viewport.
- no horizontal overflow.
- keyboard operation.

## Tradeoffs Accepted

- Se prioriza un único page/feature Cash compacto sobre una arquitectura financiera genérica.
- El preview backend se acepta como autoridad aunque algunos valores puedan derivarse en cliente.
- Difference local existe únicamente para feedback inmediato.
- Se reutiliza `Turnos / Caja` como entry point para evitar navegación duplicada.
- No se crea dashboard de caja.
- No se crea historial.
- No se implementa sticky footer si complica significativamente el shell actual; es visualmente opcional.
- Se acepta fidelity MVP en lugar de pixel-perfect.

## Implementation Constraints

- No backend changes.
- No migration.
- No dependency install.
- No manual generated API edit.
- No HU-028 endpoints.
- No report/export/print.
- No global navigation redesign.
- No new global state library.
- No direct `fetch`.
- No hardcoded backend URL.
- No manual Bearer.
- No second QueryClient.
- No cash formula duplicada como authority.
- Reusar `SHIFT_MANAGE_ROLES` si el local confirma la misma capability.
- Mantener `America/La_Paz` mediante helpers existentes cuando se formatee contexto temporal; no reinterpretar `businessDate` como UTC instant.
- Los comandos de gates confirmados en el remoto son:
  - `pnpm run format:check`
  - `pnpm run typecheck`
  - `pnpm run lint`
  - `pnpm test`
  - `pnpm run build` citeturn391233view3

## Open Design Questions

### Blocking — repository research required

1. ¿Cuál es el `HEAD` y `git status` del `develop` LOCAL real?
   - Esta sesión no dispone de acceso al working tree.
   - Debe verificarse antes de APPLY.

2. ¿El local contiene ya una implementación o route Cash no visible en el remoto auditado?
   - Si sí, extenderla.
   - Si no, usar la estrategia propuesta.

3. ¿Qué ProblemDetails/codes exactos devuelve el backend LOCAL para:
   - preview sin sesión;
   - preview después de cierre;
   - close con precondición inválida;
   - close concurrente?
   - Esto determina copy/mapping preciso, no las reglas funcionales.

### Non-blocking

- Si no existe route previa, `/turnos/cierre` es la route recomendada por coherencia con el router actual.
- El uso de sticky summary mobile es opcional y puede omitirse para reducir riesgo/LoC.

No se identifica una PRODUCT_DECISION_REQUIRED con la información disponible.
