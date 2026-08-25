# HU-022 — Registrar asistencia

## Rutas, actores y tiempo

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

## Tiempo real

El hub SignalR es `/hubs/attendance`, exclusivo de `ADMINISTRADOR` y `ENCARGADO`. Emite `AttendanceUpdated` con el payload de AttendanceRecord únicamente después del commit; un 4xx no emite y un fallo del notifier no revierte el registro persistido. El hub no forma parte del documento OpenAPI REST.

## Enabler de HU-023 (pendiente)

`GET /api/v1/attendance/me?from&to&page&pageSize` está implementado solamente como habilitador backend. Requiere Bearer, resuelve el Employee desde el JWT, no acepta `employeeId`, filtra fechas de negocio inclusivas, ordena por `checkInAt` descendente y retorna el sobre paginado de AttendanceRecord. `from > to` devuelve 400 y usuario sin Employee, 404. Esto no completa HU-023: no se entregan pantallas, flujos frontend ni HU-024.

## Evidencia técnica

Las pruebas PostgreSQL cubren actor/objetivo, políticas, conflictos y carreras, ciclos, today, aislamiento de `/attendance/me`, SignalR post-commit y la persistencia ante fallo de notificación.
