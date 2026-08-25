import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { sessionCoordinator } from '../../lib/auth/session-coordinator'
import { HttpError, setSessionRefreshHandler } from '../../lib/api/http-client'
import { authApi } from './api'
import type { AuthUser, LoginRequest } from './api'

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'
type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  pending: boolean
  error: string | null
  hasAnyRole: (roles: string[]) => boolean
  login: (request: LoginRequest) => Promise<void>
  logout: () => Promise<boolean>
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>('checking')
  const [user, setUser] = useState<AuthUser | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clearSession = useCallback(async () => {
    sessionCoordinator.clear()
    await queryClient.cancelQueries()
    queryClient.clear()
    setUser(null)
    setStatus('unauthenticated')
  }, [queryClient])

  const apply = useCallback((response: Awaited<ReturnType<typeof authApi.refresh>>) => {
    sessionCoordinator.accept(response)
    setUser(response.user)
    setStatus('authenticated')
    setError(null)
  }, [])

  useEffect(() => {
    let active = true
    setSessionRefreshHandler(async () => {
      try {
        const response = await sessionCoordinator.refresh(authApi.refresh)
        if (active) apply(response)
      } catch (cause) {
        if (cause instanceof HttpError && cause.status === 401) {
          if (active) await clearSession()
        }
        throw cause
      }
    })
    const epoch = sessionCoordinator.getEpoch()
    sessionCoordinator
      .refresh(authApi.refresh)
      .then((response) => {
        if (active && epoch === sessionCoordinator.getEpoch()) apply(response)
      })
      .catch((cause: unknown) => {
        if (!active || epoch !== sessionCoordinator.getEpoch()) return
        if (cause instanceof HttpError && cause.status === 401) {
          setStatus('unauthenticated')
          return
        }
        setStatus('unauthenticated')
        setError('No se pudo restaurar la sesión. Inténtalo de nuevo.')
      })
    return () => {
      active = false
      setSessionRefreshHandler(undefined)
    }
  }, [apply, clearSession])

  const login = useCallback(
    async (request: LoginRequest) => {
      setPending(true)
      setError(null)
      try {
        apply(await authApi.login(request))
      } catch (cause) {
        setError(
          cause instanceof HttpError && cause.status === 401
            ? 'Usuario o contraseña incorrectos.'
            : 'No se pudo iniciar sesión. Inténtalo de nuevo.',
        )
        throw cause
      } finally {
        setPending(false)
      }
    },
    [apply],
  )
  const logout = useCallback(async () => {
    setPending(true)
    setError(null)
    try {
      await authApi.logout()
      await clearSession()
      return true
    } catch {
      setError('No se pudo cerrar sesión. Inténtalo de nuevo.')
      return false
    } finally {
      setPending(false)
    }
  }, [clearSession])
  const value = useMemo(
    () => ({
      status,
      user,
      pending,
      error,
      login,
      logout,
      hasAnyRole: (roles: string[]) => !!user && roles.some((role) => user.roles.includes(role)),
    }),
    [status, user, pending, error, login, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
