# Session lifecycle and authenticated HTTP specification

## Requirements

### Requirement: Auth adapter consumes the generated backend contract

The frontend SHALL call `POST /api/v1/auth/login` with `components['schemas']['LoginRequest']`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, and `GET /api/v1/auth/me` using types derived from `frontend/src/types/api.generated.ts`. Login and refresh SHALL consume `AuthResponse`; identity and roles SHALL come from `AuthResponse.user` or `AuthUser`, never JWT decoding. Auth operations SHALL include credentials and bypass automatic Bearer/refresh recursion.

#### Scenario: Valid login

- **WHEN** credentials receive `200 AuthResponse`
- **THEN** the adapter returns the generated response shape and makes no attempt to read the HttpOnly cookie.

### Requirement: Access JWT is memory-only

The session coordinator SHALL be the sole owner of the access token in process memory. It SHALL not write the token to browser storage, cookies, URLs, query cache, logs, or React context.

#### Scenario: Page reload

- **GIVEN** an authenticated browser reloads the SPA
- **WHEN** the new JavaScript context starts
- **THEN** it has no previous access token and restores only through cookie-backed refresh.

### Requirement: Bootstrap uses refresh and protects stale state

The auth lifecycle SHALL start in `checking` and issue one raw refresh request. A valid `AuthResponse` SHALL set current token/user and authenticate; refresh `401` SHALL resolve unauthenticated without an error loop. Async login/refresh/bootstrap completions whose captured session generation is stale SHALL not restore token, user, or cache after clear/logout.

#### Scenario: Logout during bootstrap

- **GIVEN** refresh is pending
- **WHEN** logout clears the session before refresh settles
- **THEN** the late refresh result is ignored.

### Requirement: Bearer and retry policy is bounded

Normal shared-client requests SHALL add the latest `Authorization: Bearer <token>` immediately before dispatch when a token exists. Their first `401` MAY perform/join one refresh and retry the original request once, rebuilding headers from original inputs and current token. Login, refresh, logout, and a request already retried SHALL never invoke this policy.

#### Scenario: Stale token is replaced for retry

- **GIVEN** a request receives `401` with token A and refresh returns token B
- **WHEN** it retries
- **THEN** its retry has Bearer B, preserves method/body/query/caller headers, and has no Bearer A.

#### Scenario: Retry remains unauthorized

- **GIVEN** the retry receives `401`
- **THEN** it propagates `HttpError(401)` and starts no additional refresh.

### Requirement: Concurrent refreshes are single-flight

Within one SPA instance, all eligible requests needing refresh SHALL await one shared refresh promise. The promise SHALL be cleared after success or failure so a later eligible lifecycle may start a new refresh.

#### Scenario: Five concurrent unauthorized requests

- **WHEN** five first attempts receive `401` concurrently
- **THEN** exactly one refresh request is dispatched and each original request attempts at most one retry.

### Requirement: Status handling preserves authorization semantics

Only a first eligible normal-request `401` may trigger refresh. `403`, `400`, `404`, `409`, `5xx`, aborts, timeouts, and network failures SHALL propagate through existing error semantics and SHALL not refresh. `403` SHALL remain distinguishable as authorization denial.

#### Scenario: Forbidden API response

- **WHEN** a protected API returns `403`
- **THEN** the caller receives `HttpError` with status 403 and refresh count remains zero.

### Requirement: Session loss and logout protect private cache

On refresh rejection that definitively loses session, or on remote logout `204`, the lifecycle SHALL advance session generation, cancel queries, clear the QueryClient, and clear local auth state. Logout network/timeout/`5xx` failure SHALL preserve token, user, cache, and route while exposing a recoverable failure; JavaScript SHALL not delete the HttpOnly cookie.

#### Scenario: Failed remote logout

- **WHEN** logout cannot obtain a semantically successful `204`
- **THEN** the user remains authenticated locally and can retry logout.
