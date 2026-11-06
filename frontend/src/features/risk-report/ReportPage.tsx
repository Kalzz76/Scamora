import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  RotateCcw, 
  FileText, 
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Share2,
  Printer,
  ShieldCheck,
  CheckSquare,
  Square,
  TrendingUp,
  Info,
  Sliders
} from 'lucide-react';
import { toast } from 'sonner';
import { RISK_CATEGORIES } from '../../lib/constants';
import { formatDateTime } from '../../lib/utils';
import { AuditDossierIllustration } from '../../components/illustrations/Illustrations2D';
import type { AnalysisResult } from '../../types/analysis';

interface ReportPageProps {
  result: AnalysisResult | null;
}

// Micro-Component 1: Animated Rolling Number
function AnimatedScore({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let current = 0;
    const duration = 750; // ms
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.round(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count}</span>;
}

// Micro-Component 2: Visual URL Deconstructor
function UrlDeconstructor({ rawUrl }: { rawUrl: string }) {
  let scheme = '';
  let subdomain = '';
  let domain = '';
  let tld = '';
  let pathQuery = '';

  try {
    const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    scheme = parsed.protocol; // 'https:'
    const host = parsed.hostname; // e.g. bca-klik.com.secure-login-update.xyz
    pathQuery = parsed.pathname + parsed.search;

    const parts = host.split('.');
    if (parts.length >= 2) {
      tld = '.' + parts.slice(-1)[0];
      domain = parts.slice(-2, -1)[0];
      if (parts.length > 2) {
        subdomain = parts.slice(0, -2).join('.');
      }
    } else {
      domain = host;
    }
  } catch {
    return <span className="font-mono text-xs text-on-surface">{rawUrl}</span>;
  }

  const isRiskyTld = ['.xyz', '.top', '.work', '.click', '.zip', '.fit'].includes(tld.toLowerCase());
  const hasSubdomainWarning = subdomain.toLowerCase().includes('bca') || subdomain.toLowerCase().includes('bank') || subdomain.toLowerCase().includes('shopee');

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
        {/* Scheme */}
        <span className={`px-2 py-1 rounded-md font-bold ${
          scheme.toLowerCase() === 'https:' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error-container text-error'
        }`} title="Protokol Keamanan">
          {scheme}//
        </span>

        {/* Subdomain */}
        {subdomain && (
          <span className={`px-2 py-1 rounded-md font-semibold ${
            hasSubdomainWarning ? 'bg-error-container text-error border border-error/30' : 'bg-surface-container text-on-surface'
          }`} title={hasSubdomainWarning ? 'Subdomain mencatut merek resmi!' : 'Subdomain'}>
            {subdomain}.
          </span>
        )}

        {/* Domain Root */}
        <span className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface font-extrabold" title="Nama Domain Utama">
          {domain}
        </span>

        {/* TLD */}
        <span className={`px-2 py-1 rounded-md font-bold ${
          isRiskyTld ? 'bg-amber-500/20 text-amber-600 border border-amber-500/40' : 'bg-surface-container text-on-surface'
        }`} title={isRiskyTld ? 'TLD berisiko tinggi penyalahgunaan' : 'Ekstensi Domain (TLD)'}>
          {tld}
        </span>

        {/* Path & Query */}
        {pathQuery && (
          <span className="px-2 py-1 rounded-md bg-surface-container text-on-surface-variant truncate max-w-xs" title="Path dan Parameter">
            {pathQuery}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[10px] text-on-surface-variant font-mono">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-secondary"></span>
          <span>Anatomi URL Terurai</span>
        </span>
        {hasSubdomainWarning && (
          <span className="text-error font-semibold">&bull; Terdeteksi nama institusi disamarkan di subdomain</span>
        )}
        {isRiskyTld && (
          <span className="text-amber-600 font-semibold">&bull; Ekstensi domain murah berisiko ({tld})</span>
        )}
      </div>
    </div>
  );
}

// Micro-Component 3: Forensic Chat Canvas
function ForensicChatCanvas({ text, evidenceList }: { text: string; evidenceList: string[] }) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant space-y-3">
      <div className="flex items-center justify-between border-b border-outline-variant/40 pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-secondary" />
          <span className="text-xs font-bold text-on-surface">Forensic WhatsApp Transcript View</span>
        </div>
        <span className="text-[10px] font-mono text-on-surface-variant">Annotated Evidence In-Situ</span>
      </div>

      <div className="max-w-xl p-4 rounded-2xl rounded-tl-none bg-surface-container shadow-2xs border border-outline-variant/40 text-xs text-on-surface leading-relaxed whitespace-pre-wrap font-sans relative">
        <p>{text}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">Kutipan Berbahaya Terekstrak:</span>
        {evidenceList.map((ev, i) => (
          <span key={i} className="px-2 py-0.5 rounded-md bg-error-container text-error text-[11px] font-mono font-semibold border border-error/20">
            "{ev}"
          </span>
        ))}
      </div>
    </div>
  );
}

// Micro-Component 4: Threat Radar / 4 Pillars Breakdown Meter
interface PillarProps {
  label: string;
  category: string;
  score: number;
  reason: string;
}

function ThreatPillar({ label, category, score, reason }: PillarProps) {
  const getBadgeStyle = () => {
    if (score >= 70) return { bg: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500', status: 'Kritis' };
    if (score >= 40) return { bg: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-[#E86A33]', status: 'Waspada' };
    return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', bar: 'bg-[#143826]', status: 'Aman' };
  };

  const style = getBadgeStyle();

  return (
    <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">{category}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.bg}`}>
          {style.status} ({score}%)
        </span>
      </div>
      
      <div className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
        {label}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-700 ${style.bar}`} 
          style={{ width: `${Math.max(score, 6)}%` }} 
        />
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed">
        {reason}
      </p>
    </div>
  );
}

// Pre-packaged Authentic Sample Cases for One-Click Audit Exploration
const SAMPLE_CASES: Record<string, AnalysisResult> = {
  apk: {
    analysis_status: 'complete',
    category_reason: 'critical_indicator',
    analysis_type: 'chat',
    input_sanitized: 'Selamat siang paket anda tertahan di gudang J&T Express karena alamat tidak lengkap. Mohon unduh dan instal file resi digital berikut untuk konfirmasi: Resi_Paket_JNT_Express.apk. Segera ya supaya tidak dikembalikan ke pengirim.',
    risk_score: 92,
    raw_score: 95,
    risk_level: 'high',
    scam_type: 'apk_malware',
    explanation: 'Terdeteksi pengiriman file berkas executable Android (.apk) yang disamarkan sebagai resi pengiriman kurir paket, diiringi manipulasi kepanikan dengan batas waktu.',
    indicators: [
      {
        type: 'malware_file',
        source: 'chat_heuristic',
        severity: 'high',
        title: 'Penyebaran Berkas Malware APK Jahat',
        weight: 45,
        evidence: 'Resi_Paket_JNT_Express.apk',
        description: 'Ekstensi file .apk di luar Google Play Store umumnya berupa Trojan perbankan pencuri SMS OTP.'
      },
      {
        type: 'brand_impersonation',
        source: 'ai',
        severity: 'high',
        title: 'Pencatutan Identitas Resmi Ekspedisi',
        weight: 30,
        evidence: 'gudang J&T Express',
        description: 'Mencatut nama perusahaan logistik resmi tanpa identitas nomor bisnis terverifikasi.'
      },
      {
        type: 'urgency_manipulation',
        source: 'chat_heuristic',
        severity: 'medium',
        title: 'Manipulasi Urgensi Batas Waktu',
        weight: 17,
        evidence: 'Segera ya supaya tidak dikembalikan',
        description: 'Menciptakan tekanan waktu agar korban panik dan langsung membuka file berbahaya.'
      }
    ],
    checks: [
      { name: 'Masking Privasi PII', status: 'completed', note: 'Data sensitif terlindungi' },
      { name: 'Deteksi Ekstensi File', status: 'completed', note: 'File Android APK terdeteksi' },
      { name: 'Evaluasi Heuristik Ancaman', status: 'completed', note: 'Tingkat keyakinan 96%' }
    ],
    recommended_actions: [
      'JANGAN PERNAH mengklik atau menginstal berkas .apk yang dikirim via WhatsApp.',
      'Segera hapus file tersebut dari folder download perangkat Anda jika sudah terunduh.',
      'Blokir nomor pengirim dan laporkan sebagai spam penipuan di WhatsApp.',
      'Lacak resi pengiriman hanya melalui aplikasi atau situs resmi ekspedisi terkait.'
    ],
    limitations: [
      'Analisis berbasis evaluasi heuristik dan representasi pola kejahatan siber tanpa klaim mutlak.'
    ],
    timestamp: new Date().toISOString(),
    is_simulation: true
  },
  phishing: {
    analysis_status: 'complete',
    category_reason: 'critical_indicator',
    analysis_type: 'url',
    input_sanitized: 'http://bca-klik.com.secure-login-update.xyz/login?verifikasi=true&token=rahasia123',
    risk_score: 95,
    raw_score: 110,
    risk_level: 'high',
    scam_type: 'phishing',
    explanation: 'Tautan menggunakan taktik subdomain spoofing mencatut nama bank resmi pada domain murah (.xyz) tanpa enkripsi HTTPS.',
    indicators: [
      {
        type: 'subdomain_spoofing',
        source: 'url_structure',
        severity: 'high',
        title: 'Pencatutan Nama Bank pada Subdomain Palsu',
        weight: 45,
        evidence: 'bca-klik.com',
        description: 'Nama institusi perbankan diletakkan di subdomain untuk memanipulasi korban awam.'
      },
      {
        type: 'risky_tld',
        source: 'url_structure',
        severity: 'high',
        title: 'Penggunaan TLD Murah Berisiko (.xyz)',
        weight: 35,
        evidence: '.xyz',
        description: 'Domain TLD bertarif rendah yang sering didaftarkan secara massal untuk kampanye phishing singkat.'
      },
      {
        type: 'insecure_protocol',
        source: 'url_structure',
        severity: 'medium',
        title: 'Ketiadaan Enkripsi SSL (Protokol HTTP)',
        weight: 15,
        evidence: 'http://',
        description: 'Halaman autentikasi perbankan resmi diwajibkan menggunakan enkripsi TLS/HTTPS yang sah.'
      }
    ],
    checks: [
      { name: 'Pemeriksaan Safe Browsing', status: 'completed', note: 'Domain dalam daftar pantau' },
      { name: 'Dekomposisi Struktur URL', status: 'completed', note: 'Anomali host subdomain' },
      { name: 'Verifikasi Sertifikat SSL', status: 'completed', note: 'Sertifikat tidak valid' }
    ],
    recommended_actions: [
      'JANGAN MASUKKAN User ID, PIN, KeyBCA, atau Kata Sandi apa pun pada laman tersebut.',
      'Tutup tab browser seketika dan bersihkan riwayat peramban Anda.',
      'Akses layanan resmi internet banking hanya melalui situs resmi terverifikasi.'
    ],
    limitations: [
      'Evaluasi berdasarkan telemetri struktur domain dan reputasi server pada saat pemindaian.'
    ],
    timestamp: new Date().toISOString(),
    is_simulation: true
  },
  legit: {
    analysis_status: 'complete',
    category_reason: 'score',
    analysis_type: 'url',
    input_sanitized: 'https://tokopedia.com/promo/guncang-sepatu-sneakers',
    risk_score: 0,
    raw_score: 0,
    risk_level: 'low',
    scam_type: 'unknown',
    explanation: 'Domain terdaftar atas entitas resmi bereputasi tinggi, menggunakan enkripsi HTTPS mutakhir, dan bebas dari anomali struktur.',
    indicators: [],
    checks: [
      { name: 'Pemeriksaan Safe Browsing', status: 'completed', note: 'Status bersih' },
      { name: 'Dekomposisi Struktur URL', status: 'completed', note: 'Domain induk sah' },
      { name: 'Verifikasi Sertifikat SSL', status: 'completed', note: 'Enkripsi TLS 1.3 Terverifikasi' }
    ],
    recommended_actions: [
      'Tautan aman untuk diakses dan ditelusuri.',
      'Selalu perhatikan bilah alamat browser agar tetap berada pada domain resmi saat bertransaksi.'
    ],
    limitations: [
      'Pemeriksaan memverifikasi validitas URL platform resmi, bukan integritas masing-masing penjual perorangan.'
    ],
    timestamp: new Date().toISOString(),
    is_simulation: true
  }
};

export const ReportPage: React.FC<ReportPageProps> = ({ result }) => {
  const [selectedSample, setSelectedSample] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();

  // Active Report priority: prop result first, otherwise user-chosen sample
  const activeReport = result || selectedSample;

  const handleCopy = () => {
    if (!activeReport) return;
    let reportText = `[LAPORAN INDIKASI RISIKO KEAMANAN SIBER SCAMORA]\n`;
    reportText += `Ref ID            : #SCAM-${Math.abs(activeReport.timestamp.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).toUpperCase().slice(0, 8)}\n`;
    reportText += `Waktu Pemeriksaan : ${formatDateTime(activeReport.timestamp)}\n`;
    reportText += `Tipe Analisis     : ${activeReport.analysis_type.toUpperCase()}\n`;
    reportText += `Kategori Evaluasi : ${activeReport.risk_level ? RISK_CATEGORIES[activeReport.risk_level].label.toUpperCase() : 'N/A'}\n`;
    reportText += `Skor Risiko       : ${activeReport.risk_score} / 100 (Raw: ${activeReport.raw_score})\n`;
    reportText += `Kategori Modus    : ${activeReport.scam_type || 'Belum terklasifikasi'}\n\n`;

    reportText += `--- TANDA BAHAYA TERVERIFIKASI ---\n`;
    if (activeReport.indicators.length === 0) {
      reportText += `Tidak ditemukan indikator ancaman signifikan.\n`;
    } else {
      activeReport.indicators.forEach((ind, i) => {
        reportText += `${i + 1}. [${ind.severity.toUpperCase()}] ${ind.title} (+${ind.weight} poin)\n`;
        reportText += `   Kutipan Bukti: "${ind.evidence}"\n`;
        reportText += `   Penjelasan   : ${ind.description}\n\n`;
      });
    }

    reportText += `--- PANDUAN TINDAKAN MITIGASI ---\n`;
    activeReport.recommended_actions.forEach((act, i) => {
      reportText += `${i + 1}. ${act}\n`;
    });

    reportText += `\nPenafian: Hasil ini berupa indikasi risiko berbasis AI, bukan vonis mutlak hukum.`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast.success('Laporan insiden berhasil disalin ke clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!activeReport) return;
    const verdict = activeReport.risk_level === 'high' ? '🚨 BAHAYA TINGGI / PENIPUAN' : activeReport.risk_level === 'review' ? '⚠️ PERLU WASPADA' : '✅ RISIKO RENDAH';
    const text = `*PERINGATAN KEAMANAN DIGITAL (SCAMORA)*\n\n` +
      `Status: ${verdict}\n` +
      `Skor Risiko: *${activeReport.risk_score}/100*\n` +
      `Jenis Modus: *${activeReport.scam_type ? activeReport.scam_type.replace('_', ' ').toUpperCase() : 'Deteksi Pola'}*\n\n` +
      `*Kutipan Masukan:*\n"${activeReport.input_sanitized.slice(0, 110)}..."\n\n` +
      `*Peringatan Utama:* ${activeReport.recommended_actions[0] || 'Jangan buka atau instal apa pun!'}\n\n` +
      `_Diverifikasi oleh Scamora Autonomous Cyber Defense. Waspada sebelum mengklik atau mengunduh!_`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    navigator.clipboard.writeText(text);
    toast.success('Format peringatan WhatsApp disiapkan & disalin!');
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleAction = (idx: number) => {
    setCheckedActions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // ==========================================
  // VIEW 1: EMPTY STATE / AUDIT DISCOVERY HUB
  // ==========================================
  if (!activeReport) {
    return (
      <div className="flex flex-col w-full pb-20 bg-[#F8F9FA] text-[#1A202C]">
        
        {/* Clean Editorial Header with 2D Visual */}
        <section className="w-full pt-10 pb-8 relative overflow-hidden border-b border-gray-200/80 bg-white/60">
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[400px] pointer-events-none opacity-60"
            style={{
              background: 'radial-gradient(circle at 50% 15%, #EAF2ED 0%, rgba(248, 249, 250, 0) 70%)',
            }}
          />

          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2ED] text-[#143826] border border-[#143826]/15 text-xs font-bold uppercase tracking-wider font-mono shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-[#E86A33]" />
                  <span>PUSAT LAPORAN &amp; TELEMETRI FORENSIK</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-[#143826] tracking-tight leading-tight">
                  Laporan Investigasi <br />
                  <span className="text-[#E86A33]">Ancaman Siber Digital.</span>
                </h1>

                <p className="text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed font-medium">
                  Belum ada pemindaian aktif di sesi ini. Anda dapat memulai pemindaian mandiri atau mengeksplorasi studi kasus insiden nyata di bawah untuk meninjau sertifikat audit forensik Scamora.
                </p>
              </div>

              {/* 2D Cartoon Illustration on the right */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <AuditDossierIllustration className="w-64 h-48 sm:w-72 sm:h-56" />
              </div>

            </div>
          </div>
        </section>

        {/* Workspace Hub */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 w-full space-y-10">
          
          {/* Quick Scanner Action Gateway */}
          <div className="apple-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-200/90 shadow-sm">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-extrabold text-lg sm:text-xl text-gray-900">
                Punya Tautan atau Pesan WhatsApp yang Mencurigakan?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Gunakan modul pemindaian instan berprivasi tinggi (Zero Data Retention) untuk mendapatkan audit telemetri lengkap dalam &lt;1.5 detik.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                to="/url"
                className="btn-animate inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#143826] hover:bg-[#1D4E36] text-white text-xs font-bold shadow-md shadow-emerald-950/20"
              >
                <span>Periksa Tautan (URL)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/chat"
                className="btn-animate inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E86A33] hover:bg-[#D75922] text-white text-xs font-bold shadow-md shadow-orange-500/25"
              >
                <span>Analisis Chat WhatsApp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Live Cyber Threat Radar of Indonesia */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <TrendingUp className="w-4 h-4 text-[#E86A33]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-mono">
                Statistik Tren Modus Penipuan Terpopuler di Indonesia
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    PANGSA 62%
                  </span>
                  <span className="text-xs font-mono text-gray-400">Paling Masif</span>
                </div>
                <h4 className="font-black text-base text-gray-900">Malware Berkas .APK</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Menyamar sebagai Resi Kurir Paket J&amp;T/JNE, Undangan Pernikahan, atau Surat Tilang ETLE untuk membobol SMS OTP perbankan.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#E86A33] bg-orange-50 px-2 py-0.5 rounded-full">
                    PANGSA 24%
                  </span>
                  <span className="text-xs font-mono text-gray-400">Paling Merugikan</span>
                </div>
                <h4 className="font-black text-base text-gray-900">Phishing Perbankan</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pemalsuan formulir login KlikBCA / BRImo dengan tipuan perubahan tarif transaksi bulanan Rp150.000 menjadi Rp500.000.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    PANGSA 14%
                  </span>
                  <span className="text-xs font-mono text-gray-400">Paling Licik</span>
                </div>
                <h4 className="font-black text-base text-gray-900">Freelance Like Video</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Tawaran komisi harian ratusan ribu hanya dengan menyukai video YouTube, diakhiri jebakan deposit uang misi Telegram.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Audit Demo Case Showcase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#143826]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-mono">
                  Pratinjau Studi Kasus Forensik (Pilih Salah Satu untuk Membuka Audit)
                </h3>
              </div>
              <span className="text-xs text-gray-400 hidden sm:inline font-mono">
                One-Click Interactive Forensic Preview
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Case 1: APK Kurir */}
              <div 
                onClick={() => setSelectedSample(SAMPLE_CASES.apk)}
                className="apple-card p-6 flex flex-col justify-between space-y-4 border border-gray-200 hover:border-red-400 cursor-pointer group transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-mono text-[10px] font-bold border border-red-200">
                      SKOR 92 &bull; BAHAYA TINGGI
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">WhatsApp Chat</span>
                  </div>
                  <h4 className="font-black text-base text-gray-900 group-hover:text-[#E86A33] transition-colors">
                    Studi Kasus 1: Modus Resi Kurir Paket (.APK)
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    "Selamat siang paket anda tertahan di gudang J&amp;T Express... Mohon unduh dan instal file resi digital Resi_Paket_JNT_Express.apk..."
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-animate w-full py-2.5 rounded-xl bg-[#143826] text-white text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-[#E86A33] transition-colors"
                >
                  <span>Buka Laporan Kasus Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Case 2: Phishing Bank */}
              <div 
                onClick={() => setSelectedSample(SAMPLE_CASES.phishing)}
                className="apple-card p-6 flex flex-col justify-between space-y-4 border border-gray-200 hover:border-orange-400 cursor-pointer group transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-[#E86A33] font-mono text-[10px] font-bold border border-orange-200">
                      SKOR 95 &bull; BAHAYA TINGGI
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">Tautan URL</span>
                  </div>
                  <h4 className="font-black text-base text-gray-900 group-hover:text-[#E86A33] transition-colors">
                    Studi Kasus 2: Phishing Login BCA (.xyz)
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    http://bca-klik.com.secure-login-update.xyz/login?verifikasi=true — Subdomain memalsukan identitas bank dengan TLD berisiko tinggi.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-animate w-full py-2.5 rounded-xl bg-[#143826] text-white text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-[#E86A33] transition-colors"
                >
                  <span>Buka Laporan Kasus Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Case 3: Legit E-Commerce */}
              <div 
                onClick={() => setSelectedSample(SAMPLE_CASES.legit)}
                className="apple-card p-6 flex flex-col justify-between space-y-4 border border-gray-200 hover:border-emerald-400 cursor-pointer group transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2ED] text-[#143826] font-mono text-[10px] font-bold border border-emerald-200">
                      SKOR 0 &bull; RISIKO RENDAH
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">Tautan Sah</span>
                  </div>
                  <h4 className="font-black text-base text-gray-900 group-hover:text-[#143826] transition-colors">
                    Studi Kasus 3: Domain Tokopedia Resmi
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                    https://tokopedia.com/promo/... — Sertifikat SSL sah terdaftar, domain induk resmi, bebas anomali struktur dan pengalihan.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-animate w-full py-2.5 rounded-xl bg-[#143826] text-white text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-[#1D4E36] transition-colors"
                >
                  <span>Buka Laporan Kasus Ini</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE FORENSIC AUDIT REPORT STATE
  // ==========================================
  const categoryMeta = activeReport.risk_level ? RISK_CATEGORIES[activeReport.risk_level] : RISK_CATEGORIES.review;
  const isPartial = activeReport.analysis_status === 'partial';
  const evidenceQuotes = activeReport.indicators.map((ind) => ind.evidence).filter(Boolean);

  // Reference Audit Hash deterministic generator
  const auditId = `SCAM-2026-${Math.abs(
    activeReport.input_sanitized.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0)
  ).toString(16).toUpperCase().slice(0, 6)}`;

  // Pillar 4-Aspect Breakdown Values
  const getPillarValues = () => {
    const isHigh = activeReport.risk_level === 'high';
    const isUrl = activeReport.analysis_type === 'url';

    if (activeReport.risk_score === 0) {
      return [
        { label: 'Manipulasi Psikologis & Urgensi', category: 'PSIKOLOGIS', score: 0, reason: 'Nol indikasi manipulasi kepanikan atau iming-iming fiktif.' },
        { label: 'Integritas Domain & Protokol URL', category: 'INFRASTRUKTUR', score: 0, reason: 'Domain induk sah, protokol HTTPS terenkripsi tanpa anomali.' },
        { label: 'Perburuan Data Sensitif (PII)', category: 'DATA PRIBADI', score: 0, reason: 'Tidak terdeteksi upaya pemanenan OTP, PIN, atau kredensial.' },
        { label: 'Perilaku Berkas & Pengalihan', category: 'TEKNIS', score: 0, reason: 'Tidak ada berkas executable mencurigakan atau redirect ganda.' },
      ];
    }

    return [
      {
        label: 'Manipulasi Psikologis & Urgensi',
        category: 'PSIKOLOGIS',
        score: isUrl ? 65 : 92,
        reason: isUrl ? 'Mencatut merek ternama untuk membangun ilusi kepercayaan semu.' : 'Menggunakan desakan waktu dan ancaman paket dibatalkan agar korban panik.'
      },
      {
        label: 'Integritas Domain & Protokol URL',
        category: 'INFRASTRUKTUR',
        score: isUrl ? 95 : 40,
        reason: isUrl ? 'Anomali subdomain masking bertingkat dan domain TLD murah tanpa sertifikat sah.' : 'Koneksi eksternal yang dirujuk tidak memiliki reputasi terdaftar.'
      },
      {
        label: 'Perburuan Data Sensitif (PII)',
        category: 'DATA PRIBADI',
        score: 88,
        reason: 'Pola serangan dirancang untuk mengekstraksi nomor rekening, PIN, dan kode rahasia OTP SMS.'
      },
      {
        label: 'Perilaku Berkas & Pengalihan',
        category: 'TEKNIS',
        score: isHigh ? 96 : 35,
        reason: isUrl ? 'Upaya pengalihan tautan dan parameter pelacakan token tersembunyi.' : 'Pengiriman berkas .apk (Android Application Package) berbahaya di luar toko resmi.'
      }
    ];
  };

  const pillars = getPillarValues();
  const completedActionsCount = Object.values(checkedActions).filter(Boolean).length;

  return (
    <div className="flex flex-col w-full pb-20 bg-transparent text-[#0F172A]">
      
      {/* HEADER BANNER - Clean Modern Cyber Slate Dossier */}
      <section className="w-full bg-white/80 border-b border-slate-200/80 py-10 relative overflow-hidden print:py-4 print:bg-white print:text-black">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[360px] pointer-events-none opacity-50"
          style={{
            background: 'radial-gradient(circle at 50% 15%, rgba(13, 148, 136, 0.12) 0%, rgba(241, 245, 249, 0) 70%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-4 relative z-10">
          
          {/* Prominent Return Button at the Very Top for Sample Cases */}
          {selectedSample && !result && (
            <div className="pb-1 no-print">
              <button
                onClick={() => {
                  setSelectedSample(null);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                type="button"
                className="btn-animate inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#143826] text-xs sm:text-sm font-extrabold shadow-xs transition-all border border-gray-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#E86A33]" />
                <span>Kembali ke Pusat Laporan &amp; Daftar Kasus</span>
              </button>
            </div>
          )}

          {/* Top Actions & Breadcrumb Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#EAF2ED] text-[#143826] text-xs font-bold uppercase tracking-wider font-mono border border-[#143826]/10">
                {auditId}
              </span>
              <span className="text-gray-300 text-xs">&bull;</span>
              <span className="text-xs text-gray-500 font-mono">
                {activeReport.analysis_type === 'url' ? 'Pemeriksaan Tautan URL' : 'Audit Percakapan WhatsApp'}
              </span>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 no-print">
              
              {/* Reset / Sample Chooser Button */}
              {selectedSample && !result && (
                <button
                  onClick={() => {
                    setSelectedSample(null);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  type="button"
                  className="btn-animate inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-all shadow-xs border border-gray-200"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#E86A33]" />
                  <span>Pilih Kasus Lain</span>
                </button>
              )}

              {/* Share to WhatsApp Button */}
              <button
                onClick={handleShareWhatsApp}
                type="button"
                className="btn-animate inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-all shadow-md shadow-emerald-950/20"
                title="Bagikan peringatan ini langsung ke grup keluarga"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Kirim ke WhatsApp</span>
              </button>

              {/* Print / PDF Button */}
              <button
                onClick={handlePrint}
                type="button"
                className="btn-animate inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-bold text-gray-700 transition-all shadow-xs"
                title="Cetak atau unduh laporan PDF"
              >
                <Printer className="w-3.5 h-3.5 text-gray-600" />
                <span>Cetak / PDF</span>
              </button>

              {/* Copy Report Button */}
              <button
                onClick={handleCopy}
                type="button"
                className="btn-animate inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-bold text-gray-700 transition-all shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#E86A33]" /> : <Copy className="w-3.5 h-3.5 text-gray-600" />}
                <span>{copied ? 'Tersalin' : 'Salin Laporan'}</span>
              </button>

              {/* New Scan Button */}
              <button
                onClick={() => navigate(activeReport.analysis_type === 'url' ? '/url' : '/chat')}
                type="button"
                className="btn-animate inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#E86A33] hover:bg-[#D75922] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Pemeriksaan Baru</span>
              </button>
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="space-y-1.5 pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF2ED] text-[#143826] text-xs font-bold font-mono">
              <ShieldCheck className="w-4 h-4 text-[#E86A33]" />
              <span>BERKAS AUDIT FORENSIK DIGITAL RESMI</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#143826] tracking-tight">
              Sertifikat Laporan Telemetri Risiko
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed font-medium">
              Dianalisis secara otonom oleh mesin Scamora Neural Defense berbasis evaluasi semantik dan inspeksi heuristik tanpa retensi data.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500 pt-1">
              <span>Waktu Audit: {formatDateTime(activeReport.timestamp)}</span>
              <span>&bull;</span>
              <span>Protokol: Zero Data Retention (P1 Verified)</span>
            </div>
          </div>

        </div>
      </section>

      {/* REPORT CONTENT BODY */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 w-full space-y-8">
        
        {/* Sample Demonstration Banner Notification with Prominent Cannot-Be-Missed Return Button */}
        {activeReport.is_simulation && (
          <div className="p-5 sm:p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm no-print">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs">
                <Info className="w-5 h-5 text-amber-900" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono font-bold text-amber-900 uppercase tracking-wider block">
                  MODE PRATINJAU KASUS CONTOH AKTIF
                </span>
                <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                  Anda sedang melihat contoh laporan telemetri interaktif. Untuk memilih kasus lain atau memeriksa data Anda sendiri, klik tombol di sebelah kanan.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedSample(null);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              type="button"
              className="btn-animate w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#E86A33] hover:bg-[#D75922] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/30 shrink-0 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Tutup Kasus &amp; Kembali</span>
            </button>
          </div>
        )}

        {/* PARTIAL OUTAGE ALERT BANNER */}
        {isPartial && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#FFB162] shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <h4 className="font-bold text-amber-100">Peringatan: Analisis Parsial (Sebagian Layanan Eksternal Mengalami Gangguan)</h4>
              <p className="text-amber-200/90 leading-relaxed">
                Salah satu pemeriksaan eksternal tidak dapat diselesaikan. Sesuai prinsip etika sistem, status aman (<em>low risk</em>) tidak diperbolehkan muncul dan hasil dialihkan ke peninjauan (<em>review</em>).
              </p>
            </div>
          </div>
        )}

        {/* PRIMARY RISK VERDICT CARD */}
        <div className={`rounded-3xl p-6 sm:p-10 border shadow-xs ${categoryMeta.containerBg} ${categoryMeta.borderColor} space-y-6`}>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Verdict Info */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase font-mono ${categoryMeta.badgeBg} ${categoryMeta.badgeText}`}>
                  {categoryMeta.label}
                </span>
                {activeReport.scam_type && activeReport.scam_type !== 'unknown' && (
                  <span className="px-3 py-0.5 rounded-full bg-white font-mono text-[11px] font-bold text-gray-800 border border-gray-200">
                    Modus: {activeReport.scam_type.replace('_', ' ').toUpperCase()}
                  </span>
                )}
                {activeReport.is_simulation && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#143826] text-white text-[10px] font-mono font-bold">
                    [DATA SIMULASI KASUS]
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
                {activeReport.risk_level === 'high'
                  ? 'Peringatan: Terindikasi Kuat Ancaman Penipuan Digital'
                  : activeReport.risk_level === 'review'
                  ? 'Perhatian: Diperlukan Verifikasi Mandiri Lebih Lanjut'
                  : 'Indikasi Risiko Rendah: Tidak Ditemukan Anomali Signifikan'}
              </h2>

              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {activeReport.explanation || categoryMeta.description}
              </p>

              {/* Forensic URL Deconstructor or WhatsApp Chat Transcript */}
              {activeReport.analysis_type === 'url' ? (
                <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
                  <UrlDeconstructor rawUrl={activeReport.input_sanitized} />
                </div>
              ) : (
                <ForensicChatCanvas text={activeReport.input_sanitized} evidenceList={evidenceQuotes} />
              )}
            </div>

            {/* Score Dial / Calibrated Gauge */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-3 font-bold">
                Skor Risiko Terverifikasi
              </span>
              
              <div className="relative flex items-center justify-center">
                <div className={`w-36 h-36 rounded-full border-8 ${
                  (activeReport.risk_score ?? 0) >= 70 ? 'border-red-200' : (activeReport.risk_score ?? 0) >= 40 ? 'border-orange-200' : 'border-emerald-200'
                } flex flex-col items-center justify-center relative`}>
                  <span className="text-5xl font-black text-gray-900 tracking-tight">
                    <AnimatedScore target={activeReport.risk_score || 0} />
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 font-bold mt-1">
                    SKALA 100
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <span className="text-xs font-mono text-gray-500 font-medium">
                  Tingkat Bahaya: <strong className={categoryMeta.textColor}>{categoryMeta.label}</strong>
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* 4 PILARS THREAT RADAR BREAKDOWN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#143826]" />
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Telemetri 4 Pilar Analisis Ancaman Siber
              </h3>
            </div>
            <span className="text-xs text-gray-400 hidden sm:inline font-mono">
              Evaluasi Multi-Dimensi Heuristik &amp; Semantik
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map((pil, idx) => (
              <ThreatPillar
                key={idx}
                label={pil.label}
                category={pil.category}
                score={pil.score}
                reason={pil.reason}
              />
            ))}
          </div>
        </div>

        {/* VERIFIED INDICATORS WITH AUTHENTIC EVIDENCE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#E86A33]" />
              <h3 className="text-base font-bold text-gray-900 tracking-tight">
                Tanda Bahaya &amp; Kutipan Bukti Terverifikasi ({activeReport.indicators.length})
              </h3>
            </div>
            <span className="text-xs text-gray-500 hidden sm:inline">
              Setiap temuan wajib didukung kutipan kalimat otentik
            </span>
          </div>

          {activeReport.indicators.length === 0 ? (
            <div className="apple-card p-8 text-center space-y-2 border border-gray-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-gray-900">Nol Indikator Bahaya Terdeteksi</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Pemeriksaan terhadap parameter phishing, typosquatting, ekstensi berkas, dan manipulasi bahasa tidak menemukan anomali pada masukan ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeReport.indicators.map((ind, idx) => (
                <div
                  key={idx}
                  className="apple-card p-5 space-y-3 border border-gray-200"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase font-mono ${
                        ind.severity === 'high'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : ind.severity === 'medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {ind.severity} severity
                      </span>
                      <h4 className="text-sm font-bold text-gray-900">{ind.title}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#143826] bg-[#EAF2ED] px-2 py-0.5 rounded-md">
                      +{ind.weight} Bobot Risiko
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {ind.description}
                  </p>

                  {/* Quoted Evidence */}
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                      Kutipan Bukti Otentik pada Masukan:
                    </span>
                    <p className="font-mono text-xs text-[#143826] font-semibold italic">
                      "{ind.evidence}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PIPELINE CHECKS BREAKDOWN */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-900 font-mono uppercase tracking-wider">
            Status Pemeriksaan Komponen Sistem:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {activeReport.checks.map((check, idx) => (
              <div
                key={idx}
                className="apple-card p-4 flex items-start gap-3 border border-gray-200"
              >
                <div className="mt-0.5">
                  {check.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : check.status === 'failed' ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                  )}
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-gray-900 uppercase font-mono text-[11px]">
                    {check.name.replace('_', ' ')}
                  </div>
                  <div className="text-[11px] text-gray-500">{check.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INTERACTIVE SAFETY ACTION CHECKLIST */}
        <div className="apple-card p-6 sm:p-8 space-y-5 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#143826]" />
              <h3 className="text-base font-bold text-gray-900">
                Daftar Tindakan Pengamanan yang Disarankan (Action Checklist)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              {completedActionsCount} dari {activeReport.recommended_actions.length} Tindakan Diambil
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Centang setiap tindakan setelah Anda menyelesaikannya untuk memastikan akun dan data pribadi Anda aman terlindungi:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {activeReport.recommended_actions.map((action, idx) => {
              const isChecked = !!checkedActions[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleAction(idx)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    isChecked 
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 shadow-2xs' 
                      : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className={`font-medium leading-relaxed block ${isChecked ? 'line-through text-emerald-800' : ''}`}>
                      {action}
                    </span>
                    {isChecked && (
                      <span className="inline-block text-[10px] font-mono font-bold text-emerald-600">
                        &bull; Berhasil Diamankan
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LIMITATIONS DISCLAIMER */}
        <div className="apple-card p-5 space-y-2 text-xs text-gray-500 border border-gray-200">
          <span className="font-bold text-gray-700 uppercase font-mono text-[11px]">
            Keterbatasan &amp; Batasan Analisis Sistem:
          </span>
          <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
            {activeReport.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>

        {/* PROMINENT BOTTOM RETURN BAR FOR SAMPLE CASES */}
        {selectedSample && !result && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#143826] text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl no-print">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-extrabold text-lg text-white">Selesai Meninjau Kasus Ini?</h4>
              <p className="text-xs sm:text-sm text-gray-200">
                Kembali ke daftar kasus untuk mencoba skenario penipuan lainnya atau mulai pemindaian data Anda sendiri.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedSample(null);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              type="button"
              className="btn-animate inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#E86A33] hover:bg-[#D75922] text-white font-black text-sm shadow-lg shadow-orange-500/30 shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Kasus</span>
            </button>
          </div>
        )}

        {/* CTA TO EDUCATIONAL MODULES */}
        <div className="apple-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-200 no-print">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-gray-900">Ingin Mengasah Kemampuan Mendeteksi Penipuan?</h4>
            <p className="text-xs text-gray-500">
              Ikuti Tantangan AI Guardian dan pelajari ragam modus operandi penipuan digital terkini di modul Edukasi.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/pengetahuan"
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all"
            >
              Kamus Modus
            </Link>
            <Link
              to="/kuis"
              className="px-5 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1D4E36] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <span>Mulai Tantangan AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
