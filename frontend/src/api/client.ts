import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'store_access_token';

export const apiClient = axios.create({
  baseURL: '/api',
});

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Access tokens are short-lived (15 min); a 7-day refreshToken cookie scoped
// to /api/auth/refresh lets us mint a new one without re-login. Share one
// in-flight refresh across concurrent 401s.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  refreshPromise ??= axios
    .post<{ token: string }>('/api/auth/refresh')
    .then(({ data }) => {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      return data.token;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRoute && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        const token = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch {
        // fall through to logout below
      }
    }
    if (error.response?.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);
