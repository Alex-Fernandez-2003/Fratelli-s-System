# HU-016 — Proveedores

## Estado de implementación

**Backend:** COMPLETE. **Frontend:** COMPLETE. **Validación automatizada:** COMPLETE. **Validación manual:** PENDING.

## Rutas y roles

Los endpoints requieren Bearer. Lectura: `GET /api/v1/suppliers` y `GET /api/v1/suppliers/{id}` para `ADMINISTRADOR`, `ENCARGADO`, `COCINA` y `CONTADORA`. Escritura: `POST`, `PUT` y `DELETE /api/v1/suppliers/{id}` para `ADMINISTRADOR` y `ENCARGADO`.

`Supplier` devuelve:

```json
{
  "id": "uuid",
  "name": "Verdulería Norte",
  "phoneNumber": "70000000",
  "email": "north@example.test|null",
  "notes": "Entrega AM|null",
  "isActive": true,
  "createdAt": "2026-08-25T12:00:00+00:00",
  "createdByUserId": "identity-string-id",
  "updatedAt": "2026-08-25T12:00:00+00:00",
  "updatedByUserId": "identity-string-id"
}
```

POST y PUT reciben `{name,phoneNumber,email,notes}`. Nombre y teléfono son obligatorios; email, si se suministra, debe tener formato válido; los opcionales ausentes se serializan como `null`. Teléfono y email no tienen unicidad de negocio.

`GET /api/v1/suppliers` acepta `search`, `isActive`, `page` y `pageSize`; busca en nombre o teléfono. La respuesta es el sobre común `{items,page,pageSize,totalCount,totalPages}` con `page` desde 1 y `pageSize` entre 1 y 100. Sin `isActive` solo se listan proveedores activos. DELETE es baja lógica, no borrado físico.

## Interfaz Sprint 1

La ruta `/proveedores` conserva tabla en desktop y usa cards en mobile. Las cards muestran solo nombre, contacto real, estado y notas cuando existen. `ADMINISTRADOR` y `ENCARGADO` ven CTA y acciones; `COCINA` y `CONTADORA` no reciben controles mutantes.

## Errores y evidencia

La evidencia automatizada del frontend actual incluye format, typecheck, lint, build y 48 pruebas Vitest en verde. Evidencia visual manual: pendiente.

Los contratos de error son ProblemDetails: 400 para validación/binding, 401 sin Bearer, 403 sin política, 404 para un id inexistente y 409 para conflictos de regla de negocio. La integración PostgreSQL cubre la matriz de roles, campos opcionales, email inválido, búsqueda/paginación y baja lógica.

