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
    <div className="p-2 sm:p-4 lg:p-6 space-y-3.5 sm:space-y-5 w-full max-w-6xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. HEADLINE UTAMA: PERKEMBANGAN SCAN (FROSTED GLASS PANEL)                 */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 space-y-3.5 sm:space-y-4">
        {/* Headline Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-[#D8E0E7] pb-3">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="w-5 h-5 rounded-md bg-[#334257] text-white text-[11px] font-black font-mono flex items-center justify-center shrink-0">
                1
              </span>
              <h2 className="text-sm sm:text-base font-black text-[#1A202C] tracking-tight">
                Perkembangan Scan (24 Jam Terakhir)
              </h2>
              <span className="px-1.5 py-0.2 rounded-full bg-[#548CA8]/15 text-[#334257] font-mono text-[9px] font-bold uppercase">
                Headline Utama
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#476072] mt-0.5">
              Aktivitas pemindaian masukan URL &amp; Chat per jam serta klasifikasi tingkat risiko ancaman
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold text-[#476072] self-start md:self-center">
            <Activity className="w-3.5 h-3.5 text-[#548CA8]" />
            <span>Interval Waktu: 24 Jam</span>
          </div>
        </div>

        {/* Grid: 24h Scan Timeline Chart (Left/Top) + Donut Chart (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Timeline Area & Numerics (8 Cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#1A202C]">
                Grafik Frekuensi Pemindaian per Jam
              </h3>
              <span className="text-[10px] text-[#476072]">Ketuk batang untuk rincian</span>
            </div>

            <ScanTimelineChart
              data={hourlyScans}
              totalScans={stats.totalScans}
              urlScans={stats.urlScans}
              chatScans={stats.chatScans}
            />
          </div>

          {/* Donut Chart: Indikasi Bahaya / Tinjau / Aman (4 Cols - Stacked on Mobile) */}
          <div className="lg:col-span-4 space-y-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:pl-6 lg:border-l border-[#D8E0E7]">
            <div className="border-b border-[#D8E0E7] pb-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#1A202C]">
                Proporsi Indikasi Risiko (Donut Chart)
              </h3>
              <p className="text-[10px] text-[#476072]">
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
      <section className="glass-panel rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5">
        <AiConditionCard
          telemetry={stats.aiTelemetry}
          modelName="gemini-3.5-flash-lite"
          provider="gemini"
        />
      </section>

      {/* ========================================================================= */}
      {/* USER MANAGEMENT OVERVIEW (VERIFIED DATABASE USERS)                        */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#D8E0E7] dark:border-slate-700 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#334257] text-white text-[11px] font-black font-mono flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#1A202C] dark:text-white tracking-tight">
                Kontrol Pengguna Terdaftar (Verified Database)
              </h2>
              <p className="text-[10px] text-[#476072] dark:text-slate-400 mt-0.5">
                Pengguna yang terdaftar dan terverifikasi secara resmi di basis data platform
              </p>
            </div>
          </div>
          <Link
            to="/admin/users"
            className="px-3 py-1 rounded-lg bg-[#334257] hover:bg-[#242F3E] text-white text-[11px] font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <span>Buka Manajemen Pengguna</span>
            <ArrowRight className="w-3 h-3 text-[#548CA8]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-850 border border-[#D8E0E7] dark:border-slate-700 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
              <Users className="w-4 h-4 text-[#548CA8]" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-[#5E6D7E] dark:text-slate-400 uppercase font-bold">Total Pengguna Terdaftar</div>
              <div className="text-base font-black text-[#1A202C] dark:text-white">{userStats.totalUsers} Akun</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-emerald-800 dark:text-emerald-400 uppercase font-bold">Akun Aktif</div>
              <div className="text-base font-black text-emerald-700 dark:text-emerald-400">{userStats.activeUsers} Akun Aktif</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-amber-800 dark:text-amber-400 uppercase font-bold">Akun Ditangguhkan</div>
              <div className="text-base font-black text-amber-700 dark:text-amber-400">
                {Math.max(0, userStats.totalUsers - userStats.activeUsers)} Ditangguhkan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3 & 4. TOP PENIPUAN & JUMLAH PENGUNJUNG (FROSTED GLASS PANEL)              */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start glass-panel rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5">
        {/* Poin 3: Top Penipuan (Top 5) */}
        <div>
          <TopScamsCard scamTypeBreakdown={stats.scamTypeBreakdown} />
        </div>

        {/* Poin 4: Jumlah Pengunjung Website 24 Jam */}
        <div className="pt-4 lg:pt-0 border-t lg:border-t-0 lg:pl-6 lg:border-l border-[#D8E0E7]">
          <VisitorsCard stats={stats.visitorStats} />
        </div>
      </section>

      {/* Bottom Privacy & Compliance Note */}
      <div className="glass-panel-subtle rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#476072]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Scamora Zero-Retention Protocol: Semua telemetri dihitung secara agregat tanpa menyimpan isi chat asli atau data sensitif pengguna.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold text-[#334257] shrink-0">
          Scamora v1.0 Production
        </span>
      </div>

      {/* Floating Refresh Button in Bottom-Right (Fixed Top Layer - z-50) */}
      <button
        type="button"
        onClick={handleManualRefresh}
        disabled={refreshing}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-[#334257] hover:bg-[#476072] text-white p-2.5 sm:px-3 sm:py-2 rounded-full shadow-xl border border-[#476072] flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60 group backdrop-blur-xs ring-2 ring-black/5"
        title="Segarkan Data Real-time"
      >
        <RefreshCw
          className={`w-3.5 h-3.5 text-[#548CA8] group-hover:text-white transition-colors ${
            refreshing ? 'animate-spin text-white' : ''
          }`}
        />
        <span className="text-[11px] font-bold font-mono tracking-tight hidden sm:inline">
          {refreshing ? 'Memperbarui...' : 'Segarkan Data'}
        </span>
      </button>
    </div>
  );
};
