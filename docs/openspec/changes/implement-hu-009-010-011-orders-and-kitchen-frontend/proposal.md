# Proposal

## Problem Statement

El change `implement-hu-009-010-011-orders-and-kitchen-frontend` debe completar, mediante un único change frontend, el flujo funcional de:

- HU-009 — Registrar y gestionar pedidos.
- HU-010 — Generar y gestionar comandas de cocina.
- HU-011 — Cancelar pedido antes de que esté listo.

Ruta OpenSpec obligatoria:

`docs/openspec/changes/implement-hu-009-010-011-orders-and-kitchen-frontend/`

Rama futura prevista:

`feature/hu-009-010-011-orders-kitchen-frontend`

Este change debe consumir el backend final ya implementado por:

`implement-hu-009-010-011-orders-and-kitchen-backend`

y completar:

- REST;
- TanStack Query;
- navegación;
- autorización visual;
- Orders;
- New Order;
- Order Detail;
- assignment;
- take;
- cancel;
- deliver;
- Kitchen/KDS;
- SignalR;
- reconnect;
- polling fallback;
- responsive;
- tests;
- documentación;
- validación manual.

### Auditoría de baseline realizada para este briefing

La rama pública `develop` visible durante esta auditoría todavía no contiene el backend requerido por este frontend change:

- `Program.cs` visible contiene Auth, Catalog, Suppliers, Attendance y `/hubs/attendance`;
- no contiene actualmente `/api/v1/orders`;
- no contiene actualmente `/api/v1/kitchen/commands`;
- no contiene actualmente `/hubs/kitchen`. citeturn768635view0turn768635view1turn768635view2

El frontend visible tampoco contiene todavía:

- `/pedidos`;
- `/cocina`;
- Orders/Kitchen en el endpoint registry. citeturn768635view3turn768635view7

Sí está integrada la foundation requerida:

- `RequireAuth`;
- `RequireAnyRole`;
- `/inicio`;
- `/usuarios`;
- `AuthenticatedLayout`;
- navegación central por roles;
- shared AppShell. citeturn768635view4turn768635view5

La navegación central actual define `/inicio` y `/usuarios`, filtrando por `allowedRoles`, lo que constituye el punto correcto de extensión para Pedidos y Cocina. citeturn768635view5

El frontend real dispone de:

- React 19;
- React Router;
- TanStack Query;
- SignalR client;
- Lucide;
- Tailwind;
- Vitest;
- Testing Library;
- openapi-typescript;
- `api:generate`;
- scripts de format, typecheck, lint, test y build. citeturn768635view9

Por tanto, la futura sesión de APPLY MUST comenzar con un gate de baseline:

1. actualizar/auditar `develop`;
2. comprobar que el backend HU-009/HU-010/HU-011 ya está integrado;
3. comprobar OpenAPI runtime;
4. comprobar `/hubs/kitchen`;
5. solo entonces regenerar TypeScript e implementar frontend.

Si el backend continúa ausente, no corresponde inventar contracts ni reconstruirlo desde este frontend change.

### Referencias visuales

Se recibió el archivo:

`HU-009_HU-010_HU-011.zip`

y el request exige consumir todo el paquete visual. La especificación suministrada identifica, entre otras, referencias como:

- `Pedidos - Desktop.png`;
- `Nuevo pedido - Desktop.png`;
- `Detalle de pedido - Desktop.png`;
- `Cocina - Vista Mesero (Read-only).png`;
- además de variantes mobile, estados, acciones y modales. fileciteturn10file0

Limitación de esta sesión:

el archivo ZIP fue adjuntado, pero las herramientas de archivos disponibles no exponen sus PNG internos para inspección visual. No es correcto declarar que esas imágenes fueron visualmente auditadas.

La futura sesión de explore/APPLY MUST inspeccionar el 100 % del ZIP antes de congelar la composición visual final. Esta limitación afecta fidelity/layout fina, pero no reabre las decisiones funcionales ya congeladas en este briefing.

## Goals

- Implementar las tres HU mediante un único frontend change.
- Consumir exclusivamente el backend final real.
- Auditar OpenAPI antes de escribir adapters frontend.
- Regenerar `api.generated.ts`.
- No editar generated types manualmente.
- Mantener la arquitectura:
  - generated types;
  - endpoint registry;
  - shared httpClient;
  - feature APIs;
  - TanStack Query;
  - UI.
- Reutilizar HU-001:
  - token en memoria;
  - refresh cookie;
  - session coordinator;
  - shared HTTP client;
  - guards.
- Reutilizar HU-002 para obtener MESEROS asignables cuando corresponda.
- Añadir:
  - `/pedidos`;
  - `/pedidos/nuevo`;
  - `/pedidos/:id`;
  - `/cocina`.
- Implementar listado de pedidos server-driven.
- Implementar creación de Order.
- Implementar carrito local, una línea por Product.
- Implementar detalle read-only.
- Implementar assignment administrativo.
- Implementar waiter take.
- Implementar cancelación.
- Implementar delivery.
- Implementar KDS:
  - operativo para COCINA/ENCARGADO/ADMINISTRADOR;
  - read-only para MESERO.
- Implementar `ElapsedTime` sin tráfico de red.
- Consumir `/hubs/kitchen`.
- Tratar eventos SignalR como triggers de invalidation/refetch.
- Implementar automatic reconnect.
- Implementar fallback polling aproximadamente cada 30 segundos únicamente cuando realtime no esté saludable.
- No utilizar optimistic business transitions.
- Manejar 409 como carrera/conflicto operativo.
- Soportar desktop, 403 px y 360 px.
- Reutilizar Tailwind/UI Kit/Lucide.
- Completar tests frontend.
- Completar quality gates.
- Preparar validación manual.
- Completar documentación de HU-009/HU-010/HU-011 después de validación real.

## Non-Goals

- No modificar reglas de negocio backend.
- No reconstruir el backend Orders/Kitchen.
- No crear segundo HTTP client.
- No crear segundo QueryClient.
- No crear segunda auth implementation.
- No usar JWT manualmente en features.
- No localStorage JWT.
- No sessionStorage JWT.
- No persistir draft.
- No editar Order después de crear.
- No agregar nuevos OrderItems a un Order persistido.
- No eliminar OrderItems persistidos.
- No editar quantity/notes/tableReference persistidos.
- No `Enviar nuevos ítems`.
- No Pre-cuenta.
- No Cobrar mesa.
- No Sale.
- No payment.
- No impuestos/servicio.
- No Customer assignment.
- No Inventory.
- No availability ficticia.
- No Table master.
- No Shift UI.
- No Print flow.
- No priority/URGENTE.
- No porcentaje de progreso.
- No estimación artificial.
- No station.
- No dispatch location.
- No BAR KDS.
- No per-item readiness.
- No partial delivery.
- No `Retirar ya`.
- No backend draft.
- No offline persistence.
- No Service Worker.
- No bottom-navigation paralela si AppShell ya resuelve navegación responsive.
- No placeholders para funcionalidades futuras.

## Affected Areas

### Generated contract

- `frontend/src/types/api.generated.ts`.

### Shared API foundation

- endpoint registry existente;
- shared `httpClient` únicamente si falta soporte HTTP genérico requerido;
- session coordinator únicamente si SignalR necesita un accessor in-memory seguro.

### Navigation / routing

- `AppRoutes`;
- `authenticatedNavigation`;
- `AuthenticatedLayout` solamente si necesita un ajuste mínimo reusable.

### Features

- Orders.
- Kitchen.
- Kitchen realtime.
- Cart/draft local.

### Shared UI

Reutilizar antes de crear:

- Button;
- Input;
- Select;
- Badge;
- Spinner/loading pattern;
- Alert;
- EmptyState;
- Dialog/Modal;
- DataTable/Pagination si encajan;
- PageHeader;
- AppShell.

### Tests

- routing/auth;
- API adapters;
- query keys;
- Orders;
- New Order;
- Order Detail;
- assignment/take;
- cancel/deliver;
- KDS;
- timer;
- SignalR;
- reconnect;
- fallback polling;
- responsive semantics.

### Documentation

- HU-009;
- HU-010;
- HU-011;
- OpenSpec;
- endpoint-consumption table;
- SignalR table;
- visual-reference reconciliation;
- complete file manifest.

## Assumptions

### Assumption 1 — backend será integrado antes de APPLY

La solicitud define como baseline obligatoria un `develop` posterior al observado durante este briefing.

Esto es una precondición del change.

### Assumption 2 — OpenAPI será autoridad de naming

Los nombres concretos de:

- DTOs;
- request types;
- response fields;
- enums;
- pagination fields;
- paths;

MUST derivarse de OpenAPI final, no de los ejemplos conceptuales de este briefing.

### Assumption 3 — HU-002 continúa integrada

El endpoint registry visible ya contiene User Management y filtros:

- page;
- pageSize;
- search;
- role;
- active;

por lo que la futura UI de assignment SHOULD reutilizar esa capability en lugar de crear un endpoint de waiters. citeturn768635view8

## Risks

### Risk 1: APPLY comienza sobre develop sin backend final

- Probability: High según auditoría actual.
- Impact: Critical.
- Mitigation: Gate obligatorio de backend/OpenAPI/hub antes de regenerar types o implementar UI.

### Risk 2: OpenAPI real difiere del contrato conceptual

- Probability: Medium.
- Impact: High.
- Mitigation: backend runtime/OpenAPI manda en naming y payloads; adaptar frontend sin cambiar decisiones funcionales congeladas.

### Risk 3: ZIP no auditado completamente

- Probability: Certain en este briefing.
- Impact: High para fidelidad visual.
- Mitigation: inventario visual 100 % antes del slice de presentación.

### Risk 4: Figma contiene funciones no soportadas

- Probability: High.
- Impact: Medium.
- Mitigation: omitirlas; no placeholders; documentar intentional differences.

### Risk 5: local filtering rompe pagination

- Probability: Medium.
- Impact: High.
- Mitigation: search/status server-driven.

### Risk 6: Query key omite filtros

- Probability: Medium.
- Impact: Medium.
- Mitigation: keys incluyen todos los inputs normalizados.

### Risk 7: optimismo muestra ownership/state falso

- Probability: High.
- Impact: High.
- Mitigation: no optimistic mutations para acciones operativas.

### Risk 8: 409 tratado como error fatal

- Probability: Medium.
- Impact: Medium.
- Mitigation: mensaje humano + invalidate/refetch + UI estable.

### Risk 9: SignalR se convierte en state authority

- Probability: Medium.
- Impact: High.
- Mitigation: event → invalidate → REST.

### Risk 10: eventos perdidos durante reconnect

- Probability: Medium.
- Impact: High.
- Mitigation: invalidate Orders + Kitchen tras reconnect.

### Risk 11: outage realtime deja KDS obsoleto

- Probability: Medium.
- Impact: High.
- Mitigation: polling fallback ~30s mientras reconnecting/disconnected.

### Risk 12: fallback continúa con SignalR Connected

- Probability: Medium.
- Impact: Medium.
- Mitigation: refetchInterval dependiente explícitamente del connection state.

### Risk 13: ElapsedTime genera tráfico

- Probability: Medium.
- Impact: Medium.
- Mitigation: componente puramente local.

### Risk 14: timer drift

- Probability: High.
- Impact: Medium.
- Mitigation: recalcular desde Date.now cada tick.

### Risk 15: conexión SignalR por card

- Probability: Medium.
- Impact: High.
- Mitigation: único owner/provider/adapter de conexión.

### Risk 16: SignalR persiste JWT

- Probability: Medium.
- Impact: Critical.
- Mitigation: accessTokenFactory usa token actual de session coordinator in-memory.

### Risk 17: KDS MESERO permite mutaciones

- Probability: Medium.
- Impact: High.
- Mitigation: capability derivada de roles + tests.

### Risk 18: assignment usa Employee arbitrario

- Probability: Medium.
- Impact: High.
- Mitigation: Users API filtrada por MESERO/active y employeeId contractual.

### Risk 19: race Take muestra ganador incorrecto

- Probability: Medium.
- Impact: High.
- Mitigation: no optimistic state; 409 refetch.

### Risk 20: cart envía Product duplicado

- Probability: Medium.
- Impact: High.
- Mitigation: state keyed por productId.

### Risk 21: draft total diverge del server

- Probability: Medium.
- Impact: Medium.
- Mitigation: draft total es solo visual; después de Create manda OrderDto.total.

### Risk 22: KDS pageSize oculta commands

- Probability: Medium.
- Impact: High.
- Mitigation: verificar totalPages y ofrecer Load More.

### Risk 23: modificar shell rompe HU-001/HU-002

- Probability: Medium.
- Impact: High.
- Mitigation: extensión mínima y regresión de `/inicio` + `/usuarios`.

## Rollback Strategy

El frontend change no debe requerir migraciones.

Rollback funcional:

- retirar Orders/Kitchen routes;
- retirar navigation items;
- retirar feature modules;
- retirar Kitchen SignalR integration;
- retirar generated contract únicamente junto con una baseline backend compatible.

No tocar:

- backend Orders ya persistidos;
- sesiones;
- cookies;
- Identity;
- HU-001/HU-002.

Una reversión frontend no debe alterar datos backend.

## Success Criteria

- Backend prerequisite comprobado.
- ZIP visual completo auditado antes de freeze visual.
- OpenAPI auditado.
- `pnpm run api:generate` funciona.
- generated types se usan sin edición manual.
- las cuatro rutas funcionan.
- matriz de roles funciona.
- navegación central funciona.
- Orders list funciona con búsqueda/filtros/paginación backend.
- New Order funciona.
- carrito consolida ProductId.
- Create usa backend contract real.
- Order Detail es read-only.
- assignment/take/cancel/deliver funcionan.
- KDS operational/read-only funciona.
- timers locales funcionan sin requests.
- SignalR/reconnect funcionan.
- polling fallback funciona únicamente sin realtime saludable.
- race 409 produce feedback + refetch.
- responsive 360/403/desktop es usable.
- accessibility básica cumple.
- tests PASS.
- format/typecheck/lint/build PASS.
- manual validation preparada.
- las HU solo se marcan end-to-end completas tras validación manual real.
