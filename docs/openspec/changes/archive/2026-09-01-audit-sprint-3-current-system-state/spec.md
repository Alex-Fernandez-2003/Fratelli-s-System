# Spec

## Requirements

### Audit Integrity

- [AUDIT-001] The audit MUST use the real local working tree as its primary source of truth.
- [AUDIT-002] The audit MUST NOT classify the public remote repository as equivalent to the local working tree.
- [AUDIT-003] The audit MUST NOT modify product source code.
- [AUDIT-004] The audit MUST NOT modify frontend configuration, dependencies or lockfiles.
- [AUDIT-005] The audit MUST NOT modify backend source code.
- [AUDIT-006] The audit MUST NOT modify existing migrations.
- [AUDIT-007] The audit MUST NOT regenerate OpenAPI or generated TypeScript.
- [AUDIT-008] The audit MUST NOT add, remove or modify tests.
- [AUDIT-009] The audit MUST NOT correct documentation drift.
- [AUDIT-010] Findings MUST be recorded without applying fixes.
- [AUDIT-011] An ordinary test/build failure MUST be recorded and MUST NOT trigger an automatic repair.
- [AUDIT-012] The audit SHOULD continue after non-destructive failures whenever additional areas remain inspectable.
- [AUDIT-013] Product behavior MUST remain read-only except for explicitly safe smoke validation in an isolated environment.
- [AUDIT-014] The audit MUST NOT execute destructive Git commands.
- [AUDIT-015] The audit MUST NOT commit or push.

### Git Baseline

- [GIT-001] The audit MUST capture `git status`.
- [GIT-002] The audit MUST capture the current branch.
- [GIT-003] The audit MUST capture `git rev-parse HEAD`.
- [GIT-004] The audit MUST inspect recent decorated log history.
- [GIT-005] The audit MUST inspect unstaged diff.
- [GIT-006] The audit MUST inspect staged diff.
- [GIT-007] The audit report MUST state:
  - Branch;
  - HEAD;
  - Working tree;
  - Staged;
  - Unstaged;
  - Untracked.
- [GIT-008] Local modifications MUST be considered part of the current system baseline even when they are not committed.
- [GIT-009] The audit MUST NOT clean, reset, restore, stash or otherwise normalize the working tree.

### OpenSpec State

- [OPENSPEC-001] The audit MUST inspect active and archived OpenSpec changes.
- [OPENSPEC-002] The audit MUST locate the actual equivalents of:
  - `implement-sprint-3-frontend-customers-and-sales-history`;
  - `implement-sprint-3-frontend-cash-closing`;
  - `implement-sprint-3-remaining-frontend-and-demo-data`.
- [OPENSPEC-003] Each relevant change MUST be classified as one of:
  - active;
  - completed;
  - archived;
  - abandoned;
  - superseded;
  - inconsistent/remnant.
- [OPENSPEC-004] `implement-sprint-3-remaining-frontend-and-demo-data` MUST NOT be treated as an implementation instruction merely because artifacts exist.
- [OPENSPEC-005] The audit MUST determine whether HU-026/HU-027 artifacts or execution evidence were accidentally written under an incorrect change.
- [OPENSPEC-006] The audit MUST identify artifacts whose documented state disagrees with repository implementation state.

### Sprint 3 Reconstruction

- [SPRINT-001] The audit MUST reconstruct the complete Sprint 3 HU set from local canonical documentation.
- [SPRINT-002] Every Sprint 3 HU MUST receive exactly one final state:
  - `COMPLETE`;
  - `BACKEND_COMPLETE_FRONTEND_PENDING`;
  - `PARTIAL`;
  - `BROKEN`;
  - `OUT_OF_SCOPE`;
  - `UNKNOWN_REQUIRES_RUNTIME_VALIDATION`.
- [SPRINT-003] A frontend intentionally pending by Sprint scope MUST NOT be classified as `BROKEN`.
- [SPRINT-004] A backend-complete story with frontend intentionally pending SHOULD be classified `BACKEND_COMPLETE_FRONTEND_PENDING` when confirmed by local evidence.
- [SPRINT-005] A recent implementation MUST NOT be classified `COMPLETE` without evidence that its relevant integration and validation conditions hold.
- [SPRINT-006] The audit MUST produce:
  `| HU | Backend | Frontend | Tests | Docs | OpenSpec | Estado real |`.
- [SPRINT-007] HU-014, HU-015, HU-026 and HU-027 MUST receive focused implementation and regression review.
- [SPRINT-008] HU-008, HU-019, HU-021, HU-023, HU-024, HU-028, HU-029, HU-030 and HU-031 MUST NOT be considered defects solely because their frontend remains intentionally pending.
- [SPRINT-009] The association of the Shift Open change with HU-025 MUST be verified from local documentation rather than inferred.

### HU-014 Customers

- [HU-014-001] The audit MUST inspect the Customers route and route guard.
- [HU-014-002] The audit MUST inspect desktop and mobile navigation exposure.
- [HU-014-003] The audit MUST verify server-side search rather than page-only filtering.
- [HU-014-004] The audit MUST verify server pagination.
- [HU-014-005] The audit MUST inspect status filtering.
- [HU-014-006] The audit MUST inspect create behavior.
- [HU-014-007] The audit MUST inspect edit behavior.
- [HU-014-008] The audit MUST inspect activate/deactivate behavior.
- [HU-014-009] ADMINISTRADOR and ENCARGADO SHOULD have read/create/edit/status capabilities when that remains the approved backend contract.
- [HU-014-010] MESERO SHOULD have read/create/edit but MUST NOT receive lifecycle status actions if the approved contract remains unchanged.
- [HU-014-011] Multi-role users MUST be audited using union-of-capabilities semantics.
- [HU-014-012] The customer form MUST be inspected for:
  - Name required;
  - CI required;
  - NIT optional;
  - Notes optional.
- [HU-014-013] Create/edit forms MUST be audited for absence of an editable `IsActive` field.
- [HU-014-014] The audit MUST verify that create defaults to the backend-defined active state rather than a fabricated frontend field.
- [HU-014-015] The audit MUST verify that no Delete action was introduced.
- [HU-014-016] The audit MUST inspect duplicate CI error handling.
- [HU-014-017] The audit MUST inspect duplicate NIT error handling.
- [HU-014-018] The audit MUST inspect responsive desktop table/mobile card behavior.

### HU-014 ConfirmSale Integration

- [HU-014-CS-001] ConfirmSale MUST receive focused regression review after Customer integration.
- [HU-014-CS-002] The audit MUST verify the Customer selector is optional.
- [HU-014-CS-003] The audit MUST verify that selectable customers are active according to the actual API behavior.
- [HU-014-CS-004] The audit MUST verify search by the supported Name/CI/NIT contract.
- [HU-014-CS-005] The audit MUST verify `Consumidor final`.
- [HU-014-CS-006] `Consumidor final` MUST NOT be implemented by creating a real Customer record as a workaround.
- [HU-014-CS-007] The audit MUST inspect quick-create reuse of the Customer form or shared form contract.
- [HU-014-CS-008] The audit MUST verify auto-selection uses the customer ID returned by the API.
- [HU-014-CS-009] Cancelling quick-create MUST preserve the parent sale form state.
- [HU-014-CS-010] The selected Customer MUST be clearable when optional.
- [HU-014-CS-011] ConfirmSale MUST send the selected `customerId` or contractual equivalent.
- [HU-014-CS-012] ConfirmSale MUST NOT manually send Customer snapshot fields if snapshots are server-owned.
- [HU-014-CS-013] The audit MUST verify Customer integration did not regress:
  - PaymentMethod;
  - SalesChannel;
  - shortage acknowledgement;
  - Shift requirement;
  - Order ENTREGADO requirement;
  - final Sale mutation.

### HU-015 Sales History

- [HU-015-001] The audit MUST inspect route, guard and navigation.
- [HU-015-002] The audit MUST verify default-today behavior against the actual requirement.
- [HU-015-003] The audit MUST inspect all supported filters.
- [HU-015-004] The audit MUST verify pagination is server-based when the backend contract is paginated.
- [HU-015-005] The audit MUST inspect responsive representation.
- [HU-015-006] Sale detail SHOULD be fetched on demand unless the current list contract already contains complete detail.
- [HU-015-007] The audit MUST inspect query keys for filter/pagination isolation.
- [HU-015-008] The audit MUST verify PaymentMethod values are limited to actual generated/backend enum values such as `CASH`, `QR`, `EXTERNAL` when those remain current.
- [HU-015-009] The audit MUST verify SalesChannel values are limited to actual generated/backend values such as `DIRECT`, `PEDIDOSYA` when those remain current.
- [HU-015-010] Frontend-only fake enum values MUST be reported.
- [HU-015-011] History/detail MUST use persisted Customer snapshots when the contract exposes them.
- [HU-015-012] The audit MUST detect any current-Customer lookup used to reconstruct historical identity.
- [HU-015-013] Null Customer sales MUST render `Consumidor final` or approved equivalent.
- [HU-015-014] The audit MUST verify no Customer named `Consumidor final` was created as a persistence workaround.
- [HU-015-015] Pure MESERO scope MUST be checked against backend authorization/filter behavior.
- [HU-015-016] Multi-role broader capability MUST prevail when backend policy grants it.
- [HU-015-017] The audit MUST detect a broad Shift filter that would falsely imply scope the backend does not grant.
- [HU-015-018] Detail MUST be inspected for:
  - metadata;
  - responsible;
  - shift;
  - payment;
  - channel;
  - customer snapshots;
  - items;
  - unit price;
  - line totals;
  - total;
  - real Sale ID.
- [HU-015-019] The audit MUST report fake IVA, discount, fake Sale Number or unsupported `Reprint Ticket` if present.

### HU-015 PDF

- [HU-015-PDF-001] The audit MUST confirm receipt generation is client-side.
- [HU-015-PDF-002] The PDF MUST be audited for the disclaimer:
  `Comprobante interno — No constituye factura fiscal.`
  or the exact approved equivalent.
- [HU-015-PDF-003] The PDF MUST use Sale snapshot data.
- [HU-015-PDF-004] The PDF MUST NOT perform current Customer lookup to reconstruct historical customer information.
- [HU-015-PDF-005] The audit MUST verify no fiscal-invoice behavior was introduced.
- [HU-015-PDF-006] The audit MUST identify the PDF dependency actually added.
- [HU-015-PDF-007] The audit MUST inspect package manifest, lockfile and imports for duplicate PDF libraries.
- [HU-015-PDF-008] The audit MUST inspect whether the PDF dependency is eagerly or lazily loaded.
- [HU-015-PDF-009] Build chunk warnings related to the PDF dependency MUST be recorded as performance debt unless functional evidence justifies higher severity.
- [HU-015-PDF-010] The audit MUST NOT upgrade or replace the PDF dependency.

### Shift Open Bugfix

- [SHIFT-OPEN-001] The operational-day flow MUST be reviewed from no active day through final CashClosing.
- [SHIFT-OPEN-002] The `Iniciar jornada` action MUST be inspected for modal invocation.
- [SHIFT-OPEN-003] The modal MUST be audited for:
  - `openingAmount`;
  - `pettyCashOpeningAmount`.
- [SHIFT-OPEN-004] Both fields MUST be checked as required by current runtime/backend rules.
- [SHIFT-OPEN-005] Zero MUST be accepted when the backend permits zero.
- [SHIFT-OPEN-006] Negative values MUST be checked for rejection.
- [SHIFT-OPEN-007] Decimal parsing MUST be audited.
- [SHIFT-OPEN-008] Comma/dot decimal behavior MUST be documented rather than assumed.
- [SHIFT-OPEN-009] The request to the actual Shift Open endpoint MUST include both required amounts.
- [SHIFT-OPEN-010] The audit MUST detect `undefined`/missing request bodies.
- [SHIFT-OPEN-011] Pending state MUST prevent duplicate submit.
- [SHIFT-OPEN-012] A validation/server error SHOULD leave the modal usable and preserve user values unless the existing UX contract intentionally differs.
- [SHIFT-OPEN-013] Success MUST be audited for Shift and Cash-context invalidation/refetch.
- [SHIFT-OPEN-014] The audit MUST compare backend runtime nullability requirements with OpenAPI/generated nullability.
- [SHIFT-OPEN-015] If generated `OpenOperationalDayRequest` remains nullable while runtime requires non-null amounts, the audit MUST record `CONTRACT_DRIFT`.
- [SHIFT-OPEN-016] Such drift MUST NOT automatically be classified as `BLOCKER` if the current product flow remains functional.
- [SHIFT-OPEN-017] Contract drift severity MUST be justified based on runtime impact and client-generation risk.

### HU-026 Cash Preview

- [HU-026-001] The audit MUST identify the actual Cash Preview endpoint.
- [HU-026-002] The query MUST be inspected for retry behavior.
- [HU-026-003] 404 handling MUST be inspected.
- [HU-026-004] Loading and generic network errors MUST be inspected.
- [HU-026-005] `expectedCash` MUST be checked as backend-authoritative.
- [HU-026-006] Any duplicate frontend formula treated as authority MUST be reported.
- [HU-026-007] Payment breakdown and channel breakdown MUST remain distinct.
- [HU-026-008] The audit MUST detect any mapping equivalent to `PEDIDOSYA = EXTERNAL`.
- [HU-026-009] Expense breakdown MUST be inspected.
- [HU-026-010] Handover/carried-forward context MUST be inspected.
- [HU-026-011] `cashAmountCarriedForward` MUST NOT be double-counted by frontend authority logic.

### HU-027 Cash Close

- [HU-027-001] The audit MUST inspect `declaredCash`.
- [HU-027-002] The provisional difference MUST be checked as presentation-only.
- [HU-027-003] `difference == 0` MUST allow optional observation if the current backend rule remains unchanged.
- [HU-027-004] `difference != 0` MUST require observation.
- [HU-027-005] Whitespace-only observation MUST be treated as invalid when observation is required.
- [HU-027-006] The confirmation dialog MUST be inspected before the final mutation.
- [HU-027-007] The audit MUST verify responsible identity comes from authenticated context/server response rather than user-supplied payload.
- [HU-027-008] The close request MUST be checked to send only the contractual input fields, conceptually `declaredCash` and `observation`.
- [HU-027-009] The frontend MUST NOT send authoritative `expectedCash`, `difference`, user ID or snapshot totals unless the actual backend contract requires them.
- [HU-027-010] Pending state MUST prevent duplicate submit.
- [HU-027-011] 400 handling MUST be inspected.
- [HU-027-012] 404 handling MUST be inspected.
- [HU-027-013] 409 handling MUST be inspected.
- [HU-027-014] A 409 MUST NOT produce an automatic retry of the close mutation.
- [HU-027-015] A 409 SHOULD trigger safe state refresh when current architecture supports it.
- [HU-027-016] Success UI MUST be audited against the returned `CashClosingDto` or actual response type.
- [HU-027-017] Provisional local values MUST NOT override a differing authoritative server snapshot after success.

### Routing and Navigation

- [ROUTE-001] Recent Customer, Sales History and Cash routes MUST be inspected for duplication.
- [ROUTE-002] Every recent route MUST be checked for the correct guard.
- [ROUTE-003] Every route intended for normal navigation MUST be checked for a matching desktop/mobile navigation path or an intentional parent route.
- [ROUTE-004] Dead navigation entries MUST be reported.
- [ROUTE-005] Duplicate navigation entries MUST be reported.
- [ROUTE-006] Incorrect role visibility MUST be reported.
- [ROUTE-007] Active-state matching MUST be inspected.
- [ROUTE-008] Back actions/deep links MUST be inspected where applicable.
- [ROUTE-009] The audit MUST NOT add missing routes or navigation items.

### Authorization

- [AUTH-001] Canonical roles MUST be checked as:
  - ADMINISTRADOR;
  - ENCARGADO;
  - MESERO;
  - COCINA;
  - CONTADORA;
  - EMPLEADO.
- [AUTH-002] Any active `CAJERO` product role MUST be reported unless current canonical backend definitions explicitly changed.
- [AUTH-003] Multi-role authorization MUST be inspected as union-of-capabilities.
- [AUTH-004] Role equality checks introduced in recent changes MUST be inspected for accidental single-role semantics.
- [AUTH-005] Frontend route guards MUST be compared with backend authorization.
- [AUTH-006] Navigation visibility MUST be compared with route guards.
- [AUTH-007] UI action visibility MUST be compared with backend capabilities.

### Query/API Integration

- [QUERY-001] Customers query keys MUST be inspected for search/status/page isolation.
- [QUERY-002] Sales History query keys MUST be inspected for filter/page isolation.
- [QUERY-003] Shift Open mutation invalidation MUST be inspected.
- [QUERY-004] Cash Preview query retry behavior MUST be inspected.
- [QUERY-005] Cash Close mutation invalidation/refetch behavior MUST be inspected.
- [QUERY-006] Duplicate global query keys that can collide MUST be reported.
- [QUERY-007] Excessive/eager detail queries MUST be reported.
- [QUERY-008] N+1 frontend request patterns MUST be reported.
- [QUERY-009] Query loops MUST be reported.
- [QUERY-010] Mutation double-trigger risk MUST be reported.
- [QUERY-011] Existing `staleTime`, retry and previous-data behavior SHOULD be documented where relevant to recent flows.

### Direct Network Calls and Types

- [NET-001] The audit MUST search for raw `fetch` outside accepted infrastructure.
- [NET-002] The audit MUST search for standalone Axios or additional HTTP clients.
- [NET-003] The audit MUST search for hardcoded backend URLs.
- [NET-004] The audit MUST search for manually constructed Bearer headers outside the accepted auth/http infrastructure.
- [NET-005] The audit MUST search for duplicated API clients.
- [TYPE-001] The audit MUST inspect `any` introduced in recent changes.
- [TYPE-002] Dangerous assertions introduced in recent changes MUST be reported.
- [TYPE-003] Handwritten copies of backend DTOs MUST be reported.
- [TYPE-004] Manual edits to generated API MUST be reported when detectable from Git/history/diff.
- [TYPE-005] Duplicate frontend enum definitions that drift from generated/backend contracts MUST be reported.

### General Frontend Architecture

- [FE-001] The audit MUST inspect package manifest and lockfile consistency.
- [FE-002] The audit MUST inspect AppRoutes.
- [FE-003] The audit MUST inspect navigation/AppShell.
- [FE-004] The audit MUST inspect AuthProvider and route guards.
- [FE-005] The audit MUST inspect query client and HTTP client.
- [FE-006] The audit MUST inspect shared formatters.
- [FE-007] The audit MUST inspect toast/feedback infrastructure.
- [FE-008] The audit MUST inspect shared dialog/modal primitives.
- [FE-009] Duplicate modal/dialog frameworks MUST be reported.
- [FE-010] Duplicate date/money formatters MUST be reported when they create inconsistent behavior.
- [FE-011] Duplicate auth/role matrices MUST be reported when they can drift.
- [FE-012] Duplicate routes MUST be reported.

### Backend Audit

- [BE-001] The audit MUST inspect the real backend solution structure.
- [BE-002] DI registration and critical endpoint composition MUST receive a transversal review.
- [BE-003] Backend policies used by recent frontend changes MUST be inspected.
- [BE-004] Critical services supporting Customers, ConfirmSale, Shift Open, Cash Preview and Cash Close MUST be inspected.
- [BE-005] ProblemDetails/error behavior MUST be compared with frontend handling.
- [BE-006] The audit MUST NOT redesign backend services.
- [BE-007] The audit MUST execute the actual solution's restore/build/tests when tooling is available.
- [BE-008] Backend failures MUST be recorded without source modifications.

### Contract Audit

- [CONTRACT-001] The audit MUST compare backend request/response DTOs with runtime/OpenAPI definitions.
- [CONTRACT-002] The audit MUST compare OpenAPI with generated TypeScript.
- [CONTRACT-003] The audit MUST compare generated TypeScript with frontend call sites.
- [CONTRACT-004] Special focus MUST include:
  - OpenOperationalDayRequest;
  - ConfirmSale;
  - Customer;
  - Sales History;
  - Cash Preview;
  - Cash Close.
- [CONTRACT-005] Generated API MUST receive a final classification:
  - `SYNCED`;
  - `DRIFT DETECTED`;
  - `UNKNOWN_REQUIRES_RUNTIME_VALIDATION`.
- [CONTRACT-006] The audit MUST NOT regenerate the generated client to hide or repair drift.
- [CONTRACT-007] Nullable-vs-required mismatches MUST be reported separately from functional failures.

### Inventory / Production / Purchase / Order / Expense / Attendance

- [FLOW-INV-001] The audit MUST identify the single inventory authority.
- [FLOW-INV-002] Production stock mutations MUST be inspected for use of that authority.
- [FLOW-INV-003] Purchase receipt inventory increments MUST be inspected.
- [FLOW-INV-004] Sale inventory effects MUST be inspected.
- [FLOW-PROD-001] Composition → Production → Inventory integration MUST be reviewed.
- [FLOW-PROD-002] HU-008 frontend MUST NOT be required for this audit to consider existing production functionality healthy.
- [FLOW-PUR-001] Supplier → Purchase → Receipt → Inventory MUST be reviewed.
- [FLOW-PUR-002] Create/cancel/receive/status transitions MUST be inspected.
- [FLOW-PUR-003] HU-019 frontend MUST NOT be treated as required completion.
- [FLOW-ORDER-001] Order → Kitchen → ENTREGADO transitions MUST be reviewed.
- [FLOW-ORDER-002] Dead or impossible transitions MUST be reported.
- [FLOW-SALE-001] ENTREGADO → ConfirmSale → Sale → Inventory → Sales History MUST receive high-priority review.
- [FLOW-SALE-002] Shift, Customer optionality, payment and channel contracts MUST be considered together.
- [FLOW-EXP-001] Active operation → Expense → cash source → Cash Preview impact MUST be reviewed.
- [FLOW-EXP-002] HU-021 frontend MUST NOT be treated as required completion.
- [FLOW-ATT-001] Existing attendance behavior MUST be reviewed for regression only.
- [FLOW-ATT-002] HU-023/HU-024 pending frontend MUST NOT be implemented or treated as defects.

### Shift/Cash End-to-End Functional Review

- [FLOW-CASH-001] The audit MUST review:
  `No jornada → Iniciar jornada → opening amounts → MORNING → handover → NIGHT → preview → final close`.
- [FLOW-CASH-002] This flow MUST receive the highest operational priority.
- [FLOW-CASH-003] Any impossible transition that prevents ordinary operation SHOULD be evaluated for BLOCKER severity.
- [FLOW-CASH-004] The audit MUST distinguish a code-level risk from a runtime-proven failure.
- [FLOW-CASH-005] Safe runtime mutations MAY only be executed against an explicitly safe test/demo environment.

### Database / Migrations

- [DB-001] All migrations MUST be inventoried in order.
- [DB-002] Duplicate or suspicious migration identifiers MUST be reported.
- [DB-003] The current model snapshot MUST be compared with recent migrations.
- [DB-004] Accidental schema drift MUST be reported.
- [DB-005] The recent demo migration MUST receive deep static review.
- [DB-006] Demo IDs MUST be inspected for determinism.
- [DB-007] Demo dates MUST be inspected for fixed deterministic anchors.
- [DB-008] `Random`, `Guid.NewGuid`, `DateTime.Now`, `UtcNow`, `NOW()`, `CURRENT_DATE` or equivalent nondeterministic data generation MUST be reported when used to determine demo content.
- [DB-009] `Up` MUST be inspected for FK/unique/check-constraint compatibility.
- [DB-010] `Down` MUST be inspected for scoped deletion.
- [DB-011] Destructive whole-table deletes MUST be reported.
- [DB-012] The audit MUST inspect whether demo data can interfere with the unique/current CashSession or operational-day context.
- [DB-013] The audit MUST inspect demo coherence for every domain actually seeded:
  - Customers;
  - Suppliers;
  - Products;
  - Inventory;
  - Production;
  - Purchases;
  - Orders;
  - Sales;
  - Expenses;
  - Shifts;
  - Attendance;
  - CashSession;
  - CashClosing.
- [DB-014] A migration MUST NOT be considered correct only because it compiles.
- [DB-015] If safe isolated DB validation is unavailable, runtime migration verification MUST be marked pending rather than passed.

### Error Handling

- [ERR-001] Recent flows MUST be inspected for 400 handling.
- [ERR-002] Recent flows MUST be inspected for 401 handling.
- [ERR-003] Recent flows MUST be inspected for 403 handling.
- [ERR-004] Recent flows MUST be inspected for 404 handling.
- [ERR-005] Recent flows MUST be inspected for 409 handling.
- [ERR-006] Recent flows MUST be inspected for network failure.
- [ERR-007] Raw ProblemDetails rendered directly to end users MUST be reported.
- [ERR-008] Generic errors that hide a materially actionable domain failure SHOULD be reported.
- [ERR-009] Retry loops around non-idempotent mutations MUST be reported at high severity according to impact.
- [ERR-010] Stale forms after server conflict MUST be reported.

### Responsive and Accessibility

- [UX-001] HU-014 Customers MUST be reviewed at 360, ~768 and >=1280 when browser evidence is available.
- [UX-002] ConfirmSale Customer integration MUST be reviewed at those viewports.
- [UX-003] HU-015 History/Detail/PDF action MUST be reviewed at those viewports.
- [UX-004] Shift Open modal MUST be reviewed at those viewports.
- [UX-005] HU-026/HU-027 Cash flow MUST be reviewed at those viewports.
- [UX-006] If browser validation cannot be executed, the relevant evidence MUST be `PENDING_EXTERNAL`.
- [A11Y-001] Recent dialogs MUST be inspected for accessible naming.
- [A11Y-002] Recent dialogs SHOULD be inspected for focus placement and return.
- [A11Y-003] Icon-only actions MUST be inspected for accessible names.
- [A11Y-004] Form errors MUST be inspected for association with fields.
- [A11Y-005] Tables MUST be inspected for header semantics.
- [A11Y-006] Cash difference MUST NOT rely solely on color for meaning.
- [A11Y-007] This audit MUST NOT claim WCAG certification.

### Performance

- [PERF-001] The audit MUST inspect excessive queries.
- [PERF-002] The audit MUST inspect N+1 frontend requests.
- [PERF-003] The audit MUST inspect unnecessary eager Sale detail requests.
- [PERF-004] The audit MUST inspect obvious duplicate mutations/query loops.
- [PERF-005] The audit MUST inspect bundle output after the PDF dependency addition.
- [PERF-006] A Vite >500kB chunk warning SHOULD be documented as non-blocking performance debt unless evidence shows functional degradation.
- [PERF-007] No optimization MUST be implemented during this audit.

### Quality Gates

- [TEST-001] The audit MUST identify and use the actual frontend scripts.
- [TEST-002] When available, the audit MUST execute:
  - format check;
  - typecheck;
  - lint;
  - full tests;
  - build.
- [TEST-003] The audit MUST record command, exit status and relevant failure/warning summary.
- [TEST-004] The audit MUST NOT edit source to make a failed frontend gate pass.
- [TEST-005] The audit MUST identify the actual backend solution.
- [TEST-006] When tooling is available, the audit MUST execute backend restore.
- [TEST-007] The audit MUST execute backend build.
- [TEST-008] The audit MUST execute backend tests.
- [TEST-009] Backend test/build failures MUST be recorded without fixes.
- [TEST-010] Missing external dependencies/tooling MUST be distinguished from product failure.

### Documentation

- [DOC-001] Documentation for HU-014 MUST be compared against actual implementation.
- [DOC-002] Documentation for HU-015 MUST be compared against actual implementation.
- [DOC-003] Documentation for HU-026 MUST be compared against actual implementation.
- [DOC-004] Documentation for HU-027 MUST be compared against actual implementation.
- [DOC-005] HU-025 or the actual Shift Open related documentation MUST be inspected when applicable.
- [DOC-006] Documentation drift MUST be recorded.
- [DOC-007] Existing documentation MUST NOT be rewritten during this audit.
- [DOC-008] Documentation that claims verification not supported by current evidence MUST be reported.

### Finding Classification

- [FIND-001] Every problem MUST have exactly one severity:
  - `BLOCKER`;
  - `HIGH`;
  - `MEDIUM`;
  - `LOW`;
  - `INFO`.
- [FIND-002] Every problem MUST have at least one primary category:
  - `FUNCTIONAL`;
  - `CONTRACT`;
  - `FRONTEND`;
  - `BACKEND`;
  - `DATABASE`;
  - `AUTH`;
  - `ROUTING`;
  - `QUERY`;
  - `UX`;
  - `A11Y`;
  - `TEST`;
  - `DOCS`;
  - `PERFORMANCE`.
- [FIND-003] A finding SHOULD record:
  - evidence source;
  - affected flow/HU;
  - observed behavior;
  - expected behavior;
  - impact;
  - reproducibility;
  - confidence;
  - recommended disposition.
- [FIND-004] `BLOCKER` MUST be reserved for evidence of:
  - app cannot start;
  - core flow impossible;
  - build red in a way that prevents normal development/execution;
  - core tests red;
  - critical auth bypass;
  - data corruption;
  - migration failure affecting baseline;
  - critical runtime 500.
- [FIND-005] An intentionally pending HU MUST NOT be a `BLOCKER` merely because its frontend is missing.
- [FIND-006] Recommended disposition MUST use one of:
  - fix before continuing Sprint 3;
  - fix during next related HU/change;
  - non-blocking technical debt;
  - documentation cleanup later;
  - no action / informational.
- [FIND-007] The audit MUST NOT implement the recommendation.

### Audit Report

- [REPORT-001] Future audit apply MUST create `system-current-state-audit.md` or convention-equivalent.
- [REPORT-002] The report MUST contain:
  - Executive Summary;
  - Git Baseline;
  - Current Sprint 3 State;
  - HU Matrix;
  - Recent Frontend Changes;
  - HU-014 Audit;
  - HU-015 Audit;
  - Shift Open Bugfix Audit;
  - HU-026 Audit;
  - HU-027 Audit;
  - General Frontend Audit;
  - Backend Audit;
  - Contract Audit;
  - Routing / Navigation;
  - Authorization;
  - Query / API Integration;
  - Database / Migrations;
  - Demo Data;
  - Functional Flow Review;
  - Tests / Build;
  - Responsive / Accessibility;
  - Documentation Drift;
  - Findings;
  - Recommended Next Actions.
- [REPORT-003] The report MUST end with one Sprint 3 baseline verdict:
  - `SPRINT_3_BASELINE_HEALTHY`;
  - `SPRINT_3_BASELINE_HEALTHY_WITH_FINDINGS`;
  - `SPRINT_3_BASELINE_HAS_BLOCKERS`.
- [REPORT-004] `RELEASE_READY` MUST NOT be used.
- [REPORT-005] Recommended actions MUST be priority ordered.
- [REPORT-006] The report MUST separate blockers from non-blocking debt.
- [REPORT-007] The report MUST separate static evidence, automated gate evidence and runtime/manual evidence.

## Behavior Scenarios

### Scenario 1: Frontend intentionally pending

Given HU-029 has a verified backend but frontend implementation remains intentionally pending by Sprint scope  
When the audit reconstructs its current state  
Then HU-029 is classified `BACKEND_COMPLETE_FRONTEND_PENDING` rather than `BROKEN`

### Scenario 2: Recent implementation has no runtime evidence

Given HU-014 source and tests appear implemented  
And no browser/runtime evidence can be executed  
When the audit assigns its final state  
Then it may be classified `UNKNOWN_REQUIRES_RUNTIME_VALIDATION` or `PARTIAL` according to the available evidence rather than automatically `COMPLETE`

### Scenario 3: Build fails

Given the frontend build command exits non-zero  
When the audit observes the failure  
Then the failure is recorded with evidence and severity  
And product source is not edited to make the build pass

### Scenario 4: Test fails

Given an existing Customer integration test fails  
When the audit executes the frontend test suite  
Then the failure is recorded  
And the audit continues to inspect other independent areas when possible

### Scenario 5: OpenSpec change discarded

Given `implement-sprint-3-remaining-frontend-and-demo-data` exists locally  
And repository/document evidence shows the plan was superseded by block-based execution  
When the OpenSpec state is reconstructed  
Then the change is classified according to evidence and is not treated as pending implementation work

### Scenario 6: Artifacts written under wrong change

Given HU-026/HU-027 source was implemented  
And its artifacts were written under a discarded large change rather than the actual cash-closing change  
When the audit compares OpenSpec history with source  
Then a documentation/OpenSpec finding is recorded without moving or rewriting artifacts

### Scenario 7: Shift Open nullability drift persists

Given backend runtime rejects null opening amounts  
And generated TypeScript declares those fields nullable  
When the contract audit compares the layers  
Then `CONTRACT_DRIFT` is recorded with severity based on its actual runtime/client impact  
And generated code is not regenerated

### Scenario 8: UI compensates for contract drift

Given Shift Open UI always validates and sends both amounts  
And the generated contract still declares them nullable  
When the flow succeeds  
Then the flow may remain functionally healthy while contract drift is still reported separately

### Scenario 9: Customer null sale

Given a Sale has no Customer  
When Sales History and Sale Detail render it  
Then the audit verifies the UI displays `Consumidor final` without requiring a persisted fake Customer

### Scenario 10: Customer snapshot

Given a historical sale contains persisted Customer snapshot fields  
And the current Customer has since changed  
When Sale Detail/PDF is inspected  
Then historical rendering is expected to use the Sale snapshot rather than a current Customer lookup

### Scenario 11: MESERO Customer lifecycle

Given a pure MESERO opens Customers  
When actions are inspected  
Then read/create/edit may be available according to contract  
But activate/deactivate is expected to be absent

### Scenario 12: Multi-role union

Given a user has MESERO and ENCARGADO  
When Customer lifecycle and Sales History scope are evaluated  
Then the effective capability is based on the union rather than the first/single role

### Scenario 13: Shift Open failure preserves form

Given both opening amounts are entered  
When the Open mutation receives a recoverable 400  
Then the audit checks whether the modal remains usable and preserves values  
Without modifying the implementation if it does not

### Scenario 14: Cash Preview authority

Given Cash Preview returns `expectedCash`  
When the frontend is inspected  
Then the audit verifies the value displayed as authoritative comes from that response rather than an independently reconstructed formula

### Scenario 15: Cash channel/payment separation

Given a preview contains PEDIDOSYA channel sales and EXTERNAL payment values  
When UI mapping is inspected  
Then the audit verifies those concepts remain independent

### Scenario 16: Closing with difference and blank observation

Given expected cash differs from declared cash  
And observation contains only whitespace  
When the close form is evaluated  
Then the audit expects the submit to remain blocked according to the current rule

### Scenario 17: Concurrent close

Given the Cash Close request receives 409  
When frontend handling is inspected  
Then the audit expects no automatic mutation retry and a refresh/non-actionable state according to the implemented flow

### Scenario 18: Server response differs from provisional close values

Given local UI calculated a provisional difference  
And the close response contains the authoritative snapshot  
When success renders  
Then the audit verifies the response snapshot wins

### Scenario 19: Raw fetch discovered

Given a recent feature directly invokes `fetch` with a hardcoded backend URL outside accepted infrastructure  
When the general frontend audit detects it  
Then a frontend/query/contract finding is recorded without replacing the call

### Scenario 20: PDF chunk warning

Given the build succeeds  
And Vite reports a chunk larger than the configured warning threshold after the PDF dependency  
When findings are classified  
Then it is recorded as non-blocking performance debt unless additional evidence shows functional impact

### Scenario 21: Demo migration uses current time

Given the demo migration derives seeded BusinessDates from `DateTime.Now` or database current date  
When migration source is inspected  
Then a DATABASE finding is recorded because reproducibility is not deterministic

### Scenario 22: Demo migration Down deletes unrelated rows

Given `Down` deletes broad table contents rather than fixed demo identifiers  
When the audit evaluates rollback safety  
Then the finding receives severity based on actual data-loss risk and may qualify as BLOCKER if applying/reverting the migration can corrupt shared baseline data

### Scenario 23: Demo data conflicts with current CashSession

Given the demo migration seeds an operational session that can be interpreted as the current active BusinessDate  
When the normal `Iniciar jornada` flow is evaluated  
Then the audit records interference risk rather than deleting or changing demo data

### Scenario 24: Browser unavailable

Given static/tests/build checks complete  
And no usable browser/runtime environment exists  
When responsive behavior is evaluated  
Then the affected manual evidence is marked `PENDING_EXTERNAL` and no visual PASS is fabricated

### Scenario 25: Core operational flow broken

Given ordinary Shift Open cannot succeed with a correct request in a safe runtime environment  
When the audit reproduces the failure  
Then the finding may be classified `BLOCKER` because a core operational flow is impossible

## Edge Cases

- Local branch differs from `develop`.
- HEAD contains commits not present remotely.
- Working tree has uncommitted recent frontend work.
- Staged and unstaged versions of the same file differ.
- Untracked OpenSpec artifacts exist.
- Large discarded OpenSpec change coexists with smaller active changes.
- An OpenSpec artifact claims complete but source is absent.
- Source exists but documentation still says frontend pending.
- Tests mention outdated contracts.
- Package manifest contains one PDF dependency but lockfile contains remnants of another.
- Lazy PDF import cannot be inferred statically.
- Generated API was modified locally but cannot be distinguished from regenerated output without Git history.
- Backend OpenAPI runtime cannot be started.
- PostgreSQL is unavailable.
- Safe demo DB does not exist.
- Build environment missing required SDK/runtime.
- One gate fails because dependency/tooling is missing rather than product code.
- Customer API returns duplicate-constraint errors in a different ProblemDetails shape than expected.
- Search appears server-side but frontend also filters current page.
- Pagination resets incorrectly on filter change.
- ConfirmSale quick-create succeeds but parent form loses other fields.
- Quick-create cancel resets ConfirmSale.
- Customer auto-select uses optimistic local ID rather than server response.
- Sale History fetches every detail eagerly.
- Sales PDF uses current Customer after historical snapshot exists.
- MESERO sees a Shift filter that backend ignores/rejects.
- Shift opening value `0` is rejected by truthiness validation.
- Decimal comma parses incorrectly.
- Double click triggers two Shift Open requests.
- Cash Preview retries 404 indefinitely.
- Cash Close retries POST automatically.
- 409 leaves stale actionable form.
- Backend returns authoritative close snapshot different from preview.
- Demo migration compiles but fails FK/check constraints at runtime.
- Demo migration's deterministic IDs collide with existing non-demo data.
- Demo migration seeds future-dated/current-active shift context.
- `Down` order violates FKs.
- Screenshot/manual evidence cannot be collected.
- Vite build emits large chunk warning while succeeding.
- Pending HUs have route placeholders that incorrectly imply implementation.
- Documentation claims test evidence that no longer passes.

## Acceptance Criteria

- The audit change contains no product implementation task.
- The future audit records a complete Git baseline before deeper inspection.
- The exact local Sprint 3 HU universe is documented.
- Every Sprint 3 HU has one allowed status.
- Intentionally pending frontend HUs are distinguishable from broken implementations.
- HU-014 audit covers Customers and ConfirmSale integration.
- HU-015 audit covers History, Detail, scope, snapshots and PDF.
- Shift Open audit covers validation, exact payload, mutation state, invalidation and nullability drift.
- HU-026 audit covers backend authority, breakdowns, retry/404 and carried-forward semantics.
- HU-027 audit covers validation, payload, confirmation, 400/404/409 and server-authoritative success.
- Routing/navigation/auth/multi-role receive explicit findings or PASS evidence.
- Query/API integration receives explicit findings or PASS evidence.
- Duplicate clients/routes/auth/query/formatters/types are searched for and documented.
- Backend solution/build/tests receive evidence when tooling is available.
- Frontend format/typecheck/lint/tests/build receive evidence when tooling is available.
- Generated API receives `SYNCED`, `DRIFT DETECTED` or `UNKNOWN_REQUIRES_RUNTIME_VALIDATION`.
- Demo migration deterministic/relational/rollback/current-operation risks are documented.
- Core Auth, Catalog/Inventory/Production, Purchase, Order/Sale, Shift/Cash, Expense and Attendance flows receive a documented review.
- Responsive/a11y evidence is either factual or `PENDING_EXTERNAL`.
- Every identified issue has severity and category.
- Findings contain no silent fixes.
- `system-current-state-audit.md` is produced.
- Recommended Next Actions are ordered by urgency.
- Final verdict is exactly one of the three Sprint 3 baseline verdicts.
- Product code changes performed by the audit equal zero.

## Out of Scope

- Completing HU-008.
- Completing HU-019.
- Completing HU-021.
- Completing HU-023.
- Completing HU-024.
- Completing HU-028.
- Completing HU-029.
- Completing HU-030.
- Completing HU-031.
- Fixing HU-014/HU-015 regressions.
- Fixing Shift Open.
- Fixing HU-026/HU-027.
- Correcting generated contract drift.
- Replacing the demo migration.
- Refactoring duplicated infrastructure.
- Optimizing PDF bundles.
- Documentation cleanup.
- Release readiness certification.
