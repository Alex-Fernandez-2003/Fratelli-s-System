# HU-008 — Historial de producción y lote de trazabilidad

## Resultado

Estado: **BACKEND + FRONTEND IMPLEMENTADOS / AUTOMATED VERIFY PASS WITH WARNINGS / MANUAL DEFERRED**

Backend de HU-008 y frontend productivo están implementados en el change activo. La validación manual responsive permanece `DEFERRED_TO_SPRINT_FINAL_AUDIT`; no se registra como PASS ni FAIL.

## Reglas implementadas

Ver `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/spec.md` y `design.md` para reglas normativas congeladas de HU-008.

## Seguridad

Autorización server-side. Ver `docs/openspec/changes/implement-sprint-3-block-2-operational-histories/verify-report.md` y matriz de `Program.cs`. Row-level scope aplicado antes de filtros/paginación donde corresponde. Multi-role = unión.

## Backend / contrato

### Endpoints

- `GET /api/v1/productions?page=&pageSize=&productId=&batchCode=&status=&responsible=&from=&to=` → `PagedResponse<ProductionHistoryDto>` paginado newest-first, filtros server-side
- `GET /api/v1/productions/summary?productId=&batchCode=&status=&responsible=&from=&to=` → `ProductionSummaryDto` server-side, sin `page`/`pageSize`, con `productionCount`, `latestProduction` y `mostProducedPreparation` por frecuencia de eventos
- `GET /api/v1/productions/{id}` → `ProductionDetailDto` con `ProductionConsumptionHistoryDto[]` snapshot histórico (no recompone con composición actual)

La UI expone los cuatro filtros aprobados —preparación/producto, período (`from`/`to`), responsable y BatchCode— y omite el control de `status` mientras `COMPLETED` sea el estado real único. Summary y History reciben el mismo universo de filtros aplicables; Summary nunca agrega cantidades físicas entre unidades.

### DTOs / snapshots

Ver `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` y contratos específicos de la HU.

## Baseline revalidado

Branch `develop`. Los quality gates completos de backend pasaron después de una corrección únicamente de test para `America/La_Paz`: restore/build/tests de la solución PASS (7 proyectos; 104 tests: 1 Domain + 18 Application + 85 Integration). EF reportó `NONE` en pending-model changes. No se creó migration ni se modificaron package/lock files.

## Evidencia real

- Backend full solution: restore/build/tests PASS (7 proyectos; **104/104 tests**: 1 Domain + 18 Application + 85 Integration), después de una corrección únicamente de test para `America/La_Paz`.
- EF pending-model check: **NONE**; no se produjeron migrations.
- Focused operational backend: **4/4 PASS**.
- Runtime OpenAPI aislado contiene `/api/v1/productions/summary` y su esquema `ProductionSummaryDto`.
- `pnpm --dir frontend run api:generate` regeneró el contrato desde el OpenAPI runtime; `api.generated.ts` contiene los paths/schemas de Summary y no fue editado manualmente.
- Frontend full gates — `format:check`, `typecheck`, `lint`, `test` y `build` — **PASS**; Vitest: **36 files, 201 tests**.
- Focused frontend/regression: **89/89 PASS**; focused history: **20/20 PASS**.
- `git diff --check` → **PASS**.
- No package, lockfile ni migration changes.
- Manual browser validation responsive a 360 px, ~768 px y >=1280 px: **DEFERRED_TO_SPRINT_FINAL_AUDIT**; la evidencia permanece pendiente y no se declaran screenshots ni PASS manual.

## Manifest de archivos del change

### Backend y contrato

| Archivo | Propósito |
| --- | --- |
| `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` | Contratos existentes de History/Detail y `ProductionSummaryDto`, `ProductionSummaryLatestDto`, `ProductionSummaryMostProducedDto` |
| `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs` | Queries server-side de History/Detail y Summary; Summary cuenta eventos y ordena frecuencia con tie-break estable |
| `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs` | `GET /api/v1/productions`, `GET /api/v1/productions/{id}` y `GET /api/v1/productions/summary` bajo `ProductionHistory` |
| `backend/tests/RestaurantSystem.IntegrationTests/ProductionSummaryPostgresIntegrationTests.cs` | Authorization, filtros, count/latest/frequency, mixed units, empty, tie-break y ausencia de side effects |
| `backend/src/RestaurantSystem.Domain/Operations/OperationalEntities.cs` | Modelo HU-008 existente, reutilizado |
| `backend/src/RestaurantSystem.Infrastructure/ApplicationDbContext.cs` | Modelo HU-008 existente, reutilizado sin cambios de schema |
| `backend/src/RestaurantSystem.Infrastructure/Migrations/20260831111424_AddProductionTraceability.cs` | Migration HU-008 existente; no se creó una migration para Summary |

### Frontend y contrato generado

| Archivo | Propósito |
| --- | --- |
| `frontend/src/features/production/api.ts` | Queries/key factories de History, Summary y Detail; filtros y defaults del mes actual |
| `frontend/src/features/production/HistoryPage.tsx` | `/produccion`, cuatro filtros, paginación server-side, tres cards server-backed y tabla/cards responsive |
| `frontend/src/features/production/ProductionDetailOverlay.tsx` | Detail on-demand, BatchCode completo y consumptions persistidas bajo `Consumo registrado` |
| `frontend/src/features/production/pages.tsx` | Integración de `Ver historial` en el success de HU-007 sin alterar la mutación |
| `frontend/src/features/production/index.ts` | Exportación de la feature de producción |
| `frontend/src/routes/AppRoutes.tsx` | Route `/produccion` History y guard de `/produccion/registrar` |
| `frontend/src/features/navigation.tsx` | Target global de Producción y visibilidad role-aware |
| `frontend/src/lib/api/endpoints.ts` | Builders de endpoints de History, Summary y Detail |
| `frontend/src/features/production/HistoryPage.test.tsx` | Pruebas focalizadas de filtros, cards, estados, BatchCode y responsive representation |
| `frontend/src/routes/AppRoutes.test.tsx` | Regresión focalizada de route/roles |
| `frontend/src/types/api.generated.ts` | Generado desde OpenAPI runtime; contiene paths/schemas de Summary y no fue editado manualmente |

### Documentación

| Archivo | Propósito |
| --- | --- |
| `docs/historias/HU-008-sprint3-backend.md` | Esta HU (backend/frontend implementados, endpoints + manifest) |
| `docs/openspec/changes/implement-sprint-3-block-2-operational-histories/verify-report.md` | Verify-readiness y evidencia factual del bloque |
| `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/` | Change archivado que aporta el backend histórico base |

## Evidencias

La evidencia de implementación es `docs/openspec/changes/implement-sprint-3-block-2-operational-histories/apply-progress.md`, el verify-report activo, los focused tests y el OpenAPI runtime. La validación manual responsive está `DEFERRED_TO_SPRINT_FINAL_AUDIT`; no se requieren ni se inventan screenshots.

## Evidencia manual — Sprint 3 final audit

- **Status:** `DEFERRED_TO_SPRINT_FINAL_AUDIT`
- **Target:** Sprint 3 final audit.
- **Evidence:** `PENDING`.
- **Reason:** maintainer decision `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

La implementación está completa y la verificación automatizada está en PASS. Esta evidencia manual no fue ejecutada y la siguiente lista es un conjunto de placeholders sin completar; no constituye PASS.

### Checklist pendiente HU-008

- [ ] Desktop: tabla de historial legible y acciones de detalle utilizables.
- [ ] Tablet (~768 px): tabla/cards y filtros utilizables sin pérdida de contexto.
- [ ] Mobile/360 px: cards de historial y las tres summary cards legibles.
- [ ] Detail: overlay de Production Detail usable en desktop, tablet y mobile.
- [ ] Cards: contenido, cantidades/unidades y estados visibles sin truncamiento engañoso.
- [ ] Filters: preparación, período, responsable y BatchCode con labels y controles utilizables.
- [ ] Roles: lectores autorizados, CTA de registro según capability, CONTADORA sin registro y multi-role por unión.
- [ ] Overflow: no existe overflow horizontal funcional en filtros, cards, tabla o detail.
- [ ] Keyboard: filtros, paginación, acción de detalle, cierre y retorno de foco son operables.
- [ ] Loading/empty/error: estados de History y Summary son comprensibles y recuperables.

### Plantilla de evidencia manual

- Evidence ID:
- Date:
- Environment:
- Viewport/device:
- Role:
- Flow:
- Expected:
- Observed:
- Result: PASS / FAIL
- Screenshot:
- Finding ID:
- Notes:

## Estado de entrega

`HU_008_BACKEND_COMPLETE: YES` — `HU_008_FRONTEND_COMPLETE: YES` — `VERIFY_READY: YES` — `MANUAL_RESPONSIVE_VALIDATION: DEFERRED_TO_SPRINT_FINAL_AUDIT`
