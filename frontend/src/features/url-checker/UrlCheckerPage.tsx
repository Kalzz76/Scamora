import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Unlock, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  Globe, 
  AlertTriangle, 
  Play,
  Terminal,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { DEMO_PRESETS } from '../../lib/constants';
import { analysisService } from '../../services/analysisService';
import { Stepper } from '../../components/common/Stepper';
import { UrlDetectiveIllustration } from '../../components/illustrations/Illustrations2D';
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
  const [privacyAgreed, setPrivacyAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const navigate = useNavigate();

  const urlPresets = DEMO_PRESETS.filter((p) => p.type === 'url');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (initialPresetId) {
      const match = DEMO_PRESETS.find((p) => p.id === initialPresetId);
      if (match) {
        setUrl(match.content);
        setActivePresetId(match.id);
        setPrivacyAgreed(true);
      }
    }
  }, [initialPresetId]);

  const isHttps = url.trim().toLowerCase().startsWith('https://');
  const isHttp = url.trim().toLowerCase().startsWith('http://');

  const handleSelectPreset = (preset: typeof urlPresets[0]) => {
    setUrl(preset.content);
    setActivePresetId(preset.id);
    setErrorMessage(null);
    setPrivacyAgreed(true);
    toast.info(`Skenario "${preset.title}" siap diperiksa`);
  };

  const handleClear = () => {
    setUrl('');
    setActivePresetId(null);
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
      setErrorMessage('Anda wajib menyetujui pemberitahuan privasi sebelum memproses analisis.');
      return;
    }

    try {
      new URL(trimmed);
    } catch {
      setErrorMessage('Format URL tidak valid. Pastikan alamat diawali dengan http:// atau https://');
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 min-h-[70vh] flex items-center justify-center">
        <div className="w-full">
          <Stepper type="url" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-transparent text-[#0F172A] relative overflow-hidden">
      
      {/* Background Soft Aura */}
      <div 
        className="absolute top-0 right-0 w-[650px] h-[650px] pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(circle at 70% 30%, rgba(13, 148, 136, 0.12) 0%, rgba(241, 245, 249, 0) 70%)',
        }}
      />

      {/* ASYMMETRIC SPLIT SCREEN 50:50 WORKSPACE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: HERO, 2D DETECTIVE ILLUSTRATION & LIVE TELEMETRY (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Eyebrow Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2ED] text-[#143826] border border-[#143826]/15 font-mono text-xs font-bold uppercase tracking-wider"
            >
              <ShieldCheck className="w-4 h-4 text-[#E86A33]" />
              <span>PEMINDAI TELEMETRI TAUTAN &amp; PHISHING</span>
            </motion.div>

            {/* Bold H1 Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#143826] tracking-tight leading-tight"
            >
              Bedah Keaslian Tautan <span className="text-[#E86A33]">Tanpa Risiko.</span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium"
            >
              Scamora mengisolasi dan membongkar anatomi URL mencurigakan menggunakan pemindai heuristik cerdas—mendeteksi manipulasi subdomain, penyamaran karakter <span className="font-semibold text-gray-900">punycode</span>, dan domain jebakan sebelum browser Anda mengaksesnya.
            </motion.p>

            {/* Prominent 2D Cartoon Visual Dock with Soft Sage Plinth */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#EAF2ED]/70 to-[#F8F9FA] border border-[#143826]/10 flex flex-col items-center justify-center relative overflow-hidden"
            >
              <UrlDetectiveIllustration className="w-64 h-44 sm:w-80 sm:h-52 drop-shadow-sm" />
              
              {/* Telemetry Status Bar Under Illustration */}
              <div className="mt-3 flex items-center gap-3 px-4 py-2 rounded-xl bg-white/90 border border-gray-200/80 shadow-2xs text-[11px] font-mono text-gray-700">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <span className="font-bold text-[#143826]">Sandbox Anti-SSRF Aktif</span>
                <span className="text-gray-300">|</span>
                <span>Zero Retention Guard</span>
              </div>
            </motion.div>

            {/* 3 Live Telemetry Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#143826]">
                  <Globe className="w-3.5 h-3.5 text-[#E86A33]" />
                  <span>Typosquatting</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Membongkar huruf tiruan &amp; subdomain bank palsu.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#143826]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Anti-Infeksi</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Tautan tidak diklik langsung oleh gawai Anda.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#143826]">
                  <Activity className="w-3.5 h-3.5 text-[#143826]" />
                  <span>Radar Global</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Sinkronisasi database ancaman &amp; aduan publik.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE COMMAND CONSOLE DOCK (lg:col-span-6) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-6 space-y-5"
          >
            
            {/* Main Console Box */}
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl shadow-gray-200/60 p-6 sm:p-7 space-y-5">
              
              {/* Console Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#EAF2ED] text-[#143826] flex items-center justify-center font-bold">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 leading-tight">Konsol Forensik Tautan</h2>
                    <p className="text-[11px] text-gray-400 font-mono">Modul Penyelidikan URL Siber</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>ONLINE</span>
                </div>
              </div>

              {/* Form Input Capsule */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Protocol + URL Input Field */}
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 focus-within:bg-white focus-within:border-[#143826] focus-within:ring-2 focus-within:ring-[#143826]/10 transition-all space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 px-1">
                    <span>ALAMAT TARGET (FQDN)</span>
                    {isHttps ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        HTTPS Terdeteksi
                      </span>
                    ) : isHttp ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <Unlock className="w-3 h-3 text-red-600" />
                        HTTP (Tidak Terenkripsi)
                      </span>
                    ) : (
                      <span>Format: https://...</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        if (activePresetId) setActivePresetId(null);
                      }}
                      placeholder="Tempelkan tautan mencurigakan di sini..."
                      className="w-full bg-transparent text-sm sm:text-base font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    />

                    {url && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="p-1.5 text-gray-400 hover:text-gray-700 transition cursor-pointer shrink-0"
                        title="Hapus teks"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Privacy Consent Checkbox */}
                <div className="flex items-start gap-2 pt-1 text-[11px] text-gray-500 leading-snug">
                  <input
                    type="checkbox"
                    id="privacyCheck"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-[#143826] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="privacyCheck" className="cursor-pointer select-none">
                    Saya menyetujui pemindaian keamanan tanpa retensi data sesuai{' '}
                    <button
                      type="button"
                      onClick={onOpenPrivacy}
                      className="text-[#143826] font-bold underline hover:text-[#E86A33]"
                    >
                      Pemberitahuan Privasi
                    </button>
                    . Parameter pribadi disanitasi otomatis.
                  </label>
                </div>

                {/* Large Orange Action Button */}
                <button
                  type="submit"
                  className="btn-animate w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-[#E86A33] hover:bg-[#D75922] text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 cursor-pointer transition-all"
                >
                  <span>Mulai Analisis Telemetri URL</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>

            </div>

            {/* SIMULATION SCENARIO DECK (Stacked Vertically for Quick Test) */}
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-[#E86A33] fill-[#E86A33]" />
                  <span>Uji Skenario Kasus Nyata:</span>
                </span>
                <span className="text-[11px] text-gray-400 font-mono">1-Klik untuk memuat</span>
              </div>

              <div className="space-y-2.5">
                {urlPresets.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  const isHighRisk = preset.expectedCategory === 'high';
                  const isReview = preset.expectedCategory === 'review';

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#EAF2ED] border-[#143826] shadow-2xs ring-1 ring-[#143826]'
                          : 'bg-gray-50/70 hover:bg-white hover:border-gray-300 border-gray-200'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            isHighRisk
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : isReview
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {isHighRisk ? '🔴 Phishing' : isReview ? '🟡 Mencurigakan' : '🟢 Situs Resmi'}
                          </span>
                          <span className="font-bold text-xs text-gray-900 truncate">
                            {preset.title}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-gray-500 truncate pl-0.5">
                          {preset.content}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-gray-400 group-hover:text-gray-900">
                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[#143826] font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Siap</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono text-[11px]">Pilih &rarr;</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </motion.div>

        </div>
      </div>

    </div>
  );
};
