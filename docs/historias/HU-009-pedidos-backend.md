# HU-009 — Pedidos

**Backend: complete. Frontend: pending. End-to-end: pending.**

The backend exposes order creation, detail, listing, waiter assignment/claim and delivery. Prices are taken exclusively from active, sellable Products at creation and saved as item snapshots. Orders without KITCHEN lines start `LISTO`; KITCHEN orders start `PENDIENTE` with one command. `ShiftId` is nullable until a real shift lifecycle exists.

| Method | Route | Roles | Purpose | Response | Mapping / handler |
|---|---|---|---|---|---|
| POST | `/api/v1/orders` | MESERO, ENCARGADO, ADMINISTRADOR | Create | `OrderDto` 201 | `Program.cs` / `OrderService` |
| GET | `/api/v1/orders` | MESERO, ENCARGADO, ADMINISTRADOR | List | `PagedResponse<OrderDto>` | `Program.cs` / `OrderService` |
| GET | `/api/v1/orders/{id}` | MESERO, ENCARGADO, ADMINISTRADOR | Detail | `OrderDto` | `Program.cs` / `OrderService` |
| PUT | `/api/v1/orders/{id}/assignment` | ADMINISTRADOR | Assign/reassign waiter | `OrderDto` | `Program.cs` / `OrderService` |
| POST | `/api/v1/orders/{id}/take` | MESERO | Claim unassigned non-terminal order | `OrderDto` | `Program.cs` / `OrderService` |
| POST | `/api/v1/orders/{id}/deliver` | Own MESERO, ENCARGADO, ADMINISTRADOR | Deliver ready order | `OrderDto` | `Program.cs` / `OrderService` |

No Sale, Customer relation, inventory movement, Order editing, or frontend/types generation is included.
