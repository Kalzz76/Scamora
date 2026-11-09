import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, LogIn, UserPlus, X, CheckCircle2, Sparkles } from 'lucide-react';

interface GuestQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestQuotaModal: React.FC<GuestQuotaModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#14161c]/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E3E0DA] z-10 space-y-6"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E86A33]/10 border border-[#E86A33]/20 flex items-center justify-center text-[#E86A33] shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#E86A33]">
                Kuota Tamu Habis
              </span>
              <h3 className="text-lg font-bold text-[#14161c] leading-tight font-['DM_Sans',sans-serif]">
                Batas Pemindaian Tercapai
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
            Kesempatan pemindaian gratis Anda telah digunakan. Daftar atau masuk ke akun Scamora untuk menikmati pemindaian tanpa batas.
          </p>

          {/* Value propositions */}
          <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#E3E0DA]/70 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#14161c]">
              <Sparkles className="w-3.5 h-3.5 text-[#0f9b8a]" />
              <span>Keuntungan memiliki akun terdaftar:</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-[#64748b]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pemindaian URL & pesan WhatsApp tanpa batas (unlimited)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Simpan riwayat pemindaian dan pantau histori secara pribadi</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Akses penuh simulasi Tantangan AI, Edukasi & Komunitas</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#14161c] hover:bg-[#2b2f3a] text-white font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/login?mode=register');
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Sekarang</span>
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] text-[#8c887b] hover:text-[#14161c] underline underline-offset-2 transition cursor-pointer"
            >
              Tutup & lihat hasil pemindaian sebelumnya
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

