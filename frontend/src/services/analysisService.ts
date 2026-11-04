import { apiClient } from './apiClient';
import { MockAnalyzer } from './mockAnalyzer';
import type { AnalysisResult } from '../types/analysis';
import type { AnalyzeChatPayload, AnalyzeUrlPayload, ApiSuccessResponse, SimulationMode } from '../types/api';

const isMockActive = (): boolean => {
  return import.meta.env.VITE_USE_MOCK !== 'false';
};

export const analysisService = {
  setSimulationMode(mode: SimulationMode) {
    MockAnalyzer.currentSimMode = mode;
  },

  getSimulationMode(): SimulationMode {
    return MockAnalyzer.currentSimMode;
  },

  async analyzeUrl(payload: AnalyzeUrlPayload): Promise<AnalysisResult> {
    if (isMockActive()) {
      return MockAnalyzer.analyzeUrl(payload.url);
    }

    try {
      const response = await apiClient.post<ApiSuccessResponse<AnalysisResult>>('/analyze/url', payload);
      return response.data.data;
    } catch (err: any) {
      // Graceful fallback to mock if backend server is unreachable
      if (err.status === 500 || err.status === 0 || err.code === 'ERR_NETWORK') {
        console.warn('Backend Laravel belum aktif atau tidak dapat dijangkau. Beralih ke Mock Engine.');
        return MockAnalyzer.analyzeUrl(payload.url);
      }
      throw err;
    }
  },

  async analyzeChat(payload: AnalyzeChatPayload): Promise<AnalysisResult> {
    if (isMockActive()) {
      return MockAnalyzer.analyzeChat(payload.text);
    }

    try {
      const response = await apiClient.post<ApiSuccessResponse<AnalysisResult>>('/analyze/chat', payload);
      return response.data.data;
    } catch (err: any) {
      if (err.status === 500 || err.status === 0 || err.code === 'ERR_NETWORK') {
        console.warn('Backend Laravel belum aktif atau tidak dapat dijangkau. Beralih ke Mock Engine.');
        return MockAnalyzer.analyzeChat(payload.text);
      }
      throw err;
    }
  },
};

