import { describe, expect, it, vi } from 'vitest'
import { createSessionCoordinator } from './session-coordinator'

describe('session coordinator', () => {
  it('keeps the access token in coordinator memory and clears it with a new epoch', () => {
    const session = createSessionCoordinator()
    session.accept({ accessToken: 'token-a' })
    expect(session.getAccessToken()).toBe('token-a')
    const epoch = session.clear()
    expect(epoch).toBe(1)
    expect(session.getAccessToken()).toBeUndefined()
  })

  it('shares one refresh among five callers and resets after settlement', async () => {
    const session = createSessionCoordinator()
    let resolveRefresh!: (value: { accessToken: string }) => void
    const refresh = vi.fn(
      () => new Promise<{ accessToken: string }>((resolve) => (resolveRefresh = resolve)),
    )
    const callers = Array.from({ length: 5 }, () => session.refresh(refresh))
    expect(refresh).toHaveBeenCalledOnce()
    resolveRefresh({ accessToken: 'token-b' })
    await expect(Promise.all(callers)).resolves.toEqual(Array(5).fill({ accessToken: 'token-b' }))
    expect(session.getAccessToken()).toBe('token-b')
    await session.refresh(async () => ({ accessToken: 'token-c' }))
    expect(session.getAccessToken()).toBe('token-c')
  })

  it('ignores a refresh that completes after clear and allows a later failed refresh', async () => {
    const session = createSessionCoordinator()
    let resolveRefresh!: (value: { accessToken: string }) => void
    const pending = session.refresh(
      () => new Promise<{ accessToken: string }>((resolve) => (resolveRefresh = resolve)),
    )
    session.clear()
    resolveRefresh({ accessToken: 'stale' })
    await expect(pending).resolves.toEqual({ accessToken: 'stale' })
    expect(session.getAccessToken()).toBeUndefined()
    await expect(session.refresh(async () => Promise.reject(new Error('offline')))).rejects.toThrow(
      'offline',
    )
    await session.refresh(async () => ({ accessToken: 'fresh' }))
    expect(session.getAccessToken()).toBe('fresh')
  })
})
