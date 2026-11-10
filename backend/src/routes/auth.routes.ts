import { Router } from 'express';
import {
  handleLogin,
  handleRegister,
  handleVerifyRegisterOtp,
  handleResendOtp,
  handleForgotPassword,
  handleVerifyPasswordResetOtp,
  handleResetPassword,
  handleGoogleAuthRedirect,
  handleGoogleCallback,
  handleGoogleTokenAuth,
  handleLogout,
} from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate';
import { authRateLimiter, otpRateLimiter } from '../middlewares/rateLimit';
import { requireTurnstile } from '../middlewares/turnstile';
import {
  userLoginSchema,
  userRegisterSchema,
  googleTokenAuthSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema';

const router = Router();

// Endpoint Login & Registrasi dengan Proteksi Brute-force (Rate Limit), Validasi Schema, & Cloudflare Turnstile
router.post(
  '/login',
  authRateLimiter,
  validateBody(userLoginSchema),
  requireTurnstile('login'),
  handleLogin
);

router.post(
  '/register',
  authRateLimiter,
  validateBody(userRegisterSchema),
  requireTurnstile('register'),
  handleRegister
);

// Endpoint Verifikasi OTP Registrasi & Resend OTP
router.post(
  '/register/verify',
  otpRateLimiter,
  validateBody(verifyOtpSchema),
  handleVerifyRegisterOtp
);

router.post(
  '/otp/resend',
  otpRateLimiter,
  validateBody(resendOtpSchema),
  handleResendOtp
);

// Endpoint Lupa & Reset Password
router.post(
  '/password/forgot',
  otpRateLimiter,
  validateBody(forgotPasswordSchema),
  handleForgotPassword
);

router.post(
  '/password/verify-otp',
  otpRateLimiter,
  validateBody(verifyOtpSchema),
  handleVerifyPasswordResetOtp
);

router.post(
  '/password/reset',
  authRateLimiter,
  validateBody(resetPasswordSchema),
  handleResetPassword
);

// Endpoint Google OAuth 2.0
router.get('/google', handleGoogleAuthRedirect);
router.get('/google/callback', handleGoogleCallback);
router.post('/google/token', validateBody(googleTokenAuthSchema), handleGoogleTokenAuth);

// Endpoint Logout
router.post('/logout', handleLogout);

export default router;
