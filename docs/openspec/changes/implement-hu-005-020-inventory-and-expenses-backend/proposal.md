# Proposal

## Problem Statement

El change único `implement-hu-005-020-inventory-and-expenses-backend` debe implementar exclusivamente backend para dos capabilities funcionalmente independientes:

- HU-005 — Gestionar entradas y salidas de inventario.
- HU-020 — Registrar gastos.

Ruta OpenSpec obligatoria:

`docs/openspec/changes/implement-hu-005-020-inventory-and-expenses-backend/`

Rama futura prevista:

`feature/hu-005-020-inventory-expenses-backend`

El change MUST mantener Inventory y Expenses separados en Domain, Application, Infrastructure, API, specs, tests y documentación, aunque ambos se entreguen dentro del mismo OpenSpec change.

Este change NO incluye frontend, NO genera `frontend/src/types/api.generated.ts`, NO implementa HU-021 y NO introduce SignalR.

### Estado observado de `develop`

La auditoría web actual confirma que el repositorio ya tiene la estructura backend de Clean Architecture esperada:

- `RestaurantSystem.Domain`;
- `RestaurantSystem.Application`;
- `RestaurantSystem.Infrastructure`;
- `RestaurantSystem.Api`;
- tests backend;
- EF Core/PostgreSQL;
- Identity/JWT;
- ProblemDetails;
- OpenAPI. citeturn682536view1turn682536view3

La vista pública actual de `Program.cs` confirma además que Orders/Kitchen ya está integrado en el backend: existen la capability Orders, policies de Orders/Kitchen y `/hubs/kitchen`. citeturn651051view0turn881853view0

Sin embargo, algunas vistas de GitHub están desincronizadas entre sí: `Program.cs` y los árboles `Domain/Orders`/`Infrastructure/Orders` muestran Orders integrado, mientras una vista de `ApplicationDbContext` y la carpeta pública de migrations todavía parecen una versión anterior sin esos cambios. citeturn208484view0turn208484view1turn682536view2turn194220view0

Por tanto, la futura sesión de APPLY MUST considerar autoridad absoluta el `develop` local real de ese momento y MUST auditar:

- HEAD;
- working tree;
- DbContext;
- entities;
- migrations;
- model snapshot;
- actual PostgreSQL schema;
- test fixtures;

antes de generar cualquier migration.

La inconsistencia web NO es una decisión de producto y NO justifica modificar migrations históricas.

### Baseline de catálogo relevante

El modelo Product públicamente visible actualmente posee:

- `Id`;
- `Name`;
- `ProductType`;
- `CategoryId`;
- `InventoryUnitId`;
- `PreparationArea`;
- `SalePrice`;
- `MinStock`;
- `IsActive`;
- auditoría. citeturn557703view0

`ProductDto`/`ProductRequest` exponen actualmente `MinStock`, `InventoryUnitId`, `ProductType`, `IsActive` y otros datos de catálogo. citeturn557703view1

La documentación canónica de datos define para Inventory:

- `inventory_balances`;
- `inventory_movements`;
- cantidades `numeric(14,4)`;
- saldo negativo permitido;
- siete movement types contractuales;
- `reference_type/reference_id` para trazabilidad. citeturn287218view0

La misma documentación define `expense_categories` y `expenses`, con:

- BOB;
- amount `numeric(12,2)`;
- `PETTY_CASH`;
- `CASH_DRAWER`;
- category opcional;
- expense date separada de created timestamp. citeturn287218view1

HU-005 exige entradas/salidas, trazabilidad, saldos negativos visibles e histórico preservado incluso después de desactivar un elemento. citeturn287218view2

HU-020 exige que ADMINISTRADOR/ENCARGADO registren gasto, con fecha, concepto, monto y responsable; HU-021 queda separada para consulta de gastos. citeturn287218view3

## Goals

### Inventory

- Materializar o adaptar `InventoryBalance`.
- Materializar o adaptar `InventoryMovement`.
- Implementar un ledger inmutable.
- Implementar entradas manuales `ENTRY`.
- Implementar bajas manuales `WRITE_OFF`.
- Derivar server-side el signo del movimiento.
- Exigir reason para ambos movimientos manuales.
- Permitir saldos negativos.
- No hacer clamp a cero.
- Usar la unidad de inventario del Product.
- Mantener Products sin balance materializado como saldo conceptual cero.
- Materializar la primera fila de balance concurrent-safe.
- Serializar actualizaciones concurrentes con PostgreSQL row locking.
- Exponer balances paginados.
- Exponer low-stock derivado en el mismo DTO.
- Exponer historial paginado de movimientos.
- Conservar historial de Products inactivos.
- Preparar un Application write boundary reutilizable posteriormente por Sale/Purchase/Production.
- No exponer manualmente movement types reservados a futuras capabilities.

### Expenses

- Materializar o adaptar `Expense`.
- Materializar o adaptar `ExpenseCategory`.
- Implementar únicamente registro de gasto.
- Implementar únicamente lectura de categorías activas como endpoint auxiliar.
- Permitir category opcional.
- Validar amount positivo.
- Validar `PETTY_CASH` / `CASH_DRAWER`.
- Validar description.
- Permitir expenseDate hoy o histórica.
- Rechazar expenseDate futura.
- Mantener expenseDate separada de CreatedAt.
- Resolver Shift server-side solo si existe un lifecycle real.
- Mantener ShiftId nullable cuando ese lifecycle no exista.
- No mutar caja.
- Registrar actor UserId del principal autenticado.
- No implementar list/detail/update/delete de Expenses.

### Delivery

- Generar una migration nueva y coherente.
- Validarla sobre PostgreSQL limpio y sobre la baseline real.
- Añadir policies y endpoints.
- Mantener ProblemDetails.
- Completar OpenAPI.
- Crear tests reales.
- Probar concurrencia con PostgreSQL.
- Ejecutar todos los tests backend.
- Ejecutar build limpio.
- Completar security review.
- Actualizar HU-005/HU-020 como backend-complete/frontend-pending.
- Dejar frontend completamente sin cambios.

## Non-Goals

### Inventory

- Product CRUD.
- Edición de MinStock.
- HU-006 alertas.
- Notifications.
- SignalR.
- Purchase receipt.
- Sale inventory consumption.
- Production consumption/output.
- Recipe consumption.
- Transfers.
- Warehouses.
- Multi-location stock.
- Reorder automation.
- Manual `ADJUSTMENT`.
- Manual `SALE`.
- Manual `PRODUCTION_CONSUMPTION`.
- Manual `PRODUCTION_OUTPUT`.
- Manual `PURCHASE_RECEIPT`.
- Modificar movimientos históricos.
- Eliminar movimientos históricos.
- Revertir movimientos mediante endpoint.
- Set absoluto de stock.
- Selección de unidad o conversión desde la API manual.

### Expenses

- HU-021.
- GET Expenses list.
- Expense detail API salvo una necesidad técnica inesperada y demostrada; el diseño de este briefing no lo requiere.
- Expense update.
- Expense delete.
- Expense cancellation.
- ExpenseCategory CRUD.
- Categorías inventadas/seeds no aprobados.
- CashSession.
- Cash ledger.
- Cash balance.
- Shift lifecycle.
- Shift opening/closing.
- Caja chica accounting engine.
- Reports.

### Cross-cutting

- Frontend.
- TypeScript generation.
- SignalR.
- Git mutations.
- APPLY/VERIFY/ARCHIVE en esta etapa.

## Affected Areas

### Inventory

- Domain Inventory.
- Application Inventory.
- Infrastructure Inventory.
- EF model/configuration.
- PostgreSQL transaction/locking access.
- API Inventory routes/policies.
- tests Inventory/PostgreSQL.

### Expenses

- Domain Expenses.
- Application Expenses.
- Infrastructure Expenses.
- EF model/configuration.
- API Expenses/category routes/policies.
- tests Expenses.

### Shared/transversal

- `ApplicationDbContext` o configuración modular equivalente real.
- DI registrations.
- authorization policy definitions.
- migration + model snapshot.
- OpenAPI metadata.
- documentation/OpenSpec.

## Assumptions

### Inferido — paginación

El repositorio visible utiliza habitualmente:

- `page >= 1`;
- `pageSize 1..100`;
- `PagedResponse<T>`;
- default `pageSize=20` en Catalog. citeturn973920view0turn557703view1

Inventory balances/history SHOULD usar:

- page = 1;
- pageSize = 20;
- máximo = 100;

salvo que el `develop` local real haya consolidado otra convención transversal posterior.

### Inferido — búsqueda de inventario

El Product visible no posee `Code`; por tanto `search` SHOULD buscar por `Product.Name`.

Si el `develop` local real ya añadió un código de Product antes de APPLY, search MAY incluirlo.

No se debe inventar una columna Product code desde HU-005.

### Inferido — business timezone

La auditoría pública no encontró una configuración explícita de business timezone en `Program.cs`. citeturn181518view1turn181518view2

Para validar `expenseDate` y filtros `from/to`, APPLY MUST reutilizar primero cualquier abstracción/configuración temporal existente en el `develop` local.

Si sigue sin existir, SHOULD introducirse una configuración explícita de timezone de negocio y una abstracción de fecha/clock testeable; dado el contexto BOB/Bolivia del proyecto, `America/La_Paz` es la recomendación técnica inferida y debe quedar documentada como configuración, no depender de la timezone del servidor/container.

### Inferido — ExpenseCategory list

`expense_categories` es un catálogo pequeño y HU-020 solo necesita categorías activas para crear un gasto.

Se recomienda:

`GET /api/v1/expense-categories`

como lista simple no paginada, ordenada `Name ASC`.

## Risks

### Risk 1: lost update de InventoryBalance

- Probability: High sin locking.
- Impact: Critical.
- Mitigation: transaction + upsert inicial + `FOR UPDATE` + relectura autoritativa antes de aplicar delta.

### Risk 2: carrera al crear primer balance

- Probability: High.
- Impact: Critical.
- Mitigation: `INSERT ... ON CONFLICT DO NOTHING` o primitive equivalente, seguido de lock/reload.

### Risk 3: movimiento persistido sin balance actualizado

- Probability: Medium.
- Impact: Critical.
- Mitigation: movement + balance en una única transaction.

### Risk 4: balance actualizado sin ledger

- Probability: Medium.
- Impact: Critical.
- Mitigation: misma transaction; ningún write path puede mutar saldo directamente.

### Risk 5: cliente falsifica signo

- Probability: Medium.
- Impact: High.
- Mitigation: request recibe quantity positiva; backend deriva delta.

### Risk 6: tipos futuros expuestos manualmente

- Probability: Medium.
- Impact: High.
- Mitigation: manual endpoint whitelist exacta `ENTRY|WRITE_OFF`.

### Risk 7: stock negativo bloqueado accidentalmente

- Probability: Medium.
- Impact: High.
- Mitigation: no check `balance >=0`; tests negativos explícitos. La documentación vigente confirma que el saldo negativo se almacena y continúa considerándose stock bajo. citeturn450574view8turn287218view0

### Risk 8: Product sin balance desaparece del listado

- Probability: Medium.
- Impact: High.
- Mitigation: query Product LEFT JOIN balance y `COALESCE(quantity,0)`.

### Risk 9: IsLowStock persistido se desincroniza

- Probability: Medium.
- Impact: Medium.
- Mitigation: derivarlo en read model, nunca columna.

### Risk 10: Product inactivo pierde histórico

- Probability: Medium.
- Impact: High.
- Mitigation: history query no filtra Product.IsActive; FK restrictiva/no destructiva.

### Risk 11: delete cascade elimina ledger

- Probability: Low.
- Impact: Critical.
- Mitigation: relaciones históricas RESTRICT/NO ACTION.

### Risk 12: request falsifica reference_type

- Probability: Medium.
- Impact: High.
- Mitigation: API manual no recibe reference; backend asigna MANUAL/null.

### Risk 13: Application boundary queda demasiado específico al endpoint manual

- Probability: Medium.
- Impact: Medium.
- Mitigation: separar manual use case de un write boundary interno reutilizable por futuras Sale/Purchase/Production.

### Risk 14: Expense modifica caja prematuramente

- Probability: Medium.
- Impact: Critical de scope.
- Mitigation: CashSource es clasificación únicamente; ningún cash write.

### Risk 15: Shift inexistente bloquea HU-020

- Probability: High según baseline visible.
- Impact: High.
- Mitigation: ShiftId nullable; no fake Shift.

### Risk 16: client spoof de Shift

- Probability: Medium.
- Impact: High.
- Mitigation: no shiftId en request.

### Risk 17: category inactiva usada en gasto nuevo

- Probability: Medium.
- Impact: Medium.
- Mitigation: validación Application antes de persistir.

### Risk 18: gasto futuro por error UTC/local

- Probability: Medium.
- Impact: High.
- Mitigation: comparar DateOnly contra fecha de negocio explícita, no `UtcNow.Date` ciego.

### Risk 19: Category seed inventado

- Probability: Medium.
- Impact: Medium.
- Mitigation: ningún seed nuevo salvo que el repo local demuestre un catálogo aprobado ya existente.

### Risk 20: duplicate expense deduplicado incorrectamente

- Probability: Low.
- Impact: High.
- Mitigation: no uniqueness por amount/date/description; cada POST válido crea una fila.

### Risk 21: migrations públicas cacheadas no reflejan develop real

- Probability: High según auditoría.
- Impact: Critical.
- Mitigation: preflight local obligatorio de migrations/snapshot antes de generar una nueva.

### Risk 22: change altera Product precision accidentalmente

- Probability: Medium.
- Impact: High.
- Mitigation: no modificar `MinStock` ni otras columnas Catalog existentes salvo necesidad explícita de este change.

### Risk 23: consulta de historial causa N+1 para actor/product/unit

- Probability: Medium.
- Impact: Medium.
- Mitigation: proyección server-side/batched query siguiendo patrón EF real.

## Rollback Strategy

- No modificar migrations históricas.
- Crear una migration nueva únicamente para schema faltante.
- En DB descartable sin datos reales, `Down` SHOULD poder retirar exclusivamente tablas/constraints/indexes añadidos por el change.
- Una vez existan InventoryMovement/Expense reales, NO realizar rollback destructivo que borre ledger/gastos; preferir migration correctiva.
- Nunca reconstruir InventoryBalance desde un valor arbitrario durante rollback.
- No eliminar movimientos para “revertir” balance.
- No activar/desactivar Products como parte de rollback.
- No crear ni borrar Shift ficticio.
- Las policies/endpoints pueden retirarse sin borrar datos.
- Frontend no requiere rollback porque debe permanecer sin cambios.

## Success Criteria

- Inventory y Expenses permanecen separados por capability.
- InventoryBalance existe o se reutiliza.
- InventoryMovement existe o se reutiliza.
- Products sin balance aparecen con zero.
- ENTRY aumenta saldo.
- WRITE_OFF disminuye saldo.
- Stock negativo persiste.
- Manual request nunca controla signo.
- Reason manual es obligatorio.
- Movimiento conserva actor, timestamp y origen manual.
- Product inactivo no acepta nuevos manual movements.
- Histórico de Product inactivo permanece.
- Ledger no posee update/delete endpoints.
- Low-stock contiene `minStock` + `isLowStock`.
- `isLowStock` no está persistido.
- First-balance race produce una sola fila.
- Concurrencia no pierde updates.
- Expense se registra.
- Category puede ser null.
- Category inactiva se rechaza.
- CashSource es enum cerrado.
- expenseDate futura se rechaza.
- CreatedAt y expenseDate permanecen separados.
- Actor viene del principal.
- Shift se resuelve server-side o queda null según baseline real.
- Expense no cambia caja.
- No existe GET Expenses/HU-021.
- No Expense update/delete.
- No SignalR.
- No generated TypeScript.
- Migration limpia PASS.
- PostgreSQL tests PASS.
- Full backend regression PASS.
- Build PASS.
- Security review PASS.
- HU-005/HU-020 quedan `BACKEND COMPLETE / FRONTEND PENDING`.
