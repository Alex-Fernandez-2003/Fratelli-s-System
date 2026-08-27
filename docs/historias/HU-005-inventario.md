# HU-005 — Gestionar entradas y salidas de inventario

> **Como encargado, quiero registrar y consultar movimientos de inventario para conocer las existencias y el origen de sus variaciones.**

**Backend:** COMPLETE. **Frontend:** COMPLETE. **Validación automatizada:** COMPLETE. **Validación manual:** PENDING.

| Campo            | Valor                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Épica            | `EPI-02`                                                                                   |
| Prioridad        | MUST · 5 SP                                                                                |
| RF / RN          | `RF-013`, `RF-014`, `RF-015`, `RF-018`, `RF-019` · `RN-005`, `RN-017`, `RN-026`            |
| Dependencia      | HU-003                                                                                     |
| Estado operativo | Pendiente de review y validación humana; el tablero sigue siendo la fuente de estado vivo. |

## Rutas y autorización

| Ruta                      | Acceso                                              | Alcance                                                    |
| ------------------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `/inventario`             | ADMINISTRADOR, ENCARGADO, MESERO, COCINA, CONTADORA | Consultar existencias. EMPLEADO-only es derivado a `/403`. |
| `/inventario/movimientos` | ADMINISTRADOR, ENCARGADO                            | Consultar el ledger de movimientos.                        |

Los roles múltiples se resuelven por unión. Solo ADMINISTRADOR y ENCARGADO ven **Registrar entrada** y **Registrar baja**.

## Implementación entregada

### Existencias

`/inventario` consume `GET /api/v1/inventory/balances` mediante el contrato OpenAPI generado, el cliente HTTP compartido y TanStack Query. Incluye listado paginado, búsqueda y filtro `ProductType` server-side, cantidad actual, unidad, `minStock`, estado visual y refresh manual. Tiene composición de tabla en desktop y cards en 403px/360px.

Inventory usa **REST polling** mientras la query está montada, aproximadamente cada 30 segundos. REST es la autoridad: no hay SignalR, Hub ni actualización optimista. Después de una mutación se invalida/refresca inmediatamente la caché de Inventory.

El estado visual sigue esta prioridad:

1. `currentQuantity < 0` → **Saldo negativo**.
2. Si no, `isLowStock` → **Stock bajo**.
3. Si no, **Normal**.

`minStock: null` se presenta como `—`. `isLowStock` es derivado por backend; no existe un valor persistido ni una verdad alternativa calculada en el cliente.

### Movimientos manuales e historial

ENTRY y WRITE_OFF usan `POST /api/v1/inventory/movements`. El formulario selecciona Product real, conserva cantidad decimal positiva de hasta cuatro decimales, muestra la unidad como read-only y exige motivo/origen de hasta 500 caracteres. El actor lo determina el servidor; el cliente no lo envía.

Una WRITE_OFF que supera el saldo actual **muestra advertencia pero no bloquea**. Un saldo ya negativo también conserva la acción disponible. El resultado negativo es permitido y el warning no es un error de validación. No hay parche optimista de existencias.

`/inventario/movimientos` consume `GET /api/v1/inventory/movements`: incluye filtros contractuales por Product, tipo, desde y hasta; paginación; cantidad con signo; unidad; motivo; referencia/origen; actor cuando el DTO lo provee y todos los `InventoryMovementType` contractuales. El ledger se conserva para Products inactivos.

No existen edición, eliminación, reversal ni exportación de movimientos.

## Límites y trabajo futuro

HU-005 muestra `minStock` e `isLowStock`, pero **no** permite editar mínimos ni configurar umbrales. **Configuración de alertas** y HU-006 permanecen PENDING/DEFERRED y serán responsables de la configuración de `MinStock`, alertas y comportamiento futuro.

No se implementó Product CRUD, alert center/notificaciones, SignalR, métricas globales de stock, export, flujos de Compra/Venta/Producción, ADJUSTMENT manual ni edición/eliminación de movimientos.

## Validación y evidencia

| Evidencia automatizada | Resultado                                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenAPI `api:generate` | COMPLETE (contrato sin cambios) |
| Typecheck, lint y build | COMPLETE |
| Vitest | 48 pruebas en verde |
| `format:check` | COMPLETE |

No hay capturas de validación manual asociadas a esta HU. La revisión humana pendiente debe comprobar roles, desktop/403px/360px, Product real, ENTRY, WRITE_OFF, aviso de saldo insuficiente, polling y refresh.

## Referencias
