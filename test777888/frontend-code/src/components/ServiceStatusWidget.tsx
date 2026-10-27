import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import i18n from '../i18n';

interface ServiceStatus {
  id: string;
  name: string;
  state: 'Online' | 'Offline' | 'Degraded' | 'Maintenance';
  reason?: string;
}

interface ApiResponse {
  success: boolean;
  data: ServiceStatus[];
}

const dictionary = {
  en: {
    title: 'IT Service Status',
    loading: 'Loading service status...',
    error: 'Failed to load service status.',
    empty: 'No services are currently monitored.',
    status_Online: 'Online',
    status_Offline: 'Offline',
    status_Degraded: 'Degraded',
    status_Maintenance: 'Maintenance',
  },
  ar: {
    title: 'حالة خدمات تقنية المعلومات',
    loading: 'جاري تحميل حالة الخدمات...',
    error: 'فشل في تحميل حالة الخدمات.',
    empty: 'لا توجد خدمات مراقبة حالياً.',
    status_Online: 'متصل',
    status_Offline: 'غير متصل',
    status_Degraded: 'متدهور',
    status_Maintenance: 'صيانة',
  }
};

const fetchServiceStatus = async (): Promise<ServiceStatus[]> => {
  const response = await apiClient.get<ApiResponse>('/services/status');
  if (!response.data.success) {
    throw new Error('Failed to fetch service status');
  }
  return response.data.data;
};

export const ServiceStatusWidget: React.FC = () => {
  const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const t = dictionary[currentLang];

  const { data: services, isLoading, isError } = useQuery({
    queryKey: ['serviceStatus'],
    queryFn: fetchServiceStatus,
    refetchInterval: 60000, // Refresh every minute
  });

  const getStatusColor = (state: ServiceStatus['state']) => {
    switch (state) {
      case 'Online': return 'bg-green-100 text-green-800 border-green-200';
      case 'Offline': return 'bg-red-100 text-red-800 border-red-200';
      case 'Degraded': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusDotColor = (state: ServiceStatus['state']) => {
    switch (state) {
      case 'Online': return 'bg-green-500';
      case 'Offline': return 'bg-red-500';
      case 'Degraded': return 'bg-yellow-500';
      case 'Maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
        {t.title}
      </h2>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center items-center h-24 text-gray-500 text-sm">
            {t.loading}
          </div>
        )}

        {isError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {t.error}
          </div>
        )}

        {!isLoading && !isError && services?.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            {t.empty}
          </div>
        )}

        {!isLoading && !isError && services && services.length > 0 && (
          <ul className="space-y-3">
            {services.map((service) => (
              <li key={service.id} className="flex items-start justify-between p-3 rounded-md border border-gray-100 bg-gray-50">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900 text-sm">{service.name}</span>
                  {service.reason && (
                    <span className="text-xs text-gray-500 mt-1">{service.reason}</span>
                  )}
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusColor(service.state)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(service.state)}`}></span>
                  {t[`status_${service.state}` as keyof typeof t] || service.state}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};