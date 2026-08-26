# HU-010 — Comandas de cocina

**Backend: complete. Frontend: pending. End-to-end: pending.**

A command is generated only for KITCHEN order lines. It contains no financial fields. Start and ready synchronize Order and KitchenCommand in one PostgreSQL transaction using Order → KitchenCommand row locking. SignalR is an after-commit notification at `/hubs/kitchen`; REST remains authoritative.

| Method | Route | Roles | Purpose | Response | Mapping / handler |
|---|---|---|---|---|---|
| GET | `/api/v1/kitchen/commands` | COCINA, MESERO, ENCARGADO, ADMINISTRADOR | List commands | `PagedResponse<KitchenCommandDto>` | `Program.cs` / `KitchenCommandService` |
| GET | `/api/v1/kitchen/commands/{id}` | Same | Detail | `KitchenCommandDto` | `Program.cs` / `KitchenCommandService` |
| POST | `/api/v1/kitchen/commands/{id}/start` | COCINA, ENCARGADO, ADMINISTRADOR | Start preparation | `KitchenCommandDto` | `Program.cs` / `KitchenCommandService` |
| POST | `/api/v1/kitchen/commands/{id}/ready` | COCINA, ENCARGADO, ADMINISTRADOR | Mark ready | `KitchenCommandDto` | `Program.cs` / `KitchenCommandService` |

Events: `KitchenCommandCreated`, `KitchenCommandUpdated`, and `KitchenCommandCancelled`; payload only includes command id, order id, status and occurred-at.
