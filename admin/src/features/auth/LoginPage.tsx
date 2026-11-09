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
  LogIn,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth } from '../../services/adminAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

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
        toast.success(`Selamat datang, ${res.user?.name || username}!`);
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
        toast.success('Pendaftaran berhasil! Akun Anda telah aktif.');
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
    <div className="relative min-h-screen bg-[#faf8f5] text-[#14161c] flex flex-col justify-center items-center p-4 sm:p-6 font-['DM_Sans',sans-serif] selection:bg-[#0f9b8a]/20">
      {/* Soft Ambient Radial Background Glow khas Scamora */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
        style={{
          background: 'radial-gradient(circle at 50% 10%, rgba(15, 155, 138, 0.08) 0%, transparent 65%)',
        }}
      />

      {/* Back to Home Button - Pojok Kiri Atas Layar */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 hover:bg-white text-[#14161c] hover:text-[#0f9b8a] border border-[#d9d6d0] hover:border-[#0f9b8a] text-xs font-bold shadow-xs hover:shadow-sm transition-all hover:-translate-x-0.5 group"
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
                    placeholder="Min 6 karakter"
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
