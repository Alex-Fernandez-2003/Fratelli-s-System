import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Alert, EmptyState } from '@/components/molecules/Feedback'
import { Button, Card, Input, Select, Spinner } from '@/components/atoms'
import { Modal } from '@/components/organisms'
import { CustomerForm } from '@/features/customers/CustomerForm'
import { type Customer, useCreateCustomer, useCustomers } from '@/features/customers/api'
import { useAuth } from '@/features/auth/AuthProvider'
import { HttpError } from '@/lib/api/http-client'
import { useOrder } from '@/features/orders/api'
import { useConfirmSale } from './api'
const money = (v: number | string) =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(Number(v))
type Shortage = { productName: string; shortageQuantity: number; inventoryUnitSymbol?: string }
const shortage = (error: unknown): Shortage[] | null =>
  error instanceof HttpError &&
  error.problem &&
  (error.problem as Record<string, unknown>).code === 'SALE_STOCK_CONFIRMATION_REQUIRED'
    ? (((error.problem as Record<string, unknown>).shortages as Shortage[]) ?? [])
    : null
export function CheckoutPage() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const q = useOrder(id)
  const sale = useConfirmSale()
  const [channel, setChannel] = useState<'DIRECT' | 'PEDIDOSYA'>('DIRECT')
  const [payment, setPayment] = useState<'CASH' | 'QR' | 'EXTERNAL'>('CASH')
  const [shortages, setShortages] = useState<Shortage[] | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [customerError, setCustomerError] = useState<unknown>()
  const [customerUnavailable, setCustomerUnavailable] = useState(false)
  const { user } = useAuth()
  const customers = useCustomers({ page: 1, pageSize: 50, isActive: true, search: customerSearch })
  const createCustomer = useCreateCustomer()
  const canCreateCustomer =
    user?.roles.some((role) => ['ADMINISTRADOR', 'ENCARGADO', 'MESERO'].includes(role)) ?? false
  const [success, setSuccess] =
    useState<ReturnType<typeof sale.mutateAsync> extends Promise<infer T> ? T : null>(null)
  if (q.isLoading) return <Spinner label="Cargando pedido" />
  if (q.isError || !q.data)
    return (
      <EmptyState title="Pedido no encontrado">
        <Link to="/pedidos">Volver a pedidos</Link>
      </EmptyState>
    )
  const o = q.data
  if (o.status !== 'ENTREGADO')
    return (
      <EmptyState title="Pedido no elegible para cobro">
        <Link to={`/pedidos/${id}`}>Volver al pedido</Link>
      </EmptyState>
    )
  const submit = (acknowledgeStockShortage = false) =>
    sale.mutate(
      {
        orderId: o.id,
        salesChannel: channel,
        paymentMethod: payment,
        acknowledgeStockShortage,
        customerId: selectedCustomer?.id ?? null,
      },
      {
        onSuccess: (value) => {
          setShortages(null)
          setSuccess(value)
        },
        onError: (e) => {
          const x = shortage(e)
          if (x) setShortages(x)
          const problem = e instanceof HttpError ? e.problem : undefined
          if (problem && /CUSTOMER.*INACTIVE/i.test(problem.code ?? '')) {
            setSelectedCustomer(null)
            setCustomerUnavailable(true)
            void customers.refetch()
          }
        },
      },
    )
  const saveCustomer = async (request: Parameters<typeof createCustomer.mutateAsync>[0]) => {
    try {
      const customer = (await createCustomer.mutateAsync(request)) as Customer
      setSelectedCustomer(customer)
      setCustomerError(undefined)
      setQuickCreateOpen(false)
    } catch (error) {
      setCustomerError(error)
    }
  }
  return (
    <main className="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <section className="grid gap-4">
        <header>
          <Link to={`/pedidos/${id}`}>← Volver al pedido</Link>
          <h1>Confirmar venta #{o.id.slice(0, 8).toUpperCase()}</h1>
          <p>Estado: ENTREGADO</p>
          {o.tableReference && <p>Mesa / referencia: {o.tableReference}</p>}
        </header>
        <Card>
          <h2>Ítems</h2>
          {o.items.map((i) => (
            <div key={i.id} className="flex justify-between border-b border-border py-2">
              <span>
                {i.quantity} × {i.productName}
              </span>
              <strong>{money(i.lineTotal)}</strong>
            </div>
          ))}
          <h3 className="text-right">Total {money(o.total)}</h3>
        </Card>
      </section>
      <Card className="grid content-start gap-3">
        <label>
          Buscar cliente
          <Input
            aria-label="Buscar cliente"
            value={customerSearch}
            placeholder="Nombre, CI o NIT"
            onChange={(event) => setCustomerSearch(event.target.value)}
          />
        </label>
        <label>
          Cliente
          <Select
            aria-label="Cliente para la venta"
            value={selectedCustomer?.id ?? ''}
            onChange={(event) => {
              setCustomerUnavailable(false)
              setSelectedCustomer(
                customers.data?.items.find((customer) => customer.id === event.target.value) ??
                  null,
              )
            }}
          >
            <option value="">Consumidor final</option>
            {(customers.data?.items ?? [])
              .filter((customer) => customer.isActive)
              .map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} · CI {customer.ci}
                </option>
              ))}
          </Select>
        </label>
        {selectedCustomer && <p>Cliente seleccionado: {selectedCustomer.name}</p>}
        {customerUnavailable && (
          <Alert kind="error">El cliente seleccionado ya no está disponible.</Alert>
        )}
        {canCreateCustomer && (
          <Button type="button" variant="outline" onClick={() => setQuickCreateOpen(true)}>
            Nuevo cliente
          </Button>
        )}
        <label>
          Canal
          <Select
            aria-label="Canal de venta"
            value={channel}
            onChange={(e) => {
              const c = e.target.value as typeof channel
              setChannel(c)
              setPayment(c === 'PEDIDOSYA' ? 'EXTERNAL' : 'CASH')
            }}
          >
            <option value="DIRECT">Directo</option>
            <option value="PEDIDOSYA">PedidosYa</option>
          </Select>
        </label>
        <label>
          Método de pago
          <Select
            aria-label="Método de pago"
            value={payment}
            onChange={(e) => setPayment(e.target.value as typeof payment)}
          >
            {channel === 'DIRECT' ? (
              <>
                <option value="CASH">Efectivo</option>
                <option value="QR">QR</option>
              </>
            ) : (
              <option value="EXTERNAL">Externo</option>
            )}
          </Select>
        </label>
        <Button fullWidth loading={sale.isPending} onClick={() => submit()}>
          Confirmar venta
        </Button>
        <Button
          fullWidth
          variant="outline"
          disabled={sale.isPending}
          onClick={() => nav(`/pedidos/${id}`)}
        >
          Cancelar cobro
        </Button>
      </Card>
      <Modal
        open={quickCreateOpen}
        title="Nuevo cliente"
        onClose={() => {
          setQuickCreateOpen(false)
          setCustomerError(undefined)
        }}
      >
        <CustomerForm
          pending={createCustomer.isPending}
          serverError={customerError}
          onSubmit={(request) => void saveCustomer(request)}
          onCancel={() => {
            setQuickCreateOpen(false)
            setCustomerError(undefined)
          }}
        />
      </Modal>
      {shortages && (
        <ShortageDialog
          shortages={shortages}
          pending={sale.isPending}
          onClose={() => setShortages(null)}
          onContinue={() => submit(true)}
        />
      )}{' '}
      {success && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Venta confirmada"
          className="fixed inset-0 grid place-items-center bg-overlay p-4"
        >
          <Card className="grid gap-3">
            <h2>Venta confirmada</h2>
            <p>La venta se registró correctamente.</p>
            <p>
              Venta #{success.id.slice(0, 8).toUpperCase()} · {money(success.total)}
            </p>
            <Button onClick={() => nav('/pedidos')}>Volver a pedidos</Button>
          </Card>
        </div>
      )}
    </main>
  )
}
export function ShortageDialog({
  shortages,
  pending,
  onClose,
  onContinue,
}: {
  shortages: Shortage[]
  pending: boolean
  onClose: () => void
  onContinue: () => void
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Stock insuficiente"
      className="fixed inset-0 grid place-items-center bg-overlay p-4"
    >
      <Card className="grid max-h-[90vh] w-full max-w-lg gap-3 overflow-y-auto">
        <h2>Stock insuficiente</h2>
        <Alert kind="warning">Confirmá si querés continuar pese al faltante.</Alert>
        {shortages.map((s, i) => (
          <p key={`${s.productName}-${i}`}>
            <strong>{s.productName}</strong>: Faltante {Math.max(0, Number(s.shortageQuantity))}{' '}
            {s.inventoryUnitSymbol ?? ''}
          </p>
        ))}
        <div className="flex justify-end gap-2">
          <Button variant="outline" disabled={pending} onClick={onClose}>
            Volver
          </Button>
          <Button loading={pending} onClick={onContinue}>
            Continuar
          </Button>
        </div>
      </Card>
    </div>
  )
}
