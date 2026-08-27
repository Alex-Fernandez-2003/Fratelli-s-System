# HU-003 — Catálogo

## Estado de implementación

**Backend:** COMPLETE. **Frontend:** COMPLETE. **Validación automatizada:** COMPLETE. **Validación manual:** PENDING.

La UI separa lectura y gestión: `ADMINISTRADOR` y `ENCARGADO` gestionan; `MESERO` y `COCINA` solo consultan. `CONTADORA` y `EMPLEADO` no acceden a Products.

## Rutas y autorización

Todos los endpoints requieren Bearer. Lectura (`ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`): `GET /api/v1/categories`, `GET /api/v1/categories/{id}`, `GET /api/v1/units`, `GET /api/v1/units/{id}`, `GET /api/v1/products` y `GET /api/v1/products/{id}`. Escritura (`ADMINISTRADOR`, `ENCARGADO`): `POST`, `PUT` y `DELETE` sobre cada uno de esos tres recursos.

Las listas retornan `{ "items": [], "page": 1, "pageSize": 20, "totalCount": 0, "totalPages": 0 }`; `page` inicia en 1 y `pageSize` admite 1–100.

## Categorías y unidades

Category es `{id,name,scope,isActive}`; `scope` es `MENU`, `INVENTORY` o `PREPARATION`. `GET /categories` acepta `page`, `pageSize`, `scope` e `includeInactive`. `POST`/`PUT` reciben `{ "name": "Especiales", "scope": "MENU" }`. El nombre es único sin mayúsculas/minúsculas dentro del scope y DELETE es baja lógica; un duplicado o una categoría referenciada devuelve 409.

Unit es `{id,code,name,symbol,dimension,factor_to_base,is_base,is_active}`. `GET /units` acepta `page`, `pageSize` e `includeInactive`; `POST`/`PUT` reciben, por ejemplo:

```json
{"code":"taza","name":"Taza","symbol":"tz","dimension":"VOLUME","factor_to_base":250,"is_base":false}
```

`dimension` es `MASS`, `VOLUME` o `COUNT`; el factor es positivo. Las unidades canónicas `g`, `kg`, `ml`, `l` y `unit` no pueden cambiar sus campos estructurales ni desactivarse (409). Una unidad usada por un producto tampoco se desactiva.

## Productos

Product devuelve `{id,name,productType,categoryId,categoryScope,preparationArea,inventoryUnitId,salePrice,minStock,isActive,createdAt,createdByUserId,updatedAt,updatedByUserId}`. `POST`/`PUT` requieren nombre, `productType` (`INGREDIENT|PREPARATION|SALE_ITEM|SUPPLY`) e `inventoryUnitId`; `categoryId`, importes y mínimos son opcionales según el contrato y los importes no pueden ser negativos. `GET /products` acepta `page`, `pageSize`, `search`, `productType`, `categoryId`, `categoryScope`, `preparationArea` e `isActive`. DELETE realiza baja lógica.

Las 11 categorías y cinco unidades anteriores son seeds estructurales de migración, presentes en todos los entornos. No hay composiciones, stock ni regla que acople `productType` con `categoryScope`.

## Errores y evidencia

La evidencia automatizada del frontend actual incluye format, typecheck, lint, build y 48 pruebas Vitest en verde. Evidencia visual manual: pendiente.

La API devuelve 400 para binding/validación, 401/403 para autorización, 404 para recursos inexistentes y 409 para duplicados o reglas de integridad. Las pruebas PostgreSQL cubren seeds, upgrade desde `InitialIdentity`, unicidad por scope, FKs, permisos, filtros, paginación y bajas lógicas.
