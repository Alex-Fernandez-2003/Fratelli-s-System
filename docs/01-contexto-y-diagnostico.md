# 01 — Contexto y Diagnóstico

## 1. Propósito del documento

Este documento describe el contexto actual del restaurante **Fratelli**, su forma de trabajo, los actores involucrados, los procesos conocidos, las herramientas utilizadas y las principales dificultades observadas antes de definir formalmente la solución.

Su objetivo es construir una base común para las siguientes etapas del proyecto:

- relevamiento;
- consolidación de hallazgos;
- identificación de necesidades;
- formulación del problema;
- definición de objetivos;
- alcance y MVP;
- requisitos;
- Product Backlog.

Este documento **no define todavía la solución final ni convierte automáticamente los problemas observados en funcionalidades**.

---

## 2. Estado documental

| Campo                       | Valor                                                      |
| --------------------------- | ---------------------------------------------------------- |
| **Documento**               | `01-contexto-y-diagnostico.md`                             |
| **Proyecto**                | Restaurant System                                          |
| **Organización objetivo**   | Restaurante Fratelli                                       |
| **Versión inicial**         | `0.1`                                                      |
| **Estado**                  | Diagnóstico inicial                                        |
| **Fecha**                   | 19 de agosto de 2026                                       |
| **Fuente principal actual** | Explicación de una trabajadora con experiencia en Fratelli |
| **Validación principal**    | Ana Paola Viscarra Chambi — Product Owner                  |
| **Scrum Master**            | Alex Saúl Fernandez Valdez                                 |

---

## 3. Base de evidencia utilizada

El diagnóstico inicial se construye a partir de evidencia proporcionada directamente por una persona con experiencia en el funcionamiento del restaurante.

### 3.1. Evidencia documental disponible

Documento:

```text
detalle de la manera de trabajo.pdf
```

Ubicación:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
└── detalle-manera-trabajo.pdf
```

El documento describe:

- funcionamiento general del restaurante;
- distribución de responsabilidades entre trabajadores;
- atención al cliente;
- pedidos y ventas;
- funcionamiento de cocina mediante comandas;
- producción;
- inventario;
- proveedores y compras;
- clientes y créditos;
- administración del personal;
- pagos y cierres de caja;
- procesos que actualmente permanecen fuera del sistema.

### 3.2. Evidencia de audio

Se incorporará también el audio original asociado al relevamiento.

Ubicación:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
└── entrevista-audio.<formato>
```

### 3.3. Transcripción

Para facilitar el análisis posterior se recomienda conservar una transcripción del audio:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
└── transcripcion.md
```

### 3.4. Regla de interpretación

En este documento se diferencia entre:

- **hechos descritos por la fuente**;
- **problemas expresamente observados**;
- **interpretaciones preliminares del equipo**;
- **aspectos todavía pendientes de validar**.

Las interpretaciones preliminares no deben tratarse como requisitos hasta pasar por el proceso de relevamiento y consolidación de necesidades.

---

# 4. Descripción general de Fratelli

Fratelli es un restaurante dedicado a la venta de platos a la carta de estilo italiano.

Dentro de su oferta se mencionan:

- pizzas;
- pastas;
- entradas;
- carnes;
- pescados;
- sándwiches;
- bebidas;
- postres;
- vinos.

El restaurante cuenta aproximadamente con **nueve trabajadores** distribuidos entre diferentes funciones operativas y administrativas.

Entre los roles identificados actualmente se encuentran:

- meseros;
- cocineros;
- encargado;
- contadora.

El funcionamiento diario requiere coordinación entre atención al cliente, caja, cocina, inventario, administración y otras actividades complementarias.

---

# 5. Stakeholders y participantes conocidos

Esta sección identifica participantes del negocio sin asumir todavía que todos serán actores directos del futuro sistema.

## 5.1. Meseros

Fratelli cuenta con cuatro meseros.

Sus funciones conocidas incluyen:

- atención directa a clientes;
- toma de pedidos;
- registro de ventas;
- cobro a clientes;
- manejo de diferentes medios de pago;
- apoyo en actividades de barismo;
- entrega de bebidas solicitadas.

Cada mesero dispone de un usuario propio dentro del sistema actual, lo que permite identificar las operaciones y ventas realizadas por cada persona.

### Relación con el futuro proyecto

Los meseros son usuarios operativos relevantes porque participan directamente en atención, pedidos, ventas y caja.

Su participación exacta en el nuevo sistema deberá ser validada posteriormente.

---

## 5.2. Cocineros

Los cocineros reciben las comandas generadas a partir de los pedidos registrados.

A partir de estas comandas preparan los platos solicitados por los clientes.

El área de cocina trabaja principalmente en función de estas solicitudes durante el servicio.

Además del trabajo diario, existen **dos días de producción por semana**, durante los cuales se adelantan productos o ingredientes necesarios para la atención posterior.

### Relación con el futuro proyecto

El proceso de cocina y producción es relevante para comprender el flujo operativo, pero todavía debe determinarse qué parte necesita ser cubierta o modificada por el nuevo sistema.

---

## 5.3. Encargado

El encargado cumple funciones relacionadas con el sistema, el inventario y el seguimiento operativo.

Entre sus responsabilidades conocidas se encuentran:

- ingreso de productos al sistema;
- registro de bebidas;
- registro de postres;
- registro de platos;
- registro de otros elementos manejados por el restaurante;
- movimientos de almacén;
- registro de ingresos de productos;
- registro de bajas de productos;
- revisión de información;
- obtención de reportes.

### Relación con el futuro proyecto

El encargado aparece como uno de los principales usuarios administrativos y operativos del sistema actual.

Por su contacto con inventario, productos y reportes, constituye un stakeholder importante para el relevamiento posterior.

---

## 5.4. Contadora

La contadora se encarga principalmente de actividades administrativas relacionadas con los trabajadores.

Sus funciones conocidas incluyen:

- manejo de planillas;
- conteo de horas o actividades consideradas para pago;
- aplicación de descuentos;
- control de información necesaria para determinar el pago de cada trabajador.

Actualmente algunos datos relacionados con horarios y asistencia todavía se registran mediante anotaciones manuales.

### Relación con el futuro proyecto

Debe investigarse si la administración del personal formará parte del alcance del nuevo sistema y con qué nivel de profundidad.

---

## 5.5. Clientes

El restaurante registra información de clientes y reconoce la existencia de clientes frecuentes.

Las ventas pueden realizarse:

- al contado;
- a crédito.

Cuando una venta se realiza a crédito:

- se crea una cuenta;
- se registra la persona a la que se otorgó el crédito;
- se incorpora firma cuando corresponde;
- se acumulan los montos pendientes.

También se manejan promociones y descuentos.

### Relación con el futuro proyecto

Los clientes son beneficiarios y participantes del proceso de venta, pero todavía debe determinarse si interactuarán directamente con el nuevo sistema o solamente de forma indirecta mediante el personal del restaurante.

---

## 5.6. Proveedores

Fratelli trabaja aproximadamente con **20 proveedores**.

Entre los tipos de productos adquiridos se mencionan:

- verduras;
- carnes;
- hongos;
- leche;
- pescados;
- mariscos;
- otros productos utilizados en la preparación de alimentos.

Actualmente parte del proceso de compras y pagos a proveedores se gestiona fuera del sistema principal.

### Relación con el futuro proyecto

Los proveedores intervienen en procesos relevantes para compras, abastecimiento y cuentas pendientes.

Todavía debe determinarse si serán actores directos del sistema o únicamente entidades externas registradas por el personal.

---

## 5.7. Product Owner

La principal contraparte de validación del proyecto es:

**Ana Paola Viscarra Chambi**

Dentro del proyecto asumirá el rol de **Product Owner**.

Su participación será especialmente relevante para:

- validar la comprensión del negocio;
- aclarar reglas y excepciones;
- confirmar necesidades;
- ayudar a priorizar el Product Backlog;
- validar incrementos del producto.

---

# 6. Funcionamiento actual por áreas

## 6.1. Atención, pedidos y ventas

El flujo conocido inicia cuando un cliente realiza un pedido.

Los meseros:

1. atienden al cliente;
2. toman el pedido;
3. registran la venta;
4. gestionan posteriormente el cobro;
5. utilizan el usuario individual asignado dentro del sistema.

El restaurante ya utiliza un sistema para registrar parte importante de estas operaciones.

### Situación observada

Este proceso se encuentra actualmente digitalizado en una proporción importante.

No existe evidencia suficiente todavía para afirmar que el proceso de ventas necesite ser reemplazado completamente.

---

## 6.2. Generación de comandas y cocina

Después de registrar un pedido se genera una **comanda**.

La comanda llega al área de cocina.

Los cocineros utilizan esta información para preparar los platos solicitados.

Flujo conocido:

```text
Cliente
  ↓
Mesero toma pedido
  ↓
Pedido registrado
  ↓
Generación de comanda
  ↓
Cocina recibe comanda
  ↓
Preparación del pedido
```

### Situación observada

La generación y utilización de comandas forma parte del flujo operativo actual.

Todavía debe investigarse si existen problemas de coordinación, tiempos, errores o prioridades dentro de este proceso.

---

## 6.3. Producción

Fratelli cuenta con dos días de producción durante la semana.

En estas jornadas se adelantan preparaciones, productos o ingredientes utilizados posteriormente durante el servicio.

La finalidad de esta actividad es disponer previamente de ciertos elementos y facilitar la operación durante los días de mayor atención.

### Aspectos pendientes

No se conoce todavía:

- qué productos se elaboran durante producción;
- cómo se planifica la cantidad a producir;
- cómo se registra la producción realizada;
- si la producción descuenta ingredientes del inventario;
- si existen recetas o rendimientos definidos;
- si existen desperdicios o mermas registradas;
- cómo se relaciona producción con ventas futuras.

Estos puntos requieren relevamiento adicional antes de modelarlos.

---

## 6.4. Inventario y almacén

El restaurante controla productos utilizados tanto para elaboración como para venta directa.

Se mencionan:

- bebidas;
- alimentos;
- ingredientes;
- otros productos.

El encargado registra movimientos relacionados con:

- ingresos;
- bajas;
- existencias.

Parte importante de este control ya se realiza desde el sistema actual.

### Problema observado

Actualmente **no existe una alerta automática de stock mínimo**.

Como consecuencia, en algunas ocasiones se presentan situaciones en las que determinados productos:

- tienen pocas existencias;
- llegan a faltar.

Esta es una dificultad expresamente descrita por la fuente y deberá ser analizada durante el relevamiento.

---

## 6.5. Proveedores y compras

Fratelli trabaja aproximadamente con veinte proveedores.

Actualmente el proceso de compra presenta una integración incompleta con el sistema existente.

La fuente señala que:

- no existe un módulo específico para registrar toda la información de cada compra;
- algunos pagos se respaldan mediante recibos;
- no existe un control completo de cuentas pendientes con proveedores;
- parte de esta información se administra manualmente o mediante documentos externos.

### Situación observada

La gestión de compras constituye uno de los principales puntos donde existe fragmentación de información.

Sin embargo, todavía deben investigarse:

- flujo exacto de una compra;
- quién solicita;
- quién autoriza;
- quién recibe;
- quién paga;
- qué documentos se manejan;
- cómo se registran compras parciales;
- existencia de compras a crédito;
- vencimientos;
- devoluciones a proveedores;
- frecuencia de compras;
- criterios de reposición.

---

## 6.6. Clientes y cuentas por cobrar

El restaurante almacena datos de clientes y maneja clientes frecuentes.

Se realizan ventas al contado y a crédito.

Cuando se concede crédito:

1. se crea una cuenta;
2. se identifica a la persona responsable;
3. se incorpora una firma cuando corresponde;
4. los montos pendientes pueden acumularse.

El sistema actual ya permite manejar cuentas por cobrar.

También se utilizan:

- promociones;
- descuentos.

### Aspectos pendientes

Se requiere determinar:

- quién puede autorizar un crédito;
- qué límites existen;
- cómo se registran pagos parciales;
- cómo se manejan vencimientos;
- qué ocurre cuando existe mora;
- cómo se aprueban descuentos;
- si las promociones siguen reglas predefinidas.

---

## 6.7. Gestión del personal

La contadora maneja planillas y pagos relacionados con los trabajadores.

Para determinar pagos utiliza información relacionada con:

- horas;
- actividades;
- descuentos;
- otros registros administrativos.

### Problema observado

Algunos datos de horarios y asistencia todavía se registran mediante **anotaciones manuales**.

Esto implica que el control de personal no se encuentra completamente integrado.

### Aspectos pendientes

Debe investigarse:

- cómo se registra actualmente una asistencia;
- quién la registra;
- qué horarios existen;
- cómo se manejan atrasos;
- cómo se gestionan faltas;
- cómo se calculan horas adicionales;
- cómo afectan estos datos a las planillas;
- qué información necesita finalmente la contadora.

---

## 6.8. Pagos y cierres de caja

El restaurante utiliza principalmente:

- pagos mediante QR;
- planillas o registros internos.

También se realizan cierres de caja.

El sistema permite obtener determinada información relacionada con:

- ventas;
- dinero generado;
- cierres.

### Problema observado

El control de **ingresos y egresos** no se encuentra completamente integrado.

Todavía debe investigarse cuáles ingresos y egresos quedan fuera, quién los registra y cómo se concilian con los cierres de caja.

---

# 7. Sistema existente

Fratelli **ya cuenta con un sistema de información**.

De acuerdo con la evidencia disponible, actualmente permite controlar varias actividades importantes:

- ventas;
- inventario;
- clientes;
- cuentas por cobrar;
- cierres de caja.

Esto significa que el proyecto **no debe partir de la premisa de que el restaurante carece de digitalización**.

El diagnóstico correcto parte de una situación híbrida:

```text
Procesos gestionados dentro del sistema
                +
Procesos manuales o externos
                ↓
Información parcialmente fragmentada
```

### Procesos conocidos que permanecen total o parcialmente fuera

La fuente identifica específicamente:

- horarios y asistencia de trabajadores;
- compras a proveedores;
- determinados gastos;
- algunos registros administrativos.

También existen documentos y medios externos como:

- anotaciones;
- recibos;
- planillas;
- otros registros.

---

# 8. Herramientas y medios actualmente utilizados

Hasta el momento se identifican:

| Herramienta / medio            | Uso conocido                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| Sistema actual del restaurante | Ventas, inventario, clientes, cuentas por cobrar, cierres de caja y otros registros |
| Comandas                       | Comunicación de pedidos hacia cocina                                                |
| QR                             | Medio de pago                                                                       |
| Planillas / registros internos | Parte del control administrativo y de pagos                                         |
| Anotaciones manuales           | Horarios, asistencia y algunos procesos administrativos                             |
| Recibos                        | Respaldo de determinados pagos y compras                                            |
| Documentos externos            | Parte de la gestión de compras y proveedores                                        |

No se dispone todavía de información técnica sobre el sistema actual, su tecnología, base de datos, proveedor o posibilidad de integración.

---

# 9. Datos e información manejados actualmente

A partir de la evidencia pueden identificarse preliminarmente los siguientes grupos de información.

## 9.1. Ventas

- pedido;
- productos o platos vendidos;
- responsable de la venta;
- forma de pago;
- cobro;
- cierre de caja.

## 9.2. Productos e inventario

- productos;
- bebidas;
- postres;
- platos;
- ingredientes;
- ingresos;
- bajas;
- existencias.

## 9.3. Clientes

- datos del cliente;
- condición de cliente frecuente;
- ventas;
- cuentas pendientes;
- crédito;
- promociones;
- descuentos.

## 9.4. Proveedores y compras

- proveedores;
- productos adquiridos;
- compras;
- pagos;
- recibos;
- cuentas pendientes.

## 9.5. Personal

- empleados;
- horas;
- actividades;
- asistencia;
- horarios;
- descuentos;
- planillas;
- pagos.

## 9.6. Producción

Se conoce que existe actividad de producción, pero la estructura de datos utilizada actualmente todavía no está documentada.

---

# 10. Dificultades confirmadas por la evidencia

Las siguientes dificultades sí están sustentadas directamente por la fuente actual.

## D-01 — Ausencia de alertas de stock mínimo

No existe un mecanismo automático que informe oportunamente cuando un producto está llegando a su stock mínimo.

### Consecuencia observada

En algunas ocasiones determinados productos se encuentran en poca cantidad o llegan a faltar.

---

## D-02 — Compras a proveedores parcialmente externas al sistema

No existe actualmente un módulo específico que concentre toda la información de cada compra.

### Consecuencias observadas

Parte del proceso se maneja mediante:

- recibos;
- documentos externos;
- mecanismos manuales.

---

## D-03 — Control incompleto de cuentas pendientes con proveedores

No existe un control completo de las obligaciones pendientes con proveedores.

### Consecuencia observada

Parte de la información relacionada con pagos permanece distribuida fuera del sistema principal.

---

## D-04 — Registro manual de horarios y asistencia

Algunos datos relacionados con horarios y asistencia de trabajadores todavía se registran manualmente.

### Consecuencia potencial

La fuente confirma la existencia del registro manual, pero todavía no proporciona evidencia suficiente para cuantificar errores, pérdidas de tiempo o inconsistencias derivadas de este proceso.

---

## D-05 — Ingresos y egresos no completamente integrados

El restaurante puede consultar información de ventas y cierres de caja, pero el control general de ingresos y egresos todavía no se encuentra completamente integrado.

### Aspecto pendiente

Se requiere precisar qué operaciones quedan fuera del sistema y cuál es su impacto.

---

# 11. Diagnóstico preliminar

La situación actual de Fratelli puede describirse inicialmente como una **operación parcialmente digitalizada**.

El restaurante ya dispone de un sistema que cubre actividades relevantes, pero determinados procesos continúan siendo gestionados mediante mecanismos externos o manuales.

Esto produce una combinación de:

- información registrada en el sistema;
- anotaciones manuales;
- recibos;
- planillas;
- otros documentos externos.

## 11.1. Formulación preliminar del problema

> **Fratelli presenta una gestión parcialmente fragmentada de determinados procesos operativos y administrativos, debido a que parte de la información continúa distribuida entre el sistema actual y medios manuales o externos, lo que dificulta mantener un control integrado de áreas como abastecimiento, inventario, personal y movimientos administrativos.**

### Estado

**Pendiente de validar.**

Esta formulación no debe considerarse todavía el problema central definitivo del proyecto.

El relevamiento posterior deberá determinar:

- qué dificultades tienen mayor impacto;
- quiénes son los usuarios más afectados;
- qué causas son realmente relevantes;
- qué procesos deben formar parte de la solución;
- qué procesos deben permanecer fuera del alcance.

---

# 12. Posibles causas preliminares

Las siguientes son interpretaciones iniciales y deben validarse.

| Código | Posible causa                                                    | Estado     |
| ------ | ---------------------------------------------------------------- | ---------- |
| CP-01  | Algunos procesos no están cubiertos por el sistema actual        | Confirmado |
| CP-02  | Determinada información se registra mediante medios externos     | Confirmado |
| CP-03  | No existe alerta automática de stock mínimo                      | Confirmado |
| CP-04  | El proceso de compras no cuenta con un módulo integral           | Confirmado |
| CP-05  | Parte de horarios y asistencia se registra manualmente           | Confirmado |
| CP-06  | El control de ingresos y egresos no está completamente integrado | Confirmado |

Estas causas no utilizarán todavía IDs formales de hallazgo (`H-XXX`). Dichos IDs se asignarán en `03-hallazgos-y-necesidades.md` después del relevamiento.

---

# 13. Posibles efectos preliminares

Solo algunos efectos están confirmados directamente.

| Código | Efecto preliminar                                                    | Estado                         |
| ------ | -------------------------------------------------------------------- | ------------------------------ |
| EP-01  | Productos con existencias muy bajas                                  | Confirmado                     |
| EP-02  | Faltantes de determinados productos                                  | Confirmado                     |
| EP-03  | Información de compras distribuida en distintos medios               | Confirmado                     |
| EP-04  | Información administrativa parcialmente manual                       | Confirmado                     |
| EP-05  | Mayor dificultad para conocer obligaciones completas con proveedores | Confirmado                     |
| EP-06  | Posible duplicación o inconsistencia entre registros                 | Hipótesis pendiente de validar |

Las hipótesis no deberán presentarse posteriormente como resultados reales sin evidencia adicional.

---

# 14. Información todavía desconocida

El documento disponible permite comprender una parte importante del negocio, pero existen vacíos que deben ser investigados.

## 14.1. Sistema actual

- nombre del sistema;
- proveedor;
- tecnología;
- posibilidad de integración;
- acceso a datos;
- exportaciones;
- roles;
- permisos;
- limitaciones;
- costo;
- disponibilidad de API;
- posibilidad de reemplazo o coexistencia.

## 14.2. Inventario

- unidades de medida;
- stock mínimo por producto;
- inventario físico;
- mermas;
- ajustes;
- vencimientos;
- lotes;
- costo promedio;
- frecuencia de conteo;
- responsables.

## 14.3. Compras

- solicitud;
- aprobación;
- cotización;
- orden;
- recepción;
- pago;
- crédito;
- vencimientos;
- documentos utilizados;
- devoluciones;
- responsables.

## 14.4. Producción

- recetas;
- ingredientes;
- cantidades;
- rendimiento;
- planificación;
- consumos;
- sobrantes;
- desperdicios;
- producto terminado.

## 14.5. Personal

- horarios;
- asistencia;
- atrasos;
- faltas;
- horas extra;
- descuentos;
- cálculo de pagos;
- periodicidad de planillas.

## 14.6. Caja y administración

- tipos de ingreso;
- tipos de egreso;
- conciliación;
- responsables;
- cierres;
- diferencias de caja;
- autorización de gastos.

## 14.7. Clientes y crédito

- límites de crédito;
- aprobación;
- pagos parciales;
- vencimientos;
- mora;
- descuentos;
- promociones.

---

# 15. Restricciones conocidas

Actualmente solo pueden establecerse con seguridad las siguientes restricciones:

1. El proyecto dispone aproximadamente de **15 días** para su desarrollo.
2. El trabajo será realizado por un equipo de **cuatro integrantes**.
3. El desarrollo será gestionado mediante **Scrum**.
4. La validación principal estará a cargo de **Ana Paola Viscarra Chambi como Product Owner**.
5. El proyecto debe considerar que Fratelli **ya dispone de un sistema existente**.
6. No debe asumirse que todos los procesos actuales necesitan ser reemplazados.
7. No debe diseñarse una integración con el sistema existente sin conocer previamente sus capacidades técnicas.
8. Las funcionalidades deben derivarse de necesidades validadas y no únicamente de posibilidades técnicas.

---

# 16. Límites actuales del diagnóstico

Este diagnóstico presenta varias limitaciones.

### Una fuente principal

Hasta el momento la descripción detallada del negocio proviene principalmente de una persona con experiencia en Fratelli.

Por tanto, sus afirmaciones son valiosas como evidencia del negocio, pero todavía deben contrastarse cuando sea necesario con:

- otros trabajadores;
- observación;
- documentos;
- datos reales;
- Product Owner;
- responsables de áreas específicas.

### Falta de métricas

No se dispone todavía de mediciones relacionadas con:

- frecuencia de faltantes;
- errores;
- tiempos;
- número de compras;
- volumen de movimientos;
- cantidad de créditos;
- pérdidas;
- retrasos;
- diferencias de caja.

No se deben inventar estos valores.

### Falta de detalle técnico

No se conocen todavía las características técnicas del sistema actual.

Esto impide decidir de forma responsable si el futuro producto:

- reemplazará funciones existentes;
- complementará el sistema actual;
- coexistirá con él;
- deberá integrarse.

---

# 17. Preguntas prioritarias para el relevamiento

Las siguientes preguntas deberán alimentar `02-relevamiento.md`.

## Sobre prioridades

1. ¿Cuál es actualmente el problema que más afecta el trabajo diario?
2. ¿Qué proceso genera más errores o pérdida de tiempo?
3. ¿Qué información resulta más difícil de conocer cuando se necesita?
4. ¿Qué proceso consideran prioritario mejorar primero?

## Sobre inventario

5. ¿Cómo saben actualmente qué productos deben reponer?
6. ¿Quién determina el stock mínimo?
7. ¿Con qué frecuencia existen faltantes?
8. ¿Qué ocurre cuando falta un ingrediente importante?

## Sobre compras y proveedores

9. ¿Cómo inicia una compra?
10. ¿Quién autoriza una compra?
11. ¿Cómo se registra lo recibido?
12. ¿Cómo saben cuánto deben a cada proveedor?
13. ¿Cómo se manejan fechas de pago y compras a crédito?
14. ¿Qué documentos se utilizan actualmente?

## Sobre personal

15. ¿Cómo se registran horarios y asistencia?
16. ¿Quién controla esa información?
17. ¿Cómo se utiliza posteriormente para calcular planillas?

## Sobre caja

18. ¿Qué ingresos y egresos quedan actualmente fuera del sistema?
19. ¿Cómo se registran los gastos?
20. ¿Cómo se realiza el cierre y la conciliación?

## Sobre producción

21. ¿Cómo se planifican los dos días de producción?
22. ¿Se registran cantidades producidas?
23. ¿Se descuentan ingredientes?
24. ¿Se controlan pérdidas o desperdicios?

## Sobre el sistema existente

25. ¿Qué funcionalidades desean conservar?
26. ¿Qué funcionalidades actuales generan problemas?
27. ¿Existe posibilidad de exportar o integrar información?
28. ¿El objetivo es complementar el sistema o reemplazarlo?

---

# 18. Criterio para avanzar a la siguiente etapa

Este documento se considerará suficientemente estable para continuar cuando:

- la Product Owner confirme que la descripción general refleja razonablemente el funcionamiento actual;
- se identifiquen los principales vacíos de información;
- se prepare el plan de relevamiento;
- no existan contradicciones importantes sobre los procesos descritos.

No es necesario resolver todas las preguntas pendientes antes de iniciar `02-relevamiento.md`; precisamente dicho documento organizará cómo obtener esas respuestas.

---

# 19. Próximo documento

El siguiente archivo será:

```text
docs/02-relevamiento.md
```

Su propósito será definir formalmente:

- objetivos del relevamiento;
- fuentes;
- técnicas;
- participantes;
- instrumentos;
- preguntas;
- evidencia;
- forma de análisis;
- resultados esperados;
- limitaciones.

---

# 20. Control de cambios

| Versión | Fecha      | Descripción                                                                     | Estado              |
| ------- | ---------- | ------------------------------------------------------------------------------- | ------------------- |
| `0.1`   | 19/08/2026 | Creación del contexto y diagnóstico inicial a partir de la evidencia disponible | Diagnóstico inicial |
