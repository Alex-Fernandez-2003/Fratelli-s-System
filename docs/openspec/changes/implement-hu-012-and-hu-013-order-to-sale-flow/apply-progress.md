# Apply progress — HU-012 / HU-013

## Status

Historical pre-closure snapshot. The current state is governed by the final documentation continuation below: 23/25 implementation tasks are visibly complete; desktop manual assets are now recorded; Tasks 21 and 25 remain unchecked only because no manual ~360 px responsive/accessibility session exists.

## Baseline and decisions

- Local baseline: `develop` at `185e8e3ae07c712e68d6de64c2de11c23b4a7018`; pre-existing worktree content was only the untracked OpenSpec change directory.
- Reused `CurrentShiftQuery.ActiveAsync`; no Shift resolver was reimplemented.
- Added a read-only inventory availability boundary. CreateOrder does not call the inventory writer and does not create movements.
- Existing routes remain `POST /api/v1/orders` and `POST /api/v1/sales`.
- Generated client was produced only through `pnpm run api:generate` against a locally started Release API at port 5058.

## Implemented work

- HU-013: additive Order acknowledgement request field, structured `code`/`shortages` conflict, read-only availability check, nullable actor/time audit fields and additive migration.
- HU-012: Sale final revalidation permits negative stock when the Order has an acknowledgement trace; Sale DTO exposes persisted channel/payment/time/actor fields.
- Frontend: Order shortage retry dialog, delivered-order Cobrar action and `/pedidos/:id/cobrar`, checkout channel/payment controls, exceptional Sale shortage dialog, and server-data sale success dialog.

## Files changed

- `backend/src/RestaurantSystem.Application/Inventory/InventoryContracts.cs`
- `backend/src/RestaurantSystem.Application/Orders/OrderContracts.cs`
- `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs`
- `backend/src/RestaurantSystem.Domain/Orders/OrderEntities.cs`
- `backend/src/RestaurantSystem.Infrastructure/ApplicationDbContext.cs`
- `backend/src/RestaurantSystem.Infrastructure/DependencyInjection.cs`
- `backend/src/RestaurantSystem.Infrastructure/Inventory/InventoryService.cs`
- `backend/src/RestaurantSystem.Infrastructure/Orders/OrderServices.cs`
- `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs`
- `backend/src/RestaurantSystem.Api/Program.cs`
- `backend/src/RestaurantSystem.Infrastructure/Migrations/*AddOrderStockShortageAcknowledgement*`
- `backend/tests/RestaurantSystem.IntegrationTests/OrdersKitchenPostgresIntegrationTests.cs`
- `frontend/src/features/orders/api.ts`
- `frontend/src/features/orders/pages.tsx`
- `frontend/src/features/sales/api.ts`
- `frontend/src/features/sales/pages.tsx`
- `frontend/src/lib/api/http-client.ts`
- `frontend/src/routes/AppRoutes.tsx`
- `frontend/src/types/api.generated.ts`

## Test and generation evidence

| Command                                                                                                                                                                                     | Result                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `dotnet build RestaurantSystem.slnx -c Release --no-restore`                                                                                                                                | PASS (warnings only)                                                                                    |
| `dotnet ef migrations add AddOrderStockShortageAcknowledgement --project src/RestaurantSystem.Infrastructure --startup-project src/RestaurantSystem.Api --configuration Release --no-build` | PASS                                                                                                    |
| `dotnet test RestaurantSystem.slnx -c Release --no-build`                                                                                                                                   | PASS: 58 tests, 0 failures                                                                              |
| `OPENAPI_SCHEMA_URL=http://localhost:5058/openapi/v1.json pnpm run api:generate`                                                                                                            | PASS; runtime-generated client                                                                          |
| `pnpm lint`                                                                                                                                                                                 | PASS                                                                                                    |
| `pnpm typecheck`                                                                                                                                                                            | PASS                                                                                                    |
| `pnpm test`                                                                                                                                                                                 | PASS: 68 tests, 0 failures                                                                              |
| `pnpm build`                                                                                                                                                                                | PASS                                                                                                    |
| `pnpm format:check`                                                                                                                                                                         | FAIL due to pre-existing formatting debt plus changed files; changed files were formatted individually. |

## Deferred findings

- `DEFERRED_SPRINT_2_FINAL_AUDIT_FINDING`: repository-wide `pnpm format:check` reports pre-existing formatting issues outside this change. They were not modified.
- Dedicated HU-012/HU-013 integration/UI scenario tests and per-task evidence remain required; do not treat the existing suite’s green result as proof of every acceptance scenario.

## Remaining tasks

All task checkboxes remain unchecked pending the missing dedicated evidence: Tasks 1 through 25 in `tasks.md`.

## Workload / PR boundary

`size:exception` was explicitly authorized by the user (up to 1,300 changed lines). No branch, commit, push, checkout, merge, rebase, reset, restore, or clean was executed.

## Structured status consumed

- active change: `implement-hu-012-and-hu-013-order-to-sale-flow`
- artifact store: `openspec`
- apply state: `ready`
- action context: repo-local; authoritative workspace/allowed root `C:\dev\Fratelli-s-System`
- delivery authorization: `size:exception`

## Continuation evidence — 2026-08-30

### Completed evidence slice (not task-plan closure)

- Added `Hu013_order_shortage_matrix_is_read_only_revalidated_and_audited` to the PostgreSQL integration suite. It proves exact-boundary success, all-shortage conflict shape, no rejected Order/KitchenCommand/InventoryMovement persistence, retry revalidation after stock changed, acknowledgement actor/time, one retry Order, and no Order-time Inventory movement.
- The RED run exposed a scoped defect: `OrderError` discarded the service's structured `shortages`. `backend/src/RestaurantSystem.Api/Program.cs` now serializes both the stable `code` and `shortages`; routes and verbs are unchanged.
- Added `frontend/src/features/sales/pages.test.tsx` for the shared shortage dialog. It covers every shortage row, positive rendered magnitude, `Volver` without `Continuar`, and pending-state protection.
- Updated separate HU-012/HU-013 manifests with only the evidence above. No verification report was created because the full dedicated matrix remains incomplete.

### Commands and results

| Command                                                                                                                                     | Result                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `cd backend && dotnet test RestaurantSystem.slnx -c Release --filter FullyQualifiedName~OrdersKitchenPostgresIntegrationTests --no-restore` | PASS: 9 integration tests                                                                                              |
| `cd backend && dotnet test RestaurantSystem.slnx -c Release --no-restore`                                                                   | PASS: 59 total (57 integration, 2 unit), 0 failed                                                                      |
| `cd frontend && pnpm lint && pnpm typecheck && pnpm test && pnpm build`                                                                     | PASS; frontend tests 69/69                                                                                             |
| `cd frontend && pnpm exec prettier --check src/features/sales/pages.test.tsx`                                                               | PASS                                                                                                                   |
| `cd frontend && pnpm format:check`                                                                                                          | FAIL: 16 pre-existing files outside this scope; changed test passes focused Prettier check. `PREEXISTING_OUT_OF_SCOPE` |

### Migration validation

`20260830190630_AddOrderStockShortageAcknowledgement` is additive: it adds nullable `orders.stock_shortage_acknowledged_at` and nullable `orders.stock_shortage_acknowledged_by_user_id`, a non-destructive index, and a Restrict FK to `identity.AspNetUsers`. Existing Orders remain valid because both new columns are nullable. PostgreSQL disposable migration application is exercised by the passing integration suite. No migration was edited during this continuation.

### Remaining work / task state

No task checkbox was changed: the task plan has 25 unchecked rows and the newly added evidence does not satisfy every objective of any complete plan task. In particular, dedicated HU-012 Sale eligibility/payment/atomicity/preparation/current-shift tests, the sale-time newly-emerged-shortage retry test, and the end-to-end frontend checkout/New Order matrices are still required. `verify-report.md` was intentionally not created.

### Workload / boundary and status

- Workload: `size:exception` remains the inherited authorized boundary; no Git mutation was performed.
- Structured status consumed: active change `implement-hu-012-and-hu-013-order-to-sale-flow`; authoritative OpenSpec artifact root is `docs/openspec/changes/...`; `applyState: ready`; root `C:\dev\Fratelli-s-System`.
- Engram artifact lookups were initially unavailable, but the significant structured-shortage discovery was saved as Engram observation `549` under `sdd/implement-hu-012-and-hu-013-order-to-sale-flow/discovery-structured-shortages`.

## Final APPLY / validation continuation

### Completed task checkboxes

Tasks **1–20, 22–24** are now visibly marked `- [x]` in `tasks.md` (23/25). The completed evidence includes the dedicated PostgreSQL/Testcontainers Sale matrix, sale-time newly-emerged-shortage acknowledged retry, NewOrder/checkout behavioral coverage, migration fact audit, individual manifests, and `verify-report.md`.

### Tests and gates actually run

| Command                                                                                                                                             | Result                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `cd backend && dotnet test RestaurantSystem.slnx -c Release --filter FullyQualifiedName~OperationsConcurrencyPostgresIntegrationTests --no-restore` | PASS: 13 tests                                                            |
| `cd backend && dotnet test RestaurantSystem.slnx -c Release --no-restore`                                                                           | PASS: 59 tests, 0 failures                                                |
| `cd frontend && pnpm exec vitest run src/features/orders/pages.test.tsx src/features/sales/checkout.test.tsx`                                       | PASS: 3 tests                                                             |
| `cd frontend && pnpm test`                                                                                                                          | PASS: 18 files, 72 tests                                                  |
| `cd frontend && pnpm lint && pnpm typecheck && pnpm build`                                                                                          | PASS                                                                      |
| focused Prettier for HU files                                                                                                                       | PASS                                                                      |
| `cd frontend && pnpm format:check`                                                                                                                  | FAIL: exactly 16 pre-existing unrelated files; `PREEXISTING_OUT_OF_SCOPE` |

### Migration and compatibility audit

`20260830190630_AddOrderStockShortageAcknowledgement` adds only nullable `orders.stock_shortage_acknowledged_at` and nullable `orders.stock_shortage_acknowledged_by_user_id`, index `IX_orders_stock_shortage_acknowledged_by_user_id`, and Restrict FK to `identity.AspNetUsers(Id)`. PostgreSQL disposable integration migrations apply it. Routes/verbs remain `POST /api/v1/orders` and `POST /api/v1/sales`; runtime-generated TypeScript was not manually edited in this pass.

### Manual assets and remaining tasks

Only actual assets are `docs/capturas/HU-013-low-stock-modal.png` (two positive shortage rows) and `docs/capturas/HU-013-order-detail.png` (created Order detail). Neither proves checkout/HU-012. Therefore **Task 21** and **Task 25** remain unchecked:

- [ ] **Task 21: [SHARED] Validar responsive y accesibilidad contra las tres referencias** — desktop evidence is now documented; a manual ~360 px responsive/accessibility session is not evidenced.
- [ ] **Task 25: [SHARED] Ejecutar auditoría final de compatibilidad y scope** — blocked solely by Task 21/manual HU-012 evidence.

`verify-report.md` records the current evidence disposition. Existing OpenSpec history closes changes in place; no archive directory/command exists, so no archive or move was performed.

### Deviation / finding / action context

- `DEFERRED_SPRINT_2_FINAL_AUDIT_FINDING`: global frontend format remains blocked by 16 unrelated existing files; no out-of-scope formatting change was made.
- The Sale success callback now closes an outstanding shortage dialog before rendering the real success dialog; the dedicated checkout test exposed and verifies this scoped correction.
- Structured status consumed: active change `implement-hu-012-and-hu-013-order-to-sale-flow`; authoritative OpenSpec store; `applyState: ready`; workspace root `C:\dev\Fratelli-s-System`; parent retains attempt token. No Git mutation, receipt, review, verify lifecycle action, or archive action was performed.

## Focused HU-012 defect remediation — 2026-08-30

### Completed implementation evidence (not change closure)

- Added the smallest local-design `Confirmar venta` link to `OrderDetailPage` only when the real Order DTO has `status === 'ENTREGADO'`. Its href uses the returned Order UUID exactly: `/pedidos/{id}/cobrar`. No listing or global-navigation CTA was added.
- Added frontend behavioral coverage for visible real-id navigation at `ENTREGADO` and absence at `PENDIENTE`, `EN_PREPARACION`, `LISTO`, and `CANCELADO`.
- Reproduced the reported 409 through the real PostgreSQL/API boundary and classified it as **CASE A — a legitimate Sale-time shortage newly emerging after the delivered Order was created**, not a false conflict or acknowledgement-recognition defect. The existing checkout retry implementation was retained because it already meets the required safe flow.
- Endpoint evidence: `POST /api/v1/sales` with `{ orderId, salesChannel: 'DIRECT', paymentMethod: 'CASH', acknowledgeStockShortage: false }` for an `ENTREGADO` Order requiring 2 after inventory fell to 1 returns `409 application/problem+json`; `code` is `SALE_STOCK_CONFIRMATION_REQUIRED`; the sole shortage has `requiredQuantity: 2`, `currentQuantity: 1`, `shortageQuantity: 1`. At conflict, Order state is `ENTREGADO`, acknowledgement fields are null, Sale count is zero, and one Shift is `ACTIVE`. Retrying the exact request with explicit `acknowledgeStockShortage: true` returns 201 and persists acknowledgement, one Sale, and one `SALE` inventory movement.
- Inspected and tested `frontend/src/lib/api/http-client.ts`: the `HttpError` adapter preserves ProblemDetails `code` and `shortages`. Checkout recognizes only `SALE_STOCK_CONFIRMATION_REQUIRED`, opens the shared shortage dialog, makes no request on `Volver`, and sends the explicit acknowledgement only on `Continuar`.
- Preserved `docs/capturas/HU-012-sale-confirm.png` and all HU-013 assets. Updated only `docs/historias/HU-012-registrar-confirmar-venta.md` with factual remediation and evidence; it states the capture proves reachability only, not a completed Sale.

### Files changed in this remediation slice

- `frontend/src/features/orders/pages.tsx`
- `frontend/src/features/orders/pages.test.tsx`
- `frontend/src/lib/api/http-client.test.ts`
- `backend/tests/RestaurantSystem.IntegrationTests/OrdersKitchenPostgresIntegrationTests.cs`
- `docs/historias/HU-012-registrar-confirmar-venta.md`
- this cumulative `apply-progress.md`

### Commands and results

| Command                                                                                                                                       | Result                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `cd backend && dotnet test RestaurantSystem.slnx -c Release --filter FullyQualifiedName~OrdersKitchenPostgresIntegrationTests --no-restore`   | PASS: 10 integration tests, 0 failed (real PostgreSQL/Testcontainers API boundary) |
| `cd backend && dotnet build RestaurantSystem.slnx -c Release --no-restore`                                                                    | PASS; 0 errors; pre-existing SSH.NET vulnerability warning remains                 |
| `cd frontend && pnpm exec vitest run src/lib/api/http-client.test.ts src/features/orders/pages.test.tsx src/features/sales/checkout.test.tsx` | PASS: 13 tests, 0 failed                                                           |
| `cd frontend && pnpm test`                                                                                                                    | PASS: 18 files, 78 tests, 0 failed                                                 |
| `cd frontend && pnpm lint && pnpm typecheck && pnpm build`                                                                                    | PASS                                                                               |
| scoped frontend Prettier and `dotnet format ... --include OrdersKitchenPostgresIntegrationTests.cs`                                           | PASS; only the scoped files were formatted                                         |

### Task state / boundary / action context

- No task checkbox was changed: this remediation adds supported regression evidence to already-complete Tasks 16 and 20 but does not satisfy either outstanding manual Task 21 or final audit Task 25. Their exact unchecked rows remain unchanged.
- Workload boundary: delegated focused defect slice; no commit, attempt acquire/settle, review, receipt, verify, archive, OpenAPI generation, or Git mutation was performed. Parent retains the native attempt token.
- Structured native status consumed before editing: `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`, workspace root and allowed edit root `C:\dev\Fratelli-s-System`; no action-context warnings.

## Final documentation continuation — manual asset audit

### Current closure state

- Native status before this documentation-only slice: `artifactStore: openspec`, `applyState: ready`, `nextRecommended: apply`; `actionContext.mode: repo-local`; workspace and allowed edit root: `C:\dev\Fratelli-s-System`.
- Baseline is factual: branch `develop`, current `HEAD` `185e8e3ae07c712e68d6de64c2de11c23b4a7018`.
- The persisted task artifact remains **23/25**: Tasks 1–20 and 22–24 are `[x]`; Tasks 21 and 25 remain `[ ]`. No checkbox was changed because the available images do not evidence the required manual ~360 px responsive/accessibility validation.
- This supersedes historical statements that the CTA was absent or that the Sale 409 was unresolved: **Confirmar venta** is present for a real `ENTREGADO` Order; the real Sale-time 409 is the expected `SALE_STOCK_CONFIRMATION_REQUIRED` fallback with authoritative `shortages`, followed only by an explicit acknowledged retry.

### Manual evidence recorded

| HU | Asset | Factual caption |
| --- | --- | --- |
| HU-012 | `docs/capturas/HU-012-orders-page.png` | Real `ENTREGADO` Order detail with **Confirmar venta**. |
| HU-012 | `docs/capturas/HU-012-sale-confirm.png` | Desktop checkout plus real Sale success dialog: «Venta confirmada», «La venta se registró correctamente» and **Volver a pedidos**. |
| HU-013 | `docs/capturas/HU-013-low-stock-modal.png` | New Order shortage dialog with positive 1 u and 3 u rows, **Volver** and **Continuar**. |
| HU-013 | `docs/capturas/HU-013-order-detail.png` | Created `PENDIENTE` Order detail with items, notes and total. |

`docs/capturas/HU-012-order-true.png` was inspected but intentionally not embedded: it adds no distinct fact beyond the delivered Order evidence. All embedded links resolve from their respective `docs/historias/` documents. No HU-002 image reference remains in either HU document.

### Files changed in this documentation slice

- `docs/historias/HU-012-registrar-confirmar-venta.md`
- `docs/historias/HU-013-venta-stock-bajo.md`
- `openspec/changes/implement-hu-012-and-hu-013-order-to-sale-flow/verify-report.md`
- this cumulative `apply-progress.md`

### Verification and delivery boundary

- Documentation/link validation only; no product source, tests, migrations, OpenAPI/generated types, Git state, review, receipt, verification lifecycle, archive/move, or native attempt action was performed.
- Historical snapshot: at that point Task 21’s manual ~360 px evidence was unavailable and Task 25 was open. This was superseded by the final documentation-only closure below after the real mobile assets and maintainer confirmation were recorded.
- Receipt readiness remains limited to the implemented Sale persistence (Order/Shift/channel/payment/actor/time and line snapshots); no Receipt, printing, fiscal feature, Customer/discount feature, or HU-025 was added.
- Repository convention is in-place OpenSpec history. No archive/move/metadata was invented or applied.

## Final documentation-only in-place closure — COMPLETE

### Status and scope consumed

- Native status: `artifactStore: openspec`; active change `implement-hu-012-and-hu-013-order-to-sale-flow`; `applyState: ready` before this closure; `actionContext.mode: repo-local`; workspace and only edit root `C:\dev\Fratelli-s-System`.
- Parent retains the active runtime attempt token. This executor did not acquire or settle an attempt, did not start review/verification lifecycle work, and did not mutate Git state.
- Delivery boundary: documentation/OpenSpec only. No production code, tests, migrations, generated types, OpenAPI, screenshots, or unrelated documentation was changed.

### Final manual evidence

- Inspected the newly present real mobile assets before documenting them:
  - `docs/capturas/HU-012-mobile-view.png`: mobile (~360 px) Confirmar venta view for an `ENTREGADO` Order, with item, Directo, Efectivo, and the Confirmar venta / Cancelar cobro controls visible.
  - `docs/capturas/HU-013-mobile-view.png`: mobile (~360 px) Nuevo pedido shortage dialog, with the Hamburguesa shortage and Volver / Continuar controls visible.
- The maintainer explicitly confirmed basic manual desktop and ~360 px responsive/usability/accessibility validation. This is recorded as basic manual validation, **not WCAG certification**.

### Completed task state

- Marked **Task 21** and **Task 25** complete only after recording the current desktop and mobile manual evidence.
- Re-read the persisted task artifact: **25/25** implementation tasks are visibly `- [x]`; no unchecked implementation rows remain.

### Updated artifacts and closure method

- `docs/historias/HU-012-registrar-confirmar-venta.md`: final HU-012 manifest with desktop and mobile evidence.
- `docs/historias/HU-013-venta-stock-bajo.md`: final HU-013 manifest with desktop and mobile evidence.
- `openspec/changes/implement-hu-012-and-hu-013-order-to-sale-flow/tasks.md`: 25/25 complete.
- `openspec/changes/implement-hu-012-and-hu-013-order-to-sale-flow/verify-report.md`: PASS with HU-012, HU-013, Shared, Compatibility, Evidence, and Deferred Findings sections.
- This cumulative `apply-progress.md`: final COMPLETE state.
- Every embedded Markdown image path was resolved from its HU document. Existing convention is safe **in-place** closure: no move, archive, or closure metadata was created.

### Technical evidence and deferred finding retained verbatim

- Recorded prior technical evidence remains: backend **59 tests, 0 failures**; frontend **18 files / 78 tests**; `pnpm lint`, `pnpm typecheck`, and `pnpm build` PASS.
- No new technical command was run or claimed in this documentation-only closure.
- `PREEXISTING_OUT_OF_SCOPE`: `pnpm format:check` still reports 16 pre-existing unrelated files; they were not modified.
- HU-025 remains out of scope.

### Remaining lifecycle work

- Implementation documentation closure is complete. Parent-owned lifecycle actions (including any review, receipt, verification routing, or archive decision) remain deferred to the parent.
