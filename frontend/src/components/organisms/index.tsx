import { useEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import { Spinner } from '../atoms'
import { EmptyState } from '../molecules'

export type DataTableColumn<T> = {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  error,
  emptyMessage = 'No se encontraron resultados.',
  actions,
}: {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  isLoading?: boolean
  error?: ReactNode
  emptyMessage?: string
  actions?: (row: T) => ReactNode
}) {
  if (isLoading) return <Spinner label="Cargando tabla" />
  if (error) return <div role="alert">{error}</div>
  if (!rows.length) return <EmptyState>{emptyMessage}</EmptyState>
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th className="border-b border-border p-2.5 text-left" key={column.id} scope="col">
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="border-b border-border p-2.5 text-left" scope="col">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowId(row)}>
              {columns.map((column) => (
                <td className="border-b border-border p-2.5 text-left" key={column.id}>
                  {column.cell(row)}
                </td>
              ))}
              {actions && (
                <td className="border-b border-border p-2.5 text-left">{actions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragState = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  useEffect(() => {
    if (open) {
      closeRef.current?.focus()
      setOffset({ x: 0, y: 0 })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const resetOnResize = () => setOffset({ x: 0, y: 0 })
    window.addEventListener('resize', resetOnResize)
    return () => window.removeEventListener('resize', resetOnResize)
  }, [open])

  if (!open) return null

  function startDrag(event: PointerEvent<HTMLElement>) {
    if (event.target instanceof HTMLElement && event.target.closest('button')) return
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function onDrag(event: PointerEvent<HTMLElement>) {
    if (!dragState.current) return
    setOffset({
      x: dragState.current.originX + (event.clientX - dragState.current.startX),
      y: dragState.current.originY + (event.clientY - dragState.current.startY),
    })
  }
  function endDrag() {
    dragState.current = null
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-overlay p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg border border-border bg-surface"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
        }}
      >
        <header
          className="flex shrink-0 cursor-move touch-none items-start justify-between gap-4 border-b border-border p-4 select-none"
          onPointerDown={startDrag}
          onPointerMove={onDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <h2 id="modal-title" className="m-0">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="rounded-md bg-transparent px-2.5 py-1.5 text-sm font-bold text-text"
            onClick={onClose}
          >
            Cerrar
          </button>
        </header>
        <div className="overflow-y-auto p-4">{children}</div>
      </section>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="flex items-start justify-between gap-4 [&_p]:text-text-muted">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </header>
  )
}
