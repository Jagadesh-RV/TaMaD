import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
      return Promise.reject(error);
    }
  },
);

export default api;
