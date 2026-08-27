# HU-020 — Registrar gastos diarios

> **Como encargado, quiero registrar gastos diarios para evitar que el cuaderno sea la única fuente principal de esa información.**

**Backend:** COMPLETE. **Frontend:** COMPLETE. **Validación automatizada:** COMPLETE. **Validación manual:** PENDING.

| Campo            | Valor                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Épica            | `EPI-07`                                                                                   |
| Prioridad        | MUST · 3 SP                                                                                |
| RF / RN          | `RF-045` · `RN-017`, `RN-020`, `RN-022`                                                    |
| Dependencias     | HU-001, HU-002                                                                             |
| Estado operativo | Pendiente de review y validación humana; el tablero sigue siendo la fuente de estado vivo. |

## Ruta y autorización

`/gastos` permite registrar gastos solo a ADMINISTRADOR y ENCARGADO. MESERO, COCINA, CONTADORA y EMPLEADO sin otro rol autorizado no acceden; los roles múltiples se resuelven por unión.

## Formulario entregado

El formulario consume `GET /api/v1/expense-categories` y `POST /api/v1/expenses` mediante el contrato OpenAPI generado, cliente HTTP compartido y TanStack Query.

| Campo/regla          | Comportamiento                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Monto                | BOB (`Bs.`), mayor que cero y hasta dos decimales.                                                                            |
| Categoría            | Opcional. Incluye `Sin categoría`; categorías reales desde API. Una lista vacía o error de consulta no bloquea el formulario. |
| CashSource           | Obligatorio y sin valor inicial. `CASH_DRAWER` = Caja principal; `PETTY_CASH` = Caja chica.                                   |
| Descripción / motivo | Obligatoria, sin solo espacios en blanco, hasta 500 caracteres.                                                               |
| Fecha                | `expenseDate` permite hoy o pasado; el máximo se calcula con `America/La_Paz` y el futuro se rechaza en UX.                   |
| Responsable          | Lo asigna el servidor; el cliente no lo envía.                                                                                |
| Doble envío          | El submit queda deshabilitado mientras el POST está pendiente.                                                                |

## Confirmación y límites

Después de un POST correcto la página muestra una confirmación persistente basada en el `ExpenseDto` real: monto, fecha, categoría, fuente, descripción y responsable si lo provee la respuesta. El mensaje es: **“Gasto registrado correctamente. El registro fue guardado.”** La única acción posterior es **Registrar otro gasto**, que restablece monto, descripción, categoría, CashSource y fecha de negocio.

La auditoría backend confirmó `NO_SHIFT_INTEGRATION`. Por ello no existen `ShiftId`, selector/estado de turno, CashSession ni saldo de caja. Registrar un gasto no modifica el saldo de caja; `CashSource` es solo clasificación.

HU-020 implementa únicamente **Registrar gasto**. No implementa historial de gastos, listado `GET /expenses`, filtros, búsqueda, paginación, exportación, detalle, edición, eliminación, ExpenseCategory CRUD, reportes, cierre de caja ni sincronización sin conexión o en nube. HU-021 permanece PENDING. La imagen de historial se trató únicamente como referencia futura/DEFER.

## Responsive y validación

La implementación contempla desktop, 403px y 360px a partir de las referencias visuales. Esto describe implementación automatizada, no evidencia visual humana: la validación browser/E2E de Alex y las capturas correspondientes están pendientes.

| Evidencia automatizada | Resultado |
| --- | --- |
| `format:check`, typecheck, lint y build | COMPLETE |
| Vitest | 48 pruebas en verde |
| OpenAPI `api:generate` | N/A para esta auditoría documental; el contrato no cambió |

- [OpenSpec backend handoff](../openspec/changes/implement-hu-005-020-inventory-and-expenses-backend/backend-handoff.md)
- [OpenSpec frontend handoff](../openspec/changes/implement-hu-005-020-inventory-and-expenses-frontend/frontend-handoff.md)
- [Product Backlog — HU-020](../07-product-backlog.md#hu-020--registrar-gastos-diarios)

No se fabricaron capturas ni evidencia de E2E.

## Referencias
