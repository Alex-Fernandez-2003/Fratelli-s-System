# Apply Progress — Sprint 3 Frontend Cash Closing (HU-026 / HU-027)

## Baseline (Task 1)

- Branch: `develop`
- HEAD: `9236dd4905648c88c1ee1ae9e9df32ba2b2e1834`
- Status: clean (untracked `nul` ignored), no staged changes
- Frontend: `frontend/package.json` scripts confirmed (`format:check`, `typecheck`, `lint`, `test`, `build`)
- Routing: `AppRoutes.tsx` has `/turnos` + `/mi-turno` under `SHIFT_MANAGE_ROLES` / `SHIFT_OWN_READ_ROLES`, no cash route preexist
- Shifts: `ShiftsPage.tsx` shows placeholder hint for HU-026/HU-027, `SHIFT_MANAGE_ROLES = ['ADMINISTRADOR','ENCARGADO']`
- Generated API: `frontend/src/types/api.generated.ts` contains `GET /api/v1/cash/preview` → `CashPreviewDto`, `POST /api/v1/cash/close` → `CloseCashRequest`/`CashClosingDto`, `CashClosingDto.closedByUserId` only (no display name)
- Backend ProblemDetails audited: preview 404 = no open cash session (no code), close 400 validation, 404 `NO_OPEN_CASH_SESSION`, 409 `CASH_ALREADY_CLOSED` (unique index 23505), 403 for CashManage
- HTTP client: `httpClient` + `HttpError` with `ProblemDetails`, no direct fetch
- Auth: `AuthProvider` + `RequireAnyRole`, multi-role union

## Task 2 — Cash API/query

- Files:
  - `frontend/src/lib/api/endpoints.ts` — added `cash.preview` / `cash.close`
  - `frontend/src/features/cash/api.ts` — `cashKeys`, `cashApi.preview/close`, `useCashPreview` (404 no retry), `useCloseCash` (invalidates `cashKeys.preview` + `shiftKeys.context/mine` on success and on 409, no retry), `cashErrorMessage`
  - `frontend/src/features/cash/api.test.ts` — 5 tests: preview endpoint, close endpoint exact request, invalidation on success, 409 no retry + invalidation, deterministic keys
- Tests: 5/5 PASS via `api.test.ts`

## Task 3 — HU-026 Preview

- Files:
  - `frontend/src/features/cash/format.ts` — `formatMoney` (es-BO BOB), `formatBusinessDateLong` (America/La_Paz), `formatDateTime`, `parseDeclaredCash`, `differenceLabel`
  - `frontend/src/features/cash/CashClosingPage.tsx` — server-authoritative `expectedCash` display, payment section (CASH/QR/EXTERNAL) separate from channel section (DIRECT/PEDIDOSYA), apertura, gastos, traspaso (removed + carriedForward context, never re-added), resultado highlighted, loading Skeleton/Spinner, recoverable error with Retry, 404 operational empty state
  - `frontend/src/features/cash/CashClosingPage.test.tsx` — HU-026 cases
- Evidence: payment/channel separation test, carriedForward null test, loading/404/retry tests PASS

## Task 4 — HU-027 Form & Confirmation

- Same `CashClosingPage.tsx`: `declaredCash` string input, provisional `declared-expected` diff (Caja cuadrada / Sobrante +X / Faltante -X with text+sign, not color-only), observation conditional required (whitespace invalid), confirmation Modal with businessDate/expected/declared/diff/observation/responsible, payload only `declaredCash+observation`
- Tests: zero/positive/negative difference, whitespace, modal data, exact payload PASS

## Task 5 — Mutation / Conflict / Success

- `CashClosingPage.tsx` handles pending (disable + loading, prevent double submit), 400 keep values, 404 refetch, 409 invalidate + disable + warning no retry, success renders `CashClosingDto` authoritative values (`difference`, `closedByUserId`, `closedAt`) and invalidates `cashKeys.preview` + shift context
- Tests: pending disable, success, 409 conflict state PASS

## Task 6 — Routing / Entry / Auth

- Files:
  - `frontend/src/routes/AppRoutes.tsx` — added `/turnos/cierre` under `RequireAnyRole([...SHIFT_MANAGE_ROLES])`
  - `frontend/src/features/shifts/ShiftsPage.tsx` — replaced disabled button with `<Link to="/turnos/cierre">Cerrar caja general</Link>` CTA role-aware via `SHIFT_MANAGE_ROLES`
  - `frontend/src/features/cash/route.test.tsx` — 9 tests: ADMIN/ENCARGADO allowed, MESERO/COCINA/CONTADORA/EMPLEADO denied, multi-role union, CTA visibility
- Auth reuse: `SHIFT_MANAGE_ROLES` only, no new role

## Task 7 — Responsive / Accessibility

- Layout: `grid gap-4 md:grid-cols-2 xl:grid-cols-3` for preview, stack mobile, no horizontal overflow
- Money formatting `es-BO` BOB everywhere, businessDate via `America/La_Paz` helper
- Labels associated via `FormField`, keyboard/focus via `Modal` trap + focus return, CTA min-h-10, difference text+sign, alert semantics
- Manual viewport validation: PENDING_EXTERNAL (no browser in this runtime), code-ready for 360/768/1280

## Task 8 — Gates & Docs

- Gates:
  - `pnpm run format:check` PASS (after `format`)
  - `pnpm run typecheck` PASS
  - `pnpm run lint` PASS
  - `pnpm test` 31 files 166 tests PASS
  - `pnpm run build` PASS (2161 modules)
  - `git diff -- backend` NONE
  - `git diff -- frontend/src/types/api.generated.ts` NONE
  - `git diff --check` PASS
- Docs updated: `docs/historias/HU-026-sprint3-backend.md`, `docs/historias/HU-027-sprint3-backend.md` (frontend implemented, backend reused)
- Verify: `verify-report.md` created

## Scope Exclusions Verified

- HU-028 history `/cash/closings` not implemented
- No PDF/CSV/XLSX/print/report
- No dependencies added
- No backend/migration changes
- No generated API manual edit

## Next

- Manual responsive validation external
- Archive after manual validation
