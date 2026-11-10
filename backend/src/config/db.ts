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
      ssl: env.DATABASE_URL.includes('sslmode=require') ||
        env.DATABASE_URL.includes('supabase') ||
        env.DATABASE_URL.includes('pooler') ||
        env.DATABASE_URL.includes('aws-') ||
        env.NODE_ENV === 'production'
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

      CREATE TABLE IF NOT EXISTS app_users (
          id VARCHAR(50) PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE,
          password_hash VARCHAR(255),
          full_name VARCHAR(150) NOT NULL,
          tier VARCHAR(20) NOT NULL DEFAULT 'verified',
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          scan_count INTEGER NOT NULL DEFAULT 0,
          report_count INTEGER NOT NULL DEFAULT 0,
          last_active_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
          created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );

      ALTER TABLE app_users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100);
      ALTER TABLE app_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE app_users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';
      CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_google_id ON app_users(google_id) WHERE google_id IS NOT NULL;

      CREATE TABLE IF NOT EXISTS auth_otps (
          id VARCHAR(50) PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp_hash VARCHAR(255) NOT NULL,
          purpose VARCHAR(50) NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          attempt_count INTEGER NOT NULL DEFAULT 0,
          is_used BOOLEAN NOT NULL DEFAULT FALSE,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );
      CREATE INDEX IF NOT EXISTS idx_auth_otps_email_purpose ON auth_otps(email, purpose);
      CREATE INDEX IF NOT EXISTS idx_auth_otps_created ON auth_otps(created_at DESC);

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

      DO $$ BEGIN
          CREATE TYPE community_discussion_status AS ENUM ('TERBUKA', 'TERJAWAB', 'DITUTUP');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      CREATE TABLE IF NOT EXISTS community_discussions (
          id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL,
          author_name VARCHAR(150) NOT NULL,
          author_badge VARCHAR(50) NOT NULL DEFAULT 'Warga Waspada',
          avatar_color VARCHAR(30) DEFAULT '#143826',
          category VARCHAR(50) NOT NULL DEFAULT 'tanya-jawab-warga',
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          evidence_snippet TEXT,
          evidence_image_url TEXT,
          is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
          status VARCHAR(20) NOT NULL DEFAULT 'TERBUKA',
          best_solution_comment_id VARCHAR(50),
          helpful_count INTEGER NOT NULL DEFAULT 0,
          comment_count INTEGER NOT NULL DEFAULT 0,
          is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
          is_locked BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );

      CREATE TABLE IF NOT EXISTS community_comments (
          id VARCHAR(50) PRIMARY KEY,
          discussion_id VARCHAR(50) NOT NULL,
          user_id VARCHAR(50) NOT NULL,
          parent_id VARCHAR(50),
          author_name VARCHAR(150) NOT NULL,
          author_badge VARCHAR(50) NOT NULL DEFAULT 'Warga Waspada',
          avatar_color VARCHAR(30) DEFAULT '#143826',
          content TEXT NOT NULL,
          evidence_image_url TEXT,
          is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
          is_best_solution BOOLEAN NOT NULL DEFAULT FALSE,
          helpful_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );

      CREATE TABLE IF NOT EXISTS community_votes (
          id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL,
          target_type VARCHAR(20) NOT NULL,
          target_id VARCHAR(50) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
          CONSTRAINT unique_user_vote UNIQUE (user_id, target_type, target_id)
      );

      CREATE TABLE IF NOT EXISTS community_reputations (
          user_id VARCHAR(50) PRIMARY KEY,
          reputation_points INTEGER NOT NULL DEFAULT 0,
          badge VARCHAR(50) NOT NULL DEFAULT 'Warga Waspada',
          is_verified_volunteer BOOLEAN NOT NULL DEFAULT FALSE,
          helpful_solutions_count INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );

      CREATE TABLE IF NOT EXISTS community_reputation_logs (
          id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL,
          action VARCHAR(50) NOT NULL,
          points INTEGER NOT NULL,
          source_id VARCHAR(50),
          created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );

      CREATE TABLE IF NOT EXISTS community_moderation_reports (
          id VARCHAR(50) PRIMARY KEY,
          reporter_id VARCHAR(50) NOT NULL,
          reporter_name VARCHAR(100) NOT NULL,
          target_type VARCHAR(20) NOT NULL,
          target_id VARCHAR(50) NOT NULL,
          reason VARCHAR(100) NOT NULL,
          notes TEXT,
          status VARCHAR(20) NOT NULL DEFAULT 'pending',
          moderator_notes TEXT,
          reviewed_by VARCHAR(50),
          reviewed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );

      CREATE TABLE IF NOT EXISTS community_notifications (
          id VARCHAR(50) PRIMARY KEY,
          recipient_id VARCHAR(50) NOT NULL,
          actor_id VARCHAR(50),
          actor_name VARCHAR(100),
          type VARCHAR(50) NOT NULL,
          discussion_id VARCHAR(50),
          comment_id VARCHAR(50),
          message TEXT NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
      );
    `);
  } catch (err: any) {
    console.warn('[DB] Schema init warning:', err.message);
  }
}

export function isDbConnected(): boolean {
  return pool !== null;
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
    const res = await pool.query<T>(text, params);
    isConnected = true;
    return res;
  } catch (error: any) {
    console.error(`[DB Error] Query failed: ${text.slice(0, 80)}... Error: ${error.message}`);
    throw error;
  }
}
