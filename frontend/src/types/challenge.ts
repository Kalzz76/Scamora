export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';
export type MessageSender = 'scammer' | 'user' | 'system';

export interface ChallengeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  scenario_count?: number;
}

export interface AttachmentPreview {
  type: 'apk' | 'link' | 'image' | 'document';
  filename: string;
  size?: string;
  url?: string;
  warningNote?: string;
}

export interface DialogueMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp?: string;
  attachment?: AttachmentPreview;
}

export interface DecisionOption {
  id: string;
  label: string;
  description?: string;
  isSafe: boolean;
  scoreImpact: number;
  nextNodeId: string | null;
  consequenceDialogue: DialogueMessage[];
  explanation: string;
  redFlagsIdentified?: string[];
}

export interface DecisionNode {
  id: string;
  prompt: string;
  options: DecisionOption[];
}

export interface RedFlag {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'malware' | 'social_engineering' | 'credential_theft' | 'financial_fraud' | 'urgency_manipulation';
}

export interface ChallengeScenario {
  id: string;
  categoryId: string;
  title: string;
  difficulty: DifficultyLevel;
  characterName: string;
  characterRole: string;
  characterAvatar: string;
  initialDialogue: DialogueMessage[];
  decisionNodes?: Record<string, DecisionNode>;
  redFlags: RedFlag[];
  learningPoints: string[];
  isAiGenerated?: boolean;
}

export interface SessionHistoryItem {
  nodeId: string;
  chosenOptionId: string;
  isSafe: boolean;
  scoreImpact: number;
  chosenLabel: string;
  timestamp: string;
  explanation: string;
}

export interface ChallengeSession {
  id: string;
  userId: string;
  scenarioId: string;
  currentNodeId: string | null;
  status: SessionStatus;
  messages: DialogueMessage[];
  history: SessionHistoryItem[];
  detectedRedFlags: string[];
  totalScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeResult {
  id: string;
  sessionId: string;
  userId: string;
  scenarioId: string;
  scenarioTitle: string;
  difficulty: DifficultyLevel;
  categoryName: string;
  score: number;
  safetyRating: 'Sangat Aman (Cyber Guardian)' | 'Waspada & Baik' | 'Perlu Waspada Ekstra' | 'Rentan Menjadi Korban';
  redFlagsDetected: RedFlag[];
  redFlagsMissed: RedFlag[];
  decisionsSummary: SessionHistoryItem[];
  feedbackSummary: string;
  vulnerabilityAssessment: {
    urgencyResistance: number;
    authorityResistance: number;
    greedResistance: number;
    technicalInspection: number;
    primaryVulnerability?: string;
  };
  recommendations: string[];
  completedAt: string;
}

export interface UserChallengeStatistics {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  guardianBadge: string;
  strongestArea: string;
  weakestArea: string;
}

