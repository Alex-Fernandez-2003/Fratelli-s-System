# Manual de desarrollo del frontend

Este frontend es una base reutilizable de Sprint 0. Intencionalmente no es una implementación de producto: no agregue rutas de negocio, APIs de negocio, almacenamiento o flujos de autenticación, cargas de archivos ni llamadas directas a `fetch`.

## Ruta rápida

1. Instale con `pnpm install --frozen-lockfile` e inicie Vite con `pnpm run dev`.
2. Inspeccione el catálogo disponible solo en Development en `/dev/ui-kit`.
3. Antes de proponer un cambio, ubíquelo en el nivel correcto de Atomic Design y ejecute los comandos de calidad.

## Configuración de entorno y proxy

Cree la configuración privada local a partir del ejemplo:

```powershell
Copy-Item .env.example .env.local
```

```bash
cp .env.example .env.local
```

`.env.local` ya está ignorado por `*.local`; no cree ni versione configuraciones privadas. `VITE_APP_NAME`, `VITE_API_BASE_URL` y `VITE_REQUEST_TIMEOUT_MS` son públicos y llegan al navegador, por lo que nunca deben contener secretos. `API_PROXY_TARGET` configura solo el proxy de Vite y `OPENAPI_SCHEMA_URL` solo la generación de tipos en Node. El proxy Development reenvía `/api`, `/health` y `/hubs` al target; `/hubs` conserva WebSocket para SignalR.

## Gestor de paquetes

pnpm es el gestor canónico del frontend: use `pnpm-lock.yaml` y las órdenes `pnpm` para instalación, CI y trabajo cotidiano. La instalación oficial reproducible es `pnpm install --frozen-lockfile`. Si pnpm no está instalado o activado, ejecute `corepack enable`; después, las órdenes `pnpm` usarán la versión fijada `pnpm@11.18.0` por `packageManager`.

Los scripts son compatibles con npm mediante `npm run <script>`. Si necesita instalar con npm, use `npm install --package-lock=false`; el repositorio no usa ni mantiene `package-lock.json`. No mezcle npm y pnpm sobre el mismo `node_modules`: al cambiar de gestor, haga una reinstalación limpia con el gestor elegido antes de continuar.

## Estructura del proyecto

| Área                         | Responsabilidad                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/components/atoms`       | Controles primitivos y bloques visuales básicos.                                                                  |
| `src/components/molecules`   | Composiciones pequeñas como campos, retroalimentación, navegación y selección local de archivos.                  |
| `src/components/organisms`   | Secciones estructuradas de interfaz: tabla, modal y encabezado de página.                                         |
| `src/components/templates`   | Solo composición visual de diseño: `AppShell` y `AuthLayout`.                                                     |
| `src/features`               | Futuros slices verticales de producto; copie `_template` en vez de colocar código de negocio en la UI compartida. |
| `src/lib/api`                | El único límite HTTP: `httpClient` más rutas de endpoint con nombre.                                              |
| `src/lib/query`              | Provider de TanStack Query y futuros hooks de estado de servidor.                                                 |
| `src/types/api.generated.ts` | Salida de OpenAPI; generada y formateada, nunca editada manualmente.                                              |

Las importaciones usan el barrel de cada capa. Mantenga las dependencias en una sola dirección: atoms → molecules → organisms → templates. Un componente compartido se mantiene neutral; los nombres de producto, literales de negocio y flujos de trabajo pertenecen a una feature.

## Inventario de componentes

El catálogo es una base neutral y reutilizable. A continuación se describen de forma factual sus componentes y contratos actuales; no implican ningún flujo de producto.

### Atoms

| Componente                                                  | Props o contrato principal                                                                                                                                                                                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                                                    | Props nativas de botón; variante `primary`, `secondary`, `outline`, `ghost` o `danger`; tamaño `sm`, `md` o `lg`; `leftIcon`/`rightIcon`; `loading` deshabilita el botón y establece `aria-busy`. Se mantienen `startIcon`/`endIcon` heredados. |
| `IconButton`, `LinkButton`                                  | `IconButton` requiere un `label` accesible; `LinkButton` recibe props nativas de ancla y variantes de Button.                                                                                                                                   |
| `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Label` | Props de controles nativos con clases compartidas basadas en tokens.                                                                                                                                                                            |
| `Badge`, `StatusDot`, `Spinner`, `ProgressBar`, `Skeleton`  | Primitivas neutrales de estado y carga; el progreso se limita de 0 a 100 y las primitivas de carga exponen etiquetas de estado.                                                                                                                 |
| `Divider`, `Avatar`, `Surface`, `Card`                      | Primitivas de presentación; Avatar usa `name` como nombre accesible.                                                                                                                                                                            |

### Molecules

| Componente                                         | Props o contrato principal                                                                                                                                                                                                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FormHint`, `FormError`, `FormField`               | `FormField` acepta un control directo, etiqueta, ayuda/error opcional y `required`; conserva el ID de control proporcionado, asocia su etiqueta con ese ID y combina de forma segura las descripciones existentes, de ayuda y error.                                             |
| `SearchInput`, `PasswordInput`, `PasswordStrength` | Props nativas de búsqueda/contraseña; la visibilidad de la contraseña es solo estado local de la UI; la fortaleza muestra una puntuación local.                                                                                                                                  |
| `Alert`, `EmptyState`, `StatCard`                  | Composiciones neutrales de retroalimentación y resumen.                                                                                                                                                                                                                          |
| `Breadcrumbs`, `Pagination`, `Stepper`             | Primitivas de navegación con estado explícito de elemento/página/paso.                                                                                                                                                                                                           |
| `FileDropzone`                                     | Solo selección local: acepta `accept`, `multiple`, `maxSize` opcional en bytes y `onFiles`. Valida archivos arrastrados y elegidos, lista las selecciones aceptadas, permite quitarlas, informa archivos rechazados y solo devuelve selecciones aceptadas. Nunca carga archivos. |

### Organisms

| Componente     | Props o contrato principal                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `DataTable<T>` | Columnas genéricas, filas, ID de fila y renderizador de acciones opcional; proporciona estados de carga, error y vacío.                |
| `Modal`        | Requiere `open`, título y callback de cierre; etiqueta su diálogo, enfoca su control de cierre y cierra con Escape o clic en el fondo. |
| `PageHeader`   | Título con descripción opcional y espacio para acciones.                                                                               |

### Templates

| Componente   | Props o contrato principal                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppShell`   | Espacios visuales responsivos para encabezado, navegación, barra lateral, contenido principal y pie.                                                                    |
| `AuthLayout` | Diseño de autenticación solo visual con título/contenido obligatorios y espacios neutrales opcionales `branding` e `illustration`; no almacena estado de autenticación. |

## Formato y verificación

Prettier se configura en `.prettierrc.mjs`: comillas simples, sin punto y coma, comas finales, dos espacios, LF, UTF-8, salto de línea final y objetivo de 100 columnas. `.editorconfig` sigue siendo la fuente para los finales de línea de todo el repositorio y conserva la sangría de cuatro espacios de C#.

```bash
pnpm run format        # reescribe el código fuente de frontend compatible
pnpm run format:check  # verifica el formato sin escribir
pnpm run typecheck     # referencias de proyectos TypeScript
pnpm run lint          # ESLint
pnpm test              # Vitest + Testing Library
pnpm run build         # typecheck y compilación de producción de Vite
```

CI ejecuta la comprobación de formato, comprobación de tipos, linting, build y tests. No omita estos scripts con configuraciones puntuales del formateador.

## Límite de API y tutorial de OpenAPI

1. Agregue o cambie un endpoint backend fuera de esta tarea de base.
2. Inicie el backend en Development para que el documento de `OPENAPI_SCHEMA_URL` esté disponible.
3. Desde `frontend`, ejecute `pnpm run api:generate`.
4. El comando escribe `src/types/api.generated.ts` y le aplica formato inmediatamente.
5. No edite manualmente los tipos generados. Agregue rutas con nombre a `src/lib/api/endpoints.ts`, luego escriba una función de API o hook en el nivel de feature usando `httpClient` y TanStack Query.

`httpClient` normaliza ProblemDetails, incluye credenciales y centraliza el comportamiento de timeout. Los componentes y páginas no deben llamar a `fetch` directamente. La tarjeta de salud del UI Kit de Development es el único fixture de integración: llama intencionalmente a la ruta real de salud mediante `httpClient` a través del proxy; los demás ejemplos del catálogo usan fixtures locales.

## Tutorial del UI Kit

`/dev/ui-kit` existe solo en Development. Agrupa el catálogo en Fundamentos, Acciones, Retroalimentación, Formularios, Navegación, Datos, Superposiciones, Diseño e Integración. Revise allí un nuevo componente neutral antes de consumirlo desde una feature. Su suite de tests cubre las variantes/iconos/carga de Button, relaciones de FormField, PasswordInput, validación/eliminación de FileDropzone, Pagination, carga/error/acciones de DataTable, Modal y el estado de salud/catálogo.

## Prohibiciones

- No cree rutas de producto ni fixtures de datos de negocio en el catálogo.
- No agregue paquetes de iconos solo para controles compartidos.
- No persista estado de autenticación ni implemente el comportamiento de inicio de sesión en `AuthLayout`.
- No agregue transporte de carga a `FileDropzone`.
- No edite manualmente la salida generada de OpenAPI.
- No codifique datos de negocio, valores de paleta fuera de la fuente de tokens ni llamadas de red directas en componentes.
