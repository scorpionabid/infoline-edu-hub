
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import az from '@/locales/az.json';
import ru from '@/locales/ru.json';

interface Language {
  nativeName: string;
  flag: string;
}

export interface LanguageContextProps {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: any) => string;
  i18n: typeof i18next;
  isRtl: boolean;
  availableLanguages: string[];
  currentLanguage: string;
  languages: Record<string, Language>;
  supportedLanguages: string[];
}

const languages: Record<string, Language> = {
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

  const t = useCallback((key: string, options?: any): string => {
    const translated = i18n.t(key, options);
    // Ensure we always return a string
    return typeof translated === 'string' ? translated : key;
  }, [i18n]);

  const isRtl = useMemo(() => i18n.dir() === 'rtl', [i18n]);

  const value = useMemo(() => ({
    language,
    setLanguage: changeLanguage,
    t,
    i18n,
    isRtl,
    availableLanguages,
    currentLanguage: language,
    languages,
    supportedLanguages,
  }), [language, changeLanguage, t, i18n, isRtl]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// For backward compatibility
export const useLanguageSafe = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'az',
      setLanguage: () => {},
      t: (key) => key,
      i18n: i18next,
      isRtl: false,
      availableLanguages: ['az', 'en', 'ru'],
      currentLanguage: 'az',
      languages,
      supportedLanguages,
    };
  }
  return context;
};
