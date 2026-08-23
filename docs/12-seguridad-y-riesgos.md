# 12 — Seguridad y riesgos

## 1. Propósito

Este documento define la baseline de **seguridad, privacidad y gestión de riesgos** de **Restaurant System** para Fratelli.

Su objetivo es establecer:

- qué activos deben protegerse;
- qué datos personales maneja el MVP;
- cómo se autentican y autorizan los usuarios;
- cómo se protegen frontend, backend, PostgreSQL y SignalR;
- cómo se administran secretos y configuración;
- cómo se opera el sistema en desarrollo local y en el entorno de demostración del HomeLab;
- qué riesgos técnicos, de proyecto, de datos y de seguridad existen;
- quién realiza el seguimiento de cada riesgo;
- qué mitigaciones y contingencias deberán aplicarse.

Este documento no sustituye las validaciones de seguridad que deberán ejecutarse durante la implementación.

---

# 2. Documentos de entrada

La baseline se apoya en:

```text
docs/05-alcance-y-mvp.md
docs/06-srs.md
docs/requirements/requisitos-funcionales.md
docs/requirements/requisitos-no-funcionales.md
docs/requirements/reglas-negocio.md
docs/07-product-backlog.md
docs/08-scrum-y-refinamiento.md
docs/09-ux-y-flujos.md
docs/10-arquitectura.md
docs/11-modelo-datos.md
```

---

# 3. Alcance de seguridad

La seguridad de esta versión comprende:

```text
Frontend React
Backend ASP.NET Core
ASP.NET Core Identity
JWT
SignalR
PostgreSQL
OpenAPI en desarrollo
HomeLab de demostración
Variables de entorno
Roles y permisos
Auditoría operativa
Backups pre-demo
```

No comprende en el MVP:

```text
biometría
impresora térmica
storage externo
acceso de clientes finales
recuperación de contraseña por correo
offline-first
alta disponibilidad
microservicios
SIEM
SOC
WAF dedicado
gestión avanzada de secretos
multi-factor authentication
```

Estos elementos podrán evaluarse posteriormente.

---

# 4. Principios de seguridad

## 4.1. Mínimo privilegio

Cada usuario debe disponer únicamente de los accesos requeridos para sus responsabilidades.

---

## 4.2. Backend como autoridad

La interfaz puede ocultar opciones no permitidas, pero toda autorización relevante debe verificarse nuevamente en backend.

```text
ocultar botón
≠
autorizar operación
```

---

## 4.3. Defensa en profundidad

Se aplicarán controles en varias capas:

```text
Frontend
Backend
Domain/Application
Base de datos
Configuración
Entorno de despliegue
```

---

## 4.4. Minimización de datos

Solo se recopilan datos necesarios para el MVP.

---

## 4.5. Trazabilidad

Las operaciones relevantes deben conservar:

- usuario responsable;
- fecha/hora;
- estado;
- motivo cuando corresponda.

---

## 4.6. Fallo seguro

Ante errores:

- no se exponen secretos;
- no se muestran stack traces al usuario;
- no se considera exitosa una operación incompleta;
- las transacciones críticas deben hacer rollback.

---

# 5. Activos a proteger

Los principales activos son:

| Activo                        | Importancia |
| ----------------------------- | ----------- |
| Credenciales de usuarios      | Alta        |
| Tokens de autenticación       | Alta        |
| Cadena de conexión PostgreSQL | Alta        |
| Clave de firma JWT            | Alta        |
| Información de ventas         | Alta        |
| Inventario                    | Alta        |
| Compras                       | Alta        |
| Cierres de caja               | Alta        |
| Asistencia de trabajadores    | Alta        |
| Datos personales de empleados | Alta        |
| Datos básicos de clientes     | Media       |
| Configuración de despliegue   | Alta        |
| Código fuente                 | Media/Alta  |
| OpenAPI del backend           | Media       |
| Logs                          | Media/Alta  |
| Backups                       | Alta        |

---

# 6. Datos personales del MVP

## 6.1. Empleados

Se almacenan principalmente:

```text
nombre
cuenta asociada cuando exista
asistencia
asignación a turnos
trazabilidad operativa
```

---

## 6.2. Clientes

Se almacenan únicamente los datos requeridos por el alcance:

```text
nombre
teléfono opcional
observaciones operativas cuando correspondan
```

No se incorpora:

```text
historial crediticio
documentación personal
fotografía
datos biométricos
información médica
dirección domiciliaria obligatoria
```

---

## 6.3. Usuarios

ASP.NET Core Identity administra:

- credencial;
- hash de contraseña;
- roles;
- metadatos técnicos de autenticación.

Las contraseñas nunca se almacenan en texto plano.

---

# 7. Clasificación de datos

## Nivel ALTO

```text
password hashes
JWT signing key
refresh tokens
connection strings
credenciales PostgreSQL
cierres de caja
auditoría de operaciones críticas
```

## Nivel MEDIO

```text
ventas
inventario
compras
asistencia
datos de empleados
datos de clientes
```

## Nivel BAJO

```text
catálogos no sensibles
unidades
categorías
datos técnicos públicos de la UI
```

Esta clasificación es operativa para el proyecto y no pretende representar una norma regulatoria formal.

---

# 8. Autenticación

Se utilizará:

```text
ASP.NET Core Identity
+
JWT Bearer
```

Identity será responsable de:

- usuarios;
- contraseñas;
- hashing;
- lockout;
- roles;
- relación usuario-rol.

---

# 9. Sesión

La sesión se implementará mediante:

```text
Access Token
→ JWT
→ vida corta

Refresh Token
→ cookie HttpOnly
→ sesión extendida
```

Duraciones:

```text
Access Token:
15 minutos

Refresh Token / sesión máxima:
12 horas
```

La duración de 12 horas contempla que una jornada de trabajo en un restaurante puede extenderse más allá de un turno convencional.

---

# 10. Access Token

El access token:

- será de corta duración;
- se mantendrá en memoria de la aplicación frontend;
- se adjuntará únicamente a solicitudes autorizadas;
- no se almacenará permanentemente en `localStorage`.

Ante recarga de página, el frontend podrá recuperar una sesión válida utilizando el refresh token.

---

# 11. Refresh Token

El refresh token:

```text
Cookie HttpOnly
Secure en ambientes HTTPS
SameSite configurado según despliegue
```

El JavaScript del navegador no debe poder leer directamente el token.

La cookie será utilizada exclusivamente para el mecanismo de renovación.

---

# 12. Renovación

Flujo:

```text
Access Token expira
        ↓
frontend solicita refresh
        ↓
backend valida refresh token
        ↓
nuevo Access Token
        ↓
frontend continúa sesión
```

Al superar la duración máxima permitida:

```text
12 horas
→ nuevo login obligatorio
```

---

# 13. Logout

Cerrar sesión implica:

- invalidar el refresh token;
- eliminar la cookie;
- descartar access token en memoria;
- limpiar estado de sesión frontend.

---

# 14. Política de contraseñas

Se adopta una política razonable.

Baseline:

```text
mínimo 8 caracteres
frases de contraseña permitidas
sin cambio periódico obligatorio
```

No se exige artificialmente:

```text
1 mayúscula
1 minúscula
1 número
1 símbolo
cambio cada 30 días
```

si ello no aporta seguridad real.

---

# 15. Hashing

Se utilizará el mecanismo de hashing proporcionado por ASP.NET Core Identity.

Nunca:

```text
guardar contraseña en texto plano
guardar contraseña reversible
registrar contraseña en logs
retornar contraseña por API
```

---

# 16. Lockout

Baseline:

```text
5 intentos fallidos
→ bloqueo temporal aproximado de 15 minutos
```

La configuración exacta deberá quedar centralizada.

El bloqueo no sustituye rate limiting.

---

# 17. Recuperación de contraseña

El MVP no implementa correo de recuperación.

Flujo:

```text
Usuario olvida contraseña
        ↓
contacta a ADMINISTRADOR
        ↓
ADMINISTRADOR reasigna/restablece
        ↓
usuario utiliza nueva contraseña
```

La contraseña anterior no puede recuperarse.

---

# 18. Cambio de contraseña administrativo

La operación:

- requiere rol `ADMINISTRADOR`;
- no debe devolver la contraseña anterior;
- deberá quedar auditada;
- deberá permitir que el usuario vuelva a autenticarse.

Cuando la implementación lo permita, se recomienda invalidar sesiones previas después de un reset administrativo.

---

# 19. Autorización

Roles:

```text
ADMINISTRADOR
ENCARGADO
MESERO
COCINA
CONTADORA
EMPLEADO
```

Un usuario puede poseer más de un rol.

---

# 20. Policies

Se utilizarán policies cuando una capacidad tenga significado de negocio.

Ejemplo:

```text
CanCloseCash
→ ADMINISTRADOR
→ ENCARGADO
```

La policy debe residir en backend.

---

# 21. Principio de unión de roles

Si un usuario tiene:

```text
ENCARGADO
+
MESERO
```

dispone de las capacidades válidas de ambos roles.

Esto no implica que pueda omitir reglas de negocio aplicables al estado de una entidad.

---

# 22. Matriz de acceso resumida

| Capacidad                           | ADMINISTRADOR |       ENCARGADO        |           MESERO           |            COCINA            | CONTADORA | EMPLEADO |
| ----------------------------------- | :-----------: | :--------------------: | :------------------------: | :--------------------------: | :-------: | :------: |
| Administrar usuarios                |      Sí       |           No           |             No             |              No              |    No     |    No    |
| Gestionar catálogo                  |      Sí       | Según permiso definido |             No             | Consulta/operación requerida |    No     |    No    |
| Registrar pedidos                   |      Sí       |           Sí           |             Sí             |              No              |    No     |    No    |
| Operar KDS                          |      Sí       |    Según operación     |             No             |              Sí              |    No     |    No    |
| Registrar producción                |      Sí       |           Sí           |             No             |              Sí              |    No     |    No    |
| Registrar compra general            |      Sí       |           Sí           |             No             |              No              |    No     |    No    |
| Registrar compra de Cocina          |      Sí       |     Según alcance      |             No             |              Sí              |    No     |    No    |
| Registrar gastos                    |      Sí       |           Sí           | Según alcance si se define |              No              |    No     |    No    |
| Registrar asistencia propia         |      Sí       |           Sí           |             Sí             |              Sí              |    Sí     |    Sí    |
| Consultar asistencia administrativa |      Sí       |           Sí           |             No             |              No              |    Sí     |    No    |
| Cerrar caja                         |      Sí       |           Sí           |             No             |              No              |    No     |    No    |
| Consultar cierres                   |      Sí       |           Sí           |       Según alcance        |              No              |    Sí     |    No    |

La matriz deberá mantenerse consistente con RF/RN/HU. Donde se indique “según alcance”, la historia correspondiente debe terminar de formalizar el permiso antes de implementación.

---

# 23. Creación de usuarios

Únicamente:

```text
ADMINISTRADOR
```

puede crear cuentas de usuario en el MVP.

---

# 24. Cancelación y desactivación protegida

Para registros definidos como históricos o no eliminables:

```text
hard delete
→ prohibido
```

Cuando las reglas permitan cancelar/desactivar, la acción deberá requerir:

```text
ADMINISTRADOR
```

si se trata de una operación expresamente protegida.

El dueño de la empresa no constituye un rol técnico separado en esta versión.

Si necesita estas capacidades deberá disponer de rol `ADMINISTRADOR`.

---

# 25. Seguridad frontend

El frontend deberá:

- mantener access token solo en memoria;
- utilizar refresh mediante cookie HttpOnly;
- no almacenar secretos;
- evitar `dangerouslySetInnerHTML` salvo necesidad justificada;
- escapar/renderizar datos mediante mecanismos seguros de React;
- no confiar en datos del navegador como autoridad;
- no exponer información de módulos no autorizados;
- no editar manualmente el cliente OpenAPI generado.

---

# 26. XSS

Principales medidas:

- evitar HTML dinámico sin sanitización;
- validar entradas también en backend;
- no guardar JWT de acceso en almacenamiento persistente;
- no introducir secretos dentro del bundle frontend;
- revisar dependencias.

---

# 27. Route Guards

Los guards frontend sirven para UX.

```text
Route Guard
→ evita navegación accidental

Backend Authorization
→ protege realmente el recurso
```

Toda ruta protegida debe mapear a endpoints igualmente protegidos.

---

# 28. Seguridad del backend

El backend deberá:

- autenticar cada endpoint protegido;
- verificar roles/policies;
- validar DTOs;
- no aceptar IDs de auditoría enviados libremente como autoridad;
- utilizar DTOs separados de entidades;
- aplicar transacciones;
- manejar excepciones centralmente;
- utilizar consultas parametrizadas mediante EF Core;
- proteger operaciones críticas frente a doble ejecución.

---

# 29. Mass Assignment

No se expondrán entidades completas para binding automático.

Ejemplo incorrecto:

```text
POST /sales
body = Sale entity completa
```

Se utilizarán DTOs específicos:

```text
CreateSaleRequest
```

que contengan únicamente los campos permitidos.

---

# 30. Auditoría de usuario

Campos como:

```text
created_by_user_id
confirmed_by_user_id
received_by_user_id
closed_by_user_id
```

se obtienen desde el usuario autenticado o desde una operación controlada.

No se confía en un `userId` arbitrario enviado por frontend.

---

# 31. Manejo de errores

Se utilizará:

```text
ProblemDetails
```

El frontend recibe:

- código;
- mensaje seguro;
- errores de validación.

No recibe:

- stack trace;
- SQL;
- connection string;
- claves;
- detalles internos innecesarios.

---

# 32. Logging seguro

Nunca registrar:

```text
password
access token
refresh token
JWT signing key
connection string completa
credenciales PostgreSQL
```

Los logs sí pueden registrar:

- correlation/request id;
- usuario autenticado cuando corresponda;
- endpoint;
- resultado;
- código de error;
- timestamps.

---

# 33. PostgreSQL

PostgreSQL deberá ser accesible únicamente desde:

- backend;
- entornos administrativos autorizados.

No se expondrá directamente a Internet como requisito de la aplicación.

---

# 34. Credenciales PostgreSQL

Se almacenan mediante configuración segura.

Local:

```text
User Secrets
o
variables locales ignoradas por Git
```

HomeLab:

```text
environment variables
```

Nunca en:

```text
appsettings.json comprometido
README
frontend
capturas
logs
```

---

# 35. Usuario PostgreSQL

Para ejecución de la aplicación se recomienda utilizar un usuario específico del sistema.

No utilizar permanentemente:

```text
postgres superuser
```

como identidad de la aplicación.

Los privilegios deberán limitarse a lo que necesita el sistema.

---

# 36. Integridad PostgreSQL

La base reforzará:

- PK;
- FK;
- UNIQUE;
- CHECK;
- NOT NULL;
- índices únicos parciales;
- restricciones históricas.

Las validaciones de DB complementan Application/Domain.

---

# 37. Transacciones

Operaciones críticas:

```text
venta
producción
recepción de compra
cierre
```

deberán ser transaccionales.

Una excepción intermedia debe:

```text
ROLLBACK
```

y no dejar estados parciales.

---

# 38. Inventario y concurrencia

Riesgo:

```text
dos operaciones simultáneas
→ modificar misma existencia
```

Mitigaciones:

- transacción;
- actualización consistente;
- validaciones dentro de transacción;
- estrategia de concurrencia optimista si la implementación demuestra necesidad;
- pruebas de integración.

El stock negativo permitido por negocio no debe confundirse con inconsistencia de concurrencia.

---

# 39. SignalR

Hub inicial:

```text
/hubs/kitchen
```

SignalR se utiliza para notificar cambios de comandas.

---

# 40. Autenticación SignalR

Las conexiones al hub deben requerir usuario autenticado cuando el cliente necesite recibir información operativa protegida.

No se permitirá conectar anónimamente al KDS en la versión de producción/demo.

---

# 41. Autorización SignalR

El hub deberá limitarse a los usuarios con roles/capacidades autorizadas.

Principalmente:

```text
COCINA
ADMINISTRADOR
```

y otros roles solo cuando exista un caso de uso explícito.

---

# 42. Datos transmitidos por SignalR

Enviar únicamente la información necesaria.

Preferencia:

```text
evento
+
id
+
datos mínimos
```

y luego refrescar mediante REST cuando sea conveniente.

SignalR no debe convertirse en una segunda API completa.

---

# 43. Reconexión

Ante desconexión:

```text
intento de reconexión
        ↓
reautenticación/renovación si corresponde
        ↓
refresco REST
```

No existe cola offline.

---

# 44. Tokens y WebSocket

Si SignalR requiere acceso al token durante negociación/conexión:

- utilizar el mecanismo oficial del cliente;
- evitar imprimir el token;
- evitar capturarlo en logs;
- renovar conexión cuando cambie el access token si fuese necesario.

---

# 45. CORS

Desarrollo local:

```text
Frontend:
http://localhost:8087

Backend:
http://localhost:5057
```

CORS deberá permitir únicamente los orígenes requeridos.

No utilizar de forma indiscriminada:

```text
AllowAnyOrigin
```

en entornos de demo/producción.

---

# 46. HTTPS

En:

```text
localhost
```

se permite HTTP durante desarrollo cuando resulte práctico.

Cuando exista exposición mediante Funnel:

```text
HTTPS
→ obligatorio
```

para credenciales y sesiones.

---

# 47. Cookies

El refresh token en entorno HTTPS deberá utilizar:

```text
HttpOnly
Secure
```

`SameSite` deberá configurarse de acuerdo con la topología final.

La preferencia arquitectónica es despliegue same-origin:

```text
/
→ frontend

/api/
→ backend

/hubs/
→ SignalR
```

lo que simplifica la política de cookies.

---

# 48. CSRF

El access token Bearer no depende de cookies para las llamadas normales.

El endpoint de refresh sí utiliza cookie HttpOnly.

Por ello deberá:

- aplicar una política `SameSite` apropiada;
- restringir origen/CORS;
- validar el flujo de refresh;
- evitar aceptar refresh desde orígenes arbitrarios.

Si el despliegue final requiere cookies cross-site, deberá revisarse explícitamente protección CSRF antes de exponerlo.

---

# 49. Rate limiting

Se aplicará rate limiting básico.

Especial atención:

```text
/api/v1/auth/login
/api/v1/auth/refresh
```

La protección de login combina:

```text
rate limiting
+
Identity lockout
```

Para el resto de la API podrá existir una política global suficientemente alta para evitar abusos accidentales sin interferir con la operación normal.

Las cifras globales definitivas deberán probarse antes de fijarse.

---

# 50. OpenAPI y Swagger — Development

En desarrollo local:

```text
Environment = Development
```

se habilita:

```text
/openapi/v1.json
/swagger
```

Objetivos:

- generación del cliente frontend;
- pruebas;
- inspección de contratos;
- documentación durante desarrollo.

---

# 51. OpenAPI y Swagger — HomeLab/Funnel

En el entorno de demostración:

```text
Environment = Production
```

se deshabilitan públicamente:

```text
/swagger
/openapi/v1.json
```

El frontend no depende de ellos en runtime.

---

# 52. Generación del cliente antes de demo

Flujo:

```text
Backend local
    ↓
OpenAPI
    ↓
npm run api:generate
    ↓
src/api/generated/
    ↓
build frontend
    ↓
HomeLab
```

El cliente generado forma parte del build.

---

# 53. Razón para ocultar OpenAPI en Funnel

No se considera OpenAPI un secreto en sí mismo, pero exponerlo públicamente facilita inventariar:

- rutas;
- DTOs;
- operaciones administrativas;
- parámetros;
- errores.

Como no existe necesidad de API pública, se aplica reducción de superficie de exposición.

---

# 54. HomeLab

El HomeLab es:

```text
ambiente de demostración/pruebas integradas
```

No se considera automáticamente ambiente de producción real.

---

# 55. Flujo de trabajo de pruebas

Cada miembro del equipo ejecutará inicialmente:

```text
Frontend local
+
Backend local
+
PostgreSQL accesible según configuración
```

en su computadora personal.

La demostración de la materia utilizará posteriormente un entorno Docker en HomeLab.

---

# 56. HomeLab con exposición externa

Al utilizar Funnel, se debe considerar que la aplicación puede quedar accesible desde Internet durante el periodo de demostración.

Por ello:

- HTTPS;
- Swagger deshabilitado;
- OpenAPI deshabilitado;
- PostgreSQL no expuesto públicamente;
- secretos fuera de imagen/código;
- CORS restringido;
- contraseñas de demostración no triviales;
- logs sin secretos.

---

# 57. Docker de demostración

El entorno podrá contener:

```text
frontend container
backend container
```

PostgreSQL puede utilizar la instancia ya existente en el HomeLab.

---

# 58. Imágenes Docker

No incluir:

```text
.env real
User Secrets
passwords
connection strings
JWT key
```

dentro de la imagen.

Los secretos se inyectan en runtime.

---

# 59. Secrets

Nunca se versionan:

```text
JWT__Key
PostgreSQL password
connection string real
refresh token
credentials
```

El repositorio podrá contener:

```text
.env.example
appsettings.example.json
```

sin valores reales.

---

# 60. JWT Signing Key

Debe:

- tener suficiente entropía;
- almacenarse fuera de Git;
- ser diferente entre desarrollo compartido y demo cuando sea razonable;
- poder rotarse.

No deberá reutilizarse una contraseña personal como signing key.

---

# 61. Dependencias

Frontend y backend deberán:

- utilizar package managers oficiales;
- mantener lockfiles;
- revisar vulnerabilidades conocidas;
- evitar dependencias innecesarias;
- no instalar paquetes solo por moda.

---

# 62. Lockfiles

Frontend:

```text
package-lock.json
```

o el lockfile correspondiente al gestor elegido deberá versionarse.

Backend:

```text
.csproj
```

define versiones de paquetes y deberá mantenerse controlado.

---

# 63. Backups

Los backups son una medida operativa, no una HU funcional.

---

# 64. Desarrollo

Durante desarrollo:

```text
backup manual
```

cuando se vaya a ejecutar una modificación destructiva importante o se necesite preservar datos de prueba relevantes.

---

# 65. Pre-demo / entrega

Antes de una demostración importante:

```text
pg_dump
→ obligatorio
```

El backup debe guardarse fuera del contenedor/backend que se pretende reemplazar.

---

# 66. Post-MVP

Una operación real deberá evaluar:

- backups automáticos;
- periodicidad;
- retención;
- almacenamiento;
- cifrado;
- restauración probada.

No forma parte del MVP.

---

# 67. Restauración

Un backup no se considera útil únicamente porque exista.

Para una futura operación productiva deberá verificarse periódicamente la capacidad de restaurar.

Durante este proyecto bastará con validar el procedimiento al menos cuando se configure el entorno de demo.

---

# 68. Auditoría

El sistema conserva auditoría práctica mediante:

```text
created_at
created_by_user_id
updated_at
updated_by_user_id
confirmed_by_user_id
received_by_user_id
closed_by_user_id
cancelled_by_user_id
```

según corresponda.

No se implementa un ledger global inmutable de auditoría.

---

# 69. Datos históricos

No se eliminan físicamente:

```text
sales
purchases
inventory_movements
productions
attendance_records
cash_sessions
cash_closings
```

El historial es parte de la integridad del sistema.

---

# 70. Minimización de exposición

Las respuestas API deben devolver únicamente campos necesarios para la operación.

Ejemplo:

un endpoint de Cocina no necesita devolver:

```text
datos completos de cliente
cierres de caja
información administrativa
```

---

# 71. Gestión básica de incidentes

Ante un incidente de seguridad:

1. detener exposición si existe riesgo activo;
2. conservar evidencia técnica;
3. identificar alcance;
4. revocar tokens/sesiones si aplica;
5. rotar secretos comprometidos;
6. restaurar datos si aplica;
7. corregir causa;
8. volver a probar;
9. registrar el incidente y la acción tomada.

---

# 72. Riesgos — escala de probabilidad

| Valor | Nivel | Interpretación                    |
| ----- | ----- | --------------------------------- |
| 1     | Baja  | Poco probable durante el proyecto |
| 2     | Media | Puede ocurrir                     |
| 3     | Alta  | Es razonablemente probable        |

---

# 73. Riesgos — escala de impacto

| Valor | Nivel | Interpretación                          |
| ----- | ----- | --------------------------------------- |
| 1     | Bajo  | Impacto menor/reversible                |
| 2     | Medio | Afecta una parte relevante              |
| 3     | Alto  | Amenaza entrega, integridad o seguridad |

---

# 74. Prioridad

```text
Prioridad = Probabilidad × Impacto
```

Clasificación:

```text
1–2 → Baja
3–4 → Media
6–9 → Alta
```

Esta matriz sirve para priorizar seguimiento y no constituye una estimación estadística formal.

---

# 75. Registro de riesgos

## R-001 — Tiempo reducido

**Categoría:** proyecto  
**Causa:** tres Sprints de cuatro días y amplio alcance MVP.  
**Probabilidad:** 3 — Alta  
**Impacto:** 3 — Alto  
**Prioridad:** 9 — Alta  
**Responsable de seguimiento:** Scrum Master  
**Mitigación:**

- priorizar dependencias;
- aplicar DoR;
- limitar cambios;
- trabajar verticalmente;
- evitar sobrearquitectura.

**Contingencia:**

- renegociar orden del backlog con PO;
- preservar primero el núcleo crítico;
- documentar alcance realmente terminado.

**Estado:** Abierto.

---

# 76. R-002 — Concentración de backend/DB en una persona

**Categoría:** personas/técnico  
**Causa:** responsabilidad principal de backend, DB y arquitectura concentrada en Alex Fernandez.  
**Probabilidad:** 3 — Alta  
**Impacto:** 3 — Alto  
**Prioridad:** 9 — Alta  
**Responsable de seguimiento:** Scrum Master  
**Mitigación:**

- OpenAPI temprano;
- cliente generado;
- modularidad;
- documentación;
- contratos claros;
- scaffolding;
- evitar bloquear frontend.

**Contingencia:**

- reducir cambios técnicos no críticos;
- reasignar tareas de frontend;
- priorizar endpoints habilitantes.

**Estado:** Abierto.

---

# 77. R-003 — Dependencias entre HU

**Categoría:** planificación  
**Causa:** historias de venta, inventario, compras y cierre dependen de capacidades anteriores.  
**Probabilidad:** 3 — Alta  
**Impacto:** 2 — Medio  
**Prioridad:** 6 — Alta  
**Responsable:** Scrum Master + responsables de HU  
**Mitigación:**

- ordenar por dependencias;
- aplicar DoR;
- identificar historias habilitantes.

**Contingencia:**

- trabajar HU independientes mientras se resuelve el bloqueo;
- mover historia a `Blocked`.

**Estado:** Abierto.

---

# 78. R-004 — Cambios tardíos de requisitos

**Categoría:** alcance  
**Causa:** nueva información o decisiones durante implementación.  
**Probabilidad:** 2 — Media  
**Impacto:** 3 — Alto  
**Prioridad:** 6 — Alta  
**Responsable:** Product Owner + Scrum Master  
**Mitigación:**

- baseline vigente;
- gestión de cambios;
- validar dudas antes del Sprint;
- evitar reinterpretaciones sin PO.

**Contingencia:**

- análisis de impacto;
- actualizar RF/RN/HU;
- reordenar backlog;
- no introducir cambios silenciosos.

**Estado:** Abierto.

---

# 79. R-005 — Inexperiencia inicial con SignalR

**Categoría:** tecnología  
**Causa:** incorporación de SignalR como tecnología de aprendizaje.  
**Probabilidad:** 2 — Media  
**Impacto:** 2 — Medio  
**Prioridad:** 4 — Media  
**Responsable:** responsable backend / Scrum Master  
**Mitigación:**

- limitar SignalR a KDS;
- usar REST como fuente de verdad;
- prototipo técnico temprano;
- reconexión simple.

**Contingencia:**

- mantener funcionalidad mediante refresh/polling temporal si SignalR bloquea el Sprint;
- registrar la desviación arquitectónica si se vuelve definitiva.

**Estado:** Abierto.

---

# 80. R-006 — Desincronización frontend/backend

**Categoría:** integración  
**Causa:** varios desarrolladores frontend y evolución simultánea de endpoints.  
**Probabilidad:** 3 — Alta  
**Impacto:** 2 — Medio  
**Prioridad:** 6 — Alta  
**Responsable:** Scrum Master + responsables de HU  
**Mitigación:**

- OpenAPI;
- DTOs;
- cliente generado;
- `npm run api:generate`;
- contratos definidos antes de desarrollo paralelo.

**Contingencia:**

- congelar temporalmente contrato;
- regenerar cliente;
- corregir feature afectada;
- evitar parches manuales en `api/generated`.

**Estado:** Abierto.

---

# 81. R-007 — Pérdida/corrupción de datos

**Categoría:** datos  
**Causa:** errores, migrations, fallos de entorno o acciones manuales.  
**Probabilidad:** 2 — Media  
**Impacto:** 3 — Alto  
**Prioridad:** 6 — Alta  
**Responsable:** responsable backend/DB  
**Mitigación:**

- migrations;
- transacciones;
- constraints;
- backups pre-demo;
- no modificar schema manualmente sin control.

**Contingencia:**

- restaurar `pg_dump`;
- reconstruir ambiente;
- revisar migration causante.

**Estado:** Abierto.

---

# 82. R-008 — Acceso indebido por roles

**Categoría:** seguridad  
**Causa:** endpoint sin `Authorize`, policy incorrecta o confianza en frontend.  
**Probabilidad:** 2 — Media  
**Impacto:** 3 — Alto  
**Prioridad:** 6 — Alta  
**Responsable:** responsable backend/seguridad  
**Mitigación:**

- autorización backend;
- tests por rol;
- mínimo privilegio;
- revisión en DoD.

**Contingencia:**

- bloquear endpoint;
- corregir policy;
- revisar operaciones afectadas;
- invalidar sesiones si corresponde.

**Estado:** Abierto.

---

# 83. R-009 — Exposición de secretos

**Categoría:** seguridad  
**Causa:** `.env`, appsettings, logs o imagen Docker mal configurados.  
**Probabilidad:** 2 — Media  
**Impacto:** 3 — Alto  
**Prioridad:** 6 — Alta  
**Responsable:** responsable backend/HomeLab  
**Mitigación:**

- User Secrets;
- `.gitignore`;
- environment variables;
- revisión antes de commit;
- logs seguros.

**Contingencia:**

- rotar secreto;
- cambiar contraseña DB;
- reemplazar JWT key;
- revisar historial Git si fue comprometido.

**Estado:** Abierto.

---

# 84. R-010 — Inconsistencia de inventario por concurrencia

**Categoría:** datos/tecnología  
**Causa:** operaciones simultáneas que afectan la misma existencia.  
**Probabilidad:** 2 — Media  
**Impacto:** 3 — Alto  
**Prioridad:** 6 — Alta  
**Responsable:** responsable backend/DB  
**Mitigación:**

- ledger;
- transacciones;
- pruebas de integración;
- actualización consistente.

**Contingencia:**

- registrar ajuste auditado;
- corregir caso de uso;
- agregar control de concurrencia optimista si se demuestra necesario.

**Estado:** Abierto.

---

# 85. R-011 — Integración tardía entre módulos

**Categoría:** proyecto/integración  
**Causa:** features desarrolladas aisladamente hasta el final.  
**Probabilidad:** 2 — Media  
**Impacto:** 3 — Alto  
**Prioridad:** 6 — Alta  
**Responsable:** Scrum Master  
**Mitigación:**

- integración continua por HU;
- builds frecuentes;
- entorno local reproducible;
- contrato OpenAPI.

**Contingencia:**

- priorizar integración sobre nuevas features;
- congelar alcance adicional.

**Estado:** Abierto.

---

# 86. R-012 — Indisponibilidad del HomeLab durante demostración

**Categoría:** infraestructura  
**Causa:** red, host, Docker, Funnel o PostgreSQL no disponibles.  
**Probabilidad:** 2 — Media  
**Impacto:** 3 — Alto  
**Prioridad:** 6 — Alta  
**Responsable:** responsable HomeLab  
**Mitigación:**

- preparar demo con anticipación;
- probar desde una red externa;
- verificar containers;
- backup DB;
- conservar ejecución local funcional.

**Contingencia:**

- ejecutar demostración local;
- disponer de una máquina preparada;
- restaurar contenedores/configuración.

**Estado:** Abierto.

---

# 87. R-013 — Swagger/OpenAPI expuesto accidentalmente

**Categoría:** seguridad/configuración  
**Causa:** HomeLab ejecutado con `Development` o configuración incorrecta.  
**Probabilidad:** 2 — Media  
**Impacto:** 2 — Medio  
**Prioridad:** 4 — Media  
**Responsable:** responsable backend/HomeLab  
**Mitigación:**

- `Production` en demo;
- condicionar OpenAPI/Swagger al ambiente;
- checklist pre-demo.

**Contingencia:**

- cerrar endpoints;
- corregir environment;
- redesplegar.

**Estado:** Abierto.

---

# 88. R-014 — Token/sesión comprometida

**Categoría:** seguridad  
**Causa:** XSS, equipo compartido o exposición accidental.  
**Probabilidad:** 1 — Baja  
**Impacto:** 3 — Alto  
**Prioridad:** 3 — Media  
**Responsable:** responsable backend/seguridad  
**Mitigación:**

- access token corto;
- access token en memoria;
- refresh HttpOnly;
- HTTPS;
- evitar XSS;
- logout.

**Contingencia:**

- invalidar refresh token;
- resetear credenciales;
- revisar actividad afectada.

**Estado:** Abierto.

---

# 89. R-015 — Dependencia vulnerable

**Categoría:** supply chain  
**Causa:** paquete frontend o NuGet con vulnerabilidad conocida.  
**Probabilidad:** 2 — Media  
**Impacto:** 2 — Medio  
**Prioridad:** 4 — Media  
**Responsable:** responsable técnico de la HU afectada  
**Mitigación:**

- lockfiles;
- revisión de dependencias;
- evitar paquetes innecesarios;
- actualizaciones controladas.

**Contingencia:**

- actualizar/reemplazar dependencia;
- aplicar parche;
- deshabilitar capacidad afectada si fuese necesario.

**Estado:** Abierto.

---

# 90. Seguimiento de riesgos

Durante cada Sprint:

- revisar riesgos de prioridad Alta;
- actualizar estado;
- registrar riesgos nuevos;
- cerrar riesgos que ya no apliquen;
- convertir problemas ocurridos en incidentes/bloqueos, no mantenerlos únicamente como “riesgo”.

---

# 91. Responsables de seguimiento

Criterio general:

```text
Riesgos técnicos generales
→ Scrum Master / Alex

Riesgos de alcance y requisitos
→ Product Owner + Scrum Master

Riesgos propios de una HU
→ responsable de la HU

Backend / DB / HomeLab
→ Alex
```

Responsable de seguimiento no significa única persona encargada de resolverlo.

---

# 92. Checklist de seguridad antes de Sprint

Antes de considerar una HU sensible como Ready deberá verificarse, cuando corresponda:

- rol identificado;
- datos sensibles identificados;
- autorización definida;
- errores definidos;
- transacción identificada;
- auditoría identificada;
- secretos/integraciones identificados;
- pruebas de permiso previstas.

---

# 93. Checklist antes de Review/Done

Para historias con impacto de seguridad:

```text
[ ] backend valida autorización
[ ] frontend no es única barrera
[ ] no se exponen datos innecesarios
[ ] errores no filtran detalles
[ ] tests de permiso ejecutados
[ ] secretos no comprometidos
[ ] auditoría funciona
[ ] documentación afectada actualizada
```

---

# 94. Checklist pre-demo HomeLab

Antes de exponer mediante Funnel:

```text
[ ] Environment = Production
[ ] Swagger deshabilitado
[ ] OpenAPI público deshabilitado
[ ] HTTPS activo
[ ] PostgreSQL no expuesto públicamente
[ ] JWT key configurada por environment variable
[ ] credenciales DB fuera de Git
[ ] CORS restringido
[ ] refresh cookie Secure/HttpOnly
[ ] pg_dump realizado
[ ] frontend compilado con cliente OpenAPI actual
[ ] SignalR probado
[ ] health check probado
[ ] prueba desde red externa realizada
[ ] fallback local disponible
```

---

# 95. Aspectos Post-MVP

Podrán evaluarse posteriormente:

```text
MFA
recuperación por email
rotación automatizada de secrets
storage externo
backups automáticos
retención formal
auditoría avanzada
centralización de logs
monitoring
WAF
rate limiting avanzado
hardware
biometría
```

No deben introducirse silenciosamente en los Sprints MVP.

---

# 96. Riesgo aceptado — No MFA

El MVP no utiliza MFA.

Justificación:

- sistema interno;
- alcance académico;
- tiempo limitado;
- autenticación mediante contraseña + lockout + sesión segura.

Riesgo residual:

una credencial comprometida puede permitir acceso hasta que sea invalidada.

Se acepta para MVP.

---

# 97. Riesgo aceptado — Sin backup automático

No se implementa backup automático durante los tres Sprints.

Mitigación:

```text
pg_dump pre-demo
+
migrations reproducibles
```

Se acepta como limitación del entorno académico.

---

# 98. Riesgo aceptado — Sin alta disponibilidad

El HomeLab puede representar un único punto de fallo.

Se acepta porque es ambiente de demostración.

Contingencia:

```text
entorno local funcional
```

---

# 99. Riesgo aceptado — Refresh de 12 horas

Una sesión extendida aumenta la ventana de riesgo frente a una sesión más corta.

Se acepta debido al contexto operativo de jornadas extendidas.

Se mitiga con:

- access token de 15 min;
- refresh HttpOnly;
- HTTPS;
- logout;
- invalidación tras reset cuando sea posible.

---

# 100. Próximo documento

Después de cerrar seguridad y riesgos, el siguiente documento principal será:

```text
docs/13-pruebas-y-validacion.md
```

Su objetivo será definir cómo se comprobarán:

- RF;
- RN;
- criterios de aceptación;
- permisos;
- transacciones;
- frontend;
- backend;
- integración;
- SignalR;
- modelo de datos;
- validación con PO.

---

# 101. Control de cambios

| Versión | Descripción                                                                                                                                                                               | Estado  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `0.1`   | Baseline de seguridad: Identity/JWT, refresh HttpOnly 12 h, roles/policies, seguridad frontend/backend/DB/SignalR, Swagger/OpenAPI solo Development, HomeLab/Funnel y registro de riesgos | Vigente |
