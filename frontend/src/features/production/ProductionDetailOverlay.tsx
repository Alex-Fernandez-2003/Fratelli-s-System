import { Button, Card } from '../../components/atoms'
import { Modal } from '../../components/organisms'
import { HttpError } from '../../lib/api/http-client'
import type { ProductionDetail } from './api'
import { useProductionDetail } from './api'

const dateTime = (value: string) =>
  new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/La_Paz',
  }).format(new Date(value))

function ProductionDetailContent({ production }: { production: ProductionDetail }) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-1 text-sm">
        <span>Fecha y hora: {dateTime(production.producedAt)}</span>
        <span className="break-all">ID: {production.id}</span>
        <span className="break-words">Producto: {production.productName}</span>
        <span>
          Cantidad producida: {Number(production.quantityProduced).toLocaleString('es-BO')}{' '}
          {production.unitSymbol}
        </span>
        <span className="break-all">Lote: {production.batchCode}</span>
        {production.responsibleName && (
          <span className="break-words">Responsable: {production.responsibleName}</span>
        )}
        {production.notes && <span className="break-words">Notas: {production.notes}</span>}
      </div>
      <Card className="grid gap-3">
        <h3 className="m-0">Consumo registrado</h3>
        <h4 className="m-0 text-sm">Ingredientes consumidos</h4>
        {production.consumptions.length ? (
          <div className="grid gap-2">
            {production.consumptions.map((consumption) => (
              <div
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 text-sm last:border-0 last:pb-0"
                key={`${consumption.productId}-${consumption.unitId}`}
              >
                <span className="break-words">{consumption.productName}</span>
                <strong>
                  {Number(consumption.quantityConsumed).toLocaleString('es-BO')}{' '}
                  {consumption.unitSymbol}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="m-0 text-sm text-text-muted">No hay ingredientes consumidos registrados.</p>
        )}
      </Card>
    </div>
  )
}

export function ProductionDetailOverlay({
  productionId,
  onClose,
}: {
  productionId: string | undefined
  onClose: () => void
}) {
  const query = useProductionDetail(productionId)

  return (
    <Modal open={Boolean(productionId)} title="Detalle de producción" onClose={onClose}>
      {query.isLoading ? (
        <p role="status">Cargando detalle de producción…</p>
      ) : query.error ? (
        <div className="grid gap-3">
          <p role="alert">
            {query.error instanceof HttpError && query.error.status === 404
              ? 'La producción ya no está disponible.'
              : 'No se pudo cargar el detalle de producción.'}
          </p>
          <Button variant="outline" onClick={() => void query.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : query.data ? (
        <ProductionDetailContent production={query.data} />
      ) : null}
    </Modal>
  )
}
