import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  trend?: string;
  trendPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-[#548CA8]/15',
  iconColor = 'text-[#334257]',
  trend,
  trendPositive = true,
}) => {
  return (
    <div className="admin-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#476072] uppercase tracking-wider font-mono">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-black text-[#1A202C] tracking-tight font-mono">
          {value}
        </div>
        <div className="flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-mono font-bold px-1.5 py-0.5 rounded-sm ${trendPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="text-[#5E6D7E] text-[11px] truncate">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};


