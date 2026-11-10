import axios from 'axios';

function resolveAdminApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  const isBrowser = typeof window !== 'undefined';
  const isRemoteDomain = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  if (isRemoteDomain || import.meta.env.PROD) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.endsWith('/admin') ? envUrl : `${envUrl}/admin`;
    }
    return '/api/v1/admin';
  }

  if (envUrl) {
    return envUrl.endsWith('/admin') ? envUrl : `${envUrl}/admin`;
  }

  return 'http://localhost:8000/api/v1/admin';
}

const BASE_URL = resolveAdminApiBaseUrl();

export const adminApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('scamora_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRequest = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');
      if (!isAuthRequest) {
        localStorage.removeItem('scamora_admin_token');
        localStorage.removeItem('scamora_admin_user');
        if (
          typeof window !== 'undefined' &&
          !window.location.hash.includes('/login')
        ) {
          window.location.hash = '#/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
