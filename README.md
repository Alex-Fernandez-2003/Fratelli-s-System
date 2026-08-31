<p align="center">
  <img src="docs/images/fratelli-logo.png" alt="Logo de Fratelli" width="180" />
</p>

<h1 align="center">Restaurant System — Fratelli</h1>

<p align="center">Sistema web responsive para la gestión operativa y administrativa del restaurante Fratelli.</p>

## Estado actual

- **Sprint 0:** base técnica completada (sin historias de negocio).
- **Sprint 1:** integración de 10 historias, con sus límites de validación manual documentados.
- **Sprint 2:** **COMPLETO — 8/8 historias y 41 Story Points**.

Este estado no declara completado el proyecto, el MVP ni una entrega final. La revisión de Sprint y la aceptación de Product Owner solo se afirman cuando exista evidencia documental.

## Módulos implementados

- Autenticación, usuarios y roles múltiples.
- Catálogo y productos; composición y producción.
- Inventario: saldos, movimientos y notificaciones de stock bajo.
- Pedidos, cocina, ventas, compras y recepción.
- Turnos y caja compartida.
- Proveedores, gastos y asistencia.

### Roles

`ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA` y `EMPLEADO`.

## Arquitectura y stack

El backend es un **monolito modular** con **Clean Architecture** (Domain, Application, Infrastructure y API). El frontend combina **Atomic Design** para componentes reutilizables con módulos por funcionalidad en `features/`.

| Capa | Tecnología |
| --- | --- |
| Backend | .NET `net10.0` / Web API, EF Core, Npgsql, PostgreSQL, Identity, JWT, SignalR y OpenAPI |
| Frontend | React `19.2.8`, TypeScript `~5.7.3`, Vite `8.2.0`, Tailwind `4.3.3`, React Router `7.18.2`, TanStack Query `5.101.4` y Vitest `4.1.11` |

OpenAPI es el contrato entre capas. `frontend/src/types/api.generated.ts` se genera desde ese contrato y **no se edita manualmente**.

## Ejecución local

Requiere .NET 10 SDK, PostgreSQL, Node.js `>=20.19.0` y pnpm `11.18.0`.

### Backend

```bash
cd backend
dotnet restore RestaurantSystem.slnx
dotnet build RestaurantSystem.slnx
dotnet run --project src/RestaurantSystem.Api
```

API: `http://localhost:5057`.

### Migraciones

```bash
cd backend
dotnet ef database update --project src/RestaurantSystem.Infrastructure --startup-project src/RestaurantSystem.Api --no-build
```

### Frontend

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm run dev
```

Frontend: `http://localhost:8087`. El proxy de Vite dirige `/api`, `/health` y WebSocket en `/hubs` a `API_PROXY_TARGET` o a la API en el puerto `5057`.

### Contrato OpenAPI

Con el backend iniciado en Development:

```bash
cd frontend
pnpm run api:generate
```

La fuente es `OPENAPI_SCHEMA_URL` o `http://localhost:5057/openapi/v1.json`; el destino generado es `src/types/api.generated.ts`. Swagger/OpenAPI se exponen solo en Development.

## Calidad frontend

```bash
pnpm run format:check
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

## Documentación

- [Ficha del proyecto](docs/00-ficha-proyecto.md)
- [Arquitectura](docs/10-arquitectura.md)
- [Requisitos](docs/requirements/requisitos-funcionales.md)
- [Historias ejecutadas](docs/historias/README.md)
- [Pruebas y validación](docs/13-pruebas-y-validacion.md)
- [Sprint 0](docs/sprints/sprint-00.md), [Sprint 1](docs/sprints/sprint-01.md) y [retrospectiva Sprint 1](docs/sprints/sprint-01-retrospectiva.md)
- [Sprint 2](docs/sprints/sprint-02.md) y [retrospectiva Sprint 2](docs/sprints/sprint-02-retrospectiva.md)
- [Diagramas editables](docs/puml/) y [OpenSpec](docs/openspec/README.md)

## Mejoras identificadas post-MVP

**No implementadas:** integración de una tableta digitalizadora o pad de firma para el comprobante de compra y refinamientos de UI/UX.

## Equipo

- Alex Saúl Fernandez Valdez — Scrum Master
- Ana Paola Viscarra Chambi — Product Owner
- Miguel Angel Colque Calizaya
- Josué Matias Arroyo Reynoso
