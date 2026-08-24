# Artefactos OpenSpec

El árbol canónico de OpenSpec es `docs/openspec/`.

## Compatibilidad del runtime local

El runtime de Windows instalado aún resuelve `openspec/` desde la raíz del repositorio. Localmente, esa ruta es una unión de Windows ignorada hacia `docs/openspec/`; no es un segundo árbol de artefactos y no debe incluirse en un commit. Recree la unión solo cuando el runtime lo requiera:

```text
mklink /J openspec docs\openspec
```
