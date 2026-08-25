# Suppliers Specification

## Purpose

Administrar proveedores con contratos REST, búsqueda, baja lógica y autorización cerrada.

## Requirements

### Requirement: Endpoints, DTO y validación de Supplier

Suppliers SHALL exponer `GET /api/v1/suppliers`, `GET /api/v1/suppliers/{id}`, `POST /api/v1/suppliers`, `PUT /api/v1/suppliers/{id}` y `DELETE /api/v1/suppliers/{id}`. DELETE SHALL realizar baja lógica y responder 204; no SHALL sustituirse por PATCH de estado. El DTO SHALL ser exactamente `{id:UUID,name:string,phoneNumber:string,email:string|null,notes:string|null,isActive:boolean,createdAt:ISO-8601 UTC,createdByUserId:string,updatedAt:ISO-8601 UTC,updatedByUserId:string}`. POST/PUT aceptan `{name:string,phoneNumber:string,email:string|null,notes:string|null}`; name y phoneNumber son obligatorios y no vacíos, y email, si existe, SHALL ser sintácticamente válido. GET, PUT o DELETE de un id inexistente SHALL responder 404.

#### Scenario: Teléfono textual y opcionales

- GIVEN un `ENCARGADO` autenticado
- WHEN crea un proveedor con name y phoneNumber, sin email ni notes
- THEN responde 201 y devuelve phoneNumber como string y los opcionales como null.

### Requirement: Consulta, autorización y baja lógica

GET de lista SHALL aceptar `search`, `isActive`, `page` y `pageSize`; buscará name o phoneNumber y, sin `isActive`, excluirá inactivos. Las escrituras SHALL permitir `ADMINISTRADOR` y `ENCARGADO`; las lecturas SHALL permitir `ADMINISTRADOR`, `ENCARGADO`, `COCINA` y `CONTADORA`. DELETE seguirá la misma autorización de escritura; no SHALL imponer una restricción no aprobada de desactivación exclusiva de `ADMINISTRADOR`.

#### Scenario: Lectura por cocina

- GIVEN un Bearer con solo rol `COCINA`
- WHEN solicita la lista de proveedores
- THEN responde 200 con el sobre paginado permitido.

### Requirement: Sin unicidad artificial y conflictos

El sistema SHALL permitir proveedores distintos con el mismo phoneNumber o email y SHALL conservar auditoría UTC y actor. Si una regla de integridad aplicable impide crear, actualizar o eliminar un proveedor, SHALL responder 409 ProblemDetails sin cambios parciales. Este change SHALL NOT incluir compras, cuentas por pagar ni lógica de recepción.

#### Scenario: Teléfono compartido

- GIVEN un proveedor existente con phoneNumber `70000000`
- WHEN `ADMINISTRADOR` crea otro con el mismo phoneNumber y name distinto
- THEN responde 201.
