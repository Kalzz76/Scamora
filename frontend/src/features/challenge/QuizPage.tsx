import React, { useState } from 'react';
import { HelpCircle, Zap, MessageSquare } from 'lucide-react';
import { GuardianChallengeContainer } from './GuardianChallengeContainer';
import { TieredQuizModule } from './components/TieredQuizModule';

export const QuizPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'classic'>('simulation');

  return (
    <div className="flex flex-col w-full pb-16">
      {/* HEADER BANNER - Pomaii Deep Green Style */}
      <section className="w-full bg-[#143826] text-white py-10 sm:py-12 border-b border-[#1D4E36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2ED] text-[#143826] font-mono text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-[#E86A33]" />
            <span>Guardian Challenge AI &bull; P1 Interactive Education</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Tantangan Deteksi Modus Penipuan Digital
          </h1>
          <p className="text-sm text-gray-200 max-w-3xl leading-relaxed">
            Uji literasi keamanan siber Anda melalui simulasi studi kasus penipuan nyata dan kuis bertahap. Dapatkan umpan balik instan beserta alasan ilmiah di balik setiap keputusan.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('simulation')}
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'simulation'
                  ? 'bg-[#E86A33] text-white shadow-md'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Simulasi Interaktif AI (Chat Simulator)</span>
            </button>
            <button
              onClick={() => setActiveTab('classic')}
              type="button"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'classic'
                  ? 'bg-[#E86A33] text-white shadow-md'
                  : 'bg-white/10 text-gray-200 hover:bg-white/20'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Kuis Bertingkat (Pemula &bull; Menengah &bull; Sulit)</span>
            </button>
          </div>
        </div>
      </section>

      {/* WORKSPACE */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'simulation' ? (
          <GuardianChallengeContainer />
        ) : (
          <TieredQuizModule />
        )}
      </div>
    </div>
  );
};

