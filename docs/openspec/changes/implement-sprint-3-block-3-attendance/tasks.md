# Tasks

## Task 1: Revalidar la baseline local y los contratos Attendance

- Objective:
  - [x] Confirmar branch, HEAD, working tree, OpenSpec state, Attendance backend, generated TypeScript, frontend Attendance feature, routes, navigation y tests reales.
- Files or areas likely involved:
  Git read-only; Attendance backend/application/infrastructure; generated API; frontend attendance; AppRoutes; navigation; HU-022/HU-023/HU-024 docs.
- Execution notes:
  Comparar específicamente el local con los gaps detectados en la rama pública. No modificar product code.
- Verification method:
  CONTRACT_USAGE_MATRIX local con endpoints, policies, DTOs, fields, errors y pagination exactos.
- Dependencies:
  None.

## Task 2: Registrar y aplicar la decisión D16 de autoservicio HU-023

- Objective:
  - [x] Registrar la decisión explícita del maintainer sobre CheckIn/CheckOut propios y la proyección personal autoritativa requerida por HU-023.
- Files or areas likely involved:
  `proposal.md`, `design.md`, `spec.md` de este change; no product source en esta task.
- Execution notes:
  D16 autoriza que cualquier User autenticado vinculado a Employee lea y haga CheckIn/CheckOut solo propios. El backend debe derivar Employee desde la identidad autenticada y nunca aceptar un `EmployeeId` arbitrario para autoservicio. Se autoriza únicamente el alcance mínimo HU-023: mutation identity-bound o `/me` si la seguridad lo requiere, proyección personal aditiva con lifecycle/schedule snapshot/punctuality/`workedMinutes`, reutilización application/domain, tests y sincronización OpenAPI/generated client. `AttendanceManage` conserva ADMINISTRADOR/ENCARGADO y HU-024 conserva su backend administrativo sin cambios. No schema ni migration ahora; si aparece una brecha persistente genuinamente necesaria, detener y solicitar revisión explícita antes de añadir persistencia.
- Verification method:
  D16 está registrado coherentemente en proposal/design/spec y la continuación de APPLY no afirma implementación ni tests previos.
- Dependencies:
  Task 1.

## Task 3: Implementar el contrato HU-023 autorizado y el groundwork API/query de Attendance

- Objective:
  - [x] Implementar el alcance backend mínimo D16 para mutations identity-bound y proyección personal aditiva.
  - [x] Extender la infraestructura Attendance existente para personal/admin queries sin crear un segundo API layer.
  - [x] Sincronizar runtime OpenAPI y generated client para el contrato HU-023 elegido.
- Files or areas likely involved:
  Backend Attendance auth/controller/application/domain; backend tests; runtime OpenAPI; generated API; Attendance API/hooks/query-key areas.
- Execution notes:
  Derivar Employee desde User autenticado y no aceptar un `EmployeeId` arbitrario en autoservicio. Elegir la mutation identity-bound existente solo si su seguridad server-side lo permite; usar `/me` si la forma de la ruta lo requiere. Mantener TanStack Query existente. Separar `me`, `admin` y admin filter-options cuando sea necesario. No raw fetch. No tocar el backend/contrato HU-024 ni `AttendanceManage` fuera de su frontera actual.
- Verification method:
  Tests backend y frontend demuestran identidad/alcance propio, query-key isolation y forwarding correcto de filtros; runtime OpenAPI coincide con el generated client sin edición manual.
- Dependencies:
  Task 2 — decisión D16 registrada.

## Task 4: Implementar la composición de estado personal HU-023

- Objective:
  - [x] Evolucionar `/mi-asistencia` para representar loading, no Employee, no-open, active, completed/recent y error usando la proyección D16.
- Files or areas likely involved:
  Personal attendance page; personal API/query hooks; shared Card/Alert/Skeleton/Badge.
- Execution notes:
  No restringir por `EMPLEADO`. No inventar absence/lateness/worked values ni reconstruir snapshots. Reusar AuthUser employee linkage cuando aporte UX temprana, sin sustituir la resolución backend.
- Verification method:
  Tests para linked/no-link/loading/no-open/active/completed/error y render de lifecycle, schedule snapshot, punctuality y workedMinutes autoritativos.
- Dependencies:
  Tasks 2-3.

## Task 5: Integrar CheckIn/CheckOut propios identity-bound

- Objective:
  - [x] Conectar las actions personales directas al contrato D16 y proteger pending/double-submit.
  - [x] Verificar que cada mutation opera únicamente sobre el Employee derivado del User autenticado.
- Files or areas likely involved:
  HU-023 Attendance API/hooks y endpoint/controller/application; personal current-state card; feedback; focused backend/frontend tests.
- Execution notes:
  No confirmation modal. No automatic mutation retry. Timestamps y lifecycle del response son autoridad. El request self-service no debe aceptar un `EmployeeId` arbitrario. Esta task MUST NOT ejecutarse usando un admin-only contract como bypass; `AttendanceManage` y sus mutations administrativas permanecen separadas.
- Verification method:
  Focused tests de endpoint/contrato/payload identity-bound, roles linked/no-link, rechazo o ausencia de arbitrary EmployeeId, pending, duplicate-submit, race validation, success y failure.
- Dependencies:
  Tasks 2-4.

## Task 6: Implementar historial propio, elapsed y estados HU-023

- Objective:
  - [x] Completar current-month own history, server pagination, presentation-only elapsed timer y query states.
  - [x] Mostrar lifecycle, schedule snapshot, punctuality y `workedMinutes` únicamente desde la proyección backend D16.
- Files or areas likely involved:
  Personal attendance page; formatters; pagination/shared history primitives; synchronized generated contract.
- Execution notes:
  Soportar múltiples registros el mismo BusinessDate. No usar duración calculada como final workedMinutes ni reconstruir horario/punctuality. No crear segunda history route. Elapsed solo es presentation-only y no debe provocar requests por tick.
- Verification method:
  Tests current-month request, pagination, two-same-date records, backend field rendering, elapsed timer/no server-per-tick, empty/error.
- Dependencies:
  Tasks 3-5.

## Task 7: Crear la query/composición administrativa HU-024

- Objective:
  - [x] Integrar `/attendance/admin` con current-month defaults, pagination, summary y per-employee summaries reutilizando el backend existente.
- Files or areas likely involved:
  Attendance API/query layer; new/existing administrative page.
- Execution notes:
  HU-024 backend read-only y sin cambios bajo D16. No useEffect fetch. No page-level aggregate calculations. Mantener separadas las mutations `AttendanceManage` de HU-022 y el self-service HU-023.
- Verification method:
  Tests de request params, pagination metadata y summary mapping; confirmar que no se introduce endpoint/DTO/policy backend para HU-024.
- Dependencies:
  Tasks 1 y 3.

## Task 8: Implementar filtros administrativos

- Objective:
  - [x] Implementar Employee, period, ShiftType y AttendanceLifecycle outcome usando sources autorizados.
- Files or areas likely involved:
  Admin Attendance page; filter bar/sheet; employeeSummaries/options query.
- Execution notes:
  No `/users` para CONTADORA si requiere capability indebida. No TARDE. No fifth late filter salvo que source/local UX obligue a revisitar D8.
- Verification method:
  Tests filter forwarding, clear-to-current-month, page reset y Employee options authorization.
- Dependencies:
  Task 7.

## Task 9: Implementar las cuatro cards HU-024

- Objective:
  - [x] Mostrar Registros, Retrasos, Horas trabajadas e Inasistencias desde `AdministrativeAttendanceSummary`.
- Files or areas likely involved:
  Admin Attendance page; StatCard/shared summary components; duration formatter.
- Execution notes:
  No `Activos ahora`/`Retrasos hoy` si el contract no representa esas semánticas. No current-page aggregation.
- Verification method:
  Tests exact mapping y constancia de summary al cambiar page.
- Dependencies:
  Task 7.

## Task 10: Implementar table/cards y detail read-only HU-024

- Objective:
  - [x] Renderizar desktop table, mobile cards y overlay de detalle utilizando `AdministrativeAttendanceRow`.
- Files or areas likely involved:
  Admin Attendance page; DataTable/Card; existing Drawer/Sheet/Modal.
- Execution notes:
  Solo `Ver detalle`. No FAB, edit, correction, CheckIn/Out, justification o approval. Usar planned snapshot fields recibidos.
- Verification method:
  Tests de mapping, OPEN/CLOSED/ABSENT, null CheckOut, late data y ausencia de mutation controls.
- Dependencies:
  Tasks 7-9.

## Task 11: Integrar employee stats contextual

- Objective:
  - [x] Mostrar estadísticas compactas solo cuando un Employee/contexto específico lo justifique.
- Files or areas likely involved:
  Admin Attendance page/detail; employee summary presentation.
- Execution notes:
  Solo attendanceCount/workedMinutes/lateCount/absenceCount reales. No hourlyRate/projectedPay/charts.
- Verification method:
  Tests de visibilidad contextual y ausencia de HU-031 fields.
- Dependencies:
  Tasks 8-10.

## Task 12: Alinear rutas, navegación y multi-role

- Objective:
  - [x] Mantener un único item global `Asistencia`, proteger `/asistencia` con ADMIN/ENC/CONTADORA y conservar `/mi-asistencia` para cualquier autenticado.
- Files or areas likely involved:
  AppRoutes; navigation; capability helpers.
- Execution notes:
  Target administrativo cuando cualquiera de los roles administrativos está presente. Añadir links secundarios personal/admin únicamente donde sean útiles.
- Verification method:
  Navigation/route tests para EMPLEADO, MESERO, COCINA, ADMIN, ENC, CONTADORA y multi-role EMPLEADO+ENC.
- Dependencies:
  Tasks 4-11.

## Task 13: Endurecer responsive y accesibilidad a nivel de código

- Objective:
  - [x] Implementar los layouts y semantics necesarios para 360/~768/>=1280 sin convertir evidencia manual en gate.
- Files or areas likely involved:
  Personal/admin Attendance pages; filter/detail overlays; shared components solo cuando la mejora sea legítimamente compartida.
- Execution notes:
  Mobile cards; four-summary 2x2/stack; filter overlay; prominent personal CTA; labels/focus/status/error semantics. No new shell.
- Verification method:
  Component tests y static/code-level review. Registrar manual evidence como `DEFERRED_TO_SPRINT_FINAL_AUDIT`, no como PASS.
- Dependencies:
  Tasks 6, 10-12.

## Task 14: Ejecutar regresiones Attendance, Shift y Cash relacionadas

- Objective:
  - [x] Confirmar que el Block 3 no rompe HU-022, Shift/HU-025 ni Cash HU-026/HU-027.
  - [x] Confirmar que `AttendanceManage` sigue restringida a ADMINISTRADOR/ENCARGADO y que HU-024 permanece read-only.
- Files or areas likely involved:
  Existing Attendance, D16 HU-023 backend/frontend, Shift and Cash tests/flows.
- Execution notes:
  Conservar la antigua ruta de mutation administrativa de HU-022 y su policy; el self-service D16 no la reemplaza ni la amplía. Verificar además que el backend administrativo HU-024 no fue modificado.
- Verification method:
  Existing focused regression tests y nuevos tests D16 green; ninguna mutation de Shift/Cash ni contrato administrativo HU-024 alterado.
- Dependencies:
  Tasks 5-13.

## Task 15: Ejecutar full gates frontend y backend de regresión

- Objective:
  - [x] Ejecutar los scripts reales de format/typecheck/lint/tests/build y la regresión backend requerida por convention.
  - [x] Verificar que OpenAPI runtime y generated client están sincronizados y que no hay cambios no autorizados de HU-024/schema/migrations.
- Files or areas likely involved:
  Frontend/backend tooling; generated API; no product changes adicionales fuera de D16.
- Execution notes:
  Usar comandos descubiertos en Task 1. El generated TypeScript puede cambiar únicamente como sincronización del contrato HU-023 autorizado; no editarlo manualmente. Registrar cualquier brecha persistente de modelo como bloqueo para revisión, no crear migration automáticamente.
- Verification method:
  Salidas reales registradas con counts reales; generated diff esperado y explicado por D16, diff administrativo HU-024 vacío, schema/migrations sin cambios.
- Dependencies:
  Task 14.

## Task 16: Actualizar documentación y preparar evidencia diferida

- Objective:
  - [x] Actualizar HU-023/HU-024 y artifacts OpenSpec con hechos del APPLY y placeholders de evidencia manual.
- Files or areas likely involved:
  HU docs; OpenSpec progress/verify artifacts.
- Execution notes:
  No fabricar screenshots ni manual PASS. Registrar exactamente `DEFERRED_TO_SPRINT_FINAL_AUDIT` para los checklists visuales/a11y manuales. Documentar HU-023 backend D16 como changed solo con evidencia real y HU-024 backend como reused/unchanged.
- Verification method:
  Docs distinguen backend reused/changed de forma factual, runtime OpenAPI/generated synchronization, frontend files reales, tests reales y placeholders completos; no afirmar implementación o tests no ejecutados.
- Dependencies:
  Task 15.

## Review Workload Forecast

- Estimated LoC changed:
  El alcance incluye el backend mínimo HU-023 autorizado por D16, su runtime OpenAPI/generated synchronization, frontend, tests y documentación. La estimación exacta se revisará después de confirmar la forma local de la mutation y la proyección; no se autoriza ampliar el alcance por conveniencia.
- Risk of exceeding 400 LoC review threshold:
  High para el bloque completo; Medium por unidad lógica.
- Recommendation:
  Chained PRs/work units bajo UN único OpenSpec change con D16 ya resuelto y sin crear nuevos puntos de aprobación de producto.
- Suggested split if chained:
  - Work unit 1: HU-023 backend identity-bound contract/projection + tests + OpenAPI/generated synchronization.
  - Work unit 2: Attendance API/query foundations + HU-023 state/history.
  - Work unit 3: HU-023 mutations UI and invalidation.
  - Work unit 4: HU-024 filters/summary/list/detail using unchanged backend.
  - Work unit 5: navigation/auth/multi-role + regression, gates/docs/evidence placeholders.

  Ningún work unit constituye un punto de aprobación humana: D16 ya resolvió la decisión contractual. Una brecha persistente de schema/migration sí debe detener el trabajo y solicitar revisión explícita.
