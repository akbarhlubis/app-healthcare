import mysql2 from 'mysql2/promise'

const pool = mysql2.createPool({
  host: Bun.env.DB_HOST || '127.0.0.1',
  port: Number(Bun.env.DB_PORT) || 3306,
  database: Bun.env.DB_DATABASE || 'sik',
  user: Bun.env.DB_USERNAME || 'root',
  password: Bun.env.DB_PASSWORD || '',
  charset: 'latin1',
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export const db = {
  query: async <T>(sql: string, params?: unknown[]): Promise<T[]> => {
    const [rows] = await pool.query(sql, params)
    return rows as T[]
  },
  first: async <T>(sql: string, params?: unknown[]): Promise<T | null> => {
    const rows = await db.query<T>(sql, params)
    return rows.length > 0 ? rows[0] : null
  },
  execute: async (sql: string, params?: unknown[]): Promise<mysql2.ResultSetHeader> => {
    const [result] = await pool.execute(sql, params)
    return result as mysql2.ResultSetHeader
  },
}
