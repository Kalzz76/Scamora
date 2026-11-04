import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { aiOutputSchema, type AiOutput } from '../../schemas/aiOutput.schema';

export interface ClaudeAnalysisResult {
  success: boolean;
  data?: AiOutput;
  error?: string;
}

export async function requestClaudeAnalysis(maskedChatText: string): Promise<ClaudeAnalysisResult> {
  if (!env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      error: 'ANTHROPIC_API_KEY belum dikonfigurasi.',
    };
  }

  const anthropic = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    timeout: 10000,
  });

  const systemPrompt = `Anda adalah sistem pakar analisis keamanan siber untuk mendeteksi rekayasa sosial (social engineering) pada percakapan WhatsApp.
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

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: env.CLAUDE_MODEL,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Berikut adalah teks percakapan yang perlu dianalisis (teks di dalam pembatas):\n---INPUT MULAI---\n${maskedChatText}\n---INPUT SELESAI---`,
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

