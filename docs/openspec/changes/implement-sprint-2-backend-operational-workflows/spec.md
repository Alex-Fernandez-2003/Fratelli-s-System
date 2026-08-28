# Spec

## Requirements

### 1. Baseline and Change Boundary

- El futuro APPLY MUST comenzar contra el `develop` local real.
- MUST registrar branch, HEAD, status y último commit mediante Git read-only.
- MUST reauditar estructura `Domain/Application/Infrastructure/Api`, tests, migrations y OpenAPI.
- MUST tratar cualquier auditoría pública previa como referencia secundaria.
- MUST mantener las ocho HU dentro de un único change.
- MUST NOT crear ocho changes independientes.
- MUST NOT implementar frontend Sprint 2.
- MUST NOT modificar `frontend/src/types/api.generated.ts`.
- MUST NOT ejecutar VERIFY ni ARCHIVE.
- MUST NOT realizar Git mutations.

### 2. Source Authority

En cualquier discrepancia, el APPLY MUST aplicar este orden:

1. decisiones humanas congeladas;
2. código local `develop`;
3. backend/OpenAPI local;
4. historias normalizadas;
5. requisitos/RN current-state;
6. tests;
7. ADR;
8. OpenSpec/handoffs históricos;
9. referencias visuales;
10. inferencia técnica mínima.

### 3. Visual Audit

- El explore previo a APPLY MUST localizar `Pantallas.zip`.
- MUST inventariar todas las imágenes, no solo filenames conocidos.
- MUST abrir individualmente cada referencia relevante.
- MUST clasificar elementos como KEEP, ADAPT, OMIT o DEFER.
- MUST NOT asumir que screenshot data constituye dominio.
- MUST NOT considerar un contact sheet como sustituto de inspección individual.
- MUST NOT afirmar `visual audit PASS` hasta inspeccionar N/N.

Estado actual: `Pantallas.zip` no fue recuperable mediante las fuentes de archivos accesibles en esta sesión; por tanto el visual audit pixel-level permanece pendiente.

Clasificación funcional congelada para cuando se inspeccionen las pantallas:

| Área visual                                | Decision                    |
| ------------------------------------------ | --------------------------- |
| Composition ingredient lines/quantity/unit | KEEP                        |
| coste de receta                            | OMIT                        |
| rendimiento/porciones esperadas            | OMIT                        |
| Low-stock current/minimum/status           | KEEP                        |
| email/SMS/push alerts                      | OMIT                        |
| Production final quantity                  | KEEP                        |
| Production requirements/shortages          | KEEP/ADAPT al contrato real |
| Production history HU-008                  | DEFER                       |
| Sale Order context/total/payment           | KEEP                        |
| Customer selection                         | DEFER HU-014                |
| Discounts/taxes                            | OMIT                        |
| Purchase Supplier + multiline items        | KEEP                        |
| Manual Cocina/General selector             | OMIT                        |
| Receipt textual reference                  | ADAPT                       |
| Receipt file/OCR                           | OMIT                        |
| Full purchase history                      | DEFER HU-019                |
| Receive ordered vs actual quantity         | KEEP                        |
| Partial structured receipt                 | OMIT                        |
| Shift current state/assignments/handover   | KEEP                        |
| Arbitrary “New Shift type”                 | OMIT                        |
| Mockup hours                               | OMIT unless confirmed       |
| Cash closing/reconciliation                | DEFER HU-026/HU-027         |
| Digital signatures                         | DEFER Post-MVP              |
| Dashboard/KPIs                             | OMIT                        |

### 4. Canonical Roles

The backend MUST use only:

- ADMINISTRADOR
- ENCARGADO
- MESERO
- COCINA
- CONTADORA
- EMPLEADO

Authorization MUST preserve multi-role union semantics.

### 5. Existing Inventory Authority

The backend MUST reuse the existing:

- InventoryBalance;
- InventoryMovement;
- InventoryMovementType;
- InventoryReferenceType;
- inventory write boundary.

The public baseline already defines movement types:

- ENTRY
- SALE
- PRODUCTION_CONSUMPTION
- PRODUCTION_OUTPUT
- PURCHASE_RECEIPT
- WRITE_OFF
- ADJUSTMENT

and references:

- MANUAL
- SALE
- PURCHASE
- PRODUCTION. citeturn293447view0

Sprint 2 MUST NOT create:

- ProductionStock;
- SalesStock;
- PurchaseStock;
- PreparedStock;
- another balance table.

### 6. Inventory Batch Mutation Boundary

The existing single-write boundary SHOULD be extended to support multi-movement business transactions.

It MUST support:

- participation in an enclosing transaction;
- deterministic balance locking;
- multiple Products;
- one authoritative re-read under lock;
- preflight shortage calculation;
- fail-before-write semantics when negative stock is forbidden;
- negative result when sale acknowledgment authorizes it;
- server-owned movement type/reference/actor.

The existing HU-005 manual movement endpoint MUST remain compatible.

### 7. Inventory Traceability

Every Sprint 2 movement MUST include business origin.

Required conceptual mapping:

| Operation                         | Movement               | ReferenceType | ReferenceId                               |
| --------------------------------- | ---------------------- | ------------- | ----------------------------------------- |
| Production ingredient consumption | PRODUCTION_CONSUMPTION | PRODUCTION    | Production.Id                             |
| Production output                 | PRODUCTION_OUTPUT      | PRODUCTION    | Production.Id                             |
| Sale                              | SALE                   | SALE          | Sale.Id                                   |
| Purchase reception                | PURCHASE_RECEIPT       | PURCHASE      | Purchase.Id or canonical purchase-root ID |

The exact Purchase reference target MAY adapt to an existing convention, but MUST identify the business purchase/reception unambiguously.

### 8. Unit Conversion

- Conversion MUST reuse `Unit.Dimension` and `Unit.FactorToBase`.
- Source and destination dimensions MUST match.
- Factor MUST be positive.
- Conversion SHOULD follow:
  - base amount = source amount × source FactorToBase;
  - destination amount = base amount ÷ destination FactorToBase.
- Cross-dimension conversion MUST return validation error.
- No package conversion such as box→bottle MUST be invented.
- Existing canonical dimensions MASS/VOLUME/COUNT MUST be reused. citeturn751423view0

### 9. HU-004 Composition

- Composition management MUST be restricted to ADMINISTRADOR and ENCARGADO.
- Parent MUST be an existing active Product compatible with composition semantics.
- Each component MUST reference an existing active Product accepted as an ingredient/input by the real domain.
- Client MUST NOT submit free-text ingredient names.
- Each component MUST include:
  - componentProductId;
  - quantity > 0;
  - unitId.
- Component unit MUST be dimension-compatible with Product.InventoryUnit.
- Duplicate component Product within one composition MUST be rejected.
- Parent==component MUST be rejected.
- Composition changes MUST NOT mutate inventory.
- Full replacement with PUT SHOULD be preferred if consistent with current API conventions because it naturally supports add/update/remove as one atomic recipe version.
- Empty composition MAY clear a composition if the current domain allows clearing; Production MUST reject a target without a usable composition.
- Recursive consumption MUST NOT be implemented unless the local model explicitly requires recursive compositions.
- If PREPARATION components are allowed, cycle prevention MUST follow the current canonical model.
- Costing MUST NOT be implemented.
- Expected yield MUST NOT be implemented.

### 10. Blocking Composition Scaling Contract

Before HU-007 APPLY, the system MUST establish an unambiguous rule mapping:

Composition component quantity

- requested/final produced quantity
  →
  required component consumption.

Current visible sources do not specify the recipe base denominator.

Until resolved, APPLY MUST NOT invent one of these meanings:

- “composition is per one inventory unit of parent”;
- “composition is one fixed batch regardless of output”;
- “composition defines an implicit base yield”.

If local documents do not resolve it, classify:

`PRODUCT_DECISION_REQUIRED`.

### 11. HU-006 Minimum Stock

- Product.MinStock existing field MUST be reused.
- A separate LowStockAlert persistent table SHOULD NOT be introduced.
- ADMINISTRADOR and ENCARGADO MUST be allowed to configure MinStock.
- COCINA MUST be able to query low-stock state.
- Existing Inventory read roles MUST remain backward-compatible.
- Low stock MUST be:
  - `MinStock != null && CurrentQuantity <= MinStock`.
- Equality MUST count as low.
- Negative Quantity MUST remain negative.
- Negative Quantity with configured threshold MUST be low.
- MinStock MUST be null or >=0.
- `null` SHOULD mean threshold not configured.
- Configuring minimum MUST NOT create InventoryMovement.
- Existing `InventoryBalanceDto.MinStock` and `IsLowStock` SHOULD be reused.
- Existing balances endpoint MAY receive an additive `lowStock` server-side filter if useful for HU-006 frontend.
- No notification service, jobs or SignalR MUST be added.

### 12. HU-007 Production

Authorized roles MUST be:

- COCINA
- ENCARGADO
- ADMINISTRADOR

Production request MUST conceptually contain:

- targetProductId;
- quantityProduced >0;
- optional notes.

It MUST NOT accept:

- CreatedByUserId;
- timestamp;
- inventory deltas;
- component consumption calculated by client.

The system MUST:

1. load target Product;
2. load current composition;
3. calculate required components using the resolved scaling rule;
4. convert units;
5. lock/reload all relevant balances;
6. recalculate shortage under lock;
7. reject if any required component is insufficient;
8. create Production;
9. create ProductionConsumption snapshots;
10. create negative InventoryMovements for components;
11. create positive InventoryMovement for produced Product;
12. update balances;
13. commit atomically.

Production MUST NOT allow negative component stock.

Production MUST NOT partially persist.

Production output MUST increase existing prepared Product inventory rather than a separate stock table.

Successive productions MUST create distinct Production records while balances accumulate.

### 13. Production Responsible Identity

- CreatedByUserId MUST come from authenticated User.
- If Production model requires ResponsibleEmployeeId, it SHOULD resolve from the authenticated User→Employee relationship.
- Client SHOULD NOT choose an arbitrary responsible Employee unless an explicit current requirement says production can be recorded on another person's behalf.
- If a Production actor lacks the Employee association required by the final model, backend MUST return a controlled business conflict rather than invent an Employee.

### 14. Production Requirement Preview

The backend SHOULD expose enough data for a future HU-007 frontend to preview required inputs without changing inventory.

A read/calculation contract MAY conceptually expose:

- Product;
- requested production quantity;
- required component quantities;
- canonical/display units;
- current stock;
- missing quantity;
- `hasSufficientStock`.

The final route MUST follow local conventions.

The preview MUST NOT be authoritative at confirmation time; Production MUST recalculate.

### 15. HU-012 Sale Origin

- Every Sale MUST originate from an existing Order.
- Standalone Sale MUST NOT be supported.
- Order MUST be `ENTREGADO`.
- Orders in PENDIENTE, EN_PREPARACION, LISTO or CANCELADO MUST be rejected for Sale confirmation.
- One Order MUST have at most one Sale.

### 16. Sale Price Authority

- Client MUST NOT submit authoritative unit prices, subtotal or total.
- Backend MUST derive SaleItem snapshots from OrderItems.
- Existing `OrderItem.UnitPrice` snapshot SHOULD be reused.
- Sale subtotal/total MUST be calculated server-side.
- No tax, discount or customer calculation MUST be added.
- Sale history MUST remain invariant if Product.SalePrice changes after the Order.

### 17. Sale Request

Conceptual request SHOULD contain only:

- orderId;
- salesChannel;
- paymentMethod;
- explicit shortage acknowledgment flag if applicable.

It MUST NOT contain:

- customerId;
- shiftId chosen arbitrarily;
- price;
- subtotal;
- total;
- inventory deltas;
- createdBy;
- confirmedAt.

### 18. Sales Channel and Payment Method

The canonical model currently defines:

SalesChannel:

- DIRECT
- PEDIDOSYA

PaymentMethod:

- CASH
- QR
- EXTERNAL

with `PEDIDOSYA + EXTERNAL` as current canonical example. citeturn180988view0

The local audit MUST reuse these enums if still current.

The change MUST NOT add:

- CREDIT_CARD;
- BANK_TRANSFER;
- credit;
- external payment gateway.

PedidosYa MUST remain classification only.

### 19. Sale Shift

- Sale MUST resolve a valid operational Shift server-side.
- Client MUST NOT freely choose ShiftId.
- Sale MUST fail with controlled 409 if no valid operational Shift exists.
- The Shift resolution MUST be serialized sufficiently so a concurrent handover cannot ambiguously assign a Sale to two different shift states.
- Sale.ShiftId MUST persist.

### 20. HU-013 Sale Shortage

The backend MUST be the shortage authority.

First confirmation attempt:

- MUST lock/re-read balances;
- MUST calculate all shortages;
- if none, MUST confirm normally;
- if shortages exist and no explicit acknowledgment, MUST:
  - create no Sale;
  - create no InventoryMovement;
  - modify no balance;
  - return a structured conflict.

A second acknowledged attempt MUST:

- recompute shortages;
- NOT trust prior client shortage numbers;
- permit negative balances if the sale remains otherwise valid;
- persist Sale and all InventoryMovements atomically.

### 21. Shortage Problem Contract

A shortage response SHOULD reuse ProblemDetails and SHOULD expose stable structured fields such as:

- stable code;
- shortages array;
- productId;
- productName when appropriate;
- requiredQuantity;
- currentQuantity;
- shortageQuantity;
- inventoryUnit.

Exact property names MUST follow local error conventions.

HTTP 409 SHOULD be used unless the existing backend establishes a more specific consistent semantic.

### 22. No Double Consumption

If OrderItem Product is a produced PREPARATION:

- Sale MUST decrement the PREPARATION Product inventory.
- Sale MUST NOT expand its Composition.
- Sale MUST NOT create PRODUCTION_CONSUMPTION movements.

If Product is a direct inventory-controlled SALE_ITEM, Sale MUST decrement that Product.

The sale algorithm MUST operate on OrderItem products, not recipe ingredients.

### 23. Sale Idempotency/Duplicate Protection

Without an explicit Idempotency-Key feature:

- a second confirmation for an already sold Order MUST return controlled conflict;
- MUST NOT create another Sale;
- MUST NOT create another InventoryMovement.

Protection MUST include:

- row/state revalidation;
- unique Sale.OrderId DB constraint.

### 24. HU-017 Purchase

A Purchase MUST:

- have exactly one Supplier;
- have one or more PurchaseLines;
- start PENDIENTE;
- contain only existing catalog Products;
- calculate total server-side;
- mutate no inventory at creation.

Each PurchaseLine MUST conceptually include:

- productId;
- quantity >0;
- unitId;
- unitCost.

`unitCost` MUST be decimal and SHOULD be >=0 unless local business rules require >0.

Line total MUST be server-derived.

Purchase total MUST be server-derived.

### 25. Supplier Rules

- Supplier MUST exist.
- Supplier SHOULD be active for a new Purchase unless local current rules explicitly permit purchasing from inactive Suppliers.
- Supplier historical relationship MUST be preserved after later deactivation.
- Supplier data SHOULD NOT be unnecessarily duplicated as mutable master data snapshots.

### 26. Purchase Scope Authorization

The client MUST NOT choose an authoritative Cocina/General scope.

Server MUST derive/validate scope from real Product semantics and actor permissions.

Frozen intent:

- COCINA can manage direct purchases of ingredients used for preparations within kitchen scope.
- ENCARGADO manages beverages, cleaning and general supplies according to real Product semantics.
- ADMINISTRADOR has global purchase scope.
- A multi-role actor gets union.

A Purchase with multiple lines MUST be allowed only if the actor is authorized for **every** line.

The current RN explicitly states that scope is determined by the actual item type, not artificial categories. citeturn240132view0

If the existing local model already persists `purchase_area`, it MUST be server-derived rather than client-authoritative.

### 27. COCINA Receipt Reference

When COCINA directly records a purchase in its allowed scope:

- Purchase MUST retain receipt backing.
- A textual `receiptReference` or equivalent MAY satisfy Sprint 2.
- It MUST NOT require file upload/OCR unless the current local model has a previously approved implementation.
- Empty/blank receipt reference MUST be rejected when the COCINA rule requires it. citeturn240132view1

### 28. Purchase Cancellation

- Only PENDIENTE Purchase MAY be cancelled.
- Cancellation MUST require nonblank reason.
- RECIBIDA MUST NOT be ordinarily cancelled.
- Cancellation MUST produce no InventoryMovement.
- A repeated cancellation of an already CANCELADA Purchase MAY return current state idempotently, but MUST NOT overwrite historical reason/actor/timestamp.
- Cancel vs receive MUST serialize on Purchase row.

### 29. Operational Purchase Read

Backend MAY expose:

- Purchase detail;
- paginated/filterable PENDIENTE list needed by HU-018.

It MUST NOT implement HU-019 reporting/history expansion.

The query MUST have a clear HU-018 consumer.

### 30. HU-018 Purchase Receipt

Only PENDIENTE Purchase MUST be receivable.

Reception request MUST supply actual verified quantity for every PurchaseLine.

For every received line:

- receivedQuantity MUST be >0;
- unit MUST be valid/compatible if selectable;
- backend MUST convert into Product.InventoryUnit for stock movement.

All Purchase lines MUST be accepted in the single definitive receipt.

If any line is missing/rejected:

- Purchase MUST remain PENDIENTE;
- no receipt MUST persist;
- no InventoryMovement MUST persist.

`No aceptar` MUST NOT imply CANCELADA.

### 31. Ordered vs Received Quantity

The system MUST preserve:

- ordered quantity;
- actual received quantity.

Preferred model:

- PurchaseItem retains ordered snapshot.
- PurchaseReceipt identifies the definitive reception.
- PurchaseReceiptLine or equivalent records each actual received quantity.

The system MUST NOT overwrite ordered quantity with received quantity.

The current canonical model allows a single PurchaseReceipt but does not yet represent per-line actual quantity, so a minimal schema extension is required if the local code is still equivalent. citeturn180988view2

### 32. Received Greater Than Ordered

Unless local rules explicitly prohibit it:

- receivedQuantity MAY be less than, equal to, or greater than orderedQuantity;
- receivedQuantity MUST be >0;
- inventory MUST increase by actual accepted quantity.

This preserves physical truth while retaining original ordered quantity.

### 33. Purchase Receive Atomicity

Receive MUST atomically:

- lock Purchase;
- verify PENDIENTE;
- validate all receipt lines;
- persist PurchaseReceipt;
- persist actual received quantities;
- create PURCHASE_RECEIPT movements;
- update balances;
- persist receiver/timestamps;
- transition Purchase to RECIBIDA;
- commit.

Failure MUST roll back all changes.

### 34. Double Receive

- PurchaseReceipt.PurchaseId MUST remain unique.
- State MUST be revalidated under lock.
- Concurrent receives MUST result in exactly one success.
- The loser MUST receive 409 and MUST not create stock movement.

### 35. HU-025 Cash/Shift Foundation

The local audit MUST search for any already existing:

- CashSession;
- Shift;
- ShiftAssignment;
- CashRegister;
- OperationalDay.

If absent, the canonical data model SHOULD be used as baseline:

CashSession:

- one per business_date;
- represents shared cash continuity.

Shift:

- belongs to CashSession;
- exactly the two fixed business shift types current docs define;
- PENDING/ACTIVE/COMPLETED.

ShiftAssignment:

- associates Employee.

The current canonical model proposes MORNING/NIGHT as identifiers, but the APPLY MUST verify they remain current and MUST NOT infer clock times from screenshots. citeturn751423view0

### 36. Two Shifts / One Cash

- The system MUST model one CashSession shared by both shifts.
- MUST NOT create two independent cash registers.
- One shift SHOULD be active at a time unless local current rules explicitly establish overlap.
- The first shift handover MUST NOT close CashSession.
- Final cash closing MUST NOT be implemented in HU-025.
- CashSession.CLOSED SHOULD remain reserved for HU-026/HU-027 if current model uses it.

### 37. Shift Start/Operational Context

The backend MUST provide a deterministic way to obtain/create the current operational context.

The final contract MUST decide from local architecture whether:

- starting the business day creates CashSession + its two fixed Shifts; or
- pre-created Shift records are activated.

The client MUST NOT create arbitrary shift types.

Opening amount/petty cash opening amount MAY be part of CashSession start if required by the canonical model.

### 38. Shift Assignments

- ADMINISTRADOR and ENCARGADO MUST manage assignments.
- Assignment MUST reference Employee, not User.
- MESERO MUST NOT manage arbitrary shift assignments solely due to MESERO.
- MESERO MAY query own/current assignment.
- Duplicate `(ShiftId, EmployeeId)` MUST be prevented.

### 39. Shift Handover

A handover MUST conceptually preserve:

- source Shift;
- destination Shift;
- handover amounts/fund according to current model;
- note optional;
- timestamp;
- actor.

The current model already anticipates cash, QR and external handover amounts. citeturn751423view0

A handover SHOULD atomically:

- lock CashSession;
- lock source/destination Shifts;
- validate source ACTIVE and destination PENDING;
- persist handover;
- mark source COMPLETED;
- activate destination;
- commit.

It MUST NOT create a CashClosing.

### 40. Shift and Expense

If Expense lacks ShiftId in the local implementation:

- schema evolution MUST be additive;
- historical rows MUST remain valid;
- ShiftId SHOULD initially be nullable at migration level;
- new Expense creation SHOULD resolve current active Shift server-side when available;
- client Sprint 1 Expense request MUST NOT gain a required ShiftId;
- existing frontend contract SHOULD remain valid.

The current public Expense entity has no ShiftId while the canonical model expects one. citeturn293447view4turn180988view2

### 41. Shift and Existing Orders

Existing Order.ShiftId is publicly nullable.

Sprint 2 SHOULD avoid retroactively requiring historical Orders to possess Shift.

Future Orders created while HU-025 is operational MAY be associated server-side if the current business design requires it, but this change MUST NOT break Sprint 1 Order creation contract.

Sale itself MUST have a valid Shift.

### 42. Operational Time

- Critical timestamps MUST be server-authoritative.
- DB timestamps SHOULD remain `timestamptz`.
- Calendar business date MUST use operational timezone `America/La_Paz`.
- Backend MUST NOT use browser timezone.
- A central operational clock abstraction SHOULD be reused/extended if one already exists.
- Business-date resolution MUST be testable with controlled clock.

### 43. Actors

The client MUST NOT supply authoritative:

- CreatedBy;
- ConfirmedBy;
- ReceivedBy;
- HandedOverBy;
- InventoryMovement.Actor.

Authenticated User is source for User audit fields.

Employee relationship MUST be used where the domain field is operational Employee responsibility.

### 44. Transaction Rules

Critical multi-entity operations MUST execute in one transaction:

- Composition replacement.
- Production.
- Sale confirmation.
- Purchase creation with lines.
- Purchase cancellation.
- Purchase reception.
- Shift handover.

MinStock update MAY use normal single-aggregate persistence.

### 45. Lock Ordering

Recommended global ordering:

1. operational/aggregate root when one exists;
2. Product/InventoryBalance rows sorted by ProductId;
3. dependent inserts.

Specific:

- Sale:
  - active CashSession/Shift context;
  - Order;
  - Product/Balance rows sorted.
- Purchase receive/cancel:
  - Purchase first;
  - Product/Balance sorted for receive.
- Production:
  - involved Product/Balance rows sorted.
- Shift handover:
  - CashSession;
  - Shift rows in stable order.

The final implementation MAY vary if the existing HU-005 lock pattern dictates a safer equivalent, but MUST document one deterministic ordering.

### 46. Concurrency

The backend MUST cover at minimum:

- concurrent Production on same ingredients;
- Production vs Sale on same stock;
- two Sales on same Order;
- two Sales on same Product;
- Sale shortage acknowledgment vs intervening stock mutation;
- receive vs cancel same Purchase;
- double receive;
- two receives affecting same Product;
- concurrent Shift handover;
- Sale vs Shift handover.

Process-local locks MUST NOT be the sole authority.

PostgreSQL transaction/row locking/constraints MUST be used as appropriate.

### 47. ProblemDetails

The existing ProblemDetails strategy MUST be reused.

Expected semantic classes:

- 400:
  - validation;
  - incompatible unit;
  - invalid quantity;
  - invalid enum/request.
- 401:
  - unauthenticated.
- 403:
  - role/scope denied.
- 404:
  - missing Product/Order/Purchase/Supplier/Shift.
- 409:
  - insufficient production stock;
  - sale order not ENTREGADO;
  - Sale already confirmed;
  - Sale shortage acknowledgment required;
  - Purchase state conflict;
  - Purchase already received;
  - no active Shift;
  - invalid Shift transition;
  - concurrency business conflict.

No raw SQL/constraint/stack details MUST leak.

### 48. Backward Compatibility

Sprint 2 MUST prefer additive changes.

It MUST NOT:

- remove Sprint 1 endpoints;
- rename existing DTO properties without necessity;
- make existing request fields suddenly mandatory;
- change Inventory manual movement semantics;
- change Orders/Kitchen state machines;
- change Expense request by requiring ShiftId;
- alter Auth/JWT.

If a breaking change proves unavoidable, APPLY MUST stop for explicit analysis before implementing it.

### 49. Migrations

- New schema changes MUST use new EF migrations.
- Historical migrations MUST NOT be edited.
- Snapshot MUST be updated.
- Migration MUST apply from a clean disposable PostgreSQL database using the full chain.
- Existing-data migration path MUST also be considered.
- Critical transaction tables MUST use RESTRICT/no destructive cascade.
- Monetary values MUST use decimal/numeric.
- Physical quantities MUST use decimal/numeric.
- Enum columns SHOULD follow current varchar+CHECK convention.

### 50. OpenAPI

Every Sprint 2 endpoint MUST expose:

- auth/security;
- request schema;
- response schema;
- enum values;
- validation/error status;
- ProblemDetails;
- paging/filter parameters when relevant.

API MUST continue under `/api/v1`.

No `/api/v2` is justified.

Frontend types MUST not be generated in this backend change.

## Proposed Final Backend Contract Plan

Exact paths MAY adapt to local endpoint naming conventions, but capability MUST remain equivalent.

| HU         | Method | Proposed Route                                  | Policy                                  | Request                         | Response                            | Main Errors     |
| ---------- | ------ | ----------------------------------------------- | --------------------------------------- | ------------------------------- | ----------------------------------- | --------------- |
| HU-004     | GET    | `/api/v1/products/{id}/composition`             | Catalog/Composition read allowed policy | none                            | CompositionDto                      | 404             |
| HU-004     | PUT    | `/api/v1/products/{id}/composition`             | ADMIN/ENCARGADO                         | ReplaceCompositionRequest       | CompositionDto                      | 400,403,404,409 |
| HU-006     | PUT    | `/api/v1/products/{id}/minimum-stock`           | ADMIN/ENCARGADO                         | MinimumStockRequest             | InventoryBalanceDto/Product min DTO | 400,403,404     |
| HU-006     | GET    | existing `/api/v1/inventory/balances`           | existing read policy incl. COCINA       | additive `lowStock?` if adopted | PagedResponse balance               | 400,401,403     |
| HU-007     | GET    | `/api/v1/products/{id}/production-requirements` | COCINA/ENCARGADO/ADMIN                  | `quantity` query                | ProductionRequirementsDto           | 400,403,404,409 |
| HU-007     | POST   | `/api/v1/productions`                           | COCINA/ENCARGADO/ADMIN                  | CreateProductionRequest         | ProductionDto                       | 400,403,404,409 |
| HU-012/013 | POST   | `/api/v1/sales`                                 | MESERO/ENCARGADO/ADMIN                  | ConfirmSaleRequest              | SaleDto                             | 400,403,404,409 |
| HU-012     | GET    | `/api/v1/sales/{id}`                            | authorized sales read policy            | none                            | SaleDto                             | 403,404         |
| HU-017     | POST   | `/api/v1/purchases`                             | purchase-scope policy                   | CreatePurchaseRequest           | PurchaseDto                         | 400,403,404,409 |
| HU-017/018 | GET    | `/api/v1/purchases/{id}`                        | purchase read policy                    | none                            | PurchaseDto                         | 403,404         |
| HU-018     | GET    | `/api/v1/purchases`                             | purchase operational read policy        | page/pageSize/status?           | PagedResponse PurchaseSummaryDto    | 400,403         |
| HU-017     | POST   | `/api/v1/purchases/{id}/cancel`                 | actor authorized for Purchase scope     | CancelPurchaseRequest           | PurchaseDto                         | 400,403,404,409 |
| HU-018     | POST   | `/api/v1/purchases/{id}/receive`                | authorized reception policy             | ReceivePurchaseRequest          | PurchaseDto                         | 400,403,404,409 |
| HU-025     | POST   | `/api/v1/shifts/open` or repo-equivalent        | ADMIN/ENCARGADO                         | OpenOperationalDayRequest       | ShiftContextDto                     | 400,403,409     |
| HU-025     | GET    | `/api/v1/shifts/current`                        | ADMIN/ENCARGADO                         | none                            | ShiftContextDto                     | 404/409         |
| HU-025     | GET    | `/api/v1/shifts/me/current`                     | MESERO/authorized employee              | none                            | MyShiftDto                          | 404             |
| HU-025     | PUT    | `/api/v1/shifts/{id}/assignments`               | ADMIN/ENCARGADO                         | ShiftAssignmentsRequest         | ShiftDto                            | 400,403,404,409 |
| HU-025     | POST   | `/api/v1/shifts/{id}/handover`                  | ADMIN/ENCARGADO                         | ShiftHandoverRequest            | ShiftContextDto                     | 400,403,404,409 |

A second-shift “complete” operation SHOULD only be added if HU-025 itself requires ending the second operational shift separately from future CashClosing. It MUST NOT calculate or persist HU-026/HU-027 closing.

## Authorization Matrix

`✓` means capability permitted by the role alone; multi-role users obtain union.

| Capability                     | ADMINISTRADOR |    ENCARGADO    |         MESERO         |                          COCINA                          |             CONTADORA             | EMPLEADO |
| ------------------------------ | :-----------: | :-------------: | :--------------------: | :------------------------------------------------------: | :-------------------------------: | :------: |
| Read Composition               |       ✓       |        ✓        | SHOULD audit read need |                  ✓ for production need                   |           SHOULD audit            |    —     |
| Manage Composition             |       ✓       |        ✓        |           —            |                            —                             |                 —                 |    —     |
| Read inventory/low stock       |       ✓       |        ✓        | preserve Sprint1 read  |                            ✓                             |       preserve Sprint1 read       |    —     |
| Configure MinStock             |       ✓       |        ✓        |           —            |                            —                             |                 —                 |    —     |
| Register Production            |       ✓       |        ✓        |           —            |                            ✓                             |                 —                 |    —     |
| Confirm Sale                   |       ✓       |        ✓        |           ✓            |                            —                             |                 —                 |    —     |
| Override sale shortage         |       ✓       |        ✓        |           ✓            |                            —                             |                 —                 |    —     |
| Register Purchase              |   ✓ global    | ✓ allowed scope |           —            |                ✓ kitchen ingredient scope                |                 —                 |    —     |
| Cancel own/authorized Purchase |       ✓       |     ✓ scope     |           —            |                     ✓ kitchen scope                      |                 —                 |    —     |
| Receive Purchase               |       ✓       |     ✓ scope     |           —            | ✓ kitchen scope if current RN permits “manage” reception |                 —                 |    —     |
| Manage Shifts                  |       ✓       |        ✓        |           —            |                            —                             |                 —                 |    —     |
| Operate/view own Shift         |       ✓       |        ✓        |           ✓            |                            —                             | read only only if HU/docs require |    —     |

The exact read-only rows MUST be tightened against local RF/policies before implementation. Mutating permissions above follow frozen rules.

## Transaction Matrix

| Operation           | Transaction Required         | Inventory Mutation       | Concurrency Risk  | Idempotency                                                                            |
| ------------------- | ---------------------------- | ------------------------ | ----------------- | -------------------------------------------------------------------------------------- |
| Composition replace | YES                          | none                     | concurrent edits  | PUT target state SHOULD be idempotent                                                  |
| MinStock config     | normal aggregate transaction | none                     | concurrent edit   | PUT SHOULD be idempotent                                                               |
| Production          | YES                          | consumption + output     | high              | each successful POST creates a distinct event                                          |
| Sale                | YES                          | SALE outputs             | critical          | duplicate Order sale rejected                                                          |
| Purchase create     | YES                          | none                     | moderate          | duplicate POST means distinct Purchase                                                 |
| Purchase cancel     | YES                          | none                     | cancel vs receive | repeat CANCELADA MAY return current state without overwriting audit                    |
| Purchase receive    | YES                          | PURCHASE_RECEIPT entries | critical          | second receive rejected                                                                |
| Shift handover      | YES                          | none                     | critical          | duplicate transition rejected or returns stable current result without duplicate audit |

## Behavior Scenarios

### Scenario 1: Valid composition

Given una PREPARATION activa y dos ingredientes activos con unidades compatibles  
When ADMINISTRADOR reemplaza su composición con cantidades válidas  
Then la composición MUST persistirse atómicamente  
And no InventoryMovement MUST crearse

### Scenario 2: Incompatible composition unit

Given un componente con InventoryUnit MASS  
When se intenta guardar su consumo en una unidad VOLUME  
Then la operación MUST ser rechazada con validation ProblemDetails  
And la composición anterior MUST permanecer intacta

### Scenario 3: Low stock equality

Given CurrentQuantity = 5 y MinStock = 5  
When se consulta el balance  
Then IsLowStock MUST ser true

### Scenario 4: Negative low stock

Given CurrentQuantity = -3 y MinStock = 5  
When se consulta el balance  
Then CurrentQuantity MUST permanecer -3  
And IsLowStock MUST ser true

### Scenario 5: Production sufficient

Given una composición válida y stock suficiente para todos los componentes  
When COCINA registra una cantidad final válida  
Then Production MUST persistir  
And los consumos MUST persistir  
And todos los component balances MUST disminuir  
And el prepared Product balance MUST aumentar  
And todos los movimientos MUST referenciar la misma Production

### Scenario 6: Production shortage

Given al menos un componente con stock insuficiente  
When se intenta registrar Production  
Then backend MUST rechazar la operación  
And no Production MUST existir  
And no ProductionConsumption MUST existir  
And no InventoryMovement MUST existir  
And ningún balance MUST cambiar

### Scenario 7: Production stale preview

Given el usuario obtuvo un preview con stock suficiente  
And otra operación consume stock antes de la confirmación  
When se confirma Production  
Then backend MUST recalcular bajo lock  
And MUST rechazar si ahora existe faltante

### Scenario 8: Sale only delivered

Given Order está LISTO  
When MESERO intenta confirmar Sale  
Then MUST recibir 409  
And no Sale ni InventoryMovement MUST persistirse

### Scenario 9: Valid sale

Given Order está ENTREGADO  
And existe Shift operativo válido  
And no existe Sale para ese Order  
And existe stock suficiente  
When MESERO confirma la venta  
Then Sale MUST usar OrderItem prices server-side  
And MUST persistir SaleItem snapshots  
And MUST descontar inventario  
And MUST relacionarse con Shift  
And MUST commit atómicamente

### Scenario 10: Duplicate sale

Given Order ya tiene Sale  
When cualquier request intenta confirmarlo nuevamente  
Then MUST recibir 409  
And no nuevo Sale ni InventoryMovement MUST aparecer

### Scenario 11: Sale shortage without acknowledgment

Given Order ENTREGADO requiere 5 unidades y CurrentQuantity es 2  
When confirmación no contiene acknowledgment  
Then backend MUST responder structured 409  
And MUST reportar shortage 3  
And MUST persistir cero cambios

### Scenario 12: Sale shortage acknowledged

Given la venta tiene faltante  
When el actor vuelve a confirmar con acknowledgment explícito  
Then backend MUST recalcular stock  
And si la operación sigue válida MUST confirmar Sale  
And balance MAY quedar negativo

### Scenario 13: Produced preparation sale

Given una PREPARATION ya fue producida y sus ingredientes ya se consumieron  
When esa PREPARATION se vende  
Then Sale MUST disminuir el balance de PREPARATION  
And MUST NOT disminuir nuevamente sus componentes

### Scenario 14: Purchase multiline

Given Supplier activo y tres Products existentes autorizados  
When actor autorizado crea Purchase  
Then una Purchase PENDIENTE MUST persistir con tres lines  
And total MUST derivarse server-side  
And no InventoryMovement MUST crearse

### Scenario 15: Cocina scope purchase

Given COCINA intenta una Purchase con un Product fuera de su ámbito  
When backend valida las líneas  
Then MUST responder 403  
And ninguna Purchase parcial MUST persistirse

### Scenario 16: Cocina receipt backing

Given COCINA registra una compra permitida  
When receiptReference obligatorio está vacío  
Then request MUST ser rechazado  
And no Purchase MUST persistirse

### Scenario 17: Cancel pending purchase

Given Purchase PENDIENTE  
When actor autorizado cancela con motivo no vacío  
Then Purchase MUST pasar a CANCELADA  
And audit MUST persistir  
And no inventory change MUST ocurrir

### Scenario 18: Receive actual quantity

Given una Purchase PENDIENTE con orderedQuantity 10 kg  
When el receptor verifica 9.85 kg y acepta toda la compra  
Then actual received quantity MUST persistir como 9.85 kg  
And inventory MUST aumentar 9.85 kg convertidos a InventoryUnit  
And orderedQuantity MUST permanecer 10 kg

### Scenario 19: Incomplete reception

Given una Purchase tiene tres lines  
When request omite una line  
Then Purchase MUST permanecer PENDIENTE  
And no receipt ni movements MUST persistirse

### Scenario 20: Double receive race

Given dos requests concurrentes reciben la misma Purchase PENDIENTE  
When ambas alcanzan backend  
Then exactamente una MUST hacer commit  
And la otra MUST recibir conflict  
And inventario MUST incrementarse una sola vez

### Scenario 21: Two shifts one cash

Given empieza una nueva business date  
When ADMINISTRADOR abre la operación diaria  
Then MUST existir una sola CashSession para esa business date  
And los dos Shift records definidos MUST pertenecer a ella  
And no second CashRegister MUST crearse

### Scenario 22: Handover

Given primer Shift ACTIVE y segundo PENDING  
When ENCARGADO registra handover válido  
Then source MUST quedar COMPLETED  
And destination MUST quedar ACTIVE  
And CashSession MUST permanecer OPEN  
And no CashClosing MUST crearse

### Scenario 23: Sale around handover

Given una Sale y un handover ocurren concurrentemente  
When ambas transacciones se serializan  
Then Sale MUST pertenecer inequívocamente al Shift que estaba operativo en su serialization point  
And MUST NOT quedar sin Shift

### Scenario 24: Expense after shift foundation

Given HU-020 request existente no contiene ShiftId  
And existe Shift ACTIVE  
When se registra un nuevo Expense  
Then backend SHOULD asociarlo server-side al Shift  
And Sprint 1 request contract MUST continuar válido

## Edge Cases

- Composition con componente repetido.
- Parent == component.
- Parent inactivo.
- Component inactivo después de guardar composition pero antes de Production.
- Unit desactivada después de composition.
- FactorToBase inválido en datos históricos.
- quantity con cuatro decimales.
- MinStock = 0.
- MinStock null.
- concurrent MinStock updates.
- Production quantity extremadamente pequeña pero válida.
- Production output Product sin balance materializado.
- dos Production creando primer balance simultáneamente.
- Product desactivado después de Order pero antes de Sale.
- Shift handover mientras Sale confirma.
- Order ENTREGADO con Product catalog posteriormente inactivo.
- Sale request retry por network timeout después de commit.
- PEDIDOSYA con payment method incompatible.
- Purchase con Product repetido en dos lines.
- Purchase con unidad compatible distinta a InventoryUnit.
- unitCost = 0.
- Supplier desactivado entre selector y create.
- Purchase actor multi-role.
- Purchase COCINA con lines mixtas permitida/no permitida por scope.
- receivedQuantity superior a orderedQuantity.
- receivedQuantity 0.
- receivedQuantity con unidad distinta pero compatible.
- Purchase rejected but not cancelled.
- cancel and receive race.
- business date boundary around midnight Bolivia.
- server running in UTC or different OS timezone.
- two requests open same CashSession business date.
- two handovers concurrent.
- MESERO without Employee relation querying own shift.
- historical Expense with ShiftId null.
- historical Order with ShiftId null.
- OpenAPI generation of typed ProblemDetails extensions.
- nullable fields added to existing rows.

## Acceptance Criteria

### HU-004

- A manager MUST be able to persist a composition with multiple valid components.
- Duplicate component MUST be rejected.
- Inactive/missing component MUST be rejected.
- Incompatible unit MUST be rejected.
- Updating composition MUST create no InventoryMovement.
- Production scaling semantics MUST be explicitly resolved before Production implementation.

### HU-006

- ADMIN/ENCARGADO MUST configure MinStock.
- COCINA MUST query low-stock state.
- Equality MUST yield low stock.
- Negative balance MUST remain negative and low.
- No LowStockAlert table MUST be required.
- No notification channel MUST be introduced.

### HU-007

- Successful Production MUST produce one Production record.
- Each required component MUST produce a negative movement.
- Produced Product MUST produce a positive movement.
- Every movement MUST reference Production.
- Insufficient component stock MUST produce zero persisted side effects.
- Repeated Production MUST accumulate prepared balance.
- Production MUST not allow negative ingredient balance.

### HU-012

- Sale MUST reject any Order not ENTREGADO.
- One Order MUST have at most one Sale.
- Client total/price MUST not be authoritative.
- Sale MUST persist server-derived snapshots.
- Sale MUST resolve a Shift.
- Sale MUST create traceable inventory movements.
- Sale MUST not implement Customer/discount/tax/fiscal flows.

### HU-013

- Shortage without acknowledgment MUST return structured conflict.
- Conflict MUST persist zero Sale/inventory changes.
- Acknowledged retry MUST recalculate stock.
- Sale MAY leave negative balance after explicit acknowledgment.
- Client shortage values MUST never become authority.

### HU-017

- Purchase MUST support multiple lines.
- Purchase MUST use one Supplier.
- Purchase MUST use existing Products only.
- Purchase MUST start PENDIENTE.
- Purchase create MUST produce zero InventoryMovements.
- Purchase total MUST be server-derived.
- Cancel PENDIENTE MUST require reason.
- RECIBIDA MUST not be ordinarily cancelable.
- COCINA scope MUST be validated from real Products.

### HU-018

- Only PENDIENTE MUST be receivable.
- Actual quantity MUST be persisted separately from ordered quantity.
- Inventory MUST use actual received quantity.
- All lines MUST be accepted together.
- Missing/rejected line MUST create no receipt or movement.
- Exactly one concurrent receive MUST succeed.
- Partial structured reception MUST not exist.

### HU-025

- One business date MUST map to one shared CashSession.
- The business MUST have only the two configured shift types.
- Arbitrary shift type creation MUST not exist.
- Handover MUST not create CashClosing.
- Sale MUST persist Shift.
- Expense evolution MUST remain backward-compatible.
- MESERO MUST not manage arbitrary shifts.

### Delivery

- Clean PostgreSQL migration chain MUST pass.
- Full backend build MUST pass.
- Full backend tests MUST pass with failed=0.
- OpenAPI MUST expose all Sprint 2 contracts.
- No Sprint 1 breaking change MUST exist without explicit justification.
- Frontend Sprint 2 MUST remain unmodified.
- Each of the eight HU docs MUST end `BACKEND IMPLEMENTADO / FRONTEND PENDIENTE`.
- No fictitious evidence MUST be recorded.

## Out of Scope

- Frontend.
- Generated TypeScript.
- HU-008.
- HU-014.
- HU-019.
- HU-021.
- HU-026.
- HU-027.
- Fiscal invoicing.
- Customer management.
- Discounts.
- credit.
- cost accounting.
- physical lots.
- expiry.
- partial receipt workflow.
- external notifications.
- arbitrary shift CRUD.
- final cash reconciliation.
- digital signatures.
- printing.
- dashboard/reporting.
