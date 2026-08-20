# 00 — Ficha del Proyecto

## 1. Identificación general

| Campo                            | Valor                                                        |
| -------------------------------- | ------------------------------------------------------------ |
| **Nombre del proyecto**          | Restaurant System                                            |
| **Nombre corto**                 | Restaurant System                                            |
| **Organización objetivo**        | Restaurante Fratelli                                         |
| **Tipo de proyecto**             | Sistema de información para una organización real            |
| **Asignatura**                   | Sistemas de Información III                                  |
| **Docente**                      | Ing. Eddy Roger Calderón Caquiva                             |
| **Carrera / programa**           | Ingeniería de Sistemas                                       |
| **Metodología de gestión**       | Scrum                                                        |
| **Enfoque de desarrollo**        | Iterativo e incremental                                      |
| **Repositorio**                  | https://github.com/Alex-Fernandez-2003/Fratelli-s-System.git |
| **Espacio documental oficial**   | `docs/`                                                      |
| **Fecha de inicio documental**   | 18 de agosto de 2026                                         |
| **Duración estimada disponible** | Aproximadamente 15 días                                      |
| **Fecha objetivo aproximada**    | 3 de septiembre de 2026                                      |
| **Baseline documental inicial**  | v0.1                                                         |

---

## 2. Equipo del proyecto

El proyecto será desarrollado por un equipo de **cuatro estudiantes**.

### Integrantes confirmados

1. **Alex Saúl Fernandez Valdez**
2. **Ana Paola Viscarra Chambi**
3. **Miguel Angel Colque Calizaya**
4. **Josué Matias Arroyo Reynoso**

---

## 3. Organización y contraparte

### Organización objetivo

**Fratelli** es el restaurante sobre el cual se realizará el análisis, diseño y desarrollo del sistema.

El proyecto parte de una situación real del negocio y utilizará evidencia obtenida directamente de una trabajadora con experiencia en sus procesos operativos.

### Contraparte principal

La principal contraparte para el levantamiento, aclaración y validación de necesidades será una **trabajadora con experiencia en el funcionamiento de Fratelli**.

Dentro de la organización Scrum del proyecto, esta contraparte asumirá el rol de:

**Product Owner**

Sus responsabilidades dentro del proyecto serán principalmente:

- representar las necesidades operativas del restaurante;
- aclarar dudas relacionadas con el funcionamiento actual;
- ayudar a priorizar necesidades y funcionalidades;
- validar interpretaciones del equipo;
- revisar incrementos relevantes del producto;
- aceptar o rechazar resultados cuando corresponda;
- aportar retroalimentación durante el desarrollo.

---

## 4. Organización Scrum

El proyecto utilizará **Scrum** como marco de gestión del trabajo, con desarrollo iterativo e incremental.

### Product Owner

**Trabajadora con experiencia en Fratelli — Ana Paola Viscarra Chambi.**

Representa las necesidades del negocio y será la principal fuente de validación funcional del proyecto.

### Scrum Master

**Alex Saúl Fernández Valdez.**

### Developers

El equipo de estudiantes participará en el análisis, diseño, implementación, pruebas y documentación del producto.

Integrantes registrados:

- Alex Saúl Fernandez Valdez.
- Ana Paola Viscarra Chambi.
- Miguel Angel Colque Calizaya.
- Josué Matias Arroyo Reynoso.

La distribución interna de responsabilidades técnicas podrá evolucionar durante el proyecto y no se fija todavía como una división rígida por frontend, backend, base de datos u otras áreas.

---

## 5. Objetivo de esta etapa

La primera etapa del proyecto estará orientada a **comprender y documentar el funcionamiento actual del restaurante antes de definir definitivamente la solución**.

Durante esta etapa se buscará:

- comprender los procesos actuales de Fratelli;
- identificar stakeholders y usuarios;
- organizar la evidencia existente;
- realizar el relevamiento de información faltante;
- identificar hallazgos y necesidades;
- formular el problema central;
- definir los objetivos del proyecto;
- delimitar el alcance y el MVP;
- establecer los requisitos iniciales;
- preparar el Product Backlog;
- alcanzar un estado suficientemente claro para comenzar el desarrollo sin rehacer el análisis principal.

---

## 6. Evidencia inicial disponible

Actualmente se dispone de evidencia documental y de una entrevista formal realizada a Ana Paola Viscarra Chambi, trabajadora actual de Fratelli y Product Owner del proyecto.

### Evidencia documental

Documento descriptivo del flujo y forma de trabajo actual de Fratelli.

Ubicación:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
└── detalle-de-la-manera-de-trabajo.pdf
```

### Evidencia de audio

Ubicación:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
└── entrevista-1-audio.mp3
```

### Transcripción

Ubicación:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
└── transcripcion.md
```

La entrevista fue realizada mediante discord el **19 de agosto de 2026** por **Josué Matias Arroyo Reynoso** y quedó registrada en audio y transcripción.

Los archivos originales de evidencia no deberán modificarse. Los análisis, interpretaciones, hallazgos y necesidades derivados de ellos se documentarán por separado.

---

## 7. Repositorio y estructura general

El repositorio oficial es:

```text
https://github.com/Alex-Fernandez-2003/Fratelli-s-System.git
```

La documentación del proyecto se centralizará dentro de:

```text
docs/
```

El código y los componentes ejecutables se organizarán fuera de dicha carpeta.

Estructura general prevista:

```text
Fratelli-s-System/
├── README.md
├── docs/
│   ├── documentación general
│   ├── requirements/
│   ├── historias/
│   ├── sprints/
│   ├── diagrams/
│   ├── adr/
│   ├── openspec/
│   └── evidence/
├── frontend/
├── backend/
└── otros componentes técnicos según necesidad
```

La estructura podrá ampliarse a medida que el diseño técnico del producto sea definido.

---

## 8. Convenciones documentales iniciales

### Ubicación

Toda documentación de análisis, requisitos, historias, arquitectura, evidencias, decisiones y especificaciones se almacenará dentro de `docs/`.

### Formato

El formato documental principal será **Markdown (`.md`)**.

Los diagramas editables se conservarán preferentemente en formato **PlantUML (`.puml`)** cuando corresponda.

### Identificadores previstos

Se utilizarán identificadores consistentes para mantener trazabilidad:

| Elemento                   | Convención                |
| -------------------------- | ------------------------- |
| Hallazgos                  | `H-001`, `H-002`, ...     |
| Necesidades                | `N-001`, `N-002`, ...     |
| Requisitos funcionales     | `RF-001`, `RF-002`, ...   |
| Requisitos no funcionales  | `RNF-[CAT]-001`           |
| Reglas de negocio          | `RN-001`, `RN-002`, ...   |
| Épicas                     | `EP-01`, `EP-02`, ...     |
| Historias de usuario       | `HU-001`, `HU-002`, ...   |
| Riesgos                    | `R-001`, `R-002`, ...     |
| Decisiones arquitectónicas | `ADR-001`, `ADR-002`, ... |
| Casos de prueba            | `CP-001`, `CP-002`, ...   |

Estas convenciones constituyen una base inicial y podrán ajustarse antes de crear elementos dependientes.

---

## 9. Fuentes de verdad

Para evitar duplicación y contradicciones:

- los **requisitos** tendrán su fuente oficial dentro de `docs/requirements/`;
- el **Product Backlog** tendrá su fuente oficial en `docs/07-product-backlog.md`;
- las **historias detalladas** tendrán su fuente oficial en `docs/historias/`;
- las **reglas de negocio** tendrán su fuente oficial en `docs/requirements/reglas-negocio.md`;
- las **evidencias originales** se conservarán en `docs/evidence/`;
- los **cambios formales posteriores al baseline**, cuando corresponda, se gestionarán mediante `docs/openspec/changes/`.

Los documentos de síntesis deberán referenciar estas fuentes y evitar duplicarlas innecesariamente.

---

## 10. Estado inicial del proyecto

| Elemento                     | Estado                                                      |
| ---------------------------- | ----------------------------------------------------------- |
| Organización objetivo        | Confirmada                                                  |
| Product Owner                | Definido                                                    |
| Equipo de desarrollo         | Equipo de 4                                                 |
| Repositorio                  | Definido                                                    |
| Metodología                  | Scrum                                                       |
| Evidencia documental inicial | Disponible                                                  |
| Audio de relevamiento        | Disponible                                                  |
| Contexto del negocio         | Relevamiento inicial completado                             |
| Problema central             | Diagnóstico listo para consolidar en hallazgos              |
| Necesidades consolidadas     | Pendientes de formalizar en `03-hallazgos-y-necesidades.md` |
| Objetivos                    | Pendientes                                                  |
| Alcance                      | Pendiente                                                   |
| MVP                          | Pendiente                                                   |
| SRS                          | Pendiente                                                   |
| Product Backlog              | Pendiente                                                   |
| Historias de usuario         | Pendientes                                                  |
| Arquitectura                 | Pendiente                                                   |
| Stack tecnológico            | Pendiente de decisión                                       |
| Modelo de datos              | Pendiente                                                   |
| Primer Sprint                | Pendiente de planificación                                  |

---

## 11. Control documental

| Campo                | Valor                                       |
| -------------------- | ------------------------------------------- |
| Documento            | `00-ficha-proyecto.md`                      |
| Versión actual       | `0.2`                                       |
| Estado               | Ficha actualizada tras relevamiento inicial |
| Última actualización | 20 de agosto de 2026                        |
| Próxima revisión     | Antes de iniciar Sprint 0                   |
