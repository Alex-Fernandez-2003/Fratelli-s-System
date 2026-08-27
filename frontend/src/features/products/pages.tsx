import { ChevronLeft, ChevronRight, Package, Pencil, Plus, Search, XCircle } from 'lucide-react'
import { useState } from 'react'
import { DataTable, Modal, PageHeader } from '@/components/organisms'
import {
  Badge,
  Button,
  Card,
  IconButton,
  Input,
  Label,
  Select,
  StatusDot,
} from '@/components/atoms'
import { FormError, FormField } from '@/components/molecules'
import { HttpError } from '@/lib/api/http-client'
import {
  useCategoriesList,
  useCreateProduct,
  useDeactivateProduct,
  useProductsList,
  useUnitsList,
  useUpdateProduct,
  type CategoryDto,
  type ProductDto,
  type ProductRequest,
  type UnitDto,
} from './api'

const PRODUCT_TYPES = [
  { value: 'INGREDIENT', label: 'Ingrediente', hint: 'Materia prima' },
  { value: 'PREPARATION', label: 'Preparación', hint: 'Receta interna' },
  { value: 'SALE_ITEM', label: 'Producto de venta', hint: 'Directo al cliente' },
  { value: 'SUPPLY', label: 'Insumo', hint: 'No comestible' },
] as const

const PREPARATION_AREAS = [
  { value: 'KITCHEN', label: 'Cocina' },
  { value: 'BAR', label: 'Bar' },
  { value: 'NONE', label: 'N/A' },
] as const

const PRODUCT_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  PRODUCT_TYPES.map((t) => [t.value, t.label]),
)

type FormValue = {
  name: string
  productType: string
  categoryId: string
  inventoryUnitId: string
  preparationArea: string
  isSellable: boolean
  salePrice: string
  minStock: string
}

const initialForm: FormValue = {
  name: '',
  productType: 'INGREDIENT',
  categoryId: '',
  inventoryUnitId: '',
  preparationArea: 'NONE',
  isSellable: false,
  salePrice: '',
  minStock: '',
}

function toFormValue(product: ProductDto): FormValue {
  return {
    name: product.name,
    productType: product.productType,
    categoryId: product.categoryId ?? '',
    inventoryUnitId: product.inventoryUnitId,
    preparationArea: product.preparationArea ?? 'NONE',
    isSellable: product.isSellable,
    salePrice: product.salePrice != null ? String(product.salePrice) : '',
    minStock: product.minStock != null ? String(product.minStock) : '',
  }
}

function toRequest(value: FormValue): ProductRequest {
  return {
    name: value.name.trim(),
    productType: value.productType as ProductRequest['productType'],
    categoryId: value.categoryId || null,
    inventoryUnitId: value.inventoryUnitId,
    preparationArea: value.preparationArea === 'NONE' ? null : value.preparationArea,
    isSellable: value.isSellable,
    salePrice: value.isSellable && value.salePrice !== '' ? Number(value.salePrice) : null,
    minStock: value.minStock !== '' ? Number(value.minStock) : null,
  }
}

const message = (error: unknown) =>
  error instanceof HttpError && error.status === 409
    ? 'No se pudo completar la operación. Revisá el producto o intentá nuevamente.'
    : 'No se pudo completar la operación. Intentá nuevamente.'

function ProductForm({
  value,
  onChange,
  error,
  categories,
  units,
}: {
  value: FormValue
  onChange: (value: FormValue) => void
  error?: string
  categories: CategoryDto[]
  units: UnitDto[]
}) {
  return (
    <div className="grid gap-4">
      <FormField label="Nombre del producto" required>
        <Input
          placeholder="Ej: Hamburguesa de Pollo Crispy"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
        />
      </FormField>

      <FormField label="Categoría">
        <Select
          value={value.categoryId}
          onChange={(e) => onChange({ ...value, categoryId: e.target.value })}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </FormField>

      <fieldset className="grid gap-2">
        <legend className="font-bold">Clasificación *</legend>
        <div className="grid grid-cols-2 gap-2">
          {PRODUCT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              aria-pressed={value.productType === type.value}
              onClick={() => onChange({ ...value, productType: type.value })}
              className={`rounded-md border p-3 text-left ${
                value.productType === type.value
                  ? 'border-brand-orange bg-brand-orange/10'
                  : 'border-border'
              }`}
            >
              <span className="block text-sm font-bold">{type.label}</span>
              <span className="block text-xs text-text-muted">{type.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Unidad" required>
          <Select
            value={value.inventoryUnitId}
            onChange={(e) => onChange({ ...value, inventoryUnitId: e.target.value })}
          >
            <option value="">Selecciona una unidad</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Stock mínimo">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={value.minStock}
            onChange={(e) => onChange({ ...value, minStock: e.target.value })}
          />
        </FormField>
      </div>

      <fieldset className="grid gap-2">
        <legend className="font-bold">Área</legend>
        <div
          className="grid grid-cols-3 rounded-md border border-border bg-surface p-1"
          role="group"
          aria-label="Área de preparación"
        >
          {PREPARATION_AREAS.map((area) => (
            <button
              key={area.value}
              type="button"
              aria-pressed={value.preparationArea === area.value}
              onClick={() => onChange({ ...value, preparationArea: area.value })}
              className={`min-h-9 rounded px-2 text-sm font-bold ${
                value.preparationArea === area.value
                  ? 'bg-surface-elevated text-brand-orange shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {area.label}
            </button>
          ))}
        </div>
      </fieldset>

      <Label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.isSellable}
          onChange={(e) => onChange({ ...value, isSellable: e.target.checked, salePrice: e.target.checked ? value.salePrice : '' })}
        />
        ¿Es vendible?
      </Label>

      {value.isSellable && (
        <FormField label="Precio de venta (Bs.)">
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            value={value.salePrice}
            onChange={(e) => onChange({ ...value, salePrice: e.target.value })}
          />
        </FormField>
      )}

      {error && <FormError>{error}</FormError>}
    </div>
  )
}

export function ProductsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    search: '',
    productType: '',
    categoryId: '',
    isActive: undefined as boolean | undefined,
  })
  const [form, setForm] = useState<FormValue>(initialForm)
  const [editing, setEditing] = useState<ProductDto | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<ProductDto | null>(null)
  const [mutationError, setMutationError] = useState<string>()

  const query = useProductsList(filters)
  const categoriesQuery = useCategoriesList()
  const unitsQuery = useUnitsList()
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const deactivate = useDeactivateProduct()

  const categories = categoriesQuery.data?.items ?? []
  const units = unitsQuery.data?.items ?? []
  const pending = create.isPending || update.isPending

  const closeForm = () => {
    setCreateOpen(false)
    setEditing(null)
    setForm(initialForm)
    setMutationError(undefined)
  }

  const submitForm = async () => {
    if (!form.name.trim() || !form.inventoryUnitId) {
      setMutationError('Completá el nombre y seleccioná una unidad.')
      return
    }
    try {
      const request = toRequest(form)
      if (editing) await update.mutateAsync({ id: editing.id, request })
      else await create.mutateAsync(request)
      closeForm()
    } catch (error) {
      setMutationError(message(error))
    }
  }

  const columns = [
    {
      id: 'name',
      header: 'Nombre',
      cell: (product: ProductDto) => (
        <div className="flex items-center gap-2">
          <Package aria-hidden="true" size={16} className="text-text-muted" />
          <span>{product.name}</span>
        </div>
      ),
    },
    {
      id: 'productType',
      header: 'Tipo',
      cell: (product: ProductDto) => <Badge>{PRODUCT_TYPE_LABEL[product.productType]}</Badge>,
    },
    {
      id: 'unit',
      header: 'Unidad',
      cell: (product: ProductDto) => units.find((u) => u.id === product.inventoryUnitId)?.symbol ?? '—',
    },
    {
      id: 'sellable',
      header: 'Vendible',
      cell: (product: ProductDto) => (product.isSellable ? '✓' : '✕'),
    },
    {
      id: 'price',
      header: 'Precio (Bs.)',
      cell: (product: ProductDto) => (product.salePrice != null ? Number(product.salePrice).toFixed(2) : '—'),
    },
    {
      id: 'active',
      header: 'Estado',
      cell: (product: ProductDto) => (
        <StatusDot
          label={product.isActive ? 'Activo' : 'Inactivo'}
          tone={product.isActive ? 'success' : 'danger'}
        />
      ),
    },
  ]

  const totalPages = Number(query.data?.totalPages ?? 0)
  const totalCount = Number(query.data?.totalCount ?? 0)
  const firstResult = totalCount ? (filters.page - 1) * filters.pageSize + 1 : 0
  const lastResult = Math.min(filters.page * filters.pageSize, totalCount)

  const actions = (product: ProductDto) => (
    <div className="flex gap-1">
      <IconButton
        type="button"
        label={`Editar ${product.name}`}
        onClick={() => {
          setEditing(product)
          setForm(toFormValue(product))
          setMutationError(undefined)
        }}
      >
        <Pencil size={16} />
      </IconButton>
      {product.isActive && (
        <IconButton
          type="button"
          label={`Desactivar ${product.name}`}
          onClick={() => setDeactivateTarget(product)}
        >
          <XCircle size={16} />
        </IconButton>
      )}
    </div>
  )

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Productos"
        description="Administra productos, ingredientes, preparaciones e insumos."
        actions={
          <Button
            type="button"
            onClick={() => {
              setForm(initialForm)
              setCreateOpen(true)
            }}
            leftIcon={<Plus size={16} />}
            className="w-full sm:w-auto"
          >
            Nuevo producto
          </Button>
        }
      />

      <Card className="grid gap-4 border-border bg-surface-elevated/40 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem] md:items-end">
          <FormField label="Buscar producto" leadingIcon={<Search aria-hidden="true" size={16} />}>
            <Input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Buscar producto..."
            />
          </FormField>
          <FormField label="Tipo">
            <Select
              value={filters.productType}
              onChange={(e) => setFilters({ ...filters, productType: e.target.value, page: 1 })}
            >
              <option value="">Todos</option>
              {PRODUCT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Categoría">
            <Select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value, page: 1 })}
            >
              <option value="">Todas</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        {query.isLoading ? (
          <p role="status">Cargando productos…</p>
        ) : query.error ? (
          <div role="alert">
            <p>No se pudieron cargar los productos.</p>
            <Button type="button" onClick={() => void query.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : !query.data?.items.length ? (
          <div className="text-center">
            <p>
              {filters.search || filters.productType || filters.categoryId
                ? 'No hay resultados para estos filtros.'
                : 'Todavía no hay productos.'}
            </p>
          </div>
        ) : (
          <div className="hidden md:block">
            <DataTable columns={columns} rows={query.data.items} getRowId={(p) => p.id} actions={actions} />
          </div>
        )}

        {query.data?.items && query.data.items.length > 0 && (
          <div className="grid gap-3 md:hidden">
            {query.data.items.map((product) => (
              <Card key={product.id} className="grid gap-2">
                <strong>{product.name}</strong>
                <Badge>{PRODUCT_TYPE_LABEL[product.productType]}</Badge>
                <StatusDot
                  label={product.isActive ? 'Activo' : 'Inactivo'}
                  tone={product.isActive ? 'success' : 'danger'}
                />
                {actions(product)}
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-text-muted">
            Mostrando {firstResult}–{lastResult} de {totalCount} productos
          </span>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={filters.page <= 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              leftIcon={<ChevronLeft size={16} />}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={filters.page >= totalPages}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              rightIcon={<ChevronRight size={16} />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      <Modal open={createOpen || !!editing} title={editing ? 'Editar producto' : 'Nuevo producto'} onClose={closeForm}>
        <ProductForm value={form} onChange={setForm} error={mutationError} categories={categories} units={units} />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={closeForm}>
            Cancelar
          </Button>
          <Button type="button" loading={pending} onClick={() => void submitForm()}>
            Guardar
          </Button>
        </div>
      </Modal>

      <Modal open={!!deactivateTarget} title="Desactivar producto" onClose={() => setDeactivateTarget(null)}>
        <p>
          El producto <strong>{deactivateTarget?.name}</strong> dejará de estar disponible en pedidos y ventas,
          pero se conservará su historial de movimientos.
        </p>
        {/*
          NOTA: no hay endpoint de reactivación en el contrato actual
          (ver comentario en features/products/api.ts). Por eso el mensaje
          no promete que la acción sea reversible desde la UI.
        */}
        <p className="text-sm text-text-muted">Esta acción no se puede deshacer desde la aplicación.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setDeactivateTarget(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            loading={deactivate.isPending}
            onClick={() => {
              if (!deactivateTarget) return
              void deactivate
                .mutateAsync(deactivateTarget.id)
                .then(() => setDeactivateTarget(null))
                .catch((error: unknown) => setMutationError(message(error)))
            }}
          >
            Confirmar desactivación
          </Button>
        </div>
      </Modal>
    </div>
  )
}
