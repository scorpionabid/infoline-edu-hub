
import React, { createContext, useContext, useState } from 'react';

export type Language = 'az' | 'en' | 'tr' | 'ru';

export interface LanguageConfig {
  nativeName: string;
  flag: string;
}

export interface LanguageContextType {
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  languages: Record<Language, LanguageConfig>;
  currentLanguage: Language;
  availableLanguages: Language[];
}

const languages: Record<Language, LanguageConfig> = {
  az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
  en: { nativeName: 'English', flag: '🇬🇧' },
  tr: { nativeName: 'Türkçe', flag: '🇹🇷' },
  ru: { nativeName: 'Русский', flag: '🇷🇺' }
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('az');

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    // Burada dil dəyişikliyi ilə əlaqədar əlavə işlər görülə bilər
  };

  const t = (key: string): string => {
    // Tərcümə funksiyası - daha sonra i18n kitabxanası ilə əvəz edilə bilər
    return key;
  };

  const value: LanguageContextType = {
    t,
    setLanguage,
    languages,
    currentLanguage,
    availableLanguages: Object.keys(languages) as Language[]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
