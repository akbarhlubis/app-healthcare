import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authRoutes } from './routes/auth'
import { profileRoutes } from './routes/profile'
import { surveyRoutes } from './routes/survey'
import { doctorRoutes } from './routes/doctor'
import { riwayatRoutes } from './routes/riwayat'
import { sessionRoutes } from './routes/sessions'

const app = new Elysia()
  .use(cors({ origin: '*' }))
  .use(authRoutes).use(profileRoutes).use(riwayatRoutes)
  .use(sessionRoutes).use(surveyRoutes).use(doctorRoutes)
  .get('/api/health', () => ({ status: 'ok' }))

let p = 0, f = 0
function ok(name: string, c: boolean, d?: string) {
  if (c) { console.log(`  ✅ ${name}`); p++ }
  else { console.log(`  ❌ ${name}${d ? ' — ' + d : ''}`); f++ }
}

// Test data
const NIK = '1806184803860002'  // EKA RIANAWATI, 1986-02-10
const DOB = '1986-02-10'
let token = ''

// 1. Register
const r1 = await app.handle(new Request('http://localhost/v1/portal/register', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ no_ktp: NIK, tgl_lahir: DOB, password: 'secret123', password_confirmation: 'secret123', email: 'eka-test@test.com' }),
}))
const j1 = await r1.json()
if (r1.status === 200) {
  ok('register success', true)
  ok('no token in register', !j1.response?.token)
  ok('has nama', j1.response?.nama === 'EKA RIANAWATI', j1.response?.nama)
} else if (r1.status === 201 || r1.status === 409) {
  console.log(`   Already registered, skipping... (${j1.metaData?.message})`)
  ok('register skipped (already exists)', true)
} else {
  ok('register', false, `status ${r1.status}: ${j1.metaData?.message}`)
}

// 2. Login
const r2 = await app.handle(new Request('http://localhost/v1/portal/login', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ no_ktp: NIK, tgl_lahir: DOB, password: 'secret123' }),
}))
const j2 = await r2.json()
ok('login status 200', r2.status === 200, `got ${r2.status}: ${j2.metaData?.message}`)
ok('has nama', j2.response?.nama === 'EKA RIANAWATI', j2.response?.nama)
ok('token is raw string', typeof j2.response?.token === 'string' && !j2.response.token.includes('|'))
token = j2.response?.token || ''

// 3. Profile
const r3 = await app.handle(new Request('http://localhost/v1/portal/profile', {
  headers: { 'Authorization': `Bearer ${token}` },
}))
const j3 = await r3.json()
ok('profile status 200', r3.status === 200, `got ${r3.status}: ${j3.metaData?.message}`)
ok('has nama', !!j3.response?.nama)
ok('has no_rkm_medis', !!j3.response?.no_rkm_medis)

// 4. Sessions
const r4 = await app.handle(new Request('http://localhost/v1/portal/sessions', {
  headers: { 'Authorization': `Bearer ${token}` },
}))
const j4 = await r4.json()
ok('sessions status 200', r4.status === 200, `got ${r4.status}`)
ok('sessions array', Array.isArray(j4.response?.sessions))
if (j4.response?.sessions?.length > 0) {
  ok('is_current true', j4.response.sessions.some((s: any) => s.is_current === true))
}

// 5. Logout
const r5 = await app.handle(new Request('http://localhost/v1/portal/logout', {
  method: 'POST', headers: { 'Authorization': `Bearer ${token}` },
}))
ok('logout status 200', r5.status === 200, `got ${r5.status}`)

// 6. Rejected after logout
const r6 = await app.handle(new Request('http://localhost/v1/portal/profile', {
  headers: { 'Authorization': `Bearer ${token}` },
}))
ok('profile after logout → 401', r6.status === 401, `got ${r6.status}`)

console.log(`\n${'='.repeat(40)}`)
console.log(`  ✅ ${p} passed  |  ❌ ${f} failed  |  📊 ${p + f} total`)
process.exit(f > 0 ? 1 : 0)
