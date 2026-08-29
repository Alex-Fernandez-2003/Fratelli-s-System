import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/organisms'
import { Alert } from '@/components/molecules'
import { Spinner } from '@/components/atoms'
import { HttpError } from '@/lib/api/http-client'
import { useUnitsList, useProductsList } from '../api'
import { useComposition, useProduct, useUpdateComposition } from './api'
import { CompositionEditor } from './CompositionEditor'
import type { CompositionLineRequest } from './types'

function message(error: unknown) {
  if (error instanceof HttpError) {
    return error.problem.detail ?? error.problem.title ?? 'No se pudo guardar la composición.'
  }
  return 'No se pudo guardar la composición. Intenta nuevamente.'
}

export function CompositionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [savedNotice, setSavedNotice] = useState(false)

  const productQuery = useProduct(id)
  const compositionQuery = useComposition(id)
  const ingredientsQuery = useProductsList({ isActive: true, pageSize: 200 })
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

      {savedNotice && <Alert kind="success">¡Operación exitosa! Composición guardada exitosamente.</Alert>}

      {loading ? (
        <Spinner label="Cargando composición" />
      ) : productQuery.error || !productQuery.data ? (
        <Alert kind="error" title="No se pudo cargar el producto">
          Verifica el enlace o volvé al listado de productos.
        </Alert>
      ) : (
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
      )}
    </div>
  )
}
