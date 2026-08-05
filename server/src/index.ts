import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authRoutes } from './routes/auth'
import { profileRoutes } from './routes/profile'
import { surveyRoutes } from './routes/survey'
import { doctorRoutes } from './routes/doctor'
import { riwayatRoutes } from './routes/riwayat'
import { sessionRoutes } from './routes/sessions'

// Auto-detect runtime: Bun (default) or Node via @elysia/node adapter
let adapter: any = undefined
try {
  const { node } = await import('@elysia/node')
  adapter = node()
} catch { /* Bun runtime — no adapter needed */ }

// ===== Simple in-memory rate limiter for auth endpoints =====
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
function rateLimit(windowMs = 15 * 60 * 1000, max = 10) {
  return (app: Elysia) =>
    app.derive(({ request, set }) => {
      const url = new URL(request.url)
      if (!url.pathname.includes('/login') && !url.pathname.includes('/register') && !url.pathname.includes('/password/forgot')) return {}
      const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
      const key = `${ip}:${url.pathname}`
      const now = Date.now()
      let entry = rateLimitMap.get(key)
      if (!entry || now > entry.resetAt) {
        entry = { count: 1, resetAt: now + windowMs }
        rateLimitMap.set(key, entry)
        return {}
      }
      entry.count++
      rateLimitMap.set(key, entry)
      if (entry.count > max) {
        set.status = 429
        return {
          metaData: { status: 'error', kode: 429, message: 'Terlalu banyak percobaan. Coba lagi nanti.' },
          response: null,
        }
      }
      return {}
    })
}

// ===== Security headers =====
function securityHeaders(app: Elysia) {
  return app.onAfterHandle(({ headers, set }) => {
    set.headers['X-Content-Type-Options'] = 'nosniff'
    set.headers['X-Frame-Options'] = 'DENY'
    set.headers['X-XSS-Protection'] = '1; mode=block'
    set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
  })
}

const app = new Elysia(adapter ? { adapter } : {})
  .use(
    cors({
      origin: Bun.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-key', 'X-Auth-Token'],
      credentials: true,
    })
  )
  .use(securityHeaders)
  .use(rateLimit(15 * 60 * 1000, 10))
  .use(authRoutes)
  .use(profileRoutes)
  .use(riwayatRoutes)
  .use(sessionRoutes)
  .use(surveyRoutes)
  .use(doctorRoutes)
  .get('/api/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .all('*', ({ set }) => {
    set.status = 404
    return {
      metaData: { status: 'error', kode: 404, message: 'Route tidak ditemukan' },
      response: null,
    }
  })
  .listen({
    port: Number(Bun.env.PORT) || 3001,
    hostname: Bun.env.HOST || '0.0.0.0',
  })

console.log(`🚀 Elysia server running at http://${app.server?.hostname}:${app.server?.port}`)
console.log(`   Health: http://localhost:${app.server?.port}/api/health`)
