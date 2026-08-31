# Spec

## Requirements

### Cross-cutting Backend Requirements

- [SHARED] El sistema MUST reutilizar las foundations existentes de Sprint 1/2 cuando satisfagan el comportamiento requerido.
- [SHARED] El sistema MUST NOT crear una segunda autoridad de inventario.
- [SHARED] Toda modificación real de stock MUST continuar pasando por el writer/service de inventario canónico.
- [SHARED] Los endpoints de consulta MUST NOT modificar inventario.
- [SHARED] Las consultas históricas potencialmente grandes MUST usar paginación server-side según la convención local.
- [SHARED] Las consultas históricas SHOULD ordenar por datos más recientes primero salvo que un endpoint documente explícitamente otro orden.
- [SHARED] Los cálculos que afectan autorización, caja, asistencia, tardanza, ausencia o payroll projection MUST ejecutarse en backend.
- [SHARED] El backend MUST utilizar `America/La_Paz` mediante el business clock existente o equivalente para BusinessDate.
- [SHARED] El frontend MUST NOT ser autoridad de timestamps de negocio.
- [SHARED] Los importes monetarios MUST usar representación decimal y MUST NOT usar float/double.
- [SHARED] Las cantidades de inventario MUST preservar la precisión/unidad existente y MUST NOT adoptar la escala monetaria por conveniencia.
- [SHARED] Los usuarios multi-role MUST recibir la unión de las capacidades de todos sus roles.
- [SHARED] Un filtro suministrado por el cliente MUST NOT ampliar el alcance autorizado de una consulta.
- [SHARED] Los endpoints nuevos MUST seguir el contrato ProblemDetails/error actual.
- [SHARED] Las rutas y HTTP verbs Sprint 1/2 existentes MUST permanecer compatibles salvo imposibilidad técnica explícitamente aprobada.
- [SHARED] Los cambios de DTO SHOULD ser aditivos.
- [SHARED] El change MUST NOT implementar frontend React productivo.
- [SHARED] El change MUST NOT implementar generación backend de PDF, CSV, XLSX ni archivos de reporte.
- [SHARED] Runtime OpenAPI MUST corresponder al contrato backend final antes de regenerar TypeScript.
- [SHARED] El archivo TypeScript generado MUST NOT editarse manualmente.

### HU-008 — Production History

- [HU-008] Cada Production MUST disponer de un BatchCode backend-generated y único si el baseline local todavía carece de uno.
- [HU-008] BatchCode MUST representar trazabilidad y MUST NOT actuar como autoridad de inventario por lote.
- [HU-008] Cada Production completada MUST exponer/persistir Status `COMPLETED` o el valor equivalente aprobado.
- [HU-008] El sistema MUST NOT introducir estados de Production sin comportamiento sustentado.
- [HU-008] Las Production históricas preexistentes MUST preservarse.
- [HU-008] Las Production históricas preexistentes MUST obtener un BatchCode único mediante backfill determinístico si la migration lo requiere.
- [HU-008] Las Production preexistentes MUST ser clasificadas como `COMPLETED`.
- [HU-008] El historial MUST permitir consultar ProductionId, BatchCode, Status, preparación/producto, cantidad producida, unidad, ProducedAt, responsable y Notes cuando existan.
- [HU-008] El detalle MUST incluir las cantidades realmente consumidas registradas en ProductionConsumption.
- [HU-008] Cambiar posteriormente ProductComposition MUST NOT modificar los consumos históricos de una Production.
- [HU-008] COCINA MUST poder consultar el historial completo de Production dentro de esta HU.
- [HU-008] ADMINISTRADOR, ENCARGADO y CONTADORA MUST poder consultar según la matriz aprobada.
- [HU-008] Los endpoints GET de history/detail MUST NOT generar InventoryMovement.
- [HU-008] El backend MAY soportar filtros por producto, BatchCode, Status, responsable y periodo cuando el modelo local permita proyecciones eficientes.
- [HU-008] El sistema MUST NOT implementar FIFO, FEFO, expiración ni remaining quantity por BatchCode.

### HU-014 — Customers

- [HU-014] Customer.Name MUST ser requerido y no vacío.
- [HU-014] Customer.CI MUST ser requerido para nuevos Customers.
- [HU-014] Customer.CI MUST normalizarse como mínimo mediante trim antes de persistirse/compararse.
- [HU-014] Customer.CI MUST ser único incluyendo Customers inactivos.
- [HU-014] La unicidad de CI MUST estar reforzada por PostgreSQL.
- [HU-014] Customer.CI MUST NOT restringirse artificialmente a digits-only.
- [HU-014] Customer.NIT MAY ser null.
- [HU-014] Customer.NIT, cuando exista, MUST ser único incluyendo Customers inactivos.
- [HU-014] `null` NIT MUST conservarse como null y MUST NOT normalizarse a cadena vacía.
- [HU-014] Customer.Name MUST NOT ser unique.
- [HU-014] Customer MUST usar desactivación/activación y MUST NOT perderse mediante hard delete ordinario.
- [HU-014] La búsqueda MUST soportar Name, CI y NIT dentro del alcance autorizado.
- [HU-014] ADMINISTRADOR y ENCARGADO MUST poder leer, crear, editar y cambiar el estado activo de Customer.
- [HU-014] MESERO MUST poder leer, crear y editar Customer.
- [HU-014] MESERO MUST NOT activar/desactivar Customer.
- [HU-014] Un Customer inactivo MUST permanecer visible en contexto histórico autorizado.
- [HU-014] Un Customer inactivo MUST NOT poder asociarse a una nueva Sale.
- [HU-014] ConfirmSale MAY recibir CustomerId.
- [HU-014] ConfirmSale MUST aceptar una Sale sin Customer.
- [HU-014] Una vez confirmada la Sale, su CustomerId/snapshot MUST NOT poder cambiarse mediante una mutation de Sprint 3.
- [HU-014] El sistema MUST NOT introducir `PATCH /sales/{id}/customer` o capacidad equivalente.

### Sale Customer Snapshot

- [HU-014][HU-015] Una Sale confirmada con Customer MUST persistir CustomerId y snapshots de Name, CI y NIT.
- [HU-014][HU-015] Los snapshots MUST reflejar los datos al momento de confirmación.
- [HU-014][HU-015] Editar posteriormente Customer MUST NOT alterar los snapshots históricos.
- [HU-014][HU-015] Las Sales históricas sin Customer MUST continuar siendo válidas.

### HU-015 — Sales History

- [HU-015] El historial MUST incluir únicamente Sales confirmadas.
- [HU-015] Orders sin Sale MUST NOT aparecer como venta histórica.
- [HU-015] El listado MUST proporcionar al menos SaleId, timestamp, BusinessDate, Shift, SalesChannel, PaymentMethod, Total, Customer snapshot opcional y responsable.
- [HU-015] El detalle MUST incluir SaleItems con Quantity, UnitPrice y LineTotal históricos.
- [HU-015] Los medios soportados MUST conservar `CASH`, `QR`, `EXTERNAL` salvo nombres técnicos equivalentes ya existentes.
- [HU-015] Los canales soportados MUST conservar `DIRECT`, `PEDIDOSYA` salvo nombres técnicos equivalentes ya existentes.
- [HU-015] `PEDIDOSYA` MUST NOT tratarse como PaymentMethod.
- [HU-015] ADMINISTRADOR, ENCARGADO y CONTADORA MUST poder consultar el alcance general autorizado.
- [HU-015] MESERO MUST poder consultar únicamente Sales pertenecientes al Shift actual al que está asignado.
- [HU-015] MESERO MUST NOT ampliar su scope indicando otro Shift o Employee en filtros.
- [HU-015] Un usuario con MESERO y un rol de mayor alcance MUST recibir la unión de capacidades.
- [HU-015] Los filtros MUST intersectarse con el row-level authorization scope antes de paginar.

### HU-019 — Purchase History

- [HU-019] El historial MUST reutilizar Purchase/PurchaseItem/PurchaseReceipt existentes.
- [HU-019] El sistema MUST NOT crear un segundo modelo de receipt para satisfacer history.
- [HU-019] ADMINISTRADOR y ENCARGADO MUST poder consultar todas las compras autorizadas.
- [HU-019] CONTADORA MUST disponer de lectura general y MUST NOT obtener mutations por esta HU.
- [HU-019] COCINA MUST consultar únicamente PurchaseArea `KITCHEN` o el equivalente técnico confirmado localmente.
- [HU-019] MESERO y EMPLEADO MUST NOT obtener acceso a Purchase history por esta HU.
- [HU-019] El listado MUST exponer PurchaseId, date, Supplier, PurchaseArea, Status, Total y responsible.
- [HU-019] El detalle MUST preservar unidades ordenadas, recepción real, cancellation y receipt information que ya existan.
- [HU-019] Los filtros MAY incluir periodo, Status, Supplier, PurchaseArea y Responsible.
- [HU-019] Las consultas MUST ser read-only.

### HU-021 — Expense History

- [HU-021] ADMINISTRADOR, ENCARGADO y CONTADORA MUST poder consultar Expense history.
- [HU-021] CONTADORA MUST permanecer read-only.
- [HU-021] El listado MUST incluir identidad, fecha, descripción, categoría, CashSource, amount, responsible y contexto de Shift/BusinessDate cuando exista.
- [HU-021] El backend MUST conservar los CashSource existentes y MUST NOT inventar valores para reportes.
- [HU-021] Los filtros MAY incluir periodo, categoría, CashSource, Responsible y Shift.
- [HU-021] Si el contrato expone aggregates, éstos MUST calcularse sobre el conjunto filtrado completo y MUST NOT limitarse a la página actual.

### Work Schedule Foundation

- [HU-024][HU-031] El sistema MUST persistir una configuración efectiva por ShiftType o reutilizar un modelo equivalente existente.
- [HU-024][HU-031] La configuración inicial MUST representar MORNING 08:00–12:00, NIGHT 18:00–22:00 y tolerancia de 10 minutos.
- [HU-024][HU-031] ADMINISTRADOR y ENCARGADO MUST poder consultar/actualizar la configuración.
- [HU-024][HU-031] La configuración MUST validar horas válidas, start distinto de end y tolerancia no negativa.
- [HU-024][HU-031] ShiftAssignment MUST continuar siendo la programación de Employee.
- [HU-024][HU-031] El sistema MUST NOT crear un segundo scheduler de empleados.
- [HU-024][HU-031] El horario efectivo usado por una asignación histórica MUST permanecer estable aunque se edite posteriormente la configuración global.
- [HU-024][HU-031] La implementación SHOULD guardar el snapshot efectivo sobre ShiftAssignment o reutilizar un mecanismo versionado equivalente.

### Late Semantics

- [HU-024][HU-031] PlannedStart MUST derivarse de BusinessDate + start efectivo del ShiftAssignment.
- [HU-024][HU-031] ActualDelayMinutes MUST ser `max(0, CheckIn - PlannedStart)`.
- [HU-024][HU-031] IsLate MUST ser true únicamente cuando ActualDelayMinutes sea estrictamente mayor que LateToleranceMinutes.
- [HU-024][HU-031] Un check-in exactamente a los 10 minutos con tolerance 10 MUST NOT ser late.
- [HU-024][HU-031] Un check-in a los 11 minutos MUST ser late.
- [HU-024][HU-031] LateMinutes MAY mostrar el retraso real desde PlannedStart y MUST NOT necesitar restar la tolerancia.

### Absence Semantics

- [HU-024][HU-031] Una ausencia MUST requerir un ShiftAssignment esperado.
- [HU-024][HU-031] Una ausencia MUST requerir que el periodo programado ya haya terminado/completado.
- [HU-024][HU-031] Una ausencia MUST requerir ausencia de check-in válido.
- [HU-024][HU-031] Un empleado sin ShiftAssignment MUST NOT clasificarse ausente.
- [HU-024][HU-031] Un empleado todavía dentro de un Shift activo MUST NOT clasificarse ausente por no haber marcado entrada.
- [HU-024][HU-031] Un empleado con check-in válido MUST NOT clasificarse ausente.
- [HU-024][HU-031] Un evento ABSENT MUST NOT contarse también como late.
- [HU-024][HU-031] La query administrativa MUST considerar ShiftAssignments además de AttendanceRecords porque una ausencia puede no tener fila de AttendanceRecord.

### HU-023 — Own Attendance

- [HU-023] El sistema MUST reutilizar el endpoint self-history existente si sigue presente localmente.
- [HU-023] El self-history MUST filtrar por la identidad Employee del usuario autenticado.
- [HU-023] El self-history MUST NOT aceptar un EmployeeId que permita consultar otra persona.
- [HU-023] El comportamiento para usuario no vinculado a Employee MUST preservar el contrato local existente; si continúa siendo 404, MUST mantenerse.
- [HU-023] El change MUST NOT crear un segundo endpoint `/attendance/me`.

### HU-024 — Administrative Attendance

- [HU-024] ADMINISTRADOR, ENCARGADO y CONTADORA MUST poder consultar attendance general.
- [HU-024] La consulta MUST soportar el scope de Employee y periodo requerido.
- [HU-024] Cada fila MUST distinguir BusinessDate, Shift/ShiftType, planned start/end, CheckIn, CheckOut, lifecycle/attendance outcome, worked minutes, IsLate y LateMinutes cuando correspondan.
- [HU-024] Closed attendance MUST proporcionar WorkedMinutes estable.
- [HU-024] Un absent row MUST NOT fabricar CheckIn/CheckOut.
- [HU-024] El summary general MUST proporcionar totalRecords, openCount, closedCount y totalWorkedMinutes.
- [HU-024] El summary MUST incluir lateCount y absenceCount cuando el periodo consultado permita determinarlos.
- [HU-024] El endpoint MUST proporcionar summary por Employee con employeeId, fullName, workedMinutes, lateCount y absenceCount sobre el conjunto filtrado completo.

### Payroll Projection Foundation

- [HU-031] Employee MUST disponer de HourlyRate decimal.
- [HU-031] Existing Employees MUST recibir el default aprobado `20.00 BOB/hour` cuando el campo sea introducido.
- [HU-031] Sprint 3 MUST NOT implementar payroll transactions ni rate history.
- [HU-031] WorkedHours MUST derivarse como decimal `totalWorkedMinutes / 60`.
- [HU-031] ProjectedPay MUST derivarse como `workedHours × hourlyRate`.
- [HU-031] Solo records cerrados con duración determinada MUST aportar worked minutes al payroll estable.
- [HU-031] Un absent shift MUST aportar cero worked minutes y MUST NOT aplicar una penalización adicional.
- [HU-031] El backend MUST NOT aplicar bonos, impuestos ni descuentos en esta proyección.

### CashSession Opening and Handover

- [HU-026][HU-027] Un BusinessDate MUST continuar usando una única CashSession.
- [HU-026][HU-027] MORNING → NIGHT MUST ser handover dentro de esa misma CashSession.
- [HU-026][HU-027] El sistema MUST NOT crear un CashClosing al terminar MORNING.
- [HU-026][HU-027] Una nueva jornada MUST registrar openingAmount y pettyCashOpeningAmount mediante el flujo existente extendido si es necesario.
- [HU-026][HU-027] El handover MUST registrar cashRemovedAmount como dato estructurado; zero MUST ser válido.
- [HU-026][HU-027] El backend MUST calcular o validar cashAmountCarriedForward desde la posición efectiva y cashRemovedAmount.
- [HU-026][HU-027] El cálculo de cierre MUST NOT parsear HandoverNote para obtener importes.

### HU-026 — Closing Preview

- [HU-026] El preview MUST ser read-only y MUST NOT persistir CashClosing.
- [HU-026] El backend MUST calcular Sales y Expenses desde datos persistidos.
- [HU-026] El request MUST NOT aceptar como autoridad sales totals, payment totals, channel totals, expense total, expectedCash ni difference.
- [HU-026] El preview MUST distinguir PaymentMethod de SalesChannel.
- [HU-026] El payment breakdown MUST distinguir CASH, QR y EXTERNAL.
- [HU-026] El channel breakdown MUST distinguir DIRECT y PEDIDOSYA.
- [HU-026] PEDIDOSYA MUST NOT implicar EXTERNAL.
- [HU-026] El preview MUST exponer openingAmount, pettyCashOpeningAmount, cashRemovedAmount, Sales total, payment breakdown, channel breakdown, expense breakdown y expectedCash.
- [HU-026] ExpectedCash MUST derivar conceptualmente de openingAmount + pettyCashOpeningAmount + CASH Sales - physical-cash Expenses - cashRemovedAmount.
- [HU-026] QR y EXTERNAL MUST NOT incrementar expected physical cash.
- [HU-026] SalesChannel por sí solo MUST NOT incrementar expected physical cash.
- [HU-026] cashAmountCarriedForward MUST NOT sumarse nuevamente al cierre si ya es consecuencia de opening/sales/expenses/removal.

### HU-027 — Final Cash Closing

- [HU-027] Solo ADMINISTRADOR y ENCARGADO MUST poder ejecutar el cierre final.
- [HU-027] CONTADORA MUST NOT ejecutar la mutation de cierre.
- [HU-027] El request SHOULD contener únicamente declaredCash y observation opcional además de identificadores estrictamente necesarios por el contrato local.
- [HU-027] ExpectedCash MUST ser recalculado por backend dentro de la operación final.
- [HU-027] Difference MUST ser `declaredCash - expectedCash`.
- [HU-027] Observation MUST ser requerida cuando Difference sea distinta de cero.
- [HU-027] Observation MAY ser omitida cuando Difference sea exactamente cero.
- [HU-027] El backend MUST NOT aplicar una tolerancia monetaria silenciosa.
- [HU-027] CashClosing MUST ser único por CashSession.
- [HU-027] La operación MUST bloquear/revalidar la CashSession dentro de PostgreSQL.
- [HU-027] La creación del CashClosing, completion de NIGHT y cierre de CashSession MUST ser atómicos.
- [HU-027] Dos cierres concurrentes MUST producir como máximo un CashClosing exitoso.
- [HU-027] El segundo intento concurrente MUST devolver el conflicto de negocio según ProblemDetails/conventions existentes.
- [HU-027] CashClosing MUST persistir snapshots de CASH/QR/EXTERNAL.
- [HU-027] CashClosing MUST persistir snapshots de DIRECT/PEDIDOSYA.
- [HU-027] La suma del payment breakdown MUST reconciliar SalesTotal independientemente de la suma del channel breakdown.
- [HU-027] CashClosing MUST conservar responsable autenticado y closedAt backend.
- [HU-027] El sistema MUST NOT implementar firma gráfica, biométrica o hardware en Sprint 3.

### HU-028 — Closing History

- [HU-028] ADMINISTRADOR, ENCARGADO y CONTADORA MUST poder consultar cierres.
- [HU-028] CashClosing history MUST ser read-only.
- [HU-028] Un CashClosing MUST representar la CashSession/BusinessDate completa y MUST NOT representarse como cierre individual de MORNING o NIGHT.
- [HU-028] El historial MUST exponer snapshots persistidos y observation.
- [HU-028] El historial MUST preservar responsible identity de manera robusta frente a cambios futuros de perfil.
- [HU-028] CashClosing MUST NOT tener mutation ordinaria de edit/delete.

### HU-029 — Sales Report

- [HU-029] Sales report MUST ser un read model agregado sobre Sales confirmadas.
- [HU-029] Sales report MUST reuse el row-level scope de HU-015.
- [HU-029] MESERO MUST continuar limitado a su Shift actual asignado.
- [HU-029] El summary MUST incluir salesCount y totalAmount.
- [HU-029] El report MUST proporcionar payment breakdown CASH/QR/EXTERNAL.
- [HU-029] El report MUST proporcionar channel breakdown DIRECT/PEDIDOSYA.
- [HU-029] El report MUST proporcionar time series por BusinessDate con salesCount y totalAmount.
- [HU-029] El report MUST NOT persistir una entidad Report.
- [HU-029] El report MUST NOT generar archivos.

### HU-030 — Inventory Report

- [HU-030] El report MUST utilizar la autoridad Inventory existente.
- [HU-030] ADMINISTRADOR, ENCARGADO, COCINA y CONTADORA MUST poder consultar.
- [HU-030] MESERO MUST NOT obtener InventoryReport únicamente por tener InventoryRead.
- [HU-030] COCINA MUST consultar el mismo universo de productos activos autorizado para InventoryRead.
- [HU-030] Si quantity < 0, el estado primario MUST ser NEGATIVE.
- [HU-030] Un quantity negativo MUST continuar contando también dentro de low-stock totals.
- [HU-030] Si quantity >= 0 y minimumStock no es null y quantity <= minimumStock, el estado MUST ser LOW.
- [HU-030] Si quantity >= 0 y minimumStock es null, el estado MUST ser NORMAL.
- [HU-030] Si quantity < 0 y minimumStock es null, el estado MUST ser NEGATIVE y MUST continuar requiriendo atención como low stock.
- [HU-030] El report SHOULD reutilizar InventorySummary existente.
- [HU-030] El backend MUST NOT sumar cantidades heterogéneas como kg + litros + unidades.
- [HU-030] El report MUST ser point-in-time y MUST NOT introducir snapshots históricos de inventario.

### HU-031 — Attendance Report

- [HU-031] ADMINISTRADOR, ENCARGADO y CONTADORA MUST poder consultar reportes generales.
- [HU-031] Un usuario autenticado ligado a Employee sin capacidad general MUST poder consultar únicamente su propio reporte.
- [HU-031] Un Employee ordinario MUST NOT seleccionar otro EmployeeId para ampliar scope.
- [HU-031] El reporte MUST incluir totalWorkedMinutes, workedHours, lateCount, absenceCount, attendanceCount, HourlyRate y ProjectedPay.
- [HU-031] El reporte general MUST proporcionar resultados por Employee.
- [HU-031] El reporte MUST reutilizar las mismas reglas de late/absence/worked time de HU-024.
- [HU-031] El reporte MUST NOT generar payroll runs, pagos, recibos ni archivos.

## Behavior Scenarios

### Scenario 1: Historial de producción conserva consumos

Given una Production completada con consumos persistidos y una ProductComposition que después cambia  
When un usuario autorizado consulta el detalle histórico  
Then el sistema MUST devolver los consumos realmente registrados en ProductionConsumption y MUST NOT recalcularlos desde la receta actual

### Scenario 2: BatchCode histórico

Given una Production existente anterior a Sprint 3  
When se aplica la evolución de esquema aprobada  
Then la Production MUST conservarse, MUST obtener un BatchCode único y MUST quedar con Status COMPLETED

### Scenario 3: CI duplicado

Given un Customer activo o inactivo con un CI determinado  
When un usuario autorizado intenta crear otro Customer con el mismo CI normalizado  
Then la operación MUST ser rechazada y PostgreSQL MUST impedir la duplicación

### Scenario 4: NIT opcional

Given dos Customers sin NIT  
When ambos son creados con NIT null  
Then ambas operaciones MAY ser válidas y ninguna MUST persistir el NIT como cadena vacía

### Scenario 5: Customer snapshot

Given una Sale confirmada asociada a un Customer  
When posteriormente se edita Name, CI o NIT del Customer  
Then el historial de la Sale MUST conservar los valores snapshot capturados al confirmar

### Scenario 6: MESERO consulta Sales

Given un usuario con únicamente rol MESERO y una asignación al Shift actual  
When consulta Sales history con filtros que intentan seleccionar otro Shift  
Then el backend MUST devolver únicamente las Sales de su Shift actual autorizado

### Scenario 7: Usuario multi-role

Given un usuario con roles MESERO y ENCARGADO  
When consulta una capability donde ENCARGADO posee alcance general  
Then el backend MUST otorgar la unión de capacidades y MUST NOT restringirlo al scope MESERO

### Scenario 8: COCINA consulta compras

Given un usuario con únicamente rol COCINA  
When consulta Purchase history  
Then el backend MUST devolver únicamente las compras del PurchaseArea KITCHEN o equivalente confirmado

### Scenario 9: Historial propio de asistencia

Given un usuario autenticado asociado a un Employee  
When consulta el endpoint self-history  
Then el backend MUST devolver únicamente su asistencia sin aceptar otro EmployeeId

### Scenario 10: Límite de tolerancia de retraso

Given un ShiftAssignment MORNING con PlannedStart 08:00 y tolerance 10 minutos  
When CheckIn ocurre a las 08:10  
Then IsLate MUST ser false

### Scenario 11: Retraso después de tolerancia

Given el mismo ShiftAssignment  
When CheckIn ocurre a las 08:11  
Then IsLate MUST ser true y LateMinutes MUST reflejar 11 minutos de retraso real

### Scenario 12: Ausencia real

Given un Employee con ShiftAssignment cuyo horario efectivo ya terminó y sin CheckIn  
When se consulta el periodo administrativo  
Then el Employee MUST aparecer/count como ABSENT

### Scenario 13: No ausencia prematura

Given un Employee asignado a un Shift que todavía está activo  
When aún no existe CheckIn  
Then el sistema MUST NOT clasificarlo como ausencia final

### Scenario 14: Cambio de schedule

Given una asignación histórica con snapshot MORNING 08:00–12:00  
When un administrador cambia posteriormente MORNING a otro horario  
Then las métricas de tardanza/ausencia de la asignación histórica MUST permanecer sin cambios

### Scenario 15: Payroll projection exacta

Given 120 worked minutes cerrados y HourlyRate 20.00  
When se calcula ProjectedPay  
Then WorkedHours MUST ser 2.0 y ProjectedPay MUST ser 40.00 BOB

### Scenario 16: Payroll projection parcial

Given 90 worked minutes cerrados y HourlyRate 20.00  
When se calcula ProjectedPay  
Then WorkedHours MUST ser 1.5 y ProjectedPay MUST ser 30.00 BOB

### Scenario 17: Handover sin retiro

Given una CashSession abierta y un handover MORNING→NIGHT con cashRemovedAmount 0  
When el backend registra el handover  
Then la misma CashSession MUST continuar y el dinero disponible MUST transferirse conceptualmente sin crear un CashClosing

### Scenario 18: Preview no persiste

Given una CashSession lista para revisar  
When ADMINISTRADOR solicita el preview de HU-026  
Then el backend MUST calcular expected cash y MUST NOT crear un CashClosing

### Scenario 19: Payment versus channel

Given una Sale `PEDIDOSYA` pagada con `CASH`  
When se calcula preview/report/closing  
Then la Sale MUST incrementar el total PEDIDOSYA de canal y el total CASH de pago sin clasificarse como EXTERNAL

### Scenario 20: Cierre exacto

Given expectedCash 500.00 y declaredCash 500.00  
When ENCARGADO confirma el cierre sin observation  
Then Difference MUST ser 0 y el cierre MAY completarse

### Scenario 21: Diferencia sin observación

Given expectedCash 500.00 y declaredCash 490.00  
When ENCARGADO intenta cerrar sin observation  
Then la operación MUST ser rechazada y ningún CashClosing/Shift/CashSession parcial MUST quedar persistido

### Scenario 22: Cierre concurrente

Given una CashSession abierta y dos requests concurrentes válidos de cierre  
When ambos intentan adquirir el estado final  
Then exactamente uno MUST crear el CashClosing y el otro MUST recibir conflicto

### Scenario 23: Cash removed no es faltante

Given efectivo retirado durante handover y registrado como cashRemovedAmount  
When se calcula el cierre final  
Then ese importe MUST reducir expectedCash y MUST NOT aparecer como faltante por segunda vez

### Scenario 24: Reporte de ventas y scope

Given un MESERO con acceso solo a su Shift actual  
When consulta HU-029  
Then sus aggregates y time series MUST derivar únicamente de ese mismo scope

### Scenario 25: Inventario exactamente en mínimo

Given quantity igual a minimumStock  
When se consulta HU-030  
Then el producto MUST clasificarse LOW

### Scenario 26: Inventario negativo sin mínimo

Given quantity -2 y minimumStock null  
When se consulta HU-030  
Then el estado primario MUST ser NEGATIVE y el item MUST formar parte del conjunto que requiere atención low-stock

### Scenario 27: Reporte propio de asistencia

Given un usuario Employee-linked sin rol administrativo de attendance  
When intenta obtener HU-031 indicando otro Employee  
Then el backend MUST rechazar/ignorar el intento según el contrato y MUST NOT devolver datos ajenos

## Edge Cases

- Working tree local contiene migrations o contracts más nuevos que `develop` remoto.
- Customer ya existe localmente con esquema distinto al conceptual.
- Customer histórico existe sin CI.
- CI/NIT cambian solo en espacios iniciales/finales.
- Dos altas concurrentes intentan el mismo CI/NIT.
- Production existente sin BatchCode.
- ProductComposition cambia después de Production.
- Responsible Employee/User ha sido desactivado.
- Sale histórica no tiene Customer.
- Customer fue desactivado después de una Sale.
- MESERO no posee Shift actual.
- MESERO posee múltiples roles y uno amplía scope.
- COCINA filtra explícitamente un PurchaseArea fuera de su alcance.
- Expense page está vacía pero aggregate debe continuar en cero.
- Usuario `/attendance/me` no está ligado a Employee.
- Attendance abierta al final del periodo solicitado.
- Assignment existe, pero el Shift aún no terminó.
- Assignment histórico precede la introducción de schedule snapshots.
- Schedule se cambia después de asignar un Shift.
- CheckIn exactamente al límite de tolerancia.
- CheckIn antes de PlannedStart.
- Shift overnight no está soportado por el modelo actual; Sprint 3 defaults son same-day y no debe inventarse overnight.
- WorkedMinutes no divisible por 60.
- Historical Employee sin HourlyRate.
- CashSession histórica carece de opening money real.
- Handover histórico tiene únicamente note y no dato monetario estructurado.
- cashRemovedAmount 0.
- cashRemovedAmount parcial.
- cashRemovedAmount igual al efectivo disponible.
- Intento de retirar importe inválido respecto a posición física.
- QR/EXTERNAL Sales combinadas con PEDIDOSYA/DIRECT.
- Diferencia de caja positiva y negativa.
- Difference exactamente cero.
- Cierre repetido secuencial.
- Cierre simultáneo.
- CashSession ya cerrada.
- NIGHT no está en estado compatible.
- No existe CashClosing en historial.
- Report query con periodo sin registros.
- Aggregates deben usar conjunto filtrado completo, no solo page items.
- Negative inventory con MinStock null.
- Reporting de cantidades heterogéneas.
- CancellationToken durante query/transaction.

## Acceptance Criteria

- El baseline local MUST registrarse antes de la primera modificación: branch, HEAD, status y migration tip.
- Ninguna capability que ya exista localmente MUST duplicarse.
- HU-008 MUST disponer de pruebas de history, detail, filters, pagination, BatchCode uniqueness y consumption snapshot.
- Crear Customer con CI duplicado MUST fallar incluso bajo DB constraint.
- Dos Customers con NIT null MUST poder coexistir si PostgreSQL y el modelo local mantienen esa semántica.
- Una nueva Sale MUST rechazar Customer inactivo.
- Editar Customer después de una Sale MUST dejar inalterado el snapshot de la Sale.
- Sales history MUST excluir Orders sin Sale.
- MESERO MUST fallar cualquier test que demuestre acceso a Sales fuera de su Shift actual.
- COCINA MUST fallar cualquier test que demuestre acceso a Purchase history fuera de su área permitida.
- HU-023 MUST reutilizar la self-history existente cuando el local baseline la confirme.
- Tests determinísticos MUST demostrar 08:10 no late y 08:11 late con tolerance 10.
- Modificar schedule global MUST dejar inalterado un caso histórico previamente calculable.
- Assignment completado sin CheckIn MUST contarse absent; active Shift sin CheckIn MUST NOT contarse absent.
- HU-024 MUST devolver aggregates globales y por Employee sobre el conjunto filtrado completo.
- 90 worked minutes × 20.00 MUST producir 30.00 BOB sin truncamiento entero.
- Handover MUST conservar una CashSession única y MUST registrar cashRemovedAmount estructurado.
- HU-026 MUST poder ejecutarse repetidamente sin crear CashClosing.
- Los tests MUST demostrar que QR/EXTERNAL no incrementan physical expected cash.
- Los tests MUST demostrar que SalesChannel PEDIDOSYA no equivale a PaymentMethod EXTERNAL.
- Un cierre con difference != 0 sin observation MUST fallar sin persistencia parcial.
- Un test PostgreSQL concurrente MUST demostrar que solo existe un CashClosing por CashSession.
- CashClosing exitoso MUST dejar NIGHT completed y CashSession closed dentro de la misma transacción.
- HU-028 MUST continuar mostrando snapshots aunque entidades relacionadas cambien posteriormente.
- HU-029 MUST aplicar el mismo Sales scope que HU-015.
- HU-030 MUST clasificar `quantity == minimumStock` como LOW.
- HU-030 MUST clasificar quantity negativo como NEGATIVE e incluirlo en low-stock semantics.
- HU-031 MUST impedir cross-employee access a usuarios self-only.
- Ningún report endpoint MUST crear archivos ni registros Report.
- Ninguna ruta Sprint 1/2 MUST eliminarse o cambiar verb como parte normal del change.
- Las migrations MUST preservar todos los registros históricos existentes.
- Backend build/tests/OpenAPI y generated TypeScript MUST validarse durante APPLY/VERIFY antes de declarar las HU backend-complete.

## Out of Scope

- Frontend React productivo.
- PDF/CSV/XLSX backend.
- Fiscal invoicing.
- Credit/customer accounts.
- Supplier accounts payable.
- Stock por lote.
- FIFO/FEFO.
- Expiración.
- Payroll transaccional.
- Payroll payments/payslips.
- Bonuses/deductions/taxes.
- HourlyRate history.
- Weekly employee scheduler.
- Hardware signatures.
- Signature image/base64/SVG.
- Thermal printer.
- Report persistence.
- Scheduled reports/jobs.
- Inventory report snapshots históricos.
- New inventory authority.
- UI de modificación de HourlyRate.
- HUs fuera de Sprint 3.
