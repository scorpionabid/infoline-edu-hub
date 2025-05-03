
import React, { createContext, useContext, useState, useEffect } from 'react';
import az from '@/translations/az';
import en from '@/translations/en';
import ru from '@/translations/ru';
import tr from '@/translations/tr';

interface TranslationData {
  [key: string]: any;
}

export interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  translations: TranslationData;
}

const translations: Record<string, TranslationData> = {
  az,
  en,
  ru,
  tr
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('az');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    if (translations[lang]) {
      setCurrentLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value = translations[currentLanguage];
    
    for (const k of keys) {
      if (!value[k]) {
        return key; // Tərcümə tapılmadı, açar qaytarılır
      }
      value = value[k];
    }
    
    if (typeof value === 'string') {
      if (params) {
        return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
          return acc.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
        }, value);
      }
      return value;
    }
    
    return key; // Tərcümə string deyil, açar qaytarılır
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t, translations: translations[currentLanguage] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
