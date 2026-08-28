# Platform Contracts Specification

## Purpose

Asegurar notificaciones coherentes, migraciones aditivas y evidencia completa de validación.

## Requirements

### Requirement: Hub de asistencia y evento

El sistema SHALL exponer SignalR en `/hubs/attendance`, autenticado por JWT únicamente para rutas `/hubs/...`; REST SHALL NOT aceptar token de query por esa configuración. Solo `ADMINISTRADOR` o `ENCARGADO` pueden conectar. Tras check-in o check-out confirmado SHALL emitir `AttendanceUpdated` con AttendanceRecord; SignalR no SHALL sustituir REST.

#### Scenario: Notificación confirmada

- GIVEN un `ADMINISTRADOR` conectado y autorizado
- WHEN un check-in se confirma
- THEN recibe AttendanceUpdated con el record persistido.

### Requirement: Persistencia y notificación

La asistencia SHALL persistirse y confirmarse antes de notificar. Una respuesta 4xx SHALL NOT emitir evento. Si el notifier falla después del commit, SHALL conservarse el resultado persistido sin rollback.

#### Scenario: Fallo posterior

- GIVEN un notifier que falla tras un check-out confirmado
- WHEN se procesa la operación válida
- THEN el record queda cerrado.

### Requirement: Migraciones

Las migraciones SHALL ser aditivas respecto de `InitialIdentity`, preservar PK/FK string y esquema `identity`, y mapear negocio fuera de ese esquema. UserSession SHALL persistir solo hash del refresh token. La asistencia abierta SHALL usar índice único parcial por employeeId donde checkOutAt IS NULL. Las migraciones SHALL aplicar desde InitialIdentity y desde base vacía; Down SHALL ser razonable solo en bases descartables y nunca SHALL editar o revertir InitialIdentity.

#### Scenario: Upgrade de baseline

- GIVEN una base con InitialIdentity
- WHEN se aplican migraciones Sprint 1
- THEN AspNetUsers conserva PK string sin recreación.

### Requirement: OpenAPI y alcance completo de pruebas

OpenAPI SHALL describir todos los endpoints REST, DTOs, Bearer/cookies y sus status codes; no SHALL describir SignalR como REST. La suite SHALL probar integración PostgreSQL, migración limpia y upgrade, índice parcial y concurrencia; 401, 403, 404, 400 y cada 409 especificado (duplicado Category, mutación/baja de Unit canónica, baja de Unit/Category referenciada, conflicto Supplier aplicable, check-in abierto y check-out sin abierto); CRUD completo y DELETE soft delete de Categories, Units, Products y Suppliers; todos los filtros Product; DTO/semillas canónicas; matriz de roles; seeder Development/Production; login/refresh/logout/me; cookie Development localhost HTTP Secure=false y Production Secure=true; fullName en respuestas login/me; today con información Employee; aislamiento attendance/me; y notificación post-commit. Tras congelar OpenAPI, el único artefacto frontend SHALL ser `frontend/src/types/api.generated.ts`, generado por `pnpm run api:generate` sin edición manual.

#### Scenario: Cookie según entorno

- GIVEN login en Development por localhost HTTP y otro en Production
- WHEN se emite refreshToken
- THEN Secure es false en Development localhost HTTP y true en Production.
