# Tasks

## Task 1: Revalidar baseline, contracts y decisión D12 de categorías

- Objective:
  - [x] Confirmar branch/HEAD/working tree, OpenSpec state, backend contracts, generated TypeScript, frontend architecture y el estado real de `ExpenseCategoryRead` para CONTADORA.
- Files or areas likely involved:
  Git read-only; OpenSpec; Program/policies; Operations/Expenses contracts; generated API; package scripts; routes/navigation; current frontend features.
- Execution notes:
  Confirmar también el estado del audit archivado y que el large change anterior permanece superseded. Registrar D12: incluir CONTADORA en la policy existente `ExpenseCategoryRead` únicamente para cargar las opciones de categoría de HU-021; conservar su acceso read-only, sin mutaciones de categorías ni Register Expense por esta autorización. La implementación y cobertura ya existentes en `Program.cs` y `ExpenseCategoryAuthorizationPostgresIntegrationTests.cs` deben quedar registradas con el focused resultado `1/1` passed. No añadir endpoint, DTO, schema, migration ni otro cambio backend.
- Verification method:
  Baseline registrada; CONTRACT_USAGE_MATRIX exacta; authorization matrix exacta; category-options capability demostrada como soportada para CONTADORA bajo D12 y cobertura de separación read/write registrada.
- Dependencies:
  None.

## Task 2: Definir Production Summary mediante TDD

- Objective:
  - [x] Crear primero tests fallidos que congelen el contract, autorización, filtros, mixed-unit semantics, empty state y tie-break de Production Summary.
- Files or areas likely involved:
  Existing backend application/integration test projects for Operations/Production.
- Execution notes:
  Seguir RED. No modificar schema. Incluir ADMIN/ENC/COCINA/CONTADORA allowed, MESERO/EMPLEADO forbidden, filter parity, count, latest, event-frequency ranking, tie, empty and side-effect-free GET.
- Verification method:
  Focused test command falla por ausencia del endpoint/behavior esperado y por la razón correcta.
- Dependencies:
  Task 1 y la decisión D12 de HU-021 ya registrada y congelada en este change.

## Task 3: Implementar el contrato y query de Production Summary

- Objective:
  - [x] Añadir la mínima implementación backend read-only necesaria para llevar los tests Summary a GREEN/TRIANGULATE/REFACTOR.
- Files or areas likely involved:
  Production/Operations contracts; application/infrastructure query/service; Operations endpoint registration.
- Execution notes:
  Reutilizar filtros del History query donde sea limpio. No materializar todo el dataset. No physical quantity aggregate. No migration. Mismo ProductionHistory policy. Mantener tie-break estable.
- Verification method:
  Todos los focused Summary tests pasan, incluyendo mixed `10 L + 20 Kg → productionCount 2` y ausencia de inventory side effects.
- Dependencies:
  Task 2.

## Task 4: Validar backend y regenerar el contrato frontend

- Objective:
  - [x] Ejecutar backend regression, verificar runtime OpenAPI y regenerar TypeScript desde el OpenAPI real.
- Files or areas likely involved:
  Backend solution/tests; runtime OpenAPI; frontend generated types.
- Execution notes:
  Ejecutar restore/build/test reales, EF pending-model check y runtime API. Luego ejecutar el script local `api:generate`. Nunca editar generated TS manualmente.
- Verification method:
  Full backend gates green; no pending model changes; Summary visible en runtime OpenAPI; generated diff contiene el nuevo contract esperado y ninguna edición manual.
- Dependencies:
  Task 3.

## Task 5: Consolidar solo el groundwork frontend realmente necesario

- Objective:
  - [x] Reutilizar query-state, filter, pagination, responsive card/table y detail precedents existentes sin crear un framework genérico.
- Files or areas likely involved:
  Shared UI; HU-015 precedent; feature-local query factories; formatters.
- Execution notes:
  Auditar antes de crear. Si no existe un shared History shell, preferir composición feature-specific usando los mismos primitives.
- Verification method:
  Reuse matrix actualizada; ninguna dependencia nueva; ningún `UniversalHistory*` innecesario.
- Dependencies:
  Tasks 1 y 4 para Production; HU-019/HU-021 pueden preparar su integración desde Task 1 conforme a la decisión D12 registrada.

## Task 6: Implementar route, queries, filters y summary de HU-008

- Objective:
  - [x] Convertir `/produccion` en History con default mes actual, cuatro filtros, server pagination y tres cards server-backed.
- Files or areas likely involved:
  Production feature API/query/page; routing; shared cards/table/filter primitives.
- Execution notes:
  Summary query usa los mismos filtros no-paginados. No Status filter. Preparation source se reutiliza de HU-007 cuando sea históricamente válido. Responsible se adapta al contract real sin User Management escalation.
- Verification method:
  Focused tests de route/default/filter requests/summary cards/pagination/empty/filtered-empty/summary-only error.
- Dependencies:
  Tasks 4-5.

## Task 7: Implementar detail y regresión HU-007

- Objective:
  - [x] Añadir desktop/mobile history presentation, on-demand Production Detail y historical consumptions, preservando HU-007.
- Files or areas likely involved:
  Production history/detail UI; overlay precedent; Register Production success state.
- Execution notes:
  Mostrar BatchCode real. No Edit/Print/lot stock. Añadir `Ver historial` como secondary success action sin reescribir el registro.
- Verification method:
  Tests para BatchCode, detail on demand, consumption snapshot, role-aware CTA, mobile cards y regresión focalizada HU-007.
- Dependencies:
  Task 6.

## Task 8: Integrar el History read model en `/compras`

- Objective:
  - [x] Evolucionar la página única de Compras para usar el read model HU-019 con default últimos 30 días y filtros Period/Supplier/Status/Area.
- Files or areas likely involved:
  Purchases API/query/page; existing list UI; filters; query keys.
- Execution notes:
  No crear `/compras/historial`. No Responsible filter. No reimplementar mutations. Conservar compatibility code únicamente donde siga siendo requerido.
- Verification method:
  Tests de default, query params, server pagination, filter reset/clear y ausencia de una segunda Purchase History route.
- Dependencies:
  Tasks 1 y 5.

## Task 9: Integrar Purchase Detail, authorization scope y mutation regressions

- Objective:
  - [x] Añadir History Detail, real-UUID presentation y scope UX sin romper Create/Receive/Cancel.
- Files or areas likely involved:
  Purchase detail overlay; authorization/action visibility; existing cancel/receive hooks; mutation invalidation.
- Execution notes:
  Pure COCINA no puede seleccionar GENERAL. CONTADORA read-only. Reuse receipt/cancellation data. List ID abreviado, detail full UUID. Refresh History after mutations without global invalidation.
- Verification method:
  Tests pure COCINA, COCINA+ENC, CONTADORA, UUID, received/cancelled details, PENDING actions and focused HU-017/HU-018 regression.
- Dependencies:
  Task 8.

## Task 10: Implementar routing, query y navegación base de HU-021

- Objective:
  - [x] Añadir `/gastos/historial`, history query y role-aware Register/History navigation conforme a la decisión D12 del Category filter.
- Files or areas likely involved:
  Expenses API/query; routes; navigation registry; Gastos internal navigation/tabs.
- Execution notes:
  `/gastos` permanece Register. ADMIN/ENC target `/gastos`; pure CONTADORA target `/gastos/historial`. No segundo global Gastos item.
- Verification method:
  Route/nav tests para ADMIN, ENC, CONTADORA y denied roles; no regression de `/gastos`.
- Dependencies:
  Task 1, decisión D12 de HU-021 ya registrada y Task 5.

## Task 11: Implementar filtros, métricas y listado HU-021

- Objective:
  - [x] Implementar mes actual, Category/CashSource/ShiftType/Responsible, tres aggregates backend, server pagination, desktop table y mobile cards.
- Files or areas likely involved:
  Expenses history page/query; filters; StatCards; list/card UI.
- Execution notes:
  Implementar Category para ADMINISTRADOR, ENCARGADO y CONTADORA mediante el endpoint existente autorizado por `ExpenseCategoryRead` conforme a D12. CONTADORA sigue read-only: no category mutations ni Register Expense por esta autorización. No TARDE, Shift ID selector, search descriptivo, saldo de caja, export ni row mutations. Manejar category null.
- Verification method:
  Tests de filtros, metrics server-authoritative, metrics independent of page, category null, empty/error/loading, no mutation/export and mobile representation.
- Dependencies:
  Task 10.

## Task 12: Integrar HU-020 success y completar routing/navigation/auth

- Objective:
  - [x] Añadir `Ver historial` al success de Register Expense y cerrar la matriz de route/navigation/action visibility de todo el bloque.
- Files or areas likely involved:
  Expense Register success state; AppRoutes; navigation; Production/Purchase/Expense capability constants.
- Execution notes:
  No cambiar business rules HU-020. Verificar D12 para CONTADORA pura —Category options read-only, sin category mutations ni Register Expense— y union semantics para CONTADORA+ENCARGADO, COCINA+ENCARGADO y MESERO+CONTADORA.
- Verification method:
  Focused route/nav/multi-role tests y regresión HU-020.
- Dependencies:
  Tasks 7, 9 y 11.

## Task 13: Ejecutar hardening responsive y accesibilidad

- Objective:
  - [x] Validar las tres HUs a 360, ~768 y >=1280 y corregir únicamente issues dentro del scope del bloque.
- Files or areas likely involved:
  Production/Purchase/Expense history UI and shared primitives only when a shared fix is genuinely needed.
- Execution notes:
  Usar tables desktop y cards mobile. Auditar keyboard/focus/labels/status/alerts/pagination. No rediseñar AppShell.
- Verification method:
  Focused automated responsive/accessibility assertions are factual; manual browser evidence is separately deferred as `DEFERRED_TO_SPRINT_FINAL_AUDIT`. No screenshots fabricados.
- Reconciliation note: The checked task records responsive hardening and automated assertions; manual browser evidence remains a separate deferred item.
- Dependencies:
  Tasks 7, 9 y 12.

## Task 14: Ejecutar regresiones focalizadas de módulos operativos

- Objective:
  - [x] Revalidar HU-007, HU-017, HU-018 y HU-020 después de integrar los histories.
- Files or areas likely involved:
  Existing Production/Purchase/Expense tests and affected application flows.
- Execution notes:
  Verificar específicamente stock/production registration, purchase create/cancel/receive/inventory increment y expense registration. No expandir scope.
- Verification method:
  Existing focused regression suites green y manual smoke seguro cuando corresponda.
- Dependencies:
  Task 13.

## Task 15: Ejecutar full gates, docs y verify-readiness

- Objective:
  - [x] Ejecutar todos los frontend/backend quality gates reales y actualizar únicamente documentación factual del bloque.
- Files or areas likely involved:
  Backend/frontend test/build tooling; HU-008/HU-019/HU-021 docs; OpenSpec evidence.
- Execution notes:
  Ejecutar format/typecheck/lint/tests/build frontend; backend restore/build/tests; pending-model check. No migration. Documentar real test counts y exact Summary endpoint. HU-019 MUST indicar backend reused; HU-021 MUST registrar la inclusión de CONTADORA en la policy existente `ExpenseCategoryRead` conforme a D12, sin endpoint, DTO, schema, migration ni otro cambio backend.
- Verification method:
  Todos los acceptance criteria trazados a evidencia; backend product diff limitado a Production Summary y la modificación de policy explícitamente congelada por D12; no endpoint/DTO/schema/migration adicional; no exports/dependencies; generated contract synced.
- Dependencies:
  Tasks 14 y 4.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 1,500–2,800 LoC entre Production Summary backend/tests, tres histories frontend, route/navigation/query integration, focused tests y documentación. El total depende de cuánto pueda reutilizarse de HU-015 y de shared primitives existentes.
- Risk of exceeding 400 LoC review threshold:
  Very High para el change completo; Medium por work unit si se mantiene composición feature-specific.
- Recommendation:
  Chained PRs/work units bajo UN ÚNICO OpenSpec change, sin usar 400 LoC como condición para detener APPLY.
- Suggested split if chained:
  - Work unit 1: Production Summary backend + tests + OpenAPI/generated client.
  - Work unit 2: HU-008 frontend + HU-007 regression.
  - Work unit 3: HU-019 integration + HU-017/HU-018 regression.
  - Work unit 4: HU-021 integration con Category autorizado por D12 + HU-020 regression.
  - Work unit 5: routing/navigation/auth/responsive/full gates/docs.

  Estas unidades son límites de revisión técnica y no requieren aprobación humana entre fases normales; la decisión D12 de HU-021 ya está registrada, verificada y no bloquea APPLY.
