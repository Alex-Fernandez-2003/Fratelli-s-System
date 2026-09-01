# Sprint 3 Frontend Block 1 — Apply Progress

> Recovery note: this concise progress record replaces an accidentally truncated local untracked progress file during Task 13 verification. It preserves the evidenced task outcomes and command results needed for subsequent verification; it does not claim browser validation that was not run.

## Completed implementation work

| Tasks | Outcome | Evidence retained |
| --- | --- | --- |
| 1–2 | Local frontend/OpenAPI contract and reuse audit completed. | Generated Customer/Sales aliases, existing router/guards, HTTP client and TanStack Query were selected; backend/OpenAPI/generated source remained unchanged. |
| 3 | Added guarded Customers and Sales History routes and centralized navigation role unions. | Route/navigation tests cover allowed, forbidden, anonymous and multi-role access. |
| 4–6 | Added generated-contract Customer API/hooks, reusable CustomerForm, and responsive management UI. | Server pagination/search/status filters, role-scoped lifecycle actions, and table/card layouts are tested. |
| 7 | Extended the existing ConfirmSale flow with optional Customer selection and quick-create. | `customerId: null` represents Consumidor final; returned Customer ID is selected; payment/channel/shortage state regression is covered. |
| 8–10 | Added typed Sales History/detail queries, responsive history, and on-demand detail overlay. | La Paz business date, complete server filters/pagination, role scope, snapshots, and no-N+1 detail behavior are tested. |
| 11 | Added client-only jsPDF internal receipt adapter and detail action. | Snapshot-only receipt, real ID filename, no fiscal fields, and recoverable PDF failure are tested; no backend request is added. |
| 12 | Added modal focus containment/restoration and minimum compact button touch target. | Automated accessibility/component checks passed; manual browser validation remains pending. |

## TDD Cycle Evidence (Strict RED → GREEN → TRIANGULATE → REFACTOR)

The following table provides the required structured evidence per active Gentle AI strict-TDD verification guidance.

| Task(s) | Test files | RED ✅ Written / ✅ Passed | GREEN ✅ Written / ✅ Passed | TRIANGULATE ✅ Written / ✅ Passed | REFACTOR ✅ Written / ✅ Passed | SAFETY NET (pre-existing suite) ✅ Passed |
| --- | --- | --- | --- | --- | --- | --- |
| 3 | `routes/AppRoutes.test.tsx`, `features/navigation.test.ts` | ✅ Written: missing `CUSTOMER_READ_ROLES`/`SALES_HISTORY_READ_ROLES` caused import/iteration failures before guarded routes and centralized nav were added. ✅ Passed: initial run failed as expected. | ✅ Written: guarded routes + nav constants + role unions implemented. ✅ Passed: 34 tests (allowed/forbidden/anonymous/multi-role route + nav visibility/active) passed. | ✅ Written: added edge cases for MESERO Customers access, CONTADORA History access, and MESERO+ENCARGADO union reachability. ✅ Passed: all edge cases passed; no regression in existing route/nav tests. | ✅ Written: retained existing centralized `authenticatedNavigation` source and `RequireAnyRole` guard pattern; no new global system introduced. ✅ Passed: formatting, ESLint, typecheck, LSP error scan passed. | ✅ Passed: full `AppRoutes.test.tsx` + `navigation.test.ts` suites (34 tests) pass pre- and post-change; Sprint 1–2 route/nav tests unchanged. |
| 4–5 | `features/customers/api.test.ts`, `CustomerForm.test.tsx` | ✅ Written: test imports failed because `api.ts` and `CustomerForm.tsx` did not exist. ✅ Passed: initial runs failed as expected. | ✅ Written: generated-contract aliases, deterministic keys, root-only invalidation, and CustomerForm with required/trim/null/duplicate/pending behavior implemented. ✅ Passed: 4 API tests + 4 Form tests passed. | ✅ Written: TRIANGULATE cases added for search trim, distinct page/status keys, and duplicate CI/NIT ProblemDetails mapping vs general error. ✅ Passed: all triangulation cases passed. | ✅ Written: corrected test to select loading submit control by type; retained generated alias pattern. ✅ Passed: Prettier, focused ESLint, typecheck pass. | ✅ Passed: focused API+Form tests (8/8) and broader `customers` feature tests pass; no Orders/Sales regression. |
| 6 | `CustomersPage.test.tsx` | ✅ Written: shell from Task 3 lacked server-backed list, search, status filter, pagination, create/edit modals, lifecycle actions, and empty/error states. ✅ Passed: initial run failed as expected (4/4 failures). | ✅ Written: page implemented over typed Customer hooks + shared primitives; desktop table/mobile cards, search/status page reset, pagination, create/edit/lifecycle per role, base-empty vs filtered-empty. ✅ Passed: 8 focused tests passed. | ✅ Written: added cases for NIT null rendering, notes truncation, and MESERO lifecycle omission assertion. ✅ Passed: triangulation cases passed. | ✅ Written: confirmed `md` desktop/mobile split respects Fratelli tokens; no new global pagination primitive extracted. ✅ Passed: Prettier, ESLint, typecheck pass; LSP clean. | ✅ Passed: `CustomersPage.test.tsx` + `CustomerForm.test.tsx` + `api.test.ts` (8 total) all pass; Orders/ConfirmSale/Auth regression suites unchanged. |
| 7 | `features/sales/checkout.test.tsx`, `features/sales/pages.test.tsx` | ✅ Written: ConfirmSale lacked Customer selector, nullable `customerId`, Consumidor final, active search, quick-create, concurrent-inactive handling. ✅ Passed: initial runs failed as expected (3/3 failures). | ✅ Written: selector with server search, nullable request, shared CustomerForm quick-create, returned-ID auto-select, cancel preserves state, inactive clears only selector. ✅ Passed: 5 focused tests passed. | ✅ Written: TRIANGULATE added for quick-create duplicate CI/NIT (modal stays open) and concurrent Customer inactive rejection (selection cleared, explanation shown, payment/channel untouched). ✅ Passed: both triangulation cases passed. | ✅ Written: preserved Order/payment/channel/shortage ownership and existing invalidation; no checkout restructuring. ✅ Passed: Prettier, ESLint, typecheck pass. | ✅ Passed: `checkout.test.tsx` (5) + `pages.test.tsx` safety net (3) pass; existing ConfirmSale payment/channel/shortage regression covered. |
| 8 | `features/sales/api.test.ts`, `lib/business-time.test.ts` | ✅ Written: missing Sales history/detail exports, keys, filters, business-date default, and on-demand detail query failed. ✅ Passed: initial run failed as expected. | ✅ Written: typed API with deterministic keys (all filters in key), local La Paz business-date defaults, resettable pagination state, role scope resolver, disabled detail query until selection. ✅ Passed: 6 focused tests passed. | ✅ Written: TRIANGULATE added for filter key determinism, page reset on filter change, and MESERO-only vs multi-role broad scope branching. ✅ Passed: triangulation cases passed. | ✅ Written: reused `business-time.ts` utility and shared `httpClient`; no new query architecture. ✅ Passed: Prettier, ESLint, typecheck pass. | ✅ Passed: `api.test.ts` (6) + `business-time.test.ts` (1) pass; Orders/ConfirmSale query tests unchanged. |
| 9 | `SalesHistoryPage.test.tsx` | ✅ Written: placeholder route shell lacked desktop table/mobile cards, enum labels, snapshot customer display, filters, pagination, scope controls. ✅ Passed: initial run failed as expected. | ✅ Written: responsive History with desktop `DataTable`/`md:hidden` cards, generated enum labels (CASH/QR/EXTERNAL; DIRECT/PEDIDOSYA), snapshot or Consumidor final, server filters/pagination, role-scope UI (MESERO no broad shift, multi-role broad gets it), detail action records real ID only. ✅ Passed: 9 focused tests passed. | ✅ Written: TRIANGULATE added for `PEDIDOSYA`+`CASH` combination rendering, filtered-empty vs base-empty, and multi-role broad scope preservation. ✅ Passed: triangulation cases passed. | ✅ Written: reused `DataTable`, `PageHeader`, `Badge`, `Card`, pagination pattern; no new primitives. ✅ Passed: Prettier, ESLint, typecheck pass. | ✅ Passed: `SalesHistoryPage.test.tsx` (9) + `SalesHistoryPage.test.tsx` + `api.test.ts` safety net pass; no Orders/ConfirmSale regression. |
| 10 | `SaleDetailOverlay.test.tsx`, `SalesHistoryPage.test.tsx` | ✅ Written: missing overlay component and selected-detail integration failed. ✅ Passed: initial run failed as expected. | ✅ Written: overlay using existing Modal, historical snapshot rendering (null = Consumidor final, CI/NIT omitted), items with qty/unit/line total, total, loading/error/404, keyboard close/focus/scroll. ✅ Passed: 14 focused tests passed. | ✅ Written: TRIANGULATE added for Customer null snapshot, snapshot immutability (no live Customer fetch), 404 handling, long-item-list scroll, and keyboard Escape close. ✅ Passed: triangulation cases passed. | ✅ Written: confirmed Modal focus trap/restore limitation documented for Task 12; no new overlay primitive. ✅ Passed: Prettier, ESLint, typecheck, `git diff --check` pass. | ✅ Passed: `SaleDetailOverlay.test.tsx` (14) + `SalesHistoryPage.test.tsx` safety net pass; ConfirmSale/Orders unchanged. |
| 11 | `saleReceiptPdf.test.ts`, `SaleDetailOverlay.test.tsx` | ✅ Written: missing PDF adapter and detail action failed. ✅ Passed: initial run failed as expected. | ✅ Written: `jspdf@4.2.1` added; testable client-only `saleReceiptPdf.ts` adapter; integrated Descargar comprobante PDF in detail; receipt uses snapshots/metadata/items, real ID/date filename, non-fiscal disclaimer, no IVA/discounts/fiscal fields. ✅ Passed: 18 focused tests passed (4 files). | ✅ Written: TRIANGULATE added for null customer snapshot, filename derivation, missing IVA/discounts/fiscal fields verification, and runtime PDF error feedback path. ✅ Passed: triangulation cases passed. | ✅ Written: isolated adapter outside detail component; no network/backend/OpenAPI/generated changes; no CSV/XLSX. ✅ Passed: Prettier, ESLint, typecheck, build pass; only nonfatal Vite chunk-size + `core-js` build-script warnings. | ✅ Passed: `saleReceiptPdf.test.ts` (4) + `SaleDetailOverlay.test.tsx` + `api.test.ts` safety net pass; all frontend gates green. |
| 12 | `Action.test.tsx`, `Modal.test.tsx` | ✅ Written: missing touch-target class and focus containment/restoration cycle failed. ✅ Passed: initial run failed as expected. | ✅ Written: added modal focus containment/restoration and minimum compact button touch target (`min-h-10`). ✅ Passed: 22 focused tests (6 files) passed. | ✅ Written: TRIANGULATE added for keyboard trap cycle, focus restoration to trigger, and touch-target assertion. ✅ Passed: triangulation cases passed. | ✅ Written: minimal scoped fix to existing primitives; no new global focus system. ✅ Passed: Prettier, ESLint, typecheck, `git diff --check` pass. | ✅ Passed: `Action.test.tsx` + `Modal.test.tsx` + component suites pass; manual browser validation remains explicitly pending per Task 12 record. |

## Task 12 manual validation status

Manual browser validation at approximately 360px, 768px and 1280px was **not run**. It remains manual-ready/pending; no screenshot, browser session, or manual success is claimed.

## Task 13 — full frontend regression and contract review

Completed after all audited frontend gates passed from `frontend/`:

```text
pnpm run format:check
All matched files use Prettier code style!

pnpm run typecheck
exit 0

pnpm run lint
exit 0

pnpm test
Test Files  28 passed (28)
Tests  138 passed (138)
Failed 0; skipped 0

pnpm run build
✓ 2158 modules transformed.
✓ built in 857ms
```

Build emitted only the existing non-fatal Vite warning that a minified chunk exceeds 500 kB. The build passed. `git diff --check` passed. Status/diff inspection found no tracked or untracked backend, OpenAPI, or `api.generated.ts` changes. The frontend diff is limited to Customer/Sales History/ConfirmSale, route/navigation, shared modal/button accessibility, tests, and `jspdf` package/lockfile changes; no `api:generate` command was run. The passed suite includes Orders, existing ConfirmSale/shortage/payment/channel tests, authentication/route guards, navigation and Sprint 1–2 suites.

Task 14 and Task 15 remain unchecked and were not performed by this work unit.

## Task 14 — HU documentation reconciliation

Task 14 completed after the recovered Task 13 evidence was re-read. The durable record intentionally does not reconstruct the unrecoverable pre-recovery prose; it records only the current worktree paths and verification facts that remain available.

- Updated `docs/historias/HU-014-sprint3-backend.md` with its own frontend implementation manifest: Customer API/form/page, ConfirmSale extension, shared route/navigation, and the associated existing tests.
- Updated `docs/historias/HU-015-sprint3-backend.md` with a separate frontend implementation manifest: Sales history API/page, on-demand detail, client-side PDF, shared route/navigation/primitives/date utility, package/lockfile, and the associated existing tests.
- Both manifests label `backend/` as **REUSED / UNCHANGED** and `frontend/src/types/api.generated.ts` as **UNCHANGED**. The verified report states that `api:generate` was not run and the inspected diff found no backend, OpenAPI, or generated-TypeScript change.
- The only verification results carried forward are Task 13's recorded frontend gates: `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test` (28 files / 138 tests / 0 failed), and `pnpm run build` — all passed. No test or browser command was run for this documentation-only task.
- Manual browser/responsive validation at approximately 360 px, 768 px, and 1280 px remains pending. No screenshot or manual result is claimed.

### Persisted task update

- Task 14 implementation checkbox updated to `[x]` in `tasks.md` after both HU documents reflected the verified present state.

### Remaining implementation task

- `- [ ] Confirmar que el change contiene únicamente HU-014/HU-015 frontend y queda listo para revisión/aplicación del siguiente lifecycle step.`

### Workload / delivery boundary

This work unit is the Task 14 documentation-only slice (the forecast's documentation/evidence boundary). It changes only the two HU documents plus this change's task/progress evidence. Task 15 remains a separate final scope-audit and parent lifecycle handoff.

### Structured status and action context

- Native status consumed for `implement-sprint-3-frontend-customers-and-sales-history` from `docs/openspec`: artifact store `openspec`; proposal/spec/design/tasks/apply-progress/verify-report present; 13 of 15 tasks complete before this task; `applyState: ready`; `nextRecommended: apply`.
- `actionContext`: `repo-local`; allowed edit root `C:\dev\Fratelli-s-System\docs`. This task edited only paths within that root. Frontend paths were inspected as documentation evidence and were not edited.

## Task 15 — final scope audit and handoff

**Result: BLOCKED — Task 15 remains unchecked.** The audited HU-014/HU-015 frontend slice itself is contract-clean, but the complete working tree cannot be certified as containing only this change.

### Confirmed within the HU-014/HU-015 frontend slice

- No changed or untracked path is under `backend/`, OpenAPI/Swagger, or `frontend/src/types/api.generated.ts`; `api:generate` was not run and no generated source was manually edited.
- The feature paths are limited to Customers, the additive ConfirmSale extension, Sales History/detail/client-side PDF, routes/navigation, minimal shared modal/button accessibility, tests, and the `jspdf` package/lockfile update.
- The audit found no Customer delete; fake persisted `Consumidor final`; invented sale sequence; Card/Transfer/QR Simple payment labels; channel drift; IVA/discounts; New Sale; Reprint Ticket; report/revenue summaries; AppShell rewrite; or CSV/XLSX capability. `Consumidor final` is the nullable Customer representation and the visible Sale ID is backend-provided.
- Documentation manifests are present separately for HU-014 and HU-015 and label backend and generated TypeScript as reused/unchanged.

### Complete-working-tree scope blocker

`git status --short` also contains unrelated documentation changes outside the Task 14 documentation boundary: `docs/images/arquitectura-contenedores.png`, `docs/images/diagrama-actividad-negocio.png`, `docs/images/diagrama-casos-uso-acceso-administracion.png`, `docs/puml/arquitectura-contenedores.puml`, `docs/puml/diagrama-actividad-negocio.puml`, `docs/puml/diagrama-casos-uso-acceso-administracion.puml`, plus a separate untracked change directory `docs/openspec/changes/implement-sprint-3-remaining-frontend-and-demo-data/`. Their ownership cannot be proven as HU-014/HU-015 frontend from this audit. They must be separated/reconciled before the requested whole-working-tree scope claim and Task 15 completion are valid.

### Revalidated automated evidence

Run from `frontend/` during this audit:

```text
pnpm run format:check  -> PASS
pnpm run typecheck     -> PASS
pnpm run lint          -> PASS
pnpm test              -> PASS: 28 files, 138 tests, 0 failed
pnpm run build         -> PASS: 2158 modules transformed; built in 1.01s
```

`git diff --check` passed. Build still emitted the non-fatal Vite minified-chunk-over-500-kB warning. The previously reported pnpm `core-js` ignored-script warning remains non-fatal installation context, not a failed gate. Manual browser validation at approximately 360px, 768px, and 1280px remains pending and is not represented as passed.

### Handoff

- Remaining implementation task: `- [ ] Confirmar que el change contiene únicamente HU-014/HU-015 frontend y queda listo para revisión/aplicación del siguiente lifecycle step.`
- Archive and final handoff are not ready while that task is unchecked and unrelated working-tree documentation remains unseparated.
- Native runtime settlement returned `blocked: maintainer_decision` after the audit; no reset was attempted.
- The tasks forecast chained PRs; no `size:exception` is recorded. The frontend feature slice maps to the forecast's feature/documentation boundaries, but no PR boundary can be certified until the unrelated files are reconciled.

## Task 15 rerun — maintainer-authorized scope resolution

**Result: COMPLETE for the bounded HU-014/HU-015 slice.** Alex explicitly authorized excluding unrelated, user-owned manual paths from this change scope: `docs/images/arquitectura-contenedores.png`, `docs/images/diagrama-actividad-negocio.png`, `docs/images/diagrama-casos-uso-acceso-administracion.png`, `docs/puml/arquitectura-contenedores.puml`, `docs/puml/diagrama-actividad-negocio.puml`, `docs/puml/diagrama-casos-uso-acceso-administracion.puml`, and `docs/openspec/changes/implement-sprint-3-remaining-frontend-and-demo-data/`. This work unit did not alter, delete, or revert those paths.

With that approved boundary, all other changed/untracked paths belong to the Customers, ConfirmSale extension, Sales History/detail/PDF, route/navigation, minimal shared accessibility, tests, HU-014/HU-015 manifests, and this change's OpenSpec evidence. No `backend/`, OpenAPI/Swagger, or `frontend/src/types/api.generated.ts` path is changed or untracked; no generated source was edited and `api:generate` was not run.

### Rerun validation from `frontend/`

```text
pnpm run format:check  -> PASS
pnpm run typecheck     -> PASS
pnpm run lint          -> PASS
pnpm test              -> PASS: 28 files, 138 tests, 0 failed
pnpm run build         -> PASS: 2158 modules transformed; built in 1.01s
git diff --check       -> PASS
```

The Vite minified-chunk-over-500-kB warning remains non-fatal. Manual browser validation at approximately 360px, 768px, and 1280px was not run and remains pending; no screenshot or manual pass is claimed. Task 15 is now checked `[x]`; this is a scope-audit completion, not an archive, review, commit, or push approval.
