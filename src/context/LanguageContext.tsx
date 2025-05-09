
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
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

// useLanguageSafe provides a fallback when context is not available
export const useLanguageSafe = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Default translation function and values as fallback
    return {
      changeLanguage: (lng: string) => console.warn('LanguageProvider not initialized'),
      t: (key: string) => key, // simply return the key
      language: 'az',
      currentLanguage: 'az',
      supportedLanguages: [
        { code: 'az', name: 'Azərbaycan dili' },
        { code: 'en', name: 'English' },
        { code: 'ru', name: 'Русский' },
        { code: 'tr', name: 'Türkçe' }
      ],
      setLanguage: (lng: string) => console.warn('LanguageProvider not initialized'),
      languages: {
        az: { nativeName: 'Azərbaycan dili', flag: '🇦🇿' },
        en: { nativeName: 'English', flag: '🇬🇧' },
        ru: { nativeName: 'Русский', flag: '🇷🇺' },
        tr: { nativeName: 'Türkçe', flag: '🇹🇷' }
      },
      availableLanguages: ['az', 'en', 'ru', 'tr']
    };
  }
  return context;
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
  // Use the translation hook
  const { t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'az');

  const supportedLanguages = [
    { code: 'az', name: 'Azərbaycan dili' },
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'tr', name: 'Türkçe' }
  ];

  // If no language is selected or not supported, set default language
  useEffect(() => {
    const currentLng = i18n.language;
    const isSupported = supportedLanguages.some(lng => lng.code === currentLng);
    
    if (!currentLng || !isSupported) {
      // Default to Azerbaijani
      i18n.changeLanguage('az');
      setCurrentLanguage('az');
    } else {
      setCurrentLanguage(currentLng);
    }
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
    // Save the language selection to local storage to persist through refreshes
    localStorage.setItem('language', lng);
  };

  // Add setLanguage alias to maintain compatibility with components
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
