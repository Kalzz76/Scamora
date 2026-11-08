import { adminApiClient } from './adminApiClient';

const TOKEN_KEY = 'scamora_admin_token';
const USER_KEY = 'scamora_admin_user';

export interface AdminUser {
  username: string;
  role: string;
  name: string;
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

    // 1. Prioritaskan instant demo/evaluation credential agar 100% lancar di Vercel maupun offline
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

    // 2. Jika kredensial lain, coba request ke backend API jika tersedia
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
    } catch {
      return {
        success: false,
        error: 'Kredensial tidak cocok. Gunakan kredensial evaluasi: admin / admin123.',
      };
    }
  },

  logout(): void {
    this.clearSession();
    window.location.hash = '#/admin/login';
  },
};
