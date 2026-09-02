# Spec

## Requirements

### Global Architecture

- [GLOBAL-001] El change MUST implementar únicamente HU-008, HU-019 y HU-021.
- [GLOBAL-002] HU-008, HU-019 y HU-021 MUST permanecer en sus feature slices actuales.
- [GLOBAL-003] El frontend MUST reutilizar AppShell, routing, TanStack Query, HTTP/error infrastructure y shared components existentes.
- [GLOBAL-004] El frontend MUST NOT introducir un `UniversalHistoryTable`, `HistoryRepository`, `GenericFilterEngine` o abstracción equivalente sin un precedent reusable ya existente.
- [GLOBAL-005] Todas las listas históricas MUST usar server-side pagination.
- [GLOBAL-006] Los filtros MUST ejecutarse server-side.
- [GLOBAL-007] El frontend MUST NOT descargar todas las páginas para implementar pagination local.
- [GLOBAL-008] Los historiales SHOULD mantenerse newest-first cuando esa sea la ordenación autoritativa backend.
- [GLOBAL-009] Cambiar cualquier filtro MUST resetear la página a la primera página.
- [GLOBAL-010] `Limpiar filtros` MUST restaurar el default de cada HU y MUST NOT significar necesariamente historia ilimitada.
- [GLOBAL-011] El frontend MUST usar TanStack Query para server state.
- [GLOBAL-012] El frontend MUST NOT usar `useEffect` + raw fetch como mecanismo de data fetching para estas HUs.
- [GLOBAL-013] El frontend MUST NOT crear un segundo QueryClient o un nuevo global state manager.
- [GLOBAL-014] Query params opcionales MUST omitirse cuando no tengan valor y MUST NOT enviarse como empty strings, invalid GUIDs o invalid enums.
- [GLOBAL-015] Production/Purchase details SHOULD recuperarse on demand.
- [GLOBAL-016] El frontend MUST NOT realizar N+1 de entidades actuales cuando el DTO histórico ya contiene el dato necesario.
- [GLOBAL-017] El frontend MUST reutilizar formatters actuales para fechas, horas, moneda, cantidades y unidades.
- [GLOBAL-018] Las fechas MUST respetar la timezone/semántica temporal real del proyecto.
- [GLOBAL-019] El frontend MUST mantener el AppShell real y MUST NOT copiar shells o bottom navigation de los mockups.
- [GLOBAL-020] El change SHOULD requerir cero dependencias nuevas.
- [GLOBAL-021] El change MUST NOT crear una migration.
- [GLOBAL-022] Los histories MUST ser read-only salvo las mutations preexistentes de Purchase que deben seguir accesibles desde el listado operativo.
- [GLOBAL-023] Production History, Purchase History y Expense History MUST NOT producir efectos sobre Inventory.
- [GLOBAL-024] Los mockups MUST tratarse como visual reference y MUST NOT prevalecer sobre backend/generated contracts.

### Production Summary Backend

- [HU-008-SUM-001] El backend MUST exponer un único endpoint read-only de Production History Summary dentro de la familia de rutas de Productions.
- [HU-008-SUM-002] El path SHOULD ser `GET /api/v1/productions/summary` si la revalidación local confirma que es coherente con `OperationsEndpoints`.
- [HU-008-SUM-003] El endpoint MUST reutilizar la misma policy/capability de Production History.
- [HU-008-SUM-004] ADMINISTRADOR, ENCARGADO, COCINA y CONTADORA MUST poder acceder cuando la policy local confirmada mantenga la matriz actual.
- [HU-008-SUM-005] MESERO y EMPLEADO MUST permanecer denied.
- [HU-008-SUM-006] El endpoint MUST aceptar el mismo conjunto lógico de filtros de Production History relevante al summary, sin page ni pageSize.
- [HU-008-SUM-007] El endpoint MAY aceptar `status` por paridad contractual con History, aunque el frontend MUST omitir ese control mientras `COMPLETED` sea el único estado real.
- [HU-008-SUM-008] `productionCount` MUST representar COUNT de Production events que coinciden con todos los filtros.
- [HU-008-SUM-009] `productionCount` MUST NOT depender de pagination.
- [HU-008-SUM-010] El endpoint MUST NOT sumar `quantityProduced` de diferentes units para formar un total físico global.
- [HU-008-SUM-011] `latestProduction` MUST representar el Production event más reciente dentro del conjunto filtrado.
- [HU-008-SUM-012] `latestProduction` SHOULD contener únicamente los identificadores/contexto requeridos por la card, incluyendo suficientes datos para productionId, BatchCode, preparation/product y ProducedAt.
- [HU-008-SUM-013] `mostProducedPreparation` MUST representar el product/preparation con el mayor número de Production events.
- [HU-008-SUM-014] `mostProducedPreparation` MUST NOT seleccionarse mediante suma de `quantityProduced`.
- [HU-008-SUM-015] El ranking MUST aplicar tie-break determinístico.
- [HU-008-SUM-016] El tie-break SHOULD usar event count descendente, fecha máxima de Production descendente y un ID estable como último criterio.
- [HU-008-SUM-017] Un conjunto vacío MUST retornar `productionCount = 0`.
- [HU-008-SUM-018] Un conjunto vacío MUST representar `latestProduction` como null/ausente contractualmente.
- [HU-008-SUM-019] Un conjunto vacío MUST representar `mostProducedPreparation` como null/ausente contractualmente.
- [HU-008-SUM-020] El endpoint MUST ejecutar los agregados server-side.
- [HU-008-SUM-021] El endpoint SHOULD traducir las operaciones de COUNT/latest/group-count a SQL mediante la infraestructura EF actual.
- [HU-008-SUM-022] El endpoint MUST NOT materializar todas las Productions únicamente para calcular las cards cuando la consulta puede agregarse en DB.
- [HU-008-SUM-023] El endpoint MUST NOT crear, modificar o eliminar Production.
- [HU-008-SUM-024] El endpoint MUST NOT crear InventoryMovement.
- [HU-008-SUM-025] El endpoint MUST NOT modificar stock.
- [HU-008-SUM-026] El endpoint MUST NOT persistir summaries.
- [HU-008-SUM-027] El endpoint MUST NOT requerir schema changes.
- [HU-008-SUM-028] El endpoint MUST NOT requerir migration.
- [HU-008-SUM-029] Empty history MUST retornar success con zero/nulls según contrato y MUST NOT utilizar 404 únicamente por no existir registros.
- [HU-008-SUM-030] Errores de rango/filtros MUST seguir las convenciones API actuales y MUST NOT introducir un nuevo error framework.

### HU-008 Frontend

- [HU-008-001] `/produccion` MUST ser la página principal de Production History.
- [HU-008-002] `/produccion/registrar` MUST continuar sirviendo HU-007.
- [HU-008-003] El item global `Producción` MUST dirigir al historial.
- [HU-008-004] El navigation global MUST NOT tener dos items Production duplicados.
- [HU-008-005] ADMINISTRADOR, ENCARGADO y COCINA SHOULD ver `Registrar producción` cuando la capability de mutation lo permita.
- [HU-008-006] CONTADORA MUST NOT ver `Registrar producción`.
- [HU-008-007] La route de registro MUST mantener el guard de mutation real.
- [HU-008-008] History MUST tener cuatro filtros visibles:
  - preparación;
  - período;
  - responsable;
  - BatchCode/código de producción.
- [HU-008-009] History MUST NOT mostrar Status filter mientras `COMPLETED` sea el único estado actual.
- [HU-008-010] El período default MUST representar el mes actual en la timezone/semántica real del proyecto.
- [HU-008-011] La preparation query SHOULD reutilizar el source utilizado por HU-007 cuando sea compatible con history.
- [HU-008-012] Si el source solo devuelve preparaciones activas, la limitación histórica MUST documentarse y MUST NOT resolverse mediante endpoint nuevo no autorizado.
- [HU-008-013] Responsible filter MUST ajustarse al tipo real del query param.
- [HU-008-014] Responsible filter MUST NOT requerir otorgar User Management permission a roles que no la poseen.
- [HU-008-015] BatchCode filter MUST enviarse server-side según la semántica backend real.
- [HU-008-016] La UI MUST mostrar tres cards:
  - Producciones;
  - Última producción;
  - Preparación más producida.
- [HU-008-017] Las tres cards MUST usar Production Summary backend.
- [HU-008-018] Summary y list MUST recibir el mismo conjunto de filtros aplicables.
- [HU-008-019] Cambiar page MUST NOT alterar los summary values.
- [HU-008-020] La card `Producciones` MUST mostrar event count y MUST NOT mostrar suma de cantidades físicas.
- [HU-008-021] `Última producción` MUST basarse en `latestProduction`.
- [HU-008-022] La UI MAY derivar relative-time presentation desde ProducedAt.
- [HU-008-023] `Preparación más producida` MUST representar frecuencia de Production events.
- [HU-008-024] La list desktop SHOULD incluir fecha/hora, BatchCode, preparación, cantidad, unidad, responsable y detalle cuando los campos existan.
- [HU-008-025] La list MUST mostrar BatchCode backend real.
- [HU-008-026] El frontend MUST NOT fabricar un BatchCode secuencial.
- [HU-008-027] Un BatchCode MAY truncarse visualmente en una row/card si el valor completo continúa accesible.
- [HU-008-028] Detail MUST mostrar BatchCode completo.
- [HU-008-029] Detail MUST representar únicamente campos existentes en `ProductionDetailDto` o contrato generado equivalente.
- [HU-008-030] Production detail MUST display persisted consumption history and MUST NOT reconstruct ingredients from current ProductComposition.
- [HU-008-031] La sección de ingredientes SHOULD etiquetarse `Ingredientes consumidos`, `Consumo registrado` o copy equivalente que no sugiera un snapshot completo del saldo de inventario.
- [HU-008-032] El frontend MUST NOT mostrar Edit.
- [HU-008-033] El frontend MUST NOT mostrar Print label.
- [HU-008-034] El frontend MUST NOT mostrar expiry, remaining lot stock, FIFO o FEFO.
- [HU-008-035] Desktop SHOULD utilizar tabla.
- [HU-008-036] Mobile MUST utilizar cards/compact rows en lugar de comprimir una tabla horizontal.
- [HU-008-037] Las tres summary cards MUST permanecer visibles a 360 px.
- [HU-008-038] Un dataset realmente vacío SHOULD ofrecer Register CTA solo a roles con mutation capability.
- [HU-008-039] CONTADORA MUST recibir empty state sin mutation CTA.
- [HU-008-040] Un filtered-empty state MUST distinguirse de un history-empty state.
- [HU-008-041] Filtered-empty SHOULD ofrecer `Limpiar filtros`.
- [HU-008-042] Summary y History MAY cargar en paralelo.
- [HU-008-043] Un error exclusivo de Summary MUST NOT impedir utilizar History si History cargó correctamente.
- [HU-008-044] El success state HU-007 SHOULD añadir `Ver historial`.
- [HU-008-045] Añadir `Ver historial` MUST NOT eliminar `Registrar otro` ni alterar la mutation/inventory behavior de HU-007.

### HU-019

- [HU-019-001] HU-019 MUST extend the existing Purchases experience and MUST NOT create a second parallel purchase-history module.
- [HU-019-002] `/compras` MUST continuar siendo la route principal.
- [HU-019-003] El compatibility endpoint existente MUST permanecer disponible para los flujos que todavía lo requieran.
- [HU-019-004] El nuevo read model frontend SHOULD consumir `GET /purchases/history` para representar contexto histórico.
- [HU-019-005] Detail histórico MUST usar el endpoint `history/{id}` o contract local equivalente.
- [HU-019-006] Los filtros visibles MUST ser:
  - período;
  - proveedor;
  - estado;
  - ámbito.
- [HU-019-007] El frontend MUST NOT exponer Responsible filter en este bloque.
- [HU-019-008] El período default MUST representar los últimos 30 días.
- [HU-019-009] Clear filters MUST restaurar los últimos 30 días.
- [HU-019-010] PurchaseArea MUST provenir del backend.
- [HU-019-011] El frontend MUST NOT permitir definir PurchaseArea manualmente al crear una Purchase.
- [HU-019-012] Pure COCINA MUST quedar restringido a KITCHEN cuando backend mantenga ese scope.
- [HU-019-013] COCINA MUST NOT be presented with a UI option that implies access to GENERAL purchases when its effective scope is KITCHEN-only.
- [HU-019-014] Un usuario COCINA+ENCARGADO MUST recibir la unión de capacidades si backend aplica esa semántica.
- [HU-019-015] CONTADORA MUST tener history read-only.
- [HU-019-016] MESERO y EMPLEADO MUST permanecer denied.
- [HU-019-017] Existing Purchase mutations MUST preserve their current authorization matrix.
- [HU-019-018] La UI MUST mostrar el UUID real de Purchase.
- [HU-019-019] El UUID MAY abreviarse únicamente para presentación del listado.
- [HU-019-020] La abreviación MUST NOT utilizarse para requests API.
- [HU-019-021] Detail MUST mostrar el UUID completo.
- [HU-019-022] El frontend MUST NOT generar números del tipo `OC-5422`.
- [HU-019-023] Desktop SHOULD presentar tabla.
- [HU-019-024] Mobile MUST presentar cards.
- [HU-019-025] View Detail MUST mantenerse disponible para lectores autorizados.
- [HU-019-026] PENDING MAY mostrar Receive/Cancel únicamente cuando la mutation y role reales lo permitan.
- [HU-019-027] RECEIVED MUST NOT volver a ofrecer Receive.
- [HU-019-028] RECEIVED MUST NOT ofrecer Cancel cuando la regla real no lo permite.
- [HU-019-029] CANCELLED MUST NOT ofrecer Receive/Cancel.
- [HU-019-030] El change MUST reuse existing Receive/Cancel hooks/pages/modals instead of implementing parallel mutations.
- [HU-019-031] Cancel copy MUST NOT afirmar un efecto de inventario que no existe.
- [HU-019-032] Detail MUST usar `PurchaseDetailDto` o contract generado real.
- [HU-019-033] Cuando receipt existe, detail MUST representar únicamente receipt data persistida disponible.
- [HU-019-034] Cuando cancellation metadata existe, detail MUST representar únicamente campos reales.
- [HU-019-035] Detail MUST NOT crear timeline ficticio.
- [HU-019-036] HU-019 MUST NOT ofrecer Print/PDF/CSV/XLSX.
- [HU-019-037] Supplier options MUST provenir de un contrato autorizado existente.
- [HU-019-038] Si supplier lookup excluye inactive suppliers, la limitación histórica MUST documentarse sin crear endpoint no autorizado.
- [HU-019-039] Create/Cancel/Receive MUST invalidar/refrescar el history read model apropiado.
- [HU-019-040] Invalidation MUST NOT convertirse en `invalidateQueries()` global sin scope.
- [HU-019-041] Receive MUST seguir refrescando las inventory queries pertinentes.
- [HU-019-042] El read model MUST usar supplier/responsible names que backend ya provea y SHOULD evitar lookups current-entity innecesarios.

### HU-021

- [HU-021-001] `/gastos` MUST continuar siendo Register Expense.
- [HU-021-002] `/gastos/historial` MUST ser Expense History.
- [HU-021-003] ADMINISTRADOR y ENCARGADO SHOULD ver navegación interna `Registrar gasto` + `Historial`.
- [HU-021-004] CONTADORA MUST NOT recibir acceso a Register Expense.
- [HU-021-005] CONTADORA SHOULD entrar directamente a History mediante el global navigation target.
- [HU-021-006] El navigation global MUST NOT crear dos items Gastos.
- [HU-021-007] El frontend SHOULD reutilizar la infraestructura existente de targets role-aware si permite seleccionar `/gastos` versus `/gastos/historial`.
- [HU-021-008] History MUST tener filtros por período, categoría, fuente de dinero, turno y responsable para toda capability efectiva que incluya `ExpenseCategoryRead`; bajo D12, CONTADORA pura MUST recibir los cinco filtros y cargar Category desde la fuente existente autorizada.
- [HU-021-009] El período default MUST representar el mes actual.
- [HU-021-010] El frontend MUST NOT añadir global description search.
- [HU-021-011] CashSource MUST usar únicamente valores generados reales.
- [HU-021-012] `CASH_DRAWER` SHOULD mostrarse como `Caja principal`.
- [HU-021-013] `PETTY_CASH` SHOULD mostrarse como `Caja chica`.
- [HU-021-014] Shift filter MUST usar ShiftType y MUST NOT exponer Shift ID cuando no forma parte de la UX aprobada.
- [HU-021-015] The frontend MUST NOT expose `TARDE` as a ShiftType.
- [HU-021-016] MORNING/NIGHT labels MUST derivarse del enum generado real.
- [HU-021-017] Responsible control MUST corresponder al tipo real de `responsible`.
- [HU-021-018] Responsible filter MUST NOT obligar a conceder User Management permissions a CONTADORA.
- [HU-021-019] Expense aggregates MUST use totalAmount, cashDrawerTotal and pettyCashTotal returned by the backend and MUST NOT be calculated from the visible page.
- [HU-021-020] Las tres métricas MUST cambiar cuando cambien los filtros.
- [HU-021-021] Cambiar pagination MUST NOT modificar los tres aggregate values para el mismo filter set.
- [HU-021-022] `Caja principal` y `Caja chica` MUST representar gastos, no saldo disponible.
- [HU-021-023] El frontend MUST NOT mostrar `Saldo caja` como métrica HU-021.
- [HU-021-024] Desktop SHOULD utilizar tabla.
- [HU-021-025] Mobile MUST utilizar cards.
- [HU-021-026] History MUST manejar categoría null sin crash.
- [HU-021-027] Category null SHOULD mostrarse como `Sin categoría` o equivalente.
- [HU-021-028] History MUST ser read-only.
- [HU-021-029] History MUST NOT ofrecer edit/delete/reverse/approve/reconcile.
- [HU-021-030] El frontend MUST NOT inventar un Expense detail endpoint separado.
- [HU-021-031] Si el row contract ya contiene la información histórica necesaria, la row/card MUST representar directamente esos campos.
- [HU-021-032] HU-021 MUST NOT ofrecer export.
- [HU-021-033] Loading/empty/error/retry SHOULD reutilizar shared query-state patterns.
- [HU-021-034] La UI MUST NOT afirmar `Sincronización completa`, `subido a la nube` o conceptos equivalentes sin contrato real.
- [HU-021-035] El success state HU-020 SHOULD añadir `Ver historial`.
- [HU-021-036] La integración MUST NOT reabrir ni modificar amount/date/source/category/actor business rules de HU-020.

### HU-021 Category Contract Resolution — D12

- [HU-021-GAP-001] CONTADORA MUST mantener read-only access a Expense History según D12.
- [HU-021-GAP-002] D12 MUST incluir CONTADORA en la policy existente `ExpenseCategoryRead` únicamente para cargar las opciones de categoría requeridas por HU-021.
- [HU-021-GAP-003] El Category filter de CONTADORA MUST utilizar el endpoint existente protegido por `ExpenseCategoryRead`; bajo D12 ese source es autorizado para esta lectura.
- [HU-021-GAP-004] El frontend MUST NOT derivar category options únicamente desde la página actual.
- [HU-021-GAP-005] El frontend MUST NOT inventar category IDs/options.
- [HU-021-GAP-006] El frontend MUST NOT cambiar la policy ni ampliar permisos por su cuenta; la inclusión de CONTADORA está autorizada exclusivamente por D12.
- [HU-021-GAP-007] `ExpenseCategoryRead` MUST permanecer separado de las mutaciones de categorías y de Expense Register: CONTADORA no puede crear, editar, activar, desactivar o eliminar categorías ni registrar gastos por esta autorización; las mutaciones de categorías permanecen ADMINISTRADOR/ENCARGADO only.
- [HU-021-GAP-008] D12 MUST NOT introducir un endpoint, DTO, schema, migration ni otro cambio backend fuera de la inclusión puntual en la policy existente.
- [HU-021-GAP-009] La implementación y cobertura de autorización D12 existentes en `Program.cs` y `ExpenseCategoryAuthorizationPostgresIntegrationTests.cs` MUST permanecer green; el focused output aislado registrado es `1/1` passed.
- [HU-021-GAP-010] Historical inactive-category limitations SHOULD documentarse independientemente de D12.

### Routing and Navigation

- [ROUTE-001] `/produccion` MUST existir como history.
- [ROUTE-002] `/produccion/registrar` MUST mantener mutation guard.
- [ROUTE-003] `/compras` MUST seguir siendo una única route family.
- [ROUTE-004] `/gastos` MUST mantener Register.
- [ROUTE-005] `/gastos/historial` MUST añadir History.
- [ROUTE-006] Routes MUST utilizar `RequireAnyRole` o el capability mechanism actual.
- [ROUTE-007] JSX action visibility MUST NOT sustituir route/backend authorization.
- [ROUTE-008] Global navigation MUST exponer Production a history readers, incluyendo CONTADORA.
- [ROUTE-009] Global navigation MUST exponer Purchases a history readers.
- [ROUTE-010] Global navigation MUST exponer Gastos a writers y CONTADORA con un target que no envíe a CONTADORA primero a una forbidden route.
- [ROUTE-011] Navigation MUST NOT duplicar global items por variante de role.

### Authorization

- [AUTH-001] Multi-role MUST utilizar unión de capacidades.
- [AUTH-002] Production History MUST permitir ADMIN/ENC/COCINA/CONTADORA si backend local confirma la policy actual.
- [AUTH-003] Production Register MUST mantener ADMIN/ENC/COCINA.
- [AUTH-004] Purchase History MUST mantener ADMIN/ENC/CONTADORA y COCINA scoped.
- [AUTH-005] Purchase mutations MUST preserve current backend role/policy behavior.
- [AUTH-006] Expense History MUST permitir ADMIN/ENC/CONTADORA.
- [AUTH-007] Expense Register MUST mantener ADMIN/ENC.
- [AUTH-008] CONTADORA+ENCARGADO MUST adquirir Expense mutation capability de ENCARGADO.
- [AUTH-009] COCINA+ENCARGADO MUST adquirir el scope de Purchase correspondiente a la unión backend real.
- [AUTH-010] MESERO+CONTADORA MUST adquirir las read capabilities de CONTADORA.
- [AUTH-011] El frontend MUST NOT implementar `most restrictive role wins`.
- [AUTH-012] La policy existente `ExpenseCategoryRead` MUST incluir CONTADORA únicamente para cargar opciones de categoría de HU-021, conforme a D12.
- [AUTH-013] Las mutaciones de categorías —crear, editar, activar, desactivar y eliminar— MUST permanecer limitadas a ADMINISTRADOR y ENCARGADO.
- [AUTH-014] `ExpenseCategoryRead` MUST NOT conferir a CONTADORA permiso de Expense Register; una CONTADORA pura MUST permanecer read-only.

### Responsive and Accessibility

- [RESP-001] Las tres histories MUST ser funcionales a 360 px.
- [RESP-002] Las tres histories MUST ser verificadas aproximadamente a 768 px.
- [RESP-003] Las tres histories MUST ser verificadas a >=1280 px.
- [RESP-004] Desktop histories SHOULD utilizar DataTable/shared equivalent.
- [RESP-005] Mobile histories MUST utilizar cards/compact layout cuando DataTable resulte ilegible.
- [RESP-006] Filter controls MUST permanecer utilizables sin horizontal overflow funcional.
- [A11Y-001] Todos los filtros MUST tener labels asociados.
- [A11Y-002] Detail overlays MUST ser keyboard-operable.
- [A11Y-003] Detail overlays SHOULD manejar focus inicial y focus return conforme al primitive actual.
- [A11Y-004] Icon-only actions MUST tener accessible name.
- [A11Y-005] Pagination MUST ser keyboard-operable y claramente etiquetada.
- [A11Y-006] Loading MUST tener semántica coherente con el shared system.
- [A11Y-007] Errors MUST utilizar Alert/shared equivalent.
- [A11Y-008] Status MUST NOT expresarse solo mediante color.

### Query States

- [STATE-001] Cada history MUST definir initial loading.
- [STATE-002] Cada history MUST mantener un comportamiento de background refresh consistente con el patrón TanStack Query actual.
- [STATE-003] Cada history MUST distinguir history-empty y filtered-empty.
- [STATE-004] Cada history MUST tener recoverable error.
- [STATE-005] Production Summary MUST poder fallar independientemente de History.
- [STATE-006] Un Summary error MUST NOT reemplazar una History list válida por un full-page error.

### Contract Generation

- [GEN-001] El nuevo Production Summary contract MUST implementarse primero en backend.
- [GEN-002] Backend tests MUST ejecutarse antes de regenerar el frontend contract.
- [GEN-003] Runtime OpenAPI MUST exponer Production Summary.
- [GEN-004] Generated TypeScript MUST regenerarse desde runtime OpenAPI real.
- [GEN-005] El script real `api:generate` MUST confirmarse en package.json local.
- [GEN-006] `api.generated.ts` MUST NOT editarse manualmente.
- [GEN-007] Frontend MUST consumir los generated types del Summary endpoint.
- [GEN-008] Después del backend change, EF pending-model check MUST indicar que no hay model changes.
- [GEN-009] Ninguna migration MUST producirse como resultado de Production Summary.

### Tests

- [TEST-001] New Production Summary behavior SHOULD seguir RED → GREEN → TRIANGULATE → REFACTOR cuando sea práctico con la infraestructura existente.
- [TEST-002] Backend tests MUST cubrir readers autorizados.
- [TEST-003] Backend tests MUST cubrir MESERO/EMPLEADO forbidden.
- [TEST-004] Backend tests MUST verificar filtros.
- [TEST-005] Backend tests MUST verificar independencia de pagination.
- [TEST-006] Backend tests MUST verificar latest.
- [TEST-007] Backend tests MUST verificar most-produced by event frequency.
- [TEST-008] Backend tests MUST incluir mixed-unit productions y MUST verificar ausencia de aggregate físico inválido.
- [TEST-009] Backend tests MUST verificar empty result.
- [TEST-010] Backend tests MUST verificar tie-break determinístico.
- [TEST-011] Backend tests MUST verificar ausencia de inventory side effects.
- [TEST-012] HU-008 frontend tests MUST cubrir route/nav roles, defaults, filters, cards, BatchCode, detail, consumption snapshots y responsive representation donde sea práctico.
- [TEST-013] HU-019 frontend tests MUST cubrir default period, filters, scopes, UUID, details y mutation regressions.
- [TEST-014] HU-021 frontend tests MUST cubrir routes, role-aware tabs/nav, filters autorizados, metrics, null category y read-only state.
- [TEST-015] HU-007 MUST recibir regresión focalizada.
- [TEST-016] HU-017/HU-018 MUST recibir regresión focalizada.
- [TEST-017] HU-020 MUST recibir regresión focalizada.
- [TEST-018] Full frontend quality gates MUST ejecutarse usando los scripts reales.
- [TEST-019] Full backend build/tests MUST ejecutarse por existir contract change.
- [TEST-020] Automated tests MUST NOT depender de los counts específicos de la demo migration.

## Behavior Scenarios

### Scenario 1: Production history default

Given un usuario autorizado abre `/produccion` sin query-state previo  
When la pantalla construye sus filtros iniciales  
Then History y Summary MUST consultar el mes actual usando la semántica temporal real del proyecto

### Scenario 2: Production filters and summary parity

Given un filtro por preparación, responsable, período y BatchCode  
When el usuario aplica los filtros  
Then History y Summary MUST representar el mismo universo filtrado

### Scenario 3: Pagination does not change summary

Given un conjunto filtrado de 40 Productions distribuido en varias páginas  
When el usuario cambia de página  
Then las tres summary cards MUST mantener los valores del conjunto filtrado completo

### Scenario 4: Mixed physical units

Given una Production de 10 L y otra de 20 Kg que coinciden con los filtros  
When Production Summary se consulta  
Then `productionCount` MUST ser 2  
And el response MUST NOT representar 30 como total físico agregado

### Scenario 5: Latest Production

Given varias Productions filtradas con ProducedAt diferentes  
When Summary se calcula  
Then `latestProduction` MUST representar la Production con ProducedAt más reciente

### Scenario 6: Most frequent preparation

Given Preparation A aparece en 6 Production events y Preparation B aparece en 4  
When Summary se calcula  
Then `mostProducedPreparation` MUST representar Preparation A independientemente de las quantities de cada Production

### Scenario 7: Deterministic tie

Given Preparation A y B tienen el mismo número de Production events  
When Summary se ejecuta repetidamente sobre el mismo dataset  
Then el mismo resultado MUST seleccionarse según el tie-break documentado

### Scenario 8: Empty production result

Given no existe Production que coincida con los filtros  
When Summary se consulta  
Then productionCount MUST ser 0  
And latestProduction MUST ser null/absent  
And mostProducedPreparation MUST ser null/absent

### Scenario 9: Consumption snapshot

Given una Production histórica fue registrada con una composición que posteriormente cambió  
When el usuario abre Production Detail  
Then la UI MUST mostrar las consumptions persistidas de esa Production  
And MUST NOT reconstruirlas desde ProductComposition actual

### Scenario 10: CONTADORA production access

Given un usuario pure CONTADORA  
When abre `/produccion`  
Then puede consultar History/Summary/Detail  
And MUST NOT ver `Registrar producción`

### Scenario 11: COCINA production access

Given un usuario pure COCINA  
When abre `/produccion`  
Then puede consultar History/Summary/Detail  
And puede ver `Registrar producción` cuando la mutation policy real lo permite

### Scenario 12: Purchase default history

Given un usuario autorizado abre `/compras`  
When se inicializa el read model HU-019  
Then el history filter MUST usar los últimos 30 días como período default

### Scenario 13: Purchase filters

Given un usuario autorizado selecciona período, proveedor, estado y ámbito  
When los filtros cambian  
Then el frontend MUST resetear page  
And MUST enviar los filtros al History endpoint  
And MUST NOT aplicar solo client-side filtering sobre rows visibles

### Scenario 14: Pure COCINA Purchase scope

Given un usuario pure COCINA  
When consulta `/compras`  
Then solo puede observar el scope KITCHEN determinado por backend  
And la UI MUST NOT ofrecer `GENERAL` o `ALL` como selección efectiva

### Scenario 15: Multi-role Purchase scope

Given un usuario tiene COCINA + ENCARGADO  
When consulta Purchase History  
Then el frontend MUST representar la unión de capacidades  
And MUST NOT limitarlo artificialmente al scope pure COCINA si backend le concede acceso general

### Scenario 16: CONTADORA Purchase read-only

Given un usuario pure CONTADORA  
When consulta Purchase History  
Then puede listar y abrir detail  
And MUST NOT recibir Create/Receive/Cancel controls

### Scenario 17: Pending purchase writer

Given una Purchase PENDING y un usuario con la mutation capability existente  
When la row/card se renderiza  
Then las acciones Receive y Cancel MAY mantenerse según las reglas actuales  
And MUST usar las mutations preexistentes

### Scenario 18: Received purchase detail

Given una Purchase RECEIVED con receipt persistida  
When Detail se abre  
Then la UI MUST mostrar receipt information realmente expuesta por `PurchaseDetailDto`  
And MUST NOT inventar una recepción parcial/timeline

### Scenario 19: Cancelled purchase detail

Given una Purchase CANCELLED con cancellation metadata  
When Detail se abre  
Then la UI MUST mostrar únicamente el reason/metadata real disponible  
And MUST NOT ofrecer Receive o Cancel otra vez

### Scenario 20: Expense history default

Given un usuario autorizado abre `/gastos/historial`  
When se inicializa History  
Then el período default MUST ser el mes actual

### Scenario 21: Expense server metrics

Given el backend devuelve totalAmount, cashDrawerTotal y pettyCashTotal para el conjunto filtrado  
When History se renderiza  
Then las tres cards MUST mostrar esos valores  
And MUST NOT sumar current-page rows

### Scenario 22: Expense pagination

Given un filter set con varias páginas de Expenses  
When el usuario navega entre páginas sin cambiar filtros  
Then las tres metrics MUST permanecer constantes

### Scenario 23: Expense cash source

Given un Expense con CASH_DRAWER  
When se renderiza  
Then la UI SHOULD mostrar `Caja principal`

### Scenario 24: Expense shift type

Given el generated enum contiene MORNING y NIGHT  
When el filter Turno se renderiza  
Then la UI MUST ofrecer únicamente labels compatibles con esos valores  
And MUST NOT ofrecer `TARDE`

### Scenario 25: Expense null category

Given un Expense histórico con category null  
When row/card se renderiza  
Then la UI MUST permanecer estable  
And SHOULD mostrar `Sin categoría`

### Scenario 26: CONTADORA Expense navigation

Given un usuario pure CONTADORA con ExpenseHistory permission  
When selecciona el item global `Gastos`  
Then MUST navegar directamente al History autorizado  
And MUST NOT ser enviado primero a Register Expense

### Scenario 27: D12 Expense category options

Given CONTADORA puede consultar ExpenseHistory
And D12 la incluye en la policy existente `ExpenseCategoryRead` únicamente para cargar opciones  
When se prepara APPLY  
Then la UI MUST mostrar el filtro Category usando el endpoint existente  
And CONTADORA MUST conservar acceso read-only a Expense History  
And CONTADORA MUST NOT recibir mutaciones de categorías ni Register Expense por esta autorización  
And las mutaciones de categorías MUST permanecer limitadas a ADMINISTRADOR/ENCARGADO  
And APPLY MUST NOT crear endpoint, DTO, schema o migration nuevos ni otro cambio backend fuera de D12

### Scenario 28: Register Expense success integration

Given ADMIN/ENC registra un Expense correctamente  
When el success state aparece  
Then puede mantener la acción de nuevo registro  
And SHOULD añadir una acción secundaria `Ver historial`

## Edge Cases

### HU-008

- No Productions.
- Filters sin matches.
- latestProduction null.
- mostProducedPreparation null.
- Tie frequency.
- BatchCode largo.
- Notes null.
- Responsible display null.
- Empty consumption list en legacy record si el contrato lo permite.
- Mixed units.
- Historial de preparación actualmente inactive.
- Page fuera de rango después de filter change.
- ProducedAt cerca de límite de día/mes en America/La_Paz.
- Summary falla mientras list funciona.

### HU-019

- PENDING.
- RECEIVED.
- CANCELLED.
- Receipt presente.
- Receipt ausente.
- Cancellation metadata presente.
- Supplier name largo.
- Supplier histórico inactive.
- Pure COCINA intenta query explícita GENERAL.
- COCINA + ENCARGADO.
- Last page queda vacía después de una mutation.
- UUID corto visualmente sin modificar su valor.
- Mutation success mientras History está en página >1.

### HU-021

- Zero history.
- Filtered zero.
- Todos los aggregates en cero.
- Category null.
- Solo CASH_DRAWER.
- Solo PETTY_CASH.
- Shift context null si legacy contract lo permite.
- Responsible display null.
- Mes actual sin registros.
- Category options cargadas por CONTADORA mediante la policy y endpoint existentes de D12.
- CONTADORA intenta una mutación de categoría o Register Expense sin la capability correspondiente.
- Historical inactive category.
- Pure CONTADORA.
- Description muy larga.
- Pagination con summary constante.
- Filter from > to.
- Clear filters restaura mes actual.

## Acceptance Criteria

- El local baseline MUST ser revalidado antes de APPLY.
- D12 MUST mantenerse durante APPLY: CONTADORA debe cargar Category mediante el `ExpenseCategoryRead` existente, únicamente como lectura de opciones.
- Las mutaciones de categorías MUST seguir limitadas a ADMINISTRADOR/ENCARGADO y CONTADORA no debe registrar gastos por esta autorización.
- Production Summary MUST ser el único backend feature/capacidad nuevo; D12 solo ajusta la policy existente.
- D12 MUST requerir cero endpoint, DTO, schema, migration u otro cambio backend adicional.
- La cobertura existente de D12 en `Program.cs` y `ExpenseCategoryAuthorizationPostgresIntegrationTests.cs` MUST conservar el focused resultado `1/1` passed.
- Production Summary MUST requerir cero migrations.
- Production Summary MUST utilizar la policy de Production History.
- Production Summary MUST usar event count/frequency.
- Mixed-unit test MUST demostrar que no existe physical aggregate inválido.
- Runtime OpenAPI MUST contener Summary.
- Generated TypeScript MUST regenerarse desde runtime OpenAPI.
- `/produccion` MUST quedar como History landing page.
- HU-007 MUST continuar funcional.
- HU-008 MUST mostrar tres server-backed summary cards.
- HU-008 MUST soportar los cuatro filtros aprobados.
- HU-008 MUST mostrar BatchCode real.
- HU-008 Detail MUST usar historical consumption snapshots.
- `/compras` MUST permanecer como única Purchases page.
- HU-019 MUST usar el History read model sin duplicar Create/Receive/Cancel.
- HU-019 MUST aplicar los cuatro filtros aprobados.
- Pure COCINA MUST NOT recibir scope GENERAL falso.
- CONTADORA MUST permanecer read-only.
- Purchase list MUST usar UUID real abreviado únicamente como presentación.
- `/gastos` MUST seguir registrando Expense.
- `/gastos/historial` MUST consultar History.
- Gastos navigation MUST ser role-aware.
- HU-021 MUST usar exactamente los tres aggregates backend.
- HU-021 MUST NOT mostrar TARDE.
- HU-021 MUST manejar category null.
- No history MUST incluir Print/PDF/CSV/XLSX.
- No history MUST incluir edit/delete/reverse.
- Mobile 360 px MUST usar layouts legibles.
- Full frontend tests/typecheck/lint/format/build MUST pasar con los scripts reales.
- Full backend build/tests MUST pasar.
- EF pending-model check MUST permanecer limpio.
- HU-008/HU-019/HU-021 docs MUST reflejar únicamente cambios efectivamente aplicados.

## Out of Scope

- HU-023.
- HU-024.
- HU-028.
- HU-029.
- HU-030.
- HU-031.
- Cash closing changes.
- Reports.
- PDF.
- CSV.
- XLSX.
- Print.
- Label printing.
- Production editing.
- Purchase editing.
- Expense editing.
- Delete history.
- Approval/reconciliation flows.
- Inventory by lot.
- FIFO.
- FEFO.
- Expiry.
- New analytics.
- Demo-data changes.
- New migrations.
- New frontend architecture.
