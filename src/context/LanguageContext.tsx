
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Language } from '@/types/supabase';

export type TranslationKey = string;

export interface LanguageContextType {
  t: (key: TranslationKey, params?: Record<string, string>) => string;
  setLanguage: (lang: Language) => void;
  currentLanguage: Language;
}

const defaultLanguage: Language = 'az';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Tərcümə datasını burada saxlanılır
const translations: Record<Language, Record<string, string>> = {
  az: {
    // Azərbaycan dilində tərcümələr
    dashboard: 'İdarə paneli',
    categories: 'Kateqoriyalar',
    columns: 'Sütunlar',
    schools: 'Məktəblər',
    language_az: 'Azərbaycan dili',
    language_en: 'İngilis dili',
    language_ru: 'Rus dili',
    language_tr: 'Türk dili',
    // ... digər tərcümələr
  },
  en: {
    // İngilis dilində tərcümələr
    dashboard: 'Dashboard',
    categories: 'Categories',
    columns: 'Columns',
    schools: 'Schools',
    language_az: 'Azerbaijani',
    language_en: 'English',
    language_ru: 'Russian',
    language_tr: 'Turkish',
    // ... digər tərcümələr
  },
  ru: {
    // Rus dilində tərcümələr
    dashboard: 'Панель управления',
    categories: 'Категории',
    columns: 'Столбцы',
    schools: 'Школы',
    language_az: 'Азербайджанский',
    language_en: 'Английский',
    language_ru: 'Русский',
    language_tr: 'Турецкий',
    // ... digər tərcümələr
  },
  tr: {
    // Türk dilində tərcümələr
    dashboard: 'Kontrol paneli',
    categories: 'Kategoriler',
    columns: 'Sütunlar',
    schools: 'Okullar',
    language_az: 'Azerbaycanca',
    language_en: 'İngilizce',
    language_ru: 'Rusça',
    language_tr: 'Türkçe',
    // ... digər tərcümələr
  }
};

export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  const t = useCallback((key: TranslationKey, params?: Record<string, string>): string => {
    const translation = translations[language][key] || key;
    
    if (params) {
      return Object.entries(params).reduce(
        (acc, [key, value]) => acc.replace(`{{${key}}}`, value),
        translation
      );
    }
    
    return translation;
  }, [language]);

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    // Dil seçimini local storage-da saxlayırıq
    localStorage.setItem('language', lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ t, setLanguage: handleSetLanguage, currentLanguage: language }}>
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

// Əlavə bir helper funksiya, xətanı önləmək üçün
export const useLanguageSafe = (): LanguageContextType => {
  try {
    return useLanguage();
  } catch (error) {
    // Default language konteksti qaytarırıq
    return {
      t: (key: TranslationKey) => key,
      setLanguage: () => {},
      currentLanguage: defaultLanguage
    };
  }
};
