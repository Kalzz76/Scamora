import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Lock, EyeOff, Server, CheckCircle2 } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [agreed, setAgreed] = useState(false);

  // Lock background body scroll whenever popup is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.08 }}
            className="relative w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-surface-container bg-surface-container-low">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="privacy-modal-title" className="text-base font-bold text-on-surface">
                    Pemberitahuan Transparansi Privasi &amp; Penggunaan AI
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono">Standar Keamanan &amp; Etika AI Digital</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-on-surface-variant leading-relaxed">
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container flex items-start gap-3">
                <Lock className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Prinsip Minimasi Data &amp; Zero Plaintext Retention</h4>
                  <p>
                    Platform Scamora dirancang dengan standar privasi ketat. Kami <strong>tidak pernah menyimpan teks mentah percakapan WhatsApp atau alamat tautan masukan pengguna</strong> ke dalam basis data permanen maupun berkas catatan (log) sistem.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-on-surface uppercase font-mono tracking-wider text-[11px]">
                  Mekanisme Perlindungan Data Anda:
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-surface-container bg-surface-container-lowest">
                    <div className="flex items-center gap-2 font-semibold text-on-surface mb-1">
                      <EyeOff className="w-4 h-4 text-emerald-600" />
                      <span>Masking Data Pribadi (PII)</span>
                    </div>
                    <p className="text-[11px]">
                      Nomor HP, rekening bank, NIK, alamat email, dan kode OTP otomatis disamarkan sebelum dianalisis oleh modul AI.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-surface-container bg-surface-container-lowest">
                    <div className="flex items-center gap-2 font-semibold text-on-surface mb-1">
                      <Server className="w-4 h-4 text-secondary" />
                      <span>Sanitasi Kredensial URL</span>
                    </div>
                    <p className="text-[11px]">
                      Kredensial login (user:pass@) dan token rahasia pada parameter tautan dihapus sebelum pemeriksaan reputasi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <h4 className="font-bold text-amber-900 text-xs">Batasan Kemampuan &amp; Tanggung Jawab:</h4>
                <ul className="list-disc pl-4 space-y-1 text-amber-800 text-[11px]">
                  <li>Hasil analisis merupakan indikasi risiko, bukan vonis mutlak hukum atau jaminan kepastian.</li>
                  <li>Sistem tidak membuka atau mengunduh isi server tujuan URL secara aktif demi keamanan.</li>
                  <li>Data demo yang disediakan adalah data rekayasa fiktif untuk tujuan edukasi.</li>
                </ul>
              </div>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-surface-container bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-outline text-secondary focus:ring-secondary w-4 h-4"
                />
                <span className="text-xs text-on-surface font-medium select-none">
                  Saya memahami bahwa teks atau URL yang saya masukkan akan diproses untuk ekstraksi tanda bahaya, dan saya telah menyamarkan informasi pribadi rahasia milik saya.
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-surface-container bg-surface-container-low flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={handleConfirm}
                type="button"
                disabled={!agreed}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  agreed
                    ? 'bg-secondary text-white hover:bg-secondary-container hover:shadow'
                    : 'bg-surface-container-high text-outline cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Saya Setuju &amp; Lanjutkan</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
