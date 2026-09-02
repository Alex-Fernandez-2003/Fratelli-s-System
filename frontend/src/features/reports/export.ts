import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import { businessDate } from '@/lib/business-time'
import type {
  AttendanceReport,
  AttendanceReportFilters,
  InventoryReport,
  SalesReport,
  SalesReportFilters,
} from './api'

export type ExportFormat = 'csv' | 'xlsx' | 'pdf'
export type ExportValue = string | number | boolean | null
export type ExportColumn = { key: string; label: string }
export type ExportSection = {
  title: string
  columns: ExportColumn[]
  rows: Array<Record<string, ExportValue>>
}
export type NormalizedReport = {
  title: string
  filename: string
  hasData: boolean
  filters: Array<{ label: string; value: string }>
  summary: Array<{ label: string; value: ExportValue }>
  sections: ExportSection[]
}

const paymentLabels = {
  cashTotal: 'Efectivo',
  qrTotal: 'QR',
  externalTotal: 'Pago externo',
} as const

function numberValue(value: number | string) {
  return Number(value)
}

function reportFilename(slug: string, from?: string) {
  return `${slug}-${from ?? businessDate()}`
}

function filterValue(value: string | undefined) {
  return value || 'Todos'
}

export function normalizeSalesReport(
  report: SalesReport,
  filters: SalesReportFilters = {},
): NormalizedReport {
  const values = {
    from: filters.from,
    to: filters.to,
    shiftType: filters.shiftType,
    salesChannel: filters.salesChannel,
  }
  return {
    title: 'Reporte de ventas',
    filename: reportFilename('reporte-ventas', values.from),
    hasData: numberValue(report.salesCount) > 0,
    filters: [
      { label: 'Desde', value: filterValue(values.from) },
      { label: 'Hasta', value: filterValue(values.to) },
      { label: 'Turno', value: filterValue(values.shiftType) },
      { label: 'Canal', value: filterValue(values.salesChannel) },
    ],
    summary: [
      { label: 'Ventas', value: numberValue(report.salesCount) },
      { label: 'Total vendido', value: numberValue(report.totalAmount) },
      { label: paymentLabels.cashTotal, value: numberValue(report.cashTotal) },
      { label: paymentLabels.qrTotal, value: numberValue(report.qrTotal) },
      { label: paymentLabels.externalTotal, value: numberValue(report.externalTotal) },
      { label: 'Directo', value: numberValue(report.directTotal) },
      { label: 'PedidosYa', value: numberValue(report.pedidosYaTotal) },
    ],
    sections: [
      {
        title: 'Ventas por fecha de negocio',
        columns: [
          { key: 'businessDate', label: 'BusinessDate' },
          { key: 'salesCount', label: 'Ventas' },
          { key: 'totalAmount', label: 'Total vendido' },
        ],
        rows: report.series.map((row) => ({
          businessDate: row.businessDate,
          salesCount: numberValue(row.salesCount),
          totalAmount: numberValue(row.totalAmount),
        })),
      },
      {
        title: 'Distribución por canal',
        columns: [
          { key: 'channel', label: 'Canal' },
          { key: 'totalAmount', label: 'Total vendido' },
        ],
        rows: [
          { channel: 'DIRECT', totalAmount: numberValue(report.directTotal) },
          { channel: 'PEDIDOSYA', totalAmount: numberValue(report.pedidosYaTotal) },
        ],
      },
    ],
  }
}

export function normalizeInventoryReport(report: InventoryReport): NormalizedReport {
  return {
    title: 'Reporte de inventario',
    filename: reportFilename('reporte-inventario'),
    hasData: report.items.length > 0,
    filters: [{ label: 'Tipo', value: 'Snapshot actual' }],
    summary: [
      { label: 'Total de productos', value: numberValue(report.totalCount) },
      { label: 'Stock bajo', value: numberValue(report.lowCount) },
      { label: 'Saldo negativo', value: numberValue(report.negativeCount) },
    ],
    sections: [
      {
        title: 'Existencias',
        columns: [
          { key: 'productName', label: 'Producto' },
          { key: 'quantity', label: 'Cantidad' },
          { key: 'unitSymbol', label: 'Unidad' },
          { key: 'minStock', label: 'Stock mínimo' },
          { key: 'stockState', label: 'Estado' },
        ],
        rows: report.items.map((row) => ({
          productName: row.productName,
          quantity: numberValue(row.quantity),
          unitSymbol: row.unitSymbol,
          minStock: row.minStock === null ? null : numberValue(row.minStock),
          stockState: row.stockState,
        })),
      },
    ],
  }
}

export function normalizeAttendanceReport(
  report: AttendanceReport,
  filters: AttendanceReportFilters = {},
): NormalizedReport {
  return {
    title: 'Reporte de asistencia',
    filename: reportFilename('reporte-asistencia', filters.from),
    hasData: report.items.length > 0,
    filters: [
      { label: 'Desde', value: filterValue(filters.from) },
      { label: 'Hasta', value: filterValue(filters.to) },
      { label: 'Empleado', value: filterValue(filters.employeeId) },
      { label: 'Turno', value: filterValue(filters.shiftType) },
    ],
    summary: [
      { label: 'Asistencias', value: numberValue(report.summary.attendanceCount) },
      { label: 'Minutos trabajados', value: numberValue(report.summary.totalWorkedMinutes) },
      { label: 'Horas trabajadas', value: numberValue(report.summary.workedHours) },
      { label: 'Llegadas tarde', value: numberValue(report.summary.lateCount) },
      { label: 'Ausencias', value: numberValue(report.summary.absenceCount) },
      { label: 'Pago proyectado', value: numberValue(report.summary.projectedPay) },
    ],
    sections: [
      {
        title: 'Resumen por empleado',
        columns: [
          { key: 'employeeId', label: 'ID empleado' },
          { key: 'fullName', label: 'Empleado' },
          { key: 'attendanceCount', label: 'Asistencias' },
          { key: 'lateCount', label: 'Llegadas tarde' },
          { key: 'absenceCount', label: 'Ausencias' },
          { key: 'workedMinutes', label: 'Minutos trabajados' },
          { key: 'workedHours', label: 'Horas trabajadas' },
          { key: 'hourlyRate', label: 'Tarifa por hora' },
          { key: 'projectedPay', label: 'Pago proyectado' },
        ],
        rows: report.items.map((row) => ({
          employeeId: row.employeeId,
          fullName: row.fullName,
          attendanceCount: numberValue(row.attendanceCount),
          lateCount: numberValue(row.lateCount),
          absenceCount: numberValue(row.absenceCount),
          workedMinutes: numberValue(row.workedMinutes),
          workedHours: numberValue(row.workedHours),
          hourlyRate: numberValue(row.hourlyRate),
          projectedPay: numberValue(row.projectedPay),
        })),
      },
    ],
  }
}

function spreadsheetSafe(value: ExportValue): ExportValue {
  if (typeof value === 'string' && /^[=+\-@]/.test(value)) return `'${value}`
  return value
}

function csvValue(value: ExportValue) {
  const safeValue = spreadsheetSafe(value)
  const text = safeValue === null ? '' : String(safeValue)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function rowsForCsv(report: NormalizedReport) {
  const rows: ExportValue[][] = [
    ['Reporte', report.title],
    ...report.filters.map(({ label, value }) => [label, value]),
    [],
    ...report.summary.map(({ label, value }) => [label, value]),
  ]
  for (const section of report.sections) {
    rows.push(
      [],
      [section.title],
      section.columns.map((column) => column.label),
    )
    rows.push(
      ...section.rows.map((row) => section.columns.map((column) => row[column.key] ?? null)),
    )
  }
  return rows
}

export function serializeCsv(report: NormalizedReport) {
  return `\ufeff${rowsForCsv(report)
    .map((row) => row.map(csvValue).join(','))
    .join('\r\n')}\r\n`
}

function sheetName(name: string) {
  return name.replace(/[\\/?*:[\]]/g, '').slice(0, 31) || 'Datos'
}

function rowsForSheet(report: NormalizedReport) {
  return [
    ['Reporte', report.title],
    ...report.filters.map(({ label, value }) => [label, spreadsheetSafe(value)]),
    [],
    ...report.summary.map(({ label, value }) => [label, spreadsheetSafe(value)]),
  ]
}

export function buildXlsx(report: NormalizedReport) {
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rowsForSheet(report)), 'Resumen')
  for (const section of report.sections) {
    const rows = [
      section.columns.map((column) => column.label),
      ...section.rows.map((row) =>
        section.columns.map((column) => spreadsheetSafe(row[column.key] ?? null)),
      ),
    ]
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), sheetName(section.title))
  }
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
}

export function buildPdf(report: NormalizedReport) {
  const document = new jsPDF()
  const lines: string[] = [report.title, ...report.filters.map((x) => `${x.label}: ${x.value}`), '']
  lines.push(...report.summary.map((x) => `${x.label}: ${x.value ?? ''}`))
  for (const section of report.sections) {
    lines.push('', section.title, section.columns.map((column) => column.label).join(' | '))
    lines.push(
      ...section.rows.map((row) =>
        section.columns.map((column) => String(row[column.key] ?? '')).join(' | '),
      ),
    )
  }
  let y = 18
  document.setFontSize(10)
  for (const line of lines) {
    if (y > 280) {
      document.addPage()
      y = 18
    }
    document.text(line, 14, y)
    y += 6
  }
  return document
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadReport(report: NormalizedReport, format: ExportFormat) {
  if (!report.hasData) return false
  if (format === 'csv') {
    downloadBlob(
      new Blob([serializeCsv(report)], { type: 'text/csv;charset=utf-8' }),
      `${report.filename}.csv`,
    )
  } else if (format === 'xlsx') {
    downloadBlob(
      new Blob([buildXlsx(report) as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `${report.filename}.xlsx`,
    )
  } else {
    buildPdf(report).save(`${report.filename}.pdf`)
  }
  return true
}
