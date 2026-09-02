# Proposal

## Problem Statement

Sprint 3 ya dispone de backend para HU-008, HU-019 y HU-021, pero las tres capacidades permanecen como `BACKEND_COMPLETE_FRONTEND_PENDING` en la documentación pública actual: historial de producción, historial autorizado de compras e historial autorizado de gastos. Los tres casos son capas de consulta sobre módulos operativos ya existentes y deben implementarse sin sustituir sus flujos de escritura actuales. La documentación vigente confirma los contratos backend de producción, compras y gastos y mantiene el frontend de estas tres HUs como pendiente. citeturn711608view1turn263702view0turn263702view1

El bloque es cohesivo porque las tres HUs comparten:

- filtrado server-side;
- paginación server-side;
- representación histórica read-only;
- TanStack Query;
- estados loading/empty/error;
- tablas desktop y cards mobile;
- autorización por múltiples roles;
- integración con módulos que ya poseen mutations.

No se propone un `HistoryEngine`, repository genérico ni nueva arquitectura. Cada feature conserva su slice y reutiliza primitives y patrones compartidos reales.

HU-008 requiere además las tres tarjetas de resumen aprobadas. El contrato existente no proporciona esos tres agregados y calcularlos desde la página visible sería incorrecto. Por decisión explícita del maintainer, este change MAY incorporar exactamente una nueva capacidad backend: un endpoint GET read-only de resumen de producción.

El resumen debe medir eventos de Production, nunca sumar cantidades físicas heterogéneas. Una producción de `10 L` y otra de `20 Kg` representan `2` eventos; nunca `30` unidades físicas agregadas.

D12 resuelve el gap contractual específico de HU-021 sin crear una capacidad nueva: CONTADORA se incluye en la policy existente `ExpenseCategoryRead` únicamente para cargar las opciones de categoría que necesita HU-021. CONTADORA mantiene acceso read-only a Expense History y esta autorización no permite crear, editar, activar, desactivar o eliminar categorías ni registrar gastos; las mutaciones de categorías permanecen reservadas a ADMINISTRADOR y ENCARGADO. Se reutiliza el endpoint existente de categorías: no se añade endpoint, DTO, schema, migration ni otro cambio backend fuera de esta modificación puntual de policy. La única nueva capacidad backend de este change continúa siendo Production Summary. La implementación y cobertura de autorización D12 ya existen en `Program.cs` y `ExpenseCategoryAuthorizationPostgresIntegrationTests.cs`; el focused output correspondiente fue `1/1` passed.

## Current Baseline

### Local working tree

- Branch: `UNVERIFIED_LOCAL`.
- HEAD: `UNVERIFIED_LOCAL`.
- Working tree: `UNVERIFIED_LOCAL`.
- Staged: `UNVERIFIED_LOCAL`.
- Unstaged: `UNVERIFIED_LOCAL`.
- Untracked: `UNVERIFIED_LOCAL`.

Este entorno no permite ejecutar Git contra el working tree local del maintainer. El futuro explore/apply MUST revalidar esta baseline antes de modificar product code.

### Secondary public `develop` evidence

La rama pública actual confirma:

- árbol OpenSpec canónico en `docs/openspec/`; citeturn964612view0
- HU-008 backend implementado y frontend pendiente; citeturn711608view1
- HU-019 backend implementado y frontend pendiente; citeturn263702view0
- HU-021 backend implementado y frontend pendiente; citeturn263702view1
- frontend generado desde OpenAPI y uso de pnpm/scripts actuales; citeturn423800view0turn423800view1
- `/produccion/registrar` existe actualmente como flujo HU-007, mientras el historial `/produccion` todavía debe integrarse; citeturn489997view0turn346059view1
- `/compras` ya existe y mantiene los flujos operativos HU-017/HU-018; citeturn489997view1turn718410view1
- `/gastos` actualmente corresponde al registro HU-020 y todavía necesita la ruta de historial; citeturn489997view2turn718410view2
- la arquitectura de navegación ya implementa targets/visibilidad role-aware y unión de roles, patrón que debe reutilizarse. citeturn346059view7

El informe general del proyecto también documenta como capacidades del producto consultar historial de compras y gastos, además de autorización backend, múltiples roles y responsive desde 360 px. fileciteturn22file8

### OpenSpec state

El repositorio público confirma el archivo archivado:

`docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/`

y los HU docs lo usan como source of truth del backend Sprint 3. citeturn711608view0turn263702view2

La auditoría `2026-09-01-audit-sprint-3-current-system-state` y otros changes recientes mencionados por el maintainer no aparecen en la vista pública consultada, por lo que MUST localizarse en el working tree local antes de APPLY. Esa diferencia no se interpreta como ausencia ni como error.

## Why These Three Histories Are One Block

HU-008, HU-019 y HU-021 pertenecen a dominios distintos pero representan la misma etapa arquitectónica:

- la operación ya existe;
- el backend histórico ya existe;
- falta integrar la consulta frontend;
- cada flujo debe preservar las mutations previas;
- las vistas comparten patrones de lectura, filtros, paginación y responsive.

Agruparlas permite coherencia de UX y regresión sin mezclarlas en una abstracción genérica.

Los módulos permanecen separados:

- Production feature.
- Purchases feature.
- Expenses feature.

## Goals

- Implementar HU-008 como página principal `/produccion`.
- Mantener HU-007 en `/produccion/registrar`.
- Añadir tres summary cards server-backed para HU-008.
- Añadir un único endpoint read-only de Production Summary sin schema changes.
- Mantener las tres métricas de Production semánticamente válidas:
  - número de eventos;
  - última producción;
  - preparación con más eventos.
- Implementar filtros HU-008 server-side:
  - preparación;
  - período;
  - responsable;
  - BatchCode.
- Mostrar BatchCode real y consumos históricos persistidos.
- Mantener `/compras` como única experiencia de compras.
- Integrar `PurchaseHistoryDto`/detail histórico en esa página sin reimplementar Create/Receive/Cancel.
- Implementar los cuatro filtros aprobados de compras:
  - período;
  - proveedor;
  - estado;
  - ámbito.
- Preservar row-level KITCHEN scope de COCINA.
- Implementar `/gastos/historial` dentro del mismo módulo de Gastos.
- Mantener `/gastos` como registro HU-020.
- Mostrar las tres métricas backend de HU-021.
- Implementar los filtros aprobados de gastos usando el endpoint existente de categorías para ADMINISTRADOR, ENCARGADO y CONTADORA conforme a D12; CONTADORA sigue sin mutaciones de categorías ni Register Expense por esta autorización.
- Incorporar navegación interna role-aware.
- Reutilizar AppShell, shared UI, formatters, query/error infrastructure y patrones de HU-015.
- Mantener desktop tables y mobile cards.
- Mantener multi-role como unión de capacidades.
- Añadir tests focalizados y regresiones de HU-007/HU-017/HU-018/HU-020.
- Regenerar el TypeScript generado exclusivamente después del nuevo contrato HU-008 y desde runtime OpenAPI real.
- No introducir migration ni dependencia nueva.

## Backend Exception

### Authorized change

Exactamente una nueva capacidad backend:

`Production History Summary`

La inclusión de CONTADORA en la policy existente `ExpenseCategoryRead` conforme a D12 no constituye una segunda capacidad ni un cambio de contrato: solo habilita la carga de opciones para HU-021. No autoriza mutaciones de categorías ni registro de gastos.

Recommended route based on the current `/api/v1/productions` endpoint family:

`GET /api/v1/productions/summary`

El path definitivo MUST revalidarse contra `OperationsEndpoints` local antes de APPLY.

### Purpose

Proporcionar exclusivamente los datos necesarios para:

1. `Producciones`.
2. `Última producción`.
3. `Preparación más producida`.

### Explicit limits

El endpoint MUST NOT:

- generar charts;
- devolver series temporales;
- devolver total Kg/L/unidades;
- calcular costes;
- valorar inventario;
- persistir summaries;
- introducir tablas;
- modificar Production;
- modificar Inventory;
- crear migrations.

## Frozen Product Decisions

| ID  | Decisión                                                                                             | Estado |
| --- | ---------------------------------------------------------------------------------------------------- | ------ |
| D1  | `/produccion` es la página principal de historial; registro permanece en `/produccion/registrar`     | FROZEN |
| D2  | HU-008 mantiene tres summary cards                                                                   | FROZEN |
| D3  | HU-008 usa preparación + período mes actual + responsable + BatchCode                                | FROZEN |
| D4  | Compras usa un único `/compras`; no existe segunda página `/compras/historial`                       | FROZEN |
| D5  | HU-019 usa período últimos 30 días + proveedor + estado + ámbito                                     | FROZEN |
| D6  | Compra muestra UUID real abreviado en listado y completo en detalle                                  | FROZEN |
| D7  | `/gastos` registra y `/gastos/historial` consulta                                                    | FROZEN |
| D8  | HU-021 usa período mes actual + categoría + fuente + turno + responsable; Category usa una fuente autorizada | FROZEN |
| D9  | HU-021 muestra exactamente `totalAmount`, `cashDrawerTotal` y `pettyCashTotal`                       | FROZEN |
| D10 | Success de registro de producción y gasto añade acción secundaria `Ver historial`                    | FROZEN |
| D11 | Production Summary utiliza COUNT de eventos/frecuencia y nunca suma magnitudes físicas incompatibles | FROZEN |
| D12 | CONTADORA se incluye en `ExpenseCategoryRead` únicamente para cargar opciones de categoría de HU-021; sigue read-only, sin mutaciones de categorías ni Register Expense por esta autorización | FROZEN |

## Resolved Product Decision

### D12 — HU-021 Category Options Authorization

La decisión explícita y congelada del maintainer es:

- incluir CONTADORA en la policy existente `ExpenseCategoryRead` únicamente para cargar las opciones de categoría requeridas por HU-021;
- mantener a CONTADORA pura con acceso read-only a Expense History;
- mantener las mutaciones de categorías —crear, editar, activar, desactivar y eliminar— exclusivamente para ADMINISTRADOR y ENCARGADO;
- no conferir a CONTADORA permiso para registrar gastos por esta autorización;
- reutilizar el endpoint existente de categorías, sin añadir endpoint, DTO, schema, migration ni otro cambio backend fuera de esta modificación puntual de policy.

La implementación y la cobertura backend de esta decisión ya están en `Program.cs` y `ExpenseCategoryAuthorizationPostgresIntegrationTests.cs`; el focused output aislado fue `1/1` passed.

El change MUST:

- usar la policy existente `ExpenseCategoryRead` y su endpoint de opciones para el filtro Category de HU-021;
- conservar separadas la lectura de opciones, las mutaciones de categorías y Expense Register;
- mantener Category para ADMINISTRADOR, ENCARGADO y CONTADORA cuando la capability efectiva incluya `ExpenseCategoryRead`.

El change MUST NOT:

- conferir mutaciones de categorías a CONTADORA;
- inferir Expense Register desde `ExpenseCategoryRead`;
- crear otro endpoint o DTO para categorías;
- introducir schema changes o migrations;
- derivar categorías desde current page;
- exponer IDs inventados;
- usar un endpoint privilegiado de gestión como bypass.

## Non-Goals

- HU-023.
- HU-024.
- HU-028.
- HU-029.
- HU-030.
- HU-031.
- Reportes.
- Charts analíticos.
- PDF.
- CSV.
- XLSX.
- Print.
- Production edit.
- Purchase edit.
- Expense edit.
- Delete history.
- Approval workflows.
- Inventory por BatchCode.
- FIFO.
- FEFO.
- Expiry.
- Stock por lote.
- Nueva arquitectura frontend.
- Generic `HistoryEngine`.
- Nuevos endpoints fuera de Production Summary.
- Cambios a Shift Opening/CashSession/HU-026/HU-027.
- Correcciones al demo dataset.
- Nueva migration.
- Nuevas dependencias npm/NuGet.
- Modificación manual del generated TypeScript.

## Affected Areas

- OpenSpec del nuevo change.
- Production backend read contract.
- Production backend query/service.
- Production backend integration/application tests.
- Runtime OpenAPI.
- Generated TypeScript.
- Production frontend feature.
- Purchases frontend feature.
- Expenses frontend feature.
- Existing `ExpenseCategoryRead` authorization policy and focused authorization test coverage.
- Routes.
- Navigation.
- Role/capability visibility.
- Query keys.
- Mutation invalidation de compras.
- Shared history primitives existentes.
- HU-007 success integration.
- HU-020 success integration.
- Frontend tests.
- Documentación HU-008/HU-019/HU-021.

## Assumptions

- La evidencia de `develop` público representa la mejor baseline disponible desde este entorno, pero el working tree local tiene prioridad y MUST revalidarse.
- El frontend continúa usando TanStack Query y generated TypeScript según la arquitectura observada.
- El package manager local sigue siendo pnpm hasta que Task 1 confirme lo contrario.
- El backend mantiene EF Core/PostgreSQL y la actual estructura de Operations/Expenses.
- No se asume que suppliers/categories/products activos sean suficientes para filtros históricos; esa compatibilidad debe inspeccionarse.
- El binary/pixel-level audit de las imágenes suministradas no pudo realizarse desde los adjuntos disponibles en este entorno. La reconciliación visual se basa en los nombres, decisiones KEEP/ADAPT/OMIT y especificaciones visuales aportadas por el maintainer; el futuro explore debe abrir las imágenes locales si están disponibles.

## Risks

### Risk 1: Nuevo summary introduce drift entre cards y listado

- Probability: Medium.
- Impact: High.
- Mitigation: Aplicar exactamente la misma composición de filtros backend al query histórico y al summary; añadir tests de paridad.

### Risk 2: Generated client queda stale

- Probability: Medium.
- Impact: High.
- Mitigation: Pipeline obligatorio backend → runtime OpenAPI → `api:generate` real → typecheck/frontend.

### Risk 3: Suma inválida de unidades físicas

- Probability: Medium.
- Impact: High.
- Mitigation: El contract no debe exponer physical total agregado; tests explícitos con L + Kg.

### Risk 4: Integrar HU-019 rompe Create/Receive/Cancel

- Probability: Medium.
- Impact: High.
- Mitigation: Reutilizar mutations/hooks actuales, conservar compatibility endpoint y añadir regresión HU-017/HU-018.

### Risk 5: COCINA obtiene scope GENERAL aparente o real

- Probability: Medium.
- Impact: High.
- Mitigation: Backend continúa como authority y UI no ofrece scope imposible para pure COCINA.

### Risk 6: CONTADORA obtiene mutations accidentalmente

- Probability: Medium.
- Impact: High.
- Mitigation: Mantener `ExpenseCategoryRead` como lectura de opciones únicamente; conservar mutaciones de categorías en ADMIN/ENC y Expense Register fuera de CONTADORA pura; probar lectura, mutaciones y combinaciones multi-role.

### Risk 7: D12 se interpreta como autorización de escritura

- Probability: Medium.
- Impact: High.
- Mitigation: Reutilizar solo el endpoint existente para opciones, mantener intactas las policies de mutación/registro y conservar la cobertura enfocada `1/1` de autorización D12.

### Risk 8: Entidades históricas inactivas faltan en filtros

- Probability: Medium.
- Impact: Medium.
- Mitigation: Auditar active-only behavior de preparation/supplier/category sources; documentar limitación sin añadir endpoints no autorizados.

### Risk 9: Invalidations de purchase history quedan incompletas

- Probability: Medium.
- Impact: Medium/High.
- Mitigation: Reusar prefix/factory actual y verificar create/cancel/receive → history refresh sin invalidación global.

### Risk 10: Routes o navigation duplicadas

- Probability: Medium.
- Impact: Medium.
- Mitigation: Extender AppRoutes/navigation registry actuales; un solo item Production, Purchases y Expenses.

### Risk 11: Detail provoca N+1

- Probability: Low/Medium.
- Impact: Medium.
- Mitigation: Production/Purchase detail solo on demand; no fetch por cada row.

### Risk 12: Tables no son utilizables a 360 px

- Probability: High si se reutiliza DataTable directamente.
- Impact: Medium.
- Mitigation: Desktop table + mobile cards siguiendo HU-015 precedent.

### Risk 13: Mockups introducen scope/fields falsos

- Probability: Medium.
- Impact: Medium.
- Mitigation: KEEP/ADAPT/OMIT contra generated/backend contract.

### Risk 14: Fechas producen off-by-one en La Paz

- Probability: Medium.
- Impact: Medium.
- Mitigation: Usar timezone/date helpers reales y probar límites de mes/30 días.

## Rollback Strategy

No hay migration ni schema rollback.

### HU-008 backend

Production Summary puede retirarse eliminando:

- endpoint;
- summary contract;
- query/service implementation;
- tests asociados;

sin alterar Production, Inventory ni schema.

El generated TypeScript debe regenerarse posteriormente contra el backend que quede activo, nunca editarse a mano.

### Frontend

Los cambios pueden revertirse feature-wise:

- Production history puede retirarse manteniendo `/produccion/registrar`.
- Purchase history integration puede volver al read model anterior sin alterar Create/Receive/Cancel.
- Expense history route/tabs pueden retirarse conservando HU-020 Register.

### Navigation

Los targets pueden volver a sus rutas previas sin migración de datos.

## Success Criteria

### HU-008

- `/produccion` muestra historial.
- `/produccion/registrar` sigue operativo.
- Las tres cards usan datos server-side.
- `productionCount` representa eventos completos filtrados.
- `latestProduction` representa el evento filtrado más reciente.
- `mostProducedPreparation` usa frecuencia de eventos.
- No existe total físico cross-unit.
- Mes actual se aplica por defecto.
- Los cuatro filtros son server-side.
- Summary y list usan el mismo universo lógico.
- Pagination no altera summary.
- BatchCode real se muestra.
- Detail usa consumption snapshot histórico.
- CONTADORA puede leer pero no registrar.
- ADMIN/ENC/COCINA conservan Register CTA.
- Responsive y tests pasan.

### HU-019

- Existe un solo `/compras`.
- History endpoint/read model queda integrado.
- Default últimos 30 días.
- Period/Supplier/Status/Area funcionan server-side.
- No existe Responsible filter.
- UUID real se abrevia solo visualmente.
- Detail muestra full UUID.
- COCINA queda KITCHEN-only salvo ampliación multi-role real.
- CONTADORA es read-only.
- Create/Receive/Cancel siguen funcionando.
- Invalidations actualizan el nuevo history read model.
- Responsive y tests pasan.

### HU-021

- Existe `/gastos/historial`.
- `/gastos` continúa siendo Register.
- Navigation es role-aware.
- ADMIN/ENC tienen Register + History.
- CONTADORA solo History.
- Default mes actual.
- Filtros aprobados funcionan con contratos autorizados; Category aparece para ADMINISTRADOR, ENCARGADO y CONTADORA mediante el endpoint existente autorizado por `ExpenseCategoryRead`.
- D12 no concede a CONTADORA pura mutaciones de categorías ni Register Expense.
- Métricas usan valores backend y no current page.
- No aparece `TARDE`.
- No aparece saldo de caja ficticio.
- No existen export/edit/delete/reverse.
- Category null se maneja.
- Responsive y tests pasan.

### Cross-cutting

- No nueva migration.
- `has-pending-model-changes` limpio.
- No dependencia nueva.
- No existe cambio backend fuera de Production Summary y la inclusión explícita de CONTADORA en la policy existente `ExpenseCategoryRead`; no se añade endpoint, DTO, schema ni migration.
- Runtime OpenAPI contiene el endpoint summary.
- Generated TypeScript proviene del runtime OpenAPI.
- Full backend/frontend gates pasan.
- HU docs se actualizan con evidencia real.
