import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false
      },
      '/v1': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          primevue: ['primevue/config', 'primevue/usetoast', 'primevue/toastservice'],
        },
      },
    },
  }
})
