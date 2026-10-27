import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../i18n/LanguageContext';

const translations = {
  en: {
    title: 'Sign In',
    subtitle: 'eStaff Portal',
    button: 'Sign In with Windows',
    loading: 'Signing in...',
    error: 'Authentication failed. Please try again.',
  },
  ar: {
    title: 'تسجيل الدخول',
    subtitle: 'بوابة الموظفين',
    button: 'تسجيل الدخول باستخدام ويندوز',
    loading: 'جاري تسجيل الدخول...',
    error: 'فشلت المصادقة. يرجى المحاولة مرة أخرى.',
  }
};

export const LoginPage: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/v1/auth/login');
      if (response.data?.success) {
        const { token, user } = response.data.data;
        
        // Update global auth state
        useAuthStore.setState({ 
          token, 
          user, 
          isAuthenticated: true 
        });
        
        // Store token for future requests
        localStorage.setItem('auth_token', token);
        
        // Navigate to home
        navigate('/');
      } else {
        setError(t.error);
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            {t.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t.subtitle}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-s-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="mt-8">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
          >
            {isLoading ? t.loading : t.button}
          </button>
        </div>
      </div>
    </div>
  );
};