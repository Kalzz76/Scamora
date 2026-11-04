import { z } from 'zod';

export const analyzeUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Alamat URL wajib diisi.')
    .max(2048, 'Panjang URL melebihi batas 2.048 karakter.')
    .refine(
      (val) => {
        try {
          const parsed = new URL(val);
          return (
            (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
            Boolean(parsed.hostname)
          );
        } catch {
          return false;
        }
      },
      {
        message: 'Format URL tidak valid. Pastikan menyertakan http:// atau https:// dan nama host yang benar.',
      }
    ),
  privacy_consent: z.literal(true, {
    error: 'Persetujuan kebijakan privasi wajib disetujui sebelum pemeriksaan.',
  }),
});

export const analyzeChatSchema = z.object({
  text: z
    .string()
    .trim()
    .min(10, 'Teks percakapan minimal 10 karakter.')
    .max(5000, 'Teks percakapan melebihi batas maksimal 5.000 karakter.'),
  privacy_consent: z.literal(true, {
    error: 'Persetujuan kebijakan privasi wajib disetujui sebelum pemeriksaan.',
  }),
});

export type AnalyzeUrlInput = z.infer<typeof analyzeUrlSchema>;
export type AnalyzeChatInput = z.infer<typeof analyzeChatSchema>;

