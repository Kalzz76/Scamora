import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import app from '../src/app';
import {
  createAndSendOtp,
  verifyOtpCode,
  otpsStore,
  hashOtp,
  validateAndConsumeResetToken,
} from '../src/services/otpService';

describe('Security Audit & Edge Case Penetration Tests (Post-Fix Verification)', { timeout: 25000 }, () => {
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

  it('1. Penolakan Bypass OTP: Parameter atau header bypassOtp ditolak jika bukan lingkungan test eksplisit', async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      // Simulasikan lingkungan produksi
      process.env.NODE_ENV = 'production';

      const candidate = {
        fullName: 'Attacker Bypass Prod',
        username: 'attacker_' + Date.now(),
        email: `attacker.${Date.now()}@scamora.test`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        turnstileToken: 'mock-turnstile-test-pass',
        bypassOtp: true,
      };

      const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bypass-otp': 'true',
        },
        body: JSON.stringify(candidate),
      });

      const data = await res.json();
      // Harus memerlukan verifikasi OTP (requiresOtp: true), tidak boleh bypass langsung 201
      expect(res.status).toBe(200);
      expect(data.data.requiresOtp).toBe(true);
      expect(data.data.token).toBeUndefined();
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('2. Race Condition Replay Test: Dua request verifikasi OTP bersamaan tidak dapat lolos ganda', async () => {
    const testEmail = `race.otp.${Date.now()}@scamora.test`;
    await createAndSendOtp(testEmail, 'EMAIL_VERIFICATION', {
      username: 'race_user_' + Date.now(),
      fullName: 'Race Tester',
      email: testEmail,
      passwordHash: '$2a$10$testhash',
    });

    const activeOtp = otpsStore.find((o) => o.email === testEmail && !o.isUsed);
    expect(activeOtp).toBeDefined();
    activeOtp!.otpHash = hashOtp('112233');

    // Kirim 2 request verifikasi secara bersamaan
    const [res1, res2] = await Promise.all([
      verifyOtpCode(testEmail, '112233', 'EMAIL_VERIFICATION'),
      verifyOtpCode(testEmail, '112233', 'EMAIL_VERIFICATION'),
    ]);

    const successes = [res1, res2].filter((r) => r.success);
    const failures = [res1, res2].filter((r) => !r.success);

    // Tepat hanya 1 yang boleh berhasil, request paralel kedua harus ditolak
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);
    expect(failures[0].errorCode).toBe('ALREADY_USED');
  });

  it('3. Single-Use Reset Token Persistence: Token reset tidak dapat dipakai ulang untuk manipulasi password', async () => {
    const resetEmail = `reset.single.${Date.now()}@scamora.test`;
    await createAndSendOtp(resetEmail, 'PASSWORD_RESET', { userId: 'usr-test' });

    const activeOtp = otpsStore.find((o) => o.email === resetEmail && !o.isUsed);
    activeOtp!.otpHash = hashOtp('445566');

    // Verifikasi OTP untuk mendapatkan reset token
    const verifyRes = await verifyOtpCode(resetEmail, '445566', 'PASSWORD_RESET');
    expect(verifyRes.success).toBe(true);
    expect(verifyRes.resetToken).toBeDefined();

    const token = verifyRes.resetToken!;

    // Konsumsi pertama harus berhasil
    const firstConsume = await validateAndConsumeResetToken(resetEmail, token);
    expect(firstConsume).toBe(true);

    // Konsumsi kedua dengan token yang sama harus DITOLAK
    const secondConsume = await validateAndConsumeResetToken(resetEmail, token);
    expect(secondConsume).toBe(false);
  });

  it('4. Resend OTP Metadata Continuity: Pengiriman ulang OTP tetap mempertahankan data registrasi lengkap', async () => {
    const resendEmail = `resend.meta.${Date.now()}@scamora.test`;
    const regPayload = {
      fullName: 'Budi Resend Tester',
      username: 'budi_resend_' + Date.now(),
      email: resendEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
      turnstileToken: 'mock-turnstile-test-pass',
    };

    // 1. Registrasi awal
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    expect(regRes.status).toBe(200);

    // 2. Manipulasi cooldown in-memory agar bisa test resend segera
    const lastOtp = otpsStore.find((o) => o.email === resendEmail);
    if (lastOtp) {
      lastOtp.createdAt = new Date(Date.now() - 70000); // 70 detik lalu
    }

    // 3. Panggil resend OTP
    const resendRes = await fetch(`${baseUrl}/auth/otp/resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resendEmail, purpose: 'EMAIL_VERIFICATION' }),
    });
    expect(resendRes.status).toBe(200);

    // 4. Pastikan OTP baru memuat metadata pendaftaran lengkap
    const newOtp = otpsStore.find((o) => o.email === resendEmail && !o.isUsed);
    expect(newOtp).toBeDefined();
    expect(newOtp!.metadata?.username).toBe(regPayload.username);
    expect(newOtp!.metadata?.passwordHash).toBeDefined();

    // 5. Verifikasi akun dengan OTP baru berhasil mengaktifkan user
    newOtp!.otpHash = hashOtp('998877');
    const verifyRes = await fetch(`${baseUrl}/auth/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resendEmail, otp: '998877' }),
    });

    expect(verifyRes.status).toBe(201);
    const verifyData = await verifyRes.json();
    expect(verifyData.success).toBe(true);
    expect(verifyData.data.user.username).toBe(regPayload.username);
  });
});
