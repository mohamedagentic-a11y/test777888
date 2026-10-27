import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
}

const dictionary = {
  en: {
    title: 'Corporate News',
    loading: 'Loading news...',
    error: 'Failed to load news.',
    empty: 'No news available.',
    readMore: 'Read more'
  },
  ar: {
    title: 'أخبار الشركة',
    loading: 'جاري تحميل الأخبار...',
    error: 'فشل في تحميل الأخبار.',
    empty: 'لا توجد أخبار متاحة.',
    readMore: 'اقرأ المزيد'
  }
};

export const NewsWidget: React.FC = () => {
  const { language } = useLanguage();
  const t = dictionary[language as keyof typeof dictionary] || dictionary.en;

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await apiClient.get('/v1/news');
        if (isMounted) {
          setNews(response.data?.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{t.title}</h2>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <p className="text-gray-500">{t.loading}</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <p>{t.error}</p>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>{t.empty}</p>
        </div>
      )}

      {!loading && !error && news.length > 0 && (
        <ul className="space-y-4">
          {news.map((item) => (
            <li key={item.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.summary}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(item.publishedAt).toLocaleDateString(
                    language === 'ar' ? 'ar-SA' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' }
                  )}
                </span>
                <button 
                  type="button"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  onClick={() => {
                    // Navigation to full article would go here
                  }}
                >
                  {t.readMore}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};