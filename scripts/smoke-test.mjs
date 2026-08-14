#!/usr/bin/env node
/**
 * Smoke test backend portal — Elysia DAN Laravel, dari satu file.
 *
 * Cara pakai:
 *   # Default: Elysia lokal
 *   node scripts/smoke-test.mjs
 *
 *   # Backend lain (Laravel / server produksi)
 *   node scripts/smoke-test.mjs --base http://localhost/rsud-tgms
 *   node scripts/smoke-test.mjs --base https://portal-rsud.example.com
 *
 *   # Mode Laravel: key jadwal-dokter (opsional, untuk cek endpoint ber-X-key)
 *   node scripts/smoke-test.mjs --base http://localhost/rsud-tgms --key <key-simrs>
 *
 *   # Alur login lengkap (opsional — butuh kredensial pasien)
 *   NIK=... DOB=yyyy-mm-dd PASSWORD=... node scripts/smoke-test.mjs
 *
 * Keluar dengan exit code 0 = semua lolos, 1 = ada yang gagal.
 * Mode dideteksi otomatis: ada /api/health JSON status:ok → Elysia, selain itu Laravel.
 */
const args = process.argv.slice(2)
const arg = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const BASE = (arg('base') || process.env.BASE_URL || 'http://127.0.0.1:3001').replace(/\/$/, '')
const XKEY = arg('key') || process.env.XKEY || ''
const NIK = process.env.NIK || ''
const DOB = process.env.DOB || ''
const PASS = process.env.PASSWORD || process.env.PASS || ''

let passed = 0
let failed = 0

async function check(name, fn) {
  try {
    const { ok, detail } = await fn()
    if (ok) { passed++; console.log(`  ✅ ${name}`) }
    else { failed++; console.log(`  ❌ ${name}${detail ? ' — ' + detail : ''}`) }
  } catch (e) {
    failed++; console.log(`  ❌ ${name} — error: ${e.message}`)
  }
}

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* not JSON */ }
  return { status: res.status, json, text: text.slice(0, 120) }
}

// ===== Deteksi mode =====
let mode = 'laravel'
try {
  const h = await req('/api/health')
  if (h.status === 200 && h.json?.status === 'ok') mode = 'elysia'
} catch { /* offline → laravel assumption */ }
const P = mode === 'laravel' ? '/api' : '' // Laravel route di bawah /api

console.log(`\n🔍 Mode: ${mode}  |  Base: ${BASE}\n`)

// ===== Public endpoints =====
console.log('─ Public ─')
if (mode === 'elysia') {
  await check('GET /api/health', async () => {
    const r = await req('/api/health')
    return { ok: r.status === 200 && r.json?.status === 'ok', detail: `status ${r.status}` }
  })
}
await check('GET /api/jadwal-dokter (data publik)', async () => {
  const r = await req('/api/jadwal-dokter', XKEY ? { headers: { 'X-key': XKEY } } : {})
  return { ok: r.status === 200 && r.json?.metaData?.status === 'success' && Array.isArray(r.json?.response), detail: `status ${r.status}` }
})

// ===== Survey =====
console.log('─ Survey ─')
let surveySlug = ''
await check('GET /v1/portal/survey', async () => {
  const r = await req(`${P}/v1/portal/survey`)
  const list = r.json?.response
  surveySlug = Array.isArray(list) && list.length > 0 ? list[0].slug : ''
  return { ok: r.status === 200 && Array.isArray(list) && list.length > 0, detail: `status ${r.status}` }
})
await check('GET /v1/portal/survey/:slug (detail + pertanyaan)', async () => {
  if (!surveySlug) return { ok: false, detail: 'survey kosong' }
  const r = await req(`${P}/v1/portal/survey/${surveySlug}`)
  return { ok: r.status === 200 && Array.isArray(r.json?.response?.questions), detail: `status ${r.status}` }
})

// ===== Auth (tanpa kredensial — hanya cek jalur & validasi) =====
console.log('─ Auth (validasi) ─')
await check('POST /v1/portal/login — kredensial salah ditolak', async () => {
  const r = await req(`${P}/v1/portal/login`, {
    method: 'POST', body: JSON.stringify({ no_ktp: '0000000000000000', tgl_lahir: '1990-01-01', password: 'salah' }),
  })
  return { ok: r.json?.metaData?.status === 'error', detail: `status ${r.status}` }
})
await check('POST /v1/portal/register — password pendek ditolak', async () => {
  const r = await req(`${P}/v1/portal/register`, {
    method: 'POST', body: JSON.stringify({ no_ktp: '0000000000000000', tgl_lahir: '1990-01-01', password: 'short', password_confirmation: 'short' }),
  })
  return { ok: r.json?.metaData?.status === 'error', detail: `status ${r.status}` }
})
await check('POST /v1/portal/password/forgot — email tak dikenal, respon generik', async () => {
  const r = await req(`${P}/v1/portal/password/forgot`, {
    method: 'POST', body: JSON.stringify({ email: 'smoketest-nonexistent@invalid.local' }),
  })
  const ok = r.status === 200 && r.json?.metaData?.status === 'success'
  return { ok, detail: `status ${r.status}` }
})
if (mode === 'elysia') {
  await check('POST /v1/portal/login — body invalid JSON → 400 metaData', async () => {
    const r = await req(`${P}/v1/portal/login`, { method: 'POST', body: '{bad json' })
    return { ok: r.status === 400 && r.json?.metaData?.status === 'error', detail: `status ${r.status}` }
  })
}

// ===== Alur login lengkap (hanya jika NIK/DOB/PASSWORD diisi) =====
if (NIK && DOB && PASS) {
  console.log('─ Auth flow lengkap ─')
  let token = ''
  await check('login pasien valid', async () => {
    const r = await req(`${P}/v1/portal/login`, {
      method: 'POST', body: JSON.stringify({ no_ktp: NIK, tgl_lahir: DOB, password: PASS }),
    })
    token = r.json?.response?.token || ''
    return { ok: r.status === 200 && !!token, detail: `status ${r.status}` }
  })
  const authHeaders = { Authorization: `Bearer ${token}`, 'X-Auth-Token': token }
  await check('GET /v1/portal/profile (token)', async () => {
    const r = await req(`${P}/v1/portal/profile`, { headers: authHeaders })
    return { ok: r.status === 200 && !!r.json?.response?.no_rkm_medis, detail: `status ${r.status}` }
  })
  await check('GET /v1/portal/riwayat', async () => {
    const r = await req(`${P}/v1/portal/riwayat`, { headers: authHeaders })
    return { ok: r.status === 200 && Array.isArray(r.json?.response), detail: `status ${r.status}` }
  })
  await check('GET /v1/portal/sessions', async () => {
    const r = await req(`${P}/v1/portal/sessions`, { headers: authHeaders })
    return { ok: r.status === 200 && !!r.json?.response?.sessions, detail: `status ${r.status}` }
  })
  await check('POST /v1/portal/logout', async () => {
    const r = await req(`${P}/v1/portal/logout`, { method: 'POST', headers: authHeaders })
    return { ok: r.status === 200, detail: `status ${r.status}` }
  })
  await check('token invalid setelah logout', async () => {
    const r = await req(`${P}/v1/portal/profile`, { headers: authHeaders })
    return { ok: r.status === 401, detail: `status ${r.status}` }
  })
} else {
  console.log('─ Alur login lengkap dilewati (isi NIK/DOB/PASSWORD untuk mengaktifkan) ─')
}

// ===== Ringkasan =====
console.log(`\n${failed === 0 ? '🎉' : '⚠️'}  ${passed} passed, ${failed} failed\n`)
process.exit(failed ? 1 : 0)
