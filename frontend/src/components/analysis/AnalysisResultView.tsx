import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  RotateCcw, 
  Code2, 
  ChevronDown, 
  ChevronUp,
  ShieldAlert,
  AlertTriangle,
  Share2,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import type { AnalysisResult } from '../../types/analysis';

interface AnalysisResultViewProps {
  result: AnalysisResult;
  onReset?: () => void;
}

const CHECK_LABELS: Record<string, string> = {
  structure: 'Struktur Domain & Ekstensi',
  url_syntax: 'Struktur Domain & Ekstensi',
  reputation: 'Daftar Bahaya Google Safe Browsing',
  safe_browsing: 'Daftar Bahaya Google Safe Browsing',
  google_safe_browsing: 'Daftar Bahaya Google Safe Browsing',
  domain_age: 'Usia Domain & Catatan DNS',
  dns: 'Resolusi DNS & Hosting',
  ssl: 'Sertifikat SSL / HTTPS',
  ssl_cert: 'Sertifikat SSL / HTTPS',
  ssl_certificate: 'Sertifikat SSL / HTTPS',
  live_content: 'Inspeksi Konten Web & Formulir',
  pattern_scan: 'Pemindaian Pola & Bahasa Chat',
  chat_heuristic: 'Pola Manipulasi Bahasa Chat',
  pii_scrubbing: 'Penyaringan Data Pribadi (PII)',
  ai_analysis: 'Penalaran Semantik AI',
  claude_ai_reasoning: 'Penalaran Semantik AI',
  ai_classification: 'Klasifikasi Semantik AI',
};

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  completed: { label: 'Selesai', badge: 'bg-[#DCFAE6] text-[#067647] border border-[#75E0A7]' },
  ok: { label: 'Selesai', badge: 'bg-[#DCFAE6] text-[#067647] border border-[#75E0A7]' },
  partial: { label: 'Data Terbatas', badge: 'bg-[#FEF0C7] text-[#93370D] border border-[#FDB022]' },
  failed: { label: 'Gagal Akses', badge: 'bg-[#FEE4E2] text-[#B42318] border border-[#FDA29B]' },
  skipped: { label: 'Dilewati', badge: 'bg-[#EEEAE0] text-[#5B5850] border border-[#D5D0C5]' },
};

// Micro-Component 1: Anatomi URL
function UrlDeconstructor({ rawUrl }: { rawUrl: string }) {
  let scheme = '';
  let subdomain = '';
  let domain = '';
  let tld = '';
  let pathQuery = '';

  try {
    const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    scheme = parsed.protocol;
    const host = parsed.hostname;
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
    return <span className="font-mono text-xs text-[#14130F]">{rawUrl}</span>;
  }

  const isRiskyTld = ['.xyz', '.top', '.work', '.click', '.zip', '.fit', '.site', '.online'].includes(tld.toLowerCase());
  const hasSubdomainWarning =
    subdomain.toLowerCase().includes('bca') ||
    subdomain.toLowerCase().includes('bank') ||
    subdomain.toLowerCase().includes('shopee') ||
    subdomain.toLowerCase().includes('bri');

  return (
    <div className="space-y-2 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC]">
      <div className="text-[11px] font-bold text-[#706C62] uppercase tracking-wider font-mono">
        Anatomi Tautan Web:
      </div>
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
        <span
          className={`px-2 py-0.5 rounded-md font-bold ${
            scheme.toLowerCase() === 'https:'
              ? 'bg-[#DCFAE6] text-[#067647]'
              : 'bg-[#FEE4E2] text-[#B42318]'
          }`}
        >
          {scheme}//
        </span>

        {subdomain && (
          <span
            className={`px-2 py-0.5 rounded-md font-semibold ${
              hasSubdomainWarning
                ? 'bg-[#FEE4E2] text-[#B42318] border border-[#FDA29B]'
                : 'bg-[#EEEAE0] text-[#14130F]'
            }`}
          >
            {subdomain}.
          </span>
        )}

        <span className="px-2 py-0.5 rounded-md bg-[#14130F] text-white font-bold">
          {domain}
        </span>

        <span
          className={`px-2 py-0.5 rounded-md font-bold ${
            isRiskyTld
              ? 'bg-[#FEF0C7] text-[#93370D] border border-[#FDB022]'
              : 'bg-[#EEEAE0] text-[#14130F]'
          }`}
        >
          {tld}
        </span>

        {pathQuery && (
          <span className="px-2 py-0.5 rounded-md bg-[#EEEAE0] text-[#5B5850] truncate max-w-xs">
            {pathQuery}
          </span>
        )}
      </div>

      {(hasSubdomainWarning || isRiskyTld) && (
        <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-[#B42318]">
          {hasSubdomainWarning && <span className="inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-[#B42318] shrink-0" /> Peringatan: Nama merek/bank disisipkan pada subdomain!</span>}
          {isRiskyTld && <span className="inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-[#B42318] shrink-0" /> Ekstensi domain ({tld}) memiliki riwayat tinggi situs phishing.</span>}
        </div>
      )}
    </div>
  );
}

// Micro-Component 2: Highlighted Chat Transcript
function ChatTranscriptView({ text, evidenceList }: { text: string; evidenceList: string[] }) {
  return (
    <div className="space-y-2 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DC]">
      <div className="flex items-center justify-between text-[11px] font-bold text-[#706C62] uppercase tracking-wider font-mono">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#143826]" />
          <span>Isi Percakapan yang Diperiksa:</span>
        </span>
        <span className="text-[10px] text-[#8C887B]">PII Disamarkan</span>
      </div>
      <div className="text-sm font-sans text-[#14130F] leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-lg border border-[#EAE6DC]">
        {text}
      </div>
      {evidenceList.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-[#706C62]">Kutipan Mencurigakan:</span>
          {evidenceList.map((ev, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md bg-[#FEE4E2] text-[#B42318] text-xs font-mono font-semibold border border-[#FDA29B]"
            >
              "{ev}"
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ result, onReset }) => {
  const navigate = useNavigate();
  const [showJsonPayload, setShowJsonPayload] = useState(false);
  const [techTab, setTechTab] = useState<'summary' | 'raw'>('summary');
  const [jsonCopied, setJsonCopied] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setJsonCopied(true);
    toast.success('Payload JSON teknis berhasil disalin!');
    setTimeout(() => setJsonCopied(false), 2000);
  };

  const indicatorsSum = (result.indicators || []).reduce((acc, curr) => acc + (curr.weight || 0), 0);
  const rawScore = result.raw_score ?? indicatorsSum;
  const isCapped = rawScore > 100;

  // Cek apakah ada eskalasi proteksi kritis (misal minta OTP, APK malware, Safe Browsing)
  const isCritical = result.category_reason === 'critical_indicator' || (result.risk_level === 'high' && rawScore < 70);
  const escalationPoints = isCritical && rawScore < 70 ? 70 - rawScore : 0;
  const effectiveScore = rawScore + escalationPoints;

  const riskLevel: 'high' | 'review' | 'low' = 
    result.risk_level || (effectiveScore >= 70 ? 'high' : effectiveScore >= 26 ? 'review' : 'low');

  // Indikator pemicu eskalasi proteksi
  const triggerIndicator = (result.indicators || []).find((i) =>
    ['otp_request', 'safe_browsing_match', 'malicious_apk_download'].includes(i.type) || (i.weight && i.weight >= 40)
  );

  // Buat daftar indikator transparan: jika ada eskalasi poin, masukkan baris proteksi langsung ke rincian tanda bahaya
  const displayedIndicators = [...(result.indicators || [])];
  if (isCritical && escalationPoints > 0) {
    displayedIndicators.push({
      type: 'critical_escalation',
      title: 'Eskalasi Proteksi Otomatis (Ancaman Kritis)',
      severity: 'high',
      weight: escalationPoints,
      source: 'system' as any,
      evidence: `Penyesuaian keamanan otomatis: +${escalationPoints} poin proteksi`,
      description: `Terdeteksi indikator bahaya fatal (${triggerIndicator?.title || 'Permintaan Kredensial / OTP'}). Sistem Scamora otomatis menambahkan ${escalationPoints} poin proteksi agar skor mencapai batas minimum 70 (Risiko Tinggi) demi perlindungan pengguna.`,
    });
  }

  const levelLabels = {
    high: { 
      title: 'Risiko Tinggi', 
      badgeClass: 'bg-[#FEE4E2] text-[#B42318] border border-[#FDA29B]', 
      dotColor: 'bg-[#D92D20]' 
    },
    review: { 
      title: 'Perlu Ditinjau', 
      badgeClass: 'bg-[#FEF0C7] text-[#93370D] border border-[#FDB022]', 
      dotColor: 'bg-[#F79009]' 
    },
    low: { 
      title: 'Risiko Rendah', 
      badgeClass: 'bg-[#DCFAE6] text-[#067647] border border-[#75E0A7]', 
      dotColor: 'bg-[#12B76A]' 
    },
  };

  const currentLevel = levelLabels[riskLevel];
  const evidenceList = result.indicators?.map((i) => i.evidence).filter(Boolean) as string[] || [];

  // Helper: Membuat laporan analisis lengkap untuk disalin & dibagikan
  const generateFullReportText = () => {
    const target = result.input_sanitized || 'Tautan/Pesan';
    const lines: string[] = [];

    lines.push(`🛡️ LAPORAN PEMERIKSAAN KEAMANAN SCAMORA`);
    lines.push(`Target: ${target}`);
    lines.push(`Skor Risiko: ${effectiveScore}/100 (${currentLevel.title})`);
    if (result.explanation) {
      lines.push(`Keterangan: ${result.explanation}`);
    }
    lines.push('');

    // 1. Tanda Bahaya yang Ditemukan
    lines.push(`⚠️ TANDA BAHAYA YANG DITEMUKAN (${displayedIndicators.length}):`);
    if (displayedIndicators.length === 0) {
      lines.push(`• Tidak ditemukan tanda bahaya umum dalam pemeriksaan.`);
    } else {
      displayedIndicators.forEach((ind) => {
        const sev = ind.type === 'critical_escalation' ? 'PROTEKSI' : (ind.severity?.toUpperCase() || 'INFO');
        lines.push(`• [${sev}] ${ind.title} (+${ind.weight})`);
        if (ind.evidence) {
          lines.push(`   Bukti: "${ind.evidence}"`);
        } else if (ind.description) {
          lines.push(`   Info: ${ind.description}`);
        }
      });
    }
    lines.push('');

    // 2. Pemeriksaan yang Dilakukan
    if (result.checks && result.checks.length > 0) {
      lines.push(`🔍 PEMERIKSAAN YANG DILAKUKAN (${result.checks.length}):`);
      result.checks.forEach((c) => {
        const checkLabel = CHECK_LABELS[c.name.toLowerCase()] || c.name.replace(/_/g, ' ');
        const statusCfg = STATUS_LABELS[c.status.toLowerCase()] || { label: c.status };
        let checkLine = `• ${checkLabel}: [${statusCfg.label}]`;
        if (c.note) {
          checkLine += ` (${c.note})`;
        }
        lines.push(checkLine);
      });
      lines.push('');
    }

    // 3. Langkah Aman yang Disarankan
    if (result.recommended_actions && result.recommended_actions.length > 0) {
      lines.push(`💡 LANGKAH AMAN YANG DISARANKAN:`);
      result.recommended_actions.forEach((act, idx) => {
        lines.push(`${idx + 1}. ${act}`);
      });
      lines.push('');
    }

    // 4. Catatan / Disclaimer Penting (Bukan Vonis Mutlak)
    lines.push(`📌 CATATAN PENTING:`);
    lines.push(`Hasil evaluasi merupakan indikasi risiko berbasis aturan dan pola deteksi sistem, BUKAN VONIS MUTLAK atau jaminan hukum. Jangan jadikan hasil ini sebagai acuan mutlak semata; selalu lakukan verifikasi mandiri sebelum mengambil keputusan atau bertransaksi.`);
    lines.push('');
    lines.push(`Periksa tautan & chat mencurigakan di Scamora: ${window.location.origin}`);

    return lines.join('\n');
  };

  // Share to WhatsApp Handler
  const handleShareWhatsApp = () => {
    const report = generateFullReportText();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(report)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy Summary Handler
  const handleCopySummary = () => {
    const report = generateFullReportText();
    navigator.clipboard.writeText(report);
    setSummaryCopied(true);
    toast.success('Laporan lengkap berhasil disalin ke clipboard!');
    setTimeout(() => setSummaryCopied(false), 2000);
  };

  // Diskusikan di Komunitas Handler
  const handleDiscussInCommunity = () => {
    const rawTarget = result.input_sanitized || (result as any).url || '';
    let domain = 'Mencurigakan';
    try {
      if (rawTarget.includes('://')) {
        domain = new URL(rawTarget).hostname;
      } else {
        domain = rawTarget.split('/')[0];
      }
    } catch {
      domain = rawTarget || 'Mencurigakan';
    }

    // Defang URL (contoh: hxxps://contoh[.]com)
    const defanged = rawTarget
      .replace(/^https?:\/\//i, (m: string) => (m.toLowerCase().startsWith('https') ? 'hxxps://' : 'hxxp://'))
      .replace(/\./g, '[.]');

    const score = result.risk_score || result.raw_score || 0;
    const level = result.risk_level === 'high' ? 'Tinggi' : result.risk_level === 'review' ? 'Perlu Ditinjau' : 'Rendah';
    const topReasons = result.indicators?.slice(0, 3).map((ind) => ind.name || ind.description).join(', ') || 'Terdeteksi indikasi penipuan';

    const draft = {
      title: `Waspada: Indikasi Penipuan pada Domain ${domain}`,
      category: 'waspada-modus-baru' as const,
      evidenceSnippet: `Target: ${defanged} | Skor Risiko: ${score}/100 (${level}) | Deteksi: ${new Date().toLocaleDateString('id-ID')}`,
      content: `Saya menemukan indikasi penipuan melalui pemindaian Scamora:\n\n• Target (Disanitasi): ${defanged}\n• Skor Risiko: ${score}/100 (${level})\n• Indikasi Utama: ${topReasons}\n\nMohon rekan-rekan warga waspada dan jangan mengakses atau memasukkan data apapun di tautan tersebut!`,
    };

    try {
      sessionStorage.setItem('community_prefill_draft', JSON.stringify(draft));
    } catch {}

    navigate('/komunitas', { state: { prefillDraft: draft } });
  };

  return (
    <div className="w-full flex flex-col gap-5 text-[#14130F] animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* 1. HERO SCORE CARD */}
      <div className="bg-white border border-[#E4E0D6] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          {/* Top Row on Mobile: Score (left) and Status Badge (right) */}
          <div className="flex items-start justify-between gap-3 w-full sm:w-auto">
            <div>
              <div className="text-[11px] font-bold font-mono uppercase tracking-wider text-[#706C62]">
                SKOR RISIKO TERDETEKSI
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display text-5xl sm:text-6xl font-bold text-[#14130F] tracking-tight leading-none">
                  {effectiveScore}
                </span>
                <span className="text-base font-bold text-[#8C887B]">/ 100</span>
              </div>
            </div>

            {/* Status Badge on Mobile (pinned to top-right) */}
            <div className="sm:hidden shrink-0 pt-0.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentLevel.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currentLevel.dotColor}`}></span>
                {currentLevel.title}
              </span>
            </div>
          </div>

          {/* Right Container on Desktop / Actions row on Mobile */}
          <div className="flex flex-col sm:items-end gap-2.5">
            {/* Status Badge on Desktop */}
            <div className="hidden sm:block">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentLevel.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${currentLevel.dotColor}`}></span>
                {currentLevel.title}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end pt-1 sm:pt-0">
              {/* Diskusikan di Komunitas Button */}
              <button
                type="button"
                onClick={handleDiscussInCommunity}
                title="Diskusikan hasil ini di Komunitas Warga"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143826] hover:bg-[#1a4a32] text-white font-semibold text-xs border border-[#143826] transition-all cursor-pointer shadow-2xs"
              >
                <MessageSquare className="w-3 h-3 text-[#A6F4C5]" />
                <span>Diskusikan di Komunitas</span>
              </button>

              {/* WhatsApp Share Button */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                title="Bagikan ke WhatsApp"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8F8F0] hover:bg-[#D3F3E3] text-[#067647] font-semibold text-xs border border-[#A6F4C5] transition-all cursor-pointer"
              >
                <Share2 className="w-3 h-3" />
                <span>Bagikan WA</span>
              </button>

              {/* Copy Summary Button */}
              <button
                type="button"
                onClick={handleCopySummary}
                title="Salin Ringkasan untuk Pesan"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] hover:bg-[#EEEAE0] text-[#5B5850] hover:text-[#14130F] font-semibold text-xs border border-[#E4E0D6] transition-all cursor-pointer"
              >
                {summaryCopied ? <Check className="w-3 h-3 text-[#067647]" /> : <Copy className="w-3 h-3" />}
                <span>{summaryCopied ? 'Tersalin' : 'Salin'}</span>
              </button>

              {/* Reset Button */}
              {onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1 text-xs text-[#706C62] hover:text-[#14130F] font-semibold underline underline-offset-4 cursor-pointer pl-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Periksa Lainnya</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-sm sm:text-base text-[#3F3C35] leading-relaxed">
          {result.explanation ||
            (riskLevel === 'high'
              ? 'Ditemukan beberapa indikasi ancaman kuat pada masukan yang diperiksa. Jangan pernah memberikan data atau melanjutkan transaksi.'
              : 'Terdapat beberapa indikasi yang perlu diverifikasi lebih lanjut sebelum mengambil tindakan.')}
        </p>

        {/* Focus Item Detail */}
        {result.analysis_type === 'url' ? (
          <UrlDeconstructor rawUrl={result.input_sanitized} />
        ) : (
          <ChatTranscriptView text={result.input_sanitized} evidenceList={evidenceList} />
        )}

        {/* Risk Meter Bar - Exact 0-25 / 26-69 / 70-100 */}
        <div className="space-y-2 pt-2">
          <div className="relative">
            <div className="flex h-2.5 rounded-full overflow-hidden bg-[#EEEAE0]">
              <div style={{ flex: 25 }} className="bg-[#12B76A]" title="Rendah: 0-25" />
              <div style={{ flex: 44 }} className="bg-[#F79009]" title="Perlu Ditinjau: 26-69" />
              <div style={{ flex: 31 }} className="bg-[#D92D20]" title="Tinggi: 70-100" />
            </div>
            {/* Needle indicator */}
            <div
              className="absolute -top-1 w-2.5 h-4.5 bg-[#14130F] rounded-xs shadow-md transform -translate-x-1/2 border border-white"
              style={{ left: `${Math.min(99, Math.max(1, effectiveScore))}%` }}
              title={`Skor: ${effectiveScore}`}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] sm:text-[11px] font-mono text-[#706C62] whitespace-nowrap tracking-tight sm:tracking-normal">
            <span className="shrink-0">Rendah (0–25)</span>
            <span className="text-center">Perlu Ditinjau (26–69)</span>
            <span className="text-right shrink-0">Tinggi (70–100)</span>
          </div>
        </div>
      </div>

      {/* 2. TANDA BAHAYA YANG DITEMUKAN */}
      <div className="bg-white border border-[#E4E0D6] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#EEEAE0] pb-3 flex-wrap gap-2">
          <h3 className="text-lg font-bold text-[#14130F] font-display">
            Tanda Bahaya yang Ditemukan ({displayedIndicators.length})
          </h3>
          <div className="text-right font-mono">
            <span className="text-xs font-bold text-[#706C62]">
              {isCritical && escalationPoints > 0 ? (
                <>
                  Skor Dasar ({rawScore}) + Proteksi (+{escalationPoints}) = <span className="text-[#B42318]">{effectiveScore}</span>
                </>
              ) : (
                `Jumlah Bobot = ${effectiveScore}`
              )}
            </span>
            {isCapped && (
              <span className="text-[11px] text-[#8C887B] ml-1.5 font-normal">
                (dibatasi maks 100)
              </span>
            )}
          </div>
        </div>

        {displayedIndicators.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#FAF8F5] text-center text-xs text-[#706C62]">
            Tidak ditemukan indikator ancaman umum dalam pemeriksaan saat ini.
          </div>
        ) : (
          <div className="divide-y divide-[#EEEAE0]">
            {displayedIndicators.map((ind, idx) => {
              const isEscalationRow = ind.type === 'critical_escalation';
              return (
                <div
                  key={idx}
                  className={`py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 ${
                    isEscalationRow ? 'bg-[#FEF3F2] -mx-3 px-3 py-3 rounded-xl border border-[#FECDCA] my-1.5' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                          isEscalationRow
                            ? 'bg-[#FEE4E2] text-[#B42318] border border-[#FDA29B]'
                            : ind.severity === 'high'
                            ? 'bg-[#FEE4E2] text-[#B42318]'
                            : ind.severity === 'medium'
                            ? 'bg-[#FEF0C7] text-[#93370D]'
                            : 'bg-[#EEEAE0] text-[#5B5850]'
                        }`}
                      >
                        {isEscalationRow ? 'PROTEKSI' : ind.severity}
                      </span>
                      <span className="text-sm font-bold text-[#14130F]">{ind.title}</span>
                    </div>
                    <p className="text-xs text-[#5B5850] leading-relaxed">
                      {ind.description}
                    </p>
                    {ind.evidence && (
                      <div
                        className={`font-mono text-xs px-2.5 py-1 rounded-md inline-block mt-1 ${
                          isEscalationRow
                            ? 'bg-white text-[#B42318] border border-[#FECDCA]'
                            : 'bg-[#F5F3EE] text-[#14130F]'
                        }`}
                      >
                        {isEscalationRow ? ind.evidence : `Bukti: "${ind.evidence}"`}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-mono font-bold text-[#B42318] shrink-0">
                    +{ind.weight}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. DUA KOLOM: LANGKAH AMAN & STATUS PEMERIKSAAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Kolom Kiri: Langkah Aman */}
        <div className="bg-white border border-[#E4E0D6] rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-[#14130F] font-display flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#067647]" />
            <span>Langkah Aman yang Disarankan</span>
          </h3>
          <ol className="space-y-2.5 text-xs text-[#3F3C35] leading-relaxed pl-1 list-none">
            {(result.recommended_actions?.length
              ? result.recommended_actions
              : [
                  'Jangan buka tautan atau isi data sensitif apa pun.',
                  'Konfirmasi langsung melalui kanal resmi institusi terkait.',
                  'Ganti kata sandi akun jika terlanjur mengisi data.',
                ]
            ).map((act, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{act}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Kolom Kanan: Status Pemeriksaan Komponen */}
        <div className="bg-white border border-[#E4E0D6] rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-[#14130F] font-display flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#143826]" />
            <span>Pemeriksaan yang Dilakukan</span>
          </h3>
          <div className="space-y-3 text-xs">
            {result.checks?.map((c, i) => {
              const checkLabel = CHECK_LABELS[c.name.toLowerCase()] || c.name.replace(/_/g, ' ');
              const statusCfg = STATUS_LABELS[c.status.toLowerCase()] || {
                label: c.status,
                badge: 'bg-[#EEEAE0] text-[#5B5850] border border-[#D5D0C5]',
              };
              return (
                <div key={i} className="py-2.5 border-b border-[#F0ECE3] last:border-b-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#14130F]">
                      {checkLabel}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${statusCfg.badge}`}
                    >
                      {statusCfg.label}
                    </span>
                  </div>
                  {c.note && (
                    <p className="text-[11px] text-[#706C62] leading-relaxed">
                      {c.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {result.limitations?.length > 0 && (
            <p className="text-[11px] text-[#706C62] italic pt-1 leading-normal">
              * {result.limitations[0]}
            </p>
          )}
          <p className="text-[11px] text-[#8C887B] pt-0.5">
            Hasil pemeriksaan berupa indikasi risiko berbasis aturan, bukan vonis mutlak.
          </p>
        </div>
      </div>

      {/* 4. TECHNICAL INSPECTOR DRAWER (LIHAT PAYLOAD JSON TEKNIS & RINGKASAN) */}
      <div className="bg-white border border-[#E4E0D6] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowJsonPayload(!showJsonPayload)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#CFCABD] bg-[#FAF8F5] hover:bg-[#F0ECE3] text-[#14130F] text-xs font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5 text-[#14130F] shrink-0" />
            <span>{showJsonPayload ? 'Tutup Detail Teknis' : 'Lihat Detail & Payload Teknis'}</span>
            {showJsonPayload ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#5B5850] ml-0.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#5B5850] ml-0.5" />
            )}
          </button>

          {showJsonPayload && (
            <div className="flex items-center gap-2">
              <div className="inline-flex bg-[#EEEAE0] p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setTechTab('summary')}
                  className={`px-3 py-1 rounded-md transition-all ${techTab === 'summary' ? 'bg-white shadow-2xs text-[#14130F]' : 'text-[#706C62]'}`}
                >
                  Ringkasan Teknis
                </button>
                <button
                  type="button"
                  onClick={() => setTechTab('raw')}
                  className={`px-3 py-1 rounded-md transition-all ${techTab === 'raw' ? 'bg-white shadow-2xs text-[#14130F]' : 'text-[#706C62]'}`}
                >
                  Payload JSON
                </button>
              </div>

              {techTab === 'raw' && (
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EEEAE0] text-[#14130F] text-xs font-mono transition-all border border-[#CFCABD] cursor-pointer"
                >
                  {jsonCopied ? (
                    <>
                      <Check className="w-3 h-3 text-[#067647]" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Salin JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {showJsonPayload && (
          <div className="mt-3">
            {techTab === 'summary' ? (
              <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-4 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 bg-white rounded-lg border border-[#E9E5DA]">
                    <span className="text-[11px] font-bold text-[#8C887B] block font-mono">TIPE PEMERIKSAAN</span>
                    <span className="font-semibold text-[#14130F] uppercase mt-0.5 block">{result.analysis_type}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E9E5DA]">
                    <span className="text-[11px] font-bold text-[#8C887B] block font-mono">STATUS INVESTIGASI</span>
                    <span className="font-semibold text-[#067647] uppercase mt-0.5 block">{result.analysis_status}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E9E5DA]">
                    <span className="text-[11px] font-bold text-[#8C887B] block font-mono">TARGET INPUT</span>
                    <span className="font-mono text-[11px] text-[#14130F] break-all mt-0.5 block">{result.input_sanitized}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E9E5DA]">
                    <span className="text-[11px] font-bold text-[#8C887B] block font-mono">ENGINE ANALISIS</span>
                    <span className="font-semibold text-[#14130F] mt-0.5 block">Scamora Multi-Layer Engine v1.0</span>
                  </div>
                </div>

                {result.limitations?.length > 0 && (
                  <div className="p-2.5 bg-[#FFF] rounded-lg border border-[#E9E5DA]">
                    <span className="text-[11px] font-bold text-[#8C887B] block font-mono mb-1">CATATAN & LIMITASI SISTEM:</span>
                    <ul className="list-disc pl-4 space-y-1 text-[#5B5850]">
                      {result.limitations.map((lim, idx) => (
                        <li key={idx}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-[#14130F] p-4 space-y-2 overflow-hidden shadow-inner">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#D6D2C8] border-b border-white/10 pb-2">
                  <span className="font-bold uppercase tracking-wider text-emerald-400">
                    Technical Payload Data (JSON)
                  </span>
                  <span className="text-[10px]">
                    Status: {result.analysis_status}
                  </span>
                </div>
                <pre className="font-mono text-xs leading-relaxed overflow-x-auto max-h-80 overflow-y-auto text-emerald-400 p-1 select-all">
                  <code>{JSON.stringify(result, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
