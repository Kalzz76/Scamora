import { Router } from 'express';
import {
  handleAdminLogin,
  handleVerifyAdminSession,
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
  handleGetArticles,
  handleCreateArticle,
  handleUpdateArticle,
  handleDeleteArticle,
  handleGetCategories,
  handleGetQuestions,
  handleCreateQuestion,
  handleUpdateQuestion,
  handleDeleteQuestion,
  handleGetCommunityPosts,
  handleCreateCommunityPost,
  handleUpdatePostStatus,
  handleDeletePost,
  handleGetReports,
  handleResolveReport,
  handleGetAuditLogs,
  handleCreateAuditLog,
} from '../controllers/admin.controller';
import { requireAdminAuth } from '../middlewares/adminAuth';
import { validateBody } from '../middlewares/validate';
import { adminLoginSchema } from '../schemas/adminAuth.schema';

const router = Router();

// Public auth endpoints
router.post('/login', validateBody(adminLoginSchema), handleAdminLogin);
router.get('/auth/verify', requireAdminAuth, handleVerifyAdminSession);

// Protected routes (Admin token required)
router.use(requireAdminAuth);

// 1. Dashboard & Telemetry
router.get('/stats', handleGetStats);

// 2. AI Engine Config
router.get('/ai-config', handleGetAiConfig);
router.put('/ai-config', handleUpdateAiConfig);
router.post('/test-ai', handleTestAi);

// 3. Web Crawler Config
router.get('/crawler-config', handleGetCrawlerConfig);
router.put('/crawler-config', handleUpdateCrawlerConfig);

// 4. Demo Presets
router.get('/presets', handleGetPresets);
router.post('/presets', handleCreatePreset);
router.put('/presets/:id', handleUpdatePreset);
router.delete('/presets/:id', handleDeletePreset);

// 5. Knowledge Base Articles
router.get('/articles', handleGetArticles);
router.post('/articles', handleCreateArticle);
router.put('/articles/:id', handleUpdateArticle);
router.delete('/articles/:id', handleDeleteArticle);

// 6. Threat Taxonomy Categories
router.get('/categories', handleGetCategories);

// 7. Guardian Challenge Questions
router.get('/questions', handleGetQuestions);
router.post('/questions', handleCreateQuestion);
router.put('/questions/:id', handleUpdateQuestion);
router.delete('/questions/:id', handleDeleteQuestion);

// 8. Community Moderation
router.get('/posts', handleGetCommunityPosts);
router.post('/posts', handleCreateCommunityPost);
router.put('/posts/:id/status', handleUpdatePostStatus);
router.delete('/posts/:id', handleDeletePost);

router.get('/reports', handleGetReports);
router.put('/reports/:id/resolve', handleResolveReport);

// 9. Audit Trail Logs
router.get('/audit-logs', handleGetAuditLogs);
router.post('/audit-logs', handleCreateAuditLog);

export default router;
