import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../api/client';
import i18n from '../i18n';

const translations = {
  en: {
    dismiss: 'Dismiss announcement',
    error: 'Failed to load announcements',
  },
  ar: {
    dismiss: 'إخفاء الإعلان',
    error: 'فشل في تحميل الإعلانات',
  }
};

interface Announcement {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

interface ApiResponse {
  success: boolean;
  data: Announcement[];
}

export const AnnouncementBanner: React.FC = () => {
  const queryClient = useQueryClient();
  const lang = i18n.language as 'en' | 'ar';
  const t = translations[lang] || translations.en;

  const { data, isLoading, isError } = useQuery<Announcement[]>({
    queryKey: ['announcements', 'active'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse>('/announcements/active');
      return response.data.data;
    }
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/announcements/${id}/acknowledge`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
    }
  });

  if (isLoading || isError || !data || data.length === 0) {
    return null;
  }

  const announcement = data[0];

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      case 'info':
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className={`relative px-4 py-3 sm:px-6 lg:px-8 ${getSeverityClasses(announcement.severity)}`}>
      <div className="mx-auto max-w-7xl flex items-center justify-between flex-wrap">
        <div className="w-0 flex-1 flex items-center">
          <p className="font-medium truncate">
            <span className="md:hidden">{announcement.title}</span>
            <span className="hidden md:inline">
              <strong>{announcement.title}:</strong> {announcement.message}
            </span>
          </p>
        </div>
        <div className="order-2 flex-shrink-0 sm:order-3 sm:ms-3">
          <button
            type="button"
            onClick={() => acknowledgeMutation.mutate(announcement.id)}
            className="-me-1 flex p-2 rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white sm:-me-2"
            aria-label={t.dismiss}
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};