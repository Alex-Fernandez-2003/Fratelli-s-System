# Complete HU-001 authentication and protected frontend shell

## Outcome

Complete HU-001 in the React frontend without changing the existing ASP.NET Core authentication contract. The frontend will hold the access JWT only in memory, restore a browser session from the HttpOnly refresh cookie after F5, and give future protected features one shared HTTP, session, route-guard, and role boundary.

## Why

The backend already implements login, refresh-token rotation, logout, and `/me`; the frontend currently has only `src/lib/api/http-client.ts` and `/dev/ui-kit`. Without a shared foundation, each feature would independently manage Bearer headers, refreshes, errors, and cache lifetime, including a refresh-rotation race.

## Scope

### In

- Frontend auth feature, session coordinator, auth API adapter, provider/hook, and tests.
- Shared HTTP client automatic Bearer, eligible-401 refresh/retry, and single-flight coordination.
- `/login`, authenticated `/inicio`, `/403`, authentication and role guards, and logout/cache lifecycle.
- Login visual states, responsive/accessibility work, neutral icon-capable password toggle, and only the SVG tooling/assets proven necessary by the approved references.
- Frontend developer documentation, HU-001 completion documentation, and real implementation evidence.

### Out

- Any backend, Identity, migration, endpoint, OpenAPI-contract, or refresh-cookie-policy change.
- JWT persistence in localStorage, sessionStorage, IndexedDB, cookies managed by JavaScript, or URL state.
- Cross-tab refresh coordination, registration, password recovery, OAuth, user/role administration, dashboards/KPIs, and other product modules.
- Invented visual measurements or assets not observable in the five approved Login references.

## Existing contract to consume

| Operation | Frontend use | Result |
|---|---|---|
| `POST /api/v1/auth/login` | anonymous, JSON `{ username, password }` | `200 AuthResponse`; `400`/`401` ProblemDetails |
| `POST /api/v1/auth/refresh` | anonymous, cookie only | `200 AuthResponse` and rotated cookie; `401` invalid session |
| `POST /api/v1/auth/logout` | anonymous, cookie optional | `204`; backend expires the cookie |
| `GET /api/v1/auth/me` | Bearer | `200 AuthUser`; `401`/`404` |

Use `components['schemas']['LoginRequest']`, `AuthResponse`, and `AuthUser` from `frontend/src/types/api.generated.ts`. `AuthResponse` is `{ accessToken: string; expiresAt: string; user: AuthUser }`; `AuthUser` is `{ id; username; fullName; employeeId; roles: string[] }`. Do not decode JWTs for identity or role truth.

The backend access token expires after 15 minutes. The refresh cookie is HttpOnly, SameSite=Strict, Path `/api/v1/auth`, Secure outside Development, is rotated on refresh, and has a 12-hour absolute lifetime.

## Success criteria

- Login, F5 bootstrap, protected navigation, role denial, and logout work against the contract above.
- The access token exists only in a non-persistent module-owned memory state.
- Every normal `httpClient` attempt attaches its current Bearer immediately before dispatch; auth bootstrap operations bypass automatic refresh.
- Concurrent eligible `401`s share one refresh; each original request retries at most once with the newly read token.
- `403` and all non-`401` HTTP errors remain observable `HttpError`s and never initiate refresh.
- Definitive session loss and successful logout cancel and clear private TanStack Query state; failed remote logout preserves local session and reports a recoverable failure.
- No route decides while bootstrap is `checking`; `/inicio` is protected and a role mismatch renders `/403`.

## Delivery boundaries

Implementation may change frontend files required by these capabilities plus the planned documentation/evidence files. It must retain `frontend/src/lib/api/http-client.ts` as the shared HTTP boundary, `QueryProvider` as the source of the QueryClient, `AuthLayout`/`AppShell` and existing atoms/molecules as UI foundations, and preserve `/dev/ui-kit`.
