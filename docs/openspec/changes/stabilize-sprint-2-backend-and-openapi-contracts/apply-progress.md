# Apply progress — Sprint 2 backend/OpenAPI stabilization

## Status consumed

- Native SDD status supplied by parent: `apply ready`, repository-local authoritative workspace `C:\dev\Fratelli-s-System`, `develop`, 0/18 at start.
- `actionContext`: repository-local apply; allowed root was the repository root.
- Baseline: `develop` at `5a4966b01dd8e0759b0c867d0b45964dee84417c` (`5a4966b docs: actualitation of documents`). Initial working tree contained only the untracked requested OpenSpec change directory.
- Skill resolution: `paths-injected` (`cognitive-doc-design`). Strict TDD was not configured (`openspec/config.yaml` is absent).

## Baseline classification

| Approved finding | Classification | Evidence |
|---|---|---|
| Shared UnitId validation for Composition | PRESENT → fixed | Count compared loaded units to all lines. |
| Shared UnitId validation for Purchase create | PRESENT → fixed | Same distinct-count defect. |
| Purchase list DbContext fan-out | PRESENT → fixed | `Task.WhenAll(ids.Select(PurchaseAsync))`. |
| Current Shift scope | PRESENT → fixed | My-current, Sale, and Expense queried globally ACTIVE shifts. |
| HU-013 locked shortage response | PRESENT → fixed | Sale returned stale `req` after batch failure. |
| Receipt ordered/received unit distinction | PRESENT → fixed | DTO/mapping had no received UnitId. |
| Pending receipt null semantics | PRESENT → fixed | `GetValueOrDefault` synthesized zero. |

Protected frontend audit: the local `frontend/src/features` tree has no HU-004, HU-007, or HU-017 consumer feature files. No manual frontend feature source was changed.

## Completed implementation and persisted task updates

- [x] Task 1: baseline recorded and seven findings classified.
- [x] Task 2: real commands audited/executed. Initial Debug backend build/test was blocked by pre-existing `RestaurantSystem.Api` PID 33620 locking Debug assemblies; Release gates were used instead. Initial root-directory command attempts were invalid and are not treated as gates.
- [x] Task 3: Composition and Purchase creation now query/count distinct Unit IDs while retaining per-line dimension/factor checks.
- [x] Task 4: production scaling/rollback coverage was completed in the regression completion refresh; see its exact evidence below.
- [x] Task 5: purchase list uses sequential page, item, and receipt bulk reads; no shared-context fan-out.
- [x] Task 6: `CurrentShiftQuery` scopes active-shift lookup to the open CashSession for `IBusinessClock.BusinessDate`; MyCurrentShift, Sale (locked), and Expense use it. CurrentShift already had equivalent session/date scope.
- [x] Task 7: dedicated cross-day CurrentShift/Sale/Expense/MyCurrentShift regression was completed in the regression completion refresh; see its exact evidence below.
- [x] Task 8: deterministic post-precheck Sale shortage-race regression was completed in the regression completion refresh; the implementation maps `InventoryBatchResult.Shortages` when batch returns `STOCK_INSUFFICIENT`.
- [x] Task 9: additive nullable `receivedUnitId`; pending receipt maps `receivedQuantity` and `receivedUnitId` to null. Added purchase list/pending/received regression.
- [x] Task 10: findings audited without code changes: `ProduceAsync` still collapses any InventoryWriter failure to `PRODUCTION_STOCK_INSUFFICIENT` (ADDITIONAL_FINDING_REQUIRES_HUMAN_REVIEW; HU-007; observable error semantic risk). `ReceivePurchaseAsync` still uses `Units.SingleAsync` for unknown receipt UnitId (ADDITIONAL_FINDING_REQUIRES_HUMAN_REVIEW; HU-018; uncontrolled exception risk). Inactive historical receipt unit remains PRODUCT_DECISION_REQUIRED.
- [x] Task 11: Release build/test completed; no migration created.
- [x] Task 12: runtime OpenAPI obtained after backend tests. It contains 50 paths, `/api/v1/purchases`, and nullable UUID `PurchaseLineDto.receivedUnitId`.
- [x] Task 13: `api.generated.ts` regenerated only by `pnpm run api:generate`; generated change adds `receivedUnitId: null | string`.
- [x] Task 14: protected local frontend consumer audit and typecheck completed; manual feature diff is zero.
- [x] Task 15: all real frontend gates passed.
- [x] Task 16: handoff documentation synchronized with actual runtime/OpenAPI/frontend evidence.
- [x] Task 17: scope review found no route/verb changes, no migration, no second inventory system, and no unapproved finding fixes.
- [x] Task 18: this cumulative report prepared.

## Files changed

- `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs`
- `backend/src/RestaurantSystem.Infrastructure/Operations/CurrentShiftQuery.cs`
- `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs`
- `backend/src/RestaurantSystem.Infrastructure/Expenses/ExpenseService.cs`
- `backend/tests/RestaurantSystem.IntegrationTests/OperationsConcurrencyPostgresIntegrationTests.cs`
- `frontend/src/types/api.generated.ts` (generated)
- `docs/handoffs/sprint-2-backend-frontend-handoff.md`

## Verification evidence

| Command | Result |
|---|---|
| `cd backend && dotnet build RestaurantSystem.slnx -c Release` | PASS, 0 errors (pre-existing warnings: NU1903, obsolete EF constraints, nullable warnings). |
| `cd backend && dotnet test RestaurantSystem.slnx -c Release --no-build` | PASS: Application 1/1, Domain 1/1, Integration 52/52. |
| Runtime Release API on `127.0.0.1:5058`, `GET /openapi/v1.json` | PASS: 50 paths; nullable UUID `receivedUnitId`; `/api/v1/purchases` present. |
| `cd frontend && OPENAPI_SCHEMA_URL=http://127.0.0.1:5058/openapi/v1.json pnpm run api:generate` | PASS; generated `receivedUnitId: null | string`. |
| `cd frontend && pnpm run format:check` | PASS. |
| `cd frontend && pnpm run typecheck` | PASS. |
| `cd frontend && pnpm run lint` | PASS. |
| `cd frontend && pnpm test` | PASS: 14 files, 49 tests. |
| `cd frontend && pnpm run build` | PASS. |

## Deviations and remaining work

No design deviation in production code. The requested focused regressions for Tasks 4, 7, and 8 are recorded in the regression completion refresh below. The initial Debug backend commands could not run because a pre-existing API process held Debug outputs; no process or local file belonging to that session was altered.

## Regression completion refresh

- [x] Task 4: added a real PostgreSQL production regression for `QuantityPerOutputUnit × QuantityProduced`: 150 g × 4 converts to 0.6 kg and 0.25 l × 4 converts to 1000 ml. It proves successful output increment and a subsequent insufficient run hard-blocks without partial production/output writes.
- [x] Task 7: added a controlled Day 1 residual NIGHT ACTIVE / Day 2 open MORNING ACTIVE PostgreSQL regression. `CurrentShiftAsync`, `MyCurrentShiftAsync`, persisted `Sale.ShiftId`, and persisted `Expense.ShiftId` all select Day 2.
- [x] Task 8: added a deterministic real-PostgreSQL post-precheck race. A wrapper drains stock via a separate `InventoryService` transaction immediately before the real Sale batch write; the locked result returns a nonempty authoritative shortage (required 1, current 0), while Sale and Sale inventory writes roll back without acknowledgment.
- Persisted checkbox reconciliation: Tasks 4, 7, and 8 were marked `[x]` in `tasks.md` after their focused suite passed.

## Refresh verification evidence

| Command | Result |
|---|---|
| `dotnet test backend/tests/RestaurantSystem.IntegrationTests/RestaurantSystem.IntegrationTests.csproj -c Release --filter "FullyQualifiedName~OperationsConcurrencyPostgresIntegrationTests"` | PASS: 11/11. (An initial root-relative project-path invocation failed before execution and is not evidence.) |
| `dotnet build backend/RestaurantSystem.slnx -c Release` | PASS: 0 errors; 2 existing NU1903 warnings for SSH.NET. |
| `dotnet test backend/RestaurantSystem.slnx -c Release --no-build` | PASS: Domain 1/1, Application 1/1, Integration 55/55. |

Frontend gates were deliberately not repeated: this refresh adds backend integration tests and evidence only, with no production contract, OpenAPI, or generated TypeScript change. The earlier frontend gate evidence remains valid for the unchanged contract.

## Remaining tasks

None. Every implementation-owned task is visibly checked in `tasks.md`; there are no parent-owned task markers to defer.

## Workload / delivery boundary

One apply work unit only; no Git mutation, commit, push, branch operation, VERIFY, or ARCHIVE was performed. The diff is above the forecast's medium review risk and should be reviewed in the proposed backend/query-shift/receipt-contract slices. Structured status consumed: authoritative OpenSpec `applyState: ready`, `nextRecommended: apply`, repository-local workspace `C:\dev\Fratelli-s-System`, allowed edit root `C:\dev\Fratelli-s-System`; no action-context warnings.
