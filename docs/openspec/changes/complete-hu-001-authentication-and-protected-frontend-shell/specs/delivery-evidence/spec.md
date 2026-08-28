# Delivery, documentation, and evidence specification

## Requirements

### Requirement: Implementation quality is demonstrable

The completed frontend SHALL pass its repository quality gates from `frontend/`:

```bash
pnpm run format:check
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

When the backend is running in Development and exposes its configured OpenAPI document, implementers SHALL run `pnpm run api:generate`; any generated diff SHALL be reviewed against the existing backend contract and not manually edited.

### Requirement: Critical lifecycle behavior is tested

Vitest/React Testing Library coverage SHALL test memory-only lifecycle, refresh success/rejection, stale generation completion, five-concurrent-401 single-flight, Bearer rebuild and one retry, 403/non-401 no-refresh behavior, bootstrap/no-Login-flash, auth/role route decisions, password toggle accessibility, and successful/failed logout cache behavior. Tests SHALL not mock persistent token storage as a supported mechanism.

### Requirement: Documentation describes the delivered boundary

After successful implementation, `frontend/README.md` and `frontend/docs/manual-de-uso.md` SHALL document the final shared client/auth API, automatic Bearer and bounded refresh policy, exact roles/route usage, memory-only rule, `HttpError`/403 handling, and the rule that business features do not use direct `fetch` or token arguments. `docs/historias/HU-001-iniciar-cerrar-sesion.md` SHALL be updated only with observed end-to-end completion facts, tests, commands, and evidence.

### Requirement: Evidence is real and traceable

After runtime validation, `docs/capturas/` SHALL contain only real captures for the delivered frontend scope. The final HU-001 documentation SHALL link each capture to login, responsive UI, protected bootstrap/F5, denial, or logout behavior it actually demonstrates. No planned, mocked, or backend-only capture SHALL be presented as frontend completion evidence.

### Requirement: Scope is checked before completion

Final review SHALL confirm no backend, migration, endpoint/OpenAPI-contract, unrelated module, persistent JWT storage, cross-tab coordination, or dashboard/KPI work was introduced.
