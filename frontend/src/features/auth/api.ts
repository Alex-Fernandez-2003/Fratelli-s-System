import { endpoints } from '../../lib/api/endpoints'
import { httpClient } from '../../lib/api/http-client'
import type { components } from '../../types/api.generated'

export type AuthResponse = components['schemas']['AuthResponse']
export type AuthUser = components['schemas']['AuthUser']
export type LoginRequest = components['schemas']['LoginRequest']

export const authApi = {
  login: (request: LoginRequest) =>
    httpClient.post<AuthResponse>(endpoints.auth.login, request, { auth: 'raw' }),
  refresh: () => httpClient.post<AuthResponse>(endpoints.auth.refresh, undefined, { auth: 'raw' }),
  logout: () => httpClient.post<void>(endpoints.auth.logout, undefined, { auth: 'raw' }),
  me: () => httpClient.get<AuthUser>(endpoints.auth.me),
}
