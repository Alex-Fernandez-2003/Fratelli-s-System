# Proposal

## Problem Statement

Sprint 3 necesita completar el Bloque 3 de asistencia con dos experiencias separadas:

- HU-023 — asistencia personal en `/mi-asistencia`;
- HU-024 — consulta administrativa read-only en `/asistencia`.

Ambas HUs comparten el dominio Attendance, Employee/Shift context, fechas de negocio, autorización, TanStack Query y patrones de historial, pero tienen propósitos distintos y MUST mantenerse como páginas separadas.

La auditoría secundaria de la rama pública `develop` confirma que el frontend ya dispone de una feature `attendance`, una ruta `/mi-asistencia`, una ruta `/asistencia`, un único item global `Asistencia`, API hooks, formatters y una pantalla administrativa diaria preexistente. Actualmente `/mi-asistencia` es fundamentalmente historial propio, mientras `/asistencia` corresponde a la gestión diaria HU-022 con CheckIn/CheckOut de empleados. citeturn179197view1turn872840view0turn142203view3

Los contratos generados actuales (baseline previa a D16) confirman:

- `GET /api/v1/attendance/me?from=&to=&page=&pageSize=` → `AttendancePage`;
- `GET /api/v1/attendance/admin?...` → `AdministrativeAttendancePage`;
- `POST /api/v1/attendance/employees/{employeeId}/check-in`;
- `POST /api/v1/attendance/employees/{employeeId}/check-out`;
- `GET /api/v1/attendance/employees/today`. citeturn987151view1turn987151view2turn987151view3

La implementación D16 MUST actualizar el OpenAPI runtime y regenerar el cliente cuando agregue o cambie el contrato personal autorizado. El generated client no se editará manualmente. El contrato administrativo HU-024 y su generated shape se reutilizan sin cambios salvo una diferencia factual descubierta por la auditoría local.

### Expectativa del generated API bajo D16

- El runtime OpenAPI deberá describir la mutation identity-bound elegida (operación existente con enforcement server-side o `/me`) y la proyección personal aditiva.
- El generated client deberá exponer exactamente ese contrato después de la regeneración; cualquier diff permitido debe corresponder a HU-023 D16.
- No se espera cambio de contrato generado para HU-024; cualquier diferencia administrativa no explicada debe detener la implementación y revisarse.

En la baseline documental, HU-024 dispone contractualmente de historial derivado, summary global y summaries por empleado, mientras HU-023 dispone de historial propio paginado y 404 cuando el User no tiene Employee vinculado. D16 autoriza completar el contrato backend personal de HU-023 con mutations y proyección aditiva antes de terminar la experiencia frontend. citeturn611610view0turn611610view1

### Decisión de contrato resuelta — D16

La auditoría local de Task 1 confirmó los dos gaps descritos arriba: las mutations existentes estaban protegidas por `AttendanceManage` y el contrato personal no exponía toda la proyección autoritativa requerida. El maintainer autorizó explícitamente D16 antes de iniciar el trabajo de producto.

D16 establece que cualquier User autenticado vinculado a un Employee puede leer su asistencia y ejecutar únicamente su propio CheckIn/CheckOut, sin depender de que su rol sea administrativo. El backend MUST derivar el Employee desde la identidad autenticada y la relación User → Employee. Una operación de autoservicio MUST NOT aceptar ni confiar en un `EmployeeId` arbitrario enviado por el caller; si la forma de la ruta existente no puede expresar este límite, se utilizarán mutations dedicadas bajo `/me`.

La autorización es deliberadamente mínima:

- se permite la autorización de mutations de autoservicio o una ruta dedicada `/me` cuando sea necesaria para cumplir el límite de identidad;
- se permite una proyección personal aditiva con lifecycle, snapshot de horario, punctuality y `workedMinutes`, reutilizando application/domain logic existente;
- se permiten los tests backend correspondientes y la sincronización de OpenAPI runtime y generated client;
- `AttendanceManage` permanece restringida a ADMINISTRADOR y ENCARGADO para las operaciones administrativas existentes;
- HU-024 conserva su lectura administrativa separada y read-only mediante la capacidad/contrato administrativo existente; su backend no cambia;
- no se autoriza una migración ni un cambio de schema ahora. Si durante la implementación aparece una brecha persistente genuinamente necesaria, el trabajo MUST detenerse y reabrir la decisión antes de agregar persistencia.

La respuesta personal enriquecida y las respuestas de las mutations serán autoridad del backend. El frontend no podrá derivar lateness, absence ni `workedMinutes` como reglas de negocio. Elapsed time seguirá siendo únicamente presentation-only mientras exista una asistencia abierta.

`SPRINT_3_BLOCK_3_D16_APPROVED`

`READY_FOR_SPRINT_3_BLOCK_3_APPLY: YES — D16 registrado; el alcance backend de HU-023 permanece acotado`

Este cambio documenta la autorización; no afirma que la implementación, los tests ni la sincronización generada ya se hayan ejecutado.

## Current Baseline

### Local Working Tree

- Branch: `develop`.
- HEAD: `4504e8f5acbbcb7c52fd0857aeb9e708f5650576`.
- Working tree at Task 1 baseline: tracked files clean.
- Staged/unstaged changes at Task 1 baseline: none.
- Untracked content at Task 1 baseline: active OpenSpec change directory.

Task 1 revalidó esta baseline y los contratos Attendance antes de D16. Antes de implementar se verificará la forma concreta del route/OpenAPI local; no se reabrirá el blocker ya resuelto salvo que aparezca una brecha persistente de schema que requiera revisión explícita.

### Secondary `develop` Baseline

La evidencia pública actual confirma:

- `/mi-asistencia` ya existe bajo `RequireAuth`;
- `/asistencia` está actualmente protegida por `ATTENDANCE_MANAGE_ROLES`;
- `ATTENDANCE_MANAGE_ROLES` contiene ADMINISTRADOR y ENCARGADO, pero no CONTADORA;
- el item global `Asistencia` ya tiene target dinámico, aunque solo considera esos roles administrativos actuales;
- `AuthUser` generado ya contiene `employeeId: null | string` y `roles: string[]`. citeturn179197view1turn179197view2turn625167view2

Esto implica dos cambios frontend claros que sí están dentro del alcance futuro:

- ampliar la capability administrativa frontend para que refleje `AttendanceAdministrative`, que backend concede también a CONTADORA;
- conservar un único item `Asistencia` y hacer que su target utilice esa capability real.

Backend actualmente define:

- `AttendanceSelf` → cualquier autenticado;
- `AttendanceAdministrative` → ADMINISTRADOR, ENCARGADO, CONTADORA;
- `AttendanceManage` → ADMINISTRADOR, ENCARGADO. citeturn327701view0

### Public-Source Consistency Caveat

La documentación y el generated API actuales exponen HU-024 `AdministrativeAttendancePage`, pero algunas vistas públicas obtenidas de los archivos base de Attendance no reflejan de forma consistente todos los miembros descritos por esa documentación.

Por esa razón, la auditoría local de backend, generated TypeScript y build sigue siendo obligatoria antes de implementar; el resultado de Task 1 confirmó los gaps y D16 autoriza únicamente su resolución mínima para HU-023.

Este caveat es technical research; no constituye por sí mismo una decisión de producto.

## Why HU-023 and HU-024 Form One Block

Ambas HUs consumen:

- Attendance;
- User ↔ Employee linkage;
- Shift/ShiftAssignment context;
- BusinessDate;
- planned schedule data;
- lateness;
- worked time;
- query/error infrastructure;
- route/navigation authorization;
- responsive history patterns.

Sin embargo:

- HU-023 es self-service/personal;
- HU-024 es consulta administrativa.

El diseño MUST compartir primitives e infraestructura, pero MUST NOT convertir ambas experiencias en una única página condicional por rol.

## Goals

- Mantener `/mi-asistencia` y `/asistencia` como rutas independientes.
- Mantener un solo item global `Asistencia` con target capability-aware.
- Implementar HU-023 como experiencia personal completa conforme al contrato identity-bound autorizado por D16.
- Mostrar un estado específico cuando el User no está vinculado a Employee.
- Mantener el historial propio en `/mi-asistencia`.
- Aplicar current month como default del historial personal.
- Representar lateness y worked time únicamente con autoridad backend.
- Permitir elapsed time local únicamente como dato presentation-only durante una asistencia abierta.
- Implementar HU-024 como consulta administrativa read-only.
- Autorizar HU-024 frontend para ADMINISTRADOR, ENCARGADO y CONTADORA.
- Utilizar filtros Employee/period/Shift/outcome reales.
- Mostrar cuatro cards basadas en summary backend.
- Utilizar paginación server-side.
- Mostrar detalle read-only sin crear endpoint nuevo cuando la row ya contiene toda la información.
- Utilizar `employeeSummaries` contractuales de forma compacta.
- Preservar multi-role como unión.
- Reutilizar actuales AppShell, cards, tables, overlays, query/error patterns y formatters.
- Mantener responsive-ready a 360/~768/>=1280.
- Implementar accesibilidad a nivel de código.
- Diferir evidencia manual visual a Sprint Final Audit.
- Mantener sin cambios el backend administrativo de HU-024 y los contratos fuera del alcance aprobado.
- Implementar únicamente el alcance backend mínimo D16 de HU-023: autorización de autoservicio identity-bound, proyección personal aditiva, reutilización application/domain, tests y sincronización de OpenAPI runtime/generated client.
- Mantener schema y migrations sin cambios ahora; cualquier brecha persistente genuinamente necesaria MUST detener el trabajo y reabrir la decisión antes de añadirla.
- No editar manualmente el generated client; si OpenAPI runtime cambia por D16, regenerarlo y verificar la sincronización.

## Non-Goals

- HU-028.
- HU-029.
- HU-030.
- HU-031.
- Attendance Report.
- Payroll.
- Projected pay.
- Salary mutations.
- Schedule management.
- Attendance correction.
- Manual admin Attendance creation nueva.
- Admin mutation controls en HU-024.
- Justification.
- Approval.
- Delete/Edit Attendance.
- Biometrics.
- Facial recognition.
- QR attendance.
- Geolocation.
- Device fingerprint.
- Notifications.
- PDF.
- CSV.
- XLSX.
- Print.
- Extensiones backend de HU-023 fuera del alcance mínimo aprobado por D16.
- Cambios backend para HU-024, cuya lectura administrativa existente debe reutilizarse sin modificación.
- Ampliar `AttendanceManage` más allá de ADMINISTRADOR y ENCARGADO.
- Permitir que el autoservicio seleccione o envíe un `EmployeeId` arbitrario.
- Cambios de schema o migrations en la implementación inicial de D16; si aparece una brecha persistente genuinamente necesaria, debe detenerse el trabajo y revisarse explícitamente antes de agregarlos.
- New packages.
- New application shell.
- Generic Attendance history framework.
- HU-031 data leakage.
- Manual responsive certification en este block.

## Frozen Product Decisions

| ID  | Decisión                                                                                         | Estado |
| --- | ------------------------------------------------------------------------------------------------ | ------ |
| D1  | `/mi-asistencia` y `/asistencia` son rutas explícitas y separadas                                | FROZEN |
| D2  | Personal Attendance incluye CheckIn y CheckOut                                                   | FROZEN |
| D3  | CheckIn/CheckOut son acciones directas, sin confirmation modal                                   | FROZEN |
| D4  | Elapsed time presentation está permitido mientras Attendance está activa                         | FROZEN |
| D5  | Own current-month history permanece en `/mi-asistencia`                                          | FROZEN |
| D6  | La UI muestra punctuality real proveniente del backend                                           | FROZEN |
| D7  | Missing Employee tiene estado específico                                                         | FROZEN |
| D8  | Admin filters = Employee + period + Shift + estado/condición real                                | FROZEN |
| D9  | HU-024 muestra cuatro summary cards coherentes con backend                                       | FROZEN |
| D10 | Admin history usa table desktop / cards mobile                                                   | FROZEN |
| D11 | Admin detail es read-only y reutiliza Drawer/Sheet/Modal real                                    | FROZEN |
| D12 | HU-024 no contiene mutations administrativas                                                     | FROZEN |
| D13 | Employee stats son compact/contextual, no un dashboard adicional                                 | FROZEN |
| D14 | Admin-capable users pueden acceder secundariamente a su propia asistencia cuando tienen Employee | FROZEN |
| D15 | Responsive/a11y se implementa; evidencia manual se difiere al Sprint Final Audit                 | FROZEN |
| D16 | User autenticado con Employee vinculado puede leer y hacer CheckIn/CheckOut solo propios; Employee derivado de identidad; HU-023 backend mínimo autorizado y HU-024 backend sin cambios | FROZEN — APPROVED |

## Affected Areas

Las áreas afectadas bajo D16 son:

- HU-023 backend auth/controller/application/domain reuse para mutations identity-bound.
- HU-023 backend personal read projection: lifecycle, schedule snapshots, punctuality y workedMinutes.
- HU-023 backend tests.
- OpenAPI runtime y generated client synchronization derivada de esos contratos autorizados.
- Attendance frontend API adapters.
- Attendance query-key/hooks.
- `MyAttendancePage` o feature-local successor.
- Administrative Attendance page.
- AppRoutes.
- Navigation registry.
- Auth/capability helpers.
- Date/time formatting.
- Shared DataTable/Card/Badge/Alert/Skeleton/overlay primitives.
- Attendance frontend tests.
- HU-023/HU-024 documentation.
- OpenSpec evidence placeholders.

El backend de HU-024, incluida su lectura administrativa, permanece fuera de modificación y se reutiliza. Las mutations administrativas existentes protegidas por `AttendanceManage` permanecen separadas de la experiencia read-only HU-024.

## Assumptions

- La rama local esperada sigue siendo `develop`, pendiente de verificación.
- El generated API local puede contener cambios posteriores a la evidencia pública y MUST auditarse antes de elegir la forma concreta del contrato D16.
- La auditoría de Task 1 es la baseline previa a D16; antes de elegir la forma exacta de la ruta se verificará nuevamente el contrato local relevante.
- La implementación puede autorizar una mutation self-service identity-bound o una mutation dedicada `/me`; ambas deben derivar Employee del User autenticado y nunca confiar en un `EmployeeId` arbitrario.
- La proyección personal enriquecida se construirá reutilizando derivaciones application/domain existentes, sin recalcular reglas en frontend.
- HU-024 `AdministrativeAttendancePage` mantiene su summary y per-employee summaries en el local y su backend se reutiliza sin cambios.
- No se añade persistencia: schema y migrations permanecen sin cambios salvo que una brecha persistente genuinamente necesaria obligue a detenerse y solicitar una nueva revisión.
- Manual browser evidence está explícitamente diferida y no es necesaria para completar este block.

## Risks

### Risk 1: Interpretar Employee linkage como role

- Probability: High.
- Impact: High.
- Mitigation: `/mi-asistencia` se protege por autenticación; Employee eligibility se determina por relación/contrato, no por `EMPLEADO`.

### Risk 2: Self CheckIn/Out no autorizado

- Probability: Medium durante la implementación del contrato.
- Impact: High.
- Mitigation: Aplicar D16 con Employee derivado de la identidad autenticada; no aceptar `EmployeeId` arbitrario y conservar `AttendanceManage` exclusivamente para ADMINISTRADOR/ENCARGADO.

### Risk 3: Personal history no contiene punctuality/worked authority

- Probability: Medium durante la proyección aditiva D16.
- Impact: High.
- Mitigation: Enriquecer la lectura personal con lifecycle, snapshots, punctuality y `workedMinutes` autoritativos reutilizando application/domain; detenerse si aparece una brecha persistente de schema, sin calcular en frontend.

### Risk 4: `/asistencia` continúa restringida incorrectamente a ADMIN/ENC

- Probability: High.
- Impact: Medium.
- Mitigation: Alinear frontend administrative capability con `AttendanceAdministrative`, incluyendo CONTADORA.

### Risk 5: Admin route expuesta a roles operativos

- Probability: Medium.
- Impact: High.
- Mitigation: RequireAnyRole/capability + backend policy.

### Risk 6: Lateness recalculated client-side

- Probability: Medium.
- Impact: High.
- Mitigation: Usar `isLate`/`lateMinutes` exclusivamente.

### Risk 7: Absence inferida desde CheckOut null

- Probability: Medium.
- Impact: High.
- Mitigation: Usar `ABSENT`/backend-derived outcome únicamente.

### Risk 8: workedMinutes calculado mientras record está OPEN

- Probability: Medium.
- Impact: Medium/High.
- Mitigation: Elapsed presentation separado de workedMinutes.

### Risk 9: Browser timezone desplaza BusinessDate

- Probability: Medium.
- Impact: Medium.
- Mitigation: Reusar America/La_Paz/business-time helpers y tratar DateOnly como date-only.

### Risk 10: Employee selector requiere capability inapropiada

- Probability: Medium.
- Impact: High.
- Mitigation: Priorizar `employeeSummaries` del contract administrativo antes de `/users`.

### Risk 11: Historical Employee inactive no aparece en options

- Probability: Medium.
- Impact: Medium.
- Mitigation: Auditar semantics del summary/options source y documentar limitación si existe.

### Risk 12: Summary construido desde current page

- Probability: Medium.
- Impact: High.
- Mitigation: Usar `AdministrativeAttendanceSummary`.

### Risk 13: Admin mutations heredadas de HU-022 permanecen en HU-024

- Probability: High.
- Impact: High.
- Mitigation: HU-024 solo expone `Ver detalle`.

### Risk 14: La separación HU-024/HU-022 rompe el camino operativo existente

- Probability: Medium.
- Impact: High.
- Mitigation: Mantener las mutations administrativas existentes y su `AttendanceManage` para HU-022; HU-024 solo expone lectura administrativa y las mutations self-service D16 solo operan sobre la identidad autenticada.

### Risk 15: HU-024 se expande a HU-031

- Probability: Medium.
- Impact: Medium.
- Mitigation: No hourlyRate/projectedPay/report/charts/export.

### Risk 16: Filters desbordan 360 px

- Probability: Medium.
- Impact: Medium.
- Mitigation: Filter Sheet/Drawer/Modal existente.

### Risk 17: stale personal/admin history tras mutation

- Probability: Medium.
- Impact: Medium.
- Mitigation: Targeted query invalidation después de CheckIn/Out.

### Risk 18: Dos registros del mismo BusinessDate colisionan en UI keys/assumptions

- Probability: Medium.
- Impact: High.
- Mitigation: Modelar rows por attendance/assignment identity y nunca por fecha solamente.

### Risk 19: Manual evidence se convierte accidentalmente en archive blocker

- Probability: Medium.
- Impact: Medium.
- Mitigation: Registrar explícitamente `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

## Rollback Strategy

No DB rollback está previsto porque D16 no autoriza schema ni migrations en la implementación inicial.

El backend rollback, si fuera necesario, debe limitarse a retirar la autorización/proyección/tests/OpenAPI de HU-023 incorporados por D16; no debe alterar el backend administrativo de HU-024 ni la ruta operativa existente protegida por `AttendanceManage`.

Frontend rollback puede realizarse feature-wise:

- restaurar las páginas/rutas previas;
- restaurar navigation target previo;
- retirar hooks/query keys nuevos;
- retirar personal/admin page composition;
- retirar tests/docs del block.

La regeneración del cliente debe reflejar el runtime OpenAPI vigente; no se revertirá manualmente un archivo generado de forma aislada.

## Success Criteria

### HU-023

- `/mi-asistencia` permanece accesible a cualquier User autenticado.
- Eligibility propia no depende exclusivamente del rol `EMPLEADO`.
- User sin Employee obtiene estado explícito.
- Personal CheckIn funciona para cualquier User autenticado vinculado a Employee, con Employee derivado de la identidad y sin `EmployeeId` arbitrario del caller.
- Personal CheckOut funciona bajo la misma frontera identity-bound y solo sobre el Employee vinculado al User.
- Pending evita doble submit.
- Server response es autoridad de timestamps y lifecycle.
- La lectura personal expone lifecycle, schedule snapshots, punctuality y `workedMinutes` backend-authoritativos mediante la proyección D16.
- Lateness no se recalcula frontend.
- workedMinutes no se reconstruye como business authority.
- Elapsed local se utiliza solo mientras la asistencia está activa.
- Own history usa current month por default.
- Own history usa server pagination.
- Múltiples records en un BusinessDate son soportados.
- Loading/empty/error están definidos.
- Responsive implementation existe.
- Manual responsive evidence queda `DEFERRED_TO_SPRINT_FINAL_AUDIT`.

### HU-024

- `/asistencia` permite ADMIN/ENC/CONTADORA.
- MESERO/COCINA/EMPLEADO no acceden directamente.
- HU-024 es read-only.
- Filters usan Employee/from/to/ShiftType/AttendanceLifecycle reales.
- Default = current month.
- Summary usa backend:
  - totalRecords;
  - lateCount;
  - totalWorkedMinutes;
  - absenceCount.
- Pagination no altera summary.
- Table desktop y cards mobile existen.
- Detail read-only usa row/snapshot data real.
- No se crea detail endpoint.
- Employee stats se muestran solo contextualmente.
- CONTADORA no obtiene mutation actions.
- No FAB/create/edit/delete/manual CheckIn/manual CheckOut.
- No HU-031 leakage.

### Cross-Cutting

- Un único global nav item `Asistencia`.
- Navigation target es capability-aware.
- Multi-role = union.
- El backend nuevo se limita al alcance HU-023 expresamente autorizado por D16; HU-024 conserva su backend administrativo sin cambios.
- No migration ni schema change en la implementación inicial; una brecha persistente genuinamente necesaria exige detenerse y reabrir la decisión.
- OpenAPI runtime y generated client deben sincronizarse con cualquier cambio autorizado de HU-023; el generated client no se edita manualmente.
- No new dependency.
- Frontend gates reales pasan.
- Backend regression se ejecuta según convention del repo.
- Docs factual.
- Manual evidence no bloquea el block.
