# Proposal

## Problem Statement

HU-026 y HU-027 ya cuentan con contrato backend para consultar el preview autoritativo de caja y registrar el cierre final, pero el frontend todavía no integra el flujo operativo completo:

CashSession activa
→ preview
→ efectivo declarado
→ diferencia
→ observación cuando corresponda
→ confirmación
→ cierre
→ éxito.

La auditoría disponible confirma en `develop` remoto que el contrato TypeScript generado ya contiene:

- `GET /api/v1/cash/preview`;
- `POST /api/v1/cash/close`;
- `CashPreviewDto`;
- `CloseCashRequest`;
- `CashClosingDto`.

El preview devuelve `401`, `403` y `404`; el cierre devuelve `201`, `400`, `401`, `403`, `404` y `409`. citeturn149708view1turn149708view3

El frontend remoto actual todavía registra `/turnos` y `/mi-turno`, pero no una ruta de cierre de caja. La administración de turnos ya está protegida mediante `SHIFT_MANAGE_ROLES`, formada por `ADMINISTRADOR` y `ENCARGADO`. citeturn391233view0turn391233view2

Existe una limitación de auditoría importante: esta sesión no tiene acceso de shell al working tree LOCAL actual. Por tanto, no se puede confirmar de forma factual el `HEAD`, `git status`, cambios locales posteriores al remoto ni el código backend local que implementa los ProblemDetails concretos de Cash. La futura fase explore/apply MUST revalidar el `develop` local antes de modificar archivos.

### Baseline audit disponible

| Área                             | Resultado                                   |
| -------------------------------- | ------------------------------------------- |
| Rama pública inspeccionada       | `develop`                                   |
| HEAD local real                  | NO VERIFICABLE desde esta sesión            |
| Working tree local               | NO VERIFICABLE desde esta sesión            |
| Contrato Cash generado           | PRESENTE                                    |
| `GET /api/v1/cash/preview`       | PRESENTE                                    |
| `POST /api/v1/cash/close`        | PRESENTE                                    |
| Frontend Cash dedicado           | No identificado en el árbol remoto auditado |
| Ruta de cierre frontend          | No identificada en `AppRoutes.tsx` remoto   |
| Gestión de turno frontend        | PRESENTE                                    |
| Roles de gestión                 | `ADMINISTRADOR`, `ENCARGADO`                |
| TanStack Query                   | PRESENTE                                    |
| Shared authenticated HTTP client | PRESENTE                                    |
| Vitest + Testing Library         | PRESENTE                                    |
| Package manager                  | `pnpm@11.18.0`                              |
| Generated API manual edit        | PROHIBIDO                                   |

Los scripts remotos actuales incluyen `format:check`, `typecheck`, `lint`, `test` y `build`. citeturn391233view3

La estructura de este briefing sigue las convenciones SDD/OpenSpec proporcionadas para trabajo pre-ejecución, manteniendo implementación y VERIFY fuera de esta fase. fileciteturn16file0

## Goals

- Implementar posteriormente UN solo change frontend para HU-026 y HU-027.
- Reutilizar sin modificar el backend Cash ya existente.
- Consumir `CashPreviewDto` como autoridad del resumen de caja.
- Mostrar por separado:
  - apertura;
  - ventas por medio de pago;
  - ventas por canal;
  - gastos;
  - contexto del handover;
  - efectivo esperado.
- Permitir ingresar únicamente `declaredCash` y `observation` para el cierre.
- Mostrar una diferencia provisional para feedback inmediato sin reemplazar el cálculo backend.
- Exigir observación en UI cuando la diferencia provisional sea distinta de cero y conservar la validación backend como autoridad final.
- Incorporar confirmación explícita antes del POST final.
- Impedir doble submit mientras el cierre está pendiente.
- Manejar de forma controlada la carrera de cierre `409`.
- Mostrar estados de:
  - loading;
  - error;
  - sin caja disponible;
  - caja cerrada después de éxito/conflicto;
  - cierre exitoso.
- Restringir route y acciones a `ADMINISTRADOR` y `ENCARGADO`.
- Reutilizar el shell, routing, componentes y query infrastructure existentes.
- Mantener una experiencia usable desde 360 px.
- Mantener HU-028, reportes, PDF, impresión e histórico totalmente fuera del change.
- Dejar HU-026 y HU-027 preparadas para documentación con evidencia REAL después de APPLY.

## Non-Goals

- No modificar backend.
- No crear endpoints.
- No crear migrations.
- No modificar manualmente `api.generated.ts`.
- No regenerar contrato TypeScript si el backend permanece sin cambios.
- No implementar HU-028 ni `/cash/closings` aunque el contrato generado contenga endpoints relacionados.
- No implementar HU-029, HU-030 ni HU-031.
- No implementar historial de cierres.
- No implementar PDF, CSV, XLSX ni export.
- No implementar impresión térmica.
- No implementar firma digital, signature pad, PIN ni biometría.
- No introducir rol `CAJERO`.
- No permitir a `CONTADORA`, `MESERO`, `COCINA` o `EMPLEADO` cerrar caja.
- No crear múltiples cajas.
- No recalcular `expectedCash` como fuente de verdad frontend.
- No sumar nuevamente `cashAmountCarriedForward`.
- No mezclar `PaymentMethod` con `SalesChannel`.
- No crear un nuevo state manager.
- No instalar dependencias.
- No rediseñar AppShell/sidebar/navigation global.
- No ejecutar APPLY, VERIFY o ARCHIVE durante esta etapa.

## Affected Areas

Áreas confirmadas o altamente probables:

- Routing autenticado existente.
- Navegación/entry point de `Turnos / Caja`.
- Feature de turnos para acceso al cierre.
- Nueva slice frontend Cash o equivalente siguiendo el patrón real de `features/`.
- Endpoint registry central.
- Shared HTTP client, únicamente como consumidor; no se espera modificar su arquitectura.
- TanStack Query y query keys de Cash/Shift.
- Shared UI:
  - `Card`;
  - `Button`;
  - `Input`;
  - `Textarea`;
  - `FormField`;
  - `Alert`;
  - `EmptyState`;
  - `Modal`;
  - `Spinner`/Skeleton.
- Auth/role guard existente.
- Tests frontend.
- Documentación de HU-026 y HU-027 al final de APPLY.

El router remoto ya utiliza un único `AuthenticatedLayout` y guards `RequireAuth`/`RequireAnyRole`, y `/turnos` ya está protegido por los roles de gestión. citeturn391233view0

## Assumptions

No assumptions.

La diferencia entre el repositorio remoto inspeccionable y el working tree LOCAL se trata como investigación pendiente, no como supuesto.

## Risks

### Risk 1: Baseline local distinto del remoto inspeccionado

- Probability: Medium.
- Impact: High.
- Mitigation: La primera task MUST registrar branch, HEAD y status locales y reabrir los archivos de routing, Cash contract, Shift y frontend antes de cualquier modificación. Si ya existe una implementación Cash parcial, se MUST extender en lugar de duplicar.

### Risk 2: Interpretar incorrectamente errores `404` de preview

- Probability: Medium.
- Impact: Medium.
- Mitigation: Auditar ProblemDetails y servicio Cash local antes de fijar copy específica. Un `404` MUST producir un estado operacional seguro; no se MUST inventar un error code.

### Risk 3: Confundir medios de pago con canales

- Probability: Medium.
- Impact: High.
- Mitigation: Renderizar `CASH`, `QR`, `EXTERNAL` en una sección y `DIRECT`, `PEDIDOSYA` en otra, usando exactamente los campos del DTO.

### Risk 4: Duplicar el cálculo de efectivo esperado

- Probability: Low.
- Impact: High.
- Mitigation: `expectedCash` MUST venir directamente del preview backend. El único cálculo frontend permitido es la diferencia provisional `declaredCash - expectedCash` para UX.

### Risk 5: Diferencia provisional no coincidente por parsing/formatting

- Probability: Medium.
- Impact: Medium.
- Mitigation: Mantener input monetario normalizado según conventions actuales, tratar el cálculo como provisional y mostrar el valor final exclusivamente desde `CashClosingDto` tras el POST.

### Risk 6: Cierre concurrente deja UI stale

- Probability: Medium.
- Impact: High.
- Mitigation: Para `409`, no reintentar la mutación; invalidar/refetch Cash/Shift, mostrar estado de caja ya cerrada/no disponible y deshabilitar definitivamente el formulario de esa carga.

### Risk 7: Ruta expuesta a roles incorrectos

- Probability: Low.
- Impact: High.
- Mitigation: Proteger el entry point y la route con `SHIFT_MANAGE_ROLES`/capability real, conservando además la autorización backend.

### Risk 8: Los mockups introducen scope no soportado

- Probability: Medium.
- Impact: Medium.
- Mitigation: Omitir explícitamente impresión, historial, firma digital, notificación a administración y cualquier dato no contractual.

## Rollback Strategy

No se esperan cambios persistentes ni backend.

El rollback funcional puede realizarse restaurando la versión frontend previa de:

- route de cierre;
- entry point desde Turnos/Caja;
- feature/query Cash;
- componentes de preview/cierre;
- tests y documentación asociada.

`api.generated.ts` debe permanecer intacto.

Tras rollback se debe verificar:

- `/turnos` conserva su flujo previo;
- opening/handover existentes siguen funcionando;
- no queda un link hacia una route eliminada;
- `pnpm run typecheck`, tests y build mantienen el comportamiento anterior.

La ejecución concreta del rollback/Git corresponde al usuario y no a este agente.

## Success Criteria

- `GET /api/v1/cash/preview` es consumido mediante el shared HTTP client.
- El preview muestra `expectedCash` recibido del servidor sin recalcularlo autoritativamente.
- Payment methods y sales channels aparecen como dimensiones separadas.
- `cashAmountCarriedForward` se presenta como contexto y no se suma nuevamente.
- Solo `ADMINISTRADOR` y `ENCARGADO` alcanzan la route de cierre.
- `declaredCash` puede introducirse y produce diferencia provisional visible.
- Una diferencia distinta de cero exige observación antes de abrir/confirmar el cierre.
- Diferencia cero permite cierre sin observación.
- La confirmación muestra fecha, esperado, declarado, diferencia y responsable.
- Durante POST no puede iniciarse un segundo submit desde la UI.
- Un `409` termina en estado controlado y refetch, sin retry automático.
- Un cierre exitoso muestra valores de `CashClosingDto`.
- Después del éxito se invalidan las queries Cash/Shift pertinentes.
- No existe implementación de historial, print, PDF o reports.
- Desktop, tablet y 360 px son utilizables sin overflow horizontal bloqueante.
- Tests de HU-026/HU-027 pasan mediante Vitest.
- `pnpm run format:check`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test` y `pnpm run build` pasan al finalizar APPLY.
