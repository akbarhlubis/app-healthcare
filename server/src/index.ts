import { Elysia, ValidationError } from 'elysia'
import { cors } from '@elysiajs/cors'
import { node } from '@elysia/node'
import { env } from './config/env'
import { clientIp } from './lib/ip'
import { authRoutes } from './routes/auth'
import { profileRoutes } from './routes/profile'
import { surveyRoutes } from './routes/survey'
import { doctorRoutes } from './routes/doctor'
import { riwayatRoutes } from './routes/riwayat'
import { sessionRoutes } from './routes/sessions'
import { portalRoutes } from './routes/portal'

// ===== Simple in-memory rate limiter for auth endpoints =====
// Isolated behind a small service; Redis not required (repo's unused REDIS_*
// vars removed from .env.example). Expired entries are swept periodically so
// the map cannot grow unbounded.
function rateLimit(windowMs = 15 * 60 * 1000, max = 10) {
  const hits = new Map<string, { count: number; resetAt: number }>()

  const timer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits) {
      if (now > entry.resetAt) hits.delete(key)
    }
  }, windowMs)
  if (typeof (timer as any).unref === 'function') (timer as any).unref()

  return (app: Elysia) =>
    app.onBeforeHandle(({ request, set }) => {
      const url = new URL(request.url)
      if (!/^\/(v1\/portal\/(login|register|password\/forgot))/.test(url.pathname)) return

      const key = `${clientIp(request)}:${url.pathname}`
      const now = Date.now()
      const entry = hits.get(key)
      if (!entry || now > entry.resetAt) {
        hits.set(key, { count: 1, resetAt: now + windowMs })
        return
      }
      entry.count++
      if (entry.count > max) {
        set.status = 429
        return {
          metaData: { status: 'error', kode: 429, message: 'Terlalu banyak percobaan. Coba lagi nanti.' },
          response: null,
        }
      }
    })
}

// ===== Security headers =====
function securityHeaders(app: Elysia) {
  return app.onAfterHandle(({ set }) => {
    set.headers['X-Content-Type-Options'] = 'nosniff'
    set.headers['X-Frame-Options'] = 'DENY'
    set.headers['X-XSS-Protection'] = '1; mode=block'
    set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
  })
}

// ===== Consistent error format (frontend reads metaData.status) =====
function errorHandler(app: Elysia) {
  return app.onError(({ error, set }) => {
    // Elysia wraps bad JSON body in its own error — match on message as well
    const isBadInput =
      error instanceof ValidationError ||
      (error as any)?.status === 400 ||
      /ParseError|Bad Request|JSON|Unexpected token/i.test(error.message)
    if (isBadInput) {
      set.status = 400
      return {
        metaData: { status: 'error', kode: 400, message: 'Data yang dikirim tidak valid' },
        response: null,
      }
    }
    console.error('[error]', error)
    if (error instanceof Error) console.error('[error] message:', error.message)
    set.status = 500
    return {
      metaData: { status: 'error', kode: 500, message: 'Terjadi kesalahan pada server' },
      response: null,
    }
  })
}

const app = new Elysia({ adapter: node() })
  .use(
    cors({
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-key', 'X-Auth-Token'],
      credentials: true,
    })
  )
  .use(securityHeaders)
  .use(errorHandler)
  .use(rateLimit(15 * 60 * 1000, 10))
  .use(authRoutes)
  .use(profileRoutes)
  .use(riwayatRoutes)
  .use(sessionRoutes)
  .use(portalRoutes)
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
    port: env.PORT,
    hostname: env.HOST,
  })

console.log(`🚀 Elysia server running at http://${env.HOST}:${env.PORT}`)
console.log(`   Health: http://${env.HOST}:${env.PORT}/api/health`)
