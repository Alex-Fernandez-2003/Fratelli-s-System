import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { env } from './config/env'
import { QueryProvider } from './lib/query/provider'
import { AppRoutes } from './routes/AppRoutes'
import './styles/globals.css'

document.title = env.appName

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryProvider>
  </StrictMode>,
)
