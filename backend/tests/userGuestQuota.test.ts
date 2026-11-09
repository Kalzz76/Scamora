import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';
import { createAdminToken } from '../src/services/adminAuthService';

describe('User Dashboard & Guest Quota Integration Tests (/api/v1)', { timeout: 90000 }, () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
        resolve();
      });
    });
  }, 30000);

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }, 30000);

  describe('Guest Scan Quota (1-scan total limit across URL & Chat)', () => {
    it('allows 1st scan for guest session, then rejects 2nd scan with 403 GUEST_LIMIT_REACHED', async () => {
      const guestSessionId = `test-guest-session-${Date.now()}`;

      // 1st scan: URL check -> should succeed (200)
      const res1 = await fetch(`${baseUrl}/analyze/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-session-id': guestSessionId,
        },
        body: JSON.stringify({
          url: 'https://tokopedia.com',
          privacy_consent: true,
        }),
      });

      expect(res1.status).toBe(200);
      const body1 = await res1.json();
      expect(body1.success).toBe(true);

      // 2nd scan: WhatsApp chat check on SAME guest session -> MUST BE BLOCKED (403)
      const res2 = await fetch(`${baseUrl}/analyze/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-session-id': guestSessionId,
        },
        body: JSON.stringify({
          text: 'Halo kak, kami dari Shopee. Hadiah 10jt transfer biaya pajak 50rb sekarang ya',
          privacy_consent: true,
        }),
      });

      expect(res2.status).toBe(403);
      const body2 = await res2.json();
      expect(body2.success).toBe(false);
      expect(body2.error.code).toBe('GUEST_LIMIT_REACHED');
      expect(body2.error.message).toContain('Kesempatan pemindaian gratis Anda telah digunakan');
    }, 45000);

    it('blocks URL check if guest already performed a Chat check first', async () => {
      const guestSessionId = `test-guest-chat-first-${Date.now()}`;

      // 1st scan: Chat check -> succeeds
      const res1 = await fetch(`${baseUrl}/analyze/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-session-id': guestSessionId,
        },
        body: JSON.stringify({
          text: 'Undangan pernikahan kami buka berkas undangan.apk di bawah ini ya',
          privacy_consent: true,
        }),
      });

      expect(res1.status).toBe(200);

      // 2nd scan: URL check -> blocked!
      const res2 = await fetch(`${baseUrl}/analyze/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-guest-session-id': guestSessionId,
        },
        body: JSON.stringify({
          url: 'https://bca-klik.com',
          privacy_consent: true,
        }),
      });

      expect(res2.status).toBe(403);
      const body2 = await res2.json();
      expect(body2.error.code).toBe('GUEST_LIMIT_REACHED');
    }, 45000);
  });

  describe('Authenticated User Capabilities', () => {
    const userToken = createAdminToken('test_user_alpha', 'user', 'verified');

    it('authenticated user can scan multiple times without being limited by guest quota', async () => {
      // 1st scan (Chat)
      const res1 = await fetch(`${baseUrl}/analyze/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          text: 'Pemberitahuan resmi kurir paket barang Anda telah tiba di gerai kami',
          privacy_consent: true,
        }),
      });
      expect(res1.status).toBe(200);

      // 2nd scan (URL)
      const res2 = await fetch(`${baseUrl}/analyze/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          url: 'https://tokopedia.com',
          privacy_consent: true,
        }),
      });
      expect(res2.status).toBe(200);

      // 3rd scan (Chat)
      const res3 = await fetch(`${baseUrl}/analyze/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          text: 'Selamat pagi bapak ibu nasabah bank transfer saldo konfirmasi sekarang',
          privacy_consent: true,
        }),
      });
      expect(res3.status).toBe(200);
    }, 60000);

    it('rejects unauthenticated access to /user/profile with 401', async () => {
      const res = await fetch(`${baseUrl}/user/profile`);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns user profile, stats, and history for authenticated user', async () => {
      // GET Profile
      const profRes = await fetch(`${baseUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(profRes.status).toBe(200);
      const profBody = await profRes.json();
      expect(profBody.success).toBe(true);
      expect(profBody.data.username).toBe('test_user_alpha');
      expect(profBody.data.tier).toBe('verified');

      // GET Stats
      const statsRes = await fetch(`${baseUrl}/user/stats`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(statsRes.status).toBe(200);
      const statsBody = await statsRes.json();
      expect(statsBody.success).toBe(true);
      expect(statsBody.data.isUnlimited).toBe(true);
      expect(statsBody.data.totalScans).toBeGreaterThanOrEqual(2);

      // GET History
      const histRes = await fetch(`${baseUrl}/user/history`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      expect(histRes.status).toBe(200);
      const histBody = await histRes.json();
      expect(histBody.success).toBe(true);
      expect(Array.isArray(histBody.data)).toBe(true);
      expect(histBody.data.length).toBeGreaterThanOrEqual(2);
      // All items belong strictly to test_user_alpha
      for (const item of histBody.data) {
        expect(item.userId).toBe('test_user_alpha');
      }
    });

    it('ensures user cannot see other users scan history', async () => {
      const userBetaToken = createAdminToken('test_user_beta', 'user', 'verified');

      // User beta has 0 scans initially
      const histBetaRes = await fetch(`${baseUrl}/user/history`, {
        headers: { Authorization: `Bearer ${userBetaToken}` },
      });
      expect(histBetaRes.status).toBe(200);
      const histBeta = await histBetaRes.json();
      expect(histBeta.data.length).toBe(0); // Beta sees zero scans from Alpha!
    });
  });
});
