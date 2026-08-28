import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  IconButton,
  Input,
  LinkButton,
  ProgressBar,
  Radio,
  Select,
  Skeleton,
  Spinner,
  StatusDot,
  Surface,
  Textarea,
} from '../components/atoms'
import {
  Alert,
  Breadcrumbs,
  EmptyState,
  FileDropzone,
  FormField,
  Pagination,
  PasswordInput,
  PasswordStrength,
  SearchInput,
  StatCard,
  Stepper,
} from '../components/molecules'
import { DataTable, Modal, PageHeader } from '../components/organisms'
import { AppShell } from '../components/templates'
import { endpoints } from '../lib/api/endpoints'
import { httpClient } from '../lib/api/http-client'

const fixtureRows = [
  { id: 'one', name: 'Fila de ejemplo', state: 'Listo' },
  { id: 'two', name: 'Otra fila', state: 'Borrador' },
]

export function UiKitPage() {
  const [page, setPage] = useState(1)
  const [password, setPassword] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const health = useQuery({
    queryKey: ['health'],
    queryFn: () => httpClient.get<unknown>(endpoints.health),
    retry: false,
  })

  return (
    <AppShell
      header={<strong>Fratelli UI Kit</strong>}
      navigation={<span>Catálogo de Development</span>}
    >
      <PageHeader
        title="UI Kit"
        description="Base de interfaz reutilizable solo para Development."
      />
      <section aria-labelledby="foundations">
        <h2 id="foundations">Fundamentos</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4">
          <Surface>
            <StatusDot tone="success" label="Listo" />
            <Badge tone="warning">Demostración de token neutral</Badge>
            <Avatar name="Fratelli" />
            <Divider />
            <ProgressBar value={64} label="Ejemplo de progreso" />
          </Surface>
          <Card>
            <h3>Estados de carga</h3>
            <Skeleton />
            <Spinner />
          </Card>
        </div>
      </section>
      <section aria-labelledby="actions">
        <h2 id="actions">Acciones</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Principal</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="outline" leftIcon={<span>←</span>} rightIcon={<span>→</span>}>
            Contorno
          </Button>
          <Button variant="ghost">Transparente</Button>
          <Button variant="danger">Peligro</Button>
          <Button loading>Guardando</Button>
          <IconButton label="Acción de ejemplo">+</IconButton>
          <LinkButton href="#forms">Botón de enlace</LinkButton>
        </div>
      </section>
      <section aria-labelledby="feedback">
        <h2 id="feedback">Retroalimentación</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4">
          <Alert kind="info" title="Información">
            Retroalimentación neutral para un estado de interfaz.
          </Alert>
          <EmptyState title="No hay elementos locales">
            Úselo cuando una lista no tenga contenido.
          </EmptyState>
          <StatCard label="Métrica de ejemplo" value="42" trend="Fixture local" />
        </div>
      </section>
      <section id="forms" aria-labelledby="forms">
        <h2 id="forms">Formularios</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4">
          <FormField
            label="Campo de ejemplo"
            hint="Este campo local demuestra descripciones accesibles."
          >
            <Input placeholder="Escriba aquí" />
          </FormField>
          <FormField label="Notas" error="Mensaje de validación de ejemplo">
            <Textarea />
          </FormField>
          <SearchInput aria-label="Buscar ejemplos" placeholder="Buscar" />
          <PasswordInput
            aria-label="Contraseña"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordStrength value={password} />
          <Select aria-label="Selección de ejemplo">
            <option>Elija una opción</option>
          </Select>
          <label>
            <Checkbox /> Suscribirse
          </label>
          <label>
            <Radio name="example" /> Opción
          </label>
        </div>
      </section>
      <section aria-labelledby="navigation">
        <h2 id="navigation">Navegación</h2>
        <Breadcrumbs items={[{ label: 'Development', href: '/dev/ui-kit' }, { label: 'UI Kit' }]} />
        <Pagination page={page} pageCount={3} onPageChange={setPage} />
        <Stepper steps={['Inicio', 'Revisión', 'Finalizar']} current={1} />
      </section>
      <section aria-labelledby="data">
        <h2 id="data">Datos</h2>
        <DataTable
          columns={[
            { id: 'name', header: 'Nombre', cell: (row) => row.name },
            { id: 'state', header: 'Estado', cell: (row) => <Badge>{row.state}</Badge> },
          ]}
          rows={fixtureRows}
          getRowId={(row) => row.id}
          actions={() => (
            <Button size="sm" variant="ghost">
              Inspeccionar
            </Button>
          )}
        />
        <FileDropzone accept=".txt" maxSize={1024 * 1024} onFiles={setSelectedFiles} />
        {selectedFiles.length > 0 && (
          <p>{selectedFiles.length} archivo(s) local(es) seleccionado(s).</p>
        )}
      </section>
      <section aria-labelledby="overlays">
        <h2 id="overlays">Superposiciones</h2>
        <Button onClick={() => setDialogOpen(true)}>Abrir diálogo</Button>
        <Modal open={dialogOpen} title="Diálogo de ejemplo" onClose={() => setDialogOpen(false)}>
          <p>Contenido modal accesible y solo local.</p>
        </Modal>
      </section>
      <section aria-labelledby="layout">
        <h2 id="layout">Diseño</h2>
        <Card>
          <p>
            AppShell acepta espacios para encabezado, navegación, barra lateral, contenido principal
            y pie.
          </p>
        </Card>
      </section>
      <section aria-labelledby="integration">
        <h2 id="integration">Conexión con backend</h2>
        <Card>
          <h3>Salud del backend</h3>
          {health.isPending ? (
            <Spinner label="Comprobando la salud del backend" />
          ) : health.isError ? (
            <Alert kind="error">API no disponible</Alert>
          ) : (
            <Alert kind="success">API disponible</Alert>
          )}
          <Button variant="secondary" onClick={() => health.refetch()}>
            Comprobar de nuevo
          </Button>
        </Card>
      </section>
    </AppShell>
  )
}
