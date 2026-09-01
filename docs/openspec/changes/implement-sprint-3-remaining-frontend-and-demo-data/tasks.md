# Tasks

## Task 1: Revalidar el baseline local antes de tocar frontend

- Objective:
  - [ ] Registrar el `develop` LOCAL real y confirmar contratos, routing y reutilización disponibles antes de realizar cualquier implementación.
- Files or areas likely involved:
  Revisión read-only de Git; `frontend/package.json`; router; navigation; feature Shift; endpoint registry; generated API; shared HTTP client; AuthProvider/guards; componentes shared; tests; backend Cash endpoint/service únicamente para confirmar ProblemDetails.
- Execution notes:
  Ejecutar inspección read-only de branch, HEAD y status. Confirmar que `GET /api/v1/cash/preview` y `POST /api/v1/cash/close` coinciden con generated types. Confirmar si ya existe feature/route Cash local. Confirmar error codes/ProblemDetails reales. No modificar backend ni generated API. Si el local difiere sustancialmente del contrato congelado, detener solo ante un verdadero backend-contract contradiction.
- Verification method:
  Baseline anotado con HEAD/status, paths reales y mapping de respuestas `200/201/400/401/403/404/409`; ausencia/presencia de feature Cash documentada.
- Dependencies:
  None.

## Task 2: Añadir la capa API/query mínima de Cash

- Objective:
  - [ ] Integrar preview y close con el endpoint registry, generated types, shared HTTP client y TanStack Query existentes.
- Files or areas likely involved:
  Endpoint registry; nueva feature Cash o equivalente; query hooks; tests de API/query.
- Execution notes:
  RED: tests de preview, close, request y invalidation. GREEN: implementar únicamente adapters/hooks mínimos. TRIANGULATE: añadir casos de `404` y `409`. REFACTOR: eliminar duplicación sin introducir framework genérico. Definir `cashKeys` cohesivas. No modificar `api.generated.ts`.
- Verification method:
  Tests confirman GET preview, POST close, tipos generated, invalidación Cash/Shift y ausencia de mutation retry en conflicto.
- Dependencies:
  Task 1.

## Task 3: Construir el preview funcional de HU-026

- Objective:
  - [ ] Renderizar el resumen autoritativo de caja con estados loading/error/no-session y separación correcta entre medios de pago y canales.
- Files or areas likely involved:
  Page Cash closing; componentes feature-specific pequeños; shared Card/Alert/EmptyState/Spinner; formatter existente; tests HU-026.
- Execution notes:
  RED: tests del breakdown y `expectedCash`. GREEN: implementar las secciones Apertura, Ventas por medio, Ventas por canal, Gastos, Traspaso y Resultado. `expectedCash` debe mostrarse directamente desde backend. `cashAmountCarriedForward` es contexto, nunca input de una fórmula frontend. Adaptar la referencia desktop sin copiar datos ficticios.
- Verification method:
  Tests demuestran valores correctos, `expectedCash` server-driven, CASH/QR/EXTERNAL separados de DIRECT/PEDIDOSYA, null carried-forward, loading, error y retry.
- Dependencies:
  Task 2.

## Task 4: Implementar el formulario y confirmación de HU-027

- Objective:
  - [ ] Añadir declared cash, diferencia provisional, observación condicional y confirmación explícita antes del cierre.
- Files or areas likely involved:
  Cash closing page/form; shared Input/Textarea/FormField/Modal/Button; helpers feature-locales; tests de formulario.
- Execution notes:
  RED: casos difference zero/positive/negative, observation y dialog. GREEN: mantener `declaredCash` como input controlado, derivar diferencia solo para UX, requerir observation cuando sea distinta de cero y abrir Modal con resumen. Enviar exclusivamente `declaredCash` y `observation`. REFACTOR sin abstraer un framework financiero.
- Verification method:
  Tests validan formulario, copy de faltante/sobrante/caja cuadrada, observation condicional, payload exacto y ausencia de campos derivados.
- Dependencies:
  Tasks 2, 3.

## Task 5: Completar mutation, conflicto y estado de éxito

- Objective:
  - [ ] Cerrar el flujo operativo manejando pending, success, 400/404/409 e invalidación de estado.
- Files or areas likely involved:
  Cash query/mutation hook; Cash closing page; success/operational states; tests.
- Execution notes:
  RED: doble submit, success, 409 y refetch. GREEN: bloquear controles durante pending; usar `CashClosingDto` después de 201; en 409 no retry y refetch Cash/Shift; conservar errores de validación sin limpiar el formulario. El success muestra datos reales y current authenticated user como nombre visible cuando resulte necesario, sin inventar `closedByDisplayName`.
- Verification method:
  Tests comprueban un único request durante pending, valores server-authoritative en success, invalidaciones específicas, `409` controlado y ausencia de retry automático.
- Dependencies:
  Task 4.

## Task 6: Integrar routing, entry point y autorización

- Objective:
  - [ ] Hacer el cierre alcanzable mediante el shell existente exclusivamente para ADMINISTRADOR/ENCARGADO.
- Files or areas likely involved:
  `AppRoutes` o equivalente; `ShiftsPage`; navigation/capability helpers existentes; routing/auth tests.
- Execution notes:
  Si el local no tiene route Cash, usar preferentemente `/turnos/cierre`. Si ya existe una route estable, reutilizarla. Añadir un solo entry point razonable desde Turnos/Caja. Guard con la capability/roles existentes; no duplicar global navigation. Preservar multi-role union.
- Verification method:
  Tests demuestran ADMIN/ENCARGADO allowed, demás roles denied, multi-role allowed cuando contiene capability válida, direct URL protegido y CTA role-aware.
- Dependencies:
  Tasks 1, 3.

## Task 7: Ajustar responsive y accesibilidad con las referencias suministradas

- Objective:
  - [ ] Lograr fidelity funcional desktop/mobile manteniendo 360 px usable y eliminando elementos visuales fuera de scope.
- Files or areas likely involved:
  Cash closing page/components; estilos feature-locales/Tailwind; shared Modal y controls cuando no requieran cambios contractuales.
- Execution notes:
  Aplicar layout grid desktop y stacked mobile. Reusar Fratelli dark/orange. Mantener expected cash y CTA con jerarquía alta. Omitir “auto-ticket”, print, historial, firma digital y notificación administrativa. Garantizar labels, focus, no color-only difference, modal dentro del viewport y touch targets razonables.
- Verification method:
  Component tests donde aporten valor y checklist manual-ready para 360 px, tablet y desktop; sin overflow horizontal bloqueante.
- Dependencies:
  Tasks 3, 4, 5, 6.

## Task 8: Ejecutar regresión frontend y cerrar documentación de APPLY

- Objective:
  - [ ] Ejecutar todos los gates frontend y actualizar únicamente HU-026/HU-027 y documentación directamente necesaria con evidencia real.
- Files or areas likely involved:
  Tests frontend; HU-026; HU-027; change OpenSpec/handoff según convención real.
- Execution notes:
  Ejecutar `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test` y `pnpm run build`, confirmando previamente que siguen siendo los scripts locales reales. No ejecutar `api:generate` si backend y generated contract permanecen sin cambios. Registrar counts reales, nunca inventados. Actualizar HU-026/HU-027 solo después de implementación/gates. No ejecutar la fase OpenSpec VERIFY ni ARCHIVE como parte de esta task.
- Verification method:
  Cinco quality gates frontend sin fallos; tests HU-026/HU-027 + regresión completa; backend diff vacío; generated API sin modificaciones; docs con evidencia real y manual visual validation marcada como pendiente hasta ejecución humana.
- Dependencies:
  Tasks 2, 3, 4, 5, 6, 7.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 350-550 LoC incluyendo tests y documentación, con posibilidad de ser menor si la baseline local ya contiene primitives específicas de Cash.
- Risk of exceeding 400 LoC review threshold:
  Medium.
- Recommendation:
  Chained PRs.
- Suggested split if chained:
  PR 1: Cash API/query + HU-026 preview + routing mínimo. PR 2: HU-027 form/confirmation/success + responsive + tests/docs. Ambos pertenecen al mismo OpenSpec change; el agente no debe realizar operaciones Git sin autorización.
