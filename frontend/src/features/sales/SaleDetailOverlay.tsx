import { useState } from 'react'
import { Button, Card } from '@/components/atoms'
import { Modal } from '@/components/organisms'
import { HttpError } from '@/lib/api/http-client'
import type { SalesHistoryDetail } from './api'
import { useSaleDetail } from './api'
import { generateSaleReceiptPdf } from './saleReceiptPdf'

const paymentLabels = {
  CASH: 'Efectivo',
  QR: 'QR',
  EXTERNAL: 'Pago externo',
} as const
const channelLabels = {
  DIRECT: 'Directo',
  PEDIDOSYA: 'PedidosYa',
} as const

const money = (amount: number | string) =>
  new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(Number(amount))
const dateTime = (value: string) =>
  new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/La_Paz',
  }).format(new Date(value))

function SaleDetailContent({
  sale,
  onPdfError,
}: {
  sale: SalesHistoryDetail
  onPdfError: () => void
}) {
  const customerName = sale.customerNameSnapshot ?? 'Consumidor final'
  const downloadReceipt = () => {
    try {
      generateSaleReceiptPdf(sale)
    } catch {
      onPdfError()
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-1 text-sm">
        <span>Fecha y hora: {dateTime(sale.confirmedAt)}</span>
        <span>ID: {sale.id}</span>
        <span>Turno: {sale.shiftType}</span>
        <span>Canal: {channelLabels[sale.salesChannel]}</span>
        <span>Pago: {paymentLabels[sale.paymentMethod]}</span>
        {sale.responsibleName && <span>Responsable: {sale.responsibleName}</span>}
      </div>
      <Card className="grid gap-1">
        <strong>Cliente</strong>
        <span>{customerName}</span>
        {sale.customerCiSnapshot && <span>CI: {sale.customerCiSnapshot}</span>}
        {sale.customerNitSnapshot && <span>NIT: {sale.customerNitSnapshot}</span>}
      </Card>
      <div className="grid gap-3">
        <h3 className="m-0">Ítems</h3>
        {sale.items.map((item) => (
          <div
            className="flex items-start justify-between gap-3 border-b border-border pb-3"
            key={item.productId}
          >
            <div className="grid gap-1">
              <strong>{item.productName}</strong>
              <span className="text-sm text-text-muted">
                {item.quantity} × {money(item.unitPrice)}
              </span>
            </div>
            <span>{money(item.lineTotal)}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="grid gap-1">
          <strong>Total pagado</strong>
          <strong>{money(sale.total)}</strong>
        </div>
        <Button variant="outline" onClick={downloadReceipt}>
          Descargar comprobante PDF
        </Button>
      </div>
    </div>
  )
}

export function SaleDetailOverlay({
  saleId,
  onClose,
}: {
  saleId: string | undefined
  onClose: () => void
}) {
  const query = useSaleDetail(saleId)
  const [pdfError, setPdfError] = useState(false)

  return (
    <Modal open={Boolean(saleId)} title="Detalle de venta" onClose={onClose}>
      {query.isLoading ? (
        <p role="status">Cargando detalle de venta…</p>
      ) : query.error ? (
        <div className="grid gap-3">
          <p role="alert">
            {query.error instanceof HttpError && query.error.status === 404
              ? 'La venta ya no está disponible.'
              : 'No se pudo cargar el detalle de la venta.'}
          </p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : query.data ? (
        <div className="grid gap-3">
          {pdfError && (
            <p role="alert">No se pudo generar el comprobante PDF. Intentá nuevamente.</p>
          )}
          <SaleDetailContent sale={query.data} onPdfError={() => setPdfError(true)} />
        </div>
      ) : null}
    </Modal>
  )
}
