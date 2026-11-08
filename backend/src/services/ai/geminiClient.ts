import { env } from '../../config/env';

export interface GeminiAnalysisResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider?: 'gemini';
}

const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

export async function requestGeminiAnalysis<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<GeminiAnalysisResult<T>> {
  if (!env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'GEMINI_API_KEY belum dikonfigurasi.',
    };
  }

  const preferred = env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const modelsToTry = Array.from(new Set([preferred, ...FALLBACK_MODELS]));

  let lastError = '';

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
        signal: AbortSignal.timeout(15000),
      });

      const json = await res.json();

      if (!res.ok) {
        lastError = json.error?.message || `HTTP ${res.status}`;
        // If 404 model not found or deprecated, try next model in fallback list
        if (res.status === 404) {
          continue;
        }
        return {
          success: false,
          error: `Gemini API (${model}): ${lastError}`,
        };
      }

      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      let cleanJson = rawText;

      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
      }

      const parsed = JSON.parse(cleanJson);
      return {
        success: true,
        data: parsed as T,
        provider: 'gemini',
      };
    } catch (err: any) {
      lastError = err.message || String(err);
    }
  }

  return {
    success: false,
    error: `Gagal memanggil Gemini API: ${lastError}`,
  };
}
