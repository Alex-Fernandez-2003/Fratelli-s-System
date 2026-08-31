# HU-030 — Datos de reporte de inventario

## Resultado

**BACKEND IMPLEMENTADO / FRONTEND PENDIENTE**

Backend completo para HU-030. Frontend productivo fuera de alcance de este change.

## Reglas implementadas

Ver `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/spec.md` y `design.md` para reglas normativas congeladas de HU-030.

## Seguridad

Autorización server-side. Ver `verify-report.md` y matriz de `Program.cs`. Row-level scope aplicado antes de filtros/paginación donde corresponde. Multi-role = unión.

## Backend / contrato

### Endpoints

- `GET /api/v1/reports/inventory` → `InventoryReportDto{items: InventoryReportItemDto[], total/low/negative}` estado NEGATIVE/LOW/NORMAL

### DTOs / snapshots

Ver `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` y contratos específicos de la HU.

## Baseline revalidado

Branch `develop` HEAD `ec708a37a7f0627fc0ac54690c89cec7f2b061eb`. Working tree con 4 migrations Sprint 3 aplicadas (`dotnet ef database update` PASS, `has-pending-model-changes` clean). `dotnet build -c Release` PASS.

## Evidencia real

- `dotnet test backend/RestaurantSystem.slnx` → 100/100 PASS (1 Domain + 18 Application + 81 Integration)
- `curl http://localhost:5057/openapi/v1.json` → 200 (289K) con paths HU-030 presentes
- `pnpm --dir frontend run api:generate` → 179K (openapi-typescript 7.13.0)
- `pnpm --dir frontend run build` → PASS (1952 modules) tras compatibilidad `GET /purchases` history

## Manifest de archivos del change

### Backend

| Archivo | Propósito |
| --- | --- |
| `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` | InventoryReportDto/Item |
| `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs` | InventoryReportAsync (reuse InventoryBalances, NEGATIVE/LOW/NORMAL) |
| `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs` | GET /api/v1/reports/inventory (InventoryRead) |

### Frontend y contrato generado

| Archivo | Propósito |
| --- | --- |
| `frontend/src/types/api.generated.ts` | Cliente generado desde OpenAPI runtime (179K), regenerado contra `http://localhost:5057/openapi/v1.json`, sin edición manual |
| `frontend/src/features/purchases/pages.tsx` | Compatibilidad: mantiene `GET /purchases` (PurchaseDto) + nuevo `GET /purchases/history` (PurchaseHistoryDto) |

### Documentación

| Archivo | Propósito |
| --- | --- |
| `docs/historias/HU-030-sprint3-backend.md` | Esta HU (backend completo, endpoints + manifest) |
| `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/` | Change archivado (proposal/design/spec/tasks/apply-progress/verify-report) |

## Evidencias

Backend-only HU: evidencia es `apply-progress.md` + `verify-report.md` + OpenAPI runtime. No se requieren screenshots frontend para este APPLY.

## Estado de entrega

`HU_030_BACKEND_COMPLETE: YES` — `READY_FOR_SPRINT_3_FRONTEND: YES` (frontend Sprint 3 pendiente en change separado)
