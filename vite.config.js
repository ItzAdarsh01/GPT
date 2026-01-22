import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Jab bhi aap '/api-proxy' use karenge, ye use target URL par bhej dega
      '/api-proxy': {
        target: 'https://api.cyfuture.ai',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-proxy/, ''),
      },
    },
  },
})
