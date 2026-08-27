# HU-022 — Registrador de entrada y salida de asistencia

> **Como trabajador, quiero registrar mi entrada y salida para disponer de una asistencia centralizada y consistente.**

| Campo | Valor |
|---|---|
| **Épica** | `EPI-08` |
| **Prioridad** | MUST · 5 SP · RF-047, RF-048, RF-049 · RN-011, RN-012, RN-018 |
| **Dependencias** | HU-001 (sesión), HU-002 (gestión de usuarios/empleados) |
| **Rama** | `feat/HU-022-registrador-de-entrada-y-salida-de-asistencia` |
| **Alcance entregado** | Backend completo (contrato, reglas, tiempo real, migración, pruebas de integración) + Frontend (páginas, rutas protegidas por rol, estado con TanStack Query) |

---

## Estado actual — Sprint 1

La experiencia integrada separa gestión e historial propio. `ADMINISTRADOR` y `ENCARGADO` acceden a `/asistencia` y ejecutan operaciones sobre el `EmployeeId` real del empleado objetivo. `MESERO`, `COCINA`, `CONTADORA` y `EMPLEADO` solo acceden a `/mi-asistencia`, que es de consulta; no muestra acciones de entrada o salida. La navegación global expone una única capacidad **Asistencia** y resuelve `/asistencia` para roles de gestión y `/mi-asistencia` para los demás.

## Contrato backend implementado

| Ruta | Política | Resultado |
|---|---|---|
| `GET /api/v1/attendance/employees/today` | `ADMINISTRADOR`, `ENCARGADO` | 200 |
| `POST /api/v1/attendance/employees/{employeeId}/check-in` | `ADMINISTRADOR`, `ENCARGADO` | 201 |
| `POST /api/v1/attendance/employees/{employeeId}/check-out` | `ADMINISTRADOR`, `ENCARGADO` | 200 |

El actor siempre viene del JWT y puede ser distinto del Employee objetivo. El servidor ignora timestamps del cliente y usa `America/Argentina/Buenos_Aires` para `businessDate`. No existe toggle ni cierre automático: se permiten ciclos cerrados múltiples, pero PostgreSQL impone un único ciclo abierto por Employee mediante índice parcial.

Un registro es:

```json
{
  "id": "uuid",
  "employeeId": "uuid",
  "businessDate": "2026-08-25",
  "checkInAt": "2026-08-25T12:00:00+00:00",
  "checkInByUserId": "identity-string-id",
  "checkOutAt": null,
  "checkOutByUserId": null
}
```

Un check-in duplicado concurrente y un check-out sin ciclo abierto devuelven 409. Un Employee inexistente devuelve 404; binding inválido, 400; sin Bearer, 401; y rol no operativo, 403.

`GET /api/v1/attendance/employees/today` devuelve `{businessDate,timeZone,items}`. Cada item contiene `{employeeId,fullName,isActive,attendanceRecords,currentState}`; `currentState` es `OPEN`, `CLOSED` o `NO_RECORD`. Incluye ciclos del día y abiertos arrastrados.

## Criterios de aceptación y su cumplimiento

| Criterio (backlog) | Mecanismo que lo garantiza |
|---|---|
| Puede marcar entrada si no tiene una abierta | Verificación previa en servicio + inserción exitosa cuando no hay ciclo abierto |
| No puede marcar una segunda entrada abierta | Rechazo lógico **y** índice parcial único `UX_AttendanceRecords_Employee_Open WHERE "CheckOutAt" IS NULL` (defensa en profundidad ante carreras) |
| Solo puede registrar salida si existe una entrada abierta | `CheckOutAsync` resuelve el ciclo abierto; sin él devuelve 409 |
| La salida cierra la asistencia | Se sella `CheckOutAt`/`CheckOutByUserId`; el ciclo pasa a `CLOSED` y habilita un nuevo ciclo futuro |
| El flujo funciona sin hardware biométrico | Registro manual desde la web; RN-018 cumplida por diseño |

## Tiempo real

El hub SignalR es `/hubs/attendance`, exclusivo de `ADMINISTRADOR` y `ENCARGADO`. Emite `AttendanceUpdated` con el payload de AttendanceRecord únicamente después del commit; un 4xx no emite y un fallo del notifier no revierte el registro persistido. El hub no forma parte del documento OpenAPI REST.

## Historial propio

`GET /api/v1/attendance/me?from&to&page&pageSize` requiere Bearer, resuelve el Employee desde el JWT, no acepta `employeeId`, filtra fechas de negocio inclusivas, ordena por `checkInAt` descendente y retorna el sobre paginado de AttendanceRecord. `from > to` devuelve 400 y un usuario sin Employee recibe 404. `/mi-asistencia` consume este contrato como historial propio de solo lectura.

## Frontend implementado

| Página | Ruta | Acceso | Función |
|---|---|---|---|
| `AttendanceTodayPage` | `/asistencia` | `RequireAnyRole(['ADMINISTRADOR','ENCARGADO'])` → si no, `/403` | Tabla del personal con `currentState` (Abierta/Cerrada/Sin registro), registros del día y acciones **Marcar entrada** / **Marcar salida** por empleado; muestra fecha de negocio y zona horaria |
| `MyAttendancePage` | `/mi-asistencia` | `RequireAuth` | Historial propio contra `/attendance/me`: filtros `from`/`to`, tabla (fecha, entrada, salida, duración, estado) y paginación |

Detalles de implementación:

- Tipos consumidos desde `src/types/api.generated.ts` (OpenAPI), sin duplicación manual de contratos.
- Cliente HTTP existente: inyección automática de Bearer, reintento `401` vía refresh cookie y errores tipados `HttpError`.
- Las mutaciones de check-in/check-out viven exclusivamente en `/asistencia`; el historial propio no muta asistencia.
- Los errores de negocio de gestión se renderizan desde ProblemDetails.
- La navegación global expone una única capacidad Asistencia y usa la unión de roles para resolver el destino.
- Estados de carga (`Spinner`) y vacío (`EmptyState` en tabla) cubiertos.

## Pruebas

**Backend (integración, PostgreSQL real):** actor/objetivo, políticas por rol, conflictos y carreras, ciclos múltiples, `today`, aislamiento de `/attendance/me`, SignalR post-commit y persistencia ante fallo de notificación.

**Frontend:** suite Vitest actual — 48 pruebas en verde, incluidos guards y navegación. Typecheck, lint y build completaron correctamente.

**Validación manual:** PENDING. Debe validar gestión con `ADMINISTRADOR`/`ENCARGADO` y el historial de solo lectura con MESERO, COCINA, CONTADORA y EMPLEADO.

## Evidencia visual

Evidencia visual manual: pendiente. Las capturas históricas con rutas inexistentes se retiraron para no afirmar flujos ni archivos que no pueden verificarse.

## Decisiones técnicas

- Minimal APIs en lugar de controllers, consistente con el resto del Sprint 1.
- `businessDate` calculado en servidor con zona horaria configurable (`BusinessTime:TimeZoneId`); el cliente nunca envía fechas.
- Integridad del "único abierto" garantizada en base de datos, no solo en aplicación.
- Notificación SignalR best-effort post-commit: nunca bloquea ni revierte la operación.
- Frontend feature-based (`features/attendance`) alineado al patrón de `features/auth`, reutilizando guards, cliente HTTP y design system existentes.
