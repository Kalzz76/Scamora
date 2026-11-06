import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  ShieldCheck, 
  Target 
} from 'lucide-react';
import { motion } from 'motion/react';
import { GuardianChallengeContainer } from './GuardianChallengeContainer';
import { TieredQuizModule } from './components/TieredQuizModule';
import { QuizArenaIllustration } from '../../components/illustrations/Illustrations2D';

export const QuizPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'classic'>('simulation');

  return (
    <div className="flex flex-col w-full pb-16">
      {/* HEADER BANNER - Cyber Slate Theme with 2D Illustration */}
      <section className="w-full bg-[#0F172A] text-white py-10 sm:py-12 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-8 space-y-4 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-mono text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="font-semibold text-white">Guardian Challenge AI</span>
                <span className="text-slate-500">•</span>
                <span className="text-[#0D9488] font-bold">Simulasi Edukasi Interaktif</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Tantangan Deteksi <span className="text-[#0D9488]">Modus Penipuan</span> Digital
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Uji literasi keamanan siber Anda melalui simulasi studi kasus penipuan nyata WhatsApp dan kuis bertahap. Dapatkan umpan balik instan beserta evaluasi teknis di balik setiap keputusan.
              </p>

              {/* Mode Switcher Tabs */}
              <div className="pt-3 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('simulation')}
                  type="button"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'simulation'
                      ? 'bg-[#0D9488] text-white shadow-md shadow-teal-900/30 ring-2 ring-teal-400/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Simulasi Interaktif AI (Chat Simulator)</span>
                </button>
                <button
                  onClick={() => setActiveTab('classic')}
                  type="button"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'classic'
                      ? 'bg-[#0D9488] text-white shadow-md shadow-teal-900/30 ring-2 ring-teal-400/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Kuis Bertingkat (3 Level Kesulitan)</span>
                </button>
              </div>
            </motion.div>

            {/* Right Illustration */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="lg:col-span-4 flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-[280px] p-2 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm shadow-xl">
                <QuizArenaIllustration />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* WORKSPACE AREA */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'simulation' ? (
          <GuardianChallengeContainer />
        ) : (
          <TieredQuizModule />
        )}
      </div>
    </div>
  );
};
