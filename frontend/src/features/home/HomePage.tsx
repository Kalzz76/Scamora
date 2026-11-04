import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { 
  ShieldCheck, 
  Link2, 
  MessageSquare, 
  ArrowRight, 
  Lock, 
  Search,
  Star,
  Compass,
  Tag,
  Clock,
  Shield,
  Layers
} from 'lucide-react';
import { DEMO_PRESETS } from '../../lib/constants';

interface HomePageProps {
  onLoadDemo: (presetId: string) => void;
}

// Animation Variants for Scroll & Entrance Transitions
const containerStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export const HomePage: React.FC<HomePageProps> = ({ onLoadDemo }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [quickInput, setQuickInput] = useState<string>('');
  const [scannerType, setScannerType] = useState<'url' | 'chat'>('url');

  const handleSelectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    onLoadDemo(preset.id);
    if (preset.type === 'url') {
      navigate('/url');
    } else {
      navigate('/chat');
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) {
      if (scannerType === 'url') navigate('/url');
      else navigate('/chat');
      return;
    }

    if (scannerType === 'url') {
      navigate('/url');
    } else {
      navigate('/chat');
    }
  };

  const categories = [
    { id: 'all', label: 'Semua Modus', icon: Layers },
    { id: 'url', label: 'URL Phishing', icon: Link2 },
    { id: 'chat', label: 'Chat WhatsApp', icon: MessageSquare },
    { id: 'apk', label: 'Berkas .APK', icon: Shield },
    { id: 'job', label: 'Job Scam', icon: Tag },
    { id: 'bank', label: 'Tiruan Bank', icon: Compass },
  ];

  const popularScenarios = [
    {
      id: 'apk-undangan',
      presetId: 'chat-apk-invitation',
      title: 'Undangan Pernikahan .APK',
      subtitle: 'Malware Kurir & Pencuri OTP',
      type: 'chat',
      rating: '4.9',
      scoreBadge: 'RISIKO TINGGI',
      scoreColor: 'text-[#E86A33]',
      bgGradient: 'from-[#143826] via-[#1C4E36] to-[#0D2418]',
      icon: MessageSquare,
      imagePlaceholder: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'phishing-bank',
      presetId: 'url-bank-phishing',
      title: 'Domain Bank Tiruan',
      subtitle: 'Typosquatting & Subdomain Palsu',
      type: 'url',
      rating: '4.8',
      scoreBadge: 'RISIKO TINGGI',
      scoreColor: 'text-[#E86A33]',
      bgGradient: 'from-[#0D2636] via-[#133A52] to-[#0A1D2A]',
      icon: Link2,
      imagePlaceholder: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'job-scam',
      presetId: 'chat-job-scam',
      title: 'Freelance Like Video',
      subtitle: 'Komisi Fiktif & Deposit Uang',
      type: 'chat',
      rating: '4.9',
      scoreBadge: 'RISIKO TINGGI',
      scoreColor: 'text-[#E86A33]',
      bgGradient: 'from-[#3A2218] via-[#522E1F] to-[#24150E]',
      icon: Tag,
      imagePlaceholder: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'portal-resmi',
      presetId: 'url-official-portal',
      title: 'Portal Bank Terverifikasi',
      subtitle: 'Protokol HTTPS & Domain Sah',
      type: 'url',
      rating: '5.0',
      scoreBadge: 'RISIKO RENDAH',
      scoreColor: 'text-emerald-500',
      bgGradient: 'from-[#163628] via-[#20523C] to-[#0E241B]',
      icon: ShieldCheck,
      imagePlaceholder: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="flex flex-col w-full bg-[#F8F9FA] text-[#1A202C]">
      
      {/* 1. HERO SECTION (Spacious & Luxurious Pomaii Travel SaaS Style) */}
      <section className="relative w-full pt-8 pb-16 sm:pt-12 sm:pb-24 overflow-hidden">
        
        {/* Scenic Background with Pomaii Organic Wave Cutout */}
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 relative">
          
          <div className="relative w-full h-[560px] sm:h-[620px] lg:h-[660px] rounded-3xl sm:rounded-[40px] overflow-hidden shadow-2xl">
            
            {/* Background High-Def Security & Scenic Mountain Visual */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85')`,
              }}
            >
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            </div>

            {/* Organic Translucent Wave Silhouette (Pomaii Signature Foreground) */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 90% 80% at -10% 40%, rgba(248, 249, 250, 0.98) 45%, rgba(248, 249, 250, 0.75) 60%, transparent 80%)`,
              }}
            />

            {/* Left Content Area (Animated Cascade On Load) */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerStagger}
              className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-14 lg:px-20 max-w-2xl space-y-7"
            >
              
              {/* Top Tag with Leaf / Shield */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-[#143826]">
                <span className="w-6 h-6 rounded-full bg-[#EAF2ED] flex items-center justify-center text-[#143826] shadow-2xs">
                  🌿
                </span>
                <span>AUTONOMOUS CYBER DEFENSE</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-[68px] font-black tracking-tight text-[#1A202C] leading-[1.06]">
                Kenali Penipuan. <br />
                <span className="text-[#143826]">
                  Lindungi <span className="text-[#E86A33]">Diri Anda.</span>
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p variants={fadeUp} className="text-base sm:text-lg text-gray-700 max-w-lg leading-relaxed font-medium">
                Periksa tautan mencurigakan dan bongkar manipulasi percakapan WhatsApp secara instan dengan transparansi bukti kecerdasan buatan.
              </motion.p>

              {/* Orange Pill CTA Button */}
              <motion.div variants={fadeUp} className="pt-2 flex items-center gap-4">
                <Link
                  to="/url"
                  className="btn-animate inline-flex items-center gap-3 px-9 py-4 rounded-full bg-[#E86A33] hover:bg-[#D75922] text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 transition-all"
                >
                  <span>Mulai Periksa Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

            </motion.div>

          </div>

          {/* FLOATING SCANNER CAPSULE DOCK (Smooth Slide Up on Load) */}
          <motion.div 
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative -mt-12 sm:-mt-14 z-20 max-w-5xl mx-auto px-4"
          >
            <form 
              onSubmit={handleQuickSubmit}
              className="pomaii-dock p-4 sm:p-5 bg-white rounded-2xl sm:rounded-full border border-gray-200/90 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-3"
            >
              
              {/* Field 1: Mode Switcher */}
              <div className="flex-1 flex items-center gap-3.5 px-4 py-2 hover:bg-gray-50 rounded-xl sm:rounded-full transition cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#EAF2ED] flex items-center justify-center text-[#143826] shrink-0 shadow-2xs">
                  {scannerType === 'url' ? <Link2 className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">Jenis Analisis:</span>
                  <div className="flex gap-2.5 text-xs font-semibold text-gray-500 mt-1">
                    <button
                      type="button"
                      onClick={() => setScannerType('url')}
                      className={`hover:text-[#143826] transition-colors ${scannerType === 'url' ? 'text-[#E86A33] font-bold underline' : ''}`}
                    >
                      Tautan URL
                    </button>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={() => setScannerType('chat')}
                      className={`hover:text-[#143826] transition-colors ${scannerType === 'chat' ? 'text-[#E86A33] font-bold underline' : ''}`}
                    >
                      Chat WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block w-px h-9 bg-gray-200" />

              {/* Field 2: Quick Input Box */}
              <div className="flex-[2] flex items-center gap-3.5 px-4 py-2 hover:bg-gray-50 rounded-xl sm:rounded-full transition">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex flex-col text-left w-full">
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">
                    {scannerType === 'url' ? 'Masukkan URL Mencurigakan' : 'Tempelkan Teks Percakapan'}
                  </span>
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder={scannerType === 'url' ? 'https://bca-klik.secure-update.xyz...' : 'Halo kak, ada tugas part-time online...'}
                    className="w-full text-xs text-gray-700 placeholder:text-gray-400 bg-transparent focus:outline-hidden font-sans truncate mt-0.5"
                  />
                </div>
              </div>

              <div className="hidden sm:block w-px h-9 bg-gray-200" />

              {/* Field 3: Privacy Indicator */}
              <div className="hidden md:flex flex-1 items-center gap-3.5 px-4 py-2">
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">Privasi Data</span>
                  <span className="text-[11px] text-gray-500 mt-0.5">Zero Data Retention</span>
                </div>
              </div>

              {/* Dark Green Search Pill Button */}
              <button
                type="submit"
                className="btn-animate inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full bg-[#143826] hover:bg-[#1D4E36] text-white font-bold text-sm shadow-md transition-all shrink-0"
              >
                <span>Periksa</span>
                <Search className="w-4 h-4" />
              </button>

            </form>
          </motion.div>

        </div>

      </section>

      {/* 2. FOUR MICRO-FEATURE BADGES ROW (Scroll Triggered Stagger) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerStagger}
        className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 w-full"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          <motion.div variants={fadeUp} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-full border border-gray-200 bg-[#F8F9FA] flex items-center justify-center text-[#143826] shrink-0">
              <Compass className="w-6 h-6 text-[#143826]" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-[#1A202C]">Deteksi Cepat &bull; &lt;1.5s</h4>
              <p className="text-xs text-gray-500 mt-0.5">Pemindaian seketika tanpa antrean.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-full border border-gray-200 bg-[#F8F9FA] flex items-center justify-center text-[#143826] shrink-0">
              <Tag className="w-6 h-6 text-[#143826]" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-[#1A202C]">Zero Data Retention</h4>
              <p className="text-xs text-gray-500 mt-0.5">Data mentah tidak disimpan di server.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-full border border-gray-200 bg-[#F8F9FA] flex items-center justify-center text-[#143826] shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#143826]" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-[#1A202C]">Explainable AI</h4>
              <p className="text-xs text-gray-500 mt-0.5">Disertai kutipan bukti otentik asli.</p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-card transition-all">
            <div className="w-12 h-12 rounded-full border border-gray-200 bg-[#F8F9FA] flex items-center justify-center text-[#143826] shrink-0">
              <Clock className="w-6 h-6 text-[#143826]" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-bold text-[#1A202C]">Akses Terbuka 24/7</h4>
              <p className="text-xs text-gray-500 mt-0.5">Dapat dipakai tanpa registrasi akun.</p>
            </div>
          </motion.div>

        </div>
      </motion.section>

      {/* 3. POPULAR SCENARIOS SECTION (Scroll Triggered Staggered Cards) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerStagger}
        className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-24 w-full space-y-10"
      >
        
        {/* Section Header */}
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A202C] tracking-tight">
              Skenario Serangan Populer
            </h2>
            <span className="text-xl">🌿</span>
          </div>

          <Link
            to="/panduan"
            className="text-sm font-bold text-gray-700 hover:text-[#143826] flex items-center gap-1.5 group transition-colors"
          >
            <span>Lihat Semua Modus</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* 4 Cards Grid with Staggered Fade Up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {popularScenarios.map((item) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              onClick={() => {
                const preset = DEMO_PRESETS.find(p => p.id === item.presetId);
                if (preset) handleSelectPreset(preset);
              }}
              className="pomaii-card relative h-[380px] rounded-3xl overflow-hidden cursor-pointer group shadow-md"
            >
              {/* Background Cover Image with Scrim */}
              <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url('${item.imagePlaceholder}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
              </div>

              {/* Top Rating Badge */}
              <div className="absolute top-5 left-5 z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-[#143826]/90 backdrop-blur-md text-white text-xs font-bold border border-white/15 shadow-sm">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{item.rating}</span>
              </div>

              {/* Bottom Info Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-6 text-white z-10 flex items-end justify-between">
                <div>
                  <h3 className="font-extrabold text-lg leading-snug text-white group-hover:text-[#E86A33] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-1 font-medium">
                    {item.subtitle}
                  </p>
                </div>

                <div className={`text-xs font-black shrink-0 tracking-wide ${item.scoreColor}`}>
                  {item.scoreBadge}
                </div>
              </div>

            </motion.div>
          ))}
        </div>

        {/* CATEGORY FILTER PILLS ROW */}
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap pt-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`btn-animate inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs sm:text-sm font-bold border transition ${
                  active
                    ? 'bg-[#143826] text-white border-[#143826] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#E86A33]' : 'text-gray-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </motion.div>

      </motion.section>

      {/* 4. GUIDES & STORIES SECTION (Scroll Reveal) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerStagger}
        className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-24 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-[#F2F7F4] p-10 sm:p-14 lg:p-16 rounded-[40px] border border-[#CFDDD5]">
          
          {/* Left Column: Editorial Callout */}
          <motion.div variants={fadeUp} className="lg:col-span-5 space-y-5 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 font-mono">
              Perlu Tindakan Cepat?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#143826] tracking-tight leading-tight">
              Panduan Tanggap Insiden &amp; Checklist Mitigasi
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
              Langkah darurat yang wajib dilakukan jika Anda terlanjur mengklik tautan mencurigakan atau menginstal file .APK dari nomor tidak dikenal.
            </p>
            <div className="pt-3">
              <Link
                to="/panduan"
                className="btn-animate inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#143826] hover:bg-[#1D4E36] text-white text-xs sm:text-sm font-bold shadow-md transition"
              >
                <span>Buka Panduan Lengkap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 2 Horizontal Rounded Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Guide Card 1 */}
            <motion.div variants={fadeUp} whileHover={{ y: -6, transition: { duration: 0.25 } }}>
              <Link
                to="/panduan"
                className="pomaii-card block p-5 rounded-3xl bg-white border border-[#E8ECE9] space-y-4 group hover:shadow-lg transition"
              >
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=500&q=80"
                    alt="APK Isolation Protocol"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <h4 className="font-extrabold text-base text-[#143826] group-hover:text-[#E86A33] transition-colors leading-snug">
                    Protokol Isolasi Ponsel Pasca Instal .APK
                  </h4>
                  <span className="text-xs text-gray-400 font-medium">3 menit baca &bull; Mitigasi Kritis</span>
                </div>
              </Link>
            </motion.div>

            {/* Guide Card 2 */}
            <motion.div variants={fadeUp} whileHover={{ y: -6, transition: { duration: 0.25 } }}>
              <Link
                to="/panduan"
                className="pomaii-card block p-5 rounded-3xl bg-white border border-[#E8ECE9] space-y-4 group hover:shadow-lg transition"
              >
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=500&q=80"
                    alt="Transfer Checklist"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <h4 className="font-extrabold text-base text-[#143826] group-hover:text-[#E86A33] transition-colors leading-snug">
                    Checklist 6 Poin Sebelum Transfer Dana
                  </h4>
                  <span className="text-xs text-gray-400 font-medium">2 menit baca &bull; Cek Rekening</span>
                </div>
              </Link>
            </motion.div>

          </div>

        </div>
      </motion.section>

      {/* 5. WIDE SPECIAL OFFER BANNER CARD (Scroll Reveal) */}
      <motion.section 
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 w-full"
      >
        <div className="relative rounded-[40px] bg-[#143826] text-white overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
          
          {/* Left Visual Half */}
          <div className="lg:col-span-5 relative h-72 lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
              alt="Global Threat Defense"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-[#143826]" />
          </div>

          {/* Right Text Half */}
          <div className="lg:col-span-7 p-8 sm:p-14 lg:p-18 flex flex-col justify-center space-y-6 text-left relative z-10">
            
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E86A33]">
              <span>SPECIAL CHALLENGE</span>
              <span>🌾</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Lindungi Percakapan &amp; Transaksi Anda Hari Ini
            </h2>

            <p className="text-sm sm:text-base text-gray-300 max-w-lg leading-relaxed font-medium">
              Gunakan pemindai mandiri Scamora AI tanpa pungutan biaya, tanpa akun, dan dengan jaminan privasi mutlak.
            </p>

            {/* Warm Orange Pill Button */}
            <div className="pt-2">
              <Link
                to="/url"
                className="btn-animate inline-flex items-center gap-3 px-9 py-4 rounded-full bg-[#E86A33] hover:bg-[#D75922] text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 transition"
              >
                <span>Mulai Uji Coba Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Botanical Graphic Accent on Bottom Right */}
            <div className="absolute bottom-6 right-8 text-7xl opacity-20 pointer-events-none select-none">
              🌺
            </div>

          </div>

        </div>
      </motion.section>

    </div>
  );
};
