# Propuesta

**Change:** `prepare-sprint-0-development-foundation`  
**Proyecto:** Restaurant System — Fratelli  
**Repositorio:** `Alex-Fernandez-2003/Fratelli-s-System`  
**Ruta OpenSpec canónica del change:** `docs/openspec/changes/prepare-sprint-0-development-foundation/`

## Resumen ejecutivo

Este change define un único Sprint 0 técnico: **Sprint 0 — Preparación de la fábrica de software**.

Su propósito es transformar la baseline documental actual en una fábrica de desarrollo reproducible para cuatro integrantes, sin implementar ninguna Historia de Usuario de `HU-001` a `HU-031`.

El resultado esperado no es una funcionalidad del restaurante, sino un repositorio desde el cual otro integrante pueda:

- clonar;
- instalar dependencias;
- configurar PostgreSQL local;
- configurar credenciales sin versionar secretos;
- compilar y ejecutar backend;
- aplicar migrations;
- ejecutar frontend;
- validar `GET /health` desde frontend;
- utilizar OpenAPI en Development;
- regenerar tipos TypeScript;
- reutilizar una base visual y componentes comunes;
- ejecutar verificaciones básicas;
- comprender la estructura mediante documentación;
- comenzar posteriormente una HU sin redefinir la fábrica.

La regla de alcance es:

- infraestructura preparada ≠ Historia de Usuario implementada;
- Identity configurado ≠ HU-001;
- JWT configurado ≠ login;
- soporte de roles ≠ HU-002;
- `DbContext` ≠ inventario;
- SignalR configurado ≠ HU-010;
- `httpClient` ≠ feature funcional.

OpenSpec se utilizará para **un único change de Sprint 0**. No se creará un change por cada tarea ni se establecerá una regla `1 HU = 1 change`.

## Contexto leído del repositorio

### Estado actual observado

La auditoría del árbol actual de `main` y `develop` muestra una baseline principalmente documental:

- existen `docs/` y documentación del proyecto;
- no se observan todavía `frontend/` ni `backend/` en la raíz;
- no se observa un `package.json` raíz;
- no se observa una solución `.NET` materializada;
- no se observa `.github/workflows/` en el árbol actual;
- no se observa todavía `docs/openspec/`, `docs/sprints/` ni `docs/capturas/`;
- `README.md` raíz existe pero actualmente no contiene onboarding técnico sustancial;
- existen las ramas `main`, `develop` y `feature/fratelli`;
- el trabajo documental reciente de Sprint 0 modificó `docs/15-plan-desarrollo.md`, no implementó todavía la fábrica. :contentReference[oaicite:0]{index=0}

Por tanto, este briefing **no asume un repositorio vacío**, pero sí reconoce que la implementación técnica prevista para `frontend/` y `backend/` todavía no aparece materializada en las ramas auditadas.

### Documentación revisada

Se revisó la baseline solicitada:

- `docs/00-ficha-proyecto.md`
- `docs/01-contexto-y-diagnostico.md`
- `docs/02-relevamiento.md`
- `docs/03-hallazgos-y-necesidades.md`
- `docs/04-objetivos-y-propuesta-valor.md`
- `docs/05-alcance-y-mvp.md`
- `docs/06-srs.md`
- `docs/requirements/requisitos-funcionales.md`
- `docs/requirements/requisitos-no-funcionales.md`
- `docs/requirements/reglas-negocio.md`
- `docs/07-product-backlog.md`
- `docs/08-scrum-y-refinamiento.md`
- `docs/09-ux-y-flujos.md`
- `docs/10-arquitectura.md`
- `docs/11-modelo-datos.md`
- `docs/12-seguridad-y-riesgos.md`
- `docs/13-pruebas-y-validacion.md`
- `docs/14-trazabilidad.md`
- `docs/15-plan-desarrollo.md`

También se inspeccionaron las áreas existentes de:

- `docs/adr/`
- `docs/puml/`
- `docs/images/`
- `docs/historias/`
- `docs/evidence/relevamiento/`
- `docs/requirements/`

Los ADR vigentes confirman como decisiones aceptadas el monolito modular/Clean Architecture, React + Atomic Design + features, PostgreSQL + EF Core, Identity/JWT, SignalR para KDS y HomeLab como entorno posterior de demostración, no como dependencia obligatoria del desarrollo diario. :contentReference[oaicite:1]{index=1}

### Baseline técnica aplicable

Para Sprint 0 se toma como autoridad operativa más reciente:

1. `docs/15-plan-desarrollo.md`
2. `docs/10-arquitectura.md`
3. `docs/11-modelo-datos.md`
4. `docs/12-seguridad-y-riesgos.md`
5. `docs/13-pruebas-y-validacion.md`
6. `docs/14-trazabilidad.md`

El plan vigente define explícitamente que Sprint 0 es distinto de los tres Sprints funcionales y que preparar Identity, cliente HTTP o SignalR no completa HUs. :contentReference[oaicite:2]{index=2}

### Contradicciones y desalineaciones detectadas

#### 1. Puerto backend: `5087` vs `5057`

`docs/10-arquitectura.md` conserva referencias al backend en `localhost:5087`, mientras que la baseline posterior de seguridad y `docs/15-plan-desarrollo.md` fija `localhost:5057`.

**Resolución para este change:** usar `5057`.

**Impacto:** una configuración que conserve `5087` rompería CORS, proxy, manuales y la validación frontend ↔ backend.

**Acción posterior:** durante apply debe alinearse la documentación directamente afectada para que no queden instrucciones contradictorias. :contentReference[oaicite:3]{index=3}

#### 2. Estrategia OpenAPI frontend

La arquitectura/ADR anterior describe un cliente generado desde OpenAPI. La baseline más reciente de Sprint 0 redefine la estrategia como híbrida:

- `httpClient` escrito y mantenido manualmente;
- rutas en `endpoints.ts`;
- OpenAPI usado únicamente para tipos;
- `openapi-typescript`;
- salida `src/types/api.generated.ts`;
- no Orval;
- el archivo generado no se edita manualmente.

**Resolución para este change:** prevalece la estrategia híbrida de `docs/15-plan-desarrollo.md`.

La implementación debe alinear la documentación arquitectónica/ADR aplicable según la política real de mantenimiento de ADRs, sin reescribir silenciosamente una decisión histórica. :contentReference[oaicite:4]{index=4}

#### 3. Convención de commits

`docs/historias/README.md` conserva ejemplos antiguos del tipo `feat(HU-012): ...`, mientras que la definición posterior de Sprint 0 establece:

`tipo: descripción breve`

con:

- `feat`
- `fix`
- `docs`
- `chore`
- `refactor`
- `test`

El ID de HU puede quedar en rama, PR, tablero y Markdown.

**Resolución para este change:** usar la convención simple definida por la baseline más reciente. La documentación antigua que pueda confundir el onboarding debe alinearse durante apply. :contentReference[oaicite:5]{index=5}

#### 4. Estado histórico de documentos iniciales

Algunos documentos anteriores describen arquitectura/modelo como pendientes. Esos estados reflejan una etapa documental previa y ya no deben usarse para decidir Sprint 0, porque los documentos `10`–`15` existen y son posteriores.

No constituye un bloqueo técnico.

## Planteamiento del problema

La documentación del proyecto ya define la arquitectura, seguridad, datos, pruebas y plan de desarrollo, pero el repositorio auditado todavía no materializa la fábrica técnica necesaria para que cuatro integrantes desarrollen de forma reproducible.

Sin Sprint 0 existe riesgo de que cada integrante:

- cree estructuras distintas;
- use puertos o configuraciones incompatibles;
- configure PostgreSQL de manera diferente;
- duplique clientes HTTP;
- use patrones visuales inconsistentes;
- genere o edite manualmente contratos OpenAPI;
- exponga secretos;
- empiece HUs sobre una base aún no integrada;
- dependa de instrucciones orales del Scrum Master;
- descubra problemas frontend/backend recién al final.

El change debe cerrar esa brecha sin adelantar comportamiento de negocio.

## Objetivos

- Materializar una solución backend .NET 10 compatible con Clean Architecture práctica.
- Materializar una plantilla frontend React/TypeScript/Vite preparada para desarrollo real.
- Establecer PostgreSQL local reproducible mediante EF Core migrations.
- Disponer de un `GET /health` técnico y consumirlo desde el frontend.
- Confirmar backend en `localhost:5057` y frontend en `localhost:8087`.
- Dejar OpenAPI y Swagger disponibles únicamente en Development.
- Configurar generación de tipos TypeScript mediante `npm run api:generate`.
- Crear una estrategia HTTP centralizada sin acoplarla a HU-001.
- Preparar Identity, JWT, autorización y SignalR únicamente como infraestructura.
- Crear una base visual Fratelli centralizada y una biblioteca pequeña de componentes.
- Crear `/dev/ui-kit` como herramienta técnica únicamente disponible en Development.
- Preparar xUnit, Vitest y React Testing Library.
- Establecer CI mínimo y de bajo mantenimiento.
- Documentar instalación, ejecución, migrations, testing, API y convenciones.
- Confirmar Git flow `main` / `develop` / ramas cortas.
- Permitir que la fábrica sea validada en otra máquina sin conocimiento implícito.
- Mantener todo Sprint 0 dentro de este único change OpenSpec.

## Dentro del alcance

### Repositorio y flujo

- `main`, `develop` y ramas cortas.
- Convenciones de ramas y commits.
- `.editorconfig`.
- `.gitignore` cuando corresponda.
- ESLint y Prettier.
- compatibilidad con `dotnet format`.
- CI básico.

### Fundación del backend

- solución y proyectos;
- referencias entre proyectos;
- configuración y Dependency Injection;
- EF Core;
- Npgsql;
- `DbContext`;
- migrations;
- Identity como infraestructura;
- JWT Bearer como infraestructura;
- mecanismo base de autorización/policies;
- ProblemDetails;
- manejo centralizado de errores;
- logging base;
- CORS;
- health checks;
- OpenAPI;
- Swagger en Development;
- SignalR como infraestructura;
- xUnit y estructura de tests.

### Fundación de base de datos

- PostgreSQL local por integrante;
- configuración segura;
- migration técnica inicial cuando sea necesaria;
- comando real de `dotnet ef database update`;
- validación de conectividad.

### Fundación del frontend

- React;
- TypeScript;
- Vite;
- Tailwind CSS;
- React Router;
- TanStack Query;
- cliente SignalR;
- Vitest;
- React Testing Library;
- configuración/env;
- cliente HTTP;
- errores/ProblemDetails;
- endpoints centralizados;
- tipos OpenAPI;
- `features/_template`;
- Atomic Design práctico.

### Sistema visual

- tokens CSS centralizados;
- integración coherente con Tailwind;
- componentes mínimos;
- `/dev/ui-kit`;
- sección `Conexión con backend`.

### Documentación

- README raíz como punto de entrada si resulta útil para evitar duplicación;
- `backend/README.md`;
- `frontend/README.md`;
- `frontend/docs/manual-de-uso.md`;
- alineación de documentación vigente afectada por contradicciones reales;
- `docs/sprints/sprint-00.md` únicamente con resultados reales una vez ejecutado el Sprint 0;
- evidencias reales en `docs/capturas/`.

## No objetivos

- No implementar ninguna funcionalidad de `HU-001` a `HU-031`.
- No marcar ninguna HU como Done.
- No implementar login.
- No implementar refresh/logout/reset de contraseña funcional.
- No implementar pantallas de autenticación.
- No implementar administración funcional de usuarios.
- No implementar CRUDs de negocio.
- No implementar productos, inventario, producción, pedidos, KDS funcional, ventas, compras, asistencia, turnos, cierre ni reportes.
- No anticipar todo el modelo físico final.
- No crear `schema.sql` como segunda fuente de verdad.
- No implementar biométrico, impresora o facturación fiscal.
- No implementar cuentas por cobrar.
- No implementar Post-MVP.
- No introducir microservicios.
- No introducir CQRS completo.
- No introducir event sourcing.
- No introducir Redis obligatorio.
- No introducir RabbitMQ.
- No introducir Kubernetes.
- No hacer Docker obligatorio para desarrollo.
- No convertir HomeLab en dependencia diaria.
- No implementar Playwright/E2E completo.
- No introducir Testcontainers como requisito de Sprint 0.
- No crear un design system sobredimensionado.
- No utilizar Orval.
- No crear un change OpenSpec por HU.
- No crear carpetas vacías únicamente para reproducir un árbol conceptual.

## Áreas afectadas

- Raíz del repositorio.
- Configuración Git y CI.
- `backend/`.
- `frontend/`.
- PostgreSQL local.
- configuración segura y variables de entorno.
- `docs/openspec/changes/prepare-sprint-0-development-foundation/`.
- documentación de arquitectura y onboarding directamente afectada.
- `docs/sprints/`.
- `docs/capturas/`.
- documentación de historias únicamente si requiere corrección de una convención obsoleta.

## Dependencias

### Herramientas de desarrollo

La futura ejecución requerirá:

- Git;
- .NET 10 SDK;
- tooling de EF Core compatible con el scaffold resultante;
- Node.js/npm compatibles con el scaffold Vite resultante;
- PostgreSQL local;
- acceso de escritura al repositorio;
- permisos de GitHub Actions para CI.

La versión concreta de Node y los comandos exactos de tooling MUST documentarse después de generar el scaffold real, no inventarse en este briefing.

### Dependencias arquitectónicas confirmadas

- React + TypeScript + Vite + Tailwind CSS.
- React Router.
- TanStack Query.
- cliente SignalR.
- Vitest.
- React Testing Library.
- ASP.NET Core Web API sobre .NET 10.
- EF Core.
- Npgsql.
- PostgreSQL.
- ASP.NET Core Identity.
- JWT Bearer.
- OpenAPI.
- ProblemDetails.
- SignalR.
- xUnit.

### Dependencias deliberadamente excluidas

- HomeLab.
- Docker obligatorio.
- infraestructura cloud.
- PostgreSQL compartido.
- Redis.
- broker de mensajería.
- Kubernetes.
- herramientas E2E avanzadas.

## Suposiciones

Sin suposiciones.

## Riesgos

### Riesgo 1: Concentración técnica en el Scrum Master

- Probabilidad: Alta.
- Impacto: Alta.
- Mitigación: README, manual frontend, comandos exactos, `.env.example`, configuración reproducible, UI Kit y validación por otro integrante deben reducir dependencias de conocimiento oral.

### Riesgo 2: Configuración diferente entre máquinas

- Probabilidad: Alta.
- Impacto: Alta.
- Mitigación: centralizar puertos y configuración pública, documentar requisitos y variables, mantener secretos locales y realizar una validación de clone limpio en otra máquina.

### Riesgo 3: PostgreSQL no reproducible

- Probabilidad: Media.
- Impacto: Alta.
- Mitigación: EF Core migrations como única fuente física, documentar el comando real de actualización y probarlo desde una base local nueva.

### Riesgo 4: Frontend y backend desarrollados de forma aislada

- Probabilidad: Media.
- Impacto: Alta.
- Mitigación: integrar `GET /health` temprano, antes de construir la biblioteca visual completa.

### Riesgo 5: OpenAPI desactualizado respecto al backend

- Probabilidad: Media.
- Impacto: Media.
- Mitigación: versionar `api.generated.ts`, documentar `npm run api:generate` y exigir regeneración cuando cambie un contrato API.

### Riesgo 6: Edición manual de código generado

- Probabilidad: Media.
- Impacto: Media.
- Mitigación: encabezado/documentación clara de archivo generado, manual de uso y revisión de diffs.

### Riesgo 7: Estilos inconsistentes entre integrantes

- Probabilidad: Alta.
- Impacto: Media.
- Mitigación: `globals.css`, tokens únicos, Tailwind ligado a la misma fuente visual y componentes base reutilizables.

### Riesgo 8: Secretos versionados accidentalmente

- Probabilidad: Media.
- Impacto: Alta.
- Mitigación: User Secrets/env vars, `.env.example` sin valores sensibles, `.gitignore`, revisión del diff y documentación explícita de secretos prohibidos.

### Riesgo 9: Sprint 0 deriva hacia implementación anticipada de HUs

- Probabilidad: Alta.
- Impacto: Alta.
- Mitigación: revisar cada tarea contra la frontera infraestructura/feature; no agregar endpoints de negocio, pantallas funcionales, reglas de negocio ni seeds funcionales.

### Riesgo 10: CI demasiado complejo

- Probabilidad: Media.
- Impacto: Media.
- Mitigación: limitar CI a restore/install, lint, build y tests estables; excluir inicialmente PostgreSQL service container, Testcontainers, deploy, HomeLab, Playwright, coverage gates y scanning avanzado.

### Riesgo 11: Documentación insuficiente para onboarding

- Probabilidad: Media.
- Impacto: Alta.
- Mitigación: validar las instrucciones con un clone limpio y, preferentemente, con otro integrante.

### Riesgo 12: Persistencia de documentación contradictoria

- Probabilidad: Media.
- Impacto: Media.
- Mitigación: alinear al menos puerto backend, estrategia OpenAPI y convención de commits en los documentos directamente afectados una vez confirmada la configuración implementada.

### Riesgo 13: UI Kit expuesto accidentalmente en Production

- Probabilidad: Baja.
- Impacto: Media.
- Mitigación: condicionar el registro de `/dev/ui-kit` al entorno Development y verificar una build/configuración Production.

### Riesgo 14: La migration inicial crece hacia el modelo funcional completo

- Probabilidad: Media.
- Impacto: Alta.
- Mitigación: limitarla a Identity y elementos técnicos estrictamente necesarios; ninguna tabla de negocio se crea anticipadamente.

### Riesgo 15: Un health check de base de datos filtra información

- Probabilidad: Baja.
- Impacto: Media.
- Mitigación: el endpoint debe reportar estado técnico mínimo; nunca devolver connection strings, credenciales, stack traces ni detalles internos sensibles.

## Estrategia de reversión

El change deberá implementarse en unidades revisables y reversibles.

- Los scaffolds frontend/backend deben introducirse mediante PRs encadenados hacia `develop`, evitando una única integración masiva.
- Si una unidad introduce una regresión, debe poder revertirse sin revertir los PRs anteriores que ya hayan sido verificados.
- Una migration técnica inicial debe poder retirarse o revertirse antes de contener datos funcionales relevantes.
- No debe realizarse una migración destructiva sobre datos existentes durante Sprint 0.
- Si una configuración nueva de CI bloquea el trabajo por problemas propios del pipeline, puede revertirse o simplificarse manteniendo los comandos locales documentados.
- Si `/dev/ui-kit` presenta riesgo de exposición en Production, la ruta debe poder deshabilitarse independientemente de los componentes reutilizables.
- Si la generación OpenAPI falla, el último `api.generated.ts` verificado y versionado debe permitir que el frontend siga compilando mientras se corrige el generador.
- Los detalles de rollback de HomeLab/deployment no se definen porque dicho entorno está fuera del alcance principal de este change.

## Criterios de éxito

Sprint 0 será exitoso cuando:

- el repositorio pueda reconstruirse desde un clone limpio;
- backend compile y ejecute en `:5057`;
- `GET /health` sea observable;
- PostgreSQL local pueda inicializarse mediante EF Core migrations;
- frontend instale y ejecute en `:8087`;
- frontend alcance realmente `/health`;
- OpenAPI y Swagger estén disponibles en Development y no públicamente en Production;
- `npm run api:generate` produzca tipos TypeScript;
- el archivo generado esté versionado y no se edite manualmente;
- exista una base visual centralizada;
- existan los componentes mínimos acordados;
- `/dev/ui-kit` permita inspeccionar esa base en Development;
- exista documentación suficiente para que un integrante diferente pueda iniciar;
- CI básico ejecute verificaciones estables;
- no exista ningún secreto real versionado;
- ninguna HU haya sido implementada o marcada Done como consecuencia de este change;
- los resultados reales de Sprint 0 sean documentados después de ejecutarlos;
- cualquier validación no realizada, incluida otra máquina, quede explícitamente como `PENDIENTE` y no como PASS.
