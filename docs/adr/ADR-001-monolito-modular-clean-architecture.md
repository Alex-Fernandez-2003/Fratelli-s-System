# ADR-001 — Monolito modular con Clean Architecture

## Estado
Aceptado.

## Contexto
Restaurant System posee varios dominios relacionados y operaciones transaccionales, pero dispone de poco tiempo de implementación y un equipo pequeño.

## Alternativas
1. Microservicios.
2. Monolito sin separación interna.
3. Monolito modular con Clean Architecture.

## Decisión
Utilizar un único backend ASP.NET Core desplegable, organizado mediante Clean Architecture y módulos funcionales internos.

## Razón
Permite estructura, pruebas y separación de responsabilidades sin introducir complejidad distribuida.

## Consecuencias
- un único despliegue backend;
- una única base PostgreSQL;
- dependencias internas controladas;
- los módulos no son microservicios;
- debe evitarse sobrearquitectura innecesaria.
