import axios from 'axios';

// Base API URL configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Production-ready Axios instance for AquaTrack API requests.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 35000,
});

/**
 * Request Interceptor: Automatically attach JWT Bearer Token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Automatic Retry on Cold Starts & Clean Error Handling
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Auto-retry once for GET requests that encounter cold-start timeouts, network glitches, or 502/503/504
    const isTimeoutOrNetworkError =
      error.code === 'ECONNABORTED' ||
      (error.message && error.message.toLowerCase().includes('timeout')) ||
      !error.response ||
      [502, 503, 504].includes(error.response?.status);

    if (config && config.method?.toUpperCase() === 'GET' && isTimeoutOrNetworkError && !config._retry) {
      config._retry = true;
      // Wait 1.5 seconds before automatic retry while server warms up
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return api(config);
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.data = error.response?.data;

    return Promise.reject(customError);
  }
);

export default api;