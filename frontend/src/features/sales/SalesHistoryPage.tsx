import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, Input, Select } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { DataTable, PageHeader } from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import type { components } from '@/types/api.generated'
import {
  salesHistoryScope,
  type SalesHistoryFilters,
  useSalesHistory,
  useSalesHistoryFilterState,
} from './api'
import { SaleDetailOverlay } from './SaleDetailOverlay'

type SaleHistory = components['schemas']['SalesHistoryDto']
type PaymentMethod = components['schemas']['PaymentMethod']
type SalesChannel = components['schemas']['SalesChannel']

const paymentLabels: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  QR: 'QR',
  EXTERNAL: 'Pago externo',
}
const channelLabels: Record<SalesChannel, string> = {
  DIRECT: 'Directo',
  PEDIDOSYA: 'PedidosYa',
}
const pageSize = 25

const customerName = (sale: SaleHistory) => sale.customerNameSnapshot ?? 'Consumidor final'
const money = (amount: number | string) =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(Number(amount))
const dateTime = (value: string) =>
  new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/La_Paz',
  }).format(new Date(value))

function updateFilter<T extends keyof SalesHistoryFilters>(
  update: (filters: Partial<Omit<SalesHistoryFilters, 'page'>>) => void,
  key: T,
  value: SalesHistoryFilters[T],
) {
  update({ [key]: value } as Partial<Omit<SalesHistoryFilters, 'page'>>)
}

export function SalesHistoryPage() {
  const { user } = useAuth()
  const { filters, updateFilters, setPage } = useSalesHistoryFilterState()
  const query = useSalesHistory(filters)
  const [selectedSaleId, setSelectedSaleId] = useState<string>()
  const scope = salesHistoryScope(user?.roles ?? [])
  const isBroad = scope === 'broad'
  const items = query.data?.items ?? []
  const totalCount = Number(query.data?.totalCount ?? 0)
  const totalPages = Math.max(1, Number(query.data?.totalPages ?? 1))
  const first = totalCount
    ? (Number(filters.page) - 1) * Number(filters.pageSize ?? pageSize) + 1
    : 0
  const last = Math.min(Number(filters.page) * Number(filters.pageSize ?? pageSize), totalCount)
  const columns = [
    { id: 'date', header: 'Fecha y hora', cell: (sale: SaleHistory) => dateTime(sale.confirmedAt) },
    { id: 'shift', header: 'Turno', cell: (sale: SaleHistory) => sale.shiftType },
    { id: 'customer', header: 'Cliente', cell: customerName },
    {
      id: 'channel',
      header: 'Canal',
      cell: (sale: SaleHistory) => channelLabels[sale.salesChannel],
    },
    {
      id: 'payment',
      header: 'Pago',
      cell: (sale: SaleHistory) => paymentLabels[sale.paymentMethod],
    },
    { id: 'total', header: 'Total', cell: (sale: SaleHistory) => money(sale.total) },
  ]
  const detailAction = (sale: SaleHistory) => (
    <Button
      size="sm"
      variant="outline"
      aria-pressed={selectedSaleId === sale.id}
      onClick={() => setSelectedSaleId(sale.id)}
    >
      Ver detalle de {sale.id}
    </Button>
  )

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Historial de ventas"
        description="Consultá las ventas confirmadas dentro de tu alcance autorizado."
      />
      <Card className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
        <FormField label="Buscar cliente" leadingIcon={<Search size={16} />}>
          <Input
            value={filters.customerSearch ?? ''}
            placeholder="Cliente histórico"
            onChange={(event) => updateFilter(updateFilters, 'customerSearch', event.target.value)}
          />
        </FormField>
        <FormField label="Método de pago">
          <Select
            value={filters.paymentMethod ?? ''}
            onChange={(event) =>
              updateFilter(
                updateFilters,
                'paymentMethod',
                (event.target.value || undefined) as PaymentMethod | undefined,
              )
            }
          >
            <option value="">Todos</option>
            {Object.entries(paymentLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Canal">
          <Select
            value={filters.salesChannel ?? ''}
            onChange={(event) =>
              updateFilter(
                updateFilters,
                'salesChannel',
                (event.target.value || undefined) as SalesChannel | undefined,
              )
            }
          >
            <option value="">Todos</option>
            {Object.entries(channelLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
        {isBroad && (
          <FormField label="Turno">
            <Input
              value={filters.shiftId ?? ''}
              placeholder="ID de turno"
              onChange={(event) =>
                updateFilter(updateFilters, 'shiftId', event.target.value || undefined)
              }
            />
          </FormField>
        )}
      </Card>
      {query.isLoading && !query.data ? (
        <p role="status">Cargando historial de ventas…</p>
      ) : query.error ? (
        <Card>
          <p role="alert">No se pudo cargar el historial de ventas.</p>
          <Button onClick={() => void query.refetch()}>Reintentar</Button>
        </Card>
      ) : !items.length ? (
        <Card className="text-center">
          <p>No hay ventas confirmadas para estos filtros.</p>
        </Card>
      ) : (
        <Card>
          <div className="hidden md:block">
            <DataTable
              columns={columns}
              rows={items}
              getRowId={(sale) => sale.id}
              actions={detailAction}
            />
          </div>
          <div className="grid gap-3 md:hidden">
            {items.map((sale) => (
              <Card key={sale.id} className="grid gap-2">
                <div className="flex flex-wrap justify-between gap-2">
                  <strong>{customerName(sale)}</strong>
                  <span>{money(sale.total)}</span>
                </div>
                <span>{dateTime(sale.confirmedAt)}</span>
                <span>Turno: {sale.shiftType}</span>
                <span>Canal: {channelLabels[sale.salesChannel]}</span>
                <span>Pago: {paymentLabels[sale.paymentMethod]}</span>
                <span className="text-sm text-text-muted">ID: {sale.id}</span>
                {detailAction(sale)}
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
                disabled={Number(filters.page) <= 1}
                onClick={() => setPage(Number(filters.page) - 1)}
                leftIcon={<ChevronLeft size={16} />}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={Number(filters.page) >= totalPages}
                onClick={() => setPage(Number(filters.page) + 1)}
                rightIcon={<ChevronRight size={16} />}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      )}
      <SaleDetailOverlay saleId={selectedSaleId} onClose={() => setSelectedSaleId(undefined)} />
    </div>
  )
}
