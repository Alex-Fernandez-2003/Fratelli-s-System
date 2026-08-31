import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InventoryBalancesPage, InventoryMovementsPage } from './pages'

const { useBalances, useInventorySummary, useManualMovement, useMovements } = vi.hoisted(() => ({
  useBalances: vi.fn(),
  useInventorySummary: vi.fn(),
  useManualMovement: vi.fn(),
  useMovements: vi.fn(),
}))
const { useAuth } = vi.hoisted(() => ({ useAuth: vi.fn() }))

vi.mock('./api', () => ({ useBalances, useInventorySummary, useManualMovement, useMovements }))
vi.mock('@/features/auth/AuthProvider', () => ({ useAuth }))

const lowItem = {
  productId: 'low',
  productName: 'Tomate',
  productType: 'INGREDIENT',
  currentQuantity: 5,
  inventoryUnitSymbol: 'kg',
  minStock: 10,
  isLowStock: true,
}
const negativeItem = {
  ...lowItem,
  productId: 'negative',
  productName: 'Harina',
  currentQuantity: -2,
  inventoryUnitSymbol: 'bolsas',
  minStock: null,
}
const healthyBalance = {
  ...lowItem,
  productId: 'healthy',
  productName: 'Aceite',
  currentQuantity: 20,
  isLowStock: false,
}
const refetch = vi.fn()

function renderPage(path = '/inventario', page = <InventoryBalancesPage />) {
  return render(<MemoryRouter initialEntries={[path]}>{page}</MemoryRouter>)
}

beforeEach(() => {
  refetch.mockReset()
  useAuth.mockReturnValue({ user: { roles: ['ADMINISTRADOR'] } })
  useBalances.mockReturnValue({
    data: { items: [healthyBalance], totalPages: 1, totalCount: 1 },
    isLoading: false,
    error: null,
    refetch,
  })
  useInventorySummary.mockReturnValue({
    data: {
      totalProducts: 3,
      lowStockCount: 2,
      negativeStockCount: 1,
      normalStockCount: 1,
      lowStockItems: [lowItem, negativeItem],
    },
    isLoading: false,
    error: null,
    refetch,
  })
  useManualMovement.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
  useMovements.mockReturnValue({
    data: { items: [], totalPages: 1, totalCount: 0 },
    isLoading: false,
    error: null,
    refetch,
  })
})

describe('InventoryBalancesPage HU-006', () => {
  it('shows a summary loading state before summary data is available', () => {
    useInventorySummary.mockReturnValue({ data: undefined, isLoading: true, error: null, refetch })

    renderPage()

    expect(screen.getByText('Cargando resumen de inventario…')).toHaveAttribute('role', 'status')
  })

  it('shows global summary values and opens Notifications from the warning details action', () => {
    renderPage()

    expect(screen.getAllByText('Stock bajo')).not.toHaveLength(0)
    expect(screen.getByText('Negativos')).toBeInTheDocument()
    expect(screen.getAllByText('Normal')).not.toHaveLength(0)
    expect(screen.getByText('Total productos')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Hay 2 productos con stock bajo')

    fireEvent.click(screen.getByRole('button', { name: 'Ver detalles' }))

    expect(screen.getByRole('link', { name: 'Notificaciones' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByText('Tomate')).toBeInTheDocument()
  })

  it('does not show a warning state when inventory is healthy', () => {
    useInventorySummary.mockReturnValue({
      data: {
        totalProducts: 1,
        lowStockCount: 0,
        negativeStockCount: 0,
        normalStockCount: 1,
        lowStockItems: [],
      },
      isLoading: false,
      error: null,
      refetch,
    })

    renderPage()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders all summary low-stock details with ordinary and negative semantic labels', () => {
    renderPage('/inventario?tab=notificaciones')

    expect(screen.getByText('Tomate')).toBeInTheDocument()
    expect(screen.getByText('Harina')).toBeInTheDocument()
    expect(screen.getByText('Stock bajo')).toBeInTheDocument()
    expect(screen.getByText('Saldo negativo')).toBeInTheDocument()
    expect(screen.getByText(/-2 bolsas/)).toBeInTheDocument()
  })

  it('renders the healthy Notifications empty state without claiming the catalog is empty', () => {
    useInventorySummary.mockReturnValue({
      data: {
        totalProducts: 1,
        lowStockCount: 0,
        negativeStockCount: 0,
        normalStockCount: 1,
        lowStockItems: [],
      },
      isLoading: false,
      error: null,
      refetch,
    })

    renderPage('/inventario?tab=notificaciones')

    expect(screen.getByText('No hay productos con stock bajo.')).toBeInTheDocument()
    expect(
      screen.queryByText('No hay productos disponibles en el catálogo.'),
    ).not.toBeInTheDocument()
  })

  it('shows Notifications summary failures in Spanish and retries the summary query', () => {
    useInventorySummary.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('offline'),
      refetch,
    })

    renderPage('/inventario?tab=notificaciones')

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las notificaciones de inventario.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('preserves loaded balances when only summary fails and offers summary retry', () => {
    useInventorySummary.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('offline'),
      refetch,
    })

    renderPage()

    expect(screen.getAllByText('Aceite')).not.toHaveLength(0)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo cargar el resumen de inventario.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(refetch).toHaveBeenCalledOnce()
  })

  it('uses the complete summary low-stock source, including negative items, when filtering', () => {
    renderPage()

    expect(screen.getAllByText('Aceite')).not.toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Stock bajo' }))

    expect(screen.getAllByText('Tomate')).not.toHaveLength(0)
    expect(screen.getAllByText('Harina')).not.toHaveLength(0)
    expect(screen.queryAllByText('Aceite')).toHaveLength(0)
  })

  it('paginates the complete summary low-stock set after filtering', () => {
    const lowStockItems = Array.from({ length: 21 }, (_, index) => ({
      ...lowItem,
      productId: `low-${index + 1}`,
      productName: `Producto bajo ${index + 1}`,
    }))
    useInventorySummary.mockReturnValue({
      data: {
        totalProducts: 21,
        lowStockCount: 21,
        negativeStockCount: 0,
        normalStockCount: 0,
        lowStockItems,
      },
      isLoading: false,
      error: null,
      refetch,
    })

    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Stock bajo' }))

    expect(screen.getAllByText('Producto bajo 1')).not.toHaveLength(0)
    expect(screen.queryAllByText('Producto bajo 21')).toHaveLength(0)
    expect(screen.getByText('Mostrando 1–20 de 21')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))

    expect(screen.queryAllByText('Producto bajo 1')).toHaveLength(0)
    expect(screen.getAllByText('Producto bajo 21')).not.toHaveLength(0)
    expect(screen.getByText('Mostrando 21–21 de 21')).toBeInTheDocument()
  })

  it.each(['MESERO', 'COCINA', 'CONTADORA'])(
    'keeps all inventory reading destinations but hides management actions for %s',
    (role) => {
      useAuth.mockReturnValue({ user: { roles: [role] } })

      renderPage()

      expect(screen.getByRole('link', { name: 'Notificaciones' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Movimientos' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Registrar entrada' })).not.toBeInTheDocument()
    },
  )

  it('shows Movimientos and management actions to an inventory manager', () => {
    renderPage()

    expect(screen.getByRole('link', { name: 'Movimientos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrar entrada' })).toBeInTheDocument()
  })

  it.each([
    [0, false],
    [1, true],
    [37, true],
  ])(
    'uses the global low-stock count %i for the Notifications badge',
    (lowStockCount, hasBadge) => {
      useInventorySummary.mockReturnValue({
        data: {
          totalProducts: 40,
          lowStockCount,
          negativeStockCount: 0,
          normalStockCount: 40 - lowStockCount,
          lowStockItems: [lowItem],
        },
        isLoading: false,
        error: null,
        refetch,
      })

      renderPage()

      const notifications = screen.getByRole('link', { name: 'Notificaciones' })
      expect(notifications).toHaveTextContent('Notificaciones')
      if (hasBadge)
        expect(notifications.querySelector('[data-testid="low-stock-badge"]')).toHaveTextContent(
          String(lowStockCount),
        )
      else expect(notifications.querySelector('[data-testid="low-stock-badge"]')).toBeNull()
    },
  )

  it('uses shared navigation with Movimientos active', () => {
    renderPage('/inventario/movimientos', <InventoryMovementsPage />)

    expect(screen.getByRole('link', { name: 'Existencias' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Notificaciones' })).toBeInTheDocument()
    expect(screen.getByText('Movimientos')).toHaveAttribute('aria-current', 'page')
  })
})
