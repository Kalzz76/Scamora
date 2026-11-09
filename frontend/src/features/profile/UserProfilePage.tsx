import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Lock,
  LogOut,
  Save,
  KeyRound,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth } from '../../admin/services/adminAuth';
import { userService, type UserProfileData } from '../../services/userService';

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    async function loadProfile() {
      try {
        const data = await userService.getProfile();
        setProfile(data);
        setFullName(data.name || '');
        setEmail(data.email || '');
      } catch (err) {
        console.warn('Gagal memuat profil pengguna:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Nama lengkap tidak boleh kosong.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await userService.updateProfile({
        name: fullName.trim(),
        email: email.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message);
        if (profile) {
          setProfile({ ...profile, name: fullName.trim(), email: email.trim() });
        }
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Gagal memperbarui profil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      toast.error('Semua kolom kata sandi wajib diisi.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await userService.updatePassword({
        oldPassword,
        newPassword,
      });

      if (res.success) {
        toast.success(res.message);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Gagal mengganti kata sandi. Pastikan kata sandi saat ini benar.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun Scamora?')) {
      adminAuth.clearSession();
      toast.info('Anda telah keluar dari akun. Selamat datang di mode pengunjung.');
      navigate('/', { replace: true });
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center gap-3 font-['DM_Sans',sans-serif]">
        <Loader2 className="w-8 h-8 text-[#0f9b8a] animate-spin" />
        <p className="text-sm text-[#64748b]">Memuat profil pengguna...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 font-['DM_Sans',sans-serif]">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <Link to="/dashboard" className="hover:text-[#14161c] transition flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Dashboard</span>
        </Link>
        <span>/</span>
        <span className="font-bold text-[#14161c]">Profil Pengguna</span>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E3E0DA] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-[#0f9b8a] to-[#143826] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md shrink-0">
            {(profile?.name || profile?.username || 'U')[0].toUpperCase()}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-[#14161c] tracking-tight">
                {profile?.name || 'Pengguna'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Terverifikasi</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748b] font-mono">
              @{profile?.username || 'username'}
            </p>
            <p className="text-[11px] text-[#8c887b]">
              Bergabung sejak {formatDate(profile?.createdAt)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer self-stretch sm:self-auto shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun</span>
        </button>
      </div>

      {/* Main Grid: Account Info & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Edit Profile */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E3E0DA] shadow-xs p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E0DA]">
            <User className="w-5 h-5 text-[#0f9b8a]" />
            <h2 className="text-base font-bold text-[#14161c]">Informasi Profil & Kontak</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#14161c] block">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap Anda..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#d9d6d0] text-xs sm:text-sm text-[#14161c] focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#14161c] block">
                Nama Pengguna (Username)
              </label>
              <input
                type="text"
                disabled
                value={profile?.username || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-500 font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-[#8c887b] block">
                Nama pengguna tidak dapat diubah setelah pendaftaran.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#14161c] block">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#d9d6d0] text-xs sm:text-sm text-[#14161c] focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#14161c] hover:bg-[#2b2f3a] text-white text-xs font-bold transition shadow-xs disabled:opacity-60 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#0f9b8a]" />
                <span>{isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </form>

          {/* Access Rights Highlights */}
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#E3E0DA] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#14161c]">
              <Sparkles className="w-4 h-4 text-[#0f9b8a]" />
              <span>Status Hak Akses Akun:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#64748b]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pemindaian URL Tanpa Batas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Analisis Chat Tanpa Batas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Akses Simulasi Tantangan AI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Hak Bersuara di Komunitas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Change Password */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E3E0DA] shadow-xs p-6 sm:p-7 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E0DA]">
              <KeyRound className="w-5 h-5 text-[#0f9b8a]" />
              <h2 className="text-base font-bold text-[#14161c]">Ganti Kata Sandi</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#14161c] block">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#d9d6d0] text-xs sm:text-sm text-[#14161c] focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#14161c] block">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#d9d6d0] text-xs sm:text-sm text-[#14161c] focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#14161c] block">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#d9d6d0] text-xs sm:text-sm text-[#14161c] focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs font-bold transition shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isChangingPass ? 'Memproses...' : 'Ubah Kata Sandi'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="pt-6 border-t border-[#E3E0DA] text-[11px] text-[#8c887b] leading-relaxed">
            Tips: Gunakan kata sandi yang unik dengan kombinasi huruf, angka, dan simbol untuk keamanan maksimal akun Anda.
          </div>
        </div>
      </div>
    </div>
  );
};
