/**
 * Scamora - Digital Scam Detection Platform (MIT-Week 2026)
 * Type definitions for Risk Analysis, Indicators, and Scoring
 */

export type RiskLevel = 'high' | 'review' | 'low';

export type IndicatorSeverity = 'high' | 'medium' | 'low';

export type IndicatorSource = 'url_structure' | 'threat_db' | 'ai' | 'chat_heuristic' | 'reputation';

export type ScamType = 
  | 'job_scam'
  | 'giveaway_scam'
  | 'impersonation'
  | 'phishing'
  | 'banking_fraud'
  | 'investment_scam'
  | 'apk_malware'
  | 'unknown';

export interface Indicator {
  type: string;
  title: string;
  severity: IndicatorSeverity;
  weight: number;
  source: IndicatorSource;
  evidence: string;
  description: string;
}

export type CheckStatusValue = 'completed' | 'partial' | 'failed' | 'skipped';

export interface PipelineCheck {
  name: string;
  status: CheckStatusValue;
  note: string;
}

export type CategoryReason = 
  | 'critical_indicator'
  | 'score'
  | 'inconclusive'
  | 'partial_data';

export interface AnalysisResult {
  analysis_status: 'complete' | 'partial' | 'failed';
  analysis_type: 'url' | 'chat';
  input_sanitized: string;
  risk_level: RiskLevel | null;
  raw_score: number | null;
  risk_score: number | null;
  category_reason: CategoryReason | null;
  scam_type: ScamType | null;
  indicators: Indicator[];
  checks: PipelineCheck[];
  explanation: string | null;
  recommended_actions: string[];
  limitations: string[];
  timestamp: string;
  is_simulation?: boolean;
}

export interface DemoPreset {
  id: string;
  type: 'url' | 'chat';
  title: string;
  subtitle: string;
  content: string;
  expectedCategory: RiskLevel;
  expectedScore: number;
  scamType: ScamType;
  tags: string[];
}

