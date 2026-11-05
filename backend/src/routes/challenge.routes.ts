import { Router } from 'express';
import {
  handleAbandonSession,
  handleCreateSession,
  handleGenerateScenario,
  handleGetSession,
  handleGetSessionResult,
  handleGetStatistics,
  handleListCategories,
  handleListHistory,
  handleListScenarios,
  handleSubmitDecision,
} from '../controllers/challenge.controller';
import { validateBody } from '../middlewares/validate';
import {
  createSessionSchema,
  generateScenarioSchema,
  submitDecisionSchema,
} from '../schemas/challenge.schema';

const router = Router();

router.get('/categories', handleListCategories);
router.get('/scenarios', handleListScenarios);
router.post(
  '/scenarios/generate',
  validateBody(generateScenarioSchema),
  handleGenerateScenario
);

router.post('/sessions', validateBody(createSessionSchema), handleCreateSession);
router.get('/sessions/:id', handleGetSession);
router.post(
  '/sessions/:id/decisions',
  validateBody(submitDecisionSchema),
  handleSubmitDecision
);
router.post('/sessions/:id/abandon', handleAbandonSession);
router.get('/sessions/:id/result', handleGetSessionResult);

router.get('/history', handleListHistory);
router.get('/statistics', handleGetStatistics);

export default router;

