-- =========================================================================
-- Scamora Platform - Master Database Schema (Full Relational / Supabase)
-- Version: 3.0.0 (Fully Connected Relational Architecture)
-- Description: Skema lengkap dan terintegrasi penuh untuk seluruh modul Scamora:
--   - Identity & Auth (admin_users, app_users)
--   - Threat Intelligence & Scanner (analysis_stats, analysis_history, scanned_domains, demo_presets)
--   - Knowledge Center & Taxonomy (scam_categories, knowledge_articles)
--   - Guardian Challenge AI Simulation (categories, scenarios, sessions, decisions, results, questions)
--   - Citizen Community & Moderation (channels, posts, reports, discussions, comments, votes, reputations, notifications)
--   - Observability & Admin Ops (admin_audit_logs, system_runtime_config, ai_token_logs)
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
    CREATE TYPE report_status_enum AS ENUM ('pending', 'reviewed', 'dismissed', 'action_taken', 'resolved');
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

DO $$ BEGIN
    CREATE TYPE community_discussion_status AS ENUM ('TERBUKA', 'TERJAWAB', 'DITUTUP');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. HELPER TRIGGER FUNCTION FOR AUTO UPDATED_AT
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- BAGIAN A: IDENTITAS & AKUN PENGGUNA (CENTRAL ENTITIES)
-- =========================================================================

-- 1. Administrator & Analis Keamanan
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

-- 2. Pengguna Publik & Warga Terverifikasi
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(150),
    google_id VARCHAR(100) UNIQUE,
    avatar_url TEXT,
    auth_provider VARCHAR(50) DEFAULT 'local',
    tier VARCHAR(50) DEFAULT 'guest',
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'active',
    scan_count INT DEFAULT 0,
    report_count INT DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2b. Otentikasi & Verifikasi OTP (Registrasi & Lupa Password)
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

-- =========================================================================
-- BAGIAN B: TAKSONOMI KEJAHATAN & PUSAT EDUKASI
-- =========================================================================

-- 3. Taksonomi Induk Kategori Modus Penipuan
CREATE TABLE IF NOT EXISTS scam_categories (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    risk_tier severity_level_enum NOT NULL DEFAULT 'TINGGI',
    icon_name VARCHAR(50) NOT NULL DEFAULT 'shield-alert',
    order_index SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Ensiklopedia & Artikel Panduan Edukasi
-- [RELASI]: category_code -> scam_categories(code)
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
-- BAGIAN C: PEMINDAI ANCAMAN & INTELIJEN SIBER
-- =========================================================================

-- 5. Metrik Agregasi Analisis Platform
CREATE TABLE IF NOT EXISTS analysis_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_type analysis_type_enum NOT NULL,
    risk_level risk_level_enum NOT NULL,
    risk_score SMALLINT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    scam_type VARCHAR(100) NOT NULL,
    indicators_count SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Histori Analisis URL & Pesan Percakapan
-- [RELASI]: user_id -> app_users(id) ON DELETE SET NULL
CREATE TABLE IF NOT EXISTS analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    guest_session_id VARCHAR(100),
    analysis_type analysis_type_enum NOT NULL,
    input_target TEXT NOT NULL,
    domain VARCHAR(255),
    ip_address VARCHAR(45),
    risk_score SMALLINT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level risk_level_enum NOT NULL,
    scam_category VARCHAR(100) NOT NULL,
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    analysis_time_ms INTEGER NOT NULL DEFAULT 0,
    status analysis_status_enum NOT NULL DEFAULT 'complete',
    indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_explanation TEXT,
    is_bookmarked BOOLEAN NOT NULL DEFAULT FALSE,
    privacy_consent BOOLEAN NOT NULL DEFAULT TRUE,
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Direktori Ancaman Domain Publik
CREATE TABLE IF NOT EXISTS scanned_domains (
    domain VARCHAR(255) PRIMARY KEY,
    check_count INTEGER NOT NULL DEFAULT 1,
    risk_score SMALLINT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_category risk_level_enum NOT NULL DEFAULT 'review',
    scam_category VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
    notes TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Presets Demo Homepage (Contoh Uji 1-Klik)
CREATE TABLE IF NOT EXISTS demo_presets (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('url', 'chat')),
    title VARCHAR(150) NOT NULL,
    subtitle VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    expected_category VARCHAR(50) NOT NULL,
    expected_score INT NOT NULL,
    scam_type VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- BAGIAN D: GUARDIAN CHALLENGE (BANK SOAL & SIMULASI AI PERCABANGAN)
-- =========================================================================

-- 9. Bank Soal Kuis Cepat Ketahanan Siber
-- [RELASI]: category_code -> scam_categories(code)
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

-- 10. Kategori Modul Skenario Simulasi
CREATE TABLE IF NOT EXISTS challenge_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0
);

-- 11. Skenario Percabangan Interaktif AI
-- [RELASI]: category_id -> challenge_categories(id)
CREATE TABLE IF NOT EXISTS challenge_scenarios (
    id VARCHAR(100) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL REFERENCES challenge_categories(id) ON DELETE CASCADE,
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

-- 12. Sesi Berjalan Permainan Simulasi
-- [RELASI]: scenario_id -> challenge_scenarios(id)
-- [RELASI]: user_id -> app_users(id) ON DELETE SET NULL
CREATE TABLE IF NOT EXISTS challenge_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id VARCHAR(100) NOT NULL REFERENCES challenge_scenarios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    guest_session_id VARCHAR(100),
    current_node_id VARCHAR(50) NOT NULL DEFAULT 'node_1',
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'abandoned')),
    history JSONB NOT NULL DEFAULT '[]'::jsonb,
    detected_red_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_score INT NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 13. Keputusan Pengguna di Tiap Simpul Percabangan
-- [RELASI]: session_id -> challenge_sessions(id)
CREATE TABLE IF NOT EXISTS challenge_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES challenge_sessions(id) ON DELETE CASCADE,
    node_id VARCHAR(50) NOT NULL,
    chosen_option_id VARCHAR(50) NOT NULL,
    is_safe_choice BOOLEAN NOT NULL,
    red_flag_identified BOOLEAN DEFAULT FALSE,
    response_time_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 14. Lembar Hasil Akhir & Evaluasi Simulasi
-- [RELASI]: session_id -> challenge_sessions(id)
-- [RELASI]: scenario_id -> challenge_scenarios(id)
-- [RELASI]: user_id -> app_users(id) ON DELETE SET NULL
CREATE TABLE IF NOT EXISTS challenge_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES challenge_sessions(id) ON DELETE CASCADE UNIQUE,
    scenario_id VARCHAR(100) NOT NULL REFERENCES challenge_scenarios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    safety_rating VARCHAR(30) NOT NULL,
    red_flags_detected_count INT NOT NULL,
    red_flags_total_count INT NOT NULL,
    feedback_summary TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- BAGIAN E: FORUM KOMUNITAS WARGA & MODERASI KONTEN
-- =========================================================================

-- 15. Saluran Percakapan Realtime Komunitas
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

-- 16. Pesan Chat Realtime di Saluran
-- [RELASI]: channel_id -> community_channels(id)
-- [RELASI]: user_id -> app_users(id) ON DELETE SET NULL
-- [RELASI]: reply_to_id -> community_messages(id) (Self-referencing FK)
CREATE TABLE IF NOT EXISTS community_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id VARCHAR(50) NOT NULL REFERENCES community_channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
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

-- 17. Cerita / Artikel Pengalaman Warga
-- [RELASI]: author_id -> app_users(id) ON DELETE SET NULL
CREATE TABLE IF NOT EXISTS community_posts (
    id VARCHAR(50) PRIMARY KEY,
    author_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
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

-- 18. Laporan Pelanggaran Postingan Warga
-- [RELASI]: post_id -> community_posts(id)
-- [RELASI]: reporter_id -> app_users(id) ON DELETE SET NULL
CREATE TABLE IF NOT EXISTS post_reports (
    id VARCHAR(50) PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    reporter_name VARCHAR(100) NOT NULL,
    report_reason VARCHAR(100) NOT NULL,
    details TEXT,
    status report_status_enum NOT NULL DEFAULT 'pending',
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. Utas Laporan & Diskusi Tanya Jawab Warga
-- [RELASI]: user_id -> app_users(id) ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS community_discussions (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    author_name VARCHAR(150) NOT NULL,
    author_badge VARCHAR(50) NOT NULL DEFAULT 'Warga Waspada',
    avatar_color VARCHAR(30) DEFAULT '#143826',
    category VARCHAR(50) NOT NULL DEFAULT 'tanya-jawab-warga',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    evidence_snippet TEXT,
    evidence_image_url TEXT,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    status community_discussion_status NOT NULL DEFAULT 'TERBUKA',
    best_solution_comment_id VARCHAR(50),
    helpful_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 20. Komentar & Tanggapan Berulir (Threaded / Nested Replies)
-- [RELASI]: discussion_id -> community_discussions(id)
-- [RELASI]: user_id -> app_users(id) ON DELETE CASCADE
-- [RELASI]: parent_id -> community_comments(id) (Self-referencing FK)
CREATE TABLE IF NOT EXISTS community_comments (
    id VARCHAR(50) PRIMARY KEY,
    discussion_id VARCHAR(50) NOT NULL REFERENCES community_discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    parent_id VARCHAR(50) REFERENCES community_comments(id) ON DELETE CASCADE,
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

-- Relasi Tambahan: Kunci Solusi Terbaik Diskusi ke Komentar Terkait
DO $$ BEGIN
    ALTER TABLE community_discussions
    ADD CONSTRAINT fk_discussions_best_solution
    FOREIGN KEY (best_solution_comment_id) REFERENCES community_comments(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 21. Upvote / Dukungan Warga (Mencegah Duplikasi Vote)
-- [RELASI]: user_id -> app_users(id) ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS community_votes (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_vote UNIQUE (user_id, target_type, target_id)
);

-- 22. Buku Induk Reputasi & Badge Relawan
-- [RELASI]: user_id -> app_users(id) ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS community_reputations (
    user_id UUID PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
    reputation_points INTEGER NOT NULL DEFAULT 0,
    badge VARCHAR(50) NOT NULL DEFAULT 'Warga Waspada',
    is_verified_volunteer BOOLEAN NOT NULL DEFAULT FALSE,
    helpful_solutions_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 23. Log Riwayat Perolehan Poin Relawan
-- [RELASI]: user_id -> community_reputations(user_id) ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS community_reputation_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES community_reputations(user_id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    points INTEGER NOT NULL,
    source_id VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 24. Laporan Moderasi Konten oleh Warga
-- [RELASI]: reporter_id -> app_users(id) ON DELETE CASCADE
-- [RELASI]: reviewed_by -> admin_users(id) ON DELETE SET NULL
CREATE TABLE IF NOT EXISTS community_moderation_reports (
    id VARCHAR(50) PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    reporter_name VARCHAR(100) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id VARCHAR(50) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    moderator_notes TEXT,
    reviewed_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 25. Pusat Notifikasi Interaktif Pengguna
-- [RELASI]: recipient_id -> app_users(id) ON DELETE CASCADE
-- [RELASI]: actor_id -> app_users(id) ON DELETE SET NULL
-- [RELASI]: discussion_id -> community_discussions(id) ON DELETE CASCADE
-- [RELASI]: comment_id -> community_comments(id) ON DELETE CASCADE
CREATE TABLE IF NOT EXISTS community_notifications (
    id VARCHAR(50) PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    actor_name VARCHAR(100),
    type VARCHAR(50) NOT NULL,
    discussion_id VARCHAR(50) REFERENCES community_discussions(id) ON DELETE CASCADE,
    comment_id VARCHAR(50) REFERENCES community_comments(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- BAGIAN F: AUDIT TRAIL, TELEMETRI & RUNTIME CONFIG
-- =========================================================================

-- 26. Log Audit Tindakan Administrator
-- [RELASI]: admin_id -> admin_users(id) ON DELETE SET NULL
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    actor VARCHAR(100) NOT NULL DEFAULT 'Super Administrator',
    action VARCHAR(100) NOT NULL,
    target VARCHAR(200) NOT NULL,
    severity audit_severity_enum NOT NULL DEFAULT 'info',
    details TEXT,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 27. Konfigurasi Operasional Mesin AI & Crawler
CREATE TABLE IF NOT EXISTS system_runtime_config (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    ai_provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
    gemini_model VARCHAR(100) NOT NULL DEFAULT 'gemini-3.5-flash-lite',
    temperature NUMERIC(3, 2) NOT NULL DEFAULT 0.10,
    max_tokens INTEGER NOT NULL DEFAULT 1024,
    crawler_timeout_ms INTEGER NOT NULL DEFAULT 4000,
    crawler_max_bytes_kb INTEGER NOT NULL DEFAULT 512,
    ssrf_protection BOOLEAN NOT NULL DEFAULT TRUE,
    user_agent VARCHAR(255) DEFAULT 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    detect_apk BOOLEAN DEFAULT TRUE,
    detect_forms BOOLEAN DEFAULT TRUE,
    allow_redirects BOOLEAN DEFAULT TRUE,
    credential_code VARCHAR(100) DEFAULT 'SCAMORA-SEC-CRED-8821',
    extra_config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 28. Telemetri Konsumsi Token AI
-- [RELASI]: user_id -> app_users(id) ON DELETE SET NULL
-- [RELASI]: admin_id -> admin_users(id) ON DELETE SET NULL
CREATE TABLE IF NOT EXISTS ai_token_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
    model VARCHAR(100) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    total_tokens INT NOT NULL DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- BAGIAN G: INDEKS PERFORMA & RELASIONAL QUERY
-- =========================================================================

-- Indeks Pengguna & Autentikasi
CREATE INDEX IF NOT EXISTS idx_app_users_username ON app_users(username);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_google_id ON app_users(google_id) WHERE google_id IS NOT NULL;

-- Indeks Analisis & Riwayat
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_domain ON analysis_history(domain);
CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON analysis_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scanned_domains_risk ON scanned_domains(risk_category, risk_score DESC);

-- Indeks Guardian Challenge
CREATE INDEX IF NOT EXISTS idx_challenge_sessions_user ON challenge_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_sessions_scenario ON challenge_sessions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_challenge_decisions_session ON challenge_decisions(session_id);
CREATE INDEX IF NOT EXISTS idx_challenge_results_user ON challenge_results(user_id);

-- Indeks Forum Komunitas & Komentar
CREATE INDEX IF NOT EXISTS idx_community_discussions_user ON community_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_community_discussions_cat_status ON community_discussions(category, status);
CREATE INDEX IF NOT EXISTS idx_community_comments_discussion ON community_comments(discussion_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user ON community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent ON community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_votes_target ON community_votes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_community_reputations_points ON community_reputations(reputation_points DESC);
CREATE INDEX IF NOT EXISTS idx_community_notifications_recipient ON community_notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_community_messages_channel ON community_messages(channel_id, created_at DESC);

-- Indeks Audit & Telemetri
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_token_logs_created ON ai_token_logs(created_at DESC);

-- =========================================================================
-- BAGIAN H: OTOMASI TRIGGER (UPDATE TIMESTAMP)
-- =========================================================================
DROP TRIGGER IF EXISTS trg_app_users_updated_at ON app_users;
CREATE TRIGGER trg_app_users_updated_at
BEFORE UPDATE ON app_users
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS trg_knowledge_articles_updated_at ON knowledge_articles;
CREATE TRIGGER trg_knowledge_articles_updated_at
BEFORE UPDATE ON knowledge_articles
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS trg_analysis_history_updated_at ON analysis_history;
CREATE TRIGGER trg_analysis_history_updated_at
BEFORE UPDATE ON analysis_history
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS trg_community_discussions_updated_at ON community_discussions;
CREATE TRIGGER trg_community_discussions_updated_at
BEFORE UPDATE ON community_discussions
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS trg_community_comments_updated_at ON community_comments;
CREATE TRIGGER trg_community_comments_updated_at
BEFORE UPDATE ON community_comments
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- =========================================================================
-- BAGIAN I: DATA AWAL / INITIAL SEED DATA
-- =========================================================================

-- 1. Akun Admin Awal
INSERT INTO admin_users (id, username, password_hash, name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin', '$2b$10$N0BYxb9LYvfq1XiS0/RYLu2sVuWfvibjKtHQkYsLkkxkz3wB4lOHy', 'Super Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 2. Akun Pengguna Awal (Admin & Demo Warga)
INSERT INTO app_users (id, username, email, password_hash, full_name, tier, role, status) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'admin@scamora.id', '$2b$10$N0BYxb9LYvfq1XiS0/RYLu2sVuWfvibjKtHQkYsLkkxkz3wB4lOHy', 'Super Administrator', 'verified', 'admin', 'active'),
('a0000000-0000-0000-0000-000000000001', 'warga_budi', 'budi@scamora.id', '$2b$10$N0BYxb9LYvfq1XiS0/RYLu2sVuWfvibjKtHQkYsLkkxkz3wB4lOHy', 'Budi Santoso', 'verified', 'user', 'active'),
('a0000000-0000-0000-0000-000000000002', 'relawan_siti', 'siti@scamora.id', '$2b$10$N0BYxb9LYvfq1XiS0/RYLu2sVuWfvibjKtHQkYsLkkxkz3wB4lOHy', 'Siti Rahmawati', 'verified', 'user', 'active')
ON CONFLICT (username) DO NOTHING;

-- 3. Taksonomi Kategori Kejahatan Siber
INSERT INTO scam_categories (id, code, name, description, risk_tier, icon_name, order_index) VALUES
('cat_phishing', 'phishing', 'Phishing & Rekayasa Web', 'Pencurian kredensial akun, perbankan, dan data pribadi melalui situs tiruan.', 'KRITIS', 'globe', 1),
('cat_apk', 'apk_malware', 'Malware Android (.APK)', 'Penyebaran file aplikasi berbahaya bermodus undangan atau resi untuk menyedot OTP.', 'KRITIS', 'smartphone', 2),
('cat_job', 'job_scam', 'Lowongan Kerja Fiktif', 'Penipuan tugas paruh waktu berbayar, freelance bodong, dan pemerasan uang muka.', 'TINGGI', 'briefcase', 3),
('cat_investasi', 'fake_investment', 'Investasi Bodong & Pinjol Ilegal', 'Janji imbal hasil tidak realistis dan jeratan pinjaman online tanpa izin OJK.', 'KRITIS', 'trending-up', 4),
('cat_soceng', 'social_engineering', 'Social Engineering (Vishing/Catfishing)', 'Manipulasi psikologis menebar panik atau asmara untuk transfer dana ke rekening penipu.', 'TINGGI', 'user-x', 5)
ON CONFLICT (code) DO NOTHING;

-- 4. Saluran Komunitas Awal
INSERT INTO community_channels (id, name, title, description, icon, sort_order) VALUES
('umum', 'diskusi-umum', 'Diskusi Umum & Tanya Jawab', 'Ruang berbagi pengalaman dan pertanyaan seputar keamanan digital sehari-hari.', 'message-square', 1),
('phishing', 'lapor-phishing', 'Waspada Phishing & Link Bank', 'Bahas temuan website tiruan perbankan, e-commerce, dan pencurian OTP.', 'globe', 2),
('apk', 'waspada-apk', 'Teror File APK & Resi Kurir', 'Diskusi penanganan ponsel terinfeksi virus undangan pernikahan atau tilang palsu.', 'smartphone', 3),
('loker', 'lowongan-bodong', 'Info Loker Bodong & Freelance', 'Klarifikasi tawaran kerja mencurigakan via Telegram, WhatsApp, atau medsos.', 'briefcase', 4)
ON CONFLICT (id) DO NOTHING;

-- 5. Kategori Simulasi Tantangan
INSERT INTO challenge_categories (id, name, description, icon, sort_order) VALUES
('phishing', 'Phishing & Rekayasa Web', 'Deteksi situs tiruan dan manipulasi form kredensial', 'globe', 1),
('social_engineering', 'Social Engineering (Vishing/Chat)', 'Kenali manipulasi emosional, urgensi, dan ancaman palsu', 'phone-call', 2),
('malware_apk', 'Malware Android (.APK)', 'Tangkal file berbahaya berkedok surat tilang atau resi kurir', 'smartphone', 3),
('task_scam', 'Job Scam & Freelance Palsu', 'Pilah tawaran kerja resmi vs skema deposit uang muka', 'briefcase', 4)
ON CONFLICT (id) DO NOTHING;

-- 6. Konfigurasi Sistem Default
INSERT INTO system_runtime_config (id, ai_provider, gemini_model, temperature, max_tokens)
VALUES ('default', 'gemini', 'gemini-3.5-flash-lite', 0.10, 1024)
ON CONFLICT (id) DO NOTHING;

-- 7. Domain Contoh Publik
INSERT INTO scanned_domains (domain, check_count, risk_score, risk_category, scam_category, notes, is_verified) VALUES
('bank-nusa-login.xyz', 37, 92, 'high', 'Phishing Perbankan', 'Typosquatting dan form pencurian m-Banking', TRUE),
('undian-hadiah-id.top', 54, 88, 'high', 'Undian Palsu', 'Domain gratisan mengklaim hadiah puluhan juta', TRUE),
('undangan-nikah-digital.top', 42, 95, 'high', 'Malware .APK', 'Menyebarkan file malware pencuri SMS OTP', TRUE),
('tilang-online-bayar.click', 29, 85, 'high', 'Surat Tilang Palsu', 'Pencurian kredensial berkedok denda tilang', TRUE),
('tokopedia.com', 128, 0, 'low', 'E-Commerce Resmi', 'Domain terverifikasi & sertifikat SSL resmi', TRUE)
ON CONFLICT (domain) DO NOTHING;

-- 8. Presets Demo Masukan
INSERT INTO demo_presets (id, type, title, subtitle, content, expected_category, expected_score, scam_type, tags) VALUES
('url-bank-phishing', 'url', 'Phishing BCA Internet Banking', 'Typosquatting & Subdomain Masking', 'http://bca-klik.com.secure-login-update.xyz/login?verifikasi=true&token=rahasia123', 'high', 95, 'phishing', ARRAY['Bank', 'Typosquatting', 'HTTP']),
('url-legit-store', 'url', 'Toko Online Resmi Indonesia', 'Domain Terverifikasi & HTTPS Resmi', 'https://tokopedia.com/promo/guncang-sepatu-sneakers', 'low', 0, 'unknown', ARRAY['E-Commerce', 'HTTPS', 'Aman']),
('url-shortener-redirect', 'url', 'URL Shortener Mencurigakan', 'Tautan Pendek Tanpa Transparansi Tujuan', 'https://bit.ly/undian-bca-resmi-hadiah2026', 'review', 45, 'phishing', ARRAY['Shortener', 'Unverified']),
('chat-job-freelance', 'chat', 'Lowongan Kerja Like/Follow Bodong', 'Komisi Fantastis + Biaya Pendaftaran Awal', 'Halo kak! Kami dari Talent Agency Shopee Indonesia. Ada tugas part-time online cuma like & subscribe video YouTube, komisi 500rb - 2jt per hari. Kerja fleksibel dari rumah. Tapi sebelum mulai, ada biaya deposit jaminan aktivasi sistem Rp 150.000 ke rekening bendahara kami ya. Cepat kak slot tinggal 2 orang!', 'high', 85, 'job_scam', ARRAY['Lowongan', 'Uang Muka', 'Desakan']),
('chat-customer-service-resmi', 'chat', 'Pesan Konfirmasi CS Standar', 'Komunikasi Ramah Tanpa Permintaan Data Rahasia', 'Halo Kak Budi, terima kasih telah berbelanja di Toko Sejahtera. Pesanan #88291 sedang dikemas oleh tim gudang kami dan akan diserahkan ke kurir sore ini. Resi pengiriman akan terupdate otomatis di aplikasi Anda. Ada yang bisa kami bantu lagi?', 'low', 0, 'unknown', ARRAY['CS Resmi', 'Normal', 'No PII'])
ON CONFLICT (id) DO NOTHING;
