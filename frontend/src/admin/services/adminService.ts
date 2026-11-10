import {
  INITIAL_AI_CONFIG,
  INITIAL_ARTICLES,
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_CRAWLER_CONFIG,
  INITIAL_PRESETS,
  INITIAL_QUESTIONS,
  INITIAL_REPORTS,
  INITIAL_STATS,
} from './mockAdminData';
import { adminApiClient } from './adminApiClient';
import type {
  AiConfig,
  AuditLogItem,
  CommunityPostItem,
  CrawlerConfig,
  DemoPresetItem,
  KnowledgeArticleItem,
  ModerationReportItem,
  QuizQuestionItem,
  ScamCategoryItem,
  SystemStats,
  AppUserItem,
  UserTier,
  UserStatus,
  UserStats,
} from '../types/admin';

// Local storage keys for persistent offline administration
const STORAGE_KEYS = {
  STATS: 'scamora_admin_stats',
  AI_CONFIG: 'scamora_admin_ai_config',
  CRAWLER_CONFIG: 'scamora_admin_crawler_config',
  PRESETS: 'scamora_admin_presets',
  ARTICLES: 'scamora_admin_articles',
  CATEGORIES: 'scamora_admin_categories',
  QUESTIONS: 'scamora_admin_questions',
  POSTS: 'scamora_admin_posts',
  REPORTS: 'scamora_admin_reports',
  LOGS: 'scamora_admin_logs',
  USERS: 'scamora_admin_users',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors
  }
}

export const adminService = {
  // System Overview
  async getStats(): Promise<SystemStats> {
    try {
      const res = await adminApiClient.get('/stats');
      if (res.data?.success && res.data.data) {
        const merged: SystemStats = {
          ...INITIAL_STATS,
          ...res.data.data,
          riskDistribution: {
            ...INITIAL_STATS.riskDistribution,
            ...(res.data.data.riskDistribution || {}),
          },
          scamTypeBreakdown: {
            ...INITIAL_STATS.scamTypeBreakdown,
            ...(res.data.data.scamTypeBreakdown || {}),
          },
          hourlyScans24h: res.data.data.hourlyScans24h || INITIAL_STATS.hourlyScans24h,
          aiTelemetry: res.data.data.aiTelemetry || INITIAL_STATS.aiTelemetry,
          visitorStats: res.data.data.visitorStats || INITIAL_STATS.visitorStats,
        };
        setStored(STORAGE_KEYS.STATS, merged);
        return merged;
      }
    } catch {
      // Backend unavailable, fallback
    }
    const stored = getStored<SystemStats>(STORAGE_KEYS.STATS, INITIAL_STATS);
    return {
      ...INITIAL_STATS,
      ...stored,
      riskDistribution: {
        ...INITIAL_STATS.riskDistribution,
        ...(stored.riskDistribution || {}),
      },
      scamTypeBreakdown: {
        ...INITIAL_STATS.scamTypeBreakdown,
        ...(stored.scamTypeBreakdown || {}),
      },
      hourlyScans24h: stored.hourlyScans24h || INITIAL_STATS.hourlyScans24h,
      aiTelemetry: stored.aiTelemetry || INITIAL_STATS.aiTelemetry,
      visitorStats: stored.visitorStats || INITIAL_STATS.visitorStats,
    };
  },

  // AI Engine Configuration
  async getAiConfig(): Promise<AiConfig> {
    try {
      const res = await adminApiClient.get('/ai-config');
      if (res.data?.success && res.data.data) {
        setStored(STORAGE_KEYS.AI_CONFIG, res.data.data);
        return res.data.data;
      }
    } catch {
      // Backend unavailable
    }
    return getStored<AiConfig>(STORAGE_KEYS.AI_CONFIG, INITIAL_AI_CONFIG);
  },

  async updateAiConfig(config: Partial<AiConfig>): Promise<AiConfig> {
    const current = await this.getAiConfig();
    const updated = { ...current, ...config };
    try {
      await adminApiClient.put('/ai-config', updated);
    } catch {
      // Fallback
    }
    setStored(STORAGE_KEYS.AI_CONFIG, updated);
    await this.logAction('UPDATE_AI_CONFIG', 'AI Engine', `Model: ${updated.geminiModel}, Provider: ${updated.activeProvider}`);
    return updated;
  },

  async testAiPing(customPrompt?: string): Promise<{ success: boolean; latencyMs: number; model: string; message: string; reply?: string }> {
    const t0 = Date.now();
    const prompt = customPrompt || 'Tes koneksi sistem Scamora AI.';
    try {
      const res = await adminApiClient.post('/test-ai', { prompt });
      if (res.data?.success) {
        return {
          success: true,
          latencyMs: res.data.data.latencyMs || (Date.now() - t0),
          model: res.data.data.model || 'gemini-3.5-flash-lite',
          message: res.data.data.message || 'Koneksi ke Gemini AI berhasil!',
          reply: res.data.data.message,
        };
      }
    } catch {
      // Fallback simulated ping
    }
    await new Promise((r) => setTimeout(r, 640));
    return {
      success: true,
      latencyMs: 640,
      model: 'gemini-3.5-flash-lite',
      message: 'Simulasi ping inferensi Google Gemini berhasil (Mode Offline).',
      reply: '{"status":"ok","latency":640,"mode":"offline_simulation"}',
    };
  },

  // Crawler Configuration
  async getCrawlerConfig(): Promise<CrawlerConfig> {
    try {
      const res = await adminApiClient.get('/crawler-config');
      if (res.data?.success && res.data.data) {
        setStored(STORAGE_KEYS.CRAWLER_CONFIG, res.data.data);
        return res.data.data;
      }
    } catch {
      // Fallback
    }
    return getStored<CrawlerConfig>(STORAGE_KEYS.CRAWLER_CONFIG, INITIAL_CRAWLER_CONFIG);
  },

  async updateCrawlerConfig(config: Partial<CrawlerConfig>): Promise<CrawlerConfig> {
    const current = await this.getCrawlerConfig();
    const updated = { ...current, ...config };
    try {
      await adminApiClient.put('/crawler-config', updated);
    } catch {
      // Fallback
    }
    setStored(STORAGE_KEYS.CRAWLER_CONFIG, updated);
    await this.logAction('UPDATE_CRAWLER_CONFIG', 'Web Crawler', `Timeout: ${updated.timeoutMs}ms, MaxSize: ${updated.maxBytesKb}KB`);
    return updated;
  },

  // Demo Presets Management
  async getPresets(): Promise<DemoPresetItem[]> {
    try {
      const res = await adminApiClient.get('/presets');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStored(STORAGE_KEYS.PRESETS, res.data.data);
        return res.data.data;
      }
    } catch {
      // Fallback
    }
    return getStored<DemoPresetItem[]>(STORAGE_KEYS.PRESETS, INITIAL_PRESETS);
  },

  async createPreset(preset: Omit<DemoPresetItem, 'id' | 'updatedAt'>): Promise<DemoPresetItem> {
    const list = await this.getPresets();
    const newPreset: DemoPresetItem = {
      ...preset,
      id: `preset-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    try {
      const res = await adminApiClient.post('/presets', newPreset);
      if (res.data?.success && res.data.data) {
        list.unshift(res.data.data);
        setStored(STORAGE_KEYS.PRESETS, list);
        await this.logAction('CREATE_PRESET', newPreset.title, `Tipe: ${newPreset.type}, Skor: ${newPreset.expectedScore}`);
        return res.data.data;
      }
    } catch {
      // Fallback
    }
    list.unshift(newPreset);
    setStored(STORAGE_KEYS.PRESETS, list);
    await this.logAction('CREATE_PRESET', newPreset.title, `Tipe: ${newPreset.type}, Skor: ${newPreset.expectedScore}`);
    return newPreset;
  },

  async updatePreset(id: string, updates: Partial<DemoPresetItem>): Promise<DemoPresetItem | null> {
    const list = await this.getPresets();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      await adminApiClient.put(`/presets/${id}`, list[index]);
    } catch {
      // Fallback
    }
    setStored(STORAGE_KEYS.PRESETS, list);
    await this.logAction('UPDATE_PRESET', list[index].title, `Diperbarui oleh administrator`);
    return list[index];
  },

  async deletePreset(id: string): Promise<boolean> {
    const list = await this.getPresets();
    const target = list.find((p) => p.id === id);
    const filtered = list.filter((p) => p.id !== id);
    try {
      await adminApiClient.delete(`/presets/${id}`);
    } catch {
      // Fallback
    }
    setStored(STORAGE_KEYS.PRESETS, filtered);
    if (target) {
      await this.logAction('DELETE_PRESET', target.title, `Preset dihapus`, 'warning');
    }
    return true;
  },

  async togglePreset(id: string): Promise<boolean> {
    const list = await this.getPresets();
    const item = list.find((p) => p.id === id);
    if (!item) return false;
    item.isActive = !item.isActive;
    item.updatedAt = new Date().toISOString();
    try {
      await adminApiClient.put(`/presets/${id}`, { isActive: item.isActive });
    } catch {}
    setStored(STORAGE_KEYS.PRESETS, list);
    await this.logAction('TOGGLE_PRESET', item.title, `Status aktif: ${item.isActive}`);
    return true;
  },

  // Knowledge Base Articles
  async getArticles(): Promise<KnowledgeArticleItem[]> {
    try {
      const res = await adminApiClient.get('/articles');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStored(STORAGE_KEYS.ARTICLES, res.data.data);
        return res.data.data;
      }
    } catch {}
    return getStored<KnowledgeArticleItem[]>(STORAGE_KEYS.ARTICLES, INITIAL_ARTICLES);
  },

  async createArticle(article: Omit<KnowledgeArticleItem, 'id' | 'views' | 'updatedAt'>): Promise<KnowledgeArticleItem> {
    const list = await this.getArticles();
    const newArt: KnowledgeArticleItem = {
      ...article,
      id: `art-${Date.now()}`,
      views: 0,
      updatedAt: new Date().toISOString(),
    };
    try {
      const res = await adminApiClient.post('/articles', newArt);
      if (res.data?.success && res.data.data) {
        list.unshift(res.data.data);
        setStored(STORAGE_KEYS.ARTICLES, list);
        await this.logAction('CREATE_ARTICLE', newArt.title, `Kategori: ${newArt.categoryName}`);
        return res.data.data;
      }
    } catch {}
    list.unshift(newArt);
    setStored(STORAGE_KEYS.ARTICLES, list);
    await this.logAction('CREATE_ARTICLE', newArt.title, `Kategori: ${newArt.categoryName}`);
    return newArt;
  },

  async updateArticle(id: string, updates: Partial<KnowledgeArticleItem>): Promise<KnowledgeArticleItem | null> {
    const list = await this.getArticles();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    try {
      await adminApiClient.put(`/articles/${id}`, updates);
    } catch {}
    setStored(STORAGE_KEYS.ARTICLES, list);
    await this.logAction('UPDATE_ARTICLE', list[idx].title, 'Artikel diperbarui');
    return list[idx];
  },

  async deleteArticle(id: string): Promise<boolean> {
    const list = await this.getArticles();
    const filtered = list.filter((a) => a.id !== id);
    try {
      await adminApiClient.delete(`/articles/${id}`);
    } catch {}
    setStored(STORAGE_KEYS.ARTICLES, filtered);
    await this.logAction('DELETE_ARTICLE', id, 'Artikel dihapus', 'warning');
    return true;
  },

  // Categories
  async getCategories(): Promise<ScamCategoryItem[]> {
    try {
      const res = await adminApiClient.get('/categories');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStored(STORAGE_KEYS.CATEGORIES, res.data.data);
        return res.data.data;
      }
    } catch {}
    return getStored<ScamCategoryItem[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  // Guardian Challenge Questions
  async getQuestions(): Promise<QuizQuestionItem[]> {
    try {
      const res = await adminApiClient.get('/questions');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStored(STORAGE_KEYS.QUESTIONS, res.data.data);
        return res.data.data;
      }
    } catch {}
    return getStored<QuizQuestionItem[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  },

  async createQuestion(question: Omit<QuizQuestionItem, 'id'>): Promise<QuizQuestionItem> {
    const list = await this.getQuestions();
    const newQ: QuizQuestionItem = {
      ...question,
      id: `quiz-${Date.now()}`,
    };
    try {
      const res = await adminApiClient.post('/questions', newQ);
      if (res.data?.success && res.data.data) {
        list.push(res.data.data);
        setStored(STORAGE_KEYS.QUESTIONS, list);
        await this.logAction('CREATE_QUIZ_QUESTION', newQ.scenario.slice(0, 30), `Poin: ${newQ.points}`);
        return res.data.data;
      }
    } catch {}
    list.push(newQ);
    setStored(STORAGE_KEYS.QUESTIONS, list);
    await this.logAction('CREATE_QUIZ_QUESTION', newQ.scenario.slice(0, 30), `Poin: ${newQ.points}`);
    return newQ;
  },

  async updateQuestion(id: string, updates: Partial<QuizQuestionItem>): Promise<QuizQuestionItem | null> {
    const list = await this.getQuestions();
    const idx = list.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates };
    try {
      await adminApiClient.put(`/questions/${id}`, updates);
    } catch {}
    setStored(STORAGE_KEYS.QUESTIONS, list);
    await this.logAction('UPDATE_QUIZ_QUESTION', list[idx].scenario.slice(0, 30), `Poin: ${list[idx].points}`);
    return list[idx];
  },

  async deleteQuestion(id: string): Promise<boolean> {
    const list = await this.getQuestions();
    const filtered = list.filter((q) => q.id !== id);
    try {
      await adminApiClient.delete(`/questions/${id}`);
    } catch {}
    setStored(STORAGE_KEYS.QUESTIONS, filtered);
    await this.logAction('DELETE_QUIZ_QUESTION', id, 'Soal kuis dihapus', 'warning');
    return true;
  },

  // Moderation Queue
  async getCommunityPosts(): Promise<CommunityPostItem[]> {
    try {
      const res = await adminApiClient.get('/posts');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStored(STORAGE_KEYS.POSTS, res.data.data);
        return res.data.data;
      }
    } catch {}
    return getStored<CommunityPostItem[]>(STORAGE_KEYS.POSTS, INITIAL_COMMUNITY_POSTS);
  },

  async updatePostStatus(id: string, status: 'published' | 'hidden' | 'under_review'): Promise<boolean> {
    const list = await this.getCommunityPosts();
    const post = list.find((p) => p.id === id);
    if (!post) return false;
    post.status = status;
    try {
      await adminApiClient.put(`/posts/${id}/status`, { status });
    } catch {}
    setStored(STORAGE_KEYS.POSTS, list);
    await this.logAction('MODERATE_POST', post.title, `Status diubah ke ${status}`);
    return true;
  },

  async updateCommunityPost(updated: CommunityPostItem): Promise<boolean> {
    const list = await this.getCommunityPosts();
    const idx = list.findIndex((p) => p.id === updated.id);
    if (idx === -1) return false;
    list[idx] = updated;
    try {
      await adminApiClient.put(`/posts/${updated.id}`, updated);
    } catch {}
    setStored(STORAGE_KEYS.POSTS, list);
    await this.logAction('UPDATE_COMMUNITY_POST', updated.title, `Postingan komunitas diperbarui oleh admin`);
    return true;
  },

  async deleteCommunityPost(id: string): Promise<boolean> {
    const list = await this.getCommunityPosts();
    const post = list.find((p) => p.id === id);
    const filtered = list.filter((p) => p.id !== id);
    try {
      await adminApiClient.delete(`/posts/${id}`);
    } catch {}
    setStored(STORAGE_KEYS.POSTS, filtered);
    if (post) {
      await this.logAction('DELETE_COMMUNITY_POST', post.title, `Postingan komunitas dihapus`, 'warning');
    }
    return true;
  },

  async createCommunityPost(data: Omit<CommunityPostItem, 'id' | 'createdAt'>): Promise<CommunityPostItem> {
    const list = await this.getCommunityPosts();
    const newPost: CommunityPostItem = {
      ...data,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    try {
      const res = await adminApiClient.post('/posts', newPost);
      if (res.data?.success && res.data.data) {
        list.unshift(res.data.data);
        setStored(STORAGE_KEYS.POSTS, list);
        await this.logAction('CREATE_COMMUNITY_POST', newPost.title, `Postingan baru ditambahkan admin`);
        return res.data.data;
      }
    } catch {}
    list.unshift(newPost);
    setStored(STORAGE_KEYS.POSTS, list);
    await this.logAction('CREATE_COMMUNITY_POST', newPost.title, `Postingan baru ditambahkan admin`);
    return newPost;
  },

  async getReports(): Promise<ModerationReportItem[]> {
    try {
      const res = await adminApiClient.get('/reports');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStored(STORAGE_KEYS.REPORTS, res.data.data);
        return res.data.data;
      }
    } catch {}
    return getStored<ModerationReportItem[]>(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },

  async resolveReport(id: string, action: 'resolve' | 'dismiss'): Promise<boolean> {
    const list = await this.getReports();
    const rep = list.find((r) => r.id === id);
    if (!rep) return false;
    rep.status = action === 'resolve' ? 'resolved' : 'dismissed';
    try {
      await adminApiClient.put(`/reports/${id}/resolve`, { action });
    } catch {}
    setStored(STORAGE_KEYS.REPORTS, list);
    await this.logAction('RESOLVE_REPORT', rep.postTitle, `Laporan diselesaikan (${action})`);
    return true;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const res = await adminApiClient.get('/audit-logs');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStored(STORAGE_KEYS.LOGS, res.data.data);
        return res.data.data;
      }
    } catch {}
    return getStored<AuditLogItem[]>(STORAGE_KEYS.LOGS, INITIAL_AUDIT_LOGS);
  },

  async logAction(
    action: string,
    target: string,
    details: string,
    severity: 'info' | 'warning' | 'critical' = 'info'
  ): Promise<void> {
    const logs = await this.getAuditLogs();
    const item: AuditLogItem = {
      id: `log-${Date.now()}`,
      actor: 'admin@scamora.id',
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
      severity,
    };
    try {
      await adminApiClient.post('/audit-logs', item);
    } catch {}
    logs.unshift(item);
    setStored(STORAGE_KEYS.LOGS, logs.slice(0, 100)); // Keep latest 100 logs
  },

  // User Accounts Management (Guest & Verified)
  async getUsers(params?: { search?: string; tier?: string; status?: string }): Promise<{ users: AppUserItem[]; stats: UserStats }> {
    try {
      const res = await adminApiClient.get('/users', { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        const stats: UserStats = res.data.stats || {
          totalUsers: res.data.data.length,
          verifiedUsers: res.data.data.filter((u: AppUserItem) => u.tier === 'verified').length,
          guestUsers: res.data.data.filter((u: AppUserItem) => u.tier === 'guest').length,
          activeUsers: res.data.data.filter((u: AppUserItem) => u.status === 'active').length,
        };
        setStored(STORAGE_KEYS.USERS, res.data.data);
        return { users: res.data.data, stats };
      }
    } catch {}

    const stored = getStored<AppUserItem[]>(STORAGE_KEYS.USERS, []);

    let filtered = [...stored];
    if (params?.tier && params.tier !== 'all') {
      filtered = filtered.filter((u) => u.tier === params.tier);
    }
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((u) => u.status === params.status);
    }
    if (params?.search && params.search.trim()) {
      const s = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(s) ||
          u.fullName.toLowerCase().includes(s) ||
          (u.email && u.email.toLowerCase().includes(s))
      );
    }

    const stats: UserStats = {
      totalUsers: stored.length,
      verifiedUsers: stored.filter((u) => u.tier === 'verified').length,
      guestUsers: stored.filter((u) => u.tier === 'guest').length,
      activeUsers: stored.filter((u) => u.status === 'active').length,
    };

    return { users: filtered, stats };
  },

  async createUser(data: { username: string; fullName: string; email?: string; tier: UserTier; role?: string; status?: UserStatus; password?: string }): Promise<AppUserItem> {
    const list = getStored<AppUserItem[]>(STORAGE_KEYS.USERS, []);
    const newUser: AppUserItem = {
      id: `usr-${Date.now()}`,
      username: data.username.trim().toLowerCase(),
      fullName: data.fullName.trim(),
      email: data.email?.trim() || '',
      tier: data.tier,
      role: (data.role as 'admin' | 'user') || 'user',
      status: data.status || 'active',
      scanCount: 0,
      reportCount: 0,
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await adminApiClient.post('/users', { ...data, id: newUser.id });
      if (res.data?.success && res.data.data) {
        list.unshift(res.data.data);
        setStored(STORAGE_KEYS.USERS, list);
        await this.logAction('CREATE_USER', newUser.username, `Menambahkan pengguna baru (${newUser.tier})`);
        return res.data.data;
      }
    } catch {}

    list.unshift(newUser);
    setStored(STORAGE_KEYS.USERS, list);
    await this.logAction('CREATE_USER', newUser.username, `Menambahkan pengguna baru (${newUser.tier})`);
    return newUser;
  },

  async updateUserTier(id: string, tier: UserTier): Promise<boolean> {
    try {
      await adminApiClient.put(`/users/${id}/tier`, { tier });
    } catch {}
    const list = getStored<AppUserItem[]>(STORAGE_KEYS.USERS, []);
    const target = list.find((u) => u.id === id);
    if (target) {
      target.tier = tier;
      setStored(STORAGE_KEYS.USERS, list);
      await this.logAction('UPDATE_USER_TIER', target.username, `Tingkatan diubah menjadi ${tier}`);
    }
    return true;
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<boolean> {
    try {
      await adminApiClient.put(`/users/${id}/status`, { status });
    } catch {}
    const list = getStored<AppUserItem[]>(STORAGE_KEYS.USERS, []);
    const target = list.find((u) => u.id === id);
    if (target) {
      target.status = status;
      setStored(STORAGE_KEYS.USERS, list);
      await this.logAction('UPDATE_USER_STATUS', target.username, `Status diubah menjadi ${status}`, status === 'suspended' ? 'warning' : 'info');
    }
    return true;
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      await adminApiClient.delete(`/users/${id}`);
    } catch {}
    const list = getStored<AppUserItem[]>(STORAGE_KEYS.USERS, []);
    const target = list.find((u) => u.id === id);
    const filtered = list.filter((u) => u.id !== id);
    setStored(STORAGE_KEYS.USERS, filtered);
    if (target) {
      await this.logAction('DELETE_USER', target.username, `Akun user dihapus dari sistem`, 'warning');
    }
    return true;
  },
};
