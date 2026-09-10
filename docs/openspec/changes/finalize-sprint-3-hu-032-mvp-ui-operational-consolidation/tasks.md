# Tasks

## Task 1: Auditar la baseline local real

- Objective:
  - [x] Registrar repository root, branch, HEAD, working tree, staged/unstaged/untracked, migrations, active/archive OpenSpec y estado real de HU-008–HU-031.
- Files or areas likely involved:
  Repository root; Git read-only; docs/OpenSpec; backend/frontend roots; migrations.
- Execution notes:
  No modificar producto. No reset, restore, clean, stash, checkout, switch, rebase o merge.
- Verification method:
  Baseline factual documentada con branch, HEAD, status y change inventory.
- Dependencies:
  None.

## Task 2: Extraer e inspeccionar las 74 referencias visuales

- Objective:
  - [x] Abrir las 74 imágenes de `Pantallas.zip`, verificar contenido real y completar la matriz KEEP/ADAPT/REPLACE/OMIT/MANUAL-LATER.
- Files or areas likely involved:
  `Pantallas.zip`; design audit artifact embedded in this change.
- Execution notes:
  No usar únicamente nombres de archivo. Comparar visualmente cada referencia con la pantalla local correspondiente. No implementar todavía.
- Verification method:
  74/74 filas con contenido inspeccionado, route/feature, mismatch, decisión y evidence target.
- Dependencies:
  Task 1.

## Task 3: Mapear referencias a rutas y componentes reales

- Objective:
  - [x] Resolver para cada referencia su route real, feature slice, roles/capabilities y shared primitives actuales.
- Files or areas likely involved:
  Routing; navigation; AppShell; feature folders; shared UI.
- Execution notes:
  Detectar pantallas sin route, referencias históricas y experiencias que deben OMITirse.
- Verification method:
  Ninguna de las 74 referencias queda con route/feature ambiguo salvo una justificación explícita.
- Dependencies:
  Tasks 1-2.

## Task 4: Auditar F1–F26 contra la implementación actual

- Objective:
  - [x] Reproducir/documentar el estado actual de cada decisión funcional y clasificar la capa real causante.
- Files or areas likely involved:
  All affected frontend features; relevant backend endpoints/services; generated API.
- Execution notes:
  Clasificar backend gap como NONE, QUERY_CHANGE, DTO_EXTENSION, READ_ENDPOINT_MINIMAL, VALIDATION_CHANGE, BUG_FIX o SCHEMA_BLOCKER.
- Verification method:
  Matriz F1–F26 actualizada con evidencia real, no hipótesis.
- Dependencies:
  Tasks 1-3.

## Task 5: Reconciliar contratos backend y generated API antes de editar

- Objective:
  - [x] Confirmar contracts reales de Kitchen, Production, Attendance, Shift/Cash, Supplier y Expense.
- Files or areas likely involved:
  Backend endpoint/application/domain/infrastructure layers; runtime OpenAPI; generated TypeScript.
- Execution notes:
  Reusar endpoint antes de extenderlo. No crear migration. No regenerar TS todavía.
- Verification method:
  Contract matrix con request/response/filter/nullability/auth y decisión de cambio.
- Dependencies:
  Task 4.

## Task 6: Auditar y consolidar primitives visuales compartidos

- Objective:
  - [x] Inventariar PageHeader, Card, MetricCard, Button, IconButton, DataTable, MobileCard, FilterBar, Drawer, Sheet, Modal, EmptyState, ErrorState, Skeleton, Tooltip y formatters existentes.
- Files or areas likely involved:
  Shared frontend UI/design-system areas.
- Execution notes:
  No crear un design-system rewrite. Identificar únicamente extensiones reutilizables necesarias.
- Verification method:
  Lista de primitives a REUSE/EXTEND y duplicaciones que no deben proliferar.
- Dependencies:
  Tasks 1-3.

## Task 7: Consolidar la convención de icon actions

- Objective:
  - [x] Reusar la icon library actual y establecer Eye/Edit/Deactivate semánticos con accesibilidad uniforme.
- Files or areas likely involved:
  Shared icon/button primitive; affected history/table features.
- Execution notes:
  No instalar otra icon library. Delete y Deactivate deben conservar significado distinto.
- Verification method:
  Component tests/accessibility assertions para aria-label, focus, disabled y variants.
- Dependencies:
  Task 6.

## Task 8: Diseñar la composición role-aware de Inicio

- Objective:
  - [x] Implementar la foundation de dashboards por capabilities sin duplicar AppShell ni crear métricas ficticias.
- Files or areas likely involved:
  Inicio/dashboard; auth/capabilities; feature query adapters; shared cards.
- Execution notes:
  Consultar únicamente fuentes reales. Evitar request fan-out innecesario.
- Verification method:
  Tests de widget set por roles individuales y multi-role.
- Dependencies:
  Tasks 4-6.

## Task 9: Implementar dashboard ADMINISTRADOR y ENCARGADO

- Objective:
  - [x] Componer dashboards operativos con acciones/métricas reales alineadas a sus referencias.
- Files or areas likely involved:
  Inicio/dashboard and existing operational queries.
- Execution notes:
  Omitir KPIs, payments y auditorías no contractuales.
- Verification method:
  Role tests + no unauthorized/unsupported widget assertions.
- Dependencies:
  Task 8.

## Task 10: Implementar dashboard MESERO y COCINA

- Objective:
  - [x] Componer Inicio operativo para MESERO y COCINA usando exclusivamente capabilities reales.
- Files or areas likely involved:
  Dashboard; orders/kitchen/production/inventory/attendance queries.
- Execution notes:
  No mesas/propinas/precuenta ni cámara/checklist/insumos ficticios.
- Verification method:
  Role tests y query-count sanity.
- Dependencies:
  Task 8.

## Task 11: Implementar dashboard CONTADORA y EMPLEADO

- Objective:
  - [x] Componer Inicio read/analytics para CONTADORA y attendance-first para EMPLEADO.
- Files or areas likely involved:
  Dashboard; reports/cash history/attendance queries.
- Execution notes:
  No P&L, payroll, cash approval, overtime ni incidence modules.
- Verification method:
  Role/multirole tests y absence of unsupported controls.
- Dependencies:
  Task 8.

## Task 12: Corregir F1 — montos reales de Turnos/Caja

- Objective:
  - [x] Trazar DTO→generated type→query→formatter→UI y mostrar los valores reales disponibles.
- Files or areas likely involved:
  Shift/Cash frontend; relevant read contract if needed.
- Execution notes:
  Backend extension solo si el dato aprobado no se expone.
- Verification method:
  Mapping/render tests con cero legítimo, decimal y null.
- Dependencies:
  Tasks 4-5.

## Task 13: Corregir F14 — Resumen de jornada

- Objective:
  - [x] Poblar las cards con campos/métricas reales y eliminar cards sin autoridad de datos.
- Files or areas likely involved:
  Shifts/CashSession/Cash preview UI/query; optional minimal DTO projection.
- Execution notes:
  No crear reporting subsystem.
- Verification method:
  Contract-backed card tests y role visibility.
- Dependencies:
  Tasks 5, 12.

## Task 14: Corregir F3 — Cocina solo del día actual

- Objective:
  - [x] Restringir la consulta operacional de Cocina al business day actual.
- Files or areas likely involved:
  Kitchen backend query/endpoint if needed; frontend query key/API.
- Execution notes:
  Preferir BusinessDate o `[todayStart,tomorrowStart)` en America/La_Paz según contrato real.
- Verification method:
  Deterministic yesterday/today/midnight tests.
- Dependencies:
  Task 5.

## Task 15: Corregir F4 y F5 — Historial de Producción

- Objective:
  - [x] Aplicar default de mes completo y convertir detalle a Eye accesible.
- Files or areas likely involved:
  Production History filters/table/shared icon.
- Execution notes:
  Corregir DateOnly/timestamp en la capa adecuada.
- Verification method:
  Today included + current-month request + Eye action tests.
- Dependencies:
  Tasks 5, 7.

## Task 16: Corregir F6 y F7 — Selector y unidad de Producción

- Objective:
  - [x] Reestructurar búsqueda/lista vertical y mostrar la unidad real del Product seleccionado.
- Files or areas likely involved:
  Register Production form/query/product selector.
- Execution notes:
  Search no selecciona automáticamente. Lista single-select, keyboard usable y no-match state.
- Verification method:
  Search/filter/select/unit component tests.
- Dependencies:
  Tasks 5-6.

## Task 17: Corregir F8 — Validación discreta/divisible de Producción

- Objective:
  - [x] Rechazar cantidades fraccionales para unidades discretas en la autoridad backend y mantener decimales válidos para unidades divisibles.
- Files or areas likely involved:
  Production domain/application validation; frontend validation/input; tests.
- Execution notes:
  Primero identificar semántica real de Unit. Si no existe forma segura de clasificarla, detener esta tarea y elevar product decision.
- Verification method:
  Discrete decimal rejected; discrete integer allowed subject to stock; divisible decimal allowed subject to rules.
- Dependencies:
  Task 5.

## Task 18: Corregir F9 y F10 — defaults de Inventario

- Objective:
  - [x] Configurar Product type por defecto y movimientos del business day actual.
- Files or areas likely involved:
  Inventory filter/query state; business-time helpers.
- Execution notes:
  No mover authorization client-side.
- Verification method:
  Default filter tests y timezone/day-boundary tests.
- Dependencies:
  Tasks 4-5.

## Task 19: Corregir F11 — reachability de `/asistencia/hoy`

- Objective:
  - [x] Añadir entry point visible para capabilities autorizadas reutilizando la route existente.
- Files or areas likely involved:
  Attendance navigation/page actions; route guards.
- Execution notes:
  No crear página duplicada.
- Verification method:
  ADMIN/ENC visible; unauthorized hidden + direct guard preserved.
- Dependencies:
  Tasks 4-5.

## Task 20: Reproducir F12 con un integration test fallido

- Objective:
  - [x] Crear la prueba end-to-end backend de Employee autenticado → CheckIn → CheckOut → GET history → record present.
- Files or areas likely involved:
  Attendance integration tests; auth/test fixtures.
- Execution notes:
  Reproducir primero el fallo real. No corregir visualmente antes de localizar write/read mismatch.
- Verification method:
  Test reproduce el comportamiento reportado o demuestra con evidencia que el bug está en otra capa.
- Dependencies:
  Tasks 1, 4-5.

## Task 21: Corregir F12 en la capa real

- Objective:
  - [ ] Corregir persistence/linkage/BusinessDate/history predicate/query invalidation según la evidencia de Task 20.
- Files or areas likely involved:
  Attendance backend and/or frontend query integration.
- Execution notes:
  No schema change sin product decision. No synthetic row.
- Verification method:
  Mandatory integration test green + persisted-row inspection + focused frontend refetch test.
- Dependencies:
  Task 20.

## Task 22: Documentar F13 — automatic absence post-MVP

- Objective:
  - [x] Reconciliar producto/docs para declarar ausencia automática como no implementada/post-MVP.
- Files or areas likely involved:
  Attendance HU/docs/HU-032 documentation.
- Execution notes:
  No scheduler ni mutation nueva.
- Verification method:
  Docs no afirman automatic absence persistence.
- Dependencies:
  Task 21.

## Task 23: Corregir F15 — eliminar copy HU-026/HU-027

- Objective:
  - [x] Eliminar copy técnico/pending de usuario final en Turnos/Caja/Cierre/success/navigation.
- Files or areas likely involved:
  Shift/Cash frontend strings and later docs.
- Execution notes:
  Mantener IDs de HU únicamente en documentación técnica cuando sean útiles.
- Verification method:
  Text search/test confirms no forbidden user-facing copy.
- Dependencies:
  Tasks 12-13.

## Task 24: Implementar F16 — búsqueda local de cierres

- Objective:
  - [x] Añadir búsqueda por fecha, responsable y declaredCash sobre los registros cargados.
- Files or areas likely involved:
  Cash Closing History frontend.
- Execution notes:
  Trim + case-insensitive; conservar filtro de período y paginación. No prometer búsqueda global.
- Verification method:
  Search tests incluyendo localized date/money and whitespace.
- Dependencies:
  Tasks 4-6.

## Task 25: Implementar F17/F18 — acciones y detalle de Proveedores

- Objective:
  - [x] Convertir acciones a icons y añadir Eye read-only detail con contratos reales.
- Files or areas likely involved:
  Supplier table/components/api only if required.
- Execution notes:
  Reusar row/detail data antes de backend extension. No rating/debt/analytics.
- Verification method:
  Auth + icons + detail field tests.
- Dependencies:
  Tasks 5-7.

## Task 26: Implementar F19/F20 — Compras

- Objective:
  - [x] Aplicar current-month default y Eye para detail preservando create/receive/cancel.
- Files or areas likely involved:
  Purchases page/filter/detail/shared icon.
- Execution notes:
  No reimplementar mutations.
- Verification method:
  Current-month + today inclusion + Eye + mutation regression tests.
- Dependencies:
  Tasks 5, 7.

## Task 27: Implementar F21/F22 — Historial de ventas

- Objective:
  - [x] Usar Eye para detail y corregir el default para incluir todas las ventas válidas de hoy.
- Files or areas likely involved:
  Sales History filters/detail/actions; backend query only if semantics require.
- Execution notes:
  Reproducir off-by-one primero; no aplicar `tomorrow` ciegamente.
- Verification method:
  Late-current-day Sale included + Drawer/Sheet regression + icon a11y.
- Dependencies:
  Tasks 5, 7.

## Task 28: Implementar F23/F24 — detalle de Gastos

- Objective:
  - [x] Añadir Eye y read-only detail con datos persistidos reales.
- Files or areas likely involved:
  Expense History; existing API/detail data if available.
- Execution notes:
  No invoice/VAT/beneficiary/approval/attachment invention.
- Verification method:
  Detail test with category null/optional fields + no mutation.
- Dependencies:
  Tasks 5, 7.

## Task 29: Implementar F25 — limpiar copy del Reporte de Ventas

- Objective:
  - [x] Reemplazar referencias HU-015 de usuario por copy funcional.
- Files or areas likely involved:
  Sales Report frontend.
- Execution notes:
  Mantener link real al historial solo si autorizado.
- Verification method:
  Copy test/text search.
- Dependencies:
  Task 4.

## Task 30: Consolidar AppShell, navegación y dashboards visualmente

- Objective:
  - [x] Reconciliar shell, headers, sidebar/drawer, spacing, cards y Inicio con Container/Dashboard references.
- Files or areas likely involved:
  AppShell/navigation/dashboard/shared layout.
- Execution notes:
  No shell separado por rol. Current AppShell + reference hierarchy.
- Verification method:
  Automated layout/role regression where practical; manual evidence deferred until Phase D.
- Dependencies:
  Tasks 6-11 and functional nav fixes.

## Task 31: Consolidar Catálogo e Inventario visualmente

- Objective:
  - [x] Reconciliar las seis referencias de Pantalla 5 respetando F9/F10 y reglas reales.
- Files or areas likely involved:
  Products/Inventory shared UI.
- Execution notes:
  Table desktop, mobile cards, consistent modals/states.
- Verification method:
  Focused UI regression; visual comparison checklist.
- Dependencies:
  Tasks 2-3, 18, 30.

## Task 32: Consolidar Composición y Producción visualmente

- Objective:
  - [x] Reconciliar Pantallas 12, 13 y 19 después de F4–F8.
- Files or areas likely involved:
  Composition/Production UI.
- Execution notes:
  Frozen production fixes override original mockup where they conflict.
- Verification method:
  Functional tests green + 10 reference rows reconciled.
- Dependencies:
  Tasks 15-17, 30.

## Task 33: Consolidar Cobro, Clientes e Historial de Ventas

- Objective:
  - [x] Reconciliar Pantallas 14, 20 y 21 manteniendo contracts reales.
- Files or areas likely involved:
  Checkout/Customers/Sales History.
- Execution notes:
  No fiscal/discount/payment/channel invention.
- Verification method:
  Existing regressions + visual checklist.
- Dependencies:
  Tasks 27, 30.

## Task 34: Consolidar Compras y recepción visualmente

- Objective:
  - [x] Reconciliar Pantallas 15, 16 y 17 preservando workflow actual.
- Files or areas likely involved:
  Purchases/Receive UI.
- Execution notes:
  No second history module; no fake order number/print behavior.
- Verification method:
  Create/receive/cancel regressions + responsive checklist.
- Dependencies:
  Tasks 26, 30.

## Task 35: Consolidar Gastos visualmente

- Objective:
  - [x] Reconciliar las cuatro referencias de Pantalla 10 con tabs/forms/history/states consistentes.
- Files or areas likely involved:
  Expense register/history/shared UI.
- Execution notes:
  BOB real; no cloud-sync copy.
- Verification method:
  History/register regression + visual checklist.
- Dependencies:
  Tasks 28, 30.

## Task 36: Consolidar Attendance visualmente

- Objective:
  - [x] Reconciliar Pantallas 11 y 22 únicamente después de resolver F12.
- Files or areas likely involved:
  My Attendance/Admin Attendance/Attendance Today.
- Execution notes:
  No visual completion while runtime persistence remains broken.
- Verification method:
  F12 integration green + state/detail/responsive checklist.
- Dependencies:
  Tasks 19-22, 30.

## Task 37: Consolidar Turnos/Caja/Cierre/Cierres visualmente

- Objective:
  - [x] Reconciliar Pantallas 18, 23 y 24 después de F1/F14/F15/F16.
- Files or areas likely involved:
  Shifts/Cash/Cash Closing/History.
- Execution notes:
  Backend remains expected/closing authority.
- Verification method:
  Cash regressions + summary values + history search + visual checklist.
- Dependencies:
  Tasks 12-14, 23-24, 30.

## Task 38: Consolidar Reportes visualmente

- Objective:
  - [x] Reconciliar Pantallas 25–27 sin duplicar histories ni crear mockup-only reports.
- Files or areas likely involved:
  Reports UI/export/chart components already implemented.
- Execution notes:
  Omit Sales Report Mesero and Attendance Report Empleado as separate experiences unless actual capabilities contradict that conclusion.
- Verification method:
  Report regressions + role checks + visual checklist.
- Dependencies:
  Tasks 29-30.

## Task 39: Endurecer responsive y accesibilidad de Phase A

- Objective:
  - [x] Completar code-level responsive/a11y para 360/768/1280+ y todos los icon actions/overlays/forms afectados.
- Files or areas likely involved:
  All changed frontend areas/shared UI.
- Execution notes:
  Esta tarea implementa readiness; no marca evidencia manual final.
- Verification method:
  Component/a11y tests where available, no obvious horizontal overflow by code/design audit.
- Dependencies:
  Tasks 30-38.

## Task 40: Ejecutar focused functional regressions

- Objective:
  - [ ] Ejecutar suites específicas de F1–F25 y corregir únicamente regresiones pertenecientes a HU-032.
- Files or areas likely involved:
  Frontend/backend tests.
- Execution notes:
  Attendance integration, Production validation and Kitchen date tests are mandatory where affected.
- Verification method:
  All focused tests green with factual counts.
- Dependencies:
  Tasks 12-29, 39.

## Task 41: Ejecutar full gates del FIRST APPLY

- Objective:
  - [ ] Ejecutar full frontend/backend gates, EF check, OpenAPI/generated check when relevant and `git diff --check`.
- Files or areas likely involved:
  Whole solution/frontend tooling.
- Execution notes:
  Usar comandos reales. No copiar historical test counts.
- Verification method:
  Factual command/output manifest.
- Dependencies:
  Task 40.

## Task 42: Registrar el estado del FIRST APPLY

- Objective:
  - [x] Actualizar artifacts técnicos para indicar que la primera implementación terminó pero HU-032 sigue pendiente de revisión humana.
- Files or areas likely involved:
  OpenSpec apply-progress/verify staging; HU-032 docs as PLANNED/IN REVIEW.
- Execution notes:
  Estado exacto:
  `HU_032_FIRST_APPLY_COMPLETE_PENDING_MAINTAINER_REVIEW`.
  No archive. No Sprint/MVP closure.
- Verification method:
  Estado documental coincide con workflow.
- Dependencies:
  Task 41.

## Task 43: Ejecutar MAINTAINER VISUAL REVIEW

- Objective:
  - [ ] El maintainer revisa manualmente la primera pasada visual y decide/realiza cambios intencionales.
- Files or areas likely involved:
  Human-reviewed frontend; potentially SVG/icons/styles/components.
- Execution notes:
  HARD STOP. Pi MUST NOT marcar esta tarea automáticamente. Pi MUST detener APPLY aquí y esperar resume explícito.
- Verification method:
  Confirmación explícita del maintainer en una interacción posterior.
- Dependencies:
  Task 42.

## Task 44: Auditar los cambios manuales del maintainer

- Objective:
  - [ ] Tras resume explícito, inspeccionar diffs manuales y distinguir cambios intencionales de trabajo no relacionado.
- Files or areas likely involved:
  Frontend working-tree diff; shared UI.
- Execution notes:
  No revertir icon/SVG/style changes porque difieran de mockups.
- Verification method:
  Change map `PRESERVE / PROPAGATE / UNRELATED`.
- Dependencies:
  Task 43.

## Task 45: Propagar la autoridad visual del maintainer

- Objective:
  - [ ] Aplicar los patrones aprobados del maintainer a las pantallas restantes donde sean coherentes.
- Files or areas likely involved:
  Shared UI + affected feature screens.
- Execution notes:
  Mantener business behavior. No extender cambios a pantallas donde el patrón sea semánticamente incorrecto.
- Verification method:
  Second visual-matrix pass y regressions focused.
- Dependencies:
  Task 44.

## Task 46: Reauditar las 74 referencias después de propagación

- Objective:
  - [ ] Actualizar las 74 filas con estado final relativo a mockup + maintainer authority.
- Files or areas likely involved:
  Visual matrix/evidence plan.
- Execution notes:
  Mantener diferencias intencionales documentadas.
- Verification method:
  74/74 con FINAL_RECONCILED / OMIT / INTENTIONAL_MAINTAINER_VARIANT.
- Dependencies:
  Task 45.

## Task 47: Capturar la evidencia manual final

- Objective:
  - [ ] Ejecutar walkthroughs reales y capturar/registrar evidencia para 360, 768, 1280+ y los seis roles.
- Files or areas likely involved:
  Running frontend/browser; evidence artifacts according to repository convention.
- Execution notes:
  Completar deferred Sprint 3 evidence. No fake screenshots ni PASS textual sin ejecución.
- Verification method:
  Evidence manifest con pantalla, role, viewport, result y artifact/reference real.
- Dependencies:
  Task 46.

## Task 48: Ejecutar revisión manual de accesibilidad final

- Objective:
  - [ ] Verificar keyboard/focus/labels/icon names/overlays/status semantics en los flujos representativos.
- Files or areas likely involved:
  Running frontend/evidence documentation.
- Execution notes:
  No declarar WCAG certification.
- Verification method:
  Factual checklist con issues resueltos o findings explícitos.
- Dependencies:
  Task 47.

## Task 49: Reconciliar documentación Sprint 3

- Objective:
  - [ ] Actualizar HU-032 y las HUs con estado/evidencia stale, incluyendo HU-026/HU-027 y deferred evidence.
- Files or areas likely involved:
  HU docs; traceability/status docs; OpenSpec progress.
- Execution notes:
  Solo evidencia real. `AUTO_ABSENCE_GENERATION = POST_MVP`.
- Verification method:
  Search de markers PENDIENTE/DEFERRED/FRONTEND PENDING y reconciliación factual.
- Dependencies:
  Tasks 47-48.

## Task 50: Ejecutar full final regression después de cambios manuales

- Objective:
  - [ ] Repetir full backend/frontend/EF/OpenAPI/generated/git gates después de la propagación.
- Files or areas likely involved:
  Whole repository.
- Execution notes:
  Esta es la evidencia final, no reutilizar outputs de Phase A.
- Verification method:
  Factual green gate manifest o blocker documentado.
- Dependencies:
  Tasks 45, 49.

## Task 51: Ejecutar Native VERIFY de HU-032

- Objective:
  - [ ] Verificar requisitos, tasks, F1–F26, 74-reference reconciliation, regressions, docs y evidencia.
- Files or areas likely involved:
  OpenSpec verification artifacts.
- Execution notes:
  No archive todavía.
- Verification method:
  Verify report con trazabilidad requisito→evidencia.
- Dependencies:
  Task 50.

## Task 52: Registrar pre-aceptación final

- Objective:
  - [ ] Dejar el change en estado técnico final sin declarar cierre.
- Files or areas likely involved:
  OpenSpec/HU-032 status.
- Execution notes:
  Estado exacto:
  `HU_032_READY_FOR_FINAL_ACCEPTANCE`.
- Verification method:
  No artifact declara Sprint/MVP cerrado sin aceptación del maintainer.
- Dependencies:
  Task 51.

## Task 53: Obtener aceptación final del maintainer

- Objective:
  - [ ] El maintainer confirma explícitamente el resultado final de HU-032.
- Files or areas likely involved:
  Human acceptance checkpoint.
- Execution notes:
  Pi MUST NOT auto-completar esta tarea ni archive/commit/push por iniciativa propia.
- Verification method:
  Confirmación explícita del maintainer.
- Dependencies:
  Task 52.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 3,000–7,000 LoC de producto/tests/docs es una banda razonable para una HU transversal de este alcance. Puede ser menor si los defectos son principalmente mapping/UI y la infraestructura visual actual ya es consistente; puede crecer si F12/F8/F14 requieren cambios backend y numerosos snapshots/tests.
- Risk of exceeding 400 LoC review threshold:
  Very High.
- Recommendation:
  Chained PRs, únicamente si el maintainer posteriormente autoriza commits/PRs. Mientras Git publication no esté autorizada, aplicar la misma separación como review batches dentro del único working tree y del único OpenSpec change.
- Suggested split if chained:
  - PR/Review Batch 1: baseline + shared primitives + functional fixes temporales/iconográficos pequeños.
  - PR/Review Batch 2: Attendance F12 + Production validation F8 + Kitchen F3 backend-sensitive fixes.
  - PR/Review Batch 3: Dashboards + Shift/Cash F1/F14.
  - PR/Review Batch 4: Suppliers/Purchases/Sales/Expenses detail/date fixes.
  - PR/Review Batch 5: visual consolidation catalog/production/sales/purchases/expenses.
  - PR/Review Batch 6: attendance/cash/reports visual consolidation + responsive/a11y.
  - HARD STOP: maintainer review.
  - PR/Review Batch 7: maintainer-authority propagation.
  - PR/Review Batch 8: evidence/docs/final verification.
    Todos los bloques permanecen bajo `finalize-sprint-3-hu-032-mvp-ui-operational-consolidation`.

## First Apply evidence reconciliation

- Tasks 1–20 and 22–39: implementation/audit objectives completed for this first apply; the 74-reference matrix remains implementation support, not maintainer approval.
- Task 20: authenticated Attendance CheckIn → CheckOut → personal history assertion added to `AttendancePostgresIntegrationTests.cs`.
- Task 21: no persistence/source correction was required after inspection; runtime proof remains blocked by Docker/Testcontainers availability.
- Task 40: frontend gates passed in the verification worker; backend integration regressions remain blocked by the unavailable Docker endpoint.
- Task 41: full gate closure is not claimed because frontend format check still reports modified/pre-existing findings and PostgreSQL integration cannot start.
- Task 43: intentionally unchecked hard stop. No maintainer visual review, final screenshots, Native VERIFY, archive or delivery action was performed.

Generator verdict:

`HU_032_FINAL_MVP_CONSOLIDATION_OPENSPEC_READY`

First Apply Stop Marker:

`HU_032_FIRST_APPLY_COMPLETE_PENDING_MAINTAINER_REVIEW`

Final Pre-Acceptance Marker:

`HU_032_READY_FOR_FINAL_ACCEPTANCE`

Product Decisions Required:

`NONE AT GENERATION`

Current Ready:

`READY_FOR_HU_032_FIRST_APPLY: YES`

First Apply stop:

`HU_032_FIRST_APPLY_COMPLETE_PENDING_MAINTAINER_REVIEW`

Blocking items intentionally carried forward:

- PostgreSQL/Testcontainers runtime evidence is blocked by the unavailable Docker endpoint;
- frontend format check remains non-green and is recorded without mass-formatting unrelated/pre-existing files;
- maintainer visual review, final screenshots, Native VERIFY and delivery remain human-controlled follow-up work.
