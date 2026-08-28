# Retrospectiva — Sprint 1

**Estado:** Retrospectiva realizada y consolidada con las observaciones comunicadas por los integrantes del equipo.

## 1. Información de la retrospectiva

- Sprint: Sprint 1
- Fecha: 27/08/2026.
- Participantes: Los 4 miembros del equipo.
- Product Owner: Ana Paola Viscarra Chambi.
- Scrum Master: Alex Saúl Fernandez Valdez.

## 2. Objetivo

Analizar el Sprint 1 en búsqueda de fallas y/o mejoras, identificando tanto los aspectos que permitieron completar el trabajo como los problemas de organización, integración, aprendizaje técnico y documentación que afectaron al equipo.

## 3. Contexto del Sprint

- Objetivo: cerrar la integración frontend del Sprint 1 con navegación autorizada, un shell autenticado único, experiencia responsive y documentación current-state, integrando las funcionalidades trabajadas en el Sprint.
- HUs comprometidas/documentadas: `HU-001`, `HU-002`, `HU-003`, `HU-005`, `HU-009`, `HU-010`, `HU-011`, `HU-016`, `HU-020` y `HU-022`.
- HUs con implementación registrada: las 10 historias anteriores. En conjunto representan 41 Story Points según la estimación inicial del Product Backlog.
- Consideraciones de cierre: `HU-020` mantiene explícitamente pendiente su validación manual y `HU-003` no incorpora una interfaz dedicada para categorías y unidades, aunque sí registra su API CRUD y la gestión de productos.
- Incidentes relevantes: un problema al hacer push en la rama `develop` hizo que se sobreescribieran cambios en documentación. También se reportaron conflictos de fusión, desincronización con la rama base y dificultades recurrentes para integrar avances.

## 4. ¿Qué salió bien?

Se cumplió con el plazo objetivo y se pudo realizar todas las HU antes de terminar el tiempo propuesto.

Además:

- se consiguió integrar trabajo de backend y frontend en varios módulos del sistema;
- quedaron documentadas 10 Historias de Usuario trabajadas durante el Sprint;
- se implementaron los flujos principales de autenticación, usuarios, productos, inventario, pedidos, cocina, proveedores, gastos y asistencia;
- se avanzó en la navegación por roles y en la experiencia responsive;
- el equipo mantuvo comunicación frecuente durante las noches por Discord y durante las clases;
- pese a los bloqueos técnicos y de Git, los integrantes lograron continuar sus tareas y llevar sus avances a integración.

## 5. ¿Qué no salió bien?

No hubo la mejor organización y a veces el grupo no se juntaba completamente.

También se presentaron dificultades recurrentes que redujeron la eficiencia del Sprint:

- varios integrantes tuvieron poca experiencia con el flujo de Git/GitHub, lo que generó conflictos, desincronización y bloqueos al integrar cambios;
- hubo problemas para subir correctamente código, documentación y evidencias a `develop`;
- parte de la documentación se retrasó al priorizar la resolución de problemas de implementación e integración;
- existieron dificultades de aprendizaje técnico en la arquitectura backend, consumo de APIs y estructura frontend basada en Atomic Design;
- quedaron inconsistencias documentales entre algunas HU, sus evidencias y documentos globales de seguimiento.

## 6. ¿Qué podemos mejorar?

Coordinar mejor las HU y usar una decisión para la documentación de las HU.

A partir de los problemas observados, las principales oportunidades de mejora son:

- coordinar con mayor claridad qué integrante trabaja cada HU, sus dependencias y el momento de integración;
- sincronizar la rama de trabajo con `develop` antes de integrar o subir cambios importantes;
- reforzar el flujo práctico de Git/GitHub del equipo: ramas, actualización desde la rama base, resolución de conflictos, commits y Pull Requests;
- realizar una explicación corta de la arquitectura backend, DTOs, reglas de negocio, contratos y tratamiento de respuestas/errores antes de asignar tareas que dependan de estos elementos;
- reforzar el uso práctico de átomos, moléculas, organismos y features del frontend para evitar recrear componentes o integrarlos de forma incorrecta;
- documentar la HU progresivamente durante su implementación y no únicamente al final;
- verificar las rutas de capturas y evidencias antes de considerar cerrada la documentación de una historia;
- utilizar una convención común para registrar todos los archivos creados o modificados por cada HU.

## 7. Problemas encontrados durante el Sprint

El problema transversal más repetido fue un **flujo de trabajo ineficiente por la inexperiencia al usar GitHub**, especialmente durante la sincronización e integración con `develop`.

### Josué Matias Arroyo Reynoso

- **Comprensión de la arquitectura backend y consumo de APIs:** tuvo problemas para comprender la estructura del backend, los DTOs y algunas reglas de negocio.
- **Consumo de endpoints:** encontró dificultades técnicas para realizar correctamente los llamados a los endpoints y manejar sus respuestas y estados de error.
- **Experiencia en Git:** la falta de mayor experiencia con el flujo de Git/GitHub le generó bloqueos temporales.
- **Integración:** presentó problemas recurrentes al integrar y subir commits, principalmente por conflictos de fusión y desincronización con la rama base.
- **Documentación:** experimentó retrasos para redactar y subir la documentación de sus tareas, al priorizar la resolución de problemas de código y sincronización.

### Ana Paola Viscarra Chambi

- **Experiencia en Git:** la falta de mayor experiencia con el flujo de Git/GitHub le generó bloqueos temporales.
- **Integración:** presentó problemas recurrentes al integrar y subir commits, principalmente por conflictos de fusión y desincronización con la rama base.
- **Documentación:** experimentó retrasos para redactar y subir la documentación de sus tareas, al priorizar la resolución de problemas de código y sincronización.

### Miguel Angel Colque Calizaya

- Tuvo problemas durante la realización de `HU-016 — Proveedores`.
- Tuvo dificultades al utilizar GitHub.
- Tuvo dificultades para comprender y reutilizar átomos, moléculas y organismos del frontend en las ventanas que debía crear.
- Tuvo problemas al subir a la rama `develop` sus avances de código y documentación.
- Tuvo problemas al subir las imágenes a GitHub como evidencias/pruebas de sus Historias de Usuario.

### Problemas comunes identificados

Los comentarios de los integrantes muestran cuatro grupos de problemas recurrentes:

1. uso de Git/GitHub e integración con `develop`;
2. documentación y carga de evidencias;
3. comprensión de patrones y estructura técnica del proyecto;
4. coordinación del trabajo antes de la integración.

## 8. Aspectos técnicos

- **Backend:** la implementación avanzó correctamente, pero se identificó una curva de aprendizaje importante para comprender la arquitectura, DTOs, reglas de negocio y contratos de API. Este problema afectó principalmente la velocidad de trabajo de quienes no estaban familiarizados con la estructura backend.
- **Frontend:** se logró integrar las pantallas y navegación de las HU trabajadas, pero hubo dificultades para aplicar correctamente la estructura basada en Atomic Design y reutilizar átomos, moléculas y organismos existentes.
- **Integración:** fue uno de los puntos con más fricción. Se reportaron conflictos de fusión, desincronización con `develop`, dificultades al subir commits y un incidente en el que se sobreescribieron cambios de documentación.
- **Pruebas:** el archivo del Sprint registra ejecución de `format:check`, typecheck, lint, tests y build del frontend. `HU-002` documenta además 34/34 tests backend y 38/38 tests frontend en PASS.
- **Documentación:** existieron retrasos al documentar tareas y subir evidencias.
- **Despliegue/demo:** No se realizó aún, sólo hubo pruebas en local.

## 9. Trabajo en equipo y comunicación

La comunicación fue limpia y frecuente: nos comunicamos virtualmente por Discord casi todas las noches y durante las clases.

Aun así, no siempre fue posible reunir al grupo completo, lo que contribuyó a problemas de coordinación y a que algunas dificultades de integración se resolvieran más tarde de lo deseable. Para el siguiente Sprint conviene mantener la comunicación frecuente, pero acompañarla con una mejor coordinación de dependencias, responsables y momentos de integración.

## 10. Decisiones de la retrospectiva

Vamos a usar una regla para las historias, en la que añadiremos de forma obligatoria un **Manifest** para todos los archivos creados o modificados.

El Manifest deberá permitir identificar con claridad qué archivos fueron creados o modificados durante la ejecución de cada HU, facilitando la revisión, integración, documentación y resolución de conflictos.

Los demás puntos descritos en esta retrospectiva se registran como problemas y oportunidades de mejora; no se presentan como decisiones formales adicionales mientras no exista constancia de que el equipo las haya acordado.
