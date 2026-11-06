export type RiskLevel = 'high' | 'review' | 'low';
export type AnalysisType = 'url' | 'chat';
export type SeverityLevel = 'KRITIS' | 'TINGGI' | 'SEDANG' | 'RENDAH';
export type UserRole = 'user' | 'moderator' | 'admin';
export type PostStatus = 'published' | 'hidden' | 'under_review';
export type ReportReason = 'pii_leak' | 'spam' | 'unfounded_accusation' | 'harassment' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
export type ModerationTarget = 'post' | 'comment' | 'user';
export type ModerationAction = 'hide' | 'publish' | 'dismiss_report' | 'ban_user' | 'unban_user';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface AnalysisStatItem {
  id: string;
  analysis_type: AnalysisType;
  target_summary: string;
  risk_level: RiskLevel;
  risk_score: number;
  scam_type: string;
  indicators_count: number;
  created_at: string;
}

export interface ScamCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_name: string;
  severity_default: SeverityLevel;
  order_index: number;
  is_active: boolean;
}

export interface KnowledgeArticle {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  severity: SeverityLevel;
  target_victim: string;
  channel: string;
  summary: string;
  tactics: string[];
  prevention: string[];
  diagram_type?: string;
  link_type: 'chat' | 'url' | 'panduan';
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  explanation_reason: string;
}

export interface ChallengeQuestion {
  id: string;
  category_id: string;
  scenario: string;
  question: string;
  difficulty: QuizDifficulty;
  order_index: number;
  is_active: boolean;
  options: QuizOption[];
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  author_pseudonym: string;
  category_name: string;
  title: string;
  chronology: string;
  red_flags: string;
  lessons_learned: string;
  status: PostStatus;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface PostReport {
  id: string;
  post_id: string;
  post_title: string;
  reporter_name: string;
  report_reason: ReportReason;
  details: string;
  status: ReportStatus;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface ModerationLog {
  id: string;
  moderator_id: string;
  moderator_name: string;
  target_type: ModerationTarget;
  target_id: string;
  target_name: string;
  action: ModerationAction;
  reason: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  pseudonym: string;
  role: UserRole;
  is_banned: boolean;
  avatar_url?: string;
  created_at: string;
  last_login?: string;
}

export interface DemoPresetItem {
  id: string;
  type: AnalysisType;
  title: string;
  subtitle: string;
  content: string;
  expectedCategory: RiskLevel;
  expectedScore: number;
  scamType: string;
  tags: string[];
  isActive: boolean;
}

export interface SystemConfig {
  ai_provider: 'gemini' | 'claude' | 'mock';
  high_risk_threshold: number;
  review_risk_threshold: number;
  zero_retention_enforced: boolean;
  heuristic_weight: number;
  pattern_weight: number;
  ai_weight: number;
  safe_browsing_enabled: boolean;
  max_text_length: number;
}
