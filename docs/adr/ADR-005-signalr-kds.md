# ADR-005 — SignalR para Cocina/KDS

## Estado
Aceptado.

## Contexto
Cocina necesita recibir cambios de comandas con baja latencia y sin recarga manual constante.

## Decisión
REST seguirá siendo la fuente de verdad. SignalR se utilizará como canal de actualización en tiempo real para Cocina/KDS mediante `/hubs/kitchen`.

## Consecuencias
- el frontend debe manejar reconexión;
- al reconectar debe refrescar estado vía REST;
- SignalR no reemplaza persistencia ni REST;
- inicialmente no se generaliza tiempo real a todos los módulos.
