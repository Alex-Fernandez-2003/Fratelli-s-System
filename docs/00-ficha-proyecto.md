# 00 — Ficha del Proyecto

## 1. Identificación general

| Campo | Valor |
|---|---|
| **Nombre del proyecto** | Restaurant System |
| **Organización objetivo** | Restaurante Fratelli |
| **Tipo de proyecto** | Sistema de información para una organización real |
| **Asignatura** | Sistemas de Información III |
| **Docente** | Ing. Eddy Roger Calderón Caquiva |
| **Carrera / programa** | Ingeniería de Sistemas |
| **Metodología de gestión** | Scrum |
| **Enfoque de desarrollo** | Iterativo e incremental |
| **Repositorio** | https://github.com/Alex-Fernandez-2003/Fratelli-s-System.git |
| **Espacio documental oficial** | `docs/` |
| **Fecha de inicio documental** | 18 de agosto de 2026 |
| **Duración estimada disponible** | Aproximadamente 15 días |
| **Fecha objetivo aproximada** | 3 de septiembre de 2026 |
| **Versión documental actual** | `0.3` |
| **Última actualización** | 21 de agosto de 2026 |

---

## 2. Equipo del proyecto

El proyecto es desarrollado por cuatro estudiantes:

1. **Alex Saúl Fernandez Valdez**
2. **Ana Paola Viscarra Chambi**
3. **Miguel Angel Colque Calizaya**
4. **Josué Matias Arroyo Reynoso**

---

## 3. Organización y contraparte

**Fratelli** es la organización objetivo.

La principal contraparte funcional es **Ana Paola Viscarra Chambi**, trabajadora actual de Fratelli e integrante del equipo. Dentro de Scrum desempeña el rol de **Product Owner**.

Sus responsabilidades principales dentro del proyecto son:

- representar las necesidades operativas del restaurante;
- aclarar dudas relacionadas con el funcionamiento actual;
- ayudar a priorizar necesidades y funcionalidades;
- validar interpretaciones del equipo;
- revisar incrementos relevantes;
- aceptar o rechazar resultados cuando corresponda.

---

## 4. Organización Scrum

### Product Owner

**Ana Paola Viscarra Chambi**.

### Scrum Master

**Alex Saúl Fernandez Valdez**.

### Developers

- Alex Saúl Fernandez Valdez;
- Ana Paola Viscarra Chambi;
- Miguel Angel Colque Calizaya;
- Josué Matias Arroyo Reynoso.

La distribución técnica no se fija de forma rígida por frontend/backend. Las historias de usuario representan valor de extremo a extremo y podrán implicar trabajo en varias capas.

---

## 5. Objetivo de la etapa documental actual

La documentación inicial busca dejar al proyecto en condiciones de continuar con refinamiento Scrum y planificación, habiendo completado:

- comprensión del contexto;
- diagnóstico;
- relevamiento mediante tres técnicas;
- hallazgos y necesidades;
- objetivos y propuesta de valor;
- alcance y MVP;
- SRS;
- requisitos detallados;
- reglas de negocio;
- Product Backlog;
- carga inicial del backlog en GitHub Projects.

La siguiente etapa documental se orientará a formalizar Scrum/refinamiento y Definition of Ready antes de Sprint Planning.

---

# 6. Estrategia de relevamiento

El proyecto aplica **tres técnicas distintas** de obtención y contraste de requerimientos.

| # | Técnica | Aplicación | Estado |
|---:|---|---|---|
| 1 | **Entrevista semiestructurada** | `ENT-01` + `ENT-02` | Completada |
| 2 | **Análisis de antecedentes (análisis documental)** | Documento previo sobre la forma de trabajo | Completado |
| 3 | **Análisis de sistemas similares / benchmarking** | Seis soluciones gastronómicas | Completado |

Las dos entrevistas son dos sesiones de **una misma técnica**, no dos métodos diferentes.

Índice de evidencia:

```text
docs/evidence/relevamiento/
├── README.md
├── entrevistas/
│   ├── README.md
│   ├── entrevista-01-trabajadora/
│   └── entrevista-02-trabajadora/
├── analisis-antecedentes/
│   ├── README.md
│   ├── analisis-antecedentes.md
│   └── detalle-de-la-manera-de-trabajo.pdf
└── analisis-sistemas-similares/
    ├── README.md
    └── analisis-sistemas-similares.md
```

---

## 7. Evidencia principal

### ENT-01

```text
docs/evidence/relevamiento/entrevistas/entrevista-01-trabajadora/
├── README.md
├── entrevista-1-audio.mp3
└── transcripcion.md
```

Datos confirmados:

- fecha: **19 de agosto de 2026**;
- modalidad: **virtual mediante Discord**;
- entrevistador: **Josué Matias Arroyo Reynoso**;
- entrevistada: **Ana Paola Viscarra Chambi**;
- duración aproximada: **23 min 11 s**.

### ENT-02

```text
docs/evidence/relevamiento/entrevistas/entrevista-02-trabajadora/
├── README.md
├── entrevista-2-audio.mp3
└── transcripcion.md
```

La sesión fue utilizada para refinar producción, compras, turnos y cierre. El audio dura aproximadamente **14 min 17 s**. Los metadatos de fecha, modalidad y participantes que no aparecen en la evidencia entregada permanecen explícitamente pendientes; no se completan por inferencia.

### Análisis de antecedentes

```text
docs/evidence/relevamiento/analisis-antecedentes/
├── README.md
├── analisis-antecedentes.md
└── detalle-de-la-manera-de-trabajo.pdf
```

### Sistemas similares

```text
docs/evidence/relevamiento/analisis-sistemas-similares/
├── README.md
└── analisis-sistemas-similares.md
```

---

## 8. Repositorio y estructura general

```text
Fratelli-s-System/
├── README.md
├── docs/
│   ├── 00-ficha-proyecto.md
│   ├── 01-contexto-y-diagnostico.md
│   ├── 02-relevamiento.md
│   ├── 03-hallazgos-y-necesidades.md
│   ├── 04-objetivos-y-propuesta-valor.md
│   ├── 05-alcance-y-mvp.md
│   ├── 06-srs.md
│   ├── requirements/
│   ├── 07-product-backlog.md
│   ├── historias/
│   ├── evidence/
│   ├── puml/
│   └── images/
├── frontend/
├── backend/
└── otros componentes según necesidad
```

---

## 9. Convenciones documentales

| Elemento | Convención |
|---|---|
| Hallazgos | `H-001`, `H-002`, ... |
| Necesidades | `N-001`, `N-002`, ... |
| Requisitos funcionales | `RF-001`, `RF-002`, ... |
| Requisitos no funcionales | `RNF-[CAT]-001` |
| Reglas de negocio | `RN-001`, `RN-002`, ... |
| Épicas | `EPI-01`, `EPI-02`, ... |
| Historias de usuario | `HU-001`, `HU-002`, ... |
| Riesgos | `R-001`, `R-002`, ... |
| Decisiones arquitectónicas | `ADR-001`, `ADR-002`, ... |
| Casos de prueba | `CP-001`, `CP-002`, ... |

---

## 10. Fuentes de verdad

- requisitos funcionales: `docs/requirements/requisitos-funcionales.md`;
- requisitos no funcionales: `docs/requirements/requisitos-no-funcionales.md`;
- reglas de negocio: `docs/requirements/reglas-negocio.md`;
- Product Backlog: `docs/07-product-backlog.md`;
- estado operativo: GitHub Projects;
- historias ejecutadas y evidencia: `docs/historias/` a medida que se trabajen;
- evidencia de relevamiento: `docs/evidence/relevamiento/`.

---

# 11. Estado actual del proyecto

| Elemento | Estado al 21/08/2026 |
|---|---|
| Organización objetivo | Confirmada |
| Product Owner | Definida |
| Scrum Master | Definido |
| Equipo | 4 integrantes |
| Repositorio | Definido |
| Metodología | Scrum |
| Tres técnicas de relevamiento | Aplicadas |
| ENT-01 | Completada y transcrita |
| ENT-02 | Completada y transcrita; metadatos parciales pendientes |
| Contexto y diagnóstico | Consolidado |
| Hallazgos y necesidades | Consolidados y actualizados |
| Objetivos | Definidos |
| Alcance / MVP | Definido |
| SRS | Definida y refinada |
| RF/RNF/RN | Baseline disponible |
| Product Backlog | Disponible |
| GitHub Projects | Backlog cargado por el equipo |
| HU previamente bloqueadas | Refinadas; aptas para volver a `Backlog` |
| Definition of Ready | Pendiente de formalización en `08-scrum-y-refinamiento.md` |
| Historias ejecutadas | Aún no documentadas; se crearán al trabajar cada HU |
| Arquitectura | Pendiente |
| Modelo de datos | Pendiente |
| Sprint Planning | Pendiente |

---

# 12. Control de cambios

| Versión | Fecha | Descripción | Estado |
|---|---|---|---|
| `0.1` | 18/08/2026 | Ficha inicial | Sustituida |
| `0.2` | 20/08/2026 | Actualización tras relevamiento inicial | Sustituida |
| `0.3` | 21/08/2026 | Consolidación de tres técnicas, ENT-02 y estado documental hasta Product Backlog | Vigente |
