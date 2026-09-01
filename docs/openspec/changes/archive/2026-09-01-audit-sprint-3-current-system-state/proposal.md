# Proposal

## Problem Statement

Después de varios avances recientes de Sprint 3, Restaurant System — Fratelli necesita reconstruir una baseline técnica confiable antes de continuar desarrollando nuevas Historias de Usuario.

Los cambios que requieren mayor profundidad de auditoría son:

- HU-014 — Clientes.
- Integración HU-014 → ConfirmSale.
- HU-015 — Historial/detalle de ventas y comprobante PDF client-side.
- Bugfix de `Iniciar jornada` para enviar montos iniciales.
- HU-026 — Preview de cierre de caja.
- HU-027 — Cierre final de caja.
- Migration reciente de datos demostrativos.

Además, existen HUs cuyo backend puede estar disponible pero cuyo frontend permanece intencionalmente pendiente:

- HU-008.
- HU-019.
- HU-021.
- HU-023.
- HU-024.
- HU-028.
- HU-029.
- HU-030.
- HU-031.

La ausencia de frontend para estas HUs MUST NOT clasificarse automáticamente como defecto. La auditoría debe distinguir trabajo pendiente por alcance de una implementación rota.

Este change tiene como único propósito inspeccionar el estado REAL del working tree, reconstruir qué existe actualmente, ejecutar validaciones read-only, identificar gaps y producir un diagnóstico trazable.

No es un change de corrección.

## Goals

- Auditar el working tree local real sin modificar Git.
- Registrar branch, HEAD, staged, unstaged y untracked.
- Reconstruir el estado real de Sprint 3 por HU.
- Clasificar cada HU/capability usando únicamente:
  - `COMPLETE`
  - `BACKEND_COMPLETE_FRONTEND_PENDING`
  - `PARTIAL`
  - `BROKEN`
  - `OUT_OF_SCOPE`
  - `UNKNOWN_REQUIRES_RUNTIME_VALIDATION`
- Auditar profundamente HU-014, HU-015, HU-026 y HU-027.
- Auditar profundamente el bugfix de `Iniciar jornada`.
- Auditar la migration reciente de datos demostrativos.
- Identificar el estado real de los changes OpenSpec activos y archivados.
- Detectar si el change descartado `implement-sprint-3-remaining-frontend-and-demo-data` quedó activo, superseded, abandonado o parcialmente utilizado incorrectamente.
- Auditar routing, navigation, auth, roles y comportamiento multi-role.
- Auditar TanStack Query, query keys, invalidation, retry y mutation states de los últimos cambios.
- Auditar sincronización entre backend, OpenAPI, generated TypeScript y frontend consumers.
- Detectar duplicaciones accidentales de infraestructura frontend.
- Auditar los flujos operativos principales del sistema.
- Ejecutar quality gates frontend y backend existentes sin corregir fallos.
- Auditar responsive y accesibilidad de las funcionalidades recientes cuando el entorno permita evidencia real.
- Auditar documentación y detectar drift sin corregirla.
- Clasificar todos los findings por severidad y categoría.
- Producir `system-current-state-audit.md` o nombre equivalente dentro de este change.
- Terminar el audit con exactamente uno de estos verdicts:
  - `SPRINT_3_BASELINE_HEALTHY`
  - `SPRINT_3_BASELINE_HEALTHY_WITH_FINDINGS`
  - `SPRINT_3_BASELINE_HAS_BLOCKERS`
- Ordenar las acciones posteriores sin ejecutar ninguna.

## Non-Goals

- No implementar HUs pendientes.
- No completar Sprint 3.
- No declarar Sprint 3 cerrado.
- No hacer release audit.
- No declarar `RELEASE_READY`.
- No corregir bugs encontrados.
- No modificar product source del frontend.
- No modificar product source del backend.
- No cambiar endpoints.
- No cambiar DTOs.
- No regenerar OpenAPI/generated TypeScript.
- No corregir el posible drift de `OpenOperationalDayRequest`.
- No cambiar migrations.
- No reemplazar demo data.
- No hacer refactors.
- No añadir tests.
- No actualizar tests existentes.
- No reescribir documentación existente.
- No hacer dependency upgrades.
- No optimizar el bundle PDF.
- No modificar routing/navigation/auth aunque exista un defecto.
- No limpiar working tree.
- No hacer commits.
- No hacer push.
- No hacer checkout/switch/reset/restore/clean/stash/merge/rebase/revert.
- No interpretar una HU intencionalmente pendiente como bug.
- No aplicar el change grande descartado de frontend restante.
- No introducir nuevas pantallas.
- No realizar smoke tests destructivos sobre datos compartidos.

## Affected Areas

La auditoría cubrirá, de forma read-only:

- Git baseline.
- `docs/openspec/changes/`.
- `docs/openspec/changes/archive/`.
- Product backlog y definición actual de Sprint 3.
- HU documentation.
- Frontend package/configuration.
- App entry.
- AppShell.
- React Router.
- Navigation registry.
- AuthProvider.
- RequireAuth.
- RequireAnyRole.
- Multi-role helpers.
- HTTP client.
- ProblemDetails/error parsing.
- TanStack Query client.
- Query factories/keys.
- Mutation helpers.
- Shared UI primitives.
- Formatters.
- Toast/feedback infrastructure.
- Feature directories.
- Existing frontend tests.
- HU-014 Customers.
- ConfirmSale.
- HU-015 Sales History/Detail/PDF.
- Shift/Open Operational Day.
- HU-026 Cash Preview.
- HU-027 Cash Close.
- Catalog.
- Inventory.
- Production.
- Purchases.
- Orders/Kitchen.
- Sales.
- Expenses.
- Attendance.
- Backend solution/DI/endpoints/policies/services.
- OpenAPI/generated contract.
- EF Core migrations.
- Demo data migration.
- Database state when a safe read-only connection is available.
- Existing frontend/backend quality gates.
- Responsive behavior.
- Accessibility basics.
- Documentation consistency.

## Assumptions

- La rama esperada es `develop`, pero el audit MUST confirmarla localmente.
- El path recomendado del change es `docs/openspec/changes/audit-sprint-3-current-system-state/`, sujeto a confirmación de la convención local.
- HU-014, HU-015, HU-026 y HU-027 se consideran avances recientes declarados, no HUs `COMPLETE` hasta que la auditoría produzca evidencia.
- El bugfix de `Iniciar jornada` se considera implementado según contexto aportado, pero su integración y contrato deben revalidarse.
- Las HUs indicadas como frontend pendiente están pendientes por decisión de alcance según el contexto aportado; la auditoría debe confirmar que el repositorio real continúa en ese estado.
- La asociación exacta del bugfix `Iniciar jornada` con HU-025 debe derivarse de la documentación local y no asumirse.
- El conjunto completo de HUs que pertenecen formalmente a Sprint 3 debe reconstruirse desde las fuentes locales canónicas.
- Los builds/tests pueden producir artefactos temporales ignorados por Git, pero product source MUST permanecer read-only.
- Las verificaciones manuales en navegador pueden quedar `PENDING_EXTERNAL` si el entorno no permite ejecutarlas.

## Risks

### Risk 1: Confundir estado declarado con estado real

- Probability: High.
- Impact: High.
- Mitigation: Ninguna HU reciente se clasifica `COMPLETE` únicamente por reportes previos; se requiere evidencia desde working tree, tests, build y/o runtime.

### Risk 2: Tratar frontend pendiente como regresión

- Probability: Medium.
- Impact: High.
- Mitigation: Mantener explícita la clasificación `BACKEND_COMPLETE_FRONTEND_PENDING` y contrastarla contra el scope aprobado de Sprint 3.

### Risk 3: Working tree con trabajo no committeado

- Probability: Medium/High.
- Impact: High.
- Mitigation: Capturar baseline completa antes de cualquier otro audit y usar el working tree, no GitHub remoto, como autoridad.

### Risk 4: OpenSpec state inconsistente

- Probability: Medium.
- Impact: Medium/High.
- Mitigation: Reconstruir active/archive/superseded/abandoned state y comparar cada change contra el código que aparentemente produjo.

### Risk 5: Tests o build fallan y la auditoría se convierte accidentalmente en fix session

- Probability: Medium.
- Impact: High.
- Mitigation: Registrar fallo, comandos, output relevante y continuar audit sin modificar product code.

### Risk 6: Contract drift oculto por validación frontend

- Probability: Medium.
- Impact: High.
- Mitigation: Comparar request DTO backend, OpenAPI, generated TypeScript y call site. Tratar el drift de nullability como hallazgo aun si la UI evita actualmente el payload inválido.

### Risk 7: Runtime no disponible

- Probability: Medium.
- Impact: Medium.
- Mitigation: Separar evidencia estática de evidencia runtime y usar `UNKNOWN_REQUIRES_RUNTIME_VALIDATION`/`PENDING_EXTERNAL` sin inventar PASS.

### Risk 8: Smoke tests modifican estado compartido

- Probability: Low/Medium.
- Impact: High.
- Mitigation: Mutations solo en entorno explícitamente seguro; preferir inspección estática y queries read-only.

### Risk 9: Demo migration compila pero contiene datos incoherentes

- Probability: Medium.
- Impact: High.
- Mitigation: Auditar semántica relacional, constraints, fechas, cash/session uniqueness, estados y Down; no limitar revisión a compilation.

### Risk 10: Bundle PDF produce warning sin ser defecto funcional

- Probability: Medium.
- Impact: Low/Medium.
- Mitigation: Separar warning/performance debt de blocker salvo evidencia funcional.

### Risk 11: Scope de auditoría general demasiado amplio

- Probability: Medium.
- Impact: Medium.
- Mitigation: Priorizar primero cambios recientes y core flows; el resto del repositorio recibe revisión transversal orientada a integración, no una revisión exhaustiva línea por línea.

## Rollback Strategy

Este change no modifica comportamiento de producto.

El rollback consiste en retirar únicamente artifacts creados por esta auditoría si se considera que el diagnóstico debe descartarse o repetirse.

No debe existir rollback de:

- frontend source;
- backend source;
- schema;
- migrations;
- generated API;
- dependencies;

porque esos elementos no deben modificarse.

Si se utiliza una base de datos aislada para smoke validation con mutations, debe ser disposable y descartarse completamente al finalizar.

No se debe alterar ni limpiar una base compartida como parte del rollback.

## Success Criteria

- El audit registra branch, HEAD y estado completo del working tree.
- Todos los OpenSpec changes relevantes quedan inventariados y clasificados documentalmente.
- El universo real de HUs Sprint 3 queda reconstruido desde fuentes locales.
- Cada HU Sprint 3 recibe exactamente una clasificación permitida.
- HU-014 recibe revisión profunda de route, permissions, CRUD/status, server pagination, responsive e integración ConfirmSale.
- HU-015 recibe revisión profunda de history, scopes, snapshots, detail, enums y PDF.
- `Iniciar jornada` recibe revisión profunda de modal, validation, payload, mutation states e invalidation.
- HU-026 recibe revisión de CashPreview y backend authority.
- HU-027 recibe revisión de payload, observation, confirmation, conflict y success authority.
- La migration demo recibe revisión determinística, relacional y de interferencia con current operation.
- Backend/OpenAPI/generated/frontend contract alignment queda clasificado.
- Se identifica si generated API está `SYNCED` o `DRIFT DETECTED`.
- Routing/navigation/auth/multi-role quedan auditados.
- Se ejecutan los quality gates disponibles sin arreglar fallos.
- Cualquier evidencia manual no ejecutable queda marcada `PENDING_EXTERNAL`.
- Todos los findings incluyen:
  - ID;
  - severity;
  - category;
  - affected area;
  - evidence;
  - impact;
  - recommended disposition.
- `BLOCKER` solo se utiliza bajo los criterios definidos para esta auditoría.
- Las HUs intencionalmente pendientes no se reportan como blocker por su ausencia de frontend.
- `system-current-state-audit.md` contiene la estructura requerida.
- Las recomendaciones posteriores están priorizadas pero no implementadas.
- Product code changes planned: `NONE`.
- Fixes planned: `NONE`.
- El audit puede completarse sin decisiones de producto adicionales salvo que aparezca una contradicción genuinamente nueva.
