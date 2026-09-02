import { Button, Card } from '@/components/atoms'
import { Modal } from '@/components/organisms'
import { HttpError } from '@/lib/api/http-client'
import type { CashClosingDto } from './api'
import { useCashClosingDetail } from './api'
import {
  differenceSemantic,
  formatBusinessDateLong,
  formatMoneyOrDash,
  formatDateTime,
  formatSignedMoney,
} from './format'

function SnapshotMoneyRow({
  label,
  value,
}: {
  label: string
  value: number | string | null | undefined
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-2 last:border-0">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="m-0 font-bold tabular-nums">{formatMoneyOrDash(value)}</dd>
    </div>
  )
}

function SnapshotSection({
  title,
  children,
  testId,
}: {
  title: string
  children: React.ReactNode
  testId?: string
}) {
  return (
    <Card className="grid gap-2" data-testid={testId}>
      <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-text-muted">{title}</h3>
      <dl className="m-0 grid">{children}</dl>
    </Card>
  )
}

export function CashClosingDetailContent({ closing }: { closing: CashClosingDto }) {
  const observation = closing.observation?.trim()
  const difference =
    closing.difference === null ||
    closing.difference === undefined ||
    (typeof closing.difference === 'string' && closing.difference.trim() === '')
      ? Number.NaN
      : Number(closing.difference)
  const hasDifference = Number.isFinite(difference)
  const semantic = hasDifference ? differenceSemantic(difference) : undefined

  return (
    <div className="grid gap-4">
      <Card className="grid gap-1 text-sm">
        <h3 className="m-0">Identificación</h3>
        <span>Fecha de negocio: {formatBusinessDateLong(closing.businessDate)}</span>
        <span>Cerrado a las: {formatDateTime(closing.closedAt)}</span>
        <span className="break-all">Cerrado por: {closing.closedByUserId || '—'}</span>
        <span className="break-all">ID: {closing.id}</span>
      </Card>

      <SnapshotSection title="Apertura">
        <SnapshotMoneyRow label="Apertura caja principal" value={closing.openingAmount} />
        <SnapshotMoneyRow label="Apertura caja chica" value={closing.pettyCashOpeningAmount} />
        <SnapshotMoneyRow label="Efectivo retirado" value={closing.cashRemovedAmount} />
      </SnapshotSection>

      <SnapshotSection title="Medios de pago" testId="cash-payment-breakdown">
        <SnapshotMoneyRow label="Efectivo" value={closing.cashSalesTotal} />
        <SnapshotMoneyRow label="QR" value={closing.qrSalesTotal} />
        <SnapshotMoneyRow label="Pago externo" value={closing.externalSalesTotal} />
      </SnapshotSection>

      <SnapshotSection title="Canales" testId="cash-channel-breakdown">
        <SnapshotMoneyRow label="Directo" value={closing.directSalesTotal} />
        <SnapshotMoneyRow label="PedidosYa" value={closing.pedidosYaSalesTotal} />
      </SnapshotSection>

      <SnapshotSection title="Gastos">
        <SnapshotMoneyRow label="Caja principal" value={closing.cashDrawerExpensesTotal} />
        <SnapshotMoneyRow label="Caja chica" value={closing.pettyCashExpensesTotal} />
        <SnapshotMoneyRow label="Total gastos" value={closing.expensesTotal} />
      </SnapshotSection>

      <SnapshotSection title="Conciliación">
        <SnapshotMoneyRow label="Efectivo esperado" value={closing.expectedCash} />
        <SnapshotMoneyRow label="Efectivo declarado" value={closing.declaredCash} />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-2 last:border-0">
          <dt className="text-sm text-text-muted">Diferencia</dt>
          <dd className="m-0 font-bold tabular-nums" data-testid="cash-closing-difference">
            {hasDifference ? (
              <>
                <span>{semantic}</span> · <span>{formatSignedMoney(difference)}</span>
              </>
            ) : (
              '—'
            )}
          </dd>
        </div>
      </SnapshotSection>

      {observation && (
        <Card className="grid gap-1">
          <h3 className="m-0 text-sm font-bold uppercase tracking-wide text-text-muted">
            Observación
          </h3>
          <p className="m-0 break-words whitespace-pre-wrap">{observation}</p>
        </Card>
      )}
    </div>
  )
}

export function CashClosingDetailOverlay({
  closingId,
  onClose,
}: {
  closingId: string | undefined
  onClose: () => void
}) {
  const query = useCashClosingDetail(closingId)

  return (
    <Modal open={Boolean(closingId)} title="Detalle de cierre" onClose={onClose}>
      {query.isLoading ? (
        <p role="status">Cargando detalle del cierre…</p>
      ) : query.error ? (
        <div className="grid gap-3">
          <p role="alert">
            {query.error instanceof HttpError && query.error.status === 404
              ? 'El cierre solicitado ya no está disponible.'
              : 'No se pudo cargar el detalle del cierre.'}
          </p>
          <Button
            variant="outline"
            onClick={() => void query.refetch()}
            aria-label="Reintentar detalle de cierre"
          >
            Reintentar
          </Button>
        </div>
      ) : query.data ? (
        <CashClosingDetailContent closing={query.data} />
      ) : null}
    </Modal>
  )
}
