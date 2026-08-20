# Requisitos Funcionales — Restaurant System

## 1. Propósito

Este documento contiene la especificación detallada de los requisitos funcionales de **Restaurant System** para el restaurante **Fratelli**.

La baseline funcional proviene de:

```text
03-hallazgos-y-necesidades.md
        ↓
04-objetivos-y-propuesta-valor.md
        ↓
05-alcance-y-mvp.md
        ↓
06-srs.md
        ↓
requirements/requisitos-funcionales.md
```

Cada requisito utiliza un identificador único `RF-XXX` y debe mantener trazabilidad con las necesidades consolidadas, el alcance del MVP y las reglas de negocio aplicables.

---

## 2. Convenciones

### 2.1. Estados de requisito

| Estado | Significado |
|---|---|
| **Definido** | El comportamiento principal está suficientemente especificado |
| **Definido con reglas pendientes** | El comportamiento principal está definido, pero depende de una regla del dominio todavía no aclarada |

### 2.2. Prioridad

La prioridad utilizada en este documento es una **prioridad inicial de producto/implementación**, no una métrica histórica.

| Prioridad | Significado |
|---|---|
| **CRÍTICA** | Necesaria para el núcleo operacional o para que otros módulos funcionen |
| **ALTA** | Incluida en el MVP y directamente relacionada con una necesidad prioritaria |
| **MEDIA** | Incluida en el MVP como soporte, consulta o trazabilidad |

### 2.3. Modelo de autorización

Un usuario podrá poseer **uno o más roles simultáneamente**.

Los roles iniciales son:

```text
ADMINISTRADOR
ENCARGADO
MESERO
COCINA
CONTADORA
EMPLEADO
```

Los permisos efectivos de un usuario serán los correspondientes a los roles que tenga asignados.

Ejemplo:

```text
Usuario
├── MESERO
└── ENCARGADO
```

podrá realizar las operaciones permitidas para ambos roles, incluyendo un cierre de caja porque posee `ENCARGADO`.

La gestión de cuentas y asignación de roles será exclusiva de `ADMINISTRADOR`.

---

## 3. Matriz funcional inicial por rol

| Área | ADMINISTRADOR | ENCARGADO | MESERO | COCINA | CONTADORA | EMPLEADO |
|---|---|---|---|---|---|---|
| Usuarios y roles | Gestionar | — | — | — | — | — |
| Productos/ingredientes/platos | Gestionar | Gestionar | Consultar | Consultar | Consultar | — |
| Inventario | Gestionar | Gestionar | Consultar | Consultar | Consultar | — |
| Stock mínimo/alertas | Gestionar | Gestionar | Consultar | Consultar | Consultar | — |
| Producción/lotes | Gestionar/consultar | Gestionar/consultar | — | Registrar/gestionar | Consultar | — |
| Pedidos | Gestionar | Gestionar | Registrar/gestionar | Consultar | — | — |
| Comandas | Consultar/gestionar | Consultar/gestionar | Consultar | Gestionar estados | — | — |
| Ventas | Gestionar | Gestionar | Registrar/confirmar | — | Consultar | — |
| Clientes | Gestionar | Gestionar | Registrar/consultar | — | Consultar | — |
| Proveedores | Gestionar | Gestionar | — | Consultar | Consultar | — |
| Compras | Gestionar | Gestionar | — | Gestionar compras autorizadas de cocina | Consultar | — |
| Gastos/caja chica | Gestionar | Gestionar | — | — | Consultar | — |
| Asistencia propia | Sí | Sí | Sí | Sí | Sí | Sí |
| Asistencia general | Consultar | Consultar | — | — | Consultar | — |
| Turnos | Gestionar | Gestionar | Operar su turno | — | Consultar | — |
| Cierre de caja | Gestionar | Gestionar | Solo si también posee ENCARGADO | — | Consultar | — |
| Reporte de ventas | Sí | Sí | Solo su turno | — | Sí | — |
| Reporte de inventario | Sí | Sí | — | Sí, consulta | Sí | — |
| Reporte de asistencia | Sí | Sí | Solo propia | Solo propia | General y propia | Solo propia |

---

# 4. Requisitos funcionales detallados

## RF-001 — Autenticar usuario

| Campo | Valor |
|---|---|
| **Actor(es)** | Todos los usuarios con cuenta |
| **Fuente** | N-013 / SRS §10.1 |
| **Necesidad relacionada** | N-013 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir que un usuario con una cuenta activa se autentique para acceder a las capacidades autorizadas.

### Precondiciones

- El usuario posee una cuenta registrada y activa.

### Entradas

- Identificador de acceso definido para la cuenta.
- Credencial de autenticación.

### Procesamiento y reglas

- El sistema validará la identidad del usuario.
- Si la autenticación es correcta, cargará sus roles y permisos efectivos.
- No deberá exponer información sensible de autenticación.

### Resultado esperado

El usuario queda autenticado y puede acceder únicamente a las capacidades autorizadas por sus roles.

### Excepciones

- Credenciales inválidas.
- Cuenta inexistente o inactiva.
- Error técnico durante la autenticación.

### Criterios de aceptación

- Con credenciales válidas, el usuario ingresa al sistema.
- Con credenciales inválidas, el acceso es rechazado sin revelar información sensible.
- Los permisos efectivos corresponden a todos los roles asignados al usuario.

---

## RF-002 — Cerrar sesión

| Campo | Valor |
|---|---|
| **Actor(es)** | Todos los usuarios autenticados |
| **Fuente** | SRS §10.1 |
| **Necesidad relacionada** | N-013 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir que un usuario autenticado cierre su sesión.

### Precondiciones

- Existe una sesión autenticada activa.

### Entradas

- Solicitud de cierre de sesión.

### Procesamiento y reglas

- El sistema invalidará o finalizará la sesión activa según el mecanismo de autenticación definido.

### Resultado esperado

La sesión finaliza y el usuario deja de tener acceso autenticado.

### Excepciones

- La sesión ya expiró o no es válida.

### Criterios de aceptación

- Al cerrar sesión, el usuario deja de acceder a funciones protegidas.
- Una sesión cerrada no permite continuar operando como usuario autenticado.

---

## RF-003 — Gestionar cuentas de usuario

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR |
| **Fuente** | SRS §7.1 / matriz de permisos |
| **Necesidad relacionada** | N-013 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir al `ADMINISTRADOR` crear, consultar, actualizar y cambiar el estado de las cuentas de usuario necesarias para operar Restaurant System.

### Precondiciones

- El actor está autenticado.
- El actor posee el rol `ADMINISTRADOR`.

### Entradas

- Datos identificativos requeridos para la cuenta.
- Estado de la cuenta.
- Información necesaria para autenticación.

### Procesamiento y reglas

- Solo `ADMINISTRADOR` podrá gestionar cuentas.
- La desactivación de una cuenta deberá impedir autenticaciones posteriores sin eliminar la trazabilidad histórica asociada al usuario.

### Resultado esperado

La cuenta queda creada o actualizada y su estado puede utilizarse para controlar el acceso.

### Excepciones

- Datos obligatorios faltantes.
- Intento de usar un identificador que deba ser único y ya exista.
- Actor sin permiso.

### Criterios de aceptación

- Un administrador puede crear una cuenta válida.
- Un usuario no administrador no puede administrar cuentas.
- Una cuenta inactiva no puede autenticarse.
- Desactivar una cuenta no elimina las operaciones históricas realizadas por ella.

---

## RF-004 — Asignar roles a usuarios

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR |
| **Fuente** | Decisión de baseline de permisos |
| **Necesidad relacionada** | N-013 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir asignar uno o más roles a una misma cuenta de usuario.

### Precondiciones

- La cuenta existe.
- El actor está autenticado como `ADMINISTRADOR`.

### Entradas

- Usuario objetivo.
- Uno o más roles válidos.

### Procesamiento y reglas

- Los roles válidos iniciales serán `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA` y `EMPLEADO`.
- Un usuario podrá poseer múltiples roles simultáneamente.
- Los permisos efectivos serán la unión de las capacidades concedidas por sus roles.

### Resultado esperado

El usuario queda asociado a los roles seleccionados y obtiene sus permisos efectivos.

### Excepciones

- Rol inexistente.
- Usuario inexistente.
- Actor sin permiso.

### Criterios de aceptación

- Se pueden asignar dos o más roles al mismo usuario.
- Un usuario `MESERO` + `ENCARGADO` obtiene capacidades de ambos roles.
- Solo un `ADMINISTRADOR` puede modificar asignaciones de roles.

---

## RF-005 — Aplicar permisos por rol

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema / Todos los usuarios |
| **Fuente** | SRS §7 y matriz de permisos |
| **Necesidad relacionada** | N-010, N-013 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá autorizar o rechazar cada operación protegida según los roles efectivos del usuario autenticado.

### Precondiciones

- El usuario está autenticado.

### Entradas

- Usuario autenticado.
- Operación solicitada.
- Roles asignados.

### Procesamiento y reglas

- Una operación será permitida si al menos uno de los roles efectivos del usuario la autoriza.
- Las capacidades exclusivas de `ADMINISTRADOR` no serán concedidas por otros roles.
- Los permisos deberán aplicarse en el backend o capa de negocio, no únicamente ocultando controles de interfaz.

### Resultado esperado

La operación se ejecuta solo cuando el usuario posee autorización.

### Excepciones

- Usuario no autenticado.
- Usuario autenticado sin permiso suficiente.

### Criterios de aceptación

- Una acción autorizada se ejecuta.
- Una acción no autorizada es rechazada aunque se intente invocar directamente.
- La combinación de múltiples roles concede las capacidades de todos ellos.

---

## RF-006 — Registrar responsable de operaciones relevantes

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema |
| **Fuente** | H-015 / N-014 |
| **Necesidad relacionada** | N-014 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá conservar el usuario responsable de las operaciones que requieran trazabilidad.

### Precondiciones

- Existe una sesión autenticada válida.
- La operación está definida como trazable.

### Entradas

- Usuario autenticado.
- Operación ejecutada.

### Procesamiento y reglas

- El responsable se obtendrá de la identidad autenticada, no de un valor libre suministrado por el cliente.
- La referencia histórica al responsable deberá conservarse.

### Resultado esperado

La operación puede consultarse posteriormente junto con su responsable.

### Excepciones

- Operación ejecutada por un proceso del sistema sin usuario; deberá distinguirse como tal cuando aplique.

### Criterios de aceptación

- Una venta confirmada conserva al usuario responsable.
- Una compra conserva al responsable correspondiente.
- Un gasto conserva al usuario que lo registró.
- Un cierre conserva al usuario autorizado que lo realizó.

---

## RF-007 — Gestionar productos

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO |
| **Fuente** | N-011 / baseline funcional |
| **Necesidad relacionada** | N-004, N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar, consultar, actualizar y cambiar el estado de los productos administrados por Fratelli.

### Precondiciones

- Actor autenticado con permiso de gestión.

### Entradas

- Datos básicos del producto.
- Estado activo/inactivo.
- Información de inventario aplicable.

### Procesamiento y reglas

- Los productos inactivos deberán conservarse para trazabilidad histórica.
- Las referencias existentes no deberán perderse al desactivar un producto.

### Resultado esperado

El catálogo de productos queda actualizado.

### Excepciones

- Datos obligatorios faltantes.
- Actor sin permiso.

### Criterios de aceptación

- ADMINISTRADOR y ENCARGADO pueden crear y actualizar productos.
- MESERO, COCINA y CONTADORA pueden consultar según la matriz, pero no modificarlos.
- Desactivar un producto no elimina movimientos históricos.

---

## RF-008 — Gestionar ingredientes

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO |
| **Fuente** | N-003 / N-004 |
| **Necesidad relacionada** | N-003, N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar, consultar, actualizar y desactivar ingredientes utilizados en producción.

### Precondiciones

- Actor autenticado con permiso de gestión.

### Entradas

- Datos del ingrediente.
- Unidad definida para el ingrediente.
- Estado.

### Procesamiento y reglas

- Los ingredientes deberán poder relacionarse con composiciones y movimientos de inventario.
- Las reglas detalladas de unidades/conversiones se mantienen pendientes cuando sean necesarias.

### Resultado esperado

El ingrediente queda disponible para inventario y composición.

### Excepciones

- Datos inválidos.
- Unidad no definida cuando sea obligatoria.
- Actor sin permiso.

### Criterios de aceptación

- Se puede crear un ingrediente.
- Un ingrediente activo puede incluirse en una composición.
- Un ingrediente desactivado conserva su historial.

---

## RF-009 — Gestionar platos

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO |
| **Fuente** | N-011 / decisión de producción por lotes |
| **Necesidad relacionada** | N-003, N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar, consultar, actualizar y desactivar los platos ofrecidos por Fratelli.

### Precondiciones

- Actor autenticado con permiso de gestión.

### Entradas

- Nombre/datos del plato.
- Precio cuando corresponda.
- Estado.
- Información de composición cuando aplique.

### Procesamiento y reglas

- Los platos se mantendrán conceptualmente separados del inventario de ingredientes.
- Un plato podrá vincularse a una composición y a lotes de producción.

### Resultado esperado

El plato queda disponible para los flujos autorizados de pedido, producción y venta.

### Excepciones

- Datos obligatorios faltantes.
- Actor sin permiso.

### Criterios de aceptación

- ADMINISTRADOR y ENCARGADO gestionan platos.
- MESERO y COCINA pueden consultar platos activos.
- La desactivación preserva referencias históricas.

---

## RF-010 — Definir composición de platos o preparaciones

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO |
| **Fuente** | SRS §11 |
| **Necesidad relacionada** | N-003, N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá permitir definir qué ingredientes y cantidades componen un plato o preparación para poder calcular el consumo de ingredientes durante la producción.

### Precondiciones

- Existen el plato/preparación y los ingredientes involucrados.
- Actor autorizado.

### Entradas

- Plato o preparación.
- Ingrediente.
- Cantidad requerida.
- Unidad aplicable.

### Procesamiento y reglas

- Una composición deberá contener al menos un ingrediente cuando se utilice para consumo automático.
- Las unidades y conversiones deberán ser compatibles según reglas que todavía requieren refinamiento.

### Resultado esperado

La composición queda disponible para el cálculo de consumo durante producción.

### Excepciones

- Ingrediente inexistente o inactivo.
- Cantidad inválida.
- Incompatibilidad de unidades pendiente de reglas.

### Criterios de aceptación

- Se puede asociar más de un ingrediente a una preparación.
- La composición puede consultarse antes de confirmar producción.
- No se confirma una composición inválida.

---

## RF-011 — Gestionar precios

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO |
| **Fuente** | SRS §10.2 |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir establecer y actualizar el precio de venta de los elementos comercializables incluidos en el catálogo.

### Precondiciones

- Actor autorizado.
- Elemento comercializable existente.

### Entradas

- Elemento.
- Precio.

### Procesamiento y reglas

- El precio deberá ser válido y no negativo.
- Los cambios de precio no deberán modificar el valor histórico registrado en ventas ya confirmadas.

### Resultado esperado

El precio vigente queda disponible para nuevas operaciones.

### Excepciones

- Precio inválido.
- Actor sin permiso.

### Criterios de aceptación

- Se puede actualizar un precio vigente.
- Una venta histórica conserva el precio registrado al momento de confirmarse.
- Un usuario sin permiso no modifica precios.

---

## RF-012 — Consultar catálogo

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, MESERO, COCINA, CONTADORA |
| **Fuente** | Matriz de permisos |
| **Necesidad relacionada** | N-011, N-013 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir a los roles autorizados consultar los productos, ingredientes y platos necesarios para su trabajo.

### Precondiciones

- Usuario autenticado con rol autorizado.

### Entradas

- Filtros o criterios de búsqueda cuando existan.

### Procesamiento y reglas

- La consulta deberá respetar los permisos y el estado de los elementos.
- Los elementos inactivos podrán restringirse de las operaciones normales, aunque sigan disponibles para consultas administrativas cuando corresponda.

### Resultado esperado

El usuario obtiene la información de catálogo autorizada.

### Excepciones

- Sin resultados.
- Actor sin permiso.

### Criterios de aceptación

- MESERO puede consultar platos/productos necesarios para pedidos.
- COCINA puede consultar ingredientes y platos.
- CONTADORA puede consultar información permitida sin modificarla.

---

## RF-013 — Registrar entrada de inventario

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO; sistema mediante procesos autorizados |
| **Fuente** | N-004 |
| **Necesidad relacionada** | N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar entradas de inventario justificadas por un proceso autorizado.

### Precondiciones

- Elemento inventariable existente.
- Actor o proceso autorizado.

### Entradas

- Elemento.
- Cantidad.
- Motivo/origen.
- Fecha/hora.
- Responsable cuando aplique.

### Procesamiento y reglas

- La cantidad de entrada deberá ser positiva.
- La operación generará un movimiento de inventario trazable.

### Resultado esperado

Las existencias aumentan y queda registrado el movimiento.

### Excepciones

- Elemento inexistente.
- Cantidad inválida.
- Actor sin permiso.

### Criterios de aceptación

- Una entrada válida aumenta el saldo.
- El movimiento conserva su origen y responsable.
- Una entrada inválida no modifica existencias.

---

## RF-014 — Registrar salida o baja de inventario

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO; sistema mediante procesos autorizados |
| **Fuente** | N-004 |
| **Necesidad relacionada** | N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá permitir registrar salidas o bajas de inventario cuando correspondan.

### Precondiciones

- Elemento inventariable existente.
- Actor o proceso autorizado.

### Entradas

- Elemento.
- Cantidad.
- Motivo.
- Fecha/hora.
- Responsable.

### Procesamiento y reglas

- La cantidad deberá ser positiva.
- La salida generará un movimiento trazable.
- Las categorías exactas de ajuste, merma o desperdicio quedan pendientes de refinamiento.

### Resultado esperado

Las existencias se reducen y queda registrado el movimiento.

### Excepciones

- Cantidad inválida.
- Actor sin permiso.
- Regla de motivo pendiente para determinados casos.

### Criterios de aceptación

- Una baja válida reduce existencias.
- El sistema conserva responsable y motivo.
- Las reglas aún no definidas no se inventan durante implementación.

---

## RF-015 — Consultar existencias

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, MESERO, COCINA, CONTADORA |
| **Fuente** | H-004 / H-005 |
| **Necesidad relacionada** | N-004, N-005 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir consultar el saldo registrado de los productos e ingredientes autorizados.

### Precondiciones

- Usuario autenticado con permiso de consulta.

### Entradas

- Filtros de búsqueda cuando correspondan.

### Procesamiento y reglas

- La consulta deberá reflejar el saldo persistido, incluso si es negativo.

### Resultado esperado

El usuario obtiene el inventario disponible según sus permisos.

### Excepciones

- Sin resultados.
- Actor sin permiso.

### Criterios de aceptación

- Un saldo negativo se muestra como tal.
- COCINA puede consultar existencias.
- MESERO puede consultar existencias sin modificarlas.

---

## RF-016 — Configurar stock mínimo

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO |
| **Fuente** | H-005 / N-005 |
| **Necesidad relacionada** | N-005 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir establecer un umbral de stock mínimo para los elementos inventariables que requieran control.

### Precondiciones

- Elemento existente.
- Actor autorizado.

### Entradas

- Elemento.
- Valor de stock mínimo.

### Procesamiento y reglas

- El umbral no deberá ser negativo salvo que posteriormente exista una regla explícita que lo permita.
- El valor deberá almacenarse junto con el elemento o configuración correspondiente.

### Resultado esperado

El umbral queda disponible para evaluar stock bajo.

### Excepciones

- Valor inválido.
- Actor sin permiso.

### Criterios de aceptación

- ADMINISTRADOR y ENCARGADO pueden establecer el umbral.
- Un usuario de solo consulta no puede modificarlo.
- El nuevo valor se utiliza en las evaluaciones posteriores de stock bajo.

---

## RF-017 — Detectar y mostrar stock bajo

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, MESERO, COCINA, CONTADORA |
| **Fuente** | H-005 / PS-002 |
| **Necesidad relacionada** | N-005 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá identificar y mostrar los elementos cuya existencia sea igual o inferior al stock mínimo configurado.

### Precondiciones

- Elemento con stock mínimo configurado.

### Entradas

- Existencia actual.
- Stock mínimo.

### Procesamiento y reglas

- La condición será `existencia <= stock mínimo`.
- La alerta del MVP será interna a la aplicación.
- COCINA deberá poder consultar esta información.

### Resultado esperado

Los elementos que requieren atención son visibles para los roles autorizados.

### Excepciones

- Elemento sin stock mínimo configurado.
- Actor sin permiso.

### Criterios de aceptación

- Si la existencia alcanza el umbral, aparece como stock bajo.
- Si el saldo es negativo, continúa apareciendo como condición de atención.
- COCINA puede consultar las alertas.

---

## RF-018 — Registrar movimientos de inventario

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema / actores autorizados |
| **Fuente** | N-004 / N-014 |
| **Necesidad relacionada** | N-004, N-014 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá crear un registro de movimiento por cada operación confirmada que altere existencias.

### Precondiciones

- Ocurre una operación que modifica inventario.

### Entradas

- Elemento.
- Tipo de movimiento.
- Cantidad.
- Origen.
- Fecha/hora.
- Responsable cuando aplique.

### Procesamiento y reglas

- El movimiento deberá indicar si aumenta o disminuye existencias.
- La operación origen deberá poder identificarse cuando corresponda.

### Resultado esperado

Existe evidencia persistente del cambio de inventario.

### Excepciones

- Falla durante la operación relacionada; el sistema deberá preservar consistencia.

### Criterios de aceptación

- Una compra recibida genera movimiento de entrada.
- Una producción confirmada genera los movimientos de consumo correspondientes.
- Una venta confirmada genera el movimiento aplicable al elemento vendible.
- El movimiento registra el responsable o proceso origen.

---

## RF-019 — Consultar historial de movimientos

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO; consulta según permisos |
| **Fuente** | N-004 / N-014 |
| **Necesidad relacionada** | N-004, N-014 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir consultar el historial de movimientos de inventario.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Elemento o filtros disponibles.
- Periodo cuando corresponda.

### Procesamiento y reglas

- La consulta deberá presentar información suficiente para conocer tipo, cantidad, fecha, origen y responsable cuando exista.

### Resultado esperado

El usuario autorizado puede reconstruir los cambios registrados sobre una existencia.

### Excepciones

- Sin movimientos.
- Actor sin permiso.

### Criterios de aceptación

- Se pueden consultar movimientos de un elemento.
- Los movimientos no se pierden cuando un producto se desactiva.
- La información permite distinguir entradas y salidas.

---

## RF-020 — Advertir stock insuficiente sin bloquear la venta

| Campo | Valor |
|---|---|
| **Actor(es)** | MESERO, ENCARGADO, ADMINISTRADOR |
| **Fuente** | Decisión confirmada de MVP |
| **Necesidad relacionada** | N-004, N-005 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá advertir cuando una venta vaya a provocar o incrementar un saldo negativo, permitiendo al usuario autorizado continuar.

### Precondiciones

- Existe una venta pendiente de confirmación.
- La operación requiere una cantidad superior a la existencia lógica disponible.

### Entradas

- Venta a confirmar.
- Existencias actuales.

### Procesamiento y reglas

- La advertencia no será un bloqueo.
- Si el usuario continúa y la venta se confirma, el saldo podrá quedar negativo.
- El saldo negativo deberá permanecer visible para permitir su regularización posterior.

### Resultado esperado

La venta puede completarse y el inventario refleja el saldo real registrado, incluso si es negativo.

### Excepciones

- Usuario cancela voluntariamente la confirmación después de ver la advertencia.

### Criterios de aceptación

- La advertencia aparece antes de confirmar cuando hay insuficiencia.
- El usuario puede continuar.
- Después de confirmar, el saldo negativo queda registrado.
- La operación conserva trazabilidad.

---

## RF-021 — Registrar producción

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, COCINA |
| **Fuente** | H-003 / N-003 |
| **Necesidad relacionada** | N-003, N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá permitir registrar una operación de producción directamente en el sistema.

### Precondiciones

- Preparación/plato existente.
- Actor autorizado.
- Composición disponible cuando se requiera consumo automático.

### Entradas

- Preparación/plato.
- Cantidad producida.
- Fecha/hora.
- Información necesaria del lote.
- Responsable.

### Procesamiento y reglas

- La producción permanecerá separada conceptualmente del inventario de ingredientes.
- La confirmación activará las reglas de consumo y lote.
- Rendimiento, mermas y unidades especiales quedan pendientes.

### Resultado esperado

La producción queda registrada sin depender de una hoja física como fuente primaria.

### Excepciones

- Composición faltante cuando sea necesaria.
- Cantidad inválida.
- Regla de unidad no definida.

### Criterios de aceptación

- COCINA puede registrar producción.
- La producción conserva responsable y fecha.
- Una producción no confirmada no genera consumo definitivo.

---

## RF-022 — Consumir ingredientes al confirmar producción

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema |
| **Fuente** | Decisión de producción por lotes |
| **Necesidad relacionada** | N-003, N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá descontar los ingredientes definidos por la composición cuando una producción sea confirmada.

### Precondiciones

- Producción válida pendiente de confirmación.
- Composición válida.

### Entradas

- Cantidad producida.
- Composición.
- Existencias de ingredientes.

### Procesamiento y reglas

- El consumo se calculará según composición y cantidad producida.
- El consumo se registrará como movimientos de inventario.
- Las reglas de conversión pendientes deberán estar resueltas antes de implementar composiciones que las necesiten.

### Resultado esperado

Los ingredientes consumidos reducen sus existencias y quedan trazados como parte de la producción.

### Excepciones

- Composición incompleta.
- Unidad incompatible.
- Falla que impida preservar consistencia.

### Criterios de aceptación

- Confirmar producción genera los consumos correspondientes.
- Cancelar/no confirmar no consume ingredientes.
- Los movimientos quedan relacionados con la producción.

---

## RF-023 — Registrar lote producido

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema / ADMINISTRADOR, ENCARGADO, COCINA |
| **Fuente** | Decisión de separar platos e ingredientes |
| **Necesidad relacionada** | N-003, N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá registrar un lote o existencia producida al confirmar una producción.

### Precondiciones

- Producción válida confirmada.

### Entradas

- Preparación/plato.
- Cantidad obtenida.
- Fecha/hora.
- Responsable.
- Datos de lote que resulten obligatorios.

### Procesamiento y reglas

- El lote representará el producto preparado disponible para venta.
- Las reglas de vencimiento y selección entre múltiples lotes quedan pendientes si fueran necesarias.

### Resultado esperado

Existe un lote con la cantidad producida disponible para el flujo comercial correspondiente.

### Excepciones

- Cantidad producida inválida.
- Reglas de lote todavía no definidas para un caso especial.

### Criterios de aceptación

- Una producción confirmada genera un lote.
- El lote conserva referencia a la producción.
- La cantidad del lote es independiente del saldo de ingredientes ya consumidos.

---

## RF-024 — Consultar lotes y producciones

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, COCINA, CONTADORA |
| **Fuente** | N-003 / matriz de permisos |
| **Necesidad relacionada** | N-003, N-004 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir a los roles autorizados consultar las producciones y lotes registrados.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Filtros disponibles.
- Periodo cuando corresponda.
- Preparación/plato.

### Procesamiento y reglas

- La consulta deberá permitir distinguir producción, cantidad, fecha, responsable y lote relacionado.

### Resultado esperado

El usuario puede revisar la producción registrada y las existencias producidas.

### Excepciones

- Sin resultados.
- Actor sin permiso.

### Criterios de aceptación

- COCINA puede consultar producciones y lotes.
- CONTADORA dispone de consulta de solo lectura según la matriz.
- La consulta no modifica inventario.

---

## RF-025 — Registrar pedido

| Campo | Valor |
|---|---|
| **Actor(es)** | MESERO, ENCARGADO, ADMINISTRADOR |
| **Fuente** | N-011 / flujo principal MVP |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir crear un pedido con los platos o productos solicitados por el cliente.

### Precondiciones

- Usuario autenticado con permiso.
- Elementos de catálogo disponibles.

### Entradas

- Elementos.
- Cantidades.
- Cliente opcional cuando corresponda.
- Información operativa necesaria.

### Procesamiento y reglas

- El pedido iniciará en estado `PENDIENTE`.
- Registrar un pedido no realizará por sí mismo una salida definitiva de venta.

### Resultado esperado

El pedido queda registrado y disponible para continuar el flujo.

### Excepciones

- Elemento inválido/inactivo.
- Cantidad inválida.
- Actor sin permiso.

### Criterios de aceptación

- Un MESERO puede crear un pedido.
- El pedido nuevo queda `PENDIENTE`.
- El pedido conserva responsable.
- El pedido no descuenta definitivamente inventario por el solo hecho de crearse.

---

## RF-026 — Gestionar estado del pedido

| Campo | Valor |
|---|---|
| **Actor(es)** | MESERO, ENCARGADO, ADMINISTRADOR; COCINA según flujo autorizado |
| **Fuente** | Estados aprobados en SRS |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir transicionar un pedido entre los estados válidos de su ciclo de vida.

### Precondiciones

- Pedido existente.
- Usuario autorizado para la transición.

### Entradas

- Pedido.
- Nuevo estado solicitado.

### Procesamiento y reglas

- Estados válidos: `PENDIENTE`, `EN_PREPARACION`, `LISTO`, `ENTREGADO`, `CANCELADO`.
- Las transiciones deberán respetar el flujo definido.
- No se permitirá una transición arbitraria no contemplada.

### Resultado esperado

El pedido refleja su estado operativo actual.

### Excepciones

- Transición inválida.
- Pedido cancelado o finalizado.
- Actor sin permiso.

### Criterios de aceptación

- PENDIENTE puede pasar a EN_PREPARACION.
- EN_PREPARACION puede pasar a LISTO.
- LISTO puede pasar a ENTREGADO.
- Las cancelaciones respetan RF-027.

---

## RF-027 — Cancelar pedido antes del estado listo

| Campo | Valor |
|---|---|
| **Actor(es)** | MESERO, ENCARGADO, ADMINISTRADOR; COCINA cuando corresponda a la comanda autorizada |
| **Fuente** | Decisión confirmada |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir la cancelación ordinaria de un pedido únicamente antes de alcanzar `LISTO`.

### Precondiciones

- Pedido existente en `PENDIENTE` o `EN_PREPARACION`.
- Actor autorizado.

### Entradas

- Pedido.
- Solicitud de cancelación.
- Responsable.

### Procesamiento y reglas

- No se permitirá la cancelación ordinaria desde `LISTO` o `ENTREGADO`.
- La cancelación deberá quedar trazada.
- Si existe una comanda asociada, su estado deberá mantenerse coherente con la cancelación según las reglas del flujo.

### Resultado esperado

El pedido queda `CANCELADO` y no continúa el flujo normal.

### Excepciones

- Pedido ya `LISTO`, `ENTREGADO` o `CANCELADO`.
- Actor sin permiso.

### Criterios de aceptación

- Se puede cancelar desde PENDIENTE.
- Se puede cancelar desde EN_PREPARACION.
- No se puede cancelar ordinariamente desde LISTO.
- La cancelación conserva responsable.

---

## RF-028 — Generar comanda

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema / MESERO, ENCARGADO, ADMINISTRADOR |
| **Fuente** | N-011 / flujo principal |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá generar o registrar una comanda asociada al pedido que deba ser preparado por cocina.

### Precondiciones

- Pedido válido con elementos que requieren preparación.

### Entradas

- Pedido y detalle relevante para cocina.

### Procesamiento y reglas

- La comanda iniciará en `PENDIENTE`.
- La comanda deberá conservar referencia al pedido de origen.
- Solo deberá exponer a cocina la información necesaria para preparación.

### Resultado esperado

La cocina dispone de una comanda asociada al pedido.

### Excepciones

- Pedido inválido o cancelado.
- Falla al generar la comanda.

### Criterios de aceptación

- Un pedido de cocina genera una comanda.
- La comanda queda PENDIENTE.
- La comanda se puede rastrear hasta su pedido.

---

## RF-029 — Gestionar estado de comanda

| Campo | Valor |
|---|---|
| **Actor(es)** | COCINA, ENCARGADO, ADMINISTRADOR |
| **Fuente** | Estados aprobados en SRS |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir a los roles autorizados actualizar el estado de una comanda.

### Precondiciones

- Comanda existente.
- Actor autorizado.

### Entradas

- Comanda.
- Nuevo estado.

### Procesamiento y reglas

- Estados válidos: `PENDIENTE`, `EN_PREPARACION`, `LISTA`, `CANCELADA`.
- Las transiciones deberán seguir el ciclo definido.
- La cancelación ordinaria no se permitirá después de `LISTA`.

### Resultado esperado

La comanda refleja el estado real de preparación registrado.

### Excepciones

- Transición inválida.
- Comanda finalizada.
- Actor sin permiso.

### Criterios de aceptación

- COCINA puede iniciar preparación.
- COCINA puede marcar LISTA.
- No se permite una transición no definida.
- La cancelación respeta el límite aprobado.

---

## RF-030 — Consultar comandas desde cocina

| Campo | Valor |
|---|---|
| **Actor(es)** | COCINA, ENCARGADO, ADMINISTRADOR; MESERO consulta |
| **Fuente** | N-011 |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir visualizar las comandas relevantes y su estado a los roles autorizados.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Filtros o estado cuando correspondan.

### Procesamiento y reglas

- COCINA podrá gestionar estados.
- MESERO tendrá consulta sin capacidad de gestionar estados de cocina, salvo que posea otro rol que la conceda.

### Resultado esperado

Los usuarios autorizados conocen el estado de las comandas y cocina puede operar sobre ellas.

### Excepciones

- Sin comandas.
- Actor sin permiso.

### Criterios de aceptación

- COCINA visualiza comandas pendientes.
- MESERO puede consultar el estado.
- Un MESERO sin otro rol no puede cambiar estados de cocina.

---

## RF-031 — Registrar venta

| Campo | Valor |
|---|---|
| **Actor(es)** | MESERO, ENCARGADO, ADMINISTRADOR |
| **Fuente** | N-011 / MVP |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar una venta a partir del flujo correspondiente.

### Precondiciones

- Usuario autenticado con permiso.
- Existe un turno operativo cuando la venta deba asociarse a uno.

### Entradas

- Detalle de venta.
- Cantidades.
- Cliente opcional.
- Medio de pago.
- Turno.

### Procesamiento y reglas

- La venta conservará los valores comerciales utilizados en la operación.
- La confirmación definitiva se realizará mediante RF-035.

### Resultado esperado

La venta queda registrada con información suficiente para confirmar y consultar posteriormente.

### Excepciones

- Datos obligatorios faltantes.
- Actor sin permiso.
- Turno requerido inexistente.

### Criterios de aceptación

- MESERO puede registrar una venta.
- La venta conserva responsable y turno.
- Puede existir sin cliente asociado.

---

## RF-032 — Calcular total de venta

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema |
| **Fuente** | SRS §13 |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá calcular el total de una venta a partir de sus líneas, cantidades y precios aplicables.

### Precondiciones

- Existe al menos una línea válida de venta.

### Entradas

- Cantidades.
- Precios registrados para la operación.

### Procesamiento y reglas

- El total se calculará utilizando los valores de las líneas de la venta.
- El valor histórico confirmado no deberá depender de cambios futuros del catálogo.

### Resultado esperado

El total de la venta queda calculado y disponible antes de confirmar.

### Excepciones

- Línea inválida.
- Cantidad no válida.

### Criterios de aceptación

- El total corresponde a la suma de los importes de las líneas.
- Cambiar posteriormente un precio de catálogo no altera una venta ya confirmada.

---

## RF-033 — Registrar medio de pago

| Campo | Valor |
|---|---|
| **Actor(es)** | MESERO, ENCARGADO, ADMINISTRADOR |
| **Fuente** | Evidencia de caja / MVP |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá registrar el medio de pago utilizado en la venta.

### Precondiciones

- Venta válida.

### Entradas

- Medio de pago.
- Información adicional requerida por el medio cuando corresponda.

### Procesamiento y reglas

- El catálogo inicial deberá soportar los medios que se definan formalmente durante refinamiento.
- Efectivo y QR forman parte de la evidencia disponible; otros medios deberán confirmarse antes de ser obligatorios.

### Resultado esperado

La venta conserva el medio de pago utilizado para consultas y cierre.

### Excepciones

- Medio de pago no permitido.
- Datos adicionales requeridos faltantes.

### Criterios de aceptación

- Una venta puede registrar efectivo.
- Una venta puede registrar QR.
- El medio queda disponible para el cierre del turno.

---

## RF-034 — Asociar cliente opcional a venta

| Campo | Valor |
|---|---|
| **Actor(es)** | MESERO, ENCARGADO, ADMINISTRADOR |
| **Fuente** | Decisión de MVP |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir asociar un cliente existente a una venta sin que esta asociación sea obligatoria.

### Precondiciones

- Venta existente.
- Cliente existente cuando se desee asociar.

### Entradas

- Venta.
- Cliente opcional.

### Procesamiento y reglas

- La ausencia de cliente no impedirá una venta normal.
- La asociación no habilitará crédito en el MVP.

### Resultado esperado

La venta puede conservar referencia a un cliente o permanecer sin cliente.

### Excepciones

- Cliente inexistente o inactivo cuando no deba utilizarse.

### Criterios de aceptación

- Se puede confirmar una venta sin cliente.
- Se puede asociar un cliente existente.
- La asociación no crea una cuenta por cobrar.

---

## RF-035 — Confirmar venta

| Campo | Valor |
|---|---|
| **Actor(es)** | MESERO, ENCARGADO, ADMINISTRADOR |
| **Fuente** | Decisión confirmada |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir confirmar/cobrar una venta válida.

### Precondiciones

- Venta válida pendiente de confirmación.
- Medio de pago registrado.
- Turno válido cuando aplique.

### Entradas

- Venta a confirmar.
- Confirmación del usuario.

### Procesamiento y reglas

- La confirmación será el punto de afectación definitiva del inventario comercial.
- Si existe insuficiencia de stock, se aplicará RF-020 y la operación podrá continuar.
- Confirmar no generará facturación fiscal.

### Resultado esperado

La venta queda confirmada, trazada y disponible para cierre/reportes.

### Excepciones

- Datos incompletos.
- Actor sin permiso.
- Error que impida preservar consistencia.

### Criterios de aceptación

- Una venta válida puede confirmarse.
- La venta confirmada conserva medio de pago, responsable y turno.
- Stock insuficiente advierte pero no bloquea.
- No se genera factura fiscal.

---

## RF-036 — Afectar inventario al confirmar venta

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema |
| **Fuente** | SRS §13.2 / decisión de lotes |
| **Necesidad relacionada** | N-004, N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá registrar la salida de inventario correspondiente cuando una venta sea confirmada.

### Precondiciones

- Venta válida confirmándose.
- Elemento vendido identificable.

### Entradas

- Detalle de venta.
- Existencias/lotes correspondientes.

### Procesamiento y reglas

- Para productos preparados mediante lote, la venta afectará el lote o existencia vendible y no volverá a consumir ingredientes ya descontados en producción.
- Para otros elementos inventariables se aplicará el movimiento que corresponda.
- La selección exacta entre múltiples lotes queda pendiente si llega a ser necesaria.

### Resultado esperado

El inventario refleja la venta confirmada sin duplicar consumo.

### Excepciones

- Saldo insuficiente: se permite negativo con advertencia previa.
- Reglas de múltiples lotes pendientes.

### Criterios de aceptación

- Una venta confirmada genera movimientos.
- Una venta no confirmada no genera salida definitiva.
- Vender desde un lote no descuenta nuevamente sus ingredientes de producción.
- El saldo puede quedar negativo.

---

## RF-037 — Consultar historial de ventas

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, CONTADORA; MESERO limitado a su turno |
| **Fuente** | N-010 / decisión de permisos |
| **Necesidad relacionada** | N-010, N-011 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir consultar ventas registradas según el alcance de acceso del usuario.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Periodo, turno u otros filtros autorizados.

### Procesamiento y reglas

- ADMINISTRADOR, ENCARGADO y CONTADORA podrán consultar la información autorizada general.
- MESERO solo podrá consultar las ventas correspondientes a su turno.
- El filtro por alcance deberá aplicarse como regla de autorización.

### Resultado esperado

El usuario obtiene el historial de ventas permitido.

### Excepciones

- Actor sin permiso.
- Sin resultados.

### Criterios de aceptación

- MESERO no puede consultar ventas de otro turno mediante una llamada directa.
- ENCARGADO puede consultar ventas de los turnos autorizados.
- CONTADORA dispone de consulta sin capacidad de modificar ventas.

---

## RF-038 — Gestionar clientes básicos

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO; MESERO registrar/consultar; CONTADORA consultar |
| **Fuente** | Decisión de MVP |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar y consultar clientes básicos para asociarlos opcionalmente a ventas.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Datos básicos del cliente.

### Procesamiento y reglas

- El MVP no incluirá límites de crédito, cuentas por cobrar ni mora.
- Los permisos de modificación deberán respetar la matriz funcional.

### Resultado esperado

El cliente queda disponible para asociación opcional a ventas.

### Excepciones

- Datos inválidos.
- Actor sin permiso.

### Criterios de aceptación

- MESERO puede registrar y consultar clientes.
- CONTADORA solo consulta.
- El cliente puede asociarse a una venta.
- No existe flujo de crédito.

---

## RF-039 — Gestionar proveedores

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO; COCINA y CONTADORA consulta |
| **Fuente** | H-007 / H-009 |
| **Necesidad relacionada** | N-006, N-008 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar, consultar, actualizar y cambiar el estado de proveedores.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Datos básicos del proveedor.
- Datos de contacto necesarios.
- Estado.

### Procesamiento y reglas

- Los proveedores deberán poder asociarse a compras.
- COCINA y CONTADORA tendrán consulta, no administración general, salvo otro rol asignado.

### Resultado esperado

El catálogo de proveedores queda disponible para compras y consultas.

### Excepciones

- Datos obligatorios faltantes.
- Actor sin permiso.

### Criterios de aceptación

- ADMINISTRADOR y ENCARGADO gestionan proveedores.
- COCINA puede consultarlos.
- Un proveedor puede asociarse a una compra.

---

## RF-040 — Registrar compra

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO; COCINA para compras autorizadas de cocina |
| **Fuente** | H-007 / decisión MVP |
| **Necesidad relacionada** | N-006, N-007, N-008 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá permitir registrar una compra asociada a un proveedor.

### Precondiciones

- Proveedor existente.
- Actor autorizado.

### Entradas

- Proveedor.
- Fecha.
- Detalle.
- Cantidades.
- Costos.
- Responsable.

### Procesamiento y reglas

- La compra iniciará en `PENDIENTE`.
- COCINA solo podrá gestionar compras dentro del alcance autorizado para cocina.
- La categorización exacta de compras autorizadas deberá refinarse si requiere reglas más específicas.

### Resultado esperado

La compra queda registrada y pendiente de recepción o cancelación.

### Excepciones

- Proveedor inválido.
- Datos incompletos.
- Actor fuera del alcance permitido.

### Criterios de aceptación

- ADMINISTRADOR y ENCARGADO pueden registrar compras.
- COCINA puede registrar una compra autorizada de cocina.
- La compra nueva queda PENDIENTE.
- Registrar la compra no incrementa stock.

---

## RF-041 — Gestionar estado de compra

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO; COCINA en compras autorizadas |
| **Fuente** | Decisión confirmada |
| **Necesidad relacionada** | N-006, N-007 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá manejar los estados `PENDIENTE`, `RECIBIDA` y `CANCELADA` para compras.

### Precondiciones

- Compra existente.
- Actor autorizado.

### Entradas

- Compra.
- Nuevo estado.

### Procesamiento y reglas

- Una compra `RECIBIDA` representa una recepción confirmada.
- Una compra `CANCELADA` no deberá incrementar inventario.
- No se permitirán estados fuera del catálogo aprobado.

### Resultado esperado

La compra refleja su estado operativo.

### Excepciones

- Transición inválida.
- Actor sin permiso.

### Criterios de aceptación

- Una compra inicia PENDIENTE.
- Puede marcarse RECIBIDA.
- Puede marcarse CANCELADA cuando corresponda.
- Estados no válidos son rechazados.

---

## RF-042 — Registrar recepción de compra

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO; COCINA en compras autorizadas |
| **Fuente** | H-007 / decisión MVP |
| **Necesidad relacionada** | N-006, N-007, N-008 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá permitir confirmar la recepción básica de una compra.

### Precondiciones

- Compra existente en estado compatible.
- Actor autorizado.

### Entradas

- Compra.
- Confirmación de recepción.
- Información básica de recepción que resulte necesaria.

### Procesamiento y reglas

- La recepción completa del MVP llevará la compra a `RECIBIDA`.
- La recepción parcial y rechazo parcial quedan fuera de esta baseline hasta contar con reglas.

### Resultado esperado

La compra queda recibida y habilita el incremento correspondiente de inventario.

### Excepciones

- Compra cancelada.
- Recepción parcial no soportada por la baseline.
- Actor sin permiso.

### Criterios de aceptación

- Confirmar la recepción cambia el estado a RECIBIDA.
- La recepción queda trazada.
- No se simula una recepción parcial sin reglas aprobadas.

---

## RF-043 — Incrementar inventario al recibir compra

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema |
| **Fuente** | Decisión confirmada |
| **Necesidad relacionada** | N-004, N-006 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá incrementar el inventario de los elementos recibidos cuando una compra sea confirmada como `RECIBIDA`.

### Precondiciones

- Compra válida.
- Detalle con elementos inventariables.
- Recepción confirmada.

### Entradas

- Detalle de compra y cantidades recibidas.

### Procesamiento y reglas

- Una compra `PENDIENTE` no modificará inventario.
- Una compra `CANCELADA` no modificará inventario.
- La entrada deberá generar movimientos trazables.

### Resultado esperado

Las existencias aumentan de acuerdo con la compra recibida.

### Excepciones

- Elemento inválido.
- Falla que impida preservar consistencia.

### Criterios de aceptación

- RECIBIDA incrementa stock.
- PENDIENTE no incrementa stock.
- CANCELADA no incrementa stock.
- Los movimientos quedan relacionados con la compra.

---

## RF-044 — Consultar historial de compras

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, CONTADORA; COCINA en alcance autorizado |
| **Fuente** | N-006 / N-008 |
| **Necesidad relacionada** | N-006, N-008 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir consultar las compras registradas según permisos.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Periodo, proveedor, estado u otros filtros definidos.

### Procesamiento y reglas

- COCINA deberá limitarse al alcance autorizado de compras de cocina cuando sea necesario.
- CONTADORA tendrá consulta sin gestión.

### Resultado esperado

Los usuarios autorizados pueden revisar el historial de compras.

### Excepciones

- Sin resultados.
- Actor sin permiso.

### Criterios de aceptación

- Se pueden distinguir compras pendientes, recibidas y canceladas.
- CONTADORA puede consultar.
- COCINA no obtiene permisos superiores a su alcance salvo que posea otro rol.

---

## RF-045 — Registrar gasto diario

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO |
| **Fuente** | H-010 / decisión de permisos |
| **Necesidad relacionada** | N-009, N-014 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar gastos diarios o movimientos de caja chica únicamente a `ADMINISTRADOR` y `ENCARGADO`.

### Precondiciones

- Actor autenticado con rol autorizado.

### Entradas

- Fecha.
- Concepto/detalle.
- Monto.
- Clasificación básica cuando exista.
- Turno cuando corresponda.

### Procesamiento y reglas

- El monto deberá ser válido.
- El gasto conservará al usuario responsable.
- MESERO y COCINA no podrán registrar gastos salvo que también posean un rol autorizado.

### Resultado esperado

El gasto queda persistido y disponible para consulta y cierre cuando aplique.

### Excepciones

- Monto inválido.
- Actor sin permiso.
- Turno requerido inexistente.

### Criterios de aceptación

- ADMINISTRADOR puede registrar gasto.
- ENCARGADO puede registrar gasto.
- MESERO sin ENCARGADO no puede registrar gasto.
- Un MESERO que también sea ENCARGADO sí puede hacerlo por su segundo rol.

---

## RF-046 — Consultar gastos

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, CONTADORA |
| **Fuente** | N-009 / matriz de permisos |
| **Necesidad relacionada** | N-009 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir consultar los gastos registrados a los roles autorizados.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Periodo, turno o filtros disponibles.

### Procesamiento y reglas

- CONTADORA tendrá acceso de consulta.
- La consulta deberá conservar información del responsable.

### Resultado esperado

El usuario autorizado obtiene el historial de gastos correspondiente.

### Excepciones

- Sin resultados.
- Actor sin permiso.

### Criterios de aceptación

- CONTADORA puede consultar sin editar.
- Los gastos pueden filtrarse por turno cuando estén asociados.
- Se muestra responsable y monto.

---

## RF-047 — Registrar entrada de asistencia

| Campo | Valor |
|---|---|
| **Actor(es)** | Todos los trabajadores con cuenta habilitada |
| **Fuente** | H-001 / N-001 |
| **Necesidad relacionada** | N-001, N-002 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir a un trabajador registrar su entrada cuando no tenga una asistencia abierta.

### Precondiciones

- Usuario identificado/autenticado según el mecanismo del MVP.
- No existe una asistencia abierta para el trabajador.

### Entradas

- Identidad del trabajador.
- Fecha/hora obtenida por el sistema.

### Procesamiento y reglas

- La entrada creará una asistencia abierta.
- El usuario no deberá poder suministrar libremente otra identidad en el flujo normal.
- El mecanismo deberá poder reutilizarse en una futura integración biométrica.

### Resultado esperado

Queda registrada una entrada abierta para el trabajador.

### Excepciones

- Ya existe una asistencia abierta.
- Usuario no habilitado.

### Criterios de aceptación

- Un trabajador sin entrada abierta puede registrar entrada.
- La fecha/hora queda registrada.
- No se crean dos asistencias abiertas para la misma persona.

---

## RF-048 — Registrar salida de asistencia

| Campo | Valor |
|---|---|
| **Actor(es)** | Todos los trabajadores con asistencia abierta |
| **Fuente** | H-001 / N-001 |
| **Necesidad relacionada** | N-001, N-002 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar la salida de un trabajador cerrando su asistencia abierta.

### Precondiciones

- Existe una asistencia abierta para el trabajador.

### Entradas

- Identidad del trabajador.
- Fecha/hora de salida obtenida por el sistema.

### Procesamiento y reglas

- La salida se asociará a la asistencia abierta correspondiente.
- Después de la salida, la asistencia dejará de estar abierta.

### Resultado esperado

La asistencia queda cerrada con entrada y salida.

### Excepciones

- No existe asistencia abierta.
- Usuario no habilitado.

### Criterios de aceptación

- Registrar salida cierra la asistencia abierta.
- Una salida sin entrada previa es rechazada.
- Después de cerrar, el trabajador puede registrar una nueva entrada futura.

---

## RF-049 — Impedir múltiples asistencias abiertas

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema |
| **Fuente** | Decisión confirmada |
| **Necesidad relacionada** | N-001, N-002 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá impedir que un trabajador tenga más de una asistencia abierta al mismo tiempo.

### Precondiciones

- Se intenta registrar una nueva entrada.

### Entradas

- Trabajador.
- Estado actual de asistencia.

### Procesamiento y reglas

- Antes de crear una entrada se verificará si existe una asistencia abierta.
- Si existe, la nueva entrada será rechazada.

### Resultado esperado

Se preserva una secuencia coherente entrada → salida.

### Excepciones

- Existencia de datos históricos inconsistentes; deberán tratarse mediante un mecanismo administrativo futuro si aparece el caso.

### Criterios de aceptación

- Con una asistencia abierta, una segunda entrada es rechazada.
- Después de registrar salida, una nueva entrada puede registrarse.

---

## RF-050 — Consultar asistencia personal

| Campo | Valor |
|---|---|
| **Actor(es)** | Todos los trabajadores |
| **Fuente** | N-001 / matriz de permisos |
| **Necesidad relacionada** | N-001, N-002 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir a un trabajador consultar su propio historial de asistencia.

### Precondiciones

- Usuario autenticado.

### Entradas

- Periodo o filtros disponibles.

### Procesamiento y reglas

- La consulta personal solo devolverá registros del usuario correspondiente, salvo que posea además un rol con permiso de consulta general.

### Resultado esperado

El trabajador puede revisar sus entradas y salidas.

### Excepciones

- Sin registros.

### Criterios de aceptación

- EMPLEADO puede consultar solo su asistencia.
- MESERO y COCINA pueden consultar la propia.
- Un rol adicional autorizado puede ampliar el alcance de consulta.

---

## RF-051 — Consultar asistencia administrativamente

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, CONTADORA |
| **Fuente** | N-002 / matriz de permisos |
| **Necesidad relacionada** | N-001, N-002 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir consultar la asistencia de trabajadores a los roles administrativos autorizados.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Trabajador.
- Periodo u otros filtros definidos.

### Procesamiento y reglas

- ADMINISTRADOR, ENCARGADO y CONTADORA podrán consultar información general de asistencia.
- La consulta no implica implementar nómina completa.

### Resultado esperado

El usuario autorizado puede obtener la asistencia necesaria para control administrativo.

### Excepciones

- Sin resultados.
- Actor sin permiso.

### Criterios de aceptación

- CONTADORA puede consultar asistencia general.
- MESERO sin otro rol no puede consultar la asistencia general.
- La consulta permite ver entrada y salida por trabajador.

---

## RF-052 — Gestionar turnos

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO; MESERO opera su turno; CONTADORA consulta |
| **Fuente** | MVP / evidencia de dos turnos |
| **Necesidad relacionada** | N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá permitir representar los turnos necesarios para agrupar operaciones y realizar cierres.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Información del turno definida para la operación.

### Procesamiento y reglas

- ADMINISTRADOR y ENCARGADO gestionarán turnos.
- MESERO podrá operar dentro de su turno pero no administrar todos los turnos.
- CONTADORA tendrá consulta.
- Las reglas exactas de apertura y cierre total de dos turnos siguen pendientes.

### Resultado esperado

Las operaciones pueden asociarse al turno correspondiente.

### Excepciones

- Reglas de apertura aún no definidas.
- Actor sin permiso.

### Criterios de aceptación

- Un MESERO puede operar dentro de su turno.
- Un MESERO no gestiona otros turnos por ese rol.
- ADMINISTRADOR y ENCARGADO pueden gestionar el flujo autorizado.

---

## RF-053 — Asociar operaciones al turno

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema / actores operativos |
| **Fuente** | N-009 / N-011 |
| **Necesidad relacionada** | N-009, N-011, N-014 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá asociar al turno correspondiente las operaciones que formen parte de su cierre.

### Precondiciones

- Existe un turno válido/activo según las reglas disponibles.

### Entradas

- Venta, gasto u otra operación aplicable.
- Turno.

### Procesamiento y reglas

- Las ventas deberán quedar asociadas al turno.
- Los gastos deberán asociarse cuando correspondan al cierre.
- La asociación deberá preservar responsable y medio de pago cuando aplique.

### Resultado esperado

El turno dispone de la información necesaria para construir su resumen y cierre.

### Excepciones

- Turno inexistente o incompatible.
- Operación no aplicable al cierre.

### Criterios de aceptación

- Una venta del turno aparece en su resumen.
- Un gasto asociado aparece en el turno.
- Una operación de otro turno no se mezcla indebidamente.

---

## RF-054 — Calcular información esperada de cierre

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema |
| **Fuente** | SRS §17 |
| **Necesidad relacionada** | N-009, N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá calcular la información esperada del cierre utilizando las operaciones registradas en el turno.

### Precondiciones

- Turno existente con operaciones registradas.

### Entradas

- Ventas por medio de pago.
- Gastos asociados.
- Otros movimientos definidos.

### Procesamiento y reglas

- El cálculo deberá distinguir al menos efectivo, QR y otros medios que finalmente se formalicen.
- El tratamiento de monto inicial, diferencias y PedidosYa permanece pendiente hasta consulta a Product Owner.

### Resultado esperado

El usuario autorizado obtiene un resumen esperado del turno.

### Excepciones

- Reglas pendientes impiden completar un cálculo definitivo para algún componente; deberá señalarse y no inventarse.

### Criterios de aceptación

- El resumen incluye ventas registradas del turno.
- Los gastos asociados se consideran según la regla aprobada.
- Los medios de pago se presentan de forma diferenciada cuando corresponda.

---

## RF-055 — Registrar cierre de turno o caja

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO |
| **Fuente** | Decisión confirmada de permisos |
| **Necesidad relacionada** | N-009, N-011, N-014 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido con reglas pendientes** |

### Descripción

El sistema deberá permitir registrar el cierre de un turno/caja únicamente a usuarios con rol `ADMINISTRADOR` o `ENCARGADO`.

### Precondiciones

- Usuario con permiso.
- Turno susceptible de cierre.
- Información esperada calculable con las reglas disponibles.

### Entradas

- Turno.
- Información de cierre requerida.
- Responsable.

### Procesamiento y reglas

- MESERO no podrá cerrar por el rol MESERO.
- Un usuario MESERO que también posea ENCARGADO podrá cerrar gracias al segundo rol.
- El cierre conservará trazabilidad.
- Las reglas de monto inicial, diferencias y cierre total de dos turnos deberán confirmarse antes de completar su especificación definitiva.

### Resultado esperado

El cierre queda registrado por un usuario autorizado.

### Excepciones

- Actor sin permiso.
- Turno inválido.
- Regla necesaria pendiente.

### Criterios de aceptación

- ADMINISTRADOR puede cerrar.
- ENCARGADO puede cerrar.
- MESERO sin ENCARGADO no puede cerrar.
- MESERO + ENCARGADO sí puede cerrar.
- El cierre conserva responsable.

---

## RF-056 — Consultar cierre

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, CONTADORA |
| **Fuente** | MVP / matriz de permisos |
| **Necesidad relacionada** | N-010, N-011 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir consultar los cierres registrados según permisos.

### Precondiciones

- Existe al menos un cierre o usuario autorizado para consultar.

### Entradas

- Periodo, turno u otros filtros.

### Procesamiento y reglas

- CONTADORA tendrá acceso de consulta.
- La consulta no otorgará permiso de modificación por sí sola.

### Resultado esperado

El usuario puede revisar el resumen y datos persistidos del cierre.

### Excepciones

- Sin resultados.
- Actor sin permiso.

### Criterios de aceptación

- CONTADORA puede consultar cierres.
- El responsable del cierre es visible.
- Un usuario no autorizado no obtiene la información.

---

## RF-057 — Generar o consultar reporte de ventas

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, CONTADORA; MESERO limitado a su turno |
| **Fuente** | N-010 / decisión de reportes MVP |
| **Necesidad relacionada** | N-010, N-011 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá proporcionar un reporte de ventas dentro del alcance autorizado del usuario.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Periodo y/o turno.
- Filtros básicos que se definan.

### Procesamiento y reglas

- MESERO solo podrá consultar ventas de su turno.
- ADMINISTRADOR, ENCARGADO y CONTADORA tendrán el alcance general autorizado.
- El MVP no obliga a exportación externa.

### Resultado esperado

El usuario obtiene información consolidada de ventas autorizadas.

### Excepciones

- Sin resultados.
- Actor intenta consultar fuera de su alcance.

### Criterios de aceptación

- MESERO obtiene únicamente ventas de su turno.
- ENCARGADO puede consultar el reporte autorizado general.
- El sistema rechaza el acceso de un MESERO a otro turno.

---

## RF-058 — Generar o consultar reporte de inventario

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, COCINA, CONTADORA |
| **Fuente** | N-005 / decisión de reportes MVP |
| **Necesidad relacionada** | N-004, N-005, N-010 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá proporcionar un reporte o vista consolidada de inventario y stock bajo a los roles autorizados.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Filtros básicos.
- Existencias y umbrales.

### Procesamiento y reglas

- COCINA tendrá consulta de inventario y stock bajo.
- La información deberá reflejar saldos negativos cuando existan.

### Resultado esperado

El usuario obtiene existencias y elementos que requieren atención.

### Excepciones

- Sin resultados.
- Actor sin permiso.

### Criterios de aceptación

- COCINA puede consultar stock bajo.
- CONTADORA puede consultar.
- Los saldos negativos se muestran.
- El reporte identifica elementos bajo umbral.

---

## RF-059 — Generar o consultar reporte de asistencia

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, CONTADORA; demás usuarios solo información propia |
| **Fuente** | N-001 / N-002 / decisión de reportes MVP |
| **Necesidad relacionada** | N-001, N-002, N-010 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá proporcionar un reporte de asistencia respetando el alcance de acceso de cada rol.

### Precondiciones

- Usuario autenticado.

### Entradas

- Periodo.
- Trabajador cuando el rol permita consulta general.

### Procesamiento y reglas

- ADMINISTRADOR, ENCARGADO y CONTADORA podrán consultar asistencia general.
- MESERO, COCINA y EMPLEADO solo accederán a su propia asistencia salvo que posean adicionalmente un rol autorizado.

### Resultado esperado

El usuario obtiene la información de asistencia correspondiente a su alcance.

### Excepciones

- Actor intenta consultar información no autorizada.
- Sin resultados.

### Criterios de aceptación

- CONTADORA puede consultar por trabajador y periodo.
- EMPLEADO solo ve sus registros.
- Un usuario MESERO + ENCARGADO obtiene el alcance de ENCARGADO por su rol adicional.

---

# 5. Resumen del catálogo

| Rango | Área |
|---|---|
| `RF-001`–`RF-006` | Autenticación, usuarios, roles, permisos y trazabilidad |
| `RF-007`–`RF-012` | Catálogo |
| `RF-013`–`RF-020` | Inventario y alertas |
| `RF-021`–`RF-024` | Producción y lotes |
| `RF-025`–`RF-030` | Pedidos y comandas |
| `RF-031`–`RF-037` | Ventas |
| `RF-038` | Clientes |
| `RF-039`–`RF-044` | Proveedores y compras |
| `RF-045`–`RF-046` | Gastos |
| `RF-047`–`RF-051` | Asistencia |
| `RF-052`–`RF-056` | Turnos y cierre |
| `RF-057`–`RF-059` | Reportes |

---

# 6. Requisitos con reglas pendientes

Los siguientes requisitos están suficientemente definidos para existir en el catálogo, pero **no deberán considerarse completamente Ready** hasta resolver las reglas indicadas:

| RF | Pendiente principal |
|---|---|
| `RF-010` | Unidades y conversiones de composición |
| `RF-014` | Clasificación/reglas exactas de bajas, mermas y desperdicios |
| `RF-021` | Rendimiento, unidades, mermas y desperdicios de producción |
| `RF-022` | Conversiones de unidades cuando sean necesarias |
| `RF-023` | Reglas de lotes múltiples y vencimientos si aplican |
| `RF-033` | Catálogo definitivo de medios de pago adicionales |
| `RF-036` | Selección entre múltiples lotes, si el caso se utiliza |
| `RF-040` | Delimitación formal de las categorías de compra autorizadas a COCINA |
| `RF-042` | Recepción parcial/rechazo parcial, fuera de la baseline actual |
| `RF-052` | Apertura y relación exacta de los dos turnos |
| `RF-054` | Monto inicial, diferencias, PedidosYa y cierre total |
| `RF-055` | Reglas definitivas del cierre |

---

# 7. Control de requisitos fuera del MVP

Los siguientes comportamientos **no deberán agregarse implícitamente** a estos RF:

- facturación fiscal;
- ventas a crédito;
- cuentas por cobrar;
- nómina salarial completa;
- enrolamiento biométrico;
- almacenamiento de huellas;
- impresión térmica integrada;
- pagos bancarios automáticos;
- integración con WhatsApp;
- integración con PedidosYa;
- migración histórica;
- reportería avanzada.

Si posteriormente se aprueban, deberán incorporarse como nuevos requisitos o cambios formales de alcance.

---

# 8. Criterio de calidad

Para esta baseline se verificó que cada RF:

- posee identificador único;
- describe una capacidad principal;
- identifica actores;
- mantiene una fuente o decisión de origen;
- se relaciona con necesidades;
- incluye prioridad y estado;
- define precondiciones;
- identifica entradas;
- expresa reglas relevantes;
- define resultado esperado;
- contempla excepciones;
- contiene criterios de aceptación observables;
- evita imponer una tecnología concreta cuando no es necesaria;
- conserva explícitas las reglas todavía pendientes.

---

# 9. Próximo artefacto

El siguiente documento será:

```text
docs/requirements/requisitos-no-funcionales.md
```

Después:

```text
docs/requirements/reglas-negocio.md
```

---

# 10. Control de cambios

| Versión | Fecha | Descripción | Estado |
|---|---|---|---|
| `0.1` | 20/08/2026 | Especificación detallada inicial de `RF-001` a `RF-059` según SRS, MVP y matriz de permisos aprobada | Lista para RNF y refinamiento posterior |
