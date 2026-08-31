# Apply progress

## Baseline and action context

- Status consumed: authoritative APPLY READY from the parent; `repo-local`, workspace `C:/dev/Fratelli-s-System`, allowed root current workspace.
- Baseline revalidated: branch `develop`; HEAD `9cec685cdf9e5f582fc5fd9861b02c2550001e1d`; latest commit `9cec685 Merge pull request #60 from Alex-Fernandez-2003/feature/HU-007-production`.
- Pre-existing change preserved without alteration: deleted `docs/handoffs/sprint-2-backend-frontend-handoff.md`.
- Confirmed local findings: `InventoryHistory` was ADMIN/ENC only; purchases navigation/list route used write roles; own-shift route/navigation was overbroad; Inventory navigation was duplicated and movements hidden from readers; composition route was absent; Production nested an `AppShell`.

## Completed work

- Tasks 1–10, 12, and 13 are checked in `tasks.md`.
- Expanded `InventoryHistory` to the five Inventory readers while leaving `InventoryManage` ADMIN/ENC only.
- Extended the PostgreSQL authorization matrix with Products mutations and Inventory history/mutation cases; it preserves anonymous, all canonical roles, multi-policy operation routes, and the existing COCINA purchase-scope implementation.
- Aligned frontend read/write role boundaries for Purchases, own Shift, Inventory movements, composition route/read-only UI, and shared central navigation.
- Replaced the duplicate Inventory movements navigation with the shared three-view navigation and a global-summary `lowStockCount` badge only when positive.
- Removed the nested Production `AppShell`.
- Reconciled factual role/status drift in HU-004, HU-006, HU-007, HU-017, HU-018, and HU-025. HU-007 is `TECHNICALLY_COMPLETE / MANUAL_EVIDENCE_PENDING`; no screenshots were fabricated.

## Files changed

- `backend/src/RestaurantSystem.Api/Program.cs`
- `backend/tests/RestaurantSystem.IntegrationTests/OperationsAuthorizationMatrixPostgresIntegrationTests.cs`
- `frontend/src/routes/AppRoutes.tsx`
- `frontend/src/features/navigation.tsx`
- `frontend/src/features/navigation.test.ts`
- `frontend/src/features/inventory/pages.tsx`
- `frontend/src/features/inventory/pages.test.tsx`
- `frontend/src/features/products/composition/CompositionPage.tsx`
- `frontend/src/features/production/pages.tsx`
- `frontend/src/features/shifts/api.ts`
- `docs/historias/HU-004-composición-preparaciones.md`
- `docs/historias/HU-006-notificaciones-stock-bajo.md`
- `docs/historias/HU-007-spri.md`
- `docs/historias/HU-017-registrar-compra.md`
- `docs/historias/HU-018-sprint-2.md`
- `docs/historias/HU-025-sprint-2.md`

## TDD cycle evidence

| Cycle | RED evidence | GREEN evidence |
| --- | --- | --- |
| Inventory navigation/badge | Focused Vitest failed for reader access to Movimientos, missing badge counts, and Movimientos shared navigation. | Focused Vitest passed 83 tests after shared navigation and global-summary badge implementation. |
| Backend authorization | Matrix was extended before policy implementation; the former `InventoryHistory` policy could not authorize the newly added reader cases. | Filtered PostgreSQL authorization matrix passed after widening only `InventoryHistory`. |

## Focused verification

- `pnpm test -- src/features/navigation.test.ts src/features/inventory/pages.test.tsx src/routes/AppRoutes.test.tsx`: PASS, 83 tests.
- `pnpm typecheck`: PASS.
- `dotnet test tests/RestaurantSystem.IntegrationTests/RestaurantSystem.IntegrationTests.csproj --filter FullyQualifiedName~OperationsAuthorizationMatrixPostgresIntegrationTests`: PASS, 1 test.
- The backend command emitted pre-existing package/deprecation/nullability warnings; no test failures.

## Deviations and scope constraints

- No endpoints, route paths, HTTP verbs, DTOs, generated client files, migrations, persistence, notification state, or polling were added.
- Task 11 remains unchecked: it calls for broader cross-feature frontend route/action regression coverage than this focused apply slice established.
- Tasks 14–16 remain unchecked per phase instruction: full quality gates, API contract confirmation, and final closure audit belong to later verification/lifecycle work.

## Workload / PR boundary

One apply work-unit slice: backend authorization matrix plus frontend role/route/navigation/Production fixes and factual documentation reconciliation. No commits, branches, or PRs were created.

## Remaining implementation tasks

- [ ] Task 11: Completar la matriz frontend de permisos y navegación
- [ ] Task 14: Ejecutar la regresión backend y frontend completa
- [ ] Task 15: Confirmar que no cambió el contrato API
- [ ] Task 16: Ejecutar el audit final de Sprint 2 y preparar el reporte de cierre

## Task 11 remediation slice — 2026-03-12

### Structured status consumed

```yaml
schemaName: gentle-ai.sdd-status
changeName: finalize-sprint-2-routing-permissions-and-documentation
artifactStore: openspec
applyState: ready
dependencies:
  apply: ready
  verify: blocked
actionContext:
  mode: repo-local
  workspaceRoot: C:/dev/Fratelli-s-System
  allowedEditRoots: [C:/dev/Fratelli-s-System]
nextRecommended: apply
warnings: []
```

- Native attempt continuation was acquired as `proceed` under the maintainer-authorized reset; no Git operation was performed.
- `docs/openspec/config.yaml` and all other discovered `openspec/config.yaml` paths are absent, so strict TDD was not active.

### Completed work

- Marked Task 11 complete in `tasks.md` immediately after focused evidence passed.
- Corrected the stale Inventory integration assertion: all five canonical Inventory readers (ADMINISTRADOR, ENCARGADO, MESERO, COCINA, CONTADORA) now expect `200 OK` from `GET /api/v1/inventory/movements`; EMPLEADO remains `403 Forbidden`. The nearby summary test already matched this matrix and was left unchanged.
- Added focused Products UI coverage proving product create/edit/composition/deactivate controls are visible to ADMINISTRADOR/ENCARGADO and absent for EMPLEADO.
- Extended direct-route guard coverage for Composition read, all three Inventory views, Purchase list versus write route, own Shift versus Shift management, and MESERO+ENCARGADO union behavior. Existing Inventory page coverage continues to prove readers retain all tabs but no manual movement action.

### Files changed in this slice

- `backend/tests/RestaurantSystem.IntegrationTests/InventoryExpensesPostgresIntegrationTests.cs`
- `frontend/src/features/products/pages.test.tsx`
- `frontend/src/routes/AppRoutes.test.tsx`
- `docs/openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/tasks.md`
- `docs/openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/apply-progress.md`

### Verification evidence

- PASS — `dotnet test backend/tests/RestaurantSystem.IntegrationTests/RestaurantSystem.IntegrationTests.csproj --filter "FullyQualifiedName~InventoryExpensesPostgresIntegrationTests|FullyQualifiedName~OperationsAuthorizationMatrixPostgresIntegrationTests"`: 4 passed, 0 failed, 0 skipped. Existing NU1903/CS8604 warnings only.
- PASS — `cd frontend && pnpm test -- src/features/products/pages.test.tsx src/routes/AppRoutes.test.tsx src/features/navigation.test.ts src/features/inventory/pages.test.tsx`: 19 files, 99 tests passed.
- PASS — `cd frontend && pnpm exec prettier --check src/features/inventory/pages.test.tsx src/features/inventory/pages.tsx src/features/navigation.tsx src/features/shifts/api.ts src/routes/AppRoutes.tsx src/features/products/composition/CompositionPage.tsx src/features/production/pages.tsx`.
- PASS — real formatter was run only on those seven requested source files; all were already formatted.
- PASS — `git diff --check`.

### Constraints, workload, and remaining work

- No endpoints, migrations, OpenAPI regeneration, production permission changes, route redesign, or new features were introduced. `InventoryHistory` was not narrowed.
- Existing working-tree changes were preserved. In particular, the pre-existing deleted `docs/handoffs/sprint-2-backend-frontend-handoff.md` was not touched. HU-007 remains `MANUAL_EVIDENCE_PENDING`.
- Workload / PR boundary: one maintainer-authorized focused remediation slice limited to Task 11 coverage and the stale Inventory integration expectation; no commit, branch, or PR was created.
- Remaining implementation tasks:
  - [x] Task 14: Ejecutar la regresión backend y frontend completa — final verification passed: backend 62/62 and frontend 99/99.
  - [x] Task 15: Confirmar que no cambió el contrato API — final diff audit found 0 endpoints/routes/verbs/DTO changes/migrations and no OpenAPI regeneration need.
  - [x] Task 16: Ejecutar el audit final de Sprint 2 y preparar el reporte de cierre — final source audit and `verify-report.md` PASS completed.

## Final verification — 2026-03-12

- Parent-native acquire returned `proceed` for final reverify under `repo-local` action context with the workspace as allowed edit root.
- Full gates passed: backend restore, Release build, publish, and full real PostgreSQL/Testcontainers suite (62 total, 62 passed, 0 failed, 0 skipped); frontend scoped Prettier on the seven named files, typecheck, lint, full Vitest suite (19 files, 99 tests), and build all passed.
- Docker Engine 29.5.2 was available; the backend suite created and exercised a disposable Testcontainers PostgreSQL container, then deleted it.
- Non-blocking warnings recorded in the verify report: `SSH.NET` NU1903, pre-existing CS8604, EF multiple-collection-include performance warning, and Vite 506.46 kB chunk warning.
- Final source/diff audit reconfirmed the canonical permission matrix, Composition route, three Inventory views and global `lowStockCount` badge, purchase/shift guards, MESERO+ENCARGADO union, preserved qualified COCINA purchase mutations, and HU-007 factual manifest. API contract changes, migrations, and generated OpenAPI/client changes are all zero; regeneration was not needed.
- The pre-existing deleted `docs/handoffs/sprint-2-backend-frontend-handoff.md` remains untouched. HU-007 manual screenshots remained `MANUAL_EVIDENCE_PENDING` at the time of this final verification and did not block technical PASS or closure.

## Final HU-007 evidence completion

- Verified the six maintainer-provided captures: `docs/capturas/HU-007-register-production.png`, `docs/capturas/HU-007-mobile.png`, `docs/capturas/HU-007-low-stock-production.png`, `docs/capturas/HU-007-confirm-modal.png`, `docs/capturas/HU-007-confirm-modal-low-stock.png`, and `docs/capturas/HU-007-success-modal.png`.
- HU-007 manual evidence is complete. This completion changed documentation only; no application code changed.
