import { Elysia } from 'elysia'
import { db } from '../db'
import { ok } from '../middleware/auth'

/**
 * Public schedule data — no API key required.
 * Doctor schedules are not sensitive; abuse is handled by rate limiting
 * and (optionally) caching at the Nginx layer.
 */
export const doctorRoutes = new Elysia({ prefix: '/api' })
  .get('/jadwal-dokter', async ({ query }) => {
    const { kd_dokter, kd_poli, hari } = query as Record<string, string | undefined>

    let sql = `
      SELECT
        d.kd_dokter,
        d.nm_dokter,
        p.kd_poli,
        p.nm_poli,
        j.hari_kerja,
        j.jam_mulai,
        j.jam_selesai,
        j.kuota
      FROM jadwal j
      JOIN dokter d ON d.kd_dokter = j.kd_dokter
      JOIN poliklinik p ON p.kd_poli = j.kd_poli
      WHERE 1=1
    `
    const params: string[] = []

    if (kd_dokter) { sql += ' AND j.kd_dokter = ?'; params.push(kd_dokter) }
    if (kd_poli) { sql += ' AND j.kd_poli = ?'; params.push(kd_poli) }
    if (hari) { sql += ' AND j.hari_kerja = ?'; params.push(hari) }

    sql += ' ORDER BY d.nm_dokter, j.hari_kerja'

    try {
      const rows = await db.query<any>(sql, params)
      return ok(rows)
    } catch (e) {
      console.error('[doctor] jadwal-dokter query failed:', e)
      return ok([])
    }
  })
