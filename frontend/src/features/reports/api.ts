import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { components } from '@/types/api.generated'
import { endpoints } from '@/lib/api/endpoints'
import { httpClient } from '@/lib/api/http-client'
import { businessDate } from '@/lib/business-time'

export type SalesReport = components['schemas']['SalesReportDto']
export type SalesReportSeries = components['schemas']['SalesReportSeriesDto']
export type InventoryReport = components['schemas']['InventoryReportDto']
export type InventoryReportItem = components['schemas']['InventoryReportItemDto']
export type AttendanceReport = components['schemas']['AttendanceReportDto']
export type AttendanceReportItem = components['schemas']['AttendanceReportItemDto']
export type AttendanceReportSummary = components['schemas']['AttendanceReportSummaryDto']
export type ShiftType = Exclude<components['schemas']['ShiftType'], null>
export type SalesChannel = components['schemas']['SalesChannel']

export type SalesReportFilters = {
  from?: string
  to?: string
  shiftType?: ShiftType
  salesChannel?: SalesChannel
}

export type AttendanceReportFilters = {
  from?: string
  to?: string
  employeeId?: string
  shiftType?: ShiftType
}

export const SHIFT_TYPES = ['MORNING', 'NIGHT'] as const satisfies readonly ShiftType[]
export const SALES_CHANNELS = ['DIRECT', 'PEDIDOSYA'] as const satisfies readonly SalesChannel[]

function optionalText(value: string | undefined) {
  return value?.trim() || undefined
}

export function normalizeSalesReportFilters(filters: SalesReportFilters): SalesReportFilters {
  return {
    from: optionalText(filters.from),
    to: optionalText(filters.to),
    shiftType: filters.shiftType || undefined,
    salesChannel: filters.salesChannel || undefined,
  }
}

export function normalizeAttendanceReportFilters(
  filters: AttendanceReportFilters,
): AttendanceReportFilters {
  return {
    from: optionalText(filters.from),
    to: optionalText(filters.to),
    employeeId: optionalText(filters.employeeId),
    shiftType: filters.shiftType || undefined,
  }
}

export function createBusinessMonthFilters(date = new Date()) {
  const today = businessDate(date)
  return { from: `${today.slice(0, 7)}-01`, to: today }
}

export function createSalesReportFilters(date = new Date()): SalesReportFilters {
  return createBusinessMonthFilters(date)
}

export function createAttendanceReportFilters(date = new Date()): AttendanceReportFilters {
  return createBusinessMonthFilters(date)
}

export function updateSalesReportFilters(
  filters: SalesReportFilters,
  updates: Partial<SalesReportFilters>,
): SalesReportFilters {
  return { ...filters, ...updates }
}

export function updateAttendanceReportFilters(
  filters: AttendanceReportFilters,
  updates: Partial<AttendanceReportFilters>,
): AttendanceReportFilters {
  return { ...filters, ...updates }
}

export function hasInvalidDateRange(filters: { from?: string; to?: string }) {
  return Boolean(filters.from && filters.to && filters.from > filters.to)
}

export function useSalesReportFilterState(date = new Date()) {
  const [filters, setFilters] = useState(() => createSalesReportFilters(date))
  return {
    filters,
    updateFilters: (updates: Partial<SalesReportFilters>) =>
      setFilters((current) => updateSalesReportFilters(current, updates)),
    clearFilters: () => setFilters(createSalesReportFilters()),
  }
}

export function useAttendanceReportFilterState(date = new Date()) {
  const [filters, setFilters] = useState(() => createAttendanceReportFilters(date))
  return {
    filters,
    updateFilters: (updates: Partial<AttendanceReportFilters>) =>
      setFilters((current) => updateAttendanceReportFilters(current, updates)),
    clearFilters: () => setFilters(createAttendanceReportFilters()),
  }
}

export const reportsKeys = {
  all: ['reports'] as const,
  sales: (filters: SalesReportFilters) =>
    [...reportsKeys.all, 'sales', normalizeSalesReportFilters(filters)] as const,
  attendance: (filters: AttendanceReportFilters) =>
    [...reportsKeys.all, 'attendance', normalizeAttendanceReportFilters(filters)] as const,
  inventory: () => [...reportsKeys.all, 'inventory'] as const,
}

export const reportsApi = {
  sales: (filters: SalesReportFilters = {}) => {
    const values = normalizeSalesReportFilters(filters)
    return httpClient.get<SalesReport>(endpoints.reports.sales(values))
  },
  attendance: (filters: AttendanceReportFilters = {}) => {
    const values = normalizeAttendanceReportFilters(filters)
    return httpClient.get<AttendanceReport>(endpoints.reports.attendance(values))
  },
  inventory: () => httpClient.get<InventoryReport>(endpoints.reports.inventory()),
}

export function useSalesReport(filters: SalesReportFilters) {
  const values = normalizeSalesReportFilters(filters)
  return useQuery({
    queryKey: reportsKeys.sales(values),
    queryFn: () => reportsApi.sales(values),
    enabled: !hasInvalidDateRange(values),
  })
}

export function useAttendanceReport(filters: AttendanceReportFilters) {
  const values = normalizeAttendanceReportFilters(filters)
  return useQuery({
    queryKey: reportsKeys.attendance(values),
    queryFn: () => reportsApi.attendance(values),
    enabled: !hasInvalidDateRange(values),
  })
}

export function useInventoryReport() {
  return useQuery({
    queryKey: reportsKeys.inventory(),
    queryFn: reportsApi.inventory,
    placeholderData: (previous) => previous,
    refetchInterval: 30_000,
  })
}
