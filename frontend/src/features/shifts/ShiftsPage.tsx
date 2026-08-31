import { ArrowLeftRight, Lock, Moon, Plus, Sun, Users } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Badge, Button, Card, StatusDot, Textarea, Input, Checkbox } from '@/components/atoms'
import { Alert, EmptyState, StatCard, FormError, FormField, FormHint } from '@/components/molecules'
import { Modal, PageHeader } from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import { useAttendanceToday } from '@/features/attendance/hooks'
import { formatBusinessTime } from '@/lib/business-time'
import {
  useHandoverShift,
  useOpenShift,
  useShiftContext,
  useUpdateShiftAssignments,
  type ShiftDto,
} from './api'
import {
  SHIFT_STATUS_LABEL,
  SHIFT_STATUS_TONE,
  SHIFT_TYPE_LABEL,
  SHIFT_TYPE_SCHEDULE,
  formatBusinessDateLong,
  shiftErrorMessage,
} from './format'
import { HttpError } from '@/lib/api/http-client'

const SHIFT_ICON = { MORNING: Sun, NIGHT: Moon } as const

function ShiftCard({
  shift,
  employeeNames,
  onManage,
  onStartHandover,
}: {
  shift: ShiftDto
  employeeNames: (id: string) => string
  onManage: () => void
  onStartHandover: () => void
}) {
  const Icon = SHIFT_ICON[shift.type]
  return (
    <Card className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <Icon aria-hidden="true" size={18} className="text-brand-orange" />
            {SHIFT_TYPE_LABEL[shift.type]}
          </h3>
          <p className="text-sm text-text-muted">{SHIFT_TYPE_SCHEDULE[shift.type]}</p>
        </div>
        <Badge tone={SHIFT_STATUS_TONE[shift.status]}>{SHIFT_STATUS_LABEL[shift.status]}</Badge>
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-text-muted">
            <Users aria-hidden="true" size={14} />
            Empleados en turno
          </dt>
          <dd className="font-bold">{shift.employeeIds.length} personas</dd>
        </div>
        {shift.employeeIds.length > 0 && (
          <dd className="text-text-muted">{shift.employeeIds.map(employeeNames).join(', ')}</dd>
        )}
      </dl>

      <div className="grid gap-2 sm:grid-cols-2">
        {shift.status === 'COMPLETED' ? (
          <Button
            type="button"
            variant="secondary"
            disabled
            title="Disponible próximamente: todavía no existe el detalle histórico del turno."
            className="sm:col-span-2"
          >
            Ver detalle del turno
          </Button>
        ) : (
          <>
            <Button type="button" variant="secondary" onClick={onManage}>
              Administrar
            </Button>
            {shift.status === 'ACTIVE' &&
              (shift.type === 'NIGHT' ? (
                <Button
                  type="button"
                  variant="danger"
                  disabled
                  title="El Turno Noche es el último del día: no hay un turno siguiente al cual traspasar. El cierre general llega con HU-026/HU-027."
                >
                  Finalizar turno
                </Button>
              ) : (
                <Button type="button" variant="danger" onClick={onStartHandover}>
                  Finalizar turno
                </Button>
              ))}
          </>
        )}
      </div>
    </Card>
  )
}

function AssignmentsModal({ shift, onClose }: { shift: ShiftDto | null; onClose: () => void }) {
  const attendance = useAttendanceToday(!!shift)
  const update = useUpdateShiftAssignments()
  const [selected, setSelected] = useState<string[]>([])
  const [hasEdited, setHasEdited] = useState(false)
  const [error, setError] = useState<string>()
  const [saved, setSaved] = useState(false)

  const employees = attendance.data?.items ?? []
  // hasEdited (no la longitud del array) decide si mostramos la selección del
  // usuario o el estado original del turno: así se puede guardar una lista
  // vacía sin que "revierta" a los empleados originales.
  const currentSelection = shift ? (hasEdited ? selected : shift.employeeIds) : []

  function toggle(employeeId: string) {
    setHasEdited(true)
    setSelected((prev) => {
      const base = hasEdited ? prev : (shift?.employeeIds ?? [])
      return base.includes(employeeId)
        ? base.filter((id) => id !== employeeId)
        : [...base, employeeId]
    })
  }

  function close() {
    setSelected([])
    setHasEdited(false)
    setError(undefined)
    setSaved(false)
    onClose()
  }

  async function submit() {
    if (!shift) return
    try {
      setError(undefined)
      await update.mutateAsync({ id: shift.id, request: { employeeIds: currentSelection } })
      setSaved(true)
    } catch (cause) {
      setError(shiftErrorMessage(cause))
    }
  }

  return (
    <Modal
      open={!!shift}
      title={shift ? `Personal — ${SHIFT_TYPE_LABEL[shift.type]}` : 'Personal del turno'}
      onClose={close}
    >
      {saved ? (
        <div className="grid gap-3">
          <Alert kind="success">Personal actualizado correctamente.</Alert>
          <div className="flex justify-end">
            <Button type="button" onClick={close}>
              Cerrar
            </Button>
          </div>
        </div>
      ) : attendance.isLoading ? (
        <p role="status">Cargando personal disponible…</p>
      ) : attendance.isError ? (
        <Alert kind="error">No se pudo cargar el personal disponible hoy.</Alert>
      ) : employees.length === 0 ? (
        <EmptyState title="Sin personal registrado hoy">
          No hay empleados con asistencia registrada para asignar.
        </EmptyState>
      ) : (
        <div className="grid gap-4">
          <ul className="m-0 grid list-none gap-2 p-0">
            {employees.map((employee) => (
              <li key={employee.employeeId}>
                <label className="flex items-center gap-3 rounded-md border border-border p-2.5">
                  <Checkbox
                    checked={currentSelection.includes(employee.employeeId)}
                    onChange={() => toggle(employee.employeeId)}
                  />
                  <span>{employee.fullName}</span>
                </label>
              </li>
            ))}
          </ul>
          {hasEdited && currentSelection.length === 0 && (
            <FormHint>Vas a guardar este turno sin ningún empleado asignado.</FormHint>
          )}
          {error && <FormError>{error}</FormError>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancelar
            </Button>
            <Button type="button" loading={update.isPending} onClick={() => void submit()}>
              Guardar asignación
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function HandoverSection({ shift }: { shift: ShiftDto }) {
  const handover = useHandoverShift()
  const [cashHanded, setCashHanded] = useState('')
  const [qrAmount, setQrAmount] = useState('')
  const [externalAmount, setExternalAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string>()
  const [done, setDone] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const { user } = useAuth()

  function reset() {
    setCashHanded('')
    setQrAmount('')
    setExternalAmount('')
    setNotes('')
    setError(undefined)
  }

  async function submit() {
    // El contrato actual de HU-025 (HandoverRequest) solo persiste `note`.
    // Los montos desglosados se incluyen dentro de la nota hasta que el
    // backend incorpore campos estructurados (previsto para HU-026/HU-027).
    const breakdown = [
      cashHanded && `Efectivo entregado: ${cashHanded}`,
      qrAmount && `Monto QR/Digital: ${qrAmount}`,
      externalAmount && `Monto PedidosYa/externo: ${externalAmount}`,
    ]
      .filter(Boolean)
      .join(' · ')
    const note = [breakdown, notes.trim()].filter(Boolean).join(' — ') || null

    try {
      setError(undefined)
      await handover.mutateAsync({ id: shift.id, request: { note } })
      setConfirming(false)
      setDone(true)
    } catch (cause) {
      setConfirming(false)
      setError(shiftErrorMessage(cause))
    }
  }

  if (done) {
    return (
      <Card className="grid gap-2">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <ArrowLeftRight aria-hidden="true" size={18} className="text-success" />
          Traspaso registrado
        </h2>
        <p className="text-text-muted">
          El turno saliente quedó completado y el siguiente turno ya está activo.
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => {
            reset()
            setDone(false)
          }}
        >
          Cerrar
        </Button>
      </Card>
    )
  }

  return (
    <Card className="grid gap-5">
      <div>
        <h2 className="text-lg font-bold">Traspaso de turno &amp; continuidad</h2>
        <p className="text-sm text-text-muted">
          Asegura el flujo de fondos entre el personal entrante y saliente.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Efectivo entregado">
              <Input
                inputMode="decimal"
                placeholder="0.00"
                value={cashHanded}
                onChange={(e) => setCashHanded(e.target.value)}
              />
            </FormField>
            <FormField label="Monto QR / Digital">
              <Input
                inputMode="decimal"
                placeholder="0.00"
                value={qrAmount}
                onChange={(e) => setQrAmount(e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Monto PedidosYa / externo">
            <Input
              inputMode="decimal"
              placeholder="0.00"
              value={externalAmount}
              onChange={(e) => setExternalAmount(e.target.value)}
            />
          </FormField>
          <FormField label="Observaciones">
            <Textarea
              className="min-h-24"
              placeholder="Nota sobre novedades del turno o descuadres menores..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>
        </div>
        <div className="grid gap-3 self-start rounded-lg border border-border p-4 text-sm">
          <p className="text-xs font-bold uppercase text-text-muted">Información de validación</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-muted">Responsable de traspaso</span>
            <strong>{user?.fullName ?? user?.username ?? '—'}</strong>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-text-muted">Hora de registro</span>
            <strong>{formatBusinessTime()}</strong>
          </div>
        </div>
      </div>
      {error && <FormError>{error}</FormError>}
      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={reset}>
          Cancelar
        </Button>
        <Button type="button" onClick={() => setConfirming(true)}>
          Registrar traspaso
        </Button>
      </div>

      <Modal open={confirming} title="Confirmar traspaso" onClose={() => setConfirming(false)}>
        <p>
          Vas a finalizar el <strong>{SHIFT_TYPE_LABEL[shift.type]}</strong>. Esta acción no se
          puede deshacer: el turno pasará a Completado y el siguiente turno quedará Activo.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setConfirming(false)}>
            Volver
          </Button>
          <Button type="button" loading={handover.isPending} onClick={() => void submit()}>
            Sí, finalizar turno
          </Button>
        </div>
      </Modal>
    </Card>
  )
}

export function ShiftsPage() {
  const context = useShiftContext()
  const openShift = useOpenShift()
  const attendance = useAttendanceToday(true)
  const [managingShift, setManagingShift] = useState<ShiftDto | null>(null)
  const handoverRef = useRef<HTMLDivElement>(null)

  const employeeNames = useMemo(() => {
    const map = new Map(
      (attendance.data?.items ?? []).map((item) => [item.employeeId, item.fullName]),
    )
    return (id: string) => map.get(id) ?? 'Empleado sin identificar'
  }, [attendance.data])

  const activeShift = context.data?.shifts.find((shift) => shift.status === 'ACTIVE')
  const notOpenedToday =
    context.isError && context.error instanceof HttpError && context.error.status === 404

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Turnos / Caja"
        description="Control centralizado de fondos y turnos"
        actions={
          context.data ? (
            <StatusDot label="Caja abierta" tone="success" />
          ) : notOpenedToday ? (
            <StatusDot label="Caja sin abrir" tone="neutral" />
          ) : undefined
        }
      />

      {context.isLoading ? (
        <p role="status">Cargando jornada…</p>
      ) : notOpenedToday ? (
        <Card>
          <EmptyState
            title="Todavía no se abrió la jornada de hoy"
            action={
              <Button
                type="button"
                loading={openShift.isPending}
                leftIcon={<Plus size={16} />}
                onClick={() => void openShift.mutateAsync()}
              >
                Iniciar jornada
              </Button>
            }
          >
            Abrir la jornada crea la caja compartida y habilita el turno mañana y el turno noche.
          </EmptyState>
          {openShift.isError && <FormError>{shiftErrorMessage(openShift.error)}</FormError>}
        </Card>
      ) : context.isError ? (
        <Alert kind="error">No se pudo cargar la jornada actual.</Alert>
      ) : context.data ? (
        <>
          <Card className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Resumen de jornada</h2>
                <p className="text-sm text-text-muted">Control centralizado de fondos y estados</p>
              </div>
              <Badge>Fecha operativa · {formatBusinessDateLong(context.data.businessDate)}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                label="Monto inicial caja"
                value="—"
                trend="Disponible con el cierre (HU-026)"
              />
              <StatCard label="Caja chica" value="—" trend="Disponible con el cierre (HU-026)" />
              <StatCard
                label="Total estimado en caja"
                value="—"
                trend="Disponible con el cierre (HU-027)"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled
              leftIcon={<Lock size={16} />}
              className="w-fit"
            >
              Cerrar caja general
            </Button>
            <FormHint>El cierre de caja se habilita cuando se implemente HU-026/HU-027.</FormHint>
          </Card>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Control de turnos</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {context.data.shifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  employeeNames={employeeNames}
                  onManage={() => setManagingShift(shift)}
                  onStartHandover={() =>
                    handoverRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                />
              ))}
            </div>
          </div>

          {activeShift?.type === 'NIGHT' ? (
            <div ref={handoverRef}>
              <Card className="grid gap-2">
                <h2 className="text-lg font-bold">Traspaso de turno &amp; continuidad</h2>
                <FormHint>
                  El Turno Noche es el último del día, así que no hay un turno siguiente al cual
                  traspasar. El cierre general de la jornada se habilita cuando se implemente
                  HU-026/HU-027.
                </FormHint>
              </Card>
            </div>
          ) : (
            activeShift && (
              <div ref={handoverRef}>
                <HandoverSection key={activeShift.id} shift={activeShift} />
              </div>
            )
          )}
        </>
      ) : null}

      <AssignmentsModal shift={managingShift} onClose={() => setManagingShift(null)} />
    </div>
  )
}
