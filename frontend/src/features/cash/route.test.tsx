import '@testing-library/jest-dom/vitest'
import { describe, it, expect } from 'vitest'
import { SHIFT_MANAGE_ROLES } from '@/features/shifts/api'
import { CASH_HISTORY_READ_ROLES } from './api'

describe('cash route authorization', () => {
  const canAccessCash = (roles: string[]) =>
    roles.some((r) => (SHIFT_MANAGE_ROLES as readonly string[]).includes(r))
  const canAccessCashHistory = (roles: string[]) =>
    roles.some((r) => (CASH_HISTORY_READ_ROLES as readonly string[]).includes(r))

  it('keeps cash closing restricted to CashManage roles', () => {
    expect(canAccessCash(['ADMINISTRADOR'])).toBe(true)
    expect(canAccessCash(['ENCARGADO'])).toBe(true)
    expect(canAccessCash(['CONTADORA'])).toBe(false)
    expect(canAccessCash(['MESERO'])).toBe(false)
    expect(canAccessCash(['COCINA'])).toBe(false)
    expect(canAccessCash(['EMPLEADO'])).toBe(false)
    expect(canAccessCash(['CONTADORA', 'ENCARGADO'])).toBe(true)
  })

  it('allows cash closing history to the CashHistory role union', () => {
    expect(canAccessCashHistory(['ADMINISTRADOR'])).toBe(true)
    expect(canAccessCashHistory(['ENCARGADO'])).toBe(true)
    expect(canAccessCashHistory(['CONTADORA'])).toBe(true)
    expect(canAccessCashHistory(['MESERO'])).toBe(false)
    expect(canAccessCashHistory(['COCINA'])).toBe(false)
    expect(canAccessCashHistory(['EMPLEADO'])).toBe(false)
    expect(canAccessCashHistory(['MESERO', 'ENCARGADO'])).toBe(true)
    expect(canAccessCashHistory(['CONTADORA', 'MESERO'])).toBe(true)
  })

  it('keeps direct history URL and CTA unavailable to unauthorized roles', () => {
    expect(canAccessCashHistory(['ADMINISTRADOR'])).toBe(true)
    expect(canAccessCashHistory(['MESERO'])).toBe(false)
  })
})
