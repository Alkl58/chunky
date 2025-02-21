import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  build: {
    outDir: '../public'
  },
  // Dev server
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000/'
      },
      '/download': {
        target: 'http://127.0.0.1:4000/'
      }
    }
  }
})

