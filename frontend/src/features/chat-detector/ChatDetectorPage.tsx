import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Play, 
  Lock,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  CheckCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { DEMO_PRESETS } from '../../lib/constants';
import { analysisService } from '../../services/analysisService';
import { MockAnalyzer } from '../../services/mockAnalyzer';
import { Stepper } from '../../components/common/Stepper';
import { ChatForensicsIllustration } from '../../components/illustrations/Illustrations2D';
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
  const [privacyAgreed, setPrivacyAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPiiPreview, setShowPiiPreview] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const navigate = useNavigate();

  const chatPresets = DEMO_PRESETS.filter((p) => p.type === 'chat');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (initialPresetId) {
      const match = DEMO_PRESETS.find((p) => p.id === initialPresetId);
      if (match) {
        setChatText(match.content);
        setActivePresetId(match.id);
        setPrivacyAgreed(true);
      }
    }
  }, [initialPresetId]);

  const { maskedText, maskedCount } = MockAnalyzer.maskPII(chatText);

  const handleSelectPreset = (preset: typeof chatPresets[0]) => {
    setChatText(preset.content);
    setActivePresetId(preset.id);
    setErrorMessage(null);
    setPrivacyAgreed(true);
    toast.info(`Skenario "${preset.title}" siap diperiksa`);
  };

  const handleClear = () => {
    setChatText('');
    setActivePresetId(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = chatText.trim();
    if (!trimmed) {
      setErrorMessage('Silakan tempelkan teks percakapan WhatsApp yang ingin diperiksa.');
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
      setErrorMessage('Anda wajib menyetujui pemberitahuan privasi sebelum memproses analisis.');
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-24 min-h-[70vh] flex items-center justify-center">
        <div className="w-full">
          <Stepper type="chat" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-transparent text-[#0F172A] relative overflow-hidden">
      
      {/* Background Soft Aura */}
      <div 
        className="absolute top-0 left-0 w-[650px] h-[650px] pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(13, 148, 136, 0.12) 0%, rgba(241, 245, 249, 0) 70%)',
        }}
      />

      {/* DUAL-PANE INTERACTIVE WORKSPACE (Left: Phone Simulator, Right: Forensics Lab) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full relative z-10">
        
        {/* Top Header Bar with Eyebrow and Headline */}
        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF2ED] text-[#143826] border border-[#143826]/15 font-mono text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-[#E86A33]" />
            <span>LABORATORIUM FORENSIK PERCAKAPAN &amp; REKAYASA SOSIAL</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#143826] tracking-tight leading-tight">
                Simulasi &amp; Analisis Chat <span className="text-[#E86A33]">WhatsApp AI.</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600 max-w-3xl mt-2 leading-relaxed">
                Uji dan bedah indikasi manipulasi psikologis, desakan transfer dana, jeratan komisi tugas daring, dan paket file berbahaya secara *real-time* dengan sensor data pribadi otomatis.
              </p>
            </div>

            {/* Quick Privacy Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-gray-200 shadow-2xs font-mono text-xs text-gray-600 shrink-0 self-start lg:self-auto">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Zero-Data Retention Policy</span>
            </div>
          </div>
        </div>

        {/* 2-PANE DUAL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT PANE: 2D SMARTPHONE SIMULATOR MOCKUP (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-4">
            
            {/* Phone Outer Shell */}
            <div className="w-full max-w-[340px] sm:max-w-[360px] bg-gray-900 rounded-[44px] p-3 shadow-2xl border-4 border-gray-800 relative">
              
              {/* Phone Dynamic Island / Speaker Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-20 flex items-center justify-end pr-3">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />
              </div>

              {/* Phone Inner Screen (WhatsApp Layout) */}
              <div className="w-full h-[520px] bg-[#EFEAE2] rounded-[36px] overflow-hidden flex flex-col relative border border-gray-700/50">
                
                {/* Simulated WhatsApp Header */}
                <div className="bg-[#075E54] text-white pt-8 pb-3 px-4 flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-800 border border-white/30 flex items-center justify-center text-xs font-bold font-mono">
                      ?
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm leading-tight flex items-center gap-1">
                        <span>Nomor Mencurigakan</span>
                      </div>
                      <div className="text-[10px] text-emerald-200 font-mono">
                        +62 857-****-4912 &bull; online
                      </div>
                    </div>
                  </div>
                  <Smartphone className="w-4 h-4 text-emerald-300 opacity-70" />
                </div>

                {/* Simulated Chat Messages Body */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-end">
                  
                  {/* System Encryption Banner */}
                  <div className="mx-auto bg-amber-50/90 border border-amber-200/80 rounded-lg px-2.5 py-1 text-[10px] text-amber-800 text-center max-w-[90%] font-medium shadow-2xs">
                    Pesan ini berasal dari kontak yang tidak tersimpan di buku telepon Anda.
                  </div>

                  {/* WhatsApp Incoming Chat Bubble (Dynamic with user text) */}
                  <div className="self-start max-w-[92%] bg-white rounded-2xl rounded-tl-xs p-3 text-xs text-gray-900 shadow-sm border border-gray-200 space-y-1.5 relative">
                    
                    {chatText.trim() ? (
                      <p className="whitespace-pre-wrap leading-relaxed break-words font-sans text-xs">
                        {chatText}
                      </p>
                    ) : (
                      <div className="italic text-gray-400 py-2">
                        Pesan belum dimasukkan. Ketik di panel kanan atau klik salah satu skenario simulasi di bawah...
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 font-mono pt-0.5">
                      <span>10:42</span>
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                    </div>

                  </div>

                </div>

                {/* Simulated WhatsApp Bottom Input Dock */}
                <div className="p-2 bg-[#F0F2F5] border-t border-gray-200 flex items-center gap-2 shrink-0">
                  <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[11px] text-gray-400 border border-gray-200 truncate">
                    Simulasi tampilan perangkat korban
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#00A884] flex items-center justify-center text-white text-xs">
                    &bull;
                  </div>
                </div>

              </div>

            </div>

            {/* 2D Forensic Cartoon Badge below Phone */}
            <div className="w-full max-w-[360px] p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs flex items-center gap-3">
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                <ChatForensicsIllustration className="w-14 h-14" />
              </div>
              <div className="text-left space-y-0.5">
                <div className="text-xs font-bold text-[#143826]">Sensor PII Heuristik</div>
                <div className="text-[11px] text-gray-500 leading-tight">
                  Nomor HP, rekening bank, &amp; nama disamarkan sebelum pemrosesan AI.
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT PANE: FORENSIC INVESTIGATION WORKSPACE (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Investigation Form Card */}
            <form 
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl border border-gray-200/90 shadow-xl shadow-gray-200/50 p-6 sm:p-7 space-y-5"
            >
              
              {/* Card Header & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-xs sm:text-sm text-gray-900 font-mono">
                    Kotak Analisis Forensik Teks
                  </span>
                  {maskedCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                      {maskedCount} Data Disamarkan
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-[11px] text-gray-400">
                    {chatText.length}/5.000 karakter
                  </span>

                  {chatText && (
                    <div className="flex items-center gap-1.5 ml-1">
                      <button
                        type="button"
                        onClick={() => setShowPiiPreview(!showPiiPreview)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                        title="Lihat teks dengan data pribadi yang disamarkan"
                      >
                        {showPiiPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPiiPreview ? 'Tutup Masking' : 'Cek Masking'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClear}
                        className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                        title="Bersihkan teks"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Textarea Area */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Salin &amp; Tempel Pesan Lengkap:
                </label>
                <textarea
                  rows={8}
                  value={chatText}
                  onChange={(e) => {
                    setChatText(e.target.value);
                    if (activePresetId) setActivePresetId(null);
                  }}
                  maxLength={5000}
                  placeholder="Tempelkan pesan atau percakapan WhatsApp mencurigakan di sini...&#10;&#10;Contoh:&#10;Halo kak, kami dari tim HRD Shopee, ada lowongan freelance online komisi 500rb/hari. Tugas pertama langsung ditransfer tapi wajib deposit saldo 2jt dulu..."
                  className="w-full p-4 rounded-2xl bg-gray-50/80 border border-gray-200 focus:bg-white text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#143826] focus:ring-2 focus:ring-[#143826]/10 transition leading-relaxed resize-y min-h-[180px]"
                />
              </div>

              {/* Live Masking Preview Drawer */}
              {showPiiPreview && chatText && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3.5 rounded-2xl bg-[#EAF2ED]/70 border border-[#143826]/20 space-y-1.5 text-xs"
                >
                  <div className="flex items-center gap-1.5 font-bold text-[#143826] font-mono text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Pratinjau Data Aman yang Diterima Mesin AI:</span>
                  </div>
                  <p className="font-mono text-[11px] text-gray-700 whitespace-pre-wrap bg-white p-3 rounded-xl border border-gray-200/80 leading-relaxed max-h-36 overflow-y-auto">
                    {maskedText}
                  </p>
                </motion.div>
              )}

              {/* Error Message */}
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
                  id="privacyConsentChat"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#143826] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="privacyConsentChat" className="cursor-pointer select-none">
                  Saya menyetujui analisis percakapan tanpa retensi log sesuai{' '}
                  <button
                    type="button"
                    onClick={onOpenPrivacy}
                    className="text-[#143826] font-bold underline hover:text-[#E86A33]"
                  >
                    Pemberitahuan Privasi
                  </button>
                  . Teks tidak disimpan ke database permanen.
                </label>
              </div>

              {/* Large Orange Action CTA Button */}
              <button
                type="submit"
                className="btn-animate w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-[#E86A33] hover:bg-[#D75922] text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 cursor-pointer transition-all"
              >
                <span>Mulai Analisis Forensik Percakapan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>

            {/* SIMULATION PRESETS SELECTOR */}
            <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-[#E86A33] fill-[#E86A33]" />
                  <span>Coba Contoh Modus Kejahatan Nyata:</span>
                </span>
                <span className="text-[11px] text-gray-400 font-mono">1-Klik untuk uji</span>
              </div>

              <div className="space-y-2.5">
                {chatPresets.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  const isHighRisk = preset.expectedCategory === 'high';
                  const isReview = preset.expectedCategory === 'review';

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
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
                            {isHighRisk ? '🔴 Penipuan' : isReview ? '🟡 Mencurigakan' : '🟢 Wajar'}
                          </span>
                          <span className="font-bold text-xs text-gray-900 truncate">
                            {preset.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 truncate pl-0.5">
                          {preset.content}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-gray-400">
                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[#143826] font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Terpilih</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono text-[11px]">Muat &rarr;</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
