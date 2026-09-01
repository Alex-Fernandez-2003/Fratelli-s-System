import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ShiftsPage } from './ShiftsPage'
import { HttpError } from '@/lib/api/http-client'

let shiftContextState: {
  data?: {
    businessDate: string
    shifts: Array<{ id: string; type: string; status: string; employeeIds: string[] }>
  }
  isLoading?: boolean
  isError?: boolean
  error?: unknown
} = {}

let openMutateAsync: ReturnType<typeof vi.fn>
let openState: { isPending: boolean; isError: boolean; error?: unknown } = {
  isPending: false,
  isError: false,
}

vi.mock('./api', async () => {
  const actual = await vi.importActual<typeof import('./api')>('./api')
  return {
    ...actual,
    useShiftContext: () => ({
      data: shiftContextState.data,
      isLoading: shiftContextState.isLoading ?? false,
      isError: shiftContextState.isError ?? false,
      error: shiftContextState.error,
      refetch: vi.fn(),
    }),
    useOpenShift: () => ({
      mutateAsync: openMutateAsync,
      isPending: openState.isPending,
      isError: openState.isError,
      error: openState.error,
    }),
    useUpdateShiftAssignments: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useHandoverShift: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  }
})

vi.mock('@/features/attendance/hooks', () => ({
  useAttendanceToday: () => ({
    data: { items: [] },
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { fullName: 'Admin', username: 'admin', roles: ['ADMINISTRADOR'] } }),
}))

function renderPage() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ShiftsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ShiftsPage open jornada', () => {
  beforeEach(() => {
    shiftContextState = {
      isError: true,
      error: new HttpError(404, {}),
      data: undefined,
    }
    openMutateAsync = vi.fn().mockResolvedValue({ businessDate: '2026-08-31', shifts: [] })
    openState = { isPending: false, isError: false }
  })

  it('clicking Iniciar jornada opens modal', async () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Iniciar jornada' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar jornada' }))
    expect(await screen.findByText('Iniciar jornada', { selector: 'h2' })).toBeInTheDocument()
    expect(
      screen.getByText('Ingresa los fondos con los que inicia la caja de hoy.'),
    ).toBeInTheDocument()
  })

  it('modal contains opening amount and petty cash opening amount', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar jornada' }))
    await screen.findByText('Iniciar jornada', { selector: 'h2' })
    expect(screen.getByLabelText('Efectivo inicial de caja')).toBeInTheDocument()
    expect(screen.getByLabelText('Efectivo inicial de caja chica')).toBeInTheDocument()
  })

  it('empty amount blocked', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar jornada' }))
    await screen.findByText('Iniciar jornada', { selector: 'h2' })
    const confirmButtons = screen.getAllByRole('button', { name: 'Iniciar jornada' })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    expect(await screen.findByText('Ingresá el efectivo inicial de caja.')).toBeInTheDocument()
    expect(openMutateAsync).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja'), {
      target: { value: '100' },
    })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    expect(
      await screen.findByText('Ingresá el efectivo inicial de caja chica.'),
    ).toBeInTheDocument()
    expect(openMutateAsync).not.toHaveBeenCalled()
  })

  it('invalid amount blocked', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar jornada' }))
    await screen.findByText('Iniciar jornada', { selector: 'h2' })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja'), {
      target: { value: 'abc' },
    })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja chica'), {
      target: { value: '100' },
    })
    const confirmButtons = screen.getAllByRole('button', { name: 'Iniciar jornada' })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    expect(
      await screen.findByText('El efectivo inicial de caja no es un monto válido.'),
    ).toBeInTheDocument()
    expect(openMutateAsync).not.toHaveBeenCalled()
  })

  it('negative amount blocked', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar jornada' }))
    await screen.findByText('Iniciar jornada', { selector: 'h2' })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja'), { target: { value: '-5' } })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja chica'), {
      target: { value: '10' },
    })
    const confirmButtons = screen.getAllByRole('button', { name: 'Iniciar jornada' })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    expect(
      await screen.findByText('El efectivo inicial de caja no puede ser negativo.'),
    ).toBeInTheDocument()
    expect(openMutateAsync).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja chica'), {
      target: { value: '-1' },
    })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    expect(
      await screen.findByText('El efectivo inicial de caja chica no puede ser negativo.'),
    ).toBeInTheDocument()
  })

  it('zero is accepted', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar jornada' }))
    await screen.findByText('Iniciar jornada', { selector: 'h2' })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja'), { target: { value: '0' } })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja chica'), {
      target: { value: '0' },
    })
    const confirmButtons = screen.getAllByRole('button', { name: 'Iniciar jornada' })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    await waitFor(() =>
      expect(openMutateAsync).toHaveBeenCalledWith({ openingAmount: 0, pettyCashOpeningAmount: 0 }),
    )
  })

  it('valid values produce exact request with decimals and comma', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar jornada' }))
    await screen.findByText('Iniciar jornada', { selector: 'h2' })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja'), {
      target: { value: '500' },
    })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja chica'), {
      target: { value: '100,50' },
    })
    const confirmButtons = screen.getAllByRole('button', { name: 'Iniciar jornada' })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    await waitFor(() =>
      expect(openMutateAsync).toHaveBeenCalledWith({
        openingAmount: 500,
        pettyCashOpeningAmount: 100.5,
      }),
    )
  })

  it('pending prevents double submit', async () => {
    const client = new QueryClient()
    const view = render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ShiftsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar jornada' }))
    await screen.findByText('Ingresa los fondos con los que inicia la caja de hoy.')
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja'), {
      target: { value: '100' },
    })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja chica'), {
      target: { value: '50' },
    })
    // Simulate pending by mocking mutate to never resolve
    openMutateAsync = vi.fn().mockImplementation(() => new Promise(() => {}))
    openState.isPending = true
    // Force rerender to reflect pending state
    view.rerender(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <ShiftsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    const confirmBtn = screen
      .getAllByText('Iniciar jornada')
      .pop()
      ?.closest('button') as HTMLButtonElement
    expect(confirmBtn.disabled).toBe(true)
  })

  it('cancel makes no request', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar jornada' }))
    await screen.findByText('Iniciar jornada', { selector: 'h2' })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja'), {
      target: { value: '100' },
    })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja chica'), {
      target: { value: '50' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(openMutateAsync).not.toHaveBeenCalled()
    expect(
      screen.queryByText('Ingresa los fondos con los que inicia la caja de hoy.'),
    ).not.toBeInTheDocument()
  })

  it('success closes modal', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar jornada' }))
    await screen.findByText('Iniciar jornada', { selector: 'h2' })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja'), {
      target: { value: '500' },
    })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja chica'), {
      target: { value: '100' },
    })
    const confirmButtons = screen.getAllByRole('button', { name: 'Iniciar jornada' })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    await waitFor(() => expect(openMutateAsync).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        screen.queryByText('Ingresa los fondos con los que inicia la caja de hoy.'),
      ).not.toBeInTheDocument(),
    )
  })

  it('server 400 preserves form and shows safe error', async () => {
    const error400 = new HttpError(400, { detail: 'INVALID_REQUEST' } as unknown as Record<
      string,
      unknown
    >)
    openMutateAsync = vi.fn().mockRejectedValue(error400)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar jornada' }))
    await screen.findByText('Iniciar jornada', { selector: 'h2' })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja'), {
      target: { value: '500' },
    })
    fireEvent.change(screen.getByLabelText('Efectivo inicial de caja chica'), {
      target: { value: '100' },
    })
    const confirmButtons = screen.getAllByRole('button', { name: 'Iniciar jornada' })
    fireEvent.click(confirmButtons[confirmButtons.length - 1])
    expect(
      await screen.findByText('No se pudo iniciar la jornada. Verifica los montos de apertura.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Efectivo inicial de caja')).toHaveValue('500')
    expect(screen.getByLabelText('Efectivo inicial de caja chica')).toHaveValue('100')
  })
})
