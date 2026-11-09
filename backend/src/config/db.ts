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
      .then(async (res) => {
        isConnected = true;
        console.log(`[DB] Berhasil terhubung ke database PostgreSQL! Waktu DB: ${res.rows[0].now}`);
        await initDatabaseTables();
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

async function initDatabaseTables(): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(`
      ALTER TABLE system_runtime_config ADD COLUMN IF NOT EXISTS user_agent VARCHAR(255) DEFAULT 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      ALTER TABLE system_runtime_config ADD COLUMN IF NOT EXISTS detect_apk BOOLEAN DEFAULT TRUE;
      ALTER TABLE system_runtime_config ADD COLUMN IF NOT EXISTS detect_forms BOOLEAN DEFAULT TRUE;
      ALTER TABLE system_runtime_config ADD COLUMN IF NOT EXISTS allow_redirects BOOLEAN DEFAULT TRUE;
      ALTER TABLE system_runtime_config ADD COLUMN IF NOT EXISTS credential_code VARCHAR(100) DEFAULT 'SCAMORA-SEC-CRED-8821';
      ALTER TABLE system_runtime_config ADD COLUMN IF NOT EXISTS extra_config JSONB DEFAULT '{}'::jsonb;

      CREATE TABLE IF NOT EXISTS ai_token_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
          model VARCHAR(100) NOT NULL,
          feature VARCHAR(50) NOT NULL,
          prompt_tokens INT NOT NULL DEFAULT 0,
          completion_tokens INT NOT NULL DEFAULT 0,
          total_tokens INT NOT NULL DEFAULT 0,
          latency_ms INT NOT NULL DEFAULT 0,
          status VARCHAR(20) NOT NULL DEFAULT 'success',
          created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );
      CREATE INDEX IF NOT EXISTS idx_ai_token_logs_created ON ai_token_logs(created_at DESC);
    `);
  } catch (err: any) {
    console.warn('[DB] Schema init warning:', err.message);
  }
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
