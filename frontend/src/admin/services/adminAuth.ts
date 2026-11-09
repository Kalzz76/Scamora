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

  async login(username: string, password: string, rememberMe = false): Promise<LoginResult> {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    try {
      const res = await apiClient.post('/auth/login', {
        username: trimmedUser,
        password: trimmedPass,
        rememberMe,
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
  }): Promise<LoginResult> {
    try {
      const res = await apiClient.post('/auth/register', data);
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
        error: res.data?.error?.message || 'Registrasi gagal. Periksa kembali formulir Anda.',
      };
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Pendaftaran gagal.';
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
    const base = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1');
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
