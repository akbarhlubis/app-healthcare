import { Elysia, t } from 'elysia'
import { db } from '../db'
import { ok, fail, generateToken } from '../middleware/auth'
import { createTransport } from 'nodemailer'
import { env } from '../config/env'
import { hashPassword, verifyPassword } from '../lib/password'
import { clientIp } from '../lib/ip'

const mailer = createTransport({
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: false,
  auth: { user: env.MAIL_USERNAME, pass: env.MAIL_PASSWORD },
})

export const authRoutes = new Elysia({ prefix: '/v1/portal' })

  // ==================== LOGIN ====================
  // Laravel: checks no_ktp + tgl_lahir against pasien table, raw token
  .post(
    '/login',
    async ({ body, set, request }) => {
      const { no_ktp, tgl_lahir, password } = body
      const pasien = await db.first<any>(
        'SELECT no_rkm_medis, nm_pasien FROM pasien WHERE no_ktp = ? AND tgl_lahir = ?',
        [no_ktp, tgl_lahir]
      )
      if (!pasien) {
        set.status = 201
        return fail('NIK atau password salah', 201)
      }

      // 2. Find portal account
      const user = await db.first<any>(
        'SELECT id, no_rkm_medis, email, password FROM uxui_portal_users WHERE no_rkm_medis = ?',
        [pasien.no_rkm_medis]
      )
      if (!user) {
        set.status = 201
        return fail('NIK atau password salah', 201)
      }

      // 3. Verify password
      const valid = await verifyPassword(password, user.password)
      if (!valid) {
        set.status = 201
        return fail('NIK atau password salah', 201)
      }

      // 4. Generate raw token (like Laravel Str::random(60))
      const token = generateToken(60)
      await db.execute(
        'INSERT INTO uxui_portal_tokens (user_id, token, device_name, ip_address, last_used_at, created_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [user.id, token, 'Portal Web', clientIp(request)]
      )

      return ok({
        token,
        no_rkm_medis: user.no_rkm_medis,
        nama: pasien.nm_pasien,
        email: user.email || '',
      }, 'Login berhasil')
    },
    {
      body: t.Object({
        no_ktp: t.String({ minLength: 1 }),
        tgl_lahir: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )

  // ==================== REGISTER ====================
  // Laravel: checks no_ktp + tgl_lahir, requires password_confirmation, no token returned
  .post(
    '/register',
    async ({ body, set }) => {
      const { no_ktp, tgl_lahir, password, password_confirmation, email } = body

      // Validation
      if (password !== password_confirmation) {
        set.status = 201
        return fail('Konfirmasi password tidak cocok', 201)
      }
      if (password.length < 8) {
        set.status = 201
        return fail('Password minimal 8 karakter', 201)
      }

      // 1. Find patient by NIK + tgl_lahir
      const pasien = await db.first<any>(
        'SELECT no_rkm_medis, nm_pasien FROM pasien WHERE no_ktp = ? AND tgl_lahir = ?',
        [no_ktp, tgl_lahir]
      )
      if (!pasien) {
        set.status = 201
        return fail('Data pasien tidak ditemukan, pastikan NIK dan tanggal lahir sesuai', 201)
      }

      // 2. Check if already registered
      const existing = await db.first<any>(
        'SELECT id FROM uxui_portal_users WHERE no_rkm_medis = ?',
        [pasien.no_rkm_medis]
      )
      if (existing) {
        set.status = 201
        return fail('Akun untuk pasien ini sudah terdaftar, silakan login', 201)
      }

      // 3. Check email uniqueness
      if (email) {
        const emailExists = await db.first<any>(
          'SELECT id FROM uxui_portal_users WHERE email = ?',
          [email]
        )
        if (emailExists) {
          set.status = 201
          return fail('Email sudah digunakan', 201)
        }
      }

      // 4. Create portal user
      const hashed = await hashPassword(password)
      await db.execute(
        'INSERT INTO uxui_portal_users (no_rkm_medis, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
        [pasien.no_rkm_medis, email || null, hashed]
      )

      // Laravel register does NOT return token, just user info
      return ok({
        no_rkm_medis: pasien.no_rkm_medis,
        nama: pasien.nm_pasien,
        email: email || null,
      }, 'Registrasi berhasil')
    },
    {
      body: t.Object({
        no_ktp: t.String({ minLength: 1 }),
        tgl_lahir: t.String({ minLength: 1 }),
        password: t.String({ minLength: 8 }),
        password_confirmation: t.String({ minLength: 1 }),
        email: t.Optional(t.String()),
      }),
    }
  )

  // ==================== FORGOT PASSWORD ====================
  .post(
    '/password/forgot',
    async ({ body }) => {
      const { email } = body
      const defaultMsg = 'Jika email Anda terdaftar, link reset password akan dikirim'

      const user = await db.first<any>(
        'SELECT id FROM uxui_portal_users WHERE email = ?',
        [email]
      )
      if (!user) {
        return ok(null, defaultMsg)
      }

      // Laravel: hash the reset token with bcrypt
      const plainToken = generateToken(64)
      const hashedToken = await hashPassword(plainToken)

      await db.execute('DELETE FROM uxui_portal_password_resets WHERE email = ?', [email])
      await db.execute(
        'INSERT INTO uxui_portal_password_resets (email, token, created_at) VALUES (?, ?, NOW())',
        [email, hashedToken]
      )

      const frontendUrl = env.FRONTEND_URL
      const resetLink = `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(plainToken)}`

      try {
        await mailer.sendMail({
          from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
          to: email,
          subject: 'Reset Password - Portal RSUD',
          html: `<p>Klik link berikut untuk mereset password Anda:</p><a href="${resetLink}">${resetLink}</a><p>Link berlaku selama 1 jam.</p>`,
        })
      } catch (e) {
        // SMTP failure: never reveal whether the address is registered —
        // return the same generic message as Laravel and log server-side.
        await db.execute('DELETE FROM uxui_portal_password_resets WHERE email = ?', [email])
        console.error('Failed to send reset email:', e)
        return ok(null, defaultMsg)
      }

      return ok(null, defaultMsg)
    },
    {
      body: t.Object({ email: t.String({ format: 'email' }) }),
    }
  )

  // ==================== RESET PASSWORD ====================
  .post(
    '/password/reset',
    async ({ body, set }) => {
      const { email, token, password, password_confirmation } = body

      if (password !== password_confirmation) {
        set.status = 201
        return fail('Konfirmasi password tidak cocok', 201)
      }
      if (password.length < 8) {
        set.status = 201
        return fail('Password minimal 8 karakter', 201)
      }

      // Find reset record
      const reset = await db.first<any>(
        'SELECT token, created_at FROM uxui_portal_password_resets WHERE email = ?',
        [email]
      )
      if (!reset) {
        set.status = 201
        return fail('Token tidak valid atau sudah expired', 201)
      }

      // Check expiry (60 minutes)
      if (reset.created_at) {
        const created = new Date(reset.created_at)
        const minutes = (Date.now() - created.getTime()) / (1000 * 60)
        if (minutes > 60) {
          await db.execute('DELETE FROM uxui_portal_password_resets WHERE email = ?', [email])
          set.status = 201
          return fail('Link reset password sudah expired, silakan minta ulang', 201)
        }
      }

      // Verify token (bcrypt hash compare)
      const valid = await verifyPassword(token, reset.token)
      if (!valid) {
        set.status = 201
        return fail('Token tidak valid', 201)
      }

      // Update password
      const hashed = await hashPassword(password)
      await db.execute('UPDATE uxui_portal_users SET password = ? WHERE email = ?', [hashed, email])
      await db.execute('DELETE FROM uxui_portal_password_resets WHERE email = ?', [email])

      return ok(null, 'Password berhasil diubah, silakan login kembali')
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        token: t.String({ minLength: 1 }),
        password: t.String({ minLength: 8 }),
        password_confirmation: t.String({ minLength: 1 }),
      }),
    }
  )

  // ==================== LOGOUT ====================
  .post('/logout', async ({ headers }) => {
    const auth = headers.authorization
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7)
      await db.execute('DELETE FROM uxui_portal_tokens WHERE token = ?', [token])
    }
    return ok(null, 'Logout berhasil')
  })
