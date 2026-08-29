import type { ProductDto } from '../api'
import type { CompositionLineDraft, LineIssue, Unit } from './types'

/**
 * Valida una línea de composición contra las reglas de HU-004:
 * - no se permite el producto padre como su propio ingrediente (cíclico);
 * - no se permite el mismo ingrediente duplicado en dos líneas;
 * - la unidad elegida debe ser de la misma dimensión (MASS/VOLUME/COUNT)
 *   que la unidad de inventario del ingrediente.
 *
 * Esta validación es un espejo en cliente para dar feedback inmediato; el
 * backend vuelve a validar todo al guardar (PUT /products/{id}/composition)
 * y es la autoridad final.
 */
export function validateLine(
  line: CompositionLineDraft,
  allLines: CompositionLineDraft[],
  parentProductId: string,
  productsById: Map<string, ProductDto>,
  unitsById: Map<string, Unit>,
): LineIssue[] {
  const issues: LineIssue[] = []
  const isEmpty = !line.componentProductId && !line.quantityPerOutputUnit && !line.unitId

  if (isEmpty) return issues

  if (!line.componentProductId || !line.unitId || !line.quantityPerOutputUnit) {
    issues.push({ code: 'INCOMPLETE', message: 'Completa ingrediente, cantidad y unidad.' })
    return issues
  }

  if (Number(line.quantityPerOutputUnit) <= 0) {
    issues.push({ code: 'INCOMPLETE', message: 'La cantidad debe ser mayor a 0.' })
  }

  if (line.componentProductId === parentProductId) {
    issues.push({
      code: 'SELF_REFERENCE',
      message: 'Relación cíclica detectada: un producto no puede ser ingrediente de sí mismo.',
    })
  }

  const duplicated = allLines.some(
    (other) => other.key !== line.key && other.componentProductId === line.componentProductId,
  )
  if (duplicated) {
    issues.push({ code: 'DUPLICATE', message: 'Este ingrediente ya fue agregado en otra línea.' })
  }

  const component = productsById.get(line.componentProductId)
  const componentUnit = component ? unitsById.get(component.inventoryUnitId) : undefined
  const selectedUnit = unitsById.get(line.unitId)
  if (componentUnit && selectedUnit && componentUnit.dimension !== selectedUnit.dimension) {
    const dimensionLabel: Record<string, string> = {
      MASS: 'peso',
      VOLUME: 'líquido',
      COUNT: 'unidad/pieza',
    }
    const allowedUnits = [...unitsById.values()].filter(
      (unit) => unit.dimension === componentUnit.dimension && unit.is_active,
    )
    issues.push({
      code: 'UNIT_INCOMPATIBLE',
      message: `Unidad incompatible (${dimensionLabel[componentUnit.dimension] ?? componentUnit.dimension}).`,
      allowedUnits,
    })
  }

  return issues
}

export function hasBlockingIssues(issuesByKey: Map<string, LineIssue[]>): boolean {
  return [...issuesByKey.values()].some((issues) => issues.length > 0)
}
