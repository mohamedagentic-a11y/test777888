import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {}
      },
      ar: {
        translation: {}
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

// Initialize document attributes based on the starting language
document.documentElement.lang = i18n.language || 'en';
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

export { i18n };
export default i18n;