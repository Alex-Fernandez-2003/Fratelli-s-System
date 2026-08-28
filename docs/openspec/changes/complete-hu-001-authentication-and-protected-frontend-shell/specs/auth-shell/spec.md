# Auth shell, routes, and Login UI specification

## Requirements

### Requirement: One React auth source of truth

`AuthProvider` and its public hook SHALL expose status, `AuthUser | null`, role helpers, login, logout, and user-facing pending/error state. It SHALL not expose an access token. It SHALL obtain cache lifecycle access from the existing `QueryProvider`/`useQueryClient()` boundary.

#### Scenario: Role helper

- **GIVEN** an authenticated user with `['ADMINISTRADOR', 'EMPLEADO']`
- **WHEN** a consumer asks for either allowed role
- **THEN** the helper grants access using exact backend role strings.

### Requirement: Authentication and role routes are guarded

`/inicio` SHALL require authentication. Guards SHALL render a neutral bootstrap state while status is `checking`, redirect unauthenticated users to `/login` only after checking completes, and retain the requested location. `/login` SHALL redirect authenticated users to `/inicio`. A reusable any-role guard SHALL deny a missing role via `/403`, independently of an API 403.

#### Scenario: Direct protected navigation after F5

- **GIVEN** a browser opens `/inicio` with a valid refresh cookie
- **WHEN** bootstrap is pending then succeeds
- **THEN** Login is never flashed and Inicio is rendered authenticated.

#### Scenario: Role mismatch

- **GIVEN** an authenticated user lacks a route's allowed role
- **WHEN** they navigate to that route
- **THEN** they see the generic Forbidden page rather than Login or a refresh attempt.

### Requirement: Inicio and Forbidden pages are deliberately minimal

`InicioPage` SHALL use `AppShell` and show only authenticated-session confirmation, available identity/roles as appropriate, and a logout action. It SHALL not introduce a dashboard, KPI, or product module. `ForbiddenPage` SHALL provide a generic 403 explanation and a route back to Inicio without exposing policy internals. The DEV-only `/dev/ui-kit` route SHALL remain available.

### Requirement: Login uses existing UI foundations and approved reference states

`LoginPage` SHALL use `AuthLayout`, existing form primitives, feedback, and action components. It SHALL support normal, submit/loading, client validation error, and rejected-credential error states. Before implementation, the five approved reference images—Normal Desktop, Loading Desktop, Error Validación Desktop, Credenciales Rechazadas Desktop, and Móvil—SHALL be visually reviewed and their observable layout/copy/icon differences applied without inventing unobserved geometry.

#### Scenario: Invalid credentials

- **WHEN** login returns `401`
- **THEN** the page keeps entered credentials as appropriate, re-enables submission, and displays a controlled generic rejection rather than raw ProblemDetails detail.

### Requirement: Login is accessible and responsive

Login SHALL preserve visible labels, required-field semantics, keyboard submission, focus visibility, `aria-invalid`, and error-to-control `aria-describedby` association. Submitting state SHALL disable duplicate submission and expose busy status. The password reveal control SHALL preserve entered value, operate by keyboard, and have a changing accessible name. The layout SHALL be verified without horizontal overflow at 360 px, approximately 403 px, tablet, and desktop.

### Requirement: Icons and SVG remain replaceable

Shared icon-bearing props SHALL remain `ReactNode`; no shared component SHALL export a Lucide-specific type. If reference-driven implementation needs an icon library, it SHALL use `lucide-react` only in consumers. If a real custom SVG component is required, Vite SHALL gain `vite-plugin-svgr` and `?react` import support with a typecheck/build smoke test; otherwise neither SVG tooling nor base64 SVG SHALL be added.
