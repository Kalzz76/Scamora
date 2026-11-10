import { apiClient } from './apiClient';

/**
 * Scamora - Direktori Komunitas & Riwayat Pemindaian Domain
 * Menyimpan dan mengelola data domain yang telah diperiksa oleh pengguna
 */

export interface ScannedDomain {
  domain: string;
  count: number;
  riskPercent: number;
  category: 'high' | 'review' | 'low';
  lastChecked: string;
  timestamp: number;
}

const STORAGE_KEY = 'scamora_community_domains_v1';

const INITIAL_DOMAINS: ScannedDomain[] = [];

export const directoryService = {
  getDomains(): ScannedDomain[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_DOMAINS;
  },

  async syncRecentFromApi(): Promise<ScannedDomain[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>('/scanned-domains');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped: ScannedDomain[] = res.data.data.map((d: any) => ({
          domain: d.domain,
          count: d.count || 1,
          riskPercent: d.riskScore || 0,
          category: d.riskCategory || (d.riskScore >= 60 ? 'high' : d.riskScore >= 30 ? 'review' : 'low'),
          lastChecked: d.lastCheckedAt ? new Date(d.lastCheckedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja',
          timestamp: d.lastCheckedAt ? new Date(d.lastCheckedAt).getTime() : Date.now(),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch {}
    return this.getDomains();
  },

  recordDomain(rawInput: string, riskScore: number, riskLevel?: 'high' | 'review' | 'low') {
    let host = rawInput.trim();
    try {
      if (/^https?:\/\//i.test(host)) {
        const u = new URL(host);
        host = u.hostname;
      } else if (host.includes('/')) {
        const u = new URL('https://' + host);
        host = u.hostname;
      }
    } catch {
      // use raw input trimmed
    }
    host = host.toLowerCase().replace(/^(https?:\/\/)/, '').replace(/\/.*$/, '');
    if (!host || host.length < 3) return;

    const list = this.getDomains();
    const existingIndex = list.findIndex((item) => item.domain.toLowerCase() === host);

    const category: 'high' | 'review' | 'low' =
      riskLevel || (riskScore >= 60 ? 'high' : riskScore >= 30 ? 'review' : 'low');

    if (existingIndex >= 0) {
      const item = list[existingIndex];
      const newCount = item.count + 1;
      const newPercent = Math.round((item.riskPercent * item.count + riskScore) / newCount);
      list[existingIndex] = {
        ...item,
        count: newCount,
        riskPercent: newPercent,
        category: newPercent >= 60 ? 'high' : newPercent >= 30 ? 'review' : 'low',
        lastChecked: 'Baru saja',
        timestamp: Date.now(),
      };
      // Move to top
      const updatedItem = list.splice(existingIndex, 1)[0];
      list.unshift(updatedItem);
    } else {
      list.unshift({
        domain: host,
        count: 1,
        riskPercent: Math.round(riskScore),
        category,
        lastChecked: 'Baru saja',
        timestamp: Date.now(),
      });
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // storage unavailable
    }
  },

  addManualReport(domain: string, _modus?: string, _notes?: string) {
    this.recordDomain(domain, 85, 'high');
  },

  getStats(): { totalDomains: number; highRiskPercent: number; checksToday: number } {
    const list = this.getDomains();
    const totalDomains = list.length;
    const highRiskCount = list.filter((d) => d.category === 'high').length;
    const highRiskPercent = list.length > 0 ? Math.round((highRiskCount / list.length) * 100) : 0;
    const checksToday = list.filter((d) => Date.now() - d.timestamp < 86400000).length;

    return {
      totalDomains,
      highRiskPercent,
      checksToday,
    };
  },
};
