import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { DataTable, PageHeader, type DataTableColumn } from '@/components/organisms'
import {
  createCashClosingHistoryFilters,
  cashHistoryErrorMessage,
  useCashClosingHistory,
  useCashClosingHistoryFilterState,
  type CashClosingDto,
  type CashClosingHistoryFilters,
} from './api'
import { CashClosingDetailOverlay } from './CashClosingDetailOverlay'
import {
  differenceKind,
  differenceSemantic,
  formatBusinessDateLong,
  formatDateTime,
  formatMoneyOrDash,
  formatSignedMoney,
} from './format'

export function isCashClosingHistoryFiltered(
  filters: CashClosingHistoryFilters,
  defaults: CashClosingHistoryFilters,
) {
  return filters.from !== defaults.from || filters.to !== defaults.to
}

function DifferenceValue({ difference }: { difference: number | string | null | undefined }) {
  const amount =
    difference === null ||
    difference === undefined ||
    (typeof difference === 'string' && difference.trim() === '')
      ? Number.NaN
      : Number(difference)
  if (!Number.isFinite(amount)) {
    return (
      <span className="font-bold" data-testid="cash-closing-difference">
        —
      </span>
    )
  }

  const kind = differenceKind(amount)
  const tone =
    kind === 'positive' ? 'text-success' : kind === 'negative' ? 'text-danger' : 'text-text'
  return (
    <span className={`font-bold ${tone}`} data-testid="cash-closing-difference">
      {differenceSemantic(amount)} · {formatSignedMoney(amount)}
    </span>
  )
}

function ActorValue({ actorId }: { actorId: string | null | undefined }) {
  return actorId ? (
    <span className="block max-w-48 break-all" title={actorId}>
      {actorId}
    </span>
  ) : (
    <span>—</span>
  )
}

function ClosingAction({
  closing,
  onSelect,
}: {
  closing: CashClosingDto
  onSelect: (id: string) => void
}) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => onSelect(closing.id)}
      aria-label={`Ver detalle de cierre del ${closing.businessDate}`}
    >
      Ver detalle
    </Button>
  )
}

function HistoryPagination({
  filters,
  totalCount,
  totalPages,
  setPage,
}: {
  filters: CashClosingHistoryFilters
  totalCount: number
  totalPages: number
  setPage: (page: number) => void
}) {
  const currentPage = Number(filters.page ?? 1)
  const currentPageSize = Number(filters.pageSize ?? 25)
  const first = totalCount ? (currentPage - 1) * currentPageSize + 1 : 0
  const last = Math.min(currentPage * currentPageSize, totalCount)
  const safeTotalPages = Math.max(1, totalPages)

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-text-muted">
      <span>
        Mostrando {first}–{last} de {totalCount}
      </span>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => setPage(currentPage - 1)}
          leftIcon={<ChevronLeft size={16} />}
          aria-label="Página anterior del historial de cierres"
          className="min-h-11"
        >
          Anterior
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= safeTotalPages}
          onClick={() => setPage(currentPage + 1)}
          rightIcon={<ChevronRight size={16} />}
          aria-label="Página siguiente del historial de cierres"
          className="min-h-11"
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

export function CashClosingHistoryPage() {
  const { filters, updateFilters, setPage, clearFilters } = useCashClosingHistoryFilterState()
  const defaults = useMemo(() => createCashClosingHistoryFilters(), [])
  const history = useCashClosingHistory(filters)
  const [selectedClosingId, setSelectedClosingId] = useState<string>()
  const items = history.data?.items ?? []
  const totalCount = Number(history.data?.totalCount ?? 0)
  const totalPages = Number(history.data?.totalPages ?? 0)
  const safeTotalPages = Math.max(1, totalPages)
  const isFiltered = isCashClosingHistoryFiltered(filters, defaults)

  useEffect(() => {
    if (!history.data) return
    const currentPage = Number(filters.page ?? 1)
    if (currentPage > safeTotalPages) setPage(safeTotalPages)
  }, [filters.page, history.data, safeTotalPages, setPage])

  const columns: DataTableColumn<CashClosingDto>[] = [
    {
      id: 'businessDate',
      header: 'Fecha de negocio',
      cell: (closing) => formatBusinessDateLong(closing.businessDate),
    },
    {
      id: 'actor',
      header: 'Responsable',
      cell: (closing) => <ActorValue actorId={closing.closedByUserId} />,
    },
    {
      id: 'closedAt',
      header: 'Cerrado a las',
      cell: (closing) => formatDateTime(closing.closedAt),
    },
    {
      id: 'expected',
      header: 'Esperado',
      cell: (closing) => formatMoneyOrDash(closing.expectedCash),
    },
    {
      id: 'declared',
      header: 'Declarado',
      cell: (closing) => formatMoneyOrDash(closing.declaredCash),
    },
    {
      id: 'difference',
      header: 'Diferencia',
      cell: (closing) => <DifferenceValue difference={closing.difference} />,
    },
  ]

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        title="Cierres de caja"
        description="Consultá los cierres finales registrados dentro del período seleccionado."
      />

      <Card className="grid min-w-0 gap-3">
        <fieldset className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <legend className="col-span-full font-bold">Período</legend>
          <FormField label="Desde">
            <Input
              type="date"
              value={filters.from ?? ''}
              onChange={(event) => updateFilters({ from: event.target.value || undefined })}
            />
          </FormField>
          <FormField label="Hasta">
            <Input
              type="date"
              value={filters.to ?? ''}
              onChange={(event) => updateFilters({ to: event.target.value || undefined })}
            />
          </FormField>
          <div className="flex items-end">
            <Button variant="ghost" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </fieldset>
      </Card>

      {history.isLoading && !history.data ? (
        <Card aria-busy="true">
          <p role="status">Cargando historial de cierres…</p>
        </Card>
      ) : history.error ? (
        <Card>
          <p role="alert">{cashHistoryErrorMessage(history.error)}</p>
          <Button variant="outline" onClick={() => void history.refetch()}>
            Reintentar
          </Button>
        </Card>
      ) : !items.length ? (
        <Card className="text-center">
          <p>
            {isFiltered
              ? 'No se encontraron cierres con los filtros aplicados.'
              : 'No hay cierres registrados en el período seleccionado.'}
          </p>
          {isFiltered && (
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </Card>
      ) : (
        <Card aria-busy={history.isFetching}>
          <div className="hidden min-w-0 md:block" data-testid="cash-closing-table">
            <DataTable
              columns={columns}
              rows={items}
              getRowId={(closing) => closing.id}
              actions={(closing) => (
                <ClosingAction closing={closing} onSelect={setSelectedClosingId} />
              )}
            />
          </div>
          <div className="grid gap-3 md:hidden" data-testid="cash-closing-mobile">
            {items.map((closing) => (
              <Card key={closing.id} className="grid min-w-0 gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <strong className="break-words">
                    {formatBusinessDateLong(closing.businessDate)}
                  </strong>
                  <DifferenceValue difference={closing.difference} />
                </div>
                <span className="break-all">Responsable: {closing.closedByUserId || '—'}</span>
                <span>Cerrado a las: {formatDateTime(closing.closedAt)}</span>
                <span>Esperado: {formatMoneyOrDash(closing.expectedCash)}</span>
                <span>Declarado: {formatMoneyOrDash(closing.declaredCash)}</span>
                <ClosingAction closing={closing} onSelect={setSelectedClosingId} />
              </Card>
            ))}
          </div>
          <HistoryPagination
            filters={filters}
            totalCount={totalCount}
            totalPages={safeTotalPages}
            setPage={setPage}
          />
        </Card>
      )}

      {history.isFetching && history.data && !history.error && (
        <p className="text-sm text-text-muted" role="status">
          Actualizando historial de cierres…
        </p>
      )}

      <CashClosingDetailOverlay
        closingId={selectedClosingId}
        onClose={() => setSelectedClosingId(undefined)}
      />
    </div>
  )
}
