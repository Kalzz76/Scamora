import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminAuth } from '../../services/adminAuth';
import { OtpInput } from '../../../components/common/OtpInput';

export interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  initialEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = '',
}) => {
  const [step, setStep] = useState<'email' | 'otp' | 'new_password' | 'success'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timers
  const [expirySeconds, setExpirySeconds] = useState(300); // 5 menit
  const [cooldownSeconds, setCooldownSeconds] = useState(60); // 60s resend

  useEffect(() => {
    if (isOpen) {
      setStep('email');
      setEmail(initialEmail);
      setOtpCode('');
      setResetToken('');
      setNewPassword('');
      setConfirmNewPassword('');
      setErrorMessage(null);
      setIsLoading(false);
    }
  }, [isOpen, initialEmail]);

  // Expiry countdown timer (5 minutes)
  useEffect(() => {
    if (step !== 'otp' || expirySeconds <= 0) return;
    const interval = setInterval(() => {
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, expirySeconds]);

  // Resend cooldown timer (60s)
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Password strength calculator
  const calculateStrength = (pass: string) => {
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

  const passStrength = calculateStrength(newPassword);

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Alamat email wajib diisi.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Format alamat email tidak valid.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminAuth.requestForgotPassword(cleanEmail);
      if (res.success) {
        toast.info('Kode verifikasi OTP telah dikirimkan ke email Anda.');
        setExpirySeconds(300);
        setCooldownSeconds(60);
        setStep('otp');
      } else {
        setErrorMessage(res.error || 'Gagal mengirimkan kode OTP ke email Anda.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat memproses reset sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (otpCode.length !== 6) {
      setErrorMessage('Harap masukkan 6 digit kode OTP secara lengkap.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminAuth.verifyPasswordResetOtp(email.trim().toLowerCase(), otpCode);
      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        toast.success('Kode OTP terverifikasi! Silakan buat kata sandi baru.');
        setStep('new_password');
      } else {
        setErrorMessage(res.error || 'Kode OTP tidak cocok atau telah kedaluwarsa.');
      }
    } catch {
      setErrorMessage('Terjadi kendala saat memvalidasi kode OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (cooldownSeconds > 0 || isLoading) return;
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await adminAuth.resendOtp(email.trim().toLowerCase(), 'PASSWORD_RESET');
      if (res.success) {
        toast.success('Kode OTP baru telah berhasil dikirimkan.');
        setExpirySeconds(300);
        setCooldownSeconds(60);
        setOtpCode('');
      } else {
        setErrorMessage(res.error || 'Gagal mengirim ulang kode OTP.');
        if (res.cooldownRemaining) {
          setCooldownSeconds(res.cooldownRemaining);
        }
      }
    } catch {
      setErrorMessage('Terjadi kendala saat meminta ulang OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (!/[0-9]/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
      setErrorMessage('Kata sandi harus memuat kombinasi huruf dan angka.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok dengan kata sandi baru.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await adminAuth.resetPassword({
        email: email.trim().toLowerCase(),
        resetToken,
        newPassword,
        confirmNewPassword,
      });

      if (res.success) {
        toast.success('Kata sandi berhasil diperbarui!');
        setStep('success');
      } else {
        setErrorMessage(res.error || 'Gagal memperbarui kata sandi. Silakan coba kembali.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat memperbarui kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-['DM_Sans',sans-serif]">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 border border-[#d9d6d0] shadow-2xl space-y-4 text-left relative">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-2 border-b border-[#f1eee8]">
          <div className="flex items-center gap-2 text-[#0f9b8a] font-bold text-sm">
            <KeyRound className="w-5 h-5 text-[#0f9b8a]" />
            <span>Pemulihan Kata Sandi Akun</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-[#64748b] cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="leading-relaxed font-medium">{errorMessage}</div>
          </div>
        )}

        {/* ===================== STEP 1: INPUT EMAIL ===================== */}
        {step === 'email' && (
          <form onSubmit={handleRequestOtp} className="space-y-4 pt-1">
            <p className="text-xs text-[#475569] leading-relaxed">
              Masukkan alamat email aktif yang terdaftar di akun Scamora Anda. Kami akan mengirimkan kode verifikasi OTP 6 digit.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                Alamat Email Terdaftar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  disabled={isLoading}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full py-3 px-4 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirimkan Kode OTP...</span>
                </>
              ) : (
                <>
                  <span>Kirim Kode OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ===================== STEP 2: INPUT OTP ===================== */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1 text-center">
            <div className="space-y-1 text-left">
              <p className="text-xs text-[#475569] leading-relaxed">
                Kode OTP 6 digit telah dikirimkan ke:
              </p>
              <p className="text-xs font-bold text-[#14161c] font-mono break-all bg-slate-50 p-2 rounded-lg border border-slate-200">
                {email}
              </p>
            </div>

            <div className="space-y-2 py-2">
              <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider text-left">
                Masukkan 6 Digit Kode OTP
              </label>
              <OtpInput
                value={otpCode}
                onChange={setOtpCode}
                length={6}
                disabled={isLoading}
              />
            </div>

            {/* Timers & Resend */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <div className="text-[#64748b] text-[11px] font-medium flex items-center gap-1">
                <span>⏱️ Masa berlaku:</span>
                <span className={`font-mono font-bold ${expirySeconds <= 60 ? 'text-rose-600' : 'text-[#0f9b8a]'}`}>
                  {formatTimer(expirySeconds)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldownSeconds > 0 || isLoading}
                className="text-[11px] text-[#0f9b8a] hover:underline font-bold disabled:text-slate-400 disabled:no-underline cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {cooldownSeconds > 0 ? `Kirim Ulang (${cooldownSeconds}s)` : 'Kirim Ulang Kode'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="py-2.5 px-4 rounded-xl border border-[#d9d6d0] hover:bg-slate-50 text-[#475569] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ganti Email</span>
              </button>

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="py-2.5 px-4 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Verifikasi OTP</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ===================== STEP 3: NEW PASSWORD ===================== */}
        {step === 'new_password' && (
          <form onSubmit={handleSetNewPassword} className="space-y-3.5 pt-1">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Identitas terverifikasi. Silakan masukkan kata sandi baru yang aman.</span>
            </div>

            {/* Sandi Baru */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 karakter (huruf & angka)"
                  disabled={isLoading}
                  autoFocus
                  className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94a3b8] hover:text-[#14161c] transition cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-1.5 pt-0.5">
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

            {/* Konfirmasi Sandi Baru */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-[#475569] uppercase font-mono tracking-wider">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#faf8f5] border border-[#d9d6d0] rounded-xl text-xs text-[#14161c] placeholder-[#94a3b8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9b8a]/20 focus:border-[#0f9b8a] transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94a3b8] hover:text-[#14161c] transition cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Realtime Match Indicator */}
            {confirmNewPassword && (
              <div className="text-[11px]">
                {newPassword === confirmNewPassword ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Konfirmasi sandi cocok.
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Konfirmasi belum cocok.
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !newPassword || newPassword !== confirmNewPassword}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Kata Sandi Baru...</span>
                </>
              ) : (
                <span>Simpan Kata Sandi Baru</span>
              )}
            </button>
          </form>
        )}

        {/* ===================== STEP 4: SUCCESS ===================== */}
        {step === 'success' && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#14161c]">Kata Sandi Berhasil Diperbarui!</h3>
              <p className="text-xs text-[#64748b] leading-relaxed max-w-xs mx-auto">
                Kata sandi baru Anda telah aktif. Anda sekarang dapat masuk kembali menggunakan kata sandi baru.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onSuccess(email.trim().toLowerCase());
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#0f9b8a] hover:bg-[#0c8274] text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Masuk ke Akun Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

