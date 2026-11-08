/**
 * Scamora - Local Heuristic & Simulated Threat Analyzer (TypeScript)
 * Implements strict rules, PII scrubbing, evidence extraction, and scoring
 * Aligned with Blueprint Sections 10, 11, and 12
 */

import type { AnalysisResult, Indicator, PipelineCheck, RiskLevel, ScamType, CategoryReason } from '../types/analysis';
import type { SimulationMode } from '../types/api';

const RISKY_TLDS = ['.xyz', '.top', '.work', '.click', '.loan', '.fit', '.gq', '.cf', '.ga', '.ml', '.zip', '.mov', '.surf', '.buzz'];
const KNOWN_BRANDS = ['bca', 'mandiri', 'bri', 'bni', 'cimb', 'shopee', 'tokopedia', 'gojek', 'dana', 'ovo', 'whatsapp', 'telegram', 'facebook', 'instagram', 'google'];
const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'is.gd', 's.id', 'shorturl.at', 'rb.gy'];

// Mock Known Malicious Threat Database
const KNOWN_THREAT_DOMAINS = [
  'bca-klik.com.secure-login-update.xyz',
  'malicious-threat-bankbca.com',
  'undian-shopee-resmi2026.xyz',
  'update-rekening-bca.top',
];

export class MockAnalyzer {
  static currentSimMode: SimulationMode = 'normal';

  /**
   * Sanitize URL: Remove userinfo & mask sensitive tokens
   */
  static sanitizeUrl(rawUrl: string): { cleanUrl: string; hasUserInfo: boolean } {
    let clean = rawUrl.trim();
    let hasUserInfo = false;

    // Check userinfo
    const userinfoMatch = clean.match(/^(https?:\/\/)([^/@]+)@/i);
    if (userinfoMatch) {
      hasUserInfo = true;
      clean = clean.replace(/^(https?:\/\/)[^/@]+@/i, '$1');
    }

    // Mask query params
    clean = clean.replace(/([?&](token|api_key|key|otp|auth|secret|pass|password)=)[^&#]*/gi, '$1[DIHAPUS]');
    return { cleanUrl: clean, hasUserInfo };
  }

  /**
   * Client-Side PII Masking for Indonesian Data Formats
   */
  static maskPII(text: string): { maskedText: string; maskedCount: number } {
    let masked = text;
    let count = 0;

    // Indonesian Phone (+62 or 08...)
    const phoneRegex = /(?:\+62|62|08)[0-9\-\s]{8,14}/g;
    masked = masked.replace(phoneRegex, () => {
      count++;
      return '[NOMOR_TELEPON]';
    });

    // Email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    masked = masked.replace(emailRegex, () => {
      count++;
      return '[EMAIL]';
    });

    // Indonesian NIK (16 digits)
    const nikRegex = /\b\d{16}\b/g;
    masked = masked.replace(nikRegex, () => {
      count++;
      return '[NIK]';
    });

    // Bank Account Number (10 - 16 digits)
    const bankRegex = /\b\d{4}[ -]?\d{4}[ -]?\d{2,8}\b/g;
    masked = masked.replace(bankRegex, () => {
      count++;
      return '[REKENING]';
    });

    return { maskedText: masked, maskedCount: count };
  }

  /**
   * Analyze URL with Heuristics & Threat Reputation Simulation
   */
  static async analyzeUrl(rawUrl: string): Promise<AnalysisResult> {
    const mode = this.currentSimMode;

    if (mode === 'rate_limited') {
      throw { status: 429, message: 'Batas frekuensi permintaan terlampaui (10 req/menit). Coba lagi dalam 60 detik.' };
    }

    if (mode === 'pipeline_failed') {
      throw { status: 503, message: 'Layanan analisis keamanan sedang dalam pemeliharaan (HTTP 503).' };
    }

    // Realistic processing latency
    await new Promise((r) => setTimeout(r, 900));

    const { cleanUrl, hasUserInfo } = this.sanitizeUrl(rawUrl);
    const indicators: Indicator[] = [];
    const checks: PipelineCheck[] = [];

    let parsed: URL;
    try {
      parsed = new URL(cleanUrl);
    } catch {
      throw { status: 422, message: 'Format URL tidak valid atau skema protokol hilang.' };
    }

    const hostname = parsed.hostname.toLowerCase();
    const pathname = (parsed.pathname + parsed.search).toLowerCase();

    // 1. Local Heuristics
    if (parsed.protocol === 'http:') {
      indicators.push({
        type: 'no_https',
        title: 'Koneksi Tidak Terenkripsi (HTTP)',
        severity: 'low',
        weight: 10,
        source: 'url_structure',
        evidence: 'http://',
        description: 'Protokol tidak menggunakan enkripsi TLS/SSL standar.',
      });
    }

    if (hasUserInfo) {
      indicators.push({
        type: 'userinfo_in_url',
        title: 'Kredensial Login di URL',
        severity: 'medium',
        weight: 20,
        source: 'url_structure',
        evidence: 'user:pass@host',
        description: 'Terdapat upaya menyisipkan kredensial otentikasi di dalam URL.',
      });
    }

    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      indicators.push({
        type: 'ip_host',
        title: 'Host Berupa Alamat IP Langsung',
        severity: 'medium',
        weight: 25,
        source: 'url_structure',
        evidence: hostname,
        description: 'Penggunaan alamat IP langsung umumnya dilakukan untuk menghindari reputasi nama domain.',
      });
    }

    if (SHORTENERS.some((s) => hostname === s || hostname.endsWith('.' + s))) {
      indicators.push({
        type: 'url_shortener',
        title: 'Layanan Penyingkat Tautan (URL Shortener)',
        severity: 'medium',
        weight: 15,
        source: 'url_structure',
        evidence: hostname,
        description: 'Tujuan akhir tautan tidak dapat diverifikasi langsung tanpa membuka redirect.',
      });
    }

    if (RISKY_TLDS.some((tld) => hostname.endsWith(tld))) {
      indicators.push({
        type: 'risky_tld',
        title: 'Domain Menggunakan TLD Berisiko Tinggi',
        severity: 'low',
        weight: 10,
        source: 'url_structure',
        evidence: hostname.slice(hostname.lastIndexOf('.')),
        description: 'Ekstensi domain sering disalahgunakan dalam kampanye phishing massal.',
      });
    }

    // Check brand in subdomain
    for (const brand of KNOWN_BRANDS) {
      if (hostname.includes(brand)) {
        const hostParts = hostname.split('.');
        const domainRoot = hostParts.slice(-2).join('.');
        if (!domainRoot.includes(brand)) {
          indicators.push({
            type: 'brand_in_subdomain',
            title: `Nama Merek (${brand.toUpperCase()}) Berada di Subdomain`,
            severity: 'high',
            weight: 30,
            source: 'url_structure',
            evidence: hostname,
            description: `Merek terkemuka disamarkan di subdomain, sementara nama domain induk adalah '${domainRoot}'.`,
          });
          break;
        }
      }
    }

    if (cleanUrl.includes('xn--')) {
      indicators.push({
        type: 'punycode_homograph',
        title: 'Deteksi Karakter Punycode Homograf',
        severity: 'high',
        weight: 30,
        source: 'url_structure',
        evidence: 'xn--',
        description: 'Menggunakan karakter alfabet alternatif yang menyerupai huruf asli untuk mengelabui mata.',
      });
    }

    if (['login', 'verifikasi', 'otp', 'claim', 'hadiah', 'rekening', 'update'].some((kw) => pathname.includes(kw))) {
      indicators.push({
        type: 'sensitive_keywords',
        title: 'Kata Kunci Sensitif pada Parameter URL',
        severity: 'low',
        weight: 10,
        source: 'url_structure',
        evidence: pathname.slice(0, 30),
        description: 'Terdapat kata kunci verifikasi/login pada path URL yang berisiko manipulasi kredensial.',
      });
    }

    // 2. 5-Layer Pipeline Checks (Matching Backend UrlAnalyzer Architecture)
    const isKnownThreat = KNOWN_THREAT_DOMAINS.includes(hostname) || cleanUrl.includes('bca-klik');
    if (isKnownThreat) {
      indicators.push({
        type: 'safe_browsing_match',
        title: 'Terdaftar pada Basis Data Google Safe Browsing',
        severity: 'high',
        weight: 60,
        source: 'threat_db',
        evidence: cleanUrl,
        description: 'Domain tercatat aktif sebagai ancaman malware/social engineering terkonfirmasi.',
      });
    }

    // Layer 1: Structure & Syntax
    checks.push({
      name: 'structure',
      status: 'completed',
      note: 'Pemeriksaan sintaksis dan heuristik struktur URL selesai.',
    });

    // Layer 2: Safe Browsing Reputation
    if (mode === 'reputation_failed' || mode === 'all_failed') {
      checks.push({
        name: 'reputation',
        status: 'failed',
        note: 'Pemeriksaan Google Safe Browsing gagal merespons. Status dialihkan ke partial.',
      });
    } else {
      checks.push({
        name: 'reputation',
        status: 'completed',
        note: isKnownThreat ? 'Teridentifikasi pada daftar ancaman' : 'Tidak ditemukan pada daftar ancaman yang diperiksa',
      });
    }

    // 3. Web Page Content Crawling & Heuristics (Simulation / Inspection)
    if (cleanUrl.includes('bca-klik') || cleanUrl.includes('secure-login-update')) {
      indicators.push({
        type: 'credential_harvesting_form',
        title: 'Formulir Pengumpulan Kredensial / Kata Sandi Tidak Resmi',
        severity: 'high',
        weight: 35,
        source: 'web_crawler',
        evidence: '<input type="password" name="password"> pada domain tidak resmi',
        description: 'Perayapan menemukan formulir login dengan input kata sandi pada domain yang tidak terafiliasi resmi dengan Bank BCA.',
      });
      indicators.push({
        type: 'brand_impersonation_content',
        title: 'Pencatutan Identitas dan Konten Merek Resmi pada Halaman',
        severity: 'high',
        weight: 30,
        source: 'content_ai',
        evidence: 'Judul: "KlikBCA Internet Banking - Masukkan User ID & KeyBCA"',
        description: 'Konten halaman meniru antarmuka resmi KlikBCA untuk mengelabui nasabah agar memasukkan kredensial.',
      });
    } else if (cleanUrl.includes('undian') || cleanUrl.includes('hadiah')) {
      indicators.push({
        type: 'fake_giveaway_content',
        title: 'Konten Undian atau Hadiah Palsu Berbahaya',
        severity: 'medium',
        weight: 25,
        source: 'content_ai',
        evidence: 'Klaim: "Selamat! Anda terpilih sebagai pemenang gebyar undian tunai Rp 50.000.000"',
        description: 'Konten halaman memuat narasi undian palsu untuk memancing pengisian nomor rekening dan OTP.',
      });
      indicators.push({
        type: 'credential_harvesting_form',
        title: 'Formulir Pengumpulan Kredensial / Kata Sandi Tidak Resmi',
        severity: 'high',
        weight: 35,
        source: 'web_crawler',
        evidence: 'Input form meminta nomor telepon dan kode verifikasi klaim hadiah',
        description: 'Formulir meminta input data sensitif untuk klaim hadiah palsu.',
      });
    } else if (cleanUrl.toLowerCase().endsWith('.apk') || cleanUrl.includes('apk')) {
      indicators.push({
        type: 'malicious_apk_download',
        title: 'Tautan atau Pemicu Pengunduhan Berkas APK Berbahaya',
        severity: 'high',
        weight: 35,
        source: 'web_crawler',
        evidence: cleanUrl,
        description: 'Halaman memicu unduhan berkas APK Android secara langsung, terindikasi modus pencurian SMS/OTP.',
      });
    }

    // Layer 3: Domain Age & DNS
    checks.push({
      name: 'domain_age',
      status: mode === 'all_failed' ? 'failed' : 'completed',
      note: 'Inspeksi DNS & usia domain selesai.',
    });

    // Layer 4: SSL/TLS Certificate
    checks.push({
      name: 'ssl_certificate',
      status: mode === 'all_failed' ? 'failed' : 'completed',
      note: cleanUrl.startsWith('https://')
        ? 'Inspeksi koneksi SSL/TLS terverifikasi aman.'
        : 'Koneksi tidak menggunakan enkripsi standar SSL/HTTPS.',
    });

    // Layer 5: Live Content & DOM Inspection
    checks.push({
      name: 'live_content',
      status: mode === 'all_failed' ? 'failed' : 'completed',
      note: 'Inspeksi konten web & struktur formulir selesai.',
    });

    return this.calculateFinalRisk('url', cleanUrl, indicators, checks);
  }

  /**
   * Analyze WhatsApp Chat with Regex Scanning & Simulated Claude AI
   */
  static async analyzeChat(rawChat: string): Promise<AnalysisResult> {
    const mode = this.currentSimMode;

    if (mode === 'rate_limited') {
      throw { status: 429, message: 'Batas frekuensi permintaan terlampaui (10 req/menit). Coba lagi dalam 60 detik.' };
    }

    if (mode === 'pipeline_failed') {
      throw { status: 503, message: 'Layanan analisis kecerdasan buatan sedang tidak tersedia (HTTP 503).' };
    }

    await new Promise((r) => setTimeout(r, 1100));

    const { maskedText } = this.maskPII(rawChat);
    const indicators: Indicator[] = [];
    const checks: PipelineCheck[] = [];

    checks.push({ name: 'pii_scrubbing', status: 'completed', note: 'Data pribadi dimasker sebelum evaluasi AI' });

    const lower = rawChat.toLowerCase();

    // Heuristic pattern checks with authentic quoted evidence
    if (/(biaya|deposit|uang muka|bayar pendaftaran|transfer dulu|administrasi)\b/i.test(lower)) {
      const match = rawChat.match(/([^\.\n]*?(biaya|deposit|uang muka|administrasi)[^\.\n]*)/i);
      indicators.push({
        type: 'advance_fee',
        title: 'Permintaan Biaya di Muka (Advance Fee)',
        severity: 'high',
        weight: 30,
        source: 'ai',
        evidence: match ? match[0].trim() : 'biaya administrasi / deposit',
        description: 'Pelaku mewajibkan korban membayar sejumlah uang di awal sebelum pekerjaan atau hadiah diberikan.',
      });
    }

    if (/(kode otp|kirimkan otp|sms 6 digit|pin anda|kode rahasia)\b/i.test(lower)) {
      const match = rawChat.match(/([^\.\n]*?(otp|pin|digit)[^\.\n]*)/i);
      indicators.push({
        type: 'otp_request',
        title: 'Permintaan Kode Rahasia / OTP (Kritis)',
        severity: 'high',
        weight: 70,
        source: 'ai',
        evidence: match ? match[0].trim() : 'permintaan OTP / PIN',
        description: 'Tuntutan penyerahan kode otentikasi rahasia untuk membajak rekening atau akun.',
      });
    }

    if (/(\.apk|unduh aplikasi|instal file|resi_paket|undangan.*apk)\b/i.test(lower)) {
      const match = rawChat.match(/([^\.\n]*?(\.apk|instal|unduh)[^\.\n]*)/i);
      indicators.push({
        type: 'apk_malware',
        title: 'Penyebaran Berkas Malware Android (.APK)',
        severity: 'high',
        weight: 35,
        source: 'ai',
        evidence: match ? match[0].trim() : 'File berkas .apk',
        description: 'Manipulasi agar korban menginstal aplikasi trojan penguras SMS/OTP perbankan.',
      });
    }

    if (/(komisi \d+|gaji.*per hari|ratusan ribu|jutaan rupiah|like.*subscribe|fleksibel dari rumah)\b/i.test(lower)) {
      const match = rawChat.match(/([^\.\n]*?(komisi|gaji|juta|like)[^\.\n]*)/i);
      indicators.push({
        type: 'unrealistic_offer',
        title: 'Penawaran Pendapatan / Komisi Tidak Wajar',
        severity: 'medium',
        weight: 15,
        source: 'ai',
        evidence: match ? match[0].trim() : 'komisi / penawaran tidak wajar',
        description: 'Imbalan fantastis untuk tugas sepele adalah pola utama penipuan kerja paruh waktu.',
      });
    }

    if (/(segera|hanya hari ini|slot terbatas|dalam \d+ menit|sebelum hangus|dibatalkan)\b/i.test(lower)) {
      const match = rawChat.match(/([^\.\n]*?(segera|slot|terbatas|hari ini)[^\.\n]*)/i);
      indicators.push({
        type: 'time_pressure',
        title: 'Manipulasi Psikologis Urgensi / Tekanan Waktu',
        severity: 'medium',
        weight: 15,
        source: 'ai',
        evidence: match ? match[0].trim() : 'tekanan waktu',
        description: 'Menciptakan kepanikan agar korban tidak sempat berpikir logis atau berkonsultasi.',
      });
    }

    if (/(kami dari|resmi shopee|pihak bank|petugas kepolisian|kurir j&t|ekspedisi)\b/i.test(lower)) {
      const match = rawChat.match(/([^\.\n]*?(kami dari|shopee|bank|j&t|ekspedisi)[^\.\n]*)/i);
      indicators.push({
        type: 'impersonation_data',
        title: 'Pencatutan Identitas Institusi / Pihak Resmi',
        severity: 'high',
        weight: 30,
        source: 'ai',
        evidence: match ? match[0].trim() : 'pencatutan instansi',
        description: 'Mengaku sebagai perwakilan organisasi terpercaya untuk membangun kredibilitas palsu.',
      });
    }

    // AI Check status
    if (mode === 'ai_failed' || mode === 'all_failed') {
      checks.push({
        name: 'claude_ai_reasoning',
        status: 'failed',
        note: 'Layanan penalaran semantik Claude AI mengalami gangguan. Status beralih ke partial.',
      });
    } else {
      checks.push({
        name: 'claude_ai_reasoning',
        status: 'completed',
        note: 'Ekstraksi pola manipulasi bahasa & validasi bukti teks selesai',
      });
    }

    return this.calculateFinalRisk('chat', maskedText, indicators, checks);
  }

  /**
   * Deterministik Risk Calculation per Blueprint Section 10
   */
  private static calculateFinalRisk(
    type: 'url' | 'chat',
    input: string,
    indicators: Indicator[],
    checks: PipelineCheck[]
  ): AnalysisResult {
    const rawScore = indicators.reduce((acc, curr) => acc + curr.weight, 0);
    const riskScore = Math.min(100, rawScore);

    const hasFailedCheck = checks.some((c) => c.status === 'failed');
    const isPartial = hasFailedCheck;

    let riskLevel: RiskLevel = 'low';
    let categoryReason: CategoryReason = 'score';

    // Critical Overrides
    const hasCritical = indicators.some((ind) => ind.type === 'safe_browsing_match' || ind.type === 'otp_request' || ind.type === 'apk_malware');

    if (hasCritical || riskScore >= 60) {
      riskLevel = 'high';
      categoryReason = hasCritical ? 'critical_indicator' : 'score';
    } else if (riskScore >= 30) {
      riskLevel = 'review';
      categoryReason = 'score';
    } else {
      // Rule: Never assign 'low' if external checks failed
      if (isPartial) {
        riskLevel = 'review';
        categoryReason = 'partial_data';
      } else {
        riskLevel = 'low';
        categoryReason = 'score';
      }
    }

    // Determine Scam Type
    let scamType: ScamType = 'unknown';
    if (indicators.some((i) => i.type === 'apk_malware' || i.type === 'malicious_apk_download')) scamType = 'apk_malware';
    else if (indicators.some((i) => i.type === 'fake_giveaway_content')) scamType = 'giveaway_scam';
    else if (indicators.some((i) => i.type === 'credential_harvesting_form')) scamType = 'phishing';
    else if (indicators.some((i) => i.type === 'brand_in_subdomain' || i.type === 'safe_browsing_match')) scamType = 'phishing';
    else if (indicators.some((i) => i.type === 'unrealistic_offer' || i.type === 'advance_fee')) scamType = 'job_scam';
    else if (indicators.some((i) => i.type === 'otp_request')) scamType = 'banking_fraud';
    else if (indicators.some((i) => i.type === 'impersonation_data')) scamType = 'impersonation';

    // Concrete Recommended Actions
    const recommendedActions: string[] = [];
    if (riskLevel === 'high') {
      recommendedActions.push('Jangan pernah mengeklik tautan, mentransfer dana, atau mengunduh berkas apa pun.');
      recommendedActions.push('Blokir nomor kontak dan laporkan akun melalui fitur pelaporan aplikasi.');
      if (indicators.some((i) => i.type === 'otp_request')) {
        recommendedActions.push('Segera amankan akun rekening bank atau dompet digital Anda dan hubungi call center resmi bank.');
      }
    } else if (riskLevel === 'review') {
      recommendedActions.push('Lakukan verifikasi silang (cross-check) melalui kontak resmi perusahaan.');
      recommendedActions.push('Hindari memberikan data identitas diri (KTP, nomor rekening, alamat rumah).');
    } else {
      recommendedActions.push('Tetap terapkan kebiasaan digital yang aman saat berinteraksi daring.');
      recommendedActions.push('Waspadai apabila di tengah percakapan pengirim tiba-tiba meminta data rahasia.');
    }

    // Limitations
    const limitations = [
      'Hasil evaluasi merupakan indikasi risiko berdasarkan aturan dan data latih, bukan vonis atau jaminan hukum.',
      'Perayapan konten web dilakukan dalam sandbox statis terisolasi tanpa eksekusi skrip aktif klien demi keamanan pengujian.',
    ];
    if (isPartial) {
      limitations.push('Pemeriksaan eksternal mengalami kendala parsial; rekomendasi didasarkan pada aturan lokal.');
    }

    const explanation = riskLevel === 'high'
      ? 'Ditemukan bukti kuat manipulasi rekayasa sosial atau ancaman siber yang terkonfirmasi pada masukan Anda.'
      : riskLevel === 'review'
        ? 'Terdapat anomali atau data belum cukup komprehensif untuk memastikan keamanan pesan/tautan ini.'
        : 'Tidak ditemukan indikator ancaman umum dalam batas kemampuan analisis heuristik saat ini.';

    return {
      analysis_status: isPartial ? 'partial' : 'complete',
      analysis_type: type,
      input_sanitized: input,
      risk_level: riskLevel,
      raw_score: rawScore,
      risk_score: riskScore,
      category_reason: categoryReason,
      scam_type: scamType,
      indicators,
      checks,
      explanation,
      recommended_actions: recommendedActions,
      limitations,
      timestamp: new Date().toISOString(),
      is_simulation: true,
    };
  }
}

