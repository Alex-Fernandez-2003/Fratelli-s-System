# Demo Dataset — Restaurant System Fratelli

## Migration

- Name: `20260901124421_AddComprehensiveDemoData`
- File: `backend/src/RestaurantSystem.Infrastructure/Migrations/20260901124421_AddComprehensiveDemoData.cs`
- Purpose: Poblar demo académica completa con datos determinísticos y reversibles para todas las funcionalidades principales.
- Data-only: YES — solo `INSERT`/`DELETE` via `migrationBuilder.Sql`, sin `AddColumn`, `CreateTable`, `CreateIndex`.
- Deterministic: YES — GUIDs fijos `a000...`, `b000...`, etc., fechas fijas `2026-07-20` a `2026-08-31`, sin `Guid.NewGuid()`, `NOW()`, `Random()`.
- Reversible: YES — `Down()` elimina exclusivamente los IDs demo en orden FK inverso.
- Conditional: `DO $$ BEGIN IF current_database() = 'restaurant_system' THEN ... END IF; END $$;` — demo solo se aplica a `restaurant_system`, no a DBs de test (evita romper `dotnet test`).

## Date Window

- From: `2026-07-20`
- To: `2026-08-31` (histórico) + `2026-07-28` para cash sessions; no se inserta `2026-09-01` (queda libre para demo manual; si ya existe una sesión de usuario se preserva).

## Reused Existing Seeds

- Roles: `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA`, `EMPLEADO` (existentes, no duplicados)
- Units: `g`, `kg`, `ml`, `l`, `unit` (existentes)
- Categories: `Entradas`, `Platos principales`, etc. (existentes)
- Users: se crean 4 demo `demo.admin`, `demo.encargado`, `demo.mesero`, `demo.cocina` con hashes dummy y `IsActive=true`; no se crean passwords plaintext ni secrets; se reutiliza `admin.test` para auditoría donde sea necesario.
- Products: se crean 20 nuevos sobre categorías/unidades existentes.

## Demo Data Counts (restaurant_system)

- Customers: 10 (8 activos, 2 inactivos)
- Suppliers: 4
- Products: 20
- Compositions: 6
- Productions: 12 + 26 consumptions
- Purchases: 10 (PENDIENTE 2, RECIBIDA 6, CANCELADA 2)
- Purchase items: 15
- Purchase receipts: 6
- Purchase receipt lines: 10
- Orders: 25
- Order items: 25
- Sales: 25 (CASH 13, QR 6, EXTERNAL 6; DIRECT 16, PEDIDOSYA 9; con customer 18, consumer final 7)
- Sale items: 25
- Expenses: 10 (CASH_DRAWER 5, PETTY_CASH 5; 4 categorías)
- CashSessions: 5 (2026-07-20,22,24,26,28, IsOpen=false)
- Shifts: 10 (MORNING/NIGHT COMPLETED per session)
- ShiftAssignments: 10
- CashClosings: 5 (zero 2, positive 1, negative 2; con observation obligatoria)
- InventoryMovements: 20
- InventoryBalances: 20 (NORMAL 7, LOW 8, NEGATIVE 5)
- AttendanceRecords: 8 (cerrados) + 1 ausencia derivable (assignment sin check-in 2026-07-28 NIGHT)

## Variety Verification

- Active/inactive customers, NIT null/no null, CI único: YES
- CASH/QR/EXTERNAL, DIRECT/PEDIDOSYA combos incluyendo DIRECT+CASH, DIRECT+QR, DIRECT+EXTERNAL, PEDIDOSYA+CASH etc.: YES
- PENDIENTE/RECIBIDA/CANCELADA: YES
- NORMAL/LOW/NEGATIVE: YES (ver query)
- On-time/late/closed/absence: YES (tolerancia 10, 08:00/18:00)
- Cash zero/positive/negative: YES

## Cash Integrity

- Historical cash math `Expected = Opening+Petty+CashSales-Drawer-Petty-Removed` consistente (verificado en inserts; sales/expenses por sesión coinciden en rangos)
- 2026-09-01 CashSession inserted by migration: NO (solo la de usuario `ce8f79d6-fb06-4522-bfda-6d93c39ee266` existe)

## EF Model

- Pending model changes: NONE (`dotnet ef migrations has-pending-model-changes` PASS)
- ModelSnapshot unexpected changes: NO (solo la nueva migration)

## Backend Validation

- Build: PASS (`dotnet build RestaurantSystem.slnx` 0 errores, 1 advertencia NU1903)
- Tests: 100/100 PASS (1 Domain, 18 Application, 81 Integration) — demo condicional evita romper tests de integración

## Frontend

- Modified: NO (solo backend migration)
- Tests: 177/177 PASS (32 files)

## OpenAPI / Generated API

- Modified: NO

## Git

- Commit: NO
- Push: NO
- Destructive: NONE
