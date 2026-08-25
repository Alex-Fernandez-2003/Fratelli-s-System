# Identity Access Specification

## Purpose

Proveer autenticación por username, sesiones refresh y autorización verificable para las APIs del Sprint 1.

## Requirements

### Requirement: Contratos HTTP transversales

Las rutas REST SHALL usar `/api/v1`. Las listas SHALL usar exactamente `{items,page,pageSize,totalCount,totalPages}`; page inicia en 1, pageSize está entre 1 y 100 y su valor por defecto es 20. Los errores SHALL ser `application/problem+json` con `{type,title,status,detail,instance}`: validación 400, no autenticación 401, autorización 403, inexistente 404 y conflicto de regla o duplicado 409.

#### Scenario: Paginación inválida

- GIVEN page=0 o pageSize=101
- WHEN la API valida la consulta
- THEN responde 400 ProblemDetails sin ejecutar la operación.

### Requirement: Login, token y usuario

`POST /api/v1/auth/login` SHALL aceptar exclusivamente `{username:string,password:string}` y responder 200 con `{accessToken:string,expiresAt:ISO-8601 UTC,user:{id:string,username:string,fullName:string|null,employeeId:UUID|null,roles:string[]}}`. `GET /api/v1/auth/me` SHALL requerir Bearer y responder exactamente el mismo objeto user. Cuando fullName exista para el usuario/Employee SHALL incluirse; no SHALL omitirse. Login por email u otra identidad SHALL responder 400; usuario inexistente, contraseña incorrecta, cuenta inactiva y lockout SHALL responder el mismo 401 sin revelar causa. El access token SHALL contener UserId string y roles y expirar en 15 minutos.

#### Scenario: Nombre completo en login

- GIVEN una cuenta activa con fullName
- WHEN inicia sesión por username y password válidos
- THEN user.fullName aparece en la respuesta.

### Requirement: Refresh y cierre de sesión

Login y `POST /api/v1/auth/refresh` SHALL emitir cookie `refreshToken` HttpOnly, SameSite=Strict y Path=`/api/v1/auth`; Secure SHALL ser false en Development por localhost HTTP y true en Production. El token nunca SHALL aparecer en JSON, logs ni persistencia en texto plano. Refresh SHALL funcionar sin Bearer, rotar la cookie de la misma sesión y conservar máximo absoluto de 12 horas; sesiones paralelas SHALL ser independientes. Logout SHALL funcionar sin Bearer, revocar solo su sesión, limpiar la cookie y responder 204 aunque falte, expire o esté revocada.

#### Scenario: Refresh tras expirar access token

- GIVEN una cookie válida dentro de 12 horas y access token expirado
- WHEN llama refresh
- THEN recibe token nuevo y cookie rotada.

### Requirement: Identity y Employee

Identity SHALL preservar tablas ASP.NET Identity, PK/FK string y esquema `identity`; InitialIdentity no SHALL editarse, reemplazarse ni re-keyearse. Employee SHALL usar UUID y relación única con UserId string fuera de identity.

#### Scenario: Me anónimo

- GIVEN una petición sin Bearer a `/api/v1/auth/me`
- WHEN se autoriza la ruta
- THEN responde 401 ProblemDetails.

### Requirement: Roles y matriz de autorización

Los roles del change SHALL ser exactamente `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA` y `EMPLEADO`; no SHALL existir `CAJERO` ni abreviaturas de rol. Los permisos se acumulan. Catalog: lecturas para `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`; escrituras para `ADMINISTRADOR`, `ENCARGADO`. Suppliers: lecturas para `ADMINISTRADOR`, `ENCARGADO`, `COCINA`, `CONTADORA`; escrituras para `ADMINISTRADOR`, `ENCARGADO`. Attendance administrativa y hub: `ADMINISTRADOR`, `ENCARGADO`. Cualquier usuario autenticado con Employee puede usar únicamente `/attendance/me` para su propio historial.

#### Scenario: Mesero sin escritura de proveedor

- GIVEN Bearer válido con solo `MESERO`
- WHEN solicita crear un proveedor
- THEN responde 403 ProblemDetails.

### Requirement: Seeder de Development

Solo en Development, con dos guardias independientes de entorno, el seeder SHALL crear idempotentemente los seis usuarios `.test`, un Employee ficticio por cada usuario y las asignaciones exactas: `admin.test`: `ADMINISTRADOR` + `EMPLEADO`; `encargado.test`: `ENCARGADO` + `EMPLEADO`; `mesero.test`: `MESERO` + `EMPLEADO`; `cocina.test`: `COCINA` + `EMPLEADO`; `contadora.test`: `CONTADORA` + `EMPLEADO`; `empleado.test`: `EMPLEADO`. SHALL materializar los seis roles exactos mediante `UserManager`/`RoleManager`, y no SHALL usar hashes de contraseña creados manualmente en migraciones. Las credenciales `.test` SHALL ser exclusivamente para pruebas y no SHALL almacenarse en User Secrets. Una segunda ejecución no SHALL duplicar usuarios, roles ni Employees ni cambiar datos existentes innecesariamente. Production SHALL crear cero cuentas `.test`. No SHALL crearse ni asignarse el rol `CAJERO`.

#### Scenario: Asignaciones exactas del seeder de Development

- GIVEN una base de datos sin los usuarios de prueba y el entorno Development
- WHEN se ejecuta el seeder
- THEN `admin.test` tiene exactamente `ADMINISTRADOR` y `EMPLEADO`; `encargado.test` tiene exactamente `ENCARGADO` y `EMPLEADO`; `mesero.test` tiene exactamente `MESERO` y `EMPLEADO`; `cocina.test` tiene exactamente `COCINA` y `EMPLEADO`; `contadora.test` tiene exactamente `CONTADORA` y `EMPLEADO`; y `empleado.test` tiene exactamente `EMPLEADO`.

#### Scenario: Idempotencia y Employees ficticios de Development

- GIVEN los seis usuarios `.test` creados por el seeder en Development
- WHEN el seeder se ejecuta por segunda vez
- THEN cada usuario conserva un único Employee ficticio y no se duplican usuarios, roles, asignaciones ni Employees.

#### Scenario: Seeder en producción

- GIVEN el proceso Production contra una base descartable
- WHEN inicia la aplicación
- THEN no crea usuarios `.test`.
