# HU-011 — Cancelar pedido

**Backend: complete. Frontend implementation: complete pending human visual validation. Automated validation: complete. End-to-end: pending manual validation.**

Cancellation is allowed only from `PENDIENTE` and `EN_PREPARACION`. Order cancellation atomically cancels its active KitchenCommand; Kitchen cancellation atomically cancels its Order. Retried authorized cancellation preserves the original actor, reason and timestamps. `LISTO` and `ENTREGADO` are conflicts.

| Method | Route | Roles | Purpose | Response | Mapping / handler |
|---|---|---|---|---|---|
| POST | `/api/v1/orders/{id}/cancel` | Own MESERO, ENCARGADO, ADMINISTRADOR | Cancel order/pair | `OrderDto` | `Program.cs` / `OrderService` |
| POST | `/api/v1/kitchen/commands/{id}/cancel` | COCINA, ENCARGADO, ADMINISTRADOR | Cancel command/pair | `KitchenCommandDto` | `Program.cs` / `KitchenCommandService` |

The server derives cancellation actors from authentication. Client-supplied actor, waiter, status, price or total fields are rejected. Frontend cancellation uses optional bounded reasons and authoritative query invalidation after success or conflict; it never sends actor, waiter, status, price, or total. Manual visual/runtime evidence remains pending Alex.
