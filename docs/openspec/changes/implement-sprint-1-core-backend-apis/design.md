# Diseño: APIs backend núcleo del Sprint 1

Este diseño implementa HU-001, HU-003, HU-016 y HU-022 como un primer contrato backend consumible. Se conserva la solución .NET 10 existente y la migración `InitialIdentity`; no se implementan frontend, stock, compras, conversiones, composiciones, HU-024 ni documentación histórica masiva.

## Decisiones cerradas

| Tema | Decisión |
|---|---|
| Arquitectura | `Domain` contiene entidades, enums y reglas puras; `Application` contiene casos de uso, DTOs e interfaces; `Infrastructure` implementa EF Core, Identity, JWT, sesiones, seeds y SignalR; `Api` contiene endpoints, binding, políticas y ProblemDetails. |
| Identity | Se mantiene `IdentityDbContext<IdentityUser>`, esquema `identity` y PK/FK `string`. No se edita ni reemplaza `InitialIdentity` ni se re-clavea `AspNetUsers`. |
| Esquema de negocio | `ApplicationDbContext` conserva `identity` como schema por defecto para Identity y mapea explícitamente las tablas de negocio al schema PostgreSQL `public`. |
| Identificadores y tiempo | Las entidades de negocio usan UUID; timestamps son `DateTimeOffset` UTC. La fecha de asistencia es `DateOnly` calculada en `America/Argentina/Buenos_Aires`. |
| Autorización | Se emiten claims `sub`/`NameIdentifier` con UserId `string`, `unique_name` con username y uno o más claims de rol estándar. Las políticas semánticas son las únicas usadas por endpoints y hub. |
| Sesión | Cada login crea una sesión independiente; solo se persiste SHA-256 del refresh token aleatorio. Refresh rota la misma sesión y logout revoca solo esa sesión. |
| Seeds | Roles, usuarios `.test` y Employees son exclusivos de un seeder idempotente de Development. Categories y Units canónicas son datos estructurales insertados por migración, para todos los entornos. |

## Ubicación concreta de la implementación

| Proyecto | Archivos/carpetas a crear o ampliar |
|---|---|
| `RestaurantSystem.Domain` | `Common/`, `Employees/Employee.cs`, `Identity/UserSession.cs`, `Catalog/{Category,Unit,Product}.cs`, `Suppliers/Supplier.cs`, `Attendance/AttendanceRecord.cs` y enums `CategoryScope`, `UnitDimension`, `ProductType`. |
| `RestaurantSystem.Application` | `Common/Pagination`, contratos y DTOs por feature (`Auth`, `Catalog`, `Suppliers`, `Attendance`), comandos/consultas y handlers; interfaces `IApplicationDbContext`, `ITokenService`, `IRefreshTokenService`, `ICurrentUser`, `IBusinessClock`, `IAttendanceNotifier`. |
| `RestaurantSystem.Infrastructure` | Ampliar `ApplicationDbContext` y `DependencyInjection`; EF configurations bajo `Persistence/Configurations`; implementaciones JWT/sesiones/relojes bajo `Identity` y `Time`; `DevelopmentDataSeeder`; `AttendanceHub` y notifier SignalR; nueva migración Sprint 1 y snapshot. |
| `RestaurantSystem.Api` | Reemplazar el esqueleto de `Program.cs` por registro de servicios/políticas, middleware y minimal endpoints agrupados bajo `/api/v1`; configurar OpenAPI/Swagger; mapear `AttendanceHub` en `/hubs/attendance`. |
| `RestaurantSystem.IntegrationTests` | Fixture PostgreSQL real, factory de aplicación, helpers de JWT/cookie y suites por auth, catálogo, proveedores, asistencia, migración y realtime. |

`Api` no consulta DbContext directamente: bindea HTTP a comandos/consultas de `Application`, traduce el resultado a HTTP y deja las reglas y transacciones en los handlers. `Infrastructure` registra las implementaciones; `Application` no referencia `Api` ni `Infrastructure`.

## Modelo persistente y migraciones

### Entidades y restricciones

- `Employee`: `Id UUID`, `UserId string`, `FullName string`, `IsActive bool`; índice único sobre `UserId` y FK a `identity.AspNetUsers(Id)`. Cada usuario puede tener como máximo un Employee.
- `UserSession`: `Id UUID`, `UserId string`, `RefreshTokenHash string`, `CreatedAt UTC`, `AbsoluteExpiresAt UTC`, `RevokedAt UTC?`, `LastRotatedAt UTC`; FK string a Identity y un índice único sobre `RefreshTokenHash`. No contiene token plano, dispositivo ni blacklist de access token.
- `Category`: `Id UUID`, `Name`, `Scope`, `IsActive`; índice único PostgreSQL por `(Scope, lower(Name))`, sin filtrar por estado, para impedir duplicados activos e inactivos y permitir el mismo nombre en otro scope.
- `Unit`: `Id UUID`, `Code`, `Name`, `Symbol`, `Dimension`, `FactorToBase decimal`, `IsBase`, `IsActive`; `Code` único sin distinción de mayúsculas/minúsculas y una restricción/validación que permite exactamente una unidad base activa por dimensión. Las unidades canónicas se identifican por sus UUID constantes de seed, no por texto introducido por el cliente.
- `Product`: `Id UUID`, `Name`, `ProductType`, `CategoryId UUID?`, `InventoryUnitId UUID`, `PreparationArea string?`, `SalePrice decimal?`, `MinStock decimal?`, `IsActive`, y auditoría UTC/UserId string de creación y actualización. FK a Category y Unit; ambos deletes físicos se restringen.
- `Supplier`: `Id UUID`, `Name`, `PhoneNumber`, `Email?`, `Notes?`, `IsActive`, y auditoría UTC/UserId string. No hay índice único de teléfono ni email.
- `AttendanceRecord`: campos exactos del contrato: `Id`, `EmployeeId`, `BusinessDate`, `CheckInAt`, `CheckInByUserId`, `CheckOutAt?`, `CheckOutByUserId?`; FK a Employee y actores Identity. No existe unicidad `(EmployeeId, BusinessDate)`; un índice único parcial PostgreSQL sobre `EmployeeId WHERE "CheckOutAt" IS NULL` impone un solo ciclo abierto globalmente.

Las conversiones EF fijan precision decimal para factores, precio, mínimos y valores UTC `timestamp with time zone`. Las entidades de baja lógica nunca se borran físicamente en los endpoints.

### Plan de migración

1. Mantener intacta `20260823162948_InitialIdentity` y su snapshot de Identity.
2. Generar una única migración aditiva Sprint 1 desde el modelo ampliado: crea tablas `public` y sus FK hacia `identity.AspNetUsers`, índices, índice parcial de asistencia y los datos estructurales.
3. Insertar en esa migración UUID constantes para las 11 Categories y 5 Units canónicas. No insertar usuarios, contraseñas, roles ni Employees mediante migración.
4. Revisar el `Up` para confirmar que no hay `Drop`, `Rename`, recreación ni alteración de PK/FK de tablas `identity`; el `Down` elimina solo objetos Sprint 1 y se usa únicamente en bases descartables.
5. Validar tanto una base vacía (`database update`) como una creada previamente hasta `InitialIdentity` (`database update` incremental).

### Datos estructurales canónicos

La migración inserta exactamente Categories activas: MENU `Entradas`, `Platos principales`, `Acompañamientos`, `Postres`, `Bebidas`; INVENTORY `Perecederos`, `No perecederos`, `Bebidas e Insumos`, `Suministros y Limpieza`; PREPARATION `Salsas`, `Masas y pastas`. Inserta exactamente Units activas: `g` MASS/1/base, `kg` MASS/1000/no base, `ml` VOLUME/1/base, `l` VOLUME/1000/no base y `unit` COUNT/1/base. No se relaciona `ProductType` con `CategoryScope` mediante regla ni constraint.

## Identidad, tokens y autorización

### Flujos y contratos Auth

`POST /api/v1/auth/login` acepta exclusivamente `{"username":string,"password":string}`; campos adicionales de identidad como email se rechazan con 400. Tras localizar por username, comprobar contraseña con `UserManager`, comprobar cuenta activa (y `Employee.IsActive` cuando exista) y respetar lockout, cualquier fallo de usuario inexistente, contraseña, inactividad o lockout devuelve el mismo 401 ProblemDetails. Un éxito crea `UserSession`, emite JWT de 15 minutos y la cookie, y devuelve 200:

```json
{"accessToken":"string","expiresAt":"UTC ISO-8601","user":{"id":"string","username":"string","fullName":"string|null","employeeId":"UUID|null","roles":["string"]}}
```

`GET /api/v1/auth/me` requiere Bearer y devuelve exactamente `user` del contrato anterior. `fullName` se devuelve como `null` si no existe Employee/nombre, nunca se omite.

`POST /api/v1/auth/refresh` no requiere Bearer: busca por hash de cookie, rechaza sesión inexistente/revocada/fuera de `AbsoluteExpiresAt` con 401, genera nuevo valor aleatorio, reemplaza solo el hash de esa fila, conserva el vencimiento absoluto de 12 horas y devuelve el mismo payload de login. `POST /api/v1/auth/logout` tampoco requiere Bearer: si encuentra la sesión la marca revocada, siempre expira la cookie y responde 204, incluso con cookie ausente, expirada o revocada.

La cookie se llama `refreshToken`, es `HttpOnly`, `SameSite=Strict`, `Path=/api/v1/auth` y no aparece en JSON, logs ni persistencia plana. `Secure=false` solo para `Development` en localhost HTTP; `Secure=true` en Production. La opción se deriva del entorno al emitir y al limpiar la cookie.

### Políticas y matriz de rutas

Roles materializados exactamente: `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA`, `EMPLEADO`; no se crea `CAJERO`. Roles se acumulan. Políticas: `CatalogRead`, `CatalogWrite`, `SupplierRead`, `SupplierWrite`, `AttendanceManage`, `AttendanceSelf` (Bearer y Employee vinculado) y `AttendanceHubAccess`.

| Ruta | Método | Política / roles | Éxito |
|---|---|---|---|
| `/api/v1/auth/login` | POST | Anónimo | 200 |
| `/api/v1/auth/refresh` | POST | Anónimo, cookie | 200 |
| `/api/v1/auth/logout` | POST | Anónimo, cookie opcional | 204 |
| `/api/v1/auth/me` | GET | Bearer autenticado | 200 |
| `/api/v1/categories` | GET | CatalogRead: ADMINISTRADOR, ENCARGADO, MESERO, COCINA | 200 |
| `/api/v1/categories/{id}` | GET | CatalogRead | 200 |
| `/api/v1/categories` | POST | CatalogWrite: ADMINISTRADOR, ENCARGADO | 201 |
| `/api/v1/categories/{id}` | PUT | CatalogWrite | 200 |
| `/api/v1/categories/{id}` | DELETE | CatalogWrite | 204 |
| `/api/v1/units` | GET | CatalogRead | 200 |
| `/api/v1/units/{id}` | GET | CatalogRead | 200 |
| `/api/v1/units` | POST | CatalogWrite | 201 |
| `/api/v1/units/{id}` | PUT | CatalogWrite | 200 |
| `/api/v1/units/{id}` | DELETE | CatalogWrite | 204 |
| `/api/v1/products` | GET | CatalogRead | 200 |
| `/api/v1/products/{id}` | GET | CatalogRead | 200 |
| `/api/v1/products` | POST | CatalogWrite | 201 |
| `/api/v1/products/{id}` | PUT | CatalogWrite | 200 |
| `/api/v1/products/{id}` | DELETE | CatalogWrite | 204 |
| `/api/v1/suppliers` | GET | SupplierRead: ADMINISTRADOR, ENCARGADO, COCINA, CONTADORA | 200 |
| `/api/v1/suppliers/{id}` | GET | SupplierRead | 200 |
| `/api/v1/suppliers` | POST | SupplierWrite: ADMINISTRADOR, ENCARGADO | 201 |
| `/api/v1/suppliers/{id}` | PUT | SupplierWrite | 200 |
| `/api/v1/suppliers/{id}` | DELETE | SupplierWrite | 204 |
| `/api/v1/attendance/employees/{employeeId}/check-in` | POST | AttendanceManage: ADMINISTRADOR, ENCARGADO | 201 |
| `/api/v1/attendance/employees/{employeeId}/check-out` | POST | AttendanceManage | 200 |
| `/api/v1/attendance/employees/today` | GET | AttendanceManage | 200 |
| `/api/v1/attendance/me` | GET | AttendanceSelf | 200 |
| `/hubs/attendance` | SignalR | AttendanceHubAccess: ADMINISTRADOR, ENCARGADO | conexión autorizada |

JWT bearer toma `access_token` de query únicamente cuando la ruta comienza `/hubs/`; REST nunca lo lee. La configuración normal sigue aceptando Bearer en header para REST.

### Seeder de Development

Un hosted startup seeder se registra y también se invoca con una segunda guardia `environment.IsDevelopment()` dentro de su ejecución; fuera de Development no hace nada. Mediante `RoleManager` crea los seis roles y mediante `UserManager` crea idempotentemente usuarios con las credenciales de prueba establecidas para el entorno, sin hashes manuales ni User Secrets. Para cada usuario asegura exactamente un Employee ficticio, sin actualizar datos existentes innecesariamente:

| Username | Roles exactos | Employee |
|---|---|---|
| `admin.test` | `ADMINISTRADOR`, `EMPLEADO` | uno |
| `encargado.test` | `ENCARGADO`, `EMPLEADO` | uno |
| `mesero.test` | `MESERO`, `EMPLEADO` | uno |
| `cocina.test` | `COCINA`, `EMPLEADO` | uno |
| `contadora.test` | `CONTADORA`, `EMPLEADO` | uno |
| `empleado.test` | `EMPLEADO` | uno |

Production crea cero cuentas `.test`.

## Contratos de dominio

### Paginación, DTOs y catálogo

Toda lista usa estrictamente `{"items":[],"page":int,"pageSize":int,"totalCount":int,"totalPages":int}`. `page` inicia en 1; `pageSize` tiene default 20 y rango 1–100; validación previa evita ejecutar consulta inválida. `totalPages` es techo de `totalCount/pageSize` (0 cuando no hay items).

Category lee `{id,name,scope,isActive}` con scopes `MENU|INVENTORY|PREPARATION`; POST/PUT exige `name` no vacío y scope válido. Su lista recibe `page`, `pageSize`, `scope`, `includeInactive`; por defecto omite inactivas. DELETE es baja lógica; duplicado lógico y baja de Category referenciada por Product son 409.

Unit lee exactamente `{id,code,name,symbol,dimension,factor_to_base,is_base,is_active}`; se fijan nombres JSON snake_case para esos tres campos. POST/PUT exigen textos no vacíos, dimensión `MASS|VOLUME|COUNT`, factor positivo y coherencia de base. Las cinco unidades canónicas no pueden cambiar `code`, `dimension`, `factor_to_base`, `is_base` ni desactivarse: 409. Una Unit usada por Product tampoco puede desactivarse: 409.

Product lee exactamente `{id,name,productType,categoryId,categoryScope,preparationArea,inventoryUnitId,salePrice,minStock,isActive,createdAt,createdByUserId,updatedAt,updatedByUserId}`. POST/PUT validan nombre, `INGREDIENT|PREPARATION|SALE_ITEM|SUPPLY`, Unit existente obligatoria, Category existente cuando se envía y importes/cantidades no negativos. La lista acepta todos y solo `page`, `pageSize`, `search`, `productType`, `categoryId`, `categoryScope`, `preparationArea`, `isActive`; combina filtros sin acoplar tipo y scope. DELETE hace baja lógica.

Supplier lee exactamente `{id,name,phoneNumber,email,notes,isActive,createdAt,createdByUserId,updatedAt,updatedByUserId}`; POST/PUT acepta `{name,phoneNumber,email,notes}`. Nombre/teléfono no vacíos, email opcional sintácticamente válido, y opcionales ausentes se serializan como `null`. Lista: `search` en nombre o teléfono, `isActive`, `page`, `pageSize`; sin `isActive`, solo activos. DELETE hace baja lógica y usa `SupplierWrite`, no una regla adicional exclusiva de ADMIN.

### Asistencia y tiempo de negocio

`BusinessTime:TimeZoneId` se configura obligatoriamente como `America/Argentina/Buenos_Aires`; se resuelve al arranque con `TimeZoneInfo.FindSystemTimeZoneById` y un valor inválido impide iniciar. `IBusinessClock` entrega `UtcNow` y la fecha local de negocio. El servidor ignora cuerpos y timestamps del cliente para check-in/out.

El DTO `AttendanceRecord` es exactamente `{id,employeeId,businessDate,checkInAt,checkInByUserId,checkOutAt,checkOutByUserId}`. Check-in busca Employee, calcula fecha/timestamp, crea ciclo y responde 201. Check-out busca el único registro abierto global de ese Employee, asigna actor/timestamp y responde 200. El actor procede exclusivamente del JWT y puede ser distinto del sujeto. La violación del índice parcial por carreras y los estados abierto/sin abierto se traducen a 409; no hay toggle ni cierre automático.

`GET /attendance/employees/today` devuelve exactamente `{businessDate,timeZone,items}` donde cada item es `{employeeId,fullName,isActive,attendanceRecords,currentState}` y `currentState` es `OPEN|CLOSED|NO_RECORD`. Incluye Employees relevantes, sus ciclos de la fecha de negocio y cualquier ciclo abierto anterior, por lo que el arrastre permanece visible.

`GET /attendance/me?from&to&page&pageSize` resuelve Employee desde el UserId; no acepta `employeeId`. Filtra inclusivamente por fechas de negocio, ordena `checkInAt` descendente y devuelve el sobre común de `AttendanceRecord`. `from > to` da 400 y un usuario sin Employee da 404; nunca expone registros de otra persona.

### Realtime

`AttendanceHub` requiere `AttendanceHubAccess` y se mapea en `/hubs/attendance`. `IAttendanceNotifier` vive en Application; `SignalRAttendanceNotifier` vive en Infrastructure y llama a `Clients.All` de ese hub con nombre de evento literal `AttendanceUpdated` y payload literal `AttendanceRecord`. Cada handler de check-in/out guarda y confirma primero la transacción; solo entonces invoca notifier. Un 4xx no notifica y una excepción del notifier se registra pero no revierte el commit ni altera la respuesta exitosa REST.

## Errores, OpenAPI y pruebas

Los endpoints REST usan `application/problem+json` con `{type,title,status,detail,instance}`. Validación/binding es 400, sin autenticación 401, rol/política insuficiente 403, recurso inexistente 404 y regla de negocio/duplicado/conflicto de integridad 409. El middleware de excepciones y un mapeador de errores de aplicación normalizan estos resultados; no se filtran detalles de Identity ni excepciones de base.

OpenAPI documenta todos los endpoints REST, request/response DTOs, Bearer, cookie `refreshToken` y statuses. SignalR no se representa como endpoint REST. Solo después de congelar y revisar ese documento se ejecuta `pnpm run api:generate`; el único cambio frontend permitido es `frontend/src/types/api.generated.ts`, sin edición manual.

Las integraciones usan PostgreSQL real efímero (Testcontainers o instancia dedicada de CI), nunca el provider InMemory, y aplican las migraciones al fixture. Cubren migración limpia y upgrade desde `InitialIdentity`, preservación de Identity string/schema, índice parcial y dos check-ins concurrentes. Cubren 400/401/403/404 y cada 409 especificado; CRUD y bajas lógicas; filtros Product; DTOs/seeds canónicos; toda la matriz de roles; Development/Production seeder; login/refresh/rotación/logout/me/fullName; flags de cookie por entorno; today, aislamiento `/attendance/me`; y notificación solo post-commit, incluido fallo del notifier.

## Entrega, secuencia y rollback

1. Ampliar Domain/Application y modelo EF; generar y probar migración aditiva.
2. Incorporar Identity, JWT, sesiones, políticas y seeder; cerrar Auth/AuthZ antes de exponer APIs protegidas.
3. Implementar catálogo y proveedores con sus contratos, auditoría y reglas de baja.
4. Implementar asistencia, índice parcial, consulta propia y notifier/hub post-commit.
5. Ejecutar integración PostgreSQL, estabilizar OpenAPI y generar exclusivamente tipos frontend.

El despliegue aplica primero la migración y luego el binario. Ante regresión, se detiene el gate y se revierte el incremento de aplicación; `Down` solo procede en bases descartables. Nunca se revierte ni modifica `InitialIdentity` ni se intenta transformar claves existentes.

## Deuda documental diferida

Solo queda diferida la sincronización narrativa global: la documentación histórica deberá reconciliar la antigua referencia a Identity GUID con la baseline string/schema `identity`, el automarcado de asistencia con actor/sujeto separado, y discrepancias de seguridad, CI y realtime con los contratos validados. No se programa una reescritura documental amplia dentro de este change.
