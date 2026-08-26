# Backend implementation handoff

## Status

HU-009, HU-010 and HU-011 are **BACKEND COMPLETE / FRONTEND PENDING / END-TO-END PENDING**. Frontend, generated TypeScript and visual evidence are **PENDING — next change**.

PostgreSQL evidence covers creation/lifecycle, notifier failure after commit, hub authorization, migration schema, waiter take race, ready/cancel race, start/cancel race and double delivery. Full backend regression: 42 passing tests (40 integration, 1 application, 1 domain).

## Endpoint matrix

| Method | Route | Roles | Purpose | Main response | API mapping | Handler |
|---|---|---|---|---|---|---|
| POST | `/api/v1/orders` | MESERO, ENCARGADO, ADMINISTRADOR | Create order | 201 `OrderDto` | `Program.cs` | `OrderService` |
| GET | `/api/v1/orders` | MESERO, ENCARGADO, ADMINISTRADOR | List | `PagedResponse<OrderDto>` | `Program.cs` | `OrderService` |
| GET | `/api/v1/orders/{id}` | MESERO, ENCARGADO, ADMINISTRADOR | Detail | `OrderDto` | `Program.cs` | `OrderService` |
| PUT | `/api/v1/orders/{id}/assignment` | ADMINISTRADOR | Assign waiter | `OrderDto` | `Program.cs` | `OrderService` |
| POST | `/api/v1/orders/{id}/take` | MESERO | Claim | `OrderDto` | `Program.cs` | `OrderService` |
| POST | `/api/v1/orders/{id}/deliver` | Own MESERO, ENCARGADO, ADMINISTRADOR | Deliver | `OrderDto` | `Program.cs` | `OrderService` |
| POST | `/api/v1/orders/{id}/cancel` | Own MESERO, ENCARGADO, ADMINISTRADOR | Cancel pair | `OrderDto` | `Program.cs` | `OrderService` |
| GET | `/api/v1/kitchen/commands` | COCINA, MESERO, ENCARGADO, ADMINISTRADOR | List | `PagedResponse<KitchenCommandDto>` | `Program.cs` | `KitchenCommandService` |
| GET | `/api/v1/kitchen/commands/{id}` | Same | Detail | `KitchenCommandDto` | `Program.cs` | `KitchenCommandService` |
| POST | `/api/v1/kitchen/commands/{id}/start` | COCINA, ENCARGADO, ADMINISTRADOR | Start | `KitchenCommandDto` | `Program.cs` | `KitchenCommandService` |
| POST | `/api/v1/kitchen/commands/{id}/ready` | COCINA, ENCARGADO, ADMINISTRADOR | Ready | `KitchenCommandDto` | `Program.cs` | `KitchenCommandService` |
| POST | `/api/v1/kitchen/commands/{id}/cancel` | COCINA, ENCARGADO, ADMINISTRADOR | Cancel pair | `KitchenCommandDto` | `Program.cs` | `KitchenCommandService` |

## File manifest

### Domain

- `backend/src/RestaurantSystem.Domain/Orders/OrderEntities.cs` — Order/Kitchen aggregates and canonical state enums.
- `backend/src/RestaurantSystem.Domain/Catalog/CatalogEntities.cs` — additive `Product.IsSellable` capability.

### Application

- `backend/src/RestaurantSystem.Application/Orders/OrderContracts.cs` — safe HTTP contracts, DTOs, actor model, services and notifier port.
- `backend/src/RestaurantSystem.Application/Catalog/CatalogContracts.cs` — sellability field in catalog contracts.

### Infrastructure

- `backend/src/RestaurantSystem.Infrastructure/ApplicationDbContext.cs` — persistence mappings, checks, indexes and restrictions.
- `backend/src/RestaurantSystem.Infrastructure/Orders/OrderServices.cs` — transaction boundaries, PostgreSQL locks, state machines, projections and SignalR adapter.
- `backend/src/RestaurantSystem.Infrastructure/Catalog/CatalogService.cs` — catalog persistence of sellability.
- `backend/src/RestaurantSystem.Infrastructure/DependencyInjection.cs` — Orders/Kitchen registrations.
- `backend/src/RestaurantSystem.Infrastructure/Identity/AuthServices.cs` — Orders/Kitchen policy names.

### API

- `backend/src/RestaurantSystem.Api/Program.cs` — policies, REST surface and authenticated Kitchen hub route.

### Migrations

- `backend/src/RestaurantSystem.Infrastructure/Migrations/20260826163342_AddOrdersKitchenBackend.cs` — additive schema migration.
- `backend/src/RestaurantSystem.Infrastructure/Migrations/20260826163342_AddOrdersKitchenBackend.Designer.cs` — generated migration model.
- `backend/src/RestaurantSystem.Infrastructure/Migrations/ApplicationDbContextModelSnapshot.cs` — EF model snapshot.

### Tests

- `backend/tests/RestaurantSystem.IntegrationTests/OrdersKitchenPostgresIntegrationTests.cs` — PostgreSQL functional, race, notifier, hub, migration and OpenAPI coverage.

### Docs/OpenSpec

- `docs/openspec/changes/implement-hu-009-010-011-orders-and-kitchen-backend/tasks.md` — all completed backend tasks.
- `docs/openspec/changes/implement-hu-009-010-011-orders-and-kitchen-backend/backend-handoff.md` — endpoint table, evidence and manifest.
- `docs/historias/HU-009-pedidos-backend.md` — HU-009 backend handoff.
- `docs/historias/HU-010-comandas-cocina-backend.md` — HU-010 backend handoff.
- `docs/historias/HU-011-cancelar-pedido-backend.md` — HU-011 backend handoff.

No frontend files were changed.
