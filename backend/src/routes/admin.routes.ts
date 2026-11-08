import { Router } from 'express';
import {
  handleAdminLogin,
  handleCreatePreset,
  handleDeletePreset,
  handleGetAiConfig,
  handleGetCrawlerConfig,
  handleGetPresets,
  handleGetStats,
  handleTestAi,
  handleUpdateAiConfig,
  handleUpdateCrawlerConfig,
  handleUpdatePreset,
  handleVerifyAdminSession,
} from '../controllers/admin.controller';
import { requireAdminAuth } from '../middlewares/adminAuth';
import { validateBody } from '../middlewares/validate';
import { adminLoginSchema } from '../schemas/adminAuth.schema';

const router = Router();

router.post('/login', validateBody(adminLoginSchema), handleAdminLogin);

router.get('/auth/verify', requireAdminAuth, handleVerifyAdminSession);

router.use(requireAdminAuth);

router.get('/stats', handleGetStats);

router.get('/ai-config', handleGetAiConfig);
router.put('/ai-config', handleUpdateAiConfig);
router.post('/test-ai', handleTestAi);

router.get('/crawler-config', handleGetCrawlerConfig);
router.put('/crawler-config', handleUpdateCrawlerConfig);

router.get('/presets', handleGetPresets);
router.post('/presets', handleCreatePreset);
router.put('/presets/:id', handleUpdatePreset);
router.delete('/presets/:id', handleDeletePreset);

export default router;
