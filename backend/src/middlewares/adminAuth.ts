import type { NextFunction, Request, Response } from 'express';
import { verifyAdminToken } from '../services/adminAuthService';

export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Akses ditolak. Sesi login administrator diperlukan.',
      },
    });
    return;
  }

  const token = authHeader.slice(7).trim();
  const verification = verifyAdminToken(token);

  if (!verification.valid) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Sesi login telah kedaluwarsa atau tidak valid. Silakan login kembali.',
      },
    });
    return;
  }

  // Pastikan role token memiliki wewenang administrator
  if (verification.role !== 'admin' && verification.role !== 'superadmin') {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Akses ditolak. Endpoint ini hanya dapat diakses oleh administrator.',
      },
    });
    return;
  }

  req.user = {
    username: verification.username || 'admin',
    role: verification.role,
    tier: (verification.tier as any) || 'verified',
  };

  next();
}
