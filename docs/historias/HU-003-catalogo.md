
# HU-003 — Gestionar productos, ingredientes y platos

## Estado de implementación

**Backend:** COMPLETE. **Frontend:** COMPLETE. **Validación automatizada:** PENDING. **Validación manual:** PENDING.

## Contrato implementado

| Ruta                          | Acceso                                              | Resultado                          |
| ------------------------------ | ---------------------------------------------------- | ----------------------------------- |
| `GET /api/v1/products`         | Bearer — `CatalogRead`                               | 200, listado paginado y filtrado    |
| `GET /api/v1/products/{id}`    | Bearer — `CatalogRead`                               | 200 con el producto, o 404          |
| `POST /api/v1/products`        | Bearer — `CatalogWrite`                              | 201 y producto creado               |
| `PUT /api/v1/products/{id}`    | Bearer — `CatalogWrite`                              | 200 con el producto actualizado     |
| `DELETE /api/v1/products/{id}` | Bearer — `CatalogWrite`                              | 204, baja lógica (no elimina histórico) |
| `GET /api/v1/categories`       | Bearer — `CatalogRead`                               | 200, listado paginado               |
| `POST/PUT /api/v1/categories`  | Bearer — `CatalogWrite`                              | 201/200                             |
| `GET /api/v1/units`            | Bearer — `CatalogRead`                               | 200, listado paginado               |
| `POST/PUT /api/v1/units`       | Bearer — `CatalogWrite`                              | 201/200                             |

`CatalogRead` autoriza a `ADMINISTRADOR`, `ENCARGADO`, `MESERO`, `COCINA`. `CatalogWrite` autoriza únicamente a `ADMINISTRADOR`, `ENCARGADO`.

`GET /products` acepta `page`, `pageSize` (1–100), `search`, `productType`, `categoryId`, `categoryScope`, `preparationArea`, `isActive`. Las listas retornan `{ "items": [], "page", "pageSize", "totalCount", "totalPages" }`.

Cuerpo de `ProductRequest`:

```json
{
  "name": "Hamburguesa de Pollo Crispy",
  "productType": "SALE_ITEM",
  "categoryId": "uuid|null",
  "preparationArea": "KITCHEN|BAR|null",
  "inventoryUnitId": "uuid",
  "salePrice": 45.0,
  "minStock": null,
  "isSellable": true
}
```

`productType` es `INGREDIENT | PREPARATION | SALE_ITEM | SUPPLY`. `ProductDto` agrega `id`, `isActive`, `createdAt`, `createdByUserId`, `updatedAt`, `updatedByUserId`, `categoryScope` (derivado de la categoría). El contrato **no incluye** descripción ni SKU.

`Category` es `{ id, name, scope, isActive }`, con `scope` en `MENU | INVENTORY | PREPARATION`. `Unit` es `{ id, code, name, symbol, dimension, factor_to_base, is_base, is_active }`, con `dimension` en `MASS | VOLUME | COUNT`.

## Frontend implementado

Página `/productos` (`src/features/products/pages.tsx`), protegida por `RequireAuth` + `RequireAnyRole` con los mismos roles que `CatalogRead`, integrada al `AppShell` (sidebar/topbar) mediante `AuthenticatedLayout`.

Incluye: listado con búsqueda y filtros (tipo, categoría), tabla de escritorio (`DataTable`) y tarjetas para móvil, alta/edición mediante `Modal` con formulario, desactivación con `Modal` de confirmación, y los 4 estados de interfaz (carga, vacío, error, confirmación).

Hooks tipados directamente desde `paths['/api/v1/products']` en `src/types/api.generated.ts` (`src/features/products/api.ts`), sin tipos manuales.

## Hallazgos pendientes de confirmación con backend

- **No existe endpoint de reactivación de producto.** `DELETE /products/{id}` es la única forma de cambiar el estado; a diferencia de `users` (que expone `/activate` y `/deactivate`), no hay forma de revertir la desactivación desde la API. La UI comunica la acción como no reversible mientras esto no se confirme o se agregue el endpoint faltante.
- La policy `CatalogRead` no incluye el rol `CONTADORA`, pese a que RF-012 lo exige como autorizado para consultar el catálogo.
- El diseño original contemplaba campos de descripción y SKU que el contrato actual no soporta; no fueron implementados.

## Errores

Los errores usan ProblemDetails (`application/problem+json`): 400 para binding/validación, 401 para falta o expiración de token, 403 para rol sin autorización, 404 para recurso inexistente, 409 para duplicados o referencias en uso (p. ej. una unidad usada por un producto no puede desactivarse).

## Evidencias

### Captura del listado de productos (desktop)

![Captura del listado desktop](../capturas/HU-003-listado-desktop.png)

---

### Captura del listado de productos (mobile)

![Captura del listado mobile](../capturas/HU-003-listado-mobile.png)

---

### Captura del formulario de creación

![Captura del formulario](../capturas/HU-003-formulario.png)

---

### Captura de filtros aplicados

![Captura de filtros](../capturas/HU-003-filtros.png)

---

### Captura de confirmación de desactivación

![Captura de confirmación](../capturas/HU-003-desactivacion.png)

---
