import React from 'react';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { ServiceStatusWidget } from '../components/ServiceStatusWidget';
import { NewsWidget } from '../components/NewsWidget';
import { useLanguage } from '../i18n/LanguageContext';

const translations = {
  en: {
    pageTitle: 'Dashboard',
    welcomeMessage: 'Welcome to the eStaff Portal',
  },
  ar: {
    pageTitle: 'لوحة القيادة',
    welcomeMessage: 'مرحباً بك في بوابة الموظفين',
  }
};

export const HomePage: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t.pageTitle}</h1>
          <p className="mt-2 text-sm text-gray-600">{t.welcomeMessage}</p>
        </header>

        <AnnouncementBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <NewsWidget />
          </div>
          <div className="space-y-6">
            <ServiceStatusWidget />
          </div>
        </div>
      </div>
    </div>
  );
};