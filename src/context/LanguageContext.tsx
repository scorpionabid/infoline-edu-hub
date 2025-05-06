
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';

export interface LanguageContextType {
  changeLanguage: (lng: string) => void;
  t: (key: string, options?: any) => string;
  language: string; // Kontekstə əlavə edildi
  currentLanguage: string;
  supportedLanguages: { code: string; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

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

  return (
    <LanguageContext.Provider 
      value={{ 
        changeLanguage, 
        t, 
        currentLanguage,
        language: currentLanguage, // language olaraq da təqdim edirik
        supportedLanguages 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
