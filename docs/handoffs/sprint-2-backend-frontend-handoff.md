# Sprint 2 backend → frontend handoff

Frontend Sprint 2 is pending. All routes are under `/api/v1`, require Bearer auth, and derive business actors server-side. Do not send totals, price snapshots, inventory deltas, actor IDs, or Sale Shift IDs.

| HU | Capability | Routes | Primary roles / contract notes |
|---|---|---|---|
| HU-004 | Composition | `GET/PUT /products/{id}/composition` | GET CatalogRead; PUT CatalogWrite. Full replacement of `{componentProductId, quantityPerOutputUnit, unitId}`; no inventory movement. |
| HU-006 | Minimum stock | `PUT /products/{id}/minimum-stock`; existing `GET /inventory/balances` | Manager/admin update; inventory-read roles query balances. `minStock: null` clears; `isLowStock` is derived. |
| HU-007 | Production | `GET /products/{id}/production-requirements?quantity=`; `POST /productions` | Kitchen/manager/admin. `{productId, quantityProduced, notes?}`. The preview is non-authoritative; confirmation re-evaluates stock. 409 shortage is backend authority. |
| HU-012 | Sale | `POST /sales` | Waiter/manager/admin. `{orderId, salesChannel, paymentMethod, acknowledgeStockShortage?}` only; Order must be ENTREGADO; values come from Order snapshots and Shift is resolved server-side. |
| HU-013 | Sale shortage | `POST /sales` | First shortage response is 409 ProblemDetails with `code` and `shortages`; retry only with `acknowledgeStockShortage: true`; never echo client-calculated shortages. |
| HU-017 | Purchase | `POST /purchases`; `GET /purchases`; `GET /purchases/{id}`; `POST /purchases/{id}/cancel` | POST/cancel/receive are ADMINISTRADOR, ENCARGADO or COCINA only; supplier reads retain their existing read policy. One-or-more `{productId, quantity, unitId, unitCost}` lines must use active dimension-compatible units. Total is server-derived. Kitchen scope needs textual `receiptReference`; cancellation needs nonblank `reason`. |
| HU-018 | Receive purchase | `POST /purchases/{id}/receive` | Submit every PurchaseItem exactly once: `{lines:[{purchaseItemId, receivedQuantity, unitId}], notes?}`. Ordered and received quantities are distinct. No partial receipt. |
| HU-025 | Operational shifts | `POST /shifts/open`; `GET /shifts/current`; `GET /shifts/me/current`; `PUT /shifts/{id}/assignments`; `POST /shifts/{id}/handover` | Admin/manager mutate and read the operational context; MESERO can read only their assigned current shift. Opening creates shared CashSession with fixed MORNING/NIGHT shifts; handover locks its CashSession and does not close cash. |

## Error handling

Use RFC ProblemDetails. Validation errors are 400; unauthenticated 401; authorization failure 403; missing resources 404; operational conflicts 409. Render `code` and, for sales shortages, the `shortages` list. Do not parse raw database messages.

## Transaction and concurrency semantics

Production, sale, reception and handover are transactional. Inventory remains the sole balance/ledger authority; movements carry Production, Sale, or Purchase references. A sale retry for an already-confirmed Order and a second receipt are conflicts, not success states.

## Evidence refreshed

`OperationsContractPostgresIntegrationTests` exercised PostgreSQL-backed authorization for anonymous/accountant/waiter mutation attempts and asserted generated OpenAPI response metadata, including the sale shortage `application/problem+json` 409 response. The full backend suite passed 53/53 after the all-route authorization matrix was added.

## Frontend work boundary

No frontend implementation, generated types, screenshots, or captures are part of this backend change. Confirm the live OpenAPI schema before generating frontend client types in a separate frontend work unit.
