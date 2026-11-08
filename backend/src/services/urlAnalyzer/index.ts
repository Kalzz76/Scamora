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
import { inspectDomainAndDns } from './domainInspector';
import { crawlWebPage, type CrawlResult } from './pageCrawler';
import { checkSafeBrowsing } from './safeBrowsing';
import { sanitizeUrl } from './sanitizeUrl';
import { inspectSslCertificate } from './sslInspector';
import { checkUrlStructure } from './structureCheck';

export async function analyzeUrl(rawUrl: string): Promise<AnalysisResult> {
  const { cleanUrl, hasUserInfo, hasCleanedParams } = sanitizeUrl(rawUrl);
  const parsed = new URL(cleanUrl);

  // 1. Lapisan 1: Analisis Struktur URL & Heuristik
  const rawIndicators: Indicator[] = checkUrlStructure(parsed, hasUserInfo, rawUrl);

  // 2. Lapisan 2 - 5: Jalankan Pengecekan Jaringan, SSL, Domain & Konten secara Paralel
  const [safeBrowsingRes, domainRes, sslRes, crawlRes] = await Promise.allSettled([
    checkSafeBrowsing(cleanUrl),
    inspectDomainAndDns(parsed.hostname),
    inspectSslCertificate(parsed.hostname),
    crawlWebPage(cleanUrl),
  ]);

  // Safe Browsing
  const safeBrowsing =
    safeBrowsingRes.status === 'fulfilled'
      ? safeBrowsingRes.value
      : { isThreat: false, status: 'failed' as const, note: 'Pengecekan Google Safe Browsing gagal.' };

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
  rawIndicators.push(...domainData.indicators);

  // Lapisan 3: SSL/TLS
  const sslData =
    sslRes.status === 'fulfilled'
      ? sslRes.value
      : {
          indicators: [],
          status: 'failed' as const,
          note: 'Inspeksi koneksi SSL/TLS gagal dijalankan.',
        };
  rawIndicators.push(...sslData.indicators);

  // Lapisan 4: Safe Web Page Crawling & DOM Heuristics
  const crawl: CrawlResult =
    crawlRes.status === 'fulfilled'
      ? crawlRes.value
      : {
          status: 'failed',
          note: 'Perayapan konten halaman gagal dijalankan.',
          extractedText: '',
          hasPasswordInput: false,
          hasSensitiveFinancialInput: false,
          hasApkDownloadLink: false,
          isDirectApkDownload: false,
          detectedForms: [],
          externalFormTargets: [],
          apkLinks: [],
        };

  if (crawl.status === 'completed') {
    const crawlerIndicators = scanCrawlHeuristics(parsed, crawl);
    for (const ind of crawlerIndicators) {
      rawIndicators.push(ind);
    }
  }

  // Lapisan 5: AI Semantic Reasoning on Crawled Content
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
  } else if (crawl.extractedText) {
    checks.push({
      name: 'content_ai',
      status: 'partial',
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
