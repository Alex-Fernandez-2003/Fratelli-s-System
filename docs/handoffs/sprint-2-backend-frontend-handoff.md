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

## Contract stabilization evidence — 2026-08-28

The runtime Development OpenAPI document was obtained from `http://127.0.0.1:5058/openapi/v1.json` after the backend Release build and test suite completed. It exposes 50 paths, retains `/api/v1/purchases`, and adds nullable `PurchaseLineDto.receivedUnitId`; `unitId` remains the ordered unit and pending lines serialize both received fields as `null`.

`OPENAPI_SCHEMA_URL=http://127.0.0.1:5058/openapi/v1.json pnpm run api:generate` regenerated `frontend/src/types/api.generated.ts` through the repository script (no manual generated-file edits). The generated contract contains `receivedUnitId: null | string`.

Validation executed after generation: `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test` (14 files, 49 tests), and `pnpm run build`; all completed successfully. The local frontend has no HU-004, HU-007, or HU-017 feature consumer files, so no manual frontend source adaptation was made.

## Regression refresh

PostgreSQL regressions now freeze HU-007 output scaling (150 g × 4 = 600 g converted to 0.6 kg; 0.25 l × 4 = 1000 ml), atomic shortage blocking/output balance behavior, current-business-day Shift association for current/me/Sale/Expense, and the HU-013 post-precheck locked-shortage race. `dotnet build backend/RestaurantSystem.slnx -c Release` and `dotnet test backend/RestaurantSystem.slnx -c Release --no-build` passed afterward (Domain 1/1, Application 1/1, Integration 55/55). Frontend gates were not repeated because this regression-only backend test change did not alter runtime OpenAPI or generated TypeScript.

## Frontend work boundary

This stabilization does not add or redesign Sprint 2 frontend features. Future HU consumers must use the generated OpenAPI contract.
