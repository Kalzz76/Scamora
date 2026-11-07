import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { SystemStats } from '../../types/admin';
import { ScanTimelineChart } from './components/ScanTimelineChart';
import { RiskDonutChart } from './components/RiskDonutChart';
import { AiConditionCard } from './components/AiConditionCard';
import { TopScamsCard } from './components/TopScamsCard';
import { VisitorsCard } from './components/VisitorsCard';
import { Activity, ShieldCheck, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await adminService.getStats();
    setStats(data);
    setLoading(false);
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await adminService.getStats();
      setStats(data);
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
    <div className="p-6 sm:p-8 space-y-8 w-full">
      {/* ========================================================================= */}
      {/* 1. HEADLINE UTAMA: PERKEMBANGAN SCAN (FROSTED GLASS PANEL)                 */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Headline Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#D8E0E7] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-[#334257] text-white text-xs font-black font-mono flex items-center justify-center">
                1
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#1A202C] tracking-tight">
                Perkembangan Scan (24 Jam Terakhir)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#548CA8]/15 text-[#334257] font-mono text-[10px] font-bold uppercase">
                Headline Utama
              </span>
            </div>
            <p className="text-xs text-[#476072] mt-1">
              Aktivitas pemindaian masukan URL &amp; Chat per jam serta klasifikasi tingkat risiko ancaman
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#476072]">
            <Activity className="w-4 h-4 text-[#548CA8]" />
            <span>Interval Waktu: 24 Jam</span>
          </div>
        </div>

        {/* Grid: 24h Scan Timeline Chart (Left/Top) + Donut Chart (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Timeline Area & Numerics (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A202C]">
                Grafik Frekuensi Pemindaian per Jam
              </h3>
              <span className="text-[11px] text-[#476072]">Hover batang untuk data numerik</span>
            </div>

            <ScanTimelineChart
              data={hourlyScans}
              totalScans={stats.totalScans}
              urlScans={stats.urlScans}
              chatScans={stats.chatScans}
            />
          </div>

          {/* Donut Chart: Indikasi Bahaya / Tinjau / Aman (4 Cols - Unboxed with Left Border) */}
          <div className="lg:col-span-4 space-y-4 lg:pl-8 lg:border-l lg:border-[#D8E0E7]">
            <div className="border-b border-[#D8E0E7] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A202C]">
                Proporsi Indikasi Risiko (Donut Chart)
              </h3>
              <p className="text-[11px] text-[#476072]">
                Arahkan mouse ke irisan donat untuk melihat data numerik spesifik
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
      <section className="glass-panel rounded-3xl p-6 sm:p-8">
        <AiConditionCard
          telemetry={stats.aiTelemetry}
          modelName="gemini-3.5-flash-lite"
          provider="gemini"
        />
      </section>

      {/* ========================================================================= */}
      {/* 3 & 4. TOP PENIPUAN & JUMLAH PENGUNJUNG (FROSTED GLASS PANEL)              */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start glass-panel rounded-3xl p-6 sm:p-8">
        {/* Poin 3: Top Penipuan (Top 5) */}
        <div>
          <TopScamsCard scamTypeBreakdown={stats.scamTypeBreakdown} />
        </div>

        {/* Poin 4: Jumlah Pengunjung Website 24 Jam */}
        <div className="lg:pl-8 lg:border-l lg:border-[#D8E0E7]">
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
