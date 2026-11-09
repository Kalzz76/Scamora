import type { NextFunction, Request, Response } from 'express';
import { verifyAdminToken } from '../services/adminAuthService';

export interface AuthenticatedUser {
  username: string;
  role: string;
  tier: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireUserAuth(
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
        message: 'Akses ditolak. Silakan masuk ke akun Scamora Anda terlebih dahulu.',
      },
    });
    return;
  }

  const token = authHeader.slice(7).trim();
  const verification = verifyAdminToken(token);

  if (!verification.valid || !verification.username) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Sesi login telah kedaluwarsa atau tidak valid. Silakan masuk kembali.',
      },
    });
    return;
  }

  req.user = {
    username: verification.username,
    role: verification.role || 'user',
    tier: verification.tier || 'verified',
  };

  next();
}

