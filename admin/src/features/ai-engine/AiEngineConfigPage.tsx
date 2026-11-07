import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Globe,
  Sliders,
  ShieldCheck,
  Save,
  ChevronDown,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { AiConfig, CrawlerConfig, RiskThresholds, SystemStats } from '../../types/admin';
import { AiConditionSection } from './components/AiConditionSection';
import { toast } from 'sonner';

export const AiEngineConfigPage: React.FC = () => {
  const [aiConfig, setAiConfig] = useState<AiConfig | null>(null);
  const [crawlerConfig, setCrawlerConfig] = useState<CrawlerConfig | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [thresholds, setThresholds] = useState<RiskThresholds>({ highMin: 60, reviewMin: 30 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [ai, crawler, sysStats] = await Promise.all([
      adminService.getAiConfig(),
      adminService.getCrawlerConfig(),
      adminService.getStats(),
    ]);
    setAiConfig(ai);
    setCrawlerConfig(crawler);
    setStats(sysStats);
    setLoading(false);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiConfig || !crawlerConfig) return;

    setSaving(true);
    try {
      await Promise.all([
        adminService.updateAiConfig(aiConfig),
        adminService.updateCrawlerConfig(crawlerConfig),
      ]);
      toast.success('Konfigurasi Pengaturan Lanjutan berhasil disimpan!');
    } catch {
      toast.error('Gagal menyimpan perubahan konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !aiConfig || !crawlerConfig) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#334257] border-t-transparent animate-spin"></div>
          <span className="text-xs font-mono text-[#476072]">Memuat konfigurasi engine &amp; crawler...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-10 w-full">
      {/* ========================================================================= */}
      {/* 1. KONDISI AI SAAT INI (GRAFIK PENGGUNAAN TOKEN & TEMPAT UJI KONEKSI)      */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8">
        <AiConditionSection
          aiConfig={aiConfig}
          hourlyTokens={stats?.aiTelemetry?.hourlyTokens24h}
          totalTokens24h={stats?.aiTelemetry?.tokensUsed24h}
          promptTokens24h={stats?.aiTelemetry?.promptTokens24h}
          completionTokens24h={stats?.aiTelemetry?.completionTokens24h}
        />
      </section>

      {/* ========================================================================= */}
      {/* 2. SETTING LANJUTAN (COLLAPSIBLE / ACCORDION DENGAN KLIK BUKA TUTUP)      */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Clickable Header Accordion Trigger */}
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E0E7] pb-4 text-left cursor-pointer group hover:bg-[#EEEEEE]/30 -mx-2 px-2 py-2 rounded-xl transition-colors"
        >
          <div className="flex items-start sm:items-center gap-3">
            <span className="w-6 h-6 rounded-md bg-[#334257] text-white text-xs font-black font-mono flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              2
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-[#1A202C] tracking-tight group-hover:text-[#548CA8] transition-colors">
                  Setting Lanjutan AI Engine &amp; Web Crawler
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#548CA8]/15 text-[#334257] font-mono text-[10px] font-bold uppercase">
                  {isAdvancedOpen ? 'Terbuka' : 'Tertutup'}
                </span>
              </div>
              <p className="text-xs text-[#476072] mt-0.5">
                {isAdvancedOpen
                  ? 'Klik untuk menutup kembali panel pengaturan lanjutan ini.'
                  : 'Klik untuk membuka & mengubah model penalaran, temperatur, crawler sandbox, dan ambang batas risiko.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <span className="text-xs font-bold text-[#548CA8] font-mono hidden sm:inline">
              {isAdvancedOpen ? 'Tutup Pengaturan' : 'Buka Pengaturan'}
            </span>
            <div
              className={`w-8 h-8 rounded-xl border border-[#D8E0E7] bg-white flex items-center justify-center text-[#334257] transition-transform duration-200 ${
                isAdvancedOpen ? 'rotate-180 bg-[#548CA8]/15 border-[#548CA8]' : ''
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Collapsible Content Area */}
        {isAdvancedOpen && (
          <form onSubmit={handleSaveAll} className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Top Save Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8E0E7]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#548CA8]/15 text-[#334257] flex items-center justify-center">
                  <Sliders className="w-5 h-5 text-[#334257]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1A202C]">Konfigurasi Runtime Lanjutan</h3>
                  <p className="text-[11px] text-[#476072]">Perubahan akan langsung diterapkan ke pipeline tanpa restart server.</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan Lanjutan'}</span>
              </button>
            </div>

            {/* SUB-SECTION A: AI MODEL & PROVIDER CONFIG (Vertically Stacked) */}
            <div className="space-y-6 pb-8 border-b border-[#D8E0E7]">
              <div className="flex items-center justify-between border-b border-[#D8E0E7] pb-4">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-5 h-5 text-[#334257]" />
                  <h3 className="text-base font-bold text-[#1A202C]">Model &amp; Provider AI Semantik</h3>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#548CA8]/15 text-[#334257] font-bold border border-[#548CA8]/30">
                  Provider Aktif: {aiConfig.activeProvider.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col space-y-5">
                {/* 1. Active Provider Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C] block">
                    Provider Kecerdasan Buatan (AI Provider):
                  </label>
                  <select
                    value={aiConfig.activeProvider}
                    onChange={(e) =>
                      setAiConfig({ ...aiConfig, activeProvider: e.target.value as any })
                    }
                    className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-semibold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8] cursor-pointer"
                  >
                    <option value="gemini">Google Gemini (Disarankan - Kuota Cepat &amp; Stabil)</option>
                    <option value="anthropic">Anthropic Claude (claude-3-5-haiku)</option>
                    <option value="auto">Auto Selection (Pilih otomatis berdasarkan ketersediaan key)</option>
                  </select>
                  <p className="text-[11px] text-[#476072]">
                    Saat ini backend terkonfigurasi memprioritaskan Google Gemini API.
                  </p>
                </div>

                {/* 2. Gemini Model Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C] block">
                    Model Google Gemini Aktif:
                  </label>
                  <select
                    value={aiConfig.geminiModel}
                    onChange={(e) => setAiConfig({ ...aiConfig, geminiModel: e.target.value })}
                    className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-semibold font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8] cursor-pointer"
                  >
                    <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Rekomendasi Utama - Sangat Cepat)</option>
                    <option value="gemini-3.8-flash">gemini-3.8-flash (Penalaran Semantik Mendalam)</option>
                    <option value="gemini-flash-latest">gemini-flash-latest (Versi Rilis Terkini)</option>
                  </select>
                  <p className="text-[11px] text-[#476072]">
                    Rantai toleransi otomatis (auto-fallback) aktif jika terjadi lonjakan traffic.
                  </p>
                </div>

                {/* 3. Temperature Slider */}
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1A202C]">
                      Temperatur Penalaran:
                    </label>
                    <span className="font-mono text-xs font-bold text-[#548CA8]">
                      {aiConfig.temperature} (Deterministik)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={aiConfig.temperature}
                    onChange={(e) =>
                      setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#548CA8] cursor-pointer"
                  />
                  <p className="text-[11px] text-[#476072]">
                    Nilai rendah (0.0 - 0.2) menghasilkan analisis konsisten dan patuh terhadap taksonomi penipuan.
                  </p>
                </div>

                {/* 4. Max Output Tokens */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C] block">
                    Batas Token Respons JSON:
                  </label>
                  <select
                    value={aiConfig.maxTokens}
                    onChange={(e) =>
                      setAiConfig({ ...aiConfig, maxTokens: parseInt(e.target.value, 10) })
                    }
                    className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-semibold font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8] cursor-pointer"
                  >
                    <option value={512}>512 Tokens (Cepat &amp; Hemat)</option>
                    <option value={1024}>1.024 Tokens (Standar Scamora)</option>
                    <option value={2048}>2.048 Tokens (Analisis Detail)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SUB-SECTION B: WEB CRAWLER & DOM INSPECTION CONFIG (Vertically Stacked) */}
            <div className="space-y-6 pb-8 border-b border-[#D8E0E7]">
              <div className="flex items-center justify-between border-b border-[#D8E0E7] pb-4">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-[#334257]" />
                  <h3 className="text-base font-bold text-[#1A202C]">Web Page Crawler &amp; Sandbox Sanitasi</h3>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#548CA8]/15 text-[#334257] font-bold">
                  SSRF Protected
                </span>
              </div>

              <div className="flex flex-col space-y-5">
                {/* 1. Timeout */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C] block">
                    Batas Waktu Perayapan (Timeout ms):
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="15000"
                    step="500"
                    value={crawlerConfig.timeoutMs}
                    onChange={(e) =>
                      setCrawlerConfig({
                        ...crawlerConfig,
                        timeoutMs: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-semibold font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                  <p className="text-[11px] text-[#476072]">
                    Mencegah proses menggantung jika server situs phishing sengaja lambat atau tarpit.
                  </p>
                </div>

                {/* 2. Max Bytes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C] block">
                    Batas Muatan Memori (Max Payload KB):
                  </label>
                  <input
                    type="number"
                    min="64"
                    max="1024"
                    step="64"
                    value={crawlerConfig.maxBytesKb}
                    onChange={(e) =>
                      setCrawlerConfig({
                        ...crawlerConfig,
                        maxBytesKb: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-semibold font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                  <p className="text-[11px] text-[#476072]">
                    Maksimal ukuran halaman statis yang dibaca (mencegah zip/data bomb).
                  </p>
                </div>

                {/* 3. User-Agent String */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C] block">
                    User-Agent Identitas Perayap:
                  </label>
                  <input
                    type="text"
                    value={crawlerConfig.userAgent}
                    onChange={(e) =>
                      setCrawlerConfig({ ...crawlerConfig, userAgent: e.target.value })
                    }
                    className="w-full max-w-xl px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-[#EEEEEE] text-xs font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                </div>

                {/* 4. Crawler Feature Toggles (Vertically Stacked) */}
                <div className="flex flex-col space-y-2.5 pt-2 max-w-xl">
                  <label className="p-3.5 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7] flex items-center justify-between cursor-pointer hover:border-[#548CA8] transition">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#1A202C] block">Proteksi SSRF</span>
                      <span className="text-[10px] text-[#476072] block">Blokir IP lokal &amp; privat</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={crawlerConfig.ssrfProtection}
                      onChange={(e) =>
                        setCrawlerConfig({ ...crawlerConfig, ssrfProtection: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#334257]"
                    />
                  </label>

                  <label className="p-3.5 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7] flex items-center justify-between cursor-pointer hover:border-[#548CA8] transition">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#1A202C] block">Deteksi Form Sandi</span>
                      <span className="text-[10px] text-[#476072] block">&lt;input type="password"&gt;</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={crawlerConfig.detectForms}
                      onChange={(e) =>
                        setCrawlerConfig({ ...crawlerConfig, detectForms: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#334257]"
                    />
                  </label>

                  <label className="p-3.5 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7] flex items-center justify-between cursor-pointer hover:border-[#548CA8] transition">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#1A202C] block">Deteksi Berkas APK</span>
                      <span className="text-[10px] text-[#476072] block">Pemicu unduhan .apk</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={crawlerConfig.detectApk}
                      onChange={(e) =>
                        setCrawlerConfig({ ...crawlerConfig, detectApk: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#334257]"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* SUB-SECTION C: RISK SCORING WEIGHTS & THRESHOLDS (Vertically Stacked) */}
            <div className="space-y-6 pb-8 border-b border-[#D8E0E7]">
              <div className="flex items-center justify-between border-b border-[#D8E0E7] pb-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#334257]" />
                  <h3 className="text-base font-bold text-[#1A202C]">Ambang Batas Skor Risiko (Thresholds)</h3>
                </div>
                <span className="text-[11px] font-mono text-[#476072]">Skala Risiko 0 - 100</span>
              </div>

              <div className="flex flex-col space-y-4 max-w-xl">
                {/* 1. Batas Risiko Tinggi */}
                <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                      Batas Risiko Tinggi (High Risk Min)
                    </span>
                    <span className="font-mono text-sm font-black text-rose-700">
                      &gt;= {thresholds.highMin} Poin
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="80"
                    step="5"
                    value={thresholds.highMin}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, highMin: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-rose-700/80">
                    Peringatan merah bahaya aktif jika skor mencapai ambang ini atau ada indikator kritis.
                  </p>
                </div>

                {/* 2. Batas Peninjauan */}
                <div className="p-4 rounded-xl bg-[#548CA8]/10 border border-[#548CA8]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#334257] uppercase tracking-wide">
                      Batas Peninjauan (Review Min)
                    </span>
                    <span className="font-mono text-sm font-black text-[#548CA8]">
                      &gt;= {thresholds.reviewMin} Poin
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    step="5"
                    value={thresholds.reviewMin}
                    onChange={(e) =>
                      setThresholds({ ...thresholds, reviewMin: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-[#548CA8] cursor-pointer"
                  />
                  <p className="text-[11px] text-[#476072]">
                    Peringatan tinjauan aktif untuk verifikasi manual mandiri oleh pengguna.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Save Button Bar */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Menyimpan Perubahan...' : 'Simpan Semua Pengaturan Lanjutan'}</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};
