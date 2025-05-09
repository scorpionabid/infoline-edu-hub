
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
  i18n: typeof i18next;
  isRtl: boolean;
  availableLanguages: string[];
  currentLanguage: string;
  languages: Record<string, { nativeName: string; flag?: string }>;
  supportedLanguages: string[];
}

const languages: Record<string, { nativeName: string; flag: string }> = {
  az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
  en: { nativeName: 'English', flag: '🇬🇧' },
  ru: { nativeName: 'Русский', flag: '🇷🇺' },
  tr: { nativeName: 'Türkçe', flag: '🇹🇷' }
};

const availableLanguages = ['az', 'en', 'ru', 'tr'];
const supportedLanguages = ['az', 'en', 'ru'];

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

  const value: LanguageContextProps = {
    language,
    setLanguage: changeLanguage,
    t,
    i18n,
    isRtl,
    availableLanguages,
    currentLanguage: language,
    languages,
    supportedLanguages
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
      i18n: i18next,
      isRtl: false,
      availableLanguages: ['az', 'en', 'ru', 'tr'],
      currentLanguage: 'az',
      languages: {
        az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
        en: { nativeName: 'English', flag: '🇬🇧' },
        ru: { nativeName: 'Русский', flag: '🇷🇺' },
        tr: { nativeName: 'Türkçe', flag: '🇹🇷' }
      },
      supportedLanguages: ['az', 'en', 'ru']
    };
  }
}
