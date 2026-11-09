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
