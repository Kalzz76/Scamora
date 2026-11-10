import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';
import { SEED_SCENARIOS } from '../data/seedScenarios';

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

    // Inisialisasi artikel edukasi ke knowledge_articles jika masih kosong
    const artCount = await pool.query('SELECT COUNT(*) FROM knowledge_articles');
    if (artCount && parseInt(artCount.rows[0].count, 10) === 0) {
      console.log('[DB] Menginisialisasi artikel edukasi asli ke tabel knowledge_articles...');
      await pool.query(`
        INSERT INTO knowledge_articles (
          id, category_code, title, slug, risk_level, target_victim, incident_channel, summary, content, red_flags, mitigation_steps, author, read_count, order_index, is_published, created_at, updated_at
        ) VALUES
        (
          'art-apk-malware-01',
          'apk_malware',
          'Anatomi Modus Undangan Pernikahan & Resi Kurir .APK Pencuri Saldo Rekening',
          'anatomi-modus-undangan-resi-apk-pencuri-saldo',
          'KRITIS',
          'Pengguna smartphone Android, nasabah m-banking',
          'WhatsApp, Telegram, SMS',
          'Bagaimana file APK mengeksploitasi izin Accessibility Service di Android untuk membaca SMS dan kode OTP perbankan secara diam-diam.',
          'Modus ini memanfaatkan rekayasa sosial rasa penasaran korban. Pelaku mengirimkan file biner Android (.apk) berkedok surat undangan nikah digital, foto resi pengiriman kurir J&T/SiCepat/Shopee Xpress, surat tilang ETLE, atau tagihan PLN. Ketika korban mengklik dan menginstal berkas, aplikasi meminta izin berbahaya seperti Accessibility Service, Read SMS, dan Receive SMS. Dengan izin tersebut, trojan dapat meneruskan seluruh SMS kode otorisasi (OTP) perbankan ke bot Telegram pelaku tanpa sepengetahuan korban.',
          '["Pesan dikirim dari nomor tak dikenal mengatasnamakan kerabat jauh atau kurir paket", "Ekstensi berkas berupa .apk bukan .pdf, dokumen, atau tautan resmi ekspedisi", "Aplikasi meminta izin Accessibility Service dan Notifikasi saat dibuka", "Ikon aplikasi menyerupai logo ekspedisi terpercaya atau logo surat undangan"]'::jsonb,
          '["Segera aktifkan Airplane Mode (Mode Pesawat) untuk memutus transmisi data", "Copot aplikasi dari Pengaturan -> Aplikasi -> Cari aplikasi terkait -> Uninstall", "Ganti seluruh PIN dan kata sandi m-banking dari perangkat lain yang aman", "Hubungi call center resmi bank untuk memblokir sementara rekening dan kartu debit"]'::jsonb,
          'Tim Riset Keamanan Siber Scamora',
          1420,
          1,
          true,
          NOW(),
          NOW()
        ),
        (
          'art-job-scam-02',
          'job_scam',
          'Jebakan Komisi Fantastis Kerja Like & Subscribe YouTube / Review E-Commerce',
          'jebakan-komisi-fantastis-like-subscribe-youtube',
          'TINGGI',
          'Pencari kerja sampingan, ibu rumah tangga, mahasiswa, fresh graduate',
          'WhatsApp, Telegram, Instagram DM',
          'Skema Ponzi dan rekayasa sosial yang memancing korban dengan komisi awal kecil, kemudian mengunci dana jutaan rupiah dengan dalih deposit tugas.',
          'Pelaku menghubungi korban menawarkan pekerjaan paruh waktu online yang sangat mudah, seperti like video YouTube, follow akun TikTok, atau review hotel di Google Maps dengan iming-iming bayaran Rp 50.000 hingga Rp 2.000.000 per hari. Pada tugas pertama, komisi kecil (misal Rp 20.000 - Rp 50.000) benar-benar ditransfer ke rekening korban untuk membangun rasa percaya. Setelah itu, korban diundang ke grup Telegram tugas VIP dan diwajibkan menyetor uang deposit jaminan puluhan juta. Ketika korban ingin menarik uang, pelaku mengunci dana dengan dalih salah transfer atau penalti sistem.',
          '["Tawaran komisi fantastis Rp 500.000 - Rp 2.000.000 per hari hanya untuk pekerjaan sangat mudah", "Komunikasi dipindahkan ke grup Telegram dengan banyak akun anonim yang pamer bukti transfer palsu", "Diminta mentransfer deposit uang jaminan untuk membuka level tugas lebih tinggi atau mencairkan saldo"]'::jsonb,
          '["Hentikan seluruh transfer tambahan sekarang juga meskipun diancam dana hangus", "Kumpulkan tangkapan layar bukti transfer, rekaman chat, dan nomor rekening pelaku", "Laporkan nomor rekening ke cekrekening.id dan aduankonten.id", "Buat laporan kepolisian (LP) ke kantor polisi terdekat untuk pengajuan blokir rekening bank pelaku"]'::jsonb,
          'Tim Riset Keamanan Siber Scamora',
          980,
          2,
          true,
          NOW(),
          NOW()
        ),
        (
          'art-phishing-03',
          'phishing',
          'Waspada Phishing Perbankan: Trik Subdomain Spoofing & Form Kredensial Palsu',
          'waspada-phishing-perbankan-subdomain-spoofing',
          'KRITIS',
          'Nasabah mobile & internet banking, pengguna marketplace',
          'SMS Blasting, Email, Iklan Media Sosial Bersponsor',
          'Metode penipuan menggunakan situs web tiruan yang memalsukan tampilan resmi bank atau e-commerce demi merampas username, password, dan OTP.',
          'Phishing merupakan teknik rekayasa sosial tertua namun tetap mematikan. Pelaku membuat website tiruan yang 99% mirip halaman login internet banking asli. Mereka menggunakan teknik subdomain spoofing (contoh: bca.klik-login-verifikasi.xyz) atau typosquatting untuk mengelabui mata korban. Melalui form palsu tersebut, pelaku menyedot nomor kartu ATM, masa berlaku, kode CVV 3 angka, hingga kode OTP SMS yang baru saja dikirimkan oleh bank.',
          '["URL domain tidak resmi (misal bca.klik-login-verifikasi.xyz bukan klikbca.com)", "Situs mendesak pengisian nomor kartu ATM, CVV, masa berlaku, dan 6 digit PIN secara bersamaan", "Pesan disertai ancaman pemblokiran akun otomatis jika tidak konfirmasi dalam 10-30 menit"]'::jsonb,
          '["Jangan pernah memasukkan PIN, CVV, atau kode OTP ke dalam tautan web apapun", "Tutup peramban dan verifikasi keaslian pesan melalui aplikasi perbankan resmi atau call center", "Jika terlanjur mengisi, segera login ke aplikasi resmi dan ganti PIN atau hubungi bank untuk pemblokiran darurat"]'::jsonb,
          'Tim Riset Keamanan Siber Scamora',
          1850,
          3,
          true,
          NOW(),
          NOW()
        ),
        (
          'art-banking-vishing-04',
          'banking_fraud',
          'Modus Telepon Pegawai Bank Bodong & Perubahan Tarif Transfer Rp 150.000',
          'modus-telepon-pegawai-bank-bodong-tarif-transfer',
          'KRITIS',
          'Masyarakat umum, nasabah perbankan, lanjut usia',
          'Panggilan Telepon (VoIP/Seluler), Voice Call WhatsApp',
          'Pelaku menelepon dengan mengaku sebagai customer care bank, mengabarkan perubahan tarif transaksi sepihak, dan meminta kode verifikasi pembatalan.',
          'Vishing (voice phishing) memanfaatkan otoritas palsu dan kepanikan finansial. Pelaku menelepon mengaku dari Bank BNI, Mandiri, BRI, atau BCA, menyatakan bahwa ada surat edaran kenaikan biaya transaksi otomatis Rp 150.000 per bulan. Korban yang menolak kenaikan tarif diarahkan untuk membatalkan pendaftaran. Pelaku kemudian meminta korban membacakan kode OTP yang masuk ke ponsel atau menekan nomor token tertentu.',
          '["Penelpon mengaku pihak bank menggunakan nomor seluler biasa atau nomor WhatsApp dengan foto profil bank", "Mendesak korban untuk membatalkan kenaikan biaya bulanan dengan mengisi link atau membacakan OTP", "Menciptakan kepanikan dengan menyatakan saldo akan terpotong otomatis tiap bulan"]'::jsonb,
          '["Ingat prinsip utama: Pihak bank TIDAK PERNAH meminta kode OTP, PIN, atau 3 angka CVV di belakang kartu", "Segera putus sambungan telepon saat penelpon mulai meminta data sensitif", "Konfirmasi ke call center resmi bank bersangkutan melalui nomor hotline resmi terverifikasi"]'::jsonb,
          'Tim Riset Keamanan Siber Scamora',
          1310,
          4,
          true,
          NOW(),
          NOW()
        ),
        (
          'art-giveaway-05',
          'giveaway_scam',
          'Penipuan Undian Berhadiah Mobil & Uang Tunai Catut Brand Terkenal',
          'penipuan-undian-berhadiah-catut-brand-terkenal',
          'SEDANG',
          'Pengguna media sosial, masyarakat umum',
          'SMS, WhatsApp, Komentar Media Sosial, Akun Tiruan',
          'Pengumuman pemenang undian palsu yang mewajibkan korban membayar pajak hadiah, biaya administrasi, atau ongkos kirim di awal.',
          'Pelaku mengirim SMS atau WhatsApp mengabarkan bahwa nomor ponsel Anda memenangkan hadiah ratusan juta rupiah atau mobil dari program Gebyar Undian BCA/Telkomsel/Shopee. Syarat untuk mencairkan hadiah adalah mentransfer biaya pajak pemenang 10% atau biaya administrasi pengiriman ke rekening pribadi bendahara undian. Setelah uang dikirim, pelaku langsung menghilang dan memblokir kontak korban.',
          '["Korban dinyatakan menang undian padahal tidak pernah mengikuti kompetisi atau kuis apapun", "Syarat pencairan hadiah mewajibkan transfer sejumlah uang muka (uang pajak fiktif)", "Pengumuman menggunakan domain gratisan atau link bit.ly / s.id tidak resmi"]'::jsonb,
          '["Abaikan dan blokir nomor pengirim pesan", "Periksa daftar pemenang di website atau akun media sosial resmi bercentang biru brand yang bersangkutan", "Pajak undian resmi dari perusahaan terpercaya tidak pernah diminta ditransfer ke rekening pribadi"]'::jsonb,
          'Tim Riset Keamanan Siber Scamora',
          760,
          5,
          true,
          NOW(),
          NOW()
        ),
        (
          'art-investment-06',
          'investment_scam',
          'Ciri-Ciri Investasi Bodong Berkedok Robot Trading & Titip Dana Tanpa Risiko',
          'ciri-ciri-investasi-bodong-robot-trading-titip-dana',
          'TINGGI',
          'Investor pemula, masyarakat yang tergiur keuntungan instan',
          'Grup Telegram, Forum Facebook, Iklan Influencer',
          'Skema money game yang menjanjikan keuntungan pasti tanpa risiko (guaranteed return) melalui platform trading ilegal tanpa izin OJK atau Bappebti.',
          'Investasi ilegal selalu menawarkan janji muluk: keuntungan 20% hingga 100% per bulan tanpa risiko rugi. Pelaku menggunakan kedok trading emas digital, kripto, forex dengan robot trading pintar, atau titip modal perkebunan. Uang investor baru dipakai untuk membayar profit investor lama (skema Ponzi). Begitu arus dana investor baru melambat, admin grup kabur (exit scam) dan website ditutup.',
          '["Janji keuntungan tetap harian atau bulanan tanpa ada risiko kerugian", "Perusahaan tidak terdaftar di OJK (Otoritas Jasa Keuangan) atau Bappebti", "Dana awal tidak bisa ditarik (WD) dan korban diminta menyetor biaya admin tambahan untuk membuka kunci penarikan"]'::jsonb,
          '["Cek legalitas entitas dan produk investasi melalui Kontak OJK 157 atau situs ojk.go.id", "Jangan pernah menyetorkan uang ke rekening atas nama pribadi perorangan untuk kegiatan investasi", "Tolak ajakan titip dana atau skema member get member dengan bonus berjenjang"]'::jsonb,
          'Tim Riset Keamanan Siber Scamora',
          1120,
          6,
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Inisialisasi kategori tantangan Guardian Challenge jika belum ada
    await pool.query(`
      INSERT INTO challenge_categories (id, name, description, icon, sort_order) VALUES
      ('kurir-apk', 'Modus Kurir Paket (.APK)', 'Simulasi pesan kurir paket palsu yang mengirimkan file .apk berbahaya berkedok foto resi pengiriman.', 'Package', 1),
      ('bank-phishing', 'Phishing CS Bank & Perubahan Tarif', 'Simulasi penipu mengaku petugas resmi bank mengancam kenaikan biaya bulanan atau meminta verifikasi OTP.', 'Landmark', 2),
      ('job-scam', 'Lowongan Kerja Like & Follow (Task Scam)', 'Tawaran komisi fantastis hanya dengan like video atau memberi rating Google Maps yang berujung permintaan deposit.', 'Briefcase', 3),
      ('tilang-etle', 'Surat Tilang ETLE Palsu', 'Pesan mengatasnamakan Kepolisian yang mengirimkan berkas surat tilang digital dengan format aplikasi berbahaya.', 'FileWarning', 4),
      ('undian-belanja', 'Undian Belanja & Biaya di Muka', 'Manipulasi euforia kemenangan hadiah ratusan juta dengan syarat transfer pajak pemenang ke rekening pribadi.', 'Gift', 5)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Tambah kolom is_ai_generated jika belum ada dan seed challenge_scenarios
    await pool.query(`
      ALTER TABLE challenge_scenarios ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;
    `);

    const scenCount = await pool.query('SELECT COUNT(*) FROM challenge_scenarios');
    if (scenCount && parseInt(scenCount.rows[0].count, 10) === 0) {
      console.log('[DB] Menginisialisasi skenario Guardian Challenge ke tabel challenge_scenarios...');
      for (const scen of SEED_SCENARIOS) {
        await pool.query(
          `INSERT INTO challenge_scenarios (
             id, category_id, title, difficulty, character_name, character_role, character_avatar,
             initial_dialogue, decision_nodes, red_flags, learning_points, is_ai_generated, created_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [
            scen.id,
            scen.categoryId,
            scen.title,
            scen.difficulty,
            scen.characterName,
            scen.characterRole || null,
            scen.characterAvatar || null,
            JSON.stringify(scen.initialDialogue),
            JSON.stringify(scen.decisionNodes),
            JSON.stringify(scen.redFlags),
            JSON.stringify(scen.learningPoints),
          ]
        );
      }
    }

    // Inisialisasi soal kuis Guardian Challenge ke challenge_questions jika masih kosong
    const qCount = await pool.query('SELECT COUNT(*) FROM challenge_questions');
    if (qCount && parseInt(qCount.rows[0].count, 10) === 0) {
      console.log('[DB] Menginisialisasi soal kuis asli ke tabel challenge_questions...');
      await pool.query(`
        INSERT INTO challenge_questions (
          id, category_code, scenario, question, difficulty, options, correct_option_id, explanation, points, is_active, order_index, created_at, updated_at
        ) VALUES
        (
          'quiz-apk-01',
          'apk_malware',
          'Anda menerima pesan WhatsApp dari nomor kurir paket: "Paket Anda tertahan di gudang, silakan cek resi pelacakan di berkas terlampir: Resi_Pelacakan_JNT.apk"',
          'Tindakan paling aman yang harus Anda ambil adalah:',
          'easy',
          '[
            {"id": "opt-1", "text": "Mengunduh dan memasang aplikasi untuk mengetahui nomor resi asli", "isCorrect": false},
            {"id": "opt-2", "text": "Meneruskan pesan ke keluarga untuk menanyakan apakah ada yang pesan paket", "isCorrect": false},
            {"id": "opt-3", "text": "Tidak membuka berkas .APK, hapus pesan, dan cek resi melalui website atau aplikasi resmi ekspedisi", "isCorrect": true},
            {"id": "opt-4", "text": "Membalas chat meminta foto fisik paket", "isCorrect": false}
          ]'::jsonb,
          'opt-3',
          'Kurir resmi ekspedisi tidak pernah mengirim berkas biner .apk. Berkas ini adalah trojan pencuri SMS OTP m-Banking.',
          20,
          true,
          1,
          NOW(),
          NOW()
        ),
        (
          'quiz-phishing-02',
          'phishing',
          'Anda menerima SMS dari bank ternama bahwa akun Anda terancam ditutup. Tautan yang disertakan adalah "https://bca.klik-login-verifikasi.xyz"',
          'Mengapa tautan tersebut sangat berbahaya?',
          'medium',
          '[
            {"id": "opt-2a", "text": "Karena menggunakan protokol HTTPS", "isCorrect": false},
            {"id": "opt-2b", "text": "Karena nama BCA diletakkan di subdomain, sedangkan domain aslinya adalah klik-login-verifikasi.xyz", "isCorrect": true},
            {"id": "opt-2c", "text": "Karena pesan dikirim melalui SMS bukan email", "isCorrect": false},
            {"id": "opt-2d", "text": "Karena tidak menyertakan foto logo bank", "isCorrect": false}
          ]'::jsonb,
          'opt-2b',
          'Teknik subdomain spoofing menyamarkan domain root asli (klik-login-verifikasi.xyz) dengan mencantumkan nama bank di awal subdomain.',
          25,
          true,
          2,
          NOW(),
          NOW()
        ),
        (
          'quiz-job-03',
          'job_scam',
          'Anda ditawari pekerjaan freelance like video YouTube bergaji Rp 1.500.000/hari, namun sebelum tugas berikutnya Anda diminta transfer deposit jaminan Rp 250.000.',
          'Apa langkah rasional yang wajib dilakukan?',
          'medium',
          '[
            {"id": "opt-3a", "text": "Transfer deposit Rp 250.000 karena nominalnya kecil dibanding gaji yang dijanjikan", "isCorrect": false},
            {"id": "opt-3b", "text": "Langsung tolak tawaran dan blokir kontak karena pekerjaan legal tidak pernah memungut deposit di muka", "isCorrect": true},
            {"id": "opt-3c", "text": "Minta diskon biaya deposit menjadi Rp 100.000", "isCorrect": false},
            {"id": "opt-3d", "text": "Pinjam uang teman untuk membayar deposit", "isCorrect": false}
          ]'::jsonb,
          'opt-3b',
          'Pekerjaan legal dan profesional tidak pernah membebankan deposit uang muka kepada pekerja. Ini adalah modus klasik Task Scam.',
          25,
          true,
          3,
          NOW(),
          NOW()
        ),
        (
          'quiz-banking-04',
          'banking_fraud',
          'Seseorang menelepon mengaku dari Customer Service Bank dan meminta 6 digit kode OTP yang baru saja masuk ke SMS Anda untuk membatalkan kenaikan biaya bulanan.',
          'Apakah Anda boleh membacakan kode OTP tersebut?',
          'easy',
          '[
            {"id": "opt-4a", "text": "Boleh, asalkan penelpon terdengar ramah dan meyakinkan", "isCorrect": false},
            {"id": "opt-4b", "text": "Boleh, asalkan penelpon menyebutkan nama lengkap dan tanggal lahir kita dengan benar", "isCorrect": false},
            {"id": "opt-4c", "text": "TIDAK BOLEH, pihak bank resmi tidak pernah meminta kode OTP untuk alasan apapun", "isCorrect": true},
            {"id": "opt-4d", "text": "Boleh, tapi hanya 3 digit pertama saja", "isCorrect": false}
          ]'::jsonb,
          'opt-4c',
          'Kode OTP adalah kunci rahasia transaksi satu kali. Pihak bank dan lembaga keuangan resmi di seluruh dunia dilarang keras meminta OTP nasabah.',
          20,
          true,
          4,
          NOW(),
          NOW()
        ),
        (
          'quiz-giveaway-05',
          'giveaway_scam',
          'Anda mendapat pesan bahwa nomor Anda memenangkan undian mobil Avanza dari e-commerce ternama, namun harus membayar pajak hadiah 10% ke rekening pribadi sebelum mobil dikirim.',
          'Bagaimana cara memastikan keaslian undian tersebut?',
          'medium',
          '[
            {"id": "opt-5a", "text": "Segera transfer pajak karena takut hadiah dialihkan ke pemenang lain", "isCorrect": false},
            {"id": "opt-5b", "text": "Cek ke media sosial resmi bercentang biru atau website resmi e-commerce terkait tanpa menghubungi nomor pengirim", "isCorrect": true},
            {"id": "opt-5c", "text": "Minta pelaku mengirimkan foto KTP bendahara undian", "isCorrect": false},
            {"id": "opt-5d", "text": "Percaya karena ada surat keputusan izin Kemensos palsu yang dilampirkan", "isCorrect": false}
          ]'::jsonb,
          'opt-5b',
          'Pajak undian resmi dari korporasi besar tidak pernah ditransfer ke rekening bank perorangan atau pribadi.',
          25,
          true,
          5,
          NOW(),
          NOW()
        ),
        (
          'quiz-investment-06',
          'investment_scam',
          'Sebuah platform investasi di Telegram menjanjikan profit tetap 30% per minggu tanpa risiko kerugian sama sekali melalui robot trading cerdas.',
          'Prinsip investasi apa yang dilanggar oleh penawaran tersebut?',
          'hard',
          '[
            {"id": "opt-6a", "text": "Prinsip High Risk High Return: tidak ada instrumen investasi legal yang menjamin profit tinggi tanpa risiko", "isCorrect": true},
            {"id": "opt-6b", "text": "Prinsip diversifikasi portofolio", "isCorrect": false},
            {"id": "opt-6c", "text": "Prinsip likuiditas pasar modal", "isCorrect": false},
            {"id": "opt-6d", "text": "Prinsip compound interest", "isCorrect": false}
          ]'::jsonb,
          'opt-6a',
          'Janji keuntungan tetap tanpa risiko rugi adalah ciri mutlak investasi bodong (skema Ponzi). Semua investasi legal memiliki risiko pasar.',
          30,
          true,
          6,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Inisialisasi postingan komunitas dan laporan ke community_posts jika masih kosong
    try {
      await pool.query(`ALTER TYPE report_status_enum ADD VALUE IF NOT EXISTS 'resolved';`);
    } catch {}

    const postCount = await pool.query('SELECT COUNT(*) FROM community_posts');
    if (postCount && parseInt(postCount.rows[0].count, 10) === 0) {
      console.log('[DB] Menginisialisasi postingan komunitas asli ke tabel community_posts...');
      await pool.query(`
        INSERT INTO community_posts (
          id, author_name, author_badge, category, title, chronology, red_flags, lessons_learned, loss_amount_est, incident_date, status, likes_count, is_pinned, created_at, updated_at
        ) VALUES
        (
          'post-101',
          'Rian_Bandung99',
          'Korban Melapor',
          'job_scam',
          'Nyaris Hilang 3 Juta di Grup Tugas Like Shopee Telegram',
          'Awalnya saya dihubungi via WhatsApp oleh nomor bisnis tawaran freelance online. Tugasnya hanya like video dan review toko merchant. Pada tugas awal saya benar-benar menerima komisi Rp 25.000 ke rekening BCA. Namun di grup Telegram VIP, admin mewajibkan deposit dana talangan mulai Rp 500.000 hingga Rp 2.500.000 dengan dalih akun terkunci. Begitu saya sadar ini jebakan Ponzi, saya langsung berhenti dan memblokir kontak.',
          'Pekerjaan mudah bergaji fantastis, dipindahkan ke grup Telegram anonim, dan diwajibkan menyetor uang jaminan.',
          'Tidak ada lowongan kerja legal yang meminta transfer uang atau deposit dari pelamar. Waspadai komisi pancingan di awal.',
          'Rp 500.000',
          '02 November 2026',
          'published',
          28,
          true,
          NOW() - INTERVAL '3 days',
          NOW() - INTERVAL '3 days'
        ),
        (
          'post-102',
          'IbuSiti_Sby',
          'Warga Waspada',
          'apk_malware',
          'Waspada APK Surat Undangan Pernikahan Mengatasnamakan Saudara Jauh',
          'Pagi hari saya menerima pesan WhatsApp dari nomor asing: "Assalamu alaikum Ibu Siti, kami sekeluarga mengundang ke pernikahan putri kami. Berkas undangan terlampir Surat_Undangan_Digital.apk". Karena saya sering membaca edukasi Scamora tentang bahaya berkas .APK pencuri OTP m-banking, saya tidak membuka berkas dan langsung menelpon saudara terkait. Ternyata nomor tersebut hasil bajakan.',
          'Format berkas berupa .apk bukan dokumen PDF atau foto resmi, dikirim dari nomor tak dikenal yang mendesak untuk diinstal.',
          'Jangan pernah memasang berkas aplikasi (.apk) yang dikirimkan melalui pesan singkat apapun alasannya.',
          'Rp 0 (Terselamatkan)',
          '04 November 2026',
          'published',
          45,
          false,
          NOW() - INTERVAL '2 days',
          NOW() - INTERVAL '2 days'
        ),
        (
          'post-103',
          'Budi_Fintech',
          'Warga Waspada',
          'phishing',
          'Trik Licik Subdomain Phishing Bank Mandiri Livin via SMS Masking',
          'Menerima SMS dari pengirim "BANK-NOTICE" menyatakan ada transaksi kartu debit mencurigakan Rp 4.750.000 dan diminta membatalkan lewat tautan: mandiri.livin-batal-transaksi.xyz. Setelah saya cek di Scamora, domain root aslinya adalah livin-batal-transaksi.xyz. Form web palsu tersebut meminta nomor 16 digit kartu ATM, masa berlaku, CVV, dan PIN SMS nasabah.',
          'Domain root .xyz berkedok subdomain bank resmi, form meminta data rahasia CVV kartu dan kode OTP sekaligus.',
          'Bank tidak pernah meminta nasabah mengisi tautan formulir untuk membatalkan transaksi yang mencurigakan.',
          'Rp 0 (Terselamatkan)',
          '06 November 2026',
          'published',
          39,
          false,
          NOW() - INTERVAL '1 day',
          NOW() - INTERVAL '1 day'
        ),
        (
          'post-104',
          'Dimas_Kusuma',
          'Korban Melapor',
          'banking_fraud',
          'Telepon Customer Service Palsu Mengaku Perubahan Tarif Bank Rp 150rb/Bulan',
          'Pelaku menelpon lewat panggilan WhatsApp berlogo bank resmi. Memberitahu ada penyesuaian tarif transaksi otomatis dari Rp 6.500 jadi Rp 150.000 per bulan. Jika tidak setuju, diminta klik tautan surat pembatalan. Saat panik hampir saja saya bacakan kode OTP yang masuk, tapi saya teringat aturan bahwa bank tidak pernah meminta OTP.',
          'Panggilan resmi bank melalui voice WhatsApp, menciptakan ancaman kepanikan saldo terpotong, meminta OTP untuk verifikasi pembatalan.',
          'Segera matikan telepon bila mengaku dari bank dan meminta kode rahasia atau OTP.',
          'Rp 0 (Terselamatkan)',
          '07 November 2026',
          'under_review',
          12,
          false,
          NOW() - INTERVAL '12 hours',
          NOW() - INTERVAL '12 hours'
        ),
        (
          'post-105',
          'Anonim_Jakarta',
          'Anonim',
          'investment_scam',
          'Titip Modal Robot Trading Forex di Telegram dengan Janji Profit 25% Mingguan',
          'Diundang ke channel Telegram "Smart Trader VIP". Anggota di grup sangat aktif pamer bukti penarikan puluhan juta. Tergiur janji return 25% per minggu, saya transfer modal awal Rp 1.000.000. Di dashboard fiktif terlihat saldo naik jadi Rp 3.000.000, tapi saat mau withdraw diminta bayar pajak pencairan Rp 500.000. Begitu saya bayar, saya langsung dikick dari grup dan akun Telegram admin dihapus.',
          'Janji profit pasti tanpa risiko rugi, bukti transfer testimoni palsu, meminta biaya tambahan untuk mencairkan saldo.',
          'Seluruh skema titip dana trading dengan jaminan pasti untung adalah modus penipuan skema ponzi.',
          'Rp 1.500.000',
          '08 November 2026',
          'published',
          19,
          false,
          NOW() - INTERVAL '4 hours',
          NOW() - INTERVAL '4 hours'
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    const reportCount = await pool.query('SELECT COUNT(*) FROM post_reports');
    if (reportCount && parseInt(reportCount.rows[0].count, 10) === 0) {
      console.log('[DB] Menginisialisasi laporan moderasi asli ke tabel post_reports...');
      await pool.query(`
        INSERT INTO post_reports (
          id, post_id, reporter_name, report_reason, details, status, reviewed_at, created_at
        ) VALUES
        (
          'rep-01',
          'post-104',
          'WargaCermat',
          'Klaim Perlu Verifikasi Lanjutan',
          'Pengunggah perlu menyertakan tangkapan layar nomor pengirim agar warga lain bisa memblokir nomornya.',
          'pending',
          NULL,
          NOW() - INTERVAL '2 hours'
        ),
        (
          'rep-02',
          'post-101',
          'CyberGuard_ID',
          'Indikasi Informasi Sensitif (PII)',
          'Terdapat sensor nomor telepon yang sudah disamarkan dengan baik oleh sistem, laporan aman dan layak tayang.',
          'reviewed',
          NOW() - INTERVAL '1 day',
          NOW() - INTERVAL '2 days'
        )
        ON CONFLICT (id) DO NOTHING;
      `);
    }
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
