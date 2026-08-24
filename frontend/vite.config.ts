import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8087,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:5057', changeOrigin: true },
      '/health': { target: 'http://localhost:5057', changeOrigin: true },
      '/hubs': { target: 'http://localhost:5057', changeOrigin: true, ws: true },
    },
  },
  test: { environment: 'jsdom', globals: true },
})
