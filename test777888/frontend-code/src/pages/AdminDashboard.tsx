import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/client';

interface ServiceStatus {
  id: string;
  nameEn: string;
  nameAr: string;
  status: 'operational' | 'degraded' | 'outage';
  updatedAt: string;
}

interface NewsItem {
  id: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  published: boolean;
  createdAt: string;
}

const translations = {
  en: {
    title: 'Administrative Dashboard',
    serviceStatus: 'Service Status Management',
    newsManagement: 'News Management',
    serviceName: 'Service Name',
    status: 'Status',
    lastUpdated: 'Last Updated',
    operational: 'Operational',
    degraded: 'Degraded Performance',
    outage: 'Service Outage',
    newsTitle: 'Title',
    date: 'Date',
    visibility: 'Visibility',
    published: 'Published',
    draft: 'Draft',
    actions: 'Actions',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading administrative data...',
    error: 'Failed to load data. Please check your permissions.',
    updateSuccess: 'Update successful',
    updateError: 'Failed to update record'
  },
  ar: {
    title: 'لوحة التحكم الإدارية',
    serviceStatus: 'إدارة حالة الخدمات',
    newsManagement: 'إدارة الأخبار',
    serviceName: 'اسم الخدمة',
    status: 'الحالة',
    lastUpdated: 'آخر تحديث',
    operational: 'يعمل بشكل طبيعي',
    degraded: 'أداء منخفض',
    outage: 'انقطاع الخدمة',
    newsTitle: 'العنوان',
    date: 'التاريخ',
    visibility: 'الظهور',
    published: 'منشور',
    draft: 'مسودة',
    actions: 'الإجراءات',
    edit: 'تعديل',
    save: 'حفظ',
    cancel: 'إلغاء',
    loading: 'جاري تحميل البيانات الإدارية...',
    error: 'فشل تحميل البيانات. يرجى التحقق من الصلاحيات.',
    updateSuccess: 'تم التحديث بنجاح',
    updateError: 'فشل تحديث السجل'
  }
};

export const AdminDashboard: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language === 'ar' ? 'ar' : 'en') as 'en' | 'ar';
  const t = translations[currentLang];

  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, newsRes] = await Promise.all([
          apiClient.get<ServiceStatus[]>('/services/status'),
          apiClient.get<NewsItem[]>('/news/all')
        ]);
        setServices(servicesRes.data);
        setNews(newsRes.data);
        setError(null);
      } catch (err) {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t.error]);

  const handleStatusUpdate = async (id: string, newStatus: ServiceStatus['status']) => {
    try {
      await apiClient.patch(`/services/status/${id}`, { status: newStatus });
      setServices(prev => prev.map(s => s.id === id ? { ...s, status: newStatus, updatedAt: new Date().toISOString() } : s));
      setEditingService(null);
    } catch (err) {
      alert(t.updateError);
    }
  };

  const toggleNewsVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.patch(`/news/${id}`, { published: !currentStatus });
      setNews(prev => prev.map(n => n.id === id ? { ...n, published: !currentStatus } : n));
    } catch (err) {
      alert(t.updateError);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium text-slate-600">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-12" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold text-slate-800">{t.title}</h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">{t.serviceStatus}</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t.serviceName}</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t.status}</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t.lastUpdated}</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {currentLang === 'ar' ? service.nameAr : service.nameEn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {editingService === service.id ? (
                      <select 
                        className="border rounded p-1"
                        defaultValue={service.status}
                        onChange={(e) => handleStatusUpdate(service.id, e.target.value as ServiceStatus['status'])}
                      >
                        <option value="operational">{t.operational}</option>
                        <option value="degraded">{t.degraded}</option>
                        <option value="outage">{t.outage}</option>
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${service.status === 'operational' ? 'bg-green-100 text-green-800' : 
                          service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {t[service.status]}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(service.updatedAt).toLocaleString(currentLang === 'ar' ? 'ar-SA' : 'en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setEditingService(editingService === service.id ? null : service.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {editingService === service.id ? t.cancel : t.edit}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">{t.newsManagement}</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t.newsTitle}</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t.date}</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t.visibility}</th>
                <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 uppercase tracking-wider">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {news.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {currentLang === 'ar' ? item.titleAr : item.titleEn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.published ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                      {item.published ? t.published : t.draft}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => toggleNewsVisibility(item.id, item.published)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {item.published ? t.cancel : t.save}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};