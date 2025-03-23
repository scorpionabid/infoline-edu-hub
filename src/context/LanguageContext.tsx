
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Language, LanguageInfo, LanguageContextType } from '@/types/language';
import { translate, getSavedLanguage, saveLanguage } from '@/utils/languageUtils';

// Export the language options
export const languageOptions: Record<Language, LanguageInfo> = {
  az: { nativeName: 'Azərbaycan', flag: '🇦🇿' },
  en: { nativeName: 'English', flag: '🇬🇧' },
  ru: { nativeName: 'Русский', flag: '🇷🇺' },
  tr: { nativeName: 'Türkçe', flag: '🇹🇷' }
};

// Context-i yaradırıq
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider komponenti
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getSavedLanguage());

  // Dil dəyişdikdə onu lokal yaddaşda saxlayırıq
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  }, []);

  // Tərcümə funksiyası
  const t = useCallback((key: string) => {
    return translate(key, language);
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    languages: languageOptions
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Context-i istifadə etmək üçün hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
