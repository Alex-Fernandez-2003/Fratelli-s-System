import { jsPDF } from 'jspdf'
import type { SalesHistoryDetail } from './api'

const paymentLabels = {
  CASH: 'Efectivo',
  QR: 'QR',
  EXTERNAL: 'Pago externo',
} as const
const channelLabels = {
  DIRECT: 'Directo',
  PEDIDOSYA: 'PedidosYa',
} as const

export type SaleReceiptModel = {
  title: 'Comprobante interno de venta'
  disclaimer: 'Comprobante interno — No constituye factura fiscal.'
  saleId: string
  occurredAt: string
  shift: string
  channel: string
  paymentMethod: string
  responsible?: string
  customer: string
  customerCi?: string
  customerNit?: string
  items: Array<{ name: string; quantity: number; unitPrice: number; lineTotal: number }>
  total: number
}

export function createSaleReceiptModel(sale: SalesHistoryDetail): SaleReceiptModel {
  return {
    title: 'Comprobante interno de venta',
    disclaimer: 'Comprobante interno — No constituye factura fiscal.',
    saleId: sale.id,
    occurredAt: sale.confirmedAt,
    shift: sale.shiftType,
    channel: channelLabels[sale.salesChannel],
    paymentMethod: paymentLabels[sale.paymentMethod],
    responsible: sale.responsibleName ?? undefined,
    customer: sale.customerNameSnapshot ?? 'Consumidor final',
    customerCi: sale.customerCiSnapshot ?? undefined,
    customerNit: sale.customerNitSnapshot ?? undefined,
    items: sale.items.map((item) => ({
      name: item.productName,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
    total: Number(sale.total),
  }
}

export function receiptFilename(receipt: SaleReceiptModel) {
  const date = receipt.occurredAt.slice(0, 10)
  return `comprobante-venta-${date}-${receipt.saleId}.pdf`
}

const money = (value: number) =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)

export function generateSaleReceiptPdf(sale: SalesHistoryDetail) {
  const receipt = createSaleReceiptModel(sale)
  const document = new jsPDF()
  const lines = [
    'Fratelli',
    receipt.title,
    `ID de venta: ${receipt.saleId}`,
    `Fecha y hora: ${receipt.occurredAt}`,
    `Turno: ${receipt.shift}`,
    `Canal: ${receipt.channel}`,
    `Pago: ${receipt.paymentMethod}`,
    ...(receipt.responsible ? [`Responsable: ${receipt.responsible}`] : []),
    `Cliente: ${receipt.customer}`,
    ...(receipt.customerCi ? [`CI: ${receipt.customerCi}`] : []),
    ...(receipt.customerNit ? [`NIT: ${receipt.customerNit}`] : []),
    'Ítems:',
    ...receipt.items.map(
      (item) =>
        `${item.name} — ${item.quantity} × ${money(item.unitPrice)} = ${money(item.lineTotal)}`,
    ),
    `Total pagado: ${money(receipt.total)}`,
    receipt.disclaimer,
  ]

  document.setFontSize(12)
  document.text(lines, 16, 18)
  document.save(receiptFilename(receipt))
}
