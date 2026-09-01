import { describe, expect, it } from 'vitest'
import type { SalesHistoryDetail } from './api'
import { createSaleReceiptModel, receiptFilename } from './saleReceiptPdf'

const detail: SalesHistoryDetail = {
  id: 'sale-real-123',
  confirmedAt: '2026-09-01T14:30:00Z',
  businessDate: '2026-09-01',
  shiftId: 'shift-1',
  shiftType: 'MORNING',
  salesChannel: 'PEDIDOSYA',
  paymentMethod: 'CASH',
  subtotal: 42.5,
  total: 42.5,
  confirmedByUserId: 'user-1',
  responsibleName: 'María histórica',
  customerId: 'customer-current-id',
  customerNameSnapshot: 'Ana histórica',
  customerCiSnapshot: '123',
  customerNitSnapshot: '456',
  items: [
    { productId: 'product-1', productName: 'Pizza', quantity: 2, unitPrice: 20, lineTotal: 40 },
    {
      productId: 'product-2',
      productName: 'Refresco',
      quantity: 1,
      unitPrice: 2.5,
      lineTotal: 2.5,
    },
  ],
}

describe('sale receipt PDF model', () => {
  it('maps only authorized historical Sale detail into a non-fiscal receipt', () => {
    const receipt = createSaleReceiptModel(detail)

    expect(receipt.title).toBe('Comprobante interno de venta')
    expect(receipt.customer).toBe('Ana histórica')
    expect(receipt.customerCi).toBe('123')
    expect(receipt.customerNit).toBe('456')
    expect(receipt.saleId).toBe('sale-real-123')
    expect(receipt.items).toEqual([
      { name: 'Pizza', quantity: 2, unitPrice: 20, lineTotal: 40 },
      { name: 'Refresco', quantity: 1, unitPrice: 2.5, lineTotal: 2.5 },
    ])
    expect(receipt.disclaimer).toBe('Comprobante interno — No constituye factura fiscal.')
    expect(receipt).not.toHaveProperty('iva')
    expect(receipt).not.toHaveProperty('discount')
  })

  it('uses Consumidor final, omits absent snapshots, and derives a filename from the real date and ID', () => {
    const receipt = createSaleReceiptModel({
      ...detail,
      id: 'real-id-456',
      confirmedAt: '2026-09-02T03:04:05Z',
      customerId: null,
      customerNameSnapshot: null,
      customerCiSnapshot: null,
      customerNitSnapshot: null,
    })

    expect(receipt.customer).toBe('Consumidor final')
    expect(receipt.customerCi).toBeUndefined()
    expect(receipt.customerNit).toBeUndefined()
    expect(receiptFilename(receipt)).toMatch(/^comprobante-venta-2026-09-02-real-id-456\.pdf$/)
  })
})
