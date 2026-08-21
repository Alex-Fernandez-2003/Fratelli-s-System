# Reglas de Negocio — Restaurant System

## 1. Propósito

Este documento constituye el catálogo canónico de **reglas de negocio (RN)** de **Restaurant System** para el restaurante **Fratelli**.

Su objetivo es consolidar en un único lugar las reglas que condicionan el comportamiento funcional del sistema y que actualmente se encuentran distribuidas entre:

```text
03-hallazgos-y-necesidades.md
04-objetivos-y-propuesta-valor.md
05-alcance-y-mvp.md
06-srs.md
requirements/requisitos-funcionales.md
requirements/requisitos-no-funcionales.md
```

Las reglas de negocio expresan condiciones que deben respetarse independientemente de la tecnología utilizada.

Este documento también distingue:

- reglas confirmadas;
- reglas con información pendiente;
- restricciones de alcance que previamente fueron registradas con prefijo `RN` por compatibilidad documental.

---

## 2. Estado documental

| Campo | Valor |
|---|---|
| **Documento** | `requirements/reglas-negocio.md` |
| **Proyecto** | Restaurant System |
| **Organización objetivo** | Restaurante Fratelli |
| **Versión actual** | `0.2` |
| **Estado** | Baseline revalidada tras ENT-02 |
| **Fecha** | 21 de agosto de 2026 |
| **Product Owner** | Ana Paola Viscarra Chambi |
| **Scrum Master** | Alex Saúl Fernandez Valdez |
| **SRS relacionado** | `docs/06-srs.md` |
| **RF relacionados** | `docs/requirements/requisitos-funcionales.md` |

---

# 3. Convenciones

## 3.1. Identificación

Las reglas utilizan el formato:

```text
RN-XXX
```

Ejemplo:

```text
RN-005 — Stock negativo permitido
```

---

## 3.2. Estado

| Estado | Significado |
|---|---|
| **Confirmada** | La regla fue validada o definida explícitamente durante el análisis |
| **Confirmada con detalle pendiente** | La regla principal está definida, pero existen parámetros o excepciones aún no precisados |
| **Restricción de alcance** | No es una regla de negocio pura; se conserva el ID por compatibilidad documental |
| **Restricción técnica / alcance** | Decisión del producto o arquitectura, no regla operativa del restaurante |
| **Pendiente** | No existe información suficiente para convertirla en regla |

---

## 3.3. Categorías utilizadas

| Categoría | Descripción |
|---|---|
| **Usuarios y autorización** | Identidad, roles y permisos |
| **Inventario** | Existencias, stock y movimientos |
| **Producción** | Consumo de ingredientes y existencias preparadas |
| **Pedidos/comandas** | Estados y transiciones |
| **Ventas** | Confirmación, cliente y stock |
| **Compras** | Estados, recepción e impacto en inventario |
| **Gastos** | Registro y permisos |
| **Asistencia** | Entrada, salida y consistencia |
| **Caja/turnos** | Cierre, permisos y agrupación |
| **Reportes** | Alcance de consulta |
| **Trazabilidad** | Responsable y origen de operaciones |
| **Alcance** | Decisiones que limitan el MVP |

---

# 4. Reglas de pedidos y comandas

## RN-001 — Estados válidos de pedido

| Campo | Valor |
|---|---|
| **Categoría** | Pedidos/comandas |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión de SRS |
| **RF relacionados** | `RF-025`, `RF-026`, `RF-027` |

### Regla

Todo pedido deberá utilizar exclusivamente los siguientes estados:

```text
PENDIENTE
EN_PREPARACION
LISTO
ENTREGADO
CANCELADO
```

### Condición

No se permitirá persistir un pedido en un estado diferente a los definidos.

### Implicaciones

- un pedido nuevo inicia en `PENDIENTE`;
- `EN_PREPARACION` representa que cocina comenzó el trabajo;
- `LISTO` representa que la preparación terminó;
- `ENTREGADO` representa que el pedido fue entregado;
- `CANCELADO` termina el flujo ordinario.

---

## RN-002 — Estados válidos de comanda

| Campo | Valor |
|---|---|
| **Categoría** | Pedidos/comandas |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión de SRS |
| **RF relacionados** | `RF-028`, `RF-029`, `RF-030` |

### Regla

Toda comanda deberá utilizar exclusivamente:

```text
PENDIENTE
EN_PREPARACION
LISTA
CANCELADA
```

### Condición

No se permitirá persistir una comanda en un estado diferente.

### Implicaciones

- la comanda inicia en `PENDIENTE`;
- cocina puede pasarla a `EN_PREPARACION`;
- cocina puede marcarla `LISTA`;
- `CANCELADA` finaliza el flujo ordinario.

---

## RN-003 — Límite de cancelación de pedido/comanda

| Campo | Valor |
|---|---|
| **Categoría** | Pedidos/comandas |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita del MVP |
| **RF relacionados** | `RF-027`, `RF-029` |

### Regla

La cancelación ordinaria solo estará permitida antes de que:

```text
Pedido  → LISTO
Comanda → LISTA
```

### Condición

Se podrá cancelar desde:

```text
PENDIENTE
EN_PREPARACION
```

No se permitirá la cancelación ordinaria desde:

```text
LISTO / LISTA
ENTREGADO
```

### Implicaciones

Una corrección posterior a esos estados requerirá una regla diferente que todavía no forma parte de esta baseline.

---

# 5. Reglas de ventas e inventario

## RN-004 — Confirmación de venta como punto de afectación definitiva

| Campo | Valor |
|---|---|
| **Categoría** | Ventas / inventario |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión de SRS |
| **RF relacionados** | `RF-031`, `RF-035`, `RF-036` |

### Regla

El movimiento definitivo de inventario asociado a una venta se producirá al **confirmar/cobrar la venta**.

### No produce afectación definitiva

```text
Crear pedido
Pedido PENDIENTE
Pedido EN_PREPARACION
```

### Produce afectación

```text
Venta confirmada/cobrada
```

### Implicaciones

- una operación cancelada antes de confirmarse no produce una salida comercial definitiva;
- la confirmación deberá quedar trazada;
- el inventario reflejará la operación confirmada.

---

## RN-005 — Stock negativo permitido

| Campo | Valor |
|---|---|
| **Categoría** | Inventario / ventas |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita del MVP |
| **RF relacionados** | `RF-015`, `RF-017`, `RF-020`, `RF-035`, `RF-036` |

### Regla

La falta de stock no impedirá confirmar una venta.

### Condición

Si una venta requiere una cantidad mayor a la existencia registrada:

```text
Stock insuficiente
        ↓
Advertencia
        ↓
Usuario puede continuar
        ↓
Venta confirmada
        ↓
Saldo puede quedar negativo
```

### Justificación

La operación real puede continuar mientras se gestiona posteriormente el reabastecimiento con proveedores.

### Implicaciones

- el saldo negativo se almacena;
- no se corrige silenciosamente a cero;
- debe ser visible en inventario;
- sigue considerándose condición de stock bajo;
- el movimiento de venta conserva trazabilidad.

---

# 6. Reglas de producción y existencias preparadas

## RN-006 — Producción confirmada consume ingredientes

| Campo | Valor |
|---|---|
| **Categoría** | Producción / Inventario |
| **Estado** | **Confirmada** |
| **Fuente** | SRS / ENT-02 |
| **RF relacionados** | `RF-010`, `RF-021`, `RF-022` |

### Regla

Al confirmar una producción, el sistema deberá consumir los ingredientes definidos por la composición y por la cantidad final obtenida.

### Condiciones

- la composición conserva cantidad y unidad por ingrediente;
- cuando inventario y consumo usan unidades compatibles distintas, se aplica la conversión definida; la evidencia confirma el caso `kg ↔ g` para carne;
- no se requiere registrar rendimiento esperado en el MVP;
- la operación de producción y sus movimientos no deben quedar parcialmente aplicados.

---

## RN-007 — Producción confirmada actualiza la existencia preparada

| Campo | Valor |
|---|---|
| **Categoría** | Producción / Inventario |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-021`, `RF-023`, `RF-024` |

### Regla

Una producción confirmada deberá registrar el evento y aumentar la existencia disponible de la preparación con la **cantidad final obtenida**.

### Condiciones

- cada evento conserva fecha, cantidad y responsable;
- varias producciones del mismo producto pueden acumularse en una disponibilidad total;
- el MVP no necesita distinguir o seleccionar cada tanda/lote al vender;
- no se exige fecha exacta de vencimiento por lote en la baseline actual.

---

## RN-008 — No duplicar consumo de ingredientes

| Campo | Valor |
|---|---|
| **Categoría** | Producción / Ventas / Inventario |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión de producción + ENT-02 |
| **RF relacionados** | `RF-022`, `RF-023`, `RF-036` |

### Regla

Si los ingredientes ya fueron descontados al producir una preparación, la venta posterior deberá reducir la existencia preparada y **no volver a descontar esos ingredientes**.

### Flujo

```text
Confirmar producción
→ consume ingredientes
→ aumenta existencia preparada

Confirmar venta
→ reduce existencia preparada
→ no vuelve a consumir ingredientes
```

---

# 7. Reglas de compras

## RN-009 — Solo una compra recibida incrementa inventario

| Campo | Valor |
|---|---|
| **Categoría** | Compras / inventario |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita del MVP |
| **RF relacionados** | `RF-040`, `RF-041`, `RF-042`, `RF-043` |

### Regla

Una compra solo incrementará las existencias cuando su estado sea:

```text
RECIBIDA
```

### Implicaciones

- la recepción genera movimientos de entrada;
- los movimientos deben conservar relación con la compra;
- una compra registrada pero no recibida no representa stock físico disponible.

---

## RN-010 — Compra pendiente no incrementa inventario

| Campo | Valor |
|---|---|
| **Categoría** | Compras / inventario |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita del MVP |
| **RF relacionados** | `RF-040`, `RF-041`, `RF-043` |

### Regla

Una compra:

```text
PENDIENTE
```

no modificará las existencias como recepción definitiva.

### Regla complementaria

Una compra:

```text
CANCELADA
```

tampoco incrementará inventario.

---

# 8. Reglas de asistencia

## RN-011 — Una sola asistencia abierta por trabajador

| Campo | Valor |
|---|---|
| **Categoría** | Asistencia |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita del MVP |
| **RF relacionados** | `RF-047`, `RF-049` |

### Regla

Un trabajador podrá tener como máximo una asistencia abierta simultáneamente.

### Condición

```text
Sin entrada abierta
        ↓
Puede registrar entrada

Con entrada abierta
        ↓
No puede registrar otra entrada
```

---

## RN-012 — La salida requiere y cierra una asistencia abierta

| Campo | Valor |
|---|---|
| **Categoría** | Asistencia |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita del MVP |
| **RF relacionados** | `RF-048`, `RF-049` |

### Regla

Una salida deberá corresponder a una entrada abierta.

### Flujo

```text
Entrada
   ↓
Asistencia abierta
   ↓
Salida
   ↓
Asistencia cerrada
```

### Implicaciones

- no existe salida normal sin entrada previa;
- después de cerrar la asistencia, el trabajador podrá registrar una nueva entrada futura.

---

# 9. Reglas de clientes y alcance comercial

## RN-013 — Cliente opcional en venta

| Campo | Valor |
|---|---|
| **Categoría** | Ventas / clientes |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión de MVP |
| **RF relacionados** | `RF-031`, `RF-034`, `RF-038` |

### Regla

Una venta podrá existir sin cliente asociado.

### Condición

```text
Venta
├── con cliente
└── sin cliente
```

ambas son válidas dentro del MVP.

### Implicación

Asociar un cliente no habilita automáticamente crédito.

---

# 10. Decisiones y restricciones previamente registradas como RN

> Esta sección conserva los IDs `RN-014`, `RN-015` y `RN-018` para no romper la trazabilidad de la SRS. Sin embargo, se clasifican correctamente como restricciones o decisiones de alcance y **no como reglas de negocio puras**.

## RN-014 — Crédito fuera del MVP

| Campo | Valor |
|---|---|
| **Clasificación real** | **Restricción de alcance** |
| **Estado** | **Confirmada** |
| **Fuente** | `05-alcance-y-mvp.md` |
| **RF relacionados** | `RF-034`, `RF-038` |

### Restricción

El MVP no incluirá:

- venta a crédito;
- cuentas por cobrar;
- límites de crédito;
- mora;
- vencimientos;
- pagos parciales de crédito.

### Compatibilidad

Se mantiene el ID `RN-014` porque ya fue referenciado en la SRS.

---

## RN-015 — Facturación fiscal fuera del MVP

| Campo | Valor |
|---|---|
| **Clasificación real** | **Restricción de alcance** |
| **Estado** | **Confirmada** |
| **Fuente** | `05-alcance-y-mvp.md` |
| **RF relacionados** | `RF-035` |

### Restricción

Confirmar una venta no generará facturación fiscal dentro del MVP.

### Fuera de alcance

- emisión fiscal;
- integración tributaria;
- contratos con servicios fiscales;
- contingencia fiscal;
- autorización/códigos tributarios.

### Compatibilidad

Se conserva el ID `RN-015`.

---

# 11. Reglas de caja, autorización y trazabilidad

## RN-016 — Cierre de caja requiere autorización

| Campo | Valor |
|---|---|
| **Categoría** | Caja / autorización |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión de permisos |
| **RF relacionados** | `RF-052`, `RF-054`, `RF-055` |

### Regla

El cierre de turno/caja solo podrá realizarse por un usuario con un rol que otorgue dicho permiso.

### Roles autorizados

```text
ADMINISTRADOR
ENCARGADO
```

El detalle sobre usuarios con múltiples roles se formaliza en `RN-019`, `RN-020` y `RN-024`.

---

## RN-017 — Operaciones relevantes deben conservar responsable

| Campo | Valor |
|---|---|
| **Categoría** | Trazabilidad |
| **Estado** | **Confirmada** |
| **Fuente** | `N-014` |
| **RF relacionados** | `RF-006` y operaciones trazables |

### Regla

Las operaciones relevantes deberán registrar el usuario responsable cuando corresponda.

### Incluye como mínimo

- venta;
- compra;
- gasto;
- producción;
- cierre;
- movimientos de inventario de origen manual.

### Implicación

La trazabilidad funcional no dependerá únicamente de logs técnicos.

---

## RN-018 — Hardware no condiciona la asistencia

| Campo | Valor |
|---|---|
| **Clasificación real** | **Restricción técnica / alcance** |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión de MVP |
| **RF relacionados** | `RF-047`, `RF-048`, `RF-049` |

### Restricción

El módulo de asistencia deberá funcionar sin un lector biométrico físico.

### Implicación

El biométrico será una futura forma de captura/identificación y no la única forma posible de registrar asistencia.

### Compatibilidad

Se conserva el ID `RN-018` por trazabilidad documental.

---

# 12. Reglas de usuarios, roles y permisos

## RN-019 — Un usuario puede poseer múltiples roles

| Campo | Valor |
|---|---|
| **Categoría** | Usuarios y autorización |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita de matriz de permisos |
| **RF relacionados** | `RF-003`, `RF-004`, `RF-005` |

### Regla

Una cuenta de usuario podrá tener uno o más roles asignados simultáneamente.

### Ejemplo

```text
Usuario A
├── MESERO
└── ENCARGADO
```

es una configuración válida.

---

## RN-020 — Los permisos efectivos se acumulan entre roles

| Campo | Valor |
|---|---|
| **Categoría** | Usuarios y autorización |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita de matriz de permisos |
| **RF relacionados** | `RF-004`, `RF-005` |

### Regla

Cuando un usuario posea varios roles, sus permisos efectivos serán la combinación de las capacidades autorizadas para dichos roles.

### Ejemplo

```text
MESERO
+
ENCARGADO
=
capacidades de MESERO
+
capacidades de ENCARGADO
```

### Condición

Tener un rol adicional no elimina los permisos legítimos de los otros roles asignados.

---

## RN-021 — Solo ADMINISTRADOR gestiona usuarios y roles

| Campo | Valor |
|---|---|
| **Categoría** | Usuarios y autorización |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita |
| **RF relacionados** | `RF-003`, `RF-004` |

### Regla

Solo un usuario con rol:

```text
ADMINISTRADOR
```

podrá:

- crear cuentas;
- actualizar cuentas;
- activar/desactivar cuentas;
- asignar roles;
- modificar roles asignados.

### Implicación

`ENCARGADO` no obtiene esta facultad únicamente por su rol.

---

# 13. Reglas de gastos

## RN-022 — Solo ADMINISTRADOR y ENCARGADO registran gastos

| Campo | Valor |
|---|---|
| **Categoría** | Gastos / autorización |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita |
| **RF relacionados** | `RF-045`, `RF-046` |

### Regla

El registro de gastos diarios/caja chica estará autorizado únicamente para:

```text
ADMINISTRADOR
ENCARGADO
```

### Implicación de múltiples roles

Un usuario `MESERO + ENCARGADO` podrá registrar gastos por poseer el rol `ENCARGADO`.

Un usuario únicamente `MESERO` no podrá hacerlo.

---

# 14. Reglas de cierre de caja

## RN-023 — Solo ADMINISTRADOR y ENCARGADO realizan cierres

| Campo | Valor |
|---|---|
| **Categoría** | Caja/turnos / autorización |
| **Estado** | **Confirmada** |
| **Fuente** | Matriz de permisos + ENT-02 |
| **RF relacionados** | `RF-055` |

### Regla

El cierre podrá ser registrado por usuarios que posean `ADMINISTRADOR` o `ENCARGADO`.

### Condiciones

- operativamente el `ENCARGADO` realiza el cierre en Fratelli;
- `ADMINISTRADOR` conserva permiso general según la matriz aprobada;
- `CONTADORA` revisa posteriormente, pero su aprobación no es obligatoria;
- una persona con múltiples roles obtiene la unión de permisos.

---

## RN-024 — MESERO puede cerrar solo si también posee ENCARGADO

| Campo | Valor |
|---|---|
| **Categoría** | Caja / autorización |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita |
| **RF relacionados** | `RF-004`, `RF-005`, `RF-055` |

### Regla

El rol `MESERO` por sí solo no permite cerrar caja.

### Caso válido

```text
Usuario:
MESERO + ENCARGADO
        ↓
Puede cerrar
```

### Caso inválido

```text
Usuario:
MESERO
        ↓
No puede cerrar
```

---

# 15. Reglas de reportes

## RN-025 — MESERO consulta solo ventas de su turno

| Campo | Valor |
|---|---|
| **Categoría** | Reportes / autorización |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita |
| **RF relacionados** | `RF-037`, `RF-057` |

### Regla

Un usuario que opere únicamente con rol `MESERO` podrá consultar ventas correspondientes a su turno.

### No podrá consultar por ese rol

- ventas de otros turnos;
- reporte general de ventas del negocio.

### Excepción por múltiples roles

Si también posee un rol con mayor alcance de consulta, se aplicará `RN-020`.

---

## RN-026 — COCINA puede consultar inventario y stock bajo

| Campo | Valor |
|---|---|
| **Categoría** | Inventario / autorización |
| **Estado** | **Confirmada** |
| **Fuente** | Decisión explícita |
| **RF relacionados** | `RF-012`, `RF-015`, `RF-017`, `RF-058` |

### Regla

El rol `COCINA` tendrá acceso de consulta a:

- inventario;
- existencias;
- stock bajo.

### Limitación

La consulta no implica permiso general para modificar existencias.

---

# 16. Reglas de compras por cocina

## RN-027 — COCINA gestiona compras de ingredientes de cocina

| Campo | Valor |
|---|---|
| **Categoría** | Compras / autorización |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-040`, `RF-041`, `RF-042`, `RF-044` |

### Regla

`COCINA` podrá registrar y gestionar directamente compras de **ingredientes destinados a preparaciones** dentro de su ámbito operativo.

### Condiciones

- `COCINA` gestiona compras de ingredientes destinados a preparaciones dentro de su ámbito operativo;
- `ENCARGADO` gestiona principalmente bebidas, productos de limpieza y otros insumos generales;
- `ADMINISTRADOR` conserva gestión general;
- el alcance se determina por el tipo real de insumo y no por categorías artificiales no utilizadas por Fratelli.

---

# 17. Reglas confirmadas por la entrevista de refinamiento

Las siguientes reglas se incorporan a partir de ENT-02. Continúan la numeración sin alterar los IDs existentes.

## RN-028 — Las composiciones conservan unidades y permiten conversiones compatibles

| Campo | Valor |
|---|---|
| **Categoría** | Producción / Inventario |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-010`, `RF-022` |

### Regla

Una composición deberá indicar cantidad y unidad. Cuando un ingrediente se adquiera/mantenga en una unidad y se consuma en otra compatible, el sistema aplicará la conversión definida. La evidencia confirma `kg ↔ g` para carne; los líquidos se manejan en litros en el flujo observado.

---

## RN-029 — Producción registra cantidad final obtenida

| Campo | Valor |
|---|---|
| **Categoría** | Producción |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-021` |

### Regla

Para el MVP se registra la **cantidad final producida**; no se exige una cantidad esperada ni cálculo formal de rendimiento.

---

## RN-030 — Producciones repetidas acumulan disponibilidad

| Campo | Valor |
|---|---|
| **Categoría** | Producción / Inventario |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-023`, `RF-024` |

### Regla

Cuando la misma preparación se produzca varias veces, Fratelli necesita conocer la cantidad total disponible. Cada evento conserva fecha, cantidad y responsable, pero el MVP no requiere seleccionar lotes independientes durante la venta.

---

## RN-031 — Bajas y pérdidas relevantes se registran por separado y con motivo

| Campo | Valor |
|---|---|
| **Categoría** | Inventario |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-014`, `RF-018`, `RF-019` |

### Regla

Una pérdida, merma o plato dado de baja que deba afectar inventario se registra como una salida separada y conserva un motivo.

---

## RN-032 — Las compras directas de Cocina conservan recibo como respaldo

| Campo | Valor |
|---|---|
| **Categoría** | Compras / trazabilidad documental |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-040` |

### Regla

Cuando `COCINA` realice directamente una compra dentro de su ámbito, la operación deberá quedar **respaldada por un recibo**, tal como fue descrito en ENT-02.

### Alcance

Esta regla no define todavía que el recibo deba cargarse como archivo, imagen o documento digital. El mecanismo concreto para relacionar ese respaldo con la compra se decidirá durante diseño y no constituye un bloqueo informativo de la historia.

---

## RN-033 — Una compra se recibe después de verificar el producto

| Campo | Valor |
|---|---|
| **Categoría** | Compras / Inventario |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-042`, `RF-043` |

### Regla

Una compra no deberá producir una entrada definitiva hasta verificar/aceptar lo recibido. En insumos de cocina puede ser necesario pesar o porcionar antes de registrar la entrada.

---

## RN-034 — Una compra incompleta o no aceptada no se marca recibida

| Campo | Valor |
|---|---|
| **Categoría** | Compras |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-041`, `RF-042`, `RF-043` |

### Regla

Si una compra llega incompleta o no puede aceptarse, se coordina con el proveedor y se devuelve. No se marcará `RECIBIDA` mientras el flujo básico no esté aceptado. La recepción parcial estructurada no es requisito del MVP.

---

## RN-035 — Dos turnos comparten una caja y existe un único cierre

| Campo | Valor |
|---|---|
| **Categoría** | Caja/turnos |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-01 + ENT-02 |
| **RF relacionados** | `RF-052`–`RF-056` |

### Regla

Fratelli opera con dos turnos que utilizan la misma caja. El primer turno realiza traspaso de información y el cierre se registra una sola vez al final.

---

## RN-036 — La continuidad de caja conserva monto inicial y traspaso

| Campo | Valor |
|---|---|
| **Categoría** | Caja/turnos |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-052`, `RF-053`, `RF-054` |

### Regla

El Encargado deja un monto/fondo para el inicio siguiente y el turno saliente deja información suficiente para que el turno entrante verifique el estado de caja.

---

## RN-037 — PedidosYa se controla separado de efectivo y QR

| Campo | Valor |
|---|---|
| **Categoría** | Caja/turnos |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-054`, `RF-055`, `RF-056` |

### Regla

PedidosYa se representa de forma separada en el cierre porque el dinero no ingresa igual que una venta pagada directamente en caja. Esta regla no implica integración técnica con PedidosYa.

---

## RN-038 — Diferencias de caja conservan observación

| Campo | Valor |
|---|---|
| **Categoría** | Caja/turnos / Trazabilidad |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-054`, `RF-055`, `RF-056` |

### Regla

Cuando exista faltante o sobrante frente a lo esperado, se deberá poder conservar la diferencia y una observación/trazabilidad para su revisión.

---

## RN-039 — El Encargado cierra y la Contadora revisa sin aprobación obligatoria

| Campo | Valor |
|---|---|
| **Categoría** | Caja/turnos / autorización |
| **Estado** | **Confirmada** |
| **Fuente** | ENT-02 |
| **RF relacionados** | `RF-055`, `RF-056` |

### Regla

El Encargado realiza el cierre. La Contadora revisa posteriormente la información, pero no debe aprobarla para que el cierre quede registrado.

---

# 18. Aspectos pendientes que no bloquean el MVP

La segunda entrevista resolvió los vacíos que mantenían bloqueadas las seis historias de refinamiento. Permanecen como evolución o Post-MVP:

- nuevas conversiones de unidades si aparecen ingredientes no cubiertos;
- vencimientos/lotes físicos si el negocio decide necesitarlos posteriormente;
- recepción parcial estructurada;
- cuentas por pagar, crédito de proveedor, cuotas y pagos parciales;
- integración directa con PedidosYa;
- conciliación contable/bancaria avanzada;
- hardware biométrico e impresión;
- facturación fiscal.

Ninguno de estos puntos justifica mantener `HU-004`, `HU-007`, `HU-017`, `HU-025`, `HU-026` o `HU-027` en `Blocked`.

---

# 19. Elementos que NO se consideran reglas de negocio

Para evitar mezclar conceptos, los siguientes elementos no se documentan como reglas de negocio puras:

## 19.1. Arquitectura

Ejemplos:

- usar una API REST;
- utilizar ASP.NET;
- utilizar PostgreSQL;
- utilizar React;
- modular monolith.

Son decisiones de arquitectura y deberán documentarse posteriormente.

---

## 19.2. Requisitos no funcionales

Ejemplos:

- HTTPS;
- hash de contraseñas;
- responsive desde 360 px;
- compatibilidad con navegadores;
- manejo de errores;
- atomicidad.

Pertenecen a:

```text
requirements/requisitos-no-funcionales.md
```

---

## 19.3. Restricciones de alcance

Ejemplos:

```text
RN-014 crédito fuera del MVP
RN-015 facturación fiscal fuera del MVP
RN-018 biométrico no obligatorio
```

Se conservan por trazabilidad, pero están etiquetadas correctamente como restricciones.

---

# 20. Matriz regla → requisitos funcionales

| Regla | RF relacionados principales |
|---|---|
| `RN-001` | `RF-025`, `RF-026`, `RF-027` |
| `RN-002` | `RF-028`, `RF-029`, `RF-030` |
| `RN-003` | `RF-027`, `RF-029` |
| `RN-004` | `RF-031`, `RF-035`, `RF-036` |
| `RN-005` | `RF-015`, `RF-017`, `RF-020`, `RF-035`, `RF-036` |
| `RN-006` | `RF-010`, `RF-021`, `RF-022` |
| `RN-007` | `RF-021`, `RF-023`, `RF-024` |
| `RN-008` | `RF-022`, `RF-023`, `RF-036` |
| `RN-009` | `RF-040`, `RF-041`, `RF-042`, `RF-043` |
| `RN-010` | `RF-040`, `RF-041`, `RF-043` |
| `RN-011` | `RF-047`, `RF-049` |
| `RN-012` | `RF-048`, `RF-049` |
| `RN-013` | `RF-031`, `RF-034`, `RF-038` |
| `RN-014` | `RF-034`, `RF-038` |
| `RN-015` | `RF-035` |
| `RN-016` | `RF-052`, `RF-054`, `RF-055` |
| `RN-017` | `RF-006` y operaciones trazables |
| `RN-018` | `RF-047`, `RF-048`, `RF-049` |
| `RN-019` | `RF-003`, `RF-004`, `RF-005` |
| `RN-020` | `RF-004`, `RF-005` |
| `RN-021` | `RF-003`, `RF-004` |
| `RN-022` | `RF-045`, `RF-046` |
| `RN-023` | `RF-055` |
| `RN-024` | `RF-004`, `RF-005`, `RF-055` |
| `RN-025` | `RF-037`, `RF-057` |
| `RN-026` | `RF-012`, `RF-015`, `RF-017`, `RF-058` |
| `RN-027` | `RF-039`, `RF-040`, `RF-041`, `RF-042`, `RF-044` |
| `RN-028` | `RF-010`, `RF-022` |
| `RN-029` | `RF-021` |
| `RN-030` | `RF-023`, `RF-024` |
| `RN-031` | `RF-014`, `RF-018`, `RF-019` |
| `RN-032` | `RF-040` |
| `RN-033` | `RF-042`, `RF-043` |
| `RN-034` | `RF-041`, `RF-042`, `RF-043` |
| `RN-035` | `RF-052`–`RF-056` |
| `RN-036` | `RF-052`, `RF-053`, `RF-054` |
| `RN-037` | `RF-054`, `RF-055`, `RF-056` |
| `RN-038` | `RF-054`, `RF-055`, `RF-056` |
| `RN-039` | `RF-055`, `RF-056` |

---

# 21. Matriz regla → necesidad

| Regla | Necesidad relacionada |
|---|---|
| `RN-001`–`RN-003` | `N-011` |
| `RN-004` | `N-011` |
| `RN-005` | `N-004`, `N-005` |
| `RN-006`–`RN-008` | `N-003`, `N-004` |
| `RN-009`–`RN-010` | `N-006`, `N-008` |
| `RN-011`–`RN-012` | `N-001`, `N-002` |
| `RN-013` | `N-011` |
| `RN-014` | Alcance futuro de `N-011` |
| `RN-015` | Restricción de alcance |
| `RN-016` | `N-009`, `N-011`, `N-013` |
| `RN-017` | `N-014` |
| `RN-018` | `N-001`, `N-012` |
| `RN-019`–`RN-021` | `N-013` |
| `RN-022` | `N-009`, `N-013` |
| `RN-023`–`RN-024` | `N-009`, `N-013` |
| `RN-025` | `N-010`, `N-013` |
| `RN-026` | `N-004`, `N-005`, `N-013` |
| `RN-027` | `N-006`, `N-007`, `N-013` |
| `RN-028`–`RN-031` | `N-003`, `N-004` |
| `RN-032`–`RN-034` | `N-006`, `N-007`, `N-008` |
| `RN-035`–`RN-039` | `N-009`, `N-011`, `N-013`, `N-014` |

---

# 22. Relación con diagramas existentes

Este documento no introduce un nuevo diagrama.

Las reglas:

```text
RN-001
RN-002
RN-003
```

se encuentran representadas visualmente en:

```text
docs/puml/estados-pedido-comanda.puml
docs/images/estados-pedido-comanda.png
```

Cualquier modificación futura en los estados deberá actualizar:

1. esta especificación;
2. los RF relacionados;
3. el diagrama de estados.

---

# 23. Control de consistencia

Antes de considerar esta baseline estable se verificó que:

- los IDs `RN-001` a `RN-018` se conservan;
- `RN-014`, `RN-015` y `RN-018` no se presentan incorrectamente como reglas puras;
- las reglas posteriores continúan la numeración sin reutilizar IDs y alcanzan `RN-039`;
- no se inventan reglas contables;
- las bajas/pérdidas confirmadas se registran separadamente con motivo;
- no se incorpora gestión de lotes múltiples sin una necesidad validada;
- el ámbito básico de compras de Cocina y Encargado proviene de ENT-02;
- las reglas de dos turnos, caja compartida, cierre único, diferencias y PedidosYa provienen de ENT-02;
- cada regla confirmada se relaciona con al menos un RF;
- las restricciones de alcance se distinguen de las reglas del dominio;
- los requisitos no funcionales permanecen separados.

---

# 24. Estado de salida

Con este documento queda consolidado el bloque:

```text
requirements/
├── requisitos-funcionales.md
├── requisitos-no-funcionales.md
└── reglas-negocio.md
```

A partir de este punto ya existe una baseline suficientemente estructurada para avanzar hacia:

```text
07-product-backlog.md
```

Antes de ingresar funcionalidades a desarrollo deberá aplicarse la Definition of Ready. Las reglas básicas de las historias anteriormente bloqueadas ya se encuentran confirmadas; los puntos Post-MVP no se utilizarán como bloqueos del MVP.

---

# 25. Próximo documento

El siguiente artefacto será:

```text
docs/07-product-backlog.md
```

Allí se realizará la transformación:

```text
Necesidades
    ↓
RF / RN
    ↓
Épicas
    ↓
Historias de usuario
    ↓
Prioridad
    ↓
Product Backlog
```

---

# 26. Control de cambios

| Versión | Fecha | Descripción | Estado |
|---|---|---|---|
| `0.1` | 20/08/2026 | Consolidación de reglas `RN-001` a `RN-027`; reclasificación de `RN-014`, `RN-015` y `RN-018` por compatibilidad documental | Lista para Product Backlog |
| `0.2` | 21/08/2026 | ENT-02 confirma `RN-028`–`RN-039`, refina producción/compras/caja y elimina bloqueos informativos del MVP | Revalidada |
