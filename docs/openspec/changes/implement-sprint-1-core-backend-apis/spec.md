# Especificaciones del change: Sprint 1 Core Backend APIs

Las especificaciones ejecutables se dividen por capacidad:

| Capacidad | Archivo |
|---|---|
| Identidad, autenticación y autorización | `specs/identity-access/spec.md` |
| Catálogo | `specs/catalog/spec.md` |
| Proveedores | `specs/suppliers/spec.md` |
| Asistencia y consulta propia | `specs/attendance/spec.md` |
| Tiempo real, persistencia y validación | `specs/platform-contracts/spec.md` |

## Límites del change

El sistema SHALL entregar únicamente backend y el tipo generado `frontend/src/types/api.generated.ts` tras congelar OpenAPI. No SHALL entregar páginas, hooks, formularios ni otra funcionalidad frontend, ni HU-002, HU-004, HU-005 o HU-024 completos.

La discrepancia histórica sobre claves GUID de Identity, el automarcado de asistencia y los documentos de seguridad, CI y tiempo real SHALL permanecer registrados como deuda documental diferida; esta especificación prevalece para Sprint 1.
