import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // App local de dos pantallas: un único paquete (~540 KB, ~165 KB comprimido)
    // es razonable y no compensa dividirlo con carga diferida de rutas.
    chunkSizeWarningLimit: 600,
  },
})
