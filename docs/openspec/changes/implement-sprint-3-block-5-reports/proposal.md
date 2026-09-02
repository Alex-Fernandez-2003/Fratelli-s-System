# Proposal

## Problem Statement

Sprint 3 necesita completar su último bloque funcional frontend mediante tres capacidades analíticas read-only:

- HU-029 — Reporte de ventas.
- HU-030 — Reporte de inventario y stock bajo.
- HU-031 — Reporte de asistencia.

Las tres HUs ya tienen read models backend de Sprint 3 y comparten navegación de Reportes, autorización, filtros, estados de query, presentación responsive y una infraestructura común de exportación CSV/XLSX/PDF. No obstante, cada reporte debe conservar su propio contrato, mapper y composición visual; este change MUST NOT convertirse en un framework genérico de BI.

La baseline local fue revalidada en el working tree:

- Branch local: `develop`.
- HEAD local: `8cf270508e46b7a9abc3d51b758a6497100750d`.
- Al inicio de esta continuación no había cambios staged.
- Cambios preexistentes al inicio: `frontend/package.json` y `frontend/pnpm-lock.yaml` con sus version bumps, además de `.vscode/`, `frontend/pnpm-workspace.yaml`, `informe-final-fratelli.pdf` e `informe-final-fratelli.tex`.
- Durante el APPLY se añadió únicamente `xlsx@^0.18.5` y su resolución al package/lockfile; no se reemplazaron los hunks de dependencias preexistentes. El directorio OpenSpec activo ya existía como untracked y fue actualizado como parte de este change.

La rama pública `develop` se conserva únicamente como evidencia secundaria histórica; el contrato vigente para este alcance es el código local revalidado.

La evidencia secundaria inicial mostraba contratos backend/generados para los tres reportes y gaps CORE respecto de las decisiones congeladas:

1. En la baseline secundaria, HU-029 exponía `from/to`, pero no filtros `Shift` ni `Channel`.
2. En la baseline secundaria, HU-029 filtraba ventas por timestamp de confirmación mientras su serie se agrupaba por `BusinessDate`, por lo que el universo del período podía no coincidir con la semántica BusinessDate congelada.
3. En la baseline secundaria, HU-031 exponía `from/to/employeeId`, pero no filtro `Shift`.
4. En la baseline secundaria, HU-031 devolvía estadísticas por Employee, pero la implementación pública observada entregaba `lateCount` y `absenceCount` como valores no derivados de las reglas completas de HU-024.
5. En la baseline secundaria, HU-031 no exponía un aggregate summary global separado, por lo que las cards D32 no podían construirse en frontend sin violar D3.
6. HU-030 usaba una policy de lectura de inventario más amplia que la matriz de Reportes congelada, lo que requería revalidación explícita de autorización en local.

Los endpoints y DTOs públicos observados son consistentes con esos gaps en el generated client. citeturn254236view0turn208594view0turn282602view0

La implementación backend pública inicial también documentaba esos gaps de filtros y el tratamiento histórico de los reportes. citeturn392052view0turn392052view1turn392052view2

La auditoría secundaria anterior quedó superada por la revalidación del working tree local y por la autorización explícita para realizar la reconciliación backend acotada. El estado actual es:

`SPRINT_3_BLOCK_5_PRODUCT_DECISION_REQUIRED: RESOLVED_FOR_AUTHORIZED_BACKEND_RECONCILIATION`

`READY_FOR_AUTHORIZED_BACKEND_RECONCILIATION: YES`

`READY_FOR_SPRINT_3_BLOCK_5_FRONTEND_APPLY: YES`

`FRONTEND_APPLY_STATUS: COMPLETE_LOCAL_VERIFIED`

La reconciliación backend autorizada y el APPLY frontend están completos en el working tree local. El cliente generado se consume mediante el pipeline runtime OpenAPI → `api:generate`; no se editó manualmente. La evidencia visual/manual permanece `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

## Authorized Backend Reconciliation

La reconciliación backend autorizada para HU-029 y HU-031, más cobertura PostgreSQL focalizada, forma parte de este change; el APPLY frontend posterior también está registrado en `apply-progress.md`:

- HU-029 acepta `from`, `to`, `shiftType` y `salesChannel`; el período y la serie usan el mismo `CashSession.BusinessDate` unido al sale/shift.
- HU-031 acepta `from`, `to`, `employeeId` y `shiftType`; deriva lateness/absence con `AttendanceDerivationService`, calcula trabajo/pago con `PayrollProjectionCalculator` y expone `AttendanceReportDto.Summary` desde el dataset filtrado completo.
- HU-030 no se modifica por decisión de producto. Se conserva `InventoryRead` con `Administrator`, `Manager`, `Waiter`, `Kitchen` y `Accountant`, mientras la matriz frontend de Reportes no ofrece UI de reportes a `MESERO/Waiter`; el drift queda documentado, no tratado como seguridad frontend.
- `frontend/src/types/api.generated.ts` se regeneró mediante `pnpm run api:generate` contra el OpenAPI runtime; no se editó manualmente y la UI consume sus contratos.
- El APPLY frontend implementa rutas, navegación role-aware, queries tipadas, estados responsive y exports normalizados en `frontend/src/features/reports/**`, además de los adapters/guards permitidos. HU-028/cash, schema, entidades y migrations permanecen sin cambios, y no se ejecutan operaciones de entrega Git.

## Goals

- Definir `/reportes/ventas`.
- Definir `/reportes/inventario`.
- Definir `/reportes/asistencia`.
- Usar `/reportes` únicamente como redirect técnico al primer reporte autorizado.
- Crear navegación secundaria role-aware entre reportes.
- Mantener todas las HUs read-only.
- Mantener backend report data como autoridad de aggregates, series, stock status, worked time y projected pay.
- Reconciliar los contratos backend autorizados de HU-029/HU-031 y cubrirlos con integración PostgreSQL focalizada.
- Implementar HU-029 con cards, tendencia BusinessDate, distribución por canal y link a HU-015.
- Implementar HU-030 como snapshot actual point-in-time, sin período histórico.
- Implementar HU-031 como analytics agregados por Employee, sin duplicar HU-023/HU-024.
- Implementar un único pipeline conceptual de export data por reporte.
- Exportar CSV, XLSX y PDF desde los mismos datos normalizados.
- Exportar siempre el full filtered report.
- Permitir all-page retrieval únicamente durante una acción explícita de export cuando el contrato real sea paginado.
- Reutilizar la infraestructura PDF existente si sigue presente localmente.
- Añadir una única dependencia XLSX mínima solo si el audit local confirma que no existe soporte.
- Evitar una dependencia de charts si gráficos simples y accesibles pueden resolverse con primitives web existentes.
- Implementar responsive/a11y a nivel de código.
- Diferir evidencia manual a `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
- Mantener migrations/schema/entities sin cambios.

## Non-Goals

- No duplicar HU-015.
- No duplicar HU-023.
- No duplicar HU-024.
- No crear dashboard visual propio en `/reportes`.
- No implementar `Mis ventas` para MESERO.
- No implementar `Mi asistencia` dentro de HU-031.
- No mostrar AttendanceRecord-by-AttendanceRecord como tabla principal de HU-031.
- No añadir período histórico a HU-030.
- No mutar inventario desde reportes.
- No editar HourlyRate.
- No calcular ProjectedPay como autoridad frontend.
- No recalcular attendance lateness/absence.
- No crear server-side PDF/CSV/XLSX.
- No crear backend export endpoint.
- No exportar current page only.
- No raspar el DOM para export.
- No convertir CSV generado en fuente para XLSX/PDF.
- No introducir un framework universal de reporting.
- No crear migration.
- No modificar schema.
- No modificar generated TypeScript manualmente.
- No añadir dependencias fuera del alcance: el APPLY añadió únicamente `xlsx@^0.18.5` para el requisito XLSX.
- No ejecutar archive, commit o push.
- No convertir evidencia manual diferida en blocker del APPLY; permanece `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

## Affected Areas

Áreas frontend probables:

- Routing de Reportes.
- Navigation/capability helpers.
- Query/API adapters de reportes.
- HU-029 page/components.
- HU-030 page/components.
- HU-031 page/components.
- Shared report navigation.
- Shared export utilities.
- Report-specific normalized export mappers.
- CSV serialization.
- XLSX adapter.
- PDF adapter.
- File download/filename utilities.
- Sales/history navigation integration.
- Attendance/history navigation integration.
- Inventory presentation helpers.
- Date/money/duration formatting.
- Mobile filter overlay.
- Tests frontend.
- HU-029/HU-030/HU-031 docs.
- OpenSpec verification/evidence artifacts.

Áreas backend:

- `backend/src/RestaurantSystem.Api/OperationsEndpoints.cs` — parámetros y validación de reportes.
- `backend/src/RestaurantSystem.Application/Operations/OperationalContracts.cs` — contratos de filtros y summary.
- `backend/src/RestaurantSystem.Infrastructure/Operations/OperationsService.cs` — universo filtrado, derivaciones y agregates.
- `backend/tests/RestaurantSystem.IntegrationTests/OperationsReportsPostgresIntegrationTests.cs` — cobertura PostgreSQL focalizada.

Generated TypeScript:

- `frontend/src/types/api.generated.ts` — regenerado desde el OpenAPI runtime después de la reconciliación; la UI frontend sigue fuera de alcance.

## Frozen Decisions

| ID  | Decisión                                                          | Estado          |
| --- | ----------------------------------------------------------------- | --------------- |
| D1  | Tres rutas explícitas de reporte                                  | FROZEN          |
| D2  | `/reportes` sin dashboard; redirect al primer reporte autorizado  | FROZEN          |
| D3  | Backend report data es autoridad de aggregates/series/pay/status  | FROZEN          |
| D4  | CSV + XLSX + PDF en los tres reportes                             | FROZEN          |
| D5  | Charts requeridos solo para HU-029                                | FROZEN          |
| D6  | Evidencia manual diferida a Sprint Final Audit                    | FROZEN          |
| D7  | HU-029 UI para ADMIN/ENC/CONTADORA; MESERO permanece en HU-015    | FROZEN          |
| D8  | HU-029 filtros Period/Shift/Channel; current month                | SUPPORTED_LOCAL |
| D9  | HU-029 cards Total/CASH/QR/EXTERNAL                               | FROZEN          |
| D10 | PaymentMethod != SalesChannel                                     | FROZEN          |
| D11 | HU-029 trend por BusinessDate                                     | FROZEN          |
| D12 | HU-029 distribución DIRECT/PEDIDOSYA                              | FROZEN          |
| D13 | HU-029 no duplica HU-015 y enlaza al historial real               | FROZEN          |
| D14 | Export siempre full filtered report                               | FROZEN          |
| D15 | HU-030 ADMIN/ENC/COCINA/CONTADORA                                 | FROZEN          |
| D16 | Una sola route de inventario; scope COCINA backend-authoritative  | FROZEN          |
| D17 | HU-030 cards low/negative/total                                   | FROZEN          |
| D18 | HU-030 states NEGATIVE/LOW/NORMAL con prioridad congelada         | FROZEN          |
| D19 | Search/type/category/status únicamente si contract lo soporta     | FROZEN          |
| D20 | HU-030 table/cards de snapshot real                               | FROZEN          |
| D21 | HU-030 read-only                                                  | FROZEN          |
| D22 | Sin fake sync timestamp                                           | FROZEN          |
| D23 | HU-030 CSV/XLSX/PDF full filtered                                 | FROZEN          |
| D24 | HU-031 no duplica HU-023                                          | FROZEN          |
| D25 | HU-031 no duplica HU-024                                          | FROZEN          |
| D26 | HU-031 ADMIN/ENC/CONTADORA                                        | FROZEN          |
| D27 | HU-031 Period/Employee/Shift; current month                       | SUPPORTED_LOCAL |
| D28 | HU-031 analytics por Employee                                     | FROZEN          |
| D29 | HourlyRate read-only                                              | FROZEN          |
| D30 | ProjectedPay backend-authoritative                                | FROZEN          |
| D31 | Solo closed work contribuye al trabajo/pago reportado             | FROZEN          |
| D32 | HU-031 analytical summary backend-authoritative                   | SUPPORTED_LOCAL |
| D33 | Link HU-031 → HU-024 cuando autorizado                            | FROZEN          |
| D34 | HU-031 CSV/XLSX/PDF full filtered                                 | FROZEN          |
| D35 | Report navigation role-aware                                      | FROZEN          |
| D36 | Loading/empty/error para los tres reportes                        | FROZEN          |
| D37 | Mobile filters >2 controls usan overlay responsive actual         | FROZEN          |
| D38 | HU-029 mobile = summary → trend → channel → history link → export | FROZEN          |

## Historical Secondary Contract Audit (superseded by local reconciliation)

### HU-029

Evidencia secundaria:

- Endpoint: `GET /api/v1/reports/sales`.
- Query actual: `from`, `to`.
- DTO:
  - salesCount;
  - totalAmount;
  - cashTotal;
  - qrTotal;
  - externalTotal;
  - directTotal;
  - pedidosYaTotal;
  - series por BusinessDate.
- No pagination reportada.
- No `shiftType`.
- No `channel`.

Las cuatro cards, tendencia y breakdown por canal sí están soportados. D8 no está completamente soportada. citeturn254236view0turn282602view0

### HU-030

Evidencia secundaria:

- Endpoint: `GET /api/v1/reports/inventory`.
- Sin filtros.
- Response:
  - items;
  - totalCount;
  - lowCount;
  - negativeCount.
- Row:
  - productId;
  - productName;
  - quantity;
  - minStock;
  - stockState;
  - unitSymbol.
- Sin pagination.
- Sin type/category.
- Sin `generatedAt/asOf`.

El backend público calcula:

- quantity < 0 → NEGATIVE;
- en otro caso minStock != null y quantity <= minStock → LOW;
- en otro caso NORMAL;
- negative también contribuye a lowCount.

Esto satisface D17/D18. Los filtros D19 quedan omitidos por contrato. citeturn208594view0turn392052view1

### HU-031

Evidencia secundaria:

- Endpoint: `GET /api/v1/reports/attendance`.
- Query:
  - from;
  - to;
  - employeeId.
- Sin `shiftType`.
- Response:
  - items por Employee.
- Cada item contiene:
  - employeeId;
  - fullName;
  - attendanceCount;
  - workedMinutes;
  - workedHours;
  - lateCount;
  - absenceCount;
  - hourlyRate;
  - projectedPay.
- Sin summary global separado.
- Sin pagination.

El backend público calcula worked time únicamente desde registros con CheckOut y calcula ProjectedPay backend-side, pero la implementación observada no reconstruye late/absence con las reglas completas que el Sprint 3 backend OpenSpec exige. citeturn208594view0turn392052view2turn931795view0

## Dependency Audit

Evidencia secundaria del `package.json` público:

- package manager: pnpm.
- PDF: `jspdf` ya está presente.
- XLSX: no se observa una dependencia de workbook XLSX.
- Chart library: no se observa una librería dedicada.
- CSV: no requiere necesariamente dependencia.
- Vitest/Testing Library/TanStack Query ya forman parte del stack frontend. citeturn788398view0

Plan técnico:

- CSV: serializer interno pequeño y testeable.
- PDF: reutilizar el adapter/librería existente si local confirma `jspdf`.
- XLSX: se seleccionó y añadió únicamente `xlsx@^0.18.5` tras el audit local de package/lockfile.
- Charts HU-029: se implementó una visualización CSS accesible sin dependencia adicional.
- Heavy export code SHOULD ser candidato a dynamic import.

La selección exacta de XLSX es investigación técnica, no decisión de producto.

## Export Decision Table

| Decisión                                | Resultado                       |
| --------------------------------------- | ------------------------------- |
| Source                                  | Typed normalized report dataset |
| CSV                                     | YES                             |
| XLSX                                    | YES                             |
| PDF                                     | YES                             |
| Full filtered                           | YES                             |
| Current page only                       | NO                              |
| DOM scraping                            | NO                              |
| CSV → XLSX/PDF reparsing                | NO                              |
| All-page retrieval on explicit export   | ALLOWED IF NEEDED               |
| Aggregate calculation from visible rows | NO                              |
| New backend export endpoint             | NO BY DEFAULT                   |
| Minimal frontend XLSX dependency        | `xlsx@^0.18.5` added            |
| Existing PDF infrastructure             | REUSE IF LOCAL CONFIRMS         |
| Export DB persistence                   | NO                              |
| Cloud sync/upload                       | NO                              |

## Assumptions

- El working tree local puede contener cambios no comprometidos de Blocks 3/4 y no deben perderse.
- Los contracts públicos de `develop` pueden estar desactualizados respecto del local.
- Los report endpoints locales deben revalidarse antes de mantener cualquier blocker.
- Las PNG exactas de HU-029/HU-030/HU-031 no están disponibles como archivos inspeccionables en este turno; el visual audit de este briefing se basa en las referencias visuales y decisiones KEEP/ADAPT/OMIT explícitas suministradas y MUST revalidarse contra las imágenes reales durante explore.
- HU-015 continúa teniendo una route real equivalente al historial público actualmente observado; el path exacto debe revalidarse localmente.
- HU-024 puede ofrecer parámetros transferibles para Employee/period, pero esa integración es enhancement no bloqueante.
- No se asume que los report rows locales continúen siendo no paginados.

## Risks

### Risk 1: Summary calculado desde visible page

- Probability: Medium.
- Impact: High.
- Mitigation: Todas las cards MUST usar DTO backend; nunca rows visibles.

### Risk 2: Export current-page-only

- Probability: Medium.
- Impact: High.
- Mitigation: Export mapper recibe full report dataset independiente de la paginación UI.

### Risk 3: CSV/XLSX/PDF divergen

- Probability: Medium.
- Impact: High.
- Mitigation: Un normalized dataset por HU alimenta los tres serializers.

### Risk 4: CSV se convierte en fuente de XLSX/PDF

- Probability: Low/Medium.
- Impact: Medium.
- Mitigation: XLSX y PDF consumen objetos typed directamente.

### Risk 5: Spreadsheet formula injection

- Probability: Medium.
- Impact: Medium.
- Mitigation: Sanitizar valores textuales peligrosos antes de CSV/XLSX.

### Risk 6: Export demasiado grande

- Probability: Medium.
- Impact: Medium/High.
- Mitigation: Export explícito, pending state, pagination bounds, dynamic imports y gap si no puede enumerarse de forma segura.

### Risk 7: Loop infinito al recuperar páginas

- Probability: Low/Medium.
- Impact: High.
- Mitigation: Basarse en metadata real, páginas monotónicas, maximum esperado derivado del contrato y tests.

### Risk 8: Bundle de export demasiado pesado

- Probability: Medium.
- Impact: Medium.
- Mitigation: Reusar PDF actual, una sola dependencia XLSX y considerar imports dinámicos.

### Risk 9: Bundle de charts innecesario

- Probability: Medium.
- Impact: Low/Medium.
- Mitigation: Preferir SVG/CSS para visualizaciones simples.

### Risk 10: Duplicar HU-015

- Probability: Medium.
- Impact: High.
- Mitigation: HU-029 no contiene transaction table; solo link al history existente.

### Risk 11: Duplicar HU-023/HU-024

- Probability: Medium.
- Impact: High.
- Mitigation: HU-031 permanece Employee-aggregate analytics.

### Risk 12: PEDIDOSYA tratado como PaymentMethod

- Probability: Medium.
- Impact: High.
- Mitigation: Shared enum mappings separados.

### Risk 13: EXTERNAL tratado como Channel

- Probability: Medium.
- Impact: High.
- Mitigation: EXTERNAL solo bajo Payment.

### Risk 14: Valores ficticios de mockup llegan al dominio

- Probability: Medium.
- Impact: Medium.
- Mitigation: Renderizar exclusivamente generated enums/contracts.

### Risk 15: Seguridad COCINA/MESERO resuelta client-side

- Probability: Medium.
- Impact: High.
- Mitigation: Revalidar policy backend y no usar row hiding como boundary.

### Risk 16: HourlyRate editable

- Probability: Low.
- Impact: High.
- Mitigation: HU-031 completamente read-only.

### Risk 17: ProjectedPay recalculado frontend

- Probability: Medium.
- Impact: High.
- Mitigation: Renderizar `projectedPay` backend.

### Risk 18: Open attendance infla worked time

- Probability: Low/Medium.
- Impact: High.
- Mitigation: Backend report remains authority; no browser-clock calculation.

### Risk 19: Negative stock clamp a cero

- Probability: Low.
- Impact: High.
- Mitigation: Renderizar quantity sign real.

### Risk 20: minimumStock null malinterpretado

- Probability: Medium.
- Impact: Medium.
- Mitigation: `—`; status backend permanece autoridad.

### Risk 21: BusinessDate timezone shift

- Probability: Medium.
- Impact: High.
- Mitigation: Date-only helper; auditar HU-029 period semantics backend.

### Risk 22: Filtro no soportado hardcodeado

- Probability: High para D8/D27 con baseline pública.
- Impact: Blocker.
- Mitigation: La reconciliación backend autorizada ya cubre HU-029/HU-031; los controles frontend futuros deben consumir ese contrato y omitir filtros no soportados de HU-030.

### Risk 23: Employee options sin autorización

- Probability: Low/Medium.
- Impact: High.
- Mitigation: Preferir el mismo report contract no filtrado cuando proporciona Employee IDs/names; no User Management privilegiado.

### Risk 24: Report navigation expone route prohibida

- Probability: Medium.
- Impact: High.
- Mitigation: Capability union + route guards independientes.

### Risk 25: late/absence de HU-031 son incorrectos

- Probability: High en la evidencia pública.
- Impact: Blocker.
- Mitigation: `AttendanceDerivationService` permanece como autoridad backend y su resultado está cubierto por integración PostgreSQL.

### Risk 26: HU-031 summary global inexistente

- Probability: High en la evidencia pública.
- Impact: Blocker para D32 bajo D3.
- Mitigation: `AttendanceReportSummaryDto` se expone desde el servicio y su coherencia con filas filtradas está cubierta por integración PostgreSQL.

### Risk 27: Evidencia manual se convierte en blocker

- Probability: Medium.
- Impact: Medium.
- Mitigation: `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

### Risk 28: Overarchitecture

- Probability: Medium.
- Impact: Medium.
- Mitigation: Shared serializers/helpers pequeños + adapters específicos por HU.

## Rollback Strategy

No DB rollback.

No migration rollback.

Los cambios backend son revertibles por archivo y no requieren rollback de DB ni de migration.

Frontend rollback puede retirar independientemente:

- `/reportes/*`;
- report navigation;
- report query adapters;
- HU-specific pages;
- shared export utilities;
- `xlsx@^0.18.5` y su resolución en lockfile;
- HU-029 charts;
- history links;
- tests/docs.

HU-015, HU-023, HU-024, inventario operativo y demás módulos deben permanecer intactos.

Cualquier cambio backend adicional fuera de HU-029/HU-031 debe obtener autorización separada. El frontend APPLY de este change ya está completo y no incluye cambios fuera de la allowlist.

## Success Criteria

### HU-029

- `/reportes/ventas` accesible solo al frontend audience aprobado.
- Current-month default.
- Period/Shift/Channel enviados server-side.
- Four cards desde backend.
- CASH/QR/EXTERNAL separados de DIRECT/PEDIDOSYA.
- Trend usa backend BusinessDate series.
- Distribution usa backend channel totals.
- No transaction history duplicada.
- Link HU-015 real.
- CSV/XLSX/PDF usan el mismo full filtered report dataset.
- Responsive implementation.
- Automated tests.

### HU-030

- `/reportes/inventario`.
- ADMIN/ENC/COCINA/CONTADORA.
- Backend scope es autoridad para COCINA.
- Current point-in-time snapshot.
- No period.
- Low/negative/total desde backend.
- Quantity negativa preservada.
- Status backend preservado.
- Solo filtros realmente soportados.
- No mutations.
- No fake sync.
- CSV/XLSX/PDF full filtered.
- Responsive implementation.
- Automated tests.

### HU-031

- `/reportes/asistencia`.
- ADMIN/ENC/CONTADORA.
- Current-month default.
- Period/Employee/Shift server-side.
- Employee analytical rows.
- real lateCount.
- real absenceCount.
- backend workedMinutes.
- HourlyRate read-only.
- backend projectedPay.
- backend-authoritative analytical summary.
- no HU-023/HU-024 duplication.
- optional HU-024 link.
- CSV/XLSX/PDF full filtered.
- Responsive implementation.
- Automated tests.

### Cross-Cutting

- `/reportes` redirects deterministically to first authorized report.
- Global Reportes hidden with zero capabilities.
- Multi-role uses union.
- Backend changes are limited to the explicitly authorized HU-029/HU-031 reconciliation recorded in this change.
- No migration.
- No generated manual edit; generated TypeScript se actualiza únicamente mediante el pipeline OpenAPI runtime → `api:generate`.

- Export does not scrape DOM.
- Export never uses current page as full report.
- Full frontend gates pass.
- Backend regression remains factual.
- Manual evidence remains deferred.
