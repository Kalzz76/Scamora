import { apiClient } from './apiClient';

export type DiscussionCategory = 'tanya-jawab-warga' | 'waspada-modus-baru' | 'posko-solusi-lapor';
export type DiscussionStatus = 'TERBUKA' | 'TERJAWAB' | 'DITUTUP';
export type TargetType = 'post' | 'comment';
export type ReportReason = 'penipuan' | 'spam' | 'misinformasi' | 'bocor_pii' | 'ujaran_kebencian' | 'lainnya';

export interface CommunityDiscussion {
  id: string;
  userId: string;
  authorName: string;
  authorBadge: string;
  avatarColor: string;
  category: DiscussionCategory;
  title: string;
  content: string;
  evidenceSnippet?: string;
  evidenceImageUrl?: string;
  isAnonymous: boolean;
  status: DiscussionStatus;
  bestSolutionCommentId?: string | null;
  helpfulCount: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  userVoted?: boolean;
  createdAt: string;
  updatedAt: string;
  comments?: CommunityCommentTree[];
}

export interface CommunityCommentTree {
  id: string;
  discussionId: string;
  userId: string;
  parentId?: string | null;
  authorName: string;
  authorBadge: string;
  avatarColor: string;
  content: string;
  evidenceImageUrl?: string;
  isAnonymous: boolean;
  isBestSolution: boolean;
  helpfulCount: number;
  userVoted?: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: CommunityCommentTree[];
}

export interface CommunityNotification {
  id: string;
  recipientId: string;
  actorId?: string;
  actorName?: string;
  type: string;
  discussionId?: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CommunityStats {
  categoryCounts: {
    'tanya-jawab-warga': number;
    'waspada-modus-baru': number;
    'posko-solusi-lapor': number;
  };
  trendingScams: Array<{
    id: string;
    title: string;
    tag: string;
    consultationCount: number;
    severity: string;
  }>;
  totalDiscussions: number;
}

export const communityService = {
  /**
   * Mengambil daftar diskusi dengan filter dan paginasi
   */
  async getDiscussions(params?: {
    category?: string;
    status?: string;
    search?: string;
    sort?: 'terbaru' | 'paling_membantu' | 'terpopuler';
    page?: number;
    limit?: number;
  }): Promise<{ discussions: CommunityDiscussion[]; pagination: any }> {
    const res = await apiClient.get('/community/discussions', { params });
    if (res.data?.success) {
      return {
        discussions: res.data.data,
        pagination: res.data.pagination,
      };
    }
    return { discussions: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  },

  /**
   * Mengambil detail satu diskusi beserta hierarki balasan bersarang (threaded tree)
   */
  async getDiscussionDetail(id: string): Promise<CommunityDiscussion> {
    const res = await apiClient.get(`/community/discussions/${id}`);
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
    throw new Error(res.data?.error?.message || 'Gagal memuat detail diskusi.');
  },

  /**
   * Membuat postingan diskusi baru
   */
  async createDiscussion(data: {
    category: DiscussionCategory;
    title: string;
    content: string;
    evidenceSnippet?: string;
    evidenceImageUrl?: string;
    isAnonymous?: boolean;
  }): Promise<CommunityDiscussion> {
    const res = await apiClient.post('/community/discussions', data);
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
    throw new Error(res.data?.error?.message || 'Gagal membuat postingan.');
  },

  /**
   * Menyunting postingan diskusi milik sendiri
   */
  async updateDiscussion(
    id: string,
    data: {
      title?: string;
      content?: string;
      category?: DiscussionCategory;
      evidenceSnippet?: string;
      status?: DiscussionStatus;
    }
  ): Promise<CommunityDiscussion> {
    const res = await apiClient.put(`/community/discussions/${id}`, data);
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
    throw new Error(res.data?.error?.message || 'Gagal memperbarui postingan.');
  },

  /**
   * Menghapus postingan diskusi milik sendiri
   */
  async deleteDiscussion(id: string): Promise<void> {
    const res = await apiClient.delete(`/community/discussions/${id}`);
    if (!res.data?.success) {
      throw new Error(res.data?.error?.message || 'Gagal menghapus postingan.');
    }
  },

  /**
   * Mengirim komentar atau balasan bersarang (threaded reply)
   */
  async addComment(
    discussionId: string,
    data: {
      content: string;
      parentId?: string | null;
      evidenceImageUrl?: string;
      isAnonymous?: boolean;
    }
  ): Promise<CommunityCommentTree> {
    const res = await apiClient.post(`/community/discussions/${discussionId}/comments`, data);
    if (res.data?.success && res.data.data) {
      return { ...res.data.data, replies: [] };
    }
    throw new Error(res.data?.error?.message || 'Gagal mengirim komentar.');
  },

  /**
   * Menghapus komentar milik sendiri
   */
  async deleteComment(id: string): Promise<void> {
    const res = await apiClient.delete(`/community/comments/${id}`);
    if (!res.data?.success) {
      throw new Error(res.data?.error?.message || 'Gagal menghapus komentar.');
    }
  },

  /**
   * Menandai atau membatalkan Solusi Terbaik (Best Solution)
   */
  async toggleBestSolution(
    discussionId: string,
    commentId: string
  ): Promise<{ isBestSolution: boolean; status: DiscussionStatus }> {
    const res = await apiClient.put(`/community/discussions/${discussionId}/best-solution`, { commentId });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
    throw new Error(res.data?.error?.message || 'Gagal mengubah status Solusi Terbaik.');
  },

  /**
   * Memberikan / membatalkan vote "Membantu" (Helpful)
   */
  async toggleHelpfulVote(
    targetType: TargetType,
    targetId: string
  ): Promise<{ voted: boolean; helpfulCount: number }> {
    const res = await apiClient.post('/community/vote', { targetType, targetId });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
    throw new Error(res.data?.error?.message || 'Gagal memproses dukungan Membantu.');
  },

  /**
   * Melaporkan konten pelanggaran
   */
  async reportContent(data: {
    targetType: 'post' | 'comment' | 'user';
    targetId: string;
    reason: ReportReason;
    notes?: string;
  }): Promise<void> {
    const res = await apiClient.post('/community/reports', data);
    if (!res.data?.success) {
      throw new Error(res.data?.error?.message || 'Gagal mengirim laporan pelanggaran.');
    }
  },

  /**
   * Memvalidasi berkas screenshot sebelum dikirim (Magic Bytes & File Size)
   */
  async validateEvidence(imageBase64: string): Promise<{ valid: boolean; mimeType: string }> {
    const res = await apiClient.post('/community/validate-evidence', { imageBase64 });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
    throw new Error(res.data?.error?.message || 'Berkas bukti tidak valid.');
  },

  /**
   * Mengambil statistik komunitas dan tren modus aktual
   */
  async getStats(): Promise<CommunityStats> {
    const res = await apiClient.get('/community/stats');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
    return {
      categoryCounts: { 'tanya-jawab-warga': 0, 'waspada-modus-baru': 0, 'posko-solusi-lapor': 0 },
      trendingScams: [],
      totalDiscussions: 0,
    };
  },

  /**
   * Mengambil notifikasi warga
   */
  async getNotifications(): Promise<{ notifications: CommunityNotification[]; unreadCount: number }> {
    const res = await apiClient.get('/community/notifications');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
    return { notifications: [], unreadCount: 0 };
  },

  /**
   * Menandai notifikasi telah dibaca
   */
  async markNotificationRead(id: string): Promise<void> {
    await apiClient.put(`/community/notifications/${id}/read`);
  },

  /**
   * Menandai seluruh notifikasi telah dibaca
   */
  async markAllNotificationsRead(): Promise<void> {
    await apiClient.put('/community/notifications/read-all');
  },
};
