import { env } from '../../config/env';
import type { AiOutput } from '../../schemas/aiOutput.schema';
import { requestClaudeAnalysis } from './claudeClient';
import { requestGeminiAnalysis } from './geminiClient';

export interface AiAnalysisResult {
  success: boolean;
  data?: AiOutput;
  error?: string;
  provider?: 'gemini' | 'claude';
}

export async function requestAiAnalysis(
  maskedChatText: string
): Promise<AiAnalysisResult> {
  if (env.GEMINI_API_KEY) {
    const result = await requestGeminiAnalysis(maskedChatText);
    if (result.success) {
      return { ...result, provider: 'gemini' };
    }
  }

  if (env.ANTHROPIC_API_KEY) {
    const result = await requestClaudeAnalysis(maskedChatText);
    if (result.success) {
      return { ...result, provider: 'claude' };
    }
  }

  return {
    success: false,
    error: 'Layanan AI belum dikonfigurasi atau sedang mengalami kendala.',
  };
}
