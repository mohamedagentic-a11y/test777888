import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

interface ServiceStatus {
  id: string;
  name: string;
  state: 'Operational' | 'Degraded' | 'Offline' | string;
}

interface ApiResponse {
  success: boolean;
  data: ServiceStatus[];
}

const translations = {
  en: {
    title: 'IT Service Status',
    loading: 'Loading...',
    error: 'Failed to load service status.',
    empty: 'No services found.',
    stateOperational: 'Operational',
    stateDegraded: 'Degraded',
    stateOffline: 'Offline',
  },
  ar: {
    title: 'حالة خدمات تقنية المعلومات',
    loading: 'جاري التحميل...',
    error: 'فشل في تحميل حالة الخدمة.',
    empty: 'لم يتم العثور على خدمات.',
    stateOperational: 'يعمل',
    stateDegraded: 'متدهور',
    stateOffline: 'غير متصل',
  }
};

export const ServiceStatusWidget: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await apiClient.get<ApiResponse>('/v1/services/status');
        if (mounted) {
          if (response.data && response.data.success) {
            setServices(response.data.data || []);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const getStateColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStateLabel = (state: string) => {
    switch (state.toLowerCase()) {
      case 'operational':
        return t.stateOperational;
      case 'degraded':
        return t.stateDegraded;
      case 'offline':
        return t.stateOffline;
      default:
        return state;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.title}</h2>
      
      {loading && (
        <div className="text-sm text-gray-500">{t.loading}</div>
      )}

      {!loading && error && (
        <div className="text-sm text-red-600">{t.error}</div>
      )}

      {!loading && !error && services.length === 0 && (
        <div className="text-sm text-gray-500">{t.empty}</div>
      )}

      {!loading && !error && services.length > 0 && (
        <ul className="space-y-3">
          {services.map((service) => (
            <li key={service.id} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{service.name}</span>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className={`w-3 h-3 rounded-full ${getStateColor(service.state)}`} aria-hidden="true"></span>
                <span className="text-xs text-gray-600 ms-2">{getStateLabel(service.state)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};