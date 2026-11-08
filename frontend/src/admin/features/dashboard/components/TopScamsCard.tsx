import React from 'react';
import { ShieldAlert, ArrowRight, Award, AlertOctagon, Smartphone, CreditCard, Gift, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopScamsCardProps {
  scamTypeBreakdown: Record<string, number>;
}

export const TopScamsCard: React.FC<TopScamsCardProps> = ({ scamTypeBreakdown }) => {
  // Metadata for human-friendly presentation
  const metaMap: Record<string, { label: string; tier: 'KRITIS' | 'TINGGI' | 'SEDANG'; icon: React.ElementType; color: string }> = {
    phishing: {
      label: 'Phishing Web & Bank',
      tier: 'KRITIS',
      icon: AlertOctagon,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    job_scam: {
      label: 'Job Scam / Task Freelance',
      tier: 'TINGGI',
      icon: Briefcase,
      color: 'text-[#548CA8] bg-[#548CA8]/10 border-[#548CA8]/30',
    },
    apk_malware: {
      label: 'Malware File .APK Undangan/Resi',
      tier: 'KRITIS',
      icon: Smartphone,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
    banking_fraud: {
      label: 'Vishing & Rekening Bodong',
      tier: 'TINGGI',
      icon: CreditCard,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    giveaway_scam: {
      label: 'Undian Hadiah Palsu / Marketplace',
      tier: 'SEDANG',
      icon: Gift,
      color: 'text-[#476072] bg-[#476072]/10 border-[#476072]/30',
    },
    investment_scam: {
      label: 'Investasi Bodong / Robot Trading',
      tier: 'KRITIS',
      icon: Award,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
  };

  // Convert to sorted array and take TOP 5
  const sorted = Object.entries(scamTypeBreakdown || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalTop5 = sorted.reduce((acc, curr) => acc + curr[1], 0) || 1;

  return (
    <div className="flex flex-col justify-between space-y-5 h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#D8E0E7] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A202C]">3. Top 5 Modus Penipuan</h3>
              <p className="text-xs text-[#476072]">Peringkat kasus kejahatan siber yang paling sering terdeteksi</p>
            </div>
          </div>

          <Link
            to="/admin/knowledge"
            className="text-xs font-bold text-[#548CA8] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Katalog Modus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Top 5 Ranked List (Clean Rankings Only - No Progress Bars) */}
        <div className="divide-y divide-[#D8E0E7] pt-2">
          {sorted.map(([type, count], index) => {
            const meta = metaMap[type] || {
              label: type.replace('_', ' ').toUpperCase(),
              tier: 'TINGGI' as const,
              icon: AlertOctagon,
              color: 'text-gray-600 bg-gray-50 border-gray-200',
            };
            const Icon = meta.icon;
            const percentOfTop5 = ((count / totalTop5) * 100).toFixed(1);

            return (
              <div
                key={type}
                className="py-3 flex items-center justify-between text-xs hover:bg-[#EEEEEE]/40 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-md font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                      index === 0
                        ? 'bg-[#334257] text-white shadow-xs'
                        : index === 1
                        ? 'bg-[#476072] text-white'
                        : index === 2
                        ? 'bg-[#548CA8] text-white'
                        : 'bg-[#EEEEEE] text-[#476072]'
                    }`}
                  >
                    #{index + 1}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-4 h-4 text-[#476072] shrink-0" />
                    <span className="font-bold text-[#1A202C] truncate">{meta.label}</span>
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-sm border ${meta.color} hidden sm:inline`}>
                      {meta.tier}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <span className="font-black text-[#1A202C]">{count.toLocaleString()}</span>{' '}
                  <span className="text-[11px] text-[#476072]">kasus</span>{' '}
                  <span className="text-[10px] text-[#548CA8] font-bold">({percentOfTop5}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer summary */}
      <div className="p-3 rounded-xl bg-[#EEEEEE] border border-[#D8E0E7] flex items-center justify-between text-xs text-[#476072] mt-2">
        <span>Total kasus dari Top 5:</span>
        <span className="font-mono font-black text-[#334257]">
          {totalTop5.toLocaleString()} insiden
        </span>
      </div>
    </div>
  );
};
