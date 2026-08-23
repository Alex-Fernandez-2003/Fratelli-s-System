# 15 — Plan de desarrollo

## 1. Propósito

Este documento define el plan operativo para pasar de la baseline documental de **Restaurant System** a la implementación incremental del MVP de Fratelli.

El plan organiza:

- Sprint 0 técnico;
- preparación del frontend y backend;
- flujo Git;
- configuración local;
- PostgreSQL y EF Core;
- integración frontend/backend;
- sistema visual base;
- cliente HTTP y tipos OpenAPI;
- infraestructura de pruebas;
- distribución inicial de las Historias de Usuario;
- ejecución de los Sprints 1, 2 y 3;
- gates de `Ready`, `Review` y `Done`;
- validación con Product Owner;
- preparación de HomeLab para demostración;
- mantenimiento de trazabilidad y evidencias.

Este documento no constituye evidencia de implementación.

Toda actividad marcada como futura deberá ejecutarse y verificarse antes de declararse completada.

---

# 2. Documentos de entrada

El plan se apoya en:

```text
docs/00-ficha-proyecto.md
docs/01-contexto-y-diagnostico.md
docs/02-relevamiento.md
docs/03-hallazgos-y-necesidades.md
docs/04-objetivos-y-propuesta-valor.md
docs/05-alcance-y-mvp.md
docs/06-srs.md
docs/requirements/
docs/07-product-backlog.md
docs/08-scrum-y-refinamiento.md
docs/09-ux-y-flujos.md
docs/10-arquitectura.md
docs/11-modelo-datos.md
docs/12-seguridad-y-riesgos.md
docs/13-pruebas-y-validacion.md
docs/14-trazabilidad.md
```

---

# 3. Estado de entrada

Antes de iniciar desarrollo se dispone de:

```text
problema identificado
+
evidencia de relevamiento
+
necesidades
+
objetivos
+
alcance/MVP
+
SRS
+
RF/RNF/RN
+
Product Backlog
+
DoR/DoD
+
UX/flujos
+
arquitectura
+
modelo de datos
+
seguridad/riesgos
+
estrategia de pruebas
+
trazabilidad inicial
```

Por tanto, el análisis principal se considera suficientemente avanzado para preparar el entorno de desarrollo.

---

# 4. Fases restantes

```text
Baseline documental
        ↓
Sprint 0 — Preparación de la fábrica de software
        ↓
Validación técnica de la fábrica
        ↓
Sprint Planning 1
        ↓
Sprint 1 — 4 días de trabajo
        ↓
Sprint Review + Retrospective
        ↓
Sprint 2 — 4 días de trabajo
        ↓
Sprint Review + Retrospective
        ↓
Sprint 3 — 4 días de trabajo
        ↓
Sprint Review + Retrospective
        ↓
Validación integrada
        ↓
HomeLab / demostración
        ↓
Informe final y cierre
```

---

# 5. Naturaleza del Sprint 0

Se utilizará formalmente el nombre:

```text
Sprint 0 — Preparación de la fábrica de software
```

El Sprint 0 es un bloque técnico/fundacional distinto de los tres Sprints funcionales del proyecto.

No modifica la planificación confirmada:

```text
Sprint 1 → 4 días
Sprint 2 → 4 días
Sprint 3 → 4 días
```

La duración exacta del Sprint 0 no se fija en este documento.

Su cierre depende del cumplimiento de su gate de salida.

---

# 6. Objetivo del Sprint 0

Construir una base reproducible para que todos los integrantes puedan comenzar a desarrollar Historias de Usuario sin resolver nuevamente configuraciones fundamentales.

Resultado esperado:

```text
clonar repositorio
        ↓
configurar entorno
        ↓
instalar dependencias
        ↓
configurar PostgreSQL
        ↓
aplicar migrations
        ↓
levantar backend :5057
        ↓
levantar frontend :8087
        ↓
frontend consume backend
        ↓
OpenAPI disponible en Development
        ↓
tipos TypeScript generables
        ↓
componentes frontend base disponibles
        ↓
manual de uso disponible
        ↓
equipo listo para desarrollar HU
```

---

# 7. Regla fundamental del Sprint 0

El Sprint 0:

```text
prepara
≠
implementa Historias de Usuario
```

No deberá declararse ninguna HU del Product Backlog como completada por haber creado infraestructura técnica.

Ejemplo:

```text
Identity configurado
≠
HU-001 implementada

estructura de usuarios creada por Identity
≠
HU-002 implementada

HttpClient configurado
≠
API funcional de productos

SignalR instalado
≠
HU-010 implementada
```

---

# 8. Alcance permitido del Sprint 0

Puede incluir:

```text
estructura de repositorio
solución .NET
proyectos Clean Architecture
React + TypeScript + Vite
Tailwind
React Router
TanStack Query
SignalR client
OpenAPI
generación de tipos TypeScript
cliente HTTP base
manejo base de ProblemDetails
CORS
health check
variables de entorno
EF Core
Npgsql
Identity como infraestructura
JWT como infraestructura/configuración
estructura de tests
PostgreSQL local
migrations técnicas iniciales
CSS global
tokens visuales
componentes frontend mínimos
página de UI Kit
README
manual frontend
.editorconfig
ESLint
Prettier
dotnet format
CI mínimo
```

---

# 9. Fuera del Sprint 0

No deberá completar funcionalmente:

```text
HU-001 login/logout
HU-002 administración de usuarios/roles
HU-003 catálogo
HU-004 composición
HU-005 inventario
HU-006 stock bajo
HU-007 producción
HU-008 consulta producción
HU-009 pedidos
HU-010 comandas
HU-011 cancelación
HU-012 ventas
HU-013 stock insuficiente
HU-014 clientes
HU-015 consulta ventas
HU-016 proveedores
HU-017 compras
HU-018 recepción
HU-019 consulta compras
HU-020 gastos
HU-021 consulta gastos
HU-022 asistencia
HU-023 consulta personal
HU-024 consulta administrativa
HU-025 turnos
HU-026 cálculo de cierre
HU-027 cierre
HU-028 consulta cierres
HU-029 reporte ventas
HU-030 reporte inventario
HU-031 reporte asistencia
```

Las HU se implementan en los Sprints funcionales.

---

# 10. Repositorio

Repositorio principal:

```text
https://github.com/Alex-Fernandez-2003/Fratelli-s-System.git
```

Estructura general:

```text
proyecto/
├── README.md
├── .editorconfig
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docs/
│   ├── ...
│   ├── historias/
│   ├── capturas/
│   ├── sprints/
│   ├── openspec/
│   ├── puml/
│   └── images/
│
├── frontend/
├── backend/
├── database/
├── scripts/
└── tests/
```

---

# 11. Estrategia Git

Se utilizarán tres niveles:

```text
main
develop
ramas cortas
```

---

# 12. Rama `main`

`main` representa:

```text
incremento estable
```

Reglas:

- no se realiza trabajo diario directamente sobre `main`;
- no se hace push directo ordinario;
- recibe integración desde `develop`;
- el Scrum Master controla el PR final del Sprint;
- debe representar una versión demostrable y estable.

---

# 13. Rama `develop`

`develop` representa:

```text
integración activa del Sprint
```

Reglas:

- cada rama corta parte de `develop`;
- los PR de HU/tareas apuntan a `develop`;
- contiene el incremento integrado en construcción;
- puede evolucionar diariamente;
- antes de fusionarse a `main` debe superar revisión integrada.

---

# 14. Ramas cortas

Prefijos:

```text
feature/
fix/
docs/
chore/
```

Convención:

```text
kebab-case
```

Ejemplos:

```text
feature/hu-001-login
feature/hu-009-pedidos
feature/hu-017-compras
fix/issue-42-stock-refresh
docs/hu-012-evidencia
chore/sprint-0-frontend-base
```

---

# 15. Flujo Git por HU

```text
develop
   ↓
crear rama corta
   ↓
desarrollar
   ↓
probar
   ↓
push
   ↓
Pull Request → develop
   ↓
Review
   ↓
correcciones si existen
   ↓
merge → develop
```

---

# 16. Integración al final del Sprint

```text
ramas HU
   ↓
develop
   ↓
validación integrada
   ↓
Sprint Review
   ↓
correcciones requeridas
   ↓
Scrum Master confirma estabilidad
   ↓
Pull Request develop → main
   ↓
main
```

---

# 17. Responsabilidad del Scrum Master en Git

El Scrum Master:

- revisa el estado del incremento;
- verifica que las HU cumplan el flujo acordado;
- evita merges a `main` antes de tiempo;
- controla la integración final `develop → main`;
- verifica documentación, pruebas y evidencia cuando corresponda.

La revisión de código podrá incluir colaboración de otros integrantes.

---

# 18. Convención de commits

Formato:

```text
tipo: descripción breve
```

Tipos permitidos:

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección |
| `docs` | Documentación |
| `chore` | Configuración/mantenimiento |
| `refactor` | Mejora interna sin cambiar comportamiento |
| `test` | Pruebas |

---

# 19. Ejemplos de commits

```text
feat: inicializar frontend con Vite y TypeScript
feat: agregar formulario de productos
feat: agregar endpoint de pedidos
fix: corregir actualización de inventario
docs: documentar pruebas de la venta
chore: configurar proxy del frontend
refactor: simplificar mapper de productos
test: agregar prueba de recepción de compras
```

No es obligatorio incluir `HU-XXX` en cada commit.

La relación con la historia se obtiene mediante:

```text
rama
PR
Markdown HU
GitHub Project
```

---

# 20. Convenciones de código

| Elemento | Convención |
|---|---|
| Variables y funciones | `camelCase` |
| Clases C# | `PascalCase` |
| Componentes React | `PascalCase` |
| Tipos/interfaces TS | `PascalCase` |
| Tablas PostgreSQL | `snake_case` |
| Columnas PostgreSQL | `snake_case` |
| Ramas Git | prefijo + `kebab-case` |
| Markdown | `kebab-case.md` |
| PUML | `kebab-case.puml` |

---

# 21. Formateo

Sprint 0 deberá preparar:

```text
.editorconfig
ESLint
Prettier
dotnet format
```

Objetivo:

> reducir diferencias de estilo entre integrantes sin crear un proceso complejo.

No se redactará un manual de estilo excesivo.

---

# 22. Backend — estructura base

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

# 23. Dependencias entre proyectos backend

```text
Application → Domain

Infrastructure
→ Application
→ Domain

Api
→ Application
→ Infrastructure
```

No se invertirá este flujo sin una decisión arquitectónica explícita.

---

# 24. Tecnología backend

```text
.NET 10
ASP.NET Core Web API
EF Core
Npgsql
ASP.NET Core Identity
JWT Bearer
SignalR
OpenAPI
ProblemDetails
xUnit
```

---

# 25. Puerto backend

```text
http://localhost:5057
```

Debe estar documentado en:

```text
backend/README.md
o
README principal
```

---

# 26. API base

```text
/api/v1
```

Ejemplos futuros:

```text
/api/v1/auth
/api/v1/products
/api/v1/orders
```

Sprint 0 no necesita crear todos estos endpoints.

---

# 27. Health endpoint

Sprint 0 sí deberá incluir:

```text
GET /health
```

Objetivo:

- comprobar que backend inició;
- validar conexión frontend/backend;
- servir como diagnóstico de entorno;
- no representar una HU funcional.

---

# 28. OpenAPI

En Development:

```text
/openapi/v1.json
/swagger
```

deben estar disponibles.

En HomeLab/Funnel:

```text
Environment = Production
```

y ambos estarán deshabilitados públicamente según `12-seguridad-y-riesgos.md`.

---

# 29. CORS

Durante desarrollo local:

```text
frontend
http://localhost:8087

backend
http://localhost:5057
```

Se permitirá únicamente el origen necesario.

---

# 30. ProblemDetails

El backend tendrá manejo central de errores basado en:

```text
ProblemDetails
```

Sprint 0 debe dejar preparada la infraestructura.

No es necesario implementar todos los errores de dominio todavía.

---

# 31. SignalR base

Se instalará/configurará la infraestructura necesaria.

Ruta futura:

```text
/hubs/kitchen
```

Sin embargo:

```text
KitchenHub funcional
→ HU-010
```

Sprint 0 no debe completar el KDS.

---

# 32. PostgreSQL local

Cada integrante deberá disponer de PostgreSQL accesible desde su entorno.

No se utilizará una base única compartida del HomeLab para el desarrollo diario.

---

# 33. Configuración PostgreSQL

Cada integrante configurará:

```text
host
port
database
username
password
```

mediante configuración local segura.

No se versionarán credenciales reales.

---

# 34. Cadena de conexión

Conceptualmente:

```text
ConnectionStrings__DefaultConnection
```

Puede almacenarse localmente mediante:

```text
User Secrets
variables de entorno
configuración Development ignorada
```

según la implementación final.

---

# 35. EF Core

Sprint 0 deberá preparar:

```text
DbContext
Npgsql
migrations
design-time factory si fuese necesaria
```

---

# 36. Creación/actualización automática de DB

Después de configurar PostgreSQL:

```bash
dotnet build
```

y posteriormente:

```bash
dotnet ef database update
```

En Clean Architecture, el comando podrá requerir:

```bash
dotnet ef database update \
  --project backend/src/RestaurantSystem.Infrastructure \
  --startup-project backend/src/RestaurantSystem.Api
```

La sintaxis definitiva se documentará después de crear realmente la solución.

---

# 37. Regla sobre `dotnet ef`

No se utilizará:

```text
dotnet ef build database
```

porque no corresponde a un comando válido de EF Core.

La secuencia será:

```text
dotnet build
        ↓
dotnet ef database update
```

---

# 38. Migration inicial de Sprint 0

Puede incluir infraestructura técnica indispensable como:

```text
ASP.NET Core Identity
```

si el diseño real del DbContext lo requiere.

No deberá anticipar todas las entidades de negocio.

---

# 39. Entidades de dominio

Las tablas del negocio deberán aparecer conforme se implementen las HU correspondientes.

Ejemplo:

```text
Sprint 0
→ infraestructura EF

HU-003
→ catálogo

HU-005
→ inventario

HU-009
→ pedidos

HU-012
→ ventas
```

No crear de forma masiva el esquema final únicamente para “adelantar trabajo”.

---

# 40. Seeds

Sprint 0 no debe completar reglas funcionales mediante seeds.

Se permitirán únicamente datos técnicos indispensables para que el entorno pueda iniciar.

Los seeds de roles, unidades u otros catálogos se incorporarán cuando exista una necesidad clara dentro de la HU correspondiente o una decisión técnica formal.

---

# 41. Base de datos de pruebas

Cuando se empiecen a ejecutar integration tests:

```text
restaurant_system
→ desarrollo

restaurant_system_test
→ pruebas
```

La base de test deberá poder recrearse mediante migrations.

---

# 42. Frontend — tecnología base

```text
React
TypeScript
Vite
Tailwind CSS
React Router
TanStack Query
@Microsoft/signalr
Vitest
React Testing Library
```

Playwright podrá incorporarse cuando existan flujos E2E reales.

---

# 43. Puerto frontend

```text
http://localhost:8087
```

---

# 44. Estructura frontend base

```text
frontend/
├── public/
├── docs/
│   └── manual-de-uso.md
│
├── src/
│   ├── app/
│   │
│   ├── assets/
│   │   └── brand/
│   │
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   │
│   ├── features/
│   │   └── _template/
│   │
│   ├── lib/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── query/
│   │   └── realtime/
│   │
│   ├── pages/
│   ├── routes/
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── types/
│   │   └── api.generated.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env.example
├── eslint.config.js
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
└── vite.config.ts
```

---

# 45. Atomic Design

Los componentes reutilizables se organizarán:

```text
atoms
molecules
organisms
templates
```

Uso:

```text
atoms
→ controles mínimos

molecules
→ combinaciones pequeñas

organisms
→ bloques funcionales de UI

templates
→ estructura compositiva de páginas
```

---

# 46. Features

La lógica específica del producto se organizará por funcionalidad.

Ejemplo futuro:

```text
features/
├── auth/
├── products/
├── inventory/
├── orders/
├── kitchen/
├── sales/
├── purchases/
├── attendance/
└── cash/
```

No es necesario crear todas las carpetas vacías en Sprint 0.

---

# 47. Feature template

Sprint 0 sí dejará:

```text
features/_template/
```

como ejemplo/documentación práctica.

Podrá mostrar una estructura de referencia:

```text
api/
components/
hooks/
types/
index.ts
```

sin implementar lógica de negocio.

---

# 48. Sistema visual de Fratelli

La referencia visual confirmada se basa en:

```text
naranja
+
negro
```

con el logo de Fratelli como guía de identidad.

La interfaz inicial adoptará una estética:

```text
fondo oscuro
superficies oscuras
naranja como color de énfasis
texto claro
```

---

# 49. Paleta inicial

Como la referencia disponible proviene de una imagen/captura y no de un manual de marca, los valores iniciales se consideran:

```text
baseline visual ajustable
```

Valores sugeridos:

```css
:root {
  --color-brand-orange: #e18b34;
  --color-brand-orange-hover: #c9782a;

  --color-brand-black: #111214;
  --color-background: #17181a;
  --color-surface: #202124;
  --color-surface-elevated: #292a2d;

  --color-text: #f5f2ec;
  --color-text-muted: #b8b0a7;

  --color-border: #3b3937;

  --color-success: #2e9d65;
  --color-warning: #d9a029;
  --color-danger: #c95252;
  --color-info: #5d82c9;
}
```

Los colores podrán ajustarse durante Sprint 0 si se obtiene un asset original o una referencia visual más precisa.

---

# 50. Variables visuales

`frontend/src/styles/globals.css` deberá centralizar:

```text
colores
tipografía
background
superficies
bordes
radios
sombras
espaciado transversal cuando corresponda
```

Objetivo:

> evitar que cada integrante invente colores y estilos incompatibles.

---

# 51. Uso de colores

Evitar:

```text
pantalla A
→ naranja distinto

pantalla B
→ otro negro

pantalla C
→ gris arbitrario
```

Preferir:

```text
var(--color-brand-orange)
var(--color-background)
var(--color-surface)
var(--color-text)
```

o las utilidades Tailwind equivalentes enlazadas a esos tokens.

---

# 52. Logo

El logo oficial deberá almacenarse cuando se disponga del asset utilizable en:

```text
frontend/src/assets/brand/
```

La captura de referencia no debe asumirse automáticamente como el archivo final optimizado para la web.

---

# 53. Componentes mínimos del Sprint 0

## Atoms

```text
Button
Input
Select
Textarea
Checkbox
Badge
Spinner
```

## Molecules

```text
FormField
Alert
EmptyState
```

## Organisms

```text
DataTable base
Modal/Dialog
PageHeader
```

## Templates

```text
AppShell
```

---

# 54. Regla para componentes base

Los componentes del Sprint 0 deben:

- ser reutilizables;
- aceptar props claras;
- mostrar estados comunes;
- no incluir lógica específica de una HU;
- servir como guía para el equipo.

---

# 55. Página de componentes

Sprint 0 incluirá una página técnica:

```text
/dev/ui-kit
```

Visible únicamente en Development.

---

# 56. Contenido de `/dev/ui-kit`

Debe mostrar:

```text
paleta
tipografía
Button
Input
Select
Textarea
Checkbox
Badge
Alert
Spinner
EmptyState
DataTable
Modal
PageHeader
AppShell
```

con estados cuando corresponda:

```text
default
hover
disabled
loading
error
success
```

---

# 57. UI Kit no es funcionalidad del MVP

```text
/dev/ui-kit
≠
pantalla del restaurante
```

No completa ninguna HU.

Su objetivo es:

- validar consistencia;
- mostrar componentes disponibles;
- permitir copiar patrones correctos;
- facilitar onboarding.

---

# 58. Prueba visual frontend/backend

La página de UI Kit deberá incluir una sección técnica simple:

```text
Backend connection
```

que consulte:

```text
GET /health
```

y muestre un estado comprensible:

```text
API disponible
API no disponible
```

---

# 59. Objetivo de la prueba `/health`

Validar:

```text
React
→ configuración
→ HttpClient
→ proxy/base URL
→ ASP.NET Core
→ respuesta
```

sin implementar una HU funcional.

---

# 60. Vite proxy

Durante desarrollo:

```text
/api
→ http://localhost:5057

/hubs
→ http://localhost:5057
```

con soporte WebSocket para hubs.

---

# 61. Cliente API — patrón

Se adopta un patrón similar al utilizado previamente en UPDS JUDGE:

```text
config/env
    ↓
lib/api/http-client
    ↓
lib/api/endpoints
    ↓
feature/api
    ↓
TanStack Query
    ↓
UI
```

---

# 62. Estructura API frontend

```text
src/
├── config/
│   └── env.ts
│
├── lib/
│   └── api/
│       ├── api-error.ts
│       ├── endpoints.ts
│       ├── http-client.ts
│       ├── problem-details.ts
│       └── index.ts
│
└── types/
    └── api.generated.ts
```

---

# 63. `endpoints.ts`

Las rutas se centralizan.

Ejemplo futuro:

```ts
export const endpoints = {
  auth: {
    login: 'auth/login',
    refresh: 'auth/refresh',
    logout: 'auth/logout',
  },

  products: {
    list: 'products',
    create: 'products',
    detail: (id: string) => `products/${encodeURIComponent(id)}`,
  },
} as const
```

Cuando se incorpora una nueva API:

```text
agregar ruta
→ endpoints.ts
```

y consumirla desde la feature correspondiente.

---

# 64. `http-client.ts`

Responsabilidades:

- construir URL;
- enviar JSON;
- parsear respuestas;
- soportar métodos HTTP;
- manejar timeout;
- normalizar errores;
- comprender ProblemDetails;
- permitir autenticación sin acoplarla permanentemente al cliente.

---

# 65. Sesión: diferencia frente al proyecto de referencia

No se copiará un esquema basado en:

```text
sessionStorage
localStorage
```

para almacenar el access token.

La baseline de seguridad exige:

```text
Access Token
→ memoria

Refresh Token
→ cookie HttpOnly
```

---

# 66. Auth transport

Sprint 0 podrá preparar una abstracción de transporte:

```text
getAuthorizationHeader()
```

sin implementar el login completo.

HU-001 incorporará:

- obtención de access token;
- refresh;
- logout;
- estado de sesión;
- recuperación de sesión mediante refresh.

---

# 67. Cookies

El `httpClient` deberá poder trabajar con cookies de refresh cuando HU-001 las implemente.

Ejemplo:

```text
credentials: include
```

cuando la topología lo requiera.

---

# 68. TanStack Query

Se centralizará:

```text
QueryClient
QueryProvider
```

Sprint 0 solo necesita la configuración base.

Las queries/mutations de producto se crean con sus HU.

---

# 69. OpenAPI híbrido

OpenAPI se utilizará para:

```text
generar tipos TypeScript
```

pero no para generar automáticamente todo el cliente HTTP.

---

# 70. Herramienta para tipos OpenAPI

Se utilizará:

```text
openapi-typescript
```

como herramienta ligera.

Objetivo:

```text
/openapi/v1.json
        ↓
openapi-typescript
        ↓
src/types/api.generated.ts
```

---

# 71. Script frontend

Se deberá configurar:

```text
npm run api:generate
```

Conceptualmente:

```bash
openapi-typescript http://localhost:5057/openapi/v1.json \
  -o src/types/api.generated.ts
```

La sintaxis definitiva se registrará en `package.json`.

---

# 72. Regla sobre código generado

```text
src/types/api.generated.ts
→ NO editar manualmente
```

Cuando cambia el contrato:

```text
backend OpenAPI cambia
        ↓
npm run api:generate
        ↓
tipos actualizados
```

---

# 73. Variable de API

`frontend/.env.example` deberá incluir la variable necesaria para resolver la API.

Ejemplo:

```text
VITE_API_BASE_URL=/api/v1
```

Puede existir también:

```text
VITE_REQUEST_TIMEOUT_MS=...
```

sin incluir secretos.

---

# 74. Manual frontend — README

Debe existir:

```text
frontend/README.md
```

Contenido mínimo:

```text
requisitos
instalación
npm install
npm run dev
puerto 8087
backend requerido
puerto 5057
variables de entorno
proxy
api:generate
lint
tests
build
```

---

# 75. Manual frontend — uso para desarrolladores

Debe existir:

```text
frontend/docs/manual-de-uso.md
```

Debe explicar:

```text
Atomic Design
features/
CSS global
tokens visuales
uso del UI Kit
reutilización de componentes
crear componente
crear página
agregar ruta
agregar endpoint
usar httpClient
usar TanStack Query
generar tipos OpenAPI
qué archivo generado no se edita
convenciones de nombres
errores/ProblemDetails
evidencias
```

---

# 76. Manual de una nueva API

Ejemplo conceptual:

```text
1. backend expone endpoint
2. OpenAPI refleja contrato
3. npm run api:generate
4. agregar ruta a endpoints.ts
5. crear función en feature/api
6. utilizar tipo generado
7. integrar con TanStack Query
8. consumir en componente/página
```

Esta secuencia debe figurar en el manual.

---

# 77. Pruebas base del Sprint 0

Backend:

```text
dotnet build
dotnet test
```

Frontend:

```text
npm run lint
npm run build
```

y tests mínimos cuando existan.

---

# 78. CI mínimo

Sprint 0 podrá dejar:

```text
.github/workflows/ci.yml
```

sin una pipeline compleja.

---

# 79. Job frontend

```text
npm ci
npm run lint
npm run build
```

Si existen tests estables:

```text
npm run test
```

---

# 80. Job backend

```text
dotnet restore
dotnet build
dotnet test
```

---

# 81. Qué NO incluir inicialmente en CI

No es obligatorio en Sprint 0:

```text
deploy automático
PostgreSQL service container
Testcontainers
E2E completos
coverage gate
security scanning avanzado
HomeLab deploy
```

El objetivo es que el CI ayude y no se convierta en una barrera para el equipo.

---

# 82. OpenSpec

OpenSpec es una herramienta opcional del proceso.

No existe la regla:

```text
1 HU
=
1 OpenSpec
```

---

# 83. OpenSpec para Sprint 0

Sprint 0 utilizará un único change.

ID propuesto:

```text
prepare-sprint-0-development-foundation
```

Ruta:

```text
docs/openspec/changes/prepare-sprint-0-development-foundation/
```

---

# 84. Uso futuro de OpenSpec

Después del Sprint 0:

```text
si aporta valor
→ puede utilizarse

si una HU es sencilla
→ no es obligatorio

si un integrante no lo utiliza
→ no bloquea su trabajo
```

El Scrum Master podrá utilizarlo para cambios técnicos o transversales cuando resulte útil.

---

# 85. Documento del Sprint 0

Al iniciar su ejecución deberá crearse:

```text
docs/sprints/sprint-00.md
```

Sin subcarpetas.

---

# 86. Contenido de `sprint-00.md`

Debe registrar:

```text
objetivo
tareas
responsables
estado
riesgos
resultados reales
validaciones
evidencia
problemas
acciones pendientes
```

No deberá marcar resultados como completados antes de verificarlos.

---

# 87. Tareas propuestas del Sprint 0

| ID | Tarea | Resultado esperado |
|---|---|---|
| `S0-01` | Preparar ramas `main` y `develop` | Flujo Git disponible |
| `S0-02` | Inicializar backend Clean Architecture | Solución compilable |
| `S0-03` | Configurar EF Core + Npgsql | Conexión DB disponible |
| `S0-04` | Configurar migrations | DB recreable |
| `S0-05` | Preparar Identity/JWT estructural | Infraestructura disponible, sin completar HU-001 |
| `S0-06` | Configurar OpenAPI/Swagger Development | Contrato visible |
| `S0-07` | Configurar ProblemDetails/CORS/health | API base verificable |
| `S0-08` | Inicializar React/Vite/TS/Tailwind | Frontend ejecutable |
| `S0-09` | Configurar React Router/TanStack Query | Infraestructura frontend |
| `S0-10` | Crear HttpClient + endpoints + errores | Cliente base |
| `S0-11` | Configurar tipos OpenAPI | `api:generate` funcional |
| `S0-12` | Crear sistema visual global | Tokens Fratelli |
| `S0-13` | Crear componentes mínimos | UI base reutilizable |
| `S0-14` | Crear `/dev/ui-kit` | Catálogo visual |
| `S0-15` | Conectar UI Kit con `/health` | Front↔Back validado |
| `S0-16` | Crear manual frontend | Equipo con guía de uso |
| `S0-17` | Preparar estructura tests | Proyectos/scripts disponibles |
| `S0-18` | Configurar CI mínimo | Build básico verificable |
| `S0-19` | Crear/actualizar evidencia Sprint 0 | Sprint auditable |

---

# 88. Evidencias Sprint 0

Capturas podrán guardarse en:

```text
docs/capturas/
```

Ejemplos:

```text
sprint-00-backend-health.png
sprint-00-ui-kit.png
sprint-00-database-update.png
sprint-00-front-back-connection.png
sprint-00-ci.png
sprint-00-branches.png
```

Sin subcarpetas.

---

# 89. Gate de salida del Sprint 0

El Sprint 0 se considera terminado cuando realmente se verifique:

```text
[ ] repositorio clona correctamente
[ ] main existe
[ ] develop existe
[ ] flujo PR hacia develop definido
[ ] backend compila
[ ] backend inicia en :5057
[ ] /health responde
[ ] PostgreSQL conecta
[ ] dotnet ef database update funciona
[ ] OpenAPI funciona en Development
[ ] Swagger funciona en Development
[ ] frontend instala dependencias
[ ] frontend inicia en :8087
[ ] proxy/API base funciona
[ ] frontend consume /health
[ ] api:generate funciona
[ ] tipos generados no se editan manualmente
[ ] globals.css existe
[ ] tokens visuales existen
[ ] UI Kit existe
[ ] componentes base existen
[ ] frontend/README.md existe
[ ] frontend/docs/manual-de-uso.md existe
[ ] lint/build frontend pasan
[ ] build/test backend pasan
[ ] ningún secreto está versionado
[ ] no se declaró ninguna HU funcional como Done
```

---

# 90. Validación por integrante

Después de preparar Sprint 0, cada integrante deberá comprobar en su máquina:

```text
git clone
npm install
dotnet restore
configurar PostgreSQL
dotnet ef database update
dotnet run
npm run dev
```

y verificar:

```text
frontend :8087
backend :5057
/health
UI Kit
```

---

# 91. Criterio de fábrica reproducible

La fábrica se considera reproducible cuando un integrante puede preparar su entorno utilizando únicamente:

```text
repositorio
+
README/manual
+
credenciales/configuración local propia
```

sin depender de instrucciones informales que solo conozca una persona.

---

# 92. Product Backlog funcional

El MVP contiene:

```text
HU-001 → HU-031
```

con estimación total inicial:

```text
122 Story Points
```

---

# 93. Principio para la distribución

La distribución inicial busca:

```text
equilibrio de SP
+
dependencias
+
valor
+
camino crítico
+
paralelización
```

No implica que los SP sean horas.

---

# 94. Distribución inicial

```text
Sprint 1 → 41 SP
Sprint 2 → 41 SP
Sprint 3 → 40 SP
```

Total:

```text
122 SP
```

---

# 95. Sprint 1 — Fundaciones operativas

## Objetivo

Establecer identidad, catálogo e inventario inicial y habilitar los primeros flujos operativos que permitan comenzar a utilizar el sistema como un incremento coherente.

Historias:

| HU | Historia | SP |
|---|---|---:|
| `HU-001` | Iniciar y cerrar sesión | 3 |
| `HU-002` | Administrar usuarios y múltiples roles | 5 |
| `HU-003` | Gestionar productos, ingredientes y platos | 5 |
| `HU-005` | Registrar movimientos y consultar existencias | 5 |
| `HU-009` | Registrar y gestionar pedidos | 5 |
| `HU-010` | Generar y gestionar comandas | 5 |
| `HU-011` | Cancelar pedido antes de listo | 2 |
| `HU-016` | Gestionar proveedores | 3 |
| `HU-020` | Registrar gastos diarios | 3 |
| `HU-022` | Registrar entrada y salida | 5 |
|  | **Total** | **41** |

---

# 96. Dependencias internas Sprint 1

```text
HU-001
   ↓
HU-002
   ↓
permisos transversales
```

```text
HU-003
   ↓
HU-005
```

```text
HU-003 + HU-001
        ↓
      HU-009
        ↓
      HU-010
        ↓
      HU-011
```

```text
HU-001 + HU-002
        ↓
HU-016 / HU-020 / HU-022
```

---

# 97. Riesgo del Sprint 1

Las dependencias internas exigen comenzar primero con historias habilitantes.

Orden recomendado inicial:

```text
HU-001
HU-002
HU-003
```

mientras otros integrantes pueden preparar frontend, pruebas y pantallas de historias independientes bajo contratos ya definidos.

---

# 98. Sprint 2 — Núcleo transaccional

## Objetivo

Integrar producción, inventario, ventas, compras y turnos para construir el núcleo transaccional del restaurante.

Historias:

| HU | Historia | SP |
|---|---|---:|
| `HU-004` | Definir composición de platos/preparaciones | 5 |
| `HU-006` | Configurar y visualizar stock bajo | 3 |
| `HU-007` | Registrar producción | 8 |
| `HU-012` | Registrar y confirmar venta | 8 |
| `HU-013` | Continuar venta con stock insuficiente | 2 |
| `HU-017` | Registrar compra | 5 |
| `HU-018` | Recibir compra e incrementar inventario | 5 |
| `HU-025` | Gestionar y operar turnos | 5 |
|  | **Total** | **41** |

---

# 99. Dependencias internas Sprint 2

```text
HU-003
  ↓
HU-004
  ↓
HU-007
```

```text
HU-005
  ├── HU-006
  ├── HU-007
  └── HU-012
```

```text
HU-009
  ↓
HU-012
  ↓
HU-013
```

```text
HU-016
  ↓
HU-017
  ↓
HU-018
  ↓
inventario
```

```text
HU-012 + HU-020
        ↓
      HU-025
```

---

# 100. Producción

La implementación deberá seguir la baseline corregida:

```text
registro de producción
+
consumo de componentes
+
incremento de existencia preparada
+
historial de cada evento
```

No se reintroducirá un modelo antiguo de múltiples lotes si contradice `11-modelo-datos.md`.

---

# 101. Sprint 3 — Consulta, cierre y reportes

## Objetivo

Completar consultas, cierre de caja y reportes del MVP y preparar el incremento integrado para validación final.

Historias:

| HU | Historia | SP |
|---|---|---:|
| `HU-008` | Consultar producción | 3 |
| `HU-014` | Gestionar clientes básicos | 3 |
| `HU-015` | Consultar historial de ventas | 3 |
| `HU-019` | Consultar historial de compras | 3 |
| `HU-021` | Consultar gastos | 2 |
| `HU-023` | Consultar mi asistencia | 2 |
| `HU-024` | Consultar asistencia de trabajadores | 3 |
| `HU-026` | Calcular información esperada de cierre | 5 |
| `HU-027` | Registrar cierre de turno/caja | 5 |
| `HU-028` | Consultar cierres | 2 |
| `HU-029` | Reporte de ventas | 3 |
| `HU-030` | Reporte de inventario | 3 |
| `HU-031` | Reporte de asistencia | 3 |
|  | **Total** | **40** |

---

# 102. Dependencias internas Sprint 3

```text
HU-007 → HU-008
HU-012 → HU-015
HU-017 → HU-019
HU-020 → HU-021
HU-022 → HU-023 / HU-024 / HU-031
HU-025 → HU-026 → HU-027 → HU-028
HU-012 + HU-025 → HU-029
HU-005 + HU-006 → HU-030
```

---

# 103. Naturaleza de la distribución

La distribución:

```text
es la planificación inicial
```

pero cada HU debe superar DoR antes de entrar efectivamente en desarrollo.

Si una dependencia queda bloqueada:

```text
no se declara Ready artificialmente
```

El Scrum Master y PO deberán reordenar sin ocultar el problema.

---

# 104. No usar velocidad inventada

Aunque la distribución sea aproximadamente:

```text
41 / 41 / 40 SP
```

no se afirmará que:

```text
velocidad del equipo = 41 SP
```

hasta obtener resultados reales.

---

# 105. Si un Sprint termina antes

Prioridad:

```text
1. corregir bugs
2. reforzar pruebas
3. reducir deuda técnica
4. actualizar documentación
5. preparar integración/demo
6. adelantar una HU Ready si el equipo lo acuerda
```

No incorporar funcionalidades improvisadas fuera del backlog.

---

# 106. Sprint Planning

Antes de cada Sprint se deberá crear/actualizar:

```text
docs/sprints/sprint-XX.md
```

---

# 107. Contenido de Sprint Planning

```text
Sprint Goal
historias
SP
responsables
dependencias
orden
riesgos
tareas
pruebas previstas
evidencia esperada
```

---

# 108. Responsables de HU

Todas las HU siguen siendo verticales.

Aunque Alex concentre backend/DB, no se dividirán conceptualmente en:

```text
HU frontend
HU backend
```

La HU permanece:

```text
end-to-end
```

y puede tener subtareas de distintos responsables.

---

# 109. Responsabilidad técnica transversal

Backend, DB, arquitectura e integración técnica principal:

```text
Alex / Scrum Master
```

Esto implica riesgo de concentración y debe gestionarse según `12-seguridad-y-riesgos.md`.

---

# 110. Flujo del tablero

Columnas:

```text
Backlog
Ready
In Progress
Review
Done
Blocked
```

No existe una columna `Testing`.

---

# 111. Testing en tablero

Las pruebas se realizan durante:

```text
In Progress
+
Review
```

No necesitan una columna separada.

---

# 112. Flujo de una HU

```text
Product Backlog
      ↓
Backlog
      ↓
Refinamiento
      ↓
DoR
      ↓
Ready
      ↓
Sprint Planning
      ↓
In Progress
      ↓
docs/historias/HU-XXX-....md
      ↓
implementación
      ↓
pruebas
      ↓
PR → develop
      ↓
Review
      ↓
Done
```

---

# 113. Archivo individual de HU

Se crea cuando:

```text
Ready
→ In Progress
```

Ruta:

```text
docs/historias/HU-XXX-....md
```

Sin subcarpetas.

---

# 114. Contenido de HU

Debe consolidar:

```text
ID
Sprint
objetivo
beneficio
actor
RF/RNF/RN
necesidades
precondiciones
datos
dependencias
riesgos
criterios
implementación
casos de prueba
resultados
Issues
commits
PR
evidencia
estado
```

---

# 115. Capturas

Ruta:

```text
docs/capturas/
```

Convención:

```text
HU-XXX-descripcion.png
```

Ejemplo:

```text
HU-012-venta-confirmada.png
HU-018-compra-recibida.png
```

---

# 116. OpenSpec durante HU

No es obligatorio.

Puede utilizarse cuando:

- el cambio sea transversal;
- la implementación tenga decisiones complejas;
- el Scrum Master considere que aporta claridad.

No bloqueará una HU únicamente por no tener OpenSpec.

---

# 117. Issues

Defectos:

```text
GitHub Issue
label: bug
```

Si bloquea:

```text
Issue
+
HU → Blocked
```

---

# 118. Gate In Progress → Review

Aplicar `13-pruebas-y-validacion.md`.

Backend afectado:

```text
dotnet build
dotnet test
```

Frontend afectado:

```text
npm run lint
npm run build
```

Tests frontend si existen/aplican.

E2E si existe un flujo automatizado afectado.

---

# 119. Pull Request de HU

El PR:

```text
rama corta
→ develop
```

deberá incluir:

- qué cambia;
- HU/tarea relacionada;
- cómo se probó;
- Issue si aplica;
- limitaciones si existen.

---

# 120. Review

Verificar:

```text
criterios de aceptación
arquitectura
seguridad
datos
pruebas
evidencia
documentación
trazabilidad
```

---

# 121. Gate Review → Done

Una HU pasa a `Done` únicamente cuando:

```text
[ ] implementada
[ ] compila/ejecuta
[ ] criterios cumplidos
[ ] pruebas previstas PASS
[ ] sin defectos críticos conocidos
[ ] revisada
[ ] documentación actualizada
[ ] trazabilidad actualizada
[ ] evidencia existente
[ ] autorización de Done
```

---

# 122. Autoridad para Done

La HU no se pone en `Done` únicamente porque el desarrollador terminó su código.

El proceso debe contar con la revisión/autorización definida por el equipo y coordinada por Scrum Master.

---

# 123. Daily Scrum

Durante los tres Sprints funcionales:

```text
21:00–21:15
presencial durante la clase
```

Preguntas orientativas:

```text
¿qué completé?
¿qué haré?
¿tengo bloqueos?
```

---

# 124. Sprint Review

Al final de cada Sprint:

```text
develop integrado
      ↓
incremento ejecutable
      ↓
Product Owner prueba
      ↓
observaciones
      ↓
correcciones/clasificación
      ↓
PR develop → main
```

---

# 125. Evidencia de Review

Archivo:

```text
docs/sprints/sprint-XX-review.md
```

Debe registrar únicamente resultados reales.

---

# 126. Sprint Retrospective

Archivo:

```text
docs/sprints/sprint-XX-retrospectiva.md
```

Debe incluir:

```text
qué funcionó
qué no funcionó
bloqueos
retrabajo
defectos
acción de mejora
```

---

# 127. Actualización de trazabilidad

Durante el Sprint:

```text
PENDIENTE
→ EN DESARROLLO
→ IMPLEMENTADO
→ VALIDADO
```

según exista evidencia real.

---

# 128. Gestión de cambios

Si aparece un cambio:

```text
origen
↓
necesidad
↓
RF/RNF/RN
↓
backlog/HU
↓
UX
↓
arquitectura
↓
datos
↓
pruebas
↓
trazabilidad
```

No modificar únicamente el código.

---

# 129. Cambios de alcance

Una nueva funcionalidad MVP requiere:

```text
necesidad/requisito
+
impacto
+
priorización
+
estimación
+
PO
+
trazabilidad
```

No se incorpora por conveniencia técnica.

---

# 130. HomeLab

El HomeLab se utilizará principalmente para:

```text
integración
demostración
viabilidad de despliegue
```

No reemplaza el desarrollo local.

---

# 131. Docker HomeLab

Para demostración podrá prepararse:

```text
frontend container
backend container
```

con acceso a PostgreSQL del HomeLab según configuración aprobada.

---

# 132. Environment HomeLab

```text
ASPNETCORE_ENVIRONMENT=Production
```

Debe implicar:

```text
Swagger OFF
OpenAPI público OFF
HTTPS vía Funnel
secrets por entorno
```

---

# 133. Tailscale Funnel

Cuando se utilice:

```text
Internet
↓
HTTPS / Funnel
↓
reverse proxy
↓
frontend
/api → backend
/hubs → backend
```

PostgreSQL no deberá exponerse mediante Funnel.

---

# 134. Backup pre-demo

Antes de una demostración importante:

```text
pg_dump
```

según la estrategia de seguridad.

---

# 135. Checklist pre-demo

```text
[ ] develop/main estable según etapa
[ ] build frontend
[ ] build backend
[ ] tests aplicables PASS
[ ] DB migration aplicada
[ ] backup realizado
[ ] frontend disponible
[ ] backend disponible
[ ] login funciona
[ ] SignalR funciona si ya está implementado
[ ] Swagger OFF
[ ] OpenAPI público OFF
[ ] HTTPS activo
[ ] Funnel probado externamente
[ ] PostgreSQL no expuesto
[ ] fallback local disponible
```

---

# 136. Ready to Develop — nivel documental

Actualmente están definidos:

```text
problema
evidencia
usuarios
alcance
MVP
requisitos
reglas
backlog
criterios
dependencias
riesgos
datos
arquitectura
seguridad
pruebas
trazabilidad
```

---

# 137. Ready to Develop — nivel técnico

Se alcanzará después del Sprint 0 cuando:

```text
repositorio reproducible
+
frontend preparado
+
backend preparado
+
PostgreSQL reproducible
+
OpenAPI verificable
+
cliente HTTP preparado
+
UI base preparada
+
manual disponible
+
flujo Git probado
```

---

# 138. Gate final antes de Sprint 1

```text
[ ] Sprint 0 cerrado
[ ] cada integrante puede ejecutar proyecto
[ ] develop estable
[ ] frontend :8087
[ ] backend :5057
[ ] PostgreSQL operativo
[ ] migrations funcionan
[ ] /health funciona
[ ] OpenAPI funciona
[ ] api:generate funciona
[ ] UI Kit funciona
[ ] manual frontend disponible
[ ] DoR aplicado a historias Sprint 1
[ ] Sprint Goal definido
[ ] responsables definidos
[ ] riesgos revisados
[ ] pruebas previstas
```

---

# 139. Qué hacer inmediatamente después de este plan

Orden recomendado:

```text
1. revisar consistencia final docs 00–15
2. crear docs/sprints/sprint-00.md
3. crear OpenSpec change de Sprint 0
4. preparar rama develop
5. ejecutar Sprint 0
6. validar fábrica en cada máquina
7. actualizar evidencia/trazabilidad
8. revisar DoR de Sprint 1
9. Sprint Planning 1
10. comenzar HU seleccionadas
```

---

# 140. Informe final

`docs/16-informe-final.md` no se completa anticipadamente con resultados.

Se construirá al cierre utilizando:

```text
incrementos reales
pruebas reales
Issues
Sprint Reviews
retrospectivas
capturas
trazabilidad
limitaciones
validación PO
```

---

# 141. Control de cambios

| Versión | Descripción | Estado |
|---|---|---|
| `0.1` | Plan inicial de desarrollo con Sprint 0 técnico, flujo `develop`, preparación frontend/backend, API híbrida, sistema visual Fratelli y distribución 41/41/40 SP | Vigente |
