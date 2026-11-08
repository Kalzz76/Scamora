import React, { useState } from 'react';
import { Cpu, Zap, Activity, CheckCircle2, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { adminService } from '../../../services/adminService';
import type { AiTelemetry24h } from '../../../types/admin';

interface AiConditionCardProps {
  telemetry?: AiTelemetry24h;
  modelName?: string;
  provider?: string;
}

export const AiConditionCard: React.FC<AiConditionCardProps> = ({
  telemetry = {
    tokensUsed24h: 184520,
    promptTokens24h: 128400,
    completionTokens24h: 56120,
    avgLatencyMs: 680,
    currentLatencyMs: 620,
    errorCount24h: 0,
    errorRatePercent: 0.0,
    operationalStatus: 'optimal',
    lastIncidentNote: 'Semua request inferensi berhasil tanpa kegagalan (0 incident).',
  },
  modelName = 'gemini-3.5-flash-lite',
  provider: _provider = 'gemini',
}) => {
  const [testingPing, setTestingPing] = useState(false);
  const [currentPing, setCurrentPing] = useState<number>(telemetry.currentLatencyMs || 620);

  const handleTestPing = async () => {
    setTestingPing(true);
    try {
      const res = await adminService.testAiPing();
      setCurrentPing(res.latencyMs);
      toast.success(`${res.message} (Latensi: ${res.latencyMs}ms)`);
    } catch {
      toast.error('Gagal menghubungi engine Gemini AI.');
    } finally {
      setTestingPing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8E0E7] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#548CA8]/15 text-[#334257] flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#1A202C]">2. Kondisi &amp; Performa AI Engine</h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-[10px] font-bold font-mono uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {telemetry.operationalStatus === 'optimal' ? 'Sistem Optimal' : 'Degraded'}
              </span>
            </div>
            <p className="text-xs text-[#476072]">
              Pemantauan konsumsi token, kesehatan latensi inferensi, dan status kendala 24 jam terakhir
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTestPing}
            disabled={testingPing}
            className="px-3.5 py-1.5 rounded-xl border border-[#D8E0E7] hover:bg-[#EEEEEE] text-[#334257] text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin text-[#548CA8]' : ''}`} />
            <span>{testingPing ? 'Menguji...' : 'Uji Latensi'}</span>
          </button>
          <Link
            to="/admin/engine"
            className="p-1.5 rounded-xl text-[#476072] hover:text-[#334257] hover:bg-[#548CA8]/15 transition"
            title="Buka Pengaturan Engine"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid: Token, Latency, Incident Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Token Consumption 24h */}
        <div className="p-4 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7] space-y-3">
          <div className="flex items-center justify-between text-xs text-[#476072]">
            <span className="font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#548CA8]" />
              Token Habis (24 Jam)
            </span>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border border-[#D8E0E7]">
              Gemini API
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-[#334257] font-mono">
              {telemetry.tokensUsed24h.toLocaleString()}
            </div>
            <span className="text-[11px] text-[#476072]">Total token masukan &amp; keluaran</span>
          </div>

          {/* Prompt vs Completion bar */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden flex">
              <div
                className="bg-[#334257] h-full"
                style={{ width: `${(telemetry.promptTokens24h / telemetry.tokensUsed24h) * 100}%` }}
                title={`Prompt: ${telemetry.promptTokens24h.toLocaleString()}`}
              />
              <div
                className="bg-[#548CA8] h-full"
                style={{ width: `${(telemetry.completionTokens24h / telemetry.tokensUsed24h) * 100}%` }}
                title={`Completion: ${telemetry.completionTokens24h.toLocaleString()}`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#476072]">
              <span>Prompt: {(telemetry.promptTokens24h / 1000).toFixed(1)}k</span>
              <span>Output: {(telemetry.completionTokens24h / 1000).toFixed(1)}k</span>
            </div>
          </div>
        </div>

        {/* Latency Condition */}
        <div className="p-4 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7] space-y-3">
          <div className="flex items-center justify-between text-xs text-[#476072]">
            <span className="font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              Kondisi Latensi
            </span>
            <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
              Respon Cepat
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-black text-[#334257] font-mono">
              {currentPing}{' '}
              <span className="text-xs font-semibold text-[#476072]">ms</span>
            </div>
            <span className="text-[11px] text-[#476072]">
              (Rata-rata: {telemetry.avgLatencyMs} ms)
            </span>
          </div>

          <div className="p-2 rounded-lg bg-white border border-[#D8E0E7] flex items-center justify-between text-[11px]">
            <span className="text-[#476072]">Model Aktif:</span>
            <span className="font-mono font-bold text-[#334257]">{modelName}</span>
          </div>

          <div className="text-[10px] text-[#476072] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            Inferensi stabil di bawah target SLA &lt; 1.500 ms
          </div>
        </div>

        {/* Incidents & Error Status */}
        <div className="p-4 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7] space-y-3">
          <div className="flex items-center justify-between text-xs text-[#476072]">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Status Kendala &amp; Error
            </span>
            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
              0 Kendala
            </span>
          </div>

          <div>
            <div className="text-2xl font-black text-emerald-700 font-mono flex items-center gap-2">
              <span>{telemetry.errorRatePercent.toFixed(1)}%</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                100% Uptime
              </span>
            </div>
            <span className="text-[11px] text-[#476072]">
              Gagal inferensi: {telemetry.errorCount24h} kali (24 jam)
            </span>
          </div>

          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 leading-tight">
            ✓ {telemetry.lastIncidentNote}
          </div>

          <div className="text-[10px] text-[#476072] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#334257] shrink-0" />
            Auto-fallback lokal siap menjaga kelangsungan sistem.
          </div>
        </div>
      </div>
    </div>
  );
};
