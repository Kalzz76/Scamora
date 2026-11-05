import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  XCircle,
  Activity,
  Layers,
} from 'lucide-react';
import type { ChallengeResult } from '../../../types/challenge';

interface ChallengeResultViewProps {
  result: ChallengeResult;
  onRestart: () => void;
  onBackToDashboard: () => void;
}

export const ChallengeResultView: React.FC<ChallengeResultViewProps> = ({
  result,
  onRestart,
  onBackToDashboard,
}) => {
  useEffect(() => {
    if (result.score >= 70) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#143826', '#E86A33', '#248a3d', '#ffd700'],
      });
    }
  }, [result.score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* SCORE BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm text-center space-y-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#143826] mx-auto flex items-center justify-center text-white shadow-md">
          {result.score >= 70 ? (
            <ShieldCheck className="w-10 h-10 text-[#E86A33]" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-amber-400" />
          )}
        </div>

        <div className="space-y-1.5">
          <span className="px-3 py-1 rounded-full bg-[#143826]/10 text-[#143826] font-mono text-xs font-bold uppercase tracking-wider">
            {result.categoryName} &bull; Selesai
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
            {result.safetyRating}
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            {result.feedbackSummary}
          </p>
        </div>

        {/* Score Counter Card */}
        <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-surface-container-low border border-surface-container">
          <div className="text-left">
            <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">
              Skor Pertahanan
            </span>
            <span className="text-3xl font-black text-[#143826] font-mono">
              {result.score}
              <span className="text-xs text-on-surface-variant font-normal">/100</span>
            </span>
          </div>

          <div className="h-8 w-px bg-surface-container-high" />

          <div className="text-left">
            <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">
              Red Flags Terdeteksi
            </span>
            <span className="text-base font-bold text-on-surface">
              {result.redFlagsDetected.length} dari {result.redFlagsDetected.length + result.redFlagsMissed.length}
            </span>
          </div>
        </div>
      </div>

      {/* PSYCHOLOGICAL VULNERABILITY INDEX */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#E86A33]" />
          <h3 className="text-base font-bold text-on-surface">
            Analisis Kerentanan Psikologis (Cyber-Hygiene Profile)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface">Ketahanan Tekanan Waktu / Urgensi</span>
              <span className="font-mono text-[#143826]">
                {result.vulnerabilityAssessment.urgencyResistance}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full bg-[#143826] rounded-full transition-all"
                style={{ width: `${result.vulnerabilityAssessment.urgencyResistance}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface">Ketahanan Klaim Otoritas Palsu</span>
              <span className="font-mono text-[#143826]">
                {result.vulnerabilityAssessment.authorityResistance}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full bg-[#143826] rounded-full transition-all"
                style={{ width: `${result.vulnerabilityAssessment.authorityResistance}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface">Ketahanan Imbalan Fantastis / Keserakahan</span>
              <span className="font-mono text-[#143826]">
                {result.vulnerabilityAssessment.greedResistance}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full bg-[#143826] rounded-full transition-all"
                style={{ width: `${result.vulnerabilityAssessment.greedResistance}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-on-surface">Ketelitian Inspeksi Teknis (URL/APK)</span>
              <span className="font-mono text-[#143826]">
                {result.vulnerabilityAssessment.technicalInspection}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full bg-[#143826] rounded-full transition-all"
                style={{ width: `${result.vulnerabilityAssessment.technicalInspection}%` }}
              />
            </div>
          </div>
        </div>

        {result.vulnerabilityAssessment.primaryVulnerability && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Titik Lemah Terdeteksi: </span>
              <span>{result.vulnerabilityAssessment.primaryVulnerability}. Latih ketenangan diri saat menerima pesan mendesak.</span>
            </div>
          </div>
        )}
      </div>

      {/* DECISION AUDIT TRAIL */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#143826]" />
          <h3 className="text-base font-bold text-on-surface">
            Evaluasi Rantai Keputusan Anda
          </h3>
        </div>

        <div className="space-y-3">
          {result.decisionsSummary.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border space-y-2 ${
                item.isSafe
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.isSafe ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-xs font-bold text-on-surface">
                    Langkah {idx + 1}: "{item.chosenLabel}"
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold ${
                    item.scoreImpact >= 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {item.scoreImpact >= 0 ? `+${item.scoreImpact}` : item.scoreImpact} Poin
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* LEARNING POINTS & ACTIONS */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#143826]" />
          <h3 className="text-base font-bold text-on-surface">
            Panduan Pembelajaran & Mitigasi Nyata
          </h3>
        </div>

        <ul className="space-y-2">
          {result.recommendations.map((rec, idx) => (
            <li
              key={idx}
              className="p-3 rounded-2xl bg-surface-container-low border border-surface-container text-xs text-on-surface leading-relaxed flex items-start gap-2.5 font-medium"
            >
              <span className="w-5 h-5 rounded-full bg-[#143826] text-white flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                {idx + 1}
              </span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            to="/panduan"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all"
          >
            <BookOpen className="w-4 h-4 text-[#143826]" />
            <span>Pelajari Panduan Respon Insiden</span>
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onRestart}
              type="button"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1D4E36] text-white text-xs font-bold transition-all shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-[#E86A33]" />
              <span>Coba Skenario Lain</span>
            </button>
            <button
              onClick={onBackToDashboard}
              type="button"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-surface-container text-xs font-bold text-on-surface hover:bg-surface-container transition-all"
            >
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
