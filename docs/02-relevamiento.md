# 02 — Relevamiento

## 1. Propósito del documento

Este documento define cómo se realizará el relevamiento de información para el proyecto **Restaurant System**, orientado al restaurante **Fratelli**.

El relevamiento tiene como finalidad obtener evidencia suficiente para:

- comprender con mayor precisión el funcionamiento actual del restaurante;
- validar o corregir el diagnóstico preliminar;
- identificar problemas reales y su impacto;
- descubrir necesidades de los usuarios y del negocio;
- aclarar reglas operativas;
- delimitar posteriormente el alcance y el MVP;
- fundamentar los requisitos y el Product Backlog;
- evitar diseñar funcionalidades basadas únicamente en suposiciones.

Este documento diferencia expresamente entre:

1. información ya disponible;
2. relevamiento planificado;
3. resultados obtenidos posteriormente;
4. interpretaciones del equipo.

---

## 2. Estado del relevamiento

| Elemento                                     | Estado                |
| -------------------------------------------- | --------------------- |
| Documento descriptivo de la forma de trabajo | Disponible            |
| Entrevista formal con Product Owner          | Planificada           |
| Audio de la entrevista                       | Pendiente de realizar |
| Transcripción de la entrevista               | Pendiente             |
| Revisión de documentos operativos reales     | Pendiente de evaluar  |
| Consolidación de hallazgos                   | Pendiente             |
| Consolidación de necesidades                 | Pendiente             |

---

# 3. Objetivos del relevamiento

## 3.1. Objetivo general

Comprender y validar el funcionamiento actual de Fratelli, identificando los procesos, dificultades, necesidades, reglas de negocio y prioridades que deben considerarse antes de definir formalmente la solución de software.

## 3.2. Objetivos específicos

1. Validar la descripción actual del funcionamiento del restaurante.
2. Identificar cuáles son los problemas que generan mayor impacto en el trabajo diario.
3. Determinar qué procesos se encuentran correctamente cubiertos por el sistema actual.
4. Determinar qué procesos continúan siendo manuales, externos o parcialmente digitalizados.
5. Comprender con mayor detalle el manejo de inventario y reposición.
6. Comprender el proceso de compras y relación con proveedores.
7. Comprender el proceso de producción realizado durante la semana.
8. Comprender el manejo de horarios, asistencia y planillas.
9. Comprender los movimientos de caja, ingresos y egresos.
10. Identificar reglas asociadas a ventas a crédito, descuentos y promociones.
11. Conocer las limitaciones del sistema actualmente utilizado.
12. Identificar qué funciones deben conservarse, complementarse o eventualmente reemplazarse.
13. Determinar las prioridades del negocio para el desarrollo.
14. Identificar información que requiera una segunda fuente de validación.

---

# 4. Fuentes de información

## 4.1. Fuente primaria principal

**Ana Paola Viscarra Chambi**

Roles relevantes para el proyecto:

- trabajadora actual de Fratelli;
- integrante del equipo del proyecto;
- Product Owner;
- fuente principal de conocimiento del negocio;
- principal contraparte de validación.

Su conocimiento proviene de experiencia actual dentro del restaurante.

Esta combinación de roles permite acceso directo al conocimiento operativo, pero también deberá considerarse como una limitación metodológica, ya que una parte importante de la información proviene de una persona que participa simultáneamente en el negocio y en el equipo del proyecto.

---

## 4.2. Documento descriptivo previo

Antes de la entrevista formal, Ana Paola Viscarra Chambi elaboró un documento describiendo la forma actual de trabajo del restaurante.

Archivo original:

```text
detalle d la manera de trabajo.pdf
```

Ubicación prevista en el repositorio:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
└── detalle-manera-trabajo.pdf
```

Este documento constituye la primera evidencia documental utilizada para elaborar el diagnóstico inicial.

Contiene información sobre:

- actividad del restaurante;
- personal;
- atención al cliente;
- pedidos;
- ventas;
- caja;
- comandas;
- cocina;
- producción;
- inventario;
- productos;
- proveedores;
- compras;
- clientes;
- ventas a crédito;
- promociones;
- descuentos;
- planillas;
- asistencia;
- cierres de caja;
- procesos manuales o externos.

---

## 4.3. Posibles fuentes secundarias

A través de Ana Paola Viscarra Chambi existe la posibilidad de contactar, si resulta necesario, con otros trabajadores de Fratelli.

Dependiendo de los vacíos encontrados durante la entrevista principal, podrían consultarse:

- encargado;
- meseros;
- cocineros;
- contadora;
- otros empleados relacionados con un proceso específico.

Estas entrevistas **no se consideran realizadas ni obligatorias en esta etapa**. Se utilizarán únicamente cuando sea necesario contrastar o ampliar información.

---

# 5. Técnicas de relevamiento

## 5.1. Análisis documental

### Estado

**Realizado inicialmente.**

### Fuente

Documento redactado por Ana Paola Viscarra Chambi antes de la entrevista formal.

### Objetivo

Obtener una primera visión estructurada del funcionamiento de Fratelli y detectar aspectos que requieren profundización.

### Información obtenida inicialmente

El análisis documental permitió identificar preliminarmente:

- roles operativos y administrativos;
- existencia de un sistema actual;
- flujo de pedidos y comandas;
- funcionamiento general de cocina;
- existencia de dos días semanales de producción;
- manejo de inventario;
- falta de alertas de stock mínimo;
- existencia de aproximadamente veinte proveedores;
- gestión parcialmente externa de compras;
- control incompleto de cuentas pendientes con proveedores;
- ventas a crédito;
- manejo de promociones y descuentos;
- gestión de planillas;
- registros manuales de horarios y asistencia;
- cierres de caja;
- falta de integración completa de ingresos y egresos.

### Limitación

El documento ofrece una descripción general, pero no define con suficiente detalle:

- reglas;
- excepciones;
- prioridades;
- frecuencia de problemas;
- responsables exactos de algunos procesos;
- secuencia completa de determinadas operaciones;
- características técnicas del sistema existente.

Estas áreas serán profundizadas mediante entrevista.

---

# 6. Entrevista principal planificada

## 6.1. Datos generales

| Campo                 | Información                                                 |
| --------------------- | ----------------------------------------------------------- |
| **Técnica**           | Entrevista semiestructurada                                 |
| **Entrevistada**      | Ana Paola Viscarra Chambi                                   |
| **Perfil**            | Trabajadora actual de Fratelli y Product Owner del proyecto |
| **Entrevistador**     | Miguel Angel Colque Calizaya                                |
| **Fecha prevista**    | 19 de agosto de 2026                                        |
| **Modalidad**         | Presencial                                                  |
| **Duración estimada** | Aproximadamente 15 minutos                                  |
| **Registro**          | Audio                                                       |
| **Transcripción**     | Se realizará posteriormente                                 |
| **Estado**            | Pendiente de realizar                                       |

---

## 6.2. Objetivo de la entrevista

Validar la información contenida en el documento descriptivo previo y obtener detalles adicionales sobre los procesos que presentan mayor incertidumbre o posibles dificultades.

La entrevista no busca confirmar una solución ya diseñada.

Su propósito es comprender:

- qué ocurre;
- cómo ocurre;
- quién participa;
- qué dificultades existen;
- qué información se necesita;
- qué reglas se aplican;
- qué aspectos tienen mayor prioridad.

---

# 7. Guía de entrevista

La entrevista será semiestructurada.

Las preguntas siguientes funcionan como guía. Miguel Angel Colque Calizaya podrá realizar preguntas de seguimiento cuando una respuesta revele información relevante.

No es necesario formularlas de manera rígida ni en el mismo orden si la conversación permite obtener la información naturalmente.

---

## 7.1. Prioridades y problema principal

1. ¿Cuál consideras que es actualmente el problema que más afecta el trabajo diario en Fratelli?
2. ¿Qué proceso suele generar más dificultades, errores o pérdida de tiempo?
3. ¿Qué información es difícil conocer cuando se necesita?
4. Si solamente se pudiera mejorar una parte del funcionamiento actual, ¿cuál debería atenderse primero?
5. ¿Hay algún problema importante que no aparezca en el documento que escribiste?

### Objetivo

Identificar prioridades reales antes de asumir que todos los problemas detectados tienen la misma importancia.

---

## 7.2. Sistema actual

6. ¿Qué sistema utilizan actualmente?
7. ¿Qué funciones del sistema consideran que funcionan bien?
8. ¿Qué funciones generan problemas?
9. ¿Qué actividades deben realizar fuera del sistema?
10. ¿Existen datos que deban registrarse dos veces?
11. ¿Hay información que el sistema no permita consultar fácilmente?
12. ¿El restaurante necesitaría reemplazar el sistema actual o sería suficiente complementar las funciones que faltan?
13. ¿El sistema permite exportar información?
14. ¿Se conoce si existe alguna forma de integración o API?
15. ¿Quiénes tienen acceso al sistema y qué puede hacer cada usuario?

### Objetivo

Determinar si el proyecto debe complementar, reemplazar o coexistir con el sistema actual.

---

## 7.3. Inventario

16. ¿Cómo saben actualmente cuánto stock queda de cada producto?
17. ¿Quién revisa el inventario?
18. ¿Cómo saben cuándo deben comprar nuevamente un producto?
19. ¿Existe un stock mínimo definido para cada producto?
20. ¿Quién decide ese stock mínimo?
21. ¿Con qué frecuencia se presentan faltantes?
22. ¿Qué ocurre cuando falta un ingrediente necesario durante el servicio?
23. ¿Cómo se registran las entradas de productos?
24. ¿Cómo se registran las bajas?
25. ¿Se registran productos desperdiciados, dañados o vencidos?
26. ¿Realizan conteos físicos del inventario?
27. ¿Existen diferencias frecuentes entre el inventario del sistema y el inventario real?

### Objetivo

Comprender el proceso de control de existencias y validar la importancia de las alertas de stock.

---

## 7.4. Compras y proveedores

28. ¿Cómo comienza normalmente una compra?
29. ¿Quién detecta que se necesita comprar?
30. ¿Quién decide o autoriza la compra?
31. ¿Cómo se elige al proveedor?
32. ¿Se solicitan precios o cotizaciones?
33. ¿Cómo se registra lo que se pidió?
34. ¿Cómo se registra lo que realmente entregó el proveedor?
35. ¿Quién recibe los productos?
36. ¿Qué ocurre si lo recibido no coincide con lo solicitado?
37. ¿Existen compras al contado y a crédito?
38. ¿Cómo registran actualmente las deudas con proveedores?
39. ¿Cómo saben cuánto deben y cuándo deben pagar?
40. ¿Se realizan pagos parciales?
41. ¿Qué documentos se utilizan como respaldo?
42. ¿Los recibos se archivan físicamente?
43. ¿Existe alguna dificultad frecuente al buscar información de compras anteriores?

### Objetivo

Documentar el flujo completo de compras y determinar si existe una necesidad real de centralizar esta información.

---

## 7.5. Producción

44. ¿Qué actividades realizan exactamente durante los dos días de producción?
45. ¿Qué productos o preparaciones se adelantan?
46. ¿Cómo deciden cuánto producir?
47. ¿Se registra la cantidad producida?
48. ¿Se registran los ingredientes utilizados?
49. ¿El inventario se actualiza cuando se utilizan ingredientes para producción?
50. ¿Se registran desperdicios, mermas o sobrantes?
51. ¿Existen recetas definidas con cantidades específicas?
52. ¿Hay problemas frecuentes relacionados con producir demasiado o demasiado poco?

### Objetivo

Determinar si producción debe formar parte del alcance del proyecto y cómo se relaciona con inventario.

---

## 7.6. Personal, horarios y asistencia

53. ¿Cómo se registran actualmente los horarios de los trabajadores?
54. ¿Cómo se registra la asistencia?
55. ¿Quién realiza ese registro?
56. ¿Cómo se registran atrasos o faltas?
57. ¿Se manejan horas extra?
58. ¿La información de asistencia se utiliza para calcular pagos?
59. ¿Cómo recibe la contadora esta información?
60. ¿Debe volver a copiar o consolidar información manualmente?
61. ¿Qué dificultades presenta actualmente este proceso?

### Objetivo

Comprender si existe una necesidad relevante de digitalizar o integrar el control de personal.

---

## 7.7. Caja, ingresos y egresos

62. ¿Cómo se realiza un cierre de caja?
63. ¿Quién lo realiza?
64. ¿Qué medios de pago utilizan actualmente?
65. ¿Qué ingresos se registran dentro del sistema?
66. ¿Qué ingresos quedan fuera?
67. ¿Qué tipos de egresos tiene normalmente el restaurante?
68. ¿Dónde se registran esos egresos?
69. ¿Quién autoriza un gasto?
70. ¿Cómo se respaldan los gastos?
71. ¿Se compara el dinero esperado con el dinero realmente disponible?
72. ¿Qué ocurre cuando existe una diferencia?
73. ¿Qué información administrativa hace falta para conocer el movimiento económico completo del restaurante?

### Objetivo

Precisar qué significa que los ingresos y egresos no se encuentren completamente integrados.

---

## 7.8. Clientes, créditos, promociones y descuentos

74. ¿Quién puede autorizar una venta a crédito?
75. ¿Todos los clientes pueden acceder a crédito?
76. ¿Existe un límite máximo?
77. ¿Cómo se registran los pagos posteriores?
78. ¿Se aceptan pagos parciales?
79. ¿Existen fechas de vencimiento?
80. ¿Qué ocurre cuando un cliente no paga?
81. ¿Quién puede aplicar descuentos?
82. ¿Los descuentos tienen límites?
83. ¿Cómo funcionan las promociones?
84. ¿Las promociones se registran previamente o se aplican manualmente?

### Objetivo

Identificar reglas de negocio asociadas al crédito y los descuentos.

---

## 7.9. Reportes y toma de decisiones

85. ¿Qué reportes utilizan actualmente?
86. ¿Quién los consulta?
87. ¿Qué información contienen?
88. ¿Qué información necesitan actualmente y no pueden obtener?
89. ¿Qué datos revisan para decidir qué comprar?
90. ¿Qué información necesita la administración para controlar el restaurante?
91. ¿Existe algún reporte que actualmente se prepare de forma manual?

### Objetivo

Determinar necesidades reales de información y evitar crear dashboards o reportes sin utilidad operacional.

---

## 7.10. Cierre y priorización

92. De todos los puntos conversados, ¿cuáles consideras los tres más importantes?
93. ¿Qué funciones deberían existir obligatoriamente en una primera versión?
94. ¿Qué funciones podrían dejarse para una versión posterior?
95. ¿Qué parte del sistema actual no debería modificarse porque ya funciona correctamente?
96. ¿Hay alguna regla o situación especial que no hayamos preguntado?
97. ¿Con qué trabajador sería útil hablar para aclarar alguno de estos procesos?

### Objetivo

Obtener una primera priorización y detectar necesidades de relevamiento adicional.

---

# 8. Preguntas de seguimiento

Durante la entrevista podrán utilizarse preguntas abiertas como:

- ¿Puedes explicarme un ejemplo real?
- ¿Qué ocurre después?
- ¿Quién realiza esa acción?
- ¿Dónde queda registrado?
- ¿Qué ocurre si algo sale mal?
- ¿Eso sucede siempre o solamente en algunos casos?
- ¿Quién puede autorizarlo?
- ¿Cómo saben que esa información es correcta?
- ¿Qué hacen actualmente cuando ocurre esa situación?
- ¿Qué parte resulta más difícil?
- ¿Hay alguna excepción?
- ¿Puedes mostrarme cómo se registra actualmente?

Estas preguntas permiten profundizar sin inducir una respuesta específica.

---

# 9. Registro de evidencia

La evidencia de esta sesión deberá almacenarse dentro del repositorio.

## 9.1. `README.md` de la evidencia

Deberá registrar:

- código de la sesión;
- fecha;
- entrevistada;
- entrevistador;
- modalidad;
- duración real;
- objetivo;
- archivos asociados;
- observaciones;
- estado de la transcripción.

---

# 10. Transcripción

La transcripción del audio será realizada posteriormente por el equipo.

La transcripción deberá:

- representar fielmente lo expresado durante la entrevista;
- diferenciar entrevistador y entrevistada;
- evitar corregir el contenido de forma que cambie su significado;
- conservar dudas, excepciones o contradicciones relevantes;
- marcar como inaudible cualquier fragmento que no pueda recuperarse;
- no inventar respuestas faltantes.

Formato:

```text
[00:00] Miguel:
Pregunta...

[00:18] Ana:
Respuesta...

[01:03] Miguel:
Pregunta de seguimiento...

[01:11] Ana:
Respuesta...
```

No es obligatorio registrar cada segundo si la herramienta utilizada no lo facilita, pero las marcas temporales resultan recomendables para poder volver al audio original.

---

# 11. Método de análisis de resultados

Después de realizar y transcribir la entrevista se aplicará el siguiente procedimiento.

## Paso 1 — Lectura completa

Revisar la transcripción completa sin convertir inmediatamente las respuestas en requisitos.

## Paso 2 — Identificación de evidencia

Detectar afirmaciones relacionadas con:

- procesos;
- dificultades;
- causas;
- efectos;
- reglas;
- excepciones;
- necesidades;
- prioridades;
- actores;
- datos;
- decisiones;
- limitaciones del sistema actual.

## Paso 3 — Comparación con el diagnóstico inicial

Por cada punto relevante determinar si:

```text
CONFIRMA
CORRIGE
AMPLÍA
CONTRADICE
AGREGA
```

la información del documento `01-contexto-y-diagnostico.md`.

## Paso 4 — Registro de preguntas pendientes

Las respuestas incompletas o ambiguas deberán registrarse sin asumir una conclusión.

## Paso 5 — Triangulación cuando sea necesaria

Si una afirmación:

- afecta significativamente el alcance;
- corresponde principalmente a otro rol;
- presenta contradicciones;
- requiere información especializada;

se podrá contactar a otro empleado mediante Ana Paola Viscarra Chambi.

## Paso 6 — Consolidación

Los resultados validados serán transformados posteriormente en:

```text
Evidencia
   ↓
Hallazgo H-XXX
   ↓
Necesidad N-XXX
```

dentro de:

```text
docs/03-hallazgos-y-necesidades.md
```

Todavía no se transformarán directamente en requisitos.

---

# 12. Posible relevamiento adicional

Después de analizar la entrevista principal se decidirá si es necesario consultar otros roles.

## 12.1. Encargado

Podría ser relevante para:

- inventario;
- entradas y bajas;
- compras;
- productos;
- stock;
- reportes.

## 12.2. Contadora

Podría ser relevante para:

- planillas;
- asistencia;
- descuentos;
- pagos;
- gastos;
- cuentas;
- movimientos administrativos.

## 12.3. Mesero

Podría ser relevante para:

- toma de pedidos;
- ventas;
- caja;
- medios de pago;
- funcionamiento del sistema actual;
- problemas durante atención.

## 12.4. Cocinero

Podría ser relevante para:

- comandas;
- producción;
- uso de ingredientes;
- mermas;
- organización de cocina.

Estas preguntas se realizarán **solo si la información obtenida de la Product Owner no es suficiente para tomar decisiones responsables**.

---

# 13. Consideraciones éticas y de privacidad

El relevamiento deberá respetar las siguientes reglas:

1. Informar a los participantes que la información será utilizada para un proyecto académico.
2. Solicitar autorización antes de realizar una grabación.
3. Evitar registrar datos personales innecesarios.
4. No incluir información sensible del negocio que no sea necesaria para el proyecto.
5. No publicar contraseñas, credenciales ni información privada del sistema actual.
6. No modificar respuestas para hacer que coincidan con una solución deseada.
7. No atribuir declaraciones que no hayan sido realizadas.
8. Mantener claramente diferenciadas evidencia, interpretación e hipótesis.
9. Permitir que la Product Owner corrija interpretaciones incorrectas del equipo.

---

# 14. Limitaciones metodológicas

## 14.1. Product Owner como fuente principal

Ana Paola Viscarra Chambi participa simultáneamente como:

- trabajadora actual de Fratelli;
- integrante del equipo;
- Product Owner;
- principal fuente de conocimiento del negocio.

Esta situación aporta conocimiento directo y disponibilidad para validación, pero también puede introducir sesgo al depender principalmente de una sola perspectiva.

### Mitigación

Cuando una decisión importante dependa de un proceso perteneciente principalmente a otro rol, se buscará contrastar la información con otro trabajador si resulta viable.

---

## 14.2. Duración limitada del proyecto

El proyecto dispone aproximadamente de 15 días.

Por esta razón, el relevamiento debe priorizar información que afecte directamente:

- problema central;
- alcance;
- MVP;
- requisitos críticos;
- primera iteración.

No se intentará documentar exhaustivamente cada detalle del restaurante si no aporta a las decisiones del proyecto.

---

## 14.3. Falta inicial de métricas

Actualmente no existen datos cuantitativos confirmados sobre frecuencia, tiempos, errores, pérdidas u otros indicadores.

Cuando una respuesta sea cualitativa, deberá conservarse como tal.

No se inventarán métricas para aparentar mayor precisión.

---

# 15. Criterios para considerar suficiente el relevamiento inicial

El relevamiento inicial podrá considerarse suficiente para avanzar cuando sea posible responder razonablemente:

- ¿cuál es el problema principal?
- ¿quiénes son los usuarios afectados?
- ¿qué evidencia demuestra el problema?
- ¿qué procesos tienen mayor prioridad?
- ¿qué partes ya resuelve adecuadamente el sistema actual?
- ¿qué necesidades no están satisfechas?
- ¿qué reglas principales afectan las funciones candidatas?
- ¿qué información sigue sin conocerse?
- ¿qué puede quedar fuera del proyecto?
- ¿qué debería validarse primero mediante un MVP?

No es necesario conocer todos los detalles del negocio para avanzar.

Sí es necesario conocer suficientemente aquellos que condicionan el producto que se pretende construir.

---

# 16. Productos resultantes del relevamiento

Una vez realizada y analizada la entrevista se actualizarán o crearán los siguientes artefactos:

```text
docs/
├── 01-contexto-y-diagnostico.md        # actualizar
├── 02-relevamiento.md                  # incorporar resultados
├── 03-hallazgos-y-necesidades.md       # crear
└── evidence/
    └── relevamiento/
        └── entrevista-01-ana-viscarra/
            ├── README.md
            ├── detalle-manera-trabajo.pdf
            ├── entrevista-audio.<formato>
            └── transcripcion.md
```

El documento `03-hallazgos-y-necesidades.md` será el siguiente artefacto de análisis después de incorporar la evidencia real de la entrevista.

---

# 17. Estado de esta versión

Esta versión constituye el **plan de relevamiento**.

No contiene todavía resultados de la entrevista formal.

Después de realizar la sesión, incorporar el audio y añadir la transcripción, deberá emitirse una actualización documental que:

1. registre la duración real y datos definitivos de la sesión;
2. analice las respuestas;
3. actualice el diagnóstico;
4. registre contradicciones o correcciones;
5. determine si hacen falta fuentes adicionales;
6. permita crear los hallazgos y necesidades formales.

---

# 18. Control de cambios

| Versión | Fecha      | Descripción                                                                                                     | Estado               |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------- | -------------------- |
| `0.1`   | 19/08/2026 | Plan inicial de relevamiento basado en el documento descriptivo previo y preparación de la entrevista principal | Entrevista pendiente |
