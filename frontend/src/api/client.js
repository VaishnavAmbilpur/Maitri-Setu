import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('maitri_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  response => response,
  error => {
    // Only redirect to login if 401 occurs on protected endpoints, not on the login request itself
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('maitri_token');
      localStorage.removeItem('maitri_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getFileUrl = (path) => {
  if (!path || path === '#') return '#';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const envApiUrl = import.meta.env.VITE_API_URL || '';

  if (envApiUrl && envApiUrl.startsWith('http')) {
    const backendHost = envApiUrl.replace(/\/api\/?$/, '');
    return `${backendHost}${cleanPath}`;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:5000${cleanPath}`;
    }
  }

  return cleanPath;
};

export default api;
