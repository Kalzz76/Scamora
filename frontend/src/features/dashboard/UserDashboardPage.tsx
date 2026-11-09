import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Globe,
  MessageSquare,
  Gamepad2,
  GraduationCap,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Search,
  ExternalLink,
  ChevronRight,
  User,
} from 'lucide-react';
import { adminAuth } from '../../admin/services/adminAuth';
import { userService, type UserStatistics, type UserScanHistoryItem } from '../../services/userService';

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = adminAuth.getUser();

  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [history, setHistory] = useState<UserScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'url' | 'chat'>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    async function loadData() {
      try {
        const [statsData, historyData] = await Promise.all([
          userService.getStats(),
          userService.getHistory(),
        ]);
        setStats(statsData);
        setHistory(historyData);
      } catch (err) {
        console.warn('Gagal memuat data dashboard user:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (historyFilter === 'all') return true;
    return item.type === historyFilter;
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Bahaya</span>
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Perlu Tinjau</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Aman</span>
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 font-['DM_Sans',sans-serif]">
      {/* 1. HERO HEADER */}
      <div className="relative rounded-3xl bg-white border border-[#E3E0DA] p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#0f9b8a]/10 via-[#143826]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Akun Terverifikasi &bull; Akses Penuh (Tanpa Batas)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#14161c] tracking-tight leading-tight">
              Selamat Datang, {user?.name || user?.username || 'Warga'}!
            </h1>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Ini adalah User Dashboard pribadi Anda. Nikmati fitur pemindaian tanpa batas, pantau riwayat pemeriksaan keamanan, dan akses seluruh modul perlindungan Scamora.
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#14161c] hover:bg-[#2b2f3a] text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer group"
            >
              <Globe className="w-4 h-4 text-[#0f9b8a]" />
              <span>Mulai Pemindaian Baru</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/kuis"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer group"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Tantangan AI</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STATS CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Pemindaian */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E0DA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b] font-bold">
              Total Pemindaian
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#14161c]">
              <Sparkles className="w-4 h-4 text-[#0f9b8a]" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#14161c] font-mono block">
              {loading ? '...' : (stats?.totalScans ?? 0)}
            </span>
            <span className="text-[11px] text-[#64748b] mt-0.5 block">
              URL & pesan WhatsApp
            </span>
          </div>
        </div>

        {/* Pemindaian URL */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E0DA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b] font-bold">
              Pemindaian URL
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#14161c] font-mono block">
              {loading ? '...' : (stats?.urlScans ?? 0)}
            </span>
            <span className="text-[11px] text-[#64748b] mt-0.5 block">
              Domain & tautan web
            </span>
          </div>
        </div>

        {/* Pemindaian Chat */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E0DA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b] font-bold">
              Analisis Chat
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#14161c] font-mono block">
              {loading ? '...' : (stats?.chatScans ?? 0)}
            </span>
            <span className="text-[11px] text-[#64748b] mt-0.5 block">
              Pesan teks & malware APK
            </span>
          </div>
        </div>

        {/* Skor Tantangan AI */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E3E0DA] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#64748b] font-bold">
              Skor Tantangan AI
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-[#0f9b8a] font-mono block">
              {loading ? '...' : `${stats?.highestScore ?? 0}/100`}
            </span>
            <span className="text-[11px] text-[#64748b] mt-0.5 block">
              {stats?.challengeAttempts ?? 0} sesi simulasi selesai
            </span>
          </div>
        </div>
      </div>

      {/* 3. FEATURE SHORTCUTS (Akses Lengkap Fitur) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-[#14161c] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0f9b8a]" />
            <span>Akses Fitur Scamora</span>
          </h2>
          <span className="text-xs text-[#64748b]">Seluruh fitur terbuka untuk akun Anda</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card: Pemindaian Publik */}
          <Link
            to="/laporan"
            className="p-5 rounded-2xl bg-white border border-[#E3E0DA] hover:border-[#14161c] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0f9b8a]/10 text-[#0f9b8a] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#14161c] group-hover:text-[#0f9b8a] transition-colors">
                Pemindaian Publik
              </h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Jelajahi basis data ribuan domain berbahaya hasil pemindaian langsung oleh sistem Scamora.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-[#0f9b8a]">
              <span>Buka Direktori</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card: Tantangan AI */}
          <Link
            to="/kuis"
            className="p-5 rounded-2xl bg-white border border-[#E3E0DA] hover:border-[#14161c] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#143826]/10 text-[#143826] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#14161c] group-hover:text-[#0f9b8a] transition-colors">
                Tantangan AI Interaktif
              </h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Simulasi percakapan interaktif menghadapi bot penipu yang dirancang oleh Google Gemini AI.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-[#143826]">
              <span>Mulai Sesi Simulasi</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card: Edukasi */}
          <Link
            to="/pengetahuan"
            className="p-5 rounded-2xl bg-white border border-[#E3E0DA] hover:border-[#14161c] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#14161c] group-hover:text-[#0f9b8a] transition-colors">
                Pusat Edukasi & Taksonomi
              </h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Koleksi artikel mendalam, tanda bahaya (red flags), dan mitigasi resmi berbagai modus penipuan siber.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-amber-700">
              <span>Pelajari Modus</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card: Komunitas */}
          <Link
            to="/komunitas"
            className="p-5 rounded-2xl bg-white border border-[#E3E0DA] hover:border-[#14161c] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#14161c] group-hover:text-[#0f9b8a] transition-colors">
                Komunitas Warga Waspada
              </h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Forum konsultasi real-time sesama warga. Laporkan temuan baru dan berikan saran solusi terverifikasi.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-purple-700">
              <span>Buka Forum Diskusi</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card: Panduan */}
          <Link
            to="/panduan"
            className="p-5 rounded-2xl bg-white border border-[#E3E0DA] hover:border-[#14161c] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#14161c] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#14161c] group-hover:text-[#0f9b8a] transition-colors">
                Panduan Praktis Keamanan
              </h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Langkah mitigasi darurat saat terlanjur mengeklik tautan berbahaya atau mentransfer uang muka ke penipu.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-[#14161c]">
              <span>Buka Panduan</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card: Profil Pengguna */}
          <Link
            to="/profil"
            className="p-5 rounded-2xl bg-white border border-[#E3E0DA] hover:border-[#14161c] shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#14161c] group-hover:text-[#0f9b8a] transition-colors">
                Profil & Pengaturan Akun
              </h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Kelola informasi identitas akun, ubah kata sandi, dan tinjau status hak akses verified Anda.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <span>Kelola Profil</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. RIWAYAT PEMINDAIAN PENGGUNA (User Scan History) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#14161c] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0f9b8a]" />
              <span>Riwayat Pemindaian Anda</span>
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Histori pemeriksaan akun Anda tersimpan aman dan terenkripsi.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="inline-flex p-1 rounded-xl bg-[#eeece8] border border-[#d9d6d0]">
            <button
              type="button"
              onClick={() => setHistoryFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                historyFilter === 'all'
                  ? 'bg-white text-[#14161c] shadow-xs'
                  : 'text-[#64748b] hover:text-[#14161c]'
              }`}
            >
              Semua ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('url')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                historyFilter === 'url'
                  ? 'bg-white text-[#14161c] shadow-xs'
                  : 'text-[#64748b] hover:text-[#14161c]'
              }`}
            >
              URL ({history.filter((h) => h.type === 'url').length})
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('chat')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                historyFilter === 'chat'
                  ? 'bg-white text-[#14161c] shadow-xs'
                  : 'text-[#64748b] hover:text-[#14161c]'
              }`}
            >
              WhatsApp ({history.filter((h) => h.type === 'chat').length})
            </button>
          </div>
        </div>

        {/* History List Container */}
        <div className="bg-white rounded-3xl border border-[#E3E0DA] shadow-xs overflow-hidden">
          {filteredHistory.length > 0 ? (
            <div className="divide-y divide-[#E3E0DA]">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#faf8f5]/60 transition"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      {item.type === 'url' ? (
                        <Globe className="w-5 h-5 text-blue-600" />
                      ) : (
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                          {item.type === 'url' ? 'Tautan Web' : 'Pesan WhatsApp'}
                        </span>
                        <span className="text-[#d9d6d0]">&bull;</span>
                        <span className="text-[11px] text-[#64748b]">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-[#14161c] truncate max-w-xl">
                        {item.inputSummary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {getRiskBadge(item.riskLevel)}
                    <span className="font-mono text-xs font-bold text-[#14161c]">
                      Skor {item.riskScore}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#14161c]">
                Belum Ada Riwayat Pemindaian
              </h3>
              <p className="text-xs text-[#64748b] max-w-sm mx-auto leading-relaxed">
                Lakukan pemindaian tautan atau chat pertama Anda untuk mendeteksi potensi ancaman siber.
              </p>
              <div className="pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#14161c] hover:bg-[#2b2f3a] text-white text-xs font-bold transition shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Mulai Pemindaian Sekarang</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

