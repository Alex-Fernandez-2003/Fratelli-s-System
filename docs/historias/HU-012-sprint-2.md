# HU-012 — Sprint 2 operational workflow

## Resultado

**BACKEND IMPLEMENTADO / FRONTEND PENDIENTE**.

La implementación backend pertenece al change `implement-sprint-2-backend-operational-workflows`. No se modificó frontend ni se generaron contratos TypeScript.

## Reglas implementadas

Ver el mapa contractual específico de esta HU en [handoff Sprint 2](../handoffs/sprint-2-backend-frontend-handoff.md). Las reglas de negocio, actor autenticado, importes/cantidades calculadas en servidor e inventario único se mantienen en backend.

## Seguridad

Las rutas requieren autenticación y políticas backend; los identificadores de actor se obtienen de los claims, no del request.

## Frontend y validación

Frontend Sprint 2: **PENDIENTE**. No hay capturas ni cambios de `frontend/` en este change.

## Baseline revalidado

- Branch/HEAD: `develop` / `8a8e3f6a82356020edd7a8b0d0508e259c68c287`.
- Docker/Testcontainers disponible durante la validación final.

## Evidencia real

- `dotnet restore RestaurantSystem.slnx`: PASS.
- `dotnet build RestaurantSystem.slnx --no-restore`: PASS.
- `dotnet test RestaurantSystem.slnx --no-build`: PASS, 43/43 (incluye OperationsContractPostgresIntegrationTests).
- La cadena EF se ejercitó sobre PostgreSQL disposable por la suite de integración; el script idempotente se generó correctamente.
- `/openapi/v1.json` se sirvió en runtime y contiene las rutas Sprint 2 aplicables y las respuestas explícitas 400/401/403/404/409 de las mutaciones relevantes.

## Manifest de archivos del change

### Backend

- `backend/src/RestaurantSystem.Domain/Operations/OperationalEntities.cs`
- `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs`
- `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs`
- `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs`
- `backend/src/RestaurantSystem.Infrastructure/Migrations/20260828093655_AddSprint2OperationalWorkflows.cs`

### Frontend y contrato generado

Ninguno.

### Documentación

- `docs/historias/HU-012-sprint-2-backend.md`
- `docs/handoffs/sprint-2-backend-frontend-handoff.md`

## Evidencias

No se incorporaron screenshots ni capturas.

## Estado de entrega

**BACKEND IMPLEMENTADO / FRONTEND PENDIENTE**. La verificación SDD y el archive no se ejecutaron.

### Revalidación posterior

El 2026-08-28 se revalidaron `dotnet restore`, `dotnet build`, la suite backend completa (53/53, 0 fallos), la cadena de migraciones PostgreSQL y OpenAPI. La matriz PostgreSQL de autorización cubre cada ruta Sprint 2 para anónimo y los seis roles; no se modificó frontend, contratos generados ni capturas.
