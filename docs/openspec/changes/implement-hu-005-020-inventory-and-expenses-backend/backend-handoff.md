# Backend handoff — HU-005 and HU-020

## Delivery state

| Story | Backend | Frontend | End-to-end |
|---|---|---|---|
| HU-005 Inventory | COMPLETE | PENDING | PENDING |
| HU-020 Expenses | COMPLETE | PENDING | PENDING |

## Endpoint contract

| Capability | Method | Route | Roles | Request | Response | Application handler/service | Notes |
|---|---|---|---|---|---|---|---|
| Inventory balances | GET | `/api/v1/inventory/balances` | ADMINISTRADOR, ENCARGADO, MESERO, COCINA, CONTADORA | page, pageSize, search, productType, active | paged balances | `IInventoryService.BalancesAsync` | Products without rows return `currentQuantity: 0`; exposes `minStock` and derived `isLowStock`. |
| Inventory history | GET | `/api/v1/inventory/movements` | ADMINISTRADOR, ENCARGADO | page, pageSize, productId, movementType, from, to | paged movements | `IInventoryService.MovementsAsync` | Newest first; inactive Products are retained. |
| Manual inventory movement | POST | `/api/v1/inventory/movements` | ADMINISTRADOR, ENCARGADO | productId, type, quantity, reason | movement, 201 | `IInventoryService.RecordManualAsync` | Only `ENTRY` and `WRITE_OFF`; quantity is positive and the server derives the signed delta and MANUAL reference. |
| Expense categories | GET | `/api/v1/expense-categories` | ADMINISTRADOR, ENCARGADO | — | active categories | `IExpenseService.CategoriesAsync` | Name ascending; no CRUD. |
| Register expense | POST | `/api/v1/expenses` | ADMINISTRADOR, ENCARGADO | expenseCategoryId?, amount, cashSource, description, expenseDate | expense, 201 | `IExpenseService.CreateAsync` | Category optional; actor and timestamp are server controlled. |

## Inventory notes

`InventoryBalance` is a materialized per-Product balance (`numeric(14,4)`) and `InventoryMovement` is append-only. Negative quantities are allowed. The writer locks Product first and revalidates `IsActive`, materializes a zero balance through PostgreSQL `ON CONFLICT DO NOTHING`, locks the balance row, appends the movement, updates balance, and commits in one transaction. No `IsLowStock` column exists: `isLowStock = minStock != null && currentQuantity <= minStock`.

No alert endpoint, stock adjustment API, movement edit/delete, Purchase, Production, Sale consumption, SignalR, or Product/MinStock editing was added.

## Expense notes

`Expense` uses `numeric(12,2)`, closed `CashSource` values `PETTY_CASH` and `CASH_DRAWER`, trimmed descriptions, and a DateOnly business date. The existing `IBusinessClock` is reused. This branch has no Shift entity or active-shift resolver, so no Shift relationship is created or accepted from the client. Expenses do not mutate cash, Inventory, CashSession, or Sales. HU-021 expense history remains excluded.

## Migration and validation

Migration: `20260826224941_AddInventoryAndExpenses`.

It creates `inventory_balances`, `inventory_movements`, `expense_categories`, and `expenses`, with required FKs, positive amount/non-zero delta checks, enum checks, and history indexes. PostgreSQL integration tests apply the complete migration chain on disposable databases and exercise first-write concurrency and the API contract.

## Frontend follow-up

Frontend remains unchanged. Consume `currentQuantity`, `minStock`, and `isLowStock` from the balances response; do not assume a dedicated low-stock endpoint.
