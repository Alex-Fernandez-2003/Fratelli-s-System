# Tareas

- [x] **Tarea 1: Confirmar el punto de partida del change**

- Objetivo:
  Verificar inmediatamente antes de apply que `develop` no haya incorporado una fábrica técnica nueva desde esta auditoría y que todo Sprint 0 siga perteneciendo al mismo change.
- Archivos o áreas probablemente involucradas:
  Raíz del repositorio, ramas Git, `docs/openspec/`, `frontend/`, `backend/`, `.github/`.
- Notas de ejecución:
  Inspeccionar el árbol y diffs recientes. Reutilizar cualquier trabajo válido que haya aparecido; no sobrescribirlo. Crear/actualizar únicamente `prepare-sprint-0-development-foundation`.
- Método de verificación:
  Registrar el commit base y confirmar qué áreas ya existen antes del primer cambio.
- Dependencias:
  Ninguna.

- [x] **Tarea 2: Establecer convenciones y flujo Git [S0-01]**

- Objetivo:
  Dejar explícitos el flujo `main`/`develop`, ramas cortas, commits y reglas de formato.
- Archivos o áreas probablemente involucradas:
  README raíz, `.editorconfig`, ignore rules, documentación Git existente.
- Notas de ejecución:
  Mantener `main` como estable y `develop` como integración. Usar `tipo: descripción breve`. No imponer `feat(HU-xxx):`. Verificar branch protection solo si existen permisos.
- Método de verificación:
  Revisar documentación y configuración; comprobar que las convenciones no contradicen `docs/15-plan-desarrollo.md`.
- Dependencias:
  Tarea 1.

- [x] **Tarea 3: Crear el scaffold backend Clean Architecture [S0-02]**

- Objetivo:
  Materializar la solución y los cuatro proyectos de producción con sus referencias correctas.
- Archivos o áreas probablemente involucradas:
  `backend/RestaurantSystem.slnx`, `backend/src/RestaurantSystem.Domain`, `Application`, `Infrastructure`, `Api`.
- Notas de ejecución:
  Usar .NET 10. Mantener únicamente las capas previstas. No crear módulos funcionales de negocio. Fijar la configuración local del backend en `5057`.
- Método de verificación:
  Inspeccionar project references y ejecutar restore/build.
- Dependencias:
  Tarea 2.

- [x] **Tarea 4: Preparar el runtime técnico mínimo del backend [S0-06, S0-07]**

- Objetivo:
  Obtener una API arrancable con DI, errores base, CORS, health, OpenAPI y Swagger Development.
- Archivos o áreas probablemente involucradas:
  Composition/runtime del proyecto Api, configuración compartida necesaria.
- Notas de ejecución:
  Implementar `GET /health` antes de endpoints de negocio. Habilitar OpenAPI/Swagger solo en Development. Configurar CORS para frontend `:8087`. No añadir endpoints ficticios.
- Método de verificación:
  Ejecutar backend en `:5057`; consultar `/health`, `/openapi/v1.json` y `/swagger`; repetir la verificación de exposición con configuración Production.
- Dependencias:
  Tarea 3.

- [x] **Tarea 5: Preparar SignalR estructural**

- Objetivo:
  Registrar SignalR y dejar preparada la integración futura de `/hubs/kitchen`.
- Archivos o áreas probablemente involucradas:
  Backend Api/runtime y futura infraestructura realtime frontend.
- Notas de ejecución:
  Mapear un hub técnico vacío únicamente si ayuda a verificar el wiring. No agregar eventos ni comportamiento de comandas.
- Método de verificación:
  Backend compila y arranca con la configuración SignalR; revisión confirma ausencia de lógica KDS.
- Dependencias:
  Tarea 4.

- [x] **Tarea 6: Crear el scaffold frontend [S0-08]**

- Objetivo:
  Materializar React + TypeScript + Vite + Tailwind con puerto `8087`.
- Archivos o áreas probablemente involucradas:
  `frontend/`, package manifests/lockfile, Vite, TypeScript, ESLint, Prettier, estilos iniciales.
- Notas de ejecución:
  Conservar únicamente archivos y directorios que tengan contenido real. No crear todas las features futuras.
- Método de verificación:
  Instalar dependencias, ejecutar frontend y confirmar `localhost:8087`; ejecutar lint/build inicial.
- Dependencias:
  Tarea 4.

- [x] **Tarea 7: Configurar router, Query y entorno frontend [S0-09]**

- Objetivo:
  Preparar providers, React Router, TanStack Query y configuración/env.
- Archivos o áreas probablemente involucradas:
  `src/app/`, `src/routes/`, `src/config/env.ts`, `src/lib/query/`, `.env.example`.
- Notas de ejecución:
  No crear rutas de negocio. `.env.example` debe contener solo variables utilizadas y ningún secreto.
- Método de verificación:
  Frontend arranca con providers configurados y build/lint pasan.
- Dependencias:
  Tarea 6.

- [x] **Tarea 8: Implementar la infraestructura HTTP y proxy [S0-10]**

- Objetivo:
  Crear el contrato HTTP reutilizable y la conectividad local con backend.
- Archivos o áreas probablemente involucradas:
  `src/lib/api/`, `vite.config.ts`, configuración/env.
- Notas de ejecución:
  Centralizar métodos, JSON, timeout, headers, errores, ProblemDetails y futura extensión auth. Proxyar `/api`, `/hubs` con WebSocket y resolver `/health` mediante proxy/config central. No hardcodear URLs en componentes.
- Método de verificación:
  Tests unitarios/smoke si son viables; inspección de configuración y prueba manual del proxy.
- Dependencias:
  Tareas 6, 7.

- [x] **Tarea 9: Integrar frontend con GET /health [S0-15 parcial]**

- Objetivo:
  Validar temprano el recorrido frontend `:8087` → proxy/config → backend `:5057` → `/health`.
- Archivos o áreas probablemente involucradas:
  Cliente API, página técnica temporal o UI Kit inicial, estado de conexión.
- Notas de ejecución:
  Mostrar `API disponible` y `API no disponible`. Mantener esta integración independiente de cualquier feature de restaurante.
- Método de verificación:
  Probar con backend encendido y apagado y observar ambos estados.
- Dependencias:
  Tareas 4, 8.

- [x] **Tarea 10: Configurar EF Core y PostgreSQL [S0-03]**

- Objetivo:
  Materializar persistence con EF Core/Npgsql y configuración local segura.
- Archivos o áreas probablemente involucradas:
  Infrastructure, configuración backend, `DbContext`, README backend.
- Notas de ejecución:
  No versionar credenciales. Mantener PostgreSQL local por integrante. Respetar `snake_case` para el esquema físico cuando corresponda.
- Método de verificación:
  Backend construye el `DbContext` con configuración local y puede alcanzar PostgreSQL.
- Dependencias:
  Tarea 3.

- [x] **Tarea 11: Crear y validar migrations técnicas [S0-04]**

- Objetivo:
  Establecer EF migrations como única fuente del esquema físico y comprobar un database update desde cero.
- Archivos o áreas probablemente involucradas:
  Infrastructure migrations, backend documentation.
- Notas de ejecución:
  No crear `schema.sql`. No anticipar tablas funcionales. Documentar el comando EF que realmente funciona con `--project`/`--startup-project` o la forma resultante.
- Método de verificación:
  Aplicar migrations sobre una base local limpia e inspeccionar el resultado; guardar evidencia únicamente después de éxito real.
- Dependencias:
  Tarea 10.

- [x] **Tarea 12: Preparar Identity y JWT como infraestructura [S0-05]**

- Objetivo:
  Configurar Identity, JWT Bearer y autorización base sin implementar HU-001.
- Archivos o áreas probablemente involucradas:
  Infrastructure persistence/identity, Api authentication/authorization/configuration.
- Notas de ejecución:
  No endpoints login/refresh/logout/reset. No UI auth. No access token persistido en storage frontend. Si la infraestructura Identity requiere migration adicional, mantenerla técnica.
- Método de verificación:
  Build/tests; inspección confirma registro de infraestructura y ausencia de flujo funcional de autenticación.
- Dependencias:
  Tareas 10, 11.

- [x] **Tarea 13: Configurar generación de tipos OpenAPI [S0-11]**

- Objetivo:
  Implementar el flujo `OpenAPI → openapi-typescript → api.generated.ts`.
- Archivos o áreas probablemente involucradas:
  `frontend/package.json`, lockfile, `src/types/api.generated.ts`, README/manual frontend.
- Notas de ejecución:
  Generar tipos, no cliente completo. Versionar el resultado. No usar Orval. No editar el archivo generado manualmente.
- Método de verificación:
  Con backend Development activo, ejecutar `pnpm run api:generate`; comprobar salida y que el frontend siga compilando. npm puede invocar el script por compatibilidad.
- Dependencias:
  Tareas 4, 8.

- [x] **Tarea 14: Crear el sistema visual global Fratelli [S0-12]**

- Objetivo:
  Centralizar la baseline visual naranja/negro y evitar estilos divergentes.
- Archivos o áreas probablemente involucradas:
  `src/styles/globals.css`, integración Tailwind, `src/assets/brand/` si existe contenido real.
- Notas de ejecución:
  Incorporar tokens acordados como baseline ajustable. No presentarlos como colores oficiales. No redibujar logo; documentar ubicación futura si falta asset limpio.
- Método de verificación:
  Inspección confirma una única fuente de colores principales; build/lint pasan.
- Dependencias:
  Tarea 6.

- [x] **Tarea 15: Crear componentes UI base [S0-13]**

- Objetivo:
  Materializar la biblioteca mínima de atoms, molecules, organisms y AppShell.
- Archivos o áreas probablemente involucradas:
  `src/components/atoms`, `molecules`, `organisms`, `templates`.
- Notas de ejecución:
  Crear solo los componentes acordados. Mantener props claras, estados útiles, accesibilidad básica y tokens globales. No incluir lógica de HU.
- Método de verificación:
  Renderizar cada componente, revisar estados/accesibilidad básica y ejecutar tests frontend pertinentes.
- Dependencias:
  Tarea 14.

- [x] **Tarea 16: Crear features/\_template**

- Objetivo:
  Dejar un ejemplo práctico de cómo estructurar futuras features.
- Archivos o áreas probablemente involucradas:
  `src/features/_template/`.
- Notas de ejecución:
  Mostrar únicamente patrones de API/component/hooks/types/export cuando aporten valor. No inventar endpoints reales ni dominio ficticio.
- Método de verificación:
  Revisión del template contra el manual; build/lint sin imports rotos.
- Dependencias:
  Tareas 8, 15.

- [x] **Tarea 17: Completar /dev/ui-kit [S0-14, S0-15]**

- Objetivo:
  Crear la página técnica Development que documenta visualmente la fábrica y conserva la prueba frontend/backend.
- Archivos o áreas probablemente involucradas:
  Pages/routes Development, componentes base, estilos, health integration.
- Notas de ejecución:
  Mostrar paleta, tipografía, todos los componentes, estados y `Conexión con backend`. Registrar la ruta solo para Development.
- Método de verificación:
  Abrir `/dev/ui-kit` en Development; verificar todos los componentes y conexión. Generar/servir configuración Production y confirmar que la ruta no queda disponible.
- Dependencias:
  Tareas 9, 14, 15.

- [x] **Tarea 18: Preparar infraestructura de tests [S0-17]**

- Objetivo:
  Crear los tres proyectos xUnit y dejar Vitest/React Testing Library operativos con smoke tests técnicos útiles.
- Archivos o áreas probablemente involucradas:
  `backend/tests/`, frontend test configuration/tests.
- Notas de ejecución:
  No crear lógica ficticia para obtener cobertura. Mantener pruebas pequeñas y estables. No introducir Playwright como requisito.
- Método de verificación:
  Ejecutar `dotnet test` y los tests frontend configurados; registrar resultados reales.
- Dependencias:
  Tareas 4, 8, 11, 15, 17.

- [x] **Tarea 19: Escribir los manuales operativos [S0-16]**

- Objetivo:
  Hacer posible onboarding sin conocimiento oral.
- Archivos o áreas probablemente involucradas:
  README raíz, `backend/README.md`, `frontend/README.md`, `frontend/docs/manual-de-uso.md`.
- Notas de ejecución:
  Documentar comandos reales del scaffold, no comandos supuestos. Separar el inicio rápido general de los detalles de backend/frontend para evitar duplicación.
- Método de verificación:
  Seguir los manuales desde un estado limpio y verificar que contienen todos los temas exigidos por la spec.
- Dependencias:
  Tareas 11, 13, 16, 17, 18.

- [x] **Tarea 20: Alinear documentación técnica contradictoria**

- Objetivo:
  Eliminar instrucciones vigentes incompatibles con la fábrica implementada.
- Archivos o áreas probablemente involucradas:
  `docs/10-arquitectura.md`, documentación OpenAPI relacionada, `docs/historias/README.md`, ADR-002 según política ADR, diagramas afectados.
- Notas de ejecución:
  Alinear `5057`, estrategia OpenAPI types-only y commit convention. Preservar historia de ADRs; no reescribir silenciosamente una decisión aceptada si la práctica del repositorio requiere supersesión.
- Método de verificación:
  Buscar referencias a `5087`, cliente OpenAPI completo/ubicación antigua y commits `feat(HU-...)`; clasificar cada aparición como histórica o corregirla si sigue presentada como normativa.
- Dependencias:
  Tareas 13, 19.

- [ ] **Tarea 21: Implementar CI mínimo [S0-18]**

- Objetivo:
  Automatizar verificaciones estables sin convertir CI en un proyecto paralelo.
- Archivos o áreas probablemente involucradas:
  `.github/workflows/ci.yml`.
- Notas de ejecución:
  Backend: restore/build/test. Frontend: `pnpm install --frozen-lockfile`, formato, typecheck, lint, build y tests únicamente si están estables. `pnpm-lock.yaml` es canónico; npm conserva compatibilidad de scripts sin `package-lock.json`. No añadir DB service container, deploy, HomeLab, Testcontainers, Playwright completo, coverage gate ni scanning avanzado.
- Método de verificación:
  Ejecutar/observar el workflow real y registrar su resultado. Si falla, corregir únicamente causas pertenecientes al scope de Sprint 0.
- Dependencias:
  Tareas 18, 19.

- [ ] **Tarea 22: Ejecutar la validación reproducible local**

- Objetivo:
  Verificar el gate completo desde una instalación limpia o suficientemente equivalente.
- Archivos o áreas probablemente involucradas:
  Repositorio completo, documentación, PostgreSQL local.
- Notas de ejecución:
  Ejecutar clone/restore/install/config DB/database update/backend/frontend/health/api generation/UI Kit/lint/build/tests. No convertir resultados esperados en evidencia antes de ejecutarlos.
- Método de verificación:
  Checklist del gate con comandos, resultados y problemas reales.
- Dependencias:
  Tareas 19, 20, 21.

- [ ] **Tarea 23: Validar la fábrica en otra máquina**

- Objetivo:
  Demostrar que el scaffold no depende de la computadora o conocimiento implícito del autor.
- Archivos o áreas probablemente involucradas:
  Documentación de onboarding y repositorio integrado.
- Notas de ejecución:
  Otro integrante debe intentar clone → DB → migrations → backend → frontend → health → UI Kit. No compartir secretos. Si no puede realizarse durante Sprint 0, registrar explícitamente `PENDIENTE`.
- Método de verificación:
  Resultado factual de la segunda instalación o registro explícito de pendiente.
- Dependencias:
  Tarea 22.

- [x] **Tarea 24: Documentar resultados y evidencias reales [S0-19]**

- Objetivo:
  Cerrar documentalmente Sprint 0 sin fabricar evidencia.
- Archivos o áreas probablemente involucradas:
  `docs/sprints/sprint-00.md`, `docs/capturas/`.
- Notas de ejecución:
  Registrar objetivo, infraestructura realmente creada, tareas ejecutadas, configuración, verificaciones, problemas, decisiones, resultados, evidencias y estado. Añadir únicamente capturas que existan. No copiar las secciones completas de `docs/15-plan-desarrollo.md`.
- Método de verificación:
  Cada PASS o evidencia debe poder rastrearse a una ejecución/archivo real; todo lo no ejecutado queda `PENDIENTE`.
- Dependencias:
  Tareas 22, 23.

- [x] **Tarea 25: Ejecutar el gate final de frontera funcional**

- Objetivo:
  Confirmar que Sprint 0 terminó como fábrica y no como implementación anticipada del producto.
- Archivos o áreas probablemente involucradas:
  Diff completo del change, backlog/HUs, migration, API routes, frontend routes/features.
- Notas de ejecución:
  Revisar específicamente auth funcional, CRUDs, seeds, tablas de negocio, KDS, páginas y endpoints. Eliminar o separar cualquier comportamiento que pertenezca a HU-001...HU-031.
- Método de verificación:
  Revisión de diff + checklist de out-of-scope + confirmación de que ninguna HU fue marcada Done.
- Dependencias:
  Tarea 24.

## Entrega de implementación

El agente de implementación debe consumir este briefing como definición previa del change y seguir estas reglas:

1. Trabajar desde la baseline actualizada de `develop`, después de repetir el precheck de Tarea 1.
2. Mantener un único change OpenSpec:
   `docs/openspec/changes/prepare-sprint-0-development-foundation/`.
3. No volver a decidir la arquitectura principal salvo que el scaffold real demuestre una incompatibilidad concreta.
4. Usar como decisiones cerradas:
   - backend `5057`;
   - frontend `8087`;
   - Clean Architecture práctica;
   - PostgreSQL + EF Core + Npgsql;
   - migrations como fuente física;
   - React/Vite/TypeScript/Tailwind;
   - Atomic Design + features;
   - cliente HTTP manual;
   - OpenAPI solo para tipos;
   - `openapi-typescript`;
   - `api.generated.ts` versionado;
   - no Orval;
   - UI Kit Development-only;
   - PostgreSQL local;
   - CI mínimo;
   - un solo Sprint 0 OpenSpec change.
5. Priorizar integración temprana:
   - Git/configuración
   - backend mínimo
   - `/health`
   - frontend mínimo
   - proxy/httpClient
   - frontend → `/health`
   - PostgreSQL/migrations
   - OpenAPI/tipos
   - sistema visual/componentes/UI Kit
   - tests
   - manuales
   - CI
   - reproducibilidad
6. No crear endpoints, tablas, componentes o seeds funcionales solamente para “demostrar” que la arquitectura está lista.
7. No marcar una HU como completada por haber preparado su infraestructura.
8. Cuando un comando dependa del scaffold —especialmente EF— ejecutar primero y documentar después el comando comprobado.
9. Cuando aparezca una contradicción documental, usar la baseline más reciente identificada en este briefing y actualizar únicamente la documentación afectada.
10. No inventar evidencia. `sprint-00.md`, capturas, PASS y validación en otra máquina se registran solo después de ocurrir.
11. Si la segunda máquina no puede validarse, cerrar esa evidencia como `PENDIENTE`; no bloquear ficticiamente ni afirmar éxito.
12. Si una incompatibilidad real obliga a cambiar puerto, estrategia de OpenAPI, estructura arquitectónica, modelo de persistencia o frontera de HUs, detener esa parte y actualizar primero los artefactos OpenSpec.
13. Tras apply corresponde verify contra la spec y el gate; después sync/archive según el flujo Gentle AI/OpenSpec. OpenSpec permanece como fuente canónica del change. :contentReference[oaicite:11]{index=11} :contentReference[oaicite:12]{index=12}

## Pronóstico de carga de revisión

- LoC modificadas estimadas:
  Aproximadamente 2.500–5.000 líneas de diff total, incluyendo scaffolds, project files, lockfile, migration inicial, configuración, componentes, documentación y posibles archivos generados. La cantidad de código manual será menor que el diff bruto porque lockfiles/scaffold/generados pueden representar una fracción importante.
- Riesgo de superar el umbral de revisión de 400 LoC:
  Alta. Un Sprint 0 completo de esta naturaleza superará ampliamente el umbral si se presenta como un único PR.
- Recomendación:
  PRs encadenadas
- División sugerida si se encadena:
  - PR 1: convenciones/repositorio + backend scaffold + `/health` + OpenAPI/error/CORS/SignalR base.
  - PR 2: frontend scaffold + router/query + HTTP/proxy + integración temprana `/health`.
  - PR 3: PostgreSQL/EF + migrations + Identity/JWT estructural + tests backend relacionados.
  - PR 4: OpenAPI types + sistema visual + componentes + `features/_template` + UI Kit.
  - PR 5: tests restantes + manuales + alineación documental + CI.
  - PR 6: ajustes derivados de validación reproducible, evidencia factual y cierre documental de Sprint 0.
    Cada PR debe mantener `develop` compilable/usable según el estado alcanzado y evitar separar cambios de forma que el repositorio quede intencionalmente roto entre PRs.
