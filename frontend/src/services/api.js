import axios from 'axios';

// Base API URL configuration
export const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Production-ready Axios instance for AquaTrack API requests.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
 * Response Interceptor: Clean Error Handling
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
