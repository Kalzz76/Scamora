import { Router } from 'express';
import adminRoutes from './admin.routes';
import analyzeRoutes from './analyze.routes';
import challengeRoutes from './challenge.routes';
import demoRoutes from './demo.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/', healthRoutes);
router.use('/', demoRoutes);
router.use('/', analyzeRoutes);
router.use('/admin', adminRoutes);
router.use('/challenges', challengeRoutes);

export default router;
