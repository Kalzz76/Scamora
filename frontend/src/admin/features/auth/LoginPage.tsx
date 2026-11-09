import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth } from '../../services/adminAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectQuery = searchParams.get('redirect');
  const modeQuery = searchParams.get('mode');

  useEffect(() => {
    if (adminAuth.isAuthenticated()) {
      const user = adminAuth.getUser();
      if (redirectQuery) {
        navigate(redirectQuery, { replace: true });
      } else if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate, redirectQuery]);

  const [authMode, setAuthMode] = useState<'login' | 'register'>(
    modeQuery === 'register' ? 'register' : 'login'
  );
  
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
        toast.success(`Selamat datang, ${res.user?.name || username}!`);
        const target = redirectQuery || (res.user?.role === 'admin' ? '/admin' : '/dashboard');
        navigate(target, { replace: true });
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
    if (regPassword.length < 8) {
      setErrorMessage('Kata sandi minimal 8 karakter.');
      return;
    }
    const hasUniqueChar = /[^a-zA-Z0-9]/.test(regPassword);
    if (!hasUniqueChar) {
      setErrorMessage('Kata sandi harus mengandung minimal 1 karakter unik / simbol (contoh: @, #, $, %, !).');
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
        toast.success('Pendaftaran berhasil! Akun Anda telah aktif.');
        const target = redirectQuery || (res.user?.role === 'admin' ? '/admin' : '/dashboard');
        navigate(target, { replace: true });
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
    <div className="relative min-h-screen bg-[#faf8f5] text-[#14161c] flex flex-col justify-center items-center p-4 sm:p-6 font-['DM_Sans',sans-serif] selection:bg-[#0f9b8a]/20 overflow-hidden">
      {/* Background Vector Shapes: Desktop (16:9 Full Page - Elemen Pojok Kiri Atas & Pojok Kanan Bawah seperti Beranda) */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none select-none overflow-hidden z-0" aria-hidden="true">
        <svg viewBox="0 0 1847 852" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          {/* Pojok Kiri Atas Shapes */}
          <path d="M0 0H440L380 120Q365 134 345 134H0Z" fill="#2b2f3a" />
          <path d="M440 0H545L470 134H380Z" fill="#e9e8e6" />
          <path d="M0 134H250L0 270Z" fill="#8e98ab" opacity="0.7" />
          
          {/* Pojok Kanan Bawah Shapes */}
          <path d="M1847 300V852H1130Q1330 760 1500 640Q1640 540 1847 300Z" fill="#e9e8e6" opacity="0.8" />
          <path d="M1847 430V852H1450Q1460 780 1560 730Q1700 690 1750 560Q1790 470 1847 430Z" fill="#2b2f3a" />
          <path d="M1640 740Q1760 700 1847 720V852H1590Z" fill="#8e98ab" opacity="0.7" />
          
          {/* Ambient Contour Stroke */}
          <path d="M630 0Q560 120 330 175Q60 230 50 520Q47 620 0 700" fill="none" stroke="#8e98ab" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.6" />
        </svg>
      </div>

      {/* Background Vector Shapes: Mobile & Tablet (Pojok Kiri Atas & Pojok Kanan Bawah) */}
      <div className="lg:hidden absolute inset-0 pointer-events-none select-none overflow-hidden z-0" aria-hidden="true">
        <svg viewBox="0 0 400 850" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
          {/* Pojok Kiri Atas Mobile */}
          <path d="M0 0 H180 L140 70 Q125 80 105 80 H0 Z" fill="#2b2f3a" opacity="0.95" />
          <path d="M180 0 H235 L195 80 H140 Z" fill="#e9e8e6" />
          <path d="M0 80 H80 L0 150 Z" fill="#8e98ab" opacity="0.5" />

          {/* Pojok Kanan Bawah Mobile */}
          <path d="M400 520 V850 H190 Q260 760 330 670 Q370 600 400 520 Z" fill="#e9e8e6" opacity="0.75" />
          <path d="M400 610 V850 H270 Q325 785 360 720 Q385 660 400 610 Z" fill="#2b2f3a" />
          <path d="M400 735 V850 H330 Q370 805 400 735 Z" fill="#8e98ab" opacity="0.6" />

          {/* Dynamic Contour Stroke */}
          <path d="M260 0 Q190 160 100 290 Q30 390 45 560 Q65 680 0 760" fill="none" stroke="#8e98ab" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.45" />
        </svg>
      </div>

      {/* Brand in Top Left (Matching Home Page) */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center p-1 bg-white shadow-xs border border-slate-200/80 lg:border-transparent group-hover:scale-105 transition-transform">
            <img src="/Logo.png" alt="Scamora" className="w-full h-full object-contain" />
          </span>
          <span className="font-bold tracking-tight text-lg sm:text-xl leading-none text-[#14161c] lg:text-white drop-shadow-sm font-['DM_Sans',sans-serif]">
            Scamora
          </span>
        </Link>
      </div>

      {/* Back to Home Button - Top Right */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-white/95 hover:bg-white text-[#14161c] hover:text-[#0f9b8a] border border-[#d9d6d0] hover:border-[#0f9b8a] text-xs font-bold shadow-md hover:shadow-lg transition-all group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md my-6">
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#0f9b8a] text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#0f9b8a] animate-pulse" />
            <span>Portal Akses Akun</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#d9d6d0] shadow-xs p-1.5 flex items-center justify-center">
              <img src="/Logo.png" alt="Scamora Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black text-[#14161c] tracking-tight leading-none">
                Scamora
              </h1>
              <p className="text-[11px] text-[#64748b] font-medium mt-1">
                Perlindungan AI Cerdas Berbasis Komunitas
              </p>
            </div>
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-3xl border border-[#d9d6d0] shadow-sm p-5 sm:p-8 space-y-5">
          {redirectQuery && (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Akses Akun Diperlukan</span>
                <span className="text-[11px] text-amber-800 leading-relaxed">
                  Fitur yang Anda buka memerlukan akun terdaftar. Silakan masuk atau buat akun baru di bawah untuk melanjutkan.
                </span>
              </div>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 rounded-2xl bg-[#f1ede6] border border-[#e2ded7]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-[#0f9b8a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#14161c]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-[#0f9b8a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#14161c]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Akun</span>
            </button>
          </div>

          {/* Form Header Info */}
          <div className="border-b border-[#e2ded7] pb-3 text-left">
            <h2 className="text-sm font-bold text-[#14161c] flex items-center gap-2">
              {authMode === 'login' ? (
                <>
                  <KeyRound className="w-4 h-4 text-[#0f9b8a]" />
                  <span>Masuk ke Akun Anda</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-[#0f9b8a]" />
                  <span>Pendaftaran Akun Baru</span>
                </>
              )}
            </h2>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              {authMode === 'login'
                ? 'Gunakan kredensial Anda untuk masuk ke sistem'
                : 'Silakan lengkapi data berikut untuk membuat akun Scamora'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* ===================== FORM LOGIN ===================== */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="username"
                  className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider"
                >
                  Nama Pengguna atau Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
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
                    className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94a3b8] hover:text-[#14161c] transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi Otorisasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Akun</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ===================== FORM REGISTER ===================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Contoh: Pratama Wicaksana"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="pratama_w"
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@email.com"
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 8 karakter & 1 simbol"
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                    Konfirmasi Sandi
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi sandi"
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition font-mono"
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#64748b] text-left flex items-center gap-1.5 pt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f9b8a]" />
                <span>Kata sandi minimal 8 karakter dengan minimal 1 karakter unik / simbol (!@#$%^&*).</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mendaftarkan Akun Baru...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar Akun Baru</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security Footnote */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-[11px] text-[#64748b] flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0f9b8a]" />
            Enkripsi Kredensial Terproteksi &bull; Akses Aman
          </p>
          <p className="text-[10px] text-[#94a3b8] font-mono">
            Scamora Cyber-Defense &bull; MIT-Week 2026 Challenge
          </p>
        </div>
      </div>
    </div>
  );
};
