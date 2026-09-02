# Tasks

## Task 1: Revalidar baseline local y contrato HU-028

- Objective:
  - [x] Confirmar branch, HEAD, working tree, OpenSpec state, HU-026/HU-027/HU-028 backend, generated API, frontend Cash feature, routes, navigation, tests y migration state.
- Files or areas likely involved:
  Git read-only; Operations/Cash backend; generated TypeScript; cash frontend; route/navigation; HU/OpenSpec docs.
- Execution notes:
  Verificar específicamente si `/api/v1/cash/closings` local continúa aceptando solo page/pageSize o ya soporta from/to. Confirmar CashHistory roles y campos exactos de CashClosingDto.
- Verification method:
  Matriz factual con History, Detail, Pagination, Period, Responsible, Summary, roles y snapshot fields.
- Dependencies:
  None.

## Task 2: Resolver el gap contractual del período

- Objective:
  - [x] Registrar la decisión explícita D19 / OPTION A porque el contrato local continúa sin filtros from/to.
- Files or areas likely involved:
  OpenSpec proposal/spec/design; no product code hasta resolución.
- Execution notes:
  D19 / OPTION A autoriza la extensión mínima del existing endpoint con `from` y `to` date-only, inclusivos sobre `CashClosing.BusinessDate`, antes de ordenar y paginar. No implementar client filtering ni descargar todo el histórico.
- Verification method:
  D3 queda soportada por el contrato autorizado D19; no se crea endpoint, DTO, schema ni migration.
- Dependencies:
  Task 1.

## Task 3: Extender endpoints/query keys frontend de Cash History

- Objective:
  - [x] Añadir las definiciones frontend necesarias para History y Detail utilizando el generated contract autorizado.
- Files or areas likely involved:
  Endpoint registry; existing cash API/query-key module.
- Execution notes:
  Extender `cashKeys`; no raw fetch; no segundo API layer; no handwritten DTO.
- Verification method:
  API/query tests confirman URL, params, query keys y generated types.
- Dependencies:
  Task 2 resuelta.

## Task 4: Añadir `/turnos/cierres` y su guard

- Objective:
  - [x] Crear la route HU-028 para ADMIN/ENC/CONTADORA y denegar los demás roles.
- Files or areas likely involved:
  AppRoutes; cash role/capability constants; history page entry.
- Execution notes:
  No modificar `/turnos/cierre` ni ampliar CashManage a CONTADORA.
- Verification method:
  Route tests para seis roles canónicos y un caso multi-role.
- Dependencies:
  Tasks 1-3.

## Task 5: Integrar navegación explícita de Cierres de caja

- Objective:
  - [x] Proporcionar acceso explícito a `/turnos/cierres` sin obligar a CONTADORA a visitar una pantalla operativa.
- Files or areas likely involved:
  Existing navigation registry; Turnos/Caja page actions; role-aware targets.
- Execution notes:
  Reutilizar la infraestructura real de navegación. No conceder `SHIFT_MANAGE_ROLES` a CONTADORA y no crear un segundo AppShell.
- Verification method:
  ADMIN/ENC/CONTADORA disponen de ruta navegable correcta; CONTADORA no recibe `/turnos/cierre`.
- Dependencies:
  Task 4.

## Task 6: Implementar filtros y server pagination

- Objective:
  - [x] Implementar Current Month, from/to server-side, page reset, clear-default y pagination de acuerdo con el contrato resuelto.
- Files or areas likely involved:
  Cash History page; date-filter state; cash query hooks; shared pagination/filter primitives.
- Execution notes:
  Responsible se añade solo si el contract real lo soporta. No current-page filtering.
- Verification method:
  Tests de default, params, clear, page reset y pagination.
- Dependencies:
  Tasks 2-5.

## Task 7: Implementar listado desktop compacto

- Objective:
  - [x] Renderizar la vista desktop con BusinessDate, actor, ClosedAt, expected, declared, difference y Detail.
- Files or areas likely involved:
  Cash History page; DataTable; cash formatters.
- Execution notes:
  No breakdowns detallados en table. No N+1 de usuarios. Usar real actor ID/display field disponible.
- Verification method:
  List tests para fields, ordering presentation y ausencia de historical mutations.
- Dependencies:
  Task 6.

## Task 8: Implementar cards mobile

- Objective:
  - [x] Crear representación mobile sin horizontal table squeezing.
- Files or areas likely involved:
  Cash History page; Card/shared responsive primitives.
- Execution notes:
  Mantener BusinessDate, expected, declared, difference semantic y Detail action.
- Verification method:
  Component tests verifican que la composición mobile contiene la reconciliación esencial.
- Dependencies:
  Task 7.

## Task 9: Consolidar semántica de diferencia

- Objective:
  - [x] Reutilizar/extender el formatter actual para Sobrante/Faltante/Cuadrado con signo real y texto accesible.
- Files or areas likely involved:
  Current cash formatter; History/list/detail.
- Execution notes:
  Evitar formatter paralelo. Color solo complementario.
- Verification method:
  Tests explícitos para positive, negative y zero.
- Dependencies:
  Tasks 7-8.

## Task 10: Implementar Detail on-demand

- Objective:
  - [x] Integrar `GET /cash/closings/{id}` en el overlay de detalle responsive existente.
- Files or areas likely involved:
  Cash API/query; Detail overlay; shared Drawer/Sheet/Modal.
- Execution notes:
  Fetch solo al abrir. No nueva route de detail salvo necesidad técnica demostrada por architecture local.
- Verification method:
  Test comprueba una request on-demand por closing seleccionado y cache separada por ID.
- Dependencies:
  Tasks 3, 7.

## Task 11: Renderizar el snapshot inmutable completo soportado

- Objective:
  - [x] Mostrar openings, removed cash, payment/channel/expense breakdowns, expected, declared, difference, observation, actor y ClosedAt usando solo CashClosingDto.
- Files or areas likely involved:
  Cash Closing Detail.
- Execution notes:
  No CashSession/Sales/Expenses lookups. No carried-forward si contract no lo contiene. No firma, last modification o ID sintético.
- Verification method:
  Snapshot tests cubren fields reales, observation null y ausencia de campos no soportados.
- Dependencies:
  Task 10.

## Task 12: Verificar PaymentMethod versus SalesChannel

- Objective:
  - [x] Mantener secciones y labels independientes para medios de pago y canales.
- Files or areas likely involved:
  Cash Closing Detail; existing cash labels/formatters.
- Execution notes:
  PedidosYa únicamente en Canales. EXTERNAL únicamente como Pago externo.
- Verification method:
  Test explícito comprueba que PedidosYa no aparece bajo Medios de pago.
- Dependencies:
  Task 11.

## Task 13: Extender success HU-027 con historial

- Objective:
  - [x] Añadir `Ver historial de cierres` como acción secundaria después de un cierre exitoso.
- Files or areas likely involved:
  Existing CashClosingPage success state.
- Execution notes:
  No redirect automático. Preservar confirmation, current snapshot y existing navigation actions salvo ajuste mínimo de jerarquía.
- Verification method:
  Existing HU-027 success tests pasan y el nuevo link apunta a `/turnos/cierres`.
- Dependencies:
  Task 4.

## Task 14: Completar loading, empty, error y legacy-safe presentation

- Objective:
  - [x] Integrar Skeleton, current-period empty, filtered-empty, retry y empty-value behavior.
- Files or areas likely involved:
  Cash History/Detail; shared query-state primitives.
- Execution notes:
  No raw exception, no fake connectivity copy, no reconstrucción de missing historical fields.
- Verification method:
  Focused tests para loading, empty, filtered empty, error/retry, observation null y optional display metadata.
- Dependencies:
  Tasks 6-12.

## Task 15: Endurecer responsive y accesibilidad a nivel de código

- Objective:
  - [x] Asegurar estructura responsive-ready y semantics accesibles sin convertir browser evidence en requisito de finalización.
- Files or areas likely involved:
  Cash History page; Detail overlay; filters; table/cards/pagination.
- Execution notes:
  Labels, focus, focus return, keyboard close, textual difference, accessible action names. Manual screenshots quedan deferred.
- Verification method:
  Component/a11y assertions disponibles + static review. Documentar `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
- Dependencies:
  Tasks 8, 10, 14.

## Task 16: Ejecutar regresión focalizada HU-026/HU-027

- Objective:
  - [x] Confirmar que History integration no altera Preview, Close, difference, observation, confirmation, 409 ni success.
- Files or areas likely involved:
  Existing cash tests and touched CashClosingPage/API.
- Execution notes:
  No reescribir HU-026/HU-027. El único cambio esperado en success es la acción History.
- Verification method:
  Existing focused cash tests green más tests específicos del history link.
- Dependencies:
  Tasks 13-15.

## Task 17: Ejecutar full frontend gates y validar generated state

- Objective:
  - [x] Ejecutar format, typecheck, lint, full tests y build usando package scripts reales.
- Files or areas likely involved:
  Frontend tooling.
- Execution notes:
  Regenerar TypeScript desde el OpenAPI runtime después del filtro backend D19. Registrar counts reales, no históricos, y documentar únicamente drift generado relevante.
- Verification method:
  Todos los comandos obligatorios pasan y el generated diff contiene únicamente `from?: string` y `to?: string` bajo el backend D19 autorizado.
- Dependencies:
  Task 16.

## Task 18: Ejecutar regresión backend/EF requerida por convención

- Objective:
  - [x] Ejecutar los gates backend/EF que el workflow OpenSpec real requiera aunque no se espere product diff backend.
- Files or areas likely involved:
  Backend solution/test infrastructure; EF checks.
- Execution notes:
  Ejecutar regresión backend/EF incluyendo los focused tests de D19. Si el runner monoproceso agota clientes PostgreSQL, repetir por proyecto/clase en procesos secuenciales y registrar ambos resultados. No añadir migration ni cambiar el modelo; Expected migration/model change: NONE.
- Verification method:
  Backend regression factual y pending-model state registrados.
- Dependencies:
  Task 17.

## Task 19: Actualizar documentación factual y preparar evidencia diferida

- Objective:
  - [x] Actualizar HU-028/OpenSpec con paths, contracts, files y tests reales, y crear placeholders para Sprint Final Audit.
- Files or areas likely involved:
  HU-028 documentation; OpenSpec apply/verify artifacts according to local convention.
- Execution notes:
  Backend se documenta como extensión mínima del endpoint existente bajo D19; no hay cambio de modelo/migration. Manual responsive/a11y permanece unchecked y `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
- Verification method:
  Docs no contienen test counts ficticios, screenshots fabricados ni backend changes inexistentes.
- Dependencies:
  Tasks 17-18.

## Task 20: Verificar readiness del bloque

- Objective:
  - [x] Trazar cada acceptance criterion a evidencia y confirmar límites de scope.
- Files or areas likely involved:
  OpenSpec verification artifacts only.
- Execution notes:
  Confirmar:
  - route/auth;
  - filter;
  - pagination;
  - list;
  - detail;
  - snapshot authority;
  - payment/channel;
  - read-only;
  - HU-027 link;
  - no export;
  - no reporting;
  - no migration;
  - backend/generated state factual.
- Verification method:
  Verify report sin gaps técnicos bloqueantes y manual evidence marcado como deferred informacional.
- Dependencies:
  Tasks 1-19.

## Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High
Delivery decision: exception-ok — continuous cohesive apply explicitly authorized by maintainer.

- Estimated LoC changed:
  Aproximadamente 700–1,300 LoC entre filtro backend D19, history/query UI, detail, routing/navigation, tests y docs.
- Risk of exceeding 400 LoC review threshold:
  High para el bloque completo; Low/Medium por unidad lógica.
- Recommendation:
  Chained PRs o work units bajo UN ÚNICO OpenSpec change; la excepción autorizada permite aplicar el bloque cohesivamente.
- Suggested split if chained:
  - Work unit 1: contract/query/route/navigation.
  - Work unit 2: history filters/list/mobile.
  - Work unit 3: detail/snapshot/difference semantics.
  - Work unit 4: HU-027 integration + regressions.
  - Work unit 5: gates/docs/evidence placeholders.

  Estos work units no son approval boundaries una vez resuelto el blocker de producto.

  Product decisions currently required:
  - Ninguna; D19 / OPTION A quedó autorizada explícitamente.

  Generator verdict:
  `SPRINT_3_BLOCK_4_PRODUCT_DECISION_REQUIRED: RESOLVED_BY_D19_OPTION_A`

  Ready:
  `READY_FOR_SPRINT_3_BLOCK_4_APPLY: YES`
