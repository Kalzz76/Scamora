import crypto from 'crypto';
import { env } from '../config/env';
import { isDbConnected, query } from '../config/db';
import { getSupabaseClient } from '../config/supabase';
import { sendOtpEmail } from './mailService';

export type OtpPurpose = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'PASSWORD_RESET_TOKEN';

export interface OtpRecord {
  id: string;
  email: string;
  otpHash: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  attemptCount: number;
  isUsed: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerateOtpResult {
  success: boolean;
  cooldownRemaining?: number;
  expiresAt: Date;
  messageId?: string;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  errorCode?: 'INVALID_OTP' | 'OTP_EXPIRED' | 'MAX_ATTEMPTS_EXCEEDED' | 'ALREADY_USED' | 'NOT_FOUND';
  errorMessage?: string;
  metadata?: Record<string, any>;
  resetToken?: string;
}

// In-Memory store untuk fallback jika database PostgreSQL/Supabase offline
export const otpsStore: OtpRecord[] = [];

// Reset token store untuk password reset yang sudah melewati verifikasi OTP (In-Memory Fallback)
interface PasswordResetToken {
  token: string;
  email: string;
  expiresAt: Date;
  isUsed: boolean;
}
export const passwordResetTokensStore: PasswordResetToken[] = [];

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 Menit
const OTP_COOLDOWN_MS = 60 * 1000;   // 60 Detik
const MAX_ATTEMPTS = 5;              // Maksimal 5x salah

/**
 * Hash kode OTP menggunakan SHA-256 dan salt rahasia aplikasi
 */
export function hashOtp(otp: string): string {
  const salt = env.ADMIN_SECRET || 'scamora-otp-secret-salt-2026';
  return crypto.createHash('sha256').update(`${otp}:${salt}`).digest('hex');
}

/**
 * Pembandingan hash aman (Constant-time timingSafeEqual)
 */
export function verifyHash(providedOtp: string, storedHash: string): boolean {
  try {
    const computedHash = hashOtp(providedOtp);
    const a = Buffer.from(computedHash, 'utf8');
    const b = Buffer.from(storedHash, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Menghasilkan 6 digit kode OTP cryptographically secure
 */
export function generateSecureOtpDigits(): string {
  // Rentang 100000 - 999999 (CSPRNG via system entropy)
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Buat dan kirimkan OTP ke email tujuan
 */
export async function createAndSendOtp(
  email: string,
  purpose: OtpPurpose,
  metadata?: Record<string, any>,
  userName?: string
): Promise<GenerateOtpResult> {
  const cleanEmail = email.toLowerCase().trim();
  const now = new Date();

  // 1. Cek Cooldown (60 detik) dari OTP terakhir yang belum kedaluwarsa untuk tujuan yang sama
  let lastOtpRecord: OtpRecord | null = null;

  if (isDbConnected()) {
    try {
      const res = await query(
        `SELECT id, created_at FROM auth_otps
         WHERE LOWER(email) = $1 AND purpose = $2 AND is_used = FALSE
         ORDER BY created_at DESC LIMIT 1`,
        [cleanEmail, purpose]
      );
      if (res && res.rows.length > 0) {
        lastOtpRecord = {
          ...res.rows[0],
          createdAt: new Date(res.rows[0].created_at),
        } as any;
      }
    } catch (err: any) {
      console.warn('[OTP] Gagal query cooldown DB, fallback:', err.message);
    }
  }

  // Jika belum dapat dari pg.Pool, periksa via Supabase Cloud Client
  if (!lastOtpRecord) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: supaRows } = await supabase
          .from('auth_otps')
          .select('id, created_at')
          .ilike('email', cleanEmail)
          .eq('purpose', purpose)
          .eq('is_used', false)
          .order('created_at', { ascending: false })
          .limit(1);

        if (supaRows && supaRows.length > 0) {
          lastOtpRecord = {
            id: supaRows[0].id,
            createdAt: new Date(supaRows[0].created_at),
          } as any;
        }
      } catch {}
    }
  }

  // Fallback in-memory
  if (!lastOtpRecord) {
    const memMatch = otpsStore
      .filter((o) => o.email.toLowerCase() === cleanEmail && o.purpose === purpose && !o.isUsed)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    if (memMatch) {
      lastOtpRecord = memMatch;
    }
  }

  if (lastOtpRecord) {
    const timeSinceLast = now.getTime() - lastOtpRecord.createdAt.getTime();
    if (timeSinceLast < OTP_COOLDOWN_MS) {
      const remainingSec = Math.ceil((OTP_COOLDOWN_MS - timeSinceLast) / 1000);
      return {
        success: false,
        cooldownRemaining: remainingSec,
        expiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
        error: `Silakan tunggu ${remainingSec} detik sebelum meminta kode OTP baru.`,
      };
    }
  }

  // 2. Batalkan seluruh OTP lama yang belum terpakai untuk email & purpose ini
  if (isDbConnected()) {
    try {
      await query(
        `UPDATE auth_otps SET is_used = TRUE, updated_at = NOW()
         WHERE LOWER(email) = $1 AND purpose = $2 AND is_used = FALSE`,
        [cleanEmail, purpose]
      );
    } catch (err: any) {
      console.warn('[OTP] Gagal membatalkan OTP lama di DB:', err.message);
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('auth_otps')
        .update({ is_used: true, updated_at: now.toISOString() })
        .ilike('email', cleanEmail)
        .eq('purpose', purpose)
        .eq('is_used', false);
    } catch {}
  }

  otpsStore.forEach((o) => {
    if (o.email.toLowerCase() === cleanEmail && o.purpose === purpose && !o.isUsed) {
      o.isUsed = true;
      o.updatedAt = now;
    }
  });

  // 3. Generate OTP 6 Digit baru & Hash (Never Plaintext)
  const plainOtp = generateSecureOtpDigits();
  const hashedOtp = hashOtp(plainOtp);
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);
  const otpId = `otp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const newRecord: OtpRecord = {
    id: otpId,
    email: cleanEmail,
    otpHash: hashedOtp,
    purpose,
    expiresAt,
    attemptCount: 0,
    isUsed: false,
    metadata: metadata || {},
    createdAt: now,
    updatedAt: now,
  };

  // Simpan ke DB PostgreSQL
  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO auth_otps (id, email, otp_hash, purpose, expires_at, attempt_count, is_used, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          otpId,
          cleanEmail,
          hashedOtp,
          purpose,
          expiresAt,
          0,
          false,
          JSON.stringify(metadata || {}),
          now,
          now,
        ]
      );
    } catch (err: any) {
      console.error('[OTP] Gagal menyimpan OTP ke PostgreSQL:', err.message);
    }
  }

  // Simpan ke Supabase jika tersedia
  if (supabase) {
    try {
      await supabase.from('auth_otps').insert({
        id: otpId,
        email: cleanEmail,
        otp_hash: hashedOtp,
        purpose,
        expires_at: expiresAt.toISOString(),
        attempt_count: 0,
        is_used: false,
        metadata: metadata || {},
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });
    } catch (err: any) {
      // Supabase warning if table not created on cloud yet
    }
  }

  // Simpan ke in-memory store
  otpsStore.push(newRecord);

  // 4. Kirim email via Gmail SMTP (Nodemailer)
  const mailResult = await sendOtpEmail({
    to: cleanEmail,
    otp: plainOtp,
    purpose: purpose === 'PASSWORD_RESET' ? 'PASSWORD_RESET' : 'EMAIL_VERIFICATION',
    userName,
  });

  return {
    success: true,
    expiresAt,
    messageId: mailResult.messageId,
  };
}

/**
 * Verifikasi kode OTP 6 digit
 */
export async function verifyOtpCode(
  email: string,
  providedOtp: string,
  purpose: OtpPurpose
): Promise<VerifyOtpResult> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(providedOtp || '').trim();
  const now = new Date();

  if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return {
      success: false,
      errorCode: 'INVALID_OTP',
      errorMessage: 'Kode OTP harus berupa 6 digit angka.',
    };
  }

  // 1. Ambil OTP aktif terakhir untuk email dan purpose terkait
  let activeRecord: OtpRecord | null = null;

  if (isDbConnected()) {
    try {
      const res = await query(
        `SELECT id, email, otp_hash, purpose, expires_at, attempt_count, is_used, metadata, created_at, updated_at
         FROM auth_otps
         WHERE LOWER(email) = $1 AND purpose = $2 AND is_used = FALSE
         ORDER BY created_at DESC LIMIT 1`,
        [cleanEmail, purpose]
      );
      if (res && res.rows.length > 0) {
        const row = res.rows[0];
        activeRecord = {
          id: row.id,
          email: row.email,
          otpHash: row.otp_hash,
          purpose: row.purpose,
          expiresAt: new Date(row.expires_at),
          attemptCount: Number(row.attempt_count || 0),
          isUsed: Boolean(row.is_used),
          metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      }
    } catch (err: any) {
      console.warn('[OTP] Gagal query OTP dari DB:', err.message);
    }
  }

  // Periksa Supabase jika DB belum konek
  const supabase = getSupabaseClient();
  if (!activeRecord && supabase) {
    try {
      const { data: supaRows } = await supabase
        .from('auth_otps')
        .select('*')
        .ilike('email', cleanEmail)
        .eq('purpose', purpose)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (supaRows && supaRows.length > 0) {
        const row = supaRows[0];
        activeRecord = {
          id: row.id,
          email: row.email,
          otpHash: row.otp_hash,
          purpose: row.purpose,
          expiresAt: new Date(row.expires_at),
          attemptCount: Number(row.attempt_count || 0),
          isUsed: Boolean(row.is_used),
          metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata || {},
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
        };
      }
    } catch {}
  }

  // Fallback in-memory
  if (!activeRecord) {
    const memMatch = otpsStore
      .filter((o) => o.email.toLowerCase() === cleanEmail && o.purpose === purpose && !o.isUsed)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    if (memMatch) {
      activeRecord = memMatch;
    }
  }

  if (!activeRecord) {
    let wasUsed = false;
    if (isDbConnected()) {
      try {
        const checkUsed = await query(
          `SELECT id FROM auth_otps WHERE LOWER(email) = $1 AND purpose = $2 AND is_used = TRUE LIMIT 1`,
          [cleanEmail, purpose]
        );
        if (checkUsed && checkUsed.rows.length > 0) wasUsed = true;
      } catch {}
    }
    if (!wasUsed && supabase) {
      try {
        const { data: supaUsed } = await supabase
          .from('auth_otps')
          .select('id')
          .ilike('email', cleanEmail)
          .eq('purpose', purpose)
          .eq('is_used', true)
          .limit(1);
        if (supaUsed && supaUsed.length > 0) wasUsed = true;
      } catch {}
    }
    if (!wasUsed) {
      wasUsed = otpsStore.some(
        (o) => o.email.toLowerCase() === cleanEmail && o.purpose === purpose && o.isUsed
      );
    }

    if (wasUsed) {
      return {
        success: false,
        errorCode: 'ALREADY_USED',
        errorMessage: 'Kode OTP ini telah digunakan. Silakan minta kode OTP baru.',
      };
    }

    return {
      success: false,
      errorCode: 'NOT_FOUND',
      errorMessage: 'Kode OTP tidak ditemukan atau telah kedaluwarsa. Silakan minta kode baru.',
    };
  }

  // 2. Cek apakah batas percobaan (max 5x) sudah terlampaui
  if (activeRecord.attemptCount >= MAX_ATTEMPTS) {
    await markOtpUsed(activeRecord.id);
    return {
      success: false,
      errorCode: 'MAX_ATTEMPTS_EXCEEDED',
      errorMessage: 'Batas percobaan memasukkan OTP telah habis (maks. 5 kali). Silakan minta kode OTP baru.',
    };
  }

  // 3. Cek masa berlaku (5 menit)
  if (now.getTime() > activeRecord.expiresAt.getTime()) {
    await markOtpUsed(activeRecord.id);
    return {
      success: false,
      errorCode: 'OTP_EXPIRED',
      errorMessage: 'Kode OTP telah kedaluwarsa (masa berlaku 5 menit habis). Silakan minta kode baru.',
    };
  }

  // 4. Periksa kecocokan hash OTP dengan constant-time comparison
  const isMatch = verifyHash(cleanOtp, activeRecord.otpHash);

  if (!isMatch) {
    // Naikkan attempt count secara atomik di database
    const newCount = activeRecord.attemptCount + 1;
    activeRecord.attemptCount = newCount;
    activeRecord.updatedAt = now;

    if (isDbConnected()) {
      try {
        await query(
          `UPDATE auth_otps SET attempt_count = attempt_count + 1, updated_at = NOW() WHERE id = $1`,
          [activeRecord.id]
        );
      } catch {}
    }

    if (supabase) {
      try {
        await supabase
          .from('auth_otps')
          .update({ attempt_count: newCount, updated_at: now.toISOString() })
          .eq('id', activeRecord.id);
      } catch {}
    }

    const sisa = MAX_ATTEMPTS - newCount;
    if (sisa <= 0) {
      await markOtpUsed(activeRecord.id);
      return {
        success: false,
        errorCode: 'MAX_ATTEMPTS_EXCEEDED',
        errorMessage: 'Kode OTP salah. Batas maksimal percobaan (5x) tercapai. Silakan kirim ulang kode.',
      };
    }

    return {
      success: false,
      errorCode: 'INVALID_OTP',
      errorMessage: `Kode OTP tidak sesuai. Sisa kesempatan mencoba: ${sisa} kali.`,
    };
  }

  // 5. Berhasil! Tandai OTP sebagai digunakan secara atomik (Mencegah Race Condition Replay)
  const consumed = await markOtpUsed(activeRecord.id);
  if (!consumed) {
    // Jika race condition terdeteksi (request konkuren telah menggunakan OTP ini di milidetik yang sama)
    return {
      success: false,
      errorCode: 'ALREADY_USED',
      errorMessage: 'Kode OTP ini telah berhasil diverifikasi oleh permintaan lain.',
    };
  }

  // Jika purpose adalah PASSWORD_RESET, buat Reset Token aman sekali pakai (15 menit)
  let resetToken: string | undefined;
  if (purpose === 'PASSWORD_RESET') {
    resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiresAt = new Date(now.getTime() + 15 * 60 * 1000);
    const tokenId = `rst-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const tokenHash = hashOtp(resetToken);

    // Simpan ke PostgreSQL
    if (isDbConnected()) {
      try {
        await query(
          `INSERT INTO auth_otps (id, email, otp_hash, purpose, expires_at, attempt_count, is_used, metadata, created_at, updated_at)
           VALUES ($1, $2, $3, 'PASSWORD_RESET_TOKEN', $4, 0, FALSE, $5, NOW(), NOW())`,
          [tokenId, cleanEmail, tokenHash, resetExpiresAt, JSON.stringify({ resetToken })]
        );
      } catch {}
    }

    // Simpan ke Supabase
    if (supabase) {
      try {
        await supabase.from('auth_otps').insert({
          id: tokenId,
          email: cleanEmail,
          otp_hash: tokenHash,
          purpose: 'PASSWORD_RESET_TOKEN',
          expires_at: resetExpiresAt.toISOString(),
          attempt_count: 0,
          is_used: false,
          metadata: { resetToken },
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        });
      } catch {}
    }

    // Simpan ke memory fallback
    passwordResetTokensStore.push({
      token: resetToken,
      email: cleanEmail,
      expiresAt: resetExpiresAt,
      isUsed: false,
    });
  }

  return {
    success: true,
    metadata: activeRecord.metadata,
    resetToken,
  };
}

/**
 * Tandai OTP sebagai telah digunakan secara atomik
 * Mengembalikan true jika pemanggilan ini berhasil menandai dari false -> true
 */
export async function markOtpUsed(id: string): Promise<boolean> {
  let wasMarked = false;

  if (isDbConnected()) {
    try {
      const res = await query(
        `UPDATE auth_otps SET is_used = TRUE, updated_at = NOW() WHERE id = $1 AND is_used = FALSE RETURNING id`,
        [id]
      );
      if (res && res.rows && res.rows.length > 0) {
        wasMarked = true;
      }
    } catch {}
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('auth_otps')
        .update({ is_used: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('is_used', false)
        .select('id');
      if (data && data.length > 0) {
        wasMarked = true;
      }
    } catch {}
  }

  const mem = otpsStore.find((o) => o.id === id);
  if (mem) {
    if (!mem.isUsed) {
      mem.isUsed = true;
      mem.updatedAt = new Date();
      wasMarked = true;
    }
  }

  return wasMarked;
}

/**
 * Validasi Reset Token saat pengguna menginput password baru (Serverless Compatible)
 */
export async function validateAndConsumeResetToken(email: string, token: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanToken = token.trim();
  const now = new Date();
  const tokenHash = hashOtp(cleanToken);

  let consumed = false;

  // 1. Coba konsumsi atomik di PostgreSQL
  if (isDbConnected()) {
    try {
      const res = await query(
        `UPDATE auth_otps SET is_used = TRUE, updated_at = NOW()
         WHERE LOWER(email) = $1 AND purpose = 'PASSWORD_RESET_TOKEN' AND otp_hash = $2 AND is_used = FALSE AND expires_at > NOW()
         RETURNING id`,
        [cleanEmail, tokenHash]
      );
      if (res && res.rows && res.rows.length > 0) {
        consumed = true;
      }
    } catch {}
  }

  // 2. Coba konsumsi atomik di Supabase
  if (!consumed) {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data } = await supabase
          .from('auth_otps')
          .update({ is_used: true, updated_at: now.toISOString() })
          .ilike('email', cleanEmail)
          .eq('purpose', 'PASSWORD_RESET_TOKEN')
          .eq('otp_hash', tokenHash)
          .eq('is_used', false)
          .gt('expires_at', now.toISOString())
          .select('id');
        if (data && data.length > 0) {
          consumed = true;
        }
      } catch {}
    }
  }

  // 3. Fallback in-memory
  const found = passwordResetTokensStore.find(
    (r) => r.email === cleanEmail && r.token === cleanToken && !r.isUsed
  );

  if (found) {
    if (now.getTime() <= found.expiresAt.getTime()) {
      found.isUsed = true;
      consumed = true;
    } else {
      found.isUsed = true;
    }
  }

  return consumed;
}

/**
 * Batalkan seluruh OTP dan reset token yang aktif milik user (dipanggil setelah password berhasil diubah)
 */
export async function invalidateAllUserOtps(email: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const now = new Date();

  if (isDbConnected()) {
    try {
      await query(
        `UPDATE auth_otps SET is_used = TRUE, updated_at = NOW() WHERE LOWER(email) = $1 AND is_used = FALSE`,
        [cleanEmail]
      );
    } catch {}
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('auth_otps')
        .update({ is_used: true, updated_at: now.toISOString() })
        .ilike('email', cleanEmail)
        .eq('is_used', false);
    } catch {}
  }

  otpsStore.forEach((o) => {
    if (o.email.toLowerCase() === cleanEmail && !o.isUsed) {
      o.isUsed = true;
      o.updatedAt = now;
    }
  });

  passwordResetTokensStore.forEach((r) => {
    if (r.email === cleanEmail && !r.isUsed) {
      r.isUsed = true;
    }
  });
}
