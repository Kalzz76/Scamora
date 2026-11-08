import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { aiOutputSchema, type AiOutput } from '../../schemas/aiOutput.schema';
import { requestGeminiAnalysis } from '../ai/geminiClient';
import type { CrawlResult } from './pageCrawler';

export interface ClaudePageAnalysisResult {
  success: boolean;
  data?: AiOutput;
  error?: string;
  provider?: 'gemini' | 'anthropic';
}

const SYSTEM_PROMPT = `Anda adalah sistem pakar analisis keamanan siber untuk mendeteksi penipuan web (web scam, phishing perbankan, fake giveaway, pencurian akun, penyebaran malware APK) berdasarkan hasil perayapan (crawling) konten halaman web.
Tugas Anda: Analisis judul, formulir, dan teks halaman web yang dirayapi, lalu kembalikan HANYA format JSON valid tanpa teks pengantar atau markdown.

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
- evidence_quote (kutipan kalimat ASLI persis dari teks masukan halaman web di atas)
- reason (alasan teknis dalam bahasa Indonesia sederhana mengapa indikator ini berbahaya)

Format respons JSON yang wajib dipatuhi:
{
  "scam_type": "phishing" | "job_scam" | ...,
  "can_conclude": true | false,
  "summary": "Ringkasan analisis konten situs web dalam bahasa Indonesia",
  "indicators": [
    {
      "type": "...",
      "evidence_quote": "...",
      "reason": "..."
    }
  ]
}`;

export async function requestClaudePageAnalysis(
  targetUrl: string,
  crawl: CrawlResult
): Promise<ClaudePageAnalysisResult> {
  const useGemini =
    env.AI_PROVIDER === 'gemini' ||
    (env.AI_PROVIDER === 'auto' && Boolean(env.GEMINI_API_KEY)) ||
    (!env.ANTHROPIC_API_KEY && Boolean(env.GEMINI_API_KEY));

  // If neither key is provided, exit cleanly
  if (!env.GEMINI_API_KEY && !env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      error: 'Kunci API AI (GEMINI_API_KEY atau ANTHROPIC_API_KEY) belum dikonfigurasi.',
    };
  }

  // If there is almost no text and no forms, AI has nothing to analyze
  if (
    (!crawl.extractedText || crawl.extractedText.trim().length < 15) &&
    !crawl.hasPasswordInput &&
    !crawl.hasApkDownloadLink
  ) {
    return {
      success: false,
      error: 'Konten halaman terlalu minim untuk dianalisis oleh AI.',
    };
  }

  const formsSummary = crawl.detectedForms
    .map(
      (f, i) =>
        `Form #${i + 1}: Action="${f.action || 'self'}", Method=${f.method}, HasPassword=${f.hasPasswordInput}, HasFinancialInput=${f.hasSensitiveFinancialInput}, Inputs=[${f.inputNames.join(', ')}]`
    )
    .join('\n');

  const pageSummary = `URL Target: ${targetUrl}
Judul Halaman (<title>): ${crawl.title || 'Tidak ada'}
Deskripsi Meta: ${crawl.metaDescription || 'Tidak ada'}
Status Password Input: ${crawl.hasPasswordInput ? 'Ditemukan' : 'Tidak ditemukan'}
Status Financial Input: ${crawl.hasSensitiveFinancialInput ? 'Ditemukan' : 'Tidak ditemukan'}
Status Download APK: ${crawl.hasApkDownloadLink || crawl.isDirectApkDownload ? 'Ditemukan' : 'Tidak ditemukan'}
Target Form Eksternal: ${crawl.externalFormTargets.join(', ') || 'Tidak ada'}
Formulir Terdeteksi:
${formsSummary || 'Tidak ada tag form'}

Teks Halaman yang Dirayapi:
"""
${crawl.extractedText}
"""`;

  const userPrompt = `Berikut adalah ringkasan hasil perayapan halaman web:\n---RINGKASAN PERAYAPAN---\n${pageSummary}\n---SELESAI---`;

  // 1. Google Gemini
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

  // 2. Anthropic Claude
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
      // Retry attempt
    }
  }

  return {
    success: false,
    error: 'Gagal memvalidasi keluaran inferensi AI Claude terhadap konten halaman web.',
  };
}
