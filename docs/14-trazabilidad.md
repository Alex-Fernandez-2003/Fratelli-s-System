# 14 — Trazabilidad

## 1. Propósito

Este documento consolida la trazabilidad integral de **Restaurant System** para Fratelli y utiliza las **Historias de Usuario como unidad principal para registrar el avance del proyecto**.

La cadena documental utilizada es:

```text
Fuente / evidencia
        ↓
Hallazgo
        ↓
Necesidad
        ↓
Objetivo
        ↓
RF / RN / RNF
        ↓
Historia de Usuario
        ↓
UX / arquitectura / datos
        ↓
Implementación
        ↓
Prueba
        ↓
Evidencia
        ↓
Validación
```

La matriz no anticipa resultados de implementación. Mientras una HU no haya sido ejecutada, sus campos de implementación, pruebas ejecutadas y evidencia permanecerán en `PENDIENTE`.

---

# 2. Fuentes canónicas

- `docs/03-hallazgos-y-necesidades.md`
- `docs/04-objetivos-y-propuesta-valor.md`
- `docs/05-alcance-y-mvp.md`
- `docs/06-srs.md`
- `docs/requirements/requisitos-funcionales.md`
- `docs/requirements/requisitos-no-funcionales.md`
- `docs/requirements/reglas-negocio.md`
- `docs/07-product-backlog.md`
- `docs/08-scrum-y-refinamiento.md`
- `docs/09-ux-y-flujos.md`
- `docs/10-arquitectura.md`
- `docs/11-modelo-datos.md`
- `docs/12-seguridad-y-riesgos.md`
- `docs/13-pruebas-y-validacion.md`

---

# 3. Regla de autoridad

La trazabilidad **no reemplaza** a los documentos de origen.

Si existe una diferencia:

```text
RF → requirements/requisitos-funcionales.md
RNF → requirements/requisitos-no-funcionales.md
RN → requirements/reglas-negocio.md
HU → 07-product-backlog.md mientras no exista su expediente de ejecución
Datos → 11-modelo-datos.md
Seguridad → 12-seguridad-y-riesgos.md
Pruebas → 13-pruebas-y-validacion.md
```

Cuando una HU entre en ejecución, su expediente canónico se crea en:

```text
docs/historias/HU-XXX-....md
```

---

# 4. Estados de trazabilidad

| Estado          | Significado                                                                                |
| --------------- | ------------------------------------------------------------------------------------------ |
| `PENDIENTE`     | Todavía no existe implementación/resultado verificable.                                    |
| `EN DESARROLLO` | La HU se encuentra en `In Progress` o `Review`.                                            |
| `IMPLEMENTADO`  | La funcionalidad existe y cuenta con verificación técnica documentada.                     |
| `IMPLEMENTADO PARCIAL` | Existe una entrega acotada y verificable —por ejemplo, backend—, pero queda una capa funcional pendiente. |
| `VALIDADO`      | Además de implementada, pasó la validación correspondiente, incluida la PO cuando aplique. |
| `POST-MVP`      | Fuera del MVP actual.                                                                      |
| `NO APLICA`     | La relación no corresponde y existe justificación.                                         |

Estos estados son de trazabilidad y no sustituyen las columnas del tablero.

---

# 5. Organización documental durante ejecución

```text
docs/
├── historias/
│   ├── README.md
│   ├── HU-001-....md
│   ├── HU-002-....md
│   └── ...
├── capturas/
│   ├── HU-001-....png
│   ├── HU-002-....png
│   └── ...
└── sprints/
    ├── sprint-01.md
    ├── sprint-01-review.md
    ├── sprint-01-retrospectiva.md
    └── ...
```

No se crean subcarpetas por HU ni por Sprint. Los prefijos `HU-XXX`, `CP-HUXXX-XX` y `sprint-XX` proporcionan la identificación.

Issues, PR y commits **no son columnas de la matriz global**. Se registrarán dentro del Markdown individual de la HU.

---

# 6. Evidencia → hallazgo → necesidad → objetivo

## 6.1. Necesidades consolidadas

| Necesidad | Descripción                                                              | Hallazgos fuente                                     | Objetivos relacionados    | HU MVP relacionadas                                                                                                    |
| --------- | ------------------------------------------------------------------------ | ---------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `N-001`   | Registrar entradas y salidas de forma confiable                          | `H-001`, `H-002`                                     | `OE-01`, `OE-02`, `OE-07` | `HU-022`, `HU-023`, `HU-024`, `HU-031`                                                                                 |
| `N-002`   | Disponer de datos confiables de asistencia para procesos de pago         | `H-001`, `H-002`                                     | `OE-02`, `OE-07`          | `HU-022`, `HU-023`, `HU-024`, `HU-031`                                                                                 |
| `N-003`   | Registrar producción sin doble captura                                   | `H-003`, `H-017`, `H-019`                            | `OE-01`, `OE-03`, `OE-07` | `HU-004`, `HU-007`, `HU-008`                                                                                           |
| `N-004`   | Mantener inventario consistente con la operación real                    | `H-003`, `H-004`, `H-006`, `H-016`, `H-018`, `H-020` | `OE-03`, `OE-07`          | `HU-003`, `HU-004`, `HU-005`, `HU-007`, `HU-008`, `HU-012`, `HU-013`, `HU-018`, `HU-030`                               |
| `N-005`   | Detectar oportunamente existencias bajas                                 | `H-005`, `H-006`                                     | `OE-03`, `OE-07`          | `HU-006`, `HU-013`, `HU-030`                                                                                           |
| `N-006`   | Centralizar compras y recepción                                          | `H-007`, `H-008`, `H-020`, `H-021`                   | `OE-01`, `OE-04`, `OE-07` | `HU-016`, `HU-017`, `HU-018`, `HU-019`                                                                                 |
| `N-007`   | Mantener trazabilidad de responsables de compra                          | `H-008`, `H-020`                                     | `OE-04`, `OE-07`          | `HU-017`                                                                                                               |
| `N-008`   | Controlar información de obligaciones y pagos a proveedores              | `H-007`, `H-009`                                     | `OE-01`, `OE-04`, `OE-07` | `HU-016`, `HU-017`, `HU-018`, `HU-019`                                                                                 |
| `N-009`   | Centralizar gastos diarios, caja chica y datos necesarios para el cierre | `H-010`, `H-022`, `H-023`                            | `OE-01`, `OE-04`, `OE-07` | `HU-020`, `HU-021`, `HU-025`, `HU-026`, `HU-027`                                                                       |
| `N-010`   | Permitir acceso directo a reportes según autorización                    | `H-011`, `H-015`                                     | `OE-05`, `OE-07`          | `HU-002`, `HU-015`, `HU-024`, `HU-028`, `HU-029`, `HU-030`, `HU-031`                                                   |
| `N-011`   | Preservar capacidades operativas útiles del sistema existente            | `H-012`, `H-013`, `H-022`, `H-023`                   | `OE-06`, `OE-07`          | `HU-003`, `HU-009`, `HU-010`, `HU-011`, `HU-012`, `HU-014`, `HU-015`, `HU-025`, `HU-026`, `HU-027`, `HU-028`, `HU-029` |
| `N-012`   | Construir el sistema sin depender técnicamente de la plataforma anterior | `H-013`, `H-014`                                     | `OE-06`, `OE-07`          | Cobertura transversal por arquitectura                                                                                 |
| `N-013`   | Diferenciar acceso y responsabilidades por usuario                       | `H-008`, `H-011`, `H-015`                            | `OE-05`, `OE-07`          | `HU-001`, `HU-002`, `HU-003`, `HU-015`, `HU-027`                                                                       |
| `N-014`   | Mantener trazabilidad de operaciones relevantes por usuario              | `H-012`, `H-015`, `H-018`, `H-020`, `H-023`          | `OE-05`, `OE-07`          | `HU-002`, `HU-005`, `HU-012`, `HU-017`, `HU-020`, `HU-025`, `HU-027`                                                   |

### Nota sobre N-012

`N-012` — construir el sistema sin depender técnicamente de la plataforma anterior — no necesita una HU funcional exclusiva. Su cobertura es transversal y se materializa especialmente en `10-arquitectura.md`, el repositorio independiente, PostgreSQL, contratos propios y la preparación técnica del proyecto.

---

# 7. Matriz principal de avance por Historia de Usuario

Esta es la tabla principal del documento. La HU es el dato central de seguimiento.

| HU       | Historia                                               | Necesidades                        | RF                                               | RN                                                                   | RNF principales                             | UX / diseño                                                                                                                  | Datos principales                                                                               | Prueba prevista                            | Implementación | Evidencia   | Estado trazabilidad |
| -------- | ------------------------------------------------------ | ---------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------- | ----------- | ------------------- |
| `HU-001` | Iniciar y cerrar sesión                                | `N-013`                            | `RF-001`, `RF-002`                               | —                                                                    | `RNF-SEG-001`, `RNF-SEG-004`, `RNF-SEG-006` | `docs/09-ux-y-flujos.md` (acceso/navegación general)<br>`docs/10-arquitectura.md` (Identity, JWT, roles, frontend/app)       | `users`, `roles`, `user_roles`, `employees`                                                     | Expediente `HU-001` y capturas vinculadas | Implementada | Capturas; evidencia técnica en el expediente | `IMPLEMENTADO` |
| `HU-002` | Administrar usuarios y múltiples roles                 | `N-010`, `N-013`, `N-014`          | `RF-003`, `RF-004`, `RF-005`, `RF-006`           | `RN-017`, `RN-019`, `RN-020`, `RN-021`                               | `RNF-SEG-002`, `RNF-SEG-003`, `RNF-AUD-001` | `docs/09-ux-y-flujos.md` (acceso/navegación general)<br>`docs/10-arquitectura.md` (Identity, JWT, roles, frontend/app)       | `users`, `roles`, `user_roles`, `employees`                                                     | Expediente `HU-002` y capturas vinculadas | Implementada | Capturas y resultados técnicos documentados | `IMPLEMENTADO` |
| `HU-003` | Gestionar productos, ingredientes y platos             | `N-004`, `N-011`, `N-013`          | `RF-007`, `RF-008`, `RF-009`, `RF-011`, `RF-012` | `RN-026`                                                             | `RNF-INT-005`, `RNF-AUD-001`                | `docs/puml/flujo-ux-produccion-inventario.puml`<br>`docs/10-arquitectura.md` (Catálogo / Inventario / Producción)            | `categories`, `units`, `products`                                                               | Expediente `HU-003` y capturas vinculadas | Productos implementados; UI de categorías/unidades pendiente | Capturas vinculadas | `IMPLEMENTADO PARCIAL` |
| `HU-004` | Definir composición de platos y preparaciones          | `N-003`, `N-004`                   | `RF-010`                                         | `RN-006`, `RN-008`, `RN-028`                                         | `RNF-INT-002`                               | `docs/puml/flujo-ux-produccion-inventario.puml`<br>`docs/10-arquitectura.md` (Catálogo / Inventario / Producción)            | `products`, `product_compositions`, `units`                                                     | [Cierre Sprint 2](sprints/sprint-02.md) | Implementada end-to-end | [Verificación final Sprint 2](openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/verify-report.md) | `IMPLEMENTADO` |
| `HU-005` | Registrar movimientos y consultar existencias          | `N-004`, `N-014`                   | `RF-013`, `RF-014`, `RF-015`, `RF-018`, `RF-019` | `RN-005`, `RN-017`, `RN-026`                                         | `RNF-INT-002`, `RNF-AUD-003`                | `docs/puml/flujo-ux-produccion-inventario.puml`<br>`docs/10-arquitectura.md` (Catálogo / Inventario / Producción)            | `products`, `inventory_balances`, `inventory_movements`                                         | Expediente `HU-005` y capturas vinculadas | Implementada | Capturas vinculadas | `IMPLEMENTADO` |
| `HU-006` | Configurar y visualizar stock bajo                     | `N-005`                            | `RF-016`, `RF-017`                               | `RN-005`, `RN-026`                                                   | `RNF-USA-003`                               | `docs/puml/flujo-ux-produccion-inventario.puml`<br>`docs/10-arquitectura.md` (Catálogo / Inventario / Producción)            | `products`, `inventory_balances`, `inventory_movements`                                         | [Cierre Sprint 2](sprints/sprint-02.md) | Implementada end-to-end | [Verificación final Sprint 2](openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/verify-report.md) | `IMPLEMENTADO` |
| `HU-007` | Registrar producción y actualizar existencia preparada | `N-003`, `N-004`                   | `RF-021`, `RF-022`, `RF-023`                     | `RN-006`, `RN-007`, `RN-008`, `RN-029`, `RN-030`, `RN-031`           | `RNF-INT-001`, `RNF-INT-002`, `RNF-INT-003` | `docs/puml/flujo-ux-produccion-inventario.puml`<br>`docs/10-arquitectura.md` (Catálogo / Inventario / Producción)            | `productions`, `production_consumptions`, `inventory_balances`, `inventory_movements`           | [Cierre Sprint 2](sprints/sprint-02.md) | Implementada end-to-end | [Verificación final Sprint 2](openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/verify-report.md) | `IMPLEMENTADO` |
| `HU-008` | Consultar registros de producción                      | `N-003`, `N-004`                   | `RF-024`                                         | `RN-007`, `RN-030`                                                   | `RNF-AUD-001`, `RNF-AUD-002`                | `docs/puml/flujo-ux-produccion-inventario.puml`<br>`docs/10-arquitectura.md` (Catálogo / Inventario / Producción)            | `productions`, `production_consumptions`                                                        | `CP-HU008-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-009` | Registrar y gestionar pedidos                          | `N-011`                            | `RF-025`, `RF-026`                               | `RN-001`, `RN-003`                                                   | `RNF-CON-003`, `RNF-USA-003`                | `docs/puml/flujo-ux-pedido-venta.puml`<br>`docs/10-arquitectura.md` (Pedidos / KDS / Ventas; SignalR en Cocina)              | `orders`, `order_items`, `shifts`                                                               | Expediente `HU-009` y capturas vinculadas | Implementada | Capturas vinculadas | `IMPLEMENTADO` |
| `HU-010` | Generar y gestionar comandas de cocina                 | `N-011`                            | `RF-028`, `RF-029`, `RF-030`                     | `RN-002`, `RN-003`                                                   | `RNF-CON-003`, `RNF-USA-003`                | `docs/puml/flujo-ux-pedido-venta.puml`<br>`docs/10-arquitectura.md` (Pedidos / KDS / Ventas; SignalR en Cocina)              | `orders`, `order_items`, `kitchen_commands`, `kitchen_command_items`                            | Expediente `HU-010` y capturas vinculadas | Implementada | Capturas vinculadas | `IMPLEMENTADO` |
| `HU-011` | Cancelar pedido antes de que esté listo                | `N-011`                            | `RF-027`, `RF-029`                               | `RN-003`                                                             | `RNF-CON-003`, `RNF-USA-004`                | `docs/puml/flujo-ux-pedido-venta.puml`<br>`docs/10-arquitectura.md` (Pedidos / KDS / Ventas; SignalR en Cocina)              | `orders`, `order_items`, `kitchen_commands`, `kitchen_command_items`                            | Expediente `HU-011` y capturas vinculadas | Implementada | Captura vinculada | `IMPLEMENTADO` |
| `HU-012` | Registrar y confirmar una venta                        | `N-004`, `N-011`, `N-014`          | `RF-031`, `RF-032`, `RF-033`, `RF-035`, `RF-036` | `RN-004`, `RN-005`, `RN-008`, `RN-015`                               | `RNF-INT-001`, `RNF-CON-001`, `RNF-AUD-001` | `docs/puml/flujo-ux-pedido-venta.puml`<br>`docs/10-arquitectura.md` (Pedidos / KDS / Ventas; SignalR en Cocina)              | `sales`, `sale_items`, `orders`, `inventory_movements`, `inventory_balances`                    | [Cierre Sprint 2](sprints/sprint-02.md) | Implementada end-to-end | [Verificación final Sprint 2](openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/verify-report.md) | `IMPLEMENTADO` |
| `HU-013` | Continuar venta con stock insuficiente                 | `N-004`, `N-005`                   | `RF-020`, `RF-035`, `RF-036`                     | `RN-005`                                                             | `RNF-INT-004`, `RNF-USA-004`                | `docs/puml/flujo-ux-pedido-venta.puml`<br>`docs/10-arquitectura.md` (Pedidos / KDS / Ventas; SignalR en Cocina)              | `sales`, `sale_items`, `orders`, `inventory_movements`, `inventory_balances`                    | [Cierre Sprint 2](sprints/sprint-02.md) | Implementada end-to-end | [Verificación final Sprint 2](openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/verify-report.md) | `IMPLEMENTADO` |
| `HU-014` | Gestionar clientes básicos y asociarlos a ventas       | `N-011`                            | `RF-034`, `RF-038`                               | `RN-013`, `RN-014`                                                   | `RNF-PRI-001`                               | `docs/puml/flujo-ux-pedido-venta.puml`<br>`docs/10-arquitectura.md` (Pedidos / KDS / Ventas; SignalR en Cocina)              | `customers`, `sales`                                                                            | `CP-HU014-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-015` | Consultar ventas del alcance autorizado                | `N-010`, `N-011`, `N-013`          | `RF-037`                                         | `RN-020`, `RN-025`                                                   | `RNF-SEG-002`, `RNF-AUD-001`                | `docs/puml/flujo-ux-pedido-venta.puml`<br>`docs/10-arquitectura.md` (Pedidos / KDS / Ventas; SignalR en Cocina)              | `sales`, `sale_items`, `shifts`, `users/roles`                                                  | `CP-HU015-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-016` | Gestionar proveedores                                  | `N-006`, `N-008`                   | `RF-039`                                         | `RN-027`                                                             | `RNF-INT-005`                               | `docs/puml/flujo-ux-compra-recepcion.puml`<br>`docs/10-arquitectura.md` (Proveedores / Compras / Inventario)                 | `suppliers`                                                                                     | Expediente `HU-016` y capturas vinculadas | Implementada | Capturas vinculadas | `IMPLEMENTADO` |
| `HU-017` | Registrar una compra                                   | `N-006`, `N-007`, `N-008`, `N-014` | `RF-040`, `RF-041`                               | `RN-009`, `RN-010`, `RN-027`, `RN-032`                               | `RNF-AUD-001`, `RNF-USA-003`                | `docs/puml/flujo-ux-compra-recepcion.puml`<br>`docs/10-arquitectura.md` (Proveedores / Compras / Inventario)                 | `suppliers`, `purchases`, `purchase_items`                                                      | [Cierre Sprint 2](sprints/sprint-02.md) | Implementada end-to-end | [Verificación final Sprint 2](openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/verify-report.md) | `IMPLEMENTADO` |
| `HU-018` | Recibir una compra e incrementar inventario            | `N-004`, `N-006`, `N-008`          | `RF-042`, `RF-043`                               | `RN-009`, `RN-010`, `RN-027`, `RN-033`, `RN-034`                     | `RNF-INT-001`, `RNF-INT-002`                | `docs/puml/flujo-ux-compra-recepcion.puml`<br>`docs/10-arquitectura.md` (Proveedores / Compras / Inventario)                 | `purchases`, `purchase_items`, `purchase_receipts`, `inventory_movements`, `inventory_balances` | [Cierre Sprint 2](sprints/sprint-02.md) | Implementada end-to-end | [Verificación final Sprint 2](openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/verify-report.md) | `IMPLEMENTADO` |
| `HU-019` | Consultar historial de compras                         | `N-006`, `N-008`                   | `RF-044`                                         | `RN-027`                                                             | `RNF-AUD-001`, `RNF-AUD-002`                | `docs/puml/flujo-ux-compra-recepcion.puml`<br>`docs/10-arquitectura.md` (Proveedores / Compras / Inventario)                 | `purchases`, `purchase_items`, `purchase_receipts`                                              | `CP-HU019-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-020` | Registrar gastos diarios                               | `N-009`, `N-014`                   | `RF-045`                                         | `RN-017`, `RN-020`, `RN-022`                                         | `RNF-AUD-001`, `RNF-AUD-002`                | `docs/puml/flujo-ux-turno-cierre.puml`<br>`docs/10-arquitectura.md` (Gastos / operación de caja)                             | `expense_categories`, `expenses`, `shifts`                                                      | Expediente `HU-020` y capturas vinculadas | Implementada; validación manual pendiente | Capturas; validación manual pendiente | `IMPLEMENTADO` |
| `HU-021` | Consultar gastos registrados                           | `N-009`                            | `RF-046`                                         | `RN-022`                                                             | `RNF-AUD-001`                               | `docs/puml/flujo-ux-turno-cierre.puml`<br>`docs/10-arquitectura.md` (Gastos / operación de caja)                             | `expense_categories`, `expenses`, `shifts`                                                      | `CP-HU021-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-022` | Registrar entrada y salida de asistencia               | `N-001`, `N-002`                   | `RF-047`, `RF-048`, `RF-049`                     | `RN-011`, `RN-012`, `RN-018`                                         | `RNF-CON-001`, `RNF-PRI-002`, `RNF-HW-001`  | `docs/puml/flujo-ux-asistencia.puml`<br>`docs/10-arquitectura.md` (Personal / Asistencia)                                    | `employees`, `attendance_records`, `users/roles`                                                | Expediente `HU-022` y capturas vinculadas | Implementada | Capturas vinculadas | `IMPLEMENTADO` |
| `HU-023` | Consultar mi historial de asistencia                   | `N-001`, `N-002`                   | `RF-050`                                         | `RN-020`                                                             | `RNF-SEG-002`                               | `docs/puml/flujo-ux-asistencia.puml`<br>`docs/10-arquitectura.md` (Personal / Asistencia)                                    | `employees`, `attendance_records`, `users/roles`                                                | `CP-HU023-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-024` | Consultar asistencia de trabajadores                   | `N-001`, `N-002`, `N-010`          | `RF-051`                                         | `RN-020`                                                             | `RNF-SEG-002`, `RNF-AUD-001`                | `docs/puml/flujo-ux-asistencia.puml`<br>`docs/10-arquitectura.md` (Personal / Asistencia)                                    | `employees`, `attendance_records`, `users/roles`                                                | `CP-HU024-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-025` | Gestionar y operar turnos                              | `N-009`, `N-011`, `N-014`          | `RF-052`, `RF-053`                               | `RN-020`, `RN-025`, `RN-035`, `RN-036`                               | `RNF-AUD-001`, `RNF-INT-001`                | `docs/puml/flujo-ux-turno-cierre.puml`<br>`docs/10-arquitectura.md` (Turnos / Caja / Cierre)                                 | `cash_sessions`, `shifts`, `shift_assignments`                                                  | [Cierre Sprint 2](sprints/sprint-02.md) | Implementada end-to-end | [Verificación final Sprint 2](openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/verify-report.md) | `IMPLEMENTADO` |
| `HU-026` | Preparar información esperada del cierre               | `N-009`, `N-011`                   | `RF-054`                                         | `RN-016`, `RN-023`, `RN-035`–`RN-038`                                | `RNF-INT-001`, `RNF-REC-001`                | `docs/puml/flujo-ux-turno-cierre.puml`<br>`docs/10-arquitectura.md` (Turnos / Caja / Cierre)                                 | `cash_sessions`, `shifts`, `sales`, `expenses`, `cash_closings`                                 | `CP-HU026-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-027` | Registrar cierre de turno/caja                         | `N-009`, `N-011`, `N-013`, `N-014` | `RF-055`                                         | `RN-016`, `RN-020`, `RN-023`, `RN-024`, `RN-035`, `RN-038`, `RN-039` | `RNF-INT-001`, `RNF-CON-001`, `RNF-AUD-001` | `docs/puml/flujo-ux-turno-cierre.puml`<br>`docs/10-arquitectura.md` (Turnos / Caja / Cierre)                                 | `cash_sessions`, `cash_closings`, `shifts`                                                      | `CP-HU027-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-028` | Consultar cierres registrados                          | `N-010`, `N-011`                   | `RF-056`                                         | `RN-016`, `RN-023`                                                   | `RNF-AUD-001`, `RNF-AUD-002`                | `docs/puml/flujo-ux-turno-cierre.puml`<br>`docs/10-arquitectura.md` (Turnos / Caja / Cierre)                                 | `cash_sessions`, `cash_closings`, `shifts`                                                      | `CP-HU028-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-029` | Consultar reporte de ventas                            | `N-010`, `N-011`                   | `RF-057`                                         | `RN-020`, `RN-025`                                                   | `RNF-SEG-002`, `RNF-USA-001`                | `docs/09-ux-y-flujos.md` (reportes y navegación responsive)<br>`docs/10-arquitectura.md` (consultas/proyecciones por módulo) | Proyección sobre `sales`, `sale_items`, `shifts`                                                | `CP-HU029-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-030` | Consultar reporte de inventario y stock bajo           | `N-004`, `N-005`, `N-010`          | `RF-058`                                         | `RN-005`, `RN-026`                                                   | `RNF-USA-001`, `RNF-INT-004`                | `docs/09-ux-y-flujos.md` (reportes y navegación responsive)<br>`docs/10-arquitectura.md` (consultas/proyecciones por módulo) | Proyección sobre `products`, `inventory_balances`, `inventory_movements`                        | `CP-HU030-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |
| `HU-031` | Consultar reporte de asistencia                        | `N-001`, `N-002`, `N-010`          | `RF-059`                                         | `RN-020`                                                             | `RNF-SEG-002`, `RNF-USA-001`                | `docs/09-ux-y-flujos.md` (reportes y navegación responsive)<br>`docs/10-arquitectura.md` (consultas/proyecciones por módulo) | Proyección sobre `attendance_records`, `employees`                                              | `CP-HU031-*` — se define/ejecuta con la HU | `PENDIENTE`    | `PENDIENTE` | `PENDIENTE`         |

### Lectura del estado actual

El estado actual se deriva de los expedientes de `docs/historias/`, [Sprint 1](sprints/sprint-01.md), [Sprint 2](sprints/sprint-02.md) y su [informe de verificación final](openspec/changes/finalize-sprint-2-routing-permissions-and-documentation/verify-report.md). Diez HU de Sprint 1 y las ocho HU de Sprint 2 tienen implementación documentada; el cierre de Sprint 2 registra estas últimas como implementadas end-to-end.

Una HU no pasa a `IMPLEMENTADO` únicamente porque exista código; debe cumplir el gate definido en `13-pruebas-y-validacion.md`. La ausencia de Sprint Review documentada impide afirmar validación de Product Owner.

---

# 8. Trazabilidad RF → HU

Objetivo: comprobar que todo RF del MVP tenga al menos una HU que lo materialice.

| RF       | Requisito                                               | HU relacionadas    | Cobertura            |
| -------- | ------------------------------------------------------- | ------------------ | -------------------- |
| `RF-001` | Autenticar usuario                                      | `HU-001`           | Cubierto por backlog |
| `RF-002` | Cerrar sesión                                           | `HU-001`           | Cubierto por backlog |
| `RF-003` | Gestionar cuentas de usuario                            | `HU-002`           | Cubierto por backlog |
| `RF-004` | Asignar roles a usuarios                                | `HU-002`           | Cubierto por backlog |
| `RF-005` | Aplicar permisos por rol                                | `HU-002`           | Cubierto por backlog |
| `RF-006` | Registrar responsable de operaciones relevantes         | `HU-002`           | Cubierto por backlog |
| `RF-007` | Gestionar productos                                     | `HU-003`           | Cubierto por backlog |
| `RF-008` | Gestionar ingredientes                                  | `HU-003`           | Cubierto por backlog |
| `RF-009` | Gestionar platos                                        | `HU-003`           | Cubierto por backlog |
| `RF-010` | Definir composición de platos o preparaciones           | `HU-004`           | Cubierto por backlog |
| `RF-011` | Gestionar precios                                       | `HU-003`           | Cubierto por backlog |
| `RF-012` | Consultar catálogo                                      | `HU-003`           | Cubierto por backlog |
| `RF-013` | Registrar entrada de inventario                         | `HU-005`           | Cubierto por backlog |
| `RF-014` | Registrar salida o baja de inventario                   | `HU-005`           | Cubierto por backlog |
| `RF-015` | Consultar existencias                                   | `HU-005`           | Cubierto por backlog |
| `RF-016` | Configurar stock mínimo                                 | `HU-006`           | Cubierto por backlog |
| `RF-017` | Detectar y mostrar stock bajo                           | `HU-006`           | Cubierto por backlog |
| `RF-018` | Registrar movimientos de inventario                     | `HU-005`           | Cubierto por backlog |
| `RF-019` | Consultar historial de movimientos                      | `HU-005`           | Cubierto por backlog |
| `RF-020` | Advertir stock insuficiente sin bloquear la venta       | `HU-013`           | Cubierto por backlog |
| `RF-021` | Registrar producción                                    | `HU-007`           | Cubierto por backlog |
| `RF-022` | Consumir ingredientes al confirmar producción           | `HU-007`           | Cubierto por backlog |
| `RF-023` | Actualizar existencia preparada al confirmar producción | `HU-007`           | Cubierto por backlog |
| `RF-024` | Consultar registros de producción                       | `HU-008`           | Cubierto por backlog |
| `RF-025` | Registrar pedido                                        | `HU-009`           | Cubierto por backlog |
| `RF-026` | Gestionar estado del pedido                             | `HU-009`           | Cubierto por backlog |
| `RF-027` | Cancelar pedido antes del estado listo                  | `HU-011`           | Cubierto por backlog |
| `RF-028` | Generar comanda                                         | `HU-010`           | Cubierto por backlog |
| `RF-029` | Gestionar estado de comanda                             | `HU-010`, `HU-011` | Cubierto por backlog |
| `RF-030` | Consultar comandas desde cocina                         | `HU-010`           | Cubierto por backlog |
| `RF-031` | Registrar venta                                         | `HU-012`           | Cubierto por backlog |
| `RF-032` | Calcular total de venta                                 | `HU-012`           | Cubierto por backlog |
| `RF-033` | Registrar medio de pago                                 | `HU-012`           | Cubierto por backlog |
| `RF-034` | Asociar cliente opcional a venta                        | `HU-014`           | Cubierto por backlog |
| `RF-035` | Confirmar venta                                         | `HU-012`, `HU-013` | Cubierto por backlog |
| `RF-036` | Afectar inventario al confirmar venta                   | `HU-012`, `HU-013` | Cubierto por backlog |
| `RF-037` | Consultar historial de ventas                           | `HU-015`           | Cubierto por backlog |
| `RF-038` | Gestionar clientes básicos                              | `HU-014`           | Cubierto por backlog |
| `RF-039` | Gestionar proveedores                                   | `HU-016`           | Cubierto por backlog |
| `RF-040` | Registrar compra                                        | `HU-017`           | Cubierto por backlog |
| `RF-041` | Gestionar estado de compra                              | `HU-017`           | Cubierto por backlog |
| `RF-042` | Registrar recepción de compra                           | `HU-018`           | Cubierto por backlog |
| `RF-043` | Incrementar inventario al recibir compra                | `HU-018`           | Cubierto por backlog |
| `RF-044` | Consultar historial de compras                          | `HU-019`           | Cubierto por backlog |
| `RF-045` | Registrar gasto diario                                  | `HU-020`           | Cubierto por backlog |
| `RF-046` | Consultar gastos                                        | `HU-021`           | Cubierto por backlog |
| `RF-047` | Registrar entrada de asistencia                         | `HU-022`           | Cubierto por backlog |
| `RF-048` | Registrar salida de asistencia                          | `HU-022`           | Cubierto por backlog |
| `RF-049` | Impedir múltiples asistencias abiertas                  | `HU-022`           | Cubierto por backlog |
| `RF-050` | Consultar asistencia personal                           | `HU-023`           | Cubierto por backlog |
| `RF-051` | Consultar asistencia administrativamente                | `HU-024`           | Cubierto por backlog |
| `RF-052` | Gestionar turnos                                        | `HU-025`           | Cubierto por backlog |
| `RF-053` | Asociar operaciones al turno                            | `HU-025`           | Cubierto por backlog |
| `RF-054` | Preparar información esperada de cierre                 | `HU-026`           | Cubierto por backlog |
| `RF-055` | Registrar cierre de turno o caja                        | `HU-027`           | Cubierto por backlog |
| `RF-056` | Consultar cierre                                        | `HU-028`           | Cubierto por backlog |
| `RF-057` | Generar o consultar reporte de ventas                   | `HU-029`           | Cubierto por backlog |
| `RF-058` | Generar o consultar reporte de inventario               | `HU-030`           | Cubierto por backlog |
| `RF-059` | Generar o consultar reporte de asistencia               | `HU-031`           | Cubierto por backlog |

Resultado de la baseline:

```text
RF con HU asociada: 59/59
```

---

# 9. Trazabilidad RN → HU

Las reglas de negocio condicionan las HU; una RN puede afectar varias historias.

| RN       | Regla                                                                    | HU relacionadas                                                                          | Cobertura            |
| -------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------- |
| `RN-001` | Estados válidos de pedido                                                | `HU-009`                                                                                 | Cubierta por backlog |
| `RN-002` | Estados válidos de comanda                                               | `HU-010`                                                                                 | Cubierta por backlog |
| `RN-003` | Límite de cancelación de pedido/comanda                                  | `HU-009`, `HU-010`, `HU-011`                                                             | Cubierta por backlog |
| `RN-004` | Confirmación de venta como punto de afectación definitiva                | `HU-012`                                                                                 | Cubierta por backlog |
| `RN-005` | Stock negativo permitido                                                 | `HU-005`, `HU-006`, `HU-012`, `HU-013`, `HU-030`                                         | Cubierta por backlog |
| `RN-006` | Producción confirmada consume ingredientes                               | `HU-004`, `HU-007`                                                                       | Cubierta por backlog |
| `RN-007` | Producción confirmada actualiza la existencia preparada                  | `HU-007`, `HU-008`                                                                       | Cubierta por backlog |
| `RN-008` | No duplicar consumo de ingredientes                                      | `HU-004`, `HU-007`, `HU-012`                                                             | Cubierta por backlog |
| `RN-009` | Solo una compra recibida incrementa inventario                           | `HU-017`, `HU-018`                                                                       | Cubierta por backlog |
| `RN-010` | Compra pendiente no incrementa inventario                                | `HU-017`, `HU-018`                                                                       | Cubierta por backlog |
| `RN-011` | Una sola asistencia abierta por trabajador                               | `HU-022`                                                                                 | Cubierta por backlog |
| `RN-012` | La salida requiere y cierra una asistencia abierta                       | `HU-022`                                                                                 | Cubierta por backlog |
| `RN-013` | Cliente opcional en venta                                                | `HU-014`                                                                                 | Cubierta por backlog |
| `RN-014` | Crédito fuera del MVP                                                    | `HU-014`                                                                                 | Cubierta por backlog |
| `RN-015` | Facturación fiscal fuera del MVP                                         | `HU-012`                                                                                 | Cubierta por backlog |
| `RN-016` | Cierre de caja requiere autorización                                     | `HU-026`, `HU-027`, `HU-028`                                                             | Cubierta por backlog |
| `RN-017` | Operaciones relevantes deben conservar responsable                       | `HU-002`, `HU-005`, `HU-020`                                                             | Cubierta por backlog |
| `RN-018` | Hardware no condiciona la asistencia                                     | `HU-022`                                                                                 | Cubierta por backlog |
| `RN-019` | Un usuario puede poseer múltiples roles                                  | `HU-002`                                                                                 | Cubierta por backlog |
| `RN-020` | Los permisos efectivos se acumulan entre roles                           | `HU-002`, `HU-015`, `HU-020`, `HU-023`, `HU-024`, `HU-025`, `HU-027`, `HU-029`, `HU-031` | Cubierta por backlog |
| `RN-021` | Solo ADMINISTRADOR gestiona usuarios y roles                             | `HU-002`                                                                                 | Cubierta por backlog |
| `RN-022` | Solo ADMINISTRADOR y ENCARGADO registran gastos                          | `HU-020`, `HU-021`                                                                       | Cubierta por backlog |
| `RN-023` | Solo ADMINISTRADOR y ENCARGADO realizan cierres                          | `HU-026`, `HU-027`, `HU-028`                                                             | Cubierta por backlog |
| `RN-024` | MESERO puede cerrar solo si también posee ENCARGADO                      | `HU-027`                                                                                 | Cubierta por backlog |
| `RN-025` | MESERO consulta solo ventas de su turno                                  | `HU-015`, `HU-025`, `HU-029`                                                             | Cubierta por backlog |
| `RN-026` | COCINA puede consultar inventario y stock bajo                           | `HU-003`, `HU-005`, `HU-006`, `HU-030`                                                   | Cubierta por backlog |
| `RN-027` | COCINA gestiona compras de ingredientes de cocina                        | `HU-016`, `HU-017`, `HU-018`, `HU-019`                                                   | Cubierta por backlog |
| `RN-028` | Las composiciones conservan unidades y permiten conversiones compatibles | `HU-004`                                                                                 | Cubierta por backlog |
| `RN-029` | Producción registra cantidad final obtenida                              | `HU-007`                                                                                 | Cubierta por backlog |
| `RN-030` | Producciones repetidas acumulan disponibilidad                           | `HU-007`, `HU-008`                                                                       | Cubierta por backlog |
| `RN-031` | Bajas y pérdidas relevantes se registran por separado y con motivo       | `HU-007`                                                                                 | Cubierta por backlog |
| `RN-032` | Las compras directas de Cocina conservan recibo como respaldo            | `HU-017`                                                                                 | Cubierta por backlog |
| `RN-033` | Una compra se recibe después de verificar el producto                    | `HU-018`                                                                                 | Cubierta por backlog |
| `RN-034` | Una compra incompleta o no aceptada no se marca recibida                 | `HU-018`                                                                                 | Cubierta por backlog |
| `RN-035` | Dos turnos comparten una caja y existe un único cierre                   | `HU-025`, `HU-026`, `HU-027`                                                             | Cubierta por backlog |
| `RN-036` | La continuidad de caja conserva monto inicial y traspaso                 | `HU-025`, `HU-026`                                                                       | Cubierta por backlog |
| `RN-037` | PedidosYa se controla separado de efectivo y QR                          | `HU-026`                                                                                 | Cubierta por backlog |
| `RN-038` | Diferencias de caja conservan observación                                | `HU-026`, `HU-027`                                                                       | Cubierta por backlog |
| `RN-039` | El Encargado cierra y la Contadora revisa sin aprobación obligatoria     | `HU-027`                                                                                 | Cubierta por backlog |

```text
RN-001 ... RN-039 con HU asociada: 39/39
```

Las RN que representan restricciones de alcance mantienen su ID para compatibilidad documental; su presencia en una HU no convierte automáticamente la funcionalidad excluida en parte del MVP.

---

# 10. Trazabilidad RNF transversal

Los RNF no se modelan como una colección de historias técnicas independientes. Se aplican de forma transversal a las HU, arquitectura, seguridad, datos y estrategia de pruebas.

| RNF             | Condición de calidad                                     | HU con relación directa                                                                                                          | Cobertura transversal                                                                  | Tipo                  |
| --------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------- |
| `RNF-ACC-001`   | Etiquetas de campos                                      | —                                                                                                                                | `docs/09-ux-y-flujos.md` + validación frontend de `13`                                 | Transversal           |
| `RNF-ACC-002`   | Navegación básica mediante teclado                       | —                                                                                                                                | `docs/09-ux-y-flujos.md` + validación frontend de `13`                                 | Transversal           |
| `RNF-ACC-003`   | Contraste legible                                        | —                                                                                                                                | `docs/09-ux-y-flujos.md` + validación frontend de `13`                                 | Transversal           |
| `RNF-AUD-001`   | Usuario responsable                                      | `HU-002`, `HU-003`, `HU-008`, `HU-012`, `HU-015`, `HU-017`, `HU-019`, `HU-020`, `HU-021`, `HU-024`, `HU-025`, `HU-027`, `HU-028` | `11-modelo-datos.md` + `12-seguridad-y-riesgos.md` + `13-pruebas-y-validacion.md`      | Directa + transversal |
| `RNF-AUD-002`   | Fecha y hora de operaciones relevantes                   | `HU-008`, `HU-019`, `HU-020`, `HU-028`                                                                                           | `11-modelo-datos.md` + `12-seguridad-y-riesgos.md` + `13-pruebas-y-validacion.md`      | Directa + transversal |
| `RNF-AUD-003`   | Trazabilidad de origen de movimientos                    | `HU-005`                                                                                                                         | `11-modelo-datos.md` + `12-seguridad-y-riesgos.md` + `13-pruebas-y-validacion.md`      | Directa + transversal |
| `RNF-COM-001`   | Navegadores modernos                                     | —                                                                                                                                | `docs/09-ux-y-flujos.md` + validación frontend de `13`                                 | Transversal           |
| `RNF-COM-002`   | Sin dependencia de aplicación nativa                     | —                                                                                                                                | `docs/09-ux-y-flujos.md` + validación frontend de `13`                                 | Transversal           |
| `RNF-CON-001`   | Prevención de acciones duplicadas                        | `HU-012`, `HU-022`, `HU-027`                                                                                                     | `10-arquitectura.md` + `11-modelo-datos.md` + `13-pruebas-y-validacion.md`             | Directa + transversal |
| `RNF-CON-002`   | Protección ante concurrencia                             | —                                                                                                                                | `docs/10-arquitectura.md` / `11-modelo-datos.md` / `13-pruebas-y-validacion.md`        | Transversal           |
| `RNF-CON-003`   | Estados válidos                                          | `HU-009`, `HU-010`, `HU-011`                                                                                                     | `10-arquitectura.md` + `11-modelo-datos.md` + `13-pruebas-y-validacion.md`             | Directa + transversal |
| `RNF-DIS-001`   | Disponibilidad sin SLA cuantitativo                      | —                                                                                                                                | `docs/13-pruebas-y-validacion.md` + validación en entorno real                         | Transversal           |
| `RNF-ESC-001`   | Evolución modular                                        | —                                                                                                                                | `docs/10-arquitectura.md` + `15-plan-desarrollo.md`                                    | Transversal           |
| `RNF-ESC-002`   | Escala de usuarios no cuantificada                       | —                                                                                                                                | `docs/10-arquitectura.md` + `15-plan-desarrollo.md`                                    | Transversal           |
| `RNF-FUERA-001` | Backup automático                                        | —                                                                                                                                | Delimitado explícitamente como fuera del MVP                                           | Fuera del MVP         |
| `RNF-FUERA-002` | Restauración automatizada                                | —                                                                                                                                | Delimitado explícitamente como fuera del MVP                                           | Fuera del MVP         |
| `RNF-FUERA-003` | SLA cuantitativo                                         | —                                                                                                                                | Delimitado explícitamente como fuera del MVP                                           | Fuera del MVP         |
| `RNF-FUERA-004` | Rendimiento contractual                                  | —                                                                                                                                | Delimitado explícitamente como fuera del MVP                                           | Fuera del MVP         |
| `RNF-FUERA-005` | Escala contractual                                       | —                                                                                                                                | Delimitado explícitamente como fuera del MVP                                           | Fuera del MVP         |
| `RNF-FUERA-006` | Cumplimiento WCAG formal completo                        | —                                                                                                                                | Delimitado explícitamente como fuera del MVP                                           | Fuera del MVP         |
| `RNF-HW-001`    | Hardware desacoplado del núcleo                          | `HU-022`                                                                                                                         | `10-arquitectura.md` + alcance Post-MVP                                                | Directa + transversal |
| `RNF-HW-002`    | Interfaz conceptual separada                             | —                                                                                                                                | `docs/10-arquitectura.md` + alcance Post-MVP                                           | Transversal           |
| `RNF-INT-001`   | Atomicidad de operaciones compuestas                     | `HU-007`, `HU-012`, `HU-018`, `HU-025`, `HU-026`, `HU-027`                                                                       | `10-arquitectura.md` + `11-modelo-datos.md` + `13-pruebas-y-validacion.md`             | Directa + transversal |
| `RNF-INT-002`   | Consistencia entre operación y movimiento de inventario  | `HU-004`, `HU-005`, `HU-007`, `HU-018`                                                                                           | `10-arquitectura.md` + `11-modelo-datos.md` + `13-pruebas-y-validacion.md`             | Directa + transversal |
| `RNF-INT-003`   | No duplicación de consumo de ingredientes                | `HU-007`                                                                                                                         | `10-arquitectura.md` + `11-modelo-datos.md` + `13-pruebas-y-validacion.md`             | Directa + transversal |
| `RNF-INT-004`   | Persistencia de saldos negativos                         | `HU-013`, `HU-030`                                                                                                               | `10-arquitectura.md` + `11-modelo-datos.md` + `13-pruebas-y-validacion.md`             | Directa + transversal |
| `RNF-INT-005`   | Conservación del histórico ante desactivación            | `HU-003`, `HU-016`                                                                                                               | `10-arquitectura.md` + `11-modelo-datos.md` + `13-pruebas-y-validacion.md`             | Directa + transversal |
| `RNF-MAN-001`   | Separación modular por dominio                           | —                                                                                                                                | `docs/10-arquitectura.md` + `15-plan-desarrollo.md`                                    | Transversal           |
| `RNF-MAN-002`   | Separación de lógica de negocio e interfaz               | —                                                                                                                                | `docs/10-arquitectura.md` + `15-plan-desarrollo.md`                                    | Transversal           |
| `RNF-MAN-003`   | Configuración fuera del código fuente cuando corresponda | —                                                                                                                                | `docs/10-arquitectura.md` + `15-plan-desarrollo.md`                                    | Transversal           |
| `RNF-OBS-001`   | Registro técnico de errores                              | —                                                                                                                                | `docs/11-modelo-datos.md` / `12-seguridad-y-riesgos.md` / `13-pruebas-y-validacion.md` | Transversal           |
| `RNF-OBS-002`   | No usar logs como sustituto de auditabilidad funcional   | —                                                                                                                                | `docs/11-modelo-datos.md` / `12-seguridad-y-riesgos.md` / `13-pruebas-y-validacion.md` | Transversal           |
| `RNF-POR-001`   | Despliegue reproducible                                  | —                                                                                                                                | `docs/10-arquitectura.md` + `15-plan-desarrollo.md`                                    | Transversal           |
| `RNF-PRI-001`   | Minimización de datos personales                         | `HU-014`                                                                                                                         | `12-seguridad-y-riesgos.md` + `13-pruebas-y-validacion.md`                             | Directa + transversal |
| `RNF-PRI-002`   | Sin almacenamiento biométrico en el MVP                  | `HU-022`                                                                                                                         | `12-seguridad-y-riesgos.md` + `13-pruebas-y-validacion.md`                             | Directa + transversal |
| `RNF-REC-001`   | Errores sin corrupción de operación                      | `HU-026`                                                                                                                         | `10-arquitectura.md` + `11-modelo-datos.md` + `13-pruebas-y-validacion.md`             | Directa + transversal |
| `RNF-REC-002`   | Mensajes de error accionables                            | —                                                                                                                                | `docs/10-arquitectura.md` / `11-modelo-datos.md` / `13-pruebas-y-validacion.md`        | Transversal           |
| `RNF-REC-003`   | Backups fuera del MVP                                    | —                                                                                                                                | `docs/10-arquitectura.md` / `11-modelo-datos.md` / `13-pruebas-y-validacion.md`        | Transversal           |
| `RNF-REN-001`   | Retroalimentación durante operaciones                    | —                                                                                                                                | `docs/13-pruebas-y-validacion.md` + validación en entorno real                         | Transversal           |
| `RNF-REN-002`   | Tiempo de respuesta                                      | —                                                                                                                                | `docs/13-pruebas-y-validacion.md` + validación en entorno real                         | Transversal           |
| `RNF-REN-003`   | Concurrencia de usuarios                                 | —                                                                                                                                | `docs/13-pruebas-y-validacion.md` + validación en entorno real                         | Transversal           |
| `RNF-SEG-001`   | Autenticación obligatoria para funciones protegidas      | `HU-001`                                                                                                                         | `12-seguridad-y-riesgos.md` + `13-pruebas-y-validacion.md`                             | Directa + transversal |
| `RNF-SEG-002`   | Autorización aplicada en backend                         | `HU-002`, `HU-015`, `HU-023`, `HU-024`, `HU-029`, `HU-031`                                                                       | `12-seguridad-y-riesgos.md` + `13-pruebas-y-validacion.md`                             | Directa + transversal |
| `RNF-SEG-003`   | Soporte de múltiples roles por usuario                   | `HU-002`                                                                                                                         | `12-seguridad-y-riesgos.md` + `13-pruebas-y-validacion.md`                             | Directa + transversal |
| `RNF-SEG-004`   | Contraseñas no almacenadas en texto plano                | `HU-001`                                                                                                                         | `12-seguridad-y-riesgos.md` + `13-pruebas-y-validacion.md`                             | Directa + transversal |
| `RNF-SEG-005`   | Protección del transporte en producción                  | —                                                                                                                                | `docs/12-seguridad-y-riesgos.md` + pruebas aplicables de `13`                          | Transversal           |
| `RNF-SEG-006`   | Expiración e invalidación de sesión                      | `HU-001`                                                                                                                         | `12-seguridad-y-riesgos.md` + `13-pruebas-y-validacion.md`                             | Directa + transversal |
| `RNF-SEG-007`   | No exposición de información sensible en errores         | —                                                                                                                                | `docs/12-seguridad-y-riesgos.md` + pruebas aplicables de `13`                          | Transversal           |
| `RNF-USA-001`   | Interfaz responsive                                      | `HU-029`, `HU-030`, `HU-031`                                                                                                     | `09-ux-y-flujos.md` + `13-pruebas-y-validacion.md`                                     | Directa + transversal |
| `RNF-USA-002`   | Ancho mínimo móvil de 360 px                             | —                                                                                                                                | `docs/09-ux-y-flujos.md` + validación frontend de `13`                                 | Transversal           |
| `RNF-USA-003`   | Estados visibles                                         | `HU-006`, `HU-009`, `HU-010`, `HU-017`                                                                                           | `09-ux-y-flujos.md` + `13-pruebas-y-validacion.md`                                     | Directa + transversal |
| `RNF-USA-004`   | Confirmación en acciones críticas                        | `HU-011`, `HU-013`                                                                                                               | `09-ux-y-flujos.md` + `13-pruebas-y-validacion.md`                                     | Directa + transversal |
| `RNF-USA-005`   | Validación de formularios                                | —                                                                                                                                | `docs/09-ux-y-flujos.md` + validación frontend de `13`                                 | Transversal           |

Un RNF sin HU directa **no se considera huérfano** cuando su naturaleza es transversal y existe una ruta explícita de diseño y verificación.

---

# 11. Cobertura de HU → requisitos

Objetivo: detectar historias que no tengan justificación funcional.

| HU       | RF/RN asociados                                                                            | Necesidad asociada                 | Resultado |
| -------- | ------------------------------------------------------------------------------------------ | ---------------------------------- | --------- |
| `HU-001` | `RF-001`, `RF-002`                                                                         | `N-013`                            | Trazada   |
| `HU-002` | `RF-003`, `RF-004`, `RF-005`, `RF-006`<br>`RN-017`, `RN-019`, `RN-020`, `RN-021`           | `N-010`, `N-013`, `N-014`          | Trazada   |
| `HU-003` | `RF-007`, `RF-008`, `RF-009`, `RF-011`, `RF-012`<br>`RN-026`                               | `N-004`, `N-011`, `N-013`          | Trazada   |
| `HU-004` | `RF-010`<br>`RN-006`, `RN-008`, `RN-028`                                                   | `N-003`, `N-004`                   | Trazada   |
| `HU-005` | `RF-013`, `RF-014`, `RF-015`, `RF-018`, `RF-019`<br>`RN-005`, `RN-017`, `RN-026`           | `N-004`, `N-014`                   | Trazada   |
| `HU-006` | `RF-016`, `RF-017`<br>`RN-005`, `RN-026`                                                   | `N-005`                            | Trazada   |
| `HU-007` | `RF-021`, `RF-022`, `RF-023`<br>`RN-006`, `RN-007`, `RN-008`, `RN-029`, `RN-030`, `RN-031` | `N-003`, `N-004`                   | Trazada   |
| `HU-008` | `RF-024`<br>`RN-007`, `RN-030`                                                             | `N-003`, `N-004`                   | Trazada   |
| `HU-009` | `RF-025`, `RF-026`<br>`RN-001`, `RN-003`                                                   | `N-011`                            | Trazada   |
| `HU-010` | `RF-028`, `RF-029`, `RF-030`<br>`RN-002`, `RN-003`                                         | `N-011`                            | Trazada   |
| `HU-011` | `RF-027`, `RF-029`<br>`RN-003`                                                             | `N-011`                            | Trazada   |
| `HU-012` | `RF-031`, `RF-032`, `RF-033`, `RF-035`, `RF-036`<br>`RN-004`, `RN-005`, `RN-008`, `RN-015` | `N-004`, `N-011`, `N-014`          | Trazada   |
| `HU-013` | `RF-020`, `RF-035`, `RF-036`<br>`RN-005`                                                   | `N-004`, `N-005`                   | Trazada   |
| `HU-014` | `RF-034`, `RF-038`<br>`RN-013`, `RN-014`                                                   | `N-011`                            | Trazada   |
| `HU-015` | `RF-037`<br>`RN-020`, `RN-025`                                                             | `N-010`, `N-011`, `N-013`          | Trazada   |
| `HU-016` | `RF-039`<br>`RN-027`                                                                       | `N-006`, `N-008`                   | Trazada   |
| `HU-017` | `RF-040`, `RF-041`<br>`RN-009`, `RN-010`, `RN-027`, `RN-032`                               | `N-006`, `N-007`, `N-008`, `N-014` | Trazada   |
| `HU-018` | `RF-042`, `RF-043`<br>`RN-009`, `RN-010`, `RN-027`, `RN-033`, `RN-034`                     | `N-004`, `N-006`, `N-008`          | Trazada   |
| `HU-019` | `RF-044`<br>`RN-027`                                                                       | `N-006`, `N-008`                   | Trazada   |
| `HU-020` | `RF-045`<br>`RN-017`, `RN-020`, `RN-022`                                                   | `N-009`, `N-014`                   | Trazada   |
| `HU-021` | `RF-046`<br>`RN-022`                                                                       | `N-009`                            | Trazada   |
| `HU-022` | `RF-047`, `RF-048`, `RF-049`<br>`RN-011`, `RN-012`, `RN-018`                               | `N-001`, `N-002`                   | Trazada   |
| `HU-023` | `RF-050`<br>`RN-020`                                                                       | `N-001`, `N-002`                   | Trazada   |
| `HU-024` | `RF-051`<br>`RN-020`                                                                       | `N-001`, `N-002`, `N-010`          | Trazada   |
| `HU-025` | `RF-052`, `RF-053`<br>`RN-020`, `RN-025`, `RN-035`, `RN-036`                               | `N-009`, `N-011`, `N-014`          | Trazada   |
| `HU-026` | `RF-054`<br>`RN-016`, `RN-023`, `RN-035`–`RN-038`                                          | `N-009`, `N-011`                   | Trazada   |
| `HU-027` | `RF-055`<br>`RN-016`, `RN-020`, `RN-023`, `RN-024`, `RN-035`, `RN-038`, `RN-039`           | `N-009`, `N-011`, `N-013`, `N-014` | Trazada   |
| `HU-028` | `RF-056`<br>`RN-016`, `RN-023`                                                             | `N-010`, `N-011`                   | Trazada   |
| `HU-029` | `RF-057`<br>`RN-020`, `RN-025`                                                             | `N-010`, `N-011`                   | Trazada   |
| `HU-030` | `RF-058`<br>`RN-005`, `RN-026`                                                             | `N-004`, `N-005`, `N-010`          | Trazada   |
| `HU-031` | `RF-059`<br>`RN-020`                                                                       | `N-001`, `N-002`, `N-010`          | Trazada   |

Resultado actual:

```text
HU MVP con RF y/o RN asociado: 31/31
HU MVP con necesidad asociada: 31/31
```

---

# 12. Diseño por dominio

La trazabilidad de diseño se mantiene por dominio para evitar duplicar especificaciones completas en esta matriz. Los diagramas se alojan una vez en su documento principal: casos de uso y estados en `06-srs.md`, flujos UX y secuencias en `09-ux-y-flujos.md`, componentes y despliegue en `10-arquitectura.md`, y clases/ER en `11-modelo-datos.md`.

| Dominio               | HU            | UX                                    | Arquitectura                                 | Datos                                                                          |
| --------------------- | ------------- | ------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| Acceso y usuarios     | HU-001–HU-002 | `09-ux-y-flujos.md`                   | `10-arquitectura.md`: Identity/JWT/roles     | `users`, `roles`, `user_roles`, `employees`                                    |
| Catálogo e inventario | HU-003–HU-006 | `flujo-ux-produccion-inventario.puml` | `10-arquitectura.md`: catálogo/inventario    | `categories`, `units`, `products`, `product_compositions`, `inventory_*`       |
| Producción            | HU-007–HU-008 | `flujo-ux-produccion-inventario.puml` | `10-arquitectura.md`: producción             | `productions`, `production_consumptions`, `inventory_*`                        |
| Pedidos / Cocina      | HU-009–HU-011 | `flujo-ux-pedido-venta.puml`          | `10-arquitectura.md`: pedidos + SignalR KDS  | `orders`, `order_items`, `kitchen_commands`, `kitchen_command_items`           |
| Ventas / clientes     | HU-012–HU-015 | `flujo-ux-pedido-venta.puml`          | `10-arquitectura.md`: ventas                 | `sales`, `sale_items`, `customers`, `inventory_*`                              |
| Compras / proveedores | HU-016–HU-019 | `flujo-ux-compra-recepcion.puml`      | `10-arquitectura.md`: compras                | `suppliers`, `purchases`, `purchase_items`, `purchase_receipts`, `inventory_*` |
| Gastos                | HU-020–HU-021 | `flujo-ux-turno-cierre.puml`          | `10-arquitectura.md`: operación de caja      | `expense_categories`, `expenses`                                               |
| Asistencia            | HU-022–HU-024 | `flujo-ux-asistencia.puml`            | `10-arquitectura.md`: personal/asistencia    | `employees`, `attendance_records`                                              |
| Turnos / cierre       | HU-025–HU-028 | `flujo-ux-turno-cierre.puml`          | `10-arquitectura.md`: turnos/caja            | `cash_sessions`, `shifts`, `shift_assignments`, `cash_closings`                |
| Reportes              | HU-029–HU-031 | `09-ux-y-flujos.md`                   | `10-arquitectura.md`: proyecciones/consultas | Consultas derivadas; sin tablas de reporte persistentes                        |

---

# 13. Trazabilidad HU → pruebas

Los casos concretos se incorporan dentro del expediente de cada HU cuando se ejecuta.

Convención:

```text
HU-012
→ CP-HU012-01
→ CP-HU012-02
→ ...
```

Antes de ejecutar una HU:

```text
Pruebas ejecutadas = PENDIENTE
Resultado obtenido = PENDIENTE
Evidencia = PENDIENTE
```

Al finalizarla, el expediente `docs/historias/HU-XXX-....md` registra los casos, resultados y enlaces a `docs/capturas/` cuando corresponda.

---

# 14. Trazabilidad HU → implementación

La implementación no se registra mediante columnas individuales de commit/PR/Issue en esta matriz.

Ruta:

```text
14-trazabilidad.md
      ↓
HU-XXX
      ↓
docs/historias/HU-XXX-....md
      ├── implementación
      ├── decisiones
      ├── casos de prueba
      ├── resultados
      ├── Issues
      ├── commits
      ├── PR cuando corresponda
      └── capturas/evidencia
```

---

# 15. Historias Post-MVP

Las siguientes historias permanecen visibles para preservar trazabilidad de alcance, pero no cuentan como avance del MVP actual.

| HU       | Historia                                            | Estado     | Implementación | Evidencia  |
| -------- | --------------------------------------------------- | ---------- | -------------- | ---------- |
| `HU-032` | Emitir facturación fiscal                           | `POST-MVP` | `POST-MVP`     | `POST-MVP` |
| `HU-033` | Gestionar ventas a crédito y cuentas por cobrar     | `POST-MVP` | `POST-MVP`     | `POST-MVP` |
| `HU-034` | Registrar asistencia mediante biométrico físico     | `POST-MVP` | `POST-MVP`     | `POST-MVP` |
| `HU-035` | Imprimir comprobantes mediante impresora térmica    | `POST-MVP` | `POST-MVP`     | `POST-MVP` |
| `HU-036` | Calcular nómina a partir de asistencia              | `POST-MVP` | `POST-MVP`     | `POST-MVP` |
| `HU-037` | Gestionar cuentas por pagar avanzadas a proveedores | `POST-MVP` | `POST-MVP`     | `POST-MVP` |
| `HU-038` | Incorporar reportería avanzada                      | `POST-MVP` | `POST-MVP`     | `POST-MVP` |
| `HU-039` | Incorporar backup y restauración                    | `POST-MVP` | `POST-MVP`     | `POST-MVP` |

No deberán pasar a `Ready` dentro de los tres Sprints sin un cambio formal de alcance.

---

# 16. Elementos transversales sin HU funcional exclusiva

| Elemento                                       | Razón                                                                          | Cobertura                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `N-012` — independencia de plataforma anterior | Es una restricción/objetivo de solución, no una interacción de usuario aislada | Arquitectura propia, base propia, contratos propios, repositorio independiente |
| Seguridad transversal                          | Afecta múltiples operaciones                                                   | `12-seguridad-y-riesgos.md` + RNF-SEG/PRI + pruebas de autorización            |
| Observabilidad                                 | No constituye una pantalla de negocio                                          | logging/error handling de arquitectura y pruebas                               |
| Mantenibilidad / modularidad                   | Característica estructural                                                     | `10-arquitectura.md` y preparación técnica                                     |
| Responsive/accesibilidad                       | Calidad de múltiples pantallas                                                 | `09-ux-y-flujos.md` + validaciones de `13`                                     |
| Despliegue reproducible                        | Propiedad del entorno                                                          | `10-arquitectura.md` + futuro `15-plan-desarrollo.md`                          |

---

# 17. Cambios y mantenimiento de trazabilidad

Ante un cambio funcional:

```text
origen/evidencia
      ↓
hallazgo/necesidad afectada
      ↓
RF / RN / RNF
      ↓
Product Backlog
      ↓
HU
      ↓
UX / arquitectura / datos
      ↓
pruebas
      ↓
trazabilidad
```

No se actualizará únicamente `14-trazabilidad.md` si el documento fuente también cambió.

---

# 18. Uso durante un Sprint

## 18.1. Al pasar a Ready

Verificar:

```text
[ ] RF/RN/RNF relacionados
[ ] necesidad
[ ] dependencias
[ ] datos
[ ] riesgos
[ ] pruebas previstas
```

## 18.2. Al pasar a In Progress

Crear:

```text
docs/historias/HU-XXX-....md
```

Actualizar trazabilidad:

```text
PENDIENTE → EN DESARROLLO
```

## 18.3. Al pasar a Review

Registrar en la HU:

- implementación realizada;
- pruebas ejecutadas;
- resultados;
- defectos conocidos;
- evidencia;
- Issues/commits/PR aplicables.

## 18.4. Al pasar a Done

Actualizar:

```text
EN DESARROLLO
→ IMPLEMENTADO
```

y `VALIDADO` cuando se complete la validación prevista.

---

# 19. Validación con Product Owner

La validación de la PO se registra en los documentos de Sprint Review:

```text
docs/sprints/sprint-01-review.md
docs/sprints/sprint-02-review.md
docs/sprints/sprint-03-review.md
```

Una observación de la PO debe clasificarse como:

```text
aceptación
defecto
solicitud de cambio
nueva necesidad
observación
```

No toda observación modifica automáticamente el alcance.

---

# 20. Validaciones de cobertura actuales

| Validación                               | Resultado de baseline                                |
| ---------------------------------------- | ---------------------------------------------------- |
| RF-001–RF-059 poseen HU MVP asociada     | **Sí — 59/59**                                       |
| RN-001–RN-039 poseen HU MVP asociada     | **Sí — 39/39**                                       |
| HU-001–HU-031 poseen necesidad asociada  | **Sí — 31/31**                                       |
| HU-001–HU-031 poseen RF y/o RN asociado  | **Sí — 31/31**                                       |
| N-012 posee HU directa                   | **No aplica — cobertura arquitectónica transversal** |
| HU-032–HU-039 separadas del MVP          | **Sí**                                               |
| Implementaciones Sprint 1 registradas    | **10 — consultar expedientes individuales y `sprint-01.md`** |
| Implementaciones Sprint 2 registradas    | **8/8 implementadas end-to-end — consultar `sprint-02.md` y su informe de verificación final** |
| Validación final de Product Owner         | **No declarada: no existe `sprint-01-review.md` ni Sprint Review de Sprint 2 documentada** |

La matriz no sustituye las evidencias de cada expediente ni convierte la falta de Sprint Review en aceptación implícita.

---

# 21. Checklist de consistencia

Antes de cerrar una baseline o Sprint:

```text
[ ] Todo RF nuevo posee origen/necesidad
[ ] Todo RF MVP posee HU
[ ] Toda HU posee RF/RN o justificación
[ ] Toda HU posee necesidad
[ ] RN críticas aparecen en pruebas
[ ] RNF transversales tienen ruta de verificación
[ ] Datos coinciden con 11-modelo-datos.md
[ ] Permisos coinciden con SRS/12-seguridad-y-riesgos.md
[ ] UX coincide con 09-ux-y-flujos.md
[ ] Implementado significa que existe código verificable
[ ] Validado significa que existe validación real
[ ] Evidencia enlazada existe
[ ] Capturas usan prefijo HU/Sprint
[ ] No existen funcionalidades accidentales fuera del alcance
[ ] Post-MVP permanece separado
```

---

# 22. Próximo documento

Con la trazabilidad inicial consolidada, el siguiente documento principal será:

```text
docs/15-plan-desarrollo.md
```

Ese documento convertirá la baseline actual en un plan operativo para:

- preparar repositorio y entornos;
- crear los scaffolds;
- configurar variables y contratos;
- establecer el camino crítico;
- preparar la primera iteración;
- alcanzar `Ready to Develop`.

---

# 23. Control de cambios

| Versión | Descripción                                                                                                                    | Estado  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `0.1`   | Baseline de trazabilidad con HU como unidad principal; cobertura RF/RN/RNF, necesidades, diseño, pruebas y separación Post-MVP | Vigente |
