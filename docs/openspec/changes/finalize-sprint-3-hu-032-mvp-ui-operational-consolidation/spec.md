# Spec

## Requirements

### Global Architecture

- HU-032 MUST remain one cohesive OpenSpec change.
- HU-032 MUST harden and consolidate existing MVP functionality and MUST NOT introduce a new major business module.
- APPLY MUST begin with a read-only audit of the real local working tree.
- Product code MUST NOT be modified during this OpenSpec generation.
- Existing architectural boundaries SHOULD be extended rather than replaced.
- Existing frontend primitives SHOULD be reused before new equivalents are created.
- A generic universal dashboard/history/form framework MUST NOT be created solely for HU-032.
- Schema changes MUST NOT be introduced by default.
- A migration MUST NOT be created unless a later explicit product decision authorizes an unavoidable schema requirement.
- If a schema change is proven necessary, HU-032 MUST surface `HU_032_SCHEMA_PRODUCT_DECISION_REQUIRED` before implementation of that schema change.
- Runtime OpenAPI MUST remain the generated frontend contract authority when backend contracts change.
- Generated TypeScript MUST NOT be edited manually.
- User-visible application copy MUST NOT expose internal implementation planning terminology unnecessarily.

### Visual Reference Authority

- Every visual reference supplied for HU-032 MUST be audited and either reconciled with a real application screen or explicitly classified as non-applicable with rationale.
- All 74 files listed in `Pantallas.zip` MUST receive an individual audit entry.
- The visual audit MUST distinguish:
  - KEEP;
  - ADAPT;
  - REPLACE;
  - OMIT;
  - MANUAL-LATER.
- Visual references MUST NOT be treated as authorization to implement domain capabilities absent from the approved MVP.
- Mockup data MUST NOT be treated as production data.
- Mockup amounts, percentages, names, avatars and IDs MUST NOT be hardcoded.
- Functional decisions frozen in HU-032 MUST override conflicting visual references.
- After Phase B, intentional UI changes made by the maintainer MUST become the primary visual authority for the propagation pass.
- Phase C MUST NOT revert maintainer changes merely because they differ from the original mockup.

### Global Visual Language

- The frontend SHOULD retain the existing Fratelli dark visual language.
- Existing design tokens SHOULD be reused before creating new one-off values.
- Orange SHOULD remain the primary action/accent color where consistent with existing tokens.
- Status presentation MUST pair semantic text/iconography with color.
- Success, warning, destructive/error and information states SHOULD use the established semantic color system.
- Main content SHOULD use consistent page headers, muted subtitles, card borders, spacing and radius patterns.
- Desktop data-heavy views SHOULD use tables when appropriate.
- Mobile equivalents SHOULD use cards/lists when desktop tables are not usable at 360 px.
- Complex desktop details SHOULD use the established Drawer pattern when available.
- Complex mobile details SHOULD use the established Sheet/Bottom Sheet pattern when available.
- Loading, empty, filtered-empty and error states SHOULD use shared primitives.
- Fake rows MUST NOT be displayed as real data while loading.

### Role and Capability Model

- Canonical roles MUST be revalidated before APPLY.
- Expected canonical roles are:
  - ADMINISTRADOR;
  - ENCARGADO;
  - MESERO;
  - COCINA;
  - CONTADORA;
  - EMPLEADO.
- CAJERO MUST NOT be introduced.
- Multi-role behavior MUST use union-of-capabilities semantics.
- Dashboard widgets MUST be capability-aware.
- A role-specific dashboard MUST NOT grant a capability that the route/backend denies.
- Hidden navigation MUST NOT replace route/backend authorization.

### F1 — Cash/Shift Amounts

- Turnos/Caja MUST display real available monetary values.
- The frontend MUST NOT invent zero values for missing mappings.
- Null/absent contract fields MUST use the established unavailable-value presentation rather than fabricated money.
- Money MUST use the current Bs/BOB/es-BO formatter.
- The apply phase MUST trace backend DTO → generated type → query → mapping → formatter → rendered card before deciding a backend change.
- A backend DTO extension MAY be used only if real required data is not currently exposed.

### F2 — Role Dashboards

- `/inicio` or its actual equivalent MUST provide role-aware content.
- The implementation MAY share dashboard primitives/widgets but MUST preserve meaningful role-specific composition.
- ADMINISTRADOR SHOULD prioritize approved operational/admin/report access.
- ENCARGADO SHOULD prioritize operations such as orders, inventory, production, purchases, expenses and Turnos/Caja where actual capabilities allow.
- MESERO SHOULD prioritize real order/sale/attendance capabilities.
- COCINA SHOULD prioritize real Kitchen, Production and Inventory capabilities.
- CONTADORA SHOULD prioritize real report/read-only histories.
- EMPLEADO SHOULD prioritize personal Attendance capabilities.
- Dashboard metrics MUST come from backend data or safe presentation derivation from already loaded backend data.
- Dashboards MUST NOT contain `Math.random()`, fake percentages or hardcoded monetary KPIs.
- Unsupported mockup cards SHOULD be replaced by real navigation/summary cards or omitted.

### F3 — Kitchen Current Day

- The Kitchen operational list MUST contain only orders belonging to the current business day according to America/La_Paz semantics.
- A yesterday order MUST NOT appear in the current-day Kitchen operational list.
- A valid order after the next business-day boundary MUST appear under the new business day.
- If the backend query currently returns unbounded historical Kitchen records, the preferred fix MUST be a server-side query restriction rather than client-only security/visibility filtering.
- If BusinessDate is the canonical order authority, it SHOULD be preferred to arbitrary browser timestamp interpretation.
- For timestamp contracts, a half-open `[startOfToday, startOfTomorrow)` interval SHOULD be used.
- Existing Kitchen workflow states MUST be preserved.

### F4 — Production History Current Month

- The default production-history range MUST represent the complete current calendar month without excluding productions occurring on the current day.
- Timestamp filtering SHOULD use `[firstDayCurrentMonth, firstDayNextMonth)`.
- DateOnly contracts MUST use their real inclusive/exclusive semantics.
- User-modified filters MUST remain supported according to the current contract.

### F5 — Production Detail Eye

- Production history detail MUST use the shared Eye icon action instead of a text-only `Ver detalle` action where the table design uses icon actions.
- The action MUST preserve the existing detail behavior.
- The action MUST have an accessible name.
- The action SHOULD have a tooltip.
- Keyboard activation and visible focus MUST work.

### F6 — Production Search + Product List

- Register Production MUST render product search and product candidate selection vertically.
- The search input MUST only filter candidate products.
- Typing in search MUST NOT itself select a Product.
- The candidate list MUST present real selectable Products.
- Selection MUST be single-selection unless the current domain explicitly requires otherwise.
- Selected state MUST be visible.
- Keyboard selection MUST be supported.
- No-match state MUST be explicit.
- Desktop and mobile MUST preserve the stacked structure.

### F7 — Production Unit

- Production quantity MUST display the selected Product's actual unit.
- The unit MUST come from backend/domain data.
- The unit MUST NOT be inferred from Product name.
- A missing unit MUST be handled explicitly rather than silently substituted.

### F8 — Discrete vs Divisible Production Quantity

- Production quantity MUST reject fractional quantities for discrete units.
- A positive integer MUST remain valid for discrete units subject to existing stock/business rules.
- A valid positive decimal MAY be accepted for divisible units subject to actual precision.
- `step=1` alone MUST NOT be treated as authoritative validation.
- Backend/domain/application validation MUST protect the rule if the current backend permits invalid fractional discrete production.
- The implementation MUST use actual Unit semantics and MUST NOT rely on arbitrary translated strings unless those strings are the canonical model.
- If the current model cannot safely distinguish discrete/divisible units, APPLY MUST stop that subtask and return a product decision instead of guessing.

### F9 — Inventory Default Product Type

- Inventory existence view MUST default to the actual enum/value equivalent of `Producto de venta`.
- Users with filter permission MUST remain able to change that filter.
- The frontend MUST NOT alter backend authorization scope to implement the default.

### F10 — Inventory Movements Today

- Inventory Movements MUST default to the current business day.
- Timestamp filters SHOULD use `[startOfToday, startOfTomorrow)` in America/La_Paz.
- DateOnly/BusinessDate contracts MUST follow real semantics.
- Users MUST remain able to change the period when the current feature permits it.

### F11 — Attendance Today Reachability

- Authorized ADMINISTRADOR/ENCARGADO users MUST have a normal visible entry point to the existing attendance-today route.
- The CTA MUST only appear for the actual authorized capability.
- The CTA MUST reuse the existing route.
- Direct route authorization MUST remain intact.
- HU-032 MUST NOT duplicate the attendance-today page.

### F12 — Attendance Runtime Persistence / History

- F12 MUST be treated as a BLOCKER for MVP closure.
- A successful runtime CheckIn/CheckOut cycle MUST persist and MUST be observable through the corresponding attendance history query.
- The fix MUST NOT be accepted if it merely makes the frontend appear to contain a record that is absent from canonical persistence/history.
- APPLY MUST inspect:
  - authenticated User;
  - Employee linkage;
  - Shift;
  - ShiftAssignment;
  - BusinessDate;
  - CheckIn;
  - CheckOut;
  - transaction/save behavior;
  - persistence mapping;
  - history predicates;
  - pagination;
  - timezone conversion.
- Seeded Attendance visibility MUST NOT be used as proof that runtime-created rows work.
- A real integration test MUST cover write and subsequent read.
- If schema change is proven necessary, the fix MUST pause for product decision.

### F13 — Automatic Absence

- HU-032 MUST NOT introduce automatic absence generation.
- No scheduler, cron, hosted service or synthetic absence creator may be added.
- Existing valid historical/derived absence data MAY continue to be read.
- Documentation MUST state:
  `AUTO_ABSENCE_GENERATION: NOT_IMPLEMENTED / POST_MVP`.
- Missing automatic generation MUST NOT by itself block HU-032 after documentation is accurate.

### F14 — Shift Summary

- Turnos/Caja summary MUST display useful real values.
- Values MUST come from real Shift, CashSession, Cash Preview, Sales, Expenses or other existing approved sources.
- The frontend MUST NOT hardcode summary metrics.
- A minimal read projection MAY be introduced only if required data exists conceptually but is not exposed.
- HU-032 MUST NOT create a general reporting subsystem for this requirement.

### F15 — Remove HU-026 / HU-027 User Copy

- User-facing application copy MUST NOT reference HU-026 or HU-027 as pending/upcoming implementation.
- Existing Cash Closing functionality MUST be described in product language.
- Stale documentation MUST be reconciled factually at the final documentation phase.
- Internal test/spec identifiers MAY continue using HU IDs where technically useful.

### F16 — Cash Closing History Text Filter

- `/turnos/cierres` or its real route MUST provide text filtering over records actually available to the current client result set.
- Minimum searchable visible representations:
  - date;
  - responsible;
  - declaredCash.
- Search MUST trim input.
- Text matching SHOULD be case-insensitive.
- Search MUST combine with the current period filter.
- Search MUST NOT claim to search unloaded server pages.
- No backend endpoint is required solely for this local-filter decision.
- If pagination limits the loaded rows, UI copy/design MUST remain honest about that scope.

### F17 — Supplier Icon Actions

- Supplier table actions SHOULD use the shared icon-action convention.
- View MUST use Eye.
- Edit MUST use the established edit icon.
- Deactivate MUST use an icon semantically distinct from Delete.
- Authorization MUST remain unchanged.
- All icon-only actions MUST have accessible names, tooltips where appropriate, focus-visible state and adequate touch targets.

### F18 — Supplier Detail

- Supplier View MUST open a read-only detail overlay.
- Only real Supplier contract fields may be displayed.
- Existing row/detail data MUST be reused first.
- A minimal read endpoint MAY be introduced only when existing contracts genuinely cannot supply required persisted Supplier details.
- The detail MUST NOT invent:
  - rating;
  - purchase statistics;
  - debt;
  - balance;
  - unsupported contact/address fields.

### F19 — Purchases Current-Month Default

- Purchases MUST default to the current calendar month.
- Timestamp contracts SHOULD use first day current month inclusive to first day next month exclusive.
- Clear/default behavior MUST restore the current-month range.
- Existing purchase mutations MUST remain unchanged.

### F20 — Purchase Eye Detail

- Purchase `Ver detalle` action SHOULD use the shared Eye icon.
- Existing detail behavior MUST be preserved.
- Receive/Cancel/Create actions MUST remain distinct and authorization-controlled.

### F21 — Sales History Eye

- Sales History detail action SHOULD use the shared Eye icon.
- Desktop Drawer behavior MUST remain.
- Mobile Sheet/Bottom Sheet behavior MUST remain where currently established.

### F22 — Sales History Includes Today

- The default Sales History range MUST include every valid Sale for the current business day.
- APPLY MUST audit current backend period semantics before changing frontend dates.
- DateOnly inclusive contracts MUST be handled as DateOnly inclusive.
- Timestamp upper bounds SHOULD use a correct next-boundary exclusive range.
- An off-by-one workaround MUST NOT be retained if the contract itself can be normalized without scope expansion.
- America/La_Paz semantics MUST be respected.

### F23 — Expense Eye

- Expense History MUST expose a shared Eye detail action.
- The action MUST be read-only.
- No edit/delete/reverse/approve action may be added by HU-032.

### F24 — Expense Detail

- Expense detail MUST show only persisted/contractual data.
- Expected real fields MAY include:
  - date;
  - category;
  - amount;
  - source;
  - description;
  - responsible.
- A row DTO SHOULD be reused when sufficient.
- A minimal read endpoint MAY be used only if necessary.
- The detail MUST NOT invent invoice, VAT, beneficiary, approval or attachment data.

### F25 — Remove HU-015 Copy

- User-facing application copy MUST NOT reference internal user-story IDs such as HU-015, HU-026 or HU-027 as operational instructions or pending-feature placeholders.
- A Sales Report history link SHOULD use functional language such as `Ver historial de ventas`.
- Link authorization MUST remain capability-aware.

### F26 — Full Visual Consolidation

- All applicable screens represented in the 74-reference inventory MUST be visually reconciled.
- Reconciliation MUST preserve actual business contracts.
- No screen should remain visibly isolated as a separate/unrelated design language after final propagation.
- Reconciliation MUST cover:
  - AppShell;
  - navigation;
  - dashboards;
  - catalog/inventory;
  - expenses;
  - attendance;
  - composition;
  - production;
  - checkout;
  - purchases;
  - reception;
  - customers;
  - sales;
  - cash/shift;
  - closing;
  - reports;
  - loading/empty/error states.
- High functional/visual fidelity MUST be used instead of pixel-perfect replication.

### Money

- Real Fratelli money MUST use the current Bs/BOB/es-BO convention.
- `$` values visible in references MUST NOT become product behavior.
- Existing shared money formatting SHOULD be reused.

### Payment Methods

- Only real PaymentMethod values MUST be used.
- Expected historical values CASH, QR and EXTERNAL MUST be revalidated.
- CARD/TARJETA MUST NOT be introduced from mockups alone.

### Sales Channels

- Only real SalesChannel values MUST be used.
- Expected DIRECT and PEDIDOSYA MUST be revalidated.
- SALON, DELIVERY and TAKE_AWAY MUST NOT be introduced from mockups alone.

### Responsive

- Affected pages MUST be designed for 360 px.
- Affected pages MUST be designed for approximately 768 px.
- Affected pages MUST be designed for 1280 px and wider.
- Mobile usability MUST include more than overflow prevention.
- Mobile MUST account for:
  - navigation;
  - filters;
  - action targets;
  - forms;
  - overlays;
  - tables/cards;
  - charts;
  - fixed/sticky elements.
- Desktop tables SHOULD become cards/lists on mobile where appropriate.
- Horizontal scrolling MAY be used only when semantically justified.

### Accessibility

- Page headings MUST preserve semantic hierarchy.
- Navigation MUST have accessible labels/landmarks.
- Icon-only buttons MUST have accessible names.
- Icon-only buttons MUST have visible focus.
- Touch targets SHOULD remain usable at mobile sizes.
- Modal/Drawer/Sheet implementations MUST support keyboard operation.
- Focus SHOULD move into an opened overlay and return appropriately.
- Status MUST NOT depend only on color.
- Form controls MUST have associated labels.
- Errors MUST be communicated accessibly.
- Table headers MUST remain semantic.
- Chart information MUST have textual meaning/value access where applicable.
- HU-032 MUST NOT claim formal WCAG certification unless separately performed.

### Maintainer Workflow

- FIRST APPLY MUST implement the frozen functional fixes, initial visual reconciliation, responsive work and automated regression.
- FIRST APPLY MUST NOT mark HU-032 complete.
- FIRST APPLY MUST end at the explicit marker:
  `HU_032_FIRST_APPLY_COMPLETE_PENDING_MAINTAINER_REVIEW`.
- The maintainer visual review task MUST NOT be automatically completed by Pi.
- APPLY MUST stop at that task.
- Phase B MAY include intentional manual edits by the maintainer.
- Maintainer changes MAY include icons, SVG, typography, colors, borders, spacing, radius, shadows and responsive details.
- Phase C MUST begin only after explicit maintainer resume/approval.
- Phase C MUST inspect manual diffs before editing.
- Intentional UI changes made by the maintainer after the first HU-032 APPLY MUST be preserved and MUST become the primary visual authority for the subsequent propagation pass.
- Phase C MUST propagate approved conventions where consistent.
- Phase D MUST complete the previously deferred manual Sprint 3 evidence.
- Final pre-acceptance state MUST be:
  `HU_032_READY_FOR_FINAL_ACCEPTANCE`.
- HU-032 MUST NOT be marked complete before explicit maintainer visual approval and final evidence reconciliation.
- The change MUST NOT automatically archive itself.
- The change MUST NOT automatically close Sprint 3 or the MVP.

### Evidence

- Final visual evidence MUST be factual.
- Placeholder `PASS` statements MUST NOT substitute for actual manual review.
- Final evidence MUST include representative:
  - 360 px;
  - 768 px;
  - 1280+ px;
  - ADMINISTRADOR;
  - ENCARGADO;
  - MESERO;
  - COCINA;
  - CONTADORA;
  - EMPLEADO.
- Every major capability/role path MUST receive representative evidence.
- Deferred Sprint 3 evidence MUST be reconciled at Phase D.

### Tests

- Every functional F1–F25 change MUST have a focused automated verification where feasible.
- F12 MUST have a real backend/integration test.
- F8 MUST have authoritative backend validation tests when backend validation changes.
- F3 MUST have deterministic business-date boundary tests.
- Time-based tests MUST NOT depend on uncontrolled machine UTC.
- Existing clock/business-time abstractions SHOULD be reused.
- Full frontend gates MUST run after focused tests.
- Full backend gates MUST run when backend product code changes.
- EF pending-model-change checks MUST confirm no unintended model change.
- Runtime OpenAPI/generated TypeScript consistency MUST be verified when backend contracts change.
- `git diff --check` MUST be included in final gates.

## Behavior Scenarios

### Scenario 1: Cash amount renders from real data

Given Turnos/Caja receives a real monetary field from its current contract  
When the summary renders  
Then the displayed value MUST use that field and the shared BOB formatter  
And the UI MUST NOT substitute a fabricated zero

### Scenario 2: Administrative dashboard

Given a user has ADMINISTRADOR capabilities  
When the user enters Inicio  
Then the dashboard MUST show only real authorized operational/admin/report widgets  
And MUST NOT show mockup-only fiscal, tips or unsupported KPI features

### Scenario 3: Multi-role dashboard

Given a user has two roles with different capabilities  
When Inicio is rendered  
Then available widgets MUST represent the union of those capabilities  
And a less-permissive role MUST NOT remove a capability granted by the other role

### Scenario 4: Kitchen today

Given Kitchen has an order for yesterday and an order for the current America/La_Paz business day  
When the operational Kitchen list is loaded  
Then the current-day order MUST appear  
And the yesterday order MUST NOT appear

### Scenario 5: Kitchen midnight boundary

Given an order belongs to the new business day immediately after the valid local day boundary  
When Kitchen is loaded for the new day  
Then that order MUST be eligible for the new-day list

### Scenario 6: Production current month

Given the current month contains a production made today  
When Production History opens with default filters  
Then the current-day production MUST be included

### Scenario 7: Production Eye action

Given a Production row is displayed  
When the user activates its Eye action using keyboard or pointer  
Then the same production detail MUST open  
And the control MUST have an accessible name

### Scenario 8: Production product search

Given multiple eligible Products exist  
When the user types in `Buscar producto`  
Then the candidate list MUST filter  
And typing alone MUST NOT select a Product

### Scenario 9: Production no search results

Given no Product matches the search term  
When the product list updates  
Then a factual no-match state MUST be shown

### Scenario 10: Production unit

Given a selected Production Product has unit `kg` or another real unit  
When the quantity control renders  
Then that actual unit MUST be visible adjacent/contextual to the quantity

### Scenario 11: Discrete fractional production

Given a selected Product uses a discrete Unit  
When a fractional quantity is submitted  
Then the authoritative backend validation MUST reject the request

### Scenario 12: Discrete integer production

Given a selected Product uses a discrete Unit  
When a positive integer is submitted and other business rules pass  
Then the request MAY succeed

### Scenario 13: Divisible production

Given a selected Product uses a divisible Unit  
When a valid positive decimal within supported precision is submitted  
Then the request MAY succeed subject to existing inventory rules

### Scenario 14: Inventory default product type

Given a user enters Inventory with no explicit Product-type filter  
When the page initializes  
Then the actual value equivalent to `Producto de venta` MUST be selected as default

### Scenario 15: Inventory movements today

Given movements exist yesterday and today  
When Inventory Movements opens with defaults  
Then the initial query MUST represent only the current business day

### Scenario 16: Attendance Today navigation

Given an authorized ADMINISTRADOR or ENCARGADO  
When the user visits the Attendance experience  
Then a visible route action to the existing today-attendance feature MUST be available

### Scenario 17: Attendance runtime persistence

Given an authenticated User linked to a valid Employee and valid current attendance context  
When CheckIn succeeds  
And CheckOut succeeds  
And the corresponding history endpoint is queried  
Then the newly created attendance record MUST be present  
And persisted timestamps/state MUST be coherent

### Scenario 18: Seed history is not runtime proof

Given seeded Attendance rows are visible  
When the runtime CheckIn/CheckOut integration scenario fails  
Then HU-032 MUST remain blocked despite seeded rows rendering correctly

### Scenario 19: Automatic absence deferred

Given no new automatic absence scheduler exists  
When HU-032 documentation is reconciled  
Then automatic absence generation MUST be marked POST-MVP  
And no scheduler MUST be introduced

### Scenario 20: Shift summary

Given Shift/Cash backend data provides approved summary values  
When Turnos renders  
Then the summary cards MUST display those real values  
And no fake KPI MUST appear

### Scenario 21: Stale HU copy

Given a Cash/Report page contains user-facing text with HU-026, HU-027 or HU-015  
When HU-032 copy cleanup is complete  
Then the user-visible text MUST use functional terminology instead

### Scenario 22: Closing local search

Given the currently loaded closing rows contain multiple responsible names  
When the user searches a responsible substring with surrounding whitespace  
Then the search MUST trim and match case-insensitively over loaded records

### Scenario 23: Closing pagination honesty

Given Cash Closing History is server-paginated and only one page is loaded  
When local text search is used  
Then the UI MUST NOT claim that unloaded pages were searched

### Scenario 24: Supplier Eye detail

Given a Supplier row is visible and the user is authorized  
When the Eye action is activated  
Then a read-only detail view MUST open using only actual Supplier data

### Scenario 25: Supplier deactivate icon

Given a user is authorized to deactivate a Supplier  
When icon actions render  
Then the deactivation control MUST remain semantically distinct from permanent Delete

### Scenario 26: Purchases current month

Given the current month contains Purchases today  
When Purchases opens without custom filters  
Then the complete current-month default MUST include today's valid Purchases

### Scenario 27: Purchase Eye detail

Given a Purchase row is shown  
When Eye is activated  
Then the existing Purchase detail MUST open without changing receive/cancel behavior

### Scenario 28: Sales current-day inclusion

Given a Sale occurred late during the current valid business day  
When Sales History opens with defaults  
Then that Sale MUST be included

### Scenario 29: Sales detail Eye

Given a Sale row is displayed  
When its Eye action is activated  
Then the established desktop Drawer or mobile Sheet detail MUST open

### Scenario 30: Expense detail

Given an Expense row is displayed  
When the user activates Eye  
Then a read-only Expense detail MUST display only real persisted fields

### Scenario 31: Responsive table transformation

Given a data-heavy page is rendered at 360 px  
When the desktop table cannot remain usable  
Then the page MUST use its approved mobile card/list representation without functional horizontal overflow

### Scenario 32: First apply checkpoint

Given Phase A functionality, visual pass and automated regression are complete  
When Pi reaches Maintainer Visual Review  
Then it MUST stop  
And return `HU_032_FIRST_APPLY_COMPLETE_PENDING_MAINTAINER_REVIEW`

### Scenario 33: Maintainer changes styles

Given the maintainer changes SVGs, icons, spacing or colors after Phase A  
When Phase C resumes  
Then those intentional changes MUST be preserved  
And MUST NOT be reverted solely to match the original reference

### Scenario 34: Propagate approved pattern

Given the maintainer establishes a new consistent icon/card/button convention during review  
When Phase C resumes  
Then remaining applicable screens SHOULD be updated to use the approved convention

### Scenario 35: Final evidence

Given Phase C is complete  
When Phase D runs  
Then real visual/responsive evidence MUST be captured for the required viewports and representative roles

### Scenario 36: No early MVP closure

Given all automated tests are green but final maintainer approval has not occurred  
When final verification completes  
Then HU-032 MUST remain pending final acceptance  
And Sprint 3/MVP MUST NOT be declared closed

## Edge Cases

- User has multiple roles including an operational and administrative role.
- User role order changes but effective union should remain identical.
- Dashboard widget endpoint returns 403 after role changes.
- Dashboard metric is null.
- Dashboard endpoint is temporarily unavailable while navigation cards remain usable.
- Cash amount is zero legitimately.
- Cash amount is null/legacy.
- Money has decimals and large values.
- Kitchen query at 23:59 local.
- Kitchen query immediately after midnight local.
- Browser timezone differs from America/La_Paz.
- Production occurs near month boundary.
- Current day is final day of month.
- February/variable month length.
- DateOnly vs timestamp backend.
- Product search has accents/case differences.
- Product list contains long names.
- Product unit metadata missing.
- Unit names/abbreviations differ from historical assumptions.
- Discrete quantity `1.5`.
- Discrete quantity `1`.
- Divisible quantity `0.5`.
- Zero/negative Production quantity.
- Precision greater than backend-supported decimal scale.
- Inventory movement at local midnight.
- Attendance User lacks Employee linkage.
- Employee has no valid assignment.
- CheckIn succeeds but CheckOut conflicts.
- CheckOut succeeds but history filter excludes current BusinessDate.
- Attendance history pagination places new row on first/newest page.
- Attendance write and read use differing timezone conversions.
- Legacy seeded Attendance differs structurally from runtime-created Attendance.
- Closing search query is empty/whitespace.
- Closing declared amount contains localized thousands/decimal separators.
- Closing date visible representation differs from raw ISO date.
- Supplier row lacks optional values.
- Supplier detail endpoint absent.
- Purchase current month has no rows.
- Sales created exactly at day boundary.
- Expense category null.
- Expense description long.
- Mobile icon action touch target.
- Drawer closes with Escape.
- Bottom Sheet returns focus.
- Maintainer edits shared primitive affecting many screens.
- Unrelated working-tree change exists during Phase C.
- Deferred evidence from an old HU cannot be reproduced because its screen was superseded.
- Full regression reveals unrelated pre-existing failure.

## Acceptance Criteria

- AC-01: All 74 visual references MUST be extracted, viewed and classified before final HU-032 visual completion.
- AC-02: All applicable screens MUST be visually reconciled or explicitly OMIT with rationale.
- AC-03: Cash/Shift cards MUST show real available amounts.
- AC-04: Role-specific Inicio screens MUST use supplied role dashboards as visual targets without adding unsupported features.
- AC-05: Kitchen MUST show only current-business-day orders.
- AC-06: Production History default period MUST cover the complete current month.
- AC-07: Production History MUST use an accessible Eye action for detail.
- AC-08: Production registration MUST use vertical search + filtered Product list.
- AC-09: Production quantity MUST display the actual selected unit.
- AC-10: Discrete production units MUST reject fractional quantities in the authoritative validation layer.
- AC-11: Inventory MUST default to the real equivalent of Producto de venta.
- AC-12: Inventory Movements MUST default to the current business day.
- AC-13: Authorized ADMINISTRADOR/ENCARGADO MUST have visible navigation to the existing attendance-today route.
- AC-14: Runtime CheckIn + CheckOut MUST persist and MUST appear through the corresponding history query.
- AC-15: Automatic absence generation MUST be explicitly documented as POST-MVP.
- AC-16: Shift summary cards MUST contain real useful values or approved real-data alternatives.
- AC-17: No stale user-facing HU-026/HU-027 pending copy MUST remain.
- AC-18: Cash Closing History MUST include honest text search over loaded period records.
- AC-19: Supplier actions MUST use the approved icon pattern and MUST include read-only detail.
- AC-20: Purchases MUST default to current month and MUST use the Eye detail action.
- AC-21: Sales History MUST use the Eye detail action.
- AC-22: Sales History default range MUST include all current-day valid Sales.
- AC-23: Expense History MUST provide Eye/read-only detail.
- AC-24: Sales Report MUST NOT expose HU-015 as user-facing operational copy.
- AC-25: All affected pages MUST remain usable at 360, 768 and 1280+.
- AC-26: Icon-only actions MUST be accessible.
- AC-27: Role/capability authorization and multi-role union semantics MUST remain correct.
- AC-28: Intentional maintainer UI changes after FIRST APPLY MUST be preserved.
- AC-29: Maintainer-approved patterns MUST be propagated after explicit resume.
- AC-30: Previously deferred Sprint 3 visual evidence MUST be completed before final closure.
- AC-31: Full required backend/frontend regression MUST be green or any blocker MUST be explicitly resolved before final acceptance.
- AC-32: Sprint 3/MVP MUST NOT be closed until explicit maintainer final approval.

## Out of Scope

- Fiscal invoicing.
- Biometric attendance.
- Facial recognition.
- Attendance geolocation.
- Automatic absence scheduler.
- Payroll implementation.
- Tips.
- New PaymentMethods.
- New SalesChannels.
- Table-management features not already implemented.
- Loyalty.
- Supplier rating/scoring.
- Accounting approval workflow.
- P&L.
- Cleaning checklist.
- Camera-temperature tracking.
- New notification platform.
- Native mobile application.
- Microservices rewrite.
- Backend architecture redesign.
- Database schema change without a separate explicit decision.
