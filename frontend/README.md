# Base del frontend

React, TypeScript, Vite, Tailwind, React Router y TanStack Query proporcionan la base del frontend. HU-001 añade el límite compartido de autenticación y las rutas `/login`, `/inicio` y `/403`; las features de negocio siguen sin llamar a `fetch` directamente.

## Inicio rápido

Requiere Node.js `>=20.19.0` y pnpm `11.18.0` (declarado en `package.json`). pnpm es el gestor canónico y `pnpm-lock.yaml` es el único lockfile versionado. Si pnpm no está instalado o activado, ejecute primero `corepack enable`; después, los comandos `pnpm` usarán la versión fijada `pnpm@11.18.0` por `packageManager`.

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

Vite se ejecuta en el puerto `8087` y redirige `/api`, `/hubs` y `/health` al backend. En Development, abra `/dev/ui-kit` para inspeccionar los componentes reutilizables y la consulta real de salud del backend.

## Configuración local

Copie el ejemplo antes de iniciar Vite:

```powershell
Copy-Item .env.example .env.local
```

```bash
cp .env.example .env.local
```

`.env.local` está ignorado por `*.local`; no lo versione. `VITE_APP_NAME`, `VITE_API_BASE_URL` y `VITE_REQUEST_TIMEOUT_MS` son valores públicos expuestos al navegador: no ponga secretos en variables `VITE_*`. `API_PROXY_TARGET` y `OPENAPI_SCHEMA_URL` son valores de tooling para Vite/Node y no se exponen al cliente. El proxy usa `API_PROXY_TARGET` para `/api`, `/health` y `/hubs` (este último conserva WebSocket).

Para `pnpm run api:generate`, el backend debe estar activo en Development y exponer el documento configurado por `OPENAPI_SCHEMA_URL`; el valor de ejemplo usa OpenAPI local. El comando genera y formatea `src/types/api.generated.ts`.

## Comandos de calidad

```bash
pnpm run format
pnpm run format:check
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

El formato se aplica mediante `.prettierrc.mjs` (comillas simples, sin punto y coma, comas finales, dos espacios, LF). Para un contrato de API disponible en Development, ejecute `pnpm run api:generate`; regenera y da formato a `src/types/api.generated.ts`. Ese archivo generado nunca se edita manualmente.

## Navegación y módulos integrados

Las rutas autenticadas viven bajo un único `AuthenticatedLayout`: sidebar en desktop y topbar con drawer en mobile. No hay bottom navigation global. La misma registry define visibilidad, destino y estado activo de Inicio, Pedidos, Cocina, Productos, Inventario, Asistencia, Proveedores, Gastos y Usuarios.

Productos permite lectura a `ADMINISTRADOR`, `ENCARGADO`, `MESERO` y `COCINA`; solo `ADMINISTRADOR` y `ENCARGADO` gestionan. Proveedores permite lectura a `ADMINISTRADOR`, `ENCARGADO`, `COCINA` y `CONTADORA`; sus cards mobile reutilizan la misma consulta que la tabla desktop. Asistencia dirige a `ADMINISTRADOR` y `ENCARGADO` a gestión por `EmployeeId`; los demás roles consultan únicamente `/mi-asistencia`.

## HU-002 — Usuarios y roles

`/usuarios` requiere sesión y el rol exacto `ADMINISTRADOR`. La feature `src/features/users` usa tipos generados, `endpoints.users`, `httpClient` y TanStack Query; sus componentes nunca reciben JWT ni llaman `fetch` directamente. Permite listar, filtrar por búsqueda/rol/estado, paginar y administrar cuentas con roles múltiples, contraseña y ciclo activo/inactivo.

Los roles canónicos son `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA` y `EMPLEADO`. La navegación solo muestra capacidades implementadas cuando la ruta existe y el rol lo permite. Para actualizar el contrato, inicie el backend Development y ejecute `pnpm run api:generate`; nunca edite `src/types/api.generated.ts` manualmente.

## Compatibilidad con npm

Los scripts también pueden invocarse con `npm run <script>`. Para instalar con npm, use `npm install --package-lock=false`; no se crea, versiona ni mantiene `package-lock.json`. No alterne gestores sobre el mismo `node_modules`: al cambiar de gestor, haga una reinstalación limpia con el gestor elegido antes de ejecutar scripts.

## Autenticación HU-001

`AuthProvider` mantiene el usuario, roles, estado de bootstrap y errores recuperables; el JWT pertenece exclusivamente al coordinador de sesión en memoria. No se expone por contexto ni se persiste en storage, cookies de JavaScript, URLs o caché.

Use `authApi` para login, refresh y logout crudos. Las features usan `httpClient` sin argumentos de token: agrega el Bearer actual justo antes del envío y, únicamente ante el primer `401` elegible, comparte un refresh y reintenta una vez. `403` y el resto de errores siguen siendo `HttpError` observables y no refrescan sesión. Los roles exactos son `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`, `CONTADORA` y `EMPLEADO`.

La validación final incluye navegación por teclado y viewports de 360 px, ~403 px, tablet y desktop, además de Login → Inicio → F5, recuperación `401`, denegación de rol y logout recuperable; las capturas reales están vinculadas en la [HU-001](../docs/historias/HU-001-iniciar-cerrar-sesion.md).

Consulte [la arquitectura del proyecto](../docs/10-arquitectura.md) para los límites de componentes, el flujo OpenAPI, las rutas y las prohibiciones de alcance.
