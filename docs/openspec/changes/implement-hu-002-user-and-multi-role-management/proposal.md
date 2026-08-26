# Proposal

## Problem

HU-001 delivers authenticated sessions, role claims, protected routes and the HTTP/session foundation, but administrators cannot yet manage internal accounts or assign multiple explicit roles. The current access JWT is valid for 15 minutes without per-request account-security validation, so revoking a refresh token alone would leave stale permissions active.

## Scope

Implement HU-002 end-to-end for `ADMINISTRADOR` only:

- administrative list, search, filter, pagination, create, edit, multi-role assignment, activation/deactivation and password administration;
- creation of an Identity User and its linked Employee as one atomic operation;
- immediate/near-immediate revocation of target-user authorization after role, password or active-state mutations;
- `/usuarios`, a role-aware shared Sidebar/AppShell, and responsive users UI;
- OpenAPI-generated frontend contracts, tests, runtime validation, HU-002 documentation, flexible evidence and final real-diff file manifest.

## Confirmed product decisions

- `User != Employee`; account access and employee operational state remain separate.
- Create requires full name, username and one or more explicit canonical roles, without password, email, phone or photo.
- Canonical roles are `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA`, and `EMPLEADO`; `CAJERO` does not exist.
- Password administration is a separate administrator-only operation; no temporary password, forced change, forgot-password or self-service change.
- There is no hard delete. Activation and deactivation require UI confirmation.
- `/usuarios` is `ADMINISTRADOR` only. Sidebar navigation contains only implemented routes.
- Users list defaults to `pageSize=10` and supports a configurable size up to the existing project maximum of 100.
- Audit is lightweight: account `createdBy`/`updatedBy` derived from the authenticated actor; frontend never provides them.

## Technical direction

- Reuse Identity `SecurityStamp` through a safe fingerprint claim and `OnTokenValidated` account-security lookup; revoke all target `UserSession` rows on sensitive mutations.
- Reuse the existing `PagedResponse<T>` contract and ProblemDetails.
- Reuse HU-001 AuthProvider, session coordinator, guards, AppShell, HTTP client, TanStack Query, Tailwind, Lucide and SVGR; extend rather than replace them.
- Document ADR-007 for the cross-cutting SecurityStamp/session-revocation decision during APPLY documentation work. ADR-001 through ADR-006 already exist, so ADR-005 is not available.

## Visual authority

The five HU-002 image files were located (5/5) and inspected during remediation. They remain visual authority for desktop table, mobile cards, filters, role/status badges, dialogs, responsive behavior, loading and distinct empty states. Alex Saúl Fernandez Valdez accepted functional and responsive fidelity for MVP delivery after manual validation; minor visual polish is explicitly deferred. No screenshots are fabricated.

## Non-goals

No User/Employee merge, custom role CRUD, `CAJERO`, account registration, self-service credentials, email flows, MFA/OAuth, audit/event ledger, employee HR lifecycle, Caja UI, dashboard, future module pages, fake Sidebar routes, advanced sorting, full-text search, auth foundation rewrite, manual generated-type edits, or unrelated feature work.

## Risks

- Stale access tokens: mitigated by SecurityStamp fingerprint validation on every protected request.
- Last-admin race: mitigated by one PostgreSQL `SELECT ... FOR UPDATE` lock protocol.
- Partial User/Employee creation: mitigated by one explicit shared-DbContext transaction.
- Visual fidelity: resolved by human manual validation, not fabricated agent claims.
- OpenAPI/type divergence: generated only through `pnpm run api:generate` after backend contract stabilization.
