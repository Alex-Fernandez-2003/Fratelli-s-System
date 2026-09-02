import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input, Select } from '../../components/atoms'
import { FormField } from '../../components/molecules'
import { DataTable, PageHeader } from '../../components/organisms'
import { useAuth } from '../auth/AuthProvider'
import { PRODUCTION_WRITE_ROLES } from '../navigation'
import {
  createProductionHistoryFilters,
  useProductionHistory,
  useProductionHistoryFilterState,
  useProductionPreparations,
  useProductionSummary,
  type ProductionHistory,
  type ProductionHistoryFilters,
} from './api'
import { ProductionDetailOverlay } from './ProductionDetailOverlay'

const pageSize = 25

const dateTime = (value: string) =>
  new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/La_Paz',
  }).format(new Date(value))

const quantity = (value: number | string) => Number(value).toLocaleString('es-BO')

function updateFilter<T extends keyof Omit<ProductionHistoryFilters, 'page' | 'pageSize'>>(
  update: (filters: Partial<Omit<ProductionHistoryFilters, 'page'>>) => void,
  key: T,
  value: ProductionHistoryFilters[T],
) {
  update({ [key]: value } as Partial<Omit<ProductionHistoryFilters, 'page'>>)
}

function SummaryCards({
  summary,
  isLoading,
}: {
  summary: ReturnType<typeof useProductionSummary>
  isLoading: boolean
}) {
  const latest = summary.data?.latestProduction
  const mostProduced = summary.data?.mostProducedPreparation
  return (
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumen de producción">
      <Card>
        <p className="m-0 text-sm text-text-muted">Producciones registradas</p>
        <strong className="text-2xl">
          {isLoading ? '…' : Number(summary.data?.productionCount ?? 0)}
        </strong>
        <p className="m-0 text-xs text-text-muted">Eventos en los filtros actuales</p>
      </Card>
      <Card>
        <p className="m-0 text-sm text-text-muted">Última producción</p>
        {latest ? (
          <div className="grid gap-1">
            <strong>{latest.productName}</strong>
            <span className="text-sm">Lote: {latest.batchCode}</span>
            <span className="text-xs text-text-muted">{dateTime(latest.producedAt)}</span>
          </div>
        ) : (
          <strong>{isLoading ? 'Cargando…' : 'Sin registros'}</strong>
        )}
      </Card>
      <Card>
        <p className="m-0 text-sm text-text-muted">Preparación más producida</p>
        {mostProduced ? (
          <div className="grid gap-1">
            <strong>{mostProduced.productName}</strong>
            <span className="text-sm">{Number(mostProduced.productionCount)} eventos</span>
          </div>
        ) : (
          <strong>{isLoading ? 'Cargando…' : 'Sin registros'}</strong>
        )}
      </Card>
    </section>
  )
}

export function HistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { filters, updateFilters, setPage, clearFilters } = useProductionHistoryFilterState()
  const defaultFilters = useMemo(() => createProductionHistoryFilters(), [])
  const history = useProductionHistory(filters)
  const summaryFilters = useMemo(() => {
    const values = { ...filters }
    delete values.page
    delete values.pageSize
    return values
  }, [filters])
  const summary = useProductionSummary(summaryFilters)
  const preparations = useProductionPreparations()
  const [selectedProductionId, setSelectedProductionId] = useState<string>()
  const items = history.data?.items ?? []
  const totalCount = Number(history.data?.totalCount ?? 0)
  const totalPages = Math.max(1, Number(history.data?.totalPages ?? 1))
  const currentPage = Number(filters.page)
  const currentPageSize = Number(filters.pageSize ?? pageSize)
  const first = totalCount ? (currentPage - 1) * currentPageSize + 1 : 0
  const last = Math.min(currentPage * currentPageSize, totalCount)
  const canRegister = (user?.roles ?? []).some((role) =>
    PRODUCTION_WRITE_ROLES.includes(role as (typeof PRODUCTION_WRITE_ROLES)[number]),
  )

  const columns = [
    {
      id: 'date',
      header: 'Fecha y hora',
      cell: (item: ProductionHistory) => dateTime(item.producedAt),
    },
    { id: 'product', header: 'Preparación', cell: (item: ProductionHistory) => item.productName },
    {
      id: 'quantity',
      header: 'Cantidad',
      cell: (item: ProductionHistory) => `${quantity(item.quantityProduced)} ${item.unitSymbol}`,
    },
    { id: 'batch', header: 'Lote', cell: (item: ProductionHistory) => item.batchCode },
    {
      id: 'responsible',
      header: 'Responsable',
      cell: (item: ProductionHistory) => item.responsibleName ?? '—',
    },
  ]
  const detailAction = (item: ProductionHistory) => (
    <Button
      size="sm"
      variant="outline"
      aria-pressed={selectedProductionId === item.id}
      onClick={() => setSelectedProductionId(item.id)}
    >
      Ver detalle de {item.batchCode}
    </Button>
  )

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        title="Historial de producción"
        description="Consulta las producciones registradas y sus consumos persistidos."
        actions={
          canRegister ? (
            <Button variant="primary" onClick={() => navigate('/produccion/registrar')}>
              Registrar producción
            </Button>
          ) : undefined
        }
      />

      <SummaryCards summary={summary} isLoading={summary.isLoading} />
      {summary.error && (
        <Card>
          <p role="alert">No se pudo cargar el resumen de producción.</p>
          <Button variant="outline" onClick={() => void summary.refetch()}>
            Reintentar resumen
          </Button>
        </Card>
      )}

      <Card className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Preparación / producto">
          <Select
            value={filters.productId ?? ''}
            onChange={(event) =>
              updateFilter(updateFilters, 'productId', event.target.value || undefined)
            }
          >
            <option value="">Todas</option>
            {preparations.data?.items.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Desde">
          <Input
            type="date"
            value={filters.from ?? ''}
            onChange={(event) =>
              updateFilter(updateFilters, 'from', event.target.value || undefined)
            }
          />
        </FormField>
        <FormField label="Hasta">
          <Input
            type="date"
            value={filters.to ?? ''}
            onChange={(event) => updateFilter(updateFilters, 'to', event.target.value || undefined)}
          />
        </FormField>
        <FormField label="Responsable" leadingIcon={<Search size={16} />}>
          <Input
            value={filters.responsible ?? ''}
            placeholder="Nombre o usuario"
            onChange={(event) => updateFilter(updateFilters, 'responsible', event.target.value)}
          />
        </FormField>
        <FormField label="Código de lote">
          <Input
            value={filters.batchCode ?? ''}
            placeholder="BatchCode"
            onChange={(event) => updateFilter(updateFilters, 'batchCode', event.target.value)}
          />
        </FormField>
        <div className="flex items-end">
          <Button variant="ghost" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      </Card>

      {history.isLoading && !history.data ? (
        <p role="status">Cargando historial de producción…</p>
      ) : history.error ? (
        <Card>
          <p role="alert">No se pudo cargar el historial de producción.</p>
          <Button onClick={() => void history.refetch()}>Reintentar</Button>
        </Card>
      ) : !items.length ? (
        <Card className="text-center">
          <p>
            {filters.productId ||
            filters.batchCode ||
            filters.responsible ||
            filters.from !== defaultFilters.from ||
            filters.to !== defaultFilters.to
              ? 'No hay producciones para los filtros seleccionados.'
              : 'No hay producciones registradas para este período.'}
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </Card>
      ) : (
        <Card>
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              rows={items}
              getRowId={(item) => item.id}
              actions={detailAction}
            />
          </div>
          <div className="grid gap-3 md:hidden">
            {items.map((item) => (
              <Card key={item.id} className="grid min-w-0 gap-2">
                <div className="flex flex-wrap justify-between gap-2">
                  <strong className="break-words">{item.productName}</strong>
                  <span>
                    {quantity(item.quantityProduced)} {item.unitSymbol}
                  </span>
                </div>
                <span>{dateTime(item.producedAt)}</span>
                <span className="break-all">Lote: {item.batchCode}</span>
                <span className="break-words">Responsable: {item.responsibleName ?? '—'}</span>
                {detailAction(item)}
              </Card>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-text-muted">
            <span>
              Mostrando {first}–{last} de {totalCount}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                leftIcon={<ChevronLeft size={16} />}
                aria-label="Página anterior del historial de producción"
                className="min-h-11"
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
                rightIcon={<ChevronRight size={16} />}
                aria-label="Página siguiente del historial de producción"
                className="min-h-11"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      )}
      <ProductionDetailOverlay
        productionId={selectedProductionId}
        onClose={() => setSelectedProductionId(undefined)}
      />
    </div>
  )
}
