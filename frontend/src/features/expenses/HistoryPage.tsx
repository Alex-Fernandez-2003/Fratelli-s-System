import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { Button, Card, Input, Select } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { DataTable, PageHeader } from '@/components/organisms'
import {
  createExpenseHistoryFilters,
  useExpenseCategories,
  useExpenseHistory,
  useExpenseHistoryFilterState,
  type CashSource,
  type ExpenseHistory,
  type ExpenseHistoryFilters,
  type ExpenseHistoryPage,
  type ExpenseShiftType,
} from './api'
import { ExpenseTabs } from './pages'

const CASH_SOURCE_LABELS: Record<CashSource, string> = {
  CASH_DRAWER: 'Caja principal',
  PETTY_CASH: 'Caja chica',
}

const SHIFT_TYPE_LABELS: Record<ExpenseShiftType, string> = {
  MORNING: 'Mañana',
  NIGHT: 'Noche',
}

export const EXPENSE_CASH_SOURCE_OPTIONS = [
  { value: 'CASH_DRAWER', label: CASH_SOURCE_LABELS.CASH_DRAWER },
  { value: 'PETTY_CASH', label: CASH_SOURCE_LABELS.PETTY_CASH },
] as const

export const EXPENSE_SHIFT_TYPE_OPTIONS = [
  { value: 'MORNING', label: SHIFT_TYPE_LABELS.MORNING },
  { value: 'NIGHT', label: SHIFT_TYPE_LABELS.NIGHT },
] as const

const pageSize = 25

const money = (value: number | string) => `Bs. ${Number(value).toFixed(2)}`

const expenseDate = (value: string) =>
  new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'short',
    timeZone: 'America/La_Paz',
  }).format(new Date(`${value}T12:00:00Z`))

const categoryName = (expense: ExpenseHistory) => expense.expenseCategoryName ?? 'Sin categoría'
const responsibleName = (expense: ExpenseHistory) => expense.responsibleDisplayName ?? '—'
const shiftName = (expense: ExpenseHistory) =>
  expense.shiftType ? SHIFT_TYPE_LABELS[expense.shiftType] : '—'

export function isExpenseHistoryFiltered(
  filters: ExpenseHistoryFilters,
  defaults: ExpenseHistoryFilters,
) {
  return Boolean(
    filters.from !== defaults.from ||
    filters.to !== defaults.to ||
    filters.categoryId ||
    filters.cashSource ||
    filters.shiftType ||
    filters.responsible?.trim(),
  )
}

function updateFilter<T extends keyof Omit<ExpenseHistoryFilters, 'page' | 'pageSize'>>(
  update: (filters: Partial<Omit<ExpenseHistoryFilters, 'page' | 'pageSize'>>) => void,
  key: T,
  value: ExpenseHistoryFilters[T],
) {
  update({ [key]: value } as Partial<Omit<ExpenseHistoryFilters, 'page' | 'pageSize'>>)
}

function ExpenseMetrics({ data, isLoading }: { data?: ExpenseHistoryPage; isLoading: boolean }) {
  const value = (amount: number | string | undefined) =>
    amount === undefined ? (isLoading ? '…' : '—') : money(amount)

  return (
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumen de gastos">
      <Card data-testid="expense-total-amount">
        <p className="m-0 text-sm text-text-muted">Total de gastos</p>
        <strong className="text-2xl">{value(data?.totalAmount)}</strong>
      </Card>
      <Card data-testid="expense-cash-drawer-total">
        <p className="m-0 text-sm text-text-muted">Caja principal</p>
        <strong className="text-2xl">{value(data?.cashDrawerTotal)}</strong>
      </Card>
      <Card data-testid="expense-petty-cash-total">
        <p className="m-0 text-sm text-text-muted">Caja chica</p>
        <strong className="text-2xl">{value(data?.pettyCashTotal)}</strong>
      </Card>
    </section>
  )
}

function HistoryPagination({
  filters,
  totalCount,
  totalPages,
  setPage,
}: {
  filters: ExpenseHistoryFilters
  totalCount: number
  totalPages: number
  setPage: (page: number) => void
}) {
  const currentPage = Number(filters.page ?? 1)
  const currentPageSize = Number(filters.pageSize ?? pageSize)
  const first = totalCount ? (currentPage - 1) * currentPageSize + 1 : 0
  const last = Math.min(currentPage * currentPageSize, totalCount)

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
          aria-label="Página anterior del historial de gastos"
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
          aria-label="Página siguiente del historial de gastos"
          className="min-h-11"
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

export function HistoryPage() {
  const { filters, updateFilters, setPage, clearFilters } = useExpenseHistoryFilterState()
  const defaultFilters = useMemo(() => createExpenseHistoryFilters(), [])
  const history = useExpenseHistory(filters)
  const categories = useExpenseCategories()
  const items = history.data?.items ?? []
  const isFiltered = isExpenseHistoryFiltered(filters, defaultFilters)
  const totalCount = Number(history.data?.totalCount ?? 0)
  const totalPages = Math.max(1, Number(history.data?.totalPages ?? 1))

  const columns = [
    {
      id: 'date',
      header: 'Fecha',
      cell: (expense: ExpenseHistory) => expenseDate(expense.expenseDate),
    },
    { id: 'category', header: 'Categoría', cell: categoryName },
    {
      id: 'source',
      header: 'Fuente de dinero',
      cell: (expense: ExpenseHistory) => CASH_SOURCE_LABELS[expense.cashSource],
    },
    { id: 'shift', header: 'Turno', cell: shiftName },
    { id: 'responsible', header: 'Responsable', cell: responsibleName },
    {
      id: 'description',
      header: 'Descripción',
      cell: (expense: ExpenseHistory) => expense.description,
    },
    { id: 'amount', header: 'Monto', cell: (expense: ExpenseHistory) => money(expense.amount) },
  ]

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        title="Historial de gastos"
        description="Consultá los egresos registrados dentro del período seleccionado."
      />
      <ExpenseTabs />
      <ExpenseMetrics data={history.data} isLoading={history.isLoading} />

      <Card className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-5">
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
        <FormField label="Categoría">
          <Select
            value={filters.categoryId ?? ''}
            disabled={categories.isLoading}
            onChange={(event) =>
              updateFilter(updateFilters, 'categoryId', event.target.value || undefined)
            }
          >
            <option value="">Todas</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Fuente de dinero">
          <Select
            value={filters.cashSource ?? ''}
            onChange={(event) =>
              updateFilter(
                updateFilters,
                'cashSource',
                (event.target.value || undefined) as CashSource | undefined,
              )
            }
          >
            <option value="">Todas</option>
            {EXPENSE_CASH_SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Turno">
          <Select
            value={filters.shiftType ?? ''}
            onChange={(event) =>
              updateFilter(
                updateFilters,
                'shiftType',
                (event.target.value || undefined) as ExpenseShiftType | undefined,
              )
            }
          >
            <option value="">Todos</option>
            {EXPENSE_SHIFT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Responsable">
          <Input
            value={filters.responsible ?? ''}
            placeholder="Nombre o usuario"
            onChange={(event) => updateFilter(updateFilters, 'responsible', event.target.value)}
          />
        </FormField>
        <Button variant="ghost" onClick={clearFilters} className="justify-self-start">
          Limpiar filtros
        </Button>
        {categories.isError && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-warning" role="alert">
            <span>No se pudieron cargar las categorías.</span>
            <Button variant="ghost" size="sm" onClick={() => void categories.refetch()}>
              Reintentar categorías
            </Button>
          </div>
        )}
      </Card>

      {history.isLoading && !history.data ? (
        <Card>
          <p role="status">Cargando historial de gastos…</p>
        </Card>
      ) : history.isError || history.error ? (
        <Card>
          <p role="alert">No se pudo cargar el historial de gastos.</p>
          <Button onClick={() => void history.refetch()}>Reintentar</Button>
        </Card>
      ) : !items.length ? (
        <Card className="text-center">
          <p>
            {isFiltered
              ? 'No hay gastos para los filtros seleccionados.'
              : 'No hay gastos registrados para este período.'}
          </p>
          {isFiltered && (
            <Button variant="outline" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          )}
        </Card>
      ) : (
        <Card aria-busy={history.isFetching}>
          <div className="hidden md:block">
            <DataTable columns={columns} rows={items} getRowId={(expense) => expense.id} />
          </div>
          <div className="grid gap-3 md:hidden">
            {items.map((expense) => (
              <Card key={expense.id} className="grid min-w-0 gap-2">
                <div className="flex flex-wrap justify-between gap-2">
                  <strong className="break-words">{categoryName(expense)}</strong>
                  <strong>{money(expense.amount)}</strong>
                </div>
                <span>Fecha: {expenseDate(expense.expenseDate)}</span>
                <span className="break-words">{expense.description}</span>
                <span>Fuente: {CASH_SOURCE_LABELS[expense.cashSource]}</span>
                <span>Turno: {shiftName(expense)}</span>
                <span className="break-words">Responsable: {responsibleName(expense)}</span>
              </Card>
            ))}
          </div>
          <HistoryPagination
            filters={filters}
            totalCount={totalCount}
            totalPages={totalPages}
            setPage={setPage}
          />
        </Card>
      )}
      {history.isFetching && history.data && !history.error && (
        <p className="text-sm text-text-muted" role="status">
          Actualizando historial…
        </p>
      )}
    </div>
  )
}
