# HU-011 — Cancelar pedido

**Backend:** COMPLETE. **Frontend:** COMPLETE. **Validación automatizada:** COMPLETE. **Validación manual:** PENDING.

## Implementación

La cancelación se permite únicamente desde `PENDIENTE` y `EN_PREPARACION`. Cancelar un pedido cancela atómicamente su `KitchenCommand` activa; cancelar una comanda cancela atómicamente su pedido. Un reintento autorizado conserva actor, motivo y timestamps originales. `LISTO` y `ENTREGADO` devuelven conflicto.

| Método | Ruta                                   | Roles                                   | Propósito                       | Respuesta           |
| ------ | -------------------------------------- | --------------------------------------- | ------------------------------- | ------------------- |
| POST   | `/api/v1/orders/{id}/cancel`           | MESERO propio, ENCARGADO, ADMINISTRADOR | Cancelar pedido y par asociado  | `OrderDto`          |
| POST   | `/api/v1/kitchen/commands/{id}/cancel` | COCINA, ENCARGADO, ADMINISTRADOR        | Cancelar comanda y par asociado | `KitchenCommandDto` |

El servidor deriva el actor de cancelación desde la autenticación. Rechaza actor, mesero, estado, precio o total enviados por el cliente. El frontend usa motivos opcionales acotados e invalida consultas tras éxito o conflicto.

## Evidencia

- Evidencia automatizada: COMPLETE — suite frontend actual: 48 pruebas, typecheck, lint y build en verde.

## Evidencias

### Captura de la pantalla para cancelar pedido

![Captura de pedidos](../capturas/HU-011-cancel-order.png)

---

## Estado de entrega

Completado para MVP, cambios visuales se harán posteriormente
