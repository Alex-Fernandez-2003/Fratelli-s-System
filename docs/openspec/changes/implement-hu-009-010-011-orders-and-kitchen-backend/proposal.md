# Proposal

## Change Identity

- Change: `implement-hu-009-010-011-orders-and-kitchen-backend`
- Proyecto: Restaurant System — Fratelli
- Baseline obligatoria: rama `develop` actual
- Ruta OpenSpec: `docs/openspec/changes/implement-hu-009-010-011-orders-and-kitchen-backend/`
- Rama futura prevista: `feature/hu-009-010-011-orders-kitchen-backend`
- Naturaleza: backend-only
- Historias incluidas:
  - HU-009 — Registrar y gestionar pedidos
  - HU-010 — Generar y gestionar comandas de cocina
  - HU-011 — Cancelar pedido antes de que esté listo
- Resultado documental esperado:
  - `BACKEND_COMPLETE`
  - frontend pendiente para las tres historias
- Número de changes: uno

## Problem Statement

La rama `develop` ya contiene la foundation funcional necesaria para comenzar EPI-04: autenticación/Identity, roles, User ↔ Employee, catálogo, proveedores, asistencia, PostgreSQL, EF Core, ProblemDetails, OpenAPI, SignalR y tests. Sin embargo, la auditoría actual no muestra entidades o módulos materializados para `Order`, `OrderItem`, `KitchenCommand`, `KitchenCommandItem` ni `Shift`; tampoco aparece una foundation de inventario que deba integrarse con la creación de pedidos. :contentReference[oaicite:0]{index=0}

El modelo real sí dispone de `Product`, `Employee` y `UserSession`. `Employee` utiliza un identificador de dominio separado y mantiene vínculo con el User Identity, preservando la regla `User != Employee`. :contentReference[oaicite:1]{index=1}

Las tres historias forman un único flujo transaccional:

    Order
       ↓
    OrderItems
       ↓
    KITCHEN lines?
       ├─ no  → Order LISTO
       └─ yes → KitchenCommand PENDIENTE
                    ↓
                 Cocina
                    ↓
               EN_PREPARACION
                    ↓
                  LISTA
                    ↓
               Order LISTO
                    ↓
                 entrega

La consistencia entre pedido y comanda no puede dejarse a llamadas independientes. Las transiciones culinarias, cancelaciones y asignaciones requieren transacciones y control de concurrencia PostgreSQL real.

La documentación vigente confirma como baseline histórica los estados de Order y KitchenCommand, el vínculo Order 1 → 0..1 KitchenCommand, el uso de productos `KITCHEN` para la comanda, el snapshot de precio y la necesidad de que REST siga siendo la fuente de verdad frente a SignalR. :contentReference[oaicite:2]{index=2}

Este change debe materializar todo ese backend sin adelantar HU-012, HU-025 ni el frontend de EPI-04.

## Executive Summary

El change implementará un backend completo de pedidos y cocina con las siguientes decisiones cerradas:

- Order tendrá exactamente:
  - `PENDIENTE`
  - `EN_PREPARACION`
  - `LISTO`
  - `ENTREGADO`
  - `CANCELADO`.
- KitchenCommand tendrá exactamente:
  - `PENDIENTE`
  - `EN_PREPARACION`
  - `LISTA`
  - `CANCELADA`.
- Un Order con al menos una línea `KITCHEN`:
  - nace `PENDIENTE`;
  - crea una única KitchenCommand `PENDIENTE`;
  - la comanda contiene exclusivamente líneas `KITCHEN`.
- Un Order sin líneas `KITCHEN`:
  - no crea KitchenCommand;
  - nace directamente `LISTO`.
- BAR/NONE no tendrá flujo separado.
- La comanda gobierna los estados culinarios globales del pedido cuando existe.
- No existirán endpoints manuales de `Order/start-preparation` ni `Order/ready`; esas transiciones ocurren exclusivamente mediante KitchenCommand.
- Crear pedido no descuenta inventario.
- No se crea Sale.
- No se crea Customer relation.
- Si Shift no existe realmente en `develop`, `Order.ShiftId` será temporalmente nullable y sin fake Shift.
- Un producto repetido dentro del mismo pedido será inválido; una línea por `productId`.
- Precio y total nunca llegan desde frontend:
  - backend toma `Product.SalePrice`;
  - `OrderItem.UnitPrice` guarda snapshot;
  - `lineTotal` y `total` se calculan en read model.
- MESERO ve todos los pedidos, pero solo puede mutar los propios salvo `take`.
- ADMINISTRADOR asigna/reasigna responsables.
- MESERO puede tomar atómicamente un pedido sin responsable.
- ENCARGADO no obtiene assignment administrativo salvo que también tenga ADMINISTRADOR.
- Cocina gestiona KitchenCommand por REST.
- Cancelar desde KitchenCommand cancela también Order en la misma transacción.
- Cancelar Order cancela KitchenCommand cuando corresponda.
- Row locking garantiza consistencia en races.
- SignalR `/hubs/kitchen` publica solo después de commit.
- REST continúa siendo la fuente autoritativa.
- SignalR failure post-commit no revierte la operación persistida.
- Frontend y TypeScript generated types quedan fuera.

## Repository Audit Mandate

La futura sesión de APPLY MUST comenzar con un preflight exclusivamente de lectura antes de editar.

### Git

Debe registrar:

- rama real actual;
- commit/HEAD exacto de `develop`;
- `git status`;
- archivos untracked/modificados si los hubiera;
- último migration aplicado/versionado;
- si la rama futura de implementación ya fue preparada externamente.

No debe asumir que un working tree proveniente de otra feature equivale a `develop`.

El briefing no autoriza:

- checkout;
- reset;
- restore;
- clean;
- merge;
- commit;
- push;
- PR;
- cualquier otra mutación Git.

### Backend

Debe inspeccionar en el árbol local real:

- `RestaurantSystem.slnx`;
- Domain;
- Application;
- Infrastructure;
- Api;
- test projects;
- `ApplicationDbContext`;
- Identity;
- Employee;
- UserSession;
- Product;
- current Product contracts;
- roles/constants;
- policies;
- ProblemDetails;
- OpenAPI;
- pagination abstractions;
- current migrations + snapshot;
- DevelopmentDataSeeder;
- SignalR;
- notifier pattern;
- PostgreSQL integration fixtures.

La auditoría web actual confirma que `Domain` y `Application` están organizados alrededor de Attendance, Auth/Catalog/Suppliers/Identity existentes, sin módulo Orders/Kitchen materializado. :contentReference[oaicite:3]{index=3}

La auditoría web de `ApplicationDbContext` confirma DbSets actuales para Employee, UserSession, Categories, Units, Products, Suppliers y AttendanceRecords, sin Order/Kitchen/Shift en el modelo observado. :contentReference[oaicite:4]{index=4}

### Migration baseline

Las vistas web consultadas no son suficientemente fiables para fijar el número/nombre exacto de migrations actuales: algunas vistas de GitHub muestran información inconsistente con el `DbContext` funcional observado.

Por tanto, antes de generar la nueva migration, APPLY MUST verificar localmente:

- migrations directory;
- model snapshot;
- `dotnet ef migrations list`;
- schema actual sobre una DB descartable.

Esto es un preflight técnico normal, NO un blocker humano.

### Product compatibility

La auditoría actual muestra `Product` con:

- `Name`;
- `ProductType`;
- `CategoryId`;
- `InventoryUnitId`;
- `PreparationArea`;
- `SalePrice`;
- `MinStock`;
- `IsActive`;
- auditoría.

No se observó `IsSellable` en la entidad materializada consultada, aunque la baseline documental sí contempla ese concepto. :contentReference[oaicite:5]{index=5}

Dado que este change exige expresamente `isActive + isSellable + salePrice != null`, APPLY MUST:

1. volver a verificar `Product` en el `develop` local;
2. si `IsSellable` ya fue incorporado, reutilizarlo;
3. si continúa ausente, añadir la mínima evolución de catálogo necesaria:
   - propiedad persistente `IsSellable`;
   - default seguro `false`;
   - mapping/migration;
   - DTO/request backend de Product ajustado para que el catálogo pueda configurar el valor;
   - tests pertinentes;
4. NO reconstruir HU-003;
5. NO añadir frontend HU-003;
6. NO regenerar TypeScript en este backend change.

La lógica de Orders MUST rechazar cualquier Product que no pueda demostrarse como vendible.

### Preparation area compatibility

La implementation actual observada representa `PreparationArea` de Product como dato string nullable, mientras la documentación define `KITCHEN`, `BAR`, `NONE`. :contentReference[oaicite:6]{index=6}

Para este change:

- Orders MUST reconocer exclusivamente `KITCHEN`, `BAR`, `NONE`;
- Product con valor nulo/desconocido MUST ser no-orderable hasta corregirse;
- no es obligatorio refactorizar todo Catalog a enum;
- la nueva migration MAY añadir una defensa CHECK compatible con datos legacy;
- no debe inventarse un valor para filas legacy nulas.

## Source Documentation / Traceability

### Historias

| Historia | Capacidad                              |
| -------- | -------------------------------------- |
| HU-009   | Registrar y gestionar pedidos          |
| HU-010   | Generar y gestionar comandas de cocina |
| HU-011   | Cancelar pedido antes de estar listo   |

El backlog vigente vincula HU-009 con RF-025/RF-026, HU-010 con RF-028/RF-029/RF-030 y HU-011 con la cancelación antes de listo. :contentReference[oaicite:7]{index=7}

### Requisitos funcionales

- RF-025 — registro de pedido.
- RF-026 — gestión de estado del pedido.
- RF-027 — cancelación antes de listo.
- RF-028 — generación de comanda.
- RF-029 — gestión de estado de comanda.
- RF-030 — consulta de comandas. :contentReference[oaicite:8]{index=8}

### Reglas

- RN-001 define estados de Order.
- RN-002 define estados de KitchenCommand.
- RN-003 restringe cancelación a estados previos a listo. :contentReference[oaicite:9]{index=9}

### Reconciliación explícita

La documentación histórica indica de forma general que un pedido nuevo nace `PENDIENTE`.

La decisión humana de este change refina esa regla:

- con KITCHEN → `PENDIENTE`;
- sin KITCHEN → `LISTO`.

Esta decisión tiene precedencia y NO debe reabrirse durante APPLY.

### RNF

- RNF-CON-003 exige impedir estados/transiciones inválidos.
- RNF-USA-003/RNF-USA-004 son principalmente observabilidad/confirmación frontend; este backend debe exponer contratos y errores suficientes para que el siguiente change los implemente. :contentReference[oaicite:10]{index=10}

## Goals

- Materializar Order, OrderItem, KitchenCommand y KitchenCommandItem.
- Crear una migration nueva y coherente.
- Implementar create/read/list/assignment/take/deliver/cancel de Orders.
- Implementar list/detail/start/ready/cancel de KitchenCommands.
- Implementar state machines exactas.
- Hacer atómica la sincronización Order ↔ KitchenCommand.
- Hacer atómica la asignación/toma.
- Hacer concurrency-safe las mutaciones críticas mediante row locking.
- Crear KitchenCommand solo para órdenes con líneas KITCHEN.
- Mantener BAR/NONE fuera de KitchenCommand.
- Guardar snapshot del precio.
- No persistir total de pedido.
- No crear movimientos de inventario.
- Reutilizar User/Employee correctamente.
- Resolver Shift de forma condicional sin ampliar HU-025.
- Exponer contracts REST suficientes para el frontend futuro.
- Reutilizar ProblemDetails.
- Implementar SignalR Kitchen post-commit.
- Implementar PostgreSQL integration tests reales.
- Ejecutar regresión de todos los test projects backend.
- Documentar las tres historias como backend-complete/frontend-pending.

## Non-Goals

- Frontend de pedidos.
- KDS frontend.
- TanStack Query Orders.
- `api.generated.ts`.
- Customer en Order.
- Sale.
- SaleItem.
- Payment.
- Cash.
- QR.
- Factura.
- Stock decrement.
- Inventory movement.
- Stock reservation.
- HU-012.
- HU-013.
- HU-025.
- Shift lifecycle.
- CashSession.
- Fake Shift.
- Seed de órdenes.
- Editar contenido de Order después de crear.
- Agregar/quitar líneas.
- Cambiar quantity.
- Cambiar notes.
- Cambiar table reference.
- Split/merge de pedido.
- Partial delivery.
- Per-item readiness.
- BAR KDS.
- Master table entity.
- Waiter unassign/release.
- Waiter-to-waiter reassignment.
- Generic status endpoint.
- Outbox.
- ETags.
- Idempotency-Key para Create.
- Frontend visual evidence de las HUs.

## Affected Areas

### Domain

- Orders.
- Kitchen.
- mínima evolución de Product únicamente si `IsSellable` continúa ausente.

### Application

- order contracts/services/use cases;
- kitchen contracts/services/use cases;
- actor/ownership resolution;
- notifier abstraction;
- read models/pagination.

### Infrastructure

- EF Core mappings;
- row-locking persistence;
- Product compatibility;
- migrations;
- notifier implementation si el patrón actual vive en Infrastructure.

### Api

- policies;
- REST mappings;
- ProblemDetails;
- OpenAPI metadata;
- KitchenHub.

### Tests

- Domain/Application tests;
- PostgreSQL IntegrationTests;
- SignalR notifier/hub tests;
- full regression.

### Documentation

- OpenSpec artifacts;
- HU-009;
- HU-010;
- HU-011;
- backend change file inventory.

## Assumptions

### Inferido: UnitPrice precision

El Product materializado observado usa `SalePrice` con precisión `decimal(18,2)`. Para evitar estrechar el valor al crear el snapshot, `OrderItem.unit_price` SHOULD usar también `numeric(18,2)`, aunque un documento conceptual anterior mostrara `numeric(12,2)`. :contentReference[oaicite:11]{index=11}

### Inferido: monetary calculation

`lineTotal` y `total` se calculan con `decimal` desde `quantity * unitPrice`.

Este change MUST NOT introducir una nueva regla de redondeo monetario adicional no definida. El frontend posterior podrá formatear BOB para presentación.

### Inferido: search de Orders

`search` se limita a `tableReference`.

No se añade waiter username/fullName al search inicial porque requeriría semántica adicional sin aportar una necesidad del MVP.

### Inferido: waiter eligibility

Un `waiterEmployeeId` asignable debe representar:

- Employee existente;
- Employee activo;
- User vinculado existente/activo;
- User con rol MESERO.

Un Employee que no cumpla esas condiciones no es un waiter elegible.

## Risks

### Risk 1: Order y KitchenCommand divergen

- Probability: High sin transaction.
- Impact: Critical.
- Mitigation: toda transición conjunta bloquea Order primero, Command después, revalida estados bajo lock y persiste en una sola transacción.

### Risk 2: Dos meseros toman el mismo pedido

- Probability: Medium.
- Impact: High.
- Mitigation: row lock de Order; primero que confirma gana; segundo relee assignment y recibe `409`.

### Risk 3: Ready compite con cancel

- Probability: Medium.
- Impact: Critical.
- Mitigation: lock ordering único Order → Command; la segunda operación revalida estado después de adquirir locks.

### Risk 4: SignalR anuncia algo que hizo rollback

- Probability: Medium.
- Impact: High.
- Mitigation: publicar únicamente después de commit.

### Risk 5: SignalR falla después de commit

- Probability: Medium.
- Impact: Medium.
- Mitigation: no revertir DB; registrar el fallo y devolver éxito de persistencia; REST sigue siendo fuente de verdad.

### Risk 6: Producto no vendible entra en pedido

- Probability: Medium.
- Impact: High.
- Mitigation: validar Product existe, activo, vendible y con SalePrice antes de crear cualquier línea.

### Risk 7: Product baseline carece de IsSellable

- Probability: High según auditoría web.
- Impact: High.
- Mitigation: evolución mínima cross-cutting del backend Catalog si el preflight local confirma la ausencia.

### Risk 8: Product PreparationArea tiene valores legacy inválidos

- Probability: Medium.
- Impact: High.
- Mitigation: Products nulos/desconocidos no pueden ordenarse hasta corregirse; no asignar KITCHEN silenciosamente.

### Risk 9: Snapshot de precio calculado desde input cliente

- Probability: Medium.
- Impact: Critical.
- Mitigation: Create request no tiene precio; backend consulta Product y persiste SalePrice.

### Risk 10: Create deja registros parciales

- Probability: Medium.
- Impact: Critical.
- Mitigation: Order + items + command + command items en una sola transacción.

### Risk 11: Shift inexistente expande scope a HU-025

- Probability: High según baseline auditada.
- Impact: High.
- Mitigation: `shift_id` nullable temporal; no seed ni fake Shift.

### Risk 12: Waiter ID/User ID mezclados

- Probability: Medium.
- Impact: High.
- Mitigation: waiter ownership usa EmployeeId; auditoría usa UserId autenticado.

### Risk 13: Ownership solo protegido en frontend

- Probability: Medium.
- Impact: Critical.
- Mitigation: Application vuelve a validar Employee del actor y assignment para cada mutation MESERO.

### Risk 14: Idempotent retry duplica eventos

- Probability: Medium.
- Impact: Medium.
- Mitigation: solo publicar cuando el estado realmente cambió.

### Risk 15: Estado terminal reasignado

- Probability: Medium.
- Impact: Medium.
- Mitigation: assignment/take rechazados en ENTREGADO/CANCELADO.

### Risk 16: No-KITCHEN Order no puede cancelarse

- Probability: Certain por decisiones congeladas.
- Impact: Product tradeoff conocido.
- Mitigation: documentar explícitamente que nace LISTO y RN-003 impide cancelarlo mediante HU-011; no inventar excepción.

### Risk 17: N+1 en read models

- Probability: Medium.
- Impact: Medium.
- Mitigation: queries proyectadas con joins/selects y paginación server-side.

### Risk 18: Deadlock por lock ordering inconsistente

- Probability: Medium.
- Impact: High.
- Mitigation: toda operación que toca ambos recursos bloquea siempre Order y luego KitchenCommand.

### Risk 19: Migration histórica modificada

- Probability: Low.
- Impact: Critical.
- Mitigation: nueva migration solamente; preflight local del snapshot.

### Risk 20: Tests pasan con provider incorrecto

- Probability: Medium.
- Impact: High.
- Mitigation: concurrency/transaction/constraint tests exclusivamente PostgreSQL real/disposable.

## Rollback Strategy

- No editar migrations históricas.
- La nueva migration debe poseer un `Down` razonable para una DB descartable sin datos operativos.
- Una vez existan Orders reales, NO ejecutar rollback destructivo que elimine tablas; preparar migration correctiva.
- El eventual `IsSellable` añadido a Product debe ser aditivo y default `false`.
- Revertir SignalR puede hacerse conservando REST/persistencia.
- Revertir Kitchen API no debe eliminar comandas ya persistidas.
- Revertir Orders API no debe borrar Orders.
- No restaurar estados automáticamente.
- No recrear eventos SignalR perdidos.
- No inventar rollback de Shift porque este change no implementa Shift.

## Success Criteria

- Order create transaccional funciona.
- KITCHEN/no-KITCHEN rule funciona.
- Price snapshots provienen del backend.
- Duplicate Product line es rechazada y además defendida por DB.
- Waiter auto-assignment funciona.
- Admin assignment funciona.
- Waiter take concurrent-safe funciona.
- Lists/details funcionan con paginación.
- Command start sincroniza Order.
- Command ready sincroniza Order.
- Order cancellation sincroniza Command.
- Kitchen cancellation sincroniza Order.
- Delivery funciona desde LISTO.
- Invalid transitions producen `409`.
- State-target retries son idempotentes sin eventos duplicados.
- SignalR publica post-commit.
- SignalR post-commit failure no corrompe estado DB.
- Authorization/ownership funcionan.
- No existe inventario decrement.
- No existe Sale.
- No existe fake Shift.
- PostgreSQL integration tests pasan.
- Todos los test projects backend pasan.
- Build pasa.
- OpenAPI representa REST.
- Las tres HU quedan documentadas:
  - `BACKEND COMPLETE`
  - `FRONTEND PENDING`.
