import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import type { SystemStats, UserStats } from '../../types/admin';
import { ScanTimelineChart } from './components/ScanTimelineChart';
import { RiskDonutChart } from './components/RiskDonutChart';
import { AiConditionCard } from './components/AiConditionCard';
import { TopScamsCard } from './components/TopScamsCard';
import { VisitorsCard } from './components/VisitorsCard';
import { Activity, ShieldCheck, RefreshCw, Users, Globe, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    guestUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sysStats, uRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
      ]);
      setStats(sysStats);
      setUserStats(uRes.stats);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const [sysStats, uRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
      ]);
      setStats(sysStats);
      setUserStats(uRes.stats);
      toast.success('Data telemetri berhasil diperbarui!');
    } catch {
      toast.error('Gagal memperbarui telemetri.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#334257] border-t-transparent animate-spin"></div>
          <span className="text-xs font-mono text-[#476072]">Memuat telemetri command center...</span>
        </div>
      </div>
    );
  }

  const riskDist = stats.riskDistribution || { high: 43.3, review: 33.0, low: 23.7 };
  const hourlyScans = stats.hourlyScans24h || [];

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-8 w-full max-w-7xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. HEADLINE UTAMA: PERKEMBANGAN SCAN (FROSTED GLASS PANEL)                 */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
        {/* Headline Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#D8E0E7] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-6 h-6 rounded-md bg-[#334257] text-white text-xs font-black font-mono flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="text-base sm:text-xl font-black text-[#1A202C] tracking-tight">
                Perkembangan Scan (24 Jam Terakhir)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#548CA8]/15 text-[#334257] font-mono text-[9px] sm:text-[10px] font-bold uppercase">
                Headline Utama
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#476072] mt-1">
              Aktivitas pemindaian masukan URL &amp; Chat per jam serta klasifikasi tingkat risiko ancaman
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono font-bold text-[#476072] self-start md:self-center">
            <Activity className="w-4 h-4 text-[#548CA8]" />
            <span>Interval Waktu: 24 Jam</span>
          </div>
        </div>

        {/* Grid: 24h Scan Timeline Chart (Left/Top) + Donut Chart (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Timeline Area & Numerics (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A202C]">
                Grafik Frekuensi Pemindaian per Jam
              </h3>
              <span className="text-[10px] sm:text-[11px] text-[#476072]">Ketuk batang untuk rincian</span>
            </div>

            <ScanTimelineChart
              data={hourlyScans}
              totalScans={stats.totalScans}
              urlScans={stats.urlScans}
              chatScans={stats.chatScans}
            />
          </div>

          {/* Donut Chart: Indikasi Bahaya / Tinjau / Aman (4 Cols - Stacked on Mobile) */}
          <div className="lg:col-span-4 space-y-4 pt-6 lg:pt-0 border-t lg:border-t-0 lg:pl-8 lg:border-l border-[#D8E0E7]">
            <div className="border-b border-[#D8E0E7] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A202C]">
                Proporsi Indikasi Risiko (Donut Chart)
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#476072]">
                Ketuk irisan donat untuk melihat data numerik spesifik
              </p>
            </div>

            <RiskDonutChart
              highCount={stats.highRiskCount}
              highPercent={riskDist.high}
              reviewCount={stats.reviewCount}
              reviewPercent={riskDist.review}
              lowCount={stats.lowRiskCount}
              lowPercent={riskDist.low}
              totalScans={stats.totalScans}
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. KONDISI AI (FROSTED GLASS PANEL)                                       */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
        <AiConditionCard
          telemetry={stats.aiTelemetry}
          modelName="gemini-3.5-flash-lite"
          provider="gemini"
        />
      </section>

      {/* ========================================================================= */}
      {/* USER MANAGEMENT & TIER OVERVIEW (GUEST & VERIFIED)                        */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E0E7] dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#334257] text-white text-xs font-black font-mono flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1A202C] dark:text-white tracking-tight">
                Kontrol Pengguna (2 Tingkatan Akses)
              </h2>
              <p className="text-[11px] text-[#476072] dark:text-slate-400 mt-0.5">
                Pengguna Tamu (Guest tanpa login) &amp; Pengguna Terverifikasi (Verified via registrasi)
              </p>
            </div>
          </div>
          <Link
            to="/admin/users"
            className="px-3.5 py-1.5 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <span>Buka Manajemen Pengguna</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#548CA8]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-850 border border-[#D8E0E7] dark:border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-[#548CA8]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#5E6D7E] dark:text-slate-400 uppercase font-bold">Total Pengguna</div>
              <div className="text-xl font-black text-[#1A202C] dark:text-white">{userStats.totalUsers} Pengguna</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 uppercase font-bold">Terverifikasi (Verified)</div>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">{userStats.verifiedUsers} Akun Aktif</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-sky-800 dark:text-sky-400 uppercase font-bold">Tamu (Guest)</div>
              <div className="text-xl font-black text-sky-700 dark:text-sky-400">{userStats.guestUsers} Pengunjung</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3 & 4. TOP PENIPUAN & JUMLAH PENGUNJUNG (FROSTED GLASS PANEL)              */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
        {/* Poin 3: Top Penipuan (Top 5) */}
        <div>
          <TopScamsCard scamTypeBreakdown={stats.scamTypeBreakdown} />
        </div>

        {/* Poin 4: Jumlah Pengunjung Website 24 Jam */}
        <div className="pt-6 lg:pt-0 border-t lg:border-t-0 lg:pl-8 lg:border-l border-[#D8E0E7]">
          <VisitorsCard stats={stats.visitorStats} />
        </div>
      </section>

      {/* Bottom Privacy & Compliance Note */}
      <div className="glass-panel-subtle rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#476072]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Scamora Zero-Retention Protocol: Semua telemetri dihitung secara agregat tanpa menyimpan isi chat asli atau data sensitif pengguna.
          </span>
        </div>
        <span className="font-mono text-[11px] font-bold text-[#334257] shrink-0">
          Scamora v1.0 Production
        </span>
      </div>

      {/* Floating Refresh Button in Bottom-Right (Fixed Top Layer - z-50) */}
      <button
        type="button"
        onClick={handleManualRefresh}
        disabled={refreshing}
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 bg-[#334257] hover:bg-[#476072] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl border border-[#476072] flex items-center gap-2.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60 group backdrop-blur-xs ring-4 ring-black/5"
        title="Segarkan Data Real-time"
      >
        <RefreshCw
          className={`w-4 h-4 text-[#548CA8] group-hover:text-white transition-colors ${
            refreshing ? 'animate-spin text-white' : ''
          }`}
        />
        <span className="text-xs font-bold font-mono tracking-tight hidden sm:inline">
          {refreshing ? 'Memperbarui...' : 'Segarkan Data'}
        </span>
      </button>
    </div>
  );
};
