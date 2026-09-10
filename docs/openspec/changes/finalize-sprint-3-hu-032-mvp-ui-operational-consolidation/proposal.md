# Proposal

## Problem Statement

HU-032 es la historia transversal final de Sprint 3 para consolidar el MVP de Restaurant System — Fratelli antes de su cierre.

El sistema ya ha atravesado múltiples bloques de implementación funcional. El maintainer reporta que Sprint 1, Sprint 2 y HU-008 a HU-031 de Sprint 3 fueron trabajadas, que HU-026/HU-027/HU-028 están implementadas y que HU-029/HU-030/HU-031 fueron implementadas o reconciliadas. HU-032 no debe reabrir esos módulos como nuevas features: debe corregir defectos finales, eliminar inconsistencias operativas y consolidar la experiencia visual existente.

El cambio tiene dos objetivos inseparables:

1. Reconciliar visualmente el MVP completo contra las 74 referencias de `Pantallas.zip`.
2. Resolver los cambios funcionales congelados F1–F26 necesarios para cerrar el MVP de manera operativamente consistente.

Los defectos reportados incluyen problemas de datos visibles en Turnos/Caja, filtros temporales que pueden excluir registros válidos, navegación incompleta, inconsistencias en acciones de detalle, falta de unidad/validación correcta en producción y, de máxima severidad, un posible defecto de persistencia o lectura de Attendance donde un CheckIn + CheckOut runtime no aparece correctamente en el historial.

### Baseline no certificado todavía

Esta generación no dispone de acceso al working tree LOCAL REAL ni de shell sobre el repositorio del maintainer.

Por tanto, en esta etapa:

- Branch: `UNVERIFIED_LOCAL`.
- HEAD: `UNVERIFIED_LOCAL`.
- Working tree: `UNVERIFIED_LOCAL`.
- Staged: `UNVERIFIED_LOCAL`.
- Unstaged: `UNVERIFIED_LOCAL`.
- Untracked: `UNVERIFIED_LOCAL`.
- Test counts: `UNVERIFIED_LOCAL`.
- Migration state: `UNVERIFIED_LOCAL`.
- Runtime OpenAPI: `UNVERIFIED_LOCAL`.

El repositorio local MUST ser auditado durante `explore` antes del primer cambio de producto.

### Visual-source limitation de esta generación

`Pantallas.zip` contiene un inventario declarado de 74 referencias y las 74 quedan inventariadas y preclasificadas en `design.md`.

Sin embargo, el ZIP no está expuesto en este entorno como 74 imágenes individuales navegables. Por tanto, esta generación NO afirma una comparación pixel-level 74/74 contra la implementación actual.

La matriz visual usa:

- el inventario exacto de 74 archivos proporcionado;
- las decisiones funcionales congeladas;
- la dirección visual descrita para Fratelli;
- las referencias que han sido visibles individualmente en la conversación;
- los patrones documentados de las pantallas.

Antes del FIRST APPLY, Task 2 MUST extraer/inspeccionar localmente las 74 imágenes y completar cualquier dato visual que aquí figure como `VISUAL_COMPARE_PENDING`.

Esto no introduce una nueva decisión de producto; es trabajo técnico de `explore`.

### Generator Verdict

`HU_032_FINAL_MVP_CONSOLIDATION_OPENSPEC_READY`

Esto significa que el change está suficientemente definido para realizar el `explore` local obligatorio y luego implementar sin reabrir decisiones congeladas.

No significa que APPLY pueda comenzar inmediatamente.

Estado actual:

`READY_FOR_HU_032_FIRST_APPLY: NO`

Motivos:

- working tree local no certificado;
- contracts reales de F1/F3/F8/F12/F14/F18/F24 pendientes de reconciliación;
- visual pixel-level audit del ZIP pendiente de extracción local.

## Goals

- Mantener UN único OpenSpec change para HU-032.
- Auditar el working tree real antes de modificar producto.
- Auditar las 74 referencias visuales sin convertir mockups en nuevas capacidades.
- Consolidar el AppShell, navegación, cards, tablas, forms, overlays, estados y responsive.
- Implementar/reconciliar Inicio por rol para:
  - ADMINISTRADOR;
  - ENCARGADO;
  - MESERO;
  - COCINA;
  - CONTADORA;
  - EMPLEADO.
- Mostrar únicamente métricas y widgets sustentados por información real.
- Corregir F1–F25.
- Ejecutar F26 como reconciliación visual integral del MVP.
- Resolver el bug Attendance F12 end-to-end.
- Mantener `AUTO_ABSENCE_GENERATION = POST_MVP`.
- Garantizar que Cocina muestre únicamente pedidos/comandas del día operacional actual.
- Corregir filtros temporales de Producción, Inventario, Compras y Ventas.
- Mostrar la unidad real al registrar producción.
- Proteger cantidades discretas también en backend/domain cuando la validación actual sea insuficiente.
- Mostrar montos reales y resumen real de Turnos/Caja.
- Eliminar IDs internos de HUs del copy de usuario final.
- Reutilizar la iconografía ya instalada; no introducir otra icon library.
- Mantener multi-role con semántica UNION.
- Mantener `America/La_Paz` como autoridad temporal según helpers reales.
- Mantener el schema sin cambios.
- Regenerar generated TypeScript únicamente si APPLY modifica un contrato backend real.
- Implementar responsive para 360, 768 y 1280+.
- Implementar accesibilidad de código en icon buttons, forms, overlays, navigation y estados.
- Detener el FIRST APPLY en un gate humano obligatorio.
- Preservar cambios manuales posteriores del maintainer.
- Convertir esos cambios manuales en la autoridad visual principal de Phase C.
- Propagar los patrones aprobados a las pantallas restantes.
- Completar finalmente toda evidencia manual Sprint 3 previamente diferida.
- Ejecutar full regression antes de solicitar aceptación final.
- No cerrar Sprint 3 ni MVP automáticamente.

## Non-Goals

- No implementar Sprint 4.
- No implementar historias post-MVP.
- No implementar facturación fiscal.
- No implementar thermal printing.
- No implementar biometría.
- No implementar reconocimiento facial.
- No implementar QR/geolocation attendance.
- No implementar automatic absence scheduler.
- No implementar cron/hosted service de ausencias.
- No implementar payroll.
- No crear una plataforma de nómina.
- No crear propinas.
- No crear gestión de mesas si no existe actualmente.
- No crear precuenta/fiscal workflow.
- No crear loyalty.
- No crear descuentos como nuevo subsistema.
- No crear payment method CARD/TARJETA si no existe.
- No crear channels SALON/DELIVERY/TAKE_AWAY si no existen.
- No crear CAJERO.
- No crear checklist de limpieza.
- No crear temperatura de cámaras.
- No crear solicitudes de insumos no existentes.
- No crear P&L.
- No crear flujo de caja contable.
- No crear validación/aprobación posterior de CashClosing.
- No crear supplier scoring.
- No crear CRM extendido.
- No crear nuevas métricas únicamente para igualar screenshots.
- No crear seis endpoints de dashboard por defecto.
- No crear una nueva arquitectura frontend.
- No crear un segundo AppShell.
- No crear shells separados por rol.
- No introducir otro CSS framework.
- No introducir otra icon library.
- No reescribir Tailwind de forma global sin evidencia.
- No hacer un design-system rewrite.
- No cambiar backend fuera de los mínimos expresamente autorizados.
- No crear migration por defecto.
- No cambiar schema por defecto.
- No editar manualmente generated TypeScript.
- No marcar HU-032 como DONE después del FIRST APPLY.
- No archivar automáticamente.
- No cerrar Sprint 3 automáticamente.
- No cerrar MVP automáticamente.

## Affected Areas

### Frontend

- AppShell/layout.
- navegación desktop/mobile.
- Inicio/dashboard.
- role/capability helpers.
- icon actions.
- shared UI primitives.
- responsive breakpoints/layout composition.
- catálogo/productos.
- inventario.
- gastos.
- mi asistencia.
- asistencia administrativa.
- asistencia operacional/today.
- composición.
- producción.
- cocina.
- cobro.
- proveedores.
- compras/recepción.
- clientes.
- historial de ventas.
- turnos/caja.
- cierre.
- historial de cierres.
- reportes.
- shared filters.
- date/time helpers.
- money formatting.
- query state.
- tests.

### Backend, conditional/minimal

- Kitchen read query/filter.
- Production quantity validation.
- Attendance runtime write/read path.
- Shift/Cash summary projection.
- Cash-card projection if current contract is insufficient.
- Supplier detail read contract only if existing contract cannot support F18.
- Expense detail read contract only if existing data cannot support F24.

### Generated API, conditional

Only if an actual backend HTTP contract changes.

### Database

No schema change expected.

### Documentation

- HU-032.
- HU-026/HU-027 stale frontend status.
- Sprint 3 HUs with deferred evidence or stale implementation status.
- final evidence manifests.

## Frozen Decisions

| Area                          | Decision                                                 |
| ----------------------------- | -------------------------------------------------------- |
| Visual references             | All 74 references are in scope for audit                 |
| Functional priority           | Frozen HU-032 requirements override mockups              |
| Visual priority after Phase B | Maintainer manual changes override original mockups      |
| Dashboards                    | Role-aware Inicio required                               |
| Kitchen                       | Today-only operational orders                            |
| Production history            | Full current-month default                               |
| Production action             | Eye icon for detail                                      |
| Production selector           | Search input above filtered list                         |
| Production unit               | Real unit visible                                        |
| Discrete production           | Fractional quantity rejected                             |
| Inventory default             | Producto de venta/equivalent                             |
| Inventory movements           | Today by default                                         |
| Attendance navigation         | Visible access to `/asistencia/hoy` for authorized roles |
| Attendance runtime            | CheckIn + CheckOut MUST persist and appear in history    |
| Automatic absence             | Post-MVP                                                 |
| Shift/Cash summary            | Real values only                                         |
| HU IDs                        | No HU-015/HU-026/HU-027 user-facing operational copy     |
| Closing search                | Local text filter over actually loaded records           |
| Supplier actions              | Icon actions + real read-only detail                     |
| Purchases                     | Current-month default + eye detail                       |
| Sales history                 | Eye detail + include all current-day sales               |
| Expenses                      | Eye detail + real read-only detail                       |
| Sales Report                  | No HU-015 copy                                           |
| Responsive                    | 360 / 768 / 1280+                                        |
| First apply                   | HARD STOP for maintainer review                          |
| Maintainer edits              | Become final visual source of truth                      |
| Final evidence                | Required before final acceptance                         |
| Sprint/MVP closure            | Explicit maintainer approval required                    |

## Assumptions

1. The maintainer-reported Sprint 3 state is directionally correct but MUST be revalidated locally.
2. `Pantallas.zip` contains the 74 references listed in the request.
3. Existing UI primitives should be extended rather than replaced.
4. A current icon library exists and should be reused.
5. Current role handling supports multiple roles and union semantics.
6. Existing temporal helpers or a centralized business-time mechanism can be reused or minimally corrected.
7. No schema change should be needed for F1–F26.
8. F12 is initially treated as a write/read/filter bug rather than missing schema.
9. Dashboard data will primarily reuse existing endpoints/queries.
10. Local text search F16 is intentionally scoped to the records actually loaded by the current history query; it MUST NOT pretend to search unloaded pages.
11. Story-point value `13 SP` remains conceptual until repository convention is confirmed.
12. Manual review/evidence is performed after implementation, not during this generation.

## Risks

### Risk 1: Attendance runtime records are persisted but excluded by history filters

- Probability: High enough to investigate first.
- Impact: BLOCKER for MVP closure.
- Mitigation: Add mandatory integration test across authenticated CheckIn → CheckOut → history; inspect BusinessDate, Employee, Assignment, timestamps and read predicates before editing UI.

### Risk 2: Attendance write path does not persist the expected record/state

- Probability: Medium.
- Impact: BLOCKER.
- Mitigation: Trace endpoint → application → transaction → persistence → history query and assert persisted row before any visual fix.

### Risk 3: Attendance fix actually requires schema change

- Probability: Low/Unknown.
- Impact: High.
- Mitigation: Stop APPLY for that path and surface `HU_032_SCHEMA_PRODUCT_DECISION_REQUIRED`; do not silently create migration.

### Risk 4: Today/current-month filters use browser UTC incorrectly

- Probability: High because several reported defects are temporal.
- Impact: High.
- Mitigation: Centralize on existing America/La_Paz/business-time helpers and use half-open ranges for timestamp contracts.

### Risk 5: Kitchen frontend hides old records while backend still returns full history

- Probability: Medium.
- Impact: High/performance correctness.
- Mitigation: Prefer server query restriction; frontend-only hiding is not accepted as authority when backend can filter.

### Risk 6: Product-unit discreteness is inferred from display text

- Probability: Medium.
- Impact: High.
- Mitigation: Audit real Unit/domain representation; backend validation MUST use actual semantic metadata/convention rather than arbitrary translated labels.

### Risk 7: A new unit business decision is actually required

- Probability: Unknown.
- Impact: High.
- Mitigation: If current model cannot distinguish discrete/divisible semantics safely, stop that task and return exact product decision options.

### Risk 8: Role dashboards create unsupported metrics

- Probability: High if mockups are copied literally.
- Impact: High.
- Mitigation: Every widget needs a real data source or safe derivation; unsupported mockup widgets are omitted or converted to navigation cards.

### Risk 9: Dashboard fan-out causes request storms

- Probability: Medium.
- Impact: Medium.
- Mitigation: Role-specific query composition, existing query caching/deduplication, no speculative polling, no six new dashboard endpoints by default.

### Risk 10: Multi-role users see the wrong dashboard/actions

- Probability: Medium.
- Impact: High/auth.
- Mitigation: Derive widgets from unioned capabilities and explicitly test multi-role combinations.

### Risk 11: Icon conversion hides action meaning

- Probability: Medium.
- Impact: Medium/A11Y.
- Mitigation: Shared icon mapping, accessible names, tooltips, focus-visible and consistent destructive semantics.

### Risk 12: Visual reconciliation becomes a full design-system rewrite

- Probability: Medium.
- Impact: High/review size.
- Mitigation: Extend existing tokens/primitives; only extract shared patterns demonstrated by several screens.

### Risk 13: 74-reference work becomes pixel-perfect scope creep

- Probability: High.
- Impact: High.
- Mitigation: Define success as high functional/visual fidelity, not screenshot cloning.

### Risk 14: Mockup-only domain concepts leak into product

- Probability: High without explicit guardrails.
- Impact: High.
- Mitigation: Maintain explicit OMIT lists for CARD, tips, tables, payroll, P&L, cleaning, camera temperature, unsupported statuses and channels.

### Risk 15: Shift/Cash cards expose provisional or wrong monetary values

- Probability: Medium.
- Impact: High.
- Mitigation: Trace actual DTO → generated type → query → formatter → component; backend remains authority.

### Risk 16: Shift summary requires undefined business metrics

- Probability: Unknown.
- Impact: High.
- Mitigation: Prefer existing Shift/CashSession/preview fields. If a requested card cannot be defined from an approved concept, omit/reframe it rather than invent a metric.

### Risk 17: Supplier/Expense detail triggers unnecessary endpoints

- Probability: Medium.
- Impact: Medium.
- Mitigation: Reuse row/detail DTOs first; only introduce minimal read endpoint when actual fields are unavailable.

### Risk 18: Closing search is represented as global while only one server page is loaded

- Probability: High.
- Impact: Medium/UX correctness.
- Mitigation: Copy and behavior MUST clearly represent local loaded-results filtering.

### Risk 19: Sales current-day fix becomes an off-by-one workaround

- Probability: Medium.
- Impact: High.
- Mitigation: Audit DateOnly vs timestamp semantics and correct the proper layer rather than blindly sending tomorrow.

### Risk 20: Maintainer changes are overwritten in Phase C

- Probability: Medium.
- Impact: Critical for workflow trust.
- Mitigation: Hard checkpoint; inspect diff first; maintainer changes become visual authority; no restore/revert unless explicitly directed.

### Risk 21: Deferred visual evidence is treated as already passed

- Probability: Medium.
- Impact: High/documentation integrity.
- Mitigation: Evidence remains unchecked until Phase D and must contain factual screenshots/results.

### Risk 22: Huge transversal diff becomes unreviewable

- Probability: High.
- Impact: High.
- Mitigation: Reviewable tasks by domain, functional fixes before broad styling, first-apply gate, propagation as a separate phase within the same OpenSpec.

## Rollback Strategy

Rollback is feature-wise and MUST preserve unrelated working-tree changes.

### Frontend rollback

Each domain block can be reverted independently:

- role dashboard composition;
- navigation additions;
- date-default changes;
- icon action conversions;
- detail overlays;
- local closing search;
- visual classes/tokens;
- responsive layout changes.

Shared primitives MUST only be rolled back if no other accepted screen depends on the new behavior.

### Backend rollback

Minimal backend changes, if any, should remain isolated by concern:

- Kitchen date restriction.
- Production validation.
- Attendance bug fix.
- Shift/Cash projection.
- optional detail read contract.

If an API contract is reverted, generated TypeScript MUST be regenerated to match that backend state.

### Database rollback

No database rollback expected.

No migration is planned.

If explore proves schema change unavoidable:

HU-032 MUST pause for product decision before such a change is introduced.

### Maintainer edits

Intentional Phase-B maintainer edits MUST NOT be automatically rolled back.

## Success Criteria

- All 74 references are locally extracted, viewed and classified before visual implementation completion.
- Every applicable reference maps to a real screen or receives an explicit OMIT reason.
- No mockup-only domain capability is introduced.
- Cash/Shift cards render real contract-backed values.
- Role-specific dashboards use real capabilities/data only.
- Cocina returns/displays only current-business-day operational orders.
- Production history default covers the complete current month.
- Production detail uses a shared accessible Eye action.
- Production register search and candidate list are stacked.
- Production selected unit is visible.
- Discrete product quantities reject fractional values in the authoritative validation layer.
- Inventory defaults to the real equivalent of Producto de venta.
- Inventory movements default to the current business day.
- ADMINISTRADOR/ENCARGADO can visibly reach the existing attendance-today experience when authorized.
- Runtime CheckIn + CheckOut persists and appears through the appropriate history query.
- Automatic absence generation remains explicitly post-MVP.
- Shift summary contains useful real data or approved real-data alternatives.
- No stale HU-026/HU-027 operational copy is visible.
- Closing history provides honest local text search over loaded data.
- Supplier actions use consistent accessible icons and a real read-only detail experience.
- Purchases default to the current month.
- Purchases detail action uses Eye.
- Sales history uses Eye.
- Sales history includes all valid current-day Sales.
- Expense history provides read-only detail via Eye.
- Sales Report does not expose HU-015 as user-facing terminology.
- Applicable pages work at 360, 768 and 1280+.
- Icon-only controls are accessible.
- Authorization and multi-role union behavior remain correct.
- FIRST APPLY stops at maintainer review.
- Intentional maintainer changes are preserved.
- Phase C propagates approved patterns without undoing manual edits.
- Deferred Sprint 3 evidence is completed factually.
- Full backend/frontend regression passes using real current commands.
- EF reports no unplanned schema/model drift.
- Generated API is synchronized when and only when backend contracts change.
- HU-032 is not marked complete until explicit maintainer approval.
- Sprint 3/MVP are not automatically closed by this change generation.
