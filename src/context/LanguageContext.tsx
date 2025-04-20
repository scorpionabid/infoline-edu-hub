
import React, { createContext, useContext, useEffect, useState } from 'react';
import translations from '@/translations';
import { getSavedLanguage, saveLanguage } from '@/utils/languageUtils';
import { Language, LanguageInfo, LanguageContextType } from '@/types/language';

// Default dillər məlumatı
const defaultLanguages: Record<Language, LanguageInfo> = {
  az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
  en: { nativeName: 'English', flag: '🇬🇧' },
  tr: { nativeName: 'Türkçe', flag: '🇹🇷' },
  ru: { nativeName: 'Русский', flag: '🇷🇺' }
};

// Context yaradılır
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getSavedLanguage());

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    saveLanguage(language);
  };

  const translate = (key: string): string => {
    if (!translations[currentLanguage]) {
      console.warn(`Dil tapılmadı: ${currentLanguage}`);
      return key;
    }

    const translation = translations[currentLanguage][key];
    if (!translation) {
      console.warn(`Tərcümə tapılmadı: ${key} (${currentLanguage})`);
      return key;
    }

    return translation;
  };

  const value = {
    t: translate,
    setLanguage: changeLanguage,
    languages: defaultLanguages,
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
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Təhlükəsiz istifadə üçün əlavə bir hook (kontekst mövcud olmasa belə xəta atmaz)
export const useLanguageSafe = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    return {
      t: (key: string) => key,
      setLanguage: () => {},
      languages: defaultLanguages,
      currentLanguage: 'az' as Language
    };
  }
  return context;
};
