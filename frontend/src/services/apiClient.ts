import axios from 'axios';
import { quotaService } from './quotaService';

function resolveApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  const isBrowser = typeof window !== 'undefined';
  const isRemoteDomain = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  // Jika aplikasi diakses dari Vercel/domain publik, jangan pernah tembak ke localhost
  if (isRemoteDomain) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    return '/api/v1';
  }

  // Jika build production (PROD), jangan biarkan tembak localhost
  if (import.meta.env.PROD) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    return '/api/v1';
  }

  return envUrl || 'http://localhost:8000/api/v1';
}

const BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 45000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('scamora_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    config.headers['x-guest-session-id'] = quotaService.getGuestSessionId();
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardized Error Parsing
    const customError = {
      status: error.response?.status || 500,
      code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
      message: error.response?.data?.error?.message || error.message || 'Terjadi kesalahan sistem.',
      details: error.response?.data?.error?.details,
    };
    return Promise.reject(customError);
  }
);

