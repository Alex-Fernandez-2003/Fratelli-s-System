import { ChevronLeft, ChevronRight, Package, PackageCheck, Plus, Trash2, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DataTable, Modal, PageHeader } from '@/components/organisms'
import { Badge, Button, Card, IconButton, Input, Select, StatusDot, Spinner } from '@/components/atoms'
import { FormError, FormField } from '@/components/molecules'
import { HttpError } from '@/lib/api/http-client'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  PURCHASE_WRITE_ROLES,
  useCancelPurchase,
  useCreatePurchase,
  usePurchaseDetail,
  usePurchasesList,
  useProductsForPurchase,
  useReceivePurchase,
  useSuppliersForPurchase,
  useUnitsForPurchase,
  type CreatePurchaseRequest,
  type PurchaseDto,
  type PurchaseLineRequest,
  type PurchaseStatus,
  type ReceiptLineRequest,
  type ReceivePurchaseRequest,
} from './api'

const STATUS_LABEL: Record<PurchaseStatus, string> = {
  PENDIENTE: 'Pendiente',
  RECIBIDA: 'Recibida',
  CANCELADA: 'Cancelada',
}

const STATUS_TONE: Record<PurchaseStatus, 'success' | 'danger' | 'neutral'> = {
  PENDIENTE: 'neutral',
  RECIBIDA: 'success',
  CANCELADA: 'danger',
}

const message = (error: unknown) =>
  error instanceof HttpError && error.status === 409
    ? 'No se pudo completar la operación. Revisá el estado de la compra o intentá nuevamente.'
    : 'No se pudo completar la operación. Intentá nuevamente.'

/* -------------------------------------------------------------------------- */
/* Listado                                                                     */
/* -------------------------------------------------------------------------- */

export function PurchasesPage() {
  const { hasAnyRole } = useAuth()
  const navigate = useNavigate()
  const canWrite = hasAnyRole([...PURCHASE_WRITE_ROLES])

  const [filters, setFilters] = useState<{ page: number; pageSize: number; status: PurchaseStatus | '' }>({
    page: 1,
    pageSize: 20,
    status: '',
  })
  const [cancelTarget, setCancelTarget] = useState<PurchaseDto | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState<string>()

  const query = usePurchasesList({
    page: filters.page,
    pageSize: filters.pageSize,
    status: filters.status || undefined,
  })
  const suppliersQuery = useSuppliersForPurchase()
  const cancel = useCancelPurchase()

  const supplierName = (id: string) => suppliersQuery.data?.items.find((s) => s.id === id)?.name ?? '—'

  const columns = [
    {
      id: 'supplier',
      header: 'Proveedor',
      cell: (purchase: PurchaseDto) => (
        <div className="flex items-center gap-2">
          <Package aria-hidden="true" size={16} className="text-text-muted" />
          <span>{supplierName(purchase.supplierId)}</span>
        </div>
      ),
    },
    {
      id: 'lines',
      header: 'Ítems',
      cell: (purchase: PurchaseDto) => purchase.lines.length,
    },
    {
      id: 'total',
      header: 'Total (Bs.)',
      cell: (purchase: PurchaseDto) => Number(purchase.total).toFixed(2),
    },
    {
      id: 'status',
      header: 'Estado',
      cell: (purchase: PurchaseDto) => (
        <Badge>{STATUS_LABEL[purchase.status]}</Badge>
      ),
    },
  ]

  const totalPages = Number(query.data?.totalPages ?? 0)
  const totalCount = Number(query.data?.totalCount ?? 0)
  const firstResult = totalCount ? (filters.page - 1) * filters.pageSize + 1 : 0
  const lastResult = Math.min(filters.page * filters.pageSize, totalCount)

  const actions = (purchase: PurchaseDto) => {
    if (!canWrite || purchase.status !== 'PENDIENTE') return null
    return (
      <div className="flex gap-1">
        <IconButton
          type="button"
          label={`Recibir compra ${purchase.id}`}
          onClick={() => navigate(`/compras/${purchase.id}/recibir`)}
        >
          <PackageCheck size={16} />
        </IconButton>
        <IconButton
          type="button"
          label={`Cancelar compra ${purchase.id}`}
          onClick={() => {
            setCancelTarget(purchase)
            setCancelReason('')
            setCancelError(undefined)
          }}
        >
          <XCircle size={16} />
        </IconButton>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Compras"
        description="Consulta y registra compras a proveedores."
        actions={
          canWrite ? (
            <Button
              type="button"
              onClick={() => navigate('/compras/nueva')}
              leftIcon={<Plus size={16} />}
              className="w-full sm:w-auto"
            >
              Nueva compra
            </Button>
          ) : undefined
        }
      />

      <Card className="grid gap-4 border-border bg-surface-elevated/40 p-4 sm:p-5">
        <div className="grid gap-3 sm:max-w-xs">
          <FormField label="Estado">
            <Select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as PurchaseStatus | '', page: 1 })
              }
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="RECIBIDA">Recibida</option>
              <option value="CANCELADA">Cancelada</option>
            </Select>
          </FormField>
        </div>

        {query.isLoading ? (
          <p role="status">Cargando compras…</p>
        ) : query.error ? (
          <div role="alert">
            <p>No se pudieron cargar las compras.</p>
            <Button type="button" onClick={() => void query.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : !query.data?.items.length ? (
          <div className="text-center">
            <p>{filters.status ? 'No hay resultados para este filtro.' : 'Todavía no hay compras registradas.'}</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                columns={columns}
                rows={query.data.items}
                getRowId={(p) => p.id}
                actions={actions}
              />
            </div>
            <div className="grid gap-3 md:hidden">
              {query.data.items.map((purchase) => (
                <Card key={purchase.id} className="grid gap-2">
                  <strong>{supplierName(purchase.supplierId)}</strong>
                  <span>{purchase.lines.length} ítems — {Number(purchase.total).toFixed(2)} Bs.</span>
                  <StatusDot label={STATUS_LABEL[purchase.status]} tone={STATUS_TONE[purchase.status]} />
                  {actions(purchase)}
                </Card>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-text-muted">
            Mostrando {firstResult}–{lastResult} de {totalCount} compras
          </span>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={filters.page <= 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              leftIcon={<ChevronLeft size={16} />}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={filters.page >= totalPages}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              rightIcon={<ChevronRight size={16} />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      <Modal open={!!cancelTarget} title="Cancelar compra" onClose={() => setCancelTarget(null)}>
        <p>
          Vas a cancelar la compra a <strong>{cancelTarget && supplierName(cancelTarget.supplierId)}</strong>.
          Esta acción no genera movimientos de inventario y solo es posible mientras la compra esté Pendiente.
        </p>
        <FormField label="Motivo de la cancelación" required error={cancelError}>
          <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
        </FormField>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setCancelTarget(null)}>
            Volver
          </Button>
          <Button
            type="button"
            loading={cancel.isPending}
            onClick={() => {
              if (!cancelTarget) return
              if (!cancelReason.trim()) {
                setCancelError('El motivo es obligatorio.')
                return
              }
              void cancel
                .mutateAsync({ id: cancelTarget.id, request: { reason: cancelReason.trim() } })
                .then(() => setCancelTarget(null))
                .catch((error: unknown) => setCancelError(message(error)))
            }}
          >
            Confirmar cancelación
          </Button>
        </div>
      </Modal>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Nueva compra                                                                */
/* -------------------------------------------------------------------------- */

type LineDraft = {
  key: string
  productId: string
  quantity: string
  unitId: string
  unitCost: string
}

function emptyLine(): LineDraft {
  return { key: crypto.randomUUID(), productId: '', quantity: '', unitId: '', unitCost: '' }
}

export function NewPurchasePage() {
  const navigate = useNavigate()
  const suppliersQuery = useSuppliersForPurchase()
  const productsQuery = useProductsForPurchase()
  const unitsQuery = useUnitsForPurchase()
  const create = useCreatePurchase()

  const [supplierId, setSupplierId] = useState('')
  const [receiptReference, setReceiptReference] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineDraft[]>([emptyLine()])
  const [formError, setFormError] = useState<string>()

  const suppliers = suppliersQuery.data?.items ?? []
  const products = productsQuery.data?.items ?? []
  const units = unitsQuery.data?.items ?? []

  /**
   * Mapas auxiliares para resolver la dimensión (MASS/VOLUME/COUNT) de la
   * unidad base de cada producto. El backend solo permite convertir entre
   * unidades de la MISMA dimensión (ver UnitDto.dimension); mezclar
   * dimensiones dispara 400 INVALID_UNIT_CONVERSION en POST /purchases.
   */
  const unitById = useMemo(() => new Map(units.map((u) => [u.id, u])), [units])
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])

  /**
   * Unidades habilitadas para una línea según el producto seleccionado:
   * misma dimensión que la unidad base (inventoryUnitId) del producto.
   * Sin producto seleccionado, se muestra el catálogo completo.
   */
  function unitsForProduct(productId: string) {
    if (!productId) return units
    const product = productById.get(productId)
    const baseUnit = product ? unitById.get(product.inventoryUnitId) : undefined
    if (!baseUnit) return units
    return units.filter((u) => u.dimension === baseUnit.dimension)
  }

  const total = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const qty = Number(line.quantity) || 0
        const cost = Number(line.unitCost) || 0
        return sum + qty * cost
      }, 0),
    [lines],
  )

  function updateLine(key: string, patch: Partial<LineDraft>) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  /**
   * Cambiar de producto puede invalidar la unidad ya elegida en la línea
   * (dimensión distinta). Si deja de ser compatible, se resetea unitId
   * para forzar una nueva selección dentro de las unidades permitidas.
   */
  function updateLineProduct(key: string, productId: string) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.key !== key) return line
        const allowed = unitsForProduct(productId)
        const stillValid = allowed.some((u) => u.id === line.unitId)
        return { ...line, productId, unitId: stillValid ? line.unitId : '' }
      }),
    )
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((line) => line.key !== key) : prev))
  }

  /**
   * Productos ya elegidos en otras líneas (excluyendo la línea actual).
   * El backend prohíbe repetir el mismo producto dentro de una compra;
   * se usa para ocultar esas opciones en el <Select> de cada línea y
   * evitar que el duplicado se pueda seleccionar desde la UI.
   */
  function productsUsedInOtherLines(currentKey: string) {
    return new Set(
      lines.filter((line) => line.key !== currentKey && line.productId).map((line) => line.productId),
    )
  }

  async function submit() {
    if (!supplierId) {
      setFormError('Seleccioná un proveedor.')
      return
    }
    const seenProductIds = new Set<string>()
    const parsedLines: PurchaseLineRequest[] = []
    for (const line of lines) {
      if (!line.productId || !line.unitId || !line.quantity || !line.unitCost) {
        setFormError('Completá producto, unidad, cantidad y costo en todas las líneas.')
        return
      }
      if (seenProductIds.has(line.productId)) {
        setFormError('No podés repetir el mismo producto en la misma compra. Sumá la cantidad en una sola línea.')
        return
      }
      seenProductIds.add(line.productId)
      const quantity = Number(line.quantity)
      const unitCost = Number(line.unitCost)
      if (quantity <= 0) {
        setFormError('La cantidad debe ser mayor a cero en todas las líneas.')
        return
      }
      if (unitCost < 0) {
        setFormError('El costo unitario no puede ser negativo.')
        return
      }
      parsedLines.push({ productId: line.productId, quantity, unitId: line.unitId, unitCost })
    }

    const request: CreatePurchaseRequest = {
      supplierId,
      lines: parsedLines,
      receiptReference: receiptReference.trim() || null,
      notes: notes.trim() || null,
    }

    try {
      setFormError(undefined)
      await create.mutateAsync(request)
      navigate('/compras')
    } catch (error) {
      setFormError(message(error))
    }
  }

  return (
    <div className="grid gap-6">
      <PageHeader title="Nueva compra" description="Registrá una compra a un proveedor." />

      <Card className="grid gap-4 border-border bg-surface-elevated/40 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Proveedor" required>
            <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">Selecciona un proveedor</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Referencia de recibo/factura">
            <Input
              placeholder="Ej: Factura #1234"
              value={receiptReference}
              onChange={(e) => setReceiptReference(e.target.value)}
            />
          </FormField>
        </div>

        <fieldset className="grid gap-3">
          <legend className="font-bold">Detalle de compra *</legend>

          {lines.map((line, index) => {
            const availableUnits = unitsForProduct(line.productId)
            const usedElsewhere = productsUsedInOtherLines(line.key)
            const availableProducts = products.filter(
              (product) => product.id === line.productId || !usedElsewhere.has(product.id),
            )
            return (
              <div key={line.key} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-end">
                <FormField label={index === 0 ? 'Producto' : undefined}>
                  <Select
                    value={line.productId}
                    onChange={(e) => updateLineProduct(line.key, e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    {availableProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label={index === 0 ? 'Cantidad' : undefined}>
                  <Input
                    type="number"
                    min={0}
                    step="0.0001"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                  />
                </FormField>

                <FormField label={index === 0 ? 'Unidad' : undefined}>
                  <Select
                    value={line.unitId}
                    onChange={(e) => updateLine(line.key, { unitId: e.target.value })}
                    disabled={!line.productId}
                  >
                    <option value="">{line.productId ? 'Unidad' : 'Elegí un producto primero'}</option>
                    {availableUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.symbol}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label={index === 0 ? 'Costo unit. (Bs.)' : undefined}>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitCost}
                    onChange={(e) => updateLine(line.key, { unitCost: e.target.value })}
                  />
                </FormField>

                <IconButton
                  type="button"
                  label="Eliminar línea"
                  onClick={() => removeLine(line.key)}
                  disabled={lines.length === 1}
                >
                  <Trash2 size={16} />
                </IconButton>
              </div>
            )
          })}

          <Button
            type="button"
            variant="outline"
            leftIcon={<Plus size={16} />}
            onClick={() => setLines((prev) => [...prev, emptyLine()])}
            className="w-full sm:w-auto"
          >
            Agregar línea de producto
          </Button>
        </fieldset>

        <FormField label="Notas internas">
          <Input
            placeholder="Observaciones sobre el estado de los productos o la entrega"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-text-muted">
            El total se calcula de forma referencial; el monto definitivo lo confirma el servidor.
          </span>
          <span className="text-lg font-bold">{total.toFixed(2)} Bs.</span>
        </div>

        {formError && <FormError>{formError}</FormError>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/compras')}>
            Cancelar
          </Button>
          <Button type="button" loading={create.isPending} onClick={() => void submit()}>
            Registrar compra
          </Button>
        </div>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Recibir compra — HU-018                                                    */
/* -------------------------------------------------------------------------- */

type ReceiveLineDraft = {
  purchaseItemId: string
  productId: string
  orderedQuantity: number
  orderedUnitId: string
  receivedQuantity: string
  unitId: string
}

const RECEIVE_CHECKLIST = [
  'Verifiqué que los productos coinciden con la descripción de la orden.',
  'Confirmé que las cantidades recibidas sean las registradas.',
  'Pesé o porcioné insumos de cocina críticos antes de confirmar la entrada.',
] as const

/**
 * Mensaje específico para recepción: el backend responde 409 con el mismo
 * código PURCHASE_ALREADY_RECEIVED tanto si la compra ya está RECIBIDA
 * como si está CANCELADA, sin distinguir un caso del otro.
 */
const receiveMessage = (error: unknown) =>
  error instanceof HttpError && error.status === 409
    ? 'Esta compra ya no está Pendiente (fue recibida o cancelada por otra persona). Volvé al listado para ver su estado actual.'
    : 'No se pudo confirmar la recepción. Intentá nuevamente.'

export function ReceivePurchasePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const purchaseQuery = usePurchaseDetail(id ?? '')
  const suppliersQuery = useSuppliersForPurchase()
  const productsQuery = useProductsForPurchase()
  const unitsQuery = useUnitsForPurchase()
  const receive = useReceivePurchase()
  const cancel = useCancelPurchase()

  const suppliers = suppliersQuery.data?.items ?? []
  const products = productsQuery.data?.items ?? []
  const units = unitsQuery.data?.items ?? []

  const unitById = useMemo(() => new Map(units.map((u) => [u.id, u])), [units])
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const supplierName = (supplierId: string) => suppliers.find((s) => s.id === supplierId)?.name ?? '—'

  /**
   * Unidades habilitadas para recibir una línea: misma dimensión que la
   * unidad ORDENADA de esa línea (ya validada como compatible con el
   * producto en HU-017). Evita repetir el lookup por producto y garantiza
   * que la unidad recibida nunca dispare INVALID_UNIT_CONVERSION.
   */
  function unitsForOrderedUnit(orderedUnitId: string) {
    const orderedUnit = unitById.get(orderedUnitId)
    if (!orderedUnit) return units
    return units.filter((u) => u.dimension === orderedUnit.dimension)
  }

  const [lines, setLines] = useState<ReceiveLineDraft[] | null>(null)
  const [notes, setNotes] = useState('')
  const [checklist, setChecklist] = useState<boolean[]>(RECEIVE_CHECKLIST.map(() => false))
  const [formError, setFormError] = useState<string>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState<string>()
  const [received, setReceived] = useState(false)

  const purchase = purchaseQuery.data

  // Seed del borrador de líneas una sola vez, cuando llega el detalle.
  if (purchase && lines === null) {
    setLines(
      purchase.lines.map((line) => ({
        purchaseItemId: line.id,
        productId: line.productId,
        orderedQuantity: Number(line.orderedQuantity),
        orderedUnitId: line.unitId,
        receivedQuantity: String(line.orderedQuantity),
        unitId: line.unitId,
      })),
    )
  }

  function updateLine(purchaseItemId: string, patch: Partial<ReceiveLineDraft>) {
    setLines((prev) =>
      prev ? prev.map((line) => (line.purchaseItemId === purchaseItemId ? { ...line, ...patch } : line)) : prev,
    )
  }

  const allChecked = checklist.every(Boolean)

  async function confirmReceive() {
    if (!id || !lines) return
    const parsedLines: ReceiptLineRequest[] = []
    for (const line of lines) {
      const quantity = Number(line.receivedQuantity)
      if (!line.unitId || !line.receivedQuantity || quantity <= 0) {
        setFormError('Completá una cantidad recibida mayor a cero y una unidad en todas las líneas.')
        setConfirmOpen(false)
        return
      }
      parsedLines.push({ purchaseItemId: line.purchaseItemId, receivedQuantity: quantity, unitId: line.unitId })
    }

    const request: ReceivePurchaseRequest = { lines: parsedLines, notes: notes.trim() || null }

    try {
      setFormError(undefined)
      await receive.mutateAsync({ id, request })
      setConfirmOpen(false)
      setReceived(true)
    } catch (error) {
      setConfirmOpen(false)
      setFormError(receiveMessage(error))
    }
  }

  if (purchaseQuery.isLoading) {
    return (
      <div className="grid place-items-center py-16" role="status">
        <Spinner label="Cargando compra…" />
      </div>
    )
  }

  if (purchaseQuery.error || !purchase) {
    return (
      <div className="grid gap-4">
        <PageHeader title="Recibir compra" />
        <Card className="grid gap-3 p-5 text-center">
          <p>No se pudo cargar esta compra.</p>
          <Button type="button" onClick={() => navigate('/compras')} className="justify-self-center">
            Volver al listado
          </Button>
        </Card>
      </div>
    )
  }

  if (received) {
    return (
      <div className="grid gap-6">
        <PageHeader title="Recibir compra" />
        <Card className="grid justify-items-center gap-4 p-8 text-center">
          <PackageCheck size={48} />
          <div>
            <h2 className="text-lg font-bold">¡Compra recibida con éxito!</h2>
            <p className="text-text-muted">
              El inventario ya fue actualizado con los insumos recibidos y están disponibles para uso en cocina.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/compras')}>
              Volver a compras
            </Button>
            <Button type="button" onClick={() => navigate('/inventario')}>
              Ver inventario
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (purchase.status !== 'PENDIENTE') {
    return (
      <div className="grid gap-6">
        <PageHeader title="Recibir compra" />
        <Card className="grid gap-3 p-5 text-center">
          <p>
            Esta compra ya está en estado <strong>{STATUS_LABEL[purchase.status]}</strong> y no puede volver a
            recibirse.
          </p>
          <Button type="button" onClick={() => navigate('/compras')} className="justify-self-center">
            Volver al listado
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title={`Recibir compra`}
        description={`Proveedor: ${supplierName(purchase.supplierId)} — Estado: ${STATUS_LABEL[purchase.status]}`}
      />

      <Card className="grid gap-4 border-border bg-surface-elevated/40 p-4 sm:p-5">
        <Badge>{STATUS_LABEL[purchase.status]}</Badge>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-sm text-text-muted">
                <th className="py-2">Producto</th>
                <th className="py-2">Cant. ordenada</th>
                <th className="py-2">Costo unit. (Bs.)</th>
                <th className="py-2">Cant. recibida</th>
                <th className="py-2">Unidad recibida</th>
              </tr>
            </thead>
            <tbody>
              {(lines ?? []).map((line) => {
                const product = productById.get(line.productId)
                const orderedUnit = unitById.get(line.orderedUnitId)
                const availableUnits = unitsForOrderedUnit(line.orderedUnitId)
                const purchaseLine = purchase.lines.find((l) => l.id === line.purchaseItemId)
                return (
                  <tr key={line.purchaseItemId} className="border-b border-border/60">
                    <td className="py-2">{product?.name ?? '—'}</td>
                    <td className="py-2">
                      {line.orderedQuantity} {orderedUnit?.symbol ?? ''}
                    </td>
                    <td className="py-2">{Number(purchaseLine?.unitCost ?? 0).toFixed(2)}</td>
                    <td className="py-2">
                      <Input
                        type="number"
                        min={0}
                        step="0.0001"
                        value={line.receivedQuantity}
                        onChange={(e) => updateLine(line.purchaseItemId, { receivedQuantity: e.target.value })}
                        className="w-28"
                      />
                    </td>
                    <td className="py-2">
                      <Select
                        value={line.unitId}
                        onChange={(e) => updateLine(line.purchaseItemId, { unitId: e.target.value })}
                        className="w-28"
                      >
                        {availableUnits.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.symbol}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-text-muted">Total de la orden</span>
          <span className="text-lg font-bold">{Number(purchase.total).toFixed(2)} Bs.</span>
        </div>

        <FormField label="Nota de recepción (opcional)">
          <Input
            placeholder="Observaciones sobre el estado de los insumos o discrepancias en la factura"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>

        <fieldset className="grid gap-2 rounded-md border border-border p-3">
          <legend className="px-1 text-sm font-bold">Verificar recepción</legend>
          {RECEIVE_CHECKLIST.map((item, index) => (
            <label key={item} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={checklist[index]}
                onChange={(e) =>
                  setChecklist((prev) => prev.map((value, i) => (i === index ? e.target.checked : value)))
                }
                className="mt-0.5"
              />
              <span>{item}</span>
            </label>
          ))}
        </fieldset>

        <p className="rounded-md border border-border bg-surface-elevated/60 p-3 text-sm">
          <strong>Advertencia:</strong> si la entrega está incompleta o en mal estado, no marques la compra como
          recibida. Usá &quot;No aceptar / cancelar compra&quot; para rechazarla mediante una cancelación con motivo.
        </p>

        {formError && <FormError>{formError}</FormError>}

        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/compras')}>
            Volver al listado
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRejectReason('')
              setRejectError(undefined)
              setRejectOpen(true)
            }}
          >
            No aceptar / cancelar compra
          </Button>
          <Button
            type="button"
            disabled={!allChecked}
            onClick={() => {
              setFormError(undefined)
              setConfirmOpen(true)
            }}
          >
            Confirmar recepción
          </Button>
        </div>
      </Card>

      <Modal open={confirmOpen} title="Confirmar recepción de compra" onClose={() => setConfirmOpen(false)}>
        <p>
          Al confirmar, la compra pasará a estado <strong>Recibida</strong> y las existencias de los productos
          aceptados se incrementarán automáticamente en el inventario. Esta acción es crítica y no se puede deshacer.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button type="button" loading={receive.isPending} onClick={() => void confirmReceive()}>
            Confirmar recepción
          </Button>
        </div>
      </Modal>

      <Modal open={rejectOpen} title="No aceptar compra" onClose={() => setRejectOpen(false)}>
        <p>
          No existe un rechazo parcial estructurado en esta versión: no aceptar una compra la cancela por completo.
          Coordiná la devolución con el proveedor fuera del sistema.
        </p>
        <FormField label="Motivo de la cancelación" required error={rejectError}>
          <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
        </FormField>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
            Volver
          </Button>
          <Button
            type="button"
            loading={cancel.isPending}
            onClick={() => {
              if (!id) return
              if (!rejectReason.trim()) {
                setRejectError('El motivo es obligatorio.')
                return
              }
              void cancel
                .mutateAsync({ id, request: { reason: rejectReason.trim() } })
                .then(() => navigate('/compras'))
                .catch((error: unknown) => setRejectError(receiveMessage(error)))
            }}
          >
            Confirmar cancelación
          </Button>
        </div>
      </Modal>
    </div>
  )
}
