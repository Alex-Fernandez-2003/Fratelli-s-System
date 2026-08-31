# Tasks

- [x] **Task 1: [SHARED] Revalidar la baseline local completa**

- Objective:
  Congelar el `develop` local real antes de modificar el flujo HU-012/HU-013.
- Files or areas likely involved:
  Git read-only; Orders; Inventory; Operations/Sales; Shift; generated OpenAPI types; frontend Orders; routes; HU-012/HU-013; stabilization change.
- Execution notes:
  Registrar branch, HEAD, status y último commit. Auditar CreateOrder request/service, Order model, ConfirmSale, current Shift resolver, InventoryWriter, ProblemDetails, SaleDto, generated TypeScript y frontend actual. Detectar cambios locales no visibles remotamente. No reimplementar capacidades `ALREADY_SUPPORTED`.
- Verification method:
  Baseline report factual incluye exact HEAD/status, current shortage stage, acknowledgement fields, Shift resolver, SaleDto, frontend checkout presence y generated contract.
- Dependencies:
  None.

- [x] **Task 2: [SHARED] Confirmar las contracts y regressions antes del cambio**

- Objective:
  Fijar exactamente qué partes del backend estabilizado se reutilizan y qué contracts se extienden aditivamente.
- Files or areas likely involved:
  Order Application contracts; Inventory contracts; Operations contracts; endpoint metadata; existing integration tests.
- Execution notes:
  Confirmar que `POST /orders` y `POST /sales` permanecen. Confirmar 409/ProblemDetails actual, SalesChannel/PaymentMethod, one-Sale-per-Order y InventoryWriter. Determinar si `code`/`shortages` ya están tipados o solo existen como runtime extensions.
- Verification method:
  Contract matrix registra old/new shape y demuestra route changes=0, verb changes=0.
- Dependencies:
  Task 1.

- [x] **Task 3: [HU-013] Crear una evaluación read-only de shortages dentro de Inventory**

- Objective:
  Permitir que Order evalúe stock usando la autoridad Inventory sin realizar movimientos.
- Files or areas likely involved:
  Inventory Application boundary and existing InventoryService or local equivalent; focused tests.
- Execution notes:
  Implementar/reutilizar un read boundary que acepte requerimientos agregados ProductId+Quantity y devuelva todos los shortages actuales. Usar InventoryBalance semantics existentes y Product Inventory unit. No llamar a WriteBatch como preview, no mutar balance y no crear otra authority.
- Verification method:
  Tests demuestran: sufficient → empty shortages; insufficient → all shortages; missing balance follows current zero semantics; ninguna fila InventoryMovement cambia.
- Dependencies:
  Task 2.

- [x] **Task 4: [HU-013] Extender CreateOrder con acknowledgement backward-compatible**

- Objective:
  Mover la decisión normal de stock insuficiente a `POST /api/v1/orders`.
- Files or areas likely involved:
  CreateOrder request/result; OrderService; Order endpoint error mapping/OpenAPI metadata.
- Execution notes:
  Añadir acknowledgement opcional/default false sin renombrar campos existentes. Antes de persistir Order, evaluar requerimientos agregados. Si existe shortage sin ack, devolver 409 estructurado con todos los faltantes y no persistir nada. Si ack=true, revalidar en ese request y continuar la creación existente.
- Verification method:
  Integration tests prueban 409 no-ack con cero Order/OrderItem/KitchenCommand y 201 en retry acknowledged.
- Dependencies:
  Task 3.

- [x] **Task 5: [HU-013] Persistir la trazabilidad mínima del acknowledgement**

- Objective:
  Registrar quién/cuándo aceptó insuficiencia únicamente cuando esa aceptación fue necesaria.
- Files or areas likely involved:
  Order domain; EF configuration; migration/snapshot if local baseline lacks equivalent; OrderService.
- Execution notes:
  Si no existe foundation equivalente, añadir campos nullable de timestamp y User actor. No almacenar shortage snapshot. No usar Notes. No aceptar actor/time desde request. Si retry ack encuentra stock ya suficiente, no marcar artificialmente shortage accepted.
- Verification method:
  Tests PostgreSQL verifican actor autenticado, backend time, null en Orders que nunca necesitaron aceptación y persistencia en acknowledged insufficient Orders.
- Dependencies:
  Task 4.

- [x] **Task 6: [HU-013] Crear únicamente la migration aditiva necesaria**

- Objective:
  Materializar el audit de acknowledgement sin alterar schema ajeno.
- Files or areas likely involved:
  EF migration and model snapshot.
- Execution notes:
  Ejecutar esta task solo si Task 1 confirma que el modelo local carece de campos equivalentes. Añadir columnas nullable/FK Restrict según conventions. No editar migration histórica. No introducir tables o indexes innecesarios.
- Verification method:
  Migration compila, snapshot coincide y la cadena completa aplica sobre PostgreSQL disposable; existing Orders son compatibles.
- Dependencies:
  Task 5.

- [x] **Task 7: [HU-013] Formalizar el ProblemDetails de stock estructurado**

- Objective:
  Garantizar que frontend detecte shortage por datos, no por mensajes.
- Files or areas likely involved:
  Shared Application shortage DTO; Order/Operations API error mapping; OpenAPI metadata; shared frontend error normalization only if required.
- Execution notes:
  Definir/reutilizar un shape común con Product, required/current/shortage y unit. Mantener 409. Añadir un code estable para Order shortage y preservar Sale code observable. Confirmar que `shortageQuantity` sea magnitud positiva. Si la infraestructura actual ya preserva ProblemDetails extensions, extenderla mínimamente, no reemplazarla.
- Verification method:
  API integration test inspecciona status, content type, code y N shortage entries; generated/OpenAPI metadata puede describir el payload sin string parsing.
- Dependencies:
  Tasks 4, 5.

- [x] **Task 8: [HU-013] Añadir la matriz backend de creación de pedido**

- Objective:
  Probar completamente el nuevo punto normal de decisión HU-013.
- Files or areas likely involved:
  Existing PostgreSQL Order integration tests and concurrency fixtures.
- Execution notes:
  Cubrir sufficient, exact boundary, multiple shortages, no ack, ack, changed stock between calls, no duplicate Order, no Inventory movement, no partial KitchenCommand y actor/time. Mantener tests existentes HU-009/010/011.
- Verification method:
  Todos los escenarios pasan sobre PostgreSQL real; assertions verifican persisted rows y balances.
- Dependencies:
  Tasks 4-7.

- [x] **Task 9: [HU-013] Integrar el warning en New Order**

- Objective:
  Añadir el modal HU-013 sin reconstruir la pantalla de creación existente.
- Files or areas likely involved:
  Orders API mutation; NewOrderPage; shared Dialog/Alert components; ProblemDetails narrowing; frontend tests.
- Execution notes:
  Reconocer únicamente el shortage code estructurado. Mantener el cart/tableReference/notes. `Volver` cierra sin request. `Continuar` reenvía exactamente el draft actual con ack=true. Deshabilitar acciones durante retry. Renderizar todos los shortages y magnitud positiva con unidad real.
- Verification method:
  Tests prueban preserved draft, all shortages, zero second request on Volver, ack=true on Continuar, pending/double-click protection y success navigation.
- Dependencies:
  Tasks 7, 8.

- [x] **Task 10: [HU-012] Revalidar y estabilizar ConfirmSale sobre el acknowledgement del Order**

- Objective:
  Conservar las salvaguardas de Sale mientras se evita pedir dos veces la aceptación normal HU-013.
- Files or areas likely involved:
  Operations/Sale service; existing InventoryWriter integration; Order acknowledgement fields.
- Execution notes:
  Mantener ENTREGADO, unique Sale, Shift resolver estabilizado, backend total y transaction. Antes/finalmente bajo Inventory lock, permitir negative cuando el Order ya tiene acknowledgement o cuando el request de Sale contiene el excepcional acknowledgement. Si no existe ninguno, devolver locked authoritative shortages. No eliminar el fallback actual.
- Verification method:
  Tests prueban prior Order ack → negative allowed; unacknowledged Order + new shortage → conflict; fallback ack → success; authoritative shortage array no stale/empty.
- Dependencies:
  Tasks 5, 7.

- [x] **Task 11: [HU-012] Ampliar SaleDto solo con datos ya persistidos**

- Objective:
  Dar al frontend suficiente información real para la confirmación sin crear otro endpoint.
- Files or areas likely involved:
  Operations Application contracts; Sale mapping; actor-display resolution; OpenAPI tests.
- Execution notes:
  Mantener campos actuales y añadir SalesChannel, PaymentMethod, ConfirmedAt, ConfirmedByUserId y display name si puede resolverse según patrón seguro existente. No crear SaleStatus, Receipt ni ProductName snapshot solo para impresión futura.
- Verification method:
  201 Sale devuelve campos nuevos desde entidad/actor real y mantiene todos los campos previos.
- Dependencies:
  Task 10.

- [x] **Task 12: [HU-012] Completar las regressions backend de Sale**

- Objective:
  Demostrar eligibility, atomicidad, uniqueness, payment/channel, Shift e Inventory.
- Files or areas likely involved:
  Operations PostgreSQL integration/concurrency tests.
- Execution notes:
  Cubrir ENTREGADO success; PENDIENTE/EN_PREPARACION/LISTO/CANCELADO reject; Direct+CASH; Direct+QR; PedidosYa+EXTERNAL; invalid combinations; duplicate concurrent Sale; total snapshot; current Shift; SALE movement; preparation stock only; rollback.
- Verification method:
  PostgreSQL assertions muestran una Sale máxima, movimientos correctos, balance correcto y cero partial persistence.
- Dependencies:
  Tasks 10, 11.

- [x] **Task 13: [SHARED] Ejecutar backend gates y validar migration state**

- Objective:
  Estabilizar todo backend antes de regenerar contratos.
- Files or areas likely involved:
  Entire backend solution.
- Execution notes:
  Auditar comandos reales y ejecutar restore/build/all tests. Resolver fallos normales atribuibles al change. Validar migration chain si Task 6 generó migration. Confirmar prerequisite Shift stabilization.
- Verification method:
  Restore/build/tests reales con failed=0; migration status y counts reportados dinámicamente.
- Dependencies:
  Tasks 8, 12.

- [x] **Task 14: [SHARED] Regenerar runtime OpenAPI y generated TypeScript**

- Objective:
  Publicar solo el contrato backend ya verde hacia frontend.
- Files or areas likely involved:
  API runtime OpenAPI; `frontend/src/types/api.generated.ts`.
- Execution notes:
  Levantar API Development mediante workflow real. Verificar CreateOrder acknowledgement, structured shortage metadata y expanded SaleDto. Ejecutar `pnpm run api:generate` solo si sigue siendo el script canónico. No editar generated file.
- Verification method:
  Diff generated es explicable/aditivo; `/orders` y `/sales` conservan paths/verbs; generated code compila.
- Dependencies:
  Task 13.

- [x] **Task 15: [HU-012] Crear la foundation frontend de Sale**

- Objective:
  Consumir `POST /sales` sin duplicar HTTP/Auth/Query infrastructure.
- Files or areas likely involved:
  Existing `sales` endpoint registry; new/existing Sales feature API; TanStack mutation; query invalidation.
- Execution notes:
  Derivar request/response de generated types. Usar shared httpClient. On success, invalidar Inventory y Orders relevantes. On error, no optimistic Sale. No manual JWT/token.
- Verification method:
  API tests verifican method/path/body y query invalidation; no direct fetch paralelo.
- Dependencies:
  Task 14.

- [x] **Task 16: [HU-012] Añadir la ruta de checkout vinculada al Order**

- Objective:
  Hacer accesible el cobro solo desde la capability Orders.
- Files or areas likely involved:
  AppRoutes; OrderDetailPage; Sales/Checkout page.
- Execution notes:
  Preferir `/pedidos/:id/cobrar` si las routes locales siguen como auditadas. Reusar Orders role guard. Mostrar CTA Cobrar únicamente en ENTREGADO. Checkout vuelve a validar Order data y backend sigue siendo autoridad.
- Verification method:
  Route tests cubren ADMINISTRADOR/ENCARGADO/MESERO, anonymous/forbidden y estados Order elegibles/no elegibles.
- Dependencies:
  Task 15.

- [x] **Task 17: [HU-012] Implementar el checkout desktop/mobile sin scope futuro**

- Objective:
  Construir la pantalla de confirmación usando los mockups solo como composición visual.
- Files or areas likely involved:
  Checkout page/components; existing Card/Button/Alert/selection primitives; styles.
- Execution notes:
  Mostrar real Order id, tableReference si existe, ENTREGADO, items, subtotal/total, channel y payment. Omitir Customer, NIT, discounts y Caja 1. Si Order no tiene channel, permitir Directo/PedidosYa. Restringir payments a combinaciones backend. Mantener Cancelar cobro como navigation-only. Implementar layout desktop 2-column y mobile stacked/~360 px; sticky CTA solo si es accesible.
- Verification method:
  Component tests verifican campos reales y ausencia explícita de Customer/discount/fake cash register; manual-ready layout no tiene overflow significativo.
- Dependencies:
  Tasks 15, 16.

- [x] **Task 18: [SHARED] Reutilizar un único dialog de shortage en Order y fallback Sale**

- Objective:
  Evitar duplicar UX HU-013 y cubrir la carrera excepcional de checkout.
- Files or areas likely involved:
  Shared or feature-level shortage dialog; NewOrderPage; Checkout page.
- Execution notes:
  El componente recibe shortages estructurados y callbacks; no conoce API. New Order lo usa como flujo normal. Checkout lo usa solo cuando Sale devuelve shortage sin acknowledgement previo. `Faltante` muestra positivo. Soporta N items y mobile.
- Verification method:
  Tests del componente prueban múltiples shortages, units, Volver/Continuar y accesibilidad; integration UI tests distinguen Order-time normal vs Sale-time fallback.
- Dependencies:
  Tasks 9, 17.

- [x] **Task 19: [HU-012] Implementar la confirmación y success dialog**

- Objective:
  Completar la experiencia posterior a un 201 Sale real.
- Files or areas likely involved:
  Checkout mutation integration; success dialog.
- Execution notes:
  Confirm button usa channel/payment seleccionado y ack false normalmente. En success, renderizar Sale id, total, payment/channel y actor/time si DTO lo expone. Copy: venta registrada; no afirmar receipt generado. Primary action Volver a pedidos. No Nueva venta. Cancelar antes del POST sigue sin mutation.
- Verification method:
  Tests cubren pending, 201 success, values from response, copy correcta, Volver a pedidos y ausencia de print/new-sale behavior.
- Dependencies:
  Tasks 17, 18.

- [x] **Task 20: [SHARED] Añadir frontend conflict/error regressions**

- Objective:
  Manejar races operativas sin repetir mutaciones inseguras.
- Files or areas likely involved:
  Orders/Sales frontend tests; shared error type guards.
- Execution notes:
  Cubrir duplicate Sale 409, final new-shortage 409, second acknowledged Sale, network failure y unrelated conflict. No retry automático de Sale mutation. Refetch cuando el estado puede haber cambiado.
- Verification method:
  Tests demuestran que solo el shortage code abre dialog y que duplicate/other conflicts tienen mensajes/refetch adecuados.
- Dependencies:
  Tasks 18, 19.

- [x] **Task 21: [SHARED] Validar responsive y accesibilidad contra las tres referencias**

- Objective:
  Alinear la UX funcional con Cobro Desktop, Cobro Mobile y Modales de Cobro sin incorporar features omitidas.
- Files or areas likely involved:
  Checkout; shortage dialog; success dialog.
- Execution notes:
  Revisar desktop y ~360 px. Confirmar focus, labels, keyboard, scroll del modal, touch targets, no color-only warnings y sticky CTA seguro. Documentar KEEP/ADAPT/OMIT. No fabricar screenshots.
- Verification method:
  Automated accessibility/structure checks disponibles + checklist manual preparado. Cualquier manual PASS se registra solo cuando una persona lo realiza.
- Dependencies:
  Tasks 17-20.

- [x] **Task 22: [SHARED] Ejecutar frontend quality gates completos**

- Objective:
  Demostrar compatibilidad de Orders existentes y nuevo checkout.
- Files or areas likely involved:
  Entire frontend.
- Execution notes:
  Auditar `package.json` local y ejecutar los scripts reales: generation already complete, format/check, typecheck, lint, tests, build. No limpiar deuda no relacionada salvo que bloquee directamente.
- Verification method:
  Todos los gates reportan PASS y tests failed=0 con counts reales.
- Dependencies:
  Tasks 14-21.

- [x] **Task 23: [HU-012] Actualizar documentación y manifest individual**

- Objective:
  Cerrar la trazabilidad de HU-012 sin atribuirle trabajo exclusivo de HU-013.
- Files or areas likely involved:
  Existing HU-012 document and change documentation.
- Execution notes:
  Registrar checkout, ENTREGADO eligibility, channel/payment, Sale persistence, Shift, Inventory, success UI, responsive, tests/OpenAPI y archivos HU-012/shared. Mantener printer/fiscal receipt fuera. Incluir evidencia solo si fue generada realmente.
- Verification method:
  HU-012 puede verificarse independientemente y su manifest explica cada shared file.
- Dependencies:
  Tasks 13-22.

- [x] **Task 24: [HU-013] Actualizar documentación y manifest individual**

- Objective:
  Cerrar la trazabilidad específica de stock insuficiente.
- Files or areas likely involved:
  Existing HU-013 document and change documentation.
- Execution notes:
  Registrar Order-time warning, all shortages, ack retry, audit trace, no Inventory at Order, final Sale fallback, negative-stock semantics, tests y archivos HU-013/shared. Corregir documentation drift que todavía describa el warning normal exclusivamente en Sale.
- Verification method:
  HU-013 document separa claramente su responsabilidad de HU-012 y contiene solo evidencia real.
- Dependencies:
  Tasks 13-22.

- [x] **Task 25: [SHARED] Ejecutar auditoría final de compatibilidad y scope**

- Objective:
  Confirmar que el change implementó el flujo completo sin contaminarlo con HUs futuras.
- Files or areas likely involved:
  Complete diff; routes; OpenAPI diff; generated TypeScript; migration list; tests; HU manifests.
- Execution notes:
  Verificar: new backend endpoints=0 salvo hallazgo local excepcional aprobado; existing route/verb changes=0; Customer=none; discounts=none; printer=none; Receipt entity=none; Inventory reservation=none; one Inventory authority; one Sale per Order; normal warning at Order; final safety at Sale.
- Verification method:
  Checklist final satisface Definition of Done y todos los gates/evidence son trazables.
- Dependencies:
  Tasks 23, 24.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 700–1,300 LoC manuales entre backend, migration condicional, frontend y tests, más generated TypeScript/documentation. El rango debe recalcularse después del preflight local porque parte del contrato puede estar adelantado respecto del remoto.
- Risk of exceeding 400 LoC review threshold:
  High.
- Recommendation:
  Chained PRs
- Suggested split if chained:
  Mantener UN SOLO OpenSpec change, pero revisar en slices cohesivos gestionados por el humano:
  1. HU-013 backend + acknowledgement audit + PostgreSQL tests.
  2. HU-013 New Order UX + shared shortage dialog.
  3. HU-012 Sale backend/DTO regressions.
  4. HU-012 checkout frontend + responsive.
  5. OpenAPI/generated contract + full regression + documentation.

  Esta recomendación no autoriza al agente a crear branches, commits o PRs.
