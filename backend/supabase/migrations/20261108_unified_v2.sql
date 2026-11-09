-- =========================================================================
-- Scamora Database Migration: 20261108_unified_v2.sql
-- Description: Penyelarasan Schema Database untuk Fitur-Fitur Terbaru:
--   1. Direktori Domain Terperiksa (Scanned Domains & Public Threat Intelligence)
--   2. Forum Komunitas Interaktif Berbasis Kanal (Community Channels & Messages)
--   3. Simulasi Kasus Interaktif Guardian Challenge (Decision Trees & Results)
--   4. Log Audit Keamanan Admin & Konfigurasi Sistem Runtime
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPE ENUM TAMBAHAN
DO $$ BEGIN
    CREATE TYPE channel_badge_enum AS ENUM ('Warga Waspada', 'Relawan Komunitas', 'Korban Melapor', 'Anonim', 'Admin Scamora');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE message_type_enum AS ENUM ('question', 'answer', 'warning', 'general');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE audit_severity_enum AS ENUM ('info', 'warning', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =========================================================================
-- TABEL BARU 1: DIREKTORI DOMAIN & PEMINDAIAN PUBLIK (scanned_domains)
-- Digunakan oleh: ReportPage.tsx & directoryService.ts
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

CREATE INDEX IF NOT EXISTS idx_scanned_domains_name ON scanned_domains (domain);
CREATE INDEX IF NOT EXISTS idx_scanned_domains_category ON scanned_domains (risk_category, check_count DESC);
CREATE INDEX IF NOT EXISTS idx_scanned_domains_last_checked ON scanned_domains (last_checked_at DESC);

-- =========================================================================
-- TABEL BARU 2: KANAL & PESAN FORUM KOMUNITAS (community_channels & messages)
-- Digunakan oleh: KomunitasPage.tsx (Forum Diskusi & Verifikasi Solusi Warga)
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

CREATE INDEX IF NOT EXISTS idx_comm_messages_channel ON community_messages (channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comm_messages_reply ON community_messages (reply_to_id);

-- =========================================================================
-- TABEL BARU 3: GUARDIAN CHALLENGE (AI SIMULASI PERCABANGAN)
-- Digunakan oleh: challenge.controller.ts, challengeService & QuizManagerPage
-- =========================================================================
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

CREATE INDEX IF NOT EXISTS idx_sessions_user ON challenge_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_results_user ON challenge_results(user_id, completed_at DESC);

-- =========================================================================
-- TABEL BARU 4: LOG AUDIT ADMIN & PENGATURAN RUNTIME SISTEM
-- Digunakan oleh: AuditLogsPage.tsx, AiEngineConfigPage.tsx & adminService.ts
-- =========================================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor VARCHAR(100) NOT NULL DEFAULT 'Super Administrator',
    action VARCHAR(100) NOT NULL,
    target VARCHAR(200) NOT NULL,
    severity audit_severity_enum NOT NULL DEFAULT 'info',
    details TEXT,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_severity ON admin_audit_logs (severity, created_at DESC);

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

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE scanned_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_runtime_config ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read scanned domains" ON scanned_domains FOR SELECT USING (TRUE);
CREATE POLICY "Public insert scanned domains" ON scanned_domains FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public read community channels" ON community_channels FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read community messages" ON community_messages FOR SELECT USING (is_flagged = FALSE);
CREATE POLICY "Public insert community messages" ON community_messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public read challenge categories" ON challenge_categories FOR SELECT USING (TRUE);
CREATE POLICY "Public read challenge scenarios" ON challenge_scenarios FOR SELECT USING (TRUE);

-- =========================================================================
-- SEED DATA AWAL: KANAL KOMUNITAS & KATEGORI TANTANGAN
-- =========================================================================
INSERT INTO community_channels (id, name, title, description, icon, sort_order) VALUES
('umum', 'diskusi-umum', 'Diskusi Umum & Tanya Jawab', 'Ruang berbagi pengalaman dan pertanyaan seputar keamanan digital sehari-hari.', 'message-square', 1),
('phishing', 'lapor-phishing', 'Waspada Phishing & Link Bank', 'Bahas temuan website tiruan perbankan, e-commerce, dan pencurian OTP.', 'globe', 2),
('apk', 'malware-apk', 'Teror File .APK Undangan/Paket', 'Laporkan dan diskusikan modus aplikasi berbahaya yang dikirim via WhatsApp.', 'smartphone', 3),
('job-scam', 'loker-freelance-bodong', 'Loker Like & Subscribe Bodong', 'Bedah modus pekerjaan sampingan dengan deposit awal komisi palsu.', 'briefcase', 4),
('investasi', 'investasi-bodong', 'Investasi Bodong & Robot Trading', 'Edukasi dan diskusi bahaya skema ponzi, kripto ilegal, dan robot trading.', 'trending-up', 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO challenge_categories (id, name, description, icon, sort_order) VALUES
('phishing', 'Phishing & Rekayasa Web', 'Deteksi situs tiruan dan manipulasi form kredensial', 'globe', 1),
('social_engineering', 'Social Engineering (Vishing/Chat)', 'Kenali manipulasi emosional, urgensi, dan ancaman palsu', 'phone-call', 2),
('malware_apk', 'Malware Android (.APK)', 'Tangkal file berbahaya berkedok surat tilang atau resi kurir', 'smartphone', 3),
('task_scam', 'Job Scam & Freelance Palsu', 'Pilah tawaran kerja resmi vs skema deposit uang muka', 'briefcase', 4)
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_runtime_config (id, ai_provider, gemini_model, temperature, max_tokens) VALUES
('default', 'gemini', 'gemini-3.5-flash-lite', 0.10, 1024)
ON CONFLICT (id) DO NOTHING;

