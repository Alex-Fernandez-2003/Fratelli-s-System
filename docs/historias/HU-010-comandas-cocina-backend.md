# HU-010 — Comandas de cocina

**Backend:** COMPLETE. **Frontend:** COMPLETE. **Validación automatizada:** COMPLETE. **Validación manual:** PENDING.

## Implementación

Una comanda se genera solo para líneas de pedido `KITCHEN` y no contiene campos financieros. Iniciar y marcar lista sincronizan `Order` y `KitchenCommand` dentro de una transacción PostgreSQL. SignalR notifica después del commit en `/hubs/kitchen`; REST permanece como autoridad.

| Método | Ruta | Roles | Propósito | Respuesta |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/kitchen/commands` | COCINA, MESERO, ENCARGADO, ADMINISTRADOR | Listar comandas | `PagedResponse<KitchenCommandDto>` |
| GET | `/api/v1/kitchen/commands/{id}` | Mismos roles | Consultar detalle | `KitchenCommandDto` |
| POST | `/api/v1/kitchen/commands/{id}/start` | COCINA, ENCARGADO, ADMINISTRADOR | Iniciar preparación | `KitchenCommandDto` |
| POST | `/api/v1/kitchen/commands/{id}/ready` | COCINA, ENCARGADO, ADMINISTRADOR | Marcar lista | `KitchenCommandDto` |

Los eventos son `KitchenCommandCreated`, `KitchenCommandUpdated` y `KitchenCommandCancelled`; contienen solo identificador de comanda, pedido, estado y fecha.

## Frontend y evidencia

`/cocina` representa `PENDIENTE`, `EN_PREPARACION` y `LISTA` como columnas desktop y tabs mobile. COCINA, ENCARGADO y ADMINISTRADOR reciben controles operativos autorizados; MESERO ve una tabla de solo lectura. El cliente invalida Orders/Kitchen tras eventos y usa fallback REST de 30 segundos solo si SignalR no está saludable.

- Evidencia automatizada: COMPLETE — suite frontend actual: 48 pruebas, typecheck, lint y build en verde.
- Evidencia manual: PENDING — validar responsive, SignalR y runtime real.
- Capturas: pendiente; no se fabricaron capturas.
