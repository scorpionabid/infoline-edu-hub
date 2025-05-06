
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { Language, LanguageInfo } from '@/types/language';

// i18n inisializasiyası - əgər əvvəl inisializasiya olunmayıbsa
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {}, // translations fayldan yüklənəcək
    lng: 'az',
    fallbackLng: 'az',
    interpolation: {
      escapeValue: false,
    },
  });
}

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
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Default tərcümə funksiyası təqdim edirik
    return {
      changeLanguage: (lng: string) => console.warn('LanguageProvider initialized olmayıb'),
      t: (key: string) => key, // sadəcə açarı qaytarırıq
      language: 'az',
      currentLanguage: 'az',
      supportedLanguages: [
        { code: 'az', name: 'Azərbaycan dili' },
        { code: 'en', name: 'English' },
        { code: 'ru', name: 'Русский' },
        { code: 'tr', name: 'Türkçe' }
      ],
      setLanguage: (lng: string) => console.warn('LanguageProvider initialized olmayıb'),
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
  // Tərcümə hook-unu burada çağırırıq
  const { t } = useTranslation();
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
    // Dilin seçimini local storage-də saxlayırıq ki, səhifə yenilənəndə qalsın
    localStorage.setItem('language', lng);
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
