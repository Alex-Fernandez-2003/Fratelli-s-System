# Proposal

## Problem Statement

El backend de Sprint 2 ya está implementado. Este change no vuelve a implementar HU-004, HU-006, HU-007, HU-012, HU-013, HU-017, HU-018 ni HU-025.

La baseline remota auditada conserva siete defectos técnicos aprobados para estabilización:

1. `PurchasesAsync` ejecuta fan-out concurrente con `Task.WhenAll` sobre operaciones que reutilizan la misma instancia scoped de `ApplicationDbContext`.
2. `ReplaceCompositionAsync` compara unidades cargadas distintas contra cantidad de líneas y rechaza composiciones válidas cuando varias líneas comparten `UnitId`.
3. `CreatePurchaseAsync` contiene el mismo defecto para PurchaseLines.
4. La resolución de Current Shift no utiliza la misma semántica temporal en `CurrentShiftAsync`, `MyCurrentShiftAsync`, Sale y Expense.
5. HU-013 puede devolver shortages stale o vacíos cuando la insufficiency definitiva se detecta dentro de `WriteBatchAsync` después de adquirir locks.
6. El contrato de Purchase receipt no distingue explícitamente la unidad ordenada de la unidad efectivamente recibida.
7. Una Purchase todavía no recibida puede mapear `receivedQuantity = 0` en vez de `null`.

Antes de APPLY, el checkout local de `develop` MUST revalidarse. Si cualquiera de estos defectos ya fue corregido en el HEAD local, MUST clasificarse como `ALREADY_RESOLVED_IN_BASELINE` y MUST quedar excluido de las tareas de implementación correspondientes.

`QuantityPerOutputUnit` ya sigue la decisión funcional aprobada:

requiredIngredientQuantity =
QuantityPerOutputUnit × QuantityProduced

Este comportamiento MUST preservarse y no forma parte de una reimplementación.

La auditoría detectó además dos posibles defectos no aprobados para corrección:

- colapso genérico de errores de `InventoryWriter` a `PRODUCTION_STOCK_INSUFFICIENT`;
- resolución de una unidad inexistente mediante `SingleAsync` durante Purchase reception.

Ambos se clasifican `ADDITIONAL_FINDING_REQUIRES_HUMAN_REVIEW` y MUST NOT corregirse dentro del APPLY de este change sin aprobación expresa.

Existe también una decisión funcional pendiente respecto a una unidad que se desactiva después de crear una Purchase pero antes de recibirla. Se clasifica `PRODUCT_DECISION_REQUIRED` y queda fuera del scope ejecutable.

## Goals

- MUST estabilizar el backend Sprint 2 ya implementado, no reconstruirlo.
- MUST corregir únicamente los bugs aprobados que continúen presentes después del preflight local.
- MUST preservar rutas HTTP, verbs, intención y contratos observables existentes.
- MUST mantener HU-004, HU-007 y HU-017 compatibles con sus consumidores frontend locales.
- MUST conseguir `ZERO FRONTEND CONTRACT CHANGE` para los fixes de unidades de HU-004 y HU-017.
- MUST eliminar operaciones concurrentes sobre un mismo `ApplicationDbContext` en Purchase listing.
- SHOULD resolver Purchase listing mediante una consulta/proyección EF Core eficiente y acotada.
- MUST mantener `QuantityPerOutputUnit × QuantityProduced`.
- MUST centralizar de forma mínima la semántica de Current Shift para que use business day actual y CashSession vigente.
- MUST conservar `America/La_Paz` como timezone operacional.
- MUST usar los shortages calculados bajo lock como autoridad de HU-013.
- MUST extender `PurchaseLineDto` de forma backward-compatible para distinguir unidad recibida.
- MUST conservar `receivedQuantity = null` cuando todavía no existe recepción.
- MUST mantener la única foundation `IInventoryWriter`/Inventory existente.
- MUST añadir regresiones enfocadas para cada bug aprobado presente.
- MUST conservar las transacciones y locks existentes de Production, Sale y Purchase Reception.
- MUST evitar migrations salvo que la auditoría local demuestre una necesidad real.
- MUST estabilizar primero backend y tests antes de regenerar OpenAPI.
- MUST regenerar `frontend/src/types/api.generated.ts` exclusivamente desde el OpenAPI runtime final.
- MUST limitar cualquier cambio manual frontend al mínimo estrictamente necesario.
- MUST ejecutar los quality gates reales de backend y frontend en APPLY.
- MUST sincronizar documentación únicamente después de obtener evidencia real del resultado.
- MUST dejar el contrato Sprint 2 listo para continuar frontends HU por HU.

## Non-Goals

- Reimplementar Sprint 2.
- Rediseñar Domain/Application/Infrastructure por preferencia.
- Cambiar rutas REST existentes.
- Cambiar HTTP verbs existentes.
- Crear `/api/v2`.
- GraphQL.
- Introducir endpoints paralelos equivalentes.
- Crear otro sistema de inventario.
- Crear otro Unit of Work.
- Introducir `IDbContextFactory` únicamente para mantener el fan-out concurrente.
- MediatR/CQRS/event sourcing.
- Redis/distributed locks.
- Microservices.
- Rediseñar HU-004 frontend.
- Rediseñar HU-007 frontend.
- Rediseñar HU-017 frontend.
- Cambiar UX, routing o Atomic Design de esas features.
- HU-008.
- HU-014.
- HU-019.
- HU-021.
- HU-026.
- HU-027.
- Clientes.
- Descuentos.
- Facturación fiscal.
- Costeo/FIFO/promedio.
- Recepción parcial estructurada.
- OCR/upload de recibos.
- Firmas/hardware.
- Multiple cash registers.
- Shift types arbitrarios.
- Notificaciones externas.
- Corregir hallazgos nuevos sin revisión humana.
- Resolver la ambigüedad de unidades desactivadas durante recepción sin decisión funcional.
- VERIFY.
- ARCHIVE.
- Git mutations.

## Affected Areas

Áreas confirmadas por la baseline remota y que probablemente serán tocadas si el preflight local confirma los bugs:

### Backend — Infrastructure

- `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs`
  - validación de UnitIds en Composition;
  - validación de UnitIds en Purchase create;
  - Purchase listing;
  - Current Shift consumers;
  - Sale shortage mapping;
  - Purchase receipt mapping.

- `backend/src/RestaurantSystem.Infrastructure/Expenses/ExpenseService.cs`
  - resolución de Shift actual.

- área de resolución de Shift dentro de Infrastructure/Application:
  - MAY recibir un helper/abstracción pequeña reutilizable si el diseño local lo justifica;
  - MUST NOT convertirse en una nueva arquitectura de scheduling.

### Backend — Application

- `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs`
  - extensión aditiva de `PurchaseLineDto` con `receivedUnitId` o naming coherente equivalente.

### Backend — Inventory

- `backend/src/RestaurantSystem.Infrastructure/Inventory/InventoryService.cs`
  - principalmente REUSE/audit;
  - no se espera cambio para el race de HU-013 porque `InventoryBatchResult.Shortages` ya contiene el resultado autoritativo bajo lock.

### Backend — API

- endpoints Sprint 2 existentes:
  - expected unchanged;
  - metadata/OpenAPI deberá reflejar automáticamente la extensión DTO final.
- `Program.cs`/route mappings:
  - audit only salvo que un defecto real de metadata requiera cambio mínimo.

### Backend — Tests

Tests PostgreSQL existentes relacionados con:

- Operations contracts;
- Operations concurrency;
- authorization;
- Inventory;
- Sale/Purchase/Production/Shift.

El APPLY SHOULD extender las suites existentes antes de crear una jerarquía nueva de tests sin necesidad.

### Frontend

- `frontend/src/types/api.generated.ts`
  - regenerado automáticamente después de estabilizar OpenAPI.

- HU-004/HU-007/HU-017 feature files:
  - only if the LOCAL baseline confirms those frontends exist;
  - manual edits only if the regenerated contract creates an unavoidable compile/API consumption adaptation.

### Documentation

Después de los gates:

- historias Sprint 2 afectadas;
- handoff/contract documentation actual;
- OpenSpec progress/evidence del nuevo change;
- current-state documentation que afirme incorrectamente que no existe contrato TypeScript.

No se debe reescribir documentación histórica cuyo statement era correcto para su momento.

## Assumptions

- El `develop` local de APPLY puede estar por delante del remoto auditado; por ello el preflight local es obligatorio.
- Los siete bugs aprobados están presentes en el remoto auditado, pero cada uno debe confirmarse nuevamente contra el HEAD local antes de modificar.
- `PurchaseReceiptLine.UnitId` ya persiste la unidad efectivamente recibida; por ello añadir `receivedUnitId` al DTO no debería requerir migration.
- Los fixes conocidos, salvo la extensión DTO, deberían ser cambios internos sin alteración de contrato.
- La generación TypeScript sigue realizándose mediante el script canónico encontrado en `frontend/package.json`, sujeto a revalidación local.
- La foundation Inventory existente continuará siendo autoridad única.

## Risks

### Risk 1: el checkout local difiere de la baseline remota

- Probability: Medium
- Impact: High
- Mitigation: ejecutar un preflight local obligatorio y excluir cualquier bug ya resuelto antes de editar.

### Risk 2: breaking change accidental para HU-004/HU-007/HU-017

- Probability: Medium
- Impact: Critical
- Mitigation: preservar endpoints/request/response existentes; aceptar solo una extensión DTO aditiva de HU-018; comparar OpenAPI y generated types antes/después.

### Risk 3: cambio de Purchase listing altera paginación u ordering

- Probability: Medium
- Impact: High
- Mitigation: tests que congelen total/page/pageSize/status/order/content de DTO antes y después del refactor.

### Risk 4: reemplazar Task.WhenAll por una solución correcta pero N+1

- Probability: Medium
- Impact: Medium
- Mitigation: preferir proyección/bulk query; aceptar procesamiento secuencial solamente si la proyección resulta desproporcionada y documentar el tradeoff.

### Risk 5: helper compartido de Unit validation se sobre-generaliza

- Probability: Medium
- Impact: Medium
- Mitigation: mantenerlo pequeño y específico al patrón `distinct requested IDs → loaded IDs`; no crear un rule engine.

### Risk 6: resolver Current Shift cambia semántica histórica

- Probability: Medium
- Impact: Critical
- Mitigation: definir Current Shift estrictamente como CashSession abierta del `BusinessDate` actual + Shift ACTIVE dentro de ella; no completar/cerrar shifts históricos automáticamente.

### Risk 7: Sale/Expense obtienen distinta semántica de Current Shift

- Probability: High si el fix se duplica
- Impact: Critical
- Mitigation: reutilizar una única primitive/query mínima de resolución.

### Risk 8: race de HU-013 continúa devolviendo precheck stale

- Probability: Medium
- Impact: High
- Mitigation: cuando `WriteBatchAsync` detecte `STOCK_INSUFFICIENT`, construir la respuesta desde `InventoryBatchResult.Shortages`.

### Risk 9: cambiar todos los errores de InventoryWriter en HU-007

- Probability: Medium
- Impact: High
- Mitigation: mantener este hallazgo fuera de scope hasta revisión humana.

### Risk 10: `receivedUnitId` se convierte en breaking rename

- Probability: Low
- Impact: High
- Mitigation: mantener `unitId` con su significado actual de unidad ordenada y añadir `receivedUnitId` nullable.

### Risk 11: `null`/`0` cambia consumers implícitos

- Probability: Medium
- Impact: Medium
- Mitigation: verificar generated client y consumers locales; el campo ya es nullable, por lo que `null` restaura su semántica contractual esperada sin cambiar el tipo.

### Risk 12: migration innecesaria amplía el cambio

- Probability: Low
- Impact: Medium
- Mitigation: demostrar necesidad antes de crear migration; los bugs aprobados no la requieren según baseline remota.

### Risk 13: documentación histórica se reescribe como current-state

- Probability: Medium
- Impact: Medium
- Mitigation: separar `DOCUMENTATION DRIFT` actual de registros históricos que eran ciertos cuando se escribieron.

### Risk 14: OpenAPI se regenera demasiado pronto

- Probability: Medium
- Impact: Medium
- Mitigation: backend gates primero; runtime OpenAPI solamente cuando los fixes/tests estén estables.

### Risk 15: nuevos hallazgos provocan scope creep

- Probability: Medium
- Impact: High
- Mitigation: etiquetar `ADDITIONAL_FINDING_REQUIRES_HUMAN_REVIEW` y excluirlos de implementation tasks.

## Rollback Strategy

Este change se diseña para ser predominantemente code-only y backward-compatible.

- No se espera migration para los bugs aprobados.
- Los fixes internos de consultas/validaciones/resolución pueden revertirse independientemente si provocan regresión antes de release.
- La extensión `receivedUnitId` es aditiva; revertirla exige también regenerar el cliente desde el contrato revertido para no dejar OpenAPI y TypeScript desalineados.
- `api.generated.ts` MUST tratarse como output del OpenAPI runtime, no como fuente independiente que pueda editarse/revertirse manualmente.
- Si durante APPLY aparece una necesidad real de migration destructiva, el cambio MUST detenerse y reclasificarse como `DESTRUCTIVE_CHANGE_REQUIRED`.
- Ningún rollback MUST borrar Production, Sale, PurchaseReceipt, InventoryMovement, CashSession o datos operativos existentes.
- Las operaciones Git permanecen bajo control humano.

## Success Criteria

- Cada bug aprobado presente en el HEAD local queda reproducido mediante test antes de su corrección cuando sea práctico.
- Cualquier bug ya resuelto localmente queda etiquetado `ALREADY_RESOLVED_IN_BASELINE` y no se modifica.
- `PurchasesAsync` deja de iniciar operaciones EF concurrentes sobre el mismo DbContext.
- Purchase listing mantiene paginación, filtro, líneas y receipt data.
- Composition acepta varias líneas con el mismo `UnitId` válido.
- Purchase create acepta varias líneas con el mismo `UnitId` válido.
- UnitIds desconocidos siguen rechazándose.
- Dimensiones incompatibles siguen rechazándose.
- HU-007 conserva exactamente `QuantityPerOutputUnit × QuantityProduced`.
- Production conserva atomicidad y hard-block de stock insuficiente.
- Current Shift se resuelve dentro de la CashSession abierta del `BusinessDate` actual.
- Sale, Expense y MyCurrentShift consumen la misma semántica Current Shift.
- El escenario Day1 ACTIVE residual + Day2 ACTIVE actual selecciona siempre Day2.
- HU-013 devuelve shortages calculados bajo lock cuando el race se materializa.
- `PurchaseLineDto` conserva `unitId` y añade `receivedUnitId` nullable.
- Purchase PENDIENTE devuelve `receivedQuantity = null` y `receivedUnitId = null`.
- Purchase recibida puede representar `ordered 10 kg / received 9850 g` sin ambigüedad.
- No se crea migration salvo necesidad demostrada.
- Ninguna route ni HTTP verb Sprint 2 cambia.
- Runtime OpenAPI final se genera después de backend estable.
- `api.generated.ts` se regenera desde dicho OpenAPI.
- HU-004/HU-007/HU-017 requieren cero o el mínimo cambio frontend indispensable.
- Backend restore/build/tests terminan con failed=0.
- Frontend format/typecheck/lint/tests/build terminan con failed=0 usando scripts reales.
- La documentación final registra únicamente evidencia realmente ejecutada.
- Ningún hallazgo adicional no aprobado entra silenciosamente al scope.
