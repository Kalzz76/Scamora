import crypto from 'crypto';
import { env } from '../config/env';

export interface TokenPayload {
  u: string;
  exp: number;
}

export function validateAdminCredentials(username: string, password: string): boolean {
  if (!username || !password) {
    return false;
  }
  const expectedUser = env.ADMIN_USERNAME;
  const expectedPass = env.ADMIN_PASSWORD;

  if (username !== expectedUser) {
    return false;
  }

  const userPassBuf = Buffer.from(password);
  const expectedPassBuf = Buffer.from(expectedPass);

  if (userPassBuf.length !== expectedPassBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(userPassBuf, expectedPassBuf);
}

export function createAdminToken(username: string): string {
  const payload: TokenPayload = {
    u: username,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', env.ADMIN_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

export function verifyAdminToken(token: string): { valid: boolean; username?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadB64, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', env.ADMIN_SECRET)
    .update(payloadB64)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedSigBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expectedSigBuf.length) {
    return { valid: false };
  }

  if (!crypto.timingSafeEqual(sigBuf, expectedSigBuf)) {
    return { valid: false };
  }

  try {
    const rawJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const parsed = JSON.parse(rawJson) as TokenPayload;

    if (!parsed.exp || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return { valid: false };
    }

    if (parsed.u !== env.ADMIN_USERNAME) {
      return { valid: false };
    }

    return { valid: true, username: parsed.u };
  } catch {
    return { valid: false };
  }
}
