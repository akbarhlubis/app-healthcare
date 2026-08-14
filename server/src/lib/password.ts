import bcrypt from 'bcryptjs'

/**
 * Runtime-neutral password hashing (bcryptjs = pure JS, works on Node & Bun).
 * bcryptjs verifies existing $2a$/$2b$ (Bun) and $2y$ (Laravel) hashes, so
 * stored passwords keep working without re-hashing.
 */
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
