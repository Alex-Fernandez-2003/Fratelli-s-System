# HU-001 — Iniciar y cerrar sesión

## Resultado

Implementada end-to-end: autenticación por usuario y contraseña, sesión renovable y cierre de sesión.

## Reglas implementadas

- `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` y `GET /auth/me` conforman el flujo.
- El access token JWT dura 15 minutos; el refresh rota y tiene un límite absoluto de sesión de 12 horas.
- El refresh se persiste solo como hash. Cuentas desconocidas, credenciales incorrectas, inactivas o bloqueadas se rechazan.

## Seguridad

La cookie `refreshToken` es `HttpOnly`, `SameSite=Strict` y se limita a `/api/v1/auth`; es `Secure` fuera de Development. La validación JWT comprueba la cuenta activa y la revisión de seguridad. Véanse ADR-004 y ADR-007.

## Frontend y validación

El frontend usa la API de autenticación, `AuthProvider`, rutas protegidas, `http-client` y el coordinador de sesión; no persiste el JWT como credencial de larga duración.

## Baseline revalidado

`develop` revalidado en `bb2fd04a48bddce1b608bb1639308528daefcfc1`.

## Evidencia real

No se modifica ni incorpora evidencia técnica durante esta normalización.

## Manifest de archivos del change

### Backend

| Archivo |
| --- |
| `backend/src/RestaurantSystem.Api/Program.cs` |
| `backend/src/RestaurantSystem.Application/Auth/AuthContracts.cs` |
| `backend/src/RestaurantSystem.Infrastructure/Identity/AuthServices.cs` |

### Frontend y contrato generado

| Archivo |
| --- |
| `frontend/src/features/auth/api.ts` |
| `frontend/src/features/auth/AuthProvider.tsx` |
| `frontend/src/routes/AppRoutes.tsx` |
| `frontend/src/lib/api/http-client.ts` |
| `frontend/src/lib/auth/session-coordinator.ts` |

### Documentación

| Archivo |
| --- |
| `docs/adr/ADR-004-identity-jwt-roles.md` |
| `docs/adr/ADR-007-security-stamp-session-revocation.md` |
| `docs/historias/HU-001-iniciar-cerrar-sesion.md` |

## Estado de entrega

Implementada; esta normalización no añade validación ni evidencia nueva.

## Evidencias

### Captura del login

![Captura del login](../capturas/HU-001-login.png)

---

### Captura de usuario logueado

![Captura de usuario autenticado](../capturas/HU-001-roles.png)
