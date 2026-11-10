import { apiClient } from './apiClient';
import type { AnalysisResult, DemoPreset } from '../types/analysis';
import type { AnalyzeChatPayload, AnalyzeUrlPayload, ApiSuccessResponse, SimulationMode } from '../types/api';

let currentSimulationMode: SimulationMode = 'none';

export const analysisService = {
  setSimulationMode(mode: SimulationMode) {
    currentSimulationMode = mode;
  },

  getSimulationMode(): SimulationMode {
    return currentSimulationMode;
  },

  async getDemoPresets(): Promise<DemoPreset[]> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<DemoPreset[]>>('/demo-examples');
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
    } catch {}
    return [];
  },

  async analyzeUrl(payload: AnalyzeUrlPayload): Promise<AnalysisResult> {
    const response = await apiClient.post<ApiSuccessResponse<AnalysisResult>>('/analyze/url', payload);
    return response.data.data;
  },

  async analyzeChat(payload: AnalyzeChatPayload): Promise<AnalysisResult> {
    const response = await apiClient.post<ApiSuccessResponse<AnalysisResult>>('/analyze/chat', payload);
    return response.data.data;
  },
};

