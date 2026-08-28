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
| Productos/ingredientes/platos | Gestionar | Gestionar | Consultar | Consultar | — | — |
| Inventario | Gestionar | Gestionar | Consultar | Consultar | Consultar | — |
| Stock mínimo/alertas | Gestionar | Gestionar | Consultar | Consultar | Consultar | — |
| Producción/preparaciones | Gestionar/consultar | Gestionar/consultar | — | Registrar/gestionar | Consultar | — |
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
- MESERO y COCINA pueden consultar según la matriz, pero no modificarlos; CONTADORA no accede al catálogo de Products.
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
- Los ingredientes conservan una unidad; las conversiones compatibles se aplican cuando el caso de negocio lo requiera, conforme a `RF-010`.

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
| **Fuente** | N-011 / decisión de separar ingredientes y existencia preparada |
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
- Un plato podrá vincularse a una composición y, cuando se produzca previamente, a una existencia preparada.

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
| **Fuente** | SRS §11 / ENT-02 |
| **Necesidad relacionada** | N-003, N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir definir qué ingredientes, cantidades y unidades componen un plato o preparación para calcular el consumo durante producción.

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
- La unidad utilizada deberá ser compatible con la unidad de inventario del ingrediente.
- La baseline confirma conversiones entre unidades compatibles cuando sean necesarias; existe al menos el caso `kg ↔ g` para carne.
- Los líquidos pueden gestionarse en litros según el proceso observado.
- No se crearán conversiones arbitrarias sin un caso real del catálogo.

### Resultado esperado

La composición queda disponible para calcular el consumo durante producción.

### Excepciones

- Ingrediente inexistente o inactivo.
- Cantidad inválida.
- Unidad incompatible o conversión no definida para un caso nuevo.

### Criterios de aceptación

- Se puede asociar más de un ingrediente a una preparación.
- Cada componente conserva cantidad y unidad.
- La composición puede consultarse antes de confirmar producción.
- Una conversión compatible definida se aplica de forma consistente.
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
- CONTADORA no accede al catálogo de Products; su consulta de inventario conserva la matriz específica de ese módulo.

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
| **Fuente** | N-004 / ENT-02 |
| **Necesidad relacionada** | N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar salidas o bajas de inventario separadas de los consumos normales cuando exista una pérdida, devolución interna, plato dado de baja u otro motivo operativo autorizado.

### Precondiciones

- Elemento inventariable existente.
- Actor o proceso autorizado.

### Entradas

- Elemento.
- Cantidad.
- Motivo obligatorio.
- Fecha/hora.
- Responsable.

### Procesamiento y reglas

- La cantidad deberá ser positiva.
- La salida generará un movimiento trazable.
- La evidencia de ENT-02 confirma que las bajas/pérdidas relevantes se registran por separado y con motivo.
- El catálogo de motivos podrá ampliarse posteriormente, pero el MVP no depende de una taxonomía exhaustiva.

### Resultado esperado

Las existencias se reducen y queda registrado el movimiento, responsable y motivo.

### Excepciones

- Cantidad inválida.
- Motivo ausente.
- Actor sin permiso.

### Criterios de aceptación

- Una baja válida reduce existencias.
- El sistema conserva responsable y motivo.
- Una baja no se confunde con el consumo automático de una producción o venta.

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
| **Actor(es)** | COCINA, ENCARGADO, ADMINISTRADOR |
| **Fuente** | N-003 / ENT-01 / ENT-02 |
| **Necesidad relacionada** | N-003, N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar directamente una producción de una preparación, utilizando como dato principal la **cantidad final obtenida**.

### Precondiciones

- Preparación existente y activa.
- Composición válida cuando la producción deba consumir ingredientes.
- Actor autorizado.

### Entradas

- Preparación.
- Cantidad final producida.
- Fecha/hora.
- Responsable autenticado.

### Procesamiento y reglas

- Fratelli no requiere registrar una cantidad esperada ni calcular rendimiento formal para el MVP.
- La confirmación ejecutará el consumo de ingredientes y la actualización de existencia preparada como una operación consistente.
- Cada evento de producción conservará su fecha, cantidad y responsable aunque la disponibilidad se acumule.

### Resultado esperado

La producción queda registrada y lista para aplicar sus movimientos asociados.

### Excepciones

- Cantidad final inválida.
- Preparación/composición inexistente.
- Actor sin permiso.
- Error durante la confirmación: no debe dejar movimientos parciales.

### Criterios de aceptación

- COCINA puede registrar producción.
- Se registra la cantidad final obtenida.
- Se conserva fecha/hora y responsable.
- No se exige rendimiento esperado.
- La operación puede auditarse posteriormente.

---

## RF-022 — Consumir ingredientes al confirmar producción

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema, iniciado por COCINA/ENCARGADO/ADMINISTRADOR |
| **Fuente** | SRS §11 / ENT-02 |
| **Necesidad relacionada** | N-003, N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

Al confirmar una producción, el sistema deberá descontar los ingredientes definidos por la composición según la cantidad final producida y las unidades compatibles.

### Precondiciones

- Producción válida.
- Composición disponible.
- Ingredientes identificados.

### Entradas

- Cantidad final producida.
- Composición.
- Existencias actuales.
- Unidades y conversiones aplicables.

### Procesamiento y reglas

- El consumo deriva de la composición.
- Cuando compra/stock y consumo usen unidades diferentes, se aplicará la conversión compatible definida, como `kg ↔ g`.
- El consumo y la producción deberán confirmarse de forma consistente para evitar una producción aplicada sin sus movimientos.

### Resultado esperado

Los ingredientes quedan disminuidos por el consumo correspondiente y el movimiento queda trazable.

### Excepciones

- Composición inválida.
- Conversión necesaria no disponible para un ingrediente nuevo.
- Error de persistencia.

### Criterios de aceptación

- Confirmar producción descuenta los ingredientes correspondientes.
- La conversión definida se aplica antes de modificar existencias.
- Un error no deja consumos parciales.

---

## RF-023 — Actualizar existencia preparada al confirmar producción

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema, iniciado por COCINA/ENCARGADO/ADMINISTRADOR |
| **Fuente** | SRS §11 / ENT-02 |
| **Necesidad relacionada** | N-003, N-004 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá aumentar la existencia disponible de la preparación con la cantidad final obtenida al confirmar una producción.

### Precondiciones

- Producción válida.
- Consumo de ingredientes aplicable dentro de la misma operación consistente.

### Entradas

- Preparación.
- Cantidad final producida.
- Registro de producción.

### Procesamiento y reglas

- Producciones repetidas de la misma preparación sumarán su cantidad a la disponibilidad total.
- Cada evento de producción seguirá conservando fecha, cantidad y responsable.
- El MVP no requiere seleccionar ni consumir un lote/tanda específico durante la venta.
- El MVP no requiere fecha exacta de vencimiento por lote.

### Resultado esperado

La preparación queda disponible para venta con su saldo actualizado y el evento de producción queda trazable.

### Excepciones

- Producción no confirmada.
- Cantidad inválida.
- Error de persistencia: no debe existir actualización parcial.

### Criterios de aceptación

- Una producción confirmada incrementa la existencia preparada.
- Dos producciones de la misma preparación pueden acumular disponibilidad.
- Los dos eventos permanecen consultables por separado.
- No se exige gestión de lotes múltiples para el MVP.

---

## RF-024 — Consultar registros de producción

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, COCINA, CONTADORA |
| **Fuente** | SRS §11 / ENT-02 |
| **Necesidad relacionada** | N-003, N-004 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir a los roles autorizados consultar los registros de producción realizados.

### Precondiciones

- Usuario autenticado con permiso de consulta.

### Entradas

- Filtros por preparación, periodo o responsable cuando estén disponibles.

### Procesamiento y reglas

- La consulta mostrará preparación, cantidad final, fecha/hora y responsable.
- La disponibilidad consolidada de una preparación no elimina el historial de eventos que la generaron.
- CONTADORA mantiene acceso de solo lectura según la matriz de permisos.

### Resultado esperado

El usuario obtiene el historial autorizado de producciones.

### Excepciones

- Sin resultados.
- Actor sin permiso.

### Criterios de aceptación

- COCINA puede consultar producciones.
- Se visualizan fecha, cantidad y responsable.
- Las producciones repetidas aparecen como eventos trazables aunque el stock preparado esté acumulado.

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
| **Estado** | **Definido** |

### Descripción

El sistema deberá registrar el medio de pago utilizado en la venta.

### Precondiciones

- Venta válida.

### Entradas

- Medio de pago.
- Información adicional requerida por el medio cuando corresponda.

### Procesamiento y reglas

- El catálogo mínimo del MVP soportará `EFECTIVO` y `QR`, confirmados por la evidencia.
- Nuevos medios podrán incorporarse mediante refinamiento sin alterar esta baseline.
- PedidosYa se mantiene como canal/control separado en el cierre y no se fuerza como medio de pago equivalente a efectivo/QR.

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
| **Actor(es)** | Sistema, iniciado por MESERO/ENCARGADO/ADMINISTRADOR |
| **Fuente** | SRS §13.2 / ENT-02 |
| **Necesidad relacionada** | N-004, N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

Al confirmar una venta, el sistema deberá registrar la salida de inventario correspondiente al elemento vendido.

### Precondiciones

- Venta válida y lista para confirmarse.
- Elementos comercializables identificados.

### Entradas

- Detalle de venta.
- Cantidades.
- Existencias correspondientes.

### Procesamiento y reglas

- La afectación definitiva se produce al confirmar/cobrar la venta.
- Si el elemento es una preparación producida previamente, se reduce su **existencia preparada** y no se vuelven a consumir los ingredientes ya descontados en producción.
- Si el elemento se descuenta directamente de inventario, se registra el movimiento correspondiente.
- El stock insuficiente advierte pero no bloquea según `RF-020`.

### Resultado esperado

La venta y sus movimientos quedan confirmados de forma consistente.

### Excepciones

- Error de persistencia.
- Elemento inexistente.
- Regla de inventario incompatible.

### Criterios de aceptación

- Confirmar una venta produce el movimiento correspondiente.
- Un pedido todavía no confirmado no genera salida definitiva.
- Vender una preparación producida no descuenta nuevamente sus ingredientes.
- La disponibilidad preparada puede quedar negativa si la venta continúa tras la advertencia permitida.

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
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, COCINA según el ámbito confirmado |
| **Fuente** | N-006 / N-007 / ENT-02 |
| **Necesidad relacionada** | N-006, N-007, N-008, N-014 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar compras de productos o insumos manteniendo proveedor, detalle, costos, responsable y estado.

### Precondiciones

- Actor autenticado con permiso.
- Proveedor y elementos identificados.

### Entradas

- Proveedor.
- Fecha.
- Detalle de elementos.
- Cantidades.
- Costos.
- Total.
- Referencia al respaldo/recibo cuando corresponda, sin imponer todavía un formato digital específico.

### Procesamiento y reglas

- Una compra nueva inicia `PENDIENTE`.
- `COCINA` puede registrar directamente compras de ingredientes para preparaciones; la operación debe estar respaldada por un recibo, sin que esta baseline imponga todavía cómo se digitaliza o referencia dicho respaldo.
- `ENCARGADO` gestiona principalmente bebidas, productos de limpieza y otros insumos generales.
- `ADMINISTRADOR` mantiene gestión general.
- Registrar una compra no incrementa inventario por sí solo.

### Resultado esperado

La compra queda registrada y trazable, pendiente de su recepción o cancelación.

### Excepciones

- Actor sin permiso.
- Proveedor inexistente.
- Datos o cantidades inválidas.

### Criterios de aceptación

- COCINA puede registrar una compra de ingredientes de cocina.
- ENCARGADO puede registrar compras generales.
- Se conserva responsable y, para las compras directas de Cocina, la existencia del recibo de respaldo según el mecanismo que se defina en diseño.
- La compra `PENDIENTE` no modifica stock.

---

## RF-041 — Gestionar estado de compra

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, COCINA según el ámbito confirmado |
| **Fuente** | SRS §14 / ENT-02 |
| **Necesidad relacionada** | N-006, N-007, N-008 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá gestionar el estado de una compra utilizando `PENDIENTE`, `RECIBIDA` o `CANCELADA`.

### Precondiciones

- Compra existente.
- Actor autorizado.

### Entradas

- Compra.
- Nuevo estado permitido.

### Procesamiento y reglas

- `PENDIENTE` no incrementa inventario.
- `RECIBIDA` solo se establece después de verificar/aceptar la recepción.
- `CANCELADA` no incrementa inventario.
- Una compra incompleta/no aceptada no se marcará `RECIBIDA`; se coordina devolución con el proveedor.

### Resultado esperado

La compra refleja un estado coherente con su situación operativa.

### Excepciones

- Transición inválida.
- Actor sin permiso.

### Criterios de aceptación

- Una compra puede permanecer pendiente hasta ser aceptada.
- Una compra devuelta/no aceptada no genera entrada de stock.
- Solo `RECIBIDA` habilita la entrada definitiva.

---

## RF-042 — Registrar recepción de compra

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, COCINA según el ámbito de la compra |
| **Fuente** | SRS §14 / ENT-02 |
| **Necesidad relacionada** | N-006, N-007, N-008, N-014 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar que una compra fue verificada y aceptada antes de considerarla recibida.

### Precondiciones

- Compra `PENDIENTE`.
- Actor autorizado para su ámbito.

### Entradas

- Compra.
- Confirmación de recepción/verificación.
- Fecha/hora.
- Responsable.

### Procesamiento y reglas

- Para bebidas u otros insumos generales, la entrada puede realizarse después de verificar el producto recibido.
- Para insumos de cocina que requieren control, Cocina podrá verificar peso/cantidad y realizar el porcionado operativo antes de registrar la entrada.
- Si el pedido llega incompleto o no puede aceptarse, se coordina devolución y no se confirma `RECIBIDA`.
- El MVP no requiere recepción parcial estructurada; este caso queda diferido salvo cambio de alcance.

### Resultado esperado

La compra queda aceptada como `RECIBIDA` y disponible para generar la entrada de inventario.

### Excepciones

- Compra no pendiente.
- Producto no aceptado.
- Actor sin permiso.

### Criterios de aceptación

- La recepción conserva fecha y responsable.
- Una compra incompleta devuelta no se marca recibida.
- La recepción parcial no es obligatoria en el MVP.

---

## RF-043 — Incrementar inventario al recibir compra

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema |
| **Fuente** | SRS §14 / ENT-02 |
| **Necesidad relacionada** | N-004, N-006, N-008 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

Al confirmar una compra como `RECIBIDA`, el sistema deberá generar las entradas de inventario correspondientes a los elementos aceptados.

### Precondiciones

- Compra verificada y aceptada.
- Elementos inventariables identificados.

### Entradas

- Detalle de compra recibida.
- Cantidades aceptadas.

### Procesamiento y reglas

- `PENDIENTE` y `CANCELADA` no modifican inventario.
- La entrada ocurre después de la verificación operativa aplicable.
- Los movimientos conservan referencia a la compra y responsable de recepción.

### Resultado esperado

Las existencias aumentan y existe trazabilidad entre compra, recepción y movimiento.

### Excepciones

- Elemento no inventariable/inexistente.
- Error de persistencia: no debe dejar una recepción parcialmente aplicada.

### Criterios de aceptación

- `RECIBIDA` incrementa stock una sola vez.
- La entrada puede rastrearse hasta la compra.
- Una compra pendiente no altera existencias.

---

## RF-044 — Consultar historial de compras

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, CONTADORA; COCINA dentro de su alcance |
| **Fuente** | N-006 / N-008 / ENT-02 |
| **Necesidad relacionada** | N-006, N-008 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir consultar las compras registradas, sus estados, proveedor, responsable y recepción.

### Precondiciones

- Usuario autenticado con permiso.

### Entradas

- Filtros disponibles: periodo, proveedor, estado u otros que se definan.

### Procesamiento y reglas

- CONTADORA puede consultar sin modificar.
- COCINA consulta las compras correspondientes a su ámbito operativo.
- El historial conserva compras pendientes, recibidas y canceladas.

### Resultado esperado

El usuario obtiene el historial autorizado de compras.

### Excepciones

- Sin resultados.
- Actor sin permiso.

### Criterios de aceptación

- Se distingue el estado de cada compra.
- Se muestra proveedor y responsable.
- La recepción puede rastrearse desde la compra.

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
| **Actor(es)** | ADMINISTRADOR, ENCARGADO; MESERO opera dentro de su turno |
| **Fuente** | SRS §17 / ENT-02 |
| **Necesidad relacionada** | N-009, N-011, N-014 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá representar los dos turnos operativos de Fratelli y la continuidad entre ellos dentro de una **misma caja** y un **único cierre final**.

### Precondiciones

- Usuarios/roles disponibles.

### Entradas

- Identificación del turno.
- Usuarios asignados cuando corresponda.
- Monto inicial/fondo dejado para continuidad.
- Información de traspaso entre turnos.

### Procesamiento y reglas

- Las personas conocen el turno al que están asignadas.
- Los dos turnos comparten la misma caja.
- El primer turno no realiza un cierre independiente; deja información para que el siguiente verifique continuidad.
- La evidencia de ENT-02 indica que el traspaso actual puede mencionar efectivo, QR, crédito y PedidosYa.
- El crédito se conserva únicamente como antecedente del proceso actual: **las ventas a crédito y cuentas por cobrar están fuera del MVP**, por lo que este requisito no deberá generar ni administrar saldos de crédito.

### Resultado esperado

Las operaciones pueden asociarse al turno que las originó sin crear dos cajas o cierres independientes.

### Excepciones

- Turno inexistente.
- Usuario sin permiso para gestionar la configuración del turno.

### Criterios de aceptación

- Se pueden distinguir operaciones del turno mañana y noche.
- Ambos turnos pertenecen a la misma continuidad de caja.
- Existe un único cierre final para el flujo confirmado.

---

## RF-053 — Asociar operaciones al turno

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema / usuarios operativos |
| **Fuente** | SRS §17 / ENT-02 |
| **Necesidad relacionada** | N-009, N-011, N-014 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá asociar las operaciones relevantes al turno en que se realizaron para permitir consulta, traspaso y cierre.

### Precondiciones

- Turno identificado.
- Operación válida.

### Entradas

- Venta, gasto u otra operación aplicable.
- Turno.
- Responsable.
- Medio/canal cuando corresponda.

### Procesamiento y reglas

- Una venta conserva su turno y responsable.
- Los gastos aplicables pueden asociarse al turno.
- El registro mantiene el medio de pago/canal necesario para el cierre.
- El traspaso entre turnos no cambia retroactivamente el turno de origen de una operación.

### Resultado esperado

Existe información suficiente para obtener resúmenes por turno y el cierre único.

### Excepciones

- Turno inexistente.
- Operación incompatible.

### Criterios de aceptación

- Las operaciones pueden filtrarse por turno.
- Un gasto asociado aparece en el contexto correspondiente.
- No se mezclan indebidamente los orígenes al realizar el traspaso.

---

## RF-054 — Preparar información esperada de cierre

| Campo | Valor |
|---|---|
| **Actor(es)** | Sistema |
| **Fuente** | SRS §17 / ENT-02 |
| **Necesidad relacionada** | N-009, N-011 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá preparar el resumen operativo necesario para el único cierre de caja utilizando la información registrada durante ambos turnos.

### Precondiciones

- Continuidad de caja existente.
- Operaciones registradas.

### Entradas

- Monto inicial/fondo.
- Ventas por medio de pago.
- Gastos asociados.
- Información de caja chica cuando corresponda.
- PedidosYa como canal separado.
- Efectivo declarado/real cuando sea registrado.

### Procesamiento y reglas

- Se distinguen al menos efectivo y QR.
- PedidosYa se muestra/controla por separado y no se mezcla automáticamente con efectivo o QR.
- Los gastos se presentan como parte de la conciliación operativa definida.
- Si se dispone de efectivo real/declarado, puede determinarse la diferencia frente a lo esperado.
- La caja chica se mantiene diferenciada cuando actúe como fondo separado.
- No se inventan reglas de contabilidad o facturación no relevadas.

### Resultado esperado

El usuario autorizado dispone de un resumen verificable para realizar el cierre final.

### Excepciones

- Datos operativos inconsistentes: el sistema deberá mostrarlos o impedir una confirmación corrupta, sin inventar valores.

### Criterios de aceptación

- El resumen distingue efectivo, QR y PedidosYa cuando existan.
- Incluye los gastos registrados aplicables.
- Conserva el monto inicial/fondo.
- Permite identificar una diferencia cuando se registra el efectivo real.

---

## RF-055 — Registrar cierre de turno o caja

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO |
| **Fuente** | Permisos aprobados / ENT-02 |
| **Necesidad relacionada** | N-009, N-011, N-014 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir registrar el **único cierre final** de la caja compartida por los dos turnos, únicamente a usuarios con rol `ADMINISTRADOR` o `ENCARGADO`.

### Precondiciones

- Usuario con permiso.
- Información del cierre disponible.

### Entradas

- Resumen de cierre.
- Valores declarados que correspondan.
- Diferencia y observación cuando exista.
- Responsable.

### Procesamiento y reglas

- Operativamente el `ENCARGADO` realiza el cierre.
- `ADMINISTRADOR` conserva permiso general.
- MESERO no puede cerrar por el rol MESERO; si el mismo usuario posee `ENCARGADO`, puede hacerlo por dicho rol.
- Si falta o sobra dinero, se conserva una observación/trazabilidad de la diferencia.
- `CONTADORA` revisa posteriormente el cierre, pero su aprobación no es condición para registrarlo.
- El cierre conserva responsable y no se duplica por turno.

### Resultado esperado

El cierre único queda persistido con sus datos y responsable.

### Excepciones

- Actor sin permiso.
- Datos de cierre inconsistentes.
- Intento de registrar un segundo cierre sobre la misma continuidad sin una regla autorizada.

### Criterios de aceptación

- ENCARGADO y ADMINISTRADOR pueden cerrar.
- MESERO sin ENCARGADO no puede cerrar.
- Se registra un único cierre final.
- Una diferencia puede conservar observación.
- El cierre no requiere aprobación posterior de CONTADORA.

---

## RF-056 — Consultar cierre

| Campo | Valor |
|---|---|
| **Actor(es)** | ADMINISTRADOR, ENCARGADO, CONTADORA |
| **Fuente** | MVP / matriz de permisos / ENT-02 |
| **Necesidad relacionada** | N-010, N-011 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Descripción

El sistema deberá permitir consultar los cierres registrados y la información utilizada para su revisión.

### Precondiciones

- Usuario autorizado.

### Entradas

- Periodo u otros filtros disponibles.

### Procesamiento y reglas

- CONTADORA tendrá acceso de consulta y revisión, no una aprobación obligatoria del cierre.
- La consulta no concede permiso de modificación por sí sola.
- El responsable, diferencias/observaciones y componentes principales del cierre deberán permanecer visibles según permisos.

### Resultado esperado

El usuario puede revisar el cierre y sus datos persistidos.

### Excepciones

- Sin resultados.
- Actor sin permiso.

### Criterios de aceptación

- CONTADORA puede consultar cierres.
- El responsable del cierre es visible.
- Las diferencias registradas pueden revisarse.
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
| `RF-021`–`RF-024` | Producción y existencias preparadas |
| `RF-025`–`RF-030` | Pedidos y comandas |
| `RF-031`–`RF-037` | Ventas |
| `RF-038` | Clientes |
| `RF-039`–`RF-044` | Proveedores y compras |
| `RF-045`–`RF-046` | Gastos |
| `RF-047`–`RF-051` | Asistencia |
| `RF-052`–`RF-056` | Turnos y cierre |
| `RF-057`–`RF-059` | Reportes |

---

# 6. Requisitos con aspectos diferidos o condicionales

La entrevista de refinamiento resolvió las reglas que mantenían bloqueadas las historias `HU-004`, `HU-007`, `HU-017`, `HU-025`, `HU-026` y `HU-027`. Por tanto, **ninguno de sus RF conserva un bloqueo informativo crítico para volver a Backlog**.

Los aspectos siguientes permanecen abiertos porque dependen de nuevos casos, decisiones Post-MVP o ampliaciones de alcance:

| RF | Aspecto diferido/condicional |
|---|---|
| `RF-010`, `RF-022` | Nuevas conversiones de unidades si aparecen ingredientes con unidades no cubiertas por la baseline |
| `RF-014` | Taxonomía más amplia de motivos de baja, si el negocio la necesita |
| `RF-033` | Catálogo de medios de pago adicionales; `EFECTIVO` y `QR` están confirmados, mientras PedidosYa se trata como canal separado en cierre |
| `RF-040`–`RF-043` | Cuentas por pagar, pagos parciales y recepción parcial estructurada quedan fuera del flujo básico MVP |
| `RF-054`–`RF-056` | Conciliación bancaria/contable avanzada e integración directa con PedidosYa quedan fuera del MVP |

Estos puntos **no deben utilizarse para mantener las seis HU en `Blocked`**. El paso `Backlog → Ready` será decidido aplicando la Definition of Ready en el refinamiento Scrum.

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
- distingue los aspectos diferidos de los bloqueos reales de la baseline.

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
| `0.2` | 21/08/2026 | Refinamiento con ENT-02: unidades, producción, compras, turnos y cierre definidos; se elimina gestión de lotes múltiples del MVP | Revalidada para Backlog |
