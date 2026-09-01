import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Spinner, Skeleton } from '@/components/atoms'
import { Input, Textarea } from '@/components/atoms/FormControls'
import { Alert, EmptyState, FormError, FormField } from '@/components/molecules'
import { Modal, PageHeader } from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import { HttpError } from '@/lib/api/http-client'
import { cashErrorMessage, useCashPreview, useCloseCash } from './api'
import type { CashClosingDto } from './api'
import {
  differenceLabel,
  formatBusinessDateLong,
  formatDateTime,
  formatMoney,
  parseDeclaredCash,
} from './format'

function MoneyRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-sm">
      <span className="text-text-muted">{label}</span>
      <strong className="tabular-nums">{formatMoney(value)}</strong>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="grid gap-1">
      <h3 className="text-sm font-bold uppercase tracking-wide text-text-muted">{title}</h3>
      <div className="grid divide-y divide-border">{children}</div>
    </Card>
  )
}

export function CashClosingPage() {
  const preview = useCashPreview()
  const closeCash = useCloseCash()
  const { user } = useAuth()

  const [declaredCashInput, setDeclaredCashInput] = useState('')
  const [observation, setObservation] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [success, setSuccess] = useState<CashClosingDto | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const previewData = preview.data

  const parsedDeclared = useMemo(() => parseDeclaredCash(declaredCashInput), [declaredCashInput])
  const isDeclaredValid =
    parsedDeclared !== null && !Number.isNaN(parsedDeclared) && parsedDeclared >= 0
  const expectedCash = previewData ? Number(previewData.expectedCash) : 0
  const provisionalDifference =
    previewData && isDeclaredValid && parsedDeclared !== null ? parsedDeclared - expectedCash : null
  const requiresObservation = provisionalDifference !== null && provisionalDifference !== 0
  const observationTrimmed = observation.trim()
  const hasObservation = observationTrimmed.length > 0

  const responsibleName = user?.fullName ?? user?.username ?? '—'

  function openConfirm() {
    setFormError(null)
    setServerError(null)
    if (!previewData) return
    if (declaredCashInput.trim() === '') {
      setFormError('Ingresá el efectivo contado.')
      return
    }
    if (Number.isNaN(parsedDeclared as number)) {
      setFormError('El efectivo declarado no es un monto válido.')
      return
    }
    if ((parsedDeclared as number) < 0) {
      setFormError('El efectivo declarado no puede ser negativo.')
      return
    }
    if (requiresObservation && !hasObservation) {
      setFormError('La observación es obligatoria cuando hay diferencia.')
      return
    }
    setConfirmOpen(true)
  }

  async function submitClose() {
    if (!previewData || parsedDeclared === null || Number.isNaN(parsedDeclared)) return
    setServerError(null)
    try {
      const result = await closeCash.mutateAsync({
        declaredCash: parsedDeclared,
        observation: hasObservation ? observationTrimmed : null,
      })
      setSuccess(result)
      setConfirmOpen(false)
    } catch (cause) {
      setConfirmOpen(false)
      if (cause instanceof HttpError) {
        if (cause.status === 400) {
          setServerError(cause.problem.detail ?? 'Revisá los datos ingresados.')
          return
        }
        if (cause.status === 404) {
          setServerError('No hay una caja abierta disponible para cerrar.')
          void preview.refetch()
          return
        }
        if (cause.status === 409) {
          setServerError('La caja ya fue cerrada. Actualizá el estado operativo.')
          return
        }
      }
      setServerError(cashErrorMessage(cause))
    }
  }

  // Success state
  if (success) {
    return (
      <div className="grid gap-6">
        <PageHeader
          title="Cierre de caja"
          description={`Fecha operativa · ${formatBusinessDateLong(success.businessDate)}`}
        />
        <Alert kind="success">Cierre registrado correctamente.</Alert>
        <Card className="grid gap-3">
          <h2 className="text-lg font-bold">Comprobante de cierre</h2>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Fecha</dt>
              <dd className="font-bold">{formatBusinessDateLong(success.businessDate)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Efectivo esperado</dt>
              <dd className="font-bold">{formatMoney(success.expectedCash)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Efectivo declarado</dt>
              <dd className="font-bold">{formatMoney(success.declaredCash)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Diferencia</dt>
              <dd className="font-bold">
                {Number(success.difference) === 0
                  ? 'Caja cuadrada'
                  : Number(success.difference) > 0
                    ? `Sobrante +${formatMoney(success.difference)}`
                    : `Faltante ${formatMoney(success.difference)}`}
                {' · '}
                {formatMoney(success.difference)}
              </dd>
            </div>
            {success.observation && (
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">Observación</dt>
                <dd className="font-bold">{success.observation}</dd>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Cerrado por</dt>
              <dd className="font-bold">
                {responsibleName} · {success.closedByUserId.slice(0, 8)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Cerrado a las</dt>
              <dd className="font-bold">{formatDateTime(success.closedAt)}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to="/turnos"
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-transparent bg-brand-orange px-3.5 py-2.5 font-bold text-brand-black no-underline"
            >
              Volver a Turnos / Caja
            </Link>
            <Link
              to="/inicio"
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-3.5 py-2.5 font-bold text-text no-underline"
            >
              Ir al Inicio
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // Loading
  if (preview.isLoading) {
    return (
      <div className="grid gap-6" aria-busy="true">
        <PageHeader title="Cierre de caja" description="Cargando resumen autoritativo…" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <p role="status" className="flex items-center gap-2">
          <Spinner label="Cargando cierre" /> Cargando caja…
        </p>
      </div>
    )
  }

  // 404 no session
  if (preview.isError && preview.error instanceof HttpError && preview.error.status === 404) {
    return (
      <div className="grid gap-6">
        <PageHeader title="Cierre de caja" description="Resumen autoritativo de caja" />
        <Card>
          <EmptyState title="No hay una caja abierta disponible para cerrar.">
            Abrí la jornada desde Turnos / Caja para habilitar el cierre. La caja debe estar abierta
            y el turno noche activo.
          </EmptyState>
          <div className="mt-4 flex justify-center">
            <Link
              to="/turnos"
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-border bg-surface px-3.5 py-2.5 font-bold text-text no-underline"
            >
              Volver a Turnos / Caja
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // Recoverable error
  if (preview.isError) {
    return (
      <div className="grid gap-6">
        <PageHeader title="Cierre de caja" description="Resumen autoritativo de caja" />
        <Alert kind="error">
          {cashErrorMessage(preview.error)}{' '}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void preview.refetch()}
            className="ml-2"
          >
            Reintentar
          </Button>
        </Alert>
      </div>
    )
  }

  // Conflict already closed state via closed preview? Preview would be 404 after close, but if we get 409 error and preview refetch returns 404, we show conflict state.
  // Also handle generic 409 UI: show alert and disable form
  const isConflict =
    closeCash.isError && closeCash.error instanceof HttpError && closeCash.error.status === 409

  if (!previewData) return null

  const hasCarriedForward =
    previewData.cashAmountCarriedForward !== null &&
    previewData.cashAmountCarriedForward !== undefined

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Cierre de caja"
        description={`Fecha operativa · ${formatBusinessDateLong(previewData.businessDate)}`}
      />

      {isConflict && (
        <Alert kind="warning">
          La caja ya fue cerrada. Actualizá el estado operativo.
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void preview.refetch()}
            className="ml-2"
          >
            Actualizar
          </Button>
        </Alert>
      )}

      {/* Grid summary desktop, stack mobile */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SectionCard title="Apertura">
          <MoneyRow label="Caja inicial" value={previewData.openingAmount} />
          <MoneyRow label="Caja chica inicial" value={previewData.pettyCashOpeningAmount} />
        </SectionCard>

        <SectionCard title="Ventas por medio de pago">
          <MoneyRow label="Efectivo" value={previewData.cashSalesTotal} />
          <MoneyRow label="QR" value={previewData.qrSalesTotal} />
          <MoneyRow label="Externo" value={previewData.externalSalesTotal} />
        </SectionCard>

        <SectionCard title="Ventas por canal">
          <MoneyRow label="Directo" value={previewData.directSalesTotal} />
          <MoneyRow label="PedidosYa" value={previewData.pedidosYaSalesTotal} />
        </SectionCard>

        <SectionCard title="Gastos">
          <MoneyRow label="Caja principal" value={previewData.cashDrawerExpensesTotal} />
          <MoneyRow label="Caja chica" value={previewData.pettyCashExpensesTotal} />
          {Number(previewData.expensesTotal) !==
            Number(previewData.cashDrawerExpensesTotal) +
              Number(previewData.pettyCashExpensesTotal) && (
            <MoneyRow label="Total gastos" value={previewData.expensesTotal} />
          )}
        </SectionCard>

        <SectionCard title="Traspaso">
          <MoneyRow label="Efectivo retirado" value={previewData.cashRemovedAmount} />
          {hasCarriedForward && (
            <MoneyRow label="Efectivo arrastrado" value={previewData.cashAmountCarriedForward!} />
          )}
        </SectionCard>

        <Card className="grid gap-2 border-brand-orange bg-surface-elevated md:col-span-2 xl:col-span-1">
          <h3 className="text-sm font-bold uppercase tracking-wide text-text-muted">Resultado</h3>
          <p className="text-sm text-text-muted">Efectivo esperado</p>
          <strong className="text-2xl tabular-nums" data-testid="expected-cash">
            {formatMoney(previewData.expectedCash)}
          </strong>
          <p className="text-xs text-text-muted">
            Valor autoritativo del servidor. No se recalcula en el cliente.
          </p>
        </Card>
      </div>

      {/* Difference / form */}
      <Card className="grid gap-4">
        <h2 className="text-lg font-bold">Declaración de cierre</h2>

        {serverError && <Alert kind="error">{serverError}</Alert>}
        {isConflict && <Alert kind="warning">La caja ya no está disponible para cierre.</Alert>}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Efectivo contado" hint="Monto contado físicamente en caja" required>
            <Input
              inputMode="decimal"
              placeholder="0.00"
              value={declaredCashInput}
              onChange={(e) => {
                setDeclaredCashInput(e.target.value)
                setFormError(null)
                setServerError(null)
              }}
              aria-label="Efectivo contado"
              disabled={isConflict}
            />
          </FormField>

          <div className="grid gap-1.5">
            <span className="mb-1.5 block font-bold">Diferencia provisional</span>
            <div
              className="flex min-h-[42px] items-center rounded-md border border-border bg-surface-elevated px-3 py-2.5"
              data-testid="provisional-difference"
              aria-live="polite"
            >
              {provisionalDifference === null ? (
                <span className="text-sm text-text-muted">Ingresá el efectivo contado</span>
              ) : provisionalDifference === 0 ? (
                <span className="font-bold text-success">Caja cuadrada · 0,00 Bs</span>
              ) : provisionalDifference > 0 ? (
                <span className="font-bold">
                  Sobrante +{formatMoney(provisionalDifference)} ·{' '}
                  {differenceLabel(provisionalDifference)}
                </span>
              ) : (
                <span className="font-bold">
                  Faltante {formatMoney(provisionalDifference)} ·{' '}
                  {differenceLabel(provisionalDifference)}
                </span>
              )}
            </div>
            <p className="m-0 text-sm text-text-muted">
              Cálculo provisional. El valor final lo determina el servidor.
            </p>
          </div>
        </div>

        <FormField
          label="Observación"
          hint={
            requiresObservation
              ? 'Obligatoria cuando hay diferencia'
              : 'Opcional cuando la caja está cuadrada'
          }
          required={!!requiresObservation}
        >
          <Textarea
            className="min-h-24"
            placeholder={
              requiresObservation
                ? 'Explicá el motivo de la diferencia…'
                : 'Opcional cuando la caja está cuadrada…'
            }
            value={observation}
            onChange={(e) => {
              setObservation(e.target.value)
              setFormError(null)
              setServerError(null)
            }}
            aria-label="Observación"
            disabled={isConflict}
          />
        </FormField>

        {formError && (
          <div role="alert">
            <FormError>{formError}</FormError>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="text-sm text-text-muted">
            Responsable: <strong className="text-text">{responsibleName}</strong>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeclaredCashInput('')
                setObservation('')
                setFormError(null)
                setServerError(null)
              }}
              disabled={closeCash.isPending || isConflict}
            >
              Limpiar
            </Button>
            <Button
              type="button"
              onClick={openConfirm}
              disabled={closeCash.isPending || !!isConflict}
              loading={closeCash.isPending}
            >
              Registrar cierre
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        open={confirmOpen}
        title="Confirmar cierre de caja"
        onClose={() => !closeCash.isPending && setConfirmOpen(false)}
      >
        <div className="grid gap-4">
          <Alert kind="warning">
            Confirma que los datos del cierre son correctos. Una vez registrado, el cierre no podrá
            editarse.
          </Alert>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Fecha</dt>
              <dd className="font-bold">{formatBusinessDateLong(previewData.businessDate)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Efectivo esperado</dt>
              <dd className="font-bold">{formatMoney(previewData.expectedCash)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Efectivo declarado</dt>
              <dd className="font-bold">
                {isDeclaredValid ? formatMoney(parsedDeclared as number) : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Diferencia provisional</dt>
              <dd className="font-bold">
                {provisionalDifference === null ? '—' : differenceLabel(provisionalDifference)}
              </dd>
            </div>
            {hasObservation && (
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">Observación</dt>
                <dd className="font-bold">{observationTrimmed}</dd>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Responsable</dt>
              <dd className="font-bold">{responsibleName}</dd>
            </div>
          </dl>
          {serverError && <FormError>{serverError}</FormError>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={closeCash.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              loading={closeCash.isPending}
              onClick={() => void submitClose()}
              disabled={closeCash.isPending}
            >
              Registrar cierre
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
