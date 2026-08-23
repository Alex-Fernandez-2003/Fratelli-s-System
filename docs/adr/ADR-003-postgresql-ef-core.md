# ADR-003 — PostgreSQL + Entity Framework Core

## Estado
Aceptado.

## Contexto
El producto requiere relaciones, restricciones, transacciones y trazabilidad. PostgreSQL está disponible en el HomeLab usado para pruebas.

## Decisión
Utilizar PostgreSQL con Entity Framework Core y Npgsql. Las migrations residirán en Infrastructure.

## Consecuencias
- modelo relacional;
- migrations reproducibles;
- soporte de transacciones;
- conexión mediante configuración/variables de entorno;
- el modelo detallado se define en `11-modelo-datos.md`.
