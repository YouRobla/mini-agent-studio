import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Lee frontend/.env (si existe) para la variable del proxy.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // El navegador pide /api a este mismo servidor y Vite lo reenvía al backend.
      // Al ser el mismo origen no hay CORS, así que funciona aunque Vite tenga que
      // usar otro puerto (5174…) o se abra con 127.0.0.1.
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    build: {
      // App local de dos pantallas: un único paquete (~540 KB, ~165 KB comprimido)
      // es razonable y no compensa dividirlo con carga diferida de rutas.
      chunkSizeWarningLimit: 600,
    },
  }
})
