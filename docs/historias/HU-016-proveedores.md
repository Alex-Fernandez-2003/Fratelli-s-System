# HU-016 — Proveedores

## Resultado

Implementada end-to-end la gestión de proveedores en `/proveedores`.

## Reglas implementadas

- Lectura: `ADMINISTRADOR`, `ENCARGADO`, `COCINA` y `CONTADORA`; escritura: `ADMINISTRADOR` y `ENCARGADO`.
- El listado muestra activos por defecto y `DELETE` realiza baja lógica.
- Nombre y teléfono son obligatorios. Email usa `MailAddress`; un email opcional en blanco se rechaza.
- No se normaliza whitespace ni existe unicidad de nombre, teléfono o email.

## Seguridad

Los endpoints requieren JWT y aplican las políticas de lectura y escritura.

## Frontend y validación

La interfaz ofrece tabla desktop y cards mobile, con acciones mutantes solo para roles de escritura. No se declara validación manual adicional a la evidencia original.

## Baseline revalidado

`develop` revalidado en `bb2fd04a48bddce1b608bb1639308528daefcfc1`.

## Evidencia real

No se modifica ni incorpora evidencia técnica durante esta normalización.

## Manifest de archivos del change

### Backend

| Archivo | Propósito |
| --- | --- |
| `backend/src/RestaurantSystem.Api/Program.cs` | Endpoints y políticas. |
| `backend/src/RestaurantSystem.Application/Suppliers/SupplierContracts.cs` | Contratos de proveedores. |
| `backend/src/RestaurantSystem.Infrastructure/Suppliers/SupplierService.cs` | Reglas y baja lógica. |
| `backend/src/RestaurantSystem.Domain/Suppliers/Supplier.cs` | Entidad proveedor. |
| `backend/src/RestaurantSystem.Infrastructure/Migrations/20260825044849_AddSuppliers.cs` | Migración de proveedores. |

### Frontend y contrato generado

| Archivo | Propósito |
| --- | --- |
| `frontend/src/features/proveedores/api.ts` | API de proveedores. |
| `frontend/src/features/proveedores/hooks.ts` | Consultas y mutaciones. |
| `frontend/src/features/proveedores/types.ts` | Tipos de la feature. |
| `frontend/src/features/proveedores/components/SupplierFormFields.tsx` | Formulario. |
| `frontend/src/pages/proveedores/SuppliersPage.tsx` | Página `/proveedores`. |
| `frontend/src/features/navigation.tsx` | Navegación autorizada. |
| `frontend/src/routes/AppRoutes.tsx` | Ruta protegida. |

### Documentación

| Archivo | Propósito |
| --- | --- |
| `docs/historias/HU-016-proveedores.md` | Historia y evidencia. |

## Estado de entrega

Implementada para MVP.

## Evidencias

### Listado de proveedores (Desktop)
![Listado de proveedores](../capturas/HU-016-listado.png)

### Listado de proveedores inactivos
![Listado de proveedores inactivos](../capturas/HU-016-listado-inactivos.png)

### Crear proveedor
![Crear proveedor](../capturas/HU-016-crear.png)

### Editar proveedor
![Editar proveedor](../capturas/HU-016-editar.png)

### Desactivar proveedor (baja lógica)
![Desactivar proveedor](../capturas/HU-016-desactivar.png)
