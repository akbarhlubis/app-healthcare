import mysql2 from 'mysql2/promise'
import { env } from './config/env'

const pool = mysql2.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_DATABASE,
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  // latin1 preserved — required by the legacy SIMRS `sik` database
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
