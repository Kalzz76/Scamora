import type {
  AiConfig,
  AuditLogItem,
  CommunityPostItem,
  CrawlerConfig,
  DemoPresetItem,
  KnowledgeArticleItem,
  ModerationReportItem,
  QuizQuestionItem,
  RiskThresholds,
  ScamCategoryItem,
  SystemStats,
} from '../types/admin';

export const INITIAL_STATS: SystemStats = {
  totalScans: 0,
  urlScans: 0,
  chatScans: 0,
  highRiskCount: 0,
  reviewCount: 0,
  lowRiskCount: 0,
  avgLatencyMs: 650,
  crawlerSuccessRate: 100,
  activeThreatCount: 0,
  apiCallsToday: 0,
  riskDistribution: {
    high: 0,
    review: 0,
    low: 0,
  },
  scamTypeBreakdown: {},
  hourlyScans24h: Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    scans: 0,
    threats: 0,
    safe: 0,
  })),
  aiTelemetry: {
    tokensUsed24h: 0,
    promptTokens24h: 0,
    completionTokens24h: 0,
    avgLatencyMs: 650,
    currentLatencyMs: 650,
    errorCount24h: 0,
    errorRatePercent: 0.0,
    operationalStatus: 'optimal',
    lastIncidentNote: 'Sistem siap dan beroperasi normal.',
  },
  visitorStats: {
    totalVisitors: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    liveActiveUsers: 0,
    peakHour: '-',
    hourlyVisitors: [],
  },
};

export const INITIAL_AI_CONFIG: AiConfig = {
  activeProvider: 'gemini',
  geminiModel: 'gemini-3.5-flash-lite',
  claudeModel: 'claude-3-5-haiku-20241022',
  geminiKeySet: true,
  claudeKeySet: false,
  safeBrowsingKeySet: false,
  temperature: 0.1,
  maxTokens: 1024,
  status: 'operational',
  latencyMs: 720,
  credentialCode: 'SCAMORA-SEC-CRED-9942',
  idToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImF1dGgta2V5LTIwMjYifQ.eyJzdWIiOiJzY2Ftb3JhLWFkbWluIiwicm9sZSI6ImFkbWluIiwiYXVkIjoic2NhbW9yYS1haS1lbmdpbmUiLCJpYXQiOjE3OTQwNjg4MDB9.dGVzdF9zaWduYXR1cmVfaWQtdG9rZW4',
  geminiApiKey: '',
  claudeApiKey: '',
  safeBrowsingApiKey: '',
  projectId: 'scamora-cyber-defense-prod',
};

export const INITIAL_CRAWLER_CONFIG: CrawlerConfig = {
  timeoutMs: 6000,
  maxBytesKb: 256,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ScamoraCrawler/2.0 (+https://scamora.ai)',
  ssrfProtection: true,
  detectApk: true,
  detectForms: true,
  allowRedirects: true,
};

export const INITIAL_THRESHOLDS: RiskThresholds = {
  highMin: 60,
  reviewMin: 30,
};

export const INITIAL_PRESETS: DemoPresetItem[] = [];
export const INITIAL_CATEGORIES: ScamCategoryItem[] = [];
export const INITIAL_ARTICLES: KnowledgeArticleItem[] = [];
export const INITIAL_QUESTIONS: QuizQuestionItem[] = [];
export const INITIAL_COMMUNITY_POSTS: CommunityPostItem[] = [];
export const INITIAL_REPORTS: ModerationReportItem[] = [];
export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [];

