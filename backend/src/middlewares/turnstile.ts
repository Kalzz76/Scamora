import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { verifyTurnstileToken } from '../services/turnstileService';

/**
 * Middleware untuk memvalidasi Cloudflare Turnstile CAPTCHA sebelum memproses request autentikasi
 */
export function requireTurnstile(action?: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Jika proteksi CAPTCHA dinonaktifkan secara eksplisit pada .env
    if (!env.TURNSTILE_ENABLED) {
      return next();
    }

    const token =
      req.body?.turnstileToken ||
      req.body?.['cf-turnstile-response'] ||
      req.headers['x-turnstile-token'];

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      res.status(422).json({
        success: false,
        error: {
          code: 'CAPTCHA_REQUIRED',
          message: 'Verifikasi keamanan Cloudflare Turnstile wajib diselesaikan.',
        },
      });
      return;
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;

    const verification = await verifyTurnstileToken(token.trim(), {
      action,
      remoteIp: clientIp,
    });

    if (!verification.success) {
      res.status(403).json({
        success: false,
        error: {
          code: verification.errorCode || 'CAPTCHA_FAILED',
          message: verification.errorMessage || 'Verifikasi keamanan gagal. Silakan ulangi verifikasi CAPTCHA.',
        },
      });
      return;
    }

    next();
  };
}

