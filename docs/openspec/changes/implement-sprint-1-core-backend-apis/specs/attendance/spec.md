# Attendance Specification

## Purpose

Registrar asistencia administrativa con tiempo de negocio autoritativo y habilitar únicamente la consulta propia de HU-023.

## Requirements

### Requirement: Registro y DTO de asistencia

AttendanceRecord SHALL ser `{id:UUID,employeeId:UUID,businessDate:YYYY-MM-DD,checkInAt:ISO-8601 UTC,checkInByUserId:string,checkOutAt:ISO-8601 UTC|null,checkOutByUserId:string|null}`. `POST /api/v1/attendance/employees/{employeeId}/check-in` y `POST /api/v1/attendance/employees/{employeeId}/check-out` SHALL requerir `ADMINISTRADOR` o `ENCARGADO`, no aceptar cuerpo y responder 201/200. El actor se toma exclusivamente del JWT y puede diferir del Employee objetivo; el servidor asigna timestamps y businessDate con la timezone de negocio configurada. Employee inexistente SHALL responder 404.

#### Scenario: Actor distinto del empleado

- GIVEN `ENCARGADO` autenticado y otro Employee existente
- WHEN registra check-in para ese UUID
- THEN el DTO conserva el Employee objetivo y checkInByUserId es el UserId del actor.

### Requirement: Ciclos y conflictos abiertos

Un Employee MAY tener varios ciclos cerrados el mismo businessDate y el sistema SHALL NOT crear `UNIQUE(employeeId,businessDate)`. Un Employee SHALL tener como máximo un record abierto globalmente; un check-in con record abierto SHALL responder 409 ProblemDetails y un check-out sin record abierto SHALL responder 409 ProblemDetails. No SHALL existir endpoint toggle.

#### Scenario: Concurrencia de entradas

- GIVEN dos check-ins simultáneos para el mismo Employee sin ciclo abierto
- WHEN ambas solicitudes alcanzan persistencia
- THEN exactamente una crea el record y la otra responde 409 ProblemDetails.

### Requirement: Consulta operacional diaria con información de empleado

`GET /api/v1/attendance/employees/today` SHALL requerir `ADMINISTRADOR` o `ENCARGADO` y responder `{businessDate:YYYY-MM-DD,timeZone:string,items:[{employeeId:UUID,fullName:string,isActive:boolean,attendanceRecords:[AttendanceRecord],currentState:OPEN|CLOSED|NO_RECORD}]}`. SHALL incluir información operacional de cada Employee relevante, sus records del día y todo record abierto anterior; no SHALL alterar timestamps ni cerrar ciclos automáticamente.

#### Scenario: Arrastre visible

- GIVEN un Employee activo con check-in ayer y sin check-out
- WHEN consulta today un `ADMINISTRADOR`
- THEN su item incluye employeeId, fullName, currentState OPEN y el record abierto.

### Requirement: Consulta propia

`GET /api/v1/attendance/me?from=YYYY-MM-DD&to=YYYY-MM-DD&page={int}&pageSize={int}` SHALL requerir Bearer, resolver Employee desde UserId autenticado, no aceptar employeeId y devolver el sobre común de AttendanceRecord ordenado por checkInAt descendente. from/to son fechas inclusivas de negocio y from posterior a to SHALL responder 400; usuario sin Employee responde 404. La consulta SHALL aislar otros Employees y no SHALL proporcionar HU-024 ni frontend.

#### Scenario: Aislamiento de historial

- GIVEN dos Employees con asistencias dentro del rango
- WHEN el primero consulta `/attendance/me`
- THEN recibe solo sus propios records.
