# HU-010 — Comandas de cocina

**Backend: complete. Frontend implementation: complete pending human visual validation. Automated validation: complete. End-to-end: pending manual validation.**

A command is generated only for KITCHEN order lines. It contains no financial fields. Start and ready synchronize Order and KitchenCommand in one PostgreSQL transaction using Order → KitchenCommand row locking. SignalR is an after-commit notification at `/hubs/kitchen`; REST remains authoritative.

| Method | Route | Roles | Purpose | Response | Mapping / handler |
|---|---|---|---|---|---|
| GET | `/api/v1/kitchen/commands` | COCINA, MESERO, ENCARGADO, ADMINISTRADOR | List commands | `PagedResponse<KitchenCommandDto>` | `Program.cs` / `KitchenCommandService` |
| GET | `/api/v1/kitchen/commands/{id}` | Same | Detail | `KitchenCommandDto` | `Program.cs` / `KitchenCommandService` |
| POST | `/api/v1/kitchen/commands/{id}/start` | COCINA, ENCARGADO, ADMINISTRADOR | Start preparation | `KitchenCommandDto` | `Program.cs` / `KitchenCommandService` |
| POST | `/api/v1/kitchen/commands/{id}/ready` | COCINA, ENCARGADO, ADMINISTRADOR | Mark ready | `KitchenCommandDto` | `Program.cs` / `KitchenCommandService` |

Events: `KitchenCommandCreated`, `KitchenCommandUpdated`, and `KitchenCommandCancelled`; payload only includes command id, order id, status and occurred-at.

## Frontend consumption

`/cocina` renders PENDIENTE, EN_PREPARACION and LISTA as desktop columns and mobile tabs. COCINA, ENCARGADO and ADMINISTRADOR receive only permitted operational controls; MESERO has a read-only board. One SignalR owner uses the memory-only session token, exposes real lifecycle status, invalidates Orders/Kitchen after backend events and uses 30-second REST fallback only while unhealthy. Elapsed timers are local `Date.now()` ticks, never polling. Manual responsive/runtime verification remains pending Alex.
