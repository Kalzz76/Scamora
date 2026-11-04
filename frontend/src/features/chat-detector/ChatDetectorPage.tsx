import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, ArrowRight, Eye, EyeOff, RotateCcw, Play, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { DEMO_PRESETS } from '../../lib/constants';
import { analysisService } from '../../services/analysisService';
import { MockAnalyzer } from '../../services/mockAnalyzer';
import { Stepper } from '../../components/common/Stepper';
import type { AnalysisResult } from '../../types/analysis';

interface ChatDetectorPageProps {
  initialPresetId?: string | null;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onOpenPrivacy: () => void;
}

export const ChatDetectorPage: React.FC<ChatDetectorPageProps> = ({
  initialPresetId,
  onAnalysisComplete,
  onOpenPrivacy,
}) => {
  const [chatText, setChatText] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPiiPreview, setShowPiiPreview] = useState(false);
  const navigate = useNavigate();

  const chatPresets = DEMO_PRESETS.filter((p) => p.type === 'chat');

  useEffect(() => {
    if (initialPresetId) {
      const match = DEMO_PRESETS.find((p) => p.id === initialPresetId);
      if (match) {
        setChatText(match.content);
        setPrivacyAgreed(true);
      }
    }
  }, [initialPresetId]);

  const { maskedText, maskedCount } = MockAnalyzer.maskPII(chatText);

  const handleSelectPreset = (content: string) => {
    setChatText(content);
    setErrorMessage(null);
    setPrivacyAgreed(true);
    toast.info('Skenario chat manipulasi dimuat');
  };

  const handleClear = () => {
    setChatText('');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = chatText.trim();
    if (!trimmed) {
      setErrorMessage('Silakan tempelkan teks percakapan WhatsApp terlebih dahulu.');
      return;
    }

    if (trimmed.length < 10) {
      setErrorMessage('Teks percakapan terlalu pendek (minimal 10 karakter).');
      return;
    }

    if (trimmed.length > 5000) {
      setErrorMessage('Teks percakapan melebihi batas maksimal 5.000 karakter.');
      return;
    }

    if (!privacyAgreed) {
      setErrorMessage('Anda wajib menyetujui pemberitahuan privasi sebelum mengirim data.');
      return;
    }

    setLoading(true);

    try {
      const result = await analysisService.analyzeChat({
        text: trimmed,
        privacy_consent: privacyAgreed,
      });
      onAnalysisComplete(result);
      navigate('/laporan');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses analisis chat WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Stepper type="chat" />
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
              Analisis Percakapan AI
            </span>
            <span className="text-[#CFDDD5] text-xs">&bull;</span>
            <span className="text-xs text-[#EAF2ED] font-medium">Modul Inti P0</span>
            <div className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#EAF2ED] border border-white/20 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E86A33]"></span>
              <span>Penyamaran Data Pribadi (PII) Aktif</span>
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Analisis Chat WhatsApp (Scam Detector AI)
            </h1>
            <p className="text-sm text-gray-200 max-w-2xl leading-relaxed">
              Mengevaluasi pola rekayasa sosial, tawaran kerja freelance mencurigakan, modus APK kurir, dan desakan waktu. Indikator bahaya wajib disertai kutipan bukti nyata dari teks.
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
              Pilih Contoh Percakapan (Data Simulasi):
            </span>
            <span className="text-xs text-on-surface-variant hidden sm:inline">
              Klik untuk memuat teks percakapan otomatis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {chatPresets.map((preset) => (
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
                <span className="text-[11px] text-on-surface-variant line-clamp-2 w-full opacity-70 mt-0.5 leading-relaxed">
                  {preset.content}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* INPUT BOX - Apple Card */}
        <form onSubmit={handleSubmit} className="apple-card p-6 sm:p-8 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <label htmlFor="input-chat" className="text-sm font-bold text-on-surface">
                Tempelkan Teks Percakapan WhatsApp:
              </label>
              {maskedCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container font-mono text-[10px] font-bold">
                  {maskedCount} Data Pribadi Disamarkan
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-on-surface-variant">
              {chatText.length} / 5.000 karakter (min. 10)
            </span>
          </div>

          <div className="relative">
            <textarea
              id="input-chat"
              rows={6}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              maxLength={5000}
              placeholder="Tempelkan pesan mencurigakan di sini, contoh: 'Halo kak kami dari tim rekrutmen, ada tugas part-time online like video...'"
              className="w-full p-4 rounded-xl bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm text-on-surface placeholder:text-outline focus:outline-hidden leading-relaxed"
            />

            {chatText && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPiiPreview(!showPiiPreview)}
                  className="px-2.5 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant text-[11px] font-medium text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Lihat teks yang disamarkan sebelum dikirim ke AI"
                >
                  {showPiiPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPiiPreview ? 'Tutup Pratinjau' : 'Pratinjau Masking'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-on-surface transition-colors shadow-2xs"
                  title="Bersihkan input"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* PII Masking Live Preview Box */}
          {showPiiPreview && chatText && (
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-secondary">
                <Shield className="w-3.5 h-3.5" />
                <span>Teks yang Dikirim ke AI (Informasi Pribadi Telah Disamarkan):</span>
              </div>
              <p className="text-xs text-on-surface font-mono whitespace-pre-wrap bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/60 leading-relaxed">
                {maskedText}
              </p>
            </div>
          )}

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
                Saya menyetujui pemrosesan teks percakapan ini sesuai{' '}
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="text-secondary underline font-semibold hover:text-secondary-container"
                >
                  Pemberitahuan Privasi
                </button>
              </span>
            </label>

            <button
              type="submit"
              className="btn-animate inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#E86A33] hover:bg-[#D75922] text-white font-bold text-sm transition-all shrink-0 shadow-md shadow-orange-500/20"
            >
              <span>Mulai Analisis AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Error Box */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-error shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

        </form>

        {/* AI Integrity Statement */}
        <div className="apple-card p-6 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-on-surface">Penyaring Halusinasi &amp; Validasi Bukti Otentik</h4>
            <p className="text-on-surface-variant leading-relaxed">
              Model penalaran semantik AI bekerja dengan skema JSON terstruktur. Setiap temuan tanda bahaya yang tidak memiliki kutipan kalimat asli dari masukan pengguna akan dibuang secara otomatis sebelum skor risiko ditetapkan.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
