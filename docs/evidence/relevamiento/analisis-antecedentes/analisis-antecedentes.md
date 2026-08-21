# Análisis de antecedentes — Forma de trabajo actual de Fratelli

## 1. Identificación

| Campo | Valor |
|---|---|
| **Proyecto** | Restaurant System |
| **Organización** | Restaurante Fratelli |
| **Técnica** | Análisis de antecedentes — análisis documental |
| **Fuente primaria** | `detalle-de-la-manera-de-trabajo.pdf` |
| **Autora del antecedente** | Ana Paola Viscarra Chambi |
| **Momento de elaboración** | Antes de la primera entrevista formal |
| **Estado** | Analizado y contrastado posteriormente con entrevistas |

---

## 2. Objetivo

Analizar la información ya disponible sobre la forma de trabajo de Fratelli para obtener una primera representación de:

- actores y responsabilidades;
- procesos operativos;
- información utilizada;
- sistema existente;
- puntos todavía manuales o externos;
- posibles necesidades que debían profundizarse mediante entrevistas.

Este método no busca convertir todo lo descrito en un requisito del nuevo producto. Su propósito es utilizar un **antecedente proporcionado por la organización** como fuente documental y contrastarlo después con evidencia directa.

---

## 3. Método de análisis

El documento fue revisado por áreas funcionales. Para cada tema se identificó:

```text
Qué describe el antecedente
        ↓
Qué proceso/actor involucra
        ↓
Qué problema o necesidad sugiere
        ↓
Qué debía confirmarse o ampliarse mediante entrevista
```

Las afirmaciones de este archivo se limitan al contenido del PDF y a su contraste documental posterior. Las reglas precisas descubiertas en `ENT-01` y `ENT-02` se documentan en los artefactos de entrevistas y en los documentos maestros.

---

# 4. Contexto del restaurante

El antecedente describe a Fratelli como un restaurante de platos a la carta de estilo italiano que ofrece, entre otros:

- pizzas;
- pastas;
- entradas;
- carnes;
- pescados;
- sándwiches;
- bebidas;
- postres;
- vinos.

Se indica una dotación aproximada de **nueve trabajadores**, incluyendo cuatro meseros, personal de cocina, encargado y contadora.

### Aporte al relevamiento

El documento permitió identificar tempranamente que Restaurant System no tendría un único perfil de usuario, sino varios actores operativos y administrativos.

---

# 5. Meseros, atención y ventas

El antecedente señala que los meseros:

- mantienen el contacto principal con los clientes;
- atienden mesas;
- toman pedidos;
- registran ventas;
- realizan funciones de caja y cobro;
- manejan medios de pago;
- realizan algunas actividades de barismo/bebidas;
- disponen de usuarios individuales en el sistema existente.

### Hallazgo documental

La identificación individual de los meseros ya formaba parte de la operación existente y permitía asociar operaciones/ventas a una persona.

### Aspectos que requerían contraste

- permisos exactos;
- acumulación de responsabilidades;
- alcance de consulta de ventas;
- relación con turnos y caja.

Las entrevistas posteriores confirmaron que una misma persona puede cumplir varias responsabilidades operativas.

---

# 6. Pedidos y comandas

El documento describe el flujo general:

```text
Cliente
   ↓
Mesero registra pedido
   ↓
Se genera comanda
   ↓
Cocina recibe comanda
   ↓
Preparación del plato
```

### Aporte al relevamiento

Este antecedente proporcionó evidencia suficiente para investigar la preservación de pedidos y comandas dentro del nuevo sistema, en vez de tratar la venta como un único registro sin proceso de cocina.

### Aspectos que requerían precisión

- estados del pedido;
- estados de la comanda;
- cancelaciones;
- momento de afectación de inventario;
- permisos de Cocina y Mesero.

Estas reglas se definieron posteriormente en la SRS y reglas de negocio.

---

# 7. Producción

El antecedente informa que existen **dos días de producción por semana**, durante los cuales se adelantan preparaciones o ingredientes que serán utilizados posteriormente durante el servicio.

### Aporte al relevamiento

Permitió identificar que la producción no debía confundirse con la venta inmediata de un plato.

### Aspectos que no resolvía el antecedente

- cantidad final vs. rendimiento esperado;
- unidades y conversiones;
- mermas/bajas;
- trazabilidad de cada producción;
- necesidad de lotes separados;
- vencimientos.

Estos puntos motivaron preguntas específicas de `ENT-02`.

---

# 8. Encargado

El antecedente atribuye al Encargado funciones relacionadas con:

- ingreso de productos;
- productos como bebidas, postres, platos y otros elementos;
- movimientos de almacén/inventario;
- entradas y bajas;
- revisión de información;
- obtención de reportes.

### Aporte al relevamiento

Identificó al Encargado como uno de los actores con mayor alcance operativo y justificó profundizar sus permisos en inventario, compras, caja y reportes.

---

# 9. Inventario y stock bajo

El antecedente describe un control de:

- productos de venta directa;
- alimentos;
- ingredientes;
- entradas;
- salidas.

También indica que el sistema existente **no genera una alerta automática de stock mínimo**, lo que puede contribuir a que ciertos productos lleguen a cantidades bajas o falten.

### Necesidades sugeridas

- inventario centralizado y consistente;
- stock mínimo configurable;
- mecanismo interno para identificar existencias bajas;
- movimientos trazables.

Estas necesidades fueron contrastadas y reforzadas durante `ENT-01`.

---

# 10. Proveedores y compras

El antecedente menciona aproximadamente **veinte proveedores**, incluyendo proveedores de:

- verduras;
- carnes;
- hongos;
- leche;
- pescados;
- mariscos;
- otros insumos.

Se documenta que las compras no cuentan con un módulo que centralice toda su información y que parte del proceso utiliza:

- recibos;
- documentos externos;
- registros manuales.

También se señala que no existe un control completo de obligaciones pendientes con proveedores.

### Aporte al relevamiento

Permitió identificar las necesidades de compras/proveedores y diferenciar:

```text
flujo básico de compra/recepción — candidato al MVP

vs.

cuentas por pagar avanzadas — evolución posterior
```

### Aspectos que requerían entrevista

- quién puede comprar qué;
- quién recibe;
- cuándo aumenta inventario;
- qué ocurre con compras incompletas;
- respaldo requerido.

`ENT-02` resolvió estos puntos para la baseline del MVP.

---

# 11. Clientes, crédito, promociones y descuentos

El antecedente indica que el sistema existente contempla:

- registro de clientes;
- clientes frecuentes;
- ventas al contado;
- ventas a crédito;
- cuentas pendientes;
- firma cuando corresponde;
- promociones;
- descuentos.

### Interpretación para el nuevo producto

La existencia de estas capacidades en el sistema anterior ayudó a reconocerlas como parte de la visión funcional del negocio, pero **no obliga a implementarlas todas en el MVP**.

La decisión posterior de alcance mantiene:

- gestión básica de clientes en MVP;
- crédito/cuentas por cobrar en Post-MVP;
- promociones avanzadas fuera de la primera entrega.

---

# 12. Contadora, planillas y pagos al personal

El antecedente describe a la Contadora como responsable de actividades administrativas relacionadas con:

- planillas de trabajadores;
- horas/actividades consideradas para pago;
- descuentos;
- información necesaria para calcular pagos.

También indica que algunos datos de horarios/asistencia se registran manualmente.

### Aporte al relevamiento

Permitió identificar la necesidad de mejorar el registro de asistencia y disponer de información más confiable para el proceso administrativo posterior.

### Límite

El antecedente no justifica por sí solo implementar nómina completa dentro del MVP.

---

# 13. Pagos, caja e ingresos/egresos

El antecedente menciona:

- pagos mediante QR;
- registros internos;
- cierres de caja;
- control de ventas/dinero generado;
- información de ventas y cierres disponible en el sistema actual;
- falta de integración completa de ingresos y egresos.

### Aporte al relevamiento

Ayudó a identificar que caja/cierre era una capacidad existente que debía preservarse, pero no especificaba suficientemente:

- funcionamiento de los dos turnos;
- monto inicial;
- traspaso;
- diferencias;
- caja chica;
- PedidosYa;
- responsable/aprobación del cierre.

Estas reglas fueron aclaradas después mediante `ENT-01` y, principalmente, `ENT-02`.

---

# 14. Diagnóstico derivado del antecedente

El documento permite observar una combinación de:

```text
sistema existente
+
planillas
+
recibos
+
registros manuales
+
procesos externos
```

La situación no puede resumirse como “Fratelli no tiene sistema”.

El problema documentalmente observable es que **el sistema existente cubre parte importante de la operación, pero varios procesos relevantes permanecen distribuidos en fuentes externas o manuales**.

Esto fue utilizado como base para formular el diagnóstico y preparar las entrevistas.

---

# 15. Hallazgos derivados del análisis de antecedentes

| ID auxiliar | Hallazgo documental | Uso posterior |
|---|---|---|
| `AA-01` | Existen múltiples roles operativos/administrativos | Actores, permisos |
| `AA-02` | Meseros participan en atención, ventas, caja y bebidas | Roles y trazabilidad |
| `AA-03` | Pedido genera comanda para Cocina | Pedidos/comandas |
| `AA-04` | Existe producción anticipada | Producción/inventario |
| `AA-05` | Encargado gestiona movimientos y reportes | Inventario/reportes |
| `AA-06` | No existe alerta automática de stock mínimo | Stock bajo |
| `AA-07` | Compras y proveedores están parcialmente fuera del sistema | Compras/proveedores |
| `AA-08` | Existen clientes y crédito en la operación actual | MVP vs. Post-MVP |
| `AA-09` | Horarios/asistencia tienen componente manual | Asistencia |
| `AA-10` | Existen cierres de caja pero ingresos/egresos no están totalmente integrados | Caja/gastos |
| `AA-11` | El negocio combina sistema y fuentes manuales | Problema central |

Los IDs `AA-XX` son auxiliares de este análisis y **no reemplazan** los identificadores `H-XXX`, `N-XXX`, `RF-XXX` o `RN-XXX` de la documentación maestra.

---

# 16. Contraste con las entrevistas

El análisis de antecedentes se realizó como fuente previa; las entrevistas permitieron después:

- confirmar problemas de planillas, gastos e inventario;
- precisar compra/recepción;
- definir unidades reales;
- simplificar producción a cantidad final y disponibilidad consolidada;
- definir bajas con motivo;
- precisar dos turnos con una caja y un cierre;
- definir monto inicial, traspaso, diferencias y PedidosYa separado;
- confirmar múltiples responsabilidades por persona.

Por tanto, el antecedente **aporta contexto**, mientras que las entrevistas aportan reglas más específicas del funcionamiento real.

---

# 17. Limitaciones

El documento antecedente:

- fue elaborado por una fuente interna específica;
- describe procesos a nivel general;
- no contiene métricas cuantitativas suficientes;
- no especifica todos los estados y excepciones;
- no proporciona acceso técnico al sistema existente;
- no debe utilizarse de manera aislada para inventar reglas detalladas.

Por ello se complementa con las otras dos técnicas del relevamiento.

---

# 18. Resultado

El análisis de antecedentes se considera **aplicado** y cumple la función de segunda técnica de investigación del proyecto.

Su resultado se utiliza como evidencia en:

```text
02-relevamiento.md
03-hallazgos-y-necesidades.md
04-objetivos-y-propuesta-valor.md
05-alcance-y-mvp.md
06-srs.md
requirements/
07-product-backlog.md
```

La fuente original permanece preservada sin modificaciones en la misma carpeta.
