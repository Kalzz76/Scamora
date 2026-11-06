import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, Lock, Unlock, RotateCcw, Play } from 'lucide-react';
import { toast } from 'sonner';
import { DEMO_PRESETS } from '../../lib/constants';
import { analysisService } from '../../services/analysisService';
import { Stepper } from '../../components/common/Stepper';
import type { AnalysisResult } from '../../types/analysis';

interface UrlCheckerPageProps {
  initialPresetId?: string | null;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onOpenPrivacy: () => void;
}

export const UrlCheckerPage: React.FC<UrlCheckerPageProps> = ({
  initialPresetId,
  onAnalysisComplete,
  onOpenPrivacy,
}) => {
  const [url, setUrl] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const urlPresets = DEMO_PRESETS.filter((p) => p.type === 'url');

  useEffect(() => {
    if (initialPresetId) {
      const match = DEMO_PRESETS.find((p) => p.id === initialPresetId);
      if (match) {
        setUrl(match.content);
        setPrivacyAgreed(true);
      }
    }
  }, [initialPresetId]);

  const isHttps = url.trim().toLowerCase().startsWith('https://');
  const isHttp = url.trim().toLowerCase().startsWith('http://');

  const handleSelectPreset = (content: string) => {
    setUrl(content);
    setErrorMessage(null);
    setPrivacyAgreed(true);
    toast.info('Skenario serangan simulasi dimuat');
  };

  const handleClear = () => {
    setUrl('');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMessage('Silakan masukkan alamat URL lengkap terlebih dahulu.');
      return;
    }

    if (!privacyAgreed) {
      setErrorMessage('Anda wajib menyetujui pemberitahuan privasi sebelum mengirim data.');
      return;
    }

    // Basic URL validation
    try {
      new URL(trimmed);
    } catch {
      setErrorMessage('Format URL tidak valid. Pastikan diawali dengan https:// atau http://');
      return;
    }

    setLoading(true);

    try {
      const result = await analysisService.analyzeUrl({
        url: trimmed,
        privacy_consent: privacyAgreed,
      });
      onAnalysisComplete(result);
      navigate('/laporan');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses pemeriksaan URL.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Stepper type="url" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-20">
      
      {/* HEADER BANNER - Pomaii Deep Green Style */}
      <section className="w-full bg-[#143826] text-white py-12 border-b border-[#1D4E36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#EAF2ED] text-[#143826] text-xs font-bold uppercase tracking-wider font-mono">
              Pemeriksaan Keamanan Tautan
            </span>
            <span className="text-[#CFDDD5] text-xs">&bull;</span>
            <span className="text-xs text-[#EAF2ED] font-medium">Modul Inti P0</span>
            <div className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#EAF2ED] border border-white/20 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E86A33]"></span>
              <span>Crawler &amp; Penalaran Semantik AI</span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Pemeriksaan Tautan (URL Safety Checker)
            </h1>
            <p className="text-sm text-gray-200 max-w-2xl leading-relaxed">
              Mendeteksi potensi penipuan digital secara menyeluruh: menganalisis struktur URL, reputasi Safe Browsing, serta merayapi (crawling) konten halaman web untuk mendeteksi form pencurian kredensial, APK berbahaya, dan penalaran AI semantik.
            </p>
          </div>

        </div>
      </section>

      {/* WORKSPACE FORM */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        
        {/* DEMO PRESET PILLS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-secondary fill-secondary" />
              Pilih Contoh Skenario Uji (Data Simulasi):
            </span>
            <span className="text-xs text-on-surface-variant hidden sm:inline">
              Klik untuk memuat URL otomatis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {urlPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.content)}
                className="apple-card-interactive p-4 text-left group"
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    preset.expectedCategory === 'high'
                      ? 'bg-error-container text-error'
                      : preset.expectedCategory === 'review'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-tertiary-container text-on-tertiary-container'
                  }`}>
                    {preset.expectedCategory === 'high' ? 'Indikasi Tinggi' : preset.expectedCategory === 'review' ? 'Perlu Ditinjau' : 'Risiko Rendah'}
                  </span>
                  <span className="text-[10px] font-mono text-on-surface-variant">Skor ~{preset.expectedScore}</span>
                </div>
                <span className="text-xs font-bold text-on-surface block truncate w-full group-hover:text-secondary">
                  {preset.title}
                </span>
                <span className="font-mono text-[11px] text-on-surface-variant truncate block w-full opacity-70 mt-0.5">
                  {preset.content}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* INPUT BOX - Apple Card */}
        <form onSubmit={handleSubmit} className="apple-card p-6 sm:p-8 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label htmlFor="input-url" className="text-sm font-bold text-on-surface">
              Masukkan Alamat Tautan (URL) Lengkap:
            </label>
            <span className="text-xs font-mono text-on-surface-variant">
              {url.length} / 2.048 karakter
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch gap-3">
            <div className="flex-1 relative flex items-center bg-surface-container-low rounded-xl border border-outline-variant focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all px-3.5">
              
              {/* Protocol Badge */}
              <div className="mr-2.5 shrink-0">
                {isHttps ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-mono text-[11px] font-bold">
                    <Lock className="w-3 h-3" />
                    HTTPS
                  </span>
                ) : isHttp ? (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-error font-mono text-[11px] font-bold">
                    <Unlock className="w-3 h-3" />
                    HTTP
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-mono text-[11px]">
                    URL
                  </span>
                )}
              </div>

              <input
                id="input-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                maxLength={2048}
                placeholder="https://contoh-domain.com/halaman"
                className="w-full py-3 bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-hidden font-mono"
              />

              {url && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-on-surface-variant hover:text-on-surface ml-2 transition-colors"
                  title="Bersihkan input"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="btn-animate inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#E86A33] hover:bg-[#D75922] text-white font-bold text-sm transition-all shrink-0 shadow-md shadow-orange-500/20"
            >
              <span>Periksa Tautan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Privacy Consent Checkbox */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-outline-variant/60">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-on-surface">
              <input
                type="checkbox"
                checked={privacyAgreed}
                onChange={(e) => setPrivacyAgreed(e.target.checked)}
                className="rounded border-outline text-secondary focus:ring-secondary w-4 h-4"
              />
              <span className="select-none leading-relaxed">
                Saya menyetujui pemrosesan URL ini sesuai ketentuan{' '}
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="text-secondary underline font-semibold hover:text-secondary-container"
                >
                  Pemberitahuan Privasi
                </button>
              </span>
            </label>

            <span className="text-[11px] text-on-surface-variant">
              Kredensial login &amp; token sensitif disanitasi otomatis sebelum diproses
            </span>
          </div>

          {/* Error Box */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-error shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

        </form>

        {/* Technical Notice & Safety Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="apple-card p-6 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-on-surface">Perlindungan SSRF &amp; Keamanan Pengujian</h4>
              <p className="text-on-surface-variant leading-relaxed">
                Sistem tidak membuka atau mengunduh isi server tujuan URL secara aktif. Evaluasi dilakukan secara aman melalui parser struktur URL dan API reputasi.
              </p>
            </div>
          </div>

          <div className="apple-card p-6 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-tertiary-container flex items-center justify-center text-on-tertiary-container shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-on-surface">Penyelarasan Google Safe Browsing</h4>
              <p className="text-on-surface-variant leading-relaxed">
                Domain yang tidak tercatat pada basis data ancaman dinyatakan <em>"tidak ditemukan pada daftar ancaman"</em>, bukan jaminan pasti aman.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
