# Tasks

- [x] Task 1: Revalidar la baseline local y clasificar cada finding

- Objective:
  Establecer el `develop` local real antes de tocar código y determinar exactamente qué bugs aprobados siguen presentes.
- Files or areas likely involved:
  Repositorio completo en modo read-only; Git metadata; Sprint 2 backend; OpenSpec previo; generated TypeScript; HU-004/HU-007/HU-017 frontend local.
- Execution notes:
  Registrar `git branch --show-current`, `git rev-parse HEAD`, `git status --short` y último commit. Revisar los siete bugs aprobados contra el código local. Marcar cada uno `PRESENT` o `ALREADY_RESOLVED_IN_BASELINE`. Auditar las rutas/features frontend locales porque la baseline remota observada no demuestra las integraciones HU-004/HU-007/HU-017 descritas por el usuario. No modificar nada durante esta clasificación.
- Verification method:
  Existe un baseline report con branch, exact HEAD, working-tree status, estado de los siete findings y ubicación real de los tres consumidores frontend protegidos.
- Dependencies:
  None.

- [x] Task 2: Capturar el estado técnico previo sin inventar evidencia

- Objective:
  Obtener una referencia reproducible de build/tests/contrato antes de aplicar correcciones.
- Files or areas likely involved:
  Backend solution, backend tests, runtime OpenAPI cuando esté disponible, `frontend/src/types/api.generated.ts`, `frontend/package.json`.
- Execution notes:
  Auditar comandos reales antes de ejecutarlos. En la baseline publicada se esperan `dotnet restore/build/test` para la solution y scripts frontend `api:generate`, `format:check`, `typecheck`, `lint`, `test`, `build`, pero el checkout local manda. Registrar fallos existentes sin atribuirlos todavía al change.
- Verification method:
  Informe baseline con comandos efectivamente ejecutados y resultados reales, o motivo explícito si un gate no pudo ejecutarse. Sin counts inventados.
- Dependencies:
  Task 1.

- [x] Task 3: Corregir la validación de UnitIds compartida por Composition y Purchase create

- Objective:
  Permitir que múltiples líneas válidas compartan una misma Unit sin debilitar existencia, actividad ni compatibilidad dimensional.
- Files or areas likely involved:
  `OperationsService` o área real equivalente; integration tests de operations/contracts.
- Execution notes:
  Para cada flujo PRESENT, derivar UnitIds distintos, cargar Units válidas una vez y comparar cantidad cargada contra cantidad de IDs distintos solicitados. Mantener validación por línea contra `InventoryUnit`, dimensión y factores. Extraer un helper pequeño solo si evita duplicar exactamente el mismo error; no crear framework genérico. No cambiar request/response/endpoints.
- Verification method:
  Tests demuestran Composition y Purchase con varias líneas usando el mismo UnitId; Unit inexistente e incompatible continúan fallando; HU-004/HU-017 contracts permanecen idénticos.
- Dependencies:
  Tasks 1, 2.

- [x] Task 4: Congelar mediante regresión la semántica QuantityPerOutputUnit de HU-007

- Objective:
  Proteger el comportamiento ya correcto de Production mientras se corrige Composition.
- Files or areas likely involved:
  Tests de Operations/Production; no cambio productivo esperado salvo que la baseline local contradiga el comportamiento aprobado.
- Execution notes:
  Añadir/ajustar regresiones para `QuantityPerOutputUnit × QuantityProduced`, conversión kg/g y l/ml, shortage hard-block, rollback y output increment. No rediseñar Production. No modificar error mapping general de InventoryWriter dentro de esta task.
- Verification method:
  Tests prueban multiplicación exacta, conversiones, ausencia de partial writes y stock de output correcto.
- Dependencies:
  Task 3.

- [x] Task 5: Eliminar el fan-out concurrente de DbContext en Purchase listing

- Objective:
  Hacer `PurchasesAsync` EF-safe preservando paginación, filtros, ordering y semántica de DTO.
- Files or areas likely involved:
  `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs` o implementación local equivalente; Operations integration tests.
- Execution notes:
  Si el bug está PRESENT, sustituir `Task.WhenAll`/fan-out por una proyección EF Core o un pequeño conjunto de bulk queries secuenciales para Purchases, lines y receipt data. Mantener el orden de página. Evitar N+1 razonablemente. Si una proyección limpia resulta desproporcionada, usar `foreach + await` como fallback documentado, sin context factory ni paralelización.
- Verification method:
  Una prueba con múltiples Purchases, múltiples lines y receipt data devuelve la página completa sin `InvalidOperationException`; filtros/pagination metadata y ordering coinciden con contrato existente.
- Dependencies:
  Tasks 1, 2.

- [x] Task 6: Centralizar la resolución mínima del Current Shift

- Objective:
  Unificar `CurrentShift`, `MyCurrentShift`, Sale y Expense sobre la CashSession abierta del BusinessDate actual.
- Files or areas likely involved:
  Operations Infrastructure, Expense Infrastructure y una primitive estrecha de resolución si la arquitectura local la necesita.
- Execution notes:
  Implementar/reutilizar una query común: `clock.BusinessDate` → open CashSession actual → ACTIVE Shift dentro de esa sesión. Mantener una variante compatible con row locking para Sale si su transaction lo requiere. No cerrar automáticamente Shifts antiguos, no implementar cash closing y no modificar Shift lifecycle.
- Verification method:
  Todos los consumers usan la misma semántica current-day. Revisión de código demuestra ausencia de búsquedas globales ACTIVE en esos cuatro consumers.
- Dependencies:
  Tasks 1, 2.

- [x] Task 7: Añadir regresión cross-day de Shift

- Objective:
  Probar específicamente el bug de múltiples ACTIVE históricos.
- Files or areas likely involved:
  PostgreSQL Operations/Expense integration tests.
- Execution notes:
  Crear estado controlado: Day 1 NIGHT ACTIVE residual; avanzar `IBusinessClock.BusinessDate`; abrir Day 2 CashSession con MORNING ACTIVE. Asociar Employee donde corresponda. Ejecutar CurrentShift/MyCurrentShift/Sale/Expense utilizando APIs/services reales.
- Verification method:
  CurrentShift, MyCurrentShift, Sale.ShiftId y Expense.ShiftId apuntan a Day 2. Ninguna operación lanza por múltiples ACTIVE globales.
- Dependencies:
  Task 6.

- [x] Task 8: Usar shortages autoritativos del Inventory batch en HU-013

- Objective:
  Eliminar la respuesta stale cuando el stock cambia entre precheck y adquisición de locks.
- Files or areas likely involved:
  Sale confirmation en OperationsService, mapping de shortage existente, OperationsConcurrency integration tests.
- Execution notes:
  Mantener precheck y acknowledgment actuales. Cuando `WriteBatchAsync` detecte `STOCK_INSUFFICIENT`, mapear la respuesta desde `InventoryBatchResult.Shortages`, no desde el arreglo pre-lock. Reusar Product metadata disponible sin convertir client state en autoridad. No cambiar semántica de errores no-stock dentro de esta task.
- Verification method:
  Race test fuerza precheck suficiente y batch insuficiente; response contiene shortages autoritativos no vacíos y no se confirma Sale sin acknowledgment.
- Dependencies:
  Tasks 1, 2.

- [x] Task 9: Extender PurchaseLineDto con unidad recibida y restaurar null semantics

- Objective:
  Distinguir unidad ordenada de unidad recibida y representar correctamente una Purchase aún no recibida.
- Files or areas likely involved:
  `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs`, Purchase read mapping en OperationsService y contract/integration tests.
- Execution notes:
  Mantener `unitId` existente. Añadir `receivedUnitId` nullable o naming local coherente. Cambiar el read mapping para conservar `ReceivedQuantity` y receipt `UnitId` juntos. Si no existe receipt row, devolver ambos como null; no usar `GetValueOrDefault`. No modificar request de reception ni persistencia.
- Verification method:
  Tests cubren pending null/null, ordered unit == received unit y ordered kg / received g. Existing fields siguen presentes.
- Dependencies:
  Tasks 1, 2, 5.

- [x] Task 10: Auditar findings secundarios sin incorporarlos al scope

- Objective:
  Verificar los posibles defectos adicionales y producir el reporte requerido sin cambiar comportamiento no aprobado.
- Files or areas likely involved:
  `ProduceAsync`, `ReceivePurchaseAsync`, InventoryWriter y error mapping/API.
- Execution notes:
  Confirmar o descartar: colapso general de errores Production y UnitId inexistente en receipt. Registrar archivo/método/comportamiento/severidad/HU/riesgo. Mantener la decisión sobre Unit desactivada como `PRODUCT_DECISION_REQUIRED`. No implementar fixes para estos puntos.
- Verification method:
  Cada hallazgo termina como `NOT_REPRODUCED`, `ADDITIONAL_FINDING_REQUIRES_HUMAN_REVIEW` o `PRODUCT_DECISION_REQUIRED`; ningún diff de código se atribuye a esos findings.
- Dependencies:
  Task 1.

- [x] Task 11: Ejecutar la validación backend completa

- Objective:
  Demostrar que las correcciones no rompen foundations Sprint 1/Sprint 2 y que no requieren schema mutation inesperada.
- Files or areas likely involved:
  Entire backend solution, all discovered backend test projects, migration directory.
- Execution notes:
  Ejecutar comandos reales del repositorio. Esperados actualmente: restore, build y full test suite. Resolver errores normales causados por el change. No borrar, debilitar o saltar tests. Revisar diff de migrations; la expectativa es cero nueva migration. Si aparece necesidad schema real, documentarla antes de continuar.
- Verification method:
  Backend restore/build PASS; all discovered tests failed=0; relevant PostgreSQL integrations PASS; migration diff inesperado = none.
- Dependencies:
  Tasks 3-9.

- [x] Task 12: Estabilizar y comparar el OpenAPI runtime

- Objective:
  Producir el contrato backend definitivo solo después de que el backend esté verde.
- Files or areas likely involved:
  API runtime, OpenAPI document, endpoint metadata.
- Execution notes:
  Levantar API en Development usando workflow real, obtener `/openapi/v1.json` o ruta canónica, comparar routes/verbs/schemas contra baseline. Confirmar cero route/verb changes y que `receivedUnitId` es la única extensión esperada salvo diferencias locales justificadas. No rediseñar metadata unrelated.
- Verification method:
  OpenAPI genera correctamente; todos los endpoints Sprint 2 existentes permanecen; no hay removals/renames accidentales; nueva propiedad receipt aparece como nullable.
- Dependencies:
  Task 11.

- [x] Task 13: Regenerar el contrato TypeScript desde OpenAPI real

- Objective:
  Sincronizar el cliente generado con el contrato backend final sin edición manual.
- Files or areas likely involved:
  `frontend/src/types/api.generated.ts`, script real de generación.
- Execution notes:
  Reauditar `frontend/package.json`; en la baseline publicada el script canónico es `pnpm run api:generate`. Ejecutarlo contra OpenAPI runtime final. No editar manualmente el generated file. Revisar el diff completo y clasificar cualquier cambio inesperado antes de tocar features.
- Verification method:
  Generated contract corresponde al OpenAPI runtime final; `receivedUnitId` aparece; no hay cambios breaking inesperados.
- Dependencies:
  Task 12.

- [x] Task 14: Proteger los consumidores frontend HU-004, HU-007 y HU-017

- Objective:
  Conservar funcionalidad de los frontends ya integrados en el baseline local con el mínimo diff manual.
- Files or areas likely involved:
  Features/API/hooks/types reales de HU-004, HU-007 y HU-017 descubiertos en Task 1.
- Execution notes:
  Ejecutar primero typecheck/tests después de regeneración. Si no existe incompatibilidad, no modificar código manual. Si existe una incompatibilidad inevitable causada por el contrato final, realizar únicamente la adaptación mínima. No cambiar UX, routing, query architecture, forms ni componentes por preferencia.
- Verification method:
  Los tres consumidores locales compilan y sus tests relevantes pasan. Manual frontend source diff = cero o lista mínima explícitamente justificada.
- Dependencies:
  Task 13.

- [x] Task 15: Ejecutar quality gates frontend completos

- Objective:
  Comprobar que generated types y cualquier adaptación mínima no rompen el frontend integrado.
- Files or areas likely involved:
  Entire frontend.
- Execution notes:
  Usar scripts reales revalidados. En la baseline publicada existen `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test` y `pnpm run build`. Ejecutar todos los gates aplicables. No alterar reglas de lint/tests para forzar green.
- Verification method:
  Format check PASS; typecheck PASS; lint PASS; tests failed=0; build PASS. Counts reales reportados dinámicamente.
- Dependencies:
  Task 14.

- [x] Task 16: Sincronizar documentación únicamente con evidencia final

- Objective:
  Corregir `DOCUMENTATION DRIFT` después de estabilizar contrato y gates.
- Files or areas likely involved:
  Historias Sprint 2 afectadas, handoff/contracts, current OpenSpec progress y current-state docs relevantes.
- Execution notes:
  Actualizar afirmaciones actualmente falsas sobre OpenAPI/generated TypeScript cuando correspondan. Distinguir registro histórico del estado actual. No reescribir evidencia histórica correcta para su momento. Registrar solo tests/build/OpenAPI realmente ejecutados. No usar ni inventar retrospectiva Sprint 1 como evidencia.
- Verification method:
  Docs actuales no contradicen el contrato final; evidencia contiene solamente resultados reales; manifests reflejan archivos realmente modificados.
- Dependencies:
  Tasks 11-15.

- [x] Task 17: Ejecutar la revisión final de compatibilidad y scope

- Objective:
  Verificar que el change es una estabilización mínima y no una reimplementación.
- Files or areas likely involved:
  Complete change diff, runtime OpenAPI diff, generated TypeScript diff, modified-file manifest.
- Execution notes:
  Revisar route/verb stability, request/response compatibility, migration status, Inventory authority, HU-004/007/017 manual diff, out-of-scope features y additional findings. Confirmar que ningún finding no aprobado fue implementado.
- Verification method:
  Cero breaking endpoint changes; cero API v2/duplicate endpoints; cero new inventory engine; cero migration inesperada; all seven PRESENT approved bugs resolved; all ALREADY_RESOLVED issues untouched; additional findings excluded.
- Dependencies:
  Tasks 11-16.

- [x] Task 18: Preparar el reporte final de estabilización

- Objective:
  Emitir un único resultado verificable que determine si el contrato Sprint 2 puede congelarse para continuar frontend HU por HU.
- Files or areas likely involved:
  Resultados de todas las tasks y manifest final.
- Execution notes:
  Reportar baseline exacta, estado de cada bug, additional findings, backend gates, OpenAPI, generated TypeScript, frontend gates, migration status, endpoint compatibility, docs, files modified y evidencia. No declarar PASS donde una ejecución no ocurrió.
- Verification method:
  El verdict solo puede indicar backend/contract stable cuando Definition of Done completa está satisfecha; de lo contrario reporta el hard blocker exacto.
- Dependencies:
  Task 17.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 250–600 LoC manuales entre backend y regresiones, más el diff generado de `api.generated.ts` y cambios documentales. El rango debe recalcularse después del preflight local, especialmente si algunos bugs están `ALREADY_RESOLVED_IN_BASELINE`.
- Risk of exceeding 400 LoC review threshold:
  Medium. El código productivo esperado es pequeño, pero las regresiones cross-day/concurrency y el artifact generado pueden elevar el diff total.
- Recommendation:
  Chained PRs
- Suggested split if chained:
  Mantener un solo OpenSpec change, pero revisar en slices coherentes:
  1. Unit validation + Purchase listing + regresiones.
  2. Current Shift + HU-013 race + regresiones de concurrencia.
  3. Purchase receipt DTO/null semantics + OpenAPI/generated contract.
  4. Frontend compatibility + documentation/evidence closure.

  Estos slices son recomendaciones de review; no autorizan Git mutations ni changes OpenSpec separados.
