# Tasks

- [x] Task 1: Revalidar el develop local y congelar la matriz de auditoría

- Objective:
  Obtener la baseline local factual que gobierna este change antes de editar cualquier archivo.
- Files or areas likely involved:
  Git read-only; backend authorization configuration; API endpoint mappings; frontend routes/navigation/features; Sprint 2 HU documents; OpenSpec changes; tests.
- Execution notes:
  Registrar branch, HEAD, status y último commit. Enumerar cambios no commiteados. Comparar cada finding F-001..F-011 contra código local y marcarlo `CONFIRMED_IN_LOCAL_BASELINE`, `ALREADY_RESOLVED_IN_LOCAL_BASELINE` o `REMOTE_ONLY_STALE_FINDING`. Revalidar especialmente ProductManage, checkout reachability, Composition route, Production shell y COCINA Purchase qualifier. No modificar código en esta task.
- Verification method:
  Existe una matriz local firmemente trazable a paths/métodos reales, con HEAD/status registrados y cero findings remotos aplicados sin confirmación.
- Dependencies:
  None.

- [x] Task 2: Auditar endpoint por endpoint la matriz backend de Sprint 2

- Objective:
  Confirmar que cada capability congelada está protegida por la policy correcta y detectar únicamente divergencias reales.
- Files or areas likely involved:
  API authorization policy registration; Product/Inventory/Operations endpoint mappings; existing authorization integration tests.
- Execution notes:
  Mapear Products, Composition, MinStock, Inventory, Production, Sales, Purchases y Shifts. Registrar method, route, policy, roles reales y resultado esperado. Incluir los seis roles, anonymous y el qualifier COCINA en Purchase. Confirmar que ProductManage ya está restringido antes de tocarlo.
- Verification method:
  Tabla backend completa sin endpoints Sprint 2 sin clasificar; cada mismatch tiene path/policy exactos.
- Dependencies:
  Task 1.

- [x] Task 3: Corregir únicamente las divergencias backend de autorización confirmadas

- Objective:
  Alinear policies backend con la matriz final sin cambiar contratos HTTP ni business logic.
- Files or areas likely involved:
  Authorization policy registration y únicamente endpoint policy wiring que Task 2 confirme incorrecto.
- Execution notes:
  Si F-001 sigue presente, ampliar `InventoryHistory` a ADMINISTRADOR/ENCARGADO/MESERO/COCINA/CONTADORA, manteniendo `InventoryManage` exclusivo ADMIN/ENC. No tocar policies que ya coincidan. No cambiar ProductRead/ProductManage si el local ya está correcto. No debilitar Purchase scope COCINA.
- Verification method:
  Diff backend contiene exclusivamente ajustes de authorization necesarios; routes/verbs/DTOs/migrations permanecen sin cambios.
- Dependencies:
  Task 2.

- [x] Task 4: Consolidar la regresión backend de permisos

- Objective:
  Probar la matriz final en el backend y evitar que un futuro cambio de UI o policy vuelva a abrir permisos.
- Files or areas likely involved:
  Existing authorization-matrix PostgreSQL integration tests; Catalog/Inventory/Operations integration suites or actual equivalents.
- Execution notes:
  Preferir tests data-driven. Cubrir ProductManage, Composition read/manage, MinStock, Inventory read + mutation negative cases, Production, Sale, Purchase read/write, ShiftManage y OwnShift. Cubrir anonymous. Añadir un caso multi-role MESERO+ENCARGADO si la infraestructura de identities permite asignación múltiple.
- Verification method:
  Cada capability posee assertions explícitas de allowed/forbidden para la matriz relevante y ningún test existente es eliminado, debilitado o skipped.
- Dependencies:
  Task 3.

- [x] Task 5: Alinear las capabilities frontend y los route guards

- Objective:
  Hacer que frontend visibility y direct-route protection reflejen la misma matriz que backend.
- Files or areas likely involved:
  Central navigation/capability definitions; `AppRoutes` o equivalente; Purchase role constants; Shift role constants; Inventory role constants.
- Execution notes:
  Reutilizar `PURCHASE_READ_ROLES` para `/compras` y navigation; conservar WRITE roles en create/receive/actions. Definir/reutilizar OwnShift roles ADMIN/ENC/MES y aplicarlos a navigation + `/mi-turno`. Hacer `/inventario/movimientos` accesible a los cinco InventoryRead roles. Mantener unión vía `hasAnyRole`. Evitar role checks nuevos dispersos.
- Verification method:
  Una tabla frontend muestra capability → nav → route guard → action roles sin contradicciones; direct URL de roles no permitidos llega al patrón 403 existente.
- Dependencies:
  Tasks 1, 3.

- [x] Task 6: Proteger ProductManage y las acciones mutantes con regresiones frontend

- Objective:
  Cerrar el bug reportado de EMPLEADO sin introducir cambios innecesarios si ya está resuelto.
- Files or areas likely involved:
  Products feature; navigation capability helper; Product tests; route tests.
- Execution notes:
  Si el local ya restringe ProductManage a ADMIN/ENC, no refactorizar la feature: añadir/ajustar regression. Verificar Nuevo producto, Editar, Desactivar/activar y cualquier mutation real. EMPLEADO/MESERO/COCINA/CONTADORA no deben ver mutation controls. ProductRead se conserva independientemente.
- Verification method:
  Tests prueban ADMIN/ENC manage y cuatro role-only non-managers sin controls; backend tests de Task 4 demuestran que ocultar controles no es la única defensa.
- Dependencies:
  Task 5.

- [x] Task 7: Auditar y reparar únicamente la reachability Sprint 2 que siga rota

- Objective:
  Garantizar que toda feature implementada tenga un camino UI normal y direct-route protection coherente.
- Files or areas likely involved:
  AppRoutes; Products/Composition; Orders/Checkout; Production; Purchases; Inventory; Shifts; central navigation.
- Execution notes:
  Crear una route matrix real. Si `/productos/:id/composicion` sigue sin registrar, conectar la page HU-004 existente al path ya emitido por Products sin reimplementar Composition. Confirmar que checkout CTA ya existe y no tocarlo si está sano. Verificar Purchase detail/receive, Production, Inventory subviews y Shift flows. Usar UUIDs reales. Corregir solo rutas reproduciblemente rotas.
- Verification method:
  Para cada Sprint 2 workflow queda documentado entry point, route, allowed roles, direct URL y back/cancel behavior; ningún route saludable cambia de path.
- Dependencies:
  Tasks 1, 5.

- [x] Task 8: Eliminar cualquier shell global duplicado confirmado en Production

- Objective:
  Mantener una sola navegación/shell global sin rediseñar HU-007.
- Files or areas likely involved:
  Production page/layout y global authenticated layout.
- Execution notes:
  Ejecutar solo si el local mantiene el `AppShell` feature-owned observado públicamente dentro de `AuthenticatedLayout`. Retirar únicamente el wrapper global duplicado y conservar formulario, requirements, confirmación, success y estilos funcionales. Si ya está resuelto, marcar `ALREADY_RESOLVED`.
- Verification method:
  Production autorizada renderiza una sola sidebar/drawer/global main layout y conserva su flujo funcional.
- Dependencies:
  Tasks 1, 7.

- [x] Task 9: Unificar la navegación interna de Inventario

- Objective:
  Hacer coherentes Existencias, Movimientos y Notificaciones para todos los InventoryRead roles.
- Files or areas likely involved:
  Inventory pages/components and existing Inventory Query hooks.
- Execution notes:
  Reutilizar una única composición `InventoryNavigation` o equivalente. Debe exponer los tres destinos desde cualquiera de las vistas, marcar active state correctamente y dejar mutation buttons dependientes de ADMIN/ENC. Eliminar el nav hardcodeado de Movimientos únicamente si es reemplazado por la composición común.
- Verification method:
  Render tests de las tres vistas comprueban exactamente los tres destinos y su active state; MES/COC/CON pueden navegar Movimientos sin adquirir mutation actions.
- Dependencies:
  Task 5.

- [x] Task 10: Añadir el badge global de low stock a Notificaciones

- Objective:
  Mostrar el número global de Products low-stock sin crear una nueva notification capability.
- Files or areas likely involved:
  Shared Inventory navigation; existing Inventory Summary Query hook/query key; badge/status atom if reusable.
- Execution notes:
  Leer `lowStockCount` exclusivamente del summary global existente. Mostrar badge solo si count > 0. Loading/error del summary no debe impedir navegar. No derivar count del current page. No añadir endpoint, unread state, polling ni persistence.
- Verification method:
  Tests prueban 0 → sin badge, 1 → `1`, N → N y un caso donde current page count difiere del summary global.
- Dependencies:
  Task 9.

- [x] Task 11: Completar la matriz frontend de permisos y navegación

- Objective:
  Probar conjuntamente visibility, action permissions, route guards y multi-role semantics.
- Files or areas likely involved:
  Navigation tests; AppRoutes tests; Products, Purchases, Inventory, Shifts and any local test utilities.
- Execution notes:
  Cubrir Product EMPLEADO, Purchase CONTADORA read-only, Inventory five-role read, own Shift roles, Production, Sale y multi-role MESERO+ENCARGADO. Probar desktop/mobile central navigation donde el test harness lo permita sin pixel assertions.
- Verification method:
  Los tests verifican tanto links visibles/ausentes como direct-route behavior; multi-role demuestra unión.
- Dependencies:
  Tasks 5-10.

- [x] Task 12: Reconstruir factual y mínimamente la documentación de HU-007

- Objective:
  Hacer que HU-007 describa su implementación actual sin fabricar validación.
- Files or areas likely involved:
  HU-007 canonical document; actual Production backend/frontend files; generated contract; tests; relevant original Sprint 2 OpenSpec/handoff; existing captures.
- Execution notes:
  Revalidar la estructura usada por HU-006/HU-012/HU-013/HU-017/HU-018. Actualizar Resultado, Seguridad, Frontend y validación, Baseline revalidado, Evidencia real, Manifest y Estado. Corregir paths inexistentes. Enumerar únicamente archivos realmente relacionados. Conservar evidencia histórica válida como histórica. Si no existen capturas HU-007 locales, usar `MANUAL_EVIDENCE_PENDING`.
- Verification method:
  Cada path del manifest existe; no se afirma frontend pendiente si está implementado; no se afirma screenshot/manual PASS sin archivo/evidencia.
- Dependencies:
  Tasks 1, 7, 8.

- [x] Task 13: Reconciliar únicamente el drift documental de permisos Sprint 2

- Objective:
  Evitar que documentación current-state contradiga la matriz final después de los fixes.
- Files or areas likely involved:
  HU Sprint 2 afectadas; current permission/business-rule documentation; handoff current-state if applicable; this change.
- Execution notes:
  Auditar las ocho HU pero modificar solo documentos con una afirmación factual incorrecta sobre roles/routes/status. Preservar OpenSpec histórico. Documentar el qualifier COCINA Purchase tal como quede confirmado localmente. No cambiar evidencia ajena ni reescribir historias que ya son correctas.
- Verification method:
  Matriz documental final coincide con código/policies; cada documento tocado tiene una razón concreta.
- Dependencies:
  Tasks 3-12.

- [x] Task 14: Ejecutar la regresión backend y frontend completa

- Objective:
  Demostrar que el cierre transversal no rompió HUs ya terminadas.
- Files or areas likely involved:
  Entire backend/frontend test and build surface.
- Execution notes:
  Descubrir comandos reales. Backend: restore/build/test e integration PostgreSQL según workflow actual. Frontend: auditar `package.json` y ejecutar format/check, typecheck, lint, test y build reales. No fijar counts históricos. No skippear tests. No resolver fallos borrando assertions.
- Verification method:
  Todos los gates requeridos terminan PASS, failed=0, y se registran total/passed/failed/skipped reales.
- Dependencies:
  Tasks 4, 11, 13.

- [x] Task 15: Confirmar que no cambió el contrato API

- Objective:
  Proteger la expectativa de zero breaking changes, zero endpoints y zero migrations.
- Files or areas likely involved:
  API route/OpenAPI definition; generated TypeScript only for comparison; migration tree.
- Execution notes:
  Comparar routes/verbs/schema antes/después. Si solo cambian policies/frontend/docs, no regenerar TypeScript por rutina salvo que el workflow local lo exija. Si aparece un schema diff, investigarlo como cambio inesperado antes de aceptarlo. Confirmar que no se creó migration.
- Verification method:
  Report final declara: new endpoints=0, route changes=0, verb changes=0, breaking DTO changes=0, migrations=0. Cualquier excepción requiere blocker/revisión, no aprobación automática.
- Dependencies:
  Task 14.

- [x] Task 16: Ejecutar el audit final de Sprint 2 y preparar el reporte de cierre

- Objective:
  Repetir la matriz completa sobre el estado final y dejar trazabilidad verificable.
- Files or areas likely involved:
  Final diff; authorization matrix; routes; Inventory UI; HU-007; affected current-state docs.
- Execution notes:
  Revalidar los seis roles, anonymous y multi-role. Reconfirmar Products, Composition, Inventory, Production, Sale, Purchases, Shifts; route reachability; Inventory three-view navigation/badge; HU-007 evidence state. Enumerar todos los archivos modificados desde Git read-only. No fabricar manual evidence.
- Verification method:
  Cero permission mismatches conocidos en scope, cero orphan routes confirmadas en scope, Inventory nav coherente, HU-007 factual, quality gates green y final diff limitado al change.
- Dependencies:
  Tasks 14, 15.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 350–750 LoC manuales si el working tree local conserva los findings públicos, incluyendo tests y documentación. El código productivo esperado debe ser pequeño; la mayor parte del volumen debería corresponder a regresiones y trazabilidad. El rango debe reducirse si varias divergencias ya están resueltas localmente.
- Risk of exceeding 400 LoC review threshold:
  Medium to High.
- Recommendation:
  Chained PRs
- Suggested split if chained:
  Mantener UN SOLO OpenSpec change y, si el humano decide revisar en slices, separar conceptualmente:
  1. backend authorization + authorization matrix tests;
  2. frontend capabilities/routes/navigation;
  3. Inventory tabs/badge + tests;
  4. conditional routing/shell fixes;
  5. HU-007 + permission documentation reconciliation + final regression.

  Esta recomendación no autoriza al agente a crear commits, branches o PRs.
