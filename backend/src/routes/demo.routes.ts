import { Router } from 'express';
import { handleGetDemoExamples } from '../controllers/demo.controller';

const router = Router();

router.get(['/demo-examples', '/demo/examples'], handleGetDemoExamples);

export default router;

