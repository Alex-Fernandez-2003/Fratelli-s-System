# Tasks

Planned task count: 28.

All implementation-changing tasks: NO.

All audit objectives use Markdown checkboxes: YES.

## Task 1: Auditar la baseline Git local

- Objective:
  - [x] Registrar branch, HEAD, recent log, working tree, staged, unstaged y untracked antes de cualquier inspección profunda.
- Files or areas likely involved:
  Repositorio completo; Git metadata read-only.
- Execution notes:
  Usar solo comandos Git read-only. No normalizar el working tree aunque esté dirty.
- Verification method:
  Sección `Git Baseline` con evidencia exacta de branch, HEAD y estado local.
- Dependencies:
  None.

## Task 2: Reconstruir el estado OpenSpec

- Objective:
  - [x] Inventariar changes activos/archivados y clasificar los changes recientes de Sprint 3.
- Files or areas likely involved:
  `docs/openspec/changes/`, archive y paths equivalentes reales.
- Execution notes:
  Localizar Customers/Sales, Cash Closing y el large remaining-frontend change. Detectar remnants, superseded y artifacts bajo change incorrecto.
- Verification method:
  Tabla change → estado → HUs → evidencia → inconsistencia.
- Dependencies:
  Task 1.

## Task 3: Reconstruir el alcance real de Sprint 3

- Objective:
  - [x] Determinar desde documentación local el conjunto completo de HUs de Sprint 3.
- Files or areas likely involved:
  Product backlog, sprint docs, HU docs, OpenSpec.
- Execution notes:
  No limitarse a IDs mencionados en el prompt. Distinguir scope actual y post-MVP/out-of-scope.
- Verification method:
  Lista canónica de HUs Sprint 3 con fuente.
- Dependencies:
  Tasks 1-2.

## Task 4: Construir la matriz inicial de estado Sprint 3

- Objective:
  - [x] Crear la matriz Backend/Frontend/Tests/Docs/OpenSpec/Estado para todas las HUs descubiertas.
- Files or areas likely involved:
  Whole repo references per HU.
- Execution notes:
  Inicializar reciente frontend como unverified; marcar pending-by-scope solo con evidencia.
- Verification method:
  Matriz completa sin HUs Sprint 3 omitidas.
- Dependencies:
  Task 3.

## Task 5: Auditar package y arquitectura frontend compartida

- Objective:
  - [x] Inspeccionar package manager, scripts, lockfile, AppShell, routes, auth, Query, HTTP, ProblemDetails, formatters, feedback y shared components.
- Files or areas likely involved:
  Frontend package/config, application shell y shared infrastructure.
- Execution notes:
  Documentar arquitectura real. No refactor.
- Verification method:
  Inventario factual de infraestructura con paths reales.
- Dependencies:
  Task 1.

## Task 6: Buscar duplicaciones y bypasses frontend

- Objective:
  - [x] Buscar second API clients, raw fetch, hardcoded URLs, Bearer manual, query keys duplicadas, auth/role matrices duplicadas, dialogs, formatters, DTOs y routes duplicados.
- Files or areas likely involved:
  Frontend completo.
- Execution notes:
  Evaluar contexto antes de clasificar un patrón como defecto.
- Verification method:
  Findings o declaración factual `no issue found` por categoría buscada.
- Dependencies:
  Task 5.

## Task 7: Auditar HU-014 Customers

- Objective:
  - [x] Verificar route, navigation, roles, search, status filter, server pagination, CRUD permitido, lifecycle, validation y responsive implementation.
- Files or areas likely involved:
  Customers feature, routes, navigation, API/query layer, tests.
- Execution notes:
  Comparar ADMIN/ENC/MESERO y multi-role. No modificar la implementación.
- Verification method:
  Checklist HU-014 con evidence level y findings.
- Dependencies:
  Tasks 4-6.

## Task 8: Auditar profundamente Customer → ConfirmSale

- Objective:
  - [x] Verificar selector opcional, active-only, búsqueda, Consumidor final, quick-create, auto-select, cancel-preservation, duplicate errors y payload customerId.
- Files or areas likely involved:
  ConfirmSale/Checkout, Customer form/query/mutation, Sale request.
- Execution notes:
  Auditar regresión de PaymentMethod, SalesChannel, shortage, Shift, ENTREGADO y final Sale mutation.
- Verification method:
  Data-flow trace Customer/Consumer final → ConfirmSale request + regression checklist.
- Dependencies:
  Task 7.

## Task 9: Auditar HU-015 Sales History

- Objective:
  - [x] Verificar route, nav, default-today, filters, pagination, query keys, MESERO scope, responsive y detail on-demand.
- Files or areas likely involved:
  Sales History feature, queries, routes, tests.
- Execution notes:
  Verificar enum Payment/Channel y multi-role broader scope.
- Verification method:
  Checklist HU-015 list/scope con evidence levels.
- Dependencies:
  Tasks 4-6.

## Task 10: Auditar Sale Detail y Customer snapshots

- Objective:
  - [x] Verificar metadata/items/totals/Sale ID y demostrar si Customer snapshots se usan sin current-customer reconstruction.
- Files or areas likely involved:
  Sale detail components/query/API/generated types.
- Execution notes:
  Buscar IVA/discount/fake number/reprint behavior no soportado.
- Verification method:
  Trace Sale snapshot → DTO → detail.
- Dependencies:
  Task 9.

## Task 11: Auditar el PDF de HU-015

- Objective:
  - [x] Verificar client-side generation, disclaimer, snapshot source, dependency, imports y bundle impact.
- Files or areas likely involved:
  PDF adapter/utility, Sale Detail, package manifest, lockfile.
- Execution notes:
  No actualizar dependencia. Registrar warning >500k como performance debt salvo evidencia mayor.
- Verification method:
  Dependency/import map + build evidence posterior.
- Dependencies:
  Tasks 5, 10.

## Task 12: Auditar el bugfix Iniciar jornada

- Objective:
  - [x] Verificar modal, openingAmount, pettyCashOpeningAmount, validación y exact request body.
- Files or areas likely involved:
  Shifts pages/components/API/mutations/generated types.
- Execution notes:
  Revisar required, zero, negative, decimals y comma/dot behavior.
- Verification method:
  Static trace button → modal → parsed values → mutation request.
- Dependencies:
  Tasks 4-6.

## Task 13: Auditar estado y errores de Shift Open mutation

- Objective:
  - [x] Verificar pending, duplicate submit, 400/network behavior, preserved values, success y query invalidation.
- Files or areas likely involved:
  Shift mutation, query factories, modal state.
- Execution notes:
  No corregir invalidation ni form behavior.
- Verification method:
  Mutation-state checklist + existing tests/runtime evidence cuando disponible.
- Dependencies:
  Task 12.

## Task 14: Auditar OpenOperationalDayRequest y nullability

- Objective:
  - [x] Comparar backend DTO, runtime validation, OpenAPI, generated TypeScript y frontend call para ambos opening amounts.
- Files or areas likely involved:
  Backend request/validation, OpenAPI configuration/schema, generated API, Shift frontend.
- Execution notes:
  Si persiste mismatch, registrar `CONTRACT_DRIFT` y justificar severidad. No regenerar.
- Verification method:
  Tabla layer-by-layer con nullable/required final.
- Dependencies:
  Tasks 12-13.

## Task 15: Auditar HU-026 Cash Preview

- Objective:
  - [x] Verificar endpoint/query/retry/404/loading/error, expectedCash authority, payment/channel, expenses y handover context.
- Files or areas likely involved:
  Cash preview feature, API/query/generated contract.
- Execution notes:
  Buscar fórmula frontend que compita como authority y double-count de carried forward.
- Verification method:
  DTO → UI mapping trace + query-state audit.
- Dependencies:
  Tasks 4-6, 14.

## Task 16: Auditar HU-027 Cash Close

- Objective:
  - [x] Verificar declared cash, difference preview, conditional observation, whitespace, confirmation, payload, responsible, pending y success.
- Files or areas likely involved:
  Cash close form/modal/API/mutation.
- Execution notes:
  Comparar payload con backend/generated contract; verificar que response final sustituye provisional state.
- Verification method:
  Static data-flow + existing tests/runtime evidence.
- Dependencies:
  Task 15.

## Task 17: Auditar conflicto y recuperación de Cash Close

- Objective:
  - [x] Verificar 400/404/409, no retry de POST, invalidation/refetch y stale-form behavior.
- Files or areas likely involved:
  Cash mutation/query/error mapping.
- Execution notes:
  No cambiar retry config.
- Verification method:
  Error/status matrix para HU-027.
- Dependencies:
  Task 16.

## Task 18: Auditar routing, navigation y autorización reciente

- Objective:
  - [x] Construir route matrix y comprobar Customer, Sales History y Cash routes contra navigation/guards/backend policy.
- Files or areas likely involved:
  AppRoutes, navigation registry, AuthProvider, role helpers y backend policies.
- Execution notes:
  Buscar duplicate/dead routes, wrong active state y single-role regressions.
- Verification method:
  Route × guard × nav × backend-role matrix.
- Dependencies:
  Tasks 7-17.

## Task 19: Auditar TanStack Query y API integration reciente

- Objective:
  - [x] Revisar query keys, filters, pagination, stale/retry, invalidation y request patterns de Customers, Sales History, Shift Open, Cash Preview y Cash Close.
- Files or areas likely involved:
  Query factories/hooks/API layer.
- Execution notes:
  Detectar loops, collisions, N+1, eager detail y duplicate mutations.
- Verification method:
  Query Integration Matrix + findings.
- Dependencies:
  Tasks 7-18.

## Task 20: Auditar backend y contracts transversales

- Objective:
  - [x] Revisar solution, DI, endpoints, policies, ProblemDetails y critical services que soportan los cambios recientes.
- Files or areas likely involved:
  Backend API/Application/Infrastructure/Domain pertinentes.
- Execution notes:
  No convertirlo en review exhaustivo de todo backend; priorizar integration boundaries.
- Verification method:
  Backend audit section + contract comparison.
- Dependencies:
  Tasks 14-19.

## Task 21: Auditar generated API synchronization

- Objective:
  - [x] Determinar si backend/OpenAPI/generated TypeScript/frontend consumer están sincronizados.
- Files or areas likely involved:
  Backend DTO/endpoints, existing OpenAPI evidence/config, `api.generated.ts`, call sites.
- Execution notes:
  No ejecutar generación. Inspeccionar Customer, ConfirmSale, Sales History, Shift Open, Cash Preview, Cash Close.
- Verification method:
  Final classification `SYNCED`, `DRIFT DETECTED` o `UNKNOWN_REQUIRES_RUNTIME_VALIDATION`.
- Dependencies:
  Tasks 14, 20.

## Task 22: Auditar migrations y demo data

- Objective:
  - [x] Inventariar migrations y revisar profundamente la migration demo, ModelSnapshot, determinism, Up, Down, FKs y destructive behavior.
- Files or areas likely involved:
  EF Core migrations/snapshot.
- Execution notes:
  No aplicar sobre DB compartida ni modificar migration.
- Verification method:
  Migration audit matrix y findings DATABASE.
- Dependencies:
  Tasks 1, 20.

## Task 23: Auditar coherencia e interferencia del dataset demo

- Objective:
  - [x] Revisar coherencia de los dominios seeded y riesgo de interferir con current BusinessDate/Shift/CashSession.
- Files or areas likely involved:
  Demo migration + domain constraints/services read-only.
- Execution notes:
  Revisar Customers, Suppliers, Products, Inventory, Production, Purchases, Orders, Sales, Expenses, Shifts, Attendance, CashSession y CashClosing solo cuando estén realmente seeded.
- Verification method:
  Demo Data Coverage/Coherence Matrix y current-operation risk assessment.
- Dependencies:
  Task 22.

## Task 24: Revisar los flujos funcionales generales

- Objective:
  - [x] Auditar integración de Auth, Catalog/Inventory/Production, Purchase, Order/Sale, Shift/Cash, Expense y Attendance.
- Files or areas likely involved:
  Features/backend services implicados.
- Execution notes:
  Prioridad máxima a Order→Sale y Shift→Cash. No exigir HUs frontend intencionalmente pendientes.
- Verification method:
  Functional Flow Review con estado/finding por boundary.
- Dependencies:
  Tasks 7-23.

## Task 25: Ejecutar quality gates frontend

- Objective:
  - [x] Ejecutar format:check, typecheck, lint, full tests y build usando scripts reales disponibles.
- Files or areas likely involved:
  Frontend tooling/tests; no product edits.
- Execution notes:
  Registrar errores/warnings. No corregir. Si dependencies faltan, distinguir tooling limitation de product failure.
- Verification method:
  Tabla command → exit → evidence; incluir chunk warnings.
- Dependencies:
  Tasks 5-24.

## Task 26: Ejecutar quality gates backend

- Objective:
  - [x] Ejecutar restore, build y full tests sobre la solution real cuando el tooling esté disponible.
- Files or areas likely involved:
  Backend solution/tests; transient build outputs only.
- Execution notes:
  No modificar source para resolver fallos.
- Verification method:
  Tabla command → exit → test summary/error.
- Dependencies:
  Tasks 20-24.

## Task 27: Auditar responsive, accesibilidad y documentación

- Objective:
  - [x] Revisar responsive/a11y de cambios recientes y comparar HU docs con el estado real.
- Files or areas likely involved:
  Customers, ConfirmSale, Sales History/Detail, Shift Open, Cash Preview/Close, HU docs.
- Execution notes:
  Usar 360/~768/>=1280 cuando browser esté disponible. Si no, marcar `PENDING_EXTERNAL`. No reescribir docs.
- Verification method:
  Responsive/A11y checklist + Documentation Drift table.
- Dependencies:
  Tasks 7-26.

## Task 28: Clasificar findings y emitir el current-state report

- Objective:
  - [x] Consolidar findings, completar HU Matrix, priorizar next actions y emitir `system-current-state-audit.md` con verdict permitido.
- Files or areas likely involved:
  Audit change artifacts only.
- Execution notes:
  Ordenar BLOCKER→HIGH→MEDIUM→LOW→INFO. Separar pending-by-scope de bugs. No implementar recomendaciones.
- Verification method:
  Report contiene todas las secciones requeridas, exact HU classifications, evidence levels, recommended dispositions y uno de los tres baseline verdicts.
- Dependencies:
  Tasks 1-27.

## Review Workload Forecast

- Estimated LoC changed:
  250–700 LoC de documentación/artifacts de auditoría. Product source LoC changed: 0.
- Risk of exceeding 400 LoC review threshold:
  Medium/High porque `system-current-state-audit.md` puede ser extenso; el tamaño documental no justifica fragmentar el OpenSpec change.
- Recommendation:
  Single PR/change documental para la auditoría.
- Suggested split if chained:
  No se recomienda dividir el audit por HU. Si la evidencia genera un informe excepcionalmente grande, mantener UN change y separar únicamente commits documentales por baseline/evidence/final report sin crear changes OpenSpec adicionales.
