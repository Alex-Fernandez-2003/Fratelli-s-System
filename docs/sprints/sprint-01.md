# Sprint 01 — integración frontend

## Objetivo

Cerrar la integración frontend del Sprint 1 con navegación autorizada, un shell autenticado único, experiencia responsive y documentación current-state.

## Alcance implementado

- Autenticación y rutas protegidas.
- Usuarios, Productos, Proveedores, Inventario, Pedidos, Cocina, Gastos y Asistencia.
- Sidebar desktop y topbar con drawer mobile; no existe bottom navigation global.
- Productos: lectura para `ADMINISTRADOR`, `ENCARGADO`, `MESERO` y `COCINA`; gestión para `ADMINISTRADOR` y `ENCARGADO`.
- Proveedores: lectura para `ADMINISTRADOR`, `ENCARGADO`, `COCINA` y `CONTADORA`; gestión para `ADMINISTRADOR` y `ENCARGADO`.
- Asistencia: gestión por `EmployeeId` para `ADMINISTRADOR` y `ENCARGADO`; historial propio para los demás roles.

## Validación automatizada

- `format:check`, typecheck, lint, tests y build del frontend: ejecutados en esta integración.
- Validación visual humana de desktop, 403 px y 360 px: pendiente de Sprint Review.

## Referencias

- `docs/historias/HU-003-catalogo.md`
- `docs/historias/HU-016-proveedores.md`
- `docs/historias/HU-022-registrar-asistencia.md`
