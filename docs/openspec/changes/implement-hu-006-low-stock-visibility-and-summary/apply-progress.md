# Apply progress — HU-006

## Estado final: PASS / end-to-end

HU-006 está implementada y cerrada: añade el único endpoint `GET /api/v1/inventory/summary` con `InventoryRead`, el contrato Summary, agregación global de productos activos y el consumidor frontend de `/inventario` con tarjetas, alerta, filtro Stock bajo y Notificaciones.

## Reglas entregadas

- Un producto sin balance materializado cuenta como `0`; el Summary usa el mismo alcance activo de Inventory.
- Stock bajo significa saldo negativo o cantidad menor o igual al mínimo configurado. Negativos es subconjunto de Stock bajo y su cantidad permanece negativa.
- Los conteos son de productos: `normalStockCount = totalProducts - lowStockCount`.
- No se añadieron migraciones, persistencia de notificaciones, segunda UI MinStock, cambios de escritura Inventory ni endpoints Inventory adicionales.

## Evidencia verificada

| Área                                          | Resultado                                             |
| --------------------------------------------- | ----------------------------------------------------- |
| Release publish                               | PASS                                                  |
| Backend Release                               | PASS: 58/58 (1 domain, 1 application, 56 integration) |
| PostgreSQL Testcontainers                     | PASS                                                  |
| OpenAPI runtime y TypeScript generado         | PASS y sincronizados                                  |
| Frontend scoped Prettier/typecheck/lint/build | PASS                                                  |
| Frontend                                      | PASS: 68 tests                                        |
| Formato global frontend                       | Bloqueado solo por 17 archivos históricos sin tocar   |

La evidencia automatizada confirma anónimo `401`, ADMINISTRADOR/ENCARGADO/MESERO/COCINA/CONTADORA `200`, EMPLEADO-only `403`, semántica global de conteos, negativos, igualdad/bajo mínimo, balance ausente, alcance activo, no mutación de GET, y estados frontend de error/retry. Las capturas no se usan para probar esas propiedades.

## Evidencia visual manual incorporada

- `docs/capturas/HU-006-low-stock.png`: Existencias desktop con tarjetas de resumen, alerta global de stock bajo, filtro Stock bajo y pestaña Notificaciones.
- `docs/capturas/HU-006-mobile-page.png`: layout estrecho/móvil de resumen, tarjetas y alerta de Inventory.
- `docs/capturas/HU-006-notifications.png`: pestaña Notificaciones y tarjetas de stock bajo.

Las capturas documentan únicamente esas superficies visibles; no afirman estado negativo, error/retry, matriz de roles, comportamiento de teclado ni viewport exacto.

## Cierre de artefactos

El change permanece cerrado in situ en `docs/openspec/changes/implement-hu-006-low-stock-visibility-and-summary/`. No existe directorio de archive ni comando de archive documentado en el repositorio, por lo que no se inventó ni realizó un archive.

## Historial supersedido

Los bloqueos anteriores por Docker/Testcontainers, matriz frontend incompleta, validación visual pendiente o conteos frontend anteriores quedan supersedidos por la evidencia final anterior.
