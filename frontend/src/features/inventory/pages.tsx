import {
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  RefreshCw,
  Search,
  TriangleAlert,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Badge, Button, Card, Input, Select, StatusDot } from '@/components/atoms'
import { FormField, FormError } from '@/components/molecules'
import { Modal, PageHeader } from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import { HttpError } from '@/lib/api/http-client'
import {
  type Balance,
  type Movement,
  type MovementFilters,
  type MovementType,
  type ProductType,
  useBalances,
  useInventorySummary,
  useManualMovement,
  useMovements,
} from './api'

const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'INGREDIENT', label: 'Ingrediente' },
  { value: 'PREPARATION', label: 'Preparación' },
  { value: 'SALE_ITEM', label: 'Producto de venta' },
  { value: 'SUPPLY', label: 'Insumo' },
]
const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
  { value: 'ENTRY', label: 'Entrada' },
  { value: 'WRITE_OFF', label: 'Baja' },
  { value: 'SALE', label: 'Venta' },
  { value: 'PRODUCTION_CONSUMPTION', label: 'Consumo de producción' },
  { value: 'PRODUCTION_OUTPUT', label: 'Producción' },
  { value: 'PURCHASE_RECEIPT', label: 'Recepción de compra' },
  { value: 'ADJUSTMENT', label: 'Ajuste' },
]
const labelForType = (value: string) =>
  PRODUCT_TYPES.find((item) => item.value === value)?.label ?? value
const labelForMovement = (value: string) =>
  MOVEMENT_TYPES.find((item) => item.value === value)?.label ?? value
const decimal = (value: number | string) =>
  Number(value).toLocaleString('es-BO', { maximumFractionDigits: 4 })
const stateFor = (balance: Balance) =>
  Number(balance.currentQuantity) < 0
    ? { label: 'Saldo negativo', tone: 'danger' as const }
    : balance.isLowStock
      ? { label: 'Stock bajo', tone: 'warning' as const }
      : { label: 'Normal', tone: 'success' as const }
const canManage = (roles: string[]) =>
  roles.some((role) => role === 'ADMINISTRADOR' || role === 'ENCARGADO')

function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onChange,
}: {
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
  onChange: (page: number) => void
}) {
  const first = totalCount ? (page - 1) * pageSize + 1 : 0
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-text-muted">
      <span>
        Mostrando {first}–{Math.min(page * pageSize, totalCount)} de {totalCount}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          leftIcon={<ChevronLeft size={16} />}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          rightIcon={<ChevronRight size={16} />}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

function InventoryNavigation() {
  const { user } = useAuth()
  const { search } = useLocation()
  const notifications = new URLSearchParams(search).get('tab') === 'notificaciones'
  const manager = canManage(user?.roles ?? [])
  return (
    <nav className="flex border-b border-border" aria-label="Secciones de inventario">
      <Link
        className={
          !notifications
            ? 'border-b-2 border-brand-orange px-4 py-3 font-bold text-brand-orange'
            : 'px-4 py-3 text-text-muted hover:text-text'
        }
        aria-current={!notifications ? 'page' : undefined}
        to="/inventario"
      >
        Existencias
      </Link>
      {manager && (
        <Link className="px-4 py-3 text-text-muted hover:text-text" to="/inventario/movimientos">
          Movimientos
        </Link>
      )}
      <Link
        className={
          notifications
            ? 'border-b-2 border-brand-orange px-4 py-3 font-bold text-brand-orange'
            : 'px-4 py-3 text-text-muted hover:text-text'
        }
        aria-current={notifications ? 'page' : undefined}
        to="/inventario?tab=notificaciones"
      >
        Notificaciones
      </Link>
    </nav>
  )
}

function MovementDialog({ mode, onClose }: { mode: 'ENTRY' | 'WRITE_OFF'; onClose: () => void }) {
  const [search, setSearch] = useState('')
  const [selectorPage, setSelectorPage] = useState(1)
  const [product, setProduct] = useState<Balance | null>(null)
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()
  const products = useBalances({ page: selectorPage, pageSize: 20, search: search || undefined })
  const mutation = useManualMovement()
  const { user } = useAuth()
  const amount = Number(quantity)
  const validQuantity = /^\d+(?:[.,]\d{1,4})?$/.test(quantity) && amount > 0
  const result = product ? Number(product.currentQuantity) - amount : undefined
  const warning =
    mode === 'WRITE_OFF' &&
    product &&
    (Number(product.currentQuantity) < 0
      ? 'Este producto ya tiene saldo negativo. La nueva baja reducirá aún más el saldo.'
      : amount > Number(product.currentQuantity)
        ? 'No hay stock suficiente actualmente en el inventario. La baja puede registrarse igualmente y el saldo quedará negativo.'
        : 'Esta acción reducirá el inventario actual y el movimiento histórico no se puede editar ni eliminar.')
  const submit = async () => {
    if (!product || !validQuantity || !reason.trim() || reason.trim().length > 500) {
      setError(
        'Seleccioná un producto, ingresá una cantidad válida y un motivo de hasta 500 caracteres.',
      )
      return
    }
    try {
      await mutation.mutateAsync({
        productId: product.productId,
        type: mode,
        quantity: Number(quantity.replace(',', '.')),
        reason: reason.trim(),
      })
      onClose()
    } catch (cause) {
      setError(
        cause instanceof HttpError
          ? (cause.problem.detail ?? 'No se pudo registrar el movimiento.')
          : 'No se pudo registrar el movimiento.',
      )
    }
  }
  return (
    <Modal open title={mode === 'ENTRY' ? 'Registrar entrada' : 'Registrar baja'} onClose={onClose}>
      <div className="grid gap-4 pt-4">
        <FormField label="Buscar producto">
          <Input
            value={search}
            placeholder="Buscar producto..."
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectorPage(1)
            }}
          />
        </FormField>
        <FormField label="Producto" required>
          <Select
            value={product?.productId ?? ''}
            onChange={(e) =>
              setProduct(
                products.data?.items.find((item) => item.productId === e.target.value) ?? null,
              )
            }
          >
            <option value="">Seleccioná un producto</option>
            {products.data?.items.map((item) => (
              <option value={item.productId} key={item.productId}>
                {item.productName} — {decimal(item.currentQuantity)} {item.inventoryUnitSymbol}
              </option>
            ))}
          </Select>
        </FormField>
        {products.data && Number(products.data.totalPages) > selectorPage && (
          <Button variant="outline" size="sm" onClick={() => setSelectorPage(selectorPage + 1)}>
            Mostrar más resultados
          </Button>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={mode === 'ENTRY' ? 'Cantidad' : 'Cantidad a retirar'} required>
            <Input
              inputMode="decimal"
              placeholder="0.0000"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </FormField>
          <FormField label="Unidad">
            <Input readOnly value={product?.inventoryUnitSymbol ?? '—'} />
          </FormField>
        </div>
        <FormField label={mode === 'ENTRY' ? 'Motivo / origen' : 'Motivo'} required>
          <textarea
            className="min-h-24 w-full rounded-md border border-border bg-surface p-2.5"
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </FormField>
        {user && (
          <p className="text-sm text-text-muted">Responsable: {user.fullName ?? user.username}</p>
        )}
        {warning && (
          <div
            className="rounded-md border border-warning/50 bg-warning/10 p-3 text-sm"
            role="alert"
          >
            <TriangleAlert className="mr-2 inline" size={16} />
            {warning}
            {result !== undefined && (
              <div className="mt-2">
                Saldo resultante estimado:{' '}
                <strong>
                  {decimal(result)} {product?.inventoryUnitSymbol}
                </strong>
              </div>
            )}
          </div>
        )}
        {error && <FormError>{error}</FormError>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={mode === 'WRITE_OFF' ? 'danger' : 'primary'}
            loading={mutation.isPending}
            onClick={() => void submit()}
          >
            {mode === 'ENTRY' ? 'Registrar entrada' : 'Confirmar baja'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function InventorySummary({
  summary,
  onDetails,
}: {
  summary: ReturnType<typeof useInventorySummary>
  onDetails: () => void
}) {
  if (summary.isLoading && !summary.data)
    return <p role="status">Cargando resumen de inventario…</p>
  if (summary.error && !summary.data)
    return (
      <Card>
        <p role="alert">No se pudo cargar el resumen de inventario.</p>
        <Button onClick={() => void summary.refetch()}>Reintentar</Button>
      </Card>
    )
  if (!summary.data) return null
  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Stock bajo', summary.data.lowStockCount],
          ['Negativos', summary.data.negativeStockCount],
          ['Normal', summary.data.normalStockCount],
          ['Total productos', summary.data.totalProducts],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <span className="text-text-muted">{label}</span>
            <strong className="block text-2xl">{value}</strong>
          </Card>
        ))}
      </div>
      {Number(summary.data.lowStockCount) > 0 && (
        <Card className="border-warning bg-warning/10" role="alert">
          <TriangleAlert className="mr-2 inline" size={18} aria-hidden="true" />
          Hay {summary.data.lowStockCount} productos con stock bajo.{' '}
          <Button variant="outline" size="sm" onClick={onDetails}>
            Ver detalles
          </Button>
        </Card>
      )}
    </div>
  )
}

function InventoryNotifications({ summary }: { summary: ReturnType<typeof useInventorySummary> }) {
  if (summary.isLoading && !summary.data)
    return <p role="status">Cargando notificaciones de inventario…</p>
  if (summary.error && !summary.data)
    return (
      <Card>
        <p role="alert">No se pudieron cargar las notificaciones de inventario.</p>
        <Button onClick={() => void summary.refetch()}>Reintentar</Button>
      </Card>
    )
  const items = [...(summary.data?.lowStockItems ?? [])].sort(
    (a, b) =>
      Number(a.currentQuantity) - Number(b.currentQuantity) ||
      a.productName.localeCompare(b.productName),
  )
  if (!items.length)
    return (
      <Card className="text-center">
        <strong>No hay productos con stock bajo.</strong>
        <p className="text-text-muted">
          Las existencias actuales están por encima de los mínimos configurados.
        </p>
      </Card>
    )
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const state = stateFor(item)
        return (
          <Card
            key={item.productId}
            className={state.tone === 'danger' ? 'border-danger' : 'border-warning'}
          >
            <div className="flex justify-between gap-2">
              <strong>{item.productName}</strong>
              <StatusDot label={state.label} tone={state.tone} />
            </div>
            <Badge>{labelForType(item.productType)}</Badge>
            <p className={Number(item.currentQuantity) < 0 ? 'mt-3 text-danger' : 'mt-3'}>
              {decimal(item.currentQuantity)} {item.inventoryUnitSymbol}
            </p>
            <p className="text-sm text-text-muted">
              Stock mínimo: {item.minStock == null ? '—' : decimal(item.minStock)}
            </p>
          </Card>
        )
      })}
    </div>
  )
}

export function InventoryBalancesPage() {
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    search: '',
    productType: '',
    lowStockOnly: false,
  })
  const [dialog, setDialog] = useState<'ENTRY' | 'WRITE_OFF' | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const summary = useInventorySummary()
  const notifications = searchParams.get('tab') === 'notificaciones'
  const { user } = useAuth()
  const manager = canManage(user?.roles ?? [])
  const query = useBalances({
    ...filters,
    productType: (filters.productType || undefined) as ProductType | undefined,
  })
  const lowStockItems = (summary.data?.lowStockItems ?? []).filter(
    (item) =>
      (!filters.search || item.productName.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.productType || item.productType === filters.productType),
  )
  const items = filters.lowStockOnly
    ? lowStockItems.slice((filters.page - 1) * filters.pageSize, filters.page * filters.pageSize)
    : (query.data?.items ?? [])
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Inventario"
        description="Consultá existencias, stock bajo y movimientos de almacén."
        actions={
          manager ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setDialog('WRITE_OFF')}>
                Registrar baja
              </Button>
              <Button leftIcon={<Plus size={16} />} onClick={() => setDialog('ENTRY')}>
                Registrar entrada
              </Button>
            </div>
          ) : undefined
        }
      />
      <InventoryNavigation />
      {notifications ? (
        <InventoryNotifications summary={summary} />
      ) : (
        <>
          <InventorySummary
            summary={summary}
            onDetails={() => setSearchParams({ tab: 'notificaciones' })}
          />
          <Card className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem_auto]">
            <FormField label="Buscar producto" leadingIcon={<Search size={16} />}>
              <Input
                value={filters.search}
                placeholder="Buscar producto..."
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </FormField>
            <FormField label="Tipo de producto">
              <Select
                value={filters.productType}
                onChange={(e) => setFilters({ ...filters, productType: e.target.value, page: 1 })}
              >
                <option value="">Todos</option>
                {PRODUCT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <Button
              variant={filters.lowStockOnly ? 'primary' : 'outline'}
              onClick={() =>
                setFilters({ ...filters, lowStockOnly: !filters.lowStockOnly, page: 1 })
              }
            >
              Stock bajo
            </Button>
            <Button
              variant="outline"
              aria-label="Actualizar existencias"
              onClick={() => {
                void query.refetch()
                void summary.refetch()
              }}
              leftIcon={<RefreshCw size={16} />}
            >
              Actualizar
            </Button>
          </Card>
          {query.isLoading && !query.data ? (
            <p role="status">Cargando inventario…</p>
          ) : query.error && !query.data ? (
            <Card>
              <p role="alert">No se pudo cargar el inventario.</p>
              <Button onClick={() => void query.refetch()}>Reintentar</Button>
            </Card>
          ) : !items.length ? (
            <Card className="text-center">
              <Package className="mx-auto mb-3 text-text-muted" />
              <strong>
                {filters.search || filters.productType
                  ? 'No hay resultados para estos filtros.'
                  : 'No hay productos disponibles en el catálogo.'}
              </strong>
            </Card>
          ) : (
            <Card>
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-sm text-text-muted">
                      <th className="p-3">Producto</th>
                      <th>Tipo</th>
                      <th>Existencia actual</th>
                      <th>Unidad</th>
                      <th>Stock mínimo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const state = stateFor(item)
                      return (
                        <tr key={item.productId} className="border-b border-border">
                          <td className="p-3 font-bold">{item.productName}</td>
                          <td>
                            <Badge>{labelForType(item.productType)}</Badge>
                          </td>
                          <td className={Number(item.currentQuantity) < 0 ? 'text-danger' : ''}>
                            {decimal(item.currentQuantity)}
                          </td>
                          <td>{item.inventoryUnitSymbol}</td>
                          <td>{item.minStock == null ? '—' : decimal(item.minStock)}</td>
                          <td>
                            <StatusDot label={state.label} tone={state.tone} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 md:hidden">
                {items.map((item) => {
                  const state = stateFor(item)
                  return (
                    <Card
                      key={item.productId}
                      className={Number(item.currentQuantity) < 0 ? 'border-danger' : ''}
                    >
                      <div className="flex justify-between gap-2">
                        <strong>{item.productName}</strong>
                        <Badge>{labelForType(item.productType)}</Badge>
                      </div>
                      <div className="mt-3 text-2xl font-bold">
                        {decimal(item.currentQuantity)}{' '}
                        <span className="text-base font-normal">{item.inventoryUnitSymbol}</span>
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-text-muted">
                        <span>
                          Stock mínimo: {item.minStock == null ? '—' : decimal(item.minStock)}
                        </span>
                        <StatusDot label={state.label} tone={state.tone} />
                      </div>
                    </Card>
                  )
                })}
              </div>
              <Pagination
                page={filters.page}
                totalPages={
                  filters.lowStockOnly
                    ? Math.max(1, Math.ceil(lowStockItems.length / filters.pageSize))
                    : Number(query.data?.totalPages ?? 1)
                }
                totalCount={
                  filters.lowStockOnly ? lowStockItems.length : Number(query.data?.totalCount ?? 0)
                }
                pageSize={filters.pageSize}
                onChange={(page) => setFilters({ ...filters, page })}
              />
            </Card>
          )}
        </>
      )}
      {dialog && <MovementDialog mode={dialog} onClose={() => setDialog(null)} />}
    </div>
  )
}

export function InventoryMovementsPage() {
  const [filters, setFilters] = useState<MovementFilters>({ page: 1, pageSize: 20 })
  const query = useMovements(filters)
  const products = useBalances({ page: 1, pageSize: 100 })
  const items = query.data?.items ?? []
  const update = (patch: Partial<MovementFilters>) =>
    setFilters({ ...filters, ...patch, page: patch.page ?? 1 })
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Movimientos de inventario"
        description="Historial detallado de entradas, salidas y ajustes de stock."
      />
      <nav className="flex border-b border-border" aria-label="Secciones de inventario">
        <Link className="px-4 py-3 text-text-muted" to="/inventario">
          Existencias
        </Link>
        <span className="border-b-2 border-brand-orange px-4 py-3 font-bold text-brand-orange">
          Movimientos
        </span>
      </nav>
      <Card className="grid gap-3 md:grid-cols-4">
        <FormField label="Producto">
          <Select
            value={filters.productId ?? ''}
            onChange={(e) => update({ productId: e.target.value || undefined })}
          >
            <option value="">Todos</option>
            {products.data?.items.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.productName}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Tipo">
          <Select
            value={filters.movementType ?? ''}
            onChange={(e) =>
              update({ movementType: (e.target.value || undefined) as MovementType | undefined })
            }
          >
            <option value="">Todos</option>
            {MOVEMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Desde">
          <Input
            type="date"
            value={filters.from ?? ''}
            onChange={(e) => update({ from: e.target.value || undefined })}
          />
        </FormField>
        <FormField label="Hasta">
          <Input
            type="date"
            value={filters.to ?? ''}
            onChange={(e) => update({ to: e.target.value || undefined })}
          />
        </FormField>
      </Card>
      {query.isLoading && !query.data ? (
        <p role="status">Cargando movimientos…</p>
      ) : query.error && !query.data ? (
        <Card>
          <p role="alert">No se pudo cargar el historial.</p>
          <Button onClick={() => void query.refetch()}>Reintentar</Button>
        </Card>
      ) : !items.length ? (
        <Card className="text-center">
          {filters.productId || filters.movementType || filters.from || filters.to
            ? 'No hay movimientos para estos filtros.'
            : 'Todavía no hay movimientos registrados.'}
        </Card>
      ) : (
        <Card>
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-text-muted">
                  <th className="p-3">Fecha / hora</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Motivo / referencia</th>
                  <th>Responsable</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <MovementRow key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {items.map((item) => (
              <Card key={item.id}>
                <MovementDetails item={item} />
              </Card>
            ))}
          </div>
          <Pagination
            page={filters.page}
            totalPages={Number(query.data?.totalPages ?? 1)}
            totalCount={Number(query.data?.totalCount ?? 0)}
            pageSize={filters.pageSize}
            onChange={(page) => update({ page })}
          />
        </Card>
      )}
    </div>
  )
}
function MovementDetails({ item }: { item: Movement }) {
  const n = Number(item.quantityDelta)
  return (
    <div className="grid gap-1">
      <strong>{item.productName}</strong>
      <Badge>{labelForMovement(item.movementType)}</Badge>
      <span className={n < 0 ? 'font-bold text-danger' : 'font-bold text-success'}>
        {n > 0 ? '+' : ''}
        {decimal(item.quantityDelta)} {item.inventoryUnitSymbol}
      </span>
      <span>
        {item.reason ?? item.referenceType ?? '—'}
        {item.referenceId ? ` · ${item.referenceId}` : ''}
      </span>
      <small className="text-text-muted">
        {new Date(item.createdAt).toLocaleString('es-BO')} ·{' '}
        {item.createdByDisplayName ?? 'Sistema'}
      </small>
    </div>
  )
}
function MovementRow({ item }: { item: Movement }) {
  return (
    <tr className="border-b border-border">
      <td className="p-3">{new Date(item.createdAt).toLocaleString('es-BO')}</td>
      <td className="font-bold">{item.productName}</td>
      <td>
        <Badge>{labelForMovement(item.movementType)}</Badge>
      </td>
      <td className={Number(item.quantityDelta) < 0 ? 'text-danger' : 'text-success'}>
        {Number(item.quantityDelta) > 0 ? '+' : ''}
        {decimal(item.quantityDelta)} {item.inventoryUnitSymbol}
      </td>
      <td>
        {item.reason ?? item.referenceType ?? '—'}
        {item.referenceId ? ` · ${item.referenceId}` : ''}
      </td>
      <td>{item.createdByDisplayName ?? 'Sistema'}</td>
    </tr>
  )
}
