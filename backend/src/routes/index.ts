import { Router } from 'express';
import adminRoutes from './admin.routes';
import analyzeRoutes from './analyze.routes';
import demoRoutes from './demo.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/', healthRoutes);
router.use('/', demoRoutes);
router.use('/', analyzeRoutes);
router.use('/admin', adminRoutes);

export default router;
