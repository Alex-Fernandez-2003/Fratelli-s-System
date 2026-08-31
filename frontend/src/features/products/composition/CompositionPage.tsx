import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/organisms'
import { Alert } from '@/components/molecules'
import { Card, Spinner } from '@/components/atoms'
import { useAuth } from '@/features/auth/AuthProvider'
import { canManageProducts } from '@/features/navigation'
import { HttpError } from '@/lib/api/http-client'
import { useUnitsList, useProductsList } from '../api'
import { useComposition, useProduct, useUpdateComposition } from './api'
import { CompositionEditor } from './CompositionEditor'
import type { CompositionLineRequest } from './types'

function message(error: unknown) {
  if (error instanceof HttpError) {
    const errors = (error.problem as { errors?: Record<string, string[]> }).errors
    if (errors) {
      const fieldMessages = Object.values(errors).flat()
      if (fieldMessages.length) return fieldMessages.join(' ')
    }
    return error.problem.detail ?? error.problem.title ?? 'No se pudo guardar la composición.'
  }
  return 'No se pudo guardar la composición. Intenta nuevamente.'
}

export function CompositionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canManage = canManageProducts(user?.roles ?? [])
  const [savedNotice, setSavedNotice] = useState(false)

  const productQuery = useProduct(id)
  const compositionQuery = useComposition(id)
  const ingredientsQuery = useProductsList({ isActive: true, pageSize: 100 })
  const unitsQuery = useUnitsList()
  const updateComposition = useUpdateComposition(id)

  useEffect(() => {
    if (!savedNotice) return
    const timer = setTimeout(() => setSavedNotice(false), 3000)
    return () => clearTimeout(timer)
  }, [savedNotice])

  const loading =
    productQuery.isLoading ||
    compositionQuery.isLoading ||
    ingredientsQuery.isLoading ||
    unitsQuery.isLoading

  function handleSave(lines: CompositionLineRequest[]) {
    updateComposition.mutate(lines, { onSuccess: () => setSavedNotice(true) })
  }

  return (
    <div className="grid gap-6">
      <nav aria-label="Miga de pan" className="flex items-center gap-1.5 text-sm text-text-muted">
        <Link to="/productos">Productos</Link>
        <ChevronRight aria-hidden="true" size={14} />
        <span className="text-text">Composición</span>
      </nav>

      <PageHeader title="Composición de preparación" />

      {savedNotice && (
        <Alert kind="success">¡Operación exitosa! Composición guardada exitosamente.</Alert>
      )}

      {loading ? (
        <Spinner label="Cargando composición" />
      ) : productQuery.error || !productQuery.data ? (
        <Alert kind="error" title="No se pudo cargar el producto">
          Verifica el enlace o volvé al listado de productos.
        </Alert>
      ) : productQuery.data.productType !== 'PREPARATION' ? (
        <Alert kind="error" title="Este producto no admite composición">
          Solo los productos de tipo Preparación pueden tener una receta de ingredientes. &ldquo;
          {productQuery.data.name}&rdquo; es de tipo {productQuery.data.productType}.
        </Alert>
      ) : canManage ? (
        <CompositionEditor
          parentProduct={productQuery.data}
          initialLines={compositionQuery.data?.lines ?? []}
          ingredientOptions={ingredientsQuery.data?.items ?? []}
          units={unitsQuery.data?.items ?? []}
          onSave={handleSave}
          onChangeProduct={(product) => navigate(`/productos/${product.id}/composicion`)}
          saving={updateComposition.isPending}
          serverError={updateComposition.error ? message(updateComposition.error) : undefined}
        />
      ) : (
        <Card className="grid gap-3">
          <p className="text-text-muted">Tenés acceso de solo lectura a esta composición.</p>
          {(compositionQuery.data?.lines ?? []).map((line) => (
            <div
              key={line.componentProductId}
              className="flex justify-between gap-3 border-b border-border pb-2"
            >
              <span>{line.componentProductName}</span>
              <span>
                {line.quantityPerOutputUnit}{' '}
                {unitsQuery.data?.items.find((unit) => unit.id === line.unitId)?.symbol ?? ''}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
