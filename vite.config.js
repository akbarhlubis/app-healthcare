import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Backend dipilih dari 1 variabel di .env: BACKEND_MODE=elysia|laravel
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isLaravel = env.BACKEND_MODE === 'laravel'
  // Laravel routes live under <host>/api (e.g. /api/v1/portal, /api/jadwal-dokter)
  const target = isLaravel
    ? env.LARAVEL_API_URL || 'http://localhost/rsud-tgms/api'
    : 'http://127.0.0.1:3001'

  return {
    plugins: [
      vue(),
      tailwindcss()
    ],
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          // In Laravel mode the target already ends with /api — strip the prefix
          ...(isLaravel ? { rewrite: (p) => p.replace(/^\/api/, '') } : {})
        },
        '/v1': {
          target,
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
  }
})
