# Análisis de sistemas similares para gestión de restaurantes

## 1. Identificación

| Campo | Valor |
|---|---|
| **Proyecto** | Restaurant System |
| **Organización objetivo** | Restaurante Fratelli |
| **Técnica** | Análisis de sistemas similares / benchmarking funcional |
| **Tipo de evidencia** | Investigación documental externa |
| **Objetivo** | Analizar soluciones existentes para restaurantes con el fin de obtener referencias funcionales, patrones de diseño del dominio y nuevos puntos de vista que puedan contrastarse con las necesidades reales de Fratelli |
| **Fecha de consulta/verificación** | 21 de agosto de 2026 |
| **Estado** | Análisis inicial |
| **Uso previsto** | Apoyo al relevamiento, refinamiento de requisitos y validación de alternativas |

---

# 2. Propósito

El proyecto Restaurant System parte de necesidades específicas de Fratelli obtenidas mediante relevamiento directo y antecedentes proporcionados por la organización.

Sin embargo, observar únicamente el funcionamiento actual del restaurante puede limitar la identificación de alternativas y patrones ampliamente utilizados en sistemas gastronómicos.

Por este motivo se realiza un **análisis de sistemas similares**.

El objetivo no es copiar otro producto ni asumir que una función de un sistema comercial constituye automáticamente un requisito para Fratelli.

La finalidad es:

- observar cómo otros productos estructuran procesos equivalentes;
- detectar patrones recurrentes;
- identificar diferentes formas de resolver problemas similares;
- contrastar el Product Backlog actual;
- descubrir preguntas que convenga validar con la organización;
- obtener referencias para futuras decisiones funcionales y de UX;
- documentar alternativas existentes en el dominio gastronómico.

---

# 3. Relación con las técnicas de relevamiento

Para el proyecto se utilizarán al menos tres formas de obtención y contraste de información:

```text
1. Entrevistas semiestructuradas
   ↓
   Conocimiento directo de participantes del negocio

2. Análisis de antecedentes
   ↓
   Información documental previa sobre el funcionamiento de Fratelli

3. Análisis de sistemas similares / benchmarking
   ↓
   Referencias externas sobre cómo otros sistemas gastronómicos
   resuelven procesos comparables
```

Las tres fuentes cumplen propósitos distintos.

## Entrevistas

Permiten conocer:

- necesidades;
- reglas reales;
- dificultades;
- responsabilidades;
- excepciones;
- prioridades del negocio.

## Análisis de antecedentes

Permite conocer:

- funcionamiento documentado previamente;
- procesos existentes;
- actores;
- herramientas;
- información ya conocida antes del nuevo sistema.

## Sistemas similares

Permiten conocer:

- patrones funcionales del sector;
- opciones de diseño;
- formas alternativas de representar procesos;
- funcionalidades que podrían ser evaluadas posteriormente.

---

# 4. Regla metodológica fundamental

El benchmarking **no define las reglas de negocio de Fratelli**.

Por ejemplo:

```text
Sistema externo permite recepción parcial de compras
```

no significa:

```text
Fratelli necesita recepción parcial
```

La interpretación correcta es:

```text
Sistema externo permite recepción parcial
        ↓
Se identifica una alternativa del dominio
        ↓
Se pregunta si el caso ocurre realmente en Fratelli
        ↓
La organización confirma o rechaza la necesidad
        ↓
Recién entonces puede convertirse en requisito
```

Este principio será utilizado durante todo el análisis.

---

# 5. Criterios de selección

Se seleccionaron sistemas que aportan perspectivas diferentes:

| Sistema | Motivo de selección |
|---|---|
| **Fudo** | Solución gastronómica orientada a Latinoamérica |
| **Odoo Point of Sale — Restaurant** | Plataforma modular y extensible con POS de restaurante |
| **Square for Restaurants** | POS integrado con operación, personal y reportes |
| **Lightspeed Restaurant** | Solución enfocada en restaurantes con inventario y KDS avanzados |
| **Toast** | Plataforma integral especializada en restaurantes |
| **SINCPRO — Sistema para Restaurantes** | Referencia con presencia en Bolivia y funciones gastronómicas locales |

La selección no pretende determinar cuál producto es “mejor”.

Se busca diversidad de enfoques.

---

# 6. Criterios de comparación

El análisis utiliza las siguientes dimensiones:

```text
A. Ventas / POS
B. Pedidos
C. Mesas
D. Comandas / cocina
E. Inventario
F. Recetas / composición
G. Producción
H. Compras
I. Proveedores
J. Gastos
K. Caja / turnos
L. Clientes
M. Usuarios / roles
N. Personal / asistencia
O. Reportes
P. Delivery / canales externos
Q. Hardware
R. Operación web/nube/offline
```

Cuando una función no aparece en las fuentes revisadas se utilizará:

```text
NC = No confirmada en la fuente consultada
```

`NC` no significa necesariamente que el producto no posea esa capacidad.

Significa únicamente que no se encontró evidencia suficiente en las fuentes utilizadas para este análisis.

---

# 7. Sistema 1 — Fudo

## 7.1. Descripción

Fudo se presenta como una plataforma de software gastronómico orientada a restaurantes, bares, cafés y otros negocios del sector.

Su enfoque resulta relevante para Fratelli porque combina funciones de:

- ventas;
- mesas;
- comandas;
- inventario;
- caja;
- clientes;
- proveedores;
- usuarios;
- reportes;
- delivery.

También es una referencia especialmente útil por estar orientada al mercado latinoamericano.

---

## 7.2. Ventas y pedidos

Fudo permite gestionar:

- ventas de mostrador;
- ventas en mesa;
- asociación de camareros;
- asociación de clientes;
- descuentos;
- pedidos para delivery;
- tienda online.

### Patrón observado

La venta puede originarse desde diferentes contextos:

```text
Mesa
Mostrador
Delivery
Tienda online
```

pero se consolida dentro del mismo dominio comercial.

### Posible reflexión para Fratelli

El sistema de Fratelli podría mantener una venta con un **origen o canal** claramente identificado sin necesidad de crear procesos completamente separados.

Esto podría ser especialmente útil en el futuro para diferenciar:

```text
salón
mostrador
PedidosYa
otros canales
```

No se incorpora como nuevo requisito hasta validarlo.

---

## 7.3. Comandas

Fudo soporta:

- impresión de comandas;
- áreas de impresión;
- envío de información a cocina;
- Kitchen Display System como módulo.

Los tickets de comanda pueden incluir:

- número de venta;
- fecha/hora;
- tipo de venta;
- productos;
- comentarios;
- cocina/área de preparación.

### Patrón observado

La información enviada a cocina no necesita contener toda la información económica de la venta.

Puede separar:

```text
Información operativa de cocina
≠
Información financiera de venta
```

### Aplicación conceptual a Fratelli

Este patrón es coherente con separar:

```text
Pedido / comanda
```

de:

```text
Venta / cobro
```

como ya plantea el Product Backlog.

---

## 7.4. Caja y turnos

Fudo contempla:

- arqueo de caja;
- ingresos y egresos;
- movimientos de caja;
- múltiples cajas y turnos en planes avanzados;
- asignación de cajas a usuarios.

### Patrón observado

Caja, turno y usuario pueden tratarse como conceptos relacionados pero distintos:

```text
Usuario
   ↓
opera
   ↓
Caja
   ↓
durante
   ↓
Turno
```

### Aporte para las HU bloqueadas

Este enfoque aporta una alternativa para analizar:

- `HU-025`;
- `HU-026`;
- `HU-027`.

Esta alternativa fue contrastada posteriormente mediante ENT-02. Fratelli confirmó que los dos turnos comparten una misma caja y que existe un único cierre final.

---

## 7.5. Inventario, recetas y reportes

Fudo publica funciones relacionadas con:

- control de inventario;
- recetas/fichas técnicas según plan;
- inventario valorizado;
- reportes de stock;
- análisis de desperdicios;
- reportes de compras;
- reportes de gastos.

### Patrón observado

El inventario gastronómico tiende a relacionar:

```text
Producto vendido
        ↓
Receta
        ↓
Ingredientes
        ↓
Consumo de inventario
```

y no únicamente productos finales.

### Aporte para Fratelli

Refuerza la importancia de mantener diferenciados:

- ingredientes;
- platos/preparaciones;
- composición;
- movimientos;
- producción.

---

## 7.6. Proveedores

Fudo incluye:

- base de proveedores;
- categorías;
- cuentas corrientes de proveedores.

### Reflexión

La existencia de categorías de proveedores es una referencia interesante, pero no debe utilizarse para inventar las categorías de compra de Fratelli.

ENT-02 permitió precisar el ámbito básico: Cocina compra ingredientes para preparaciones y el Encargado principalmente bebidas, limpieza y otros insumos generales.

---

## 7.7. Usuarios y permisos

Fudo permite:

- múltiples usuarios;
- roles;
- permisos;
- asignación de caja por usuario;
- PIN de autorización.

### Patrón observado

Los sistemas gastronómicos suelen restringir operaciones sensibles por usuario/rol.

Esto es consistente con las reglas ya definidas en Restaurant System para:

- ADMINISTRADOR;
- ENCARGADO;
- MESERO;
- COCINA;
- CONTADORA;
- EMPLEADO.

---

# 8. Sistema 2 — Odoo Point of Sale — Restaurant

## 8.1. Descripción

Odoo es una plataforma empresarial modular.

Su módulo Point of Sale posee un modo específico para restaurantes y bares.

El POS funciona desde navegador web y Odoo documenta la posibilidad de continuar trabajando durante interrupciones temporales de red.

---

## 8.2. Mesas y pedidos

Odoo permite:

- crear pisos/salas;
- configurar mesas;
- visualizar ocupación;
- tomar pedidos asociados a mesas;
- crear pedidos directos no asociados a mesa;
- transferir o fusionar pedidos entre mesas.

### Patrón observado

Un pedido puede estar:

```text
asociado a una mesa
```

o:

```text
ser una venta/pedido directo
```

### Posible punto a evaluar para Fratelli

El Product Backlog actual contempla pedidos y ventas, pero la gestión explícita de mesas no fue establecida como requisito independiente.

El benchmarking identifica esta función como **tema potencial de validación**, no como requisito automático.

---

## 8.3. Cocina

Odoo permite enviar pedidos:

- a impresoras de preparación;
- a pantallas de preparación;
- por categorías;
- hacia diferentes estaciones.

La pantalla de preparación utiliza etapas, por ejemplo:

```text
Por preparar
En preparación
Listo
Completado
```

### Patrón observado

Los estados operativos visibles en cocina son una práctica común.

### Relación con Fratelli

El sistema ya plantea:

```text
PENDIENTE
EN_PREPARACION
LISTA
CANCELADA
```

para comandas.

Por tanto, el enfoque definido para Fratelli coincide conceptualmente con un patrón encontrado en un sistema existente.

---

## 8.4. Sesión y caja

Odoo POS utiliza el concepto de:

```text
POS Session
```

y contempla un control de apertura de efectivo antes de operar una sesión.

### Aporte para Fratelli

Esto muestra una alternativa concreta para `HU-025`:

```text
Turno
+
Sesión de caja
+
Monto de apertura
```

pero no determina que Fratelli deba trabajar de esa manera.

ENT-02 confirmó que existe un monto/fondo inicial dejado por el Encargado para la continuidad con el turno siguiente.

---

## 8.5. Hardware

Odoo documenta integración con:

- impresoras;
- pantallas;
- terminales de pago;
- cajones de efectivo;
- balanzas;
- lectores de código;
- otros dispositivos mediante IoT.

### Patrón observado

La lógica central del POS puede existir independientemente de ciertos periféricos y conectarlos mediante mecanismos específicos.

### Relación con la arquitectura futura de Fratelli

Este patrón es coherente con la decisión ya tomada de mantener el hardware como un componente separado del núcleo de la aplicación.

---

# 9. Sistema 3 — Square for Restaurants

## 9.1. Descripción

Square for Restaurants es una plataforma de POS para restaurantes que integra:

- toma de pedidos;
- pagos;
- menús;
- inventario;
- cocina;
- equipo;
- reportes.

---

## 9.2. Pedidos, mesas y cocina

Square documenta:

- pedidos en salón;
- pedidos para llevar;
- delivery;
- gestión de mesas;
- plano de salón;
- separación de cuentas;
- Kitchen Display System;
- organización de cursos/platos;
- envío de tickets a cocina.

### Patrón observado

Front of House y Back of House se consideran partes coordinadas del mismo flujo:

```text
Mesero / POS
      ↓
Pedido
      ↓
KDS
      ↓
Preparación
      ↓
Entrega
```

### Relación con Fratelli

Esto respalda conceptualmente la importancia de mantener un flujo visible entre:

```text
pedido
comanda
estado de cocina
venta
```

sin asumir que las funciones de mesas o división de cuentas sean obligatorias.

---

## 9.3. Inventario

Square contempla seguimiento de inventario y disponibilidad de productos.

También ofrece una solución específica de inventario para restaurantes mediante integración/add-on.

### Patrón observado

Algunos sistemas mantienen:

```text
POS básico
+
módulo especializado de inventario
```

en lugar de concentrar toda la complejidad dentro del POS principal.

### Reflexión para Fratelli

Esto refuerza el valor de una arquitectura modular aun cuando el producto se implemente como un monolito modular.

---

## 9.4. Personal y asistencia

Square permite:

- horarios;
- turnos;
- registro de entrada/salida;
- tarjetas de tiempo;
- descansos;
- horas extra;
- historial de turnos.

### Patrón observado

La asistencia puede integrarse con el ecosistema del restaurante sin que necesariamente signifique implementar nómina completa.

### Relación con Fratelli

Es consistente con la separación actual:

```text
MVP
→ asistencia

Post-MVP
→ nómina completa
```

---

## 9.5. Cierre y reportes

Square documenta:

- reportes de turno;
- reportes de sección;
- cierre del día;
- ventas brutas/netas;
- métodos de pago;
- ventas por categoría;
- reportes de actividad de empleados.

### Aporte para Fratelli

Los reportes de cierre suelen separar información por:

```text
ventas
métodos de pago
turno
empleado
```

Esto aportó una referencia para `HU-026`. ENT-02 confirmó posteriormente los componentes operativos relevantes para Fratelli: efectivo, QR, gastos, caja chica, monto inicial, diferencias y PedidosYa separado.

---

# 10. Sistema 4 — Lightspeed Restaurant

## 10.1. Descripción

Lightspeed Restaurant es una plataforma especializada en restaurantes con funciones para:

- POS;
- inventario;
- pedidos;
- KDS;
- pagos;
- personal;
- reportes;
- compras.

---

## 10.2. Inventario a nivel de ingrediente

Lightspeed publica capacidades para:

- inventario por ingrediente;
- existencias actuales;
- valor del stock;
- deducción en tiempo real cuando se venden productos;
- recepción de inventario;
- desperdicio;
- producción;
- alertas de stock bajo;
- costeo de recetas.

### Patrón observado

El inventario gastronómico no se limita a:

```text
cantidad de platos vendidos
```

sino que puede modelar:

```text
ingredientes
+
recetas
+
compras
+
producción
+
desperdicios
+
ventas
```

### Relación con Fratelli

Es el sistema comparado que más directamente ofrece referencias para:

- `HU-004`;
- `HU-005`;
- `HU-006`;
- `HU-007`.

La comparación no determinó la regla de Fratelli. ENT-02 aclaró posteriormente que las bajas/pérdidas relevantes se registran como salidas separadas con motivo y que el MVP no necesita operar lotes múltiples por separado.

---

## 10.3. Compras

Lightspeed permite:

- crear órdenes de compra;
- asociarlas a proveedores;
- mantenerlas como borrador;
- enviar órdenes;
- recibir productos;
- actualizar stock al recibir;
- consultar reportes históricos de compras.

### Patrón observado

Existe una separación clara entre:

```text
Ordenar
≠
Recibir
```

y el inventario se actualiza durante la recepción.

### Relación con Fratelli

Esto coincide con las reglas ya definidas:

```text
PENDIENTE
→ no aumenta stock

RECIBIDA
→ aumenta stock
```

La comparación aporta respaldo como patrón del dominio, pero no reemplaza la validación del negocio.

---

## 10.4. Cocina

Lightspeed KDS permite:

- recibir pedidos del POS;
- actualizar pedidos en tiempo real;
- manejar estados;
- separar estaciones;
- mostrar modificaciones/cancelaciones;
- registrar tiempos.

### Patrón observado

La cocina puede trabajar como una vista especializada del pedido, sin necesitar acceso a la totalidad del POS.

### Aplicación conceptual

Esto es consistente con asignar a `COCINA` permisos específicos en Restaurant System.

---

## 10.5. Usuarios y permisos

Lightspeed contempla:

- perfiles de personal;
- roles;
- permisos por usuario o grupo.

### Relación con Fratelli

Refuerza el enfoque de autorización basado en roles.

---

## 10.6. Reportes y personal

Lightspeed dispone de:

- reportes de usuario;
- reportes diarios;
- ingresos;
- productos;
- ingredientes;
- turnos;
- actividad del personal.

### Patrón observado

Los reportes pueden tener un **alcance determinado por usuario y permiso**.

Esto resulta comparable con la regla definida para Fratelli donde un MESERO puede consultar las ventas de su propio turno.

---

# 11. Sistema 5 — Toast

## 11.1. Descripción

Toast es una plataforma integrada especializada en restaurantes.

Su ecosistema incluye:

- POS;
- pagos;
- pedidos;
- KDS;
- inventario;
- gestión de equipo;
- planificación;
- nómina;
- reportes;
- pedidos online.

Su mercado principal está orientado a restaurantes de Estados Unidos, por lo que no todas sus funciones administrativas o fiscales son trasladables a Bolivia.

---

## 11.2. Pedido a cocina

Toast KDS recibe pedidos directamente desde el POS y permite organizar la preparación por:

- estaciones;
- menú;
- tipo de servicio;
- estados de preparación.

### Patrón observado

La transmisión inmediata del pedido desde Front of House hacia cocina es uno de los patrones más repetidos entre los sistemas estudiados.

---

## 11.3. Inventario

Toast incluye herramientas para:

- inventario;
- costo de alimentos;
- seguimiento operativo;
- gestión de menú.

### Reflexión

La centralización de inventario y venta aparece nuevamente como un componente importante de plataformas gastronómicas maduras.

---

## 11.4. Personal

Toast integra:

- planificación;
- hojas de tiempo;
- fichaje;
- gestión del equipo;
- nómina.

### Relación con Fratelli

Muestra una evolución posible:

```text
Etapa 1
Asistencia

Etapa 2
Horarios

Etapa 3
Nómina
```

Restaurant System actualmente cubre únicamente la primera dentro del MVP.

---

## 11.5. Modularidad

Toast distribuye varias capacidades en suites o módulos separados.

### Patrón observado

Un sistema gastronómico puede crecer progresivamente:

```text
núcleo POS
+
inventario
+
equipo
+
nómina
+
delivery
+
marketing
+
otros
```

### Relación con Fratelli

Esto respalda mantener claramente diferenciado:

```text
MVP
vs.
Post-MVP
```

en lugar de intentar construir todas las capacidades en la primera entrega.

---

# 12. Sistema 6 — SINCPRO — Sistema para Restaurantes

## 12.1. Descripción

SINCPRO ofrece una solución para restaurantes y declara operación en Bolivia.

Su inclusión permite incorporar al benchmarking una referencia más cercana al contexto local.

La solución pública presenta capacidades relacionadas con:

- comandas;
- mesas;
- POS;
- inventario;
- recetas;
- mermas;
- compras;
- proveedores;
- manufactura;
- costeo;
- facturación electrónica.

---

## 12.2. Inventario gastronómico

SINCPRO presenta conjuntamente:

```text
Stock
Recetas
Mermas
```

### Patrón observado

La relación entre recetas, stock y mermas aparece nuevamente en una solución orientada específicamente a gastronomía.

### Aporte para la entrevista

Esto refuerza la utilidad de preguntar a Fratelli si la merma requiere registro formal.

No demuestra que la función sea necesaria.

---

## 12.3. Compras

La solución menciona:

- órdenes;
- proveedores.

### Patrón observado

Compras e inventario se modelan como procesos relacionados, no como simples gastos administrativos.

Este punto coincide con la necesidad de Fratelli de centralizar compras.

---

## 12.4. Manufactura / producción

SINCPRO menciona:

- manufactura;
- escandallos;
- costeo.

### Reflexión

La preparación anticipada de productos puede modelarse como un proceso distinto de la venta final.

Esto coincide conceptualmente con la decisión tomada para Restaurant System de:

```text
producir
→ consumir ingredientes
→ generar preparación/lote
→ vender posteriormente
```

---

## 12.5. Facturación boliviana

SINCPRO incluye facturación electrónica orientada al contexto boliviano.

### Relación con Fratelli

Esto demuestra que la facturación fiscal constituye una capacidad relevante en productos locales.

Sin embargo, Restaurant System ya la ha definido como:

```text
Post-MVP
```

por lo que el benchmarking **no modifica ese alcance**.

---

# 13. Matriz comparativa

Leyenda:

```text
✓  = función confirmada en las fuentes consultadas
◐  = existe mediante módulo, add-on, integración o suite relacionada
NC = no confirmada en las fuentes revisadas
```

| Capacidad | Fudo | Odoo Restaurant | Square Restaurants | Lightspeed | Toast | SINCPRO |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Ventas / POS | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Pedidos | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gestión de mesas | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Comandas / cocina | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| KDS | ◐ | ✓ | ✓ | ✓ | ✓ | NC |
| Inventario | ✓ | ◐ | ✓ | ✓ | ✓ | ✓ |
| Ingredientes/recetas | ✓ | ◐ | ◐ | ✓ | ◐ | ✓ |
| Producción | NC | ◐ | NC | ✓ | NC | ✓ |
| Merma/desperdicio | ✓ | ◐ | NC | ✓ | NC | ✓ |
| Compras | ✓ | ◐ | ◐ | ✓ | ◐ | ✓ |
| Proveedores | ✓ | ◐ | ◐ | ✓ | ◐ | ✓ |
| Clientes | ✓ | ✓ | ✓ | ✓ | ✓ | NC |
| Roles/permisos | ✓ | ✓ | ✓ | ✓ | ✓ | NC |
| Caja/turnos | ✓ | ✓ | ✓ | ✓ | ✓ | NC |
| Fichaje/asistencia | NC | ◐ | ✓ | ✓ | ✓ | NC |
| Reportes | ✓ | ✓ | ✓ | ✓ | ✓ | NC |
| Delivery externo | ✓ | ✓ | ✓ | ✓ | ✓ | NC |
| Impresión/hardware | ✓ | ✓ | ✓ | ✓ | ✓ | NC |
| Facturación fiscal/local | ◐ | ◐ | depende del país | depende del país | orientado EE. UU. | ✓ Bolivia |

### Observación

La tabla compara solamente las capacidades encontradas en las fuentes consultadas.

No debe utilizarse como un inventario exhaustivo de cada producto.

---

# 14. Patrones recurrentes identificados

## 14.1. POS, pedido y cocina forman un flujo integrado

En prácticamente todos los sistemas analizados aparece la relación:

```text
Pedido
   ↓
Comanda / KDS
   ↓
Preparación
   ↓
Entrega
   ↓
Cobro / venta
```

### Aplicación para Fratelli

El Product Backlog actual ya separa adecuadamente:

- pedidos;
- comandas;
- ventas.

No se detecta necesidad de fusionarlos en una única entidad funcional.

---

## 14.2. La cocina trabaja con información especializada

Los KDS y comandas normalmente muestran lo necesario para preparación, no toda la información financiera.

### Aplicación

El rol `COCINA` no necesita recibir permisos generales de venta o caja para cumplir su función.

---

## 14.3. Inventario gastronómico depende de composición

Los sistemas más especializados relacionan:

```text
Plato
   ↓
Receta/composición
   ↓
Ingredientes
   ↓
Inventario
```

### Aplicación

La existencia de `HU-004` está bien justificada.

ENT-02 definió posteriormente parte de esa operación: la carne puede comprarse en kilogramos y utilizarse/registrarse en gramos; los líquidos se manejan en litros en el caso observado.

---

## 14.4. Orden de compra y recepción son eventos distintos

Lightspeed y otros enfoques modulares separan:

```text
solicitar/comprar
```

de:

```text
recibir
```

### Aplicación

La división actual entre:

```text
HU-017 — Registrar compra
HU-018 — Recibir compra
```

es consistente con prácticas observadas.

---

## 14.5. La recepción suele ser el punto que afecta inventario

Se observa el patrón:

```text
Compra creada
→ todavía no representa stock físico

Compra recibida
→ actualiza stock
```

### Aplicación

Refuerza conceptualmente `RN-009` y `RN-010`.

---

## 14.6. Stock mínimo y alertas son capacidades frecuentes

Fudo, Lightspeed y Square presentan distintas formas de controlar disponibilidad y stock.

### Aplicación

La inclusión de alertas internas de stock bajo en Fratelli se encuentra alineada con patrones comunes del dominio.

---

## 14.7. Roles y permisos son relevantes en operaciones sensibles

Los sistemas analizados suelen manejar permisos diferenciados.

Las operaciones especialmente sensibles incluyen:

- caja;
- usuarios;
- inventario;
- cancelaciones;
- reportes;
- compras.

### Aplicación

La matriz de roles de Restaurant System tiene una justificación funcional clara.

---

## 14.8. Turno, usuario y caja no son necesariamente lo mismo

Fudo, Odoo, Square y Lightspeed utilizan conceptos que permiten distinguir:

- empleado;
- turno;
- sesión;
- caja;
- cierre.

### Aplicación

Esta observación ayudó a formular la entrevista de refinamiento. ENT-02 resolvió después la baseline de Fratelli: dos turnos, una caja compartida, traspaso de información y un único cierre.

---

## 14.9. El cierre suele separar medios de pago

Square y otros productos proporcionan reportes con desglose por método de pago.

### Aplicación

Para Fratelli conviene validar explícitamente el tratamiento de:

```text
efectivo
QR
PedidosYa
otros medios
```

antes de definir la fórmula del cierre.

---

## 14.10. Asistencia puede existir sin nómina completa

Square, Lightspeed y Toast muestran que:

```text
fichaje / tiempo
```

puede formar parte de un ecosistema más amplio de:

```text
horarios
nómina
gestión laboral
```

### Aplicación

Es razonable mantener:

```text
asistencia → MVP
nómina → Post-MVP
```

sin que una implique implementar la otra inmediatamente.

---

## 14.11. Hardware se integra de forma modular

Impresoras, KDS, terminales, cajones y otros dispositivos suelen ser componentes conectados al sistema principal.

### Aplicación

Esto coincide con la decisión de Fratelli de no condicionar el MVP a:

- biométrico;
- impresora térmica;
- hardware especializado.

---

## 14.12. Los sistemas maduros son modulares

Ninguna de las plataformas analizadas necesita tratar todas las capacidades como una única pantalla o proceso.

Existen módulos para:

- ventas;
- cocina;
- inventario;
- compras;
- personal;
- reportes;
- delivery;
- hardware.

### Aplicación

Para Restaurant System esto favorece una separación clara por dominios funcionales.

No implica utilizar microservicios.

---

# 15. Nuevos puntos de vista identificados

El benchmarking permite identificar temas que no deben agregarse directamente al MVP, pero que pueden registrarse como preguntas o evolución futura.

## PV-01 — Gestión explícita de mesas

Varios sistemas permiten:

- plano de salón;
- mesa ocupada/libre;
- pedido por mesa;
- transferencia entre mesas.

### Estado para Fratelli

```text
Tema identificado
→ no validado como necesidad
```

---

## PV-02 — División de cuenta

Square, Odoo y otros POS permiten dividir cuentas.

### Estado

```text
No forma parte del MVP actual.
```

Podría investigarse en una evolución futura si Fratelli lo necesita.

---

## PV-03 — Modificadores de productos

Los sistemas gastronómicos suelen permitir:

- extras;
- variantes;
- observaciones;
- instrucciones especiales.

### Estado

No existe suficiente evidencia para incorporarlo como requisito independiente.

---

## PV-04 — Costeo de recetas

Lightspeed, SINCPRO y otros productos relacionan ingredientes y costos para calcular costos de preparación.

### Estado

Interesante como Post-MVP.

El MVP de Fratelli necesita composición principalmente para inventario/producción, no se ha confirmado un requerimiento de costeo avanzado.

---

## PV-05 — Recepción parcial

Los sistemas avanzados de compra pueden contemplar diferencias entre lo ordenado y lo recibido.

### Estado

Fue contrastado mediante ENT-02. La recepción incompleta ocurre de forma ocasional y se coordina/devuelve con el proveedor; la recepción parcial estructurada no se incorpora como requisito del MVP.

---

## PV-06 — Reporte por usuario/turno

Varias soluciones permiten analizar:

- ventas por empleado;
- actividad del turno;
- métodos de pago.

### Estado

El Product Backlog ya contempla un alcance de ventas limitado por turno para MESERO.

---

## PV-07 — Canal de venta

Varios sistemas diferencian:

```text
salón
take away
delivery
online
```

### Aplicación potencial

Puede resultar útil para diferenciar PedidosYa de otros métodos/canales.

Debe validarse antes de modificar el modelo.

---

## PV-08 — Operación temporal sin conectividad

Odoo, Lightspeed, Square y Toast documentan distintos mecanismos de funcionamiento offline o continuidad operativa.

### Estado

No se incorpora como RNF obligatorio todavía porque Fratelli no proporcionó una necesidad explícita ni un criterio verificable.

Puede evaluarse posteriormente en arquitectura/riesgos.

---

# 16. Contraste del benchmarking con las historias refinadas

El benchmarking se realizó como técnica complementaria y **no fue la fuente que desbloqueó por sí sola las HU**. Su aporte consistió en mostrar patrones posibles del dominio. Las reglas de Fratelli se confirmaron posteriormente mediante ENT-02.

## HU-004 — Composición de platos

### Referencias del benchmarking

Los sistemas especializados utilizan recetas/composiciones con ingredientes y cantidades.

### Contraste con Fratelli

ENT-02 confirmó que existen unidades diferentes entre compra y consumo, incluyendo carne comprada por kilogramo y utilizada/registrada en gramos. Por tanto, la historia ya cuenta con una regla mínima de unidades/conversiones.

### Resultado

```text
REFINAMIENTO REQUERIDO → CANDIDATA A READY
GitHub Projects: Blocked → Backlog
```

---

## HU-007 — Producción y existencia preparada

### Referencias del benchmarking

Lightspeed y SINCPRO muestran conceptos de producción, recetas, desperdicio e inventario gastronómico.

### Contraste con Fratelli

ENT-02 confirmó que:

- interesa registrar la cantidad final producida;
- no se requiere rendimiento esperado;
- las bajas/pérdidas relevantes se registran por separado con motivo;
- si la misma preparación se produce varias veces, basta conocer la cantidad total disponible;
- cada producción debe conservar fecha, cantidad y responsable;
- no existe una fecha exacta de vencimiento registrada en el sistema actual.

### Resultado

El MVP se simplifica: **no requiere selección de lotes múltiples ni vencimiento por lote**.

```text
REFINAMIENTO REQUERIDO → CANDIDATA A READY
GitHub Projects: Blocked → Backlog
```

---

## HU-017 — Compras

### Referencias del benchmarking

Las soluciones maduras suelen separar compra de recepción y relacionar proveedor, responsable e inventario.

### Contraste con Fratelli

ENT-02 confirmó que:

- Cocina compra directamente ingredientes destinados a preparaciones y conserva recibo como respaldo;
- el Encargado compra principalmente bebidas, limpieza y otros insumos generales;
- una compra solo debe afectar inventario después de verificar/aceptar la recepción;
- las compras incompletas se coordinan/devuelven y ocurren ocasionalmente;
- recepción parcial estructurada no es necesaria para la baseline MVP.

### Resultado

```text
REFINAMIENTO REQUERIDO → CANDIDATA A READY
GitHub Projects: Blocked → Backlog
```

---

## HU-025 — Turnos

### Referencias del benchmarking

Los productos comparados distinguen turno, usuario, sesión y caja.

### Contraste con Fratelli

ENT-02 confirmó:

- dos turnos;
- una misma caja;
- monto/fondo inicial dejado por el Encargado;
- traspaso de información entre turnos;
- un único cierre final.

### Resultado

```text
REFINAMIENTO REQUERIDO → CANDIDATA A READY
GitHub Projects: Blocked → Backlog
```

---

## HU-026 — Información esperada de cierre

### Referencias del benchmarking

Las soluciones suelen distinguir ventas, medios de pago, usuario/turno y cierre.

### Contraste con Fratelli

ENT-02 confirmó que el cierre considera efectivo, QR y gastos; existe caja chica/fondo separado; PedidosYa se controla por separado; y las diferencias frente al efectivo esperado requieren observación/contraste.

### Resultado

```text
REFINAMIENTO REQUERIDO → CANDIDATA A READY
GitHub Projects: Blocked → Backlog
```

---

## HU-027 — Registrar cierre

### Referencias del benchmarking

Los sistemas relacionan cierre con sesión/turno, medios de pago y responsable.

### Contraste con Fratelli

ENT-02 confirmó que:

- el Encargado realiza el cierre;
- existe un único cierre para la caja compartida;
- la Contadora revisa después;
- no existe aprobación posterior obligatoria para que el cierre quede registrado;
- faltantes/sobrantes pueden dejar observación.

### Resultado

```text
REFINAMIENTO REQUERIDO → CANDIDATA A READY
GitHub Projects: Blocked → Backlog
```

### Conclusión del contraste

Las seis historias disponen ahora de una baseline suficientemente clara para abandonar `Blocked`. El benchmarking aportó perspectiva; **ENT-02 aportó la evidencia directa que permitió fijar las reglas del negocio**.

---

# 17. Comparación con el Product Backlog actual

## Capacidades del MVP que aparecen repetidamente en los sistemas analizados

```text
Autenticación / usuarios
Roles / permisos
Productos
Pedidos
Comandas / cocina
Ventas
Inventario
Stock
Clientes
Proveedores
Compras
Caja
Turnos
Reportes
```

Esto no demuestra que cada una sea obligatoria para todo restaurante.

Sin embargo, permite observar que el alcance principal definido para Fratelli coincide con problemas y capacidades comunes del dominio gastronómico.

---

# 18. Capacidades actuales de Fratelli que reciben respaldo comparativo

## Ventas y pedidos

Patrón ampliamente presente.

## Comandas

Patrón ampliamente presente.

## Inventario

Patrón ampliamente presente.

## Composición/recetas

Presente especialmente en soluciones con inventario gastronómico avanzado.

## Compras/proveedores

Presente en soluciones que integran Back Office.

## Caja/cierre

Presente de diferentes formas.

## Usuarios/roles

Patrón común.

## Reportes

Patrón común.

## Asistencia

Presente en varias plataformas integrales, aunque no necesariamente en todos los POS.

---

# 19. Funcionalidades que NO deben agregarse automáticamente

El análisis encontró capacidades interesantes que actualmente no tienen suficiente evidencia para entrar al MVP:

- reservas;
- mapa avanzado de mesas;
- división de cuentas;
- propinas;
- programas de fidelidad;
- marketing;
- múltiples sucursales;
- kioscos;
- autopedido;
- venta por QR del cliente;
- integración automática con delivery;
- costeo avanzado;
- pronósticos;
- payroll completo;
- contabilidad completa;
- préstamos/finanzas;
- facturación fiscal dentro del MVP;
- recepción parcial estructurada, ya descartada del MVP básico tras ENT-02;
- vencimientos/lotes independientes, no requeridos por la baseline MVP confirmada.

Estas funciones se consideran:

```text
referencias externas
```

y no:

```text
requisitos confirmados
```

---

# 20. Resultado del benchmarking

El análisis muestra que el Product Backlog actual de Restaurant System se encuentra razonablemente alineado con patrones frecuentes de software gastronómico.

Los sistemas estudiados coinciden especialmente en cinco núcleos:

```text
1. Pedido → cocina → venta

2. Inventario conectado con productos/recetas

3. Compras/proveedores conectados con recepción de stock

4. Usuarios/roles asociados a operaciones

5. Caja/turnos/reportes como mecanismos de control
```

También se identificó un patrón importante de diseño:

```text
núcleo operativo primero
+
módulos especializados después
```

Este patrón resulta compatible con la separación actual entre:

```text
MVP
+
Post-MVP
```

---

# 21. Conclusiones para Fratelli

## C-01

La separación actual entre pedidos, comandas y ventas es coherente con patrones observados en sistemas comerciales.

## C-02

La composición de platos a partir de ingredientes es una capacidad habitual cuando el sistema pretende controlar inventario gastronómico de forma más precisa.

## C-03

La separación entre compra y recepción es un patrón relevante y respalda conceptualmente el modelo ya propuesto para Fratelli.

## C-04

La posibilidad de stock bajo y reportes de inventario aparece de forma recurrente en sistemas especializados.

## C-05

Los roles y permisos diferenciados son importantes cuando varios tipos de trabajadores operan el mismo sistema.

## C-06

Turno, usuario, caja y cierre suelen modelarse como conceptos relacionados pero distintos.

La forma concreta para Fratelli fue contrastada después con ENT-02 y quedó incorporada a la baseline actual.

## C-07

El control de asistencia puede existir sin implementar todavía nómina completa.

## C-08

El hardware de cocina, impresión o identificación puede mantenerse como integración futura sin impedir que el núcleo software funcione.

## C-09

La gestión de delivery externo suele tratar el canal como una fuente diferenciada de pedidos/ventas.

Este patrón puede aportar contexto para analizar PedidosYa, pero debe validarse.

## C-10

No se identificó ninguna razón para ampliar automáticamente el MVP con todas las funciones encontradas en los productos comerciales.

---

# 22. Uso posterior de este documento

Este análisis deberá utilizarse junto con:

```text
Análisis de antecedentes
+
Entrevistas
+
Benchmarking
```

para actualizar posteriormente:

```text
02-relevamiento.md
03-hallazgos-y-necesidades.md
04-objetivos-y-propuesta-valor.md      # solo si existe impacto
05-alcance-y-mvp.md                    # solo si existe impacto
06-srs.md
requirements/requisitos-funcionales.md
requirements/requisitos-no-funcionales.md
requirements/reglas-negocio.md
07-product-backlog.md
GitHub Projects
```

No todos esos documentos necesariamente requerirán cambios.

La actualización deberá realizarse mediante análisis de impacto.

---

# 23. Fuentes consultadas

Se priorizaron páginas oficiales y documentación de los productos.

## Fudo

- Fudo — Software para restaurantes, bares y cafés  
  https://fu.do/es/

- Fudo — Funcionalidades  
  https://fu.do/es/funcionalidades/

- Fudo — Precios y planes  
  https://fu.do/es/precios/

- Fudo — Centro de ayuda  
  https://soporte.fu.do/es/

## Odoo

- Odoo — Point of Sale  
  https://www.odoo.com/documentation/19.0/applications/sales/point_of_sale.html

- Odoo — Restaurant features  
  https://www.odoo.com/documentation/19.0/applications/sales/point_of_sale/restaurant.html

- Odoo — Preparation display  
  https://www.odoo.com/documentation/saas-18.3/applications/sales/point_of_sale/preparation.html

## Square

- Square for Restaurants  
  https://squareup.com/us/en/point-of-sale/restaurants

- Square for Restaurants — Pricing / feature comparison  
  https://squareup.com/us/en/point-of-sale/restaurants/pricing

- Square — Time tracking  
  https://squareup.com/help/us/en/article/8389-set-up-time-tracking

## Lightspeed

- Lightspeed Restaurant  
  https://www.lightspeedhq.com/pos/restaurant/

- Lightspeed Restaurant — Features  
  https://www.lightspeedhq.com/pos/restaurant/features/

- Lightspeed — Restaurant Inventory  
  https://www.lightspeedhq.com/pos/restaurant/inventory/

- Lightspeed — Kitchen Display System  
  https://www.lightspeedhq.com/pos/restaurant/kitchen-display-system/

- Lightspeed Support — Creating purchase orders  
  https://k-series-support.lightspeedhq.com/hc/en-us/articles/4407569259547-Creating-purchase-orders

- Lightspeed Support — Purchase reports  
  https://k-series-support.lightspeedhq.com/hc/en-us/articles/11207355170203-Purchase-Reports

## Toast

- Toast — Restaurant POS  
  https://pos.toasttab.com/restaurant-pos

- Toast — Kitchen Display System  
  https://pos.toasttab.com/hardware/kitchen-display-system

- Toast — Restaurant employee tools  
  https://pos.toasttab.com/solutions/restaurant-employee-tools

## SINCPRO

- SINCPRO — Sistema para Restaurantes  
  https://sincpro.dev/sistema-para-restaurantes

---

## 23.1. Verificación de fuentes

Las referencias del benchmarking fueron revisadas nuevamente el **21/08/2026**, priorizando páginas oficiales y documentación de los productos listados.

La comparación sigue siendo documental: no se realizó una implementación o prueba integral de cada plataforma y, por ello, la matriz utiliza `NC` cuando una capacidad no fue suficientemente confirmada.

---

# 24. Limitaciones del análisis

Este benchmarking presenta las siguientes limitaciones:

1. se basa principalmente en documentación pública y páginas oficiales;
2. algunas capacidades dependen de planes, módulos o integraciones adicionales;
3. no se realizó una prueba completa de cada producto;
4. no se verificaron todos los comportamientos internos;
5. las funciones pueden cambiar con nuevas versiones;
6. varios productos están orientados a mercados distintos del boliviano;
7. las funciones descritas por proveedores comerciales pueden tener un enfoque de marketing;
8. el benchmarking no sustituye la validación directa con Fratelli.

Por estas razones, toda conclusión que afecte una regla del negocio deberá contrastarse con evidencia directa.

---

# 25. Estado final

```text
Técnica:
Análisis de sistemas similares / benchmarking

Sistemas:
6

Resultado:
Patrones funcionales identificados
+
alternativas documentadas
+
preguntas de refinamiento reforzadas
+
sin incorporación automática de nuevos requisitos
```

Este documento constituye evidencia complementaria para el relevamiento de Restaurant System.
