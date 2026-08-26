# Account lifecycle

## Requirements

### AL-01 — Passwordless creation and safe credential state

A newly created account SHALL have no password. `hasPassword` SHALL be a read-only server-derived boolean: false maps to **Establecer contraseña** and true to **Restablecer contraseña**. Active status and password presence are independent.

#### Scenario: active account without credential

- **Given** a newly created active account
- **When** password login is attempted before an administrator sets a password
- **Then** login fails with the existing generic authentication response.

### AL-02 — Administrator password operation

Only ADMINISTRADOR can call `PUT /api/v1/users/{id}/password` with `newPassword`. The server SHALL use `UserManager.AddPasswordAsync` for first password and the supported administrator reset-token + `ResetPasswordAsync` flow for replacement. It SHALL not write PasswordHash directly or return/log a password/hash. Identity password APIs provide the single SecurityStamp rotation; all target refresh sessions are revoked after success.

#### Scenario: replacement password

- **Given** an existing password
- **When** an administrator sets a valid replacement
- **Then** the old password no longer authenticates, `hasPassword` remains true, and prior target sessions are revoked.

### AL-03 — Explicit activation state

Identity account `IsActive` SHALL be changed only through `POST /api/v1/users/{id}/activate` and `/deactivate`, both idempotent 204 actions. Neither action changes Employee.IsActive or creates a password. Both update account updatedBy, rotate SecurityStamp once and revoke all target UserSessions.

#### Scenario: activation without password

- **Given** an inactive account with no password
- **When** it is activated
- **Then** it remains unable to password-login until a password is set.

### AL-04 — Self-protection and last-admin invariant

The backend SHALL reject self-deactivation and self-removal of ADMINISTRADOR with 409. It SHALL preserve at least one active Identity account holding ADMINISTRADOR under concurrent dangerous mutations.

#### Scenario: last administrator

- **Given** one active ADMINISTRADOR remains
- **When** a request deactivates it or removes its ADMINISTRADOR role
- **Then** the request returns 409 and the account remains recoverable.

### AL-05 — One lock protocol for dangerous mutations

Deactivation of an admin and role updates that remove ADMINISTRADOR SHALL use a `ReadCommitted` transaction and `SELECT ... FOR UPDATE` on the canonical ADMINISTRADOR role row before reloading target/roles and recounting active admins. Lock cancellation/deadlock/concurrency conflict returns controlled 409 without automatic mutation retry.

#### Scenario: concurrent dangerous mutations

- **Given** two active administrators
- **When** concurrent requests attempt dangerous mutations against each one
- **Then** at most one can commit if both would leave zero active administrators.
