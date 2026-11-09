-- =========================================================================
-- Scamora Platform - Master Database Schema (PostgreSQL & Supabase Compatible)
-- Version: 2.1.0
-- Description: Skema lengkap untuk seluruh fitur Scamora:
--   - Analisis URL & Chat (Realtime & Histori)
--   - Direktori Ancaman Domain Publik (Scanned Domains)
--   - Modul Admin Command Center (Telemetry, Audit Logs, Settings, Presets)
--   - Pusat Pengetahuan & Taksonomi Modus Kejahatan
--   - Bank Soal & Simulasi Percabangan Guardian Challenge
--   - Forum Diskusi & Moderasi Komunitas Warga
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM ENUM TYPES
DO $$ BEGIN
    CREATE TYPE analysis_type_enum AS ENUM ('url', 'chat');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE risk_level_enum AS ENUM ('high', 'review', 'low');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE analysis_status_enum AS ENUM ('complete', 'partial', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE severity_level_enum AS ENUM ('KRITIS', 'TINGGI', 'SEDANG', 'RENDAH');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('user', 'moderator', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE post_status_enum AS ENUM ('published', 'hidden', 'under_review');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE comment_status_enum AS ENUM ('published', 'hidden');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE report_reason_enum AS ENUM ('pii_leak', 'spam', 'unfounded_accusation', 'harassment', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE report_status_enum AS ENUM ('pending', 'reviewed', 'dismissed', 'action_taken');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE moderation_target_enum AS ENUM ('post', 'comment', 'user', 'message');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE moderation_action_enum AS ENUM ('hide', 'publish', 'dismiss_report', 'ban_user', 'unban_user');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE quiz_difficulty_enum AS ENUM ('easy', 'medium', 'hard');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE channel_badge_enum AS ENUM ('Warga Waspada', 'Relawan Komunitas', 'Korban Melapor', 'Anonim', 'Admin Scamora');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE message_type_enum AS ENUM ('question', 'answer', 'warning', 'general');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE audit_severity_enum AS ENUM ('info', 'warning', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. HELPER TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- BAGIAN A: AUTENTIKASI & PETUGAS ADMIN
-- =========================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tabel Pengguna Platform (Guest & Verified)
CREATE TABLE IF NOT EXISTS app_users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(150) NOT NULL,
    tier VARCHAR(20) NOT NULL DEFAULT 'guest' CHECK (tier IN ('guest', 'verified')),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    scan_count INTEGER NOT NULL DEFAULT 0,
    report_count INTEGER NOT NULL DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_app_users_tier ON app_users(tier);
CREATE INDEX IF NOT EXISTS idx_app_users_status ON app_users(status);
CREATE INDEX IF NOT EXISTS idx_app_users_username ON app_users(username);

-- =========================================================================
-- BAGIAN B: ANALISIS KEAMANAN & TELEMETRI SCAN
-- =========================================================================
CREATE TABLE IF NOT EXISTS analysis_stats (
    id BIGSERIAL PRIMARY KEY,
    analysis_type analysis_type_enum NOT NULL,
    risk_level risk_level_enum NOT NULL,
    risk_score SMALLINT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    scam_type VARCHAR(50) NOT NULL DEFAULT 'unknown',
    analysis_status analysis_status_enum NOT NULL DEFAULT 'complete',
    indicators_count SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100),
    analysis_type analysis_type_enum NOT NULL,
    input_hash VARCHAR(64) NOT NULL,
    sanitized_summary VARCHAR(255) NOT NULL,
    risk_level risk_level_enum NOT NULL,
    risk_score SMALLINT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    scam_type VARCHAR(50) NOT NULL DEFAULT 'unknown',
    indicators_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- BAGIAN C: DIREKTORI ANCAMAN DOMAIN PUBLIK (scanned_domains)
-- =========================================================================
CREATE TABLE IF NOT EXISTS scanned_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) UNIQUE NOT NULL,
    check_count INTEGER NOT NULL DEFAULT 1,
    risk_score SMALLINT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_category VARCHAR(20) NOT NULL CHECK (risk_category IN ('high', 'review', 'low')),
    scam_category VARCHAR(100) DEFAULT 'Phishing & Penipuan',
    notes TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- BAGIAN D: TAKSONOMI PENIPUAN & PUSAT PENGETAHUAN
-- =========================================================================
CREATE TABLE IF NOT EXISTS scam_categories (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    risk_tier severity_level_enum NOT NULL DEFAULT 'TINGGI',
    icon_name VARCHAR(50) DEFAULT 'shield-alert',
    order_index SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS knowledge_articles (
    id VARCHAR(50) PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL REFERENCES scam_categories(code) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    risk_level severity_level_enum NOT NULL DEFAULT 'TINGGI',
    target_victim VARCHAR(255),
    incident_channel VARCHAR(150),
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    red_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    mitigation_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    author VARCHAR(100) DEFAULT 'Tim Riset Keamanan Scamora',
    read_count INTEGER NOT NULL DEFAULT 0,
    order_index SMALLINT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- BAGIAN E: GUARDIAN CHALLENGE (BANK SOAL & SIMULASI AI PERCABANGAN)
-- =========================================================================
CREATE TABLE IF NOT EXISTS challenge_questions (
    id VARCHAR(50) PRIMARY KEY,
    category_code VARCHAR(50) NOT NULL REFERENCES scam_categories(code) ON DELETE CASCADE,
    scenario TEXT NOT NULL,
    question TEXT NOT NULL,
    difficulty quiz_difficulty_enum NOT NULL DEFAULT 'medium',
    evidence_snippet TEXT,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_option_id VARCHAR(50) NOT NULL,
    explanation TEXT NOT NULL,
    points SMALLINT NOT NULL DEFAULT 20,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    order_index SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS challenge_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS challenge_scenarios (
    id VARCHAR(100) PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES challenge_categories(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    character_name VARCHAR(100) NOT NULL,
    character_avatar VARCHAR(255),
    character_role VARCHAR(100),
    initial_dialogue JSONB NOT NULL,
    decision_nodes JSONB NOT NULL,
    red_flags JSONB NOT NULL,
    learning_points JSONB NOT NULL,
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS challenge_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    scenario_id VARCHAR(100) REFERENCES challenge_scenarios(id) ON DELETE CASCADE,
    current_node_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS challenge_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES challenge_sessions(id) ON DELETE CASCADE,
    node_id VARCHAR(50) NOT NULL,
    chosen_option_id VARCHAR(50) NOT NULL,
    is_safe_choice BOOLEAN NOT NULL,
    red_flag_identified BOOLEAN DEFAULT FALSE,
    response_time_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS challenge_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES challenge_sessions(id) ON DELETE CASCADE UNIQUE,
    user_id VARCHAR(100) NOT NULL,
    scenario_id VARCHAR(100) NOT NULL,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    safety_rating VARCHAR(30) NOT NULL,
    red_flags_detected_count INT NOT NULL,
    red_flags_total_count INT NOT NULL,
    feedback_summary TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- BAGIAN F: FORUM KOMUNITAS & MODERASI KONTEN
-- =========================================================================
CREATE TABLE IF NOT EXISTS community_channels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'message-square',
    sort_order SMALLINT DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS community_posts (
    id VARCHAR(50) PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    author_badge VARCHAR(50) DEFAULT 'Warga Waspada',
    title VARCHAR(255) NOT NULL,
    chronology TEXT NOT NULL,
    red_flags TEXT NOT NULL,
    lessons_learned TEXT NOT NULL,
    loss_amount_est VARCHAR(100),
    incident_date VARCHAR(50),
    category VARCHAR(50) DEFAULT 'phishing',
    status post_status_enum NOT NULL DEFAULT 'published',
    likes_count INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS community_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id VARCHAR(50) NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_badge channel_badge_enum NOT NULL DEFAULT 'Warga Waspada',
    avatar_color VARCHAR(30) DEFAULT '#334257',
    message_type message_type_enum NOT NULL DEFAULT 'general',
    content TEXT NOT NULL,
    evidence_snippet TEXT,
    reply_to_id UUID REFERENCES community_messages(id) ON DELETE SET NULL,
    helpful_count INTEGER NOT NULL DEFAULT 0,
    is_verified_solution BOOLEAN NOT NULL DEFAULT FALSE,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS post_reports (
    id VARCHAR(50) PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    reporter_name VARCHAR(100) NOT NULL,
    report_reason VARCHAR(100) NOT NULL,
    details TEXT,
    status report_status_enum NOT NULL DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- BAGIAN G: AUDIT LOG & KONFIGURASI RUNTIME ADMIN
-- =========================================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    actor VARCHAR(100) NOT NULL DEFAULT 'Super Administrator',
    action VARCHAR(100) NOT NULL,
    target VARCHAR(200) NOT NULL,
    severity audit_severity_enum NOT NULL DEFAULT 'info',
    details TEXT,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS system_runtime_config (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    ai_provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
    gemini_model VARCHAR(100) NOT NULL DEFAULT 'gemini-3.5-flash-lite',
    temperature NUMERIC(3, 2) NOT NULL DEFAULT 0.10,
    max_tokens INTEGER NOT NULL DEFAULT 1024,
    crawler_timeout_ms INTEGER NOT NULL DEFAULT 4000,
    crawler_max_bytes_kb INTEGER NOT NULL DEFAULT 512,
    ssrf_protection BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS demo_presets (
    id VARCHAR(100) PRIMARY KEY,
    type analysis_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    content TEXT NOT NULL,
    expected_category risk_level_enum NOT NULL,
    expected_score SMALLINT NOT NULL CHECK (expected_score >= 0 AND expected_score <= 100),
    scam_type VARCHAR(50) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- INDEXES UNTUK PERFORMA TINGGI
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_scanned_domains_name ON scanned_domains (domain);
CREATE INDEX IF NOT EXISTS idx_scanned_domains_category ON scanned_domains (risk_category, check_count DESC);
CREATE INDEX IF NOT EXISTS idx_scanned_domains_last_checked ON scanned_domains (last_checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles (category_code);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_slug ON knowledge_articles (slug);
CREATE INDEX IF NOT EXISTS idx_challenge_questions_cat ON challenge_questions (category_code);
CREATE INDEX IF NOT EXISTS idx_comm_messages_channel ON community_messages (channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_posts_status ON community_posts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports (status);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_severity ON admin_audit_logs (severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON challenge_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_results_user ON challenge_results(user_id, completed_at DESC);

-- =========================================================================
-- SEED DATA AWAL: KREDENSIAL, KANAL, KATEGORI, ARTIKEL & SOAL
-- =========================================================================

-- 1. Admin Akun Default (admin / admin123)
INSERT INTO admin_users (username, password_hash, name, role)
VALUES ('admin', 'admin123', 'Super Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 2. Kategori Ancaman
INSERT INTO scam_categories (id, code, name, description, risk_tier, icon_name, order_index) VALUES
('cat_phishing', 'phishing', 'Phishing & Rekayasa Web', 'Pencurian kredensial akun, perbankan, dan data pribadi melalui situs tiruan.', 'KRITIS', 'globe', 1),
('cat_apk', 'apk_malware', 'Malware Android (.APK)', 'Penyebaran file aplikasi berbahaya bermodus undangan atau resi untuk menyedot OTP.', 'KRITIS', 'smartphone', 2),
('cat_banking', 'banking_fraud', 'Rekayasa Sosial Perbankan (Vishing/OTP)', 'Oknum mengaku pegawai bank yang mendesak korban menyebutkan kode OTP atau PIN.', 'KRITIS', 'phone-call', 3),
('cat_job', 'job_scam', 'Lowongan Kerja Palsu (Task Scam)', 'Tawaran pekerjaan paruh waktu mudah dengan syarat deposit uang muka.', 'TINGGI', 'briefcase', 4),
('cat_giveaway', 'giveaway_scam', 'Undian & Hadiah Palsu', 'Klaim hadiah bernilai puluhan juta dengan syarat mentransfer biaya pajak fiktif.', 'SEDANG', 'gift', 5),
('cat_invest', 'investment_scam', 'Investasi Bodong', 'Penawaran keuntungan modal instan tanpa risiko melalui grup Telegram atau robot trading.', 'TINGGI', 'trending-up', 6)
ON CONFLICT (code) DO NOTHING;

-- 3. Kanal Komunitas
INSERT INTO community_channels (id, name, title, description, icon, sort_order) VALUES
('umum', 'diskusi-umum', 'Diskusi Umum & Tanya Jawab', 'Ruang berbagi pengalaman dan pertanyaan seputar keamanan digital sehari-hari.', 'message-square', 1),
('phishing', 'lapor-phishing', 'Waspada Phishing & Link Bank', 'Bahas temuan website tiruan perbankan, e-commerce, dan pencurian OTP.', 'globe', 2),
('apk', 'malware-apk', 'Teror File .APK Undangan/Paket', 'Laporkan dan diskusikan modus aplikasi berbahaya yang dikirim via WhatsApp.', 'smartphone', 3),
('job-scam', 'loker-freelance-bodong', 'Loker Like & Subscribe Bodong', 'Bedah modus pekerjaan sampingan dengan deposit awal komisi palsu.', 'briefcase', 4),
('investasi', 'investasi-bodong', 'Investasi Bodong & Robot Trading', 'Edukasi dan diskusi bahaya skema ponzi, kripto ilegal, dan robot trading.', 'trending-up', 5)
ON CONFLICT (id) DO NOTHING;

-- 4. Kategori Simulasi Tantangan
INSERT INTO challenge_categories (id, name, description, icon, sort_order) VALUES
('phishing', 'Phishing & Rekayasa Web', 'Deteksi situs tiruan dan manipulasi form kredensial', 'globe', 1),
('social_engineering', 'Social Engineering (Vishing/Chat)', 'Kenali manipulasi emosional, urgensi, dan ancaman palsu', 'phone-call', 2),
('malware_apk', 'Malware Android (.APK)', 'Tangkal file berbahaya berkedok surat tilang atau resi kurir', 'smartphone', 3),
('task_scam', 'Job Scam & Freelance Palsu', 'Pilah tawaran kerja resmi vs skema deposit uang muka', 'briefcase', 4)
ON CONFLICT (id) DO NOTHING;

-- 5. Konfigurasi Sistem Default
INSERT INTO system_runtime_config (id, ai_provider, gemini_model, temperature, max_tokens)
VALUES ('default', 'gemini', 'gemini-3.5-flash-lite', 0.10, 1024)
ON CONFLICT (id) DO NOTHING;

-- 6. Domain Contoh Publik
INSERT INTO scanned_domains (domain, check_count, risk_score, risk_category, scam_category, notes, is_verified) VALUES
('bank-nusa-login.xyz', 37, 92, 'high', 'Phishing Perbankan', 'Typosquatting dan form pencurian m-Banking', TRUE),
('undian-hadiah-id.top', 54, 88, 'high', 'Undian Palsu', 'Domain gratisan mengklaim hadiah puluhan juta', TRUE),
('undangan-nikah-digital.top', 42, 95, 'high', 'Malware .APK', 'Menyebarkan file malware pencuri SMS OTP', TRUE),
('tilang-online-bayar.click', 29, 85, 'high', 'Surat Tilang Palsu', 'Pencurian kredensial berkedok denda tilang', TRUE),
('tokopedia.com', 128, 0, 'low', 'E-Commerce Resmi', 'Domain terverifikasi & sertifikat SSL resmi', TRUE)
ON CONFLICT (domain) DO NOTHING;

-- 7. Presets Demo Masukan
INSERT INTO demo_presets (id, type, title, subtitle, content, expected_category, expected_score, scam_type, tags) VALUES
('url-bank-phishing', 'url', 'Phishing BCA Internet Banking', 'Typosquatting & Subdomain Masking', 'http://bca-klik.com.secure-login-update.xyz/login?verifikasi=true&token=rahasia123', 'high', 95, 'phishing', ARRAY['Bank', 'Typosquatting', 'HTTP']),
('url-legit-store', 'url', 'Toko Online Resmi Indonesia', 'Domain Terverifikasi & HTTPS Resmi', 'https://tokopedia.com/promo/guncang-sepatu-sneakers', 'low', 0, 'unknown', ARRAY['E-Commerce', 'HTTPS', 'Aman']),
('url-shortener-redirect', 'url', 'URL Shortener Mencurigakan', 'Tautan Pendek Tanpa Transparansi Tujuan', 'https://bit.ly/undian-bca-resmi-hadiah2026', 'review', 45, 'phishing', ARRAY['Shortener', 'Unverified']),
('chat-job-freelance', 'chat', 'Lowongan Kerja Like/Follow Bodong', 'Komisi Fantastis + Biaya Pendaftaran Awal', 'Halo kak! Kami dari Talent Agency Shopee Indonesia. Ada tugas part-time online cuma like & subscribe video YouTube, komisi 500rb - 2jt per hari. Kerja fleksibel dari rumah. Tapi sebelum mulai, ada biaya deposit jaminan aktivasi sistem Rp 150.000 ke rekening bendahara kami ya. Cepat kak slot tinggal 2 orang!', 'high', 85, 'job_scam', ARRAY['Lowongan', 'Uang Muka', 'Desakan']),
('chat-customer-service-resmi', 'chat', 'Pesan Konfirmasi CS Standar', 'Komunikasi Ramah Tanpa Permintaan Data Rahasia', 'Halo Kak Budi, terima kasih telah berbelanja di Toko Sejahtera. Pesanan #88291 sedang dikemas oleh tim gudang kami dan akan diserahkan ke kurir sore ini. Resi pengiriman akan terupdate otomatis di aplikasi Anda. Ada yang bisa kami bantu lagi?', 'low', 0, 'unknown', ARRAY['CS Resmi', 'Normal', 'No PII'])
ON CONFLICT (id) DO NOTHING;
