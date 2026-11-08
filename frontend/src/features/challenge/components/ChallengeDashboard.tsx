import React from 'react';
import {
  ShieldAlert,
  Activity,
  Package,
  Landmark,
  Briefcase,
  FileWarning,
  Gift,
  ArrowRight,
  Shield,
  Play,
} from 'lucide-react';
import type {
  ChallengeCategory,
  DifficultyLevel,
  UserChallengeStatistics,
} from '../../../types/challenge';

interface ChallengeDashboardProps {
  categories: ChallengeCategory[];
  selectedCategoryId: string;
  onSelectCategory: (catId: string) => void;
  selectedDifficulty: DifficultyLevel;
  onSelectDifficulty: (diff: DifficultyLevel) => void;
  onStartSimulation: () => void;
  onGenerateAiScenario?: (topicPrompt?: string) => void;
  isGeneratingAi?: boolean;
  statistics: UserChallengeStatistics | null;
  isLoading: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'kurir-apk': <Package className="w-5 h-5 text-[#E86A33]" />,
  'bank-phishing': <Landmark className="w-5 h-5 text-[#E86A33]" />,
  'job-scam': <Briefcase className="w-5 h-5 text-[#E86A33]" />,
  'tilang-etle': <FileWarning className="w-5 h-5 text-[#E86A33]" />,
  'undian-belanja': <Gift className="w-5 h-5 text-[#E86A33]" />,
};

export const ChallengeDashboard: React.FC<ChallengeDashboardProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  selectedDifficulty,
  onSelectDifficulty,
  onStartSimulation,
  isGeneratingAi,
  statistics,
  isLoading,
}) => {
  return (
    <div className="space-y-8">
      {/* STATS HIGHLIGHT BAR */}
      {statistics && statistics.totalAttempts > 0 && (
        <div className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-on-surface-variant font-bold">
              Badge Pertahanan
            </span>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#143826]" />
              <span className="text-xs sm:text-sm font-bold text-on-surface truncate">
                {statistics.guardianBadge}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-on-surface-variant font-bold">
              Rata-Rata Skor
            </span>
            <span className="text-lg sm:text-xl font-black text-[#143826] font-mono block">
              {statistics.averageScore}/100
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-on-surface-variant font-bold">
              Simulasi Selesai
            </span>
            <span className="text-lg sm:text-xl font-black text-on-surface font-mono block">
              {statistics.completedAttempts} Sesi
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-on-surface-variant font-bold">
              Skor Tertinggi
            </span>
            <span className="text-lg sm:text-xl font-black text-[#E86A33] font-mono block">
              {statistics.highestScore} Poin
            </span>
          </div>
        </div>
      )}

      {/* CATEGORY SELECTOR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-on-surface flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0D9488]" />
            <span>Pilih Modus Penipuan yang Ingin Disimulasikan</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                type="button"
                className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all space-y-2 group ${
                  isSelected
                    ? 'border-[#143826] bg-[#143826]/5 shadow-sm ring-1 ring-[#143826]'
                    : 'border-surface-container bg-surface-container-lowest hover:border-surface-container-high'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                    {CATEGORY_ICONS[cat.id] || <ShieldAlert className="w-5 h-5 text-[#E86A33]" />}
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#143826]" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-on-surface line-clamp-1">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DIRECT LAUNCH BY DIFFICULTY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-[#E86A33] fill-[#E86A33]" />
            <h4 className="text-sm sm:text-base font-bold text-on-surface">
              Pilih Tingkat Kesulitan untuk Langsung Mulai Chat:
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              { level: 'easy', badge: 'Pemula', desc: 'Skenario dasar, red flag mencolok & jelas' },
              { level: 'medium', badge: 'Menengah', desc: 'Manipulasi psikologis halus & batas waktu' },
              { level: 'hard', badge: 'Mahir', desc: 'Domain spoofing canggih & social engineering tinggi' },
            ] as const
          ).map((item) => (
            <button
              key={item.level}
              onClick={() => onSelectDifficulty(item.level)}
              disabled={isLoading}
              type="button"
              className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all group space-y-2 shadow-xs disabled:opacity-60 ${
                selectedDifficulty === item.level
                  ? 'border-[#143826] bg-[#143826]/5 ring-1 ring-[#143826]'
                  : 'border-surface-container bg-surface-container-lowest hover:border-[#143826] hover:bg-[#143826]/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#143826]">
                  {item.badge}
                </span>
                <span className="w-6 h-6 rounded-lg bg-[#143826]/10 text-[#143826] group-hover:bg-[#E86A33] group-hover:text-white flex items-center justify-center transition-colors">
                  <Play className="w-3 h-3 fill-current" />
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {item.desc}
              </p>
              <span className="text-[11px] text-[#E86A33] font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Mulai Simulasi {item.badge}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* LAUNCH BAR */}
      <div className="pt-2 flex justify-start">
        <button
          onClick={onStartSimulation}
          disabled={isLoading || isGeneratingAi}
          type="button"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-[#143826] hover:bg-[#1D4E36] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
        >
          <Play className="w-4 h-4 text-[#E86A33] fill-[#E86A33]" />
          <span>{isLoading ? 'tunggu sebentar yahh...' : 'Mulai Simulasi Interaktif'}</span>
          <ArrowRight className="w-4 h-4 text-gray-300" />
        </button>
      </div>
    </div>
  );
};
