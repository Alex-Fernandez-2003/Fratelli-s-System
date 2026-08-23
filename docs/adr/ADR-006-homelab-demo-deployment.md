# ADR-006 — HomeLab como ambiente de demostración

## Estado
Aceptado.

## Contexto
No existe proveedor definitivo. Se dispone de HomeLab para pruebas y demostración, incluyendo PostgreSQL.

## Decisión
Mantener la arquitectura independiente del proveedor. Para demo se podrá utilizar Docker para frontend/backend y la instancia PostgreSQL del HomeLab. Se prioriza reverse proxy same-origin para `/`, `/api/` y `/hubs/`.

## Consecuencias
- Docker no es obligatorio para desarrollo local;
- la IP del HomeLab no se hardcodea;
- configuración mediante environment variables;
- el proveedor definitivo puede cambiar sin modificar la arquitectura funcional.
