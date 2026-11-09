import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';
import { usersStore } from '../src/controllers/admin.controller';

describe('Authentication & Google OAuth Tests (/api/v1/auth)', { timeout: 30000 }, () => {
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
  }, 15000);

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }, 15000);

  describe('Registrasi Akun Baru (POST /api/v1/auth/register)', () => {
    const uniqueId = Date.now();
    const validUser = {
      fullName: 'Ahmad Warga Siber',
      username: `warga_${uniqueId}`,
      email: `warga_${uniqueId}@example.com`,
      password: 'SandiAman123!',
      confirmPassword: 'SandiAman123!',
    };

    it('berhasil mendaftar dengan seluruh data yang valid dan menyimpan hash bcrypt', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUser),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
      expect(data.data.user.username).toBe(validUser.username);
      expect(data.data.user.email).toBe(validUser.email);
      expect(data.data.user.role).toBe('user');
      expect(data.data.user.tier).toBe('verified');

      // Verifikasi bahwa password disimpan dalam bentuk Bcrypt ($2a$ atau $2b$)
      const stored = usersStore.find((u) => u.username === validUser.username);
      expect(stored).toBeDefined();
      expect(stored.passwordHash).toMatch(/^\$2[ab]\$/);
    });

    it('menolak registrasi jika username sudah digunakan oleh pengguna lain (409)', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Pengguna Kloning',
          username: validUser.username,
          email: `different_${Date.now()}@example.com`,
          password: 'Password999!',
          confirmPassword: 'Password999!',
        }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('USERNAME_TAKEN');
    });

    it('menolak registrasi jika email sudah terdaftar sebelumnya (409)', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Pengguna Email Sama',
          username: `uniquename_${Date.now()}`,
          email: validUser.email,
          password: 'Password999!',
          confirmPassword: 'Password999!',
        }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EMAIL_REGISTERED');
    });

    it('menolak registrasi jika format email tidak valid (422)', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Email Rusak',
          username: `user_bademail_${Date.now()}`,
          email: 'bukan-email-valid',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        }),
      });

      expect(res.status).toBe(422);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('menolak registrasi jika kata sandi terlalu pendek atau tidak memuat angka (422)', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Sandi Lemah',
          username: `user_weaksand_${Date.now()}`,
          email: `weak_${Date.now()}@example.com`,
          password: 'hanyahuruf',
          confirmPassword: 'hanyahuruf',
        }),
      });

      expect(res.status).toBe(422);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('menolak registrasi jika konfirmasi sandi tidak cocok (422)', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Beda Sandi',
          username: `user_mismatch_${Date.now()}`,
          email: `mismatch_${Date.now()}@example.com`,
          password: 'SandiAman123!',
          confirmPassword: 'SandiBedaTotal999!',
        }),
      });

      expect(res.status).toBe(422);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('menolak registrasi jika field form kosong (422)', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: '   ',
          username: '',
          email: '',
          password: '',
        }),
      });

      expect(res.status).toBe(422);
    });
  });

  describe('Login Akun (POST /api/v1/auth/login)', () => {
    const testUsername = `login_user_${Date.now()}`;
    const testEmail = `${testUsername}@example.com`;
    const testPassword = 'PasswordValid123!';

    beforeAll(async () => {
      // Daftarkan 1 akun untuk diuji login
      await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Tester Login',
          username: testUsername,
          email: testEmail,
          password: testPassword,
          confirmPassword: testPassword,
        }),
      });
    });

    it('berhasil login menggunakan USERNAME dan password yang benar', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testUsername,
          password: testPassword,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
      expect(data.data.user.username).toBe(testUsername);
    });

    it('berhasil login menggunakan EMAIL dan password yang benar', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testEmail, // Diisi email
          password: testPassword,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
      expect(data.data.user.email).toBe(testEmail);
    });

    it('menolak login dengan password yang salah (401)', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: testUsername,
          password: 'PasswordSalah999!',
        }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('menolak login dengan akun yang belum pernah terdaftar (401)', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'user_antah_berantah_999999',
          password: 'Password123!',
        }),
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('menolak login dengan formulir kosong (422)', async () => {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: '',
          password: '',
        }),
      });

      expect(res.status).toBe(422);
    });
  });

  describe('Google OAuth 2.0 (Redirect & Token Verification)', () => {
    it('mengembalikan URL otorisasi Google pada GET /auth/google', async () => {
      const res = await fetch(`${baseUrl}/auth/google?format=json`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.url).toBeDefined();
    });

    it('berhasil mendaftar/login via Google token credential', async () => {
      const googleSub = `google_sub_${Date.now()}`;
      const googleEmail = `warga.google.${Date.now()}@gmail.com`;
      const mockIdToken = `mock-google-id-token-:${googleEmail}:Warga Google Teruji:${googleSub}`;

      const res = await fetch(`${baseUrl}/auth/google/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: mockIdToken }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
      expect(data.data.user.email).toBe(googleEmail);
      expect(data.data.user.name).toBe('Warga Google Teruji');
      expect(data.data.user.authProvider).toBe('google');

      // Login ulang dengan akun Google yang sama -> berhasil mengenali akun yang sudah ada
      const resSecond = await fetch(`${baseUrl}/auth/google/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: mockIdToken }),
      });

      expect(resSecond.status).toBe(200);
      const dataSecond = await resSecond.json();
      expect(dataSecond.data.user.id).toBe(data.data.user.id);
    });

    it('menolak Google token auth jika credential tidak disertakan (422)', async () => {
      const res = await fetch(`${baseUrl}/auth/google/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(422);
    });
  });

  describe('Session & Logout', () => {
    it('memvalidasi endpoint logout (POST /api/v1/auth/logout)', async () => {
      const res = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
