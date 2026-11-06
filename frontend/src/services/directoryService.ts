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

const INITIAL_DOMAINS: ScannedDomain[] = [
  { domain: 'bank-nusa-login.xyz', count: 37, riskPercent: 92, category: 'high', lastChecked: '5 menit lalu', timestamp: Date.now() - 5 * 60 * 1000 },
  { domain: 'undian-hadiah-id.top', count: 54, riskPercent: 88, category: 'high', lastChecked: '12 menit lalu', timestamp: Date.now() - 12 * 60 * 1000 },
  { domain: 'undangan-nikah-digital.top', count: 42, riskPercent: 95, category: 'high', lastChecked: '25 menit lalu', timestamp: Date.now() - 25 * 60 * 1000 },
  { domain: 'tilang-online-bayar.click', count: 29, riskPercent: 85, category: 'high', lastChecked: '45 menit lalu', timestamp: Date.now() - 45 * 60 * 1000 },
  { domain: 'resi-paket-cek.site', count: 21, riskPercent: 76, category: 'high', lastChecked: '1 jam lalu', timestamp: Date.now() - 60 * 60 * 1000 },
  { domain: 'promo-belanja-kilat.click', count: 18, riskPercent: 44, category: 'review', lastChecked: '3 jam lalu', timestamp: Date.now() - 3 * 60 * 60 * 1000 },
  { domain: 'bit.ly/undian-bca-resmi-hadiah2026', count: 15, riskPercent: 45, category: 'review', lastChecked: '4 jam lalu', timestamp: Date.now() - 4 * 60 * 60 * 1000 },
  { domain: 'toko-buku-kota.id', count: 12, riskPercent: 8, category: 'low', lastChecked: 'Kemarin', timestamp: Date.now() - 24 * 60 * 60 * 1000 },
  { domain: 'perpustakaan-kota.id', count: 9, riskPercent: 0, category: 'low', lastChecked: '2 hari lalu', timestamp: Date.now() - 48 * 60 * 60 * 1000 },
  { domain: 'tokopedia.com', count: 128, riskPercent: 0, category: 'low', lastChecked: '3 jam lalu', timestamp: Date.now() - 3 * 60 * 60 * 1000 },
];

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
    const totalDomains = 1248 + list.length - INITIAL_DOMAINS.length;
    const highRiskCount = list.filter((d) => d.category === 'high').length;
    const highRiskPercent = Math.round((highRiskCount / Math.max(1, list.length)) * 100);
    const checksToday = 86 + list.reduce((acc, curr) => (curr.lastChecked === 'Baru saja' ? acc + 1 : acc), 0);

    return {
      totalDomains,
      highRiskPercent,
      checksToday,
    };
  },
};
