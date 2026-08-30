# Tasks — HU-006

## Estado final: PASS / end-to-end

- [x] Task 1: baseline local revalidada.
- [x] Task 2: contrato Case B congelado: un único Summary.
- [x] Task 3: DTO Summary y operación de lectura añadidos.
- [x] Task 4: agregación global activa implementada.
- [x] Task 5: única ruta `GET /api/v1/inventory/summary` mapeada con `InventoryRead`.
- [x] Task 6: regresiones PostgreSQL/Testcontainers de semántica, alcance, autorización y lectura sin mutación.
- [x] Task 7: gate backend Release PASS: 58/58 (1 domain, 1 application, 56 integration); Release publish PASS.
- [x] Task 8: OpenAPI runtime y TypeScript generado sincronizados.
- [x] Task 9: query Summary con shared client y TanStack Query integrada.
- [x] Task 10: pestaña Notificaciones integrada en Inventory.
- [x] Task 11: alerta global y cuatro tarjetas Summary añadidas.
- [x] Task 12: tarjetas derivadas de Notificaciones, empty/loading/error/retry implementados y cubiertos automáticamente.
- [x] Task 13: filtro Stock bajo respaldado por el conjunto Summary completo, incluidos negativos y paging cliente.
- [x] Task 14: refresh refetches balances y Summary sin borrar balances válidos.
- [x] Task 15: grid/tarjetas responsive y semántica de tabs implementados.
- [x] Task 16: matriz frontend de comportamiento, roles y guard completada; suite completa: 68 tests.
- [x] Task 17: scoped Prettier, typecheck, lint y build frontend PASS. El formato global queda bloqueado solo por 17 archivos históricos sin tocar.
- [x] Task 18: evidencia visual manual incorporada: desktop Existencias, layout estrecho/móvil de Summary y Notificaciones. Su alcance se limita a lo visible en las tres capturas; semántica negativa, autorización y error/retry siguen respaldados por evidencia automatizada.
- [x] Task 19: HU-006, handoff y evidencia real reconciliados.
- [x] Task 20: auditoría final: una ruta aditiva, cero migraciones, cero persistencia de notificaciones, cero segunda UI MinStock y cero rupturas de rutas Inventory existentes.

## Cierre

El change queda **cerrado in situ** en `docs/openspec/changes/implement-hu-006-low-stock-visibility-and-summary/`. El repositorio no dispone de directorio de archive ni de un comando de archive documentado; no se inventó ni ejecutó un movimiento de archivo.

## Historial útil supersedido

Las referencias previas a validación visual pendiente, 67 tests o matriz frontend incompleta quedan supersedidas por este cierre y por `verify-report.md`.
