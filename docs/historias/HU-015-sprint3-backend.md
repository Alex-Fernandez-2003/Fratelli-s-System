# HU-015 — Historial autorizado de ventas

## Resultado

**BACKEND IMPLEMENTADO / FRONTEND PENDIENTE**

Backend completo para HU-015. Frontend productivo fuera de alcance de este change.

## Reglas implementadas

Ver `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/spec.md` y `design.md` para reglas normativas congeladas de HU-015.

## Seguridad

Autorización server-side. Ver `verify-report.md` y matriz de `Program.cs`. Row-level scope aplicado antes de filtros/paginación donde corresponde. Multi-role = unión.

## Backend / contrato

### Endpoints

- `GET /api/v1/sales?page=&pageSize=&from=&to=&shiftId=&salesChannel=&paymentMethod=&customerSearch=` → `PagedResponse<SalesHistoryDto>`
- `GET /api/v1/sales/{id}` → `SalesDetailDto` con `SalesHistoryItemDto[]`
Ambos requieren `SalesHistory` y aplican `ISalesAuthorizationScope` antes de filtros/paginación

### DTOs / snapshots

Ver `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` y contratos específicos de la HU.

## Baseline revalidado

Branch `develop` HEAD `ec708a37a7f0627fc0ac54690c89cec7f2b061eb`. Working tree con 4 migrations Sprint 3 aplicadas (`dotnet ef database update` PASS, `has-pending-model-changes` clean). `dotnet build -c Release` PASS.

## Evidencia real

- `dotnet test backend/RestaurantSystem.slnx` → 100/100 PASS (1 Domain + 18 Application + 81 Integration)
- `curl http://localhost:5057/openapi/v1.json` → 200 (289K) con paths HU-015 presentes
- `pnpm --dir frontend run api:generate` → 179K (openapi-typescript 7.13.0)
- `pnpm --dir frontend run build` → PASS (1952 modules) tras compatibilidad `GET /purchases` history

## Manifest de archivos del change

### Backend

| Archivo | Propósito |
| --- | --- |
| `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` | SalesHistoryDto, SalesDetailDto, SalesHistoryItemDto |
| `backend/src/RestaurantSystem.Application/Operations/SalesAuthorizationScope.cs` | ISalesAuthorizationScope |
| `backend/src/RestaurantSystem.Infrastructure/Operations/AuthorizedSalesScope.cs` | scope: ADMIN/ENC/CONTADORA general vs MESERO current shift, union |
| `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs` | SalesAsync, SaleAsync (scope-first, server-side paging, newest-first) |
| `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs` | GET /api/v1/sales, GET /api/v1/sales/{id} (SalesHistory) |
| `backend/src/RestaurantSystem.Api/Program.cs` | Policy SalesHistory |
| `backend/tests/RestaurantSystem.IntegrationTests/OperationsConcurrencyPostgresIntegrationTests.cs` | history/auth/scope |

### Frontend y contrato generado

| Archivo | Propósito |
| --- | --- |
| `frontend/src/types/api.generated.ts` | Cliente generado desde OpenAPI runtime (179K), regenerado contra `http://localhost:5057/openapi/v1.json`, sin edición manual |
| `frontend/src/features/purchases/pages.tsx` | Compatibilidad: mantiene `GET /purchases` (PurchaseDto) + nuevo `GET /purchases/history` (PurchaseHistoryDto) |

### Documentación

| Archivo | Propósito |
| --- | --- |
| `docs/historias/HU-015-sprint3-backend.md` | Esta HU (backend completo, endpoints + manifest) |
| `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/` | Change archivado (proposal/design/spec/tasks/apply-progress/verify-report) |

## Evidencias

Backend-only HU: evidencia es `apply-progress.md` + `verify-report.md` + OpenAPI runtime. No se requieren screenshots frontend para este APPLY.

## Estado de entrega

`HU_015_BACKEND_COMPLETE: YES` — `HU_015_FRONTEND_COMPLETE: YES` (frontend verificado en `implement-sprint-3-frontend-customers-and-sales-history`)

## Frontend Sprint 3 — estado verificado

**FRONTEND IMPLEMENTADO Y VERIFICADO AUTOMÁTICAMENTE.** La implementación pertenece al change `implement-sprint-3-frontend-customers-and-sales-history`. Este registro conserva el backend de esta HU como reutilizado y sin cambios.

### Alcance implementado

- Ruta protegida y navegación de `Historial de ventas` para los roles definidos en la capability compartida; la UI conserva la unión de roles y distingue scope broad de MESERO asignado a turno.
- Historial server-side de ventas confirmadas con período inicial basado en `America/La_Paz`, filtros contractuales, paginación, tabla desktop, cards mobile y estados de carga/error/vacío.
- Detalle on-demand en modal: muestra snapshots históricos de Customer, ítems y total; no consulta el Customer actual para reescribir la historia.
- Comprobante PDF interno generado client-side desde el detalle autorizado, con Sale ID real y aviso no fiscal.

### Manifest de implementación — HU-015

| Estado | Paths existentes | Evidencia / propósito |
| --- | --- | --- |
| IMPLEMENTED | `frontend/src/features/sales/api.ts` | Queries tipadas de history/detail, filtros, paginación y scope de UI. |
| IMPLEMENTED | `frontend/src/features/sales/SalesHistoryPage.tsx` | Historial responsive, filtros y controles de detalle. |
| IMPLEMENTED | `frontend/src/features/sales/SaleDetailOverlay.tsx` | Detail on-demand, snapshots y acción de comprobante. |
| IMPLEMENTED | `frontend/src/features/sales/saleReceiptPdf.ts` | Adapter PDF client-side no fiscal basado en el Sale detail. |
| SHARED IMPLEMENTED | `frontend/src/routes/AppRoutes.tsx`; `frontend/src/features/navigation.tsx`; `frontend/src/components/atoms/Action.tsx`; `frontend/src/components/organisms/index.tsx`; `frontend/src/lib/business-time.ts` | Ruta `/historial-ventas`, navegación, soporte de modal/acción y fecha de negocio reutilizados. |
| TESTED | `frontend/src/features/sales/api.test.ts`; `frontend/src/features/sales/SalesHistoryPage.test.tsx`; `frontend/src/features/sales/SaleDetailOverlay.test.tsx`; `frontend/src/features/sales/saleReceiptPdf.test.ts`; `frontend/src/routes/AppRoutes.test.tsx`; `frontend/src/features/navigation.test.ts`; `frontend/src/components/atoms/Action.test.tsx`; `frontend/src/components/organisms/Modal.test.tsx`; `frontend/src/lib/business-time.test.ts` | Cobertura de filtros/scope, history/detail, PDF, rutas/navegación y primitives compartidos. |
| REUSED / UNCHANGED | `backend/` | Backend de HU-015 reutilizado; no hay cambio backend atribuido a este frontend change. |
| UNCHANGED | `frontend/src/types/api.generated.ts` | Contrato generado consumido; no se regeneró ni editó manualmente. |
| DEPENDENCY ADDED | `frontend/package.json`; `frontend/pnpm-lock.yaml` | `jspdf` incorporado para el comprobante PDF client-side. |

### Evidencia disponible

El `verify-report.md` del change registra que, desde `frontend/`, pasaron `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test` (28 archivos / 138 tests / 0 failed) y `pnpm run build`. También registra que no se ejecutó `api:generate` y que la inspección de diff no encontró cambios en backend, OpenAPI ni `api.generated.ts`.

La validación manual de navegador/responsive (~360 px, ~768 px y ~1280 px) sigue **pendiente**. No hay screenshots ni resultado manual que declarar.
