import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { analysisService } from '../../services/analysisService';
import { directoryService, type ScannedDomain } from '../../services/directoryService';
import { AnalysisResultView } from '../../components/analysis/AnalysisResultView';
import type { AnalysisResult } from '../../types/analysis';

const MODUS_EXAMPLES = [
  {
    type: 'chat' as const,
    title: 'Paket atau resi palsu',
    snippet: '"Paket kamu tertahan di gudang. Bayar biaya admin Rp15.000 sekarang juga..."',
    text: 'Halo Kak, paket pesanan kamu tertahan di gudang logistik kami. Segera bayar biaya admin sebesar Rp15.000 sekarang juga lewat tautan ini agar paket tidak dikembalikan ke pengirim. Link: https://resi-paket-cek.site/bayar',
    color: '#D92D20',
  },
  {
    type: 'url' as const,
    title: 'Undangan pernikahan APK',
    snippet: 'http://undangan-nikah-digital.top/undangan.apk',
    text: 'http://undangan-nikah-digital.top/undangan.apk',
    color: '#1D3F6E',
  },
  {
    type: 'chat' as const,
    title: 'Hadiah undian',
    snippet: '"Selamat! Kamu menang undian Rp50 juta. Segera kirim kode OTP..."',
    text: 'Selamat! Nomor Anda terpilih memenangkan hadiah undian festival belanja sebesar Rp 50.000.000. Segera kirimkan 6 digit kode OTP rahasia yang masuk via SMS ke nomor ini dalam waktu 1 jam sebelum hadiah hangus!',
    color: '#F79009',
  },
  {
    type: 'url' as const,
    title: 'Tilang atau pajak palsu',
    snippet: 'http://tilang-online-bayar.click/denda',
    text: 'http://tilang-online-bayar.click/denda',
    color: '#0F9B8A',
  },
  {
    type: 'chat' as const,
    title: 'Lowongan kerja palsu',
    snippet: '"Dibutuhkan admin online, gaji 8 juta/bulan. Transfer biaya pendaftaran..."',
    text: 'Dibutuhkan segera staf admin online paruh waktu dari rumah, gaji 8 juta per bulan tanpa syarat pengalaman. Untuk aktivasi ID kerja, silakan transfer biaya pendaftaran Rp 200.000 ke rekening bendahara kami lalu konfirmasi ke Telegram: @admin_karir.',
    color: '#7A5AF8',
  },
  {
    type: 'chat' as const,
    title: 'Investasi cepat untung',
    snippet: '"Investasi modal kecil, pasti untung 20% per minggu, jaminan cuan..."',
    text: 'Program investasi syariah tanpa risiko! Modal mulai 500rb, pasti untung dan profit harian 20% per minggu dijamin cuan kembali 100%. Hubungi mentor sekarang juga di grup Telegram resmi.',
    color: '#2B2F3A',
  },
];

const CARA_STEPS = [
  {
    num: '1',
    title: 'Tempel',
    desc: 'Masukkan tautan atau isi chat yang bikin curiga.',
    label: 'Langkah 1: Tempel Tautan atau Chat',
  },
  {
    num: '2',
    title: 'Diperiksa berlapis',
    desc: 'Struktur alamat, daftar ancaman Google, dan isi pesan dibaca AI.',
    label: 'Langkah 2: Pemeriksaan 3 Lapis',
  },
  {
    num: '3',
    title: 'Skor dan bukti',
    desc: 'Setiap tanda bahaya ditunjukkan beserta alasannya.',
    label: 'Langkah 3: Skor Risiko & Rincian Bukti',
  },
  {
    num: '4',
    title: 'Langkah aman',
    desc: 'Kamu tahu apa yang harus dilakukan, dan ke mana melapor.',
    label: 'Langkah 4: Langkah Tindakan Aman',
  },
];

// Dynamic Loading Steps for URL vs Chat
const URL_SCAN_STEPS = [
  'Memvalidasi format URL & struktur domain...',
  'Mengecek reputasi domain di database ancaman global...',
  'Merayapi konten web & mendeteksi form login palsu...',
  'Memindai indikasi berkas APK berbahaya & skrip...',
  'Menganalisis pola phishing dengan Scamora AI...',
  'Menyusun skor risiko & rangkuman bukti temuan...',
];

const CHAT_SCAN_STEPS = [
  'Menyaring & menyamarkan data sensitif (nomor HP, rekening, nama)...',
  'Mendeteksi tautan tersembunyi & file mencurigakan (.apk)...',
  'Menganalisis manipulasi psikologis & urgensi...',
  'Mencocokkan modus ke database penipuan terbaru...',
  'Mengevaluasi tingkat ancaman dengan Scamora AI...',
  'Menyusun rekomendasi & panduan langkah aman...',
];

export const HomePage: React.FC = () => {
  const location = useLocation();

  // Active Input Tab: 'url' or 'chat'
  const [activeTab, setActiveTab] = useState<'url' | 'chat'>('url');

  // Input states
  const [urlInput, setUrlInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [privacyAgreedUrl, setPrivacyAgreedUrl] = useState(false);
  const [privacyAgreedChat, setPrivacyAgreedChat] = useState(false);

  // Status & Error
  const [loading, setLoading] = useState(false);
  const [scanType, setScanType] = useState<'url' | 'chat'>('url');
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Dynamic Community Directory Domains (4 kotak)
  const [recentDomains, setRecentDomains] = useState<ScannedDomain[]>([]);

  // Rotate cool loading steps smoothly
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const currentSteps = scanType === 'url' ? URL_SCAN_STEPS : CHAT_SCAN_STEPS;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < currentSteps.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(interval);
  }, [loading, scanType]);

  useEffect(() => {
    const updateDomains = () => {
      setRecentDomains(directoryService.getDomains().slice(0, 4));
    };
    updateDomains();
    window.addEventListener('storage', updateDomains);
    window.addEventListener('focus', updateDomains);
    return () => {
      window.removeEventListener('storage', updateDomains);
      window.removeEventListener('focus', updateDomains);
    };
  }, []);

  // Cara Kerja Interactive State
  const [currentCaraStep, setCurrentCaraStep] = useState(0);
  const [caraInteracted, setCaraInteracted] = useState(false);
  const [caraPreviewTab, setCaraPreviewTab] = useState<'url' | 'chat'>('url');

  const hasilRef = useRef<HTMLDivElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);

  // Auto rotate cara kerja step if user hasn't clicked
  useEffect(() => {
    if (caraInteracted) return;
    const timer = setInterval(() => {
      setCurrentCaraStep((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(timer);
  }, [caraInteracted]);

  const handleScanUrl = async (targetUrl?: string, bypassConsent = false) => {
    const raw = (targetUrl !== undefined ? targetUrl : urlInput).trim();
    setErrorMessage(null);

    const isConsented = bypassConsent || privacyAgreedUrl;
    if (!isConsented) {
      setErrorMessage('Centang dulu persetujuan ketentuan di atas.');
      return;
    }

    if (!raw) {
      setErrorMessage('Masukkan alamat tautan terlebih dahulu.');
      return;
    }

    let validUrl = false;
    try {
      const u = new URL(raw.startsWith('http') ? raw : `http://${raw}`);
      validUrl = !!u.hostname;
    } catch {
      validUrl = false;
    }

    if (!validUrl) {
      setErrorMessage('Masukkan tautan lengkap yang valid (misal: http://contoh.xyz/login)');
      return;
    }

    setScanType('url');
    setLoadingStep(0);
    setLoading(true);
    setAnalysisResult(null);

    try {
      const res = await analysisService.analyzeUrl({
        url: raw.startsWith('http') ? raw : `http://${raw}`,
        privacy_consent: true,
      });

      setAnalysisResult(res);

      // Record to community directory automatically
      directoryService.recordDomain(raw, res.risk_score || res.raw_score || 0, res.risk_level || 'review');
      setRecentDomains(directoryService.getDomains().slice(0, 4));

      // Smooth scroll to results
      setTimeout(() => {
        hasilRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Pemeriksaan tautan gagal diproses.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanChat = async (targetChat?: string, bypassConsent = false) => {
    const raw = (targetChat !== undefined ? targetChat : chatInput).trim();
    setErrorMessage(null);

    const isConsented = bypassConsent || privacyAgreedChat;
    if (!isConsented) {
      setErrorMessage('Centang dulu persetujuan ketentuan di atas.');
      return;
    }

    if (!raw || raw.length < 10) {
      setErrorMessage('Isi chat minimal 10 karakter.');
      return;
    }

    if (raw.length > 5000) {
      setErrorMessage('Isi chat maksimal 5.000 karakter.');
      return;
    }

    setScanType('chat');
    setLoadingStep(0);
    setLoading(true);
    setAnalysisResult(null);

    try {
      const res = await analysisService.analyzeChat({
        text: raw,
        privacy_consent: true,
      });

      setAnalysisResult(res);

      // Smooth scroll to results
      setTimeout(() => {
        hasilRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Pemeriksaan pesan WhatsApp gagal diproses.');
    } finally {
      setLoading(false);
    }
  };

  // Handle prefill from Community Directory or navigation
  useEffect(() => {
    const state = location.state as { prefillUrl?: string } | null;
    if (state?.prefillUrl) {
      setActiveTab('url');
      setUrlInput(state.prefillUrl);
      setPrivacyAgreedUrl(true);
      handleScanUrl(state.prefillUrl, true);
    }
  }, [location.state]);

  const handleSelectModus = (modus: typeof MODUS_EXAMPLES[0]) => {
    setActiveTab(modus.type);
    setErrorMessage(null);

    if (modus.type === 'url') {
      setUrlInput(modus.text);
      setPrivacyAgreedUrl(true);
      inputSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      handleScanUrl(modus.text, true);
    } else {
      setChatInput(modus.text);
      setPrivacyAgreedChat(true);
      inputSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      handleScanChat(modus.text, true);
    }
    toast.info(`Memuat contoh: ${modus.title}`);
  };

  return (
    <div className="flex flex-col w-full bg-[#faf8f5] text-[#14161c] pb-20 lg:pb-0">
      
      {/* 1. HERO FOLD: FULL PAGE VIEWPORT (100dvh) SESUAI DESAIN REFERENSI */}
      <section 
        ref={inputSectionRef} 
        className="relative w-full min-h-[100dvh] h-auto lg:h-[100dvh] flex flex-col justify-center items-center pt-20 sm:pt-24 lg:pt-20 pb-16 sm:pb-12 px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Background Vector Shapes 16:9 Full Page */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <svg viewBox="0 0 1847 852" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <path d="M0 0H440L380 120Q365 134 345 134H0Z" fill="#2b2f3a" />
            <path d="M440 0H545L470 134H380Z" fill="#e9e8e6" />
            <path d="M0 134H250L0 270Z" fill="#8e98ab" opacity="0.7" />
            <path d="M1847 300V852H1130Q1330 760 1500 640Q1640 540 1847 300Z" fill="#e9e8e6" opacity="0.8" />
            <path d="M1847 430V852H1450Q1460 780 1560 730Q1700 690 1750 560Q1790 470 1847 430Z" fill="#2b2f3a" />
            <path d="M1640 740Q1760 700 1847 720V852H1590Z" fill="#8e98ab" opacity="0.7" />
            <path d="M630 0Q560 120 330 175Q60 230 50 520Q47 620 0 700" fill="none" stroke="#8e98ab" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.6" />
          </svg>
        </div>

        {/* Soft Bottom Transition Fade to eliminate cut-off (Desktop only) */}
        <div 
          className="hidden lg:block absolute bottom-0 left-0 right-0 h-32 sm:h-44 lg:h-56 pointer-events-none bg-gradient-to-t from-[#faf8f5] via-[#faf8f5]/85 to-transparent z-10" 
          aria-hidden="true" 
        />

        {/* Center Content: Sesuai Ukuran Proporsional Referensi */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col items-center">

          {/* Headline */}
          <h1 
            className="font-bold font-['DM_Sans',sans-serif] text-[#14161c] text-3xl sm:text-5xl lg:text-[calc(var(--u16)*4.5)] leading-[1.12] sm:leading-[1.05] lg:leading-[1.03] tracking-tight mb-3 sm:mb-4 lg:mb-[calc(var(--u16)*1.3)]"
          >
            Cek dulu sebelum<br />
            kamu <span className="text-[#1d3f6e]">klik</span> atau <span className="text-[#1d3f6e]">balas.</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-[#4b5160] text-xs sm:text-base lg:text-[calc(var(--u16)*1.3)] max-w-[92vw] sm:max-w-xl lg:max-w-[calc(var(--u16)*52)] mx-auto leading-relaxed font-['DM_Sans',sans-serif] mb-5 sm:mb-6 lg:mb-[calc(var(--u16)*2)] px-2"
          >
            Tempel tautan atau chat WhatsApp yang bikin curiga. Hasilnya langsung muncul di bawah.
          </p>

          {/* Tab Switcher Pills */}
          <div className="inline-flex p-1 bg-[#eeece8] rounded-full shadow-2xs max-w-full" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'url'}
              onClick={() => { setActiveTab('url'); setErrorMessage(null); }}
              className={`font-['DM_Sans',sans-serif] text-xs sm:text-sm lg:text-[calc(var(--u16)*1.05)] py-2 px-3.5 sm:py-2.5 sm:px-6 lg:py-[calc(var(--u16)*1.05)] lg:px-[calc(var(--u16)*2.8)] rounded-full transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-[#14161c] text-white font-bold shadow-xs'
                  : 'bg-transparent text-[#14161c] font-medium hover:text-black'
              }`}
            >
              Cek Tautan
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'chat'}
              onClick={() => { setActiveTab('chat'); setErrorMessage(null); }}
              className={`font-['DM_Sans',sans-serif] text-xs sm:text-sm lg:text-[calc(var(--u16)*1.05)] py-2 px-3.5 sm:py-2.5 sm:px-6 lg:py-[calc(var(--u16)*1.05)] lg:px-[calc(var(--u16)*2.8)] rounded-full transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[#14161c] text-white font-bold shadow-xs'
                  : 'bg-transparent text-[#14161c] font-medium hover:text-black'
              }`}
            >
              Cek Chat WhatsApp
            </button>
          </div>

          {/* Row Form */}
          <div 
            className="w-full max-w-[680px] lg:w-[calc(var(--u16)*66)] mx-auto mt-4 sm:mt-6"
          >
            {activeTab === 'url' ? (
              <div 
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 lg:gap-[calc(var(--u16)*1.2)]"
              >
                <div 
                  className="flex-1 flex items-center h-12 sm:h-13 lg:h-[calc(var(--u16)*4.4)] px-4 sm:px-5 lg:px-[calc(var(--u16)*2)] gap-2.5 sm:gap-3 bg-white border border-[#d9d6d0] rounded-full shadow-xs focus-within:border-[#14161c] focus-within:ring-2 focus-within:ring-[#14161c]/10 transition-all"
                >
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[calc(var(--u16)*1.7)] lg:h-[calc(var(--u16)*1.7)] shrink-0 text-[#14161c]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/>
                    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>
                  </svg>
                  <input
                    id="inp-url"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleScanUrl(); }}
                    placeholder="Tempel tautan di sini, contoh: http://bank-nusa-login.xyz"
                    className="flex-1 min-w-0 border-0 outline-none bg-transparent font-['DM_Sans',sans-serif] text-xs sm:text-sm lg:text-[calc(var(--u16)*1.05)] text-[#14161c] placeholder:text-[#8a8f9c] focus:outline-none focus:ring-0 focus-visible:outline-none"
                  />
                </div>
                <button
                  type="button"
                  id="go"
                  disabled={loading}
                  onClick={() => handleScanUrl()}
                  className="h-11 sm:h-13 lg:h-[calc(var(--u16)*4.4)] px-6 sm:px-7 lg:px-[calc(var(--u16)*2.3)] text-xs sm:text-sm lg:text-[calc(var(--u16)*1.05)] rounded-full bg-[#14161c] hover:bg-[#2b2f3a] disabled:opacity-50 text-white font-['DM_Sans',sans-serif] font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-[0_0.6rem_1.5rem_rgba(0,0,0,0.18)] shrink-0"
                >
                  <span>{loading ? 'Memeriksa...' : 'Periksa'}</span>
                  <svg 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-[calc(var(--u16)*1.3)] lg:h-[calc(var(--u16)*1.3)]"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div 
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 lg:gap-[calc(var(--u16)*1.2)]"
              >
                <div 
                  className="flex-1 flex items-center h-12 sm:h-13 lg:h-[calc(var(--u16)*4.4)] px-4 sm:px-5 lg:px-[calc(var(--u16)*2)] gap-2.5 sm:gap-3 bg-white border border-[#d9d6d0] rounded-full shadow-xs focus-within:border-[#14161c] focus-within:ring-2 focus-within:ring-[#14161c]/10 transition-all"
                >
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[calc(var(--u16)*1.7)] lg:h-[calc(var(--u16)*1.7)] shrink-0 text-[#14161c]" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <input
                    id="inp-chat"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleScanChat(); }}
                    placeholder="Tempel isi chat WhatsApp yang bikin curiga di sini"
                    className="flex-1 min-w-0 border-0 outline-none bg-transparent font-['DM_Sans',sans-serif] text-xs sm:text-sm lg:text-[calc(var(--u16)*1.05)] text-[#14161c] placeholder:text-[#8a8f9c] focus:outline-none focus:ring-0 focus-visible:outline-none"
                  />
                </div>
                <button
                  type="button"
                  id="go"
                  disabled={loading}
                  onClick={() => handleScanChat()}
                  className="h-11 sm:h-13 lg:h-[calc(var(--u16)*4.4)] px-6 sm:px-7 lg:px-[calc(var(--u16)*2.3)] text-xs sm:text-sm lg:text-[calc(var(--u16)*1.05)] rounded-full bg-[#14161c] hover:bg-[#2b2f3a] disabled:opacity-50 text-white font-['DM_Sans',sans-serif] font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-[0_0.6rem_1.5rem_rgba(0,0,0,0.18)] shrink-0"
                >
                  <span>{loading ? 'Memeriksa...' : 'Periksa'}</span>
                  <svg 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-[calc(var(--u16)*1.3)] lg:h-[calc(var(--u16)*1.3)]"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Checkbox Persetujuan (Sesuai Logika Asli Scamora) */}
            <div className="text-left font-['DM_Sans',sans-serif] text-[#14161c] mt-3 sm:mt-3.5">
              <label className="flex items-start gap-2 text-xs sm:text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="c1"
                  checked={activeTab === 'url' ? privacyAgreedUrl : privacyAgreedChat}
                  onChange={(e) => {
                    if (activeTab === 'url') {
                      setPrivacyAgreedUrl(e.target.checked);
                    } else {
                      setPrivacyAgreedChat(e.target.checked);
                    }
                  }}
                  className="scamora-check mt-0.5 shrink-0"
                />
                <span className="text-[#5B5850]">Saya menyetujui ketentuan dan kebijakan privasi Scamora.</span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div 
              className="w-full max-w-[680px] lg:w-[calc(var(--u16)*66)] p-3.5 rounded-2xl bg-[#fee4e2] text-[#b42318] text-xs sm:text-sm font-semibold border border-[#fda29b] text-left mx-auto mt-3"
            >
              {errorMessage}
            </div>
          )}

          {/* Cool Dynamic Loading Indicator */}
          {loading && (() => {
            const currentSteps = scanType === 'url' ? URL_SCAN_STEPS : CHAT_SCAN_STEPS;
            const progress = Math.min(96, Math.round(((loadingStep + 1) / currentSteps.length) * 100));
            return (
              <div 
                className="w-full max-w-[680px] lg:w-[calc(var(--u16)*66)] p-4 sm:p-5 rounded-2xl bg-white border border-[#d9d6d0] shadow-[0_12px_32px_-12px_rgba(20,22,28,0.15)] mx-auto overflow-hidden text-left animate-in fade-in duration-200 mt-4"
              >
                {/* Header: Scanner Badge + Step Count + Percentage */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-4 h-4 border-2 border-[#14161c] border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#14161c] text-white">
                      {scanType === 'url' ? 'URL Scanner' : 'Chat Analyzer'}
                    </span>
                    <span className="text-xs text-[#8c887b] font-mono truncate">
                      Tahap {loadingStep + 1} dari {currentSteps.length}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#14161c] shrink-0">
                    {progress}%
                  </span>
                </div>

                {/* Animated Dynamic Status Text */}
                <div className="min-h-[26px] flex items-center">
                  <div 
                    key={loadingStep} 
                    className="text-xs sm:text-sm font-semibold text-[#14161c] flex items-center gap-2 truncate animate-in fade-in duration-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#0f9b8a] shrink-0 animate-pulse" />
                    <span className="truncate">{currentSteps[loadingStep]}</span>
                  </div>
                </div>

                {/* Mini Progress Bar */}
                <div className="w-full h-1.5 bg-[#eeeae0] rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full bg-[#14161c] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })()}

        </div>

        {/* Scroll Down Indicator (Desktop & Tablet only) */}
        <div className="hidden sm:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-1 text-[#8c887b] opacity-80 hover:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[11px] font-medium tracking-wide">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce text-[#4b5160]" />
        </div>
      </section>

      {/* 2. HASIL ANALISIS (HANYA MUNCUL JIKA ADA HASIL ANALISIS) */}
      {analysisResult && (
        <div ref={hasilRef} id="hasil" className="w-full max-w-[1120px] mx-auto px-4 sm:px-8 py-10">
          <AnalysisResultView
            result={analysisResult}
            onReset={() => {
              setAnalysisResult(null);
              setUrlInput('');
              setChatInput('');
            }}
          />
        </div>
      )}

      {/* 3. SECTION: APA ITU SCAMORA */}
      <section className="sec-enhanced sec-tentang max-w-[1120px] mx-auto px-4 sm:px-8 pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12 lg:pb-16 w-full" id="tentang">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <h2 className="sec-heading-bar font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#14161C] tracking-tight leading-tight">
              Apa itu Scamora?
            </h2>
            <p className="text-base sm:text-lg text-[#5B5850] mt-4 leading-relaxed">
              Scamora memeriksa tautan dan pesan WhatsApp yang mencurigakan. Kamu tempel, kami periksa dari beberapa sisi, lalu kamu mendapat skor risiko, bukti, dan langkah aman dalam bahasa sehari-hari. Dibuat untuk anak muda Indonesia yang sering menerima tautan dari orang tak dikenal.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-[22px] border border-[#E3E0DA] border-l-[5px] border-l-[#1d3f6e] p-5 sm:p-6 shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)]">
              <b className="font-bold text-sm sm:text-base text-[#14161C] block">Gratis, tanpa login</b>
              <div className="text-xs sm:text-sm text-[#5B5850] mt-1">Langsung pakai, tidak perlu daftar akun.</div>
            </div>
            <div className="bg-white rounded-[22px] border border-[#E3E0DA] border-l-[5px] border-l-[#1d3f6e] p-5 sm:p-6 shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)]">
              <b className="font-bold text-sm sm:text-base text-[#14161C] block">Bahasa yang mudah dipahami</b>
              <div className="text-xs sm:text-sm text-[#5B5850] mt-1">Tanda bahaya dijelaskan tanpa istilah teknis.</div>
            </div>
            <div className="bg-white rounded-[22px] border border-[#E3E0DA] border-l-[5px] border-l-[#1d3f6e] p-5 sm:p-6 shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)]">
              <b className="font-bold text-sm sm:text-base text-[#14161C] block">Input tidak disimpan</b>
              <div className="text-xs sm:text-sm text-[#5B5850] mt-1">Tautan dan chat kamu tidak disimpan di server.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: CARA KERJA INTERAKTIF */}
      <section className="sec-enhanced sec-cara max-w-[1120px] mx-auto px-4 sm:px-8 py-8 sm:py-12 lg:py-16 w-full" id="cara">
        <div className="flex justify-between items-end gap-4 flex-wrap mb-8">
          <div>
            <h2 className="sec-heading-bar font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#14161C] tracking-tight leading-tight">
              Cara kerja
            </h2>
            <p className="text-base sm:text-lg text-[#5B5850] mt-3">
              Pemeriksaan berlapis dari input sampai panduan tindakan aman.
            </p>
          </div>
          <div className="inline-block px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-[#EEEAE0] text-[#3F3C35]">
            Langkah {currentCaraStep + 1} dari 4
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4 sm:gap-6 lg:gap-8 items-stretch">
          
          {/* Mobile Only: Horizontal Segmented Stepper Bar */}
          <div className="lg:hidden flex items-center gap-1.5 p-1.5 bg-[#EEEAE0]/75 backdrop-blur-sm rounded-2xl border border-[#D5D0C3]/70 overflow-x-auto scrollbar-none">
            {CARA_STEPS.map((step, idx) => {
              const active = currentCaraStep === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCaraInteracted(true);
                    setCurrentCaraStep(idx);
                  }}
                  className={`flex-1 min-w-[70px] py-2 px-1.5 rounded-xl font-display font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#1d3f6e] text-white shadow-xs'
                      : 'bg-transparent text-[#5B5850] hover:text-[#14161C]'
                  }`}
                >
                  <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                    active ? 'bg-white/20 text-white' : 'bg-black/5 text-[#5B5850]'
                  }`}>
                    {step.num}
                  </span>
                  <span className="truncate">{step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Kolom Kiri Desktop: 4 Step Buttons with Vertical Connecting Line */}
          <div className="hidden lg:flex cara-steps-line flex-col gap-2 justify-center">
            {CARA_STEPS.map((step, idx) => {
              const active = currentCaraStep === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCaraInteracted(true);
                    setCurrentCaraStep(idx);
                  }}
                  className={`p-4 sm:p-5 rounded-[22px] text-left transition-all flex items-start gap-4 cursor-pointer ${
                    active
                      ? 'bg-white shadow-[0_20px_44px_-20px_rgba(29,63,110,0.4)] text-[#1d3f6e]'
                      : 'bg-transparent hover:bg-[#1d3f6e]/[0.06] text-[#14161C]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 min-w-9 rounded-full flex items-center justify-center font-display font-bold text-sm transition-all relative z-10 ${
                      active
                        ? 'bg-[#1d3f6e] text-white shadow-[0_0_0_6px_rgba(29,63,110,0.13)]'
                        : 'bg-white text-[#1d3f6e] border-2 border-[#C9D6EA]'
                    }`}
                  >
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <div className={`font-display font-bold text-base sm:text-lg leading-tight ${active ? 'text-[#1d3f6e]' : 'text-[#14161C]'}`}>
                      {step.title}
                    </div>
                    <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${active ? 'text-[#4B5160]' : 'text-[#5B5850]'}`}>
                      {step.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Kolom Kanan: Pratinjau Interaktif */}
          <div className="preview-card-glow bg-white border border-[#E3E0DA] rounded-[26px] p-5 sm:p-6 lg:p-7 flex flex-col justify-between shadow-[0_30px_60px_-30px_rgba(29,63,110,0.4)] min-h-[420px] sm:min-h-[460px]">
            <div className="flex items-center justify-between border-b border-[#EEEAE0] pb-3 sm:pb-4 mb-3 sm:mb-5">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold font-display text-[#14161C]">
                <span className="w-2 h-2 rounded-full bg-[#14161C]"></span>
                <span>{CARA_STEPS[currentCaraStep].label}</span>
              </div>
              <span className="text-[11px] font-mono text-[#8C887B]">
                Langkah {currentCaraStep + 1}/4
              </span>
            </div>

            {/* Mobile Active Step Description Banner */}
            <div className="lg:hidden -mt-1 mb-3 bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-2.5 text-xs text-[#4B5160] leading-snug">
              <b>{CARA_STEPS[currentCaraStep].title}:</b> {CARA_STEPS[currentCaraStep].desc}
            </div>

            {/* Slide 0: Tempel */}
            {currentCaraStep === 0 && (
              <div className="flex flex-col gap-4 flex-1 animate-in fade-in duration-200">
                <div className="flex gap-1.5" role="tablist">
                  <button
                    type="button"
                    onClick={() => setCaraPreviewTab('url')}
                    className={`h-9 px-4 rounded-full text-xs transition-all cursor-pointer inline-flex items-center ${
                      caraPreviewTab === 'url'
                        ? 'bg-[#14130F] text-white font-semibold shadow-xs'
                        : 'bg-[#EEEAE0] text-[#5B5850] hover:text-[#14130F] font-medium'
                    }`}
                  >
                    Cek Tautan
                  </button>
                  <button
                    type="button"
                    onClick={() => setCaraPreviewTab('chat')}
                    className={`h-9 px-4 rounded-full text-xs transition-all cursor-pointer inline-flex items-center ${
                      caraPreviewTab === 'chat'
                        ? 'bg-[#14130F] text-white font-semibold shadow-xs'
                        : 'bg-[#EEEAE0] text-[#5B5850] hover:text-[#14130F] font-medium'
                    }`}
                  >
                    Cek WhatsApp
                  </button>
                </div>

                {caraPreviewTab === 'url' ? (
                  <>
                    <div className="flex items-center gap-3 bg-white border-[1.5px] border-[#14130F] rounded-xl p-3 sm:p-3.5 shadow-2xs">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14130F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                      <div className="flex-1 font-mono text-xs sm:text-sm text-[#14130F] truncate">
                        https://bank-nusa-login.xyz/verifikasi-akun
                      </div>
                      <button
                        type="button"
                        onClick={() => { setCaraInteracted(true); setCurrentCaraStep(1); }}
                        className="h-8 px-3.5 bg-[#14130F] hover:bg-[#2b2f3a] text-white rounded-full text-xs font-semibold inline-flex items-center shrink-0 cursor-pointer transition-colors"
                      >
                        Periksa
                      </button>
                    </div>

                    <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#3F3C35]">
                      <div className="flex items-start gap-2.5">
                        <span className="w-4.5 h-4.5 min-w-4.5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                        <span>Mendukung tautan web mencurigakan, domain singkat, &amp; chat WhatsApp</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-4.5 h-4.5 min-w-4.5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                        <span>Nomor HP, rekening bank, dan email disamarkan otomatis</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-4.5 h-4.5 min-w-4.5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                        <span>Input kamu tidak pernah disimpan di server (privasi terjaga)</span>
                      </div>
                    </div>

                    <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3.5 text-xs sm:text-sm text-[#5B5850] mt-auto">
                      <b>Tips:</b> Tempel seluruh pesan chat apa adanya. Sistem otomatis memilah bagian berbahaya tanpa kamu harus mengeditnya dulu.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-2.5 bg-white border-[1.5px] border-[#14130F] rounded-xl p-3 sm:p-3.5 shadow-2xs">
                      <div className="flex items-start gap-2.5">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f9b8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <div className="flex-1 text-xs sm:text-sm text-[#14130F] leading-snug font-medium line-clamp-2">
                          &ldquo;Selamat! Kamu memenangkan undian Rp50.000.000. Segera kirim kode OTP SMS sekarang sebelum hangus!&rdquo;
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#EEEAE0]">
                        <span className="text-[11px] text-[#8C887B] font-mono">Sensitif: HP &amp; rekening disamarkan</span>
                        <button 
                          type="button"
                          onClick={() => { setCaraInteracted(true); setCurrentCaraStep(1); }}
                          className="h-7 px-3 bg-[#14130F] hover:bg-[#2b2f3a] text-white rounded-full text-xs font-semibold inline-flex items-center shrink-0 cursor-pointer transition-colors"
                        >
                          Periksa Chat
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#3F3C35]">
                      <div className="flex items-start gap-2.5">
                        <span className="w-4.5 h-4.5 min-w-4.5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                        <span>Analisis rekayasa sosial, manipulasi psikologis, &amp; desakan waktu</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-4.5 h-4.5 min-w-4.5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                        <span>Nomor HP, rekening bank, &amp; PIN disamarkan otomatis sebelum dibaca AI</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-4.5 h-4.5 min-w-4.5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                        <span>Isi chat tidak pernah disimpan di server (zero-retention guarantee)</span>
                      </div>
                    </div>

                    <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3.5 text-xs sm:text-sm text-[#5B5850] mt-auto">
                      <b>Tips WhatsApp:</b> Penipu sering memakai desakan waktu atau hadiah palsu. Tempel pesan utuh agar konteks ancaman terbaca akurat.
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Slide 1: Diperiksa berlapis */}
            {currentCaraStep === 1 && (
              <div className="flex flex-col gap-3 flex-1 animate-in fade-in duration-200">
                <div className="text-xs font-bold text-[#5B5850]">HASIL PEMERIKSAAN SISTEM:</div>
                
                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 sm:p-3.5 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <div className="font-bold text-[#14130F]">1. Struktur Domain &amp; Ekstensi</div>
                    <div className="text-xs text-[#5B5850]">Typosquatting nama merek, ekstensi .xyz murah</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FEF0C7] text-[#93370D] font-bold text-xs">Terdeteksi</span>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 sm:p-3.5 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <div className="font-bold text-[#14130F]">2. Basis Data Google Safe Browsing</div>
                    <div className="text-xs text-[#5B5850]">Pencocokan daftar blacklist ancaman global</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FEE4E2] text-[#B42318] font-bold text-xs">Diverifikasi</span>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 sm:p-3.5 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <div className="font-bold text-[#14130F]">3. Analisis Rekayasa Sosial AI</div>
                    <div className="text-xs text-[#5B5850]">Desakan batas waktu &amp; permintaan OTP sensitif</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#DCFAE6] text-[#067647] font-bold text-xs">Aktif</span>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3.5 text-xs sm:text-sm text-[#5B5850] mt-auto">
                  <b>Analisis Berjalan:</b> Tiga lapisan pengujian berjalan simultan dalam hitungan detik.
                </div>
              </div>
            )}

            {/* Slide 2: Skor dan bukti */}
            {currentCaraStep === 2 && (
              <div className="flex flex-col gap-3.5 flex-1 animate-in fade-in duration-200">
                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-4 sm:p-5 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-[#5B5850] uppercase tracking-wider">SKOR RISIKO TERDETEKSI</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-display text-4xl sm:text-5xl font-bold text-[#B42318] leading-none">85</span>
                      <span className="text-sm sm:text-base text-[#5B5850]">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3.5 py-1.5 rounded-full bg-[#FEE4E2] text-[#B42318] text-xs sm:text-sm font-bold inline-block">
                      Risiko Tinggi
                    </span>
                    <div className="text-xs text-[#5B5850] mt-1">Indikasi bahaya kuat</div>
                  </div>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 sm:p-3.5 space-y-1.5">
                  <div className="h-2 rounded-full bg-[#EEEAE0] overflow-hidden flex">
                    <div style={{ flex: 30 }} className="bg-[#12B76A]" />
                    <div style={{ flex: 30 }} className="bg-[#F79009]" />
                    <div style={{ flex: 40 }} className="bg-[#D92D20]" />
                  </div>
                  <div className="flex justify-between text-xs text-[#5B5850]">
                    <span>Rendah (0–29)</span>
                    <span>Perlu ditinjau (30–59)</span>
                    <span className="font-bold text-[#B42318]">Tinggi (60–100) ▲</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs sm:text-sm mt-auto">
                  <div className="bg-white border border-[#EAE6DC] rounded-lg p-2.5 flex items-center justify-between">
                    <span>⚠️ Nama domain meniru merek (bank-nusa)</span>
                    <b className="text-[#B42318]">+35</b>
                  </div>
                  <div className="bg-white border border-[#EAE6DC] rounded-lg p-2.5 flex items-center justify-between">
                    <span>⚠️ Kata kunci sensitif verifikasi akun</span>
                    <b className="text-[#B42318]">+30</b>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 3: Langkah aman */}
            {currentCaraStep === 3 && (
              <div className="flex flex-col gap-3 flex-1 animate-in fade-in duration-200">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 flex items-center gap-2.5">
                    <span className="w-5 h-5 min-w-5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-xs font-bold">✓</span>
                    <span><b>Berhenti:</b> Jangan isi OTP, password, atau transfer dana.</span>
                  </div>
                  <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 flex items-center gap-2.5">
                    <span className="w-5 h-5 min-w-5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-xs font-bold">✓</span>
                    <span><b>Amankan:</b> Ganti kata sandi m-banking &amp; aktifkan 2FA.</span>
                  </div>
                  <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 flex items-center gap-2.5">
                    <span className="w-5 h-5 min-w-5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-xs font-bold">✓</span>
                    <span><b>Hubungi:</b> Hubungi kanal resmi bank / instansi terkait.</span>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <div className="text-xs font-bold tracking-wider text-[#5B5850] uppercase mb-1.5">
                    KANAL RESMI PEMERINTAH:
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white border border-[#EAE6DC] rounded-lg p-2.5">
                      <div className="font-bold text-xs sm:text-sm">cekrekening.id</div>
                      <div className="text-[11px] text-[#5B5850]">Rekening</div>
                    </div>
                    <div className="bg-white border border-[#EAE6DC] rounded-lg p-2.5">
                      <div className="font-bold text-xs sm:text-sm">aduannomor.id</div>
                      <div className="text-[11px] text-[#5B5850]">Nomor HP</div>
                    </div>
                    <div className="bg-white border border-[#EAE6DC] rounded-lg p-2.5">
                      <div className="font-bold text-xs sm:text-sm">lapor.go.id</div>
                      <div className="text-[11px] text-[#5B5850]">Pengaduan</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step Walkthrough Controller (Prev / Next & Dots) */}
            <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-[#EEEAE0] text-xs">
              <button
                type="button"
                onClick={() => {
                  setCaraInteracted(true);
                  setCurrentCaraStep((prev) => (prev > 0 ? prev - 1 : 3));
                }}
                className="h-8 px-3 rounded-full border border-[#D5D0C3] text-[#5B5850] hover:text-[#14161C] hover:bg-[#FAF8F5] font-semibold transition cursor-pointer flex items-center gap-1 text-xs"
              >
                <span>&larr;</span>
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1.5">
                {CARA_STEPS.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => {
                      setCaraInteracted(true);
                      setCurrentCaraStep(dotIdx);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentCaraStep === dotIdx ? 'w-5 bg-[#1d3f6e]' : 'w-1.5 bg-[#D5D0C3]'
                    }`}
                    aria-label={`Langkah ${dotIdx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setCaraInteracted(true);
                  setCurrentCaraStep((prev) => (prev < 3 ? prev + 1 : 0));
                }}
                className="h-8 px-3.5 rounded-full bg-[#1d3f6e] hover:bg-[#2b2f3a] text-white font-semibold shadow-xs transition cursor-pointer flex items-center gap-1 text-xs"
              >
                <span>{currentCaraStep === 3 ? 'Ulangi' : 'Berikutnya'}</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5. SECTION: CIRI-CIRI TAUTAN PHISHING */}
      <section className="sec-enhanced sec-phishing max-w-[1120px] mx-auto px-4 sm:px-8 py-8 sm:py-12 lg:py-16 w-full" id="ciri">
        <h2 className="sec-heading-bar font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#14161C] tracking-tight leading-tight">
          Ciri-ciri tautan phishing
        </h2>
        <p className="text-base sm:text-lg text-[#5B5850] mt-3">
          Enam tanda yang paling sering muncul saat penipuan mencoba mengelabui korban.
        </p>

        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory gap-4 sm:gap-5 mt-5 sm:mt-7 pb-3 sm:pb-0 scrollbar-none">
          
          {/* Card 1 */}
          <div className="w-[82vw] max-w-[310px] shrink-0 sm:w-auto snap-start bg-white rounded-[20px] border border-[#E3E0DA] border-t-4 border-t-[#1d3f6e] p-5 sm:p-6 flex flex-col justify-between shadow-[0_14px_34px_-18px_rgba(29,63,110,0.25)] hover:border-[#14161C] transition-all">
            <div>
              <div className="mb-3">
                <span className="bg-[#E8EEF7] text-[#1d3f6e] px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider">
                  TANDA 01
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#14161C] mb-2 leading-snug">
                Nama domain mirip merek
              </h3>
              <p className="text-sm text-[#5B5850] leading-relaxed mb-4">
                Penipu menambah kata atau memodifikasi huruf agar terlihat resmi saat sekilas dibaca.
              </p>
            </div>
            <div className="font-mono text-xs leading-normal bg-[#EEF3FA] border border-[#D6E0EF] rounded-lg p-3 text-[#2D2A24] mt-auto">
              <span className="text-[#067647] font-semibold">bank-nusa.co.id</span> 
              <span className="text-[#8C887B] mx-1.5">vs</span> 
              <span className="text-[#B42318] font-semibold">bank-nusa-login.xyz</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="w-[82vw] max-w-[310px] shrink-0 sm:w-auto snap-start bg-white rounded-[20px] border border-[#E3E0DA] border-t-4 border-t-[#1d3f6e] p-5 sm:p-6 flex flex-col justify-between shadow-[0_14px_34px_-18px_rgba(29,63,110,0.25)] hover:border-[#14161C] transition-all">
            <div>
              <div className="mb-3">
                <span className="bg-[#E8EEF7] text-[#1d3f6e] px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider">
                  TANDA 02
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#14161C] mb-2 leading-snug">
                Ekstensi domain janggal
              </h3>
              <p className="text-sm text-[#5B5850] leading-relaxed mb-4">
                Beberapa ekstensi domain murah atau anonim sering dimanfaatkan untuk situs penipuan massal.
              </p>
            </div>
            <div className="bg-[#EEF3FA] border border-[#D6E0EF] rounded-lg p-3 mt-auto">
              <div className="flex gap-1.5 flex-wrap font-mono text-xs">
                <span className="bg-[#E9E5DA] text-[#14130F] px-2 py-0.5 rounded font-semibold text-xs">.xyz</span>
                <span className="bg-[#E9E5DA] text-[#14130F] px-2 py-0.5 rounded font-semibold text-xs">.top</span>
                <span className="bg-[#E9E5DA] text-[#14130F] px-2 py-0.5 rounded font-semibold text-xs">.click</span>
                <span className="bg-[#E9E5DA] text-[#14130F] px-2 py-0.5 rounded font-semibold text-xs">.site</span>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="w-[82vw] max-w-[310px] shrink-0 sm:w-auto snap-start bg-white rounded-[20px] border border-[#E3E0DA] border-t-4 border-t-[#1d3f6e] p-5 sm:p-6 flex flex-col justify-between shadow-[0_14px_34px_-18px_rgba(29,63,110,0.25)] hover:border-[#14161C] transition-all">
            <div>
              <div className="mb-3">
                <span className="bg-[#E8EEF7] text-[#1d3f6e] px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider">
                  TANDA 03
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#14161C] mb-2 leading-snug">
                Tautan dipendekkan
              </h3>
              <p className="text-sm text-[#5B5850] leading-relaxed mb-4">
                Tautan pendek menyembunyikan domain tujuan asli agar korban tidak curiga sebelum mengekliknya.
              </p>
            </div>
            <div className="font-mono text-xs leading-normal bg-[#EEF3FA] border border-[#D6E0EF] rounded-lg p-3 text-[#5B5850] mt-auto">
              <span>bit.ly/xxxx</span> &nbsp;&bull;&nbsp; <span>s.id/xxxx</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="w-[82vw] max-w-[310px] shrink-0 sm:w-auto snap-start bg-white rounded-[20px] border border-[#E3E0DA] border-t-4 border-t-[#1d3f6e] p-5 sm:p-6 flex flex-col justify-between shadow-[0_14px_34px_-18px_rgba(29,63,110,0.25)] hover:border-[#14161C] transition-all">
            <div>
              <div className="mb-3">
                <span className="bg-[#E8EEF7] text-[#1d3f6e] px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider">
                  TANDA 04
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#14161C] mb-2 leading-snug">
                Meminta OTP, PIN, kata sandi
              </h3>
              <p className="text-sm text-[#5B5850] leading-relaxed mb-4">
                Layanan resmi tidak pernah meminta kredensial rahasia perbankan lewat tautan web atau chat.
              </p>
            </div>
            <div className="font-mono text-xs leading-normal bg-[#EEF3FA] border border-[#D6E0EF] rounded-lg p-3 text-[#B42318] font-semibold mt-auto">
              "Kirim kode OTP yang masuk ke HP kamu"
            </div>
          </div>

          {/* Card 5 */}
          <div className="w-[82vw] max-w-[310px] shrink-0 sm:w-auto snap-start bg-white rounded-[20px] border border-[#E3E0DA] border-t-4 border-t-[#1d3f6e] p-5 sm:p-6 flex flex-col justify-between shadow-[0_14px_34px_-18px_rgba(29,63,110,0.25)] hover:border-[#14161C] transition-all">
            <div>
              <div className="mb-3">
                <span className="bg-[#E8EEF7] text-[#1d3f6e] px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider">
                  TANDA 05
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#14161C] mb-2 leading-snug">
                Menekan lewat batas waktu
              </h3>
              <p className="text-sm text-[#5B5850] leading-relaxed mb-4">
                Korban dipaksa bertindak terburu-buru dengan ancaman pemblokiran akun agar tidak sempat berpikir.
              </p>
            </div>
            <div className="font-mono text-xs leading-normal bg-[#EEF3FA] border border-[#D6E0EF] rounded-lg p-3 text-[#B42318] font-semibold mt-auto">
              "Akun diblokir jika tidak verifikasi dalam 1 jam"
            </div>
          </div>

          {/* Card 6 */}
          <div className="w-[82vw] max-w-[310px] shrink-0 sm:w-auto snap-start bg-white rounded-[20px] border border-[#E3E0DA] border-t-4 border-t-[#1d3f6e] p-5 sm:p-6 flex flex-col justify-between shadow-[0_14px_34px_-18px_rgba(29,63,110,0.25)] hover:border-[#14161C] transition-all">
            <div>
              <div className="mb-3">
                <span className="bg-[#E8EEF7] text-[#1d3f6e] px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider">
                  TANDA 06
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-[#14161C] mb-2 leading-snug">
                Gembok bukan jaminan aman
              </h3>
              <p className="text-sm text-[#5B5850] leading-relaxed mb-4">
                Situs penipuan modern pun bisa memakai HTTPS. Ikon gembok hanya menandakan koneksi terenkripsi.
              </p>
            </div>
            <div className="font-mono text-xs leading-normal bg-[#EEF3FA] border border-[#D6E0EF] rounded-lg p-3 text-[#2D2A24] mt-auto">
              <span className="font-semibold">https://...</span> tetap bisa situs palsu
            </div>
          </div>

        </div>

        {/* Bar Bawah: Cek Manual */}
        <div className="mt-7 bg-[#14161C] border border-[#14161C] rounded-[22px] p-5 sm:p-6 grid grid-cols-1 md:grid-cols-[190px_1fr_1fr_1fr] gap-5 items-center">
          <div className="font-display font-bold text-base sm:text-lg text-white leading-snug">
            Cek manual<br />tanpa alat:
          </div>
          <div className="flex items-start gap-3 text-sm border-t md:border-t-0 md:border-l border-white/16 pt-3 md:pt-0 md:pl-4 text-[#D7DCE6]">
            <span className="w-5 h-5 min-w-5 rounded-full bg-[#0f9b8a] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
            <div>
              <b className="text-white block mb-0.5">Tahan tautan</b>
              <span className="text-[#AAB4C5] text-xs leading-relaxed">Lihat alamat asli di pratinjau sebelum klik.</span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm border-t md:border-t-0 md:border-l border-white/16 pt-3 md:pt-0 md:pl-4 text-[#D7DCE6]">
            <span className="w-5 h-5 min-w-5 rounded-full bg-[#0f9b8a] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
            <div>
              <b className="text-white block mb-0.5">Baca nama domain</b>
              <span className="text-[#AAB4C5] text-xs leading-relaxed">Cek domain tepat sebelum garis miring pertama (/).</span>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm border-t md:border-t-0 md:border-l border-white/16 pt-3 md:pt-0 md:pl-4 text-[#D7DCE6]">
            <span className="w-5 h-5 min-w-5 rounded-full bg-[#0f9b8a] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
            <div>
              <b className="text-white block mb-0.5">Tanya pengirim</b>
              <span className="text-[#AAB4C5] text-xs leading-relaxed">Konfirmasi melalui jalur atau nomor resmi lain.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: MODUS YANG SERING DITEMUI */}
      <section className="sec-enhanced sec-modus max-w-[1120px] mx-auto px-4 sm:px-8 py-8 sm:py-12 lg:py-16 w-full" id="modus">
        <h2 className="sec-heading-bar font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#14161C] tracking-tight leading-tight">
          Modus yang sering ditemui
        </h2>
        <p className="text-base sm:text-lg text-[#5B5850] mt-3">
          Klik salah satu untuk mencoba contohnya.
        </p>

        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory gap-4 sm:gap-5 mt-5 sm:mt-7 pb-3 sm:pb-0 scrollbar-none">
          {MODUS_EXAMPLES.map((modus, idx) => {
            const numStr = `0${idx + 1}`;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectModus(modus)}
                style={{
                  borderTopColor: modus.color,
                }}
                className="w-[78vw] max-w-[290px] shrink-0 sm:w-auto snap-start group relative overflow-hidden rounded-[22px] border border-[#DFE6F0] border-t-[5px] bg-gradient-to-b from-white to-[#F3F6FB] p-5 sm:p-6 text-left flex flex-col justify-between shadow-[0_16px_36px_-20px_rgba(29,63,110,0.28)] hover:-translate-y-1 transition-all cursor-pointer"
              >
                {/* Giant watermark number */}
                <span
                  style={{ color: modus.color }}
                  className="font-display font-bold text-[76px] leading-none absolute right-4 top-1.5 opacity-10 select-none transition-all group-hover:opacity-20"
                >
                  {numStr}
                </span>

                <div className="relative z-10">
                  <h3 className="font-display font-bold text-lg sm:text-xl text-[#14161C] mb-3.5 pr-10 leading-snug">
                    {modus.title}
                  </h3>
                  <div className="font-mono text-xs leading-relaxed text-[#5B5850] bg-white p-3 rounded-xl border border-[#EAE6DC] min-h-[78px]">
                    {modus.snippet}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 7. SECTION: KENAPA SCAMORA */}
      <section className="sec-enhanced sec-kenapa max-w-[1120px] mx-auto px-4 sm:px-8 py-8 sm:py-12 lg:py-16 w-full" id="kenapa">
        <h2 className="sec-heading-bar font-display text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#14161C] tracking-tight leading-tight">
          Kenapa Scamora
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mt-5 sm:mt-7">
          <div className="group bg-white rounded-[20px] border border-[#E4E0D6] p-4 sm:p-6 shadow-xs hover:border-[#14161C] hover:-translate-y-0.5 transition-all">
            <span className="font-display font-bold text-2xl sm:text-[38px] leading-none text-[#C9D6EA] block mb-2 sm:mb-3.5 transition-colors group-hover:text-[#0f9b8a]">01</span>
            <h3 className="font-display font-bold text-sm sm:text-lg text-[#14161C] mb-1.5 sm:mb-2 leading-snug">Ada bukti, bukan sekadar label</h3>
            <p className="text-[11px] sm:text-sm text-[#5B5850] leading-relaxed">
              Bukan cuma "bahaya" atau "aman". Tiap tanda bahaya dijabarkan dengan alasan dan bobot risikonya.
            </p>
          </div>

          <div className="group bg-white rounded-[20px] border border-[#E4E0D6] p-4 sm:p-6 shadow-xs hover:border-[#14161C] hover:-translate-y-0.5 transition-all">
            <span className="font-display font-bold text-2xl sm:text-[38px] leading-none text-[#C9D6EA] block mb-2 sm:mb-3.5 transition-colors group-hover:text-[#0f9b8a]">02</span>
            <h3 className="font-display font-bold text-sm sm:text-lg text-[#14161C] mb-1.5 sm:mb-2 leading-snug">Tautan dan chat satu tempat</h3>
            <p className="text-[11px] sm:text-sm text-[#5B5850] leading-relaxed">
              Periksa tautan web mencurigakan dan percakapan WhatsApp tanpa perlu berpindah aplikasi.
            </p>
          </div>

          <div className="group bg-white rounded-[20px] border border-[#E4E0D6] p-4 sm:p-6 shadow-xs hover:border-[#14161C] hover:-translate-y-0.5 transition-all">
            <span className="font-display font-bold text-2xl sm:text-[38px] leading-none text-[#C9D6EA] block mb-2 sm:mb-3.5 transition-colors group-hover:text-[#0f9b8a]">03</span>
            <h3 className="font-display font-bold text-sm sm:text-lg text-[#14161C] mb-1.5 sm:mb-2 leading-snug">Privasi lebih dulu</h3>
            <p className="text-[11px] sm:text-sm text-[#5B5850] leading-relaxed">
              Nomor HP, rekening, dan data pribadi di chat disamarkan otomatis, serta input tidak disimpan.
            </p>
          </div>

          <div className="group bg-white rounded-[20px] border border-[#E4E0D6] p-4 sm:p-6 shadow-xs hover:border-[#14161C] hover:-translate-y-0.5 transition-all">
            <span className="font-display font-bold text-2xl sm:text-[38px] leading-none text-[#C9D6EA] block mb-2 sm:mb-3.5 transition-colors group-hover:text-[#0f9b8a]">04</span>
            <h3 className="font-display font-bold text-sm sm:text-lg text-[#14161C] mb-1.5 sm:mb-2 leading-snug">Ada langkah setelahnya</h3>
            <p className="text-[11px] sm:text-sm text-[#5B5850] leading-relaxed">
              Saran tindakan nyata dan kanal pelaporan resmi ke bank atau otoritas, bukan berhenti di skor.
            </p>
          </div>
        </div>

        {/* Transparansi Cakupan vs Batasan */}
        <div className="mt-6 bg-white border border-[#E4E0D6] rounded-[22px] p-6 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xs font-bold tracking-wider px-2.5 py-1 rounded-md bg-[#0f9b8a] text-white">Cakupan</span>
              <h3 className="font-display font-bold text-lg text-[#14161C]">Yang bisa ditunjukkan hasil ini</h3>
            </div>
            <ul className="text-xs sm:text-sm text-[#3F3C35] space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="text-[#067647] font-bold text-sm">✓</span>
                <span>Tanda bahaya teknis beserta alasan dan bobot risikonya.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#067647] font-bold text-sm">✓</span>
                <span>Kecocokan domain dengan basis data ancaman Google Safe Browsing.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#067647] font-bold text-sm">✓</span>
                <span>Kalimat manipulatif atau tanda rekayasa sosial di dalam chat.</span>
              </li>
            </ul>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-[#EEEAE0] pt-6 md:pt-0 md:pl-8">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xs font-bold tracking-wider px-2.5 py-1 rounded-md bg-[#14161C] text-white">Batasan</span>
              <h3 className="font-display font-bold text-lg text-[#14161C]">Yang belum bisa</h3>
            </div>
            <ul className="text-xs sm:text-sm text-[#3F3C35] space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="text-[#8C887B] font-bold text-sm">—</span>
                <span>Menjamin sebuah tautan 100% aman tanpa risiko tersembunyi.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#8C887B] font-bold text-sm">—</span>
                <span>Melihat isi formulir internal atau tujuan akhir tautan pendek.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#8C887B] font-bold text-sm">—</span>
                <span>Menggantikan pertimbangan akal sehat dan kehati-hatianmu.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. SECTION: SUDAH DICEK ORANG LAIN */}
      <section className="sec-enhanced sec-direktori max-w-[1120px] mx-auto px-4 sm:px-8 py-8 sm:py-12 lg:py-16 w-full" id="direktori">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-5 sm:mb-7">
          <div>
            <h2 className="sec-heading-bar font-display text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#14161C] tracking-tight leading-tight">
              Sudah dicek orang lain
            </h2>
            <p className="text-sm sm:text-lg text-[#5B5850] mt-2 sm:mt-3">
              Domain yang pernah diperiksa pengguna lain di Direktori Komunitas.
            </p>
          </div>
          <Link
            to="/laporan"
            className="self-start sm:self-auto h-9 sm:h-11 px-4 sm:px-5 rounded-full border border-[#CFCABD] bg-white hover:bg-[#14161C] hover:text-white hover:border-[#14161C] text-[#14130F] font-semibold text-xs sm:text-sm inline-flex items-center transition-all cursor-pointer shadow-xs shrink-0"
          >
            Lihat Direktori
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {recentDomains.map((item, idx) => {
            const isHigh = item.category === 'high' || item.riskPercent >= 60;
            const isReview = item.category === 'review' || (item.riskPercent >= 30 && item.riskPercent < 60);

            const badgeBg = isHigh 
              ? 'bg-[#FEE4E2] text-[#B42318]' 
              : isReview 
              ? 'bg-[#FEF0C7] text-[#93370D]' 
              : 'bg-[#DCFAE6] text-[#067647]';
            const badgeLabel = isHigh 
              ? 'Tinggi' 
              : isReview 
              ? 'Perlu ditinjau' 
              : 'Rendah';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrlInput(item.domain);
                  setPrivacyAgreedUrl(true);
                  inputSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  handleScanUrl(item.domain, true);
                }}
                className="w-full bg-white rounded-[22px] border border-[#E3E0DA] hover:border-[#14161C] p-5 sm:p-6 shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)] flex flex-col justify-between text-left transition-all hover:-translate-y-1 cursor-pointer group"
              >
                <div>
                  <div 
                    className="font-mono text-sm sm:text-base font-semibold text-[#14161C] truncate group-hover:text-[#1d3f6e] transition-colors"
                    title={item.domain}
                  >
                    {item.domain}
                  </div>
                  <div className="text-xs sm:text-sm text-[#5B5850] my-2">
                    Skor risiko: {item.riskPercent}/100 • {item.count}x diperiksa
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5F3EE]">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badgeBg}`}>
                    {badgeLabel}
                  </span>
                  <span className="text-xs text-[#8C887B] font-mono">
                    {item.lastChecked}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 9. SECTION: PANDUAN DARURAT */}
      <section className="sec-enhanced sec-darurat max-w-[1120px] mx-auto px-4 sm:px-8 py-8 sm:py-12 lg:py-16 w-full" id="darurat">
        <div>
          <h2 className="sec-heading-bar font-display text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#14161C] tracking-tight leading-tight">
            Sudah terlanjur klik atau transfer?
          </h2>
          <p className="text-sm sm:text-lg text-[#5B5850] mt-2 sm:mt-3">
            Tenang, lakukan berurutan. Pemblokiran lewat bank paling efektif dalam 24 jam pertama.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mt-5 sm:mt-7">
          <div className="bg-white rounded-[20px] border border-[#E3E0DA] border-t-4 border-t-[#D92D20] p-4 sm:p-6 shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2B2F3A] text-white flex items-center justify-center font-bold text-xs sm:text-sm font-display mb-2.5 sm:mb-3">1</div>
              <h3 className="font-display font-bold text-sm sm:text-lg text-[#14161C] mb-1.5 sm:mb-2 leading-snug">Berhenti</h3>
              <p className="text-[11px] sm:text-sm text-[#5B5850] leading-relaxed">
                Tutup halaman dan jangan kirim uang, kode OTP, PIN, atau data apa pun lagi kepada pelaku.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[20px] border border-[#E3E0DA] border-t-4 border-t-[#D92D20] p-4 sm:p-6 shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2B2F3A] text-white flex items-center justify-center font-bold text-xs sm:text-sm font-display mb-2.5 sm:mb-3">2</div>
              <h3 className="font-display font-bold text-sm sm:text-lg text-[#14161C] mb-1.5 sm:mb-2 leading-snug">Amankan akun</h3>
              <p className="text-[11px] sm:text-sm text-[#5B5850] leading-relaxed">
                Segera ganti kata sandi email, m-banking, dan aktifkan verifikasi dua langkah (2FA).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[20px] border border-[#E3E0DA] border-t-4 border-t-[#D92D20] p-4 sm:p-6 shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2B2F3A] text-white flex items-center justify-center font-bold text-xs sm:text-sm font-display mb-2.5 sm:mb-3">3</div>
              <h3 className="font-display font-bold text-sm sm:text-lg text-[#14161C] mb-1.5 sm:mb-2 leading-snug">Hubungi bank</h3>
              <p className="text-[11px] sm:text-sm text-[#5B5850] leading-relaxed">
                Minta pemblokiran rekening atau penahanan transaksi, lalu simpan nomor laporan buktinya.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[20px] border border-[#E3E0DA] border-t-4 border-t-[#D92D20] p-4 sm:p-6 shadow-[0_14px_34px_-16px_rgba(29,63,110,0.22)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2B2F3A] text-white flex items-center justify-center font-bold text-xs sm:text-sm font-display mb-2.5 sm:mb-3">4</div>
              <h3 className="font-display font-bold text-sm sm:text-lg text-[#14161C] mb-1.5 sm:mb-2 leading-snug">Laporkan</h3>
              <p className="text-[11px] sm:text-sm text-[#5B5850] leading-relaxed mb-2.5">
                Laporkan insiden ke kanal resmi:
              </p>
              <div className="flex flex-wrap gap-1 font-mono text-[10px] sm:text-xs">
                <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E4E0D6] text-[#14161C]">cekrekening.id</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E4E0D6] text-[#14161C]">aduannomor.id</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E4E0D6] text-[#14161C]">lapor.go.id</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SECTION: FAQ PERTANYAAN UMUM */}
      <section className="sec-enhanced sec-faq max-w-[1120px] mx-auto px-4 sm:px-8 py-8 sm:py-12 lg:py-16 w-full" id="faq">
        <h2 className="sec-heading-bar font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#14161C] tracking-tight leading-tight mb-5 sm:mb-7">
          Pertanyaan umum
        </h2>

        <div className="grid gap-3">
          <details className="group bg-white border border-[#E3E0DA] rounded-[18px] px-6 py-1 transition-all duration-200 cursor-pointer open:border-[#1d3f6e] open:shadow-[0_16px_34px_-18px_rgba(29,63,110,0.3)]">
            <summary className="flex justify-between items-center font-display text-base sm:text-lg font-semibold text-[#14161C] py-4 list-none select-none">
              <span>Apakah Scamora gratis dan perlu login?</span>
              <ChevronDown className="w-5 h-5 text-[#1d3f6e] group-open:rotate-180 transition-transform duration-300 shrink-0 ml-4" />
            </summary>
            <div className="faq-answer-anim pb-5 text-sm sm:text-base text-[#5B5850] leading-relaxed">
              Gratis dan tanpa login. Kamu bisa langsung memeriksa tautan atau chat yang mencurigakan tanpa perlu mendaftar akun atau memasukkan data pribadi.
            </div>
          </details>

          <details className="group bg-white border border-[#E3E0DA] rounded-[18px] px-6 py-1 transition-all duration-200 cursor-pointer open:border-[#1d3f6e] open:shadow-[0_16px_34px_-18px_rgba(29,63,110,0.3)]">
            <summary className="flex justify-between items-center font-display text-base sm:text-lg font-semibold text-[#14161C] py-4 list-none select-none">
              <span>Apakah tautan atau chat saya disimpan?</span>
              <ChevronDown className="w-5 h-5 text-[#1d3f6e] group-open:rotate-180 transition-transform duration-300 shrink-0 ml-4" />
            </summary>
            <div className="faq-answer-anim pb-5 text-sm sm:text-base text-[#5B5850] leading-relaxed">
              Tidak. Hanya nama domain yang bisa tampil di Direktori Komunitas, itu pun kalau kamu mencentang izinnya. Isi chat tidak pernah disimpan di server dan data pribadi seperti nomor telepon, rekening, atau kata sandi disamarkan otomatis.
            </div>
          </details>

          <details className="group bg-white border border-[#E3E0DA] rounded-[18px] px-6 py-1 transition-all duration-200 cursor-pointer open:border-[#1d3f6e] open:shadow-[0_16px_34px_-18px_rgba(29,63,110,0.3)]">
            <summary className="flex justify-between items-center font-display text-base sm:text-lg font-semibold text-[#14161C] py-4 list-none select-none">
              <span>Hasil Rendah berarti aman?</span>
              <ChevronDown className="w-5 h-5 text-[#1d3f6e] group-open:rotate-180 transition-transform duration-300 shrink-0 ml-4" />
            </summary>
            <div className="faq-answer-anim pb-5 text-sm sm:text-base text-[#5B5850] leading-relaxed">
              Tidak. Artinya belum ditemukan tanda bahaya yang signifikan pada pemeriksaan yang dilakukan. Tetap waspada dan jangan pernah membagikan kode OTP atau PIN kepada siapa pun.
            </div>
          </details>

          <details className="group bg-white border border-[#E3E0DA] rounded-[18px] px-6 py-1 transition-all duration-200 cursor-pointer open:border-[#1d3f6e] open:shadow-[0_16px_34px_-18px_rgba(29,63,110,0.3)]">
            <summary className="flex justify-between items-center font-display text-base sm:text-lg font-semibold text-[#14161C] py-4 list-none select-none">
              <span>Kenapa hasilnya Perlu Ditinjau?</span>
              <ChevronDown className="w-5 h-5 text-[#1d3f6e] group-open:rotate-180 transition-transform duration-300 shrink-0 ml-4" />
            </summary>
            <div className="faq-answer-anim pb-5 text-sm sm:text-base text-[#5B5850] leading-relaxed">
              Ada tanda yang perlu diverifikasi lebih lanjut, atau sebagian pemeriksaan tidak dapat diselesaikan. Hubungi pihak pengirim atau lembaga resmi lewat kanal resmi mereka sebelum mengambil tindakan.
            </div>
          </details>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
