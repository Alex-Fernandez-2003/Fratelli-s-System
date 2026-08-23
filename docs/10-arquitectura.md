# 10 — Arquitectura

## 1. Propósito

Este documento define la arquitectura técnica base de **Restaurant System** para Fratelli. La arquitectura debe permitir implementar el MVP de forma ordenada, facilitar el trabajo paralelo del equipo y mantener integridad en procesos críticos como ventas, producción, compras, inventario y cierre de caja.

La baseline se apoya en:

```text
docs/05-alcance-y-mvp.md
docs/06-srs.md
docs/requirements/
docs/07-product-backlog.md
docs/08-scrum-y-refinamiento.md
docs/09-ux-y-flujos.md
```

El detalle de entidades y relaciones se definirá posteriormente en `docs/11-modelo-datos.md`.

---

# 2. Resumen de decisiones

| Área                  | Decisión                                     |
| --------------------- | -------------------------------------------- |
| Estilo general        | Monolito modular                             |
| Frontend              | React + TypeScript + Vite + Tailwind CSS     |
| Organización frontend | Atomic Design + `features/`                  |
| Navegación            | React Router                                 |
| Server state          | TanStack Query                               |
| Backend               | ASP.NET Core 10 Web API                      |
| Organización backend  | Clean Architecture                           |
| Persistencia          | PostgreSQL                                   |
| ORM                   | Entity Framework Core + Npgsql               |
| Contrato              | REST + JSON + OpenAPI                        |
| Auth                  | ASP.NET Core Identity + JWT Bearer           |
| Autorización          | Roles múltiples + policies basadas en roles  |
| Tiempo real           | SignalR para Cocina/KDS                      |
| Inventario            | Existencia actual + historial de movimientos |
| Transacciones         | Obligatorias en operaciones críticas         |
| Errores API           | ProblemDetails + manejo centralizado         |
| Storage externo       | Fuera del MVP                                |
| Hardware              | Fuera del MVP                                |
| Offline               | Fuera del MVP                                |
| Docker                | Opcional, uso para demo en HomeLab           |
| Hosting               | No fijado; HomeLab para pruebas              |

---

# 3. Drivers arquitectónicos

Los drivers principales son:

- integridad transaccional;
- trazabilidad de operaciones;
- múltiples roles por usuario;
- actualización rápida de comandas;
- estructura clara para un equipo con varios desarrolladores frontend;
- tiempo reducido de implementación;
- facilidad para demostrar el sistema en HomeLab;
- posibilidad de evolución sin introducir infraestructura distribuida.

---

# 4. Principios

## 4.1 Backend como autoridad

El backend valida:

- permisos;
- estados;
- transiciones;
- reglas;
- cálculos;
- integridad.

El frontend mejora UX, pero no sustituye estas validaciones.

## 4.2 Dependencias hacia adentro

La lógica de dominio no depende de:

- EF Core;
- PostgreSQL;
- HTTP;
- SignalR;
- React;
- infraestructura de despliegue.

## 4.3 Contratos separados

```text
Entidad de dominio / persistencia
≠
DTO de entrada
≠
DTO de salida
```

## 4.4 Evitar sobrearquitectura

Clean Architecture se usará para ordenar responsabilidades, no para crear interfaces o capas sin valor.

---

# 5. Estilo general — Monolito modular

Se adopta:

```text
1 frontend
+
1 backend
+
1 PostgreSQL
```

El backend será un único desplegable ASP.NET Core, pero internamente se organizará en módulos.

```text
Identity
Catalog
Inventory
Production
Orders
Kitchen
Sales
Customers
Suppliers
Purchasing
Expenses
Attendance
Shifts
CashClosing
Reports
```

No se implementarán microservicios.

---

# 6. Dependencias funcionales

```text
Catalog
   ↓
Inventory
   ↓
Production

Catalog
   ↓
Orders
   ↓
Kitchen
   ↓
Sales
   ↓
Inventory

Suppliers
   ↓
Purchasing
   ↓
Inventory

Attendance
   ↓
Reports

Shifts
   ↓
Sales
   ↓
CashClosing

Expenses
   ↓
CashClosing
```

Estas dependencias ayudarán a priorizar implementación y evitar bloquear frontend.

---

# 7. Estructura backend

```text
backend/
├── RestaurantSystem.sln
├── src/
│   ├── RestaurantSystem.Domain/
│   ├── RestaurantSystem.Application/
│   ├── RestaurantSystem.Infrastructure/
│   └── RestaurantSystem.Api/
└── tests/
    ├── RestaurantSystem.Domain.Tests/
    ├── RestaurantSystem.Application.Tests/
    └── RestaurantSystem.IntegrationTests/
```

---

# 8. Domain

`RestaurantSystem.Domain` contendrá:

```text
Entities/
Enums/
ValueObjects/
Exceptions/
Common/
```

y agrupación por módulo cuando mejore la lectura.

Responsabilidades:

- entidades;
- estados;
- invariantes;
- reglas puras;
- cálculos;
- conceptos de dominio.

Domain no referencia infraestructura.

---

# 9. Application

`RestaurantSystem.Application` coordina casos de uso.

Estructura orientativa:

```text
Application/
├── Common/
│   ├── Interfaces/
│   ├── Models/
│   └── Results/
├── Identity/
├── Catalog/
├── Inventory/
├── Production/
├── Orders/
├── Kitchen/
├── Sales/
├── Customers/
├── Suppliers/
├── Purchasing/
├── Expenses/
├── Attendance/
├── Shifts/
├── CashClosing/
└── Reports/
```

Cada módulo podrá contener:

```text
DTOs/
Interfaces/
Mappers/
Services/
Validators/
```

según necesidad.

---

# 10. DTOs

Convenciones:

```text
Create<Entity>Request
Update<Entity>Request
<Entity>Response
<Entity>SummaryResponse
```

Ejemplo:

```text
Sale
≠
CreateSaleRequest
≠
SaleResponse
```

Nunca se expondrán directamente entidades EF Core.

---

# 11. Mappers

Los mappers estarán separados por feature.

Ejemplo:

```text
Application/Sales/Mappers/SaleMapper.cs
```

Se prefieren mapeos explícitos o métodos de extensión para mantener claridad. No se hace obligatoria una librería automática de mapping.

---

# 12. Interfaces

Application define contratos para dependencias externas.

Ejemplos:

```text
IProductRepository
IInventoryRepository
IOrderRepository
ISaleRepository
IPurchaseRepository
IAttendanceRepository
ICashClosingRepository
IUnitOfWork
ICurrentUser
IKitchenRealtimeNotifier
```

Infrastructure implementa esos contratos.

---

# 13. Repository Pattern

Se utilizarán repositorios orientados al dominio.

Se prefiere:

```text
ISaleRepository
IInventoryRepository
```

sobre depender únicamente de un `IRepository<T>` genérico.

Un repositorio específico puede expresar consultas con significado del dominio.

---

# 14. Unit of Work

Se utilizará una abstracción ligera para coordinación y transacciones.

Conceptualmente:

```text
IUnitOfWork
├── SaveChangesAsync()
└── ExecuteInTransactionAsync(...)
```

La implementación utilizará EF Core.

---

# 15. Infrastructure

`RestaurantSystem.Infrastructure` contendrá:

```text
Infrastructure/
├── Persistence/
│   ├── RestaurantDbContext.cs
│   ├── Configurations/
│   ├── Repositories/
│   └── Migrations/
├── Identity/
├── Realtime/
└── DependencyInjection.cs
```

---

# 16. Persistencia

Tecnologías aprobadas:

```text
PostgreSQL
Entity Framework Core
Npgsql
```

`RestaurantDbContext` será la unidad principal de persistencia.

Las configuraciones de entidades se separarán en `Persistence/Configurations/`.

---

# 17. Migrations

Las migrations canónicas estarán en Infrastructure.

Flujo esperado:

```text
dotnet ef migrations add <Nombre>
dotnet ef database update
```

La cadena de conexión se obtiene desde configuración y variables de entorno.

---

# 18. API

`RestaurantSystem.Api` será responsable de:

- HTTP;
- autenticación;
- autorización;
- middleware;
- ProblemDetails;
- OpenAPI;
- SignalR;
- CORS;
- health checks;
- composición de dependencias.

---

# 19. Convención de rutas

Base API:

```text
/api/v1
```

Rutas conceptuales:

```text
/api/v1/auth
/api/v1/users
/api/v1/products
/api/v1/inventory
/api/v1/production
/api/v1/orders
/api/v1/sales
/api/v1/customers
/api/v1/suppliers
/api/v1/purchases
/api/v1/expenses
/api/v1/attendance
/api/v1/shifts
/api/v1/cash-closings
/api/v1/reports
```

Los endpoints exactos se definirán por historia/OpenSpec.

---

# 20. Puertos de desarrollo

Convenciones:

```text
Frontend:
http://localhost:8087

Backend:
http://localhost:5087
```

El puerto del backend se configurará en el perfil de ejecución.

---

# 21. Proxy Vite

El frontend utilizará rutas relativas.

```text
/api
    ↓
http://localhost:5087

/hubs
    ↓ WebSocket
http://localhost:5087
```

---

# 22. Frontend

Stack:

```text
React
TypeScript
Vite
Tailwind CSS
React Router
TanStack Query
```

---

# 23. Arquitectura frontend — Atomic Design + Features

Se combinan:

```text
Atomic Design
→ componentes globales reutilizables

features/
→ funcionalidad específica del negocio
```

---

# 24. Estructura frontend

```text
frontend/
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── providers/
│   │   └── config/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── kitchen/
│   │   ├── sales/
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── production/
│   │   ├── suppliers/
│   │   ├── purchases/
│   │   ├── expenses/
│   │   ├── customers/
│   │   ├── attendance/
│   │   ├── shifts/
│   │   ├── cash-closing/
│   │   ├── reports/
│   │   └── users/
│   ├── api/
│   │   ├── generated/
│   │   └── client/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── utils/
│   └── main.tsx
├── vite.config.ts
└── package.json
```

---

# 25. Regla para `features/`

El trabajo funcional frontend se realizará principalmente en:

```text
src/features/<modulo>/
```

Plantilla recomendada:

```text
features/orders/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
├── types/
└── index.ts
```

Los desarrolladores frontend deberán evitar modificar infraestructura global salvo necesidad real. Y con autorización del Scrum Master

---

# 26. Atomic Design

## Atoms

```text
Button
Input
Label
Badge
Spinner
IconButton
```

## Molecules

```text
FormField
SearchInput
ConfirmDialog
StatusBadge
```

## Organisms

```text
Sidebar
Topbar
DataTable
EntityForm
```

## Templates

```text
AppLayout
DashboardLayout
FormPageLayout
```

Los componentes específicos de un dominio permanecen dentro de su feature.

---

# 27. Feature template

Se recomienda incluir:

```text
src/features/_template/
```

con la estructura de referencia.

Esto facilitará que el equipo copie una base coherente para nuevas features.

---

# 28. Manuales frontend

Al crear el scaffold deberá existir un manual de uso para la instalación del frontend:

```text
frontend/README.md
```

Debe explicar:

- instalación;
- `npm run dev`;
- backend requerido;
- puertos;
- proxy;

Al crear el scaffold deberá existir un manual de uso para los desarrolladores:

```text
frontend/docs/manual-de-uso.md
```

Debe explicar:

- Atomic Design;
- uso de `features/`;
- cómo reutilizar componentes;
- cómo agregar página;
- cómo agregar ruta;
- cómo consumir API;
- cómo regenerar cliente OpenAPI;
- qué código generado no se edita.

---

# 29. Routing

Las rutas se centralizan en:

```text
src/app/router/
```

Las features pueden exportar páginas o definiciones auxiliares, pero no crear routers globales aislados.

---

# 30. Estado frontend

```text
TanStack Query
→ server state

React local state
→ interacción local

Context
→ sesión/autenticación y estado transversal pequeño
```

Redux no se incorpora inicialmente.

---

# 31. OpenAPI

OpenAPI será el contrato principal frontend-backend.

Documento esperado:

```text
/openapi/v1.json
```

---

# 32. Cliente generado

Ruta:

```text
src/api/generated/
```

Regla:

> Los archivos generados no se editan manualmente.

Flujo:

```text
Backend modifica contrato
        ↓
OpenAPI actualizado
        ↓
npm run api:generate
        ↓
cliente y tipos regenerados
        ↓
feature consume contrato tipado
```

---

# 33. Configuración común del cliente

Ruta:

```text
src/api/client/
```

Responsabilidades:

- base URL;
- JWT;
- headers;
- manejo común de errores;
- conexión con TanStack Query.

No se creará un cliente HTTP independiente por feature.

---

# 34. Generador OpenAPI

La decisión arquitectónica fija que el cliente será generado desde OpenAPI.

La herramienta específica se elegirá durante el scaffold.

Debe ser compatible con:

```text
TypeScript
+
TanStack Query
```

La librería elegida será un detalle de implementación, no una dependencia arquitectónica rígida.

---

# 35. Autenticación

Se utilizará:

```text
ASP.NET Core Identity
+
JWT Bearer
```

Identity gestiona:

- usuarios;
- contraseñas;
- roles;
- relación usuario-rol.

---

# 36. Roles múltiples

Un usuario puede poseer varios roles.

Ejemplo:

```text
Usuario
├── MESERO
└── ENCARGADO
```

La autorización efectiva deriva de la unión de sus roles válidos.

---

# 37. Policies basadas en roles

Se podrán declarar policies para reglas con significado funcional.

Ejemplo:

```text
CanCloseCash
→ ADMINISTRADOR
→ ENCARGADO
```

No se implementa una tabla dinámica adicional de permisos en el MVP.

---

# 38. Almacenamiento del token

El backend utilizará JWT Bearer.

La estrategia definitiva de persistencia del token en navegador se revisará en:

```text
docs/12-seguridad-y-riesgos.md
```

La arquitectura no obliga a una solución insegura como consecuencia de esta decisión.

---

# 39. SignalR

SignalR se utilizará inicialmente solo para Cocina/KDS.

Hub:

```text
/hubs/kitchen
```

REST seguirá siendo la fuente de verdad.

---

# 40. Flujo de comanda en tiempo real

```text
Mesero crea pedido
        ↓
POST /api/v1/orders
        ↓
Backend confirma transacción
        ↓
SignalR publica cambio
        ↓
KDS recibe evento
        ↓
TanStack Query invalida/refresca
```

---

# 41. Reconexión SignalR

Ante pérdida temporal:

```text
desconexión
   ↓
reintento
   ↓
reconexión
   ↓
refresco REST
```

No se implementa cola offline.

---

# 42. Inventario

Principio:

```text
Existencia actual
+
Historial de movimientos
```

La existencia actual optimiza consulta.

El historial explica la causa de cada cambio.

---

# 43. Tipos conceptuales de movimiento

Como baseline:

```text
ENTRY
SALE
PRODUCTION_CONSUMPTION
PRODUCTION_OUTPUT
PURCHASE_RECEIPT
WRITE_OFF
ADJUSTMENT
```

Los nombres exactos se formalizarán en `11-modelo-datos.md`.

---

# 44. Regla de modificación de stock

El stock no debe modificarse arbitrariamente desde controllers o componentes.

Patrón:

```text
Caso de uso
   ↓
Movimiento
   ↓
Actualización de existencia
```

---

# 45. Stock negativo

El negocio permite continuar venta con stock insuficiente.

Por tanto, no se impondrá una restricción general:

```text
stock >= 0
```

para las existencias que admiten este comportamiento.

Frontend advierte; backend permite el caso conforme a reglas.

---

# 46. Transacciones críticas

## Venta

```text
crear venta
+ detalle
+ pago
+ movimientos
+ existencias
+ responsable
```

## Producción

```text
crear producción
+ consumir ingredientes
+ movimientos
+ aumentar preparación
+ responsable
```

## Recepción

```text
actualizar compra
+ recepción
+ movimientos
+ inventario
```

## Cierre

```text
cierre
+ datos asociados
+ diferencia
+ observación
+ responsable
```

Cada grupo debe completarse o revertirse como unidad.

---

# 47. Concurrencia

El detalle se definirá en datos.

Se contemplan:

- transacciones;
- restricciones;
- validaciones dentro de la transacción;
- concurrencia optimista donde aporte valor.

No se introduce locking distribuido.

---

# 48. Auditoría

Campos comunes cuando correspondan:

```text
CreatedAt
CreatedBy
UpdatedAt
UpdatedBy
```

Operaciones críticas conservarán responsable explícito.

No se implementa Event Sourcing.

---

# 49. Errores

La API utilizará manejo centralizado y ProblemDetails.

Ejemplo conceptual:

```json
{
  "title": "No se pudo confirmar la venta",
  "status": 400,
  "code": "SALE_INVALID_STATE"
}
```

No se devolverán stack traces al usuario final.

---

# 50. Validación por capas

```text
Frontend
→ feedback inmediato

Application / Domain
→ regla autoritativa

Database
→ integridad estructural
```

---

# 51. Logging

Se utilizará `ILogger` y logging estructurado.

Se registrarán:

- errores;
- fallos técnicos;
- eventos relevantes;
- problemas de SignalR;
- problemas de autenticación sin secretos.

---

# 52. Health check

Endpoint:

```text
/health
```

Debe permitir verificar backend y, cuando corresponda, conectividad con PostgreSQL.

---

# 53. Configuración y secretos

Configuración mediante:

- `appsettings`;
- variables de entorno;
- User Secrets para desarrollo.

Ejemplos:

```text
ConnectionStrings__DefaultConnection
Jwt__Key
Jwt__Issuer
Jwt__Audience
```

No se almacenan credenciales reales en Git.

---

# 54. CORS

Desarrollo:

```text
http://localhost:5173
```

si el acceso directo lo requiere.

Se prefiere proxy para reducir configuración duplicada.

---

# 55. Storage externo

Fuera del MVP.

No se implementará:

- S3;
- Supabase Storage;
- Google Drive;
- Azure Blob.

Si se agrega en Post-MVP deberá introducirse detrás de una abstracción.

---

# 56. Hardware

Biométrico e impresora térmica están fuera del MVP.

No se implementan ahora.

Una integración futura podrá utilizar un agente/adaptador local separado.

---

# 57. Offline

Se adopta:

```text
online-first
```

No se implementa:

- base local;
- sincronización;
- cola offline;
- resolución de conflictos.

---

# 58. HomeLab

El HomeLab se usará para:

- pruebas integradas;
- demostración;
- validar PostgreSQL;
- validar frontend/backend;
- validar SignalR.

No se define como hosting definitivo.

---

# 59. Docker

No es obligatorio para desarrollo.

Para HomeLab podrá utilizarse:

```text
docker-compose.yml
├── frontend
└── backend
```

PostgreSQL puede permanecer en la instancia ya existente del HomeLab.

---

# 60. Despliegue HomeLab

```text
Browser
   ↓
Frontend / reverse proxy
   ├── /
   │   → React
   ├── /api/
   │   → ASP.NET Core
   └── /hubs/
       → SignalR WebSocket
              ↓
         PostgreSQL HomeLab
```

---

# 61. Same-origin

En demo se prefiere mantener:

```text
/
 /api/
 /hubs/
```

bajo el mismo host.

Beneficios:

- configuración más simple;
- menos CORS;
- rutas consistentes;
- WebSocket centralizado.

---

# 62. IP y credenciales del HomeLab

No se hardcodean.

Se configuran mediante variables de entorno.

---

# 63. Estructura raíz

```text
/
├── frontend/
├── backend/
├── database/
├── docs/
├── scripts/
└── tests/
```

---

# 64. Reglas backend

- no exponer entidades EF;
- no poner lógica compleja en controllers;
- no confiar en roles enviados por frontend;
- no modificar inventario sin caso de uso;
- no hardcodear secretos;
- no devolver excepciones internas al usuario;
- repositories e interfaces deben tener propósito real.

---

# 65. Reglas frontend

- lógica funcional en `features/`;
- componentes globales reutilizables en Atomic Design;
- no hardcodear URL backend;
- no editar `api/generated/`;
- no crear clientes HTTP paralelos;
- centralizar rutas;
- usar TanStack Query para server state.

---

# 66. Responsabilidad técnica y riesgo

Alex Fernandez será responsable principalmente de:

- backend;
- base de datos;
- arquitectura;
- integraciones;
- configuración no frontend;
- algunas HU/tareas frontend.

Esto genera riesgo de cuello de botella.

Mitigaciones:

- OpenAPI temprano;
- plantilla frontend;
- rutas centralizadas;
- cliente generado;
- módulos independientes;
- priorización por dependencias;
- contratos definidos antes de bloquear a frontend.

---

# 67. OpenAPI-first pragmático

Cuando frontend necesite avanzar primero:

```text
definir contrato
   ↓
OpenAPI
   ↓
generar cliente
   ↓
frontend implementa
   ↓
backend completa caso de uso
```

No se diseña toda la API anticipadamente; solo lo necesario para historias próximas.

---

# 68. Testing arquitectónico

Se contemplan:

```text
Domain.Tests
Application.Tests
IntegrationTests
```

IntegrationTests deberá validar PostgreSQL real cuando el comportamiento dependa del motor.

EF Core InMemory no será la única evidencia de integración.

---

# 69. Dependencias entre proyectos

Permitido:

```text
Application → Domain

Infrastructure → Application
Infrastructure → Domain

Api → Application
Api → Infrastructure  # composición / DI
```

No permitido:

```text
Domain → Infrastructure
Domain → Api
Application → Api
```

---

# 70. Diagramas

Se generan:

```text
docs/puml/arquitectura-contenedores.puml
docs/puml/arquitectura-clean-backend.puml
docs/puml/arquitectura-frontend.puml
docs/puml/arquitectura-despliegue-homelab.puml
```

Renderizados:

```text
docs/images/arquitectura-contenedores.png
docs/images/arquitectura-clean-backend.png
docs/images/arquitectura-frontend.png
docs/images/arquitectura-despliegue-homelab.png
```

---

# 71. ADR

Se registran en:

```text
docs/adr/ADR-001-monolito-modular-clean-architecture.md
docs/adr/ADR-002-frontend-atomic-features-openapi.md
docs/adr/ADR-003-postgresql-ef-core.md
docs/adr/ADR-004-identity-jwt-roles.md
docs/adr/ADR-005-signalr-kds.md
docs/adr/ADR-006-homelab-demo-deployment.md
```

---

# 72. Decisiones explícitamente descartadas

No forman parte de la baseline:

```text
Microservicios
Kubernetes
Kafka/RabbitMQ obligatorio
GraphQL
Event Sourcing
Service Mesh
CQRS completo
Redis obligatorio
offline-first
storage externo MVP
hardware MVP
```

---

# 73. Riesgos arquitectónicos

## RA-01 — Cuello de botella backend

Mitigación:

- OpenAPI;
- scaffolding;
- contratos;
- priorización;
- módulos.

## RA-02 — Clean Architecture excesiva

Mitigación:

- interfaces solo con propósito;
- repositories específicos;
- evitar capas vacías.

## RA-03 — Desincronización frontend/backend

Mitigación:

- OpenAPI;
- cliente generado;
- DTOs;
- proxy.

## RA-04 — Complejidad SignalR

Mitigación:

- limitarlo a KDS;
- REST como fuente de verdad;
- reconexión + refresh.

## RA-05 — Inconsistencia de inventario

Mitigación:

- movimientos;
- transacciones;
- backend como autoridad;
- auditoría.

## RA-06 — Diferencias local/HomeLab

Mitigación:

- rutas relativas;
- variables de entorno;
- reverse proxy;
- no hardcodear IP.

---

# 74. Próximo documento

El siguiente documento principal será:

```text
docs/11-modelo-datos.md
```

Deberá formalizar:

- entidades;
- relaciones;
- claves;
- unidades;
- estados;
- movimientos;
- restricciones;
- índices;
- auditoría;
- diccionario de datos.

---

# 75. Control de cambios

| Versión | Descripción                                                                                                                                                               | Estado  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `0.1`   | Baseline arquitectónica aprobada: monolito modular, Clean Architecture, Atomic Design + features, OpenAPI, PostgreSQL/EF Core, Identity/JWT, SignalR y HomeLab de pruebas | Vigente |
