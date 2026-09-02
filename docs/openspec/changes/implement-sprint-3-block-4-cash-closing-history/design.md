# Design

## Baseline Audit

### Local baseline

- Branch: `UNVERIFIED_LOCAL`
- HEAD: `UNVERIFIED_LOCAL`
- Working tree: `UNVERIFIED_LOCAL`

Mandatory first future explore step:

- `git status`
- current branch
- HEAD
- recent log
- staged/unstaged/untracked
- local OpenSpec inventory
- current generated contract
- actual runtime OpenAPI when available

No remote evidence replaces this baseline.

### Secondary public baseline

Current `develop` demonstrates:

- backend HU-028 exists;
- frontend HU-028 does not yet exist;
- Cash Closing frontend implements HU-026/HU-027;
- generated CashClosing contract already exists;
- routes currently stop at `/turnos/cierre`;
- cash frontend endpoints currently expose preview/close only. citeturn870342view1turn793889view0turn279334view3

## Cash Backend Architecture

Relevant API group:

`/api/v1/cash`

Current operations:

- Preview → `CashManage`.
- Close → `CashManage`.
- Closings history → `CashHistory`.
- Closing detail → `CashHistory`. citeturn279334view4

Current policy boundary:

| Policy      | Roles                               |
| ----------- | ----------------------------------- | ---------------------- |
| CashManage  | ADMINISTRADOR, ENCARGADO            |
| CashHistory | ADMINISTRADOR, ENCARGADO, CONTADORA | citeturn882782view5 |

This is already the correct backend separation for D15.

## CashSession → CashClosing Relationship

Current Close flow computes the final values before persisting a `CashClosing`.

The backend currently persists:

- BusinessDate;
- both opening amounts;
- removed cash;
- Sales totals;
- PaymentMethod totals;
- SalesChannel totals;
- Expense totals;
- expectedCash;
- declaredCash;
- difference;
- observation;
- actor ID;
- closedAt.

Then it completes NIGHT and closes the CashSession. citeturn198188view4

Historical queries subsequently read `CashClosing` directly rather than recomputing values from live Sales/Expenses. citeturn198188view2

Therefore the historical contract itself is the audit snapshot authority.

## HU-026 / HU-027 Current Frontend

Current `CashClosingPage` already establishes reusable patterns for:

- `formatMoney`;
- BusinessDate formatting;
- datetime formatting;
- `differenceLabel`;
- Preview query;
- Close mutation;
- ProblemDetails handling;
- loading;
- no-active-session;
- recoverable error;
- success state;
- PaymentMethod versus Channel presentation;
- immutable-close confirmation copy. citeturn793889view1turn793889view2

HU-028 MUST reuse these conventions.

### Existing success state

Current actions:

- Volver a Turnos / Caja.
- Ir al Inicio.

Required extension:

- add secondary `Ver historial de cierres`.

Do not auto-redirect.

## HU-028 Contract

### CONTRACT_USAGE_MATRIX

| Concern                  | Contract                         | Status                      | Notes                           |
| ------------------------ | -------------------------------- | --------------------------- | ------------------------------- |
| History                  | `GET /api/v1/cash/closings`      | SUPPORTED                   | `PagedResponse<CashClosingDto>` |
| Detail                   | `GET /api/v1/cash/closings/{id}` | SUPPORTED                   | dedicated endpoint              |
| Pagination               | `page`, `pageSize`               | SUPPORTED                   | required, 1–100 validated       |
| Period                   | `from?: DateOnly`, `to?: DateOnly` | AUTHORIZED — D19 / OPTION A | inclusive BusinessDate filter before order/pagination |
| Responsible filter       | none                             | OMITTED_BY_CURRENT_CONTRACT | explicitly nonblocking          |
| Summary                  | none                             | ABSENT                      | summary cards omitted           |
| CONTADORA read           | `CashHistory`                    | SUPPORTED                   | backend policy                  |
| Snapshot                 | `CashClosingDto`                 | SUPPORTED                   | full reconciliation values      |
| Responsible display name | none                             | NOT AVAILABLE               | only `closedByUserId`           |
| Carried forward snapshot | none in closing                  | NOT AVAILABLE               | preview-only field              |

The initial local contract accepted only page/pageSize. D19 / OPTION A now authorizes the additive date-only extension of the existing History GET. `from` and `to` are optional independent bounds, applied inclusively to `CashClosing.BusinessDate` before newest-first ordering and `Skip/Take`; `from > to` uses the existing validation convention. No new DTO, schema, migration or endpoint is introduced.

`PERIOD_FILTER: AUTHORIZED_BY_D19_OPTION_A`

Responsible remains `OMITTED_BY_CURRENT_CONTRACT` and summary remains absent.

## CashClosing Snapshot Audit

Current generated DTO:

| Field                    | Historical availability         |
| ------------------------ | ------------------------------- | -------------------------------------- |
| id                       | PERSISTED/EXPOSED               |
| cashSessionId            | PERSISTED/EXPOSED               |
| businessDate             | PERSISTED/EXPOSED               |
| openingAmount            | PERSISTED/EXPOSED               |
| pettyCashOpeningAmount   | PERSISTED/EXPOSED               |
| cashRemovedAmount        | PERSISTED/EXPOSED               |
| salesTotal               | PERSISTED/EXPOSED               |
| cashSalesTotal           | PERSISTED/EXPOSED               |
| qrSalesTotal             | PERSISTED/EXPOSED               |
| externalSalesTotal       | PERSISTED/EXPOSED               |
| directSalesTotal         | PERSISTED/EXPOSED               |
| pedidosYaSalesTotal      | PERSISTED/EXPOSED               |
| cashDrawerExpensesTotal  | PERSISTED/EXPOSED               |
| pettyCashExpensesTotal   | PERSISTED/EXPOSED               |
| expensesTotal            | PERSISTED/EXPOSED               |
| expectedCash             | PERSISTED/EXPOSED               |
| declaredCash             | PERSISTED/EXPOSED               |
| difference               | PERSISTED/EXPOSED               |
| observation              | PERSISTED/EXPOSED, nullable     |
| closedByUserId           | PERSISTED/EXPOSED               |
| closedAt                 | PERSISTED/EXPOSED               |
| cashAmountCarriedForward | NOT AVAILABLE in CashClosingDto |
| responsible display name | NOT AVAILABLE                   |
| digital signature        | NOT AVAILABLE                   |
| modifiedAt               | NOT AVAILABLE                   | citeturn882782view0turn279334view0 |

### Historical reconstruction policy

Never:

    historical closing
      → current CashSession
      → current Sales
      → current Expenses
      → recompute

Always:

    historical closing
      → CashClosingDto persisted snapshot
      → presentation

## Route Architecture

Target:

    /turnos
        operational Shift/Cash management

    /turnos/cierre
        HU-026/HU-027 operation
        ADMIN/ENC only

    /turnos/cierres
        HU-028 history
        ADMIN/ENC/CONTADORA

HU-028 MUST NOT be rendered as a read-only mode of `/turnos/cierre`.

## Authorization Matrix

| Feature              | ADMIN | ENC | MESERO | COCINA | CONTADORA | EMPLEADO | Scope     |
| -------------------- | ----: | --: | -----: | -----: | --------: | -------: | --------- |
| Cash Preview         |   YES | YES |     NO |     NO |        NO |       NO | existing  |
| Final Cash Close     |   YES | YES |     NO |     NO |        NO |       NO | existing  |
| Cash Closing History |   YES | YES |     NO |     NO |       YES |       NO | read-only |
| Closing Detail       |   YES | YES |     NO |     NO |       YES |       NO | read-only |
| Historical Edit      |    NO |  NO |     NO |     NO |        NO |       NO | forbidden |
| Reopen               |    NO |  NO |     NO |     NO |        NO |       NO | forbidden |
| Export               |    NO |  NO |     NO |     NO |        NO |       NO | forbidden |

## Navigation

Current global navigation has one `Turnos / Caja` item with role-aware targets, but its existing read-role set does not include CONTADORA. citeturn279334view2turn885567view0

Preferred minimal design:

### ADMIN / ENC

Global:

`Turnos / Caja` → `/turnos`

Inside the Turnos/Caja experience expose explicit actions:

- Cierre de caja.
- Cierres de caja.

Inside `/turnos/cierre`:

- secondary `Ver historial de cierres`.

After successful close:

- `Ver historial de cierres`.

### CONTADORA

Must not be forced through `/turnos` if that route remains operational/manage-only.

The navigation system should expose an authorized Turnos/Caja history destination directly:

`Cierres de caja` → `/turnos/cierres`

Implementation MAY represent this as a role-aware module target or another navigation structure already established in the latest local baseline.

Do not grant `SHIFT_MANAGE_ROLES` to CONTADORA.

Do not expose `/turnos/cierre`.

## Filter Design

### Frozen target

Period:

- from.
- to.
- default current month.
- server-side.
- reset page.
- clear → current month.

### Resolved period contract

D19 authorizes the existing endpoint to accept optional date-only `from`/`to` bounds. The frontend period control therefore forwards the bounds server-side and never filters a page locally or downloads all pages.

### Responsible

Current status:

`OMITTED_BY_CURRENT_CONTRACT`

No UI control.

No User Management queries.

No page-only responsible filtering.

## Pagination

Current contract:

- page.
- pageSize.
- totalCount.
- totalPages.

History service sorts:

`ClosedAt DESC`

before `Skip/Take`. citeturn198188view2

Frontend:

- follow current Pagination/buttons precedent;
- include page in query key;
- request one page only;
- reset to page 1 after server filter change.

## History List

### Desktop

Recommended compact columns:

1. Fecha de negocio.
2. Responsable/actor.
3. Cerrado a las.
4. Esperado.
5. Declarado.
6. Diferencia.
7. Acción.

Do not show:

- Cash Sales.
- QR Sales.
- External.
- DIRECT.
- PedidosYa.
- expense splits.

Those belong to Detail.

### Responsible representation

Current DTO exposes only:

`closedByUserId`.

It does not expose `ResponsibleName`.

Therefore preferred hierarchy:

1. use an actual display-name field if local contract now has one;
2. otherwise use real `closedByUserId`, optionally abbreviated visually with full accessible value;
3. do not issue per-row `/users` calls;
4. do not fabricate names.

## Difference Semantics

Shared conceptual presentation function:

    diff > 0
      → Sobrante
      → preserve + amount

    diff < 0
      → Faltante
      → preserve - amount

    diff == 0
      → Cuadrado
      → 0 amount

Current `cash/format.ts` already owns equivalent semantics and SHOULD be reused/extended rather than duplicated. citeturn793889view2

Color:

- positive may use success;
- negative may use danger;
- zero may use neutral/info;

but text is mandatory.

## Detail Architecture

### Fetch

Current contract provides:

`GET /api/v1/cash/closings/{id}`.

Fetch only when opening Detail.

Cache key conceptually:

    cashKeys.closing(id)

No list-time N+1.

### Overlay

Audit latest Block 1/2 overlay primitives.

Priority:

1. existing responsive Detail Drawer/Sheet;
2. existing Modal;
3. no new overlay framework.

### Sections

#### Identity

- BusinessDate.
- ClosedAt.
- actor ID/display if available.
- real CashClosing UUID if displaying ID.

#### Apertura / caja

- Apertura caja principal.
- Apertura caja chica.
- Efectivo retirado.

Do not combine opening values.

#### Medios de pago

- Efectivo → cashSalesTotal.
- QR → qrSalesTotal.
- Pago externo → externalSalesTotal.

#### Canales

- Directo → directSalesTotal.
- PedidosYa → pedidosYaSalesTotal.

These are parallel breakdowns of Sales, not additive categories.

#### Gastos

- Caja principal → cashDrawerExpensesTotal.
- Caja chica → pettyCashExpensesTotal.
- total expenses only if useful and already in contract.

No fake `Sin asignar`.

#### Conciliación

- expectedCash.
- declaredCash.
- difference + textual meaning.

#### Observation

Render only if non-empty.

### Deliberate omissions

- cashAmountCarriedForward because not present in closing snapshot.
- digital signature.
- last modification.
- sequential CZ identifier.
- modified-by.
- edit controls.

## Snapshot Authority

The current close implementation persists the same values later returned by history/detail. citeturn198188view4turn198188view2

Therefore:

- no history formula;
- no live Sale queries;
- no live Expense queries;
- no current Shift query;
- no current CashSession query.

Historical accuracy is defined by the persisted CashClosing.

## Payment vs Channel

Current existing CashClosingPage already separates:

`Ventas por medio de pago`

from:

`Ventas por canal`.

That implementation is the precedent. citeturn793889view1

Reuse label semantics:

| Contract            | Dimension | Label        |
| ------------------- | --------- | ------------ |
| cashSalesTotal      | Payment   | Efectivo     |
| qrSalesTotal        | Payment   | QR           |
| externalSalesTotal  | Payment   | Pago externo |
| directSalesTotal    | Channel   | Directo      |
| pedidosYaSalesTotal | Channel   | PedidosYa    |

Never place PedidosYa under Payment.

## Opening Amounts

Mockup detail collapses opening cash into a single `Monto Inicial`.

ADAPT.

Current contract persists:

- openingAmount.
- pettyCashOpeningAmount.

Therefore Detail should explicitly show both.

## Legacy / Null Handling

The public generated contract marks most numeric CashClosing fields non-null, while observation is nullable. citeturn882782view0

Still design defensive presentation for a local/newer legacy-safe contract:

- optional text → `—` or omit section row;
- optional numeric → `—`;
- never default an unknown historical value to zero unless contract guarantees zero semantics;
- never fill missing historical values with Preview/current CashSession.

## Query Keys / Cache

Current:

    cashKeys.all
    cashKeys.preview()

Extend conceptually:

    cashKeys.closings(filters)
    cashKeys.closing(id)

Exact naming follows local convention.

Historical closings are immutable, so a non-zero staleTime MAY be used if it matches current application conventions.

Do not introduce aggressive cache policy solely because data is immutable.

### HU-027 success integration

After close success:

- current result remains displayed;
- add Link `/turnos/cierres`;
- history does not need to be eagerly fetched;
- if closings query happens to be cached, close success MAY invalidate its prefix using targeted invalidation.

No global QueryClient invalidation.

## Responsive

### Desktop >=1280

- PageHeader.
- filter area.
- compact DataTable.
- Drawer/detail overlay.

### Tablet ~768

- filter remains accessible.
- table may remain if readable or transition according to shared breakpoint.

### Mobile 360

- title.
- period control once contract supported.
- history result count from `totalCount`.
- cards.
- each card:
  - BusinessDate;
  - actor context if available;
  - expected;
  - declared;
  - textual difference;
  - View Detail.
- Sheet/detail overlay.

No horizontally squeezed 7-column table.

## Accessibility

- Date period labelled.
- Detail action text/aria-label contextual.
- Sobrante/Faltante/Cuadrado in text.
- Money values not communicated solely by color.
- Detail uses accessible heading.
- Overlay focus management.
- Keyboard close.
- Focus return.
- Pagination labelled.
- Loading uses status/busy semantics.
- Error uses Alert.
- Truncated UUID retains full accessible/copy value if current primitive supports it.

## Loading / Empty / Error

### Initial Loading

Use current Skeleton.

Do not replace AppShell.

### Background Refresh

Keep currently rendered records when established TanStack Query behavior supports this.

### Empty Current Month

Factual:

`No hay cierres registrados en el período seleccionado.`

No mutation CTA for CONTADORA.

ADMIN/ENC may have an operational navigation action if useful, but this is not required.

### Filtered Empty

`No se encontraron cierres con los filtros aplicados.`

`Limpiar filtros`.

### Error

`No se pudo cargar el historial de cierres.`

Retry.

Do not claim connection failure unless actually known.

## Visual KEEP / ADAPT / OMIT

### Cierres de Caja — Desktop

| Element                              | Classification                 | Design reconciliation                    |
| ------------------------------------ | ------------------------------ | ---------------------------------------- |
| Title `Cierres de caja`              | KEEP                           | Correct hierarchy                        |
| Consultation subtitle                | KEEP / ADAPT                   | Factual read-only subtitle               |
| Period control                       | KEEP                           | D19-backed server-side date-only bounds  |
| Filter button                        | ADAPT                          | Follow actual history filter convention  |
| Download icon                        | OMIT                           | D12                                      |
| Four KPI cards                       | OMIT                           | Current HU-028 backend has no aggregates |
| `+12% vs mes anterior`               | OMIT                           | Reporting                                |
| `Días sin Cierre`                    | OMIT                           | Unsupported business semantics           |
| History table                        | KEEP / ADAPT                   | Compact columns only                     |
| CASH/QR/Delivery columns             | ADAPT → Detail                 | Too wide; detailed snapshot              |
| Gastos column                        | ADAPT → Detail                 | Detailed snapshot                        |
| Expected/Declared/Difference         | KEEP                           | Core reconciliation                      |
| `Ver detalle`                        | KEEP                           | Only historical action                   |
| Pagination                           | KEEP / ADAPT                   | Use actual metadata                      |
| Persistent `Modo de consulta` banner | OMIT                           | D13                                      |
| Historical sidebar                   | OMIT / ADAPT                   | Current AppShell wins                    |

### Cierres de Caja — Mobile

| Element                      | Classification               | Design reconciliation                |
| ---------------------------- | ---------------------------- | ------------------------------------ |
| Title                        | KEEP                         |
| Monthly period control       | KEEP                         |
| Search/filter CTA            | ADAPT                        | Current filter pattern               |
| Summary cards                | OMIT                         | No summary contract                  |
| Hardcoded result count       | OMIT                         | Use actual totalCount                |
| Closing cards                | KEEP / ADAPT                 | Primary mobile history               |
| Expected                     | KEEP                         |
| Declared                     | KEEP                         |
| Difference panel             | KEEP                         | Text + amount                        |
| Responsible name/avatar      | ADAPT                        | Contract currently has actor ID only |
| `Ver detalle completo`       | KEEP / ADAPT                 | Use current Button style             |
| Consultation banner          | OMIT                         |
| Screenshot bottom navigation | OMIT                         | Current AppShell wins                |

### Detalle de Cierre — Snapshot

| Element                       | Classification              | Design reconciliation           |
| ----------------------------- | --------------------------- | ------------------------------- |
| Detail overlay                | KEEP / ADAPT                | Existing Drawer/Sheet/Modal     |
| Fake `#CZ-311023-01`          | OMIT                        | Real UUID only                  |
| BusinessDate                  | KEEP                        |
| ClosedAt                      | KEEP                        |
| Responsible                   | KEEP / ADAPT                | Only real actor information     |
| `Cajero Principal` role/title | OMIT                        | No CAJERO role / not in DTO     |
| Single `Monto Inicial`        | ADAPT                       | Split main + petty opening      |
| Efectivo                      | KEEP                        | Payment section                 |
| QR                            | KEEP                        | Payment section                 |
| PedidosYa under Ingresos      | ADAPT                       | Move to Channels section        |
| Caja principal expenses       | KEEP                        |
| Caja chica expenses           | KEEP                        |
| `Sin asignar`                 | OMIT                        | Unsupported                     |
| Expected/Declared/Difference  | KEEP                        |
| Observation                   | KEEP                        | Only persisted text             |
| `Firma digital verificada`    | OMIT                        |
| `Última modificación`         | OMIT                        |
| Cash carried forward          | OMIT under current contract | Not persisted in CashClosingDto |

## Testing Strategy

TDD where practical:

RED
→ GREEN
→ TRIANGULATE
→ REFACTOR

### Route/Auth

- ADMIN allow.
- ENC allow.
- CONTADORA allow.
- MESERO deny.
- COCINA deny.
- EMPLEADO deny.
- multi-role union.
- direct URL protection.

### Query

- current month after contract resolution.
- from/to forwarding.
- page/pageSize.
- page reset.
- responsible only if supported.
- pagination metadata.
- no all-pages download.

### List

- BusinessDate.
- actor identity.
- ClosedAt.
- expected.
- declared.
- positive difference.
- negative difference.
- zero.
- Detail.

### Detail

- on-demand fetch.
- opening main.
- opening petty.
- removed cash.
- payment breakdown.
- channel breakdown.
- PedidosYa classification.
- expenses.
- expected.
- declared.
- difference.
- observation.
- actor.
- no signature.
- no last modified.
- no mutations.
- missing carried-forward.

### Regression

HU-026:

- preview.
- payment/channel separation.
- expectedCash backend authority.

HU-027:

- declared input.
- provisional difference.
- conditional observation.
- confirm.
- 409.
- success.
- no duplicate submit.
- new History link.

## Documentation / Evidence Policy

After future APPLY:

- HU-028 status factual.
- backend: minimally extended in the existing history endpoint under D19 / OPTION A; no model or migration change.
- frontend: actual changed files.
- generated: unchanged unless an authorized backend change alters it.
- tests/build: actual outputs.
- manual: `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

Manual placeholders:

- [ ] Desktop history.
- [ ] Tablet history.
- [ ] 360 px history.
- [ ] Current-month default.
- [ ] Pagination.
- [ ] Positive difference.
- [ ] Negative difference.
- [ ] Zero difference.
- [ ] Detail desktop.
- [ ] Detail mobile.
- [ ] Payment breakdown.
- [ ] Channel breakdown.
- [ ] CONTADORA read-only.
- [ ] Empty.
- [ ] Loading.
- [ ] Error/retry.
- [ ] Keyboard/focus.
- [ ] No horizontal overflow.

These MUST remain unchecked during this block unless actual evidence is later collected.

## Components Touched

Frontend areas likely involved:

- cash API/query feature.
- endpoint registry.
- Cash Closing History page.
- closing Detail overlay.
- CashClosingPage success state.
- routes.
- Turnos/Caja navigation.
- shared table/card/pagination/overlay components only by reuse.
- cash formatters.
- tests.
- HU-028/OpenSpec docs.

Backend areas:

inspection only under current authorization.

## Boundaries Respected

- HU-026/027 operational behavior preserved.
- HU-028 read-only.
- CashHistory separate from CashManage.
- no reporting.
- no export.
- no reconstruction.
- no generated edit.
- no migration.
- no new package.
- no new Cash domain.

## Contracts Changed

D19 / OPTION A authorizes one additive external contract change: optional `from` and `to` `DateOnly` query parameters on the existing `GET /api/v1/cash/closings`. The parameters filter persisted `CashClosing.BusinessDate` inclusively before ordering and pagination. No DTO, entity, schema, migration, authorization policy or second endpoint changes.

No other backend contract change is required:

- detail already exists;
- pagination already exists;
- CashHistory role already includes CONTADORA;
- full CashClosing snapshot is already exposed.

## Data Flow

Current historical flow:

    CashClosing persisted
      → GET /cash/closings
      → server pagination
      → compact list
      → selected closing ID
      → GET /cash/closings/{id}
      → immutable snapshot
      → detail

Required filtered flow after D3 resolution:

    current-month filter
      → from/to
      → server-side CashClosing.BusinessDate filter
      → server pagination
      → compact list

Never:

    history
      → Sales + Expenses + CashSession
      → historical recomputation

## Required Tests Per Layer

### Frontend

New HU-028 query/page/route/detail tests.

Extend existing HU-027 tests for history link.

### Backend

No new backend tests under the current proposal.

Run existing backend regression suite if required by repository convention.

If backend `from/to` becomes authorized, proposal/spec/tasks MUST be revised and focused backend tests added before that change.

### Generated Contract

Expected:

unchanged under current scope.

Unexpected generated changes must be investigated.

### Manual

Deferred.

## Tradeoffs Accepted

- Summary cards are omitted rather than calculated incorrectly.
- Responsible filtering is omitted rather than simulated client-side.
- Actor ID may be less friendly than a name when no historical display name exists.
- `cashAmountCarriedForward` is omitted from history because the current persisted closing contract does not contain it.
- Detail uses a dedicated on-demand endpoint even though list DTO currently has the same shape, preserving a clean detail boundary and avoiding assumptions about future list/detail divergence.
- HU-028 remains a focused history instead of reproducing the broad mockup dashboard.

## Implementation Constraints

- Audit local source before APPLY.
- Implement only D19 / OPTION A for the period contract.
- No backend changes beyond the existing endpoint/service filter.
- No summary backend.
- No current-page summary.
- No Responsible filtering when unsupported.
- No reconstructed expectedCash.
- No live Sales/Expense historical reconstruction.
- No PedidosYa-as-payment.
- No historical mutation.
- No export.
- No fake closing ID.
- No signature.
- No last-modified copy.
- No manual evidence blocker.

## Open Design Questions

### Resolved Product Decision — D19 / OPTION A

The maintainer explicitly authorized optional `from` and `to` `DateOnly` query parameters on the existing history endpoint, inclusive `CashClosing.BusinessDate` filtering before order/pagination, and existing validation for `from > to`. No new endpoint, DTO, migration or schema change is allowed. No blocking product decision remains.

### Technical Research — Non-blocking

- Exact local query-key naming after the latest block.
- Latest canonical Detail Drawer/Sheet primitive.
- Whether latest local CashClosingDto added ResponsibleName.
- Whether latest local CashClosingDto added cashAmountCarriedForward.
- Exact navigation pattern produced by Blocks 2/3.
- Exact page-size convention.

These MUST be resolved from the repository and do not require product input.
