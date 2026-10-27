import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import i18n from '../i18n';

const translations = {
  en: {
    title: 'Admin Dashboard',
    serviceStatus: 'Service Status',
    publishNews: 'Publish News',
    newsTitle: 'Title',
    newsContent: 'Content',
    newsCategory: 'Category',
    publish: 'Publish',
    updateStatus: 'Update Status',
    statusOnline: 'Online',
    statusOffline: 'Offline',
    reason: 'Reason',
    success: 'Action completed successfully',
    error: 'An error occurred',
    loading: 'Loading...',
    noServices: 'No services found',
  },
  ar: {
    title: 'لوحة تحكم الإدارة',
    serviceStatus: 'حالة الخدمة',
    publishNews: 'نشر الأخبار',
    newsTitle: 'العنوان',
    newsContent: 'المحتوى',
    newsCategory: 'الفئة',
    publish: 'نشر',
    updateStatus: 'تحديث الحالة',
    statusOnline: 'متصل',
    statusOffline: 'غير متصل',
    reason: 'السبب',
    success: 'تمت العملية بنجاح',
    error: 'حدث خطأ',
    loading: 'جاري التحميل...',
    noServices: 'لم يتم العثور على خدمات',
  },
};

interface Service {
  id: string;
  name: string;
  state: string;
  reason?: string;
}

export const AdminDashboardPage: React.FC = () => {
  const lang = (i18n.language || 'en').startsWith('ar') ? 'ar' : 'en';
  const t = translations[lang];
  const queryClient = useQueryClient();

  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCategory, setNewsCategory] = useState('');
  const [newsMessage, setNewsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [serviceUpdates, setServiceUpdates] = useState<Record<string, { state: string; reason: string }>>({});
  const [serviceMessage, setServiceMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['servicesStatus'],
    queryFn: async () => {
      const response = await apiClient.get('/services/status');
      return response.data.data as Service[];
    },
  });

  const publishNewsMutation = useMutation({
    mutationFn: async (newsData: { title: string; content: string; category: string }) => {
      await apiClient.post('/news', newsData);
    },
    onSuccess: () => {
      setNewsMessage({ type: 'success', text: t.success });
      setNewsTitle('');
      setNewsContent('');
      setNewsCategory('');
    },
    onError: () => {
      setNewsMessage({ type: 'error', text: t.error });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, state, reason }: { id: string; state: string; reason: string }) => {
      await apiClient.patch(`/services/${id}/status`, { state, reason });
    },
    onSuccess: () => {
      setServiceMessage({ type: 'success', text: t.success });
      queryClient.invalidateQueries({ queryKey: ['servicesStatus'] });
    },
    onError: () => {
      setServiceMessage({ type: 'error', text: t.error });
    },
  });

  const handlePublishNews = (e: React.FormEvent) => {
    e.preventDefault();
    publishNewsMutation.mutate({ title: newsTitle, content: newsContent, category: newsCategory });
  };

  const handleUpdateService = (id: string) => {
    const update = serviceUpdates[id];
    if (update) {
      updateServiceMutation.mutate({ id, state: update.state, reason: update.reason });
    }
  };

  const handleServiceChange = (id: string, field: 'state' | 'reason', value: string) => {
    setServiceUpdates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Publish News Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{t.publishNews}</h2>
          {newsMessage && (
            <div className={`p-4 mb-4 rounded ${newsMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {newsMessage.text}
            </div>
          )}
          <form onSubmit={handlePublishNews} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.newsTitle}</label>
              <input
                type="text"
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.newsCategory}</label>
              <input
                type="text"
                value={newsCategory}
                onChange={(e) => setNewsCategory(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.newsContent}</label>
              <textarea
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                required
                rows={5}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={publishNewsMutation.isPending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {publishNewsMutation.isPending ? t.loading : t.publish}
            </button>
          </form>
        </section>

        {/* Service Status Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{t.serviceStatus}</h2>
          {serviceMessage && (
            <div className={`p-4 mb-4 rounded ${serviceMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {serviceMessage.text}
            </div>
          )}
          
          {servicesLoading ? (
            <p className="text-gray-500">{t.loading}</p>
          ) : !servicesData || servicesData.length === 0 ? (
            <p className="text-gray-500">{t.noServices}</p>
          ) : (
            <div className="space-y-6">
              {servicesData.map((service) => (
                <div key={service.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{service.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${service.state === 'Online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {service.state === 'Online' ? t.statusOnline : t.statusOffline}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={serviceUpdates[service.id]?.state || service.state}
                      onChange={(e) => handleServiceChange(service.id, 'state', e.target.value)}
                      className="border border-gray-300 rounded-md p-2 text-sm flex-1"
                    >
                      <option value="Online">{t.statusOnline}</option>
                      <option value="Offline">{t.statusOffline}</option>
                    </select>
                    <input
                      type="text"
                      placeholder={t.reason}
                      value={serviceUpdates[service.id]?.reason || service.reason || ''}
                      onChange={(e) => handleServiceChange(service.id, 'reason', e.target.value)}
                      className="border border-gray-300 rounded-md p-2 text-sm flex-1"
                    />
                    <button
                      onClick={() => handleUpdateService(service.id)}
                      disabled={!serviceUpdates[service.id] || updateServiceMutation.isPending}
                      className="bg-gray-800 text-white py-2 px-4 rounded-md text-sm hover:bg-gray-900 disabled:opacity-50 whitespace-nowrap"
                    >
                      {t.updateStatus}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};