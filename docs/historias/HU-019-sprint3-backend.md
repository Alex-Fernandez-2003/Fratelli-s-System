# HU-019 — Historial autorizado de compras

## Resultado

Estado: **BACKEND REUTILIZADO / FRONTEND IMPLEMENTADO — AUTOMATED VERIFY PASS WITH WARNINGS / MANUAL DEFERRED**

El read model backend de HU-019 y sus contratos ya existentes se reutilizan sin cambio en este bloque. La integración frontend productiva está implementada en la única ruta `/compras`. La validación manual responsive permanece `DEFERRED_TO_SPRINT_FINAL_AUDIT`; no se registra como PASS ni FAIL.

## Reglas implementadas

Ver `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/spec.md` y `design.md` para reglas normativas congeladas de HU-019.

## Seguridad

Autorización server-side. Ver `docs/openspec/changes/implement-sprint-3-block-2-operational-histories/verify-report.md` y matriz de `Program.cs`. Row-level scope aplicado antes de filtros/paginación donde corresponde. Multi-role = unión.

## Backend / contrato

### Endpoints

- `GET /api/v1/purchases?page=&pageSize=&status=` → `PagedResponse<PurchaseDto>` (compatibilidad Sprint2, reutilizado)
- `GET /api/v1/purchases/history?page=&pageSize=&status=&supplierId=&purchaseArea=&responsible=&from=&to=` → `PagedResponse<PurchaseHistoryDto>` con `PurchaseArea` derivado (KITCHEN vs GENERAL)
- `GET /api/v1/purchases/history/{id}` → `PurchaseDetailDto` con receipt/cancelación

`/compras` es la única route de compras. La UI usa período de últimos 30 días, proveedor, estado y ámbito; no expone Responsible filter. `PurchaseArea` proviene del backend. Create/Receive/Cancel y sus hooks, reglas e invalidaciones existentes se reutilizan; no se creó una segunda ruta de historial ni una mutación paralela.

### DTOs / snapshots

Ver `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` y contratos específicos de la HU.

## Baseline revalidado

Branch `develop`. Los quality gates completos de backend pasaron después de una corrección únicamente de test para `America/La_Paz`: restore/build/tests de la solución PASS (7 proyectos; 104 tests: 1 Domain + 18 Application + 85 Integration). EF reportó `NONE` en pending-model changes. El backend de HU-019 fue reutilizado; no se creó migration ni se modificaron package/lock files.

## Evidencia real

- Backend full solution: restore/build/tests PASS (7 proyectos; **104/104 tests**: 1 Domain + 18 Application + 85 Integration), después de una corrección únicamente de test para `America/La_Paz`.
- EF pending-model check: **NONE**; no se produjeron migrations.
- Runtime OpenAPI y contratos de Purchases existentes se reutilizan; no hay cambio de endpoint backend de HU-019.
- Frontend full gates — `format:check`, `typecheck`, `lint`, `test` y `build` — **PASS**; Vitest: **36 files, 201 tests**.
- Focused frontend/regression: **89/89 PASS**; focused history: **20/20 PASS**.
- `git diff --check` → **PASS**.
- No package, lockfile ni migration changes; las mutations existentes Create/Receive/Cancel permanecen reutilizadas.
- Manual browser validation responsive a 360 px, ~768 px y >=1280 px: **DEFERRED_TO_SPRINT_FINAL_AUDIT**; la evidencia permanece pendiente y no se declaran screenshots ni PASS manual.

## Manifest de archivos del change

### Backend reutilizado (sin cambio de HU-019)

| Archivo | Propósito |
| --- | --- |
| `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` | `PurchaseHistoryDto`, `PurchaseDetailDto` y `PurchaseArea` derivados existentes |
| `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs` | `PurchaseHistoryAsync`, `PurchaseDetailAsync` y scope KITCHEN existentes |
| `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs` | `GET /api/v1/purchases`, `GET /api/v1/purchases/history` y `/purchases/history/{id}` existentes |
| `backend/src/RestaurantSystem.Api/Program.cs` | Policy `PurchaseHistory` existente |
| `backend/tests/RestaurantSystem.IntegrationTests/OperationsAuthorizationMatrixPostgresIntegrationTests.cs` | Cobertura existente de scope KITCHEN de COCINA |

### Frontend y contrato generado

| Archivo | Propósito |
| --- | --- |
| `frontend/src/features/purchases/api.ts` | Query de History, defaults últimos 30 días, filtros, detail on-demand y mutations existentes/invalidation acotada |
| `frontend/src/features/purchases/pages.tsx` | Única `/compras`: History list/detail, UUID abreviado/completo, scope y acciones Create/Receive/Cancel reutilizadas |
| `frontend/src/features/purchases/api.test.ts` | Pruebas de query params/defaults y read model de History |
| `frontend/src/features/purchases/pages.test.tsx` | Pruebas de filtros, scope, UUID, detail, acciones y regresiones de mutations |
| `frontend/src/lib/api/endpoints.ts` | Builders de endpoints de Purchases existentes y History Detail |
| `frontend/src/types/api.generated.ts` | Contratos generados desde OpenAPI runtime; Purchase schemas reutilizados y sin edición manual |

### Documentación

| Archivo | Propósito |
| --- | --- |
| `docs/historias/HU-019-sprint3-backend.md` | Esta HU (backend reutilizado, `/compras` integrado + manifest) |
| `docs/openspec/changes/implement-sprint-3-block-2-operational-histories/verify-report.md` | Verify-readiness y evidencia factual del bloque |
| `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/` | Change archivado que aporta el backend histórico base |

## Evidencias

La evidencia es `docs/openspec/changes/implement-sprint-3-block-2-operational-histories/apply-progress.md`, el verify-report activo, los focused tests y los contratos backend reutilizados. La validación manual responsive está `DEFERRED_TO_SPRINT_FINAL_AUDIT`; no se requieren ni se inventan screenshots.

## Evidencia manual — Sprint 3 final audit

- **Status:** `DEFERRED_TO_SPRINT_FINAL_AUDIT`
- **Target:** Sprint 3 final audit.
- **Evidence:** `PENDING`.
- **Reason:** maintainer decision `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

La implementación está completa y la verificación automatizada está en PASS. Esta evidencia manual no fue ejecutada y la siguiente lista es un conjunto de placeholders sin completar; no constituye PASS.

### Checklist pendiente HU-019

- [ ] Desktop: tabla de compras legible y acciones permitidas visibles según estado/capability.
- [ ] Tablet (~768 px): tabla/cards, estado y acciones utilizables sin pérdida de contexto.
- [ ] Mobile/360 px: cards de compras legibles sin comprimir una tabla horizontal.
- [ ] Detail: Purchase Detail usable en desktop, tablet y mobile con UUID completo y datos persistidos.
- [ ] Cards: proveedor, estado, ámbito, UUID abreviado y acciones mantienen contexto histórico.
- [ ] Filters: período, proveedor, estado y ámbito con labels y controles utilizables; sin Responsible filter.
- [ ] Roles: COCINA pure mantiene KITCHEN-only, multi-role conserva la unión y CONTADORA permanece read-only.
- [ ] Overflow: no existe overflow horizontal funcional en filtros, cards, tabla o detail.
- [ ] Keyboard: filtros, paginación, detalle, cierre, acciones permitidas y retorno de foco son operables.
- [ ] Loading/empty/error: estados de History y recuperación tras errores son comprensibles.

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

`HU_019_BACKEND_REUSED: YES` — `HU_019_FRONTEND_COMPLETE: YES` — `VERIFY_READY: YES` — `MANUAL_RESPONSIVE_VALIDATION: DEFERRED_TO_SPRINT_FINAL_AUDIT`
