import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? (import.meta.env.VITE_API_BASE_URL.endsWith('/admin')
      ? import.meta.env.VITE_API_BASE_URL
      : `${import.meta.env.VITE_API_BASE_URL}/admin`)
  : (import.meta.env.PROD ? '/api/v1/admin' : 'http://localhost:8000/api/v1/admin');

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
      localStorage.removeItem('scamora_admin_token');
      localStorage.removeItem('scamora_admin_user');
      if (
        typeof window !== 'undefined' &&
        !window.location.hash.includes('/login')
      ) {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);
