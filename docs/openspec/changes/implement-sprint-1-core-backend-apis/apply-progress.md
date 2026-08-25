# Apply progress — accumulated slices 1–4

Previous Slice 1–3 evidence remains retained in repository history. This consolidated progress update records Slice 4 only; it does not supersede prior completed work.

## Slice 4 — HU-022, HU-023 enabler, and SignalR

### Structured status consumed

- Native status: `artifactStore=openspec`, `applyState=ready`, `nextRecommended=apply`; authoritative workspace and allowed edit root: `C:\dev\Fratelli-s-System`.
- Continued the parent-owned active native attempt for `slice-4-attendance-signalr` (token `sha256:6fc94440177467cc625c85a2916a31c94a68c67bb998a1b22ee9e0e79ceddff2`). The explicit Slice 4 chained work-unit assignment resolves the high-risk workload forecast. PR boundary: Slice 4 only.
- `openspec/config.yaml` is absent, so strict TDD was not active. No TDD cycle evidence is claimed.

### Completed and persisted tasks

- `[x]` AttendanceRecord model/migration with distinct actor IDs, PostgreSQL partial unique open-record index, and PostgreSQL concurrency evidence.
- `[x]` Today, explicit check-in/check-out, business-time boundaries, carry-open display, multiple cycles, and authorization.
- `[x]` `/attendance/me` backend enabler only: JWT-to-Employee resolution, inclusive business-date range, paging, isolation, and no employeeId input.
- `[x]` Application notifier abstraction and authorized attendance SignalR hub with post-commit event dispatch.
- `[x]` PostgreSQL notifier/hub integration coverage.

All five Slice 4 implementation rows were immediately updated in `tasks.md` and re-read as visibly `[x]`.

### Implementation

- Added `AttendanceRecord`, EF mapping, and additive `AddAttendance` migration. The migration maps `public.AttendanceRecords`, retains Identity string actor FKs, has no employee/date uniqueness, and uses `UX_AttendanceRecords_Employee_Open` filtered by `"CheckOutAt" IS NULL`.
- Added application attendance DTOs, `IBusinessClock`, `IAttendanceNotifier`, and attendance service boundary. `BusinessClock` resolves the configured `BusinessTime:TimeZoneId` (default contract value `America/Argentina/Buenos_Aires`) at startup.
- Added attendance routes and `AttendanceHub` (`/hubs/attendance`), retaining the existing ADMIN/ENC authorization policy and hub-only query-token behavior.
- Notifications are sent after `SaveChangesAsync`; notifier exceptions are logged and do not roll back the committed attendance transaction.

### Evidence

| Command | Result |
|---|---|
| `dotnet restore backend/RestaurantSystem.slnx` | PASS (existing transitive Testcontainers SSH.NET NU1903 advisory) |
| `dotnet build backend/RestaurantSystem.slnx --no-restore` | PASS (same advisory) |
| `dotnet test ...IntegrationTests... --filter "FullyQualifiedName~AttendancePostgresIntegrationTests"` | PASS: 3/3 PostgreSQL-backed tests |
| `dotnet test backend/RestaurantSystem.slnx --no-build --verbosity minimal` | PASS: 10/10 tests |

Attendance coverage proves manager/admin vs employee/anonymous role behavior, actor-versus-target values, 409 duplicate-open/no-open, multiple cycles, today and own-history behavior, invalid date range, PostgreSQL concurrent check-in (one 201, one 409), authorized long-poll SignalR `AttendanceUpdated` delivery post-commit, no event on 4xx duplicate check-in, and committed persistence despite notifier failure.

### Files changed (Slice 4)

- `backend/src/RestaurantSystem.Domain/Attendance/AttendanceRecord.cs`
- `backend/src/RestaurantSystem.Application/Attendance/AttendanceContracts.cs`
- `backend/src/RestaurantSystem.Infrastructure/Attendance/AttendanceServices.cs`
- `backend/src/RestaurantSystem.Infrastructure/{ApplicationDbContext.cs,DependencyInjection.cs}`
- `backend/src/RestaurantSystem.Infrastructure/Migrations/{20260825045324_AddAttendance.cs,20260825045324_AddAttendance.Designer.cs,ApplicationDbContextModelSnapshot.cs}`
- `backend/src/RestaurantSystem.Api/Program.cs`
- `backend/tests/RestaurantSystem.IntegrationTests/{AttendancePostgresIntegrationTests.cs,RestaurantSystem.IntegrationTests.csproj}`
- `openspec/changes/implement-sprint-1-core-backend-apis/{tasks.md,apply-progress.md}`

### Deviations and remaining work

- No design deviation. The requested business timezone is startup-resolved with its contract default because no repository configuration file exists.
- Deferred outside Slice 4: K migration/CI validation, L OpenAPI/type generation, M documentation, N final validation/scope audit. No Slice 5 work, docs, frontend, verify/archive, review, or Git operation was performed.
- Exact remaining unchecked lines are those in tasks sections K–N, beginning with `- [ ] Validate migrations on both \`InitialIdentity\` → Sprint 1 ...` and ending with the final scope-audit row.

### Workload boundary

- Delivery: parent-authorized chained Slice 4; no PR or commit created. `actionContext` allowed workspace-local edits only; all edits stayed inside that root.
- Next: parent lifecycle must assign any subsequent slice. Do not advance this executor to Slice 5.

## Slice 5 — K–N migration, contract, runtime, and documentation closure

### Structured status consumed

- Native authoritative status: `artifactStore=openspec`, `applyState=ready`, `nextRecommended=apply`; `actionContext.mode=repo-local` and its allowed workspace root was `C:\dev\Fratelli-s-System`.
- Parent assigned the `M–N` chained work-unit slice, satisfying the tasks forecast delivery decision. Continued the parent-owned native attempt token `sha256:c33d5a9461abe067cfe8870fe5e4614c3533a1c89c4983ed0f94b5194cf4ed7e`. No commit, PR, review, verify, archive, or Git lifecycle action was performed.
- `openspec/config.yaml` is absent, so strict TDD was not active.

### Completed and persisted tasks

All twelve implementation rows in K–N were changed to `[x]` in `openspec/changes/implement-sprint-1-core-backend-apis/tasks.md`, then re-read as checked. There are no remaining implementation-owned unchecked rows and no parent-owned rows to defer.

### Migration and PostgreSQL evidence

- `dotnet ef migrations has-pending-model-changes --project backend/src/RestaurantSystem.Infrastructure --startup-project backend/src/RestaurantSystem.Api --no-build`: PASS — no pending model changes; no additional migration was created.
- Disposable PostgreSQL 16 validation applied the full stack from an empty database, migrated `InitialIdentity` incrementally to the full stack, then performed `database update 0` and reapplied full stack. It exercised all existing additive migration `Down` methods, including `AddAttendance`.
- The migration output confirmed string-key `identity.AspNetUsers`, public business tables, restrictive FKs, catalog seeds (11 Categories and 5 Units), the catalog lower-case indexes, and `UX_AttendanceRecords_Employee_Open` partial index. Integration tests use one `Testcontainers.PostgreSql` fixture and invoke `MigrateAsync`; CI declares no PostgreSQL service container, so it does not combine the two approaches.

### Contract/runtime/type evidence

- `dotnet restore backend/RestaurantSystem.slnx`, `dotnet build backend/RestaurantSystem.slnx --no-restore`, and `dotnet test backend/RestaurantSystem.slnx --no-build --verbosity minimal`: PASS, 10/10 tests (one transitive Testcontainers SSH.NET `NU1903` advisory remains).
- A disposable PostgreSQL runtime was migrated before startup. Development runtime returned `200 Healthy` from `/health`, `200` for Swagger, and generated `/openapi/v1.json` with 16 REST paths, including auth, catalog, suppliers, and attendance; `/hubs/attendance` was excluded.
- `OPENAPI_SCHEMA_URL=http://127.0.0.1:5057/openapi/v1.json pnpm run api:generate`: PASS. Only `frontend/src/types/api.generated.ts` changed in frontend and it was generator-owned.
- `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, and `pnpm run build`: PASS.
- `dotnet format backend/RestaurantSystem.slnx --verify-no-changes --no-restore` was attempted. It remains nonzero for pre-existing BOM/CRLF/charset rules in baseline placeholder files and `InitialIdentity`; generated Slice 1–4 migration line endings were normalized where reported. This formatter-only baseline issue did not affect restore, build, migration, runtime, or test results.

### Documentation and scope

- Added actual contract documents: `docs/historias/HU-001-iniciar-cerrar-sesion.md`, `HU-003-catalogo.md`, `HU-016-proveedores.md`, and `HU-022-registrar-asistencia.md`. They describe real routes, roles, DTOs, cookies, errors, pagination, seeds, soft deletes, attendance/SignalR semantics, and the explicit pending-only HU-023 enabler note.
- Documentary debt is retained only as the deferred global synchronization stated in the change design; no SRS, requirements, backlog, UX, security, unrelated HU, or global documentation rewrite was made.
- Scope audit: frontend changes are limited to `frontend/src/types/api.generated.ts`; no frontend functional code, HU-004/005/024, stock/compositions/purchases/user-admin CRUD, HU-023 completion, or new migration was introduced by this slice.

### Files changed (Slice 5)

- `frontend/src/types/api.generated.ts`
- `docs/historias/HU-001-iniciar-cerrar-sesion.md`
- `docs/historias/HU-003-catalogo.md`
- `docs/historias/HU-016-proveedores.md`
- `docs/historias/HU-022-registrar-asistencia.md`
- `openspec/changes/implement-sprint-1-core-backend-apis/{tasks.md,apply-progress.md}`

### Workload boundary and remaining work

- Delivery boundary: assigned chained Slice 5 (K–N) only; no PR boundary was created by this executor.
- No implementation tasks remain. Parent lifecycle owns the next step and any decision about the formatter baseline advisory.

## Precommit repair — OpenAPI contract audit

### Structured status consumed

- Parent authorized the active precommit-repair native attempt for the narrow audited OpenAPI/types/test slice. The task forecast is high-risk, but this repair is bounded to the existing L contract task and does not create a PR, commit, review, verify, archive, or frontend feature.
- The authoritative artifact store is `docs/openspec`; all implementation-owned task rows were re-read and remain visibly `[x]`. No checkbox was reopened because this is corrective evidence for the already-complete L row.
- `openspec/config.yaml` is absent; strict TDD is not active. Workspace-local edits only were made.

### Completed repair and evidence

- Retained both built-in `AddOpenApi` and SwaggerGen registrations. The native `/openapi/v1.json` now declares a JWT Bearer HTTP scheme, applies it only to protected REST operations, and describes refresh-cookie emission/clearing with `Set-Cookie` metadata. SignalR remains out of the REST document.
- Added minimal typed successful responses and exact 400/401/403/404/409 `ProblemDetails` metadata to auth, catalog, suppliers, and attendance minimal APIs. Public Application DTOs are used as response contracts.
- Added an OpenAPI integration assertion for Bearer security, protected-unit PUT 409, and refresh-cookie metadata. Added the canonical-unit PUT test: a structural mutation returns 409 and a subsequent read confirms its `g` code and symbol are preserved.
- Inspected `AttendanceService.MineAsync`: it retains the required 404 for an authenticated user without an Employee. No safe no-DB policy correction exists; the only accepted minor debt is that `AttendanceSelf` is authentication-only and Employee linkage is enforced by the service rather than authorization policy metadata.

| Command | Result |
|---|---|
| `dotnet test ...IntegrationTests... --filter "FullyQualifiedName~CatalogPostgresIntegrationTests"` | PASS: 2/2 PostgreSQL-backed tests |
| `OPENAPI_SCHEMA_URL=http://127.0.0.1:5057/openapi/v1.json pnpm run api:generate` | PASS |
| `pnpm run typecheck` | PASS |
| `dotnet test backend/RestaurantSystem.slnx --no-restore --verbosity minimal` | PASS: 10/10 (existing SSH.NET NU1903 advisory) |
| `pnpm run lint` and `pnpm run build` | PASS |

### Files changed

- `backend/src/RestaurantSystem.Api/Program.cs`
- `backend/tests/RestaurantSystem.IntegrationTests/UnitTest1.cs`
- `frontend/src/types/api.generated.ts` (generator output only)
- `docs/openspec/changes/implement-sprint-1-core-backend-apis/apply-progress.md`

### Workload boundary and remaining work

- No implementation-owned unchecked task rows remain. This repair did not alter runtime contract behavior, persistence, routes, or frontend features.
- Parent lifecycle owns the remaining delivery decisions. The pre-existing formatter baseline advisory and the accepted AttendanceSelf policy-location debt remain reported, not changed here.
