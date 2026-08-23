# 08 — Scrum y refinamiento

## 1. Propósito

Este documento define cómo se aplicará **Scrum** en el desarrollo de **Restaurant System** para Fratelli, tomando como punto de partida la baseline ya consolidada de análisis, requisitos y Product Backlog.

Su objetivo es establecer una forma común de trabajar antes de iniciar la ejecución de los Sprints:

```text
Product Backlog
        ↓
Refinamiento
        ↓
Definition of Ready
        ↓
Ready
        ↓
Sprint Planning
        ↓
Sprint Backlog
        ↓
Implementación
        ↓
Review
        ↓
Definition of Done
        ↓
Done
        ↓
Incremento
```

Este archivo no asigna todavía las historias concretas de cada Sprint.

La selección de historias se realizará en el **Sprint Planning** correspondiente, considerando prioridad, dependencias, capacidad real del equipo y estado de refinamiento.

---

# 2. Estado documental

| Campo                               | Valor                                    |
| ----------------------------------- | ---------------------------------------- |
| **Documento**                       | `docs/08-scrum-y-refinamiento.md`        |
| **Proyecto**                        | Restaurant System                        |
| **Organización objetivo**           | Restaurante Fratelli                     |
| **Metodología**                     | Scrum                                    |
| **Product Backlog**                 | `docs/07-product-backlog.md`             |
| **Tablero operativo**               | GitHub Projects                          |
| **Método de priorización**          | MoSCoW + orden relativo del backlog      |
| **Método de estimación**            | Story Points con escala Fibonacci        |
| **Cantidad planificada de Sprints** | 3                                        |
| **Duración de cada Sprint**         | 4 días de trabajo                        |
| **Duración iterativa planificada**  | 12 días de trabajo                       |
| **Daily Scrum**                     | Diaria, 21:00–21:15                      |
| **Modalidad Daily**                 | Presencial durante la clase              |
| **Estado**                          | Baseline Scrum previa al Sprint Planning |

---

# 3. Baseline de entrada

Antes de iniciar los Sprints ya se dispone de:

- contexto y diagnóstico;
- relevamiento mediante tres técnicas;
- hallazgos y necesidades;
- objetivos;
- alcance y MVP;
- SRS;
- requisitos funcionales;
- requisitos no funcionales;
- reglas de negocio;
- Product Backlog;
- prioridades;
- estimaciones iniciales;
- dependencias;
- criterios de aceptación iniciales;
- GitHub Projects configurado;
- convención documental para historias ejecutadas.

Las técnicas de relevamiento utilizadas fueron:

```text
Entrevistas semiestructuradas
+
Análisis de antecedentes
+
Análisis de sistemas similares / benchmarking
```

Las dos entrevistas pertenecen a la misma técnica.

La segunda entrevista permitió completar reglas que anteriormente mantenían bloqueadas varias historias relacionadas con:

- composición;
- producción;
- compras;
- turnos;
- cálculo de cierre;
- cierre de caja.

Por ello esas historias ya pueden permanecer en `Backlog` como candidatas a revisión DoR y no requieren conservar el estado `Blocked` por falta de información.

---

# 4. Equipo Scrum

## 4.1. Integrantes

El Scrum Team está compuesto por:

| Integrante                       | Responsabilidad Scrum                                        |
| -------------------------------- | ------------------------------------------------------------ |
| **Ana Paola Viscarra Chambi**    | Product Owner + Developer cuando participe en implementación |
| **Alex Saúl Fernandez Valdez**   | Scrum Master + Developer                                     |
| **Miguel Angel Colque Calizaya** | Developer                                                    |
| **Josué Matias Arroyo Reynoso**  | Developer                                                    |

El equipo trabaja de forma conjunta sobre un único producto.

No se crearán equipos Scrum separados para frontend y backend.

---

# 5. Product Owner

La Product Owner es:

```text
Ana Paola Viscarra Chambi
```

Sus responsabilidades dentro del proyecto son:

- mantener la visión funcional del producto;
- aclarar necesidades del negocio;
- validar prioridades;
- participar en el refinamiento;
- responder o canalizar dudas sobre reglas de Fratelli;
- aceptar o rechazar cambios de alcance;
- validar funcionalmente incrementos cuando corresponda;
- ayudar a resolver ambigüedades que afecten el valor del producto.

La Product Owner también pertenece al equipo del proyecto y podrá participar en tareas de implementación cuando sea necesario.

Su función como PO no implica que deba implementar todas las historias que valida.

---

# 6. Scrum Master

El Scrum Master es:

```text
Alex Saúl Fernandez Valdez
```

Sus responsabilidades incluyen:

- facilitar la aplicación de Scrum;
- mantener el flujo de trabajo;
- facilitar Daily Scrum, Sprint Planning, Review y Retrospective;
- identificar impedimentos;
- ayudar a que las historias cumplan Definition of Ready antes de entrar a un Sprint;
- verificar que el tablero refleje el estado real;
- controlar que una historia no pase a `Done` sin cumplir la Definition of Done;
- realizar la revisión previa obligatoria de cada historia antes de `Done`;
- promover la actualización de documentación, pruebas y evidencias.

Además del rol de Scrum Master, Alex participará activamente como Developer.

---

# 7. Distribución técnica del trabajo

## 7.1. Responsabilidad principal de Alex

Se establece la siguiente distribución inicial:

> **Alex Saúl Fernandez Valdez será el principal responsable de todo el trabajo que no corresponda al frontend y también participará en determinadas historias o tareas de frontend.**

Esto puede incluir, según la arquitectura que posteriormente se defina:

- lógica de negocio;
- backend;
- persistencia;
- base de datos;
- integraciones;
- seguridad técnica;
- configuración;
- infraestructura;
- otras tareas no visuales.

La mención de estas áreas no define todavía tecnologías concretas.

Las tecnologías y componentes se formalizarán posteriormente en la documentación de arquitectura.

---

## 7.2. Participación en frontend

Alex también podrá participar en frontend cuando:

- una historia requiera trabajo vertical de extremo a extremo;
- exista dependencia entre interfaz y lógica;
- sea necesario equilibrar la carga;
- el Sprint Planning así lo determine.

Por esta razón es esperable que Alex participe directa o indirectamente en una cantidad elevada de historias.

---

## 7.3. Resto del equipo

Los demás Developers se orientarán principalmente al trabajo de frontend y a las tareas que se les asignen durante cada Sprint.

La asignación exacta por historia se realizará durante Sprint Planning.

No se considera obligatorio que:

```text
1 historia = 1 integrante
```

Una historia podrá tener varios participantes cuando requiera trabajo en distintas capas.

---

# 8. Historias verticales y tareas técnicas

Las historias de usuario representan valor de producto.

Por tanto:

```text
HU-012 — Registrar y confirmar una venta
```

sigue siendo **una sola historia**, aunque pueda requerir:

```text
Frontend
Backend
Base de datos
Pruebas
Documentación
```

No deberá dividirse artificialmente en:

```text
HU-012 Frontend
HU-012 Backend
```

como si fueran historias independientes.

Cuando sea necesario repartir trabajo, se utilizarán:

- sub-issues;
- tareas técnicas;
- checklist dentro de la Issue;
- asignación múltiple;
- ramas o Pull Requests relacionados.

La historia principal conserva:

- ID;
- valor;
- criterios de aceptación;
- prioridad;
- Story Points;
- estado de producto.

---

# 9. Riesgo operativo por concentración técnica

La distribución acordada implica que Alex será responsable de la mayoría de tareas no frontend y de parte del frontend.

Esto genera un riesgo operativo:

```text
muchas historias
        ↓
dependen de trabajo técnico de una misma persona
        ↓
posible cuello de botella
```

## Mitigaciones

Durante Sprint Planning se deberá:

- evitar abrir demasiadas historias dependientes de Alex al mismo tiempo;
- priorizar dependencias técnicas que habiliten trabajo del resto del equipo;
- permitir que frontend avance en paralelo cuando sea posible;
- dividir internamente las historias en tareas técnicas;
- limitar trabajo en progreso;
- registrar impedimentos en el Daily;
- revisar la carga real antes de comprometer nuevas historias.

Este riesgo no modifica la responsabilidad acordada, pero deberá considerarse en cada Sprint.

---

# 10. Artefactos Scrum del proyecto

## 10.1. Product Backlog

Fuente documental principal:

```text
docs/07-product-backlog.md
```

Contiene:

- épicas;
- historias;
- prioridades;
- Story Points;
- dependencias;
- criterios de aceptación iniciales;
- trazabilidad;
- alcance MVP/Post-MVP.

GitHub Projects mantiene el estado operativo de esas historias.

---

## 10.2. Sprint Backlog

Cada Sprint tendrá su propio conjunto de historias seleccionadas.

El Sprint Backlog incluirá:

- Sprint Goal;
- HU seleccionadas;
- responsables;
- tareas necesarias;
- dependencias;
- estado de ejecución;
- ajustes realizados durante el Sprint.

La estructura documental específica de los Sprints se mantendrá en:

```text
docs/sprints/
```

---

## 10.3. Incremento

Al finalizar cada Sprint deberá existir un incremento integrado y verificable.

Un incremento no se considera válido únicamente porque existan archivos de código.

Debe poder demostrarse mediante:

- comportamiento funcional;
- criterios de aceptación;
- pruebas;
- evidencia;
- integración con lo construido anteriormente.

---

# 11. GitHub Projects

GitHub Projects será la fuente operativa principal del estado de trabajo.

Las columnas confirmadas son:

```text
Backlog
Ready
In Progress
Review
Done
Blocked
```

No existe una columna separada denominada:

```text
Testing
```

Las pruebas forman parte del flujo de implementación y revisión y son requisito para `Done`.

---

# 12. Política de estados

## 12.1. Backlog

Una historia permanece en `Backlog` cuando:

- pertenece al Product Backlog;
- está priorizada;
- todavía no fue seleccionada para desarrollo inmediato;
- o aún no ha completado la comprobación formal de Definition of Ready.

Una historia en Backlog puede estar suficientemente definida, pero:

```text
Backlog ≠ Ready
```

---

## 12.2. Ready

Una historia pasa a `Ready` únicamente si:

- cumple la Definition of Ready;
- no tiene bloqueos críticos;
- posee información suficiente para comenzar;
- sus dependencias relevantes permiten planificarla;
- el equipo entiende qué debe construirse y cómo verificarlo.

`Ready` significa:

> disponible para ser seleccionada durante Sprint Planning.

No significa:

> obligatoriamente incluida en el siguiente Sprint.

---

## 12.3. In Progress

Una historia pasa a `In Progress` cuando:

- fue seleccionada para el Sprint;
- tiene al menos un responsable;
- comenzó trabajo real de implementación.

Al entrar a este estado podrá crearse su archivo en:

```text
docs/historias/HU-XXX-nombre.md
```

La documentación se completa durante la ejecución, no antes.

---

## 12.4. Review

Una historia pasa a `Review` cuando:

- su implementación principal está terminada;
- se ejecutaron las pruebas previstas;
- existen resultados verificables;
- sus criterios de aceptación pueden comprobarse;
- las evidencias necesarias están disponibles.

En `Review` se realiza la revisión obligatoria del Scrum Master.

---

## 12.5. Done

Una historia pasa a `Done` solo cuando:

```text
cumple criterios de aceptación
+
cumple Definition of Done
+
fue revisada por Scrum Master
+
posee evidencia suficiente
```

Cuando corresponda, también deberá existir validación funcional del Product Owner.

---

## 12.6. Blocked

`Blocked` se utilizará cuando una historia que podría avanzar se encuentre detenida por un impedimento real, por ejemplo:

- regla de negocio faltante;
- dependencia no resuelta;
- acceso no disponible;
- decisión pendiente;
- problema técnico que impide continuar;
- información crítica ausente.

No deberá utilizarse simplemente para representar:

```text
aún no comenzada
```

Para eso existe:

```text
Backlog
```

---

# 13. Flujo normal

El flujo operativo esperado es:

```text
Backlog
   ↓
Ready
   ↓
In Progress
   ↓
Review
   ↓
Done
```

`Blocked` funciona como estado excepcional:

```text
Ready / In Progress
        ↓
     Blocked
        ↓
se resuelve impedimento
        ↓
estado apropiado
```

---

# 14. Priorización

El Product Backlog utiliza:

```text
MoSCoW
```

con las categorías:

- MUST;
- SHOULD;
- COULD;
- WON'T.

La prioridad ayuda a decidir qué aporta mayor valor o qué habilita otras historias.

Sin embargo:

```text
MUST ≠ READY
```

Una historia MUST no puede entrar a Sprint si mantiene un bloqueo crítico.

---

# 15. Estimación

Se utiliza Story Points con escala Fibonacci:

```text
1
2
3
5
8
13
```

Los Story Points son una medida relativa de:

- tamaño;
- complejidad;
- incertidumbre;
- esfuerzo comparativo.

No representan:

- horas;
- días;
- número de integrantes;
- fecha de entrega.

Por tanto:

```text
5 SP ≠ 5 horas
```

---

# 16. Reestimación

La estimación inicial del Product Backlog podrá cambiar durante refinamiento cuando aparezca información nueva.

Una reestimación deberá realizarse cuando:

- cambie el alcance de una historia;
- se descubran reglas relevantes;
- una dependencia aumente o reduzca complejidad;
- una historia deba dividirse;
- la comprensión inicial haya sido incorrecta.

No se cambiarán Story Points únicamente para hacer que una historia “encaje” artificialmente en un Sprint.

---

# 17. Velocidad

El equipo todavía no dispone de velocidad histórica.

Por ello no se utilizará una fórmula como:

```text
Sprint = 40 SP
```

sin evidencia previa.

Durante los primeros Sprints se observará:

```text
SP comprometidos
SP terminados
historias terminadas
historias arrastradas
impedimentos
```

La velocidad observada servirá como referencia interna, no como medida individual de productividad.

---

# 18. Estructura temporal de los Sprints

Se realizarán:

```text
Sprint 1
4 días

Sprint 2
4 días

Sprint 3
4 días
```

Total planificado:

```text
12 días de trabajo iterativo
```

Las fechas concretas de inicio y cierre se registrarán en cada archivo de Sprint.

---

# 19. Eventos Scrum

## 19.1. Sprint Planning

Se realizará al inicio de cada Sprint.

Objetivos:

- definir Sprint Goal;
- revisar historias Ready;
- analizar dependencias;
- considerar capacidad real;
- seleccionar historias;
- asignar responsables;
- identificar tareas técnicas;
- reconocer riesgos inmediatos.

No se seleccionarán historias únicamente por sumar una determinada cantidad de Story Points.

---

## 19.2. Daily Scrum

Se realizará:

| Campo                           | Valor                          |
| ------------------------------- | ------------------------------ |
| **Frecuencia**                  | Diaria durante días de trabajo |
| **Horario**                     | 21:00–21:15                    |
| **Duración máxima planificada** | 15 minutos                     |
| **Modalidad**                   | Presencial                     |
| **Contexto**                    | Durante la clase               |

El objetivo es sincronizar al equipo.

Cada integrante debe poder comunicar de forma breve:

```text
¿Qué avancé?
¿Qué haré ahora?
¿Tengo algún bloqueo?
```

No debe convertirse en:

- reunión extensa;
- exposición al Scrum Master;
- sesión técnica completa;
- espacio para resolver todos los problemas.

Si aparece un problema que requiere discusión larga, se trata después del Daily con las personas necesarias.

---

## 19.3. Refinamiento

El refinamiento se realizará de forma continua durante el proyecto.

Debido a la corta duración de los Sprints, no se reservará obligatoriamente una reunión extensa independiente para cada refinamiento.

Podrá realizarse:

- después del Daily;
- antes del Sprint Planning;
- durante sesiones breves del equipo;
- mediante consulta al Product Owner;
- mediante actualización documental cuando aparezca nueva evidencia.

---

## 19.4. Sprint Review

Se realizará al cierre de cada Sprint.

Objetivos:

- demostrar el incremento;
- revisar historias terminadas;
- comprobar criterios de aceptación;
- recibir observaciones;
- identificar cambios necesarios;
- revisar el estado del Product Backlog.

No se fija una hora concreta en esta baseline.

---

## 19.5. Sprint Retrospective

Se realizará al cierre de cada Sprint, después de revisar el incremento.

El equipo analizará:

- qué funcionó;
- qué generó retrasos;
- qué dependencias causaron problemas;
- cómo fue la distribución del trabajo;
- si hubo exceso de WIP;
- cómo mejorar el siguiente Sprint.

Las acciones acordadas deberán ser concretas y aplicables al Sprint siguiente.

---

# 20. Refinamiento del Product Backlog

El refinamiento tiene como objetivo convertir elementos del Backlog en historias suficientemente entendidas para entrar a `Ready`.

No consiste únicamente en reescribir la descripción.

Para cada historia se revisará, cuando corresponda:

- objetivo;
- actor;
- valor;
- alcance;
- requisitos;
- reglas de negocio;
- datos;
- precondiciones;
- flujo principal;
- alternativas;
- errores;
- permisos;
- dependencias;
- riesgos;
- criterios de aceptación;
- pruebas esperadas;
- tamaño;
- prioridad.

---

# 21. Definition of Ready

Una historia puede considerarse `Ready` cuando cumple los criterios aplicables de la siguiente lista.

## 21.1. Checklist DoR

### Identidad

- [ ] Tiene ID.
- [ ] Tiene título claro.
- [ ] Está asociada a una épica.
- [ ] Identifica actor o rol.

### Valor

- [ ] Está redactada como historia de usuario o expresa claramente el valor esperado.
- [ ] Tiene beneficio identificable.
- [ ] Responde a una necesidad, requisito o capacidad necesaria del MVP.

### Alcance

- [ ] Se entiende qué incluye.
- [ ] Se entiende qué no incluye cuando existe riesgo de ambigüedad.
- [ ] No introduce silenciosamente funcionalidad Post-MVP.

### Requisitos

- [ ] Tiene RF asociados cuando corresponde.
- [ ] Tiene RNF relacionados cuando corresponde.
- [ ] Tiene reglas de negocio identificadas.
- [ ] No contradice el SRS vigente.

### Comportamiento

- [ ] Tiene criterios de aceptación verificables.
- [ ] Tiene camino principal suficientemente entendido.
- [ ] Tiene alternativas relevantes identificadas.
- [ ] Tiene excepciones relevantes identificadas.

### Datos

- [ ] Se conocen los datos principales necesarios.
- [ ] No depende de campos críticos todavía indefinidos.

### Dependencias

- [ ] Sus dependencias están identificadas.
- [ ] No existe dependencia crítica desconocida.
- [ ] Se conoce si otra historia debe ejecutarse antes.

### Riesgo

- [ ] Los riesgos importantes están reconocidos.
- [ ] No existe bloqueo crítico sin resolver.

### Estimación

- [ ] Tiene Story Points cuando pertenece al MVP.
- [ ] El tamaño sigue siendo razonable.
- [ ] Si es demasiado grande, fue revisada para posible división.

### Pruebas

- [ ] El equipo sabe cómo comprobar sus criterios principales.

---

# 22. CANDIDATA A READY vs READY

El Product Backlog utiliza el estado documental:

```text
CANDIDATA A READY
```

Esto significa:

> la historia dispone de una definición inicial suficiente para someterse a revisión DoR.

No significa que ya haya pasado formalmente la checklist.

El flujo es:

```text
CANDIDATA A READY
        ↓
Backlog
        ↓
Revisión DoR
        ↓
si cumple
        ↓
Ready
```

---

# 23. Historias anteriormente bloqueadas

Durante la primera versión del Product Backlog se identificaron como bloqueadas:

```text
HU-004
HU-007
HU-017
HU-025
HU-026
HU-027
```

La segunda entrevista permitió obtener información adicional sobre:

- unidades y conversiones;
- producción;
- bajas;
- existencias preparadas;
- compras;
- recepción;
- turnos;
- monto inicial;
- caja compartida;
- cierre único;
- caja chica;
- diferencias;
- PedidosYa;
- responsables del cierre.

Por tanto, estas historias ya no mantienen un bloqueo documental por falta de información y su estado operativo inicial debe ser:

```text
Backlog
```

con estado documental:

```text
CANDIDATA A READY
```

Antes de entrar a un Sprint deberán pasar por la misma Definition of Ready que el resto.

---

# 24. Historias críticas

El Product Backlog identifica inicialmente las siguientes historias críticas:

```text
HU-001
HU-002
HU-003
HU-005
HU-007
HU-009
HU-010
HU-012
HU-017
HU-018
HU-022
HU-025
HU-026
HU-027
```

Reciben atención especial porque:

- habilitan otras historias;
- representan operación central;
- concentran reglas;
- afectan inventario, caja o seguridad;
- tienen dependencias relevantes;
- pueden generar retrabajo si se implementan incorrectamente.

---

# 25. Checklist adicional para historias críticas

Antes de mover una historia crítica a `Ready`, se deberá revisar además:

- [ ] objetivo;
- [ ] beneficio;
- [ ] actor;
- [ ] precondiciones;
- [ ] entradas;
- [ ] flujo principal;
- [ ] alternativas;
- [ ] excepciones;
- [ ] reglas;
- [ ] entidades/datos implicados;
- [ ] integraciones cuando existan;
- [ ] riesgos;
- [ ] dependencias;
- [ ] criterios;
- [ ] pruebas esperadas.

No es necesario crear todavía un archivo individual en `docs/historias/`.

La historia individual se documentará cuando comience su ejecución.

---

# 26. Definition of Done

Una historia se considera `Done` únicamente cuando cumple los criterios aplicables.

## 26.1. Implementación

- [ ] La funcionalidad está implementada.
- [ ] La solución compila/ejecuta correctamente.
- [ ] Está integrada con el incremento existente.
- [ ] No existe implementación parcial presentada como completa.

## 26.2. Criterios de aceptación

- [ ] Todos los criterios obligatorios fueron verificados.
- [ ] Las reglas de negocio aplicables se cumplen.
- [ ] Los permisos aplicables se cumplen.
- [ ] Los flujos alternativos relevantes fueron revisados.

## 26.3. Pruebas

- [ ] Se ejecutaron las pruebas previstas.
- [ ] Las pruebas principales poseen resultado verificable.
- [ ] No existen defectos críticos conocidos que impidan aceptar la historia.

## 26.4. Revisión

- [ ] La historia pasó por `Review`.
- [ ] Fue revisada por el Scrum Master.
- [ ] Las observaciones de revisión fueron resueltas o documentadas.

## 26.5. Documentación

- [ ] Existe archivo de historia cuando corresponde.
- [ ] Se documentó qué se implementó.
- [ ] Se actualizaron requisitos si cambió comportamiento.
- [ ] Se actualizaron diagramas si cambió diseño.
- [ ] Se actualizará la trazabilidad correspondiente.

## 26.6. Evidencia

- [ ] Existe evidencia verificable.
- [ ] La evidencia corresponde realmente a la historia.
- [ ] La evidencia permite demostrar los criterios principales.

## 26.7. Aceptación

- [ ] Existe aceptación funcional cuando corresponda.
- [ ] No existe un cambio de alcance pendiente sin registrar.

---

# 27. Revisión obligatoria por Scrum Master

Toda historia debe ser revisada antes de entrar a:

```text
Done
```

El responsable de esa revisión será:

```text
Alex Saúl Fernandez Valdez
Scrum Master
```

La revisión deberá comprobar como mínimo:

```text
criterios
+
implementación
+
pruebas
+
evidencia
+
documentación
```

---

## 27.1. Cuando el Scrum Master también implementó la historia

Debido a la distribución técnica acordada, Alex también participará como Developer en muchas historias.

Cuando sea implementador de una HU, la revisión seguirá siendo obligatoria.

En esos casos deberá realizarse mediante:

- checklist explícita de DoD;
- ejecución de pruebas;
- evidencia verificable;
- revisión de criterios;
- registro de observaciones;
- validación funcional del Product Owner cuando corresponda.

Esto no se utilizará para omitir la revisión por el hecho de que Scrum Master y Developer sean la misma persona en esa historia.

---

# 28. Testing dentro del flujo

No existe columna `Testing`.

Por tanto:

```text
Testing
```

es una actividad y no un estado independiente del tablero.

Las pruebas pueden ejecutarse:

```text
durante In Progress
+
antes de Review
+
durante Review cuando sea necesario
```

Una historia no puede salir de `Review` hacia `Done` si todavía faltan pruebas necesarias.

---

# 29. Documentación de una historia durante ejecución

La carpeta:

```text
docs/historias/
```

comienza únicamente con:

```text
README.md
```

Cuando una historia entra a ejecución se podrá crear:

```text
HU-XXX-nombre-corto.md
```

Ese archivo debe evolucionar junto con la historia.

Deberá registrar, según corresponda:

- responsable;
- Sprint;
- alcance trabajado;
- criterios;
- decisiones;
- implementación;
- pruebas;
- evidencias;
- incidencias;
- commits/PR;
- resultado final.

---

# 30. Evidencias

Las evidencias de implementación deberán demostrar resultados reales.

Pueden incluir:

- capturas;
- resultados de pruebas;
- logs;
- respuestas de API;
- registros de base de datos;
- demostraciones;
- referencias a commits;
- Pull Requests;
- validaciones.

No se considerará evidencia válida una captura meramente decorativa.

---

# 31. Sprint Planning

Antes de incorporar una HU al Sprint se seguirá el siguiente proceso:

```text
Historia en Ready
        ↓
Revisar prioridad
        ↓
Revisar dependencias
        ↓
Revisar capacidad real
        ↓
Revisar carga por integrante
        ↓
Revisar riesgo técnico
        ↓
Seleccionar para Sprint
```

---

# 32. Sprint Goal

Cada Sprint tendrá un objetivo breve y verificable.

Ejemplo conceptual:

```text
“Disponer del núcleo necesario para operar X flujo”
```

El Sprint Goal no debe ser simplemente:

```text
“terminar 10 historias”
```

Debe expresar el valor o incremento buscado.

El Sprint Goal concreto se definirá en el Sprint Planning correspondiente.

---

# 33. Capacidad del Sprint

La capacidad no se calculará únicamente mediante Story Points.

Se considerará:

- disponibilidad de cada integrante;
- duración de 4 días;
- dependencias;
- trabajo frontend;
- trabajo no frontend;
- concentración técnica en Alex;
- incertidumbre;
- historias arrastradas;
- pruebas y revisión.

No se comprometerán historias únicamente porque “quepan” matemáticamente en una suma de SP.

---

# 34. WIP — trabajo en progreso

El equipo procurará limitar la cantidad de historias abiertas simultáneamente.

Especialmente se evitará:

```text
muchas historias In Progress
+
todas esperando backend / base de datos / integración
```

porque ello incrementaría el cuello de botella técnico.

La prioridad será:

```text
terminar
antes que
comenzar indiscriminadamente
```

---

# 35. Gestión de bloqueos

Cuando aparezca un bloqueo:

1. se identifica;
2. se comunica en el Daily;
3. se registra en la tarjeta;
4. se determina quién puede resolverlo;
5. la historia pasa a `Blocked` si realmente no puede continuar;
6. se resuelve o se toma una decisión;
7. la historia vuelve al estado adecuado.

El bloqueo debe indicar:

```text
qué impide avanzar
+
qué se necesita para resolverlo
```

---

# 36. Gestión de cambios durante un Sprint

Un Sprint no convierte las historias en especificaciones inmutables.

Si aparece nueva información:

```text
Nueva evidencia / problema
        ↓
analizar
        ↓
determinar impacto
        ↓
consultar Product Owner si afecta producto
        ↓
actualizar especificación
        ↓
actualizar historia
        ↓
actualizar pruebas
```

No se implementarán cambios funcionales silenciosos.

---

# 37. Cambio de alcance

Si una modificación afecta:

- MVP;
- requisito;
- prioridad;
- regla;
- aceptación;
- dependencia;
- Post-MVP;

deberá registrarse antes de considerarse parte normal de la historia.

Cuando el cambio sea significativo, se actualizarán los documentos afectados.

---

# 38. Pull Requests y revisión técnica

Los Pull Requests podrán utilizarse para organizar trabajo, revisión e integración.

No se establece en esta baseline que **todo cambio deba obligatoriamente poseer un PR independiente**.

Sin embargo, cuando exista PR deberá:

- relacionarse con la HU o tarea;
- describir el cambio;
- evitar mezclar trabajo ajeno innecesario;
- pasar revisión antes de integrarse cuando corresponda.

La política podrá endurecerse si el equipo lo considera necesario durante los Sprints.

---

# 39. Seguimiento del Sprint

Durante cada Sprint se deberá mantener actualizado:

```text
GitHub Projects
```

especialmente:

- estado;
- responsable;
- Sprint;
- bloqueos;
- historias terminadas.

El tablero debe representar el estado real y no un estado deseado.

---

# 40. Métricas iniciales

Se podrán registrar:

- historias comprometidas;
- historias Done;
- Story Points comprometidos;
- Story Points Done;
- historias arrastradas;
- bloqueos;
- defectos relevantes;
- tiempo aproximado bloqueado cuando sea útil.

Estas métricas se utilizarán para inspección y mejora.

No se utilizarán para medir individualmente a los integrantes.

---

# 41. Sprint Review — evidencia mínima

Al finalizar el Sprint deberá ser posible demostrar:

```text
qué se planificó
qué se terminó
qué no se terminó
qué funciona
qué se probó
qué cambió
qué debe continuar
```

Las historias no terminadas no serán marcadas como Done por razones de presentación.

---

# 42. Sprint Retrospective — puntos mínimos

En cada retrospectiva se revisará:

- colaboración;
- distribución de trabajo;
- concentración técnica;
- calidad de historias;
- bloqueos;
- revisión;
- pruebas;
- documentación;
- comunicación;
- cumplimiento del Sprint Goal.

Se intentará definir al menos una mejora concreta para el Sprint siguiente.

---

# 43. Política para trabajo no terminado

Si una historia no cumple DoD al finalizar un Sprint:

```text
NO → Done parcial
```

La historia permanecerá en un estado coherente con la realidad y se replanificará.

Se analizará:

- cuánto falta;
- por qué no terminó;
- si cambió su estimación;
- si mantiene prioridad;
- si debe continuar en el siguiente Sprint.

---

# 44. Post-MVP

Las historias Post-MVP permanecen en:

```text
Backlog
```

pero no son candidatas a `Ready` para esta entrega salvo que exista:

- cambio de alcance;
- aprobación del Product Owner;
- análisis de impacto;
- actualización documental.

No deben entrar a un Sprint únicamente porque exista tiempo técnico para desarrollarlas.

---

# 45. Ready to Sprint

Antes de iniciar un Sprint deberá verificarse:

- [ ] Sprint Goal definido.
- [ ] Historias seleccionadas desde Ready.
- [ ] Prioridades revisadas.
- [ ] Dependencias revisadas.
- [ ] Responsables definidos.
- [ ] Capacidad real considerada.
- [ ] Riesgos principales reconocidos.
- [ ] Trabajo técnico distribuido.
- [ ] Criterios de aceptación disponibles.
- [ ] Forma de prueba entendida.
- [ ] No existen bloqueos críticos conocidos en las HU comprometidas.

---

# 46. Ready to Develop

Antes de comenzar la implementación de una historia:

- [ ] está en el Sprint actual;
- [ ] está asignada;
- [ ] cumple DoR;
- [ ] sus criterios son entendidos;
- [ ] sus dependencias están disponibles;
- [ ] se sabe qué resultado debe producir;
- [ ] existe claridad suficiente para comenzar sin rehacer el análisis principal.

---

# 47. Relación entre documentos

La relación documental queda:

```text
07-product-backlog.md
        ↓
08-scrum-y-refinamiento.md
        ↓
Sprint Planning
        ↓
docs/sprints/
        ↓
GitHub Projects
        ↓
docs/historias/HU-XXX-*.md
        ↓
Implementación + evidencia
```

`07-product-backlog.md` define **qué existe y su prioridad**.

`08-scrum-y-refinamiento.md` define **cuándo una historia está preparada y cómo se trabaja**.

Los documentos de Sprint definirán **qué se ejecutará en cada iteración**.

Los archivos de historias documentarán **qué se hizo realmente**.

---

# 48. Lo que este documento no decide

Este documento no define todavía:

- tecnologías;
- arquitectura;
- modelo de datos;
- diseño visual;
- prototipos;
- historias exactas del Sprint 1;
- cantidad fija de SP por Sprint;
- fechas exactas de cada Sprint;
- ramas obligatorias;
- stack frontend/backend.

Estas decisiones se documentarán en los bloques correspondientes.

---

# 49. Próximo paso

Con esta baseline Scrum ya se dispone de:

```text
Product Backlog
+
tablero
+
estados
+
Definition of Ready
+
Definition of Done
+
política de refinamiento
+
eventos Scrum
+
3 Sprints de 4 días
```

El siguiente bloque documental previsto es:

```text
docs/09-ux-y-flujos.md
```

Sin embargo, antes de comenzar la implementación deberá realizarse posteriormente el Sprint Planning correspondiente cuando estén disponibles las condiciones de diseño, arquitectura, datos y pruebas necesarias para las historias seleccionadas.

---

# 50. Control de cambios

| Versión | Descripción                                                                                                                                                                  | Estado  |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `0.1`   | Baseline Scrum: roles, 3 Sprints de 4 días, Daily 21:00–21:15, GitHub Projects, DoR, DoD, refinamiento, revisión obligatoria por Scrum Master y distribución técnica inicial | Vigente |
