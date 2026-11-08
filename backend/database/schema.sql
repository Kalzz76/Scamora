-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom Types
DO $$ BEGIN
    CREATE TYPE analysis_type_enum AS ENUM ('url', 'chat');
    CREATE TYPE risk_level_enum AS ENUM ('high', 'review', 'low');
    CREATE TYPE analysis_status_enum AS ENUM ('complete', 'partial', 'failed');
    CREATE TYPE severity_level_enum AS ENUM ('KRITIS', 'TINGGI', 'SEDANG', 'RENDAH');
    CREATE TYPE user_role_enum AS ENUM ('user', 'moderator', 'admin');
    CREATE TYPE post_status_enum AS ENUM ('published', 'hidden', 'under_review');
    CREATE TYPE comment_status_enum AS ENUM ('published', 'hidden');
    CREATE TYPE report_reason_enum AS ENUM ('pii_leak', 'spam', 'unfounded_accusation', 'harassment', 'other');
    CREATE TYPE report_status_enum AS ENUM ('pending', 'reviewed', 'dismissed', 'action_taken');
    CREATE TYPE moderation_target_enum AS ENUM ('post', 'comment', 'user');
    CREATE TYPE moderation_action_enum AS ENUM ('hide', 'publish', 'dismiss_report', 'ban_user', 'unban_user');
    CREATE TYPE quiz_difficulty_enum AS ENUM ('easy', 'medium', 'hard');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Helper Functions
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. P0: MVP Core
CREATE TABLE IF NOT EXISTS demo_examples (
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

CREATE TABLE IF NOT EXISTS analysis_stats (
    id BIGSERIAL PRIMARY KEY,
    analysis_type analysis_type_enum NOT NULL,
    risk_level risk_level_enum NOT NULL,
    risk_score SMALLINT NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    scam_type VARCHAR(50) NOT NULL DEFAULT 'unknown',
    analysis_status analysis_status_enum NOT NULL,
    indicators_count SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. P1: Education, Checklist & Quiz
CREATE TABLE IF NOT EXISTS scam_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'shield-alert',
    severity_default severity_level_enum NOT NULL DEFAULT 'TINGGI',
    order_index SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES scam_categories(id) ON DELETE SET NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity severity_level_enum NOT NULL,
    severity_color VARCHAR(50) DEFAULT 'text-rose-600',
    target_victim VARCHAR(255),
    channel VARCHAR(150),
    summary TEXT NOT NULL,
    tactics JSONB NOT NULL DEFAULT '[]'::jsonb,
    prevention JSONB NOT NULL DEFAULT '[]'::jsonb,
    diagram_type VARCHAR(50),
    link_type VARCHAR(20) DEFAULT 'chat' CHECK (link_type IN ('chat', 'url', 'panduan')),
    order_index SMALLINT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'all',
    title VARCHAR(255),
    description TEXT NOT NULL,
    order_index SMALLINT NOT NULL DEFAULT 0,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS challenge_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES scam_categories(id) ON DELETE SET NULL,
    scenario TEXT NOT NULL,
    question TEXT NOT NULL,
    difficulty quiz_difficulty_enum NOT NULL DEFAULT 'medium',
    order_index SMALLINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS challenge_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES challenge_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    explanation_reason TEXT NOT NULL,
    order_index SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. P2: Community & Moderation
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    pseudonym VARCHAR(100) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'user',
    avatar_url TEXT,
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES scam_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    chronology TEXT NOT NULL,
    red_flags TEXT NOT NULL,
    lessons_learned TEXT NOT NULL,
    status post_status_enum NOT NULL DEFAULT 'under_review',
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    status comment_status_enum NOT NULL DEFAULT 'published',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS post_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_reason report_reason_enum NOT NULL,
    details TEXT,
    status report_status_enum NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type moderation_target_enum NOT NULL,
    target_id UUID NOT NULL,
    action moderation_action_enum NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS challenge_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score SMALLINT NOT NULL,
    total_questions SMALLINT NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_demo_examples_type ON demo_examples (type);
CREATE INDEX IF NOT EXISTS idx_demo_examples_tags ON demo_examples USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_analysis_stats_date ON analysis_stats (created_at);
CREATE INDEX IF NOT EXISTS idx_scam_categories_slug ON scam_categories (slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_category ON knowledge_articles (category_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_tactics ON knowledge_articles USING gin (tactics);
CREATE INDEX IF NOT EXISTS idx_checklist_items_cat ON checklist_items (category, order_index);
CREATE INDEX IF NOT EXISTS idx_challenge_options_q ON challenge_options (question_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments (post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports (status);
CREATE INDEX IF NOT EXISTS idx_analysis_history_user ON analysis_history (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_history_expiry ON analysis_history (expires_at);

-- Triggers
CREATE OR REPLACE TRIGGER set_timestamp_demo_examples BEFORE UPDATE ON demo_examples FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE OR REPLACE TRIGGER set_timestamp_scam_categories BEFORE UPDATE ON scam_categories FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE OR REPLACE TRIGGER set_timestamp_knowledge_articles BEFORE UPDATE ON knowledge_articles FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE OR REPLACE TRIGGER set_timestamp_challenge_questions BEFORE UPDATE ON challenge_questions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE OR REPLACE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE OR REPLACE TRIGGER set_timestamp_community_posts BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE OR REPLACE TRIGGER set_timestamp_community_comments BEFORE UPDATE ON community_comments FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Row Level Security (RLS)
ALTER TABLE demo_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Policies: Public Read
CREATE POLICY "Public read demo examples" ON demo_examples FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read scam categories" ON scam_categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read knowledge articles" ON knowledge_articles FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read checklist items" ON checklist_items FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read challenge questions" ON challenge_questions FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read challenge options" ON challenge_options FOR SELECT USING (TRUE);
CREATE POLICY "Public read published posts" ON community_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read published comments" ON community_comments FOR SELECT USING (status = 'published');
CREATE POLICY "Public read users pseudonym" ON users FOR SELECT USING (TRUE);

-- Policies: Authenticated Users
CREATE POLICY "Users update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users create posts" ON community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users edit own posts" ON community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status != 'hidden');
CREATE POLICY "Users add comments" ON community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON community_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users submit report" ON post_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_user_id);
CREATE POLICY "Users manage own challenge attempts" ON challenge_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own analysis history" ON analysis_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies: Moderator & Admin
CREATE POLICY "Moderators view reports" ON post_reports FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('moderator', 'admin')));
CREATE POLICY "Moderators update reports" ON post_reports FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('moderator', 'admin')));
CREATE POLICY "Moderators manage posts" ON community_posts FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('moderator', 'admin')));
CREATE POLICY "Moderators view audit logs" ON moderation_logs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('moderator', 'admin')));
CREATE POLICY "Moderators insert audit logs" ON moderation_logs FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('moderator', 'admin')));
CREATE POLICY "Admins full stats access" ON analysis_stats FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Seed Data: P0 Demo Examples
INSERT INTO demo_examples (id, type, title, subtitle, content, expected_category, expected_score, scam_type, tags)
VALUES
('url-bank-phishing', 'url', 'Phishing BCA Internet Banking', 'Typosquatting & Subdomain Masking', 'http://bca-klik.com.secure-login-update.xyz/login?verifikasi=true&token=rahasia123', 'high', 95, 'phishing', ARRAY['Bank', 'Typosquatting', 'HTTP']),
('url-legit-store', 'url', 'Toko Online Resmi Indonesia', 'Domain Terverifikasi & HTTPS Resmi', 'https://tokopedia.com/promo/guncang-sepatu-sneakers', 'low', 0, 'unknown', ARRAY['E-Commerce', 'HTTPS', 'Aman']),
('url-shortener-redirect', 'url', 'URL Shortener Mencurigakan', 'Tautan Pendek Tanpa Transparansi Tujuan', 'https://bit.ly/undian-bca-resmi-hadiah2026', 'review', 45, 'phishing', ARRAY['Shortener', 'Unverified']),
('chat-job-freelance', 'chat', 'Lowongan Kerja Like/Follow Bodong', 'Komisi Fantastis + Biaya Pendaftaran Awal', 'Halo kak! Kami dari Talent Agency Shopee Indonesia. Ada tugas part-time online cuma like & subscribe video YouTube, komisi 500rb - 2jt per hari. Kerja fleksibel dari rumah. Tapi sebelum mulai, ada biaya deposit jaminan aktivasi sistem Rp 150.000 ke rekening bendahara kami ya. Cepat kak slot tinggal 2 orang!', 'high', 85, 'job_scam', ARRAY['Lowongan', 'Uang Muka', 'Desakan']),
('chat-customer-service-resmi', 'chat', 'Pesan Konfirmasi CS Standar', 'Komunikasi Ramah Tanpa Permintaan Data Rahasia', 'Halo Kak Budi, terima kasih telah berbelanja di Toko Sejahtera. Pesanan #88291 sedang dikemas oleh tim gudang kami dan akan diserahkan ke kurir sore ini. Resi pengiriman akan terupdate otomatis di aplikasi Anda. Ada yang bisa kami bantu lagi?', 'low', 0, 'unknown', ARRAY['CS Resmi', 'Normal', 'No PII'])
ON CONFLICT (id) DO NOTHING;

-- Seed Data: P1 Categories
INSERT INTO scam_categories (slug, name, description, icon_name, severity_default, order_index)
VALUES
('phishing', 'Phishing & Tautan Palsu', 'Pencurian kredensial akun, perbankan, dan data pribadi melalui situs tiruan.', 'globe', 'KRITIS', 1),
('job-scam', 'Lowongan Kerja Palsu (Task Scam)', 'Tawaran pekerjaan paruh waktu mudah bergaji fantastis dengan syarat deposit uang muka.', 'briefcase', 'TINGGI', 2),
('apk-malware', 'Malware Android (.APK)', 'Penyebaran file aplikasi berbahaya bermodus undangan, resi paket, atau surat tilang untuk menyedot SMS OTP.', 'smartphone', 'KRITIS', 3),
('banking-fraud', 'Rekayasa Sosial Perbankan (Vishing/OTP)', 'Oknum mengaku pegawai bank yang mendesak korban menyebutkan kode OTP atau PIN.', 'phone-call', 'KRITIS', 4),
('giveaway-scam', 'Undian & Hadiah Palsu', 'Klaim hadiah bernilai puluhan juta dengan syarat mentransfer biaya pajak atau administrasi.', 'gift', 'SEDANG', 5),
('investment-scam', 'Investasi Bodong', 'Penawaran keuntungan modal instan tanpa risiko melalui grup Telegram atau aplikasi investasi ilegal.', 'trending-up', 'TINGGI', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed Data: P1 Checklists
INSERT INTO checklist_items (code, category, title, description, order_index, is_mandatory)
VALUES
('c1', 'all', 'Verifikasi Identitas Pengirim', 'Periksa alamat pengirim (bukan nomor acak atau email domain gratisan seperti @gmail.com jika mengaku instansi resmi).', 1, TRUE),
('c2', 'domain', 'Pemeriksaan Ejaan Domain', 'Periksa ejaan nama merek/domain (waspadai typosquatting seperti bca-klik.xyz bukan klikbca.com).', 2, TRUE),
('c3', 'general', 'Tolak Transfer Uang Muka', 'Jangan pernah mentransfer uang dengan alasan biaya administrasi, deposit, atau jaminan pekerjaan.', 3, TRUE),
('c4', 'all', 'Rahasiakan Kunci Keamanan OTP & PIN', 'Jangan pernah memberikan kode OTP, PIN, atau kata sandi kepada siapa pun, termasuk pihak yang mengaku petugas resmi.', 4, TRUE),
('c5', 'apk', 'Tolak Instalasi Berkas .APK', 'Jangan menginstal file berkas biner berekstensi .APK yang dikirim melalui WhatsApp atau media sosial.', 5, TRUE),
('c6', 'lapor', 'Verifikasi Kanal Resmi', 'Lakukan verifikasi silang (cross-check) melalui nomor telepon resmi atau kanal media sosial bercentang biru.', 6, TRUE)
ON CONFLICT (code) DO NOTHING;
