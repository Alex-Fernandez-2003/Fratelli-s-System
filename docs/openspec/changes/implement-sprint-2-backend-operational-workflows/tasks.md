# Tasks

- [x] Task 1: Auditar el develop local completo

- Objective:
  Establecer la baseline canónica real y detectar qué parte de Sprint 2 ya existe.
- Files or areas likely involved:
  Git read-only, `backend/`, `frontend/` solo consumidores, `docs/`, migrations, OpenSpec.
- Execution notes:
  Registrar branch, HEAD, status y último commit. Inspeccionar Domain/Application/Infrastructure/Api, tests, migrations y OpenAPI. Clasificar cualquier foundation Sprint 2 como REUSE, EXTEND o ALREADY_SUPPORTED. No realizar Git mutations.
- Verification method:
  Baseline report con comandos/resultados reales y mapa de módulos presentes/ausentes.
- Dependencies:
  None.

- [x] Task 2: Auditar las ocho HU y documentación canónica

- Objective:
  Cerrar trazabilidad de RF/RN/RNF y detectar contradicciones actuales antes del diseño final.
- Files or areas likely involved:
  Product Backlog, SRS, requirements, reglas-negocio, modelo-datos, arquitectura, ADR, OpenSpec/handoffs, historias existentes.
- Execution notes:
  Revisar HU-004/006/007/012/013/017/018/025 y sus requisitos. Priorizar documentos current-state sobre historia antigua.
- Verification method:
  Matriz HU→RF/RN/RNF/dependencias/gaps con fuente exacta.
- Dependencies:
  Task 1.

- [x] Task 3: Inspeccionar visualmente Pantallas.zip

- Objective:
  Identificar necesidades contractuales futuras sin permitir que los mockups cambien reglas congeladas.
- Files or areas likely involved:
  `Pantallas.zip` y todas sus imágenes individuales.
- Execution notes:
  Inventariar N imágenes y abrir N/N. Registrar fields, actions, summaries, filters, states y relations; clasificar KEEP/ADAPT/OMIT/DEFER. No usar contact sheet como única evidencia.
- Verification method:
  Visual audit table N/N, sin elementos relevantes sin clasificación.
- Dependencies:
  None.

- [x] Task 4: Resolver la semántica de escalado de composición

- Objective:
  Obtener una fórmula inequívoca para convertir composición + cantidad final producida en consumos.
- Files or areas likely involved:
  HU-004/HU-007, ENT-02, SRS, RN-006/RN-028/RN-029, OpenSpec y referencias visuales.
- Execution notes:
  No implementar Production hasta resolver. Si una fuente local establece explícitamente la base de composición, documentarla. Si no existe, emitir `PRODUCT_DECISION_REQUIRED` con el dato exacto faltante.
- Verification method:
  Existe una regla matemática/semántica testable que permite calcular consumos para cualquier cantidad válida.
- Dependencies:
  Tasks 2, 3.

- [x] Task 5: Auditar y extender la única boundary de Inventory

- Objective:
  Preparar una primitive transaccional reusable para Production, Sale y PurchaseReceipt sin duplicar stock.
- Files or areas likely involved:
  Inventory Domain/Application/Infrastructure existentes.
- Execution notes:
  Auditar `IInventoryWriter`, first-balance behavior, row locks y current transactions. Diseñar batch mutation compatible con transaction externa, deterministic locks, shortage policies y refs. Mantener HU-005 manual behavior.
- Verification method:
  Tests existentes de Inventory siguen pasando y nuevos tests demuestran batch atomicity/lock semantics.
- Dependencies:
  Task 1.

- [x] Task 6: Consolidar la conversión de unidades

- Objective:
  Reutilizar el sistema Unit existente para todas las cantidades Sprint 2.
- Files or areas likely involved:
  Catalog Unit contracts/services y tests.
- Execution notes:
  Reutilizar o añadir una primitive pequeña para same-dimension FactorToBase conversion. No crear sistema de unidades paralelo ni package conversions.
- Verification method:
  Tests MASS kg↔g, VOLUME l↔ml, COUNT compatible e incompatible dimension.
- Dependencies:
  Tasks 1, 2.

- [x] Task 7: Implementar capability HU-004 Composition

- Objective:
  Materializar composición backend y su contrato estable.
- Files or areas likely involved:
  Domain Composition, Application contracts/service, EF configuration, Api endpoints, tests.
- Execution notes:
  Full-set GET/PUT preferido; validar parent/components, active state, duplicates, quantity, units, self-reference y cycles solo si el modelo real permite nesting. No stock mutation.
- Verification method:
  HU-004 domain/application/integration matrix PASS y OpenAPI expone composición.
- Dependencies:
  Tasks 4, 6.

- [x] Task 8: Implementar capability HU-006 Low Stock

- Objective:
  Completar configuración de MinStock y consulta server-side reutilizando Inventory actual.
- Files or areas likely involved:
  Catalog/Product mutation, Inventory query, Api, tests.
- Execution notes:
  Reutilizar `Product.MinStock` y `InventoryBalanceDto`. Añadir endpoint de configuración y, si es útil, filtro lowStock aditivo. No LowStockAlert table/jobs/SignalR.
- Verification method:
  Equality/negative/null/permissions tests PASS.
- Dependencies:
  Tasks 1, 5.

- [x] Task 9: Implementar persistencia y contratos HU-007 Production

- Objective:
  Crear Production/Consumption y read/calculation contracts.
- Files or areas likely involved:
  Domain Production, Application, Infrastructure mapping, Api.
- Execution notes:
  Persistir cantidad final, responsable/actor y consumption snapshot. Añadir requirements preview si el frontend futuro lo necesita. No inventory write todavía fuera de la transaction service.
- Verification method:
  Persistence mappings y contract tests PASS.
- Dependencies:
  Tasks 4, 6, 7.

- [x] Task 10: Implementar transaction de Production

- Objective:
  Consumir ingredientes y producir stock de manera atómica y concurrency-safe.
- Files or areas likely involved:
  Production Application service + Inventory boundary + PostgreSQL integration tests.
- Execution notes:
  Calcular requisitos, lock balances sorted, revalidar, hard-block shortage, crear Production/Consumption/movements/balances en una transaction.
- Verification method:
  Success, shortage zero-side-effects, repeated production y concurrency tests PostgreSQL PASS.
- Dependencies:
  Tasks 5, 9.

- [x] Task 11: Implementar foundation HU-025 CashSession/Shift

- Objective:
  Establecer el contexto operativo que necesitará Sale.
- Files or areas likely involved:
  Domain Shift/CashSession/Assignment, Application, Infrastructure, Api, tests.
- Execution notes:
  Reusar cualquier partial foundation local. Una CashSession por business date; dos fixed shift types; no arbitrary shift CRUD; `America/La_Paz`; assignments con Employee.
- Verification method:
  Unique business date, two-shift creation/state y authorization tests PASS.
- Dependencies:
  Tasks 1, 2.

- [x] Task 12: Implementar resolver y handover de Shift

- Objective:
  Completar continuidad operacional sin entrar a cierre de caja.
- Files or areas likely involved:
  Shift Application service, API, PostgreSQL transaction tests.
- Execution notes:
  Resolver active Shift, own MESERO context, assignment management y handover source→destination. Lock CashSession then shifts. No CashClosing.
- Verification method:
  Valid/invalid/concurrent handover tests PASS; exactly one active Shift under approved rules.
- Dependencies:
  Task 11.

- [x] Task 13: Evolucionar Expense hacia Shift de forma compatible

- Objective:
  Preparar HU-020 para futura caja/turnos sin romper Sprint 1.
- Files or areas likely involved:
  Expense entity/configuration/service/migration/API internals.
- Execution notes:
  Añadir nullable ShiftId si sigue ausente; server-resolve active Shift para new Expense cuando corresponda. No añadir required ShiftId al frontend request.
- Verification method:
  Existing Expense integration tests PASS; historical null works; new Expense association test PASS.
- Dependencies:
  Tasks 11, 12.

- [x] Task 14: Implementar persistencia y contrato HU-012 Sale

- Objective:
  Crear Sale/SaleItem sobre Order snapshots y Shift real.
- Files or areas likely involved:
  Domain Sales, Application contracts, EF mappings, API, tests.
- Execution notes:
  No Customer. `OrderId` unique. Server totals. SalesChannel/PaymentMethod current enums. Sale.ShiftId required.
- Verification method:
  Schema/contract tests demuestran one Sale per Order y financial snapshots.
- Dependencies:
  Tasks 11, 12.

- [x] Task 15: Implementar transaction de Sale

- Objective:
  Confirmar exclusivamente Order ENTREGADO, asociar Shift y afectar Inventory atómicamente.
- Files or areas likely involved:
  Sales Application service, Orders read/lock integration, Inventory boundary, integration tests.
- Execution notes:
  Lock operational Shift/Order, revalidate status/duplicate, derive SaleItems, calculate totals, lock inventory, create movements, commit. PREPARATION se descuenta como Product, sin recipe expansion.
- Verification method:
  ENTREGADO success; other states 409; duplicate race one success; totals and movement refs correct.
- Dependencies:
  Tasks 5, 12, 14.

- [x] Task 16: Implementar HU-013 shortage acknowledgment

- Objective:
  Permitir negative stock en Sale solo mediante decisión explícita y recálculo backend.
- Files or areas likely involved:
  Sales request/error contracts, inventory shortage calculation, API/OpenAPI, tests.
- Execution notes:
  First shortage attempt returns typed ProblemDetails and zero writes. Ack retry recalculates under locks and may commit negative balances. Never trust client shortage details.
- Verification method:
  No-ack/ack/race tests PASS; OpenAPI documents structured 409.
- Dependencies:
  Task 15.

- [x] Task 17: Implementar persistencia y lifecycle HU-017 Purchase

- Objective:
  Registrar Purchase multilínea PENDIENTE sin inventario.
- Files or areas likely involved:
  Domain Purchases, Application, EF mappings, Api, tests.
- Execution notes:
  One Supplier, N lines, server total, Product/Unit validation, actor-scope validation, Cocina receiptReference. No client-authoritative PurchaseArea.
- Verification method:
  Multiline, scope, total, no-inventory, authorization tests PASS.
- Dependencies:
  Tasks 1, 6.

- [x] Task 18: Implementar cancelación y queries operativas de Purchase

- Objective:
  Soportar HU-017 lifecycle y las consultas mínimas que HU-018 requiere.
- Files or areas likely involved:
  Purchase Application/API/tests.
- Execution notes:
  Cancel only PENDIENTE with reason. Expose detail and pending paged lookup as needed. No HU-019 reporting/search expansion.
- Verification method:
  Cancel/state/query authorization tests PASS.
- Dependencies:
  Task 17.

- [x] Task 19: Implementar snapshot de recepción HU-018

- Objective:
  Preservar ordered quantity y actual received quantity por línea.
- Files or areas likely involved:
  PurchaseReceipt/PurchaseReceiptLine domain, EF config, contracts, migration.
- Execution notes:
  Reuse an equivalent local representation if already present; otherwise introduce definitive receipt line snapshot. No partial receipt status.
- Verification method:
  Ordered and received values remain independently queryable; schema constraints PASS.
- Dependencies:
  Task 17.

- [x] Task 20: Implementar transaction de Purchase Reception

- Objective:
  Recibir Purchase una sola vez e incrementar Inventory con cantidades reales.
- Files or areas likely involved:
  Purchase Application service, Inventory boundary, PostgreSQL tests.
- Execution notes:
  Lock Purchase, validate all lines, convert actual quantities, insert receipt, Inventory movements, balances and state in one transaction. No-accept remains pending.
- Verification method:
  Actual quantities, incomplete request, double receive, cancel-vs-receive, rollback and concurrency tests PASS.
- Dependencies:
  Tasks 5, 18, 19.

- [x] Task 21: Crear la migration Sprint 2 coherente

- Objective:
  Materializar solo el schema faltante y evoluciones aditivas.
- Files or areas likely involved:
  EF migration, model snapshot, entity configurations.
- Execution notes:
  No editar migrations históricas. Incluir constraints/indexes/FKs/checks. Validar historical null strategy para Expense/Order.
- Verification method:
  Full migration chain aplica en PostgreSQL disposable limpia y model snapshot queda consistente.
- Dependencies:
  Tasks 7-20.

- [x] Task 22: Completar concurrency suite cross-HU

- Objective:
  Demostrar que las operaciones transaccionales compartidas no producen estados imposibles.
- Files or areas likely involved:
  IntegrationTests/PostgreSQL fixture.
- Execution notes:
  Cubrir Production vs Production, Production vs Sale, two Sales, Sale vs handover, receive vs cancel, double receive, concurrent handover. No matriz cartesiana innecesaria.
- Verification method:
  Exact final balances/states y zero partial writes en todos los escenarios seleccionados.
- Dependencies:
  Tasks 10, 12, 16, 20, 21.

- [x] Task 23: Auditar authorization endpoint por endpoint

- Objective:
  Verificar que las ocho HU están protegidas server-side y multi-role funciona por unión.
- Files or areas likely involved:
  API policies/authorization registrations, integration tests.
- Execution notes:
  Construir matriz ADMIN/ENCARGADO/MESERO/COCINA/CONTADORA/EMPLEADO. Probar Purchase line scope además de role. No confiar en futuro frontend.
- Verification method:
  Allowed→2xx, role-denied→403, anonymous→401 para endpoints críticos.
- Dependencies:
  Tasks 8-20.

- [x] Task 24: Completar ProblemDetails y OpenAPI

- Objective:
  Dejar contrato consumible y estable para los ocho futuros frontends.
- Files or areas likely involved:
  Api metadata, DTO schemas, ProblemDetails extensions, OpenAPI.
- Execution notes:
  Documentar requests/responses/status/enums/auth. Especialmente structured production/sale shortage. No generar TypeScript.
- Verification method:
  API arranca, `/openapi/v1.json` genera correctamente y contiene todos los Sprint 2 endpoints/schemas.
- Dependencies:
  Tasks 16, 20, 23.

- [x] Task 25: Ejecutar full backend regression

- Objective:
  Probar que Sprint 2 no rompió Sprint 1.
- Files or areas likely involved:
  Entire backend solution/test projects.
- Execution notes:
  Usar commands reales del repo. Actualmente esperados: restore, build, test. Resolver compile/test/EF/Npgsql issues normales hasta failed=0. Auditar warnings reales.
- Verification method:
  Restore PASS; build PASS; tests total/passed/failed/skipped reportado dinámicamente; failed=0.
- Dependencies:
  Tasks 21-24.

- [x] Task 26: Validar backward compatibility y frontend no modificado

- Objective:
  Asegurar que el backend-first contract es aditivo y listo para futuros frontends.
- Files or areas likely involved:
  OpenAPI diff, existing integration tests, frontend read-only diff inspection.
- Execution notes:
  Verificar no endpoints Sprint1 removidos, no required request changes accidentales, no generated TS changes. No tocar frontend.
- Verification method:
  Breaking contract list = none o lista explícita justificada; frontend source modified = no.
- Dependencies:
  Tasks 24, 25.

- [x] Task 27: Actualizar las ocho HU con evidencia backend real

- Objective:
  Registrar el backend implementado sin declarar frontend inexistente.
- Files or areas likely involved:
  Historia real o nueva según convention para HU-004/006/007/012/013/017/018/025.
- Execution notes:
  Usar estructura normalizada. Preservar `## Evidencias`. Registrar únicamente build/tests/migrations/OpenAPI realmente ejecutados. Manifest específico por HU, no copiar todo Sprint 2 indiscriminadamente.
- Verification method:
  Ocho historias terminan `BACKEND IMPLEMENTADO / FRONTEND PENDIENTE`; screenshots existentes preservados.
- Dependencies:
  Tasks 25, 26.

- [x] Task 28: Producir backend handoff contractual por HU

- Objective:
  Preparar la implementación frontend HU por HU sin redescubrir backend.
- Files or areas likely involved:
  OpenSpec/change docs o handoff conforme convención real.
- Execution notes:
  Para cada HU registrar endpoints, policies, request/response types, enums, errors, transactions, relevant dependencies y future frontend notes. Separar las ocho capabilities.
- Verification method:
  Cada endpoint OpenAPI Sprint 2 aparece en exactamente un capability map principal y el frontend puede identificar contrato sin leer implementación.
- Dependencies:
  Tasks 24, 27.

- [x] Task 29: Ejecutar revisión final de seguridad y trazabilidad

- Objective:
  Confirmar actor authority, inventory origin, Shift association y ausencia de scope creep.
- Files or areas likely involved:
  Services, API contracts, DB records, docs.
- Execution notes:
  Revisar actor spoofing, Shift spoofing, total spoofing, inventory delta spoofing, Purchase scope, refs, no raw DB error, no secrets, no fiscal/customer/signature fields.
- Verification method:
  Security checklist PASS y muestra references Production/Sale/Purchase para movimientos representativos.
- Dependencies:
  Tasks 25-28.

- [x] Task 30: Emitir reporte final único del Sprint 2 backend

- Objective:
  Cerrar todo el trabajo automatizable de este único change con un verdict honesto.
- Files or areas likely involved:
  Results from all tasks.
- Execution notes:
  Reportar baseline, ocho HU, reuse audit, inventory single-authority, transactions, concurrency, migrations, OpenAPI, quality, docs, frontend untouched, out-of-scope, files modified, Git mutation none, VERIFY/ARCHIVE not run.
- Verification method:
  Verdict solo puede ser `SPRINT_2_BACKEND_COMPLETE_READY_FOR_FRONTEND` si todas las ocho HU backend y gates están completas; de lo contrario usar hard blocker exacto.
- Dependencies:
  Tasks 27-29.

## Runtime Autonomy / Blocker Taxonomy

Future APPLY MUST NOT detenerse por:

- C# compile error;
- nullable warning nuevo resoluble;
- EF mapping issue;
- migration compile error;
- Npgsql syntax;
- row-lock implementation;
- DI wiring;
- test failure;
- fixture issue;
- ProblemDetails mapping;
- enum serialization;
- OpenAPI metadata issue;
- transaction bug;
- deadlock descubierto por test;
- race discovered by test;
- formatting;
- ordinary warning;
- service split/naming decision.

Loop:

diagnose
→ fix
→ retest
→ continue

Only hard blockers:

- `PRODUCT_DECISION_REQUIRED`
- `SDD_CONTRADICTION`
- `SECURITY_CONFLICT`
- `DESTRUCTIVE_CHANGE_REQUIRED`
- `BASELINE_CONTRACT_BLOCKER`
- `UNRECOVERABLE_RUNTIME_BLOCKER`

Known current candidate:

`PRODUCT_DECISION_REQUIRED`
→ composition scaling denominator, unless local explore resolves it from a stronger/current source.

Missing visual package access:
→ `further explore` before final SDD freeze, not permission to invent screenshot-driven contracts.

## Expected Final Report

The future APPLY report MUST include:

- Verdict.
- Branch/HEAD/status.
- Git mutations: NONE.
- Eight-HU status.
- Reuse audit:
  - Inventory;
  - Unit system;
  - Orders;
  - Suppliers;
  - Expenses;
  - Shift foundation.
- HU-004:
  - Composition;
  - scaling rule used;
  - contracts;
  - tests.
- HU-006:
  - minimum stock;
  - derived low state;
  - tests.
- HU-007:
  - hard shortage BLOCK;
  - atomic inventory;
  - traceability;
  - tests.
- HU-012:
  - Order required;
  - ENTREGADO required;
  - server totals;
  - Shift;
  - tests.
- HU-013:
  - backend shortage authority;
  - explicit override;
  - negative stock;
  - tests.
- HU-017:
  - one Supplier;
  - multiline;
  - existing Products;
  - cancellation reason;
  - no stock on create;
  - tests.
- HU-018:
  - actual received quantities;
  - no partial structured reception;
  - atomic inventory;
  - tests.
- HU-025:
  - two Shifts;
  - shared CashSession;
  - handover;
  - Sale/Expense relation;
  - no closing;
  - tests.
- Inventory:
  - single authority YES;
  - parallel engine NO;
  - Production/Sale/Purchase refs YES.
- Transactions:
  - Production ATOMIC;
  - Sale ATOMIC;
  - PurchaseReception ATOMIC;
  - Shift handover ATOMIC.
- Concurrency.
- Migration result.
- OpenAPI result.
- Restore/build/tests actual numbers.
- Frontend:
  - Sprint 2 implementation NOT STARTED;
  - frontend source modified NO.
- Eight HU docs:
  - BACKEND IMPLEMENTADO / FRONTEND PENDIENTE.
- No fabricated evidence.
- Explicit out-of-scope confirmation.
- Complete modified-file manifest.
- VERIFY NOT RUN.
- ARCHIVE NOT RUN.
- Final:
  - `OPENAPI_READY_FOR_FRONTEND=YES`
  - `READY_TO_IMPLEMENT_FRONTEND_HU_BY_HU=YES`.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 7,000–13,000 LoC incluyendo Domain/Application/Infrastructure/API, migration, PostgreSQL integration tests y ocho HU/documentación. El rango debe recalcularse tras auditar cuánto del modelo Sprint 2 ya está materializado en el `develop` local.
- Risk of exceeding 400 LoC review threshold:
  Certain / Very High.
- Recommendation:
  Chained PRs
- Suggested split if chained:
  Aunque el trabajo pertenece a un único OpenSpec change y el agente no realizará Git/PR mutations, los review slices recomendados son:
  - Slice 1: inventory batch boundary + unit conversion + Composition.
  - Slice 2: Low Stock + Production.
  - Slice 3: Shift/CashSession foundation + Expense compatibility.
  - Slice 4: Sale + Sale shortage override.
  - Slice 5: Purchase creation/cancellation.
  - Slice 6: Purchase receipt + inventory integration.
  - Slice 7: cross-HU concurrency + migrations + OpenAPI.
  - Slice 8: full regression + HU docs + backend handoff.

  Los slices son únicamente unidades de revisión. No autorizan crear varios OpenSpec changes ni realizar operaciones Git.
