
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language resources
const resources = {
  en: {
    translation: {
      welcome: 'Welcome to InfoLine',
      login: 'Login',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      // Add more translations as needed
    },
  },
  az: {
    translation: {
      welcome: 'InfoLine-a xoş gəlmisiniz',
      login: 'Daxil ol',
      logout: 'Çıxış',
      email: 'E-poçt',
      password: 'Şifrə',
      submit: 'Təsdiq et',
      cancel: 'Ləğv et',
      save: 'Saxla',
      edit: 'Düzəliş et',
      delete: 'Sil',
      // Add more translations as needed
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'az', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
