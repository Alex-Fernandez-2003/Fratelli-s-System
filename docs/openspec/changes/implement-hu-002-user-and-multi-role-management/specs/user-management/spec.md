# User management

## Requirements

### UM-01 — Administrator-only user management

All `/api/v1/users` operations SHALL require authentication and the `UsersManage` policy, granted only to `ADMINISTRADOR`. Other canonical roles SHALL receive 403 ProblemDetails; frontend visibility is not authorization.

#### Scenario: non-administrator calls API

- **Given** an authenticated `ENCARGADO`
- **When** it calls `GET /api/v1/users`
- **Then** the API returns 403 ProblemDetails.

### UM-02 — Canonical explicit roles

The system SHALL accept only `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA`, and `EMPLEADO`. A request SHALL contain at least one distinct canonical role. Each selected role represents exactly itself; no implicit role is added and `CAJERO` is invalid.

#### Scenario: multi-role assignment

- **Given** a valid request with `ENCARGADO` and `EMPLEADO`
- **When** the account is created or updated
- **Then** exactly those roles are assigned.

### UM-03 — Separate and atomic account creation

User and Employee SHALL remain separate entities. `POST /api/v1/users` accepts only `fullName`, `username`, and `roles`, creates an Identity User without password, assigns roles through `UserManager.AddToRolesAsync`, and creates the linked Employee in one transaction. Any failed leg SHALL roll back all legs.

#### Scenario: Employee persistence fails

- **Given** User creation and role assignment succeeded inside the transaction
- **When** Employee insertion fails
- **Then** no Identity User, role assignment, or Employee remains committed.

### UM-04 — Safe administrative read model

`UserDto` SHALL expose only `id`, `employeeId`, `fullName`, `username`, `roles`, `isActive`, and `hasPassword`. It SHALL not expose PasswordHash, SecurityStamp, ConcurrencyStamp, sessions or actor metadata.

### UM-05 — List, search and pagination

`GET /api/v1/users` SHALL accept `page`, `pageSize`, optional trimmed `search`, optional canonical `role`, and optional `isActive`. It SHALL reuse `PagedResponse<T>` with `items`, `page`, `pageSize`, `totalCount`, `totalPages`; default pageSize is 10 and maximum is 100. Search SHALL match username and full name case-insensitively with PostgreSQL-compatible behavior. Filters combine and a multi-role account matches each assigned-role filter.

#### Scenario: combined query

- **Given** an active user with `ENCARGADO` and `EMPLEADO`
- **When** list is filtered by trimmed case-insensitive search, role `EMPLEADO`, and active status
- **Then** that user is included with correct pagination metadata.

### UM-06 — Detail and update

`GET /api/v1/users/{id}` SHALL return 404 for a missing stable Identity UserId. `PUT /api/v1/users/{id}` SHALL replace editable `fullName`, `username`, and complete `roles`; it shall not change password or account active state. Duplicate usernames return 409. A name update keeps Employee.FullName aligned with the existing linkage.

### UM-07 — Lightweight account actor audit

The Identity account storage SHALL carry server-owned nullable `CreatedByUserId` and `UpdatedByUserId` shadow properties. Creation sets both from the authenticated admin; every account mutation sets updatedBy. Requests and DTOs SHALL not make them client writable. Employee employment storage SHALL not be used for account audit.

### UM-08 — User-management errors

Invalid payload/role/paging returns 400, missing user 404, duplicate username and business/concurrency conflicts 409, and all errors use existing ProblemDetails.
