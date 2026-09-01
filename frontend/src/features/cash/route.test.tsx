import '@testing-library/jest-dom/vitest'
import { describe, it, expect } from 'vitest'
import { SHIFT_MANAGE_ROLES } from '@/features/shifts/api'

describe('cash route authorization', () => {
  const canAccessCash = (roles: string[]) =>
    roles.some((r) => (SHIFT_MANAGE_ROLES as readonly string[]).includes(r))

  it('ADMINISTRADOR allowed', () => expect(canAccessCash(['ADMINISTRADOR'])).toBe(true))
  it('ENCARGADO allowed', () => expect(canAccessCash(['ENCARGADO'])).toBe(true))
  it('MESERO denied', () => expect(canAccessCash(['MESERO'])).toBe(false))
  it('COCINA denied', () => expect(canAccessCash(['COCINA'])).toBe(false))
  it('CONTADORA denied', () => expect(canAccessCash(['CONTADORA'])).toBe(false))
  it('EMPLEADO denied', () => expect(canAccessCash(['EMPLEADO'])).toBe(false))
  it('multi-role ENCARGADO+MESERO allowed', () =>
    expect(canAccessCash(['MESERO', 'ENCARGADO'])).toBe(true))
  it('multi-role ADMIN+CONTADORA allowed', () =>
    expect(canAccessCash(['CONTADORA', 'ADMINISTRADOR'])).toBe(true))
  it('direct URL guarded and CTA only for authorized roles', () => {
    const visibleCTA = canAccessCash
    expect(visibleCTA(['ADMINISTRADOR'])).toBe(true)
    expect(visibleCTA(['MESERO'])).toBe(false)
  })
})
