import crypto from 'crypto'
import { db } from '../db'

/**
 * Generate a random token like Laravel's Str::random(60).
 */
function generateToken(length = 60): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length)
}

/**
 * Verify token by looking it up directly in uxui_portal_tokens.
 * Laravel stores RAW tokens, no hashing.
 * Returns user_id or null. Also checks 24-hour expiry.
 */
async function verifyToken(authHeader?: string): Promise<number | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)

  const row = await db.first<any>(
    'SELECT id, user_id, created_at FROM uxui_portal_tokens WHERE token = ?',
    [token]
  )
  if (!row) return null

  // Check 24-hour expiry
  if (row.created_at) {
    const created = new Date(row.created_at)
    const hours = (Date.now() - created.getTime()) / (1000 * 60 * 60)
    if (hours > 24) {
      await db.execute('DELETE FROM uxui_portal_tokens WHERE id = ?', [row.id])
      return null
    }
  }

  return row.user_id as number
}

/**
 * Get raw token from auth header (for session is_current comparison).
 */
function getTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

/**
 * Helper: "success" API response.
 */
function ok<T>(data: T, message = 'Berhasil') {
  return {
    metaData: { status: 'success', kode: 200, message },
    response: data,
  }
}

/**
 * Helper: "error" API response.
 */
function fail(message: string, kode = 201) {
  return {
    metaData: { status: 'error', kode, message },
    response: null,
  }
}

export { generateToken, verifyToken, getTokenFromHeader, ok, fail }
