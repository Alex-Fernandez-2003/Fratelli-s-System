# Sprint 01 — integración frontend

## Objetivo

Cerrar la integración frontend del Sprint 1 con navegación autorizada, un shell autenticado único, experiencia responsive y documentación current-state, consolidando en `develop` las Historias de Usuario trabajadas durante el Sprint.

## Resultado del Sprint

El Sprint 1 dejó **10 Historias de Usuario con implementación registrada** en `docs/historias/`, pertenecientes a seis épicas del Product Backlog y equivalentes a **41 Story Points** según la estimación inicial del backlog.

Las historias documentadas cubren autenticación, usuarios y roles, catálogo, inventario, pedidos, comandas de cocina, cancelación de pedidos, proveedores, gastos y asistencia.

La implementación funcional está registrada en las 10 HU. Sin embargo, el cierre documental conserva algunos pendientes o limitaciones explícitas que no deben ocultarse:

- `HU-003` implementa productos en backend y frontend; categorías y unidades disponen de API CRUD, pero no de una interfaz dedicada.
- `HU-020` registra la funcionalidad de gastos como implementada para MVP, pero mantiene pendiente la validación manual.
- La validación visual humana global del Sprint en desktop, 403 px y 360 px continúa pendiente de Sprint Review según el registro existente.
- No se encontró en el ZIP auditado un archivo `docs/sprints/sprint-01-review.md`; por tanto, este documento no declara validación final de Product Owner que no esté respaldada documentalmente.

## Historias de Usuario trabajadas

| HU | Historia | Épica | Prioridad | SP | Estado documentado al cierre | Observaciones principales |
| --- | --- | --- | --- | ---: | --- | --- |
| `HU-001` | Iniciar y cerrar sesión | `EPI-01` | MUST | 3 | Implementada end-to-end | Login, refresh, logout y consulta de sesión; sesión máxima de 12 h y rutas protegidas. |
| `HU-002` | Gestión de usuarios y múltiples roles | `EPI-01` | MUST | 5 | Completada para MVP | Administración de cuentas, múltiples roles, contraseña separada, activación/desactivación y navegación autorizada. Ajuste visual menor diferido. |
| `HU-003` | Gestionar productos, ingredientes y platos | `EPI-02` | MUST | 5 | Implementada para productos | Productos con listado, filtros, alta, edición y desactivación. Categorías y unidades tienen API CRUD, pero no UI dedicada. |
| `HU-005` | Gestionar entradas y salidas de inventario | `EPI-02` | MUST | 5 | Implementada para MVP | Consulta de saldos/movimientos y registro manual de entradas y bajas. Sin edición, reversión ni exportación de movimientos. |
| `HU-009` | Pedidos | `EPI-04` | MUST | 5 | Implementada para MVP | Gestión de pedidos, alta y detalle. No incluye venta ni movimientos de inventario. |
| `HU-010` | Comandas de cocina | `EPI-04` | MUST | 5 | Implementada para MVP | Ciclo operativo de comandas en `/cocina`, autorización por roles y actualización en tiempo real con respaldo por polling. |
| `HU-011` | Cancelar pedido | `EPI-04` | MUST | 2 | Implementada para MVP | Cancelación coordinada de pedido/comanda antes de estados no permitidos, con operación atómica e idempotencia autorizada. |
| `HU-016` | Proveedores | `EPI-06` | MUST | 3 | Implementada para MVP | Listado, alta, edición, consulta de inactivos y baja lógica con permisos diferenciados. |
| `HU-020` | Registrar gastos diarios | `EPI-07` | MUST | 3 | Implementada para MVP; validación manual pendiente | Registro de gastos y categorías. Existe un desajuste documentado entre la zona horaria backend por defecto y la utilizada por frontend. |
| `HU-022` | Registrador de entrada y salida de asistencia | `EPI-08` | MUST | 5 | Implementada para MVP | Gestión de asistencia para `ADMINISTRADOR`/`ENCARGADO` e historial propio para usuarios autenticados asociados a un empleado. |
|  | **Total** |  |  | **41** |  |  |

## Alcance implementado

### Acceso, sesión y autorización

- Autenticación mediante usuario y contraseña.
- Renovación y cierre de sesión.
- `AuthProvider`, cliente HTTP común, coordinación de sesión y rutas protegidas.
- Roles activos documentados: `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA` y `EMPLEADO`.
- Soporte de múltiples roles por usuario y navegación basada en permisos.

### Usuarios

- Página `/usuarios` para administración por `ADMINISTRADOR`.
- Listado paginado, búsqueda y filtros.
- Alta de usuarios, edición de múltiples roles, gestión separada de contraseña y activación/desactivación.
- Protección del propio administrador y del último administrador activo según las reglas documentadas en la HU.

### Catálogo

- Gestión frontend y backend de productos.
- Lectura para `ADMINISTRADOR`, `ENCARGADO`, `MESERO` y `COCINA`.
- Escritura para `ADMINISTRADOR` y `ENCARGADO`.
- Baja lógica de productos.
- Categorías y unidades disponibles mediante API CRUD, sin interfaz dedicada en el Sprint.

### Inventario

- Consulta de saldos de inventario.
- Consulta de movimientos.
- Registro manual de entradas y bajas.
- Lectura de saldos para `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA` y `CONTADORA`.
- Historial y movimientos manuales restringidos a `ADMINISTRADOR` y `ENCARGADO`.
- Se mantiene la regla documentada de permitir saldo negativo.

### Pedidos y cocina

- Rutas `/pedidos`, `/pedidos/nuevo` y `/pedidos/:id`.
- Pantalla `/cocina` para el ciclo operativo de comandas.
- SignalR para actualización de cocina con REST como autoridad y polling de respaldo.
- Cancelación coordinada de pedido y comanda con las restricciones de estado documentadas.
- Controles de acciones según rol.

### Proveedores

- Gestión end-to-end en `/proveedores`.
- Lectura para `ADMINISTRADOR`, `ENCARGADO`, `COCINA` y `CONTADORA`.
- Escritura para `ADMINISTRADOR` y `ENCARGADO`.
- Listado de activos/inactivos, creación, edición y baja lógica.

### Gastos

- Registro de gastos en `/gastos`.
- Creación y consulta de categorías para `ADMINISTRADOR` y `ENCARGADO`.
- Validaciones de monto, descripción, fecha y categoría activa en backend.
- No se integró todavía esta funcionalidad con turnos ni saldos de caja.

### Asistencia

- Gestión de asistencia para `ADMINISTRADOR` y `ENCARGADO`.
- Historial propio para usuarios autenticados asociados a un empleado.
- Cálculo de fecha/hora de negocio en servidor.
- Protección para mantener un único registro abierto por empleado.
- Soporte de múltiples ciclos de asistencia cerrados.

### Shell, navegación y responsive

- Sidebar para desktop.
- Topbar con drawer en mobile.
- No existe bottom navigation global.
- Navegación condicionada por roles y rutas protegidas.
- Integración de vistas desktop y mobile en las features documentadas.

## Integración técnica transversal

El Sprint consolidó mecanismos compartidos que son utilizados por varias HU:

- contrato OpenAPI generado para el frontend;
- `httpClient` común;
- TanStack Query para consultas y mutaciones;
- guards y rutas protegidas;
- navegación centralizada por permisos;
- SignalR para cocina y asistencia donde corresponde;
- fallback por polling en los flujos que lo documentan;
- componentes reutilizables y estructura frontend basada en features/Atomic Design.

## Validación y evidencia

- El archivo original del Sprint registra como ejecutados `format:check`, typecheck, lint, tests y build del frontend durante la integración.
- `HU-002` contiene evidencia técnica explícita de backend con **34/34 tests PASS**, frontend con **38/38 tests PASS**, build correcto y regeneración OpenAPI reproducible con hash idéntico.
- Las HU contienen capturas de evidencia para sus flujos principales y la carpeta `docs/capturas/` incluye evidencia visual correspondiente a las 10 historias trabajadas.
- La validación visual humana global de desktop, 403 px y 360 px permanece pendiente según el documento de Sprint existente.
- No se declara una Sprint Review o aceptación final de Product Owner porque el ZIP auditado no contiene `docs/sprints/sprint-01-review.md`.

## Observaciones documentales de cierre

La auditoría documental posterior reconcilió los enlaces de capturas de `HU-003` y `HU-022`, el estado current-state de `14-trazabilidad.md`, las limitaciones históricas de `13-pruebas-y-validacion.md` y las secciones duplicadas de estado de las HU afectadas.

Estas correcciones no cambian por sí solas el estado funcional de las HU. Se mantienen como límites de cierre los pendientes ya declarados en este Sprint: validación manual de `HU-020`, validación visual humana global y ausencia de un documento `sprint-01-review.md` que pruebe aceptación final de Product Owner.

## Referencias

### Historias ejecutadas

- `docs/historias/HU-001-iniciar-cerrar-sesion.md`
- `docs/historias/HU-002-gestion-usuarios-y-multiples-roles.md`
- `docs/historias/HU-003-catalogo.md`
- `docs/historias/HU-005-inventario.md`
- `docs/historias/HU-009-pedidos.md`
- `docs/historias/HU-010-comandas-cocina.md`
- `docs/historias/HU-011-cancelar-pedido.md`
- `docs/historias/HU-016-proveedores.md`
- `docs/historias/HU-020-registrar-gastos.md`
- `docs/historias/HU-022-registrar-asistencia.md`

### Documentación transversal revisada

- `docs/07-product-backlog.md`
- `docs/08-scrum-y-refinamiento.md`
- `docs/09-ux-y-flujos.md`
- `docs/10-arquitectura.md`
- `docs/11-modelo-datos.md`
- `docs/12-seguridad-y-riesgos.md`
- `docs/13-pruebas-y-validacion.md`
- `docs/14-trazabilidad.md`
- `docs/15-plan-desarrollo.md`
- `docs/historias/README.md`
