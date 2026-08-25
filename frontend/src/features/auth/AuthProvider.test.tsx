import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sessionCoordinator } from '../../lib/auth/session-coordinator'
import { AuthProvider, useAuth } from './AuthProvider'

const { refresh, login, logout } = vi.hoisted(() => ({
  refresh: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}))
vi.mock('./api', () => ({ authApi: { refresh, login, logout } }))

const authenticatedResponse = {
  accessToken: 'private',
  expiresAt: '2026-01-01',
  user: { id: '1', username: 'ana', fullName: null, employeeId: null, roles: ['EMPLEADO'] },
}

function Probe() {
  const auth = useAuth()
  return (
    <>
      <span>{auth.status}</span>
      <span>{auth.user?.username ?? 'none'}</span>
      <span>{auth.error ?? 'no-error'}</span>
      <button onClick={() => void auth.login({ username: 'ana', password: 'secret' })}>
        login
      </button>
      <button onClick={() => void auth.logout()}>logout</button>
    </>
  )
}
function renderAuth(queryClient = new QueryClient()) {
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </QueryClientProvider>,
    ),
  }
}

afterEach(() => {
  vi.clearAllMocks()
  sessionCoordinator.clear()
})

describe('AuthProvider', () => {
  it('moves from checking to unauthenticated on refresh 401 and authenticates a login response without exposing a token', async () => {
    refresh.mockRejectedValueOnce({ status: 401 })
    login.mockResolvedValueOnce(authenticatedResponse)
    renderAuth()
    expect(screen.getByText('checking')).toBeInTheDocument()
    await screen.findByText('unauthenticated')
    fireEvent.click(screen.getByRole('button', { name: 'login' }))
    await screen.findByText('authenticated')
    expect(screen.getByText('ana')).toBeInTheDocument()
    expect(screen.queryByText('private')).not.toBeInTheDocument()
  })

  it('offers exact role matching for authenticated users', async () => {
    refresh.mockResolvedValueOnce({
      ...authenticatedResponse,
      user: { ...authenticatedResponse.user, roles: ['ADMINISTRADOR', 'EMPLEADO'] },
    })
    function Roles() {
      const auth = useAuth()
      return (
        <span>
          {String(auth.hasAnyRole(['ADMINISTRADOR']))}:{String(auth.hasAnyRole(['COCINA']))}
        </span>
      )
    }
    render(
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <Roles />
        </AuthProvider>
      </QueryClientProvider>,
    )
    await waitFor(() => expect(screen.getByText('true:false')).toBeInTheDocument())
  })

  it('clears token, state, and private query cache after a confirmed 204 logout', async () => {
    refresh.mockResolvedValueOnce(authenticatedResponse)
    logout.mockResolvedValueOnce(undefined)
    const queryClient = new QueryClient()
    const cancelQueries = vi.spyOn(queryClient, 'cancelQueries')
    const clear = vi.spyOn(queryClient, 'clear')
    renderAuth(queryClient)
    await screen.findByText('authenticated')
    fireEvent.click(screen.getByRole('button', { name: 'logout' }))
    await screen.findByText('unauthenticated')
    expect(sessionCoordinator.getAccessToken()).toBeUndefined()
    expect(cancelQueries).toHaveBeenCalledOnce()
    expect(clear).toHaveBeenCalledOnce()
  })

  it('preserves the authenticated session and cache after remote logout failure', async () => {
    refresh.mockResolvedValueOnce(authenticatedResponse)
    logout.mockRejectedValueOnce(new Error('offline'))
    const queryClient = new QueryClient()
    const clear = vi.spyOn(queryClient, 'clear')
    renderAuth(queryClient)
    await screen.findByText('authenticated')
    fireEvent.click(screen.getByRole('button', { name: 'logout' }))
    await screen.findByText('No se pudo cerrar sesión. Inténtalo de nuevo.')
    expect(screen.getByText('authenticated')).toBeInTheDocument()
    expect(sessionCoordinator.getAccessToken()).toBe('private')
    expect(clear).not.toHaveBeenCalled()
  })

  it('ignores a late bootstrap refresh after logout advances the session epoch', async () => {
    let resolveRefresh!: (value: typeof authenticatedResponse) => void
    refresh.mockReturnValueOnce(
      new Promise<typeof authenticatedResponse>((resolve) => {
        resolveRefresh = resolve
      }),
    )
    logout.mockResolvedValueOnce(undefined)
    renderAuth()
    fireEvent.click(screen.getByRole('button', { name: 'logout' }))
    await screen.findByText('unauthenticated')
    resolveRefresh(authenticatedResponse)
    await waitFor(() => expect(screen.getByText('unauthenticated')).toBeInTheDocument())
    expect(screen.getByText('none')).toBeInTheDocument()
    expect(sessionCoordinator.getAccessToken()).toBeUndefined()
  })
})
