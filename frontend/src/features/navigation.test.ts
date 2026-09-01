import { describe, expect, it } from 'vitest'
import {
  authenticatedNavigation,
  canManageProducts,
  visibleNavigation,
  CUSTOMER_READ_ROLES,
  SALES_HISTORY_READ_ROLES,
} from './navigation'

describe('authenticated navigation registry', () => {
  it('uses the union of multi-role capabilities and never exposes Products to CONTADORA-only', () => {
    expect(visibleNavigation(['CONTADORA']).map((item) => item.id)).not.toContain('productos')
    expect(visibleNavigation(['CONTADORA', 'ENCARGADO']).map((item) => item.id)).toContain(
      'productos',
    )
    expect(canManageProducts(['CONTADORA', 'ENCARGADO'])).toBe(true)
    expect(canManageProducts(['MESERO'])).toBe(false)
    expect(canManageProducts(['COCINA'])).toBe(false)
    expect(canManageProducts(['CONTADORA'])).toBe(false)
    expect(canManageProducts(['EMPLEADO'])).toBe(false)
  })

  it('resolves one Attendance destination with manager precedence', () => {
    const attendance = authenticatedNavigation.find((item) => item.id === 'asistencia')!
    expect(typeof attendance.target === 'function' && attendance.target(['MESERO'])).toBe(
      '/mi-asistencia',
    )
    expect(
      typeof attendance.target === 'function' && attendance.target(['MESERO', 'ENCARGADO']),
    ).toBe('/asistencia')
  })

  it('limits purchases and own-shift navigation to their read capabilities', () => {
    expect(visibleNavigation(['CONTADORA']).map((item) => item.id)).toContain('compras')
    expect(visibleNavigation(['CONTADORA']).map((item) => item.id)).not.toContain('turnos')
    expect(visibleNavigation(['COCINA']).map((item) => item.id)).not.toContain('turnos')
    expect(visibleNavigation(['MESERO']).map((item) => item.id)).toContain('turnos')
  })

  it('exposes Clientes and Historial de ventas through their exact role unions', () => {
    const customers = authenticatedNavigation.find((item) => item.id === 'clientes')!
    const salesHistory = authenticatedNavigation.find((item) => item.id === 'historial-ventas')!

    expect(customers).toMatchObject({
      label: 'Clientes',
      readRoles: CUSTOMER_READ_ROLES,
      target: '/clientes',
    })
    expect(salesHistory).toMatchObject({
      label: 'Historial de ventas',
      readRoles: SALES_HISTORY_READ_ROLES,
      target: '/historial-ventas',
    })
    expect(visibleNavigation(['MESERO']).map((item) => item.id)).toEqual(
      expect.arrayContaining(['clientes', 'historial-ventas']),
    )
    expect(visibleNavigation(['CONTADORA']).map((item) => item.id)).not.toContain('clientes')
    expect(visibleNavigation(['CONTADORA']).map((item) => item.id)).toContain('historial-ventas')
    expect(visibleNavigation(['MESERO', 'ENCARGADO']).map((item) => item.id)).toEqual(
      expect.arrayContaining(['clientes', 'historial-ventas']),
    )
  })

  it('keeps parent navigation active for child routes', () => {
    const orders = authenticatedNavigation.find((item) => item.id === 'pedidos')!
    const inventory = authenticatedNavigation.find((item) => item.id === 'inventario')!
    const attendance = authenticatedNavigation.find((item) => item.id === 'asistencia')!
    expect(orders.matches('/pedidos/nuevo')).toBe(true)
    expect(orders.matches('/pedidos/123')).toBe(true)
    expect(inventory.matches('/inventario/movimientos')).toBe(true)
    expect(attendance.matches('/mi-asistencia')).toBe(true)
  })
})
