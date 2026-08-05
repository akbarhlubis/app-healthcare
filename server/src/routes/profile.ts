import { Elysia, t } from 'elysia'
import { db } from '../db'
import { ok, fail, verifyToken } from '../middleware/auth'

export const profileRoutes = new Elysia({ prefix: '/v1/portal' })

  .get('/profile', async ({ headers, set }) => {
    const userId = await verifyToken(headers.authorization)
    if (!userId) {
      set.status = 401
      return fail('Token tidak ditemukan', 401)
    }

    const row = await db.first<any>(
      `SELECT u.id, u.no_rkm_medis, u.email, p.nm_pasien
       FROM uxui_portal_users u
       JOIN pasien p ON p.no_rkm_medis = u.no_rkm_medis
       WHERE u.id = ?`,
      [userId]
    )
    if (!row) {
      set.status = 201
      return fail('User tidak ditemukan', 201)
    }

    return ok({
      no_rkm_medis: row.no_rkm_medis,
      nama: row.nm_pasien,
      email: row.email || '',
    }, 'Profile berhasil dimuat')
  })

  .put(
    '/profile',
    async ({ headers, body, set }) => {
      const userId = await verifyToken(headers.authorization)
      if (!userId) {
        set.status = 401
        return fail('Token tidak ditemukan', 401)
      }

      // Check email uniqueness
      if (body.email) {
        const existing = await db.first<any>(
          'SELECT id FROM uxui_portal_users WHERE email = ? AND id != ?',
          [body.email, userId]
        )
        if (existing) {
          set.status = 201
          return fail('Email sudah digunakan', 201)
        }
      }

      await db.execute(
        'UPDATE uxui_portal_users SET email = ? WHERE id = ?',
        [body.email, userId]
      )

      return ok({ email: body.email }, 'Email berhasil diperbarui')
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
      }),
    }
  )
