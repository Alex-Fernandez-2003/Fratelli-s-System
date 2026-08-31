import { Button, Skeleton } from '../../../components/atoms'
import { Modal } from '../../../components/organisms'
import type { Supplier } from '../types'

export function SuppliersLoadingSkeleton() {
  return (
    <div className="grid gap-2.5" role="status" aria-label="Cargando proveedores">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-10" />
      ))}
    </div>
  )
}

export function SuppliersEmptyState({
  onCreate,
  canWrite,
}: {
  onCreate: () => void
  canWrite: boolean
}) {
  return (
    <div className="p-4 text-center text-text-muted" role="status">
      <p>No hay proveedores registrados</p>
      <p>
        Comienza agregando los proveedores de tu inventario para gestionar las compras y
        suministros.
      </p>
      {canWrite && <Button onClick={onCreate}>+ Agregar primer proveedor</Button>}
    </div>
  )
}

export function SuppliersErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-4 text-center text-danger" role="alert">
      <p>Error al cargar datos</p>
      <p>
        Hubo un problema de conexión al intentar obtener la lista de proveedores. Verifica tu red e
        inténtalo nuevamente.
      </p>
      <Button onClick={onRetry}>Reintentar carga</Button>
    </div>
  )
}

// Antes se renderizaba como un <div role="alertdialog"> suelto en el flujo
// de la página, por lo que aparecía al final del documento en vez de cómo
// un pop-up modal con fondo oscuro. Ahora envuelve su contenido en el
// componente Modal real (components/organisms), que ya maneja overlay,
// foco al abrir y cierre con Escape.
export function ConfirmDeactivateDialog({
  supplier,
  pending,
  onConfirm,
  onCancel,
}: {
  supplier: Supplier | null
  pending: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal open={supplier !== null} title="¿Desactivar proveedor?" onClose={onCancel}>
      {supplier && (
        <div className="grid gap-4">
          <p>
            Estás a punto de desactivar a <strong>{supplier.name}</strong>.
          </p>
          <ul className="m-0 list-disc pl-5 text-text-muted">
            <li>No aparecerá en la creación de nuevas compras.</li>
            <li>Los registros históricos permanecerán intactos.</li>
          </ul>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onCancel} disabled={pending}>
              Cancelar
            </Button>
            <Button variant="danger" loading={pending} onClick={onConfirm}>
              Sí, desactivar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}