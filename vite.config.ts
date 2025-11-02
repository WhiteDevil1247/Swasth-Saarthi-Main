import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/signalling': {
        target: 'ws://localhost:8083',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
