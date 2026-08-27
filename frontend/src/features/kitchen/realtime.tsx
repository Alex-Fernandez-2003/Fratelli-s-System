import { HubConnectionBuilder, HubConnectionState, type HubConnection } from '@microsoft/signalr'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useSyncExternalStore } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { sessionCoordinator } from '@/lib/auth/session-coordinator'
import { env } from '@/config/env'
import { kitchenKeys } from './api'
import { ordersKeys } from '@/features/orders/api'

export type KitchenConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'
let connection: HubConnection | undefined
let lifecycleRegistered = false
let invalidateRoots: () => void = () => undefined
let currentStatus: KitchenConnectionStatus = 'disconnected'
const listeners = new Set<() => void>()
const emit = (status: KitchenConnectionStatus) => {
  currentStatus = status
  listeners.forEach((listener) => listener())
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export const useKitchenConnectionStatus = () =>
  useSyncExternalStore(
    subscribe,
    () => currentStatus,
    () => 'disconnected',
  )

export function KitchenRealtimeOwner() {
  const { status } = useAuth()
  const query = useQueryClient()
  useEffect(() => {
    if (status !== 'authenticated') {
      emit('disconnected')
      return
    }
    connection ??= new HubConnectionBuilder()
      .withUrl(`${env.apiBaseUrl.replace('/api/v1', '')}/hubs/kitchen`, {
        accessTokenFactory: () => sessionCoordinator.getAccessToken() ?? '',
      })
      .withAutomaticReconnect()
      .build()
    const invalidate = () => {
      void query.invalidateQueries({ queryKey: kitchenKeys.all })
      void query.invalidateQueries({ queryKey: ordersKeys.all })
    }
    invalidateRoots = invalidate
    connection.on('KitchenCommandCreated', invalidate)
    connection.on('KitchenCommandUpdated', invalidate)
    connection.on('KitchenCommandCancelled', invalidate)
    if (!lifecycleRegistered) {
      lifecycleRegistered = true
      connection.onreconnecting(() => emit('reconnecting'))
      connection.onreconnected(() => {
        emit('connected')
        invalidateRoots()
      })
      connection.onclose(() => emit('disconnected'))
    }
    if (connection.state === HubConnectionState.Disconnected) {
      emit('connecting')
      void connection
        .start()
        .then(() => emit('connected'))
        .catch(() => emit('disconnected'))
    }
    return () => {
      connection?.off('KitchenCommandCreated', invalidate)
      connection?.off('KitchenCommandUpdated', invalidate)
      connection?.off('KitchenCommandCancelled', invalidate)
    }
  }, [status, query])
  return null
}
