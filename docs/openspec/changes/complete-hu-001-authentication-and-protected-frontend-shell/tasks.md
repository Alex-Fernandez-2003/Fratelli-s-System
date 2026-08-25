# Apply tasks: HU-001 frontend completion

> Apply in this order. Use strict RED → GREEN → TRIANGULATE → REFACTOR for session, HTTP, provider, and routing behavior. Do not run Apply, Verify, or Archive as part of planning.

## 1. Reconfirm contracts and freeze visual inputs

- [x] Record the implementation baseline and re-read `backend/src/RestaurantSystem.Api/Program.cs`, `backend/src/RestaurantSystem.Application/Auth/AuthContracts.cs`, `frontend/src/types/api.generated.ts`, and relevant frontend integration points. Stop for a contractual blocker rather than changing backend/OpenAPI.
- [x] Visually inspect all five approved Login PNGs and record only observable desktop/mobile/state differences in implementation notes/tests; do not invent geometry or substitute uninspected assets.
- [x] Confirm whether the inspected design truly needs external icons and/or a custom SVG React component before changing `frontend/package.json`, `pnpm-lock.yaml`, or `frontend/vite.config.ts`.

## 2. Establish session and HTTP behavior with tests

- [x] **RED:** add focused Vitest tests for a React-neutral coordinator in `frontend/src/lib/auth/`: memory-only set/clear, refresh success/failure, promise reset, generation invalidation, and five concurrent callers.
- [x] **GREEN:** implement the smallest coordinator with current token, shared `refreshPromise`, and epoch guards; no React, QueryClient, or browser storage import.
- [x] **TRIANGULATE/REFACTOR:** cover stale completion after clear, repeated refresh after settlement, and refresh failure; simplify only with all focused tests green.
- [x] **RED:** add `frontend/src/lib/api/http-client` tests for dispatch-time Bearer, raw auth bypass, one eligible-401 refresh/retry, rebuilt retry headers/body/query, retry-401 stop, and 403/400/404/409/5xx/network no-refresh.
- [x] **GREEN:** refactor the existing client into raw transport plus auth-aware policy while retaining `credentials: 'include'`, timeout, ProblemDetails, and 204 behavior. Add only needed endpoint/query helpers.
- [x] **TRIANGULATE/REFACTOR:** prove concurrent 401 requests use exactly one refresh and every original request retries no more than once.

## 3. Build auth feature and cache lifecycle

- [x] Add `frontend/src/features/auth/` API adapter/types derived from `components['schemas']`; use raw client operations for login/refresh/logout and generated `AuthResponse`/`AuthUser`.
- [x] **RED:** add provider tests for checking → authenticated/unauthenticated bootstrap, login response handling, role helpers, stale bootstrap suppression, and token non-exposure.
- [x] **GREEN:** implement `AuthProvider`/public hook and place it in `frontend/src/main.tsx` inside `QueryProvider` so `useQueryClient()` is valid.
- [x] **RED:** add logout/cache tests for `204` cancel+clear+state clear, refresh-loss cleanup, late request protection, and failed remote logout preserving session/cache.
- [x] **GREEN/TRIANGULATE:** implement epoch-first cleanup and recoverable logout errors; prove a stale completion cannot repopulate auth state after logout.

## 4. Implement UI and routing

- [x] If reference inspection requires it, add `lucide-react` with pnpm and retain shared `ReactNode` icon contracts. Add `vite-plugin-svgr` and `?react` support only if an actual custom SVG component is required; test the import/build path. (Not required: inline ReactNode SVG icons are sufficient.)
- [x] Extend `frontend/src/components/molecules/FormFields.tsx` `PasswordInput` neutrally for visual icon toggle while preserving labels, keyboard operation, entered value, and accessible reveal/hide names; add RTL coverage.
- [x] **RED:** add Login tests for required username/password validation, loading/duplicate-submit prevention, generic 401 rejection, controlled non-401 failure, and accessibility associations.
- [x] **GREEN:** add Login page/feature styles using `AuthLayout`, form atoms/molecules, `Alert`, `Spinner`, and approved-reference observations. Validate normal/loading/validation/rejected/mobile states.
- [x] **RED:** add route tests for bootstrap hold/no Login flash, unauthenticated intended-location redirect, authenticated `/login` redirect, authenticated Inicio, and role mismatch.
- [x] **GREEN/TRIANGULATE:** implement `RequireAuth`, `RequireAnyRole`, `ForbiddenPage`, `InicioPage`, and routes `/login`, `/inicio`, `/403` in `frontend/src/routes/AppRoutes.tsx`; preserve DEV `/dev/ui-kit`.
- [x] Check Login, Forbidden, and Inicio by keyboard and at 360 px, ~403 px, tablet, and desktop for focus visibility and no horizontal overflow.

## 5. Validate, document, and evidence

- [x] Run focused auth/session/HTTP/route tests first, then from `frontend/` run exactly: `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test`, and `pnpm run build`.
- [x] With Development backend available, run `pnpm run api:generate`; inspect any generated difference against `Program.cs` before accepting it.
- [x] Perform real runtime validation: login → Inicio → F5 bootstrap → protected request/401 recovery → role denial → successful logout; separately demonstrate failed logout remains recoverable.
- [x] Update `frontend/README.md`, `frontend/docs/manual-de-uso.md`, and `docs/historias/HU-001-iniciar-cerrar-sesion.md` with final observed APIs/results only; add real, linked frontend evidence under `docs/capturas/`.
- [x] Review final diff against `proposal.md` and all `specs/` requirements. Confirm no backend/migration/OpenAPI-contract edit, persistent JWT storage, cross-tab refresh, unrelated feature, dashboard, or fabricated evidence.

## Expected edit surfaces during apply

- `frontend/src/lib/auth/**`, `frontend/src/lib/api/**`, `frontend/src/features/auth/**`, `frontend/src/routes/**`, `frontend/src/pages/**`, `frontend/src/main.tsx`, focused frontend tests, and only necessary shared component/style/config/package files.
- After implementation succeeds: `frontend/README.md`, `frontend/docs/manual-de-uso.md`, `docs/historias/HU-001-iniciar-cerrar-sesion.md`, and real files in `docs/capturas/`.
- Never: `backend/**`, migrations, manual edits to `frontend/src/types/api.generated.ts`, or unrelated feature modules.
