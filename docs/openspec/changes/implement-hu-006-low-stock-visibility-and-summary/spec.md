# Spec

## Requirements

### Functional Requirements — Inventory Summary

- The system MUST expose exactly one new HU-006 backend endpoint.
- The endpoint MUST be `GET /api/v1/inventory/summary` if the local baseline retains the currently observed `/api/v1/inventory` route-group convention.
- If the local baseline changed only naming conventions, the route MAY be minimally adapted while preserving the requirement of exactly one additive endpoint.
- The endpoint MUST be read-only.
- The endpoint MUST use the existing `InventoryRead` authorization policy.
- The endpoint MUST NOT mutate InventoryBalance, Product, InventoryMovement or MinStock.
- The endpoint MUST NOT require a database migration.

### Summary Contract

The response MUST provide:

- `totalProducts`;
- `lowStockCount`;
- `negativeStockCount`;
- `normalStockCount`;
- `lowStockItems`.

`lowStockItems` MUST contain enough existing inventory data to render the Notifications view without requiring another new backend endpoint.

Each detail item SHOULD reuse the existing `InventoryBalanceDto` contract rather than introduce a second representation of balance fields.

### Inventory Universe

- Summary MUST use the same default operational Product universe as the existing Inventory balance view.
- If the local baseline still defaults Inventory to active Products, Summary MUST also count active Products only.
- Products without a materialized InventoryBalance MUST be treated as current quantity `0`, consistent with the existing balance query.
- Summary MUST NOT count a different Product universe silently.
- Inactive Product semantics MUST follow the existing Inventory baseline rather than introducing new HU-006 behavior.

### Low-Stock Semantics

- A Product with a configured minimum MUST be low-stock when `currentQuantity <= minStock`.
- Equality MUST count as low-stock.
- A negative current balance MUST be included in low-stock.
- A negative current balance MUST remain numerically negative.
- A negative balance MUST NOT be clamped to zero.
- `negativeStockCount` MUST count Products where `currentQuantity < 0`.
- `negativeStockCount` MUST be a subset of `lowStockCount`.
- A nonnegative Product whose `MinStock` is null MUST retain the current baseline semantics and MUST NOT be classified low-stock solely because no threshold exists.
- A negative Product with null MinStock MUST still be included in the critical low-stock set.
- The implementation SHOULD share the low-stock predicate used by the summary and balance/read-model mapping where this can be done without an incompatible contract change.

### Count Semantics

- `totalProducts` MUST count Product/items in the Inventory universe.
- `totalProducts` MUST NOT sum stock quantities.
- Mass, volume and count quantities MUST NOT be added into a synthetic inventory total.
- `lowStockCount` MUST count all Products requiring low-stock attention, including negative balances.
- `negativeStockCount` MUST count all negative balances.
- `normalStockCount` MUST count Products outside the low-stock set.
- For the defined universe, `normalStockCount` MUST equal `totalProducts - lowStockCount`.
- The UI MUST NOT assume `lowStockCount + negativeStockCount + normalStockCount = totalProducts`.

### Performance

- Global counts SHOULD be calculated through EF/PostgreSQL aggregation.
- The backend SHOULD NOT materialize the entire non-low inventory solely to calculate counts.
- Only the low-stock details required by the Notifications view MAY be materialized.
- The implementation MUST NOT introduce Redis, materialized views, background jobs or a dedicated cache.

### Existing Inventory API

- `GET /api/v1/inventory/balances` MUST remain backward compatible.
- `GET /api/v1/inventory/movements` MUST remain backward compatible.
- `POST /api/v1/inventory/movements` MUST remain backward compatible.
- HU-006 MUST NOT add a second low-stock-details endpoint.
- HU-006 MUST NOT add a new minimum-stock mutation endpoint.

### Minimum Stock Configuration

- HU-006 MUST reuse the existing minimum-stock configuration foundation.
- HU-006 MUST NOT add a second minimum-stock screen.
- HU-006 MUST NOT add a second minimum-stock modal.
- HU-006 MUST NOT broaden minimum-stock mutation permissions.
- ADMINISTRADOR and ENCARGADO MUST retain existing management rights.
- MESERO, COCINA and CONTADORA MUST remain read-only for this capability.

### Frontend Integration

- HU-006 MUST extend the existing Inventory module.
- HU-006 MUST NOT create a parallel `/low-stock` module.
- `/inventario` MUST remain the principal Inventory route.
- The module MUST expose a Notifications tab or equivalent Spanish term.
- The navigation SHOULD present:
  - Existencias;
  - Movimientos when permitted;
  - Notificaciones.
- MESERO, COCINA and CONTADORA MUST be able to access Existencias and Notificaciones.
- Movimientos MUST retain its existing ADMINISTRADOR/ENCARGADO restriction.

### Warning Banner

- Existencias MUST display a visible Inventory warning when `lowStockCount > 0`.
- The warning MUST communicate the number of Products with low stock.
- The warning MUST provide a `Ver detalles` action or equivalent.
- Activating `Ver detalles` MUST activate the Notifications tab inside Inventory.
- Activating `Ver detalles` MUST NOT navigate to a separate low-stock module.
- When `lowStockCount == 0`, the warning banner MUST NOT display a danger/warning state.

### Summary Cards

The Inventory Existencias experience MUST display global values for:

- Stock bajo;
- Negativos;
- Normal;
- Total productos.

- The cards MUST use summary backend data.
- The cards MUST NOT derive global metrics from the currently visible balance page.
- The cards MUST NOT display unsupported metrics such as average sales, movement totals, monetary value or trends.
- `Negativos` MUST be presented as additional critical information within low-stock, not as a mutually exclusive partition.

### Notifications Tab

- Notifications MUST be a derived read-only view of current Inventory state.
- Notifications MUST NOT be persisted.
- Notifications MUST NOT create notification entities/events.
- The tab MUST display all `lowStockItems` supplied by the authoritative backend summary.
- Negative items MUST be included.
- Negative items MUST use the semantic label `Saldo negativo`.
- Nonnegative low-stock items MUST use the semantic label `Stock bajo`.
- Negative severity MUST visually outrank ordinary low-stock severity.
- Cards MUST display, when available from the contract:
  - Product name;
  - Product type;
  - current quantity;
  - Inventory unit;
  - minimum stock;
  - semantic status.
- SKU/code MUST NOT be fabricated.
- Product images MUST NOT be fabricated.

### Notifications Empty State

Given Products exist but no Product is low-stock:

- the tab MUST NOT say that no Products exist;
- the tab MUST communicate that there are no low-stock Products;
- the tab SHOULD communicate that current stock is above configured thresholds.

### Existencias Low-Stock Filter

- Existencias MUST expose a Stock bajo filter.
- Enabling it MUST include every Product in the authoritative low-stock set.
- The filter MUST include negative balances.
- The filter MUST NOT filter only the currently downloaded balance page.
- Since the audited balance endpoint lacks a backend low-stock filter, the frontend SHOULD use the complete `summary.lowStockItems` set while the filter is active.
- Existing search and ProductType criteria MAY be applied to that complete set.
- Filter changes MUST reset the displayed page/index when applicable.
- A new Saldo negativo filter MUST NOT be added solely for HU-006 unless it already exists in the local baseline.

### Loading

- Initial summary loading MUST have a visible loading state.
- Notifications loading MUST have a visible loading state.
- Existing visual primitives SHOULD be reused.
- Background refetch MUST NOT blank already-valid Inventory data unnecessarily.
- A successful read MUST NOT generate a success toast.

### Errors

- Summary/query errors MUST produce a safe, Spanish, human-readable error state.
- Errors MUST NOT refer to a fictitious external warehouse server.
- A Retry action MUST be available where the existing query pattern supports it.
- Failure of the summary query MUST NOT unnecessarily destroy already-loaded balance data.
- Notifications, which depends on summary details, MUST expose a full controlled error state when its source cannot be loaded.

### Refresh and Query Lifecycle

- The frontend MUST reuse TanStack Query.
- The frontend MUST use the shared HTTP client.
- The frontend MUST use generated OpenAPI types.
- The frontend MUST NOT send JWT manually.
- The summary query key MUST live under the existing Inventory query-key root.
- Existing Inventory mutations that invalidate the Inventory root SHOULD invalidate summary automatically.
- Existing passive Inventory refresh behavior MAY be reused.
- HU-006 MUST NOT introduce aggressive polling beyond the established Inventory behavior.
- HU-006 MUST NOT introduce SignalR.

### Authorization

The Inventory read capability MUST allow:

- ADMINISTRADOR;
- ENCARGADO;
- MESERO;
- COCINA;
- CONTADORA.

It MUST deny:

- EMPLEADO-only users;
- anonymous users.

- The frontend MUST reuse existing role guards.
- The backend MUST reuse `InventoryRead`.
- HU-006 MUST NOT create a duplicate equivalent policy.
- Multi-role access MUST continue to use union semantics.

### Responsive

- Desktop MUST retain the existing table-centric Existencias presentation when compatible with the local baseline.
- Mobile MUST retain/adapt the existing card presentation rather than compress a desktop table.
- Notifications MUST use responsive cards.
- The UI MUST remain usable at approximately 360 px.
- The change MUST NOT replace the global AppShell/mobile-navigation architecture.

### Accessibility

- Inventory tabs MUST use accessible navigation semantics.
- Active tabs MUST be programmatically identifiable.
- Warning/error states MUST not rely solely on color.
- `Stock bajo` and `Saldo negativo` MUST be textual states.
- Buttons MUST have accessible names.
- Decorative icons SHOULD be hidden from assistive technology.
- Loading/error semantics SHOULD follow existing accessible patterns.
- Cards MUST be understandable without hover.

### OpenAPI

- The new endpoint MUST be represented in runtime OpenAPI.
- The summary response MUST be represented by a generated schema.
- Existing Inventory contracts MUST remain present.
- Backend MUST be green before runtime OpenAPI regeneration.
- `frontend/src/types/api.generated.ts` MUST be regenerated from runtime OpenAPI.
- The generated file MUST NOT be manually edited.

### Documentation

- HU-006 MUST be updated only after implementation and validation evidence exists.
- Documentation MUST distinguish automated evidence from manual visual validation.
- Test counts MUST NOT be invented.
- Screenshots MUST NOT be fabricated.
- The resulting HU state MUST accurately reflect backend/frontend completion achieved during APPLY.

## Behavior Scenarios

### Scenario 1: Stock above minimum

Given an active inventory Product with current quantity 20 and minimum stock 10  
When Inventory Summary is requested  
Then the Product MUST NOT belong to `lowStockItems`  
And it MUST NOT increment `lowStockCount`  
And it MUST increment `normalStockCount`

### Scenario 2: Stock below minimum

Given an active Product with current quantity 5 and minimum stock 10  
When Inventory Summary is requested  
Then the Product MUST belong to `lowStockItems`  
And `lowStockCount` MUST include it  
And it MUST NOT increment `negativeStockCount`

### Scenario 3: Stock equals minimum

Given an active Product with current quantity 10 and minimum stock 10  
When Inventory Summary is requested  
Then the Product MUST be classified low-stock

### Scenario 4: Negative stock

Given an active Product with current quantity -2.3 and minimum stock 5  
When Inventory Summary is requested  
Then the Product MUST be included in `lowStockItems`  
And `lowStockCount` MUST include it  
And `negativeStockCount` MUST include it  
And the quantity MUST remain -2.3

### Scenario 5: Negative stock without configured minimum

Given an active Product with current quantity -1 and no minimum stock  
When Inventory Summary is requested  
Then the Product MUST be included in the critical low-stock set  
And `negativeStockCount` MUST include it  
And the negative quantity MUST remain unchanged

### Scenario 6: Product without balance

Given an active Product without an InventoryBalance row  
When Inventory Summary is calculated  
Then its current quantity MUST be treated as 0  
And its low-stock classification MUST use that quantity consistently with Inventory balances

### Scenario 7: Global counts are not page counts

Given 45 inventory Products  
And 12 low-stock Products distributed across several normal balance pages  
When page 1 of Existencias is displayed  
Then Summary MUST still return `lowStockCount = 12`  
And MUST NOT derive the count from only page 1

### Scenario 8: Negative is a low-stock subset

Given totalProducts = 100  
And 15 Products meet low-stock semantics  
And 3 of those have negative balances  
When Summary is returned  
Then lowStockCount MUST be 15  
And negativeStockCount MUST be 3  
And normalStockCount MUST be 85

### Scenario 9: Total is a Product count

Given Inventory contains Products measured in kg, liters and units  
When Summary is returned  
Then totalProducts MUST equal the number of included Products  
And MUST NOT add their physical quantities together

### Scenario 10: Inventory warning appears

Given Summary reports lowStockCount greater than zero  
When the user opens Existencias  
Then an Inventory warning MUST be visible  
And it MUST communicate the low-stock count  
And it MUST offer `Ver detalles`

### Scenario 11: Warning is absent when healthy

Given Summary reports lowStockCount = 0  
When the user opens Existencias  
Then a warning-state banner MUST NOT be shown

### Scenario 12: View details

Given the Inventory warning is visible  
When the user activates `Ver detalles`  
Then the existing Inventory module MUST show the Notifications tab  
And the user MUST remain inside `/inventario` semantics  
And no separate low-stock module MUST be required

### Scenario 13: Notifications list

Given Summary contains one ordinary low-stock Product and one negative Product  
When Notifications is active  
Then both Products MUST be displayed  
And the ordinary item MUST say `Stock bajo`  
And the negative item MUST say `Saldo negativo`

### Scenario 14: Notifications healthy empty

Given Summary reports no low-stock Products  
When Notifications is active  
Then the view MUST explain that there are no Products with low stock  
And MUST NOT say that the Product catalog is empty

### Scenario 15: Low-stock filter includes negative

Given the complete low-stock set contains a quantity 5 item and a quantity -2 item  
When the Stock bajo filter is enabled in Existencias  
Then both items MUST remain in the filtered data source

### Scenario 16: Summary load fails but balances exist

Given an existing balance page has valid cached/current data  
And the Summary request fails  
When Existencias renders  
Then the existing balance data SHOULD remain visible  
And the Summary-specific failure MUST provide Retry without pretending Inventory is empty

### Scenario 17: Authorization read roles

Given a user has one of ADMINISTRADOR, ENCARGADO, MESERO, COCINA or CONTADORA  
When the user accesses Inventory Summary  
Then the backend MUST authorize the request

### Scenario 18: EMPLEADO access

Given an authenticated user has only EMPLEADO  
When that user attempts to access Inventory or its Summary endpoint  
Then access MUST be forbidden

### Scenario 19: Read-only user

Given a COCINA user can view Inventory  
When Inventory is rendered  
Then low-stock warning, summary and Notifications MUST be available  
But minimum-stock management MUST NOT be added by HU-006

### Scenario 20: OpenAPI synchronization

Given backend implementation and tests are green  
When runtime OpenAPI is regenerated  
Then `/api/v1/inventory/summary` MUST appear  
And generated TypeScript MUST derive its Summary type from that runtime document

## Edge Cases

- No active Products.
- Active Products but no InventoryBalance rows.
- No low-stock Products.
- Every Product low-stock.
- Every low-stock Product negative.
- `currentQuantity = 0`.
- `minStock = 0`.
- `currentQuantity = minStock`.
- Negative quantity with null MinStock.
- Positive quantity with null MinStock.
- Very long list of low-stock Products.
- Search yields no matches within the complete low-stock set.
- ProductType filter yields no low-stock matches.
- Existing current page number becomes invalid after enabling Stock bajo.
- Summary loads before balances.
- Balances load before Summary.
- Summary background refetch fails after prior data exists.
- Manual ENTRY/WRITE_OFF invalidates Inventory queries.
- Multi-role user with EMPLEADO plus an allowed Inventory role.
- Inactive Product according to existing scope.
- Mobile width 360 px.
- Notifications cards containing decimal quantities and different unit symbols.

## Acceptance Criteria

- The implementation MUST add exactly one new backend route for HU-006.
- That route MUST be read-only.
- That route MUST use InventoryRead.
- An automated authorization test MUST verify allowed access for ADMINISTRADOR.
- An automated authorization test MUST verify allowed access for ENCARGADO.
- An automated authorization test MUST verify allowed access for MESERO.
- An automated authorization test MUST verify allowed access for COCINA.
- An automated authorization test MUST verify allowed access for CONTADORA.
- An automated authorization test MUST verify EMPLEADO-only receives forbidden.
- An automated authorization test MUST verify anonymous access is unauthorized.
- A backend test MUST prove `stock > min` is normal.
- A backend test MUST prove `stock < min` is low-stock.
- A backend test MUST prove `stock == min` is low-stock.
- A backend test MUST prove negative stock increments both lowStockCount and negativeStockCount.
- A backend test MUST prove negative quantities remain negative.
- A backend test MUST prove totalProducts counts Products rather than stock quantities.
- A backend test MUST prove normalStockCount follows the defined global predicate.
- A backend test MUST prove summary and normal Inventory use the same active Product scope.
- The generated OpenAPI MUST contain the summary endpoint and schema.
- The generated TypeScript MUST be regenerated rather than hand-edited.
- A frontend test MUST verify the warning appears when lowStockCount > 0.
- A frontend test MUST verify the warning is absent when lowStockCount = 0.
- A frontend test MUST verify `Ver detalles` selects Notifications.
- A frontend test MUST verify Notifications displays all low-stock detail items supplied by Summary.
- A frontend test MUST verify a negative item displays `Saldo negativo`.
- A frontend test MUST verify an ordinary low item displays `Stock bajo`.
- A frontend test MUST verify the Notifications healthy empty state.
- A frontend test MUST verify loading.
- A frontend test MUST verify summary/Notifications error and Retry behavior where supported.
- A frontend test MUST verify Stock bajo filtering includes negative items.
- Existing Inventory balance and movement regression tests MUST remain green.
- Existing Inventory desktop table MUST remain functional.
- Existing mobile Inventory cards MUST remain functional.
- No second minimum-stock UI MUST be introduced.
- No notification persistence MUST be introduced.
- No migration MUST be added.
- Backend build/tests MUST pass.
- Frontend format/typecheck/lint/tests/build MUST pass using real scripts.
- Manual visual validation MUST remain explicitly pending until performed by a human.

## Out of Scope

- Persistent notifications.
- Global notification center.
- Notification bell behavior.
- Push/email/SMS/WhatsApp.
- SignalR.
- Background jobs.
- Minimum-stock configuration UX.
- Product CRUD changes.
- New ENTRY/WRITE_OFF capability.
- Movement redesign.
- Export.
- Inventory KPIs unrelated to HU-006.
- Charts.
- Inventory valuation.
- Costing.
- Lots/expiry.
- Automatic replenishment.
- Supplier recommendations.
- Other Sprint 2 HUs.
- Global role refactor.
- Database migration.
