# Users frontend

## Requirements

### UF-01 — Feature and server state

The users feature SHALL use generated API types, shared httpClient without token arguments, TanStack Query and normalized keys `users`, `users.list(filters)` and `users.detail(id)`. Create, update, password, activate and deactivate are mutations that invalidate the users root so UI changes appear without manual reload.

### UF-02 — Desktop list and states

`/usuarios` SHALL provide title, search, role/status filters, New user CTA, pagination, role badges, active/inactive state and accessible actions. Loading uses a skeleton without artificial delay. Empty base data says no users and offers create; empty filtered data says no results and offers clear filters; error supports retry.

### UF-03 — Mobile functional parity

At 360px the table SHALL become a usable card/list layout with name, username, role badges, status and all administrative actions via an accessible overflow menu. Desktop capability SHALL not disappear on mobile.

### UF-04 — Create and edit forms

Create shall contain only full name, username and independent canonical-role checkboxes; no password, email, photo or avatar. Edit is separate but may reuse form components, contains full name/username/roles and excludes password. Both prevent zero-role submission while backend remains authoritative.

### UF-05 — Password and lifecycle dialogs

Password dialog SHALL label itself **Establecer contraseña** when `hasPassword=false`, otherwise **Restablecer contraseña**. It keeps new/confirm values local, validates equality before send, uses existing PasswordInput/Eye/EyeOff conventions, and clears secrets on close/success. Separate activate/deactivate confirmations shall explain their consequences and call APIs only after confirmation.

### UF-06 — Current-user and error handling

Own fullName/username updates SHALL refresh AuthProvider through `/auth/me`. Own sensitive role/password mutation SHALL clear local session after backend success. ProblemDetails shall map duplicate username/password policy/conflict/not-found/forbidden/network failures to understandable UI without technical details.

### UF-07 — Accessibility and visual validation

Dialogs SHALL manage focus, Escape and labelled controls; icon buttons have accessible names; focus-visible, keyboard operation and mobile touch targets are preserved. Tailwind is the primary styling mechanism; Lucide is used for standard icons and SVGR only for approved custom assets. Implementation follows briefing-recorded visual requirements; final visual fidelity is manually validated by the user and no screenshot evidence is fabricated.

#### Scenario: filtered-empty state

- **Given** users exist but the current filters match none
- **When** list query succeeds with no items
- **Then** the UI shows filtered-empty copy and a clear-filters action, not the first-user empty state.
