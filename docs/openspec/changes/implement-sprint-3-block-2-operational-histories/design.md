# Design

## Baseline Audit

### Local baseline

Status:

`UNVERIFIED_LOCAL`

Before APPLY:

- inspect branch;
- inspect HEAD;
- inspect working tree;
- inspect active/archived OpenSpec;
- compare local generated TypeScript with current backend;
- revalidate the archived system-state audit;
- confirm tests/scripts;
- inspect the supplied visual files locally.

No public repository evidence may override newer local changes.

### Verified secondary baseline

The public `develop` branch currently shows:

- canonical OpenSpec root: `docs/openspec/`; citeturn964612view0
- backend archive: `archive/2026-08-31-implement-sprint-3-complete-backend`; citeturn711608view0turn263702view2
- HU-008 backend complete/frontend pending; citeturn711608view1
- HU-019 backend complete/frontend pending; citeturn263702view0
- HU-021 backend complete/frontend pending. citeturn263702view1

The old docs record historical test counts and HEAD values, but these MUST NOT be reused as current evidence during APPLY.

## Current Frontend Architecture

Secondary repository evidence indicates:

- React + TypeScript + Vite.
- TanStack Query.
- generated TypeScript from runtime OpenAPI.
- shared authenticated AppShell/navigation.
- central AppRoutes.
- role-aware navigation.
- Atomic/shared UI primitives.
- pnpm canonical frontend package manager.
- existing `api:generate`, format, typecheck, lint, tests and build scripts. citeturn423800view0turn423800view1

Current public routing evidence shows:

- Production currently exposes `/produccion/registrar`, not the new History landing. citeturn489997view0
- Purchases already exposes `/compras` and mutation routes. citeturn489997view1
- Expenses currently exposes `/gastos` as registration. citeturn489997view2

The public navigation implementation already supports role-aware target functions and union-like role checking, so dynamic Gastos target behavior should extend that pattern rather than create a new navigation system. citeturn346059view7

## Existing Production Feature

The current public Production feature is registration-focused:

- API support for selecting products/requirements/registering production;
- HU-007 Register page;
- no frontend History query integrated yet. citeturn346059view0turn346059view1

The existing registration page must be treated as a regression boundary, not redesigned.

After a successful registration, only a secondary `Ver historial` action should be added.

## Existing Purchase Feature

The existing Purchases module currently:

- uses the Sprint 2 compatibility list for the operational page;
- loads suppliers for display;
- contains Create/Cancel/Receive flows;
- invalidates the `purchases` query namespace after mutations. citeturn718410view1turn718410view4

The backend Sprint 3 contract already exposes:

- `GET /api/v1/purchases/history`;
- `GET /api/v1/purchases/history/{id}`;
- derived PurchaseArea;
- receipt/cancellation detail. citeturn263702view0

HU-019 should move the page's read model to the richer History representation while preserving operational mutation code.

## Existing Expense Feature

The current public Expenses feature is HU-020 registration-focused and already has a success state. It does not yet expose Expense History. citeturn718410view2turn718410view5

The history backend already returns a paginated result and full-filter aggregates. citeturn263702view1

Implementation should add:

- history query;
- route;
- internal navigation/tabs;
- role-aware global navigation;
- three server metrics;
- responsive history presentation.

HU-020 form business logic remains unchanged.

## Backend Contracts

### HU-008 Existing Contract

Current public contract:

`GET /api/v1/productions`

Parameters:

- page.
- pageSize.
- productId.
- batchCode.
- status.
- responsible.
- from.
- to.

Response:

`PagedResponse<ProductionHistoryDto>`.

Detail:

`GET /api/v1/productions/{id}`

→ `ProductionDetailDto`.

`ProductionDetailDto` contains historical consumption rows and the HU documentation explicitly states the backend does not rebuild them from current composition. citeturn711608view1turn937788view0

Generated fields currently include conceptual equivalents of:

- id.
- batchCode.
- status.
- productId/productName.
- quantityProduced.
- unit.
- producedAt.
- responsibleName.
- notes.
- consumptions for detail. citeturn380764view4turn937788view3

### HU-019 Existing Contract

Current public History contract:

- page.
- pageSize.
- status.
- supplierId.
- purchaseArea.
- responsible.
- from.
- to.

The frontend approved design intentionally exposes only:

- date range.
- supplier.
- status.
- area.

Responsible remains a valid backend capability but is omitted from the UI by frozen product decision. citeturn263702view0turn937788view1

### HU-021 Existing Contract

Current public contract:

`GET /api/v1/expenses`

Parameters:

- page.
- pageSize.
- from.
- to.
- categoryId.
- cashSource.
- responsible.
- shiftId.
- shiftType.

Response includes:

- paginated items;
- totalAmount;
- cashDrawerTotal;
- pettyCashTotal.

Those three totals already apply to the full filtered dataset. citeturn263702view1turn937788view2

Current generated Expense items allow nullable category and shift context. Current ShiftType is MORNING/NIGHT; `TARDE` is not contractual. citeturn313205view3turn313205view4

D12 includes CONTADORA in the existing `ExpenseCategoryRead` policy solely to load the existing category-options source for HU-021. This does not change the DTO/schema or grant category-management mutations or Expense Register access.

## Production Summary New Contract

### Recommended route

`GET /api/v1/productions/summary`

Reason:

- colocated with the existing production history resource;
- reads the same logical dataset;
- can reuse the `ProductionHistory` authorization;
- static `/summary` route is clearer than creating an unrelated `/reports` endpoint;
- HU-008 summary is not a reporting capability.

Final path must be reconciled with local `OperationsEndpoints`.

### Request

No pagination.

Recommended filter parity:

- `productId?`
- `batchCode?`
- `status?`
- `responsible?`
- `from?`
- `to?`

Frontend normally sends:

- productId.
- batchCode.
- responsible.
- from.
- to.

`status` remains omitted while `COMPLETED` is the only real status.

### Minimal response semantics

Conceptual, names subject to local naming conventions:

- productionCount: integer.
- latestProduction: nullable compact Production reference.
- mostProducedPreparation: nullable compact preparation-frequency reference.

Latest minimum information:

- productionId.
- batchCode.
- productId.
- productName.
- producedAt.

Most-produced minimum information:

- productId.
- productName.
- productionCount.

No physical-total field.

### Empty response

Conceptually:

- productionCount = 0.
- latestProduction = null.
- mostProducedPreparation = null.

### Tie-break

Stable ordering for most frequent:

1. event count descending;
2. `MAX(ProducedAt)` descending;
3. Product ID ascending or another stable identifier consistent with current DB/provider conventions.

The third criterion guarantees deterministic output even when frequency and last-produced timestamps tie.

## Backend Query Design

The critical requirement is filter parity.

Preferred design:

- preserve the existing Production query/service boundary;
- extract/reuse a small internal query composition/predicate path only if the current service supports this cleanly;
- apply authorization before access as current endpoint policy does;
- apply productId/batchCode/status/responsible/from/to consistently;
- execute independent database-side aggregate projections:
  - COUNT;
  - latest;
  - group/count/order/take-one.

Do not introduce:

- summary persistence;
- cache table;
- domain entity;
- generic analytics service.

No migration.

## OpenAPI Regeneration Sequence

Future APPLY sequence:

1. Add backend contract.
2. Write/fail focused tests.
3. Implement backend query/endpoint.
4. Pass focused backend tests.
5. Run full backend build/tests.
6. Start real backend runtime.
7. Inspect runtime OpenAPI.
8. Confirm Summary path/schema.
9. Run the actual frontend `api:generate` script.
10. Review generated diff.
11. Build frontend queries/pages against generated types.

The public package currently exposes `api:generate`; local package.json remains authoritative. citeturn423800view1

Manual edits to `api.generated.ts` are prohibited.

## Routes

### Production

- `/produccion` → History.
- `/produccion/registrar` → existing Register Production.

`Producción` global navigation → `/produccion`.

### Purchases

- `/compras` → unified operational/history page.
- existing create/receive routes preserved according to local routing.
- no `/compras/historial`.

### Expenses

- `/gastos` → Register.
- `/gastos/historial` → History.

Internal tab/navigation:

ADMIN/ENC:

- Registrar gasto.
- Historial.

CONTADORA:

- Historial only.

## Navigation

### Production

Visible to:

- ADMIN.
- ENC.
- COCINA.
- CONTADORA.

Target:

`/produccion`.

Register CTA is feature/action visibility, not another global nav entry.

### Purchases

Visible to all Purchase History readers.

Target remains:

`/compras`.

### Expenses

One global `Gastos` item.

Target function:

- if effective capabilities include Expense write → `/gastos`;
- else if effective capabilities include Expense History → `/gastos/historial`;
- otherwise item invisible.

The existing navigation system already uses role-aware target resolution patterns; extend that mechanism minimally. citeturn346059view7

## Authorization Matrix

| Capability          |           ADMIN |             ENC |          MESERO |          COCINA |       CONTADORA |        EMPLEADO | Scope                     |
| ------------------- | --------------: | --------------: | --------------: | --------------: | --------------: | --------------: | ------------------------- |
| Production History  |             YES |             YES |              NO |             YES |             YES |              NO | General read              |
| Production Summary  |             YES |             YES |              NO |             YES |             YES |              NO | Same as History           |
| Production Register |             YES |             YES |              NO |             YES |              NO |              NO | Preserve current          |
| Purchase History    |             YES |             YES |              NO |           YES\* |             YES |              NO | `*` pure COCINA = KITCHEN |
| Purchase mutations  | preserve actual | preserve actual | preserve actual | preserve actual | preserve actual | preserve actual | No scope expansion        |
| Expense History     |             YES |             YES |              NO |              NO |             YES |              NO | Read-only for CONTADORA   |
| Expense Category options |          YES |             YES |              NO |              NO |             YES |              NO | Existing `ExpenseCategoryRead`; HU-021 options only |
| Expense Category mutations |        YES |             YES |              NO |              NO |              NO |              NO | Preserve existing ADMIN/ENC-only policy |
| Expense Register    |             YES |             YES |              NO |              NO |              NO |              NO | Preserve HU-020           |

The backend defines ProductionHistory and PurchaseHistory for ADMIN/ENC/COCINA/CONTADORA and ExpenseHistory for ADMIN/ENC/CONTADORA. D12 additionally includes CONTADORA in the existing `ExpenseCategoryRead` policy only for HU-021 category options; it adds no endpoint, DTO, schema, migration or other backend behavior. The implementation and authorization coverage are already present in `Program.cs` and `ExpenseCategoryAuthorizationPostgresIntegrationTests.cs`, with focused isolated output `1/1` passed.

Multi-role is union:

- CONTADORA + ENCARGADO → write capability from ENCARGADO.
- COCINA + ENCARGADO → broader Purchase access if backend scope implementation grants it.
- MESERO + CONTADORA → read capabilities from CONTADORA.

## HU-008 UI / Data Flow

Flow:

- `/produccion`.
- Compute current-month default.
- History query with page + approved filters.
- Summary query with same non-pagination filters.
- Render three cards.
- Render desktop table/mobile cards.
- Select row.
- Fetch detail on demand.
- Render metadata + `Consumo registrado`.

### Summary query independence

History:

- includes page/pageSize.

Summary:

- excludes page/pageSize.

All other applicable filters are equivalent.

### Preparation filter

Reuse HU-007's PREPARATION catalog query if:

- caller is authorized;
- it supplies suitable IDs/names;
- active-only behavior does not make the history misleading.

If inactive preparations cannot appear as filter options:

- history rows still render historical names from their DTO;
- record the limitation;
- do not create an extra endpoint.

### Responsible filter

Current backend uses a string-style responsible filter in the public contract. Apply must inspect exact local semantics.

Preferred UI if no safe entity options endpoint exists:

- labeled text input compatible with backend semantics.

Do not access User Management solely for a history filter.

### List

Desktop:

- fecha/hora;
- BatchCode;
- preparación;
- cantidad;
- unidad;
- responsable;
- Ver detalle.

Mobile card:

- preparación.
- BatchCode.
- fecha/hora.
- cantidad + unidad.
- responsable.
- detail action.

Status may appear in Detail as `Completado`; it does not justify a filter while only one status exists.

### Detail

Desktop:

- reuse Drawer if already stable;
- otherwise reuse recent HU-015 responsive Modal/detail precedent.

Mobile:

- reuse Sheet/bottom-sheet if it already exists;
- otherwise responsive Modal.

Do not introduce a third overlay system.

## HU-019 UI / Data Flow

Existing operational flow stays:

- New Purchase.
- Receive.
- Cancel.

Read side becomes:

- last-30-days default.
- History endpoint.
- filters.
- History row model.
- on-demand History Detail.

### Actions

Actions derive from both:

- backend/current status;
- mutation capability.

No mutation logic is reimplemented.

### Identifier

Helper presentation:

- list: short UUID, e.g. first readable segment with deterministic ellipsis/prefix;
- API: full UUID;
- detail: full UUID;
- optional Copy action only if shared primitive exists.

Never fabricate `OC-*`.

### Supplier options

Reuse existing supplier source if authorized.

Audit `isActive` behavior.

If inactive historical suppliers cannot be selected:

- preserve historical supplier name in rows/detail;
- document the filtering limitation;
- do not add backend.

### COCINA

For pure COCINA:

- History backend remains row-scope authority.
- Area filter becomes hidden/fixed contextual `Cocina`.
- Do not send user-selected GENERAL.

For broader multi-role:

- allow general filter behavior when backend's effective scope is broader.

## HU-021 UI / Data Flow

Routes:

- Register: `/gastos`.
- History: `/gastos/historial`.

History flow:

- current-month default.
- server filters.
- `ExpenseHistoryPage`.
- three StatCards from response aggregate values.
- table/cards from current page.
- server pagination.

### Metrics

Labels:

- Total gastos.
- Caja principal.
- Caja chica.

Values:

- totalAmount.
- cashDrawerTotal.
- pettyCashTotal.

No additional computations beyond display formatting.

### Filters

Approved for roles whose effective capability includes `ExpenseCategoryRead` — ADMINISTRADOR, ENCARGADO and CONTADORA under D12:

- date period.
- category.
- cash source.
- shift type.
- responsible.

Pure CONTADORA receives all five approved filters, loading Category options through the existing authorized source. This read capability remains read-only: it does not expose category mutations or Register Expense.

No description search.

No Shift ID UI.

### Responsible

Like Production:

- inspect actual string semantics;
- prefer compatible text control if no safe option source;
- never grant User Management solely for this filter.

### Category

D12 resolves and freezes the contract gap:

- ExpenseHistory → CONTADORA allowed read-only.
- ExpenseCategoryRead → CONTADORA included solely to load the existing category-options source for HU-021.
- ADMINISTRADOR and ENCARGADO retain category-management mutations; CONTADORA does not receive create, edit, activate, deactivate or delete.
- `ExpenseCategoryRead` does not confer Expense Register access to CONTADORA.
- ADMINISTRADOR, ENCARGADO and CONTADORA receive the Category filter when that effective capability is present.

The frontend MUST render Category from the existing authorized source for those roles. It MUST NOT create a replacement endpoint or DTO, introduce schema/migration changes, derive options from the current page, invent IDs, bypass the policy, or expose category/expense write controls to CONTADORA by virtue of this read capability.

## Query Keys / Invalidation

Actual factories/names must follow local conventions.

Conceptual shape only:

- Production:
  - history(filters,page).
  - summary(filters without pagination).
  - detail(id).
- Purchase:
  - history(filters,page).
  - historyDetail(id).
  - existing mutation-related keys preserved.
- Expense:
  - history(filters,page).
  - categories existing key.
  - existing register key/mutation preserved.

No inline duplicated string arrays if the feature already has a factory.

### Purchase invalidation

After Create/Cancel/Receive:

- invalidate Purchase History prefix/factory.
- invalidate relevant existing operational purchase queries.
- Receive continues to invalidate inventory data already required by its current flow.
- no global QueryClient invalidation.

The current public Purchase mutations already use a shared `purchases` prefix, which may allow the new History key to participate naturally if the local implementation remains equivalent. citeturn718410view4

## Filters and Default Periods

| HU     | Default       | Other filters                                     |
| ------ | ------------- | ------------------------------------------------- |
| HU-008 | current month | preparation, responsible, BatchCode               |
| HU-019 | last 30 days  | supplier, status, area                            |
| HU-021 | current month | category, cash source, MORNING/NIGHT, responsible |

Clear:

- restores the default period;
- clears all other non-default filters;
- resets page.

Use the predominant existing pattern for URLSearchParams vs local filter state. HU-015 should be audited as precedent before choosing.

## Details

### Production

Fetch on open.

Use historical consumption snapshot.

### Purchases

Fetch History Detail on open.

Do not perform separate current-Supplier/Product requests solely to rebuild information already in the DTO.

### Expenses

No detail endpoint is required or permitted by this design.

Do not reproduce three-dot menu actions from a mockup without a real operation.

## Responsive

### 360 px

Production:

- all 3 summary cards visible;
- stacked or 2+1 layout;
- filter stack/drawer based on existing primitives;
- cards for History.

Purchases:

- mobile cards with status + relevant actions.

Expenses:

- metrics stack/grid;
- History cards.

No squeezed horizontal tables.

### ~768 px

- 2-column filters/cards where readable.
- DataTable may become viable depending on content width.

### >=1280 px

- full AppShell.
- summary cards in a row where applicable.
- DataTables.

## Accessibility

- Inputs/selects have labels.
- Icon-only actions have accessible names.
- Status has text, not color only.
- Full BatchCode/UUID remains accessible when visually abbreviated.
- Detail overlay uses proper dialog/drawer semantics.
- Keyboard close works via shared primitive.
- Focus returns to originating row/action.
- Pagination is keyboard-accessible.
- Loading indicators expose appropriate busy semantics.
- Error states use shared Alert semantics.
- Clear Filters is a named button/action.

## Error States

Each feature defines:

### Initial loading

Use shared Skeleton/Spinner.

### Background refresh

Keep prior layout/data when the established TanStack Query pattern supports it; do not blank the entire view unnecessarily.

### Empty dataset

Feature-specific factual copy.

### Filtered empty

Explicitly say filters returned no records and provide Clear Filters.

### Recoverable error

Shared Alert/error parser + Retry.

### HU-008 split query failure

Summary failure:

- cards show localized error/retry;
- valid History list remains functional.

History failure:

- history area shows error;
- summary need not be destroyed if it loaded.

## ProblemDetails

Reuse existing shared parser.

Do not display:

- raw JSON;
- backend stack trace;
- arbitrary exception body.

No new error infrastructure.

## Visual KEEP / ADAPT / OMIT

### Production — supplied references

The binary images are not directly retrievable in this environment; the following reconciliation uses the maintainer-provided image set and frozen visual interpretation. Pixel-level comparison MUST be performed from local image files before final frontend implementation if available.

| Element                   | Classification | Design                                        |
| ------------------------- | -------------- | --------------------------------------------- |
| Desktop history table     | KEEP / ADAPT   | Use current DataTable/layout                  |
| Mobile history cards      | KEEP / ADAPT   | Required below desktop breakpoint             |
| Filter block              | KEEP / ADAPT   | Only preparation/period/responsible/BatchCode |
| Register Production CTA   | KEEP           | Role-aware                                    |
| Physical monthly Kg total | ADAPT          | Replace with Production event count           |
| Latest production card    | KEEP / ADAPT   | Backend `latestProduction`                    |
| Most produced card        | KEEP / ADAPT   | Frequency of events                           |
| Colored product dots      | ADAPT / OMIT   | Decorative only; no false semantic            |
| Detail Drawer             | KEEP / ADAPT   | Reuse existing overlay precedent              |
| Ingredients consumed      | KEEP / ADAPT   | Historical `Consumo registrado`               |
| COMPLETED status          | KEEP           | Real enum label                               |
| Edit                      | OMIT           | No mutation                                   |
| Print label               | OMIT           | Out of scope                                  |
| Fake lot number           | OMIT           | Use real BatchCode                            |
| Lot stock/expiry          | OMIT           | No backend concept                            |

### Purchases — supplied references

| Element                           | Classification | Design                              |
| --------------------------------- | -------------- | ----------------------------------- |
| Single Purchases page             | KEEP           | `/compras`                          |
| Period filter                     | KEEP           | Last 30 days default                |
| Supplier filter                   | KEEP           | Existing authorized source          |
| Status filter                     | KEEP           | Real generated enum                 |
| Area filter                       | KEEP / ADAPT   | Pure COCINA fixed/hidden to KITCHEN |
| New Purchase                      | KEEP           | Existing mutation capability        |
| View                              | KEEP           | History Detail                      |
| Receive                           | KEEP           | Existing mutation only              |
| Cancel                            | KEEP           | Existing mutation only              |
| `OC-5422` style identifier        | ADAPT          | Abbreviated real UUID               |
| KITCHEN/GENERAL context           | KEEP           | Backend-derived                     |
| Mobile cards                      | KEEP / ADAPT   | Current design system               |
| Print icon                        | OMIT           | No print/export                     |
| Historical misleading cancel copy | OMIT / ADAPT   | Keep current factual business copy  |

### Expenses — supplied references

| Element               | Classification                 | Design                            |
| --------------------- | ------------------------------ | --------------------------------- |
| Register/History tabs | KEEP / ADAPT                   | Role-aware                        |
| History table         | KEEP / ADAPT                   | Current DataTable                 |
| Mobile history cards  | KEEP / ADAPT                   | Required                          |
| Period                | KEEP                           | Current month                     |
| Category              | KEEP / ADAPT                   | Existing `ExpenseCategoryRead` source for ADMIN/ENC/CONTADORA; read-only for CONTADORA |
| Shift                 | ADAPT                          | MORNING/NIGHT only                |
| Cash source           | KEEP / ADD                     | Required frozen filter            |
| Responsible           | KEEP / ADAPT                   | Match actual responsible contract |
| Three metrics         | KEEP / ADAPT                   | Exact backend expense totals      |
| Saldo caja            | OMIT                           | Not an expense aggregate          |
| Search by description | OMIT                           | Unsupported by frozen filter set  |
| Export                | OMIT                           | Out of scope                      |
| Cloud sync state      | OMIT                           | No contract                       |
| Loading/empty/error   | KEEP                           | Shared states                     |
| Register success      | ADAPT                          | Add `Ver historial` only          |

## Testing Strategy

### Strict TDD

The repository has an established automated test stack.

For new Production Summary behavior:

- RED.
- GREEN.
- TRIANGULATE.
- REFACTOR.

Evidence should include focused test commands/results.

### Backend HU-008 Summary

Tests SHOULD cover at least:

1. ADMIN authorized.
2. ENC authorized.
3. COCINA authorized.
4. CONTADORA authorized.
5. MESERO forbidden.
6. EMPLEADO forbidden.
7. Product filter affects productionCount.
8. BatchCode filter affects productionCount.
9. Responsible filter affects productionCount.
10. Date filter affects productionCount.
11. Pagination does not exist/affect summary.
12. Latest is newest filtered event.
13. Most-produced is based on event frequency.
14. Mixed units do not produce cross-unit total.
15. Empty → 0/null/null.
16. Deterministic tie.
17. GET has no inventory side effects.

Adapt exact number/test layer to the current test architecture.

### HU-008 frontend

- route roles.
- nav roles.
- current-month default.
- history query params.
- summary receives same filters.
- event-count card.
- latest card.
- most-frequent card.
- summary-only error.
- mixed-unit semantics reflected without aggregate.
- empty/filtered empty.
- pagination.
- BatchCode.
- detail on demand.
- consumption snapshot.
- CONTADORA no Register CTA.
- writer Register CTA.
- HU-007 success → History.
- mobile presentation where test architecture supports it.

### HU-019 frontend

- unified `/compras`.
- last-30-days default.
- Supplier/Status/Area.
- no Responsible filter.
- pure COCINA scope.
- COCINA cannot select GENERAL.
- COCINA+ENC broader capability.
- CONTADORA read-only.
- abbreviated UUID.
- full detail UUID.
- receipt detail.
- cancellation detail.
- PENDING actions.
- no mutations after RECEIVED/CANCELLED.
- Create regression.
- Receive regression.
- Cancel regression.
- History invalidation.
- mobile cards.
- loading/error/empty.

### HU-021 frontend

Following frozen D12:

- route roles.
- CONTADORA direct History target.
- ADMIN/ENC tabs.
- current-month default.
- Category through the existing `ExpenseCategoryRead` source for ADMIN/ENC/CONTADORA.
- CONTADORA remains read-only: no category mutations and no Register Expense by this authorization.
- Cash source.
- MORNING/NIGHT.
- Responsible.
- no TARDE.
- metrics come directly from backend.
- page change does not recompute metrics.
- pagination.
- category null.
- read-only controls.
- no export.
- loading/error/empty.
- HU-020 success → History.

### D12 authorization evidence

- The existing policy implementation is in `Program.cs`.
- `ExpenseCategoryAuthorizationPostgresIntegrationTests.cs` covers the authorization boundary.
- Focused isolated output: `1/1` passed.
- This coverage MUST remain green while HU-021 frontend work proceeds; no additional endpoint, DTO, schema or migration is required.

## Regression Strategy

### HU-007

Verify:

- product selection.
- requirements preview.
- stock validation.
- confirmation.
- success.
- inventory mutation.
- BatchCode.
- register another.
- new History link.

### HU-017 / HU-018

Verify:

- list remains operational.
- create.
- cancel.
- receive.
- status transitions.
- inventory increment after receive.
- mutation error handling.
- history refresh.

### HU-020

Verify:

- amount validation.
- description.
- category.
- date.
- cash source.
- authenticated actor.
- form reset.
- existing success feedback.
- `Registrar otro gasto`.
- new `Ver historial`.

## Full Gates

Backend future APPLY:

- actual restore/build commands.
- focused tests.
- full solution tests.
- `has-pending-model-changes`.
- runtime OpenAPI.

Frontend:

- `format:check`.
- `typecheck`.
- `lint`.
- focused tests.
- full tests.
- build.

Exact local scripts/solution names MUST be revalidated. The public package currently confirms these frontend script families. citeturn423800view1

## Documentation Strategy

After successful APPLY only:

### HU-008

Update factual manifest with:

- Production Summary endpoint exact path.
- exact DTO.
- exact filters.
- frontend routes/files.
- generated contract regeneration.
- real tests/gates.

### HU-019

Record:

- backend reused.
- History frontend integrated.
- existing mutations reused.
- actual files/tests.

Do not claim backend change.

### HU-021

Record:

- existing Expense History and category-options backend reused;
- D12 policy inclusion of CONTADORA is recorded as an options-only authorization adjustment;
- category mutations remain ADMIN/ENC only and CONTADORA remains without Register Expense by this authorization;
- no new endpoint, DTO, schema, migration or other backend change;
- History route/frontend;
- real tests and the existing D12 focused `1/1` authorization result.

Update traceability/OpenSpec status only where repository convention requires it.

No broad historical docs rewrite.

## Components Touched

Likely:

- Production Operations endpoint/application/infrastructure query area.
- Production integration/application tests.
- Generated OpenAPI TypeScript.
- Production feature.
- Purchases feature.
- Expenses feature.
- AppRoutes.
- navigation registry.
- shared history/detail UI where genuinely reusable.
- existing formatters/query states.
- focused frontend tests.
- HU docs/OpenSpec evidence.

Exact files MUST be selected from local source.

## Boundaries Respected

- Production Summary is the only new backend capability.
- D12 is limited to including CONTADORA in the existing `ExpenseCategoryRead` policy for HU-021 options; it adds no endpoint, DTO, schema, migration or other backend behavior.
- No schema changes.
- Purchase backend unchanged.
- Expense backend otherwise unchanged; category mutations and Expense Register policies remain as currently defined.
- Existing mutations remain in their current features.
- History does not own inventory mutations.
- Generated types remain generated.
- Demo migration remains untouched.
- No new dependencies by default.

## Contracts Changed

Confirmed planned external contract change:

- one new read-only Production Summary endpoint and its response DTO.

No Purchase external contract change planned.

No Expense external contract change planned; D12 reuses the existing category-options endpoint and DTO and changes only its authorization policy.

Generated frontend contract will change only because runtime OpenAPI gains Production Summary; D12 does not change the generated schema.

## Data Flow

### Production

- History filters.
- History query + pagination.
- Same logical filters → Summary query without pagination.
- Summary → 3 cards.
- Current page → table/cards.
- row action → on-demand detail.
- detail → persisted consumptions.

### Purchases

- `/compras`.
- default/filter state.
- History read query.
- current page → table/cards.
- row action → History Detail.
- existing PENDING mutation actions → existing mutation hooks.
- mutation success → targeted query invalidation.

### Expenses

- `/gastos` registration or `/gastos/historial` history.
- role-aware internal/global navigation.
- default/filter state.
- Expense History query.
- response aggregates → 3 cards.
- response page → table/cards.
- no historical mutations.

## Required Tests Per Layer

### Backend

Add/extend tests for Production Summary and full regression while preserving the existing D12 authorization coverage. `Program.cs` and `ExpenseCategoryAuthorizationPostgresIntegrationTests.cs` already contain the D12 implementation/test boundary, and its focused isolated output is `1/1` passed; no new category endpoint or contract test surface is required.

### Frontend

Add focused component/query/route tests for the three HUs and regressions of touched flows.

### Manual responsive

Verify 360, ~768 and >=1280 with actual browser during future verify.

### Contract

Verify runtime OpenAPI and generated-client diff.

## Tradeoffs Accepted

- One small backend summary endpoint is preferable to incorrect current-page aggregation.
- Three separate feature compositions are preferred over a generic History framework.
- Production summary may execute several small SQL queries rather than one complex multi-result abstraction.
- Historical inactive entity options may remain a documented limitation if existing authorized lookup contracts cannot expose them.
- Purchase retains both compatibility operations and the richer History read model because existing mutation workflows must remain stable.
- D12 reuses the existing category-options endpoint by including CONTADORA in `ExpenseCategoryRead` solely for HU-021; category mutations remain ADMIN/ENC only and no Expense Register capability follows from that read authorization.

## Implementation Constraints

- Do not APPLY until local baseline is audited.
- Apply D12 exactly: CONTADORA may load and use the existing Category options for HU-021, but receives no category mutation or Register Expense controls by this authorization.
- Do not add a category endpoint or DTO, schema, migration or other backend change.
- No new backend endpoint except Production Summary.
- No migration.
- No new dependency without exceptional justification.
- No generated TS manual edits.
- No exports.
- No print.
- No unrelated Sprint 3 changes.
- No old findings cleanup.
- No giant frontend refactor.

## Open Design Questions

D12 resolves the prior HU-021 Category blocker and is frozen for continuation. The implementation must use the existing `ExpenseCategoryRead` endpoint for CONTADORA's HU-021 options while keeping category mutations and Expense Register outside this authorization. No new endpoint, DTO, schema, migration or other backend change is permitted for this decision.

The existing D12 authorization implementation/test evidence is already recorded as `Program.cs` plus `ExpenseCategoryAuthorizationPostgresIntegrationTests.cs`, with focused isolated output `1/1` passed.

### Non-blocking technical research

- Does the local preparation selector include inactive historical preparations?
- Does the Supplier source expose inactive suppliers when requested?
- What is the exact semantic matching behavior of `responsible`?
- Which HU-015 overlay primitive is now canonical?
- Does the current filter pattern prefer URLSearchParams or component state?
- What exact local query-key factory convention was introduced by recent features?

These MUST be resolved from source and do not require maintainer input.
