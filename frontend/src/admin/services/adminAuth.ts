import { apiClient } from '../../services/apiClient';
import { adminApiClient } from './adminApiClient';

const TOKEN_KEY = 'scamora_admin_token';
const USER_KEY = 'scamora_admin_user';
const REMEMBER_KEY = 'scamora_remember_me';

export interface AdminUser {
  id?: string;
  username: string;
  role: string;
  name: string;
  tier?: 'guest' | 'verified';
  email?: string;
  avatarUrl?: string;
  authProvider?: 'local' | 'google';
}

export interface LoginResult {
  success: boolean;
  requiresOtp?: boolean;
  email?: string;
  message?: string;
  error?: string;
  user?: AdminUser;
}

export const adminAuth = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setSession(token: string, user: AdminUser, rememberMe = false): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, 'true');
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch {
      // Ignore quota error
    }
  },

  clearSession(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    } catch {
      // Ignore
    }
  },

  isRemembered(): boolean {
    try {
      return localStorage.getItem(REMEMBER_KEY) === 'true';
    } catch {
      return false;
    }
  },

  getUser(): AdminUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AdminUser) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  async login(
    username: string,
    password: string,
    rememberMe = false,
    turnstileToken?: string
  ): Promise<LoginResult> {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    try {
      const res = await apiClient.post('/auth/login', {
        username: trimmedUser,
        password: trimmedPass,
        rememberMe,
        turnstileToken,
      });

      if (res.data?.success && res.data.data?.token) {
        const token = res.data.data.token;
        const u = res.data.data.user;
        const user: AdminUser = {
          id: u.id,
          username: u.username || trimmedUser,
          role: u.role || 'user',
          tier: u.tier || 'verified',
          name: u.name || trimmedUser,
          email: u.email,
          avatarUrl: u.avatarUrl,
          authProvider: u.authProvider || 'local',
        };
        this.setSession(token, user, rememberMe);
        return { success: true, user };
      }

      return {
        success: false,
        error: res.data?.error?.message || 'Nama pengguna/email atau kata sandi tidak cocok.',
      };
    } catch (err: any) {
      // Fallback ke /admin/login jika endpoint baru tidak merespons
      try {
        const legacyRes = await adminApiClient.post('/login', {
          username: trimmedUser,
          password: trimmedPass,
        });
        if (legacyRes.data?.success && legacyRes.data.data?.token) {
          const token = legacyRes.data.data.token;
          const user: AdminUser = legacyRes.data.data.user || {
            username: trimmedUser,
            role: 'admin',
            name: 'Super Administrator',
          };
          this.setSession(token, user, rememberMe);
          return { success: true, user };
        }
      } catch {}

      const msg = err.message || err.response?.data?.error?.message || 'Kredensial tidak cocok atau akun tidak ditemukan.';
      return {
        success: false,
        error: msg,
      };
    }
  },

  async register(data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
    turnstileToken?: string;
  }): Promise<LoginResult> {
    try {
      const res = await apiClient.post('/auth/register', data);
      if (res.data?.success) {
        if (res.data.data?.requiresOtp) {
          return {
            success: true,
            requiresOtp: true,
            email: res.data.data.email || data.email,
            message: res.data.data.message || 'Kode OTP telah dikirim ke email Anda.',
          };
        }
        if (res.data.data?.token) {
          const token = res.data.data.token;
          const u = res.data.data.user;
          const user: AdminUser = {
            id: u.id,
            username: u.username,
            name: u.name || u.username,
            role: u.role || 'user',
            tier: u.tier || 'verified',
            email: u.email,
            avatarUrl: u.avatarUrl,
            authProvider: u.authProvider || 'local',
          };
          this.setSession(token, user);
          return { success: true, user };
        }
      }
      return {
        success: false,
        error: res.data?.error?.message || 'Registrasi gagal. Periksa kembali formulir Anda.',
      };
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Pendaftaran gagal.';
      return { success: false, error: msg };
    }
  },

  async verifyRegisterOtp(email: string, otp: string): Promise<LoginResult> {
    try {
      const res = await apiClient.post('/auth/register/verify', { email, otp });
      if (res.data?.success && res.data.data?.token) {
        const token = res.data.data.token;
        const u = res.data.data.user;
        const user: AdminUser = {
          id: u.id,
          username: u.username,
          name: u.name || u.username,
          role: u.role || 'user',
          tier: u.tier || 'verified',
          email: u.email,
          avatarUrl: u.avatarUrl,
          authProvider: u.authProvider || 'local',
        };
        this.setSession(token, user);
        return { success: true, user };
      }
      return {
        success: false,
        error: res.data?.error?.message || 'Kode OTP tidak sesuai atau telah kedaluwarsa.',
      };
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Verifikasi OTP gagal.';
      return { success: false, error: msg };
    }
  },

  async resendOtp(
    email: string,
    purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' = 'EMAIL_VERIFICATION'
  ): Promise<{ success: boolean; message?: string; error?: string; cooldownRemaining?: number }> {
    try {
      const res = await apiClient.post('/auth/otp/resend', { email, purpose });
      if (res.data?.success) {
        return { success: true, message: res.data.data?.message || 'Kode OTP baru berhasil dikirim.' };
      }
      return {
        success: false,
        error: res.data?.error?.message || 'Gagal mengirim ulang kode OTP.',
        cooldownRemaining: res.data?.error?.cooldownRemaining,
      };
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      return {
        success: false,
        error: errorData?.message || err.message || 'Gagal mengirim ulang OTP.',
        cooldownRemaining: errorData?.cooldownRemaining,
      };
    }
  },

  async requestForgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await apiClient.post('/auth/password/forgot', { email });
      if (res.data?.success) {
        return { success: true, message: res.data.data?.message || 'Instruksi reset sandi telah dikirim.' };
      }
      return {
        success: false,
        error: res.data?.error?.message || 'Gagal memproses permintaan reset kata sandi.',
      };
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Gagal meminta reset kata sandi.';
      return { success: false, error: msg };
    }
  },

  async verifyPasswordResetOtp(
    email: string,
    otp: string
  ): Promise<{ success: boolean; resetToken?: string; error?: string }> {
    try {
      const res = await apiClient.post('/auth/password/verify-otp', { email, otp });
      if (res.data?.success && res.data.data?.resetToken) {
        return { success: true, resetToken: res.data.data.resetToken };
      }
      return {
        success: false,
        error: res.data?.error?.message || 'Kode OTP salah atau kedaluwarsa.',
      };
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Verifikasi OTP gagal.';
      return { success: false, error: msg };
    }
  },

  async resetPassword(data: {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await apiClient.post('/auth/password/reset', data);
      if (res.data?.success) {
        return { success: true, message: res.data.data?.message || 'Kata sandi berhasil diperbarui.' };
      }
      return {
        success: false,
        error: res.data?.error?.message || 'Gagal memperbarui kata sandi.',
      };
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Gagal mereset kata sandi.';
      return { success: false, error: msg };
    }
  },

  async loginWithGoogleToken(credentialOrCode: string): Promise<LoginResult> {
    try {
      const isCredential = credentialOrCode.length > 50;
      const payload = isCredential
        ? { credential: credentialOrCode }
        : { code: credentialOrCode };

      const res = await apiClient.post('/auth/google/token', payload);
      if (res.data?.success && res.data.data?.token) {
        const token = res.data.data.token;
        const u = res.data.data.user;
        const user: AdminUser = {
          id: u.id,
          username: u.username,
          name: u.name || u.username,
          role: u.role || 'user',
          tier: u.tier || 'verified',
          email: u.email,
          avatarUrl: u.avatarUrl,
          authProvider: u.authProvider || 'google',
        };
        this.setSession(token, user);
        return { success: true, user };
      }
      return {
        success: false,
        error: res.data?.error?.message || 'Autentikasi akun Google gagal.',
      };
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Gagal memproses login Google.';
      return { success: false, error: msg };
    }
  },

  getGoogleAuthUrl(): string {
    const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
    const isBrowser = typeof window !== 'undefined';
    const isRemoteDomain = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    let base = '/api/v1';

    if (isRemoteDomain || import.meta.env.PROD) {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        base = envUrl;
      }
    } else {
      base = envUrl || 'http://localhost:8000/api/v1';
    }

    return `${base}/auth/google`;
  },

  logout(): void {
    try {
      apiClient.post('/auth/logout').catch(() => {});
    } catch {}
    this.clearSession();
    window.location.hash = '#/login';
  },
};
