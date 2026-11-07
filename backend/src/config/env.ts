import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  ANTHROPIC_API_KEY: z.string().default(''),
  CLAUDE_MODEL: z.string().default('claude-3-5-haiku-20241022'),
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
  AI_PROVIDER: z.enum(['auto', 'gemini', 'anthropic']).default('auto'),
  SAFE_BROWSING_API_KEY: z.string().default(''),
  SUPABASE_URL: z.string().default(''),
  SUPABASE_KEY: z.string().default(''),
  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().default('admin123'),
  ADMIN_SECRET: z.string().default('scamora-super-secret-admin-key-2026'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Konfigurasi environment tidak valid:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
