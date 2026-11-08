import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth } from '../../services/adminAuth';
import adminBgLight from '../../assets/admin-bg.jpg';
import adminBgDark from '../../assets/admin-bg-dark.jpg';
import { useTheme } from '../../services/themeContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  useEffect(() => {
    if (adminAuth.isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Nama pengguna wajib diisi.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminAuth.login(username, password);
      if (res.success) {
        toast.success('Autentikasi berhasil! Mengakses Command Center...');
        navigate('/', { replace: true });
      } else {
        setErrorMessage(res.error || 'Autentikasi gagal. Periksa kembali akun Anda.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat memverifikasi sesi admin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage(null);
    toast.info('Kredensial demo terisi (admin / admin123)');
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 font-sans overflow-hidden">
      {/* Blurred City Landscape Ambient Background specifically for Admin Login */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <img
          src={isDark ? adminBgDark : adminBgLight}
          alt=""
          aria-hidden="true"
          className={`w-full h-full object-cover filter blur-[8px] scale-105 transition-all duration-700 ${
            isDark ? 'opacity-90 brightness-95' : 'opacity-85 brightness-100'
          }`}
        />
        {/* Soft Translucent Frosted Glass Wash */}
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            isDark ? 'bg-[#0B0F17]/50 backdrop-blur-[2px]' : 'bg-white/45 backdrop-blur-[2px]'
          }`}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D8E0E7] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#334257]">
              Security Clearance Level 1
            </span>
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-2">
            <div className="w-10 h-10 rounded-2xl bg-[#334257] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#548CA8]" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-[#334257] tracking-tight leading-none">
                Scamora <span className="text-[#548CA8]">Admin</span>
              </h1>
              <p className="text-[11px] text-[#476072] font-mono">
                Command &amp; Control Center
              </p>
            </div>
          </div>
          <p className="text-xs text-[#5E6D7E] max-w-xs mx-auto">
            Masuk dengan otentikasi petugas untuk mengelola telemetri, model AI, dan preset verifikasi penipuan.
          </p>
        </div>

        {/* Card Box */}
        <div className="glass-panel rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#D8E0E7] pb-4">
            <h2 className="text-base font-bold text-[#1A202C] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#548CA8]" />
              Masuk Portal Pengawas
            </h2>
            <p className="text-[11px] text-[#5E6D7E] mt-0.5">
              Masukkan kredensial resmi administrator Scamora
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="username"
                className="block text-xs font-bold text-[#334257] uppercase font-mono tracking-wider"
              >
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E6D7E]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#D8E0E7] rounded-xl text-xs text-[#1A202C] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#548CA8]/40 focus:border-[#548CA8] transition font-mono"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-[#334257] uppercase font-mono tracking-wider"
                >
                  Kata Sandi (Password)
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E6D7E]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#D8E0E7] rounded-xl text-xs text-[#1A202C] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#548CA8]/40 focus:border-[#548CA8] transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5E6D7E] hover:text-[#334257] transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#334257] hover:bg-[#242F3E] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Otorisasi...</span>
                </>
              ) : (
                <>
                  <span>Buka Akses Panel Admin</span>
                  <ArrowRight className="w-4 h-4 text-[#548CA8]" />
                </>
              )}
            </button>
          </form>

          {/* Demo Helper Box */}
          <div className="pt-2">
            <div className="p-3.5 rounded-2xl bg-[#F0F4F7] border border-[#D8E0E7] space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#334257] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#548CA8]" />
                  Akses Cepat Pengujian (Evaluasi Juri)
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[10px] font-bold text-[#548CA8] hover:text-[#334257] underline underline-offset-2 cursor-pointer font-mono"
                >
                  Gunakan Akun Ini
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#476072]">
                <span className="px-2 py-0.5 rounded bg-white border border-[#D8E0E7]">
                  User: <strong>admin</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-[#D8E0E7]">
                  Pass: <strong>admin123</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footnote */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-[11px] text-[#5E6D7E] flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Koneksi TLS Terproteksi &bull; Sesi token kedaluwarsa dalam 24 jam
          </p>
          <p className="text-[10px] text-[#94A3B8] font-mono">
            Scamora Cyber-Defense &bull; MIT-Week 2026 Challenge
          </p>
        </div>
      </div>
    </div>
  );
};
