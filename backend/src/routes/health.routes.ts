import { Router, type Request, type Response } from 'express';
import { env } from '../config/env';
import { isDbConnected } from '../config/db';
import { getSupabaseClient } from '../config/supabase';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const isGeminiConfigured = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);
  const isDatabaseConfigured = Boolean(env.DATABASE_URL && env.DATABASE_URL.trim().length > 0);
  const isSupabaseConfigured = Boolean(getSupabaseClient());

  res.status(200).json({
    status: 'ok',
    service: 'scamora-backend',
    gemini_configured: isGeminiConfigured,
    gemini_model: env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview',
    database_configured: isDatabaseConfigured,
    database_connected: isDbConnected(),
    supabase_configured: isSupabaseConfigured,
    timestamp: new Date().toISOString(),
  });
});

export default router;

