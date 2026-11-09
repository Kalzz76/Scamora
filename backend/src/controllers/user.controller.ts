import type { Request, Response } from 'express';
import { isDbConnected, query } from '../config/db';
import { hashUserPassword } from '../services/adminAuthService';
import { historyService } from '../services/historyService';

// In-memory user fallback data (synced with admin controller seed)
let inMemoryUsers: any[] = [
  {
    id: 'usr-101',
    username: 'budi_santoso',
    email: 'budi.santoso@gmail.com',
    fullName: 'Budi Santoso',
    tier: 'verified',
    role: 'user',
    status: 'active',
    scanCount: 14,
    reportCount: 2,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'usr-102',
    username: 'siti_rahma',
    email: 'siti.rahma@yahoo.co.id',
    fullName: 'Siti Rahmawati',
    tier: 'verified',
    role: 'user',
    status: 'active',
    scanCount: 9,
    reportCount: 1,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
];

export async function handleGetUserProfile(req: Request, res: Response): Promise<void> {
  const username = req.user?.username;
  if (!username) {
    res.status(401).json({ success: false, error: { message: 'Sesi tidak valid.' } });
    return;
  }

  if (isDbConnected()) {
    try {
      const dbRes = await query(
        `SELECT id, username, email, full_name, tier, role, status, scan_count, report_count, created_at, last_active_at
         FROM app_users
         WHERE username = $1 LIMIT 1`,
        [username]
      );
      if (dbRes && dbRes.rows.length > 0) {
        const u = dbRes.rows[0];
        res.status(200).json({
          success: true,
          data: {
            id: u.id,
            username: u.username,
            email: u.email,
            name: u.full_name,
            tier: u.tier || 'verified',
            role: u.role || 'user',
            status: u.status || 'active',
            scanCount: u.scan_count || 0,
            reportCount: u.report_count || 0,
            createdAt: u.created_at,
            lastActiveAt: u.last_active_at,
          },
        });
        return;
      }
    } catch (err) {
      console.warn('[DB] Gagal membaca app_user:', err);
    }
  }

  const mem = inMemoryUsers.find((u) => u.username === username) || {
    id: `usr-${username}`,
    username,
    email: `${username}@scamora.id`,
    name: username.replace(/_/g, ' '),
    tier: 'verified',
    role: 'user',
    status: 'active',
    scanCount: 10,
    reportCount: 1,
    createdAt: new Date().toISOString(),
  };

  res.status(200).json({
    success: true,
    data: {
      id: mem.id,
      username: mem.username,
      email: mem.email,
      name: mem.fullName || mem.name || mem.username,
      tier: mem.tier || 'verified',
      role: mem.role || 'user',
      status: mem.status || 'active',
      scanCount: mem.scanCount || 0,
      reportCount: mem.reportCount || 0,
      createdAt: mem.createdAt,
    },
  });
}

export async function handleUpdateUserProfile(req: Request, res: Response): Promise<void> {
  const username = req.user?.username;
  if (!username) {
    res.status(401).json({ success: false, error: { message: 'Sesi tidak valid.' } });
    return;
  }

  const { name, full_name, email } = req.body || {};
  const targetName = name || full_name;
  if (!targetName || typeof targetName !== 'string' || targetName.trim().length < 2) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Nama lengkap minimal 2 karakter.' },
    });
    return;
  }

  const cleanName = targetName.trim();
  const cleanEmail = email && typeof email === 'string' ? email.trim() : null;

  if (isDbConnected()) {
    try {
      await query(
        `UPDATE app_users
         SET full_name = $1, email = COALESCE($2, email), updated_at = NOW()
         WHERE username = $3`,
        [cleanName, cleanEmail, username]
      );
    } catch (err) {
      console.warn('[DB] Gagal update app_users:', err);
    }
  }

  const mem = inMemoryUsers.find((u) => u.username === username);
  if (mem) {
    mem.fullName = cleanName;
    if (cleanEmail) mem.email = cleanEmail;
  }

  res.status(200).json({
    success: true,
    data: {
      username,
      name: cleanName,
      email: cleanEmail,
      message: 'Profil Anda berhasil diperbarui.',
    },
  });
}

export async function handleUpdateUserPassword(req: Request, res: Response): Promise<void> {
  const username = req.user?.username;
  if (!username) {
    res.status(401).json({ success: false, error: { message: 'Sesi tidak valid.' } });
    return;
  }

  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Kata sandi lama dan baru wajib diisi.' },
    });
    return;
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Kata sandi baru minimal 8 karakter.' },
    });
    return;
  }

  const oldHash = hashUserPassword(oldPassword);
  const newHash = hashUserPassword(newPassword);

  if (isDbConnected()) {
    try {
      const checkRes = await query(
        `SELECT id, password_hash FROM app_users WHERE username = $1 LIMIT 1`,
        [username]
      );
      if (checkRes && checkRes.rows.length > 0) {
        if (checkRes.rows[0].password_hash !== oldHash) {
          res.status(401).json({
            success: false,
            error: { code: 'WRONG_PASSWORD', message: 'Kata sandi saat ini tidak cocok.' },
          });
          return;
        }

        await query(
          `UPDATE app_users SET password_hash = $1, updated_at = NOW() WHERE username = $2`,
          [newHash, username]
        );
      }
    } catch (err) {
      console.warn('[DB] Gagal update password:', err);
    }
  }

  res.status(200).json({
    success: true,
    data: {
      message: 'Kata sandi Anda berhasil diperbarui.',
    },
  });
}

export async function handleGetUserStats(req: Request, res: Response): Promise<void> {
  const username = req.user?.username;
  if (!username) {
    res.status(401).json({ success: false, error: { message: 'Sesi tidak valid.' } });
    return;
  }

  const stats = await historyService.getUserStats(username);
  res.status(200).json({
    success: true,
    data: stats,
  });
}

export async function handleGetUserHistory(req: Request, res: Response): Promise<void> {
  const username = req.user?.username;
  if (!username) {
    res.status(401).json({ success: false, error: { message: 'Sesi tidak valid.' } });
    return;
  }

  const history = await historyService.getUserHistory(username);
  res.status(200).json({
    success: true,
    data: history,
  });
}
