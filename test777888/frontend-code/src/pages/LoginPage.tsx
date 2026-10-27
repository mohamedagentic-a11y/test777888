import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { apiClient } from '../api/client';
import { authSlice } from '../store/authSlice';
import i18n from '../i18n';

const dict = {
  en: {
    title: 'Sign In',
    button: 'Sign In with Windows',
    loading: 'Signing in...',
    error: 'Failed to sign in. Please try again.'
  },
  ar: {
    title: 'تسجيل الدخول',
    button: 'تسجيل الدخول باستخدام ويندوز',
    loading: 'جاري تسجيل الدخول...',
    error: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.'
  }
};

export const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const t = dict[lang];

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login');
      const { data } = response.data;
      
      dispatch(authSlice.actions.setCredentials({
        user: data.user,
        token: data.token
      }));

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t.title}
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          {error && (
            <div className="text-red-600 text-center text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? t.loading : t.button}
          </button>
        </div>
      </div>
    </div>
  );
};