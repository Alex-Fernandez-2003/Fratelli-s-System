# Propuesta: APIs backend núcleo del Sprint 1

## Intención

Entregar el primer bloque consumible de backend para las historias HU-001 (autenticación), HU-003 (catálogo), HU-016 (proveedores) y HU-022 (asistencia). El trabajo será **backend-first**: establece contratos REST, persistencia, autorización y notificación de asistencia para que un frontend futuro pueda integrarse sin que este change implemente experiencias de interfaz.

`GET /api/v1/attendance/me` se incluye únicamente como habilitador backend de HU-023; no convierte HU-023 ni HU-024 en alcance funcional completo.

## Alcance y secuencia

1. **Gate 1 — Auth (HU-001):** incorporar identidad autenticada, empleados y sesiones; emitir JWT; y exponer login, refresh, logout y `me`.
2. **Gate 2 — AuthZ:** definir roles, claims y políticas semánticas antes de abrir cualquier API protegida; preparar autenticación JWT de SignalR limitada a `/hubs/...`.
3. **Gate 3 — Persistencia:** crear el modelo y las migraciones aditivas para catálogo, proveedores y asistencia, con sus restricciones y seeds estructurales.
4. **Gate 4 — Core APIs:** entregar Categories, Units, Products, Suppliers y operaciones REST de asistencia, incluido el enabler `/attendance/me`.
5. **Gate 5 — Realtime:** publicar `AttendanceUpdated` mediante `/hubs/attendance` solo después del commit persistente.
6. **Gate 6–8 — Contrato y validación:** estabilizar OpenAPI, generar exclusivamente los tipos API del frontend, documentar los contratos HU y ejecutar validaciones de migración, runtime, seguridad y alcance.

No se habilitarán capacidades protegidas de HU-003, HU-016 o HU-022 antes de cerrar los gates de Auth y AuthZ.

## Decisiones cerradas

| Área | Decisión de implementación |
|---|---|
| Compatibilidad de Identity | Se preservan las claves `string`, el esquema `identity` y las tablas existentes de ASP.NET Identity. `InitialIdentity` no se edita ni se reemplaza; los cambios son aditivos y no re-keyean `AspNetUsers`. |
| Empleado e identidad | `Employee` usa UUID y se vincula de forma única con `UserId` `string`. Las tablas de negocio se mapean fuera del esquema `identity`. |
| Sesiones | `UserSession` es independiente, almacena únicamente el hash del refresh token y permite sesiones paralelas. No habrá gestión de dispositivos ni blacklist de access tokens. |
| Tokens | El access token dura 15 minutos. El refresh rota sin superar una duración absoluta de 12 horas; refresh y logout funcionan aunque el access token haya expirado. Logout es idempotente y local a la sesión. |
| Login y cuenta | El login acepta solo username, sin alternativa por email. Los errores de usuario inexistente, contraseña incorrecta o cuenta inactiva son genéricos; se respeta el lockout de Identity si la baseline lo materializa. `/me` requiere Bearer. |
| Seeder de desarrollo | Se crean seis usuarios de prueba, sus roles y Employees mediante `UserManager`/`RoleManager`, de forma idempotente y con doble guardia exclusiva de `Development`. No se usan User Secrets para credenciales de prueba ni se resetean datos existentes innecesariamente. Production no puede crear automáticamente cuentas `.test`. |
| Roles | Se materializa la matriz de roles y políticas requerida por el change; no se crea el rol `CAJERO`. Las políticas distinguen catálogo, proveedores, desactivación y asistencia. |
| Catálogo (HU-003) | Incluye Categories, Units y Products: CRUD protegido, filtros, paginación donde corresponda, soft delete y auditoría de Products. Categories son únicas lógicamente por `scope + name`; no se impone relación de constraint entre `productType` y scope. Category puede ser nula e inventory unit es obligatoria. Las cinco unidades seed canónicas quedan protegidas contra mutación estructural. No incluye composiciones, conversiones de empaque ni stock. |
| Proveedores (HU-016) | Incluye CRUD, búsqueda/paginación, soft delete y la matriz de roles; teléfono es texto y email/notas son opcionales según el contrato. No se impone unicidad de teléfono ni email; la desactivación es solo ADMIN. |
| Asistencia (HU-022) | Incluye consulta operacional del día, check-in y check-out explícitos, con hora autoritativa del backend y timezone de negocio explícita. Actor JWT y Employee objetivo son distintos. Se permiten varios ciclos por día, no existe `UNIQUE(employee,date)`, y un índice parcial garantiza un único registro abierto; conflictos se traducen a 409. No hay operación toggle. |
| Enabler HU-023 | `/api/v1/attendance/me` resuelve el Employee desde el usuario autenticado, no acepta `employeeId`, usa fechas de negocio y paginación, y mantiene aislamiento entre empleados. |
| Tiempo real | El hub `/hubs/attendance` queda limitado a ADMIN/ENC. La notificación se abstrae de Application, se emite solo post-commit y un fallo posterior no revierte datos persistidos. |
| Contrato frontend | Tras estabilizar OpenAPI, el único cambio frontend permitido es `frontend/src/types/api.generated.ts`, generado por `pnpm run api:generate`; no se edita manualmente ni se implementan features frontend. |

## Áreas afectadas

- Capas `Domain`, `Application`, `Infrastructure` y `Api` del backend, incluida la configuración de Identity, JWT, EF Core, SignalR y políticas.
- Migraciones y snapshot de EF Core, partiendo de la única migración inicial `InitialIdentity`.
- Suite de integración, configuración de PostgreSQL de pruebas y CI para validar constraints reales.
- Metadatos OpenAPI y tipos TypeScript generados.
- Documentación narrativa de HU-001, HU-003, HU-016 y HU-022, una vez que el contrato esté congelado.

## Exclusiones explícitas

- Interfaces, páginas, hooks, formularios o cualquier feature frontend; salvo la posterior generación de tipos API.
- HU-002, HU-004, HU-005, HU-024 y cualquier historia no enumerada como núcleo de este change.
- Administración CRUD de usuarios, gestión de dispositivos, blacklist de access tokens y login por email.
- Composición de productos, inventario/stock, compras y conversiones de empaque.
- Ampliar el enabler `/attendance/me` a una entrega funcional de HU-023 o HU-024.
- Sincronización global de documentación histórica durante este Sprint.

## Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Una migración altera Identity existente o cambia sus claves. | Revisar el diff de migración; probar actualización desde `InitialIdentity` y desde una base vacía; rechazar recreación o re-keying de tablas Identity. |
| Exponer APIs antes de que Auth/AuthZ sea consistente. | Gates obligatorios con pruebas de 401, 403, multirol y runtime antes de las APIs protegidas. |
| Filtrar refresh tokens o crear cuentas de prueba en producción. | Persistir solo hashes, usar cookies/configuración correcta y validar explícitamente que el seeder no actúa fuera de Development. |
| La concurrencia permite dos asistencias abiertas. | Mantener el índice parcial de registro abierto y traducir su conflicto a 409, con pruebas PostgreSQL concurrentes. |
| Notificaciones inconsistentes con datos persistidos. | Emitir eventos solo post-commit y no revertir un commit por un fallo del notifier. |
| Contratos REST y tipos generados divergen. | Congelar y revisar OpenAPI antes de ejecutar la generación; no introducir código frontend consumidor. |

## Rollback

El rollback se ejecutará por incrementos revisables y por gates. Las migraciones Sprint 1 deben disponer de `Down` razonable únicamente sobre bases descartables; no se modificará ni revertirá `InitialIdentity`. Ante una regresión de Auth, AuthZ, persistencia o tiempo real, se detiene el avance en el gate correspondiente y se revierte el incremento que introdujo la regresión, preservando el esquema y las claves Identity de la baseline.

## Criterios de éxito

- HU-001 ofrece login por username, refresh, logout y `me` con las reglas de token, sesión y cuenta acordadas.
- Las APIs de HU-003, HU-016 y HU-022 solo son accesibles bajo la matriz de autorización acordada y no existe el rol CAJERO.
- Las rutas de migración desde `InitialIdentity` y desde una base vacía son reproducibles, sin cambios de clave ni recreación de Identity.
- Los seis usuarios Development se crean de forma idempotente y no aparecen en una ejecución Production.
- Catálogo, proveedores y asistencia cumplen sus reglas de soft delete, restricciones, roles, timezone, concurrencia y errores de conflicto.
- `/attendance/me` habilita el consumo posterior de HU-023 sin incluir alcance adicional de frontend o HU-024.
- SignalR publica únicamente cambios de asistencia confirmados y rechaza roles no operacionales.
- OpenAPI representa los endpoints REST finales y los tipos generados son el único artefacto frontend modificado.
- Las pruebas, validaciones runtime y documentación de contratos registran evidencia real antes de declarar el change terminado.

## Deuda documental diferida

La sincronización global se pospone, pero deberá registrar y resolver estas inconsistencias después del Sprint 1:

1. La discrepancia entre referencias documentales a Identity con GUID/público y la baseline real con claves `string` en el esquema `identity`.
2. La documentación histórica que describe automarcado de asistencia, incompatible con actor JWT y Employee objetivo distintos.
3. Inconsistencias entre documentación de seguridad, CI y tiempo real respecto de la implementación y los contratos validados.
