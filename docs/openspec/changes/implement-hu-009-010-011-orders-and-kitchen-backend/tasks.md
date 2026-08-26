# Tasks

## [x] Task 1: Audit current develop and settle the execution baseline

- Objective:
  Establish the exact read-only repository state before implementation and resolve the conditional Product/Shift paths.
- Files or areas likely involved:
  Entire backend solution, current migrations/snapshot, Product, Employee, UserSession, policies, SignalR, tests, relevant HU/docs.
- Execution notes:
  Record HEAD, status, project structure and migration list. Confirm whether Product has IsSellable and whether Shift exists with a real active-shift resolver. Do not infer from stale web/cache views. Do not mutate Git.
- Verification method:
  Produce an internal preflight record containing commit, migration list, actual entities, policies, test infrastructure and chosen Shift/Product compatibility branch.
- Dependencies:
  None.

## [x] Task 2: Materialize Domain and persistence for Orders/Kitchen

- Objective:
  Create the four required entities, exact states, EF mappings, constraints and indexes, plus the minimum Product compatibility change if necessary.
- Files or areas likely involved:
  Domain Orders/Kitchen, Product if required, ApplicationDbContext/mappings, migration/snapshot.
- Execution notes:
  Implement Order, OrderItem, KitchenCommand, KitchenCommandItem. Use exact state enums. Use snake_case for new tables. Quantity numeric(14,4). Enforce unique product line and unique command/order. Apply Shift nullable strategy when applicable. Do not modify old migrations.
- Verification method:
  Domain/model tests, migration generation inspection, apply against disposable PostgreSQL from current baseline and clean DB, inspect constraints/indexes.
- Dependencies:
  Task 1.

## [x] Task 3: Implement Order creation and read contracts

- Objective:
  Deliver Create/List/Detail with server-side pricing, autoassignment and KITCHEN command generation.
- Files or areas likely involved:
  Application Orders contracts/services, Infrastructure queries, Api Order endpoints.
- Execution notes:
  Validate unique Product IDs, active/sellable/price/preparation-area rules. Query Product data in bounded form. Persist price snapshots. Autoassign MESERO creator. KITCHEN → PENDIENTE+Command; no-KITCHEN → LISTO. No inventory movement. No customer/sale.
- Verification method:
  Execute complete Create test matrix, list/detail tests, pagination, search, response totals, rollback/no-partial-persistence tests.
- Dependencies:
  Task 2.

## [x] Task 4: Implement assignment, take and delivery

- Objective:
  Deliver the complete waiter responsibility model with backend ownership enforcement.
- Files or areas likely involved:
  Order Application service, lock-aware Infrastructure persistence, Order API policies/endpoints.
- Execution notes:
  Use `PUT /orders/{id}/assignment` ADMIN-only. Use `POST /orders/{id}/take` for MESERO. Validate waiter eligibility. Lock Order for assignment/take. Allow admin reassign only nonterminal. MESERO deliver own LISTO; Manager/Admin global. Preserve role union.
- Verification method:
  Assignment matrix, ownership matrix, terminal conflicts, repeated idempotent operations, concurrent waiter take with exactly one winner.
- Dependencies:
  Task 3.

## [x] Task 5: Implement Kitchen generation/read/state synchronization

- Objective:
  Complete HU-010 REST state machine and atomic Order synchronization.
- Files or areas likely involved:
  Kitchen Application services/contracts, persistence locks/queries, API endpoints/policies.
- Execution notes:
  List/detail read roles COCINA/MESERO/ENCARGADO/ADMIN. Start/ready roles COCINA/ENCARGADO/ADMIN. Always lock Order before Command. Remove any temptation to create Order start/ready endpoints.
- Verification method:
  Kitchen read/mutation matrix, state-machine tests, mixed-order content tests, financial-field exclusion, idempotent start/ready.
- Dependencies:
  Tasks 2, 3.

## [x] Task 6: Implement cancellation and concurrent consistency

- Objective:
  Complete HU-011 from both Order and Kitchen entry points without divergent state.
- Files or areas likely involved:
  Order/Kitchen Application commands, Infrastructure row locking, API cancel endpoints.
- Execution notes:
  Both cancellation paths share consistent internal transition logic. Lock Order then Command. Preserve first cancellation actor/reason/timestamp on retries. Reject after ready. MESERO ownership enforced only on Order cancellation. COCINA cancels through Command.
- Verification method:
  Cancellation matrix plus PostgreSQL races: ready vs cancel, start vs cancel, duplicate cancel and no impossible persisted pair.
- Dependencies:
  Tasks 4, 5.

## [x] Task 7: Implement Kitchen SignalR post-commit notification

- Objective:
  Deliver `/hubs/kitchen`, its authorization and the three stable event contracts without making realtime the source of truth.
- Files or areas likely involved:
  Application notifier abstraction, Api/Infrastructure notifier implementation, KitchenHub, policies.
- Execution notes:
  Events: KitchenCommandCreated, KitchenCommandUpdated, KitchenCommandCancelled. Payload commandId/orderId/status/occurredAt only. Publish after commit. Catch/log post-commit publisher failure. No hub mutations. No outbox.
- Verification method:
  Notifier tests for create/start/ready/cancel, zero events on rollback/idempotent no-op, payload review, hub 401/403/allowed-role tests.
- Dependencies:
  Tasks 3, 5, 6.

## [x] Task 8: Harden REST contracts, ProblemDetails and OpenAPI

- Objective:
  Make all backend contracts explicit and consumable by the future frontend change.
- Files or areas likely involved:
  Api endpoint mappings, DTO metadata, ProblemDetails helpers.
- Execution notes:
  Verify methods/routes exactly match the spec. Describe 201/200/400/401/403/404/409. Keep Kitchen DTO financial-free. Do not regenerate TypeScript.
- Verification method:
  Run backend in Development, inspect Swagger and `/openapi/v1.json`, compare every endpoint/request/response/status with spec.
- Dependencies:
  Tasks 3, 4, 5, 6, 7.

## [x] Task 9: Complete PostgreSQL integration and concurrency test coverage

- Objective:
  Prove transaction, locking and DB constraints using the real database semantics.
- Files or areas likely involved:
  IntegrationTests and existing PostgreSQL fixtures.
- Execution notes:
  Reuse current test infrastructure. Do not use EF InMemory/SQLite for locking evidence. Create isolated test data instead of Development order seeds. Cover representative races rather than a Cartesian explosion.
- Verification method:
  All required create/assignment/kitchen/cancel/concurrency tests pass repeatedly with failed=0 and no flaky impossible-state outcomes.
- Dependencies:
  Tasks 2, 3, 4, 5, 6, 7.

## [x] Task 10: Run full backend regression and security audit

- Objective:
  Ensure EPI-04 did not regress auth, users, catalog, suppliers, attendance or other integrated backend capabilities.
- Files or areas likely involved:
  Entire backend solution/tests.
- Execution notes:
  Diagnose normal compilation/EF/Npgsql/DI/test failures and continue until settled. Review policies, actor/Employee separation, pricing authority, ownership, logging and Kitchen payloads.
- Verification method:
  Restore/build pass; all discovered backend test projects pass with failed=0; security checklist completed; migration from baseline and clean DB passes.
- Dependencies:
  Tasks 8, 9.

## [x] Task 11: Document HU-009, HU-010 and HU-011 as backend-complete

- Objective:
  Produce truthful backend documentation suitable for the next frontend change.
- Files or areas likely involved:
  `docs/historias/` and relevant change documentation.
- Execution notes:
  Create/update the three real HU documents according to repository convention. Document endpoints, roles, state machines, transactions, SignalR, tests and known Shift/Product compatibility decisions. Mark Frontend PENDING. Do not claim end-to-end Done.
- Verification method:
  Cross-check every documented endpoint/status/event against OpenAPI/implementation and tests.
- Dependencies:
  Task 10.

## [x] Task 12: Produce the complete modified-file inventory and backend handoff

- Objective:
  Close the change operationally with one accurate report and enough information for the future frontend implementation.
- Files or areas likely involved:
  OpenSpec/tasks/HU documentation.
- Execution notes:
  Build file inventory from the real final diff. Group Domain, Application, Infrastructure, Api, Migrations, Tests, Docs/OpenSpec/config/transversal. State explicitly that frontend and visual evidence are pending. Include final backend endpoint matrix and SignalR contract.
- Verification method:
  Every versioned changed/created file appears once with purpose; no bin/obj/untracked generated artifacts; final report agrees with test/build results.
- Dependencies:
  Task 11.

## [x] Task 13: Settle Definition of Done honestly

- Objective:
  Determine whether the single backend change is complete without conflating it with full-stack story completion.
- Files or areas likely involved:
  Entire change.
- Execution notes:
  Review every acceptance criterion. Normal technical failures must be diagnosed/fixed/retested rather than converted into human blockers. Stop only for the approved blocker taxonomy.
- Verification method:
  All backend DoD items are PASS or the change remains incomplete. Final statuses:
  - HU-009 `BACKEND COMPLETE / FRONTEND PENDING`
  - HU-010 `BACKEND COMPLETE / FRONTEND PENDING`
  - HU-011 `BACKEND COMPLETE / FRONTEND PENDING`
- Dependencies:
  Task 12.

## Implementation Handoff

The future implementation session MUST follow this operating model:

- begin with Task 1 read-only audit;
- preserve all frozen human decisions;
- adapt filenames/classes to actual develop instead of redesigning the product;
- work continuously through Domain → persistence → REST → concurrency → SignalR → tests → regression → docs;
- use bounded diagnose/fix/retest loops for ordinary failures;
- do not stop for compiler, EF, Npgsql, migration, DI, SignalR or test defects that can be fixed locally;
- do not perform Git mutations unless a later explicit instruction changes that operational restriction;
- produce one final backend report rather than interrupting for microdecisions.

Only stop for:

- PRODUCT_DECISION_REQUIRED
- SDD_CONTRADICTION
- SECURITY_CONFLICT
- DESTRUCTIVE_CHANGE_REQUIRED
- UNRECOVERABLE_RUNTIME_BLOCKER

## Review Workload Forecast

- Estimated LoC changed:
  Approximately 3,500–6,000 manual LoC across domain entities, application services/contracts, EF mappings/migration, API endpoints/policies, SignalR, PostgreSQL integration tests and documentation. The generated EF migration/snapshot may increase the raw diff materially.
- Risk of exceeding 400 LoC review threshold:
  Very High.
- Recommendation:
  Chained PRs
- Suggested split if chained:
  - PR 1: Domain + EF mappings + Product compatibility + migration.
  - PR 2: Order create/list/detail + tests.
  - PR 3: assignment/take/deliver + concurrency tests.
  - PR 4: Kitchen read/start/ready + synchronization tests.
  - PR 5: cancellation + race tests.
  - PR 6: Kitchen SignalR + realtime tests.
  - PR 7: OpenAPI/polish + full regression.
  - PR 8: HU/backend documentation and final closure.

  These are review slices only. They MUST all belong to the single OpenSpec change `implement-hu-009-010-011-orders-and-kitchen-backend`; they are not separate SDD changes.
