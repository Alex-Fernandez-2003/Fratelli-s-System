# HU-032 First Apply Progress

Change: `finalize-sprint-3-hu-032-mvp-ui-operational-consolidation`

## Current status

`HU_032_FIRST_APPLY_COMPLETE_PENDING_MAINTAINER_REVIEW`

First Apply implementation and non-maintainer verification are complete for the current working tree. The audit-phase marker `AUDIT_COMPLETE_APPLY_IN_PROGRESS` is retained below as historical evidence. The required maintainer visual review remains a hard stop and remains unchecked in `tasks.md`.

## Baseline — 2026-05-03

- Repository root: `C:/dev/Fratelli-s-System`
- Canonical branch: `develop`
- Initial HEAD: `6a958639670f95546e0965b8c4c6fb7bbf2e4984` (`feat: seed for 3 months of use`)
- Initial tracked diff: none
- Initial staged diff: none
- Initial working-tree status: untracked `Pantallas.zip`; untracked HU-032 OpenSpec directory only
- Existing tracked local work: none detected
- Destructive Git operations: none
- Commit/push/archive: none

## OpenSpec reconstruction

Read completely from disk before product edits:

- `proposal.md`
- `design.md`
- `spec.md`
- `tasks.md`
- `docs/openspec/README.md`
- `docs/historias/HU-026-sprint3-backend.md`
- `docs/historias/HU-027-sprint3-backend.md`
- `docs/historias/HU-028-sprint3-backend.md`
- `docs/historias/HU-029-sprint3-backend.md`
- `docs/historias/HU-030-sprint3-backend.md`
- `docs/historias/HU-031-sprint3-backend.md`

No `docs/historias/HU-032*.md` existed at audit time. No `visual-audit.md` or `apply-progress.md` existed before this file was created.

## Visual package audit

- Expected resource: `Pantallas.zip` at repository root
- Found: yes
- Extracted outside the repository for audit: 74 PNG images
- Images inspected: `74/74` via labeled contact sheets preserving the source folder/name
- Individual classification matrix: `visual-audit.md`
- Final manual evidence: not performed and intentionally deferred
- Historical marker retained: `DEFERRED_TO_SPRINT_FINAL_AUDIT`

The ZIP contains 94 archive entries: 74 PNG references and directory entries. No reference is treated as authorization for mockup-only domain features.

## Local product audit findings

- Frontend already has a dark Fratelli shell, shared Button/IconButton, Modal, DataTable, PageHeader, Card, responsive table/card patterns, business-time helper, and generated OpenAPI types.
- `/asistencia/hoy` exists and is guarded for `ADMINISTRADOR`/`ENCARGADO`; the missing behavior is normal visible reachability from the attendance experience.
- `CashPreviewDto` already exposes real cash values, but `ShiftsPage` renders placeholders and stale HU-026/HU-027 copy.
- Kitchen endpoint currently filters status only and returns historical commands; current-day restriction belongs in the backend query.
- Production backend already exposes the product inventory unit; registration currently displays `preparationArea` and accepts fractional quantity without authoritative discrete-unit validation.
- Inventory balances default to all product types; movement query supports date bounds but the page starts without today defaults and backend date conversion currently uses UTC midnight.
- Purchase history uses a rolling 30-day default; sales history sends date-only values to timestamp bounds with an inclusive upper predicate and requires contract-correct current-day handling.
- Supplier detail endpoint/data already exists; Expense history rows contain the real fields required for a read-only detail overlay.
- Attendance self CheckIn/CheckOut writes call `SaveChangesAsync`; an end-to-end runtime write → CheckOut → history assertion was not present and remains mandatory F12 evidence. Administrative history intentionally joins assignments, while personal history reads canonical employee records.
- No schema change is authorized or proven necessary during audit.

## Baseline automated gates

Commands were run by a read-only verification worker before product edits:

- `pnpm --dir frontend run format:check`: **FAIL**, 15 pre-existing formatting findings including generated/API and navigation/report files.
- `pnpm --dir frontend run typecheck`: **PASS**.
- `pnpm --dir frontend run lint`: **PASS**.
- `pnpm --dir frontend run test`: **PASS**, 45 files / 266 tests.
- `pnpm --dir frontend run build`: **PASS**, 2,185 modules; existing chunk-size warning.
- `dotnet build backend/RestaurantSystem.slnx -c Release`: **PASS**, 0 errors / 15 warnings.
- `dotnet test backend/RestaurantSystem.slnx --no-build`: **BLOCKED**, integration tests could not start because Docker/Testcontainers endpoint `npipe://./pipe/docker_engine` was unavailable; Domain 1/1 and Application 18/18 passed before the integration environment failure.
- `dotnet ef migrations has-pending-model-changes --project backend/src/RestaurantSystem.Infrastructure --startup-project backend/src/RestaurantSystem.Api --no-build`: **PASS**, no pending model changes.
- Runtime OpenAPI/generated freshness was not changed or regenerated during baseline; no backend contract has been changed yet.

The baseline verifier reported that pnpm reconciled local dependencies while preparing commands and generated ignored build artifacts. A follow-up Git audit found no tracked diff or unexpected untracked product files; no cleanup or destructive command was performed.

## Meaningful apply log

### Audit and references

- Files: this file, `visual-audit.md`
- Behavior: certified local Git baseline and inspected all 74 supplied references.
- Tests/gates: baseline results recorded above.
- Visual refs: 74/74 classified individually; final manual evidence deferred.
- Backend impact: none.
- OpenAPI impact: none.
- Result: audit marker `AUDIT_COMPLETE_APPLY_IN_PROGRESS` and `DEFERRED_TO_SPRINT_FINAL_AUDIT` are retained.

### First Apply implementation

- Backend: business-day bounds now use `IBusinessClock` for Kitchen, Production, Sales and Inventory movement queries; discrete `COUNT` quantities are validated authoritatively for Production, Inventory and Purchases; existing Attendance persistence/history contracts were covered with an authenticated CheckIn → CheckOut → `/api/v1/attendance/me` assertion; no schema or generated contract changes were made.
- Frontend: role-aware Inicio dashboards use existing real queries; Shift/Cash maps `CashPreviewDto`; Production shows product units and validates count quantities; Inventory defaults to `SALE_ITEM` and current business day; Purchases use current-month defaults; Sales/Production/Inventory use business-date bounds; history actions use accessible Eye controls; Expense/Supplier/Cash Closing detail/search surfaces use existing data and shared Modal/IconButton primitives; `/asistencia/hoy` is reachable from authorized dashboard actions.
- Scope guard: canonical roles remain `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA`, `EMPLEADO`; no `CAJERO`, mock-only KPI, scheduler, schema, migration or generated TypeScript edit was introduced.
- Documentation: `AUTO_ABSENCE_GENERATION: NOT_IMPLEMENTED / POST-MVP` remains explicit; user-facing HU-026/HU-027 and HU-015 references were removed from affected UI copy.

### First Apply verification

- `dotnet build backend/RestaurantSystem.slnx -c Release --no-restore`: PASS, 0 errors / 14 warnings.
- Domain tests: PASS, 1/1. Application tests: PASS, 18/18.
- `frontend` tests: PASS, 46 files / 270 tests, including the added Inicio role-dashboard and multi-role coverage.
- `frontend` typecheck, lint and build: PASS in the verification worker; build retained the existing large-chunk warning.
- `frontend` format check: FAIL, 23 files reported including modified files (format remains non-blocking/pre-existing and is recorded rather than mass-reformatted).
- PostgreSQL/Testcontainers integration: BLOCKED by unavailable Docker endpoint `npipe:////./pipe/dockerDesktopLinuxEngine`; the new Kitchen current-business-day and Attendance history assertions were not runtime-proven in this environment.
- `git diff --check`: PASS after the apply edits.
- Final screenshots, final manual evidence, maintainer visual authority, Native VERIFY, Sprint/MVP close and archive remain intentionally deferred.

## Hard constraints retained

- No commit, push, archive, reset, restore, clean, stash, checkout, switch, rebase, merge, revert, or destructive Git operation.
- No schema/migration unless an explicit product decision is obtained; expected state remains no schema change.
- No manual edits to generated TypeScript; regenerate only from runtime OpenAPI if a backend HTTP contract changes.
- No auto-absence scheduler/background service; documentation must state `AUTO_ABSENCE_GENERATION: NOT_IMPLEMENTED / POST-MVP`.
- No final screenshots, final manual evidence, maintainer-edit propagation, final VERIFY, Sprint 3 close, MVP close, or HU-032 DONE during this first apply.
- Next visual authority after this checkpoint: `MAINTAINER_EDITED_UI`.
