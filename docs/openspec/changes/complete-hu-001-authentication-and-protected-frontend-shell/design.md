# Design: memory-only session and protected shell

## Decision summary

Use a React-neutral session coordinator below `frontend/src/lib/auth/` as the only access-token owner. `frontend/src/lib/api/http-client.ts` reads that coordinator at dispatch time; `features/auth` owns contract adapters and React state. This prevents React/HTTP cycles and serializes refresh-cookie rotation per SPA instance.

## Baseline integration points

| Concern | Actual baseline | Planned responsibility |
|---|---|---|
| HTTP | `frontend/src/lib/api/http-client.ts` | retain fetch, timeout, JSON/ProblemDetails parsing, and `credentials: 'include'`; add auth policy |
| API routes | `frontend/src/lib/api/endpoints.ts` | expose auth paths rather than scattering literals |
| generated types | `frontend/src/types/api.generated.ts` | derive auth request/response aliases; never edit generated output |
| query | `frontend/src/lib/query/provider.tsx` | `AuthProvider` obtains its `QueryClient` with `useQueryClient()` |
| provider tree | `frontend/src/main.tsx` | nest `AuthProvider` inside `QueryProvider` and above `BrowserRouter`/routes as required by its hook use |
| routes | `frontend/src/routes/AppRoutes.tsx` | retain DEV `/dev/ui-kit`; add Login/Inicio/Forbidden and guards |
| layouts | `src/components/templates/AuthLayout.tsx`, `AppShell.tsx` | reuse, extending only neutral presentation needs |
| password control | `src/components/molecules/FormFields.tsx` | make the existing `PasswordInput` icon-toggle capable while retaining accessible labels |

## Session state and ownership

Create a coordinator with an in-memory `accessToken`, an in-flight `refreshPromise`, and monotonically increasing session epoch/generation. It must expose behavior, not the token through React context:

- accept an `AuthResponse` after login or refresh and atomically make its token current;
- clear token and advance epoch on definitive loss or confirmed logout;
- provide one refresh operation shared by concurrent callers;
- capture epoch before asynchronous work and ignore a completion whose epoch is no longer current;
- reset the shared promise after settlement.

`AuthProvider` is the React owner of `checking | authenticated | unauthenticated`, `AuthUser`, role helpers, pending/error state, `login`, and `logout`. It never persists or exposes the JWT. Initial status is `checking`; it calls the auth adapter's raw refresh operation. A `401` refresh means normal unauthenticated state, while unexpected failures are surfaced as an appropriate bootstrap/recoverable state without fabricating a logged-in user.

## HTTP policy

Split raw transport from authenticated request policy in `http-client.ts`; both retain `credentials: 'include'`, timeout handling, `Accept: application/json`, JSON body handling, `204` behavior, and `HttpError` ProblemDetails.

1. Auth adapter calls login, refresh, and logout through explicit raw/no-auto-refresh options. Those calls do not get Bearer and cannot recursively refresh.
2. Normal requests build `Headers` immediately before each attempt, preserving caller headers/body/query and adding `Authorization: Bearer <current token>` only when a token exists.
3. On the first eligible normal-request `401`, join/start coordinator refresh. If refresh succeeds and belongs to the current epoch, rebuild headers from the request inputs and retry exactly once.
4. A retry `401`, refresh `401`, refresh network failure, abort/timeout, or any non-`401` original response is not retried by this policy. `403`, `400`, `404`, `409`, and `5xx` propagate as `HttpError` without refresh.
5. When refresh is definitively rejected, notify the auth lifecycle to clear session/query state once for the epoch. Request callers receive their terminal error; no loop or silent success is allowed.

The public API must not require token arguments. Add only the HTTP verbs/query serialization actually consumed by this change or existing planned consumers; preserve generated request shapes.

## Query and logout race policy

On confirmed remote `POST /api/v1/auth/logout` `204`, first advance epoch, then cancel queries and clear the `QueryClient`, clear coordinator/auth state, and navigate to Login. On definitive refresh rejection, use the same private-cache cleanup path. Cancellation prevents active private requests from repopulating cache; epoch checks prevent stale auth/bootstrap completions from restoring state after logout.

If logout receives a network error, timeout, or `5xx`, do **not** clear local state, do not navigate, and do not claim success. Keep a recoverable error so the user may retry. JavaScript never deletes the HttpOnly cookie.

## Routing and authorization

`RequireAuth` reads the provider. While `checking`, render a neutral accessible bootstrap state—not Login and not a redirect. When unauthenticated, redirect to `/login` with the intended location state. When authenticated, render its outlet/children.

`RequireAnyRole` composes after `RequireAuth`; it checks `AuthUser.roles` using exact backend strings (`ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA`, `EMPLEADO`). A mismatch navigates/renders `/403`; it is distinct from an API `403`. `/login` redirects authenticated users to `/inicio`; `/inicio` uses `AppShell` and only session confirmation, identity/roles, and logout—no dashboard. `ForbiddenPage` gives a generic denial and a route back to Inicio.

## UI, icon, SVG, and accessibility

Build Login with `AuthLayout`, `FormField`, `Input`, `PasswordInput`, `Button`, `Alert`, and `Spinner`; do not create parallel Login-only primitives. Implement the approved normal, submitting, validation-error, invalid-credential, desktop, and mobile states after reviewing the five source PNGs during apply. Preserve visible labels, required semantics, inline errors connected by `aria-describedby`, `aria-invalid`, keyboard submit, focusable controls, busy state, and an icon-only password toggle with an accessible name.

`Button.leftIcon/rightIcon` already accept `ReactNode`; retain that neutral contract. If an icon library is necessary after reference inspection, add `lucide-react` only as a consumer implementation, never as a shared prop type. `vite.config.ts` currently has no SVGR plugin: add `vite-plugin-svgr`, `?react` imports, and any Vite declaration only if a real custom SVG component is required. Do not encode SVG as base64 or hand-transcribe large SVG paths.

Validate responsive behavior at 360 px, approximately 403 px, tablet, and desktop; prevent horizontal overflow and preserve usable target sizes/focus visibility.

## Evidence and documentation

After implementation validation, update `frontend/README.md`, `frontend/docs/manual-de-uso.md`, and `docs/historias/HU-001-iniciar-cerrar-sesion.md` with final APIs, no-token-consumer guidance, route/role behavior, real commands/results, and actual screenshots in `docs/capturas/`. Do not state or capture results before they occur.

## Rejected alternatives

- Persistent JWT storage: conflicts with the memory-only requirement and increases XSS exposure.
- JWT parsing for user state: duplicates server truth already supplied by `AuthResponse.user` and `/me`.
- Refresh in each request independently: unsafe with backend refresh rotation.
- Refresh on 403: conflates authorization with authentication and masks real denials.
- HTTP client calling `useAuth`: invalid hook usage and a React/transport cycle.
