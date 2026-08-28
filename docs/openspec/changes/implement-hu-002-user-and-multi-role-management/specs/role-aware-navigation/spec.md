# Role-aware navigation

## Requirements

### RN-01 — One central navigation source

The authenticated application SHALL use one shared navigation configuration whose items declare path, label, icon and allowedRoles. Desktop and mobile Sidebar renderings SHALL derive from that source and HU-001 `hasAnyRole`, not duplicate lists.

### RN-02 — Registered routes only

Initially the navigation configuration SHALL contain only implemented authenticated routes: `/inicio` and `/usuarios`. It SHALL not display Productos, Inventario, Caja, Reportes or another future placeholder. Future Caja is registered only when real and then permits ADMINISTRADOR plus ENCARGADO.

### RN-03 — Route protection and visibility

`/usuarios` SHALL compose the existing RequireAuth and RequireAnyRole guards with exactly ADMINISTRADOR. Non-admin users SHALL reach ForbiddenPage and shall not see Users in navigation. ADMINISTRADOR sees every registered implemented navigation item.

#### Scenario: role-aware Sidebar

- **Given** an authenticated EMPLEADO
- **When** shared navigation renders
- **Then** Inicio is available and Usuarios is absent.

- **Given** an authenticated ADMINISTRADOR
- **When** shared navigation renders
- **Then** Inicio and Usuarios are available.

### RN-04 — Shared shell extension

`/inicio` and `/usuarios` SHALL reuse an authenticated layout composed from existing AppShell, shared Sidebar, header/logout and Outlet. This change SHALL not create UsersAppShell or replace AuthProvider, session coordinator, guards or ForbiddenPage.
