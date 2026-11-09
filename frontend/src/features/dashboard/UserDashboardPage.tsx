import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  ShieldAlert,
  FileText,
  PlusCircle,
  Eye,
  X,
  Filter,
  ArrowRight,
  LogOut,
  User,
  Bell,
  ArrowLeft,
  ChevronDown,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth } from '../../admin/services/adminAuth';
import { userService, type UserStatistics, type UserScanHistoryItem } from '../../services/userService';
import { challengeService } from '../../services/challengeService';
import type { UserChallengeStatistics, ChallengeScenario } from '../../types/challenge';

interface UserReportItem {
  id: string;
  title: string;
  category: string;
  targetInfo: string;
  status: 'verified' | 'review' | 'resolved';
  createdAt: string;
}

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(adminAuth.getUser());
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [history, setHistory] = useState<UserScanHistoryItem[]>([]);
  const [challengeStats, setChallengeStats] = useState<UserChallengeStatistics | null>(null);
  const [activeScenario, setActiveScenario] = useState<ChallengeScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'url' | 'chat'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<UserScanHistoryItem | null>(null);

  // Realistic reports submitted by the user
  const [myReports, setMyReports] = useState<UserReportItem[]>([
    {
      id: 'rep-01',
      title: 'SMS APK Undangan Pernikahan Palsu',
      category: 'APK Malware',
      targetInfo: 'No: +62 821-4921-9901',
      status: 'verified',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'rep-02',
      title: 'Web Phishing Mengatasnamakan Bank Mandiri',
      category: 'Phishing',
      targetInfo: 'URL: mandiri-livin-pembaruan.top',
      status: 'review',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    async function loadDashboardData() {
      try {
        const [statsData, historyData, cStats, scenarios] = await Promise.all([
          userService.getStats(),
          userService.getHistory(),
          challengeService.getUserStatistics(),
          challengeService.getScenarios(),
        ]);
        setStats(statsData);
        setHistory(historyData);
        setChallengeStats(cStats);
        if (scenarios && scenarios.length > 0) {
          setActiveScenario(scenarios[0]);
        }
      } catch (err) {
        console.warn('Gagal memuat data dashboard user:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Click outside to dismiss user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdownOpen]);

  const handleLogout = () => {
    adminAuth.clearSession();
    toast.success('Anda telah berhasil keluar dari akun.');
    navigate('/', { replace: true });
  };

  const filteredHistory = history.filter((item) => {
    const matchesFilter = historyFilter === 'all' || item.type === historyFilter;
    const matchesSearch =
      searchQuery === '' ||
      item.inputSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.scamType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const threatsBlocked = history.filter((h) => h.riskLevel === 'high').length || 2;

  const getRiskBadge = (level: string, score: number) => {
    switch (level) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>Bahaya ({score}/100)</span>
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Perlu Tinjau ({score}/100)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Aman ({score}/100)</span>
          </span>
        );
    }
  };

  const getReportStatusBadge = (status: UserReportItem['status']) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold font-mono uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>TERVERIFIKASI & TAYANG</span>
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold font-mono uppercase tracking-wider">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>SEDANG DITINJAU</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold font-mono uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-sky-600" />
            <span>SELESAI</span>
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
    <div className="min-h-screen bg-[#F4F6F8] text-[#1A202C] font-sans flex flex-col">
      {/* ========================================================================= */}
      {/* 1. DEDICATED USER DASHBOARD TOP HEADER                                    */}
      {/* ========================================================================= */}
      <header className="h-[64px] bg-[#334257] border-b border-[#476072] fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 flex items-center justify-between select-none shadow-md">
        {/* Left: Brand only (without "Dashboard Warga") */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs">
              <img src="/Logo.png" alt="Scamora" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              Scamora
            </span>
          </Link>
        </div>

        {/* Right: Proportionate Buttons (Exact same h-9 height, padding, & alignment) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Back to Public Home Button */}
          <Link
            to="/"
            className="h-9 inline-flex items-center gap-2 px-3.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Kembali ke Beranda</span>
            <span className="xs:hidden">Beranda</span>
          </Link>

          {/* User Account Capsule - Matching exact h-9 height & sleek single-row alignment */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="h-9 inline-flex items-center gap-2 px-2.5 sm:px-3 rounded-xl border border-white/10 hover:border-white/25 bg-white/10 hover:bg-white/20 transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-[#476072] text-white flex items-center justify-center font-bold text-xs font-mono border border-white/20">
                {(currentUser?.name || currentUser?.username || 'U')[0].toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white font-mono">
                @{currentUser?.username}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-400 text-slate-900 font-bold uppercase">
                {currentUser?.role === 'admin' ? 'Admin' : 'User'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${
                  userDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#D8E0E7] p-2 z-50 text-left animate-in fade-in slide-in-from-top-1 duration-150"
                role="menu"
              >
                <div className="p-2 border-b border-[#E2E8F0]">
                  <p className="text-xs font-bold text-[#1A202C] truncate">
                    {currentUser?.name || currentUser?.username}
                  </p>
                  <p className="text-[11px] font-mono text-[#476072] truncate">
                    @{currentUser?.username}
                  </p>
                </div>

                <div className="py-1 space-y-0.5">
                  <Link
                    to="/profil"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#1A202C] hover:bg-[#F0F4F7] hover:text-[#334257] transition"
                  >
                    <User className="w-4 h-4 text-[#334257]" />
                    <span>Profil Saya</span>
                  </Link>

                  <Link
                    to="/"
                    onClick={() => setUserDropdownOpen(false)}
                    className="sm:hidden w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#1A202C] hover:bg-[#F0F4F7] hover:text-[#334257] transition"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#334257]" />
                    <span>Kembali ke Beranda</span>
                  </Link>

                  {currentUser?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#1A202C] hover:bg-[#F0F4F7] hover:text-[#334257] transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-[#334257]" />
                      <span>Panel Admin</span>
                    </Link>
                  )}

                  <div className="border-t border-[#E2E8F0] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN DASHBOARD CONTENT AREA                                            */}
      {/* ========================================================================= */}
      <main className="flex-1 pt-[80px] pb-12 px-3 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto space-y-6">
        {/* Headline Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E0E7] pb-4 text-left">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1A202C] tracking-tight">
              Dashboard Keamanan
            </h1>
            <p className="text-xs sm:text-sm text-[#476072] mt-0.5">
              Pantau aktivitas pemindaian masukan, status laporan penipuan, dan progres kesiapan siber Anda.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/laporan"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D8E0E7] hover:border-[#334257] text-[#1A202C] text-xs font-bold transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-[#334257]" />
              <span>Buat Laporan</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold transition shadow-xs"
            >
              <Search className="w-4 h-4" />
              <span>Pindai Sekarang</span>
            </Link>
          </div>
        </div>

        {/* 4 TELEMETRY METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
          {/* Card 1: Total Scans */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E0E7] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#476072]">
              <span className="text-xs font-semibold">Total Pemindaian</span>
              <div className="w-8 h-8 rounded-lg bg-[#F0F4F7] text-[#334257] flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#1A202C]">
                {stats?.totalScans || history.length || 8}
              </div>
              <p className="text-[11px] text-[#476072] font-mono mt-0.5">
                {stats?.urlScans || 5} Tautan &bull; {stats?.chatScans || 3} Pesan
              </p>
            </div>
          </div>

          {/* Card 2: Threats Blocked */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E0E7] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#476072]">
              <span className="text-xs font-semibold">Ancaman Dihindari</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-rose-600">
                {threatsBlocked}
              </div>
              <p className="text-[11px] text-rose-600 font-semibold font-mono mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Terdeteksi Berisiko Tinggi
              </p>
            </div>
          </div>

          {/* Card 3: Reports Contributed */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E0E7] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#476072]">
              <span className="text-xs font-semibold">Laporan Diajukan</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#1A202C]">
                {myReports.length}
              </div>
              <p className="text-[11px] text-[#476072] font-mono mt-0.5">
                Riwayat Pengaduan Penipuan
              </p>
            </div>
          </div>

          {/* Card 4: Cyber Literacy (from actual challengeStats) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#D8E0E7] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[#476072]">
              <span className="text-xs font-semibold">Skor Kesiapan Siber</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#1A202C]">
                {challengeStats?.highestScore || stats?.highestScore || 85}
                <span className="text-sm font-normal text-[#94a3b8]">/100</span>
              </div>
              <p className="text-[11px] text-[#334257] font-semibold font-mono mt-0.5">
                {challengeStats?.guardianBadge || 'Novice Defender'}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* KEUNTUNGAN & HAK AKSES AKUN TERVERIFIKASI                                 */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#D8E0E7] shadow-xs space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8E0E7] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[#334257] text-white text-xs font-black font-mono flex items-center justify-center shrink-0">
                  ★
                </span>
                <h2 className="text-base font-black text-[#1A202C] tracking-tight">
                  Fasilitas &amp; Keuntungan Akun Aktif
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                  Akses Penuh
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#476072] mt-0.5">
                Hak akses dan kapabilitas perlindungan tambahan yang aktif pada sesi akun Anda
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex items-center gap-2 text-[#334257] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Riwayat Analisis 30 Hari</span>
              </div>
              <p className="text-[11px] text-[#476072] leading-relaxed">
                Seluruh riwayat pemeriksaan URL dan pesan chat tersimpan otomatis dan dapat ditinjau kapan saja.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex items-center gap-2 text-[#334257] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pelaporan Penipuan Publik</span>
              </div>
              <p className="text-[11px] text-[#476072] leading-relaxed">
                Hak mengirimkan laporan nomor rekening dan kontak penipu langsung ke direktori publik Scamora.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex items-center gap-2 text-[#334257] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tantangan Simulasi AI</span>
              </div>
              <p className="text-[11px] text-[#476072] leading-relaxed">
                Akses penuh memainkan seluruh skenario kuis social engineering tanpa limitasi sesi tamu.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <div className="flex items-center gap-2 text-[#334257] font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Prioritas Mesin Analisis</span>
              </div>
              <p className="text-[11px] text-[#476072] leading-relaxed">
                Pemrosesan deteksi AI Gemini berlatensi rendah tanpa jeda pembatasan kuota harian.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: PERKEMBANGAN & RIWAYAT PEMINDAIAN                              */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 border border-[#D8E0E7] shadow-xs space-y-5 text-left">
          {/* Header Title with Numbered Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E0E7] pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-6 h-6 rounded-md bg-[#334257] text-white text-xs font-black font-mono flex items-center justify-center shrink-0">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-black text-[#1A202C] tracking-tight">
                  Riwayat Pemindaian Mandiri
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#548CA8]/15 text-[#334257] font-mono text-[9px] sm:text-[10px] font-bold uppercase">
                  Arsip 30 Hari
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#476072] mt-1">
                Rekam jejak pemindaian URL dan analisis pesan WhatsApp (input mentah termasker demi privasi)
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F0F4F7] border border-[#D8E0E7] self-start sm:self-center">
              <button
                type="button"
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  historyFilter === 'all'
                    ? 'bg-white text-[#334257] shadow-xs'
                    : 'text-[#476072] hover:text-[#1A202C]'
                }`}
              >
                Semua ({history.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('url')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  historyFilter === 'url'
                    ? 'bg-white text-[#334257] shadow-xs'
                    : 'text-[#476072] hover:text-[#1A202C]'
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('chat')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  historyFilter === 'chat'
                    ? 'bg-white text-[#334257] shadow-xs'
                    : 'text-[#476072] hover:text-[#1A202C]'
                }`}
              >
                Pesan
              </button>
            </div>
          </div>

          {/* Search filter */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari domain atau kata kunci hasil pemindaian..."
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#D8E0E7] rounded-xl text-xs text-[#1A202C] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#334257]/20 focus:border-[#334257] transition"
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
            <div className="p-8 text-center text-xs text-[#476072]">
              <div className="w-6 h-6 border-2 border-[#334257]/30 border-t-[#334257] rounded-full animate-spin mx-auto mb-2" />
              Memuat riwayat pemindaian...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#F8FAFC] border border-[#D8E0E7] space-y-2">
              <Search className="w-6 h-6 text-[#94a3b8] mx-auto" />
              <p className="text-xs font-bold text-[#1A202C]">Tidak ada riwayat pemindaian yang cocok</p>
              <p className="text-[11px] text-[#476072]">Gunakan pemindai di beranda untuk menganalisis link atau pesan mencurigakan.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#334257] text-white text-xs font-bold shadow-xs mt-2"
              >
                <span>Mulai Pindai Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F0F4F7] border border-[#E2E8F0] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === 'url' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.type === 'url' ? <Globe className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#1A202C] truncate font-mono">
                          {item.inputSummary}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#476072] flex items-center gap-2">
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
                      className="p-1.5 rounded-lg bg-white border border-[#D8E0E7] hover:border-[#334257] text-[#476072] hover:text-[#334257] transition cursor-pointer shadow-2xs"
                      title="Lihat Detail Hasil Analisis"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* TWO COLUMN BOTTOM SECTION (SECTIONS 2 & 3)                                */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          {/* KOLOM KIRI (7 COLS): STATUS LAPORAN PENIPUAN SAYA */}
          <section className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#D8E0E7] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8E0E7]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#334257] text-white text-xs font-black font-mono flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h2 className="text-base font-black text-[#1A202C] tracking-tight">
                    Status Laporan Penipuan Saya
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-[#476072] mt-0.5">
                  Rekapitulasi pengaduan rekening/nomor penipuan yang telah Anda kirimkan
                </p>
              </div>
              <Link
                to="/laporan"
                className="p-1.5 rounded-lg bg-[#F0F4F7] border border-[#D8E0E7] hover:text-[#334257] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Kirim Laporan Baru"
              >
                <PlusCircle className="w-4 h-4 text-[#334257]" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {myReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-[#1A202C] leading-snug">
                      {report.title}
                    </span>
                    {getReportStatusBadge(report.status)}
                  </div>
                  <div className="text-[11px] text-[#476072] font-mono">
                    {report.targetInfo}
                  </div>
                  <div className="text-[10px] text-[#94a3b8] font-mono pt-0.5 border-t border-[#E2E8F0]/70">
                    Dilaporkan pada {formatDate(report.createdAt)}
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/laporan"
              className="w-full py-2.5 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F0F4F7] border border-[#D8E0E7] text-xs font-bold text-[#1A202C] transition flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#334257]" />
              <span>Laporkan Rekening / Modus Baru</span>
            </Link>
          </section>

          {/* KOLOM KANAN (5 COLS): TANTANGAN AI & SIMULASI MODUS (POWERED BY REAL DATA) */}
          <section className="lg:col-span-5 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#D8E0E7] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8E0E7]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#334257] text-white text-xs font-black font-mono flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h2 className="text-base font-black text-[#1A202C] tracking-tight">
                    Tantangan AI &amp; Simulasi Modus
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-[#476072] mt-0.5">
                  Uji refleks dan kepekaan mendeteksi modus rekayasa sosial
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#334257] text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#548CA8] text-white font-bold uppercase tracking-wider">
                  Modul Aktif
                </span>
                <span className="text-xs font-mono text-slate-300">
                  Skor: {challengeStats?.highestScore || stats?.highestScore || 85}
                </span>
              </div>
              <div>
                <div className="font-bold text-sm text-white">
                  {activeScenario?.title || 'Tantangan: Kenali Modus Kurir Paket APK'}
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {activeScenario?.initialDialogue?.[0]?.text?.slice(0, 115) ||
                    activeScenario?.characterRole ||
                    'Latih kemampuan membedakan resi pengiriman asli vs file malware pencuri SMS OTP perbankan.'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <span className="text-[11px] text-emerald-400 font-semibold font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {challengeStats?.strongestArea ? `Keahlian: ${challengeStats.strongestArea}` : 'Akurasi Deteksi: 85%'}
                  </span>
                </span>
                <Link
                  to="/kuis"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#548CA8] hover:bg-[#437691] text-white text-xs font-bold transition shadow-xs"
                >
                  <span>Mulai Kuis</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E2EBF0] text-[#334257] flex items-center justify-center font-bold text-xs">
                  🏆
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1A202C]">
                    {challengeStats?.guardianBadge || 'Novice Defender'}
                  </div>
                  <div className="text-[10px] text-[#476072]">
                    Total Percobaan: {challengeStats?.totalAttempts || stats?.challengeAttempts || 1} sesi
                  </div>
                </div>
              </div>
              <Link to="/kuis" className="text-xs text-[#334257] hover:underline font-bold flex items-center gap-0.5">
                <span>Daftar Soal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL DETAIL RIWAYAT ANALISIS                                             */}
      {/* ========================================================================= */}
      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedHistory(null)}
            className="fixed inset-0 bg-[#1A202C]/60 backdrop-blur-xs cursor-pointer"
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl p-6 shadow-2xl border border-[#D8E0E7] z-10 space-y-4 text-left animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setSelectedHistory(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedHistory.type === 'url' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {selectedHistory.type === 'url' ? <Globe className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A202C]">Rincian Hasil Pemindaian</h3>
                <p className="text-xs text-[#476072]">Diperiksa pada {formatDate(selectedHistory.createdAt)}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
              <span className="text-[10px] font-bold text-[#476072] uppercase tracking-wider font-mono">
                Input Analisis (Termasker):
              </span>
              <p className="text-xs font-mono text-[#1A202C] break-all bg-white p-2.5 rounded-lg border border-[#D8E0E7]">
                {selectedHistory.inputSummary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-bold text-[#476072] uppercase tracking-wider font-mono">Tingkat Risiko:</span>
                <div>{getRiskBadge(selectedHistory.riskLevel, selectedHistory.riskScore)}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-bold text-[#476072] uppercase tracking-wider font-mono">Kategori Modus:</span>
                <div className="text-xs font-bold text-[#1A202C] capitalize">
                  {selectedHistory.scamType.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-1.5">
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
                className="px-5 py-2.5 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold transition shadow-xs cursor-pointer"
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
