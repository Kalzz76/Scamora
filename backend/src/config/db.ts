import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

let pool: Pool | null = null;
let isConnected = false;

if (env.DATABASE_URL && env.DATABASE_URL.trim().length > 0) {
  try {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: env.DATABASE_URL.includes('sslmode=require') || env.DATABASE_URL.includes('supabase.co')
        ? { rejectUnauthorized: false }
        : false,
    });

    pool.on('error', (err) => {
      console.error('[DB] PostgreSQL pool background error:', err.message);
    });

    // Test connection asynchronously
    pool.query('SELECT NOW()')
      .then((res) => {
        isConnected = true;
        console.log(`[DB] Berhasil terhubung ke database PostgreSQL! Waktu DB: ${res.rows[0].now}`);
      })
      .catch((err) => {
        isConnected = false;
        console.warn(`[DB] Database belum dapat diakses via DATABASE_URL (${err.message}). Menggunakan penyimpanan fallback.`);
      });
  } catch (err: any) {
    console.warn(`[DB] Gagal menginisialisasi PostgreSQL pool: ${err.message}`);
    pool = null;
  }
} else {
  console.log('[DB] DATABASE_URL belum diatur di .env. Backend beroperasi dengan in-memory/seed data mode.');
}

export function isDbConnected(): boolean {
  return isConnected && pool !== null;
}

export function getDbPool(): Pool | null {
  return pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T> | null> {
  if (!pool) return null;
  try {
    return await pool.query<T>(text, params);
  } catch (error: any) {
    console.error(`[DB Error] Query failed: ${text.slice(0, 80)}... Error: ${error.message}`);
    throw error;
  }
}
