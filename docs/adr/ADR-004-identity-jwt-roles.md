# ADR-004 — ASP.NET Core Identity + JWT + roles

## Estado
Aceptado.

## Contexto
El sistema posee usuarios internos, múltiples roles y operaciones con acceso restringido.

## Decisión
Utilizar ASP.NET Core Identity para usuarios/roles y JWT Bearer para autenticación de API. La autorización se realizará mediante roles y policies basadas en roles.

## Consecuencias
- backend como autoridad de acceso;
- frontend refleja permisos, pero no los reemplaza;
- no se crea una matriz dinámica adicional de permisos en el MVP;
- el almacenamiento seguro del token se revisará en seguridad.
