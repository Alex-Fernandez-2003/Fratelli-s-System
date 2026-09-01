# Design

## Audit Philosophy

La auditoría se ejecutará como una reconstrucción basada en evidencia, no como una sesión de estabilización.

Principio:

    OBSERVE
      ↓
    REPRODUCE WHEN SAFE
      ↓
    CLASSIFY
      ↓
    DOCUMENT
      ↓
    CONTINUE AUDIT

Nunca:

    OBSERVE
      ↓
    FIX
      ↓
    CONTINUE

La ausencia de una implementación intencionalmente pendiente no constituye un defecto.

La auditoría separará cuatro dimensiones:

1. Estado de implementación.
2. Evidencia disponible.
3. Severidad de findings.
4. Prioridad de acción posterior.

## Evidence Model

Cada afirmación relevante del informe debe indicar el nivel de evidencia que la soporta:

- `STATIC_CONFIRMED`
  - confirmado mediante código/config/migration/docs.
- `AUTOMATED_GATE_CONFIRMED`
  - confirmado mediante test/build/typecheck/lint/etc.
- `RUNTIME_CONFIRMED`
  - confirmado ejecutando flujo/API en entorno seguro.
- `DOCUMENT_ONLY`
  - existe únicamente en documentación y no está revalidado.
- `PENDING_EXTERNAL`
  - requiere browser/DB/infra no disponible.

Estos valores no sustituyen la clasificación obligatoria de las HUs.

## Local Baseline

La generación del OpenSpec no sustituye el futuro audit local.

El futuro apply de este change debe comenzar registrando:

| Baseline Field | Evidence                       |
| -------------- | ------------------------------ |
| Branch         | `git branch` / branch actual   |
| HEAD           | `git rev-parse HEAD`           |
| Recent commits | `git log --oneline --decorate` |
| Working tree   | `git status`                   |
| Staged         | `git diff --cached`            |
| Unstaged       | `git diff`                     |
| Untracked      | `git status`                   |

Antes de ese paso:

- ninguna HU reciente se declara `COMPLETE`;
- ningún bugfix se declara correcto;
- ninguna migration se declara segura.

## Generator-Time Readiness

Change recomendado:

`audit-sprint-3-current-system-state`

Path recomendado:

`docs/openspec/changes/audit-sprint-3-current-system-state/`

Verdict de generación:

`SPRINT_3_CURRENT_STATE_AUDIT_OPENSPEC_READY`

Baseline real:

- Branch: `UNVERIFIED_LOCAL`.
- HEAD: `UNVERIFIED_LOCAL`.
- Working tree: `UNVERIFIED_LOCAL`.
- Staged: `UNVERIFIED_LOCAL`.
- Unstaged: `UNVERIFIED_LOCAL`.
- Untracked: `UNVERIFIED_LOCAL`.

Recent changes declarados y por localizar:

| Capability                      | Estado declarado de entrada         | Estado que debe producir audit |
| ------------------------------- | ----------------------------------- | ------------------------------ |
| HU-014 Customers                | Frontend recientemente implementado | TBD                            |
| HU-014 → ConfirmSale            | Recientemente integrado             | TBD                            |
| HU-015 Sales History/Detail/PDF | Frontend recientemente implementado | TBD                            |
| Shift Open bugfix               | Recientemente corregido             | TBD                            |
| HU-026 Cash Preview             | Frontend recientemente implementado | TBD                            |
| HU-027 Cash Close               | Frontend recientemente implementado | TBD                            |
| Demo migration                  | Recientemente creada                | TBD                            |

Product code changes planned:

`NONE`

Fixes planned:

`NONE`

## Sprint 3 Reconstruction

La auditoría debe determinar primero cuál es el conjunto formal completo de HUs de Sprint 3 desde:

1. working tree;
2. Sprint docs/Product Backlog;
3. OpenSpec;
4. HU docs;
5. Git history cuando sea útil.

No se debe construir la matriz completa únicamente a partir de los IDs mencionados en este prompt.

### Expected Known Rows

Las siguientes filas sirven como hipótesis iniciales, no resultado final:

| HU     | Estado esperado antes de audit      | Motivo                                 |
| ------ | ----------------------------------- | -------------------------------------- |
| HU-008 | BACKEND_COMPLETE_FRONTEND_PENDING   | Frontend declarado pendiente por scope |
| HU-014 | UNKNOWN_REQUIRES_RUNTIME_VALIDATION | Frontend reciente debe auditarse       |
| HU-015 | UNKNOWN_REQUIRES_RUNTIME_VALIDATION | Frontend reciente debe auditarse       |
| HU-019 | BACKEND_COMPLETE_FRONTEND_PENDING   | Frontend declarado pendiente por scope |
| HU-021 | BACKEND_COMPLETE_FRONTEND_PENDING   | Frontend declarado pendiente por scope |
| HU-023 | BACKEND_COMPLETE_FRONTEND_PENDING   | Frontend declarado pendiente por scope |
| HU-024 | BACKEND_COMPLETE_FRONTEND_PENDING   | Frontend declarado pendiente por scope |
| HU-026 | UNKNOWN_REQUIRES_RUNTIME_VALIDATION | Frontend reciente debe auditarse       |
| HU-027 | UNKNOWN_REQUIRES_RUNTIME_VALIDATION | Frontend reciente debe auditarse       |
| HU-028 | BACKEND_COMPLETE_FRONTEND_PENDING   | Frontend declarado pendiente por scope |
| HU-029 | BACKEND_COMPLETE_FRONTEND_PENDING   | Frontend declarado pendiente por scope |
| HU-030 | BACKEND_COMPLETE_FRONTEND_PENDING   | Frontend declarado pendiente por scope |
| HU-031 | BACKEND_COMPLETE_FRONTEND_PENDING   | Frontend declarado pendiente por scope |

La matriz final sustituirá estas hipótesis.

## Recent Change Boundaries

La auditoría reciente se concentra en cambios que pudieron modificar rutas, contratos o flujos core:

### Boundary A — Customer management

- Customer API integration.
- List/query state.
- Form state.
- Lifecycle actions.
- Authorization.
- Responsive rendering.

### Boundary B — ConfirmSale integration

- Existing sale flow.
- Customer optionality.
- Consumer final.
- Quick-create.
- Snapshot ownership.

### Boundary C — Sales History

- List/filter/pagination.
- Detail fetch.
- Role scope.
- Snapshot semantics.
- PDF.

### Boundary D — Shift Open

- Modal.
- Monetary inputs.
- Request DTO.
- Shift/cash query refresh.

### Boundary E — Cash Preview/Close

- Preview authority.
- Validation.
- final mutation.
- conflict handling.
- returned snapshot.

### Boundary F — Demo migration

- deterministic relational dataset.
- operational interference.
- rollback safety.

## HU Matrix Method

Para cada HU:

1. Localizar backend implementation.
2. Localizar frontend implementation.
3. Localizar tests existentes.
4. Localizar docs/evidence.
5. Localizar OpenSpec change.
6. Comparar contratos.
7. Ejecutar gates pertinentes.
8. Ejecutar runtime/manual validation si está disponible y es segura.
9. Clasificar.

### Classification Rules

#### COMPLETE

Usar cuando:

- la implementación esperada por el scope actual existe;
- los contratos están suficientemente alineados;
- no existe evidencia de defecto que invalide el flujo;
- tests/gates relevantes no contradicen el estado;
- documentación no es necesaria para funcionamiento pero se registra drift si existe.

#### BACKEND_COMPLETE_FRONTEND_PENDING

Usar cuando:

- backend está implementado;
- frontend sigue intencionalmente pendiente;
- ese estado coincide con el scope actual;
- no existe implementación frontend rota que pretenda completar la HU.

#### PARTIAL

Usar cuando:

- existe implementación real;
- faltan partes del alcance que supuestamente ya debía cubrir;
- el flujo todavía puede ser parcialmente usable.

#### BROKEN

Usar cuando:

- la implementación existe;
- evidencia estática/test/runtime demuestra comportamiento incorrecto sustancial.

#### OUT_OF_SCOPE

Usar cuando:

- la HU/capability no pertenece al scope vigente que se está auditando.

#### UNKNOWN_REQUIRES_RUNTIME_VALIDATION

Usar cuando:

- la fuente parece implementada;
- no existe suficiente evidencia para distinguir complete/broken/partial;
- la decisión depende genuinamente de runtime externo.

## Frontend Audit

### Package and configuration

Inspect:

- package manager.
- lockfile.
- scripts.
- build tooling.
- PDF dependency.
- duplicate package managers/lockfiles.
- environment URL strategy.

No package changes.

### Architecture

Inspect:

- app entry;
- route composition;
- AppShell;
- desktop navigation;
- mobile navigation;
- auth provider;
- route guards;
- query client;
- HTTP client;
- ProblemDetails;
- shared primitives;
- formatters;
- toast/feedback;
- feature boundaries.

### Accidental duplication search

Search for:

| Concern    | Detection target                             |
| ---------- | -------------------------------------------- |
| API        | second client / standalone Axios / raw fetch |
| URL        | hardcoded localhost/backend URL              |
| Auth       | manual Bearer / duplicate refresh logic      |
| Roles      | duplicate role arrays / single-role equality |
| Query      | repeated strings and colliding keys          |
| Dialog     | parallel Modal/Dialog framework              |
| Formatting | duplicate money/date formatters              |
| DTO        | handwritten backend DTO copies               |
| Routes     | duplicate path definitions                   |
| Enums      | frontend-only payment/channel/status values  |

Finding only. No consolidation.

## HU-014 Audit

### Customers route/navigation

Verify:

- one canonical route;
- correct route guard;
- desktop/mobile reachability;
- active state;
- no duplicate entry.

### List behavior

Inspect:

- server search;
- actual search params;
- status filter;
- page/pageSize;
- query key;
- page reset after filter change;
- loading/empty/error;
- desktop table;
- mobile cards.

### Permissions

Construct runtime/static matrix:

| Action     | ADMIN  | ENCARGADO | MESERO                         | Other          |
| ---------- | ------ | --------- | ------------------------------ | -------------- |
| Read       | verify | verify    | verify                         | backend policy |
| Create     | verify | verify    | verify                         | backend policy |
| Edit       | verify | verify    | verify                         | backend policy |
| Activate   | verify | verify    | MUST be absent for pure MESERO | backend policy |
| Deactivate | verify | verify    | MUST be absent for pure MESERO | backend policy |

Test multi-role separately.

### Form

Verify:

- Name required.
- CI required.
- NIT optional.
- Notes optional.
- no editable IsActive.
- create status semantics.
- no delete.
- duplicate CI.
- duplicate NIT.
- preserved values on server error.

## ConfirmSale Customer Integration

Inspect flow:

    Delivered Order
      ↓
    ConfirmSale
      ↓
    optional Customer
      ├─ existing active Customer
      ├─ quick create Customer
      └─ Consumidor final
      ↓
    Payment + Channel + Shortage Ack
      ↓
    Sale mutation

Regression checklist:

- selected order remains correct.
- Shift requirement preserved.
- ENTREGADO requirement preserved.
- PaymentMethod preserved.
- SalesChannel preserved.
- shortage acknowledgement preserved.
- customer can clear.
- quick-create cancel does not reset sale fields.
- quick-create uses returned ID.
- customerId forwarded.
- no manual Customer snapshots.

## HU-015 Audit

### List

Inspect:

- route.
- navigation.
- default date.
- filters.
- server pagination.
- responsive.
- query key.

### MESERO scope

Compare:

- UI filters;
- frontend guards;
- backend policy;
- backend server-side restriction.

Pure MESERO and multi-role must be evaluated separately.

### Snapshot audit

Trace historical data from:

    Sale persisted snapshot
      → API DTO
      → generated type
      → list/detail
      → PDF

Look for current Customer fetch.

### Detail

Confirm no fabricated commercial concepts.

Expected factual data only:

- Sale ID.
- responsible.
- shift.
- payment.
- channel.
- customer snapshot.
- items.
- unit prices.
- line totals.
- total.

### PDF

Inspect:

- dependency.
- import strategy.
- adapter/utility boundary.
- client-only execution.
- snapshot source.
- internal-receipt disclaimer.
- no fiscal behavior.
- build chunk impact.

## Shift Open Audit

Priority: very high.

Flow under audit:

    No operational day
      ↓
    "Iniciar jornada"
      ↓
    modal
      ↓
    openingAmount
    pettyCashOpeningAmount
      ↓
    POST Shift Open
      ↓
    Shift/Cash queries refresh

### Input audit

For both values:

- required.
- `0` valid.
- negative invalid.
- decimal.
- comma/dot behavior.
- empty string.
- whitespace.
- NaN protection.

Detect truthiness mistakes such as treating `0` as absent.

### Mutation audit

Check:

- body always defined.
- exact property names.
- pending.
- duplicate submit.
- 400.
- network failure.
- modal remains/recovery.
- values preserved.
- success invalidation.

## OpenAPI Nullability Mismatch

Create a four-column trace:

| Layer                | openingAmount | pettyCashOpeningAmount |
| -------------------- | ------------- | ---------------------- |
| Backend request DTO  | inspect       |
| Runtime validation   | inspect       |
| OpenAPI              | inspect       |
| Generated TypeScript | inspect       |

If generated permits null while runtime rejects it:

Finding:

- Type: `CONTRACT`.
- Label: `CONTRACT_DRIFT`.
- Severity:
  - `HIGH` when external/generated clients can legally construct a payload runtime rejects and contract source is materially wrong;
  - `MEDIUM` when current UI fully protects the flow but generator accuracy remains wrong;
  - `BLOCKER` only if the active product flow cannot successfully open the day or the mismatch causes a core build/runtime failure.

Do not correct it during audit.

## HU-026 Audit

Trace:

    Cash Preview query
      ↓
    actual endpoint
      ↓
    CashPreview DTO
      ↓
    UI mapping

Inspect:

- key.
- stale/retry.
- loading.
- 404.
- error.
- expectedCash.
- payment breakdown.
- channel breakdown.
- expenses.
- handover/carried context.

Authority test:

Search for a frontend `expectedCash` formula.

A local calculation MAY exist for presentation, but if it is treated as canonical in place of backend response, record a finding.

Payment and channel data must stay independently mapped.

## HU-027 Audit

Trace:

    CashPreview
      ↓
    declaredCash
      ↓
    provisional difference
      ↓
    conditional observation
      ↓
    confirm
      ↓
    POST Close
      ↓
    CashClosingDto
      ↓
    success state

### Validation

Audit:

- exact zero.
- positive difference.
- negative difference.
- observation trim.
- decimal handling.

### Payload

Compare actual request with generated/backend type.

Expected minimal conceptual input:

- declaredCash.
- observation.

Record any client-authoritative snapshot fields not required by the backend contract.

### Conflict

For 409:

- verify no retry.
- verify safe error.
- verify refetch/invalidation.
- verify form cannot create a second closing against stale state.

### Success

UI after success must be traced to server response.

If the server returned values differ from the provisional client state, the returned snapshot must win.

## Backend Audit

The backend audit is transversal, not a rewrite review.

Inspect:

- solution projects.
- DI registrations.
- endpoint mapping.
- policies.
- ProblemDetails.
- validation.
- generated OpenAPI configuration.
- key services for recent changes.
- migrations.
- critical tests.

Primary recent backend contracts:

- Customer.
- ConfirmSale.
- Sales History/Detail.
- Shift Open.
- Cash Preview.
- Cash Close.

No backend code change.

## Contract Audit

For every recent boundary use:

    Backend DTO / endpoint
      ↓
    OpenAPI schema
      ↓
    api.generated.ts
      ↓
    frontend call/query/mutation
      ↓
    frontend mapper/form

Record:

- missing property.
- nullability drift.
- enum drift.
- naming drift.
- path drift.
- response-shape drift.
- error/status drift.
- frontend manual type override.

Final generated-contract state:

- `SYNCED`
- `DRIFT DETECTED`
- `UNKNOWN_REQUIRES_RUNTIME_VALIDATION`

No regeneration is allowed in this change.

## Database Audit

Inventory all migrations in chronological order.

For each recent migration:

- migration identifier.
- purpose.
- schema vs data.
- snapshot impact.
- duplicate risk.
- known dependencies.

### Demo Migration Audit

Review independently:

#### Determinism

Disallow as demo anchors:

- runtime random;
- random GUID generation;
- current system date;
- current database date.

#### Up

Inspect:

- insert order.
- deterministic identities.
- FK references.
- unique constraints.
- check constraints.
- state coherence.
- no unexpected schema modifications.

#### Down

Inspect:

- target IDs.
- reverse FK order.
- no broad deletes.
- no canonical seed deletion.
- no date-range cleanup that may catch user data.

## Demo Data Coherence

Evaluate only domains actually seeded.

### Customers

- valid uniqueness.
- no fake `Consumidor final` workaround unless explicitly part of model.

### Suppliers

- referenced purchases exist coherently.

### Products/Inventory

- products referenced by production/purchases/sales exist.
- inventory values do not contradict generated movements/model authority.

### Production

- composition and consumption relationships plausible.
- no impossible unit references.

### Purchases

- status and receipt data coherent.
- received purchases relate correctly to inventory.

### Orders/Sales

- sales correspond to valid order state where required.
- payment/channel values are valid.
- customer optionality is coherent.
- sale snapshots are stable.

### Expenses

- cash source values valid.
- active shift/session relationships valid where required.

### Shifts/Cash

High-risk area:

- no demo current session unintentionally blocks `Iniciar jornada`.
- one-session-per-business-date constraints preserved.
- MORNING/NIGHT lifecycle coherent.
- preview source data coherent.
- CashClosing values coherent.

### Attendance

- shifts/assignments/records are relationally valid.

## Demo Data vs Current Operation

Specific check:

Could seeded fixed dates become "current" under existing BusinessDate logic?

Audit:

- current-day lookup.
- open shift lookup.
- active CashSession lookup.
- final CashClosing lookup.

If demo state can hijack current operation:

- document severity.
- do not delete or repair data.

## Query Audit

For each priority feature capture:

| Feature       | Query key | Filters in key | Pagination in key | Retry        | Invalidation     |
| ------------- | --------- | -------------- | ----------------- | ------------ | ---------------- |
| Customers     | inspect   | inspect        | inspect           | inspect      | mutations        |
| Sales History | inspect   | inspect        | inspect           | inspect      | N/A/read         |
| Shift Open    | mutation  | N/A            | N/A               | inspect      | Shift/Cash       |
| Cash Preview  | inspect   | N/A            | N/A               | inspect      | after open/close |
| Cash Close    | mutation  | N/A            | N/A               | MUST inspect | closing/preview  |

Rules:

- POST close should not auto-retry.
- 404 preview should not enter pathological retry loop.
- filter queries need unique keys.
- page changes should not collide.
- detail should not be eagerly N+1-loaded without need.

## Auth Matrix

The audit will build the actual matrix from backend policy + route guard + UI action visibility.

Minimum roles:

| Role          | Canonical               |
| ------------- | ----------------------- |
| ADMINISTRADOR | verify                  |
| ENCARGADO     | verify                  |
| MESERO        | verify                  |
| COCINA        | verify                  |
| CONTADORA     | verify                  |
| EMPLEADO      | verify                  |
| CAJERO        | expected absent; verify |

Multi-role test cases:

- MESERO + ENCARGADO.
- COCINA + ENCARGADO when useful.
- CONTADORA + another privileged role when current user fixtures allow.

Search pattern of concern:

- `role === '...'`
- `user.role`
- first-role-only decisions.

Not every equality is wrong; finding requires context showing union should apply.

## Routing Audit

Create route inventory:

| Route | Component | Guard | Navigation | Roles | Active-state | Status |
| ----- | --------- | ----- | ---------- | ----- | ------------ | ------ |

Priority:

- Customers.
- Sales History.
- Sale Detail if route-based.
- Shift/Cash.
- Cash Close.

Check:

- duplicate paths.
- unreachable route.
- navigation target missing.
- wrong parent match.
- hidden route intentionally accessible by deep link vs accidental absence.

## Functional Flow Review

### Auth

    Login
      → session/current user
      → roles
      → AppShell
      → route/nav capabilities

### Catalog / Inventory / Production

    Catalog
      → Inventory
      → Minimum Stock
      → Composition
      → Production
      → Inventory effects

No HU-008 frontend requirement.

### Purchase

    Supplier
      → Purchase
      → Cancel or Receipt
      → Inventory

No HU-019 frontend requirement.

### Order / Kitchen / Sale

Highest priority after Cash:

    Order
      → Kitchen
      → ENTREGADO
      → ConfirmSale
      → Customer or Consumidor final
      → Sale
      → Inventory
      → Sales History
      → Sale Detail/PDF

Review boundaries, not just individual pages.

### Shift / Cash

Highest overall operational priority:

    No jornada
      → Iniciar jornada
      → opening amounts
      → MORNING
      → handover
      → NIGHT
      → Cash Preview
      → declared cash
      → final CashClosing

### Expense

    active operation
      → Expense
      → Cash source
      → cash position / preview

No HU-021 frontend requirement.

### Attendance

Review only capabilities currently implemented.

No HU-023/HU-024 completion requirement.

## Test/Build Audit

### Frontend

Discover actual scripts first.

Expected audit gates conceptually:

- format check.
- typecheck.
- lint.
- full tests.
- build.

For each:

| Command | Exit | Tests/counts if applicable | Warning/error summary |
| ------- | ---- | -------------------------- | --------------------- |

Do not fix red gates.

### Backend

Discover actual solution.

Conceptual gates:

- restore.
- build.
- test.

Record exact solution/project commands.

### Gate interpretation

- product failure → finding.
- missing SDK/service/tool → environment limitation + affected evidence.
- warning → finding only when relevant.
- successful build with large chunk warning → not blocker by default.

## Responsive / A11y

Target recent features only.

Viewports:

- 360.
- ~768.
- > =1280.

Review:

- Customers table/cards.
- Customer form.
- ConfirmSale selector/quick-create.
- Sales History.
- Sale Detail.
- PDF action.
- Shift Open modal.
- Cash Preview/Close.

A11y checklist:

- labels.
- modal title/description.
- focus.
- close controls.
- form error association.
- keyboard reachability.
- table headers.
- icon button name.
- cash difference text/sign, not color only.

No WCAG certification.

If no browser:

`PENDING_EXTERNAL`.

## Performance / UX Regression

Static/runtime checks:

- duplicate Customer requests.
- Sale detail fetched for each row.
- query loop.
- mutation duplicate.
- large re-render hotspots obvious from architecture.
- PDF library imported eagerly into app shell/root route.
- build chunk warning.

Do not profile deeply unless the existing environment makes it trivial.

## Finding Classification

### Severity

#### BLOCKER

Only:

- app cannot start;
- core build unusable/red;
- core test failure indicating baseline cannot safely continue;
- critical auth bypass;
- data corruption;
- invalid migration that breaks baseline;
- critical runtime 500;
- core operational flow impossible.

#### HIGH

Material defect that should normally be fixed before continuing related work, but does not make the complete baseline unusable.

Examples:

- contract mismatch causing frequent valid requests to fail;
- MESERO authorization exposure beyond backend design;
- duplicate Cash Close mutation;
- Customer integration breaks ConfirmSale;
- Sales History reconstructs snapshots incorrectly.

#### MEDIUM

Real defect with bounded impact or workaround.

#### LOW

Minor defect/debt with low operational impact.

#### INFO

Observation, intended pending scope, or non-actionable architectural note.

### Primary Categories

- FUNCTIONAL
- CONTRACT
- FRONTEND
- BACKEND
- DATABASE
- AUTH
- ROUTING
- QUERY
- UX
- A11Y
- TEST
- DOCS
- PERFORMANCE

### Finding Record

Each finding should use:

    ID:
    Severity:
    Category:
    Affected HU/Flow:
    Evidence:
    Observed:
    Expected:
    Impact:
    Reproduction/inspection:
    Confidence:
    Recommended disposition:

## Recommended Action Buckets

1. `FIX_BEFORE_CONTINUING_SPRINT_3`
2. `FIX_DURING_NEXT_RELATED_CHANGE`
3. `NON_BLOCKING_TECHNICAL_DEBT`
4. `DOCUMENTATION_CLEANUP_LATER`
5. `INFORMATIONAL_NO_ACTION`

No fix is part of this audit.

## Audit Report Structure

The central output MUST be:

`system-current-state-audit.md`

or the exact convention equivalent.

Structure:

# Executive Summary

- final baseline verdict.
- blocker count.
- high/medium/low/info counts.
- whether Sprint 3 can continue safely.

# Git Baseline

- Branch.
- HEAD.
- status.
- local changes.

# Current Sprint 3 State

- reconstructed scope.
- intended pending work.

# HU Matrix

`| HU | Backend | Frontend | Tests | Docs | OpenSpec | Estado real |`

# Recent Frontend Changes

- located files/changes.
- integration summary.

# HU-014 Audit

# HU-015 Audit

# Shift Open Bugfix Audit

# HU-026 Audit

# HU-027 Audit

# General Frontend Audit

# Backend Audit

# Contract Audit

# Routing / Navigation

# Authorization

# Query / API Integration

# Database / Migrations

# Demo Data

# Functional Flow Review

# Tests / Build

# Responsive / Accessibility

# Documentation Drift

# Findings

Sorted:

1. BLOCKER.
2. HIGH.
3. MEDIUM.
4. LOW.
5. INFO.

# Recommended Next Actions

1. Fix before continuing Sprint 3.
2. Fix during next related HU.
3. Non-blocking technical debt.
4. Documentation cleanup later.

## Final Verdict Rules

### SPRINT_3_BASELINE_HEALTHY

Use when:

- no blocker;
- no material recent-feature regression;
- required gates green;
- pending HUs are normal scope;
- system can continue Sprint 3.

### SPRINT_3_BASELINE_HEALTHY_WITH_FINDINGS

Use when:

- baseline remains usable;
- findings exist;
- none makes continuing Sprint 3 unsafe.

### SPRINT_3_BASELINE_HAS_BLOCKERS

Use when at least one validated blocker prevents safe continuation.

Do not use `RELEASE_READY`.

## Continuous Audit Strategy

Future Pi audit MUST continue after individual findings.

Sequence:

    baseline
      ↓
    OpenSpec/Sprint reconstruction
      ↓
    recent frontend
      ↓
    frontend architecture
      ↓
    backend/contracts
      ↓
    DB/migrations
      ↓
    functional flows
      ↓
    quality gates
      ↓
    auth/routes/query
      ↓
    responsive/a11y
      ↓
    docs
      ↓
    findings/report

A finding means:

    record
      ↓
    continue

Not:

    record
      ↓
    ask permission
      ↓
    fix

## Components Touched

Only audit artifacts should be written.

Areas inspected read-only:

- whole repository.
- OpenSpec.
- frontend.
- backend.
- migrations.
- docs.
- tests.
- optionally safe runtime environment.

## Boundaries Respected

- Product source read-only.
- Existing tests read-only.
- Existing docs read-only.
- Existing migrations read-only.
- Generated API read-only.
- Shared/database state read-only unless explicitly isolated smoke environment.
- Git read-only.
- Audit artifacts are the only intended persisted changes.

## Contracts Changed

No external contract changes are planned.

No application contract changes are planned.

The audit may identify contract drift but MUST NOT modify it.

## Data Flow

Audit evidence flow:

    Local Git state
      +
    Product source
      +
    Generated contracts
      +
    Tests/build
      +
    Safe runtime evidence
      +
    Documentation/OpenSpec
      ↓
    Classification
      ↓
    Findings
      ↓
    HU state matrix
      ↓
    system-current-state-audit.md
      ↓
    Maintainer chooses next corrective/feature change

## Required Tests Per Layer

No new tests are created.

Existing gates only.

### Frontend

Run existing:

- format check;
- typecheck;
- lint;
- tests;
- build.

### Backend

Run existing:

- restore;
- build;
- tests.

### Runtime

Only safe non-destructive checks by default.

Mutation smoke tests only in explicitly isolated/safe environment.

## Tradeoffs Accepted

- The audit can classify some runtime-dependent behavior `UNKNOWN_REQUIRES_RUNTIME_VALIDATION` rather than fabricate certainty.
- Whole-system review is breadth-oriented outside the recent changes.
- Recent changes receive much deeper inspection.
- No bug will be fixed even if trivial.
- No docs will be corrected even when drift is obvious.
- This may temporarily leave a red gate unresolved; that is intentional because diagnosis and correction are separate changes.
- A public remote repository may be useful for context but never replaces the local working tree.

## Implementation Constraints

- No product implementation.
- No source fix.
- No test creation.
- No regeneration.
- No migration modification.
- No package updates.
- No destructive Git.
- No shared DB mutation unless an explicitly safe smoke environment is used.
- Record exact evidence.
- Distinguish environment limitation from product defect.
- Continue auditing after findings.

## Open Design Questions

No product decision is required to begin the audit.

Technical facts intentionally resolved by the audit itself:

- actual branch and HEAD;
- local working-tree state;
- exact Sprint 3 HU roster;
- exact OpenSpec states;
- exact files implementing recent changes;
- exact backend/generated contract alignment;
- exact PDF dependency;
- exact demo migration;
- exact tests/build results;
- exact runtime availability.

These are audit targets, not blockers to starting the audit.
