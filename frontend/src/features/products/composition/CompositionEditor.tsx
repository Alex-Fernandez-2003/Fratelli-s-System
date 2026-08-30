import { AlertTriangle, Info, Plus, RotateCcw, Save, Search, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Badge, Button, Card, IconButton, Input, Select } from '@/components/atoms'
import { Alert } from '@/components/molecules'
import { Modal } from '@/components/organisms'
import type { ProductDto } from '../api'
import { validateLine } from './validation'
import { draftFromLine, emptyDraft } from './types'
import type { CompositionLine, CompositionLineDraft, CompositionLineRequest, Unit } from './types'

const PRODUCT_TYPE_LABEL: Record<string, string> = {
  INGREDIENT: 'Ingrediente',
  PREPARATION: 'Preparación',
  SALE_ITEM: 'Producto de venta',
  SUPPLY: 'Insumo',
}

function newKey() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `draft-${Math.random().toString(36).slice(2)}`
}

/**
 * Buscador simple de productos activos (usado tanto para elegir el
 * ingrediente de una línea como, arriba, para cambiar de producto padre).
 * Es local a esta feature: no toca los átomos/moléculas compartidos.
 */
function ProductCombobox({
  products,
  value,
  placeholder,
  onSelect,
}: {
  products: ProductDto[]
  value?: string
  placeholder: string
  onSelect: (product: ProductDto) => void
}) {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = products.find((p) => p.id === value)
  const results = useMemo(() => {
    const query = term.trim().toLowerCase()
    if (!query) return products.slice(0, 8)
    return products.filter((p) => p.name.toLowerCase().includes(query)).slice(0, 8)
  }, [products, term])

  return (
    <div className="relative" ref={containerRef}>
      <Input
        value={open ? term : (selected?.name ?? '')}
        placeholder={placeholder}
        onFocus={() => {
          setTerm('')
          setOpen(true)
        }}
        onChange={(e) => setTerm(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="pl-9"
      />
      <Search
        aria-hidden="true"
        size={16}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-surface-elevated p-1 shadow-lg">
          {results.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(product)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between gap-2 rounded px-2.5 py-2 text-left text-sm hover:bg-surface"
              >
                <span>{product.name}</span>
                <Badge>{PRODUCT_TYPE_LABEL[product.productType] ?? product.productType}</Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function CompositionEditor({
  parentProduct,
  initialLines,
  ingredientOptions,
  units,
  onSave,
  onChangeProduct,
  saving = false,
  serverError,
}: {
  parentProduct: ProductDto
  initialLines: CompositionLine[]
  ingredientOptions: ProductDto[]
  units: Unit[]
  onSave: (lines: CompositionLineRequest[]) => void
  onChangeProduct?: (product: ProductDto) => void
  saving?: boolean
  serverError?: string
}) {
  const [lines, setLines] = useState<CompositionLineDraft[]>(() =>
    initialLines.length ? initialLines.map(draftFromLine) : [emptyDraft(newKey())],
  )
  const [cyclicWarning, setCyclicWarning] = useState<string | null>(null)
  const [attemptedSave, setAttemptedSave] = useState(false)

  const productsById = useMemo(() => new Map(ingredientOptions.map((p) => [p.id, p])), [ingredientOptions])
  const unitsById = useMemo(() => new Map(units.map((u) => [u.id, u])), [units])
  const parentUnit = unitsById.get(parentProduct.inventoryUnitId)

  const initialSignature = useMemo(
    () =>
      JSON.stringify(
        initialLines
          .map((l) => [l.componentProductId, String(l.quantityPerOutputUnit), l.unitId])
          .sort(),
      ),
    [initialLines],
  )
  const currentSignature = JSON.stringify(
    lines
      .filter((l) => l.componentProductId)
      .map((l) => [l.componentProductId, l.quantityPerOutputUnit, l.unitId])
      .sort(),
  )
  const isDirty = initialSignature !== currentSignature

  const issuesByKey = useMemo(() => {
    const map = new Map<string, ReturnType<typeof validateLine>>()
    for (const line of lines) {
      map.set(line.key, validateLine(line, lines, parentProduct.id, productsById, unitsById))
    }
    return map
  }, [lines, parentProduct.id, productsById, unitsById])

  const filledLines = lines.filter((l) => l.componentProductId || l.quantityPerOutputUnit || l.unitId)
  const hasAnyIssue = [...issuesByKey.values()].some((issues) => issues.length > 0)
  const hasAtLeastOneComponent = lines.some((l) => l.componentProductId && !issuesByKey.get(l.key)?.length)

  function updateLine(key: string, patch: Partial<CompositionLineDraft>) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  function selectIngredient(key: string, product: ProductDto) {
    if (product.id === parentProduct.id) {
      setCyclicWarning(product.name)
      return
    }
    const defaultUnitId = unitsById.has(product.inventoryUnitId) ? product.inventoryUnitId : ''
    updateLine(key, { componentProductId: product.id, unitId: defaultUnitId })
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length === 1 ? [emptyDraft(newKey())] : prev.filter((l) => l.key !== key)))
  }

  function addLine() {
    setLines((prev) => [...prev, emptyDraft(newKey())])
  }

  function handleSave() {
    setAttemptedSave(true)
    if (hasAnyIssue || !hasAtLeastOneComponent) return
    const payload: CompositionLineRequest[] = lines
      .filter((l) => l.componentProductId)
      .map((l) => ({
        componentProductId: l.componentProductId,
        quantityPerOutputUnit: Number(l.quantityPerOutputUnit),
        unitId: l.unitId,
      }))
    onSave(payload)
  }

  function resetChanges() {
    setLines(initialLines.length ? initialLines.map(draftFromLine) : [emptyDraft(newKey())])
    setAttemptedSave(false)
  }

  const showTopError = serverError || (attemptedSave && (hasAnyIssue || !hasAtLeastOneComponent))

  return (
    <div className="grid gap-6">
      {showTopError && (
        <Alert kind="error" title="Error de validación">
          {serverError ??
            (hasAtLeastOneComponent
              ? 'Por favor corrige las unidades incompatibles antes de guardar.'
              : 'Se requiere al menos un ingrediente válido para guardar la composición.')}
        </Alert>
      )}

      <Card className="grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-surface-elevated text-xl">
              🍽️
            </span>
            <div>
              <h2 className="m-0">{parentProduct.name}</h2>
              <Badge>{PRODUCT_TYPE_LABEL[parentProduct.productType] ?? parentProduct.productType}</Badge>
              {isDirty && <Badge tone="warning">Cambios sin guardar</Badge>}
            </div>
          </div>
          {onChangeProduct && (
            <div className="w-full sm:w-64">
              <ProductCombobox
                products={ingredientOptions.filter(
                  (p) => p.id !== parentProduct.id && p.productType === 'PREPARATION',
                )}
                placeholder="Buscar otro producto…"
                onSelect={onChangeProduct}
              />
            </div>
          )}
        </div>

        <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <span className="block text-sm text-text-muted">Unidad principal</span>
            <strong>
              {parentUnit ? `${parentUnit.name} (${parentUnit.symbol})` : '—'}
            </strong>
          </div>
          <div>
            <span className="block text-sm text-text-muted">Ingredientes agregados</span>
            <strong>{filledLines.length}</strong>
          </div>
        </div>
        <p className="m-0 text-xs text-text-muted">
          El costo estimado y el rendimiento no forman parte del alcance actual del backend
          (HU-004 no implementa costeo ni rendimiento esperado), por lo que no se muestran aquí.
        </p>
      </Card>

      <Card className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="m-0">Ingredientes necesarios</h3>
            <p className="m-0 text-sm text-text-muted">
              Define la receta exacta para descontar del inventario.
            </p>
          </div>
          <Button type="button" onClick={addLine} leftIcon={<Plus size={16} />}>
            Agregar ingrediente
          </Button>
        </div>

        {/* Desktop: tabla */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border p-2.5 text-left">Ingrediente</th>
                <th className="border-b border-border p-2.5 text-left">Cantidad</th>
                <th className="border-b border-border p-2.5 text-left">Unidad de medida</th>
                <th className="border-b border-border p-2.5 text-left">Acción</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <CompositionRow
                  key={line.key}
                  variant="row"
                  line={line}
                  issues={issuesByKey.get(line.key) ?? []}
                  ingredientOptions={ingredientOptions}
                  units={units}
                  onSelectIngredient={(product) => selectIngredient(line.key, product)}
                  onChangeQuantity={(value) => updateLine(line.key, { quantityPerOutputUnit: value })}
                  onChangeUnit={(unitId) => updateLine(line.key, { unitId })}
                  onRemove={() => removeLine(line.key)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: tarjetas apiladas */}
        <div className="grid gap-3 md:hidden">
          {lines.map((line) => (
            <CompositionRow
              key={line.key}
              variant="card"
              line={line}
              issues={issuesByKey.get(line.key) ?? []}
              ingredientOptions={ingredientOptions}
              units={units}
              onSelectIngredient={(product) => selectIngredient(line.key, product)}
              onChangeQuantity={(value) => updateLine(line.key, { quantityPerOutputUnit: value })}
              onChangeUnit={(unitId) => updateLine(line.key, { unitId })}
              onRemove={() => removeLine(line.key)}
            />
          ))}
        </div>

        <p className="m-0 flex items-center gap-1.5 text-sm text-text-muted">
          <Info aria-hidden="true" size={14} />
          Se requiere al menos un componente para el consumo automático en producción.
        </p>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={resetChanges} disabled={!isDirty || saving}>
          Cancelar cambios
        </Button>
        <Button type="button" onClick={handleSave} loading={saving} leftIcon={<Save size={16} />}>
          Guardar composición
        </Button>
      </div>

      <Modal
        open={cyclicWarning !== null}
        title="Relación cíclica detectada"
        onClose={() => setCyclicWarning(null)}
      >
        <div className="grid gap-3">
          <p className="m-0">
            No se puede agregar <strong>&ldquo;{cyclicWarning}&rdquo;</strong> como ingrediente de sí
            mismo. Esto generaría un bucle infinito en el cálculo de stock.
          </p>
          <div className="flex justify-end">
            <Button type="button" onClick={() => setCyclicWarning(null)}>
              Entendido
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function CompositionRow({
  variant,
  line,
  issues,
  ingredientOptions,
  units,
  onSelectIngredient,
  onChangeQuantity,
  onChangeUnit,
  onRemove,
}: {
  variant: 'row' | 'card'
  line: CompositionLineDraft
  issues: ReturnType<typeof validateLine>
  ingredientOptions: ProductDto[]
  units: Unit[]
  onSelectIngredient: (product: ProductDto) => void
  onChangeQuantity: (value: string) => void
  onChangeUnit: (unitId: string) => void
  onRemove: () => void
}) {
  const blocking = issues.filter((i) => i.code !== 'INCOMPLETE')
  const tone = blocking.some((i) => i.code === 'SELF_REFERENCE')
    ? 'warning'
    : blocking.length
      ? 'danger'
      : 'none'
  const toneClasses =
    tone === 'danger'
      ? 'border-danger/60 bg-danger/10'
      : tone === 'warning'
        ? 'border-warning/60 bg-warning/10'
        : 'border-border'
  const allowedUnitsHint = issues.find((i) => i.code === 'UNIT_INCOMPATIBLE')?.allowedUnits
  const selectedComponent = ingredientOptions.find((p) => p.id === line.componentProductId)
  const componentUnit = selectedComponent
    ? units.find((u) => u.id === selectedComponent.inventoryUnitId)
    : undefined
  const availableUnits = (
    componentUnit
      ? units.filter((u) => u.is_active && u.dimension === componentUnit.dimension)
      : units.filter((u) => u.is_active)
  )

  const ingredientField = (
    <ProductCombobox
      products={ingredientOptions}
      value={line.componentProductId}
      placeholder="Buscar ingrediente…"
      onSelect={onSelectIngredient}
    />
  )
  const quantityField = (
    <Input
      type="number"
      min={0}
      step="0.01"
      value={line.quantityPerOutputUnit}
      onChange={(e) => onChangeQuantity(e.target.value)}
      placeholder="0.00"
    />
  )
  const unitField = (
    <Select value={line.unitId} onChange={(e) => onChangeUnit(e.target.value)}>
      <option value="">Seleccionar…</option>
      {availableUnits.map((unit) => (
        <option key={unit.id} value={unit.id}>
          {unit.name} ({unit.symbol})
        </option>
      ))}
    </Select>
  )
  const removeButton = (
    <IconButton type="button" label="Quitar ingrediente" onClick={onRemove}>
      <Trash2 size={16} />
    </IconButton>
  )
  const issueMessages = blocking.map((issue, index) => (
    <span key={index} className={`flex items-center gap-1 text-xs ${tone === 'warning' ? 'text-warning' : 'text-danger'}`}>
      {tone === 'warning' ? <RotateCcw size={12} aria-hidden="true" /> : <AlertTriangle size={12} aria-hidden="true" />}
      {issue.message}
    </span>
  ))

  if (variant === 'row') {
    return (
      <tr className={`border-b ${toneClasses}`}>
        <td className="p-2.5 align-top">
          {ingredientField}
          <div className="mt-1 grid gap-0.5">{issueMessages}</div>
        </td>
        <td className="w-28 p-2.5 align-top">{quantityField}</td>
        <td className="w-48 p-2.5 align-top">
          {unitField}
          {allowedUnitsHint && allowedUnitsHint.length > 0 && (
            <p className="m-0 mt-1 text-xs text-text-muted">
              Permitidas: {allowedUnitsHint.map((u) => u.symbol).join(', ')}
            </p>
          )}
        </td>
        <td className="p-2.5 align-top">{removeButton}</td>
      </tr>
    )
  }

  return (
    <Card className={`grid gap-3 ${toneClasses}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="mb-1 block text-xs font-bold text-text-muted uppercase">
            Insumo / ingrediente
          </span>
          {ingredientField}
        </div>
        {removeButton}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="mb-1 block text-xs font-bold text-text-muted uppercase">Cantidad</span>
          {quantityField}
        </div>
        <div>
          <span className="mb-1 block text-xs font-bold text-text-muted uppercase">Unidad</span>
          {unitField}
        </div>
      </div>
      {allowedUnitsHint && allowedUnitsHint.length > 0 && (
        <p className="m-0 text-xs text-text-muted">
          Permitidas: {allowedUnitsHint.map((u) => u.symbol).join(', ')}
        </p>
      )}
      <div className="grid gap-0.5">{issueMessages}</div>
    </Card>
  )
}
