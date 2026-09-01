# Spec

## Requirements

### HU-014 — Customer Management

- [HU-014] El frontend MUST consumir exclusivamente los contratos Customer generados desde el OpenAPI actual.
- [HU-014] El frontend MUST NOT duplicar DTOs backend completos mediante interfaces TypeScript manuales.
- [HU-014] La pantalla Customers MUST ser accesible para `ADMINISTRADOR`, `ENCARGADO` y `MESERO`.
- [HU-014] El frontend MUST aplicar unión de capabilities para usuarios multi-role.
- [HU-014] `ADMINISTRADOR` MUST poder consultar, crear, editar, activar y desactivar Customers.
- [HU-014] `ENCARGADO` MUST poder consultar, crear, editar, activar y desactivar Customers.
- [HU-014] `MESERO` MUST poder consultar, crear y editar Customers.
- [HU-014] `MESERO` MUST NOT recibir acciones para activar o desactivar Customers.
- [HU-014] Otros roles MUST NOT recibir acceso a Customer management salvo que el contrato/capability local final demuestre explícitamente una decisión aprobada equivalente.
- [HU-014] La ruta Customers MUST estar protegida mediante la estrategia de guard existente y MUST NOT depender solamente de ocultar el navigation item.
- [HU-014] El listado MUST utilizar paginación del backend.
- [HU-014] La búsqueda MUST consultar backend por Name, CI o NIT conforme al parámetro real generado.
- [HU-014] El frontend MUST NOT filtrar solo la página actual y presentarlo como search global.
- [HU-014] El filtro Activos/Inactivos MAY mostrarse únicamente cuando exista soporte server-side real.
- [HU-014] Si el backend no soporta filtro server-side de estado, la UI MUST omitir ese filtro.
- [HU-014] El formulario Customer MUST contener Name, CI, NIT opcional y Notes opcional.
- [HU-014] Name MUST validarse como requerido.
- [HU-014] CI MUST validarse como requerido.
- [HU-014] NIT MUST permanecer opcional.
- [HU-014] Notes MUST permanecer opcional.
- [HU-014] Los campos de texto MUST aplicar trim coherente con el patrón actual antes de la mutation o mediante la normalización ya existente.
- [HU-014] El frontend MUST NOT introducir reglas fiscales de longitud/formato de CI/NIT no presentes en el backend.
- [HU-014] Customer create MUST NOT exponer IsActive como campo editable.
- [HU-014] Un Customer nuevo MUST quedar active conforme a la regla backend aprobada.
- [HU-014] Customer edit MUST NOT cambiar IsActive implícitamente.
- [HU-014] Activate y deactivate MUST ser acciones independientes del formulario de edición.
- [HU-014] El frontend MUST NOT ofrecer delete Customer.
- [HU-014] La UI SHOULD usar terminología `Dar de baja`/`Desactivar` en vez de `Eliminar`.
- [HU-014] La desactivación SHOULD explicar que el Customer deja de estar disponible para nuevas Sales y conserva historia previa.
- [HU-014] Conflictos de CI/NIT MUST mostrarse con feedback comprensible y SHOULD mapearse al field cuando el ProblemDetails/código real lo permita.
- [HU-014] Las mutations MUST impedir double-submit mientras están pending.
- [HU-014] Las mutations exitosas MUST invalidar/refrescar únicamente Customer queries relacionadas.
- [HU-014] El estado base vacío MUST distinguirse de un resultado vacío por search/filter.
- [HU-014] El CTA de creación en empty state MUST mostrarse únicamente a usuarios con CustomerCreate.
- [HU-014] Desktop SHOULD usar tabla cuando sea coherente con primitives existentes.
- [HU-014] Mobile MUST usar cards o representación vertical equivalente y MUST NOT comprimir la tabla desktop como UI primaria.

### HU-014 — Customer en ConfirmSale

- [HU-014] La integración Customer MUST extender el ConfirmSale existente en lugar de crear un nuevo flujo de Sale.
- [HU-014] La asociación Customer MUST ser opcional.
- [HU-014] `Consumidor final` MUST representar ausencia de Customer y MUST NOT crear un Customer persistido ficticio.
- [HU-014] Cuando se selecciona Customer, ConfirmSale MUST enviar el `customerId` real utilizando el nombre y nullable semantics del contrato generado.
- [HU-014] ConfirmSale MUST NOT enviar CustomerName, CI o NIT como snapshot generado por frontend.
- [HU-014] Solo Customers activos MUST ser seleccionables para nuevas Sales.
- [HU-014] Customer selector MUST permitir búsqueda por los parámetros backend reales.
- [HU-014] Customer selector MUST permitir limpiar una selección y volver a `Consumidor final`.
- [HU-014] ConfirmSale MUST ofrecer quick-create Customer sin abandonar el flujo.
- [HU-014] Quick-create MUST reutilizar el mismo CustomerForm usado por management.
- [HU-014] Quick-create MUST respetar los permisos CustomerCreate del usuario.
- [HU-014] Después de un create exitoso, el Customer retornado MUST quedar seleccionado mediante su ID retornado.
- [HU-014] El frontend MUST NOT buscar por Name para localizar el Customer recién creado.
- [HU-014] Cancelar quick-create MUST devolver al ConfirmSale sin perder el estado previo de Sale.
- [HU-014] Un conflicto CI/NIT durante quick-create MUST mantener el formulario abierto.
- [HU-014] Abrir/cerrar quick-create MUST preservar payment, channel, Order context y demás estado vigente de ConfirmSale.
- [HU-014] Si un Customer seleccionado se vuelve inactivo antes de confirmar, el frontend MUST manejar el rechazo backend sin confirmar silenciosamente con Customer null.
- [HU-014] Ante Customer inactivo concurrentemente, la UI SHOULD limpiar/refrescar la selección y preservar el resto del formulario cuando sea posible.
- [HU-014] Una Sale ya confirmada MUST NOT exponer reassignment de Customer.

### HU-015 — Sales History

- [HU-015] El frontend MUST consultar Sales confirmadas mediante el endpoint real de history.
- [HU-015] El historial MUST NOT tratar Orders pendientes como Sales.
- [HU-015] El período inicial MUST ser el business date actual.
- [HU-015] La lógica de fecha MUST respetar `America/La_Paz` y utilities locales existentes.
- [HU-015] El frontend MUST mapear los filtros reales disponibles para from, to, Shift/ShiftType, SalesChannel, PaymentMethod, customer search y pagination.
- [HU-015] Cuando cambia un filtro, page MUST volver a la primera página.
- [HU-015] El frontend MUST utilizar paginación server-side.
- [HU-015] El frontend MUST NOT descargar todas las Sales para simular filtros globales.
- [HU-015] `PaymentMethod` MUST representarse únicamente con los valores generados reales; para los valores congelados:
  - `CASH` → `Efectivo`;
  - `QR` → `QR`;
  - `EXTERNAL` → `Pago externo`.
- [HU-015] La UI MUST NOT inventar `Tarjeta`, `Transferencia` o `QR Simple`.
- [HU-015] `SalesChannel` MUST representarse únicamente con:
  - `DIRECT` → `Directo`;
  - `PEDIDOSYA` → `PedidosYa`.
- [HU-015] SalesChannel y PaymentMethod MUST permanecer dimensiones independientes.
- [HU-015] Un `PEDIDOSYA` pagado con `CASH` MUST poder representarse sin error.
- [HU-015] La UI MUST NOT mostrar business sale numbers ficticios.
- [HU-015] Si se muestra el Sale ID, MUST utilizar el identificador real retornado por backend.
- [HU-015] Desktop SHOULD mostrar una tabla responsive con las columnas soportadas contractualmente.
- [HU-015] Mobile MUST usar cards o rows verticales.
- [HU-015] La vista MUST poder comunicar `Mostrando X de Y` usando metadata de paginación.
- [HU-015] La vista MUST NOT mostrar revenue/total-period analytics pertenecientes a reporting.
- [HU-015] La vista MUST NOT exponer una acción `Nueva venta`.
- [HU-015] Sale creation MUST seguir naciendo desde el workflow existente de Order.
- [HU-015] La búsqueda histórica de Customer MUST utilizar snapshot-search del backend cuando esté disponible y MUST NOT resolver Customer actual para reescribir historia.

### HU-015 — Scope y autorización

- [HU-015] `ADMINISTRADOR` MUST recibir la experiencia de history permitida por el backend.
- [HU-015] `ENCARGADO` MUST recibir la experiencia de history permitida por el backend.
- [HU-015] `CONTADORA` MUST recibir acceso broad read si así lo confirma el contrato/policy final ya aprobado.
- [HU-015] `MESERO` MUST limitarse al current active assigned Shift según backend.
- [HU-015] Un usuario MESERO-only MUST NOT recibir un selector libre de todos los Shifts.
- [HU-015] Un usuario multi-role con una capability broad MUST recibir la unión de capabilities y MUST NOT quedar restringido únicamente por poseer también MESERO.
- [HU-015] La ruta Sales History MUST usar guards existentes.
- [HU-015] El frontend MUST continuar manejando respuestas 401/403 mediante la foundation de auth/http existente.
- [HU-015] El frontend MUST adaptarse al comportamiento backend REAL cuando MESERO no tenga active assigned Shift; no se fija 409/empty/etc. hasta auditar el contrato local.

### HU-015 — Sale Detail

- [HU-015] Sale detail MUST obtener los datos desde el contrato Sale detail real.
- [HU-015] Si el list DTO no contiene detalle completo, detail MUST cargarse on-demand al abrir el overlay.
- [HU-015] El list MUST NOT disparar una request detail por cada Sale.
- [HU-015] Desktop SHOULD usar Drawer/Dialog/Modal existente o extensión mínima.
- [HU-015] Mobile SHOULD usar sheet/fullscreen overlay compatible con las primitives reales.
- [HU-015] El detail MUST mostrar datos contractualmente disponibles para:
  - Customer snapshot;
  - CI snapshot;
  - NIT snapshot;
  - Shift;
  - Channel;
  - PaymentMethod;
  - responsible;
  - date/time;
  - Sale ID;
  - items;
  - quantity;
  - unit price;
  - line total;
  - total paid.
- [HU-015] Customer null MUST mostrarse como `Consumidor final`.
- [HU-015] CI/NIT null MUST omitirse en vez de renderizar `null`.
- [HU-015] Customer histórico MUST provenir de snapshot fields de Sale.
- [HU-015] El frontend MUST NOT consultar Customer actual para reemplazar los snapshots históricos.
- [HU-015] La UI MUST NOT mostrar IVA inventado.
- [HU-015] La UI MUST NOT mostrar descuentos inventados.
- [HU-015] La UI MUST NOT afirmar que el documento es factura fiscal.
- [HU-015] La UI MUST NOT ofrecer `Reimprimir Ticket`.

### HU-015 — PDF interno client-side

- [HU-015] Sale detail MUST ofrecer `Descargar comprobante PDF`.
- [HU-015] El PDF MUST generarse íntegramente client-side.
- [HU-015] La generación MUST NOT requerir un endpoint backend nuevo.
- [HU-015] La generación MUST NOT enviar información a un SaaS externo.
- [HU-015] El PDF MUST usar exclusivamente el Sale detail ya autorizado.
- [HU-015] Customer dentro del PDF MUST utilizar snapshots de Sale.
- [HU-015] El PDF MUST incluir como mínimo:
  - Fratelli;
  - título `Comprobante interno de venta`;
  - fecha/hora;
  - Shift;
  - Channel;
  - PaymentMethod;
  - responsible;
  - Customer o `Consumidor final`;
  - CI/NIT cuando existan;
  - Sale items;
  - quantity;
  - unit price;
  - line total;
  - total paid;
  - Sale ID real.
- [HU-015] El PDF MUST incluir texto equivalente a `Comprobante interno — No constituye factura fiscal.`.
- [HU-015] El PDF MUST NOT incluir IVA, descuentos, invoice number o datos fiscales inexistentes.
- [HU-015] El filename MUST derivarse de datos reales y MUST NOT usar un sequential business number inventado.
- [HU-015] La dependencia PDF MAY añadirse durante APPLY si no existe una adecuada.
- [HU-015] La librería seleccionada SHOULD ser mantenida, compatible con TypeScript/Vite, browser-only, razonable en bundle y testeable.
- [HU-015] La lógica PDF SHOULD residir fuera del component de detail para evitar acoplamiento de render y export.
- [HU-015] Un fallo de PDF MUST mostrar feedback recuperable y MUST NOT invalidar la Sale.

### UX, responsive y accesibilidad compartidos

- [SHARED] Customers y Sales History MUST funcionar aproximadamente desde 360px.
- [SHARED] Layout tablet y desktop MUST permanecer utilizables.
- [SHARED] Las tablas desktop MUST convertirse en representación mobile apropiada cuando no quepan de manera legible.
- [SHARED] Los overlays MUST mantener scroll accesible en viewports pequeños.
- [SHARED] Inputs MUST tener labels asociados.
- [SHARED] Icon-only actions MUST tener accessible name.
- [SHARED] Dialogs/sheets MUST manejar focus según la foundation actual.
- [SHARED] Status MUST incluir texto y MUST NOT depender solamente del color.
- [SHARED] Pending mutations MUST comunicar estado disabled/busy.
- [SHARED] Error responses MUST consumir ProblemDetails a través del client/error system existente.
- [SHARED] El frontend MUST NOT introducir una segunda arquitectura global de errores.
- [SHARED] El frontend MUST NOT persistir tokens adicionales ni cambiar auth/session.

### Contrato y compatibilidad

- [SHARED] Backend MUST permanecer sin cambios durante este frontend change.
- [SHARED] OpenAPI backend MUST permanecer sin cambios.
- [SHARED] `api.generated.ts` MUST NOT editarse manualmente.
- [SHARED] Existing routes MUST NOT renombrarse salvo que la auditoría local determine que la ruta todavía no existe y se añada siguiendo la convención actual.
- [SHARED] Existing AppShell MUST reutilizarse.
- [SHARED] Existing auth guards MUST reutilizarse.
- [SHARED] Existing TanStack Query infrastructure MUST reutilizarse.
- [SHARED] Existing API/http client MUST reutilizarse.
- [SHARED] No debe crearse un server-state store paralelo.
- [SHARED] No debe introducirse una nueva form library exclusivamente para este change.
- [SHARED] PDF es la única nueva capability de export exigida en este bloque.
- [SHARED] CSV/XLSX MUST NOT implementarse anticipadamente.

## Behavior Scenarios

### Scenario 1: ADMIN crea un Customer

Given un `ADMINISTRADOR` autenticado con acceso CustomerCreate  
When completa Name y CI válidos, deja NIT/Notes opcionales y guarda  
Then el frontend MUST enviar el request generado correcto, MUST NOT enviar un estado editable elegido por usuario y MUST refrescar la lista al éxito

### Scenario 2: MESERO edita sin administrar estado

Given un `MESERO` autenticado con CustomerEdit pero sin CustomerStatusManage  
When abre Customers  
Then MUST poder consultar y editar Customers y MUST NOT ver acciones Activar/Desactivar

### Scenario 3: Búsqueda global de Customers

Given existen Customers distribuidos en varias páginas backend  
When el usuario busca por CI  
Then la query MUST enviar la búsqueda al backend y MUST NOT filtrar únicamente la página ya cargada

### Scenario 4: Conflicto de CI

Given un formulario Customer abierto  
When backend rechaza la mutation por CI duplicado  
Then el formulario MUST permanecer abierto y SHOULD mostrar `Ya existe un cliente con este CI` cerca del field cuando el error estructurado lo permita

### Scenario 5: Consumidor final

Given una Sale elegible en ConfirmSale  
When el usuario elige `Consumidor final` y confirma  
Then ConfirmSale MUST enviar ausencia de customerId según el nullable contract exacto y MUST preservar el resto del request existente

### Scenario 6: Quick-create dentro de ConfirmSale

Given un usuario con CustomerCreate está confirmando una Sale  
When abre quick-create, crea un Customer válido y backend retorna el nuevo recurso  
Then el modal MUST cerrarse, el Customer retornado MUST quedar seleccionado por ID y los campos previos de payment/channel/order MUST conservarse

### Scenario 7: Quick-create con conflicto

Given ConfirmSale conserva un estado de pago válido  
When quick-create Customer falla por CI/NIT duplicado  
Then CustomerForm MUST permanecer abierto y el estado de ConfirmSale MUST conservarse

### Scenario 8: Customer desactivado concurrentemente

Given un Customer activo fue seleccionado en ConfirmSale  
When otro actor lo desactiva antes del POST final y backend rechaza la asociación  
Then la UI MUST informar que el Customer ya no está disponible, MUST NOT confirmar silenciosamente con null y SHOULD conservar los demás valores del formulario

### Scenario 9: Historial abre en hoy

Given un usuario autorizado ingresa a Sales History  
When la vista se inicializa  
Then from/to MUST representar el business date actual conforme a las utilities existentes y la primera query MUST usar ese período

### Scenario 10: MESERO consulta su historial

Given un usuario MESERO-only con Shift actual asignado  
When abre Sales History  
Then la UI MUST mostrar su scope autorizado y MUST NOT ofrecer un selector libre de todos los Shifts

### Scenario 11: Multi-role amplía scope

Given un usuario posee `MESERO` y `ENCARGADO`  
When abre Sales History  
Then la experiencia MUST reflejar la capability amplia de ENCARGADO y MUST NOT restringirse al comportamiento de MESERO-only

### Scenario 12: Sale sin Customer

Given una Sale histórica no tiene Customer asociado  
When aparece en list/detail/PDF  
Then la UI MUST mostrar `Consumidor final` y MUST NOT crear o consultar un Customer ficticio

### Scenario 13: Snapshot permanece histórico

Given una Sale conserva snapshot `Andrés Mendoza / CI 123`  
And el Customer actual luego cambia a `Andrés José / CI 456`  
When el usuario abre el Sale detail  
Then MUST visualizar `Andrés Mendoza / CI 123`

### Scenario 14: Detail carga on-demand

Given el list DTO no contiene items completos  
When el usuario selecciona `Ver detalle`  
Then el frontend MUST solicitar únicamente el detail de esa Sale y MUST NOT precargar detail de todas las Sales del listado

### Scenario 15: PDF no fiscal

Given un Sale detail válido  
When el usuario descarga el comprobante  
Then el PDF MUST contener los snapshots, items, total y Sale ID reales y MUST incluir aviso de documento interno no fiscal

### Scenario 16: Filtros cambian página

Given el usuario está en page 4 del historial  
When cambia PaymentMethod  
Then page MUST resetearse a 1 antes de consultar el nuevo result set

### Scenario 17: Empty vs error

Given la API responde exitosamente con cero registros para los filtros  
When la pantalla renderiza  
Then MUST mostrarse un filtered-empty state y MUST NOT mostrarse un API error state

### Scenario 18: Responsive Customer

Given viewport de aproximadamente 360px  
When se abre Customers  
Then la información MUST presentarse en cards/rows legibles sin horizontal overflow de una tabla desktop

### Scenario 19: Responsive Sales Detail

Given viewport de aproximadamente 360px  
When se abre una Sale  
Then el detail MUST ser usable mediante el overlay mobile elegido, permitir scroll y mantener accesible la acción PDF

## Edge Cases

- El contrato local Customer usa nombres diferentes a los conceptuales del prompt.
- El backend no ofrece filtro IsActive server-side.
- Customer list devuelve NIT null.
- Customer Notes es null o muy largo.
- Customer list cambia mientras el usuario está paginando.
- Create Customer responde exitosamente pero la lista actual tiene un filtro que excluye el registro.
- Customer quick-created deja de ser active antes de ConfirmSale.
- El usuario cambia a `Consumidor final` después de seleccionar Customer.
- ConfirmSale tiene mutation pending mientras se intenta abrir quick-create.
- MESERO no tiene current assigned active Shift.
- El usuario multi-role contiene tanto un rol narrow como uno broad.
- Sale snapshot CI o NIT es null.
- Customer actual fue editado o desactivado después de la Sale.
- Sale detail responde 404 al abrirse desde una lista stale.
- Filters producen cero Sales.
- Historial contiene múltiples páginas.
- `PEDIDOSYA` combinado con `CASH`.
- Monetary values decimales.
- Sale ID UUID largo.
- Detail contiene suficientes items para requerir scroll.
- PDF generation falla por runtime/browser.
- PDF se dispara rápidamente varias veces.
- Customer search se escribe rápidamente y dispara varias queries.
- Network error durante list sin perder filtros.
- Network error durante detail sin cerrar necesariamente la vista completa.
- Navegación directa a rutas protegidas.
- Viewport 360px con teclado virtual y modal Customer abierto.

## Acceptance Criteria

- La primera fase de APPLY MUST registrar los nombres exactos de endpoints y schemas Customer/Sales desde el `api.generated.ts` LOCAL ACTUAL.
- Ningún source file MUST incluir DTO backend completo duplicado manualmente cuando existe type generado.
- `ADMINISTRADOR` y `ENCARGADO` MUST tener management completo de Customer.
- `MESERO` MUST poder read/create/edit Customer y MUST NOT poder activate/deactivate desde UI.
- El Customer form MUST carecer de control IsActive editable.
- Create Customer MUST requerir Name y CI.
- Search Customer MUST ejecutarse server-side.
- Customer list MUST usar pagination server-side.
- ConfirmSale MUST aceptar Customer real o `Consumidor final`.
- Quick-create MUST reutilizar CustomerForm y MUST auto-select por ID devuelto.
- ConfirmSale regression MUST demostrar que payment/channel/shortage/order siguen funcionando con y sin Customer.
- Sales History MUST iniciar con el período hoy.
- History MUST usar server-side filters/pagination.
- MESERO-only MUST carecer de broad Shift filter.
- Multi-role broad MUST conservar capability broad.
- List/detail MUST usar Customer snapshots históricos.
- Sale detail MUST omitir discounts e IVA inexistentes.
- No UI MUST presentar fake sequential Sale number.
- History MUST carecer de `Nueva Venta`.
- Sale detail MUST carecer de `Reimprimir Ticket`.
- PDF MUST generarse client-side y MUST declararse no fiscal.
- PDF MUST usar Sale detail y MUST NOT consultar Customer actual.
- Backend MUST permanecer sin cambios.
- OpenAPI backend MUST permanecer sin cambios.
- Generated API MUST permanecer sin edición manual.
- Tests de Customers, quick-create, ConfirmSale regression, Sales History, detail, PDF, routing y authorization UX MUST pasar.
- `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test` y `pnpm run build` MUST pasar si esos scripts siguen presentes en el package local; el snapshot público confirma actualmente esos nombres. citeturn672392view1
- Manual responsive validation MUST cubrir aproximadamente 360px, tablet y desktop.
- Evidencia manual MUST registrarse únicamente si fue realizada realmente.

## Out of Scope

- Cambios backend/OpenAPI.
- Customer delete.
- Customer fiscal profile.
- Customer phone/email/address.
- Customer credit/loyalty.
- Reports y monetary summary.
- Facturación fiscal.
- IVA/descuentos.
- PaymentMethod adicionales.
- SalesChannel adicionales.
- New Sale independiente.
- Reprint/thermal printer.
- PDF server-side.
- CSV/XLSX.
- Cualquier otra HU de Sprint 3.
