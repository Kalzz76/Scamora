import { Router } from 'express';
import {
  handleAnalyzeChat,
  handleAnalyzeUrl,
  handleGetScannedDomains,
} from '../controllers/analyze.controller';
import { analyzeRateLimiter } from '../middlewares/rateLimit';
import { validateBody } from '../middlewares/validate';
import {
  analyzeChatSchema,
  analyzeUrlSchema,
} from '../schemas/analyze.schema';

const router = Router();

router.get('/scanned-domains', handleGetScannedDomains);

router.post(
  '/analyze/url',
  analyzeRateLimiter,
  validateBody(analyzeUrlSchema),
  handleAnalyzeUrl
);

router.post(
  '/analyze/chat',
  analyzeRateLimiter,
  validateBody(analyzeChatSchema),
  handleAnalyzeChat
);

export default router;
