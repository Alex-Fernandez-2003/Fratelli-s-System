# Evidencia de relevamiento — Índice metodológico

## 1. Propósito

Esta carpeta organiza la evidencia utilizada para comprender, contrastar y refinar los requisitos de **Restaurant System** para **Fratelli**.

La estrategia de relevamiento utiliza **tres técnicas distintas**. Las dos entrevistas corresponden a aplicaciones de una misma técnica y, por tanto, no se contabilizan como métodos diferentes.

| Técnica | Carpeta | Estado | Aporte principal |
|---|---|---|---|
| **Entrevista semiestructurada** | `entrevistas/` | Aplicada en dos sesiones | Conocimiento directo del negocio y refinamiento de reglas |
| **Análisis de antecedentes (análisis documental)** | `analisis-antecedentes/` | Aplicado | Contexto previo del funcionamiento de Fratelli |
| **Análisis de sistemas similares / benchmarking** | `analisis-sistemas-similares/` | Aplicado | Patrones del dominio, alternativas y puntos de contraste |

## 2. Principio de triangulación

Las fuentes no tienen el mismo peso para todos los tipos de decisión:

- las **entrevistas** pueden confirmar reglas reales de Fratelli cuando la participante conoce el proceso;
- el **análisis de antecedentes** permite respaldar o contextualizar procesos previamente documentados por la organización;
- el **benchmarking** sirve para identificar patrones y alternativas, pero **no convierte automáticamente una funcionalidad externa en requisito de Fratelli**.

Cuando una regla del negocio contradiga una referencia externa, prevalece la evidencia validada de Fratelli para el alcance del producto.

## 3. Sesiones de entrevista

| Código | Finalidad | Evidencia |
|---|---|---|
| `ENT-01` | Diagnóstico general, prioridades, inventario, compras, asistencia, gastos, producción y sistema actual | `entrevistas/entrevista-01-trabajadora/` |
| `ENT-02` | Refinamiento de unidades, producción, compras, turnos y cierre de caja | `entrevistas/entrevista-02-trabajadora/` |

Las dos sesiones pertenecen a la técnica **entrevista semiestructurada**.

## 4. Uso documental

La evidencia de esta carpeta fundamenta principalmente:

```text
02-relevamiento.md
        ↓
03-hallazgos-y-necesidades.md
        ↓
06-srs.md
        ↓
requirements/
        ↓
07-product-backlog.md
```

Toda interpretación que altere un requisito o una regla debe conservar trazabilidad hacia la fuente correspondiente.
