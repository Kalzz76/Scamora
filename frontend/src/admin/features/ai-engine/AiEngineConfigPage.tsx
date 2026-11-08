import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Globe,
  Sliders,
  ShieldCheck,
  Save,
  ChevronDown,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Fingerprint,
  RefreshCw,
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

  // Credential Visibility Toggles
  const [showCredentialCode, setShowCredentialCode] = useState(false);
  const [showIdToken, setShowIdToken] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleGenerateCredentialCode = () => {
    if (!aiConfig) return;
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const newCode = `SCAMORA-SEC-CRED-${randomHex}`;
    setAiConfig({ ...aiConfig, credentialCode: newCode });
    toast.info(`Kode Kredensial baru dibuat: ${newCode}`);
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
      toast.success('Konfigurasi Pengaturan & Kredensial AI berhasil disimpan!');
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
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-10 w-full max-w-7xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. KONDISI AI SAAT INI (GRAFIK PENGGUNAAN TOKEN & TEMPAT UJI KONEKSI)      */}
      {/* ========================================================================= */}
      <section className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
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
      <section className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6">
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

            {/* ========================================================================= */}
            {/* SUB-SECTION 1: KREDENSIAL, KODE KREDENSIAL & ID TOKEN (API SECRETS & TOKENS) */}
            {/* ========================================================================= */}
            <div className="space-y-6 pb-8 border-b border-[#D8E0E7]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E0E7] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#548CA8]/15 text-[#334257] flex items-center justify-center">
                    <Key className="w-4 h-4 text-[#548CA8]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A202C]">
                      Kredensial Autentikasi, Kode Kredensial &amp; ID Token
                    </h3>
                    <p className="text-[11px] text-[#476072]">
                      Kelola kode kredensial rahasia, JWT Service ID Token, dan API Keys model AI.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1 self-start sm:self-auto">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Enkripsi AES-256 Aktif</span>
                </span>
              </div>

              <div className="flex flex-col space-y-5 max-w-3xl">
                {/* 1. INPUT KODE KREDENSIAL (Credential Code) */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-[#D8E0E7] dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1A202C] flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4 text-[#548CA8]" />
                      <span>Kode Kredensial Akses Internal (Credential Code):</span>
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#548CA8]/15 text-[#334257] font-bold">
                      Otorisasi Cluster
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showCredentialCode ? 'text' : 'password'}
                        placeholder="Contoh: SCAMORA-SEC-CRED-9942"
                        value={aiConfig.credentialCode || ''}
                        onChange={(e) =>
                          setAiConfig({ ...aiConfig, credentialCode: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 pr-20 rounded-xl border border-[#D8E0E7] bg-white dark:bg-slate-900 text-xs font-mono font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowCredentialCode(!showCredentialCode)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title={showCredentialCode ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {showCredentialCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(aiConfig.credentialCode || '', 'Kode Kredensial')}
                          className="p-1 rounded-md text-slate-400 hover:text-[#548CA8] cursor-pointer"
                          title="Salin Kode Kredensial"
                        >
                          {copiedField === 'Kode Kredensial' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateCredentialCode}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/20 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-[#334257] dark:text-slate-200 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                      title="Generate Kode Kredensial Acak Baru"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#548CA8]" />
                      <span className="hidden sm:inline">Buat Kode Baru</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#476072]">
                    Kode verifikasi identitas kredensial otorisasi internal untuk sinkronisasi worker node &amp; audit telemetri.
                  </p>
                </div>

                {/* 2. INPUT ID TOKEN / BEARER SERVICE TOKEN */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-[#D8E0E7] dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1A202C] flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-[#548CA8]" />
                      <span>ID Token / Bearer Token Otorisasi (Service ID Token):</span>
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      JWT Auth Token
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={2}
                      placeholder="Masukkan ID Token JWT (contoh: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIs...)"
                      value={aiConfig.idToken || ''}
                      onChange={(e) =>
                        setAiConfig({ ...aiConfig, idToken: e.target.value })
                      }
                      className={`w-full px-3.5 py-2.5 pr-20 rounded-xl border border-[#D8E0E7] bg-white dark:bg-slate-900 text-xs font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8] leading-relaxed ${
                        !showIdToken ? 'blur-xs select-none hover:blur-none transition-all' : ''
                      }`}
                    />
                    <div className="absolute right-3 top-3 flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowIdToken(!showIdToken)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showIdToken ? 'Samarkan Token' : 'Tampilkan Token'}
                      >
                        {showIdToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(aiConfig.idToken || '', 'ID Token')}
                        className="p-1 rounded-md text-slate-400 hover:text-[#548CA8] cursor-pointer"
                        title="Salin ID Token"
                      >
                        {copiedField === 'ID Token' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#476072]">
                    Digunakan untuk pertukaran otentikasi aman lintas microservice backend Scamora, Google Cloud IAM, atau reverse proxy.
                  </p>
                </div>

                {/* 3. GOOGLE GEMINI API KEY & ANTHROPIC CLAUDE KEY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Gemini API Key */}
                  <div className="space-y-1.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-[#D8E0E7] dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1A202C]">
                        Google Gemini API Key:
                      </label>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                        (aiConfig.geminiApiKey || '').length > 5
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {(aiConfig.geminiApiKey || '').length > 5 ? 'Terpasang' : 'Belum Diset'}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showGeminiKey ? 'text' : 'password'}
                        placeholder="AQ.Ab8RN6IxMaYt..."
                        value={aiConfig.geminiApiKey || ''}
                        onChange={(e) =>
                          setAiConfig({
                            ...aiConfig,
                            geminiApiKey: e.target.value,
                            geminiKeySet: e.target.value.trim().length > 5,
                          })
                        }
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#D8E0E7] bg-white dark:bg-slate-900 text-xs font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showGeminiKey ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#476072]">
                      Kunci akses Google AI Studio untuk inferensi semantik Gemini.
                    </p>
                  </div>

                  {/* Anthropic Claude API Key */}
                  <div className="space-y-1.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-[#D8E0E7] dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1A202C]">
                        Anthropic Claude API Key:
                      </label>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                        (aiConfig.claudeApiKey || '').length > 5
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-[#476072]'
                      }`}>
                        {(aiConfig.claudeApiKey || '').length > 5 ? 'Terpasang' : 'Opsional'}
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type={showClaudeKey ? 'text' : 'password'}
                        placeholder="sk-ant-api03-..."
                        value={aiConfig.claudeApiKey || ''}
                        onChange={(e) =>
                          setAiConfig({
                            ...aiConfig,
                            claudeApiKey: e.target.value,
                            claudeKeySet: e.target.value.trim().length > 5,
                          })
                        }
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#D8E0E7] bg-white dark:bg-slate-900 text-xs font-mono text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClaudeKey(!showClaudeKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showClaudeKey ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showClaudeKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-[#476072]">
                      Kunci cadangan Claude 3.5 Haiku untuk toleransi gangguan (fallback).
                    </p>
                  </div>
                </div>

                {/* 4. GOOGLE CLOUD PROJECT ID */}
                <div className="space-y-1.5 p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-[#D8E0E7] dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1A202C]">
                      Google Cloud Project ID / Environment Identifier:
                    </label>
                    <span className="text-[10px] font-mono text-[#476072]">
                      Resource Identifier
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: scamora-cyber-defense-prod"
                    value={aiConfig.projectId || ''}
                    onChange={(e) =>
                      setAiConfig({ ...aiConfig, projectId: e.target.value })
                    }
                    className="w-full max-w-lg px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] bg-white dark:bg-slate-900 text-xs font-mono font-bold text-[#1A202C] focus:outline-hidden focus:border-[#548CA8]"
                  />
                </div>
              </div>
            </div>

            {/* SUB-SECTION 2: AI MODEL & PROVIDER CONFIG (Vertically Stacked) */}
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
                    className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] dark:border-white/15 bg-[#EEEEEE] dark:bg-slate-900/80 text-xs font-semibold text-[#1A202C] dark:text-white focus:outline-hidden focus:border-[#548CA8] cursor-pointer"
                  >
                    <option value="gemini">Google Gemini (Disarankan - Kuota Cepat &amp; Stabil)</option>
                    <option value="anthropic">Anthropic Claude (claude-3-5-haiku)</option>
                    <option value="auto">Auto Selection (Pilih otomatis berdasarkan ketersediaan key)</option>
                  </select>
                  <p className="text-[11px] text-[#476072] dark:text-slate-400">
                    Saat ini backend terkonfigurasi memprioritaskan Google Gemini API.
                  </p>
                </div>

                {/* 2. Gemini Model Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C] dark:text-white block">
                    Model Google Gemini Aktif:
                  </label>
                  <select
                    value={aiConfig.geminiModel}
                    onChange={(e) => setAiConfig({ ...aiConfig, geminiModel: e.target.value })}
                    className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] dark:border-white/15 bg-[#EEEEEE] dark:bg-slate-900/80 text-xs font-semibold font-mono text-[#1A202C] dark:text-white focus:outline-hidden focus:border-[#548CA8] cursor-pointer"
                  >
                    <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Rekomendasi Utama - Sangat Cepat)</option>
                    <option value="gemini-3.8-flash">gemini-3.8-flash (Penalaran Semantik Mendalam)</option>
                    <option value="gemini-flash-latest">gemini-flash-latest (Versi Rilis Terkini)</option>
                  </select>
                  <p className="text-[11px] text-[#476072] dark:text-slate-400">
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
                    className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] dark:border-white/15 bg-[#EEEEEE] dark:bg-slate-900/80 text-xs font-semibold font-mono text-[#1A202C] dark:text-white focus:outline-hidden focus:border-[#548CA8] cursor-pointer"
                  >
                    <option value={512}>512 Tokens (Cepat &amp; Hemat)</option>
                    <option value={1024}>1.024 Tokens (Standar Scamora)</option>
                    <option value={2048}>2.048 Tokens (Analisis Detail)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SUB-SECTION B: WEB CRAWLER & DOM INSPECTION CONFIG (Vertically Stacked) */}
            <div className="space-y-6 pb-8 border-b border-[#D8E0E7] dark:border-white/10">
              <div className="flex items-center justify-between border-b border-[#D8E0E7] dark:border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-[#334257] dark:text-cyan-400" />
                  <h3 className="text-base font-bold text-[#1A202C] dark:text-white">Web Page Crawler &amp; Sandbox Sanitasi</h3>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#548CA8]/15 dark:bg-[#548CA8]/30 text-[#334257] dark:text-cyan-300 font-bold">
                  SSRF Protected
                </span>
              </div>

              <div className="flex flex-col space-y-5">
                {/* 1. Timeout */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C] dark:text-white block">
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
                    className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] dark:border-white/15 bg-[#EEEEEE] dark:bg-slate-900/80 text-xs font-semibold font-mono text-[#1A202C] dark:text-white focus:outline-hidden focus:border-[#548CA8]"
                  />
                  <p className="text-[11px] text-[#476072] dark:text-slate-400">
                    Mencegah proses menggantung jika server situs phishing sengaja lambat atau tarpit.
                  </p>
                </div>

                {/* 2. Max Bytes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C] dark:text-white block">
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
                    className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] dark:border-white/15 bg-[#EEEEEE] dark:bg-slate-900/80 text-xs font-semibold font-mono text-[#1A202C] dark:text-white focus:outline-hidden focus:border-[#548CA8]"
                  />
                  <p className="text-[11px] text-[#476072] dark:text-slate-400">
                    Maksimal ukuran halaman statis yang dibaca (mencegah zip/data bomb).
                  </p>
                </div>

                {/* 3. User-Agent String */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A202C] dark:text-white block">
                    User-Agent Identitas Perayap:
                  </label>
                  <input
                    type="text"
                    value={crawlerConfig.userAgent}
                    onChange={(e) =>
                      setCrawlerConfig({ ...crawlerConfig, userAgent: e.target.value })
                    }
                    className="w-full max-w-xl px-3.5 py-2.5 rounded-xl border border-[#D8E0E7] dark:border-white/15 bg-[#EEEEEE] dark:bg-slate-900/80 text-xs font-mono text-[#1A202C] dark:text-white focus:outline-hidden focus:border-[#548CA8]"
                  />
                </div>

                {/* 4. Crawler Feature Toggles (Vertically Stacked) */}
                <div className="flex flex-col space-y-2.5 pt-2 max-w-xl">
                  <label className="p-3.5 rounded-xl bg-[#EEEEEE] dark:bg-slate-800/80 border border-[#D8E0E7] dark:border-white/10 flex items-center justify-between cursor-pointer hover:border-[#548CA8] dark:hover:border-[#548CA8] transition">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#1A202C] dark:text-white block">Proteksi SSRF</span>
                      <span className="text-[10px] text-[#476072] dark:text-slate-300 block">Blokir IP lokal &amp; privat</span>
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

                  <label className="p-3.5 rounded-xl bg-[#EEEEEE] dark:bg-slate-800/80 border border-[#D8E0E7] dark:border-white/10 flex items-center justify-between cursor-pointer hover:border-[#548CA8] dark:hover:border-[#548CA8] transition">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#1A202C] dark:text-white block">Deteksi Form Sandi</span>
                      <span className="text-[10px] text-[#476072] dark:text-slate-300 block">&lt;input type="password"&gt;</span>
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

                  <label className="p-3.5 rounded-xl bg-[#EEEEEE] dark:bg-slate-800/80 border border-[#D8E0E7] dark:border-white/10 flex items-center justify-between cursor-pointer hover:border-[#548CA8] dark:hover:border-[#548CA8] transition">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#1A202C] dark:text-white block">Deteksi Berkas APK</span>
                      <span className="text-[10px] text-[#476072] dark:text-slate-300 block">Pemicu unduhan .apk</span>
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
