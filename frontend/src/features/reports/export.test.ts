import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import type { AttendanceReport, InventoryReport, SalesReport } from './api'
import {
  buildXlsx,
  normalizeAttendanceReport,
  normalizeInventoryReport,
  normalizeSalesReport,
  serializeCsv,
  type NormalizedReport,
} from './export'

const salesReport: SalesReport = {
  salesCount: 2,
  totalAmount: 100,
  cashTotal: 40,
  qrTotal: 30,
  externalTotal: 30,
  directTotal: 70,
  pedidosYaTotal: 30,
  series: [{ businessDate: '2026-08-01', salesCount: 2, totalAmount: 100 }],
}

const inventoryReport: InventoryReport = {
  totalCount: 1,
  lowCount: 1,
  negativeCount: 0,
  items: [
    {
      productId: 'product-1',
      productName: 'Tomate',
      quantity: 2,
      minStock: 5,
      stockState: 'LOW',
      unitSymbol: 'kg',
    },
  ],
}

const attendanceReport: AttendanceReport = {
  items: [
    {
      employeeId: 'employee-1',
      fullName: 'Ana Pérez',
      attendanceCount: 2,
      workedMinutes: 960,
      workedHours: 16,
      lateCount: 1,
      absenceCount: 0,
      hourlyRate: 12.5,
      projectedPay: 200,
    },
  ],
  summary: {
    attendanceCount: 2,
    totalWorkedMinutes: 960,
    workedHours: 16,
    lateCount: 1,
    absenceCount: 0,
    projectedPay: 200,
  },
}

describe('report exports', () => {
  it('normalizes complete server responses into shared CSV/XLSX sections', () => {
    const report = normalizeSalesReport(salesReport, { from: '2026-08-01', to: '2026-08-31' })
    const csv = serializeCsv(report)
    expect(report.hasData).toBe(true)
    expect(csv).toContain('Ventas por fecha de negocio')
    expect(csv).toContain('2026-08-01,2,100')
    expect(csv).toContain('Distribución por canal')

    const workbook = XLSX.read(buildXlsx(report), { type: 'array' })
    expect(workbook.SheetNames).toEqual([
      'Resumen',
      'Ventas por fecha de negocio',
      'Distribución por canal',
    ])
    expect(
      XLSX.utils.sheet_to_json(workbook.Sheets['Ventas por fecha de negocio'], { header: 1 }),
    ).toContainEqual(['2026-08-01', 2, 100])
  })

  it('keeps inventory and attendance rows complete and protects spreadsheet formulas', () => {
    const inventory = normalizeInventoryReport(inventoryReport)
    const attendance = normalizeAttendanceReport(attendanceReport, {
      from: '2026-08-01',
      to: '2026-08-31',
    })
    expect(inventory.sections[0].rows).toHaveLength(1)
    expect(inventory.summary).toContainEqual({ label: 'Stock bajo', value: 1 })
    expect(attendance.sections[0].rows[0]).toMatchObject({
      fullName: 'Ana Pérez',
      projectedPay: 200,
    })

    const malicious: NormalizedReport = {
      title: 'Prueba',
      filename: 'prueba',
      hasData: true,
      filters: [],
      summary: [],
      sections: [
        {
          title: 'Datos',
          columns: [{ key: 'value', label: 'Valor' }],
          rows: [{ value: '=SUM(A1)' }],
        },
      ],
    }
    expect(serializeCsv(malicious)).toContain("'=SUM(A1)")
  })

  it('does not mark empty server responses as exportable', () => {
    const empty = normalizeInventoryReport({
      totalCount: 0,
      lowCount: 0,
      negativeCount: 0,
      items: [],
    })
    expect(empty.hasData).toBe(false)
    expect(serializeCsv(empty)).toContain('Reporte de inventario')
  })
})
