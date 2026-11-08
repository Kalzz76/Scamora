import React, { useState } from 'react';
import {
  ShieldAlert,
  Globe,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminStore } from '../services/adminStore';
import { StatCard } from './StatCard';

export const AdminDashboard: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const [stats, setStats] = useState(() => adminStore.getStats());
  const [reports] = useState(() => adminStore.getReports());
  const [posts] = useState(() => adminStore.getPosts());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;
  const underReviewPostsCount = posts.filter((p) => p.status === 'under_review').length;

  const totalScans = stats.length;
  const highRiskScans = stats.filter((s) => s.risk_level === 'high').length;
  const reviewScans = stats.filter((s) => s.risk_level === 'review').length;
  const lowRiskScans = stats.filter((s) => s.risk_level === 'low').length;

  const urlScans = stats.filter((s) => s.analysis_type === 'url').length;
  const chatScans = stats.filter((s) => s.analysis_type === 'chat').length;

  const avgScore = totalScans > 0
    ? Math.round(stats.reduce((acc, curr) => acc + curr.risk_score, 0) / totalScans)
    : 0;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setStats(adminStore.getStats());
      setIsRefreshing(false);
      toast.success('Telemetri analitik diperbarui');
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Status & Quick Refresh */}
      <div className="bg-gradient-to-r from-[#143826] to-[#1D4E36] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold mb-3 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistem Operasional &bull; Zero-Retention Enforced</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pusat Komando Intelijen Keamanan
          </h2>
          <p className="mt-1 text-sm text-emerald-100/80 max-w-2xl font-normal">
            Memantau telemetri pemindaian ancaman siber, sebaran modus penipuan, moderasi komunitas, dan status engine AI.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 backdrop-blur-xs border border-white/15"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan Data</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('moderation')}
            className="px-4 py-2.5 rounded-xl bg-[#E86A33] hover:bg-[#D75922] active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-orange-950/20"
          >
            <span>Antrean Moderasi ({pendingReportsCount + underReviewPostsCount})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Pemindaian"
          value={totalScans.toLocaleString()}
          subtitle="Agregat pemindaian anonim"
          change="+14.2% minggu ini"
          changeType="positive"
          icon={Activity}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
        />

        <StatCard
          title="Indikasi Risiko Tinggi"
          value={highRiskScans.toLocaleString()}
          subtitle={`${Math.round((highRiskScans / (totalScans || 1)) * 100)}% dari total deteksi`}
          change="Prioritas Tinggi"
          changeType="negative"
          icon={ShieldAlert}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />

        <StatCard
          title="Rata-rata Skor Ancaman"
          value={`${avgScore}/100`}
          subtitle="Tingkat keparahan rata-rata"
          change="Normal Terkendali"
          changeType="neutral"
          icon={TrendingUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />

        <StatCard
          title="Laporan Menunggu Tindakan"
          value={pendingReportsCount}
          subtitle={`${underReviewPostsCount} postingan butuh kurasi`}
          change={pendingReportsCount > 0 ? 'Perlu Tinjauan' : 'Bersih'}
          changeType={pendingReportsCount > 0 ? 'negative' : 'positive'}
          icon={AlertTriangle}
          iconBg="bg-[#FDF0E9]"
          iconColor="text-[#E86A33]"
        />
      </div>

      {/* Visual Analytics Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Level Distribution (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Sebaran Kategori Risiko
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Klasifikasi hasil analisis URL dan teks percakapan
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
              {totalScans} Sampel
            </span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="space-y-4">
            <div className="h-4 w-full rounded-full bg-gray-100 flex overflow-hidden">
              <div
                style={{ width: `${(highRiskScans / (totalScans || 1)) * 100}%` }}
                className="bg-[#DC2626] transition-all duration-500"
                title={`Risiko Tinggi: ${highRiskScans}`}
              />
              <div
                style={{ width: `${(reviewScans / (totalScans || 1)) * 100}%` }}
                className="bg-[#E86A33] transition-all duration-500"
                title={`Perlu Ditinjau: ${reviewScans}`}
              />
              <div
                style={{ width: `${(lowRiskScans / (totalScans || 1)) * 100}%` }}
                className="bg-[#143826] transition-all duration-500"
                title={`Risiko Rendah: ${lowRiskScans}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                  <span className="text-xs font-bold text-rose-900">Risiko Tinggi</span>
                </div>
                <div className="mt-2 text-xl font-extrabold text-rose-700">
                  {highRiskScans} <span className="text-xs font-semibold text-rose-500">({Math.round((highRiskScans / (totalScans || 1)) * 100)}%)</span>
                </div>
                <p className="text-[11px] text-rose-600 mt-1 font-medium">Banyak tanda bahaya manipulatif / phishing</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FDF0E9]/60 border border-[#E86A33]/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E86A33]" />
                  <span className="text-xs font-bold text-[#B44616]">Perlu Ditinjau</span>
                </div>
                <div className="mt-2 text-xl font-extrabold text-[#B44616]">
                  {reviewScans} <span className="text-xs font-semibold text-orange-500">({Math.round((reviewScans / (totalScans || 1)) * 100)}%)</span>
                </div>
                <p className="text-[11px] text-orange-700 mt-1 font-medium">Indikasi anomali membutuhkan verifikasi</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EAF2ED]/60 border border-[#143826]/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#143826]" />
                  <span className="text-xs font-bold text-[#143826]">Risiko Rendah</span>
                </div>
                <div className="mt-2 text-xl font-extrabold text-[#143826]">
                  {lowRiskScans} <span className="text-xs font-semibold text-emerald-700">({Math.round((lowRiskScans / (totalScans || 1)) * 100)}%)</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1 font-medium">Domain resmi &amp; chat keluarga normal</p>
              </div>
            </div>
          </div>

          {/* Sub-ratio URL vs Chat */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Distribusi Kanal Input
            </span>
            <div className="flex items-center gap-6 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-gray-700">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Pemeriksa URL: {urlScans} ({Math.round((urlScans / (totalScans || 1)) * 100)}%)</span>
              </span>
              <span className="flex items-center gap-1.5 text-gray-700">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Analisis Chat: {chatScans} ({Math.round((chatScans / (totalScans || 1)) * 100)}%)</span>
              </span>
            </div>
          </div>
        </div>

        {/* AI & Infrastructure Health Status (1 col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Status Mesin &amp; AI
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-xs text-gray-400 font-medium mb-5">
              Infrastruktur multi-layer detection pipeline
            </p>

            <div className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-900">Google Gemini 2.5</span>
                    <span className="text-[10px] text-gray-400">Semantic Chat Reasoner</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  Online
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-900">Heuristic Crawler</span>
                    <span className="text-[10px] text-gray-400">Typosquatting &amp; DOM Scan</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  Aktif (18ms)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#143826] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-gray-900">Zero-Retention Guard</span>
                    <span className="text-[10px] text-gray-400">Automatic PII Masker</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                  100% Lolos
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onNavigateTab('settings')}
              className="w-full py-2.5 rounded-xl bg-[#EAF2ED] hover:bg-[#DDE8E2] text-[#143826] text-xs font-bold transition text-center"
            >
              Ubah Parameter Engine AI
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Threat Intelligence Feed */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Aktivitas Telemetri Analisis Terbaru
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Data anonim tanpa PII sesuai kepatuhan Zero-Retention Policy
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('presets')}
            className="text-xs font-bold text-[#E86A33] hover:underline"
          >
            Kelola Contoh Skenario &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">Tipe Kanal</th>
                <th className="py-3 px-4">Ringkasan Masukan (Termasker)</th>
                <th className="py-3 px-4">Klasifikasi Modus</th>
                <th className="py-3 px-4">Skor Risiko</th>
                <th className="py-3 px-4">Indikator</th>
                <th className="py-3 px-4">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {stats.slice(0, 6).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition">
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold ${
                        item.analysis_type === 'url'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {item.analysis_type === 'url' ? (
                        <>
                          <Globe className="w-3 h-3" />
                          <span>URL</span>
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat WA</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-gray-600 max-w-xs truncate">
                    {item.target_summary}
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-800 capitalize">
                    {item.scam_type.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        item.risk_level === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : item.risk_level === 'review'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.risk_score} / 100
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 font-medium">
                    {item.indicators_count} red flags
                  </td>
                  <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
