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
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { RISK_CATEGORIES } from '../../lib/constants';
import { formatDateTime } from '../../lib/utils';
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

// Micro-Component 2: Visual URL Deconstructor (Anti-Slop Craft)
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
          isRiskyTld ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-surface-container text-on-surface'
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
          <span className="text-amber-300 font-semibold">&bull; Ekstensi domain murah berisiko ({tld})</span>
        )}
      </div>
    </div>
  );
}

// Micro-Component 3: Forensic Chat Canvas (Anti-Slop Craft)
function ForensicChatCanvas({ text, evidenceList }: { text: string; evidenceList: string[] }) {
  // Render highlighted spans
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
        <p>
          {text}
        </p>
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

export const ReportPage: React.FC<ReportPageProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-secondary mx-auto">
          <FileText className="w-8 h-8 text-secondary" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">Belum Ada Hasil Analisis</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Silakan masukkan alamat tautan atau tempelkan percakapan WhatsApp mencurigakan untuk memulai pemindaian indikasi risiko.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/url"
            className="px-5 py-2.5 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary-container transition-all shadow-xs"
          >
            Periksa Tautan (URL)
          </Link>
          <Link
            to="/chat"
            className="px-5 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-all"
          >
            Analisis Chat WhatsApp
          </Link>
        </div>
      </div>
    );
  }

  const categoryMeta = result.risk_level ? RISK_CATEGORIES[result.risk_level] : RISK_CATEGORIES.review;
  const isPartial = result.analysis_status === 'partial';

  const handleCopy = () => {
    let reportText = `[LAPORAN INDIKASI RISIKO KEAMANAN SIBER SCAMORA]\n`;
    reportText += `Waktu Pemeriksaan : ${formatDateTime(result.timestamp)}\n`;
    reportText += `Tipe Analisis     : ${result.analysis_type.toUpperCase()}\n`;
    reportText += `Kategori Evaluasi : ${result.risk_level ? RISK_CATEGORIES[result.risk_level].label.toUpperCase() : 'N/A'}\n`;
    reportText += `Skor Risiko       : ${result.risk_score} / 100 (Raw: ${result.raw_score})\n`;
    reportText += `Kategori Modus    : ${result.scam_type || 'Belum terklasifikasi'}\n\n`;

    reportText += `--- TANDA BAHAYA TERVERIFIKASI ---\n`;
    if (result.indicators.length === 0) {
      reportText += `Tidak ditemukan indikator ancaman signifikan.\n`;
    } else {
      result.indicators.forEach((ind, i) => {
        reportText += `${i + 1}. [${ind.severity.toUpperCase()}] ${ind.title} (+${ind.weight} poin)\n`;
        reportText += `   Kutipan Bukti: "${ind.evidence}"\n`;
        reportText += `   Penjelasan   : ${ind.description}\n\n`;
      });
    }

    reportText += `--- PANDUAN TINDAKAN MITIGASI ---\n`;
    result.recommended_actions.forEach((act, i) => {
      reportText += `${i + 1}. ${act}\n`;
    });

    reportText += `\nPenafian: Hasil ini berupa indikasi risiko berbasis AI, bukan vonis mutlak hukum.`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast.success('Laporan insiden berhasil disalin ke clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const evidenceQuotes = result.indicators.map((ind) => ind.evidence).filter(Boolean);

  return (
    <div className="flex flex-col w-full pb-20">
      
      {/* HEADER BANNER - Pomaii Deep Green Style */}
      <section className="w-full bg-[#143826] text-white py-12 border-b border-[#1D4E36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#EAF2ED] text-[#143826] text-xs font-bold uppercase tracking-wider font-mono">
                Laporan Telemetri Risiko
              </span>
              <span className="text-[#CFDDD5] text-xs">&bull;</span>
              <span className="text-xs text-[#EAF2ED] font-medium">
                {result.analysis_type === 'url' ? 'Pemeriksaan Tautan' : 'Analisis Chat WhatsApp'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleCopy}
                type="button"
                className="btn-animate inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#E86A33]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Laporan'}</span>
              </button>

              <button
                onClick={() => navigate(result.analysis_type === 'url' ? '/url' : '/chat')}
                type="button"
                className="btn-animate inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#E86A33] hover:bg-[#D75922] text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Pemeriksaan Baru</span>
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Hasil Analisis &amp; Indikasi Risiko
            </h1>
            <p className="text-sm text-gray-200 max-w-2xl leading-relaxed">
              Disusun secara otomatis berdasarkan parameter teknis dan penalaran semantik tanpa klaim vonis mutlak.
            </p>
            <p className="text-xs font-mono text-[#E86A33] pt-1">
              Waktu Pemeriksaan: {formatDateTime(result.timestamp)}
            </p>
          </div>

        </div>
      </section>

      {/* REPORT CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* PARTIAL OUTAGE ALERT BANNER */}
        {isPartial && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3 animate-in fade-in">
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
            <div className="lg:col-span-8 space-y-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase font-mono ${categoryMeta.badgeBg} ${categoryMeta.badgeText}`}>
                  {categoryMeta.label}
                </span>
                {result.scam_type && result.scam_type !== 'unknown' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-lowest font-mono text-[11px] font-bold text-on-surface border border-outline-variant/60">
                    Modus: {result.scam_type.replace('_', ' ').toUpperCase()}
                  </span>
                )}
                {result.is_simulation && (
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-secondary text-[10px] font-mono font-bold">
                    [DATA SIMULASI]
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
                {result.risk_level === 'high'
                  ? 'Peringatan: Indikasi Kuat Ancaman Penipuan Digital'
                  : result.risk_level === 'review'
                  ? 'Perhatian: Diperlukan Verifikasi Mandiri Lebih Lanjut'
                  : 'Indikasi Risiko Rendah: Tidak Ditemukan Anomali Signifikan'}
              </h2>

              <p className="text-sm text-on-surface-variant leading-relaxed">
                {result.explanation || categoryMeta.description}
              </p>

              {/* Anti-Slop: Visual Deconstructor for URL or Chat Canvas */}
              {result.analysis_type === 'url' ? (
                <div className="p-4 rounded-2xl bg-surface-container-lowest/90 border border-outline-variant space-y-2">
                  <UrlDeconstructor rawUrl={result.input_sanitized} />
                </div>
              ) : (
                <ForensicChatCanvas text={result.input_sanitized} evidenceList={evidenceQuotes} />
              )}
            </div>

            {/* Score Dial / Calibrated Gauge */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs">
              <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider mb-3 font-bold">
                Skor Risiko Terverifikasi
              </span>
              
              <div className="relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-surface-container flex flex-col items-center justify-center relative">
                  <span className="text-4xl font-black text-on-surface tracking-tight">
                    <AnimatedScore target={result.risk_score || 0} />
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant font-bold">
                    DARI 100
                  </span>
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className="text-[11px] font-mono text-on-surface-variant">
                  Raw Score: {result.raw_score} (Dibatasi maks. 100)
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* VERIFIED INDICATORS WITH AUTHENTIC EVIDENCE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold text-on-surface tracking-tight">
                Tanda Bahaya &amp; Bukti Terverifikasi ({result.indicators.length})
              </h3>
            </div>
            <span className="text-xs text-on-surface-variant hidden sm:inline">
              Setiap indikator wajib didukung kutipan kalimat asli
            </span>
          </div>

          {result.indicators.length === 0 ? (
            <div className="apple-card p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-on-tertiary-container mx-auto" />
              <h4 className="text-sm font-bold text-on-surface">Nol Indikator Bahaya Terdeteksi</h4>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                Pemeriksaan terhadap parameter umum phishing, typosquatting, dan manipulasi bahasa tidak menemukan anomali pada masukan ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {result.indicators.map((ind, idx) => (
                <div
                  key={idx}
                  className="apple-card p-5 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                        ind.severity === 'high'
                          ? 'bg-error-container text-error'
                          : ind.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-surface-container text-on-surface'
                      }`}>
                        {ind.severity} severity
                      </span>
                      <h4 className="text-sm font-bold text-on-surface">{ind.title}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-secondary">
                      +{ind.weight} Poin
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {ind.description}
                  </p>

                  {/* Quoted Evidence */}
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-1">
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant uppercase">
                      Kutipan Bukti pada Masukan:
                    </span>
                    <p className="font-mono text-xs text-secondary font-semibold italic">
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
          <h3 className="text-xs font-bold text-on-surface font-mono uppercase tracking-wider">
            Status Pemeriksaan Komponen Sistem:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {result.checks.map((check, idx) => (
              <div
                key={idx}
                className="apple-card p-4 flex items-start gap-3"
              >
                <div className="mt-0.5">
                  {check.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-on-tertiary-container" />
                  ) : check.status === 'failed' ? (
                    <AlertTriangle className="w-4 h-4 text-error" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                  )}
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-on-surface uppercase font-mono text-[11px]">
                    {check.name.replace('_', ' ')}
                  </div>
                  <div className="text-[11px] text-on-surface-variant">{check.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECOMMENDED ACTIONS (SAFETY GUIDE) */}
        <div className="apple-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-secondary" />
            <h3 className="text-base font-bold text-on-surface">
              Panduan Tindakan yang Disarankan (Safety Action Guide)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {result.recommended_actions.map((action, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-3 text-xs"
              >
                <span className="w-5 h-5 rounded-full bg-secondary text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-on-surface font-medium leading-relaxed">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LIMITATIONS DISCLAIMER */}
        <div className="apple-card p-5 space-y-2 text-xs text-on-surface-variant">
          <span className="font-bold text-on-surface uppercase font-mono text-[11px]">
            Keterbatasan &amp; Batasan Analisis Sistem:
          </span>
          <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
            {result.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>

        {/* CTA TO EDUCATIONAL MODULES */}
        <div className="apple-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-on-surface">Ingin Mengasah Kemampuan Mendeteksi Penipuan?</h4>
            <p className="text-xs text-on-surface-variant">
              Ikuti Tantangan Guardian Challenge dan pelajari modus operandi penipuan digital terkini.
            </p>
          </div>
          <Link
            to="/kuis"
            className="px-5 py-2.5 rounded-xl bg-secondary text-white text-xs font-semibold hover:bg-secondary-container transition-all inline-flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <span>Mulai Tantangan Kuis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};
