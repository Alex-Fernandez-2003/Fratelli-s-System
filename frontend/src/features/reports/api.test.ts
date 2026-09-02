import { beforeEach, describe, expect, it, vi } from 'vitest'
import { businessDate } from '@/lib/business-time'
import { httpClient } from '@/lib/api/http-client'
import {
  createAttendanceReportFilters,
  createSalesReportFilters,
  hasInvalidDateRange,
  normalizeSalesReportFilters,
  reportsApi,
  reportsKeys,
  updateAttendanceReportFilters,
  updateSalesReportFilters,
} from './api'

vi.mock('@/lib/api/http-client', () => ({
  httpClient: { get: vi.fn() },
}))

describe('reports query layer', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uses the La Paz business date for default report bounds', () => {
    const instant = new Date('2026-08-31T02:30:00.000Z')
    expect(businessDate(instant)).toBe('2026-08-30')
    expect(createSalesReportFilters(instant)).toEqual({ from: '2026-08-01', to: '2026-08-30' })
    expect(createAttendanceReportFilters(instant)).toEqual({ from: '2026-08-01', to: '2026-08-30' })
  })

  it('normalizes every server filter and maps reports to typed endpoints', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({})
    const salesFilters = {
      from: ' 2026-08-01 ',
      to: '2026-08-30',
      shiftType: 'NIGHT' as const,
      salesChannel: 'PEDIDOSYA' as const,
    }
    await reportsApi.sales(salesFilters)
    expect(httpClient.get).toHaveBeenCalledWith(
      '/api/v1/reports/sales?from=2026-08-01&to=2026-08-30&shiftType=NIGHT&salesChannel=PEDIDOSYA',
    )

    await reportsApi.attendance({
      from: '2026-08-01',
      to: '2026-08-30',
      employeeId: ' employee-1 ',
      shiftType: 'MORNING',
    })
    expect(httpClient.get).toHaveBeenLastCalledWith(
      '/api/v1/reports/attendance?from=2026-08-01&to=2026-08-30&employeeId=employee-1&shiftType=MORNING',
    )

    await reportsApi.inventory()
    expect(httpClient.get).toHaveBeenLastCalledWith('/api/v1/reports/inventory')
  })

  it('keeps filters and query keys deterministic while rejecting reversed ranges', () => {
    const sales = normalizeSalesReportFilters({ from: ' 2026-08-30 ', salesChannel: undefined })
    expect(updateSalesReportFilters(sales, { shiftType: 'MORNING' })).toMatchObject({
      from: '2026-08-30',
      shiftType: 'MORNING',
    })
    expect(
      updateAttendanceReportFilters(
        { from: '2026-08-01', to: '2026-08-30' },
        { employeeId: 'e-1' },
      ),
    ).toEqual({
      from: '2026-08-01',
      to: '2026-08-30',
      employeeId: 'e-1',
    })
    expect(hasInvalidDateRange({ from: '2026-08-31', to: '2026-08-01' })).toBe(true)
    expect(hasInvalidDateRange({ from: '2026-08-01', to: '2026-08-01' })).toBe(false)
    expect(reportsKeys.sales({ from: '2026-08-01' })).not.toEqual(
      reportsKeys.sales({ from: '2026-08-02' }),
    )
  })
})
