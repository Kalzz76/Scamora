import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';
import { verifyTurnstileToken } from '../src/services/turnstileService';

describe('Cloudflare Turnstile CAPTCHA Protection Tests', () => {
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
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('Service Verification (verifyTurnstileToken)', () => {
    it('memvalidasi token sukses (CAPTCHA Berhasil)', async () => {
      const result = await verifyTurnstileToken('mock-turnstile-test-pass', { action: 'login' });
      expect(result.success).toBe(true);
    });

    it('menolak token kosong', async () => {
      const result = await verifyTurnstileToken('');
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('missing-input-response');
      expect(result.errorMessage).toContain('wajib diselesaikan');
    });

    it('menolak token invalid', async () => {
      const result = await verifyTurnstileToken('mock-turnstile-test-fail');
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('invalid-input-response');
      expect(result.errorMessage).toContain('tidak valid');
    });

    it('menolak token expired (kedaluwarsa)', async () => {
      const result = await verifyTurnstileToken('mock-turnstile-test-expired');
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('timeout-or-duplicate');
      expect(result.errorMessage).toContain('kedaluwarsa');
    });

    it('mencegah serangan replay (token digunakan dua kali)', async () => {
      // Token unik pertama
      const replayToken = `mock-turnstile-test-pass-replay-${Date.now()}`;
      // Panggilan pertama lolos simulasi atau ke backend
      const first = await verifyTurnstileToken(replayToken);
      expect(first.success).toBe(true);
      // Panggilan kedua dengan token persis sama harus ditolak
      const second = await verifyTurnstileToken(replayToken);
      expect(second.success).toBe(false);
      expect(second.errorCode).toBe('timeout-or-duplicate');
      expect(second.errorMessage).toContain('sudah pernah digunakan');
    });
  });

  describe('Endpoint Protection (Login & Register)', () => {
    it('menolak POST /auth/login tanpa CAPTCHA (HTTP 422)', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'PasswordValid123!',
          // turnstileToken sengaja tidak disertakan
        }),
      });

      expect(res.status).toBe(422);
      const data = (await res.json()) as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('CAPTCHA_REQUIRED');
      expect(data.error.message).toContain('Turnstile');
    });

    it('menolak POST /auth/register tanpa CAPTCHA (HTTP 422)', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Budi Tester',
          username: `budi_turn_${Date.now()}`,
          email: `budi_turn_${Date.now()}@example.com`,
          password: 'PasswordValid123!',
          confirmPassword: 'PasswordValid123!',
          // turnstileToken sengaja tidak disertakan
        }),
      });

      expect(res.status).toBe(422);
      const data = (await res.json()) as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('CAPTCHA_REQUIRED');
    });

    it('menolak login jika token CAPTCHA invalid (HTTP 403)', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'PasswordValid123!',
          turnstileToken: 'mock-turnstile-test-fail',
        }),
      });

      expect(res.status).toBe(403);
      const data = (await res.json()) as any;
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('invalid-input-response');
    });

    it('berhasil registrasi normal saat token CAPTCHA valid', async () => {
      const unique = Date.now();
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Warga CAPTCHA Valid',
          username: `warga_captcha_${unique}`,
          email: `captcha_${unique}@example.com`,
          password: 'PasswordValid123!',
          confirmPassword: 'PasswordValid123!',
          turnstileToken: 'mock-turnstile-test-pass',
          bypassOtp: true,
        }),
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as any;
      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
    });

    it('berhasil login normal saat token CAPTCHA valid', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
          turnstileToken: 'mock-turnstile-test-pass',
        }),
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as any;
      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
    });
  });
});

