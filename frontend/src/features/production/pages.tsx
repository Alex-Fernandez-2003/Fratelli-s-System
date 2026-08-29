import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ChefHat,
  FlaskConical,
  Hash,
  Package,
  ShoppingCart,
  User,
} from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'
import { productionApi } from './api'
import type {
  ProductionRequirementDto,
} from './api'
import { Button } from '../../components/atoms'
import { Input, Select, Textarea } from '../../components/atoms'
import { FormField } from '../../components/molecules'
import { AppShell } from '../../components/templates'
import { Alert } from '../../components/molecules'

type View = 'form' | 'confirming' | 'success'

export function RegisterProductionPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [view, setView] = useState<View>('form')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const [searchProduct, setSearchProduct] = useState('')

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'production', searchProduct],
    queryFn: () =>
      productionApi.listProducts({
        page: 1,
        pageSize: 100,
        search: searchProduct || undefined,
        productType: 'PREPARATION',
        isActive: true,
      }),
  })

  const products = useMemo(() => productsData?.items ?? [], [productsData])

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId],
  )

  const quantityNum = useMemo(() => {
    const n = parseFloat(quantity)
    return Number.isFinite(n) && n > 0 ? n : 0
  }, [quantity])

  const { data: requirements, isLoading: loadingRequirements } = useQuery({
    queryKey: ['productionRequirements', selectedProductId, quantityNum],
    queryFn: () => productionApi.getRequirements(selectedProductId, quantityNum),
    enabled: !!selectedProductId && quantityNum > 0,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      productionApi.create({
        productId: selectedProductId,
        quantityProduced: quantityNum,
        notes: notes.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productionRequirements'] })
      setView('success')
    },
    onError: (err: Error & { problem?: { detail?: string; code?: string } }) => {
      const detail = err.problem?.detail ?? err.problem?.code ?? err.message
      setError(detail || 'Error al registrar la produccion')
    },
  })

  const handleConfirm = useCallback(() => {
    setError(null)
    createMutation.mutate()
  }, [createMutation])

  const handleReset = useCallback(() => {
    setView('form')
    setSelectedProductId('')
    setQuantity('')
    setNotes('')
    setError(null)
  }, [])

  const canSubmit = selectedProductId && quantityNum > 0 && !createMutation.isPending

  return (
    <AppShell
      header={
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ChefHat size={24} className="text-brand-orange" />
            <div>
              <h1 className="text-lg font-bold">Registrar Produccion</h1>
              <p className="text-sm text-text-muted">
                Registra la produccion de un producto, se descontaran los ingredientes
                automaticamente.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Clock size={14} />
            <span>{new Date().toLocaleString('es-BO')}</span>
          </div>
        </header>
      }
    >
      {view === 'form' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left: Form */}
          <div className="space-y-6">
            {/* Product Selection */}
            <section className="rounded-lg border border-border bg-surface p-5">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
                <Package size={18} className="text-brand-orange" />
                Seleccionar producto a producir
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Buscar producto">
                  <Input
                    placeholder="Buscar por nombre..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                  />
                </FormField>
                <FormField label="Producto" required>
                  <Select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value)
                      setError(null)
                    }}
                    disabled={loadingProducts}
                  >
                    <option value="">
                      {loadingProducts ? 'Cargando productos...' : 'Seleccionar producto'}
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>
            </section>

            {/* Quantity & Notes */}
            <section className="rounded-lg border border-border bg-surface p-5">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
                <FlaskConical size={18} className="text-brand-orange" />
                Cantidad a producir
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Cantidad a producir" required>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value)
                        setError(null)
                      }}
                      className="max-w-[140px]"
                    />
                    <span className="text-sm text-text-muted whitespace-nowrap">
                      {selectedProduct?.preparationArea
                        ? `(${selectedProduct.preparationArea})`
                        : ''}
                    </span>
                  </div>
                </FormField>
                <FormField label="Notas / Observaciones">
                  <Textarea
                    placeholder="Opcional..."
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </FormField>
              </div>
            </section>

            {/* Error */}
            {error && (
              <Alert kind="error" title="Error">
                {error}
              </Alert>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={handleReset}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                disabled={!canSubmit}
                loading={createMutation.isPending}
                onClick={() => {
                  setError(null)
                  setView('confirming')
                }}
              >
                Confirmar produccion
              </Button>
            </div>
          </div>

          {/* Right: Ingredients Preview */}
          <aside className="space-y-4">
            <section className="rounded-lg border border-border bg-surface p-5">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold">
                <ShoppingCart size={18} className="text-brand-orange" />
                Ingredientes a consumir
              </h2>
              <p className="mb-4 text-xs text-text-muted">
                Vista previa no exhaustiva; la confirmacion reevalua el stock.
              </p>

              {loadingRequirements && (
                <div className="py-6 text-center text-sm text-text-muted">
                  Cargando ingredientes...
                </div>
              )}

              {!loadingRequirements && !requirements && (
                <div className="py-6 text-center text-sm text-text-muted">
                  Selecciona un producto y cantidad para ver los ingredientes.
                </div>
              )}

              {requirements && (
                <div className="space-y-2">
                  {requirements.components.map((comp) => (
                    <IngredientRow key={comp.productId} component={comp} />
                  ))}
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="text-text-muted">Stock suficiente</span>
                    {requirements.hasSufficientStock ? (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle2 size={14} />
                        Si
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-danger">
                        <AlertTriangle size={14} />
                        No
                      </span>
                    )}
                  </div>
                </div>
              )}
            </section>
          </aside>
        </div>
      )}

      {view === 'confirming' && (
        <ConfirmModal
          productName={selectedProduct?.name ?? ''}
          quantity={quantityNum}
          onConfirm={handleConfirm}
          onCancel={() => {
            setError(null)
            setView('form')
          }}
          isPending={createMutation.isPending}
          error={error}
        />
      )}

      {view === 'success' && (
        <SuccessView
          productName={selectedProduct?.name ?? ''}
          quantity={quantityNum}
          producedAt={new Date().toISOString()}
          responsibleName={user?.fullName ?? user?.username ?? ''}
          onRegisterAnother={handleReset}
        />
      )}
    </AppShell>
  )
}

function IngredientRow({ component }: { component: ProductionRequirementDto }) {
  const required = Number(component.requiredQuantity)
  const current = Number(component.currentQuantity)
  const shortage = Number(component.shortageQuantity)
  const hasShortage = shortage > 0

  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-surface-elevated px-3 py-2.5 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{component.productName}</p>
        <p className="text-xs text-text-muted">
          {required.toFixed(2)} requerido | {current.toFixed(2)} actual
        </p>
      </div>
      <span
        className={`whitespace-nowrap font-bold ${hasShortage ? 'text-danger' : 'text-success'}`}
      >
        {hasShortage ? `Faltan ${shortage.toFixed(2)}` : `${required.toFixed(2)}`}
      </span>
    </div>
  )
}

function ConfirmModal({
  productName,
  quantity,
  onConfirm,
  onCancel,
  isPending,
  error,
}: {
  productName: string
  quantity: number
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
  error: string | null
}) {
  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <section className="rounded-xl border border-border bg-surface p-6 text-center shadow-lg">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-warning/15">
          <AlertTriangle size={28} className="text-warning" />
        </div>
        <h2 className="mb-2 text-xl font-bold">Confirmar Registro de Produccion</h2>
        <p className="mb-6 text-sm text-text-muted">
          Se registrara un evento de produccion, se descontaran los ingredientes del
          inventario y se generara el lote de Produccion.
        </p>

        <div className="mb-2 rounded-lg bg-surface-elevated px-4 py-3">
          <p className="text-xs text-text-muted">Producto</p>
          <p className="font-bold">{productName}</p>
        </div>
        <div className="mb-6 rounded-lg bg-surface-elevated px-4 py-3">
          <p className="text-xs text-text-muted">Cantidad a producir</p>
          <p className="font-bold">{quantity.toFixed(2)}</p>
        </div>

        {error && (
          <div className="mb-4">
            <Alert kind="error">{error}</Alert>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={isPending}>
            Confirmar y Registrar
          </Button>
        </div>
      </section>
    </div>
  )
}

function SuccessView({
  productName,
  quantity,
  producedAt,
  responsibleName,
  onRegisterAnother,
}: {
  productName: string
  quantity: number
  producedAt: string
  responsibleName: string
  onRegisterAnother: () => void
}) {
  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <section className="rounded-xl border border-success/30 bg-surface p-6 text-center shadow-lg">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 size={32} className="text-success" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-success">
          ¡Produccion Registrada!
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          La produccion se ha registrado correctamente.
        </p>

        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Package size={16} className="text-brand-orange" />
            <span className="font-bold">{productName}</span>
            <span className="rounded-full bg-brand-orange/15 px-2 py-0.5 text-xs font-bold text-brand-orange">
              {quantity.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div className="flex items-center justify-center gap-1.5 text-text-muted">
              <Clock size={14} />
              {new Date(producedAt).toLocaleString('es-BO')}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-text-muted">
              <User size={14} />
              {responsibleName}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-text-muted">
              <Hash size={14} />
              Lote generado
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" onClick={onRegisterAnother}>
            <ArrowLeft size={16} />
            Registrar otra produccion
          </Button>
        </div>
      </section>
    </div>
  )
}
