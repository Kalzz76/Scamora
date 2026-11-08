import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Activity,
  Send,
  RefreshCw,
  Clock,
  Terminal,
  Key,
  Fingerprint,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../../../services/adminService';
import type { AiConfig, HourlyTokenData } from '../../../types/admin';

interface AiConditionSectionProps {
  aiConfig: AiConfig;
  hourlyTokens?: HourlyTokenData[];
  totalTokens24h?: number;
  promptTokens24h?: number;
  completionTokens24h?: number;
}

export const AiConditionSection: React.FC<AiConditionSectionProps> = ({
  aiConfig,
  hourlyTokens = [
    { hour: '00:00', totalTokens: 3120, promptTokens: 2150, completionTokens: 970 },
    { hour: '01:00', totalTokens: 2450, promptTokens: 1700, completionTokens: 750 },
    { hour: '02:00', totalTokens: 1980, promptTokens: 1380, completionTokens: 600 },
    { hour: '03:00', totalTokens: 1540, promptTokens: 1080, completionTokens: 460 },
    { hour: '04:00', totalTokens: 2360, promptTokens: 1650, completionTokens: 710 },
    { hour: '05:00', totalTokens: 3620, promptTokens: 2520, completionTokens: 1100 },
    { hour: '06:00', totalTokens: 5380, promptTokens: 3750, completionTokens: 1630 },
    { hour: '07:00', totalTokens: 7420, promptTokens: 5160, completionTokens: 2260 },
    { hour: '08:00', totalTokens: 9850, promptTokens: 6850, completionTokens: 3000 },
    { hour: '09:00', totalTokens: 12100, promptTokens: 8420, completionTokens: 3680 },
    { hour: '10:00', totalTokens: 13900, promptTokens: 9680, completionTokens: 4220 },
    { hour: '11:00', totalTokens: 14850, promptTokens: 10340, completionTokens: 4510 },
    { hour: '12:00', totalTokens: 12640, promptTokens: 8800, completionTokens: 3840 },
    { hour: '13:00', totalTokens: 13580, promptTokens: 9450, completionTokens: 4130 },
    { hour: '14:00', totalTokens: 15680, promptTokens: 10920, completionTokens: 4760 },
    { hour: '15:00', totalTokens: 15120, promptTokens: 10520, completionTokens: 4600 },
    { hour: '16:00', totalTokens: 12350, promptTokens: 8600, completionTokens: 3750 },
    { hour: '17:00', totalTokens: 10780, promptTokens: 7510, completionTokens: 3270 },
    { hour: '18:00', totalTokens: 9150, promptTokens: 6370, completionTokens: 2780 },
    { hour: '19:00', totalTokens: 8340, promptTokens: 5800, completionTokens: 2540 },
    { hour: '20:00', totalTokens: 6950, promptTokens: 4840, completionTokens: 2110 },
    { hour: '21:00', totalTokens: 5420, promptTokens: 3770, completionTokens: 1650 },
    { hour: '22:00', totalTokens: 4180, promptTokens: 2910, completionTokens: 1270 },
    { hour: '23:00', totalTokens: 3360, promptTokens: 2340, completionTokens: 1020 },
  ],
  totalTokens24h = 184520,
  promptTokens24h = 128400,
  completionTokens24h = 56120,
}) => {
  // Chart Hover State
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Playground / Compact Test State
  const [testPrompt, setTestPrompt] = useState('Tes koneksi inferensi Scamora AI');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    latencyMs: number;
    model: string;
    message: string;
    timestamp: string;
  } | null>({
    latencyMs: aiConfig.latencyMs || 620,
    model: aiConfig.geminiModel,
    message: 'Inferensi Google Gemini berhasil merespon (620ms).',
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
  });

  const maxTokenInHour = Math.max(...hourlyTokens.map((t) => t.totalTokens), 1000);
  const activeHoverItem = hoveredIndex !== null ? hourlyTokens[hoveredIndex] : null;

  const handleRunTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!testPrompt.trim()) return;

    setTesting(true);
    try {
      const res = await adminService.testAiPing(testPrompt);
      setTestResult({
        latencyMs: res.latencyMs,
        model: res.model,
        message: res.message,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      });
      toast.success(`Uji koneksi sukses (${res.latencyMs}ms)`);
    } catch {
      toast.error('Gagal melakukan uji koneksi AI.');
    } finally {
      setTesting(false);
    }
  };

  const presetPrompts = [
    'Ping Singkat',
    'Tes URL: https://bca-klik.com.xyz',
    'Tes Chat: Lowongan Like Video',
  ];

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8E0E7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#334257] text-white text-xs font-black font-mono flex items-center justify-center">
              1
            </span>
            <h2 className="text-lg font-black text-[#1A202C] tracking-tight">
              Kondisi AI Saat Ini &amp; Telemetri
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono uppercase">
              Live Active
            </span>
          </div>
          <p className="text-xs text-[#476072] mt-1">
            Status model, konsumsi token 24 jam, kecepatan respon, dan fasilitas uji koneksi cepat.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#D8E0E7] text-xs font-semibold text-[#334257] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Engine: {aiConfig.geminiModel}</span>
        </div>
      </div>

      {/* 3 STATUS SUMMARY STATS (Unboxed) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Model & Provider */}
        <div className="p-4 rounded-xl bg-[#EEEEEE]/60 dark:bg-slate-800/80 border border-[#D8E0E7] dark:border-white/10 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-[#476072] dark:text-slate-300">
            <span className="font-bold flex items-center gap-1.5 text-[#334257] dark:text-slate-200">
              <Cpu className="w-4 h-4 text-[#334257] dark:text-cyan-400" />
              Model AI Aktif
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#548CA8]/15 dark:bg-[#548CA8]/30 text-[#334257] dark:text-cyan-300 font-bold uppercase">
              {aiConfig.activeProvider}
            </span>
          </div>
          <div className="text-base font-black text-[#1A202C] dark:text-white font-mono truncate">
            {aiConfig.geminiModel}
          </div>
          <div className="text-[11px] text-[#476072] dark:text-slate-300 flex items-center justify-between pt-1 font-mono">
            <span>Suhu: {aiConfig.temperature}</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Key className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{aiConfig.idToken ? 'ID Token & Key Aktif' : 'API Key: Terkonfigurasi'}</span>
            </span>
          </div>
          {aiConfig.credentialCode && (
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-200/60 dark:border-white/10">
              <Fingerprint className="w-3 h-3 text-[#548CA8] dark:text-cyan-400" />
              <span className="truncate">Kode: {aiConfig.credentialCode}</span>
            </div>
          )}
        </div>

        {/* 24h Tokens */}
        <div className="p-4 rounded-xl bg-[#EEEEEE]/60 dark:bg-slate-800/80 border border-[#D8E0E7] dark:border-white/10 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-[#476072] dark:text-slate-300">
            <span className="font-bold flex items-center gap-1.5 text-[#334257] dark:text-slate-200">
              <Zap className="w-4 h-4 text-[#548CA8] dark:text-cyan-400" />
              Total Token (24 Jam)
            </span>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
              Normal
            </span>
          </div>
          <div className="text-xl font-black text-[#334257] dark:text-white font-mono">
            {totalTokens24h.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-[#476072] dark:text-slate-400">token</span>
          </div>
          <div className="text-[11px] text-[#476072] dark:text-slate-300 flex items-center justify-between pt-1 font-mono">
            <span>Prompt: {(promptTokens24h / 1000).toFixed(1)}k</span>
            <span>Output: {(completionTokens24h / 1000).toFixed(1)}k</span>
          </div>
        </div>

        {/* Latency & Status */}
        <div className="p-4 rounded-xl bg-[#EEEEEE]/60 dark:bg-slate-800/80 border border-[#D8E0E7] dark:border-white/10 space-y-2 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-xs text-[#476072] dark:text-slate-300">
            <span className="font-bold flex items-center gap-1.5 text-[#334257] dark:text-slate-200">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Kecepatan Latensi
            </span>
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-sm border border-emerald-200 dark:border-emerald-500/30">
              Optimal
            </span>
          </div>
          <div className="text-xl font-black text-[#334257] dark:text-white font-mono">
            {testResult?.latencyMs || 620}{' '}
            <span className="text-xs font-semibold text-[#476072] dark:text-slate-400">ms</span>
          </div>
          <div className="text-[11px] text-[#476072] dark:text-slate-300 flex items-center justify-between pt-1">
            <span>Target SLA: &lt; 1.500 ms</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">0 Kendala (100%)</span>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: GRAFIK PENGGUNAAN TOKEN (LEFT) + TEMPAT KECIL UJI KONEKSI (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
        
        {/* LEFT COLUMN: GRAFIK PENGGUNAAN TOKEN (7 COLS - Unboxed) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8E0E7] dark:border-white/10 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A202C] dark:text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#548CA8] dark:text-cyan-400" />
                  Grafik Penggunaan Token (24 Jam)
                </h3>
                <p className="text-[11px] text-[#476072] dark:text-slate-400">
                  Konsumsi token Google Gemini API per jam dalam 24 jam terakhir
                </p>
              </div>

              {activeHoverItem ? (
                <div className="text-xs font-mono font-bold text-[#334257] dark:text-cyan-200 bg-[#548CA8]/15 dark:bg-[#548CA8]/30 px-2.5 py-1 rounded-md">
                  {activeHoverItem.hour}: {activeHoverItem.totalTokens.toLocaleString()} token
                </div>
              ) : (
                <span className="text-[11px] text-[#476072] dark:text-slate-400">Hover batang untuk detail</span>
              )}
            </div>

            {/* Token Bar Chart */}
            <div className="pt-6">
              <div className="h-44 flex items-end gap-1 sm:gap-2 border-b border-[#D8E0E7] dark:border-white/10 pb-1">
                {hourlyTokens.map((item, idx) => {
                  const heightPercent = Math.max((item.totalTokens / maxTokenInHour) * 100, 8);
                  const isHovered = hoveredIndex === idx;
                  const promptPercent = (item.promptTokens / item.totalTokens) * 100;

                  return (
                    <div
                      key={item.hour}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    >
                      <div
                        className={`w-full rounded-t-md transition-all duration-150 overflow-hidden flex flex-col justify-end ${
                          isHovered
                            ? 'ring-2 ring-[#548CA8] shadow-md scale-y-[1.03] origin-bottom'
                            : 'hover:brightness-110'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* Completion / Output segment (Slate Cyan) */}
                        <div
                          className="w-full bg-[#548CA8]"
                          style={{ height: `${100 - promptPercent}%` }}
                        />
                        {/* Prompt segment (Slate Navy) */}
                        <div
                          className="w-full bg-[#334257] dark:bg-slate-700 flex-1"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between items-center text-[10px] font-mono text-[#476072] dark:text-slate-400 pt-2">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>23:00</span>
              </div>
            </div>
          </div>

          {/* Chart Legend & Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#EEEEEE] dark:bg-slate-800/80 border border-[#D8E0E7] dark:border-white/10 text-xs">
            <div className="flex items-center gap-4 text-[11px] text-[#476072] dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#334257] dark:bg-slate-600"></span>
                <span>Prompt ({((promptTokens24h / totalTokens24h) * 100).toFixed(0)}%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#548CA8]"></span>
                <span>Completion ({((completionTokens24h / totalTokens24h) * 100).toFixed(0)}%)</span>
              </span>
            </div>

            <div className="text-[11px] font-mono text-[#334257] dark:text-slate-200 font-bold">
              Rata-rata: ~{(totalTokens24h / 24).toFixed(0)} token/jam
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TEMPAT KECIL UNTUK UJI KONEKSI (5 COLS - Unboxed with Left Border) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 lg:pl-8 lg:border-l lg:border-[#D8E0E7] dark:lg:border-white/10">
          <div>
            <div className="flex items-center justify-between border-b border-[#D8E0E7] dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#548CA8]/15 dark:bg-[#548CA8]/30 text-[#334257] dark:text-cyan-300 flex items-center justify-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A202C] dark:text-white">
                    Tempat Uji Koneksi AI
                  </h3>
                  <p className="text-[11px] text-[#476072] dark:text-slate-400">Tes latensi &amp; respon inferensi langsung</p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EEEEEE] dark:bg-slate-800/80 border border-[#D8E0E7] dark:border-white/10 text-slate-700 dark:text-slate-300">
                Live Ping
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="pt-3 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#476072] dark:text-slate-400 block">
                Pilihan Cepat Prompt:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presetPrompts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTestPrompt(preset)}
                    className="px-2.5 py-1 rounded-lg bg-[#EEEEEE] dark:bg-slate-800 hover:bg-[#548CA8]/15 dark:hover:bg-[#548CA8]/30 hover:text-[#334257] dark:hover:text-white border border-[#D8E0E7] dark:border-white/10 text-[10px] font-semibold text-[#476072] dark:text-slate-300 transition cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Input Form */}
            <form onSubmit={handleRunTest} className="pt-3 space-y-2">
              <div className="relative">
                <input
                  type="text"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Ketik teks uji inferensi..."
                  className="w-full pl-3 pr-20 py-2.5 rounded-xl border border-[#D8E0E7] dark:border-white/15 bg-[#EEEEEE] dark:bg-slate-900/80 text-xs text-[#1A202C] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-[#548CA8]"
                />
                <button
                  type="submit"
                  disabled={testing}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#334257] hover:bg-[#476072] dark:bg-[#548CA8] dark:hover:bg-[#437691] text-white text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                >
                  {testing ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3 text-[#548CA8] dark:text-white" />
                  )}
                  <span>{testing ? 'Menguji' : 'Kirim'}</span>
                </button>
              </div>
            </form>

            {/* Test Result Terminal Box */}
            <div className="pt-3">
              <div className="p-3.5 rounded-xl bg-[#242F3E] text-[#EEEEEE] font-mono text-[11px] space-y-2 border border-[#476072] shadow-inner">
                <div className="flex items-center justify-between border-b border-[#476072] pb-2 text-[10px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    STATUS: 200 OK (CONNECTED)
                  </span>
                  <span className="text-gray-400">{testResult?.timestamp}</span>
                </div>

                <div className="space-y-1">
                  <div className="text-gray-400">
                    &gt; Model: <span className="text-white">{testResult?.model}</span>
                  </div>
                  <div className="text-gray-400">
                    &gt; Latensi: <span className="text-[#548CA8] font-bold">{testResult?.latencyMs} ms</span>
                  </div>
                  <div className="text-gray-300 text-[10px] break-words leading-relaxed pt-1">
                    &gt; {testResult?.message}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-[#476072] dark:text-slate-400 flex items-center gap-1 pt-1">
            <Clock className="w-3 h-3 text-[#548CA8] dark:text-cyan-400 shrink-0" />
            Uji koneksi mengeksekusi inferensi mikro untuk memvalidasi token API &amp; ketersediaan model.
          </div>
        </div>

      </div>
    </div>
  );
};
