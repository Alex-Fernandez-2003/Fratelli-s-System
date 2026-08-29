# Spec

## Requirements

### Baseline Revalidation

- APPLY MUST ejecutarse contra el `develop` local real.
- APPLY MUST registrar branch, HEAD y working-tree status antes de cualquier modificación.
- APPLY MUST comparar el código local con los siete bugs aprobados.
- Un bug aprobado que ya no exista MUST clasificarse `ALREADY_RESOLVED_IN_BASELINE`.
- Un bug `ALREADY_RESOLVED_IN_BASELINE` MUST NOT generar una corrección redundante.
- El preflight SHOULD registrar baseline build/tests cuando el runtime disponible lo permita.
- Resultados de builds/tests no ejecutados MUST NOT documentarse como PASS.

### Compatibility

- Existing Sprint 2 routes MUST remain unchanged.
- Existing HTTP methods MUST remain unchanged.
- Existing endpoint intent MUST remain unchanged.
- Existing request fields MUST NOT be renamed or removed.
- Existing response fields MUST NOT be renamed or removed.
- Existing status codes SHOULD remain unchanged when semantically correct.
- Contract changes MUST be additive and backward-compatible unless technical impossibility is demonstrated.
- No `/api/v2` endpoint MAY be introduced.
- No parallel duplicate endpoint MAY be introduced.
- HU-004, HU-007 and HU-017 MUST NOT require broad frontend rewrites.
- The generated TypeScript contract MUST be regenerated from the final runtime OpenAPI rather than edited manually.

### Existing Inventory Authority

- Production, Sale and Purchase Reception MUST continue using the existing Inventory foundation.
- No new InventoryBalance, ledger or parallel stock service MAY be introduced.
- Existing `WriteBatchAsync` locking/transaction behavior MUST remain the authority for final inventory shortage decisions.
- The stabilization MUST NOT change the approved business distinction:
  - Production shortage blocks.
  - Sale shortage may continue after explicit acknowledgment.

### Purchase Listing DbContext Safety

- `PurchasesAsync` MUST NOT execute concurrent EF Core operations through the same scoped `ApplicationDbContext`.
- The preferred implementation SHOULD obtain the page and its related data through an EF-safe projection/bulk-query strategy.
- The implementation SHOULD avoid N+1 database access when reasonable.
- A sequential `foreach + await` implementation MAY be used only when a clean projection/bulk strategy would introduce disproportionate complexity.
- Pagination metadata MUST remain equivalent.
- Existing status filtering MUST remain equivalent.
- Existing ordering MUST remain equivalent unless the current contract explicitly specifies otherwise.
- Purchase DTO content MUST preserve lines and receipt information.
- Listing more than one Purchase MUST NOT raise DbContext concurrent-operation exceptions.

### Shared Distinct Unit Validation

- Composition and Purchase creation MAY contain multiple lines sharing the same `UnitId`.
- Validation MUST compare loaded Units against the set of DISTINCT requested UnitIds.
- Validation MUST ensure every distinct requested UnitId exists.
- Validation MUST ensure every required Unit is active according to the existing create/update rules.
- Validation MUST preserve existing dimension compatibility checks.
- Validation MUST preserve positive conversion-factor checks.
- Repeated valid UnitIds MUST NOT cause `INVALID_UNIT_CONVERSION`.
- Unknown UnitIds MUST continue to be rejected.
- Incompatible dimensions MUST continue to be rejected.
- A small reusable helper MAY be introduced if it reduces duplicated defect-prone logic.
- Such a helper MUST NOT introduce a general validation framework.

### HU-004 Composition

- The existing composition endpoint and request/response contract MUST remain stable.
- A composition MUST allow multiple distinct ingredients using the same Unit.
- Existing duplicate component rules MUST remain unchanged.
- `QuantityPerOutputUnit` MUST mean ingredient quantity required for one output unit.
- Production requirement calculation MUST remain:
  `requiredIngredientQuantity = QuantityPerOutputUnit × QuantityProduced`.
- The change MUST NOT redesign composition semantics.
- HU-004 frontend SHOULD require no manual source modification when the backend validation fix does not alter the contract.

### HU-007 Production Preservation

- ADMINISTRADOR, ENCARGADO and COCINA authorization MUST remain unchanged.
- Production MUST continue loading composition.
- Production MUST continue applying compatible Unit conversions.
- Production MUST remain atomic.
- Insufficient ingredients MUST continue to reject Production.
- Production MUST NOT leave ingredient balances negative.
- A successful Production MUST continue increasing preparation inventory.
- Actor/timestamp authority MUST remain backend-owned.
- This stabilization MUST NOT alter the approved scaling formula.
- Changes to general InventoryWriter error classification in Production MUST NOT be implemented unless separately approved.

### HU-017 Purchase Creation

- The existing Purchase create route, request and response MUST remain stable.
- Multiple PurchaseLines MAY share the same UnitId.
- Supplier validation MUST remain in force.
- Product validation MUST remain in force.
- UnitCost semantics MUST remain in force.
- Server-side total calculation MUST remain in force.
- A newly created Purchase MUST remain PENDIENTE.
- Creating a Purchase MUST NOT create InventoryMovement.
- Existing COCINA scope and receipt-reference rules MUST remain unchanged.
- HU-017 frontend SHOULD require no manual source modification when the unit fix does not alter the contract.

### Current Operational Shift

- `Current Shift` MUST mean a Shift with `ACTIVE` status inside the currently open CashSession whose `BusinessDate` equals `IBusinessClock.BusinessDate`.
- Current Shift resolution MUST NOT search all historical `ACTIVE` Shifts without business-date/session scope.
- `CurrentShiftAsync`, `MyCurrentShiftAsync`, Sale confirmation and Expense creation MUST use equivalent current-day semantics.
- The implementation SHOULD centralize this query in the smallest cohesive reusable primitive.
- The stabilization MUST NOT automatically close historical Shifts.
- The stabilization MUST NOT implement HU-026/HU-027.
- The stabilization MUST NOT introduce a second CashSession/Shift model.
- `America/La_Paz` business-date semantics MUST remain authoritative.
- A residual ACTIVE Shift from a previous business date MUST NOT be selected for a current-day Sale, Expense or MyCurrentShift query.
- If no current-day operational Shift exists, each existing workflow MUST preserve its current no-shift behavior unless a separately approved rule requires change.

### Sale Shift Association

- Sale MUST continue requiring Order `ENTREGADO`.
- Sale MUST continue resolving Shift server-side.
- Sale MUST associate the current-day ACTIVE Shift.
- Sale MUST NOT accept arbitrary client Shift selection.
- Existing Sale endpoint and request contract MUST remain unchanged.
- Existing transaction/locking semantics MUST be preserved.

### Expense Shift Association

- Expense creation MUST resolve Shift using the same current-day semantics.
- Existing Expense request MUST remain unchanged.
- Client MUST NOT gain a required `shiftId`.
- Existing nullable/no-active-shift behavior MUST be preserved unless the local baseline already defines otherwise.

### HU-013 Authoritative Shortage Result

- The backend MUST remain the authority for Sale shortages.
- The existing precheck MAY remain as a fast path.
- The final decision after inventory locks MUST be authoritative.
- When `WriteBatchAsync` detects `STOCK_INSUFFICIENT`, the shortage response MUST be derived from `InventoryBatchResult.Shortages` or an equivalent locked result.
- The service MUST NOT return a stale pre-lock shortage array for a shortage detected only after lock acquisition.
- A race where the precheck sees sufficient stock but the locked operation sees insufficient stock MUST produce a non-empty authoritative shortage list.
- The existing acknowledgment request field and endpoint MUST remain unchanged.
- Without acknowledgment, no Sale/inventory mutation MUST commit when authoritative shortage exists.
- With acknowledgment, existing allow-negative behavior MUST remain unchanged.
- Non-shortage InventoryWriter error semantics MUST NOT be changed as part of this bug unless separately approved.

### Purchase Receipt Contract

- Existing `PurchaseLineDto.unitId` MUST remain present and MUST continue representing the ordered unit.
- `PurchaseLineDto` MUST add an optional/nullable field representing the actually received unit, recommended `receivedUnitId`.
- The added field MUST be backward-compatible.
- A received line MUST expose its actual persisted receipt UnitId.
- A not-yet-received line MUST expose `receivedUnitId = null`.
- A not-yet-received line MUST expose `receivedQuantity = null`.
- Mapping MUST NOT convert absence of a receipt row into numeric zero.
- `receivedQuantity = 0` MUST NOT be used as a synonym for “not yet received”.
- Receipt requests and existing receive endpoint MUST remain unchanged.
- Existing persistence of ordered and received UnitIds MUST be reused.
- No migration SHOULD be created solely for this DTO extension.

### Receipt Unit Activity Ambiguity

- This change MUST NOT silently decide whether a unit that became inactive after Purchase creation may still be used to receive the historical Purchase.
- The issue MUST remain classified `PRODUCT_DECISION_REQUIRED` until resolved.
- No test enforcing either behavior MAY be introduced as part of the approved stabilization scope.

### Additional Finding Governance

- Newly discovered technical defects MUST be reported as `ADDITIONAL_FINDING_REQUIRES_HUMAN_REVIEW`.
- Such findings MUST include file/area, method, current behavior, expected concern, severity, affected HU and risk.
- Such findings MUST NOT be corrected within executable tasks until approved.
- A newly discovered issue MAY only be fixed without separate approval when it is a strict technical consequence required to complete one of the already approved fixes and does not alter product behavior or external contracts.

### Transactions and Concurrency

- Existing transaction boundaries for Production, Sale and Purchase Reception MUST remain intact.
- The change MUST NOT introduce another Unit of Work.
- `ApplicationDbContext` MUST continue acting as the existing EF transaction context.
- PostgreSQL/database locking MUST remain the authority for inventory/state concurrency.
- No process-local or distributed-lock architecture MAY be introduced for these bugs.
- Existing idempotency/duplicate-protection semantics MUST remain unchanged.

### Migrations

- The approved bug fixes SHOULD require no database migration.
- A migration MUST NOT be created for query refactoring, validation correction, DTO mapping or generated OpenAPI changes.
- Before creating any migration, APPLY MUST document the concrete schema deficiency requiring it.
- A destructive schema requirement MUST be classified `DESTRUCTIVE_CHANGE_REQUIRED`.

### OpenAPI Stabilization

- Runtime OpenAPI MUST be regenerated only after backend fixes and backend tests are stable.
- The runtime document MUST preserve all existing Sprint 2 routes and verbs.
- `PurchaseLineDto.receivedUnitId` MUST appear in final OpenAPI when the approved DTO extension is implemented.
- No unintended removals or renames of Sprint 2 schema properties MAY appear.
- OpenAPI MUST remain the authority for frontend generated types.

### Generated TypeScript

- `frontend/src/types/api.generated.ts` MUST be regenerated using the repository's actual canonical generation command.
- The generated file MUST NOT be manually patched.
- The generated diff MUST be reviewed.
- Expected intentional generated change SHOULD be limited principally to the additive Purchase receipt field unless local baseline differences require otherwise.
- Any unexpected generated breaking diff MUST be investigated before frontend adaptation.

### Frontend Protection

- Actual local HU-004/HU-007/HU-017 consumers MUST be audited after TypeScript generation.
- If their consumed contracts are unchanged, no manual frontend source change SHOULD be made.
- If an additive generated field causes no compile/runtime impact, existing features MUST remain untouched.
- Any unavoidable manual change MUST be minimal and directly attributable to the stabilized API contract.
- The change MUST NOT redesign frontend UX, routing, query architecture or Atomic Design.

### Documentation Synchronization

- Documentation MUST be synchronized only after backend/OpenAPI/frontend validation is complete.
- Documentation MUST NOT claim tests passed until they were executed.
- Documentation MUST NOT claim OpenAPI regenerated until runtime generation actually occurred.
- Current-state statements claiming TypeScript was never generated MUST be reconciled when factually stale.
- Historical records that correctly describe an earlier point in time SHOULD remain historical rather than be rewritten.
- Sprint 1 retrospective content MUST NOT be used as functional evidence when its meeting status is uncertain.
- No retrospective conclusions MAY be fabricated.

## Behavior Scenarios

### Scenario 1: Composition lines reuse one Unit

Given three valid composition lines using the same active gram UnitId  
When the existing composition replacement endpoint processes the request  
Then the backend MUST accept the shared UnitId  
And MUST validate that the distinct requested UnitId exists  
And MUST preserve the existing composition response contract

### Scenario 2: Composition contains unknown Unit

Given a composition request where one distinct UnitId does not exist  
When composition replacement is executed  
Then the backend MUST reject the request with the existing controlled validation semantics  
And MUST NOT persist a partial composition

### Scenario 3: Composition contains incompatible Unit dimension

Given an ingredient whose inventory unit is MASS  
When its composition line uses a VOLUME Unit  
Then the backend MUST reject the request  
And MUST preserve the previous composition

### Scenario 4: QuantityPerOutputUnit remains stable

Given a composition line with QuantityPerOutputUnit = 150 g  
When Production quantity is 4 output units  
Then Production requirements MUST calculate 600 g before canonical unit conversion

### Scenario 5: Purchase lines reuse one Unit

Given three valid PurchaseLines using the same kg UnitId  
When the current Purchase create endpoint is called  
Then the Purchase MUST be accepted  
And all three lines MUST be persisted  
And the server total MUST include all three lines  
And no InventoryMovement MUST be created

### Scenario 6: Purchase list contains several purchases

Given more than one Purchase exists on the requested page  
When the current purchases list endpoint is queried  
Then the backend MUST return the page without concurrent-operation exceptions from `ApplicationDbContext`  
And pagination metadata MUST remain correct  
And each Purchase MUST preserve its lines and receipt data

### Scenario 7: Purchase page includes received and pending purchases

Given one received Purchase and one pending Purchase exist on a page  
When the list is retrieved  
Then the received Purchase MUST expose actual receipt data  
And the pending Purchase MUST expose `receivedQuantity = null`  
And neither DTO MUST require concurrent DbContext operations to materialize

### Scenario 8: Historical ACTIVE Shift coexists with today's ACTIVE Shift

Given Day 1 has a residual NIGHT Shift with ACTIVE status  
And Day 2 has an open CashSession for the current BusinessDate with MORNING ACTIVE  
When current operational Shift is resolved  
Then Day 2 MORNING MUST be selected  
And Day 1 NIGHT MUST be ignored

### Scenario 9: Sale uses current business-day Shift

Given the cross-day state from Scenario 8  
And an ENTREGADO Order is confirmed as Sale  
When Sale resolves its Shift  
Then the persisted Sale MUST reference Day 2's ACTIVE Shift

### Scenario 10: Expense uses current business-day Shift

Given the cross-day state from Scenario 8  
When a valid Expense is created  
Then any Shift association made by Expense MUST reference Day 2's ACTIVE Shift  
And MUST NOT select Day 1's residual Shift

### Scenario 11: MyCurrentShift uses current business day

Given an Employee is assigned to Day 2 MORNING  
And a historical ACTIVE Shift also exists  
When the authenticated employee requests MyCurrentShift  
Then the returned Shift MUST belong to the current BusinessDate's open CashSession

### Scenario 12: Sale shortage appears only after lock

Given the Sale precheck initially observes sufficient stock  
And another transaction consumes stock before `WriteBatchAsync` acquires its balance locks  
When `WriteBatchAsync` detects the definitive shortage  
Then Sale MUST return `SALE_STOCK_CONFIRMATION_REQUIRED` using the locked authoritative shortage result  
And the shortages collection MUST identify the actual shortage  
And MUST NOT be empty solely because the precheck was stale

### Scenario 13: Ordered and received Units differ

Given a Purchase line ordered as 10 kg  
When the Purchase is definitively received as 9850 g  
Then the line response MUST retain ordered quantity 10  
And MUST retain ordered `unitId` for kg  
And MUST expose `receivedQuantity = 9850`  
And MUST expose `receivedUnitId` for g

### Scenario 14: Purchase has no receipt yet

Given a PENDIENTE Purchase has no receipt row  
When Purchase detail or list is mapped  
Then `receivedQuantity` MUST be null  
And `receivedUnitId` MUST be null  
And neither value MUST be synthesized as zero

### Scenario 15: OpenAPI generation happens after stabilization

Given backend fixes and backend tests have completed successfully  
When runtime OpenAPI is generated  
Then all pre-existing Sprint 2 routes and methods MUST still be present  
And the additive received-unit field MUST be represented  
And generated TypeScript MUST subsequently be produced from that document

### Scenario 16: New unrelated bug is discovered

Given APPLY discovers a defect not required to implement an approved fix  
When the defect is analyzed  
Then it MUST be recorded as `ADDITIONAL_FINDING_REQUIRES_HUMAN_REVIEW`  
And no implementation task MUST silently fix it

## Edge Cases

- Zero Purchase rows.
- One Purchase row.
- Page with maximum configured size.
- Last Purchase page partially filled.
- Status filter returning no rows.
- Purchase with many lines sharing one UnitId.
- Composition with all lines sharing one UnitId.
- Composition with two valid Units of the same dimension.
- Composition with missing UnitId among otherwise valid lines.
- Purchase with missing UnitId among otherwise valid lines.
- Unit with invalid/zero conversion factor where current validation already rejects it.
- Production after a composition using repeated UnitIds.
- `QuantityProduced` with decimals supported by existing contract.
- Historical residual ACTIVE Shifts from more than one old CashSession.
- No current CashSession.
- Current CashSession exists but no ACTIVE Shift.
- Expense creation with no current Shift under existing nullable behavior.
- Sale confirmation during a handover race; existing locking semantics must remain authoritative.
- Precheck sufficient but locked inventory insufficient.
- Precheck insufficient and locked inventory still insufficient.
- Acknowledgment=true with changed shortage values.
- Purchase PENDIENTE with no PurchaseReceipt.
- Purchase RECIBIDA where ordered and received UnitId are equal.
- Purchase RECIBIDA where UnitIds differ but dimensions are compatible.
- Existing generated frontend code that ignores the new nullable receivedUnitId.
- Local baseline where one of the seven fixes already landed.
- Unexpected migration appearing in diff.
- Unexpected route/schema rename in runtime OpenAPI.

## Acceptance Criteria

- Local baseline MUST record actual branch, HEAD and working tree before implementation.
- Every approved finding MUST be classified PRESENT or `ALREADY_RESOLVED_IN_BASELINE`.
- No `ALREADY_RESOLVED_IN_BASELINE` issue MUST receive a redundant code change.
- A multi-Purchase paginated query MUST complete without the EF Core “second operation” exception.
- Purchase list regression MUST cover multiple lines and receipt data.
- Composition MUST accept at least two distinct components sharing one valid UnitId.
- Purchase create MUST accept at least two distinct lines sharing one valid UnitId.
- Missing distinct UnitIds MUST still be rejected.
- Incompatible dimensions MUST still be rejected.
- A regression MUST prove `QuantityPerOutputUnit × QuantityProduced`.
- Production insufficient-stock and atomicity tests MUST remain green.
- Cross-day Shift tests MUST prove Sale, Expense and MyCurrentShift select the current business-day Shift.
- HU-013 race regression MUST prove authoritative non-empty shortage output when insufficiency appears only after lock.
- PENDIENTE Purchase MUST serialize `receivedQuantity = null`.
- PENDIENTE Purchase MUST serialize `receivedUnitId = null` after the DTO extension.
- RECIBIDA Purchase with differing receipt unit MUST expose both ordered and received UnitIds.
- Existing Sprint 2 endpoint routes MUST have zero unintended changes.
- Existing Sprint 2 HTTP verbs MUST have zero unintended changes.
- No database migration MUST be introduced unless its necessity is documented before implementation.
- Runtime OpenAPI MUST be generated after backend gates.
- Generated TypeScript MUST derive from that runtime OpenAPI.
- HU-004/HU-007/HU-017 manual frontend diff MUST be zero unless an unavoidable compatibility adaptation is documented.
- Backend build and discovered backend tests MUST have failed=0.
- Frontend format/typecheck/lint/tests/build using real scripts MUST have failed=0.
- Documentation MUST contain only evidence produced during APPLY.
- Additional unapproved findings MUST remain unimplemented.

## Out of Scope

- New Sprint 2 functionality.
- New HUs.
- HU-008, HU-014, HU-019, HU-021, HU-026, HU-027.
- API redesign/versioning.
- Frontend feature redesign.
- Inventory architecture replacement.
- Production error remapping unless separately approved.
- Decision on historical inactive receipt Unit behavior.
- Receipt upload/OCR.
- Fiscal/customer/discount work.
- Cash closing.
- New migrations without demonstrated need.
- Git operations.
- VERIFY.
- ARCHIVE.
