import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, Loader2 } from 'lucide-react';

interface StepperProps {
  type: 'url' | 'chat';
}

export const Stepper: React.FC<StepperProps> = ({ type }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = type === 'url' ? [
    { title: 'Sanitasi & Format Input', desc: 'Menghapus kredensial login & token sensitif' },
    { title: 'Heuristik Struktur Domain', desc: 'Memindai typosquatting, homograf punycode, & TLD' },
    { title: 'Cross-Check Safe Browsing', desc: 'Mencocokkan ke basis data ancaman phishing' },
    { title: 'Kalkulasi Skor Risiko', desc: 'Menghitung bobot indikator unik & rekomendasi' },
  ] : [
    { title: 'Pembersihan Data Pribadi (PII)', desc: 'Menyamarkan nomor telepon, rekening, NIK, & OTP' },
    { title: 'Pemindaian Pola Rekayasa Sosial', desc: 'Mendeteksi indikasi uang muka, urgensi, & modus' },
    { title: 'Penalaran Semantik AI Claude', desc: 'Mengekstrak kalimat bukti & intent percakapan' },
    { title: 'Verifikasi Bukti & Skor Akhir', desc: 'Menyaring kutipan halusinasi & kalkulasi risiko' },
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 300);
    const timer2 = setTimeout(() => setCurrentStep(2), 650);
    const timer3 = setTimeout(() => setCurrentStep(3), 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-surface-container-lowest rounded-3xl border border-surface-container shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-surface-container">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-container text-secondary font-mono text-[11px] font-bold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>DIAGNOSTIC TELEMETRY PIPELINE</span>
          </div>
          <h3 className="text-lg font-extrabold text-on-surface">
            {type === 'url' ? 'Memeriksa Keamanan Tautan URL...' : 'Menganalisis Teks Percakapan WhatsApp...'}
          </h3>
        </div>
        <span className="font-mono text-xs text-on-surface-variant">Step {currentStep + 1} of 4</span>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          return (
            <div
              key={idx}
              className={`flex items-start gap-4 p-3.5 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-surface-container/60 border-secondary shadow-xs scale-[1.01]'
                  : isDone
                  ? 'bg-surface-container-low/40 border-surface-container opacity-85'
                  : 'bg-transparent border-transparent opacity-40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-secondary text-white'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {isDone ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="font-mono text-xs font-bold">{idx + 1}</span>
                )}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-on-surface">{step.title}</h4>
                <p className="text-xs text-on-surface-variant">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center gap-2 text-[11px] text-on-surface-variant">
        <Shield className="w-4 h-4 text-secondary shrink-0" />
        <span>Pemrosesan mematuhi aturan privasi: Tanpa unduhan konten aktif & tanpa retensi teks.</span>
      </div>
    </div>
  );
};
