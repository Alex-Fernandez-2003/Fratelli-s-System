# Tasks

## Task 1: Auditar baseline real y activar el backend gate

- Objective:
  Confirmar que `develop` contiene realmente el backend final HU-009/HU-010/HU-011 antes de modificar frontend.
- Files or areas likely involved:
  Backend API/OpenAPI/SignalR, frontend baseline, Git metadata de solo lectura.
- Execution notes:
  Registrar HEAD y status. Confirmar todos los endpoints Orders/Kitchen, DTOs, policies y `/hubs/kitchen`. Confirmar HU-001/HU-002 frontend. No realizar mutaciones Git.
- Verification method:
  OpenAPI/runtime demuestra contratos finales y hub disponible.
- Dependencies:
  None.

## Task 2: Auditar el paquete visual completo

- Objective:
  Convertir todas las referencias de `HU-009_HU-010_HU-011.zip` en un contrato visual explícito.
- Files or areas likely involved:
  ZIP de referencias y notas/spec visual del change.
- Execution notes:
  Enumerar todos los PNG, no solo los cuatro conocidos. Registrar screen, viewport, state, hierarchy, controls y decisión KEEP/ADAPT/OMIT. Comparar cada acción contra backend real.
- Verification method:
  Inventario 100 % del ZIP sin archivos no revisados.
- Dependencies:
  None.

## Task 3: Auditar OpenAPI y regenerar TypeScript

- Objective:
  Convertir el backend final en la autoridad TypeScript frontend.
- Files or areas likely involved:
  OpenAPI runtime, script `api:generate`, `frontend/src/types/api.generated.ts`.
- Execution notes:
  Ejecutar generación canónica. Inspeccionar paths, DTOs, requests, enums y pagination. No editar generated file.
- Verification method:
  `pnpm run api:generate` exit 0; Orders/Kitchen schemas presentes; regeneración repetida estable.
- Dependencies:
  Task 1.

## Task 4: Extender endpoint registry y adapters frontend

- Objective:
  Integrar Orders/Kitchen mediante shared HTTP foundation.
- Files or areas likely involved:
  `lib/api/endpoints`, shared httpClient si falta un verbo genérico, feature API modules.
- Execution notes:
  Usar generated types. No fetch paralelo, Axios, tokens manuales ni bearer manual.
- Verification method:
  Tests de adapters validan methods, URLs, query/body y uso del shared client.
- Dependencies:
  Task 3.

## Task 5: Crear la foundation de query keys y TanStack Query

- Objective:
  Definir keys, list/detail queries y mutation boundaries reutilizables.
- Files or areas likely involved:
  `features/orders`, `features/kitchen`.
- Execution notes:
  Incluir todos los filtros normalizados. Preparar helpers de invalidación. No crear QueryClient.
- Verification method:
  Tests confirman estabilidad/diferenciación de keys e invalidaciones.
- Dependencies:
  Task 4.

## Task 6: Integrar rutas y navegación autorizada

- Objective:
  Registrar las cuatro rutas y extender el AppShell/navegación existentes sin romper HU-001/HU-002.
- Files or areas likely involved:
  `AppRoutes`, navegación autenticada.
- Execution notes:
  Reutilizar RequireAuth/RequireAnyRole. Añadir solo Pedidos/Cocina. Expandir la path union actual de forma type-safe.
- Verification method:
  Routing tests por cada rol y multi-role; `/inicio` y `/usuarios` siguen funcionando.
- Dependencies:
  Task 3.

## Task 7: Implementar Orders List

- Objective:
  Entregar `/pedidos` con list, search, status, pagination y actions server-driven.
- Files or areas likely involved:
  Orders feature/page/components.
- Execution notes:
  Search/status resetean page=1. No local-only filtering. Desktop structured list/table; mobile cards. No Activos/Histórico toggle artificial.
- Verification method:
  Tests de render/search/status/page/loading/empty/filtered-empty/error/action visibility; validación desktop/403/360 posterior.
- Dependencies:
  Tasks 2, 5, 6.

## Task 8: Implementar catálogo y draft de New Order

- Objective:
  Entregar el estado local de `/pedidos/nuevo` sin persistencia.
- Files or areas likely involved:
  Orders create page/cart components, Catalog integration.
- Execution notes:
  Consumir Products reales. Cart keyed por ProductId. Duplicate add incrementa quantity. Stepper unitario. Draft no storage. Categories/images solo si contrato real las soporta.
- Verification method:
  Tests de catalog/search/add/dedup/quantity/remove/notes/tableReference/draft total.
- Dependencies:
  Tasks 2, 3, 5, 6.

## Task 9: Completar Create Order

- Objective:
  Persistir un Order mediante un único request contractual y navegar al detail.
- Files or areas likely involved:
  Create mutation/New Order page.
- Execution notes:
  Payload sin price/status/actor/waiter/total. Un único CTA. Invalidate Orders/Kitchen según resultado y usar real returned id.
- Verification method:
  Tests de payload exacto, empty cart, validation, KITCHEN PENDIENTE, no-KITCHEN LISTO y navigation.
- Dependencies:
  Task 8.

## Task 10: Implementar Order Detail read-only

- Objective:
  Entregar `/pedidos/:id` con información persistida y acciones permitidas.
- Files or areas likely involved:
  Order detail page/components.
- Execution notes:
  Mostrar items/prices/totals/notes/waiter/status/cancellation/Kitchen relation contractual. No edición ni Add Items/checkout.
- Verification method:
  Tests de datos, absence de funciones prohibidas, acciones y 404.
- Dependencies:
  Tasks 5, 6, 9.

## Task 11: Implementar assignment administrativo

- Objective:
  Permitir ADMINISTRADOR asignar/reasignar un MESERO válido.
- Files or areas likely involved:
  Order actions/dialog, reusable Users query.
- Execution notes:
  Reutilizar HU-002 Users. Filtrar MESERO + active y usar employeeId real. Manejar paginación si existen más resultados que una página. No optimistic state.
- Verification method:
  ADMIN ve control; ENCARGADO/MESERO no; success invalida; 409 refetchea.
- Dependencies:
  Tasks 5, 7, 10.

## Task 12: Implementar waiter Take

- Objective:
  Permitir a MESERO tomar Order unassigned no terminal.
- Files or areas likely involved:
  Orders actions/mutation.
- Execution notes:
  No enviar employeeId. Mostrar según status. No optimistic success. 409 muestra race + refetch.
- Verification method:
  Tests PENDIENTE/EN_PREPARACION/LISTO, terminal absence, success y concurrent-conflict UX.
- Dependencies:
  Tasks 7, 10.

## Task 13: Implementar Cancel y Deliver

- Objective:
  Completar las mutaciones operativas de HU-009/HU-011.
- Files or areas likely involved:
  Order dialogs/actions/mutations.
- Execution notes:
  Cancellation reason optional. Deliver no crea Sale. Aplicar matriz ownership/roles. Invalidar Orders y Kitchen cuando cancelación afecta Command.
- Verification method:
  Tests MESERO own/other, ENCARGADO global, ADMIN global, optional reason, pending, success, 409, no Sale UI.
- Dependencies:
  Tasks 10, 12.

## Task 14: Implementar KDS compartido

- Objective:
  Entregar `/cocina` usando una misma feature para operational y read-only.
- Files or areas likely involved:
  Kitchen feature/page/cards.
- Execution notes:
  Query separada por PENDIENTE/EN_PREPARACION/LISTA. Desktop columns; mobile tabs. MESERO sin mutation controls. Omitir priority/progress/station/financials/Retirar ya.
- Verification method:
  Tests de groups/cards/roles/actions/no-fictional-fields y comparación con referencias.
- Dependencies:
  Tasks 2, 5, 6.

## Task 15: Implementar Kitchen mutations

- Objective:
  Conectar Start, Ready y Cancel con refetch autoritativo.
- Files or areas likely involved:
  Kitchen mutations, cards, cancel dialog.
- Execution notes:
  No optimistic state. Invalidar Kitchen + Orders. LISTA no tiene acción Kitchen posterior.
- Verification method:
  Tests COCINA/ENCARGADO/ADMIN, MESERO read-only, pending, success y 409.
- Dependencies:
  Task 14.

## Task 16: Implementar ElapsedTime reusable

- Objective:
  Mostrar elapsed time realtime local sin network traffic ni drift acumulado.
- Files or areas likely involved:
  Componente/hook reusable y tests.
- Execution notes:
  `Date.now() - timestamp` en cada tick ~1s, cleanup, clamp a 0, formato adaptativo, sin aria-live.
- Verification method:
  Fake timers verifican actualización absoluta, cleanup, formatting y cero query/fetch calls.
- Dependencies:
  Task 14.

## Task 17: Implementar la conexión SignalR compartida

- Objective:
  Consumir `/hubs/kitchen` desde una única conexión integrada con la sesión HU-001.
- Files or areas likely involved:
  Kitchen realtime adapter/provider; session coordinator solo si necesita accessor in-memory mínimo.
- Execution notes:
  `withAutomaticReconnect` o equivalente real. `accessTokenFactory` usa token vigente in-memory. No storage ni token props.
- Verification method:
  Tests de lifecycle, auth accessor, una conexión y cleanup.
- Dependencies:
  Tasks 1, 5.

## Task 18: Integrar events e invalidation

- Objective:
  Mantener Orders/Kitchen actualizados mediante REST autoritativo después de eventos.
- Files or areas likely involved:
  Kitchen realtime handler + QueryClient integration.
- Execution notes:
  Consumir nombres reales. Created/Updated/Cancelled invalidan roots. No patch manual del business state.
- Verification method:
  Tests de cada evento y queries invalidadas.
- Dependencies:
  Task 17.

## Task 19: Implementar reconnect, connection status y fallback polling

- Objective:
  Mantener operación usable cuando SignalR se interrumpe.
- Files or areas likely involved:
  Realtime state, KDS connection indicator, query refetch interval.
- Execution notes:
  Connected=no fallback; reconnecting/disconnected≈30s. On reconnect invalidate Orders+Kitchen una vez y detener fallback.
- Verification method:
  Fake timers verifican connected/disconnected/reconnected. ElapsedTime 1s no provoca refetch.
- Dependencies:
  Tasks 16, 18.

## Task 20: Completar responsive y reconciliación visual

- Objective:
  Aplicar el contrato visual completo del ZIP sin sacrificar scope/backend authority.
- Files or areas likely involved:
  Orders/New Order/Detail/KDS/modals.
- Execution notes:
  Validar desktop, 403, 360. Tailwind como estrategia principal. No bottom-nav paralela salvo que la foundation real ya la requiera. Registrar intentional differences.
- Verification method:
  Side-by-side review de todas las referencias; no overflow funcional; acciones accesibles.
- Dependencies:
  Tasks 2, 7, 9, 10, 13, 14, 15, 19.

## Task 21: Completar accessibility y estados

- Objective:
  Cerrar loading/error/empty/focus/keyboard/touch behavior.
- Files or areas likely involved:
  Todas las nuevas pantallas/componentes.
- Execution notes:
  Dialog accesible existente, status con texto, icon aria-label, timer no live, previous useful data durante refetch cuando corresponda.
- Verification method:
  RTL + keyboard/manual smoke.
- Dependencies:
  Task 20.

## Task 22: Completar test matrix frontend

- Objective:
  Cubrir todas las capacidades sin duplicar exhaustivamente state-machine backend.
- Files or areas likely involved:
  Vitest/Testing Library tests.
- Execution notes:
  Incluir routing, Orders, Create, Detail, assignment/take, cancel/deliver, KDS, timer, SignalR, reconnect, polling, invalidation y 409.
- Verification method:
  `pnpm test` PASS, failed=0.
- Dependencies:
  Tasks 7-21.

## Task 23: Ejecutar quality gates

- Objective:
  Resolver todos los defectos ordinarios antes de manual validation.
- Files or areas likely involved:
  Frontend completo.
- Execution notes:
  Ejecutar script real de generación nuevamente y luego format/typecheck/lint/test/build. Cualquier defecto React/TS/Query/SignalR normal se diagnostica, corrige y vuelve a probar.
- Verification method:
  `pnpm run api:generate` PASS.
  `pnpm run format:check` PASS.
  `pnpm run typecheck` PASS.
  `pnpm run lint` PASS.
  `pnpm test` PASS.
  `pnpm run build` PASS.
- Dependencies:
  Task 22.

## Task 24: Preparar y ejecutar la validación manual acordada

- Objective:
  Validar funcionalidad, responsive y fidelity con usuarios/roles reales.
- Files or areas likely involved:
  Runtime frontend/backend y checklist documental.
- Execution notes:
  Validar Orders desktop/403/360; New Order KITCHEN/no-KITCHEN; Detail; assignment; Take; Cancel; Deliver; KDS COCINA/MESERO; realtime; reconnect; status; timers; 409 UX. No fabricar screenshots.
- Verification method:
  Resultados manuales reales registrados. Alex acepta o registra defects concretos.
- Dependencies:
  Task 23.

## Task 25: Actualizar HU-009, HU-010 y HU-011

- Objective:
  Cerrar documentalmente las tres historias cuando corresponda.
- Files or areas likely involved:
  Documentos reales de HU.
- Execution notes:
  Registrar frontend routes, endpoints consumidos, roles, actions, generated contract, Query strategy, SignalR, polling, responsive, tests, evidence y deferred polish. Solo declarar end-to-end complete tras manual validation aceptada.
- Verification method:
  Documentación coincide con implementation/runtime.
- Dependencies:
  Task 24.

## Task 26: Documentar endpoint-consumption table y SignalR table

- Objective:
  Crear trazabilidad directa frontend ↔ backend.
- Files or areas likely involved:
  HU/OpenSpec/change docs.
- Execution notes:
  Endpoint table:
  Frontend capability | Method | Backend route | Roles | Frontend API area | Query/mutation | Consumer.

  SignalR table:
  Hub | Roles | Event | Handler | Queries invalidated | Fallback behavior.

- Verification method:
  Todos los endpoints/events realmente consumidos aparecen y ninguno inventado.
- Dependencies:
  Task 25.

## Task 27: Documentar referencias visuales y diferencias intencionales

- Objective:
  Registrar fidelidad real sin afirmar pixel-perfect.
- Files or areas likely involved:
  Change/HU docs.
- Execution notes:
  Enumerar todos los assets del ZIP. Usar:
  `Functional and responsive fidelity aligned with supplied references for MVP.`

  Explicar omisiones como Add Items, checkout, pre-cuenta, tax, priority, progress, Retirar ya.

- Verification method:
  Cada imagen auditada está mencionada; las diferencias corresponden a backend/scope real.
- Dependencies:
  Tasks 2, 24.

## Task 28: Generar complete file manifest

- Objective:
  Documentar todos los archivos versionados modificados.
- Files or areas likely involved:
  Change/HU documentation.
- Execution notes:
  Agrupar:
  - Generated contract
  - lib/api
  - auth/realtime integration
  - features/orders
  - features/kitchen
  - pages/routes/navigation
  - shared components
  - tests
  - docs/OpenSpec/config

  Backend = UNCHANGED salvo metadata fix estrictamente imprescindible.

- Verification method:
  Manifest derivado del diff real y cada archivo contiene purpose.
- Dependencies:
  Task 27.

## Task 29: Cerrar Definition of Done

- Objective:
  Determinar honestamente si las tres HU pueden declararse completas end-to-end.
- Files or areas likely involved:
  Change completo.
- Execution notes:
  No confundir automated green con manual visual acceptance. Minor polish puede quedar DEFERRED_NON_BLOCKING solo si no afecta usabilidad.
- Verification method:
  Todos los Acceptance Criteria tienen resultado real.
- Dependencies:
  Task 28.

## Runtime Autonomy

Durante APPLY, Pi MUST continuar ante:

- React compile errors;
- TypeScript errors;
- generated-type adaptations derivables de OpenAPI;
- TanStack Query errors;
- key/invalidation bugs;
- SignalR client issues;
- reconnect bugs;
- timer bugs;
- test/mock failures;
- routing bugs;
- 403/409 presentation defects;
- responsive issues;
- Tailwind issues;
- lint;
- format;
- build;
- minor visual differences.

Loop obligatorio:

diagnose
→ fix
→ retest
→ continue

Human blockers exclusivamente:

- PRODUCT_DECISION_REQUIRED
- SDD_CONTRADICTION
- SECURITY_CONFLICT
- DESTRUCTIVE_CHANGE_REQUIRED
- UNRECOVERABLE_RUNTIME_BLOCKER

Si backend final aún no está integrado en `develop`, corresponde:

`UNRECOVERABLE_RUNTIME_BLOCKER`

para este frontend change.

## Recommended OpenSpec Decomposition

Mantener un único change con specs cohesionadas:

- `specs/orders-frontend/spec.md`
- `specs/new-order/spec.md`
- `specs/order-assignment-and-actions/spec.md`
- `specs/kitchen-kds/spec.md`
- `specs/kitchen-realtime/spec.md`
- `specs/responsive-and-visual-contract/spec.md`
- `specs/frontend-delivery-contract/spec.md`

No crear changes separados por HU.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 3.000–5.000 LoC manuales más el diff generado de `api.generated.ts`, dependiendo del número real de estados visuales del ZIP y de cuánto UI Kit pueda reutilizarse.
- Risk of exceeding 400 LoC review threshold:
  Very High.
- Recommendation:
  Chained PRs
- Suggested split if chained:
  - PR 1: OpenAPI/generated contract + endpoint/query foundation + routes/navigation.
  - PR 2: Orders list/detail.
  - PR 3: New Order/cart/create.
  - PR 4: assignment/take/cancel/deliver.
  - PR 5: KDS operational/read-only + ElapsedTime.
  - PR 6: SignalR/reconnect/poll fallback.
  - PR 7: responsive/accessibility/test closure.
  - PR 8: manual-validation fixes + documentation/evidence.

Todos los slices pertenecen al mismo OpenSpec change:
`implement-hu-009-010-011-orders-and-kitchen-frontend`.
