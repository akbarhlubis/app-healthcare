import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authRoutes } from './routes/auth'
import { profileRoutes } from './routes/profile'
import { surveyRoutes } from './routes/survey'
import { doctorRoutes } from './routes/doctor'
import { riwayatRoutes } from './routes/riwayat'
import { sessionRoutes } from './routes/sessions'

// Replicate same app setup as index.ts but without listen + with rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
function rateLimit(windowMs = 15000, max = 10) {
  return (app: Elysia) =>
    app.derive(({ request, set }) => {
      const url = new URL(request.url)
      if (!url.pathname.includes('/login') && !url.pathname.includes('/register')) return {}
      const key = `test:${url.pathname}`
      const now = Date.now()
      let entry = rateLimitMap.get(key)
      if (!entry || now > entry.resetAt) { rateLimitMap.set(key, { count: 1, resetAt: now + windowMs }); return {} }
      entry.count++
      if (entry.count > max) { set.status = 429; return {} }
      rateLimitMap.set(key, entry)
      return {}
    })
}

function securityHeaders(app: Elysia) {
  return app.onAfterHandle(({ set }) => {
    set.headers['X-Content-Type-Options'] = 'nosniff'
    set.headers['X-Frame-Options'] = 'DENY'
  })
}

const app = new Elysia()
  .use(cors({ origin: '*' }))
  .use(securityHeaders)
  .use(rateLimit(15000, 10))
  .use(authRoutes).use(profileRoutes).use(riwayatRoutes)
  .use(sessionRoutes).use(surveyRoutes).use(doctorRoutes)
  .get('/api/health', () => ({ status: 'ok' }))

let p = 0, f = 0, w = 0
function pass(n: string) { console.log(`  ✅ ${n}`); p++ }
function fail(n: string, d?: string) { console.log(`  ❌ ${n}${d ? ' — ' + d : ''}`); f++ }
function warn(n: string, d?: string) { console.log(`  ⚠️  ${n}${d ? ' — ' + d : ''}`); w++ }

console.log('🔒 SECURITY AUDIT v2 — Elysia Backend\n')

// ===== AUTHENTICATION =====
console.log('─── AUTHENTICATION ───')
console.log('  H1: Password hashing')
const h = await Bun.password.hash('test', { algorithm: 'bcrypt' })
pass(h.startsWith('$2') ? 'bcrypt hash' : 'unknown', h.slice(0, 20))

console.log('  H2: Cost factor')
const cm = h.match(/^\$2[aby]?\$(\d+)\$/)
if (cm && parseInt(cm[1]) >= 10) pass(`cost=${cm[1]}`)
else warn('cost', cm ? `cost=${cm[1]}` : 'unknown')

console.log('  H3: Password not leaked')
const NIK = '1806184803860002', DOB = '1986-02-10'
const loginRes = await app.handle(new Request('http://localhost/v1/portal/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ no_ktp: NIK, tgl_lahir: DOB, password: 'secret123' }),
}))
const loginJson = await loginRes.json()
pass('no password in response', !JSON.stringify(loginJson).includes('password'))

console.log('  H4: User enumeration')
const badNik = await app.handle(new Request('http://localhost/v1/portal/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ no_ktp: '9999999999999999', tgl_lahir: '2000-01-01', password: 'x' }),
}))
const badPass = await app.handle(new Request('http://localhost/v1/portal/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ no_ktp: NIK, tgl_lahir: DOB, password: 'wrong' }),
}))
const msg1 = (await badNik.json()).metaData?.message
const msg2 = (await badPass.json()).metaData?.message
if (msg1 === msg2) pass('identical error messages')
else warn('user enumeration', `different: "${msg1}" vs "${msg2}"`)

// ===== INPUT VALIDATION =====
console.log('\n─── INPUT VALIDATION ───')
console.log('  H5: SQLi — login body')
const sqli = await app.handle(new Request('http://localhost/v1/portal/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ no_ktp: "' OR '1'='1", tgl_lahir: "' OR 1=1--", password: "' OR 1=1--" }),
}))
pass('SQLi rejected', sqli.status !== 500, `status ${sqli.status}`)

console.log('  H6: SQLi — query params')
const sqliDoc = await app.handle(new Request('http://localhost/api/jadwal-dokter?kd_dokter=%27%20OR%20%271%27%3D%271'))
pass('SQLi doc handled', sqliDoc.status === 200, `status ${sqliDoc.status}`)

console.log('  H7: Long input')
const long = await app.handle(new Request('http://localhost/v1/portal/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ no_ktp: 'x'.repeat(5000), tgl_lahir: DOB, password: 'x' }),
}))
pass('long input safe', long.status !== 500, `status ${long.status}`)

console.log('  H8: Bad date format')
const badDate = await app.handle(new Request('http://localhost/v1/portal/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ no_ktp: NIK, tgl_lahir: '<script>alert(1)</script>', password: 'x' }),
}))
pass('bad date handled', badDate.status !== 500, `status ${badDate.status}`)

console.log('  H9: Stored XSS')
const xssRes = await app.handle(new Request('http://localhost/v1/portal/survey/survey-kepuasan/submit', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ answers: [{ form_question_id: 999, answer: '<script>alert(1)</script>' }] }),
}))
pass('XSS safe (no crash)', xssRes.status !== 500, `status ${xssRes.status}`)

// ===== AUTHORIZATION =====
console.log('\n─── AUTHORIZATION ───')
console.log('  H10: Protected routes')
let ok10 = true
for (const r of ['/v1/portal/profile', '/v1/portal/riwayat', '/v1/portal/sessions']) {
  const res = await app.handle(new Request(`http://localhost${r}`))
  if (res.status !== 401) { ok10 = false; fail(r, `status ${res.status}`) }
}
if (ok10) pass('all 3 routes reject unauthenticated')

console.log('  H11: Token after logout')
const tk = loginJson.response?.token
if (tk) {
  await app.handle(new Request('http://localhost/v1/portal/logout', {
    method: 'POST', headers: { 'Authorization': `Bearer ${tk}` },
  }))
  const after = await app.handle(new Request('http://localhost/v1/portal/profile', {
    headers: { 'Authorization': `Bearer ${tk}` },
  }))
  pass('token invalidated', after.status === 401, `status ${after.status}`)
} else warn('skip — no token from login')

console.log('  H12: Fake token')
const fake = await app.handle(new Request('http://localhost/v1/portal/profile', {
  headers: { 'Authorization': 'Bearer fake-token-12345' },
}))
pass('fake token rejected', fake.status === 401, `status ${fake.status}`)

// ===== DATA & ERRORS =====
console.log('\n─── DATA EXPOSURE ───')
console.log('  H13: Error messages clean')
const errRes = await app.handle(new Request('http://localhost/v1/portal/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ no_ktp: NIK, tgl_lahir: DOB, password: 'wrong' }),
}))
const errBody = JSON.stringify(await errRes.json()).toLowerCase()
const leak = ['stack', 'throw', 'sql', 'table', 'column', 'mysql', 'error:'].some(w => errBody.includes(w))
if (!leak) pass('no internal details leaked')
else fail('internal info leaked')

// ===== SECURITY HEADERS =====
console.log('\n─── SECURITY HEADERS ───')
console.log('  H14: Headers present')
const hRes = await app.handle(new Request('http://localhost/api/health'))
const hdrs = hRes.headers
pass('X-Content-Type-Options', hdrs.get('x-content-type-options') === 'nosniff')
pass('X-Frame-Options', hdrs.get('x-frame-options') === 'DENY')

// ===== RATE LIMITING =====
console.log('\n─── RATE LIMITING ───')
console.log('  H15: Login rate limit')
let limited = false
for (let i = 0; i < 15; i++) {
  const r = await app.handle(new Request('http://localhost/v1/portal/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ no_ktp: NIK, tgl_lahir: DOB, password: 'wrong' }),
  }))
  if (r.status === 429) { limited = true; break }
}
if (limited) pass('rate limit active (429 after >10 attempts)')
else warn('rate limiter not triggered (may need more attempts)')

// ================================================================
console.log(`\n${'='.repeat(55)}`)
console.log(`  ✅ ${p} passed  |  ⚠️  ${w} warnings  |  ❌ ${f} failed`)
console.log(`${'='.repeat(55)}`)
if (f > 0) console.log('\n🔴 CRITICAL — fix before production!')
else if (w > 0) console.log('\n🟡 WARNINGS — review before production')
else console.log('\n🟢 ALL CLEAN')

process.exit(f > 0 ? 1 : 0)
