# HU-005 / HU-020 Frontend Handoff

## Scope delivered

### Inventory (HU-005)

- Routes: `/inventario` (ADMINISTRADOR, ENCARGADO, MESERO, COCINA, CONTADORA) and `/inventario/movimientos` (ADMINISTRADOR, ENCARGADO).
- Endpoint consumers: `GET /api/v1/inventory/balances`, `GET /api/v1/inventory/movements`, and `POST /api/v1/inventory/movements` through the shared `httpClient` and generated OpenAPI types.
- Query keys: `inventoryKeys.balances(filters)` and `inventoryKeys.movements(filters)`; both use lifecycle-bound 30-second TanStack Query REST polling and preserve prior data during background refresh.
- Balances use server-side search, ProductType filter, and pagination. They render product type, quantity, unit, minimum stock, and the textual state priority `Saldo negativo` > `Stock bajo` > `Normal`.
- Manual ENTRY and WRITE_OFF are restricted to ADMINISTRADOR/ENCARGADO. Quantity supports up to four decimal places, unit is read-only, and reason is required. The request never sends an actor.
- WRITE_OFF accepts stock-negative outcomes. The UI warns, but never blocks, when it exceeds available stock or starts from a negative balance. No optimistic stock patch is made; mutation success invalidates all inventory queries.
- History is a read-only ledger with contract-supported filters, signed quantities, reference/reason, and actor display when supplied.
- Desktop uses tables; narrow screens use cards to avoid horizontal data-table overflow.

### Expenses (HU-020)

- Route: `/gastos` for ADMINISTRADOR and ENCARGADO only.
- Endpoint consumers: `GET /api/v1/expense-categories` and `POST /api/v1/expenses`, with `expenseKeys.categories()` only. Expenses do not poll and no expense-list key exists.
- Category is optional and exposes `Sin categoría`; empty or failed category loading remains non-blocking and permits a null category.
- Amount is BOB (`Bs.`), positive, and permits up to two decimals. Cash source is explicit and has no default (`CASH_DRAWER` = Caja principal, `PETTY_CASH` = Caja chica).
- The date default and max are calculated with `America/La_Paz`; past dates are allowed and future dates are rejected by the UI.
- Create payload contains only the generated request fields. Actor, Shift, cash balance, status, and created timestamps are never sent.
- A successful POST transitions to a persistent confirmation based on the returned `ExpenseDto`; it truthfully states that the record was saved and provides only `Registrar otro gasto`.

## Visual reconciliation

- **KEEP:** dark/orange Fratelli hierarchy, inventory tables/cards, filters, manual-movement dialogs, inventory state badges, expense form, cash-source cards, responsive stacked composition, and feedback states.
- **ADAPT:** decimal precision, read-only product unit/responsible display, optional expense category, warning-only negative inventory behavior, and truthful expense confirmation.
- **OMIT:** fake SKU, stock aggregate cards, stock/negative local filters, MinStock mutation, inventory export, expense history/search/metrics, Shift, cash balance, and cloud-sync claims.
- **DEFER:** `Configuración de alertas` owns MinStock configuration (HU-006-equivalent); expense history is HU-021. Global desktop sidebar, mobile menu, cross-module route reconciliation, and global documentation reconciliation remain the final Sprint 1 integration change.

## External/manual validation

The Product module is available in the local baseline. Human validation should verify desktop, 403px, and 360px layouts; role guards; live Product data; ENTRY/WRITE_OFF including negative-stock warnings; polling/manual refresh; and Expense category error, success/reset, and CashSource states. No manual evidence is claimed here.

## Backend boundary

`backend/` is unchanged. No SignalR or other realtime integration was added.
