import { env } from '../../config/env';
import { aiOutputSchema, type AiOutput } from '../../schemas/aiOutput.schema';

export interface GeminiAnalysisResult {
  success: boolean;
  data?: AiOutput;
  error?: string;
}

export async function requestGeminiAnalysis(
  maskedChatText: string
): Promise<GeminiAnalysisResult> {
  if (!env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'GEMINI_API_KEY belum dikonfigurasi.',
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

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

  const requestBody = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        parts: [
          {
            text: `Berikut adalah teks percakapan yang perlu dianalisis (teks di dalam pembatas):\n---INPUT MULAI---\n${maskedChatText}\n---INPUT SELESAI---`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  };

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        if (attempt === 2) {
          return {
            success: false,
            error: `Gemini API merespons dengan status ${response.status}.`,
          };
        }
        continue;
      }

      const rawData = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{
              text?: string;
            }>;
          };
        }>;
      };

      const rawText = rawData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!rawText) {
        continue;
      }

      let cleanedJson = rawText;
      if (cleanedJson.startsWith('```json')) {
        cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedJson = JSON.parse(cleanedJson);
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
          error: 'Gagal memanggil Gemini API setelah percobaan ulang.',
        };
      }
    }
  }

  return {
    success: false,
    error: 'Respons dari Gemini API tidak valid.',
  };
}

