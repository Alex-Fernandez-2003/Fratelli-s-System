# Spec

## Requirements

### HU-026 — Preview de cierre

- El frontend MUST consumir el preview mediante el endpoint backend existente `GET /api/v1/cash/preview`.
- El frontend MUST usar `CashPreviewDto.expectedCash` como valor autoritativo de efectivo esperado.
- El frontend MUST NOT recalcular el efectivo esperado como fuente de verdad.
- El frontend MUST mostrar `businessDate` usando las conventions temporales existentes.
- El frontend MUST mostrar `openingAmount` y `pettyCashOpeningAmount`.
- El frontend MUST presentar `cashSalesTotal`, `qrSalesTotal` y `externalSalesTotal` como desglose por medio de pago.
- El frontend MUST presentar `directSalesTotal` y `pedidosYaSalesTotal` como desglose separado por canal.
- El frontend MUST NOT tratar `PEDIDOSYA` como sinónimo de `EXTERNAL`.
- El frontend MUST mostrar `cashDrawerExpensesTotal` y `pettyCashExpensesTotal` de forma distinguible.
- El frontend MUST presentar `cashRemovedAmount`.
- El frontend SHOULD mostrar `cashAmountCarriedForward` como contexto del handover cuando exista.
- El frontend MUST NOT volver a sumar `cashAmountCarriedForward` a `expectedCash`.
- El frontend MUST mostrar un estado de loading mientras no haya preview inicial.
- Un error recuperable de preview MUST ofrecer retry.
- Un `404` MUST producir un estado operacional seguro en vez de un formulario con valores ficticios.
- El frontend MUST NOT mostrar ceros inventados cuando no existe una CashSession utilizable.
- El frontend MUST NOT consumir los endpoints de historial de cierres para HU-026.

### HU-027 — Registro de cierre

- El formulario MUST permitir enviar únicamente los datos contractuales de `CloseCashRequest`: `declaredCash` y `observation`.
- `declaredCash` MUST ser editable.
- `expectedCash`, ventas, gastos, apertura y traspaso MUST ser read-only.
- El frontend MAY calcular `declaredCash - expectedCash` para feedback inmediato.
- La diferencia calculada en frontend MUST considerarse provisional.
- Tras un cierre exitoso, el frontend MUST mostrar `CashClosingDto.difference` como resultado autoritativo.
- Si la diferencia provisional es cero, `observation` MUST ser opcional.
- Si la diferencia provisional es distinta de cero, la UI MUST exigir una observación no vacía antes de confirmar.
- El backend MUST seguir siendo la autoridad final de la validación de diferencia/observación.
- La UI MUST distinguir explícitamente:
  - caja cuadrada;
  - sobrante;
  - faltante.
- La diferencia MUST NOT comunicarse únicamente mediante color.
- Antes del POST final, el frontend MUST solicitar confirmación explícita.
- La confirmación MUST mostrar al menos:
  - business date;
  - expected cash;
  - declared cash;
  - provisional difference;
  - observation cuando exista;
  - usuario autenticado como responsable visible.
- Mientras el POST esté pending, el control de confirmación MUST permanecer deshabilitado.
- El frontend MUST NOT iniciar intencionadamente dos requests de cierre mediante doble click.
- Un `409` MUST NOT provocar retry automático.
- Ante `409`, el frontend MUST invalidar/refetch el estado Cash/Shift relevante.
- Ante `409`, el formulario MUST dejar de presentar el cierre como una operación pendiente normal.
- Un `400` MUST presentarse como error de validación seguro y legible.
- Los errores inesperados MUST utilizar el manejo de ProblemDetails/shared error existente.
- Un cierre exitoso MUST mostrar:
  - business date;
  - expected cash;
  - declared cash;
  - final difference;
  - observation cuando exista;
  - closed timestamp;
  - responsable visible.
- El frontend MUST NOT afirmar que se imprimió o generó un reporte/PDF.
- El frontend MUST NOT ofrecer historial de cierres dentro de este change.

### Autorización

- La route de cierre MUST requerir autenticación.
- La route de cierre MUST permitir `ADMINISTRADOR`.
- La route de cierre MUST permitir `ENCARGADO`.
- La route MUST NOT permitir `MESERO`, `COCINA`, `CONTADORA` ni `EMPLEADO`.
- La autorización frontend MUST reutilizar el mecanismo de roles/capabilities existente.
- La UI MUST NOT reemplazar la autorización backend.
- Los usuarios multi-role MUST conservar la semántica de unión de roles del sistema.

### Arquitectura frontend

- El change MUST reutilizar el AppShell autenticado existente.
- El change MUST reutilizar el shared HTTP client existente.
- El change MUST reutilizar el QueryClient existente.
- El change MUST usar TanStack Query para preview y close mutation.
- El change MUST derivar tipos desde `api.generated.ts`.
- El change MUST NOT editar manualmente `api.generated.ts`.
- El change MUST NOT crear un segundo sistema de autenticación, HTTP o cache.
- El change SHOULD reutilizar componentes shared actuales antes de crear componentes equivalentes.
- El change MUST NOT instalar dependencias nuevas.

### Routing y navegación

- El flujo MUST tener un entry point normal desde la experiencia existente de `Turnos / Caja`.
- El frontend MUST NOT crear un segundo shell.
- Si el `develop` local no contiene una route Cash estable previa, el diseño SHOULD usar una child route coherente con `/turnos`, preferentemente `/turnos/cierre`.
- Si el `develop` local ya contiene una route Cash estable, la implementación MUST reutilizarla y MUST NOT duplicarla.
- El cierre MUST NOT añadirse como múltiples entradas redundantes de navegación global.

### Responsive y accesibilidad

- La pantalla MUST ser operable a 360 px.
- La pantalla MUST NOT introducir overflow horizontal bloqueante.
- Los breakdowns SHOULD utilizar grid en desktop y stacking en mobile.
- Los inputs MUST tener labels asociados.
- El estado de diferencia MUST contener texto además de color.
- El dialog MUST mantener focus management y cierre accesible según el componente shared existente.
- Los botones MUST tener nombres accesibles.
- Los estados de error MUST ser perceptibles mediante semántica apropiada.
- La visualización de moneda SHOULD seguir el patrón `es-BO`/BOB ya utilizado por el frontend cuando corresponda.

### Scope

- El change MUST NOT modificar backend.
- El change MUST NOT crear migrations.
- El change MUST NOT implementar HU-028.
- El change MUST NOT implementar reportes HU-029/HU-030/HU-031.
- El change MUST NOT implementar PDF, export o impresión.
- El change MUST NOT implementar firma digital o biometría.
- El change MUST NOT crear un rol `CAJERO`.

## Behavior Scenarios

### Scenario 1: Preview exitoso

Given un usuario `ADMINISTRADOR` o `ENCARGADO` autenticado y una CashSession elegible  
When abre la pantalla de cierre  
Then el frontend MUST obtener `GET /api/v1/cash/preview` y MUST mostrar el resumen recibido y `expectedCash`

### Scenario 2: Medios de pago y canales separados

Given un preview que contiene ventas CASH, QR, EXTERNAL, DIRECT y PEDIDOSYA  
When se renderiza el resumen  
Then CASH/QR/EXTERNAL MUST aparecer como medios de pago y DIRECT/PEDIDOSYA MUST aparecer como un desglose separado por canal

### Scenario 3: Carried-forward no se vuelve a sumar

Given un preview con `cashAmountCarriedForward` distinto de null y un `expectedCash` calculado por backend  
When se renderiza el cierre  
Then el valor carried-forward MAY mostrarse como contexto pero el frontend MUST mostrar `expectedCash` sin recalcularlo añadiendo ese valor

### Scenario 4: No existe caja disponible

Given que el preview responde `404`  
When la pantalla termina de cargar  
Then el usuario MUST ver un estado operacional controlado y MUST NOT ver un formulario de cierre basado en ceros ficticios

### Scenario 5: Caja cuadrada

Given `expectedCash = 1550.00`  
When el usuario introduce `declaredCash = 1550.00`  
Then la UI MUST indicar que la caja está cuadrada y `observation` MUST permanecer opcional

### Scenario 6: Faltante

Given `expectedCash = 1550.00`  
When el usuario introduce `declaredCash = 1540.00`  
Then la UI MUST mostrar un faltante de `-10.00 Bs` o representación monetaria equivalente y MUST exigir observación antes de confirmar

### Scenario 7: Sobrante

Given `expectedCash = 1550.00`  
When el usuario introduce `declaredCash = 1560.00`  
Then la UI MUST mostrar un sobrante de `+10.00 Bs` o representación equivalente y MUST exigir observación

### Scenario 8: Confirmación explícita

Given un formulario válido  
When el usuario solicita registrar el cierre  
Then el frontend MUST mostrar un dialog de confirmación antes de ejecutar `POST /api/v1/cash/close`

### Scenario 9: Doble submit

Given que `POST /api/v1/cash/close` está pending  
When el usuario vuelve a activar el control de confirmación  
Then el frontend MUST impedir un segundo submit intencionado

### Scenario 10: Cierre exitoso

Given un request válido  
When el backend devuelve `201 CashClosingDto`  
Then la pantalla MUST mostrar un estado de éxito con los valores autoritativos devueltos y MUST invalidar el contexto Cash/Shift correspondiente

### Scenario 11: Cierre concurrente

Given dos usuarios autorizados que intentan cerrar la misma CashSession  
When uno de ellos recibe `409` porque el cierre ya ocurrió  
Then su frontend MUST NOT reintentar automáticamente, MUST refetch el estado operativo y MUST informar que la caja ya no está disponible para cierre

### Scenario 12: Rol prohibido

Given un usuario autenticado con solo rol `CONTADORA`  
When intenta abrir directamente la route de cierre  
Then el guard existente MUST impedir el acceso según la estrategia de forbidden actual

### Scenario 13: Error recuperable de preview

Given que la consulta de preview falla por un error recuperable  
When se renderiza el estado de error  
Then la UI MUST mostrar feedback seguro y MUST ofrecer Retry

### Scenario 14: Mobile

Given un viewport de 360 px y un preview válido  
When se renderiza el flujo completo  
Then resumen, declared cash, diferencia, observación y acción final MUST permanecer accesibles sin scroll horizontal funcional

## Edge Cases

- `cashAmountCarriedForward = null`.
- Todos los totales monetarios válidos son cero.
- `declaredCash = 0`.
- `declaredCash` vacío.
- Input monetario inválido.
- Diferencia positiva.
- Diferencia negativa.
- Diferencia exactamente cero.
- Observation whitespace-only cuando es obligatoria.
- Preview `404`.
- Preview `403`.
- Preview error de red.
- Close `400`.
- Close `404` por cambio de estado entre preview y submit.
- Close `409` por carrera.
- Sesión que cambia mientras el usuario mantiene la pantalla abierta.
- Dos tabs del navegador sobre la misma CashSession.
- Usuario pierde una capability después de cargar la pantalla.
- Respuesta de éxito con `observation = null`.
- `closedByUserId` sin display name en el DTO.
- Formateo de `businessDate` sin convertir accidentalmente DateOnly a un día UTC diferente.
- Mobile con textos monetarios largos.
- Background refetch después del cierre.

## Acceptance Criteria

- HU-026 MUST consumir el preview generado por el backend existente.
- `expectedCash` MUST mostrarse exactamente a partir del valor del DTO, salvo formatting monetario.
- Un test MUST demostrar que CASH/QR/EXTERNAL y DIRECT/PEDIDOSYA se presentan como dimensiones independientes.
- Un test MUST demostrar que `cashAmountCarriedForward` no altera el expected cash mostrado.
- HU-027 MUST enviar exclusivamente los campos soportados por `CloseCashRequest`.
- Un test MUST demostrar que diferencia cero no exige observación.
- Un test MUST demostrar que diferencia no cero exige observación.
- Un test MUST demostrar que el dialog aparece antes del POST.
- Un test MUST demostrar que un mutation pending impide doble submit.
- Un test MUST demostrar manejo de `409` sin retry automático y con invalidación/refetch.
- Un test MUST demostrar el estado de éxito con valores provenientes de `CashClosingDto`.
- Tests de routing MUST demostrar acceso para ADMINISTRADOR y ENCARGADO.
- Tests de routing MUST demostrar denegación para al menos un rol no autorizado y la matriz crítica completa SHOULD quedar cubierta.
- La route MUST ser alcanzable desde `Turnos / Caja` sin introducir navegación global duplicada.
- La implementación MUST mantener el backend y generated API sin modificaciones.
- No MUST existir UI de historial, PDF, export o impresión como resultado de este change.
- El layout MUST ser manualmente validable a 360 px, tablet y desktop.
- `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test` y `pnpm run build` MUST terminar sin fallos atribuibles al change.

## Out of Scope

- HU-028.
- HU-029.
- HU-030.
- HU-031.
- Histórico de cierres.
- Export.
- PDF.
- XLSX/CSV.
- Impresión.
- ESC/POS.
- Reportes analíticos.
- Firma digital.
- Signature pad.
- PIN/biometría.
- Nuevos endpoints.
- Backend changes.
- Migrations.
- Nuevas dependencias.
- Múltiples cajas.
- Rol CAJERO.
