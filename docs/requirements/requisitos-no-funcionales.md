# Requisitos No Funcionales — Restaurant System

## 1. Propósito

Este documento contiene la especificación detallada de los **requisitos no funcionales (RNF)** de **Restaurant System** para el restaurante **Fratelli**.

Los RNF describen condiciones de calidad, seguridad, integridad, compatibilidad, usabilidad y operación que deberán cumplirse durante el desarrollo y validación del MVP.

La baseline documental es:

```text
03-hallazgos-y-necesidades.md
        ↓
04-objetivos-y-propuesta-valor.md
        ↓
05-alcance-y-mvp.md
        ↓
06-srs.md
        ↓
requirements/requisitos-no-funcionales.md
```

Este documento no reemplaza los requisitos funcionales.

Los requisitos funcionales describen **qué debe hacer el sistema**.

Los requisitos no funcionales describen **cómo debe comportarse y bajo qué condiciones de calidad debe operar**.

---

## 2. Estado documental

| Campo | Valor |
|---|---|
| **Documento** | `requirements/requisitos-no-funcionales.md` |
| **Proyecto** | Restaurant System |
| **Organización objetivo** | Restaurante Fratelli |
| **Versión actual** | `0.2` |
| **Estado** | Baseline RNF revalidada |
| **Fecha** | 21 de agosto de 2026 |
| **Product Owner** | Ana Paola Viscarra Chambi |
| **Scrum Master** | Alex Saúl Fernandez Valdez |
| **SRS relacionado** | `docs/06-srs.md` |
| **Alcance** | MVP operacional de reemplazo |

---

# 3. Convenciones

## 3.1. Formato de identificación

Los RNF utilizan:

```text
RNF-[CATEGORÍA]-XXX
```

Categorías utilizadas:

| Código | Categoría |
|---|---|
| `SEG` | Seguridad |
| `PRI` | Privacidad |
| `INT` | Integridad de datos |
| `CON` | Confiabilidad |
| `REC` | Recuperabilidad y manejo de errores |
| `REN` | Rendimiento |
| `DIS` | Disponibilidad |
| `USA` | Usabilidad |
| `ACC` | Accesibilidad |
| `COM` | Compatibilidad |
| `MAN` | Mantenibilidad |
| `POR` | Portabilidad |
| `AUD` | Auditabilidad |
| `OBS` | Observabilidad |
| `ESC` | Escalabilidad |
| `HW` | Integración con hardware |

---

## 3.2. Prioridad

| Prioridad | Significado |
|---|---|
| **CRÍTICA** | Condición indispensable para evitar fallos graves, acceso no autorizado o corrupción de información |
| **ALTA** | Condición necesaria para considerar el MVP suficientemente utilizable y confiable |
| **MEDIA** | Condición importante de calidad o evolución que puede perfeccionarse posteriormente |

---

## 3.3. Estado

| Estado | Significado |
|---|---|
| **Definido** | La condición puede verificarse con la información actual |
| **Propuesto** | Criterio técnico incorporado como baseline del MVP y sujeto a validación durante pruebas |
| **Pendiente de métrica** | La condición está definida, pero no se fija un valor numérico sin evidencia suficiente |
| **Fuera del MVP** | No será exigido en esta primera entrega |

---

# 4. Seguridad

## RNF-SEG-001 — Autenticación obligatoria para funciones protegidas

| Campo | Valor |
|---|---|
| **Categoría** | Seguridad |
| **Fuente** | `N-013`, SRS §20 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Requisito

Las funciones protegidas del sistema deberán requerir una identidad autenticada.

### Condición observable

Un usuario no autenticado no podrá ejecutar directamente operaciones protegidas aunque conozca una ruta o intente invocar una operación del backend.

### Método de verificación

- prueba funcional sin sesión;
- prueba directa contra endpoints protegidos;
- revisión de controles de autorización.

---

## RNF-SEG-002 — Autorización aplicada en backend

| Campo | Valor |
|---|---|
| **Categoría** | Seguridad |
| **Fuente** | `N-010`, `N-013`, matriz de permisos |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Requisito

La autorización por roles deberá validarse en el backend o capa de negocio.

Ocultar botones o secciones en la interfaz no será suficiente para proteger una operación.

### Condición observable

Una operación no autorizada deberá ser rechazada incluso si el usuario intenta ejecutarla directamente sin utilizar la interfaz visible.

### Método de verificación

- pruebas de autorización por rol;
- invocación directa de operaciones;
- pruebas con usuarios de múltiples roles.

---

## RNF-SEG-003 — Soporte de múltiples roles por usuario

| Campo | Valor |
|---|---|
| **Categoría** | Seguridad / autorización |
| **Fuente** | Decisión aprobada de matriz de permisos |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

El sistema deberá permitir que una cuenta tenga uno o más roles simultáneamente.

### Condición observable

Un usuario `MESERO + ENCARGADO` deberá disponer de las capacidades autorizadas para ambos roles.

### Método de verificación

- asignación de múltiples roles;
- pruebas de acceso con combinaciones de roles;
- prueba específica de cierre de caja con un usuario que posea ambos roles.

---

## RNF-SEG-004 — Contraseñas no almacenadas en texto plano

| Campo | Valor |
|---|---|
| **Categoría** | Seguridad |
| **Fuente** | Criterio técnico de seguridad |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Requisito

Las contraseñas no deberán almacenarse ni registrarse en texto plano.

Se utilizará un mecanismo seguro de hash de contraseñas proporcionado por la tecnología de autenticación seleccionada.

### Condición observable

No deberá ser posible recuperar una contraseña original examinando la base de datos o registros del sistema.

### Método de verificación

- revisión de almacenamiento;
- revisión de configuración de autenticación;
- inspección de logs.

### Pendiente

La política exacta de longitud y complejidad de contraseña se definirá durante arquitectura/seguridad.

---

## RNF-SEG-005 — Protección del transporte en producción

| Campo | Valor |
|---|---|
| **Categoría** | Seguridad |
| **Fuente** | Criterio técnico de seguridad |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Las comunicaciones entre cliente y servidor en un entorno de producción deberán utilizar HTTPS.

### Condición observable

Las credenciales y datos de operación no deberán transmitirse mediante HTTP sin protección en producción.

### Método de verificación

- inspección de configuración del despliegue;
- prueba de acceso;
- revisión del esquema de URL utilizado.

---

## RNF-SEG-006 — Expiración e invalidación de sesión

| Campo | Valor |
|---|---|
| **Categoría** | Seguridad |
| **Fuente** | SRS / criterio técnico de seguridad |
| **Prioridad** | **ALTA** |
| **Estado** | **Pendiente de métrica** |

### Requisito

Las sesiones o tokens de autenticación deberán poder expirar y deberán dejar de ser válidos al cerrar sesión cuando el mecanismo elegido lo permita.

### Condición observable

Una sesión expirada o cerrada no permite continuar ejecutando operaciones protegidas.

### Método de verificación

- pruebas de cierre de sesión;
- pruebas de sesión/token expirado;
- revisión de configuración.

### Pendiente

No se fija todavía un tiempo exacto de expiración.

---

## RNF-SEG-007 — No exposición de información sensible en errores

| Campo | Valor |
|---|---|
| **Categoría** | Seguridad |
| **Fuente** | Criterio técnico |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Los mensajes mostrados al usuario no deberán exponer:

- stack traces;
- consultas SQL;
- secretos;
- credenciales;
- tokens;
- claves internas;
- datos de infraestructura que no sean necesarios.

### Condición observable

Los errores de aplicación muestran mensajes controlados al usuario y los detalles técnicos permanecen únicamente en registros protegidos cuando correspondan.

### Método de verificación

- provocar errores controlados;
- revisar interfaz;
- revisar respuesta de API;
- revisar logs.

---

# 5. Privacidad

## RNF-PRI-001 — Minimización de datos personales

| Campo | Valor |
|---|---|
| **Categoría** | Privacidad |
| **Fuente** | Principio de minimización / alcance del MVP |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

El sistema deberá almacenar únicamente la información personal necesaria para los procesos incluidos en el MVP.

### Condición observable

No se solicitarán datos personales que no tengan una finalidad funcional documentada.

### Método de verificación

- revisión de formularios;
- revisión del modelo de datos;
- trazabilidad campo → requisito.

---

## RNF-PRI-002 — Sin almacenamiento biométrico en el MVP

| Campo | Valor |
|---|---|
| **Categoría** | Privacidad |
| **Fuente** | Alcance aprobado |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Requisito

El MVP no deberá almacenar:

- huellas digitales;
- plantillas biométricas;
- imágenes de huellas;
- datos biométricos derivados de un lector.

### Condición observable

El modelo de datos y las funcionalidades del MVP no contienen almacenamiento de biometría.

### Método de verificación

- revisión del esquema de datos;
- revisión del código;
- pruebas del módulo de asistencia.

---

# 6. Integridad de datos

## RNF-INT-001 — Atomicidad de operaciones compuestas

| Campo | Valor |
|---|---|
| **Categoría** | Integridad de datos |
| **Fuente** | SRS / dependencias del dominio |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Requisito

Las operaciones que modifican varias partes relacionadas de la información deberán ejecutarse de forma que no dejen datos parcialmente aplicados cuando ocurra un fallo.

Aplica especialmente a:

- confirmación de venta;
- recepción de compra;
- confirmación de producción;
- movimientos de inventario;
- registro de cierre.

### Condición observable

Si falla una operación antes de completar todos sus cambios obligatorios, no queda una combinación inconsistente de registros confirmados y no confirmados.

### Método de verificación

- pruebas de fallo controlado;
- pruebas transaccionales;
- revisión del estado de datos posterior al error.

---

## RNF-INT-002 — Consistencia entre operación y movimiento de inventario

| Campo | Valor |
|---|---|
| **Categoría** | Integridad de datos |
| **Fuente** | `N-004`, RF de inventario |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Requisito

Toda operación confirmada que altere inventario deberá generar o conservar el movimiento de inventario correspondiente.

### Condición observable

Una compra recibida, producción confirmada o venta confirmada puede trazarse hasta los movimientos que produjo.

### Método de verificación

- pruebas de compra;
- pruebas de producción;
- pruebas de venta;
- consulta del historial de movimientos.

---

## RNF-INT-003 — No duplicación de consumo de ingredientes

| Campo | Valor |
|---|---|
| **Categoría** | Integridad de datos |
| **Fuente** | Decisión de producción mediante existencias preparadas |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Requisito

Cuando los ingredientes ya hayan sido descontados al producir una existencia preparada, la venta del producto proveniente de esa existencia preparada no deberá descontar nuevamente esos mismos ingredientes.

### Condición observable

El consumo de ingredientes ocurre una sola vez para el flujo de producción definido.

### Método de verificación

- prueba producción → existencia preparada → venta;
- comparación de existencias antes y después;
- revisión de movimientos.

---

## RNF-INT-004 — Persistencia de saldos negativos

| Campo | Valor |
|---|---|
| **Categoría** | Integridad de datos |
| **Fuente** | Decisión aprobada de stock negativo |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Los saldos negativos permitidos por las reglas del MVP deberán almacenarse y mostrarse sin ser corregidos silenciosamente a cero.

### Condición observable

Una venta que deje `-1` unidades produce un saldo persistido y visible de `-1`.

### Método de verificación

- prueba de venta con stock insuficiente;
- consulta de inventario;
- revisión del movimiento generado.

---

## RNF-INT-005 — Conservación del histórico ante desactivación

| Campo | Valor |
|---|---|
| **Categoría** | Integridad de datos |
| **Fuente** | Requisitos de catálogo y trazabilidad |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Desactivar usuarios, productos, platos, ingredientes, clientes o proveedores no deberá eliminar las referencias históricas de operaciones ya registradas.

### Condición observable

Una venta histórica continúa mostrando su producto y responsable aunque dichos registros hayan sido desactivados.

### Método de verificación

- crear operación;
- desactivar entidad relacionada;
- volver a consultar la operación.

---

# 7. Confiabilidad

## RNF-CON-001 — Prevención de acciones duplicadas

| Campo | Valor |
|---|---|
| **Categoría** | Confiabilidad |
| **Fuente** | Criterio técnico del MVP |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Las acciones críticas no deberán ejecutarse dos veces por clics repetidos, reenvíos accidentales o reintentos inmediatos del usuario.

Aplica especialmente a:

- confirmar venta;
- confirmar producción;
- recibir compra;
- registrar entrada/salida;
- cerrar caja.

### Condición observable

Una única intención de usuario genera una sola operación confirmada.

### Método de verificación

- múltiples clics rápidos;
- reenvío de solicitudes;
- comprobación de registros persistidos.

---

## RNF-CON-002 — Protección ante concurrencia

| Campo | Valor |
|---|---|
| **Categoría** | Confiabilidad |
| **Fuente** | Naturaleza multiusuario del sistema |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Requisito

El backend deberá proteger la consistencia cuando dos o más usuarios operen simultáneamente sobre información relacionada.

### Condición observable

Operaciones concurrentes no generan:

- movimientos duplicados;
- cierres duplicados;
- pérdida silenciosa de cambios;
- saldos incoherentes por actualizaciones no controladas.

### Método de verificación

- pruebas concurrentes sobre inventario;
- pruebas de doble confirmación;
- pruebas sobre cierre de caja;
- revisión de consistencia final.

---

## RNF-CON-003 — Estados válidos

| Campo | Valor |
|---|---|
| **Categoría** | Confiabilidad |
| **Fuente** | Reglas de pedido, comanda y compra |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

El sistema no deberá permitir estados o transiciones fuera de los definidos por las reglas de negocio.

### Condición observable

Una transición inválida es rechazada independientemente de la interfaz utilizada.

### Método de verificación

- pruebas de transición;
- llamada directa a backend;
- verificación del estado persistido.

---

# 8. Recuperabilidad y manejo de errores

## RNF-REC-001 — Errores sin corrupción de operación

| Campo | Valor |
|---|---|
| **Categoría** | Recuperabilidad |
| **Fuente** | SRS §20 |
| **Prioridad** | **CRÍTICA** |
| **Estado** | **Definido** |

### Requisito

Un error durante una operación no deberá dejarla en un estado parcialmente confirmado.

### Condición observable

Después de un error, los datos permanecen en el último estado consistente conocido.

### Método de verificación

- interrupción controlada durante operaciones;
- revisión de la base de datos;
- nueva consulta del proceso.

---

## RNF-REC-002 — Mensajes de error accionables

| Campo | Valor |
|---|---|
| **Categoría** | Recuperabilidad / usabilidad |
| **Fuente** | Criterio técnico |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Cuando una operación no pueda completarse, el sistema deberá informar al usuario mediante un mensaje que indique que la acción falló o qué condición debe corregirse, sin exponer detalles internos sensibles.

### Condición observable

El usuario puede distinguir entre:

- operación exitosa;
- validación rechazada;
- falta de permiso;
- error técnico.

### Método de verificación

- pruebas de formularios inválidos;
- pruebas de permiso;
- simulación de error técnico.

---

## RNF-REC-003 — Backups fuera del MVP

| Campo | Valor |
|---|---|
| **Categoría** | Recuperabilidad |
| **Fuente** | Decisión explícita de alcance |
| **Prioridad** | **MEDIA** |
| **Estado** | **Fuera del MVP** |

### Requisito

El sistema automático de backups y restauración no será una condición de aceptación del MVP.

### Condición observable

La ausencia de un mecanismo automatizado de backup no impedirá declarar funcional el MVP.

### Método de verificación

- control de alcance;
- revisión del backlog.

### Observación

La necesidad de backups deberá reevaluarse antes de considerar el sistema apto para un uso productivo real prolongado.

---

# 9. Rendimiento

## RNF-REN-001 — Retroalimentación durante operaciones

| Campo | Valor |
|---|---|
| **Categoría** | Rendimiento percibido |
| **Fuente** | Criterio técnico |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Las operaciones que no finalicen de forma inmediata deberán mostrar un estado de procesamiento/carga para evitar que el usuario interprete que la acción no fue recibida.

### Condición observable

Durante una operación pendiente se muestra una señal visual apropiada y se evita repetir la misma acción accidentalmente.

### Método de verificación

- simulación de respuesta lenta;
- inspección de interfaz;
- pruebas de doble clic.

---

## RNF-REN-002 — Tiempo de respuesta

| Campo | Valor |
|---|---|
| **Categoría** | Rendimiento |
| **Fuente** | Checklist / ausencia de baseline cuantitativa |
| **Prioridad** | **ALTA** |
| **Estado** | **Pendiente de métrica** |

### Requisito

Las operaciones principales deberán responder de manera adecuada para el flujo operativo del restaurante.

### Condición observable

No se fija todavía un número universal de segundos.

Durante pruebas se medirán los principales flujos para identificar comportamientos claramente inaceptables o cuellos de botella.

### Método de verificación

- mediciones durante pruebas;
- perfilado cuando sea necesario;
- revisión con datos representativos del MVP.

### Control

No se afirmará sin evidencia que:

```text
“todas las operaciones responderán en menos de 2 segundos”
```

---

## RNF-REN-003 — Concurrencia de usuarios

| Campo | Valor |
|---|---|
| **Categoría** | Rendimiento / concurrencia |
| **Fuente** | Sistema multiusuario |
| **Prioridad** | **ALTA** |
| **Estado** | **Pendiente de métrica** |

### Requisito

El sistema deberá soportar operación simultánea de varios usuarios sin comprometer integridad.

### Condición observable

Se probará concurrencia de los roles necesarios para demostrar el flujo del MVP.

### Método de verificación

- pruebas con sesiones simultáneas;
- pruebas concurrentes de venta, cocina e inventario.

### Pendiente

No se define todavía un número máximo de usuarios simultáneos.

---

# 10. Disponibilidad

## RNF-DIS-001 — Disponibilidad sin SLA cuantitativo

| Campo | Valor |
|---|---|
| **Categoría** | Disponibilidad |
| **Fuente** | Ausencia de baseline/SLA acordado |
| **Prioridad** | **MEDIA** |
| **Estado** | **Pendiente de métrica** |

### Requisito

El sistema deberá permanecer disponible durante las demostraciones y periodos operativos definidos para el MVP, salvo interrupciones técnicas justificadas.

### Condición observable

No se establece todavía un SLA como `99.9 %`.

### Método de verificación

- pruebas de despliegue;
- registro de fallos durante validación;
- demostración del sistema.

---

# 11. Usabilidad

## RNF-USA-001 — Interfaz responsive

| Campo | Valor |
|---|---|
| **Categoría** | Usabilidad |
| **Fuente** | Alcance aprobado |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Todas las funciones incluidas en el MVP deberán ser utilizables mediante una interfaz web responsive.

### Condición observable

Los flujos principales pueden completarse desde:

- computadora;
- tablet;
- teléfono móvil.

### Método de verificación

- pruebas manuales en diferentes viewport;
- pruebas en dispositivos disponibles;
- revisión visual de los flujos principales.

---

## RNF-USA-002 — Ancho mínimo móvil de 360 px

| Campo | Valor |
|---|---|
| **Categoría** | Usabilidad / responsive |
| **Fuente** | Criterio técnico aprobado para el MVP |
| **Prioridad** | **ALTA** |
| **Estado** | **Propuesto** |

### Requisito

La interfaz deberá conservar usabilidad funcional a partir de un viewport de **360 px de ancho**.

### Condición observable

A `360 px`:

- los controles necesarios permanecen accesibles;
- el contenido principal no queda inutilizable;
- los formularios pueden completarse;
- las acciones críticas pueden ejecutarse;
- no existe una dependencia obligatoria de desplazamiento horizontal para completar el flujo principal, salvo componentes donde se justifique explícitamente.

### Método de verificación

- pruebas responsive a 360 px;
- recorrido de flujos principales;
- inspección de formularios, tablas y navegación.

### Nota

`360 px` es un **criterio técnico aprobado**, no una métrica obtenida del relevamiento del restaurante.

---

## RNF-USA-003 — Estados visibles

| Campo | Valor |
|---|---|
| **Categoría** | Usabilidad |
| **Fuente** | SRS / procesos con estados |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Los estados de pedidos, comandas, compras, asistencia, turnos y otras operaciones relevantes deberán mostrarse de forma identificable para el usuario.

### Condición observable

Un usuario puede distinguir el estado actual sin revisar directamente la base de datos o información técnica.

### Método de verificación

- inspección de interfaz;
- pruebas de cambio de estado;
- validación funcional.

---

## RNF-USA-004 — Confirmación en acciones críticas

| Campo | Valor |
|---|---|
| **Categoría** | Usabilidad / prevención de errores |
| **Fuente** | Criterio técnico |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Las acciones con efecto relevante o difícil de revertir deberán requerir una confirmación o interacción equivalente suficientemente clara.

Aplica, como mínimo, a:

- cancelar operaciones;
- confirmar una venta con stock insuficiente;
- cerrar caja;
- desactivar elementos importantes.

### Condición observable

El usuario no ejecuta accidentalmente una acción crítica mediante un único clic ambiguo.

### Método de verificación

- pruebas de interacción;
- revisión de flujos críticos.

---

## RNF-USA-005 — Validación de formularios

| Campo | Valor |
|---|---|
| **Categoría** | Usabilidad |
| **Fuente** | Criterio técnico |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Los formularios deberán identificar de forma comprensible los datos obligatorios o inválidos.

### Condición observable

Cuando un formulario no pueda enviarse:

- el usuario conoce qué dato debe corregir;
- los datos válidos ya introducidos no se pierden innecesariamente.

### Método de verificación

- pruebas con campos vacíos;
- valores inválidos;
- errores provenientes del backend.

---

# 12. Accesibilidad

## RNF-ACC-001 — Etiquetas de campos

| Campo | Valor |
|---|---|
| **Categoría** | Accesibilidad |
| **Fuente** | Criterio técnico de interfaz |
| **Prioridad** | **MEDIA** |
| **Estado** | **Definido** |

### Requisito

Los campos principales de formularios deberán disponer de etiquetas o nombres accesibles que permitan identificar su propósito.

### Condición observable

El significado de un campo no depende únicamente de un placeholder que desaparece al escribir.

### Método de verificación

- inspección de formularios;
- revisión semántica del frontend.

---

## RNF-ACC-002 — Navegación básica mediante teclado

| Campo | Valor |
|---|---|
| **Categoría** | Accesibilidad |
| **Fuente** | Criterio técnico |
| **Prioridad** | **MEDIA** |
| **Estado** | **Propuesto** |

### Requisito

Las acciones principales de formularios y navegación deberán poder alcanzarse mediante teclado cuando el componente web utilizado lo permita.

### Condición observable

El foco puede desplazarse entre controles interactivos principales sin quedar atrapado de manera injustificada.

### Método de verificación

- recorrido usando `Tab` y controles de teclado;
- inspección de componentes.

---

## RNF-ACC-003 — Contraste legible

| Campo | Valor |
|---|---|
| **Categoría** | Accesibilidad / usabilidad |
| **Fuente** | Criterio técnico |
| **Prioridad** | **MEDIA** |
| **Estado** | **Propuesto** |

### Requisito

La interfaz deberá evitar combinaciones de color que hagan ilegible el contenido principal o los estados operativos.

### Condición observable

Textos, botones, alertas y estados principales pueden distinguirse visualmente en las vistas del MVP.

### Método de verificación

- inspección visual;
- herramientas automáticas de contraste cuando se incorporen al proceso de pruebas.

### Pendiente

No se fija todavía un nivel formal WCAG específico como requisito contractual del MVP.

---

# 13. Compatibilidad

## RNF-COM-001 — Navegadores modernos

| Campo | Valor |
|---|---|
| **Categoría** | Compatibilidad |
| **Fuente** | Alcance web responsive |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido con detalle pendiente** |

### Requisito

La aplicación deberá operar en navegadores web modernos utilizados durante las pruebas del proyecto.

El baseline inicial contempla:

- Google Chrome;
- Microsoft Edge;
- Mozilla Firefox.

### Condición observable

Los flujos principales funcionan en los navegadores seleccionados para validación.

### Método de verificación

- ejecución de pruebas en navegadores disponibles.

### Pendiente

Las versiones exactas soportadas se registrarán en la estrategia de pruebas.

---

## RNF-COM-002 — Sin dependencia de aplicación nativa

| Campo | Valor |
|---|---|
| **Categoría** | Compatibilidad |
| **Fuente** | Alcance MVP |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Las funcionalidades del MVP no deberán requerir instalar una aplicación Android, iOS o de escritorio independiente.

### Condición observable

Un usuario puede utilizar el núcleo del MVP desde navegador.

### Método de verificación

- despliegue y prueba desde navegador en los dispositivos disponibles.

---

# 14. Mantenibilidad

## RNF-MAN-001 — Separación modular por dominio

| Campo | Valor |
|---|---|
| **Categoría** | Mantenibilidad |
| **Fuente** | SRS / complejidad del producto |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

La solución deberá organizar la lógica de negocio evitando concentrar todos los procesos en un único componente altamente acoplado.

Como mínimo deberán poder distinguirse conceptualmente áreas como:

- identidad/usuarios;
- catálogo;
- inventario;
- producción;
- ventas/pedidos;
- compras;
- asistencia;
- caja;
- reportes.

### Condición observable

Una modificación interna de un módulo no exige alterar de manera injustificada todos los demás módulos.

### Método de verificación

- revisión de arquitectura;
- revisión de organización del código;
- revisión de dependencias.

---

## RNF-MAN-002 — Separación de lógica de negocio e interfaz

| Campo | Valor |
|---|---|
| **Categoría** | Mantenibilidad |
| **Fuente** | Criterio técnico |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Las reglas críticas del negocio no deberán residir únicamente en la interfaz del usuario.

### Condición observable

Reglas como:

- permisos;
- transiciones;
- stock negativo permitido;
- recepción de compras;
- cierre;

son validadas en la capa de negocio/backend.

### Método de verificación

- revisión de código;
- pruebas directas de API.

---

## RNF-MAN-003 — Configuración fuera del código fuente cuando corresponda

| Campo | Valor |
|---|---|
| **Categoría** | Mantenibilidad |
| **Fuente** | Criterio técnico |
| **Prioridad** | **MEDIA** |
| **Estado** | **Definido** |

### Requisito

Los secretos y parámetros dependientes del entorno no deberán quedar codificados directamente en el repositorio cuando deban variar entre entornos.

### Condición observable

Credenciales y secretos de despliegue se suministran mediante el mecanismo de configuración elegido.

### Método de verificación

- revisión del repositorio;
- revisión de configuración;
- búsqueda de secretos accidentales.

---

# 15. Portabilidad

## RNF-POR-001 — Despliegue reproducible

| Campo | Valor |
|---|---|
| **Categoría** | Portabilidad |
| **Fuente** | Indicadores técnicos definidos en `04` |
| **Prioridad** | **MEDIA** |
| **Estado** | **Definido** |

### Requisito

El repositorio deberá contener la documentación y configuración necesarias para ejecutar el sistema en el entorno definido por el proyecto.

### Condición observable

Otro integrante del equipo puede preparar el proyecto siguiendo la documentación sin depender únicamente de configuración privada de una única máquina.

### Método de verificación

- instalación/ejecución en otra máquina o entorno;
- seguimiento del README/documentación.

---

# 16. Auditabilidad

## RNF-AUD-001 — Usuario responsable

| Campo | Valor |
|---|---|
| **Categoría** | Auditabilidad |
| **Fuente** | `N-014`, `RF-006` |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Las operaciones relevantes deberán conservar el usuario responsable.

### Condición observable

Puede identificarse quién realizó:

- venta;
- compra;
- gasto;
- producción;
- cierre;
- otros movimientos definidos como trazables.

### Método de verificación

- consulta de operaciones;
- revisión de datos persistidos.

---

## RNF-AUD-002 — Fecha y hora de operaciones relevantes

| Campo | Valor |
|---|---|
| **Categoría** | Auditabilidad |
| **Fuente** | Necesidades de trazabilidad |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Las operaciones relevantes deberán conservar fecha y hora de registro o confirmación según corresponda.

### Condición observable

Una operación histórica puede ubicarse temporalmente.

### Método de verificación

- consulta de ventas;
- compras;
- gastos;
- asistencia;
- producción;
- cierre.

---

## RNF-AUD-003 — Trazabilidad de origen de movimientos

| Campo | Valor |
|---|---|
| **Categoría** | Auditabilidad |
| **Fuente** | Inventario / N-014 |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

Los movimientos automáticos de inventario deberán permitir identificar, cuando aplique, la operación que los originó.

### Condición observable

Puede distinguirse si un movimiento provino de:

- compra;
- producción;
- venta;
- baja/ajuste.

### Método de verificación

- consulta del historial;
- revisión de referencias entre registros.

---

# 17. Observabilidad

## RNF-OBS-001 — Registro técnico de errores

| Campo | Valor |
|---|---|
| **Categoría** | Observabilidad |
| **Fuente** | Criterio técnico |
| **Prioridad** | **MEDIA** |
| **Estado** | **Definido** |

### Requisito

El backend deberá registrar información técnica suficiente para diagnosticar errores importantes ocurridos durante la ejecución.

### Condición observable

Un error inesperado deja evidencia técnica que permite identificar:

- momento aproximado;
- tipo de error;
- componente afectado;

sin exponer secretos ni datos sensibles innecesarios.

### Método de verificación

- provocar error controlado;
- revisar logs;
- verificar ausencia de secretos.

---

## RNF-OBS-002 — No usar logs como sustituto de auditabilidad funcional

| Campo | Valor |
|---|---|
| **Categoría** | Observabilidad |
| **Fuente** | Separación de responsabilidades |
| **Prioridad** | **MEDIA** |
| **Estado** | **Definido** |

### Requisito

La información funcional necesaria para saber quién realizó una venta, compra, gasto o cierre deberá persistirse como parte de la operación y no depender exclusivamente de logs técnicos.

### Condición observable

La trazabilidad funcional continúa disponible aunque los logs técnicos roten o se eliminen.

### Método de verificación

- consulta de operaciones;
- revisión de modelo de datos.

---

# 18. Escalabilidad

## RNF-ESC-001 — Evolución modular

| Campo | Valor |
|---|---|
| **Categoría** | Escalabilidad funcional |
| **Fuente** | Visión del producto |
| **Prioridad** | **MEDIA** |
| **Estado** | **Definido** |

### Requisito

La estructura del sistema deberá permitir incorporar posteriormente módulos fuera del MVP sin requerir rehacer por completo el núcleo funcional.

Ejemplos:

- crédito a clientes;
- facturación fiscal;
- hardware biométrico;
- impresión;
- reportería avanzada;
- cuentas por pagar más completas.

### Condición observable

Las fronteras de dominio y extensiones futuras están identificadas durante arquitectura.

### Método de verificación

- revisión de arquitectura;
- ADR;
- revisión de dependencias entre módulos.

---

## RNF-ESC-002 — Escala de usuarios no cuantificada

| Campo | Valor |
|---|---|
| **Categoría** | Escalabilidad |
| **Fuente** | Ausencia de baseline |
| **Prioridad** | **MEDIA** |
| **Estado** | **Pendiente de métrica** |

### Requisito

No se fija para el MVP un número máximo contractual de usuarios, sucursales o transacciones.

### Condición observable

Las pruebas cubrirán la operación multiusuario necesaria para el escenario del proyecto.

### Método de verificación

- pruebas multiusuario;
- documentación de resultados.

---

# 19. Integración con hardware

## RNF-HW-001 — Hardware desacoplado del núcleo

| Campo | Valor |
|---|---|
| **Categoría** | Hardware |
| **Fuente** | Decisión aprobada / `HardwareIntegration` |
| **Prioridad** | **ALTA** |
| **Estado** | **Definido** |

### Requisito

El núcleo web deberá poder iniciar y ejecutar sus funcionalidades del MVP aunque no exista un lector biométrico ni una impresora conectados.

### Condición observable

La ausencia de hardware no impide:

- autenticación;
- asistencia manual;
- ventas;
- pedidos;
- inventario;
- compras;
- caja;
- reportes.

### Método de verificación

- ejecución del sistema sin periféricos;
- pruebas de módulos principales.

---

## RNF-HW-002 — Interfaz conceptual separada

| Campo | Valor |
|---|---|
| **Categoría** | Hardware / mantenibilidad |
| **Fuente** | Decisión aprobada |
| **Prioridad** | **MEDIA** |
| **Estado** | **Definido** |

### Requisito

Las futuras integraciones físicas deberán realizarse mediante una frontera o componente separado equivalente a `HardwareIntegration`.

### Condición observable

La lógica de negocio de asistencia o ventas no contiene una dependencia directa obligatoria de un SDK de fabricante.

### Método de verificación

- revisión de arquitectura;
- revisión de dependencias.

---

# 20. Requisitos explícitamente fuera del MVP

No forman parte de la aceptación del MVP:

## RNF-FUERA-001 — Backup automático

No se requiere backup automático diario.

## RNF-FUERA-002 — Restauración automatizada

No se exige flujo automatizado de restauración durante esta primera entrega.

## RNF-FUERA-003 — SLA cuantitativo

No se promete un porcentaje específico de disponibilidad.

## RNF-FUERA-004 — Rendimiento contractual

No se establece todavía un máximo universal de segundos por operación.

## RNF-FUERA-005 — Escala contractual

No se establece un máximo validado de usuarios concurrentes.

## RNF-FUERA-006 — Cumplimiento WCAG formal completo

Se incorporan criterios básicos de accesibilidad, pero no se declara conformidad con un nivel WCAG específico sin realizar una auditoría correspondiente.

---

# 21. Resumen de RNF

| Categoría | IDs principales |
|---|---|
| Seguridad | `RNF-SEG-001` – `RNF-SEG-007` |
| Privacidad | `RNF-PRI-001` – `RNF-PRI-002` |
| Integridad | `RNF-INT-001` – `RNF-INT-005` |
| Confiabilidad | `RNF-CON-001` – `RNF-CON-003` |
| Recuperabilidad | `RNF-REC-001` – `RNF-REC-003` |
| Rendimiento | `RNF-REN-001` – `RNF-REN-003` |
| Disponibilidad | `RNF-DIS-001` |
| Usabilidad | `RNF-USA-001` – `RNF-USA-005` |
| Accesibilidad | `RNF-ACC-001` – `RNF-ACC-003` |
| Compatibilidad | `RNF-COM-001` – `RNF-COM-002` |
| Mantenibilidad | `RNF-MAN-001` – `RNF-MAN-003` |
| Portabilidad | `RNF-POR-001` |
| Auditabilidad | `RNF-AUD-001` – `RNF-AUD-003` |
| Observabilidad | `RNF-OBS-001` – `RNF-OBS-002` |
| Escalabilidad | `RNF-ESC-001` – `RNF-ESC-002` |
| Hardware | `RNF-HW-001` – `RNF-HW-002` |

---

# 22. RNF pendientes de métrica

Los siguientes aspectos **no deben convertirse en números arbitrarios**:

| Área | Estado |
|---|---|
| Tiempo máximo de respuesta | Pendiente de pruebas/baseline |
| Expiración exacta de sesión | Pendiente de arquitectura/seguridad |
| Usuarios concurrentes máximos | Pendiente de pruebas |
| Disponibilidad porcentual | Sin SLA definido |
| Escala futura | Pendiente |
| Nivel WCAG formal | No comprometido en el MVP |

Cuando una métrica sea necesaria, deberá:

1. justificarse;
2. registrarse como propuesta;
3. medirse durante pruebas;
4. validarse antes de presentarla como objetivo definitivo.

---

# 23. Relación RNF con áreas del sistema

| Área | RNF relevantes |
|---|---|
| Usuarios y roles | `SEG`, `PRI`, `AUD` |
| Ventas | `INT`, `CON`, `REC`, `AUD` |
| Inventario | `INT`, `CON`, `AUD` |
| Producción | `INT`, `REC`, `AUD` |
| Compras | `INT`, `CON`, `AUD` |
| Asistencia | `SEG`, `PRI`, `AUD`, `HW` |
| Caja | `SEG`, `INT`, `CON`, `REC`, `AUD` |
| Frontend web | `USA`, `ACC`, `COM`, `REN` |
| Backend | `SEG`, `INT`, `CON`, `REC`, `OBS`, `MAN` |
| Hardware futuro | `HW`, `MAN` |

---

# 24. Criterio de calidad de los RNF

Antes de considerar estable esta baseline se verificó que:

- cada RNF posee un ID;
- cada RNF identifica una categoría;
- existe una fuente o justificación;
- incluye prioridad;
- expresa una condición observable;
- define un método de verificación;
- evita términos vagos sin criterio de prueba;
- no inventa porcentajes o tiempos;
- diferencia requisitos del MVP de mejoras posteriores;
- mantiene el hardware desacoplado;
- deja los backups fuera del MVP por decisión explícita;
- utiliza `360 px` como criterio técnico aprobado y no como evidencia del relevamiento.

---

# 25. Próximo documento

El siguiente artefacto será:

```text
docs/requirements/reglas-negocio.md
```

Este documento consolidará formalmente las reglas ya identificadas en la SRS y en los RF, evitando que permanezcan distribuidas entre múltiples archivos.

---

# 26. Control de cambios

| Versión | Fecha | Descripción | Estado |
|---|---|---|---|
| `0.1` | 20/08/2026 | Especificación inicial de requisitos no funcionales; backups fuera del MVP y responsive mínimo de 360 px aprobado | Lista para reglas de negocio |
| `0.2` | 21/08/2026 | Revalidación terminológica tras ENT-02; integridad de producción alineada con existencia preparada | Revalidada |
