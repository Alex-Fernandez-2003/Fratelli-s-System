# HU-027 — Cierre final atómico de caja

## Resultado

**BACKEND COMPLETO + FRONTEND IMPLEMENTADO** — `implement-sprint-3-remaining-frontend-and-demo-data`

Backend reused sin modificaciones. Frontend productivo de cierre (declared/observation/confirm/409/success) dentro del mismo change.

## Reglas implementadas

Ver `docs/openspec/changes/implement-sprint-3-remaining-frontend-and-demo-data/spec.md` y `design.md`. Diferencia provisional `declared-expected` solo para UX, autoridad final `CashClosingDto.difference`. Observación requerida si diferencia != 0 (whitespace inválido). Confirmación explícita antes de POST. Pending bloquea doble submit. 409 sin retry, invalidate/refetch, estado no disponible.

## Seguridad

`CashManage` server-side (ADMINISTRADOR/ENCARGADO). Frontend guard `SHIFT_MANAGE_ROLES` en route y CTA. Multi-role unión. `closedByUserId` contractual, nombre via `AuthProvider`.

## Backend / contrato (reused)

- `POST /api/v1/cash/close` body `CloseCashRequest{declaredCash, observation?}` → `CashClosingDto` 201; 400 validation, 404 NO_OPEN_CASH_SESSION, 409 CASH_ALREADY_CLOSED (23505 unique)

## Frontend — implementado

### Form

- `declaredCash` string → parse con normalización coma/punto, validación empty/inválido/negativo, cero permitido
- `provisionalDifference = declared - expectedCash` para UX, display `Caja cuadrada` / `Sobrante +X Bs` / `Faltante -X Bs` (texto+signo+monto, no solo color)
- `observation` textarea condicional: optional si 0, required si ≠0; whitespace-only invalid
- `expectedCash`, ventas, gastos, apertura read-only

### Confirmación

- Modal `Confirmar cierre de caja` muestra `businessDate`, `expectedCash`, `declaredCash`, `provisionalDifference`, `observation`, `responsibleName`; copy `Confirma que los datos del cierre son correctos. Una vez registrado, el cierre no podrá editarse.` + Cancelar / Registrar cierre; focus trap y cierre via Escape/overlay

### POST

- Solo `declaredCash` (number) + `observation` (trimmed|null). No se envía `expectedCash/difference/sales/expenses`
- `useCloseCash` → `POST /api/v1/cash/close`; pending disable + spinner + prevent double click
- 400 mantiene form values y mapea ProblemDetails, 404 refetch preview y mensaje seguro, 409 invalidate `cashKeys.preview` + `shiftKeys.context/mine`, warning `La caja ya fue cerrada.`, deshabilita form
- Success usa `CashClosingDto` autoritativo y muestra `businessDate`, `expectedCash`, `declaredCash`, `difference`, `observation`, `closedAt`, `closedByUserId` + nombre visible; mensaje `Cierre registrado correctamente.` + CTA principal `Volver a Turnos / Caja`, secundaria `Ir al Inicio`; invalidate queries `cash preview` + `shift context/mine` sin global invalidate

### Tests

- `api.test.ts` — close endpoint + exact request + invalidation + 409 no retry
- `CashClosingPage.test.tsx` — 10 HU-027 casos: declared input, zero/positive/negative diff, conditional observation, whitespace, modal payload, pending block, success, 400/404/409, closed user

## Baseline revalidado

Branch `develop` HEAD `9236dd4905648c88c1ee1ae9e9df32ba2b2e1834`. `pnpm` 11.18.0. `api.generated.ts` 179K sin edición. `git diff -- backend` NONE.

## Evidencia real

- `pnpm run format:check` PASS
- `pnpm run typecheck` PASS
- `pnpm run lint` PASS
- `pnpm test` 31 files 166 tests PASS (cash focused)
- `pnpm run build` PASS (2161 modules)
- `POST /api/v1/cash/close` 201/400/404/409 via `httpClient`, payload exact verified por test

## Manifest

| Archivo | Propósito |
| --- | --- |
| `frontend/src/lib/api/endpoints.ts` | cash close registry |
| `frontend/src/features/cash/api.ts` | close hook + invalidation |
| `frontend/src/features/cash/CashClosingPage.tsx` | form/confirm/success HU-027 |
| `frontend/src/routes/AppRoutes.tsx` | guard `/turnos/cierre` |
| `frontend/src/features/shifts/ShiftsPage.tsx` | CTA entry |
| `frontend/src/features/cash/route.test.tsx` | auth matrix (7 roles + multi) |

## Estado de entrega

`HU_027_BACKEND_COMPLETE: YES` — `HU_027_FRONTEND_COMPLETE: YES` — `READY_FOR_DELIVERY: YES`
