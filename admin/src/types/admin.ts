export type RiskLevel = 'high' | 'review' | 'low';
export type ScamType =
  | 'phishing'
  | 'job_scam'
  | 'giveaway_scam'
  | 'impersonation'
  | 'banking_fraud'
  | 'investment_scam'
  | 'apk_malware'
  | 'unknown';

export interface HourlyScanData {
  hour: string;
  scans: number;
  threats: number;
  safe: number;
}

export interface VisitorStats24h {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  liveActiveUsers: number;
  peakHour: string;
  hourlyVisitors: { hour: string; count: number }[];
}

export interface HourlyTokenData {
  hour: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
}

export interface AiTelemetry24h {
  tokensUsed24h: number;
  promptTokens24h: number;
  completionTokens24h: number;
  avgLatencyMs: number;
  currentLatencyMs: number;
  errorCount24h: number;
  errorRatePercent: number;
  operationalStatus: 'optimal' | 'degraded' | 'incident';
  lastIncidentNote: string;
  hourlyTokens24h?: HourlyTokenData[];
}

export interface SystemStats {
  totalScans: number;
  urlScans: number;
  chatScans: number;
  highRiskCount: number;
  reviewCount: number;
  lowRiskCount: number;
  avgLatencyMs: number;
  crawlerSuccessRate: number;
  activeThreatCount: number;
  apiCallsToday: number;
  riskDistribution: {
    high: number;
    review: number;
    low: number;
  };
  scamTypeBreakdown: Record<string, number>;
  hourlyScans24h?: HourlyScanData[];
  aiTelemetry?: AiTelemetry24h;
  visitorStats?: VisitorStats24h;
}

export interface AiConfig {
  activeProvider: 'gemini' | 'anthropic' | 'auto';
  geminiModel: string;
  claudeModel: string;
  geminiKeySet: boolean;
  claudeKeySet: boolean;
  safeBrowsingKeySet: boolean;
  temperature: number;
  maxTokens: number;
  status: 'operational' | 'degraded' | 'offline';
  latencyMs?: number;
  // Credential & ID Token Configuration
  credentialCode?: string;
  idToken?: string;
  geminiApiKey?: string;
  claudeApiKey?: string;
  safeBrowsingApiKey?: string;
  projectId?: string;
}

export interface CrawlerConfig {
  timeoutMs: number;
  maxBytesKb: number;
  userAgent: string;
  ssrfProtection: boolean;
  detectApk: boolean;
  detectForms: boolean;
  allowRedirects: boolean;
}

export interface RiskThresholds {
  highMin: number;
  reviewMin: number;
}

export interface DemoPresetItem {
  id: string;
  type: 'url' | 'chat';
  title: string;
  subtitle: string;
  content: string;
  expectedCategory: RiskLevel;
  expectedScore: number;
  scamType: ScamType;
  tags: string[];
  isActive: boolean;
  updatedAt: string;
}

export interface ScamCategoryItem {
  id: string;
  code: string;
  name: string;
  icon: string;
  description: string;
  riskTier: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  articleCount: number;
  quizCount: number;
}

export interface KnowledgeArticleItem {
  id: string;
  categoryCode: string;
  categoryName: string;
  title: string;
  summary: string;
  targetVictims: string;
  redFlags: string[];
  responseSteps: string[];
  status: 'published' | 'draft' | 'archived';
  views: number;
  updatedAt: string;
}

export interface QuizOptionItem {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionItem {
  id: string;
  categoryCode: string;
  scenario: string;
  question: string;
  options: QuizOptionItem[];
  explanation: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface CommunityPostItem {
  id: string;
  authorPseudonym: string;
  categoryCode: string;
  title: string;
  story: string;
  financialLossEstimate?: string;
  piiScrubbed: boolean;
  status: 'under_review' | 'published' | 'hidden';
  reportCount: number;
  createdAt: string;
}

export interface ModerationReportItem {
  id: string;
  postId: string;
  postTitle: string;
  reporterPseudonym: string;
  reason: 'pii_leak' | 'hate_speech' | 'false_accusation' | 'spam_bot' | 'other';
  status: 'pending' | 'resolved' | 'dismissed';
  notes?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

