# Sprint 02 — Núcleo transaccional

## Objetivo

Integrar producción, inventario, ventas, compras y turnos para construir el núcleo transaccional del restaurante.

## Resultado del Sprint

El Sprint 2 registra **8 de 8 Historias de Usuario implementadas** y **41 Story Points**. La duración planificada fue de **4 días de trabajo**; no hay fechas exactas de inicio o cierre documentadas.

Las historias registran composición, visibilidad de stock bajo, producción, venta, continuación con stock insuficiente, compras, recepción y turnos. El cierre técnico documentado incluye validación de backend y frontend, sin declarar Sprint Review, aceptación de Product Owner ni una valoración del equipo.

## Historias de Usuario trabajadas

| HU | Historia | Épica | Prioridad | SP | Estado documentado al cierre | Observaciones principales |
| --- | --- | --- | --- | ---: | --- | --- |
| `HU-004` | Definir composición de platos/preparaciones | `EPI-02`/`EPI-03` | MUST | 5 | Implementada end-to-end | Consulta y edición de composición de preparaciones con reglas de compatibilidad y prevención de ciclos. |
| `HU-006` | Configurar y visualizar stock bajo | `EPI-02` | MUST | 3 | Entregada | Resumen global y vista derivada de Notificaciones en `/inventario`. |
| `HU-007` | Registrar producción | `EPI-03` | MUST | 8 | Completa técnica, documental y end-to-end | El servidor valida existencias y registra movimientos de inventario; se mantienen seis capturas verificadas. |
| `HU-012` | Registrar y confirmar venta | `EPI-05` | MUST | 8 | Finalizada | Venta confirmada desde pedido `ENTREGADO`, con validación autoritativa de servidor. |
| `HU-013` | Continuar venta con stock insuficiente | `EPI-05` | MUST | 2 | Finalizada | El acknowledgement explícito se revalida por el servidor antes de crear el pedido o, excepcionalmente, confirmar la venta. |
| `HU-017` | Registrar compra | `EPI-06` | MUST | 5 | Implementada end-to-end | Listado, alta y cancelación de compras pendientes. |
| `HU-018` | Recibir compra e incrementar inventario | `EPI-06` | MUST | 5 | Implementada end-to-end | Recepción de compra pendiente e incremento de inventario aplicados por el servidor. |
| `HU-025` | Gestionar y operar turnos | `EPI-09` | MUST | 5 | Implementada end-to-end | Gestión de `/turnos` y consulta del turno propio en `/mi-turno`, con caja compartida. |
|  | **Total** |  |  | **41** |  |  |

## Alcance implementado

### Composición, producción e inventario

- La composición de preparaciones se consulta en `/productos/:id/composicion`; su edición corresponde a los roles de gestión de productos.
- Producción permite consultar requisitos y registrar el flujo; el servidor valida existencias y registra los movimientos de inventario.
- Inventario conserva una navegación compartida con las vistas **Existencias**, **Movimientos** y **Notificaciones**.
- El badge de Notificaciones usa el `lowStockCount` global del Summary y se muestra solo cuando su valor es mayor que cero.

### Ventas y continuidad ante stock insuficiente

- La venta se confirma desde un pedido `ENTREGADO`; combinaciones de canal y pago, total, actor, turno y movimientos de inventario son validados o calculados por el servidor.
- Ante faltantes, el servidor exige acknowledgement explícito y revalida el estado antes de continuar; no se reserva ni descuenta inventario al crear el pedido.

### Compras y recepción

- El flujo de compra cubre consulta, registro, cancelación y recepción.
- La recepción de una compra pendiente aplica el incremento de inventario en el servidor; la cancelación requiere motivo y no genera movimientos de inventario.

### Turnos y caja compartida

- `/turnos` concentra la gestión operativa y `/mi-turno` limita la consulta al turno propio.
- Los dos turnos fijos comparten una sola caja.

### Matriz canónica de permisos

La matriz conserva semántica de unión: cuando un usuario tiene varios roles, backend (`RequireRole`) y frontend (`hasAnyRole`) aplican **OR** entre ellos. No existe un rol `CAJERO`.

| Capacidad | ADMINISTRADOR | ENCARGADO | MESERO | COCINA | CONTADORA | EMPLEADO |
| --- | --- | --- | --- | --- | --- | --- |
| Gestionar composición | YES | YES | NO | NO | NO | NO |
| Consultar composición | YES | YES | YES | YES | NO | NO |
| Configurar mínimo | YES | YES | NO | NO | NO | NO |
| Consultar inventario | YES | YES | YES | YES | YES | NO |
| Producción | YES | YES | NO | YES | NO | NO |
| Venta | YES | YES | YES | NO | NO | NO |
| Crear/cancelar/recibir compra | YES | YES | NO | YES* | NO | NO |
| Consultar compras | YES | YES | NO | YES | YES | NO |
| Gestionar turnos | YES | YES | NO | NO | NO | NO |
| Consultar propio turno | YES | YES | YES | NO | NO | NO |

`ProductManage` corresponde únicamente a `ADMINISTRADOR` y `ENCARGADO`. `YES*` para `COCINA` en crear, cancelar y recibir compras conserva el calificador de alcance documentado, autorizado por el servidor.

## Integración técnica transversal

El Sprint integra mecanismos compartidos entre las HU:

- políticas de autorización y navegación basada en roles;
- validación y cálculo autoritativos en servidor para los flujos transaccionales;
- movimientos de inventario aplicados por los flujos de producción, venta y recepción que corresponden;
- frontend con cliente HTTP común, React Query y rutas protegidas;
- navegación de inventario compartida entre sus tres vistas.

## Validación y evidencia

- El informe de verificación registra backend completo con **62/62** pruebas aprobadas.
- Frontend registra **19 archivos / 99 pruebas** aprobadas.
- Prettier acotado, typecheck, lint y build del frontend están aprobados.
- La auditoría final registra **0** endpoints, migraciones, cambios incompatibles y cambios de cliente OpenAPI nuevos.
- Las seis capturas verificadas de `HU-007` son: [`HU-007-register-production.png`](../capturas/HU-007-register-production.png), [`HU-007-mobile.png`](../capturas/HU-007-mobile.png), [`HU-007-low-stock-production.png`](../capturas/HU-007-low-stock-production.png), [`HU-007-confirm-modal.png`](../capturas/HU-007-confirm-modal.png), [`HU-007-confirm-modal-low-stock.png`](../capturas/HU-007-confirm-modal-low-stock.png) y [`HU-007-success-modal.png`](../capturas/HU-007-success-modal.png).

## Observaciones documentales de cierre

El change nativo de OpenSpec registra contenido completo y verificación PASS. Su archive nativo permanece bloqueado por una contradicción de estado de runtime.

Este documento no infiere una Sprint Review, aceptación de Product Owner, opinión del equipo ni fechas exactas que no estén documentadas.

## Referencias

### Historias ejecutadas

- [HU-004 — Composición](../historias/HU-004-composición-preparaciones.md)
- [HU-006 — Stock bajo](../historias/HU-006-notificaciones-stock-bajo.md)
- [HU-007 — Producción](../historias/HU-007-spri.md)
- [HU-012 — Venta](../historias/HU-012-registrar-confirmar-venta.md)
- [HU-013 — Venta con stock insuficiente](../historias/HU-013-venta-stock-bajo.md)
- [HU-017 — Compras](../historias/HU-017-registrar-compra.md)
- [HU-018 — Recepción de compra](../historias/HU-018-sprint-2.md)
- [HU-025 — Turnos](../historias/HU-025-sprint-2.md)

### Documentación transversal revisada

- [Product Backlog](../07-product-backlog.md)
- [Scrum y refinamiento](../08-scrum-y-refinamiento.md)
- [UX y flujos](../09-ux-y-flujos.md)
- [Arquitectura](../10-arquitectura.md)
- [Modelo de datos](../11-modelo-datos.md)
- [Seguridad y riesgos](../12-seguridad-y-riesgos.md)
- [Pruebas y validación](../13-pruebas-y-validacion.md)
- [Trazabilidad](../14-trazabilidad.md)
- [Plan de desarrollo — Sprint 2](../15-plan-desarrollo.md#98-sprint-2--núcleo-transaccional)
- [Índice de historias](../historias/README.md)
- [Informe de verificación Sprint 2](../openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/verify-report.md)
