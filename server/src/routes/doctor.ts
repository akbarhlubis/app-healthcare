import { Elysia } from 'elysia'
import { db } from '../db'
import { ok, fail } from '../middleware/auth'
import { env } from '../config/env'

export const doctorRoutes = new Elysia({ prefix: '/api' })
  .get('/jadwal-dokter', async ({ query, headers, set }) => {
    const apiKey = headers['x-key']
    const expectedKey = env.DOCTOR_SCHEDULE_API_KEY
    if (apiKey !== expectedKey) {
      set.status = 401
      return fail('Unauthorized', 401)
    }

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
      return {
        metaData: { status: 'success', kode: 200, message: 'Berhasil' },
        response: rows,
      }
    } catch {
      return {
        metaData: { status: 'success', kode: 200, message: 'Data jadwal belum tersedia' },
        response: [],
      }
    }
  })
