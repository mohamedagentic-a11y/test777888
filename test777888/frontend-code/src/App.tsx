import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from './store/index';
import Home from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';

/**
 * App Component
 * Root component responsible for routing and layout direction management.
 * Providers (Redux, Router, I18n) are mounted in main.tsx as per contract.
 */
export const App: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';

  // Dictionary for localized UI strings within the root component
  const translations = {
    en: {
      loading: "Loading application...",
      notFound: "Page not found",
      errorBoundary: "A critical system error occurred. Please contact IT support."
    },
    ar: {
      loading: "جاري تحميل التطبيق...",
      notFound: "الصفحة غير موجودة",
      errorBoundary: "حدث خطأ فني حرج. يرجى الاتصال بالدعم الفني."
    }
  };

  const t = translations[currentLanguage as keyof typeof translations];

  /**
   * Effect to synchronize the document direction and language attribute
   * with the active language state.
   */
  useEffect(() => {
    const dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans selection:bg-blue-100">
      <Routes>
        {/* Public / Employee Routes */}
        <Route path="/" element={<Home />} />

        {/* Administrative Routes */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;