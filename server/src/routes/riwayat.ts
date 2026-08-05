import { Elysia } from 'elysia'
import { db } from '../db'
import { ok, fail, verifyToken } from '../middleware/auth'

export const riwayatRoutes = new Elysia({ prefix: '/v1/portal' })

  .get('/riwayat', async ({ headers, set }) => {
    const userId = await verifyToken(headers.authorization)
    if (!userId) {
      set.status = 401
      return fail('Token tidak ditemukan', 401)
    }

    // Get no_rkm_medis from portal user
    const portalUser = await db.first<any>(
      'SELECT no_rkm_medis FROM uxui_portal_users WHERE id = ?',
      [userId]
    )
    if (!portalUser?.no_rkm_medis) {
      return ok([])
    }

    try {
      const rows = await db.query<any>(`
        SELECT
          r.no_rawat,
          r.tgl_registrasi,
          r.jam_reg,
          r.status_lanjut,
          p.nm_poli,
          d.nm_dokter
        FROM reg_periksa r
        LEFT JOIN poliklinik p ON p.kd_poli = r.kd_poli
        LEFT JOIN dokter d ON d.kd_dokter = r.kd_dokter
        WHERE r.no_rkm_medis = ?
        ORDER BY r.tgl_registrasi DESC, r.jam_reg DESC
        LIMIT 50
      `, [portalUser.no_rkm_medis])

      return ok(rows)
    } catch {
      return ok([])
    }
  })
