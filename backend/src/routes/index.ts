import { Router } from 'express';
import analyzeRoutes from './analyze.routes';
import demoRoutes from './demo.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/', healthRoutes);
router.use('/', demoRoutes);
router.use('/', analyzeRoutes);

export default router;
