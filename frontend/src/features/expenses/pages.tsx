import { Banknote, CheckCircle2, CreditCard, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, Input, Select, Textarea } from '@/components/atoms'
import { FormError, FormField, FormHint } from '@/components/molecules'
import { useAuth } from '@/features/auth/AuthProvider'
import { HttpError } from '@/lib/api/http-client'
import { type CashSource, type Expense, useCreateExpense, useExpenseCategories } from './api'

function boliviaToday() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts()
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}
const cashLabel = (cashSource: CashSource) =>
  cashSource === 'CASH_DRAWER' ? 'Caja principal' : 'Caja chica'

function Confirmation({ expense, onReset }: { expense: Expense; onReset: () => void }) {
  return (
    <Card className="mx-auto grid max-w-2xl gap-5 p-6 text-center">
      <CheckCircle2 className="mx-auto text-success" size={48} />
      <div>
        <h1>Gasto registrado correctamente</h1>
        <p className="text-text-muted">El registro fue guardado.</p>
      </div>
      <dl className="grid gap-3 rounded-md bg-surface-elevated p-4 text-left sm:grid-cols-2">
        <div>
          <dt className="text-sm text-text-muted">Monto</dt>
          <dd className="font-bold">Bs. {Number(expense.amount).toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Fecha</dt>
          <dd>{expense.expenseDate}</dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Categoría</dt>
          <dd>{expense.expenseCategoryName ?? 'Sin categoría'}</dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Fuente</dt>
          <dd>{cashLabel(expense.cashSource)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm text-text-muted">Descripción</dt>
          <dd>{expense.description}</dd>
        </div>
        {expense.createdByDisplayName && (
          <div className="sm:col-span-2">
            <dt className="text-sm text-text-muted">Responsable</dt>
            <dd>{expense.createdByDisplayName}</dd>
          </div>
        )}
      </dl>
      <Button className="mx-auto" onClick={onReset}>
        Registrar otro gasto
      </Button>
    </Card>
  )
}

export function ExpensesPage() {
  const today = boliviaToday()
  const categories = useExpenseCategories()
  const mutation = useCreateExpense()
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [cashSource, setCashSource] = useState<CashSource | ''>('')
  const [description, setDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState(today)
  const [error, setError] = useState<string>()
  const [created, setCreated] = useState<Expense>()
  const validAmount = /^\d+(?:[.,]\d{1,2})?$/.test(amount) && Number(amount.replace(',', '.')) > 0
  const reset = () => {
    setAmount('')
    setCategoryId('')
    setCashSource('')
    setDescription('')
    setExpenseDate(boliviaToday())
    setError(undefined)
    setCreated(undefined)
  }
  const submit = async () => {
    if (
      !validAmount ||
      !cashSource ||
      !description.trim() ||
      description.trim().length > 500 ||
      expenseDate > boliviaToday()
    ) {
      setError(
        'Completá un monto válido, la fuente de dinero, una descripción de hasta 500 caracteres y una fecha no futura.',
      )
      return
    }
    try {
      setCreated(
        await mutation.mutateAsync({
          amount: Number(amount.replace(',', '.')),
          expenseCategoryId: categoryId || null,
          cashSource,
          description: description.trim(),
          expenseDate,
        }),
      )
      setError(undefined)
    } catch (cause) {
      setError(
        cause instanceof HttpError
          ? (cause.problem.detail ?? 'No se pudo registrar el gasto.')
          : 'No se pudo registrar el gasto.',
      )
    }
  }
  if (created) return <Confirmation expense={created} onReset={reset} />
  return (
    <div className="grid gap-6">
      <header>
        <h1>Gastos</h1>
        <p className="text-text-muted">Documentá un nuevo egreso del restaurante.</p>
      </header>
      <Card className="mx-auto grid w-full max-w-4xl gap-5 p-5 sm:p-6">
        <div>
          <h2>Nuevo registro</h2>
          <p className="text-text-muted">
            Completá la información para documentar un nuevo egreso.
          </p>
        </div>
        {categories.isError && (
          <div
            className="rounded-md border border-warning/50 bg-warning/10 p-3 text-sm"
            role="alert"
          >
            No se pudieron cargar las categorías. Podés registrar el gasto sin categoría.{' '}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void categories.refetch()}
              leftIcon={<RefreshCw size={14} />}
            >
              Reintentar
            </Button>
          </div>
        )}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-5">
            <FormField label="Monto (Bs.)" required>
              <Input
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </FormField>
            <FormField label="Fecha" required>
              <Input
                type="date"
                value={expenseDate}
                max={today}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </FormField>
            <FormField label="Categoría">
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={categories.isLoading}
              >
                <option value="">Sin categoría</option>
                {categories.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              {!categories.isLoading && !categories.isError && !categories.data?.length && (
                <FormHint>Sin categorías disponibles</FormHint>
              )}
            </FormField>
          </div>
          <div className="grid gap-5">
            <fieldset className="grid gap-2">
              <legend className="font-bold">Fuente de dinero *</legend>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  aria-pressed={cashSource === 'CASH_DRAWER'}
                  onClick={() => setCashSource('CASH_DRAWER')}
                  className={`grid min-h-28 place-items-center rounded-lg border p-3 ${cashSource === 'CASH_DRAWER' ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-border'}`}
                >
                  <Banknote aria-hidden="true" />
                  <strong>Caja principal</strong>
                </button>
                <button
                  type="button"
                  aria-pressed={cashSource === 'PETTY_CASH'}
                  onClick={() => setCashSource('PETTY_CASH')}
                  className={`grid min-h-28 place-items-center rounded-lg border p-3 ${cashSource === 'PETTY_CASH' ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-border'}`}
                >
                  <CreditCard aria-hidden="true" />
                  <strong>Caja chica</strong>
                </button>
              </div>
            </fieldset>
            <FormField label="Descripción / motivo" required>
              <Textarea
                className="min-h-32"
                maxLength={500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalle el motivo del gasto..."
              />
            </FormField>
            {user && (
              <p className="rounded-md border border-border p-3 text-sm text-text-muted">
                Responsable: <strong className="text-text">{user.fullName ?? user.username}</strong>
              </p>
            )}
          </div>
        </div>
        {error && <FormError>{error}</FormError>}
        <div className="sticky bottom-0 border-t border-border bg-surface pt-4 md:static">
          <Button fullWidth loading={mutation.isPending} onClick={() => void submit()}>
            Registrar gasto
          </Button>
        </div>
      </Card>
    </div>
  )
}
