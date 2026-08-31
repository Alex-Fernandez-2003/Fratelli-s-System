# Design

## Components Touched

### Backend

- `RestaurantSystem.Domain`
  - entidades de negocio;
  - enums/invariantes donde aporten valor.
- `RestaurantSystem.Application`
  - contratos/use cases;
  - DTOs o modelos de aplicación;
  - abstracciones de persistencia/identity/current-user/time/notifier según el patrón finalmente adoptado.
- `RestaurantSystem.Infrastructure`
  - EF mappings;
  - Identity extension;
  - session persistence;
  - repositories/query implementation;
  - seeding;
  - migrations.
- `RestaurantSystem.Api`
  - endpoints/routes;
  - ProblemDetails mapping;
  - auth cookie/JWT;
  - policies;
  - SignalR attendance.

### Tests

- Domain.Tests.
- Application.Tests.
- IntegrationTests.

### Frontend

Únicamente:

- `frontend/src/types/api.generated.ts`;
- `frontend/scripts/generate-api.mjs` o configuración relacionada solo si la generación existente necesita una corrección estrictamente técnica.

No se crean features frontend.

### Documentation

- `docs/openspec/changes/implement-sprint-1-core-backend-apis/`.
- `docs/historias/HU-001-...md`.
- `docs/historias/HU-003-...md`.
- `docs/historias/HU-016-...md`.
- `docs/historias/HU-022-...md`.
- `docs/historias/README.md` solo si necesita indexar las HUs ejecutadas.

## Boundaries Respected

- Domain no depende de ASP.NET Core.
- Application no depende de EF Core.
- Application no depende de `UserManager`, `RoleManager`, JWT primitives concretos ni SignalR.
- Infrastructure implementa persistence/Identity.
- Api controla HTTP, cookies, auth middleware y hubs.
- El actor autenticado se obtiene mediante una abstracción/control de boundary y nunca desde campos manipulables por request.
- `Employee` permanece separado de Identity User.
- SignalR es salida de integración; no sustituye la operación transaccional.
- OpenAPI describe REST; SignalR se documenta manualmente.
- El frontend no se convierte en consumidor funcional durante este change.
- No se introducen capas adicionales como CQRS completo/event sourcing.

## Auditoría estructural que condiciona el diseño

El `ApplicationDbContext` actual utiliza un default schema `identity`. Si las nuevas entidades se agregan sin mapping explícito, podrían terminar indebidamente dentro de dicho schema. Por eso las business tables deben mapearse explícitamente a un schema de negocio, preferentemente `public`, mientras Identity conserva su schema actual.

La migration `InitialIdentity` usa `AspNetUsers` con PK `text`. No se cambiará a UUID durante Sprint 1. :contentReference[oaicite:8]{index=8}

## Modelo de datos

### Usuario Identity extendido

Se necesita un tipo de usuario de aplicación equivalente a `IdentityUser` extendido con:

- `isActive`.

Restricciones:

- conservar PK `string`;
- conservar tabla física existente salvo migration aditiva;
- no mover ni renombrar toda Identity;
- default `isActive=true` para compatibilidad con cualquier usuario existente.

No se usará Employee.isActive como sustituto de account.isActive: son conceptos diferentes.

### Employee

Tabla de negocio:

| Campo conceptual | Tipo lógico | Regla |
|---|---|---|
| id | UUID | PK |
| userId | string nullable | FK Identity, UNIQUE cuando existe |
| fullName | varchar(160) | required |
| isActive | bool | default true |
| createdAt | timestamptz | required |
| createdByUserId | string nullable | auditoría |
| updatedAt | timestamptz nullable | auditoría |
| updatedByUserId | string nullable | auditoría |

`User != Employee` permanece explícito. El vínculo permite `/auth/me` y `/attendance/me`. :contentReference[oaicite:9]{index=9}

### UserSession

Entidad técnica equivalente a:

| Campo | Regla |
|---|---|
| id | UUID PK |
| userId | string FK Identity |
| refreshTokenHash | requerido, único |
| createdAt | timestamptz |
| expiresAt | timestamptz |
| revokedAt | nullable |
| replacedBySessionId | nullable self-FK |

Índices:

- unique `refreshTokenHash`;
- `userId`;
- opcional `expiresAt` para mantenimiento futuro;
- self-FK no cascading.

No se necesita:

- device inventory;
- browser fingerprint;
- IP history;
- location tracking;
- background cleanup job en este MVP.

### Refresh rotation model

Flujo:

- Login:
  - validar usuario/password/active;
  - generar access token 15 min;
  - generar refresh aleatorio de alta entropía;
  - almacenar solamente hash;
  - `createdAt = now`;
  - `expiresAt = now + 12h`;
  - emitir cookie.

- Refresh:
  - hash del token presentado;
  - localizar sesión;
  - validar active/revoked/expires/user;
  - generar replacement session;
  - replacement hereda el mismo `expiresAt` absoluto;
  - marcar anterior `revokedAt`;
  - anterior apunta a replacement;
  - confirmar transacción;
  - emitir access token/cookie nuevos.

- Logout:
  - localizar la sesión por hash;
  - revocarla si sigue activa;
  - borrar cookie;
  - no tocar otras sesiones.

Para tokens refresh aleatorios de alta entropía, un hash criptográfico one-way equivalente a SHA-256 es suficiente y evita tratar el token como password humano.

### Categories

La tabla no existe físicamente todavía; debe crearse directamente con el modelo actualizado, no crear primero el modelo antiguo para alterarlo inmediatamente.

Campos:

- id UUID;
- name `varchar(100)`;
- description `varchar(300)` nullable;
- scope `varchar(...)`;
- isActive;
- createdAt/createdBy;
- updatedAt/updatedBy.

Scope:

- MENU;
- INVENTORY;
- PREPARATION.

Constraint:

- unique lógico por `scope + normalized name`.

Evitar `citext` salvo que ya exista motivo para introducir la extensión. Una unique index funcional equivalente a `scope + lower(trim(name))` es una solución PostgreSQL razonable para evitar duplicados solo por casing.

### Units

Campos documentales vigentes:

- id;
- code;
- name;
- symbol;
- dimension;
- factorToBase;
- isBase;
- isActive. :contentReference[oaicite:10]{index=10}

Baseline seeds:

| Code | Dimension | Factor | Base | Protección |
|---|---|---:|---|---|
| g | MASS | 1 | sí | estructural |
| kg | MASS | 1000 | no | estructural |
| ml | VOLUME | 1 | sí | estructural |
| l | VOLUME | 1000 | no | estructural |
| unit | COUNT | 1 | sí | estructural |

Las cinco se tratan como preestablecidas/protegidas.

Una custom unit:

- pertenece a MASS/VOLUME/COUNT;
- expresa factor contra la unidad base de su dimensión;
- es non-base;
- puede desactivarse lógicamente.

### Products

Modelo alineado con la baseline:

- id;
- categoryId nullable;
- inventoryUnitId required;
- name;
- description nullable;
- productType;
- preparationArea;
- isSellable;
- salePrice nullable;
- minimumStock nullable;
- isActive;
- auditoría.

La documentación vigente ya define `INGREDIENT`, `PREPARATION`, `SALE_ITEM`, `SUPPLY` y `KITCHEN`, `BAR`, `NONE`. :contentReference[oaicite:11]{index=11}

No existen:

- composition DbSets;
- stock balances;
- production entities

dentro de este change.

### Suppliers

Como la tabla tampoco existe físicamente todavía, debe crearse directamente con el modelo aprobado:

- id UUID;
- name;
- phoneNumber string;
- email nullable;
- notes nullable;
- isActive;
- createdAt/createdByUserId;
- updatedAt/updatedByUserId.

La documentación anterior solo incluía name/notes/audit; phone/email son una normalización aprobada de Sprint 1. :contentReference[oaicite:12]{index=12}

### AttendanceRecord

Campos:

- id UUID;
- employeeId UUID;
- checkInAt timestamptz;
- checkOutAt nullable timestamptz;
- createdAt;
- createdByUserId string;
- updatedAt nullable;
- updatedByUserId nullable string.

Constraint crítico:

- unique parcial en `employee_id` donde `check_out_at IS NULL`.

Índice adicional:

- `(employee_id, check_in_at)`.

La baseline documental ya exige este índice parcial. :contentReference[oaicite:13]{index=13}

### Audit actor typing

Debido a la PK real Identity de tipo `string`, los nuevos `created_by_user_id`/`updated_by_user_id` que referencien Identity deben usar el tipo físico compatible con `AspNetUsers.Id`.

Esto se registra como desviación técnica de la representación `uuid` de `docs/11-modelo-datos.md`, a sincronizar después de Sprint 1.

## Migrations necesarias

Se recomienda tres migrations coherentes, no una por endpoint:

### Migration A — Identity/session/employees

Debe:

- extender usuario con `is_active`;
- crear `employees`;
- crear `identity.user_sessions` o ubicación técnica equivalente;
- crear FKs/indexes;
- sembrar roles canónicos si la auditoría inmediata confirma que siguen ausentes.

No debe modificar `InitialIdentity`.

### Migration B — Catalog/suppliers

Debe:

- crear categories con scope desde el inicio;
- crear units;
- create products;
- create suppliers con phone/email desde el inicio;
- constraints/checks/indexes;
- category seeds;
- unit seeds.

### Migration C — Attendance

Debe:

- crear attendance_records;
- crear FK Employee;
- crear audit FKs;
- crear índice histórico;
- crear unique partial open-attendance index.

El agente MAY ajustar el agrupamiento si EF produce una secuencia más segura, pero MUST conservar unidades de rollback coherentes.

## Seeds

### Structural seeds

Pueden existir en todos los environments:

- seis roles canónicos;
- category baseline;
- cinco units.

Deben usar claves reproducibles/deterministas o estrategia equivalente para evitar duplicación.

### Development Seeder

Debe ejecutar después de que el schema requerido exista.

Protección mínima:

- llamada desde branch `Development`;
- guard interno `IsDevelopment`;
- flag Development explícito MAY actuar como tercer control;
- jamás usar valores de Production.

Usuarios:

- admin.test
- encargado.test
- mesero.test
- cocina.test
- contadora.test
- empleado.test

Inferido para simplificar el onboarding: puede utilizarse una única contraseña testing-only que satisfaga Identity, por ejemplo `Fratelli.Dev123!`, siempre documentada explícitamente como pública y prohibida para Production.

Los Employee deberán usar nombres como `Administrador de Prueba`, `Encargado de Prueba`, etc.; no datos personales reales.

El seeder debe:

- buscar antes de crear;
- crear/actualizar roles faltantes;
- crear usuarios faltantes con UserManager;
- vincular roles sin duplicarlos;
- crear Employee faltante y vincular por UserId;
- no resetear passwords arbitrariamente en cada arranque;
- no destruir cambios de desarrollo existentes.

## Diseño de autenticación

### Account state

Debe agregarse un estado de cuenta independiente de Employee.

Login:

- usuario no encontrado → 401 genérico;
- password incorrecto → 401 genérico;
- cuenta inactiva → 401 genérico.

El contrato visible debe ser equivalente para esos tres casos.

### JWT claims

Mantener mínimo:

- subject/user id;
- username/name claim cuando sea útil;
- role claims;
- standard timing claims.

No es necesario incluir EmployeeId en JWT porque `/me` y `/attendance/me` pueden resolver el vínculo server-side. Esto reduce claims stale.

### Cookie

Baseline:

| Propiedad | Development | Production |
|---|---|---|
| HttpOnly | true | true |
| Secure | false solo localhost/http | true |
| SameSite | Lax | Lax mientras la topología siga same-site |
| Max lifetime | <= 12h absolute | <= 12h absolute |

La cookie no debe exponerse en OpenAPI examples con un token real.

### Lockout

La documentación de seguridad contempla un baseline de aproximadamente 5 intentos y 15 minutos. La implementación SHOULD reutilizar mecanismos Identity para mantener esa política centralizada, sin inventar password handling paralelo. :contentReference[oaicite:14]{index=14}

## Contrato API HU-001

### DTO conceptual LoginRequest

- `username: string`
- `password: string`

### DTO conceptual AuthUser

- `id: string`
- `username: string`
- `employeeId: uuid | null`
- `fullName: string | null`
- `roles: string[]`
- `isActive: boolean`

### DTO conceptual AuthSessionResponse

- `accessToken: string`
- `expiresAt: ISO timestamp`
- `user: AuthUser`

Login y refresh SHOULD devolver el mismo shape para simplificar el consumidor futuro.

| Endpoint | Auth entrada | Resultado | Errores relevantes |
|---|---|---|---|
| POST `/api/v1/auth/login` | anónimo, username/password | 200 AuthSessionResponse + cookie | 400, 401 |
| POST `/api/v1/auth/refresh` | refresh cookie | 200 AuthSessionResponse + nueva cookie | 401 |
| POST `/api/v1/auth/logout` | refresh cookie | 204 + clear cookie | preferentemente 204 idempotente |
| GET `/api/v1/auth/me` | Bearer | 200 AuthUser | 401 |

## Contrato API HU-003 — Products

### Product write contract conceptual

- categoryId nullable;
- inventoryUnitId;
- name;
- description nullable;
- productType;
- preparationArea;
- isSellable;
- salePrice nullable;
- minimumStock nullable.

El estado `isActive` no debe convertirse en bypass de autorización.

Inferido:

- ENCARGADO puede editar los datos funcionales manteniendo el estado actual;
- solo ADMINISTRADOR puede realizar transición de estado active/inactive;
- reactivación también se trata como status-management privilegiado para mantener una regla uniforme.

### Product pagination

Respuesta:

- items;
- page;
- pageSize;
- totalCount;
- totalPages.

### Endpoints

| Endpoint | Roles lectura/escritura | Resultado |
|---|---|---|
| GET `/api/v1/products` | ADMINISTRADOR, ENCARGADO, MESERO, COCINA, CONTADORA | 200 paginado |
| GET `/api/v1/products/{id}` | mismos roles lectura | 200/404 |
| POST `/api/v1/products` | ADMINISTRADOR, ENCARGADO | 201 |
| PUT `/api/v1/products/{id}` | ADMINISTRADOR, ENCARGADO | 204 o 200 según patrón final |
| DELETE `/api/v1/products/{id}` | ADMINISTRADOR | 204 soft delete |

Filtros de list:

- page;
- pageSize;
- search;
- productType;
- categoryId;
- categoryScope;
- preparationArea;
- isActive.

`search` debería realizar coincidencia case-insensitive sobre name y, si se implementa sin coste adicional, description.

## Contrato API HU-003 — Categories

| Endpoint | Roles | Resultado |
|---|---|---|
| GET `/api/v1/categories` | catálogo-read | 200 lista |
| GET `/api/v1/categories/{id}` | catálogo-read | 200/404 |
| POST `/api/v1/categories` | ADMINISTRADOR, ENCARGADO | 201 |
| PUT `/api/v1/categories/{id}` | ADMINISTRADOR, ENCARGADO | 204/200 |
| DELETE `/api/v1/categories/{id}` | ADMINISTRADOR | 204 soft delete |

Filtros pequeños:

- scope opcional;
- isActive opcional.

Default recomendado para listas normales: active=true cuando el filtro no sea proporcionado. La API debe permitir consultar `isActive=false` para reactivación administrativa.

## Contrato API HU-003 — Units

| Endpoint | Roles | Resultado |
|---|---|---|
| GET `/api/v1/units` | catálogo-read | 200 lista |
| GET `/api/v1/units/{id}` | catálogo-read | 200/404 |
| POST `/api/v1/units` | ADMINISTRADOR, ENCARGADO | 201 |
| PUT `/api/v1/units/{id}` | ADMINISTRADOR, ENCARGADO | 204/200 |
| DELETE `/api/v1/units/{id}` | ADMINISTRADOR | 204 o 409 |

Filtros razonables:

- dimension opcional;
- isActive opcional.

No añadir search/pagination salvo necesidad real observada.

## Contrato API HU-016

### Supplier write contract conceptual

- `name`
- `phoneNumber`
- `email?`
- `notes?`

### Supplier response

- id;
- name;
- phoneNumber;
- email;
- notes;
- isActive;
- audit fields solamente cuando el contrato frontend realmente los necesite.

No retornar internals innecesarios.

| Endpoint | Roles | Resultado |
|---|---|---|
| GET `/api/v1/suppliers` | ADMINISTRADOR, ENCARGADO, COCINA, CONTADORA | 200 paginado |
| GET `/api/v1/suppliers/{id}` | mismos | 200/404 |
| POST `/api/v1/suppliers` | ADMINISTRADOR, ENCARGADO | 201 |
| PUT `/api/v1/suppliers/{id}` | ADMINISTRADOR, ENCARGADO | 204/200 |
| DELETE `/api/v1/suppliers/{id}` | ADMINISTRADOR | 204 soft delete |

Filtros:

- page;
- pageSize;
- search;
- isActive.

Inferido: `search` puede abarcar name, phoneNumber y email sin introducir full-text search.

## Contrato API HU-022

### GET `/api/v1/attendance/employees/today`

Roles:

- ADMINISTRADOR
- ENCARGADO

DTO conceptual por Employee:

- employeeId;
- fullName;
- isActive;
- attendanceToday[];
- status.

Cycle:

- id;
- checkInAt;
- checkOutAt.

Status inferido:

- `NOT_STARTED`
- `OPEN`
- `CLOSED`

`OPEN` tiene prioridad si existe un ciclo abierto.

El endpoint debe incluir:

- cycles cuyo check-in pertenece al business day;
- cualquier ciclo todavía abierto relevante aunque haya iniciado antes de la medianoche de negocio.

### POST `/api/v1/attendance/employees/{employeeId}/check-in`

Body:

- ninguno, salvo que el framework requiera un objeto vacío; no timestamp.

Resultado conceptual:

- `200`/`201` con estado actualizado o `204`, según convención final.
- Preferencia: retornar el Attendance/Employee attendance state actualizado para facilitar clientes posteriores.

Errores:

- 401;
- 403;
- 404 Employee;
- 409 already-open;
- 409/400 si Employee inactivo según mapping final.

### POST `/api/v1/attendance/employees/{employeeId}/check-out`

Body:

- ninguno.

Errores:

- 401;
- 403;
- 404;
- 409 no-open-attendance.

### GET `/api/v1/attendance/me`

Roles:

- cualquier identidad autenticada con Employee.

Query:

- from;
- to;
- page;
- pageSize.

El Employee se deriva server-side.

No existe `employeeId` query param.

## Fechas / today

### Business timezone

No existe actualmente una timezone operativa materializada en la foundation auditada.

Diseño:

- agregar una configuración explícita equivalente a `Business:TimeZone`;
- usar IANA timezone;
- baseline inferida: `America/La_Paz`;
- abstraer `now`/business date en Application para permitir tests;
- persistir instantes en UTC/timestamptz;
- convertir `today`, `from` y `to` a límites `[startInclusive,endExclusive)` usando timezone de negocio.

`from=2026-08-01&to=2026-08-10` significa días calendario del negocio, no timestamps arbitrarios del cliente.

## SignalR

### Hub

`/hubs/attendance`

### Autorización

Policy operacional:

- ADMINISTRADOR
- ENCARGADO

No anónimo.

### Event

`AttendanceUpdated`

### Payload conceptual

- employeeId;
- status;
- attendanceToday.

Usar el mismo representation contract empleado por la fila operacional cuando sea razonable para evitar dos modelos paralelos.

### Momento exacto de emisión

- validar;
- persistir;
- commit;
- construir estado actualizado;
- invocar notifier;
- retornar response.

Nunca:

- emitir antes del commit;
- emitir por request fallida.

Si la notificación falla después de commit, la persistencia no debe revertirse ficticiamente. El error debe quedar logueado/observable y el cliente siempre puede recuperar estado mediante REST.

### Clean Architecture

Flujo:

    Attendance use case
        ↓
    IAttendanceNotifier
        ↓
    implementación externa
        ↓
    IHubContext<AttendanceHub>
        ↓
    AttendanceUpdated

Application conoce la interfaz, no SignalR.

### JWT en SignalR

La configuración JWT debe soportar el mecanismo de access token utilizado por el cliente SignalR en el path del hub, restringiendo cualquier lectura alternativa del token exclusivamente a rutas `/hubs/...`.

No se implementará el cliente React en este change.

## Autorización

### Policies conceptuales

Los nombres internos exactos pueden adaptarse al patrón real; semánticamente deben existir capacidades equivalentes a:

- CatalogRead
- CatalogWrite
- MasterDataDeactivate
- SuppliersRead
- SuppliersWrite
- AttendanceOperate

### Matriz

| Operación | ADMINISTRADOR | ENCARGADO | MESERO | COCINA | CONTADORA | EMPLEADO |
|---|---:|---:|---:|---:|---:|---:|
| `/auth/me` | Sí | Sí | Sí | Sí | Sí | Sí |
| Product/category/unit read | Sí | Sí | Sí | Sí | Sí | No |
| Product/category/unit create/update | Sí | Sí | No | No | No | No |
| Product/category/unit deactivate | Sí | No | No | No | No | No |
| Supplier read | Sí | Sí | No | Sí | Sí | No |
| Supplier create/update | Sí | Sí | No | No | No | No |
| Supplier deactivate | Sí | No | No | No | No | No |
| Attendance today | Sí | Sí | No | No | No | No |
| Attendance check-in/out | Sí | Sí | No | No | No | No |
| Attendance global SignalR | Sí | Sí | No | No | No | No |
| Attendance me | Sí* | Sí* | Sí* | Sí* | Sí* | Sí* |

`*` Requiere User vinculado a Employee.

Esta matriz no implementa administración de roles; solo consume roles existentes/seeded.

## Reglas de validación

### Auth

- username requerido y trimmed según Identity convention;
- password requerido;
- account active;
- refresh cookie presente/válida cuando corresponda;
- session no expirada/revocada;
- user activo al refresh.

### Products

- name required, máximo 160;
- description máximo 500;
- valid productType;
- valid preparationArea;
- inventoryUnit requerida/existente/activa para nuevo vínculo;
- category existente/activa para nuevo vínculo;
- salePrice null o >=0;
- si `isSellable=true`, salePrice SHOULD ser required;
- minimumStock null o >=0.

### Categories

- name required, máximo 100;
- description máximo 300;
- scope válido;
- normalized `(scope,name)` no duplicado;
- status transition autorizada.

### Units

- code required;
- name required;
- symbol required;
- dimension válida;
- factor > 0;
- custom unit no puede declararse nueva base;
- protected seed no permite structural mutation;
- status transition autorizada.

### Suppliers

- name required, máximo compatible con schema;
- phoneNumber required como string;
- email optional, validar formato solo si existe;
- notes optional y longitud máxima;
- no unique email/phone.

### Attendance

- Employee existe;
- Employee activo para check-in;
- actor autorizado;
- check-in requiere ausencia de open record;
- check-out requiere open record;
- timestamp server-side;
- history from<=to;
- `/me` requiere vínculo User→Employee.

## Error Handling

### Validation

`400 ValidationProblemDetails`

Debe identificar campos inválidos sin detalles internos.

### Authentication

`401 ProblemDetails`

Login inválido:

- mismo mensaje para unknown user/password/inactive.

Refresh inválido:

- mensaje genérico de sesión inválida o expirada.

### Authorization

`403 ProblemDetails`

No revelar detalles que faciliten escalamiento.

### Not found

`404 ProblemDetails`

Recursos por ID inexistentes.

### Conflicts

`409 ProblemDetails`

Casos mínimos:

- duplicate category scope+name;
- protected canonical unit;
- attendance already open;
- attendance open record not found;
- status transition conflict cuando corresponda.

Una violación de unique partial index durante check-in debe traducirse a 409 y no escapar como 500.

## Required Tests Per Layer

### Domain.Tests

Cuando las invariantes residan en Domain:

- valid enums/value rules;
- unit conversion constraints;
- protected/unit semantics si se modelan allí;
- attendance state transitions si existe comportamiento de entidad.

No duplicar tests puramente EF/API en Domain.

### Application.Tests

- auth orchestration mediante abstracciones;
- session absolute expiry/rotation;
- role/use-case authorization complementaria si existe;
- validation products/categories/units/suppliers;
- attendance check-in/check-out;
- actor vs target Employee;
- `/me` isolation;
- business-date interval;
- notifier invocado después de operación exitosa;
- notifier no invocado tras conflicto.

### IntegrationTests

Debe ampliarse el proyecto actual para probar endpoints reales.

Priorizar:

#### HU-001

- login válido;
- login inválido;
- inactive user;
- refresh;
- revoked refresh;
- expired refresh;
- logout;
- independent sessions;
- `/me`;
- 401/403.

#### HU-003

- CRUD products;
- pagination/filters;
- soft delete;
- permissions;
- category scopes;
- duplicate scope/name;
- valid same name different scope;
- units;
- protected units;
- status-transition permissions.

#### HU-016

- create/read/update/deactivate;
- optional email/notes;
- invalid email;
- pagination/search;
- permissions.

#### HU-022

- today list;
- check-in;
- duplicated open conflict;
- concurrent open constraint cuando sea viable;
- check-out;
- checkout without open;
- multiple cycles same day;
- own-history isolation;
- unauthorized actor;
- non-employee `/me`;
- timezone boundaries.

### PostgreSQL de tests

La suite que verifica migrations/unique partial indexes debe ejecutarse contra PostgreSQL, no contra un provider que cambie semántica relacional.

La CI actual solo ejecuta `dotnet test` y no dispone de PostgreSQL service. Dado que Sprint 1 introduce invariantes persistentes reales, se recomienda extender únicamente el job backend con un PostgreSQL service mínimo y una connection string de test efímera. No introducir Testcontainers si un service container de GitHub Actions resuelve el caso con menor complejidad. :contentReference[oaicite:15]{index=15}

### SignalR testing

Estrategia proporcional al MVP:

1. Application test:
   - persistencia/use case exitoso;
   - notifier mock/fake recibe `AttendanceUpdated` equivalente.

2. Integration:
   - comprobar que hub exige autenticación/policy;
   - cuando sea razonable, conectar un cliente SignalR de test y verificar un evento real.

No es necesario construir una suite E2E websocket extensa si la combinación abstraction-test + autorización de hub + smoke integration demuestra el contrato.

## Tradeoffs Accepted

- Se preserva `IdentityUser<string>` en lugar de reconstruir Identity como Guid.
- Se acepta una deuda temporal entre modelo conceptual y FK física Identity.
- Se usa refresh-session persistence simple en lugar de device management.
- No se implementa refresh reuse-detection avanzada.
- Se usa un único PagedResult sencillo para tres listados crecientes.
- Categories/units se mantienen como listas pequeñas.
- Se usa PostgreSQL real para invariantes que dependen del motor.
- Se extiende CI solo lo necesario para tests funcionales persistentes.
- SignalR usa una abstracción mínima, no un event bus.
- Se difiere la sincronización global documental hasta el cierre de Sprint 1.

## Implementation Constraints

- No editar `InitialIdentity`.
- No re-keyear Identity.
- No renombrar todas las tablas Identity durante este change.
- No colocar business tables accidentalmente en schema `identity`.
- No persistir refresh token plaintext.
- No versionar secretos Production.
- No permitir Development Seeder en Production.
- No admitir login por email.
- No introducir `CAJERO`.
- No permitir soft-delete bypass mediante PUT.
- No crear recetas/stock/compras u otras entidades futuras.
- No usar timestamp proporcionado por frontend para attendance.
- No crear unique employee+date.
- No emitir SignalR antes del commit.
- No acoplar Application a SignalR.
- No crear frontend funcional.
- No editar manualmente `api.generated.ts`.
- No marcar HU-023/HU-002 Done.

## OpenAPI/frontend synchronization

Orden obligatorio:

- estabilizar endpoints;
- ejecutar backend Development;
- verificar `/openapi/v1.json`;
- inspeccionar Swagger;
- desde `frontend/`, ejecutar `pnpm run api:generate`;
- revisar diff de `src/types/api.generated.ts`;
- ejecutar frontend typecheck/lint/build si el archivo generado pudiera afectar compilación.

No crear:

- API functions de feature;
- React hooks;
- TanStack Query hooks;
- páginas;
- forms;
- SignalR client feature.

## Documentación de HU

### Archivos

Si siguen ausentes al iniciar apply, crear según convención real:

- `docs/historias/HU-001-iniciar-cerrar-sesion.md`
- `docs/historias/HU-003-gestionar-productos-ingredientes-platos.md`
- `docs/historias/HU-016-gestionar-proveedores.md`
- `docs/historias/HU-022-registrar-entrada-salida-asistencia.md`

Adaptar slug solamente si el repositorio ya adoptó un nombre canónico distinto antes de apply.

### Estado

Mientras falte frontend/full-stack:

- HU-001: `Backend implementado / Frontend pendiente`.
- HU-003: `Backend implementado / Frontend pendiente`.
- HU-016: `Backend implementado / Frontend pendiente`.
- HU-022: `Backend implementado / Frontend pendiente`.
- HU-023: `Backend enabler implementado / Historia funcional pendiente`.

### Contrato backend por HU

Cada HU debe documentar, por endpoint:

- method/path;
- propósito;
- roles;
- headers/cookies;
- query;
- request;
- response;
- status codes;
- ProblemDetails;
- reglas de negocio;
- notas frontend.

Los ejemplos JSON se escribirán después de implementación usando exactamente las propiedades de los DTOs reales.

### HU-022 y SignalR

Documentar además:

- Hub: `/hubs/attendance`
- Event: `AttendanceUpdated`
- autorización;
- payload final;
- momento de emisión;
- relación actor/Employee objetivo.

## Deuda documental conocida post-Sprint 1

La sincronización global se difiere deliberadamente.

Después de terminar Sprint 1 deberá revisarse al menos:

1. `docs/06-srs.md`
   - narrativa de automarcado de asistencia;
   - session/auth decisions si hubiera divergencias.

2. `docs/07-product-backlog.md`
   - HU-022 actor autorizado;
   - dependencias históricas con HU-002;
   - estados reales Sprint 1.

3. `docs/09-ux-y-flujos.md`
   - flujo futuro de asistencia administrada;
   - futura pantalla operador/empleado objetivo.

4. `docs/10-arquitectura.md`
   - contracts/materialización real si difiere.

5. `docs/11-modelo-datos.md`
   - category scope;
   - suppliers phone/email;
   - user_sessions;
   - `IdentityUser<string>` físico vs UUID conceptual;
   - FKs de auditoría hacia Identity.

6. `docs/12-seguridad-y-riesgos.md`
   - sesión independiente/rotación final si el contrato difiere de la narrativa.

7. `docs/14-trazabilidad.md`
   - trazas HU/RF/tests/evidencia.

8. `docs/15-plan-desarrollo.md`
   - baseline real de Sprint 1.

9. `docs/requirements/requisitos-funcionales.md`
   - HU-022 operación por ADMINISTRADOR/ENCARGADO.

10. `docs/requirements/reglas-negocio.md`
   - aclaración de actor/Employee y futuras implicaciones.

No corregir todo esto como condición previa del change; registrar la deuda y mantener OpenSpec/HU docs correctos ahora.

## Gates de implementación

### GATE 1 — Auth

Debe aprobar:

- login;
- refresh;
- logout;
- me;
- inactive account;
- independent sessions;
- rotation;
- cookie.

### GATE 2 — AuthZ

Debe aprobar:

- roles seeds;
- JWT role claims;
- policies;
- endpoint 401/403;
- matriz con test users.

HU-003/HU-016/HU-022 no deben considerarse habilitadas antes de este gate.

### GATE 3 — Persistence

Debe aprobar:

- migrations;
- structural seeds;
- Development Seeder;
- clean DB;
- Sprint0 DB;
- constraints/indexes.

### GATE 4 — Core APIs

Debe aprobar:

- HU-003;
- HU-016;
- HU-022 REST;
- HU-023 enabler.

### GATE 5 — Realtime

Debe aprobar:

- attendance hub;
- auth;
- AttendanceUpdated;
- post-commit behavior.

### GATE 6 — Contract

Debe aprobar:

- OpenAPI;
- Swagger;
- generated TypeScript.

### GATE 7 — Documentation

Debe aprobar:

- cuatro HU docs;
- contrato SignalR;
- estados backend-only correctos;
- deuda documental.

### GATE 8 — Validation

Debe aprobar:

- restore/build/tests;
- migrations clean;
- runtime;
- auth/authz;
- SignalR;
- type generation;
- Production seed safety.

## Definition of Done del change

El change puede considerarse backend-complete cuando:

- todos los gates anteriores están verificados;
- no existen tests placeholder como evidencia principal;
- los endpoints están implementados/autorizados/probados;
- las migrations son reproducibles;
- no existen secretos Production en Git;
- Development Seeder está fuertemente aislado;
- OpenAPI/tipos están sincronizados;
- documentación HU refleja contratos reales;
- SignalR está documentado/probado;
- ninguna feature React fue implementada;
- HU-023 sigue pendiente;
- HU-002 sigue pendiente.

Esto NO equivale automáticamente a DoD full-stack de HU-001/HU-003/HU-016/HU-022.

## Mapeo OpenSpec

El repositorio actual utiliza el patrón:

    docs/openspec/changes/<change>/
        proposal.md
        spec.md
        design.md
        tasks.md

Por tanto este change debe seguir:

    docs/openspec/changes/implement-sprint-1-core-backend-apis/
        proposal.md
        spec.md
        design.md
        tasks.md

No crear cuatro changes ni inventar un árbol paralelo `specs/` mientras el formato real del repositorio continúe usando `spec.md`.

## Implementation Handoff

El agente de apply no debe volver a decidir:

- número de changes;
- HUs incluidas;
- auth-first ordering;
- endpoints principales;
- username-only login;
- JWT 15 min;
- refresh máximo 12 h;
- sesiones independientes;
- rotación;
- roles;
- test users;
- category scopes/seeds;
- unit seeds/protection;
- soft delete;
- supplier fields;
- attendance actor ≠ target;
- attendance endpoints;
- HU-023 enabler;
- attendance SignalR;
- OpenAPI generation;
- frontend prohibition.

Debe comenzar con un preflight contra `develop`, preservar cualquier trabajo válido aparecido después de esta auditoría y ejecutar las tareas por gate. Si descubre una incompatibilidad que requiera re-keyear Identity, cambiar la semántica de sesiones, modificar los roles aprobados o cambiar el modelo actor/Employee, debe detener esa parte y revisar los artefactos OpenSpec antes de improvisar.