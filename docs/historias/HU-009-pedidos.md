# HU-009 — Pedidos

**Backend:** COMPLETE. **Frontend:** COMPLETE. **Validación automatizada:** COMPLETE. **Validación manual:** PENDING.

## Implementación

El backend expone creación, detalle, listado, asignación o toma por mesero y entrega de pedidos. Los precios se toman exclusivamente de Products activos y vendibles al crear el pedido y se persisten como snapshots. Los pedidos sin líneas `KITCHEN` inician `LISTO`; los que sí las tienen inician `PENDIENTE` con una comanda. `ShiftId` permanece nullable hasta que exista un ciclo real de turnos.

| Método | Ruta                             | Roles                                   | Propósito                            | Respuesta                 |
| ------ | -------------------------------- | --------------------------------------- | ------------------------------------ | ------------------------- |
| POST   | `/api/v1/orders`                 | MESERO, ENCARGADO, ADMINISTRADOR        | Crear pedido                         | `OrderDto` 201            |
| GET    | `/api/v1/orders`                 | MESERO, ENCARGADO, ADMINISTRADOR        | Listar pedidos                       | `PagedResponse<OrderDto>` |
| GET    | `/api/v1/orders/{id}`            | MESERO, ENCARGADO, ADMINISTRADOR        | Consultar detalle                    | `OrderDto`                |
| PUT    | `/api/v1/orders/{id}/assignment` | ADMINISTRADOR                           | Asignar o reasignar mesero           | `OrderDto`                |
| POST   | `/api/v1/orders/{id}/take`       | MESERO                                  | Tomar pedido no terminal sin asignar | `OrderDto`                |
| POST   | `/api/v1/orders/{id}/deliver`    | MESERO propio, ENCARGADO, ADMINISTRADOR | Entregar pedido listo                | `OrderDto`                |

No se incluyen venta, clientes, movimientos de inventario ni edición de pedidos.

## Frontend y evidencia

`/pedidos`, `/pedidos/nuevo` y `/pedidos/{id}` consumen el contrato OpenAPI generado mediante `httpClient` y TanStack Query. ADMINISTRADOR asigna usando `employeeId` real; MESERO toma pedidos permitidos. La invalidación de consultas preserva REST como autoridad después de mutaciones y eventos de cocina.

- Evidencia automatizada: COMPLETE — suite frontend actual: 48 pruebas, typecheck, lint y build en verde.

## Evidencias

### Captura de la pantalla pricipal de Pedidos

![Captura de pedidos](../capturas/HU-009-orders.png)

---

### Captura de vista para celulares

![Captura de vista mobile](../capturas/HU-009-mobile-page.png)

---

### Captura de pantalla para agregar pedidos

![Captura pantalla para agregar pedidos](../capturas/HU-009-add-order.png)

---

### Captura de pantalla de detalle de pedido

![Captura pantalla de detalle de pedido](../capturas/HU-009-order-detail.png)

---

## Estado de entrega

Completado para MVP, cambios visuales se harán posteriormente
