# 07 — Product Backlog

## 1. Propósito

Este documento define el **Product Backlog inicial** de **Restaurant System** para el restaurante **Fratelli**.

Su objetivo es transformar la baseline de análisis y requisitos en elementos de producto ordenados, trazables y estimables:

```text
Problema
   ↓
Necesidades
   ↓
Objetivos
   ↓
Alcance / MVP
   ↓
SRS
   ↓
RF + RNF + RN
   ↓
Épicas
   ↓
Historias de usuario
   ↓
Priorización
   ↓
Product Backlog
```

El Product Backlog incluye:

- historias pertenecientes al MVP;
- historias conocidas de Post-MVP;
- prioridad MoSCoW;
- orden relativo;
- Story Points;
- dependencias;
- estado de refinamiento;
- trazabilidad hacia necesidades, RF, RNF y reglas de negocio;
- criterios de aceptación iniciales.

Las historias individuales se desarrollarán posteriormente en:

```text
docs/historias/
```

Este documento funciona como **catálogo maestro** y no sustituye el refinamiento detallado de cada historia crítica.

---

## 2. Estado documental

| Campo                      | Valor                         |
| -------------------------- | ----------------------------- |
| **Documento**              | `07-product-backlog.md`       |
| **Proyecto**               | Restaurant System             |
| **Organización objetivo**  | Restaurante Fratelli          |
| **Versión inicial**        | `0.1`                         |
| **Estado**                 | Product Backlog inicial       |
| **Fecha**                  | 20 de agosto de 2026          |
| **Product Owner**          | Ana Paola Viscarra Chambi     |
| **Scrum Master**           | Alex Saúl Fernandez Valdez    |
| **Baseline de requisitos** | `06-srs.md` + `requirements/` |
| **Método de prioridad**    | MoSCoW + orden del backlog    |
| **Método de estimación**   | Story Points Fibonacci        |
| **Alcance**                | MVP + Post-MVP conocido       |

---

# 3. Condiciones de entrada

Antes de construir este backlog ya se dispone de:

- problema consolidado;
- necesidades identificadas;
- objetivos y propuesta de valor;
- MVP delimitado;
- SRS;
- actores;
- requisitos funcionales;
- requisitos no funcionales;
- reglas de negocio;
- restricciones;
- dependencias principales;
- funcionalidades fuera del MVP identificadas.

Por tanto, existe información suficiente para crear un Product Backlog inicial sin inventar funcionalidades ajenas a la evidencia o al alcance aprobado.

---

# 4. Método de priorización

## 4.1. MoSCoW

Se utilizarán las siguientes categorías:

| Prioridad  | Significado                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| **MUST**   | Necesaria para la baseline actual del MVP o para habilitar capacidades críticas                                            |
| **SHOULD** | Incluida en el objetivo del MVP, pero puede ser candidata a replanificación únicamente mediante cambio de alcance aprobado |
| **COULD**  | Mejora útil que no condiciona la validación del núcleo                                                                     |
| **WON'T**  | Conocida, pero explícitamente fuera de esta entrega                                                                        |

### Importante

`SHOULD` no significa que una historia haya sido eliminada del MVP.

Significa que, ante una contingencia real de tiempo, constituye una candidata de menor prioridad relativa frente a los `MUST`.

Cualquier traslado de una historia del MVP a Post-MVP deberá:

1. registrarse como cambio de alcance;
2. analizar impacto;
3. actualizar trazabilidad;
4. validarse con Product Owner.

---

## 4.2. Orden del backlog

Además de MoSCoW, las historias se ordenan considerando:

```text
valor
+
dependencias
+
riesgo
+
impacto
+
necesidad de habilitar otras historias
```

El número de orden no representa una fecha exacta de implementación.

---

# 5. Método de estimación

Se utilizarán **Story Points relativos** con escala Fibonacci:

```text
1
2
3
5
8
13
```

Interpretación de referencia:

|   SP | Lectura inicial                       |
| ---: | ------------------------------------- |
|  `1` | Muy pequeña                           |
|  `2` | Pequeña                               |
|  `3` | Moderada                              |
|  `5` | Considerable                          |
|  `8` | Grande                                |
| `13` | Demasiado grande; candidata a dividir |

Los Story Points:

- no representan horas;
- no son una promesa de duración;
- son una estimación relativa inicial;
- podrán cambiar durante refinamiento;
- no se utilizarán todavía para inferir velocidad del equipo porque no existe historial de Sprint.

---

# 6. Estados de refinamiento

| Estado                     | Significado                                                         |
| -------------------------- | ------------------------------------------------------------------- |
| **CANDIDATA A READY**      | Tiene información suficiente para refinamiento final y revisión DoR |
| **REFINAMIENTO REQUERIDO** | Pertenece al backlog, pero tiene reglas o decisiones pendientes     |
| **POST-MVP**               | Conocida y trazable, pero fuera de la primera entrega               |

Ninguna historia se considera formalmente `READY` en este documento.

La Definition of Ready se consolidará posteriormente en la documentación Scrum/refinamiento.

---

# 7. Épicas

## EPI-01 — Acceso y administración de usuarios

### Valor

Permitir que cada persona opere con una identidad individual y únicamente con las capacidades asociadas a sus responsabilidades.

### Necesidades relacionadas

- `N-010`
- `N-013`
- `N-014`

### RF principales

- `RF-001`–`RF-006`

---

## EPI-02 — Catálogo e inventario

### Valor

Mantener productos, ingredientes, platos y existencias en una fuente central, con movimientos trazables y detección de stock bajo.

### Necesidades relacionadas

- `N-004`
- `N-005`
- `N-011`
- `N-014`

### RF principales

- `RF-007`–`RF-020`

---

## EPI-03 — Producción y lotes

### Valor

Registrar directamente la producción, consumir ingredientes y mantener los platos/preparaciones producidos separados mediante lotes.

### Necesidades relacionadas

- `N-003`
- `N-004`

### RF principales

- `RF-010`
- `RF-021`–`RF-024`

---

## EPI-04 — Atención, pedidos y comandas

### Valor

Permitir que atención y cocina coordinen el ciclo del pedido sin perder su estado operativo.

### Necesidades relacionadas

- `N-011`

### RF principales

- `RF-025`–`RF-030`

---

## EPI-05 — Ventas y clientes

### Valor

Registrar y confirmar ventas, asociar clientes cuando corresponda y mantener la relación con inventario y turno.

### Necesidades relacionadas

- `N-004`
- `N-005`
- `N-010`
- `N-011`
- `N-014`

### RF principales

- `RF-020`
- `RF-031`–`RF-038`

---

## EPI-06 — Proveedores y compras

### Valor

Centralizar proveedores y compras, registrando la recepción y su efecto sobre inventario.

### Necesidades relacionadas

- `N-006`
- `N-007`
- `N-008`
- `N-014`

### RF principales

- `RF-039`–`RF-044`

---

## EPI-07 — Gastos y control operativo

### Valor

Sustituir el cuaderno como fuente principal de gastos diarios y disponer de información utilizable para caja.

### Necesidades relacionadas

- `N-009`
- `N-014`

### RF principales

- `RF-045`
- `RF-046`

---

## EPI-08 — Asistencia del personal

### Valor

Registrar entradas y salidas de forma centralizada y proporcionar información confiable para consulta personal y administrativa.

### Necesidades relacionadas

- `N-001`
- `N-002`

### RF principales

- `RF-047`–`RF-051`

---

## EPI-09 — Turnos y cierre de caja

### Valor

Agrupar operaciones por turno y permitir que los responsables autorizados realicen y consulten cierres.

### Necesidades relacionadas

- `N-009`
- `N-010`
- `N-011`
- `N-013`
- `N-014`

### RF principales

- `RF-052`–`RF-056`

---

## EPI-10 — Información y reportes

### Valor

Permitir acceso directo a la información mínima requerida para ventas, inventario y asistencia según permisos.

### Necesidades relacionadas

- `N-001`
- `N-002`
- `N-004`
- `N-005`
- `N-010`
- `N-011`

### RF principales

- `RF-057`–`RF-059`

---

# 8. Product Backlog — MVP

## HU-001 — Iniciar y cerrar sesión

| Campo            | Valor                                       |
| ---------------- | ------------------------------------------- |
| **Épica**        | `EPI-01`                                    |
| **Rol**          | Usuario del sistema                         |
| **Prioridad**    | **MUST**                                    |
| **Story Points** | `3`                                         |
| **Estado**       | **CANDIDATA A READY**                       |
| **RF**           | `RF-001`, `RF-002`                          |
| **RNF**          | `RNF-SEG-001`, `RNF-SEG-004`, `RNF-SEG-006` |
| **RN**           | —                                           |
| **Necesidades**  | `N-013`                                     |
| **Dependencias** | Ninguna funcional previa                    |

### Historia

> **Como usuario del sistema, quiero autenticarme y cerrar mi sesión para acceder de forma controlada a las funciones correspondientes a mis responsabilidades.**

### Beneficio

Proteger el acceso y establecer una identidad para las operaciones posteriores.

### Criterios de aceptación iniciales

- con credenciales válidas puede iniciar sesión;
- con credenciales inválidas el acceso es rechazado;
- una cuenta inactiva no puede autenticarse;
- al cerrar sesión se pierde el acceso autenticado;
- no se expone información sensible en los mensajes de error.

---

## HU-002 — Administrar usuarios y múltiples roles

| Campo            | Valor                                       |
| ---------------- | ------------------------------------------- |
| **Épica**        | `EPI-01`                                    |
| **Rol**          | ADMINISTRADOR                               |
| **Prioridad**    | **MUST**                                    |
| **Story Points** | `5`                                         |
| **Estado**       | **CANDIDATA A READY**                       |
| **RF**           | `RF-003`, `RF-004`, `RF-005`, `RF-006`      |
| **RNF**          | `RNF-SEG-002`, `RNF-SEG-003`, `RNF-AUD-001` |
| **RN**           | `RN-017`, `RN-019`, `RN-020`, `RN-021`      |
| **Necesidades**  | `N-010`, `N-013`, `N-014`                   |
| **Dependencias** | `HU-001`                                    |

### Historia

> **Como administrador, quiero gestionar cuentas y asignar uno o más roles a cada usuario para controlar las responsabilidades y permisos dentro del sistema.**

### Beneficio

Mantener acceso diferenciado y trazabilidad individual.

### Criterios de aceptación iniciales

- solo ADMINISTRADOR puede gestionar cuentas y roles;
- una cuenta puede poseer varios roles;
- los permisos efectivos combinan los roles asignados;
- desactivar una cuenta no elimina su historial;
- una operación no autorizada se rechaza también desde backend.

---

## HU-003 — Gestionar productos, ingredientes y platos

| Campo            | Valor                                            |
| ---------------- | ------------------------------------------------ |
| **Épica**        | `EPI-02`                                         |
| **Rol**          | ADMINISTRADOR / ENCARGADO                        |
| **Prioridad**    | **MUST**                                         |
| **Story Points** | `5`                                              |
| **Estado**       | **CANDIDATA A READY**                            |
| **RF**           | `RF-007`, `RF-008`, `RF-009`, `RF-011`, `RF-012` |
| **RNF**          | `RNF-INT-005`, `RNF-AUD-001`                     |
| **RN**           | `RN-026`                                         |
| **Necesidades**  | `N-004`, `N-011`, `N-013`                        |
| **Dependencias** | `HU-001`, `HU-002`                               |

### Historia

> **Como encargado, quiero administrar productos, ingredientes y platos para mantener actualizado el catálogo utilizado por los procesos operativos.**

### Beneficio

Disponer de una fuente central para ventas, inventario y producción.

### Criterios de aceptación iniciales

- ADMINISTRADOR y ENCARGADO pueden gestionar elementos;
- los roles de consulta no pueden modificarlos;
- los elementos pueden desactivarse sin borrar el histórico;
- los precios vigentes pueden actualizarse sin modificar ventas históricas;
- MESERO y COCINA pueden consultar el catálogo autorizado.

---

## HU-004 — Definir composición de platos y preparaciones

| Campo            | Valor                                          |
| ---------------- | ---------------------------------------------- |
| **Épica**        | `EPI-02`, `EPI-03`                             |
| **Rol**          | ADMINISTRADOR / ENCARGADO                      |
| **Prioridad**    | **MUST**                                       |
| **Story Points** | `5`                                            |
| **Estado**       | **REFINAMIENTO REQUERIDO**                     |
| **RF**           | `RF-010`                                       |
| **RNF**          | `RNF-INT-002`                                  |
| **RN**           | `RN-006`, `RN-008`                             |
| **Necesidades**  | `N-003`, `N-004`                               |
| **Dependencias** | `HU-003`                                       |
| **Bloqueo**      | Unidades y conversiones cuando sean necesarias |

### Historia

> **Como encargado, quiero definir los ingredientes y cantidades que componen una preparación para que la producción pueda calcular el consumo de insumos.**

### Beneficio

Relacionar producción con inventario sin transcripción manual posterior.

### Criterios de aceptación iniciales

- una composición identifica preparación, ingredientes y cantidades;
- no puede utilizar ingredientes inexistentes;
- la composición puede consultarse antes de producir;
- no se inventarán conversiones de unidades no validadas;
- las historias dependientes no serán Ready mientras una conversión necesaria siga sin definir.

---

## HU-005 — Registrar movimientos y consultar existencias

| Campo            | Valor                                            |
| ---------------- | ------------------------------------------------ |
| **Épica**        | `EPI-02`                                         |
| **Rol**          | ADMINISTRADOR / ENCARGADO                        |
| **Prioridad**    | **MUST**                                         |
| **Story Points** | `5`                                              |
| **Estado**       | **CANDIDATA A READY**                            |
| **RF**           | `RF-013`, `RF-014`, `RF-015`, `RF-018`, `RF-019` |
| **RNF**          | `RNF-INT-002`, `RNF-AUD-003`                     |
| **RN**           | `RN-005`, `RN-017`, `RN-026`                     |
| **Necesidades**  | `N-004`, `N-014`                                 |
| **Dependencias** | `HU-003`                                         |

### Historia

> **Como encargado, quiero registrar y consultar movimientos de inventario para conocer las existencias y el origen de sus variaciones.**

### Beneficio

Mejorar la consistencia y trazabilidad del inventario.

### Criterios de aceptación iniciales

- una entrada aumenta existencias;
- una salida/baja reduce existencias;
- cada movimiento registra tipo, cantidad, fecha y origen;
- los saldos negativos se muestran sin corregirse a cero;
- el historial permanece disponible aunque un elemento sea desactivado.

---

## HU-006 — Configurar y visualizar stock bajo

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **Épica**        | `EPI-02`                           |
| **Rol**          | ADMINISTRADOR / ENCARGADO / COCINA |
| **Prioridad**    | **MUST**                           |
| **Story Points** | `3`                                |
| **Estado**       | **CANDIDATA A READY**              |
| **RF**           | `RF-016`, `RF-017`                 |
| **RNF**          | `RNF-USA-003`                      |
| **RN**           | `RN-005`, `RN-026`                 |
| **Necesidades**  | `N-005`                            |
| **Dependencias** | `HU-003`, `HU-005`                 |

### Historia

> **Como responsable operativo, quiero identificar existencias que alcanzaron su stock mínimo para actuar antes de que el faltante pase inadvertido.**

### Beneficio

Facilitar la detección oportuna de necesidades de reposición.

### Criterios de aceptación iniciales

- ADMINISTRADOR y ENCARGADO pueden configurar stock mínimo;
- se considera stock bajo cuando `existencia <= stock mínimo`;
- un saldo negativo también aparece como stock bajo;
- COCINA puede consultar las alertas;
- el MVP usa alertas internas y no exige correo, SMS o WhatsApp.

---

## HU-007 — Registrar producción y generar lote

| Campo            | Valor                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| **Épica**        | `EPI-03`                                                                |
| **Rol**          | COCINA / ENCARGADO / ADMINISTRADOR                                      |
| **Prioridad**    | **MUST**                                                                |
| **Story Points** | `8`                                                                     |
| **Estado**       | **REFINAMIENTO REQUERIDO**                                              |
| **RF**           | `RF-021`, `RF-022`, `RF-023`                                            |
| **RNF**          | `RNF-INT-001`, `RNF-INT-002`, `RNF-INT-003`                             |
| **RN**           | `RN-006`, `RN-007`, `RN-008`                                            |
| **Necesidades**  | `N-003`, `N-004`                                                        |
| **Dependencias** | `HU-004`, `HU-005`                                                      |
| **Bloqueo**      | Rendimiento, unidades, mermas/desperdicios y reglas de lotes aplicables |

### Historia

> **Como personal de cocina, quiero registrar directamente una producción para descontar los ingredientes correspondientes y generar el lote preparado.**

### Beneficio

Eliminar la secuencia hoja manual → transcripción posterior y mantener separados ingredientes y platos producidos.

### Criterios de aceptación iniciales

- COCINA puede registrar una producción;
- confirmar producción consume los ingredientes definidos;
- se genera un lote con la cantidad producida;
- la operación conserva responsable y fecha;
- si ocurre un error, no queda una producción parcialmente aplicada;
- no se duplica el consumo de ingredientes durante la venta posterior.

---

## HU-008 — Consultar producción y lotes

| Campo            | Valor                                          |
| ---------------- | ---------------------------------------------- |
| **Épica**        | `EPI-03`                                       |
| **Rol**          | COCINA / ENCARGADO / ADMINISTRADOR / CONTADORA |
| **Prioridad**    | **SHOULD**                                     |
| **Story Points** | `3`                                            |
| **Estado**       | **CANDIDATA A READY**                          |
| **RF**           | `RF-024`                                       |
| **RNF**          | `RNF-AUD-001`, `RNF-AUD-002`                   |
| **RN**           | `RN-007`                                       |
| **Necesidades**  | `N-003`, `N-004`                               |
| **Dependencias** | `HU-007`                                       |

### Historia

> **Como usuario autorizado, quiero consultar las producciones y lotes registrados para revisar qué se produjo, cuánto y quién realizó la operación.**

### Beneficio

Dar visibilidad a la producción registrada.

### Criterios de aceptación iniciales

- se visualizan fecha, cantidad, preparación y responsable;
- se distingue producción de lote;
- COCINA puede consultar sus procesos;
- CONTADORA mantiene acceso de solo lectura;
- la consulta no modifica inventario.

---

## HU-009 — Registrar y gestionar pedidos

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **Épica**        | `EPI-04`                           |
| **Rol**          | MESERO / ENCARGADO / ADMINISTRADOR |
| **Prioridad**    | **MUST**                           |
| **Story Points** | `5`                                |
| **Estado**       | **CANDIDATA A READY**              |
| **RF**           | `RF-025`, `RF-026`                 |
| **RNF**          | `RNF-CON-003`, `RNF-USA-003`       |
| **RN**           | `RN-001`, `RN-003`                 |
| **Necesidades**  | `N-011`                            |
| **Dependencias** | `HU-003`, `HU-001`                 |

### Historia

> **Como mesero, quiero registrar y seguir el estado de un pedido para coordinar la atención del cliente con cocina.**

### Beneficio

Preservar una capacidad operativa crítica del restaurante.

### Criterios de aceptación iniciales

- un nuevo pedido inicia `PENDIENTE`;
- puede pasar por los estados definidos;
- no se aceptan transiciones arbitrarias;
- crear el pedido no descuenta definitivamente inventario;
- el pedido conserva al usuario responsable.

---

## HU-010 — Generar y gestionar comandas de cocina

| Campo            | Valor                        |
| ---------------- | ---------------------------- |
| **Épica**        | `EPI-04`                     |
| **Rol**          | COCINA / MESERO              |
| **Prioridad**    | **MUST**                     |
| **Story Points** | `5`                          |
| **Estado**       | **CANDIDATA A READY**        |
| **RF**           | `RF-028`, `RF-029`, `RF-030` |
| **RNF**          | `RNF-CON-003`, `RNF-USA-003` |
| **RN**           | `RN-002`, `RN-003`           |
| **Necesidades**  | `N-011`                      |
| **Dependencias** | `HU-009`                     |

### Historia

> **Como personal de cocina, quiero recibir las comandas y actualizar su estado para coordinar la preparación con el personal de atención.**

### Beneficio

Mantener el flujo pedido → cocina → entrega.

### Criterios de aceptación iniciales

- una comanda generada inicia `PENDIENTE`;
- COCINA puede pasarla a `EN_PREPARACION` y `LISTA`;
- MESERO puede consultar el estado sin gestionarlo por ese rol;
- la comanda conserva referencia al pedido;
- transiciones no autorizadas son rechazadas.

---

## HU-011 — Cancelar pedido antes de que esté listo

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **Épica**        | `EPI-04`                           |
| **Rol**          | MESERO / ENCARGADO / ADMINISTRADOR |
| **Prioridad**    | **MUST**                           |
| **Story Points** | `2`                                |
| **Estado**       | **CANDIDATA A READY**              |
| **RF**           | `RF-027`, `RF-029`                 |
| **RNF**          | `RNF-CON-003`, `RNF-USA-004`       |
| **RN**           | `RN-003`                           |
| **Necesidades**  | `N-011`                            |
| **Dependencias** | `HU-009`, `HU-010`                 |

### Historia

> **Como usuario autorizado, quiero cancelar un pedido que todavía no está listo para detener correctamente una atención que no debe continuar.**

### Beneficio

Evitar operaciones inválidas y mantener coherencia con cocina.

### Criterios de aceptación iniciales

- puede cancelarse desde `PENDIENTE`;
- puede cancelarse desde `EN_PREPARACION`;
- no se permite cancelación ordinaria desde `LISTO/LISTA`;
- la cancelación queda trazada;
- pedido y comanda mantienen estados coherentes.

---

## HU-012 — Registrar y confirmar una venta

| Campo            | Valor                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| **Épica**        | `EPI-05`                                                                  |
| **Rol**          | MESERO / ENCARGADO / ADMINISTRADOR                                        |
| **Prioridad**    | **MUST**                                                                  |
| **Story Points** | `8`                                                                       |
| **Estado**       | **CANDIDATA A READY**                                                     |
| **RF**           | `RF-031`, `RF-032`, `RF-033`, `RF-035`, `RF-036`                          |
| **RNF**          | `RNF-INT-001`, `RNF-CON-001`, `RNF-AUD-001`                               |
| **RN**           | `RN-004`, `RN-005`, `RN-008`, `RN-015`                                    |
| **Necesidades**  | `N-004`, `N-011`, `N-014`                                                 |
| **Dependencias** | `HU-003`, `HU-005`, `HU-009`; `HU-007` para elementos producidos por lote |

### Historia

> **Como mesero, quiero registrar y confirmar una venta para cobrar la operación y reflejarla en inventario y turno.**

### Beneficio

Cubrir el núcleo comercial necesario para el reemplazo operacional.

### Criterios de aceptación iniciales

- calcula el total usando las líneas de venta;
- registra el medio de pago;
- confirmar la venta genera la afectación de inventario;
- la venta conserva responsable y turno;
- no genera facturación fiscal;
- una falla no deja inventario y venta en estados parciales.

---

## HU-013 — Continuar venta con stock insuficiente

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **Épica**        | `EPI-05`                           |
| **Rol**          | MESERO / ENCARGADO / ADMINISTRADOR |
| **Prioridad**    | **MUST**                           |
| **Story Points** | `2`                                |
| **Estado**       | **CANDIDATA A READY**              |
| **RF**           | `RF-020`, `RF-035`, `RF-036`       |
| **RNF**          | `RNF-INT-004`, `RNF-USA-004`       |
| **RN**           | `RN-005`                           |
| **Necesidades**  | `N-004`, `N-005`                   |
| **Dependencias** | `HU-005`, `HU-012`                 |

### Historia

> **Como usuario de ventas, quiero recibir una advertencia cuando no exista stock suficiente y poder continuar para reflejar una venta que operativamente sí se realizará.**

### Beneficio

Representar la operación real y permitir regularizar el inventario posteriormente.

### Criterios de aceptación iniciales

- el sistema advierte antes de confirmar;
- la advertencia no bloquea;
- el usuario puede desistir o continuar;
- si continúa, el saldo puede quedar negativo;
- el saldo negativo se mantiene visible y trazable.

---

## HU-014 — Gestionar clientes básicos y asociarlos a ventas

| Campo            | Valor                              |
| ---------------- | ---------------------------------- |
| **Épica**        | `EPI-05`                           |
| **Rol**          | MESERO / ENCARGADO / ADMINISTRADOR |
| **Prioridad**    | **SHOULD**                         |
| **Story Points** | `3`                                |
| **Estado**       | **CANDIDATA A READY**              |
| **RF**           | `RF-034`, `RF-038`                 |
| **RNF**          | `RNF-PRI-001`                      |
| **RN**           | `RN-013`, `RN-014`                 |
| **Necesidades**  | `N-011`                            |
| **Dependencias** | `HU-001`                           |

### Historia

> **Como mesero, quiero registrar o seleccionar un cliente y asociarlo opcionalmente a una venta para conservar esa relación cuando sea necesaria.**

### Beneficio

Mantener la capacidad básica de clientes sin ampliar el MVP a créditos.

### Criterios de aceptación iniciales

- puede registrarse un cliente básico;
- puede consultarse;
- una venta puede asociarlo;
- una venta también es válida sin cliente;
- no se habilitan cuentas por cobrar ni venta a crédito.

---

## HU-015 — Consultar ventas del alcance autorizado

| Campo            | Valor                                          |
| ---------------- | ---------------------------------------------- |
| **Épica**        | `EPI-05`                                       |
| **Rol**          | MESERO / ENCARGADO / ADMINISTRADOR / CONTADORA |
| **Prioridad**    | **SHOULD**                                     |
| **Story Points** | `3`                                            |
| **Estado**       | **CANDIDATA A READY**                          |
| **RF**           | `RF-037`                                       |
| **RNF**          | `RNF-SEG-002`, `RNF-AUD-001`                   |
| **RN**           | `RN-020`, `RN-025`                             |
| **Necesidades**  | `N-010`, `N-011`, `N-013`                      |
| **Dependencias** | `HU-012`, `HU-002`                             |

### Historia

> **Como usuario autorizado, quiero consultar el historial de ventas dentro de mi alcance para revisar las operaciones correspondientes a mi responsabilidad.**

### Beneficio

Dar acceso directo sin exponer información no autorizada.

### Criterios de aceptación iniciales

- MESERO ve solo ventas de su turno;
- ENCARGADO y ADMINISTRADOR acceden al alcance general autorizado;
- CONTADORA consulta sin modificar;
- un intento directo de consultar otro turno sin permiso es rechazado.

---

## HU-016 — Gestionar proveedores

| Campo            | Valor                     |
| ---------------- | ------------------------- |
| **Épica**        | `EPI-06`                  |
| **Rol**          | ADMINISTRADOR / ENCARGADO |
| **Prioridad**    | **MUST**                  |
| **Story Points** | `3`                       |
| **Estado**       | **CANDIDATA A READY**     |
| **RF**           | `RF-039`                  |
| **RNF**          | `RNF-INT-005`             |
| **RN**           | `RN-027`                  |
| **Necesidades**  | `N-006`, `N-008`          |
| **Dependencias** | `HU-001`, `HU-002`        |

### Historia

> **Como encargado, quiero gestionar proveedores para asociarlos a las compras y centralizar su información básica.**

### Beneficio

Reducir la dispersión de información de proveedores.

### Criterios de aceptación iniciales

- ADMINISTRADOR y ENCARGADO gestionan proveedores;
- COCINA y CONTADORA pueden consultar según permisos;
- un proveedor puede asociarse a una compra;
- desactivar un proveedor no elimina el historial existente.

---

## HU-017 — Registrar una compra

| Campo            | Valor                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| **Épica**        | `EPI-06`                                                               |
| **Rol**          | ENCARGADO / ADMINISTRADOR / COCINA autorizada                          |
| **Prioridad**    | **MUST**                                                               |
| **Story Points** | `5`                                                                    |
| **Estado**       | **REFINAMIENTO REQUERIDO**                                             |
| **RF**           | `RF-040`, `RF-041`                                                     |
| **RNF**          | `RNF-AUD-001`, `RNF-USA-003`                                           |
| **RN**           | `RN-009`, `RN-010`, `RN-027`                                           |
| **Necesidades**  | `N-006`, `N-007`, `N-008`, `N-014`                                     |
| **Dependencias** | `HU-003`, `HU-016`                                                     |
| **Bloqueo**      | Delimitación exacta de categorías/autorizaciones de compra para COCINA |

### Historia

> **Como responsable autorizado, quiero registrar una compra asociada a un proveedor para centralizar su seguimiento desde que queda pendiente.**

### Beneficio

Sustituir parte del manejo distribuido de compras.

### Criterios de aceptación iniciales

- una compra nueva queda `PENDIENTE`;
- registra proveedor, detalle, cantidades, costos y responsable;
- una compra pendiente no incrementa inventario;
- COCINA solo gestiona compras de su ámbito autorizado;
- no se inventan categorías de autorización pendientes de validar.

---

## HU-018 — Recibir una compra e incrementar inventario

| Campo            | Valor                                         |
| ---------------- | --------------------------------------------- |
| **Épica**        | `EPI-06`                                      |
| **Rol**          | ENCARGADO / ADMINISTRADOR / COCINA autorizada |
| **Prioridad**    | **MUST**                                      |
| **Story Points** | `5`                                           |
| **Estado**       | **CANDIDATA A READY**                         |
| **RF**           | `RF-042`, `RF-043`                            |
| **RNF**          | `RNF-INT-001`, `RNF-INT-002`                  |
| **RN**           | `RN-009`, `RN-010`, `RN-027`                  |
| **Necesidades**  | `N-004`, `N-006`, `N-008`                     |
| **Dependencias** | `HU-005`, `HU-017`                            |

### Historia

> **Como responsable de compras, quiero confirmar la recepción de una compra para incorporar los insumos recibidos al inventario.**

### Beneficio

Relacionar compras reales con existencias.

### Criterios de aceptación iniciales

- solo `RECIBIDA` incrementa stock;
- `PENDIENTE` no incrementa;
- `CANCELADA` no incrementa;
- se generan movimientos trazables;
- recepción parcial no forma parte de esta baseline.

---

## HU-019 — Consultar historial de compras

| Campo            | Valor                                                     |
| ---------------- | --------------------------------------------------------- |
| **Épica**        | `EPI-06`                                                  |
| **Rol**          | ENCARGADO / ADMINISTRADOR / CONTADORA / COCINA autorizada |
| **Prioridad**    | **SHOULD**                                                |
| **Story Points** | `3`                                                       |
| **Estado**       | **CANDIDATA A READY**                                     |
| **RF**           | `RF-044`                                                  |
| **RNF**          | `RNF-AUD-001`, `RNF-AUD-002`                              |
| **RN**           | `RN-027`                                                  |
| **Necesidades**  | `N-006`, `N-008`                                          |
| **Dependencias** | `HU-017`                                                  |

### Historia

> **Como usuario autorizado, quiero consultar las compras registradas para conocer su estado, proveedor y responsable.**

### Beneficio

Centralizar consulta de compras.

### Criterios de aceptación iniciales

- distingue pendientes, recibidas y canceladas;
- permite consultar proveedor y responsable;
- CONTADORA dispone de solo lectura;
- COCINA respeta el alcance autorizado.

---

## HU-020 — Registrar gastos diarios

| Campo            | Valor                        |
| ---------------- | ---------------------------- |
| **Épica**        | `EPI-07`                     |
| **Rol**          | ENCARGADO / ADMINISTRADOR    |
| **Prioridad**    | **MUST**                     |
| **Story Points** | `3`                          |
| **Estado**       | **CANDIDATA A READY**        |
| **RF**           | `RF-045`                     |
| **RNF**          | `RNF-AUD-001`, `RNF-AUD-002` |
| **RN**           | `RN-017`, `RN-020`, `RN-022` |
| **Necesidades**  | `N-009`, `N-014`             |
| **Dependencias** | `HU-001`, `HU-002`           |

### Historia

> **Como encargado, quiero registrar gastos diarios para evitar que el cuaderno sea la única fuente principal de esa información.**

### Beneficio

Centralizar gastos operativos.

### Criterios de aceptación iniciales

- solo ADMINISTRADOR o ENCARGADO puede registrar;
- conserva fecha, concepto, monto y responsable;
- MESERO sin ENCARGADO no puede registrar;
- si corresponde, puede asociarse al turno;
- un usuario con múltiples roles obtiene el permiso si posee ENCARGADO.

---

## HU-021 — Consultar gastos registrados

| Campo            | Valor                                 |
| ---------------- | ------------------------------------- |
| **Épica**        | `EPI-07`                              |
| **Rol**          | ENCARGADO / ADMINISTRADOR / CONTADORA |
| **Prioridad**    | **SHOULD**                            |
| **Story Points** | `2`                                   |
| **Estado**       | **CANDIDATA A READY**                 |
| **RF**           | `RF-046`                              |
| **RNF**          | `RNF-AUD-001`                         |
| **RN**           | `RN-022`                              |
| **Necesidades**  | `N-009`                               |
| **Dependencias** | `HU-020`                              |

### Historia

> **Como usuario administrativo autorizado, quiero consultar los gastos registrados para revisar los movimientos operativos correspondientes.**

### Beneficio

Facilitar consulta sin recurrir al registro manual anterior.

### Criterios de aceptación iniciales

- se muestra monto, fecha y responsable;
- CONTADORA puede consultar sin editar;
- pueden utilizarse filtros disponibles;
- un usuario no autorizado no accede.

---

## HU-022 — Registrar entrada y salida de asistencia

| Campo            | Valor                                      |
| ---------------- | ------------------------------------------ |
| **Épica**        | `EPI-08`                                   |
| **Rol**          | Trabajador                                 |
| **Prioridad**    | **MUST**                                   |
| **Story Points** | `5`                                        |
| **Estado**       | **CANDIDATA A READY**                      |
| **RF**           | `RF-047`, `RF-048`, `RF-049`               |
| **RNF**          | `RNF-CON-001`, `RNF-PRI-002`, `RNF-HW-001` |
| **RN**           | `RN-011`, `RN-012`, `RN-018`               |
| **Necesidades**  | `N-001`, `N-002`                           |
| **Dependencias** | `HU-001`, `HU-002`                         |

### Historia

> **Como trabajador, quiero registrar mi entrada y salida para disponer de una asistencia centralizada y consistente.**

### Beneficio

Reducir dependencia de la planilla física.

### Criterios de aceptación iniciales

- puede marcar entrada si no tiene una abierta;
- no puede marcar una segunda entrada abierta;
- solo puede registrar salida si existe una entrada abierta;
- la salida cierra la asistencia;
- el flujo funciona sin hardware biométrico.

---

## HU-023 — Consultar mi historial de asistencia

| Campo            | Valor                 |
| ---------------- | --------------------- |
| **Épica**        | `EPI-08`              |
| **Rol**          | Trabajador            |
| **Prioridad**    | **SHOULD**            |
| **Story Points** | `2`                   |
| **Estado**       | **CANDIDATA A READY** |
| **RF**           | `RF-050`              |
| **RNF**          | `RNF-SEG-002`         |
| **RN**           | `RN-020`              |
| **Necesidades**  | `N-001`, `N-002`      |
| **Dependencias** | `HU-022`              |

### Historia

> **Como trabajador, quiero consultar mi propia asistencia para revisar mis entradas y salidas registradas.**

### Beneficio

Dar acceso directo a la información personal de asistencia.

### Criterios de aceptación iniciales

- un trabajador consulta únicamente sus registros por su rol base;
- puede filtrar por el periodo disponible;
- un rol adicional autorizado puede ampliar el alcance;
- no puede acceder a asistencia ajena sin permiso.

---

## HU-024 — Consultar asistencia de trabajadores

| Campo            | Valor                                 |
| ---------------- | ------------------------------------- |
| **Épica**        | `EPI-08`                              |
| **Rol**          | ADMINISTRADOR / ENCARGADO / CONTADORA |
| **Prioridad**    | **MUST**                              |
| **Story Points** | `3`                                   |
| **Estado**       | **CANDIDATA A READY**                 |
| **RF**           | `RF-051`                              |
| **RNF**          | `RNF-SEG-002`, `RNF-AUD-001`          |
| **RN**           | `RN-020`                              |
| **Necesidades**  | `N-001`, `N-002`, `N-010`             |
| **Dependencias** | `HU-022`                              |

### Historia

> **Como contadora, quiero consultar la asistencia de los trabajadores para disponer de información centralizada que apoye el control administrativo.**

### Beneficio

Reducir la transcripción desde planillas físicas.

### Criterios de aceptación iniciales

- CONTADORA puede consultar asistencia general;
- ENCARGADO y ADMINISTRADOR también;
- MESERO sin otro rol no accede a asistencia general;
- la consulta no implementa nómina completa.

---

## HU-025 — Gestionar y operar turnos

| Campo            | Valor                                                      |
| ---------------- | ---------------------------------------------------------- |
| **Épica**        | `EPI-09`                                                   |
| **Rol**          | ENCARGADO / ADMINISTRADOR / MESERO                         |
| **Prioridad**    | **MUST**                                                   |
| **Story Points** | `5`                                                        |
| **Estado**       | **REFINAMIENTO REQUERIDO**                                 |
| **RF**           | `RF-052`, `RF-053`                                         |
| **RNF**          | `RNF-AUD-001`, `RNF-INT-001`                               |
| **RN**           | `RN-020`, `RN-025`                                         |
| **Necesidades**  | `N-009`, `N-011`, `N-014`                                  |
| **Dependencias** | `HU-012`, `HU-020`                                         |
| **Bloqueo**      | Reglas exactas de apertura y relación entre los dos turnos |

### Historia

> **Como encargado, quiero gestionar los turnos y asociarles las operaciones correspondientes para disponer de la base necesaria para el cierre.**

### Beneficio

Agrupar ventas y gastos por contexto operativo.

### Criterios de aceptación iniciales

- las ventas quedan asociadas a un turno;
- los gastos aplicables pueden asociarse al turno;
- MESERO opera dentro de su turno;
- MESERO no administra otros turnos por ese rol;
- no se inventarán reglas de apertura pendientes.

---

## HU-026 — Calcular información esperada del cierre

| Campo            | Valor                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| **Épica**        | `EPI-09`                                                                  |
| **Rol**          | ENCARGADO / ADMINISTRADOR                                                 |
| **Prioridad**    | **MUST**                                                                  |
| **Story Points** | `5`                                                                       |
| **Estado**       | **REFINAMIENTO REQUERIDO**                                                |
| **RF**           | `RF-054`                                                                  |
| **RNF**          | `RNF-INT-001`, `RNF-REC-001`                                              |
| **RN**           | `RN-016`, `RN-023`                                                        |
| **Necesidades**  | `N-009`, `N-011`                                                          |
| **Dependencias** | `HU-025`                                                                  |
| **Bloqueo**      | Monto inicial, diferencias, faltantes/sobrantes, PedidosYa y cierre total |

### Historia

> **Como encargado, quiero consultar el resumen esperado del turno para disponer de la información necesaria antes de registrar el cierre.**

### Beneficio

Centralizar el cálculo del cierre a partir de operaciones registradas.

### Criterios de aceptación iniciales

- incluye ventas registradas del turno;
- distingue medios de pago definidos;
- considera gastos asociados según la regla aprobada;
- no utiliza fórmulas inventadas para componentes pendientes;
- el cálculo debe quedar consistente con las operaciones del turno.

---

## HU-027 — Registrar cierre de turno/caja

| Campo            | Valor                                       |
| ---------------- | ------------------------------------------- |
| **Épica**        | `EPI-09`                                    |
| **Rol**          | ENCARGADO / ADMINISTRADOR                   |
| **Prioridad**    | **MUST**                                    |
| **Story Points** | `5`                                         |
| **Estado**       | **REFINAMIENTO REQUERIDO**                  |
| **RF**           | `RF-055`                                    |
| **RNF**          | `RNF-INT-001`, `RNF-CON-001`, `RNF-AUD-001` |
| **RN**           | `RN-016`, `RN-020`, `RN-023`, `RN-024`      |
| **Necesidades**  | `N-009`, `N-011`, `N-013`, `N-014`          |
| **Dependencias** | `HU-026`                                    |
| **Bloqueo**      | Reglas operativas de cierre aún pendientes  |

### Historia

> **Como encargado, quiero registrar el cierre del turno/caja para consolidar las operaciones bajo responsabilidad de un usuario autorizado.**

### Beneficio

Preservar una capacidad crítica del sistema actual y centralizar el cierre.

### Criterios de aceptación iniciales

- ADMINISTRADOR puede cerrar;
- ENCARGADO puede cerrar;
- MESERO sin ENCARGADO no puede cerrar;
- MESERO + ENCARGADO sí puede cerrar;
- conserva usuario responsable;
- un error no deja el cierre parcialmente aplicado.

---

## HU-028 — Consultar cierres registrados

| Campo            | Valor                                 |
| ---------------- | ------------------------------------- |
| **Épica**        | `EPI-09`                              |
| **Rol**          | ADMINISTRADOR / ENCARGADO / CONTADORA |
| **Prioridad**    | **SHOULD**                            |
| **Story Points** | `2`                                   |
| **Estado**       | **CANDIDATA A READY**                 |
| **RF**           | `RF-056`                              |
| **RNF**          | `RNF-AUD-001`, `RNF-AUD-002`          |
| **RN**           | `RN-016`, `RN-023`                    |
| **Necesidades**  | `N-010`, `N-011`                      |
| **Dependencias** | `HU-027`                              |

### Historia

> **Como usuario administrativo autorizado, quiero consultar cierres registrados para revisar su resumen, turno y responsable.**

### Beneficio

Dar acceso directo a la información histórica de caja.

### Criterios de aceptación iniciales

- CONTADORA puede consultar;
- se muestra responsable;
- se identifica el turno;
- la consulta no concede permisos de modificación.

---

## HU-029 — Consultar reporte de ventas

| Campo            | Valor                                          |
| ---------------- | ---------------------------------------------- |
| **Épica**        | `EPI-10`                                       |
| **Rol**          | ADMINISTRADOR / ENCARGADO / CONTADORA / MESERO |
| **Prioridad**    | **SHOULD**                                     |
| **Story Points** | `3`                                            |
| **Estado**       | **CANDIDATA A READY**                          |
| **RF**           | `RF-057`                                       |
| **RNF**          | `RNF-SEG-002`, `RNF-USA-001`                   |
| **RN**           | `RN-020`, `RN-025`                             |
| **Necesidades**  | `N-010`, `N-011`                               |
| **Dependencias** | `HU-012`, `HU-025`                             |

### Historia

> **Como usuario autorizado, quiero consultar un reporte de ventas para acceder directamente a la información comercial dentro de mi alcance.**

### Beneficio

Reducir dependencia de intermediarios para reportes.

### Criterios de aceptación iniciales

- permite consulta por periodo/turno según filtros disponibles;
- MESERO ve solo su turno;
- ENCARGADO y ADMINISTRADOR acceden al alcance general autorizado;
- CONTADORA dispone de consulta;
- no exige exportación externa.

---

## HU-030 — Consultar reporte de inventario y stock bajo

| Campo            | Valor                                          |
| ---------------- | ---------------------------------------------- |
| **Épica**        | `EPI-10`                                       |
| **Rol**          | ADMINISTRADOR / ENCARGADO / COCINA / CONTADORA |
| **Prioridad**    | **SHOULD**                                     |
| **Story Points** | `3`                                            |
| **Estado**       | **CANDIDATA A READY**                          |
| **RF**           | `RF-058`                                       |
| **RNF**          | `RNF-USA-001`, `RNF-INT-004`                   |
| **RN**           | `RN-005`, `RN-026`                             |
| **Necesidades**  | `N-004`, `N-005`, `N-010`                      |
| **Dependencias** | `HU-005`, `HU-006`                             |

### Historia

> **Como usuario autorizado, quiero consultar un reporte de inventario y stock bajo para identificar existencias y productos que requieren atención.**

### Beneficio

Facilitar control y anticipación de faltantes.

### Criterios de aceptación iniciales

- COCINA puede consultar;
- muestra existencias;
- muestra stock bajo;
- refleja saldos negativos;
- usuarios no autorizados no acceden.

---

## HU-031 — Consultar reporte de asistencia

| Campo            | Valor                                              |
| ---------------- | -------------------------------------------------- |
| **Épica**        | `EPI-10`                                           |
| **Rol**          | ADMINISTRADOR / ENCARGADO / CONTADORA / Trabajador |
| **Prioridad**    | **SHOULD**                                         |
| **Story Points** | `3`                                                |
| **Estado**       | **CANDIDATA A READY**                              |
| **RF**           | `RF-059`                                           |
| **RNF**          | `RNF-SEG-002`, `RNF-USA-001`                       |
| **RN**           | `RN-020`                                           |
| **Necesidades**  | `N-001`, `N-002`, `N-010`                          |
| **Dependencias** | `HU-022`                                           |

### Historia

> **Como usuario autorizado, quiero consultar un reporte de asistencia para revisar entradas y salidas según mi nivel de acceso.**

### Beneficio

Dar acceso directo a la información de asistencia.

### Criterios de aceptación iniciales

- CONTADORA, ENCARGADO y ADMINISTRADOR pueden consultar información general;
- trabajador base consulta únicamente su propia información;
- respeta roles acumulados;
- permite consultar por periodo;
- no implementa nómina completa.

---

# 9. Product Backlog — Post-MVP conocido

Las siguientes historias se registran para preservar la visión de producto, pero reciben prioridad:

```text
WON'T — esta entrega
```

No deberán incorporarse silenciosamente al MVP.

---

## HU-032 — Emitir facturación fiscal

| Campo            | Valor                                    |
| ---------------- | ---------------------------------------- |
| **Épica**        | `EPI-05`                                 |
| **Prioridad**    | **WON'T**                                |
| **Story Points** | No estimada todavía                      |
| **Estado**       | **POST-MVP**                             |
| **Origen**       | Restricción `RN-015`                     |
| **Dependencias** | Ventas + investigación técnica/normativa |

### Historia

> **Como responsable autorizado, quiero emitir la facturación fiscal correspondiente a una venta para cumplir el proceso tributario aplicable.**

### Pendiente antes de refinamiento

- normativa;
- contratos/API;
- flujos de emisión;
- contingencias;
- datos fiscales.

---

## HU-033 — Gestionar ventas a crédito y cuentas por cobrar

| Campo            | Valor                                   |
| ---------------- | --------------------------------------- |
| **Épica**        | `EPI-05`                                |
| **Prioridad**    | **WON'T**                               |
| **Story Points** | No estimada                             |
| **Estado**       | **POST-MVP**                            |
| **Origen**       | `RN-014` / capacidad existente conocida |
| **Dependencias** | Clientes + ventas + reglas de crédito   |

### Historia

> **Como responsable administrativo, quiero gestionar crédito y cuentas por cobrar de clientes para controlar obligaciones pendientes.**

### Pendiente

Reglas completas de crédito, pagos, vencimientos y autorización.

---

## HU-034 — Registrar asistencia mediante biométrico físico

| Campo            | Valor                                 |
| ---------------- | ------------------------------------- |
| **Épica**        | `EPI-08`                              |
| **Prioridad**    | **WON'T**                             |
| **Story Points** | No estimada                           |
| **Estado**       | **POST-MVP**                          |
| **Origen**       | Propuesta de Product Owner / `RN-018` |
| **Dependencias** | Asistencia software + hardware/SDK    |

### Historia

> **Como trabajador, quiero identificarme mediante un lector biométrico para registrar mi asistencia utilizando el dispositivo físico previsto.**

### Pendiente

- dispositivo;
- SDK;
- modelo de integración;
- tratamiento de datos biométricos;
- seguridad y privacidad.

---

## HU-035 — Imprimir comprobantes mediante impresora térmica

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| **Épica**        | Evolución de ventas            |
| **Prioridad**    | **WON'T**                      |
| **Story Points** | No estimada                    |
| **Estado**       | **POST-MVP**                   |
| **Origen**       | Alcance futuro conocido        |
| **Dependencias** | Ventas + `HardwareIntegration` |

### Historia

> **Como usuario de ventas, quiero imprimir un comprobante operativo mediante una impresora térmica para entregar o conservar el registro físico correspondiente.**

### Pendiente

Modelo, protocolo, formato y reglas de impresión.

---

## HU-036 — Calcular nómina a partir de asistencia

| Campo            | Valor                          |
| ---------------- | ------------------------------ |
| **Épica**        | Evolución administrativa       |
| **Prioridad**    | **WON'T**                      |
| **Story Points** | No estimada                    |
| **Estado**       | **POST-MVP**                   |
| **Origen**       | `N-002` / alcance diferido     |
| **Dependencias** | Asistencia + reglas salariales |

### Historia

> **Como contadora, quiero utilizar los registros de asistencia para calcular pagos al personal dentro del sistema.**

### Pendiente

- atrasos;
- faltas;
- horas extra;
- turnos especiales;
- valor de horas;
- descuentos.

---

## HU-037 — Gestionar cuentas por pagar avanzadas a proveedores

| Campo            | Valor                      |
| ---------------- | -------------------------- |
| **Épica**        | `EPI-06`                   |
| **Prioridad**    | **WON'T**                  |
| **Story Points** | No estimada                |
| **Estado**       | **POST-MVP**               |
| **Origen**       | `N-008` / alcance diferido |
| **Dependencias** | Proveedores + compras      |

### Historia

> **Como responsable administrativo, quiero gestionar obligaciones y pagos pendientes a proveedores para centralizar las cuentas por pagar.**

### Pendiente

Crédito, cuotas, vencimientos, pagos parciales y conciliación.

---

## HU-038 — Incorporar reportería avanzada

| Campo            | Valor                                              |
| ---------------- | -------------------------------------------------- |
| **Épica**        | `EPI-10`                                           |
| **Prioridad**    | **WON'T**                                          |
| **Story Points** | No estimada                                        |
| **Estado**       | **POST-MVP**                                       |
| **Origen**       | Alcance diferido                                   |
| **Dependencias** | Datos estabilizados + nuevas necesidades validadas |

### Historia

> **Como usuario administrativo, quiero disponer de reportes adicionales para analizar información que no forma parte de los tres reportes mínimos del MVP.**

### Pendiente

Cada nuevo reporte deberá tener necesidad, actor, campos, filtros y objetivo validados.

---

## HU-039 — Incorporar backup y restauración

| Campo            | Valor                                   |
| ---------------- | --------------------------------------- |
| **Épica**        | Evolución técnica/operativa             |
| **Prioridad**    | **WON'T**                               |
| **Story Points** | No estimada                             |
| **Estado**       | **POST-MVP**                            |
| **Origen**       | Decisión RNF: fuera del MVP             |
| **Dependencias** | Arquitectura y estrategia de despliegue |

### Historia

> **Como responsable del sistema, quiero disponer de mecanismos de respaldo y restauración para reducir el riesgo de pérdida de información en uso productivo.**

### Observación

No es criterio de aceptación del MVP actual.

---

# 10. Vista resumida y ordenada del MVP

| Orden | HU       | Historia                                      | Épica         | MoSCoW |  SP | Estado                 |
| ----: | -------- | --------------------------------------------- | ------------- | ------ | --: | ---------------------- |
|     1 | `HU-001` | Iniciar y cerrar sesión                       | EPI-01        | MUST   |   3 | Candidata a Ready      |
|     2 | `HU-002` | Administrar usuarios y múltiples roles        | EPI-01        | MUST   |   5 | Candidata a Ready      |
|     3 | `HU-003` | Gestionar productos, ingredientes y platos    | EPI-02        | MUST   |   5 | Candidata a Ready      |
|     4 | `HU-005` | Registrar movimientos y consultar existencias | EPI-02        | MUST   |   5 | Candidata a Ready      |
|     5 | `HU-006` | Configurar y visualizar stock bajo            | EPI-02        | MUST   |   3 | Candidata a Ready      |
|     6 | `HU-004` | Definir composición de platos/preparaciones   | EPI-02/EPI-03 | MUST   |   5 | Refinamiento requerido |
|     7 | `HU-007` | Registrar producción y generar lote           | EPI-03        | MUST   |   8 | Refinamiento requerido |
|     8 | `HU-008` | Consultar producción y lotes                  | EPI-03        | SHOULD |   3 | Candidata a Ready      |
|     9 | `HU-009` | Registrar y gestionar pedidos                 | EPI-04        | MUST   |   5 | Candidata a Ready      |
|    10 | `HU-010` | Generar y gestionar comandas                  | EPI-04        | MUST   |   5 | Candidata a Ready      |
|    11 | `HU-011` | Cancelar pedido antes de listo                | EPI-04        | MUST   |   2 | Candidata a Ready      |
|    12 | `HU-012` | Registrar y confirmar venta                   | EPI-05        | MUST   |   8 | Candidata a Ready      |
|    13 | `HU-013` | Continuar venta con stock insuficiente        | EPI-05        | MUST   |   2 | Candidata a Ready      |
|    14 | `HU-014` | Gestionar clientes básicos                    | EPI-05        | SHOULD |   3 | Candidata a Ready      |
|    15 | `HU-015` | Consultar historial de ventas                 | EPI-05        | SHOULD |   3 | Candidata a Ready      |
|    16 | `HU-016` | Gestionar proveedores                         | EPI-06        | MUST   |   3 | Candidata a Ready      |
|    17 | `HU-017` | Registrar compra                              | EPI-06        | MUST   |   5 | Refinamiento requerido |
|    18 | `HU-018` | Recibir compra e incrementar inventario       | EPI-06        | MUST   |   5 | Candidata a Ready      |
|    19 | `HU-019` | Consultar historial de compras                | EPI-06        | SHOULD |   3 | Candidata a Ready      |
|    20 | `HU-020` | Registrar gastos diarios                      | EPI-07        | MUST   |   3 | Candidata a Ready      |
|    21 | `HU-021` | Consultar gastos                              | EPI-07        | SHOULD |   2 | Candidata a Ready      |
|    22 | `HU-022` | Registrar entrada y salida                    | EPI-08        | MUST   |   5 | Candidata a Ready      |
|    23 | `HU-023` | Consultar mi asistencia                       | EPI-08        | SHOULD |   2 | Candidata a Ready      |
|    24 | `HU-024` | Consultar asistencia de trabajadores          | EPI-08        | MUST   |   3 | Candidata a Ready      |
|    25 | `HU-025` | Gestionar y operar turnos                     | EPI-09        | MUST   |   5 | Refinamiento requerido |
|    26 | `HU-026` | Calcular información esperada de cierre       | EPI-09        | MUST   |   5 | Refinamiento requerido |
|    27 | `HU-027` | Registrar cierre de turno/caja                | EPI-09        | MUST   |   5 | Refinamiento requerido |
|    28 | `HU-028` | Consultar cierres                             | EPI-09        | SHOULD |   2 | Candidata a Ready      |
|    29 | `HU-029` | Reporte de ventas                             | EPI-10        | SHOULD |   3 | Candidata a Ready      |
|    30 | `HU-030` | Reporte de inventario                         | EPI-10        | SHOULD |   3 | Candidata a Ready      |
|    31 | `HU-031` | Reporte de asistencia                         | EPI-10        | SHOULD |   3 | Candidata a Ready      |

---

# 11. Resumen Post-MVP

| HU       | Historia                      | Prioridad | Estado   |
| -------- | ----------------------------- | --------- | -------- |
| `HU-032` | Facturación fiscal            | WON'T     | Post-MVP |
| `HU-033` | Crédito y cuentas por cobrar  | WON'T     | Post-MVP |
| `HU-034` | Integración biométrica física | WON'T     | Post-MVP |
| `HU-035` | Impresora térmica             | WON'T     | Post-MVP |
| `HU-036` | Nómina completa               | WON'T     | Post-MVP |
| `HU-037` | Cuentas por pagar avanzadas   | WON'T     | Post-MVP |
| `HU-038` | Reportería avanzada           | WON'T     | Post-MVP |
| `HU-039` | Backup y restauración         | WON'T     | Post-MVP |

---

# 12. Dependencias principales

```text
HU-001 Autenticación
   ↓
HU-002 Usuarios / roles
   ↓
Permisos del resto del sistema
```

```text
HU-003 Catálogo
   ↓
HU-005 Inventario
   ├── HU-006 Alertas
   ├── HU-004 Composición
   │      ↓
   │   HU-007 Producción / lote
   │
   └── HU-012 Venta
```

```text
HU-009 Pedido
   ↓
HU-010 Comanda
   ↓
HU-012 Venta
```

```text
HU-016 Proveedores
   ↓
HU-017 Compra
   ↓
HU-018 Recepción
   ↓
HU-005 Inventario
```

```text
HU-012 Ventas
HU-020 Gastos
      ↓
HU-025 Turnos
      ↓
HU-026 Cálculo cierre
      ↓
HU-027 Cierre
```

```text
HU-022 Asistencia
   ├── HU-023 Consulta personal
   ├── HU-024 Consulta administrativa
   └── HU-031 Reporte asistencia
```

---

# 13. Historias actualmente bloqueadas o con refinamiento obligatorio

| HU       | Motivo                                               | Acción necesaria                             |
| -------- | ---------------------------------------------------- | -------------------------------------------- |
| `HU-004` | Unidades/conversiones                                | Refinar reglas que realmente sean utilizadas |
| `HU-007` | Rendimiento, mermas, unidades y lotes                | Consulta y definición antes de Ready         |
| `HU-017` | Alcance exacto de compras autorizadas a COCINA       | Precisar categorías/responsabilidades        |
| `HU-025` | Apertura y relación de los dos turnos                | Consulta mediante Product Owner              |
| `HU-026` | Monto inicial, diferencias, PedidosYa y cierre total | Consulta mediante Product Owner              |
| `HU-027` | Depende de reglas definitivas de cierre              | Resolver `HU-026` y reglas relacionadas      |

Estas historias permanecen dentro del MVP.

El estado `REFINAMIENTO REQUERIDO` evita tratarlas como listas para desarrollo antes de tiempo.

---

# 14. Historias críticas

Se consideran inicialmente críticas por valor, dependencia o riesgo:

| HU       | Razón                                        |
| -------- | -------------------------------------------- |
| `HU-001` | Habilita toda operación autenticada          |
| `HU-002` | Habilita control de roles/permisos           |
| `HU-003` | Base de catálogo                             |
| `HU-005` | Base de inventario                           |
| `HU-007` | Responde a doble captura y afecta inventario |
| `HU-009` | Inicio del flujo pedido/comanda              |
| `HU-010` | Coordinación atención/cocina                 |
| `HU-012` | Núcleo comercial                             |
| `HU-017` | Centralización de compras                    |
| `HU-018` | Integración compra/inventario                |
| `HU-022` | Necesidad prioritaria de asistencia          |
| `HU-025` | Habilita cierre                              |
| `HU-026` | Alto riesgo por reglas pendientes            |
| `HU-027` | Capacidad operativa crítica existente        |

Estas historias deberán recibir refinamiento especialmente cuidadoso antes de Sprint Planning.

---

# 15. Revisión INVEST inicial

La revisión INVEST se aplica al nivel adecuado para una baseline inicial.

## Independent

No todas las historias son técnicamente independientes porque existen dependencias reales del dominio.

Estas dependencias se documentan explícitamente en lugar de ocultarse.

## Negotiable

Las historias describen valor y comportamiento esperado sin imponer todavía decisiones de arquitectura no aprobadas.

## Valuable

Cada historia del MVP se relaciona con:

- una necesidad;
- una capacidad necesaria para preservar la operación;
- o una dependencia necesaria para habilitar valor.

## Estimable

Las historias del MVP reciben Story Points iniciales.

Las historias con reglas pendientes siguen siendo estimables de manera aproximada, pero su estimación deberá revisarse después del refinamiento.

## Small

No se incluyen historias con `13 SP`.

Las historias estimadas en `8 SP` deberán revisarse especialmente durante refinamiento y dividirse si su implementación real resulta demasiado amplia.

## Testable

Cada historia posee criterios de aceptación iniciales y trazabilidad hacia RF/RN/RNF.

---

# 16. Trazabilidad necesidad → historias

| Necesidad | Historias principales                                                |
| --------- | -------------------------------------------------------------------- |
| `N-001`   | `HU-022`, `HU-023`, `HU-024`, `HU-031`                               |
| `N-002`   | `HU-022`, `HU-023`, `HU-024`, `HU-031`, futuro `HU-036`              |
| `N-003`   | `HU-004`, `HU-007`, `HU-008`                                         |
| `N-004`   | `HU-003`, `HU-005`, `HU-007`, `HU-012`, `HU-013`, `HU-018`, `HU-030` |
| `N-005`   | `HU-006`, `HU-013`, `HU-030`                                         |
| `N-006`   | `HU-016`, `HU-017`, `HU-018`, `HU-019`                               |
| `N-007`   | `HU-017`, `HU-019`                                                   |
| `N-008`   | `HU-016`, `HU-017`, `HU-018`, `HU-019`, futuro `HU-037`              |
| `N-009`   | `HU-020`, `HU-021`, `HU-025`, `HU-026`, `HU-027`                     |
| `N-010`   | `HU-002`, `HU-015`, `HU-024`, `HU-028`, `HU-029`, `HU-030`, `HU-031` |
| `N-011`   | `HU-003`, `HU-009`–`HU-016`, `HU-025`–`HU-030`                       |
| `N-012`   | Cobertura transversal de la solución independiente                   |
| `N-013`   | `HU-001`, `HU-002` y permisos transversales                          |
| `N-014`   | `HU-002`, `HU-005`, `HU-012`, `HU-017`, `HU-020`, `HU-025`, `HU-027` |

---

# 17. Trazabilidad épica → historias

| Épica    | Historias MVP                          |
| -------- | -------------------------------------- |
| `EPI-01` | `HU-001`, `HU-002`                     |
| `EPI-02` | `HU-003`, `HU-004`, `HU-005`, `HU-006` |
| `EPI-03` | `HU-004`, `HU-007`, `HU-008`           |
| `EPI-04` | `HU-009`, `HU-010`, `HU-011`           |
| `EPI-05` | `HU-012`, `HU-013`, `HU-014`, `HU-015` |
| `EPI-06` | `HU-016`, `HU-017`, `HU-018`, `HU-019` |
| `EPI-07` | `HU-020`, `HU-021`                     |
| `EPI-08` | `HU-022`, `HU-023`, `HU-024`           |
| `EPI-09` | `HU-025`, `HU-026`, `HU-027`, `HU-028` |
| `EPI-10` | `HU-029`, `HU-030`, `HU-031`           |

---

# 18. Story Points del MVP

La estimación inicial total es:

```text
HU-001 ... HU-031
= 122 Story Points
```

Este valor **no representa horas ni duración**.

No debe interpretarse como:

```text
122 SP = 122 horas
```

Tampoco puede utilizarse todavía para predecir cuántos Sprints serán necesarios porque el equipo aún no dispone de velocidad histórica.

Su utilidad inicial es:

- comparar tamaño relativo;
- detectar historias grandes;
- apoyar Sprint Planning;
- observar la velocidad real después de los primeros Sprints.

---

# 19. Control de alcance del backlog

Una nueva historia solo deberá incorporarse al MVP si:

```text
responde a necesidad/requisito
        ↓
aporta valor u operación indispensable
        ↓
dispone de reglas suficientes
        ↓
se analiza impacto
        ↓
se prioriza
        ↓
se estima
        ↓
se actualiza trazabilidad
```

No deberá incorporarse una historia únicamente porque:

- una tecnología la facilita;
- parece interesante;
- existe en otro software;
- completa artificialmente una cantidad de historias.

---

# 20. Criterio para historias individuales

Los futuros archivos en:

```text
docs/historias/
```

deberán desarrollar como mínimo:

- ID;
- título;
- épica;
- historia;
- beneficio;
- actor;
- fuente/necesidad;
- RF/RNF;
- RN;
- prioridad;
- Story Points;
- precondiciones;
- datos;
- dependencias;
- flujo principal cuando corresponda;
- alternativas;
- excepciones;
- criterios de aceptación;
- riesgos;
- estado de refinamiento.

Las historias críticas recibirán mayor nivel de detalle.

---

# 21. Condición para Sprint Planning

Una historia no debe entrar a Sprint únicamente porque aparezca como `MUST`.

Antes deberá cumplir la Definition of Ready que se formalizará posteriormente.

Especialmente:

```text
MUST
≠
READY
```

Una historia puede ser:

```text
MUST
+
REFINAMIENTO REQUERIDO
```

como ocurre actualmente con varias historias de producción, compras y caja.

---

# 22. Próximo bloque documental

Después del Product Backlog se desarrollarán las historias individuales en:

```text
docs/historias/
```

y posteriormente:

```text
docs/08-scrum-y-refinamiento.md
```

El orden específico deberá preservar la relación entre:

```text
Backlog
↓
Historias
↓
Criterios
↓
DoR
↓
Refinamiento
↓
Sprint Planning
```

---

# 23. Control de cambios

| Versión | Fecha      | Descripción                                                                                                           | Estado                                           |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `0.1`   | 20/08/2026 | Product Backlog inicial con 31 historias MVP y 8 historias Post-MVP, priorización MoSCoW, Story Points y trazabilidad | Listo para historias individuales y refinamiento |
