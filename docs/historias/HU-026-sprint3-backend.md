# HU-026 — Preview autoritativo de cierre

## Resultado

**BACKEND COMPLETO + FRONTEND IMPLEMENTADO** — `implement-sprint-3-remaining-frontend-and-demo-data`

Backend reused sin modificaciones. Frontend productivo de preview operativo dentro del mismo change.

## Reglas implementadas

Ver `docs/openspec/changes/implement-sprint-3-remaining-frontend-and-demo-data/spec.md` y `design.md` para reglas normativas congeladas de HU-026. La fuente de verdad es `CashPreviewDto.expectedCash` (servidor).

## Seguridad

Autorización server-side `CashManage` (ADMINISTRADOR/ENCARGADO). Frontend guard `RequireAnyRole([...SHIFT_MANAGE_ROLES])` en `/turnos/cierre`. Multi-role = unión. Backend tetap authority.

## Backend / contrato (reused)

### Endpoints

- `GET /api/v1/cash/preview` → `CashPreviewDto` read-only, no persiste, `expectedCash = opening+petty+CASH-drawer-petty-removed`

### DTOs

`CashPreviewDto` con `cashSessionId`, `businessDate`, `openingAmount`, `pettyCashOpeningAmount`, `cashRemovedAmount`, `cashAmountCarriedForward`, `salesTotal`, `cashSalesTotal`, `qrSalesTotal`, `externalSalesTotal`, `directSalesTotal`, `pedidosYaSalesTotal`, `cashDrawerExpensesTotal`, `pettyCashExpensesTotal`, `expensesTotal`, `expectedCash`, `shifts`.

## Frontend — implementado

### Routing

- `frontend/src/routes/AppRoutes.tsx` — `/turnos/cierre` bajo `SHIFT_MANAGE_ROLES`
- `frontend/src/features/shifts/ShiftsPage.tsx` — CTA `<Link to="/turnos/cierre">Cerrar caja general</Link>`
- `frontend/src/features/navigation.tsx` — reuse `Turnos / Caja` sin duplicar item global

### Cash feature

- `frontend/src/lib/api/endpoints.ts` — `cash.preview` = `/api/v1/cash/preview`
- `frontend/src/features/cash/api.ts` — `cashKeys.preview`, `cashApi.preview`, `useCashPreview` (404 no retry, stale 15s), `cashErrorMessage`
- `frontend/src/features/cash/format.ts` — `formatMoney` es-BO BOB, `formatBusinessDateLong` America/La_Paz
- `frontend/src/features/cash/CashClosingPage.tsx` — secciones Apertura / Ventas por medio (Efectivo/QR/Externo) / Ventas por canal (Directo/PedidosYa) / Gastos (principal/chica) / Traspaso (retirado + carriedForward como contexto, no re-sumado) / Resultado `expectedCash` con alta jerarquía; states loading (Skeleton/Spinner), error recuperable con Retry, 404 `No hay una caja abierta disponible para cerrar.` sin ceros ficticios

### Tests

- `frontend/src/features/cash/api.test.ts` — preview endpoint + keys
- `frontend/src/features/cash/CashClosingPage.test.tsx` — loading, 404, error retry, payment/channel separation, carriedForward hidden when null

## Baseline revalidado

Branch `develop` HEAD `9236dd4905648c88c1ee1ae9e9df32ba2b2e1834`. `pnpm` 11.18.0. `GET /api/v1/cash/preview` y `POST /api/v1/cash/close` presentes en `api.generated.ts` (179K). No existe `cash` feature preexistente. `git diff -- backend` NONE, `api.generated.ts` NONE.

## Evidencia real

- `pnpm run format:check` PASS
- `pnpm run typecheck` PASS
- `pnpm run lint` PASS
- `pnpm test` 31 files 166 tests PASS (cash focused 5+14+9)
- `pnpm run build` PASS (2161 modules)
- `GET /api/v1/cash/preview` 200/401/403/404 via `httpClient` + TanStack Query
- `expectedCash` server-authoritative, PEDIDOSYA != EXTERNAL verified by test

## Manifest

| Archivo | Propósito |
| --- | --- |
| `frontend/src/lib/api/endpoints.ts` | cash preview/close registry |
| `frontend/src/features/cash/api.ts` | query layer |
| `frontend/src/features/cash/format.ts` | money/date helpers |
| `frontend/src/features/cash/CashClosingPage.tsx` | preview HU-026 (reuse shared Card/Button/Input/Alert/EmptyState/Modal/Spinner) |
| `frontend/src/routes/AppRoutes.tsx` | `/turnos/cierre` guard |
| `frontend/src/features/shifts/ShiftsPage.tsx` | entry point CTA |

## Estado de entrega

`HU_026_BACKEND_COMPLETE: YES` — `HU_026_FRONTEND_COMPLETE: YES` — `READY_FOR_DELIVERY: YES`
