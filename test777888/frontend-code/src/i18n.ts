import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/**
 * Internationalization configuration for the eStaff Portal.
 * Supports English (en) and Arabic (ar).
 * Directionality (LTR/RTL) is handled by the language module 
 * which sets the 'dir' attribute on the document root.
 */

const resources = {
  en: {
    translation: {
      common: {
        appName: 'eStaff Portal',
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Retry',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        search: 'Search...',
        noData: 'No data available',
        actions: 'Actions',
        status: 'Status'
      },
      nav: {
        home: 'Home',
        news: 'Corporate News',
        apps: 'Applications',
        services: 'Service Status',
        admin: 'Administration',
        profile: 'My Profile',
        logout: 'Logout'
      },
      auth: {
        signIn: 'Sign In',
        signingIn: 'Signing in via Windows AD...',
        unauthorized: 'You do not have permission to access this resource.',
        sessionExpired: 'Your session has expired. Please refresh the page.'
      },
      dashboard: {
        welcome: 'Welcome back, {{name}}',
        quickLinks: 'Quick Links',
        announcements: 'Announcements',
        itStatus: 'IT Service Status',
        viewAll: 'View All'
      },
      admin: {
        title: 'Admin Dashboard',
        manageNews: 'Manage News',
        manageServices: 'Manage Services',
        auditLogs: 'Audit Logs',
        settings: 'System Settings'
      }
    }
  },
  ar: {
    translation: {
      common: {
        appName: 'بوابة الموظفين الإلكترونية',
        loading: 'جاري التحميل...',
        error: 'حدث خطأ ما',
        retry: 'إعادة المحاولة',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        search: 'بحث...',
        noData: 'لا توجد بيانات متاحة',
        actions: 'الإجراءات',
        status: 'الحالة'
      },
      nav: {
        home: 'الرئيسية',
        news: 'أخبار الشركة',
        apps: 'التطبيقات',
        services: 'حالة الخدمات',
        admin: 'الإدارة',
        profile: 'ملفي الشخصي',
        logout: 'تسجيل الخروج'
      },
      auth: {
        signIn: 'تسجيل الدخول',
        signingIn: 'جاري تسجيل الدخول عبر Windows AD...',
        unauthorized: 'ليس لديك صلاحية للوصول إلى هذا المورد.',
        sessionExpired: 'انتهت صلاحية الجلسة. يرجى تحديث الصفحة.'
      },
      dashboard: {
        welcome: 'مرحباً بك مجدداً، {{name}}',
        quickLinks: 'روابط سريعة',
        announcements: 'الإعلانات',
        itStatus: 'حالة خدمات تقنية المعلومات',
        viewAll: 'عرض الكل'
      },
      admin: {
        title: 'لوحة التحكم الإدارية',
        manageNews: 'إدارة الأخبار',
        manageServices: 'إدارة الخدمات',
        auditLogs: 'سجلات المراجعة',
        settings: 'إعدادات النظام'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie']
    },
    react: {
      useSuspense: true
    }
  });

// Handle document direction and lang attribute on language change
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

// Initialize direction on load
const initialDir = i18n.language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.dir = initialDir;
document.documentElement.lang = i18n.language;

export default i18n;