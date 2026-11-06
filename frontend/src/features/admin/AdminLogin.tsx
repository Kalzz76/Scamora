import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, ArrowRight, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminAuth } from './context/AdminAuthContext';

export const AdminLogin: React.FC = () => {
  const { login, quickLogin } = useAdminAuth();
  const [email, setEmail] = useState('admin@scamora.ai');
  const [pin, setPin] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, pin);
      if (success) {
        toast.success('Otentikasi Berhasil. Selamat datang di Panel Admin Scamora!');
      } else {
        toast.error('Kredensial tidak valid. Gunakan PIN: admin123 atau klik Masuk Cepat Demo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card Header & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#143826] to-[#22573B] text-white shadow-xl shadow-emerald-950/10 mb-4 border border-emerald-800/20">
            <ShieldCheck className="w-9 h-9 text-[#E86A33]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#143826] tracking-tight">
            Scamora Security Suite
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Konsol Operasi Intelijen Ancaman Siber &amp; Tata Kelola Konten
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-card border border-gray-100">
          <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Otentikasi Administrator
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EAF2ED] text-[#143826]">
              <Lock className="w-3 h-3" />
              Role-Based Access
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Operator
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@scamora.ai"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#143826] focus:outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Kunci Akses / PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#143826] focus:outline-hidden transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#143826] hover:bg-[#1D4E36] active:scale-[0.99] text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/15 disabled:opacity-50"
            >
              {loading ? (
                <span>Memvalidasi Sesi...</span>
              ) : (
                <>
                  <span>Buka Konsol Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access for MIT-Week Jury / Evaluators */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#E86A33]" />
              <span>Akses Cepat Pengujian (Juri &amp; Reviewer):</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  quickLogin('admin');
                  toast.success('Masuk sebagai Administrator Utama!');
                }}
                className="py-2.5 px-3 rounded-xl bg-[#FDF0E9] hover:bg-[#F9DEC9] text-[#B44616] text-xs font-bold transition flex items-center justify-center gap-1.5 border border-[#E86A33]/20"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  quickLogin('moderator');
                  toast.success('Masuk sebagai Moderator Keamanan!');
                }}
                className="py-2.5 px-3 rounded-xl bg-[#EAF2ED] hover:bg-[#D5E6DC] text-[#143826] text-xs font-bold transition flex items-center justify-center gap-1.5 border border-[#143826]/20"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Moderator</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Zero-Retention Disclaimer */}
        <div className="mt-5 text-center flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
          <ShieldAlert className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Privasi Zero-Retention Aktif &bull; Audit Trail Terisolasi</span>
        </div>
      </div>
    </div>
  );
};
