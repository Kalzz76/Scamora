import React, { useState } from 'react';
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
  Cpu,
  Bot,
  User,
} from 'lucide-react';
import type {
  ChallengeCategory,
  ChallengeScenario,
  DifficultyLevel,
  UserChallengeStatistics,
} from '../../../types/challenge';

interface ChallengeDashboardProps {
  categories: ChallengeCategory[];
  scenarios: ChallengeScenario[];
  selectedCategoryId: string;
  onSelectCategory: (catId: string) => void;
  selectedDifficulty: DifficultyLevel;
  onSelectDifficulty: (diff: DifficultyLevel) => void;
  selectedScenarioId: string | null;
  onStartSimulation: () => void;
  onGenerateAiScenario: (topicPrompt?: string) => void;
  isGeneratingAi: boolean;
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
  scenarios,
  selectedCategoryId,
  onSelectCategory,
  selectedDifficulty,
  onSelectDifficulty,
  selectedScenarioId,
  onStartSimulation,
  onGenerateAiScenario,
  isGeneratingAi,
  statistics,
  isLoading,
}) => {
  const [showAiInput, setShowAiInput] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const handleTriggerGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateAiScenario(customTopic.trim() || undefined);
  };

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
          <span className="text-xs text-on-surface-variant hidden sm:inline">
            Kasus berbasis tren kejahatan siber Indonesia
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                type="button"
                className={`text-left p-4 rounded-2xl border transition-all space-y-2 group ${
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
          <span className="text-[11px] text-on-surface-variant hidden sm:inline font-medium">
            Pilih level untuk memulai simulasi interaktif
          </span>
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
              className={`p-4 rounded-2xl border text-left transition-all group space-y-2 shadow-xs disabled:opacity-60 ${
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

      {/* SCENARIO DETAIL & LAUNCH CARD */}
      {currentScenario ? (
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#E86A33]">
                Skenario Terpilih:
              </span>
              <h3 className="text-lg sm:text-xl font-black text-on-surface">
                {currentScenario.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-surface-container font-mono text-[11px] font-bold uppercase text-on-surface-variant">
                {currentScenario.difficulty}
              </span>
              {currentScenario.isAiGenerated && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 font-mono text-[11px] font-bold uppercase">
                  AI Generated
                </span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm shadow-xs shrink-0 text-emerald-900">
                {currentScenario.characterAvatar ? currentScenario.characterAvatar : <User className="w-4 h-4 text-emerald-800" />}
              </div>
              <div>
                <span className="text-xs font-bold text-on-surface block">
                  {currentScenario.characterName}
                </span>
                <span className="text-[10px] text-on-surface-variant block">
                  {currentScenario.characterRole}
                </span>
              </div>
            </div>

            <div className="pt-2 text-xs text-on-surface font-medium leading-relaxed italic border-t border-surface-container">
              "{currentScenario.initialDialogue[0]?.text || 'Menunggu pesan...'}"
            </div>
          </div>

          {/* Learning Focus Preview */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-on-surface block uppercase tracking-wider font-mono">
              Target Literasi Keamanan:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentScenario.redFlags.map((rf) => (
                <div
                  key={rf.id}
                  className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E86A33] shrink-0 mt-1.5" />
                  <div>
                    <span className="font-bold block">{rf.title}</span>
                    <span className="text-[10px] text-on-surface-variant line-clamp-1">
                      {rf.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions & AI Generation Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={onStartSimulation}
              disabled={isLoading || isGeneratingAi}
              type="button"
              className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-[#143826] hover:bg-[#1D4E36] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60"
            >
              <Play className="w-4 h-4 text-[#E86A33] fill-[#E86A33]" />
              <span>{isLoading ? 'tunggu sebentar yahh...' : 'Mulai Simulasi Interaktif'}</span>
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </button>

            <button
              onClick={() => setShowAiInput(!showAiInput)}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-[#143826]/30 bg-[#143826]/5 hover:bg-[#143826]/10 text-[#143826] font-bold text-xs transition-all"
            >
              <Cpu className="w-4 h-4 text-[#0D9488]" />
              <span>{showAiInput ? 'Tutup Generator AI' : 'Buat Kasus Baru via Gemini AI'}</span>
            </button>
          </div>

          {/* AI Generator Input Drawer */}
          {showAiInput && (
            <form onSubmit={handleTriggerGenerate} className="p-4 rounded-2xl bg-[#143826]/5 border border-[#143826]/15 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#0D9488]" />
                <span className="text-xs font-bold text-on-surface">
                  Google Gemini Scenario Generator
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Ketik topik penipuan spesifik yang ingin di-generate oleh Gemini (atau biarkan kosong untuk topik otomatis):
              </p>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Misal: Surat Undangan Nikah APK, Tilang ETLE, Hadiah Shopee..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-surface-container text-xs text-on-surface placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#143826]"
                />
                <button
                  type="submit"
                  disabled={isGeneratingAi}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold text-xs transition-all shadow-xs disabled:opacity-60"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{isGeneratingAi ? 'tunggu sebentar yahh...' : 'Generate Sekarang'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-dashed border-surface-container text-center space-y-2">
          <p className="text-xs text-on-surface-variant">
            Pilih kategori di atas untuk memuat skenario simulasi.
          </p>
        </div>
      )}
    </div>
  );
};
