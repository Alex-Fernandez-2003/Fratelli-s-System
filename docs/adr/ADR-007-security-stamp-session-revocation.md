# ADR-007 — SecurityStamp y revocación de sesiones

## Estado

Aceptado e implementado en HU-002.

## Contexto

Revocar únicamente las refresh sessions no invalida un access JWT ya emitido hasta su expiración. HU-002 requiere que cambios sensibles de una cuenta administrativa —roles, contraseña y activación— corten el acceso anterior del usuario objetivo.

## Decisión

- ASP.NET Identity `SecurityStamp` es la versión de seguridad por usuario.
- Cada JWT incluye el claim privado `rst`: fingerprint `SHA-256` codificado base64url del `SecurityStamp`; nunca se expone el valor bruto.
- `OnTokenValidated` resuelve el usuario actual, requiere su `IsActive`, calcula el fingerprint actual y compara `rst`; una ausencia o diferencia rechaza el token.
- Los cambios de roles rotan el stamp y revocan todas las `UserSession` del objetivo solo si el conjunto de roles cambió realmente.
- Los cambios de contraseña usan las APIs de Identity; su rotación propia evita una doble rotación explícita, y luego se revocan las sesiones objetivo.
- Activar y desactivar rotan el stamp y revocan todas las sesiones objetivo. La administración de la cuenta no sincroniza `Employee.IsActive`.

## Consecuencias

- Los access tokens previos quedan inválidos en la siguiente validación autenticada.
- La API conserva JWT sin consultar filas de sesiones para validar cada access token; las sesiones sirven para refresh y revoke-all por usuario.
- Cada request autenticado consulta el estado/stamp actual del usuario, un coste aceptado para el MVP.
- Se mantiene una frontera explícita entre seguridad de cuenta y estado operativo del empleado.

## Alternativas descartadas

- Revocar solo refresh tokens: deja access JWT válidos hasta su vencimiento.
- Exponer el `SecurityStamp` bruto: divulga un secreto de identidad.
- Blacklist de JWT o caché distribuida: añade infraestructura y estado adicional no requerido para el MVP.
- Rotar siempre en actualizaciones de nombre/username: invalidaría sesiones sin cambio de privilegios.
