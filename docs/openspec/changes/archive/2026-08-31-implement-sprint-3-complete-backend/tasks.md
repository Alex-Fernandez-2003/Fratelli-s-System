# Tasks

## Task 1: Revalidar la baseline local antes de modificar código

- [x] **Complete Task 1 — Revalidar la baseline local antes de modificar código**

- Objective:
  Confirmar la baseline canónica exigida por el change: branch, HEAD, working tree, commits locales, migrations, contracts y cambios no commiteados.
- Files or areas likely involved:
  Repositorio completo en modo read-only; solution backend; migrations; OpenSpec; generated API contract.
- Execution notes:
  Ejecutar únicamente inspección read-only inicialmente. Registrar branch actual, HEAD, `git status`, diff relevante y migration tip. Comparar contra las assumptions de estos artifacts. Si el local ya contiene una capability Sprint 3, marcarla REUSE/ALREADY_PRESENT y eliminar cualquier implementación duplicada prevista.
- Verification method:
  Baseline record con branch, HEAD, status, migration tip, lista de proyectos, endpoints/policies y divergencias respecto de estos artifacts.
- Dependencies:
  Ninguna.

## Task 2: Congelar el mapa local de contratos y foundations

- [x] **Complete Task 2 — Congelar el mapa local de contratos y foundations**

- Objective:
  Determinar exactamente qué contracts, entities, services, endpoints y policies se reutilizan o extienden en las 13 HU.
- Files or areas likely involved:
  Domain Operations/Attendance/Identity; Application contracts/interfaces; Infrastructure services/DbContext; API endpoint registration; test projects; runtime/generated OpenAPI contract.
- Execution notes:
  Mapear Production, Customer, Sale, Purchase, Expense, Attendance, ShiftAssignment, CashSession, CashClosing, Employee, Inventory y reports. Congelar rutas exactas antes de crear endpoints. Confirmar que `/attendance/me` o su equivalente no se duplica.
- Verification method:
  Matriz local `capability → existing → gap → planned extension → policy → tests`.
- Dependencies:
  Task 1.

## Task 3: Diseñar y probar la evolución de Production traceability

- [x] **Complete Task 3 — Diseñar y probar la evolución de Production traceability**

- Objective:
  [HU-008] Añadir únicamente los gaps locales necesarios para BatchCode único y Status COMPLETED preservando Production existentes.
- Files or areas likely involved:
  Production domain model, EF configuration, migration area, production contracts, Domain/Integration tests.
- Execution notes:
  RED → GREEN → TRIANGULATE → REFACTOR. BatchCode debe ser backend-generated, estable y único; histórico backfill determinístico. Status histórico = COMPLETED. No crear balance/stock por lote.
- Verification method:
  Tests de uniqueness/backfill, migration SQL review y comprobación de que Production histórica permanece intacta.
- Dependencies:
  Tasks 1, 2.

## Task 4: Diseñar y aplicar la evolución segura de Customer y Sale snapshot

- [x] **Complete Task 4 — Diseñar y aplicar la evolución segura de Customer y Sale snapshot**

- Objective:
  [HU-014][HU-015] Crear o extender el Customer canónico y añadir asociación/snapshot nullable en Sale sin romper Sales históricas.
- Files or areas likely involved:
  Customer/Sale domain model, EF configurations, ApplicationDbContext, migration area, Customer/Sale contracts, PostgreSQL integration tests.
- Execution notes:
  RED → GREEN → TRIANGULATE → REFACTOR. CI requerido/único; NIT optional/unique; trim seguro. Si existen Customers sin CI, usar staged migration sin datos ficticios. Sale customer fields deben ser nullable para history existente.
- Verification method:
  Migration applies to representative existing data; uniqueness tests; historical Sale rows remain readable.
- Dependencies:
  Task 2.

## Task 5: Evolucionar Employee y el modelo histórico de horarios

- [x] **Complete Task 5 — Evolucionar Employee y el modelo histórico de horarios**

- Objective:
  [HU-024][HU-031] Añadir HourlyRate y la persistencia mínima que garantice horarios configurables e historia estable.
- Files or areas likely involved:
  Employee, ShiftAssignment, schedule configuration domain/application model, EF configurations, migrations, tests.
- Execution notes:
  RED → GREEN → TRIANGULATE → REFACTOR. Backfill HourlyRate = 20.00. Seed/default schedule MORNING 08:00–12:00 y NIGHT 18:00–22:00, tolerance 10. Snapshot effective schedule en ShiftAssignment salvo que el local ya tenga una solución equivalente.
- Verification method:
  Migration tests, existing Employee backfill, existing ShiftAssignment backfill, schedule-change regression.
- Dependencies:
  Task 2.

## Task 6: Evolucionar CashSession, handover y CashClosing

- [x] **Complete Task 6 — Evolucionar CashSession, handover y CashClosing**

- Objective:
  [HU-026][HU-027][HU-028] Preparar el modelo mínimo de apertura, retiro/carry-forward y un único CashClosing por CashSession.
- Files or areas likely involved:
  CashSession, Shift/handover, CashClosing domain, EF configurations, migration area, PostgreSQL tests.
- Execution notes:
  RED → GREEN → TRIANGULATE → REFACTOR. No inventar dinero histórico. Agregar unique CashSession closing constraint. Mantener HandoverNote descriptivo y el dinero estructurado.
- Verification method:
  Review de migration SQL; uniqueness test; prueba de datos legacy; verificación de que no se crea una segunda CashSession/Shift subsystem.
- Dependencies:
  Task 2.

## Task 7: Implementar el historial y detalle de Production

- [x] **Complete Task 7 — Implementar el historial y detalle de Production**

- Objective:
  [HU-008] Exponer history/detail paginado desde Production/ProductionConsumption con filtros autorizados.
- Files or areas likely involved:
  Production application query/contracts, infrastructure projections, API read endpoints, authorization, tests.
- Execution notes:
  COCINA consulta todo el historial; ADMINISTRADOR/ENCARGADO/CONTADORA según matriz. Proyectar producto/unidad/responsable sin N+1. Nunca reconstruir consumo con ProductComposition actual.
- Verification method:
  Tests de roles, newest-first, filtros, pagination, detalle snapshot y GET sin InventoryMovement.
- Dependencies:
  Tasks 3, 2.

## Task 8: Implementar Customer search y lifecycle autorizado

- [x] **Complete Task 8 — Implementar Customer search y lifecycle autorizado**

- Objective:
  [HU-014] Proporcionar búsqueda paginada, detail, create, edit y active-state lifecycle con la matriz aprobada.
- Files or areas likely involved:
  Customer Application contracts/service, Infrastructure persistence/query, API endpoints/policies, tests.
- Execution notes:
  RED → GREEN → TRIANGULATE → REFACTOR. ADMIN/ENC manage status; MESERO create/read/edit sin status. Traducir unique violations al ProblemDetails local.
- Verification method:
  Tests de roles, duplicate CI/NIT, duplicate name permitido, multiple null NIT, inactive history visibility.
- Dependencies:
  Task 4.

## Task 9: Integrar Customer opcional en ConfirmSale

- [x] **Complete Task 9 — Integrar Customer opcional en ConfirmSale**

- Objective:
  [HU-014][HU-015] Extender aditivamente el flujo real ConfirmSale para validar Customer activo y capturar snapshot en la transacción existente.
- Files or areas likely involved:
  ConfirmSale request/DTO, Sale service/transaction, Customer lookup, Sale mapping, tests.
- Execution notes:
  Mantener Sale válida sin Customer. Customer inactivo debe rechazarse. No tocar la autoridad de total, Shift o Inventory. No crear mutation post-Sale de Customer.
- Verification method:
  Tests con/sin Customer, inactive Customer, snapshot inmutable después de edit y rollback transaccional.
- Dependencies:
  Tasks 4, 8.

## Task 10: Implementar el scope reutilizable de Sales history

- [x] **Complete Task 10 — Implementar el scope reutilizable de Sales history**

- Objective:
  [HU-015][HU-029] Centralizar la construcción del query autorizado de Sales para evitar divergencias entre history y report.
- Files or areas likely involved:
  Application authorization/query scope, Sale query infrastructure, role helpers/policies, tests.
- Execution notes:
  ADMIN/ENC/CONTADORA general; MESERO current assigned Shift únicamente; multi-role union. Aplicar scope antes de filtros/paginación/agregación.
- Verification method:
  Data-driven authorization/row-scope tests incluyendo MESERO+ENCARGADO.
- Dependencies:
  Tasks 2, 9.

## Task 11: Implementar Sales history y detail

- [x] **Complete Task 11 — Implementar Sales history y detail**

- Objective:
  [HU-015] Añadir list/detail de Sales confirmadas con snapshot de Customer e items históricos.
- Files or areas likely involved:
  Sale history contracts, query service, API endpoints, tests.
- Execution notes:
  Excluir Orders sin Sale. Exponer channels/payment reales. Mantener projection server-side y newest-first.
- Verification method:
  Tests de filtros, pagination, Sale-only semantics, items, customer snapshot, payment/channel y unauthorized shift escape.
- Dependencies:
  Task 10.

## Task 12: Completar Purchase history reutilizando HU-017/HU-018

- [x] **Complete Task 12 — Completar Purchase history reutilizando HU-017/HU-018**

- Objective:
  [HU-019] Extender únicamente lo necesario del read model de Purchase para filtros históricos y COCINA KITCHEN scope.
- Files or areas likely involved:
  Existing Purchase list/detail query, contracts, authorization/policies, tests.
- Execution notes:
  No nuevo receipt model. CONTADORA read-only. COCINA server-scoped a área real confirmada en Task 2. No modificar create/cancel/receive salvo regression.
- Verification method:
  Tests de roles, area escape, filters, receipt detail, pagination y ausencia de mutations en history endpoints.
- Dependencies:
  Task 2.

## Task 13: Implementar Expense history y aggregates filtrados

- [x] **Complete Task 13 — Implementar Expense history y aggregates filtrados**

- Objective:
  [HU-021] Añadir consulta histórica paginada y aggregates solo si encajan con el contrato final.
- Files or areas likely involved:
  Expense contracts/query service, infrastructure projection, API endpoint, tests.
- Execution notes:
  ADMIN/ENC/CONTADORA. Aggregates, si se incluyen, se calculan sobre todo el query filtrado antes de page slicing.
- Verification method:
  Tests de filtros, roles y comparación aggregate full-set vs page totals.
- Dependencies:
  Task 2.

## Task 14: Implementar configuración de horarios laborales

- [x] **Complete Task 14 — Implementar configuración de horarios laborales**

- Objective:
  [HU-024][HU-031] Exponer read/update de MORNING/NIGHT schedule y late tolerance para ADMIN/ENC.
- Files or areas likely involved:
  Schedule configuration contracts/service, persistence, API policies, tests.
- Execution notes:
  RED → GREEN → TRIANGULATE → REFACTOR. Validar start/end/tolerance. Cambios futuros solo afectan nuevas asignaciones, no snapshots históricos.
- Verification method:
  Authorization tests, validation tests y schedule historical stability regression.
- Dependencies:
  Task 5.

## Task 15: Centralizar cálculo de late, worked time y absence

- [x] **Complete Task 15 — Centralizar cálculo de late, worked time y absence**

- Objective:
  [HU-024][HU-031] Implementar primitives reutilizables para attendance derivation.
- Files or areas likely involved:
  Attendance Application logic, ShiftAssignment queries, business clock integration, tests.
- Execution notes:
  RED: 08:00, 08:10, 08:11, 18:10, 18:11; absence assigned/completed/no-checkin; no assignment; active shift; checked-in. GREEN mínimo; TRIANGULATE timezone/historical schedule; REFACTOR.
- Verification method:
  Unit/Application tests determinísticos usando clock controlado.
- Dependencies:
  Tasks 5, 14.

## Task 16: Preservar HU-023 sobre la foundation self-history

- [x] **Complete Task 16 — Preservar HU-023 sobre la foundation self-history**

- Objective:
  [HU-023] Revalidar y reutilizar el endpoint propio, incorporando solo campos comunes realmente necesarios.
- Files or areas likely involved:
  Existing attendance self endpoint/service/DTO, tests.
- Execution notes:
  No endpoint paralelo. Preservar own-only y comportamiento no-Employee actual. No ampliar a employeeId.
- Verification method:
  Regression tests self-only, no linked Employee y filters/pagination.
- Dependencies:
  Tasks 2, 15.

## Task 17: Implementar HU-024 administrative attendance

- [x] **Complete Task 17 — Implementar HU-024 administrative attendance**

- Objective:
  [HU-024] Exponer rows derivados y summaries generales/per-Employee incluyendo late/absence.
- Files or areas likely involved:
  Attendance admin contracts, query projections over ShiftAssignment/AttendanceRecord, API policy, tests.
- Execution notes:
  Query debe representar ausentes aunque no tengan AttendanceRecord. Aggregates sobre conjunto filtrado completo. CONTADORA read-only.
- Verification method:
  Integration/Application tests de present/open/closed/absent, period filters, summaries y authorization.
- Dependencies:
  Task 15.

## Task 18: Implementar payroll projection primitives

- [x] **Complete Task 18 — Implementar payroll projection primitives**

- Objective:
  [HU-031] Calcular worked hours y projected pay desde closed attendance y HourlyRate.
- Files or areas likely involved:
  Attendance/report application calculations, Employee projection, tests.
- Execution notes:
  RED → GREEN → TRIANGULATE → REFACTOR. Usar decimal. Probar 120m→40.00 y 90m→30.00. Sin bonos/deducciones/rate history.
- Verification method:
  Deterministic unit/application tests para minutos parciales, ausencia y records abiertos.
- Dependencies:
  Tasks 5, 15.

## Task 19: Extender apertura de CashSession sin romper HU-025

- [x] **Complete Task 19 — Extender apertura de CashSession sin romper HU-025**

- Objective:
  [SHARED][HU-026][HU-027] Capturar openingAmount y pettyCashOpeningAmount en la apertura real si todavía faltan localmente.
- Files or areas likely involved:
  Existing operational-day request/service/endpoint, CashSession model, tests.
- Execution notes:
  Mantener route/verb existente. Diseñar aditivamente según cliente Sprint 2 local; no cambiar contrato a una forma incompatible sin revisar consumo generado/frontend.
- Verification method:
  Existing HU-025 regression + tests de apertura con valores monetarios válidos y backend timestamp/BusinessDate.
- Dependencies:
  Tasks 1, 2, 6.

## Task 20: Estructurar el handover financiero MORNING→NIGHT

- [x] **Complete Task 20 — Estructurar el handover financiero MORNING→NIGHT**

- Objective:
  [SHARED][HU-026][HU-027] Registrar cashRemovedAmount y calcular/validar carried-forward cash sin crear nueva CashSession.
- Files or areas likely involved:
  Existing handover request/service, Shift/CashSession, cash-position calculator, tests.
- Execution notes:
  RED → GREEN → TRIANGULATE → REFACTOR para removal 0/parcial/total. No parsear Note. Mantener lifecycle HU-025.
- Verification method:
  Tests que una sesión continúa, removal queda persistido y carried-forward es backend-derived.
- Dependencies:
  Tasks 6, 19.

## Task 21: Crear un calculador autoritativo de posición de caja

- [x] **Complete Task 21 — Crear un calculador autoritativo de posición de caja**

- Objective:
  [HU-026][HU-027] Centralizar Sales/Expenses/payment/channel/removal/expected-cash para que preview y close compartan exactamente la misma lógica.
- Files or areas likely involved:
  Application cash calculation service/contract, Sale/Expense query infrastructure, tests.
- Execution notes:
  RED → GREEN → TRIANGULATE → REFACTOR. Separar payment y channel dimensions. Cash formula debe evitar double-count de carried-forward.
- Verification method:
  Tests CASH/QR/EXTERNAL, DIRECT/PEDIDOSYA, CashDrawer/PettyCash expenses, removal y reconciliation invariants.
- Dependencies:
  Tasks 19, 20.

## Task 22: Implementar HU-026 cash-closing preview

- [x] **Complete Task 22 — Implementar HU-026 cash-closing preview**

- Objective:
  [HU-026] Exponer el cálculo de cierre sin persistir ninguna entidad de cierre.
- Files or areas likely involved:
  Cash preview contract/service, API endpoint/policy, tests.
- Execution notes:
  ADMIN/ENC únicamente. Reutilizar Task 21. No aceptar totales calculados del frontend.
- Verification method:
  Dos previews consecutivos producen datos coherentes y zero CashClosing inserts; authorization y state validation cubiertos.
- Dependencies:
  Task 21.

## Task 23: Implementar HU-027 final close transaccional

- [x] **Complete Task 23 — Implementar HU-027 final close transaccional**

- Objective:
  [HU-027] Persistir exactamente un CashClosing y completar NIGHT/CashSession atómicamente.
- Files or areas likely involved:
  CashClosing command/service, DbContext transaction/locking, API endpoint, ProblemDetails mapping, integration tests.
- Execution notes:
  RED → GREEN → TRIANGULATE → REFACTOR. Lock CashSession, recalc within transaction, difference/observation validation, unique constraint. No cliente-supplied ExpectedCash/Difference.
- Verification method:
  PostgreSQL integration tests de exact/positive/negative difference, rollback, status transition y duplicate sequential close.
- Dependencies:
  Tasks 6, 21, 22.

## Task 24: Probar cierre concurrente en PostgreSQL real

- [x] **Complete Task 24 — Probar cierre concurrente en PostgreSQL real**

- Objective:
  [HU-027] Demostrar que dos cierres simultáneos no pueden crear dos snapshots.
- Files or areas likely involved:
  PostgreSQL/Testcontainers integration suite, closing transaction/constraint.
- Execution notes:
  No usar únicamente EF InMemory. Ejecutar dos operaciones reales contra una misma CashSession y verificar un winner/un conflict.
- Verification method:
  Test repetible con `COUNT(CashClosing for session) == 1`, CashSession CLOSED y NIGHT COMPLETED.
- Dependencies:
  Task 23.

## Task 25: Implementar HU-028 closing history

- [x] **Complete Task 25 — Implementar HU-028 closing history**

- Objective:
  [HU-028] Proporcionar list/detail paginados sobre snapshots inmutables.
- Files or areas likely involved:
  CashClosing query contracts/service, API endpoints/policy, tests.
- Execution notes:
  ADMIN/ENC/CONTADORA read-only. No recalcular history desde Sales actuales. Mostrar CashSession/BusinessDate, no “closing de un shift”.
- Verification method:
  Tests de authorization, ordering, filters si existen, snapshot stability y ausencia de update/delete.
- Dependencies:
  Task 23.

## Task 26: Implementar HU-029 Sales report reutilizando HU-015

- [x] **Complete Task 26 — Implementar HU-029 Sales report reutilizando HU-015**

- Objective:
  [HU-029] Añadir summary, payment/channel breakdown y BusinessDate time series sobre el mismo Sales authorization scope.
- Files or areas likely involved:
  Sales report contracts/query, shared Sale scope, API endpoint, tests.
- Execution notes:
  Server-side grouping. MESERO conserva current-shift restriction. No duplicar transactional history y no generar archivos.
- Verification method:
  Tests de aggregate totals, breakdown reconciliation, series, filters y scope parity HU-015/HU-029.
- Dependencies:
  Tasks 10, 11.

## Task 27: Implementar HU-030 Inventory report reutilizando InventorySummary

- [x] **Complete Task 27 — Implementar HU-030 Inventory report reutilizando InventorySummary**

- Objective:
  [HU-030] Proporcionar point-in-time inventory report sin duplicar stock semantics.
- Files or areas likely involved:
  Existing Inventory queries/summary, report projection/API, authorization, tests.
- Execution notes:
  ADMIN/ENC/COCINA/CONTADORA. Confirmar ProductType local. NEGATIVE es primary state pero subset lógico de low stock. No sumar cantidades incompatibles.
- Verification method:
  Tests normal, equal-min, below-min, negative, MinStock null positive/negative, filters y roles.
- Dependencies:
  Task 2.

## Task 28: Implementar HU-031 Attendance report

- [x] **Complete Task 28 — Implementar HU-031 Attendance report**

- Objective:
  [HU-031] Exponer general/own report con worked time, late, absence, HourlyRate y ProjectedPay.
- Files or areas likely involved:
  Attendance report contracts/query, shared attendance calculations, authorization, API endpoint, tests.
- Execution notes:
  General para ADMIN/ENC/CONTADORA; self-only para Employee-linked ordinary user. Reutilizar Tasks 15/18, no duplicar formulas.
- Verification method:
  Tests de general/own scope, cross-employee denial, period filters, aggregates y payroll arithmetic.
- Dependencies:
  Tasks 15, 17, 18.

## Task 29: Validar todas las migrations contra PostgreSQL

- [x] **Complete Task 29 — Validar todas las migrations contra PostgreSQL**

- Objective:
  [SHARED] Demostrar que la evolución de esquema preserva datos y constraints.
- Files or areas likely involved:
  EF migrations, migration tests/integration environment, database configuration.
- Execution notes:
  Inspeccionar SQL generado. Probar upgrade desde baseline representativa y clean database. No `EnsureCreated`. Verificar indexes/FKs/unique constraints y ausencia de destructive data loss.
- Verification method:
  Database update succeeds; backfills correct; historical row counts/identities preserved; constraints reject invalid writes.
- Dependencies:
  Tasks 3, 4, 5, 6.

## Task 30: Ejecutar la matriz de autorización Sprint 3

- [x] **Complete Task 30 — Ejecutar la matriz de autorización Sprint 3**

- Objective:
  [SHARED] Cubrir todos los endpoints nuevos/extendidos, anonymous behavior, forbidden roles, row-level scopes y multi-role union.
- Files or areas likely involved:
  Integration authorization tests, API policies, query scopes.
- Execution notes:
  Preferir data-driven tests donde encaje. Incluir MESERO+ENCARGADO, COCINA purchase scope, self attendance y CONTADORA read-only.
- Verification method:
  Matriz endpoint × role con responses esperadas y assertions sobre rows accesibles.
- Dependencies:
  Tasks 7–28 según endpoint.

## Task 31: Ejecutar la regresión completa de Sprint 1 y Sprint 2

- [x] **Complete Task 31 — Ejecutar la regresión completa de Sprint 1 y Sprint 2**

- Objective:
  [SHARED] Asegurar que Sprint 3 no rompe auth, products, composition, inventory, production, orders, sales, shortage, purchases, shifts ni attendance.
- Files or areas likely involved:
  Existing Domain/Application/Integration suites.
- Execution notes:
  Ejecutar los comandos reales descubiertos en Task 1. No borrar/debilitar/skip tests para obtener green. Cualquier falla no causada por el change debe documentarse separadamente.
- Verification method:
  Salidas reales de restore/build/test guardadas como evidencia de VERIFY; no inventar counts.
- Dependencies:
  Tasks 7–30.

## Task 32: Validar Release build y publicación backend

- [x] **Complete Task 32 — Validar Release build y publicación backend**

- Objective:
  [SHARED] Confirmar que el backend completo compila en la configuración de entrega usada por el repositorio.
- Files or areas likely involved:
  Backend solution/projects y build configuration.
- Execution notes:
  Usar comandos reales de la solución local; no asumir nombres si cambiaron. Ejecutar restore previo según workflow.
- Verification method:
  Restore + Release build/publish result real sin errores atribuibles al change.
- Dependencies:
  Tasks 29–31.

## Task 33: Regenerar y revisar runtime OpenAPI

- [x] **Complete Task 33 — Regenerar y revisar runtime OpenAPI**

- Objective:
  [SHARED] Congelar el contrato backend real después de que migrations, build y tests estén green.
- Files or areas likely involved:
  Development API host, OpenAPI runtime document, API endpoint metadata.
- Execution notes:
  Levantar la API usando el workflow real. Capturar OpenAPI runtime. Revisar que changes sean aditivos, policies/status/errors estén documentados y ninguna ruta/verb Sprint 1/2 desaparezca inesperadamente.
- Verification method:
  Diff OpenAPI revisado contra baseline; cualquier breaking change detiene el handoff.
- Dependencies:
  Tasks 29–32.

## Task 34: Regenerar el contrato TypeScript sin implementar UI

- [x] **Complete Task 34 — Regenerar el contrato TypeScript sin implementar UI**

- Objective:
  [SHARED] Sincronizar el cliente generado con el OpenAPI runtime final.
- Files or areas likely involved:
  `frontend/src/types/api.generated.ts` o ruta local equivalente, frontend package scripts.
- Execution notes:
  Usar package manager y script reales detectados localmente. No editar output manualmente. No implementar páginas/componentes Sprint 3.
- Verification method:
  Generated diff corresponde a OpenAPI; regeneración repetida es estable; no existen hand edits.
- Dependencies:
  Task 33.

## Task 35: Ejecutar los quality gates frontend requeridos por el contrato generado

- [x] **Complete Task 35 — Ejecutar los quality gates frontend requeridos por el contrato generado**

- Objective:
  [SHARED] Confirmar que la ampliación aditiva del API no rompe el frontend existente.
- Files or areas likely involved:
  Frontend generated contract y consumidores Sprint 1/2.
- Execution notes:
  Ejecutar únicamente scripts reales de format/check, typecheck, lint, tests y build que existan localmente. Ajustes manuales solo si el nuevo generated contract provoca una incompatibilidad directa.
- Verification method:
  Resultados reales de los quality gates; cualquier adaptación manual queda limitada y explicada.
- Dependencies:
  Task 34.

## Task 36: Sincronizar documentación backend por HU

- [x] **Complete Task 36 — Sincronizar documentación backend por HU**

- Objective:
  [SHARED] Actualizar las 13 HU individualmente con el backend realmente implementado y evidencia técnica real.
- Files or areas likely involved:
  `docs/historias` o ubicación local equivalente; Sprint docs; OpenSpec handoff.
- Execution notes:
  Para cada HU documentar Resultado, Reglas, Seguridad, Backend/Contrato, Baseline, Evidencia técnica, Manifest y Estado. No marcar frontend complete. Shared files pueden figurar en varios manifests con responsabilidad explícita.
- Verification method:
  Cada una de las 13 HU tiene manifest específico y solo evidencia realmente obtenida.
- Dependencies:
  Tasks 31–35.

## Task 37: Ejecutar la auditoría final de scope y compatibilidad

- [x] **Complete Task 37 — Ejecutar la auditoría final de scope y compatibilidad**

- Objective:
  [SHARED] Confirmar que el change implementado coincide con estos artifacts y no incorpora feature creep.
- Files or areas likely involved:
  Full scoped diff, migrations, OpenAPI, generated TS, tests y HU docs.
- Execution notes:
  Verificar explícitamente: no stock por lotes, no files backend, no full payroll, no hardware signature, no report persistence, no rutas removidas, no verbs cambiados, no frontend Sprint 3 productivo.
- Verification method:
  Checklist Definition of Done por las 13 HU + diff scope review + OpenAPI compatibility review.
- Dependencies:
  Tasks 29–36.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 3,500–6,500 LoC incluyendo Domain/Application/Infrastructure/API, migrations y nueva cobertura automatizada. El rango debe recalibrarse después de Task 1 porque el working tree local puede contener parte de las foundations previstas.
- Risk of exceeding 400 LoC review threshold:
  Cierto/alto. El scope de 13 HU no es razonablemente revisable como un único PR monolítico.
- Recommendation:
  Chained PRs bajo UN solo OpenSpec change.
- Suggested split if chained:
  - PR 1: Production traceability + Customer/Sale snapshot foundations y migrations.
  - PR 2: HU-008/HU-014/HU-015/HU-019/HU-021 histories y autorización.
  - PR 3: Work schedules + ShiftAssignment snapshots + HourlyRate + attendance derivation.
  - PR 4: HU-023/HU-024/HU-031 attendance/reporting.
  - PR 5: CashSession opening + structured handover + cash calculator.
  - PR 6: HU-026/HU-027/HU-028 preview/closing/history + PostgreSQL concurrency.
  - PR 7: HU-029/HU-030 report projections.
  - PR 8: migration validation, full regression, runtime OpenAPI, generated TypeScript y per-HU documentation/handoff.
    Cada PR debe mantener build/test coherentes y no debe superar el límite de review mediante mega-tasks ocultas.
