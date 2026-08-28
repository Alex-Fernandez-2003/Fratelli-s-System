# Tasks

## Task 1: Auditar develop local y registrar la baseline

- Objective:
  Establecer la única baseline válida para el cierre de integración del Sprint 1.
- Files or areas likely involved:
  Git read-only state, frontend tree, backend OpenAPI/policies, tests, docs.
- Execution notes:
  Registrar branch, HEAD y status. No realizar ninguna mutación Git. Confirmar todos los changes Sprint 1 integrados antes de decidir qué corregir.
- Verification method:
  Baseline report contiene branch=`develop`, HEAD exacto, status inicial y lista de módulos detectados.
- Dependencies:
  None.

## Task 2: Inspeccionar el paquete visual completo

- Objective:
  Completar la auditoría visual 10/10 más cualquier referencia adicional.
- Files or areas likely involved:
  `Referencias.zip`, `Container.png`, dashboards por rol, estados, `Proveedores - Mobile.png`.
- Execution notes:
  Abrir cada imagen visualmente. Registrar viewport, shell, sidebar/drawer, surface hierarchy, active state, spacing, avatar/profile, CTAs, tables/cards y elementos fuera de scope. Aplicar KEEP/ADAPT/OMIT/DEFER.
- Verification method:
  Inventario final reporta N/N imágenes abiertas y ninguna referencia queda sin clasificación.
- Dependencies:
  None.

## Task 3: Enumerar todas las rutas y guards reales

- Objective:
  Crear la matriz source-of-truth de routing antes de refactorizar navegación.
- Files or areas likely involved:
  `frontend/src/routes/` o equivalente, guard components, feature route imports.
- Execution notes:
  Registrar Route, Page, layout, guard, roles, child paths, navigation entry y wildcard behavior. No asumir la lista del briefing.
- Verification method:
  Cada ruta autenticada real aparece en la matriz y puede trazarse a un guard/source.
- Dependencies:
  Task 1.

## Task 4: Auditar todas las fuentes de shell y navegación

- Objective:
  Identificar duplicación global sin confundirla con navegación de contenido válida.
- Files or areas likely involved:
  AppShell, AppLayout, SidebarNav, AuthenticatedLayout, headers, drawers, `aside`, `nav`, bottom-nav y todos sus consumers.
- Execution notes:
  Buscar cada uso y clasificarlo como GLOBAL_CORRECT, FEATURE_DUPLICATE, CONTENT_NAVIGATION_VALID u OBSOLETE_AFTER_CONSOLIDATION. Confirmar Suppliers y Attendance como casos prioritarios.
- Verification method:
  Existe un inventario completo de shell/navigation consumers y un target explícito de un solo shell.
- Dependencies:
  Tasks 1, 3.

## Task 5: Auditar la matriz real de permisos de Sprint 1

- Objective:
  Comparar navigation, guards, actions y backend authorization para cada capability integrada.
- Files or areas likely involved:
  Products, Suppliers, Attendance, Users, Orders, Kitchen, Inventory, Expenses, backend policies/OpenAPI.
- Execution notes:
  Producir tabla Capability/Route/Role/Visible/Read/Mutate/Guard/Source. Evaluar multi-role por unión. No corregir todavía.
- Verification method:
  Los seis roles canónicos están cubiertos para todos los módulos Sprint 1.
- Dependencies:
  Tasks 1, 3.

## Task 6: Resolver los contract gates de Products y Attendance

- Objective:
  Determinar si las decisiones congeladas pueden implementarse exclusivamente en frontend.
- Files or areas likely involved:
  Backend OpenAPI/policies de Catalog y Attendance; frontend generated contract.
- Execution notes:
  Products: confirmar CONTADORA en CatalogRead. Attendance: confirmar employee-targeted management ADMIN/ENCARGADO y self-history autenticado. No modificar backend.
- Verification method:
  Cada capability queda como `SUPPORTED_BY_CURRENT_BACKEND` o `BASELINE_CONTRACT_BLOCKER` con evidencia exacta.
- Dependencies:
  Task 5.

## Task 7: Diseñar y consolidar la definición central de capabilities

- Objective:
  Eliminar matrices globales contradictorias entre router, desktop y mobile.
- Files or areas likely involved:
  Configuración central de navegación/roles y helpers de autorización.
- Execution notes:
  Definir metadata reusable para paths, labels, icons, roles, active match y Attendance target resolution. Reutilizar role constants existentes. No introducir primary-role semantics.
- Verification method:
  Tests unitarios demuestran role filtering, multi-role union, Attendance target y child-route matching.
- Dependencies:
  Tasks 3, 5, 6.

## Task 8: Consolidar un único shell autenticado

- Objective:
  Terminar con un solo owner de sidebar, topbar, drawer y routed content.
- Files or areas likely involved:
  AuthenticatedLayout, AppShell/AppLayout, SidebarNav o equivalentes.
- Execution notes:
  Elegir el menor refactor coherente: evolucionar el shell ya route-owned y reutilizar las mejores piezas existentes. No crear un tercer shell. Eliminar fake email/profile fields y bottom-nav global.
- Verification method:
  Representative authenticated route renderiza exactamente un shell; tests detectan una única sidebar desktop y ausencia de bottom nav.
- Dependencies:
  Tasks 4, 7.

## Task 9: Implementar sidebar desktop centralizado

- Objective:
  Aplicar la jerarquía visual de las referencias desktop usando solo módulos reales.
- Files or areas likely involved:
  Unified shell/navigation renderer.
- Execution notes:
  Brand arriba, links role-aware, active state, grouping solo si aporta valor, perfil real al fondo. Usar Lucide y central capability registry.
- Verification method:
  Tests por roles y visual review desktop; no módulos ficticios ni datos de perfil inventados.
- Dependencies:
  Tasks 2, 8.

## Task 10: Implementar topbar y drawer mobile únicos

- Objective:
  Establecer hamburger + drawer como el único sistema global mobile.
- Files or areas likely involved:
  Unified shell mobile header/drawer.
- Execution notes:
  Reconciliar `Container.png` después de abrirlo. Incluir overlay, close, role-aware links, active state y profile real. Eliminar bottom-nav de todos los consumers. No campana si no existe notification capability.
- Verification method:
  Tests de open/close/overlay/navigation/focus/roles y validación 403/360. Global bottom-nav count = 0.
- Dependencies:
  Tasks 2, 8, 9.

## Task 11: Migrar páginas con shell global duplicado a content-only

- Objective:
  Eliminar layouts globales poseídos por features.
- Files or areas likely involved:
  Suppliers, Attendance y cualquier otro consumer detectado en Task 4.
- Execution notes:
  Retirar AppShell/AppLayout/SidebarNav globales de páginas, preservando PageHeader, feature tabs, filters y otros content navigation válidos.
- Verification method:
  Search final no encuentra feature pages montando un segundo shell; route integration tests pasan.
- Dependencies:
  Tasks 8, 10.

## Task 12: Corregir permisos de HU-003 Productos

- Objective:
  Separar completamente Product read de Product manage.
- Files or areas likely involved:
  Products pages/components/action menus/forms/routes/tests.
- Execution notes:
  ADMIN/ENCARGADO gestionan. MESERO/COCINA/CONTADORA read-only si el contract gate lo permite. EMPLEADO denegado. Auditar Nuevo, Editar, Activar, Desactivar, kebab y rutas directas existentes.
- Verification method:
  Role tests demuestran controles y guards correctos para todos los roles soportados.
- Dependencies:
  Tasks 6, 7.

## Task 13: Reconciliar permisos HU-016 Proveedores

- Objective:
  Garantizar read/manage consistente en navegación, route y acciones.
- Files or areas likely involved:
  Suppliers page, action menu, filters, route tests.
- Execution notes:
  ADMIN/ENCARGADO manage; COCINA/CONTADORA read-only; MESERO/EMPLEADO denied. Eliminar kebab si el usuario no tiene ninguna acción.
- Verification method:
  Role matrix tests y direct-route tests pasan; read-only no muestra controles mutantes.
- Dependencies:
  Tasks 7, 11.

## Task 14: Implementar Proveedores mobile cards

- Objective:
  Sustituir la tabla comprimida por cards fieles a la referencia visible.
- Files or areas likely involved:
  Suppliers responsive renderer y card component.
- Execution notes:
  Reutilizar la misma query. Mantener desktop table. Card usa solo datos reales: nombre, contacto real, status, notes. Usar icono neutro; no NIT/categoría/icono ficticio. CTA y kebab role-aware.
- Verification method:
  Desktop conserva table; 403/360 usan cards sin overflow; tests no renderizan datos ficticios.
- Dependencies:
  Tasks 2, 13.

## Task 15: Reconciliar HU-022 Asistencia con la decisión final

- Objective:
  Entregar management para ADMIN/ENCARGADO y own history read-only para trabajadores usando el contrato backend real.
- Files or areas likely involved:
  Attendance management page, own-history page, navigation target, API calls, tests.
- Execution notes:
  Solo ejecutar si contract gate está soportado. Management usa EmployeeId real. `/mi-asistencia` se mantiene own-history read-only. Evitar dos Asistencia items para multi-role. No backend workaround.
- Verification method:
  ADMIN/ENCARGADO gestionan; MESERO/COCINA/CONTADORA/EMPLEADO solo leen su historial; payload usa ID correcto.
- Dependencies:
  Tasks 6, 7, 11.

## Task 16: Reconciliar active-route y cross-module navigation

- Objective:
  Garantizar que shell central representa correctamente todas las rutas Sprint 1.
- Files or areas likely involved:
  Capability active matching, navigation tests.
- Execution notes:
  Probar children reales. Como mínimo Pedidos detail/new, Inventory movements y las dos rutas Attendance. Preservar módulos no tocados.
- Verification method:
  `aria-current`/active visual coincide con parent esperado para cada child route.
- Dependencies:
  Tasks 9, 10, 12, 13, 15.

## Task 17: Completar responsive global y accessibility

- Objective:
  Cerrar integración usable a desktop, 403 y 360 sin duplicación de navegación.
- Files or areas likely involved:
  Unified shell, Suppliers, Attendance y módulos afectados por content-width changes.
- Execution notes:
  Auditar breakpoints, widths, overflow, drawers, dialogs, focus, landmarks, touch targets y long text. No rediseñar todas las feature screens.
- Verification method:
  Automated accessibility/structure tests donde proceda y manual responsive checklist preparada.
- Dependencies:
  Tasks 10, 14, 16.

## Task 18: Completar tests de navegación, guards y single-shell

- Objective:
  Proteger la matriz final del Sprint frente a regresiones.
- Files or areas likely involved:
  Routing/navigation/layout test suites.
- Execution notes:
  Cubrir seis roles, multi-role, active state, direct URL, drawer y ausencia de forbidden items. Usar parameterized tests para evitar matriz cartesiana innecesaria.
- Verification method:
  New integration tests pass y demuestran una sola sidebar/drawer system.
- Dependencies:
  Tasks 12-17.

## Task 19: Ejecutar full frontend regression y corregir deuda técnica

- Objective:
  Dejar frontend integrado completamente verde antes de tocar documentación.
- Files or areas likely involved:
  Todo frontend, incluyendo deuda reportada en Products API/pages y shared http-client si persiste.
- Execution notes:
  Auditar scripts reales. Ejecutar format check, typecheck, lint, full tests y build. Corregir errores normales hasta failed=0. No usar blanket disables.
- Verification method:
  format PASS; typecheck PASS; lint PASS; tests failed=0; build PASS.
- Dependencies:
  Task 18.

## Task 20: Ejecutar api:generate solo si el workflow real lo exige

- Objective:
  Confirmar que el generated frontend contract no quedó desincronizado sin introducir backend changes.
- Files or areas likely involved:
  OpenAPI runtime y generated API types.
- Execution notes:
  Ejecutar únicamente si el workflow actual y runtime backend lo requieren. No editar generated types manualmente. Un diff inesperado debe auditarse, no aceptarse ciegamente.
- Verification method:
  `api:generate` PASS o documentado `NOT_NEEDED`; backend source diff = 0.
- Dependencies:
  Task 19.

## Task 21: Auditar documentación después de estabilizar frontend

- Objective:
  Clasificar documentación sin generar churn indiscriminado.
- Files or areas likely involved:
  root/frontend/backend README, docs requirements, reglas, backlog, historias, sprints, ADR, architecture, data model, testing, OpenSpec history.
- Execution notes:
  Para cada documento registrar CURRENT, NEEDS_UPDATE, HISTORICAL_KEEP o NOT_RELEVANT. Distinguir current-state de historical/planning.
- Verification method:
  Matriz documental completa con motivo para cada modificación propuesta.
- Dependencies:
  Tasks 19, 20.

## Task 22: Actualizar documentación current-state necesaria

- Objective:
  Hacer que los documentos canónicos actuales describan el frontend final real.
- Files or areas likely involved:
  README root/frontend y documentos current-state clasificados NEEDS_UPDATE.
- Execution notes:
  Narrativa humana en español. Actualizar rutas, shell, módulos, roles y Sprint status únicamente donde estén obsoletos. Evitar churn de backend README si sigue correcto.
- Verification method:
  Las afirmaciones current-state se contrastan con rutas/código/tests finales.
- Dependencies:
  Task 21.

## Task 23: Reconciliar HU-003, HU-016 y HU-022 mínimamente

- Objective:
  Corregir solo semánticas/status realmente afectados por este integration change.
- Files or areas likely involved:
  Historias reales de Products, Suppliers y Attendance.
- Execution notes:
  HU-003: reflejar manage ADMIN/ENCARGADO y read matrix final solo si backend contract está reconciliado. HU-016: read/manage y mobile cards si documentación lo requiere. HU-022: frozen management/own-history semantics. No reescritura estilística masiva.
- Verification method:
  Cada HU coincide con implementación/backend real; ningún blocker se documenta falsamente como Done.
- Dependencies:
  Tasks 21, 22.

## Task 24: Reconciliar requirements, reglas y backlog afectados

- Objective:
  Eliminar contradicciones canónicas sobre permisos/Attendance sin borrar historia.
- Files or areas likely involved:
  requirements, business rules, Product Backlog y trazabilidad actual.
- Execution notes:
  Actualizar solo documentos current-state o refinados que contradigan la decisión final. Mantener planning histórico identificable como histórico.
- Verification method:
  Búsqueda cruzada no encuentra matrices actuales contradictorias para HU-003/HU-016/HU-022.
- Dependencies:
  Task 23.

## Task 25: Completar documentación Sprint 1

- Objective:
  Dejar separado el registro del Sprint 0 y el documento de ejecución/cierre de Sprint 1.
- Files or areas likely involved:
  `docs/sprints/` o equivalente.
- Execution notes:
  Auditar naming. Preservar Sprint 0. Crear/actualizar Sprint 1 con objetivo, scope, estado y referencias reales sin inventar retrospectiva.
- Verification method:
  Sprint 0 sigue presente; Sprint 1 existe y sus estados coinciden con el repositorio final.
- Dependencies:
  Tasks 22-24.

## Task 26: Crear la plantilla separada de retrospectiva Sprint 1

- Objective:
  Preparar el documento de reunión sin fabricar conclusiones.
- Files or areas likely involved:
  `docs/sprints/` o naming equivalente.
- Execution notes:
  Seguir naming local; preferencia conceptual `sprint-01-retrospectiva.md`. Incluir secciones de información, objetivo, contexto, went-well/problems/improvements, aspectos técnicos, equipo, acciones, decisiones, next Sprint, evidencias y cierre. Todos los resultados de reunión permanecen `Pendiente`.
- Verification method:
  Archivo separado existe; no contiene opiniones, responsables, acciones ni conclusiones inventadas; estado = reunión pendiente.
- Dependencies:
  Task 25.

## Task 27: Preservar OpenSpec/ADR histórico y revisar consistencia documental

- Objective:
  Evitar que la reconciliación current-state destruya registro técnico histórico.
- Files or areas likely involved:
  docs/OpenSpec histórico, ADR, índices y documentos actualizados.
- Execution notes:
  No mass translation. No reescritura retrospectiva. Revisar links, rutas, roles, HUs completadas/pendientes y lenguaje español en current-state docs.
- Verification method:
  Old OpenSpec diff = ninguno salvo motivo change-local explícito; cross-doc consistency review PASS.
- Dependencies:
  Task 26.

## Task 28: Preparar validación manual y evidencia real

- Objective:
  Entregar al humano un checklist de cierre visual/funcional sin fabricar evidencia.
- Files or areas likely involved:
  Change docs/checklist.
- Execution notes:
  Validar desktop/403/360 y los seis roles: nav visibility, direct forbidden route, Products read/manage, Suppliers read/manage/cards, Attendance management/own-history, single shell y drawer. No número fijo de screenshots.
- Verification method:
  Checklist listo; cualquier evidencia se marca PENDING hasta ser ejecutada realmente.
- Dependencies:
  Tasks 19, 27.

## Task 29: Producir el reporte final de APPLY

- Objective:
  Emitir un único reporte trazable del cierre de integración.
- Files or areas likely involved:
  Resultados de audit, tests, docs y manifest real.
- Execution notes:
  Reportar Verdict, baseline, visual audit N/N, route matrix, navigation, HU-003/HU-016/HU-022, preserved modules, single shell, quality gates, responsive, documentation audit, Sprint docs, evidence status, backend unchanged, complete changed-file list, Git mutations=none, VERIFY/ARCHIVE not run.
- Verification method:
  Ningún PASS se declara sin evidencia ejecutada; blockers reales se reportan con categoría exacta.
- Dependencies:
  Tasks 28.

## Runtime Autonomy / Blocker Taxonomy

Future APPLY MUST NOT detenerse por:

- React errors;
- TypeScript errors;
- route refactor;
- capability helper refactor;
- CSS/Tailwind;
- responsive;
- drawer focus bugs;
- tests;
- formatting;
- lint;
- duplicated layout cleanup;
- documentation links;
- Spanish wording;
- Supplier card implementation;
- active-route bugs.

Normal loop:

diagnose
→ fix
→ retest
→ continue

Only valid hard blockers:

- `PRODUCT_DECISION_REQUIRED`
- `SDD_CONTRADICTION`
- `SECURITY_CONFLICT`
- `DESTRUCTIVE_CHANGE_REQUIRED`
- `BASELINE_CONTRACT_BLOCKER`
- `UNRECOVERABLE_RUNTIME_BLOCKER`

A normal component/path difference from this briefing is not a blocker.

A missing Product/Attendance backend contract required by frozen behavior is a blocker because backend changes are explicitly outside this change.

## Mandatory Two-Phase Apply

Phase 1 MUST complete:

audit
→ visual audit
→ contract gates
→ route/permission matrix
→ central navigation
→ unified shell
→ desktop sidebar
→ mobile drawer
→ Products
→ Suppliers
→ Attendance
→ cross-module integration
→ responsive/accessibility
→ frontend tests
→ frontend quality gates

Only when Phase 1 is green MAY Phase 2 start:

documentation audit
→ current-state updates
→ HU reconciliation
→ Sprint 1 docs
→ retrospective template
→ consistency review
→ final report

## Future Final Report Contract

The future report SHOULD contain:

- Verdict:
  - `SPRINT_1_FRONTEND_INTEGRATION_AND_DOCUMENTATION_COMPLETE`
  - or `HARD_BLOCKER`.
- Baseline:
  - branch;
  - HEAD;
  - initial status.
- Visual Audit:
  - N/N opened;
  - KEEP;
  - ADAPT;
  - OMIT;
  - DEFER.
- Route matrix.
- Navigation:
  - central source;
  - sidebar;
  - drawer;
  - bottom-nav none;
  - duplicate shell none;
  - multi-role.
- HU-003:
  - read/manage roles;
  - backend contract status.
- HU-016:
  - roles;
  - desktop;
  - 403;
  - 360;
  - mobile cards.
- HU-022:
  - contract supported/missing;
  - management;
  - own history.
- Other Sprint 1 modules:
  - preserved status.
- Quality:
  - format;
  - typecheck;
  - lint;
  - test totals;
  - build;
  - api generation status.
- Documentation:
  - reviewed;
  - updated;
  - historical kept;
  - language.
- Sprint docs:
  - Sprint 0 preserved;
  - Sprint 1 valid;
  - retrospective template;
  - meeting pending.
- Evidence:
  - fabricated screenshots none;
  - manual validation status.
- Backend:
  - modified NO.
- Complete file manifest.
- Git:
  - agent mutations NONE.
- VERIFY:
  - NOT RUN.
- ARCHIVE:
  - NOT RUN.
- Final readiness for human Sprint review.

## Review Workload Forecast

- Estimated LoC changed:
  Aproximadamente 2.500–5.000 LoC entre shell/navigation consolidation, permissions, Suppliers responsive, Attendance integration, regression tests y documentación. El volumen real depende de cuántos consumers de `AppLayout`/`AppShell` aparezcan en el `develop` local y de la deuda documental actual.
- Risk of exceeding 400 LoC review threshold:
  Very High.
- Recommendation:
  Chained PRs
- Suggested split if chained:
  - PR 1: capability/route registry + unified shell foundation.
  - PR 2: desktop sidebar + mobile drawer + duplicate-shell migration.
  - PR 3: Products/Suppliers permission reconciliation + Supplier cards.
  - PR 4: Attendance role experience + cross-module route integration.
  - PR 5: regression/responsive/accessibility/quality-debt closure.
  - PR 6: current-state documentation reconciliation.
  - PR 7: Sprint 1 closure docs + retrospective template + final consistency.

  These are review slices only. The agent MUST NOT perform Git/PR operations; the user controls Git.
