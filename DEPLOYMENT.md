# Deployment — app-healthcare (aaPanel + Nginx)

Backend = Elysia di **Node.js** (dikelola aaPanel Node.js Project).
Frontend = static `dist/` dari Vite (dilayani Nginx).

```
Frontend (Vue/Vite)
  → bun install
  → bun run build
  → dist/  (static, Nginx)

Backend (server/)
  → bun install / bun run build  (Bun = package manager & build tool)
  → node dist/index.js           (Node.js = runtime produksi)
  → listen 127.0.0.1:3001 (tidak diekspos publik)
  → Nginx reverse proxy /api dan /v1 ke 127.0.0.1:3001
```

Jangan pernah menjalankan Vite dev server (`vite`, `vite preview`, `bun run dev`) di produksi.

## 1. Build

```bash
git pull

# frontend
bun install --frozen-lockfile
bun run build

# backend
cd server
bun install --frozen-lockfile
bun run build
# cek file output: bun --target node menghasilkan dist/index.js
ls dist/
```

### Tanpa Bun — npm/Node saja

Bun hanya dipakai untuk install & build. Kalau bun bermasalah di server,
seluruh alur bisa pakai npm + Node:

```bash
# frontend (vite via npm)
npm install
npm run build

# backend — jalankan langsung dari source via tsx (tanpa build)
cd server
npm install
npm run start:tsx          # setara node dist/index.js, tanpa butuh bun
```

> `npm run start` (node `dist/index.js`) tetap dipakai kalau `dist/` sudah ada
> (misal hasil build di mesin lain). `start:tsx` menghilangkan kebutuhan
> `bun build` di server.

## 2. Environment (`server/.env`)

Salin dari `server/.env.example` lalu isi. Produksi **wajib** (startup fail-fast jika kurang):

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sik
DB_USERNAME=<bukan root>
DB_PASSWORD=<password db>
FRONTEND_URL=https://<domain-anda>
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=<smtp user>
MAIL_PASSWORD=<smtp pass>
MAIL_FROM_ADDRESS=no-reply@<domain-anda>
MAIL_FROM_NAME=RSUD
```

Jangan commit `.env`.

## 3. aaPanel — Node.js Project

| Setting | Value |
|---|---|
| Project path | `/www/wwwroot/app-healthcare/server` |
| Runtime | Node.js LTS |
| Port | `3001` |
| Run user | `www` |
| Start command | `npm start` (atau `node dist/index.js`) |

> Jangan jalankan sebagai root. Backend hanya listen di `127.0.0.1:3001`; publik hanya lewat Nginx.

## 4. Nginx

### Frontend (SPA fallback)

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Reverse proxy API

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /v1/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

`proxy_pass` tanpa trailing slash mempertahankan path asli (`/api/jadwal-dokter`,
`/v1/portal/login`) — konsisten dengan route backend dan frontend.

Backend membaca IP client dari `X-Forwarded-For`/`X-Real-IP` (lihat
`server/src/lib/ip.ts`) — header ini hanya boleh datang dari Nginx lokal.

## 5. Verifikasi

```bash
curl http://127.0.0.1:3001/api/health
# → {"status":"ok","timestamp":"..."}

# atau pakai smoke test lengkap (Elysia & Laravel, satu file):
bun run check:api                          # Elysia default
bun run check:api -- --base http://localhost/rsud-tgms --key <key-simrs>   # Laravel
NIK=... DOB=yyyy-mm-dd PASSWORD=... bun run check:api   # termasuk alur login
```

## 6. Catatan produksi

- Rate limiting auth: in-memory (per proses). Untuk multi-instance, gunakan
  Redis-backed limiter — belum diimplementasikan karena deployment saat ini single-process.
- `bcryptjs` (pure JS) menggantikan `Bun.password` agar hash bcrypt lama
  (`$2b$` dari Bun, `$2y$` dari Laravel) tetap valid tanpa re-hash.
- `JWT_SECRET` di `.env.example` adalah reserved — token sesi adalah string acak
  yang disimpan di tabel `uxui_portal_tokens` (kompatibel Laravel).
