import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import i18next from 'i18next';

/**
 * API Client Configuration
 * 
 * This module provides a typed Axios instance for communication with the Node.js backend.
 * It handles:
 * 1. Base URL configuration from environment variables.
 * 2. JWT Bearer token injection for authenticated requests.
 * 3. Language header synchronization with i18next.
 * 4. Standardized error handling and response interceptors.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined in the environment configuration.');
}

const translations = {
  en: {
    connectionError: 'Unable to connect to the server. Please check your network.',
    unauthorized: 'Session expired. Please log in again.',
    forbidden: 'You do not have permission to perform this action.',
    serverError: 'An internal server error occurred. Please try again later.',
    unknownError: 'An unexpected error occurred.'
  },
  ar: {
    connectionError: 'تعذر الاتصال بالخادم. يرجى التحقق من الاتصال بالشبكة.',
    unauthorized: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    forbidden: 'ليس لديك صلاحية للقيام بهذا الإجراء.',
    serverError: 'حدث خطأ داخلي في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
    unknownError: 'حدث خطأ غير متوقع.'
  }
};

/**
 * Creates a configured Axios instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Injects the JWT token from localStorage and sets the Accept-Language header
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    const currentLang = i18next.language || 'en';

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['Accept-Language'] = currentLang;
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles global error states such as 401 Unauthorized or 403 Forbidden
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const currentLang = (i18next.language?.startsWith('ar') ? 'ar' : 'en') as 'en' | 'ar';
    const dict = translations[currentLang];

    if (!error.response) {
      // Network error or timeout
      return Promise.reject(new Error(dict.connectionError));
    }

    switch (error.response.status) {
      case 401:
        // Unauthorized: Clear local state and redirect to login if necessary
        // Note: Redirection logic is handled by the Auth provider/Route guards
        localStorage.removeItem('auth_token');
        return Promise.reject(new Error(dict.unauthorized));

      case 403:
        // Forbidden: User lacks AD group permissions
        return Promise.reject(new Error(dict.forbidden));

      case 500:
        return Promise.reject(new Error(dict.serverError));

      default:
        return Promise.reject(
          new Error((error.response.data as any)?.message || dict.unknownError)
        );
    }
  }
);

export default apiClient;