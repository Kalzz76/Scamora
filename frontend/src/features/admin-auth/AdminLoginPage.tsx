import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  KeyRound,
  LogOut,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../services/apiClient';

interface StoredAdminUser {
  username: string;
  role: string;
  name?: string;
}

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<StoredAdminUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('scamora_admin_token');
    const userRaw = localStorage.getItem('scamora_admin_user');
    if (token) {
      setAuthToken(token);
      if (userRaw) {
        try {
          setCurrentUser(JSON.parse(userRaw));
        } catch {
          setCurrentUser({ username: 'admin', role: 'admin' });
        }
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Nama pengguna dan kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post('/admin/login', {
        username: username.trim(),
        password: password.trim(),
      });

      if (res.data?.success && res.data.data?.token) {
        const token = res.data.data.token;
        const user = res.data.data.user || {
          username: username.trim(),
          role: 'admin',
          name: 'Super Administrator',
        };

        localStorage.setItem('scamora_admin_token', token);
        localStorage.setItem('scamora_admin_user', JSON.stringify(user));

        setAuthToken(token);
        setCurrentUser(user);
        toast.success('Autentikasi berhasil! Sesi administrator aktif.');
      } else {
        setErrorMessage(res.data?.error?.message || 'Autentikasi ditolak.');
      }
    } catch (err: unknown) {
      const errorObj = err as {
        message?: string;
        details?: string;
      };
      setErrorMessage(
        errorObj.message || 'Kredensial salah atau server backend tidak dapat dihubungi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('scamora_admin_token');
    localStorage.removeItem('scamora_admin_user');
    setAuthToken(null);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    toast.info('Sesi administrator telah dikunci.');
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage(null);
    toast.info('Kredensial evaluasi terisi otomatis.');
  };

  const adminAppUrl = 'http://localhost:5174';

  return (
    <div className="flex flex-col w-full pb-20">
      {/* HEADER BANNER - Navy Slate Theme */}
      <section className="w-full bg-[#0F172A] text-white py-10 sm:py-14 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-3xl space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-mono text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
              <span className="font-semibold text-white">Security Operation Center</span>
              <span className="text-slate-500">•</span>
              <span className="text-[#0D9488] font-bold">Akses Terbatas Petugas</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Portal Otorisasi <span className="text-[#0D9488]">Administrator</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Gerbang otentikasi resmi untuk mengelola parameter mesin kecerdasan buatan, telemetri pemindaian, preset skenario deteksi penipuan, dan audit kepatuhan etika sistem Scamora.
            </p>
          </motion.div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 w-full">
        {authToken ? (
          /* ACTIVE SESSION PANEL */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      Sesi Administrator Aktif
                    </h2>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 uppercase">
                      Terotentikasi
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    Role: {currentUser?.role || 'admin'} &bull; User: {currentUser?.username || 'admin'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Kunci Sesi</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#0D9488]" />
                  Status Hak Akses
                </div>
                <div className="font-bold text-slate-800 text-sm">Full Administrative Access</div>
                <div className="text-[11px] text-slate-400 font-mono">Bearer Token Valid (24h)</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-600" />
                  Port Command Center
                </div>
                <div className="font-bold text-slate-800 text-sm">Port :5174 (Vite Admin)</div>
                <div className="text-[11px] text-slate-400 font-mono">Backend API :8000</div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={adminAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group text-center cursor-pointer"
              >
                <span>Buka Panel Kontrol Admin (Port 5174)</span>
                <ExternalLink className="w-4 h-4 text-[#0D9488] group-hover:translate-x-0.5 transition-transform" />
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(authToken);
                  toast.success('Bearer token berhasil disalin ke clipboard.');
                }}
                className="w-full sm:w-auto py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Salin Token API
              </button>
            </div>
          </motion.div>
        ) : (
          /* LOGIN FORM CARD */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6 text-left"
          >
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <KeyRound className="w-4 h-4 text-[#0D9488]" />
                <h2>Otentikasi Kredensial Administrator</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Masukkan nama pengguna dan kata sandi untuk membuka sesi kontrol.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-username"
                  className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider"
                >
                  Nama Pengguna (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-slate-700 uppercase font-mono tracking-wider"
                >
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30 focus:border-[#0D9488] transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
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
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi Otorisasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Panel Administrator</span>
                    <ArrowRight className="w-4 h-4 text-[#0D9488]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Helper */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                  Kredensial Evaluasi (Demo Juri)
                </span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[10px] font-bold text-[#0D9488] hover:text-teal-700 underline underline-offset-2 cursor-pointer font-mono"
                >
                  Isi Otomatis
                </button>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                  User: <strong>admin</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                  Pass: <strong>admin123</strong>
                </span>
              </div>
            </div>

            <div className="text-center pt-2">
              <p className="text-[11px] text-slate-400 font-mono">
                Scamora Security Protocol &bull; Zero-Data Retention Standard
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
