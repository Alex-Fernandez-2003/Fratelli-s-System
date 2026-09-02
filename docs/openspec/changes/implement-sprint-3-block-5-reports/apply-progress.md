# Apply Progress

## Historical session `pi-block5-2026-02-01`

### Task 1 — Revalidate local baseline, contracts, and dependencies

- **Status:** BLOCKED before product implementation; baseline and OpenSpec disk reconstruction completed, local contract mapping remains pending.
- **Change:** Confirmed the active change is `implement-sprint-3-block-5-reports`. Read `proposal.md`, `design.md`, `spec.md`, and `tasks.md` completely from this directory.
- **Baseline:** Branch `develop`; initial HEAD `8cf270508e46b7a9abc3d51b758a6497100750d`; working tree had pre-existing modifications to `frontend/package.json` and `frontend/pnpm-lock.yaml`, plus untracked `.vscode/`, `frontend/pnpm-workspace.yaml`, `informe-final-fratelli.pdf`, `informe-final-fratelli.tex`, and the active OpenSpec directory. No staged changes were present. These files were not reset, restored, cleaned, or overwritten.
- **Tests:** Not run; no product implementation was started.
- **Failure:** Mandatory delegated read-only mapping could not launch. `intercom` project-pane launch returned `HERDR_UNAVAILABLE`; diagnostic confirmed `herdr=NOT_FOUND` and no `HERDR_BIN` is configured.
- **Decision:** Do not bypass the mandatory delegation boundary by implementing the multi-file feature monolithically. Do not mark any `tasks.md` item complete.
- **Next task:** Restore a usable delegated worker/scout runtime, then re-run local contract and dependency reconciliation before APPLY.

## Parallel Merge Manifest (partial)

### Block-5-only files

- None created yet.

### Shared files modified

- None by this session. Existing modified package files predate Block 5 implementation and were preserved.

### Package/lockfile changes

- None by this session. Existing modifications to `frontend/package.json` and `frontend/pnpm-lock.yaml` remain untouched.

### Generated files

- None by this session.

### Backend files

- None by this session.

### Files intentionally NOT touched because HU-028 owns them

- Cash/CashClosing product code.
- `/turnos/cierres` and HU-028 route/navigation work.
- CashSession, CashClosing DTOs, cash history filters, HU-027 success-link work, and other D19 work.

### Recommended merge order

- Restore delegated-worker availability and complete the Block 5 baseline audit first. No Block 5 product diff exists yet, so no merge operation is recommended at this point.

## Manual Evidence

`DEFERRED_TO_SPRINT_FINAL_AUDIT` — no screenshots or manual visual/responsive/accessibility evidence collected.

## Historical blocked audit `pi-block5-local-contract-audit-2026-09-02`

### Task 1 — Revalidate baseline local, contracts, and dependencies

- **Status:** COMPLETE for the read-only contract audit; product APPLY is not authorized because Task 2 has unresolved frozen core gaps.
- **Baseline:** Branch `develop`; initial HEAD `8cf270508e46b7a9abc3d51b758a6497100750d`; no staged changes. Pre-existing unstaged files: `frontend/package.json`, `frontend/pnpm-lock.yaml`. Pre-existing untracked files: `.vscode/`, `docs/openspec/changes/implement-sprint-3-block-5-reports/`, `frontend/pnpm-workspace.yaml`, `informe-final-fratelli.pdf`, and `informe-final-fratelli.tex`. No reset, restore, clean, checkout, switch, stash, merge, rebase, revert, commit, or push was run.
- **OpenSpec:** Confirmed active change `implement-sprint-3-block-5-reports`; completely read `proposal.md`, `design.md`, `spec.md`, `tasks.md`, and `apply-progress.md`. No `specs/**`, metadata, receipts, verify report, or handoff artifacts are present in the change directory.
- **Dependencies:** `frontend/package.json` has `jspdf` but no XLSX writer or chart dependency. Scripts are `format:check` via `format:check` equivalent (`prettier --check .`), `typecheck`, `lint`, `test`, and `build`; no dependency was installed or changed by this session. CodeGraph was unavailable because its binary is not installed.
- **Evidence:** `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs:51-53`, `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs:50-55`, `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs:303-357`, `backend/src/RestaurantSystem.Api/Program.cs:100,110,113`, `backend/src/RestaurantSystem.Infrastructure/Operations/AuthorizedSalesScope.cs:10-24`, and `frontend/src/types/api.generated.ts:5465-5574,6504-6523,6892-6911,7590-7613` were inspected. Generated TypeScript remains unchanged.
- **Tests:** Not run; no product implementation was started because the OpenSpec contract gate failed.

### Task 2 — Resolve core gaps before APPLY

- **Status:** BLOCKED — `SPRINT_3_BLOCK_5_PRODUCT_DECISION_REQUIRED`.
- **HU-029 gaps:** `GET /api/v1/reports/sales` accepts only `from` and `to`; it has no backend `Shift` or `Channel` filter. `SalesReportAsync` filters by `Sale.ConfirmedAt` while its series groups through `Shift -> CashSession.BusinessDate`, so BusinessDate period coherence is not established.
- **HU-031 gaps:** `GET /api/v1/reports/attendance` accepts only `from`, `to`, and `employeeId`; it has no backend `Shift` filter. `AttendanceReportAsync` returns no report-level summary and hardcodes `lateCount` and `absenceCount` to `0`, despite the existing administrative attendance service deriving lateness/absence. Its `ProjectedPay` is calculated backend-side from closed records, but the required complete late/absence analytics and D32 summary cannot be represented by the current DTO.
- **Authorization drift:** Sales uses `SalesHistory` (ADMINISTRATOR, MANAGER, WAITER, ACCOUNTANT), inventory uses `InventoryRead` (ADMINISTRATOR, MANAGER, WAITER, KITCHEN, ACCOUNTANT), and attendance uses `AttendanceAdministrative` (ADMINISTRATOR, MANAGER, ACCOUNTANT). The frozen frontend report matrix differs for sales/inventory and cannot be treated as backend security.
- **Decision:** Do not add report frontend code, handwritten DTOs, client-side filter workarounds, or unauthorized backend changes. A maintainer must either authorize the smallest backend contract correction and revise this OpenSpec, or explicitly revise the frozen HU-029/HU-031 requirements before APPLY.
- **Next task:** Resolve the exact product decision for the listed HU-029/HU-031 contract gaps, then revalidate this change before any implementation.

### Parallel Merge Manifest (audit state)

#### Block-5-only files

- None. No Block 5 product source, test, route, navigation, export, or dependency files were created or modified.

#### Shared files modified

- None by this session. Existing `frontend/package.json` and `frontend/pnpm-lock.yaml` changes predate this audit and remain untouched.

#### Package/lockfile changes

- None by this session. Existing package and lockfile changes are preserved.

#### Generated files

- Historical audit state: `frontend/src/types/api.generated.ts` was read-only audited and remained unchanged at that point.

#### Backend files

- None modified. Backend report code was read-only inspected only.

#### Files intentionally NOT touched because HU-028 owns them

- Cash/CashClosing product code, `/turnos/cierres`, CashSession, CashClosing DTOs, HU-026/HU-027/HU-028 work, cash history filters, and any future HU-028 route/navigation insertion.

#### Recommended merge order

- Resolve the documented backend/product contract decision first. After an authorized contract is present, apply Block 5 frontend changes independently; do not merge or simulate HU-028, and preserve any later HU-028 route/navigation/package edits when reconciling shared files.

### Manual Evidence

`DEFERRED_TO_SPRINT_FINAL_AUDIT` — no screenshots or manual visual/responsive/accessibility evidence collected for this blocked continuation.

## Historical authorized backend reconciliation continuation (superseded by current frontend APPLY)

### Scope and authorization

The maintainer explicitly authorized the backend-only reconciliation for HU-029 and HU-031, focused PostgreSQL integration coverage, factual HU-030 role-drift reporting, and synchronization of the generated client from runtime OpenAPI. Frontend feature implementation, manual generated edits, HU-028/cash, schema, entities, migrations and Git delivery remain out of scope.

### Implemented

- **HU-029:** `GET /api/v1/reports/sales` now accepts `from`, `to`, `shiftType` and `salesChannel`. The service joins sales to shifts and cash sessions, filters inclusive `CashSession.BusinessDate` bounds, applies Shift/Channel server-side, and computes aggregates plus series from the same filtered rows.
- **HU-031:** `GET /api/v1/reports/attendance` now accepts `from`, `to`, `employeeId` and `shiftType`. The service derives lifecycle/lateness/absence with `AttendanceDerivationService`, delegates closed-work minutes/hours/pay to `PayrollProjectionCalculator`, and returns `AttendanceReportSummaryDto` aggregated from the full filtered dataset.
- **HU-030:** No code or policy change by product decision. `InventoryRead` remains broader than the frozen frontend Reportes matrix because it permits `Administrator`, `Manager`, `Waiter`, `Kitchen` and `Accountant`; `Waiter/MESERO` direct API access is recorded as intentional role drift, and frontend hiding is not a security boundary.
- **Focused coverage:** Added `backend/tests/RestaurantSystem.IntegrationTests/OperationsReportsPostgresIntegrationTests.cs` with two PostgreSQL scenarios covering inclusive BusinessDate boundaries, Shift/Channel and combined filters, payment/channel separation, series/summary coherence, derived attendance outcomes, open-clock exclusion and closed-work pay.

### Source/signature verification

The actual local source was re-read after stale LSP findings appeared:

- `OperationalContracts.cs` declares both backward-compatible report overloads and the nested `AttendanceReportSummaryDto` response contract.
- `OperationsService.cs` implements both overloads and constructs the two-argument `AttendanceReportDto`.
- `OperationsEndpoints.cs` passes the new `shiftType`/`salesChannel` and `shiftType` arguments to those interface methods.
- `dotnet build backend/RestaurantSystem.slnx --no-restore` succeeded with 0 errors, and the focused tests compiled against the same project references.

The C# LSP runner continued to report the old cross-project signatures (`CS1501`, `CS0246`, `CS1729`) despite the clean build. Those findings were inspected and marked false-positive as stale metadata; no workaround or unrelated source change was introduced. The current-turn diagnostics delta is clean.

### Verification

- `dotnet build backend/RestaurantSystem.slnx --no-restore`: **passed**, 0 errors (5 existing warnings, including NU1903 for SSH.NET and pre-existing nullable warnings).
- `dotnet test ... --filter FullyQualifiedName~OperationsReportsPostgresIntegrationTests`: **2 passed**.
- `dotnet test ... --filter FullyQualifiedName~OperationsConcurrencyPostgresIntegrationTests|FullyQualifiedName~OperationsContractPostgresIntegrationTests|FullyQualifiedName~AttendancePostgresIntegrationTests`: **37 passed**.
- `git diff --check` for the changed backend/test/OpenSpec paths: **clean**.
- `cd frontend && pnpm run api:generate` passed against the Development runtime OpenAPI; only `frontend/src/types/api.generated.ts` changed, and no frontend feature code or package/lockfile was modified.
- No migration, schema, HU-028/cash or Git delivery operation was performed.

### Changed files in this continuation

- `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs`
- `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs`
- `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs`
- `backend/tests/RestaurantSystem.IntegrationTests/OperationsReportsPostgresIntegrationTests.cs`
- `frontend/src/types/api.generated.ts` (regenerated from runtime OpenAPI; no manual edits)
- `docs/openspec/changes/implement-sprint-3-block-5-reports/proposal.md`
- `docs/openspec/changes/implement-sprint-3-block-5-reports/design.md`
- `docs/openspec/changes/implement-sprint-3-block-5-reports/spec.md`
- `docs/openspec/changes/implement-sprint-3-block-5-reports/tasks.md`
- `docs/openspec/changes/implement-sprint-3-block-5-reports/apply-progress.md`

### Manual evidence

`DEFERRED_TO_SPRINT_FINAL_AUDIT` — no screenshots or manual visual/responsive/accessibility evidence collected at the time of this backend-only continuation; the frontend APPLY was pending in that historical snapshot.

## Current frontend APPLY — COMPLETE_LOCAL_VERIFIED — 2026-09-02

### Scope

The authorized single-writer frontend APPLY is complete within the allowlist:

- `frontend/src/features/reports/api.ts` and `api.test.ts` — typed TanStack Query adapters, filters and `httpClient` endpoint mapping.
- `frontend/src/features/reports/pages.tsx` and `pages.test.tsx` — Sales, Inventory and Attendance pages, role-aware secondary navigation, responsive states and Modal filters.
- `frontend/src/features/reports/export.ts` and `export.test.ts` — one normalized full-response dataset per report feeding CSV, XLSX and PDF directly.
- `frontend/src/lib/api/endpoints.ts` — report endpoint builders.
- `frontend/src/features/navigation.tsx` and `navigation.test.ts` — frozen capability union and deterministic report target.
- `frontend/src/routes/AppRoutes.tsx` and `AppRoutes.test.tsx` — `/reportes` redirect and independent route guards.
- `frontend/package.json` and `frontend/pnpm-lock.yaml` — exactly one maintained XLSX dependency, `xlsx@^0.18.5`, plus its resolution entries; existing package/version hunks were preserved.

`frontend/src/types/api.generated.ts` remains generated-only and was not manually edited.

### Acceptance fixes applied

- Valid zero Sales, Inventory and Attendance responses render backend-authoritative summaries; row/series emptiness is explicit rather than replacing a valid report.
- Sales and Attendance reports no longer retain `placeholderData`; pages and export actions also guard `isPlaceholderData` so stale responses cannot be exported under new filters. Failed refreshes surface an error with retry.
- Sales and Attendance filters use one accessible mobile Modal with a real trigger and desktop inline layout; tests cover opening and closing without duplicate active controls.
- Attendance `Ver asistencia` links target plain `/asistencia`, matching the current HU-024 route behavior.
- CSV/XLSX/PDF consume the same complete normalized response dataset; no DOM scraping, CSV reparsing, client aggregation or current-page limitation is introduced.

### Verification

- `cd frontend && pnpm run typecheck`: passed.
- `cd frontend && pnpm run lint`: passed.
- `cd frontend && pnpm run test`: passed — 42 files / 245 tests.
- `cd frontend && pnpm run build`: passed; Vite emitted only the existing large-chunk advisory.
- Targeted `pnpm exec prettier --check` for all edited frontend sources: passed.
- `cd frontend && pnpm install --frozen-lockfile --offline --ignore-scripts`: passed.
- `git diff --check`: passed.
- Repository-wide `pnpm run format:check` is intentionally not used to rewrite the preserved pnpm lockfile; with the pre-existing lock representation it flags only `pnpm-lock.yaml`.

### Review and manual evidence

Reviewer acceptance blockers were resolved and the frontend APPLY was accepted. Manual visual/responsive/accessibility evidence remains `DEFERRED_TO_SPRINT_FINAL_AUDIT`; no screenshots are claimed here. No backend, migration, schema, HU-028/cash or Git delivery changes were made during this frontend APPLY.
