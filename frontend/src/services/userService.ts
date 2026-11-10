import { apiClient } from './apiClient';
import { adminAuth } from '../admin/services/adminAuth';

export interface UserStatistics {
  totalScans: number;
  urlScans: number;
  chatScans: number;
  challengeAttempts: number;
  highestScore: number;
  averageScore: number;
  tier: string;
  isUnlimited: boolean;
}

export interface UserScanHistoryItem {
  id: string;
  userId: string;
  type: 'url' | 'chat';
  inputSummary: string;
  riskLevel: 'low' | 'review' | 'high';
  riskScore: number;
  scamType: string;
  indicatorsCount: number;
  createdAt: string;
}

export interface UserProfileData {
  id: string;
  username: string;
  name: string;
  email: string;
  tier: string;
  role: string;
  status: string;
  scanCount: number;
  reportCount: number;
  createdAt: string;
}

export const userService = {
  async getStats(): Promise<UserStatistics> {
    try {
      const res = await apiClient.get<{ success: boolean; data: UserStatistics }>('/user/stats');
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch {
      // Fallback to empty real state
    }

    return {
      totalScans: 0,
      urlScans: 0,
      chatScans: 0,
      challengeAttempts: 0,
      highestScore: 0,
      averageScore: 0,
      tier: 'standard',
      isUnlimited: false,
    };
  },

  async getHistory(): Promise<UserScanHistoryItem[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: UserScanHistoryItem[] }>('/user/history');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch {
      // Clean fallback
    }

    return [];
  },

  async getProfile(): Promise<UserProfileData> {
    const fallbackUser = adminAuth.getUser();
    try {
      const res = await apiClient.get<{ success: boolean; data: UserProfileData }>('/user/profile');
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch {
      // Fallback
    }

    return {
      id: fallbackUser?.id || '',
      username: fallbackUser?.username || 'tamu',
      name: fallbackUser?.name || 'Pengguna Scamora',
      email: fallbackUser?.email || '',
      tier: fallbackUser?.tier || 'standard',
      role: fallbackUser?.role || 'user',
      status: 'active',
      scanCount: 0,
      reportCount: 0,
      createdAt: new Date().toISOString(),
    };
  },

  async updateProfile(data: { name: string; email?: string }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.put('/user/profile', data);
      if (res.data?.success) {
        // Update local session user name
        const user = adminAuth.getUser();
        if (user) {
          user.name = data.name;
          if (data.email) user.email = data.email;
          localStorage.setItem('scamora_admin_user', JSON.stringify(user));
        }
        return { success: true, message: res.data.data?.message || 'Profil berhasil diperbarui.' };
      }
      return { success: false, message: 'Gagal memperbarui profil.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Gagal menghubungi server.' };
    }
  },

  async updatePassword(data: { oldPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.put('/user/password', data);
      if (res.data?.success) {
        return { success: true, message: res.data.data?.message || 'Kata sandi berhasil diperbarui.' };
      }
      return { success: false, message: 'Gagal mengganti kata sandi.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Kata sandi lama tidak cocok.' };
    }
  },
};

