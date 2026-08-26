# Delivery contract

## Requirements

### DC-01 — OpenAPI is the frontend contract

Users endpoints SHALL publish requests, successful responses, pagination, authorization and 400/401/403/404/409 ProblemDetails metadata. APPLY order is backend contract and tests, OpenAPI inspection, `pnpm run api:generate`, then frontend generated-type consumption. `frontend/src/types/api.generated.ts` SHALL never be manually edited.

### DC-02 — Test and runtime evidence

Backend build/tests, frontend format check/typecheck/lint/tests/build and generated-contract consistency SHALL use actual repository scripts. PostgreSQL-dependent transaction, lock, constraint and Identity tests SHALL use PostgreSQL, not EF InMemory or SQLite. Runtime validation uses a disposable PostgreSQL database; it covers admin access, list, passwordless create, first password, target login, role-change/deactivate revocation, reactivate, filters and frontend refresh.

### DC-03 — Documentation and ADR

After APPLY, HU-002 documentation SHALL describe actual behavior, security/session invalidation, tests, runtime and status. `docs/adr/ADR-007-security-stamp-session-revocation.md` SHALL record the approved fingerprint/per-request/revoke-all design and rejected alternatives. No ADR is created during SDD correction.

### DC-04 — Real-diff manifest and flexible evidence

At the end of APPLY, HU-002 SHALL contain complete tables for all versioned modified Backend files, Frontend files, and applicable Documentation/configuration/transversal files, each with purpose, generated from the real final diff. Its evidence section SHALL be open and contain only real artifacts selected by the user; no arbitrary screenshot quota or fabricated image proof is allowed.

### DC-05 — Approved visual validation workflow

The five source image files are located but not directly visually inspectable with this Pi tooling. Implementation SHALL follow approved visual requirements recorded in the briefing; structural responsive/component testing provides automated evidence and the user provides final manual visual-fidelity validation.
