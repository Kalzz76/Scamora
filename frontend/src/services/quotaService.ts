import { adminAuth } from '../admin/services/adminAuth';

const GUEST_SCAN_COUNT_KEY = 'scamora_guest_scans';
const GUEST_SESSION_ID_KEY = 'scamora_guest_session_id';

export const quotaService = {
  getGuestSessionId(): string {
    try {
      let id = localStorage.getItem(GUEST_SESSION_ID_KEY);
      if (!id) {
        id = `gst-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(GUEST_SESSION_ID_KEY, id);
      }
      return id;
    } catch {
      return 'gst-fallback-session';
    }
  },

  getGuestScanCount(): number {
    try {
      const raw = localStorage.getItem(GUEST_SCAN_COUNT_KEY);
      return raw ? parseInt(raw, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },

  hasGuestQuota(): boolean {
    return this.getGuestScanCount() < 1;
  },

  recordGuestScan(): void {
    try {
      const nextCount = this.getGuestScanCount() + 1;
      localStorage.setItem(GUEST_SCAN_COUNT_KEY, nextCount.toString());
    } catch {
      // Ignore quota errors
    }
  },

  canScan(): boolean {
    if (adminAuth.isAuthenticated()) {
      return true; // Authenticated users have unlimited scans
    }
    return this.hasGuestQuota();
  },

  resetGuestQuota(): void {
    try {
      localStorage.removeItem(GUEST_SCAN_COUNT_KEY);
    } catch {
      // Ignore
    }
  },
};

