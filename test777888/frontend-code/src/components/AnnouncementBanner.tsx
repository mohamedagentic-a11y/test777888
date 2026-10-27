import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

interface Announcement {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

const translations = {
  en: {
    dismiss: 'Dismiss',
    errorLoading: 'Failed to load announcements',
  },
  ar: {
    dismiss: 'تجاهل',
    errorLoading: 'فشل في تحميل الإعلانات',
  },
};

export const AnnouncementBanner: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/v1/announcements/active');
        if (response.data && response.data.success) {
          setAnnouncements(response.data.data || []);
        }
      } catch (err) {
        setError(t.errorLoading);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [t.errorLoading]);

  const handleDismiss = async (id: string) => {
    try {
      await apiClient.post(`/api/v1/announcements/${id}/acknowledge`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to dismiss announcement', err);
    }
  };

  if (loading || announcements.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {announcements.map((announcement) => {
        const bgColor =
          announcement.severity === 'critical'
            ? 'bg-red-100 border-red-500 text-red-900'
            : announcement.severity === 'warning'
            ? 'bg-yellow-100 border-yellow-500 text-yellow-900'
            : 'bg-blue-100 border-blue-500 text-blue-900';

        return (
          <div
            key={announcement.id}
            className={`flex items-start justify-between p-4 border-l-4 rounded shadow-sm ${bgColor}`}
            role="alert"
          >
            <div className="flex-1">
              <h3 className="font-bold text-lg">{announcement.title}</h3>
              <p className="mt-1 text-sm">{announcement.message}</p>
            </div>
            <button
              onClick={() => handleDismiss(announcement.id)}
              className="ms-4 px-3 py-1 text-sm font-medium rounded hover:bg-black/10 transition-colors"
              aria-label={t.dismiss}
            >
              {t.dismiss}
            </button>
          </div>
        );
      })}
    </div>
  );
};