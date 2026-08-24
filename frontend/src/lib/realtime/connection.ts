import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
export const kitchenConnection = new HubConnectionBuilder()
  .withUrl('/hubs/kitchen')
  .configureLogging(LogLevel.Warning)
  .build()
