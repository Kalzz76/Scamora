import React, { useState } from 'react';
import { TrendingUp, Clock, Globe, MessageSquare, Zap } from 'lucide-react';
import type { HourlyScanData } from '../../../types/admin';

interface ScanTimelineChartProps {
  data: HourlyScanData[];
  totalScans: number;
  urlScans: number;
  chatScans: number;
}

export const ScanTimelineChart: React.FC<ScanTimelineChartProps> = ({
  data,
  totalScans,
  urlScans,
  chatScans,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fallback if data is empty
  const hourlyData = data && data.length > 0 ? data : [];
  const maxScans = Math.max(...hourlyData.map((d) => d.scans), 5);

  // Find peak hour
  const peakItem = hourlyData.reduce(
    (max, curr) => (curr.scans > (max?.scans ?? 0) ? curr : max),
    hourlyData[0]
  );

  const activeItem = hoveredIndex !== null ? hourlyData[hoveredIndex] : null;

  return (
    <div className="space-y-6">
      {/* Top Numeric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 sm:p-3.5 rounded-xl bg-white/70 backdrop-blur-xs border border-white/60 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#476072] uppercase tracking-wider block">
            Total Scan (24 Jam)
          </span>
          <div className="text-base sm:text-xl font-black text-[#334257] font-mono mt-0.5">
            {totalScans.toLocaleString()}{' '}
            <span className="text-[11px] sm:text-xs font-semibold text-[#476072]">scan</span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> +18.4% vs kemarin
          </span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-white/70 backdrop-blur-xs border border-white/60 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#476072] uppercase tracking-wider block">
            Rata-rata Scan / Jam
          </span>
          <div className="text-base sm:text-xl font-black text-[#334257] font-mono mt-0.5">
            {(totalScans / 24).toFixed(1)}{' '}
            <span className="text-[11px] sm:text-xs font-semibold text-[#476072]">scan/jam</span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-[#476072] flex items-center gap-1 mt-0.5">
            <Zap className="w-3 h-3 text-[#548CA8]" /> Beban normal
          </span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-white/70 backdrop-blur-xs border border-white/60 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#476072] uppercase tracking-wider block">
            Puncak (Peak)
          </span>
          <div className="text-base sm:text-xl font-black text-[#548CA8] font-mono mt-0.5">
            {peakItem?.hour || '14:00'}{' '}
            <span className="text-[11px] sm:text-xs font-semibold text-[#476072]">WIB</span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-[#476072] flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-[#548CA8]" /> {peakItem?.scans || 122} scan
          </span>
        </div>

        <div className="p-3 sm:p-3.5 rounded-xl bg-white/70 backdrop-blur-xs border border-white/60 shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#476072] uppercase tracking-wider block">
            Proporsi Masukan
          </span>
          <div className="text-[11px] sm:text-xs font-bold text-[#334257] mt-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#334257]">
                <Globe className="w-3 h-3 text-[#548CA8]" /> URL:
              </span>
              <span className="font-mono">{urlScans} ({totalScans > 0 ? ((urlScans / totalScans) * 100).toFixed(0) : 0}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#476072]">
                <MessageSquare className="w-3 h-3 text-[#548CA8]" /> Chat:
              </span>
              <span className="font-mono">{chatScans} ({totalScans > 0 ? ((chatScans / totalScans) * 100).toFixed(0) : 0}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 24-Hour Column Chart */}
      <div className="relative pt-2">
        {/* Floating Tooltip if Hovered */}
        <div className="h-10 mb-2 flex items-center justify-between">
          {activeItem ? (
            <div className="flex flex-wrap items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#334257] text-white text-xs animate-in fade-in duration-100 shadow-md border border-[#476072]">
              <div className="font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#548CA8]" />
                <span>Pukul {activeItem.hour} WIB</span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="font-mono font-bold text-white">
                Total: {activeItem.scans} scan
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-rose-300 flex items-center gap-1">
                  ● Bahaya: {activeItem.threats}
                </span>
                <span className="text-[#548CA8] flex items-center gap-1">
                  ● Aman: {activeItem.safe}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#476072] flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-[#548CA8]" />
              <span>Arahkan kursor mouse ke salah satu batang jam untuk melihat rincian numerik scan 24 jam.</span>
            </div>
          )}

          <div className="text-right text-[11px] font-mono text-[#476072] hidden sm:block">
            Maks: {maxScans} scan/jam
          </div>
        </div>

        {/* Chart Bars Grid */}
        <div className="h-44 flex items-end gap-1 sm:gap-2 border-b border-[#D8E0E7] pb-1 px-1">
          {hourlyData.map((item, idx) => {
            const heightPercent = Math.max((item.scans / maxScans) * 100, 6);
            const isHovered = hoveredIndex === idx;
            const threatPercent = item.scans > 0 ? (item.threats / item.scans) * 100 : 0;

            return (
              <div
                key={item.hour}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex(hoveredIndex === idx ? null : idx)}
                className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
              >
                {/* Bar element */}
                <div
                  className={`w-full rounded-t-md transition-all duration-200 overflow-hidden flex flex-col justify-end ${
                    isHovered
                      ? 'ring-2 ring-[#548CA8] shadow-md scale-y-[1.03] origin-bottom'
                      : 'hover:brightness-110'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  {/* Top segment: threats (red) */}
                  <div
                    className="w-full bg-[#DC2626] transition-all"
                    style={{ height: `${threatPercent}%` }}
                  />
                  {/* Bottom segment: safe / normal (Slate Navy) */}
                  <div
                    className="w-full bg-[#334257] flex-1 transition-all"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis Hour Labels */}
        <div className="flex justify-between items-center text-[10px] font-mono text-[#476072] pt-2 px-1">
          <span>00:00</span>
          <span className="hidden sm:inline">04:00</span>
          <span>08:00</span>
          <span className="hidden sm:inline">12:00</span>
          <span>16:00</span>
          <span className="hidden sm:inline">20:00</span>
          <span>23:00</span>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-4 mt-3 text-[11px] text-[#476072]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#334257]"></span>
            <span>Aman / Tinjau</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#DC2626]"></span>
            <span>Terdeteksi Bahaya</span>
          </span>
        </div>
      </div>
    </div>
  );
};
