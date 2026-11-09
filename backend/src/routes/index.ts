import { Router } from 'express';
import adminRoutes from './admin.routes';
import analyzeRoutes from './analyze.routes';
import authRoutes from './auth.routes';
import challengeRoutes from './challenge.routes';
import communityRoutes from './community.routes';
import demoRoutes from './demo.routes';
import healthRoutes from './health.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/', healthRoutes);
router.use('/', demoRoutes);
router.use('/', analyzeRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/user', userRoutes);
router.use('/challenges', challengeRoutes);
router.use('/community', communityRoutes);

export default router;
