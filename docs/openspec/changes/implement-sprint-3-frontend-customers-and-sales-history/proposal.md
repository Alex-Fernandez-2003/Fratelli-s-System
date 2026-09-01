# Proposal

## Problem Statement

El backend de Sprint 3 para HU-014 y HU-015 se declara implementado, verificado y archivado, pero el frontend todavía necesita exponer esas capacidades de forma usable, responsive y coherente con la arquitectura existente.

El change `implement-sprint-3-frontend-customers-and-sales-history` debe completar un bloque frontend cohesivo:

- HU-014 — gestión básica de Customers y asociación opcional de Customer a `ConfirmSale`.
- HU-015 — historial y detalle de Sales dentro del alcance autorizado, incluyendo comprobante interno PDF generado client-side.

La auditoría disponible confirma una base frontend React/TypeScript/Vite con `pnpm`, TanStack Query, React Router, Vitest/Testing Library, Lucide y tipos TypeScript generados desde OpenAPI. El snapshot público visible de `develop` todavía muestra `frontend/src/features/` con módulos de Sprint 1/2 y un router sin Customers/Sales History; además, su `api.generated.ts` público no expone de forma verificable los contratos Sprint 3 buscados. Esto contradice deliberadamente la instrucción del usuario de tomar el working tree LOCAL ACTUAL —que puede incluir cambios no publicados— como autoridad. Por tanto, ese snapshot público sirve solo para confirmar patrones arquitectónicos, no para congelar nombres finales del contrato Sprint 3. citeturn386962view0turn325654view4turn152392view3

En la base pública visible sí se confirma que:

- `pnpm@11.18.0` es el package manager declarado.
- existen scripts `build`, `format:check`, `typecheck`, `lint`, `test` y `api:generate`;
- React, React Router, TanStack Query y Lucide ya forman parte de las dependencias;
- la navegación autenticada está centralizada y filtra por unión de roles;
- el shell ya contempla sidebar desktop y navegación mobile tipo drawer;
- existen primitives compartidos como `DataTable`, `EmptyState`, `Spinner`, formularios y feedback. citeturn386962view4turn460683view0turn460683view1turn460683view2turn293499view0turn460683view3

La metodología y el formato de estos artifacts siguen Gentle AI SDD/OpenSpec: OpenSpec es la fuente canónica, la fase actual es pre-ejecución y no debe ejecutar APPLY. fileciteturn16file0 fileciteturn16file1 fileciteturn16file2 fileciteturn16file3

## Goals

- Implementar HU-014 y HU-015 como un único change frontend cohesivo, manteniendo trazabilidad individual por HU.
- Reutilizar el contrato TypeScript generado REAL del working tree local sin duplicar DTOs backend manualmente.
- Crear la experiencia de Customers con:
  - listado;
  - búsqueda server-side;
  - paginación server-side;
  - filtro de estado únicamente si el contrato real lo soporta;
  - create;
  - edit;
  - activate/deactivate;
  - desktop table;
  - mobile cards;
  - estados loading/error/empty.
- Respetar los permisos congelados de Customer:
  - `ADMINISTRADOR`: read/create/edit/status.
  - `ENCARGADO`: read/create/edit/status.
  - `MESERO`: read/create/edit, sin activate/deactivate.
- Extender el `ConfirmSale` EXISTENTE con asociación opcional de Customer sin reemplazar el flujo de venta.
- Permitir `Consumidor final` mediante `customerId = null` o equivalente exacto del contrato.
- Permitir quick-create de Customer desde ConfirmSale reutilizando el mismo formulario de Customers.
- Seleccionar automáticamente el Customer devuelto por backend después de quick-create exitoso.
- Preservar payment, channel, Shift, shortage acknowledgement, order lifecycle e invalidaciones existentes de ConfirmSale.
- Implementar HU-015 Sales History:
  - período por defecto = hoy;
  - filtros contractuales reales;
  - paginación server-side;
  - desktop table;
  - mobile cards;
  - detalle responsive;
  - snapshots históricos de Customer;
  - scope de MESERO limitado al current assigned active Shift;
  - experiencia amplia para roles con capability amplia;
  - unión de capabilities para multi-role.
- Implementar comprobante interno PDF client-side desde Sale detail.
- Mantener el PDF explícitamente no fiscal.
- Integrar Customers y Sales History con router, guards, navegación desktop y navegación mobile existentes.
- Adaptar las siete referencias visuales al contrato real sin incorporar datos o capabilities ficticias.
- Mantener backend, migrations y OpenAPI backend sin cambios.
- Mantener `frontend/src/types/api.generated.ts` sin edición manual.
- Añadir cobertura automatizada suficiente y validar 360px, tablet y desktop.
- Actualizar HU-014 y HU-015 únicamente después de implementación y validación reales.

## Non-Goals

- No modificar backend.
- No modificar EF Core, migrations, entidades o policies backend.
- No cambiar OpenAPI.
- No editar manualmente tipos generados.
- No implementar HU-008, HU-019, HU-021, HU-023, HU-024 ni HU-026 a HU-031.
- No implementar reports financieros.
- No mostrar métricas monetarias agregadas dentro de HU-015.
- No implementar Customer delete.
- No implementar Customer phone, email, address, credit, loyalty, fiscal profile o birthday.
- No crear un Customer persistido llamado `Consumidor final`.
- No permitir modificar la asociación Customer-Sale después de confirmada la Sale.
- No mostrar ni soportar `Tarjeta`, `Transferencia`, `QR Simple` u otros PaymentMethod no contractuales.
- No añadir SalesChannel distintos de `DIRECT` y `PEDIDOSYA`.
- No implementar descuentos.
- No implementar IVA.
- No implementar factura fiscal.
- No implementar `Reimprimir Ticket`.
- No implementar impresión térmica.
- No implementar un endpoint backend para PDF.
- No usar servicios SaaS externos de PDF.
- No crear secuencias ficticias tipo `V-9082`.
- No crear una ruta de `Nueva Venta` independiente de Order.
- No rediseñar AppShell/sidebar/mobile drawer global para replicar los mockups.
- No añadir dependencias CSV/XLSX anticipadamente.
- No realizar refactors globales de autorización, routing o query architecture no requeridos por el bloque.

## Affected Areas

### Frontend

Áreas confirmadas o probables, sujetas a revalidación del working tree local:

- `frontend/package.json` y lockfile únicamente si se incorpora una dependencia PDF.
- `frontend/src/types/api.generated.ts`: REUSE, no edición manual.
- `frontend/src/routes/` o equivalente real.
- `frontend/src/features/navigation.tsx` o definición actual equivalente.
- `frontend/src/features/auth/` para consumir helpers existentes, sin modificar la arquitectura de sesión.
- feature actual de Orders/Sales/ConfirmSale.
- nuevo feature de Customers o ubicación equivalente según patrón vigente.
- feature de Sales para history/detail o extensión del existente.
- `frontend/src/lib/api/`.
- TanStack Query/query keys.
- componentes atoms/molecules/organisms ya existentes.
- estilos/tokens responsive existentes.
- tests de rutas, navegación, Customers, ConfirmSale y Sales History.

### Documentación

- `docs/historias/` HU-014.
- `docs/historias/` HU-015.
- OpenSpec del presente change.
- handoff/evidence únicamente si la convención local real lo requiere.

## Assumptions

- El working tree LOCAL ACTUAL contiene el backend Sprint 3 archivado y el `api.generated.ts` Sprint 3 descrito por el usuario.
- El contrato generado contiene soporte para Customers, Sales History/Detail y `customerId` opcional en ConfirmSale, pero los nombres EXACTOS de paths, operations, schemas y propiedades deben confirmarse localmente antes de escribir código.
- El proyecto continúa usando la arquitectura frontend observada públicamente: React Router + `RequireAnyRole`, navegación centralizada, TanStack Query y Atomic Design/features.
- El sistema de permisos frontend actual admite unión de roles mediante `hasAnyRole` o equivalente; el snapshot público implementa precisamente esa semántica. citeturn460683view0turn460683view1
- El backend Sprint 3 no requiere cambios para completar este frontend.
- No se confirma desde la superficie disponible si existe ya una librería PDF, primitive Drawer/Sheet, formatter monetario o formatter temporal en el working tree LOCAL ACTUAL.
- No se confirma desde la superficie disponible la respuesta exacta para MESERO sin active assigned Shift.
- No se asume que el snapshot público de GitHub coincide con el working tree local solicitado.

## Risks

### Risk 1: Diseñar contra un contrato generado distinto del working tree real

- Probability: High.
- Impact: High.
- Mitigation: La primera tarea MUST inspeccionar el `api.generated.ts` LOCAL ACTUAL y congelar paths/schemas antes de implementación. No escribir adapters Customer/Sales con nombres inferidos desde este briefing.

### Risk 2: Duplicar componentes que ya aparecieron en cambios locales posteriores

- Probability: Medium.
- Impact: Medium.
- Mitigation: Auditar primero primitives, features y ConfirmSale locales; clasificar cada necesidad como REUSE/EXTEND/CREATE antes de crear archivos.

### Risk 3: Romper ConfirmSale de Sprint 2 al añadir Customer

- Probability: Medium.
- Impact: High.
- Mitigation: Mantener Customer como extensión aditiva; preservar ownership del estado de payment/channel/shortage/order y añadir regresiones del flujo existente.

### Risk 4: Confundir permisos de MESERO con una experiencia administrativa

- Probability: Medium.
- Impact: High.
- Mitigation: Separar Customer read/create/edit de Customer status management y derivar UI desde capabilities/unión de roles.

### Risk 5: Mostrar history con Customer actual en vez del snapshot histórico

- Probability: Medium.
- Impact: High.
- Mitigation: Sale History/Detail/PDF MUST mapear directamente los snapshot fields de Sale; queda prohibido rehidratar Customer actual para sustituir datos históricos.

### Risk 6: Exponer un Shift filter excesivo a MESERO

- Probability: Medium.
- Impact: High.
- Mitigation: Derivar controls de la capability efectiva; un usuario MESERO-only no recibe selector broad, mientras un multi-role con capability amplia sí.

### Risk 7: Filtrado parcial de Customers

- Probability: Medium.
- Impact: Medium.
- Mitigation: Search/status MUST ser server-side. Si el generated contract no soporta `isActive`, se omite el filtro de estado en vez de filtrar solo la página cargada.

### Risk 8: Dependencia PDF pesada o poco mantenida

- Probability: Medium.
- Impact: Medium.
- Mitigation: Evaluar durante APPLY mantenimiento, TypeScript, Vite, bundle, API browser-only y testabilidad antes de instalar. Implementar PDF detrás de un adapter de feature.

### Risk 9: PDF con datos fiscales o inventados por herencia del mockup

- Probability: Low.
- Impact: High.
- Mitigation: Test explícito de contenido: sin IVA, descuentos, invoice number, fake sale number ni datos tributarios; footer no fiscal obligatorio.

### Risk 10: Mobile overflow por trasladar tablas desktop literalmente

- Probability: Medium.
- Impact: Medium.
- Mitigation: Customers y Sales History MUST usar cards en mobile; detail MUST usar overlay compatible con viewport pequeño.

### Risk 11: Navegación pública observada está desactualizada respecto del working tree local

- Probability: High.
- Impact: Medium.
- Mitigation: No congelar ruta exacta ni ubicación de nav desde GitHub público; revalidar router y navigation local en Task 1.

## Rollback Strategy

No se esperan cambios persistentes ni backend.

La reversión debe poder hacerse por unidades frontend:

- retirar Customers route/nav sin modificar Auth/AppShell;
- retirar integración Customer de ConfirmSale manteniendo intacto el flujo de venta previo;
- retirar Sales History route/nav sin afectar Orders;
- retirar adapter/dependencia PDF si presenta regresiones;
- mantener generated API intacta porque este change no modifica OpenAPI;
- conservar Customer/Sales tests únicamente si documentan contratos existentes y siguen siendo válidos;
- verificar rollback mediante:
  - ConfirmSale sin Customer;
  - Orders flow existente;
  - router/navigation;
  - build/typecheck/test.

Si durante APPLY se descubre que alguna tarea requiere cambio backend/OpenAPI, no aplicar esa parte dentro de este change; clasificarla como `BACKEND_CONTRACT_BLOCKER`.

## Success Criteria

- El working tree local es auditado y los contratos exactos de HU-014/HU-015 quedan documentados antes de implementar.
- Customer management es accesible a los roles autorizados.
- `MESERO` puede read/create/edit Customer y no ve ni ejecuta activate/deactivate.
- Customer create/edit usa Name, CI, NIT opcional y Notes opcional, sin toggle editable de IsActive.
- Customer search utiliza backend por Name/CI/NIT.
- Customer pagination utiliza backend.
- ConfirmSale permite Customer activo o `Consumidor final`.
- Quick-create reutiliza el mismo CustomerForm.
- Quick-create exitoso selecciona por ID retornado, no por Name.
- ConfirmSale con Customer envía únicamente `customerId` además de su contrato existente.
- ConfirmSale sin Customer conserva el flujo existente.
- Sales History inicia en hoy.
- History usa filtros y paginación server-side.
- MESERO-only no recibe un Shift selector broad.
- Multi-role conserva unión de capabilities.
- Customer histórico proviene de Sale snapshots.
- Sale Detail muestra items y total contractuales sin IVA/descuentos ficticios.
- PDF usa Sale detail, es client-side y declara que no constituye factura fiscal.
- No existe ruta `New Sale` independiente.
- No se muestra fake sequential sale number.
- Las siete referencias visuales quedan adaptadas de forma explícita.
- 360px, tablet y desktop son utilizables sin overflow horizontal no intencional.
- Tests, `format:check`, `typecheck`, `lint` y `build` pasan usando scripts locales reales.
- Backend, migrations y OpenAPI permanecen sin cambios.
