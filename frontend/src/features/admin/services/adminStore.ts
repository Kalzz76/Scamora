import type {
  AnalysisStatItem,
  ScamCategory,
  KnowledgeArticle,
  ChallengeQuestion,
  CommunityPost,
  PostReport,
  ModerationLog,
  AdminUser,
  DemoPresetItem,
  SystemConfig,
} from '../types/admin';

const STORAGE_KEYS = {
  STATS: 'scamora_admin_stats',
  CATEGORIES: 'scamora_admin_categories',
  ARTICLES: 'scamora_admin_articles',
  QUIZZES: 'scamora_admin_quizzes',
  POSTS: 'scamora_admin_posts',
  REPORTS: 'scamora_admin_reports',
  LOGS: 'scamora_admin_logs',
  USERS: 'scamora_admin_users',
  PRESETS: 'scamora_admin_presets',
  CONFIG: 'scamora_admin_config',
};

// Initial Seed Data matching database schema.sql
const INITIAL_CATEGORIES: ScamCategory[] = [
  {
    id: 'cat-1',
    slug: 'phishing',
    name: 'Phishing & Typosquatting',
    description: 'Manipulasi tautan palsu menyerupai institusi perbankan, e-commerce, atau instansi resmi untuk mencuri kredensial akun.',
    icon_name: 'Globe',
    severity_default: 'KRITIS',
    order_index: 1,
    is_active: true,
  },
  {
    id: 'cat-2',
    slug: 'apk-malware',
    name: 'Malware APK WhatsApp',
    description: 'Penyusupan aplikasi Android berbahaya (.apk) bertopeng surat undangan, resi kurir, atau surat tilang untuk menyadap SMS/OTP.',
    icon_name: 'Smartphone',
    severity_default: 'KRITIS',
    order_index: 2,
    is_active: true,
  },
  {
    id: 'cat-3',
    slug: 'job-scam',
    name: 'Job Scam / Tugas Paruh Waktu',
    description: 'Tawaran kerja online komisi fantastis (like, subscribe, review produk) yang berujung permintaan setoran deposit/uang muka.',
    icon_name: 'Briefcase',
    severity_default: 'TINGGI',
    order_index: 3,
    is_active: true,
  },
  {
    id: 'cat-4',
    slug: 'vishing-otp',
    name: 'Vishing & Rekayasa Sosial OTP',
    description: 'Panggilan telepon atau chat mengaku pihak perbankan yang mendesak korban menyebutkan kode OTP atau PIN rahasia.',
    icon_name: 'PhoneCall',
    severity_default: 'TINGGI',
    order_index: 4,
    is_active: true,
  },
  {
    id: 'cat-5',
    slug: 'quishing',
    name: 'Quishing (QRIS Palsu & Stiker Tempel)',
    description: 'Penempelan stiker barcode QRIS palsu di kotak amal atau kasir toko yang mengarahkan transfer ke dompet digital penipu.',
    icon_name: 'QrCode',
    severity_default: 'SEDANG',
    order_index: 5,
    is_active: true,
  },
];

const INITIAL_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'art-1',
    category_id: 'cat-1',
    slug: 'phishing-klikbca-typosquatting',
    title: 'Anatomi Modus Typosquatting Internet Banking',
    severity: 'KRITIS',
    target_victim: 'Nasabah perbankan aktif & pengguna transaksi online',
    channel: 'SMS, WhatsApp, Iklan Search Engine Palsu',
    summary: 'Penipu mendaftarkan nama domain yang sangat mirip dengan situs resmi institusi finansial (contoh: bca-klik.com.xyz) dan membuat replika tampilan form login 99% identik untuk merekam User ID dan PIN nasabah.',
    tactics: [
      'Memanfaatkan TLD murah (.xyz, .top, .live) dan subdomain bertingkat',
      'Mengirimkan SMS darurat: "Akun Anda terblokir, klik tautan untuk verifikasi"',
      'Merekam keystroke PIN dan otomatis meneruskannya ke bot penipu',
    ],
    prevention: [
      'Ketik langsung alamat URL resmi pada address bar browser (contoh: klikbca.com)',
      'Periksa sertifikat SSL dan domain induk di sebelah kiri ikon gembok browser',
      'Jangan pernah membuka tautan perbankan yang dikirim melalui nomor WhatsApp tak dikenal',
    ],
    diagram_type: 'flowchart',
    link_type: 'url',
    is_published: true,
    created_at: '2026-11-01T10:00:00Z',
    updated_at: '2026-11-04T18:30:00Z',
  },
  {
    id: 'art-2',
    category_id: 'cat-2',
    slug: 'apk-undangan-resi-kurir',
    title: 'Bahaya Pengiriman File .APK Berkedok Resi & Undangan Nikah',
    severity: 'KRITIS',
    target_victim: 'Masyarakat umum pengguna smartphone Android',
    channel: 'WhatsApp Chat & Telegram',
    summary: 'Pelaku mengirimkan dokumen bertuliskan "Lihat Foto Paket.apk" atau "Surat_Undangan_Pernikahan.apk". Jika diinstal, aplikasi ini meminta izin BIND_ACCESSIBILITY_SERVICE untuk membaca SMS masuk dan mencuri kode OTP m-banking tanpa disadari korban.',
    tactics: [
      'Memanipulasi ekstensi berkas dengan nama foto atau dokumen PDF palsu',
      'Meminta izin aksesibilitas (Accessibility Service) saat aplikasi dibuka',
      'Mencegat SMS masuk dari bank penyedia OTP dan menghapusnya dari inbox korban',
    ],
    prevention: [
      'Jangan pernah menginstal file berekstensi .apk di luar toko resmi Google Play Store',
      'Matikan opsi "Instal aplikasi dari sumber tidak dikenal" di pengaturan Android',
      'Jika terlanjur klik, segera aktifkan Airplane Mode dan cabut kartu SIM lalu format ponsel',
    ],
    diagram_type: 'sequence',
    link_type: 'chat',
    is_published: true,
    created_at: '2026-11-02T14:20:00Z',
    updated_at: '2026-11-04T20:10:00Z',
  },
  {
    id: 'art-3',
    category_id: 'cat-3',
    slug: 'job-scam-tugas-freelance',
    title: 'Siklus Penipuan Lowongan Kerja Paruh Waktu Komisi Deposit',
    severity: 'TINGGI',
    target_victim: 'Pencari kerja, mahasiswa, dan ibu rumah tangga',
    channel: 'WhatsApp, Telegram Group, Instagram Ads',
    summary: 'Menawarkan penghasilan mudah Rp 500.000 - Rp 2.000.000 per hari hanya dengan memberi rating toko online atau like YouTube. Pada tahap awal korban diberi reward kecil, lalu dipancing menyetor deposit jutaan rupiah yang tidak bisa ditarik kembali.',
    tactics: [
      'Pemberian komisi awal Rp 30.000 untuk membangun rasa percaya palsu',
      'Memasukkan korban ke grup Telegram berisi akun bot testimoni rekayasa',
      'Mewajibkan "Deposit Akun VIP" bertingkat dengan ancaman komisi hangus jika berhenti',
    ],
    prevention: [
      'Ingat prinsip: Pekerjaan resmi memberi gaji kepada pekerja, bukan meminta uang di awal',
      'Waspadai tawaran komisi yang tidak sebanding dengan beban kerja yang sangat ringan',
      'Laporkan grup Telegram dan rekening bank penipu ke kanal patroli siber',
    ],
    diagram_type: 'flowchart',
    link_type: 'chat',
    is_published: true,
    created_at: '2026-11-03T09:15:00Z',
    updated_at: '2026-11-04T12:00:00Z',
  },
];

const INITIAL_QUIZZES: ChallengeQuestion[] = [
  {
    id: 'q-1',
    category_id: 'cat-3',
    scenario: 'Anda menerima pesan WhatsApp: "Selamat! Kami dari Tim HR Shopee. Ada lowongan kerja online paruh waktu like & subscribe video YouTube, gaji Rp 1,5 juta/hari. Sebelum mulai, silakan transfer biaya aktivasi sistem Rp 150.000 ke bendahara kami."',
    question: 'Tindakan paling tepat yang wajib Anda ambil adalah?',
    difficulty: 'easy',
    order_index: 1,
    is_active: true,
    created_at: '2026-11-01T08:00:00Z',
    options: [
      {
        id: 'opt-1-1',
        option_text: 'Segera mentransfer biaya aktivasi agar slot pekerjaan tidak diambil orang lain.',
        is_correct: false,
        explanation_reason: 'Salah! Perusahaan resmi tidak pernah memungut biaya pendaftaran atau deposit awal dari pencari kerja.',
      },
      {
        id: 'opt-1-2',
        option_text: 'Abaikan pesan, jangan transfer uang, dan laporkan nomor tersebut sebagai indikasi penipuan.',
        is_correct: true,
        explanation_reason: 'Tepat sekali! Ini adalah modus klasik Advance Fee Job Scam (Task Scam). Seluruh janji komisi adalah perangkap.',
      },
      {
        id: 'opt-1-3',
        option_text: 'Membalas chat untuk menawar apakah biaya aktivasi bisa dipotong dari gaji hari pertama.',
        is_correct: false,
        explanation_reason: 'Berbahaya! Membalas chat mengonfirmasi nomor Anda aktif dan akan menjadi target spam sindikat berikutnya.',
      },
    ],
  },
  {
    id: 'q-2',
    category_id: 'cat-2',
    scenario: 'Nomor WhatsApp asing mengirimkan file: "Lihat_Foto_Paket_JNT.apk" dengan alasan kurir membutuhkan konfirmasi penerima karena paket Anda tertahan di gudang.',
    question: 'Mengapa Anda dilarang keras mengunduh dan memasang file ini?',
    difficulty: 'medium',
    order_index: 2,
    is_active: true,
    created_at: '2026-11-02T11:00:00Z',
    options: [
      {
        id: 'opt-2-1',
        option_text: 'Foto dokumen seharusnya berformat gambar (.jpg/.png), bukan file installer aplikasi Android (.apk) pencuri SMS/OTP.',
        is_correct: true,
        explanation_reason: 'Benar sekali! Pelaku menyamar sebagai kurir untuk menyusupkan malware APK yang membaca kode OTP perbankan Anda.',
      },
      {
        id: 'opt-2-2',
        option_text: 'Karena paket sebenarnya sudah sampai di rumah tetangga Anda.',
        is_correct: false,
        explanation_reason: 'Salah konteks. Bahaya utamanya terletak pada manipulasi jenis berkas biner eksekusi (.apk).',
      },
      {
        id: 'opt-2-3',
        option_text: 'Boleh dipasang jika ponsel dalam kondisi baterai terisi penuh di atas 80%.',
        is_correct: false,
        explanation_reason: 'Sangat keliru dan membahayakan keselamatan saldo perbankan Anda.',
      },
    ],
  },
  {
    id: 'q-3',
    category_id: 'cat-1',
    scenario: 'Anda menerima pesan SMS resmi palsu dengan tautan: "http://bca-klik.com.secure-update-kartu.xyz/login?token=x99".',
    question: 'Anomali teknis apa yang menandakan tautan tersebut adalah phishing berbahaya?',
    difficulty: 'hard',
    order_index: 3,
    is_active: true,
    created_at: '2026-11-03T15:30:00Z',
    options: [
      {
        id: 'opt-3-1',
        option_text: 'Domain induk aslinya adalah secure-update-kartu.xyz, sedangkan bca-klik.com hanya disisipkan sebagai subdomain tipuan.',
        is_correct: true,
        explanation_reason: 'Tepat! Pelaku memakai teknik Subdomain Masking dan TLD mencurigakan (.xyz) tanpa protokol HTTPS resmi dari bank.',
      },
      {
        id: 'opt-3-2',
        option_text: 'Karena tautan tidak menggunakan gambar logo BCA di dalam link SMS.',
        is_correct: false,
        explanation_reason: 'SMS biasa berbasis teks tidak dapat menampilkan file gambar.',
      },
      {
        id: 'opt-3-3',
        option_text: 'Tautan tersebut aman selama kita membukanya melalui laptop kantor.',
        is_correct: false,
        explanation_reason: 'Salah! Situs phishing tetap mencuri kredensial Anda di perangkat mana pun dibuka.',
      },
    ],
  },
];

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-101',
    user_id: 'usr-4',
    author_pseudonym: 'WaspadaJawaBarat',
    category_name: 'Malware APK WhatsApp',
    title: 'Hampir Kehilangan Saldo Karena APK Surat Tilang Elektronik ETLE',
    chronology: 'Kemarin ada nomor asing mengaku petugas Satlantas mengirimkan dokumen surat tilang bernama Surat_Tilang_ETLE_Nov.apk. Awalnya saya kaget karena kemarin sempat lewat lampu merah. Begitu mau saya instal, Scamora mendeteksi indikasi risiko tinggi.',
    red_flags: 'Pengirim bukan akun centang biru resmi Polri. Format berkas APK bukan surat fisik atau situs resmi etle-pmj.info. Meminta izin notifikasi SMS.',
    lessons_learned: 'Polri tidak pernah mengirimkan surat tilang lewat file APK di WhatsApp. Selalu cek nomor polisi di situs resmi ETLE.',
    status: 'published',
    likes_count: 42,
    comments_count: 9,
    created_at: '2026-11-04T08:12:00Z',
  },
  {
    id: 'post-102',
    user_id: 'usr-5',
    author_pseudonym: 'DigitalSurabaya',
    category_name: 'Job Scam / Tugas Paruh Waktu',
    title: 'Pengalaman Terjebak Tugas Like Review Google Maps Bermodus Deposit',
    chronology: 'Diajak gabung grup Telegram tugas harian. Awalnya dibayar 25 ribu rupiah per 3 tugas. Setelah masuk level 4 disuruh deposit 500 ribu untuk buka komisi 2 juta. Ketika mau withdraw, admin minta bayar pajak pencairan 1 juta lagi.',
    red_flags: 'Uang komisi tidak masuk akal. Akun anggota grup lain terasa seperti buzzer/bot. Tidak ada badan hukum perusahaan yang jelas.',
    lessons_learned: 'Jangan pernah terpancing oleh keuntungan cepat. Begitu ada syarat deposit uang muka, langsung keluar dari grup.',
    status: 'published',
    likes_count: 78,
    comments_count: 16,
    created_at: '2026-11-04T14:40:00Z',
  },
  {
    id: 'post-103',
    user_id: 'usr-6',
    author_pseudonym: 'AnonimJakarta',
    category_name: 'Phishing & Typosquatting',
    title: 'Tautan Undian Promo Ulang Tahun Bank Mandiri Menguras Saldo Ibu Saya',
    chronology: 'Ibu saya menerima link promo kupon berhadiah mobil di grup keluarga. Tampilannya ada logo Mandiri tapi tautannya mandiri-promo-fest2026.top. Di form meminta nomor kartu debit 16 angka dan kode CVV di belakang kartu.',
    red_flags: 'Meminta nomor CVV dan kode OTP. Domain bukan bankmandiri.co.id. Batas waktu countdown 15 menit agar panik.',
    lessons_learned: 'CVV di belakang kartu adalah kunci rahasia. Jangan pernah memasukkan data kartu di form promosi online mana pun.',
    status: 'under_review',
    likes_count: 12,
    comments_count: 2,
    created_at: '2026-11-05T02:15:00Z',
  },
  {
    id: 'post-104',
    user_id: 'usr-7',
    author_pseudonym: 'Spammer999',
    category_name: 'Phishing & Typosquatting',
    title: 'KLIK LINK INI UNTUK DAFTAR JUDI ONLINE PASTI MENANG DEPOSIT 10RB',
    chronology: 'Daftar sekarang bonus 100% langsung wd tanpa syarat hubungi wa 0812345678910',
    red_flags: 'Tautan judi ilegal & spam iklan komersial',
    lessons_learned: 'Tidak ada nilai edukasi',
    status: 'hidden',
    likes_count: 0,
    comments_count: 0,
    created_at: '2026-11-05T03:00:00Z',
  },
];

const INITIAL_REPORTS: PostReport[] = [
  {
    id: 'rep-1',
    post_id: 'post-103',
    post_title: 'Tautan Undian Promo Ulang Tahun Bank Mandiri...',
    reporter_name: 'SiberProteksi',
    report_reason: 'pii_leak',
    details: 'Penulis sempat menyertakan nomor rekening bank pelaku secara lengkap tanpa sensor. Mohon ditinjau moderator agar tidak melanggar aturan PII.',
    status: 'pending',
    created_at: '2026-11-05T03:30:00Z',
  },
  {
    id: 'rep-2',
    post_id: 'post-104',
    post_title: 'KLIK LINK INI UNTUK DAFTAR JUDI ONLINE...',
    reporter_name: 'CakBudi',
    report_reason: 'spam',
    details: 'Spam tautan judi slot online tak bertuan dan nomor kontak iklan.',
    status: 'action_taken',
    reviewed_at: '2026-11-05T03:10:00Z',
    reviewed_by: 'Admin Scamora',
    created_at: '2026-11-05T03:02:00Z',
  },
];

const INITIAL_LOGS: ModerationLog[] = [
  {
    id: 'log-1',
    moderator_id: 'usr-1',
    moderator_name: 'Admin Utama Scamora',
    target_type: 'post',
    target_id: 'post-104',
    target_name: 'KLIK LINK INI UNTUK DAFTAR JUDI ONLINE...',
    action: 'hide',
    reason: 'Pelanggaran ketentuan konten: Spam link ilegal dan promosi tidak berizin.',
    created_at: '2026-11-05T03:10:00Z',
  },
  {
    id: 'log-2',
    moderator_id: 'usr-1',
    moderator_name: 'Admin Utama Scamora',
    target_type: 'user',
    target_id: 'usr-7',
    target_name: 'Spammer999',
    action: 'ban_user',
    reason: 'Akun bot terdeteksi melakukan spamming massal pada forum.',
    created_at: '2026-11-05T03:11:00Z',
  },
  {
    id: 'log-3',
    moderator_id: 'usr-2',
    moderator_name: 'Moderator Keamanan',
    target_type: 'post',
    target_id: 'post-101',
    target_name: 'Hampir Kehilangan Saldo Karena APK Surat Tilang...',
    action: 'publish',
    reason: 'Konten terverifikasi edukatif, kronologi lengkap, dan telah memenuhi standar Zero-Retention.',
    created_at: '2026-11-04T09:00:00Z',
  },
];

const INITIAL_USERS: AdminUser[] = [
  {
    id: 'usr-1',
    email: 'admin@scamora.ai',
    pseudonym: 'Admin Utama Scamora',
    role: 'admin',
    is_banned: false,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    created_at: '2026-10-01T00:00:00Z',
    last_login: '2026-11-05T04:20:00Z',
  },
  {
    id: 'usr-2',
    email: 'moderator@scamora.ai',
    pseudonym: 'Moderator Keamanan',
    role: 'moderator',
    is_banned: false,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    created_at: '2026-10-15T00:00:00Z',
    last_login: '2026-11-04T16:45:00Z',
  },
  {
    id: 'usr-4',
    email: 'jabar_shield@gmail.com',
    pseudonym: 'WaspadaJawaBarat',
    role: 'user',
    is_banned: false,
    created_at: '2026-11-01T12:00:00Z',
    last_login: '2026-11-04T08:10:00Z',
  },
  {
    id: 'usr-5',
    email: 'surabaya_guard@yahoo.com',
    pseudonym: 'DigitalSurabaya',
    role: 'user',
    is_banned: false,
    created_at: '2026-11-02T10:00:00Z',
    last_login: '2026-11-04T14:35:00Z',
  },
  {
    id: 'usr-6',
    email: 'korban_phishing@outlook.com',
    pseudonym: 'AnonimJakarta',
    role: 'user',
    is_banned: false,
    created_at: '2026-11-05T01:50:00Z',
    last_login: '2026-11-05T02:10:00Z',
  },
  {
    id: 'usr-7',
    email: 'bot_promo@spamdomain.cc',
    pseudonym: 'Spammer999',
    role: 'user',
    is_banned: true,
    created_at: '2026-11-05T02:55:00Z',
    last_login: '2026-11-05T03:00:00Z',
  },
];

const INITIAL_PRESETS: DemoPresetItem[] = [
  {
    id: 'url-bank-phishing',
    type: 'url',
    title: 'Phishing BCA Internet Banking',
    subtitle: 'Typosquatting & Subdomain Masking',
    content: 'http://bca-klik.com.secure-login-update.xyz/login?verifikasi=true&token=rahasia123',
    expectedCategory: 'high',
    expectedScore: 95,
    scamType: 'phishing',
    tags: ['Bank', 'Typosquatting', 'HTTP'],
    isActive: true,
  },
  {
    id: 'url-legit-store',
    type: 'url',
    title: 'Toko Online Resmi Indonesia',
    subtitle: 'Domain Terverifikasi & HTTPS Resmi',
    content: 'https://tokopedia.com/promo/guncang-sepatu-sneakers',
    expectedCategory: 'low',
    expectedScore: 0,
    scamType: 'unknown',
    tags: ['E-Commerce', 'HTTPS', 'Aman'],
    isActive: true,
  },
  {
    id: 'url-shortener-redirect',
    type: 'url',
    title: 'URL Shortener Mencurigakan',
    subtitle: 'Tautan Pendek Tanpa Transparansi Tujuan',
    content: 'https://bit.ly/undian-bca-resmi-hadiah2026',
    expectedCategory: 'review',
    expectedScore: 45,
    scamType: 'phishing',
    tags: ['Shortener', 'Unverified'],
    isActive: true,
  },
  {
    id: 'chat-job-freelance',
    type: 'chat',
    title: 'Lowongan Kerja Like/Follow Bodong',
    subtitle: 'Komisi Fantastis + Biaya Pendaftaran Awal',
    content: 'Halo kak! Kami dari Talent Agency Shopee Indonesia. Ada tugas part-time online cuma like & subscribe video YouTube, komisi 500rb - 2jt per hari. Kerja fleksibel dari rumah. Tapi sebelum mulai, ada biaya deposit jaminan aktivasi sistem Rp 150.000 ke rekening bendahara kami ya. Cepat kak slot tinggal 2 orang!',
    expectedCategory: 'high',
    expectedScore: 85,
    scamType: 'job_scam',
    tags: ['Lowongan', 'Uang Muka', 'Desakan'],
    isActive: true,
  },
  {
    id: 'chat-apk-kurir',
    type: 'chat',
    title: 'Kurir Paket Salah Alamat (.APK)',
    subtitle: 'Manipulasi Ekstensi Berkas Malware Android',
    content: 'Selamat sore bu, ini paket Shopee atas nama ibu tertahan di kantor sortir cabang. Alamat di paket robek gak keliatan nomor rumahnya. Tolong cek foto label resi paketnya di aplikasi ini ya bu: Lihat_Foto_Paket_JNT.apk. Mohon segera dibuka biar gak diretur.',
    expectedCategory: 'high',
    expectedScore: 92,
    scamType: 'apk_malware',
    tags: ['Malware APK', 'Kurir', 'Pencuri OTP'],
    isActive: true,
  },
  {
    id: 'chat-legit-family',
    type: 'chat',
    title: 'Percakapan Normal Keluarga',
    subtitle: 'Komunikasi Santai Tanpa Anomali Keuangan',
    content: 'Halo kak, nanti sore pulang kerja tolong mampir minimarket belikan titipan susu adik ya. Jangan lupa struk belanjanya disimpan. Hati-hati di jalan hujan gerimis.',
    expectedCategory: 'low',
    expectedScore: 5,
    scamType: 'unknown',
    tags: ['Keluarga', 'Normal', 'Aman'],
    isActive: true,
  },
];

const INITIAL_STATS: AnalysisStatItem[] = [
  {
    id: 'st-1',
    analysis_type: 'url',
    target_summary: 'http://bca-klik.com.secure-login-update.xyz/...',
    risk_level: 'high',
    risk_score: 95,
    scam_type: 'phishing',
    indicators_count: 5,
    created_at: '2026-11-05T04:15:00Z',
  },
  {
    id: 'st-2',
    analysis_type: 'chat',
    target_summary: 'Selamat sore bu, ini paket Shopee... Lihat_Foto_Paket.apk',
    risk_level: 'high',
    risk_score: 92,
    scam_type: 'apk_malware',
    indicators_count: 4,
    created_at: '2026-11-05T04:02:00Z',
  },
  {
    id: 'st-3',
    analysis_type: 'url',
    target_summary: 'https://tokopedia.com/promo/guncang-sepatu',
    risk_level: 'low',
    risk_score: 0,
    scam_type: 'unknown',
    indicators_count: 0,
    created_at: '2026-11-05T03:55:00Z',
  },
  {
    id: 'st-4',
    analysis_type: 'chat',
    target_summary: 'Halo kak, nanti sore pulang kerja tolong mampir...',
    risk_level: 'low',
    risk_score: 5,
    scam_type: 'unknown',
    indicators_count: 0,
    created_at: '2026-11-05T03:40:00Z',
  },
  {
    id: 'st-5',
    analysis_type: 'url',
    target_summary: 'https://bit.ly/undian-bca-resmi-hadiah2026',
    risk_level: 'review',
    risk_score: 45,
    scam_type: 'phishing',
    indicators_count: 2,
    created_at: '2026-11-05T03:22:00Z',
  },
  {
    id: 'st-6',
    analysis_type: 'chat',
    target_summary: 'Halo kak! Kami dari Talent Agency... biaya deposit Rp 150rb',
    risk_level: 'high',
    risk_score: 85,
    scam_type: 'job_scam',
    indicators_count: 3,
    created_at: '2026-11-05T02:50:00Z',
  },
];

const INITIAL_CONFIG: SystemConfig = {
  ai_provider: 'gemini',
  high_risk_threshold: 70,
  review_risk_threshold: 35,
  zero_retention_enforced: true,
  heuristic_weight: 40,
  pattern_weight: 35,
  ai_weight: 25,
  safe_browsing_enabled: true,
  max_text_length: 5000,
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading ${key} from localStorage:`, err);
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
  }
}

export const adminStore = {
  // Stats
  getStats(): AnalysisStatItem[] {
    return getStorage(STORAGE_KEYS.STATS, INITIAL_STATS);
  },
  recordStat(stat: Omit<AnalysisStatItem, 'id' | 'created_at'>): void {
    const current = this.getStats();
    const newItem: AnalysisStatItem = {
      ...stat,
      id: `st-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.STATS, [newItem, ...current]);
  },

  // Categories
  getCategories(): ScamCategory[] {
    return getStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },
  saveCategory(cat: ScamCategory): void {
    const list = this.getCategories();
    const idx = list.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      list[idx] = cat;
    } else {
      list.push(cat);
    }
    setStorage(STORAGE_KEYS.CATEGORIES, list);
  },
  deleteCategory(id: string): void {
    const list = this.getCategories().filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CATEGORIES, list);
  },

  // Knowledge Articles
  getArticles(): KnowledgeArticle[] {
    return getStorage(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
  },
  saveArticle(article: KnowledgeArticle): void {
    const list = this.getArticles();
    const idx = list.findIndex((a) => a.id === article.id);
    if (idx >= 0) {
      list[idx] = { ...article, updated_at: new Date().toISOString() };
    } else {
      list.unshift({ ...article, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    setStorage(STORAGE_KEYS.ARTICLES, list);
  },
  deleteArticle(id: string): void {
    const list = this.getArticles().filter((a) => a.id !== id);
    setStorage(STORAGE_KEYS.ARTICLES, list);
  },

  // Quizzes
  getQuizzes(): ChallengeQuestion[] {
    return getStorage(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
  },
  saveQuiz(quiz: ChallengeQuestion): void {
    const list = this.getQuizzes();
    const idx = list.findIndex((q) => q.id === quiz.id);
    if (idx >= 0) {
      list[idx] = quiz;
    } else {
      list.push(quiz);
    }
    setStorage(STORAGE_KEYS.QUIZZES, list);
  },
  deleteQuiz(id: string): void {
    const list = this.getQuizzes().filter((q) => q.id !== id);
    setStorage(STORAGE_KEYS.QUIZZES, list);
  },

  // Community Posts
  getPosts(): CommunityPost[] {
    return getStorage(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  },
  updatePostStatus(id: string, status: CommunityPost['status']): void {
    const list = this.getPosts();
    const idx = list.findIndex((p) => p.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      setStorage(STORAGE_KEYS.POSTS, list);
    }
  },
  deletePost(id: string): void {
    const list = this.getPosts().filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.POSTS, list);
  },

  // Reports
  getReports(): PostReport[] {
    return getStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },
  updateReportStatus(id: string, status: PostReport['status'], reviewedBy: string): void {
    const list = this.getReports();
    const idx = list.findIndex((r) => r.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      list[idx].reviewed_at = new Date().toISOString();
      list[idx].reviewed_by = reviewedBy;
      setStorage(STORAGE_KEYS.REPORTS, list);
    }
  },

  // Logs
  getLogs(): ModerationLog[] {
    return getStorage(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  },
  addLog(log: Omit<ModerationLog, 'id' | 'created_at'>): void {
    const list = this.getLogs();
    const newLog: ModerationLog = {
      ...log,
      id: `log-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setStorage(STORAGE_KEYS.LOGS, [newLog, ...list]);
  },

  // Users
  getUsers(): AdminUser[] {
    return getStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  updateUserRole(id: string, role: AdminUser['role']): void {
    const list = this.getUsers();
    const idx = list.findIndex((u) => u.id === id);
    if (idx >= 0) {
      list[idx].role = role;
      setStorage(STORAGE_KEYS.USERS, list);
    }
  },
  toggleUserBan(id: string): void {
    const list = this.getUsers();
    const idx = list.findIndex((u) => u.id === id);
    if (idx >= 0) {
      list[idx].is_banned = !list[idx].is_banned;
      setStorage(STORAGE_KEYS.USERS, list);
    }
  },

  // Presets
  getPresets(): DemoPresetItem[] {
    return getStorage(STORAGE_KEYS.PRESETS, INITIAL_PRESETS);
  },
  savePreset(preset: DemoPresetItem): void {
    const list = this.getPresets();
    const idx = list.findIndex((p) => p.id === preset.id);
    if (idx >= 0) {
      list[idx] = preset;
    } else {
      list.push(preset);
    }
    setStorage(STORAGE_KEYS.PRESETS, list);
  },
  deletePreset(id: string): void {
    const list = this.getPresets().filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.PRESETS, list);
  },

  // Config
  getConfig(): SystemConfig {
    return getStorage(STORAGE_KEYS.CONFIG, INITIAL_CONFIG);
  },
  saveConfig(config: SystemConfig): void {
    setStorage(STORAGE_KEYS.CONFIG, config);
  },

  // Reset all data to factory initial state
  resetAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
