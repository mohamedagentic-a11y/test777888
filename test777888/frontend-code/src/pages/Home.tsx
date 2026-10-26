import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';

interface NewsItem {
  id: string;
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  publishedAt: string;
}

interface Announcement {
  id: string;
  contentEn: string;
  contentAr: string;
  severity: 'info' | 'warning' | 'critical';
}

interface ServiceStatus {
  id: string;
  nameEn: string;
  nameAr: string;
  status: 'operational' | 'degraded' | 'outage';
}

const translations = {
  en: {
    pageTitle: 'Dashboard',
    newsTitle: 'Latest News',
    announcementsTitle: 'Announcements',
    serviceStatusTitle: 'Service Status',
    viewAllNews: 'View All News',
    operational: 'Operational',
    degraded: 'Degraded Performance',
    outage: 'Service Outage',
    loading: 'Loading dashboard data...',
    error: 'Failed to load dashboard data.',
    noNews: 'No news available.',
    noAnnouncements: 'No active announcements.',
  },
  ar: {
    pageTitle: 'لوحة التحكم',
    newsTitle: 'آخر الأخبار',
    announcementsTitle: 'الإعلانات',
    serviceStatusTitle: 'حالة الخدمة',
    viewAllNews: 'عرض جميع الأخبار',
    operational: 'يعمل بشكل طبيعي',
    degraded: 'أداء منخفض',
    outage: 'انقطاع الخدمة',
    loading: 'جاري تحميل بيانات لوحة التحكم...',
    error: 'فشل في تحميل بيانات لوحة التحكم.',
    noNews: 'لا توجد أخبار متاحة.',
    noAnnouncements: 'لا توجد إعلانات نشطة.',
  }
};

export const Home: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
  const t = translations[currentLang];
  const isRtl = currentLang === 'ar';

  const [news, setNews] = useState<NewsItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [newsRes, announcementsRes, servicesRes] = await Promise.all([
          apiClient.get('/news?limit=3'),
          apiClient.get('/announcements/active'),
          apiClient.get('/services/status')
        ]);
        setNews(newsRes.data);
        setAnnouncements(announcementsRes.data);
        setServices(servicesRes.data);
        setError(null);
      } catch (err) {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t.error]);

  const handleViewAllNews = () => {
    navigate('/news');
  };

  const handleNewsClick = (id: string) => {
    navigate(`/news/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold mb-8 text-slate-900">{t.pageTitle}</h1>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <div className="mb-8 space-y-4">
          {announcements.map((ann) => (
            <div 
              key={ann.id} 
              className={`p-4 rounded-lg border-s-4 ${
                ann.severity === 'critical' ? 'bg-red-50 border-red-500 text-red-800' :
                ann.severity === 'warning' ? 'bg-amber-50 border-amber-500 text-amber-800' :
                'bg-blue-50 border-blue-500 text-blue-800'
              }`}
            >
              <p className="font-medium">{currentLang === 'ar' ? ann.contentAr : ann.contentEn}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* News Section */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">{t.newsTitle}</h2>
            <button 
              onClick={handleViewAllNews}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {t.viewAllNews}
            </button>
          </div>
          <div className="space-y-6">
            {news.length === 0 ? (
              <p className="text-slate-500 italic">{t.noNews}</p>
            ) : (
              news.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 transition-all"
                  onClick={() => handleNewsClick(item.id)}
                >
                  <h3 className="text-xl font-bold mb-2">
                    {currentLang === 'ar' ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {currentLang === 'ar' ? item.summaryAr : item.summaryEn}
                  </p>
                  <span className="text-sm text-slate-400">
                    {new Date(item.publishedAt).toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Service Status Section */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">{t.serviceStatusTitle}</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0"
              >
                <span className="font-medium text-slate-700">
                  {currentLang === 'ar' ? service.nameAr : service.nameEn}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${
                    service.status === 'operational' ? 'bg-green-500' :
                    service.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-slate-500">
                    {service.status === 'operational' ? t.operational :
                     service.status === 'degraded' ? t.degraded : t.outage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;