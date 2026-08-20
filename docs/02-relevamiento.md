# 02 — Relevamiento

## 1. Propósito del documento

Este documento registra el relevamiento inicial realizado para **Restaurant System** en el restaurante **Fratelli**.

Su finalidad es documentar:

- qué información se buscó;
- qué fuentes se utilizaron;
- cómo se obtuvo la evidencia;
- qué resultados surgieron;
- qué información fue confirmada, ampliada o agregada;
- qué limitaciones permanecen;
- qué mecanismo se utilizará para aclaraciones posteriores.

El relevamiento se utiliza para fundamentar hallazgos y necesidades antes de formular requisitos o definir el MVP.

---

# 2. Estado del relevamiento

| Elemento                                                     | Estado                       |
| ------------------------------------------------------------ | ---------------------------- |
| Documento descriptivo previo                                 | Disponible y analizado       |
| Entrevista formal con Product Owner                          | Completada                   |
| Audio                                                        | Disponible                   |
| Transcripción                                                | Disponible y formateada      |
| Análisis inicial de resultados                               | Completado                   |
| Entrevistas adicionales                                      | Descartadas                  |
| Observación estructurada adicional                           | Descartada                   |
| Contacto directo adicional con empleados                     | Descartado                   |
| Consultas puntuales a otros empleados mediante Product Owner | Permitidas si son necesarias |
| Hallazgos y necesidades formales                             | Siguiente etapa              |

---

# 3. Objetivos del relevamiento

## 3.1. Objetivo general

Comprender y validar el funcionamiento actual de Fratelli, identificando problemas, prioridades, reglas operativas y necesidades relevantes para definir posteriormente la solución de software.

## 3.2. Objetivos específicos

1. Validar el documento descriptivo inicial.
2. Identificar los problemas que más afectan el trabajo diario.
3. Comprender el manejo de inventario y reposición.
4. Determinar cómo se generan los faltantes y diferencias de inventario.
5. Comprender el flujo de compras y proveedores.
6. Comprender el registro de horarios, asistencia y cálculo de pagos.
7. Precisar qué gastos permanecen fuera del sistema.
8. Comprender el funcionamiento básico de producción.
9. Identificar qué funciones del sistema actual deben conservarse funcionalmente.
10. Determinar si el objetivo es complementar o reemplazar el sistema actual.
11. Identificar prioridades para las siguientes etapas del proyecto.

---

# 4. Fuentes de información

## 4.1. Fuente primaria

**Ana Paola Viscarra Chambi**

Roles relevantes:

- trabajadora actual de Fratelli;
- integrante del equipo;
- Product Owner;
- principal fuente de conocimiento operativo;
- principal contraparte de validación.

## 4.2. Documento descriptivo previo

Antes de la entrevista, Ana redactó:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
└── detalle-de-la-manera-de-trabajo.pdf
```

Este documento sirvió como punto de partida para preparar las preguntas de validación.

## 4.3. Fuente complementaria permitida

Si aparece una duda concreta que Ana no pueda resolver directamente, la Product Owner podrá **consultar una pregunta puntual a otro miembro de Fratelli** y comunicar posteriormente la respuesta al equipo.

Esto se considera una **consulta indirecta de aclaración**, no una entrevista adicional.

No se planifican entrevistas directas adicionales con otros trabajadores.

---

# 5. Técnicas aplicadas

## 5.1. Análisis documental

### Estado

**Completado.**

### Objetivo

Obtener una primera visión del negocio e identificar áreas que requerían validación.

### Resultado

Permitió identificar inicialmente:

- roles;
- atención y ventas;
- comandas;
- producción;
- inventario;
- ausencia de alertas de stock bajo;
- compras y proveedores;
- créditos;
- planillas;
- cierres de caja;
- procesos manuales o externos.

## 5.2. Entrevista semiestructurada

### Estado

**Completada.**

### Datos de la sesión

| Campo                  | Valor                                          |
| ---------------------- | ---------------------------------------------- |
| **Código**             | `ENT-01`                                       |
| **Fecha**              | 19 de agosto de 2026                           |
| **Modalidad**          | Presencial                                     |
| **Entrevistador**      | Josué Matias Arroyo Reynoso                    |
| **Entrevistada**       | Ana Paola Viscarra Chambi                      |
| **Perfil**             | Trabajadora actual de Fratelli y Product Owner |
| **Registro**           | Audio                                          |
| **Duración del audio** | Aproximadamente 23 min 11 s                    |
| **Transcripción**      | Disponible                                     |

### Evidencia

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
├── README.md
├── detalle-de-la-manera-de-trabajo.pdf
├── entrevista-1-audio.mp3
└── transcripcion.md
```

---

# 6. Instrumento aplicado

La entrevista fue semiestructurada. Se utilizaron preguntas de validación preparadas a partir del diagnóstico inicial y se realizaron preguntas de seguimiento cuando fue necesario aclarar respuestas.

Los bloques efectivamente abordados fueron:

## 6.1. Prioridades

- problema que más afecta el trabajo diario;
- procesos que generan errores o pérdida de tiempo;
- información difícil de conocer;
- procesos que deberían mejorarse primero.

## 6.2. Inventario

- forma de decidir reposición;
- revisión de stock;
- frecuencia de faltantes;
- actuación cuando falta un ingrediente.

## 6.3. Compras y proveedores

- inicio de una compra;
- responsables de autorización;
- registro de recepción;
- control de montos pendientes;
- pagos y gastos diarios;
- documentos utilizados.

## 6.4. Personal

- registro de horarios y asistencia;
- responsables de control;
- cálculo de planillas.

## 6.5. Caja

- ingresos y egresos fuera del sistema;
- registro de gastos;
- cierre de caja.

## 6.6. Producción

- días de producción;
- registro de cantidades;
- descuento de ingredientes;
- pérdidas y desperdicios.

## 6.7. Sistema actual

- funcionalidades que deberían conservarse;
- dificultades actuales;
- reportes;
- posibilidad de integración;
- intención de complementar o reemplazar el sistema.

---

# 7. Resultados del relevamiento

## 7.1. Prioridades identificadas

La entrevistada señaló como principales problemas:

- registro manual de horarios;
- pérdida o dificultad de manejo de información de compras;
- anotación manual de gastos;
- diferencias en inventario.

Como prioridades de mejora mencionó:

1. control de entradas y salidas del personal;
2. mejor control de inventario;
3. notificaciones para existencias bajas.

También propuso un **biométrico** como mecanismo deseado para registrar entradas y salidas.

## 7.2. Inventario

Se confirmó que:

- no existen alertas automáticas de stock bajo;
- el encargado y la contadora realizan una revisión aproximadamente semanal;
- para decidir producción/reposición se consultan reportes;
- existen diferencias entre hojas de producción y el sistema;
- los faltantes son descritos como frecuentes;
- también existen sobrantes;
- cuando falta un ingrediente se realiza un pedido al proveedor y se espera su llegada.

## 7.3. Producción

Se amplió la información inicial:

- normalmente se produce lunes y martes;
- pueden existir jornadas adicionales cuando es necesario evitar quedarse sin un plato;
- las cocineras anotan cantidades en hojas de producción;
- el encargado introduce posteriormente esa información al sistema;
- la Product Owner identifica esta transcripción posterior como una fuente de errores;
- cuando se vende un plato, el sistema descuenta automáticamente ingredientes;
- las pérdidas/desperdicios pueden registrarse, aunque el mecanismo exacto no quedó completamente claro.

## 7.4. Compras y proveedores

Se confirmó y amplió que:

- las compras se inician mediante listas;
- distintos responsables gestionan distintas categorías de compra;
- cocina autoriza las compras relacionadas con cocina;
- el encargado gestiona otras categorías, como bebidas o limpieza;
- las compras recibidas no se registran en el sistema;
- los recibos son el respaldo principal;
- se utilizan grupos de WhatsApp con proveedores;
- se envían fotografías de recibos, totales y QR para pagos;
- determinados gastos diarios se anotan en un cuaderno;
- posteriormente el encargado transfiere esas anotaciones a otro registro administrativo.

## 7.5. Personal y asistencia

Se confirmó que:

- la asistencia y horarios se registran manualmente;
- las planillas incluyen entrada, salida y firma;
- la contadora y el encargado controlan esa información;
- la contadora utiliza Excel para calcular pagos;
- el cálculo en Excel utiliza las horas ingresadas y el valor por hora;
- el proceso manual es identificado como fuente de errores o pérdida de tiempo.

## 7.6. Caja e ingresos/egresos

Se confirmó que:

- los ingresos por ventas se encuentran dentro del sistema;
- los gastos diarios quedan fuera;
- esos gastos funcionan de forma semejante a una caja chica;
- el restaurante maneja dos turnos y realiza un cierre total considerando ambos.

## 7.7. Sistema actual

Se obtuvieron dos decisiones relevantes:

1. La Product Owner considera que la funcionalidad general existente debe conservarse en términos de capacidades, porque no identifica un problema particular con todo el sistema actual.
2. A pesar de ello, la intención es **reemplazar el sistema actual por uno nuevo**, no limitarse a complementarlo.

También se confirmó que:

- no existe acceso técnico al sistema actual;
- no se conoce una vía de exportación o integración;
- existe una limitación en reportes, porque un usuario responsable depende de otro usuario para generar determinados reportes.

---

# 8. Comparación con el diagnóstico inicial

| Tema                           | Resultado de la entrevista                                               |
| ------------------------------ | ------------------------------------------------------------------------ |
| Horarios y asistencia manual   | **CONFIRMA** y establece prioridad alta                                  |
| Compras fuera del sistema      | **CONFIRMA Y AMPLÍA** el flujo                                           |
| Gastos no integrados           | **CONFIRMA Y AMPLÍA** como caja chica/manual                             |
| Falta de alertas de stock      | **CONFIRMA**                                                             |
| Faltantes de inventario        | **AMPLÍA**: se describen como frecuentes                                 |
| Producción manual              | **AMPLÍA**: hojas → encargado → sistema                                  |
| Diferencias de inventario      | **AGREGA/CONFIRMA CAUSA OPERATIVA** vinculada a la transcripción manual  |
| Descuento de ingredientes      | **AMPLÍA**: el sistema ya lo realiza automáticamente al vender platos    |
| Cálculo de pagos               | **AMPLÍA**: la contadora utiliza Excel automatizado                      |
| Sistema actual                 | **AMPLÍA**: se desea preservar capacidades pero reemplazar la plataforma |
| Integración con sistema actual | **ACLARA**: no existe acceso técnico conocido                            |
| Reportes                       | **AGREGA** dependencia de otro usuario para generarlos                   |

---

# 9. Información que permanece pendiente

No todas las preguntas del dominio fueron necesarias o respondidas en esta primera sesión.

Permanecen abiertas, entre otras:

- reglas exactas de stock mínimo;
- detalle de mermas y desperdicios;
- reglas de crédito con proveedores;
- pagos parciales y vencimientos;
- políticas de atrasos, faltas y horas extra;
- reglas de créditos a clientes;
- promociones y descuentos;
- tipos exactos de reportes requeridos;
- permisos y roles finales del nuevo sistema;
- características del biométrico;
- especificaciones de impresoras u otros periféricos;
- datos necesarios para migrar desde el sistema anterior.

Estas preguntas **no bloquean la creación del documento de hallazgos y necesidades**. Se aclararán cuando afecten una decisión concreta.

---

# 10. Mecanismo único de relevamiento adicional

A partir de esta etapa no se realizarán:

- entrevistas adicionales directas;
- observación estructurada;
- sesiones independientes con encargado, contadora, meseros o cocineros;
- otras técnicas adicionales de relevamiento.

La única vía permitida será:

```text
Equipo
  ↓ pregunta concreta
Product Owner
  ↓ si necesita confirmación
Miembro de Fratelli
  ↓ respuesta
Product Owner
  ↓
Equipo
```

La respuesta deberá registrarse como **consulta indirecta mediante Product Owner**, no como entrevista.

Cuando una aclaración sea relevante para requisitos o reglas de negocio, deberá documentarse su origen y fecha.

---

# 11. Método de análisis utilizado

## Paso 1 — Lectura del documento previo

Se extrajeron procesos, participantes, problemas y vacíos iniciales.

## Paso 2 — Preparación de preguntas

Las preguntas se organizaron alrededor de los puntos que requerían validación.

## Paso 3 — Entrevista

Se realizó la entrevista semiestructurada y se conservaron audio y transcripción.

## Paso 4 — Comparación

Cada respuesta relevante se contrastó con el diagnóstico inicial para identificar si:

```text
CONFIRMA
AMPLÍA
CORRIGE
CONTRADICE
AGREGA
```

## Paso 5 — Consolidación

Los resultados se utilizaron para actualizar `01-contexto-y-diagnostico.md`.

El siguiente paso será transformarlos en:

```text
Evidencia
   ↓
Hallazgo H-XXX
   ↓
Necesidad N-XXX
```

---

# 12. Gestión de evidencia

La evidencia se conserva en:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
```

Archivos:

- `README.md` — metadatos y finalidad de la sesión;
- `detalle-de-la-manera-de-trabajo.pdf` — documento previo;
- `entrevista-1-audio.mp3` — audio original;
- `transcripcion.md` — transcripción formateada.

El audio permanece como fuente primaria ante cualquier duda sobre la transcripción.

---

# 13. Consideraciones éticas y de privacidad

1. La información se utiliza para un proyecto académico.
2. La grabación debe contar con autorización de la participante.
3. No se publicarán credenciales ni información sensible innecesaria.
4. No se modificarán respuestas para hacerlas coincidir con una solución deseada.
5. Se diferenciarán evidencia, interpretación y requisito.
6. Las consultas indirectas futuras deberán registrarse como tales.

---

# 14. Limitaciones metodológicas

## 14.1. Fuente principal concentrada

Ana Paola Viscarra Chambi es simultáneamente trabajadora de Fratelli, integrante del proyecto y Product Owner.

Esto proporciona conocimiento directo, pero concentra la validación en una perspectiva principal.

## 14.2. Sin entrevistas adicionales

El proyecto no realizará entrevistas directas adicionales para triangular resultados. Las aclaraciones se harán únicamente mediante la Product Owner.

## 14.3. Evidencia principalmente cualitativa

No existen métricas históricas suficientes para cuantificar con precisión:

- tasa de faltantes;
- número de errores;
- tiempo perdido;
- impacto económico;
- diferencias de inventario.

Las expresiones cualitativas se conservarán como tales.

## 14.4. Sin acceso técnico al sistema actual

No se conoce su arquitectura, base de datos, API o mecanismo interno.

---

# 15. Criterio de cierre del relevamiento inicial

El relevamiento inicial se considera **completado y suficiente para avanzar** porque permite identificar:

- problemas prioritarios;
- procesos manuales relevantes;
- relación entre producción e inventario;
- forma general de compras y gastos;
- proceso de asistencia y pago;
- intención de reemplazar el sistema actual;
- prioridades expresadas por la Product Owner;
- vacíos que pueden aclararse posteriormente mediante preguntas puntuales.

---

# 16. Próximo artefacto

El siguiente documento será:

```text
docs/03-hallazgos-y-necesidades.md
```

Este documento asignará identificadores formales y trazabilidad a la evidencia obtenida.

---

# 17. Control de cambios

| Versión | Fecha      | Descripción                                                                                  | Estado     |
| ------- | ---------- | -------------------------------------------------------------------------------------------- | ---------- |
| `0.1`   | 19/08/2026 | Plan inicial de relevamiento y guía de entrevista                                            | Sustituido |
| `0.2`   | 20/08/2026 | Registro de entrevista ejecutada, resultados, limitaciones y cierre del relevamiento inicial | Completado |
