# Proposal

## Problem Statement

El change único `implement-hu-005-020-inventory-and-expenses-frontend` debe completar el frontend de dos capabilities independientes ya definidas por backend:

- HU-005 — Gestionar entradas y salidas de inventario.
- HU-020 — Registrar gastos.

Ruta OpenSpec obligatoria:

`docs/openspec/changes/implement-hu-005-020-inventory-and-expenses-frontend/`

Rama futura prevista:

`feature/hu-005-020-inventory-expenses-frontend`

Aunque ambas HU se entregan en un solo change, Inventory y Expenses deben conservar límites separados en:

- features;
- API adapters;
- query keys;
- hooks;
- components;
- pages;
- tests;
- specs;
- documentación.

### Baseline auditada durante este briefing

La vista pública actual de `develop` confirma una foundation frontend con:

- React 19;
- TypeScript;
- Vite;
- Tailwind CSS;
- React Router;
- TanStack Query;
- Lucide;
- Vitest/Testing Library;
- `openapi-typescript`;
- `vite-plugin-svgr`;
- `pnpm`;
- script `api:generate`. citeturn418096view0

El routing visible ya reutiliza:

- `RequireAuth`;
- `RequireAnyRole`;
- `AuthenticatedLayout`;
- `ForbiddenPage`;
- `AuthProvider`. citeturn418096view1

La navegación autenticada visible ya está centralizada, utiliza `allowedRoles` y contiene módulos de Sprint 1 como Pedidos, Cocina, Usuarios y Proveedores. Esto confirma que Inventory/Expenses deben integrarse mediante la configuración existente, no mediante un nuevo sistema global de navegación. citeturn293544view0

El endpoint registry actual ya centraliza Auth, Attendance, Orders, Kitchen y otras capabilities; por tanto Inventory y Expenses deben añadirse al mismo patrón. citeturn293544view1

El `httpClient` existente ya integra el `sessionCoordinator`, `HttpError` y ProblemDetails, por lo que este change no debe crear transporte ni autenticación paralelos. citeturn293544view2

### Precondición backend

La vista pública de `develop` disponible durante esta auditoría todavía NO expone en `Program.cs`:

- `/api/v1/inventory/balances`;
- `/api/v1/inventory/movements`;
- `/api/v1/expense-categories`;
- `/api/v1/expenses`.

El generated contract visible tampoco contiene los DTOs Inventory/Expense esperados. citeturn655971view0 citeturn655971view4 citeturn655971view5

Esto no autoriza a rediseñar ni implementar backend desde este change. La futura sesión APPLY debe auditar el `develop` local real y proceder únicamente si el backend `implement-hu-005-020-inventory-and-expenses-backend` ya está integrado y OpenAPI contiene el contrato aprobado.

Si esos endpoints continúan ausentes en la baseline local real, clasificar:

`BASELINE_CONTRACT_BLOCKER`

y no inventar DTOs, endpoints ni mock contracts productivos.

### Estado de auditoría visual

Se recibieron los adjuntos:

- `HU-005.zip`
- `HU-020.zip`

y el prompt enumera diez referencias obligatorias:

1. `Inventario - Existencias Desktop.png`
2. `Inventario - Movimientos Desktop.png`
3. `Estados de Inventario.png`
4. `Modales de Inventario.png`
5. `Inventario - Existencias Móvil.png`
6. `Productos - Catálogo Unificado Desktop.png`
7. `Gastos - Registrar (Desktop).png`
8. `Gastos - Historial (Desktop).png`
9. `Gastos - Mobile View.png`
10. `Gastos - Estados y Feedback.png`

Limitación verificable de esta sesión:

los ZIP están adjuntos, pero las herramientas disponibles no permiten abrir ni visualizar sus PNG internos. Por tanto no es correcto afirmar una inspección visual pixel-level ya realizada.

Las decisiones KEEP/ADAPT/OMIT/DEFER incluidas en este briefing se derivan de:

- los elementos visuales descritos explícitamente por el usuario;
- las decisiones humanas congeladas;
- el contrato funcional solicitado.

Antes de implementar presentación, la futura sesión MUST abrir las diez imágenes reales y completar la auditoría visual detallada. No debe volver a consultar decisiones funcionales ya congeladas.

## Goals

### Shared

- Auditar el `develop` local real antes de editar.
- Auditar OpenAPI runtime real.
- Ejecutar el comando real de generación de tipos.
- Regenerar `frontend/src/types/api.generated.ts`.
- No editar generated types manualmente.
- Reutilizar shared `httpClient`.
- Reutilizar AuthProvider/session coordinator.
- Reutilizar QueryClient.
- Reutilizar route guards.
- Reutilizar AppShell/navegación existente.
- Reutilizar UI Kit/Tailwind/Lucide.
- Mantener Inventory y Expenses separadas.

### Inventory

- Crear `/inventario`.
- Crear `/inventario/movimientos`.
- Aplicar guards distintos según permisos.
- Mostrar existencias paginadas desde backend.
- Implementar search server-side.
- Implementar ProductType filter server-side.
- Mostrar ProductType con labels españoles.
- Mostrar current quantity y unit.
- Mostrar MinStock.
- Mostrar estado derivado:
  - Saldo negativo;
  - Stock bajo;
  - Normal.
- Priorizar visualmente Saldo negativo sobre Stock bajo.
- Implementar polling REST aproximadamente cada 30 segundos.
- Implementar manual refresh.
- Implementar `Registrar entrada`.
- Implementar `Registrar baja`.
- Permitir cantidades decimales.
- Mostrar unit read-only.
- Exigir reason.
- Mostrar warning de saldo insuficiente sin bloquear WRITE_OFF.
- Implementar historial para ADMINISTRADOR/ENCARGADO.
- Mostrar todos los movement types del contrato en history.
- Mantener ledger read-only.
- No implementar MinStock editing.
- Documentar futura Configuración de alertas como DEFERRED.

### Expenses

- Crear `/gastos`.
- Permitir únicamente ADMINISTRADOR/ENCARGADO.
- Implementar formulario de registro.
- Consumir categorías activas.
- Mantener category optional.
- Permitir registrar sin categorías disponibles.
- Permitir continuar si la carga de categorías falla.
- Implementar amount en BOB.
- Implementar CashSource:
  - CASH_DRAWER → Caja principal;
  - PETTY_CASH → Caja chica.
- No seleccionar CashSource por defecto.
- Implementar business date Bolivia.
- Permitir pasado/hoy.
- Evitar futuro.
- Implementar description.
- No enviar actor.
- No enviar Shift.
- Mostrar success confirmation persistente.
- Implementar `Registrar otro gasto`.
- Evitar double submit.
- No implementar historial/HU-021.

### Delivery

- Responsive desktop/403px/360px.
- Accessibility.
- Tests.
- Quality gates.
- Manual validation plan.
- HU/documentation update.
- Endpoint-consumption handoff.
- Complete file manifest.

## Non-Goals

### Inventory

- Product CRUD.
- Crear/editar Product.
- Configurar MinStock.
- HU-006.
- Alert center.
- Notifications.
- Email alerts.
- SignalR.
- WebSocket.
- Low-stock server filter inventado.
- Negative-stock server filter inventado.
- Aggregate cards calculados desde una página parcial.
- Export report.
- CSV.
- Movement edit/delete.
- Manual ADJUSTMENT.
- Purchase/Production/Sale integration.
- Stock conversion.
- Unit selector.
- Warehouse/multi-location.
- Fake SKU.

### Expenses

- HU-021.
- Expense history.
- Expense search.
- Expense filters.
- Expense list.
- Expense edit/delete.
- Category CRUD.
- Shift UI.
- Shift selector.
- Cash balance.
- CashSession.
- Expense metrics.
- Gastos hoy.
- Último gasto.
- Export.
- Offline/cloud sync.
- Fake categories.

### Cross-cutting

- Backend changes, salvo un verdadero `BASELINE_CONTRACT_BLOCKER`.
- Global navigation redesign.
- New sidebar architecture.
- New global mobile bottom-nav.
- AppShell redesign.
- SignalR.
- JWT changes.
- New auth stack.
- Second HTTP client.
- Second QueryClient.
- Git mutations.
- APPLY/VERIFY/ARCHIVE durante esta etapa.

## Affected Areas

### Generated

- `frontend/src/types/api.generated.ts`.

### Shared frontend foundation

- endpoint registry;
- route registration;
- authenticated navigation, solo integración mínima;
- shared date/format utility si ya existe o si resulta reusable;
- no cambio conceptual a auth/http/query foundations.

### Inventory capability

Áreas probables:

- feature Inventory;
- balances page;
- movements page;
- query keys;
- API adapters;
- balance table/cards;
- filters;
- entry/write-off dialogs;
- Product selector;
- polling;
- tests.

### Expenses capability

Áreas probables:

- feature Expenses;
- registration page;
- categories query;
- form;
- success confirmation;
- date utility integration;
- tests.

### Documentation

- HU-005.
- HU-020.
- frontend handoff.
- visual audit/reconciliation.
- OpenSpec.
- file manifest.

## Assumptions

### Assumption 1 — backend integrado antes de APPLY

El futuro `develop` local contendrá los cinco endpoints backend requeridos.

Si no ocurre, se activa `BASELINE_CONTRACT_BLOCKER`.

### Assumption 2 — generated contract será autoridad

Los nombres concretos de:

- DTO;
- enum;
- request;
- PagedResponse;
- query params;

se adaptarán al OpenAPI final.

### Assumption 3 — scripts actuales se mantienen

Actualmente el frontend dispone de:

- `api:generate`;
- `format:check`;
- `typecheck`;
- `lint`;
- `test`;
- `build`. citeturn418096view0

APPLY debe revalidar sus nombres antes de usarlos.

### Assumption 4 — navegación transversal definitiva permanece futura

Este change solo registrará rutas funcionales y la integración mínima necesaria. No anticipará el futuro change transversal de sidebar/mobile/global routing.

## Risks

### Risk 1: backend no integrado al comenzar

- Probability: Medium/High según vista pública actual.
- Impact: Critical.
- Mitigation: baseline gate antes de generated types o feature implementation.

### Risk 2: generated contract difiere del briefing conceptual

- Probability: Medium.
- Impact: High.
- Mitigation: OpenAPI real manda en shapes/naming; decisiones funcionales congeladas permanecen.

### Risk 3: ZIP no auditado visualmente en esta sesión

- Probability: Certain.
- Impact: High en fidelity.
- Mitigation: Task inicial obligatoria de inspección de las diez imágenes antes de presentation implementation.

### Risk 4: screenshots expanden HU-005 hacia HU-006

- Probability: High.
- Impact: High.
- Mitigation: MinStock editing/configuration siempre DEFER.

### Risk 5: screenshots expanden HU-020 hacia HU-021

- Probability: High.
- Impact: High.
- Mitigation: history/search/metrics/export siempre DEFER/OMIT.

### Risk 6: métricas falsas desde página actual

- Probability: Medium.
- Impact: High.
- Mitigation: no aggregate cards si API no ofrece aggregates.

### Risk 7: local filtering de Stock bajo incompleto

- Probability: Medium.
- Impact: High.
- Mitigation: omitir filtro si backend no lo soporta server-side.

### Risk 8: local filtering de negativos incompleto

- Probability: Medium.
- Impact: High.
- Mitigation: omitir filtro.

### Risk 9: polling genera UI flicker

- Probability: Medium.
- Impact: Medium.
- Mitigation: conservar previous data durante background refetch.

### Risk 10: polling queda vivo tras unmount

- Probability: Low/Medium.
- Impact: Medium.
- Mitigation: usar lifecycle de TanStack Query, no interval manual global.

### Risk 11: mutation espera polling para actualizar

- Probability: Medium.
- Impact: High.
- Mitigation: invalidate/refetch inmediatamente tras mutation.

### Risk 12: optimistic stock contradice backend concurrente

- Probability: Medium.
- Impact: High.
- Mitigation: no optimistic balance mutation.

### Risk 13: write-off > stock bloqueado localmente

- Probability: Medium.
- Impact: Critical funcional.
- Mitigation: warning-only; confirm permanece disponible.

### Risk 14: decimal quantity truncada

- Probability: Medium.
- Impact: High.
- Mitigation: decimal input compatible con 4 decimales; no integer stepper exclusivo.

### Risk 15: Product selector solo muestra primera página

- Probability: Medium.
- Impact: High.
- Mitigation: search + pagination/load-more hasta cubrir resultados.

### Risk 16: inactive movement history ocultado

- Probability: Medium.
- Impact: Medium.
- Mitigation: history consume backend completo; Product selector activo no restringe resultados sin filtro.

### Risk 17: category error bloquea Expense

- Probability: Medium.
- Impact: High.
- Mitigation: category optional; fallback `Sin categoría`; error no bloqueante.

### Risk 18: CashSource preseleccionado accidentalmente

- Probability: Medium.
- Impact: High.
- Mitigation: no default.

### Risk 19: UTC produce día incorrecto en Expense

- Probability: Medium.
- Impact: High.
- Mitigation: business date `America/La_Paz`.

### Risk 20: success afirma que caja fue actualizada

- Probability: High por mockup.
- Impact: High.
- Mitigation: copy adaptado explícitamente.

### Risk 21: double submit crea dos Expenses

- Probability: Medium.
- Impact: High.
- Mitigation: submit disabled while mutation pending.

### Risk 22: cambio de navegación invade trabajo transversal

- Probability: Medium.
- Impact: Medium.
- Mitigation: routes + mínima registry integration; sin shell redesign.

## Rollback Strategy

El change frontend no debe alterar persistencia backend.

Rollback puede:

- retirar `/inventario`;
- retirar `/inventario/movimientos`;
- retirar `/gastos`;
- retirar navigation registrations mínimos;
- retirar features Inventory/Expenses;
- retirar generated contract solo junto con baseline OpenAPI compatible.

No debe:

- revertir InventoryMovement ya registrado;
- revertir Expense ya creado;
- modificar backend;
- alterar auth;
- alterar Orders/Kitchen;
- borrar cache persistente porque no debe existir cache persistente de negocio.

## Success Criteria

- OpenAPI backend auditado.
- Generated types regenerados.
- `/inventario` funcional.
- `/inventario/movimientos` funcional.
- `/gastos` funcional.
- role matrix correcta.
- Inventory polling ~30s.
- no SignalR.
- balances server-driven.
- low-stock/negative presentation correcta.
- no fake global metrics.
- ENTRY funciona.
- WRITE_OFF funciona.
- insufficient-stock warning no bloquea.
- history funciona.
- Expenses category optional.
- category failure no bloquea.
- CashSource explícito.
- business date Bolivia.
- success confirmation correcta.
- no History/HU-021.
- responsive 360/403/desktop.
- tests PASS.
- quality gates PASS.
- manual evidence no fabricada.
