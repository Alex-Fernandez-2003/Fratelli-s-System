# 13 — Pruebas y validación

## 1. Propósito

Este documento define la estrategia de **pruebas, verificación, validación y evidencia** para **Restaurant System** de Fratelli.

Su objetivo es establecer:

- qué tipos de pruebas se utilizarán;
- qué herramientas se emplearán;
- qué aspectos deben probarse en backend, frontend, PostgreSQL y SignalR;
- cómo se comprobarán criterios de aceptación y reglas de negocio;
- qué condiciones debe cumplir una Historia de Usuario para avanzar a `Review` y posteriormente a `Done`;
- cómo se registrarán defectos;
- cómo se organizará la evidencia de cada Historia de Usuario;
- cómo participará la Product Owner en la validación del incremento;
- qué elementos quedan pendientes de definir durante ejecución.

Este documento define la estrategia. Los resultados reales de pruebas se registrarán durante los Sprints y no se anticiparán como exitosos antes de ser ejecutados.

---

# 2. Documentos de entrada

La estrategia se apoya en:

```text
docs/05-alcance-y-mvp.md
docs/06-srs.md
docs/requirements/requisitos-funcionales.md
docs/requirements/requisitos-no-funcionales.md
docs/requirements/reglas-negocio.md
docs/07-product-backlog.md
docs/08-scrum-y-refinamiento.md
docs/09-ux-y-flujos.md
docs/10-arquitectura.md
docs/11-modelo-datos.md
docs/12-seguridad-y-riesgos.md
```

---

# 3. Alcance

La estrategia cubre:

```text
Domain
Application
Infrastructure
REST API
PostgreSQL
ASP.NET Core Identity
JWT
SignalR
Frontend React
Flujos E2E críticos
Responsive
Permisos
Reglas de negocio
Transacciones
Validación con Product Owner
```

No se pretende automatizar cada interacción del sistema.

La prioridad será probar aquello que puede producir mayor impacto:

- reglas críticas;
- permisos;
- integridad;
- cálculos;
- movimientos de inventario;
- transacciones;
- flujos principales;
- integración frontend/backend;
- aceptación por parte de la PO.

---

# 4. Principios de prueba

## 4.1. Probar comportamiento, no implementación accidental

Las pruebas deben comprobar:

```text
entrada
→ comportamiento esperado
→ resultado observable
```

y evitar depender innecesariamente de detalles internos que puedan cambiar sin alterar el comportamiento.

---

## 4.2. Riesgo primero

No todos los componentes requieren la misma profundidad.

Se priorizan:

```text
ventas
inventario
producción
compras
autorización
cierre de caja
asistencia
SignalR/KDS
```

por su impacto funcional o técnico.

---

## 4.3. Automatizar cuando aporta valor

Una prueba automatizada es especialmente útil cuando:

- se repetirá;
- protege una regla crítica;
- evita regresiones;
- comprueba varios escenarios;
- puede ejecutarse de forma estable.

No se automatizarán pruebas únicamente para aumentar el número de tests.

---

## 4.4. Evidencia real

No se registrará:

```text
PASS
```

hasta ejecutar realmente la prueba.

Antes de la ejecución:

```text
Estado = PENDIENTE
```

---

## 4.5. Una HU no es Done por compilar únicamente

`Done` requiere:

- criterios cumplidos;
- pruebas previstas ejecutadas;
- revisión;
- ausencia de defectos críticos conocidos;
- evidencia;
- autorización correspondiente.

---

# 5. Estrategia general

Se utilizará una combinación de:

```text
Pruebas unitarias
Pruebas de Application
Pruebas de integración
Pruebas API
Pruebas frontend cuando aporten valor
Pruebas E2E críticas
Pruebas manuales guiadas
Validación con Product Owner
```

---

# 6. Capas de prueba

```text
                 E2E
              /       \
        Integración / API
        /               \
 Application             Frontend
        \               /
              Domain
```

La mayor cantidad de automatización deberá concentrarse en las capas donde las pruebas sean rápidas, estables y útiles.

---

# 7. Backend — herramientas

Framework principal:

```text
xUnit
```

Herramienta recomendada para asserts legibles:

```text
FluentAssertions
```

El objetivo es mantener baja la complejidad.

No se incorporarán frameworks adicionales salvo que exista una necesidad concreta.

---

# 8. Domain Tests

Proyecto previsto:

```text
RestaurantSystem.Domain.Tests
```

Objetivo:

> probar reglas puras sin HTTP, EF Core ni PostgreSQL.

Ejemplos:

- transición válida de estados;
- imposibilidad de cancelar pedido cuando la regla no lo permite;
- conversión de cantidades;
- cálculos;
- validación de invariantes;
- reglas de composición cuando se implementen en Domain;
- diferencia de caja cuando exista lógica pura.

---

# 9. Características de Domain Tests

Deben ser:

- rápidas;
- deterministas;
- independientes de infraestructura;
- repetibles;
- fáciles de comprender.

No requieren:

```text
PostgreSQL
WebApplicationFactory
SignalR
browser
```

---

# 10. Application Tests

Proyecto previsto:

```text
RestaurantSystem.Application.Tests
```

Objetivo:

> comprobar casos de uso y coordinación de reglas.

Ejemplos:

```text
ConfirmSale
RegisterProduction
ReceivePurchase
RegisterAttendance
CloseCashSession
```

---

# 11. Mocks

Los mocks serán utilizados solo cuando ayuden a aislar una dependencia real.

No se buscará:

```text
mockear absolutamente todo
```

por defecto.

Si una prueba pierde claridad debido a exceso de mocks, deberá evaluarse si corresponde una prueba de integración.

---

# 12. Integration Tests

Proyecto:

```text
RestaurantSystem.IntegrationTests
```

Tecnologías:

```text
xUnit
WebApplicationFactory
PostgreSQL real de pruebas
```

---

# 13. PostgreSQL de pruebas

Se utilizará una base separada.

Ejemplo conceptual:

```text
restaurant_system
→ desarrollo

restaurant_system_test
→ pruebas
```

Las credenciales reales se definirán mediante configuración local.

Nunca se ejecutarán pruebas destructivas contra una base de desarrollo compartida o de demostración.

---

# 14. Por qué no EF Core InMemory como evidencia principal

El comportamiento que necesitamos comprobar incluye:

- constraints PostgreSQL;
- `uuid`;
- índices;
- transacciones;
- relaciones;
- tipos numéricos;
- consultas reales;
- índices únicos parciales;
- migraciones.

EF Core InMemory no reproduce fielmente estos comportamientos.

Puede utilizarse puntualmente en pruebas aisladas si aporta valor, pero no como sustituto de PostgreSQL para integración.

---

# 15. Preparación de Integration Tests

Cada ejecución debe poder preparar un estado conocido.

Opciones permitidas:

- base limpia;
- transacción por prueba;
- seeds controlados;
- fixture de integración.

La implementación elegida debe evitar que una prueba dependa del orden de otra.

---

# 16. API Tests

Mediante `WebApplicationFactory` se probarán endpoints relevantes.

Ejemplos:

```text
POST /api/v1/auth/login
POST /api/v1/orders
POST /api/v1/sales
POST /api/v1/purchases
POST /api/v1/attendance
POST /api/v1/cash-closings
```

cuando existan.

---

# 17. Qué comprobar en API

Por endpoint importante:

- status code;
- DTO de entrada;
- DTO de salida;
- validaciones;
- permisos;
- errores;
- persistencia;
- efectos secundarios;
- ausencia de modificaciones parciales.

---

# 18. Pruebas de autorización

Deben existir escenarios como:

```text
sin autenticar
→ 401
```

```text
autenticado sin permiso
→ 403
```

```text
rol permitido
→ operación válida
```

Especialmente para:

- usuarios;
- cierres;
- compras;
- producción;
- información administrativa;
- KDS;
- asistencia administrativa.

---

# 19. Roles múltiples

Debe probarse que un usuario con múltiples roles obtenga las capacidades válidas de la unión de esos roles.

Ejemplo:

```text
MESERO + ENCARGADO
```

sin saltarse reglas propias del estado de las entidades.

---

# 20. Pruebas JWT

Se deberán probar, cuando estén implementadas:

- login válido;
- login inválido;
- token expirado;
- refresh válido;
- refresh inválido;
- sesión máxima;
- logout;
- token invalidado cuando corresponda;
- usuario sin rol requerido.

---

# 21. Duración de sesión

Baseline:

```text
Access Token:
15 min

Refresh / sesión máxima:
12 h
```

Las pruebas automatizadas no tienen que esperar tiempo real.

La lógica deberá diseñarse de forma testeable mediante configuración o control de reloj cuando corresponda.

---

# 22. Reset de contraseña

Debe comprobarse:

```text
ADMINISTRADOR
→ puede reasignar
```

```text
otro rol
→ no puede
```

Además:

- contraseña anterior no se expone;
- hashing se mantiene;
- nueva contraseña permite autenticación;
- sesiones anteriores se invalidan si la implementación adoptada lo soporta.

---

# 23. Lockout y rate limiting

Se probará:

- contador de intentos;
- bloqueo al alcanzar límite configurado;
- rechazo temporal;
- recuperación después del periodo correspondiente.

El rate limiting podrá validarse mediante integración cuando se configure.

---

# 24. Pruebas del modelo de datos

Deben comprobarse las restricciones importantes documentadas en `11-modelo-datos.md`.

Ejemplos:

```text
FK
UNIQUE
CHECK
NOT NULL
```

---

# 25. UUID

Debe verificarse que las entidades propias utilicen:

```text
Guid / uuid
```

de forma consistente.

---

# 26. Units

Escenarios mínimos:

```text
kg → g
l → ml
```

y rechazo de conversiones dimensionalmente incompatibles:

```text
kg → l
```

---

# 27. Composición

Cuando se implemente:

- cantidad > 0;
- producto no puede componerse de sí mismo;
- componente debe usar unidad compatible;
- no permitir ciclos.

---

# 28. Inventario

Las pruebas deben validar la relación:

```text
inventory movement
+
inventory balance
```

---

# 29. Venta e inventario

Escenarios:

```text
venta con stock suficiente
→ movimiento
→ balance disminuye
```

```text
venta con stock insuficiente
→ advertencia/condición correspondiente
→ venta permitida
→ stock puede quedar negativo
```

---

# 30. Producción

Debe comprobarse:

```text
producción
→ consume componentes
→ genera movimientos
→ aumenta existencia preparada
→ conserva responsable
```

Todo dentro de una transacción.

---

# 31. Baja / merma

Debe probarse:

```text
WRITE_OFF
→ movimiento negativo
→ motivo requerido cuando corresponda
```

sin modificar silenciosamente el balance.

---

# 32. Recepción de compra

Escenarios:

```text
PENDIENTE
→ no modifica stock
```

```text
RECIBIDA
→ genera movimientos
→ aumenta balance
```

```text
CANCELADA
→ no aumenta balance
```

---

# 33. Transacciones

Para venta, producción, recepción y cierre deben existir pruebas que provoquen un fallo intermedio controlado cuando sea viable.

Resultado esperado:

```text
ROLLBACK
```

y ausencia de datos parciales.

---

# 34. Concurrencia

Cuando exista implementación suficiente, se deberá probar al menos un escenario de operaciones simultáneas que afecten la misma existencia.

Objetivo:

> detectar pérdida silenciosa de actualizaciones.

Si el modelo inicial resulta suficiente, se documentará el resultado.

Si aparece un problema real, se incorporará una estrategia de concurrencia adicional.

---

# 35. Asistencia

Escenarios:

```text
empleado sin asistencia abierta
→ puede marcar entrada
```

```text
empleado con asistencia abierta
→ segunda entrada rechazada
```

```text
salida válida
→ cierra registro
```

La restricción de una asistencia abierta debe probarse también contra PostgreSQL.

---

# 36. Turnos y caja

Debe comprobarse:

```text
una CashSession
→ puede contener MORNING + NIGHT
```

y:

```text
una CashSession
→ máximo un CashClosing
```

---

# 37. Cierre de caja

Pruebas mínimas:

- efectivo;
- QR;
- canal externo;
- gastos de caja;
- caja chica;
- monto esperado;
- monto declarado;
- diferencia;
- observación;
- rol autorizado.

---

# 38. Pedidos

Pruebas principales:

```text
crear pedido
editar mientras corresponda
transición de estados
cancelación permitida
cancelación rechazada por estado
```

---

# 39. Cocina

Se probará que solo los items con:

```text
preparation_area = KITCHEN
```

formen parte de la comanda de Cocina.

---

# 40. SignalR — estrategia

SignalR requiere pruebas específicas por ser un elemento de integración y aprendizaje técnico.

REST continúa siendo fuente de verdad.

---

# 41. SignalR — backend

Debe probarse:

- hub disponible cuando corresponde;
- conexión autenticada;
- rechazo de acceso no autorizado;
- emisión de evento después de operación confirmada;
- ausencia de evento antes de completar una transacción fallida.

---

# 42. SignalR — flujo crítico

Cuando la funcionalidad exista:

```text
crear pedido
        ↓
persistir correctamente
        ↓
publicar evento
        ↓
KDS recibe actualización
```

---

# 43. SignalR — reconexión

Se deberá realizar al menos una prueba manual controlada:

```text
interrumpir conexión
→ restaurarla
→ cliente reconecta
→ refresca mediante REST
```

Resultado y evidencia deberán registrarse.

---

# 44. Frontend — herramientas

Herramientas recomendadas:

```text
Vitest
React Testing Library
```

---

# 45. Carácter de las pruebas frontend

La automatización frontend será **opcional según la Historia de Usuario y criterio del integrante**, siempre que:

- no se omitan pruebas necesarias de aceptación;
- el flujo pueda verificarse por otro medio;
- no se reduzca la calidad requerida para `Done`.

El equipo puede incorporar pruebas de componentes o hooks cuando aporten valor.

---

# 46. Cuándo conviene automatizar frontend

Especialmente:

- formularios con validaciones importantes;
- componentes reutilizados;
- permisos visuales;
- componentes con varios estados;
- hooks con lógica significativa;
- componentes críticos del KDS.

---

# 47. Qué no debe probarse innecesariamente

Evitar tests cuyo único objetivo sea comprobar:

```text
el componente renderiza un div
```

sin comportamiento relevante.

---

# 48. React Testing Library

Principio:

```text
probar como lo usaría una persona
```

Ejemplo:

```text
usuario escribe
→ presiona Guardar
→ aparece resultado
```

en vez de inspeccionar estados internos de React.

---

# 49. Validación visual/manual frontend

Aunque no exista test automatizado para una HU frontend, antes de `Review` deberá verificarse:

- carga;
- error;
- estado vacío;
- éxito;
- permisos;
- responsive;
- interacción principal.

---

# 50. Responsive

El sistema deberá probarse al menos en:

```text
desktop
tablet cuando sea relevante
mobile
```

Las dimensiones exactas se definirán en la ejecución según los RNF vigentes y navegadores disponibles.

No se inventará un mínimo de viewport si no está formalmente establecido.

---

# 51. Navegadores

Como baseline de desarrollo se utilizarán navegadores modernos disponibles para el equipo.

Antes de entrega se deberá documentar qué navegadores se probaron realmente.

No se afirmará compatibilidad con navegadores no probados.

---

# 52. Accesibilidad

Se validará al menos:

- etiquetas comprensibles;
- contraste suficiente;
- foco visible donde corresponda;
- navegación con teclado en controles principales;
- mensajes de error comprensibles;
- no depender únicamente del color;
- texto alternativo cuando aplique.

La validación podrá ser manual y apoyarse en herramientas del navegador.

---

# 53. E2E — herramienta

Se utilizará:

```text
Playwright
```

para un conjunto reducido de flujos críticos.

---

# 54. Filosofía E2E

No se busca automatizar toda la aplicación.

Objetivo:

> asegurar que los caminos de mayor valor funcionen a través de frontend, backend y datos.

---

# 55. Flujos E2E candidatos

A medida que estén disponibles:

```text
1. login

2. pedido
   → cocina
   → venta

3. producción
   → inventario

4. compra
   → recepción
   → inventario

5. asistencia

6. turno
   → ventas/gastos
   → cierre
```

---

# 56. Distribución E2E por Sprints

Los flujos E2E se incorporarán incrementalmente.

No se exige tener todos en Sprint 1.

Cada Sprint deberá priorizar un conjunto equilibrado de historias y pruebas según:

- dependencia;
- valor;
- riesgo;
- capacidad real del equipo.

Terminar antes del tiempo previsto se considerará una oportunidad para:

- reforzar pruebas;
- corregir deuda;
- adelantar una HU Ready;
- mejorar documentación;

sin agregar alcance improvisado.

---

# 57. Sprint 1

El contenido exacto todavía se definirá en Sprint Planning.

La estrategia de pruebas no asigna anticipadamente HU específicas al Sprint.

---

# 58. Coverage

El porcentaje mínimo de cobertura queda:

```text
PENDIENTE DE DEFINIR
```

No se fija inicialmente un umbral obligatorio.

---

# 59. Razón

Un porcentaje arbitrario puede:

- incentivar tests de poco valor;
- consumir tiempo sin mejorar calidad;
- bloquear una entrega por una métrica que no fue requerida.

---

# 60. Uso posible de coverage

Podrá utilizarse como indicador informativo.

Especialmente para:

```text
Domain
Application
```

Si durante los Sprints resulta sencillo y útil, se podrá definir posteriormente un objetivo.

Cualquier umbral obligatorio deberá documentarse antes de aplicarlo como gate.

---

# 61. Seguridad — pruebas

Se probarán prioritariamente:

- endpoints sin autenticación;
- endpoints con rol incorrecto;
- endpoints con rol correcto;
- reset de contraseña;
- expiración/refresh;
- datos no autorizados;
- Swagger/OpenAPI según ambiente;
- SignalR autorizado;
- secretos no expuestos en respuestas.

---

# 62. Swagger/OpenAPI — Development

Debe verificarse:

```text
Environment = Development
→ Swagger disponible
→ OpenAPI disponible
```

---

# 63. Swagger/OpenAPI — HomeLab/demo

Debe verificarse:

```text
Environment = Production
→ Swagger no disponible públicamente
→ OpenAPI no disponible públicamente
```

---

# 64. CORS

Prueba esperada:

```text
origen permitido
→ funciona
```

```text
origen no permitido
→ bloqueado por política
```

cuando la topología lo haga aplicable.

---

# 65. HomeLab

Antes de demo deberán ejecutarse pruebas integradas sobre el entorno HomeLab.

Mínimo:

- frontend abre;
- backend responde;
- PostgreSQL conecta;
- login funciona;
- SignalR funciona;
- flujo crítico seleccionado funciona;
- Swagger/OpenAPI públicos están deshabilitados;
- backup pre-demo realizado.

---

# 66. Funnel

Cuando se habilite exposición externa:

- verificar acceso HTTPS;
- probar desde una red externa;
- comprobar que solo servicios previstos son visibles;
- confirmar que PostgreSQL no está expuesto;
- comprobar WebSocket/SignalR.

---

# 67. Datos de prueba

Los datos deben ser:

- reproducibles;
- no sensibles;
- claramente ficticios cuando no correspondan a información real.

No utilizar datos reales de clientes/empleados salvo que exista necesidad y autorización.

---

# 68. Seeds

Seeds técnicos:

```text
roles
units
```

podrán utilizarse en desarrollo/pruebas.

Otros datos deben mantenerse mínimos.

---

# 69. Separación de ambientes

```text
Development
Test
HomeLab/Demo
```

No deben compartir accidentalmente:

- base de datos;
- secretos;
- refresh tokens;
- datos de prueba destructivos.

---

# 70. Variables de pruebas

Las pruebas deberán utilizar configuración independiente.

Ejemplo conceptual:

```text
ASPNETCORE_ENVIRONMENT=Test
ConnectionStrings__DefaultConnection=<test>
```

No incluir valores reales en documentación.

---

# 71. Migrations

Antes de aceptar una migration:

- debe poder aplicarse;
- debe mantener integridad;
- debe poder recrear una DB de test;
- debe estar relacionada con una HU/cambio.

---

# 72. Prueba de migration

Cuando una HU introduce cambios de datos:

```text
crear DB de test
→ aplicar migrations
→ ejecutar pruebas
```

Si falla la creación limpia de la base, la HU no está lista para `Done`.

---

# 73. Regresión

Una corrección de defecto debe incluir:

```text
reproducir
→ corregir
→ volver a probar
```

Cuando sea razonable, se añade una prueba automatizada que reproduzca el defecto original.

---

# 74. GitHub Issues para defectos

Los bugs reales se registrarán mediante GitHub Issues.

Label:

```text
bug
```

Se vinculará, cuando corresponda:

- HU;
- Sprint;
- PR;
- evidencia;
- requisito.

---

# 75. Contenido mínimo de un bug

```text
Título
Descripción
Pasos para reproducir
Resultado esperado
Resultado obtenido
Entorno
Severidad/prioridad cuando corresponda
HU relacionada
Evidencia
```

---

# 76. Bug bloqueante

Si impide continuar una historia:

```text
Issue
+
GitHub Project → Blocked
```

hasta resolver el bloqueo.

---

# 77. Cierre de bug

Un bug se cierra cuando:

- la corrección existe;
- se volvió a probar;
- no reproduce el defecto;
- se actualizó evidencia cuando corresponde.

---

# 78. Severidad orientativa

## Crítica

- pérdida/corrupción de datos;
- acceso no autorizado importante;
- operación crítica imposible;
- sistema no inicia.

## Alta

- flujo principal incorrecto;
- transacción inconsistente;
- resultado financiero/inventario incorrecto.

## Media

- funcionalidad secundaria incorrecta;
- workaround razonable.

## Baja

- detalle visual;
- texto;
- inconsistencia menor sin impacto funcional.

La severidad no sustituye la prioridad del Product Owner.

---

# 79. Organización documental de historias y evidencias

La documentación de ejecución de las Historias de Usuario se mantendrá en una única carpeta canónica:

```text
docs/historias/
```

Ejemplo:

```text
docs/historias/
├── README.md
├── HU-001-login-logout.md
├── HU-002-usuarios-roles.md
├── HU-003-productos.md
└── ...
```

No se crearán subcarpetas por Sprint ni subcarpetas por Historia de Usuario.

La identificación `HU-XXX` permite distinguir cada documento.

---

# 80. Momento de creación de una historia individual

Mientras una historia permanezca únicamente en:

```text
Backlog
o
Ready
```

no necesita todavía un archivo individual.

Cuando pase:

```text
Ready
→ In Progress
```

se crea su archivo correspondiente en:

```text
docs/historias/HU-XXX-....md
```

Ese archivo se convierte en el expediente de ejecución de la historia.

---

# 81. Contenido del Markdown de una HU

El archivo individual podrá contener:

```text
Identificación
Sprint
Objetivo
Criterios de aceptación
RF/RN relacionados
Dependencias
Decisiones de implementación
Cambios realizados
Pruebas
Resultados
Defectos
Evidencias
Commits/PR cuando corresponda
Estado final
```

No se duplicará esa información en carpetas separadas de pruebas.

---

# 82. Capturas como evidencia

Las imágenes utilizadas como evidencia se almacenarán en:

```text
docs/capturas/
```

Sin subcarpetas.

Ejemplo:

```text
docs/capturas/
├── HU-001-login.png
├── HU-002-users-page.png
├── HU-003-formulario.png
├── HU-009-orders.png
├── HU-020-expenses.png
└── ...
```

Las siglas e ID de HU permiten identificar a qué historia corresponde cada captura.

---

# 83. Convención de nombres para capturas

Formato recomendado:

```text
HU-XXX-descripcion-breve.ext
```

Ejemplos:

```text
HU-009-orders.png
HU-010-kitchen.png
HU-016-listado.png
HU-020-expenses.png
HU-022F1.png
```

Esto evita la necesidad de subcarpetas.

---

# 84. Referencia de capturas desde la HU

Ejemplo dentro de:

```text
docs/historias/HU-012-confirmar-venta.md
```

```md
## Evidencias

### Venta confirmada

`[captura vinculada desde el expediente de la HU]`
```

La historia explica el resultado y la captura lo demuestra visualmente.

---

# 85. Evidencia que no es imagen

No toda prueba requiere un archivo independiente.

Resultados como:

```text
dotnet test
npm run test
Playwright
migration aplicada
```

pueden registrarse directamente dentro del Markdown de la HU.

Ejemplo:

```text
dotnet test
→ 18 passed
→ 0 failed
```

No se guardará automáticamente un `.txt` por cada comando.

---

# 86. Casos de prueba dentro de la HU

Los casos de prueba ejecutados para una Historia de Usuario podrán documentarse en el propio archivo:

```text
docs/historias/HU-XXX-....md
```

Ejemplo:

```md
## Pruebas

### CP-HU012-01 — Confirmar venta válida

Requisito:
RF-...

Resultado esperado:
La venta queda confirmada.

Resultado obtenido:
La venta quedó confirmada y se registraron los movimientos de inventario.

Estado:
PASS

Evidencia:
`../capturas/HU-012-venta-confirmada.png`
```

Así se mantiene en un solo lugar la documentación de ejecución de la HU.

---

# 87. Caso de prueba estándar

Formato:

```text
ID: CP-HUXXX-01

Historia:
HU-XXX

Requisito:
RF-XXX / RN-XXX

Objetivo:

Precondiciones:

Datos:

Pasos:
1.
2.
3.

Resultado esperado:

Resultado obtenido:
PENDIENTE

Estado:
PENDIENTE

Evidencia:
PENDIENTE
```

---

# 88. Identificación de casos

Convención:

```text
CP-HU001-01
CP-HU001-02
CP-HU012-01
```

El ID de historia mantiene la relación visible sin crear directorios adicionales.

---

# 89. Escenarios por historia

Cada HU debe contemplar, cuando aplique:

- camino exitoso;
- validación;
- permiso;
- error;
- límite;
- regla de negocio;
- alternativa importante.

No se fuerza una cantidad fija de casos por HU.

---

# 90. Organización de Sprints

La visión temporal del proyecto se mantiene separada de la ubicación de las historias.

```text
docs/sprints/
├── sprint-01.md
├── sprint-01-review.md
├── sprint-01-retrospectiva.md
├── sprint-02.md
├── sprint-02-review.md
├── sprint-02-retrospectiva.md
├── sprint-03.md
├── sprint-03-review.md
└── sprint-03-retrospectiva.md
```

No se crean subcarpetas dentro de `docs/sprints/`.

---

# 91. Relación HU ↔ Sprint

El documento del Sprint indicará qué historias fueron seleccionadas.

Ejemplo:

```text
Sprint 1

Historias:
HU-001
HU-002
HU-003
```

Y cada archivo HU podrá indicar:

```text
Sprint: Sprint 1
```

De este modo existen dos vistas claras:

```text
docs/historias/
→ organización por funcionalidad

docs/sprints/
→ organización temporal
```

---

# 92. Historia arrastrada entre Sprints

Si una HU no termina en el Sprint previsto, su archivo no se mueve.

Ejemplo:

```text
docs/historias/HU-017-registrar-compra.md
```

permanece en la misma ubicación.

Los documentos de Sprint registran:

```text
Sprint 1
→ no completada

Sprint 2
→ continuada/completada
```

Esto evita duplicados.

---

# 93. Trazabilidad

La cadena esperada es:

```text
RF/RN
  ↓
HU
  ↓
criterio de aceptación
  ↓
caso de prueba
  ↓
resultado
  ↓
captura/evidencia cuando corresponda
```

El documento `14-trazabilidad.md` consolidará esta relación.

---

# 94. Gate para pasar a Review

Antes de mover una HU:

```text
In Progress
→ Review
```

debe cumplirse lo aplicable.

---

# 95. Backend — gate de Review

```text
dotnet build
→ PASS

dotnet test
→ PASS
```

si la HU afecta backend.

Además:

- migrations aplican;
- API funciona;
- reglas previstas verificadas;
- no existen errores conocidos críticos.

---

# 96. Frontend — gate de Review

Si la HU afecta frontend:

```text
npm run lint
→ PASS

npm run build
→ PASS
```

Las pruebas automatizadas frontend:

```text
npm run test
```

se ejecutarán cuando la HU/equipo haya incorporado tests aplicables.

Su ausencia no bloquea automáticamente la HU si la automatización era opcional y existe validación funcional suficiente.

---

# 97. E2E — gate

Si la HU modifica un flujo E2E ya automatizado:

```text
ese flujo debe seguir pasando
```

Si todavía no existe E2E para esa funcionalidad, no se inventará un gate inexistente.

---

# 98. Review

Durante `Review` se realiza:

- revisión de código;
- revisión funcional;
- comprobación de criterios;
- revisión de pruebas;
- revisión de evidencia;
- corrección de observaciones.

---

# 99. Gate para Done

Una HU pasa:

```text
Review
→ Done
```

solo cuando:

- cumple criterios de aceptación;
- compila;
- pruebas previstas pasan;
- no quedan defectos críticos conocidos;
- fue revisada;
- documentación afectada fue actualizada;
- trazabilidad/evidencia corresponde;
- recibe la autorización definida por el proceso del equipo.

---

# 100. Autorización de Done

La aprobación para mover una HU a `Done` se mantiene bajo el proceso definido en Scrum/refinamiento.

No basta con que el autor de la HU considere terminado su propio trabajo.

---

# 101. Product Owner y Done

La Product Owner no necesita ejecutar cada prueba técnica.

Su participación se concentra en:

- Sprint Review;
- aceptación del incremento;
- aclaraciones funcionales;
- observaciones de negocio.

La revisión técnica y el estado operativo del tablero siguen el proceso del equipo.

---

# 102. Sprint Review

Al finalizar cada Sprint:

```text
Incremento
→ se ejecuta
→ se demuestra
→ se prueba con la Product Owner
→ se registran observaciones
```

---

# 103. Objetivo de Sprint Review

Comprobar:

- que el incremento funciona;
- que responde a las necesidades;
- que la PO puede utilizar/comprender los flujos implementados;
- que no existe una desviación funcional importante.

---

# 104. Validación con PO

La validación debe diferenciar:

```text
observación
solicitud de cambio
defecto
nueva necesidad
aceptación
```

Una nueva necesidad no se implementa inmediatamente de forma automática.

Debe pasar por gestión de cambios/backlog.

---

# 105. Evidencia de Sprint Review

La validación de cada Sprint se documentará directamente mediante archivos planos en:

```text
docs/sprints/
```

Ejemplos:

```text
docs/sprints/sprint-01-review.md
docs/sprints/sprint-02-review.md
docs/sprints/sprint-03-review.md
```

Las capturas que se utilicen como apoyo visual permanecerán en:

```text
docs/capturas/
```

con nombres que indiquen Sprint o HU cuando corresponda.

No existe una captura de Sprint Review ni una validación visual de PO registrada actualmente. Esos archivos solo se agregarán cuando la revisión ocurra; no se reservan nombres como si fueran evidencia existente.

---

# 106. Registro mínimo de validación

En cada `sprint-XX-review.md`:

```text
Fecha:
Sprint:
Participantes:
Incremento presentado:
Flujos probados:
Observaciones:
Defectos detectados:
Cambios solicitados:
Aceptación:
Acciones posteriores:
```

Solo se completa con información real de la sesión.

---

# 107. Retrospectiva

La retrospectiva se registra en:

```text
docs/sprints/sprint-01-retrospectiva.md
docs/sprints/sprint-02-retrospectiva.md
docs/sprints/sprint-03-retrospectiva.md
```

Sin subcarpetas.

---

# 108. Uso de las HU en retrospectiva

La retrospectiva puede enlazar directamente:

```text
../historias/HU-XXX-....md
```

y los Issues relacionados.

No necesita copiar las evidencias ni mover los archivos por Sprint.

---

# 109. Sprint Retrospective

La retrospectiva no valida el producto.

Su propósito es evaluar el proceso del equipo.

Ejemplos:

- qué funcionó;
- qué bloqueó;
- qué mejorar;
- qué acción tomar en el Sprint siguiente.

---

# 110. Balance de Sprint

No se establece una cantidad fija de Story Points por adelantado mientras no exista velocidad histórica.

Sprint Planning deberá equilibrar:

- valor;
- dependencias;
- riesgo;
- capacidad;
- tiempo;
- complejidad.

---

# 111. Si un Sprint termina antes

Si el Sprint Goal ya está cumplido y existe capacidad:

prioridad:

```text
1. corregir defectos
2. reforzar pruebas
3. mejorar documentación
4. reducir deuda técnica
5. tomar una HU ya Ready si el equipo lo acuerda
```

No agregar funcionalidades no priorizadas simplemente por tener tiempo restante.

---

# 112. Rendimiento

No se diseñarán pruebas de carga artificialmente complejas salvo requerimiento.

Se verificará que los principales flujos sean razonablemente responsivos en:

- desarrollo;
- HomeLab.

Si un RNF define umbral concreto, deberá existir prueba correspondiente.

---

# 113. Métricas de rendimiento

No se inventarán tiempos máximos si no están baselined.

Los resultados medidos podrán registrarse como evidencia observada.

---

# 114. Validación del KDS

Además de tests de SignalR, deberá realizarse prueba funcional real:

```text
terminal/ventana Mesero
→ crea pedido

terminal/ventana Cocina
→ recibe cambio
→ cambia estado
```

y verificar sincronización posterior.

---

# 115. Validación de permisos UI

Se comprobará:

```text
usuario sin permiso
→ opción no visible/no operable
```

pero además se ejecutará la prueba backend correspondiente.

---

# 116. Validación de estados vacíos

Las pantallas principales deberán probar:

```text
sin datos
```

sin producir errores o interfaces confusas.

---

# 117. Validación de carga

Cuando una petición tarda:

- mostrar estado de carga;
- evitar doble envío cuando corresponda;
- recuperar interacción después de error.

---

# 118. Doble envío

Operaciones críticas deberán probar el riesgo de:

```text
doble click
→ doble venta
→ doble compra
→ doble cierre
```

La prevención puede combinar frontend + backend.

---

# 119. Pruebas de error

Escenarios necesarios:

- backend no disponible;
- validación inválida;
- 401;
- 403;
- 404 cuando corresponda;
- conflicto de estado;
- error transaccional.

La UI deberá responder de forma comprensible.

---

# 120. Testing durante desarrollo

No se reservarán todas las pruebas para el final del Sprint.

Flujo esperado:

```text
implementar
→ probar
→ corregir
→ Review
```

---

# 121. Testing en Review

Review no debe convertirse en la primera vez que la funcionalidad se ejecuta.

La HU llega a Review ya funcional y probada por su responsable.

---

# 122. Pruebas de regresión antes de Sprint Review

Antes de presentar el incremento:

- ejecutar suite backend;
- ejecutar lint/build frontend;
- ejecutar tests frontend existentes;
- ejecutar E2E críticos disponibles;
- recorrer manualmente flujos afectados.

---

# 123. Ambiente de Sprint Review

Preferencia:

```text
incremento integrado
```

en una máquina/entorno reproducible.

No se presentarán cuatro ramas aisladas como si fueran un único incremento.

---

# 124. Demo en HomeLab

El HomeLab no sustituye la validación local diaria.

Se utilizará cuando convenga demostrar:

- integración;
- viabilidad de despliegue;
- acceso externo;
- funcionamiento conjunto.

---

# 125. Validación final

Al terminar los tres Sprints se ejecutará una validación integrada del MVP.

Debe incluir:

- principales flujos;
- permisos;
- datos;
- inventario;
- cierre;
- aceptación con PO;
- defectos conocidos;
- limitaciones.

---

# 126. Resultado final

El informe final deberá distinguir:

```text
implementado y probado
implementado con limitaciones
pendiente
Post-MVP
```

No se marcará como cumplido un requisito únicamente porque exista documentación.

---

# 127. Defectos conocidos

Si se entrega con un defecto no crítico:

- registrarlo;
- describir impacto;
- explicar workaround si existe;
- evitar ocultarlo.

---

# 128. Pruebas no ejecutadas

Cuando una prueba prevista no pueda ejecutarse:

```text
Estado = NO EJECUTADA
```

con razón.

No se transforma en PASS.

---

# 129. Responsabilidad de pruebas

## Autor de la HU

Responsable de:

- ejecutar pruebas previstas de su cambio;
- corregir defectos;
- aportar evidencia.

## Reviewer / Scrum Master

Responsable de:

- verificar que el gate se cumpla;
- revisar coherencia;
- impedir `Done` prematuro.

## Product Owner

Responsable de:

- validar comportamiento de negocio durante Sprint Review;
- aportar observaciones funcionales.

---

# 130. Responsabilidad compartida

La calidad no pertenece a una persona separada denominada “tester”.

Todo desarrollador participa en:

- pruebas;
- revisión;
- corrección;
- evidencia.

---

# 131. Automatización futura

Después del MVP puede evaluarse:

- CI obligatorio;
- Testcontainers;
- coverage gate;
- pruebas de carga;
- análisis estático adicional;
- testing de seguridad automatizado;
- pipeline de deploy.

No son requisitos previos para comenzar Sprint 1.

---

# 132. CI

Si se configura GitHub Actions durante el proyecto, una pipeline recomendable sería:

```text
backend build
backend test
frontend lint
frontend test
frontend build
```

y E2E cuando el entorno lo permita.

No se establece como requisito documental obligatorio previo al Sprint.

---

# 133. Comandos base previstos

Backend:

```bash
dotnet build
dotnet test
```

Frontend:

```bash
npm run lint
npm run build
```

Opcional según tests existentes:

```bash
npm run test
```

E2E:

```bash
npx playwright test
```

Los scripts definitivos deberán reflejar el `package.json` real.

---

# 134. Checklist de HU antes de Review

```text
[ ] criterios de aceptación revisados
[ ] camino exitoso probado
[ ] errores importantes probados
[ ] permisos probados
[ ] reglas críticas probadas
[ ] build correcto
[ ] tests aplicables correctos
[ ] migration correcta si aplica
[ ] evidencia preparada
[ ] defectos conocidos registrados
```

---

# 135. Checklist de HU antes de Done

```text
[ ] Review completada
[ ] observaciones corregidas
[ ] criterios cumplidos
[ ] pruebas previstas PASS
[ ] sin defectos críticos conocidos
[ ] documentación afectada actualizada
[ ] trazabilidad actualizada
[ ] evidencia disponible
[ ] autorización para Done
```

---

# 136. Checklist antes de Sprint Review

```text
[ ] rama/incremento integrado
[ ] backend build PASS
[ ] backend tests PASS
[ ] frontend lint PASS
[ ] frontend build PASS
[ ] frontend tests existentes PASS
[ ] E2E críticos existentes PASS
[ ] flujos principales recorridos
[ ] DB/migrations verificadas
[ ] defectos conocidos documentados
[ ] evidencia preparada
[ ] entorno de demo listo
```

---

# 137. Checklist después de Sprint Review

```text
[ ] observaciones PO registradas
[ ] defectos creados como Issues
[ ] cambios diferenciados de bugs
[ ] backlog actualizado si corresponde
[ ] riesgos revisados
[ ] capturas/evidencias referenciadas
[ ] retrospectiva preparada
```

---

# 138. Estado del coverage

La baseline no fija un umbral de *coverage* sin evidencia suficiente. Los resultados ejecutados se registran en los expedientes de las HU y en los documentos de Sprint; no se infiere cobertura a partir de la mera existencia de código o capturas.

No bloquea Ready to Develop por sí solo.

---

# 139. Limitaciones de la estrategia

- Playwright se incorporará incrementalmente;
- la automatización frontend se evalúa por valor y aplicabilidad;
- el umbral obligatorio de *coverage* no está definido;
- las pruebas de rendimiento concretas dependen de RNF e implementación real.

La afirmación histórica de que no existían resultados ni suite implementada quedó superada por la evidencia registrada en `docs/sprints/sprint-01.md`, los expedientes de `docs/historias/` y el handoff Sprint 2. Esta estrategia no convierte esas evidencias puntuales en una validación global o de Product Owner.

---

# 140. Resumen de organización documental

La estructura canónica para ejecución queda:

```text
docs/
├── historias/
│   ├── README.md
│   ├── HU-001-....md
│   ├── HU-002-....md
│   └── ...
│
├── capturas/
│   ├── HU-001-....png
│   ├── HU-002-....png
│   ├── sprint-01-review-....png
│   └── ...
│
└── sprints/
    ├── sprint-01.md
    ├── sprint-01-review.md
    ├── sprint-01-retrospectiva.md
    ├── sprint-02.md
    ├── sprint-02-review.md
    ├── sprint-02-retrospectiva.md
    ├── sprint-03.md
    ├── sprint-03-review.md
    └── sprint-03-retrospectiva.md
```

Regla:

```text
sin subcarpetas para HU
sin subcarpetas para capturas
sin subcarpetas por Sprint
```

La identificación se realiza mediante:

```text
HU-XXX
sprint-XX
CP-HUXXX-XX
```

---

# 141. Próximo documento

Después de este documento corresponde:

```text
docs/14-trazabilidad.md
```

Su función será consolidar:

```text
problema
→ evidencia
→ necesidad
→ RF/RN
→ HU
→ UX
→ arquitectura
→ datos
→ prueba
→ evidencia
```

y dejar campos de implementación/prueba pendientes hasta que realmente existan.

---

# 142. Control de cambios

| Versión | Descripción | Estado |
|---|---|---|
| `0.1` | Estrategia inicial de pruebas: xUnit, WebApplicationFactory + PostgreSQL test, Vitest/RTL opcional por valor, Playwright para E2E críticos, SignalR testing, GitHub Issues y validación con PO | Reemplazada |
| `0.2` | Se unifica la documentación de ejecución en `docs/historias/`, las capturas en `docs/capturas/` y la documentación temporal en `docs/sprints/`, sin subcarpetas por HU ni Sprint | Vigente |
