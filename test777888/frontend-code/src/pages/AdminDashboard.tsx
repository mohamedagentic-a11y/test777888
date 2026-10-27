import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

interface Service {
  id: string;
  name: string;
  status: string;
  reason?: string;
}

const translations = {
  en: {
    title: 'IT Service Status Dashboard',
    loading: 'Loading services...',
    error: 'Failed to load services.',
    updateSuccess: 'Service updated successfully.',
    updateError: 'Failed to update service.',
    serviceName: 'Service Name',
    currentStatus: 'Current Status',
    newStatus: 'New Status',
    reason: 'Reason',
    update: 'Update',
    statusOnline: 'Online',
    statusOffline: 'Offline',
    statusDegraded: 'Degraded',
    noServices: 'No services found.',
    updating: 'Updating...',
  },
  ar: {
    title: 'لوحة معلومات حالة خدمات تقنية المعلومات',
    loading: 'جاري تحميل الخدمات...',
    error: 'فشل في تحميل الخدمات.',
    updateSuccess: 'تم تحديث الخدمة بنجاح.',
    updateError: 'فشل في تحديث الخدمة.',
    serviceName: 'اسم الخدمة',
    currentStatus: 'الحالة الحالية',
    newStatus: 'الحالة الجديدة',
    reason: 'السبب',
    update: 'تحديث',
    statusOnline: 'متصل',
    statusOffline: 'غير متصل',
    statusDegraded: 'متدهور',
    noServices: 'لم يتم العثور على خدمات.',
    updating: 'جاري التحديث...',
  },
};

export const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations] || translations.en;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [editState, setEditState] = useState<{ [key: string]: { status: string; reason: string } }>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/v1/services/status');
      if (response.data && response.data.success) {
        const fetchedServices = response.data.data as Service[];
        setServices(fetchedServices);
        
        const initialEditState: { [key: string]: { status: string; reason: string } } = {};
        fetchedServices.forEach(s => {
          initialEditState[s.id] = { status: s.status, reason: s.reason || '' };
        });
        setEditState(initialEditState);
      } else {
        setError(t.error);
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    const updateData = editState[id];
    if (!updateData) return;

    try {
      setUpdatingId(id);
      setUpdateMessage(null);
      const response = await apiClient.patch(`/v1/services/${id}/status`, {
        state: updateData.status,
        reason: updateData.reason,
      });

      if (response.data && response.data.success) {
        setUpdateMessage({ type: 'success', text: t.updateSuccess });
        setServices(prev => prev.map(s => s.id === id ? { ...s, status: updateData.status, reason: updateData.reason } : s));
      } else {
        setUpdateMessage({ type: 'error', text: t.updateError });
      }
    } catch (err) {
      setUpdateMessage({ type: 'error', text: t.updateError });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEditChange = (id: string, field: 'status' | 'reason', value: string) => {
    setEditState(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600">{t.loading}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{t.title}</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {updateMessage && (
        <div className={`px-4 py-3 rounded mb-6 ${updateMessage.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} border`}>
          {updateMessage.text}
        </div>
      )}

      {services.length === 0 && !error ? (
        <div className="text-gray-500">{t.noServices}</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.serviceName}
                </th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.currentStatus}
                </th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.newStatus}
                </th>
                <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.reason}
                </th>
                <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.update}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.status === 'Online' ? 'bg-green-100 text-green-800' : 
                      service.status === 'Offline' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {service.status === 'Online' ? t.statusOnline : service.status === 'Offline' ? t.statusOffline : t.statusDegraded}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={editState[service.id]?.status || service.status}
                      onChange={(e) => handleEditChange(service.id, 'status', e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="Online">{t.statusOnline}</option>
                      <option value="Degraded">{t.statusDegraded}</option>
                      <option value="Offline">{t.statusOffline}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <input
                      type="text"
                      value={editState[service.id]?.reason || ''}
                      onChange={(e) => handleEditChange(service.id, 'reason', e.target.value)}
                      placeholder={t.reason}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <button
                      onClick={() => handleUpdate(service.id)}
                      disabled={updatingId === service.id}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {updatingId === service.id ? t.updating : t.update}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};