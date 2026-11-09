import { Router } from 'express';
import {
  handleGetUserHistory,
  handleGetUserProfile,
  handleGetUserStats,
  handleUpdateUserPassword,
  handleUpdateUserProfile,
} from '../controllers/user.controller';
import { requireUserAuth } from '../middlewares/userAuth';

const router = Router();

// All user routes require authenticated user session
router.use(requireUserAuth);

router.get('/profile', handleGetUserProfile);
router.put('/profile', handleUpdateUserProfile);
router.put('/password', handleUpdateUserPassword);
router.get('/stats', handleGetUserStats);
router.get('/history', handleGetUserHistory);

export default router;

