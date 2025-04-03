
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
import en from '../translations/en';
import az from '../translations/az';
import ru from '../translations/ru';
import tr from '../translations/tr';

type LanguageType = 'az' | 'en' | 'ru' | 'tr';

type TranslationKeys = keyof typeof az;

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string, params?: Record<string, string>) => string;
  translations: Record<string, string>;
  languageLoaded: boolean; // Yeni əlavə: dilin yüklənib-yüklənmədiyini izləmək üçün
}

const translations = {
  az,
  en,
  ru,
  tr
};

const defaultLanguage: LanguageType = 'az';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageType;
    return savedLanguage || defaultLanguage;
  });
  const [languageLoaded, setLanguageLoaded] = useState(false); // Yeni state

  useEffect(() => {
    // Dil seçimini yaddaşda saxla
    localStorage.setItem('language', language);
    setLanguageLoaded(true); // Dil yükləndikdə state-i yenilə
  }, [language]);

  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    toast.success(`Dil ${lang.toUpperCase()} olaraq dəyişdirildi`);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    try {
      // Nested keys üçün dəstək (məs: "categories.title")
      const keys = key.split('.');
      let value = keys.reduce((obj, k) => obj?.[k], translations[language] as any);

      // Əgər tərcümə tapılmadısa
      if (!value) {
        console.warn(`Translation missing for key: ${key} in ${language}`);
        return key; // Açarın özünü qaytar
      }

      // Parametrlər əsasında tərcüməni format et
      if (params && typeof value === 'string') {
        Object.keys(params).forEach(param => {
          value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param]);
        });
      }

      return value;
    } catch (error) {
      console.error(`Error getting translation for ${key}:`, error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: translations[language], languageLoaded }}>
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
