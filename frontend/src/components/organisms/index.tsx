import { useEffect, useId, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import { Spinner } from '../atoms'
import { EmptyState } from '../molecules'
import { X } from 'lucide-react';


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
  subtitle,
  icon: Icon,
  children,
  onClose,
}: {
  open: boolean
  title: string
  subtitle?: string
  icon?: React.ElementType
  children: ReactNode
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const titleId = useId()
  const subtitleId = useId()

  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const dragState = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  useEffect(() => {
    if (open) {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null

      closeRef.current?.focus()
      setOffset({ x: 0, y: 0 })
    } else {
      returnFocusRef.current?.focus()
      returnFocusRef.current = null
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
    if (
      event.target instanceof Element &&
      event.target.closest(
        'button, a, input, select, textarea, [role="button"]',
      )
    ) {
      return
    }

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
      x:
        dragState.current.originX +
        (event.clientX - dragState.current.startX),
      y:
        dragState.current.originY +
        (event.clientY - dragState.current.startY),
    })
  }

  function endDrag() {
    dragState.current = null
  }

  function trapFocus(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Tab') return

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )

    if (!focusable?.length) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-overlay p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        ref={dialogRef}
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg border border-border bg-surface"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
          else trapFocus(event)
        }}
      >
        <header
          className="flex shrink-0 cursor-move touch-none items-start justify-between gap-4 border-b border-border p-4 select-none"
          onPointerDown={startDrag}
          onPointerMove={onDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            {/* Title + subtitle */}
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="m-0 text-xl">
                {title}
              </h2>

              {subtitle && (
                <p
                  id={subtitleId}
                  className="mt-1 mb-0 text-sm text-text-muted"
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Icon opcional */}
            {Icon && (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border">
                <Icon
                  className="size-6"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>

          <button
            ref={closeRef}
            type="button"
            className="rounded-md bg-transparent p-2 text-text transition-all duration-300 hover:bg-brand-orange-hover"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="size-5" aria-hidden="true" />
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
