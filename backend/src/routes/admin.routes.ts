import { Router } from 'express';
import {
  handleAdminLogin,
  handleUserRegister,
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
  handleGetUsers,
  handleCreateUser,
  handleUpdateUserTier,
  handleUpdateUserStatus,
  handleDeleteUser,
} from '../controllers/admin.controller';
import { requireAdminAuth } from '../middlewares/adminAuth';
import { validateBody } from '../middlewares/validate';
import { adminLoginSchema } from '../schemas/adminAuth.schema';

const router = Router();

// Public auth endpoints
router.post('/login', validateBody(adminLoginSchema), handleAdminLogin);
router.post('/register', handleUserRegister);
router.get('/auth/verify', requireAdminAuth, handleVerifyAdminSession);

// Protected routes (Admin token required)
router.use(requireAdminAuth);

// 1. Dashboard & Telemetry
router.get('/stats', handleGetStats);

// 2. User Accounts Management (Guest & Verified Tiers)
router.get('/users', handleGetUsers);
router.post('/users', handleCreateUser);
router.put('/users/:id/tier', handleUpdateUserTier);
router.put('/users/:id/status', handleUpdateUserStatus);
router.delete('/users/:id', handleDeleteUser);

// 3. AI Engine Config
router.get('/ai-config', handleGetAiConfig);
router.put('/ai-config', handleUpdateAiConfig);
router.post('/test-ai', handleTestAi);

// 4. Web Crawler Config
router.get('/crawler-config', handleGetCrawlerConfig);
router.put('/crawler-config', handleUpdateCrawlerConfig);

// 5. Demo Presets
router.get('/presets', handleGetPresets);
router.post('/presets', handleCreatePreset);
router.put('/presets/:id', handleUpdatePreset);
router.delete('/presets/:id', handleDeletePreset);

// 6. Knowledge Base Articles
router.get('/articles', handleGetArticles);
router.post('/articles', handleCreateArticle);
router.put('/articles/:id', handleUpdateArticle);
router.delete('/articles/:id', handleDeleteArticle);

// 7. Threat Taxonomy Categories
router.get('/categories', handleGetCategories);

// 8. Guardian Challenge Questions
router.get('/questions', handleGetQuestions);
router.post('/questions', handleCreateQuestion);
router.put('/questions/:id', handleUpdateQuestion);
router.delete('/questions/:id', handleDeleteQuestion);

// 9. Community Moderation
router.get('/posts', handleGetCommunityPosts);
router.post('/posts', handleCreateCommunityPost);
router.put('/posts/:id/status', handleUpdatePostStatus);
router.delete('/posts/:id', handleDeletePost);

router.get('/reports', handleGetReports);
router.put('/reports/:id/resolve', handleResolveReport);

// 10. Audit Trail Logs
router.get('/audit-logs', handleGetAuditLogs);
router.post('/audit-logs', handleCreateAuditLog);

export default router;
