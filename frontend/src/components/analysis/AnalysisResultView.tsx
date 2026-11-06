import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  RotateCcw, 
  Code2, 
  ChevronDown, 
  ChevronUp,
  ShieldAlert,
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
  reputation: 'Daftar Bahaya Google Safe Browsing',
  google_safe_browsing: 'Daftar Bahaya Google Safe Browsing',
  ssl: 'Sertifikat SSL / HTTPS',
  ssl_cert: 'Sertifikat SSL / HTTPS',
  domain_age: 'Usia Domain & Catatan DNS',
  dns: 'Resolusi DNS & Hosting',
  chat_heuristic: 'Pola Manipulasi Bahasa Chat',
  ai_classification: 'Klasifikasi Semantik AI',
};

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  completed: { label: 'Selesai', badge: 'bg-[#DCFAE6] text-[#067647] border border-[#75E0A7]' },
  ok: { label: 'Selesai', badge: 'bg-[#DCFAE6] text-[#067647] border border-[#75E0A7]' },
  partial: { label: 'Sebagian', badge: 'bg-[#FEF0C7] text-[#93370D] border border-[#FDB022]' },
  failed: { label: 'Gagal', badge: 'bg-[#FEE4E2] text-[#B42318] border border-[#FDA29B]' },
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
          {hasSubdomainWarning && <span>⚠️ Peringatan: Nama merek/bank disisipkan pada subdomain!</span>}
          {isRiskyTld && <span>⚠️ Ekstensi domain ({tld}) memiliki riwayat tinggi situs phishing.</span>}
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

  const rawScore = result.raw_score ?? result.risk_score ?? 0;
  const isCapped = rawScore > 100;
  const riskScore = Math.min(100, Math.max(0, result.risk_score ?? rawScore));

  // Critical indicators detection
  const hasCritical = 
    result.category_reason === 'critical_indicator' ||
    (result.indicators || []).some((i) => i.weight && i.weight >= 40);

  // Exact 3-Tier Classification:
  // 0 - 25: Rendah
  // 26 - 69: Perlu Ditinjau
  // 70 - 100: Tinggi (atau jika memiliki tanda kritis)
  const effectiveScore = hasCritical ? Math.max(70, riskScore) : riskScore;
  const riskLevel: 'high' | 'review' | 'low' = 
    effectiveScore >= 70 ? 'high' : effectiveScore >= 26 ? 'review' : 'low';

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

  // Share to WhatsApp Handler
  const handleShareWhatsApp = () => {
    const target = result.input_sanitized || 'Tautan/Pesan';
    const msg = `⚠️ Peringatan Investigasi Scamora\n\nTarget: ${target}\nSkor Risiko: ${effectiveScore}/100 (${currentLevel.title})\n\nKeterangan: ${result.explanation || 'Harap waspada dan jangan berikan data rahasia.'}\n\nCek tautan & chat mencurigakan gratis di Scamora: ${window.location.origin}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy Summary Handler
  const handleCopySummary = () => {
    const target = result.input_sanitized || 'Tautan/Pesan';
    const msg = `[Scamora] Peringatan Keamanan\nTarget: ${target}\nSkor Risiko: ${effectiveScore}/100 (${currentLevel.title})\nCatatan: ${result.explanation || 'Berhati-hatilah terhadap potensi penipuan.'}`;
    navigator.clipboard.writeText(msg);
    setSummaryCopied(true);
    toast.success('Ringkasan peringatan berhasil disalin!');
    setTimeout(() => setSummaryCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-5 text-[#14130F] animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* 1. HERO SCORE CARD */}
      <div className="bg-white border border-[#E4E0D6] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
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

          {/* Badges & Actions */}
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentLevel.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentLevel.dotColor}`}></span>
              {currentLevel.title}
            </span>

            <div className="flex items-center gap-2 flex-wrap justify-end pt-1">
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
          {hasCritical && riskScore < 70 && (
            <span className="block mt-1 font-semibold text-[#B42318] text-xs">
              ⚠️ Terdapat tanda bahaya kritis, sehingga hasil otomatis dikategorikan ke Risiko Tinggi.
            </span>
          )}
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
          <div className="flex justify-between text-[11px] font-mono text-[#706C62]">
            <span>Rendah (0–25)</span>
            <span>Perlu Ditinjau (26–69)</span>
            <span className="text-right">Tinggi (70–100)</span>
          </div>
        </div>
      </div>

      {/* 2. TANDA BAHAYA YANG DITEMUKAN */}
      <div className="bg-white border border-[#E4E0D6] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#EEEAE0] pb-3 flex-wrap gap-2">
          <h3 className="text-lg font-bold text-[#14130F] font-display">
            Tanda Bahaya yang Ditemukan ({result.indicators?.length || 0})
          </h3>
          <div className="text-right font-mono">
            <span className="text-xs font-bold text-[#706C62]">
              Jumlah Bobot = {rawScore}
            </span>
            {isCapped && (
              <span className="text-[11px] text-[#8C887B] ml-1.5 font-normal">
                (dibatasi maks 100)
              </span>
            )}
          </div>
        </div>

        {(!result.indicators || result.indicators.length === 0) ? (
          <div className="p-4 rounded-xl bg-[#FAF8F5] text-center text-xs text-[#706C62]">
            Tidak ditemukan indikator ancaman umum dalam pemeriksaan saat ini.
          </div>
        ) : (
          <div className="divide-y divide-[#EEEAE0]">
            {result.indicators.map((ind, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                        ind.severity === 'high'
                          ? 'bg-[#FEE4E2] text-[#B42318]'
                          : ind.severity === 'medium'
                          ? 'bg-[#FEF0C7] text-[#93370D]'
                          : 'bg-[#EEEAE0] text-[#5B5850]'
                      }`}
                    >
                      {ind.severity}
                    </span>
                    <span className="text-sm font-bold text-[#14130F]">{ind.title}</span>
                  </div>
                  <p className="text-xs text-[#5B5850] leading-relaxed">
                    {ind.description}
                  </p>
                  {ind.evidence && (
                    <div className="font-mono text-xs text-[#14130F] bg-[#F5F3EE] px-2.5 py-1 rounded-md inline-block mt-1">
                      Bukti: "{ind.evidence}"
                    </div>
                  )}
                </div>
                <div className="text-sm font-mono font-bold text-[#B42318] shrink-0">
                  +{ind.weight}
                </div>
              </div>
            ))}
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
          <div className="space-y-2 text-xs">
            {result.checks?.map((c, i) => {
              const checkLabel = CHECK_LABELS[c.name.toLowerCase()] || c.name.replace(/_/g, ' ');
              const statusCfg = STATUS_LABELS[c.status.toLowerCase()] || {
                label: c.status,
                badge: 'bg-[#EEEAE0] text-[#5B5850] border border-[#D5D0C5]',
              };
              return (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#F0ECE3] last:border-b-0">
                  <span className="font-semibold text-[#14130F]">
                    {checkLabel}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${statusCfg.badge}`}
                  >
                    {statusCfg.label}
                  </span>
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
