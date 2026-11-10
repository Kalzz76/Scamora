import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Keluar Akun',
  description = 'Apakah Anda yakin ingin keluar dari akun Scamora? Sesi aktif Anda akan diakhiri dan tampilan akan kembali ke mode publik standar.',
  confirmText = 'Ya, Keluar Akun',
  cancelText = 'Batal',
  isSubmitting = false,
}) => {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={isSubmitting ? undefined : onClose}
            className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 z-10 space-y-5 text-left"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
              title="Tutup dialog"
              aria-label="Tutup dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: Icon + Title */}
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                <LogOut className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="space-y-1 pr-6">
                <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 inline-block">
                  Sesi Pengguna
                </span>
                <h3
                  id="logout-modal-title"
                  className="text-base sm:text-lg font-bold text-[#14161c] leading-tight font-['DM_Sans',sans-serif]"
                >
                  {title}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#4b5160] leading-relaxed">
              {description}
            </p>

            {/* Security notice pill */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-[#5E6D7E]">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Semua sesi verifikasi lokal akan diatur ulang secara aman.</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50 text-center"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 text-center"
              >
                <LogOut className="w-4 h-4" />
                <span>{isSubmitting ? 'Memproses...' : confirmText}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

