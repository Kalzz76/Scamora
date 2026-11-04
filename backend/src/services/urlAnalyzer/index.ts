import {
  INDICATOR_TITLES,
  URL_INDICATOR_WEIGHTS,
} from '../../config/scoring';
import type {
  AnalysisResult,
  Indicator,
  PipelineCheck,
} from '../../types/analysis';
import { calculateRiskScore } from '../riskScoring';
import { checkSafeBrowsing } from './safeBrowsing';
import { sanitizeUrl } from './sanitizeUrl';
import { checkUrlStructure } from './structureCheck';

export async function analyzeUrl(rawUrl: string): Promise<AnalysisResult> {
  const { cleanUrl, hasUserInfo, hasCleanedParams } = sanitizeUrl(rawUrl);

  const parsed = new URL(cleanUrl);
  const indicators: Indicator[] = checkUrlStructure(parsed, hasUserInfo, rawUrl);

  const safeBrowsing = await checkSafeBrowsing(cleanUrl);
  if (safeBrowsing.isThreat) {
    indicators.push({
      type: 'safe_browsing_match',
      title: INDICATOR_TITLES.safe_browsing_match || 'Terdaftar pada Basis Data Google Safe Browsing',
      severity: 'high',
      weight: URL_INDICATOR_WEIGHTS.safe_browsing_match || 60,
      source: 'threat_db',
      evidence: cleanUrl,
      description: 'Domain tercatat aktif sebagai ancaman malware atau social engineering terkonfirmasi.',
    });
  }

  const checks: PipelineCheck[] = [
    {
      name: 'structure',
      status: 'completed',
      note: 'Pemeriksaan sintaksis dan heuristik struktur URL selesai.',
    },
    {
      name: 'reputation',
      status: safeBrowsing.status,
      note: safeBrowsing.note,
    },
    {
      name: 'domain_age',
      status: 'skipped',
      note: 'Pemeriksaan usia domain (RDAP) dilewati pada versi ini.',
    },
  ];

  const scoring = calculateRiskScore(indicators, checks);

  if (hasCleanedParams || hasUserInfo) {
    scoring.limitations.push(
      'Parameter bernilai sensitif atau informasi akun pada URL telah dibersihkan secara otomatis demi privasi pengguna.'
    );
  }

  const isPartial = checks.some((c) => c.status === 'failed');

  return {
    analysis_status: isPartial ? 'partial' : 'complete',
    analysis_type: 'url',
    input_sanitized: cleanUrl,
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

