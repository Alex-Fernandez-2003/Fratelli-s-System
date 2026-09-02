# HU-024 — Asistencia administrativa, retrasos y ausencias

## Resultado

**APPLY COMPLETADO — BACKEND + FRONTEND IMPLEMENTADOS**

HU-024 conserva su contrato y policy backend para la consulta administrativa. La frontend `/asistencia` es read-only; `/asistencia/hoy` mantiene las operaciones de HU-022.

## Reglas y referencias históricas

Ver `docs/openspec/changes/archive/2026-08-31-implement-sprint-3-complete-backend/spec.md` y `design.md` para las reglas normativas congeladas de HU-024. `apply-progress.md` y `verify-report.md` del change archivado se conservan como referencias históricas; el `verify-report.md` del cambio actual registra `PASS_WITH_MANUAL_EVIDENCE_DEFERRED`; la revisión ordinaria receipt-driven permanece desactivada y la evidencia manual responsive/accessibility permanece `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

## Contrato y seguridad

### Consulta administrativa

El contrato y la policy backend de HU-024 en `/api/v1/attendance/admin` se reutilizan sin cambios.

| Endpoint | Comportamiento |
| --- | --- |
| `GET /api/v1/attendance/admin?employeeId=&from=&to=&shiftType=&outcome=&late=&page=&pageSize=` | `AdministrativeAttendancePage` con filas derivadas (present + absent), summary global `totalRecords/open/closed/totalWorked/late/absence` y resumen por empleado |

Los endpoints gestionados `/api/v1/attendance/employees/{employeeId}/...` conservan la policy `AttendanceManage`, disponible para `ADMINISTRADOR` y `ENCARGADO`. La autorización permanece server-side; el row-level scope se aplica antes de filtros/paginación donde corresponde y multi-role es unión.

## Backend aplicado

| Archivo | Propósito |
| --- | --- |
| `backend/src/RestaurantSystem.Application/Attendance/AttendanceDerivationService.cs` | Cálculo canónico de `late`, `worked` y `absence` |
| `backend/src/RestaurantSystem.Application/Attendance/AttendanceContracts.cs` | `AdministrativeAttendanceRow/Page` |
| `backend/src/RestaurantSystem.Infrastructure/Attendance/AttendanceServices.cs` | Consulta administrativa, snapshots, ausencias derivadas y resúmenes |
| `backend/src/RestaurantSystem.Api/Program.cs` | Policy `AttendanceAdministrative` |
| `backend/tests/RestaurantSystem.Application.Tests/AttendanceDerivationTests.cs` | Casos de derivación de puntualidad |

## Frontend aplicado

| Área | Archivos / propósito |
| --- | --- |
| Vista administrativa | `frontend/src/features/attendance/AdministrativeAttendancePage.tsx`; expone `/asistencia` como consulta read-only |
| Operaciones de hoy | `frontend/src/features/attendance/AttendanceTodayPage.tsx`; `/asistencia/hoy` conserva las operaciones de HU-022 |
| API, hooks y presentación | `frontend/src/features/attendance/api.ts`, `hooks.ts`, `format.ts`, `frontend/src/lib/api/endpoints.ts` |
| Asistencia propia integrada | `frontend/src/pages/MyAttendancePage.tsx` para `/mi-asistencia` de HU-023 |
| Rutas, navegación e Inicio | `frontend/src/routes/AppRoutes.tsx`, `frontend/src/features/navigation.tsx`, `frontend/src/pages/InicioPage.tsx` |
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

`HU_024_BACKEND_COMPLETE: YES` — `HU_024_FRONTEND_APPLY: YES` — APPLY automatizado completado; auditoría manual final diferida.
