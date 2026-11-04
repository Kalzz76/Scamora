import {
  CHAT_INDICATOR_WEIGHTS,
  getSeverityFromWeight,
  INDICATOR_TITLES,
} from '../../config/scoring';
import type {
  AnalysisResult,
  Indicator,
  PipelineCheck,
} from '../../types/analysis';
import { calculateRiskScore } from '../riskScoring';
import { requestClaudeAnalysis } from './claudeClient';
import { maskPii } from './maskPii';
import { scanChatPatterns } from './patternScan';
import { isEvidenceInText } from './validateEvidence';

export async function analyzeChat(rawText: string): Promise<AnalysisResult> {
  const { maskedText, count: maskedCount } = maskPii(rawText);

  const localIndicators = scanChatPatterns(maskedText);

  const aiResult = await requestClaudeAnalysis(maskedText);

  const checks: PipelineCheck[] = [
    {
      name: 'pattern_scan',
      status: 'completed',
      note: 'Pemindaian aturan pola bahasa dan kata kunci lokal selesai.',
    },
  ];

  const mergedIndicators: Indicator[] = [];
  const addedTypes = new Set<string>();
  let hasDroppedQuotes = false;
  let canConclude = true;
  let aiScamType = null;

  if (aiResult.success && aiResult.data) {
    checks.push({
      name: 'ai_analysis',
      status: 'completed',
      note: 'Ekstraksi penalaran semantik dan klasifikasi Claude AI selesai.',
    });

    canConclude = aiResult.data.can_conclude;
    aiScamType = aiResult.data.scam_type;

    for (const aiInd of aiResult.data.indicators) {
      if (isEvidenceInText(aiInd.evidence_quote, maskedText)) {
        const weight = CHAT_INDICATOR_WEIGHTS[aiInd.type] || 15;
        const severity = getSeverityFromWeight(weight);
        const title = INDICATOR_TITLES[aiInd.type] || aiInd.type;

        mergedIndicators.push({
          type: aiInd.type,
          title,
          severity,
          weight,
          source: 'ai',
          evidence: aiInd.evidence_quote,
          description: aiInd.reason,
        });
        addedTypes.add(aiInd.type);
      } else {
        hasDroppedQuotes = true;
      }
    }

    for (const localInd of localIndicators) {
      if (!addedTypes.has(localInd.type)) {
        mergedIndicators.push(localInd);
        addedTypes.add(localInd.type);
      }
    }
  } else {
    checks.push({
      name: 'ai_analysis',
      status: 'failed',
      note: 'Layanan AI mengalami kendala teknis atau kunci API belum dikonfigurasi; dialihkan pada pemindaian lokal.',
    });

    for (const localInd of localIndicators) {
      mergedIndicators.push(localInd);
    }
  }

  const scoring = calculateRiskScore(
    mergedIndicators,
    checks,
    canConclude,
    aiScamType
  );

  if (maskedCount > 0) {
    scoring.limitations.push(
      'Informasi data pribadi (nomor telepon, rekening, NIK) telah dimasker secara otomatis sebelum evaluasi.'
    );
  }

  if (hasDroppedQuotes) {
    scoring.limitations.push(
      'Sebagian kutipan bukti dari analisis AI disaring karena tidak cocok dengan teks input asli.'
    );
  }

  const isPartial = checks.some((c) => c.status === 'failed');

  return {
    analysis_status: isPartial ? 'partial' : 'complete',
    analysis_type: 'chat',
    input_sanitized: maskedText,
    risk_level: scoring.riskLevel,
    raw_score: scoring.rawScore,
    risk_score: scoring.riskScore,
    category_reason: scoring.categoryReason,
    scam_type: scoring.scamType,
    indicators: scoring.indicators,
    checks,
    explanation: scoring.explanation,
    recommended_actions: scoring.recommendedActions,
    limitations: scoring.limitations,
    timestamp: new Date().toISOString(),
  };
}

