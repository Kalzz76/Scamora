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
import { inspectLiveContent } from './contentInspector';
import { inspectDomainAndDns } from './domainInspector';
import { checkSafeBrowsing } from './safeBrowsing';
import { sanitizeUrl } from './sanitizeUrl';
import { inspectSslCertificate } from './sslInspector';
import { checkUrlStructure } from './structureCheck';

export async function analyzeUrl(rawUrl: string): Promise<AnalysisResult> {
  const { cleanUrl, hasUserInfo, hasCleanedParams } = sanitizeUrl(rawUrl);
  const parsed = new URL(cleanUrl);

  // 1. Lapisan 1: Analisis Struktur URL & Heuristik
  const indicators: Indicator[] = checkUrlStructure(parsed, hasUserInfo, rawUrl);

  // 2. Lapisan 2 - 5: Jalankan Pengecekan Jaringan & Konten secara Paralel (Konkuren)
  const [safeBrowsingRes, domainRes, sslRes, contentRes] = await Promise.allSettled([
    checkSafeBrowsing(cleanUrl),
    inspectDomainAndDns(parsed.hostname),
    inspectSslCertificate(parsed.hostname),
    inspectLiveContent(cleanUrl),
  ]);

  // Safe Browsing
  const safeBrowsing =
    safeBrowsingRes.status === 'fulfilled'
      ? safeBrowsingRes.value
      : { isThreat: false, status: 'failed' as const, note: 'Pengecekan Google Safe Browsing gagal.' };

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

  // Lapisan 2: Domain DNS & Usia Domain
  const domainData =
    domainRes.status === 'fulfilled'
      ? domainRes.value
      : {
          indicators: [],
          dnsStatus: 'failed' as const,
          dnsNote: 'Inspeksi DNS gagal dijalankan.',
          ageStatus: 'failed' as const,
          ageNote: 'Inspeksi RDAP usia domain gagal dijalankan.',
        };
  indicators.push(...domainData.indicators);

  // Lapisan 3: SSL/TLS
  const sslData =
    sslRes.status === 'fulfilled'
      ? sslRes.value
      : {
          indicators: [],
          status: 'failed' as const,
          note: 'Inspeksi koneksi SSL/TLS gagal dijalankan.',
        };
  indicators.push(...sslData.indicators);

  // Lapisan 4 & 5: Konten & DOM
  const contentData =
    contentRes.status === 'fulfilled'
      ? contentRes.value
      : {
          indicators: [],
          status: 'failed' as const,
          note: 'Inspeksi konten web langsung gagal dijalankan.',
        };
  indicators.push(...contentData.indicators);

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
      status: domainData.ageStatus,
      note: domainData.ageNote,
    },
    {
      name: 'ssl_certificate',
      status: sslData.status,
      note: sslData.note,
    },
    {
      name: 'live_content',
      status: contentData.status,
      note: contentData.note,
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
