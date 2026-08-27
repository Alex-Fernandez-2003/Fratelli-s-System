# HU-002 — Gestión de usuarios y múltiples roles

## Resultado

**IMPLEMENTADA END-TO-END**. `ADMINISTRADOR` administra cuentas en `/usuarios`: listado paginado, búsqueda, filtros, alta sin contraseña, edición multirol, contraseña separada y activación/desactivación sin borrado físico.

## Reglas implementadas

- Roles: `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA` y `EMPLEADO`; no existe `CAJERO`.
- Crear requiere nombre, username y uno o más roles; `hasPassword` lo deriva el servidor.
- Las operaciones protegen al propio administrador y al último administrador activo; `User` y `Employee` no sincronizan su estado.
- La navegación muestra todos los módulos autorizados, no solo Inicio y Usuarios.

## Seguridad

El JWT contiene la revisión privada `rst`; la cuenta activa y el `SecurityStamp` se comprueban en cada validación. Roles, contraseña y ciclo de cuenta invalidan sesiones objetivo según ADR-007; no se exponen hashes ni tokens.

## Frontend y validación

La ruta `/usuarios` usa contrato OpenAPI generado, `httpClient`, TanStack Query, filtros backend-driven, tabla desktop, cards mobile y diálogos accesibles.

## Baseline revalidado

`develop` revalidado en `bb2fd04a48bddce1b608bb1639308528daefcfc1`.

## Evidencia real

- Backend: `dotnet test backend/RestaurantSystem.slnx --no-restore` — 34/34 PASS; build PASS (solo advertencia preexistente NU1903 de SSH.NET).
- Frontend: format, typecheck, lint, Vitest 38/38 y build PASS.
- OpenAPI: `pnpm run api:generate` ejecutado dos veces contra `http://localhost:5057/openapi/v1.json`, con hash idéntico.
- Referencias visuales HU-002 inspeccionadas y validación humana aceptada; no se agregan capturas fabricadas.

## Manifest de archivos del change

### Backend

| Archivo |
| --- |
| `backend/src/RestaurantSystem.Api/Program.cs` |
| `backend/src/RestaurantSystem.Application/Users/UserContracts.cs` |
| `backend/src/RestaurantSystem.Infrastructure/Users/UserManagementService.cs` |
| `backend/src/RestaurantSystem.Infrastructure/Migrations/20260825172249_AddUserAccountAudit.cs` |

### Frontend y contrato generado

| Archivo |
| --- |
| `frontend/src/features/users/api/queries.ts` |
| `frontend/src/features/users/pages/UsersPage.tsx` |
| `frontend/src/features/navigation.tsx` |
| `frontend/src/routes/AppRoutes.tsx` |
| `frontend/src/types/api.generated.ts` |

### Documentación

| Archivo |
| --- |
| `docs/adr/ADR-007-security-stamp-session-revocation.md` |
| `docs/historias/HU-002-gestion-usuarios-y-multiples-roles.md` |

## Estado de entrega

Completado para MVP; el ajuste visual menor permanece diferido.

## Evidencias

### Captura de la pantalla pricipal de usuarios y roles

![Captura de usuarios y roles](../capturas/HU-002-users-page.png)

---

### Captura de vista para celulares

![Captura de vista mobile](../capturas/HU-002-mobile-page.png)

---

### Captura de modal para agregar usuario

![Captura modal para agregar usuario](../capturas/HU-002-modal-user.png)

---

### Captura de modal para cambiar/asignar contraseña

![Captura modal para cambiar contraseña](../capturas/HU-002-modal-password.png)

---

## Estado de entrega

Completado para MVP, ajustes visuales se harán luego
