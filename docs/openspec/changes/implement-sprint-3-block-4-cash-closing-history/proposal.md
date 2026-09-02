# Proposal

## Problem Statement

HU-028 debe completar la capa frontend de consulta histórica de cierres finales de caja sin reabrir HU-026/HU-027 ni convertir el módulo en reporting, corrección histórica o reapertura de caja.

El flujo objetivo permanece:

CashSession activa
→ Preview HU-026
→ efectivo declarado
→ cierre HU-027
→ CashClosing persistido
→ `/turnos/cierres`
→ historial paginado
→ detalle inmutable

La auditoría secundaria de la rama pública `develop` confirma que HU-028 continúa documentada como:

`BACKEND IMPLEMENTADO / FRONTEND PENDIENTE`

y expone actualmente:

- `GET /api/v1/cash/closings?page=&pageSize=` → `PagedResponse<CashClosingDto>`
- `GET /api/v1/cash/closings/{id}` → `CashClosingDto`

ambos bajo `CashHistory`. citeturn870342view1turn279334view4

La policy backend `CashHistory` permite:

- ADMINISTRADOR;
- ENCARGADO;
- CONTADORA.

`CashManage`, que protege Preview/Close, permanece limitada a ADMINISTRADOR y ENCARGADO. Esto permite separar correctamente operación e historial. citeturn882782view5

### Contract decision D19 — resolved

La auditoría local confirmó que `GET /api/v1/cash/closings` inicialmente aceptaba únicamente `page` y `pageSize`, mientras D3 exige período server-side. El maintainer resolvió explícitamente el blocker con **D19 / OPTION A**.

D19 autoriza la extensión mínima y aditiva del endpoint existente:

- `from?: DateOnly`;
- `to?: DateOnly`;
- filtrar `CashClosing.BusinessDate` con límites inclusivos `>= from` y `<= to`;
- aplicar el filtro antes del orden newest-first y de `Skip/Take`;
- rechazar `from > to` con el `ProblemDetails`/`ValidationProblem` existente;
- conservar page/pageSize y las respuestas/roles actuales;
- no crear endpoint, DTO, entidad, schema ni migration nuevos.

Los límites son independientes y date-only; no se intercambian silenciosamente ni se convierten en instantes UTC. Responsible continúa omitido por no estar soportado por el contrato.

`SPRINT_3_BLOCK_4_PRODUCT_DECISION_REQUIRED: RESOLVED_BY_D19_OPTION_A`

`READY_FOR_SPRINT_3_BLOCK_4_APPLY: YES`

## Current Baseline

### Local baseline

- Branch: `UNVERIFIED_LOCAL`
- HEAD: `UNVERIFIED_LOCAL`
- Working tree: `UNVERIFIED_LOCAL`
- Staged: `UNVERIFIED_LOCAL`
- Unstaged: `UNVERIFIED_LOCAL`
- Untracked: `UNVERIFIED_LOCAL`

No existe acceso desde esta generación al working tree local del maintainer.

La futura fase explore MUST revalidar:

- branch;
- HEAD;
- status;
- diffs;
- OpenSpec activos/archivados;
- contrato runtime;
- generated API local;
- estado frontend posterior a los últimos bloques.

La rama pública es evidencia secundaria y nunca sustituye la baseline local.

### Backend audit

Estado secundariamente confirmado:

| Capability                | Estado                      |
| ------------------------- | --------------------------- |
| HU-026 Preview            | EXISTE                      |
| HU-027 Close              | EXISTE                      |
| HU-028 History            | EXISTE                      |
| HU-028 Detail             | EXISTE                      |
| HU-028 server pagination  | EXISTE                      |
| HU-028 newest-first       | EXISTE                      |
| HU-028 period filter      | AUTHORIZED — D19 / OPTION A |
| HU-028 responsible filter | OMITTED_BY_CURRENT_CONTRACT |
| HU-028 summary            | ABSENT                      |
| CONTADORA read            | SUPPORTED                   |

`CashClosingsAsync` lee `CashClosings` con `AsNoTracking()`, ordena por `ClosedAt DESC`, pagina server-side y proyecta el snapshot almacenado. `CashClosingAsync` lee el cierre individual desde la misma entidad histórica. No reconstruye el cierre consultando ventas o gastos actuales. citeturn198188view2turn198188view3

### Generated API audit

`CashClosingDto` actualmente expone:

- id;
- cashSessionId;
- businessDate;
- openingAmount;
- pettyCashOpeningAmount;
- cashRemovedAmount;
- salesTotal;
- cashSalesTotal;
- qrSalesTotal;
- externalSalesTotal;
- directSalesTotal;
- pedidosYaSalesTotal;
- cashDrawerExpensesTotal;
- pettyCashExpensesTotal;
- expensesTotal;
- expectedCash;
- declaredCash;
- difference;
- observation;
- closedByUserId;
- closedAt. citeturn882782view0turn279334view0

No expone actualmente:

- `cashAmountCarriedForward`;
- responsible display name;
- digital signature;
- last-modified timestamp;
- sequential closing number.

`cashAmountCarriedForward` existe en `CashPreviewDto`, pero no forma parte del snapshot `CashClosingDto` actual. El frontend histórico MUST NOT reconstruirlo desde CashSession. citeturn882782view0

### Frontend audit

La feature actual `cash` contiene:

- `CashClosingPage`;
- cash API/query hooks;
- formatters;
- tests;
- route tests.

Actualmente su API frontend solo implementa:

- preview;
- close.

Todavía no existen queries frontend para history/detail. citeturn730583view0turn793889view0

Routing actual:

- `/turnos`;
- `/turnos/cierre`;
- no `/turnos/cierres`. citeturn279334view3

El success state actual de HU-027 ofrece:

- `Volver a Turnos / Caja`;
- `Ir al Inicio`;

pero todavía no `Ver historial de cierres`. citeturn793889view1

La navegación actual dispone de un único item global `Turnos / Caja` y usa targets role-aware, pero CONTADORA no forma parte del actual `SHIFT_OWN_READ_ROLES`; por tanto HU-028 necesitará una integración de navegación específica sin otorgarle acceso operativo de turnos/cierre. citeturn279334view2turn885567view0

## Why HU-028 Extends HU-026/HU-027

HU-026/HU-027 y HU-028 comparten:

- `CashPreviewDto` / `CashClosingDto`;
- money formatting;
- BusinessDate formatting;
- difference semantics;
- payment/channel labels;
- current Cash feature;
- ProblemDetails;
- query infrastructure;
- authorization helpers;
- immutable-close semantics.

Pero cumplen funciones diferentes:

- `/turnos/cierre` = operación;
- `/turnos/cierres` = consulta histórica.

La solución MUST extender la feature `cash` existente y MUST NOT crear otro modelo frontend paralelo.

## Goals

- Crear `/turnos/cierres`.
- Protegerla para ADMINISTRADOR, ENCARGADO y CONTADORA.
- Mantener `/turnos/cierre` solo para CashManage.
- Integrar los endpoints existentes de history y detail.
- Aplicar server-side pagination.
- Mantener newest-first backend authority.
- Implementar período/current-month únicamente si el contrato final autorizado lo soporta.
- Omitir Responsible filter si el contrato final continúa sin soportarlo.
- Omitir summary cards si el backend continúa sin aggregates.
- Construir un listado compacto centrado en reconciliación.
- Mostrar:
  - BusinessDate;
  - actor del cierre según datos disponibles;
  - ClosedAt;
  - expectedCash;
  - declaredCash;
  - difference;
  - Ver detalle.
- Renderizar diferencia con:
  - Sobrante;
  - Faltante;
  - Cuadrado.
- Mostrar detalle on-demand desde el snapshot persistido.
- Separar PaymentMethod de SalesChannel.
- Mostrar openingAmount y pettyCashOpeningAmount por separado.
- Mostrar cashRemovedAmount.
- Mostrar observation real cuando exista.
- Tolerar optional/legacy display gaps sin reconstruir historia.
- Añadir `Ver historial de cierres` al success state HU-027.
- Reutilizar AppShell y components actuales.
- Proporcionar responsive implementation y accesibilidad.
- Diferir evidencia manual a Sprint Final Audit.

## Frozen Product Decisions

| ID  | Decisión                                                                               | Estado                       |
| --- | -------------------------------------------------------------------------------------- | ---------------------------- |
| D1  | HU-028 vive en `/turnos/cierres`                                                       | FROZEN                       |
| D2  | Acceso explícito a history y link secundario desde HU-027                              | FROZEN                       |
| D3  | Período obligatorio, default mes actual; Responsible solo si contract lo soporta       | FROZEN — D19 AUTHORIZED |
| D4  | No se exigen summary cards y no se añade backend summary                               | FROZEN                       |
| D5  | Listado compacto centrado en cierre/reconciliación                                     | FROZEN                       |
| D6  | difference > 0 Sobrante, < 0 Faltante, = 0 Cuadrado                                    | FROZEN                       |
| D7  | Detail mediante Drawer desktop / Sheet mobile cuando los primitives reales lo permitan | FROZEN                       |
| D8  | Detail usa exclusivamente snapshot real de cierre                                      | FROZEN                       |
| D9  | PaymentMethod y SalesChannel son dimensiones separadas                                 | FROZEN                       |
| D10 | Apertura principal y caja chica se muestran por separado                               | FROZEN                       |
| D11 | Sin firma digital y sin última modificación                                            | FROZEN                       |
| D12 | Sin export/print/download                                                              | FROZEN                       |
| D13 | Sin banner persistente de modo consulta                                                | FROZEN                       |
| D14 | Server pagination, newest-first, page reset y current-month default                    | FROZEN — D19 AUTHORIZED |
| D15 | ADMIN/ENC/CONTADORA read-only                                                          | FROZEN                       |
| D16 | Success HU-027 añade `Ver historial de cierres`                                        | FROZEN                       |
| D17 | Legacy/null-safe; nunca reconstruir histórico faltante                                 | FROZEN                       |
| D18 | Responsive/a11y implementados; manual evidence deferred                                | FROZEN                       |
| D19 | OPTION A: extender `GET /cash/closings` con `from`/`to` DateOnly inclusivos, antes de ordenar/paginar; sin endpoint/DTO/schema/migration nuevos | FROZEN — AUTHORIZED |

## Authorization

| Capability                 |              ADMIN |                ENC | CONTADORA | MESERO | COCINA | EMPLEADO |
| -------------------------- | -----------------: | -----------------: | --------: | -----: | -----: | -------: |
| `/turnos/cierres`          |                YES |                YES |       YES |     NO |     NO |       NO |
| View closing detail        |                YES |                YES |       YES |     NO |     NO |       NO |
| Preview/Close current cash | CURRENT CashManage | CURRENT CashManage |        NO |     NO |     NO |       NO |
| Edit historical closing    |                 NO |                 NO |        NO |     NO |     NO |       NO |
| Reopen historical closing  |                 NO |                 NO |        NO |     NO |     NO |       NO |
| Correct historical closing |                 NO |                 NO |        NO |     NO |     NO |       NO |
| Export history             |                 NO |                 NO |        NO |     NO |     NO |       NO |

Backend `CashHistory` y `CashManage` ya soportan esta separación. citeturn882782view5

## Non-Goals

- Reimplementar HU-026.
- Reimplementar HU-027.
- Cambiar fórmula de expectedCash.
- Cambiar CashSession.
- Cambiar lifecycle de MORNING/NIGHT.
- Más de un cierre por BusinessDate.
- Multiple cashboxes.
- Reopen.
- Correction.
- Approval.
- Edit/Delete.
- Modificar observation histórica.
- Firma criptográfica.
- Last modification/audit-edit timeline.
- Sequential closing numbers.
- Summary backend nuevo.
- Reporting.
- Month-over-month metrics.
- Days without close.
- Sales report.
- Inventory report.
- Attendance report.
- PDF.
- CSV.
- XLSX.
- Print.
- Download.
- Nueva dependencia.
- Migration.
- Schema changes.
- No añadir campos al DTO ni modificar el modelo; generated TypeScript se regenera desde el runtime OpenAPI.
- Reconstruir historical snapshots desde datos actuales.

## Affected Areas

Frontend bajo el scope aprobado, más el filtro backend mínimo autorizado por D19:

- existing cash feature;
- cash API/query keys;
- API endpoint registry;
- history page;
- detail overlay;
- routes;
- Turnos/Caja navigation;
- HU-027 success state;
- money/date formatters;
- existing table/card/pagination components;
- tests;
- HU-028 docs;
- OpenSpec evidence.

Backend: únicamente `GET /cash/closings` y la firma/consulta de servicio necesarias para D19; no se toca el modelo persistido.

## Assumptions

- El contrato local confirmado se extenderá únicamente según D19 / OPTION A.
- `from`/`to` se implementan en el endpoint existente y no cambian el snapshot `CashClosingDto`.
- Responsible permanece omitido porque el contrato no lo soporta.
- `CashClosingDto` del local puede haber añadido display name o carried-forward después de la evidencia pública; esos campos solo se usarán si realmente existen.
- La evidencia manual responsive/a11y está diferida de forma intencional.

## Risks

### Risk 1: Reconstrucción histórica de expectedCash

- Probability: Medium.
- Impact: High.
- Mitigation: Renderizar `CashClosingDto.expectedCash`; nunca consultar ventas/gastos actuales para recalcular.

### Risk 2: Period filter no soportado

- Probability: High en la evidencia pública.
- Impact: Blocker.
- Mitigation: Aplicar D19 de forma aditiva, con validación `from > to`, límites inclusivos y pruebas de orden/paginación.

### Risk 3: Mezclar medios de pago y canales

- Probability: Medium.
- Impact: High.
- Mitigation: Secciones independientes para CASH/QR/EXTERNAL y DIRECT/PEDIDOSYA.

### Risk 4: Consultar Sales/Expenses actuales para Detail

- Probability: Low/Medium.
- Impact: High.
- Mitigation: Detail usa exclusivamente CashClosingDto persistido.

### Risk 5: N+1 para responsable

- Probability: Medium.
- Impact: Medium.
- Mitigation: No llamar `/users` por row. Usar display field si existe; de lo contrario mostrar el identificador histórico disponible.

### Risk 6: Summary derivado de página visible

- Probability: Medium si se copia el mockup.
- Impact: High.
- Mitigation: Summary cards omitidas mientras endpoint no devuelva aggregates.

### Risk 7: CONTADORA recibe acciones de cierre

- Probability: Medium.
- Impact: High.
- Mitigation: Separar CashHistory de CashManage en route/nav/action visibility.

### Risk 8: Operaciones históricas leak

- Probability: Medium.
- Impact: High.
- Mitigation: Única acción histórica: `Ver detalle`.

### Risk 9: BusinessDate desplazado por UTC

- Probability: Medium.
- Impact: Medium.
- Mitigation: Reutilizar formatter date-only existente.

### Risk 10: Legacy/null snapshot produce crash

- Probability: Low/Medium.
- Impact: Medium.
- Mitigation: Empty-value convention y no reconstrucción.

### Risk 11: Tabla desktop demasiado ancha

- Probability: High si se copia el mockup.
- Impact: Medium.
- Mitigation: Breakdown completo solo en Detail.

### Risk 12: Mobile card omite reconciliación esencial

- Probability: Medium.
- Impact: Medium.
- Mitigation: BusinessDate + expected + declared + difference + detail siempre visibles.

### Risk 13: Current Cash success regression

- Probability: Medium.
- Impact: High.
- Mitigation: Añadir link secundario sin sustituir current success flow.

### Risk 14: HU-028 deriva hacia reporting

- Probability: Medium.
- Impact: Medium.
- Mitigation: Sin summary artificial, trends, exports ni combined APIs.

### Risk 15: Manual evidence se convierte en blocker

- Probability: Medium.
- Impact: Medium.
- Mitigation: Mantener `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

## Rollback Strategy

No DB rollback.

No migration rollback.

El único cambio backend autorizado por D19 es el filtro aditivo del endpoint existente; no hay migration ni rollback de modelo.

Frontend rollback feature-wise:

- retirar `/turnos/cierres`;
- retirar navigation access;
- retirar closing-history queries;
- retirar history/detail components;
- retirar `Ver historial de cierres` del success HU-027;
- retirar tests/docs asociados.

HU-026 y HU-027 deben permanecer funcionalmente intactas.

D19 ya autoriza el contract change mínimo; cualquier ampliación posterior queda fuera de este change.

## Success Criteria

El change puede implementarse porque el período quedó resuelto por D19 / OPTION A.

Después del futuro APPLY:

- `/turnos/cierres` funciona.
- ADMIN accede.
- ENCARGADO accede.
- CONTADORA accede read-only.
- Roles restantes quedan denied.
- Current-month filter funciona server-side.
- Pagination es server-side.
- History permanece newest-first.
- Responsible filter solo existe si backend lo soporta.
- Summary cards solo existen si backend ya las expone.
- List es compacta.
- Positive difference = Sobrante.
- Negative difference = Faltante.
- Zero difference = Cuadrado.
- Detail usa persisted CashClosing snapshot.
- PaymentMethods y Channels están separados.
- Opening main/petty están separados.
- `cashAmountCarriedForward` no se reconstruye si no existe en snapshot.
- No history mutations.
- No export.
- HU-027 success ofrece `Ver historial de cierres`.
- HU-026/HU-027 regressions permanecen green.
- Backend product diff queda limitado al filtro aditivo autorizado por D19.
- Migration = NONE.
- Generated API se regenera desde el OpenAPI runtime y solo refleja `from`/`to` si el generador los publica.
- Frontend full gates pasan.
- Manual evidence queda `DEFERRED_TO_SPRINT_FINAL_AUDIT`.
