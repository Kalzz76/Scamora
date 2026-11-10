import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { isDbConnected, query } from '../config/db';
import { getSupabaseClient } from '../config/supabase';
import {
  createAdminToken,
  validateAdminCredentials,
  verifyUserPassword,
  hashPasswordBcrypt,
} from '../services/adminAuthService';
import { googleAuthService, GoogleUserProfile } from '../services/googleAuthService';
import { usersStore } from './admin.controller';
import {
  createAndSendOtp,
  verifyOtpCode,
  validateAndConsumeResetToken,
  invalidateAllUserOtps,
  otpsStore,
} from '../services/otpService';

interface UserRecord {
  id: string;
  username: string;
  email: string | null;
  name: string;
  role: string;
  tier: string;
  status: string;
  googleId?: string | null;
  avatarUrl?: string | null;
  authProvider: 'local' | 'google';
}

/**
 * Resolusi atau Pembuatan Akun Pengguna via Google OAuth
 */
async function resolveOrCreateGoogleUser(profile: GoogleUserProfile): Promise<UserRecord> {
  const cleanEmail = profile.email.toLowerCase().trim();

  // 1. Cek di PostgreSQL jika DB terhubung
  if (isDbConnected()) {
    try {
      // A. Cek berdasarkan Google Subject ID (sub)
      const googleRes = await query(
        `SELECT id, username, email, full_name, role, tier, status, google_id, avatar_url, auth_provider
         FROM app_users
         WHERE google_id = $1 LIMIT 1`,
        [profile.sub]
      );

      if (googleRes && googleRes.rows.length > 0) {
        const u = googleRes.rows[0];
        query(`UPDATE app_users SET last_active_at = NOW(), avatar_url = COALESCE($1, avatar_url) WHERE id = $2`, [
          profile.picture || null,
          u.id,
        ]).catch(() => {});

        return {
          id: u.id,
          username: u.username,
          email: u.email,
          name: u.full_name || u.username,
          role: u.role || 'user',
          tier: u.tier || 'verified',
          status: u.status || 'active',
          googleId: u.google_id,
          avatarUrl: profile.picture || u.avatar_url,
          authProvider: (u.auth_provider as any) || 'google',
        };
      }

      // B. Cek berdasarkan Email (Account Linking Aman)
      const emailRes = await query(
        `SELECT id, username, email, full_name, role, tier, status, google_id, avatar_url, auth_provider
         FROM app_users
         WHERE LOWER(email) = $1 LIMIT 1`,
        [cleanEmail]
      );

      if (emailRes && emailRes.rows.length > 0) {
        const u = emailRes.rows[0];
        // Hanya tautkan jika email diverifikasi oleh Google
        if (profile.emailVerified) {
          await query(
            `UPDATE app_users
             SET google_id = $1, avatar_url = COALESCE($2, avatar_url), updated_at = NOW(), last_active_at = NOW()
             WHERE id = $3`,
            [profile.sub, profile.picture || null, u.id]
          );
        }

        return {
          id: u.id,
          username: u.username,
          email: u.email,
          name: u.full_name || u.username,
          role: u.role || 'user',
          tier: u.tier || 'verified',
          status: u.status || 'active',
          googleId: profile.sub,
          avatarUrl: profile.picture || u.avatar_url,
          authProvider: (u.auth_provider as any) || 'local',
        };
      }

      // C. Pengguna Baru: Buat username unik
      let baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
      if (baseUsername.length < 3) baseUsername = `user_${baseUsername}`;
      let finalUsername = baseUsername;

      const checkUser = await query(`SELECT id FROM app_users WHERE LOWER(username) = $1 LIMIT 1`, [finalUsername]);
      if (checkUser && checkUser.rows.length > 0) {
        finalUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const newId = crypto.randomUUID();
      await query(
        `INSERT INTO app_users (id, username, email, password_hash, full_name, google_id, avatar_url, auth_provider, tier, role, status, scan_count, report_count, created_at, updated_at)
         VALUES ($1, $2, $3, NULL, $4, $5, $6, 'google', 'verified', 'user', 'active', 0, 0, NOW(), NOW())`,
        [newId, finalUsername, cleanEmail, profile.name, profile.sub, profile.picture || null]
      );

      return {
        id: newId,
        username: finalUsername,
        email: cleanEmail,
        name: profile.name,
        role: 'user',
        tier: 'verified',
        status: 'active',
        googleId: profile.sub,
        avatarUrl: profile.picture,
        authProvider: 'google',
      };
    } catch (err) {
      console.warn('[Auth] Gagal query DB Google OAuth, fallback memory:', err);
    }
  }

  // 2. Cek di Supabase Cloud jika terkonfigurasi
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // A. Cek berdasarkan google_id
      const { data: supaGoogle, error: supaErr1 } = await supabase
        .from('app_users')
        .select('*')
        .eq('google_id', profile.sub)
        .limit(1);

      if (!supaErr1 && supaGoogle && supaGoogle.length > 0) {
        const u = supaGoogle[0];
        supabase
          .from('app_users')
          .update({ last_active_at: new Date().toISOString(), avatar_url: profile.picture || u.avatar_url })
          .eq('id', u.id)
          .then(() => {});

        // Sinkronkan ke usersStore in-memory
        const memIdx = usersStore.findIndex((m) => m.id === u.id || m.username === u.username);
        const memObj = {
          id: u.id,
          username: u.username,
          email: u.email,
          fullName: u.full_name || profile.name,
          role: u.role || 'user',
          tier: u.tier || 'verified',
          status: u.status || 'active',
          googleId: u.google_id,
          avatarUrl: profile.picture || u.avatar_url,
          authProvider: 'google' as const,
        };
        if (memIdx !== -1) usersStore[memIdx] = { ...usersStore[memIdx], ...memObj };
        else usersStore.push(memObj);

        return {
          id: u.id,
          username: u.username,
          email: u.email,
          name: u.full_name || u.username,
          role: u.role || 'user',
          tier: u.tier || 'verified',
          status: u.status || 'active',
          googleId: u.google_id,
          avatarUrl: profile.picture || u.avatar_url,
          authProvider: 'google',
        };
      }

      // B. Cek berdasarkan Email (Account Linking Aman)
      const { data: supaEmail, error: supaErr2 } = await supabase
        .from('app_users')
        .select('*')
        .ilike('email', cleanEmail)
        .limit(1);

      if (!supaErr2 && supaEmail && supaEmail.length > 0) {
        const u = supaEmail[0];
        if (profile.emailVerified) {
          await supabase
            .from('app_users')
            .update({
              google_id: profile.sub,
              avatar_url: profile.picture || u.avatar_url,
              last_active_at: new Date().toISOString(),
            })
            .eq('id', u.id);
        }

        const memIdx = usersStore.findIndex((m) => m.id === u.id || m.username === u.username);
        const memObj = {
          id: u.id,
          username: u.username,
          email: u.email,
          fullName: u.full_name || profile.name,
          role: u.role || 'user',
          tier: u.tier || 'verified',
          status: u.status || 'active',
          googleId: profile.sub,
          avatarUrl: profile.picture || u.avatar_url,
          authProvider: (u.auth_provider as any) || 'google',
        };
        if (memIdx !== -1) usersStore[memIdx] = { ...usersStore[memIdx], ...memObj };
        else usersStore.push(memObj);

        return {
          id: u.id,
          username: u.username,
          email: u.email,
          name: u.full_name || u.username,
          role: u.role || 'user',
          tier: u.tier || 'verified',
          status: u.status || 'active',
          googleId: profile.sub,
          avatarUrl: profile.picture || u.avatar_url,
          authProvider: (u.auth_provider as any) || 'google',
        };
      }

      // C. Pengguna Baru di Supabase
      let baseUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
      if (baseUsername.length < 3) baseUsername = `user_${baseUsername}`;
      let finalUsername = baseUsername;

      const { data: checkUser } = await supabase
        .from('app_users')
        .select('id')
        .ilike('username', finalUsername)
        .limit(1);

      if (checkUser && checkUser.length > 0) {
        finalUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const newId = crypto.randomUUID();
      const insertPayload = {
        id: newId,
        username: finalUsername,
        email: cleanEmail,
        password_hash: null,
        full_name: profile.name,
        google_id: profile.sub,
        avatar_url: profile.picture || null,
        auth_provider: 'google',
        tier: 'verified',
        role: 'user',
        status: 'active',
        scan_count: 0,
        report_count: 0,
      };

      const { error: insErr } = await supabase.from('app_users').insert(insertPayload);
      if (insErr) {
        console.warn('[Auth] Supabase Google User Insert Warning:', insErr.message);
      } else {
        console.log(`[Auth] Pengguna Google '${finalUsername}' (${cleanEmail}) berhasil disimpan ke Supabase Cloud!`);
      }

      const memObj = {
        id: newId,
        username: finalUsername,
        email: cleanEmail,
        fullName: profile.name,
        role: 'user',
        tier: 'verified',
        status: 'active',
        googleId: profile.sub,
        avatarUrl: profile.picture,
        authProvider: 'google' as const,
      };
      usersStore.push(memObj);

      return {
        id: newId,
        username: finalUsername,
        email: cleanEmail,
        name: profile.name,
        role: 'user',
        tier: 'verified',
        status: 'active',
        googleId: profile.sub,
        avatarUrl: profile.picture,
        authProvider: 'google',
      };
    } catch (err: any) {
      console.warn('[Auth] Supabase Google lookup error, fallback in-memory:', err.message);
    }
  }

  // 3. Fallback In-Memory (Memori Toko Pengguna)
  let existingMem = usersStore.find((u) => u.googleId === profile.sub || (u.email && u.email.toLowerCase() === cleanEmail));
  if (existingMem) {
    if (!existingMem.googleId && profile.emailVerified) {
      existingMem.googleId = profile.sub;
      existingMem.avatarUrl = profile.picture || existingMem.avatarUrl;
    }
    return {
      id: existingMem.id,
      username: existingMem.username,
      email: existingMem.email,
      name: existingMem.fullName || existingMem.username,
      role: existingMem.role || 'user',
      tier: existingMem.tier || 'verified',
      status: existingMem.status || 'active',
      googleId: existingMem.googleId || profile.sub,
      avatarUrl: profile.picture || existingMem.avatarUrl,
      authProvider: existingMem.authProvider || 'google',
    };
  }

  let baseUser = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
  if (baseUser.length < 3) baseUser = `user_${baseUser}`;
  let uniqueUser = baseUser;
  if (usersStore.some((u) => u.username.toLowerCase() === uniqueUser.toLowerCase())) {
    uniqueUser = `${baseUser}_${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const newMemId = `usr-g-${Date.now()}`;
  const newMemUser = {
    id: newMemId,
    username: uniqueUser,
    email: cleanEmail,
    passwordHash: null,
    fullName: profile.name,
    googleId: profile.sub,
    avatarUrl: profile.picture || null,
    authProvider: 'google',
    tier: 'verified',
    role: 'user',
    status: 'active',
    scanCount: 0,
    reportCount: 0,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  usersStore.push(newMemUser);

  return {
    id: newMemId,
    username: uniqueUser,
    email: cleanEmail,
    name: profile.name,
    role: 'user',
    tier: 'verified',
    status: 'active',
    googleId: profile.sub,
    avatarUrl: profile.picture,
    authProvider: 'google',
  };
}

/**
 * POST /api/v1/auth/login
 * Login dengan username atau email + password
 */
export async function handleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, password, rememberMe } = req.body;
    const cleanIdentifier = String(username || '').trim();
    const cleanPassword = String(password || '');

    if (!cleanIdentifier || !cleanPassword) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Nama pengguna/email dan kata sandi wajib diisi.' },
      });
      return;
    }

    // 1. Verifikasi Superadministrator
    if (validateAdminCredentials(cleanIdentifier, cleanPassword)) {
      const token = createAdminToken(cleanIdentifier, 'admin', 'verified');
      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            username: cleanIdentifier,
            name: 'Super Administrator',
            role: 'admin',
            tier: 'verified',
            email: 'admin@scamora.id',
            authProvider: 'local',
          },
          expiresIn: rememberMe ? 604800 : 86400,
        },
      });
      return;
    }

    // 2. Verifikasi PostgreSQL Database
    if (isDbConnected()) {
      try {
        const userRes = await query(
          `SELECT id, username, email, password_hash, full_name, role, tier, status, google_id, avatar_url, auth_provider
           FROM app_users
           WHERE LOWER(username) = LOWER($1) OR (email IS NOT NULL AND LOWER(email) = LOWER($1))
           LIMIT 1`,
          [cleanIdentifier]
        );

        if (userRes && userRes.rows.length > 0) {
          const u = userRes.rows[0];

          if (u.status === 'suspended') {
            res.status(403).json({
              success: false,
              error: { code: 'ACCOUNT_SUSPENDED', message: 'Akun Anda sedang ditangguhkan. Silakan hubungi tim dukungan.' },
            });
            return;
          }

          if (!u.password_hash && u.google_id) {
            res.status(400).json({
              success: false,
              error: {
                code: 'OAUTH_ACCOUNT_ONLY',
                message: 'Akun ini terdaftar melalui Google. Silakan masuk menggunakan tombol "Masuk dengan Google".',
              },
            });
            return;
          }

          const isPasswordValid = await verifyUserPassword(cleanPassword, u.password_hash);
          if (isPasswordValid) {
            query(`UPDATE app_users SET last_active_at = NOW() WHERE id = $1`, [u.id]).catch(() => {});
            const token = createAdminToken(u.username, u.role || 'user', u.tier || 'verified');

            res.status(200).json({
              success: true,
              data: {
                token,
                user: {
                  id: u.id,
                  username: u.username,
                  email: u.email,
                  name: u.full_name || u.username,
                  role: u.role || 'user',
                  tier: u.tier || 'verified',
                  avatarUrl: u.avatar_url,
                  authProvider: u.auth_provider || 'local',
                },
                expiresIn: rememberMe ? 604800 : 86400,
              },
            });
            return;
          }
        }
      } catch (err) {
        console.warn('[Auth] Gagal memeriksa login DB, fallback ke memori:', err);
      }
    } else {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: supaUsers } = await supabase
            .from('app_users')
            .select('id, username, email, password_hash, full_name, role, tier, status, google_id, avatar_url, auth_provider')
            .or(`username.ilike.${cleanIdentifier},email.ilike.${cleanIdentifier}`)
            .limit(1);

          if (supaUsers && supaUsers.length > 0) {
            const u = supaUsers[0];

            if (u.status === 'suspended') {
              res.status(403).json({
                success: false,
                error: { code: 'ACCOUNT_SUSPENDED', message: 'Akun Anda sedang ditangguhkan.' },
              });
              return;
            }

            const isPasswordValid = await verifyUserPassword(cleanPassword, u.password_hash);
            if (isPasswordValid) {
              const token = createAdminToken(u.username, u.role || 'user', u.tier || 'verified');
              res.status(200).json({
                success: true,
                data: {
                  token,
                  user: {
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    name: u.full_name || u.username,
                    role: u.role || 'user',
                    tier: u.tier || 'verified',
                    avatarUrl: u.avatar_url,
                    authProvider: u.auth_provider || 'local',
                  },
                  expiresIn: rememberMe ? 604800 : 86400,
                },
              });
              return;
            }
          }
        } catch (err: any) {
          console.warn('[Auth] Supabase REST login lookup error:', err.message);
        }
      }
    }

    // 3. Verifikasi In-Memory Toko Pengguna
    const lowerId = cleanIdentifier.toLowerCase();
    const memUser = usersStore.find((u) => u.username.toLowerCase() === lowerId || (u.email && u.email.toLowerCase() === lowerId));

    if (memUser) {
      if (memUser.status === 'suspended') {
        res.status(403).json({
          success: false,
          error: { code: 'ACCOUNT_SUSPENDED', message: 'Akun Anda sedang ditangguhkan.' },
        });
        return;
      }

      if (!memUser.passwordHash && memUser.googleId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'OAUTH_ACCOUNT_ONLY',
            message: 'Akun ini terdaftar melalui Google. Silakan masuk menggunakan tombol "Masuk dengan Google".',
          },
        });
        return;
      }

      const isMatch = await verifyUserPassword(cleanPassword, memUser.passwordHash);
      if (isMatch) {
        const token = createAdminToken(memUser.username, memUser.role || 'user', memUser.tier || 'verified');
        res.status(200).json({
          success: true,
          data: {
            token,
            user: {
              id: memUser.id,
              username: memUser.username,
              email: memUser.email,
              name: memUser.fullName || memUser.name || memUser.username,
              role: memUser.role || 'user',
              tier: memUser.tier || 'verified',
              avatarUrl: memUser.avatarUrl,
              authProvider: memUser.authProvider || 'local',
            },
            expiresIn: rememberMe ? 604800 : 86400,
          },
        });
        return;
      }
    }

    // Gagal verifikasi kredensial
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Nama pengguna/email atau kata sandi tidak cocok. Periksa kembali akun Anda.',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/register
 * Pendaftaran akun baru dengan validasi username & email unik, serta hashing bcrypt
 */
export async function handleRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fullName, username, email, password, confirmPassword } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Nama lengkap minimal 2 karakter.' },
      });
      return;
    }

    const cleanUsername = String(username || '').trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3 || !/^[a-zA-Z0-9_.]+$/.test(cleanUsername)) {
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username minimal 3 karakter dan hanya boleh berisi huruf, angka, garis bawah (_), atau titik (.).',
        },
      });
      return;
    }

    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Format alamat email tidak valid.' },
      });
      return;
    }

    if (!password || password.length < 8 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Kata sandi minimal 8 karakter dan harus memuat kombinasi huruf serta angka.',
        },
      });
      return;
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      res.status(422).json({
        success: false,
        error: { code: 'PASSWORD_MISMATCH', message: 'Konfirmasi kata sandi tidak cocok.' },
      });
      return;
    }

    // Cegah impersonasi nama superadmin
    if (cleanUsername === env.ADMIN_USERNAME.toLowerCase()) {
      res.status(409).json({
        success: false,
        error: { code: 'USERNAME_TAKEN', message: 'Nama pengguna sudah dicadangkan untuk administrator.' },
      });
      return;
    }

    // 1. Cek duplikasi di PostgreSQL jika terhubung
    if (isDbConnected()) {
      try {
        const dupUser = await query(`SELECT username, email FROM app_users WHERE LOWER(username) = $1 LIMIT 1`, [cleanUsername]);
        if (dupUser && dupUser.rows.length > 0) {
          res.status(409).json({
            success: false,
            error: { code: 'USERNAME_TAKEN', message: 'Username sudah digunakan oleh pengguna lain.' },
          });
          return;
        }

        const dupEmail = await query(`SELECT username, email FROM app_users WHERE LOWER(email) = $1 LIMIT 1`, [cleanEmail]);
        if (dupEmail && dupEmail.rows.length > 0) {
          res.status(409).json({
            success: false,
            error: { code: 'EMAIL_REGISTERED', message: 'Email sudah terdaftar. Silakan masuk menggunakan akun tersebut.' },
          });
          return;
        }
      } catch (err) {
        console.warn('[Auth] Gagal memeriksa duplikasi DB, fallback:', err);
      }
    } else {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: dupUser } = await supabase.from('app_users').select('username').eq('username', cleanUsername).limit(1);
          if (dupUser && dupUser.length > 0) {
            res.status(409).json({
              success: false,
              error: { code: 'USERNAME_TAKEN', message: 'Username sudah digunakan oleh pengguna lain.' },
            });
            return;
          }
          const { data: dupEmail } = await supabase.from('app_users').select('email').eq('email', cleanEmail).limit(1);
          if (dupEmail && dupEmail.length > 0) {
            res.status(409).json({
              success: false,
              error: { code: 'EMAIL_REGISTERED', message: 'Email sudah terdaftar. Silakan masuk menggunakan akun tersebut.' },
            });
            return;
          }
        } catch (err: any) {
          console.warn('[Auth] Gagal memeriksa duplikasi Supabase:', err.message);
        }
      }
    }

    // 2. Cek duplikasi di in-memory usersStore
    if (usersStore.some((u) => u.username.toLowerCase() === cleanUsername)) {
      res.status(409).json({
        success: false,
        error: { code: 'USERNAME_TAKEN', message: 'Username sudah digunakan oleh pengguna lain.' },
      });
      return;
    }

    if (usersStore.some((u) => u.email && u.email.toLowerCase() === cleanEmail)) {
      res.status(409).json({
        success: false,
        error: { code: 'EMAIL_REGISTERED', message: 'Email sudah terdaftar. Silakan masuk menggunakan akun tersebut.' },
      });
      return;
    }

    // Hash password menggunakan algoritma Bcrypt yang aman
    const bcryptHash = await hashPasswordBcrypt(password);
    const cleanFullName = fullName.trim();

    // 1. Jika menyertakan OTP validasi langsung atau mode bypass testing
    if (req.body.otp) {
      const verifyRes = await verifyOtpCode(cleanEmail, req.body.otp, 'EMAIL_VERIFICATION');
      if (!verifyRes.success) {
        res.status(400).json({
          success: false,
          error: { code: verifyRes.errorCode || 'INVALID_OTP', message: verifyRes.errorMessage },
        });
        return;
      }
      return await finalizeUserRegistration(res, {
        fullName: cleanFullName,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: bcryptHash,
      });
    }

    // Proteksi: Bypass hanya diizinkan secara eksklusif saat pengujian otomatis internal (NODE_ENV === 'test')
    if (process.env.NODE_ENV === 'test' && (req.headers['x-bypass-otp'] === 'true' || req.body.bypassOtp === true)) {
      return await finalizeUserRegistration(res, {
        fullName: cleanFullName,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: bcryptHash,
      });
    }

    // 2. Alur Utama OTP: Buat OTP 6 Digit & Kirim via Gmail SMTP
    const otpResult = await createAndSendOtp(
      cleanEmail,
      'EMAIL_VERIFICATION',
      {
        fullName: cleanFullName,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: bcryptHash,
      },
      cleanFullName
    );

    if (!otpResult.success) {
      const isCooldown = Boolean(otpResult.cooldownRemaining);
      res.status(isCooldown ? 429 : 500).json({
        success: false,
        error: {
          code: isCooldown ? 'RESEND_COOLDOWN' : 'SMTP_SEND_FAILED',
          message: otpResult.error || 'Gagal mengirimkan kode OTP ke alamat email Anda.',
          cooldownRemaining: otpResult.cooldownRemaining,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        requiresOtp: true,
        email: cleanEmail,
        expiresIn: 300,
        message: 'Kode verifikasi OTP 6 digit telah dikirimkan ke email Anda. Silakan verifikasi untuk menyelesaikan pendaftaran.',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Menyelesaikan pendaftaran dan menyimpan akun baru ke database setelah verifikasi OTP
 */
async function finalizeUserRegistration(
  res: Response,
  userData: { fullName: string; username: string; email: string; passwordHash: string }
): Promise<void> {
  const { fullName, username, email, passwordHash } = userData;

  // Double check proteksi race condition akun duplikat
  if (usersStore.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    res.status(409).json({
      success: false,
      error: { code: 'USERNAME_TAKEN', message: 'Username sudah digunakan oleh pengguna lain.' },
    });
    return;
  }

  if (usersStore.some((u) => u.email && u.email.toLowerCase() === email.toLowerCase())) {
    res.status(409).json({
      success: false,
      error: { code: 'EMAIL_REGISTERED', message: 'Alamat email sudah terdaftar. Silakan login.' },
    });
    return;
  }

  const newUserId = crypto.randomUUID();

  // Simpan ke DB PostgreSQL jika terhubung
  if (isDbConnected()) {
    try {
      await query(
        `INSERT INTO app_users (id, username, email, password_hash, full_name, tier, role, status, auth_provider, scan_count, report_count, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'verified', 'user', 'active', 'local', 0, 0, NOW(), NOW())`,
        [newUserId, username, email, passwordHash, fullName]
      );
    } catch (err) {
      console.error('[Auth] Gagal menyimpan user baru ke PostgreSQL:', err);
    }
  }

  // Simpan ke Supabase via REST Client jika terkonfigurasi
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('app_users').insert({
        id: newUserId,
        username,
        email,
        password_hash: passwordHash,
        full_name: fullName,
        tier: 'verified',
        role: 'user',
        status: 'active',
        auth_provider: 'local',
        scan_count: 0,
        report_count: 0,
      });
    } catch (err: any) {
      console.warn('[Auth] Gagal menyimpan user ke Supabase client:', err.message);
    }
  }

  // Simpan ke in-memory store
  const newMemUser = {
    id: newUserId,
    username,
    email,
    passwordHash,
    fullName,
    tier: 'verified',
    role: 'user',
    status: 'active',
    authProvider: 'local' as const,
    scanCount: 0,
    reportCount: 0,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  usersStore.push(newMemUser);

  // Buat session token
  const token = createAdminToken(username, 'user', 'verified');

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: newUserId,
        username,
        email,
        name: fullName,
        role: 'user',
        tier: 'verified',
        authProvider: 'local',
      },
      expiresIn: 86400,
    },
  });
}

/**
 * POST /api/v1/auth/register/verify
 * Memvalidasi OTP pendaftaran dan mengaktifkan akun pengguna
 */
export async function handleVerifyRegisterOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, otp } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();

    const verifyResult = await verifyOtpCode(cleanEmail, cleanOtp, 'EMAIL_VERIFICATION');
    if (!verifyResult.success) {
      res.status(400).json({
        success: false,
        error: { code: verifyResult.errorCode || 'INVALID_OTP', message: verifyResult.errorMessage },
      });
      return;
    }

    const meta = verifyResult.metadata;
    if (!meta || !meta.username || !meta.passwordHash) {
      res.status(400).json({
        success: false,
        error: { code: 'PENDING_REGISTRATION_EXPIRED', message: 'Sesi pendaftaran telah kedaluwarsa. Silakan ulangi pendaftaran.' },
      });
      return;
    }

    await finalizeUserRegistration(res, {
      fullName: meta.fullName || meta.username,
      username: meta.username,
      email: cleanEmail,
      passwordHash: meta.passwordHash,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/otp/resend
 * Mengirim ulang kode OTP dengan cooldown 60 detik
 */
export async function handleResendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, purpose } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const validPurpose = purpose === 'PASSWORD_RESET' ? 'PASSWORD_RESET' : 'EMAIL_VERIFICATION';

    // Cari metadata pendaftaran terakhir jika purpose adalah EMAIL_VERIFICATION
    let existingMeta: Record<string, any> | undefined;

    if (isDbConnected()) {
      try {
        const dbRow = await query(
          `SELECT metadata FROM auth_otps
           WHERE LOWER(email) = $1 AND purpose = $2 AND metadata->>'passwordHash' IS NOT NULL
           ORDER BY created_at DESC LIMIT 1`,
          [cleanEmail, validPurpose]
        );
        if (dbRow && dbRow.rows.length > 0) {
          existingMeta = typeof dbRow.rows[0].metadata === 'string'
            ? JSON.parse(dbRow.rows[0].metadata)
            : dbRow.rows[0].metadata;
        }
      } catch {}
    }

    if (!existingMeta) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: supaMeta } = await supabase
            .from('auth_otps')
            .select('metadata')
            .ilike('email', cleanEmail)
            .eq('purpose', validPurpose)
            .order('created_at', { ascending: false })
            .limit(1);

          if (supaMeta && supaMeta.length > 0 && supaMeta[0].metadata?.passwordHash) {
            existingMeta = supaMeta[0].metadata;
          }
        } catch {}
      }
    }

    if (!existingMeta) {
      const lastPending = otpsStore.find(
        (o) => o.email.toLowerCase() === cleanEmail && o.purpose === validPurpose && o.metadata && o.metadata.passwordHash
      );
      if (lastPending) {
        existingMeta = lastPending.metadata;
      }
    }

    const otpRes = await createAndSendOtp(cleanEmail, validPurpose, existingMeta);
    if (!otpRes.success) {
      const isCooldown = Boolean(otpRes.cooldownRemaining);
      res.status(isCooldown ? 429 : 500).json({
        success: false,
        error: {
          code: isCooldown ? 'RESEND_COOLDOWN' : 'SMTP_SEND_FAILED',
          message: otpRes.error || 'Gagal mengirim ulang kode OTP.',
          cooldownRemaining: otpRes.cooldownRemaining,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Kode OTP baru telah berhasil dikirimkan ke email Anda.',
        expiresIn: 300,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/password/forgot
 * Meminta OTP reset password (Anti-enumeration: selalu kembalikan generic 200)
 */
export async function handleForgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    // Cek apakah user ada di DB / Supabase / in-memory
    let userFound: { id: string; name: string } | null = null;

    if (isDbConnected()) {
      try {
        const r = await query(`SELECT id, full_name, username FROM app_users WHERE LOWER(email) = $1 LIMIT 1`, [cleanEmail]);
        if (r && r.rows.length > 0) {
          userFound = { id: r.rows[0].id, name: r.rows[0].full_name || r.rows[0].username };
        }
      } catch {}
    }

    if (!userFound) {
      const mem = usersStore.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
      if (mem) {
        userFound = { id: mem.id, name: mem.fullName || mem.username };
      }
    }

    if (!userFound) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data: supaUsers } = await supabase.from('app_users').select('id, full_name, username').eq('email', cleanEmail).limit(1);
          if (supaUsers && supaUsers.length > 0) {
            userFound = { id: supaUsers[0].id, name: supaUsers[0].full_name || supaUsers[0].username };
          }
        } catch {}
      }
    }

    // Jika user ditemukan, generate OTP dan kirimkan via Gmail SMTP
    if (userFound) {
      await createAndSendOtp(cleanEmail, 'PASSWORD_RESET', { userId: userFound.id }, userFound.name);
    }

    // Selalu kembalikan respon 200 generik untuk mencegah enumeration attack
    res.status(200).json({
      success: true,
      data: {
        message: 'Jika alamat email terdaftar di sistem Scamora, instruksi dan kode OTP telah dikirimkan ke email Anda.',
        email: cleanEmail,
        expiresIn: 300,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/password/verify-otp
 * Memvalidasi kode OTP reset password dan memberikan Reset Token sementara
 */
export async function handleVerifyPasswordResetOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, otp } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();

    const verifyResult = await verifyOtpCode(cleanEmail, cleanOtp, 'PASSWORD_RESET');
    if (!verifyResult.success) {
      res.status(400).json({
        success: false,
        error: { code: verifyResult.errorCode || 'INVALID_OTP', message: verifyResult.errorMessage },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        resetToken: verifyResult.resetToken,
        message: 'Kode OTP terverifikasi. Silakan masukkan kata sandi baru Anda.',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/password/reset
 * Memperbarui kata sandi pengguna dengan Reset Token valid
 */
export async function handleResetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, resetToken, newPassword, confirmNewPassword } = req.body;
    const cleanEmail = String(email || '').trim().toLowerCase();

    if (!newPassword || newPassword.length < 8 || !/[0-9]/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
      res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Kata sandi baru minimal 8 karakter dan harus memuat kombinasi huruf serta angka.',
        },
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(422).json({
        success: false,
        error: { code: 'PASSWORD_MISMATCH', message: 'Konfirmasi kata sandi baru tidak cocok.' },
      });
      return;
    }

    // Validasi single-use reset token secara atomik & serverless-safe
    const isTokenValid = await validateAndConsumeResetToken(cleanEmail, String(resetToken || ''));
    if (!isTokenValid) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RESET_TOKEN',
          message: 'Token reset kata sandi tidak valid atau telah kedaluwarsa. Silakan ulangi proses lupa kata sandi.',
        },
      });
      return;
    }

    // Hash kata sandi baru dengan bcrypt
    const newBcryptHash = await hashPasswordBcrypt(newPassword);

    // Update di PostgreSQL jika terhubung
    if (isDbConnected()) {
      try {
        await query(
          `UPDATE app_users SET password_hash = $1, updated_at = NOW() WHERE LOWER(email) = $2`,
          [newBcryptHash, cleanEmail]
        );
      } catch (err: any) {
        console.error('[Auth] Gagal update password di PostgreSQL:', err.message);
      }
    }

    // Update di Supabase REST jika terhubung
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('app_users')
          .update({ password_hash: newBcryptHash, updated_at: new Date().toISOString() })
          .eq('email', cleanEmail);
      } catch {}
    }

    // Update di in-memory store
    const memUser = usersStore.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
    if (memUser) {
      memUser.passwordHash = newBcryptHash;
    }

    // Batalkan seluruh OTP dan sesi token lama milik user ini
    await invalidateAllUserOtps(cleanEmail);

    res.status(200).json({
      success: true,
      data: {
        message: 'Kata sandi Anda berhasil diperbarui. Silakan masuk menggunakan kata sandi baru.',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/google
 * Mengarahkan pengguna ke laman otorisasi Google OAuth
 */
export async function handleGoogleAuthRedirect(req: Request, res: Response): Promise<void> {
  const stateToken = crypto.randomBytes(16).toString('hex');
  const authUrl = googleAuthService.getAuthorizationUrl(stateToken);

  // Jika dipanggil via AJAX/fetch JSON
  if (req.headers.accept?.includes('application/json') || req.query.format === 'json') {
    res.status(200).json({
      success: true,
      data: {
        url: authUrl,
        configured: googleAuthService.isConfigured(),
      },
    });
    return;
  }

  res.redirect(authUrl);
}

/**
 * GET /api/v1/auth/google/callback
 * Menerima callback dari Google OAuth setelah otorisasi
 */
export async function handleGoogleCallback(req: Request, res: Response): Promise<void> {
  const { code, error, state } = req.query as { code?: string; error?: string; state?: string };

  if (error || !code) {
    const errorMsg = error === 'access_denied'
      ? 'Akses Google dibatalkan oleh pengguna.'
      : 'Gagal mengautentikasi melalui Google.';
    res.redirect(`${env.FRONTEND_ORIGIN}/#/login?error=${encodeURIComponent(errorMsg)}`);
    return;
  }

  try {
    const profile = await googleAuthService.exchangeCodeForProfile(code);
    const user = await resolveOrCreateGoogleUser(profile);
    const token = createAdminToken(user.username, user.role, user.tier as any);

    // Alihkan kembali ke frontend dengan token dan email asli pengguna
    const redirectUrl = `${env.FRONTEND_ORIGIN}/#/login?google_token=${encodeURIComponent(token)}&username=${encodeURIComponent(user.username)}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email || '')}`;
    res.redirect(redirectUrl);
  } catch (err: any) {
    console.error('[Google OAuth] Callback error:', err.message);
    res.redirect(`${env.FRONTEND_ORIGIN}/#/login?error=${encodeURIComponent(err.message || 'Gagal memproses otorisasi Google.')}`);
  }
}

/**
 * POST /api/v1/auth/google/token
 * Autentikasi Google berbasis ID Token (misal dari Google Identity Services / One Tap)
 */
export async function handleGoogleTokenAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { credential, code } = req.body;

    let profile: GoogleUserProfile;
    if (credential) {
      profile = await googleAuthService.verifyIdToken(credential);
    } else if (code) {
      profile = await googleAuthService.exchangeCodeForProfile(code);
    } else {
      res.status(422).json({
        success: false,
        error: { code: 'MISSING_CREDENTIAL', message: 'Credential ID token atau authorization code Google wajib disertakan.' },
      });
      return;
    }

    const user = await resolveOrCreateGoogleUser(profile);
    const token = createAdminToken(user.username, user.role, user.tier as any);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          tier: user.tier,
          avatarUrl: user.avatarUrl,
          authProvider: user.authProvider,
        },
        expiresIn: 86400,
      },
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: {
        code: 'GOOGLE_AUTH_FAILED',
        message: err.message || 'Validasi akun Google gagal.',
      },
    });
  }
}

/**
 * POST /api/v1/auth/logout
 * Mengakhiri sesi pengguna
 */
export async function handleLogout(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      message: 'Sesi autentikasi berhasil diakhiri.',
    },
  });
}
