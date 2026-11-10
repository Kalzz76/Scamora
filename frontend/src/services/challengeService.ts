import { apiClient } from './apiClient';
import type {
  ChallengeCategory,
  ChallengeResult,
  ChallengeScenario,
  ChallengeSession,
  DecisionNode,
  DifficultyLevel,
  UserChallengeStatistics,
} from '../types/challenge';

export function getOrCreateUserId(): string {
  const STORAGE_KEY = 'scamora_guardian_uid';
  let uid = localStorage.getItem(STORAGE_KEY);
  if (!uid) {
    uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, uid);
  }
  return uid;
}

export const challengeService = {
  async getCategories(): Promise<ChallengeCategory[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: ChallengeCategory[] }>('/challenges/categories');
      return res.data.data;
    } catch {
      return [];
    }
  },

  async getScenarios(categoryId?: string, difficulty?: DifficultyLevel): Promise<ChallengeScenario[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: ChallengeScenario[] }>('/challenges/scenarios', {
        params: { category_id: categoryId, difficulty },
      });
      return res.data.data;
    } catch {
      return [];
    }
  },

  async createSession(scenarioId: string): Promise<{
    session: ChallengeSession;
    currentDecisionNode: DecisionNode | null;
  }> {
    const userId = getOrCreateUserId();
    const res = await apiClient.post<{
      success: boolean;
      data: { session: ChallengeSession; currentDecisionNode: DecisionNode | null };
    }>('/challenges/sessions', {
      scenario_id: scenarioId,
      user_id: userId,
    });
    return res.data.data;
  },

  async submitDecision(
    sessionId: string,
    nodeId: string,
    optionId: string,
    flagsIdentified: string[] = []
  ): Promise<{
    session: ChallengeSession;
    result: ChallengeResult | null;
    chosenFeedback: {
      isSafe: boolean;
      explanation: string;
      consequenceMessages: any[];
    };
    nextDecisionNode: DecisionNode | null;
  }> {
    const res = await apiClient.post<{
      success: boolean;
      data: {
        session: ChallengeSession;
        result: ChallengeResult | null;
        chosenFeedback: {
          isSafe: boolean;
          explanation: string;
          consequenceMessages: any[];
        };
        nextDecisionNode: DecisionNode | null;
      };
    }>(`/challenges/sessions/${sessionId}/decisions`, {
      node_id: nodeId,
      option_id: optionId,
      flags_identified: flagsIdentified,
    });
    return res.data.data;
  },

  async getQuizQuestions(difficulty?: string): Promise<any[]> {
    try {
      const res = await apiClient.get<{ success: boolean; data: any[] }>('/challenges/quiz-questions', {
        params: difficulty ? { difficulty } : undefined,
      });
      return res.data?.data || [];
    } catch {
      return [];
    }
  },

  async getSessionResult(sessionId: string): Promise<ChallengeResult | null> {
    try {
      const res = await apiClient.get<{ success: boolean; data: ChallengeResult }>(
        `/challenges/sessions/${sessionId}/result`
      );
      return res.data.data;
    } catch {
      return null;
    }
  },

  async getUserStatistics(): Promise<UserChallengeStatistics> {
    const userId = getOrCreateUserId();
    try {
      const res = await apiClient.get<{ success: boolean; data: UserChallengeStatistics }>(
        `/challenges/statistics`,
        { params: { user_id: userId } }
      );
      return res.data?.data || {
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        guardianBadge: 'Belum Ada Lencana',
        strongestArea: '-',
        weakestArea: '-',
      };
    } catch {
      return {
        totalAttempts: 0,
        completedAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        guardianBadge: 'Belum Ada Lencana',
        strongestArea: '-',
        weakestArea: '-',
      };
    }
  },

  async generateScenario(
    categoryId: string,
    difficulty: DifficultyLevel,
    topicPrompt?: string
  ): Promise<ChallengeScenario> {
    const res = await apiClient.post<{ success: boolean; data: ChallengeScenario }>(
      '/challenges/scenarios/generate',
      {
        category_id: categoryId,
        difficulty,
        topic_prompt: topicPrompt,
      }
    );
    if (res.data?.data) {
      return res.data.data;
    }
    throw new Error('Gagal menghasilkan skenario simulasi');
  },
};

