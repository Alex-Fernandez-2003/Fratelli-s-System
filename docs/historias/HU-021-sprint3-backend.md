# HU-021 — Historial autorizado de gastos

## Resultado

Estado: **BACKEND REUTILIZADO + D12 IMPLEMENTADA / FRONTEND IMPLEMENTADO — AUTOMATED VERIFY PASS WITH WARNINGS / MANUAL DEFERRED**

El read model backend de Expense History y el source de categorías ya existentes se reutilizan. D12 está congelada e implementada con la inclusión puntual de `Accountant` en la policy existente `ExpenseCategoryRead`; la integración frontend productiva está implementada. La validación manual responsive permanece `DEFERRED_TO_SPRINT_FINAL_AUDIT`; no se registra como PASS ni FAIL.

## Reglas implementadas

Ver `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/spec.md` y `design.md` para reglas normativas congeladas de HU-021.

## Seguridad

Autorización server-side. Ver `docs/openspec/changes/implement-sprint-3-block-2-operational-histories/verify-report.md` y matriz de `Program.cs`. Row-level scope aplicado antes de filtros/paginación donde corresponde. Multi-role = unión.

## Backend / contrato

### Endpoints

- `GET /api/v1/expenses?page=&pageSize=&from=&to=&categoryId=&cashSource=&responsible=&shiftId=&shiftType=` → `ExpenseHistoryPage` con `totalAmount/cashDrawerTotal/pettyCashTotal` sobre conjunto filtrado completo
- `GET /api/v1/expense-categories` → opciones existentes protegidas por `ExpenseCategoryRead`; bajo D12, CONTADORA puede leerlas únicamente para el filtro Category de HU-021.

`/gastos` permanece Register y `/gastos/historial` es History. La UI de History usa período del mes actual, Category, CashSource, ShiftType (`MORNING`/`NIGHT`) y responsible; no expone `TARDE`, Shift ID, export ni mutaciones. Las tres métricas se muestran directamente desde el response backend y son independientes de la página visible. CONTADORA permanece read-only y no recibe Register Expense por esta autorización.

### DTOs / snapshots

Ver `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` y contratos específicos de la HU.

## Baseline revalidado

Branch `develop`. Los quality gates completos de backend pasaron después de una corrección únicamente de test para `America/La_Paz`: restore/build/tests de la solución PASS (7 proyectos; 104 tests: 1 Domain + 18 Application + 85 Integration). EF reportó `NONE` en pending-model changes. D12 no añadió endpoint, DTO, schema ni migration; no se modificaron package/lock files.

## Evidencia real

- D12 markers exactos:
  - `CONTADORA_EXPENSE_CATEGORY_READ: AUTHORIZED`
  - `CONTADORA_EXPENSE_CATEGORY_MUTATION: NOT_AUTHORIZED`
- D12 focused authorization (`ExpenseCategoryAuthorizationPostgresIntegrationTests`): **1/1 PASS**; cubre lectura autorizada y separación de mutaciones/otros roles.
- Backend full solution: restore/build/tests PASS (7 proyectos; **104/104 tests**: 1 Domain + 18 Application + 85 Integration), después de una corrección únicamente de test para `America/La_Paz`.
- EF pending-model check: **NONE**; no se produjeron migrations.
- Frontend full gates — `format:check`, `typecheck`, `lint`, `test` y `build` — **PASS**; Vitest: **36 files, 201 tests**.
- Focused frontend/regression: **89/89 PASS**; focused history: **20/20 PASS**.
- Category options continúan usando el endpoint y contrato existentes; no se añadió endpoint, DTO, schema ni migration.
- `git diff --check` → **PASS**.
- No package, lockfile ni migration changes.
- Manual browser validation responsive a 360 px, ~768 px y >=1280 px: **DEFERRED_TO_SPRINT_FINAL_AUDIT**; la evidencia permanece pendiente y no se declaran screenshots ni PASS manual.

## Manifest de archivos del change

### Backend reutilizado y D12

| Archivo | Propósito |
| --- | --- |
| `backend/src/RestaurantSystem.Application/Expenses/ExpenseContracts.cs` | `ExpenseHistoryDto`, `ExpenseHistoryPage` y filtros/agregados existentes, reutilizados |
| `backend/src/RestaurantSystem.Infrastructure/Expenses/ExpenseService.cs` | `HistoryAsync` con aggregates full-filter existentes, reutilizado |
| `backend/src/RestaurantSystem.Api/Program.cs` | D12: única inclusión de `RoleNames.Accountant` en la policy existente `ExpenseCategoryRead`; `ExpenseHistory` y mutaciones permanecen separadas |
| `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs` | Integración shift/cashSession existente para `BusinessDate`, reutilizada |
| `backend/tests/RestaurantSystem.IntegrationTests/ExpenseCategoryAuthorizationPostgresIntegrationTests.cs` | Cobertura enfocada D12: lectura de opciones y denegación de mutaciones/otros roles |

### Frontend y contrato generado

| Archivo | Propósito |
| --- | --- |
| `frontend/src/features/expenses/api.ts` | Query de Expense History, defaults del mes actual, filtros y key factories; Category usa el source autorizado existente |
| `frontend/src/features/expenses/HistoryPage.tsx` | `/gastos/historial`, filtros, métricas backend, paginación y estados responsive read-only |
| `frontend/src/features/expenses/HistoryPage.test.tsx` | Pruebas de route/filtros/métricas/null category/read-only y representación history |
| `frontend/src/features/expenses/pages.tsx` | Register Expense existente y acción `Ver historial` en success sin reabrir sus business rules |
| `frontend/src/features/expenses/api.test.ts` | Pruebas de query/filtros y contrato de History |
| `frontend/src/lib/api/endpoints.ts` | Builder del endpoint de Expense History y source existente de categorías |
| `frontend/src/routes/AppRoutes.tsx` | Routes `/gastos` y `/gastos/historial` con guards reales |
| `frontend/src/features/navigation.tsx` | Target global Gastos role-aware, con destino directo de CONTADORA a History |
| `frontend/src/types/api.generated.ts` | Contratos generados desde OpenAPI runtime; sin edición manual |

### Documentación

| Archivo | Propósito |
| --- | --- |
| `docs/historias/HU-021-sprint3-backend.md` | Esta HU (D12, backend reutilizado, frontend History + manifest) |
| `docs/openspec/changes/implement-sprint-3-block-2-operational-histories/verify-report.md` | Verify-readiness y evidencia factual del bloque |
| `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/` | Change archivado que aporta el backend histórico base |

## Evidencias

La evidencia es `docs/openspec/changes/implement-sprint-3-block-2-operational-histories/apply-progress.md`, el verify-report activo, los focused tests y el contrato backend existente. La validación manual responsive está `DEFERRED_TO_SPRINT_FINAL_AUDIT`; no se requieren ni se inventan screenshots.

## Evidencia manual — Sprint 3 final audit

- **Status:** `DEFERRED_TO_SPRINT_FINAL_AUDIT`
- **Target:** Sprint 3 final audit.
- **Evidence:** `PENDING`.
- **Reason:** maintainer decision `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

La implementación está completa y la verificación automatizada está en PASS. Esta evidencia manual no fue ejecutada y la siguiente lista es un conjunto de placeholders sin completar; no constituye PASS.

### Checklist pendiente HU-021

- [ ] Desktop: tabla de historial y las tres métricas legibles, con controles read-only visibles.
- [ ] Tablet (~768 px): tabla/cards, métricas y filtros utilizables sin pérdida de contexto.
- [ ] Mobile/360 px: cards de historial y métricas legibles sin overflow funcional.
- [ ] Detail: no se expone un detalle o endpoint no soportado; la vista permanece read-only.
- [ ] Cards: `totalAmount`, `cashDrawerTotal` y `pettyCashTotal` se presentan claramente sin convertirlos en saldo.
- [ ] Filters: período, categoría, fuente de dinero, turno y responsable con labels y controles utilizables.
- [ ] Roles: ADMIN/ENC conservan Register + History; CONTADORA entra a History, sin Register ni mutaciones de categorías; multi-role usa unión.
- [ ] Overflow: no existe overflow horizontal funcional en filtros, cards, tabla o estados.
- [ ] Keyboard: filtros, paginación, controles de navegación y estados interactivos son operables y tienen nombres accesibles.
- [ ] Loading/empty/error: estados iniciales, vacíos, filtrados y recuperables son comprensibles.

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

`HU_021_BACKEND_REUSED: YES` — `D12: FROZEN/IMPLEMENTED` — `HU_021_FRONTEND_COMPLETE: YES` — `VERIFY_READY: YES` — `MANUAL_RESPONSIVE_VALIDATION: DEFERRED_TO_SPRINT_FINAL_AUDIT`
