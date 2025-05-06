
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Tərcümə faylları
import translationsAz from '@/translations/az';
import translationsEn from '@/translations/en';
import translationsRu from '@/translations/ru';
import translationsTr from '@/translations/tr';

// Yüklənmiş tərcümələr
const resources = {
  az: translationsAz,
  en: translationsEn,
  ru: translationsRu,
  tr: translationsTr,
};

// Lokal yaddaşdan dil parametrini əldə edirik
const savedLanguage = localStorage.getItem('language') || 'az';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'az',
    interpolation: {
      escapeValue: false, // React özü XSS hücumlarını önləyir
    },
    react: {
      useSuspense: false, // useSuspense seçimini söndürürük, belə ki, yükləmə zamanı problemlər olmasın
    },
  });

export default i18n;
