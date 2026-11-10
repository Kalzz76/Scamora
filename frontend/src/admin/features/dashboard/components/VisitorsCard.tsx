import React, { useState } from 'react';
import { Users, Clock, TrendingUp } from 'lucide-react';
import type { VisitorStats24h } from '../../../types/admin';

interface VisitorsCardProps {
  stats?: VisitorStats24h;
}

export const VisitorsCard: React.FC<VisitorsCardProps> = ({
  stats = {
    totalVisitors: 4892,
    uniqueVisitors: 3418,
    pageViews: 14280,
    liveActiveUsers: 48,
    peakHour: '14:00 - 15:00 WIB',
    hourlyVisitors: [
      { hour: '00:00', count: 85 },
      { hour: '01:00', count: 52 },
      { hour: '02:00', count: 38 },
      { hour: '03:00', count: 30 },
      { hour: '04:00', count: 45 },
      { hour: '05:00', count: 90 },
      { hour: '06:00', count: 145 },
      { hour: '07:00', count: 210 },
      { hour: '08:00', count: 295 },
      { hour: '09:00', count: 340 },
      { hour: '10:00', count: 385 },
      { hour: '11:00', count: 410 },
      { hour: '12:00', count: 360 },
      { hour: '13:00', count: 395 },
      { hour: '14:00', count: 440 },
      { hour: '15:00', count: 425 },
      { hour: '16:00', count: 350 },
      { hour: '17:00', count: 280 },
      { hour: '18:00', count: 235 },
      { hour: '19:00', count: 195 },
      { hour: '20:00', count: 160 },
      { hour: '21:00', count: 130 },
      { hour: '22:00', count: 98 },
      { hour: '23:00', count: 74 },
    ],
  },
}) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  const hourly = stats.hourlyVisitors || [];
  const maxVisitors = Math.max(...hourly.map((h) => h.count), 100);
  const activeHoverData = hoveredHour !== null ? hourly[hoveredHour] : null;

  return (
    <div className="flex flex-col justify-between space-y-3.5 h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#D8E0E7] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#548CA8]/15 text-[#334257] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1A202C]">4. Jumlah Pengunjung Website</h3>
              <p className="text-[11px] text-[#476072]">Trafik masyarakat yang mengakses platform Scamora</p>
            </div>
          </div>

          {/* Live Online Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{stats.liveActiveUsers} Live</span>
          </div>
        </div>

        {/* 24-Hour Key Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-3">
          <div className="p-2.5 rounded-lg bg-[#EEEEEE] border border-[#D8E0E7]">
            <span className="text-[9px] font-bold text-[#476072] uppercase block">
              Total Sesi 24 Jam
            </span>
            <div className="text-base font-black text-[#334257] font-mono mt-0.5">
              {(stats?.totalVisitors ?? 0).toLocaleString()}
            </div>
            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> +12.4%
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#EEEEEE] border border-[#D8E0E7]">
            <span className="text-[9px] font-bold text-[#476072] uppercase block">
              Pengunjung Unik
            </span>
            <div className="text-base font-black text-[#334257] font-mono mt-0.5">
              {(stats?.uniqueVisitors ?? 0).toLocaleString()}
            </div>
            <span className="text-[9px] text-[#476072]">
              {(stats?.totalVisitors ? ((stats.uniqueVisitors / stats.totalVisitors) * 100) : 0).toFixed(0)}% audiens baru
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#EEEEEE] border border-[#D8E0E7]">
            <span className="text-[9px] font-bold text-[#476072] uppercase block">
              Tayangan Halaman
            </span>
            <div className="text-base font-black text-[#548CA8] font-mono mt-0.5">
              {(stats?.pageViews ?? 0).toLocaleString()}
            </div>
            <span className="text-[9px] text-[#476072]">
              ~{(stats?.totalVisitors ? (stats.pageViews / stats.totalVisitors) : 0).toFixed(1)} hal/kunjungan
            </span>
          </div>
        </div>

        {/* Interactive Hourly Distribution */}
        <div className="pt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#476072]">
            <span className="font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#548CA8]" />
              Sebaran Kunjungan 24 Jam
            </span>
            {activeHoverData ? (
              <span className="font-mono text-[10px] font-bold text-[#334257] bg-[#548CA8]/15 px-1.5 py-0.2 rounded-md">
                Pukul {activeHoverData.hour}: {activeHoverData.count} pengunjung
              </span>
            ) : (
              <span className="text-[10px] text-[#476072]">
                Hover batang untuk rincian
              </span>
            )}
          </div>

          {/* Mini 24h Bar Chart */}
          <div className="h-16 flex items-end gap-1 border-b border-[#D8E0E7] pb-1 pt-1.5">
            {hourly.map((item, idx) => {
              const heightPercent = Math.max((item.count / maxVisitors) * 100, 8);
              const isHovered = hoveredHour === idx;
              return (
                <div
                  key={item.hour}
                  onMouseEnter={() => setHoveredHour(idx)}
                  onMouseLeave={() => setHoveredHour(null)}
                  className="flex-1 h-full flex flex-col justify-end group cursor-pointer"
                >
                  <div
                    className={`w-full rounded-t-xs transition-all duration-150 ${
                      isHovered
                        ? 'bg-[#548CA8] ring-1.5 ring-[#548CA8]/50'
                        : 'bg-[#CBDCE5] hover:bg-[#334257]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[9px] font-mono text-[#476072]">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>
      </div>

      {/* Footer peak hour */}
      <div className="p-2.5 rounded-lg bg-[#EEEEEE] border border-[#D8E0E7] flex items-center justify-between text-[11px] text-[#476072]">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[#548CA8]" />
          Jam Paling Ramai (Peak):
        </span>
        <span className="font-mono font-bold text-[#334257]">
          {stats.peakHour}
        </span>
      </div>
    </div>
  );
};
