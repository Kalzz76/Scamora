import React, { useState } from 'react';
import { Flag, CheckCircle2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import type { RedFlag } from '../../../types/challenge';

interface RedFlagTrackerProps {
  availableFlags: RedFlag[];
  identifiedFlagIds: string[];
  onToggleFlag: (flagId: string) => void;
}

export const RedFlagTracker: React.FC<RedFlagTrackerProps> = ({
  availableFlags,
  identifiedFlagIds,
  onToggleFlag,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-[#E86A33]/10 text-[#E86A33]">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-on-surface">
              Radar Indikator Bahaya (Red Flags)
            </span>
            <span className="text-[10px] text-on-surface-variant block">
              Tandai tanda mencurigakan yang Anda temukan di percakapan:
            </span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          type="button"
          className="p-1 text-on-surface-variant hover:text-on-surface"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {availableFlags.map((rf) => {
          const isSelected = identifiedFlagIds.includes(rf.id);

          return (
            <button
              key={rf.id}
              onClick={() => onToggleFlag(rf.id)}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-[#143826] text-white border-[#143826] shadow-xs'
                  : 'bg-surface-container-lowest text-on-surface border-surface-container hover:border-surface-container-high'
              }`}
            >
              {isSelected ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E86A33]" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-on-surface-variant" />
              )}
              <span>{rf.title}</span>
            </button>
          );
        })}
      </div>

      {expanded && (
        <div className="pt-2 border-t border-surface-container space-y-2 animate-in fade-in duration-200">
          {availableFlags.map((rf) => (
            <div key={rf.id} className="text-left text-xs bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-on-surface">{rf.title}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 uppercase">
                  {rf.severity}
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                {rf.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

