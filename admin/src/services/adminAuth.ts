import { adminApiClient } from './adminApiClient';

const TOKEN_KEY = 'scamora_admin_token';
const USER_KEY = 'scamora_admin_user';

export interface AdminUser {
  id?: string;
  username: string;
  role: string;
  name: string;
  tier?: 'guest' | 'verified';
  email?: string;
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

  setSession(token: string, user: AdminUser): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Ignore quota error
    }
  },

  clearSession(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignore
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

  async login(username: string, password: string): Promise<LoginResult> {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    // 1. Coba request ke backend API untuk autentikasi dan mendapatkan token resmi
    try {
      const res = await adminApiClient.post('/login', {
        username: trimmedUser,
        password: trimmedPass,
      });

      if (res.data?.success && res.data.data?.token) {
        const token = res.data.data.token;
        const user: AdminUser = res.data.data.user || {
          username: trimmedUser,
          role: 'admin',
          name: 'Super Administrator',
        };
        this.setSession(token, user);
        return { success: true, user };
      }

      return {
        success: false,
        error: res.data?.error?.message || 'Nama pengguna atau kata sandi tidak valid. Gunakan admin / admin123.',
      };
    } catch (err: any) {
      // Jika backend merespons dengan pesan error spesifik (misal status 400/401/403)
      if (err.response?.data?.error?.message) {
        return {
          success: false,
          error: err.response.data.error.message,
        };
      }

      // 2. Fallback offline jika server backend tidak dapat dihubungi (mode preview offline)
      if (
        (trimmedUser === 'admin' && trimmedPass === 'admin123') ||
        (trimmedUser === 'superadmin' && trimmedPass === 'admin123')
      ) {
        const demoUser: AdminUser = {
          username: trimmedUser,
          role: 'admin',
          name: 'Super Administrator',
        };
        const demoToken = `scamora-admin-token-${Date.now()}`;
        this.setSession(demoToken, demoUser);
        return { success: true, user: demoUser };
      }

      const msg = 'Kredensial tidak cocok atau akun tidak ditemukan.';
      return {
        success: false,
        error: msg,
      };
    }
  },

  async register(data: { username: string; email?: string; password: string; fullName: string }): Promise<LoginResult> {
    try {
      const res = await adminApiClient.post('/register', data);
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
        };
        this.setSession(token, user);
        return { success: true, user };
      }
      return {
        success: false,
        error: res.data?.error?.message || 'Registrasi gagal. Periksa kembali formulir Anda.',
      };
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Gagal menghubungi server pendaftaran.';
      return { success: false, error: msg };
    }
  },

  logout(): void {
    this.clearSession();
    window.location.hash = '#/login';
  },
};
