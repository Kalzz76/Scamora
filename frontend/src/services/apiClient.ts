import axios from 'axios';
import { quotaService } from './quotaService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1');

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

