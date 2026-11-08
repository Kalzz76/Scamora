import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { aiOutputSchema, type AiOutput } from '../../schemas/aiOutput.schema';
import { requestGeminiAnalysis } from '../ai/geminiClient';

export interface ClaudeAnalysisResult {
  success: boolean;
  data?: AiOutput;
  error?: string;
  provider?: 'gemini' | 'anthropic';
}

const SYSTEM_PROMPT = `Anda adalah sistem pakar analisis keamanan siber untuk mendeteksi rekayasa sosial (social engineering) pada percakapan WhatsApp.
Tugas Anda: Analisis teks percakapan berikut dan kembalikan HANYA format JSON valid tanpa teks pengantar atau markdown.

Daftar tipe indikator yang diizinkan (TIDAK BOLEH MENGGUNAKAN TIPE DI LUAR DAFTAR INI):
- otp_request
- advance_fee
- threat_link
- impersonation_data
- unrealistic_offer
- time_pressure
- move_platform
- guaranteed_profit
- odd_language
- unknown_sender

Daftar scam_type yang diizinkan:
- phishing
- job_scam
- giveaway_scam
- impersonation
- banking_fraud
- investment_scam
- apk_malware
- unknown

Setiap item di indicators WAJIB memuat:
- type (dari daftar di atas)
- evidence_quote (kutipan kalimat ASLI persis dari teks masukan)
- reason (alasan teknis dalam bahasa Indonesia sederhana)

Format respons JSON yang wajib dipatuhi:
{
  "scam_type": "phishing" | "job_scam" | ...,
  "can_conclude": true | false,
  "summary": "Ringkasan analisis dalam bahasa Indonesia",
  "indicators": [
    {
      "type": "...",
      "evidence_quote": "...",
      "reason": "..."
    }
  ]
}`;

export async function requestClaudeAnalysis(maskedChatText: string): Promise<ClaudeAnalysisResult> {
  const useGemini =
    env.AI_PROVIDER === 'gemini' ||
    (env.AI_PROVIDER === 'auto' && Boolean(env.GEMINI_API_KEY)) ||
    (!env.ANTHROPIC_API_KEY && Boolean(env.GEMINI_API_KEY));

  const userPrompt = `Berikut adalah teks percakapan yang perlu dianalisis (teks di dalam pembatas):\n---INPUT MULAI---\n${maskedChatText}\n---INPUT SELESAI---`;

  // 1. If Gemini is configured, use Google Gemini
  if (useGemini && env.GEMINI_API_KEY) {
    const geminiResult = await requestGeminiAnalysis<any>(SYSTEM_PROMPT, userPrompt);
    if (!geminiResult.success || !geminiResult.data) {
      return {
        success: false,
        error: geminiResult.error || 'Gagal memanggil Gemini API.',
      };
    }

    const validated = aiOutputSchema.safeParse(geminiResult.data);
    if (validated.success) {
      return {
        success: true,
        data: validated.data,
        provider: 'gemini',
      };
    }

    return {
      success: false,
      error: `Skema output Gemini tidak sesuai: ${validated.error.message}`,
    };
  }

  // 2. Otherwise fallback to Anthropic Claude if key exists
  if (!env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      error: 'Kunci API AI (GEMINI_API_KEY atau ANTHROPIC_API_KEY) belum dikonfigurasi.',
    };
  }

  const anthropic = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    timeout: 10000,
  });

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: env.CLAUDE_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const firstBlock = response.content[0];
      if (!firstBlock || firstBlock.type !== 'text') {
        continue;
      }

      let rawJson = firstBlock.text.trim();
      if (rawJson.startsWith('```json')) {
        rawJson = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (rawJson.startsWith('```')) {
        rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedJson = JSON.parse(rawJson);
      const validated = aiOutputSchema.safeParse(parsedJson);

      if (validated.success) {
        return {
          success: true,
          data: validated.data,
          provider: 'anthropic',
        };
      }
    } catch {
      if (attempt === 2) {
        return {
          success: false,
          error: 'Gagal memanggil Claude API setelah percobaan ulang.',
        };
      }
    }
  }

  return {
    success: false,
    error: 'Respons dari Claude API tidak valid.',
  };
}
