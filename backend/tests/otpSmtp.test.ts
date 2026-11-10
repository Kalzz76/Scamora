import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import app from '../src/app';
import {
  createAndSendOtp,
  verifyOtpCode,
  otpsStore,
  passwordResetTokensStore,
  validateAndConsumeResetToken,
  hashOtp,
} from '../src/services/otpService';
import { verifySmtpConnection } from '../src/services/mailService';
import { usersStore } from '../src/controllers/admin.controller';

describe('SMTP OTP Verification & Password Reset Tests', { timeout: 20000 }, () => {
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

  describe('1. OTP Service Unit Tests (createAndSendOtp & verifyOtpCode)', () => {
    const testEmail = `test_otp_${Date.now()}@scamora.test`;

    it('berhasil menghasilkan OTP 6 digit dan menyimpannya dalam bentuk hash (bukan plaintext)', async () => {
      const genRes = await createAndSendOtp(testEmail, 'EMAIL_VERIFICATION', { test: true });
      expect(genRes.success).toBe(true);
      expect(genRes.expiresAt).toBeDefined();

      const stored = otpsStore.find((o) => o.email === testEmail && o.purpose === 'EMAIL_VERIFICATION');
      expect(stored).toBeDefined();
      expect(stored?.otpHash).toBeDefined();
      // Pastikan hash SHA-256 (64 karakter hex), bukan plaintext 6 digit
      expect(stored?.otpHash.length).toBe(64);
      expect(stored?.isUsed).toBe(false);
      expect(stored?.attemptCount).toBe(0);
    });

    it('menolak pengiriman ulang (resend) jika masih dalam batas cooldown 60 detik', async () => {
      const resendRes = await createAndSendOtp(testEmail, 'EMAIL_VERIFICATION');
      expect(resendRes.success).toBe(false);
      expect(resendRes.cooldownRemaining).toBeGreaterThan(0);
      expect(resendRes.error).toContain('Silakan tunggu');
    });

    it('menolak verifikasi jika kode OTP salah dan mengurangi sisa percobaan', async () => {
      const verifyRes = await verifyOtpCode(testEmail, '999999', 'EMAIL_VERIFICATION');
      expect(verifyRes.success).toBe(false);
      expect(verifyRes.errorCode).toBe('INVALID_OTP');
      expect(verifyRes.errorMessage).toContain('Sisa kesempatan');

      const stored = otpsStore.find((o) => o.email === testEmail && o.purpose === 'EMAIL_VERIFICATION');
      expect(stored?.attemptCount).toBe(1);
    });

    it('mengunci dan membatalkan OTP jika salah memasukkan lebih dari 5 kali', async () => {
      const stored = otpsStore.find((o) => o.email === testEmail && o.purpose === 'EMAIL_VERIFICATION');
      if (stored) stored.attemptCount = 4; // Set ke 4 percobaan

      const failRes = await verifyOtpCode(testEmail, '000000', 'EMAIL_VERIFICATION');
      expect(failRes.success).toBe(false);
      expect(failRes.errorCode).toBe('MAX_ATTEMPTS_EXCEEDED');
      expect(stored?.isUsed).toBe(true); // Harus otomatis dinonaktifkan
    });

    it('menolak OTP yang sudah kedaluwarsa (masa berlaku habis)', async () => {
      const expiredEmail = `expired_${Date.now()}@scamora.test`;
      otpsStore.push({
        id: `otp-exp-${Date.now()}`,
        email: expiredEmail,
        otpHash: hashOtp('123456'),
        purpose: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() - 1000), // Sudah lewat
        attemptCount: 0,
        isUsed: false,
        createdAt: new Date(Date.now() - 6 * 60 * 1000),
        updatedAt: new Date(),
      });

      const expRes = await verifyOtpCode(expiredEmail, '123456', 'EMAIL_VERIFICATION');
      expect(expRes.success).toBe(false);
      expect(expRes.errorCode).toBe('OTP_EXPIRED');
    });

    it('memisahkan tujuan OTP (EMAIL_VERIFICATION vs PASSWORD_RESET)', async () => {
      const dualEmail = `dual_${Date.now()}@scamora.test`;
      otpsStore.push({
        id: `otp-verif-${Date.now()}`,
        email: dualEmail,
        otpHash: hashOtp('111222'),
        purpose: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attemptCount: 0,
        isUsed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Coba verifikasi dengan purpose PASSWORD_RESET (harus gagal NOT_FOUND)
      const wrongPurposeRes = await verifyOtpCode(dualEmail, '111222', 'PASSWORD_RESET');
      expect(wrongPurposeRes.success).toBe(false);
      expect(wrongPurposeRes.errorCode).toBe('NOT_FOUND');

      // Verifikasi dengan purpose EMAIL_VERIFICATION (harus sukses)
      const correctPurposeRes = await verifyOtpCode(dualEmail, '111222', 'EMAIL_VERIFICATION');
      expect(correctPurposeRes.success).toBe(true);
    });

    it('mencegah serangan replay (OTP tidak dapat digunakan dua kali)', async () => {
      const replayEmail = `replay_${Date.now()}@scamora.test`;
      otpsStore.push({
        id: `otp-rep-${Date.now()}`,
        email: replayEmail,
        otpHash: hashOtp('333444'),
        purpose: 'EMAIL_VERIFICATION',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attemptCount: 0,
        isUsed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Pemakaian pertama
      const first = await verifyOtpCode(replayEmail, '333444', 'EMAIL_VERIFICATION');
      expect(first.success).toBe(true);

      // Pemakaian kedua (harus ditolak karena is_used = true)
      const second = await verifyOtpCode(replayEmail, '333444', 'EMAIL_VERIFICATION');
      expect(second.success).toBe(false);
      expect(['ALREADY_USED', 'NOT_FOUND']).toContain(second.errorCode);
    });
  });

  describe('2. Endpoint Pendaftaran dengan Verifikasi OTP', () => {
    const regTimestamp = Date.now();
    const candidateUser = {
      fullName: 'Budi Santoso',
      username: `budi_otp_${regTimestamp}`,
      email: `budi.otp.${regTimestamp}@gmail.com`,
      password: 'PasswordAman123!',
      confirmPassword: 'PasswordAman123!',
      turnstileToken: 'mock-turnstile-test-pass',
    };

    it('tahap 1: POST /auth/register mengirimkan OTP dan mengembalikan status requiresOtp', async () => {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateUser),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.requiresOtp).toBe(true);
      expect(data.data.email).toBe(candidateUser.email.toLowerCase());
      // Pastikan OTP TIDAK dibocorkan di respons API
      expect((data.data as any).otp).toBeUndefined();
    });

    it('menolak registrasi jika email sudah terdaftar sebelumnya', async () => {
      // Simpan user dummy dengan email sama
      usersStore.push({
        id: `usr-dup-${Date.now()}`,
        username: `existing_user_${Date.now()}`,
        email: candidateUser.email.toLowerCase(),
        passwordHash: '$2a$10$dummy',
        fullName: 'Existing User',
        tier: 'verified',
        role: 'user',
        status: 'active',
        authProvider: 'local',
        scanCount: 0,
        reportCount: 0,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      });

      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...candidateUser,
          username: `beda_user_${Date.now()}`,
        }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error.code).toBe('EMAIL_REGISTERED');
    });

    it('tahap 2: POST /auth/register/verify menolak jika OTP salah', async () => {
      const res = await fetch(`${baseUrl}/auth/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: candidateUser.email,
          otp: '000000',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_OTP');
    });

    it('tahap 2: POST /auth/register/verify berhasil mengaktifkan akun saat OTP benar', async () => {
      // Ambil hash OTP yang disimpan di store untuk email ini lalu temukan kodenya atau inject OTP simulasi
      const newCandidate = {
        fullName: 'Dewi Lestari',
        username: `dewi_otp_${Date.now()}`,
        email: `dewi.otp.${Date.now()}@gmail.com`,
        password: 'PasswordBaru999!',
        confirmPassword: 'PasswordBaru999!',
        turnstileToken: 'mock-turnstile-test-pass',
      };

      await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCandidate),
      });

      // Inject kode yang diketahui ke store untuk pengetesan deterministik
      const pendingRecord = otpsStore.find(
        (o) => o.email.toLowerCase() === newCandidate.email.toLowerCase() && !o.isUsed
      );
      expect(pendingRecord).toBeDefined();
      pendingRecord!.otpHash = hashOtp('777888');

      const res = await fetch(`${baseUrl}/auth/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newCandidate.email,
          otp: '777888',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.token).toBeDefined();
      expect(data.data.user.username).toBe(newCandidate.username);
      expect(data.data.user.tier).toBe('verified');

      // Pastikan sekarang user sudah ada di database / store
      const created = usersStore.find((u) => u.username === newCandidate.username);
      expect(created).toBeDefined();
      expect(created?.email).toBe(newCandidate.email.toLowerCase());
    });
  });

  describe('3. Endpoint Lupa Password & Reset Password', () => {
    const resetUser = {
      id: `usr-reset-${Date.now()}`,
      username: `user_reset_${Date.now()}`,
      email: `reset.target.${Date.now()}@scamora.test`,
      passwordHash: '$2a$10$oldpasswordhash',
      fullName: 'Target Reset Password',
      tier: 'verified' as const,
      role: 'user',
      status: 'active',
      authProvider: 'local' as const,
      scanCount: 0,
      reportCount: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    beforeAll(() => {
      usersStore.push(resetUser);
    });

    it('POST /auth/password/forgot dengan email tidak terdaftar tetap mengembalikan respon 200 generik (Anti-Enumeration)', async () => {
      const res = await fetch(`${baseUrl}/auth/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'tidak_pernah_ada_999999@domainpalsu.com',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.message).toContain('Jika alamat email terdaftar');
    });

    it('POST /auth/password/forgot dengan email valid berhasil membuat OTP reset password', async () => {
      const res = await fetch(`${baseUrl}/auth/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetUser.email,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const otpRec = otpsStore.find(
        (o) => o.email.toLowerCase() === resetUser.email.toLowerCase() && o.purpose === 'PASSWORD_RESET' && !o.isUsed
      );
      expect(otpRec).toBeDefined();
    });

    it('POST /auth/password/verify-otp berhasil memberikan resetToken setelah OTP valid', async () => {
      const otpRec = otpsStore.find(
        (o) => o.email.toLowerCase() === resetUser.email.toLowerCase() && o.purpose === 'PASSWORD_RESET' && !o.isUsed
      );
      otpRec!.otpHash = hashOtp('555666');

      const res = await fetch(`${baseUrl}/auth/password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetUser.email,
          otp: '555666',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.resetToken).toBeDefined();
      expect(data.data.resetToken.length).toBeGreaterThan(20);
    });

    it('POST /auth/password/reset menolak jika konfirmasi kata sandi tidak cocok', async () => {
      const res = await fetch(`${baseUrl}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetUser.email,
          resetToken: 'some-random-token',
          newPassword: 'PasswordBaru123!',
          confirmNewPassword: 'PasswordBedaTotal999!',
        }),
      });

      expect(res.status).toBe(422);
    });

    it('POST /auth/password/reset menolak jika resetToken invalid atau palsu', async () => {
      const res = await fetch(`${baseUrl}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetUser.email,
          resetToken: 'invalid-unauthorized-reset-token-1234567890',
          newPassword: 'PasswordBaru123!',
          confirmNewPassword: 'PasswordBaru123!',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error.code).toBe('INVALID_RESET_TOKEN');
    });

    it('POST /auth/password/reset berhasil memperbarui password dengan resetToken yang sah', async () => {
      // Simulasikan valid reset token
      const validToken = 'valid-test-token-' + Date.now();
      passwordResetTokensStore.push({
        token: validToken,
        email: resetUser.email.toLowerCase(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        isUsed: false,
      });

      const res = await fetch(`${baseUrl}/auth/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetUser.email,
          resetToken: validToken,
          newPassword: 'NewPasswordSecure888!',
          confirmNewPassword: 'NewPasswordSecure888!',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.message).toContain('berhasil diperbarui');

      // Verifikasi bahwa user sekarang bisa login dengan password baru
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: resetUser.username,
          password: 'NewPasswordSecure888!',
          turnstileToken: 'mock-turnstile-test-pass',
        }),
      });

      expect(loginRes.status).toBe(200);
      const loginData = await loginRes.json();
      expect(loginData.success).toBe(true);
      expect(loginData.data.token).toBeDefined();
    });
  });
});
