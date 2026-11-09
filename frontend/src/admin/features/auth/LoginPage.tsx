import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  UserPlus,
  LogIn,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth } from '../../services/adminAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectQuery = searchParams.get('redirect');
  const modeQuery = searchParams.get('mode');
  const googleTokenQuery = searchParams.get('google_token');
  const googleUsernameQuery = searchParams.get('username');
  const googleNameQuery = searchParams.get('name');
  const googleErrorQuery = searchParams.get('error');

  // Handle Google OAuth callback parameters on page mount
  useEffect(() => {
    if (googleErrorQuery) {
      setErrorMessage(decodeURIComponent(googleErrorQuery));
    } else if (googleTokenQuery && googleUsernameQuery) {
      const displayName = googleNameQuery ? decodeURIComponent(googleNameQuery) : googleUsernameQuery;
      adminAuth.setSession(googleTokenQuery, {
        username: googleUsernameQuery,
        name: displayName,
        role: 'user',
        tier: 'verified',
        authProvider: 'google',
      });
      toast.success(`Selamat datang, ${displayName}! Berhasil masuk dengan Akun Google.`);
      navigate(redirectQuery || '/dashboard', { replace: true });
    }
  }, [googleTokenQuery, googleUsernameQuery, googleNameQuery, googleErrorQuery, navigate, redirectQuery]);

  // Redirect if already authenticated
  useEffect(() => {
    if (adminAuth.isAuthenticated() && !googleTokenQuery) {
      const user = adminAuth.getUser();
      if (redirectQuery) {
        navigate(redirectQuery, { replace: true });
      } else if (user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [navigate, redirectQuery, googleTokenQuery]);

  const [authMode, setAuthMode] = useState<'login' | 'register'>(
    modeQuery === 'register' ? 'register' : 'login'
  );

  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(adminAuth.isRemembered());

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  // State status
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Password strength calculator
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200', textClass: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Sangat Lemah', color: 'bg-rose-500', textClass: 'text-rose-600' };
      case 2:
        return { score: 50, label: 'Lemah', color: 'bg-amber-500', textClass: 'text-amber-600' };
      case 3:
        return { score: 75, label: 'Sedang', color: 'bg-sky-500', textClass: 'text-sky-600' };
      case 4:
        return { score: 100, label: 'Kuat & Aman', color: 'bg-emerald-500', textClass: 'text-emerald-600' };
      default:
        return { score: 20, label: 'Sangat Lemah', color: 'bg-rose-400', textClass: 'text-rose-500' };
    }
  };

  const passStrength = calculatePasswordStrength(regPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMessage('Email atau nama pengguna wajib diisi.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminAuth.login(cleanUser, cleanPass, rememberMe);
      if (res.success) {
        toast.success(`Selamat datang kembali, ${res.user?.name || cleanUser}!`);
        const target = redirectQuery || (res.user?.role === 'admin' ? '/admin' : '/dashboard');
        navigate(target, { replace: true });
      } else {
        setErrorMessage(res.error || 'Autentikasi gagal. Periksa kembali akun Anda.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat memverifikasi kredensial login.');
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
    if (regFullName.trim().length < 2) {
      setErrorMessage('Nama lengkap minimal 2 karakter.');
      return;
    }

    const cleanUser = regUsername.trim().toLowerCase();
    if (!cleanUser) {
      setErrorMessage('Username wajib diisi.');
      return;
    }
    if (cleanUser.length < 3) {
      setErrorMessage('Username minimal 3 karakter.');
      return;
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(cleanUser)) {
      setErrorMessage('Username hanya boleh memuat huruf, angka, garis bawah (_), atau titik (.).');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Alamat email wajib diisi.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Format alamat email tidak valid.');
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
    if (!/[0-9]/.test(regPassword) || !/[a-zA-Z]/.test(regPassword)) {
      setErrorMessage('Kata sandi harus memuat kombinasi huruf dan angka.');
      return;
    }

    if (!regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi wajib diisi.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminAuth.register({
        fullName: regFullName.trim(),
        username: cleanUser,
        email: cleanEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
      });

      if (res.success) {
        toast.success('Pendaftaran berhasil! Akun Anda aktif dan siap digunakan.');
        const target = redirectQuery || (res.user?.role === 'admin' ? '/admin' : '/dashboard');
        navigate(target, { replace: true });
      } else {
        setErrorMessage(res.error || 'Pendaftaran gagal. Periksa kembali data formulir.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat memproses pendaftaran akun.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    const googleUrl = adminAuth.getGoogleAuthUrl();
    window.location.href = googleUrl;
  };

  return (
    <div className="relative min-h-screen bg-[#faf8f5] text-[#14161c] flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 pt-16 sm:pt-20 pb-12 font-['DM_Sans',sans-serif] selection:bg-[#0f9b8a]/20 overflow-y-auto">
      {/* Subtle Ambient Background Mesh & Accents */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0" aria-hidden="true">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#d9d6d0_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
        
        {/* Soft elegant ambient glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-200/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-slate-300/30 rounded-full blur-3xl" />
      </div>

      {/* Back to Home Button - Top Right */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl bg-white/95 hover:bg-white text-[#14161c] hover:text-[#0f9b8a] border border-[#d9d6d0] hover:border-[#0f9b8a] text-xs font-bold shadow-xs hover:shadow-md transition-all group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md my-auto">
        {/* Single Centered Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#d9d6d0] shadow-xs p-1.5 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img src="/Logo.png" alt="Scamora Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-[#14161c] tracking-tight leading-none group-hover:text-[#0f9b8a] transition-colors">
              Scamora
            </h1>
          </Link>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-3xl border border-[#d9d6d0] shadow-sm p-5 sm:p-8 space-y-5">
          {redirectQuery && (
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Akses Akun Diperlukan</span>
                <span className="text-[11px] text-amber-800 leading-relaxed">
                  Fitur yang Anda tuju memerlukan akun aktif. Silakan masuk atau daftarkan akun baru di bawah untuk melanjutkan.
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
            <h2 className="text-base sm:text-lg font-black text-[#14161c] flex items-center gap-2">
              {authMode === 'login' ? (
                <>
                  <KeyRound className="w-4.5 h-4.5 text-[#0f9b8a]" />
                  <span>Selamat Datang Kembali!</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4.5 h-4.5 text-[#0f9b8a]" />
                  <span>Pendaftaran Akun Baru</span>
                </>
              )}
            </h2>
            <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
              {authMode === 'login'
                ? 'Masuk ke akun Scamora untuk mengakses seluruh fitur perlindungan digital.'
                : 'Silakan lengkapi data berikut untuk membuat akun Scamora'}
            </p>
          </div>

          {/* Google Authentication Button (Official Visual Identity) */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50/90 border border-[#d9d6d0] hover:border-slate-400 text-[#14161c] text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-[#4285F4] rounded-full animate-spin" />
              ) : (
                <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{authMode === 'login' ? 'Masuk dengan Google' : 'Daftar dengan Google'}</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="h-px flex-1 bg-[#e2ded7]" />
              <span className="text-[10px] font-mono font-bold text-[#8a8f9c] uppercase tracking-wider whitespace-nowrap shrink-0">
                atau via kredensial
              </span>
              <div className="h-px flex-1 bg-[#e2ded7]" />
            </div>
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
                  htmlFor="login-identifier"
                  className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider"
                >
                  Email atau Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-identifier"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nama@email.com atau username"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider"
                  >
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-[#0f9b8a] hover:underline font-semibold cursor-pointer"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password"
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
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-left">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0f9b8a] focus:ring-[#0f9b8a] border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs text-[#475569] font-medium">Ingat Saya</span>
                </label>
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

              <div className="text-center pt-2">
                <span className="text-xs text-[#64748b]">Belum memiliki akun? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-[#0f9b8a] hover:underline font-bold cursor-pointer"
                >
                  Daftar Sekarang
                </button>
              </div>
            </form>
          ) : (
            /* ===================== FORM REGISTER ===================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Nama Lengkap */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                  Nama Lengkap <span className="text-rose-500">*</span>
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

              {/* Username & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase())}
                    placeholder="pratama_w"
                    disabled={isLoading}
                    className="w-full px-3 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                    Email Aktif <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value.toLowerCase())}
                      placeholder="nama@email.com"
                      disabled={isLoading}
                      className="w-full px-3 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition"
                    />
                  </div>
                </div>
              </div>

              {/* Kata Sandi & Konfirmasi Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 8 karakter"
                      disabled={isLoading}
                      className="w-full pl-3 pr-9 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94a3b8] hover:text-[#14161c] transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                    Konfirmasi Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegConfirm ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Ulangi sandi"
                      disabled={isLoading}
                      className="w-full pl-3 pr-9 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirm(!showRegConfirm)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94a3b8] hover:text-[#14161c] transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showRegConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {regPassword && (
                <div className="space-y-1.5 text-left pt-1 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#64748b]">Kekuatan Sandi:</span>
                    <span className={`font-bold ${passStrength.textClass}`}>{passStrength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${passStrength.color}`}
                      style={{ width: `${passStrength.score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Password Match Realtime Feedback */}
              {regConfirmPassword && (
                <div className="text-[11px] text-left">
                  {regPassword === regConfirmPassword ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Konfirmasi kata sandi cocok.
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Kata sandi belum cocok.
                    </span>
                  )}
                </div>
              )}

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
                    <span>Daftar Sekarang</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-[#64748b]">Sudah punya akun? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-[#0f9b8a] hover:underline font-bold cursor-pointer"
                >
                  Masuk di sini
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Footnote */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-[11px] text-[#64748b] flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0f9b8a]" />
            Bcrypt Salting &bull; HMAC SHA-256 Sesi &bull; OAuth 2.0 PKCE Ready
          </p>
          <p className="text-[10px] text-[#94a3b8] font-mono">
            Scamora Cyber-Defense &bull; MIT-Week 2026 Challenge
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#d9d6d0] shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0f9b8a] font-bold text-sm">
                <HelpCircle className="w-5 h-5" />
                <span>Bantuan Lupa Kata Sandi</span>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-[#64748b] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Demi keamanan akun warga dan pencegahan pembajakan, pemulihan akun Scamora saat ini dilayani melalui verifikasi identitas:
            </p>

            <ul className="text-xs text-[#475569] space-y-2 list-disc pl-4 leading-relaxed">
              <li>Hubungi tim Administrator di <strong>admin@scamora.id</strong> dengan menyertakan username terdaftar.</li>
              <li>Jika Anda mendaftar melalui <strong>Akun Google</strong>, Anda dapat langsung masuk tanpa membutuhkan kata sandi manual.</li>
            </ul>

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#14161c] hover:bg-[#2b2f3a] text-white text-xs font-bold transition cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
