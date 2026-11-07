import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { analysisService } from '../../services/analysisService';
import { directoryService } from '../../services/directoryService';
import { AnalysisResultView } from '../../components/analysis/AnalysisResultView';
import type { AnalysisResult } from '../../types/analysis';

const MODUS_EXAMPLES = [
  {
    type: 'chat' as const,
    title: 'Paket atau resi palsu',
    snippet: '"Paket kamu tertahan di gudang. Bayar biaya admin Rp15.000 sekarang juga lewat tautan ini atau paket dikembalikan. Info: wa.me/628123456789"',
    text: 'Halo Kak, paket pesanan kamu tertahan di gudang logistik kami. Segera bayar biaya admin sebesar Rp15.000 sekarang juga lewat tautan ini agar paket tidak dikembalikan ke pengirim. Link: https://resi-paket-cek.site/bayar',
  },
  {
    type: 'url' as const,
    title: 'Undangan pernikahan APK',
    snippet: 'http://undangan-nikah-digital.top/undangan.apk',
    text: 'http://undangan-nikah-digital.top/undangan.apk',
  },
  {
    type: 'chat' as const,
    title: 'Hadiah undian',
    snippet: '"Selamat! Kamu menang undian Rp50 juta. Segera kirim kode OTP yang masuk ke HP kamu dalam 1 jam..."',
    text: 'Selamat! Nomor Anda terpilih memenangkan hadiah undian festival belanja sebesar Rp 50.000.000. Segera kirimkan 6 digit kode OTP rahasia yang masuk via SMS ke nomor ini dalam waktu 1 jam sebelum hadiah hangus!',
  },
  {
    type: 'url' as const,
    title: 'Tilang atau pajak palsu',
    snippet: 'http://tilang-online-bayar.click/denda',
    text: 'http://tilang-online-bayar.click/denda',
  },
  {
    type: 'chat' as const,
    title: 'Lowongan kerja palsu',
    snippet: '"Dibutuhkan admin online, gaji 8 juta/bulan. Transfer biaya pendaftaran Rp200.000 dan pindah ke Telegram..."',
    text: 'Dibutuhkan segera staf admin online paruh waktu dari rumah, gaji 8 juta per bulan tanpa syarat pengalaman. Untuk aktivasi ID kerja, silakan transfer biaya pendaftaran Rp 200.000 ke rekening bendahara kami lalu konfirmasi ke Telegram: @admin_karir.',
  },
  {
    type: 'chat' as const,
    title: 'Investasi cepat untung',
    snippet: '"Investasi modal kecil, pasti untung 20% per minggu, jaminan keuntungan cuan..."',
    text: 'Program investasi syariah tanpa risiko! Modal mulai 500rb, pasti untung dan profit harian 20% per minggu dijamin cuan kembali 100%. Hubungi mentor sekarang juga di grup Telegram resmi.',
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

const PHISHING_SIGNS = [
  {
    num: 'TANDA 01',
    title: 'Nama domain mirip merek',
    desc: 'Penipu menambah kata atau memodifikasi huruf agar terlihat resmi saat sekilas dibaca.',
    badge: (
      <div className="font-mono text-[10.5px] sm:text-[11px] xl:text-xs leading-normal bg-[#F5F3EE] border border-[#E9E5DA] rounded-lg py-2.5 px-2 text-[#2D2A24] mt-auto whitespace-nowrap overflow-hidden">
        <span className="text-[#067647] font-semibold">bank-nusa.co.id</span> <span className="text-[#8C887B] mx-1">vs</span> <span className="text-[#B42318] font-semibold">bank-nusa-login.xyz</span>
      </div>
    ),
  },
  {
    num: 'TANDA 02',
    title: 'Ekstensi domain janggal',
    desc: 'Beberapa ekstensi domain murah atau anonim sering dimanfaatkan untuk situs penipuan massal.',
    badge: (
      <div className="flex gap-1.5 flex-wrap font-mono text-xs bg-[#F5F3EE] border border-[#E9E5DA] rounded-lg p-2.5 mt-auto">
        <span className="bg-[#E9E5DA] px-2 py-0.5 rounded text-[11px] font-bold">.xyz</span>
        <span className="bg-[#E9E5DA] px-2 py-0.5 rounded text-[11px] font-bold">.top</span>
        <span className="bg-[#E9E5DA] px-2 py-0.5 rounded text-[11px] font-bold">.click</span>
        <span className="bg-[#E9E5DA] px-2 py-0.5 rounded text-[11px] font-bold">.site</span>
      </div>
    ),
  },
  {
    num: 'TANDA 03',
    title: 'Tautan dipendekkan',
    desc: 'Tautan pendek menyembunyikan domain tujuan asli agar korban tidak curiga sebelum mengekliknya.',
    badge: (
      <div className="font-mono text-[11.5px] sm:text-xs leading-normal bg-[#F5F3EE] border border-[#E9E5DA] rounded-lg p-2.5 text-[#5B5850] mt-auto whitespace-nowrap">
        <span>bit.ly/xxxx</span> <span className="text-[#8C887B] mx-1">&bull;</span> <span>s.id/xxxx</span>
      </div>
    ),
  },
  {
    num: 'TANDA 04',
    title: 'Meminta OTP, PIN, kata sandi',
    desc: 'Layanan resmi tidak pernah meminta kredensial rahasia perbankan lewat tautan web atau chat.',
    badge: (
      <div className="font-mono text-xs leading-normal bg-[#FEE4E2] text-[#B42318] border border-[#FDA29B] rounded-lg p-2.5 mt-auto font-semibold">
        "Kirim kode OTP yang masuk ke HP kamu"
      </div>
    ),
  },
  {
    num: 'TANDA 05',
    title: 'Menekan lewat batas waktu',
    desc: 'Korban dipaksa bertindak terburu-buru dengan ancaman pemblokiran akun agar tidak sempat berpikir.',
    badge: (
      <div className="font-mono text-xs leading-normal bg-[#FEE4E2] text-[#B42318] border border-[#FDA29B] rounded-lg p-2.5 mt-auto font-semibold">
        "Akun diblokir jika tidak verifikasi dalam 1 jam"
      </div>
    ),
  },
  {
    num: 'TANDA 06',
    title: 'Gembok bukan jaminan aman',
    desc: 'Situs penipuan modern pun bisa memakai HTTPS. Ikon gembok hanya menandakan koneksi terenkripsi.',
    badge: (
      <div className="font-mono text-xs leading-normal bg-[#F5F3EE] border border-[#EAE6DC] rounded-lg p-2.5 mt-auto text-[#2D2A24]">
        <span className="font-semibold">https://...</span> tetap bisa situs palsu!
      </div>
    ),
  },
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Cara Kerja Interactive State
  const [currentCaraStep, setCurrentCaraStep] = useState(0);
  const [caraInteracted, setCaraInteracted] = useState(false);

  // Mobile Tab State for Section Kenapa Scamora (Cakupan vs Batasan)
  const [capabilityTab, setCapabilityTab] = useState<'cakupan' | 'batasan'>('cakupan');

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

  // Handle prefill from Community Directory or navigation
  useEffect(() => {
    const state = location.state as { prefillUrl?: string } | null;
    if (state?.prefillUrl) {
      setActiveTab('url');
      setUrlInput(state.prefillUrl);
      handleScanUrl(state.prefillUrl);
    }
  }, [location.state]);

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
    <div className="flex flex-col w-full bg-[#F5F3EE] text-[#14130F] min-h-screen">
      
      {/* 1. HERO + SCANNER INPUT SECTION */}
      <section ref={inputSectionRef} className="max-w-[760px] mx-auto px-4 sm:px-6 pt-12 pb-14 w-full text-center">
        
        {/* Main Headline - Clean, Tasteful Editorial Typography (No AI Slop) */}
        <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight leading-[1.12] text-[#14130F]">
          Cek dulu sebelum <br className="hidden sm:inline" />
          kamu klik atau balas.
        </h1>

        <p className="text-sm sm:text-base text-[#5B5850] mt-3.5 max-w-md mx-auto leading-relaxed">
          Tempel tautan atau chat WhatsApp yang bikin curiga. Hasilnya langsung muncul di bawah.
        </p>

        {/* Tab Switcher Pills */}
        <div className="inline-flex gap-1 p-1 bg-[#E9E5DA] rounded-full mt-6 shadow-2xs">
          <button
            type="button"
            onClick={() => { setActiveTab('url'); setErrorMessage(null); }}
            className={`h-10 px-5 rounded-full font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-[#14130F] text-white shadow-2xs'
                : 'bg-transparent text-[#3F3C35] hover:text-[#14130F]'
            }`}
          >
            Cek Tautan
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('chat'); setErrorMessage(null); }}
            className={`h-10 px-5 rounded-full font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#14130F] text-white shadow-2xs'
                : 'bg-transparent text-[#3F3C35] hover:text-[#14130F]'
            }`}
          >
            Cek Chat WhatsApp
          </button>
        </div>

        {/* Form Panel: Cek Tautan */}
        {activeTab === 'url' && (
          <div className="mt-5 text-left space-y-2.5">
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleScanUrl(); }}
                placeholder="Tempel tautan di sini, contoh: http://bank-nusa-login.xyz/verifikasi-akun"
                className="h-13 flex-1 min-w-[260px] px-5 rounded-full border-[1.5px] border-[#CFCABD] bg-white text-sm text-[#14130F] placeholder:text-[#8C887B] focus:outline-2 focus:outline-[#14130F] focus:outline-offset-1 transition-all shadow-2xs"
              />
              <button
                type="button"
                disabled={loading}
                onClick={() => handleScanUrl()}
                className="h-13 px-7 rounded-full bg-[#14130F] hover:bg-[#2A2721] disabled:opacity-50 text-white font-semibold text-sm transition-all cursor-pointer shadow-2xs shrink-0"
              >
                {loading ? 'Memeriksa...' : 'Periksa'}
              </button>
            </div>

            {/* Checkbox Consent */}
            <div className="pt-0.5 pl-2">
              <label className="flex items-center gap-2 text-[13px] text-[#5B5850] cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAgreedUrl}
                  onChange={(e) => setPrivacyAgreedUrl(e.target.checked)}
                  className="w-4 h-4 accent-[#14130F] rounded cursor-pointer"
                />
                <span>Saya menyetujui ketentuan dan kebijakan privasi Scamora.</span>
              </label>
            </div>
          </div>
        )}

        {/* Form Panel: Cek Chat WhatsApp */}
        {activeTab === 'chat' && (
          <div className="mt-5 text-left">
            <div className="bg-white border border-[#E4E0D6] rounded-2xl p-5 shadow-2xs space-y-2.5">
              <label htmlFor="chatArea" className="font-semibold text-xs sm:text-sm text-[#14130F] block">
                Isi pesan atau chat yang mencurigakan:
              </label>
              <textarea
                id="chatArea"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                maxLength={5000}
                placeholder="Tempel isi chat WhatsApp yang bikin curiga di sini..."
                className="w-full h-36 p-3.5 border border-[#CFCABD] rounded-xl text-xs sm:text-sm leading-relaxed text-[#14130F] placeholder:text-[#8C887B] focus:outline-2 focus:outline-[#14130F] focus:outline-offset-1 resize-none"
              />
              <div className="flex justify-between text-xs text-[#706C62]">
                <span>Nomor HP, email, dan rekening disamarkan otomatis.</span>
                <span className="font-mono">{chatInput.length} / 5000</span>
              </div>

              <label className="flex items-center gap-2 text-[13px] text-[#5B5850] cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={privacyAgreedChat}
                  onChange={(e) => setPrivacyAgreedChat(e.target.checked)}
                  className="w-4 h-4 accent-[#14130F] rounded cursor-pointer"
                />
                <span>Saya menyetujui ketentuan dan kebijakan privasi Scamora.</span>
              </label>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleScanChat()}
                className="w-full h-12 mt-1.5 rounded-full bg-[#14130F] hover:bg-[#2A2721] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs"
              >
                {loading ? 'Memeriksa Chat...' : 'Periksa Chat'}
              </button>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 mt-3 rounded-xl bg-[#FEE4E2] text-[#B42318] text-xs font-semibold border border-[#FDA29B] text-left">
            {errorMessage}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-6 p-6 rounded-2xl bg-white border border-[#E4E0D6] flex flex-col items-center justify-center gap-2.5 text-[#5B5850]">
            <div className="w-6 h-6 border-2 border-[#14130F] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Sedang memeriksa berlapis...</span>
          </div>
        )}

        {/* 2. LIVE OUTPUT CONTAINER (RIGHT BELOW INPUT) */}
        <div ref={hasilRef} id="hasil" className="mt-6 text-left">
          {analysisResult && (
            <AnalysisResultView
              result={analysisResult}
              onReset={() => {
                setAnalysisResult(null);
                setUrlInput('');
                setChatInput('');
              }}
            />
          )}
        </div>

      </section>

      {/* 3. SECTION: APA ITU SCAMORA */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-12 border-t border-[#DDD8CC] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14130F] tracking-tight">
              Apa itu Scamora?
            </h2>
            <p className="text-sm sm:text-base text-[#5B5850] mt-3 leading-relaxed">
              Scamora memeriksa tautan dan pesan WhatsApp yang mencurigakan. Kamu tempel, kami periksa dari beberapa sisi, lalu kamu mendapat skor risiko, bukti, dan langkah aman dalam bahasa sehari-hari. Dibuat untuk masyarakat Indonesia yang sering menerima tautan asing tak dikenal.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="bg-white border border-[#E4E0D6] rounded-2xl p-4 shadow-2xs">
              <b className="text-xs sm:text-sm font-bold text-[#14130F] block">Gratis, tanpa login</b>
              <p className="text-xs text-[#5B5850] mt-0.5">Langsung pakai, tidak perlu daftar akun atau nomor identitas.</p>
            </div>
            <div className="bg-white border border-[#E4E0D6] rounded-2xl p-4 shadow-2xs">
              <b className="text-xs sm:text-sm font-bold text-[#14130F] block">Bahasa yang mudah dipahami</b>
              <p className="text-xs text-[#5B5850] mt-0.5">Tanda bahaya dijelaskan tanpa istilah teknis yang rumit.</p>
            </div>
            <div className="bg-white border border-[#E4E0D6] rounded-2xl p-4 shadow-2xs">
              <b className="text-xs sm:text-sm font-bold text-[#14130F] block">Input tidak disimpan</b>
              <p className="text-xs text-[#5B5850] mt-0.5">Tautan dan isi chat kamu tidak disimpan permanen di server.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: CARA KERJA INTERAKTIF (PERBAIKAN FOTO 3) */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-12 border-t border-[#DDD8CC] w-full">
        <div className="flex justify-between items-end gap-4 flex-wrap mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14130F] tracking-tight">
              Cara kerja
            </h2>
            <p className="text-sm text-[#5B5850] mt-1.5">
              Pemeriksaan berlapis dari input sampai panduan tindakan aman.
            </p>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#EEEAE0] text-[#3F3C35]">
            Langkah {currentCaraStep + 1} dari 4
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 items-stretch">
          
          {/* Kolom Kiri: 4 Step Buttons */}
          <div className="flex flex-col gap-2.5 justify-center">
            {CARA_STEPS.map((step, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCaraInteracted(true);
                  setCurrentCaraStep(idx);
                }}
                className={`p-4 sm:p-4.5 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer shadow-2xs ${
                  currentCaraStep === idx
                    ? 'bg-[#14130F] text-white border-[#14130F]'
                    : 'bg-white text-[#14130F] border-[#E4E0D6] hover:border-[#14130F]'
                }`}
              >
                <div
                  className={`w-8 h-8 min-w-8 rounded-full flex items-center justify-center font-display font-bold text-xs ${
                    currentCaraStep === idx
                      ? 'bg-white text-[#14130F]'
                      : 'bg-[#F5F3EE] text-[#14130F] border border-[#CFCABD]'
                  }`}
                >
                  {step.num}
                </div>
                <div>
                  <div className="font-display font-bold text-sm sm:text-base leading-tight">{step.title}</div>
                  <p className={`text-xs mt-1 leading-relaxed ${currentCaraStep === idx ? 'text-[#D6D2C8]' : 'text-[#5B5850]'}`}>
                    {step.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Kolom Kanan: Pratinjau Interaktif Sesuai scamora.html */}
          <div className="bg-white border-[1.5px] border-[#E4E0D6] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs min-h-[420px]">
            <div className="flex items-center justify-between border-b border-[#EEEAE0] pb-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold font-display text-[#14130F]">
                <span className="w-2 h-2 rounded-full bg-[#14130F]"></span>
                <span>{CARA_STEPS[currentCaraStep].label}</span>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F3EE] text-[#5B5850] border border-[#EAE6DC]">
                Pratinjau Interaktif
              </span>
            </div>

            {/* Slide 0: Tempel */}
            {currentCaraStep === 0 && (
              <div className="flex flex-col gap-3.5 flex-1">
                <div className="flex gap-1.5">
                  <span className="h-8 px-3.5 bg-[#14130F] text-white rounded-full text-xs font-semibold inline-flex items-center">
                    Cek Tautan
                  </span>
                  <span className="h-8 px-3.5 bg-[#EEEAE0] text-[#5B5850] rounded-full text-xs font-medium inline-flex items-center">
                    Cek WhatsApp
                  </span>
                </div>

                <div className="flex items-center gap-2.5 bg-white border-[1.5px] border-[#14130F] rounded-xl p-3 shadow-2xs">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14130F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  <div className="flex-1 font-mono text-xs text-[#14130F] truncate">
                    https://bank-nusa-login.xyz/verifikasi-akun
                  </div>
                  <span className="h-7 px-3 bg-[#14130F] text-white rounded-full text-[11px] font-semibold inline-flex items-center shrink-0">
                    Periksa
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-xs text-[#3F3C35]">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 min-w-4 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-[10px] font-bold mt-0.5">✓</span>
                    <span>Mendukung tautan web mencurigakan, domain singkat, &amp; chat WhatsApp</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 min-w-4 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-[10px] font-bold mt-0.5">✓</span>
                    <span>Nomor HP, rekening bank, dan email disamarkan otomatis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 min-w-4 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-[10px] font-bold mt-0.5">✓</span>
                    <span>Input kamu tidak pernah disimpan di server (privasi terjaga)</span>
                  </div>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 text-xs text-[#5B5850] mt-auto">
                  <b>Tips:</b> Tempel seluruh pesan chat apa adanya. Sistem otomatis memilah bagian berbahaya tanpa kamu harus mengeditnya dulu.
                </div>
              </div>
            )}

            {/* Slide 1: Diperiksa berlapis */}
            {currentCaraStep === 1 && (
              <div className="flex flex-col gap-3 flex-1">
                <div className="text-xs font-bold text-[#5B5850]">HASIL PEMERIKSAAN SISTEM:</div>
                
                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#14130F]">1. Struktur Domain &amp; Ekstensi</div>
                    <div className="text-[11px] text-[#5B5850]">Typosquatting nama merek, ekstensi .xyz murah</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#FEF0C7] text-[#93370D] font-bold text-[10px]">Terdeteksi</span>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#14130F]">2. Basis Data Google Safe Browsing</div>
                    <div className="text-[11px] text-[#5B5850]">Pencocokan daftar blacklist ancaman global</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#FEE4E2] text-[#B42318] font-bold text-[10px]">Diverifikasi</span>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#14130F]">3. Analisis Rekayasa Sosial AI</div>
                    <div className="text-[11px] text-[#5B5850]">Desakan batas waktu &amp; permintaan OTP sensitif</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#DCFAE6] text-[#067647] font-bold text-[10px]">Aktif</span>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 text-xs text-[#5B5850] mt-auto">
                  <b>Analisis Berjalan:</b> Tiga lapisan pengujian berjalan simultan dalam hitungan detik.
                </div>
              </div>
            )}

            {/* Slide 2: Skor dan bukti */}
            {currentCaraStep === 2 && (
              <div className="flex flex-col gap-3 flex-1">
                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-[#5B5850] uppercase tracking-wider">SKOR RISIKO TERDETEKSI</div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-display text-4xl font-bold text-[#B42318] leading-none">85</span>
                      <span className="text-sm text-[#5B5850]">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-[#FEE4E2] text-[#B42318] text-xs font-bold inline-block">
                      Risiko Tinggi
                    </span>
                    <div className="text-[11px] text-[#5B5850] mt-0.5">Indikasi bahaya kuat</div>
                  </div>
                </div>

                <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-3 space-y-1.5">
                  <div className="h-2 rounded-full bg-[#EEEAE0] overflow-hidden flex">
                    <div style={{ flex: 30 }} className="bg-[#12B76A]" />
                    <div style={{ flex: 30 }} className="bg-[#F79009]" />
                    <div style={{ flex: 40 }} className="bg-[#D92D20]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#5B5850]">
                    <span>Rendah (0–29)</span>
                    <span>Perlu ditinjau (30–59)</span>
                    <span className="font-bold text-[#B42318]">Tinggi (60–100) ▲</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs mt-auto">
                  <div className="bg-white border border-[#EAE6DC] rounded-lg p-2.5 flex items-center justify-between">
                    <span className="text-slate-800">Nama domain meniru merek (bank-nusa)</span>
                    <b className="text-[#B42318]">+35</b>
                  </div>
                  <div className="bg-white border border-[#EAE6DC] rounded-lg p-2.5 flex items-center justify-between">
                    <span className="text-slate-800">Kata kunci sensitif verifikasi akun</span>
                    <b className="text-[#B42318]">+30</b>
                  </div>
                </div>
              </div>
            )}

            {/* Slide 3: Langkah aman */}
            {currentCaraStep === 3 && (
              <div className="flex flex-col gap-3 flex-1">
                <div className="space-y-2 text-xs">
                  <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-2.5 flex items-center gap-2">
                    <span className="w-4.5 h-4.5 min-w-4.5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span><b>Berhenti:</b> Jangan isi OTP, password, atau transfer dana.</span>
                  </div>
                  <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-2.5 flex items-center gap-2">
                    <span className="w-4.5 h-4.5 min-w-4.5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span><b>Amankan:</b> Ganti kata sandi m-banking &amp; aktifkan 2FA.</span>
                  </div>
                  <div className="bg-[#FAF8F5] border border-[#EAE6DC] rounded-xl p-2.5 flex items-center gap-2">
                    <span className="w-4.5 h-4.5 min-w-4.5 rounded-full bg-[#DCFAE6] text-[#067647] flex items-center justify-center text-[10px] font-bold">✓</span>
                    <span><b>Hubungi:</b> Hubungi kanal resmi bank / instansi terkait.</span>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <div className="text-[11px] font-bold tracking-wider text-[#5B5850] uppercase mb-1.5">
                    KANAL RESMI PEMERINTAH:
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white border border-[#EAE6DC] rounded-lg p-2">
                      <div className="font-bold text-[11px]">cekrekening.id</div>
                      <div className="text-[10px] text-[#5B5850]">Rekening</div>
                    </div>
                    <div className="bg-white border border-[#EAE6DC] rounded-lg p-2">
                      <div className="font-bold text-[11px]">aduannomor.id</div>
                      <div className="text-[10px] text-[#5B5850]">Nomor HP</div>
                    </div>
                    <div className="bg-white border border-[#EAE6DC] rounded-lg p-2">
                      <div className="font-bold text-[11px]">lapor.go.id</div>
                      <div className="text-[10px] text-[#5B5850]">Pengaduan</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 5. SECTION: CIRI-CIRI TAUTAN PHISHING (PERBAIKAN FOTO 4) */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-10 sm:py-12 border-t border-[#DDD8CC] w-full">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14130F] tracking-tight">
              Ciri-ciri tautan phishing
            </h2>
            <p className="text-xs sm:text-sm text-[#5B5850] mt-1.5">
              Enam tanda yang paling sering muncul saat penipuan mencoba mengelabui korban.
            </p>
          </div>
          <span className="sm:hidden shrink-0 text-[11px] font-mono font-bold text-[#8C887B] bg-[#F5F3EE] border border-[#E9E5DA] px-2.5 py-1 rounded-full mt-1">
            6 Tanda
          </span>
        </div>

        {/* Mobile Horizontal Snap Carousel (sm:hidden) */}
        <div className="sm:hidden mt-4">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 pt-1 px-4 -mx-4 no-scrollbar">
            {PHISHING_SIGNS.map((item, idx) => (
              <div 
                key={idx} 
                className="w-[82vw] max-w-[300px] snap-center bg-white border border-[#E4E0D6] rounded-2xl p-4.5 flex flex-col justify-between shadow-2xs shrink-0"
              >
                <div>
                  <div className="text-[10.5px] font-bold font-mono text-[#8C887B] tracking-wider mb-2">{item.num}</div>
                  <h3 className="font-display font-bold text-sm text-[#14130F] mb-1.5 leading-snug">{item.title}</h3>
                  <p className="text-xs text-[#5B5850] leading-relaxed mb-3">{item.desc}</p>
                </div>
                {item.badge}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-1 text-[11px] text-[#8C887B]">
            <span>&larr; Geser jempol untuk tanda lain &rarr;</span>
            <span className="font-mono font-bold">1 &ndash; 6 Tanda</span>
          </div>
        </div>

        {/* Desktop Grid (hidden sm:grid) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {PHISHING_SIGNS.map((item, idx) => (
            <div key={idx} className="bg-white border border-[#E4E0D6] rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:border-[#14130F] transition-all">
              <div>
                <div className="text-[11px] font-bold font-mono text-[#8C887B] tracking-wider mb-2">{item.num}</div>
                <h3 className="font-display font-bold text-base text-[#14130F] mb-1.5 leading-snug">{item.title}</h3>
                <p className="text-xs text-[#5B5850] leading-relaxed mb-3">{item.desc}</p>
              </div>
              {item.badge}
            </div>
          ))}
        </div>

        {/* Bar Bawah: Cek Manual */}
        <div className="mt-5 sm:mt-6 bg-white border border-[#E4E0D6] rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-4 gap-3.5 sm:gap-4 items-center shadow-2xs">
          <div className="font-display font-bold text-sm text-[#14130F] leading-snug">
            Cek manual <br className="hidden md:inline" /> tanpa alat:
          </div>
          <div className="flex items-start gap-2.5 text-xs border-t md:border-t-0 md:border-l border-[#EEEAE0] pt-2.5 md:pt-0 md:pl-4">
            <span className="w-5 h-5 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
            <div>
              <b className="text-[#14130F] block">Tahan tautan</b>
              <span className="text-[#5B5850]">Lihat alamat asli di pratinjau sebelum klik.</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-xs border-t md:border-t-0 md:border-l border-[#EEEAE0] pt-2.5 md:pt-0 md:pl-4">
            <span className="w-5 h-5 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
            <div>
              <b className="text-[#14130F] block">Baca nama domain</b>
              <span className="text-[#5B5850]">Cek domain tepat sebelum garis miring pertama (/).</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 text-xs border-t md:border-t-0 md:border-l border-[#EEEAE0] pt-2.5 md:pt-0 md:pl-4">
            <span className="w-5 h-5 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
            <div>
              <b className="text-[#14130F] block">Tanya pengirim</b>
              <span className="text-[#5B5850]">Konfirmasi melalui nomor resmi atau aplikasi resmi.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION: MODUS YANG SERING DITEMUI (PERBAIKAN FOTO 5) */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-10 sm:py-12 border-t border-[#DDD8CC] w-full">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14130F] tracking-tight">
              Modus yang sering ditemui
            </h2>
            <p className="text-xs sm:text-sm text-[#5B5850] mt-1.5">
              Klik salah satu kartu di bawah ini untuk mencoba pemeriksaannya secara langsung.
            </p>
          </div>
          <span className="sm:hidden shrink-0 text-[11px] font-mono font-bold text-[#8C887B] bg-[#F5F3EE] border border-[#E9E5DA] px-2.5 py-1 rounded-full mt-1">
            6 Kasus
          </span>
        </div>

        {/* Mobile Horizontal Snap Carousel (sm:hidden) */}
        <div className="sm:hidden mt-4">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 pt-1 px-4 -mx-4 no-scrollbar">
            {MODUS_EXAMPLES.map((modus, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectModus(modus)}
                className="w-[82vw] max-w-[290px] snap-center bg-white border border-[#E4E0D6] active:border-[#14130F] rounded-2xl p-4 text-left flex flex-col justify-between shadow-2xs shrink-0 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#EAE6DC] text-[#8C887B]">
                      {modus.type === 'url' ? 'Tautan' : 'Chat WA'}
                    </span>
                    <span className="text-[11px] font-bold text-[#E86A33]">Uji Kasus &rarr;</span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-[#14130F] mb-2 leading-snug">
                    {modus.title}
                  </h3>
                </div>
                <div className="font-mono text-[11px] leading-relaxed text-[#5B5850] bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EAE6DC] mt-auto line-clamp-3">
                  {modus.snippet}
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between px-1 text-[11px] text-[#8C887B]">
            <span>&larr; Geser untuk kasus lainnya &rarr;</span>
            <span className="font-mono font-bold">1 &ndash; 6 Kasus</span>
          </div>
        </div>

        {/* Desktop Grid (hidden sm:grid) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          {MODUS_EXAMPLES.map((modus, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectModus(modus)}
              className="bg-white border border-[#E4E0D6] hover:border-[#14130F] hover:-translate-y-0.5 rounded-2xl p-4.5 text-left flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <h3 className="font-display font-bold text-sm sm:text-base text-[#14130F] mb-2.5 leading-snug">
                {modus.title}
              </h3>
              <div className="font-mono text-[11.5px] leading-relaxed text-[#5B5850] bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EAE6DC] mt-auto">
                {modus.snippet}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 7. SECTION: KENAPA SCAMORA */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-10 sm:py-12 border-t border-[#DDD8CC] w-full">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14130F] tracking-tight">
          Kenapa Scamora
        </h2>

        {/* 4 Cards: Compact 2x2 grid on mobile (grid-cols-2), 4-col on desktop (lg:grid-cols-4) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mt-5 sm:mt-6">
          <div className="bg-white border border-[#E4E0D6] rounded-2xl p-3.5 sm:p-4.5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="font-mono font-bold text-[11px] sm:text-xs text-[#8C887B]">01</span>
              <h3 className="font-display font-bold text-xs sm:text-base text-[#14130F] mt-1 sm:mt-1.5 leading-snug">Ada bukti nyata</h3>
              <p className="text-[11px] sm:text-xs text-[#5B5850] mt-1 sm:mt-1.5 leading-relaxed">
                Bukan cuma "bahaya" atau "aman". Tiap tanda bahaya dijabarkan dengan alasan dan bobot risikonya.
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#E4E0D6] rounded-2xl p-3.5 sm:p-4.5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="font-mono font-bold text-[11px] sm:text-xs text-[#8C887B]">02</span>
              <h3 className="font-display font-bold text-xs sm:text-base text-[#14130F] mt-1 sm:mt-1.5 leading-snug">Tautan &amp; chat</h3>
              <p className="text-[11px] sm:text-xs text-[#5B5850] mt-1 sm:mt-1.5 leading-relaxed">
                Periksa tautan web mencurigakan dan percakapan WhatsApp tanpa perlu berpindah aplikasi.
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#E4E0D6] rounded-2xl p-3.5 sm:p-4.5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="font-mono font-bold text-[11px] sm:text-xs text-[#8C887B]">03</span>
              <h3 className="font-display font-bold text-xs sm:text-base text-[#14130F] mt-1 sm:mt-1.5 leading-snug">Privasi lebih dulu</h3>
              <p className="text-[11px] sm:text-xs text-[#5B5850] mt-1 sm:mt-1.5 leading-relaxed">
                Nomor HP, rekening, dan data pribadi di chat disamarkan otomatis, serta input tidak disimpan.
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#E4E0D6] rounded-2xl p-3.5 sm:p-4.5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="font-mono font-bold text-[11px] sm:text-xs text-[#8C887B]">04</span>
              <h3 className="font-display font-bold text-xs sm:text-base text-[#14130F] mt-1 sm:mt-1.5 leading-snug">Langkah lanjutan</h3>
              <p className="text-[11px] sm:text-xs text-[#5B5850] mt-1 sm:mt-1.5 leading-relaxed">
                Saran tindakan nyata dan kanal pelaporan resmi ke bank atau otoritas, bukan berhenti di skor.
              </p>
            </div>
          </div>
        </div>

        {/* Transparansi Kemampuan (Bisa vs Belum Bisa) */}
        
        {/* Mobile Tab Toggle Version (md:hidden) */}
        <div className="md:hidden mt-4 bg-white border border-[#E4E0D6] rounded-2xl p-4 shadow-2xs">
          {/* Segmented Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F5F3EE] rounded-xl border border-[#EAE6DC] mb-3.5">
            <button
              type="button"
              onClick={() => setCapabilityTab('cakupan')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                capabilityTab === 'cakupan'
                  ? 'bg-white text-[#067647] shadow-2xs'
                  : 'text-[#8C887B] hover:text-[#14130F]'
              }`}
            >
              ✓ Cakupan Deteksi
            </button>
            <button
              type="button"
              onClick={() => setCapabilityTab('batasan')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                capabilityTab === 'batasan'
                  ? 'bg-white text-[#5B5850] shadow-2xs'
                  : 'text-[#8C887B] hover:text-[#14130F]'
              }`}
            >
              — Batasan Sistem
            </button>
          </div>

          {capabilityTab === 'cakupan' ? (
            <div>
              <h3 className="font-display font-bold text-sm text-[#14130F] mb-2.5">
                Yang bisa ditunjukkan hasil ini:
              </h3>
              <ul className="text-xs text-[#3F3C35] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#067647] font-bold">✓</span>
                  <span>Kemiripan nama domain dengan merek resmi (typosquatting &amp; subdomain masking)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#067647] font-bold">✓</span>
                  <span>Pencocokan reputasi dengan basis data ancaman Google Safe Browsing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#067647] font-bold">✓</span>
                  <span>Pola manipulasi urgensi, ancaman blokir, dan permintaan kode rahasia/OTP di chat</span>
                </li>
              </ul>
            </div>
          ) : (
            <div>
              <h3 className="font-display font-bold text-sm text-[#14130F] mb-2.5">
                Yang belum bisa dilakukan:
              </h3>
              <ul className="text-xs text-[#3F3C35] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#8C887B] font-bold">—</span>
                  <span>Menjamin 100% keamanan situs jika penipuan memakai domain resmi yang baru dibajak</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8C887B] font-bold">—</span>
                  <span>Melihat isi formulir internal atau tujuan akhir tautan pendek tanpa diakses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8C887B] font-bold">—</span>
                  <span>Menggantikan peran penegak hukum atau konfirmasi manual langsung ke pihak bank</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Desktop 2-Column Version (hidden md:grid) */}
        <div className="hidden md:grid md:grid-cols-2 gap-6 mt-6 bg-white border border-[#E4E0D6] rounded-2xl p-5 sm:p-6 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#DCFAE6] text-[#067647]">Cakupan</span>
              <h3 className="font-display font-bold text-base text-[#14130F]">Yang bisa ditunjukkan hasil ini</h3>
            </div>
            <ul className="text-xs text-[#3F3C35] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#067647] font-bold">✓</span>
                <span>Kemiripan nama domain dengan merek resmi (typosquatting &amp; subdomain masking)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#067647] font-bold">✓</span>
                <span>Pencocokan reputasi dengan basis data ancaman Google Safe Browsing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#067647] font-bold">✓</span>
                <span>Pola manipulasi urgensi, ancaman blokir, dan permintaan kode rahasia/OTP di chat</span>
              </li>
            </ul>
          </div>

          <div className="border-l border-[#EEEAE0] pl-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EEEAE0] text-[#5B5850]">Batasan</span>
              <h3 className="font-display font-bold text-base text-[#14130F]">Yang belum bisa dilakukan</h3>
            </div>
            <ul className="text-xs text-[#3F3C35] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#8C887B] font-bold">—</span>
                <span>Menjamin 100% keamanan situs jika penipuan memakai domain resmi yang baru dibajak</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8C887B] font-bold">—</span>
                <span>Melihat isi formulir internal atau tujuan akhir tautan pendek tanpa diakses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8C887B] font-bold">—</span>
                <span>Menggantikan peran penegak hukum atau konfirmasi manual langsung ke pihak bank</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. SECTION: TINDAKAN DARURAT (PERBAIKAN: HAPUS LATAR BELAKANG PUTIH LUAR) */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-10 sm:py-12 border-t border-[#DDD8CC] w-full">
        <div>
          <span className="text-[11px] font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#EAE6DC] text-[#14130F]">
            PANDUAN DARURAT
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14130F] tracking-tight mt-2.5">
            Sudah terlanjur klik atau transfer?
          </h2>
          <p className="text-xs sm:text-sm text-[#5B5850] mt-1.5">
            Tenang, lakukan berurutan. Pemblokiran lewat bank paling efektif dalam 24 jam pertama.
          </p>
        </div>

        {/* Mobile Connected Timeline Checklist (sm:hidden) */}
        <div className="sm:hidden mt-5 bg-white border border-[#E4E0D6] rounded-2xl p-4.5 shadow-2xs relative">
          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#DDD8CC]">
            {/* Step 1 */}
            <div className="relative flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-white z-10">
                1
              </span>
              <div className="pt-0.5">
                <h3 className="font-bold text-sm text-[#14130F]">Berhenti</h3>
                <p className="text-xs text-[#5B5850] mt-0.5 leading-relaxed">
                  Tutup segera halaman tersebut, jangan masukkan OTP, password, atau transfer dana lagi.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-white z-10">
                2
              </span>
              <div className="pt-0.5">
                <h3 className="font-bold text-sm text-[#14130F]">Amankan akun</h3>
                <p className="text-xs text-[#5B5850] mt-0.5 leading-relaxed">
                  Segera ganti kata sandi email, m-banking, dan aktifkan verifikasi dua langkah (2FA).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-white z-10">
                3
              </span>
              <div className="pt-0.5">
                <h3 className="font-bold text-sm text-[#14130F]">Hubungi bank</h3>
                <p className="text-xs text-[#5B5850] mt-0.5 leading-relaxed">
                  Minta pemblokiran rekening atau penahanan transaksi, lalu simpan nomor laporan buktinya.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative flex items-start gap-3">
              <span className="w-7 h-7 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-white z-10">
                4
              </span>
              <div className="pt-0.5">
                <h3 className="font-bold text-sm text-[#14130F]">Laporkan</h3>
                <p className="text-xs text-[#5B5850] mt-0.5 leading-relaxed">
                  Laporkan insiden ke kanal resmi:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2 font-mono text-[10.5px]">
                  <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E4E0D6] text-gray-700">cekrekening.id</span>
                  <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E4E0D6] text-gray-700">aduannomor.id</span>
                  <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E4E0D6] text-gray-700">lapor.go.id</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Grid (hidden sm:grid) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white border border-[#E4E0D6] rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-xs mb-2.5">1</span>
              <h3 className="font-bold text-sm text-[#14130F]">Berhenti</h3>
              <p className="text-xs text-[#5B5850] mt-1 leading-relaxed">
                Tutup segera halaman tersebut, jangan masukkan OTP, password, atau transfer dana lagi.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E4E0D6] rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-xs mb-2.5">2</span>
              <h3 className="font-bold text-sm text-[#14130F]">Amankan akun</h3>
              <p className="text-xs text-[#5B5850] mt-1 leading-relaxed">
                Segera ganti kata sandi email, m-banking, dan aktifkan verifikasi dua langkah (2FA).
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E4E0D6] rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-xs mb-2.5">3</span>
              <h3 className="font-bold text-sm text-[#14130F]">Hubungi bank</h3>
              <p className="text-xs text-[#5B5850] mt-1 leading-relaxed">
                Minta pemblokiran rekening atau penahanan transaksi, lalu simpan nomor laporan buktinya.
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E4E0D6] rounded-2xl p-4.5 shadow-2xs flex flex-col justify-between">
            <div>
              <span className="w-6 h-6 rounded-full bg-[#14130F] text-white flex items-center justify-center font-bold text-xs mb-2.5">4</span>
              <h3 className="font-bold text-sm text-[#14130F]">Laporkan</h3>
              <p className="text-xs text-[#5B5850] mt-1 leading-relaxed">
                Laporkan insiden ke kanal resmi:
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E4E0D6]">cekrekening.id</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E4E0D6]">aduannomor.id</span>
                <span className="px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E4E0D6]">lapor.go.id</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECTION: FAQ PERTANYAAN UMUM */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-8 py-12 border-t border-[#DDD8CC] w-full">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14130F] tracking-tight">
          Pertanyaan umum
        </h2>

        <div className="mt-6 border-t border-[#DDD8CC] divide-y divide-[#DDD8CC]">
          <details className="group py-4.5 cursor-pointer">
            <summary className="flex justify-between items-center font-display text-base sm:text-lg font-bold text-[#14130F] list-none select-none">
              <span>Apakah Scamora gratis dan perlu login?</span>
              <ChevronDown className="w-4.5 h-4.5 text-[#14130F] group-open:rotate-180 transition-transform duration-200" />
            </summary>
            <p className="text-xs sm:text-sm text-[#5B5850] mt-2.5 leading-relaxed">
              Gratis dan tanpa login. Kamu bisa langsung memeriksa tautan atau chat yang mencurigakan tanpa perlu mendaftar akun atau memasukkan data pribadi.
            </p>
          </details>

          <details className="group py-4.5 cursor-pointer">
            <summary className="flex justify-between items-center font-display text-base sm:text-lg font-bold text-[#14130F] list-none select-none">
              <span>Apakah tautan atau chat saya disimpan?</span>
              <ChevronDown className="w-4.5 h-4.5 text-[#14130F] group-open:rotate-180 transition-transform duration-200" />
            </summary>
            <p className="text-xs sm:text-sm text-[#5B5850] mt-2.5 leading-relaxed">
              Tidak. Hanya nama domain yang bisa tampil di Direktori Komunitas, itu pun kalau kamu mencentang izinnya. Isi chat tidak pernah disimpan di server dan data pribadi seperti nomor telepon, rekening, atau kata sandi disamarkan otomatis.
            </p>
          </details>

          <details className="group py-4.5 cursor-pointer">
            <summary className="flex justify-between items-center font-display text-base sm:text-lg font-bold text-[#14130F] list-none select-none">
              <span>Hasil Rendah berarti aman 100%?</span>
              <ChevronDown className="w-4.5 h-4.5 text-[#14130F] group-open:rotate-180 transition-transform duration-200" />
            </summary>
            <p className="text-xs sm:text-sm text-[#5B5850] mt-2.5 leading-relaxed">
              Tidak. Artinya belum ditemukan tanda bahaya yang signifikan pada pemeriksaan yang dilakukan. Tetap waspada dan jangan pernah membagikan kode OTP atau PIN kepada siapa pun.
            </p>
          </details>

          <details className="group py-4.5 cursor-pointer">
            <summary className="flex justify-between items-center font-display text-base sm:text-lg font-bold text-[#14130F] list-none select-none">
              <span>Kenapa hasilnya Perlu Ditinjau?</span>
              <ChevronDown className="w-4.5 h-4.5 text-[#14130F] group-open:rotate-180 transition-transform duration-200" />
            </summary>
            <p className="text-xs sm:text-sm text-[#5B5850] mt-2.5 leading-relaxed">
              Ada tanda yang perlu diverifikasi lebih lanjut, atau sebagian pemeriksaan teknis tidak dapat diselesaikan. Hubungi pihak pengirim atau lembaga resmi lewat kanal resmi mereka sebelum mengambil tindakan.
            </p>
          </details>
        </div>
      </section>

    </div>
  );
};
