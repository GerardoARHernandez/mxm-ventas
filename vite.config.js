import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://25.62.74.73',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/Carrito.NETFrameworkEnvironment/APICarrito'),
        secure: false
      }
    }
  }
})