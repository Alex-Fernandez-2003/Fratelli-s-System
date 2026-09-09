# Proposal

## Problem Statement

Sprint 3 necesita un dataset histórico de demostración suficientemente amplio y coherente para validar y demostrar:

- HU-028 — Historial de cierres de caja.
- HU-029 — Reporte de ventas.
- HU-030 — Reporte de inventario.
- HU-031 — Reporte de asistencia.

El dataset debe cubrir tres meses completos de operación:

- 2026-06-01.
- 2026-06-30.
- 2026-07-01.
- 2026-07-31.
- 2026-08-01.
- 2026-08-31.

Total objetivo:

`92 BusinessDates`

No debe introducir actividad operacional de septiembre de 2026.

El problema no se resuelve insertando totales de reportes o filas aisladas. Los resultados de HU-028/HU-029/HU-030/HU-031 deben emerger de registros canónicos coherentes de:

- Customers.
- Orders.
- OrderItems.
- Sales.
- SaleItems.
- Purchases.
- PurchaseItems.
- PurchaseReceipts.
- PurchaseReceiptLines.
- Production.
- ProductionConsumption.
- InventoryMovement.
- InventoryBalance.
- Expenses.
- CashSessions.
- Shifts.
- ShiftAssignments.
- AttendanceRecords.
- CashClosings.

La migración futura será DATA-ONLY:

- Entity model: `UNCHANGED`.
- Schema: `UNCHANGED`.
- Tables: `UNCHANGED`.
- Columns: `UNCHANGED`.
- Indexes: `UNCHANGED`.
- Constraints: `UNCHANGED`.
- Frontend: `UNCHANGED`.
- Generated API: `UNCHANGED`.
- Packages: `UNCHANGED`.

### Local Baseline Limitation

No existe acceso desde esta generación al working tree LOCAL REAL.

Por tanto:

- Branch: `UNVERIFIED_LOCAL`.
- HEAD: `UNVERIFIED_LOCAL`.
- Working tree: `UNVERIFIED_LOCAL`.
- Staged: `UNVERIFIED_LOCAL`.
- Unstaged: `UNVERIFIED_LOCAL`.
- Untracked: `UNVERIFIED_LOCAL`.

La futura fase explore MUST revalidar esos datos antes de crear la migration.

### Secondary Repository Audit

La rama pública `develop`, utilizada únicamente como evidencia secundaria, contiene una migration de demo previa denominada `AddComprehensiveDemoData` y documentación específica de su dataset. Esa migration ya utiliza datos deterministas, fechas fijas, IDs estables, `Up`/`Down` reversibles y una condición basada en el nombre de la base para evitar contaminar bases de tests. citeturn439384view0turn570830view0turn512094view5

La seed existente ya garantiza, dentro de su contexto de demo:

- 4 Users demo.
- 4 Employees.
- 20 Products.
- 10 Customers.
- 4 Suppliers.
- 4 ExpenseCategories.
- 6 ProductCompositions.
- 12 Productions.
- 10 Purchases.
- 25 Sales.
- 10 Expenses.
- 5 CashSessions.
- 10 Shifts.
- 5 CashClosings.
- Inventory states NORMAL/LOW/NEGATIVE.
- ejemplos de punctualidad, lateness y ausencia derivable.
- CASH/QR/EXTERNAL.
- DIRECT/PEDIDOSYA.
- diferencias de caja balanceadas, positivas y negativas. citeturn439384view0

La migration previa usa, entre otras, cinco BusinessDates con CashSession/CashClosing existentes en julio de 2026. Esos registros son un punto crítico de reconciliación: la nueva migration MUST NOT crear una segunda CashSession para esas mismas fechas ni insertar nuevas Sales/Expenses que vuelvan incoherente un CashClosing previo. citeturn439384view0

El modelo público actual también confirma invariantes relevantes:

- `CashSession.BusinessDate` es único.
- `CashClosing.CashSessionId` es único.
- Customer CI y NIT poseen restricciones de unicidad.
- Production BatchCode es único.
- Production solo admite `COMPLETED`.
- PurchaseReceipt es único por Purchase.
- Sale tiene OrderId único.
- InventoryMovement usa tipos controlados.
- Shift es único por `CashSessionId + Type`.
- ShiftAssignment es único por `ShiftId + EmployeeId`.
- Attendance tiene restricciones específicas sobre registros abiertos.
- CashClosing persiste el snapshot monetario requerido para historia. citeturn898165view0turn944424view0

Las Categories y Units base poseen IDs estables sembrados previamente, por lo que son candidatos preferentes para reutilización frente a crear un segundo sistema de catálogo. citeturn242822view0

### Parallel Block 5 Dependency

HU-029/HU-030/HU-031 poseen backend Sprint 3 documentado en la rama pública, pero Block 5 puede estar siendo reconciliado en un workstream local no visible desde este entorno. La evidencia pública todavía refleja contratos que no satisfacen todas las decisiones finales del Block 5, especialmente Shift/Channel en HU-029 y Shift/summary/attendance derivation en HU-031. citeturn439384view1turn757125view0turn757125view1

Por tanto:

`APPLY_DEPENDS_ON_BLOCK_5_BACKEND_RECONCILIATION`

Esto NO bloquea el diseño de la seed.

Sí bloquea la creación final de la migration hasta comprobar los contratos backend locales definitivos.

### Generator Verdict

`SPRINT_3_REPORTING_SEED_OPENSPEC_READY`

Product decisions required:

`NONE`

Apply readiness actual:

`READY_FOR_REPORTING_SEED_APPLY: NO`

Razón:

- baseline local todavía no auditado;
- contrato final Block 5 todavía debe reconciliarse localmente;
- el diseño puede completarse sin inventar una decisión de producto.

## Goals

- Diseñar UNA migration EF Core DATA-ONLY.
- Cubrir exactamente el período operacional 2026-06-01 a 2026-08-31.
- Mantener septiembre 2026 libre de actividad operacional de esta seed.
- Conseguir cobertura combinada de 92 BusinessDates.
- Reutilizar datos garantizados por migrations anteriores únicamente cuando sea temporal y semánticamente seguro.
- Crear master data propio de esta migration cuando la reutilización genere inconsistencias históricas.
- Usar IDs deterministas y ownership inequívoco.
- Crear variación determinista sin randomness.
- Crear aproximadamente 1,200–1,800 Sales.
- Crear aproximadamente 3,000–5,000 líneas de Order/Sale.
- Crear aproximadamente 150–250 Expenses.
- Crear aproximadamente 30–50 Purchases.
- Crear aproximadamente 200–400 Production events.
- Crear aproximadamente 700–1,000 ShiftAssignments/Attendance records combinados.
- Mantener aproximadamente una CashSession y CashClosing por BusinessDate.
- Generar Sales significativas en MORNING y NIGHT.
- Generar Sales significativas en DIRECT y PEDIDOSYA.
- Generar CASH, QR y EXTERNAL durante los tres meses.
- Mantener PaymentMethod y SalesChannel como dimensiones independientes.
- Construir totals de Sale desde sus líneas.
- Mantener inventory movements y balances reconciliados.
- Terminar el período con ejemplos NORMAL, LOW y NEGATIVE.
- Generar Purchases/Receipts y Production suficientes para explicar reposición y consumo.
- Generar Attendance que derive naturalmente lateness, absence, workedMinutes y projectedPay.
- Generar CashClosing snapshots coherentes con las Sales/Expenses/opening/handover del mismo BusinessDate.
- Generar cierres:
  - balanceados;
  - con sobrante;
  - con faltante.
- Diseñar golden cases con valores exactos para verificación.
- Garantizar `Down` exacto y no destructivo.
- Evitar contaminación inaceptable de integration tests.
- Validar posteriormente HU-028/HU-029/HU-030/HU-031 con datos reales derivados.

## Why One Change

La migration representa un único dataset histórico.

Separarla artificialmente en migrations independientes por HU produciría riesgos de incoherencia entre:

- Sales y CashClosing.
- Purchases/Production y Inventory.
- Shifts/Assignments y Attendance.
- BusinessDate y report filters.

El conjunto tiene una única responsabilidad:

`crear una historia operacional coherente de tres meses para reporting`

La migration puede organizar internamente sus inserts por fases, pero debe mantenerse como UNA migration DATA-ONLY.

## Non-Goals

- No modificar entidades.
- No modificar `ApplicationDbContext`.
- No modificar configurations.
- No crear tablas.
- No crear columnas.
- No crear índices.
- No modificar constraints.
- No modificar APIs.
- No implementar Block 5.
- No modificar HU-028.
- No modificar frontend.
- No modificar generated TypeScript.
- No instalar NuGet packages.
- No instalar frontend packages.
- No implementar CSV.
- No implementar XLSX.
- No implementar PDF.
- No crear report totals desconectados.
- No insertar lateCount directamente.
- No insertar absenceCount directamente.
- No insertar projectedPay como fixture desconectado si el backend lo deriva.
- No crear September CashSessions.
- No crear September Shifts.
- No crear September Sales.
- No crear September Expenses.
- No crear September Attendance.
- No crear September CashClosings.
- No depender de datos creados manualmente.
- No usar randomness.
- No usar wall-clock time.
- No usar `Guid.NewGuid()`.
- No usar `NOW()`/`CURRENT_TIMESTAMP` como generador de la estructura histórica.
- No crear CAJERO.
- No crear TAKE_AWAY.
- No crear CARD/TARJETA salvo cambio real de enum.
- No crear Tips/Propinas.
- No inventar estados de Attendance.
- No reescribir la migration demo anterior.
- No modificar registros propiedad de migrations previas para acomodar esta seed.
- No ejecutar APPLY, database update, commit, push o archive durante esta generación.

## Affected Areas

Áreas probables del futuro APPLY:

- migrations del proyecto Infrastructure real;
- designer generado de la migration;
- migration-specific verification/tests si la convención local los contiene;
- documentación del demo dataset;
- artifacts OpenSpec de apply/verify.

Áreas auditadas pero no modificadas:

- `ApplicationDbContext`.
- entity configurations.
- Operations/report services.
- generated API.
- Block 5 OpenSpec.
- integration-test database setup.
- existing comprehensive demo migration.
- HU-028/HU-029/HU-030/HU-031 docs.

Frontend:

`NO CHANGES`

## Assumptions

1. La migration anterior `AddComprehensiveDemoData` continúa antes de esta migration en la cadena local. Esto MUST confirmarse.
2. El mecanismo actual para distinguir la demo DB de las integration-test DBs sigue existiendo y es intencional. Esto MUST confirmarse.
3. Las cinco CashSessions históricas de la seed anterior permanecen con sus CashClosings coherentes. La nueva seed no las modificará.
4. Los IDs de Categories/Units base observados públicamente continúan estables localmente.
5. Block 5 podrá estar aún en paralelo; el APPLY esperará su contrato backend final.
6. La nueva migration podrá crear master data propio con fechas fijas anteriores a 2026-06-01 si reutilizar master data de agosto produciría una cronología absurda.
7. Los volúmenes solicitados son objetivos de realismo, no assertions exactas.
8. La base demo objetivo puede ejecutarse en un ambiente disposable para validar Up/Down.
9. No se asume que el modelo público refleje exactamente el último working tree.

## Risks

### Risk 1: Colisión con la demo migration existente

- Probability: High.
- Impact: High.
- Mitigation: Auditar IDs/BusinessDates existentes; reservarlos; no duplicar CashSession; no añadir operaciones que invaliden snapshots previos.

### Risk 2: Modificar datos propiedad de una migration anterior

- Probability: Medium.
- Impact: High.
- Mitigation: Tratar las filas anteriores como read-only; esta migration crea y elimina únicamente su propio namespace de datos.

### Risk 3: Master data temporalmente incoherente

- Probability: High si se reutilizan Products/Customers creados en agosto para operaciones de junio.
- Impact: Medium.
- Mitigation: Reutilizar solo master data temporalmente neutro/garantizado; crear master data propio con timestamps pre-período cuando sea necesario.

### Risk 4: CashClosing pierde coherencia con Sales/Expenses

- Probability: Medium.
- Impact: Critical.
- Mitigation: Derivar CashClosing desde las mismas rows seeded y no mantener totals independientes.

### Risk 5: Double counting de carried forward

- Probability: Medium.
- Impact: High.
- Mitigation: Copiar exactamente la semántica del backend final; no sumar `cashAmountCarriedForward` como ingreso adicional.

### Risk 6: Sale header/lines divergence

- Probability: Medium.
- Impact: High.
- Mitigation: Derivar Subtotal/Total mediante la misma CTE/data source que genera SaleItems.

### Risk 7: Payment y Channel acoplados artificialmente

- Probability: Medium.
- Impact: Medium/High.
- Mitigation: Usar funciones deterministas independientes para cada dimensión y golden case que pruebe múltiples combinaciones.

### Risk 8: InventoryBalance no coincide con InventoryMovement

- Probability: High por inserción directa.
- Impact: Critical.
- Mitigation: Construir ambos desde el mismo ledger determinista y verificar reconciliación.

### Risk 9: Production consume stock imposible

- Probability: Medium.
- Impact: High.
- Mitigation: Planificar compras/stock inicial antes de production; validar balances por componente en orden temporal.

### Risk 10: Venta produce double inventory application

- Probability: Medium.
- Impact: Critical.
- Mitigation: Auditar exactamente qué persistence representa Sale y movimientos; aplicar cada delta una sola vez.

### Risk 11: PurchaseReceipt no coincide con movement

- Probability: Medium.
- Impact: High.
- Mitigation: Receipt lines y PURCHASE_RECEIPT movements se derivan de una misma tabla/CTE intermedia.

### Risk 12: Ausencias falsas

- Probability: Medium.
- Impact: High.
- Mitigation: Crear ShiftAssignment real y omitir CheckIn únicamente cuando la regla backend derive ausencia.

### Risk 13: Lateness incorrecta

- Probability: Medium.
- Impact: High.
- Mitigation: Usar snapshot real de planned start/tolerance; golden case en límite y +1 minuto.

### Risk 14: Open Attendance histórico

- Probability: Low/Medium.
- Impact: High.
- Mitigation: Toda Attendance existente de junio-agosto generada como closed o absent-by-assignment.

### Risk 15: projectedPay incoherente

- Probability: Medium.
- Impact: High.
- Mitigation: No seedear totals de payroll; dejar que backend derive desde workedMinutes + HourlyRate.

### Risk 16: Block 5 final cambia filtros

- Probability: Medium.
- Impact: High.
- Mitigation: `APPLY_DEPENDS_ON_BLOCK_5_BACKEND_RECONCILIATION`.

### Risk 17: HU-029 usa semántica de período distinta de BusinessDate

- Probability: Medium según evidencia pública.
- Impact: High.
- Mitigation: No aplicar seed hasta verificar contrato final; golden tests comparan summary/series/channel con BusinessDate.

### Risk 18: Integration tests contaminados

- Probability: Medium hasta auditar local.
- Impact: High.
- Mitigation: Reutilizar únicamente la estrategia de demo-DB gating si sigue siendo convención estable; verificar cómo cada suite crea su DB antes del APPLY.

### Risk 19: Database-name gate frágil

- Probability: Low/Medium.
- Impact: Medium.
- Mitigation: Confirmar que es convención existente y que demo/test database naming sigue igual; no inventar un segundo mecanismo.

### Risk 20: `Down` elimina datos manuales

- Probability: Low si ownership se implementa correctamente.
- Impact: Critical.
- Mitigation: Eliminar exclusivamente deterministic owned IDs; nunca por rango de fecha solamente.

### Risk 21: IDs deterministas colisionan

- Probability: Low.
- Impact: High.
- Mitigation: Reservar namespace de UUID después de collision audit y verificar ausencia antes del insert.

### Risk 22: Dataset excesivamente uniforme

- Probability: Medium.
- Impact: Medium.
- Mitigation: Variación determinista por month/weekday/date index/entity index.

### Risk 23: Dataset demasiado grande para test/migration

- Probability: Low/Medium.
- Impact: Medium.
- Mitigation: Set-based SQL, volúmenes acotados y nada de load-test scale.

### Risk 24: COCINA report no recibe datos útiles

- Probability: Medium hasta reconciliar HU-030.
- Impact: Medium.
- Mitigation: Verificación específica contra scope backend final y productos relevantes.

### Risk 25: Existing DB contiene datos manuales en junio-agosto

- Probability: Unknown.
- Impact: High.
- Mitigation: Preflight fail-fast para conflictos no pertenecientes a seeds garantizadas; no mergear silenciosamente datos arbitrarios.

### Risk 26: PostgreSQL-specific SQL usa feature no disponible

- Probability: Low.
- Impact: High.
- Mitigation: Limitarse a features garantizadas por versión objetivo y evitar extensiones opcionales para UUIDs.

## Rollback Strategy

La reversión se realiza exclusivamente mediante `Down`.

`Down` MUST:

1. utilizar el mismo seed ownership namespace que `Up`;
2. identificar exactos IDs creados por esta migration;
3. eliminar hijos antes que padres;
4. eliminar CashClosings propios;
5. eliminar AttendanceRecords/ShiftAssignments propios;
6. eliminar SaleItems/Sales/OrderItems/Orders propios;
7. eliminar ProductionConsumption/Production propios;
8. eliminar PurchaseReceiptLines/Receipts/PurchaseItems/Purchases propios;
9. eliminar Expenses propios;
10. eliminar InventoryMovements/InventoryBalances propios;
11. eliminar Shifts/CashSessions propios;
12. eliminar Customers/Employees/Users/Products/Suppliers/Categories auxiliares únicamente si fueron creados por esta migration;
13. dejar intactos CatalogSeeds;
14. dejar intacta `AddComprehensiveDemoData`;
15. dejar intactos datos manuales.

Forbidden rollback:

- `TRUNCATE`.
- `DELETE FROM <table>` sin ownership.
- `DELETE ... WHERE BusinessDate BETWEEN '2026-06-01' AND '2026-08-31'` como único criterio.

Si `Down` exacto no puede garantizarse después de auditar el schema real:

APPLY MUST NOT proceed.

## Success Criteria

El change está correctamente diseñado cuando:

- existe una estrategia data-only sin model/schema change;
- ownership de todas las filas nuevas es exacto;
- Block 5 dependency está explícita;
- el rango contiene 92 fechas y cero actividad operacional seed propia en septiembre;
- se evita conflicto con los BusinessDates de la seed anterior;
- los IDs son deterministas;
- no se usa randomness ni wall clock;
- Sales cubren ambos Shifts;
- Sales cubren DIRECT/PEDIDOSYA;
- Sales cubren CASH/QR/EXTERNAL;
- Payment/Channel son independientes;
- cada mes posee Sales > 0;
- Inventory final posee NORMAL/LOW/NEGATIVE;
- Attendance genera late > 0;
- Attendance genera absence > 0;
- Attendance genera workedMinutes > 0;
- Attendance genera projectedPay > 0 mediante backend;
- los históricos quedan cerrados;
- CashClosing contiene Balanced/Surplus/Shortage;
- observation acompaña diferencias no cero;
- Purchases/Receipts son consistentes;
- Production/consumption son consistentes;
- Inventory ledger y balance pueden reconciliarse;
- no se modifica frontend;
- no se modifica generated API;
- no se crean packages;
- una clean demo DB puede aplicar toda la cadena;
- una disposable current-baseline DB puede aplicar la migration;
- Down elimina exclusivamente esta seed;
- re-Up reproduce el mismo dataset lógico;
- HU-028/HU-029/HU-030/HU-031 pueden verificarse sobre el dataset;
- integration tests no quedan contaminados de forma inaceptable.

Product decision:

`NONE`

Technical dependency before APPLY:

`APPLY_DEPENDS_ON_BLOCK_5_BACKEND_RECONCILIATION`
