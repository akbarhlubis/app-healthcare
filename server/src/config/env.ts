import { z } from 'zod'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Single-file env: load the monorepo root .env (repo root = parent of server/)
 * before reading process.env, so the same file also feeds the backend.
 * Values already in process.env (e.g. aaPanel panel env) always win.
 */
function loadRootEnv() {
  const candidates = [join(process.cwd(), '..', '.env'), join(process.cwd(), '.env')]
  for (const file of candidates) {
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/)
      if (m && process.env[m[1]] === undefined) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      }
    }
    break
  }
}
loadRootEnv()

/**
 * Centralized environment config.
 * Uses process.env so it works identically on Node.js and Bun.
 * Fails fast at startup when required production values are missing.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().default(3001),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.coerce.number().default(3306),
  DB_DATABASE: z.string().default('sik'),
  DB_USERNAME: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  MAIL_HOST: z.string().default('smtp-relay.brevo.com'),
  MAIL_PORT: z.coerce.number().default(587),
  MAIL_USERNAME: z.string().default(''),
  MAIL_PASSWORD: z.string().default(''),
  MAIL_FROM_ADDRESS: z.string().default(''),
  MAIL_FROM_NAME: z.string().default('RSUD'),
  // Reserved — tokens are random strings stored in DB (Laravel-compatible), JWT not used yet.
  JWT_SECRET: z.string().optional(),
})

const parsed = EnvSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('[config] Invalid environment variables:')
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2))
  process.exit(1)
}

export const env = parsed.data

// Production hardening: never silently fall back to the root DB account,
// and require the pieces the app actually needs.
if (env.NODE_ENV === 'production') {
  const missing = [
    !env.DB_USERNAME || env.DB_USERNAME === 'root' ? 'DB_USERNAME (non-root)' : null,
    !env.FRONTEND_URL ? 'FRONTEND_URL' : null,
    !env.MAIL_FROM_ADDRESS ? 'MAIL_FROM_ADDRESS' : null,
  ].filter(Boolean)
  if (missing.length > 0) {
    console.error(`[config] NODE_ENV=production requires: ${missing.join(', ')}`)
    process.exit(1)
  }
}
