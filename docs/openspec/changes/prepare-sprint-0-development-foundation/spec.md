# Especificación

## Requisitos

### 1. Alcance y frontera de Sprint 0

- El change MUST utilizar únicamente el identificador `prepare-sprint-0-development-foundation`.
- Los artefactos pre-ejecución MUST corresponder a `docs/openspec/changes/prepare-sprint-0-development-foundation/`.
- Sprint 0 MUST preparar infraestructura y MUST NOT implementar comportamiento funcional de `HU-001` a `HU-031`.
- Ninguna HU MUST marcarse como completada por disponer de infraestructura técnica.
- Identity configurado MUST NOT interpretarse como login implementado.
- JWT configurado MUST NOT interpretarse como HU-001 implementada.
- SignalR configurado MUST NOT interpretarse como KDS funcional.
- `DbContext` y migrations MUST NOT interpretarse como implementación de inventario u otras entidades del negocio.
- `httpClient` y TanStack Query MUST NOT interpretarse como features funcionales.
- OpenSpec MAY utilizarse posteriormente en cambios complejos, pero el proyecto MUST NOT imponer `1 HU = 1 change` como consecuencia de Sprint 0.

### 2. Git y convenciones

- El flujo de integración MUST utilizar `main` como rama estable y `develop` como rama de integración.
- El trabajo ordinario SHOULD realizarse en ramas cortas con prefijos `feature/`, `fix/`, `docs/` o `chore/`.
- Los nombres de ramas MUST usar kebab-case después del prefijo.
- El trabajo aislable SHOULD entrar a `develop` mediante Pull Request.
- Un incremento de Sprint SHOULD pasar de `develop` a `main` mediante Pull Request después de validación integrada.
- El flujo ordinario MUST evitar push directo a `main`.
- El flujo habitual SHOULD evitar push directo a `develop` cuando una rama corta sea razonable.
- Los commits MUST usar `tipo: descripción breve`.
- Los tipos aceptados MUST incluir `feat`, `fix`, `docs`, `chore`, `refactor` y `test`.
- Un ID de HU MAY estar en rama, PR, tablero o Markdown y MUST NOT ser obligatorio en el encabezado del commit.
- El repositorio MUST disponer de `.editorconfig`.
- El frontend MUST disponer de ESLint y Prettier.
- El backend MUST permanecer compatible con `dotnet format`.

### 3. Fundación del backend

- El backend MUST usar .NET 10, ASP.NET Core Web API y C#.
- La solución MUST mantener la estructura conceptual:
  - `RestaurantSystem.Domain`
  - `RestaurantSystem.Application`
  - `RestaurantSystem.Infrastructure`
  - `RestaurantSystem.Api`
  - `RestaurantSystem.Domain.Tests`
  - `RestaurantSystem.Application.Tests`
  - `RestaurantSystem.IntegrationTests`
- `Application` MUST depender de `Domain`.
- `Infrastructure` MUST depender de `Application` y `Domain`.
- `Api` MUST integrar `Application` e `Infrastructure`.
- Sprint 0 MUST NOT agregar capas arquitectónicas adicionales sin una necesidad descubierta y documentada.
- La API MUST utilizar `5057` como puerto local de referencia.
- Las rutas REST funcionales futuras MUST ubicarse bajo `/api/v1`.
- El backend MUST registrar configuración y Dependency Injection necesarias para la fábrica.
- El backend MUST configurar EF Core y Npgsql.
- El backend MUST disponer de un `DbContext` funcional.
- El backend MUST disponer de mecanismo de migrations.
- El backend MUST preparar ASP.NET Core Identity como infraestructura.
- El backend MUST preparar JWT Bearer como infraestructura.
- El backend MUST preparar el mecanismo de autorización/policies sin implementar permisos funcionales de HUs.
- El backend MUST configurar ProblemDetails.
- El backend MUST disponer de un mecanismo centralizado para errores no manejados apropiado a la infraestructura.
- El backend MUST disponer de logging base sin registrar secretos.
- El backend MUST configurar CORS para el desarrollo local requerido.
- El backend MUST disponer de health checks.
- El backend MUST configurar OpenAPI.
- El backend MUST configurar Swagger para Development.
- El backend MUST registrar SignalR como infraestructura.
- El backend MAY mapear un hub técnico mínimo en `/hubs/kitchen` si es necesario para verificar configuración.
- Un hub técnico de Sprint 0 MUST NOT contener eventos, comandos o comportamiento funcional de cocina.

### 4. Endpoint de health

- El backend MUST exponer `GET /health`.
- `GET /health` MUST permitir verificar que la aplicación está levantada.
- La respuesta MUST evitar credenciales, connection strings, stack traces y datos internos sensibles.
- El health check SHOULD comprobar PostgreSQL cuando pueda hacerse usando la infraestructura ya necesaria y sin introducir complejidad desproporcionada.
- La conectividad con PostgreSQL MUST verificarse en Sprint 0 aunque la comprobación no quede incorporada al payload público de `/health`.
- El frontend de Development MUST consumir realmente `GET /health`.
- El estado visual MUST distinguir al menos `API disponible` y `API no disponible`.

### 5. OpenAPI y Swagger

- `/openapi/v1.json` MUST estar disponible en Development.
- `/swagger` MUST estar disponible en Development.
- `/openapi/v1.json` MUST NOT exponerse públicamente en el entorno HomeLab/demo cuando `Environment=Production`.
- `/swagger` MUST NOT exponerse públicamente en el entorno HomeLab/demo cuando `Environment=Production`.
- El frontend MUST NOT depender del documento OpenAPI en runtime de Production.
- La configuración MUST conservar la posibilidad de regenerar tipos mientras el backend se ejecuta en Development.

### 6. Identity y JWT

- Sprint 0 MUST instalar/configurar únicamente la infraestructura requerida para Identity y JWT Bearer.
- Sprint 0 MUST NOT implementar login funcional.
- Sprint 0 MUST NOT implementar refresh funcional.
- Sprint 0 MUST NOT implementar logout funcional.
- Sprint 0 MUST NOT implementar reset funcional de contraseña.
- Sprint 0 MUST NOT implementar pantallas de autenticación.
- Sprint 0 MUST NOT completar HU-001.
- La infraestructura MUST ser compatible con la baseline futura de access token de 15 minutos.
- La infraestructura frontend futura MUST asumir access token únicamente en memoria.
- El access token MUST NOT persistirse en `localStorage`.
- El access token MUST NOT persistirse en `sessionStorage`.
- La arquitectura MUST permitir en HU-001 un refresh token en cookie HttpOnly, `Secure` bajo HTTPS, con sesión máxima de 12 horas.
- Sprint 0 MUST NOT implementar anticipadamente el ciclo funcional completo de esa sesión.

### 7. PostgreSQL y migrations

- El desarrollo diario MUST utilizar PostgreSQL local por integrante.
- HomeLab MUST NOT ser una base compartida obligatoria para desarrollo diario.
- Las credenciales MUST configurarse localmente mediante mecanismos no versionados.
- El repositorio MUST documentar host, puerto, usuario, contraseña y database como conceptos configurables sin incluir secretos reales.
- EF Core migrations MUST ser la fuente de verdad del esquema físico.
- Sprint 0 MUST NOT crear `schema.sql` como fuente paralela del esquema.
- La implementación MUST documentar el comando real de `dotnet ef database update` que resulte del scaffold.
- La documentación MUST NOT utilizar el comando inválido `dotnet ef build database`.
- La migration inicial MAY contener infraestructura de Identity y elementos técnicos mínimos.
- La migration inicial MUST NOT anticipar las tablas finales de productos, inventario, producción, pedidos, ventas, compras, asistencia, turnos o cierre.
- Los seeds funcionales MUST quedar fuera de Sprint 0 salvo que una necesidad técnica indispensable sea descubierta y documentada.
- Una base local nueva MUST poder llegar al estado técnico esperado mediante migrations.

### 8. Fundación del frontend

- El frontend MUST usar React, TypeScript y Vite.
- El frontend MUST usar Tailwind CSS.
- El frontend MUST usar React Router.
- El frontend MUST usar TanStack Query.
- El frontend MUST disponer del cliente SignalR.
- El frontend MUST disponer de Vitest.
- El frontend MUST disponer de React Testing Library.
- El frontend MUST utilizar `8087` como puerto local.
- El frontend MUST incluir configuración centralizada de entorno.
- El frontend MUST disponer de infraestructura de routing.
- El frontend MUST disponer de un `QueryClient`/provider base.
- El frontend MUST disponer de infraestructura HTTP centralizada.
- El frontend MUST disponer de soporte base para ProblemDetails.
- El frontend MUST disponer de infraestructura futura de realtime sin implementar HU-010.
- El frontend MUST incluir `features/_template/` como referencia práctica.
- Sprint 0 MUST NOT crear anticipadamente todos los directorios de futuras features.
- No se MUST mantener directorios vacíos únicamente para reproducir un árbol conceptual.

### 9. Atomic Design y features

- Los componentes reutilizables MUST organizarse conceptualmente en atoms, molecules, organisms y templates.
- Las capacidades específicas del producto MUST quedar destinadas a `features/`.
- `features/_template/` MUST mostrar el patrón mínimo esperado para una feature sin implementar una HU.
- El template MAY incluir las áreas conceptuales `api`, `components`, `hooks`, `types` e `index`, pero MUST evitar lógica real de negocio.
- Los componentes compartidos MUST NOT depender de una HU específica.

### 10. Cliente HTTP

- El frontend MUST centralizar configuración/env antes del cliente HTTP.
- `http-client.ts` MUST centralizar base URL, métodos HTTP, JSON, headers, timeout y normalización de errores.
- El cliente MUST poder interpretar ProblemDetails.
- El cliente SHOULD soportar `credentials` cuando la futura topología de autenticación lo requiera.
- El cliente MUST dejar un punto de extensión para futura inyección del access token.
- El cliente MUST NOT depender de una implementación funcional de HU-001.
- Las rutas REST MUST centralizarse en `endpoints.ts`.
- Sprint 0 MUST NOT crear endpoints reales de `auth`, `products` u otros dominios únicamente para llenar `endpoints.ts`.
- Los ejemplos de endpoints, si existen como material de plantilla, MUST estar identificados como ejemplos no implementados.
- Los componentes MUST NOT hardcodear URLs de Production.

### 11. Proxy Vite

- Development MUST proxyar `/api` hacia el backend local en `:5057`.
- Development MUST proxyar `/hubs` hacia el backend local en `:5057`.
- `/hubs` MUST permitir WebSocket para SignalR.
- Debido a que el health técnico requerido está fuera de `/api/v1`, Development MUST proporcionar una ruta de proxy equivalente para `/health` o un mecanismo centralizado técnicamente equivalente que preserve el flujo frontend → proxy/config → backend.
- La UI Kit MUST NOT hardcodear `http://localhost:5057` dentro de un componente para resolver `/health`.

### 12. Estrategia OpenAPI híbrida

- OpenAPI MUST utilizarse para generar tipos TypeScript, no un cliente HTTP completo.
- La herramienta prevista MUST ser `openapi-typescript` salvo incompatibilidad descubierta durante el scaffold.
- Sprint 0 MUST NOT introducir Orval.
- El frontend MUST proporcionar `pnpm run api:generate` como comando canónico; `npm run api:generate` MAY mantenerse como compatibilidad de script.
- El flujo MUST producir `src/types/api.generated.ts`.
- `api.generated.ts` MUST considerarse código generado.
- `api.generated.ts` MUST NOT editarse manualmente.
- `api.generated.ts` SHOULD versionarse en Git para permitir que un clone compile sin requerir regeneración inmediata.
- La documentación MUST explicar que `api:generate` necesita un documento OpenAPI accesible de Development.
- CI MUST NOT depender de levantar todo el backend solamente para regenerar tipos si eso obliga a incorporar infraestructura compleja de PostgreSQL en Sprint 0.
- Cuando un contrato backend cambie posteriormente, el workflow de desarrollo SHOULD regenerar y revisar el diff de tipos.

### 13. Variables frontend

- `frontend/.env.example` MUST existir.
- `.env.example` MUST contener únicamente variables realmente utilizadas por la fábrica.
- `.env.example` MUST NOT contener secretos.
- `VITE_API_BASE_URL=/api/v1` SHOULD ser la baseline mientras sea compatible con el scaffold real.
- Variables adicionales MUST justificarse por una necesidad real del código.

### 14. Sistema visual Fratelli

- `frontend/src/styles/globals.css` MUST existir.
- Los colores principales MUST tener una única fuente de verdad.
- La baseline inicial SHOULD incluir:
  - `--color-brand-orange: #e18b34`
  - `--color-brand-orange-hover: #c9782a`
  - `--color-brand-black: #111214`
  - `--color-background: #17181a`
  - `--color-surface: #202124`
  - `--color-surface-elevated: #292a2d`
  - `--color-text: #f5f2ec`
  - `--color-text-muted: #b8b0a7`
  - `--color-border: #3b3937`
  - `--color-success: #2e9d65`
  - `--color-warning: #d9a029`
  - `--color-danger: #c95252`
  - `--color-info: #5d82c9`
- Esos valores MUST documentarse como baseline ajustable, no como colores oficiales extraídos de un manual de marca.
- `globals.css` SHOULD centralizar también tipografía, radios, sombras, fondos, superficies y bordes cuando aporten reutilización.
- Tailwind MUST consumir esos tokens o una estrategia equivalente con una única fuente de verdad.
- Las features MUST evitar paletas arbitrarias paralelas.
- `src/assets/brand/` MUST quedar preparado cuando exista contenido real que justifique versionar el directorio.
- Si no existe un logo limpio en el repositorio, el change MUST documentar dónde colocarlo posteriormente y MUST NOT redibujar ni modificar la referencia visual.

### 15. Componentes mínimos

Sprint 0 MUST proporcionar como alcance conceptual mínimo:

**Atoms**

- Button
- Input
- Select
- Textarea
- Checkbox
- Badge
- Spinner

**Molecules**

- FormField
- Alert
- EmptyState

**Organisms**

- DataTable base
- Modal/Dialog
- PageHeader

**Templates**

- AppShell

Los componentes:

- MUST ser reutilizables;
- MUST exponer props claras;
- MUST contemplar estados comunes cuando apliquen;
- MUST respetar accesibilidad básica;
- MUST usar tokens visuales;
- MUST permanecer independientes de una HU;
- SHOULD ser suficientemente simples para servir como referencia al equipo.

### 16. UI Kit

- Development MUST disponer de `/dev/ui-kit`.
- `/dev/ui-kit` MUST demostrar la paleta y tipografía.
- `/dev/ui-kit` MUST demostrar todos los componentes mínimos.
- La UI Kit MUST mostrar estados relevantes como default, disabled, loading, error y success cuando correspondan.
- `/dev/ui-kit` MUST incluir una sección `Conexión con backend`.
- Esa sección MUST consumir `GET /health`.
- La sección MUST mostrar de forma observable `API disponible` o `API no disponible`.
- `/dev/ui-kit` MUST NOT considerarse una feature del restaurante.
- `/dev/ui-kit` MUST NOT completar ninguna HU.
- `/dev/ui-kit` MUST NOT quedar disponible como ruta pública en Production.

### 17. Testing

- Backend MUST disponer de proyectos xUnit para Domain, Application e Integration.
- Frontend MUST disponer de Vitest y React Testing Library.
- Sprint 0 SHOULD agregar smoke tests técnicos pequeños cuando aporten verificación estable.
- Sprint 0 MUST NOT intentar crear suites funcionales extensas.
- Playwright MAY incorporarse posteriormente cuando existan flujos E2E reales.
- Sprint 0 MUST NOT requerir Playwright para cerrar la fábrica.
- La estrategia MUST evitar afirmar PASS antes de ejecutar una verificación real.

### 18. CI

- El repositorio MUST disponer de CI básico salvo impedimento técnico real documentado.
- El frontend CI MUST ejecutar `pnpm install --frozen-lockfile`.
- El frontend CI MUST ejecutar lint.
- El frontend CI MUST ejecutar build.
- El frontend CI SHOULD ejecutar tests cuando los smoke tests base sean estables.
- El backend CI MUST ejecutar restore.
- El backend CI MUST ejecutar build.
- El backend CI MUST ejecutar tests.
- Sprint 0 MUST NOT hacer obligatorios:
  - PostgreSQL service container;
  - Testcontainers;
  - deploy automático;
  - HomeLab;
  - Playwright completo;
  - coverage gate;
  - security scanning avanzado.

### 19. Manual frontend

`frontend/README.md` MUST documentar como mínimo:

- requisitos;
- instalación canónica con `pnpm install --frozen-lockfile` y `pnpm-lock.yaml`;
- compatibilidad de scripts con npm sin mantener `package-lock.json`;
- `pnpm run dev`;
- puerto `8087`;
- dependencia de backend para integración;
- puerto backend `5057`;
- variables de entorno;
- proxy;
- `pnpm run api:generate`;
- lint;
- tests;
- build.

`frontend/docs/manual-de-uso.md` MUST explicar:

- Atomic Design;
- `features/`;
- `features/_template/`;
- CSS global;
- tokens Fratelli;
- UI Kit;
- reutilizar un componente;
- crear un componente;
- crear una página;
- agregar una ruta;
- agregar un endpoint;
- usar `httpClient`;
- usar tipos OpenAPI;
- ejecutar `pnpm run api:generate`;
- qué archivo generado no debe editarse;
- TanStack Query;
- convenciones;
- ProblemDetails.

El manual MUST incluir el flujo:

- backend expone endpoint
- OpenAPI se actualiza
- `pnpm run api:generate`
- agregar ruta a `endpoints.ts`
- crear función en `feature/api`
- integrar TanStack Query
- consumir desde componente/página

### 20. Documentación backend

La documentación backend MUST cubrir:

- requisitos;
- restore;
- build;
- run;
- puerto `5057`;
- PostgreSQL;
- User Secrets/env vars;
- migrations;
- comando real de `dotnet ef database update`;
- OpenAPI;
- Swagger;
- `/health`;
- tests.

La información MAY distribuirse entre README raíz y `backend/README.md`, pero MUST evitar duplicación innecesaria.

### 21. Documentación Sprint 0 y evidencias

- Sprint 0 MUST generar `docs/sprints/sprint-00.md` únicamente durante/tras la ejecución real.
- El documento MUST registrar hechos reales, no resultados previstos.
- El documento MUST incluir objetivo, infraestructura creada, tareas realizadas, configuración relevante, verificaciones, problemas, decisiones, resultados, evidencias y estado final.
- El documento MUST NOT inventar PASS, fechas, capturas ni validaciones.
- Las evidencias visuales MUST almacenarse de forma plana en `docs/capturas/`.
- Las capturas MAY utilizar nombres como:
  - `sprint-00-branches.png`
  - `sprint-00-backend-health.png`
  - `sprint-00-database-update.png`
  - `sprint-00-ui-kit.png`
  - `sprint-00-front-back-connection.png`
  - `sprint-00-ci.png`
- Un archivo de evidencia MUST referenciarse únicamente si existe realmente.
- Una validación no ejecutada MUST registrarse como `PENDIENTE`.

### 22. Reproducibilidad

- El procedimiento documentado MUST permitir partir de un clone limpio.
- La fábrica MUST depender únicamente de archivos versionados, documentación y credenciales/configuración local del integrante.
- El procedimiento MUST NOT depender de instrucciones orales exclusivas de una persona.
- La implementación SHOULD validarse en al menos otra máquina del equipo.
- Si la segunda validación no ocurre durante Sprint 0, `sprint-00.md` MUST registrarla como `PENDIENTE`.
- HomeLab MUST NOT bloquear la validación local.

## Escenarios de comportamiento

### Escenario 1: Clone limpio de la fábrica

Dado un integrante con las herramientas requeridas y acceso al repositorio  
Cuando clona la baseline integrada, instala dependencias y sigue la documentación  
Entonces MUST poder identificar cómo configurar PostgreSQL, ejecutar migrations, iniciar backend y frontend sin depender de instrucciones orales

### Escenario 2: Backend mínimo operativo

Dado el backend configurado con valores locales válidos  
Cuando el integrante inicia la API  
Entonces la aplicación MUST escuchar en `localhost:5057` y `GET /health` MUST producir una respuesta técnica observable

### Escenario 3: PostgreSQL desde una base nueva

Dada una instancia PostgreSQL local accesible y una base preparada para el proyecto  
Cuando el integrante ejecuta el comando EF documentado  
Entonces las migrations técnicas MUST aplicarse sin requerir un `schema.sql` paralelo

### Escenario 4: El frontend conecta con el backend

Dado el backend en `:5057` y el frontend en `:8087`  
Cuando el integrante abre `/dev/ui-kit` en Development  
Entonces la sección `Conexión con backend` MUST consumir realmente `/health` y mostrar `API disponible`

### Escenario 5: Backend no disponible

Dado el frontend ejecutándose y el backend detenido o inaccesible  
Cuando `/dev/ui-kit` intenta consultar `/health`  
Entonces la interfaz MUST mostrar `API no disponible` sin convertir el fallo en una excepción no controlada de la página

### Escenario 6: OpenAPI en Development

Dado el backend ejecutándose con entorno Development  
Cuando se accede a `/openapi/v1.json` y `/swagger`  
Entonces ambos MUST estar disponibles

### Escenario 7: OpenAPI en Production

Dada la aplicación configurada como Production  
Cuando un usuario intenta acceder a `/openapi/v1.json` o `/swagger`  
Entonces dichos recursos MUST NOT quedar expuestos públicamente

### Escenario 8: Generación de tipos

Dado el backend de Development exponiendo un documento OpenAPI válido  
Cuando un integrante ejecuta `pnpm run api:generate`  
Entonces `src/types/api.generated.ts` MUST regenerarse sin reemplazar el cliente HTTP manual

### Escenario 9: UI Kit solo para desarrollo

Dada una build/configuración de Production del frontend  
Cuando se intenta navegar a `/dev/ui-kit`  
Entonces la página técnica MUST NOT quedar disponible públicamente

### Escenario 10: Uso de componentes base

Dada una nueva feature que comienza después de Sprint 0  
Cuando un desarrollador necesita un botón, campo, alerta o estructura de página ya contemplada  
Entonces SHOULD poder reutilizar la biblioteca base sin copiar estilos arbitrarios ni depender de una HU previa

### Escenario 11: Frontera con HU-001

Dado Identity y JWT configurados en Sprint 0  
Cuando se revisa el Product Backlog  
Entonces HU-001 MUST permanecer no completada hasta que su comportamiento funcional sea implementado y validado en su propio trabajo

### Escenario 12: Frontera con HU-010

Dado SignalR registrado y el proxy WebSocket preparado  
Cuando se revisa la funcionalidad KDS  
Entonces HU-010 MUST permanecer no completada porque Sprint 0 no implementa eventos ni comportamiento real de comandas

### Escenario 13: Evidencia todavía no realizada

Dada una validación prevista, como el clone en una segunda máquina, que no llegó a ejecutarse  
Cuando se cierre la documentación factual de Sprint 0  
Entonces su estado MUST registrarse como `PENDIENTE` y no como PASS

### Escenario 14: Cambio futuro de contrato API

Dada una HU futura que añade o modifica un endpoint  
Cuando el backend actualiza su documento OpenAPI  
Entonces el desarrollador SHOULD regenerar `api.generated.ts`, actualizar `endpoints.ts` y consumir el contrato desde la API de la feature sin generar un cliente completo

## Casos límite

- PostgreSQL instalado pero servicio detenido.
- Credenciales PostgreSQL incorrectas.
- Base de datos inexistente.
- Migration parcialmente aplicada.
- EF tooling no disponible en PATH.
- Diferencias de versión de SDK/runtime entre integrantes.
- Puerto `5057` ocupado.
- Puerto `8087` ocupado.
- Backend ejecutándose en un entorno distinto de Development durante `api:generate`.
- OpenAPI no accesible durante regeneración.
- `api.generated.ts` modificado manualmente.
- Proxy `/api` correcto pero `/health` no encaminado.
- Proxy `/hubs` sin soporte WebSocket.
- Backend detenido mientras UI Kit está abierta.
- CORS innecesariamente permisivo.
- `.env` o connection string sensible añadida por error al staging de Git.
- Migration inicial incluyendo accidentalmente entidades de negocio.
- Endpoint de ejemplo convertido accidentalmente en endpoint funcional.
- Policy o rol técnico convertido accidentalmente en regla funcional de una HU.
- UI Kit incluida accidentalmente en rutas Production.
- logo de referencia disponible solo como captura y no como asset limpio.
- diferencias entre la versión generada de tipos y el OpenAPI actual.
- CI intentando conectarse a PostgreSQL aunque Sprint 0 no haya configurado un servicio de DB en CI.
- documentación del puerto antiguo `5087` permaneciendo visible.
- documentación antigua obligando `feat(HU-xxx):`.
- segundo equipo/máquina no disponible para la validación de reproducibilidad.

## Criterios de aceptación

### Repositorio y Git

- [ ] `main` y `develop` están identificadas y el flujo PR está documentado.
- [ ] La convención de ramas cortas está documentada.
- [ ] La convención `tipo: descripción breve` está documentada.
- [ ] `.editorconfig` existe.
- [ ] El repositorio no contiene secretos reales introducidos por Sprint 0.

### Backend

- [ ] La solución backend existe con Domain, Application, Infrastructure y Api.
- [ ] Las referencias de proyectos respetan la dirección definida.
- [ ] `dotnet restore` finaliza correctamente.
- [ ] `dotnet build` finaliza correctamente.
- [ ] El backend inicia en `localhost:5057`.
- [ ] `GET /health` responde de forma verificable.
- [ ] ProblemDetails/errores base no exponen secretos.
- [ ] CORS Development permite el frontend local requerido sin `AllowAnyOrigin` indiscriminado.
- [ ] SignalR queda preparado sin eventos de negocio.

### Base de datos

- [ ] PostgreSQL local puede configurarse sin versionar credenciales.
- [ ] El `DbContext` puede conectarse a PostgreSQL.
- [ ] Existe un mecanismo de migrations.
- [ ] El comando real de `dotnet ef database update` está documentado.
- [ ] Ese comando funciona sobre una base local limpia.
- [ ] No existe un `schema.sql` utilizado como fuente paralela.
- [ ] La migration inicial no anticipa el modelo funcional completo.

### OpenAPI

- [ ] `/openapi/v1.json` funciona en Development.
- [ ] `/swagger` funciona en Development.
- [ ] `/openapi/v1.json` no queda públicamente habilitado en Production.
- [ ] `/swagger` no queda públicamente habilitado en Production.

### Frontend

- [ ] `pnpm install --frozen-lockfile`/instalación documentada funciona con `pnpm-lock.yaml`; npm conserva compatibilidad de scripts sin `package-lock.json`.
- [ ] El frontend inicia en `localhost:8087`.
- [ ] React Router está preparado.
- [ ] TanStack Query está preparado.
- [ ] El proxy `/api` funciona.
- [ ] El proxy `/hubs` está configurado con soporte WebSocket.
- [ ] La ruta técnica necesaria para consultar `/health` funciona sin URL hardcodeada en la UI.
- [ ] `httpClient` centraliza configuración y manejo de errores.
- [ ] `endpoints.ts` existe sin inventar endpoints funcionales.
- [ ] `.env.example` existe y no contiene secretos.
- [ ] `features/_template/` sirve como referencia y no contiene una HU real.

### OpenAPI del frontend

- [ ] `pnpm run api:generate` funciona con el backend Development.
- [ ] `src/types/api.generated.ts` se genera.
- [ ] El archivo generado está documentado como no editable manualmente.
- [ ] La generación produce tipos y no sustituye el cliente HTTP manual.
- [ ] No se introdujo Orval.

### Sistema visual

- [ ] `frontend/src/styles/globals.css` existe.
- [ ] Los tokens Fratelli acordados están centralizados.
- [ ] Los valores se documentan como baseline ajustable.
- [ ] Tailwind utiliza la misma fuente visual o una estrategia equivalente.
- [ ] No existe una segunda paleta principal incompatible.

### Componentes y UI Kit

- [ ] Existen Button, Input, Select, Textarea, Checkbox, Badge y Spinner.
- [ ] Existen FormField, Alert y EmptyState.
- [ ] Existen DataTable base, Modal/Dialog y PageHeader.
- [ ] Existe AppShell.
- [ ] Los componentes no dependen de una HU.
- [ ] `/dev/ui-kit` funciona en Development.
- [ ] La UI Kit muestra los componentes y estados acordados.
- [ ] La UI Kit consume realmente `GET /health`.
- [ ] La UI Kit muestra `API disponible` o `API no disponible`.
- [ ] `/dev/ui-kit` no queda disponible públicamente en Production.

### Pruebas y CI

- [ ] Existen los tres proyectos xUnit previstos.
- [ ] Vitest y React Testing Library están configurados.
- [ ] `dotnet test` finaliza con los tests base existentes.
- [ ] `pnpm run lint` finaliza correctamente.
- [ ] `pnpm run build` finaliza correctamente.
- [ ] Los tests frontend base, si se incluyen como gate de CI, son estables.
- [ ] `.github/workflows/ci.yml` ejecuta únicamente las verificaciones mínimas acordadas.
- [ ] CI no depende obligatoriamente de HomeLab, Docker, Testcontainers o Playwright.

### Documentación

- [ ] `frontend/README.md` contiene onboarding operativo.
- [ ] `frontend/docs/manual-de-uso.md` contiene las reglas de desarrollo solicitadas.
- [ ] La documentación backend contiene restore/build/run/PostgreSQL/migrations/OpenAPI/health/tests.
- [ ] El puerto backend vigente se documenta como `5057`.
- [ ] La estrategia OpenAPI híbrida queda documentada sin ambigüedad.
- [ ] La convención de commits vigente queda documentada sin exigir ID de HU.

### Frontera de alcance

- [ ] No se implementó login funcional.
- [ ] No se implementaron endpoints funcionales de negocio para rellenar la API.
- [ ] No se implementó KDS funcional.
- [ ] No se implementaron tablas finales anticipadas de dominios futuros.
- [ ] Ninguna `HU-001`...`HU-031` fue marcada Done como consecuencia de Sprint 0.

### Evidencia factual

- [ ] `docs/sprints/sprint-00.md` refleja únicamente resultados que realmente ocurrieron.
- [ ] Las capturas referenciadas existen realmente.
- [ ] Ninguna validación pendiente aparece falsamente como PASS.
- [ ] La validación en otra máquina aparece con su resultado real o como `PENDIENTE`.

## Gate de salida

El apply/verify posterior MUST tratar este checklist como gate, no como estado ya logrado:

- [ ] repositorio clona correctamente
- [ ] `main`/`develop` y flujo de ramas documentado
- [ ] backend compila
- [ ] backend inicia en `:5057`
- [ ] `/health` responde
- [ ] PostgreSQL conecta
- [ ] `dotnet ef database update` funciona
- [ ] OpenAPI funciona en Development
- [ ] Swagger funciona en Development
- [ ] frontend instala dependencias con `pnpm install --frozen-lockfile`
- [ ] frontend inicia en `:8087`
- [ ] proxy funciona
- [ ] frontend consume `/health`
- [ ] `api:generate` funciona
- [ ] tipos OpenAPI se generan
- [ ] código generado no se edita manualmente
- [ ] `globals.css` existe
- [ ] tokens visuales Fratelli existen
- [ ] componentes mínimos existen
- [ ] `/dev/ui-kit` funciona en Development
- [ ] UI Kit no se expone en Production
- [ ] `frontend/README.md` existe
- [ ] `frontend/docs/manual-de-uso.md` existe
- [ ] lint/build frontend pasan
- [ ] build/test backend pasan
- [ ] CI básico funciona
- [ ] ningún secreto real está en Git
- [ ] ninguna HU fue marcada Done
- [ ] `docs/sprints/sprint-00.md` contiene resultados reales
- [ ] todas las evidencias referenciadas existen
- [ ] validación en segunda máquina tiene resultado real o estado `PENDIENTE`

## Fuera de alcance

- Funcionalidades `HU-001` a `HU-031`.
- Autenticación funcional.
- CRUDs de negocio.
- Inventario, pedidos, KDS, ventas, compras, producción, asistencia, turnos y cierre.
- Reportes funcionales.
- Post-MVP.
- HomeLab como requisito del desarrollo diario.
- Docker obligatorio.
- Microservicios.
- CQRS completo.
- Event sourcing.
- Redis/RabbitMQ/Kubernetes.
- Playwright completo.
- Coverage gate.
- Security scanning avanzado.
- Design system amplio.
- Cliente API frontend generado completo.
- Orval.
- OpenSpec obligatorio por HU.
