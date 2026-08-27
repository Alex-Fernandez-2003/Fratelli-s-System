# Tasks

## Task 1: Auditar develop local y congelar la baseline física

- [x] Task 1: Auditar develop local y congelar la baseline física

- Objective:
  Establecer la estructura real sobre la que se implementará Inventory + Expenses y resolver únicamente las ramas técnicas condicionadas por el repositorio.
- Files or areas likely involved:
  Solución backend completa, Domain, Application, Infrastructure, Api, migrations, snapshot, tests, Product, Identity/User/Employee, Orders/Kitchen, Shift y documentación relevante.
- Execution notes:
  Registrar HEAD y status sin mutar Git. Ejecutar/inspeccionar la lista real de migrations. Confirmar si Inventory/Expenses/Shift ya tienen implementación parcial. Confirmar PostgreSQL fixture, paging, ProblemDetails, policy y clock conventions. No confiar en las vistas públicas cacheadas.
- Verification method:
  Preflight escrito/interno con commit exacto, migration baseline, entidades existentes, test infrastructure y decisiones técnicas de adaptación.
- Dependencies:
  None.

## Task 2: Modelar Inventory sin duplicar catálogo

- [x] Task 2: Modelar Inventory sin duplicar catálogo

- Objective:
  Materializar o adaptar InventoryBalance, InventoryMovement, movement types y referencia manual respetando Product/Unit existentes.
- Files or areas likely involved:
  Domain Inventory, EF model/configuration.
- Execution notes:
  Quantity numeric(14,4); saldo negativo permitido; ProductId único; ledger inmutable; movement types contractuales completos. No Product backfill de balances y no cambio de MinStock.
- Verification method:
  Model/domain tests y revisión del EF model confirman constraints, FK y ausencia de `quantity >= 0`.
- Dependencies:
  Task 1.

## Task 3: Implementar el write boundary transaccional y reusable de Inventory

- [x] Task 3: Implementar el write boundary transaccional y reusable de Inventory

- Objective:
  Garantizar una única operación atómica ledger+balance usable por HU-005 y futuras capabilities.
- Files or areas likely involved:
  Application Inventory y Infrastructure transactional persistence.
- Execution notes:
  Separar manual use case del internal writer. Manual permite solo ENTRY/WRITE_OFF, quantity positiva y reason requerido; backend deriva delta y MANUAL/null. Implementar first-balance upsert + row lock + authoritative reload. Revalidar Product activo antes de commit.
- Verification method:
  Tests Application para validación y PostgreSQL integration para movement+balance atomicity.
- Dependencies:
  Task 2.

## Task 4: Implementar balances, zero implicit balance y low-stock

- [x] Task 4: Implementar balances, zero implicit balance y low-stock

- Objective:
  Exponer la vista actual de existencias para todos los Products relevantes sin exigir materialización previa.
- Files or areas likely involved:
  Application read models/queries, Infrastructure EF projection.
- Execution notes:
  Product LEFT JOIN Balance. Default active=true. page/pageSize/search/productType. Reusar Product.InventoryUnit. Derivar minStock/isLowStock; no persistir IsLowStock.
- Verification method:
  Integration tests de zero balance, negative balance, active/inactive, pagination/search/productType y los cinco casos low-stock.
- Dependencies:
  Tasks 2, 3.

## Task 5: Implementar historial de movimientos

- [x] Task 5: Implementar historial de movimientos

- Objective:
  Proporcionar ledger consultable y auditable exclusivamente a ADMINISTRADOR/ENCARGADO.
- Files or areas likely involved:
  Inventory Application query/DTO e Infrastructure projection.
- Execution notes:
  page/pageSize/productId/movementType/from/to. Newest-first. No Product active filter. Resolver actor display de forma segura. Mantener origin/reference.
- Verification method:
  Tests de filtros, date range, ordering, inactive Product, actor y reference.
- Dependencies:
  Tasks 2, 3.

## Task 6: Mapear Inventory REST, policies y ProblemDetails

- [x] Task 6: Mapear Inventory REST, policies y ProblemDetails

- Objective:
  Exponer exactamente las tres operaciones públicas de Inventory con matriz de roles congelada.
- Files or areas likely involved:
  Api endpoint mappings, authorization policies, OpenAPI metadata.
- Execution notes:
  GET balances: cinco roles de lectura. GET movements y POST movements: ADMIN/ENCARGADO. No update/delete endpoints. Mapear Product missing/inactive y validation sin filtrar errores DB.
- Verification method:
  Authorization matrix completa + inspección runtime de routes/status codes.
- Dependencies:
  Tasks 3, 4, 5.

## Task 7: Probar concurrencia Inventory con PostgreSQL real

- [x] Task 7: Probar concurrencia Inventory con PostgreSQL real

- Objective:
  Demostrar ausencia de lost updates y carrera correcta de primera materialización.
- Files or areas likely involved:
  PostgreSQL IntegrationTests y fixtures actuales.
- Execution notes:
  Ejecutar first-balance race, ENTRY+ENTRY, ENTRY+WRITE_OFF y WRITE_OFF+WRITE_OFF. No EF InMemory/SQLite como evidencia. No production test hooks.
- Verification method:
  Cada escenario deja una sola balance row, todos los movements esperados y saldo algebraicamente exacto; tests repetibles sin deadlock normal.
- Dependencies:
  Tasks 3, 6.

## Task 8: Modelar Expenses y ExpenseCategory

- [x] Task 8: Modelar Expenses y ExpenseCategory

- Objective:
  Materializar o adaptar el modelo HU-020 sin adelantar HU-021 ni caja.
- Files or areas likely involved:
  Domain Expenses, EF model/configuration.
- Execution notes:
  ExpenseCategory active/name/CreatedAt. Expense con amount, CashSource, description, expenseDate, nullable category, nullable Shift strategy, audit. No status/cash balance. No category seeds inventados.
- Verification method:
  Model review y tests de enum/shape/constraints.
- Dependencies:
  Task 1.

## Task 9: Resolver business date y Shift strategy

- [x] Task 9: Resolver business date y Shift strategy

- Objective:
  Determinar server-side la fecha válida y asociación Shift sin depender del cliente.
- Files or areas likely involved:
  Application time abstraction existente o mínima nueva, Shift resolver si ya existe, Expense Application.
- Execution notes:
  Reusar clock/timezone actual. Si no existe, introducir business-date provider explícito; documentar timezone utilizada. Si Shift lifecycle/resolver existe, usarlo; de lo contrario null. Request nunca contiene ShiftId.
- Verification method:
  Tests hoy/pasado/futuro y tests de la rama Shift realmente usada.
- Dependencies:
  Tasks 1, 8.

## Task 10: Implementar registro de Expense y categorías activas

- [x] Task 10: Implementar registro de Expense y categorías activas

- Objective:
  Entregar POST Expense y GET ExpenseCategories sin HU-021 ni side effects de caja.
- Files or areas likely involved:
  Expenses Application/Infrastructure/Api.
- Execution notes:
  Validate amount, CashSource, description, category y date. Actor backend. Categories active Name ASC. POST retorna 201 DTO. No GET Expenses, update, delete o cash mutation.
- Verification method:
  Expense/category test matrix completa y verificación explícita de ausencia de rutas fuera de scope.
- Dependencies:
  Tasks 8, 9.

## Task 11: Crear y validar la migration coherente del change

- [x] Task 11: Crear y validar la migration coherente del change

- Objective:
  Persistir únicamente el schema realmente faltante de Inventory/Expenses sobre la baseline actual.
- Files or areas likely involved:
  EF migration y model snapshot.
- Execution notes:
  Crear una nueva migration después de estabilizar ambos modelos. No editar migrations antiguas. No fake Shift. Incluir checks/FKs/indexes justificados. No seeds arbitrarios.
- Verification method:
  Full migration chain PASS en PostgreSQL descartable limpio; migration desde baseline actual PASS; schema, precisiones, checks, indexes, FKs y snapshot inspeccionados.
- Dependencies:
  Tasks 2, 8, 9.

## Task 12: Completar tests de validación, DB constraints y scope boundaries

- [x] Task 12: Completar tests de validación, DB constraints y scope boundaries

- Objective:
  Demostrar las reglas negativas y los límites explícitos del change.
- Files or areas likely involved:
  Domain/Application/Integration tests.
- Execution notes:
  Inventory: invalid types/quantity/reason/Product/constraints. Expenses: auth, amount, dates, sources, description, categories, actor, duplicate POST. Probar que Expense no crea InventoryMovement/CashSession y que Inventory manual API no expone tipos futuros.
- Verification method:
  Todos los escenarios congelados tienen tests ejecutables y pasan.
- Dependencies:
  Tasks 6, 7, 10, 11.

## Task 13: Cerrar OpenAPI del backend

- [x] Task 13: Cerrar OpenAPI del backend

- Objective:
  Dejar el contrato listo para el futuro frontend sin generar TypeScript.
- Files or areas likely involved:
  Api endpoint metadata/OpenAPI.
- Execution notes:
  Verificar requests/responses/enums/paging/security/ProblemDetails de los cinco endpoints. No ejecutar pnpm ni modificar frontend.
- Verification method:
  `/openapi/v1.json` y Swagger describen exactamente las capabilities implementadas.
- Dependencies:
  Tasks 6, 10, 11, 12.

## Task 14: Ejecutar regresión backend y security review

- [x] Task 14: Ejecutar regresión backend y security review

- Objective:
  Asegurar compatibilidad con todo Sprint 1 integrado.
- Files or areas likely involved:
  Toda la solución backend/tests.
- Execution notes:
  Descubrir y ejecutar todos los test projects reales. Corregir compile/EF/Npgsql/DI/query/test defects normales hasta failed=0. Verificar Auth, Catalog, Users, Suppliers, Attendance, Orders/Kitchen. Completar security checklist.
- Verification method:
  Restore/build/tests PASS; failed=0; security review sin actor/reference/shift/signed-delta spoofing ni secretos.
- Dependencies:
  Task 13.

## Task 15: Actualizar HU-005 y HU-020 como backend-complete

- [x] Task 15: Actualizar HU-005 y HU-020 como backend-complete

- Objective:
  Registrar el comportamiento real implementado sin declarar full-stack completion.
- Files or areas likely involved:
  Historias HU-005/HU-020 y documentación OpenSpec/change.
- Execution notes:
  HU-005 debe documentar balances, movements, low-stock, negative stock, locking, concurrency, roles, tests. HU-020 debe documentar create, categories, Shift strategy real, validations, no cash mutation y HU-021 pendiente.
- Verification method:
  Cada afirmación documental corresponde al runtime/tests reales.
- Dependencies:
  Task 14.

## Task 16: Producir backend handoff y manifest completo

- [x] Task 16: Producir backend handoff y manifest completo

- Objective:
  Dejar al posterior frontend change un contrato consumible y registrar todos los cambios reales.
- Files or areas likely involved:
  Backend handoff/convención equivalente, HU/OpenSpec docs.
- Execution notes:
  Tabla de endpoints con capability/method/route/roles/request/response/Application area/notes. Manifest agrupado por Domain/Application/Infrastructure/Migrations/Api/Tests/Docs. Frontend explícitamente `UNCHANGED`.
- Verification method:
  Todos los archivos versionados del diff aparecen una vez con propósito; todos los endpoints reales aparecen; ningún endpoint inventado.
- Dependencies:
  Task 15.

## Task 17: Cerrar Definition of Done honestamente

- [x] Task 17: Cerrar Definition of Done honestamente

- Objective:
  Determinar si el backend change puede finalizar sin confundirlo con frontend/HU full-stack.
- Files or areas likely involved:
  Change completo.
- Execution notes:
  Revisar todos los Acceptance Criteria, migration, concurrency, regression, security y docs. VERIFY/ARCHIVE permanecen fuera de esta fase. Los problemas técnicos normales se corrigen y retestan; no se convierten en blockers humanos.
- Verification method:
  Estados finales requeridos:
  - HU-005: `BACKEND COMPLETE / FRONTEND PENDING`
  - HU-020: `BACKEND COMPLETE / FRONTEND PENDING`
  - Frontend: `UNCHANGED`
  - backend tests: failed=0
  - build: PASS
- Dependencies:
  Task 16.

## Runtime Autonomy / Blocker Taxonomy

Durante la futura ejecución, NO detenerse por:

- C# compile failure;
- EF mapping issue;
- migration compile issue;
- Npgsql syntax/translation;
- `FOR UPDATE` implementation defect;
- upsert issue;
- deadlock/race detectado por tests;
- DateOnly conversion;
- timezone implementation detail;
- nullable Shift adaptation;
- ProblemDetails mapping;
- OpenAPI metadata;
- DI registration;
- test fixture;
- flaky concurrency test que pueda diagnosticarse;
- formatting/build warning normal.

Loop:

diagnose
→ fix
→ retest
→ continue

Solo blockers humanos:

- `PRODUCT_DECISION_REQUIRED`
- `SDD_CONTRADICTION`
- `SECURITY_CONFLICT`
- `DESTRUCTIVE_CHANGE_REQUIRED`
- `UNRECOVERABLE_RUNTIME_BLOCKER`

Ejemplos que NO son blockers humanos:

- una clase tiene otro nombre;
- Orders movió una configuration;
- migration snapshot difiere del GitHub cache;
- Shift está ausente;
- hay que escribir SQL PostgreSQL específico encapsulado;
- un integration test falla;
- OpenAPI necesita metadata adicional.

## Recommended OpenSpec Decomposition

Mantener un solo change con specs cohesionadas:

- `specs/inventory-balance/spec.md`
  - zero implicit balance;
  - balances;
  - low-stock.
- `specs/inventory-movements/spec.md`
  - ledger;
  - manual ENTRY/WRITE_OFF;
  - auth/history.
- `specs/inventory-concurrency/spec.md`
  - transaction;
  - first balance;
  - row locking;
  - reusable writer.
- `specs/expense-registration/spec.md`
  - create;
  - validation;
  - audit;
  - Shift;
  - no cash side effect.
- `specs/expense-categories/spec.md`
  - active read-only catalog.
- `specs/backend-delivery-contract/spec.md`
  - endpoints;
  - OpenAPI;
  - migration;
  - tests;
  - documentation.

No crear dos changes.

## Implementation Handoff

La futura sesión debe avanzar:

audit
→ Inventory model
→ reusable transactional writer
→ balances/history/low-stock
→ PostgreSQL concurrency
→ Expenses model
→ date/Shift resolution
→ Expense APIs
→ migration validation
→ OpenAPI
→ full regression
→ security
→ docs
→ final report

sin checkpoints humanos por fallos técnicos normales.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 2.500–4.500 LoC manuales entre Domain, Application, Infrastructure, API, PostgreSQL concurrency handling, tests y documentación, más el diff generado por migration/model snapshot.
- Risk of exceeding 400 LoC review threshold:
  Very High.
- Recommendation:
  Chained PRs
- Suggested split if chained:
  - PR 1: Inventory Domain/persistence + reusable transactional writer.
  - PR 2: Inventory balances/history/low-stock + API.
  - PR 3: Inventory PostgreSQL concurrency/constraint tests.
  - PR 4: Expenses Domain/persistence + business-date/Shift strategy.
  - PR 5: Expenses/category APIs + tests.
  - PR 6: migration/OpenAPI/full regression/security.
  - PR 7: HU documentation/backend handoff/final manifest.

  Todos los review slices pertenecen al único change:
  `implement-hu-005-020-inventory-and-expenses-backend`.
