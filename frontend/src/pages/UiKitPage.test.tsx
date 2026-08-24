import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button, Input } from '../components/atoms'
import { FileDropzone, FormField, Pagination, PasswordInput } from '../components/molecules'
import { DataTable, Modal } from '../components/organisms'
import { UiKitPage } from './UiKitPage'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))
vi.mock('../lib/api/http-client', () => ({ httpClient: { get } }))

afterEach(() => get.mockReset())

function renderPage() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <BrowserRouter>
        <UiKitPage />
      </BrowserRouter>
    </QueryClientProvider>,
  )
}

describe('componentes de UI compartidos', () => {
  it('deshabilita un botón en carga y expone el estado ocupado', () => {
    render(<Button loading>Guardar</Button>)
    expect(screen.getByRole('button', { name: 'CargandoGuardar' })).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('renderiza botones de contorno con iconos izquierdo y derecho', () => {
    render(
      <Button variant="outline" leftIcon={<span>Atrás</span>} rightIcon={<span>Siguiente</span>}>
        Continuar
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Continuar' })).toHaveClass('button--outline')
    expect(screen.getByText('Atrás')).toBeInTheDocument()
    expect(screen.getByText('Siguiente')).toBeInTheDocument()
  })

  it('conecta la etiqueta, ayuda y error de FormField con su control', () => {
    render(
      <FormField
        label="Correo electrónico"
        hint="Use una dirección laboral"
        error="Correo electrónico no válido"
      >
        <Input />
      </FormField>,
    )
    const input = screen.getByLabelText('Correo electrónico')
    expect(input).toHaveAttribute('aria-describedby')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('id')

    const explicitControl = render(
      <FormField label="Control con nombre" hint="Descripción existente">
        <Input id="email-address" aria-describedby="external-description" />
      </FormField>,
    )
    expect(screen.getByLabelText('Control con nombre')).toHaveAttribute('id', 'email-address')
    expect(screen.getByLabelText('Control con nombre')).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('external-description'),
    )
    explicitControl.unmount()
    expect(screen.getByRole('alert')).toHaveTextContent('Correo electrónico no válido')
  })

  it('muestra y oculta una contraseña sin almacenarla', () => {
    render(<PasswordInput aria-label="Contraseña" />)
    const input = screen.getByLabelText('Contraseña')
    expect(input).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(input).toHaveAttribute('type', 'text')
  })

  it('acepta archivos locales válidos, rechaza los demasiado grandes y lista las selecciones aceptadas', () => {
    const onFiles = vi.fn()
    render(<FileDropzone accept=".txt" maxSize={2} onFiles={onFiles} />)
    fireEvent.drop(screen.getByText(/arrastre archivos aquí/i), {
      dataTransfer: {
        files: [
          new File(['ok'], 'note.txt'),
          new File(['too big'], 'large.txt'),
          new File(['x'], 'image.png'),
        ],
      },
    })
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'note.txt' })])
    expect(screen.getByText('note.txt')).toBeInTheDocument()
    expect(screen.getByText(/large.txt supera el límite de tamaño de 2 bytes/i)).toBeInTheDocument()
    expect(screen.getByText(/image.png no es un tipo de archivo aceptado/i)).toBeInTheDocument()
  })

  it('quita archivos locales seleccionados y notifica a quien llama', () => {
    const onFiles = vi.fn()
    render(<FileDropzone onFiles={onFiles} />)
    fireEvent.drop(screen.getByText(/arrastre archivos aquí/i), {
      dataTransfer: { files: [new File(['x'], 'note.txt')] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Quitar note.txt' }))
    expect(screen.queryByText('note.txt')).not.toBeInTheDocument()
    expect(onFiles).toHaveBeenLastCalledWith([])
  })

  it('cambia páginas solo dentro de los límites habilitados de paginación', () => {
    const onPageChange = vi.fn()
    const { rerender } = render(<Pagination page={1} pageCount={2} onPageChange={onPageChange} />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
    rerender(<Pagination page={2} pageCount={2} onPageChange={onPageChange} />)
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled()
  })

  it('renderiza datos, acciones y estados de carga, error y vacío de DataTable', () => {
    const columns = [
      { id: 'name', header: 'Nombre', cell: (row: { id: string; name: string }) => row.name },
    ]
    const { rerender } = render(
      <DataTable
        columns={columns}
        rows={[{ id: '1', name: 'Fixture local' }]}
        getRowId={(row) => row.id}
        actions={() => <Button>Inspeccionar</Button>}
      />,
    )
    expect(screen.getByRole('cell', { name: 'Fixture local' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inspeccionar' })).toBeInTheDocument()
    rerender(<DataTable columns={columns} rows={[]} getRowId={(row) => row.id} isLoading />)
    expect(screen.getByRole('status', { name: 'Cargando tabla' })).toBeInTheDocument()
    rerender(
      <DataTable
        columns={columns}
        rows={[]}
        getRowId={(row) => row.id}
        error="No se pudo cargar"
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar')
    rerender(<DataTable columns={columns} rows={[]} getRowId={(row) => row.id} />)
    expect(screen.getByText('No se encontraron resultados.')).toBeInTheDocument()
  })

  it('proporciona a Modal un diálogo etiquetado y lo cierra con Escape', () => {
    const onClose = vi.fn()
    render(
      <Modal open title="Diálogo de ejemplo" onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Diálogo de ejemplo' })
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('catálogo del UI Kit', () => {
  it('muestra todos los grupos del catálogo y el estado real de salud mediante httpClient', async () => {
    get.mockResolvedValueOnce({ status: 'Healthy' })
    renderPage()
    for (const heading of [
      'Fundamentos',
      'Acciones',
      'Retroalimentación',
      'Formularios',
      'Navegación',
      'Datos',
      'Superposiciones',
      'Diseño',
      'Integración',
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
    }
    expect(await screen.findByText('API disponible')).toBeInTheDocument()
    expect(get).toHaveBeenCalledWith('/health')
  })

  it('mantiene visible el catálogo cuando health no está disponible', async () => {
    get.mockRejectedValueOnce(new Error('offline'))
    renderPage()
    expect(await screen.findByText('API no disponible')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Fundamentos' })).toBeInTheDocument()
  })
})
