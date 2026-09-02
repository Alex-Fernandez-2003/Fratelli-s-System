# HU-028 Apply Progress

## Status

`APPLY_COMPLETE` — `VERIFY_READY_WITH_WARNING` — `ARCHIVE_DEFERRED_TO_SPRINT_FINAL_AUDIT`

Tasks 1–20 are complete in `tasks.md`. Native automated OpenSpec VERIFY completed with 189/189 requirements, 25/25 scenarios, zero blockers and zero critical findings. No archive, commit, push, destructive Git operation, migration, dependency installation, export, report feature, or historical mutation was performed.

## Manual evidence policy

- **Implementation:** `COMPLETE`.
- **Automated verification:** recorded below and in `verify-report.md`.
- **Manual responsive/accessibility evidence:** `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
- No browser screenshots, manual smoke flow, manual accessibility walkthrough, or visual PASS is claimed.
- Missing manual evidence does not block this implementation, but it remains an explicit final-audit item.

## Baseline and product decision

- Branch: `develop`.
- Initial HEAD: `8cf270508e46b7a9abc3d51b758a6497100750d0`.
- Initial working tree: clean tracked state; only the active OpenSpec directory was pre-existing untracked content.
- Initial staged changes: none.
- Forbidden Git operations performed: none.
- Task 1 revalidated the local endpoint, generated contract, Cash frontend, routes, navigation, authorization policies, tests, and migration boundary.
- Task 2 recorded maintainer authorization **D19 / OPTION A** after the local endpoint was confirmed to accept only `page` and `pageSize`.

D19 authorizes only optional date-only `from`/`to` on the existing `GET /api/v1/cash/closings` endpoint. The bounds are inclusive over `CashClosing.BusinessDate`, applied before newest-first ordering and `Skip/Take`, with `from > to` using validation ProblemDetails. No new endpoint, DTO, entity, schema change, migration, authorization expansion, Responsible filter, or summary endpoint is authorized.

## Task evidence

### Tasks 1–2 — Baseline and D19

- **Status:** Complete.
- `tasks.md` preserves the initial blocker and the explicit D19 resolution.
- Responsible filtering remains `OMITTED_BY_CURRENT_CONTRACT`; summary cards remain omitted because the backend exposes no aggregates.

### Tasks 3–5 — Contract, route, and navigation

- **Status:** Complete.
- `frontend/src/features/cash/api.ts` extends `cashKeys` and uses generated `CashClosingDto`/history query types.
- `frontend/src/lib/api/endpoints.ts` contains the existing-endpoint builders for list and detail; no raw fetch or parallel API layer was introduced.
- `/turnos/cierres` is protected by `CASH_HISTORY_READ_ROLES`: ADMINISTRADOR, ENCARGADO and CONTADORA.
- `/turnos/cierre` remains protected by `SHIFT_MANAGE_ROLES`: ADMINISTRADOR and ENCARGADO.
- Navigation exposes `Cierres de caja` to the CashHistory union and does not route pure CONTADORA through operational `/turnos/cierre`.
- Route/navigation tests cover ADMINISTRADOR, ENCARGADO, CONTADORA, MESERO, COCINA, EMPLEADO and a multi-role union.

### Tasks 6–9 — Filters, list, mobile cards, and difference semantics

- **Status:** Complete.
- Current business month defaults to the first day through today in `America/La_Paz` business-date terms.
- `from`/`to` are sent server-side, empty optional values are omitted, and changing a filter resets page to 1.
- Pagination uses real `PagedResponse` metadata and preserves backend ordering; high-page responses recover to a valid last page.
- Desktop renders a compact reconciliation table. Mobile renders cards with date, actor, expected, declared, difference and detail action.
- Difference presentation reuses `frontend/src/features/cash/format.ts` and renders textual `Sobrante`, `Faltante` or `Cuadrado` with the numeric sign.
- Responsible display uses only the real `closedByUserId`; no name lookup or N+1 request was introduced.

### Tasks 10–12 — On-demand detail and snapshot dimensions

- **Status:** Complete.
- Detail uses `GET /api/v1/cash/closings/{id}` only after a closing is selected and has a cache key separated by ID.
- The existing accessible responsive `Modal` is reused; no new overlay dependency or system was added.
- Detail reads only the persisted `CashClosingDto`: identity, business date, close time, actor, real ID, both opening amounts, removed cash, payment totals, channel totals, expense totals, expected, declared, difference and optional observation.
- `PedidosYa` remains only under `Canales`; `Pago externo` remains under `Medios de pago`.
- `cashAmountCarriedForward`, signatures, modification data and synthetic closing numbers are not fabricated or shown.

### Tasks 13–16 — HU-027 integration, states, accessibility, and regression

- **Status:** Complete.
- HU-027 success keeps its confirmation and adds the secondary `Ver historial de cierres` link; it does not auto-redirect.
- Loading, background refresh, current-period empty, filtered-empty, retryable error, null observation and optional-value fallbacks are covered.
- Code-level responsive/a11y structure includes labels, named actions, textual difference semantics, semantic dialog/status/alert roles, keyboard close, focus handling through the shared Modal, and named pagination controls.
- Focused frontend cash/regression coverage passed **91/91** tests across 8 files, including existing HU-027 behavior.

### Task 17 — Full frontend gates and generated contract

- **Status:** Complete.
- `cd frontend && pnpm run format:check` — PASS.
- `cd frontend && pnpm run typecheck` — PASS.
- `cd frontend && pnpm run lint` — PASS.
- `cd frontend && pnpm test` — PASS: **42 files / 245 tests**.
- `cd frontend && pnpm run build` — PASS: **2,167 modules transformed**.
- Build warning: Vite reported a nonblocking minified chunk above 500 kB.
- `cd frontend && pnpm api:generate` — PASS against runtime `http://localhost:5057/openapi/v1.json`; generated diff is limited to optional `from?: string` and `to?: string` under the cash closings query. The generated file was not hand-edited.

### Task 18 — Backend and EF gates

- **Status:** Complete with an environment warning recorded rather than hidden.
- `dotnet restore backend/RestaurantSystem.slnx` — PASS; all projects up to date. Existing warning: `NU1903` for SSH.NET 2024.2.0.
- `dotnet build backend/RestaurantSystem.slnx --configuration Release --no-restore` — PASS; 0 errors and 14 nonblocking warnings.
- `dotnet ef migrations has-pending-model-changes --project backend/src/RestaurantSystem.Infrastructure/RestaurantSystem.Infrastructure.csproj --startup-project backend/src/RestaurantSystem.Api/RestaurantSystem.Api.csproj --configuration Release --no-build` — PASS; no model changes since the last migration.
- Focused `CashClosingHistoryPostgresIntegrationTests` — **3/3 PASS**.
- Process-isolated sequential backend regression — **110/110 PASS**: 19/19 unit tests and 91/91 integration tests.
- A single-process Release solution run executed 91 tests and returned 87/91 because four Attendance tests hit PostgreSQL `Npgsql.PostgresException 53300` (`too many clients already`). The affected Attendance class passed **8/8** when rerun in its own process. This is retained as environmental evidence; it is not represented as a product failure.
- The pre-existing API process on port 5057 was not killed or modified.

### Tasks 19–20 — Factual documentation, deferred evidence, and readiness

- **Status:** Complete.
- `docs/historias/HU-028-sprint3-backend.md` now documents backend + frontend completion, D19, routes, roles, snapshot authority, validation, manifest and scope boundaries.
- `verify-report.md` provides requirement/scenario accounting, automated evidence, warnings and blank final-audit placeholders.
- No screenshot, manual PASS, fabricated count or unsupported backend capability was added.
- Task 20 readiness trace covers route/auth, period filtering, pagination, list/detail, snapshot authority, payment/channel separation, read-only scope, HU-027 link, no export/reporting, no migration, and generated/backend state.

## Scope audit

| Boundary | Result |
| --- | --- |
| Existing history endpoint only | PASS |
| Existing detail endpoint only | PASS |
| Optional inclusive BusinessDate `from`/`to` under D19 | PASS |
| Server filtering before order/pagination | PASS |
| CashHistory authorization unchanged | PASS |
| CashManage remains separate | PASS |
| Read-only history/detail | PASS |
| No reporting, summary, export or download | PASS |
| No migration/schema/entity/DTO addition | PASS |
| No dependency or lockfile change | PASS |
| Generated client runtime-synchronized | PASS |
| Manual evidence | Deferred to Sprint Final Audit |

## Native VERIFY closure

- Native status before VERIFY: `apply: all_done`, `verify: ready`, `archive: blocked`, tasks `20/20`.
- Native VERIFY result: `PASS_WITH_WARNINGS`; `verify-report.md` was admitted by `gentle-ai sdd-verify-validate` with **189/189 requirements**, **25/25 scenarios**, **0 blockers** and **0 critical findings**.
- Native runtime attempt settlement: `COMPLETE`, outcome `passed`; the candidate report evidence revision is `sha256:fa45924e792adf7c4f4daf228060ce6f0602f513187450ea0dc65a48f11359f6`.
- Remaining warnings are nonblocking: manual responsive/accessibility evidence is deferred, the one-process PostgreSQL resource warning is preserved as environmental evidence, Vite reports a large chunk, and existing backend warnings remain.

## Next action

Keep archive blocked until the Sprint Final Audit supplies manual responsive/accessibility evidence. Do not archive, commit or push; no delivery action is authorized by this change.
