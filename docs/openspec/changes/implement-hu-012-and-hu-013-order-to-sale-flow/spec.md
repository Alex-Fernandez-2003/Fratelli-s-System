# Spec

## Requirements

## HU-013 — Order-time stock shortage

### Stock authority

- The backend MUST be the authoritative source for Order stock sufficiency.
- The frontend MUST NOT decide authoritative shortages from locally cached balances.
- The stock check MUST use the same Inventory authority/foundation used by Sale.
- The implementation MUST NOT create a second balance, ledger or reservation system.

### Create Order contract

- The existing `POST /api/v1/orders` route MUST remain unchanged.
- Its HTTP verb MUST remain POST.
- The request MUST retain all existing fields.
- The request MAY add one backward-compatible optional acknowledgement field.
- The preferred semantic name is `acknowledgeStockShortage` when compatible with the local contract conventions.
- Missing acknowledgement MUST behave as false.
- OpenAPI MUST model the property as backward-compatible; existing clients MUST NOT be forced to send it solely to preserve old behavior.

### Sufficient stock

- When all requested sellable Products have sufficient current stock, Order creation MUST proceed normally.
- A sufficient Order MUST NOT require acknowledgement.
- Order creation MUST NOT generate an InventoryMovement.
- Exact available stock equal to required quantity MUST be sufficient for HU-013.
- Order creation MUST preserve the current Kitchen/no-Kitchen initial-status rules.

### Insufficient stock without acknowledgement

- When one or more Order Products are insufficient and acknowledgement is absent/false, the backend MUST NOT create a definitive Order.
- The backend MUST NOT create OrderItems.
- The backend MUST NOT create a KitchenCommand.
- The backend MUST NOT create KitchenCommandItems.
- The backend MUST NOT create InventoryMovements.
- The backend MUST return a machine-readable conflict using the existing ProblemDetails convention.
- HTTP 409 SHOULD be preserved as the conflict status.
- The response MUST include a stable machine-readable code.
- The response MUST include every current shortage, not only the first one.

### Shortage shape

Each shortage MUST expose sufficient server-derived information to render the decision:

- Product identity;
- Product display name;
- required quantity;
- current quantity;
- shortage quantity;
- Inventory unit identity;
- a usable unit label/symbol when the baseline can expose it without extra client inference.

- `shortageQuantity` MUST be a nonnegative magnitude.
- The UI label `Faltante` MUST display that positive magnitude.
- The frontend MUST NOT negate the authoritative shortage to fabricate the displayed value.

### Explicit acknowledgement

- Continuing with insufficient stock MUST require a new backend request.
- The frontend MUST send the explicit acknowledgement in that second request.
- Frontend-only state MUST NOT bypass backend validation.
- The backend MUST re-evaluate stock during the acknowledged request.
- The acknowledgement MUST apply to the current authoritative shortage condition, not a client-calculated snapshot.
- If shortages differ from those returned by the first request, the backend result MUST be based on the newer state.
- An acknowledged request MAY create the Order even when the resulting future Sale can drive stock negative.
- The acknowledged Order creation MUST still create no InventoryMovement.

### No duplicate Order

- The first shortage-conflict request MUST NOT leave a committed Order.
- Retrying with acknowledgement MUST result in at most one committed Order for that interaction.
- The UI MUST prevent accidental concurrent double submission while a create request is pending.

### Acceptance trace

- When acknowledgement actually permits creation despite an existing shortage, the system MUST persist traceability of:
  - authenticated User;
  - backend-authoritative timestamp.
- The client MUST NOT provide actor or timestamp.
- The system SHOULD represent acknowledgement using the smallest compatible Order audit shape.
- A shortage snapshot MUST NOT be persisted merely to reproduce old quantities.
- If acknowledgement=true is sent but the authoritative retry finds no shortage, the system SHOULD create the Order normally without marking a shortage acceptance that was not needed.

### Inventory timing

- Order creation MUST NOT decrement Inventory.
- Order creation MUST NOT reserve Inventory.
- Order cancellation before Sale MUST NOT require releasing a new reservation because this change MUST NOT create reservations.
- Inventory MUST remain authoritatively affected during Sale confirmation.

## HU-012 — Sale confirmation

### Sale origin

- A Sale MUST originate from an existing Order.
- The system MUST NOT implement standalone/free Sale.
- Checkout MUST be tied to a real Order id.

### Eligibility

- Only an Order with status `ENTREGADO` MAY be confirmed as a Sale.
- `PENDIENTE` MUST be rejected.
- `EN_PREPARACION` MUST be rejected.
- `LISTO` MUST be rejected.
- `CANCELADO` MUST be rejected.
- Frontend action visibility MUST reflect this rule.
- Backend MUST enforce it independently of frontend.

### Sale uniqueness

- One Order MUST NOT produce more than one Sale.
- Existing database uniqueness on Sale.OrderId MUST be preserved when present.
- Backend MUST retain transaction/locking protection against concurrent duplicate confirmation.
- A duplicate confirmation MUST result in a controlled conflict and MUST NOT create extra InventoryMovements.

### Total

- The backend MUST remain authoritative for Sale subtotal and total.
- The frontend MUST NOT send authoritative line prices or total.
- Sale lines MUST continue to derive Quantity and UnitPrice from Order snapshots.
- The frontend MAY display Order line totals and total supplied by the server.
- The frontend MUST NOT provide editable price controls.

### Payment methods

- Only PaymentMethod values exposed by the real backend MAY be sent.
- With the audited baseline, supported values are:
  - `CASH`;
  - `QR`;
  - `EXTERNAL`.
- UI labels SHOULD be:
  - CASH → Efectivo;
  - QR → QR;
  - EXTERNAL → Externo.
- The frontend MUST NOT claim that QR is generated or bank-verified.
- The frontend MUST NOT describe EXTERNAL as cards/transfers unless the local canonical contract explicitly defines that meaning.

### Sales channel

- Only SalesChannel values exposed by the real backend MAY be sent.
- With the audited baseline:
  - `DIRECT`;
  - `PEDIDOSYA`.
- PedidosYa MUST be treated as a channel, not a payment method.
- The change MUST NOT implement an external PedidosYa integration.
- If the final local Order contract already contains an authoritative channel, checkout MUST inherit/display it and MUST NOT permit contradiction.
- If Order has no authoritative channel, checkout MUST require/select the channel for ConfirmSale.
- The frontend MUST respect the backend-supported channel/payment combinations.
- With the currently audited implementation:
  - DIRECT MAY use CASH or QR;
  - PEDIDOSYA MUST use EXTERNAL;
  - invalid combinations MUST be rejected server-side.

### Customer

- HU-012 MUST NOT require Customer.
- Checkout MUST NOT render a functional Customer selector.
- Checkout MUST NOT render NIT search.
- Checkout MUST NOT introduce CustomerId into Sale solely for these mockups.

### Discounts

- HU-012 MUST NOT implement discounts.
- Checkout MUST NOT show a functional discount row.
- The UI SHOULD omit the row entirely rather than display a misleading fixed `0`.

### Shift

- Sale MUST reference the current operational Shift.
- Current operational Shift MUST be resolved using the already-stabilized business-day/CashSession rules.
- Client MUST NOT select an arbitrary ShiftId for Sale confirmation.
- Client MUST NOT send a fake cash-register identifier.
- UI MUST NOT display `Caja 1` unless such a real concept exists in the local contract.
- Shift information MAY be shown only when available through a reliable current contract.

### Time and actor

- Sale confirmation time MUST be server-authoritative.
- The backend MUST use the established operational clock.
- Sale actor MUST come from the authenticated principal.
- The client MUST NOT send ConfirmedByUserId.
- The client MUST NOT send ConfirmedAt.

### Inventory

- ConfirmSale MUST remain an atomic inventory/business transaction.
- ConfirmSale MUST create Inventory movements of type SALE using the existing Inventory writer.
- Sale of a produced PREPARATION MUST decrement the preparation Product stock.
- Sale MUST NOT recursively consume its composition ingredients again.
- Sale MUST preserve InventoryMovement traceability to the Sale.
- Failed Sale confirmation MUST NOT leave Sale/SaleItem/Inventory partial state.

## HU-013 + HU-012 — final revalidation

### Previously acknowledged Order

- If an Order already contains a valid stock-shortage acknowledgement trace, final Sale revalidation MAY allow negative Inventory when current stock is insufficient.
- Final Sale MUST still use authoritative locked Inventory state.
- Prior acknowledgement MUST NOT cause the backend to skip the final stock read/lock.

### New shortage appearing only at checkout

- If the Order did not previously require/record shortage acknowledgement and a new shortage appears before Sale, the backend MUST NOT silently create negative Inventory.
- The existing Sale-time acknowledgement mechanism SHOULD remain as the exceptional safety fallback.
- The first Sale attempt MUST return authoritative current shortages.
- The frontend MUST display the same shortage decision UI in this exceptional case.
- Continuing MUST issue a second Sale request with explicit acknowledgement.
- The backend MUST revalidate under its normal locking strategy.
- This fallback MUST NOT replace Order creation as the normal HU-013 warning point.

### Authoritative locked shortages

- If a final Inventory write detects shortage under lock, the returned shortages MUST come from that authoritative locked result.
- The backend MUST NOT return an empty/stale shortage list calculated only before acquiring Inventory locks.

## ProblemDetails

- Validation input errors MUST use existing 400 semantics.
- Unauthenticated requests MUST use existing 401 semantics.
- Forbidden requests MUST use existing 403 semantics.
- Missing Order MUST use existing 404 semantics.
- State conflicts, duplicate Sale and acknowledgement-required shortages SHOULD use existing 409 semantics.
- Shortage conflicts MUST expose a stable `code`.
- Shortage conflicts MUST expose structured `shortages`.
- Frontend MUST detect the code structurally.
- Frontend MUST NOT parse English/Spanish human-readable `title` or `detail` to detect shortage.
- Raw SQL, stack traces and constraint names MUST NOT be exposed.

## Sale response / receipt readiness

- ConfirmSale success MUST return enough actual persisted data for the success UI without fabricating values.
- The response SHOULD add, when absent:
  - SalesChannel;
  - PaymentMethod;
  - ConfirmedAt;
  - ConfirmedByUserId;
  - ConfirmedByDisplayName when safely resolvable.
- Existing SaleDto fields MUST remain.
- Additive response fields MUST NOT require a new endpoint.
- Sale persistence MUST preserve Order relation, Product reference, quantities, unit-price snapshots and line totals.
- This change MUST NOT introduce a Receipt entity only for future printing.
- This change MUST NOT implement receipt rendering.
- This change MUST NOT implement fiscal invoicing.

## Frontend routing

- Checkout SHOULD use an Order-owned route such as `/pedidos/:id/cobrar` when the local route conventions remain as audited.
- The checkout route MUST use the same role guard as Orders:
  - ADMINISTRADOR;
  - ENCARGADO;
  - MESERO.
- Direct checkout access for an ineligible Order MUST show controlled ineligible/not-found/conflict handling.
- The backend remains the final eligibility authority.

## New Order shortage UX

- NewOrderPage MUST preserve the draft when the shortage modal opens.
- The first 409 shortage conflict MUST open the shortage dialog.
- The dialog MUST render all shortages.
- `Volver` MUST close the dialog and preserve the draft.
- `Volver` MUST NOT send an acknowledged request.
- `Continuar` MUST send the same business draft with explicit acknowledgement.
- While the retry is pending, controls MUST prevent duplicate submission.
- On successful acknowledged create, the existing navigation to Order detail SHOULD continue.

## Checkout UX

- Checkout MUST load the real Order.
- Checkout MUST display `ENTREGADO`, not the mockup's `Pendiente`.
- Table/reference MAY be shown when present.
- Customer controls MUST be absent.
- Discount controls/rows MUST be absent.
- Fake cash-register identifiers MUST be absent.
- Channel controls MUST follow the authoritative/inherited rule.
- Payment controls MUST expose only legal options.
- The primary CTA MUST be equivalent to `Confirmar venta`.
- Mutation pending MUST disable the relevant confirm controls.
- No optimistic Sale MUST be rendered before 201 success.

## Cancel checkout

- `Cancelar cobro` MUST perform no backend mutation.
- It MUST NOT cancel the Order.
- It MUST NOT create/cancel Sale.
- It MUST NOT alter Shift.
- It MUST NOT alter Inventory.
- It SHOULD navigate back to Orders or the previous Order context.

## Success UX

- Success MUST say that the Sale was registered/confirmed.
- Success MUST NOT claim that a receipt was generated.
- Success MAY display:
  - Sale id;
  - total;
  - payment method;
  - channel;
  - responsible display name;
  - server timestamp.
- Displayed values MUST come from server response/current authenticated identity only where semantically safe.
- Primary success action MUST be equivalent to `Volver a pedidos`.
- The success experience MUST NOT offer a standalone `Nueva venta` workflow.

## Responsive and accessibility

- Checkout MUST be usable on desktop.
- Checkout MUST be usable at approximately 360 px.
- Desktop MAY use a two-column layout.
- Mobile SHOULD stack Order details, channel/payment controls and actions.
- A sticky mobile total/CTA MAY be used if it does not hide content or violate safe-area/accessibility.
- Shortage modal MUST handle multiple rows without horizontal overflow.
- Shortage state MUST not rely on color alone.
- Dialog focus management and keyboard behavior MUST reuse existing accessible primitives.
- Monetary output MUST use the established BOB formatting convention.

## OpenAPI and generated client

- Backend changes MUST stabilize before OpenAPI regeneration.
- Runtime OpenAPI MUST expose the final CreateOrder acknowledgement contract.
- Runtime OpenAPI MUST expose the structured shortage response shape where supported by project tooling.
- Runtime OpenAPI MUST expose the additive SaleDto fields.
- `frontend/src/types/api.generated.ts` MUST be regenerated from runtime OpenAPI.
- Generated TypeScript MUST NOT be manually edited.
- Existing route names and HTTP verbs MUST remain compatible.

## Documentation traceability

- HU-012 and HU-013 MUST remain separate history documents.
- HU-012 documentation MUST list only HU-012-specific/shared files with explanation.
- HU-013 documentation MUST list only HU-013-specific/shared files with explanation.
- A shared file MAY appear in both manifests with distinct purpose.
- Automated evidence MUST be recorded only after execution.
- Screenshots/manual acceptance MUST NOT be fabricated.

## Behavior Scenarios

### Scenario 1: Order with sufficient stock

Given a valid Order draft whose Products all have sufficient stock  
When the actor creates the Order without shortage acknowledgement  
Then the backend creates one Order  
And returns the normal OrderDto  
And creates no SALE InventoryMovement  
And no acknowledgement trace is required

### Scenario 2: Exact stock is sufficient

Given a Product requires quantity 5  
And current authoritative stock is 5  
When the Order is created  
Then the backend treats the Product as sufficient  
And does not require HU-013 acknowledgement

### Scenario 3: Insufficient Order without acknowledgement

Given an Order draft requires more stock than currently exists  
When `POST /api/v1/orders` is sent without acknowledgement  
Then the backend returns a structured conflict  
And includes every shortage  
And commits no Order  
And commits no OrderItem  
And commits no KitchenCommand  
And commits no InventoryMovement

### Scenario 4: Multiple shortages

Given an Order has three insufficient Products  
When the unacknowledged Create Order request is evaluated  
Then the response contains all three shortage entries  
And each shortage quantity is a positive magnitude

### Scenario 5: Return from shortage warning

Given New Order received a shortage conflict  
When the user chooses `Volver`  
Then the dialog closes  
And the cart remains unchanged  
And table reference/notes remain unchanged  
And no second Create Order request is issued

### Scenario 6: Continue after shortage

Given New Order received a shortage conflict  
When the user chooses `Continuar`  
Then the frontend sends a new Create Order request with explicit acknowledgement  
And the backend re-evaluates current stock  
And creates at most one Order

### Scenario 7: Shortage changes before acknowledgement

Given the first attempt reported shortage A  
And stock changes before the acknowledged retry  
When the backend processes the acknowledged retry  
Then it uses the new authoritative stock state  
And does not rely on the first response as a reservation

### Scenario 8: Acknowledged Order does not move Inventory

Given an acknowledged shortage remains on retry  
When the Order is created  
Then the Order records acknowledgement actor/time  
And Inventory quantities remain unchanged  
And no SALE movement is created

### Scenario 9: Shortage disappears before acknowledged retry

Given the first request reported a shortage  
And stock is replenished before the acknowledged retry  
When the retry is processed  
Then the Order is created normally  
And the system SHOULD NOT record a shortage acceptance that was no longer required

### Scenario 10: Kitchen behavior remains intact

Given an acknowledged Order contains a KITCHEN Product  
When Order creation succeeds  
Then one KitchenCommand is created with the existing initial state  
And no KitchenCommand exists from the rejected first attempt

### Scenario 11: Delivered Order can be sold

Given an Order is ENTREGADO  
And no previous Sale exists  
And the payment/channel combination is valid  
And the current operational Shift exists  
When the actor confirms Sale  
Then the backend creates one Sale  
And associated SaleItems  
And Inventory SALE movements  
And commits all changes atomically

### Scenario 12: Pending Order cannot be sold

Given an Order is PENDIENTE  
When ConfirmSale is requested  
Then the backend rejects the operation  
And no Sale or InventoryMovement is created

### Scenario 13: Ready Order cannot be sold

Given an Order is LISTO  
When ConfirmSale is requested  
Then the backend rejects the operation

### Scenario 14: Duplicate Sale

Given an ENTREGADO Order already has a Sale  
When another confirmation is attempted  
Then the backend returns a conflict  
And no second Sale is committed  
And no duplicate Inventory movement is committed

### Scenario 15: Server total

Given an ENTREGADO Order has stored OrderItem price snapshots  
When Sale is confirmed  
Then Sale subtotal and total are computed from those server-side snapshots  
And client-supplied total is not part of the authority

### Scenario 16: Produced preparation Sale

Given the Order contains a previously produced PREPARATION  
When Sale is confirmed  
Then Inventory decreases for the preparation Product  
And its composition ingredients are not consumed again

### Scenario 17: Previously acknowledged shortage becomes negative at Sale

Given the Order has recorded HU-013 acknowledgement  
And final locked stock is insufficient  
When Sale is confirmed  
Then final Inventory revalidation still occurs  
And the Sale MAY commit with a negative resulting Product balance  
And the Inventory movement remains traceable to the Sale

### Scenario 18: New shortage appears only before checkout

Given an Order had no shortage acknowledgement  
And stock becomes insufficient after Order creation  
When Sale is first confirmed  
Then the backend does not silently permit negative stock  
And returns current authoritative shortages  
And no Sale commits

### Scenario 19: Exceptional Sale acknowledgement

Given Scenario 18 returned a shortage conflict  
When the user explicitly continues  
Then the frontend retries ConfirmSale with acknowledgement  
And the backend revalidates under the normal lock strategy  
And, if still otherwise valid, commits the Sale and allowed negative Inventory

### Scenario 20: Current Shift

Given the current business day has an open CashSession and ACTIVE Shift  
When Sale is confirmed  
Then Sale.ShiftId references that current operational Shift  
And not a historical ACTIVE Shift from another business day

### Scenario 21: Direct cash

Given checkout channel is DIRECT  
And payment method is CASH  
When Sale is confirmed  
Then the combination is accepted if unchanged in the local canonical contract

### Scenario 22: Direct QR

Given checkout channel is DIRECT  
And payment method is QR  
When Sale is confirmed  
Then the system records QR as a payment classification only  
And performs no bank/QR integration

### Scenario 23: PedidosYa channel

Given checkout channel is PEDIDOSYA  
When Sale is confirmed under the audited contract  
Then payment classification is EXTERNAL  
And no PedidosYa API call occurs

### Scenario 24: Cancel checkout

Given an eligible Order is open in checkout  
When the user chooses `Cancelar cobro`  
Then the frontend navigates away  
And issues no Sale mutation  
And does not modify Order, Shift or Inventory

### Scenario 25: Success response

Given Sale confirmation succeeds  
When the frontend receives SaleDto  
Then the success dialog displays actual Sale data  
And does not claim that a receipt was generated  
And offers `Volver a pedidos`

## Edge Cases

- Order has no InventoryBalance row: current quantity is treated according to the existing Inventory semantics, normally zero.
- One Product appears only once in Order because the existing duplicate-product rule remains.
- Several shortages use different Inventory units.
- Decimal Order quantities.
- Negative stock already exists before Order creation.
- Acknowledgement=true arrives unnecessarily with sufficient stock.
- Stock changes several times between first Order request, retry and Sale.
- Order is cancelled after acknowledged shortage but before Sale.
- Order is delivered by another authorized actor before checkout.
- Checkout route opened directly for missing Order.
- Checkout route opened for CANCELADO Order.
- Sale already exists but Order still remains ENTREGADO.
- Shift becomes invalid between page load and Sale POST.
- Payment/channel selection changes before submission.
- 409 is duplicate Sale rather than shortage; UI must not open shortage modal for unrelated codes.
- Structured shortage response contains many items and must scroll inside an accessible dialog.
- Network failure during acknowledgement retry.
- Network failure after Sale request where client cannot know whether commit occurred: refetch/navigate conservatively rather than automatically re-posting.
- Multi-role users retain union-of-role access.

## Acceptance Criteria

- CreateOrder contract MUST contain a backward-compatible acknowledgement mechanism.
- A PostgreSQL integration test MUST prove sufficient Create Order creates no InventoryMovement.
- A PostgreSQL integration test MUST prove exact required=current stock is sufficient.
- A PostgreSQL integration test MUST prove unacknowledged shortage commits zero Order rows.
- A PostgreSQL integration test MUST prove unacknowledged shortage commits zero KitchenCommand rows.
- A PostgreSQL integration test MUST prove every shortage is returned.
- A PostgreSQL integration test MUST prove acknowledgement retry creates exactly one Order.
- A PostgreSQL integration test MUST prove acknowledged Order creation does not decrement stock.
- A PostgreSQL integration test MUST verify server-generated acknowledgement actor/time when shortage acceptance is used.
- A concurrency/integration test MUST change stock between first request and retry and verify the second state is authoritative.
- Backend MUST retain `POST /api/v1/sales`.
- A test MUST prove only ENTREGADO succeeds.
- A test MUST prove PENDIENTE, EN_PREPARACION, LISTO and CANCELADO do not create Sale.
- A test MUST prove one Order cannot result in two Sales.
- A test MUST prove total comes from Order snapshot data.
- A test MUST prove Sale uses the current business-day Shift.
- A test MUST prove Sale creates InventoryMovement type SALE.
- A test MUST prove a PREPARATION Sale does not create component-consumption movements.
- A test MUST prove acknowledged Order shortage can result in negative balance during Sale.
- A test MUST prove a newly appearing Sale-time shortage requires explicit acknowledgement.
- A test MUST prove final locked shortage response is non-stale and non-empty.
- Runtime OpenAPI MUST represent final request/response/error contracts.
- Generated TypeScript MUST be regenerated.
- NewOrder frontend tests MUST prove modal, all shortages, Volver, draft preservation and acknowledged retry.
- Checkout route MUST be guarded to OrdersAccess frontend roles.
- Checkout tests MUST verify customer controls are absent.
- Checkout tests MUST verify discount controls are absent.
- Checkout tests MUST verify no fake `Caja 1`.
- Checkout tests MUST verify payment/channel behavior.
- Checkout tests MUST verify Cancelar cobro sends no POST.
- Success tests MUST verify actual Sale id/total/payment data and `Volver a pedidos`.
- Desktop checkout MUST be manually ready for validation.
- Approximately 360 px checkout MUST be manually ready for validation.
- Backend and frontend quality gates MUST have zero failures before documentation closure.
- HU-012 and HU-013 manifests MUST remain separate.

## Out of Scope

- Customers/HU-014.
- Discounts.
- Coupons/promotions.
- Fiscal invoicing.
- Tax identifiers.
- Receipt printing.
- Printer hardware.
- PDF receipt.
- Banking/QR verification.
- PedidosYa integration.
- Standalone Sale.
- Multiple cash registers.
- Split/partial payment.
- Refunds.
- Sale cancellation.
- Inventory reservation.
- Table master.
- Tips.
- New global permissions architecture.
