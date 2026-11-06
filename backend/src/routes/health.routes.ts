import { Router, type Request, type Response } from 'express';
import { env } from '../config/env';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const isGeminiConfigured = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);

  res.status(200).json({
    status: 'ok',
    service: 'scamora-backend',
    gemini_configured: isGeminiConfigured,
    gemini_model: env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview',
    timestamp: new Date().toISOString(),
  });
});

export default router;

