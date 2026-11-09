import { Router } from 'express';
import {
  handleLogin,
  handleRegister,
  handleGoogleAuthRedirect,
  handleGoogleCallback,
  handleGoogleTokenAuth,
  handleLogout,
} from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate';
import { authRateLimiter } from '../middlewares/rateLimit';
import { userLoginSchema, userRegisterSchema, googleTokenAuthSchema } from '../schemas/auth.schema';

const router = Router();

// Endpoint Login & Registrasi dengan Proteksi Brute-force (Rate Limit) & Validasi Schema
router.post('/login', authRateLimiter, validateBody(userLoginSchema), handleLogin);
router.post('/register', authRateLimiter, validateBody(userRegisterSchema), handleRegister);

// Endpoint Google OAuth 2.0
router.get('/google', handleGoogleAuthRedirect);
router.get('/google/callback', handleGoogleCallback);
router.post('/google/token', validateBody(googleTokenAuthSchema), handleGoogleTokenAuth);

// Endpoint Logout
router.post('/logout', handleLogout);

export default router;
