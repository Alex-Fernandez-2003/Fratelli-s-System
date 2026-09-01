# Auditoría del estado actual del sistema — Sprint 3

## Executive Summary

Esta auditoría reconstruye el estado real del working tree local usando evidencia estática, gates automatizados y consultas runtime read-only. No se modificó product code, generated API, migration, tests, documentación existente ni datos.

**Verdict final:** `SPRINT_3_BASELINE_HEALTHY_WITH_FINDINGS`

La reconciliación read-only confirma un estado operacional esperado para `BusinessDate = 2026-09-01`: existe exactamente una `CashSession` cerrada, con la secuencia aprobada MORNING → handover → NIGHT → cierre final. El ID no es demo-prefix y `docs/demo-dataset.md` establece que la migration no inserta esta fecha; el origen se clasifica como `MANUAL_TEST`. `OperationsService.OpenAsync` encuentra la sesión existente y no crea una segunda, comportamiento esperado para la invariante de exactamente una sesión por fecha. No se ejecutó una prueba de fecha nueva porque no era necesaria y no fue realizada.

| Severidad | Cantidad |
| --- | ---: |
| BLOCKER | 0 |
| HIGH | 0 |
| MEDIUM | 3 |
| LOW | 1 |
| INFO | 2 |

Las HUs con frontend pendiente intencionalmente no se clasifican como defectos. Las HUs recientes sin validación de navegador se dejan como `UNKNOWN_REQUIRES_RUNTIME_VALIDATION`, sin convertir `PENDING_EXTERNAL` en PASS.

## Git Baseline

- **Branch:** `develop`.
- **HEAD:** `ccdd589f331ed9d3b46b20ef0978b1e0299230a7`.
- **Remote comparison:** `origin/develop = ce42e1a`; HEAD está ahead por un commit.
- **Working tree:** solo hay modificaciones unstaged en `proposal.md`, `design.md`, `spec.md` y `tasks.md` de este change de auditoría.
- **Staged:** no hay cambios staged.
- **Untracked:** no hay archivos untracked.
- **Recent log relevante:** dataset `ccdd589`, cash fix `ce42e1a`, HU-026/027 `eb9d6f8`, documentación `9236dd4` y frontend `78bc053`.
- **Integridad:** las modificaciones locales del change fueron preservadas y consideradas parte de la baseline; no se ejecutaron comandos destructivos ni commit/push.

La autoridad es el working tree local, no el remote. El estado remoto se usa solamente como comparación.

## Current Sprint 3 State

El roster canónico reconstruido para este audit contiene exactamente: **HU-008, HU-014, HU-015, HU-019, HU-021, HU-023, HU-024, HU-025, HU-026, HU-027, HU-028, HU-029, HU-030 y HU-031**.

La ausencia de frontend en HU-008, HU-019, HU-021, HU-023, HU-024, HU-028, HU-029, HU-030 y HU-031 coincide con el scope de frontend pendiente; no es `BROKEN` por sí misma. HU-025 corresponde al flujo de apertura de jornada según la documentación y el cambio de cash/opening; su estado se separa de HU-026/HU-027.

## OpenSpec State

| Change / equivalente local | Clasificación | HUs/capabilities | Evidencia e inconsistencia |
| --- | --- | --- | --- |
| `implement-sprint-3-frontend-customers-and-sales-history` | `completed` | HU-014, HU-015 | Tiene apply/verify documentados, tareas completas y gates frontend previos PASS; backend y generated API constan como reutilizados. |
| `implement-sprint-3-frontend-cash-closing` | `inconsistent/remnant` | HU-026, HU-027 | No existe como directorio independiente en `docs/openspec/changes/`; los artifacts de cash se encuentran bajo el change grande remanente. |
| `implement-sprint-3-remaining-frontend-and-demo-data` | `inconsistent/remnant` / no es instrucción activa | HU-026, HU-027 y scope restante | Su proposal/design declaran APPLY futuro/no ejecutar, pero `tasks.md` y `apply-progress.md` contienen una ejecución frontend Cash 8/8. La evidencia fuente muestra que HU-026/027 fueron ejecutadas bajo el change equivocado. No se mueven ni reescriben artifacts en esta auditoría. |
| `archive/2026-08-31-implement-sprint-3-complete-backend` | `archived` | Backend Sprint 3 transversal | Archivo histórico con 37/37 tareas y verify PASS. No se toma como prueba suficiente del estado actual del working tree cuando existe evidencia local posterior. |
| `audit-sprint-3-current-system-state` | `active` | Auditoría actual | Este change es el único que recibe los tres artifacts finales solicitados. No contiene implementación de producto. |

El change grande remanente no debe interpretarse como una orden pendiente de implementar. La discrepancia documental se registra como finding, sin corregirla.

## HU Matrix

Cada fila tiene exactamente un estado de la enumeración contractual.

| HU | Backend | Frontend | Tests | Docs | OpenSpec | Estado real |
| --- | --- | --- | --- | --- | --- | --- |
| HU-008 | Implementado para history/detail de Production | Pendiente por scope | Backend 100/100 global; cobertura específica previa | Backend documentado | Archived backend | `BACKEND_COMPLETE_FRONTEND_PENDING` |
| HU-014 | Implementado: Customers CRUD/status/search | Implementado; navegador pendiente | Frontend suite PASS; pruebas Customer/route incluidas | HU documentada | Frontend change completed | `UNKNOWN_REQUIRES_RUNTIME_VALIDATION` |
| HU-015 | Implementado: Sales history/detail/snapshots | Implementado; navegador pendiente | Frontend suite PASS; API/detail/PDF/route incluidos | HU documentada | Frontend change completed | `UNKNOWN_REQUIRES_RUNTIME_VALIDATION` |
| HU-019 | Implementado: purchase history/read | Frontend pendiente por scope | Backend suite PASS | Backend documentada | Archived backend | `BACKEND_COMPLETE_FRONTEND_PENDING` |
| HU-021 | Implementado: expense history/read | Frontend pendiente por scope | Backend suite PASS | Backend documentada | Archived backend | `BACKEND_COMPLETE_FRONTEND_PENDING` |
| HU-023 | Implementado: attendance self-history | Frontend pendiente por scope | Backend suite PASS | Backend documentada | Archived backend | `BACKEND_COMPLETE_FRONTEND_PENDING` |
| HU-024 | Backend de attendance/admin disponible | Frontend pendiente por scope | Backend suite PASS | Backend documentada | Archived backend | `BACKEND_COMPLETE_FRONTEND_PENDING` |
| HU-025 | Open/operational-day path y lifecycle actual observados | Modal/mutation implementados; navegador pendiente | Gates verdes; DB read-only confirma lifecycle completado y conforme | Shift/cash docs y artifacts revisados | Cash artifacts remanent | `UNKNOWN_REQUIRES_RUNTIME_VALIDATION` (el unknown restante es browser evidence, no una falla de la invariante) |
| HU-026 | Preview endpoint/DTO implementados | Preview implementado; navegador pendiente | Cash API/page tests incluidos; suite global PASS | HU documentada | Cash artifacts bajo change remanent | `UNKNOWN_REQUIRES_RUNTIME_VALIDATION` |
| HU-027 | Close endpoint/DTO implementados | Close implementado; navegador pendiente | Cash close/conflict/success tests incluidos; suite global PASS | HU documentada | Cash artifacts bajo change remanent | `UNKNOWN_REQUIRES_RUNTIME_VALIDATION` |
| HU-028 | Capability de history de cierres no se audita como frontend implementado | Pendiente por scope | No se exige frontend | Scope la mantiene fuera | Cash proposal la excluye | `BACKEND_COMPLETE_FRONTEND_PENDING` |
| HU-029 | Backend/report capability disponible según baseline | Frontend pendiente por scope | Backend suite PASS | Backend documentada | Archived backend / remanent excluded | `BACKEND_COMPLETE_FRONTEND_PENDING` |
| HU-030 | Backend/report capability disponible según baseline | Frontend pendiente por scope | Backend suite PASS | Backend documentada | Archived backend / remanent excluded | `BACKEND_COMPLETE_FRONTEND_PENDING` |
| HU-031 | Backend/report capability disponible según baseline | Frontend pendiente por scope | Backend suite PASS | Backend documentada | Archived backend / remanent excluded | `BACKEND_COMPLETE_FRONTEND_PENDING` |

## Recent Frontend Changes

La implementación reciente localizada cubre:

- Customers: API/hooks tipados, formulario reutilizable, búsqueda server-side, paginación, status filter, CRUD y layouts table/card.
- ConfirmSale: Customer opcional, búsqueda activa, quick-create reutilizando formulario, `customerId` retornado por API, cancelación sin perder el estado de venta y representación nullable de `Consumidor final`.
- Sales History/Detail: filtros/paginación server-side, scope, detalle on-demand, Sale ID real, snapshots históricos y valores de enums contractuales.
- PDF: adapter client-side con jsPDF, usando snapshots y disclaimer `Comprobante interno — No constituye factura fiscal.`; build con warning de chunk grande.
- Shift/Cash: modal de apertura con los dos montos, preview autoritativo, cierre con confirmación, observación condicional, conflicto 409 sin retry y estados de éxito/error.

No se encontraron en las features auditadas segundo HTTP client, raw `fetch`, URL backend hardcoded, Bearer manual, nuevo QueryClient, ni edición manual detectable de `api.generated.ts`.

## HU-014 Audit — Customers y ConfirmSale

### Customers

- Existe route protegida y exposición de navegación coherente desktop/mobile; no se detectaron entradas duplicadas.
- La lista usa búsqueda y paginación server-side; filtros forman parte del estado de consulta y el cambio de filtro reinicia la página.
- Create/edit usan Name y CI requeridos, NIT y Notes opcionales; no exponen `IsActive` editable ni Delete.
- Activate/deactivate están separados de create/edit y el permiso de lifecycle no se extiende al MESERO puro.
- Los errores de CI/NIT duplicados se manejan mediante el contrato ProblemDetails existente.
- Se conserva layout de tabla desktop y cards mobile.
- La semántica multi-role se evalúa como unión de capacidades.

**Evidencia:** `STATIC_CONFIRMED` + `AUTOMATED_GATE_CONFIRMED`. La validación visual a 360/768/1280 es `PENDING_EXTERNAL`.

### ConfirmSale

El flujo observado es `Order ENTREGADO → ConfirmSale → Customer opcional/Consumidor final → payment/channel/shortage → Sale`.

- Customer es opcional y clearable.
- Solo se seleccionan clientes activos según el comportamiento de API auditado.
- La búsqueda soporta Name/CI/NIT.
- `Consumidor final` se representa sin persistir un Customer fake; no existe Customer persistido con ese nombre en la DB demo.
- Quick-create reutiliza el formulario; cancel preserva los campos de venta; success selecciona el ID devuelto por API.
- Se envía `customerId`, no snapshots manuales desde frontend.
- PaymentMethod, SalesChannel, shortage acknowledgement, shift requirement, estado ENTREGADO y mutation final permanecen en el flujo existente.

**Evidencia:** `STATIC_CONFIRMED` + `AUTOMATED_GATE_CONFIRMED`; navegador `PENDING_EXTERNAL`.

## HU-015 Audit — Sales History, Detail y PDF

- Route, guard y navegación están presentes.
- Fecha de negocio y timezone usan `America/La_Paz`; se inspeccionó el default de hoy.
- Filtros y paginación se envían al servidor y están aislados en query keys.
- Scope MESERO se aplica server-side; un rol broad en un usuario multi-role prevalece sobre el scope MESERO-only. No se encontró un filtro de Shift que otorgue al MESERO un scope que el backend no concede.
- PaymentMethod se limita a `CASH`, `QR`, `EXTERNAL`; SalesChannel a `DIRECT`, `PEDIDOSYA`. No se encontró la equivalencia `PEDIDOSYA = EXTERNAL` en el consumidor frontend.
- Detail se carga on-demand, usa Sale ID real y muestra metadata, responsible, shift, payment, channel, customer snapshot, items, unit price, line totals y total.
- La identidad histórica usa los snapshots persistidos; no se encontró current-Customer lookup para reconstruir una venta histórica.
- Customer nulo se presenta como `Consumidor final`; DB read-only confirma que no existe un registro persistido usado como workaround.
- No se encontraron IVA, descuento, Sale Number inventado ni `Reprint Ticket` no soportado.
- El receipt se genera client-side con `jspdf`, usa datos del snapshot y contiene el disclaimer interno; no tiene comportamiento fiscal.

**Evidencia:** static y tests automatizados PASS. Responsive/manual browser: `PENDING_EXTERNAL`.

## Shift Open Bugfix Audit

| Punto | Resultado |
| --- | --- |
| Modal | Implementado y conectado al botón `Iniciar jornada`. |
| Inputs | `openingAmount` y `pettyCashOpeningAmount` presentes. |
| Payload | Se envían ambos campos al endpoint `POST /api/v1/shifts/open`. |
| Cero | El backend permite cero; el frontend no debe tratarlo como ausencia mediante truthiness. |
| Negativos | Backend rechaza valores negativos. |
| Decimales/comma-dot | Parsing estático revisado; la validación visual cross-browser queda `PENDING_EXTERNAL`. |
| Pending/doble submit | Estado pending y deshabilitación revisados. |
| Error | Manejo shared y preservación de valores revisados. |
| Success | Invalidation/refetch de Shift/Cash revisado. |
| Resultado runtime | El estado current-day observado es una sesión manual cerrada con MORNING y NIGHT COMPLETED en la secuencia aprobada; no se ejecutó mutation smoke. |

La implementación del payload y el estado runtime observado son coherentes con el lifecycle aprobado; no existe evidencia de que una sesión CLOSED deba reabrirse ni de que deba crearse una segunda sesión.

## HU-026 Audit — Cash Preview

- Endpoint real: `GET /api/v1/cash/preview`.
- `CashPreviewDto.expectedCash` se presenta como autoridad backend; no se identificó fórmula frontend competidora usada como autoridad.
- Payment breakdown (`CASH`, `QR`, `EXTERNAL`) y channel breakdown (`DIRECT`, `PEDIDOSYA`) se mantienen separados.
- Se muestran apertura, gastos de caja principal/chica, efectivo retirado y contexto de carried-forward.
- `cashAmountCarriedForward` no se vuelve a sumar a `expectedCash`.
- Loading, error/retry y 404 operacional están modelados; 404 no crea un formulario con ceros ficticios.
- Query usa retry controlado y no entra en loop de retry para 404.

**Evidencia:** `STATIC_CONFIRMED` y `AUTOMATED_GATE_CONFIRMED`; validación browser `PENDING_EXTERNAL`.

## HU-027 Audit — Cash Close

- El formulario permite `declaredCash` y `observation`; los valores del preview son read-only.
- La diferencia local es provisional (`declared - expected`) y se expresa como caja cuadrada, sobrante o faltante con texto/signo.
- Diferencia cero permite observation opcional; diferencia distinta de cero exige observation no vacía después de trim.
- Existe confirmación previa al POST.
- El payload contiene únicamente los campos contractuales; no envía `expectedCash`, `difference`, user ID ni snapshots autoritativos innecesarios.
- Pending bloquea doble submit.
- 400 conserva el formulario; 404 refetch; 409 no reintenta, invalida/refresca y deja de presentar una operación normal disponible.
- Success usa el `CashClosingDto` devuelto como autoridad, incluyendo `difference`, `closedByUserId` y `closedAt`.

**Evidencia:** static y tests de API/page/route PASS; navegador `PENDING_EXTERNAL`.

## General Frontend Audit — Architecture

- Package manager: `pnpm@11.18.0`; lockfile `frontend/pnpm-lock.yaml` presente.
- Shell/router/auth/guards/shared primitives se reutilizan; no hay segundo shell ni segundo QueryClient.
- HTTP y ProblemDetails se centralizan en la infraestructura existente.
- TanStack Query mantiene server state; las features recientes usan keys específicas e invalidaciones dirigidas.
- `jspdf` es la única dependencia PDF observada; el build warning se separa como deuda de performance.
- Búsquedas de duplicación: no se detectaron standalone Axios, raw fetch en features, URL hardcoded de backend, Bearer manual, matrices de rol duplicadas accionables, rutas duplicadas, ni formatters duplicados con impacto probado.

## Backend Audit

- La solution backend y sus proyectos API/Application/Domain/Infrastructure fueron revisados transversalmente.
- DI, endpoints, policies, ProblemDetails y servicios críticos de Customer, ConfirmSale, Sales, Shift Open, Cash Preview y Cash Close están presentes.
- OpenAPI runtime respondió HTTP 200 y expuso OpenAPI 3.1.1 con 69 paths; están presentes las rutas relevantes de customers, sales, shifts/open y cash.
- Backend gates: restore, Release build y tests completos PASS.
- No se incluye como finding la hipótesis preliminar de autorización de compra COCINA ni la hipótesis de timestamp UTC/business date de Sales History, porque no quedó independientemente sustentada por la evidencia entregada.

## Contract Audit

### `OpenOperationalDayRequest` layer trace

| Layer | `openingAmount` | `pettyCashOpeningAmount` |
| --- | --- | --- |
| Backend request DTO/runtime | Requerido conceptualmente; null/negativo rechazado por `OperationsService.OpenAsync` | Requerido conceptualmente; null/negativo rechazado por `OperationsService.OpenAsync` |
| OpenAPI runtime | Componente requiere ambas propiedades, pero cada una es nullable; request body `oneOf: null \| OpenOperationalDayRequest` | Igual |
| Generated TypeScript | Propiedades required pero nullable; contenido del request body opcional según generated schema | Igual |
| Frontend consumer | Envía ambos montos validados | Envía ambos montos validados |

**Generated API final classification: `DRIFT DETECTED`.** Es drift de contrato `MEDIUM/CONTRACT`, no blocker por sí mismo porque la UI actual protege el flujo. No se regeneró ni editó el cliente.

Los contratos de Customer, ConfirmSale, Sales History, Cash Preview y Cash Close se observan alineados en paths, tipos consumidos, enums y payload de close. La divergencia de nullability se mantiene separada del hallazgo operacional no bloqueante.

## Routing / Navigation

| Área | Resultado |
| --- | --- |
| Customers | Route protegida, nav desktop/mobile y active state coherentes; sin duplicado detectado. |
| Sales History/detail | Route/guard/nav presentes; detalle on-demand. |
| Shift open | Entry point existente bajo el dominio de Turnos. |
| Cash close | Route `/turnos/cierre` protegida por roles de gestión y CTA role-aware; no se creó nav global duplicada. |
| Deep links/guards | `RequireAuth`/`RequireAnyRole` reutilizados; evidencia automatizada cubre autorizado, denegado y multi-role. |

## Authorization

Roles canónicos observados: `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA`, `EMPLEADO`. No existe `CAJERO` en la definición canónica, documentación o tests auditados.

- Customer read/create/edit: ADMINISTRADOR, ENCARGADO y MESERO según contrato.
- Customer status: ADMINISTRADOR y ENCARGADO; ausente para MESERO puro.
- Sales History: scope MESERO-only por asignación; roles broad obtienen scope amplio; multi-role usa unión.
- Cash close: ADMINISTRADOR y ENCARGADO; MESERO, COCINA, CONTADORA y EMPLEADO no alcanzan la route.
- Backend mantiene autorización independiente del ocultamiento de UI.

**Hallazgo separado:** cuatro usuarios `demo.*` tienen cero filas en `AspNetUserRoles`. La migration seed users pero no roles. Esto impide afirmar readiness de login/roles demo; no se afirma comportamiento de password ni un bypass runtime.

## Query / API Integration

| Feature | Key/strategy | Retry | Invalidation | Resultado |
| --- | --- | --- | --- | --- |
| Customers | search/status/page/pageSize aislados | Shared query behavior | Mutations invalidan raíz pertinente | Correcto por static/tests |
| Sales History | filtros y paginación en key | Controlled | Read-only | Correcto por static/tests |
| Shift Open | mutation | No retry de mutation no idempotente | Shift/Cash context | Correcto estáticamente |
| Cash Preview | `cashKeys.preview` | 404 no retry loop | Refetch tras open/close | Correcto por static/tests |
| Cash Close | mutation | 409 no retry | Cash preview + Shift context | Correcto por static/tests |

No se detectaron query loops, N+1 de detalle, detail eager por fila, keys colliding ni doble mutation intencional en las áreas recientes.

## Database / Migrations

- Se inventariaron **15 migrations**; `has-pending-model-changes` reporta **no pending model changes**.
- La migration reciente es `20260901124421_AddComprehensiveDemoData` y está aplicada.
- Los datos demo usan IDs/dates deterministas, prefijos fijos y guardas para evitar reinserción. No usan fecha actual para generar el dataset.
- Up/relaciones/constraints y Down fueron revisados como parte del audit; no se observó evidencia de corrupción, delete broad o interferencia causada por la migration.
- En la DB `restaurant_system`, con fecha actual `2026-09-01`, existe exactamente una `CashSession` para ese día: ID `ce8f79d6-fb06-4522-bfda-6d93c39ee266`, `IsOpen=false`, abierta `2026-09-01 08:37:26 -04` por `admin.test`. Tiene un `CashClosing` ID `9326d0e6e-8a6b-480e-b54e-7df9d674cbdf`, cerrado `2026-09-01 13:15:55 -04` por `admin.test`, con ExpectedCash `20.00`, DeclaredCash `20.00` y Difference `0.00`.
- Sus dos shifts son `MORNING COMPLETED` (`08:37`–`13:14`) y `NIGHT COMPLETED` (`13:14`–`13:15`), que es la secuencia aprobada. La sesión no es demo-prefix y no fue insertada por la migration.

## Demo Data

| Dominio | Evidencia read-only |
| --- | --- |
| Customers | 10; sin `Consumidor final` persistido. |
| Suppliers | 4. |
| Products | 20. |
| Productions | 12. |
| Purchases | 10; CANCELADA 2, PENDIENTE 2, RECIBIDA 6. |
| Orders / Sales | 25 / 25. Combinaciones: DIRECT+CASH 9, DIRECT+EXTERNAL 1, DIRECT+QR 6, PEDIDOSYA+CASH 4, PEDIDOSYA+EXTERNAL 5. |
| Expenses | 10. |
| Cash | 5 sesiones demo y 5 closings demo. |
| Attendance | 8. |
| Referencialidad | Huérfanos en order items, sales/sale items, shifts/assignments, productions, purchases y expense shifts: 0. |
| Cash arithmetic | Mismatches de cierre: 0. |
| Snapshots | Mismatches de customer snapshot: 0. |

La migration no inserta `BusinessDate 2026-09-01`; la sesión observada se clasifica como `MANUAL_TEST` (usuario `admin.test`, lifecycle creado fuera de la migration demo). No hay evidencia de que una sesión CLOSED bloquee un BusinessDate nuevo, de que `BusinessClock` sea incorrecto, de que `OpenAsync` falle cuando no existe sesión, ni de que la migration haya insertado la fecha actual.

## Functional Flow Review

- **Auth:** Login → sesión/usuario actual → roles → AppShell → guards/nav. Static/backend role evidence PASS; demo role assignments incompletas quedan en F-003.
- **Catalog → Inventory → Production:** las capacidades backend existen y las relaciones auditadas son consistentes; HU-008 frontend permanece fuera de scope.
- **Supplier → Purchase → Receipt → Inventory:** backend/read history y estados observados son coherentes; HU-019 frontend pendiente intencional.
- **Order → Kitchen → ENTREGADO → ConfirmSale → Sale:** customer opcional y snapshots server-owned; payment/channel permanecen independientes; tests de regresión PASS.
- **Shift/Cash:** el flujo de código y contratos existe. El estado current-day observado cumple la invariante `exactamente una CashSession por BusinessDate → MORNING → handover → NIGHT → un cierre final`; no implica reapertura ni segunda sesión.
- **Expense → cash source → preview:** datos demo y endpoint/contextos son coherentes; no se detectó doble conteo de carried-forward.
- **Attendance:** endpoints y relaciones existentes se conservan; frontend de HU-023/HU-024 es pending por scope.

## Tests / Build

Los comandos exactos y resultados están desarrollados en `verify-report.md`. Resumen: todos los gates frontend y backend requeridos pasaron; el build frontend conserva un warning no fatal de Vite por chunk >500 kB. No se arregló ningún gate.

## Responsive / Accessibility

La inspección estática confirma labels asociados, modal/shared focus handling, nombres de acciones, diferencia de caja expresada con texto y signo, y layouts responsive declarados. Sin embargo, no fue posible ejecutar browser validation en 360 px, aproximadamente 768 px y >=1280 px. Toda evidencia visual/manual relevante es **`PENDING_EXTERNAL`**. No se afirma certificación WCAG ni PASS visual.

## Documentation Drift

- HU-014/HU-015 y HU-026/HU-027 tienen documentación que refleja implementación frontend y gates previos.
- El change independiente esperado para cash closing no existe; sus artifacts quedaron bajo `implement-sprint-3-remaining-frontend-and-demo-data`, cuyo proposal/design todavía describen una fase futura. Esta contradicción documental se reporta como F-004.
- Los findings preliminares no sustentados de COCINA purchase authorization y UTC/business-date no se convierten en defectos.
- La documentación existente no fue reescrita como corrección.

## Confirmed Defects

**Confirmed Defects: NONE. BLOCKER count: 0.** Los findings restantes son observaciones no bloqueantes; no existe un defecto funcional confirmado en el lifecycle observado de Shift/Cash.

## Non-blocking Findings

Todos los findings de esta sección son no bloqueantes y conservan la evidencia previa. Ninguno requiere un lifecycle fix, reapertura, segunda sesión o cambio de constraint para continuar Sprint 3.

| Finding | Severity | Category | Blocks Sprint 3? |
| --- | --- | --- | --- |
| F-002 — Contract drift: nullability de `OpenOperationalDayRequest` | `MEDIUM` | `CONTRACT` | NO |
| F-003 — Usuarios demo sin asignación de roles ASP.NET | `MEDIUM` | `AUTH` | NO |
| F-004 — Trazabilidad de artifacts HU-026/HU-027 | `MEDIUM` | `DOCS` | NO |
| F-005 — Warning de chunk frontend >500 kB | `LOW` | `PERFORMANCE` | NO |
| F-006 — Validación browser responsive/a11y no ejecutada | `INFO` | `UX` | NO |
| F-001 — Expected closed current-day operational state | `INFO` | `FUNCTIONAL` | NO |

### F-001 — Expected closed current-day operational state

- **Severity:** `INFO`
- **Category:** `FUNCTIONAL` (operational-state).
- **Affected HU/Flow:** HU-025; `No jornada → Iniciar jornada → CashSession` y Shift/Cash actual.
- **Evidence:** `RUNTIME_CONFIRMED` mediante consultas read-only a la DB `restaurant_system`, con fecha actual `2026-09-01`, y la inspección del servicio. Existe exactamente una sesión: ID `ce8f79d6-fb06-4522-bfda-6d93c39ee266`, `IsOpen=false`, abierta `2026-09-01 08:37:26 -04` por `admin.test`. Tiene un único `CashClosing` ID `9326d0e6e-8a6b-480e-b54e-7df9d674cbdf`, cerrado `2026-09-01 13:15:55 -04` por `admin.test`, con ExpectedCash `20.00`, DeclaredCash `20.00` y Difference `0.00`.
- **Observed:** los shifts son `MORNING COMPLETED` (`08:37`–`13:14`) y `NIGHT COMPLETED` (`13:14`–`13:15`), la secuencia aprobada. El ID no es demo-prefix; `docs/demo-dataset.md` indica que la migration no inserta `2026-09-01` y solo existe esta sesión creada por el usuario. El origen se clasifica como `MANUAL_TEST` (`admin.test`).
- **Expected:** exactamente una `CashSession` por `BusinessDate`, con `MORNING → handover → NIGHT → un cierre final`, sin reopen ni segunda sesión. Una sesión CLOSED existente no debe inducir otra sesión; que `OperationsService.OpenAsync` encuentre cualquier sesión existente y no cree una segunda es comportamiento esperado para esta invariante.
- **Impact:** ninguno bloqueante; el estado observado conforma el lifecycle aprobado y demuestra un día actual completado/cerrado.
- **Reproduction/inspection:** se consultó el estado actual y se inspeccionó el lookup por `BusinessDate` de `OperationsService.OpenAsync`. No se ejecutó una prueba de fecha nueva: no era necesaria y no fue realizada. Tampoco se ejecutó mutation smoke ni se alteró la DB.
- **Negative evidence:** no hay evidencia de que una sesión CLOSED bloquee un `BusinessDate` nuevo, de que `BusinessClock` sea incorrecto, de que `OpenAsync` falle cuando no existe sesión, ni de que la migration haya insertado la fecha actual.
- **Confidence:** `HIGH` sobre el estado observado y su clasificación operacional.
- **Recommended disposition:** `informational; no action required for Sprint 3 continuation`.

### F-002 — Nullability de OpenOperationalDayRequest diverge entre runtime y contrato generado

- **Severity:** `MEDIUM`
- **Category:** `CONTRACT`
- **Affected HU/Flow:** Shift Open; `OpenOperationalDayRequest`.
- **Evidence:** `RUNTIME_CONFIRMED`/`STATIC_CONFIRMED`: runtime rechaza null/negativos; OpenAPI permite request `null` y propiedades nullable; generated TypeScript conserva propiedades required-nullable y request body opcional.
- **Observed:** clientes generados pueden construir una forma que el runtime rechaza, aunque la UI actual envía los dos valores.
- **Expected:** DTO, OpenAPI, generated TypeScript y consumer deben expresar la misma obligatoriedad.
- **Impact:** riesgo para clientes externos/regenerados y falsa seguridad de tipos; no es blocker autónomo porque la UI protege el flujo.
- **Reproduction/inspection:** trace de cuatro capas incluido en Contract Audit; no se regeneró `api.generated.ts`.
- **Confidence:** `HIGH`.
- **Recommended disposition:** `fix during next related HU/change`.

### F-003 — Usuarios demo sin asignación de roles ASP.NET

- **Severity:** `MEDIUM`
- **Category:** `AUTH`
- **Affected HU/Flow:** demo identity/readiness; usuarios `demo.*`.
- **Evidence:** `RUNTIME_CONFIRMED` mediante consulta read-only: cuatro usuarios `demo.*` tienen cero filas en `AspNetUserRoles`; la migration seeds users pero no roles. Docs describen demo users. El set canónico no incluye CAJERO.
- **Observed:** no puede verificarse readiness de autorización por roles para esos usuarios a partir de los datos actuales.
- **Expected:** si los usuarios demo son fixtures operativos, deberían tener asignaciones explícitas coherentes con la documentación; si no, la documentación debe declarar la limitación.
- **Impact:** demo/login role smoke tests pueden ser no representativos; no se afirma password behavior ni un bypass de autorización; no bloquea Sprint 3.
- **Reproduction/inspection:** contar filas de `AspNetUserRoles` por los cuatro usuarios demo; no se alteraron usuarios ni roles.
- **Confidence:** `HIGH`.
- **Recommended disposition:** `fix during next related HU/change`.

### F-004 — Trazabilidad de artifacts HU-026/HU-027 bajo change OpenSpec remanente

- **Severity:** `MEDIUM`
- **Category:** `DOCS`
- **Affected HU/Flow:** lifecycle OpenSpec de Cash Closing.
- **Evidence:** `DOCUMENT_ONLY` + comparación de artifacts locales: no existe `implement-sprint-3-frontend-cash-closing`; el change `implement-sprint-3-remaining-frontend-and-demo-data` contiene tasks/apply/verify Cash 8/8 pese a que proposal/design describen APPLY futuro/no ejecutar.
- **Observed:** la implementación y evidencia de HU-026/027 no están delimitadas por un change independiente coherente con los nombres contractuales.
- **Expected:** artifacts y estado OpenSpec deben reflejar el change que realmente produjo la implementación, sin que un remnant parezca instrucción activa.
- **Impact:** trazabilidad, archive y futuras decisiones pueden interpretar erróneamente el change grande como pendiente; no bloquea Sprint 3.
- **Reproduction/inspection:** inventario de `docs/openspec/changes/` y lectura comparada de proposal/design/spec/tasks/apply/verify; no se movieron artifacts.
- **Confidence:** `HIGH`.
- **Recommended disposition:** `documentation cleanup later`.

### F-005 — Warning de chunk frontend >500 kB

- **Severity:** `LOW`
- **Category:** `PERFORMANCE`
- **Affected HU/Flow:** HU-015 PDF/build frontend.
- **Evidence:** `AUTOMATED_GATE_CONFIRMED`: `pnpm run build` PASS con warning no fatal de Vite por chunk minificado mayor a 500 kB.
- **Observed:** el build termina correctamente, pero el bundle contiene deuda de tamaño asociada al uso de jsPDF/compilación.
- **Expected:** no hay requisito de blocker; una optimización futura puede reducir el chunk sin alterar este audit.
- **Impact:** potencial costo de carga, sin degradación funcional observada; no bloquea Sprint 3.
- **Reproduction/inspection:** ejecutar el build frontend exacto del verify report; no se modificó dependencia ni import.
- **Confidence:** `HIGH`.
- **Recommended disposition:** `non-blocking technical debt`.

### F-006 — Validación browser responsive/a11y no ejecutada

- **Severity:** `INFO`
- **Category:** `UX`
- **Affected HU/Flow:** HU-014, HU-015, HU-025, HU-026, HU-027.
- **Evidence:** `PENDING_EXTERNAL`; no hubo browser usable en esta sesión.
- **Observed:** solo existe evidencia estática/automatizada para responsive y a11y; no existen screenshots ni resultados de viewport.
- **Expected:** validar manualmente 360 px, aproximadamente 768 px y >=1280 px antes de cerrar la evidencia visual.
- **Impact:** quedan sin confirmar overflow, foco real y usabilidad visual en runtime; no se clasifica como fallo de producto y no bloquea Sprint 3.
- **Reproduction/inspection:** limitación de entorno; no se inventó PASS.
- **Confidence:** `HIGH` sobre la ausencia de evidencia, no sobre un defecto visual.
- **Recommended disposition:** `no action / informational`.

## Expected Operational State

La invariante aprobada es exactamente una `CashSession` por `BusinessDate`, seguida por `MORNING → handover → NIGHT → un cierre final`, sin reopen ni segunda sesión. La evidencia read-only actual satisface esa invariante: la sesión manual de `2026-09-01` está cerrada, sus dos shifts están `COMPLETED`, el cierre cuadra en `0.00` y no fue insertada por la migration demo. No se propone eliminar, reabrir ni duplicar la sesión, modificar el unique constraint, resetear datos ni aplicar un fix equivalente.

## Intentional Pending Scope

La ausencia de frontend para HU-008, HU-019, HU-021, HU-023, HU-024, HU-028, HU-029, HU-030 y HU-031 continúa siendo pendiente intencional de scope, no defecto. Para HU-014, HU-015, HU-025, HU-026 y HU-027, la validación browser responsive/a11y permanece `PENDING_EXTERNAL`; el estado `UNKNOWN_REQUIRES_RUNTIME_VALIDATION` de la matriz conserva únicamente ese unknown de evidencia visual, no una falla del dominio Shift/Cash. No se inventan screenshots, mutation smoke ni una prueba de fecha nueva.

## Recommended Next Actions

1. **`FIX_DURING_NEXT_RELATED_CHANGE`:** alinear nullability de `OpenOperationalDayRequest` entre DTO/runtime, OpenAPI y generated client; resolver explícitamente la readiness de roles de usuarios demo sin asumir comportamiento de password.
2. **`DOCUMENTATION_CLEANUP_LATER`:** separar o reclasificar los artifacts OpenSpec de HU-026/HU-027 y dejar claro que el change remanente no es una instrucción activa.
3. **`NON-BLOCKING_TECHNICAL_DEBT`:** evaluar el warning de chunk PDF.
4. **`INFORMATIONAL`:** ejecutar validación browser responsive/a11y externa y adjuntar evidencia real.

Ninguna acción fue implementada por esta auditoría.

## Final Baseline Verdict

`SPRINT_3_BASELINE_HEALTHY_WITH_FINDINGS`

**AUDIT_TASKS_COMPLETE: YES**
**AUDIT_VERIFY_PASS: YES**
**REAL_BLOCKERS_PRESENT: NO**
**SAFE_TO_CONTINUE_SPRINT_3: YES**

Este audit no es una decisión de production readiness y no utiliza `RELEASE_READY`.

<!-- AUDIT_ARTIFACT_END: system-current-state-audit -->
