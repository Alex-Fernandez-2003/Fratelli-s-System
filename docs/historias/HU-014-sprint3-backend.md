# HU-014 — Clientes básicos y asociación inmutable a venta

## Resultado

**BACKEND IMPLEMENTADO / FRONTEND PENDIENTE**

Backend completo para HU-014. Frontend productivo fuera de alcance de este change.

## Reglas implementadas

Ver `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/spec.md` y `design.md` para reglas normativas congeladas de HU-014.

## Seguridad

Autorización server-side. Ver `verify-report.md` y matriz de `Program.cs`. Row-level scope aplicado antes de filtros/paginación donde corresponde. Multi-role = unión.

## Backend / contrato

### Endpoints

- `GET /api/v1/customers?page=&pageSize=&search=&isActive=` → `PagedResponse<CustomerDto>` busca por Name/Ci/Nit
- `GET /api/v1/customers/{id}` → `CustomerDto`
- `POST /api/v1/customers` + `PUT /api/v1/customers/{id}` → `CustomerDto` (trim, Ci requerido, Nit null→null)
- `POST /api/v1/customers/{id}/activate` / `deactivate` → 204
- Extensión aditiva: `POST /api/v1/sales` acepta `customerId?: guid|null` y persiste `CustomerName/Ci/NitSnapshot` inmutable

### DTOs / snapshots

Ver `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` y contratos específicos de la HU.

## Baseline revalidado

Branch `develop` HEAD `ec708a37a7f0627fc0ac54690c89cec7f2b061eb`. Working tree con 4 migrations Sprint 3 aplicadas (`dotnet ef database update` PASS, `has-pending-model-changes` clean). `dotnet build -c Release` PASS.

## Evidencia real

- `dotnet test backend/RestaurantSystem.slnx` → 100/100 PASS (1 Domain + 18 Application + 81 Integration)
- `curl http://localhost:5057/openapi/v1.json` → 200 (289K) con paths HU-014 presentes
- `pnpm --dir frontend run api:generate` → 179K (openapi-typescript 7.13.0)
- `pnpm --dir frontend run build` → PASS (1952 modules) tras compatibilidad `GET /purchases` history

## Manifest de archivos del change

### Backend

| Archivo | Propósito |
| --- | --- |
| `backend/src/RestaurantSystem.Domain/Customers/Customer.cs` | Name/Ci/Nit/Notes/IsActive/audit |
| `backend/src/RestaurantSystem.Domain/Operations/OperationalEntities.cs` | Sale CustomerId + snapshots |
| `backend/src/RestaurantSystem.Infrastructure/ApplicationDbContext.cs` | UX_customers_ci + UX_customers_nit_not_null |
| `backend/src/RestaurantSystem.Infrastructure/Migrations/20260831112258_AddCustomerSaleSnapshots.cs` |  |
| `backend/src/RestaurantSystem.Infrastructure/Migrations/20260831112258_AddCustomerSaleSnapshots.Designer.cs` |  |
| `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` | CustomerRequest/CustomerDto + ConfirmSaleRequest.customerId |
| `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs` | CustomersAsync, CustomerAsync, Create/Update/SetActive + ConfirmSale snapshot |
| `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs` | /api/v1/customers (GET, POST, PUT, /activate, /deactivate) + POST /api/v1/sales con customerId |
| `backend/src/RestaurantSystem.Api/Program.cs` | Policies CustomerRead/CustomerWrite/CustomerStatusManage |
| `backend/tests/RestaurantSystem.IntegrationTests/CustomerLifecyclePostgresIntegrationTests.cs` | CI/NIT uniqueness, inactive retained |

### Frontend y contrato generado

| Archivo | Propósito |
| --- | --- |
| `frontend/src/types/api.generated.ts` | Cliente generado desde OpenAPI runtime (179K), regenerado contra `http://localhost:5057/openapi/v1.json`, sin edición manual |
| `frontend/src/features/purchases/pages.tsx` | Compatibilidad: mantiene `GET /purchases` (PurchaseDto) + nuevo `GET /purchases/history` (PurchaseHistoryDto) |

### Documentación

| Archivo | Propósito |
| --- | --- |
| `docs/historias/HU-014-sprint3-backend.md` | Esta HU (backend completo, endpoints + manifest) |
| `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/` | Change archivado (proposal/design/spec/tasks/apply-progress/verify-report) |

## Evidencias

Backend-only HU: evidencia es `apply-progress.md` + `verify-report.md` + OpenAPI runtime. No se requieren screenshots frontend para este APPLY.

## Estado de entrega

`HU_014_BACKEND_COMPLETE: YES` — `HU_014_FRONTEND_COMPLETE: YES` (frontend verificado en `implement-sprint-3-frontend-customers-and-sales-history`)

## Frontend Sprint 3 — estado verificado

**FRONTEND IMPLEMENTADO Y VERIFICADO AUTOMÁTICAMENTE.** La implementación pertenece al change `implement-sprint-3-frontend-customers-and-sales-history`. Este registro no cambia ni vuelve a atribuir el backend de esta HU.

### Alcance implementado

- Ruta protegida y navegación de `Clientes` para ADMINISTRADOR, ENCARGADO y MESERO; las acciones de activar/desactivar quedan limitadas a ADMINISTRADOR y ENCARGADO.
- Gestión de clientes con búsqueda y paginación server-side, filtro de estado, create/edit, estados de carga/error/vacío y representación tabla desktop / cards mobile.
- `CustomerForm` reutilizado tanto por gestión como por quick-create en ConfirmSale: Name y CI requeridos; NIT y Notes opcionales; normalización trim y feedback de conflicto CI/NIT.
- ConfirmSale acepta `customerId` nullable; `Consumidor final` se representa con ausencia de Customer. El selector usa clientes activos y el quick-create selecciona el recurso retornado sin abandonar el flujo.

### Manifest de implementación — HU-014

| Estado | Paths existentes | Evidencia / propósito |
| --- | --- | --- |
| IMPLEMENTED | `frontend/src/features/customers/api.ts` | Adapter y queries/mutations Customer tipados a partir de `api.generated.ts`. |
| IMPLEMENTED | `frontend/src/features/customers/CustomerForm.tsx` | Formulario reutilizable de gestión y quick-create. |
| IMPLEMENTED | `frontend/src/features/customers/CustomersPage.tsx` | Gestión responsive de Customers y acciones de lifecycle por rol. |
| IMPLEMENTED | `frontend/src/features/sales/pages.tsx` | Extensión aditiva de ConfirmSale: selector, Consumidor final y quick-create. |
| SHARED IMPLEMENTED | `frontend/src/routes/AppRoutes.tsx`; `frontend/src/features/navigation.tsx` | Ruta `/clientes`, guard y navegación compartida. |
| TESTED | `frontend/src/features/customers/api.test.ts`; `frontend/src/features/customers/CustomerForm.test.tsx`; `frontend/src/features/customers/CustomersPage.test.tsx`; `frontend/src/features/sales/checkout.test.tsx`; `frontend/src/features/sales/pages.test.tsx`; `frontend/src/routes/AppRoutes.test.tsx`; `frontend/src/features/navigation.test.ts` | Cobertura de adapter/form/página, quick-create y regresión de ConfirmSale, rutas y navegación. |
| REUSED / UNCHANGED | `backend/` | Backend de HU-014 reutilizado; no hay cambio backend atribuido a este frontend change. |
| UNCHANGED | `frontend/src/types/api.generated.ts` | Contrato generado consumido; no se regeneró ni editó manualmente. |

### Evidencia disponible

El `verify-report.md` del change registra que, desde `frontend/`, pasaron `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test` (28 archivos / 138 tests / 0 failed) y `pnpm run build`. También registra que no se ejecutó `api:generate` y que la inspección de diff no encontró cambios en backend, OpenAPI ni `api.generated.ts`.

La validación manual de navegador/responsive (~360 px, ~768 px y ~1280 px) sigue **pendiente**. No hay screenshots ni resultado manual que declarar.
