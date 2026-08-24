# Base del frontend

React, TypeScript, Vite, Tailwind, React Router y TanStack Query proporcionan la base del frontend de Sprint 0. No expone rutas de producto, comportamiento de autenticación, almacenamiento, carga de archivos ni llamadas directas de negocio con `fetch`.

## Inicio rápido

Requiere Node.js `>=20.19.0` y pnpm `11.18.0` (declarado en `package.json`). pnpm es el gestor canónico y `pnpm-lock.yaml` es el único lockfile versionado. Si pnpm no está instalado o activado, ejecute primero `corepack enable`; después, los comandos `pnpm` usarán la versión fijada `pnpm@11.18.0` por `packageManager`.

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

Vite se ejecuta en el puerto `8087` y redirige `/api`, `/hubs` y `/health` al backend en `5057`. En Development, abra `/dev/ui-kit` para inspeccionar los componentes reutilizables y la consulta real de salud del backend.

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

## Compatibilidad con npm

Los scripts también pueden invocarse con `npm run <script>`. Para instalar con npm, use `npm install --package-lock=false`; no se crea, versiona ni mantiene `package-lock.json`. No alterne gestores sobre el mismo `node_modules`: al cambiar de gestor, haga una reinstalación limpia con el gestor elegido antes de ejecutar scripts.

Consulte [el manual de desarrollo](docs/manual-de-uso.md) para conocer los límites de los componentes, el flujo de OpenAPI y las prohibiciones de alcance.
