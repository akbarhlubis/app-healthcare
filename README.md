# 🏥 App Healthcare — Monorepo

> Vue 3 SPA + Elysia REST API untuk portal pasien RSUD

---

## 📋 Daftar Isi

- [Arsitektur](#-arsitektur)
- [Prasyarat](#-prasyarat)
- [Quick Start](#-quick-start)
- [Menjalankan Backend](#-menjalankan-backend)
- [Menjalankan Frontend](#-menjalankan-frontend)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Struktur Proyek](#-struktur-proyek)
- [Daftar Endpoint API](#-daftar-endpoint-api)
- [Switch Backend: Elysia ↔ Laravel](#-switch-backend-elysia--laravel)
- [Development Workflow](#-development-workflow)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## 🏗 Arsitektur

```
┌─────────────────────────────────────────┐
│           Browser (Vue 3 SPA)            │
│     http://localhost:5173                │
└──────────────┬──────────────────────────┘
               │ fetch('/v1/portal/login')
               │ fetch('/api/jadwal-dokter')
               ▼
┌─────────────────────────────────────────┐
│          Vite Dev Server :5173           │
│          ┌──────────────────┐           │
│          │   Proxy Router   │           │
│          │  /v1/* → :3001   │           │
│          │  /api/* → :3001   │           │
│          └──────────────────┘           │
└──────────────┬──────────────────────────┘
               │ HTTP
               ▼
┌─────────────────────────────────────────┐
│       Elysia REST API :3001             │
│       ┌──────────────────────┐          │
│       │ auth / profile       │          │
│       │ survey / sessions    │          │
│       │ riwayat / doctor     │          │
│       │ rate-limiter         │          │
│       │ security headers     │          │
│       └──────────────────────┘          │
└──────────────┬──────────────────────────┘
               │ mysql2 (parameterized)
               ▼
┌─────────────────────────────────────────┐
│           MySQL (sik)                    │
│   uxui_portal_users                     │
│   uxui_portal_tokens                    │
│   uxui_portal_forms                     │
│   pasien, reg_periksa, dokter, ...      │
└─────────────────────────────────────────┘
```

---

## 📦 Prasyarat

| Tools | Versi | Wajib? | Keterangan |
|-------|-------|:------:|-----------|
| **Bun** | ≥ 1.2 | ✅ | Untuk jalankan backend |
| **Node.js** | ≥ 18 | ❌ | Alternatif Bun (via `@elysia/node`) |
| **MySQL** | 5.7+ | ✅ | Database `sik` sudah ada |
| **Git** | — | ❌ | Opsional |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd app-healthcare

# Install frontend dependencies
bun install

# Install backend dependencies
cd server
bun install
cd ..
```

### 2. Konfigurasi Backend `.env`

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sik
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=portal-rsud-jwt-secret-change-in-production
FRONTEND_URL=http://localhost:5173
DOCTOR_SCHEDULE_API_KEY=majumundurok
PORT=3001
```

### 3. Jalankan

```bash
# Terminal 1 — Backend (auto hot-reload)
bun run dev:server

# Terminal 2 — Frontend (auto hot-reload, proxy ke backend)
bun run dev

# Atau satu terminal:
bun run dev:all
```

Buka **http://localhost:5173**

---

## ⚙️ Menjalankan Backend

### Dengan Bun (rekomendasi)

```bash
cd server

# Development (hot reload)
bun run dev

# Build production
bun run build

# Start production
bun run start
```

### Dengan Node.js / npm

```bash
cd server

# Install + adapter Node
npm install

# Development (hot reload via tsx)
npm run dev:node

# Build + start
npm run build
npm run start:node
```

> **Auto-detect runtime**: `src/index.ts` otomatis deteksi apakah `@elysia/node` terinstall.  
> Kalau ada → pakai Node.js adapter. Kalau tidak → default Bun.

### Endpoint Test

```bash
curl http://localhost:3001/api/health
# → {"status":"ok","timestamp":"2026-08-05T..."}
```

---

## 🖥 Menjalankan Frontend

```bash
# Development (hot reload + proxy ke backend)
bun run dev
# atau
npm run dev
```

| Command | Keterangan |
|---------|-----------|
| `bun run dev` | Dev server :5173 + hot reload |
| `bun run dev:server` | Backend :3001 + hot reload |
| `bun run dev:all` | Keduanya sekaligus |
| `bun run build` | Build frontend production |
| `bun run build:server` | Build backend production |

---

## 🔧 Konfigurasi Environment

### Backend (`server/.env`)

| Variable | Default | Keterangan |
|----------|---------|------------|
| `DB_HOST` | `127.0.0.1` | Host MySQL |
| `DB_PORT` | `3306` | Port MySQL |
| `DB_DATABASE` | `sik` | Nama database |
| `DB_USERNAME` | `root` | User MySQL |
| `DB_PASSWORD` | _(empty)_ | Password MySQL |
| `FRONTEND_URL` | `http://localhost:5173` | Origin frontend (CORS) |
| `PORT` | `3001` | Port backend |
| `DOCTOR_SCHEDULE_API_KEY` | `majumundurok` | API key jadwal dokter |
| `MAIL_HOST` | `smtp-relay.brevo.com` | SMTP untuk reset password |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USERNAME` | _(empty)_ | SMTP username |
| `MAIL_PASSWORD` | _(empty)_ | SMTP password |
| `MAIL_FROM_ADDRESS` | _(empty)_ | From email |
| `MAIL_FROM_NAME` | `RSUD` | From name |

### Frontend (opsional)

```bash
# .env di root app-healthcare
VITE_PORTAL_API_URL=/v1/portal        # Default: proxy Vite
VITE_DOCTOR_SCHEDULE_API_URL=/api/jadwal-dokter
```

> ⚠️ Jangan commit `.env` — file ini sudah di `.gitignore`.

---

## 📁 Struktur Proyek

```
app-healthcare/
│
├── src/                          # Vue 3 Frontend
│   ├── App.vue                   # Layout utama
│   ├── main.js                   # Entrypoint (Pinia + Router)
│   ├── router.js                 # Vue Router config
│   ├── style.css                 # Tailwind + DaisyUI
│   ├── utils/
│   │   └── api.js                # HTTP client (fetch wrapper)
│   ├── composables/
│   │   ├── useDoctorSchedule.js  # Jadwal dokter composable
│   │   └── useSurvey.js          # Survey composable
│   ├── stores/
│   │   ├── authStore.js          # User auth (Pinia)
│   │   ├── darkModeStore.js      # Dark mode toggle
│   │   └── doctorStore.js        # Doctor list state
│   ├── pages/
│   │   ├── Home.vue
│   │   ├── DoctorSchedule.vue
│   │   ├── MedicalSurvey.vue
│   │   ├── PatientRegistration.vue
│   │   ├── Register.vue
│   │   ├── Profile.vue
│   │   ├── VisitHistory.vue
│   │   ├── ForgotPassword.vue
│   │   └── ResetPassword.vue
│   └── components/
│       └── layout/Navbar.vue
│
├── server/                       # Elysia Backend
│   ├── src/
│   │   ├── index.ts              # Entrypoint (CORS, headers, rate-limit)
│   │   ├── db.ts                 # MySQL connection pool
│   │   ├── middleware/
│   │   │   └── auth.ts           # Token verify, helpers (ok/fail)
│   │   └── routes/
│   │       ├── auth.ts           # Login, register, forgot/reset password
│   │       ├── profile.ts        # GET/PUT profile
│   │       ├── riwayat.ts        # Visit history (HIS reg_periksa)
│   │       ├── sessions.ts       # Active sessions + logout-all
│   │       ├── survey.ts         # Survey CRUD + submit
│   │       └── doctor.ts         # Jadwal dokter (public, X-key)
│   ├── .env                      # Environment variables (GITIGNORED)
│   ├── .env.example              # Template environment
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                  # Root workspace scripts
├── vite.config.js                # Vite config + proxy
└── index.html
```

---

## 📡 Daftar Endpoint API

### Public (tanpa token)

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/jadwal-dokter` | Jadwal dokter (header: `X-key`) |
| `POST` | `/v1/portal/login` | Login (NIK + DOB + password) |
| `POST` | `/v1/portal/register` | Registrasi (NIK + DOB + password) |
| `POST` | `/v1/portal/password/forgot` | Lupa password (email) |
| `POST` | `/v1/portal/password/reset` | Reset password (token) |
| `GET` | `/v1/portal/survey` | List survey |
| `GET` | `/v1/portal/survey/:slug` | Detail survey + questions |
| `POST` | `/v1/portal/survey/:slug/submit` | Submit jawaban survey |

### Protected (butuh token `Bearer`)

| Method | Endpoint | Keterangan |
|--------|----------|------------|
| `POST` | `/v1/portal/logout` | Logout (hapus token) |
| `GET` | `/v1/portal/profile` | Profil user (JOIN pasien) |
| `PUT` | `/v1/portal/profile` | Update email |
| `GET` | `/v1/portal/riwayat` | Riwayat kunjungan |
| `GET` | `/v1/portal/sessions` | Daftar sesi aktif |
| `POST` | `/v1/portal/logout-all` | Logout semua perangkat |

### Response Format

```json
// Success
{
  "metaData": { "status": "success", "kode": 200, "message": "Login berhasil" },
  "response": { "token": "...", "nama": "...", "no_rkm_medis": "..." }
}

// Error
{
  "metaData": { "status": "error", "kode": 201, "message": "NIK atau password salah" },
  "response": null
}
```

---

## 🔄 Switch Backend: Elysia ↔ Laravel

Frontend **tidak peduli** backend apa — cukup ubah **1 variabel** di satu file `.env` (root project).

### Langkah

Buka `.env` di root project, ubah `BACKEND_MODE`:

```env
# ===== Pilih backend =====
BACKEND_MODE=elysia    # Elysia (server/, port 3001) — default
# BACKEND_MODE=laravel  # SIMRS Laravel (rsud-tgms) — isi LARAVEL_API_URL
LARAVEL_API_URL=http://localhost/rsud-tgms/api
```

Restart: `bun run dev` (+ `bun run dev:server` jika pakai Elysia).

### Cara kerja

- `vite.config.js` membaca `BACKEND_MODE` dan mengarahkan proxy `/api` & `/v1`:
  - `elysia` → `http://127.0.0.1:3001`
  - `laravel` → `LARAVEL_API_URL` (prefix `/api` otomatis di-strip di proxy `/api`)
- Frontend selalu memakai path relatif (`/v1/portal`, `/api/jadwal-dokter`) — tidak ada yang perlu diubah di kode.
- File `.env` ini **satu-satunya** sumber konfigurasi: branding, frontend API, dan config backend Elysia (DB, mail, port) dibaca dari sini (`server/` otomatis memuatnya).

> ⚠️ `server/.env` tidak lagi diperlukan — sudah digabung ke `.env` root.
> ⚠️ Mode `laravel` berlaku untuk development (Vite proxy). Untuk produksi, arahkan Nginx ke backend yang aktif.

---

## 🧪 Development Workflow

### Tambah endpoint baru

1. Buat file di `server/src/routes/`
2. Register di `server/src/index.ts` → `.use(namaRoutes)`
3. (Opsional) Frontend: tambah di `src/utils/api.js` atau composable baru

```ts
// server/src/routes/contoh.ts
import { Elysia } from 'elysia'
export const contohRoutes = new Elysia({ prefix: '/v1/portal' })
  .get('/contoh', () => ({ status: 'ok' }))
```

```ts
// server/src/index.ts
import { contohRoutes } from './routes/contoh'
// ...
  .use(contohRoutes)
```

### Test endpoint

```bash
# Health check
curl http://localhost:3001/api/health

# Login test
curl -X POST http://localhost:3001/v1/portal/login \
  -H 'Content-Type: application/json' \
  -d '{"no_ktp":"1806184803860002","tgl_lahir":"1986-02-10","password":"secret123"}'

# Protected endpoint
curl http://localhost:3001/v1/portal/profile \
  -H 'Authorization: Bearer <token>'
```

### Linting & Format

Backend TypeScript — strict mode via `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

---

## 🧪 Testing

### Security Audit

```bash
cd server
bun run src/security-audit.ts
```

Hasil terakhir: **15/16 passed, 0 critical failures.**

Cakupan audit:
- ✅ Password hashing (bcrypt cost 10)
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection (stored as raw text, Vue escapes on render)
- ✅ Auth token validation + expiry (24 jam)
- ✅ User enumeration prevention
- ✅ Security headers (X-Content-Type-Options, X-Frame-Options)
- ✅ Rate limiting (10 req/15 menit per auth endpoint)
- ✅ Error messages tidak leak internal details

### Functional Test

```bash
cd server
# Tulis test di server/src/ lalu jalankan:
bun run src/test.ts
```

---

## 🛠 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `ECONNREFUSED :3001` | Backend belum jalan → `bun run dev:server` |
| `ECONNREFUSED :3306` | MySQL tidak jalan → start MySQL service |
| `Table 'sik.uxui_portal_users' doesn't exist` | Database `sik` tidak ada tabel portal. Pastikan Laravel migration sudah dijalankan. |
| `Token tidak ditemukan` | Token expired (24 jam) atau dihapus → login ulang |
| `Tanggal lahir tidak sesuai` | Format harus `YYYY-MM-DD`. Pastikan input dari frontend benar. |
| `CORS error` | Cek `FRONTEND_URL` di `server/.env` sesuai dengan origin frontend |
| `bun: command not found` | Install Bun: `curl -fsSL https://bun.sh/install \| bash` |
| Rate limit 429 | Tunggu 15 menit atau restart backend |

---

## 🔐 Security Notes

- **Password**: bcrypt-hashed, tidak pernah dikembalikan di response API
- **Token**: raw string 60-char, disimpan di `uxui_portal_tokens`, expired 24 jam
- **Reset token**: bcrypt-hashed di DB, one-time use, expired 60 menit
- **Rate limiting**: 10 request per 15 menit untuk login/register/forgot-password
- **Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`
- **SQL**: Semua query menggunakan parameterized queries (mysql2)

---

## 📚 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Vite 7, PrimeVue 4, Pinia 3, TailwindCSS 4, DaisyUI 5 |
| Backend | Elysia 1.x (Bun native + Node adapter) |
| Database | MySQL (HIS `sik` database, charset latin1) |
| Email | Nodemailer + Brevo SMTP |
| Validation | Elysia `t` (TypeBox) |
