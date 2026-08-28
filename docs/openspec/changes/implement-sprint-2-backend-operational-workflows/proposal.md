# Proposal

## Executive Summary

El change conceptual único para el backend completo del Sprint 2 es:

`implement-sprint-2-backend-operational-workflows`

Ruta OpenSpec recomendada:

`docs/openspec/changes/implement-sprint-2-backend-operational-workflows/`

El nombre MAY ajustarse mínimamente durante la auditoría si `docs/openspec/changes/` demuestra una convención distinta, pero el Sprint 2 backend MUST permanecer como **un único change cohesivo**. No se dividirá artificialmente en ocho changes.

Historias incluidas:

| HU     | Historia                                    |
| ------ | ------------------------------------------- |
| HU-004 | Definir composición de platos/preparaciones |
| HU-006 | Configurar y visualizar stock bajo          |
| HU-007 | Registrar producción                        |
| HU-012 | Registrar y confirmar venta                 |
| HU-013 | Continuar venta con stock insuficiente      |
| HU-017 | Registrar compra                            |
| HU-018 | Recibir compra e incrementar inventario     |
| HU-025 | Gestionar y operar turnos                   |

La planificación oficial del proyecto confirma estas ocho historias como el núcleo transaccional del Sprint 2 y documenta las dependencias catálogo → composición → producción, inventario → stock/producción/venta, pedido → venta, proveedor → compra → recepción e integración ventas/gastos → turnos. fileciteturn15file0

Este change es **backend first**:

- Domain;
- Application;
- Infrastructure;
- EF Core;
- PostgreSQL;
- migrations;
- REST;
- authorization;
- ProblemDetails;
- transactions;
- concurrency;
- OpenAPI;
- automated tests;
- documentación técnica/HU.

Frontend Sprint 2 queda deliberadamente pendiente.

El `develop` público consultado actualmente confirma que Sprint 1 ya integra autenticación, usuarios, catálogo, proveedores, inventario, pedidos, cocina, gastos y asistencia; también confirma la estructura backend `Api/Application/Domain/Infrastructure`, .NET 10, EF Core/Npgsql/PostgreSQL, Identity/JWT, SignalR, OpenAPI y xUnit. Esta vista pública es únicamente orientación: el APPLY posterior MUST revalidar el `develop` **LOCAL REAL** y registrar branch, HEAD y status antes de diseñar o modificar. citeturn604065view0turn544053view1turn544053view2

La auditoría pública actual confirma una foundation de inventario particularmente valiosa:

- `InventoryBalance` es la existencia materializada por Product;
- `InventoryMovement` es el ledger;
- ya existen tipos `SALE`, `PRODUCTION_CONSUMPTION`, `PRODUCTION_OUTPUT` y `PURCHASE_RECEIPT`;
- ya existe trazabilidad mediante `ReferenceType` + `ReferenceId`;
- ya existe `IInventoryWriter`;
- los balances exponen `MinStock` e `IsLowStock`. citeturn293447view0turn293447view1

Por tanto, el principio estructural central queda congelado:

> **Sprint 2 MUST extender la única foundation de inventario existente. MUST NOT crear un segundo motor de stock.**

El catálogo público actual ya posee `ProductType`, `UnitDimension`, `FactorToBase`, `Product.InventoryUnitId` y `Product.MinStock`, por lo que las capacidades Sprint 2 deben reutilizar dichas primitives. citeturn293447view2

Los pedidos actuales ya tienen el estado técnico exacto `ENTREGADO`, `OrderItem.Quantity` y `OrderItem.UnitPrice` snapshot, mientras `Order.ShiftId` continúa nullable en la implementación pública observada. citeturn293447view3

Expense actualmente no contiene `ShiftId` en el código público observado, aunque el modelo canónico vigente prevé dicha relación. La evolución de HU-025 debe ser aditiva y compatible con datos/frontends Sprint 1. citeturn293447view4turn180988view2

### Estado de readiness

Existen dos puntos que impiden declarar el briefing listo para APPLY sin una fase adicional de explore:

1. `Pantallas.zip` no apareció accesible mediante las fuentes de archivos disponibles en esta sesión. No se pudo inspeccionar visualmente ninguna imagen individual del paquete, por lo que no debe afirmarse un visual audit 100%.
2. La documentación vigente define composición mediante cantidades/unidades y exige que producción calcule consumo usando la composición y la cantidad final producida, pero no explicita el **denominador de escalado** que convierte una receta en consumo para una cantidad producida arbitraria. El modelo `product_compositions` tampoco contiene una cantidad base/rendimiento de salida. La documentación afirma que el rendimiento esperado no forma parte del MVP. Esta diferencia debe resolverse antes de HU-007 porque inventar una fórmula produciría movimientos de inventario incorrectos. citeturn240132view0turn751423view0turn613709view0

Este segundo punto se clasifica provisionalmente como:

`PRODUCT_DECISION_REQUIRED`

salvo que la auditoría local encuentre en una HU refinada, entrevista, ADR u OpenSpec vigente una semántica inequívoca que no fue visible en las fuentes auditadas.

## Problem Statement

Sprint 2 debe convertir las foundations ya integradas en un núcleo transaccional coherente que permita:

- definir composición;
- detectar/configurar stock mínimo;
- registrar producción;
- confirmar ventas desde pedidos entregados;
- admitir venta con stock insuficiente mediante confirmación explícita;
- registrar compras multilínea;
- recibir compras usando cantidades realmente verificadas;
- operar dos turnos sobre una caja compartida.

Estas capacidades afectan las mismas entidades y saldos. Si se implementan como módulos aislados sin una autoridad transaccional común, pueden aparecer:

- saldos duplicados;
- movimientos sin origen;
- double consumption;
- ventas duplicadas;
- compras recibidas dos veces;
- lost updates;
- producción parcial;
- turnos incoherentes;
- contratos frontend inestables.

La regla de negocio vigente confirma que la venta es el punto definitivo de afectación comercial del inventario, que la venta puede producir stock negativo, que producción consume ingredientes y aumenta existencia preparada, y que una preparación ya producida no debe volver a consumir ingredientes cuando se vende. citeturn126946view0

Compras solamente incrementan inventario cuando quedan `RECIBIDA`; una compra pendiente/cancelada no lo modifica. citeturn126946view0turn240132view1

Fratelli opera con dos turnos que comparten una misma caja, y el traspaso del primer turno no equivale al cierre final. citeturn240132view2

## Goals

- Implementar backend completo de las ocho HU dentro de un solo change.
- Dejar contratos REST/OpenAPI definitivos para futuros frontends.
- Reutilizar Clean Architecture y patterns reales.
- Extender la única foundation Inventory existente.
- Garantizar trazabilidad de cada movimiento Sprint 2 hacia Production, Sale o Purchase.
- Reutilizar Unit/Dimension/FactorToBase.
- Modelar composición sin introducir costeo/rendimiento teórico.
- Configurar `MinStock` sin tabla de alertas persistentes.
- Derivar low stock mediante `currentStock <= minimumStock`.
- Bloquear producción cuando cualquier insumo sea insuficiente.
- Registrar cantidad final realmente producida.
- Confirmar ventas exclusivamente desde Order `ENTREGADO`.
- Calcular precios/totales server-side a partir de snapshots del Order.
- Impedir más de una Sale por Order.
- Permitir venta con stock insuficiente solamente después de acknowledgment explícito y recálculo backend.
- No volver a consumir ingredientes al vender una PREPARATION previamente producida.
- Registrar Purchase de un Supplier con múltiples líneas.
- No afectar inventario al crear Purchase.
- Permitir recepción definitiva con cantidades reales distintas de las ordenadas.
- Prohibir doble recepción.
- Mantener rechazo/no aceptación separado de cancelación.
- Implementar foundation y operación de dos turnos sobre una caja compartida.
- Asociar Sale a Shift.
- Evolucionar Expense hacia Shift de manera compatible.
- Utilizar `America/La_Paz` para conceptos de fecha/día operativo.
- Mantener server-authoritative actor y timestamps.
- Proteger operaciones críticas con transacciones/concurrency real PostgreSQL.
- Mantener Sprint 1 backward-compatible.
- Mantener frontend Sprint 2 sin modificaciones.
- Actualizar únicamente las ocho HU después de implementación real.
- Dejar cada HU como `BACKEND IMPLEMENTADO / FRONTEND PENDIENTE`.

## Non-Goals

- Frontend Sprint 2.
- `frontend/src/types/api.generated.ts`.
- HU-008 historial completo de producción.
- HU-014 clientes.
- HU-019 historial/reporte completo de compras.
- HU-021 historial de gastos.
- HU-026 preparación/cálculo de cierre.
- HU-027 registro de cierre final.
- Customer association en Sale.
- descuentos.
- impuestos/IVA inventados.
- facturación fiscal.
- tarjeta/transferencia no documentadas.
- payment gateways.
- cuentas por cobrar/crédito.
- costeo de receta.
- FIFO/LIFO/promedio.
- expected yield.
- lotes físicos complejos.
- vencimiento.
- composición recursiva automática.
- inventario paralelo para preparaciones.
- warehouses.
- notificaciones low-stock.
- email/SMS/WhatsApp/push.
- background jobs de stock bajo.
- SignalR nuevo sin caso real.
- selector cliente para cobro.
- upload/OCR de recibos.
- historial completo HU-019.
- recepción parcial estructurada.
- `PARTIALLY_RECEIVED`.
- tipos de turno configurables.
- horarios ficticios.
- dos cajas físicas separadas.
- cierre final de caja.
- conciliación.
- firmas digitales/tableta.
- impresión.
- propinas.
- mesas/checklists de turno.
- dashboards/KPIs/reportes.
- Git mutations.
- VERIFY.
- ARCHIVE.

## Affected Areas

### REUSE / EXTEND confirmado por auditoría pública

- `backend/src/RestaurantSystem.Domain/Inventory/InventoryEntities.cs`
  - REUSE tipos y ledger;
  - EXTEND solo si la baseline local requiere nuevas semantics compatibles.

- `backend/src/RestaurantSystem.Application/Inventory/InventoryContracts.cs`
  - REUSE `IInventoryWriter`;
  - EXTEND para batch/ambient transaction/concurrency si el servicio actual solo soporta una escritura aislada.

- `backend/src/RestaurantSystem.Domain/Catalog/CatalogEntities.cs`
  - REUSE Product/Unit/ProductType/UnitDimension/MinStock.

- `backend/src/RestaurantSystem.Domain/Orders/OrderEntities.cs`
  - REUSE Order, OrderItem snapshot y `ENTREGADO`;
  - EXTEND relación Sale/Shift únicamente si el modelo local lo requiere.

- `backend/src/RestaurantSystem.Domain/Expenses/ExpenseEntities.cs`
  - EXTEND con Shift relation de forma backward-compatible si sigue ausente.

- `backend/src/RestaurantSystem.Infrastructure`
  - EXTEND DbContext/configurations/mappings;
  - CREATE nueva migration;
  - no editar migrations históricas.

- `backend/src/RestaurantSystem.Api`
  - EXTEND políticas/routes/OpenAPI siguiendo pattern real.

- `backend/tests/RestaurantSystem.Domain.Tests`
- `backend/tests/RestaurantSystem.Application.Tests`
- `backend/tests/RestaurantSystem.IntegrationTests`
  - EXTEND.

La estructura real actual confirma estos cuatro proyectos backend y tres proyectos de test. citeturn544053view1turn544053view2

### CREATE probable, sujeto a naming real

Áreas de dominio/aplicación coherentes para:

- Product Composition.
- Production.
- Sales.
- Purchases.
- Shifts/CashSession.

No se congelan filenames nuevos hasta auditar conventions locales.

### DO NOT TOUCH por defecto

- frontend source.
- generated TypeScript.
- auth internals salvo policy registration estrictamente requerida.
- Orders/Kitchen business flow salvo integración aditiva de Sale/Shift.
- Sprint 1 endpoint semantics.
- historical migrations.
- unrelated HUs.
- Sprint 1 retrospective.

## Assumptions

### Assumption 1 — la snapshot pública no es la baseline final de APPLY

La inspección pública es útil para diseño, pero la baseline obligatoria futura es el checkout local `develop`. El APPLY MUST repetir:

- `git branch --show-current`
- `git rev-parse HEAD`
- `git status --short`
- `git log -1 --oneline`

### Assumption 2 — modelo canónico actual sigue vigente

El documento de modelo define:

- UUID;
- snake_case;
- quantities `numeric(14,4)`;
- money `numeric(12,2)`;
- BOB;
- ProductComposition;
- Production;
- Sale;
- Purchase;
- PurchaseReceipt;
- CashSession;
- Shift;
- ShiftAssignment. citeturn751423view0turn180988view0turn180988view2

El APPLY MUST verificar que no exista una evolución posterior.

### Assumption 3 — receivedQuantity > orderedQuantity

No hay regla visible que prohíba una cantidad efectivamente recibida superior a la pedida. Para preservar la verdad física, este briefing recomienda permitir cualquier `receivedQuantity > 0` si la recepción completa es aceptada, incluso cuando sea superior a `orderedQuantity`, salvo que la auditoría local encuentre una regla vigente más restrictiva.

Esto no crea recepción parcial: toda la Purchase continúa pasando una sola vez de PENDIENTE a RECIBIDA.

## Risks

### Risk 1: crear un segundo motor de inventario

- Probability: Medium.
- Impact: Critical.
- Mitigation: toda Production/Sale/PurchaseReception MUST escribir mediante la foundation Inventory existente.

### Risk 2: `IInventoryWriter` actual no soporta transaction externa/batch

- Probability: High.
- Impact: Critical.
- Mitigation: extenderlo de forma backward-compatible con boundary transaccional reutilizable; conservar manual HU-005.

### Risk 3: deadlocks por locks de múltiples Products

- Probability: Medium.
- Impact: High.
- Mitigation: ordenar Product/Balance locks determinísticamente por GUID.

### Risk 4: lost update de balances

- Probability: Medium.
- Impact: Critical.
- Mitigation: row-level locking/reload PostgreSQL siguiendo foundation HU-005.

### Risk 5: Production escribe algunos movimientos antes de detectar faltante

- Probability: Medium.
- Impact: Critical.
- Mitigation: calcular/revalidar todos los requirements bajo locks antes de insertar cualquiera.

### Risk 6: composición escalada con fórmula inventada

- Probability: High sin aclaración.
- Impact: Critical.
- Mitigation: resolver `PRODUCT_DECISION_REQUIRED` sobre semántica base de composición antes de HU-007.

### Risk 7: conversiones entre dimensiones

- Probability: Medium.
- Impact: High.
- Mitigation: same `UnitDimension` solamente; convertir mediante `FactorToBase`.

### Risk 8: receta cambia y altera producción histórica

- Probability: High.
- Impact: High.
- Mitigation: ProductionConsumption snapshot + InventoryMovement refs.

### Risk 9: venta consume ingredientes dos veces

- Probability: Medium.
- Impact: Critical.
- Mitigation: Sale descuenta el Product del OrderItem; PREPARATION ya producida se trata como stock preparado.

### Risk 10: venta duplicada por doble request

- Probability: Medium.
- Impact: Critical.
- Mitigation: Order row lock + `UNIQUE Sale.OrderId`.

### Risk 11: shortage calculado con snapshot stale

- Probability: High.
- Impact: High.
- Mitigation: acknowledgment second request MUST recalcular dentro de transaction/locks.

### Risk 12: frontend manda total/precios manipulados

- Probability: Medium.
- Impact: Critical.
- Mitigation: Sale request no acepta totals/prices; usar OrderItem snapshots.

### Risk 13: sale confirmada mientras Shift cambia

- Probability: Medium.
- Impact: High.
- Mitigation: resolver/serializar active Shift durante la transaction de Sale.

### Risk 14: Expense Sprint 1 se rompe al introducir Shift

- Probability: Medium.
- Impact: High.
- Mitigation: migration nullable para historical compatibility; server-side association aditiva.

### Risk 15: fake Shift para satisfacer FK

- Probability: Medium.
- Impact: High.
- Mitigation: implementar foundation real HU-025 antes de Sale; no seeds artificiales.

### Risk 16: Purchase create altera inventory

- Probability: Medium.
- Impact: Critical.
- Mitigation: ningún InventoryMovement hasta reception.

### Risk 17: double receive

- Probability: Medium.
- Impact: Critical.
- Mitigation: Purchase lock + state + unique definitive receipt.

### Risk 18: orderedQuantity se pierde al guardar receivedQuantity

- Probability: Medium.
- Impact: High.
- Mitigation: almacenar recepción como snapshot separado, preferentemente receipt lines.

### Risk 19: Purchase cancellation compite con receive

- Probability: Medium.
- Impact: Critical.
- Mitigation: ambas operaciones bloquean Purchase primero.

### Risk 20: autorización de compras depende de selector artificial

- Probability: Medium.
- Impact: High.
- Mitigation: inferir scope desde ProductType/domain attributes y validar cada line server-side.

### Risk 21: COCINA registra General purchase

- Probability: Medium.
- Impact: High.
- Mitigation: line-level scope validation; compra mixta solo válida si actor puede gestionar todas las líneas.

### Risk 22: recibo de COCINA se convierte accidentalmente en file upload

- Probability: Medium.
- Impact: Medium.
- Mitigation: receiptReference textual simple, sin storage/OCR.

### Risk 23: Shift model deriva a HU-026/027

- Probability: High.
- Impact: High.
- Mitigation: implementar operational continuity únicamente; no closing calculations/reconciliation.

### Risk 24: dos Shifts activos a la vez

- Probability: Medium.
- Impact: High.
- Mitigation: application transitions + DB constraints/partial unique index si encaja.

### Risk 25: business date usa UTC

- Probability: Medium.
- Impact: High.
- Mitigation: central operational clock `America/La_Paz`.

### Risk 26: fake horarios de MORNING/NIGHT

- Probability: Medium.
- Impact: Medium.
- Mitigation: no persistir schedule rules salvo docs/local model real.

### Risk 27: Purchase item unit incompatible

- Probability: Medium.
- Impact: High.
- Mitigation: validate dimension + FactorToBase before receive.

### Risk 28: breaking Sprint 1 contracts

- Probability: Medium.
- Impact: Critical.
- Mitigation: additive DTO/routes/schema evolution; full regression.

### Risk 29: ProblemDetails extensions no quedan descritas en OpenAPI

- Probability: Medium.
- Impact: High.
- Mitigation: typed shortage ProblemDetails schema compatible con foundation.

### Risk 30: screenshot impulsa capability fuera de scope

- Probability: Medium.
- Impact: High.
- Mitigation: visual KEEP/ADAPT/OMIT/DEFER audit antes de contract freeze.

### Risk 31: datos visuales asumidos sin inspección

- Probability: Certain en esta sesión.
- Impact: Medium/High.
- Mitigation: `Pantallas.zip` debe abrirse individualmente durante further explore.

### Risk 32: migration histórica destructiva

- Probability: Low/Medium.
- Impact: Critical.
- Mitigation: nueva migration únicamente; historical data strategy; clean PostgreSQL validation.

## Rollback Strategy

Este Sprint 2 introduce transacciones históricas, por lo que rollback técnico MUST distinguir código de datos.

- Antes de producción real, una migration defectuosa puede revertirse en base disposable mediante migration rollback siguiendo tooling normal.
- En datos reales, una Sale/Production/Purchase recibida no debe “deshacerse” borrando ledger o transacciones.
- Si se necesita rollback de deployment, revertir aplicación/migration solo cuando sea seguro y compatible con datos ya escritos.
- Migrations MUST ser aditivas siempre que sea posible.
- No editar migrations Sprint 1.
- No borrar InventoryMovements para “reparar” datos.
- No borrar Sales/Productions/Received Purchases confirmadas.
- Las operaciones futuras de reversión/corrección requieren reglas específicas y no forman parte de este change.
- Rollback de HU-006 puede dejar `MinStock` existente sin perder datos.
- ShiftId de Expense debe evolucionar de forma que un rollback de aplicación no convierta datos históricos en inválidos.
- Si una migration requiere destructive change sobre columnas Sprint 1, clasificar `DESTRUCTIVE_CHANGE_REQUIRED` antes de APPLY.

## Success Criteria

- Un único change cubre ocho HU.
- `develop` local real queda auditado antes de implementación.
- `Pantallas.zip` queda visualmente auditado N/N.
- Semántica de escalado de composición queda resuelta.
- Inventory mantiene una sola autoridad.
- Production/Sale/Purchase movements tienen ReferenceType/ReferenceId.
- No se crea stock paralelo.
- Unit conversion reutiliza Unit dimension/factor.
- Composition funciona y no muta stock.
- Low stock se deriva sin alert table.
- Production insuficiente bloquea atómicamente.
- Production exitosa crea consumos, output y balances de forma atómica.
- Sale requiere Order `ENTREGADO`.
- Sale tiene unique Order relation.
- Sale total es server-side.
- Sale normal afecta inventory.
- Sale shortage sin ack no persiste nada.
- Sale shortage con ack recalcula y puede producir saldo negativo.
- PREPARATION vendida no consume ingredientes por segunda vez.
- Purchase es multilínea.
- Purchase PENDIENTE no afecta stock.
- Cancelación PENDIENTE requiere motivo.
- Purchase receipt usa cantidades reales.
- Purchase receive es atómica.
- Double receive es imposible.
- Dos turnos comparten CashSession.
- Sale obtiene Shift real.
- Expense se asocia a Shift de forma compatible.
- No se implementa cash closing.
- Migrations aplican en PostgreSQL disposable.
- OpenAPI contiene todos los endpoints Sprint 2.
- Full backend tests failed=0.
- Build PASS.
- Frontend Sprint 2 permanece untouched.
- Las ocho HU documentan `BACKEND IMPLEMENTADO / FRONTEND PENDIENTE`.
