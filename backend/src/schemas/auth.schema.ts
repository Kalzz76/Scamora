import { z } from 'zod';

export const userLoginSchema = z.object({
  username: z.string().trim().min(1, 'Nama pengguna atau email wajib diisi'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
  rememberMe: z.boolean().optional().default(false),
  turnstileToken: z.string().optional(),
});

export const userRegisterSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Nama lengkap minimal 2 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),
    username: z
      .string()
      .trim()
      .min(3, 'Username minimal 3 karakter')
      .max(40, 'Username maksimal 40 karakter')
      .regex(/^[a-zA-Z0-9_.]+$/, 'Username hanya boleh memuat huruf, angka, garis bawah (_), atau titik (.)'),
    email: z
      .string()
      .trim()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    password: z
      .string()
      .min(8, 'Kata sandi minimal 8 karakter')
      .regex(/[0-9]/, 'Kata sandi harus memuat minimal 1 angka')
      .regex(/[a-zA-Z]/, 'Kata sandi harus memuat minimal 1 huruf'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
    turnstileToken: z.string().optional(),
    otp: z.string().optional(),
    bypassOtp: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi',
    path: ['confirmPassword'],
  });

export const googleTokenAuthSchema = z.object({
  credential: z.string().min(10, 'Credential Google ID token wajib disertakan').optional(),
  code: z.string().optional(),
  redirectUri: z.string().optional(),
});

// ===================== SKEMA SMTP OTP =====================

export const verifyOtpSchema = z.object({
  email: z.string().trim().email('Format email tidak valid'),
  otp: z.string().trim().regex(/^\d{6}$/, 'Kode OTP harus berupa 6 digit angka'),
});

export const resendOtpSchema = z.object({
  email: z.string().trim().email('Format email tidak valid'),
  purpose: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET'], {
    message: 'Tujuan OTP harus EMAIL_VERIFICATION atau PASSWORD_RESET',
  }),
  turnstileToken: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Format email tidak valid'),
  turnstileToken: z.string().optional(),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().email('Format email tidak valid'),
    resetToken: z.string().min(16, 'Token reset kata sandi tidak valid atau tidak lengkap'),
    newPassword: z
      .string()
      .min(8, 'Kata sandi baru minimal 8 karakter')
      .regex(/[0-9]/, 'Kata sandi baru harus memuat minimal 1 angka')
      .regex(/[a-zA-Z]/, 'Kata sandi baru harus memuat minimal 1 huruf'),
    confirmNewPassword: z.string().min(1, 'Konfirmasi kata sandi baru wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru',
    path: ['confirmNewPassword'],
  });

export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type GoogleTokenAuthInput = z.infer<typeof googleTokenAuthSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
