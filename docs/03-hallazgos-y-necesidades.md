# 03 — Hallazgos y Necesidades

## 1. Propósito del documento

Este documento consolida los hallazgos obtenidos durante el relevamiento inicial de **Restaurant System** para el restaurante **Fratelli** y transforma la evidencia disponible en necesidades trazables del negocio y de sus usuarios.

Su objetivo es establecer una cadena documental clara:

```text
Fuente / evidencia
        ↓
Hallazgo H-XXX
        ↓
Necesidad N-XXX
        ↓
Objetivos
        ↓
Alcance / MVP
        ↓
Requisitos
        ↓
Product Backlog
```

Este documento **no define todavía requisitos funcionales ni selecciona definitivamente tecnologías o soluciones concretas**.

Una necesidad expresa qué debe poder lograr, controlar o conocer un usuario o la organización. La forma exacta de resolverla se decidirá posteriormente.

---

## 2. Estado documental

| Campo                       | Valor                                |
| --------------------------- | ------------------------------------ |
| **Documento**               | `03-hallazgos-y-necesidades.md`      |
| **Proyecto**                | Restaurant System                    |
| **Organización objetivo**   | Restaurante Fratelli                 |
| **Versión inicial**         | `0.1`                                |
| **Estado**                  | Hallazgos y necesidades consolidados |
| **Fecha**                   | 20 de agosto de 2026                 |
| **Product Owner**           | Ana Paola Viscarra Chambi            |
| **Scrum Master**            | Alex Saúl Fernandez Valdez           |
| **Entrevistador de ENT-01** | Josué Matias Arroyo Reynoso          |
| **Modalidad de ENT-01**     | Virtual mediante Discord             |

---

# 3. Fuentes utilizadas

## 3.1. FU-01 — Documento descriptivo del negocio

Documento elaborado por **Ana Paola Viscarra Chambi** antes de la entrevista.

Ubicación documental prevista:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
└── detalle-de-la-manera-de-trabajo.pdf
```

Aporta información inicial sobre:

- personal;
- atención;
- ventas;
- cocina;
- comandas;
- producción;
- inventario;
- compras;
- proveedores;
- clientes;
- ventas a crédito;
- planillas;
- pagos;
- caja;
- procesos manuales.

---

## 3.2. FU-02 — Entrevista semiestructurada ENT-01

Entrevista realizada a la Product Owner y trabajadora actual de Fratelli.

| Campo                   | Valor                       |
| ----------------------- | --------------------------- |
| **Código**              | `ENT-01`                    |
| **Fecha**               | 19 de agosto de 2026        |
| **Entrevistada**        | Ana Paola Viscarra Chambi   |
| **Entrevistador**       | Josué Matias Arroyo Reynoso |
| **Modalidad**           | Virtual mediante Discord    |
| **Registro**            | Audio                       |
| **Duración aproximada** | 23 min 11 s                 |
| **Transcripción**       | Disponible                  |

Evidencia:

```text
docs/evidence/relevamiento/entrevista-01-trabajadora/
├── README.md
├── detalle-de-la-manera-de-trabajo.pdf
├── entrevista-1-audio.mp3
└── transcripcion.md
```

---

## 3.3. Fuentes complementarias futuras

Si durante las siguientes etapas aparece una duda que Ana Paola Viscarra Chambi no pueda resolver directamente, únicamente se permitirá:

```text
Equipo
  ↓
pregunta puntual
  ↓
Product Owner
  ↓
consulta a un miembro de Fratelli
  ↓
Product Owner
  ↓
respuesta documentada al equipo
```

Estas respuestas se registrarán como **consultas indirectas mediante Product Owner**, no como entrevistas adicionales.

---

# 4. Criterios de consolidación

## 4.1. Nivel de confianza

Se utilizarán los siguientes niveles:

| Nivel         | Significado                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| **Alto**      | Información afirmada directamente durante la entrevista y/o respaldada también por el documento previo |
| **Medio**     | Interpretación sustentada por varias evidencias, pero que todavía requiere precisar reglas o alcance   |
| **Pendiente** | Información insuficiente para consolidar una conclusión                                                |

## 4.2. Impacto

El impacto se clasifica cualitativamente como:

| Nivel     | Criterio                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| **Alto**  | Afecta un proceso prioritario, genera errores frecuentes, descoordinación o dependencia operativa relevante |
| **Medio** | Afecta control, información o eficiencia, pero no fue señalado como uno de los problemas principales        |
| **Bajo**  | Impacto limitado o todavía no demostrado                                                                    |

No se utilizan porcentajes, tiempos o costos económicos porque no existe evidencia cuantitativa suficiente.

## 4.3. Prioridad de necesidades

La prioridad inicial se determina utilizando:

- prioridad expresada por la Product Owner;
- frecuencia cualitativa observada;
- impacto operativo;
- dependencia para otros procesos;
- necesidad de preservar capacidades del sistema actual.

Valores:

```text
CRÍTICA
ALTA
MEDIA
PENDIENTE
```

La prioridad final del MVP se decidirá posteriormente en `05-alcance-y-mvp.md` y en el Product Backlog.

---

# 5. Hallazgos consolidados

## H-001 — El registro de asistencia y horarios es manual

### Fuente

- `FU-01`
- `FU-02 / ENT-01`

### Evidencia

Los trabajadores registran manualmente información como:

- nombre;
- función;
- fecha;
- hora de entrada;
- hora de salida;
- firma.

La información se conserva en planillas físicas.

### Interpretación

El control de asistencia depende de registros manuales que posteriormente deben ser utilizados por otros responsables administrativos.

### Nivel de confianza

**Alto**

### Impacto

**Alto**

La Product Owner señaló este proceso como uno de los que más errores o pérdida de tiempo genera.

---

## H-002 — El cálculo de pagos depende de trasladar información de las planillas

### Fuente

- `FU-01`
- `FU-02 / ENT-01`

### Evidencia

La contadora utiliza un archivo de Excel que calcula automáticamente el pago diario y semanal según las horas introducidas y la tarifa por hora.

Sin embargo, las horas de entrada y salida provienen de las planillas manuales.

### Interpretación

Aunque la hoja de cálculo automatiza el cálculo, la fuente de datos continúa dependiendo de una captura manual previa.

Por tanto, el problema principal no es necesariamente el cálculo matemático, sino la confiabilidad y transferencia de la información utilizada para calcularlo.

### Nivel de confianza

**Alto**

### Impacto

**Alto**

---

## H-003 — La producción se registra dos veces en medios diferentes

### Fuente

- `FU-02 / ENT-01`

### Evidencia

Las cocineras registran las cantidades producidas en hojas de producción y posteriormente el encargado introduce esa información al sistema.

### Interpretación

Existe un flujo de doble captura:

```text
Producción real
    ↓
Hoja manual
    ↓
Transcripción
    ↓
Sistema
```

Este proceso introduce un punto de descoordinación entre lo producido y lo registrado digitalmente.

### Nivel de confianza

**Alto**

### Impacto

**Alto**

---

## H-004 — Existen diferencias frecuentes de inventario

### Fuente

- `FU-01`
- `FU-02 / ENT-01`

### Evidencia

La Product Owner indicó que existen:

- faltantes frecuentes;
- sobrantes;
- diferencias entre las hojas de producción y el sistema.

También relacionó estas diferencias con cantidades que pueden ser introducidas posteriormente en valores mayores o menores a los reales.

### Interpretación

La confiabilidad del inventario se ve afectada por inconsistencias entre información manual y digital.

### Nivel de confianza

**Alto**

### Impacto

**Alto**

---

## H-005 — El sistema actual no alerta cuando el stock está llegando a un nivel bajo

### Fuente

- `FU-01`
- `FU-02 / ENT-01`

### Evidencia

No existe una notificación automática para productos con existencias bajas.

El encargado y la contadora realizan una revisión aproximadamente semanal y utilizan reportes para conocer lo disponible.

### Interpretación

La identificación de existencias bajas depende de revisiones periódicas en lugar de un aviso oportuno generado por el sistema.

### Nivel de confianza

**Alto**

### Impacto

**Alto**

La Product Owner incluyó las notificaciones de existencias bajas entre las mejoras prioritarias.

---

## H-006 — Los faltantes pueden afectar la disponibilidad inmediata de ingredientes

### Fuente

- `FU-02 / ENT-01`

### Evidencia

Cuando falta un ingrediente necesario, se prepara un listado, se solicita al proveedor correspondiente y se espera el abastecimiento.

### Interpretación

Un faltante puede crear dependencia del tiempo de respuesta del proveedor para recuperar la disponibilidad del ingrediente.

No existe evidencia suficiente para cuantificar cuánto tiempo o cuántas ventas se pierden.

### Nivel de confianza

**Alto**

### Impacto

**Medio/Alto**

---

## H-007 — Las compras no se encuentran centralizadas en el sistema

### Fuente

- `FU-01`
- `FU-02 / ENT-01`

### Evidencia

Las compras se manejan utilizando:

- listas;
- recibos;
- grupos de WhatsApp;
- fotografías de comprobantes;
- QR;
- registros externos.

La recepción de compras no se registra actualmente en el sistema.

### Interpretación

La información de compra se distribuye entre varios medios y no existe una fuente digital central que represente de manera completa el proceso.

### Nivel de confianza

**Alto**

### Impacto

**Alto**

---

## H-008 — Las responsabilidades de compra dependen del tipo de producto

### Fuente

- `FU-02 / ENT-01`

### Evidencia

La entrevista identificó responsabilidades diferenciadas:

- encargadas de cocina para compras relacionadas con cocina;
- encargado para bebidas, limpieza y otros productos vinculados a atención.

### Interpretación

El futuro proceso de compras deberá respetar responsabilidades y permisos diferenciados en lugar de asumir un único comprador universal.

Las reglas exactas de autorización todavía necesitan precisión.

### Nivel de confianza

**Alto** para la separación general de responsabilidades.

### Impacto

**Medio**

---

## H-009 — La información de pagos y cuentas con proveedores está distribuida

### Fuente

- `FU-01`
- `FU-02 / ENT-01`

### Evidencia

Para determinados proveedores se manejan mediante WhatsApp:

- recibos;
- fotografías;
- total a cancelar;
- QR del proveedor.

El documento previo también indica que no existe un control completo de cuentas pendientes con proveedores.

### Interpretación

El seguimiento de obligaciones con proveedores no está completamente centralizado ni integrado con el resto de la operación.

### Nivel de confianza

**Alto**

### Impacto

**Medio/Alto**

---

## H-010 — Los gastos diarios y la caja chica se registran manualmente

### Fuente

- `FU-01`
- `FU-02 / ENT-01`

### Evidencia

Determinados gastos y deliveries se anotan en un cuaderno.

Posteriormente el encargado traslada estas anotaciones a otro registro administrativo.

Los ingresos por ventas sí se encuentran en el sistema, mientras que estos gastos diarios quedan fuera.

### Interpretación

Existe nuevamente un proceso de captura manual y posterior transferencia de información.

### Nivel de confianza

**Alto**

### Impacto

**Alto**

---

## H-011 — El acceso a determinados reportes depende de otro usuario

### Fuente

- `FU-02 / ENT-01`

### Evidencia

Durante la entrevista se expresó que un usuario responsable debe solicitar a otro usuario que genere determinados reportes.

### Interpretación

El problema no es únicamente la existencia del reporte, sino la falta de acceso directo para el usuario que necesita consultarlo.

Esto sugiere una necesidad relacionada con permisos y disponibilidad de información.

### Nivel de confianza

**Alto**

### Impacto

**Medio**

---

## H-012 — El sistema actual ya cubre funciones importantes que el negocio desea conservar

### Fuente

- `FU-01`
- `FU-02 / ENT-01`

### Evidencia

El sistema actual cubre, entre otras capacidades:

- ventas;
- pedidos y comandas;
- inventario;
- clientes;
- cuentas por cobrar;
- cierres de caja;
- reportes;
- descuento automático de ingredientes al vender platos;
- identificación de operaciones mediante usuarios.

La Product Owner indicó que no existe un problema general con todas estas funciones y que desea conservar sus capacidades.

### Interpretación

El nuevo producto no puede concentrarse únicamente en las nuevas mejoras.

Al reemplazar el sistema actual deberá preservar, dentro del alcance acordado, las capacidades operativas que actualmente permiten trabajar al restaurante.

### Nivel de confianza

**Alto**

### Impacto

**Alto**

---

## H-013 — La decisión del negocio es reemplazar el sistema actual

### Fuente

- `FU-02 / ENT-01`

### Evidencia

La Product Owner manifestó explícitamente la intención de reemplazar el sistema actual y renovarlo.

### Interpretación

El proyecto se orienta hacia un sistema independiente que sustituya al existente, no simplemente hacia un módulo complementario.

### Nivel de confianza

**Alto**

### Impacto

**Alto**

---

## H-014 — No existe una vía conocida de integración con el sistema actual

### Fuente

- `FU-02 / ENT-01`

### Evidencia

No se dispone de:

- acceso técnico interno;
- mecanismo conocido de exportación;
- API conocida;
- información sobre arquitectura o base de datos.

### Interpretación

El nuevo sistema no debe diseñarse asumiendo una integración técnica con la plataforma existente.

Si posteriormente se requiere migración de datos, deberá investigarse como problema separado.

### Nivel de confianza

**Alto**

### Impacto

**Medio/Alto**

---

## H-015 — La operación utiliza diferentes usuarios y responsabilidades

### Fuente

- `FU-01`
- `FU-02 / ENT-01`

### Evidencia

Se identifican responsabilidades distintas entre:

- meseros;
- cocineros/encargadas de cocina;
- encargado;
- contadora;
- responsables administrativos;
- Product Owner;
- potencial usuario propietario/administrador.

El sistema actual ya utiliza usuarios individuales para determinadas operaciones.

### Interpretación

El futuro sistema necesitará diferenciar acceso, responsabilidades y operaciones según el rol.

La lista final de roles y permisos todavía no está consolidada.

### Nivel de confianza

**Medio/Alto**

### Impacto

**Alto**

---

# 6. Resumen de hallazgos

| ID      | Hallazgo                                                     |  Confianza |    Impacto |
| ------- | ------------------------------------------------------------ | ---------: | ---------: |
| `H-001` | Asistencia y horarios registrados manualmente                |       Alto |       Alto |
| `H-002` | Pagos dependen de datos trasladados desde planillas          |       Alto |       Alto |
| `H-003` | Producción registrada primero en hojas y luego en sistema    |       Alto |       Alto |
| `H-004` | Existen diferencias frecuentes de inventario                 |       Alto |       Alto |
| `H-005` | No existen alertas automáticas de stock bajo                 |       Alto |       Alto |
| `H-006` | Los faltantes generan dependencia del reabastecimiento       |       Alto | Medio/Alto |
| `H-007` | Compras fuera de un flujo centralizado                       |       Alto |       Alto |
| `H-008` | Responsabilidades de compra diferenciadas por categoría      |       Alto |      Medio |
| `H-009` | Pagos/cuentas de proveedores distribuidos en varios medios   |       Alto | Medio/Alto |
| `H-010` | Gastos diarios y caja chica manuales                         |       Alto |       Alto |
| `H-011` | Determinados reportes requieren intermediario                |       Alto |      Medio |
| `H-012` | El sistema actual posee capacidades que deben preservarse    |       Alto |       Alto |
| `H-013` | El negocio desea reemplazar el sistema actual                |       Alto |       Alto |
| `H-014` | No existe integración técnica conocida con el sistema actual |       Alto | Medio/Alto |
| `H-015` | Existen usuarios y responsabilidades diferenciadas           | Medio/Alto |       Alto |

---

# 7. Necesidades consolidadas

## N-001 — Registrar entradas y salidas de forma confiable

### Descripción

El restaurante necesita disponer de un registro confiable y centralizado de las entradas y salidas del personal, reduciendo la dependencia de planillas físicas.

### Stakeholders

- trabajadores;
- contadora;
- encargado;
- administración.

### Fuente

- `H-001`
- `H-002`

### Clasificación

- necesidad de usuario;
- necesidad de negocio;
- necesidad de información.

### Importancia

**Alta**

### Frecuencia

**Recurrente**, asociada a la jornada laboral.

### Impacto

**Alto**

### Prioridad inicial

**ALTA**

### Estado de validación

**Validada**

### Observación

La Product Owner mencionó un **biométrico** como mecanismo deseado.

El biométrico se conserva como **propuesta de solución**, no como definición obligatoria de la necesidad en esta etapa.

---

## N-002 — Utilizar datos de asistencia confiables para el cálculo de pagos

### Descripción

La contadora necesita disponer de la información de horas trabajadas de manera consistente para calcular los pagos sin depender de transcribir datos desde planillas físicas.

### Stakeholders

- contadora;
- trabajadores;
- encargado.

### Fuente

- `H-001`
- `H-002`

### Clasificación

- necesidad de usuario;
- necesidad de negocio;
- necesidad de información.

### Importancia

**Alta**

### Frecuencia

Recurrente en cada periodo de cálculo de pago.

### Impacto

**Alto**

### Prioridad inicial

**ALTA**

### Estado de validación

**Validada en términos generales**

### Pendiente

Las reglas exactas sobre:

- atrasos;
- faltas;
- horas extra;
- turnos especiales;
- valor de horas;

deberán precisarse antes de convertir esta necesidad en requisitos detallados.

---

## N-003 — Registrar la producción sin doble captura manual

### Descripción

El personal involucrado necesita registrar las cantidades producidas de manera que exista una fuente única y consistente, evitando la secuencia hoja manual → transcripción posterior.

### Stakeholders

- cocina;
- encargado;
- administración.

### Fuente

- `H-003`
- `H-004`

### Clasificación

- necesidad de usuario;
- necesidad de negocio;
- necesidad de información.

### Importancia

**Alta**

### Frecuencia

Recurrente durante jornadas de producción y producciones extraordinarias.

### Impacto

**Alto**

### Prioridad inicial

**ALTA**

### Estado de validación

**Validada**

---

## N-004 — Mantener un inventario consistente con la operación real

### Descripción

Fratelli necesita que las existencias registradas representen de manera confiable los productos e ingredientes realmente disponibles.

### Stakeholders

- encargado;
- cocina;
- contadora;
- administración.

### Fuente

- `H-003`
- `H-004`
- `H-006`

### Clasificación

- necesidad de negocio;
- necesidad de información.

### Importancia

**Alta**

### Frecuencia

Continua.

### Impacto

**Alto**

### Prioridad inicial

**ALTA**

### Estado de validación

**Validada**

---

## N-005 — Detectar oportunamente existencias bajas

### Descripción

Los responsables de inventario necesitan conocer oportunamente cuándo un producto o ingrediente está alcanzando un nivel que requiere atención, reposición o producción.

### Stakeholders

- encargado;
- cocina;
- contadora;
- administración.

### Fuente

- `H-005`
- `H-006`

### Clasificación

- necesidad de usuario;
- necesidad de negocio;
- necesidad de información.

### Importancia

**Alta**

### Frecuencia

Continua según movimientos de inventario.

### Impacto

**Alto**

### Prioridad inicial

**ALTA**

### Estado de validación

**Validada**

### Pendiente

Todavía deben definirse:

- criterio de stock mínimo;
- quién puede configurarlo;
- unidades;
- comportamiento esperado de las alertas.

---

## N-006 — Centralizar el registro de compras

### Descripción

Fratelli necesita registrar de forma centralizada las compras realizadas, su recepción y la información necesaria para consultar posteriormente qué se compró y bajo qué condiciones.

### Stakeholders

- encargadas de cocina;
- encargado;
- administración;
- responsables de pago.

### Fuente

- `H-007`
- `H-008`
- `H-009`

### Clasificación

- necesidad de negocio;
- necesidad de información;
- regla operativa.

### Importancia

**Alta**

### Frecuencia

Recurrente.

### Impacto

**Alto**

### Prioridad inicial

**ALTA**

### Estado de validación

**Validada en términos generales**

### Pendiente

Se deben precisar posteriormente:

- campos obligatorios;
- recepción parcial;
- rechazo;
- crédito;
- vencimientos;
- pagos parciales;
- reglas de autorización.

---

## N-007 — Mantener trazabilidad de responsables dentro del proceso de compras

### Descripción

El restaurante necesita que las operaciones de compra respeten y registren quién solicita, autoriza, recibe o gestiona cada tipo de compra.

### Stakeholders

- encargadas de cocina;
- encargado;
- administración.

### Fuente

- `H-008`

### Clasificación

- regla operativa;
- necesidad de negocio;
- necesidad de auditabilidad.

### Importancia

**Media/Alta**

### Frecuencia

Recurrente.

### Impacto

**Medio**

### Prioridad inicial

**MEDIA**

### Estado de validación

**Validada en su principio general; reglas exactas pendientes**

---

## N-008 — Controlar cuentas y pagos relacionados con proveedores

### Descripción

Los responsables necesitan consultar de manera centralizada la información necesaria para conocer obligaciones, comprobantes y estado de pagos relacionados con proveedores.

### Stakeholders

- encargado;
- administración;
- responsables de pago.

### Fuente

- `H-007`
- `H-009`

### Clasificación

- necesidad de negocio;
- necesidad de información.

### Importancia

**Alta**

### Frecuencia

Recurrente.

### Impacto

**Medio/Alto**

### Prioridad inicial

**MEDIA/ALTA**

### Estado de validación

**Validada en términos generales**

### Pendiente

Faltan reglas exactas sobre:

- fechas de pago;
- compras a crédito;
- vencimientos;
- pagos parciales;
- estados posibles de una obligación.

---

## N-009 — Centralizar gastos diarios y movimientos de caja chica

### Descripción

Fratelli necesita registrar los gastos diarios y movimientos equivalentes a caja chica dentro de una fuente central, evitando depender de anotaciones en cuadernos y traspasos posteriores.

### Stakeholders

- encargado;
- administración;
- responsables de caja.

### Fuente

- `H-010`

### Clasificación

- necesidad de negocio;
- necesidad de información.

### Importancia

**Alta**

### Frecuencia

Recurrente.

### Impacto

**Alto**

### Prioridad inicial

**ALTA**

### Estado de validación

**Validada**

---

## N-010 — Permitir acceso directo a reportes según autorización

### Descripción

Los usuarios responsables necesitan obtener directamente los reportes que correspondan a sus funciones, sin depender de otro usuario cuando poseen autorización para consultarlos.

### Stakeholders

- administración;
- propietario/responsable;
- encargado;
- otros roles autorizados.

### Fuente

- `H-011`
- `H-015`

### Clasificación

- necesidad de usuario;
- necesidad de información;
- necesidad de autorización.

### Importancia

**Media/Alta**

### Frecuencia

Según necesidad administrativa.

### Impacto

**Medio**

### Prioridad inicial

**MEDIA**

### Estado de validación

**Validada en términos generales**

### Pendiente

Se debe definir:

- catálogo de reportes;
- roles autorizados;
- filtros;
- datos visibles;
- posibilidad de exportación.

---

## N-011 — Preservar las capacidades operativas útiles del sistema existente

### Descripción

Al sustituir la plataforma actual, Fratelli necesita conservar la cobertura funcional de los procesos que hoy permiten operar correctamente y que formen parte del alcance aprobado.

### Stakeholders

- meseros;
- cocina;
- encargado;
- contadora;
- administración;
- clientes como beneficiarios indirectos.

### Fuente

- `H-012`
- `H-013`

### Clasificación

- necesidad de negocio;
- restricción de continuidad operativa.

### Importancia

**Crítica**

### Frecuencia

Continua.

### Impacto

**Alto**

### Prioridad inicial

**CRÍTICA**

### Estado de validación

**Validada**

### Capacidades baseline conocidas

Como mínimo deberán ser evaluadas durante alcance y requisitos:

- usuarios;
- atención y ventas;
- pedidos;
- comandas;
- productos;
- inventario;
- clientes;
- cuentas por cobrar;
- cierres de caja;
- reportes;
- descuento de ingredientes asociado a venta de platos;
- movimientos de almacén.

> Que una capacidad exista en esta lista **no significa automáticamente que formará parte del MVP de 15 días**. Significa que no debe perderse de vista al definir el producto que sustituirá al sistema actual.

---

## N-012 — Construir el nuevo sistema sin depender técnicamente del sistema anterior

### Descripción

El proyecto necesita diseñar el nuevo producto como un sistema independiente, debido a que no existe acceso técnico ni mecanismo conocido de integración con la plataforma actual.

### Stakeholders

- equipo de desarrollo;
- administración de Fratelli.

### Fuente

- `H-013`
- `H-014`

### Clasificación

- necesidad técnica;
- restricción.

### Importancia

**Alta**

### Impacto

**Alto**

### Prioridad inicial

**ALTA**

### Estado de validación

**Confirmada como restricción actual**

### Observación

La migración de información histórica no queda resuelta por esta necesidad y deberá tratarse separadamente si entra en alcance.

---

## N-013 — Diferenciar acceso y responsabilidades por usuario

### Descripción

El sistema necesita permitir que cada usuario acceda y opere de acuerdo con sus responsabilidades, evitando depender de credenciales o permisos que no correspondan a su función.

### Stakeholders

- meseros;
- cocina;
- encargado;
- contadora;
- administración;
- propietario/responsable.

### Fuente

- `H-008`
- `H-011`
- `H-015`

### Clasificación

- necesidad de usuario;
- necesidad de negocio;
- necesidad de seguridad/autorización.

### Importancia

**Alta**

### Frecuencia

Continua.

### Impacto

**Alto**

### Prioridad inicial

**ALTA**

### Estado de validación

**Validada en su principio general**

### Pendiente

El catálogo definitivo de roles y permisos deberá establecerse durante SRS y refinamiento.

---

## N-014 — Mantener trazabilidad de operaciones relevantes por usuario

### Descripción

Fratelli necesita conservar la capacidad de identificar quién realizó determinadas operaciones importantes del sistema.

### Stakeholders

- administración;
- encargado;
- usuarios operativos.

### Fuente

- `H-012`
- `H-015`

### Clasificación

- necesidad de negocio;
- necesidad de información;
- auditabilidad.

### Importancia

**Media/Alta**

### Impacto

**Medio/Alto**

### Prioridad inicial

**MEDIA**

### Estado de validación

**Validada como capacidad actual que aporta control**

---

# 8. Resumen de necesidades

| ID      | Necesidad                                        | Clasificación principal | Prioridad inicial | Estado                      |
| ------- | ------------------------------------------------ | ----------------------- | ----------------: | --------------------------- |
| `N-001` | Registrar entradas y salidas de forma confiable  | Usuario / negocio       |              ALTA | Validada                    |
| `N-002` | Usar datos confiables de asistencia para pagos   | Usuario / información   |              ALTA | Validada; reglas pendientes |
| `N-003` | Registrar producción sin doble captura           | Usuario / negocio       |              ALTA | Validada                    |
| `N-004` | Mantener inventario consistente                  | Negocio / información   |              ALTA | Validada                    |
| `N-005` | Detectar existencias bajas oportunamente         | Usuario / información   |              ALTA | Validada; reglas pendientes |
| `N-006` | Centralizar compras                              | Negocio / información   |              ALTA | Validada; detalle pendiente |
| `N-007` | Trazar responsables de compras                   | Regla operativa         |             MEDIA | Principio validado          |
| `N-008` | Controlar cuentas y pagos a proveedores          | Negocio / información   |        MEDIA/ALTA | Detalle pendiente           |
| `N-009` | Centralizar gastos diarios/caja chica            | Negocio / información   |              ALTA | Validada                    |
| `N-010` | Acceder directamente a reportes autorizados      | Usuario / información   |             MEDIA | Validada; detalle pendiente |
| `N-011` | Preservar capacidades útiles actuales            | Continuidad operativa   |           CRÍTICA | Validada                    |
| `N-012` | No depender técnicamente del sistema anterior    | Técnica / restricción   |              ALTA | Confirmada                  |
| `N-013` | Diferenciar acceso y responsabilidades           | Seguridad / negocio     |              ALTA | Principio validado          |
| `N-014` | Mantener trazabilidad de operaciones por usuario | Auditabilidad           |             MEDIA | Validada                    |

---

# 9. Trazabilidad hallazgo → necesidad

| Hallazgo | Necesidades relacionadas  |
| -------- | ------------------------- |
| `H-001`  | `N-001`, `N-002`          |
| `H-002`  | `N-001`, `N-002`          |
| `H-003`  | `N-003`, `N-004`          |
| `H-004`  | `N-003`, `N-004`          |
| `H-005`  | `N-005`                   |
| `H-006`  | `N-004`, `N-005`          |
| `H-007`  | `N-006`, `N-008`          |
| `H-008`  | `N-006`, `N-007`, `N-013` |
| `H-009`  | `N-006`, `N-008`          |
| `H-010`  | `N-009`                   |
| `H-011`  | `N-010`, `N-013`          |
| `H-012`  | `N-011`, `N-014`          |
| `H-013`  | `N-011`, `N-012`          |
| `H-014`  | `N-012`                   |
| `H-015`  | `N-010`, `N-013`, `N-014` |

---

# 10. Priorización preliminar

## 10.1. Prioridad crítica

### N-011 — Preservar capacidades operativas útiles

La decisión de reemplazar el sistema actual obliga a evitar que la nueva solución elimine funciones esenciales que hoy permiten operar a Fratelli.

Esta prioridad es **crítica para el producto completo**, aunque determinadas capacidades puedan quedar fuera del MVP inicial debido al tiempo disponible.

---

## 10.2. Prioridades altas expresadas o sustentadas directamente

```text
N-001  Control confiable de entradas y salidas
N-002  Información confiable para cálculo de pagos
N-003  Registro directo de producción
N-004  Consistencia de inventario
N-005  Detección de stock bajo
N-006  Centralización de compras
N-009  Centralización de gastos diarios
N-012  Independencia respecto al sistema anterior
N-013  Roles y permisos
```

La Product Owner destacó especialmente:

```text
1. Horarios / entradas / salidas
2. Inventario
3. Alertas de existencias bajas
4. Reducción del manejo manual de compras y gastos
```

---

## 10.3. Necesidades de prioridad media o dependientes de mayor detalle

```text
N-007  Responsabilidades dentro de compras
N-008  Cuentas y pagos a proveedores
N-010  Acceso directo a reportes
N-014  Trazabilidad de operaciones
```

Estas necesidades siguen siendo relevantes, pero su posición definitiva dependerá del alcance y del tiempo disponible.

---

# 11. Propuestas de solución registradas, pero todavía no convertidas en requisito

## PS-001 — Biométrico para asistencia

### Origen

Product Owner durante `ENT-01`.

### Propuesta

Utilizar un mecanismo biométrico para registrar entradas y salidas del personal.

### Necesidad relacionada

- `N-001`
- `N-002`

### Estado

**Propuesta de solución pendiente de evaluación técnica y de alcance.**

### Razón para no convertirla todavía en requisito

La necesidad real es registrar asistencia de manera confiable.

La implementación mediante:

- lector de huella;
- otro dispositivo biométrico;
- código;
- credencial;
- mecanismo alternativo;

es una decisión posterior.

El proyecto podrá diseñar una interfaz o módulo de integración para biométricos y dejar la implementación específica del hardware separada cuando corresponda.

---

## PS-002 — Alertas automáticas de stock bajo

### Origen

- documento descriptivo;
- Product Owner durante `ENT-01`.

### Necesidad relacionada

`N-005`

### Estado

**Solución directamente alineada con una necesidad validada**, pendiente de formalización como requisito.

A diferencia del biométrico, en este caso la propia necesidad implica algún mecanismo de aviso oportuno; todavía queda por decidir:

- canal;
- destinatarios;
- umbral;
- persistencia;
- frecuencia;
- comportamiento visual.

---

# 12. Necesidades todavía no consolidadas por falta de información

Las siguientes áreas existen en el dominio, pero el relevamiento no permite aún convertirlas en necesidades detalladas adicionales sin hacer suposiciones.

## 12.1. Crédito a clientes

Se conoce que el sistema actual maneja ventas a crédito y cuentas por cobrar, pero no se conocen:

- reglas de autorización;
- límites;
- vencimientos;
- mora;
- pagos parciales;
- estados.

Se conserva dentro del baseline funcional de `N-011`.

## 12.2. Promociones y descuentos

Se conocen como capacidades existentes, pero no se obtuvieron reglas suficientes.

Se conservan dentro del baseline funcional hasta su refinamiento.

## 12.3. Mermas y desperdicios

La Product Owner indicó que existe algún mecanismo de control, pero no pudo precisar su funcionamiento.

No se crea una nueva necesidad específica hasta aclararlo.

## 12.4. Reportes específicos

Se confirmó la necesidad de acceso directo a reportes, pero no el catálogo definitivo de reportes requeridos.

## 12.5. Migración de datos

La decisión de reemplazar el sistema crea una posible necesidad de migración, pero actualmente no se conoce:

- qué datos pueden extraerse;
- si existe exportación;
- si será necesario conservar historial;
- qué formato puede obtenerse.

Por tanto, la migración permanece **pendiente de alcance**, no como requisito confirmado.

## 12.6. Impresoras y otros periféricos

La posible integración con impresoras de recibos u otros dispositivos forma parte de la exploración técnica futura.

No surge todavía como una necesidad suficientemente detallada del relevamiento actual.

---

# 13. Restricciones derivadas de los hallazgos

## RST-01 — Tiempo disponible

El proyecto dispone aproximadamente de **15 días**, por lo que no todas las necesidades del producto completo podrán necesariamente implementarse en el primer incremento.

## RST-02 — Sustitución del sistema actual

La solución final pretende reemplazar el sistema actual.

## RST-03 — Sin dependencia de integración existente

No se dispone de una interfaz conocida para integrar el nuevo sistema con la plataforma anterior.

## RST-04 — Preservación funcional

Las capacidades actuales consideradas útiles no deben desaparecer accidentalmente durante la sustitución.

## RST-05 — Relevamiento adicional limitado

Las aclaraciones futuras solo podrán obtenerse mediante preguntas puntuales canalizadas por la Product Owner.

## RST-06 — Evidencia principalmente cualitativa

No existen métricas suficientes para asignar valores numéricos reales a frecuencia de errores, pérdidas, costos o tiempos.

---

# 14. Contradicciones y puntos de control

## 14.1. Reemplazar el sistema vs. conservar todo

Durante la entrevista aparecen dos afirmaciones compatibles pero que deben mantenerse diferenciadas:

1. la Product Owner considera útiles las capacidades generales actuales y desea conservarlas;
2. la Product Owner desea reemplazar la plataforma existente.

### Resolución documental

```text
No conservar la plataforma técnica
                +
Sí conservar las capacidades útiles
                ↓
Construir un sistema independiente con continuidad funcional
```

No existe contradicción si se diferencia **sistema técnico** de **capacidad de negocio**.

---

## 14.2. Biométrico

La Product Owner lo propone como solución deseada.

### Control

No se documentará todavía:

```text
“El sistema deberá usar obligatoriamente un lector de huellas X”
```

hasta definir:

- alcance;
- hardware disponible;
- compatibilidad;
- arquitectura;
- seguridad;
- tratamiento de datos biométricos.

La necesidad `N-001` permanece independiente de ese mecanismo.

---

## 14.3. Inventario

La entrevista asocia las diferencias principalmente con la doble captura de producción.

### Control

No se asumirá que esa es la **única causa** posible de diferencias de inventario.

El proyecto únicamente puede afirmar que es una causa identificada por la Product Owner.

---

# 15. Formulación consolidada del problema

A partir de los hallazgos, la formulación de trabajo queda consolidada como:

> **Fratelli presenta fragmentación y descoordinación en determinados procesos operativos y administrativos debido a la coexistencia del sistema actual con registros manuales y medios externos, lo que contribuye a diferencias frecuentes de inventario, faltantes y sobrantes, dificultades en el control de asistencia y cálculo de pagos, y una gestión distribuida de compras, proveedores y gastos diarios.**

Adicionalmente, el negocio ha decidido reemplazar el sistema actual, por lo que el proyecto debe resolver estas necesidades **sin perder las capacidades operativas que ya resultan útiles para el restaurante**.

---

# 16. Mapa del problema

## 16.1. Problema central

```text
Fragmentación y descoordinación de información
entre procesos digitales y manuales
```

## 16.2. Causas directas sustentadas

```text
├── Registro manual de asistencia
├── Producción anotada en hojas y transcrita después
├── Compras gestionadas fuera del sistema
├── Gastos diarios registrados en cuadernos
├── Información de proveedores distribuida en recibos/WhatsApp
├── Falta de alertas de stock bajo
└── Permisos insuficientes para determinados reportes
```

## 16.3. Efectos sustentados

```text
├── Diferencias de inventario
├── Faltantes frecuentes
├── Sobrantes
├── Trabajo adicional para calcular pagos
├── Dependencia de revisión periódica de stock
├── Información de compras dispersa
├── Gastos fuera del sistema
└── Dependencia de intermediarios para reportes
```

No se agregan efectos económicos o métricas que no hayan sido demostrados.

---

# 17. Validación de calidad de las necesidades

Antes de continuar se verificó que:

- cada necesidad se relaciona con al menos un hallazgo;
- no se creó una funcionalidad únicamente porque resulte técnicamente interesante;
- el biométrico se mantiene separado de la necesidad que pretende resolver;
- las capacidades existentes se registran como continuidad funcional, no como copia obligatoria del sistema anterior;
- las necesidades duplicadas fueron consolidadas;
- los puntos todavía ambiguos se mantienen pendientes;
- no se inventaron métricas;
- no se asumió integración con el sistema anterior;
- no se convirtió automáticamente cada comentario de la entrevista en un requisito.

---

# 18. Estado de salida

Con este documento ya existe una base suficiente para avanzar hacia:

```text
Problema validado
        ↓
Hallazgos consolidados
        ↓
Necesidades consolidadas
        ↓
Objetivos del proyecto
```

El siguiente documento será:

```text
docs/04-objetivos-y-propuesta-valor.md
```

Allí se definirán:

- objetivo general;
- objetivos específicos;
- indicadores de éxito que puedan justificarse;
- visión del producto;
- propuesta de valor;
- definición de qué es y qué no es la solución.

Después se avanzará hacia:

```text
05-alcance-y-mvp.md
```

donde se decidirá qué subconjunto de estas necesidades puede formar parte de la primera versión dentro del tiempo disponible.

---

# 19. Control de cambios

| Versión | Fecha      | Descripción                                                                             | Estado                                    |
| ------- | ---------- | --------------------------------------------------------------------------------------- | ----------------------------------------- |
| `0.1`   | 20/08/2026 | Consolidación inicial de hallazgos y necesidades a partir del documento previo y ENT-01 | Listo para objetivos y propuesta de valor |
