# 01 — Contexto y Diagnóstico

## 1. Propósito del documento

Este documento describe el contexto actual del restaurante **Fratelli**, su funcionamiento, participantes, herramientas, procesos y dificultades conocidas antes de definir formalmente la solución de software.

La versión actual incorpora tanto el documento descriptivo elaborado por la Product Owner como los resultados de la entrevista semiestructurada realizada el 19 de agosto de 2026.

Su función es servir como base para:

- consolidar hallazgos y necesidades;
- formular el problema del proyecto;
- definir objetivos;
- delimitar alcance y MVP;
- redactar requisitos;
- construir el Product Backlog;
- preparar posteriormente Sprint 0.

Este documento **describe y diagnostica**. Las funcionalidades sugeridas durante el relevamiento no se consideran todavía requisitos formales.

---

## 2. Estado documental

| Campo | Valor |
|---|---|
| **Documento** | `01-contexto-y-diagnostico.md` |
| **Proyecto** | Restaurant System |
| **Organización objetivo** | Restaurante Fratelli |
| **Versión actual** | `0.2` |
| **Estado** | Diagnóstico actualizado y validado inicialmente |
| **Última actualización** | 20 de agosto de 2026 |
| **Product Owner** | Ana Paola Viscarra Chambi |
| **Scrum Master** | Alex Saúl Fernandez Valdez |

---

# 3. Base de evidencia

## 3.1. Documento descriptivo

Ana Paola Viscarra Chambi, trabajadora actual de Fratelli y Product Owner del proyecto, redactó antes de la entrevista un documento sobre la forma de trabajo del restaurante.

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
└── detalle-de-la-manera-de-trabajo.pdf
```

Este documento aportó la primera visión sobre personal, ventas, cocina, producción, inventario, compras, proveedores, clientes, créditos, planillas y caja.

## 3.2. Entrevista semiestructurada

La descripción inicial fue validada y ampliada mediante una entrevista presencial.

| Campo | Valor |
|---|---|
| **Fecha** | 19 de agosto de 2026 |
| **Entrevistador** | Miguel Angel Colque Calizaya |
| **Entrevistada** | Ana Paola Viscarra Chambi |
| **Modalidad** | Presencial |
| **Registro** | Audio |
| **Duración** | Aproximadamente 23 min 11 s |

Evidencia:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
├── README.md
├── detalle-de-la-manera-de-trabajo.pdf
├── entrevista-1-audio.mp3
└── transcripcion.md
```

## 3.3. Criterio de interpretación

Se distinguen cuatro niveles:

- **confirmado:** afirmado por la evidencia disponible;
- **ampliado:** la entrevista agregó detalle a información previa;
- **interpretación:** conclusión razonable del análisis, pero no declaración textual de la fuente;
- **pendiente:** información aún no determinada.

---

# 4. Descripción general de Fratelli

Fratelli es un restaurante de comida a la carta de estilo italiano. Su oferta incluye pizzas, pastas, entradas, carnes, pescados, sándwiches, bebidas, postres y vinos.

El documento inicial señala aproximadamente nueve trabajadores y menciona, entre los roles conocidos:

- cuatro meseros;
- cocineros;
- un encargado;
- una contadora.

El restaurante ya utiliza un sistema de información para una parte importante de su operación, por lo que el problema del proyecto **no consiste en una ausencia total de digitalización**.

La situación actual combina:

```text
Sistema existente
+
Planillas en papel
+
Hojas de producción
+
Cuadernos
+
Recibos
+
Excel
+
WhatsApp
```

Esta combinación permite operar, pero fragmenta determinados procesos y genera descoordinación entre información manual y digital.

---

# 5. Stakeholders y participantes conocidos

## 5.1. Meseros

Los meseros atienden a los clientes, toman pedidos, registran ventas, realizan cobros, manejan medios de pago, apoyan actividades de barismo y entregan bebidas.

Cada mesero dispone de un usuario individual en el sistema actual, lo que permite asociar operaciones y ventas a una persona.

La entrevista también confirmó que el personal de atención utiliza planillas físicas para registrar datos como:

- nombre;
- función realizada;
- fecha;
- hora de entrada;
- hora de salida;
- firma.

## 5.2. Cocineros y encargadas de cocina

Cocina trabaja a partir de las comandas generadas por los pedidos.

Además, el personal de cocina participa directamente en:

- producción;
- registro manual de cantidades producidas;
- preparación de listas de compra;
- autorización de determinadas compras de cocina.

## 5.3. Encargado

El encargado participa en:

- productos;
- movimientos de almacén;
- inventario;
- ingresos y bajas;
- reportes;
- transcripción al sistema de las hojas de producción;
- determinadas compras, como bebidas, limpieza y otros productos;
- control de información de asistencia junto con la contadora;
- traspaso de anotaciones de gastos a registros administrativos.

## 5.4. Contadora

La contadora controla información relacionada con:

- planillas;
- horas trabajadas;
- descuentos;
- pagos al personal;
- revisión semanal de inventario junto con el encargado.

Para calcular pagos utiliza una hoja de cálculo de Excel en la que ingresa las horas de entrada y salida. Según la entrevista, el archivo ya calcula automáticamente el importe diario y posteriormente el total semanal según la tarifa de cada trabajador.

## 5.5. Clientes

El sistema actual registra clientes y permite manejar clientes frecuentes, ventas al contado, ventas a crédito, cuentas pendientes, promociones y descuentos.

La entrevista realizada no profundizó las reglas específicas de crédito, descuentos y promociones, por lo que esos detalles permanecen pendientes.

## 5.6. Proveedores

El documento inicial indica aproximadamente veinte proveedores de verduras, carnes, hongos, leche, pescados, mariscos y otros productos.

La entrevista confirmó que las compras se gestionan de manera diferenciada según el tipo de producto y que gran parte de la evidencia se conserva mediante recibos y comunicación por WhatsApp.

## 5.7. Product Owner

**Ana Paola Viscarra Chambi** es trabajadora actual de Fratelli, integrante del equipo y Product Owner.

Su participación permite validar el conocimiento operativo y priorizar necesidades. Debido a esta combinación de roles, el proyecto reconoce como limitación que gran parte del relevamiento depende de una fuente principal.

---

# 6. Funcionamiento actual por áreas

## 6.1. Atención, pedidos y ventas

Flujo general conocido:

```text
Cliente
  ↓
Mesero toma el pedido
  ↓
Pedido registrado en el sistema
  ↓
Se genera comanda
  ↓
Cocina recibe comanda
  ↓
Preparación
  ↓
Cobro / cierre de venta
```

Las ventas están cubiertas por el sistema actual y la Product Owner indicó que **los ingresos provenientes de ventas sí quedan registrados**.

No se identificó durante el relevamiento una necesidad de eliminar las capacidades de venta existentes; por el contrario, se desea conservar su cobertura funcional dentro del sistema futuro.

## 6.2. Cocina y comandas

Las comandas trasladan los pedidos registrados hacia cocina. Los cocineros preparan los platos en función de esas comandas.

No se obtuvo evidencia suficiente de problemas relevantes en el flujo de comandas como tal.

## 6.3. Producción

La producción se realiza normalmente dos veces por semana:

- **lunes:** principalmente preparaciones relacionadas con salsas;
- **martes:** armado de preparaciones, pastas y rellenos.

Cuando existe necesidad extraordinaria puede realizarse producción adicional otros días, por ejemplo jueves o viernes, para evitar quedarse sin algún plato disponible.

### Registro de producción

Las cocineras registran manualmente las cantidades en **hojas de producción**.

Posteriormente el encargado transcribe esos datos al sistema.

La entrevista identifica esta doble intervención como una fuente de descoordinación: el valor escrito en las hojas puede no coincidir con lo que finalmente se introduce en el sistema.

### Consumo de ingredientes

Cuando se vende un plato, el sistema actual descuenta automáticamente los ingredientes asociados.

La entrevista también indica que las pérdidas o desperdicios pueden registrarse, aunque la entrevistada no pudo precisar completamente el mecanismo utilizado. Ese detalle permanece pendiente.

## 6.4. Inventario y stock

El inventario incluye productos para venta directa y productos o ingredientes utilizados en cocina.

### Revisión actual

No existe una alerta automática de stock bajo.

Según la entrevista, aproximadamente una vez por semana el encargado y la contadora revisan las existencias para determinar qué se tiene disponible.

Para decidir reposición o producción se generan reportes y se comparan con otros registros disponibles.

### Problema de consistencia

La información puede diferir entre:

```text
Hojas manuales de producción
        ↕
Información ingresada posteriormente al sistema
```

La Product Owner señaló que los faltantes son **frecuentes**, no solamente ocasionales, y que también pueden existir sobrantes.

La causa descrita durante la entrevista se relaciona con el registro manual de producción y la posterior transcripción al sistema, donde pueden introducirse cantidades mayores o menores a las reales.

### Falta de ingredientes

Cuando falta un ingrediente importante se realiza un pedido al proveedor correspondiente mediante una lista y se debe esperar su abastecimiento.

## 6.5. Compras y proveedores

Las compras no están centralizadas en el sistema actual.

### Inicio de compra

Para distintos grupos de productos se generan listas que se envían al proveedor o persona responsable.

Ejemplos mencionados:

- verduras;
- carnes según peso requerido;
- pescado;
- mariscos.

### Autorización

La responsabilidad depende del tipo de compra:

- las encargadas de cocina autorizan compras relacionadas con cocina;
- el encargado gestiona otras compras, como bebidas, limpieza u otros elementos vinculados a atención.

### Registro

La recepción de compras **no se registra en el sistema actual**.

Los recibos funcionan como comprobante principal.

### Comunicación y pago

Para determinados proveedores se utilizan grupos de WhatsApp. Se envían al responsable correspondiente:

- fotografía del recibo;
- total a cancelar;
- QR del proveedor.

### Compras diarias y caja chica

Existe un manejo manual de dinero para compras o gastos diarios.

Según el ejemplo descrito, el encargado del turno noche puede dejar un monto para el día siguiente. Los gastos, incluidos algunos deliveries, se anotan en un cuaderno con su detalle.

Posteriormente el encargado traspasa esas anotaciones a un registro que la entrevistada identifica, con cierta duda, como **libro diario**, y la reposición del monto se gestiona con el responsable del negocio.

## 6.6. Personal, horarios y asistencia

El control de entrada y salida continúa siendo manual.

Los trabajadores registran sus datos en planillas físicas.

La contadora y el encargado utilizan posteriormente esa información para el cálculo de pagos.

### Cálculo de planilla

La contadora utiliza Excel. Introduce las horas de entrada y salida y la hoja calcula el pago diario y el total semanal de acuerdo con el valor por hora correspondiente.

### Problemas declarados

La Product Owner identifica este proceso como uno de los que más errores o pérdida de tiempo genera.

También relaciona el manejo manual de horarios con problemas posteriores en los pagos.

### Necesidad expresada durante la entrevista

La entrevistada propuso como prioridad incorporar un mecanismo de mejor control de entrada y salida, mencionando específicamente un **biométrico**.

Esta propuesta se registra como una necesidad/sugerencia proveniente del relevamiento. Su implementación concreta deberá definirse más adelante en requisitos, arquitectura y alcance.

## 6.7. Gastos, caja y cierres

### Ventas

Los ingresos correspondientes a ventas se registran en el sistema.

### Gastos diarios

Los gastos diarios no están completamente integrados y continúan manejándose manualmente, de manera semejante a una caja chica.

### Cierre de caja

El restaurante trabaja con dos turnos y realiza un cierre total considerando ambos.

El primer turno registra la información correspondiente hasta su finalización y el turno siguiente completa la operación para generar el cierre total.

Durante la entrevista se mencionaron ventas en efectivo, pagos por QR y operaciones relacionadas con PedidosYa dentro de este proceso.

## 6.8. Reportes

El sistema actual genera reportes, pero existe una limitación de acceso: se indicó que el responsable/propietario debe solicitar a otro usuario que genere determinados reportes en lugar de poder obtenerlos directamente.

La necesidad expresada es permitir que el usuario autorizado pueda generar esos reportes sin depender de un intermediario.

---

# 7. Sistema existente y decisión de reemplazo

Fratelli ya dispone de un sistema que cubre, al menos:

- ventas;
- inventario;
- clientes;
- cuentas por cobrar;
- cierres de caja;
- descuentos automáticos de ingredientes vinculados a platos;
- determinados movimientos de almacén;
- reportes.

La Product Owner manifestó que **no existe un problema particular con la funcionalidad general que ya ofrece**, por lo que dichas capacidades representan un baseline funcional que debería conservarse cuando corresponda.

Sin embargo, también manifestó explícitamente que el objetivo del proyecto es **reemplazar el sistema actual**, no únicamente complementarlo.

Por tanto, la decisión de negocio actualmente expresada puede resumirse así:

> Construir un sistema renovado que sustituya al actual, preserve las capacidades útiles y corrija o incorpore los procesos que hoy permanecen manuales, fragmentados o con acceso insuficiente.

## 7.1. Integración con el sistema actual

No existe acceso técnico al sistema actual que permita conocer su implementación o integrarlo de manera confiable.

La entrevista confirmó que no se dispone de una posibilidad conocida de exportación o integración y que no se tiene acceso interno para determinar cómo funciona.

En consecuencia, **no se planificará una dependencia técnica del sistema nuevo respecto del sistema actual** salvo que posteriormente aparezca nueva evidencia.

---

# 8. Herramientas y medios actuales

| Herramienta / medio | Uso conocido |
|---|---|
| Sistema actual | Ventas, inventario, clientes, cuentas por cobrar, cierres, reportes y otros movimientos |
| Comandas | Comunicación de pedidos hacia cocina |
| Hojas de producción | Registro manual de cantidades producidas |
| Planillas físicas | Horarios, entrada, salida, función y firma del personal |
| Excel | Cálculo de pagos al personal |
| Cuaderno | Registro de gastos/compras diarias y caja chica |
| Recibos | Respaldo de compras y pagos a proveedores |
| WhatsApp | Coordinación con proveedores y envío de recibos, totales y QR |
| QR | Medio de pago y pago a proveedores |

---

# 9. Dificultades confirmadas

## D-01 — Control manual de horarios y asistencia

Las entradas y salidas se registran en planillas físicas.

**Impacto observado:** la Product Owner identifica este proceso como fuente de errores o pérdida de tiempo y lo relaciona con dificultades posteriores para calcular pagos.

## D-02 — Descoordinación entre producción real y sistema

Las cantidades producidas se anotan primero en hojas y luego son introducidas por el encargado.

**Impacto observado:** pueden ingresarse cantidades mayores o menores a las reales, generando diferencias entre registros.

## D-03 — Faltantes y sobrantes frecuentes

La Product Owner indicó que los faltantes ocurren de manera frecuente y que también existen sobrantes.

**Relación observada:** se asocian a la descoordinación del registro de producción e inventario.

## D-04 — Ausencia de alertas de stock bajo

El sistema no notifica automáticamente cuando una existencia está llegando a un nivel bajo.

**Impacto observado:** la revisión depende de reportes y verificaciones periódicas, aproximadamente semanales.

## D-05 — Compras fuera del sistema

Las compras se administran mediante listas, recibos, WhatsApp y otros medios.

**Impacto observado:** la recepción y la información de compra no quedan centralizadas en el sistema actual.

## D-06 — Gastos diarios y caja chica manuales

Determinados gastos se registran en un cuaderno y posteriormente deben trasladarse a otros registros administrativos.

## D-07 — Control de cuentas con proveedores distribuido

Los montos, recibos, QR y comunicaciones de pago se manejan mediante documentos y WhatsApp, en lugar de un flujo centralizado.

## D-08 — Acceso indirecto a determinados reportes

Se reportó que un usuario responsable debe depender de otro usuario para generar determinados reportes.

## D-09 — Sin integración conocida con el sistema actual

El equipo no dispone de acceso técnico al sistema existente ni de un mecanismo conocido de exportación o integración.

---

# 10. Priorización expresada por la Product Owner

Durante la entrevista se identificaron como áreas de mayor prioridad:

1. **control de horarios, entradas y salidas del personal**;
2. **mejor control de inventario**;
3. **avisos o notificaciones de existencias bajas**;
4. reducción del manejo manual de compras y gastos diarios.

La Product Owner mencionó específicamente el uso de un **biométrico** para registrar entradas y salidas.

Estas prioridades alimentarán `03-hallazgos-y-necesidades.md`, pero todavía no determinan por sí mismas el alcance definitivo del MVP.

---

# 11. Diagnóstico actualizado

La evidencia permite confirmar que Fratelli opera con una combinación de procesos digitalizados y manuales.

El problema no está en que el restaurante carezca de un sistema: el sistema actual cubre varias funciones centrales y es utilizado diariamente.

La principal dificultad se encuentra en la **fragmentación y doble tratamiento de información** en procesos que todavía dependen de planillas, hojas, recibos, cuadernos, Excel y WhatsApp.

Esta fragmentación se observa especialmente en:

- asistencia y horarios;
- producción;
- inventario;
- compras;
- gastos diarios;
- pagos a proveedores;
- acceso a determinados reportes.

## 11.1. Formulación del problema de trabajo

> **Fratelli presenta fragmentación y descoordinación en determinados procesos operativos y administrativos debido a la coexistencia del sistema actual con registros manuales y medios externos, provocando diferencias de inventario, faltantes o sobrantes frecuentes, dificultades en el control de asistencia y pagos, y ausencia de una gestión centralizada de compras y gastos diarios.**

### Estado

**Validado como formulación de trabajo para la siguiente etapa documental.**

Su redacción podrá ajustarse durante `03-hallazgos-y-necesidades.md` al separar formalmente evidencia, hallazgos y necesidades.

---

# 12. Causas confirmadas o sustentadas

| Código temporal | Causa | Estado |
|---|---|---|
| CP-01 | Registro manual de entradas y salidas | Confirmado |
| CP-02 | Producción registrada primero en hojas y posteriormente transcrita al sistema | Confirmado |
| CP-03 | Ausencia de alertas automáticas de stock bajo | Confirmado |
| CP-04 | Compras no registradas integralmente en el sistema | Confirmado |
| CP-05 | Gastos diarios registrados manualmente | Confirmado |
| CP-06 | Uso de recibos, cuadernos, Excel y WhatsApp para procesos complementarios | Confirmado |
| CP-07 | Dependencia de otro usuario para determinados reportes | Confirmado |
| CP-08 | Ausencia de acceso técnico al sistema actual para integrarlo | Confirmado |

Los códigos de esta sección son temporales. Los identificadores formales se crearán en el documento de hallazgos y necesidades.

---

# 13. Efectos confirmados o sustentados

| Código temporal | Efecto | Estado |
|---|---|---|
| EP-01 | Faltantes frecuentes de productos | Confirmado |
| EP-02 | Sobrantes de determinados productos | Confirmado |
| EP-03 | Diferencias entre hojas de producción e información del sistema | Confirmado |
| EP-04 | Problemas o trabajo adicional en el cálculo de pagos por registros manuales | Confirmado cualitativamente |
| EP-05 | Información de compras distribuida entre distintos medios | Confirmado |
| EP-06 | Gastos diarios fuera del sistema | Confirmado |
| EP-07 | Dependencia de un intermediario para determinados reportes | Confirmado |

No existen todavía métricas suficientes para cuantificar frecuencia exacta, costo económico o tiempo perdido.

---

# 14. Información aún pendiente

El relevamiento inicial fue suficiente para continuar, pero no resolvió todos los detalles.

## 14.1. Inventario

- reglas exactas para establecer stock mínimo;
- unidades y conversiones;
- inventario físico;
- vencimientos y lotes si resultan necesarios;
- mecanismo exacto de pérdidas/mermas.

## 14.2. Compras y proveedores

- reglas de crédito y vencimientos;
- pagos parciales;
- recepción parcial o rechazo;
- datos obligatorios de cada compra;
- reglas exactas para responsables y autorizaciones.

## 14.3. Personal

- políticas de atrasos;
- faltas;
- horas extra;
- excepciones de turnos;
- reglas exactas de cálculo de pago.

## 14.4. Clientes y créditos

La entrevista principal no profundizó esta área. Permanecen pendientes las reglas específicas de crédito, vencimientos, mora, promociones y descuentos.

## 14.5. Sistema actual

No se conocen:

- tecnología;
- base de datos;
- proveedor;
- modelo interno;
- API;
- mecanismos de exportación;
- detalles de permisos existentes.

Dado que la Product Owner desea reemplazarlo, estos datos dejan de ser un bloqueo para diseñar un sistema independiente, aunque siguen siendo útiles como referencia funcional.

---

# 15. Restricciones y decisiones conocidas

1. El proyecto dispone aproximadamente de **15 días**.
2. El equipo está compuesto por **cuatro integrantes**.
3. Se utilizará **Scrum**.
4. Ana Paola Viscarra Chambi actúa como **Product Owner** y fuente principal del negocio.
5. Alex Saúl Fernandez Valdez actúa como **Scrum Master**.
6. La intención declarada es **reemplazar el sistema actual**.
7. Las funciones útiles actuales deberán evaluarse para conservar su cobertura funcional.
8. No existe una integración conocida con el sistema existente.
9. El relevamiento adicional directo queda descartado; solo podrán realizarse **preguntas puntuales a otros trabajadores por medio de la Product Owner** cuando sea necesario aclarar información.
10. Las propuestas como biométrico o alertas de stock deberán pasar todavía por alcance, requisitos y diseño técnico.

---

# 16. Limitaciones del diagnóstico

## 16.1. Fuente principal única

La principal fuente es también trabajadora, integrante del equipo y Product Owner. Esto ofrece conocimiento directo, pero concentra la perspectiva del negocio.

Si una duda requiere conocimiento de otro rol, únicamente se permitirá que la Product Owner consulte preguntas concretas a otros miembros de Fratelli y devuelva la información al equipo.

## 16.2. Información principalmente cualitativa

La entrevista aporta afirmaciones como “faltantes frecuentes” y problemas de manejo manual, pero no ofrece métricas históricas suficientes para cuantificar su impacto.

No se inventarán porcentajes, tiempos ni pérdidas económicas.

## 16.3. Sin inspección técnica del sistema existente

No existe acceso al interior del sistema actual. Por ello no se documentarán supuestas tecnologías, APIs o esquemas internos.

---

# 17. Criterio de salida del diagnóstico

El diagnóstico inicial se considera suficientemente completo para avanzar porque ya se puede responder:

- qué procesos principales funcionan actualmente;
- qué procesos permanecen manuales o fragmentados;
- cuáles son los problemas prioritarios expresados por la Product Owner;
- qué consecuencias cualitativas se observan;
- cuál es la intención respecto del sistema actual;
- qué información continúa pendiente;
- cómo podrá aclararse información adicional.

---

# 18. Próximo documento

El siguiente artefacto será:

```text
docs/03-hallazgos-y-necesidades.md
```

Allí se transformará la evidencia en una cadena trazable:

```text
Fuente / evidencia
        ↓
Hallazgo H-XXX
        ↓
Necesidad N-XXX
```

No se crearán todavía requisitos funcionales hasta consolidar primero estas necesidades.

---

# 19. Control de cambios

| Versión | Fecha | Descripción | Estado |
|---|---|---|---|
| `0.1` | 19/08/2026 | Diagnóstico inicial basado en el documento descriptivo | Inicial |
| `0.2` | 20/08/2026 | Actualización completa con resultados de la entrevista, prioridades y decisión de reemplazo del sistema actual | Listo para hallazgos y necesidades |
