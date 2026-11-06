import { Router } from 'express';
import {
  handleGetStats,
  handleGetAiConfig,
  handleUpdateAiConfig,
  handleTestAi,
  handleGetCrawlerConfig,
  handleUpdateCrawlerConfig,
  handleGetPresets,
  handleCreatePreset,
  handleUpdatePreset,
  handleDeletePreset,
} from '../controllers/admin.controller';

const router = Router();

// Dashboard Telemetry & Stats
router.get('/stats', handleGetStats);

// AI Engine Configuration & Latency Ping
router.get('/ai-config', handleGetAiConfig);
router.put('/ai-config', handleUpdateAiConfig);
router.post('/test-ai', handleTestAi);

// Crawler Configuration
router.get('/crawler-config', handleGetCrawlerConfig);
router.put('/crawler-config', handleUpdateCrawlerConfig);

// Demo Presets CRUD
router.get('/presets', handleGetPresets);
router.post('/presets', handleCreatePreset);
router.put('/presets/:id', handleUpdatePreset);
router.delete('/presets/:id', handleDeletePreset);

export default router;

