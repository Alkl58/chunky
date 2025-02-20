import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
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

