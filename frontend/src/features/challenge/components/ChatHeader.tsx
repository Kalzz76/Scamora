import React from 'react';
import { ArrowLeft, ShieldAlert, PhoneOff } from 'lucide-react';
import type { ChallengeScenario } from '../../../types/challenge';

interface ChatHeaderProps {
  scenario: ChallengeScenario;
  onAbandon: () => void;
  currentScore: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  scenario,
  onAbandon,
  currentScore,
}) => {
  return (
    <div className="bg-[#143826] text-white px-4 py-3 sm:px-6 flex items-center justify-between border-b border-[#1D4E36] rounded-t-3xl shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onAbandon}
          type="button"
          title="Keluar dari sesi simulasi"
          className="p-1.5 -ml-1 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Character Avatar with Pulsing Status Indicator */}
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shrink-0 shadow-inner">
            {scenario.characterAvatar || '👤'}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 border-2 border-[#143826] rounded-full animate-pulse" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-white tracking-tight line-clamp-1">
              {scenario.characterName}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <ShieldAlert className="w-3 h-3" />
              <span>
                {scenario.difficulty === 'easy' ? 'Pemula' : scenario.difficulty === 'medium' ? 'Menengah' : 'Mahir'}
              </span>
            </span>
            {scenario.isAiGenerated ? (
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                ✨ Gemini AI Live
              </span>
            ) : (
              <span
                className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold"
                title="Skenario kurasi lokal aktif. Tambahkan GEMINI_API_KEY di backend/.env untuk generate live AI."
              >
                Skenario Kurasi
              </span>
            )}
          </div>
          <span className="text-xs text-gray-300 line-clamp-1">
            {scenario.title} &bull; <span className="text-amber-300/90 font-medium">{scenario.characterRole}</span>
          </span>
        </div>
      </div>

      {/* Safety Score Meter */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] uppercase font-mono tracking-wider text-gray-300">Skor Pertahanan</span>
          <span className="text-sm font-black font-mono text-[#E86A33]">
            {currentScore}/100
          </span>
        </div>

        <button
          onClick={onAbandon}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-200 border border-white/10 text-xs font-semibold transition-all"
        >
          <PhoneOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Akhiri Sesi</span>
        </button>
      </div>
    </div>
  );
};
