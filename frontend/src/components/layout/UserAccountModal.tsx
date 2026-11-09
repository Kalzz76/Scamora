import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  LogOut, 
  Shield, 
  X, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    username: string;
    name?: string;
    role?: string;
    tier?: string;
  } | null;
  onLogout: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const initialLetter = (user.name || user.username || 'U')[0].toUpperCase();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#14161c]/55 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E3E0DA] z-10 space-y-5"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* User Info Header */}
          <div className="flex items-center gap-3.5 pt-1 text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0f9b8a] to-[#143826] text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
              {initialLetter}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-[#14161c] truncate">
                  {user.name || user.username}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wide shrink-0">
                  {user.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
              <p className="text-xs text-[#64748b] font-mono truncate mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#0f9b8a]" />
                <span>@{user.username}</span>
              </p>
            </div>
          </div>

          <div className="h-px bg-[#e2ded7]" />

          {/* Menu Items */}
          <div className="space-y-2">
            {/* Profil Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/profil');
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#faf8f5] hover:bg-[#f3efe8] border border-[#e8e4dc] transition group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#d9d6d0] text-[#0f9b8a] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#14161c] group-hover:text-[#0f9b8a] transition-colors">
                    Profil Saya
                  </div>
                  <div className="text-[11px] text-[#64748b]">
                    Kelola data akun & preferensi
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#0f9b8a] transition-colors" />
            </button>

            {/* Panel Admin (Only if Admin) */}
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/admin');
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#faf8f5] hover:bg-[#f3efe8] border border-[#e8e4dc] transition group cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#334257] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Shield className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#14161c] group-hover:text-[#334257] transition-colors">
                      Panel Admin
                    </div>
                    <div className="text-[11px] text-[#64748b]">
                      Kelola sistem & keamanan Scamora
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#334257] transition-colors" />
              </button>
            )}

            {/* Keluar Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 transition group cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-rose-200 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <LogOut className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-700">
                    Keluar dari Akun
                  </div>
                  <div className="text-[11px] text-rose-500">
                    Akhiri sesi login di perangkat ini
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
