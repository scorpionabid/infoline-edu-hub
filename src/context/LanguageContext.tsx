
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';
import { Language, LanguageInfo } from '@/types/language';

export interface LanguageContextType {
  changeLanguage: (lng: string) => void;
  t: (key: string, options?: any) => string;
  language: string;
  currentLanguage: string;
  supportedLanguages: { code: string; name: string }[];
  setLanguage: (lang: string) => void;
  languages: Record<string, LanguageInfo>;
  availableLanguages: string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// useLanguageSafe əlavə edildi - xətaları qabaqlamaq üçün
export const useLanguageSafe = (): LanguageContextType => {
  return useLanguage();
};

interface LanguageProviderProps {
  children: ReactNode;
}

const languagesInfo: Record<string, LanguageInfo> = {
  az: { nativeName: 'Azərbaycan dili', flag: '🇦🇿' },
  en: { nativeName: 'English', flag: '🇬🇧' },
  ru: { nativeName: 'Русский', flag: '🇷🇺' },
  tr: { nativeName: 'Türkçe', flag: '🇹🇷' }
};

const availableLanguageCodes = ['az', 'en', 'ru', 'tr'];

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'az');

  const supportedLanguages = [
    { code: 'az', name: 'Azərbaycan dili' },
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'tr', name: 'Türkçe' }
  ];

  // Başlanğıcda dil seçilməmişsə və ya dəstəklənmirsə default dil təyin et
  useEffect(() => {
    const currentLng = i18n.language;
    const isSupported = supportedLanguages.some(lng => lng.code === currentLng);
    
    if (!currentLng || !isSupported) {
      // Default azərbaycan dili
      i18n.changeLanguage('az');
      setCurrentLanguage('az');
    } else {
      setCurrentLanguage(currentLng);
    }
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  // setLanguage alias əlavə edirik ki, komponentlər uyğunlaşdırılsın
  const setLanguage = (lng: string) => {
    changeLanguage(lng);
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        changeLanguage, 
        t, 
        currentLanguage,
        language: currentLanguage,
        supportedLanguages,
        setLanguage,
        languages: languagesInfo,
        availableLanguages: availableLanguageCodes
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
