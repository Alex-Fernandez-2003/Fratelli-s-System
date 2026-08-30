// Tipos del módulo de composición (HU-004).
// CompositionDto / CompositionLineDto / CompositionLineRequest ya existen en
// src/types/api.generated.ts (vienen del OpenAPI real del backend). No se
// duplican acá para no tener dos fuentes de verdad.
import type { components } from '@/types/api.generated'

export type Composition = components['schemas']['CompositionDto']
export type CompositionLine = components['schemas']['CompositionLineDto']
export type CompositionLineRequest = components['schemas']['CompositionLineRequest']
export type Unit = components['schemas']['UnitDto']
export type UnitDimension = components['schemas']['UnitDimension']

/**
 * Borrador de una línea de composición en edición dentro del formulario.
 * `key` es solo para identificar la fila en React (no viaja al backend).
 * Las cantidades se manejan como string mientras se editan para no pelear
 * con el input numérico controlado.
 */
export type CompositionLineDraft = {
  key: string
  componentProductId: string
  quantityPerOutputUnit: string
  unitId: string
}

export type LineIssueCode = 'INCOMPLETE' | 'SELF_REFERENCE' | 'DUPLICATE' | 'UNIT_INCOMPATIBLE'

export type LineIssue = {
  code: LineIssueCode
  message: string
  /** Solo se completa para UNIT_INCOMPATIBLE: unidades sugeridas para ese ingrediente. */
  allowedUnits?: Unit[]
}

export function draftFromLine(line: CompositionLine): CompositionLineDraft {
  return {
    key: line.componentProductId,
    componentProductId: line.componentProductId,
    quantityPerOutputUnit: String(line.quantityPerOutputUnit),
    unitId: line.unitId,
  }
}

export function emptyDraft(key: string): CompositionLineDraft {
  return { key, componentProductId: '', quantityPerOutputUnit: '', unitId: '' }
}
