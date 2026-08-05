import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let refreshRequest: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (error.response?.status !== 401 || request?._retried || request?.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    request._retried = true;
    refreshRequest ||= api.post('/auth/refresh').then(() => undefined).finally(() => { refreshRequest = null; });

    try {
      await refreshRequest;
      return api(request);
    } catch {
      const loginPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/phone-login'];
      if (!loginPaths.some(p => window.location.pathname.startsWith(p))) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  },
);

export default api;
