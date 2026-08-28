# Apply progress — HU-001 frontend completion

## Status consumed

- Native status: `applyState: ready`, `nextRecommended: apply`, OpenSpec store; change selection was explicit.
- Action context: `repo-local`, workspace `C:\dev\Fratelli-s-System`, allowed root is the workspace. No action-context warning.
- Delivery/workload: no `Review Workload Forecast` guard lines were present in `tasks.md`; single work unit (no PR boundary created).
- Scope observed: backend and `frontend/src/types/api.generated.ts` were read-only. The generated file has a stat-only line-ending worktree indication and no content diff.

## Completed implementation-owned tasks

- [x] Contract baseline was re-read: `Program.cs`, `AuthContracts.cs`, generated types, HTTP/query/routes/components. Backend contract was sufficient; no backend or generated artifact was changed.
- [x] Added a React-neutral memory-only session coordinator with epoch invalidation and shared refresh promise.
- [x] Added coordinator triangulation for stale completion, reset after success/failure, and five callers.
- [x] Refactored the HTTP client into raw transport plus authenticated policy with dispatch-time Bearer, credentials, timeout, ProblemDetails, 204 support, and one eligible 401 retry.
- [x] Added generated-type-derived auth adapter and auth endpoints.
- [x] Added `AuthProvider`/public hook under `QueryProvider`, plus initial login, bootstrap, role, logout, and cache lifecycle implementation.

Persisted checkbox updates: tasks 1.1, 2.1, 2.2, 2.3, 2.5, 3.1, and 3.3 are visibly `[x]` in `tasks.md`.

## Files changed

- `frontend/src/lib/auth/session-coordinator.ts`, `.test.ts`
- `frontend/src/lib/api/http-client.ts`, `.test.ts`, `endpoints.ts`
- `frontend/src/features/auth/api.ts`, `AuthProvider.tsx`, `AuthProvider.test.tsx`
- `frontend/src/pages/LoginPage.tsx`, `InicioPage.tsx`, `ForbiddenPage.tsx`
- `frontend/src/routes/AppRoutes.tsx`, `frontend/src/main.tsx`
- `frontend/src/components/molecules/FormFields.tsx`, `frontend/src/styles/globals.css`
- `docs/historias/HU-001-iniciar-cerrar-sesion.md`

## Test and build evidence

- RED: `pnpm vitest run src/lib/auth/session-coordinator.test.ts` failed because the coordinator did not exist.
- GREEN: focused coordinator test passed: 3 tests.
- RED: `pnpm vitest run src/lib/api/http-client.test.ts` failed for the missing auth-policy API.
- GREEN: focused coordinator + HTTP tests passed: 6 tests.
- RED: `pnpm vitest run src/features/auth/AuthProvider.test.tsx` failed because the provider did not exist.
- GREEN: focused provider test passed: 2 tests.
- `pnpm test`: passed, 4 files / 19 tests.
- `pnpm run typecheck`: passed.
- `pnpm run lint`: passed.
- `pnpm run build`: passed.
- `pnpm run format:check`: failed because pre-existing unformatted `docs/manual-de-uso.md`, `src/pages/UiKitPage.test.tsx`, and `src/pages/UiKitPage.tsx` remain, plus files that were formatted locally. No unrelated files were reformatted.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| 2.1–2.3 | `src/lib/auth/session-coordinator.test.ts` | Unit | N/A new | failed missing module | 3 passed | five callers, stale clear, failure/reset | clean |
| 2.4–2.5 | `src/lib/api/http-client.test.ts` | Unit | N/A new behavior | failed missing API | 3 passed | raw/401/retry and 403 branches | clean |
| 3.2–3.3 | `src/features/auth/AuthProvider.test.tsx` | Integration | N/A new | failed missing provider | 2 passed | 401 bootstrap/login and role cases | clean |

## Deviations and evidence limits

- The five approved Login PNG inputs are not present in this workspace; no unobserved reference geometry or assets were invented. No icon package or SVGR was installed.
- `curl http://localhost:5057/health` returned connection refused. Therefore `pnpm run api:generate`, runtime login/F5/401/role/logout validation, and genuine screenshots were not run.
- **EVIDENCE_PENDING_MANUAL:** start the Development backend, run API generation and the documented end-to-end flows, then capture only real frontend evidence under `docs/capturas/`. HU-001 is not claimed end-to-end complete.

## Remaining implementation-owned tasks

- [ ] Visually inspect all five approved Login PNGs and record only observable desktop/mobile/state differences in implementation notes/tests; do not invent geometry or substitute uninspected assets.
- [ ] Confirm whether the inspected design truly needs external icons and/or a custom SVG React component before changing `frontend/package.json`, `pnpm-lock.yaml`, or `frontend/vite.config.ts`.
- [ ] **RED:** add `frontend/src/lib/api/http-client` tests for dispatch-time Bearer, raw auth bypass, one eligible-401 refresh/retry, rebuilt retry headers/body/query, retry-401 stop, and 403/400/404/409/5xx/network no-refresh.
- [ ] **TRIANGULATE/REFACTOR:** prove concurrent 401 requests use exactly one refresh and every original request retries no more than once.
- [ ] **RED:** add provider tests for checking → authenticated/unauthenticated bootstrap, login response handling, role helpers, stale bootstrap suppression, and token non-exposure.
- [ ] **RED:** add logout/cache tests for `204` cancel+clear+state clear, refresh-loss cleanup, late request protection, and failed remote logout preserving session/cache.
- [ ] **GREEN/TRIANGULATE:** implement epoch-first cleanup and recoverable logout errors; prove a stale completion cannot repopulate auth state after logout.
- [ ] If reference inspection requires it, add `lucide-react` with pnpm and retain shared `ReactNode` icon contracts. Add `vite-plugin-svgr` and `?react` support only if an actual custom SVG component is required; test the import/build path.
- [ ] Extend `frontend/src/components/molecules/FormFields.tsx` `PasswordInput` neutrally for visual icon toggle while preserving labels, keyboard operation, entered value, and accessible reveal/hide names; add RTL coverage.
- [ ] **RED:** add Login tests for required username/password validation, loading/duplicate-submit prevention, generic 401 rejection, controlled non-401 failure, and accessibility associations.
- [ ] **GREEN:** add Login page/feature styles using `AuthLayout`, form atoms/molecules, `Alert`, `Spinner`, and approved-reference observations. Validate normal/loading/validation/rejected/mobile states.
- [ ] **RED:** add route tests for bootstrap hold/no Login flash, unauthenticated intended-location redirect, authenticated `/login` redirect, authenticated Inicio, and role mismatch.
- [ ] **GREEN/TRIANGULATE:** implement `RequireAuth`, `RequireAnyRole`, `ForbiddenPage`, `InicioPage`, and routes `/login`, `/inicio`, `/403` in `frontend/src/routes/AppRoutes.tsx`; preserve DEV `/dev/ui-kit`.
- [ ] Check Login, Forbidden, and Inicio by keyboard and at 360 px, ~403 px, tablet, and desktop for focus visibility and no horizontal overflow.
- [ ] Run focused auth/session/HTTP/route tests first, then from `frontend/` run exactly: `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test`, and `pnpm run build`.
- [ ] With Development backend available, run `pnpm run api:generate`; inspect any generated difference against `Program.cs` before accepting it.
- [ ] Perform real runtime validation: login → Inicio → F5 bootstrap → protected request/401 recovery → role denial → successful logout; separately demonstrate failed logout remains recoverable.
- [ ] Update `frontend/README.md`, `frontend/docs/manual-de-uso.md`, and `docs/historias/HU-001-iniciar-cerrar-sesion.md` with final observed APIs/results only; add real, linked frontend evidence under `docs/capturas/`.
- [ ] Review final diff against `proposal.md` and all `specs/` requirements. Confirm no backend/migration/OpenAPI-contract edit, persistent JWT storage, cross-tab refresh, unrelated feature, dashboard, or fabricated evidence.

## Continuation 7/26 — runtime and focused evidence

### Status consumed

- Native authoritative OpenSpec status: `applyState: ready`, `nextRecommended: apply`; 26 implementation-owned tasks, now 9 checked and 17 unchecked. Action context is `repo-local`, workspace `C:\dev\Fratelli-s-System`, with that workspace as the allowed edit root; no warning.
- Authenticated the parent-owned live attempt with continuation token `sha256:62036eaccdd01213c9142af2dcb7757b17f6a72912ac35af39691c53c368eb58`; the parent owns settlement. No ownership markers exist, so all checkbox rows are legacy implementation-owned.
- No review-workload guard lines were present. This is one continuation work unit; no PR boundary was created.

### Completed and persisted tasks

- [x] PasswordInput toggle/RTL coverage: added `frontend/src/components/molecules/FormFields.auth.test.tsx`; it proves label addressing, reveal/hide names, type toggle, and preservation of entered value. The persisted PasswordInput checkbox is `[x]`.
- [x] Development OpenAPI generation: started disposable PostgreSQL 16 (`fratelli-hu001-postgres` on host port 54329), configured local User Secrets, applied migrations, started the Development API and Vite, ran `pnpm run api:generate`, and compared the result to `Program.cs`. There was no generated content diff or contract edit. The persisted api:generate checkbox is `[x]`.
- Added focused Login behavior tests in `frontend/src/pages/LoginPage.test.tsx` for required controls/errors, associations, controlled rejection and disabled duplicate submit. The broader Login RED task remains unchecked because it does not yet cover every required 401/non-401 scenario.
- Formatter-only changes were applied solely to the three explicitly authorized pre-existing files: `frontend/docs/manual-de-uso.md`, `frontend/src/pages/UiKitPage.test.tsx`, and `frontend/src/pages/UiKitPage.tsx`.

### Runtime and quality evidence

- Backend: `dotnet restore RestaurantSystem.slnx`, `dotnet build RestaurantSystem.slnx --no-restore`, migrations, and Development `/health`/`/openapi/v1.json` all succeeded. Build retained existing warnings (NU1903 SSH.NET advisory and nullable warnings in unchanged `Program.cs`).
- Disposable runtime API flow: `admin.test` login 200, `/me` 200, cookie-backed refresh 200, logout 204, refresh after logout 401; `empleado.test` got 403 for `/api/v1/categories`. This is API-level runtime evidence, not a browser claim. The API, Vite process, container, and temporary User Secrets were removed after the run.
- Frontend: `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test` (6 files/22 tests), and `pnpm run build` all passed. Focused Login, PasswordInput, coordinator/HTTP, and provider test runs passed.
- The frontend `/login` route served from Vite, but no browser automation was available. F5 bootstrap rendering, automatic browser 401 retry, route guard/role view, responsive viewport checks, and failed-logout UI recovery are not claimed as runtime-validated.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| PasswordInput coverage | `src/components/molecules/FormFields.auth.test.tsx` | RTL | existing UI-kit suite passed in full run | behavior test added against existing implementation | 1 passed | reveal/hide and value preservation | none |
| Login partial coverage | `src/pages/LoginPage.test.tsx` | RTL | new test file | initial run exposed an ambiguous test selector (test setup only) | 2 passed after selector correction | required vs pending/rejection branches | none |

### Documentation and deviations

- Corrected the stale HU-001 partial-status note to record only observed API/runtime facts and the still-missing browser evidence. No screenshots or fabricated evidence were added.
- The five approved Login PNGs remain absent. No design geometry, icon package, custom SVG, or SVG tooling was invented or installed.

### Remaining implementation-owned tasks

- [ ] Visually inspect all five approved Login PNGs and record only observable desktop/mobile/state differences in implementation notes/tests; do not invent geometry or substitute uninspected assets.
- [ ] Confirm whether the inspected design truly needs external icons and/or a custom SVG React component before changing `frontend/package.json`, `pnpm-lock.yaml`, or `frontend/vite.config.ts`.
- [ ] **RED:** add `frontend/src/lib/api/http-client` tests for dispatch-time Bearer, raw auth bypass, one eligible-401 refresh/retry, rebuilt retry headers/body/query, retry-401 stop, and 403/400/404/409/5xx/network no-refresh.
- [ ] **TRIANGULATE/REFACTOR:** prove concurrent 401 requests use exactly one refresh and every original request retries no more than once.
- [ ] **RED:** add provider tests for checking → authenticated/unauthenticated bootstrap, login response handling, role helpers, stale bootstrap suppression, and token non-exposure.
- [ ] **RED:** add logout/cache tests for `204` cancel+clear+state clear, refresh-loss cleanup, late request protection, and failed remote logout preserving session/cache.
- [ ] **GREEN/TRIANGULATE:** implement epoch-first cleanup and recoverable logout errors; prove a stale completion cannot repopulate auth state after logout.
- [ ] If reference inspection requires it, add `lucide-react` with pnpm and retain shared `ReactNode` icon contracts. Add `vite-plugin-svgr` and `?react` support only if an actual custom SVG component is required; test the import/build path.
- [ ] **RED:** add Login tests for required username/password validation, loading/duplicate-submit prevention, generic 401 rejection, controlled non-401 failure, and accessibility associations.
- [ ] **GREEN:** add Login page/feature styles using `AuthLayout`, form atoms/molecules, `Alert`, `Spinner`, and approved-reference observations. Validate normal/loading/validation/rejected/mobile states.
- [ ] **RED:** add route tests for bootstrap hold/no Login flash, unauthenticated intended-location redirect, authenticated `/login` redirect, authenticated Inicio, and role mismatch.
- [ ] **GREEN/TRIANGULATE:** implement `RequireAuth`, `RequireAnyRole`, `ForbiddenPage`, `InicioPage`, and routes `/login`, `/inicio`, `/403` in `frontend/src/routes/AppRoutes.tsx`; preserve DEV `/dev/ui-kit`.
- [ ] Check Login, Forbidden, and Inicio by keyboard and at 360 px, ~403 px, tablet, and desktop for focus visibility and no horizontal overflow.
- [ ] Run focused auth/session/HTTP/route tests first, then from `frontend/` run exactly: `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test`, and `pnpm run build`.
- [ ] Perform real runtime validation: login → Inicio → F5 bootstrap → protected request/401 recovery → role denial → successful logout; separately demonstrate failed logout remains recoverable.
- [ ] Update `frontend/README.md`, `frontend/docs/manual-de-uso.md`, and `docs/historias/HU-001-iniciar-cerrar-sesion.md` with final observed APIs/results only; add real, linked frontend evidence under `docs/capturas/`.
- [ ] Review final diff against `proposal.md` and all `specs/` requirements. Confirm no backend/migration/OpenAPI-contract edit, persistent JWT storage, cross-tab refresh, unrelated feature, dashboard, or fabricated evidence.

## Continuation — Login visual correction

### Status consumed

- Native authoritative OpenSpec status: `applyState: ready`, `nextRecommended: apply`; action context is `repo-local`, workspace `C:\dev\Fratelli-s-System`, and its only allowed edit root is the workspace. No action-context warning.
- Delivery/workload: no `Review Workload Forecast` guard lines are present; this is a single visual-only work unit with no PR boundary.
- Strict TDD was active. Existing focused Login and PasswordInput tests were the safety net (3 tests passed before changes).

### Reference observations and implementation

- Reviewed the five parent-supplied observations before changing code: desktop uses a centered compact (~392 px) card on `#151617`, with a fork/knife tile; normal, loading, client-validation, and rejected-credential states retain the same form structure. Mobile promotes the orange `FRATELLI` wordmark and retains card/helper/footer, field icons, password eye, and arrow CTA.
- No external icon package, custom SVG asset, SVGR, Vite configuration, or dependency change was necessary. Small inline SVG React nodes keep the existing neutral `ReactNode` contracts.
- Updated `LoginPage` to supply the brand tile, observed copy, user/lock/info/arrow icons, helper, footer, input placeholders, and CTA. `FormField` now has an optional neutral `leadingIcon` slot; `PasswordInput` renders inline eye/eye-off SVG while preserving its existing accessible name and keyboard/value behavior.
- Updated responsive Login styles: desktop card is capped at 24.5 rem on `#151617`; sub-480 px removes the card chrome and makes the orange wordmark prominent. The field-control wrapper prevents icon/input overlap.

### Completed and persisted tasks

- [x] Reference inspection task: observations above and Login RTL coverage record normal/loading/validation/rejected markup; no unobserved asset or geometry was introduced.
- [x] Icon/SVG decision task: inline ReactNode-compatible SVG is sufficient; `package.json`, lockfile, and Vite configuration were unchanged.
- [x] Login visual GREEN task: `AuthLayout`, existing form primitives, `Alert`, and `Spinner` retain normal, loading, validation, and controlled rejection behavior with the reference-driven presentation.

Persisted checkbox updates were re-read and visibly `[x]` in `tasks.md` for all three tasks above.

### Files changed

- `frontend/src/pages/LoginPage.tsx` (brand, visual copy, inline icons, helper/footer, CTA)
- `frontend/src/pages/LoginPage.test.tsx` (brand/helper and loading accessibility assertions)
- `frontend/src/components/molecules/FormFields.tsx` (optional ReactNode leading icon slot; SVG eye states)
- `frontend/src/styles/globals.css` (compact desktop/mobile Login styling and icon control layout)
- `docs/openspec/changes/complete-hu-001-authentication-and-protected-frontend-shell/tasks.md` (three completed implementation checkboxes)

### Test and quality evidence

- Safety net: `pnpm vitest run src/pages/LoginPage.test.tsx src/components/molecules/FormFields.auth.test.tsx` — 2 files / 3 tests passed before edits.
- RED: new reference-driven Login test failed because `FRATELLI`/`Bienvenido`/helper copy did not exist.
- GREEN/refactor: focused Login and PasswordInput tests passed — 2 files / 5 tests.
- Full quality from `frontend/`: `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test` (6 files / 24 tests), and `pnpm run build` all passed.
- Browser screenshot automation is unavailable. Visual screenshots and actual viewport/keyboard inspection at 360 px, ~403 px, tablet, and desktop remain honestly pending; no screenshot evidence is claimed.

### TDD Cycle Evidence

| Task | Test file | Layer | Safety net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| Login visual presentation | `frontend/src/pages/LoginPage.test.tsx` | RTL integration | 3 focused tests passed | failed missing `FRATELLI` brand/copy | 5 focused tests passed | normal brand/copy and pending busy status | formatted; existing behavior preserved |
| Password icon presentation | `frontend/src/components/molecules/FormFields.auth.test.tsx` | RTL integration | 3 focused tests passed | existing accessible toggle behavior is covered | 1 PasswordInput test passed in focused run | reveal/hide and entered-value preservation remain covered | replaced glyphs with neutral inline SVG only |

### Remaining implementation-owned tasks

- [ ] **RED:** add `frontend/src/lib/api/http-client` tests for dispatch-time Bearer, raw auth bypass, one eligible-401 refresh/retry, rebuilt retry headers/body/query, retry-401 stop, and 403/400/404/409/5xx/network no-refresh.
- [ ] **TRIANGULATE/REFACTOR:** prove concurrent 401 requests use exactly one refresh and every original request retries no more than once.
- [ ] **RED:** add provider tests for checking → authenticated/unauthenticated bootstrap, login response handling, role helpers, stale bootstrap suppression, and token non-exposure.
- [ ] **RED:** add logout/cache tests for `204` cancel+clear+state clear, refresh-loss cleanup, late request protection, and failed remote logout preserving session/cache.
- [ ] **GREEN/TRIANGULATE:** implement epoch-first cleanup and recoverable logout errors; prove a stale completion cannot repopulate auth state after logout.
- [ ] If reference inspection requires it, add `lucide-react` with pnpm and retain shared `ReactNode` icon contracts. Add `vite-plugin-svgr` and `?react` support only if an actual custom SVG component is required; test the import/build path.
- [ ] **RED:** add Login tests for required username/password validation, loading/duplicate-submit prevention, generic 401 rejection, controlled non-401 failure, and accessibility associations.
- [ ] **RED:** add route tests for bootstrap hold/no Login flash, unauthenticated intended-location redirect, authenticated `/login` redirect, authenticated Inicio, and role mismatch.
- [ ] **GREEN/TRIANGULATE:** implement `RequireAuth`, `RequireAnyRole`, `ForbiddenPage`, `InicioPage`, and routes `/login`, `/inicio`, `/403` in `frontend/src/routes/AppRoutes.tsx`; preserve DEV `/dev/ui-kit`.
- [ ] Check Login, Forbidden, and Inicio by keyboard and at 360 px, ~403 px, tablet, and desktop for focus visibility and no horizontal overflow.
- [ ] Run focused auth/session/HTTP/route tests first, then from `frontend/` run exactly: `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test`, and `pnpm run build`.
- [ ] Perform real runtime validation: login → Inicio → F5 bootstrap → protected request/401 recovery → role denial → successful logout; separately demonstrate failed logout remains recoverable.
- [ ] Update `frontend/README.md`, `frontend/docs/manual-de-uso.md`, and `docs/historias/HU-001-iniciar-cerrar-sesion.md` with final observed APIs/results only; add real, linked frontend evidence under `docs/capturas/`.
- [ ] Review final diff against `proposal.md` and all `specs/` requirements. Confirm no backend/migration/OpenAPI-contract edit, persistent JWT storage, cross-tab refresh, unrelated feature, dashboard, or fabricated evidence.

### Checkbox reconciliation

- [x] The conditional icon/SVGR implementation task is also persisted as complete: reference inspection established that it is not required because dependency-free inline ReactNode SVG is sufficient. `package.json`, lockfile, and Vite configuration remain unchanged.

## Continuation — controlled Figma composition and Lucide migration

### Status consumed

- Produced status because the parent did not provide structured status and no runtime status-contract file was available: active change `complete-hu-001-authentication-and-protected-frontend-shell`; authoritative OpenSpec artifact files exist under `docs/openspec/changes/`; `applyState: ready`, `nextRecommended: apply`.
- Action context from the prior authoritative continuation: `repo-local`, workspace `C:\dev\Fratelli-s-System`, allowed edit root is that workspace. No warning. The change remains **apply partial/pending** at the requester's direction.
- No Review Workload Forecast guard lines exist. This is one visual/configuration work unit; no PR boundary was created.

### Completed slice and persisted-task reconciliation

- Reworked Login to use `AuthLayout`'s new `integrated` presentation: the Login panel has no background, border, or shadow, producing one composition rather than a nested form-only card.
- Retained the requested visible copy: `FRATELLI`, `Bienvenido`, `Usuario`, `Ingresar`, helper text, and footer.
- Installed `lucide-react@1.34.0` and replaced manual Login and password-toggle SVG markup with Lucide `Utensils`, `UserRound`, `LockKeyhole`, `ArrowRight`, `Info`, `Eye`, and `EyeOff`. `FormField.leadingIcon` and `Button` icon props remain `ReactNode` boundaries.
- Installed `vite-plugin-svgr@5.2.0`; added the Vite plugin and `src/svg.d.ts` declaration for `*.svg?react`. No SVG was created or emitted as a production asset.
- The relevant conditional icon/SVGR and Login visual task checkboxes were already visibly `[x]`; they remain `[x]`. No new task row was fully completed, so no checkbox was changed. The re-read `tasks.md` confirms the change is still pending.

### TDD Cycle Evidence

| Task | Test file | RED | GREEN / refactor |
|---|---|---|---|
| Integrated Login composition | `frontend/src/pages/LoginPage.test.tsx` | Added the integrated-composition assertion; it failed because `.auth-layout--integrated` did not exist. | Added the neutral `integrated` layout option and no-card CSS; focused Login and PasswordInput tests passed (2 files, 6 tests). |

### Files changed in this slice

- `frontend/package.json`, `frontend/pnpm-lock.yaml`
- `frontend/vite.config.ts`, `frontend/src/svg.d.ts`
- `frontend/src/components/templates/AuthLayout.tsx`
- `frontend/src/components/molecules/FormFields.tsx`
- `frontend/src/pages/LoginPage.tsx`, `frontend/src/pages/LoginPage.test.tsx`
- `frontend/src/styles/globals.css`

### Verification

- `pnpm vitest run src/pages/LoginPage.test.tsx` — RED: 1 expected failure / 5 tests.
- `pnpm vitest run src/pages/LoginPage.test.tsx src/components/molecules/FormFields.auth.test.tsx` — passed: 2 files / 6 tests.
- `pnpm run format:check` — passed.
- `pnpm run typecheck` — passed.
- `pnpm run lint` — passed.
- `pnpm test` — passed: 6 files / 25 tests.
- `pnpm run build` — passed; Vite 8.2.2 transformed 1,881 modules. This loads the SVGR Vite configuration; no application SVG import or fabricated asset was added.

### Deviations, risks, and remaining tasks

- The prior task wording made SVGR conditional, but this requester explicitly required SVGR configuration. It is configured without an application SVG import, consistent with the no-artificial-production-asset constraint.
- No auth architecture, backend, generated API type, validation/archive/git activity, or screenshot was changed/created.
- The remaining unchecked implementation rows are unchanged, including the HTTP/provider/route RED coverage, lifecycle/routing work, viewport/keyboard checks, real browser runtime validation, final documentation/evidence, and final scope review. HU-001 remains pending/apply partial.

## Continuation — frontend Tailwind v4 styling migration

### Status consumed

- Native authoritative OpenSpec status: `applyState: ready`, `nextRecommended: apply`; `actionContext` is `repo-local`, workspace `C:\dev\Fratelli-s-System`, allowed edit root is the workspace. No edit-root warning.
- No Review Workload Forecast guard lines exist. This was one frontend-only work unit; no PR boundary was created.
- The workspace has no `openspec/config.yaml` and the parent did not declare strict TDD, so standard mode was used. Existing tests were adjusted only where they asserted removed presentation class names.

### Completed styling migration

- Audited every `src/**/*.css`, `src/**/*.tsx`, and `src/**/*.ts` style import/class reference before editing. Migrated atoms (Button, IconButton, LinkButton, Spinner, Display, controls), molecules (feedback, fields/password control, navigation, file dropzone), organisms (table, modal, page header), templates (AppShell/AuthLayout), and Login/Inicio/Forbidden/UI-kit/bootstrap page layout styles to Tailwind v4 utilities in JSX.
- `globals.css` now contains only the Tailwind import, `@theme` semantic tokens, and a minimal `@layer base` reset. The 14 semantic color values are preserved unchanged.
- Removed all global component/BEM selectors after static usage audit. The post-migration audit found zero `.app-shell`, `.auth-layout`, `.button*`, `.control`, `.form-field`, `.login-*`, `.file-dropzone`, `.data-table`, `.modal`, `.page-header`, `.catalogue-grid`, `.inline-actions`, `.link-button`, or `.route-bootstrap` selector/use remnants in source CSS/TSX.
- No backend, generated API, new styling dependency, Lucide/SVGR configuration, or auth behavior was changed. Lucide components remain in place.

### CSS audit

| Measure | Before | After | Remnant reason |
|---|---:|---:|---|
| `globals.css` lines | 452 | 46 | import, 14-token `@theme`, and minimal base reset only |
| Global class/ID selectors | 90+ legacy rules | 0 | all presentation moved to JSX utilities |
| Semantic color tokens | 14 | 14 | preserved values for existing visual system |
| JSX `className` attributes | audit baseline 59 selector-based uses | 89 utility uses | component-local Tailwind presentation, not global selectors |

### Files changed in this slice

- `frontend/src/styles/globals.css`
- `frontend/src/components/atoms/{Action,Display,FormControls}.tsx`
- `frontend/src/components/molecules/{Feedback,FileDropzone,FormFields,Navigation}.tsx`
- `frontend/src/components/organisms/index.tsx`
- `frontend/src/components/templates/{AppShell,AuthLayout}.tsx`
- `frontend/src/pages/{LoginPage,InicioPage,ForbiddenPage,UiKitPage}.tsx`
- `frontend/src/routes/AppRoutes.tsx`
- `frontend/src/pages/{LoginPage,UiKitPage}.test.tsx` (assert utility/semantic contract instead of removed global selector names)

### Verification evidence

- `pnpm run format:check` — passed.
- `pnpm run typecheck` — passed.
- `pnpm run lint` — passed.
- `pnpm test` — passed: 6 files / 25 tests.
- `pnpm run build` — passed.

### Task reconciliation, deviations, and remaining work

- This migration was requester-directed and has no separate unchecked task row. The existing Login shared-style task was already visibly `[x]`; no unrelated HU-001 checkbox was changed. Re-read `tasks.md`: 13 implementation tasks remain unchecked and HU-001 remains pending.
- No design deviation: semantic colors and responsive/auth behavior are represented with Tailwind utilities. No browser viewport validation, verify, archive, git, or review action was run.
- Native attempt settlement returned `blocked: maintainer_decision` because the work unit exceeded its attempt/changed-line budget despite passing checks. A maintainer must reset/resolve that runtime-attempt accounting before another bounded SDD work unit.

## Final automated technical closure

### Status consumed

- Produced structured status because the parent supplied no status object and neither project nor global status-contract file was available. The explicit active change is `complete-hu-001-authentication-and-protected-frontend-shell`; its authoritative artifacts are present under `docs/openspec/changes/`. Resolved status: `applyState: ready`, `nextRecommended: apply`, `artifactStore: openspec` (project layout is `docs/openspec`).
- Action context inherited from the active parent attempt: `repo-local`, workspace `C:\dev\Fratelli-s-System`, workspace edit root only. No unsafe-root warning. Parent retains native continuation token `sha256:3f25794fd46c03f2d6880acc547893ba0737a4eab6b569ca014bcbfd54f66499`; this work does not settle it.
- No Review Workload Forecast guard lines exist. One automated closure work unit; no PR boundary created. No strict-TDD configuration was present at `openspec/config.yaml`; existing behavior was covered with focused tests before final quality gates.

### Completed automated work and persisted task reconciliation

- Corrected stale Login test copy to the current approved composition and supplied the required `AuthLayout` `title="Iniciar sesión"`; no manual visual baseline, asset, screenshot, backend, generated type, or auth behavior was changed.
- Added automated HTTP lifecycle coverage for non-401/no-refresh cases and five concurrent 401 requests sharing one refresh with one retry per original request.
- Added provider/cache lifecycle coverage for successful logout cancellation/clear/token removal, failed remote logout preservation, and late-bootstrap suppression after logout.
- Added route coverage for bootstrap hold (no Login flash), unauthenticated redirect, authenticated `/login` redirect, and role mismatch `/403`.
- Updated frontend README/manual with the delivered memory-only auth, shared HTTP, route/role, `HttpError`, and no-token-argument boundaries. HU-001 now explicitly states `PENDING_EVIDENCE` and does not present existing captures as frontend completion evidence.
- Persisted tasks were re-read: **23 checked, 3 unchecked**. Newly completed checkboxes are HTTP RED and triangulation, provider RED/logout RED/logout GREEN, Login RED, route RED/route GREEN, quality run, and final scope review.

### Files changed in this closure slice

- `frontend/src/pages/LoginPage.tsx`, `frontend/src/pages/LoginPage.test.tsx`
- `frontend/src/lib/api/http-client.test.ts`
- `frontend/src/features/auth/AuthProvider.test.tsx`
- `frontend/src/routes/AppRoutes.test.tsx`
- `frontend/README.md`, `frontend/docs/manual-de-uso.md`
- `docs/historias/HU-001-iniciar-cerrar-sesion.md`
- `docs/openspec/changes/complete-hu-001-authentication-and-protected-frontend-shell/tasks.md`

### Verification and audit evidence

- Focused: `pnpm vitest run src/lib/api/http-client.test.ts src/features/auth/AuthProvider.test.tsx src/routes/AppRoutes.test.tsx src/pages/LoginPage.test.tsx` — **4 files, 18 tests passed**.
- Full from `frontend/`: `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test`, and `pnpm run build` — all passed; full Vitest result **7 files, 33 tests**; Vite transformed 1,881 modules.
- `git diff --check` passed. Diff audit found no backend diff and no content diff in `frontend/src/types/api.generated.ts`. Security scan found no persistent browser-token API (`localStorage`, `sessionStorage`, IndexedDB, or `document.cookie`) in frontend source; access-token references are coordinator code and test fixtures only.
- No commit, verify/archive action, receipt, browser fabrication, or generated-type/manual-backend edit occurred.

### Remaining manual evidence only

- [ ] Check Login, Forbidden, and Inicio by keyboard and at 360 px, ~403 px, tablet, and desktop for focus visibility and no horizontal overflow.
- [ ] Perform real runtime validation: login → Inicio → F5 bootstrap → protected request/401 recovery → role denial → successful logout; separately demonstrate failed logout remains recoverable.
- [ ] Update `frontend/README.md`, `frontend/docs/manual-de-uso.md`, and `docs/historias/HU-001-iniciar-cerrar-sesion.md` with final observed APIs/results only; add real, linked frontend evidence under `docs/capturas/`.

### Deviations and risks

- Existing `docs/capturas/HU-001-login.png` and `HU-001-roles.png` were preserved untouched but are not claimed as frontend completion evidence. Manual browser observation and traceable capture links remain required; HU status is `PENDING_EVIDENCE`.
    - The aggregate worktree contains prior frontend/auth/styling changes outside this closure slice. This slice did not modify backend or generated content.

## Final apply / evidence / precommit audit

### Status consumed

```yaml
schemaName: spec-driven
changeName: complete-hu-001-authentication-and-protected-frontend-shell
artifactStore: openspec
planningHome:
  root: docs/openspec
  changesDir: docs/openspec/changes
changeRoot: docs/openspec/changes/complete-hu-001-authentication-and-protected-frontend-shell
artifacts: { proposal: done, specs: done, design: done, tasks: done, applyProgress: done }
taskProgress: { total: 26, complete: 26, remaining: 0, unchecked: [] }
deferredParentActions: { total: 0, complete: 0, remaining: 0, unchecked: [] }
taskArtifactErrors: []
applyState: all_done
dependencies: { apply: all_done, verify: blocked, sync: blocked, archive: blocked }
actionContext:
  mode: repo-local
  workspaceRoot: C:\dev\Fratelli-s-System
  allowedEditRoots: [C:\dev\Fratelli-s-System]
  warnings: ["No native status JSON was supplied; status was reconstructed from authoritative docs/openspec artifacts."]
nextRecommended: parent-lifecycle
isNonAuthoritative: false
```

### Evidence reconciliation and persisted completion

- Inspected the current HU-001 documentation and both existing, linked captures without changing either image. `HU-001-login.png` is a real Login capture; `HU-001-roles.png` is a real authenticated Inicio/roles/logout capture.
- Accepted the user's explicit manual-validation statement as valid provenance for keyboard/focus and 360 px, ~403 px, tablet, and desktop overflow checks; Login → Inicio → F5; protected-request `401` recovery; role denial; successful logout; and recoverable failed logout.
- Updated `docs/historias/HU-001-iniciar-cerrar-sesion.md` to record that provenance and link each capture only to the state it actually shows. Updated frontend README/manual with the final validation boundary.
- Marked and re-read the three completed implementation checkboxes: responsive/keyboard validation, browser runtime lifecycle validation, and final documentation/linked evidence. The persisted task artifact now visibly reports **26/26 `[x]`**.

### Precommit-quality, security, scope, and API audit

- From `frontend/`: `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test`, and `pnpm run build` all passed. Vitest: 7 files / 33 tests; Vite transformed 1,881 modules.
- `git diff --check` passed. Diff scope contains no `backend/**` file. `frontend/src/types/api.generated.ts` has no content diff; it remains unmodified generated output despite its pre-existing worktree line-ending indication.
- Security scan found no persistent browser-token API (`localStorage`, `sessionStorage`, IndexedDB, or `document.cookie`) in frontend production source. Direct `fetch` remains confined to the shared HTTP boundary; `refetch` UI method names are not transport calls.
- Reviewed the generated-contract references: the auth adapter derives `LoginRequest`, `AuthResponse`, and `AuthUser` from `components['schemas']`; no backend or OpenAPI contract was changed.

### Files changed in this audit slice

- `docs/openspec/changes/complete-hu-001-authentication-and-protected-frontend-shell/tasks.md`
- `docs/openspec/changes/complete-hu-001-authentication-and-protected-frontend-shell/apply-progress.md`
- `docs/historias/HU-001-iniciar-cerrar-sesion.md`
- `frontend/README.md`
- `frontend/docs/manual-de-uso.md`

### Remaining work and lifecycle boundary

- No implementation-owned tasks remain. No verify, archive, git, receipt, review, or delivery-gate action was run or claimed.
- Workload/PR boundary: no forecast guard lines; this was logical apply closure only, with no PR created.
