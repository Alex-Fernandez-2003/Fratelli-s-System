# HU-023 — Historial propio de asistencia

## Resultado

**APPLY COMPLETADO — BACKEND + FRONTEND IMPLEMENTADOS**

Este bloque implementa HU-023 en `/mi-asistencia` para cualquier rol autenticado con un `Employee` vinculado. La identidad se resuelve server-side: el llamador no selecciona `EmployeeId`.

## Reglas y referencias históricas

Ver `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/spec.md` y `design.md` para las reglas normativas congeladas de HU-023. `apply-progress.md` y `verify-report.md` del change archivado se conservan como referencias históricas; el `verify-report.md` del cambio actual registra `PASS_WITH_MANUAL_EVIDENCE_DEFERRED`; la revisión ordinaria receipt-driven permanece desactivada y la evidencia manual responsive/accessibility permanece `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

## Contrato y seguridad

### Asistencia propia

| Endpoint | Comportamiento |
| --- | --- |
| `POST /api/v1/attendance/me/check-in` | Check-in ligado a la identidad autenticada |
| `POST /api/v1/attendance/me/check-out` | Check-out ligado a la identidad autenticada |
| `GET /api/v1/attendance/me/current` | Estado actual propio |
| `GET /api/v1/attendance/me?from=&to=&page=&pageSize=` | Historial propio enriquecido; no acepta `employeeId` |

El backend es la autoridad para el lifecycle de asistencia, el snapshot de horario, la puntualidad y `workedMinutes`. La autorización permanece server-side.

### Contratos administrativos existentes

Los endpoints gestionados `/api/v1/attendance/employees/{employeeId}/...` conservan la policy `AttendanceManage`, disponible para `ADMINISTRADOR` y `ENCARGADO`. El contrato y la policy backend de HU-024 en `/api/v1/attendance/admin` se reutilizan sin cambios.

## Backend aplicado

| Archivo | Propósito |
| --- | --- |
| `backend/src/RestaurantSystem.Infrastructure/Attendance/AttendanceServices.cs` | Resolución de asistencia propia (`MineAsync`) |
| `backend/src/RestaurantSystem.Api/Program.cs` | Policy `AttendanceSelf` |
| `backend/tests/RestaurantSystem.IntegrationTests/AttendancePostgresIntegrationTests.cs` | Own-only y 404 sin `Employee` vinculado |

## Frontend aplicado

| Área | Archivos / propósito |
| --- | --- |
| Asistencia propia | `frontend/src/features/attendance/api.ts`, `hooks.ts`, `format.ts`, `frontend/src/pages/MyAttendancePage.tsx` |
| Vista administrativa y operaciones HU-022 | `frontend/src/features/attendance/AdministrativeAttendancePage.tsx`, `AttendanceTodayPage.tsx`; `/asistencia` es read-only y `/asistencia/hoy` conserva las operaciones de HU-022 |
| Rutas, navegación e Inicio | `frontend/src/routes/AppRoutes.tsx`, `frontend/src/features/navigation.tsx`, `frontend/src/pages/InicioPage.tsx`, `frontend/src/lib/api/endpoints.ts` |
| Pruebas enfocadas | `frontend/src/features/attendance/api.test.ts`, `AdministrativeAttendancePage.test.tsx`, `frontend/src/pages/MyAttendancePage.test.tsx`, `frontend/src/routes/AppRoutes.test.tsx`, `frontend/src/features/navigation.test.ts` |
| Contrato generado | `frontend/src/types/api.generated.ts`, sincronizado únicamente mediante OpenAPI runtime y sin edición manual |

## Contexto del APPLY

El worktree partió de `HEAD` inicial `4504e8f5…`. No se modificaron migraciones, snapshots del modelo, dependencias ni lockfiles.

## Evidencia automatizada

| Alcance | Resultado |
| --- | --- |
| Frontend: `format:check`, `typecheck`, `lint` | PASS |
| Frontend: `pnpm test` | PASS — 39 archivos / 224 tests |
| Frontend: `build` | PASS |
| Backend: `dotnet build -c Release` | PASS — permanece el warning existente `NU1903` de SSH.NET |
| Regresión backend aislada por proceso | PASS — 107/107: 88 integration, 18 application, 1 domain |
| Prueba original de la solución en un solo proceso | 105/107; 2 tests de setup de migraciones chocaron con agotamiento de clientes PostgreSQL `53300`; las reejecuciones por clase pasaron 107/107 |
| D16 — Attendance | PASS — 8/8 |
| D16 — derivation | PASS — 17/17 |

## Límites de evidencia

La evidencia manual responsive/accessibility es exactamente `DEFERRED_TO_SPRINT_FINAL_AUDIT`; no se describe como PASS. El `verify-report.md` del change actual registra `PASS_WITH_MANUAL_EVIDENCE_DEFERRED`; no se afirma screenshots, commit, push ni release.

## Estado de entrega

`HU_023_BACKEND_COMPLETE: YES` — `HU_023_FRONTEND_APPLY: YES` — APPLY automatizado completado; auditoría manual final diferida.
