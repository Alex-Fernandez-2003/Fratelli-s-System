# HU-028 — Historial de cierres de caja

## Resultado

**BACKEND + FRONTEND IMPLEMENTADOS**.

HU-028 ofrece historial paginado y detalle inmutable en `/turnos/cierres`. La consulta usa la extensión D19 autorizada del endpoint existente para filtrar por período en servidor. La capacidad permanece separada de la operación de apertura/cierre de caja.

## Quick path

1. ADMINISTRADOR, ENCARGADO o CONTADORA ingresa a `/turnos/cierres`.
2. El período inicia en el mes de negocio actual y `from`/`to` se envían al backend.
3. Cada fila o card muestra la conciliación esencial; `Ver detalle` obtiene el snapshot persistido on-demand.
4. La evidencia manual responsive/a11y queda pendiente de `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

## Contrato backend

### Historial

- `GET /api/v1/cash/closings?page=&pageSize=&from=&to=` → `PagedResponse<CashClosingDto>`.
- `page` y `pageSize` conservan su validación existente.
- `from` y `to` son opcionales, date-only e independientes.
- Los límites se aplican inclusivamente sobre `CashClosing.BusinessDate`, antes de `ClosedAt DESC` y de `Skip/Take`.
- `from > to` responde con el `ValidationProblem` existente; los límites no se intercambian silenciosamente.
- La llamada page/pageSize-only conserva compatibilidad.

### Detalle y snapshot

- `GET /api/v1/cash/closings/{id}` → `CashClosingDto`.
- History y Detail leen directamente el `CashClosing` persistido.
- No se consultan ventas, gastos, CashSession ni datos vivos para reconstruir historia.
- No se agregaron DTOs, endpoints, entidades, schema changes ni migrations.

### D19 / OPTION A

La extensión mínima `from`/`to` fue autorizada explícitamente para resolver el requisito de período server-side. Responsible filter y summary cards se omiten porque no existen en el contrato real.

## Seguridad y alcance

- `CashHistory`: ADMINISTRADOR, ENCARGADO y CONTADORA.
- `CashManage`: continúa limitado a ADMINISTRADOR y ENCARGADO.
- HU-028 es read-only: no editar, eliminar, reabrir, corregir, aprobar, imprimir, descargar ni exportar.
- CONTADORA llega a la historia sin pasar por `/turnos/cierre`.
- Los usuarios MESERO, COCINA y EMPLEADO son rechazados por el guard de ruta.

## Frontend

- Ruta protegida: `/turnos/cierres`.
- Navegación explícita: `Cierres de caja` dentro del módulo Turnos/Caja.
- Período default: primer día del mes de negocio actual hasta hoy.
- Cambio de período: reset de página a 1; filtros vacíos no se serializan.
- Paginación: server-side, con metadata real de `PagedResponse` y recuperación de página inválida.
- Desktop: tabla compacta con fecha de negocio, actor real disponible, cierre, esperado, declarado, diferencia y detalle.
- Mobile: cards sin comprimir la tabla, conservando la conciliación esencial.
- Diferencias: `Sobrante`, `Faltante` y `Cuadrado`, con signo y texto accesible.
- Detalle: Modal accesible existente, cargado solo al seleccionar un cierre, con foco, Escape y retorno de foco según el primitive compartido.
- Snapshot: aperturas separadas, efectivo retirado, medios de pago, canales, gastos, conciliación, observación real, actor, fecha y hora de cierre.
- `PedidosYa` aparece únicamente en `Canales`; `Pago externo` únicamente en `Medios de pago`.
- La observación nula y valores opcionales legacy se muestran de forma segura, sin inventar datos.
- El success state de HU-027 conserva la confirmación y agrega `Ver historial de cierres` como acción secundaria.

## Validación automatizada

La evidencia factual completa está en `docs/openspec/changes/implement-sprint-3-block-4-cash-closing-history/verify-report.md` y `apply-progress.md`.

- Frontend: `format:check`, `typecheck`, `lint`, `pnpm test` (**42 archivos / 245 tests**) y `build` (**2.167 módulos**) PASS.
- Backend: Release build PASS (**0 errores, 14 warnings no bloqueantes**); regresión por procesos secuenciales **110/110 PASS**.
- Focused HU-028 backend: `CashClosingHistoryPostgresIntegrationTests` **3/3 PASS**.
- EF: `has-pending-model-changes` reportó que no hay cambios pendientes.
- Runtime OpenAPI: HTTP 200; `from` y `to` opcionales `date`; respuesta `PagedResponseOfCashClosingDto`.
- Generated TypeScript: regenerado desde runtime OpenAPI; diff limitado a `from?: string` y `to?: string`.
- `git diff --check`: PASS.
- El test de solución en un único proceso observó 87/91 por agotamiento ambiental de clientes PostgreSQL (`53300`) en Attendance; las clases aisladas afectadas pasaron y la regresión secuencial completa pasó 110/110.

## Manifest de archivos

### Backend y contrato

| Archivo | Propósito |
| --- | --- |
| `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs` | Agrega `from`/`to` al GET de historial y valida rango. |
| `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` | Extiende la firma existente de `CashClosingsAsync`. |
| `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs` | Filtra `BusinessDate` antes de ordenar/paginar; conserva snapshot. |
| `backend/tests/RestaurantSystem.IntegrationTests/CashClosingHistoryPostgresIntegrationTests.cs` | Verifica filtros inclusivos, paginación, validación y separación de autorización. |
| `frontend/src/types/api.generated.ts` | Salida de `api:generate`; solo añade `from`/`to` opcionales al query autorizado. |

### Frontend

| Archivo | Propósito |
| --- | --- |
| `frontend/src/lib/api/endpoints.ts` | Builders existentes para historial y detalle. |
| `frontend/src/features/cash/api.ts` | `cashKeys`, queries, filtros, estados y mensajes de History/Detail. |
| `frontend/src/features/cash/format.ts` | Formateo null-safe, signo y semántica de diferencias. |
| `frontend/src/features/cash/CashClosingHistoryPage.tsx` | Página de período, lista desktop, cards mobile y paginación. |
| `frontend/src/features/cash/CashClosingDetailOverlay.tsx` | Modal on-demand del snapshot inmutable. |
| `frontend/src/features/cash/CashClosingPage.tsx` | Link secundario desde el success state HU-027. |
| `frontend/src/routes/AppRoutes.tsx` | Guard independiente para `/turnos/cierres`. |
| `frontend/src/features/navigation.tsx` | Entrada role-aware `Cierres de caja`. |
| `frontend/src/features/cash/*.test.tsx`, `frontend/src/features/cash/*.test.ts` | Cobertura de API, filtros, estados, detalle, diferencia y regresión HU-027. |
| `frontend/src/features/navigation.test.ts`, `frontend/src/routes/AppRoutes.test.tsx` | Cobertura de navegación, roles y multi-role. |

### OpenSpec y evidencia

| Archivo | Propósito |
| --- | --- |
| `docs/openspec/changes/implement-sprint-3-block-4-cash-closing-history/proposal.md` | Alcance y D19 autorizado. |
| `docs/openspec/changes/implement-sprint-3-block-4-cash-closing-history/spec.md` | Requisitos y escenarios HU-028. |
| `docs/openspec/changes/implement-sprint-3-block-4-cash-closing-history/design.md` | Diseño y límites de implementación. |
| `docs/openspec/changes/implement-sprint-3-block-4-cash-closing-history/tasks.md` | Tareas y estado de ejecución. |
| `docs/openspec/changes/implement-sprint-3-block-4-cash-closing-history/apply-progress.md` | Evidencia acumulada de APPLY. |
| `docs/openspec/changes/implement-sprint-3-block-4-cash-closing-history/verify-report.md` | Evidencia automatizada y placeholders de auditoría final. |

## Estado de entrega

- `HU_028_BACKEND_COMPLETE: YES`
- `HU_028_FRONTEND_COMPLETE: YES`
- `AUTOMATED_VERIFICATION: PASS_WITH_ENVIRONMENT_WARNING`
- `MANUAL_EVIDENCE: DEFERRED_TO_SPRINT_FINAL_AUDIT`
- `ARCHIVE: NOT_REQUESTED`
- `COMMIT/PUSH: NOT_PERFORMED`
