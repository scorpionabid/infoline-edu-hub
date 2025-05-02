import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../translations';

export type Language = 'az' | 'en' | 'tr' | 'ru';

export interface LanguageConfig {
  nativeName: string;
  flag: string;
}

export interface Translations {
  [key: string]: string;
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

  useEffect(() => {
    // localStorage-dan dil seçimini yüklə
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && (savedLanguage === 'az' || savedLanguage === 'en' || savedLanguage === 'tr' || savedLanguage === 'ru')) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    // Burada dil dəyişikliyi ilə əlaqədar əlavə işlər görülə bilər
  };

  const t = (key: string): string => {
    // Tərcümə funksiyası
    return translations[currentLanguage][key] || key;
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

// useLanguageSafe - təhlükəsiz dil hook-u
// useLanguage-dən fərqli olaraq, kontekst olmadıqda xəta atmır
export const useLanguageSafe = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Xəta atmaq əvəzinə default dəyərlər qaytarırıq
    return {
      t: (key: string) => key, // Açarı olduğu kimi qaytarırıq
      setLanguage: () => {}, // Boş funksiya
      languages,
      currentLanguage: 'az', // Default dil
      availableLanguages: Object.keys(languages) as Language[]
    };
  }
  return context;
};
