import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import type { DecisionNode, DecisionOption } from '../../../types/challenge';

interface DecisionPanelProps {
  decisionNode: DecisionNode | null;
  onSelectOption: (optionId: string) => void;
  isLoading: boolean;
  selectedOptionId: string | null;
  lastFeedback: {
    isSafe: boolean;
    explanation: string;
  } | null;
  onContinue: () => void;
  isCompleted: boolean;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  decisionNode,
  onSelectOption,
  isLoading,
  selectedOptionId,
  lastFeedback,
  onContinue,
  isCompleted,
}) => {
  if (!decisionNode && !lastFeedback) {
    return null;
  }

  return (
    <div className="p-4 sm:p-5 bg-surface-container-lowest border-t border-surface-container rounded-b-3xl space-y-4">
      {/* If feedback exists, show the educational explanation box first */}
      {lastFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border space-y-2 ${
            lastFeedback.isSafe
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-950'
              : 'bg-red-500/10 border-red-500/25 text-red-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {lastFeedback.isSafe ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="font-bold text-xs uppercase tracking-wider font-mono">
              {lastFeedback.isSafe ? 'Keputusan Tepat & Aman' : 'Keputusan Berisiko (Rentang Bahaya)'}
            </span>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed font-medium">
            {lastFeedback.explanation}
          </p>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onContinue}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143826] hover:bg-[#1D4E36] text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>{isCompleted ? 'Lihat Laporan Lengkap' : 'Lanjutkan Percakapan'}</span>
              <ArrowRight className="w-4 h-4 text-[#E86A33]" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Decision prompt & options */}
      {!lastFeedback && decisionNode && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E86A33]" />
            <h4 className="text-xs sm:text-sm font-bold text-on-surface">
              {decisionNode.prompt}
            </h4>
          </div>

          <div className="space-y-2.5">
            {decisionNode.options.map((opt: DecisionOption, idx: number) => {
              const isSelected = selectedOptionId === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => onSelectOption(opt.id)}
                  disabled={isLoading || selectedOptionId !== null}
                  type="button"
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 group ${
                    isSelected
                      ? 'border-[#143826] bg-[#143826]/5 shadow-sm'
                      : 'border-surface-container bg-surface-container-low/40 hover:bg-surface-container hover:border-surface-container-high'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <span className="w-6 h-6 rounded-lg bg-surface-container group-hover:bg-[#143826] group-hover:text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <div className="flex-1">
                    <span className="text-xs sm:text-[13px] font-semibold text-on-surface leading-snug">
                      {opt.label}
                    </span>
                    {opt.description && (
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
                        {opt.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
