# Catalog Specification

## Purpose

Gestionar Categories, Units y Products con CRUD, baja lógica y autorización de catálogo, sin inventario, composición ni conversiones de empaque.

## Requirements

### Requirement: Autorización y endpoints de Categories

Las lecturas de catálogo SHALL permitir `ADMINISTRADOR`, `ENCARGADO`, `MESERO` y `COCINA`; las escrituras SHALL permitir solo `ADMINISTRADOR` y `ENCARGADO`. Categories SHALL exponer `GET /api/v1/categories`, `GET /api/v1/categories/{id}`, `POST /api/v1/categories`, `PUT /api/v1/categories/{id}` y `DELETE /api/v1/categories/{id}`. DELETE SHALL realizar baja lógica y responder 204; nunca SHALL sustituirse por PATCH de estado. La lista acepta `scope` e `includeInactive`; sin `includeInactive=true` excluye inactivas. GET, PUT o DELETE de un id inexistente SHALL responder 404.

#### Scenario: Baja lógica de categoría

- GIVEN una categoría activa y un actor `ENCARGADO`
- WHEN llama DELETE sobre su id
- THEN responde 204 y la categoría queda inactiva sin eliminarse físicamente.

### Requirement: Scope, DTO y semillas de Categories

El DTO de Category SHALL ser `{id:UUID,name:string,scope:MENU|INVENTORY|PREPARATION,isActive:boolean}`; POST y PUT aceptan `name` no vacío y uno de esos scopes exactos. Una categoría SHALL ser única lógicamente por `(scope, name)`, sin distinguir mayúsculas/minúsculas; el duplicado SHALL responder 409. El sistema SHALL sembrar exactamente estas categorías canónicas: `MENU`: `Entradas`, `Platos principales`, `Acompañamientos`, `Postres`, `Bebidas`; `INVENTORY`: `Perecederos`, `No perecederos`, `Bebidas e Insumos`, `Suministros y Limpieza`; `PREPARATION`: `Salsas`, `Masas y pastas`. No SHALL usar tipos de producto como scopes. El mismo nombre en scopes diferentes SHALL estar permitido. No SHALL existir constraint entre `productType` y `scope`.

#### Scenario: Semillas exactas de categorías

- GIVEN una base de datos sin semillas de categorías
- WHEN se ejecuta el seeder de catálogo
- THEN existen exactamente `Entradas`, `Platos principales`, `Acompañamientos`, `Postres` y `Bebidas` con scope `MENU`; `Perecederos`, `No perecederos`, `Bebidas e Insumos` y `Suministros y Limpieza` con scope `INVENTORY`; y `Salsas` y `Masas y pastas` con scope `PREPARATION`.

#### Scenario: Duplicado lógico

- GIVEN una categoría activa o inactiva con el mismo name y scope
- WHEN `ADMINISTRADOR` o `ENCARGADO` intenta crearla
- THEN responde 409 ProblemDetails.

### Requirement: Endpoints, contrato y protección de Units

Units SHALL exponer `GET /api/v1/units`, `GET /api/v1/units/{id}`, `POST /api/v1/units`, `PUT /api/v1/units/{id}` y `DELETE /api/v1/units/{id}`; DELETE SHALL ser baja lógica y responder 204. El DTO de lectura SHALL preservar exactamente `{id:UUID,code:string,name:string,symbol:string,dimension:MASS|VOLUME|COUNT,factor_to_base:decimal,is_base:boolean,is_active:boolean}`; POST/PUT validan esos campos de negocio, `code`, `name` y `symbol` no vacíos, `factor_to_base` positivo, y `is_base` coherente con la unidad base de su dimensión. El sistema SHALL sembrar exactamente las unidades canónicas `g` (`dimension=MASS`, `factor_to_base=1`, `is_base=true`), `kg` (`dimension=MASS`, `factor_to_base=1000`, `is_base=false`), `ml` (`dimension=VOLUME`, `factor_to_base=1`, `is_base=true`), `l` (`dimension=VOLUME`, `factor_to_base=1000`, `is_base=false`) y `unit` (`dimension=COUNT`, `factor_to_base=1`, `is_base=true`). Las cinco unidades canónicas no SHALL modificarse estructuralmente ni desactivarse de una forma que cambie o rompa su `code`, `dimension`, `factor_to_base`, `is_base` o sus conversiones canónicas; su baja lógica SHALL responder 409. Se MAY crear y administrar unidades nuevas conforme a las reglas estándar. Un id inexistente SHALL responder 404.

#### Scenario: Semillas exactas y protección canónica

- GIVEN una base de datos sin semillas de unidades
- WHEN se ejecuta el seeder de catálogo
- THEN existen `g` MASS factor 1 base, `kg` MASS factor 1000 no base, `ml` VOLUME factor 1 base, `l` VOLUME factor 1000 no base y `unit` COUNT factor 1 base.

- GIVEN una unidad canónica sembrada
- WHEN `ADMINISTRADOR` o `ENCARGADO` intenta cambiar su `code`, `dimension`, `factor_to_base`, `is_base` o una conversión canónica, o desactivarla
- THEN responde 409 ProblemDetails y la definición canónica permanece sin cambios.

### Requirement: Endpoints, DTO y filtros de Products

Products SHALL exponer `GET /api/v1/products`, `GET /api/v1/products/{id}`, `POST /api/v1/products`, `PUT /api/v1/products/{id}` y `DELETE /api/v1/products/{id}`; DELETE SHALL realizar baja lógica y responder 204. La lista SHALL aceptar todos y solo estos filtros funcionales: `page`, `pageSize`, `search`, `productType`, `categoryId`, `categoryScope`, `preparationArea`, `isActive`. Los productType válidos SHALL ser exactamente `INGREDIENT`, `PREPARATION`, `SALE_ITEM`, `SUPPLY`; categoryScope solo SHALL aceptar `MENU`, `INVENTORY`, `PREPARATION` y no SHALL restringir productType. El DTO SHALL incluir `{id:UUID,name:string,productType,categoryId:UUID|null,categoryScope:MENU|INVENTORY|PREPARATION|null,preparationArea:string|null,inventoryUnitId:UUID,salePrice:decimal|null,minStock:decimal|null,isActive:boolean,createdAt:ISO-8601 UTC,createdByUserId:string,updatedAt:ISO-8601 UTC,updatedByUserId:string}`. POST/PUT SHALL validar name no vacío, productType válido, `inventoryUnitId` obligatorio y existente, categoría existente si se provee, y valores monetarios o cantidades no negativos. GET, PUT o DELETE inexistente SHALL responder 404.

#### Scenario: Filtros completos y scopes independientes

- GIVEN productos de distintos tipos, scopes y áreas de preparación
- WHEN un `MESERO` consulta con `page`, `pageSize`, `search`, `productType`, `categoryId`, `categoryScope`, `preparationArea` e `isActive`
- THEN recibe el sobre paginado filtrado sin rechazo por combinar un tipo con un scope válido.

### Requirement: Conflictos y exclusiones de catálogo

DELETE de una unidad referenciada por Product SHALL responder 409 y conservar la unidad; DELETE de Category referenciada por Product SHALL responder 409 y conservar la categoría. Products SHALL conservar auditoría UTC y actor de alta/última actualización. Este change SHALL NOT exponer stock, composiciones, conversiones de empaque ni endpoints de inventario.

#### Scenario: Unidad en uso

- GIVEN una unidad usada por un Product
- WHEN un `ENCARGADO` solicita DELETE de la unidad
- THEN responde 409 ProblemDetails y el Product conserva su referencia.
