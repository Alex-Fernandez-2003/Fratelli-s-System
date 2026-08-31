import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProductsPage } from './pages'

const {
  useCategoriesList,
  useCreateProduct,
  useDeactivateProduct,
  useProductsList,
  useUnitsList,
  useUpdateProduct,
} = vi.hoisted(() => ({
  useCategoriesList: vi.fn(),
  useCreateProduct: vi.fn(),
  useDeactivateProduct: vi.fn(),
  useProductsList: vi.fn(),
  useUnitsList: vi.fn(),
  useUpdateProduct: vi.fn(),
}))
const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }))

vi.mock('./api', () => ({
  useCategoriesList,
  useCreateProduct,
  useDeactivateProduct,
  useProductsList,
  useUnitsList,
  useUpdateProduct,
}))
vi.mock('@/features/auth/AuthProvider', () => ({ useAuth }))

const product = {
  id: 'product-1',
  name: 'Preparación',
  productType: 'PREPARATION',
  categoryId: null,
  inventoryUnitId: 'unit-1',
  preparationArea: 'KITCHEN',
  isSellable: false,
  salePrice: null,
  minStock: null,
  isActive: true,
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductsPage />
    </MemoryRouter>,
  )
}

describe('ProductsPage permissions', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { roles: ['ADMINISTRADOR'] } })
    useProductsList.mockReturnValue({
      data: { items: [product], totalPages: 1, totalCount: 1 },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
    useCategoriesList.mockReturnValue({ data: { items: [] } })
    useUnitsList.mockReturnValue({ data: { items: [] } })
    useCreateProduct.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
    useUpdateProduct.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
    useDeactivateProduct.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
  })

  it.each(['ADMINISTRADOR', 'ENCARGADO'])('shows product mutations to %s', (role) => {
    useAuth.mockReturnValue({ user: { roles: [role] } })

    renderPage()

    expect(screen.getByRole('button', { name: 'Nuevo producto' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Editar Preparación' })).not.toHaveLength(0)
    expect(
      screen.getAllByRole('link', { name: 'Editar composición de Preparación' }),
    ).not.toHaveLength(0)
    expect(screen.getAllByRole('button', { name: 'Desactivar Preparación' })).not.toHaveLength(0)
  })

  it('keeps product mutation controls absent for EMPLEADO', () => {
    useAuth.mockReturnValue({ user: { roles: ['EMPLEADO'] } })

    renderPage()

    expect(screen.queryByRole('button', { name: 'Nuevo producto' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Editar Preparación' })).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Editar composición de Preparación' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Desactivar Preparación' })).not.toBeInTheDocument()
  })
})
