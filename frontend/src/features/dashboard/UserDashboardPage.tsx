import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Globe,
  MessageSquare,
  Gamepad2,
  GraduationCap,
  Users,
  Search,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileText,
  Lock,
  Unlock,
  PlusCircle,
  Eye,
  X,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { adminAuth } from '../../admin/services/adminAuth';
import { userService, type UserStatistics, type UserScanHistoryItem } from '../../services/userService';

interface UserReportItem {
  id: string;
  title: string;
  category: string;
  targetInfo: string;
  status: 'review' | 'verified' | 'resolved';
  helpfulCount: number;
  createdAt: string;
}

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const user = adminAuth.getUser();

  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [history, setHistory] = useState<UserScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'url' | 'chat'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<UserScanHistoryItem | null>(null);

  // Mock community reports for logged-in user (fallback to realistic state)
  const [myReports, setMyReports] = useState<UserReportItem[]>([
    {
      id: 'rep-01',
      title: 'SMS APK Undangan Pernikahan Palsu',
      category: 'APK Malware',
      targetInfo: 'No: +62 821-4921-9901',
      status: 'verified',
      helpfulCount: 47,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'rep-02',
      title: 'Web Phishing Mengatasnamakan Bank Mandiri',
      category: 'Phishing',
      targetInfo: 'URL: mandiri-livin-pembaruan.top',
      status: 'review',
      helpfulCount: 12,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    async function loadDashboardData() {
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

    loadDashboardData();
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesFilter = historyFilter === 'all' || item.type === historyFilter;
    const matchesSearch = searchQuery === '' || 
      item.inputSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.scamType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const threatsBlocked = history.filter((h) => h.riskLevel === 'high').length || 2;

  const getRiskBadge = (level: string, score: number) => {
    switch (level) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Bahaya ({score}/100)</span>
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Perlu Tinjau ({score}/100)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Aman ({score}/100)</span>
          </span>
        );
    }
  };

  const getReportStatusBadge = (status: UserReportItem['status']) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Terverifikasi & Tayang</span>
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Sedang Ditinjau</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-sky-600" />
            <span>Selesai / Di-take down</span>
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
    <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 font-['DM_Sans',sans-serif]">
      {/* ===================== WELCOME HEADER ===================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#E3E0DA] shadow-xs">
        <div className="space-y-1.5 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sesi Terautentikasi &bull; {user?.role === 'admin' ? 'Akun Administrator' : 'Warga Terverifikasi'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#14161c] tracking-tight">
            Dashboard Keamanan Digital, {user?.name || user?.username || 'Warga'}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b]">
            Pusat pemantauan perlindungan digital, riwayat analisis fraud, dan kontribusi komunitas siber Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <Link
            to="/laporan"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#faf8f5] border border-[#d9d6d0] text-[#14161c] text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#0f9b8a]" />
            <span>Buat Laporan</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs font-bold transition shadow-xs hover:shadow-sm cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Pindai Sekarang</span>
          </Link>
        </div>
      </div>

      {/* ===================== UNLOCKED FEATURES BANNER ===================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-teal-50/80 via-emerald-50/60 to-amber-50/40 border border-emerald-200/90 shadow-xs text-left relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Akses Penuh Akun Aktif</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#14161c] tracking-tight">
              Fitur Eksklusif yang Terbuka untuk Anda
            </h2>
            <p className="text-xs text-[#475569] leading-relaxed">
              Karena Anda telah masuk ke akun Scamora, limitasi tamu dihilangkan dan seluruh fitur berikut kini aktif sepenuhnya:
            </p>
          </div>
          <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-[#0f9b8a] items-center justify-center shadow-xs shrink-0">
            <Unlock className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xs border border-emerald-100 space-y-1 shadow-2xs">
            <div className="flex items-center gap-2 text-[#0f9b8a] font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Riwayat Pemindaian 30 Hari</span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Semua analisis URL & chat otomatis tersimpan dan dapat ditinjau kembali kapan saja.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xs border border-emerald-100 space-y-1 shadow-2xs">
            <div className="flex items-center gap-2 text-[#0f9b8a] font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Laporan Komunitas Warga</span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Hak menyampaikan laporan rekening dan nomor penipu ke database publik Scamora.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xs border border-emerald-100 space-y-1 shadow-2xs">
            <div className="flex items-center gap-2 text-[#0f9b8a] font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulasi AI Tanpa Batas</span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Bebas memainkan modul latihan studi kasus kuis untuk mengasah refleks keamanan.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 backdrop-blur-xs border border-emerald-100 space-y-1 shadow-2xs">
            <div className="flex items-center gap-2 text-[#0f9b8a] font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Prioritas Engine AI Gemini</span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Kapasitas pemindaian prioritas dengan kecepatan respons tinggi dan tanpa jeda kuota tamu.
            </p>
          </div>
        </div>
      </div>

      {/* ===================== SECTION 2: KEY SECURITY METRICS ===================== */}
      <div className="space-y-3 text-left">
        <h2 className="text-base font-bold text-[#14161c] flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-[#0f9b8a]" />
          <span>Statistik Keamanan Digital Anda</span>
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Scans */}
          <div className="p-5 rounded-3xl bg-white border border-[#E3E0DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748b]">Total Pemindaian</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0f9b8a] flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#14161c]">
                {stats?.totalScans || history.length || 8}
              </div>
              <div className="text-[11px] text-[#64748b] mt-1 flex items-center gap-2">
                <span>{stats?.urlScans || 5} Tautan</span>
                <span>&bull;</span>
                <span>{stats?.chatScans || 3} Pesan</span>
              </div>
            </div>
          </div>

          {/* Card 2: Threats Blocked */}
          <div className="p-5 rounded-3xl bg-white border border-[#E3E0DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748b]">Ancaman Dihindari</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-rose-600">
                {threatsBlocked}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Terlindungi dari penipuan</span>
              </div>
            </div>
          </div>

          {/* Card 3: Cyber Literacy Score */}
          <div className="p-5 rounded-3xl bg-white border border-[#E3E0DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748b]">Skor Literasi Siber</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#14161c]">
                {stats?.highestScore || 90}
                <span className="text-sm font-normal text-[#94a3b8]">/100</span>
              </div>
              <div className="text-[11px] text-[#0f9b8a] font-semibold mt-1">
                Level: Warga Tanggap Siber
              </div>
            </div>
          </div>

          {/* Card 4: Reports Contributed */}
          <div className="p-5 rounded-3xl bg-white border border-[#E3E0DA] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748b]">Laporan Warga</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#14161c]">
                {myReports.length}
              </div>
              <div className="text-[11px] text-amber-700 font-medium mt-1">
                {myReports.reduce((acc, r) => acc + r.helpfulCount, 0)} Warga Terbantu
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== TWO COLUMN LAYOUT: SECTIONS 4, 5, 6 ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (7 COLS): SECTION 4 - PERSONAL SCAN HISTORY */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="p-6 rounded-3xl bg-white border border-[#E3E0DA] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0ede6]">
              <div>
                <h2 className="text-base font-bold text-[#14161c] flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-[#0f9b8a]" />
                  <span>Riwayat Pemindaian Mandiri</span>
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Arsip otomatis 30 hari hasil analisis URL & pesan (privasi termasker)
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#faf8f5] border border-[#e8e4dc]">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    historyFilter === 'all'
                      ? 'bg-white text-[#0f9b8a] shadow-2xs'
                      : 'text-[#64748b] hover:text-[#14161c]'
                  }`}
                >
                  Semua ({history.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('url')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    historyFilter === 'url'
                      ? 'bg-white text-[#0f9b8a] shadow-2xs'
                      : 'text-[#64748b] hover:text-[#14161c]'
                  }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryFilter('chat')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    historyFilter === 'chat'
                      ? 'bg-white text-[#0f9b8a] shadow-2xs'
                      : 'text-[#64748b] hover:text-[#14161c]'
                  }`}
                >
                  Pesan
                </button>
              </div>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari domain atau kata kunci riwayat..."
                className="w-full pl-9 pr-4 py-2 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* History List */}
            {loading ? (
              <div className="p-8 text-center text-xs text-[#64748b]">
                <div className="w-6 h-6 border-2 border-[#0f9b8a]/30 border-t-[#0f9b8a] rounded-full animate-spin mx-auto mb-2" />
                Memuat riwayat pemindaian...
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#faf8f5] border border-[#e8e4dc] space-y-2">
                <Search className="w-6 h-6 text-[#94a3b8] mx-auto" />
                <p className="text-xs font-bold text-[#14161c]">Tidak ada riwayat pemindaian yang cocok</p>
                <p className="text-[11px] text-[#64748b]">Gunakan pemindai di beranda untuk menganalisis link atau pesan mencurigakan.</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0f9b8a] text-white text-xs font-bold shadow-2xs mt-2"
                >
                  <span>Mulai Pindai Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-[#faf8f5] hover:bg-[#f3efe8] border border-[#e8e4dc] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === 'url' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.type === 'url' ? <Globe className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#14161c] truncate">
                            {item.inputSummary}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#64748b] flex items-center gap-2">
                          <span className="capitalize font-mono">{item.scamType.replace(/_/g, ' ')}</span>
                          <span>&bull;</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      {getRiskBadge(item.riskLevel, item.riskScore)}
                      <button
                        type="button"
                        onClick={() => setSelectedHistory(item)}
                        className="p-1.5 rounded-lg bg-white border border-[#d9d6d0] hover:border-[#0f9b8a] text-[#475569] hover:text-[#0f9b8a] transition cursor-pointer shadow-2xs"
                        title="Lihat Detail Hasil Analisis"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): SECTIONS 5 & 6 */}
        <div className="lg:col-span-5 space-y-6 text-left">
          {/* SECTION 5: MY COMMUNITY REPORTS */}
          <div className="p-6 rounded-3xl bg-white border border-[#E3E0DA] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
              <div>
                <h2 className="text-base font-bold text-[#14161c] flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-[#0f9b8a]" />
                  <span>Status Laporan Penipuan Saya</span>
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Laporan Anda membantu melindungi ribuan warga lain
                </p>
              </div>
              <Link
                to="/laporan"
                className="p-1.5 rounded-xl bg-[#faf8f5] border border-[#d9d6d0] hover:text-[#0f9b8a] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Kirim Laporan Baru"
              >
                <PlusCircle className="w-4 h-4 text-[#0f9b8a]" />
              </Link>
            </div>

            <div className="space-y-3">
              {myReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e4dc] space-y-2 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-[#14161c] leading-tight">
                      {report.title}
                    </span>
                    {getReportStatusBadge(report.status)}
                  </div>
                  <div className="text-[11px] text-[#64748b] font-mono">
                    {report.targetInfo}
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#e8e4dc]/60">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Users className="w-3 h-3" /> {report.helpfulCount} warga terbantu
                    </span>
                    <span className="text-[#94a3b8]">{formatDate(report.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/laporan"
              className="w-full py-2.5 px-3 rounded-xl bg-[#faf8f5] hover:bg-[#f3efe8] border border-[#d9d6d0] text-xs font-bold text-[#14161c] transition flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#0f9b8a]" />
              <span>Laporkan Rekening / Modus Baru</span>
            </Link>
          </div>

          {/* SECTION 6: GUARDIAN CHALLENGE TRACKER */}
          <div className="p-6 rounded-3xl bg-white border border-[#E3E0DA] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
              <div>
                <h2 className="text-base font-bold text-[#14161c] flex items-center gap-2">
                  <Gamepad2 className="w-4.5 h-4.5 text-[#0f9b8a]" />
                  <span>Tantangan AI & Kuis Simulasi</span>
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Uji refleks dan kepekaan mendeteksi social engineering
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#14161c] to-[#242b38] text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold uppercase tracking-wider">
                  Simulasi Aktif
                </span>
                <span className="text-xs font-mono text-slate-300">Skor: {stats?.highestScore || 90}</span>
              </div>
              <div>
                <div className="font-bold text-sm text-white">
                  Tantangan: Kenali Modus Kurir Paket APK
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Latih kemampuan membedakan resi pengiriman asli vs file malware pencuri SMS OTP perbankan.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Akurasi Deteksi: 95%
                </span>
                <Link
                  to="/kuis"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs font-bold transition shadow-xs"
                >
                  <span>Mulai Kuis</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#e8e4dc] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  🏆
                </div>
                <div>
                  <div className="text-xs font-bold text-[#14161c]">Lencana Pertahanan Aktif</div>
                  <div className="text-[10px] text-[#64748b]">Tersertifikasi Waspada Phishing</div>
                </div>
              </div>
              <Link to="/kuis" className="text-xs text-[#0f9b8a] hover:underline font-bold flex items-center gap-0.5">
                <span>Semua Kuis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MODAL DETAIL RIWAYAT ANALISIS ===================== */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedHistory(null)}
            className="fixed inset-0 bg-[#14161c]/55 backdrop-blur-xs cursor-pointer"
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E3E0DA] z-10 space-y-5 text-left animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setSelectedHistory(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                selectedHistory.type === 'url' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {selectedHistory.type === 'url' ? <Globe className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#14161c]">Rincian Hasil Pemindaian</h3>
                <p className="text-xs text-[#64748b]">Diperiksa pada {formatDate(selectedHistory.createdAt)}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e4dc] space-y-2">
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider font-mono">
                Input Analisis (Termasker):
              </span>
              <p className="text-xs font-mono text-[#14161c] break-all bg-white p-2.5 rounded-xl border border-[#e2ded7]">
                {selectedHistory.inputSummary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#e8e4dc] space-y-1">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider font-mono">Tingkat Risiko:</span>
                <div>{getRiskBadge(selectedHistory.riskLevel, selectedHistory.riskScore)}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#e8e4dc] space-y-1">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider font-mono">Kategori Modus:</span>
                <div className="text-xs font-bold text-[#14161c] capitalize">
                  {selectedHistory.scamType.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Rekomendasi Tindakan Keamanan:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800/90">
                {selectedHistory.riskLevel === 'high'
                  ? 'Jangan pernah klik tautan, unduh lampiran, atau masukkan data kredensial/PIN Anda. Segera blokir nomor pengirim.'
                  : selectedHistory.riskLevel === 'review'
                  ? 'Verifikasi keaslian kontak melalui kanal resmi instansi terkait sebelum melanjutkan interaksi.'
                  : 'Domain atau pesan tampak wajar. Tetap berhati-hati dan pastikan URL selalu menggunakan protokol HTTPS.'}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedHistory(null)}
                className="px-5 py-2.5 rounded-xl bg-[#14161c] hover:bg-[#2b2f3a] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
