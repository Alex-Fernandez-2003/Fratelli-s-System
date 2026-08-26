import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Input, Select, Textarea, Badge, Spinner } from '@/components/atoms'
import { Alert, EmptyState } from '@/components/molecules/Feedback'
import { useAuth } from '@/features/auth/AuthProvider'
import { useKitchenConnectionStatus } from '@/features/kitchen/realtime'
import { httpClient } from '@/lib/api/http-client'
import type { components } from '@/types/api.generated'
import {
  useAssignOrder,
  useCancelOrder,
  useCreateOrder,
  useDeliverOrder,
  useOrder,
  useOrders,
  useTakeOrder,
  type OrderStatus,
} from './api'
const statuses: (OrderStatus | '')[] = [
  '',
  'PENDIENTE',
  'EN_PREPARACION',
  'LISTO',
  'ENTREGADO',
  'CANCELADO',
]
const display = (id: string) => `#${id.slice(0, 8).toUpperCase()}`
const money = (value: number | string) =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(Number(value))
const labels: Record<OrderStatus, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  LISTO: 'Listo',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}
export function OrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const realtime = useKitchenConnectionStatus()
  const q = useOrders(
    { page, pageSize: 10, status: status || undefined, search },
    realtime === 'connected',
  )
  const { user } = useAuth()
  const take = useTakeOrder()
  const [actionError, setActionError] = useState<string | null>(null)
  const navigate = useNavigate()
  if (q.isLoading) return <Spinner label="Cargando pedidos" />
  if (q.isError) return <Alert kind="error">No se pudieron cargar los pedidos.</Alert>
  const data = q.data!
  return (
    <main className="grid gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Pedidos</h1>
          <p className="text-text-muted">Gestión operativa de pedidos</p>
        </div>
        <Link to="/pedidos/nuevo">
          <Button>Nuevo pedido</Button>
        </Link>
      </header>
      <Card className="flex flex-wrap gap-3">
        <Input
          aria-label="Buscar por mesa o referencia"
          placeholder="Buscar por mesa o referencia..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
        <Select
          aria-label="Estado"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrderStatus | '')
            setPage(1)
          }}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s ? labels[s] : 'Todos'}
            </option>
          ))}
        </Select>
      </Card>
      {actionError && <Alert kind="error">{actionError}</Alert>}
      {data.items.length === 0 ? (
        <EmptyState title={search || status ? 'Sin resultados' : 'No hay pedidos'}>
          {search || status ? 'Probá limpiar los filtros.' : 'Creá el primer pedido.'}
        </EmptyState>
      ) : (
        <section className="grid gap-3">
          {data.items.map((order) => {
            const isWaiter = user?.roles.includes('MESERO')
            const canTake =
              isWaiter &&
              !order.waiterEmployeeId &&
              !['ENTREGADO', 'CANCELADO'].includes(order.status)
            return (
              <Card key={order.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <strong>{display(order.id)}</strong>
                  <p>
                    Mesa: {order.tableReference ?? 'Sin referencia'} ·{' '}
                    {order.waiterName ?? 'Sin mesero'}
                  </p>
                  <Badge
                    tone={
                      order.status === 'CANCELADO'
                        ? 'danger'
                        : order.status === 'LISTO'
                          ? 'success'
                          : 'warning'
                    }
                  >
                    {labels[order.status]}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate(`/pedidos/${order.id}`)}>
                    Ver detalle
                  </Button>
                  {canTake && (
                    <Button
                      loading={take.isPending}
                      onClick={() =>
                        take.mutate(order.id, {
                          onError: () => {
                            setActionError(
                              'Este pedido ya fue tomado o cambió de estado. Se actualizó la lista.',
                            )
                            void q.refetch()
                          },
                        })
                      }
                    >
                      Tomar pedido
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </section>
      )}
      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Anterior
        </Button>
        <span>
          Página {data.page} de {data.totalPages || 1}
        </span>
        <Button
          variant="outline"
          disabled={Number(data.page) >= Number(data.totalPages)}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </Button>
      </div>
    </main>
  )
}
export function OrderDetailPage() {
  const { id = '' } = useParams()
  const realtime = useKitchenConnectionStatus()
  const q = useOrder(id, realtime === 'connected')
  const { user } = useAuth()
  const cancel = useCancelOrder()
  const deliver = useDeliverOrder()
  const assign = useAssignOrder()
  const [reason, setReason] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  if (q.isLoading) return <Spinner label="Cargando pedido" />
  if (q.isError || !q.data)
    return (
      <EmptyState title="Pedido no encontrado">
        <Link to="/pedidos">Volver a pedidos</Link>
      </EmptyState>
    )
  const o = q.data
  const global = !!user?.roles.some((r) => r === 'ADMINISTRADOR' || r === 'ENCARGADO')
  const own = user?.employeeId === o.waiterEmployeeId
  const canCancel = (global || own) && ['PENDIENTE', 'EN_PREPARACION'].includes(o.status)
  const canDeliver = (global || own) && o.status === 'LISTO'
  return (
    <main className="grid gap-5">
      <header>
        <Link to="/pedidos">← Volver</Link>
        <h1>Pedido {display(o.id)}</h1>
        <Badge>{labels[o.status]}</Badge>
      </header>
      <Card>
        <p>Mesa / referencia: {o.tableReference ?? 'Sin referencia'}</p>
        <p>Mesero: {o.waiterName ?? 'Sin asignar'}</p>
        <p>{o.notes}</p>
      </Card>
      <Card>
        <h2>Ítems</h2>
        {o.items.map((i) => (
          <div key={i.id} className="flex justify-between border-b border-border py-2">
            <span>
              {i.quantity} × {i.productName}
              {i.notes && ` · ${i.notes}`}
            </span>
            <strong>{money(i.lineTotal)}</strong>
          </div>
        ))}
        <h3 className="text-right">Total {money(o.total)}</h3>
      </Card>
      {o.cancelledAt && (
        <Alert kind="warning">
          Cancelado por {o.cancelledByDisplayName ?? o.cancelledByUserId}. {o.cancellationReason}
        </Alert>
      )}
      {actionError && <Alert kind="error">{actionError}</Alert>}
      <div className="flex flex-wrap gap-2">
        {user?.roles.includes('ADMINISTRADOR') &&
          o.status !== 'ENTREGADO' &&
          o.status !== 'CANCELADO' && (
            <Button variant="outline" onClick={() => setAssigning(true)}>
              Asignar mesero
            </Button>
          )}
        {canDeliver && (
          <Button
            loading={deliver.isPending}
            onClick={() =>
              deliver.mutate(o.id, {
                onError: () => {
                  setActionError(
                    'El pedido ya no está listo para entregar. Se actualizó el detalle.',
                  )
                  void q.refetch()
                },
              })
            }
          >
            Marcar como entregado
          </Button>
        )}
        {canCancel && (
          <>
            <Textarea
              aria-label="Motivo de cancelación"
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Opcional, pero recomendado."
            />
            <Button
              variant="danger"
              loading={cancel.isPending}
              onClick={() =>
                cancel.mutate(
                  { id: o.id, request: { reason: reason || null } },
                  {
                    onError: () => {
                      setActionError('El pedido ya no puede cancelarse. Se actualizó el detalle.')
                      void q.refetch()
                    },
                  },
                )
              }
            >
              Confirmar cancelación
            </Button>
          </>
        )}
      </div>
      {assigning && (
        <AssignmentDialog
          currentName={o.waiterName}
          pending={assign.isPending}
          error={assignError}
          onClose={() => {
            setAssigning(false)
            setAssignError(null)
          }}
          onConfirm={(employeeId) =>
            assign.mutate(
              { id: o.id, request: { waiterEmployeeId: employeeId } },
              {
                onSuccess: () => setAssigning(false),
                onError: () => {
                  setAssignError(
                    'El pedido cambió de estado o fue asignado por otra persona. Se actualizó la información.',
                  )
                  void q.refetch()
                },
              },
            )
          }
        />
      )}
    </main>
  )
}
export function NewOrderPage() {
  const nav = useNavigate()
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<
    Record<string, { p: components['schemas']['ProductDto']; quantity: number; notes: string }>
  >({})
  const [tableReference, setTableReference] = useState('')
  const [notes, setNotes] = useState('')
  const create = useCreateOrder()
  const products = useProducts(search)
  const lines = Object.values(cart)
  const total = useMemo(
    () => lines.reduce((sum, l) => sum + Number(l.p.salePrice ?? 0) * l.quantity, 0),
    [lines],
  )
  const add = (p: components['schemas']['ProductDto']) =>
    setCart((c) => ({
      ...c,
      [p.id]: c[p.id]
        ? { ...c[p.id], quantity: c[p.id].quantity + 1 }
        : { p, quantity: 1, notes: '' },
    }))
  return (
    <main className="grid gap-5 lg:grid-cols-[1fr_24rem]">
      <section>
        <h1>Nuevo pedido</h1>
        <Input
          aria-label="Buscar producto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
        />
        {products.data?.items
          .filter((p) => p.isActive && p.isSellable && p.salePrice !== null)
          .map((p) => (
            <Card key={p.id} className="my-3">
              <strong>{p.name}</strong>
              <p>{money(p.salePrice ?? 0)}</p>
              <Button onClick={() => add(p)}>Agregar</Button>
            </Card>
          ))}
      </section>
      <Card>
        <h2>Detalle del pedido</h2>
        <Input
          aria-label="Mesa o referencia"
          value={tableReference}
          onChange={(e) => setTableReference(e.target.value)}
          placeholder="Mesa / referencia"
        />
        {lines.map((l) => (
          <div key={l.p.id} className="my-3">
            <strong>{l.p.name}</strong>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={l.quantity === 1}
                onClick={() =>
                  setCart((c) => ({ ...c, [l.p.id]: { ...l, quantity: l.quantity - 1 } }))
                }
              >
                −
              </Button>
              <span>{l.quantity}</span>
              <Button
                variant="outline"
                onClick={() =>
                  setCart((c) => ({ ...c, [l.p.id]: { ...l, quantity: l.quantity + 1 } }))
                }
              >
                +
              </Button>
              <Button
                variant="danger"
                onClick={() =>
                  setCart((c) => {
                    const n = { ...c }
                    delete n[l.p.id]
                    return n
                  })
                }
              >
                Eliminar
              </Button>
            </div>
            <Input
              aria-label={`Notas ${l.p.name}`}
              value={l.notes}
              onChange={(e) =>
                setCart((c) => ({ ...c, [l.p.id]: { ...l, notes: e.target.value } }))
              }
            />
          </div>
        ))}
        <Textarea
          aria-label="Notas generales"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <h3>Total {money(total)}</h3>
        <Button
          fullWidth
          disabled={!lines.length}
          loading={create.isPending}
          onClick={() =>
            create.mutate(
              {
                tableReference: tableReference || null,
                notes: notes || null,
                items: lines.map((l) => ({
                  productId: l.p.id,
                  quantity: l.quantity,
                  notes: l.notes || null,
                })),
              },
              { onSuccess: (o) => nav(`/pedidos/${o.id}`) },
            )
          }
        >
          Crear pedido
        </Button>
      </Card>
    </main>
  )
}
function AssignmentDialog({
  currentName,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  currentName: string | null
  pending: boolean
  error: string | null
  onClose: () => void
  onConfirm: (employeeId: string) => void
}) {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState('')
  const [eligible, setEligible] = useState<components['schemas']['UserDto'][]>([])
  const waiters = useQuery({
    queryKey: ['users', 'waiters', page],
    queryFn: () =>
      httpClient.get<components['schemas']['PagedResponseOfUserDto']>(
        `/api/v1/users?page=${page}&pageSize=100&role=MESERO&active=true`,
      ),
  })
  useEffect(() => {
    if (waiters.data)
      setEligible((previous) => [
        ...previous,
        ...waiters.data.items.filter(
          (user) =>
            user.isActive &&
            user.roles.includes('MESERO') &&
            !previous.some((existing) => existing.employeeId === user.employeeId),
        ),
      ])
  }, [waiters.data])
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Asignar mesero"
      className="fixed inset-0 grid place-items-center bg-overlay p-4"
    >
      <Card className="w-full max-w-lg">
        <h2>Asignar mesero</h2>
        <p>Actual: {currentName ?? 'Sin asignar'}</p>
        {error && <Alert kind="error">{error}</Alert>}
        {waiters.isLoading ? (
          <Spinner />
        ) : (
          <Select
            aria-label="Mesero elegible"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Seleccioná un mesero</option>
            {eligible.map((user) => (
              <option key={user.employeeId} value={user.employeeId}>
                {user.fullName}
              </option>
            ))}
          </Select>
        )}
        {Number(waiters.data?.totalPages ?? 1) > page && (
          <Button variant="outline" onClick={() => setPage((value) => value + 1)}>
            Cargar más
          </Button>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={!selected} loading={pending} onClick={() => onConfirm(selected)}>
            Confirmar asignación
          </Button>
        </div>
      </Card>
    </div>
  )
}

function useProducts(search: string) {
  return useQuery({
    queryKey: ['products', 'orders', search],
    queryFn: () =>
      httpClient.get<components['schemas']['PagedResponseOfProductDto']>(
        `/api/v1/products?page=1&pageSize=100&search=${encodeURIComponent(search)}`,
      ),
  })
}
