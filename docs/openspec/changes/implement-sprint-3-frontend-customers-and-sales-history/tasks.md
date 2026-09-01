# Tasks

## Task 1: Revalidar el working tree y congelar el contrato frontend real

- Objective:
  - [x] Registrar branch, HEAD, `git status --short`, package manager, scripts, router, navigation, auth/capabilities, feature tree, generated API Sprint 3, ConfirmSale y test infrastructure antes de editar código.
- Files or areas likely involved:
  `frontend/package.json`, lockfile, `frontend/src/types/api.generated.ts`, router real, navigation config real, auth helpers, Orders/Sales/ConfirmSale, OpenSpec archivado Sprint 3 y HU-014/HU-015.
- Execution notes:
  Solo inspección inicialmente. Comparar working tree local con el snapshot público y descartar cualquier nombre/path de este briefing que no coincida. Documentar endpoints, schemas, nullable semantics, filters, permissions y behavior MESERO sin Shift. Confirmar si existe librería PDF y primitives overlay/formatters.
- Verification method:
  Baseline note con HEAD/status y una tabla de endpoints/types consumibles para HU-014/HU-015. Ningún source code edit antes de completar la tabla.
- Dependencies:
  None.

## Task 2: Mapear reutilización de componentes y definir los límites de feature

- Objective:
  - [x] Clasificar cada necesidad de Customers/Sales como REUSE, EXTEND o CREATE sin duplicar primitives existentes.
- Files or areas likely involved:
  Atoms, molecules, organisms, templates, features existentes de users/proveedores/orders/sales, lib/query, lib/api, styles.
- Execution notes:
  Auditar PageHeader, Input, Select, FormField, Dialog, Drawer/Sheet, DataTable, Card, Pagination, Badge, confirm dialog, Toast, loading/empty/error, money/date formatters. Definir ubicación real de `customers` y `sales` siguiendo convenciones del working tree.
- Verification method:
  Reuse matrix completada; cualquier nuevo shared primitive debe justificar que al menos dos consumers reales lo necesitan o que no existe equivalente.
- Dependencies:
  Task 1.

## Task 3: Integrar las rutas, capabilities y navegación del Bloque 1

- Objective:
  - [x] Añadir las rutas Customers y Sales History al router/nav existente con guards y unión multi-role coherentes con backend.
- Files or areas likely involved:
  Router real, navigation definition, authorization helpers/tests.
- Execution notes:
  Customers visible a ADMIN/ENCARGADO/MESERO. Sales History según policy real, con MESERO narrow y broad roles. No diseñar un nuevo AppShell. Mantener match de child routes y mobile drawer actuales. Empezar con RED en route/nav permission tests, luego GREEN/TRIANGULATE/REFACTOR.
- Verification method:
  Tests de navegación y acceso directo para allowed, forbidden, anonymous y al menos un multi-role. Desktop/mobile comparten la misma fuente de navigation.
- Dependencies:
  Tasks 1, 2.

## Task 4: Crear la capa de datos y query keys de Customers

- Objective:
  - [x] Implementar el adapter Customer tipado y queries/mutations TanStack Query a partir del generated contract real.
- Files or areas likely involved:
  Feature Customer API/query module, query-key factory, shared HTTP client.
- Execution notes:
  No DTO backend manual completo. Incluir list/search/pagination y status filter solo si server-side existe. Mutations create/update/activate/deactivate según operations reales. Mantener ProblemDetails del shared client. TDD RED para mapping/query behavior antes de GREEN.
- Verification method:
  Tests de request/query mapping, keys distintas por filters/page y mutation invalidation. TypeScript sin `any` para evadir generated contract.
- Dependencies:
  Tasks 1, 2.

## Task 5: Implementar CustomerForm reutilizable y lifecycle permissions

- Objective:
  - [x] Crear/extender un único CustomerForm para create, edit y quick-create con Name, CI, NIT opcional y Notes opcional.
- Files or areas likely involved:
  Feature Customers form/components, form tests, existing FormField/Input primitives.
- Execution notes:
  No IsActive toggle. Create nace active según contrato. Edit no altera status. Añadir mapping de conflictos CI/NIT, trim y pending state. Mantener create/edit mode sin duplicar formularios. RED para validation/conflict behavior; GREEN; TRIANGULATE con whitespace/NIT null; REFACTOR.
- Verification method:
  Tests de campos obligatorios, optional fields, ausencia de status toggle, duplicate CI/NIT y double submit.
- Dependencies:
  Task 4.

## Task 6: Implementar la pantalla responsive de Customers

- Objective:
  - [x] Implementar Customer management desktop/mobile usando búsqueda y paginación server-side y actions según capability.
- Files or areas likely involved:
  Customers page, table/card components, status badges, pagination, filter controls, confirm dialogs.
- Execution notes:
  Desktop table: Name, CI, NIT, Notes, Status, Actions. Mobile cards: Name/status/CI/NIT/notes/actions. MESERO sin activate/deactivate. Separar base-empty de filtered-empty. Status filter solo si backend lo soporta. No Customer delete.
- Verification method:
  Component/integration tests para list, search, pagination, empty/error/loading, role actions y activate/deactivate. Manual-ready check a 360px sin tabla comprimida.
- Dependencies:
  Tasks 3, 4, 5.

## Task 7: Integrar Customer selector y quick-create en ConfirmSale

- Objective:
  - [x] Extender el ConfirmSale existente con Customer opcional, `Consumidor final`, búsqueda de activos y quick-create sin romper el estado de venta actual.
- Files or areas likely involved:
  ConfirmSale page/component, CustomerSelector, CustomerForm reuse, Customer queries, Sale API request mapper, tests.
- Execution notes:
  Mantener ownership de payment/channel/order/shortage en ConfirmSale. Quick-create reutiliza Task 5. Success selecciona ID devuelto. Cancel conserva selección previa. No Customer snapshots client-side. Manejar Customer concurrentemente inactivo sin fallback silencioso a null. RED primero para state preservation y request payload.
- Verification method:
  Tests para customerId seleccionado, null customer, quick-create/autoselect, duplicate conflict, cancel, concurrent inactive y regresión payment/channel/shortage.
- Dependencies:
  Tasks 4, 5, 6.

## Task 8: Crear la capa de consulta tipada de Sales History y Detail

- Objective:
  - [x] Implementar query keys, history filters, paginación y detail on-demand usando generated Sale contracts.
- Files or areas likely involved:
  Sales feature API/query module, business-time/date utility, tests.
- Execution notes:
  Default today con semántica local vigente. Query key incluye todos los filtros. Page reset en cambios. No reports endpoint. No N+1 detail. Auditar y representar correctamente MESERO sin Shift. RED para filters/query mapping y multi-role scope.
- Verification method:
  Tests que inspeccionen query params, page reset, default date, unique query keys y detail disabled hasta selección.
- Dependencies:
  Tasks 1, 2, 3.

## Task 9: Implementar Sales History desktop/mobile con scope autorizado

- Objective:
  - [x] Construir la vista transaccional de Sales History, adaptando filtros y presentación al scope del usuario.
- Files or areas likely involved:
  Sales History page, filters, DataTable, mobile cards, pagination/load-more adapter, formatters, tests.
- Execution notes:
  Desktop table y mobile cards. Payment labels exclusivamente CASH/QR/EXTERNAL; Channel exclusivamente DIRECT/PEDIDOSYA. Customer null = Consumidor final. Sin fake sale number, revenue cards ni New Sale. MESERO-only sin broad Shift selector; multi-role broad sí puede recibir controles amplios.
- Verification method:
  Tests para labels/enums, customer snapshot, null customer, filters, pagination, MESERO narrow, multi-role broad, ausencia de mockup-only features y responsive structure.
- Dependencies:
  Tasks 3, 8.

## Task 10: Implementar Sale Detail responsive desde snapshots históricos

- Objective:
  - [x] Añadir detail overlay desktop/mobile mostrando metadata, snapshots, items y total reales.
- Files or areas likely involved:
  Sale detail components, overlay/dialog/sheet primitive, Sale detail query, tests.
- Execution notes:
  Reusar overlay real. Customer sale data se toma de snapshots. No GET Customer actual. Omitir CI/NIT null. No IVA, descuentos, Reprint Ticket o fake sequence. Manejar 404/error sin crash. Mantener focus/close/scroll accessible.
- Verification method:
  Tests de snapshot immutability, item mapping, total, null customer, 404, ausencia de fiscal/mock fields y keyboard close/focus según primitive.
- Dependencies:
  Tasks 8, 9.

## Task 11: Seleccionar e integrar una estrategia PDF client-side

- Objective:
  - [x] Auditar dependencias y, si hace falta, incorporar una librería PDF mantenida mediante el package manager real, encapsulando la generación en un adapter testeable.
- Files or areas likely involved:
  `frontend/package.json`, lockfile, Sales PDF utility/adapter, Sale detail UI, tests.
- Execution notes:
  Evaluar TypeScript/Vite, browser-only, bundle, maintenance y testability. No SaaS, backend o generated type changes. PDF recibe Sale detail y produce comprobante interno no fiscal. Filename usa fecha/hora + ID real. No instalar CSV/XLSX. RED para mapper/export invocation antes de integración.
- Verification method:
  Dependency registrada solo si es necesaria; tests del mapper, export action, filename, snapshot Customer, Customer null y ausencia de IVA/descuentos/fake number. Build confirma compatibilidad.
- Dependencies:
  Task 10.

## Task 12: Completar estados UX, responsive y accesibilidad del bloque

- Objective:
  - [x] Validar loading/error/empty/pending, layout 360px/tablet/desktop y accesibilidad de Customers, ConfirmSale extension, Sales History, detail y PDF.
- Files or areas likely involved:
  Feature components/styles y primitives existentes.
- Execution notes:
  Reutilizar tokens Fratelli. No pixel-perfect. Verificar focus, keyboard, aria-labels, labels, dialog focus management, touch targets y no color-only status. No AppShell redesign.
- Verification method:
  Component tests donde sea práctico y checklist manual-ready para 360px, ~768px y >=1280px sin horizontal overflow no intencional.
- Dependencies:
  Tasks 6, 7, 9, 10, 11.

## Task 13: Ejecutar la regresión frontend completa y revisar el contrato

- Objective:
  - [x] Ejecutar todos los quality gates reales y demostrar que el bloque no rompe Orders/ConfirmSale/Auth/Sprint 1–2.
- Files or areas likely involved:
  Frontend completo; no cambios adicionales salvo fixes derivados del scope.
- Execution notes:
  Usar scripts auditados en Task 1. En el snapshot público actual son `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test`, `pnpm run build`. No ejecutar `api:generate` salvo drift contractual real previamente diagnosticado. No arreglar deuda no relacionada. citeturn672392view1
- Verification method:
  Registrar resultados reales, total/passed/failed/skipped del test runner, failed=0, typecheck/lint/build green y diff sin backend/OpenAPI/generated manual edits.
- Dependencies:
  Tasks 3–12.

## Task 14: Sincronizar HU-014/HU-015 y preparar evidencia real

- Objective:
  - [x] Actualizar exclusivamente documentación necesaria de HU-014/HU-015 con implementation manifest, frontend status, contratos reutilizados, tests y evidencia que realmente exista.
- Files or areas likely involved:
  HU-014, HU-015, OpenSpec del change, handoff/evidence según convención local.
- Execution notes:
  Mantener manifests separados por HU aunque existan archivos compartidos. No fabricar screenshots, manual validation ni resultados. Backend se documenta como REUSED/UNCHANGED. Generated TypeScript se lista como UNCHANGED salvo evidencia real de regeneración aprobada.
- Verification method:
  HU-014 y HU-015 reflejan frontend complete solo cuando Task 13 pasa; paths/manifests corresponden al diff real; evidencia manual ausente se declara pendiente.
- Dependencies:
  Task 13.

## Task 15: Ejecutar auditoría final de alcance y handoff

- Objective:
  - [x] Confirmar que el change contiene únicamente HU-014/HU-015 frontend y queda listo para revisión/aplicación del siguiente lifecycle step.
- Files or areas likely involved:
  Diff completo, router/navigation, Customers, ConfirmSale, Sales History/detail/PDF, tests, docs.
- Execution notes:
  Verificar: backend unchanged; OpenAPI unchanged; no manual generated edits; no Customer delete; no fake Consumidor Final; no fake Sale numbers; no Card/Transfer/QR Simple; no IVA/descuentos; no New Sale; no Reprint; no report summaries; no AppShell rewrite; no CSV/XLSX.
- Verification method:
  Checklist de Definition of Done y manifest real del diff. Cualquier requisito que resulte imposible por contrato backend debe reportarse como `BACKEND_CONTRACT_BLOCKER`, no solucionarse con mock data.
- Dependencies:
  Tasks 13, 14.

## Task 15 completion note — maintainer-approved scope boundary

- Task 15 was rerun after Alex's maintainer-authorized native reset and is complete.
- The scope proof explicitly excludes the following unrelated, user-owned manual paths; they were inspected only as excluded paths and were not altered, deleted, or reverted: `docs/images/arquitectura-contenedores.png`, `docs/images/diagrama-actividad-negocio.png`, `docs/images/diagrama-casos-uso-acceso-administracion.png`, `docs/puml/arquitectura-contenedores.puml`, `docs/puml/diagrama-actividad-negocio.puml`, `docs/puml/diagrama-casos-uso-acceso-administracion.puml`, and `docs/openspec/changes/implement-sprint-3-remaining-frontend-and-demo-data/`.
- Under that approved exclusion, the remaining changed and untracked paths are attributable to the HU-014/HU-015 frontend slice, its documentation, and its OpenSpec evidence. Manual browser validation at approximately 360px, 768px, and 1280px remains honestly pending.

## Review Workload Forecast

- Estimated LoC changed:
  1,200–2,200 LoC aproximadamente, dominados por dos features UI responsive, integración ConfirmSale, tests y PDF. La cifra MUST reestimarse tras Task 1/2 porque el working tree local puede contener foundations Sprint 3 no visibles públicamente.
- Risk of exceeding 400 LoC review threshold:
  Alto.
- Recommendation:
  Chained PRs.
- Suggested split if chained:
  - PR 1: routing/capabilities + Customer API/query/form + Customer management.
  - PR 2: Customer selector/quick-create + ConfirmSale regression.
  - PR 3: Sales History query/list/responsive + authorization scope.
  - PR 4: Sale detail + client-side PDF.
  - PR 5: cross-feature regression + documentation/evidence.
