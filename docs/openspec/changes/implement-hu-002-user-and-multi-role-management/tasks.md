# Tasks

## Slice 1 — Data, Identity and security groundwork

- [x] **T01 Revalidate implementation baseline.** Record the actual `develop` commit, DbContext/Identity store scope, migration snapshot, UserSession behavior, login active-state gate, scripts and HU-001 extension points. Confirm the shared scoped ApplicationDbContext transaction premise before code changes.
- [x] **T02 Prepare account audit migration.** Add only nullable Identity-account `CreatedByUserId`/`UpdatedByUserId` shadow properties and a new migration; do not add timestamps or Employee audit fields. Apply against a disposable PostgreSQL database and inspect snapshot/diff.
- [x] **T03 Add security-generation issuance/validation.** Emit private `rst` SecurityStamp fingerprint claim and implement `OnTokenValidated` user/IsActive/fingerprint validation for HTTP and hubs. Add tests for stale/missing claim and current token behavior.
- [x] **T04 Add target revoke-all sessions.** Extend refresh-session service with UserId-scoped revoke-all and prove all target sessions revoke while another user survives.
- [x] **T05 Implement canonical administrator row lock.** Use the exact ReadCommitted `SELECT ... FOR UPDATE` ADMINISTRADOR-role-row protocol for dangerous mutations, controlled 409 conflict behavior and PostgreSQL concurrent-race integration test.

## Slice 2 — Users application and API

- [x] **T06 Define Users contracts and validation.** Add explicit list/detail/create/update/password contracts and safe UserDto; validate canonical distinct non-empty roles, paging (10 default, 100 max), search/filter inputs and mass-assignment exclusion.
- [x] **T07 Implement transactional User + Employee creation.** Use explicit shared-DbContext transaction, `UserManager.CreateAsync` without password, `UserManager.AddToRolesAsync`, linked Employee and account actor audit. Test success, exact roles, no password and forced Employee/role rollback.
- [x] **T08 Implement list/detail queries.** Reuse PagedResponse; implement PostgreSQL-compatible trimmed case-insensitive name/username search, role/status filters and metadata tests.
- [x] **T09 Implement profile/role update.** Replace editable name/username/role set, update account updatedBy and linked Employee full name; rotate/revoke only when roles change. Test duplicate username, zero roles, multi-role and self-admin removal.
- [x] **T10 Implement administrative password flow.** Use AddPasswordAsync or reset-token/ResetPasswordAsync without direct hash mutation; rely on Identity's one stamp update and revoke sessions. Test first/replacement/policy/no-secret response.
- [x] **T11 Implement account activate/deactivate.** Change Identity IsActive only, update audit, explicitly rotate once and revoke all sessions for both actions; enforce self-deactivation and last-admin behavior; test idempotency and Employee state preservation.
- [x] **T12 Map protected REST endpoints.** Add `UsersManage` policy and `/api/v1/users` GET/GET-by-id/POST/PUT/password/activate/deactivate endpoint metadata with coherent ProblemDetails status codes. Prove all five non-admin canonical roles receive 403.
- [x] **T13 Complete backend gate.** Run actual restore/build/tests and PostgreSQL integration coverage for UM, AL and SR requirements before frontend contract generation.

## Slice 3 — OpenAPI and generated contract

- [x] **T14 Validate OpenAPI Users metadata.** Inspect generated OpenAPI for requests, UserDto, pagination, policy and 400/401/403/404/409 ProblemDetails.
- [x] **T15 Regenerate TypeScript contract.** Run `pnpm run api:generate`; review generated diff and confirm no manual edit to `api.generated.ts`.
- [x] **T16 Extend shared HTTP only as needed.** Add PUT support to httpClient if still absent, preserving automatic Bearer, refresh and no-token-argument rules.

## Slice 4 — Shared navigation and users feature

- [x] **T17 Add central role-aware navigation.** Define one config for only `/inicio` and `/usuarios`; derive shared desktop/mobile Sidebar with normalized AuthProvider roles and Lucide icons.
- [x] **T18 Extract shared authenticated layout and route.** Reuse AppShell/Outlet/header/logout; register `/usuarios` with existing RequireAuth + RequireAnyRole([ADMINISTRADOR]); preserve `/inicio` and ForbiddenPage.
- [x] **T19 Create users API/query layer.** Add generated-type API adapter, normalized keys and list/detail/create/update/password/activate/deactivate hooks; every mutation invalidates the users root.
- [x] **T20 Build list/filter/pagination UI.** Implement approved desktop composition with safe data only, role/status badges, search/filter/page state, loading, error/retry, first-empty and filtered-empty states.
- [x] **T21 Build responsive mobile list.** Render cards at 360px with all actions available through accessible overflow actions; retain semantic functional parity with desktop.
- [x] **T22 Build create/edit dialogs.** Implement fullName/username/explicit-role forms; prevent zero roles, omit password from create/edit and surface ProblemDetails.
- [x] **T23 Build password and lifecycle dialogs.** Implement hasPassword wording, local-only cleared secrets, confirm-password UX, Eye/EyeOff, accessible activate/deactivate confirmations and pending states.
- [x] **T24 Synchronize current admin identity.** Refresh `/auth/me` after own name/username update and clear local session after successful own sensitive role/password mutation.

## Slice 5 — Test, runtime and delivery evidence

- [x] **T25 Complete frontend test matrix.** Cover guards, Sidebar visibility, list states, filters, pagination, dialogs, mutation refresh, ProblemDetails, responsive semantics and keyboard/focus behavior without asserting Tailwind strings.
- [x] **T26 Run frontend quality gate.** Execute actual format check, typecheck, lint, tests and build scripts.
- [x] **T27 Run disposable PostgreSQL runtime validation.** Verify admin access; list; create without password; first password; target login; role-change revocation; deactivation revocation; reactivation; filters and mutation refresh. Do not use a personal DB or docker prune.
- [x] **T28 Obtain manual visual validation.** User validates final UI against the five image references and approved briefing requirements. Record only real findings; do not fabricate screenshots.
- [x] **T29 Audit scope exclusions.** Confirm no CAJERO, password in create/edit, fake routes, direct PasswordHash writes, Employee-state synchronization or generated-type manual edit.
- [x] **T30 Create ADR-007 during APPLY documentation.** Document SecurityStamp fingerprint, per-request validation, target revoke-all, lookup tradeoff and rejected alternatives at `docs/adr/ADR-007-security-stamp-session-revocation.md`.
- [x] **T31 Update HU-002 and file manifest.** From the final real diff, document behavior/tests/runtime and complete Backend, Frontend and Documentation/configuration file tables with purposes.
- [x] **T32 Add flexible real evidence and close DoD.** Add user-selected real evidence only and trace every requirement to test/runtime/manual evidence before marking complete.

## Traceability

| Capability | Requirement IDs | Tasks |
| --- | --- | --- |
| User management | `UM-01`–`UM-08` | T01, T02, T06–T13 |
| Account lifecycle | `AL-01`–`AL-05` | T02, T05, T07, T09–T12 |
| Session revocation | `SR-01`–`SR-05` | T01, T03, T04, T09–T11, T13 |
| Users frontend | `UF-01`–`UF-07` | T15, T16, T19–T26, T28 |
| Role-aware navigation | `RN-01`–`RN-04` | T17, T18, T25 |
| Delivery contract | `DC-01`–`DC-05` | T13–T16, T26–T32 |

## Review workload forecast

Expected implementation spans security/JWT/session code, identity data migration, users API, generated contract, shared navigation, responsive feature UI, tests and documentation. It is likely to exceed the 400-line review budget. Before APPLY, use the selected `ask-on-risk` delivery strategy to decide whether to split reviewable work units; no PR, commit or branch action is part of this SDD phase.
