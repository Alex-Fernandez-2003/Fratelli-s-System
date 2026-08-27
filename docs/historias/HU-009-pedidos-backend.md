# HU-009 — Pedidos

**Backend: complete. Frontend implementation: complete pending human visual validation. Automated validation: complete. End-to-end: pending manual validation.**

The backend exposes order creation, detail, listing, waiter assignment/claim and delivery. Prices are taken exclusively from active, sellable Products at creation and saved as item snapshots. Orders without KITCHEN lines start `LISTO`; KITCHEN orders start `PENDIENTE` with one command. `ShiftId` is nullable until a real shift lifecycle exists.

| Method | Route | Roles | Purpose | Response | Mapping / handler |
|---|---|---|---|---|---|
| POST | `/api/v1/orders` | MESERO, ENCARGADO, ADMINISTRADOR | Create | `OrderDto` 201 | `Program.cs` / `OrderService` |
| GET | `/api/v1/orders` | MESERO, ENCARGADO, ADMINISTRADOR | List | `PagedResponse<OrderDto>` | `Program.cs` / `OrderService` |
| GET | `/api/v1/orders/{id}` | MESERO, ENCARGADO, ADMINISTRADOR | Detail | `OrderDto` | `Program.cs` / `OrderService` |
| PUT | `/api/v1/orders/{id}/assignment` | ADMINISTRADOR | Assign/reassign waiter | `OrderDto` | `Program.cs` / `OrderService` |
| POST | `/api/v1/orders/{id}/take` | MESERO | Claim unassigned non-terminal order | `OrderDto` | `Program.cs` / `OrderService` |
| POST | `/api/v1/orders/{id}/deliver` | Own MESERO, ENCARGADO, ADMINISTRADOR | Deliver ready order | `OrderDto` | `Program.cs` / `OrderService` |

No Sale, Customer relation, inventory movement, or Order editing is included.

## Frontend consumption

`/pedidos`, `/pedidos/nuevo`, and `/pedidos/{id}` consume the generated OpenAPI contract through the shared HTTP client and TanStack Query. ADMINISTRADOR assigns/reassigns using a paginated MESERO/active Users query and the real `employeeId`; MESERO can take unassigned non-terminal orders, while Deliver/Cancel follow ownership and global role rules. Query invalidation, rather than optimistic business-state patches, restores REST authority after mutations, conflicts, and kitchen events. See the frontend change handoff for the endpoint and SignalR tables. Manual responsive and live-runtime validation remains pending Alex.
