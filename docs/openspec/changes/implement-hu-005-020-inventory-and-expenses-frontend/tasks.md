# Tasks

## Task 1: Auditar develop local, frontend foundation y contrato backend

- Objective:
  Establecer la baseline real y comprobar que el backend HU-005/HU-020 requerido está integrado.
- Files or areas likely involved:
  Git read-only state, frontend package/routes/navigation/components/features/lib/api, backend runtime/OpenAPI.
- Execution notes:
  Registrar HEAD/status. Confirmar AuthProvider, session coordinator, shared httpClient, QueryClient, UI Kit, Dialog, Toast, pagination y test conventions. Confirmar los cinco endpoints aprobados. No realizar mutaciones Git.
- Verification method:
  Baseline record con commit exacto y OpenAPI runtime que demuestre los cinco endpoints; de faltar alguno requerido, clasificar `BASELINE_CONTRACT_BLOCKER`.
- Dependencies:
  None.

## Task 2: Inspeccionar las diez referencias visuales y cerrar el visual audit

- Objective:
  Completar la auditoría pixel-level que no fue posible durante esta sesión.
- Files or areas likely involved:
  `HU-005.zip`, `HU-020.zip` y documentación visual del change.
- Execution notes:
  Abrir las diez imágenes. Registrar estructura, jerarquía, desktop/mobile, dialogs, states y todos los elementos observados. Aplicar KEEP/ADAPT/OMIT/DEFER de `spec.md`; añadir elementos no descritos que aparezcan en PNG y clasificarlos sin ampliar scope.
- Verification method:
  Las diez imágenes aparecen en una matriz de auditoría y ningún elemento funcional visible queda sin clasificación.
- Dependencies:
  None.

## Task 3: Regenerar y auditar el contrato OpenAPI TypeScript

- Objective:
  Convertir el backend real integrado en la única autoridad TypeScript.
- Files or areas likely involved:
  Script real `api:generate`, `frontend/src/types/api.generated.ts`.
- Execution notes:
  Ejecutar el script real auditado. Identificar DTOs, enums, requests, paging y ProblemDetails de Inventory/Expenses. No editar generated output.
- Verification method:
  Generación PASS; los cinco endpoints y tipos necesarios están presentes; una regeneración repetida no produce cambios inesperados.
- Dependencies:
  Task 1.

## Task 4: Crear las foundations API/query separadas de Inventory y Expenses

- Objective:
  Integrar ambas capabilities en la arquitectura existente sin mezclar sus caches o transports.
- Files or areas likely involved:
  Endpoint registry, `features/inventory`, `features/expenses`, shared httpClient solo si falta una primitive genérica.
- Execution notes:
  Inventory keys para balances/movements. Expense key únicamente para categories. Reutilizar generated types y shared client. No token args.
- Verification method:
  Tests de API adapters y query keys verifican routes, params, requests y separación de caches.
- Dependencies:
  Task 3.

## Task 5: Registrar las tres rutas y guards mínimos

- Objective:
  Integrar `/inventario`, `/inventario/movimientos` y `/gastos` sin rediseñar navegación global.
- Files or areas likely involved:
  AppRoutes, authenticated navigation registry si corresponde.
- Execution notes:
  Reutilizar RequireAuth/RequireAnyRole. `/inventario`: cinco read roles. Movimientos: ADMIN/ENCARGADO. Gastos: ADMIN/ENCARGADO. Añadir solo integración mínima al shell.
- Verification method:
  Routing tests de todos los roles y multi-role; módulos previos siguen accesibles.
- Dependencies:
  Tasks 1, 3.

## Task 6: Implementar Inventory balances y estados visuales

- Objective:
  Entregar `/inventario` desktop/mobile con datos y filtros contractuales.
- Files or areas likely involved:
  Inventory balances page/components/hooks/queries.
- Execution notes:
  Search y ProductType server-side. Pagination. ProductType labels. Unit/minStock/currentQuantity. Estado Negative > Low > Normal. Omitir SKU/aggregate cards/low/negative filters si no existen en OpenAPI.
- Verification method:
  Tests de render, filters, pagination, zero/low/negative/min-null y validación manual desktop/403/360.
- Dependencies:
  Tasks 2, 4, 5.

## Task 7: Implementar polling, refresh y estados de consulta de Inventory

- Objective:
  Mantener balances actualizados con REST aproximadamente cada 30 segundos sin degradar UX.
- Files or areas likely involved:
  Inventory query configuration y presentation states.
- Execution notes:
  Usar TanStack Query polling. Mantener previous data en background refetch. Añadir manual refresh si encaja con visual audit. No SignalR ni timer global.
- Verification method:
  Fake-timer tests muestran polling ~30s mientras mounted, ausencia de HubConnection y background refetch sin vaciar data válida.
- Dependencies:
  Task 6.

## Task 8: Implementar formularios manuales ENTRY y WRITE_OFF

- Objective:
  Entregar movimientos manuales correctos y accesibles para ADMIN/ENCARGADO.
- Files or areas likely involved:
  Inventory movement dialog/form/Product selector/mutation.
- Execution notes:
  Dos acciones explícitas pueden compartir form interno. Product selector paginado/searchable. Quantity decimal >0 hasta 4 decimales. Unit read-only. Reason requerido. Actor solo display. No movement type selector libre.
- Verification method:
  Tests de Product selection, decimal input, validation, exact requests, roles y success invalidation.
- Dependencies:
  Tasks 4, 6.

## Task 9: Implementar warning de saldo insuficiente/negativo

- Objective:
  Reflejar la regla de negocio de stock negativo sin introducir validación falsa.
- Files or areas likely involved:
  WRITE_OFF dialog/form.
- Execution notes:
  Calcular saldo resultante solo como ayuda visual. Si requested > current, mostrar warning y mantener confirm. Si current ya es negativo, usar warning específico. No optimistic cache ni local 409.
- Verification method:
  Tests demuestran warnings correctos y confirm habilitado para cantidades que llevan saldo a negativo.
- Dependencies:
  Task 8.

## Task 10: Implementar Inventory history

- Objective:
  Entregar `/inventario/movimientos` como ledger read-only para ADMIN/ENCARGADO.
- Files or areas likely involved:
  Inventory movements page/components/filters/query.
- Execution notes:
  Filtros product/type/from/to + pagination según OpenAPI. Labels para todos los movement types. Signed quantity, unit, reason, origin, actor. No Export ni summary cards. History de inactivos no debe filtrarse localmente.
- Verification method:
  Tests de guard, filtros, pagination, labels, signed values, states y ausencia de funciones fuera de scope.
- Dependencies:
  Tasks 4, 5.

## Task 11: Integrar polling opcional del historial y cerrar estados Inventory

- Objective:
  Mantener history coherente cuando esté montado y cubrir loading/error/empty diferenciados.
- Files or areas likely involved:
  Inventory history queries/page.
- Execution notes:
  Polling ~30s MAY seguir la misma estrategia que balances. Base empty y filtered empty deben diferir. Background error conserva data previa.
- Verification method:
  Query-state tests y fake timers; no polling tras unmount.
- Dependencies:
  Tasks 7, 10.

## Task 12: Implementar Expense registration y categorías opcionales

- Objective:
  Entregar `/gastos` sin adelantar HU-021.
- Files or areas likely involved:
  Expenses page/form/categories query/API.
- Execution notes:
  Category optional con `Sin categoría`; category empty/error no bloquea. Amount Bs. decimal >0 hasta 2 decimales. CashSource obligatorio sin default. Description requerida. No Shift/cash balance/history.
- Verification method:
  Tests de category loading/empty/error, amount, CashSource, description, route roles y exact request.
- Dependencies:
  Tasks 2, 4, 5.

## Task 13: Implementar fecha Bolivia, success confirmation y double-submit protection

- Objective:
  Completar el lifecycle funcional de HU-020 con fecha correcta y feedback verdadero.
- Files or areas likely involved:
  Expense form/date utility/success confirmation.
- Execution notes:
  Default/max `America/La_Paz`; pasado permitido/futuro rechazado. Pending deshabilita submit. Success usa ExpenseDto real, no afirma cash mutation y ofrece únicamente `Registrar otro gasto`. Reset también limpia CashSource.
- Verification method:
  Fake-date/timezone tests, success/reset tests, rapid double-click test y ausencia de `Ver historial`.
- Dependencies:
  Task 12.

## Task 14: Completar responsive, accessibility y scope-negative UI

- Objective:
  Alinear ambas features con el visual audit y mantenerlas usables a desktop/403/360.
- Files or areas likely involved:
  Inventory/Expenses presentation y dialogs.
- Execution notes:
  Inventory table→cards. Gastos mobile según referencia válida. No global sidebar/bottom-nav redesign. Labels/focus/keyboard/touch/aria. Confirmar ausencia de SKU fake, MinStock config, Expense history, Shift, cash balance, metrics y cloud sync.
- Verification method:
  Responsive/manual review de las diez referencias + RTL accessibility/scope tests.
- Dependencies:
  Tasks 6-13.

## Task 15: Completar test matrix y frontend regression

- Objective:
  Probar behavior crítico, permisos, polling, mutations y scope boundaries sin testear clases Tailwind exactas.
- Files or areas likely involved:
  Vitest/Testing Library suites y test utilities existentes.
- Execution notes:
  Cubrir routing, balances, low/negative, polls, movement forms, history, Expense categories/form/date/success, ProblemDetails y multi-role. No introducir una nueva testing architecture sin necesidad.
- Verification method:
  Todos los tests frontend descubiertos pasan con failed=0.
- Dependencies:
  Task 14.

## Task 16: Ejecutar todos los quality gates

- Objective:
  Resolver completamente los defectos automáticos del change.
- Files or areas likely involved:
  Frontend completo.
- Execution notes:
  Revalidar scripts reales. Esperados actualmente: `api:generate`, `format:check`, `typecheck`, `lint`, `test`, `build`. Cualquier error React/TS/Query/form/polling/date/Tailwind normal debe diagnosticarse, corregirse y volver a ejecutar.
- Verification method:
  Todos los scripts requeridos terminan PASS; failed tests = 0.
- Dependencies:
  Task 15.

## Task 17: Preparar validación manual y external-integration notes

- Objective:
  Dejar un plan reproducible de validación humana sin fabricar evidencia.
- Files or areas likely involved:
  Documentation/checklist.
- Execution notes:
  Inventory: desktop/403/360, roles, polling, ENTRY, WRITE_OFF, negative warning, low stock, history. Expenses: desktop/403/360, category optional/empty/error, CashSource, date, success/reset. Si no hay Products reales disponibles por dependencia externa, registrar `DEFERRED_EXTERNAL_INTEGRATION` solo para esa validación E2E.
- Verification method:
  Checklist completo y resultados reales cuando se ejecuten; ningún screenshot inventado.
- Dependencies:
  Task 16.

## Task 18: Actualizar HU-005/HU-020 y producir frontend handoff

- Objective:
  Registrar implementación real y preparar futuras HU-006/HU-021.
- Files or areas likely involved:
  HU documents, OpenSpec/change documentation, frontend handoff.
- Execution notes:
  Documentar routes, roles, endpoints, query keys, polling, manual movement UX, negative warning, low-stock rules, Expense flow, responsive, tests y evidence. HU-006 y HU-021 siguen PENDING. Configuración de alertas = DEFERRED.
- Verification method:
  Documentación concuerda con OpenAPI/generated contract y UI final.
- Dependencies:
  Task 17.

## Task 19: Producir endpoint map, visual reconciliation y file manifest

- Objective:
  Cerrar trazabilidad técnica y visual del change.
- Files or areas likely involved:
  Change/HU documentation.
- Execution notes:
  Incluir tabla capability/method/route/roles/API/query-consumer. Enumerar las diez imágenes con KEEP/ADAPT/OMIT/DEFER final. Enumerar todos los archivos versionados cambiados por categoría. Backend debe aparecer `UNCHANGED` salvo blocker excepcional documentado.
- Verification method:
  Todos los endpoints consumidos y archivos cambiados aparecen exactamente una vez; ninguna referencia visual queda sin reconciliar.
- Dependencies:
  Task 18.

## Task 20: Cerrar Definition of Done honestamente

- Objective:
  Determinar si frontend HU-005/HU-020 está completo sin marcar como implementadas HU-006/HU-021 ni inventar manual evidence.
- Files or areas likely involved:
  Change completo.
- Execution notes:
  Revisar acceptance criteria, quality gates, responsive, accessibility y documentación. Minor visual polish puede quedar `DEFERRED_NON_BLOCKING`. Manual E2E puede quedar `DEFERRED_EXTERNAL_INTEGRATION` únicamente si Product data/capability externa no está disponible.
- Verification method:
  Estados documentados:
  - HU-005 backend: COMPLETE
  - HU-005 frontend: COMPLETE
  - HU-020 backend: COMPLETE
  - HU-020 frontend: COMPLETE
  - HU-006: PENDING
  - HU-021: PENDING
  - backend: UNCHANGED
  - SignalR: NONE
  - VERIFY: NOT RUN
  - ARCHIVE: NOT RUN
- Dependencies:
  Task 19.

## Runtime Autonomy / Blocker Taxonomy

Future APPLY MUST NOT detenerse por:

- React compile errors;
- TypeScript errors;
- generated type adaptations;
- query-key bugs;
- TanStack Query polling bugs;
- form validation bugs;
- decimal parsing;
- date formatting;
- America/La_Paz conversion;
- Dialog issues;
- ProblemDetails parsing;
- pagination bugs;
- responsive/Tailwind issues;
- test failures;
- mock setup;
- lint;
- format;
- build.

Loop obligatorio:

diagnose
→ fix
→ retest
→ continue

Valid hard blockers exclusivamente:

- `PRODUCT_DECISION_REQUIRED`
- `SDD_CONTRADICTION`
- `SECURITY_CONFLICT`
- `DESTRUCTIVE_CHANGE_REQUIRED`
- `BASELINE_CONTRACT_BLOCKER`
- `UNRECOVERABLE_RUNTIME_BLOCKER`

`BASELINE_CONTRACT_BLOCKER` aplica únicamente cuando el `develop` local final no contiene una API aprobada requerida por este SDD.

No aplica a:

- naming distinto;
- generated alias distinto;
- optional/nullable differences adaptables;
- component path distinto;
- normal TypeScript incompatibility resoluble.

## Recommended OpenSpec Decomposition

Mantener un solo change con specs separadas:

- `specs/inventory-balances-ui/spec.md`
- `specs/inventory-movements-ui/spec.md`
- `specs/inventory-manual-movements-ui/spec.md`
- `specs/inventory-polling-ui/spec.md`
- `specs/expense-registration-ui/spec.md`
- `specs/frontend-responsive-and-delivery/spec.md`

No crear un segundo change para Expenses.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 2.500–4.000 LoC manuales más el diff generado de `api.generated.ts`, dependiendo del UI Kit reutilizable y de los detalles finales observados en las diez referencias visuales.
- Risk of exceeding 400 LoC review threshold:
  Very High.
- Recommendation:
  Chained PRs
- Suggested split if chained:
  - PR 1: generated contract + endpoint/query foundations + routes.
  - PR 2: Inventory balances/responsive/polling.
  - PR 3: ENTRY/WRITE_OFF dialogs + Product selector.
  - PR 4: Inventory history.
  - PR 5: Expense registration/categories/business-date/success.
  - PR 6: responsive/accessibility/test closure.
  - PR 7: documentation/handoff/file manifest.

  Todos pertenecen al único OpenSpec change:
  `implement-hu-005-020-inventory-and-expenses-frontend`.

## APPLY Evidence Status

- Tasks 1–3: complete. Local branch/HEAD and the five endpoints were audited; API types were regenerated from the running local OpenAPI endpoint.
- Tasks 4–14: complete for the automatable frontend scope. Inventory and Expenses have separated adapters, keys, routes, pages, responsive presentations, REST polling, forms, and bounded scope.
- Tasks 15–16: complete. The frontend suite passes (45/45 tests); `api:generate`, typecheck, lint, and build pass. `format:check` remains PREEXISTING_BASELINE_DEBT in `frontend/src/features/products/api.ts`, `frontend/src/features/products/pages.tsx`, and `frontend/src/lib/api/http-client.ts`.
- Tasks 17–20: complete for documentation and delivery preparation. Manual browser/E2E validation remains PENDING and human-owned; no capture or executed E2E evidence is represented as complete.

Deferred only: final Sprint 1 navigation/shell reconciliation, future alert configuration (HU-006-equivalent), and Expense history (HU-021).
