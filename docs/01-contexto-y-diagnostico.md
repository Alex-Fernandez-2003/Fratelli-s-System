# 01 — Contexto y Diagnóstico

## 1. Propósito del documento

Este documento describe el contexto actual de **Fratelli**, consolida el diagnóstico que da origen a **Restaurant System** y registra el estado del conocimiento después de aplicar las tres técnicas de relevamiento definidas para el proyecto.

La versión actual utiliza:

- análisis de antecedentes;
- dos entrevistas semiestructuradas (`ENT-01` y `ENT-02`), pertenecientes a una misma técnica;
- análisis de sistemas similares / benchmarking.

Su objetivo es separar claramente:

```text
situación actual
problemas observados
reglas conocidas
limitaciones
referencias externas
```

antes de convertir la información en necesidades y requisitos.

---

## 2. Estado documental

| Campo | Valor |
|---|---|
| **Documento** | `01-contexto-y-diagnostico.md` |
| **Proyecto** | Restaurant System |
| **Organización** | Restaurante Fratelli |
| **Versión actual** | `0.3` |
| **Fecha de actualización** | 21 de agosto de 2026 |
| **Estado** | Diagnóstico consolidado tras tres técnicas de relevamiento |
| **Product Owner** | Ana Paola Viscarra Chambi |
| **Scrum Master** | Alex Saúl Fernandez Valdez |

---

# 3. Base de evidencia

## 3.1. Análisis de antecedentes

La fuente antecedente principal es:

```text
docs/evidence/relevamiento/analisis-antecedentes/
├── README.md
├── analisis-antecedentes.md
└── detalle-de-la-manera-de-trabajo.pdf
```

El documento fue redactado por Ana Paola Viscarra Chambi antes de `ENT-01` y describe:

- estructura del personal;
- atención y ventas;
- pedidos y comandas;
- cocina y producción;
- inventario;
- compras y proveedores;
- clientes;
- planillas;
- pagos;
- caja;
- coexistencia del sistema actual con medios manuales.

---

## 3.2. Entrevistas semiestructuradas

### ENT-01 — Diagnóstico general

```text
docs/evidence/relevamiento/entrevistas/entrevista-01-trabajadora/
```

| Campo | Valor |
|---|---|
| **Fecha** | 19 de agosto de 2026 |
| **Modalidad** | Virtual mediante Discord |
| **Entrevistador** | Josué Matias Arroyo Reynoso |
| **Entrevistada** | Ana Paola Viscarra Chambi |
| **Duración** | Aproximadamente 23 min 11 s |

Permitió ampliar prioridades, inventario, compras, asistencia, gastos, producción y limitaciones del sistema actual.

### ENT-02 — Refinamiento operativo

```text
docs/evidence/relevamiento/entrevistas/entrevista-02-trabajadora/
```

Duración aproximada del audio: **14 min 17 s**.

Los metadatos de fecha, modalidad y participantes no aparecen completos en la evidencia entregada y se mantienen como pendientes de consignar. La sesión se utiliza para el contenido operativo que sí está registrado en audio/transcripción.

Permitió precisar:

- unidades y conversiones;
- producción y bajas;
- tratamiento de cantidades producidas;
- compras por rol;
- recepción;
- dos turnos y una caja compartida;
- monto inicial y traspaso;
- cierre;
- diferencias;
- PedidosYa;
- revisión contable;
- múltiples responsabilidades por persona.

---

## 3.3. Análisis de sistemas similares / benchmarking

Ubicación:

```text
docs/evidence/relevamiento/analisis-sistemas-similares/
├── README.md
└── analisis-sistemas-similares.md
```

Se analizaron Fudo, Odoo Restaurant, Square for Restaurants, Lightspeed Restaurant, Toast y SINCPRO.

El benchmarking aporta patrones del dominio, por ejemplo:

- pedido → cocina → venta;
- inventario relacionado con composición/recetas;
- compra separada de recepción;
- roles/permisos;
- turnos/caja/reportes;
- asistencia sin necesidad de implementar inmediatamente nómina;
- integración modular con hardware.

**No se utiliza para inventar reglas de Fratelli.** Una función externa solo se convierte en requisito cuando existe evidencia o decisión de alcance propia del proyecto.

---

## 3.4. Criterio de interpretación

Se emplean las siguientes categorías:

- **Confirmado:** afirmado por evidencia interna o decisión explícita;
- **Ampliado:** una fuente añade detalle a otra;
- **Referencia externa:** patrón encontrado mediante benchmarking;
- **Inferencia controlada:** interpretación razonable que debe quedar señalada y no convertirse silenciosamente en regla;
- **Pendiente:** información no suficientemente respaldada.

---

# 4. Descripción general de Fratelli

Fratelli es un restaurante de comida a la carta de estilo italiano. El antecedente documental menciona pizzas, pastas, entradas, carnes, pescados, sándwiches, bebidas, postres y vinos.

El negocio trabaja aproximadamente con nueve personas y combina funciones operativas y administrativas.

La operación actual utiliza un sistema de gestión para varias actividades, pero mantiene procesos paralelos en:

- planillas físicas;
- hojas de producción;
- cuadernos;
- recibos;
- WhatsApp;
- Excel;
- otros registros externos.

La necesidad del proyecto no surge de una ausencia total de software, sino de la **fragmentación entre sistema y registros externos**.

---

# 5. Stakeholders y participantes conocidos

## 5.1. Meseros / personal de atención

Los meseros:

- atienden al cliente;
- registran pedidos;
- registran ventas;
- cobran;
- manejan medios de pago;
- pueden realizar tareas de barismo y bebidas;
- utilizan usuarios individuales en el sistema actual.

`ENT-02` refuerza que una misma persona puede acumular responsabilidades: un mesero puede actuar también como barista y manejar caja.

---

## 5.2. Cocina

Cocina:

- recibe comandas;
- prepara platos;
- participa en jornadas de producción;
- maneja ingredientes;
- controla qué preparaciones deben consumirse primero;
- compra directamente ingredientes relacionados con las preparaciones;
- verifica insumos recibidos y, en ciertos casos, pesa/porciona antes del ingreso a inventario.

---

## 5.3. Encargado

El encargado participa en:

- productos;
- inventario;
- ingresos/bajas;
- reportes;
- compras de bebidas, limpieza y otros insumos generales;
- operación de caja;
- monto fijo que queda para el siguiente inicio;
- cierre final de caja.

`ENT-02` confirma además que el encargado puede cubrir funciones de mesero.

---

## 5.4. Contadora

La contadora utiliza información de asistencia para procesos administrativos y calcula pagos mediante Excel.

También:

- participa en revisiones de inventario;
- consulta información administrativa;
- revisa posteriormente los cierres de caja.

Según `ENT-02`, su revisión **no constituye una aprobación obligatoria** para que el cierre quede registrado como cerrado.

---

## 5.5. Clientes

El sistema actual maneja clientes y existe un proceso de ventas a crédito.

Las reglas completas de crédito, mora, vencimientos, pagos parciales, promociones y descuentos no fueron profundizadas porque el crédito quedó fuera del MVP actual.

---

## 5.6. Proveedores

El antecedente menciona aproximadamente veinte proveedores de distintos tipos de insumos.

La operación utiliza:

- recibos;
- listas;
- mensajes/WhatsApp;
- QR;
- coordinación directa cuando una compra llega incompleta.

---

## 5.7. Product Owner

Ana Paola Viscarra Chambi representa la principal perspectiva de negocio y validación funcional dentro del equipo Scrum.

---

# 6. Funcionamiento actual por áreas

## 6.1. Atención, pedidos y ventas

El flujo base identificado es:

```text
Cliente
  ↓
Pedido
  ↓
Comanda
  ↓
Cocina
  ↓
Preparación
  ↓
Entrega
  ↓
Venta / cobro
```

Los ingresos de venta forman parte del sistema actual.

El benchmarking muestra que esta separación entre pedido, preparación y cobro es un patrón habitual en sistemas gastronómicos, lo que sirve como referencia adicional, no como fuente de una regla interna.

---

## 6.2. Cocina y comandas

Las comandas trasladan a cocina la información necesaria para preparar pedidos.

Los sistemas similares analizados muestran el mismo patrón mediante comandas impresas o KDS, reforzando la utilidad de una vista especializada para cocina.

---

## 6.3. Producción

La producción normalmente ocurre en días definidos y puede realizarse adicionalmente cuando hace falta reponer preparaciones.

### Registro actual

`ENT-01` confirmó un flujo de doble captura:

```text
Producción real
   ↓
Hoja manual
   ↓
Encargado
   ↓
Sistema
```

Este flujo puede producir diferencias entre lo realmente preparado y lo registrado.

### Reglas refinadas en ENT-02

Se confirmó que:

- para la producción interesa principalmente la **cantidad final obtenida**;
- no se requiere un cálculo formal de rendimiento esperado para el MVP;
- si una preparación se produce varias veces, al negocio le basta conocer la **cantidad total disponible**;
- cada registro de producción debe conservar al menos **fecha, cantidad y responsable**;
- no existe una fecha de vencimiento exacta registrada actualmente; cocina conoce qué preparación debe usarse primero;
- una pérdida/baja se registra separadamente como salida de almacén y se conserva el motivo.

### Unidades

Se confirmó al menos el caso:

```text
carne comprada en kg
→ utilizada/registrada en g
```

También se indicó manejo de líquidos en litros.

El sistema deberá soportar las unidades realmente utilizadas; no se incorporarán conversiones adicionales sin necesidad real.

---

## 6.4. Inventario y stock

El negocio controla productos, bebidas, ingredientes y otras existencias.

### Problemas actuales

- no existe alerta automática de stock bajo;
- se realizan revisiones periódicas;
- existen faltantes frecuentes;
- también existen sobrantes;
- hay descoordinación entre hojas de producción y sistema.

### Bajas y mermas

`ENT-02` aclara que una salida/baja relevante debe quedar separada del consumo ordinario y conservar un **motivo**.

Esto permite evitar inventar un catálogo complejo de mermas en el MVP: el dato mínimo requerido es la salida trazable con causa.

---

## 6.5. Compras y proveedores

### Responsabilidades

`ENT-02` precisa:

```text
COCINA
→ ingredientes/preparaciones

ENCARGADO
→ bebidas, limpieza y otros insumos generales
```

Cocina puede realizar compras directas de su ámbito. Se indicó que estas compras deben contar con respaldo mediante recibo para el pago.

### Recepción

La recepción depende del tipo de producto:

- una bebida puede ingresarse al inventario tras recibirse/verificarse;
- un insumo de cocina puede requerir pesaje y porcionado antes del ingreso al inventario.

Por tanto, el concepto importante no es solo “llegó físicamente”, sino **recepción verificada**.

### Compra incompleta

Si una compra llega incompleta se coordina con el proveedor y se realiza devolución. Se indicó que ocurre de vez en cuando.

El MVP no necesita implementar recepción parcial como caso ordinario: una compra no debe marcarse `RECIBIDA` hasta que la recepción aceptada esté resuelta.

### Pagos/proveedores

Las reglas avanzadas de cuentas por pagar permanecen fuera o pendientes de versiones posteriores.

---

## 6.6. Personal, horarios y asistencia

La asistencia actual depende de planillas físicas con información como entrada, salida y firma.

La contadora utiliza posteriormente estas horas en Excel para calcular pagos.

El problema prioritario es la **calidad y centralización del dato de asistencia**, no necesariamente la fórmula de nómina.

El biométrico permanece como integración futura; la lógica de asistencia del MVP debe funcionar sin ese hardware.

---

## 6.7. Gastos, turnos y cierre de caja

### Gastos

Los gastos diarios/caja chica todavía dependen de registros manuales.

`ENT-02` confirma que existe una **caja chica separada** utilizada para gastos.

### Turnos

Fratelli trabaja con dos turnos.

Las personas conocen el turno asignado y comienzan a operar. Ambos turnos utilizan **la misma caja**.

Existe un monto fijo que el encargado deja al terminar la noche para el inicio del turno de la mañana.

### Traspaso entre turnos

El turno de la mañana deja anotada información para el turno siguiente, incluyendo:

- efectivo;
- QR;
- crédito del proceso actual;
- PedidosYa cuando corresponde.

El siguiente turno verifica esa información y continúa la operación.

> El hecho de que el proceso actual mencione crédito no modifica la decisión de alcance: la gestión de crédito sigue fuera del MVP.

### Cierre

Solo se realiza **un cierre total** al final de la jornada compartida por los dos turnos.

El cierre revisa:

- efectivo;
- QR;
- gastos;
- información de caja chica;
- diferencias de efectivo;
- PedidosYa de forma separada.

Cuando existe diferencia, se deja observación y se consulta con el personal del turno involucrado.

El encargado realiza el cierre. La contadora lo revisa después, sin necesidad de aprobación adicional para cerrarlo.

---

## 6.8. Reportes

Se confirmó que determinados usuarios dependen de otra persona para generar reportes del sistema actual.

El nuevo sistema debe proporcionar acceso directo según autorización.

El MVP mantiene tres familias mínimas:

- ventas;
- inventario;
- asistencia.

---

# 7. Sistema existente y decisión de reemplazo

El sistema actual cubre capacidades importantes como:

- ventas;
- pedidos/comandas;
- inventario;
- clientes;
- cuentas por cobrar;
- cierres;
- reportes;
- usuarios.

La Product Owner indicó que desea preservar las capacidades útiles pero **reemplazar la plataforma actual**.

No existe acceso técnico suficiente para depender de su arquitectura, API o base de datos.

---

# 8. Herramientas y medios actuales

| Medio | Uso conocido |
|---|---|
| Sistema actual | ventas, inventario, clientes, cierres y otras funciones |
| Planillas físicas | asistencia/horarios |
| Excel | cálculo administrativo de pagos |
| Hojas de producción | registro previo de producción |
| Cuaderno | gastos diarios/caja chica |
| Recibos | respaldo de compras/pagos |
| WhatsApp | coordinación con proveedores |
| QR | medio de pago |
| PedidosYa | canal externo controlado separadamente en cierre |

---

# 9. Dificultades confirmadas

## D-01 — Control manual de horarios y asistencia

Fuente de errores/pérdida de tiempo y entrada manual para el cálculo posterior.

## D-02 — Doble captura de producción

Producción primero en hoja y después en sistema.

## D-03 — Diferencias frecuentes de inventario

Faltantes y sobrantes asociados, entre otros factores, a registros no sincronizados.

## D-04 — Ausencia de alertas de stock bajo

La detección depende de revisión periódica.

## D-05 — Compras distribuidas en varios medios

Listas, recibos y mensajería dificultan una visión central.

## D-06 — Gastos diarios/caja chica manuales

No se integran de forma completa con la información operacional.

## D-07 — Control de cuentas con proveedores distribuido

No existe una gestión completa centralizada.

## D-08 — Acceso indirecto a determinados reportes

Usuarios autorizables dependen de otro usuario.

## D-09 — Sin integración conocida con el sistema actual

El nuevo producto debe ser independiente.

---

# 10. Prioridades expresadas por la Product Owner

Las prioridades identificadas en `ENT-01` fueron especialmente:

1. control de horarios/entradas/salidas;
2. inventario;
3. alertas de existencias bajas;
4. reducción de procesos manuales en compras y gastos.

La mención de biométrico se conserva como propuesta de solución futura, no como condición para la lógica del MVP.

---

# 11. Diagnóstico actualizado

Fratelli opera con una combinación de sistema digital, registros manuales y medios externos.

El problema no es que el restaurante carezca de sistema, sino que determinadas actividades esenciales permanecen fragmentadas, lo que contribuye a:

- inconsistencias de inventario;
- faltantes/sobrantes;
- doble captura de producción;
- dependencia de planillas para asistencia;
- compras y gastos dispersos;
- dificultad de conciliación entre turnos/caja;
- acceso indirecto a información.

## 11.1. Formulación del problema de trabajo

> **Fratelli presenta fragmentación y descoordinación en determinados procesos operativos y administrativos debido a la coexistencia del sistema actual con registros manuales y medios externos, lo que contribuye a diferencias frecuentes de inventario, faltantes y sobrantes, dificultades en el control de asistencia y cálculo de pagos, y una gestión distribuida de compras, proveedores, gastos y continuidad de caja entre turnos.**

### Estado

**Confirmado como problema de trabajo para esta baseline.**

---

# 12. Causas confirmadas o sustentadas

| ID | Causa | Estado |
|---|---|---|
| `CP-01` | Planillas manuales de asistencia | Confirmada |
| `CP-02` | Producción registrada primero en hojas y luego transcrita | Confirmada |
| `CP-03` | Falta de alerta automática de stock bajo | Confirmada |
| `CP-04` | Compras distribuidas entre listas, recibos y mensajería | Confirmada |
| `CP-05` | Gastos/caja chica fuera del flujo central | Confirmada |
| `CP-06` | Información de proveedores/pagos no completamente centralizada | Confirmada |
| `CP-07` | Determinados reportes dependen de otro usuario | Confirmada |
| `CP-08` | Ausencia de acceso técnico al sistema actual para integrarlo | Confirmada |
| `CP-09` | Traspaso entre turnos depende actualmente de anotaciones/verificación manual | Confirmada por ENT-02 |

---

# 13. Efectos confirmados o sustentados

| ID | Efecto | Estado |
|---|---|---|
| `EF-01` | Errores/pérdida de tiempo en control de asistencia | Confirmado |
| `EF-02` | Diferencias entre producción real y registro digital | Confirmado |
| `EF-03` | Faltantes y sobrantes de inventario | Confirmado |
| `EF-04` | Dependencia del proveedor cuando falta un ingrediente | Confirmado |
| `EF-05` | Información de compras/gastos dispersa | Confirmado |
| `EF-06` | Dependencia de intermediario para determinados reportes | Confirmado |
| `EF-07` | Necesidad de reconciliar manualmente diferencias de efectivo entre turnos | Confirmado por ENT-02 |

---

# 14. Información aún pendiente

La segunda entrevista resolvió las reglas que impedían continuar las seis HU bloqueadas, pero el dominio completo mantiene áreas deliberadamente pendientes.

## 14.1. Inventario y producción

No son bloqueos del MVP actual, pero deberán refinarse si aparecen nuevos casos:

- conversiones distintas de las ya identificadas;
- precisión/decimales por tipo de ingrediente;
- costeo de recetas;
- vencimientos formales de preparados;
- gestión avanzada de múltiples lotes.

## 14.2. Compras y proveedores

Permanecen fuera del flujo básico:

- pagos parciales;
- cuentas por pagar completas;
- vencimientos;
- cuotas;
- conciliación financiera.

## 14.3. Personal

Nómina completa, faltas, atrasos, horas extra y reglas salariales avanzadas siguen fuera del MVP.

## 14.4. Clientes y créditos

Crédito, mora, límites, pagos parciales, promociones y descuentos permanecen Post-MVP/no refinados.

## 14.5. Sistema actual y migración

No existe acceso técnico conocido para migración/integración automática.

## 14.6. Metadatos ENT-02

Deben consignarse cuando el equipo disponga del dato real:

- fecha;
- modalidad;
- entrevistador/a;
- nombre/rol exacto de la entrevistada.

---

# 15. Restricciones y decisiones conocidas

1. El proyecto dispone aproximadamente de 15 días.
2. El nuevo sistema pretende reemplazar la plataforma actual.
3. No existe una integración conocida con el sistema anterior.
4. Deben preservarse las capacidades incluidas en el alcance aprobado.
5. Ana Paola Viscarra Chambi actúa como Product Owner.
6. Alex Saúl Fernandez Valdez actúa como Scrum Master.
7. El producto objetivo es una aplicación web responsive.
8. El hardware biométrico y la impresora se mantienen separados del núcleo del MVP.
9. Se aplicaron tres técnicas de relevamiento: entrevistas, análisis de antecedentes y benchmarking.
10. Las aclaraciones posteriores se realizarán de manera puntual mediante la Product Owner cuando aparezca una regla realmente no cubierta.
11. El benchmarking no define por sí solo reglas internas de Fratelli.

---

# 16. Limitaciones del diagnóstico

## 16.1. Perspectiva interna concentrada

La principal fuente de conocimiento interno sigue concentrada en pocas personas. El análisis de antecedentes aporta contexto y el benchmarking añade contraste externo, pero no sustituyen una muestra amplia de trabajadores.

## 16.2. Información principalmente cualitativa

No existen métricas históricas robustas para cuantificar pérdidas, tiempos o tasas de error.

## 16.3. Sin inspección técnica del sistema existente

No se conoce su arquitectura, base de datos ni APIs.

## 16.4. Benchmarking basado en información pública

Las funciones de sistemas similares pueden depender de plan, mercado o integración. Se utilizan como referencia, no como descripción de Fratelli.

---

# 17. Criterio de salida del diagnóstico

El diagnóstico se considera suficiente para continuar porque:

- se aplicaron tres técnicas distintas;
- se organizó evidencia por método;
- el problema central permanece coherente;
- las reglas que bloqueaban `HU-004`, `HU-007`, `HU-017`, `HU-025`, `HU-026` y `HU-027` fueron suficientemente aclaradas para devolverlas a Backlog;
- las áreas todavía pendientes son Post-MVP, no críticas para esas historias o pueden refinarse durante DoR sin inventar comportamiento.

---

# 18. Próximo documento

La evidencia se consolida en:

```text
docs/03-hallazgos-y-necesidades.md
```

---

# 19. Control de cambios

| Versión | Fecha | Descripción | Estado |
|---|---|---|---|
| `0.1` | 19/08/2026 | Diagnóstico inicial | Sustituido |
| `0.2` | 20/08/2026 | Consolidación de ENT-01 | Sustituido |
| `0.3` | 21/08/2026 | Tres técnicas, ENT-02, nuevas reglas operativas y actualización de pendientes | Vigente |
