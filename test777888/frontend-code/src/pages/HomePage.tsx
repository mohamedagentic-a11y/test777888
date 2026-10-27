import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ServiceStatusWidget } from '../components/ServiceStatusWidget';
import { AnnouncementBanner } from '../components/AnnouncementBanner';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
}

const translations = {
  en: {
    dashboardTitle: 'Dashboard',
    latestNews: 'Latest News',
    noNews: 'No news available at the moment.',
    errorLoadingNews: 'Failed to load news.',
    readMore: 'Read More',
  },
  ar: {
    dashboardTitle: 'لوحة القيادة',
    latestNews: 'أحدث الأخبار',
    noNews: 'لا توجد أخبار متاحة في الوقت الحالي.',
    errorLoadingNews: 'فشل في تحميل الأخبار.',
    readMore: 'اقرأ المزيد',
  }
};

export const HomePage: React.FC = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const t = translations[lang];

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoadingNews(true);
        const response = await axios.get('/api/news');
        if (response.data && response.data.success) {
          setNews(response.data.data.items || []);
        } else {
          setNewsError(true);
        }
      } catch (error) {
        setNewsError(true);
      } finally {
        setLoadingNews(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.dashboardTitle}</h1>
      
      <div className="mb-8">
        <AnnouncementBanner />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.latestNews}</h2>
            
            {loadingNews ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : newsError ? (
              <p className="text-red-500">{t.errorLoadingNews}</p>
            ) : news.length === 0 ? (
              <p className="text-gray-500">{t.noNews}</p>
            ) : (
              <div className="space-y-6">
                {news.map((item) => (
                  <div key={item.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <h3 className="text-lg font-medium text-blue-600 mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-2">{item.summary}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{new Date(item.publishedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
                      <button className="text-blue-500 hover:text-blue-700 font-medium">
                        {t.readMore}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <ServiceStatusWidget />
        </div>
      </div>
    </div>
  );
};