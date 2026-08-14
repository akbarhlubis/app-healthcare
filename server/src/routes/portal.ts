import { Elysia, t } from 'elysia'
import { db } from '../db'
import { ok, fail, verifyToken } from '../middleware/auth'

/**
 * Portal protected endpoints (auth.portal):
 * - GET  /poliklinik        — daftar poliklinik
 * - GET  /jadwal-dokter     — jadwal dokter (protected version)
 * - POST /daftar-berobat    — pendaftaran berobat
 * - GET  /antrian/:no_rkm_medis — cek antrian
 */
export const portalRoutes = new Elysia({ prefix: '/v1/portal' })

  // ==================== POLIKLINIK ====================
  .get('/poliklinik', async ({ headers, set }) => {
    const userId = await verifyToken(headers.authorization)
    if (!userId) {
      set.status = 401
      return fail('Token tidak ditemukan', 401)
    }

    try {
      const rows = await db.query<any>(
        'SELECT kd_poli, nm_poli, registrasi, status FROM poliklinik ORDER BY nm_poli'
      )
      return ok(rows)
    } catch {
      return ok([])
    }
  })

  // ==================== JADWAL DOKTER (protected) ====================
  .get('/jadwal-dokter', async ({ headers, query, set }) => {
    const userId = await verifyToken(headers.authorization)
    if (!userId) {
      set.status = 401
      return fail('Token tidak ditemukan', 401)
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
      return ok(rows)
    } catch {
      return ok([])
    }
  })

  // ==================== DAFTAR BEROBAT ====================
  .post(
    '/daftar-berobat',
    async ({ headers, body, set }) => {
      const userId = await verifyToken(headers.authorization)
      if (!userId) {
        set.status = 401
        return fail('Token tidak ditemukan', 401)
      }

      // Get patient no_rkm_medis from portal user
      const portalUser = await db.first<any>(
        'SELECT no_rkm_medis FROM uxui_portal_users WHERE id = ?',
        [userId]
      )
      if (!portalUser?.no_rkm_medis) {
        set.status = 201
        return fail('Data pasien tidak ditemukan', 201)
      }

      const { kd_dokter, kd_poli, tgl_registrasi, kd_pj } = body

      // Generate no_rawat format HIS: YYYY/MM/DD/XXXXXX
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      const datePath = `${y}/${m}/${d}`

      // Cari nomor urut terakhir hari ini
      const last = await db.first<any>(
        "SELECT no_rawat FROM reg_periksa WHERE no_rawat LIKE ? ORDER BY no_rawat DESC LIMIT 1",
        [`${datePath}/%`]
      )
      const lastSeq = last?.no_rawat ? parseInt(last.no_rawat.split('/').pop() || '0') : 0
      const noRawat = `${datePath}/${String(lastSeq + 1).padStart(6, '0')}`

      try {
        await db.execute(
          `INSERT INTO reg_periksa (
            no_rawat, no_rkm_medis, kd_dokter, kd_poli,
            tgl_registrasi, jam_reg, status_lanjut,
            stts_daftar, kd_pj, status_bayar, status_poli
          ) VALUES (?, ?, ?, ?, ?, ?, 'Ralan', 'Baru', ?, 'Belum Bayar', 'Baru')`,
          [
            noRawat,
            portalUser.no_rkm_medis,
            kd_dokter,
            kd_poli,
            tgl_registrasi,
            now.toTimeString().slice(0, 8),
            kd_pj || 'BPJ',
          ]
        )

        return ok({ no_rawat: noRawat }, 'Pendaftaran berhasil')
      } catch {
        // FK constraint or DB error — don't leak internal details
        set.status = 201
        return fail('Pendaftaran gagal, pastikan dokter dan poli yang dipilih valid', 201)
      }
    },
    {
      body: t.Object({
        kd_dokter: t.String({ minLength: 1 }),
        kd_poli: t.String({ minLength: 1 }),
        tgl_registrasi: t.String({ minLength: 1 }),
        kd_pj: t.Optional(t.String()),
      }),
    }
  )

  // ==================== CEK ANTRIAN ====================
  .get('/antrian/:no_rkm_medis', async ({ headers, params, set }) => {
    const userId = await verifyToken(headers.authorization)
    if (!userId) {
      set.status = 401
      return fail('Token tidak ditemukan', 401)
    }

    try {
      const rows = await db.query<any>(`
        SELECT no_rawat, tgl_registrasi, jam_reg, status_lanjut, kd_poli
        FROM reg_periksa
        WHERE no_rkm_medis = ?
        ORDER BY tgl_registrasi DESC, jam_reg DESC
        LIMIT 10
      `, [params.no_rkm_medis])

      return ok(rows)
    } catch {
      return ok([])
    }
  })
