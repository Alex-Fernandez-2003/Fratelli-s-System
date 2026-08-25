# Implementation Tasks

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 4,000–7,000 implementation/configuration/documentation lines; 7,000–12,000+ including migrations, snapshots, and generated types |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | One OpenSpec change, reviewed as ordered work units: A–B, C–E, F–I, J–L, M–N |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

All tasks below are implementation work for this single change; the review split is not a request to create separate changes.

## A. Persistence/auth base

- [x] Revalidate the Sprint 0 baseline, record the base commit and current migrations, and confirm `InitialIdentity`, Identity key types, OpenAPI generation, and existing HU files before changing code. <!-- sdd-owner: implementation -->
- [x] Add Application-level identity, actor, time, token, and User-to-Employee contracts without coupling Application to JWT, Identity, `HttpContext`, or a CQRS framework; verify with build and contract tests. <!-- sdd-owner: implementation -->
- [x] Extend Identity additively with account activity state, preserving existing tables, `string` user keys, and `InitialIdentity`; review the EF migration diff for no re-keying. <!-- sdd-owner: implementation -->
- [x] Implement `Employee` (UUID key, string `UserId`) and `UserSession` (hashed refresh token only, expiry/revocation and indexes), mappings, and invariants; verify EF model tests. <!-- sdd-owner: implementation -->
- [x] Create the additive auth/Employee/session migration with foreign keys, unique Employee-to-user linkage, session indexes, and structural roles only when absent; apply it from Sprint 0 and to a clean database. <!-- sdd-owner: implementation -->
- [x] Implement JWT access-token issuance (15 minutes) and refresh-session create/rotate/revoke lifecycle, preserving the 12-hour absolute lifetime and independent parallel sessions; execute RED → GREEN → TRIANGULATE → REFACTOR tests. <!-- sdd-owner: implementation -->

## B. Development Seeder

- [x] Implement an idempotent Development-only seeder using `UserManager`/`RoleManager` for the six testing users, required roles, and Employees; add a double Development guard and never reset unrelated data or use User Secrets for testing-only credentials. <!-- sdd-owner: implementation -->
- [x] Run the seeder twice in Development and verify no duplicates; run a Production-mode/database test and verify no `.test` users are created. <!-- sdd-owner: implementation -->

## C. HU-001 endpoints

- [x] Implement username-only `POST /api/v1/auth/login` with generic unknown/password/inactive errors, no email fallback, and Identity lockout behavior where supported; add integration coverage. <!-- sdd-owner: implementation -->
- [x] Implement refresh, logout, and Bearer-only `/api/v1/auth/me`, including cookie settings, session-local idempotent logout, refresh after access expiry, and User-to-Employee resolution; add integration coverage for revoked and independent sessions. <!-- sdd-owner: implementation -->

## D. HU-001 tests

- [x] Replace placeholder auth integration coverage with real HTTP-host tests for valid/invalid username, email-only rejection, inactive account, refresh rotation/expiry, revoked refresh, logout, `/me`, cookies, claims, and status codes. <!-- sdd-owner: implementation -->
- [x] Run `dotnet test` for auth and verify the tests fail when routes, persistence, or authentication behavior is intentionally broken; retain no empty/placeholder assertions. <!-- sdd-owner: implementation -->

## E. AUTH GATE

- [x] Close the AUTH GATE only after the HU-001 integration matrix, token/session hashing and expiry review, cookie review, and real `dotnet test` evidence all pass; do not advance on unit tests alone. <!-- sdd-owner: implementation -->

## F. AUTHORIZATION GATE

- [x] Define role constants and semantic policies for catalog, suppliers, deactivate, attendance, and SignalR, without creating CAJERO or implementing HU-002; include JWT role claims. <!-- sdd-owner: implementation -->
- [x] Configure SignalR JWT transport only for `/hubs/...` while preserving REST authentication, and test authenticated versus anonymous hub access. <!-- sdd-owner: implementation -->
- [x] Execute the authorization matrix with seeded users, proving 401, 403, allowed multi-role behavior, and representative endpoint policies; close AUTHORIZATION GATE only with integration evidence. <!-- sdd-owner: implementation -->

## G. HU-003 (blocked by AUTH GATE and AUTHORIZATION GATE)

- [x] **Blocked by both AUTH GATE and AUTHORIZATION GATE:** Model Categories, Units, and Products with scopes, required fields, protected canonical units, and agreed enums/constraints; add persistence mappings and tests. <!-- sdd-owner: implementation -->
- [x] **Blocked by both AUTH GATE and AUTHORIZATION GATE:** Create catalog migrations and structural seeds, then validate clean upgrade, Sprint 0 upgrade, foreign keys, indexes, scope uniqueness, and protected units. <!-- sdd-owner: implementation -->
- [x] **Blocked by both AUTH GATE and AUTHORIZATION GATE:** Implement Categories and Units CRUD, scope/filter behavior, duplicate handling, soft delete, protected seed mutation rules, and ADMIN/ENC permissions; add endpoint integration tests. <!-- sdd-owner: implementation -->
- [x] **Blocked by both AUTH GATE and AUTHORIZATION GATE:** Implement Products CRUD, filters, pagination, audit fields, DELETE soft delete, and MENU eligibility without compositions, stock, or productType/category-scope constraints; add role and endpoint tests. <!-- sdd-owner: implementation -->

## H. HU-016 (blocked by AUTH GATE and AUTHORIZATION GATE)

- [x] **Blocked by both AUTH GATE and AUTHORIZATION GATE:** Model and migrate Suppliers with required/optional fields and audit data, keeping phone/email non-unique and business schema separate from Identity. <!-- sdd-owner: implementation -->
- [x] **Blocked by both AUTH GATE and AUTHORIZATION GATE:** Implement Supplier CRUD, search/filter, pagination, DELETE soft delete authorized for ADMINISTRADOR and ENCARGADO, and invalid-email handling; add real integration tests for roles and optional fields. <!-- sdd-owner: implementation -->

## I. HU-022 plus `/attendance/me` enabler only (blocked by AUTH GATE and AUTHORIZATION GATE)

- [x] **Blocked by both AUTH GATE and AUTHORIZATION GATE:** Model and migrate `AttendanceRecord` with actor distinct from target Employee, business-time authority, no employee/date uniqueness, and a unique partial index for one open record; prove concurrent conflict behavior in PostgreSQL. <!-- sdd-owner: implementation -->
- [x] **Blocked by both AUTH GATE and AUTHORIZATION GATE:** Implement `GET /attendance/employees/today`, explicit check-in, and explicit check-out with timezone boundaries, carried-open records, duplicate-open 409 translation, no toggle, multiple cycles, and actor/target authorization; run RED → GREEN → TRIANGULATE → REFACTOR tests. <!-- sdd-owner: implementation -->
- [x] **Blocked by both AUTH GATE and AUTHORIZATION GATE:** Implement only the `/attendance/me` backend enabler for HU-023 using JWT User-to-Employee resolution, business-date `from/to`, pagination, isolation, and no `employeeId` input; leave HU-023 incomplete and do not implement HU-024. <!-- sdd-owner: implementation -->

## J. SignalR

- [x] Implement an Application notifier abstraction and `/hubs/attendance` `AttendanceUpdated` hub adapter, emitting only after commit with the minimum payload and ADMIN/ENC authorization. <!-- sdd-owner: implementation -->
- [x] Add notifier, hub authorization, and smoke integration tests proving successful check-in/out notifications, no events for 4xx operations, and persistence surviving post-commit notifier failure. <!-- sdd-owner: implementation -->

## K. Clean/upgrade migration validation

- [x] Validate migrations on both `InitialIdentity` → Sprint 1 and empty database → full stack paths, inspect schemas/types/FKs/indexes/seeds, and exercise a disposable reasonable `Down`. <!-- sdd-owner: implementation -->
- [x] Stabilize PostgreSQL integration fixtures and CI service configuration without combining Testcontainers and a service container; verify CI runs migrations and real `dotnet test`. <!-- sdd-owner: implementation -->

## L. OpenAPI/types

- [x] Stabilize REST endpoint metadata, request/response DTOs, auth schemes, ProblemDetails, and status codes in `/openapi/v1.json`; exclude SignalR from OpenAPI. <!-- sdd-owner: implementation -->
- [x] Run `pnpm run api:generate` to update only `frontend/src/types/api.generated.ts`, then run frontend typecheck/lint/build; do not add frontend functional features or manually edit generated output. <!-- sdd-owner: implementation -->
- [x] Verify backend REST parity against generated types and audit the frontend diff for generated types only. <!-- sdd-owner: implementation -->

## M. HU documentation

- [x] Update the HU-001 document with exact login/refresh/logout/me routes, cookie/session behavior, roles, `expiresAt`, errors, DTO/OpenAPI-matching JSON examples, and Development testing-only credentials without real refresh tokens. <!-- sdd-owner: implementation -->
- [x] Update the HU-003 document with exact Categories/Units/Products CRUD routes, filters, pagination, scopes, roles, seeds, protected units, soft delete, ProblemDetails, and OpenAPI-matching examples. <!-- sdd-owner: implementation -->
- [x] Update the HU-016 document with exact Supplier fields, routes, search/filter, paging, roles, soft delete, validation, and status-code examples matching implementation/OpenAPI. <!-- sdd-owner: implementation -->
- [x] Update the HU-022 document with exact attendance routes, actor-versus-target semantics, today/timezone rules, check-in/out, conflicts, SignalR hub/event/payload/roles, and `/attendance/me` as an HU-023 enabler while explicitly leaving HU-023 pending. <!-- sdd-owner: implementation -->
- [x] Record documentary debt for later synchronization, but do not perform a global documentation rewrite and do not rewrite SRS, requirements, backlog, UX, security, or unrelated HU documents in this change. <!-- sdd-owner: implementation -->

## N. Final quality/runtime validation

- [x] Run restore, build, complete backend tests, formatting where applicable, clean/upgrade migrations, Development/Production seeder safety, Auth/AuthZ runtime checks, core API checks, SignalR checks, OpenAPI generation, TypeScript generation, and documentation cross-review; retain real evidence. <!-- sdd-owner: implementation -->
- [x] Perform a final scope audit of the complete diff: confirm no frontend functional work, no HU-004/005/024, no stock/compositions/purchases/user-admin CRUD, no HU-023 completion, and no unrelated migrations or global documentation rewrite; report any violation before PASS. <!-- sdd-owner: implementation -->
