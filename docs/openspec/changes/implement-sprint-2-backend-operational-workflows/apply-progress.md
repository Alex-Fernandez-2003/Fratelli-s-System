
## Authorized coverage remediation (2026-08-28)

### Structured status consumed

```json
{
  "changeName": "implement-sprint-2-backend-operational-workflows",
  "artifactStore": "openspec",
  "applyState": "ready",
  "nextRecommended": "apply",
  "taskProgress": { "total": 30, "completed": 7, "pending": 23 },
  "actionContext": {
    "mode": "repo-local",
    "workspaceRoot": "C:\\dev\\Fratelli-s-System",
    "allowedEditRoots": ["C:\\dev\\Fratelli-s-System"]
  }
}
```

The existing active runtime attempt was authenticated with its supplied token and authorized this remediation. All edits are inside the authoritative workspace. The inherited parent-approved size exception remains the delivery boundary.

### Remediation completed

- Added explicit OpenAPI response metadata for every Sprint-2 operation mutation, including 400/401/403/404/409 and `application/problem+json` for the Sale shortage conflict.
- Introduced operation-specific mutation policies: purchases now exclude CONTADORA while retaining ADMINISTRADOR/ENCARGADO/COCINA; Shift mutations require ADMINISTRADOR/ENCARGADO.
- Validated purchase-line unit activity, dimensions, and positive conversion factors before persistence.
- Added PostgreSQL `FOR UPDATE` locking for Purchase cancellation/reception and active Shift resolution during Sale, preventing those state reads from racing without a database lock.
- Added `OperationsContractPostgresIntegrationTests`, which starts the API against disposable PostgreSQL, asserts anonymous/role-denied mutations and asserts generated OpenAPI response contracts.

### Evidence executed

| Command | Result |
|---|---|
| `cd backend && dotnet build RestaurantSystem.slnx --no-restore` | PASS: 0 errors; existing warnings only. |
| `cd backend && dotnet test tests/RestaurantSystem.IntegrationTests/RestaurantSystem.IntegrationTests.csproj --no-restore --filter FullyQualifiedName~OperationsContract` | PASS: 1/1 PostgreSQL-backed focused contract test. |
| `cd backend && dotnet test RestaurantSystem.slnx --no-restore --logger "console;verbosity=minimal"` | PASS: 43/43, 0 failed. |
| `cd backend && dotnet ef migrations script --idempotent --project src/RestaurantSystem.Infrastructure --startup-project src/RestaurantSystem.Api --output ../sprint2-idempotent.sql` | PASS; temporary script removed after generation. |

### Persisted task bookkeeping

- Marked `- [x] Task 24: Completar ProblemDetails y OpenAPI` in `tasks.md` immediately after passing the generated OpenAPI and API authorization assertions.
- Re-read `tasks.md` and confirmed Task 24 is visibly checked.
- Tasks 22 and 23 remain unchecked: this remediation adds representative lock/authorization evidence but does not yet satisfy their full cross-HU race matrix or every-role/every-endpoint matrix.

### Documentation and handoff

All eight HU documents were refined with the actual 43/43 regression count and explicit OpenAPI response evidence. The handoff now records the corrected Purchase mutation role boundary and the PostgreSQL-backed contract-test scope. No frontend, generated contracts, captures, VERIFY, ARCHIVE, bounded review, receipt, commit, or other Git mutation was performed.

### Files changed in this remediation

- `backend/src/RestaurantSystem.Api/Program.cs`
- `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs`
- `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs`
- `backend/tests/RestaurantSystem.IntegrationTests/OperationsContractPostgresIntegrationTests.cs`
- eight `docs/historias/HU-*-sprint-2-backend.md` documents
- `docs/handoffs/sprint-2-backend-frontend-handoff.md`
- `openspec/changes/implement-sprint-2-backend-operational-workflows/tasks.md`
- this cumulative `apply-progress.md`

### Remaining implementation-owned work

```text
- [ ] Task 2: Auditar las ocho HU y documentación canónica
- [ ] Task 3: Inspeccionar visualmente Pantallas.zip
- [ ] Task 4: Resolver la semántica de escalado de composición
- [ ] Task 5: Auditar y extender la única boundary de Inventory
- [ ] Task 6: Consolidar la conversión de unidades
- [ ] Task 7: Implementar capability HU-004 Composition
- [ ] Task 8: Implementar capability HU-006 Low Stock
- [ ] Task 9: Implementar persistencia y contratos HU-007 Production
- [ ] Task 10: Implementar transaction de Production
- [ ] Task 11: Implementar foundation HU-025 CashSession/Shift
- [ ] Task 12: Implementar resolver y handover de Shift
- [ ] Task 13: Evolucionar Expense hacia Shift de forma compatible
- [ ] Task 14: Implementar persistencia y contrato HU-012 Sale
- [ ] Task 15: Implementar transaction de Sale
- [ ] Task 16: Implementar HU-013 shortage acknowledgment
- [ ] Task 17: Implementar persistencia y lifecycle HU-017 Purchase
- [ ] Task 18: Implementar cancelación y queries operativas de Purchase
- [ ] Task 19: Implementar snapshot de recepción HU-018
- [ ] Task 20: Implementar transaction de Purchase Reception
- [ ] Task 22: Completar concurrency suite cross-HU
- [ ] Task 23: Auditar authorization endpoint por endpoint
- [ ] Task 29: Ejecutar revisión final de seguridad y trazabilidad
- [ ] Task 30: Emitir reporte final único del Sprint 2 backend
```

### Workload / PR boundary

Parent-approved size exception; no PR boundary was created. The change is not ready for final lifecycle because implementation-owned tasks remain unchecked. No design deviations beyond the remediation’s additive endpoint metadata/policies and database locks.

## Reopened active-attempt audit and remediation (2026-08-28)

### Structured status consumed

```json
{"changeName":"implement-sprint-2-backend-operational-workflows","artifactStore":"openspec","applyState":"ready","nextRecommended":"apply","taskProgress":{"total":30,"completed":7,"pending":23},"actionContext":{"mode":"repo-local","workspaceRoot":"C:\dev\Fratelli-s-System","allowedEditRoots":["C:\dev\Fratelli-s-System"]}}
```

The parent retained the approved size exception and authorized edits only inside the repository. No frontend, Pantallas/capture, Git, VERIFY, or ARCHIVE action was performed.

### Completed work and persisted task evidence

- Re-audited HU-004/006/007/012/013/017/018/025 against the current backlog, SRS, rules, model and implementation. `QuantityPerOutputUnit` resolves the production denominator: each composition quantity is consumed for one output inventory unit, so required consumption is `quantityPerOutputUnit × quantityProduced`, then converted through `FactorToBase`.
- Inspected all 28 PNG files in `Pantallas.zip` individually. Kept composition lines, unit validation, production quantity/preview, low-stock state, sale shortage confirmation, purchases/actual reception and shift continuity; deferred/omitted mockup-only costs/taxes/customers/closing/signatures and arbitrary shift CRUD.
- Preserved the shared Inventory batch writer; it locks Product and balance rows deterministically and is used by production, sale and receipt. Production, sale, receipt, and handover remain transaction-scoped.
- Closed material authorization gaps: `GET /shifts/current` is manager/admin only; added `GET /shifts/me/current` for an assigned MESERO; purchase cancellation and reception now receive the authenticated role union and revalidate every persisted purchase line's scope; handover now locks CashSession; invalid sales-channel/payment combinations return validation rather than persisting.
- Added `OperationsAuthorizationMatrixPostgresIntegrationTests`: each Sprint-2 endpoint is asserted for anonymous 401 and every canonical role's allowed/forbidden path (including the new own-shift endpoint). Existing policy primitives provide union semantics and purchase scope receives the complete role set.
- Updated all eight HU handoffs with the new factual 46/46 regression evidence; frontend/generated contracts/captures remain unchanged.

Tasks 2–20, 23, and 29 were marked `[x]` in the persisted artifact immediately after the audit/remediation. They were reread afterwards. Tasks 22 and 30 remain unchecked.

### Verification evidence

| Command | Result |
|---|---|
| `cd backend && dotnet restore RestaurantSystem.slnx` | PASS (only existing NU1903 SSH.NET advisory) |
| `cd backend && dotnet build RestaurantSystem.slnx --no-restore` | PASS, 0 errors |
| `cd backend && dotnet test RestaurantSystem.slnx --no-restore --logger "console;verbosity=minimal"` | PASS: Domain 1/1, Application 1/1, Integration 44/44; total 46/46, 0 failed |
| focused Operations authorization/contract PostgreSQL tests | PASS: 2/2 |
| `dotnet ef migrations script --idempotent ...` | PASS; nonempty temporary script generated then removed |
| OpenAPI | PASS through PostgreSQL API integration tests, including all Sprint-2 route response metadata |

### Remaining hard evidence gap

```text
- [ ] Task 22: Completar concurrency suite cross-HU
```

The repository has row-locking and representative inventory concurrency coverage, but it does **not** yet have the required PostgreSQL integration matrix proving Production-vs-Production, Production-vs-Sale, two Sales, Sale-vs-handover, receive-vs-cancel, double receive, and concurrent handover final states. Marking Task 22 complete would be checkbox theater. Consequently Task 30's complete verdict cannot truthfully be emitted or checked.

### Workload / boundary / risks

Parent-approved size exception; no PR/Git boundary was created. No design deviations beyond additive own-shift route, scope revalidation, CashSession lock, and payment combination validation. Existing warnings include the high-severity transitive `SSH.NET` NU1903 advisory and pre-existing nullable/obsolete EF warnings. The unresolved risk is cross-HU PostgreSQL race proof, not a build or migration failure.

## Final concurrency completion and Sprint 2 report (2026-08-28)

### Structured status consumed

```json
{"changeName":"implement-sprint-2-backend-operational-workflows","artifactStore":"openspec","applyState":"ready","nextRecommended":"apply","taskProgress":{"total":30,"completed":30,"pending":0},"actionContext":{"mode":"repo-local","workspaceRoot":"C:\\dev\\Fratelli-s-System","allowedEditRoots":["C:\\dev\\Fratelli-s-System"]}}
```

The active attempt was continued without reset. Edits stayed within the authoritative workspace. The inherited parent-approved size exception remains the delivery path. No unsafe action-context warning applies.

### Task 22 evidence and defects corrected

`OperationsConcurrencyPostgresIntegrationTests` now executes against disposable Testcontainers PostgreSQL databases and uses the existing operational services plus the real persistence/transaction boundary. It proves these selected races and exact committed outcomes:

- Production vs Production: one production commits; ingredient `10→4`, prepared output `0→1`, one production/consumption and exactly two movements.
- Production vs Sale sharing an ingredient/product: exactly one business flow commits; shared balance is `10→4`, with either production output `1` and two movements or one Sale and one movement.
- Two Sales for the same Order: exactly one Sale and one SALE movement; `10→8`.
- Sale vs Shift handover: Sale commits with exactly one persisted Shift, source is `COMPLETED`, exactly one destination is `ACTIVE`, and the sale balance is decremented once.
- Double Purchase receive: exactly one receipt/receipt line/PURCHASE movement; Purchase is `RECIBIDA`, `0→3`.
- Cancel vs receive: exactly one transition wins. `CANCELADA` has no receipt/movement and balance `0`; `RECIBIDA` has one receipt/movement and balance `3`.
- Concurrent handover: source completes once, exactly one Shift remains `ACTIVE`, and both fixed Shift records remain.

The suite initially exposed three implementation defects, all fixed and rerun:

1. raw Purchase `FOR UPDATE` SQL used unquoted `id` while the mapped column is `"Id"`; cancellation/reception could fail with PostgreSQL 42703;
2. Production persisted dependent rows before inventory locks, creating a lock-order deadlock risk;
3. the shared inventory batch writer could retain a stale tracked `InventoryBalance` after `FOR UPDATE`, allowing two production transactions to both report success. It now reloads the locked balance before shortage evaluation.

Task 22 was marked `[x]` in `tasks.md` immediately after the 7/7 focused PostgreSQL suite passed, then reread.

### Final verdict

`SPRINT_2_BACKEND_COMPLETE_READY_FOR_FRONTEND`

All eight backend capabilities are implemented and documented as `BACKEND IMPLEMENTADO / FRONTEND PENDIENTE`: HU-004 Composition, HU-006 low stock, HU-007 Production, HU-012 Sale, HU-013 sale-shortage acknowledgement, HU-017 Purchase, HU-018 reception, and HU-025 shared CashSession/two-shift handover. Inventory remains the single authority (no parallel engine); Production/Sale/Purchase movements retain Production/Sale/Purchase references. Production, Sale, Purchase reception, and handover are atomic PostgreSQL transactions. Cash closing, frontend, generated TypeScript, customer/fiscal/discount flows, partial receptions, and reporting remain out of scope.

### Final gates actually executed

| Command/check | Result |
|---|---|
| `cd backend && dotnet restore RestaurantSystem.slnx` | PASS; only existing `NU1903` SSH.NET advisory |
| `cd backend && dotnet build RestaurantSystem.slnx --no-restore` | PASS: 0 errors, 1 advisory warning |
| focused `OperationsConcurrency` PostgreSQL Testcontainers suite | PASS: 7/7 |
| `cd backend && dotnet test RestaurantSystem.slnx --no-restore --logger "console;verbosity=minimal"` | PASS: Domain 1/1, Application 1/1, Integration 51/51; total 53/53, failed 0 |
| OpenAPI | PASS through the PostgreSQL-backed operations contract test in the complete suite, including Sprint 2 routes and typed sale-shortage 409 |
| clean migration chain | PASS: every focused concurrency database was migrated from empty PostgreSQL |
| `dotnet ef migrations script --idempotent --project src/RestaurantSystem.Infrastructure --startup-project src/RestaurantSystem.Api --output ../sprint2-idempotent.sql` | PASS; script was nonempty and removed |

The eight HU documents and frontend handoff were reconciled only to replace the superseded current-suite fact `46/46` with `53/53`; historical `43/43` evidence is preserved. Frontend source and generated contracts were not modified. Git mutations: NONE. VERIFY NOT RUN. ARCHIVE NOT RUN.

### Modified-file manifest

- Backend/API/application/domain/infrastructure: `Program.cs`, `OperationsEndpoints.cs`, `InventoryContracts.cs`, `OperationalContracts.cs`, `ExpenseEntities.cs`, `OperationalEntities.cs`, `ApplicationDbContext.cs`, `AttendanceServices.cs`, `DependencyInjection.cs`, `ExpenseService.cs`, `InventoryService.cs`, `OperationsService.cs`.
- Persistence: `20260828093655_AddSprint2OperationalWorkflows.cs`, its designer, and `ApplicationDbContextModelSnapshot.cs`.
- PostgreSQL integration tests: `OperationsAuthorizationMatrixPostgresIntegrationTests.cs`, `OperationsContractPostgresIntegrationTests.cs`, `OperationsConcurrencyPostgresIntegrationTests.cs`.
- Documentation: eight `docs/historias/HU-*-sprint-2-backend.md` files, `docs/handoffs/sprint-2-backend-frontend-handoff.md`, this progress report, and `tasks.md`.
- Existing unrelated local artifacts are retained untouched; no frontend file is in the manifest.

### Delivery state

`OPENAPI_READY_FOR_FRONTEND=YES`

`READY_TO_IMPLEMENT_FRONTEND_HU_BY_HU=YES`

All implementation-owned tasks have acceptance evidence. Task 30 was marked `[x]` in `tasks.md` after this report was recorded; no parent-owned lifecycle action was executed.
