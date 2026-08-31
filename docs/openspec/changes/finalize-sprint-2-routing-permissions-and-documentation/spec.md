# Spec

## Requirements

### Functional Requirements — Authorization Core

- The system MUST preserve the canonical roles:
  - ADMINISTRADOR;
  - ENCARGADO;
  - MESERO;
  - COCINA;
  - CONTADORA;
  - EMPLEADO.
- The system MUST NOT introduce `CAJERO`.
- The system MUST resolve multiple roles as a union of capabilities.
- The system MUST NOT select only the first/primary role when evaluating authorization.
- Frontend navigation visibility MUST NOT replace backend authorization.
- Every mutating Sprint 2 endpoint MUST remain protected server-side.
- An authenticated but unauthorized actor MUST receive the existing forbidden behavior.
- An anonymous actor MUST receive the existing unauthenticated behavior.

### Product Management

- Product mutation MUST be allowed only to ADMINISTRADOR and ENCARGADO.
- MESERO MUST NOT mutate Products.
- COCINA MUST NOT mutate Products.
- CONTADORA MUST NOT mutate Products.
- EMPLEADO MUST NOT mutate Products.
- Product mutation includes every existing create/update/deactivate or equivalent mutating operation.
- Frontend Product mutation controls MUST be absent for unauthorized roles.
- Direct API calls MUST remain forbidden regardless of UI visibility.
- Product read access MUST remain independent of ProductManage.
- This change MUST NOT reduce Product read access required by Orders, Production, Purchases or other existing modules.

### Composition Management

- Composition mutation MUST be allowed only to ADMINISTRADOR and ENCARGADO.
- MESERO, COCINA, CONTADORA and EMPLEADO MUST NOT mutate Composition.
- Composition read MUST be allowed to ADMINISTRADOR, ENCARGADO, MESERO and COCINA.
- Composition read MUST be denied to CONTADORA and EMPLEADO.
- An implemented Composition frontend MUST have a reachable route for authorized roles.
- An unauthorized direct Composition route MUST follow the existing forbidden strategy.
- Composition business behavior MUST NOT be reimplemented by this change.

### Minimum Stock Configuration

- MinStock mutation MUST be allowed only to ADMINISTRADOR and ENCARGADO.
- MESERO, COCINA, CONTADORA and EMPLEADO MUST NOT modify MinStock.
- This change MUST NOT add a new MinStock workflow.

### Inventory Read

- Inventory read MUST be allowed to:
  - ADMINISTRADOR;
  - ENCARGADO;
  - MESERO;
  - COCINA;
  - CONTADORA.
- EMPLEADO MUST NOT receive Inventory read access.
- Inventory read MUST include:
  - Existencias;
  - Movimientos;
  - Notificaciones;
  - Inventory Summary;
  - low-stock detail exposed by the existing Inventory contract.
- `GET /api/v1/inventory/movements` MUST be accessible to the five Inventory read roles.
- Inventory mutation permissions MUST remain separate from Inventory read permissions.
- This change MUST NOT grant manual ENTRY/WRITE_OFF or other Inventory mutation to MESERO, COCINA or CONTADORA.
- This change MUST NOT introduce a new Inventory endpoint.

### Production

- Production MUST be allowed to ADMINISTRADOR, ENCARGADO and COCINA.
- Production MUST be denied to MESERO, CONTADORA and EMPLEADO.
- Existing HU-007 business logic MUST NOT be redesigned.
- Production route/navigation MUST remain reachable to its authorized roles.
- Production MUST remain inside the global authenticated shell and MUST NOT render a second global application shell if the local baseline currently does so.

### Sale

- Sale/checkout MUST be allowed to ADMINISTRADOR, ENCARGADO and MESERO.
- Sale/checkout MUST be denied to COCINA, CONTADORA and EMPLEADO.
- Existing HU-012/HU-013 business behavior MUST NOT be changed by this stabilization change.
- The existing checkout route MUST remain reachable from the normal Order flow.
- Direct checkout route access MUST use the existing route protection mechanism.

### Purchase Read

- Purchase read MUST be allowed to:
  - ADMINISTRADOR;
  - ENCARGADO;
  - COCINA;
  - CONTADORA.
- Purchase read MUST be denied to MESERO and EMPLEADO.
- `/compras` or its local equivalent MUST use Purchase-read roles, not Purchase-write roles.
- Navigation MUST expose Purchases to CONTADORA when the backend read contract allows it.
- CONTADORA MUST NOT gain create/cancel/receive controls merely because read access is enabled.

### Purchase Mutation

- Purchase create/cancel/receive MUST be allowed to ADMINISTRADOR and ENCARGADO.
- COCINA MAY execute Purchase mutations only according to the qualifier confirmed in the local canonical implementation/documentation.
- MESERO, CONTADORA and EMPLEADO MUST NOT execute Purchase mutations.
- The current COCINA scope restrictions MUST NOT be weakened by this change without an explicit product decision.
- Backend scope validation MUST remain authoritative even when frontend controls are hidden.

### Shift Management

- Shift management MUST be allowed only to ADMINISTRADOR and ENCARGADO.
- MESERO, COCINA, CONTADORA and EMPLEADO MUST NOT manage Shifts.

### Own Shift Read

- Own Shift read MUST be allowed to:
  - ADMINISTRADOR;
  - ENCARGADO;
  - MESERO.
- COCINA, CONTADORA and EMPLEADO MUST NOT access own-Shift frontend route or navigation.
- Backend authorization on the current own-Shift endpoint MUST remain authoritative.
- Frontend route guards MUST align with the backend role set.

### Multi-role Semantics

- A user with multiple roles MUST receive the union of all capabilities granted by those roles.
- A MESERO+ENCARGADO user MUST retain ENCARGADO management capabilities while also retaining MESERO capabilities.
- An additional restrictive role MUST NOT remove a capability granted by another assigned role.
- Navigation and route guards MUST use the same union semantics.

### Navigation and Routing

- Every implemented Sprint 2 frontend capability MUST have a valid route when the capability requires a route.
- Every authorized user MUST have a normal UI entry point to each relevant Sprint 2 workflow.
- The system MUST NOT rely solely on users manually entering URLs.
- Navigation entries MUST NOT point to missing routes.
- CTA links MUST use the technical IDs expected by the target route.
- Visual compact identifiers MUST NOT replace backend UUIDs in route parameters.
- Unauthorized direct URL access MUST resolve through the existing forbidden/auth route strategy.
- Healthy routes MUST NOT be renamed solely for consistency/style.
- This change SHOULD preserve existing bookmarks and route contracts.
- Desktop and mobile navigation MUST expose equivalent capabilities for the same role set even when layouts differ.

### Central Navigation

- Existing centralized navigation MUST be reused.
- Desktop sidebar and mobile drawer SHOULD derive visibility from the same role/capability configuration.
- This change MUST NOT introduce a second global navigation model.
- This change MUST NOT introduce a new global state library for authorization.
- Active-route matching MUST continue to support child routes.

### Inventory Navigation

- Existencias MUST expose navigation to:
  - Existencias;
  - Movimientos;
  - Notificaciones.
- Movimientos MUST expose navigation to:
  - Existencias;
  - Movimientos;
  - Notificaciones.
- Notificaciones MUST expose navigation to:
  - Existencias;
  - Movimientos;
  - Notificaciones.
- The current view MUST be represented as active using the existing accessible pattern.
- Inventory navigation SHOULD be implemented through one shared composition instead of duplicated inconsistent markup.
- All five Inventory read roles MUST be able to use these three read views.
- Inventory mutation controls MUST continue to be role-aware independently of tab visibility.

### Inventory Notification Badge

- The Notificaciones navigation item MUST display the global `lowStockCount` when `lowStockCount > 0`.
- The numeric badge MUST NOT render when `lowStockCount == 0`.
- The badge MUST use the existing global Inventory Summary response.
- The badge MUST NOT count rendered DOM rows.
- The badge MUST NOT count only the current paginated page.
- The badge MUST NOT introduce another backend endpoint.
- The badge MUST NOT introduce notification persistence.
- The badge MUST NOT represent unread/read semantics.
- The badge MUST NOT require special realtime infrastructure.
- The badge MUST include negative-stock Products because negative stock is part of the existing low-stock count semantics.
- The textual `Notificaciones` label MUST remain present; the status MUST NOT be communicated by color alone.

### HU-007 Documentation

- `docs/historias/HU-007-sprint-2.md` or the exact local canonical HU-007 file MUST describe the current implementation rather than a backend-only historical state.
- HU-007 MUST retain its implemented Production business semantics.
- HU-007 MUST contain an accurate manifest derived from real files.
- The manifest MUST separate:
  - Backend;
  - Frontend and generated contract;
  - Documentation.
- The manifest MUST NOT list nonexistent paths.
- Existing historical backend evidence MAY be retained when accurately labeled.
- New test/build evidence MUST be recorded only if it is actually generated during APPLY.
- Existing HU-007 screenshots MUST be referenced when they exist locally.
- If no HU-007 screenshots exist, the document MUST state `MANUAL_EVIDENCE_PENDING` or the repository-equivalent status.
- The document MUST NOT claim manual validation, PO approval or visual evidence that does not exist.
- Technically complete implementation and pending manual evidence MUST be represented as distinct concepts when the local documentation convention permits it.

### Documentation Reconciliation

- This change MUST update only current-state documents directly affected by confirmed Sprint 2 drift.
- Historical OpenSpec changes MUST NOT be rewritten to make history match the final state.
- Existing evidence from other HUs MUST NOT be replaced.
- Permission documentation that contradicts the frozen matrix MUST be corrected where it is current-state authoritative.
- Documentation changes MUST occur after implementation and regression results are known.

### API Compatibility

- Existing Sprint 2 endpoint routes MUST remain unchanged unless a genuine blocker is proven.
- Existing HTTP verbs MUST remain unchanged.
- Existing DTO contracts MUST remain backward compatible.
- This change MUST NOT add an endpoint for Inventory navigation/badge.
- Expected new endpoints MUST equal zero.
- Expected migrations MUST equal zero.
- OpenAPI regeneration SHOULD be skipped when no runtime contract changed and the repository workflow does not require regeneration.
- If APPLY unexpectedly changes a runtime API contract, the change MUST be investigated before generated TypeScript is updated.

## Behavior Scenarios

### Scenario 1: ADMINISTRADOR gestiona Product

Given an authenticated ADMINISTRADOR  
When the user accesses Products and invokes an existing Product mutation  
Then the mutation control is available  
And the backend authorizes the request

### Scenario 2: EMPLEADO no gestiona Product

Given an authenticated EMPLEADO  
When the user accesses any reachable Product surface  
Then Product mutation controls are absent  
And when the same mutation endpoint is invoked directly  
Then the backend rejects it with the established forbidden behavior

### Scenario 3: MESERO consulta Composition

Given an authenticated MESERO  
And an existing PREPARATION  
When the user follows the supported composition-read path  
Then the composition is readable  
And mutating Composition remains unavailable

### Scenario 4: CONTADORA no consulta Composition

Given an authenticated CONTADORA  
When the user invokes the Composition read endpoint or protected route  
Then access is denied using the existing authorization strategy

### Scenario 5: CONTADORA consulta Inventory Movements

Given an authenticated CONTADORA  
When the user opens Movimientos de Inventario  
Then the route is reachable  
And `GET /api/v1/inventory/movements` is authorized  
And no Inventory mutation controls are exposed

### Scenario 6: MESERO consulta Inventory pero no lo muta

Given an authenticated MESERO  
When the user opens Inventory  
Then Existencias, Movimientos and Notificaciones are reachable  
And manual movement mutation remains unavailable

### Scenario 7: COCINA registra Production

Given an authenticated COCINA user  
When the user enters the existing Production route  
Then the route is allowed  
And Production operation remains available according to HU-007  
And no Product-management capability is granted

### Scenario 8: COCINA no confirma Sale

Given an authenticated COCINA user  
When the user enters a Sale checkout URL directly  
Then the frontend uses the existing forbidden route behavior  
And a direct Sale API request is rejected by backend authorization

### Scenario 9: CONTADORA consulta Purchases

Given an authenticated CONTADORA  
When the user opens the main Purchases view  
Then the navigation item is visible  
And the list route is allowed  
And Purchase data can be read  
And create/cancel/receive controls remain absent

### Scenario 10: COCINA ejecuta Purchase dentro de su scope

Given an authenticated COCINA user  
And a Purchase operation satisfies the locally confirmed COCINA qualifier  
When the authorized Purchase mutation is submitted  
Then the backend MAY permit it  
And this change does not relax the qualifier

### Scenario 11: COCINA intenta Purchase fuera de su scope

Given an authenticated COCINA user  
And a Purchase operation violates the locally confirmed COCINA qualifier  
When the mutation is submitted  
Then the backend rejects it  
And frontend navigation visibility does not override the scope validation

### Scenario 12: MESERO consulta su turno

Given an authenticated MESERO  
When the user selects Turnos / Mi turno  
Then `/mi-turno` or its real equivalent is reachable  
And the own-Shift API can be read

### Scenario 13: COCINA no consulta own Shift

Given an authenticated COCINA user  
When navigation is rendered  
Then the own-Shift item is absent  
And when `/mi-turno` is entered directly  
Then the existing forbidden route behavior is used

### Scenario 14: Multi-role MESERO + ENCARGADO

Given a user has MESERO and ENCARGADO roles  
When capabilities are evaluated  
Then the user receives the union of MESERO and ENCARGADO permissions  
And ENCARGADO management capabilities are not removed

### Scenario 15: Inventory badge is hidden at zero

Given Inventory Summary returns `lowStockCount = 0`  
When any Inventory section renders its navigation  
Then the `Notificaciones` label is present  
And no numeric badge is rendered

### Scenario 16: Inventory badge shows one

Given Inventory Summary returns `lowStockCount = 1`  
When Inventory navigation renders  
Then the Notificaciones tab displays badge `1`

### Scenario 17: Inventory badge shows global N

Given the current Inventory page renders 20 rows  
And Inventory Summary returns `lowStockCount = 37`  
When the Notificaciones tab renders  
Then the badge displays `37`  
And not the number of low-stock rows on the current page

### Scenario 18: Inventory navigation from Movimientos

Given an authorized Inventory reader is on `/inventario/movimientos`  
When internal navigation renders  
Then Existencias, Movimientos and Notificaciones are available  
And Movimientos is the active item

### Scenario 19: Inventory navigation from Notificaciones

Given an authorized Inventory reader is on the Notifications view  
When internal navigation renders  
Then all three Inventory views are available  
And Notificaciones is active  
And the low-stock badge follows the summary count

### Scenario 20: Reachable Sprint 2 route

Given an implemented Sprint 2 page has an allowed role  
When the user follows the normal UI flow  
Then there is a valid entry point leading to its route  
And the route does not require manually typing the URL

### Scenario 21: Unauthorized direct URL

Given a role is not allowed for a Sprint 2 capability  
When the user manually enters the protected route  
Then the application resolves to the existing forbidden/auth behavior  
And the restricted page is not rendered

### Scenario 22: HU-007 without manual screenshots

Given Production implementation is technically complete  
And the local evidence directory contains no HU-007 manual screenshots  
When HU-007 documentation is reconciled  
Then the manifest describes real code  
And manual evidence is marked pending  
And no screenshot claim is fabricated

### Scenario 23: HU-007 with existing manual screenshots

Given real HU-007 captures already exist locally  
When HU-007 documentation is reconciled  
Then those real files are referenced  
And no replacement/fabricated evidence is created

## Edge Cases

- User has three or more roles.
- Role arrays arrive in a different order.
- A user has EMPLEADO plus ENCARGADO; ENCARGADO capability still wins through union.
- A user has COCINA plus CONTADORA; union permits both valid read capabilities without granting manager capabilities.
- CONTADORA opens `/compras/nueva` directly despite being allowed `/compras`.
- CONTADORA opens `/inventario/movimientos` after route correction.
- MESERO can see Inventory Movements but no ENTRY/WRITE_OFF actions.
- A navigation item is hidden but the backend endpoint remains independently tested.
- A route exists without a navigation CTA.
- A CTA targets a route that no longer exists.
- An active child route must keep its parent navigation item active.
- Mobile drawer uses the same navigation definition as desktop.
- Inventory Summary is loading while tabs render.
- Inventory Summary fails while Inventory Movements data remains available.
- Badge count exceeds two digits; exact count remains acceptable without special `99+`.
- `lowStockCount` includes negative balances.
- HU-007 frontend files differ locally from the public snapshot.
- HU-007 evidence exists only as uncommitted local files.
- COCINA Purchase qualifier documentation differs from the implementation; this MUST be escalated rather than guessed.

## Acceptance Criteria

- A local baseline report MUST contain actual branch, HEAD and working-tree status before implementation.
- Every permission divergence MUST be marked confirmed locally before code is changed.
- A backend authorization matrix MUST cover all six canonical roles and anonymous access for representative Sprint 2 endpoints.
- Product mutation MUST pass for ADMINISTRADOR and ENCARGADO.
- Product mutation MUST be forbidden for MESERO, COCINA, CONTADORA and EMPLEADO.
- Product read behavior MUST not be unintentionally narrowed.
- Composition mutation MUST pass only for ADMINISTRADOR/ENCARGADO.
- Composition read MUST pass for ADMINISTRADOR/ENCARGADO/MESERO/COCINA and fail for CONTADORA/EMPLEADO.
- MinStock mutation MUST pass only for ADMINISTRADOR/ENCARGADO.
- Inventory read, including Movements, MUST pass for ADMINISTRADOR/ENCARGADO/MESERO/COCINA/CONTADORA.
- Inventory mutation MUST remain forbidden to MESERO/COCINA/CONTADORA/EMPLEADO.
- Production MUST pass for ADMINISTRADOR/ENCARGADO/COCINA and fail for other role-only users.
- Sale MUST pass authorization for ADMINISTRADOR/ENCARGADO/MESERO and fail for COCINA/CONTADORA/EMPLEADO.
- Purchase list/detail MUST be authorized for ADMINISTRADOR/ENCARGADO/COCINA/CONTADORA.
- Purchase mutations MUST remain unavailable to CONTADORA/MESERO/EMPLEADO.
- COCINA Purchase scope tests MUST preserve the locally confirmed qualifier.
- Shift management MUST pass only for ADMINISTRADOR/ENCARGADO.
- own-Shift MUST be frontend/backend accessible only to ADMINISTRADOR/ENCARGADO/MESERO.
- At least one multi-role regression MUST prove union semantics.
- Frontend tests MUST verify EMPLEADO lacks Product mutation controls.
- Frontend tests MUST verify CONTADORA can reach Purchase read but not Purchase mutations.
- Frontend tests MUST verify COCINA/CONTADORA/EMPLEADO cannot directly render own-Shift page.
- A route inventory MUST show a normal entry point for every implemented Sprint 2 page.
- Any Composition route gap still present locally MUST be fixed and tested without redesigning HU-004.
- The already-correct checkout CTA MUST not be reimplemented if local baseline already contains it.
- Inventory navigation MUST expose all three views from each Inventory view.
- `lowStockCount = 0` MUST render no numeric badge.
- `lowStockCount = 1` MUST render badge `1`.
- `lowStockCount = N` MUST render the global N independently of paginated rows.
- No new Inventory endpoint MUST be added.
- No Notification entity/read-unread state MUST be added.
- HU-007 manifest MUST list only real files.
- HU-007 MUST no longer claim frontend is pending when the local Production frontend is implemented.
- HU-007 MUST not claim manual evidence when no evidence exists.
- Migration count for this change MUST be zero.
- New endpoint count MUST be zero.
- Existing route/verb breaking changes MUST be zero.
- Full backend tests MUST finish with zero failures before closure.
- Frontend format/typecheck/lint/tests/build MUST finish with zero failures using the actual scripts.
- OpenAPI/TypeScript regeneration MUST occur only if required by an actual runtime contract change or mandatory repository workflow.

## Out of Scope

- New Sprint 2 business features.
- Reimplementation of any Sprint 2 HU.
- Product functional redesign.
- Production functional redesign.
- Purchase functional redesign.
- Sale functional redesign.
- Shift functional redesign.
- Inventory backend redesign.
- Global role-system rewrite.
- New authentication/claims model.
- New endpoint.
- Database migration.
- Notification persistence.
- Read/unread state.
- Notification center.
- New realtime.
- Fiscal invoicing.
- Customer management.
- Reporting features.
- Cash closing.
- Printers/hardware.
- Historical OpenSpec rewrite.
- Fabricated evidence.
