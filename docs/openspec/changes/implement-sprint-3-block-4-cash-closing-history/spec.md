# Spec

## Requirements

### Global Architecture

- [HU-028-GLOBAL-001] HU-028 MUST extend the existing Cash/Shift frontend architecture.
- [HU-028-GLOBAL-002] HU-028 MUST NOT create a second Cash domain model.
- [HU-028-GLOBAL-003] HU-028 MUST reuse the existing TanStack Query client and HTTP client.
- [HU-028-GLOBAL-004] HU-028 MUST NOT use raw fetch.
- [HU-028-GLOBAL-005] HU-028 MUST NOT use manual `useEffect` server fetching.
- [HU-028-GLOBAL-006] HU-028 MUST NOT install a new dependency.
- [HU-028-GLOBAL-007] HU-028 MUST NOT modify the database model.
- [HU-028-GLOBAL-008] HU-028 MUST NOT create a migration.
- [HU-028-GLOBAL-009] HU-028 MUST NOT manually edit generated TypeScript.
- [HU-028-GLOBAL-010] HU-028 MUST remain a historical read capability rather than a reporting feature.

### Current Contract Blocker

- [HU-028-BLOCK-001] The history view MUST support the frozen current-month period requirement using server-side filtering.
- [HU-028-BLOCK-002] The frontend MUST NOT satisfy the period requirement by filtering only the visible page.
- [HU-028-BLOCK-003] The frontend MUST NOT download every CashClosing page solely to implement the period filter.
- [HU-028-BLOCK-004] If the local `/cash/closings` contract accepts only page and pageSize, APPLY MAY begin only after the maintainer explicitly authorizes the D19 / OPTION A additive backend date filter; D19 is now frozen and authorized.
- [HU-028-BLOCK-005] A responsible filter MUST NOT block the change when the backend does not support it.
- [HU-028-BLOCK-006] Summary-card absence MUST NOT block the change.

### D19 / OPTION A — Resolved Period Contract

- The existing `GET /api/v1/cash/closings` endpoint MUST accept optional date-only `from` and `to` query parameters.
- The endpoint MUST filter `CashClosing.BusinessDate` inclusively (`>= from`, `<= to`) before newest-first ordering and before `Skip/Take` pagination.
- `from` and `to` MAY be supplied independently; `from > to` MUST return the existing API validation/ProblemDetails response and MUST NOT be swapped silently.
- The extension MUST preserve page/pageSize-only compatibility, `CashHistory` authorization, `PagedResponse<CashClosingDto>`, and the existing DTO/entity/schema/migration boundary.

### Route / Authorization

- [HU-028-ROUTE-001] HU-028 MUST use `/turnos/cierres`.
- [HU-028-ROUTE-002] `/turnos/cierres` MUST be protected independently of navigation visibility.
- [HU-028-ROUTE-003] ADMINISTRADOR MUST have read access.
- [HU-028-ROUTE-004] ENCARGADO MUST have read access.
- [HU-028-ROUTE-005] CONTADORA MUST have read-only access.
- [HU-028-ROUTE-006] MESERO MUST be denied.
- [HU-028-ROUTE-007] COCINA MUST be denied.
- [HU-028-ROUTE-008] EMPLEADO MUST be denied.
- [HU-028-ROUTE-009] Multi-role users MUST receive the union of capabilities.
- [HU-028-ROUTE-010] CashHistory access MUST NOT imply CashManage access.

### Navigation

- [HU-028-NAV-001] Authorized users MUST have an explicit path to `Cierres de caja`.
- [HU-028-NAV-002] Navigation MUST remain inside the current Turnos/Caja module.
- [HU-028-NAV-003] CONTADORA MUST NOT be routed through `/turnos/cierre`.
- [HU-028-NAV-004] ADMINISTRADOR and ENCARGADO SHOULD have history access from the Turnos/Caja operational experience.
- [HU-028-NAV-005] The successful HU-027 state MUST offer `Ver historial de cierres` as a secondary action.
- [HU-028-NAV-006] The HU-027 success link MUST NOT replace the current successful-close confirmation.
- [HU-028-NAV-007] The implementation SHOULD extend the existing role-aware navigation mechanism rather than introduce hardcoded role chains in page JSX.

### History Query

- [HU-028-HISTORY-001] History MUST consume the existing Cash Closing history endpoint.
- [HU-028-HISTORY-002] History MUST use `PagedResponse<CashClosingDto>` or the exact local generated equivalent.
- [HU-028-HISTORY-003] Pagination MUST remain server-side.
- [HU-028-HISTORY-004] The frontend MUST NOT client-sort one page in a way that contradicts backend ordering.
- [HU-028-HISTORY-005] History SHOULD remain newest-first according to backend order.
- [HU-028-HISTORY-006] Query keys MUST include page, pageSize and every supported filter.
- [HU-028-HISTORY-007] The Cash query namespace MUST extend the existing `cashKeys` rather than create unrelated duplicated keys.
- [HU-028-HISTORY-008] Historical detail MUST NOT be prefetched for every visible row without a demonstrated project precedent.

### Filters

- [HU-028-FILTER-001] The visible mandatory filter MUST be Period once the backend contract supports it.
- [HU-028-FILTER-002] The default Period MUST be the current business month.
- [HU-028-FILTER-003] Clear Filters MUST restore the current business month.
- [HU-028-FILTER-004] Changing a server-side filter MUST reset page to 1.
- [HU-028-FILTER-005] Responsible MUST be exposed only when the real backend query contract supports it.
- [HU-028-FILTER-006] If Responsible remains unsupported, the frontend MUST classify it `OMITTED_BY_CURRENT_CONTRACT`.
- [HU-028-FILTER-007] The implementation MUST follow the predominant recent history filter interaction pattern rather than copy a mockup-only search button.
- [HU-028-FILTER-008] Invalid or empty optional params MUST be omitted rather than serialized as meaningless values.

### Pagination

- [HU-028-PAGE-001] History MUST use actual generated pagination metadata.
- [HU-028-PAGE-002] The frontend MUST NOT invent page-size metadata.
- [HU-028-PAGE-003] The default page size SHOULD reuse the established frontend/backend convention.
- [HU-028-PAGE-004] Empty last-page behavior after data/filter changes MUST recover to a valid page when the established query pattern supports it.

### List

- [HU-028-LIST-001] The desktop list SHOULD remain compact and reconciliation-focused.
- [HU-028-LIST-002] The desktop list SHOULD display:
  - BusinessDate;
  - closing actor identity available from contract;
  - ClosedAt when useful;
  - expectedCash;
  - declaredCash;
  - difference;
  - View Detail.
- [HU-028-LIST-003] The list MUST NOT reproduce the full payment/channel/expense breakdown.
- [HU-028-LIST-004] The list MUST NOT expose Edit.
- [HU-028-LIST-005] The list MUST NOT expose Delete.
- [HU-028-LIST-006] The list MUST NOT expose Reopen.
- [HU-028-LIST-007] The list MUST NOT expose Correct.
- [HU-028-LIST-008] The list MUST NOT expose Approve.
- [HU-028-LIST-009] The list MUST NOT expose Print/Download/Export.
- [HU-028-LIST-010] A human display name MUST NOT be fabricated when only `closedByUserId` exists.
- [HU-028-LIST-011] The implementation MUST NOT issue an N+1 User lookup for each closing merely to emulate names shown in the mockup.
- [HU-028-LIST-012] When no historical responsible display name exists, the UI MAY show the real actor ID using the project's identifier presentation convention.

### Difference Semantics

- [HU-028-DIFF-001] A positive difference MUST be labeled `Sobrante`.
- [HU-028-DIFF-002] A negative difference MUST be labeled `Faltante`.
- [HU-028-DIFF-003] A zero difference MUST be labeled `Cuadrado`.
- [HU-028-DIFF-004] The numeric sign MUST be preserved.
- [HU-028-DIFF-005] Difference meaning MUST NOT depend on color alone.
- [HU-028-DIFF-006] The frontend MUST use the persisted `difference` and MUST NOT recalculate it as historical authority.
- [HU-028-DIFF-007] Existing cash difference formatter/semantics SHOULD be reused where appropriate.

### Snapshot Authority

- [HU-028-SNAPSHOT-001] The Cash Closing History MUST display persisted closing data and MUST NOT recompute historical expected cash from current operational records.
- [HU-028-SNAPSHOT-002] Detail MUST NOT query current Sales to reconstruct historical Sales totals.
- [HU-028-SNAPSHOT-003] Detail MUST NOT query current Expenses to reconstruct historical Expense totals.
- [HU-028-SNAPSHOT-004] Detail MUST NOT query the current CashSession to fill missing historical snapshot fields.
- [HU-028-SNAPSHOT-005] `expectedCash` MUST use the persisted CashClosing value.
- [HU-028-SNAPSHOT-006] `declaredCash` MUST use the persisted CashClosing value.
- [HU-028-SNAPSHOT-007] `difference` MUST use the persisted CashClosing value.
- [HU-028-SNAPSHOT-008] `observation` MUST use the persisted CashClosing value.
- [HU-028-SNAPSHOT-009] Missing historical values MUST remain absent/`—` rather than be reconstructed.

### Detail

- [HU-028-DETAIL-001] Detail SHOULD use the existing `GET /cash/closings/{id}` endpoint when it remains present locally.
- [HU-028-DETAIL-002] Detail MUST be fetched on demand when a dedicated endpoint is used.
- [HU-028-DETAIL-003] A new detail endpoint MUST NOT be introduced.
- [HU-028-DETAIL-004] Desktop SHOULD use the established Drawer/detail overlay when available.
- [HU-028-DETAIL-005] Mobile SHOULD use the established Sheet/bottom-sheet behavior when available.
- [HU-028-DETAIL-006] If the current shared system only has an accessible responsive Modal, the implementation MAY reuse it rather than add a third overlay system.
- [HU-028-DETAIL-007] Detail MAY display only actual contract fields.
- [HU-028-DETAIL-008] Detail SHOULD display BusinessDate and ClosedAt.
- [HU-028-DETAIL-009] Detail SHOULD display the real closing actor identity available in the contract.
- [HU-028-DETAIL-010] Detail SHOULD display openingAmount.
- [HU-028-DETAIL-011] Detail SHOULD display pettyCashOpeningAmount separately.
- [HU-028-DETAIL-012] Detail SHOULD display cashRemovedAmount.
- [HU-028-DETAIL-013] Detail MUST NOT display `cashAmountCarriedForward` when it is absent from the persisted closing contract.
- [HU-028-DETAIL-014] Detail SHOULD display payment totals.
- [HU-028-DETAIL-015] Detail SHOULD display channel totals.
- [HU-028-DETAIL-016] Detail SHOULD display cash-drawer and petty-cash expense totals.
- [HU-028-DETAIL-017] Detail MUST display expected/declared/difference.
- [HU-028-DETAIL-018] Detail SHOULD display observation only when present.
- [HU-028-DETAIL-019] Detail MUST NOT display a fabricated sequential closing number.
- [HU-028-DETAIL-020] If ID is displayed, it MUST be the real backend ID.
- [HU-028-DETAIL-021] A visually abbreviated UUID MUST retain access to the complete value where useful.

### Opening Amounts

- [HU-028-OPEN-001] openingAmount and pettyCashOpeningAmount MUST be presented as separate snapshot values when both exist.
- [HU-028-OPEN-002] The UI MUST NOT collapse both into one fabricated `Monto inicial`.
- [HU-028-OPEN-003] Labels SHOULD follow current terminology, conceptually `Apertura caja principal` and `Apertura caja chica`.

### Payments / Channels

- [HU-028-PAY-001] Payment methods and Sales channels MUST be visually and semantically separate.
- [HU-028-PAY-002] CASH MUST be treated as PaymentMethod.
- [HU-028-PAY-003] QR MUST be treated as PaymentMethod.
- [HU-028-PAY-004] EXTERNAL MUST be treated as PaymentMethod.
- [HU-028-PAY-005] DIRECT MUST be treated as SalesChannel.
- [HU-028-PAY-006] PEDIDOSYA MUST be treated as SalesChannel.
- [HU-028-PAY-007] PEDIDOSYA MUST NOT be rendered as a PaymentMethod.
- [HU-028-PAY-008] The UI MUST NOT combine PaymentMethod totals and SalesChannel totals as one additive breakdown.
- [HU-028-PAY-009] Current cash labels SHOULD be reused:
  - CASH → Efectivo;
  - QR → QR;
  - EXTERNAL → Pago externo;
  - DIRECT → Directo;
  - PEDIDOSYA → PedidosYa.

### Read-Only Behavior

- [HU-028-RO-001] Cash Closing History MUST be read-only for every authorized role.
- [HU-028-RO-002] The frontend MUST NOT expose controls to reopen, edit, delete, correct, or approve a CashClosing.
- [HU-028-RO-003] Historical observation MUST NOT be editable.
- [HU-028-RO-004] Historical declaredCash MUST NOT be editable.
- [HU-028-RO-005] HU-028 MUST NOT expose another Close action.
- [HU-028-RO-006] No persistent `Modo de consulta` warning/banner is required.
- [HU-028-RO-007] The read-only nature SHOULD be evident from the absence of mutations.

### Summary

- [HU-028-SUM-001] Summary cards MUST be omitted when the HU-028 backend response does not expose aggregates.
- [HU-028-SUM-002] The history summary MUST NOT be calculated from the visible page.
- [HU-028-SUM-003] The frontend MUST NOT download all pages to calculate summary.
- [HU-028-SUM-004] The frontend MUST NOT call Sales/Expenses APIs to build HU-028 report metrics.
- [HU-028-SUM-005] The frontend MUST NOT infer `Días sin cierre`.
- [HU-028-SUM-006] The frontend MUST NOT calculate month-over-month trends.
- [HU-028-SUM-007] Absence of summary is an approved result and MUST NOT require a product decision.

### Legacy / Null Safety

- [HU-028-LEGACY-001] Optional observation MUST be null-safe.
- [HU-028-LEGACY-002] Missing optional display metadata MUST be null-safe.
- [HU-028-LEGACY-003] If local generated types introduce nullable legacy opening/expense fields, the UI MUST render them safely.
- [HU-028-LEGACY-004] Missing values SHOULD use `—` or the current shared empty-value convention.
- [HU-028-LEGACY-005] Missing snapshot values MUST NOT be reconstructed from current records.

### Business Date / Time

- [HU-028-TIME-001] BusinessDate MUST be treated as date-only.
- [HU-028-TIME-002] BusinessDate MUST NOT be converted as an arbitrary UTC instant that can move it to another calendar date.
- [HU-028-TIME-003] ClosedAt MUST be formatted as a timestamp using the current business-time helper.
- [HU-028-TIME-004] America/La_Paz SHOULD be used only if confirmed by current business-time configuration.
- [HU-028-TIME-005] Existing cash date/time formatters SHOULD be reused when correct.

### Responsive

- [HU-028-RESP-001] HU-028 MUST be responsive-ready at 360 px.
- [HU-028-RESP-002] HU-028 MUST be responsive-ready around 768 px.
- [HU-028-RESP-003] HU-028 MUST be responsive-ready at >=1280 px.
- [HU-028-RESP-004] Desktop SHOULD use a compact table.
- [HU-028-RESP-005] Mobile MUST use cards rather than squeeze the desktop table horizontally.
- [HU-028-RESP-006] Mobile cards MUST preserve BusinessDate, expectedCash, declaredCash, difference and Detail action.
- [HU-028-RESP-007] Period controls MUST remain usable at 360 px under the D19 contract.
- [HU-028-RESP-008] Summary space MUST disappear cleanly when summary is absent rather than leaving empty mockup placeholders.

### Accessibility

- [HU-028-A11Y-001] Filter controls MUST have accessible labels.
- [HU-028-A11Y-002] `Ver detalle` MUST have an accessible name.
- [HU-028-A11Y-003] Difference MUST include textual Sobrante/Faltante/Cuadrado semantics.
- [HU-028-A11Y-004] Detail overlay MUST use accessible dialog/drawer semantics.
- [HU-028-A11Y-005] Detail overlay SHOULD manage initial focus and focus return according to the current shared primitive.
- [HU-028-A11Y-006] Keyboard close MUST be supported by the selected shared overlay primitive.
- [HU-028-A11Y-007] Pagination controls MUST have accessible names.
- [HU-028-A11Y-008] Recoverable errors MUST use semantic error/Alert infrastructure.

### Loading / Empty / Error

- [HU-028-STATE-001] Initial loading SHOULD use existing Skeleton primitives.
- [HU-028-STATE-002] Background refetch SHOULD preserve existing rendered history when the established TanStack Query pattern permits it.
- [HU-028-STATE-003] Empty current-month history MUST be distinct from filtered-empty history.
- [HU-028-STATE-004] Filtered empty SHOULD offer Clear Filters.
- [HU-028-STATE-005] Recoverable errors MUST offer Retry.
- [HU-028-STATE-006] Raw backend exceptions MUST NOT be rendered.
- [HU-028-STATE-007] Error copy MUST NOT fabricate a connectivity diagnosis.

### Testing

- [HU-028-TEST-001] Tests MUST use the current Vitest/Testing Library and React Query test conventions.
- [HU-028-TEST-002] Route tests MUST cover ADMIN access.
- [HU-028-TEST-003] Route tests MUST cover ENCARGADO access.
- [HU-028-TEST-004] Route tests MUST cover CONTADORA access.
- [HU-028-TEST-005] Route tests MUST cover MESERO/COCINA/EMPLEADO denial.
- [HU-028-TEST-006] Multi-role union MUST be covered.
- [HU-028-TEST-007] Current-month period behavior MUST be tested once contractually supported.
- [HU-028-TEST-008] Server pagination MUST be tested.
- [HU-028-TEST-009] Page reset after filters MUST be tested.
- [HU-028-TEST-010] Responsible filter MUST be tested only if the final contract supports it.
- [HU-028-TEST-011] Positive difference MUST render Sobrante.
- [HU-028-TEST-012] Negative difference MUST render Faltante.
- [HU-028-TEST-013] Zero difference MUST render Cuadrado.
- [HU-028-TEST-014] Detail MUST render persisted expected/declared/difference.
- [HU-028-TEST-015] Detail MUST verify PEDIDOSYA under Channels rather than Payment Methods.
- [HU-028-TEST-016] Detail MUST cover observation null.
- [HU-028-TEST-017] Tests MUST verify no historical mutation controls.
- [HU-028-TEST-018] Tests MUST verify no export/download action.
- [HU-028-TEST-019] HU-027 success MUST test the new History link.
- [HU-028-TEST-020] HU-026/HU-027 focused regressions MUST remain green.
- [HU-028-TEST-021] Full frontend format/typecheck/lint/tests/build MUST run using real scripts.
- [HU-028-TEST-022] Backend regression SHOULD run according to current OpenSpec/project convention even though backend product code is expected unchanged.
- [HU-028-TEST-023] Generated TypeScript MUST be checked for unexpected diff.

### Evidence Policy

- [HU-028-EVIDENCE-001] Manual responsive evidence MUST be recorded as `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
- [HU-028-EVIDENCE-002] Manual accessibility walkthrough MUST be deferred to Sprint Final Audit.
- [HU-028-EVIDENCE-003] Missing manual screenshots MUST NOT block implementation completion.
- [HU-028-EVIDENCE-004] The block MUST NOT claim manual PASS without actual evidence.
- [HU-028-EVIDENCE-005] Code-level responsive and accessibility requirements remain mandatory.

## Behavior Scenarios

### Scenario 1: ADMIN opens closing history

Given an ADMINISTRADOR is authenticated  
When `/turnos/cierres` is opened  
Then the user is authorized to read closing history  
And no historical mutation action is displayed

### Scenario 2: ENCARGADO opens closing history

Given an ENCARGADO is authenticated  
When `/turnos/cierres` is opened  
Then the user is authorized to read closing history

### Scenario 3: CONTADORA opens closing history

Given a pure CONTADORA is authenticated  
When `/turnos/cierres` is opened  
Then history and detail are readable  
And Cash Close controls are not available

### Scenario 4: Unauthorized role

Given a pure MESERO, COCINA or EMPLEADO  
When the user navigates directly to `/turnos/cierres`  
Then the route guard denies access

### Scenario 5: Current-month default

Given the final backend contract supports date filtering  
When an authorized user first opens history  
Then the query uses the current business month as its period

### Scenario 6: Period filter

Given a supported date range is selected  
When the period changes  
Then page resets to 1  
And the range is sent server-side

### Scenario 7: Unsupported period contract

Given the local history endpoint accepts only page and pageSize  
When APPLY is about to begin  
Then implementation stops before product changes  
And the maintainer is asked to resolve D3 rather than implementing client-side filtering

### Scenario 8: Responsible filter supported

Given the final generated contract contains a responsible/closedBy filter  
When the user filters by Responsible  
Then the value is sent server-side

### Scenario 9: Responsible filter unsupported

Given the final generated contract has no Responsible query parameter  
When history is implemented  
Then the Responsible filter is omitted  
And HU-028 remains otherwise valid

### Scenario 10: Server pagination

Given there are more closings than one page  
When the user navigates to the next page  
Then only that page is requested from the history endpoint

### Scenario 11: Positive difference

Given a persisted closing has difference greater than zero  
When the list or detail renders  
Then it displays the signed amount and `Sobrante`

### Scenario 12: Negative difference

Given a persisted closing has difference lower than zero  
When the list or detail renders  
Then it displays the signed amount and `Faltante`

### Scenario 13: Zero difference

Given a persisted closing has difference exactly zero  
When the list or detail renders  
Then it displays `Cuadrado` and the zero amount

### Scenario 14: Open detail

Given an authorized user selects `Ver detalle`  
When the detail endpoint is requested  
Then the corresponding CashClosing snapshot is displayed  
And no live operational APIs are used to reconstruct it

### Scenario 15: Payment breakdown

Given the snapshot contains cashSalesTotal, qrSalesTotal and externalSalesTotal  
When detail renders  
Then they appear under `Medios de pago`

### Scenario 16: Channel breakdown

Given the snapshot contains directSalesTotal and pedidosYaSalesTotal  
When detail renders  
Then they appear under `Canales`  
And PedidosYa is not displayed as a payment method

### Scenario 17: Opening balances

Given a closing contains openingAmount and pettyCashOpeningAmount  
When detail renders  
Then main and petty openings are shown separately

### Scenario 18: Carried-forward absent

Given the closing snapshot has no cashAmountCarriedForward field  
When detail renders  
Then the frontend does not query current CashSession to reconstruct it

### Scenario 19: Observation absent

Given a squared historical closing has observation null  
When detail renders  
Then no fabricated observation text is shown

### Scenario 20: No results

Given the selected period contains no closings  
When history returns zero records  
Then a factual empty state is displayed

### Scenario 21: Filtered empty

Given records exist outside the active supported filters  
When the filtered result is empty  
Then the UI communicates no matching closings  
And provides Clear Filters

### Scenario 22: Recoverable error

Given the history request fails with a recoverable error  
When the page renders  
Then safe error feedback and Retry are displayed

### Scenario 23: HU-027 success integration

Given ADMINISTRADOR or ENCARGADO successfully records a final CashClosing  
When HU-027 success state renders  
Then `Ver historial de cierres` is available as a secondary action  
And the current success confirmation remains visible

### Scenario 24: No historical mutations

Given any authorized HU-028 reader views a closing  
When list/detail actions render  
Then no edit, delete, reopen, correct or approve control exists

### Scenario 25: Mobile closing card

Given the layout is rendered in the mobile composition  
When a closing item is displayed  
Then BusinessDate, expected, declared, difference semantics and Detail action remain represented

## Edge Cases

- Current month contains zero closings.
- Exactly one closing exists.
- Many pages of closings exist.
- Large decimal currency amounts.
- Positive difference.
- Negative difference.
- Exact zero difference.
- observation null.
- Long observation.
- responsible display name unavailable.
- closedByUserId only.
- openingAmount missing only if a future/legacy nullable contract permits it.
- pettyCashOpeningAmount missing only if the final contract permits it.
- cashRemovedAmount zero.
- payment totals zero.
- channel totals zero.
- ClosedAt near America/La_Paz day boundary.
- BusinessDate on first/last day of month.
- User changes filters while on a high page.
- Last pagination page.
- Detail returns 404 for a stale/deleted ID even though history is designed immutable.
- CONTADORA + ENCARGADO multi-role.
- Current operational CashSession exists while old closing Detail is open.
- Preview exposes carriedForward but historical DTO does not.
- `closedByUserId` cannot be resolved to a display name without privileged API access.

## Acceptance Criteria

- The local repository baseline MUST be audited before APPLY.
- The period-filter contract contradiction MUST be resolved before APPLY if still present locally.
- `/turnos/cierres` MUST be defined as the HU-028 route.
- CashHistory authorization MUST allow ADMIN/ENC/CONTADORA.
- Other canonical roles MUST be denied.
- CashManage MUST remain separate.
- History MUST use server pagination.
- History MUST preserve backend ordering.
- Current-month period MUST be implemented server-side once contractually available.
- Responsible filter MUST be omitted when unsupported.
- Summary MUST be omitted when backend aggregates are absent.
- List MUST remain compact.
- Positive/negative/zero differences MUST have textual semantics.
- Detail MUST consume the persisted closing contract.
- History MUST NOT reconstruct expectedCash.
- History MUST NOT reconstruct missing carried-forward cash.
- PaymentMethod and SalesChannel MUST remain separated.
- PedidosYa MUST appear only as Channel.
- Main and petty openings MUST remain separate.
- No edit/delete/reopen/correct/approve controls may exist.
- No export/download control may exist.
- HU-027 success MUST gain the secondary history link.
- Existing HU-026/HU-027 behavior MUST remain unchanged otherwise.
- Backend source may change only to implement the D19 additive filter on the existing history endpoint; no other backend source change may occur.
- No migration may be created.
- No package may be installed.
- Generated TypeScript MUST remain unchanged if backend remains unchanged.
- Full automated frontend gates MUST pass.
- Manual evidence MUST remain deferred and MUST NOT block this block.

## Out of Scope

- New backend History endpoint.
- Backend summary.
- Reporting aggregates.
- Sales trends.
- Expense trends.
- Days-without-closing metric.
- Month-over-month comparison.
- HU-029.
- HU-030.
- HU-031.
- Reopen.
- Correction.
- Approval.
- Historical editing.
- Digital signature.
- Last modification.
- PDF.
- CSV.
- XLSX.
- Print.
- Download.
- Schema changes.
- Migration.
- New dependencies.
