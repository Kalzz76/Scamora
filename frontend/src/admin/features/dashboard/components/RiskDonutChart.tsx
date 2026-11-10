import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

interface RiskDonutChartProps {
  highCount: number;
  highPercent: number;
  reviewCount: number;
  reviewPercent: number;
  lowCount: number;
  lowPercent: number;
  totalScans: number;
}

export const RiskDonutChart: React.FC<RiskDonutChartProps> = ({
  highCount,
  highPercent,
  reviewCount,
  reviewPercent,
  lowCount,
  lowPercent,
  totalScans,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<'high' | 'review' | 'low' | null>(null);

  // Donut geometry constants
  const size = 168;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Slices: High (Red), Review (Slate Cyan #548CA8), Low (Slate Navy #334257)
  const segments = [
    {
      id: 'high' as const,
      label: 'Bahaya (High)',
      sublabel: 'Ancaman Kritis Terblokir',
      count: highCount,
      percent: highPercent,
      color: '#DC2626',
      hoverColor: '#B91C1C',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-200',
      icon: ShieldAlert,
    },
    {
      id: 'review' as const,
      label: 'Tinjau (Review)',
      sublabel: 'Perlu Verifikasi Lanjutan',
      count: reviewCount,
      percent: reviewPercent,
      color: '#548CA8',
      hoverColor: '#437691',
      bgColor: 'bg-[#548CA8]/10',
      textColor: 'text-[#548CA8]',
      borderColor: 'border-[#548CA8]/30',
      icon: AlertTriangle,
    },
    {
      id: 'low' as const,
      label: 'Aman (Low)',
      sublabel: 'Domain & Teks Terverifikasi',
      count: lowCount,
      percent: lowPercent,
      color: '#334257',
      hoverColor: '#242F3E',
      bgColor: 'bg-[#334257]/10',
      textColor: 'text-[#334257]',
      borderColor: 'border-[#334257]/30',
      icon: ShieldCheck,
    },
  ];

  // Calculate SVG stroke dashes
  let accumulatedPercent = 0;
  const renderedSegments = segments.map((seg) => {
    const strokeDash = (seg.percent / 100) * circumference;
    const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
    accumulatedPercent += seg.percent;
    return {
      ...seg,
      strokeDash,
      strokeOffset,
    };
  });

  const activeSegmentData = hoveredSegment
    ? segments.find((s) => s.id === hoveredSegment)
    : null;

  return (
    <div className="flex flex-col items-center justify-center w-full py-2">
      {/* Interactive Donut SVG */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 drop-shadow-xs"
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#D8E0E7"
            strokeWidth={strokeWidth}
          />

          {/* Dynamic segments */}
          {renderedSegments.map((seg) => {
            const isHovered = hoveredSegment === seg.id;
            return (
              <circle
                key={seg.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={isHovered ? seg.hoverColor : seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${seg.strokeDash} ${circumference - seg.strokeDash}`}
                strokeDashoffset={seg.strokeOffset}
                strokeLinecap="butt"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment(seg.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => setHoveredSegment(hoveredSegment === seg.id ? null : seg.id)}
              />
            );
          })}
        </svg>

        {/* Center Text Indicator (Switches dynamically on hover) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          {activeSegmentData ? (
            <div className="animate-in fade-in zoom-in-95 duration-150">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${activeSegmentData.bgColor} ${activeSegmentData.textColor}`}>
                {activeSegmentData.label}
              </span>
              <div className="text-xl font-black text-[#1A202C] font-mono mt-0.5">
                {(activeSegmentData.count ?? 0).toLocaleString()}
              </div>
              <span className="text-[10px] font-bold text-[#476072]">
                {activeSegmentData.percent}% masukan
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#476072]">
                Total Scan
              </span>
              <div className="text-xl font-black text-[#334257] font-mono">
                {(totalScans ?? 0).toLocaleString()}
              </div>
              <span className="text-[9px] text-[#476072] flex items-center justify-center gap-1 mt-0.5">
                <Info className="w-2.5 h-2.5 text-[#548CA8]" />
                Hover donat
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Clean Minimal Horizontal Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 text-[11px] pt-3">
        {segments.map((seg) => (
          <div
            key={seg.id}
            onMouseEnter={() => setHoveredSegment(seg.id)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => setHoveredSegment(hoveredSegment === seg.id ? null : seg.id)}
            className="flex items-center gap-1.5 cursor-pointer text-[#476072] hover:text-[#1A202C] font-medium transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="font-bold">{seg.label.split(' ')[0]}</span>
            <span className="text-[#476072] font-mono text-[10px]">({seg.percent}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
