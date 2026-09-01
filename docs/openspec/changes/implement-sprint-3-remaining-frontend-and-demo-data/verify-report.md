# Verify Report — Sprint 3 Frontend Cash Closing (HU-026 / HU-027)

## Tasks

8/8 verified [x] with focused tests per task (see apply-progress.md).

## Baseline

- Branch: `develop`
- HEAD: `9236dd4905648c88c1ee1ae9e9df32ba2b2e1834`
- Working tree: clean (untracked `nul` ignored)
- Cash preview/close generated types present; no preexisting cash route

## Contracts

- `GET /api/v1/cash/preview` → `CashPreviewDto` 200/401/403/404 via `httpClient.get` + `useCashPreview` (404 no retry)
- `POST /api/v1/cash/close` → `CloseCashRequest{declaredCash, observation}` → `CashClosingDto` 201 via `httpClient.post` + `useCloseCash`
- `expectedCash` server-authoritative, PEDIDOSYA != EXTERNAL, `cashAmountCarriedForward` context only, payload only declared+observation verified by tests
- `403` CashManage, `409` CASH_ALREADY_CLOSED unique index, `404` NO_OPEN_CASH_SESSION — handled with safe copy when no code

## Authorization

- Route `/turnos/cierre` guarded by `RequireAnyRole([...SHIFT_MANAGE_ROLES])` (ADMINISTRADOR/ENCARGADO)
- MESERO/COCINA/CONTADORA/EMPLEADO denied, multi-role union PASS (route.test.tsx 9 cases)
- Entry CTA in `ShiftsPage` visible only via `SHIFT_MANAGE_ROLES` logic, no global nav duplicate

## Components

- `CashClosingPage`: sections Apertura / Medio pago / Canal / Gastos / Traspaso / Resultado; `expectedCash` highlighted; loading Skeleton/Spinner; error Retry; 404 empty state no zeroed form; declared input; provisional difference (Caja cuadrada/Sobrante/Faltante text+sign); observation conditional whitespace invalid; confirmation modal with responsible; pending disable; 400 keep values; 404 refetch; 409 invalidate+disable no retry; success with `CashClosingDto` + CTA Volver a Turnos / Caja

## Responsive / A11y

- Grid `md:grid-cols-2 xl:grid-cols-3`, stack mobile 360px, no horizontal overflow (code)
- Labels associated, keyboard/focus trap modal, no color-only difference, touch min-h-10, currency es-BO BOB, date America/La_Paz
- Manual viewport: PENDING_EXTERNAL (no browser in this runtime) — code ready for 360/768/1280

## Tests

- `frontend/src/features/cash/api.test.ts` — 5/5 PASS
- `frontend/src/features/cash/CashClosingPage.test.tsx` — 15/15 PASS (HU-026 5 + HU-027 10)
- `frontend/src/features/cash/route.test.tsx` — 9/9 PASS
- Full frontend: 31 files 166 tests PASS

## Quality Gates

- `pnpm run format:check` PASS
- `pnpm run typecheck` PASS
- `pnpm run lint` PASS
- `pnpm test` PASS (31/31 files, 166/166)
- `pnpm run build` PASS (2161 modules, 941k JS gzip 282k)
- `git diff -- backend` NONE
- `git diff -- frontend/src/types/api.generated.ts` NONE
- `git diff --check` PASS
- Dependencies added: NONE

## Documentation

- `docs/historias/HU-026-sprint3-backend.md` — backend reused + frontend implemented
- `docs/historias/HU-027-sprint3-backend.md` — backend reused + frontend implemented
- `apply-progress.md` — updated with evidence
- History/PDF/print/report: NOT IMPLEMENTED verified

## Scope Exclusions Verified

- HU-028 `/cash/closings` not implemented
- Reports/PDF/CSV/XLSX/print not implemented
- No new role CAJERO, no CONTADORA closing
- No multiple cash sessions

## Remaining Gaps

- `MANUAL_RESPONSIVE_VALIDATION: PENDING_EXTERNAL` — only gap, does not block code/tests/build

## Verdict

PASS
