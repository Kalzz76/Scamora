import React, { useState } from 'react';
import { Sliders, Check, RefreshCw, X } from 'lucide-react';
import { analysisService } from '../../services/analysisService';
import type { SimulationMode } from '../../types/api';

interface SimPanelProps {
  onModeChange?: (mode: SimulationMode) => void;
}

export const SimPanel: React.FC<SimPanelProps> = ({ onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<SimulationMode>(analysisService.getSimulationMode());

  const modes: { id: SimulationMode; label: string; desc: string }[] = [
    { id: 'normal', label: 'Mode Normal (Standar)', desc: 'Semua heuristik & layanan berjalan lancar.' },
    { id: 'reputation_failed', label: 'Reputasi Gagal (Safe Browsing Offline)', desc: 'Simulasi kegagalan eksternal, status berubah ke partial.' },
    { id: 'ai_failed', label: 'AI Claude Gagal (Timeout/500)', desc: 'Analisis semantik gagal, mengandalkan pemindaian regex.' },
    { id: 'all_failed', label: 'Semua Layanan Eksternal Gagal', desc: 'Hanya heuristik lokal browser yang aktif.' },
    { id: 'rate_limited', label: 'HTTP 429 Rate Limited', desc: 'Simulasi melebihi batas 10 request per menit.' },
    { id: 'pipeline_failed', label: 'HTTP 503 Service Unavailable', desc: 'Simulasi kegagalan pipa analisis menyeluruh.' },
  ];

  const handleSelect = (mode: SimulationMode) => {
    setCurrentMode(mode);
    analysisService.setSimulationMode(mode);
    if (onModeChange) onModeChange(mode);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-highest/90 hover:bg-surface-container-high text-on-surface border border-surface-container shadow-lg backdrop-blur-md text-xs font-mono transition-all hover:scale-105"
        >
          <Sliders className="w-3.5 h-3.5 text-secondary" />
          <span>DEMO CONTROL: {currentMode.toUpperCase()}</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container p-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-secondary" />
              <h4 className="text-xs font-bold text-on-surface font-mono">Panel Uji Skenario Kegagalan</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-on-surface-variant mb-3">
            Gunakan kontrol ini untuk mendemokan ketahanan transparansi sistem saat terjadi gangguan jaringan atau pembatasan kuota API:
          </p>

          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start justify-between gap-2 ${
                  currentMode === m.id
                    ? 'border-secondary bg-surface-container text-on-surface font-semibold shadow-xs'
                    : 'border-surface-container bg-surface-container-low/50 hover:bg-surface-container text-on-surface-variant'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-xs text-on-surface">{m.label}</div>
                  <div className="text-[10px] text-on-surface-variant leading-tight">{m.desc}</div>
                </div>
                {currentMode === m.id && <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />}
              </button>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-surface-container flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>Simulasi Pengujian Sistem AI</span>
            <button
              onClick={() => handleSelect('normal')}
              className="text-secondary font-semibold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Normal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
