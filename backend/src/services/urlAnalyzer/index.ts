import {
  CHAT_INDICATOR_WEIGHTS,
  getSeverityFromWeight,
  INDICATOR_TITLES,
  URL_INDICATOR_WEIGHTS,
} from '../../config/scoring';
import type {
  AnalysisResult,
  Indicator,
  PipelineCheck,
} from '../../types/analysis';
import { isEvidenceInText } from '../chatAnalyzer/validateEvidence';
import { calculateRiskScore } from '../riskScoring';
import { requestClaudePageAnalysis } from './claudePageAnalyzer';
import { scanCrawlHeuristics } from './crawlerHeuristics';
import { crawlWebPage } from './pageCrawler';
import { checkSafeBrowsing } from './safeBrowsing';
import { sanitizeUrl } from './sanitizeUrl';
import { checkUrlStructure } from './structureCheck';

export async function analyzeUrl(rawUrl: string): Promise<AnalysisResult> {
  const { cleanUrl, hasUserInfo, hasCleanedParams } = sanitizeUrl(rawUrl);

  const parsed = new URL(cleanUrl);
  const rawIndicators: Indicator[] = checkUrlStructure(parsed, hasUserInfo, rawUrl);

  // 1. Google Safe Browsing Check
  const safeBrowsing = await checkSafeBrowsing(cleanUrl);
  if (safeBrowsing.isThreat) {
    rawIndicators.push({
      type: 'safe_browsing_match',
      title: INDICATOR_TITLES.safe_browsing_match || 'Terdaftar pada Basis Data Google Safe Browsing',
      severity: 'high',
      weight: URL_INDICATOR_WEIGHTS.safe_browsing_match || 60,
      source: 'threat_db',
      evidence: cleanUrl,
      description: 'Domain tercatat aktif sebagai ancaman malware atau social engineering terkonfirmasi.',
    });
  }

  // 2. Safe Web Page Crawling (Fetching DOM, forms, sensitive inputs & text)
  const crawl = await crawlWebPage(cleanUrl);

  // 3. Local Crawler DOM Heuristics
  if (crawl.status === 'completed') {
    const crawlerIndicators = scanCrawlHeuristics(parsed, crawl);
    for (const ind of crawlerIndicators) {
      rawIndicators.push(ind);
    }
  }

  // 4. Claude AI Semantic Reasoning on Crawled Content
  const aiResult = await requestClaudePageAnalysis(cleanUrl, crawl);

  let canConclude = true;
  let aiScamType = null;
  let hasDroppedQuotes = false;

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
      name: 'crawler',
      status: crawl.status,
      note: crawl.note,
    },
  ];

  if (aiResult.success && aiResult.data) {
    checks.push({
      name: 'content_ai',
      status: 'completed',
      note: `Penalaran semantik ${aiResult.provider === 'gemini' ? 'Google Gemini AI' : 'Claude AI'} terhadap konten halaman yang dirayapi selesai.`,
    });

    canConclude = aiResult.data.can_conclude;
    aiScamType = aiResult.data.scam_type;

    const sourceText = `${crawl.title || ''} ${crawl.metaDescription || ''} ${crawl.extractedText}`;

    for (const aiInd of aiResult.data.indicators) {
      if (isEvidenceInText(aiInd.evidence_quote, sourceText)) {
        const weight =
          URL_INDICATOR_WEIGHTS[aiInd.type] ||
          CHAT_INDICATOR_WEIGHTS[aiInd.type] ||
          20;
        const severity = getSeverityFromWeight(weight);
        const title = INDICATOR_TITLES[aiInd.type] || aiInd.type;

        rawIndicators.push({
          type: aiInd.type,
          title,
          severity,
          weight,
          source: 'content_ai',
          evidence: aiInd.evidence_quote,
          description: aiInd.reason,
        });
      } else {
        hasDroppedQuotes = true;
      }
    }
  } else {
    checks.push({
      name: 'content_ai',
      status: crawl.status === 'completed' && !crawl.extractedText ? 'skipped' : 'partial',
      note:
        aiResult.error ||
        'Layanan AI belum dikonfigurasi atau konten web statis; dialihkan ke heuristik perayapan lokal.',
    });
  }

  const scoring = calculateRiskScore(
    rawIndicators,
    checks,
    canConclude,
    aiScamType
  );

  if (hasCleanedParams || hasUserInfo) {
    scoring.limitations.push(
      'Parameter bernilai sensitif atau informasi akun pada URL telah dibersihkan secara otomatis demi privasi pengguna.'
    );
  }

  if (hasDroppedQuotes) {
    scoring.limitations.push(
      'Sebagian kutipan indikator AI disaring karena tidak terbukti secara harfiah pada konten yang dirayapi (pencegahan halusinasi).'
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
