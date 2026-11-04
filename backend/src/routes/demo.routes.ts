import { Router } from 'express';
import { handleGetDemoExamples } from '../controllers/demo.controller';

const router = Router();

router.get('/demo-examples', handleGetDemoExamples);

export default router;

