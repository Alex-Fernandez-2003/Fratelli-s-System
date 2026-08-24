# Diseño

## Arquitectura/estructura afectada

El change materializará la arquitectura ya documentada, no una arquitectura nueva.

Flujo objetivo:

- baseline documental
  - Sprint 0
    - repositorio reproducible
    - backend mínimo integrado
    - frontend mínimo integrado
    - PostgreSQL reproducible
    - OpenAPI/tipos
    - sistema visual/UI Kit
    - tests/CI
    - onboarding
  - Sprint 1

La arquitectura debe mantenerse como monolito modular con Clean Architecture práctica, una API ASP.NET Core y un frontend React separado durante desarrollo. PostgreSQL sigue siendo la persistencia relacional definida y SignalR permanece limitado al realtime futuro del KDS. :contentReference[oaicite:6]{index=6}

## Componentes afectados

### Raíz

- configuración de estilo/formato;
- ignore rules;
- README/onboarding general;
- Git workflow;
- GitHub Actions.

### Backend

- solución;
- Domain;
- Application;
- Infrastructure;
- Api;
- configuración;
- persistencia;
- Identity/JWT;
- manejo de errores;
- health;
- OpenAPI/Swagger;
- CORS;
- SignalR;
- tests.

### Frontend

- aplicación y providers;
- rutas;
- configuración/env;
- API client;
- Query infrastructure;
- realtime infrastructure;
- tipos generados;
- Atomic Design;
- `features/_template`;
- estilos/tokens;
- UI Kit;
- tests;
- documentación.

### Documentación

- OpenSpec del único change;
- arquitectura afectada por contradicciones;
- manuales;
- Sprint 0 factual;
- evidencias.

## Límites respetados

- `Domain` MUST permanecer independiente de infraestructura.
- `Application` MUST depender de abstracciones/dominio y no de UI.
- `Infrastructure` MUST encapsular persistencia e Identity.
- `Api` MUST actuar como composition/runtime boundary.
- La configuración Identity/JWT MUST permanecer infraestructura, no caso de uso funcional.
- SignalR MUST permanecer transporte técnico sin comportamiento KDS de HU-010.
- La UI compartida MUST permanecer independiente de features específicas.
- `features/` MUST encapsular futuras capacidades del producto.
- El cliente HTTP MUST permanecer independiente de componentes visuales.
- `api.generated.ts` MUST permanecer contrato generado, separado de `httpClient`.
- OpenAPI MUST permanecer herramienta de desarrollo/contrato y no dependencia runtime de Production.
- EF migrations MUST ser la única fuente del esquema físico.
- HomeLab MUST permanecer fuera del camino crítico del desarrollo diario.
- Sprint 0 MUST detener cualquier tarea que empiece a incorporar reglas funcionales de una HU.

## Precedencia de decisiones

Para este change se fijan las siguientes decisiones para evitar reinterpretaciones durante apply:

1. Backend local: `5057`.
2. Frontend local: `8087`.
3. API funcional futura: `/api/v1`.
4. Health técnico: `/health`.
5. Hub previsto: `/hubs/kitchen`.
6. OpenAPI Development: `/openapi/v1.json`.
7. Swagger Development: `/swagger`.
8. OpenAPI frontend: **tipos solamente**.
9. Cliente HTTP: manual/híbrido.
10. Generador: `openapi-typescript`.
11. Archivo generado: `src/types/api.generated.ts`.
12. No Orval.
13. PostgreSQL local por integrante.
14. EF migrations como fuente física.
15. No Docker obligatorio.
16. No HomeLab como DB de desarrollo compartida.
17. Commit: `tipo: descripción breve`.
18. Un solo OpenSpec change para todo Sprint 0.
19. Gestor frontend canónico: pnpm con `pnpm-lock.yaml`; CI instala mediante `pnpm install --frozen-lockfile` y npm conserva compatibilidad para scripts sin mantener `package-lock.json`.

## Fundación del backend

### Estructura objetivo

La solución debe materializar:

- `backend/RestaurantSystem.slnx`
- `backend/src/RestaurantSystem.Domain/`
- `backend/src/RestaurantSystem.Application/`
- `backend/src/RestaurantSystem.Infrastructure/`
- `backend/src/RestaurantSystem.Api/`
- `backend/tests/RestaurantSystem.Domain.Tests/`
- `backend/tests/RestaurantSystem.Application.Tests/`
- `backend/tests/RestaurantSystem.IntegrationTests/`

No deben crearse módulos funcionales vacíos de catálogo, pedidos, ventas, inventario, etc. únicamente porque aparezcan en diagramas conceptuales futuros.

### Dependencias

- Application → Domain
- Infrastructure → Application → Domain
- Api → Application + Infrastructure

La implementación deberá verificar referencias reales después del scaffold mediante inspección de proyectos y build.

### Configuración

La composition root debe integrar únicamente la infraestructura necesaria:

- configuration;
- DI;
- persistence;
- Identity;
- authentication;
- authorization;
- ProblemDetails/error handling;
- logging;
- CORS;
- health;
- OpenAPI/Swagger;
- SignalR.

No deben registrarse servicios de casos de uso ficticios.

### Health

`GET /health` es el primer contrato técnico integrado.

Diseño:

- endpoint raíz, fuera de `/api/v1`;
- respuesta mínima;
- sin datos sensibles;
- suficiente para smoke validation;
- si la comprobación de DB puede incorporarse con la infraestructura ya presente, se recomienda incluirla;
- la conexión a PostgreSQL se valida obligatoriamente de todos modos mediante migrations/build/run.

### OpenAPI

El backend en Development debe proporcionar:

- `/openapi/v1.json`
- `/swagger`

En Production esos recursos no deben mapearse/exponerse públicamente.

La elección exacta de paquetes/configuración compatible con .NET 10 se realizará con el scaffold real; el comportamiento requerido es el contrato obligatorio.

### Identity/JWT

La configuración debe preparar:

- almacén de usuarios/roles basado en Identity;
- integración de EF cuando corresponda;
- autenticación JWT Bearer;
- pipeline de autorización;
- configuración segura de claves/issuer/audience si el mecanismo seleccionado las requiere.

No debe preparar:

- endpoint login;
- endpoint refresh;
- endpoint logout;
- endpoint reset;
- UI auth;
- almacenamiento frontend funcional de tokens;
- comportamiento completo de sesión.

La baseline futura de 15 minutos/12 horas se conserva como restricción arquitectónica, no como feature implementada. La documentación de seguridad establece acceso corto y almacenamiento en memoria del frontend. :contentReference[oaicite:7]{index=7}

### SignalR

Sprint 0 debe:

- registrar la capacidad SignalR;
- preparar proxy frontend `/hubs` con WebSocket;
- conservar `/hubs/kitchen` como ruta arquitectónica prevista.

Un hub vacío/técnico MAY utilizarse para validar el wiring, pero no debe:

- consultar pedidos;
- emitir eventos de comandas;
- cambiar estado de cocina;
- implementar HU-010.

## Fundación de base de datos

### Fuente de verdad

- PostgreSQL = motor.
- EF Core = ORM.
- Npgsql = provider.
- migrations = esquema físico.

No se creará `schema.sql`.

### Configuración local

Cada integrante debe poder proporcionar localmente:

- host;
- puerto;
- database;
- usuario;
- contraseña.

Los secretos no deben vivir en archivos versionados. La baseline de seguridad requiere User Secrets/env/local config ignorada y prohíbe colocar credenciales en README, frontend, capturas o logs. :contentReference[oaicite:8]{index=8}

### Migration inicial

La primera migration se limita a:

- Identity, si la configuración requiere persistencia;
- soporte técnico mínimo indispensable.

No deben adelantarse entidades de:

- productos;
- stock;
- producción;
- pedidos;
- ventas;
- compras;
- asistencia;
- turnos;
- cierres.

### Comando EF

El apply debe descubrir y documentar el comando real que funcione con los proyectos creados.

La forma esperada puede requerir:

- project = Infrastructure;
- startup project = Api.

Pero el README final debe registrar el comando **probado**, no copiar una forma conceptual sin ejecución.

## Fundación del frontend

### Estructura que debe materializarse cuando tenga contenido real

- `frontend/docs/`
- `frontend/src/app/`
- `frontend/src/assets/brand/`
- `frontend/src/components/atoms/`
- `frontend/src/components/molecules/`
- `frontend/src/components/organisms/`
- `frontend/src/components/templates/`
- `frontend/src/features/_template/`
- `frontend/src/lib/api/`
- `frontend/src/lib/query/`
- `frontend/src/lib/realtime/`
- `frontend/src/pages/`
- `frontend/src/routes/`
- `frontend/src/styles/`
- `frontend/src/types/`

`src/lib/auth/` debe materializarse solo si contiene una abstracción técnica real requerida por la preparación futura del token; no debe crearse vacía para cumplir un dibujo.

De igual forma, no se crearán directorios para todas las features futuras.

### Estructura base de la aplicación

La aplicación base debe conectar:

- configuración;
- providers;
- router;
- QueryClient;
- estilos globales;
- rutas Development.

No debe simular dashboard, login o módulos funcionales.

### `features/_template`

El template debe enseñar composición, no negocio.

Puede incluir una muestra estructural mínima de:

- API;
- hooks;
- types;
- components;
- export público.

Debe evitar datos Fratelli ficticios o endpoints inexistentes presentados como reales.

## Sistema visual/UI Kit

### Tokens

`globals.css` será la fuente principal de tokens Fratelli.

La baseline naranja/negro se incorpora como punto de partida ajustable, no como extracción oficial de un brand book.

Tailwind debe mapearse a esos valores o consumir variables CSS, evitando duplicar una paleta independiente.

### Componentes

La implementación debe privilegiar APIs simples y consistentes.

Los estados básicos a contemplar incluyen, según aplique:

- default;
- hover/focus;
- disabled;
- loading;
- validation/error;
- success.

Accesibilidad mínima:

- labels/association correctos;
- focus visible;
- controles operables por teclado cuando corresponda;
- roles/semántica apropiados;
- estado disabled real;
- diálogo con comportamiento accesible razonable.

No se requiere construir una librería universal.

### `/dev/ui-kit`

La ruta técnica se registra solo cuando el frontend está en modo Development.

Debe reunir:

- paleta;
- tipografía;
- atoms;
- molecules;
- organisms;
- AppShell;
- estados;
- `Conexión con backend`.

En Production la ruta debe quedar ausente/no resoluble.

## Estrategia híbrida de API/OpenAPI

### Flujo de datos

- configuración/env
  - `lib/api/http-client`
    - `lib/api/endpoints`
      - futura `feature/api`
        - TanStack Query
          - componente/página

Separadamente:

- ASP.NET Core
  - `/openapi/v1.json`
    - `pnpm run api:generate`
      - `src/types/api.generated.ts`
        - futura `feature/api`

### Cliente manual

Área prevista:

- `src/config/env.ts`
- `src/lib/api/api-error.ts`
- `src/lib/api/endpoints.ts`
- `src/lib/api/http-client.ts`
- `src/lib/api/problem-details.ts`
- `src/lib/api/index.ts`

Esos nombres están definidos por la baseline del change y pueden ajustarse únicamente si el scaffold real presenta una razón técnica concreta y documentada.

### Health y base URL

Existe un detalle de integración que el apply no debe volver a rediseñar:

- `VITE_API_BASE_URL=/api/v1` cubre futuros endpoints REST;
- `/health` está intencionalmente fuera de `/api/v1`;
- por tanto, Development debe poder proxyar también `/health` o resolverlo desde una abstracción central equivalente;
- no se debe cambiar el contrato a `/api/v1/health` solo para evitar esa configuración;
- la UI Kit no debe hardcodear el host backend.

### Tipos generados

Estrategia concreta:

- mantener `api.generated.ts` versionado;
- regenerarlo desde OpenAPI Development;
- no editarlo;
- no exigir regeneración durante cada instalación;
- no ejecutar generación automáticamente en CI si ello obliga a levantar backend + PostgreSQL;
- revisar su diff cuando cambie un contrato API.

Esto mantiene el frontend compilable desde clone y evita introducir una plataforma de code generation compleja.

## Git/flujo de trabajo

### Flujo diario

- partir de `develop`;
- abrir rama corta;
- implementar una unidad;
- ejecutar verificaciones;
- push;
- PR → `develop`;
- review;
- merge.

### Cierre de Sprint

- `develop`;
- validación integrada;
- Sprint Review;
- comprobación de estabilidad;
- PR `develop` → `main`.

La implementación de Sprint 0 debe verificar si existe capacidad administrativa para configurar protección de ramas. La ausencia de permisos no bloquea el scaffold: en ese caso el flujo se documenta y la configuración administrativa queda registrada como pendiente.

## Pruebas/CI

### Backend

Estructura:

- Domain.Tests;
- Application.Tests;
- IntegrationTests.

Sprint 0 no necesita inventar lógica de dominio para producir tests.

Los tests iniciales deben concentrarse en contratos técnicos que existan realmente.

Si la infraestructura de integration tests requiere PostgreSQL, no debe introducirse EF InMemory como evidencia principal de comportamiento relacional solo para simplificar el gate; la estrategia documental ya prioriza PostgreSQL real para integración significativa. :contentReference[oaicite:9]{index=9}

### Frontend

Smoke tests apropiados:

- un componente base;
- estado de error/éxito técnico si es estable;
- routing/UI Kit cuando pueda testearse sin exceso de mocking.

No se requiere coverage objetivo.

### CI

Pipeline mínimo esperado:

**Frontend**

- `pnpm install --frozen-lockfile`
- `pnpm run format:check`
- `pnpm run typecheck`
- `pnpm run lint`
- `pnpm run build`
- `pnpm run test` solo cuando el runner y tests base sean estables

pnpm y `pnpm-lock.yaml` son canónicos. npm mantiene compatibilidad para invocar scripts, pero no se versiona ni mantiene `package-lock.json`.

**Backend**

- restore
- build
- test

No se añade base de datos de CI salvo que una prueba elegida haga imprescindible esa dependencia y exista una solución simple que no contradiga el alcance; por defecto Sprint 0 evita esa complejidad.

## Documentación

### README raíz

Como `README.md` raíz actualmente carece de onboarding técnico sustancial, el apply SHOULD convertirlo en índice breve:

- propósito del repositorio;
- prerequisitos generales;
- inicio rápido de frontend y backend;
- Git flow;
- links a README frontend/backend;
- links a documentación/OpenSpec.

No debe duplicar manuales detallados.

### Backend README

Debe ser la fuente operativa para:

- SDK;
- restore;
- build;
- run;
- port;
- DB;
- secretos;
- migration;
- OpenAPI/Swagger;
- health;
- tests.

### Frontend README

Debe ser la fuente operativa para comandos frontend.

### Manual frontend

Debe ser la guía de patrones de desarrollo.

### `sprint-00.md`

No se crea ahora como evidencia.

Durante apply/verify se genera con hechos reales y se mantiene breve. La trazabilidad vigente exige no declarar PASS ni evidencia antes de ejecución. :contentReference[oaicite:10]{index=10}

## Evidencias

La implementación puede producir, si existen realmente:

- `docs/capturas/sprint-00-branches.png`
- `docs/capturas/sprint-00-backend-health.png`
- `docs/capturas/sprint-00-database-update.png`
- `docs/capturas/sprint-00-ui-kit.png`
- `docs/capturas/sprint-00-front-back-connection.png`
- `docs/capturas/sprint-00-ci.png`

No crear placeholders binarios ni referenciar archivos inexistentes.

La estructura será plana, sin subdirectorios por tarea.

## Contratos modificados

### Nuevos contratos técnicos

- backend local: `localhost:5057`;
- frontend local: `localhost:8087`;
- REST base: `/api/v1`;
- health: `GET /health`;
- OpenAPI Development: `/openapi/v1.json`;
- Swagger Development: `/swagger`;
- hub reservado: `/hubs/kitchen`;
- frontend API base: `/api/v1`;
- script frontend canónico: `pnpm run api:generate`; npm puede invocar el script por compatibilidad;
- tipo generado: `src/types/api.generated.ts`.

### Contratos de configuración

- PostgreSQL connection information local;
- User Secrets/env vars backend;
- `frontend/.env.example`;
- `VITE_API_BASE_URL` cuando sea utilizado.

Los nombres exactos adicionales de variables backend deben derivarse de la configuración real creada y documentarse después del scaffold.

### Contratos no creados

No se confirman ni deben crearse contratos externos de:

- auth funcional;
- productos;
- inventario;
- pedidos;
- KDS;
- ventas;
- compras;
- personal;
- cierres.

## Flujo de datos

### Reproducibilidad

- `git clone`
  - instalar/restaurar dependencias
    - configurar PostgreSQL local
      - configurar secretos
        - aplicar migrations
          - ejecutar backend `:5057`
            - ejecutar frontend `:8087`
              - frontend `/dev/ui-kit`
                - proxy/config
                  - `GET /health`
                    - respuesta técnica

### OpenAPI

- backend Development
  - documento `/openapi/v1.json`
    - `pnpm run api:generate`
      - `api.generated.ts`
        - futura API de feature

### Estilos

- `globals.css`
  - tokens centrales
    - Tailwind/utilidades
      - componentes base
        - futuras features

### Futura autenticación

- Identity/JWT foundation de Sprint 0
  - HU-001 futura
    - login/token/refresh/logout
      - integración auth frontend

Sprint 0 termina antes de ese comportamiento funcional.

## Pruebas requeridas por capa

### Build/runtime del backend

Agregar/verificar:

- solución restaura;
- solución compila;
- API arranca;
- `/health` responde;
- configuración Development expone OpenAPI/Swagger;
- configuración Production no expone públicamente esos recursos.

### Persistencia

Si la infraestructura de tests lo permite, agregar/extender pruebas para:

- `DbContext` configurado con provider correcto;
- migration aplicable a PostgreSQL de prueba/local;
- ausencia de modelo funcional anticipado.

La evidencia principal de migration puede ser un procedimiento manual reproducible en Sprint 0 si automatizar PostgreSQL en CI excede el alcance.

### Frontend

Agregar/extender pruebas para:

- render de uno o más componentes base;
- estados críticos de componentes cuando sean razonables;
- manejo observable de conexión health si puede probarse sin acoplamiento excesivo;
- ausencia/guard de ruta UI Kit en Production si el patrón elegido lo permite.

### Integración manual

Debe verificarse obligatoriamente:

- frontend `:8087`;
- proxy;
- backend `:5057`;
- `/health`;
- mensaje de conexión.

### Validación en otra máquina

- clone;
- configuración DB;
- database update;
- backend;
- frontend;
- health;
- UI Kit.

Si no se ejecuta, no se sustituye por una afirmación: queda `PENDIENTE`.

## Compromisos aceptados

- Se prioriza monolito modular sobre microservicios.
- Se prioriza Clean Architecture práctica sobre capas adicionales.
- Se prioriza PostgreSQL local por integrante sobre una DB compartida.
- Se prioriza migrations sobre scripts SQL paralelos.
- Se prioriza un cliente HTTP manual pequeño sobre codegen completo.
- Se priorizan tipos OpenAPI versionados sobre regeneración obligatoria en cada clone.
- Se prioriza una UI library pequeña sobre un design system completo.
- Se prioriza integración `/health` temprana sobre construir frontend y backend aislados.
- Se prioriza CI sencillo sobre infraestructura de test sofisticada.
- Se acepta que algunos archivos generados, lockfiles y migrations inflen el diff de Sprint 0.
- Se acepta posponer Playwright/HomeLab/Docker hasta que exista una necesidad funcional o de integración real.

## Restricciones de implementación

- No implementar código de negocio.
- No agregar dependencias fuera del stack confirmado sin justificar incompatibilidad real.
- No crear carpetas vacías por estética.
- No anticipar módulos de negocio.
- No anticipar toda la base de datos.
- No crear datos funcionales ficticios para mostrar que la fábrica “funciona”.
- No exponer Swagger/OpenAPI públicamente en Production.
- No almacenar secrets en Git.
- No guardar access token en storage persistente.
- No editar manualmente `api.generated.ts`.
- No introducir Orval.
- No depender de HomeLab.
- No exigir Docker.
- No convertir UI Kit en ruta productiva.
- No usar `5087`; la baseline del change es `5057`.
- No mantener ejemplos antiguos de commits como norma vigente si contradicen `docs/15`.
- El apply MUST documentar los comandos reales que haya ejecutado y no comandos hipotéticos.
- Las evidencias MUST corresponder a ejecuciones reales.

## Archivos/carpetas probablemente nuevos

La lista describe intención; el apply deberá evitar crear cualquier elemento que quede vacío o innecesario.

### Raíz

- `.editorconfig`
- `.gitignore` o actualización equivalente si aparece antes de apply
- `.github/workflows/ci.yml`

### OpenSpec

- `docs/openspec/changes/prepare-sprint-0-development-foundation/proposal.md`
- `docs/openspec/changes/prepare-sprint-0-development-foundation/spec.md`
- `docs/openspec/changes/prepare-sprint-0-development-foundation/design.md`
- `docs/openspec/changes/prepare-sprint-0-development-foundation/tasks.md`

No crear changes adicionales para Sprint 0.

### Backend

- `backend/RestaurantSystem.slnx`
- proyectos bajo `backend/src/`
- proyectos bajo `backend/tests/`
- `backend/README.md`
- configuración real de persistence/Identity/auth/error handling/health/OpenAPI/SignalR
- migration técnica inicial si resulta necesaria

### Frontend

- `frontend/README.md`
- `frontend/docs/manual-de-uso.md`
- `frontend/.env.example`
- `frontend/package.json`
- `frontend/pnpm-lock.yaml`
- `frontend/eslint.config.js`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `frontend/src/config/env.ts`
- `frontend/src/styles/globals.css`
- `frontend/src/lib/api/api-error.ts`
- `frontend/src/lib/api/endpoints.ts`
- `frontend/src/lib/api/http-client.ts`
- `frontend/src/lib/api/problem-details.ts`
- `frontend/src/lib/api/index.ts`
- `frontend/src/types/api.generated.ts`
- componentes base acordados
- ruta/página Development UI Kit
- estructura real de `features/_template`
- archivos de providers/router/realtime que sean necesarios

### Documentación posterior a ejecución

- `docs/sprints/sprint-00.md`
- `docs/capturas/` únicamente cuando existan evidencias reales

## Archivos probablemente modificados

- `README.md` raíz.
- `docs/10-arquitectura.md` para eliminar referencias técnicas incompatibles con `5057` y la estrategia OpenAPI vigente.
- documentación de arquitectura relacionada con OpenAPI si conserva el modelo de cliente generado completo.
- `docs/historias/README.md` si el ejemplo antiguo de commit sigue pudiendo interpretarse como norma.
- ADR-002 únicamente según la política real de ADRs: enmendar, anotar supersesión o crear la aclaración correspondiente sin falsificar la historia de decisiones.
- diagramas `.puml` únicamente si contienen puertos/contratos que queden objetivamente desactualizados por el scaffold real.

No modificar documentación histórica no relacionada solo para “limpiar” el repositorio.

## Elementos que requieren verificación durante implementación

Estos puntos no reabren decisiones principales, pero deben comprobarse con el scaffold real:

1. versión exacta de Node.js requerida;
2. versiones concretas de paquetes frontend;
3. paquetes/configuración exacta necesarios para exponer simultáneamente OpenAPI JSON y Swagger con .NET 10;
4. versión concreta de tooling EF;
5. comando exacto `dotnet ef database update`;
6. necesidad real de design-time `DbContext` factory;
7. nombre final de migration técnica inicial;
8. si `/health` incluirá comprobación DB o si la DB se validará por separado;
9. mecanismo concreto para que `/health` pase por proxy de Development;
10. estrategia exacta para ocultar `/dev/ui-kit` en Production;
11. presencia o ausencia de un logo limpio antes de materializar un asset;
12. permisos de repositorio para branch protection/Actions;
13. política del repositorio para modificar ADR aceptado vs documentar supersesión;
14. resultado real de CI;
15. resultado real de la validación en una segunda máquina.

Ninguno de estos puntos autoriza cambiar silenciosamente:

- puerto `5057`;
- arquitectura Clean Architecture;
- PostgreSQL/EF migrations;
- cliente HTTP híbrido;
- OpenAPI types-only;
- frontera no-HU.

## Preguntas de diseño abiertas

No quedan preguntas arquitectónicas bloqueantes con la información auditada.

Preguntas no bloqueantes que el apply debe resolver mediante evidencia del scaffold:

- ¿Qué comando exacto de EF funciona con los proyectos finalmente creados?
- ¿Qué versión mínima de Node debe documentarse?
- ¿El health DB puede añadirse sin dependencia/complexidad adicional significativa?
- ¿La política ADR del repositorio permite editar ADR-002 o exige registrar una supersesión?
- ¿Hay permisos para configurar protecciones de ramas?
- ¿Existe al momento de apply un asset de logo limpio incorporado por otro cambio?

Si cualquiera de estas verificaciones revela una incompatibilidad que obligue a cambiar una decisión principal del briefing, el agente debe detener esa parte y actualizar proposal/spec/design antes de continuar, en lugar de improvisar una nueva arquitectura.
