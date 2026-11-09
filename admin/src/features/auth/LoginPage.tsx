import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  UserPlus,
  BadgeCheck,
  LogIn,
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
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
        toast.success(`Selamat datang, ${res.user?.name || username}! Mengakses sistem...`);
        navigate('/admin', { replace: true });
      } else {
        setErrorMessage(res.error || 'Autentikasi gagal. Periksa kembali akun Anda.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat memverifikasi sesi login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regFullName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Nama pengguna (username) wajib diisi.');
      return;
    }
    if (regUsername.trim().length < 3) {
      setErrorMessage('Username minimal 3 karakter.');
      return;
    }
    if (!regPassword) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminAuth.register({
        fullName: regFullName.trim(),
        username: regUsername.trim(),
        email: regEmail.trim() || undefined,
        password: regPassword,
      });

      if (res.success) {
        toast.success('Pendaftaran berhasil! Akun Anda aktif dengan status TERVERIFIKASI (Verified).');
        navigate('/admin', { replace: true });
      } else {
        setErrorMessage(res.error || 'Pendaftaran gagal. Periksa kembali formulir.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat memproses pendaftaran akun.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-3.5 sm:p-6 font-sans overflow-hidden">
      {/* Blurred City Landscape Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <img
          src={isDark ? adminBgDark : adminBgLight}
          alt=""
          aria-hidden="true"
          className={`w-full h-full object-cover filter blur-[8px] scale-105 transition-all duration-700 ${
            isDark ? 'opacity-90 brightness-95' : 'opacity-85 brightness-100'
          }`}
        />
        <div
          className={`absolute inset-0 transition-colors duration-700 ${
            isDark ? 'bg-[#0B0F17]/50 backdrop-blur-[2px]' : 'bg-white/45 backdrop-blur-[2px]'
          }`}
        />
      </div>

      {/* Back to Home Button - Fixed to Top Left Corner of Screen */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-[#D8E0E7] dark:border-slate-700 text-[#334257] dark:text-slate-200 hover:text-[#0f9b8a] dark:hover:text-emerald-400 text-xs font-bold shadow-sm hover:shadow-md transition-all hover:-translate-x-0.5 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md my-4">
        {/* Brand Header */}
        <div className="text-center mb-5 sm:mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-[#D8E0E7] dark:border-slate-700 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#334257] dark:text-slate-300">
              Scamora Security Portal
            </span>
          </div>

          <div className="flex items-center justify-center gap-2.5 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-[#334257] text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#548CA8]" />
            </div>
            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-black text-[#334257] dark:text-white tracking-tight leading-none">
                Scamora <span className="text-[#548CA8]">Auth</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-[#476072] dark:text-slate-400 font-mono">
                Portal Akses Pengguna Terverifikasi
              </p>
            </div>
          </div>
        </div>

        {/* Card Box */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-7 space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 rounded-2xl bg-[#E8EEF3] dark:bg-slate-800/80 border border-[#D8E0E7] dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-[#334257] dark:text-white shadow-xs'
                  : 'text-[#5E6D7E] dark:text-slate-400 hover:text-[#334257]'
              }`}
            >
              <LogIn className="w-4 h-4 text-[#548CA8]" />
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-[#334257] dark:text-white shadow-xs'
                  : 'text-[#5E6D7E] dark:text-slate-400 hover:text-[#334257]'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Daftar (Register)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold">
                Verified
              </span>
            </button>
          </div>

          {/* Form Header Info */}
          <div className="border-b border-[#D8E0E7] dark:border-slate-700 pb-3">
            <h2 className="text-sm font-bold text-[#1A202C] dark:text-white flex items-center gap-2">
              {authMode === 'login' ? (
                <>
                  <KeyRound className="w-4 h-4 text-[#548CA8]" />
                  <span>Masuk ke Akun Anda</span>
                </>
              ) : (
                <>
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  <span>Registrasi Akun Terverifikasi</span>
                </>
              )}
            </h2>
            <p className="text-[11px] text-[#5E6D7E] dark:text-slate-400 mt-0.5">
              {authMode === 'login'
                ? 'Gunakan akun terverifikasi Anda untuk mengakses sistem'
                : 'Pendaftaran otomatis memberikan tingkatan Pengguna Terverifikasi (Verified User)'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* ===================== FORM LOGIN ===================== */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1 text-left">
                <label
                  htmlFor="username"
                  className="block text-[11px] font-bold text-[#334257] dark:text-slate-300 uppercase font-mono tracking-wider"
                >
                  Nama Pengguna atau Email
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
                    placeholder="Nama pengguna atau email Anda"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-slate-900 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white placeholder-[#94A3B8] focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#548CA8]/40 focus:border-[#548CA8] transition font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold text-[#334257] dark:text-slate-300 uppercase font-mono tracking-wider"
                >
                  Kata Sandi (Password)
                </label>
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
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] dark:bg-slate-900 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white placeholder-[#94A3B8] focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#548CA8]/40 focus:border-[#548CA8] transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5E6D7E] hover:text-[#334257] transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

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
                    <span>Masuk ke Sistem</span>
                    <ArrowRight className="w-4 h-4 text-[#548CA8]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ===================== FORM REGISTER ===================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
                <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Akun Anda otomatis memperoleh tingkatan <strong>Terverifikasi (Verified)</strong>.</span>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-bold text-[#334257] dark:text-slate-300 uppercase font-mono tracking-wider">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#5E6D7E]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Contoh: Pratama Wicaksana"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] dark:bg-slate-900 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white placeholder-[#94A3B8] focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="block text-[11px] font-bold text-[#334257] dark:text-slate-300 uppercase font-mono tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="pratama_w"
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 bg-[#F8FAFC] dark:bg-slate-900 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white placeholder-[#94A3B8] focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition font-mono"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[11px] font-bold text-[#334257] dark:text-slate-300 uppercase font-mono tracking-wider">
                    Email (Opsional)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@email.com"
                      disabled={isLoading}
                      className="w-full px-3 py-2.5 bg-[#F8FAFC] dark:bg-slate-900 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white placeholder-[#94A3B8] focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 text-left">
                  <label className="block text-[11px] font-bold text-[#334257] dark:text-slate-300 uppercase font-mono tracking-wider">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 karakter"
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 bg-[#F8FAFC] dark:bg-slate-900 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white placeholder-[#94A3B8] focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition font-mono"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="block text-[11px] font-bold text-[#334257] dark:text-slate-300 uppercase font-mono tracking-wider">
                    Konfirmasi Sandi
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi sandi"
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 bg-[#F8FAFC] dark:bg-slate-900 border border-[#D8E0E7] dark:border-slate-700 rounded-xl text-xs text-[#1A202C] dark:text-white placeholder-[#94A3B8] focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mendaftarkan Akun Terverifikasi...</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4 text-emerald-200" />
                    <span>Daftar Akun Terverifikasi</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security Footnote */}
        <div className="text-center mt-5 space-y-1">
          <p className="text-[11px] text-[#5E6D7E] dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Enkripsi Kredensial Terproteksi &bull; Akun Terverifikasi (Verified)
          </p>
          <p className="text-[10px] text-[#94A3B8] font-mono">
            Scamora Cyber-Defense &bull; MIT-Week 2026 Challenge
          </p>
        </div>
      </div>
    </div>
  );
};
