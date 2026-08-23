# ADR-002 — Frontend Atomic Design + Features + OpenAPI

## Estado
Aceptado.

## Contexto
Varios integrantes trabajarán principalmente sobre frontend. Se necesita reducir duplicación y evitar que cada feature configure por separado rutas, API y componentes.

## Decisión
Utilizar React + TypeScript + Vite + Tailwind, Atomic Design para componentes globales y `src/features/` para funcionalidad de negocio. El contrato backend se consumirá mediante cliente generado desde OpenAPI.

## Consecuencias
- trabajo funcional concentrado en `features/`;
- componentes reutilizables en atoms/molecules/organisms/templates;
- rutas centralizadas;
- cliente API común;
- `api/generated` no se modifica manualmente;
- debe existir una plantilla y manual para el equipo frontend.
