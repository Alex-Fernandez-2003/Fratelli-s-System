# Progreso de aplicación

## Estado consumido

El estado/token nativo y reciente del padre `sha256:43ba8ab720479c94e97a261b8c4c6b52c8aee3322f0198d6839c58dd26287415` autorizó la aplicación. El contexto de edición fue local al repositorio en `C:\dev\Fratelli-s-System`; no hubo advertencias de contexto de acción. Ruta de entrega: excepción explícita de tamaño local; no se realizó PR, commit, merge, push ni reset.

## Tareas de implementación completadas

Checkboxes de tareas persistidos: 1–9 y 13–20. El trabajo incluye el scaffold de Clean Architecture, runtime/SignalR backend, integración de base/providers/HTTP/proxy/health frontend, generación de tipos OpenAPI, tokens visuales, componentes compartidos, plantilla de feature, UI Kit, tests, documentación operativa y alineación documental.

## Archivos modificados

`.editorconfig`, `.gitignore`, `.github/workflows/ci.yml`, documentación raíz/backend/frontend, solución/proyectos/migration/runtime backend, aplicación/configuración/tests frontend, `docs/10-arquitectura.md`, `docs/historias/README.md` y `docs/sprints/sprint-00.md`.

## Evidencia de verificación

- `dotnet build backend/RestaurantSystem.slnx`: pasó.
- `dotnet test backend/RestaurantSystem.slnx`: pasó (tres tests de plantilla xUnit).
- API de Development: `/health` devolvió `200 Healthy`; OpenAPI y Swagger respondieron.
- API de Production: `/openapi/v1.json` y `/swagger` devolvieron `404`.
- `npm run api:generate`, `npm run lint`, `npm test` y `npm run build`: pasaron.

## Desviaciones y tareas restantes

Sin desviación arquitectónica. El trabajo inicial no tenía PostgreSQL local accesible; esta reanudación encontró un servicio PostgreSQL en ejecución, pero no un secreto de conexión local configurado de forma segura. La conectividad y `dotnet ef database update` en una base de datos limpia siguen sin verificar, por lo que las tareas 10–12 permanecen sin marcar pese a que su código/migration estructural está presente. CI se creó pero no se observó remotamente, y la validación de reproducibilidad/en segunda máquina sigue pendiente.

Líneas de tareas restantes sin marcar:

- [ ] **Tarea 10: Configurar EF Core y PostgreSQL [S0-03]**
- [ ] **Tarea 11: Crear y validar migrations técnicas [S0-04]**
- [ ] **Tarea 12: Preparar Identity y JWT como infraestructura [S0-05]**
- [ ] **Tarea 21: Implementar CI mínimo [S0-18]**
- [ ] **Tarea 22: Ejecutar la validación reproducible local**
- [ ] **Tarea 23: Validar la fábrica en otra máquina**
- [ ] **Tarea 24: Documentar resultados y evidencias reales [S0-19]**
- [ ] **Tarea 25: Ejecutar el gate final de frontera funcional**

## Límite de carga de trabajo

El mantenedor aprobó una excepción de tamaño local. Esta es una única ejecución de implementación local sin commit; no se creó un límite de PR.

## Auditoría de reanudación

### Estado consumido

El padre confirmó que la reanudación/adquisición nativa reciente es autoritativa: proposal/spec/design/tasks están completos, la aplicación está lista y el `spec.md` heredado es el único artefacto de spec válido. La raíz de edición local al repositorio sigue siendo `C:\dev\Fratelli-s-System`; no se proporcionaron advertencias de contexto de acción. La ruta de entrega sigue siendo la excepción de tamaño local previamente aprobada. No ocurrió ningún reset/clean/restore de Git, eliminación, push, merge, commit, PR ni cambio de rama.

### Cambios de reanudación

- Se corrigieron la documentación de CI y del backend para usar la ruta real de la solución `backend/RestaurantSystem.slnx`.
- Se eliminaron los valores de respaldo utilizables y versionados para la cadena de conexión y JWT. `ConnectionStrings__RestaurantSystem` y `Jwt__Key` ahora son configuración local obligatoria del entorno; la factoría de diseño de EF falla de forma segura cuando no se proporciona una cadena de conexión.
- Se reformateó el flujo de trabajo de CI sin ampliar su alcance de restore/build/test del backend ni de install/lint/build/test del frontend.
- Se actualizó `docs/sprints/sprint-00.md` con los resultados factuales de esta reanudación y la evidencia pendiente.

### Comandos ejecutados

| Comando | Resultado |
| --- | --- |
| `dotnet build backend/RestaurantSystem.slnx` | PASS — 0 advertencias, 0 errores |
| `dotnet test backend/RestaurantSystem.slnx` | PASS — 3 pruebas |
| API de Development con configuración efímera solo de entorno; `curl http://localhost:5057/health`, `/openapi/v1.json`, `/swagger`; `npm --prefix frontend run api:generate` | PASS — `Healthy`, OpenAPI 200, redirección de Swagger, generación de tipos correcta |
| API de Production con configuración efímera solo de entorno; curl a OpenAPI/Swagger | PASS — ambos 404 |
| `npm --prefix frontend run lint && npm --prefix frontend test && npm --prefix frontend run build` | PASS — 1 prueba de Vitest, compilación de producción correcta |
| API de Development + Vite; `curl http://localhost:8087/health` y `/dev/ui-kit` | PASS — `Healthy` mediante proxy; interfaz base de UI Kit HTTP 200 |
| `pg_isready` e inspección del servicio de Windows | El servicio PostgreSQL 18 está en ejecución y acepta conexiones en `:5432` |
| `dotnet ef migrations list --project src/RestaurantSystem.Infrastructure --startup-project src/RestaurantSystem.Api --no-build` sin configuración local | Fallo seguro esperado — requiere `ConnectionStrings__RestaurantSystem`; no se intentó acceder a la base de datos |

### Evidencia de base de datos, CI y reproducibilidad

No se configuró ningún secreto `ConnectionStrings__RestaurantSystem` en el entorno del proceso, por lo que no se intentó un `dotnet ef database update` real. La disponibilidad de PostgreSQL por sí sola no verifica la base de datos. Las tareas 10–12 permanecen sin marcar a la espera de una conexión real configurada de forma segura y evidencia de migrations sobre una base de datos limpia. El flujo de trabajo de CI está presente y alineado localmente con la ruta de la solución, pero no se observó ninguna ejecución remota de GitHub Actions; la tarea 21 permanece sin marcar. El gate local completo de instalación limpia, la validación en otra máquina y sus tareas finales de documentación/gate también permanecen sin marcar.

### Conciliación de persistencia de tareas

No se completó ninguna tarea de implementación nueva en esta reanudación, por lo que no se modificó ningún checkbox. Se volvió a leer el artefacto persistido de tareas: las tareas 10–12 y 21–25 permanecen visiblemente sin marcar.

### Protección de alcance

El análisis de migrations encontró tablas solo de Identity y ningún `schema.sql`; la revisión de rutas/código fuente no encontró endpoint API de negocio, flujo de autenticación, feature de producto frontend ni persistencia de tokens. Este es un hallazgo de revisión, no la finalización del gate final; la tarea 25 permanece sin marcar hasta completar sus dependencias.

## Reanudación de validación de PostgreSQL

### Estado consumido

El estado nativo reciente del padre autorizó el change existente `prepare-sprint-0-development-foundation` como listo para apply en la raíz local del repositorio `C:\dev\Fratelli-s-System`. Se respetaron las raíces de edición permitidas. La ruta de entrega mantuvo la excepción explícita de tamaño local. El bloqueo nativo anterior sobre la falta de specs de dominio fue reemplazado por el estado reciente proporcionado para esta reanudación. No se realizó ninguna operación destructiva de Git, cambio de rama, commit, push, merge ni acción de PR.

### Tareas completadas y checkboxes persistidos

- Tarea 10 — `Configurar EF Core y PostgreSQL [S0-03]`: marcada después de que ASP.NET Core resolviera correctamente `ConnectionStrings:RestaurantSystem`, no vacío, desde User Secrets locales sin mostrar el valor, y PostgreSQL aceptara la configuración real.
- Tarea 11 — `Crear y validar migrations técnicas [S0-04]`: marcada después de que el comando EF documentado informara que la base de datos configurada estaba actualizada y aplicara `InitialIdentity` a una base de datos temporal aislada. La base de datos temporal se eliminó después de la validación.
- Tarea 12 — `Preparar Identity y JWT como infraestructura [S0-05]`: marcada después de build/test de la solución, la migration solo de Identity y la revisión de la configuración de runtime. No existe login, emisión de tokens, refresh, logout, reset ni interfaz de autenticación.
- Tarea 24 — `Documentar resultados y evidencias reales [S0-19]`: marcada después de registrar resultados factuales y elementos pendientes explícitos en `docs/sprints/sprint-00.md`.
- Tarea 25 — `Ejecutar el gate final de frontera funcional`: marcada después de revisar rutas, código fuente frontend, migrations y archivos de esquema: no se encontró ruta/tabla/seed de negocio, comportamiento KDS, flujo funcional de autenticación ni almacenamiento persistente de tokens en el navegador.

Se volvió a leer el `tasks.md` persistido después de las actualizaciones. Las tareas 10, 11, 12, 24 y 25 están visiblemente como `- [x]`.

### Comandos y evidencia factual

| Comando o validación | Resultado |
| --- | --- |
| Comprobación segura de presencia de la clave de User Secrets | PASS — `ConnectionStrings:RestaurantSystem` existe y no está vacío; no se mostró ningún valor. |
| `dotnet ef database update --project src/RestaurantSystem.Infrastructure --startup-project src/RestaurantSystem.Api --no-build` | PASS — la base de datos configurada ya estaba actualizada. |
| Base de datos PostgreSQL temporal aislada + el mismo comando EF | PASS — se aplicó `20260823162948_InitialIdentity`; la base de datos temporal se eliminó. |
| `dotnet restore backend/RestaurantSystem.slnx` | PASS |
| `dotnet build backend/RestaurantSystem.slnx --no-restore` | PASS — 0 advertencias, 0 errores |
| `dotnet test backend/RestaurantSystem.slnx --no-build` | PASS — 3 pruebas |
| API de Development con User Secrets para la cadena de conexión, más health/OpenAPI/Swagger | PASS — health `Healthy`, OpenAPI 200, redirección de Swagger. |
| `npm --prefix frontend run api:generate` | PASS |
| `npm --prefix frontend run lint`, `build`, `test` | PASS — 1 prueba frontend |
| Proxy Vite de Development para `/health` y `/dev/ui-kit` | PASS — health `Healthy`; UI Kit HTTP 200 |
| Sonda OpenAPI/Swagger de Production | PASS — ambos endpoints devolvieron 404 |
| `npm --prefix frontend ci` | BLOQUEADO localmente — Windows `EPERM` al desvincular un binding nativo bloqueado de Rolldown. `npm install` restauró las dependencias; los posteriores lint/build/test pasaron. |

### Archivos modificados en esta reanudación

- `openspec/changes/prepare-sprint-0-development-foundation/tasks.md`
- `openspec/changes/prepare-sprint-0-development-foundation/apply-progress.md`
- `docs/sprints/sprint-00.md`

### Desviaciones, trabajo restante y límite de carga

No se realizó ninguna desviación de diseño. El host normal de desarrollo lee la cadena de conexión desde User Secrets; Production se validó con una configuración de proceso efímera y no versionada porque User Secrets solo está disponible en Development. No se escribió ni mostró ningún valor secreto.

Líneas de tareas de implementación restantes sin marcar:

- [ ] **Tarea 21: Implementar CI mínimo [S0-18]**
- [ ] **Tarea 22: Ejecutar la validación reproducible local**
- [ ] **Tarea 23: Validar la fábrica en otra máquina**

La tarea 21 permanece sin marcar porque el flujo de trabajo no se ha observado remotamente. El bloqueo histórico de `npm ci` por un archivo de Windows no impide la validación posterior de pnpm, pero no sustituye una ejecución remota. La tarea 22 permanece sin marcar porque no se usó un clone limpio independiente; la tarea 23 sigue pendiente para otra máquina. La excepción de tamaño local sigue siendo el límite de carga; no se creó ningún límite de PR.

## Migración documental a pnpm

pnpm y `frontend/pnpm-lock.yaml` son ahora los canónicos para instalación y CI. La validación factual posterior a la importación del lockfile fue `pnpm --prefix frontend install --frozen-lockfile`, con resultado PASS. Los comandos `npm --prefix frontend run ...`, `npm --prefix frontend ci` y `npm install` que aparecen en la evidencia anterior se conservan como registro histórico: el último falló por `EPERM` de Rolldown en Windows. npm conserva compatibilidad para invocar scripts, pero no se crea, versiona ni mantiene `package-lock.json`; no se deben mezclar gestores sobre el mismo `node_modules`.

La gama explícita de `@tanstack/react-query` es `^5.101.4`, en lugar de `^5.102.1`, porque la resolución de `5.102.1` no cumplía la política de edad mínima de publicación. La versión `5.101.4` fue publicada el 2026-07-21 y su rango permite una resolución transitiva permitida de `@tanstack/query-core`.

## Limpieza final de integración

El árbol físico de OpenSpec se movió, sin copiarse, desde la raíz del repositorio a la ubicación canónica `docs/openspec/`. El runtime instalado de Windows no admite configuración de raíz de documentación, por lo que la compatibilidad local la proporciona una unión de Windows `openspec` ignorada en la raíz que apunta a `docs\\openspec`; no es un segundo árbol de artefactos y no debe incluirse en un commit.

## Cierre documental final

Sprint 0 está **COMPLETADO (25/25)** como fundación técnica únicamente; no incluye HUs ni alcance Post-MVP.

- **Tarea 21:** resuelta como **No aplica** por decisión de alcance aprobada. GitHub Actions/CI remoto no forma parte del flujo adoptado, por lo que no es una validación pendiente; no se registran ejecuciones, IDs, URLs ni resultados remotos.
- **Tarea 22:** completada correctamente según confirmación explícita del equipo de clone local limpio y checklist, sin agregar detalles ni secretos.
- **Tarea 23:** completada correctamente según confirmación explícita del equipo de prueba en otra máquina, sin agregar identidad, fecha, dispositivo ni incidencias no confirmadas.
- **Gate final:** **PASS**. La revisión de alcance confirma una base técnica sin HUs, funcionalidades de producto ni trabajo Post-MVP; la CI remota es N/A por el alcance adoptado.
