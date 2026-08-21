# 02 — Relevamiento

## 1. Propósito

Este documento registra el proceso de relevamiento utilizado para **Restaurant System** en **Fratelli** y establece cómo se obtuvieron, contrastaron y utilizaron los datos que sustentan necesidades y requisitos.

La versión actual incorpora tres técnicas distintas:

```text
Entrevistas semiestructuradas
+
Análisis de antecedentes
+
Análisis de sistemas similares / benchmarking
```

Las sesiones `ENT-01` y `ENT-02` son dos aplicaciones del **mismo método de entrevista**.

---

## 2. Estado del relevamiento

| Elemento | Estado |
|---|---|
| Análisis de antecedentes | **Completado** |
| Entrevista `ENT-01` | **Completada y transcrita** |
| Entrevista `ENT-02` | **Completada y transcrita** |
| Análisis de sistemas similares | **Completado** |
| Triangulación documental | **Completada para la baseline actual** |
| Reglas que bloqueaban HU | **Refinadas** |
| Nuevas entrevistas directas planificadas | **No planificadas** |
| Consultas puntuales posteriores mediante Product Owner | **Permitidas si surge una duda concreta** |

---

# 3. Objetivos del relevamiento

## 3.1. Objetivo general

Comprender y validar el funcionamiento actual de Fratelli, identificar problemas y necesidades, y obtener suficiente detalle de las reglas operativas para construir un Product Backlog trazable sin inventar comportamientos no sustentados.

## 3.2. Objetivos específicos

1. comprender la situación actual del restaurante;
2. identificar problemas prioritarios;
3. conocer inventario, producción y reposición;
4. comprender compras, recepción y proveedores;
5. entender horarios, asistencia y uso de planillas;
6. comprender gastos, caja, turnos y cierre;
7. identificar funciones útiles del sistema existente;
8. determinar si el sistema actual será complementado o reemplazado;
9. contrastar el negocio con patrones presentes en sistemas gastronómicos reales;
10. refinar reglas que impedían avanzar determinadas historias del Product Backlog.

---

# 4. Organización de la evidencia

```text
docs/evidence/relevamiento/
├── README.md
├── entrevistas/
│   ├── README.md
│   ├── entrevista-01-trabajadora/
│   │   ├── README.md
│   │   ├── entrevista-1-audio.mp3
│   │   └── transcripcion.md
│   └── entrevista-02-trabajadora/
│       ├── README.md
│       ├── entrevista-2-audio.mp3
│       └── transcripcion.md
├── analisis-antecedentes/
│   ├── README.md
│   ├── analisis-antecedentes.md
│   └── detalle-de-la-manera-de-trabajo.pdf
└── analisis-sistemas-similares/
    ├── README.md
    └── analisis-sistemas-similares.md
```

Esta estructura separa las **tres técnicas**, aunque la carpeta de entrevistas contenga dos sesiones.

---

# 5. Técnica 1 — Entrevista semiestructurada

## 5.1. ENT-01 — Diagnóstico general

| Campo | Valor |
|---|---|
| **Código** | `ENT-01` |
| **Fecha** | 19 de agosto de 2026 |
| **Modalidad** | Virtual mediante Discord |
| **Entrevistador** | Josué Matias Arroyo Reynoso |
| **Entrevistada** | Ana Paola Viscarra Chambi |
| **Perfil** | Trabajadora actual de Fratelli y Product Owner |
| **Duración** | Aproximadamente 23 min 11 s |
| **Estado** | Completada |

### Finalidad

Validar el antecedente documental y profundizar principalmente en:

- prioridades;
- inventario y faltantes;
- compras y proveedores;
- horarios y asistencia;
- gastos y caja chica;
- producción;
- reportes;
- limitaciones del sistema actual;
- intención de reemplazo.

### Resultados principales

La sesión confirmó, entre otros puntos:

- planillas manuales de asistencia;
- doble captura de producción;
- faltantes y sobrantes frecuentes;
- ausencia de alertas de stock bajo;
- compras y gastos distribuidos en medios externos;
- uso de Excel por la contadora para el cálculo de pagos;
- existencia de dos turnos y un cierre total;
- necesidad de preservar capacidades útiles del sistema actual;
- intención explícita de reemplazarlo;
- ausencia de una integración técnica conocida.

---

## 5.2. ENT-02 — Refinamiento de reglas operativas

| Campo | Valor |
|---|---|
| **Código** | `ENT-02` |
| **Fecha** | Pendiente de consignar en la evidencia disponible |
| **Modalidad** | Pendiente de consignar en la evidencia disponible |
| **Participantes** | Metadatos personales pendientes de consignar en la evidencia disponible |
| **Duración** | Aproximadamente 14 min 17 s |
| **Estado** | Completada y transcrita |

> Los metadatos que no aparecen en la fuente no se inventan. Esta limitación no impide utilizar las respuestas operativas contenidas en audio/transcripción, pero debe corregirse cuando el equipo disponga del dato real.

### Finalidad

Resolver información faltante de:

```text
HU-004
HU-007
HU-017
HU-025
HU-026
HU-027
```

### Resultados de producción

Se obtuvo que:

- las carnes se compran por **kilos** y pueden utilizarse/registrarse en **gramos**;
- los líquidos se manejan en **litros** según la respuesta obtenida;
- en producción interesa registrar la **cantidad final obtenida**, no un rendimiento esperado formal;
- las pérdidas/bajas se registran **por separado** como salida de almacén y se conserva el **motivo**;
- si una preparación se produce varias veces, operativamente basta conocer la **cantidad total disponible**;
- de cada producción interesa conservar al menos **fecha, cantidad y responsable**; la entrevistada también mencionó la **firma del responsable**;
- actualmente no se maneja una fecha de vencimiento exacta en el sistema; cocina conoce qué preparación utilizar primero.

**Precisión sobre la firma:** la entrevista confirma que la firma forma parte de la referencia operativa mencionada por la participante, pero no define si el nuevo sistema debe capturar una firma manuscrita/digital ni su formato. La baseline del MVP conserva la trazabilidad mediante **usuario autenticado responsable**. Una función específica de captura de firma no se asume ni bloquea `HU-007` hasta que exista una necesidad explícita.

### Resultados de compras

Se obtuvo que:

- **COCINA** compra principalmente ingredientes de preparación;
- **ENCARGADO** compra normalmente bebidas, limpieza y otros insumos generales;
- Cocina puede realizar su compra directamente y debe conservar respaldo mediante **recibo** para el pago;
- una bebida puede ingresarse al inventario después de su recepción;
- un insumo de cocina se verifica primero —por ejemplo, peso— y puede porcionarse antes de registrarse en inventario;
- cuando una compra llega incompleta se coordina con el proveedor y se devuelve; se indicó que sucede **de vez en cuando**, no como comportamiento ordinario.

### Resultados de turnos y cierre

Se obtuvo que:

- los trabajadores conocen/asumen el turno asignado y comienzan a operar;
- existe un **monto fijo de inicio** dejado por el encargado para el turno de la mañana;
- los dos turnos utilizan **la misma caja**;
- se realiza **un único cierre** al final;
- al traspasar el turno se deja información de efectivo, QR, crédito y PedidosYa para que el siguiente turno verifique el estado;
- el cierre revisa ventas en efectivo y QR y considera los gastos;
- existe una **caja chica separada** para gastos;
- cuando hay diferencia de efectivo se deja una observación y se consulta al turno involucrado;
- **PedidosYa se controla por separado** porque el dinero no ingresa igual que una venta directa en caja;
- el **encargado realiza el cierre**;
- la **contadora revisa** posteriormente la información, pero no existe una aprobación posterior necesaria para que el cierre quede cerrado.

### Resultado sobre roles

La sesión confirma además que una persona puede cumplir varias responsabilidades operativas. Se mencionó que:

- el encargado puede cubrir funciones de mesero;
- un mesero puede cumplir también funciones de barista y caja.

Este resultado refuerza el modelo de **múltiples roles/permisos acumulables** ya definido.

---

# 6. Técnica 2 — Análisis de antecedentes

## 6.1. Fuente

```text
docs/evidence/relevamiento/analisis-antecedentes/
├── README.md
├── analisis-antecedentes.md
└── detalle-de-la-manera-de-trabajo.pdf
```

El documento fue redactado por Ana Paola Viscarra Chambi antes de la entrevista formal.

## 6.2. Finalidad

Servir como antecedente del negocio y proporcionar una primera descripción de:

- personal y responsabilidades;
- atención y ventas;
- pedidos/comandas;
- producción;
- inventario;
- compras/proveedores;
- clientes;
- planillas;
- pagos y caja;
- combinación entre sistema y procesos manuales.

## 6.3. Aporte

Este antecedente permitió preparar preguntas de entrevista y contrastar posteriormente si las respuestas:

```text
CONFIRMAN
AMPLÍAN
CORRIGEN
CONTRADICEN
AGREGAN
```

información al diagnóstico inicial.

## 6.4. Limitación

El documento no define con suficiente precisión todas las reglas, excepciones, permisos y cálculos; por ello no se utiliza solo para cerrar historias críticas.

---

# 7. Técnica 3 — Análisis de sistemas similares / benchmarking

## 7.1. Fuente

```text
docs/evidence/relevamiento/analisis-sistemas-similares/
├── README.md
└── analisis-sistemas-similares.md
```

## 7.2. Sistemas analizados

El análisis compara seis referencias del dominio gastronómico:

- Fudo;
- Odoo Point of Sale — Restaurant;
- Square for Restaurants;
- Lightspeed Restaurant;
- Toast;
- SINCPRO — Sistema para Restaurantes.

## 7.3. Finalidad

El benchmarking se utilizó para:

- identificar patrones funcionales comunes;
- conocer formas alternativas de resolver procesos;
- detectar preguntas útiles para el refinamiento;
- contrastar el alcance de Fratelli con sistemas maduros;
- obtener referencias para UX/arquitectura posteriores.

## 7.4. Patrones relevantes encontrados

Entre los patrones recurrentes aparecen:

- flujo pedido → cocina → venta;
- inventario relacionado con recetas/composición;
- separación entre compra y recepción;
- actualización de stock al recibir mercadería;
- roles/permisos diferenciados;
- caja/turno/reporte como conceptos relacionados;
- fichaje del personal separado de nómina completa;
- integración modular de hardware;
- crecimiento progresivo mediante módulos.

## 7.5. Regla metodológica

Una función encontrada en otro sistema **no se convierte automáticamente** en requisito de Fratelli.

Ejemplo:

```text
Sistema similar soporta división de cuenta
        ↓
Se registra como referencia
        ↓
No entra al MVP sin evidencia de Fratelli
```

---

# 8. Triangulación de resultados

| Tema | Antecedentes | Entrevistas | Sistemas similares | Resultado para Fratelli |
|---|:---:|:---:|:---:|---|
| Pedido/comanda | ✓ | ✓ | ✓ | Patrón y necesidad sustentados |
| Inventario por ingredientes | ✓ | ✓ | ✓ | Sustentado |
| Stock bajo | ✓ | ✓ | ✓ | Necesidad validada |
| Producción separada de venta | ✓ | ✓ | ✓ | Sustentada y refinada en ENT-02 |
| Compras/proveedores | ✓ | ✓ | ✓ | Sustentadas y refinadas en ENT-02 |
| Recepción antes de stock | Parcial | ✓ | ✓ | Regla básica validada |
| Roles/permisos | ✓ | ✓ | ✓ | Sustentados; ENT-02 refuerza múltiples responsabilidades |
| Asistencia | ✓ | ✓ | ✓ | MVP sustentado; nómina sigue Post-MVP |
| Turnos/caja | ✓ | ✓ | ✓ | Regla concreta definida por ENT-02 |
| PedidosYa | — | ✓ | Referencia de canales externos | Se controla separado en el cierre, sin integración automática |
| Facturación fiscal | Sistema actual/contexto | — | ✓ | Continúa Post-MVP por decisión de alcance |

---

# 9. Efecto sobre historias previamente bloqueadas

La segunda entrevista proporciona información suficiente para retirar el **bloqueo crítico** de las siguientes historias:

| HU | Bloqueo anterior | Resolución obtenida | Estado documental resultante |
|---|---|---|---|
| `HU-004` | Unidades/conversiones | kg↔g confirmado para carnes; litros confirmados para líquidos; nuevas conversiones se refinan solo si aparecen | `CANDIDATA A READY` |
| `HU-007` | Rendimiento/merma/lotes/vencimiento | cantidad final; salida con motivo; disponibilidad agregada; sin vencimiento exacto en MVP | `CANDIDATA A READY` |
| `HU-017` | Compras autorizadas de cocina | Cocina compra ingredientes directamente con recibo; Encargado bebidas/limpieza/general | `CANDIDATA A READY` |
| `HU-025` | Apertura y relación entre turnos | dos turnos, misma caja, traspaso y monto de inicio | `CANDIDATA A READY` |
| `HU-026` | Componentes del cierre | efectivo, QR, gastos, caja chica, PedidosYa separado, diferencias | `CANDIDATA A READY` |
| `HU-027` | Responsable y cierre total | un cierre; Encargado cierra; Contadora revisa sin aprobar | `CANDIDATA A READY` |

Por tanto, en GitHub Projects estas historias pueden moverse:

```text
Blocked
   ↓
Backlog
```

**No deben moverse todavía automáticamente a `Ready`**. La Definition of Ready se formalizará en `08-scrum-y-refinamiento.md` y deberá verificarse antes del Sprint Planning.

---

# 10. Información que permanece pendiente

El refinamiento actual no pretende resolver todo el producto. Permanecen pendientes o fuera del MVP, entre otros:

- reglas completas de crédito a clientes;
- cuentas por cobrar;
- pagos parciales/vencimientos avanzados de proveedores;
- nómina completa;
- promociones/descuentos avanzados;
- migración histórica;
- modelos/SDK de biométrico;
- impresión térmica física;
- integración automática con PedidosYa;
- facturación fiscal;
- reglas nuevas de unidad que aparezcan para ingredientes todavía no relevados;
- fórmula contable avanzada de conciliación si en una versión posterior se requiere mayor detalle que el resumen operativo del MVP.

Estas áreas no bloquean las seis HU refinadas en su alcance actual.

---

# 11. Consideraciones éticas y de calidad

- no se atribuyen respuestas inexistentes;
- los metadatos faltantes de ENT-02 se mantienen como pendientes;
- los ejemplos de sistemas similares no sustituyen reglas del restaurante;
- el audio constituye la evidencia primaria de entrevista;
- no se inventan métricas cuantitativas;
- los datos personales o sensibles no necesarios no deben publicarse sin autorización.

---

# 12. Limitaciones metodológicas

## 12.1. Perspectiva interna concentrada

La información directa proviene de un número reducido de participantes y la principal validación del negocio sigue concentrada en la Product Owner/equipo de Fratelli.

## 12.2. Benchmarking externo

Las páginas de proveedores pueden describir funciones comerciales de forma promocional. Se utilizaron como referencia funcional, no como evidencia del proceso interno de Fratelli.

## 12.3. Evidencia cualitativa

No existen métricas históricas suficientes para cuantificar con precisión pérdidas, tiempos o tasa de errores.

## 12.4. Sin acceso técnico al sistema anterior

No se conoce su arquitectura, API, base de datos o capacidad real de exportación.

---

# 13. Mecanismo para aclaraciones futuras

La baseline de relevamiento se considera suficiente para continuar.

Si durante refinamiento o implementación aparece una regla nueva que no pueda resolverse con la evidencia existente:

```text
Equipo
  ↓ pregunta puntual
Product Owner
  ↓ consulta/validación cuando sea necesaria
Fratelli
  ↓
respuesta documentada
```

No se añadirá comportamiento por suposición.

---

# 14. Criterio de cierre de esta etapa

El relevamiento se considera suficientemente consolidado para continuar porque:

- se aplicaron tres técnicas distintas;
- existe evidencia organizada por método;
- se contrastaron antecedentes, entrevistas y referencias externas;
- se identificaron y refinaron las reglas que bloqueaban seis historias;
- el Product Backlog puede actualizarse sin ampliar silenciosamente el MVP.

---

# 15. Control de cambios

| Versión | Fecha | Descripción | Estado |
|---|---|---|---|
| `0.1` | 19/08/2026 | Plan y entrevista inicial | Sustituido |
| `0.2` | 20/08/2026 | Consolidación de ENT-01 | Sustituido |
| `0.3` | 21/08/2026 | Tres técnicas aplicadas, ENT-02, benchmarking y refinamiento de HU bloqueadas | Vigente |
