import { z } from 'zod';

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, 'Nama pengguna wajib diisi'),
  password: z.string().trim().min(1, 'Kata sandi wajib diisi'),
});

export type AdminLoginPayload = z.infer<typeof adminLoginSchema>;
