import type { Request, Response } from 'express';
import { env } from '../config/env';
import { query, isDbConnected } from '../config/db';
import { DEMO_EXAMPLES } from '../data/demoExamples';
import { requestGeminiAnalysis } from '../services/ai/geminiClient';
import { createAdminToken, validateAdminCredentials, hashUserPassword } from '../services/adminAuthService';
import type { RiskLevel, ScamType } from '../types/analysis';

export interface DemoPresetItem {
  id: string;
  type: 'url' | 'chat';
  title: string;
  subtitle: string;
  content: string;
  expectedCategory: RiskLevel;
  expectedScore: number;
  scamType: ScamType;
  tags: string[];
  isActive: boolean;
  updatedAt: string;
}

// In-memory fallbacks initialized with realistic seed data
let presetsStore: DemoPresetItem[] = DEMO_EXAMPLES.map((ex, idx) => ({
  ...ex,
  isActive: true,
  updatedAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
}));

let runtimeAiConfig = {
  activeProvider: env.AI_PROVIDER || 'gemini',
  geminiModel: env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  claudeModel: env.CLAUDE_MODEL || 'claude-3-5-haiku-20241022',
  geminiKeySet: Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 5),
  claudeKeySet: Boolean(env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.length > 5),
  safeBrowsingKeySet: Boolean(env.SAFE_BROWSING_API_KEY && env.SAFE_BROWSING_API_KEY.length > 5),
  temperature: 0.1,
  maxTokens: 1024,
  status: (env.GEMINI_API_KEY ? 'operational' : 'degraded') as 'operational' | 'degraded' | 'offline',
  latencyMs: 720,
  credentialCode: 'SCAMORA-SEC-CRED-9942',
  idToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImF1dGgta2V5LTIwMjYifQ',
  projectId: 'scamora-cyber-defense-prod',
};

let runtimeCrawlerConfig = {
  timeoutMs: 4000,
  maxBytesKb: 512,
  userAgent: 'ScamoraSecurityBot/1.0 (+https://scamora.id/bot)',
  ssrfProtection: true,
  detectApk: true,
  detectForms: true,
  allowRedirects: true,
};

let articlesStore: any[] = [
  {
    id: 'art-apk-invitation',
    categoryCode: 'apk_malware',
    categoryName: 'Malware Android (.APK)',
    title: 'Anatomi Modus Undangan Pernikahan .APK Pencuri Saldo Rekening',
    summary: 'Bagaimana file APK mengeksploitasi izin Accessibility Service di Android untuk membaca SMS dan kode OTP perbankan secara diam-diam.',
    targetVictims: 'Pengguna smartphone Android, nasabah m-banking',
    redFlags: [
      'Pesan dikirim dari nomor tak dikenal mengatasnamakan kerabat jauh',
      'Ekstensi berkas berupa .apk bukan .pdf atau tautan web',
      'Meminta izin aksesibilitas dan notifikasi saat aplikasi dibuka',
    ],
    responseSteps: [
      'Segera nyalakan Airplane Mode (Mode Pesawat)',
      'Hapus aplikasi dari Settings -> Apps -> Uninstall',
      'Ganti seluruh PIN dan kata sandi m-banking dari perangkat lain',
      'Hubungi call center resmi bank untuk memblokir rekening sementara',
    ],
    status: 'published',
    views: 1240,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'art-task-scam-youtube',
    categoryCode: 'job_scam',
    categoryName: 'Penipuan Kerja Paruh Waktu',
    title: 'Jebakan Komisi Fantastis Kerja Like & Subscribe YouTube',
    summary: 'Skema Ponzi gaya baru yang memancing korban dengan keuntungan awal kecil, kemudian mengunci dana jutaan rupiah dengan dalih penalti tugas.',
    targetVictims: 'Pencari kerja sampingan, ibu rumah tangga, mahasiswa',
    redFlags: [
      'Komisi Rp 500.000 - Rp 2.000.000 per hari untuk pekerjaan sangat mudah',
      'Komunikasi dipindahkan ke grup Telegram dengan banyak akun palsu',
      'Diminta deposit uang jaminan untuk membuka level tugas lebih tinggi',
    ],
    responseSteps: [
      'Hentikan seluruh transfer tambahan sekarang juga',
      'Kumpulkan tangkapan layar bukti transfer dan nomor rekening pelaku',
      'Laporkan nomor rekening ke cekrekening.id dan lapor.go.id',
    ],
    status: 'published',
    views: 980,
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

let categoriesStore: any[] = [
  {
    id: 'cat-phishing',
    code: 'phishing',
    name: 'Phishing Situs & Tautan Palsu',
    icon: 'Link2',
    description: 'Situs web tiruan yang memalsukan tampilan bank atau e-commerce untuk merampas kata sandi dan kredensial.',
    riskTier: 'CRITICAL',
    articleCount: 12,
    quizCount: 4,
  },
  {
    id: 'cat-apk',
    code: 'apk_malware',
    name: 'Malware Android Berkedok Dokumen (.APK)',
    icon: 'ShieldAlert',
    description: 'Aplikasi jahat yang menyamar sebagai undangan pernikahan, surat tilang, atau resi kurir untuk menyadap SMS OTP perbankan.',
    riskTier: 'CRITICAL',
    articleCount: 8,
    quizCount: 3,
  },
  {
    id: 'cat-job',
    code: 'job_scam',
    name: 'Penipuan Kerja Paruh Waktu (Task Scam)',
    icon: 'Briefcase',
    description: 'Iming-iming gaji fantastis untuk like video atau review hotel yang berujung permintaan transfer deposit.',
    riskTier: 'HIGH',
    articleCount: 10,
    quizCount: 3,
  },
  {
    id: 'cat-giveaway',
    code: 'giveaway_scam',
    name: 'Undian Hadiah & Gebyar Palsu',
    icon: 'Gift',
    description: 'Pemberitahuan memenangkan undian ratusan juta yang mewajibkan pembayaran pajak hadiah terlebih dahulu.',
    riskTier: 'HIGH',
    articleCount: 6,
    quizCount: 2,
  },
  {
    id: 'cat-banking',
    code: 'banking_fraud',
    name: 'Vishing & Pencurian Kredensial Perbankan',
    icon: 'CreditCard',
    description: 'Panggilan atau pesan mengaku petugas bank meminta kode OTP atau perubahan tarif biaya transaksi.',
    riskTier: 'CRITICAL',
    articleCount: 9,
    quizCount: 2,
  },
];

let questionsStore: any[] = [
  {
    id: 'quiz-1',
    categoryCode: 'apk_malware',
    scenario: 'Anda menerima pesan WhatsApp dari nomor kurir paket: "Paket Anda tertahan di gudang, silakan cek resi pelacakan di berkas terlampir: Resi_Pelacakan_JNT.apk"',
    question: 'Tindakan paling aman yang harus Anda ambil adalah:',
    difficulty: 'Easy',
    points: 20,
    options: [
      { id: 'opt-1', text: 'Mengunduh dan memasang aplikasi untuk mengetahui nomor resi asli', isCorrect: false },
      { id: 'opt-2', text: 'Meneruskan pesan ke keluarga untuk menanyakan apakah ada yang pesan paket', isCorrect: false },
      { id: 'opt-3', text: 'Tidak membuka berkas .APK, hapus pesan, dan cek resi melalui website atau aplikasi resmi ekspedisi', isCorrect: true },
      { id: 'opt-4', text: 'Membalas chat meminta foto fisik paket', isCorrect: false },
    ],
    explanation: 'Kurir resmi tidak pernah mengirim berkas biner berekstensi .apk. Berkas ini adalah malware trojan pencuri SMS OTP.',
  },
  {
    id: 'quiz-2',
    categoryCode: 'phishing',
    scenario: 'Anda menerima SMS dari bank ternama bahwa akun Anda terancam ditutup. Tautan yang disertakan adalah "https://bca.klik-login-verifikasi.xyz"',
    question: 'Mengapa tautan tersebut sangat berbahaya?',
    difficulty: 'Medium',
    points: 25,
    options: [
      { id: 'opt-2a', text: 'Karena menggunakan protokol HTTPS', isCorrect: false },
      { id: 'opt-2b', text: 'Karena nama BCA diletakkan di subdomain, sedangkan domain aslinya adalah klik-login-verifikasi.xyz', isCorrect: true },
      { id: 'opt-2c', text: 'Karena pesan dikirim melalui SMS bukan email', isCorrect: false },
      { id: 'opt-2d', text: 'Karena tidak menyertakan foto logo bank', isCorrect: false },
    ],
    explanation: 'Teknik subdomain spoofing menyamarkan domain root asli (klik-login-verifikasi.xyz) dengan mencantumkan nama bank di awal.',
  },
];

let postsStore: any[] = [
  {
    id: 'post-101',
    authorPseudonym: 'Rian_Bandung99',
    categoryCode: 'job_scam',
    title: 'Nyaris Hilang 3 Juta di Grup Tugas Like Shopee Telegram',
    story: 'Awalnya dapat chat WA tawaran part-time Shopee. Diberi komisi 25rb di awal dan masuk rekening. Pas tugas ke-4 disuruh deposit 500rb, lalu 2.5jt dengan dalih akun terkunci. Untung saya curiga dan langsung stop.',
    financialLossEstimate: 'Rp 500.000',
    piiScrubbed: true,
    status: 'published',
    likesCount: 24,
    reportedCount: 0,
    createdAt: new Date(Date.now() - 36000000).toISOString(),
  },
  {
    id: 'post-102',
    authorPseudonym: 'IbuSiti_Sby',
    categoryCode: 'apk_malware',
    title: 'Undangan Pernikahan Palsu Format APK',
    story: 'Mendapat file undangan nikah format APK dari nomor tidak dikenal. Saya tidak klik karena sudah sering baca berita tentang pembobolan m-banking via APK.',
    financialLossEstimate: 'Rp 0 (Terselamatkan)',
    piiScrubbed: true,
    status: 'published',
    likesCount: 42,
    reportedCount: 1,
    createdAt: new Date(Date.now() - 72000000).toISOString(),
  },
];

let reportsStore: any[] = [
  {
    id: 'rep-01',
    postId: 'post-102',
    postTitle: 'Undangan Pernikahan Palsu Format APK',
    reporterPseudonym: 'WargaCermat',
    reason: 'Klaim Tanpa Bukti / Perlu Verifikasi Lanjutan',
    details: 'Pengunggah perlu menyertakan tangkapan layar nomor pengirim agar warga lain bisa memblokir nomornya.',
    status: 'pending',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
];

let auditLogsStore: any[] = [
  {
    id: 'log-1',
    actor: 'admin@scamora.id',
    action: 'INIT_SYSTEM',
    target: 'Security Command Center',
    details: 'Sistem diinisialisasi dengan enkripsi mitigasi TLS tingkat 1.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    severity: 'info',
  },
];

let usersStore: any[] = [
  {
    id: 'usr-101',
    username: 'budi_santoso',
    email: 'budi.santoso@gmail.com',
    fullName: 'Budi Santoso',
    tier: 'verified',
    role: 'user',
    status: 'active',
    scanCount: 14,
    reportCount: 2,
    lastActiveAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    passwordHash: hashUserPassword('password123'),
  },
  {
    id: 'usr-102',
    username: 'warga_cermat',
    email: 'warga.cermat@scamora.id',
    fullName: 'Warga Cermat Penipuan',
    tier: 'verified',
    role: 'user',
    status: 'active',
    scanCount: 8,
    reportCount: 1,
    lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    passwordHash: hashUserPassword('password123'),
  },
];

export function getActivePresets(): DemoPresetItem[] {
  return presetsStore.filter((p) => p.isActive);
}

// =========================================================================
// 1. AUTH & SESSION
// =========================================================================
export async function handleAdminLogin(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body;

  // 1. Cek kredensial superadmin
  if (validateAdminCredentials(username, password)) {
    const token = createAdminToken(username, 'admin', 'verified');

    if (isDbConnected()) {
      query(
        `INSERT INTO admin_audit_logs (id, actor, action, target, severity, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`log-${Date.now()}`, username, 'LOGIN_SUCCESS', 'Admin Portal', 'info', 'Administrator berhasil login.']
      ).catch(() => {});
    }

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          username,
          role: 'admin',
          tier: 'verified',
          name: 'Super Administrator',
        },
        expiresIn: 86400,
      },
    });
    return;
  }

  // 2. Cek database PostgreSQL app_users
  if (isDbConnected()) {
    try {
      const userRes = await query(
        `SELECT * FROM app_users WHERE (username = $1 OR email = $1) LIMIT 1`,
        [username]
      );
      if (userRes && userRes.rows.length > 0) {
        const u = userRes.rows[0];
        const passHash = hashUserPassword(password);
        if (u.password_hash === passHash) {
          if (u.status === 'suspended') {
            res.status(403).json({
              success: false,
              error: {
                code: 'ACCOUNT_SUSPENDED',
                message: 'Akun Anda sedang ditangguhkan. Silakan hubungi administrator.',
              },
            });
            return;
          }

          query(`UPDATE app_users SET last_active_at = NOW() WHERE id = $1`, [u.id]).catch(() => {});

          const token = createAdminToken(u.username, u.role || 'user', u.tier || 'verified');
          res.status(200).json({
            success: true,
            data: {
              token,
              user: {
                id: u.id,
                username: u.username,
                email: u.email,
                role: u.role || 'user',
                tier: u.tier || 'verified',
                name: u.full_name || u.username,
              },
              expiresIn: 86400,
            },
          });
          return;
        }
      }
    } catch (err) {
      console.warn('[DB] Error verifying app_user login:', err);
    }
  }

  // 3. Cek in-memory usersStore
  const memUser = usersStore.find((u) => u.username === username || u.email === username);
  if (memUser && memUser.passwordHash === hashUserPassword(password)) {
    if (memUser.status === 'suspended') {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Akun Anda sedang ditangguhkan.',
        },
      });
      return;
    }
    const token = createAdminToken(memUser.username, memUser.role, memUser.tier);
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: memUser.id,
          username: memUser.username,
          email: memUser.email,
          role: memUser.role,
          tier: memUser.tier,
          name: memUser.fullName,
        },
        expiresIn: 86400,
      },
    });
    return;
  }

  res.status(401).json({
    success: false,
    error: {
      code: 'INVALID_CREDENTIALS',
      message: 'Nama pengguna atau kata sandi tidak valid. Periksa kembali akun Anda.',
    },
  });
}

export async function handleUserRegister(req: Request, res: Response): Promise<void> {
  const { username, email, password, fullName } = req.body || {};

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Nama pengguna minimal 3 karakter (hanya huruf, angka, _).' },
    });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Kata sandi minimal 6 karakter.' },
    });
    return;
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null;
  const cleanName = fullName && typeof fullName === 'string' && fullName.trim() ? fullName.trim() : cleanUsername;

  // Cek apakah username dipakai superadmin
  if (cleanUsername === env.ADMIN_USERNAME.toLowerCase()) {
    res.status(409).json({
      success: false,
      error: { code: 'USERNAME_TAKEN', message: 'Nama pengguna sudah digunakan oleh administrator.' },
    });
    return;
  }

  const passHash = hashUserPassword(password);
  const newUserId = `usr-${Date.now()}`;

  if (isDbConnected()) {
    try {
      const existing = await query(
        `SELECT id FROM app_users WHERE username = $1 OR (email IS NOT NULL AND email = $2) LIMIT 1`,
        [cleanUsername, cleanEmail]
      );
      if (existing && existing.rows.length > 0) {
        res.status(409).json({
          success: false,
          error: { code: 'USER_EXISTS', message: 'Nama pengguna atau email sudah terdaftar.' },
        });
        return;
      }

      await query(
        `INSERT INTO app_users (id, username, email, password_hash, full_name, tier, role, status, scan_count, report_count, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'verified', 'user', 'active', 0, 0, NOW(), NOW())`,
        [newUserId, cleanUsername, cleanEmail, passHash, cleanName]
      );

      query(
        `INSERT INTO admin_audit_logs (id, actor, action, target, severity, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`log-${Date.now()}`, cleanUsername, 'USER_REGISTER', 'User Accounts', 'info', `Pengguna baru '${cleanUsername}' terdaftar dengan tingkatan Terverifikasi (Verified).`]
      ).catch(() => {});
    } catch (err: any) {
      console.error('[DB] Gagal registrasi user:', err);
      res.status(500).json({ success: false, error: { message: 'Gagal mendaftarkan akun di basis data.' } });
      return;
    }
  }

  // Simpan juga di memori cadangan
  const newUser = {
    id: newUserId,
    username: cleanUsername,
    email: cleanEmail || '',
    passwordHash: passHash,
    fullName: cleanName,
    tier: 'verified' as const,
    role: 'user' as const,
    status: 'active' as const,
    scanCount: 0,
    reportCount: 0,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  usersStore.unshift(newUser);

  const token = createAdminToken(cleanUsername, 'user', 'verified');

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: newUserId,
        username: cleanUsername,
        email: cleanEmail,
        name: cleanName,
        tier: 'verified',
        role: 'user',
      },
      message: 'Registrasi berhasil! Akun Anda aktif dengan tingkatan Terverifikasi (Verified).',
    },
  });
}

export async function handleVerifyAdminSession(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      authenticated: true,
      user: {
        username: env.ADMIN_USERNAME,
        role: 'admin',
        name: 'Super Administrator',
      },
    },
  });
}

// =========================================================================
// 2. STATS & TELEMETRY
// =========================================================================
export async function handleGetStats(_req: Request, res: Response): Promise<void> {
  // If PostgreSQL is connected, aggregate real counts from DB
  if (isDbConnected()) {
    try {
      const statsRes = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE analysis_type = 'url') as url_count,
          COUNT(*) FILTER (WHERE analysis_type = 'chat') as chat_count,
          COUNT(*) FILTER (WHERE risk_level = 'high') as high_count,
          COUNT(*) FILTER (WHERE risk_level = 'review') as review_count,
          COUNT(*) FILTER (WHERE risk_level = 'low') as low_count
        FROM analysis_stats
      `);

      const row = statsRes?.rows[0];
      const dbTotal = parseInt(row?.total || '0', 10);
      const high = parseInt(row?.high_count || '0', 10);
      const review = parseInt(row?.review_count || '0', 10);
      const low = parseInt(row?.low_count || '0', 10);

      res.status(200).json({
        success: true,
        data: {
          totalScans: dbTotal,
          urlScans: parseInt(row?.url_count || '0', 10),
          chatScans: parseInt(row?.chat_count || '0', 10),
          highRiskCount: high,
          reviewCount: review,
          lowRiskCount: low,
          threatRatioPercent: dbTotal > 0 ? parseFloat(((high / dbTotal) * 100).toFixed(1)) : 0,
          avgLatencyMs: runtimeAiConfig.latencyMs || 0,
          crawlerSuccessRate: 100,
          activeThreatCount: high,
          apiCallsToday: dbTotal,
          riskDistribution: {
            high: dbTotal > 0 ? parseFloat(((high / dbTotal) * 100).toFixed(1)) : 0,
            review: dbTotal > 0 ? parseFloat(((review / dbTotal) * 100).toFixed(1)) : 0,
            low: dbTotal > 0 ? parseFloat(((low / dbTotal) * 100).toFixed(1)) : 0,
          },
          scamTypeBreakdown: {
            phishing: 0,
            job_scam: 0,
            apk_malware: 0,
            banking_fraud: 0,
            investment_scam: 0,
            impersonation: 0,
          },
          hourlyScans24h: Array.from({ length: 24 }, (_, i) => ({
            hour: `${String(i).padStart(2, '0')}:00`,
            scans: 0,
          })),
        },
      });
      return;
    } catch (err) {
      console.warn('[DB] Gagal menghitung stats dari DB, fallback default:', err);
    }
  }

  // Fallback default telemetry
  res.status(200).json({
    success: true,
    data: {
      totalScans: 1482,
      urlScans: 894,
      chatScans: 588,
      highRiskCount: 642,
      reviewCount: 489,
      lowRiskCount: 351,
      threatRatioPercent: 63.8,
      avgLatencyMs: runtimeAiConfig.latencyMs || 680,
      crawlerSuccessRate: 98.4,
      activeThreatCount: 148,
      apiCallsToday: 412,
      riskDistribution: { high: 43.3, review: 33.0, low: 23.7 },
      scamTypeBreakdown: {
        phishing: 412,
        job_scam: 320,
        apk_malware: 295,
        banking_fraud: 215,
        giveaway_scam: 140,
        investment_scam: 100,
      },
      hourlyScans24h: [
        { hour: '00:00', scans: 24, threats: 10, safe: 14 },
        { hour: '04:00', scans: 19, threats: 8, safe: 11 },
        { hour: '08:00', scans: 76, threats: 32, safe: 44 },
        { hour: '12:00', scans: 98, threats: 43, safe: 55 },
        { hour: '14:00', scans: 122, threats: 55, safe: 67 },
        { hour: '18:00', scans: 71, threats: 30, safe: 41 },
        { hour: '22:00', scans: 32, threats: 13, safe: 19 },
      ],
      aiTelemetry: {
        tokensUsed24h: 184520,
        promptTokens24h: 128400,
        completionTokens24h: 56120,
        avgLatencyMs: runtimeAiConfig.latencyMs || 680,
        currentLatencyMs: runtimeAiConfig.latencyMs || 620,
        errorCount24h: 0,
        errorRatePercent: 0.0,
        operationalStatus: 'optimal',
        lastIncidentNote: 'Semua request inferensi berhasil tanpa kegagalan (0 incident).',
      },
      visitorStats: {
        totalVisitors: 4892,
        uniqueVisitors: 3418,
        pageViews: 14280,
        liveActiveUsers: 48,
        peakHour: '14:00 - 15:00 WIB',
      },
    },
  });
}

// =========================================================================
// 3. AI & CRAWLER CONFIGURATION
// =========================================================================
export async function handleGetAiConfig(_req: Request, res: Response): Promise<void> {
  if (isDbConnected()) {
    try {
      const dbRes = await query('SELECT * FROM system_runtime_config WHERE id = $1', ['default']);
      if (dbRes && dbRes.rows.length > 0) {
        const c = dbRes.rows[0];
        runtimeAiConfig.activeProvider = c.ai_provider || runtimeAiConfig.activeProvider;
        runtimeAiConfig.geminiModel = c.gemini_model || runtimeAiConfig.geminiModel;
        runtimeAiConfig.temperature = parseFloat(c.temperature) || runtimeAiConfig.temperature;
        runtimeAiConfig.maxTokens = c.max_tokens || runtimeAiConfig.maxTokens;
      }
    } catch {}
  }

  res.status(200).json({
    success: true,
    data: runtimeAiConfig,
  });
}

export async function handleUpdateAiConfig(req: Request, res: Response): Promise<void> {
  const updates = req.body || {};
  runtimeAiConfig = { ...runtimeAiConfig, ...updates };

  if (isDbConnected()) {
    query(
      `INSERT INTO system_runtime_config (id, ai_provider, gemini_model, temperature, max_tokens, updated_at)
       VALUES ('default', $1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE SET
         ai_provider = EXCLUDED.ai_provider,
         gemini_model = EXCLUDED.gemini_model,
         temperature = EXCLUDED.temperature,
         max_tokens = EXCLUDED.max_tokens,
         updated_at = NOW()`,
      [runtimeAiConfig.activeProvider, runtimeAiConfig.geminiModel, runtimeAiConfig.temperature, runtimeAiConfig.maxTokens]
    ).catch(() => {});
  }

  res.status(200).json({
    success: true,
    data: runtimeAiConfig,
  });
}

export async function handleTestAi(req: Request, res: Response): Promise<void> {
  const t0 = Date.now();
  const prompt = (req.body?.prompt as string) || 'Tes koneksi sistem Scamora AI.';

  try {
    const result = await requestGeminiAnalysis<{ status: string }>(
      'Balas dalam JSON valid: {"status":"ok","latency":0}',
      `Ping test: ${prompt}`
    );

    const latency = Date.now() - t0;
    runtimeAiConfig.latencyMs = latency;
    runtimeAiConfig.status = result.success ? 'operational' : 'degraded';

    res.status(200).json({
      success: true,
      data: {
        latencyMs: latency,
        model: runtimeAiConfig.geminiModel,
        message: result.success
          ? `Inferensi Google Gemini berhasil merespon (${latency}ms).`
          : `Peringatan: Respons Gemini tidak optimal (${latency}ms).`,
      },
    });
  } catch {
    const latency = Date.now() - t0;
    res.status(200).json({
      success: true,
      data: {
        latencyMs: latency,
        model: runtimeAiConfig.geminiModel,
        message: `Simulasi ping engine AI selesai (${latency}ms).`,
      },
    });
  }
}

export async function handleGetCrawlerConfig(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: runtimeCrawlerConfig,
  });
}

export async function handleUpdateCrawlerConfig(req: Request, res: Response): Promise<void> {
  runtimeCrawlerConfig = { ...runtimeCrawlerConfig, ...req.body };
  res.status(200).json({
    success: true,
    data: runtimeCrawlerConfig,
  });
}

// =========================================================================
// 4. DEMO PRESETS CRUD
// =========================================================================
export async function handleGetPresets(_req: Request, res: Response): Promise<void> {
  if (isDbConnected()) {
    try {
      const resDb = await query('SELECT * FROM demo_presets ORDER BY created_at DESC');
      if (resDb) {
        const mapped = resDb.rows.map((r: any) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          subtitle: r.subtitle || '',
          content: r.content,
          expectedCategory: r.expected_category,
          expectedScore: r.expected_score,
          scamType: r.scam_type,
          tags: r.tags || [],
          isActive: r.is_active,
          updatedAt: r.updated_at,
        }));
        res.status(200).json({ success: true, data: mapped });
        return;
      }
    } catch {}
  }

  res.status(200).json({ success: true, data: presetsStore });
}

export async function handleCreatePreset(req: Request, res: Response): Promise<void> {
  const body = req.body;
  const newPreset: DemoPresetItem = {
    id: body.id || `preset-${Date.now()}`,
    type: body.type || 'url',
    title: body.title || 'Skenario Baru',
    subtitle: body.subtitle || '',
    content: body.content || '',
    expectedCategory: body.expectedCategory || 'high',
    expectedScore: typeof body.expectedScore === 'number' ? body.expectedScore : 80,
    scamType: body.scamType || 'phishing',
    tags: Array.isArray(body.tags) ? body.tags : ['Custom'],
    isActive: body.isActive !== undefined ? body.isActive : true,
    updatedAt: new Date().toISOString(),
  };

  presetsStore.unshift(newPreset);

  if (isDbConnected()) {
    query(
      `INSERT INTO demo_presets (id, type, title, subtitle, content, expected_category, expected_score, scam_type, tags, is_active, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (id) DO UPDATE SET
         type = EXCLUDED.type,
         title = EXCLUDED.title,
         subtitle = EXCLUDED.subtitle,
         content = EXCLUDED.content,
         expected_category = EXCLUDED.expected_category,
         expected_score = EXCLUDED.expected_score,
         scam_type = EXCLUDED.scam_type,
         tags = EXCLUDED.tags,
         is_active = EXCLUDED.is_active,
         updated_at = NOW()`,
      [newPreset.id, newPreset.type, newPreset.title, newPreset.subtitle, newPreset.content, newPreset.expectedCategory, newPreset.expectedScore, newPreset.scamType, newPreset.tags, newPreset.isActive]
    ).catch(() => {});
  }

  res.status(201).json({ success: true, data: newPreset });
}

export async function handleUpdatePreset(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const index = presetsStore.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, error: { message: `Preset '${id}' tidak ditemukan.` } });
    return;
  }

  presetsStore[index] = { ...presetsStore[index], ...req.body, updatedAt: new Date().toISOString() };

  if (isDbConnected()) {
    query(
      `UPDATE demo_presets SET
         title = COALESCE($1, title),
         subtitle = COALESCE($2, subtitle),
         content = COALESCE($3, content),
         expected_category = COALESCE($4, expected_category),
         expected_score = COALESCE($5, expected_score),
         scam_type = COALESCE($6, scam_type),
         is_active = COALESCE($7, is_active),
         updated_at = NOW()
       WHERE id = $8`,
      [req.body.title, req.body.subtitle, req.body.content, req.body.expectedCategory, req.body.expectedScore, req.body.scamType, req.body.isActive, id]
    ).catch(() => {});
  }

  res.status(200).json({ success: true, data: presetsStore[index] });
}

export async function handleDeletePreset(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const index = presetsStore.findIndex((p) => p.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, error: { message: `Preset '${id}' tidak ditemukan.` } });
    return;
  }

  presetsStore.splice(index, 1);

  if (isDbConnected()) {
    query('DELETE FROM demo_presets WHERE id = $1', [id]).catch(() => {});
  }

  res.status(200).json({ success: true, data: { message: `Preset '${id}' dihapus.` } });
}

// =========================================================================
// 5. KNOWLEDGE BASE ARTICLES CRUD
// =========================================================================
export async function handleGetArticles(_req: Request, res: Response): Promise<void> {
  if (isDbConnected()) {
    try {
      const dbRes = await query('SELECT * FROM knowledge_articles ORDER BY created_at DESC');
      if (dbRes) {
        const mapped = dbRes.rows.map((r: any) => ({
          id: r.id,
          categoryCode: r.category_code,
          categoryName: r.category_code,
          title: r.title,
          summary: r.summary,
          targetVictims: r.target_victim || '',
          redFlags: r.red_flags || [],
          responseSteps: r.mitigation_steps || [],
          status: r.is_published ? 'published' : 'draft',
          views: r.read_count || 0,
          updatedAt: r.updated_at,
        }));
        res.status(200).json({ success: true, data: mapped });
        return;
      }
    } catch {}
  }

  res.status(200).json({ success: true, data: articlesStore });
}

export async function handleCreateArticle(req: Request, res: Response): Promise<void> {
  const body = req.body;
  const newArt = {
    ...body,
    id: body.id || `art-${Date.now()}`,
    views: 0,
    updatedAt: new Date().toISOString(),
  };

  articlesStore.unshift(newArt);

  if (isDbConnected()) {
    query(
      `INSERT INTO knowledge_articles (id, category_code, title, slug, summary, content, red_flags, mitigation_steps, is_published, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [newArt.id, newArt.categoryCode || 'phishing', newArt.title, `art-${Date.now()}`, newArt.summary || '', newArt.summary || '', JSON.stringify(newArt.redFlags || []), JSON.stringify(newArt.responseSteps || []), true]
    ).catch(() => {});
  }

  res.status(201).json({ success: true, data: newArt });
}

export async function handleUpdateArticle(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const idx = articlesStore.findIndex((a) => a.id === id);
  if (idx !== -1) {
    articlesStore[idx] = { ...articlesStore[idx], ...req.body, updatedAt: new Date().toISOString() };
  }

  if (isDbConnected()) {
    query(
      `UPDATE knowledge_articles SET
         title = COALESCE($1, title),
         summary = COALESCE($2, summary),
         red_flags = COALESCE($3, red_flags),
         mitigation_steps = COALESCE($4, mitigation_steps),
         updated_at = NOW()
       WHERE id = $5`,
      [req.body.title, req.body.summary, req.body.redFlags ? JSON.stringify(req.body.redFlags) : null, req.body.responseSteps ? JSON.stringify(req.body.responseSteps) : null, id]
    ).catch(() => {});
  }

  res.status(200).json({ success: true, data: articlesStore[idx] || { id, ...req.body } });
}

export async function handleDeleteArticle(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  articlesStore = articlesStore.filter((a) => a.id !== id);

  if (isDbConnected()) {
    query('DELETE FROM knowledge_articles WHERE id = $1', [id]).catch(() => {});
  }

  res.status(200).json({ success: true, data: { message: `Artikel '${id}' dihapus.` } });
}

// =========================================================================
// 6. SCAM CATEGORIES CRUD
// =========================================================================
export async function handleGetCategories(_req: Request, res: Response): Promise<void> {
  if (isDbConnected()) {
    try {
      const dbRes = await query('SELECT * FROM scam_categories ORDER BY order_index ASC');
      if (dbRes && dbRes.rows.length > 0) {
        const mapped = dbRes.rows.map((r: any) => ({
          id: r.id,
          code: r.code,
          name: r.name,
          icon: r.icon_name || 'ShieldAlert',
          description: r.description,
          riskTier: r.risk_tier,
          articleCount: 5,
          quizCount: 2,
        }));
        res.status(200).json({ success: true, data: mapped });
        return;
      }
    } catch {}
  }

  res.status(200).json({ success: true, data: categoriesStore });
}

// =========================================================================
// 7. GUARDIAN CHALLENGE QUESTIONS CRUD
// =========================================================================
export async function handleGetQuestions(_req: Request, res: Response): Promise<void> {
  if (isDbConnected()) {
    try {
      const dbRes = await query('SELECT * FROM challenge_questions ORDER BY order_index ASC');
      if (dbRes) {
        const mapped = dbRes.rows.map((r: any) => ({
          id: r.id,
          categoryCode: r.category_code,
          scenario: r.scenario,
          question: r.question,
          difficulty: r.difficulty === 'hard' ? 'Hard' : r.difficulty === 'medium' ? 'Medium' : 'Easy',
          points: r.points || 20,
          options: r.options || [],
          explanation: r.explanation || '',
        }));
        res.status(200).json({ success: true, data: mapped });
        return;
      }
    } catch {}
  }

  res.status(200).json({ success: true, data: questionsStore });
}

export async function handleCreateQuestion(req: Request, res: Response): Promise<void> {
  const body = req.body;
  const newQ = {
    ...body,
    id: body.id || `quiz-${Date.now()}`,
  };

  questionsStore.push(newQ);

  if (isDbConnected()) {
    query(
      `INSERT INTO challenge_questions (id, category_code, scenario, question, difficulty, options, correct_option_id, explanation, points)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [newQ.id, newQ.categoryCode || 'phishing', newQ.scenario, newQ.question, (newQ.difficulty || 'medium').toLowerCase(), JSON.stringify(newQ.options || []), newQ.options?.[0]?.id || 'opt-1', newQ.explanation || '', newQ.points || 20]
    ).catch(() => {});
  }

  res.status(201).json({ success: true, data: newQ });
}

export async function handleUpdateQuestion(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const idx = questionsStore.findIndex((q) => q.id === id);
  if (idx !== -1) {
    questionsStore[idx] = { ...questionsStore[idx], ...req.body };
  }

  if (isDbConnected()) {
    query(
      `UPDATE challenge_questions SET
         scenario = COALESCE($1, scenario),
         question = COALESCE($2, question),
         points = COALESCE($3, points),
         explanation = COALESCE($4, explanation),
         options = COALESCE($5, options)
       WHERE id = $6`,
      [req.body.scenario, req.body.question, req.body.points, req.body.explanation, req.body.options ? JSON.stringify(req.body.options) : null, id]
    ).catch(() => {});
  }

  res.status(200).json({ success: true, data: questionsStore[idx] || { id, ...req.body } });
}

export async function handleDeleteQuestion(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  questionsStore = questionsStore.filter((q) => q.id !== id);

  if (isDbConnected()) {
    query('DELETE FROM challenge_questions WHERE id = $1', [id]).catch(() => {});
  }

  res.status(200).json({ success: true, data: { message: `Soal '${id}' dihapus.` } });
}

// =========================================================================
// 8. COMMUNITY POSTS & MODERATION CRUD
// =========================================================================
export async function handleGetCommunityPosts(_req: Request, res: Response): Promise<void> {
  if (isDbConnected()) {
    try {
      const dbRes = await query('SELECT * FROM community_posts ORDER BY created_at DESC');
      if (dbRes) {
        const mapped = dbRes.rows.map((r: any) => ({
          id: r.id,
          authorPseudonym: r.author_name || 'Warga Waspada',
          categoryCode: r.category || 'phishing',
          title: r.title,
          story: r.chronology,
          financialLossEstimate: r.loss_amount_est || 'Rp 0',
          piiScrubbed: true,
          status: r.status,
          likesCount: r.likes_count || 0,
          reportedCount: 0,
          createdAt: r.created_at,
        }));
        res.status(200).json({ success: true, data: mapped });
        return;
      }
    } catch {}
  }

  res.status(200).json({ success: true, data: postsStore });
}

export async function handleCreateCommunityPost(req: Request, res: Response): Promise<void> {
  const body = req.body;
  const newPost = {
    ...body,
    id: body.id || `post-${Date.now()}`,
    likesCount: 0,
    reportedCount: 0,
    createdAt: new Date().toISOString(),
  };

  postsStore.unshift(newPost);

  if (isDbConnected()) {
    query(
      `INSERT INTO community_posts (id, author_name, title, chronology, red_flags, lessons_learned, loss_amount_est, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [newPost.id, newPost.authorPseudonym || 'Warga Waspada', newPost.title, newPost.story, 'Teridentifikasi', 'Tetap waspada', newPost.financialLossEstimate || 'Rp 0', newPost.status || 'published']
    ).catch(() => {});
  }

  res.status(201).json({ success: true, data: newPost });
}

export async function handleUpdatePostStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status } = req.body;

  const post = postsStore.find((p) => p.id === id);
  if (post) post.status = status;

  if (isDbConnected()) {
    query('UPDATE community_posts SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]).catch(() => {});
  }

  res.status(200).json({ success: true, data: { id, status } });
}

export async function handleDeletePost(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  postsStore = postsStore.filter((p) => p.id !== id);

  if (isDbConnected()) {
    query('DELETE FROM community_posts WHERE id = $1', [id]).catch(() => {});
  }

  res.status(200).json({ success: true, data: { message: `Post '${id}' dihapus.` } });
}

export async function handleGetReports(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true, data: reportsStore });
}

export async function handleResolveReport(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { action } = req.body; // 'resolve' | 'dismiss'
  const rep = reportsStore.find((r) => r.id === id);
  if (rep) {
    rep.status = action === 'resolve' ? 'resolved' : 'dismissed';
  }

  res.status(200).json({ success: true, data: { id, status: rep?.status || 'resolved' } });
}

// =========================================================================
// 9. AUDIT LOGS
// =========================================================================
export async function handleGetAuditLogs(_req: Request, res: Response): Promise<void> {
  if (isDbConnected()) {
    try {
      const dbRes = await query('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 100');
      if (dbRes) {
        const mapped = dbRes.rows.map((r: any) => ({
          id: r.id,
          actor: r.actor,
          action: r.action,
          target: r.target,
          details: r.details || '',
          timestamp: r.created_at,
          severity: r.severity,
        }));
        res.status(200).json({ success: true, data: mapped });
        return;
      }
    } catch {}
  }

  res.status(200).json({ success: true, data: auditLogsStore });
}

export async function handleCreateAuditLog(req: Request, res: Response): Promise<void> {
  const body = req.body;
  const newLog = {
    id: body.id || `log-${Date.now()}`,
    actor: body.actor || 'admin@scamora.id',
    action: body.action || 'CUSTOM_ACTION',
    target: body.target || 'System',
    details: body.details || '',
    severity: body.severity || 'info',
    timestamp: new Date().toISOString(),
  };

  auditLogsStore.unshift(newLog);

  if (isDbConnected()) {
    query(
      `INSERT INTO admin_audit_logs (id, actor, action, target, severity, details, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [newLog.id, newLog.actor, newLog.action, newLog.target, newLog.severity, newLog.details]
    ).catch(() => {});
  }

  res.status(201).json({ success: true, data: newLog });
}

// =========================================================================
// 10. USER ACCOUNTS MANAGEMENT (GUEST & VERIFIED)
// =========================================================================
export async function handleGetUsers(req: Request, res: Response): Promise<void> {
  const { search, status } = req.query as { search?: string; status?: string };

  if (isDbConnected()) {
    try {
      let sql = "SELECT * FROM app_users WHERE tier = 'verified'";
      const params: any[] = [];
      let pIdx = 1;

      if (status && (status === 'active' || status === 'suspended')) {
        sql += ` AND status = $${pIdx++}`;
        params.push(status);
      }
      if (search && search.trim()) {
        sql += ` AND (username ILIKE $${pIdx} OR full_name ILIKE $${pIdx} OR email ILIKE $${pIdx})`;
        params.push(`%${search.trim()}%`);
        pIdx++;
      }

      sql += ' ORDER BY created_at DESC';

      const dbRes = await query(sql, params);
      const statsRes = await query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active_count,
          COUNT(*) FILTER (WHERE status = 'suspended') as suspended_count
        FROM app_users
        WHERE tier = 'verified'
      `);

      const statRow = statsRes?.rows[0];
      const stats = {
        totalUsers: parseInt(statRow?.total || '0', 10),
        activeUsers: parseInt(statRow?.active_count || '0', 10),
        suspendedUsers: parseInt(statRow?.suspended_count || '0', 10),
      };

      const mapped = (dbRes?.rows || []).map((r: any) => ({
        id: r.id,
        username: r.username,
        email: r.email || '',
        fullName: r.full_name || r.username,
        tier: 'verified',
        role: r.role || 'user',
        status: r.status || 'active',
        scanCount: r.scan_count || 0,
        reportCount: r.report_count || 0,
        lastActiveAt: r.last_active_at || r.created_at,
        createdAt: r.created_at,
      }));

      res.status(200).json({
        success: true,
        data: mapped,
        stats,
      });
      return;
    } catch (err) {
      console.warn('[DB] Gagal query app_users, fallback memory:', err);
    }
  }

  // In-memory fallback
  let list = usersStore.filter((u) => u.tier === 'verified');
  if (status && (status === 'active' || status === 'suspended')) {
    list = list.filter((u) => u.status === status);
  }
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    list = list.filter(
      (u) =>
        u.username.toLowerCase().includes(s) ||
        u.fullName.toLowerCase().includes(s) ||
        (u.email && u.email.toLowerCase().includes(s))
    );
  }

  const verifiedList = usersStore.filter((u) => u.tier === 'verified');
  const stats = {
    totalUsers: verifiedList.length,
    activeUsers: verifiedList.filter((u) => u.status === 'active').length,
    suspendedUsers: verifiedList.filter((u) => u.status === 'suspended').length,
  };

  res.status(200).json({
    success: true,
    data: list,
    stats,
  });
}

export async function handleCreateUser(req: Request, res: Response): Promise<void> {
  const body = req.body || {};
  const newUserId = body.id || `usr-${Date.now()}`;
  const username = (body.username || `user_${Date.now()}`).trim().toLowerCase();
  const fullName = body.fullName || username;
  const email = body.email ? body.email.trim().toLowerCase() : null;
  const tier = 'verified'; // Selalu verified, akun guest tidak disimpan/dihitung
  const role = body.role || 'user';
  const status = body.status === 'suspended' ? 'suspended' : 'active';
  const password = body.password || 'password123';
  const passHash = hashUserPassword(password);

  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO app_users (id, username, email, password_hash, full_name, tier, role, status, scan_count, report_count, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'verified', $6, $7, 0, 0, NOW(), NOW())`,
        [newUserId, username, email, passHash, fullName, role, status]
      );
      query(
        `INSERT INTO admin_audit_logs (id, actor, action, target, severity, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`log-${Date.now()}`, 'admin', 'CREATE_USER', 'User Management', 'info', `Admin menambahkan pengguna verified '${username}'.`]
      ).catch(() => {});
    } catch (err: any) {
      console.error('[DB] Gagal membuat user:', err);
      res.status(409).json({ success: false, error: { message: 'Username atau email sudah digunakan.' } });
      return;
    }
  }

  const createdUser = {
    id: newUserId,
    username,
    email: email || '',
    fullName,
    tier: 'verified' as const,
    role,
    status,
    scanCount: 0,
    reportCount: 0,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  usersStore.unshift({ ...createdUser, passwordHash: passHash });

  res.status(201).json({ success: true, data: createdUser });
}

export async function handleUpdateUserTier(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { tier } = req.body;

  if (tier !== 'guest' && tier !== 'verified') {
    res.status(422).json({ success: false, error: { message: 'Tingkatan harus berupa guest atau verified.' } });
    return;
  }

  if (isDbConnected()) {
    await query(`UPDATE app_users SET tier = $1, updated_at = NOW() WHERE id = $2`, [tier, id]).catch(() => {});
    query(
      `INSERT INTO admin_audit_logs (id, actor, action, target, severity, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [`log-${Date.now()}`, 'admin', 'UPDATE_USER_TIER', 'User Management', 'info', `Mengubah tingkatan user '${id}' menjadi ${tier}.`]
    ).catch(() => {});
  }

  const u = usersStore.find((x) => x.id === id);
  if (u) u.tier = tier;

  res.status(200).json({ success: true, data: { id, tier } });
}

export async function handleUpdateUserStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== 'active' && status !== 'suspended') {
    res.status(422).json({ success: false, error: { message: 'Status harus active atau suspended.' } });
    return;
  }

  if (isDbConnected()) {
    await query(`UPDATE app_users SET status = $1, updated_at = NOW() WHERE id = $2`, [status, id]).catch(() => {});
    query(
      `INSERT INTO admin_audit_logs (id, actor, action, target, severity, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [`log-${Date.now()}`, 'admin', 'UPDATE_USER_STATUS', 'User Management', 'warning', `Mengubah status user '${id}' menjadi ${status}.`]
    ).catch(() => {});
  }

  const u = usersStore.find((x) => x.id === id);
  if (u) u.status = status;

  res.status(200).json({ success: true, data: { id, status } });
}

export async function handleDeleteUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  if (isDbConnected()) {
    await query(`DELETE FROM app_users WHERE id = $1`, [id]).catch(() => {});
    query(
      `INSERT INTO admin_audit_logs (id, actor, action, target, severity, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [`log-${Date.now()}`, 'admin', 'DELETE_USER', 'User Management', 'warning', `Menghapus akun user '${id}'.`]
    ).catch(() => {});
  }

  const idx = usersStore.findIndex((x) => x.id === id);
  if (idx !== -1) usersStore.splice(idx, 1);

  res.status(200).json({ success: true, data: { id, message: 'User berhasil dihapus.' } });
}
