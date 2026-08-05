import { Elysia } from 'elysia'
import { db } from '../db'
import { ok, fail, verifyToken, getTokenFromHeader } from '../middleware/auth'

export const sessionRoutes = new Elysia({ prefix: '/v1/portal' })

  .get('/sessions', async ({ headers, set }) => {
    const userId = await verifyToken(headers.authorization)
    if (!userId) {
      set.status = 401
      return fail('Token tidak ditemukan', 401)
    }

    const currentToken = getTokenFromHeader(headers.authorization)
    const rows = await db.query<any>(
      'SELECT id, device_name, ip_address, token, created_at FROM uxui_portal_tokens WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )

    const sessions = rows.map((r: any) => ({
      id: r.id,
      device_name: r.device_name || 'Unknown',
      ip_address: r.ip_address || '-',
      created_at: r.created_at,
      is_current: r.token === currentToken,
    }))

    return ok({ sessions }, 'Daftar sesi berhasil dimuat')
  })

  .post('/logout-all', async ({ headers, set }) => {
    const userId = await verifyToken(headers.authorization)
    if (!userId) {
      set.status = 401
      return fail('Token tidak ditemukan', 401)
    }

    await db.execute('DELETE FROM uxui_portal_tokens WHERE user_id = ?', [userId])
    return ok(null, 'Semua perangkat berhasil logout')
  })
