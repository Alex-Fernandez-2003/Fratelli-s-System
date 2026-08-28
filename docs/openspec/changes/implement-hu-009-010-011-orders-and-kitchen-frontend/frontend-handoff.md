# HU-009/HU-010/HU-011 frontend handoff

## Validation status

Backend is complete. Frontend implementation and automated validation are complete; browser, responsive, and live-runtime validation remains human-owned.

## HTTP consumption

| Capability | Method / route | Roles | API / consumer |
|---|---|---|---|
| List orders | `GET /api/v1/orders` | MESERO, ENCARGADO, ADMINISTRADOR | `features/orders/api.ts` / `OrdersPage` |
| Detail | `GET /api/v1/orders/{id}` | MESERO, ENCARGADO, ADMINISTRADOR | `features/orders/api.ts` / `OrderDetailPage` |
| Create | `POST /api/v1/orders` | MESERO, ENCARGADO, ADMINISTRADOR | `useCreateOrder` / `NewOrderPage` |
| Assign | `PUT /api/v1/orders/{id}/assignment` | ADMINISTRADOR | `useAssignOrder` / assignment dialog |
| Take | `POST /api/v1/orders/{id}/take` | MESERO | `useTakeOrder` / list |
| Deliver | `POST /api/v1/orders/{id}/deliver` | Own MESERO, ENCARGADO, ADMINISTRADOR | `useDeliverOrder` / detail |
| Cancel order | `POST /api/v1/orders/{id}/cancel` | Own MESERO, ENCARGADO, ADMINISTRADOR | `useCancelOrder` / detail |
| Kitchen lists | `GET /api/v1/kitchen/commands` | COCINA, MESERO, ENCARGADO, ADMINISTRADOR | `useCommands` / KDS |
| Start / ready / cancel | kitchen command action routes | COCINA, ENCARGADO, ADMINISTRADOR | `features/kitchen/api.ts` / KDS |

## Realtime

Hub: `/hubs/kitchen`. A single owner uses the existing in-memory session coordinator through SignalR `accessTokenFactory`. `KitchenCommandCreated`, `KitchenCommandUpdated`, and `KitchenCommandCancelled` invalidate Kitchen and Orders query roots. Reconnect performs one REST-authoritative invalidation. The badge exposes `connecting`, `connected`, `reconnecting`, or `disconnected`; operational mounted queries poll only while the connection is unhealthy, at 30 seconds. `ElapsedTime` uses local one-second `Date.now()` rendering and never refetches data.

## Changed-file manifest

| Group | Paths | Purpose |
|---|---|---|
| Generated contract | `frontend/src/types/api.generated.ts` | Generated OpenAPI Orders/Kitchen contracts. |
| Shared API | `frontend/src/lib/api/endpoints.ts` | Contractual Orders and Kitchen routes. |
| Routes/navigation | `frontend/src/routes/AppRoutes.tsx`, `frontend/src/features/navigation.tsx`, `frontend/src/main.tsx` | Role-gated entry points and realtime owner. |
| Orders | `frontend/src/features/orders/api.ts`, `pages.tsx`, `api.test.ts` | Query/mutation boundaries, list/create/detail/actions and assignment. |
| Kitchen | `frontend/src/features/kitchen/api.ts`, `pages.tsx`, `realtime.tsx`, `ElapsedTime.tsx`, `ElapsedTime.test.tsx` | KDS, mutations, shared hub lifecycle, fallback and local timer. |
| Documentation | `docs/historias/HU-009-pedidos-backend.md`, `HU-010-comandas-cocina-backend.md`, `HU-011-cancelar-pedido-backend.md` | Frontend/backend traceability and manual-validation status. |

No backend business file changed for this frontend objective.

## Manual validation checklist

Validate Orders, New Order, Detail, Assignment, Take, Cancel, Deliver, and KDS at desktop, 403px, and 360px. Exercise COCINA operation and MESERO read-only KDS, realtime reconnect badge/poll fallback, and real 409 conflict presentation. No commit, VERIFY, or ARCHIVE is part of this change.
