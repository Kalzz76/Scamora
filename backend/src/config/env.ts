import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_ORIGIN: z.string().default('https://scamora-teal.vercel.app'),
  ANTHROPIC_API_KEY: z.string().default(''),
  CLAUDE_MODEL: z.string().default('claude-3-5-haiku-20241022'),
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
  AI_PROVIDER: z.enum(['auto', 'gemini', 'anthropic']).default('auto'),
  SAFE_BROWSING_API_KEY: z.string().default(''),
  DATABASE_URL: z.string().default(''),
  SUPABASE_URL: z.string().default(''),
  SUPABASE_KEY: z.string().default(''),
  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().default('admin123'),
  ADMIN_SECRET: z.string().default('scamora-super-secret-admin-key-2026'),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  GOOGLE_CALLBACK_URL: z.string().default('https://scamora-teal.vercel.app/api/v1/auth/google/callback'),
  TURNSTILE_SECRET_KEY: z.string().default('0x4AAAAAAF67yK12S3HJynaMGWIVgwTW_w0'),
  TURNSTILE_SITE_KEY: z.string().default('0x4AAAAAAF67yLvs908uSKqH'),
  TURNSTILE_ENABLED: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === true || val === 'true' || val === '1')
    .default(true),
  GMAIL_USER: z.string().default(''),
  GMAIL_APP_PASSWORD: z.string().default(''),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === true || val === 'true' || val === '1')
    .default(false),
  SMTP_FROM: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Konfigurasi environment tidak valid:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
