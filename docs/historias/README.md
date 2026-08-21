# Historias de Usuario — Documentación de ejecución

## 1. Propósito

Esta carpeta contiene la documentación de **historias de usuario que realmente hayan sido tomadas y trabajadas por el equipo** durante los Sprints de **Restaurant System**.

La carpeta **no funciona como copia del Product Backlog**.

La fuente documental del backlog es:

```text
docs/07-product-backlog.md
```

La gestión operativa del trabajo se realizará en:

```text
GitHub Projects
```

Por tanto, antes de comenzar los Sprints esta carpeta debe contener únicamente:

```text
docs/historias/
└── README.md
```

Los archivos `HU-XXX-*.md` se crearán progresivamente, únicamente cuando un integrante del equipo tome una historia para ejecutarla y deba documentar su trabajo, pruebas y evidencias.

---

# 2. Flujo documental

```text
07-product-backlog.md
        ↓
GitHub Projects
        ↓
Backlog / Ready
        ↓
Sprint Planning
        ↓
Historia asignada
        ↓
In Progress
        ↓
Se crea docs/historias/HU-XXX-*.md
        ↓
Implementación
        ↓
Pruebas
        ↓
Evidencias
        ↓
Review
        ↓
Done
```

Una historia no deberá tener un archivo individual únicamente por existir en el Product Backlog.

---

# 3. Fuente de verdad según el momento

| Información | Fuente principal |
|---|---|
| Catálogo de historias | `docs/07-product-backlog.md` |
| Prioridad inicial | `docs/07-product-backlog.md` |
| Story Points iniciales | `docs/07-product-backlog.md` |
| Estado operativo de la historia | GitHub Projects |
| Responsable actual | GitHub Projects |
| Sprint asignado | GitHub Projects |
| Ejecución técnica | `docs/historias/HU-XXX-*.md` |
| Evidencias | Archivo de historia + carpeta de evidencia correspondiente |
| Requisitos | `docs/requirements/` |
| Reglas de negocio | `docs/requirements/reglas-negocio.md` |
| Decisiones de arquitectura | `docs/adr/` cuando corresponda |

Si existe una diferencia entre la tarjeta del tablero y la documentación histórica, deberá revisarse cuál de las dos quedó desactualizada y corregir la trazabilidad.

---

# 4. Cuándo crear el archivo de una historia

El archivo individual se crea cuando se cumplen estas condiciones:

1. la historia existe en el Product Backlog;
2. fue seleccionada para trabajo;
3. tiene un responsable;
4. entra a `In Progress` o está a punto de entrar;
5. el equipo necesita registrar ejecución, decisiones, pruebas y evidencias.

No se crearán anticipadamente los archivos de todas las historias.

---

# 5. Nomenclatura

Formato:

```text
HU-XXX-nombre-corto.md
```

Ejemplos:

```text
HU-001-iniciar-cerrar-sesion.md
HU-012-registrar-confirmar-venta.md
HU-022-registrar-asistencia.md
```

Reglas:

- conservar el ID original del Product Backlog;
- usar minúsculas después del ID;
- separar palabras con guiones;
- evitar caracteres especiales innecesarios;
- no reutilizar el mismo ID para otra historia.

---

# 6. Estructura mínima de cada archivo

Cada historia ejecutada deberá documentarse con una estructura similar a la siguiente.

```markdown
# HU-XXX — Título de la historia

## 1. Identificación

| Campo | Valor |
|---|---|
| ID | HU-XXX |
| Épica | EPI-XX |
| Responsable | ... |
| Sprint | ... |
| Prioridad | MUST / SHOULD / COULD |
| Story Points | ... |
| Estado final | Done / ... |
| Tarjeta GitHub Projects | ... |
| Issue/PR relacionado | ... |

## 2. Historia

Como [rol],
quiero [acción],
para [beneficio].

## 3. Alcance trabajado

...

## 4. Requisitos y reglas relacionadas

- RF-...
- RNF-...
- RN-...

## 5. Criterios de aceptación

- [ ] ...
- [ ] ...

## 6. Implementación realizada

...

## 7. Decisiones tomadas durante la ejecución

...

## 8. Archivos/componentes principales modificados

...

## 9. Pruebas realizadas

...

## 10. Evidencias

...

## 11. Incidencias o desviaciones

...

## 12. Resultado

...

## 13. Referencias

- Commit:
- Pull Request:
- Issue:
- Evidencia:
```

La plantilla podrá adaptarse cuando una historia requiera más o menos detalle, pero no deberá omitir información necesaria para verificar su ejecución.

---

# 7. Evidencias

La evidencia debe demostrar que la historia fue trabajada y validada.

Puede incluir, según corresponda:

- capturas de pantalla;
- resultados de pruebas;
- logs relevantes;
- respuestas de API;
- archivos de prueba;
- commits;
- Pull Requests;
- referencias a Issues;
- demostración aceptada;
- evidencia de validación del Product Owner;
- imágenes de interfaz;
- resultados antes/después.

La evidencia debe estar relacionada explícitamente con la historia.

No se añadirá evidencia decorativa que no demuestre una condición verificable.

---

# 8. Organización sugerida de evidencia

Cuando una historia necesite archivos adicionales, se recomienda:

```text
docs/evidence/historias/
└── HU-XXX/
    ├── README.md              # opcional
    ├── captura-01.png
    ├── captura-02.png
    ├── resultado-prueba.txt
    └── ...
```

El archivo de historia deberá enlazar la evidencia utilizada.

Si una evidencia ya existe en otra ubicación válida del repositorio, se podrá referenciar sin duplicarla.

---

# 9. Relación con GitHub Projects

La tarjeta de GitHub Projects representa el **estado vivo del trabajo**.

El archivo de `docs/historias/` representa el **registro verificable de lo realizado**.

La tarjeta deberá conservar como mínimo:

```text
Título
Descripción
Estado
Prioridad
Épica/área
Story Points
Responsable
Sprint
```

Cuando una historia comience:

```text
Ready
  ↓
In Progress
```

se asignará un responsable y se podrá crear el archivo documental.

Cuando termine la implementación:

```text
In Progress
  ↓
Review
```

el archivo deberá contener las pruebas y evidencias disponibles.

Solo después de cumplir los criterios definidos podrá pasar a:

```text
Done
```

---

# 10. Estados del tablero

La convención propuesta para GitHub Projects es:

```text
Backlog
Ready
In Progress
Review
Done
Blocked
```

## Backlog

Historia conocida y priorizada, pero todavía no seleccionada para ejecución inmediata.

## Ready

Historia refinada, sin bloqueos críticos y preparada para ser tomada por el equipo.

## In Progress

Historia asignada y actualmente en implementación.

## Review

Implementación terminada y pendiente de revisión, pruebas finales o aceptación.

## Done

Historia que cumple la Definition of Done aplicable.

## Blocked

Historia que no puede avanzar por una dependencia, decisión o regla pendiente.

---

# 11. Regla actual para poblar el tablero

El Product Backlog actualizado distingue:

```text
CANDIDATA A READY
POST-MVP
```

La segunda entrevista resolvió los bloqueos informativos que afectaban a seis HU. Por tanto, la carga/actualización del tablero utilizará:

```text
CANDIDATA A READY
→ Backlog

POST-MVP
→ Backlog
```

`Ready` continúa siendo un estado posterior al refinamiento y a la Definition of Ready.

```text
Backlog
→ revisión DoR
→ Ready
```

La columna `Blocked` permanece disponible para cualquier impedimento real que aparezca posteriormente, pero **no contiene ya las seis HU desbloqueadas por ENT-02**.

---

# 12. Historias desbloqueadas tras ENT-02

Las historias:

```text
HU-004
HU-007
HU-017
HU-025
HU-026
HU-027
```

pasan de:

```text
Blocked → Backlog
```

porque la segunda entrevista aclaró las reglas mínimas de unidades/producción, compras, turnos y cierre.

No se mueven automáticamente a `Ready`; deberán superar la revisión DoR definida en `docs/08-scrum-y-refinamiento.md`.

---

# 13. Historias Post-MVP

Las historias:

```text
HU-032
HU-033
HU-034
HU-035
HU-036
HU-037
HU-038
HU-039
```

permanecen en:

```text
Backlog
```

con labels que indiquen:

```text
post-mvp
priority:wont
```

No deberán entrar a un Sprint de esta entrega salvo un cambio formal de alcance.

---

# 14. Definition of Ready

La Definition of Ready definitiva se formalizará en:

```text
docs/08-scrum-y-refinamiento.md
```

Como principio, una historia no deberá pasar a `Ready` si conserva un bloqueo crítico.

---

# 15. Definition of Done y documentación

Una historia no deberá pasar a `Done` únicamente porque el código funcione.

Cuando corresponda, deberá verificarse también:

- criterios de aceptación;
- pruebas previstas;
- ausencia de defectos críticos conocidos;
- revisión;
- documentación afectada;
- requisitos afectados;
- trazabilidad;
- evidencia;
- aceptación correspondiente.

La especificación formal de DoD se mantendrá en la documentación Scrum.

---

# 16. Cambios durante una historia

Si durante la implementación se descubre que el comportamiento acordado debe cambiar:

```text
NO
→ modificar silenciosamente el sistema y documentarlo después

SÍ
→ identificar el cambio
→ revisar RF/RN/RNF afectados
→ validar cuando corresponda
→ actualizar especificaciones
→ actualizar backlog/tarjeta
→ implementar
→ conservar evidencia
```

La documentación de una historia no sustituye el control de cambios.

---

# 17. Commits y Pull Requests

Cuando sea posible, se recomienda incluir el ID de la historia:

```text
HU-012
```

en referencias relacionadas.

Ejemplos:

```text
feat(HU-012): registrar confirmación de ventas
fix(HU-022): impedir segunda entrada abierta
docs(HU-005): añadir evidencia de movimientos
```

El formato definitivo de commits podrá definirse por el equipo.

---

# 18. Criterio de cierre documental

Cuando una historia llegue a `Done`, su archivo deberá permitir responder:

```text
¿Qué se pidió?
¿Qué se implementó?
¿Quién lo realizó?
¿Qué requisitos/reglas aplican?
¿Cómo se probó?
¿Qué evidencia existe?
¿Hubo desviaciones?
¿Dónde está el cambio en el repositorio?
```

Si alguna de estas preguntas relevantes no puede responderse, la documentación debe completarse.

---

# 19. Regla de mantenimiento de esta carpeta

Esta carpeta debe crecer con el avance real del proyecto:

```text
Inicio
docs/historias/
└── README.md

Después del Sprint
docs/historias/
├── README.md
├── HU-001-....md
├── HU-003-....md
└── ...
```

La cantidad de archivos existentes debe representar historias realmente trabajadas, no historias solamente planificadas.
