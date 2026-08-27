# Design

## Repository facts and boundaries

`ApplicationDbContext` is `IdentityDbContext<IdentityUser>`. `AddDbContext<ApplicationDbContext>` and `AddIdentityCore<IdentityUser>().AddEntityFrameworkStores<ApplicationDbContext>()` are registered in the same scoped DI container, so the Identity EF store and application services use the same scoped `ApplicationDbContext` and database connection. `Employee` has a required, unique `UserId` FK to Identity and independently owns `FullName` and `IsActive`. `UserSession` stores hashed refresh tokens and a per-user index.

`AuthService.IsActiveAsync` currently requires both Identity's shadow `IsActive` property and the absence of an inactive Employee. HU-002 does **not** synchronize those fields. Identity `IsActive` remains the account-administration source of truth; the existing login gate additionally respects Employee operational eligibility until a separately approved change alters that policy. Account activate/deactivate changes only Identity `IsActive`, preserving Employee history/state.

## Account audit placement and migration

The audited object is the **Identity account**, not the Employee employment record. The minimum coherent schema evolution is two nullable EF shadow properties on `IdentityUser` / `identity.AspNetUsers`:

- `CreatedByUserId`
- `UpdatedByUserId`

They are set from the authenticated `ADMINISTRADOR` UserId: both at account creation; `UpdatedByUserId` for full-name/username/roles/password/activation/deactivation mutations. They are server-owned and omitted from requests and read DTOs. `Employee` receives no account-audit fields.

No new `CreatedAt` or `UpdatedAt` columns are required: the Identity account currently has no timestamp convention, and product scope requires actor fields plus existing conventions, not speculative timestamps. The HU-002 migration is therefore required only for these two nullable account columns; it must be new and must never edit previous migrations.

## Atomic User + Employee creation

The users application service begins an explicit `ApplicationDbContext.Database.BeginTransactionAsync` transaction before Identity mutation. Because the UserStore and `ApplicationDbContext` are scoped to the same context/connection, `UserManager` saves participate in that transaction.

```text
BEGIN TRANSACTION
  validate fullName, username and canonical non-empty role set
  create IdentityUser through UserManager.CreateAsync(user) -- no password
  set account CreatedByUserId and UpdatedByUserId to actor
  assign exact selected roles through UserManager.AddToRolesAsync(user, roles)
  add Employee { UserId, FullName, IsActive = true }
  save account shadow audit values / Employee
COMMIT
```

Any Identity result failure, role-assignment failure, Employee validation/database failure, or save failure rolls back the transaction; no partial Identity User, roles or Employee remain. `RoleManager` may validate/exist-check canonical roles but is **not** used to assign a role to a user. APPLY must retain a focused integration test that forces the Employee leg to fail and proves rollback.

## Roles, account lifecycle and password

`RoleNames.All` remains the backend authority for the six roles. Input roles are deduplicated and must be a non-empty subset. Update uses one `PUT /api/v1/users/{id}` with the complete editable `{ fullName, username, roles }` state. It updates `Employee.FullName` with account full name because that is its existing presentation linkage; it does not modify `Employee.IsActive`.

`UserDto` exposes safe administrative fields only: `id`, `employeeId`, `fullName`, `username`, `roles`, `isActive`, and read-only `hasPassword`. `hasPassword` is derived server-side through the Identity user state (equivalent to non-empty PasswordHash) and never exposes the hash.

Password endpoint: `PUT /api/v1/users/{id}/password` with `{ newPassword }`, returning 204. For no password use `UserManager.AddPasswordAsync`; for an existing password use the Identity administrator-reset-token flow and `ResetPasswordAsync`. Neither path writes `PasswordHash` directly. Those Identity APIs update SecurityStamp as part of password-hash update; HU-002 relies on that single Identity rotation and does **not** add a redundant second explicit rotation. In both cases it records `UpdatedByUserId` and revokes all target refresh sessions after success.

Activation and deactivation are explicit `POST /api/v1/users/{id}/activate` and `/deactivate`, both 204 and idempotent for already-in-target-state accounts. Both update Identity `IsActive`, set `UpdatedByUserId`, explicitly call `UserManager.UpdateSecurityStampAsync` once, and revoke all target sessions. Deactivation therefore invalidates prior credentials; activation deliberately rotates again as a defensive generation boundary and does not create a password or alter Employee state.

## Exact last-active-administrator concurrency strategy

Use one strategy only: a PostgreSQL row lock on the canonical ADMINISTRADOR `identity.AspNetRoles` row.

For every mutation that can reduce the active administrator set (deactivate a current admin, or update a user whose resulting role set removes ADMINISTRADOR), begin an explicit `ReadCommitted` transaction and issue the provider-specific command on the current `ApplicationDbContext` connection/transaction:

```sql
SELECT "Id"
FROM identity."AspNetRoles"
WHERE "NormalizedName" = 'ADMINISTRADOR'
FOR UPDATE;
```

After that lock is acquired, reload the target User and current role membership, recount active Identity accounts with ADMINISTRADOR, execute self-deactivation/self-admin-removal checks, execute the last-active-admin check, mutate and commit. Every dangerous path uses this same lock before its recount; ordinary non-dangerous profile updates do not need it. `ReadCommitted` is sufficient because the canonical locked row is a mutex for all writers preserving this invariant.

Lock wait/cancellation/deadlock or unique concurrency failures return a controlled `409 ProblemDetails` asking the client to retry; no automatic retry repeats an administrative mutation. A PostgreSQL integration test sends two concurrent dangerous mutations against two active administrators and asserts that at most one commits and the invariant remains true.

## Session revocation

JWTs gain the private claim `rst` (restaurant security token): a base64url SHA-256 fingerprint of the current `IdentityUser.SecurityStamp`, never the raw stamp. `JwtTokenService` receives the current stamp at issue time.

`JwtBearerEvents.OnTokenValidated` is the validation boundary for every Bearer-protected request (including hub auth): resolve User by stable NameIdentifier, require existence and Identity `IsActive`, calculate its current `rst` fingerprint and require constant-time equality with the token claim. Failure calls `context.Fail` and returns 401 before authorization. This adds one Identity/security lookup per protected request, an accepted MVP cost; no Redis, blacklist, cache or external infrastructure is introduced.

Sensitive mutation behavior is exact:

| Mutation | SecurityStamp | Target UserSessions |
| --- | --- | --- |
| Role set changes | Explicitly rotate once after roles persist | Revoke all |
| Deactivate | Explicitly rotate once | Revoke all |
| Activate | Explicitly rotate once | Revoke all |
| First/set/reset password | Rotated by Identity password API once | Revoke all |
| Name/username only | No rotation | Unchanged |

`IRefreshTokenService` gains `RevokeAllAsync(userId)`, setting `RevokedAt` only for usable target sessions. Login and refresh retain generic authentication failures and do not reveal that a disabled username exists. A stale access token fails at the next protected request; a refresh attempt fails because its session was revoked; another user’s access/refresh sessions remain valid.

## API and errors

All `/api/v1/users` endpoints require a new `UsersManage` policy with exactly `ADMINISTRADOR`.

- `GET /api/v1/users?page=1&pageSize=10&search=&role=&isActive=` → existing `PagedResponse<UserDto>`; max 100. Trim search and use PostgreSQL-compatible case-insensitive matching on full name and username.
- `GET /api/v1/users/{id}` → 200/404.
- `POST /api/v1/users` → 201; `{ fullName, username, roles }`; no password or actor fields.
- `PUT /api/v1/users/{id}` → 200; complete editable `{ fullName, username, roles }`.
- `PUT /api/v1/users/{id}/password` → 204.
- `POST /api/v1/users/{id}/activate` and `/deactivate` → 204.

Use existing ProblemDetails: 400 validation/invalid role; 401 missing/invalid/stale token; 403 authenticated non-admin; 404 missing user; 409 duplicate username, self-lockout, last-admin invariant, or lock/concurrency conflict. Explicit request DTOs prevent mass assignment of PasswordHash, SecurityStamp, account audit metadata and Identity internals.

## Frontend

Reuse HU-001’s AuthProvider, session coordinator, httpClient, QueryClient, RequireAuth, RequireAnyRole, ForbiddenPage and AppShell. Add only `httpClient.put` if needed. A central authenticated navigation configuration declares `/inicio` for authenticated roles and `/usuarios` for ADMINISTRADOR; Sidebar desktop/mobile derives from this same configuration and never lists a route before it exists.

`features/users` owns typed API adapter, normalized query keys (`users`, `users.list(filters)`, `users.detail(id)`), queries and mutations. Every mutation invalidates the users root; own name/username edits also call minimal AuthProvider `/auth/me` synchronization. Own password or allowed own-role changes clear local session after success because the backend has invalidated it. Password form values are component-local only and cleared on close/success.

Desktop renders the approved table composition; mobile at 360px renders cards with the same actions through an accessible overflow menu. Use Tailwind, Lucide and existing/SVGR conventions. Briefing-recorded visual requirements govern implementation; image fidelity is manually validated by the user. No artificial loading delay or fabricated screenshots.

## OpenAPI, ADR, testing and documentation

Order is backend contract → OpenAPI metadata/contract test → `pnpm run api:generate` → generated `api.generated.ts` → frontend adapter/UI. Generated output is never manually edited.

ADR is required because SecurityStamp fingerprint validation changes the cross-cutting JWT/session contract. During APPLY documentation work create `docs/adr/ADR-007-security-stamp-session-revocation.md`; ADR-001 through ADR-006 already exist. It records alternatives rejected (refresh-only, raw stamp, blacklist, distributed cache), lookup cost and revocation behavior.

Backend integration uses PostgreSQL for transaction, lock, Identity and index behavior; no SQLite/EF InMemory substitute for those cases. Future runtime validation uses a disposable PostgreSQL database only. HU-002 documentation is updated after APPLY from the real diff, with complete Backend, Frontend and Documentation/configuration file-manifest tables and open evidence chosen by the user.
