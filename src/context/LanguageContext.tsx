
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import az from '@/locales/az.json';
import ru from '@/locales/ru.json';

interface LanguageContextProps {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: any) => string;
  i18n: i18next.i18n;
  isRtl: boolean;
  availableLanguages: { code: string; name: string }[];
  currentLanguage: { code: string; name: string };
}

const availableLanguages = [
  { code: 'az', name: 'Azərbaycan' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' }
];

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('i18nextLng') || 'az');

  const i18n = useMemo(() => {
    const instance = i18next.createInstance();
    instance
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          az: { translation: az },
          ru: { translation: ru },
        },
        lng: language,
        fallbackLng: 'az',
        interpolation: {
          escapeValue: false,
        },
      });
    return instance;
  }, [language]);

  const changeLanguage = useCallback((lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  }, [i18n]);

  const t = useCallback((key: string, options?: any) => {
    return i18n.t(key, options) || key;
  }, [i18n]);

  const isRtl = useMemo(() => i18n.dir() === 'rtl', [i18n]);

  const currentLanguage = useMemo(() => {
    return availableLanguages.find(lang => lang.code === language) || availableLanguages[0];
  }, [language]);

  const value: LanguageContextProps = {
    language,
    setLanguage: changeLanguage,
    t,
    i18n,
    isRtl,
    availableLanguages,
    currentLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export function useLanguageSafe() {
  try {
    // Try to use the language context
    return useLanguage();
  } catch (error) {
    // Fallback if used outside a provider
    return {
      language: 'az',
      setLanguage: () => {},
      t: (key: string) => key,
      i18n: i18next.createInstance(),
      isRtl: false,
      availableLanguages: [
        { code: 'az', name: 'Azərbaycan' },
        { code: 'en', name: 'English' },
        { code: 'ru', name: 'Русский' }
      ],
      currentLanguage: { code: 'az', name: 'Azərbaycan' }
    };
  }
}
