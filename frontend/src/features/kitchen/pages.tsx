import { useState } from 'react'
import { Button, Card, Badge, Spinner, Textarea } from '@/components/atoms'
import { EmptyState } from '@/components/molecules/Feedback'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  useCancelCommand,
  useCommands,
  useReadyCommand,
  useStartCommand,
  type CommandStatus,
} from './api'
import { ElapsedTime } from './ElapsedTime'
import { useKitchenConnectionStatus } from './realtime'
const groups: CommandStatus[] = ['PENDIENTE', 'EN_PREPARACION', 'LISTA']
const labels: Record<CommandStatus, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  LISTA: 'Lista',
  CANCELADA: 'Cancelada',
}
export function KitchenPage() {
  const { user } = useAuth()
  const connectionStatus = useKitchenConnectionStatus()
  const statusLabel = {
    connecting: 'Conectando...',
    connected: 'Conectado',
    reconnecting: 'Reconectando...',
    disconnected: 'Sin conexión',
  }[connectionStatus]
  const [active, setActive] = useState<CommandStatus>('PENDIENTE')
  const manage = !!user?.roles.some((r) => ['COCINA', 'ENCARGADO', 'ADMINISTRADOR'].includes(r))
  return (
    <main className="grid gap-5">
      <header>
        <h1>Cocina</h1>
        <p className="text-text-muted">Estado operativo de comandas</p>
        <Badge
          tone={
            connectionStatus === 'connected'
              ? 'success'
              : connectionStatus === 'reconnecting'
                ? 'warning'
                : 'danger'
          }
        >
          {statusLabel}
        </Badge>
      </header>
      <div className="flex gap-2 md:hidden">
        {groups.map((s) => (
          <Button
            key={s}
            variant={active === s ? 'primary' : 'outline'}
            onClick={() => setActive(s)}
          >
            {labels[s]}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {groups.map((status) => (
          <section key={status} className={active !== status ? 'hidden md:block' : ''}>
            <h2>{labels[status]}</h2>
            <CommandGroup
              status={status}
              manage={manage}
              realtimeHealthy={connectionStatus === 'connected'}
            />
          </section>
        ))}
      </div>
    </main>
  )
}
function CommandGroup({
  status,
  manage,
  realtimeHealthy,
}: {
  status: CommandStatus
  manage: boolean
  realtimeHealthy: boolean
}) {
  const q = useCommands({ page: 1, pageSize: 100, status }, realtimeHealthy)
  const start = useStartCommand()
  const ready = useReadyCommand()
  const cancel = useCancelCommand()
  const [cancelling, setCancelling] = useState<string | null>(null)
  if (q.isLoading) return <Spinner />
  if (!q.data?.items.length) return <EmptyState title="Sin comandas" />
  return (
    <div className="grid gap-3">
      {q.data.items.map((c) => {
        const origin =
          status === 'LISTA'
            ? (c.readyAt ?? c.startedAt ?? c.createdAt)
            : status === 'EN_PREPARACION'
              ? (c.startedAt ?? c.createdAt)
              : c.createdAt
        return (
          <Card key={c.id}>
            <div className="flex justify-between">
              <strong>#{c.id.slice(0, 8).toUpperCase()}</strong>
              <Badge>{labels[c.status]}</Badge>
            </div>
            <p>
              Mesa: {c.tableReference ?? 'Sin referencia'} · <ElapsedTime origin={origin} />
            </p>
            {c.items.map((i) => (
              <p key={i.orderItemId}>
                {i.quantity} × {i.productName}
                {i.notes && ` · ${i.notes}`}
              </p>
            ))}
            {manage && (
              <div className="mt-3 flex flex-wrap gap-2">
                {status === 'PENDIENTE' && (
                  <Button loading={start.isPending} onClick={() => start.mutate(c.id)}>
                    Iniciar preparación
                  </Button>
                )}
                {status === 'EN_PREPARACION' && (
                  <Button loading={ready.isPending} onClick={() => ready.mutate(c.id)}>
                    Marcar lista
                  </Button>
                )}
                {status !== 'LISTA' && (
                  <Button
                    variant="danger"
                    loading={cancel.isPending}
                    onClick={() => setCancelling(c.id)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            )}
          </Card>
        )
      })}
      {cancelling && (
        <KitchenCancelDialog
          pending={cancel.isPending}
          onClose={() => setCancelling(null)}
          onConfirm={(reason) =>
            cancel.mutate(
              { id: cancelling, request: { reason } },
              { onSuccess: () => setCancelling(null) },
            )
          }
        />
      )}
    </div>
  )
}

function KitchenCancelDialog({
  pending,
  onClose,
  onConfirm,
}: {
  pending: boolean
  onClose: () => void
  onConfirm: (reason: string | null) => void
}) {
  const [reason, setReason] = useState('')
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cancelar comanda"
      className="fixed inset-0 grid place-items-center bg-overlay p-4"
    >
      <Card className="w-full max-w-lg">
        <h2>Cancelar comanda</h2>
        <Textarea
          aria-label="Motivo de cancelación de comanda"
          value={reason}
          maxLength={500}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Motivo opcional"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Volver
          </Button>
          <Button variant="danger" loading={pending} onClick={() => onConfirm(reason || null)}>
            Confirmar cancelación
          </Button>
        </div>
      </Card>
    </div>
  )
}
