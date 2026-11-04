/**
 * Scamora - API Request & Response Types
 * Aligned with Blueprint section 16
 */

export interface AnalyzeUrlPayload {
  url: string;
  privacy_consent: boolean;
}

export interface AnalyzeChatPayload {
  text: string;
  privacy_consent: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type SimulationMode = 
  | 'normal' 
  | 'reputation_failed' 
  | 'ai_failed' 
  | 'all_failed' 
  | 'pipeline_failed' 
  | 'rate_limited';
