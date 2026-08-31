# HU-007 — Registrar produccion y generar lote

## Resultado

**FRONTEND IMPLEMENTADO**.

La implementacion backend ya existia en develop (endpoints `GET /products/{id}/production-requirements` y `POST /productions`). El frontend agrega la pagina de registro de produccion con formulario, modal de confirmacion y pantalla de exito.

## Reglas implementadas

Ver el mapa contractual especifico de esta HU en [handoff Sprint 2](../handoffs/sprint-2-backend-frontend-handoff.md). Las reglas de negocio, actor autenticado, importes/cantidades calculadas en servidor e inventario unico se mantienen en backend.

## Seguridad

Las rutas requieren autenticacion y politicas backend (`KitchenManage`); los identificadores de actor se obtienen de los claims, no del request. Solo COCINA, ENCARGADO y ADMINISTRADOR pueden acceder.

## Frontend y validacion

El frontend agrega la pagina **Registrar Produccion** (`RegisterProductionPage`) sobre `http-client` y React Query (`api.ts`), con:

- Selector de producto tipo PREPARATION con busqueda
- Campo de cantidad y notas
- Vista previa de ingredientes a consumir con stock actual vs requerido
- Modal de confirmacion con warning icon y resumen
- Pantalla de exito con check verde, nombre, cantidad, fecha y responsable
- Responsive con Tailwind CSS y lucide-react
- Ruta `/produccion/registrar` protegida por roles COCINA/ENCARGADO/ADMINISTRADOR

## Visibilidad y roles

La vista de Produccion solo es visible en la navegacion y accesible por ruta (`RequireAnyRole`) para `COCINA`, `ENCARGADO` y `ADMINISTRADOR`. Los demas roles (MESERO, CONTADORA, etc.) no ven esta pagina.

## Baseline revalidado

- Branch/HEAD: `develop` / `9cec685`.

## Evidencia real

- Frontend: `tsc --noEmit` PASS
- Frontend: `eslint` PASS
- Frontend: `vite build` PASS
- Backend: `dotnet build` PASS

## Manifest de archivos del change

### Frontend

| Archivo |
| --- |
| `src/features/production/api.ts` |
| `src/features/production/pages.tsx` |
| `src/features/production/index.ts` |
| `src/features/navigation.tsx` |
| `src/routes/AppRoutes.tsx` |

### Documentacion

- `docs/historias/HU-007-spri.md`
- `docs/handoffs/sprint-2-backend-frontend-handoff.md`

## Evidencias

![Captura del formulario de registro de produccion](../capturas/HU-007-formulario.png)

---

### Captura de confirmacion y exito

![Captura de confirmacion y exito](../capturas/HU-007-confirmacion-exito.png)

## Estado de entrega

**FRONTEND IMPLEMENTADO**. Ruta: `/produccion/registrar`.
